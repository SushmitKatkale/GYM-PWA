import React from 'react';
import { Bell, Check, X, Clock, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

export function NotificationsPage() {
  const { notifications, markNotificationRead } = useApp();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return CheckCircle;
      case 'warning': return AlertCircle;
      case 'error': return X;
      default: return Info;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-green-600 bg-green-50 border-green-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'error': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const unreadNotifications = notifications.filter(n => !n.read);
  const readNotifications = notifications.filter(n => n.read);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600 mt-1">
            {unreadNotifications.length} unread notifications
          </p>
        </div>
        <button className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium">
          <Check className="w-4 h-4" />
          <span>Mark all as read</span>
        </button>
      </div>

      {/* Unread Notifications */}
      {unreadNotifications.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Bell className="w-5 h-5 mr-2" />
            New Notifications
          </h2>
          {unreadNotifications.map((notification) => {
            const Icon = getNotificationIcon(notification.type);
            const colorClass = getNotificationColor(notification.type);
            
            return (
              <div
                key={notification.id}
                className={`border rounded-xl p-4 ${colorClass}`}
              >
                <div className="flex items-start space-x-3">
                  <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{notification.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center text-xs text-gray-500">
                        <Clock className="w-3 h-3 mr-1" />
                        {new Date(notification.createdAt).toLocaleString()}
                      </div>
                      <button
                        onClick={() => markNotificationRead(notification.id)}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Mark as read
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Read Notifications */}
      {readNotifications.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Earlier</h2>
          {readNotifications.map((notification) => {
            const Icon = getNotificationIcon(notification.type);
            
            return (
              <div
                key={notification.id}
                className="bg-white border border-gray-200 rounded-xl p-4 opacity-75"
              >
                <div className="flex items-start space-x-3">
                  <Icon className="w-5 h-5 mt-0.5 text-gray-400 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-700">{notification.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{notification.message}</p>
                    <div className="flex items-center text-xs text-gray-400 mt-3">
                      <Clock className="w-3 h-3 mr-1" />
                      {new Date(notification.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {notifications.length === 0 && (
        <div className="text-center py-12">
          <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-xl text-gray-500">No notifications</p>
          <p className="text-gray-400">You're all caught up!</p>
        </div>
      )}
    </div>
  );
}