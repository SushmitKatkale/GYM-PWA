import React from 'react';
import {
  X,
  User,
  Building,
  Calendar,
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  IndianRupee,
  Receipt,
  Tag
} from 'lucide-react';
import { Payment } from '../../../services/adminPaymentService';

interface PaymentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: Payment | null;
}

export function PaymentDetailsModal({ isOpen, onClose, payment }: PaymentDetailsModalProps) {
  if (!isOpen || !payment) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      completed: 'bg-green-100 text-green-800 border-green-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      failed: 'bg-red-100 text-red-800 border-red-200',
    };
    return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getGatewayIcon = (gateway: string) => {
    switch (gateway.toLowerCase()) {
      case 'razorpay':
        return <CreditCard className="w-5 h-5 text-blue-600" />;
      case 'phonepe':
        return <CreditCard className="w-5 h-5 text-purple-600" />;
      default:
        return <CreditCard className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
        
        <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <Receipt className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Payment Details</h3>
                  <p className="text-blue-100 text-sm">Transaction ID: #{payment.id}</p>
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

          <div className="px-6 py-6 max-h-[calc(100vh-200px)] overflow-y-auto">
            {/* Main Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Payment Status */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-gray-700">Payment Status</h4>
                  {getStatusIcon(payment.status)}
                </div>
                <div className="flex items-center">
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full border ${getStatusBadge(payment.status)}`}>
                    {payment.status.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Amount */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-4 border border-green-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-gray-700">Payment Amount</h4>
                  <IndianRupee className="w-5 h-5 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-green-700">
                  {formatCurrency(payment.paymentAmount)}
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">User Email</span>
                  </div>
                  <span className="text-sm text-gray-900">{payment.userEmail}</span>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center space-x-3">
                    {getGatewayIcon(payment.gateway)}
                    <span className="text-sm font-medium text-gray-700">Payment Gateway</span>
                  </div>
                  <span className="text-sm text-gray-900 capitalize">{payment.gateway}</span>
                </div>

                {payment.transactionId && (
                  <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                    <div className="flex items-center space-x-3">
                      <Tag className="w-5 h-5 text-gray-400" />
                      <span className="text-sm font-medium text-gray-700">Transaction ID</span>
                    </div>
                    <span className="text-sm text-gray-900 font-mono">{payment.transactionId}</span>
                  </div>
                )}

                <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">Created At</span>
                  </div>
                  <span className="text-sm text-gray-900">{formatDate(payment.createdAt)}</span>
                </div>

                {payment.completedAt && (
                  <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-sm font-medium text-gray-700">Completed At</span>
                    </div>
                    <span className="text-sm text-gray-900">{formatDate(payment.completedAt)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Subscription Information */}
            {payment.subscription && (
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Subscription Information</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                    <div className="flex items-center space-x-3">
                      <Receipt className="w-5 h-5 text-gray-400" />
                      <span className="text-sm font-medium text-gray-700">Subscription Title</span>
                    </div>
                    <span className="text-sm text-gray-900">{payment.subscription.title}</span>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <span className="text-sm font-medium text-gray-700">Validity Period</span>
                    </div>
                    <span className="text-sm text-gray-900">{payment.subscription.validityDays} days</span>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                    <div className="flex items-center space-x-3">
                      <IndianRupee className="w-5 h-5 text-gray-400" />
                      <span className="text-sm font-medium text-gray-700">Subscription Price</span>
                    </div>
                    <span className="text-sm text-gray-900">{formatCurrency(payment.subscription.price)}</span>
                  </div>

                  {payment.subscription.gym && (
                    <>
                      <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                        <div className="flex items-center space-x-3">
                          <Building className="w-5 h-5 text-gray-400" />
                          <span className="text-sm font-medium text-gray-700">Gym Name</span>
                        </div>
                        <span className="text-sm text-gray-900">{payment.subscription.gym.name}</span>
                      </div>

                      <div className="flex items-start justify-between py-3 border-b border-gray-100 last:border-b-0">
                        <div className="flex items-center space-x-3">
                          <Building className="w-5 h-5 text-gray-400" />
                          <span className="text-sm font-medium text-gray-700">Gym Location</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-900">{payment.subscription.gym.address}</div>
                          <div className="text-sm text-gray-500">{payment.subscription.gym.city}</div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
