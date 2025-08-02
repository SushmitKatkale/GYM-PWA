import React, { useState, useEffect } from 'react';
import { Box, Search, Plus, Edit, Trash2, DollarSign, Clock, X } from 'lucide-react';
import { buildApiUrl, API_CONFIG } from '../../config/api';

interface Subscription {
  id: number;
  title: string;
  validityDays: number;
  price: number;
  discountedPrice: number | null;
  gymId: number;
  isMostPopular: boolean;
  isCheapest: boolean;
  activeStatus: boolean;
  createTimestamp: string;
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

  // Fetch subscriptions from API
  const fetchSubscriptions = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.SUBSCRIPTIONS));
      const data = await response.json();
      if (data.success) {
        setSubscriptions(data.data.subscriptions);
        setFilteredSubscriptions(data.data.subscriptions);
      }
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
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
    try {
      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.SUBSCRIPTIONS), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (data.success) {
        fetchSubscriptions();
        setShowAddModal(false);
        resetForm();
        alert('Subscription created successfully!');
      } else {
        alert('Error creating subscription: ' + data.message);
      }
    } catch (error) {
      console.error('Error creating subscription:', error);
      alert('Error creating subscription');
    }
  };

  // Update subscription
  const updateSubscription = async () => {
    if (!selectedSubscription) return;
    
    try {
      const response = await fetch(buildApiUrl(`${API_CONFIG.ENDPOINTS.SUBSCRIPTIONS}/${selectedSubscription.id}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
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
        fetchSubscriptions();
        setShowEditModal(false);
        setSelectedSubscription(null);
        resetForm();
        alert('Subscription updated successfully!');
      } else {
        alert('Error updating subscription: ' + data.message);
      }
    } catch (error) {
      console.error('Error updating subscription:', error);
      alert('Error updating subscription');
    }
  };

  // Delete subscription
  const deleteSubscription = async (id: number) => {
    if (!confirm('Are you sure you want to delete this subscription?')) return;
    
    try {
      const response = await fetch(buildApiUrl(`${API_CONFIG.ENDPOINTS.SUBSCRIPTIONS}/${id}`), {
        method: 'DELETE'
      });
      const data = await response.json();
      if (data.success) {
        fetchSubscriptions();
        alert('Subscription deleted successfully!');
      } else {
        alert('Error deleting subscription: ' + data.message);
      }
    } catch (error) {
      console.error('Error deleting subscription:', error);
      alert('Error deleting subscription');
    }
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
          filteredSubscriptions.map((subscription) => (
            <div key={subscription.id} className="bg-white rounded-lg shadow border p-4 hover:shadow-md transition-shadow">
              {/* Mobile Layout */}
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                      {subscription.title[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {subscription.title}
                      </h3>
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="mr-2" />
                        <span>{subscription.validityDays} days</span>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      subscription.activeStatus
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {subscription.activeStatus ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <div className="space-y-1 mb-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <DollarSign className="w-4 h-4 mr-2" />
                      <span>${subscription.price.toFixed(2)}</span>
                    </div>
                    {subscription.discountedPrice && (
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="line-through mr-2">${subscription.price.toFixed(2)}</span>
                        <span className="text-green-600">${subscription.discountedPrice.toFixed(2)}</span>
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-gray-400">
                    Created: {new Date(subscription.createTimestamp).toLocaleDateString()}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => openEditModal(subscription)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteSubscription(subscription.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
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
    </div>
  );
}
