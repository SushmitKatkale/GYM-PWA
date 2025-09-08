import React, { useState, useEffect } from 'react';
import { X, CreditCard, Smartphone, Loader2, AlertCircle, CheckCircle, IndianRupee } from 'lucide-react';
import { paymentService, PaymentInitiationRequest, PaymentInitiationResponse } from '../../services/paymentService';
import { useAuthStore } from '../../stores/authStore';

interface PaymentGatewayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (paymentId: string) => void;
  onError: (error: string) => void;
  gymId: number;
  subscriptionId: string;
  amount: number;
  gymName: string;
  planType: string;
  isBuffer?: boolean;
  selectedPlan: any;
}

export const PaymentGatewayModal: React.FC<PaymentGatewayModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onError,
  gymId,
  subscriptionId,
  amount,
  gymName,
  planType,
  isBuffer,
  selectedPlan
}) => {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [paymentData, setPaymentData] = useState<PaymentInitiationResponse | null>(null);
  const [error, setError] = useState<string>('');
  const [step, setStep] = useState<'init' | 'processing' | 'success' | 'error'>('init');

  useEffect(() => {
    console.log("selectedPlan", selectedPlan);
    
    if (isOpen && user) {
      initiatePayment();
    }
  }, [isOpen]);

  const initiatePayment = async () => {
    if (!user) {
      setError('User not logged in');
      setStep('error');
      return;
    }

    setIsLoading(false);
    setError('');
    
    try {
      const paymentRequest: PaymentInitiationRequest = {
        gymId,
        subscriptionId: parseInt(subscriptionId),
        amount,
        isBuffer: isBuffer
      };
      const response = await paymentService.initiatePayment(paymentRequest);

      if (response.success && response.data) {
        setPaymentData(response.data);
        setStep('processing');
        await processPayment(response.data);
      } else {
        throw new Error('Failed to initiate payment');
      }
    } catch (error: any) {
      console.error('Payment initiation error:', error);
      setError(error.message || 'Failed to initiate payment');
      setStep('error');
      onError(error.message || 'Failed to initiate payment');
    } finally {
      setIsLoading(false);
    }
  };

  const processPayment = async (data: PaymentInitiationResponse) => {
    if (!user) return;

    try {
      const result = await paymentService.processPayment(data, {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber || ''
      });

      if (result.success) {
        setStep('success');
        onSuccess(result.paymentId || 'payment_completed');
      } else {
        throw new Error(result.error || 'Payment failed');
      }
    } catch (error: any) {
      console.error('Payment processing error:', error);
      setError(error.message || 'Payment processing failed');
      setStep('error');
      onError(error.message || 'Payment processing failed');
    }
  };

  const handleRetry = () => {
    setStep('init');
    setError('');
    initiatePayment();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-sm max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                Complete Payment
              </h3>
              <p className="text-gray-600 text-sm mt-1">{gymName}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Payment Details */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Plan</span>
              <span className="text-sm font-medium text-gray-900">{planType}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Amount</span>
              <div className="flex items-center">
                <IndianRupee className="w-4 h-4 text-gray-900 mr-1" />
                <span className="text-lg font-bold text-gray-900">{amount}</span>
              </div>
            </div>
          </div>

          {/* Payment Status */}
          {step === 'init' && (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Initializing payment...</p>
              <p className="text-sm text-gray-500 mt-2">
                Determining the best payment method for you
              </p>
            </div>
          )}

          {step === 'processing' && paymentData && (
            <div className="text-center py-8">
              <div className="flex items-center justify-center mb-4">
                {paymentData.gateway === 'razorpay' ? (
                  <CreditCard className="w-8 h-8 text-blue-600" />
                ) : (
                  <Smartphone className="w-8 h-8 text-purple-600" />
                )}
              </div>
              <p className="text-gray-900 font-medium mb-2">
                Payment Gateway: {paymentData.gateway === 'razorpay' ? 'Razorpay' : 'PhonePe'}
              </p>
              <p className="text-gray-600 text-sm">
                {paymentData.gateway === 'razorpay' 
                  ? 'Complete your payment in the popup window'
                  : 'You will be redirected to PhonePe'
                }
              </p>
              
              {paymentData.gateway === 'phonepe' && (
                <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                  <p className="text-purple-700 text-sm">
                    <Smartphone className="w-4 h-4 inline mr-1" />
                    Redirecting to PhonePe for secure payment...
                  </p>
                </div>
              )}
            </div>
          )}

          {step === 'success' && (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Payment Successful!
              </h4>
              <p className="text-gray-600">
                Your subscription has been activated successfully.
              </p>
            </div>
          )}

          {step === 'error' && (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Payment Failed
              </h4>
              <p className="text-red-600 text-sm mb-4">{error}</p>
              <button
                onClick={handleRetry}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Retry Payment
              </button>
            </div>
          )}

          {/* Loading Overlay */}
          {isLoading && step === 'init' && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-xl">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
                <p className="text-gray-600">Loading...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
