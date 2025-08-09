import React, { useState, useEffect } from 'react';
import {
  X,
  AlertTriangle,
  CheckCircle,
  CreditCard,
  IndianRupee,
  Loader2,
  Clock,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { adminPaymentService, Refund, CreateRefundRequest, Payment, UserSubscription } from '../../../services/adminPaymentService';

interface RefundProcessingModalProps {
  isOpen: boolean;
  onClose: () => void;
  refundData?: CreateRefundRequest; // New: For gateway-first processing
  refund?: Refund; // Optional: For existing refunds
  payment?: Payment;
  subscription?: UserSubscription;
  onRefundStatusUpdate: (refund: Refund) => void;
}

export function RefundProcessingModal({ 
  isOpen, 
  onClose, 
  refundData, // New gateway-first refund data
  refund: existingRefund, // Existing refund (optional)
  payment,
  subscription,
  onRefundStatusUpdate 
}: RefundProcessingModalProps) {
  const [refund, setRefund] = useState<Refund | null>(existingRefund || null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string>('');
  const [status, setStatus] = useState<'ready' | 'processing' | 'completed' | 'failed'>('ready');
  const [refreshing, setRefreshing] = useState(false);

  // Reset state when modal opens with new data
  useEffect(() => {
    if (isOpen) {
      if (existingRefund) {
        setRefund(existingRefund);
        setStatus(existingRefund.status as any);
      } else {
        setRefund(null);
        setStatus('ready');
      }
      setError('');
    }
  }, [isOpen, existingRefund]);

  // Poll for refund status updates (only for existing refunds in processing state)
  useEffect(() => {
    if (!isOpen || !refund || !refund.id) {
      return;
    }

    // Only poll for refunds that are in a transitional state
    const shouldPoll = refund.status === 'processing' || refund.status === 'pending';
    if (!shouldPoll) {
      return;
    }

    let pollCount = 0;
    const maxPolls = 12; // Maximum 12 polls (2 minutes if interval is 10 seconds)

    const pollInterval = setInterval(async () => {
      pollCount++;
      
      try {
        const response = await adminPaymentService.getRefundById(refund.id);
        if (response.success && response.data) {
          const updatedRefund = response.data;
          setRefund(updatedRefund);
          setStatus(updatedRefund.status as any);
          
          if (onRefundStatusUpdate) {
            onRefundStatusUpdate(updatedRefund);
          }
          
          // Stop polling if refund reaches final state
          if (updatedRefund.status === 'completed' || 
              updatedRefund.status === 'failed' || 
              updatedRefund.status === 'cancelled') {
            clearInterval(pollInterval);
          }
        }
      } catch (error) {
        console.error('Failed to poll refund status:', error);
      }

      // Stop polling after maximum attempts
      if (pollCount >= maxPolls) {
        console.log('Stopped polling after maximum attempts');
        clearInterval(pollInterval);
      }
    }, 10000); // Poll every 10 seconds (reduced frequency)

    return () => clearInterval(pollInterval);
  }, [isOpen, refund?.id, refund?.status, onRefundStatusUpdate]);

  // New: Handle gateway-first refund initiation
  const handleInitiateRefund = async () => {
    if (!refundData) {
      setError('No refund data available');
      return;
    }

    setProcessing(true);
    setStatus('processing');
    setError('');

    try {
      // Call the new gateway-first API
      const response = await adminPaymentService.initiateRefundWithGateway(refundData);
      
      if (response.success && response.data) {
        // Gateway succeeded - refund entry created and payment status updated
        const newRefund = response.data.refund;
        setRefund(newRefund);
        setStatus('completed');
        
        if (onRefundStatusUpdate) {
          onRefundStatusUpdate(newRefund);
        }
      } else {
        setStatus('failed');
        setError(response.message || 'Failed to process refund with payment gateway');
      }
    } catch (error) {
      console.error('Failed to initiate refund:', error);
      setStatus('failed');
      setError('Failed to process refund with gateway. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  // Legacy: Handle existing refund processing
  const handleProcessExistingRefund = async () => {
    if (!refund) return;

    setProcessing(true);
    setError('');

    try {
      const response = await adminPaymentService.processRefund(refund.id);
      
      if (response.success) {
        const updatedRefund = {
          ...refund,
          status: 'processing' as const,
          gatewayRefundId: response.data?.gatewayRefundId
        };
        setRefund(updatedRefund);
        setStatus('processing');
        
        if (onRefundStatusUpdate) {
          onRefundStatusUpdate(updatedRefund);
        }
      } else {
        setError(response.message || 'Failed to process refund with payment gateway');
      }
    } catch (error) {
      console.error('Failed to process refund:', error);
      setError('Failed to process refund. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  // Manual refresh for refund status
  const handleRefreshStatus = async () => {
    if (!refund?.id) return;
    
    setRefreshing(true);
    setError('');
    
    try {
      const response = await adminPaymentService.getRefundById(refund.id);
      if (response.success && response.data) {
        const updatedRefund = response.data;
        setRefund(updatedRefund);
        setStatus(updatedRefund.status as any);
        
        if (onRefundStatusUpdate) {
          onRefundStatusUpdate(updatedRefund);
        }
      } else {
        setError('Failed to refresh refund status');
      }
    } catch (error) {
      console.error('Failed to refresh refund status:', error);
      setError('Failed to refresh status. Please try again.');
    } finally {
      setRefreshing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusIcon = () => {
    const currentStatus = refund?.status || status;
    switch (currentStatus) {
      case 'ready':
        return <Clock className="w-5 h-5 text-blue-600" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'processing':
        return <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'failed':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = () => {
    const currentStatus = refund?.status || status;
    switch (currentStatus) {
      case 'ready':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'pending':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'processing':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'completed':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'failed':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getStatusMessage = () => {
    const currentStatus = refund?.status || status;
    switch (currentStatus) {
      case 'ready':
        return 'Ready to process refund with the payment gateway. Click the button below to proceed.';
      case 'pending':
        return 'Refund request created but not yet processed with the payment gateway.';
      case 'processing':
        return 'Refund is being processed with the payment gateway. This may take a few minutes.';
      case 'completed':
        return 'Refund has been successfully processed. It may take 3-7 business days to reflect in the customer\'s account.';
      case 'failed':
        return 'Refund processing failed. Please contact technical support or try again.';
      default:
        return 'Unknown refund status.';
    }
  };

  // Get display data for the refund
  const getDisplayData = () => {
    if (refund) {
      return {
        id: refund.id,
        amount: refund.refundAmount,
        gateway: refund.payment?.gateway || 'Unknown',
        gatewayRefundId: refund.gatewayRefundId,
        reason: refund.refundReason
      };
    } else if (refundData) {
      const displayPayment = payment || subscription?.payment;
      return {
        id: 'New',
        amount: refundData.refundAmount,
        gateway: displayPayment?.gateway || subscription?.paymentGateway || 'Unknown',
        gatewayRefundId: undefined,
        reason: refundData.refundReason
      };
    }
    return null;
  };

  const displayData = getDisplayData();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
        
        <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <CreditCard className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Refund Processing</h3>
                  <p className="text-blue-100 text-sm">Gateway integration status</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="flex-shrink-0 rounded-lg p-2 text-white hover:bg-white/20 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="px-6 py-6">
            {/* Refund Details */}
            {displayData && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Refund Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Refund ID:</span>
                    <span className="font-medium">#{displayData.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Amount:</span>
                    <span className="font-medium text-green-600">{formatCurrency(displayData.amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Gateway:</span>
                    <span className="font-medium capitalize">{displayData.gateway}</span>
                  </div>
                  {displayData.gatewayRefundId && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Gateway Refund ID:</span>
                      <span className="font-medium font-mono text-xs">{displayData.gatewayRefundId}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-500">Reason:</span>
                    <span className="font-medium text-xs">{displayData.reason}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Status Display */}
            <div className={`border rounded-lg p-4 mb-6 ${getStatusColor()}`}>
              <div className="flex items-start">
                {getStatusIcon()}
                <div className="ml-3">
                  <h4 className="font-medium">
                    Status: {(refund?.status || status).charAt(0).toUpperCase() + (refund?.status || status).slice(1)}
                  </h4>
                  <p className="text-sm mt-1">
                    {getStatusMessage()}
                  </p>
                  {refund?.processedAt && (
                    <p className="text-xs mt-2">
                      Processed at: {new Date(refund.processedAt).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Gateway Integration Notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 mr-3" />
                <div>
                  <h4 className="font-medium text-amber-800">Gateway Processing Notice</h4>
                  <ul className="text-sm text-amber-700 mt-1 space-y-1 list-disc list-inside">
                    <li>Refunds are processed directly with {displayData?.gateway || 'the payment gateway'}</li>
                    <li>Processing time varies by gateway (usually immediate to 1 hour)</li>
                    <li>Customer will receive refund in 3-7 business days</li>
                    <li>Gateway may send status updates via webhooks</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Process Button for Ready/Pending Refunds */}
            {(status === 'ready' || refund?.status === 'pending') && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <CreditCard className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
                  <div className="flex-1">
                    <h4 className="font-medium text-blue-800">
                      {status === 'ready' ? 'Ready to Process' : 'Process with Gateway'}
                    </h4>
                    <p className="text-sm text-blue-700 mt-1">
                      {status === 'ready' 
                        ? 'Click the button below to process the refund directly with the payment gateway.'
                        : 'Click the button below to initiate the refund with the payment gateway.'
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Manual Status Check */}
            {refund?.id && (refund.status === 'processing' || refund.status === 'pending') && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-blue-800">Check Latest Status</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Click to manually check the current refund status with the payment gateway.
                    </p>
                  </div>
                  <button
                    onClick={handleRefreshStatus}
                    disabled={refreshing}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                  >
                    {refreshing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {(refund?.status === 'completed' || status === 'completed') ? 'Close' : 'Close'}
            </button>
            
            {/* New refund (gateway-first) */}
            {status === 'ready' && (
              <button
                onClick={handleInitiateRefund}
                disabled={processing}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Processing with Gateway...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Process with {displayData?.gateway || 'Gateway'}
                  </>
                )}
              </button>
            )}

            {/* Existing refund (legacy) */}
            {refund?.status === 'pending' && (
              <button
                onClick={handleProcessExistingRefund}
                disabled={processing}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Processing with Gateway...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Process with {refund.payment?.gateway || 'Gateway'}
                  </>
                )}
              </button>
            )}

            {refund?.gatewayRefundId && refund.payment?.gateway === 'razorpay' && (
              <a
                href={`https://dashboard.razorpay.com/app/refunds/${refund.gatewayRefundId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View in Razorpay
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
