import React from 'react';
import { BrandLogo } from './BrandLogo';
import { BRAND } from '../../constants/branding';

interface LoadingScreenProps {
  message?: string;
  showLogo?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingScreen({ 
  message = 'Loading...', 
  showLogo = true,
  size = 'md' 
}: LoadingScreenProps) {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          container: 'min-h-[200px]',
          spinner: 'w-8 h-8',
          text: 'text-sm'
        };
      case 'lg':
        return {
          container: 'min-h-screen',
          spinner: 'w-16 h-16',
          text: 'text-xl'
        };
      default:
        return {
          container: 'min-h-[400px]',
          spinner: 'w-12 h-12',
          text: 'text-base'
        };
    }
  };

  const classes = getSizeClasses();

  return (
    <div className={`${classes.container} flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50`}>
      <div className="text-center space-y-6 p-8">
        {showLogo && (
          <div className="flex justify-center mb-8">
            <BrandLogo 
              size={size === 'lg' ? 'xl' : 'lg'} 
              variant="full" 
              showTagline={true} 
            />
          </div>
        )}
        
        {/* Animated Spinner */}
        <div className="flex justify-center">
          <div className={`${classes.spinner} relative`}>
            <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-transparent border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        </div>

        {/* Loading Message */}
        <div className="space-y-2">
          <p className={`${classes.text} font-medium text-gray-700`}>
            {message}
          </p>
          <p className="text-sm text-gray-500">
            {BRAND.tagline}
          </p>
        </div>

        {/* Progress Dots */}
        <div className="flex justify-center space-x-2">
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    </div>
  );
}

// Compact inline loading component
export function InlineLoading({ 
  message = 'Loading...', 
  className = '' 
}: { 
  message?: string; 
  className?: string; 
}) {
  return (
    <div className={`flex items-center justify-center space-x-3 py-8 ${className}`}>
      <div className="w-6 h-6 relative">
        <div className="absolute inset-0 border-2 border-blue-200 rounded-full"></div>
        <div className="absolute inset-0 border-2 border-transparent border-t-blue-600 rounded-full animate-spin"></div>
      </div>
      <span className="text-gray-600 font-medium">{message}</span>
    </div>
  );
}

// Full page loading overlay
export function LoadingOverlay({ 
  message = 'Processing...', 
  isVisible = true 
}: { 
  message?: string; 
  isVisible?: boolean; 
}) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <BrandLogo size="lg" variant="icon" />
          </div>
          
          <div className="flex justify-center">
            <div className="w-8 h-8 relative">
              <div className="absolute inset-0 border-2 border-blue-200 rounded-full"></div>
              <div className="absolute inset-0 border-2 border-transparent border-t-blue-600 rounded-full animate-spin"></div>
            </div>
          </div>

          <div>
            <p className="text-lg font-medium text-gray-900 mb-2">{message}</p>
            <p className="text-sm text-gray-500">Please wait...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
