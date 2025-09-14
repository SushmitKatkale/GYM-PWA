import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Smartphone, Monitor, Tablet, CheckCircle, AlertCircle } from 'lucide-react';
import { notificationService } from '../../services/notificationService';
import { pwaService } from '../../services/pwaService';
import { useAuthStore } from '../../stores/authStore';

interface PushSubscription {
  id: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  platform: string;
  lastUsed: string;
  createTimestamp: string;
}

export function PushNotificationManager() {
  const { user } = useAuthStore();
  const [subscriptions, setSubscriptions] = useState<PushSubscription[]>([]);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [testLoading, setTestLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [messageTimeout, setMessageTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadSubscriptions();
    checkNotificationPermission();
    
    return () => {
      if (messageTimeout) {
        clearTimeout(messageTimeout);
      }
    };
  }, [messageTimeout]);

  const loadSubscriptions = async () => {
    try {
      setIsLoading(true);
      const response = await notificationService.getUserSubscriptions();
      if (response.success) {
        setSubscriptions(response.data.subscriptions);
      }
    } catch (error) {
      console.error('Failed to load subscriptions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkNotificationPermission = async () => {
    if ('Notification' in window) {
      const hasPermission = Notification.permission === 'granted';
      setIsEnabled(hasPermission);
      
      // Also check if there's an active subscription
      if (hasPermission) {
        try {
          const currentSub = await pwaService.getCurrentSubscription();
          setIsEnabled(!!currentSub);
        } catch (error) {
          console.error('Error checking subscription:', error);
        }
      }
    }
  };

  const showMessage = (type: 'success' | 'error' | 'info', text: string) => {
    if (messageTimeout) {
      clearTimeout(messageTimeout);
    }
    
    setMessage({ type, text });
    
    const timeout = setTimeout(() => {
      setMessage(null);
      setMessageTimeout(null);
    }, 5000);
    
    setMessageTimeout(timeout);
  };

  const handleEnableNotifications = async () => {
    try {
      setIsLoading(true);
      
      // Check if push notifications are supported
      if (!pwaService.isPushNotificationSupported()) {
        showMessage('error', 'Push notifications are not supported in this browser');
        return;
      }
      
      const hasPermission = await pwaService.requestNotificationPermission();
      
      if (hasPermission) {
        const subscription = await pwaService.subscribeToPushNotifications();
        if (subscription) {
          await pwaService.sendSubscriptionToServer(subscription);
          await loadSubscriptions();
          setIsEnabled(true);
          showMessage('success', 'Push notifications enabled successfully!');
        } else {
          showMessage('error', 'Failed to create push subscription. Please try again.');
        }
      } else {
        showMessage('error', 'Notification permission denied. Please enable notifications in your browser settings.');
      }
    } catch (error) {
      console.error('Failed to enable notifications:', error);
      showMessage('error', 'Failed to enable push notifications. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisableNotifications = async () => {
    try {
      setIsLoading(true);
      
      // Try to get current subscription and unregister it
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        
        if (subscription) {
          await notificationService.unregisterPushSubscription(subscription.endpoint);
          await subscription.unsubscribe();
        }
      }
      
      await loadSubscriptions();
      setIsEnabled(false);
      showMessage('success', 'Push notifications disabled successfully!');
    } catch (error) {
      console.error('Failed to disable notifications:', error);
      showMessage('error', 'Failed to disable push notifications. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendTestNotification = async () => {
    try {
      setTestLoading(true);
      const response = await notificationService.sendTestNotification({
        title: 'Test Notification',
        message: 'This is a test push notification from FitEspero!',
        type: 'info'
      });

      if (response.success) {
        showMessage('success', 'Test notification sent successfully!');
      } else {
        showMessage('error', 'Failed to send test notification. Please try again.');
      }
    } catch (error) {
      console.error('Failed to send test notification:', error);
      showMessage('error', 'Failed to send test notification. Please check your connection.');
    } finally {
      setTestLoading(false);
    }
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'mobile': return Smartphone;
      case 'tablet': return Tablet;
      default: return Monitor;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!user) return null;

  return (
    <div className="w-full space-y-4 sm:space-y-6">
      <div className="bg-white rounded-sm shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex items-center space-x-3 mb-4 sm:mb-6">
          <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
          <h2 className="text-lg sm:text-xl font-medium text-gray-900">Push Notifications</h2>
        </div>

        {/* Status Message */}
        {message && (
          <div className={`mb-4 sm:mb-6 p-3 sm:p-4 rounded-sm flex items-start space-x-2 ${
            message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' :
            message.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' :
            'bg-blue-50 text-blue-700 border border-blue-200'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0" />
            )}
            <span className="text-sm sm:text-base leading-relaxed">{message.text}</span>
          </div>
        )}

        {/* Enable/Disable Section */}
        <div className="border-b border-gray-200 pb-4 sm:pb-6 mb-4 sm:mb-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-base sm:text-lg font-medium text-gray-900">
                {isEnabled ? 'Push Notifications Enabled' : 'Enable Push Notifications'}
              </h3>
              <p className="text-gray-600 mt-1 text-sm sm:text-base leading-relaxed">
                {isEnabled 
                  ? 'You\'ll receive real-time notifications about gym activities, classes, and updates.'
                  : 'Get instant notifications about gym activities, class reminders, and important updates.'
                }
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-2">
              <button
                onClick={isEnabled ? handleDisableNotifications : handleEnableNotifications}
                disabled={isLoading}
                className={`flex items-center justify-center space-x-2 px-4 sm:px-6 py-3 rounded-sm font-medium transition-colors disabled:opacity-50 touch-manipulation ${
                  isEnabled
                    ? 'bg-red-100 text-red-700 hover:bg-red-200 active:bg-red-300'
                    : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
                }`}
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                ) : (
                  isEnabled ? <BellOff className="w-4 h-4" /> : <Bell className="w-4 h-4" />
                )}
                <span>{isLoading ? 'Loading...' : isEnabled ? 'Disable Notifications' : 'Enable Notifications'}</span>
              </button>
              
              {/* {isEnabled && subscriptions.length > 0 && (
                <button
                  onClick={handleSendTestNotification}
                  disabled={testLoading}
                  className="flex items-center justify-center space-x-2 px-4 sm:px-6 py-3 text-sm bg-gray-100 text-gray-700 rounded-sm hover:bg-gray-200 active:bg-gray-300 disabled:opacity-50 transition-colors touch-manipulation"
                >
                  {testLoading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>}
                  <span>{testLoading ? 'Sending...' : 'Send Test'}</span>
                </button>
              )} */}
            </div>
          </div>
        </div>

        {/* Active Subscriptions */}
        {subscriptions.length > 0 && (
          <div>
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Active Devices</h3>
            <div className="space-y-3">
              {subscriptions.map((subscription) => {
                const DeviceIcon = getDeviceIcon(subscription.deviceType);
                return (
                  <div
                    key={subscription.id}
                    className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-sm"
                  >
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <div className="p-2 bg-white rounded-sm flex-shrink-0">
                        <DeviceIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-gray-900 capitalize text-sm sm:text-base truncate">
                          {subscription.deviceType} - {subscription.platform}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-500 truncate">
                          Last used: {formatDate(subscription.lastUsed)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Help Text */}
        {subscriptions.length === 0 && !isLoading && (
          <div className="text-center py-6 sm:py-8">
            <BellOff className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-3 sm:mb-4" />
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No Active Notifications</h3>
            <p className="text-sm sm:text-base text-gray-500 max-w-md mx-auto px-4">
              Enable push notifications to receive real-time updates about your gym activities, class schedules, and important announcements.
            </p>
          </div>
        )}
      </div>

      {/* Browser Support Info */}
      {/* <div className="bg-blue-50 border border-blue-200 rounded-sm p-3 sm:p-4">
        <div className="flex">
          <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mt-0.5 mr-2 sm:mr-3 flex-shrink-0" />
          <div>
            <h4 className="text-xs sm:text-sm font-medium text-blue-900">Browser Support</h4>
            <p className="text-xs sm:text-sm text-blue-700 mt-1 leading-relaxed">
              Push notifications work best on Chrome, Firefox, Edge, and Safari. Make sure you're using an updated browser version for the best experience.
            </p>
          </div>
        </div>
      </div> */}
    </div>
  );
}
