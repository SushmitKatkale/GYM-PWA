import React, { useState, useEffect } from 'react';
import {
  Calendar, Clock, MapPin, CreditCard, AlertCircle,
  CheckCircle, XCircle, RefreshCw, Bell, Star,
  IndianRupee, Zap, Award, TrendingUp, Activity,
  Download, FileText, X, Eye
} from 'lucide-react';
import { buildApiUrl, API_CONFIG } from '../../config/api';
import { useAuthStore } from '../../stores/authStore';
import { invoiceService } from '../../services/invoiceService';

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

export function MySubscriptions() {
  const { user, getAccessToken } = useAuthStore();
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([]);
  const [stats, setStats] = useState<SubscriptionStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [downloadingInvoice, setDownloadingInvoice] = useState<number | null>(null);
  const [invoiceStatus, setInvoiceStatus] = useState<{[key: number]: { hasInvoice: boolean; invoiceId?: number }}>({});
  const [selectedSubscription, setSelectedSubscription] = useState<UserSubscription | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const fetchUserSubscriptions = async () => {
    try {
      const token = getAccessToken();
      if (!token || !user?.email) {
        throw new Error('Authentication required');
      }

      const response = await fetch(buildApiUrl(`/user-subscriptions/user/${user.email}`), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        setSubscriptions(data.data.subscriptions || []);
        
        // Calculate stats
        const totalSpent = data.data.subscriptions.reduce(
          (sum: number, sub: UserSubscription) => sum + sub.payment.paymentAmount, 0
        );
        
        const activeCount = data.data.subscriptions.filter(
          (sub: UserSubscription) => sub.activeStatus && new Date(sub.validTo) > new Date()
        ).length;

        const gymFrequency = data.data.subscriptions.reduce((acc: any, sub: UserSubscription) => {
          const gymName = sub.subscription.gym.name;
          acc[gymName] = (acc[gymName] || 0) + 1;
          return acc;
        }, {});

        const favoriteGym = Object.keys(gymFrequency).reduce((a, b) => 
          gymFrequency[a] > gymFrequency[b] ? a : b, 
          Object.keys(gymFrequency)[0] || 'N/A'
        );

        setStats({
          totalSubscriptions: data.data.subscriptions.length,
          activeSubscriptions: activeCount,
          totalSpent,
          favoriteGym,
          daysActive: data.data.subscriptions.reduce(
            (sum: number, sub: UserSubscription) => sum + sub.subscription.validityDays, 0
          )
        });
      }
    } catch (err) {
      console.error('Failed to fetch user subscriptions:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load subscriptions';
      
      // Handle case when backend API is not available
      if (errorMessage.includes('Route /api/user-subscriptions') || 
          errorMessage.includes('not found') ||
          errorMessage.includes('ECONNREFUSED') ||
          errorMessage.includes('fetch')) {
        setError('🔧 Backend API not available. The subscription data feature requires a backend server to be running on port 8080. Please start the backend server to view your subscription data.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchUserSubscriptions();
  };

  useEffect(() => {
    fetchUserSubscriptions();
  }, []);

  useEffect(() => {
    // Check invoice status for all completed payments
    subscriptions.forEach(subscription => {
      if (subscription.payment.status === 'completed') {
        checkInvoiceStatus(subscription.payment.id);
      }
    });
  }, [subscriptions]);

  const getDaysRemaining = (validTo: string) => {
    const today = new Date();
    const expiry = new Date(validTo);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusColor = (subscription: UserSubscription) => {
    const daysRemaining = getDaysRemaining(subscription.validTo);
    if (!subscription.activeStatus) return 'bg-gray-100 text-gray-600';
    if (daysRemaining <= 0) return 'bg-red-100 text-red-600';
    if (daysRemaining <= 7) return 'bg-yellow-100 text-yellow-600';
    return 'bg-green-100 text-green-600';
  };

  const getStatusText = (subscription: UserSubscription) => {
    const daysRemaining = getDaysRemaining(subscription.validTo);
    if (!subscription.activeStatus) return 'Inactive';
    if (daysRemaining <= 0) return 'Expired';
    if (daysRemaining === 1) return '1 day left';
    if (daysRemaining <= 7) return `${daysRemaining} days left`;
    return 'Active';
  };

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

  const handleDownloadInvoice = async (paymentId: number) => {
    try {
      setDownloadingInvoice(paymentId);
      
      const invoiceInfo = invoiceStatus[paymentId];
      let invoiceId = invoiceInfo?.invoiceId;
      
      // If no invoice exists, generate one
      if (!invoiceInfo?.hasInvoice || !invoiceId) {
        // Find the subscription data for this payment
        const subscription = subscriptions.find(sub => sub.payment.id === paymentId);
        if (!subscription || !user?.email) {
          alert('Unable to generate invoice - missing subscription data');
          return;
        }
        
        // Generate invoice
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
        
        // Update invoice status
        setInvoiceStatus(prev => ({
          ...prev,
          [paymentId]: {
            hasInvoice: true,
            invoiceId: invoiceId
          }
        }));
      }
      
      // Download the PDF
      const blob = await invoiceService.downloadInvoicePDF(invoiceId);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${invoiceId}.pdf`;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
      
      // Mark as downloaded
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

  const closeDetailsModal = () => {
    setSelectedSubscription(null);
    setShowDetailsModal(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
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
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">My Subscriptions</h1>
          <p className="text-sm md:text-base text-gray-600 mt-1">Manage your gym memberships and track your fitness journey</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex-shrink-0 p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 transition-colors rounded-lg hover:bg-gray-100"
          aria-label="Refresh subscriptions"
        >
          <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 md:p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="bg-blue-500 p-1.5 rounded-lg md:p-2">
                <Activity className="w-4 h-4 text-white md:w-5 md:h-5" />
              </div>
              <TrendingUp className="w-3 h-3 text-green-500 md:w-4 md:h-4" />
            </div>
            <p className="text-xs font-medium text-gray-600 uppercase leading-tight">Total</p>
            <p className="text-xl font-bold text-gray-900 md:text-2xl">{stats.totalSubscriptions}</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 md:p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="bg-green-500 p-1.5 rounded-lg md:p-2">
                <CheckCircle className="w-4 h-4 text-white md:w-5 md:h-5" />
              </div>
              <TrendingUp className="w-3 h-3 text-green-500 md:w-4 md:h-4" />
            </div>
            <p className="text-xs font-medium text-gray-600 uppercase leading-tight">Active</p>
            <p className="text-xl font-bold text-gray-900 md:text-2xl">{stats.activeSubscriptions}</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 md:p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="bg-purple-500 p-1.5 rounded-lg md:p-2">
                <IndianRupee className="w-4 h-4 text-white md:w-5 md:h-5" />
              </div>
              <TrendingUp className="w-3 h-3 text-green-500 md:w-4 md:h-4" />
            </div>
            <p className="text-xs font-medium text-gray-600 uppercase leading-tight">Spent</p>
            <p className="text-lg font-bold text-gray-900 md:text-2xl">₹{(stats.totalSpent || 0)}</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 md:p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="bg-yellow-500 p-1.5 rounded-lg md:p-2">
                <Award className="w-4 h-4 text-white md:w-5 md:h-5" />
              </div>
              <Star className="w-3 h-3 text-yellow-500 md:w-4 md:h-4" />
            </div>
            <p className="text-xs font-medium text-gray-600 uppercase leading-tight">Days</p>
            <p className="text-xl font-bold text-gray-900 md:text-2xl">{stats.daysActive}</p>
          </div>
        </div>
      )}

      {/* Subscriptions List */}
      <div className="space-y-4">
        {subscriptions.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Subscriptions Yet</h3>
            <p className="text-gray-500 mb-4">Start your fitness journey by subscribing to a gym</p>
            <button 
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse Gyms
            </button>
          </div>
        ) : (
          subscriptions.map((subscription) => {
            const daysRemaining = getDaysRemaining(subscription.validTo);
            const isExpiring = daysRemaining <= 7 && daysRemaining > 0;
            
            return (
              <div key={subscription.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
                {/* Mobile Layout: Stack vertically */}
                <div className="space-y-4">
                  {/* Header with gym avatar and status */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm md:text-lg">
                        {subscription.subscription.gym.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                          <h3 className="text-base md:text-lg font-semibold text-gray-900 truncate">
                            {subscription.subscription.title}
                          </h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full self-start ${getStatusColor(subscription)}`}>
                            {getStatusText(subscription)}
                          </span>
                        </div>
                        <div className="flex items-center text-gray-600 mb-2">
                          <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span className="text-sm truncate">{subscription.subscription.gym.name}</span>
                          <div className="flex items-center ml-2 md:ml-4">
                            <Star className="w-4 h-4 text-yellow-500 mr-1" />
                            <span className="text-sm">{subscription.subscription.gym.rating}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right ml-2">
                      <p className="text-lg md:text-2xl font-bold text-gray-900">₹{subscription.payment.paymentAmount}</p>
                      <p className="text-xs text-gray-500 capitalize">via {subscription.payment.gateway}</p>
                    </div>
                  </div>

                  {/* Date and duration info */}
                  <div className="flex flex-col sm:flex-row sm:items-center text-sm text-gray-500 gap-2 sm:gap-4">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1 flex-shrink-0" />
                      <span className="text-xs sm:text-sm">
                        {new Date(subscription.validFrom).toLocaleDateString()} - {new Date(subscription.validTo).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1 flex-shrink-0" />
                      <span className="text-xs sm:text-sm">{subscription.subscription.validityDays} days</span>
                    </div>
                  </div>

                {/* Payment Details */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600 mb-1">Payment Status</p>
                      <div className="flex items-center space-x-1">
                        {subscription.payment.status === 'completed' ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : subscription.payment.status === 'failed' ? (
                          <XCircle className="w-4 h-4 text-red-500" />
                        ) : (
                          <Clock className="w-4 h-4 text-yellow-500" />
                        )}
                        <span className="font-medium capitalize">{subscription.payment.status}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-600 mb-1">Payment Method</p>
                      <div className="flex items-center space-x-1">
                        <CreditCard className="w-4 h-4 text-gray-500" />
                        <span className="font-medium capitalize">{subscription.payment.paidVia || 'Card'}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-600 mb-1">Transaction ID</p>
                      <p className="font-medium text-xs">{subscription.payment.transactionId || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 mb-1">Completed At</p>
                      <p className="font-medium">
                        {subscription.payment.completedAt 
                          ? new Date(subscription.payment.completedAt).toLocaleDateString()
                          : 'N/A'
                        }
                      </p>
                    </div>
                  </div>
                </div>

                {/* Expiry Warning */}
                {isExpiring && (
                  <div className="flex items-center justify-between bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <Bell className="w-4 h-4 text-yellow-600" />
                      <span className="text-sm text-yellow-800">
                        Your subscription expires in {daysRemaining} day{daysRemaining !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <button className="text-sm bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700 transition-colors">
                      Renew Now
                    </button>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-4 border-t gap-3">
                  <div className="text-xs sm:text-sm text-gray-500 order-2 sm:order-1">
                    Subscribed on {new Date(subscription.createTimestamp).toLocaleDateString()}
                  </div>
                  <div className="flex flex-wrap gap-2 order-1 sm:order-2">
                    <button 
                      onClick={() => handleViewDetails(subscription)}
                      className="flex items-center text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      View Details
                    </button>
                    
                    {/* Invoice Download Button */}
                    {subscription.payment.status === 'completed' && (
                      <button 
                        onClick={() => handleDownloadInvoice(subscription.payment.id)}
                        disabled={downloadingInvoice === subscription.payment.id}
                        className="flex items-center text-xs sm:text-sm text-gray-600 hover:text-gray-700 font-medium px-2 py-1 rounded hover:bg-gray-50 transition-colors disabled:opacity-50"
                      >
                        {downloadingInvoice === subscription.payment.id ? (
                          <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                        ) : invoiceStatus[subscription.payment.id]?.hasInvoice ? (
                          <Download className="w-3 h-3 mr-1" />
                        ) : (
                          <FileText className="w-3 h-3 mr-1" />
                        )}
                        {downloadingInvoice === subscription.payment.id ? 'Downloading...' : 
                         invoiceStatus[subscription.payment.id]?.hasInvoice ? 'Download Invoice' : 'Generate Invoice'}
                      </button>
                    )}
                    
                    {subscription.activeStatus && daysRemaining > 0 && (
                      <button className="text-xs sm:text-sm bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 transition-colors font-medium">
                        Book Session
                      </button>
                    )}
                  </div>
                </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedSubscription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl transform animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white z-10 rounded-t-2xl sm:rounded-t-2xl">
              {/* Mobile drag indicator */}
              <div className="sm:hidden w-12 h-1.5 bg-white bg-opacity-30 rounded-full mx-auto pt-3 mb-2"></div>
              <div className="flex items-center justify-between p-4 sm:p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <Eye className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-white">Subscription Details</h2>
                </div>
                <button 
                  onClick={closeDetailsModal}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-all duration-200 hover:scale-105"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* Gym Information */}
              <div className="relative bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-2xl p-4 sm:p-6 border border-blue-100 shadow-lg overflow-hidden">
                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-200 to-transparent rounded-full opacity-20 -mr-16 -mt-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-200 to-transparent rounded-full opacity-20 -ml-12 -mb-12"></div>
                
                <div className="relative flex items-start space-x-3 sm:space-x-4">
                  <div className="relative w-14 h-14 sm:w-18 sm:h-18 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white font-bold text-lg sm:text-xl flex-shrink-0 shadow-lg transform hover:scale-105 transition-transform duration-200">
                    <div className="absolute inset-0 bg-white bg-opacity-20 rounded-2xl"></div>
                    <span className="relative z-10">{selectedSubscription.subscription.gym.name.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 truncate">
                      {selectedSubscription.subscription.gym.name}
                    </h3>
                    <div className="flex items-start text-gray-600 mb-3">
                      <div className="p-1 bg-blue-100 rounded-full mr-2 mt-0.5">
                        <MapPin className="w-3 h-3 text-blue-600" />
                      </div>
                      <span className="text-sm leading-tight">{selectedSubscription.subscription.gym.address}, {selectedSubscription.subscription.gym.city}</span>
                    </div>
                    <div className="flex items-center">
                      <div className="flex items-center bg-yellow-50 px-2 py-1 rounded-full">
                        <Star className="w-4 h-4 text-yellow-500 mr-1 fill-current" />
                        <span className="text-sm font-medium text-yellow-700">{selectedSubscription.subscription.gym.rating}</span>
                        <span className="text-xs text-yellow-600 ml-1">/ 5.0</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Subscription Information */}
              <div className="space-y-4 sm:space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <Calendar className="w-3 h-3 text-white" />
                    </div>
                    <h4 className="text-base sm:text-lg font-semibold text-gray-900">Subscription Info</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="group bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200 hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="w-2 h-2 bg-white rounded-full"></span>
                        </div>
                        <p className="text-xs font-medium text-blue-700 uppercase tracking-wide">Plan Name</p>
                      </div>
                      <p className="font-bold text-gray-900 text-sm">{selectedSubscription.subscription.title}</p>
                    </div>
                    
                    <div className="group bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200 hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                          <Clock className="w-3 h-3 text-white" />
                        </div>
                        <p className="text-xs font-medium text-green-700 uppercase tracking-wide">Validity Period</p>
                      </div>
                      <p className="font-bold text-gray-900 text-sm">{selectedSubscription.subscription.validityDays} days</p>
                    </div>
                    
                    <div className="group bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200 hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                          <Calendar className="w-3 h-3 text-white" />
                        </div>
                        <p className="text-xs font-medium text-purple-700 uppercase tracking-wide">Valid From</p>
                      </div>
                      <p className="font-bold text-gray-900 text-sm">
                        {new Date(selectedSubscription.validFrom).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    
                    <div className="group bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl p-4 border border-pink-200 hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-5 h-5 bg-pink-500 rounded-full flex items-center justify-center">
                          <Calendar className="w-3 h-3 text-white" />
                        </div>
                        <p className="text-xs font-medium text-pink-700 uppercase tracking-wide">Valid Until</p>
                      </div>
                      <p className="font-bold text-gray-900 text-sm">
                        {new Date(selectedSubscription.validTo).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                    </div>

                    <div className={`group rounded-xl p-4 border hover:shadow-md transition-all duration-200 hover:scale-[1.02] ${
                      getDaysRemaining(selectedSubscription.validTo) <= 0 ? 'bg-gradient-to-br from-red-50 to-red-100 border-red-200' :
                      getDaysRemaining(selectedSubscription.validTo) <= 7 ? 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200' :
                      'bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200'
                    }`}>
                      <div className="flex items-center space-x-2 mb-2">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                          getDaysRemaining(selectedSubscription.validTo) <= 0 ? 'bg-red-500' :
                          getDaysRemaining(selectedSubscription.validTo) <= 7 ? 'bg-yellow-500' :
                          'bg-emerald-500'
                        }`}>
                          <Clock className="w-3 h-3 text-white" />
                        </div>
                        <p className={`text-xs font-medium uppercase tracking-wide ${
                          getDaysRemaining(selectedSubscription.validTo) <= 0 ? 'text-red-700' :
                          getDaysRemaining(selectedSubscription.validTo) <= 7 ? 'text-yellow-700' :
                          'text-emerald-700'
                        }`}>Days Remaining</p>
                      </div>
                      <p className={`font-bold text-sm ${
                        getDaysRemaining(selectedSubscription.validTo) <= 0 ? 'text-red-600' :
                        getDaysRemaining(selectedSubscription.validTo) <= 7 ? 'text-yellow-600' :
                        'text-emerald-600'
                      }`}>
                        {getDaysRemaining(selectedSubscription.validTo) <= 0 ? '🔴 Expired' :
                         getDaysRemaining(selectedSubscription.validTo) === 1 ? '⚡ 1 day left' :
                         getDaysRemaining(selectedSubscription.validTo) <= 7 ? `⚠️ ${getDaysRemaining(selectedSubscription.validTo)} days left` :
                         `✅ ${getDaysRemaining(selectedSubscription.validTo)} days left`}
                      </p>
                    </div>

                    <div className="group bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-4 border border-indigo-200 hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-3 h-3 text-white" />
                        </div>
                        <p className="text-xs font-medium text-indigo-700 uppercase tracking-wide">Status</p>
                      </div>
                      <span className={`inline-flex items-center px-3 py-1 text-xs font-bold rounded-full shadow-sm ${getStatusColor(selectedSubscription)} border`}>
                        {getStatusText(selectedSubscription)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                      <CreditCard className="w-3 h-3 text-white" />
                    </div>
                    <h4 className="text-base sm:text-lg font-semibold text-gray-900">Payment Details</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="relative bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500 rounded-2xl p-4 sm:col-span-2 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] overflow-hidden">
                      {/* Decorative elements */}
                      <div className="absolute top-0 right-0 w-20 h-20 bg-white bg-opacity-10 rounded-full -mr-10 -mt-10"></div>
                      <div className="absolute bottom-0 left-0 w-16 h-16 bg-white bg-opacity-10 rounded-full -ml-8 -mb-8"></div>
                      
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <IndianRupee className="w-5 h-5 text-white" />
                            <p className="text-xs font-semibold text-white text-opacity-90 uppercase tracking-wide">Amount Paid</p>
                          </div>
                          <div className="px-2 py-1 bg-white bg-opacity-20 rounded-full">
                            <span className="text-xs font-medium">💳 Payment</span>
                          </div>
                        </div>
                        <p className="font-black text-2xl sm:text-3xl text-white drop-shadow-lg">₹{selectedSubscription.payment.paymentAmount.toLocaleString()}</p>
                        <p className="text-xs text-white text-opacity-80 mt-1">Including all taxes and fees</p>
                      </div>
                    </div>
                    
                    <div className={`group rounded-xl p-4 border hover:shadow-lg transition-all duration-200 hover:scale-[1.02] ${
                      selectedSubscription.payment.status === 'completed' ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200' :
                      selectedSubscription.payment.status === 'failed' ? 'bg-gradient-to-br from-red-50 to-red-100 border-red-200' :
                      'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200'
                    }`}>
                      <div className="flex items-center space-x-2 mb-2">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                          selectedSubscription.payment.status === 'completed' ? 'bg-green-500' :
                          selectedSubscription.payment.status === 'failed' ? 'bg-red-500' :
                          'bg-yellow-500'
                        }`}>
                          {selectedSubscription.payment.status === 'completed' ? (
                            <CheckCircle className="w-3 h-3 text-white" />
                          ) : selectedSubscription.payment.status === 'failed' ? (
                            <XCircle className="w-3 h-3 text-white" />
                          ) : (
                            <Clock className="w-3 h-3 text-white" />
                          )}
                        </div>
                        <p className={`text-xs font-medium uppercase tracking-wide ${
                          selectedSubscription.payment.status === 'completed' ? 'text-green-700' :
                          selectedSubscription.payment.status === 'failed' ? 'text-red-700' :
                          'text-yellow-700'
                        }`}>Payment Status</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`font-bold capitalize text-sm ${
                          selectedSubscription.payment.status === 'completed' ? 'text-green-600' :
                          selectedSubscription.payment.status === 'failed' ? 'text-red-600' :
                          'text-yellow-600'
                        }`}>
                          {selectedSubscription.payment.status === 'completed' ? '✅ Completed' :
                           selectedSubscription.payment.status === 'failed' ? '❌ Failed' :
                           '⏳ Pending'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="group bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200 hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="w-2 h-2 bg-white rounded-full"></span>
                        </div>
                        <p className="text-xs font-medium text-blue-700 uppercase tracking-wide">Gateway</p>
                      </div>
                      <p className="font-bold text-gray-900 text-sm capitalize">
                        {selectedSubscription.payment.gateway === 'razorpay' ? '🔷 Razorpay' : '📱 PhonePe'}
                      </p>
                    </div>
                    
                    <div className="group bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-4 border border-purple-200 hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                          <CreditCard className="w-3 h-3 text-white" />
                        </div>
                        <p className="text-xs font-medium text-purple-700 uppercase tracking-wide">Method</p>
                      </div>
                      <p className="font-bold text-gray-900 text-sm capitalize">
                        💳 {selectedSubscription.payment.paidVia || 'Card'}
                      </p>
                    </div>
                    
                    <div className="group bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-4 border border-gray-200 hover:shadow-lg transition-all duration-200 hover:scale-[1.02] sm:col-span-2">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-5 h-5 bg-gray-500 rounded-full flex items-center justify-center">
                          <span className="w-2 h-2 bg-white rounded-full"></span>
                        </div>
                        <p className="text-xs font-medium text-gray-700 uppercase tracking-wide">Transaction ID</p>
                      </div>
                      <p className="font-mono text-xs text-gray-900 break-all bg-gray-100 px-2 py-1 rounded">
                        🔗 {selectedSubscription.payment.transactionId || 'N/A'}
                      </p>
                    </div>
                    
                    <div className="group bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200 hover:shadow-lg transition-all duration-200 hover:scale-[1.02] sm:col-span-2">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
                          <Clock className="w-3 h-3 text-white" />
                        </div>
                        <p className="text-xs font-medium text-amber-700 uppercase tracking-wide">Payment Completed</p>
                      </div>
                      <p className="font-bold text-gray-900 text-sm">
                        {selectedSubscription.payment.completedAt 
                          ? `📅 ${new Date(selectedSubscription.payment.completedAt).toLocaleDateString('en-IN', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}`
                          : '⏳ Not completed'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="bg-gradient-to-r from-slate-50 via-gray-50 to-slate-50 rounded-2xl p-4 border border-gray-200 shadow-inner">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-6 h-6 bg-gradient-to-r from-slate-500 to-gray-600 rounded-full flex items-center justify-center">
                    <span className="w-2 h-2 bg-white rounded-full"></span>
                  </div>
                  <h4 className="text-sm sm:text-base font-semibold text-gray-900">Additional Info</h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                  <div className="bg-white rounded-xl p-3 border border-gray-100 hover:shadow-md transition-all duration-200 text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-start space-x-1 mb-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600 text-xs font-medium uppercase tracking-wide">Subscribed on</span>
                    </div>
                    <span className="font-bold text-sm text-gray-900">
                      📅 {new Date(selectedSubscription.createTimestamp).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="bg-white rounded-xl p-3 border border-gray-100 hover:shadow-md transition-all duration-200 text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-start space-x-1 mb-2">
                      <span className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                      </span>
                      <span className="text-gray-600 text-xs font-medium uppercase tracking-wide">Subscription ID</span>
                    </div>
                    <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded text-gray-900">#{selectedSubscription.id}</span>
                  </div>
                  <div className="bg-white rounded-xl p-3 border border-gray-100 hover:shadow-md transition-all duration-200 text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-start space-x-1 mb-2">
                      <span className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                      </span>
                      <span className="text-gray-600 text-xs font-medium uppercase tracking-wide">Payment ID</span>
                    </div>
                    <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded text-gray-900">#{selectedSubscription.payment.id}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gradient-to-r from-gray-50 to-white border-t border-gray-200 rounded-b-2xl shadow-lg">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 sm:p-6">
                <button 
                  onClick={closeDetailsModal}
                  className="sm:order-1 px-6 py-2 text-gray-600 hover:text-gray-800 font-medium transition-all duration-200 text-center hover:bg-gray-100 rounded-lg"
                >
                  ← Close
                </button>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:order-2">
                  {selectedSubscription.payment.status === 'completed' && (
                    <button 
                      onClick={() => {
                        handleDownloadInvoice(selectedSubscription.payment.id);
                        closeDetailsModal();
                      }}
                      disabled={downloadingInvoice === selectedSubscription.payment.id}
                      className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-slate-600 to-gray-700 text-white rounded-xl hover:from-slate-700 hover:to-gray-800 transition-all duration-200 disabled:opacity-50 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      <span className="text-sm sm:text-base">📄 Download Invoice</span>
                    </button>
                  )}
                  {selectedSubscription.activeStatus && getDaysRemaining(selectedSubscription.validTo) > 0 && (
                    <button className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105">
                      <span className="text-sm sm:text-base">🏋️ Book Session</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
