import React from 'react';
import { 
  Home, Users, Building, Calendar, QrCode, CreditCard, 
  BarChart3, Settings, MapPin, Bell, Clock, Wallet, UserCheck, Package, Megaphone, MessageCircle, HelpCircle, Dumbbell, Apple, PieChart, MessageSquare
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useNotificationCount } from '../../hooks/useNotificationCount';
import { BrandLogoLight } from '../common/BrandLogo';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  isOpen: boolean;
}

export function Sidebar({ activeView, onViewChange, isOpen }: SidebarProps) {
  const { user } = useAuthStore();
  const { unreadCount } = useNotificationCount();

  const getMenuItems = () => {
    const commonItems = [
      { id: 'dashboard', label: 'Dashboard', icon: Home },
      { id: 'notifications', label: 'Notifications', icon: Bell },
      { id: 'settings', label: 'Settings', icon: Settings }
    ];

    switch (user?.role) {
      case 'admin':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: Home },
          { id: 'admin-notifications', label: 'Notification Management', icon: MessageCircle },
          { id: 'gym-management', label: 'Gym Management', icon: Building },
          { id: 'exercise-management', label: 'Exercise Management', icon: Dumbbell },
          { id: 'diet-management', label: 'Diet Plan Management', icon: Apple },
          { id: 'diet-analytics', label: 'Diet Analytics', icon: PieChart },
          { id: 'diet-change-management', label: 'Diet Change Requests', icon: MessageSquare },
          // { id: 'subscription-management', label: 'Subscription Management', icon: Package },
          { id: 'users', label: 'User Management', icon: Users },
          { id: 'advertisements', label: 'Advertisement Management', icon: Megaphone },
          { id: 'faq-management', label: 'FAQ Management', icon: HelpCircle },
          { id: 'payment-management', label: 'Payment Management', icon: CreditCard },
          { id: 'analytics', label: 'Analytics', icon: BarChart3 },
          ...commonItems.slice(1)
        ];
      
      case 'owner':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: Home },
          { id: 'my-gyms', label: 'My Gyms', icon: Building },
          { id: 'members', label: 'Members', icon: Users },
          { id: 'calendar', label: 'Schedule', icon: Calendar },
          { id: 'attendance', label: 'Attendance', icon: Clock },
          { id: 'analytics', label: 'Reports', icon: BarChart3 },
          ...commonItems.slice(1)
        ];
      
      case 'user':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: Home },
          { id: 'discover', label: 'Find Gyms', icon: MapPin },
          { id: 'my-subscriptions', label: 'Subscriptions', icon: CreditCard },
          { id: 'qr-code', label: 'QR Check-in', icon: QrCode },
          { id: 'calendar', label: 'My Schedule', icon: Calendar },
          { id: 'attendance', label: 'My Attendance', icon: Clock },
          { id: 'diet-browse', label: 'Browse Diet Plans', icon: Apple },
          { id: 'diet-plans', label: 'My Diet Plans', icon: UserCheck },
          { id: 'wallet', label: 'Wallet & Payments', icon: Wallet },
          ...commonItems.slice(1)
        ];
      
      default:
        return commonItems;
    }
  };

  const menuItems = getMenuItems();

  const getRoleColor = () => {
    switch (user?.role) {
      case 'admin': return 'bg-purple-600 border-purple-700';
      case 'owner': return 'bg-blue-600 border-blue-700';
      case 'user': return 'bg-green-600 border-green-700';
      default: return 'bg-gray-600 border-gray-700';
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => {}}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        absolute inset-y-0 left-0 z-50 w-80 ${getRoleColor()} transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col min-h-fit">
          {/* Brand Header */}
          <div className="px-4 py-6 border-b border-white/10">
            <BrandLogoLight size="lg" variant="full" showTagline={true} />
          </div>
          
          <nav className="flex-1 px-4 py-6 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  className={`
                    w-full flex items-center justify-between px-4 py-3 text-left rounded-lg transition-colors
                    ${isActive 
                      ? 'bg-white/20 text-white font-medium' 
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                    }
                  `}
                >
                  <div className="flex items-center">
                    <Icon className="w-5 h-5 mr-3" />
                    {item.label}
                  </div>
                  {item.id === 'notifications' && unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  );
}
