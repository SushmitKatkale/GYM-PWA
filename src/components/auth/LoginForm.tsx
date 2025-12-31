import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { LogIn, Mail, Lock, Eye, EyeOff, UserCheck } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { authService } from '../../services/authService';
import { trainerService } from '../../services/trainerService';
import { BrandLogo } from '../common/BrandLogo';
import { BRAND } from '../../constants/branding';

interface LoginFormProps {
  onToggleMode: () => void;
}

export function LoginForm({ onToggleMode }: LoginFormProps) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isInvitationLogin, setIsInvitationLogin] = useState(false);
  const [invitationToken, setInvitationToken] = useState<string | null>(null);
  
  const { login, isLoading, error: authError, clearError } = useAuthStore();

  // Handle URL parameters for invitation login
  useEffect(() => {
    const token = searchParams.get('invitation_token');
    const email = searchParams.get('email');
    
    if (token && email) {
      setIsInvitationLogin(true);
      setInvitationToken(token);
      setFormData(prev => ({ ...prev, email: decodeURIComponent(email) }));
    }
  }, [searchParams]);

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

      if (success) {
        // If this is an invitation login, automatically accept the invitation
        if (isInvitationLogin && invitationToken) {
          try {
            const response = await trainerService.acceptInvitation(invitationToken);
            if (response.success) {
              // Redirect to trainer dashboard or success page
              navigate('/dashboard?invitation_accepted=true');
              return;
            } else {
              setError(`Login successful, but invitation acceptance failed: ${response.message}`);
            }
          } catch (inviteErr: any) {
            console.error('Invitation acceptance error:', inviteErr);
            setError(`Login successful, but invitation acceptance failed: ${inviteErr.message}`);
          }
        }
        // Normal login redirect happens automatically via auth store
      } else if (!authError) {
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
          {isInvitationLogin ? (
            <>
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserCheck className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="heading-md text-gray-900 font-poppins">Accept Trainer Invitation</h2>
              <p className="text-gray-600 mt-2 font-opensans">
                Please sign in with your trainer credentials to accept the gym invitation
              </p>
            </>
          ) : (
            <>
              <h2 className="heading-md text-gray-900 font-poppins">Welcome</h2>
              <p className="text-gray-600 mt-2 font-opensans">Sign in to continue!</p>
            </>
          )}
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