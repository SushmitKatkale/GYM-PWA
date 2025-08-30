import React, { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { Mail, Key, ArrowLeft } from 'lucide-react';

interface OTPVerificationProps {
  email: string;
  onVerified: () => void;
  onBackToRegister: () => void;
}

export function OTPVerification({ email, onVerified, onBackToRegister }: OTPVerificationProps) {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendMessage, setResendMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const { verifyOtp, resendOtp, isLoading, error: authError, clearError } = useAuthStore();

  React.useEffect(() => {
    if (authError) {
      setError(authError);
      clearError();
    }
  }, [authError, clearError]);

  // Countdown timer for resend cooldown
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendCooldown > 0) {
      interval = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendCooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!otp.trim()) {
      setError('Please enter the OTP');
      return;
    }

    if (otp.length !== 6) {
      setError('OTP must be 6 digits');
      return;
    }

    try {
      const success = await verifyOtp(email, otp);
      if (success) {
        setSuccessMessage('Email verified successfully! Your account has been created.');
        // Wait a bit to show success message before calling onVerified
        setTimeout(() => {
          onVerified();
        }, 2000);
      } else {
        setError('OTP verification failed. Please try again.');
      }
    } catch (err: any) {
      console.error('OTP verification error:', err);
      setError(err?.message || 'Verification failed. Please try again.');
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    
    setError('');
    setResendMessage('');
    
    try {
      const success = await resendOtp(email);
      if (success) {
        setResendMessage('OTP resent successfully!');
        setResendCooldown(60); // 60 second cooldown
      } else {
        setError('Failed to resend OTP. Please try again.');
      }
    } catch (err: any) {
      console.error('Resend OTP error:', err);
      setError(err?.message || 'Failed to resend OTP. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md py-8 px-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Key className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Verify Your Email</h2>
          <p className="text-gray-600 mt-2">We've sent a 6-digit code to</p>
          <p className="text-blue-600 font-medium">{email}</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {resendMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
            {resendMessage}
          </div>
        )}

        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Verification Code
            </label>
            <div className="relative">
              <input
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-center text-2xl tracking-widest font-mono outline-none"
                placeholder="000000"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-stone-800 hover:bg-stone-900 text-white button-base py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Verifying...' : 'Verify Code'}
          </button>
        </form>

        <div className="mt-6 text-center space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-2">Didn't receive the code?</p>
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={isLoading || resendCooldown > 0}
              className="text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resendCooldown > 0 
                ? `Resend OTP in ${resendCooldown}s` 
                : isLoading 
                  ? 'Sending...' 
                  : 'Resend OTP'
              }
            </button>
          </div>
          
          <button
            onClick={onBackToRegister}
            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Registration
          </button>
        </div>
      </div>
    </div>
  );
}
