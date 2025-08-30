import React, { useState, useEffect } from 'react';
import { Bell, Menu, X, User, AlertTriangle } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useNotificationCount } from '../../hooks/useNotificationCount';
import { getAvatarImage } from '../../constants/images';
import { userService } from '../../services/userService';
import { BrandLogoLight } from '../common/BrandLogo';

interface NavbarProps {
  onMenuToggle: () => void;
  isMobileMenuOpen: boolean;
  onNotificationClick?: () => void;
}

export function Navbar({ onMenuToggle, isMobileMenuOpen, onNotificationClick }: NavbarProps) {
  const { user } = useAuthStore();
  const { unreadCount } = useNotificationCount();
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(user?.profileImage ?? null);

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

            {/* Brand Logo */}
            {/* <div className="hidden lg:block">
              <BrandLogoLight size="sm" variant="full" />
            </div> */}

            {/* Profile */}
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
                <div className="text-xs opacity-75 capitalize">{user?.role}</div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button 
              onClick={onNotificationClick}
              className="text-white hover:bg-white/10 p-2 rounded-full transition-colors relative"
            >
              <Bell className="w-6 h-6" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>
          </div>

        </div>
      </div>
    </nav>
  );
}