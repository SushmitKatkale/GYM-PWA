import React, { useState } from 'react';
import { X, Send, Users, Mail, Bell, Smartphone, Upload, FileText } from 'lucide-react';
import { notificationService, BulkNotificationRequest } from '../../../services/notificationService';

interface BulkNotificationModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function BulkNotificationModal({ onClose, onSuccess }: BulkNotificationModalProps) {
  const [formData, setFormData] = useState<BulkNotificationRequest>({
    title: '',
    message: '',
    type: 'info',
    category: 'system',
    priority: 'normal',
    userEmails: [],
    role: undefined,
    gymId: undefined,
    deliveryChannels: ['push', 'email'],
    data: {}
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailInput, setEmailInput] = useState('');
  const [targetingMode, setTargetingMode] = useState<'role' | 'emails' | 'gym'>('role');

  const handleInputChange = (field: keyof BulkNotificationRequest, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDeliveryChannelChange = (channel: string) => {
    setFormData(prev => ({
      ...prev,
      deliveryChannels: prev.deliveryChannels?.includes(channel)
        ? prev.deliveryChannels.filter(c => c !== channel)
        : [...(prev.deliveryChannels || []), channel]
    }));
  };

  const handleAddEmails = () => {
    const emails = emailInput
      .split(/[,\n\s]+/)
      .map(email => email.trim())
      .filter(email => email && email.includes('@'));
    
    if (emails.length > 0) {
      setFormData(prev => ({
        ...prev,
        userEmails: [...new Set([...(prev.userEmails || []), ...emails])]
      }));
      setEmailInput('');
    }
  };

  const handleRemoveEmail = (email: string) => {
    setFormData(prev => ({
      ...prev,
      userEmails: prev.userEmails?.filter(e => e !== email) || []
    }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/plain') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const emails = content
          .split(/[,\n\s]+/)
          .map(email => email.trim())
          .filter(email => email && email.includes('@'));
        
        setFormData(prev => ({
          ...prev,
          userEmails: [...new Set([...(prev.userEmails || []), ...emails])]
        }));
      };
      reader.readAsText(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Clean up the form data based on targeting mode
      const cleanedData = { ...formData };
      
      if (targetingMode === 'role') {
        delete cleanedData.userEmails;
        delete cleanedData.gymId;
      } else if (targetingMode === 'emails') {
        delete cleanedData.role;
        delete cleanedData.gymId;
        if (!cleanedData.userEmails || cleanedData.userEmails.length === 0) {
          setError('Please add at least one email address');
          setLoading(false);
          return;
        }
      } else if (targetingMode === 'gym') {
        delete cleanedData.userEmails;
        delete cleanedData.role;
        if (!cleanedData.gymId) {
          setError('Please specify a gym ID');
          setLoading(false);
          return;
        }
      }

      const response = await notificationService.sendBulkNotification(cleanedData);
      
      if (response.success) {
        onSuccess();
      } else {
        setError(response.message || 'Failed to send bulk notification');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to send bulk notification');
    } finally {
      setLoading(false);
    }
  };

  const getRecipientCount = () => {
    if (targetingMode === 'emails') {
      return formData.userEmails?.length || 0;
    } else if (targetingMode === 'role') {
      const roleCounts = { '1': 'All Users', '2': 'All Gym Owners', '3': 'All Admins' };
      return formData.role ? roleCounts[formData.role] || 'Unknown' : 'No role selected';
    } else if (targetingMode === 'gym') {
      return formData.gymId ? `All users at Gym #${formData.gymId}` : 'No gym selected';
    }
    return 0;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Users className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-900">Send Bulk Notification</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Recipient Count Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span className="text-blue-800 font-medium">
                Recipients: {getRecipientCount()}
              </span>
            </div>
          </div>

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Message Content</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter notification title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message *
              </label>
              <textarea
                required
                rows={4}
                value={formData.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter notification message"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="info">Info</option>
                  <option value="success">Success</option>
                  <option value="warning">Warning</option>
                  <option value="error">Error</option>
                  <option value="promotion">Promotion</option>
                  <option value="reminder">Reminder</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="system">System</option>
                  <option value="subscription">Subscription</option>
                  <option value="class">Class</option>
                  <option value="workout">Workout</option>
                  <option value="payment">Payment</option>
                  <option value="promotion">Promotion</option>
                  <option value="reminder">Reminder</option>
                  <option value="security">Security</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => handleInputChange('priority', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>
          </div>

          {/* Targeting Mode Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Target Recipients</h3>
            
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="targetingMode"
                  value="role"
                  checked={targetingMode === 'role'}
                  onChange={() => setTargetingMode('role')}
                  className="rounded"
                />
                <span className="ml-2 text-sm">By User Role</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="radio"
                  name="targetingMode"
                  value="emails"
                  checked={targetingMode === 'emails'}
                  onChange={() => setTargetingMode('emails')}
                  className="rounded"
                />
                <span className="ml-2 text-sm">Specific Email Addresses</span>
              </label>

              <label className="flex items-center">
                <input
                  type="radio"
                  name="targetingMode"
                  value="gym"
                  checked={targetingMode === 'gym'}
                  onChange={() => setTargetingMode('gym')}
                  className="rounded"
                />
                <span className="ml-2 text-sm">By Gym</span>
              </label>
            </div>

            {/* Role Targeting */}
            {targetingMode === 'role' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Role
                </label>
                <select
                  value={formData.role || ''}
                  onChange={(e) => handleInputChange('role', e.target.value || undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Role</option>
                  <option value="1">All Users (Members)</option>
                  <option value="2">All Gym Owners</option>
                  <option value="3">All Admins</option>
                </select>
              </div>
            )}

            {/* Email Targeting */}
            {targetingMode === 'emails' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Add Email Addresses
                  </label>
                  <div className="flex space-x-2">
                    <textarea
                      rows={3}
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter email addresses separated by commas, spaces, or new lines..."
                    />
                    <div className="flex flex-col space-y-2">
                      <button
                        type="button"
                        onClick={handleAddEmails}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        Add
                      </button>
                      <label className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer text-center">
                        <Upload className="w-4 h-4 mx-auto mb-1" />
                        <span className="text-xs">Upload</span>
                        <input
                          type="file"
                          accept=".txt"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    You can also upload a .txt file with email addresses
                  </p>
                </div>

                {formData.userEmails && formData.userEmails.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Selected Emails ({formData.userEmails.length})
                    </label>
                    <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-lg p-2 space-y-1">
                      {formData.userEmails.map((email, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 px-2 py-1 rounded">
                          <span className="text-sm text-gray-700">{email}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveEmail(email)}
                            className="text-red-500 hover:text-red-700 text-xs"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Gym Targeting */}
            {targetingMode === 'gym' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gym ID
                </label>
                <input
                  type="number"
                  value={formData.gymId || ''}
                  onChange={(e) => handleInputChange('gymId', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter gym ID"
                  required
                />
              </div>
            )}
          </div>

          {/* Delivery Channels */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Delivery Channels</h3>
            
            <div className="flex space-x-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.deliveryChannels?.includes('push') || false}
                  onChange={() => handleDeliveryChannelChange('push')}
                  className="rounded"
                />
                <Bell className="w-4 h-4 ml-2 mr-1" />
                <span className="text-sm">Push Notification</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.deliveryChannels?.includes('email') || false}
                  onChange={() => handleDeliveryChannelChange('email')}
                  className="rounded"
                />
                <Mail className="w-4 h-4 ml-2 mr-1" />
                <span className="text-sm">Email</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.deliveryChannels?.includes('sms') || false}
                  onChange={() => handleDeliveryChannelChange('sms')}
                  className="rounded"
                />
                <Smartphone className="w-4 h-4 ml-2 mr-1" />
                <span className="text-sm">SMS</span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <div className="text-sm text-gray-500">
              {formData.deliveryChannels && formData.deliveryChannels.length > 0 && (
                <span>Will send via: {formData.deliveryChannels.join(', ')}</span>
              )}
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !formData.title || !formData.message || (!formData.deliveryChannels || formData.deliveryChannels.length === 0)}
                className="flex items-center px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Send to {typeof getRecipientCount() === 'number' ? getRecipientCount() + ' recipients' : getRecipientCount()}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
