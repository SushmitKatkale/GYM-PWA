import React, { useState, useEffect } from 'react';
import { useAuthStore } from './stores/authStore';
import { LoginForm } from './components/auth/LoginForm';
import { RegisterForm } from './components/auth/RegisterForm';
import { OTPVerification } from './components/auth/OTPVerification';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { AdminDashboard } from './components/dashboards/AdminDashboard';
import { OwnerDashboard } from './components/dashboards/OwnerDashboard';
import { UserDashboard } from './components/dashboards/UserDashboard';
import { GymDiscovery } from './components/features/GymDiscovery';
import { QRCodePage } from './components/features/QRCodePage';
import { NotificationsPage } from './components/features/NotificationsPage';
import { CalendarBooking } from './components/features/CalendarBooking';
import { SubscriptionPage } from './components/features/SubscriptionPage';
import { AttendanceReports } from './components/features/AttendanceReports';
import { WalletPage } from './components/features/WalletPage';
import { ProfileSettings } from './components/features/ProfileSettings';
import { AnalyticsPage } from './components/features/AnalyticsPage';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import GymManagement from './components/features/GymManagement';
import { MemberManagement } from './components/features/MemberManagement';
import { OwnerManagement } from './components/features/OwnerManagement';
import { SubscriptionManagement } from './components/features/SubscriptionManagement';
import { HelpFaq } from './components/features/HelpFaq';
import { AlertTriangle, Bell, User, Shield, Settings, Lock, LogOut, X } from 'lucide-react';

function App() {
  const { user, logout } = useAuthStore();
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'otp'>('login');
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState('');
  const [activeView, setActiveView] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showMobileAlerts, setShowMobileAlerts] = useState(false);
  const [showProfileSidebar, setShowProfileSidebar] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState('profile');
  
  const alertsCount = 3; // Mock alerts count

  // Register service worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(() => console.log('Service Worker registered'))
        .catch(error => console.error('Service Worker registration failed:', error));
    }
  }, []);

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
          case 'admin': return <AdminDashboard />;
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
            return <SubscriptionPage />;
          case 'attendance':
            return <AttendanceReports />;
          case 'analytics':
            return <AnalyticsPage />;
          case 'settings':
            return <ProfileSettings activeSettingsTab={activeSettingsTab} />;
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
          case 'help':
            return <HelpFaq />;
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
    switch (authMode) {
      case 'login':
        return <LoginForm onToggleMode={() => setAuthMode('register')} />;
      case 'register':
        return (
          <RegisterForm 
            onToggleMode={() => setAuthMode('login')} 
            onRegistrationSuccess={(email: string) => {
              setPendingVerificationEmail(email);
              setAuthMode('otp');
            }}
          />
        );
      case 'otp':
        return (
          <OTPVerification 
            email={pendingVerificationEmail}
            onVerified={() => {
              setAuthMode('login');
              setPendingVerificationEmail('');
            }}
            onBackToRegister={() => {
              setAuthMode('register');
              setPendingVerificationEmail('');
            }}
          />
        );
      default:
        return <LoginForm onToggleMode={() => setAuthMode('register')} />;
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop/Tablet Navbar */}
      <div className="hidden md:block">
        <Navbar 
          onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          isMobileMenuOpen={isMobileMenuOpen}
        />
      </div>
      
      <div className="flex">
        {/* Desktop/Tablet Sidebar */}
        <div className="hidden md:block">
          <Sidebar 
            activeView={activeView}
            onViewChange={handleViewChange}
            isOpen={isMobileMenuOpen}
          />
        </div>
        
        {/* Main Content */}
        <main className="flex-1 md:lg:ml-64 pb-24 md:pb-0">
          {/* Mobile Header */}
          <div className="md:hidden bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-40">
            <div className="flex items-center justify-between">
              <button 
                onClick={() => setShowProfileSidebar(true)} 
                className="flex items-center space-x-3 hover:bg-gray-50 p-2 rounded-lg transition-colors"
              >
                {/* Profile Photo/Avatar - Top Left */}
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md">
                  {user?.name?.[0] || 'U'}
                </div>
                <div className="text-left">
                  <h1 className="text-lg font-semibold text-gray-900">
                    {user?.name || 'User'}
                  </h1>
                  <p className="text-xs text-gray-500 capitalize">{user?.role || 'Member'}</p>
                </div>
              </button>
              
              {/* Notifications - Top Right */}
              <div className="flex items-center">
                {/* Notifications Button */}
                <button
                  onClick={() => handleViewChange('notifications')}
                  className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors relative"
                >
                  <Bell className="w-6 h-6" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                    2
                  </span>
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
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-md">
                  {user?.name?.[0] || 'U'}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{user?.name || 'User'}</h2>
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
}

export default App;