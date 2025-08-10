import React from 'react';
import { X, Calendar, Clock, User, Globe, Building, Target, Mail, Bell, Smartphone, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { Notification, notificationService } from '../../../services/notificationService';

interface NotificationDetailsModalProps {
  notification: Notification;
  onClose: () => void;
}

export function NotificationDetailsModal({ notification, onClose }: NotificationDetailsModalProps) {
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return CheckCircle;
      case 'warning': return AlertCircle;
      case 'error': return AlertCircle;
      case 'promotion': return Target;
      case 'reminder': return Clock;
      default: return Info;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-green-600 bg-green-50 border-green-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'error': return 'text-red-600 bg-red-50 border-red-200';
      case 'promotion': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'reminder': return 'text-orange-600 bg-orange-50 border-orange-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const getPriorityBadge = (priority: string) => {
    const baseClasses = "px-3 py-1 text-sm font-medium rounded-full";
    switch (priority) {
      case 'urgent': return `${baseClasses} bg-red-100 text-red-800`;
      case 'high': return `${baseClasses} bg-orange-100 text-orange-800`;
      case 'normal': return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'low': return `${baseClasses} bg-gray-100 text-gray-800`;
      default: return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getDeliveryChannelIcons = (channels: string[]) => {
    return channels.map(channel => {
      switch (channel) {
        case 'email': return { icon: Mail, label: 'Email' };
        case 'push': return { icon: Bell, label: 'Push' };
        case 'sms': return { icon: Smartphone, label: 'SMS' };
        default: return { icon: Bell, label: channel };
      }
    });
  };

  const getDeliveryStatus = (channel: string) => {
    if (!notification.deliveryStatus) return 'pending';
    const status = notification.deliveryStatus[channel];
    
    // Handle case where status might be an object (e.g., from globalDelivery)
    if (typeof status === 'object' && status !== null) {
      return status.success ? 'delivered' : 'failed';
    }
    
    // Return string status or default to pending
    return typeof status === 'string' ? status : 'pending';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'text-green-600 bg-green-100';
      case 'failed': return 'text-red-600 bg-red-100';
      case 'sent': return 'text-blue-600 bg-blue-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const Icon = getNotificationIcon(notification.type);
  const colorClass = getNotificationColor(notification.type);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${colorClass.split(' ')[1]} ${colorClass.split(' ')[2]}`}>
              <Icon className={`w-5 h-5 ${colorClass.split(' ')[0]}`} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Notification Details</h2>
              <div className="flex items-center space-x-2 mt-1">
                <span className={getPriorityBadge(notification.priority)}>
                  {notification.priority.charAt(0).toUpperCase() + notification.priority.slice(1)} Priority
                </span>
                {notification.isGlobal && (
                  <span className="px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800">
                    Global
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{notification.title}</h3>
              <p className="text-gray-700 mt-2 leading-relaxed">{notification.message}</p>
            </div>

            {notification.actionUrl && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Action Button</p>
                    <p className="text-sm text-gray-600">{notification.actionText || 'Learn More'}</p>
                  </div>
                  <a
                    href={notification.actionUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    {notification.actionText || 'Open Link'}
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Details</h4>
              
              <div className="space-y-3 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-600">Type:</span>
                  <span className="capitalize font-medium">{notification.type}</span>
                </div>

                {notification.category && (
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-600">Category:</span>
                    <span className="capitalize font-medium">{notification.category}</span>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Created:</span>
                  <span className="font-medium">
                    {new Date(notification.createTimestamp).toLocaleString()}
                  </span>
                </div>

                {notification.scheduledFor && (
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">Scheduled:</span>
                    <span className="font-medium">
                      {new Date(notification.scheduledFor).toLocaleString()}
                    </span>
                  </div>
                )}

                {notification.expiresAt && (
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">Expires:</span>
                    <span className="font-medium">
                      {new Date(notification.expiresAt).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Recipients</h4>
              
              <div className="space-y-3 text-sm">
                {notification.isGlobal ? (
                  <div className="flex items-center space-x-2">
                    <Globe className="w-4 h-4 text-blue-500" />
                    <span className="font-medium">All Users</span>
                  </div>
                ) : (
                  <>
                    {notification.recipientEmail && (
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">Email:</span>
                        <span className="font-medium">{notification.recipientEmail}</span>
                      </div>
                    )}

                    {notification.recipientRole && (
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">Role:</span>
                        <span className="font-medium">
                          {notification.recipientRole === '1' ? 'Users' : 
                           notification.recipientRole === '2' ? 'Gym Owners' : 
                           notification.recipientRole === '3' ? 'Admins' : 'Unknown'}
                        </span>
                      </div>
                    )}
                  </>
                )}

                {notification.gymId && (
                  <div className="flex items-center space-x-2">
                    <Building className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">Gym:</span>
                    <span className="font-medium">#{notification.gymId}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Delivery Channels & Status */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Delivery Status</h4>
            
            <div className="space-y-3">
              {getDeliveryChannelIcons(notification.deliveryChannels).map((channelInfo, index) => {
                const channel = notification.deliveryChannels[index];
                const status = getDeliveryStatus(channel);
                const IconComponent = channelInfo.icon;
                
                return (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <IconComponent className="w-4 h-4 text-gray-600" />
                      <span className="font-medium text-gray-900">{channelInfo.label}</span>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(status)}`}>
                      {typeof status === 'string' ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Read Status */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Read Status</h4>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${notification.isRead ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                <span className="font-medium text-gray-900">
                  {notification.isRead ? 'Read' : 'Unread'}
                </span>
              </div>
              {notification.isRead && notification.readAt && (
                <span className="text-sm text-gray-600">
                  {new Date(notification.readAt).toLocaleString()}
                </span>
              )}
            </div>
          </div>

          {/* Tags */}
          {notification.tags && notification.tags.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Tags</h4>
              
              <div className="flex flex-wrap gap-2">
                {notification.tags.map((tag, index) => (
                  <span key={index} className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Additional Data */}
          {notification.data && Object.keys(notification.data).length > 0 && (
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Additional Data</h4>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap overflow-x-auto">
                  {JSON.stringify(notification.data, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Close Button */}
          <div className="flex justify-end pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
