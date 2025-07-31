import React, { useState } from 'react';
import { Bell, Menu, X, LogOut, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';

interface NavbarProps {
  onMenuToggle: () => void;
  isMobileMenuOpen: boolean;
}

export function Navbar({ onMenuToggle, isMobileMenuOpen }: NavbarProps) {
  const { user, logout } = useAuth();
  const { notifications } = useApp();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  const unreadCount = notifications.filter(n => !n.read).length;

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
          <div className="flex items-center">
            <button
              onClick={onMenuToggle}
              className="lg:hidden text-white hover:bg-white/10 p-2 rounded-md transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <div className="flex-shrink-0 ml-2 lg:ml-0">
              <h1 className="text-white text-xl font-bold">Gym MS</h1>
            </div>
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

            {/* Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-3 text-white hover:bg-white/10 p-2 rounded-lg transition-colors"
              >
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5" />
                  </div>
                )}
                <div className="hidden sm:block text-left">
                  <div className="text-sm font-medium">{user?.name}</div>
                  <div className="text-xs opacity-75 capitalize">{user?.role}</div>
                </div>
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <div className="text-sm font-medium text-gray-900">{user?.name}</div>
                    <div className="text-xs text-gray-500">{user?.email}</div>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setShowProfileMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50 flex items-center"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}