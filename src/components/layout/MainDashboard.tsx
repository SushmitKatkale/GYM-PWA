import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { AdminDashboard } from '../dashboards/AdminDashboard';
import { OwnerDashboard } from '../dashboards/OwnerDashboard';
import { UserDashboard } from '../dashboards/UserDashboard';
import { GymDiscovery } from '../features/GymDiscovery';
import { QRCodePage } from '../features/QRCodePage';
import { NotificationsPage } from '../features/NotificationsPage';
import { CalendarBooking } from '../features/CalendarBooking';
import { MySubscriptions } from '../features/MySubscriptions';
import { AttendanceReports } from '../features/AttendanceReports';
import { WalletPage } from '../features/WalletPage';
import { ProfileSettings } from '../features/ProfileSettings';
import { AnalyticsPage } from '../features/AnalyticsPage';
import { MobileBottomNav } from './MobileBottomNav';
import GymManagement from '../features/GymManagement';
import { MemberManagement } from '../features/MemberManagement';
import { OwnerManagement } from '../features/OwnerManagement';
import { SubscriptionManagement } from '../features/SubscriptionManagement';
import { PaymentManagement } from '../features/PaymentManagement';
import { UserManagement } from '../features/UserManagement';
import { HelpFaq } from '../features/HelpFaq';
import { AdvertisementManagement } from '../features/advertisements/AdvertisementManagement';
import { AdminNotifications } from '../features/AdminNotifications';
import { Bell, User, Shield, Settings, Lock, LogOut, X } from 'lucide-react';
import { getAvatarImage } from '../../constants/images';
import { userService } from '../../services/userService';
import { useNotificationCount } from '../../hooks/useNotificationCount';

