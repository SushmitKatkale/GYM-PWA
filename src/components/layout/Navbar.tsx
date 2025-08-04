import React, { useState, useEffect } from 'react';
import { Bell, Menu, X, User, AlertTriangle } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useNotificationStore } from '../../stores/notificationStore';
import { getAvatarImage } from '../../constants/images';
import { userService } from '../../services/userService';

interface NavbarProps {
  onMenuToggle: () => void;
  isMobileMenuOpen: boolean;
}

export function Navbar({ onMenuToggle, isMobileMenuOpen }: NavbarProps) {
  const { user } = useAuthStore();
  const { getUnreadCount } = useNotificationStore();
  const [showAlertsDropdown, setShowAlertsDropdown] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  
  const unreadCount = user ? getUnreadCount(user.id, user.role) : 0;
  const alertsCount = 3; // Mock alerts count

  // Load profile image
  useEffect(() => {
    const loadProfileImage = async () => {
      if (user) {
        try {
          const imageUrl = await userService.getProfileImageUrl();
          setProfileImageUrl(imageUrl);
        } catch (error) {
          // Profile image not found - use default avatar
          setProfileImageUrl(null);
        }
      } else {
        setProfileImageUrl(null);
      }
    };

    loadProfileImage();
  }, [user]);

  const getRoleColor = () => {
    switch (user?.role) {
      case 'admin': return 'from-purple-600 to-pink-600';
      case 'owner': return 'from-blue-600 to-indigo-600';
      case 'user': return 'from-green-600 to-teal-600';
      default: return 'from-gray-600 to-gray-700';
    }
  };

  return (
    <nav className={`bg-gradient-to-r ${getRoleColor()} shadow-lg`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <button
              onClick={onMenuToggle}
              className="lg:hidden text-white hover:bg-white/10 p-2 rounded-md transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            
            {/* Profile - moved to left */}
            <div className="flex items-center space-x-3 text-white">
              <img
                src={profileImageUrl || getAvatarImage(user?.gender, user?.avatar)}
                alt={user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.username || 'User Avatar'}
                className="w-8 h-8 rounded-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = getAvatarImage(user?.gender, user?.avatar);
                  setProfileImageUrl(null);
                }}
              />
              <div className="hidden sm:block text-left">
                <div className="text-sm font-medium">{user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.username || user?.email}</div>
                <div className="text-xs opacity-75 capitalize">{user?.id}</div>
              </div>
            </div>
          </div>

          {/* Center - App Title */}
          <div className="flex-shrink-0">
            <h1 className="text-white text-xl font-bold">Gym MS</h1>
          </div>

          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button className="text-white hover:bg-white/10 p-2 rounded-full transition-colors relative">
              <Bell className="w-6 h-6" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Alerts - moved to right */}
            <div className="relative">
              <button
                onClick={() => setShowAlertsDropdown(!showAlertsDropdown)}
                className="text-white hover:bg-white/10 p-2 rounded-full transition-colors relative"
              >
                <AlertTriangle className="w-6 h-6" />
                {alertsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {alertsCount}
                  </span>
                )}
              </button>

              {showAlertsDropdown && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-900">System Alerts</h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    <div className="px-4 py-3 hover:bg-gray-50 border-b border-gray-100">
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Equipment Maintenance Due</p>
                          <p className="text-xs text-gray-600">Treadmill #3 requires maintenance</p>
                          <p className="text-xs text-gray-400 mt-1">2 hours ago</p>
                        </div>
                      </div>
                    </div>
                    <div className="px-4 py-3 hover:bg-gray-50 border-b border-gray-100">
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">High Capacity Alert</p>
                          <p className="text-xs text-gray-600">Main gym area at 85% capacity</p>
                          <p className="text-xs text-gray-400 mt-1">15 minutes ago</p>
                        </div>
                      </div>
                    </div>
                    <div className="px-4 py-3 hover:bg-gray-50">
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">New Member Registration</p>
                          <p className="text-xs text-gray-600">5 new members registered today</p>
                          <p className="text-xs text-gray-400 mt-1">1 hour ago</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="px-4 py-2 border-t border-gray-100">
                    <button className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                      View all alerts
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}