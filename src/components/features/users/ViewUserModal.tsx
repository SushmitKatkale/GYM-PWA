import React, { useState, useEffect } from 'react';
import { X, User, Mail, Phone, Calendar, Shield, CheckCircle, XCircle, AlertCircle, Crown, Building } from 'lucide-react';
import { adminUserService, User as AdminUser } from '../../../services/adminUserService';

interface ViewUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export function ViewUserModal({ isOpen, onClose, userId }: ViewUserModalProps) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && userId) {
      loadUser();
    }
  }, [isOpen, userId]);

  const loadUser = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await adminUserService.getUserByEmail(userId);
      
      if (response.success && response.data) {
        setUser(response.data);
      } else {
        setError('Failed to load user details');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getUserRoleBadge = (role: 1 | 2 | 3 | 4) => {
    const badges = {
      1: { label: 'Member', class: 'bg-blue-100 text-blue-800', icon: User },
      2: { label: 'Gym Owner', class: 'bg-purple-100 text-purple-800', icon: Building },
      3: { label: 'Trainer', class: 'bg-green-100 text-green-800', icon: User },
      4: { label: 'Admin', class: 'bg-red-100 text-red-800', icon: Crown },
    };
    return badges[role] || badges[1];
  };

  const getStatusIcon = (user: AdminUser) => {
    if (user.recordStatus === 1 && user.isVerified) {
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    } else if (user.recordStatus === 1) {
      return <AlertCircle className="w-5 h-5 text-yellow-600" />;
    } else {
      return <XCircle className="w-5 h-5 text-red-600" />;
    }
  };

  const getStatusText = (user: AdminUser) => {
    if (user.recordStatus === 1 && user.isVerified) {
      return { text: 'Active & Verified', class: 'text-green-600' };
    } else if (user.recordStatus === 1) {
      return { text: 'Active (Unverified)', class: 'text-yellow-600' };
    } else {
      return { text: 'Inactive', class: 'text-red-600' };
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />

        <div className="inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900">User Details</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : error ? (
            <div className="p-4 text-center text-red-600 bg-red-50 border border-red-200 rounded-lg">
              {error}
            </div>
          ) : user ? (
            <div className="space-y-6">
              {/* User Header */}
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 h-16 w-16">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                    {user.firstName[0]}{user.lastName[0]}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h4 className="text-xl font-semibold text-gray-900">
                      {user.firstName} {user.lastName}
                    </h4>
                    {(() => {
                      const roleBadge = getUserRoleBadge(user.role);
                      const RoleIcon = roleBadge.icon;
                      return (
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${roleBadge.class}`}>
                          <RoleIcon className="w-3 h-3 mr-1" />
                          {roleBadge.label}
                        </span>
                      );
                    })()}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">@{user.username}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    {getStatusIcon(user)}
                    <span className={`text-sm font-medium ${getStatusText(user).class}`}>
                      {getStatusText(user).text}
                    </span>
                  </div>
                </div>
              </div>

              {/* User Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Contact Information */}
                <div className="space-y-4">
                  <h5 className="text-sm font-medium text-gray-900 uppercase tracking-wide">Contact Information</h5>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{user.email}</p>
                        <p className="text-xs text-gray-500">Email Address</p>
                      </div>
                    </div>

                    {user.phone && (
                      <div className="flex items-center space-x-3">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{user.phone}</p>
                          <p className="text-xs text-gray-500">Phone Number</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Account Information */}
                <div className="space-y-4">
                  <h5 className="text-sm font-medium text-gray-900 uppercase tracking-wide">Account Information</h5>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {new Date(user.created_at).toLocaleDateString()} at {new Date(user.created_at).toLocaleTimeString()}
                        </p>
                        <p className="text-xs text-gray-500">Account Created</p>
                      </div>
                    </div>

                    {user.updated_at && (
                      <div className="flex items-center space-x-3">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {new Date(user.updated_at).toLocaleDateString()} at {new Date(user.updated_at).toLocaleTimeString()}
                          </p>
                          <p className="text-xs text-gray-500">Last Updated</p>
                        </div>
                      </div>
                    )}

                    {user.lastLoginAt && (
                      <div className="flex items-center space-x-3">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {new Date(user.lastLoginAt).toLocaleDateString()} at {new Date(user.lastLoginAt).toLocaleTimeString()}
                          </p>
                          <p className="text-xs text-gray-500">Last Login</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center space-x-3">
                      <Shield className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">User ID: {user.id}</p>
                        <p className="text-xs text-gray-500">System Identifier</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Summary */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h5 className="text-sm font-medium text-gray-900 mb-3 uppercase tracking-wide">Account Status</h5>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className={`w-8 h-8 mx-auto mb-1 rounded-full flex items-center justify-center ${
                      user.recordStatus === 1 ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {user.recordStatus === 1 ? 
                        <CheckCircle className="w-4 h-4 text-green-600" /> : 
                        <XCircle className="w-4 h-4 text-red-600" />
                      }
                    </div>
                    <p className="text-xs font-medium text-gray-900">
                      {user.recordStatus === 1 ? 'Active' : 'Inactive'}
                    </p>
                    <p className="text-xs text-gray-500">Status</p>
                  </div>

                  <div className="text-center">
                    <div className={`w-8 h-8 mx-auto mb-1 rounded-full flex items-center justify-center ${
                      user.isVerified ? 'bg-green-100' : 'bg-yellow-100'
                    }`}>
                      <Shield className={`w-4 h-4 ${user.isVerified ? 'text-green-600' : 'text-yellow-600'}`} />
                    </div>
                    <p className="text-xs font-medium text-gray-900">
                      {user.isVerified ? 'Verified' : 'Unverified'}
                    </p>
                    <p className="text-xs text-gray-500">Verification</p>
                  </div>

                  {user.totalLogins !== undefined && (
                    <div className="text-center">
                      <div className="w-8 h-8 mx-auto mb-1 rounded-full bg-blue-100 flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-blue-600" />
                      </div>
                      <p className="text-xs font-medium text-gray-900">{user.totalLogins}</p>
                      <p className="text-xs text-gray-500">Total Logins</p>
                    </div>
                  )}

                  {user.totalSpent !== undefined && (
                    <div className="text-center">
                      <div className="w-8 h-8 mx-auto mb-1 rounded-full bg-purple-100 flex items-center justify-center">
                        <span className="text-xs font-bold text-purple-600">₹</span>
                      </div>
                      <p className="text-xs font-medium text-gray-900">₹{user.totalSpent}</p>
                      <p className="text-xs text-gray-500">Total Spent</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Associated Data */}
              {(user.gym || user.subscriptions) && (
                <div className="space-y-4">
                  <h5 className="text-sm font-medium text-gray-900 uppercase tracking-wide">Associated Data</h5>
                  
                  {user.gym && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Building className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-900">Associated Gym</span>
                      </div>
                      <p className="text-sm text-blue-800 mt-1">{user.gym.name} (ID: {user.gym.id})</p>
                    </div>
                  )}

                  {user.subscriptions && user.subscriptions.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700">Active Subscriptions</p>
                      {user.subscriptions.map((subscription, index) => (
                        <div key={index} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-sm font-medium text-green-900">{subscription.planName}</p>
                              <p className="text-xs text-green-700">Status: {subscription.status}</p>
                            </div>
                            <span className="text-xs text-green-600">
                              Expires: {new Date(subscription.expiryDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : null}

          <div className="flex justify-end pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