export const MainDashboard: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { unreadCount } = useNotificationCount();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showProfileSidebar, setShowProfileSidebar] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState('profile');
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);

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

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  // Handle view changes
  const handleViewChange = (view: string) => {
    setActiveView(view);
    setIsMobileMenuOpen(false);
  };

  // Render appropriate dashboard based on user role
  const renderMainContent = () => {
    if (!user) return null;

    switch (activeView) {
      case 'dashboard':
        switch (user.role) {
          case 'admin': return <AdminDashboard onNavigate={handleViewChange} />;
          case 'owner': return <OwnerDashboard />;
          case 'user': return <UserDashboard />;
          default: return <div>Invalid role</div>;
        }
        case 'discover':
          return <GymDiscovery />;
        case 'qr-code':
          return <QRCodePage />;
        case 'notifications':
          return <NotificationsPage />;
        case 'calendar':
          return <CalendarBooking />;
        case 'my-subscriptions':
          return <MySubscriptions />;
        case 'attendance':
          return <AttendanceReports />;
        case 'analytics':
          return <AnalyticsPage />;
        case 'settings':
          return <ProfileSettings 
            activeSettingsTab={activeSettingsTab} 
            onTabChange={setActiveSettingsTab}
          />;
        case 'wallet':
          return <WalletPage />;
        case 'gym-management':
        case 'my-gyms':
          return <GymManagement />;
        case 'member-management':
          return <MemberManagement />;
        case 'owner-management':
          return <OwnerManagement />;
        case 'subscription-management':
          return <SubscriptionManagement />;
        case 'payment-management':
          return <PaymentManagement />;
        case 'users':
          return <UserManagement />;
        case 'members':
          return <MemberManagement />;
        case 'advertisements':
          return <AdvertisementManagement />;
        case 'help':
          return <HelpFaq />;
        case 'admin-notifications':
          return <AdminNotifications isOpen={true} onClose={() => setActiveView('dashboard')} />;
    default:
      return (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Page Not Found</h2>
          <p className="text-gray-600">The requested page could not be found.</p>
        </div>
      );
    }
  };

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop/Tablet Navbar */}
      <div className="hidden md:block">
        <Navbar 
          onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          isMobileMenuOpen={isMobileMenuOpen}
          onNotificationClick={() => handleViewChange('notifications')}
        />
      </div>
      
      <div className="flex">
        {/* Desktop/Tablet Sidebar */}
        <div className="hidden md:block h-[calc(100vh-4rem)]">
          <Sidebar 
            activeView={activeView}
            onViewChange={handleViewChange}
            isOpen={isMobileMenuOpen}
          />
        </div>
        
        {/* Main Content */}
        <main className="flex-1 pb-24 md:pb-0">
          {/* Mobile Header */}
          <div className="md:hidden bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-40">
            <div className="flex items-center justify-between">
              <button 
                onClick={() => setShowProfileSidebar(true)} 
                className="flex items-center space-x-3 hover:bg-gray-50 p-2 rounded-lg transition-colors"
              >
                {/* Profile Photo/Avatar - Top Left */}
                {profileImageUrl ? (
                  <img
                    src={profileImageUrl}
                    alt="User Avatar"
                    className="w-10 h-10 rounded-full object-cover shadow-md"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = getAvatarImage(user?.gender, user?.avatar);
                    }}
                  />
                ) : (
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md">
                    {user?.firstName?.[0] || user?.email?.[0] || 'U'}
                  </div>
                )}
                <div className="text-left">
                  <h1 className="text-lg font-semibold text-gray-900">
                    {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.email || 'User'}
                  </h1>
                  <p className="text-xs text-gray-500 capitalize">{user?.id || ''}</p>
                </div>
              </button>
              
              {/* Brand Logo + Notifications */}
              <div className="flex items-center space-x-4">
                {/* Notifications Button */}
                <button
                  onClick={() => handleViewChange('notifications')}
                  className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors relative"
                >
                  <Bell className="w-6 h-6" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
          
          <div className="p-4 md:p-6">
            {renderMainContent()}
          </div>
        </main>
      </div>
      
      {/* Mobile Bottom Navigation */}
      <MobileBottomNav 
        activeMenu={activeView}
        setActiveMenu={handleViewChange}
      />
      
      {/* Profile Settings Sidebar */}
      {showProfileSidebar && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50" 
            onClick={() => setShowProfileSidebar(false)}
          ></div>
          
          {/* Sidebar */}
          <div className="absolute left-0 top-0 h-full w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out">
            {/* Sidebar Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                {profileImageUrl ? (
                  <img
                    src={profileImageUrl}
                    alt="User Avatar"
                    className="w-12 h-12 rounded-full object-cover shadow-md"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = getAvatarImage(user?.gender, user?.avatar);
                    }}
                  />
                ) : (
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-md">
                    {user?.firstName?.[0] || user?.email?.[0] || 'U'}
                  </div>
                )}
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.email || 'User'}
                  </h2>
                  <p className="text-sm text-gray-500">{user?.email || 'user@example.com'}</p>
                </div>
              </div>
              <button 
                onClick={() => setShowProfileSidebar(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            {/* Settings Menu */}
            <div className="py-4">
              <div className="px-4 mb-2">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Settings</h3>
              </div>
              
              {/* Profile Settings */}
              <button
                onClick={() => {
                  setActiveSettingsTab('profile');
                  handleViewChange('settings');
                  setShowProfileSidebar(false);
                }}
                className={`w-full flex items-center px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                  activeSettingsTab === 'profile' ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                }`}
              >
                <User className="w-5 h-5 text-gray-500 mr-3" />
                <span className="text-gray-700">Profile Information</span>
              </button>
              
              {/* Account Security */}
              <button
                onClick={() => {
                  setActiveSettingsTab('security');
                  handleViewChange('settings');
                  setShowProfileSidebar(false);
                }}
                className={`w-full flex items-center px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                  activeSettingsTab === 'security' ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                }`}
              >
                <Shield className="w-5 h-5 text-gray-500 mr-3" />
                <span className="text-gray-700">Account Security</span>
              </button>
              
              {/* Privacy Settings */}
              <button
                onClick={() => {
                  setActiveSettingsTab('privacy');
                  handleViewChange('settings');
                  setShowProfileSidebar(false);
                }}
                className={`w-full flex items-center px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                  activeSettingsTab === 'privacy' ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                }`}
              >
                <Lock className="w-5 h-5 text-gray-500 mr-3" />
                <span className="text-gray-700">Privacy Settings</span>
              </button>
              
              {/* Notification Preferences */}
              <button
                onClick={() => {
                  setActiveSettingsTab('notifications');
                  handleViewChange('settings');
                  setShowProfileSidebar(false);
                }}
                className={`w-full flex items-center px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                  activeSettingsTab === 'notifications' ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                }`}
              >
                <Bell className="w-5 h-5 text-gray-500 mr-3" />
                <span className="text-gray-700">Notification Preferences</span>
              </button>
              
              {/* App Preferences */}
              <button
                onClick={() => {
                  setActiveSettingsTab('preferences');
                  handleViewChange('settings');
                  setShowProfileSidebar(false);
                }}
                className={`w-full flex items-center px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                  activeSettingsTab === 'preferences' ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                }`}
              >
                <Settings className="w-5 h-5 text-gray-500 mr-3" />
                <span className="text-gray-700">App Preferences</span>
              </button>
            </div>
            
            {/* Logout Button */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
              <button 
                onClick={() => {
                  if (window.confirm('Are you sure you want to sign out?')) {
                    logout();
                    setShowProfileSidebar(false);
                    navigate('/');
                  }
                }}
                className="w-full flex items-center justify-center px-4 py-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
              >
                <LogOut className="w-5 h-5 mr-2" />
                <span className="font-medium">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
