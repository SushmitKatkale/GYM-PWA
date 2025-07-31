import React, { useState, useEffect } from 'react';
import { LoginForm } from './components/auth/LoginForm';
import { RegisterForm } from './components/auth/RegisterForm';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { AdminDashboard } from './components/dashboards/AdminDashboard';
import { OwnerDashboard } from './components/dashboards/OwnerDashboard';
import { UserDashboard } from './components/dashboards/UserDashboard';
import { GymDiscovery } from './components/features/GymDiscovery';
import { QRCodePage } from './components/features/QRCodePage';
import { NotificationsPage } from './components/features/NotificationsPage';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AppProvider } from './contexts/AppContext';

function AppContent() {
  const { user } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [activeView, setActiveView] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
      case 'gyms':
      case 'my-gyms':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Gym Management</h2>
            <p className="text-gray-600">This feature is coming soon!</p>
          </div>
        );
      case 'users':
      case 'members':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">User Management</h2>
            <p className="text-gray-600">This feature is coming soon!</p>
          </div>
        );
      case 'my-subscriptions':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">My Subscriptions</h2>
            <p className="text-gray-600">This feature is coming soon!</p>
          </div>
        );
      case 'calendar':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Calendar & Scheduling</h2>
            <p className="text-gray-600">This feature is coming soon!</p>
          </div>
        );
      case 'attendance':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Attendance Reports</h2>
            <p className="text-gray-600">This feature is coming soon!</p>
          </div>
        );
      case 'analytics':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Analytics & Reports</h2>
            <p className="text-gray-600">This feature is coming soon!</p>
          </div>
        );
      case 'settings':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Settings</h2>
            <p className="text-gray-600">This feature is coming soon!</p>
          </div>
        );
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
    return authMode === 'login' 
      ? <LoginForm onToggleMode={() => setAuthMode('register')} />
      : <RegisterForm onToggleMode={() => setAuthMode('login')} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar 
        onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        isMobileMenuOpen={isMobileMenuOpen}
      />
      
      <div className="flex">
        <Sidebar 
          activeView={activeView}
          onViewChange={handleViewChange}
          isOpen={isMobileMenuOpen}
        />
        
        <main className="flex-1 lg:ml-64">
          <div className="p-6">
            {renderMainContent()}
          </div>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </AuthProvider>
  );
}

export default App;