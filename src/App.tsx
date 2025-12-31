import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import { LoginForm } from './components/auth/LoginForm';
import { RegisterForm } from './components/auth/RegisterForm';
import { OTPVerification } from './components/auth/OTPVerification';
import { PaymentStatus } from './components/features/PaymentStatus';
import { MainDashboard } from './components/layout/MainDashboard';

// Auth wrapper component
const AuthWrapper: React.FC = () => {
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'otp'>('login');
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState('');

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
};

function App() {
  const { user, initializeAuth } = useAuthStore();

  // Initialize authentication and register service worker
  useEffect(() => {
    // Initialize authentication state from stored tokens
    initializeAuth();
    
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(() => console.log('Service Worker registered'))
        .catch(error => console.error('Service Worker registration failed:', error));
    }
  }, [initializeAuth]);

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/gateway/status/:paymentId" element={<PaymentStatus />} />
        
        {/* Auth Routes */}
        <Route 
          path="/auth/login" 
          element={user ? <MainDashboard /> : <LoginForm onToggleMode={() => {}} />} 
        />
        <Route 
          path="/auth/register" 
          element={user ? <MainDashboard /> : <RegisterForm onToggleMode={() => {}} onRegistrationSuccess={() => {}} />} 
        />
        <Route 
          path="/" 
          element={user ? <MainDashboard /> : <AuthWrapper />} 
        />
        <Route 
          path="/dashboard" 
          element={user ? <MainDashboard /> : <AuthWrapper />} 
        />
        <Route 
          path="/discover" 
          element={user ? <MainDashboard /> : <AuthWrapper />} 
        />
        <Route 
          path="/my-subscriptions" 
          element={user ? <MainDashboard /> : <AuthWrapper />} 
        />
        
        {/* Catch all other routes */}
        <Route 
          path="*" 
          element={user ? <MainDashboard /> : <AuthWrapper />} 
        />
      </Routes>
    </Router>
  );
}

export default App;