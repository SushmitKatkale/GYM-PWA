import React, { useState, useEffect } from 'react';
import {
  AlertCircle, RefreshCw, Bell, Star, Activity, TrendingUp, IndianRupee,
  Award, Plus, Search, User, X, Eye, Navigation, FileText, Download
} from 'lucide-react';
import { buildApiUrl, API_CONFIG } from '../../config/api';
import { useAuthStore } from '../../stores/authStore';
import { invoiceService } from '../../services/invoiceService';
import { GymSubscriptionCard } from '../ui/GymSubscriptionCard';

interface UserSubscription {
  id: number;
  subscriptionId: number;
  paymentId: number;
  userEmail: string;
  validFrom: string;
  validTo: string;
  bufferDays: number;
  activeStatus: boolean;
  createTimestamp: string;
  subscription: {
    id: number;
    title: string;
    validityDays: number;
    price: number;
    discountedPrice?: number;
    gym: {
      id: number;
      name: string;
      address: string;
      city: string;
      rating: number;
    };
  };
  payment: {
    id: number;
    paymentAmount: number;
    status: 'pending' | 'completed' | 'failed' | 'cancelled';
    gateway: 'razorpay' | 'phonepe';
    paidVia?: string;
    completedAt?: string;
    transactionId?: string;
  };
  invoiceId?: number;
  hasInvoice?: boolean;
}

interface SubscriptionStats {
  totalSubscriptions: number;
  activeSubscriptions: number;
  totalSpent: number;
  favoriteGym: string;
  daysActive: number;
}

interface ModernMySubscriptionsProps {
  onNavigate?: (view: string) => void;
}

