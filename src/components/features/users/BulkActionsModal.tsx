import React, { useState } from 'react';
import { X, Users, CheckCircle, XCircle, Shield, UserCheck, UserX, Bell, AlertTriangle } from 'lucide-react';
import { adminUserService, UpdateUserRequest } from '../../../services/adminUserService';

interface BulkActionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userIds: string[];
}

type BulkActionType = 'activate' | 'deactivate' | 'verify' | 'unverify' | 'update' | 'notify';

interface NotificationData {
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  actionUrl?: string;
}

interface BulkUpdateData {
  type?: '1' | '2' | '3';
  activeStatus?: '0' | '1';
  isVerified?: boolean;
}

export function BulkActionsModal({ isOpen, onClose, onSuccess, userIds }: BulkActionsModalProps) {
  const [selectedAction, setSelectedAction] = useState<BulkActionType>('activate');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  // Form data for different actions
  const [updateData, setUpdateData] = useState<BulkUpdateData>({});
  const [notificationData, setNotificationData] = useState<NotificationData>({
    title: '',
    message: '',
    type: 'info',
    actionUrl: ''
  });

  const actionConfig = {
    activate: {
      label: 'Activate Users',
      description: 'Set selected users as active',
      icon: UserCheck,
      color: 'text-green-600',
      confirmText: `activate ${userIds.length} user${userIds.length !== 1 ? 's' : ''}`,
      dangerLevel: 'low'
    },
    deactivate: {
      label: 'Deactivate Users',
      description: 'Set selected users as inactive',
      icon: UserX,
      color: 'text-red-600',
      confirmText: `deactivate ${userIds.length} user${userIds.length !== 1 ? 's' : ''}`,
      dangerLevel: 'high'
    },
    verify: {
      label: 'Verify Users',
      description: 'Mark selected users as verified',
      icon: Shield,
      color: 'text-blue-600',
      confirmText: `verify ${userIds.length} user${userIds.length !== 1 ? 's' : ''}`,
      dangerLevel: 'medium'
    },
    unverify: {
      label: 'Unverify Users',
      description: 'Remove verification from selected users',
      icon: Shield,
      color: 'text-yellow-600',
      confirmText: `remove verification from ${userIds.length} user${userIds.length !== 1 ? 's' : ''}`,
      dangerLevel: 'medium'
    },
    update: {
      label: 'Update Users',
      description: 'Update properties for selected users',
      icon: Users,
      color: 'text-purple-600',
      confirmText: `update ${userIds.length} user${userIds.length !== 1 ? 's' : ''}`,
      dangerLevel: 'medium'
    },
    notify: {
      label: 'Send Notification',
      description: 'Send a notification to selected users',
      icon: Bell,
      color: 'text-indigo-600',
      confirmText: `send notification to ${userIds.length} user${userIds.length !== 1 ? 's' : ''}`,
      dangerLevel: 'low'
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (selectedAction === 'notify') {
      if (!notificationData.title.trim()) {
        newErrors.title = 'Title is required';
      }
      if (!notificationData.message.trim()) {
        newErrors.message = 'Message is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (selectedAction === 'notify') {
      setNotificationData(prev => ({
        ...prev,
        [name]: value
      }));
    } else if (selectedAction === 'update') {
      setUpdateData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const executeAction = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      let response;

      switch (selectedAction) {
        case 'activate':
          response = await adminUserService.bulkUpdateUsers(userIds, { activeStatus: '1' });
          break;
        case 'deactivate':
          response = await adminUserService.bulkUpdateUsers(userIds, { activeStatus: '0' });
          break;
        case 'verify':
          response = await adminUserService.bulkUpdateUsers(userIds, { isVerified: true });
          break;
        case 'unverify':
          response = await adminUserService.bulkUpdateUsers(userIds, { isVerified: false });
          break;
        case 'update':
          response = await adminUserService.bulkUpdateUsers(userIds, updateData);
          break;
        case 'notify':
          response = await adminUserService.sendNotificationToUsers(userIds, notificationData);
          break;
      }

      if (response.success) {
        onSuccess();
      } else {
        setErrors({ submit: response.message || 'Action failed' });
      }
    } catch (error) {
      setErrors({ submit: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
      setShowConfirmation(false);
    }
  };

  const handleClose = () => {
    setSelectedAction('activate');
    setErrors({});
    setShowConfirmation(false);
    setUpdateData({});
    setNotificationData({
      title: '',
      message: '',
      type: 'info',
      actionUrl: ''
    });
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfirmation(true);
  };

  if (!isOpen) return null;

  const config = actionConfig[selectedAction];
  const ActionIcon = config.icon;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={handleClose} />

        <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl sm:max-w-lg">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Bulk Actions</h3>
              <p className="text-sm text-gray-500">
                Perform actions on {userIds.length} selected user{userIds.length !== 1 ? 's' : ''}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {showConfirmation ? (
            <div className="space-y-4">
              <div className="flex items-start space-x-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-yellow-800">Confirm Action</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    Are you sure you want to {config.confirmText}? This action cannot be undone.
                  </p>
                </div>
              </div>

              {errors.submit && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
                  {errors.submit}
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={executeAction}
                  disabled={loading}
                  className={`px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center ${
                    config.dangerLevel === 'high' 
                      ? 'bg-red-600 hover:bg-red-700' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />}
                  Confirm {config.label}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errors.submit && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
                  {errors.submit}
                </div>
              )}

              {/* Action Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Action
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {Object.entries(actionConfig).map(([key, actionConf]) => {
                    const Icon = actionConf.icon;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setSelectedAction(key as BulkActionType)}
                        className={`flex items-center space-x-3 p-3 text-left border rounded-lg transition-colors ${
                          selectedAction === key
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${actionConf.color}`} />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{actionConf.label}</p>
                          <p className="text-xs text-gray-500">{actionConf.description}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action-specific forms */}
              {selectedAction === 'update' && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-900">Update Fields</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        User Type
                      </label>
                      <select
                        name="type"
                        value={updateData.type || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white text-sm"
                      >
                        <option value="">No Change</option>
                        <option value="1">Regular User</option>
                        <option value="2">Gym Owner</option>
                        <option value="3">Admin</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Active Status
                      </label>
                      <select
                        name="activeStatus"
                        value={updateData.activeStatus || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white text-sm"
                      >
                        <option value="">No Change</option>
                        <option value="1">Active</option>
                        <option value="0">Inactive</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="isVerified"
                      checked={updateData.isVerified || false}
                      onChange={handleInputChange}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label className="ml-2 text-sm text-gray-700">
                      Set as verified
                    </label>
                  </div>
                </div>
              )}

              {selectedAction === 'notify' && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-900">Notification Details</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={notificationData.title}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
                        errors.title ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Notification title"
                    />
                    {errors.title && (
                      <p className="mt-1 text-xs text-red-600">{errors.title}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Message *
                    </label>
                    <textarea
                      name="message"
                      value={notificationData.message}
                      onChange={handleInputChange}
                      rows={3}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
                        errors.message ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Notification message"
                    />
                    {errors.message && (
                      <p className="mt-1 text-xs text-red-600">{errors.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Type
                      </label>
                      <select
                        name="type"
                        value={notificationData.type}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white text-sm"
                      >
                        <option value="info">Info</option>
                        <option value="success">Success</option>
                        <option value="warning">Warning</option>
                        <option value="error">Error</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Action URL (Optional)
                      </label>
                      <input
                        type="url"
                        name="actionUrl"
                        value={notificationData.actionUrl}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  <ActionIcon className="w-4 h-4 mr-2" />
                  {config.label}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
