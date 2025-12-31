import React from 'react';
import { AlertCircle, RefreshCw, X } from 'lucide-react';

// Development environment configuration
const isDevelopment = import.meta.env.VITE_NODE_ENV === 'development' || import.meta.env.DEV;
const showApiErrors = import.meta.env.VITE_SHOW_API_ERRORS === 'true';
const debugMode = import.meta.env.VITE_DEBUG_MODE === 'true';

export interface ApiError {
  endpoint?: string;
  method?: string;
  status?: number;
  message: string;
  details?: any;
  timestamp?: Date;
}

export const createApiError = (
  endpoint: string,
  method: string = 'GET',
  error: any
): ApiError => {
  return {
    endpoint,
    method,
    status: error?.response?.status || error?.status,
    message: error?.message || error?.response?.data?.message || 'Unknown error',
    details: debugMode ? error : undefined,
    timestamp: new Date()
  };
};

interface DevelopmentErrorDisplayProps {
  error: ApiError;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
}

export const DevelopmentErrorDisplay: React.FC<DevelopmentErrorDisplayProps> = ({
  error,
  onRetry,
  onDismiss,
  className = ''
}) => {
  // Don't show errors in production unless explicitly enabled
  if (!isDevelopment && !showApiErrors) {
    return null;
  }

  return (
    <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-start space-x-3">
        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-red-800">
              API Error - {error.method} {error.endpoint}
            </h4>
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="text-red-400 hover:text-red-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          
          <div className="text-sm text-red-700 space-y-1">
            <p><strong>Message:</strong> {error.message}</p>
            {error.status && (
              <p><strong>Status:</strong> {error.status}</p>
            )}
            {error.timestamp && (
              <p><strong>Time:</strong> {error.timestamp.toLocaleTimeString()}</p>
            )}
          </div>

          {debugMode && error.details && (
            <details className="mt-2">
              <summary className="text-sm text-red-600 cursor-pointer hover:text-red-800">
                Debug Details
              </summary>
              <pre className="mt-1 text-xs text-red-600 bg-red-100 p-2 rounded overflow-x-auto">
                {JSON.stringify(error.details, null, 2)}
              </pre>
            </details>
          )}

          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-3 inline-flex items-center space-x-2 px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Retry API Call</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

interface DevelopmentErrorBannerProps {
  errors: ApiError[];
  onClearErrors?: () => void;
}

export const DevelopmentErrorBanner: React.FC<DevelopmentErrorBannerProps> = ({
  errors,
  onClearErrors
}) => {
  // Don't show in production
  if (!isDevelopment && !showApiErrors) {
    return null;
  }

  if (!errors.length) return null;

  return (
    <div className="bg-red-600 text-white px-4 py-2 text-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <AlertCircle className="w-4 h-4" />
          <span>
            {errors.length} API Error{errors.length !== 1 ? 's' : ''} - Check console for details
          </span>
        </div>
        {onClearErrors && (
          <button
            onClick={onClearErrors}
            className="text-red-200 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

// Console logging for development
export const logApiError = (error: ApiError) => {
  if (!isDevelopment && !debugMode) return;

  console.group(`🚨 API Error: ${error.method} ${error.endpoint}`);
  console.error('Message:', error.message);
  if (error.status) console.error('Status:', error.status);
  console.error('Timestamp:', error.timestamp);
  if (error.details) console.error('Details:', error.details);
  console.groupEnd();
};

// Hook for managing development errors
export const useDevelopmentErrors = () => {
  const [errors, setErrors] = React.useState<ApiError[]>([]);

  const addError = React.useCallback((error: ApiError) => {
    logApiError(error);
    setErrors(prev => [...prev, error]);
  }, []);

  const clearErrors = React.useCallback(() => {
    setErrors([]);
  }, []);

  const removeError = React.useCallback((index: number) => {
    setErrors(prev => prev.filter((_, i) => i !== index));
  }, []);

  return {
    errors,
    addError,
    clearErrors,
    removeError,
    hasErrors: errors.length > 0
  };
};

// Utility functions
export const isProduction = () => {
  return import.meta.env.PROD || import.meta.env.VITE_NODE_ENV === 'production';
};

export const shouldShowErrors = () => {
  return isDevelopment || showApiErrors;
};

export const shouldShowDebugInfo = () => {
  return debugMode;
};