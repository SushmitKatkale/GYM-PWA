import React, { useState, useEffect } from 'react';
import {
  X,
  AlertTriangle,
  IndianRupee,
  User,
  CreditCard,
  Receipt,
  Building,
  Calendar,
  Loader2
} from 'lucide-react';
import { adminPaymentService, CreateRefundRequest, Payment, UserSubscription } from '../../../services/adminPaymentService';

interface CreateRefundModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (refundData: CreateRefundRequest) => void; // Changed: Pass prepared data instead of created refund
  payment?: Payment | null;
  subscription?: UserSubscription | null;
}

export function CreateRefundModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  payment, 
  subscription 
}: CreateRefundModalProps) {
  const [loading, setLoading] = useState(false);
  const [checkingRefundability, setCheckingRefundability] = useState(false);
  const [refundCheck, setRefundCheck] = useState<{
    isRefundable: boolean;
    reason?: string;
    maxRefundAmount: number;
    alreadyRefunded: number;
  } | null>(null);

  const [formData, setFormData] = useState({
    refundAmount: '',
    refundReason: '',
    refundType: 'full' as 'full'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen && (payment || subscription)) {
      const amount = payment?.paymentAmount || subscription?.paidAmount || subscription?.price || 0;
      setFormData({
        refundAmount: amount.toString(),
        refundReason: '',
        refundType: 'full'
      });
      setErrors({});
      checkRefundability();
    }
  }, [isOpen, payment, subscription]);

  const checkRefundability = async () => {
    const paymentId = payment?.id || subscription?.paymentId;
    if (!paymentId) return;

    setCheckingRefundability(true);
    try {
      const response = await adminPaymentService.checkPaymentRefundable(paymentId);
      if (response.success && response.data) {
        setRefundCheck(response.data);
        
        // Update form with max refundable amount
        if (response.data.isRefundable) {
          const maxAmount = response.data.maxRefundAmount - response.data.alreadyRefunded;
          setFormData(prev => ({
            ...prev,
            refundAmount: maxAmount.toString()
          }));
        }
      }
    } catch (error) {
      console.error('Failed to check refund eligibility:', error);
    } finally {
      setCheckingRefundability(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    // For full refunds only, don't allow changing the amount
    if (name === 'refundAmount') {
      const amount = parseFloat(value) || 0;
      const maxRefundable = refundCheck ? refundCheck.maxRefundAmount - refundCheck.alreadyRefunded : 0;
      
      // Only allow the full refundable amount
      if (amount !== maxRefundable && maxRefundable > 0) {
        // Reset to full amount if user tries to change it
        setFormData(prev => ({ ...prev, refundAmount: maxRefundable.toString() }));
        return;
      }
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.refundAmount || parseFloat(formData.refundAmount) <= 0) {
      newErrors.refundAmount = 'Refund amount is required and must be greater than 0';
    } else {
      const amount = parseFloat(formData.refundAmount);
      const maxAmount = refundCheck ? refundCheck.maxRefundAmount - refundCheck.alreadyRefunded : 0;
      
      if (amount > maxAmount) {
        newErrors.refundAmount = `Refund amount cannot exceed ₹${maxAmount.toFixed(2)}`;
      }
    }

    if (!formData.refundReason.trim()) {
      newErrors.refundReason = 'Refund reason is required';
    } else if (formData.refundReason.length < 10) {
      newErrors.refundReason = 'Refund reason must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const paymentId = payment?.id || subscription?.paymentId;
    if (!paymentId) {
      setErrors({ submit: 'Invalid payment information' });
      return;
    }

    // Just prepare the data and pass to next step - no API call yet
    const refundData: CreateRefundRequest = {
      paymentId,
      subscriptionId: subscription?.id,
      refundAmount: parseFloat(formData.refundAmount),
      refundReason: formData.refundReason.trim(),
      refundType: formData.refundType
    };

    // Pass the prepared data to the RefundProcessingModal
    onSuccess(refundData);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (!isOpen) return null;

  const displayPayment = payment || subscription?.payment;
  const displaySubscription = subscription?.subscription || subscription;
  const originalAmount = payment?.paymentAmount || subscription?.paidAmount || subscription?.price || 0;
  const userEmail = payment?.userEmail || subscription?.userEmail || '';
  const userName = subscription?.user?.name || subscription?.user?.firstName || userEmail;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
        
        <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <IndianRupee className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Process Refund</h3>
                  <p className="text-red-100 text-sm">Initiate refund for payment</p>
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

          <form onSubmit={handleSubmit}>
            <div className="px-6 py-6">
              {/* Payment/Subscription Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Payment Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">User:</span>
                    <span className="font-medium">{userName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Email:</span>
                    <span className="font-medium">{userEmail}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Original Amount:</span>
                    <span className="font-medium text-green-600">{formatCurrency(originalAmount)}</span>
                  </div>
                  {displaySubscription && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Subscription:</span>
                      <span className="font-medium">{displaySubscription.title}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-500">Payment Gateway:</span>
                    <span className="font-medium capitalize">
                      {displayPayment?.gateway || subscription?.paymentGateway || 'Unknown'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Refund Eligibility Check */}
              {checkingRefundability ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-600 mr-2" />
                  <span className="text-sm text-gray-600">Checking refund eligibility...</span>
                </div>
              ) : refundCheck && !refundCheck.isRefundable ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start">
                    <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 mr-3" />
                    <div>
                      <h4 className="font-medium text-red-800">Payment Not Refundable</h4>
                      <p className="text-sm text-red-700 mt-1">
                        {refundCheck.reason || 'This payment cannot be refunded at this time.'}
                      </p>
                    </div>
                  </div>
                </div>
              ) : refundCheck && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start">
                    <Receipt className="w-5 h-5 text-green-600 mt-0.5 mr-3" />
                    <div>
                      <h4 className="font-medium text-green-800">Refund Available</h4>
                      <p className="text-sm text-green-700 mt-1">
                        Maximum refundable amount: {formatCurrency(refundCheck.maxRefundAmount - refundCheck.alreadyRefunded)}
                        {refundCheck.alreadyRefunded > 0 && (
                          <span className="block mt-1">
                            (Already refunded: {formatCurrency(refundCheck.alreadyRefunded)})
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Refund Form */}
              {refundCheck?.isRefundable && (
                <div className="space-y-4">
                  {/* Gateway Processing Notice */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <CreditCard className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
                      <div>
                        <h4 className="font-medium text-blue-800">Gateway Processing Required</h4>
                        <p className="text-sm text-blue-700 mt-1">
                          This will initiate a refund request with {displayPayment?.gateway || subscription?.paymentGateway || 'the payment gateway'}. 
                          The actual refund will be processed through their system and may take 3-7 business days to reflect in the customer's account.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Refund Amount - Read Only for Full Refund */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Refund Amount
                    </label>
                    <div className="relative">
                      <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        name="refundAmount"
                        value={formatCurrency(parseFloat(formData.refundAmount) || 0)}
                        readOnly
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed"
                        placeholder="Full refund amount"
                      />
                      <input
                        type="hidden"
                        name="refundAmount"
                        value={formData.refundAmount}
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Only full refunds are allowed. Partial refunds are not supported.
                    </p>
                  </div>


                  {/* Refund Reason */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Refund Reason *
                    </label>
                    <textarea
                      name="refundReason"
                      value={formData.refundReason}
                      onChange={handleInputChange}
                      rows={3}
                      maxLength={500}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none ${
                        errors.refundReason ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Provide a detailed reason for the refund (minimum 10 characters)"
                    />
                    <div className="flex justify-between mt-1">
                      {errors.refundReason && (
                        <p className="text-sm text-red-600">{errors.refundReason}</p>
                      )}
                      <p className="text-xs text-gray-500 ml-auto">
                        {formData.refundReason.length}/500 characters
                      </p>
                    </div>
                  </div>

                  {/* Warning */}
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 mr-3" />
                      <div>
                        <h4 className="font-medium text-amber-800">Important Notice</h4>
                        <ul className="text-sm text-amber-700 mt-1 space-y-1 list-disc list-inside">
                          <li>The associated subscription will be automatically deactivated</li>
                          <li>Refund processing may take 3-7 business days</li>
                          <li>This action cannot be undone once processed</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {errors.submit && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-sm text-red-700">{errors.submit}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              {refundCheck?.isRefundable && (
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <IndianRupee className="w-4 h-4 mr-2" />
                      Process Refund
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
