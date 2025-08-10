import React, { useState, useEffect } from 'react';
import { Bell, X, Settings, Smartphone } from 'lucide-react';
import { pwaService } from '../../services/pwaService';
import { useAuthStore } from '../../stores/authStore';

interface PushNotificationBannerProps {
  onNavigateToSettings?: () => void;
}

export function PushNotificationBanner({ onNavigateToSettings }: PushNotificationBannerProps) {
  const { user } = useAuthStore();
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    checkNotificationStatus();
  }, [user]);

  const checkNotificationStatus = async () => {
    if (!user) {
      setIsVisible(false);
      return;
    }

    // Check if push notifications are supported
    const supported = pwaService.isPushNotificationSupported();
    setIsSupported(supported);

    if (!supported) {
      setIsVisible(false);
      return;
    }

    // Check if user has dismissed the banner
    const dismissed = localStorage.getItem('notification-banner-dismissed') === 'true';
    if (dismissed) {
      setIsDismissed(true);
      setIsVisible(false);
      return;
    }

    // Check notification permission and subscription status
    if ('Notification' in window) {
      const permission = Notification.permission;
      
      if (permission === 'granted') {
        // Check if there's an active subscription
        try {
          const subscription = await pwaService.getCurrentSubscription();
          setIsVisible(!subscription);
        } catch (error) {
          console.error('Error checking subscription:', error);
          setIsVisible(true);
        }
      } else if (permission === 'default') {
        // Show banner if permission hasn't been requested yet
        setIsVisible(true);
      } else {
        // Permission denied - don't show banner
        setIsVisible(false);
      }
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    localStorage.setItem('notification-banner-dismissed', 'true');
  };

  const handleClearDismissed = () => {
    localStorage.removeItem('notification-banner-dismissed');
    setIsDismissed(false);
    checkNotificationStatus();
  };

  // Reset dismissed state when user logs out/in
  useEffect(() => {
    if (user && isDismissed) {
      const dismissed = localStorage.getItem('notification-banner-dismissed') === 'true';
      if (!dismissed) {
        setIsDismissed(false);
        checkNotificationStatus();
      }
    }
  }, [user, isDismissed]);

  if (!isVisible || !user || !isSupported) {
    return null;
  }

  return (
    <div className="relative">
      {/* Main Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-3 sm:py-4">
            {/* Content */}
            <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
              {/* Icon */}
              <div className="flex-shrink-0">
                <div className="relative">
                  <Bell className="w-6 h-6 sm:w-7 sm:h-7" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                </div>
              </div>
              
              {/* Text Content */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm sm:text-base font-semibold truncate">
                      Stay Connected with FitEspero!
                    </h3>
                    <p className="text-xs sm:text-sm text-blue-100 mt-0.5">
                      Enable push notifications for instant updates on classes, workouts, and gym news.
                    </p>
                  </div>
                  
                  {/* CTA Button */}
                  <div className="mt-2 sm:mt-0 flex-shrink-0">
                    <button
                      onClick={() => {
                        if (onNavigateToSettings) {
                          onNavigateToSettings();
                        }
                      }}
                      className="inline-flex items-center space-x-2 bg-white text-blue-700 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium hover:bg-blue-50 active:bg-blue-100 transition-colors touch-manipulation"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Enable Now</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Dismiss Button */}
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 ml-3 p-1.5 hover:bg-white/10 rounded-lg transition-colors touch-manipulation"
              aria-label="Dismiss notification banner"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Subtle Animation */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse opacity-20 pointer-events-none"></div>
    </div>
  );
}

// Component to show a smaller inline banner in specific pages
interface InlinePushNotificationPromptProps {
  onNavigateToSettings?: () => void;
}

export function InlinePushNotificationPrompt({ onNavigateToSettings }: InlinePushNotificationPromptProps) {
  const { user } = useAuthStore();
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    checkIfShouldShow();
  }, [user]);

  const checkIfShouldShow = async () => {
    if (!user || !pwaService.isPushNotificationSupported()) {
      setShouldShow(false);
      return;
    }

    if ('Notification' in window && Notification.permission !== 'granted') {
      setShouldShow(true);
    } else {
      try {
        const subscription = await pwaService.getCurrentSubscription();
        setShouldShow(!subscription);
      } catch (error) {
        setShouldShow(true);
      }
    }
  };

  if (!shouldShow) {
    return null;
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <Smartphone className="w-6 h-6 text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-blue-900">
            Get Instant Updates!
          </h4>
          <p className="text-sm text-blue-700 mt-1">
            Enable push notifications to receive real-time updates about your gym activities, class schedules, and important announcements.
          </p>
          <div className="mt-3">
            <button
              onClick={() => {
                if (onNavigateToSettings) {
                  onNavigateToSettings();
                }
              }}
              className="inline-flex items-center space-x-2 text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              <span>Enable Notifications</span>
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
