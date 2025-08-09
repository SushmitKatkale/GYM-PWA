import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle, 
  RefreshCw, 
  ArrowRight,
  CreditCard,
  Building,
  Calendar,
  User
} from 'lucide-react';
import { paymentStatusService, PaymentStatusResponse } from '../../services/paymentStatusService';

type PaymentStatus = 'loading' | 'completed' | 'failed' | 'cancelled' | 'pending' | 'error';

export const PaymentStatus: React.FC = () => {
  const { paymentId } = useParams<{ paymentId: string }>();
  const navigate = useNavigate();
  const [status, setStatus] = useState<PaymentStatus>('loading');
  const [paymentData, setPaymentData] = useState<PaymentStatusResponse['data'] | null>(null);
  const [message, setMessage] = useState('Checking payment status...');
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Auto-refresh for pending payments
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    if (!paymentId) {
      setStatus('error');
      setMessage('Invalid payment ID');
      return;
    }

    checkPaymentStatus();
  }, [paymentId]);

  // Auto-refresh countdown for pending payments
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (status === 'pending' && autoRefresh && countdown > 0) {
      interval = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else if (status === 'pending' && autoRefresh && countdown === 0) {
      handleRefresh();
    }

    return () => clearInterval(interval);
  }, [status, autoRefresh, countdown]);

  const checkPaymentStatus = async () => {
    try {
      setStatus('loading');
      const response = await paymentStatusService.getPaymentStatus(paymentId!);
      
      if (response.success && response.data) {
        setPaymentData(response.data);
        setStatus(response.data.status);
        setMessage(response.data.message);
        
        // Reset countdown for pending status
        if (response.data.status === 'pending') {
          setCountdown(10);
        } else {
          setAutoRefresh(false);
        }
      } else {
        throw new Error(response.message || 'Payment status check failed');
      }
    } catch (error: any) {
      console.error('Payment status check error:', error);
      setStatus('error');
      setMessage(error.message || 'Failed to check payment status');
      setAutoRefresh(false);
    }
  };

  const handleRefresh = async () => {
    setIsRetrying(true);
    setRetryCount(prev => prev + 1);
    
    try {
      await checkPaymentStatus();
    } finally {
      setIsRetrying(false);
    }
  };

  const handleRetryPayment = () => {
    // Navigate back to subscription selection or payment page
    navigate('/my-subscriptions');
  };

  const handleContinue = () => {
    if (paymentData?.nextAction === 'redirect_to_gym') {
      // Navigate to gym details or dashboard
      navigate('/discover');
    } else {
      // Default to dashboard
      navigate('/dashboard');
    }
  };

  const renderIcon = () => {
    switch (status) {
      case 'loading':
        return <RefreshCw className="w-16 h-16 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-16 h-16 text-green-500" />;
      case 'failed':
      case 'cancelled':
        return <XCircle className="w-16 h-16 text-red-500" />;
      case 'pending':
        return <Clock className="w-16 h-16 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="w-16 h-16 text-red-500" />;
      default:
        return <RefreshCw className="w-16 h-16 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'failed':
      case 'cancelled':
      case 'error': return 'text-red-600';
      case 'pending': return 'text-yellow-600';
      default: return 'text-blue-600';
    }
  };

  const getBackgroundColor = () => {
    switch (status) {
      case 'completed': return 'bg-green-50';
      case 'failed':
      case 'cancelled':
      case 'error': return 'bg-red-50';
      case 'pending': return 'bg-yellow-50';
      default: return 'bg-blue-50';
    }
  };

  return (
    <div className={`min-h-screen ${getBackgroundColor()} flex items-center justify-center p-4`}>
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
        {/* Status Icon */}
        <div className="text-center mb-6">
          {renderIcon()}
        </div>

        {/* Status Title */}
        <div className="text-center mb-4">
          <h1 className={`text-2xl font-bold ${getStatusColor()}`}>
            {status === 'loading' && 'Checking Payment...'}
            {status === 'completed' && 'Payment Successful!'}
            {status === 'failed' && 'Payment Failed'}
            {status === 'cancelled' && 'Payment Cancelled'}
            {status === 'pending' && 'Payment Processing...'}
            {status === 'error' && 'Payment Status Unknown'}
          </h1>
        </div>

        {/* Message */}
        <div className="text-center mb-6">
          <p className="text-gray-600">{message}</p>
        </div>

        {/* Payment Details */}
        {paymentData && (
          <div className="space-y-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 flex items-center">
                  <CreditCard className="w-4 h-4 mr-1" />
                  Payment ID
                </span>
                <span className="text-sm font-medium">{paymentData.paymentId}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Amount</span>
                <span className="text-sm font-medium">₹{paymentData.amount}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Gateway</span>
                <span className="text-sm font-medium capitalize">{paymentData.gateway}</span>
              </div>

              {paymentData.gym && (
                <div className="flex items-start justify-between">
                  <span className="text-sm text-gray-500 flex items-center">
                    <Building className="w-4 h-4 mr-1" />
                    Gym
                  </span>
                  <div className="text-right">
                    <div className="text-sm font-medium">{paymentData.gym.name}</div>
                    <div className="text-xs text-gray-500">{paymentData.gym.address}</div>
                  </div>
                </div>
              )}

              {paymentData.subscription && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Subscription</span>
                  <span className="text-sm font-medium">{paymentData.subscription.title}</span>
                </div>
              )}

              {paymentData.userSubscription && (
                <div className="flex items-start justify-between">
                  <span className="text-sm text-gray-500 flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    Valid Period
                  </span>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {new Date(paymentData.userSubscription.validFrom).toLocaleDateString()} - 
                      {new Date(paymentData.userSubscription.validTo).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Auto-refresh countdown for pending status */}
        {status === 'pending' && autoRefresh && (
          <div className="text-center mb-4">
            <p className="text-sm text-gray-500">
              Auto-refreshing in {countdown} seconds...
            </p>
            <button
              onClick={() => setAutoRefresh(false)}
              className="text-sm text-blue-500 hover:text-blue-700 underline"
            >
              Stop auto-refresh
            </button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          {status === 'completed' && (
            <button
              onClick={handleContinue}
              className="w-full bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center"
            >
              Continue to Gym <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          )}

          {(status === 'failed' || status === 'cancelled') && (
            <button
              onClick={handleRetryPayment}
              className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center"
            >
              Try Again <RefreshCw className="w-4 h-4 ml-2" />
            </button>
          )}

          {(status === 'pending' || status === 'error') && (
            <button
              onClick={handleRefresh}
              disabled={isRetrying}
              className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 disabled:bg-blue-300 transition-colors flex items-center justify-center"
            >
              {isRetrying ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Status
                </>
              )}
            </button>
          )}

          {/* Always show go back to dashboard option */}
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>

        {/* Retry count indicator */}
        {retryCount > 0 && (
          <div className="text-center mt-4">
            <p className="text-xs text-gray-400">
              Checked {retryCount} time{retryCount > 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
