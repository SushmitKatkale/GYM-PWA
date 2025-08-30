import React, { useState } from 'react';
import { LogIn, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { authService } from '../../services/authService';
import { BrandLogo } from '../common/BrandLogo';
import { BRAND } from '../../constants/branding';

interface LoginFormProps {
  onToggleMode: () => void;
}

export function LoginForm({ onToggleMode }: LoginFormProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  
  const { login, isLoading, error: authError, clearError } = useAuthStore();

  React.useEffect(() => {
    if (authError) {
      setError(authError);
      clearError();
    }
  }, [authError, clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Basic required field validation only
    if (!formData.email.trim() || !formData.password.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      const success = await login(formData.email, formData.password);

      // Error handling is now done through the store
      if (!success && !authError) {
        setError('Login failed. Please check your credentials and try again.');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err?.message || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md py-8 px-4">
        <div className="text-center mb-8">
          <h2 className="heading-md text-gray-900 font-poppins">Welcome</h2>
          <p className="text-gray-600 mt-2 font-opensans">Sign in to continue!</p>
        </div>


        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block body-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all font-body outline-none"
                placeholder="Enter your email address"
              />
            </div>
          </div>

          <div>
            <label className="block body-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all font-body outline-none"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-stone-800 hover:bg-stone-900 text-white button-base py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center font-opensans">
          <p className="text-stone-800">
            Don't have an account?{' '}
            <button
              onClick={onToggleMode}
              className="text-indigo-600 hover:text-indigo-700 font-button"
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}