export function ModernMySubscriptions({ onNavigate }: ModernMySubscriptionsProps = {}) {
  const { user, getAccessToken } = useAuthStore();
  
  // Navigation function to handle page changes
  const handleNavigateToDiscover = () => {
    if (onNavigate) {
      onNavigate('discover');
    } else {
      // Fallback: dispatch custom event
      window.dispatchEvent(new CustomEvent('navigate-to-discover'));
    }
  };
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([]);
  const [stats, setStats] = useState<SubscriptionStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [downloadingInvoice, setDownloadingInvoice] = useState<number | null>(null);
  const [invoiceStatus, setInvoiceStatus] = useState<{ [key: number]: { hasInvoice: boolean; invoiceId?: number } }>({});
  const [selectedSubscription, setSelectedSubscription] = useState<UserSubscription | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const fetchUserSubscriptions = async () => {
    try {
      const token = getAccessToken();
      if (!token || !user?.email) {
        throw new Error('Authentication required');
      }

      const response = await fetch(buildApiUrl(`/user-subscriptions/${user.id}`), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      console.log('Fetched subscriptions:', data);

      if (data.success) {
        setSubscriptions(data.data || []);

        // Calculate stats
        const totalSpent = data.data.reduce(
          (sum: number, sub: UserSubscription) => parseFloat(sum) + parseFloat(sub.payment.amount),
          0
        );

        const activeCount = data.data.filter(
          (sub: UserSubscription) => sub.recordStatus && new Date(sub.validTo) >= new Date()
        ).length;

        const gymFrequency = data.data.reduce((acc: any, sub: UserSubscription) => {
          const gymName = sub.subscription.gym.name;
          acc[gymName] = (acc[gymName] || 0) + 1;
          return acc;
        }, {});

        const favoriteGym = Object.keys(gymFrequency).reduce(
          (a, b) => gymFrequency[a] > gymFrequency[b] ? a : b,
          Object.keys(gymFrequency)[0] || 'N/A'
        );

        const daysActive = data.data.reduce(
          (sum: number, sub: UserSubscription) => parseInt(sum) + parseInt(sub.subscription.validityDays),
          0
        );

        setStats({
          totalSubscriptions: data.data.length,
          activeSubscriptions: activeCount,
          totalSpent,
          favoriteGym,
          daysActive
        });
      }
    } catch (err) {
      console.error('Failed to fetch user subscriptions:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load subscriptions';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchUserSubscriptions();
  };

  const handleDownloadInvoice = async (paymentId: number) => {
    try {
      setDownloadingInvoice(paymentId);

      const invoiceInfo = invoiceStatus[paymentId];
      let invoiceId = invoiceInfo?.invoiceId;

      if (!invoiceInfo?.hasInvoice || !invoiceId) {
        const subscription = subscriptions.find(sub => sub.payment.id === paymentId);
        if (!subscription || !user?.email) {
          alert('Unable to generate invoice - missing subscription data');
          return;
        }

        const newInvoice = await invoiceService.generateInvoice({
          paymentId: paymentId,
          userEmail: user.email,
          subscriptionTitle: subscription.subscription.title,
          gymName: subscription.subscription.gym.name,
          amount: subscription.payment.paymentAmount,
          validityDays: subscription.subscription.validityDays,
          validFrom: subscription.validFrom,
          validTo: subscription.validTo,
          paymentMethod: subscription.payment.gateway,
          transactionId: subscription.payment.transactionId || 'N/A'
        });

        invoiceId = newInvoice.id;

        setInvoiceStatus(prev => ({
          ...prev,
          [paymentId]: {
            hasInvoice: true,
            invoiceId: invoiceId
          }
        }));
      }

      const blob = await invoiceService.downloadInvoicePDF(invoiceId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${invoiceId}.pdf`;
      document.body.appendChild(link);
      link.click();

      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);

      await invoiceService.markInvoiceAsDownloaded(invoiceId);

    } catch (err) {
      console.error('Failed to download/generate invoice:', err);
      alert('Failed to download invoice. Please try again.');
    } finally {
      setDownloadingInvoice(null);
    }
  };

  const handleViewDetails = (subscription: UserSubscription) => {
    setSelectedSubscription(subscription);
    setShowDetailsModal(true);
  };

  const handleOpenGoogleMaps = (gym: UserSubscription['subscription']['gym']) => {
    const address = encodeURIComponent(`${gym.address}, ${gym.city}`);
    const gymName = encodeURIComponent(gym.name);
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (isMobile) {
      const mapsUrl = `https://maps.google.com/maps?q=${gymName + address}&t=m`;
      window.open(mapsUrl, '_blank');
    } else {
      const mapsUrl = `https://www.google.com/maps/search/${gymName}+${address}`;
      window.open(mapsUrl, '_blank');
    }
  };

  useEffect(() => {
    fetchUserSubscriptions();
  }, []);

  useEffect(() => {
    subscriptions.forEach(subscription => {
      if (subscription.payment.status === 'completed') {
        checkInvoiceStatus(subscription.payment.id);
      }
    });
  }, [subscriptions]);

  const checkInvoiceStatus = async (paymentId: number) => {
    try {
      if (!user?.email) return;

      const invoices = await invoiceService.getInvoicesByUser(user.email);
      const paymentInvoice = invoices.find((inv: any) => inv.paymentId === paymentId);

      setInvoiceStatus(prev => ({
        ...prev,
        [paymentId]: {
          hasInvoice: !!paymentInvoice,
          invoiceId: paymentInvoice?.id
        }
      }));
    } catch (err) {
      console.error('Failed to check invoice status:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-4 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Subscriptions</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const userName = user?.firstName || 'There';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-4 md:p-6 font-poppins">
      <div className="max-w-6xl mx-auto">
        {/* Stats Cards */}
        {/* {stats && (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="bg-blue-500 p-2 rounded-lg">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <TrendingUp className="w-4 h-4 text-green-500" />
              </div>
              <p className="text-xs font-medium text-gray-600 uppercase">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalSubscriptions}</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="bg-green-500 p-2 rounded-lg">
                  <Star className="w-5 h-5 text-white" />
                </div>
                <TrendingUp className="w-4 h-4 text-green-500" />
              </div>
              <p className="text-xs font-medium text-gray-600 uppercase">Active</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeSubscriptions}</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="bg-purple-500 p-2 rounded-lg">
                  <IndianRupee className="w-5 h-5 text-white" />
                </div>
                <TrendingUp className="w-4 h-4 text-green-500" />
              </div>
              <p className="text-xs font-medium text-gray-600 uppercase">Spent</p>
              <p className="text-lg font-bold text-gray-900">₹{stats.totalSpent}</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="bg-yellow-500 p-2 rounded-lg">
                  <Award className="w-5 h-5 text-white" />
                </div>
                <Star className="w-4 h-4 text-yellow-500" />
              </div>
              <p className="text-xs font-medium text-gray-600 uppercase">Days</p>
              <p className="text-2xl font-bold text-gray-900">{stats.daysActive}</p>
            </div>
          </div>
        )} */}

        <div className="mb-6">
          <h2 className="text-base font-normal text-gray-500">What's app, {userName}!</h2>
          <h1 className="text-xl font-semibold text-gray-900">Manage subscriptions</h1>
        </div>

        {/* Your subscriptions section */}
        <div className="mb-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-lg font-medium text-gray-900">Your subscriptions</h1>
          <button className='text-sm text-gray-700'>
            <span>View All</span>
          </button>
        </div>
          {subscriptions.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Activity className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No subscriptions yet</h3>
              <p className="text-gray-500 mb-4">Start your fitness journey by subscribing to a gym</p>
              <button 
                onClick={handleNavigateToDiscover}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
              >
                Browse Gyms
              </button>
            </div>
          ) : (
            /* Horizontal Carousel */
            <div className="relative">
              <div 
                className="overflow-x-auto scrollbar-hide pb-4"
                style={{ 
                  scrollbarWidth: 'none', 
                  msOverflowStyle: 'none',
                  WebkitScrollbar: { display: 'none' }
                }}
              >
                <div className="flex space-x-6 px-1" style={{ width: 'max-content' }}>
                  {subscriptions.map((subscription, index) => (
                    <div 
                      key={subscription.id} 
                      className="flex-shrink-0 w-80"
                    >
                      <GymSubscriptionCard
                        subscription={subscription}
                        onViewDetails={handleViewDetails}
                        onDownloadInvoice={handleDownloadInvoice}
                        onOpenMaps={handleOpenGoogleMaps}
                        gradientIndex={index*3}
                      />
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Scroll indicator */}
              {subscriptions.length > 1 && (
                <div className="flex justify-center mt-4 space-x-2">
                  {subscriptions.map((_, index) => (
                    <div 
                      key={index}
                      className="w-2 h-2 rounded-full bg-gray-300"
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm">
          <p>Manage all your gym subscriptions in one place</p>
          <p className="mt-1">Never miss a workout again</p>
        </div>
      </div>

      {/* Details Modal - Keep the existing detailed modal from the original component */}
      {showDetailsModal && selectedSubscription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl transform animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white z-10 rounded-t-2xl">
              <div className="sm:hidden w-12 h-1.5 bg-white bg-opacity-30 rounded-full mx-auto pt-3 mb-2"></div>
              <div className="flex items-center justify-between p-4 sm:p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <Eye className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-white">Subscription Details</h2>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-all duration-200"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Modal Content - Simplified for space */}
            <div className="p-4 sm:p-6">
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-4 sm:p-6 border border-blue-100">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl">
                    {selectedSubscription.subscription.gym.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900">{selectedSubscription.subscription.gym.name}</h3>
                    <p className="text-sm text-gray-600">{selectedSubscription.subscription.gym.address}, {selectedSubscription.subscription.gym.city}</p>
                    <div className="flex items-center mt-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current mr-1" />
                      <span className="text-sm font-medium">{selectedSubscription.subscription.gym.rating}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Plan</p>
                    <p className="font-semibold">{selectedSubscription.subscription.title}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Amount</p>
                    <p className="font-semibold">₹{selectedSubscription.payment.paymentAmount}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Valid From</p>
                    <p className="font-semibold">{new Date(selectedSubscription.validFrom).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Valid To</p>
                    <p className="font-semibold">{new Date(selectedSubscription.validTo).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t p-4 sm:p-6 rounded-b-2xl">
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="flex-1 px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors text-center hover:bg-gray-100 rounded-lg"
                >
                  Close
                </button>
                <button
                  onClick={() => handleOpenGoogleMaps(selectedSubscription.subscription.gym)}
                  className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-medium flex items-center justify-center"
                >
                  <Navigation className="w-4 h-4 mr-2" />
                  Open Maps
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
