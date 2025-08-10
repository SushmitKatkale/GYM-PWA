import React, { useState, useEffect } from 'react';
import { Bell, Check, X, Clock, AlertCircle, CheckCircle, Info, RefreshCw } from 'lucide-react';
import { notificationService, Notification } from '../../services/notificationService';
import { useAuthStore } from '../../stores/authStore';
import { useNotificationCount } from '../../hooks/useNotificationCount';
import { InlinePushNotificationPrompt } from './PushNotificationBanner';

interface NotificationsPageProps {
  onNavigateToSettings?: () => void;
}

export function NotificationsPage({ onNavigateToSettings }: NotificationsPageProps = {}) {
  const { user } = useAuthStore();
  const { unreadCount, refresh: refreshCount, decrement, reset } = useNotificationCount();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = async () => {
    if (!user) return;
    
    try {
      setError(null);
      const response = await notificationService.getUserNotifications({
        page: 1,
        limit: 50
      });
      
      if (response.success && response.data) {
        setNotifications(response.data.notifications);
        // Refresh the global notification count
        refreshCount();
      } else {
        setError(response.message || 'Failed to load notifications');
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError(err instanceof Error ? err.message : 'Failed to load notifications');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const response = await notificationService.markAsRead(notificationId);
      if (response.success) {
        // Update local state
        setNotifications(prev => prev.map(n => 
          n.id === notificationId ? { ...n, isRead: true, readAt: new Date().toISOString() } : n
        ));
        // Decrement global notification count
        decrement(1);
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const response = await notificationService.markAllAsRead();
      if (response.success) {
        // Update local state
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true, readAt: new Date().toISOString() })));
        // Reset global notification count to zero
        reset();
      }
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64 px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <span className="text-gray-600 text-sm sm:text-base">Loading notifications...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 px-4">
        <AlertCircle className="w-12 h-12 sm:w-16 sm:h-16 text-red-500 mx-auto mb-4" />
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Failed to Load Notifications</h3>
        <p className="text-gray-600 mb-4 text-sm sm:text-base max-w-md mx-auto">{error}</p>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors text-sm sm:text-base touch-manipulation"
        >
          Try Again
        </button>
      </div>
    );
  }

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

  const unreadNotifications = notifications.filter(n => !n.isRead);
  const readNotifications = notifications.filter(n => n.isRead);

  return (
    <div className="space-y-4 sm:space-y-6 px-4 sm:px-6 py-4 sm:py-6">
      {/* Push Notification Prompt */}
      <InlinePushNotificationPrompt onNavigateToSettings={onNavigateToSettings} />
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">
            {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-3">
          <button 
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center space-x-1 sm:space-x-2 text-gray-600 hover:text-gray-700 font-medium disabled:opacity-50 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="text-sm sm:text-base">Refresh</span>
          </button>
          <button 
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0}
            className="flex items-center space-x-1 sm:space-x-2 text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <Check className="w-4 h-4" />
            <span className="text-sm sm:text-base hidden sm:inline">Mark all as read</span>
            <span className="text-sm sm:hidden">Mark all</span>
          </button>
        </div>
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
                className={`border rounded-lg sm:rounded-xl p-3 sm:p-4 ${colorClass} touch-manipulation`}
              >
                <div className="flex items-start space-x-2 sm:space-x-3">
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 text-sm sm:text-base leading-tight">{notification.title}</h3>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1 leading-relaxed break-words">{notification.message}</p>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mt-3">
                      <div className="flex items-center text-xs text-gray-500">
                        <Clock className="w-3 h-3 mr-1 flex-shrink-0" />
                        <span className="truncate">{new Date(notification.createTimestamp).toLocaleDateString()} {new Date(notification.createTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="text-xs text-blue-600 hover:text-blue-700 active:text-blue-800 font-medium px-2 py-1 rounded touch-manipulation self-start sm:self-auto"
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
                className="bg-white border border-gray-200 rounded-lg sm:rounded-xl p-3 sm:p-4 opacity-75 touch-manipulation"
              >
                <div className="flex items-start space-x-2 sm:space-x-3">
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 text-gray-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-700 text-sm sm:text-base leading-tight">{notification.title}</h3>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1 leading-relaxed break-words">{notification.message}</p>
                    <div className="flex items-center text-xs text-gray-400 mt-3">
                      <Clock className="w-3 h-3 mr-1 flex-shrink-0" />
                      <span className="truncate">{new Date(notification.createTimestamp).toLocaleDateString()} {new Date(notification.createTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
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