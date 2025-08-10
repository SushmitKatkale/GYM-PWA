import React, { useState } from 'react';
import { 
  Home, 
  Calendar, 
  QrCode, 
  CreditCard, 
  User, 
  Building2,
  Users,
  Settings,
  Wallet,
  MoreHorizontal,
  Bell,
  BarChart3,
  HelpCircle,
  MapPin,
  UserCheck,
  CreditCard as Subscription
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useNotificationCount } from '../../hooks/useNotificationCount';

interface MobileBottomNavProps {
  activeMenu: string;
  setActiveMenu: (menu: string) => void;
}

export function MobileBottomNav({ activeMenu, setActiveMenu }: MobileBottomNavProps) {
  const { user } = useAuthStore();
  const { unreadCount } = useNotificationCount();
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  // Define main navigation items (max 5 for mobile)
  const getMainNavItems = () => {
    const moreItems = getMoreMenuItems();
    
    if (user?.role === 'admin') {
      const baseItems = [
        { id: 'dashboard', label: 'Dashboard', icon: Home },
        { id: 'gym-management', label: 'Gyms', icon: Building2 },
        // { id: 'member-management', label: 'Members', icon: Users },
        { id: 'users', label: 'Uers', icon: Users },
        { id: 'analytics', label: 'Analytics', icon: BarChart3 }
      ];
      
      // If only one item in more menu, show it directly
      if (moreItems.length === 1) {
        return [...baseItems, moreItems[0]];
      }
      // Otherwise show More tab
      return [...baseItems, { id: 'more', label: 'More', icon: MoreHorizontal, isMore: true }];
    }

    if (user?.role === 'owner') {
      const baseItems = [
        { id: 'dashboard', label: 'Dashboard', icon: Home },
        { id: 'my-gyms', label: 'My Gyms', icon: Building2 },
        { id: 'member-management', label: 'Members', icon: Users },
        { id: 'analytics', label: 'Reports', icon: BarChart3 }
      ];
      
      // If only one item in more menu, show it directly
      if (moreItems.length === 1) {
        return [...baseItems, moreItems[0]];
      }
      // Otherwise show More tab
      return [...baseItems, { id: 'more', label: 'More', icon: MoreHorizontal, isMore: true }];
    }

    // Regular User role - most common use case
    const baseItems = [
      { id: 'dashboard', label: 'Home', icon: Home },
      { id: 'calendar', label: 'Classes', icon: Calendar },
      { id: 'qr-code', label: 'Check-in', icon: QrCode },
      { id: 'discover', label: 'Discover', icon: MapPin }
    ];
    
    // If only one item in more menu, show it directly
    if (moreItems.length === 1) {
      return [...baseItems, moreItems[0]];
    }
    // Otherwise show More tab
    return [...baseItems, { id: 'more', label: 'More', icon: MoreHorizontal, isMore: true }];
  };

  // Define secondary menu items
  const getMoreMenuItems = () => {
    if (user?.role === 'admin') {
      return [
        { id: 'payment-management', label: 'Payments', icon: CreditCard },
        // { id: 'users', label: 'User Mgmt', icon: UserCheck },
        { id: 'help', label: 'Support', icon: HelpCircle }
      ];
    }

    if (user?.role === 'owner') {
      return [
        { id: 'help', label: 'Support', icon: HelpCircle }
      ];
    }

    // Regular User
    return [
      { id: 'notifications', label: 'Notifications', icon: Bell },
      { id: 'wallet', label: 'Wallet', icon: Wallet },
      { id: 'my-subscriptions', label: 'Subscriptions', icon: Subscription },
      { id: 'attendance', label: 'My Attendance', icon: BarChart3 },
      { id: 'help', label: 'Support', icon: HelpCircle }
    ];
  };

  const mainNavItems = getMainNavItems();
  const moreMenuItems = getMoreMenuItems();

  const handleNavClick = (item: any) => {
    if (item.isMore) {
      setShowMoreMenu(!showMoreMenu);
    } else {
      setActiveMenu(item.id);
      setShowMoreMenu(false);
    }
  };

  return (
    <>
      {/* More Menu Overlay */}
      {showMoreMenu && (
        <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setShowMoreMenu(false)} />
      )}
      
      {/* More Menu Panel */}
      {showMoreMenu && (
        <div className="md:hidden fixed bottom-16 left-4 right-4 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 max-h-80 overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">More Options</h3>
              <button 
                onClick={() => setShowMoreMenu(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {moreMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeMenu === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item)}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-200 relative ${
                      isActive
                        ? 'bg-blue-50 text-blue-600 border-2 border-blue-200'
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-2 border-transparent'
                    }`}
                  >
                    <div className="relative">
                      <Icon className={`w-6 h-6 mb-2 ${
                        isActive ? 'text-blue-600' : 'text-gray-600'
                      }`} />
                      {item.id === 'notifications' && unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                      )}
                    </div>
                    <span className={`text-sm font-medium text-center ${
                      isActive ? 'text-blue-600' : 'text-gray-700'
                    }`}>
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-1 py-2 z-50 safe-area-bottom">
        <div className="flex items-center justify-around">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = !item.isMore && activeMenu === item.id;
            const isMoreActive = item.isMore && showMoreMenu;
            
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item)}
                className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 min-w-0 flex-1 touch-target relative ${
                  isActive || isMoreActive
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 active:bg-gray-100'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 mb-1 ${
                    isActive || isMoreActive ? 'text-blue-600' : 'text-gray-500'
                  }`} />
                  {item.id === 'notifications' && unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </div>
                <span className={`text-xs font-medium truncate max-w-full ${
                  isActive || isMoreActive ? 'text-blue-600' : 'text-gray-500'
                }`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
