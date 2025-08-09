import React, { useState, useEffect } from 'react';
import { Box, Search, Plus, Edit, Trash2, DollarSign, Clock, X, MapPin, Star, Award, IndianRupee } from 'lucide-react';
import { buildApiUrl, API_CONFIG } from '../../config/api';
import { useAuthStore } from '../../stores/authStore';
import SuccessModal from '../ui/SuccessModal';
import ErrorModal from '../ui/ErrorModal';
import ConfirmationModal from '../ui/ConfirmationModal';

interface Subscription {
  id: number;
  title: string;
  validityDays: number;
  price: number;
  discountedPrice: number | null;
  gymId: number;
  gymName?: string;
  isMostPopular: boolean;
  isCheapest: boolean;
  activeStatus: boolean;
  createTimestamp: string;
  features: string[];
}

export function SubscriptionManagement() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [filteredSubscriptions, setFilteredSubscriptions] = useState<Subscription[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    validityDays: 0,
    price: 0,
    discountedPrice: 0,
    gymId: 0,
    isMostPopular: false,
    isCheapest: false,
  });

  // Auth store
  const { getAccessToken } = useAuthStore();

  // Modal states
  const [successModal, setSuccessModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    actionLabel?: string;
    onAction?: () => void;
  }>({ isOpen: false, title: '', message: '' });

  const [errorModal, setErrorModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    error?: string;
    showRetry?: boolean;
    onRetry?: () => void;
  }>({ isOpen: false, title: '', message: '' });

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    itemName?: string;
    onConfirm: () => void;
  }>({ isOpen: false, title: '', message: '', onConfirm: () => { } });

  // Fetch subscriptions from API
  const fetchSubscriptions = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.SUBSCRIPTIONS));
      const data = await response.json();
      if (data.success && data.data && data.data.subscriptions) {
        // Process and validate the subscription data
        const processedSubscriptions = data.data.subscriptions.map((sub: any) => ({
          ...sub,
          price: Number(sub.price || 0),
          discountedPrice: sub.discountedPrice ? Number(sub.discountedPrice) : null,
          validityDays: Number(sub.validityDays || 0),
          gymId: Number(sub.gymId || 0),
          gymName: sub.gymName || sub.gym?.name || `Gym #${sub.gymId}`,
          isMostPopular: Boolean(sub.isMostPopular),
          isCheapest: Boolean(sub.isCheapest),
          activeStatus: Boolean(sub.activeStatus),
          features: Array.isArray(sub.features) ?
            sub.features.map((f: any) => typeof f === 'string' ? f : f.title || f.name || 'Feature') : (
              sub.features ? sub.features.split(',').map((f: string) => f.trim()) : [
                'Access to gym equipment',
                'Locker room access',
                'Basic fitness consultation'
              ]
            )
        }));
        setSubscriptions(processedSubscriptions);
        setFilteredSubscriptions(processedSubscriptions);
      } else {
        console.warn('No subscription data found in API response:', data);
        setSubscriptions([]);
        setFilteredSubscriptions([]);
      }
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      setErrorModal({
        isOpen: true,
        title: 'Loading Error',
        message: 'Failed to load subscriptions.',
        error: error instanceof Error ? error.message : 'Unknown error',
        showRetry: true,
        onRetry: fetchSubscriptions
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Search subscriptions
  const searchSubscriptions = async (query: string) => {
    if (!query.trim()) {
      setFilteredSubscriptions(subscriptions);
      return;
    }

    const filtered = subscriptions.filter(subscription =>
      subscription.title.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredSubscriptions(filtered);
  };

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    searchSubscriptions(value);
  };

  // Create subscription
  const createSubscription = async () => {
    setIsLoading(true);
    try {
      const token = getAccessToken();
      if (!token) {
        setErrorModal({
          isOpen: true,
          title: 'Authentication Required',
          message: 'Please log in to create subscriptions.',
          error: 'No authentication token found'
        });
        setIsLoading(false);
        return;
      }

      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.SUBSCRIPTIONS), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (data.success) {
        setSuccessModal({
          isOpen: true,
          title: 'Success!',
          message: 'Subscription created successfully!',
          actionLabel: 'View Subscriptions',
          onAction: () => fetchSubscriptions()
        });
        setShowAddModal(false);
        resetForm();
      } else {
        setErrorModal({
          isOpen: true,
          title: 'Creation Failed',
          message: 'Failed to create subscription.',
          error: data.message,
          showRetry: true,
          onRetry: createSubscription
        });
      }
    } catch (error) {
      console.error('Error creating subscription:', error);
      setErrorModal({
        isOpen: true,
        title: 'Network Error',
        message: 'Failed to create subscription due to network error.',
        error: error instanceof Error ? error.message : 'Unknown error',
        showRetry: true,
        onRetry: createSubscription
      });
    }
    setIsLoading(false);
  };

  // Update subscription
  const updateSubscription = async () => {
    if (!selectedSubscription) return;

    setIsLoading(true);
    try {
      const token = getAccessToken();
      if (!token) {
        setErrorModal({
          isOpen: true,
          title: 'Authentication Required',
          message: 'Please log in to update subscriptions.',
          error: 'No authentication token found'
        });
        setIsLoading(false);
        return;
      }

      const response = await fetch(buildApiUrl(`${API_CONFIG.ENDPOINTS.SUBSCRIPTIONS}/${selectedSubscription.id}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: formData.title,
          validityDays: formData.validityDays,
          price: formData.price,
          discountedPrice: formData.discountedPrice,
          isMostPopular: formData.isMostPopular,
          isCheapest: formData.isCheapest
        })
      });
      const data = await response.json();
      if (data.success) {
        setSuccessModal({
          isOpen: true,
          title: 'Success!',
          message: 'Subscription updated successfully!',
          actionLabel: 'View Subscriptions',
          onAction: () => fetchSubscriptions()
        });
        setShowEditModal(false);
        setSelectedSubscription(null);
        resetForm();
      } else {
        setErrorModal({
          isOpen: true,
          title: 'Update Failed',
          message: 'Failed to update subscription.',
          error: data.message,
          showRetry: true,
          onRetry: updateSubscription
        });
      }
    } catch (error) {
      console.error('Error updating subscription:', error);
      setErrorModal({
        isOpen: true,
        title: 'Network Error',
        message: 'Failed to update subscription due to network error.',
        error: error instanceof Error ? error.message : 'Unknown error',
        showRetry: true,
        onRetry: updateSubscription
      });
    }
    setIsLoading(false);
  };

  // Show delete confirmation
  const showDeleteConfirmation = (subscription: Subscription) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Subscription',
      message: 'Are you sure you want to delete this subscription? This action cannot be undone.',
      itemName: subscription.title,
      onConfirm: () => performDelete(subscription.id)
    });
  };

  // Delete subscription
  const performDelete = async (id: number) => {
    setIsLoading(true);
    try {
      const token = getAccessToken();
      if (!token) {
        setErrorModal({
          isOpen: true,
          title: 'Authentication Required',
          message: 'Please log in to delete subscriptions.',
          error: 'No authentication token found'
        });
        setIsLoading(false);
        return;
      }

      const response = await fetch(buildApiUrl(`${API_CONFIG.ENDPOINTS.SUBSCRIPTIONS}/${id}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setSuccessModal({
          isOpen: true,
          title: 'Subscription Deleted',
          message: 'Subscription has been successfully deleted from the system.',
          actionLabel: 'Refresh List',
          onAction: fetchSubscriptions
        });
      } else {
        setErrorModal({
          isOpen: true,
          title: 'Delete Failed',
          message: 'Failed to delete the subscription.',
          error: data.message,
          showRetry: true,
          onRetry: () => performDelete(id)
        });
      }
    } catch (error) {
      console.error('Error deleting subscription:', error);
      setErrorModal({
        isOpen: true,
        title: 'Network Error',
        message: 'Failed to delete subscription due to network error.',
        error: error instanceof Error ? error.message : 'Unknown error',
        showRetry: true,
        onRetry: () => performDelete(id)
      });
    }
    setIsLoading(false);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      validityDays: 0,
      price: 0,
      discountedPrice: 0,
      gymId: 0,
      isMostPopular: false,
      isCheapest: false,
    });
  };

  // Open edit modal
  const openEditModal = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setFormData({
      title: subscription.title,
      validityDays: subscription.validityDays,
      price: subscription.price,
      discountedPrice: subscription.discountedPrice || 0,
      gymId: subscription.gymId,
      isMostPopular: subscription.isMostPopular,
      isCheapest: subscription.isCheapest,
    });
    setShowEditModal(true);
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subscription Management</h1>
          <p className="text-gray-600">Manage subscriptions for gyms</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Add Subscription</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search subscriptions..."
          value={searchTerm}
          onChange={handleSearch}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Subscription List - Mobile First Design */}
      <div className="space-y-4">
        {filteredSubscriptions.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow border">
            <Box className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No subscriptions found</h3>
            <p className="text-gray-500">
              {searchTerm ? 'Try adjusting your search criteria' : 'Start by adding your first subscription'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
            {filteredSubscriptions.filter((subscription) => subscription.activeStatus).map((subscription) => (
              <div key={subscription.id} className="bg-white rounded-lg shadow border p-4 hover:shadow-md transition-shadow">
                {/* Mobile Layout */}
                <div className="flex items-start justify-between relative">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                        {subscription.title[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {subscription.title}
                          </h3>
                          {subscription.isMostPopular && (
                            <span className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full flex items-center">
                              <Star className="w-3 h-3 mr-1" />
                              Popular
                            </span>
                          )}
                          {subscription.isCheapest && (
                            <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full flex items-center">
                              <Award className="w-3 h-3 mr-1" />
                              Best Value
                            </span>
                          )}
                        </div>
                        <div className="flex items-center text-sm text-gray-500 mb-1">
                          <Clock className="w-4 h-4 mr-2" />
                          <span>{subscription.validityDays} days</span>
                        </div>
                        {subscription.gymName && (
                          <div className="flex items-center text-sm text-blue-600">
                            <MapPin className="w-4 h-4 mr-2" />
                            <span className="font-medium">{subscription.gymName}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Pricing */}
                    <div className="bg-gray-50 rounded-lg p-3 mb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center text-lg font-semibold text-gray-900">
                            <IndianRupee className="w-5 h-5 mr-1" />
                            {subscription.discountedPrice ? (
                              <>
                                <span className="text-green-600">
                                  {Number(subscription.discountedPrice || 0).toFixed(2)}
                                </span>
                                <span className="text-sm text-gray-500 line-through ml-2">
                                  ₹{Number(subscription.price || 0).toFixed(2)}
                                </span>
                              </>
                            ) : (
                              <span>{Number(subscription.price || 0).toFixed(2)}</span>
                            )}
                          </div>
                          {subscription.discountedPrice && (
                            <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                              Save ₹{(Number(subscription.price || 0) - Number(subscription.discountedPrice || 0)).toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Features */}
                    {subscription.features && subscription.features.length > 0 && (
                      <div className="mb-3">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Features:</h4>
                        <div className="flex flex-wrap gap-1">
                          {subscription.features.slice(0, 3).map((feature, index) => (
                            <span
                              key={index}
                              className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full"
                            >
                              {feature}
                            </span>
                          ))}
                          {subscription.features.length > 3 && (
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                              +{subscription.features.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    <p className="text-xs text-gray-400 text-end">
                      Created: {new Date(subscription.createTimestamp).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 ml-4 absolute top-0 right-0">
                    <button
                      onClick={() => openEditModal(subscription)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => showDeleteConfirmation(subscription)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Subscription Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold">Add New Subscription</h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Validity Days</label>
                <input
                  type="number"
                  value={formData.validityDays}
                  onChange={(e) => setFormData({ ...formData, validityDays: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Discounted Price</label>
                <input
                  type="number"
                  value={formData.discountedPrice}
                  onChange={(e) => setFormData({ ...formData, discountedPrice: e.target.value ? Number(e.target.value) : null })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gym ID</label>
                <input
                  type="number"
                  value={formData.gymId}
                  onChange={(e) => setFormData({ ...formData, gymId: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isMostPopular}
                  onChange={(e) => setFormData({ ...formData, isMostPopular: e.target.checked })}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label className="ml-2 block text-sm font-medium text-gray-700">Most Popular</label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isCheapest}
                  onChange={(e) => setFormData({ ...formData, isCheapest: e.target.checked })}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label className="ml-2 block text-sm font-medium text-gray-700">Cheapest</label>
              </div>
            </div>

            <div className="flex space-x-3 p-6 border-t">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createSubscription}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Subscription
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Subscription Modal */}
      {showEditModal && selectedSubscription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold">Edit Subscription</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedSubscription(null);
                  resetForm();
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Validity Days</label>
                <input
                  type="number"
                  value={formData.validityDays}
                  onChange={(e) => setFormData({ ...formData, validityDays: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Discounted Price</label>
                <input
                  type="number"
                  value={formData.discountedPrice}
                  onChange={(e) => setFormData({ ...formData, discountedPrice: e.target.value ? Number(e.target.value) : null })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isMostPopular}
                  onChange={(e) => setFormData({ ...formData, isMostPopular: e.target.checked })}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label className="ml-2 block text-sm font-medium text-gray-700">Most Popular</label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isCheapest}
                  onChange={(e) => setFormData({ ...formData, isCheapest: e.target.checked })}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label className="ml-2 block text-sm font-medium text-gray-700">Cheapest</label>
              </div>
            </div>

            <div className="flex space-x-3 p-6 border-t">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedSubscription(null);
                  resetForm();
                }}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={updateSubscription}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Update Subscription
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      <SuccessModal
        isOpen={successModal.isOpen}
        onClose={() => setSuccessModal({ ...successModal, isOpen: false })}
        title={successModal.title}
        message={successModal.message}
        actionLabel={successModal.actionLabel}
        onAction={successModal.onAction}
      />

      {/* Error Modal */}
      <ErrorModal
        isOpen={errorModal.isOpen}
        onClose={() => setErrorModal({ ...errorModal, isOpen: false })}
        title={errorModal.title}
        message={errorModal.message}
        error={errorModal.error}
        showRetry={errorModal.showRetry}
        onRetry={errorModal.onRetry}
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        title={confirmModal.title}
        message={confirmModal.message}
        itemName={confirmModal.itemName}
        onConfirm={() => {
          confirmModal.onConfirm();
          setConfirmModal({ ...confirmModal, isOpen: false });
        }}
      />
    </div>
  );
}
