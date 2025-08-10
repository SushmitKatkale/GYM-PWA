import React, { useState } from 'react';
import { X, Send, Calendar, Bell, Mail, Smartphone, Globe, User, Building } from 'lucide-react';
import { notificationService, CreateNotificationRequest } from '../../../services/notificationService';


interface CreateNotificationModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateNotificationModal({ onClose, onSuccess }: CreateNotificationModalProps) {
  const [formData, setFormData] = useState<CreateNotificationRequest>({
    title: '',
    message: '',
    type: 'info',
    category: 'system',
    priority: 'normal',
    recipientEmail: '',
    recipientRole: undefined,
    isGlobal: false,
    isRead: false,
    gymId: undefined,
    actionUrl: '',
    actionText: '',
    deliveryChannels: ['push'],
    scheduledFor: '',
    expiresAt: '',
    tags: [],
    data: {}
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState(false);

  const handleInputChange = (field: keyof CreateNotificationRequest, value: any) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Clean up the form data - do NOT include ID, let backend auto-increment
      const cleanedData = {
        ...formData
        // Note: Removed id, createTimestamp, updateTimestamp - backend will handle these
      };
      
      // Remove empty fields
      if (!cleanedData.recipientEmail) delete cleanedData.recipientEmail;
      if (!cleanedData.recipientRole) delete cleanedData.recipientRole;
      if (!cleanedData.gymId) delete cleanedData.gymId;
      if (!cleanedData.actionUrl) delete cleanedData.actionUrl;
      if (!cleanedData.actionText) delete cleanedData.actionText;
      if (!cleanedData.scheduledFor) delete cleanedData.scheduledFor;
      if (!cleanedData.expiresAt) delete cleanedData.expiresAt;

      // Debug: Log the data being sent
      console.log('Sending notification data to backend:', cleanedData);

      const response = await notificationService.createNotification(cleanedData);
      
      if (response.success) {
        onSuccess();
      } else {
        setError(response.message || 'Failed to create notification');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create notification');
    } finally {
      setLoading(false);
    }
  };

  const handleTestNotification = async () => {
    try {
      await notificationService.sendTestNotification({
        title: formData.title || 'Test Notification',
        message: formData.message || 'This is a test notification',
        type: formData.type as any
      });
      alert('Test notification sent successfully!');
    } catch (error) {
      alert('Failed to send test notification: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Bell className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Create Notification</h2>
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

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter notification title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message *
              </label>
              <textarea
                required
                rows={3}
                value={formData.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>
          </div>

          {/* Targeting */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Targeting</h3>
            
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isGlobal}
                  onChange={(e) => handleInputChange('isGlobal', e.target.checked)}
                  className="rounded"
                />
                <Globe className="w-4 h-4 ml-2 mr-1" />
                <span className="text-sm">Send to all users</span>
              </label>
            </div>

            {!formData.isGlobal && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Specific User Email
                  </label>
                  <input
                    type="email"
                    value={formData.recipientEmail}
                    onChange={(e) => handleInputChange('recipientEmail', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="user@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Target Role
                  </label>
                  <select
                    value={formData.recipientRole || ''}
                    onChange={(e) => handleInputChange('recipientRole', e.target.value || undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Any Role</option>
                    <option value="1">Users</option>
                    <option value="2">Gym Owners</option>
                    <option value="3">Admins</option>
                  </select>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gym ID (Optional)
              </label>
              <input
                type="number"
                value={formData.gymId || ''}
                onChange={(e) => handleInputChange('gymId', e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter gym ID for gym-specific notifications"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Actions (Optional)</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Action URL
                </label>
                <input
                  type="url"
                  value={formData.actionUrl}
                  onChange={(e) => handleInputChange('actionUrl', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com/action"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Action Button Text
                </label>
                <input
                  type="text"
                  value={formData.actionText}
                  onChange={(e) => handleInputChange('actionText', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Learn More"
                />
              </div>
            </div>
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

          {/* Scheduling */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Scheduling (Optional)</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Schedule For
                </label>
                <input
                  type="datetime-local"
                  value={formData.scheduledFor}
                  onChange={(e) => handleInputChange('scheduledFor', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expires At
                </label>
                <input
                  type="datetime-local"
                  value={formData.expiresAt}
                  onChange={(e) => handleInputChange('expiresAt', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleTestNotification}
              className="flex items-center px-4 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Send className="w-4 h-4 mr-2" />
              Send Test
            </button>

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
                disabled={loading || !formData.title || !formData.message}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Create Notification
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
