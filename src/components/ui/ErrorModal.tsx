import React from 'react';
import { AlertCircle, X, RefreshCw } from 'lucide-react';

interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  error?: string;
  showRetry?: boolean;
  onRetry?: () => void;
  retryLabel?: string;
}

const ErrorModal: React.FC<ErrorModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  error,
  showRetry = false,
  onRetry,
  retryLabel = 'Try Again'
}) => {
  if (!isOpen) return null;

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full mx-4">
        <div className="p-6">
          {/* Error Icon */}
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>

          {/* Content */}
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {title}
            </h3>
            <p className="text-gray-600 mb-4">
              {message}
            </p>
            
            {/* Error Details */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-red-700 font-mono">
                  {error}
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            {showRetry && onRetry && (
              <button
                onClick={handleRetry}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                {retryLabel}
              </button>
            )}
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default ErrorModal;
