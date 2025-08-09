import React, { useState, useEffect } from 'react';
import { User, Search, Plus, Edit, Trash2, Phone, Mail, UserCheck, AlertCircle, X, CheckCircle, AlertTriangleIcon } from 'lucide-react';
import { API_CONFIG } from '../../config/api';
import { apiClient } from '../../services/apiClient';
import { useAuthStore } from '../../stores/authStore';

interface Owner {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  phoneNumber: string;
  activeStatus: string;
  createTimestamp: string;
}

export function OwnerManagement() {
  const { user, hasRole } = useAuthStore();
  const [owners, setOwners] = useState<Owner[]>([]);
  const [filteredOwners, setFilteredOwners] = useState<Owner[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState<Owner | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [ownerToDelete, setOwnerToDelete] = useState<Owner | null>(null);
  const [modalMessage, setModalMessage] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    phoneNumber: '',
    password: ''
  });

  // Check if current user is admin
  const isAdmin = hasRole('admin');
  const isOwner = hasRole('owner');

  // Fetch owners from API
  const fetchOwners = async () => {
    try {
      setIsLoading(true);
      const data = await apiClient.get(API_CONFIG.ENDPOINTS.OWNERS);
      if (data.success) {
        setOwners(data.data);
        setFilteredOwners(data.data);
      }
    } catch (error) {
      console.error('Error fetching owners:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Search owners
  const searchOwners = async (query: string) => {
    if (!query.trim()) {
      setFilteredOwners(owners);
      return;
    }

    const filtered = owners.filter(owner =>
      `${owner.firstName} ${owner.lastName}`.toLowerCase().includes(query.toLowerCase()) ||
      owner.email.toLowerCase().includes(query.toLowerCase()) ||
      owner.username.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredOwners(filtered);
  };

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    searchOwners(value);
  };

  // Create owner
  const createOwner = async () => {
    try {
      const data = await apiClient.post(API_CONFIG.ENDPOINTS.OWNERS, formData);
      if (data.success) {
        fetchOwners();
        setShowAddModal(false);
        resetForm();
        setModalMessage('Owner created successfully!');
        setShowSuccessModal(true);
      } else {
        setModalMessage('Error creating owner: ' + data.message);
        setShowErrorModal(true);
      }
    } catch (error) {
      console.error('Error creating owner:', error);
      setModalMessage('Error creating owner. Please try again.');
      setShowErrorModal(true);
    }
  };

  // Update owner
  const updateOwner = async () => {
    if (!selectedOwner) return;

    try {
      const updateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        username: formData.username,
        email: selectedOwner.email,
        phoneNumber: formData.phoneNumber
      };
      const data = await apiClient.put(`${API_CONFIG.ENDPOINTS.OWNERS}/${selectedOwner.id}`, updateData);
      if (data.success) {
        fetchOwners();
        setShowEditModal(false);
        setSelectedOwner(null);
        resetForm();
        setModalMessage('Owner updated successfully!');
        setShowSuccessModal(true);
      } else {
        setModalMessage('Error updating owner: ' + data.message);
        setShowErrorModal(true);
      }
    } catch (error) {
      console.error('Error updating owner:', error);
      setModalMessage('Error updating owner. Please try again.');
      setShowErrorModal(true);
    }
  };

  // Delete owner
  const deleteOwner = async (id: string) => {
    try {
      const data = await apiClient.delete(`${API_CONFIG.ENDPOINTS.OWNERS}/${id}`);
      if (data.success) {
        fetchOwners();
        setShowDeleteModal(false);
        setOwnerToDelete(null);
        setModalMessage('Owner deleted successfully!');
        setShowSuccessModal(true);
      } else {
        setModalMessage('Error deleting owner: ' + data.message);
        setShowErrorModal(true);
      }
    } catch (error) {
      console.error('Error deleting owner:', error);
      setModalMessage('Error deleting owner. Please try again.');
      setShowErrorModal(true);
    }
  };

  // Show delete confirmation modal
  const showDeleteConfirmation = (owner: Owner) => {
    setOwnerToDelete(owner);
    setShowDeleteModal(true);
  };

  // Reset form
  const resetForm = () => {
    const initialFormData = {
      firstName: '',
      lastName: '',
      email: '',
      username: '',
      phoneNumber: '',
      password: ''
    };

    // For owners, set their own email as username and disable it
    if (isOwner && user?.email) {
      initialFormData.username = user.email;
    }

    setFormData(initialFormData);
  };

  // Open edit modal
  const openEditModal = (owner: Owner) => {
    setSelectedOwner(owner);
    setFormData({
      firstName: owner.firstName,
      lastName: owner.lastName,
      email: owner.email,
      username: owner.username,
      phoneNumber: owner.phoneNumber,
      password: ''
    });
    setShowEditModal(true);
  };

  // Handle opening add modal
  const handleOpenAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  useEffect(() => {
    fetchOwners();
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
          <h1 className="text-2xl font-bold text-gray-900">Owner Management</h1>
          <p className="text-gray-600">Manage gym owners and their accounts</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Add Owner</span>
        </button>
      </div>

            {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <User className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Owners</p>
              <p className="text-2xl font-bold text-gray-900">{owners.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <UserCheck className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Owners</p>
              <p className="text-2xl font-bold text-gray-900">
                {owners.filter(o => o.activeStatus === '1').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <AlertCircle className="w-8 h-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Inactive Owners</p>
              <p className="text-2xl font-bold text-gray-900">
                {owners.filter(o => o.activeStatus === '0').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search owners..."
          value={searchTerm}
          onChange={handleSearch}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Owners List - Mobile First Design */}
      <div className="space-y-4">
        {filteredOwners.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow border">
            <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No owners found</h3>
            <p className="text-gray-500">
              {searchTerm ? 'Try adjusting your search criteria' : 'Start by adding your first gym owner'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
            {filteredOwners.filter(owner => owner.activeStatus === '1').map((owner) => (
              <div key={owner.id} className="bg-white rounded-lg shadow border p-4 hover:shadow-md transition-shadow">
                {/* Mobile Layout */}
                <div className="flex items-start justify-between relative">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                        {owner.firstName[0]}{owner.lastName[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {owner.firstName} {owner.lastName}
                        </h3>
                        <p className="text-sm text-gray-500">@{owner.username}</p>
                      </div>
                    </div>

                    <div className="space-y-2 my-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="w-4 h-4 mr-2" />
                        <span className="truncate">{owner.email}</span>
                      </div>
                      {owner.phoneNumber && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="w-4 h-4 mr-2" />
                          <span>{owner.phoneNumber}</span>
                        </div>
                      )}
                    </div>

                    <p className="text-xs text-gray-400 text-end">
                      Created: {new Date(owner.createTimestamp).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 ml-4 absolute top-0 right-0">
                    <button
                      onClick={() => openEditModal(owner)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => showDeleteConfirmation(owner)}
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

      {/* Add Owner Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold">Add New Owner</h2>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isOwner ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                  disabled={isOwner}
                  required
                />
                {isOwner && (
                  <p className="text-xs text-gray-500 mt-1">As an owner, your username is set to your email address</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
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
                onClick={createOwner}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Owner
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Owner Modal */}
      {showEditModal && selectedOwner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold">Edit Owner</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedOwner(null);
                  resetForm();
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isOwner ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                  disabled={isOwner}
                  required
                />
                {isOwner && (
                  <p className="text-xs text-gray-500 mt-1">As an owner, username cannot be changed</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex space-x-3 p-6 border-t">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedOwner(null);
                  resetForm();
                }}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={updateOwner}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Update Owner
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-sm">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Success!</h3>
              <p className="text-gray-600 mb-6">{modalMessage}</p>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-sm">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <X className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Error</h3>
              <p className="text-gray-600 mb-6">{modalMessage}</p>
              <button
                onClick={() => setShowErrorModal(false)}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && ownerToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-sm">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangleIcon className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Owner</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete <strong>{ownerToDelete.firstName} {ownerToDelete.lastName}</strong>? This action cannot be undone.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setOwnerToDelete(null);
                  }}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteOwner(ownerToDelete.id)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
