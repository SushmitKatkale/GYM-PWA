import React from 'react';
import {
  X,
  User,
  Building,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  IndianRupee,
  Receipt,
  Mail,
  Phone,
  Activity,
  AlertCircle
} from 'lucide-react';
import { UserSubscription } from '../../../services/adminPaymentService';

interface UserSubscriptionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: UserSubscription | null;
}

export function UserSubscriptionDetailsModal({ isOpen, onClose, subscription }: UserSubscriptionDetailsModalProps) {
  if (!isOpen || !subscription) return null;

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
    });
  };

  const formatDateTime = (dateString: string) => {
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
      active: 'bg-green-100 text-green-800 border-green-200',
      expired: 'bg-red-100 text-red-800 border-red-200',
      cancelled: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'expired':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'cancelled':
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getDaysRemaining = () => {
    if (subscription.status !== 'active') return null;
    
    const endDate = new Date(subscription.endDate);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  const daysRemaining = getDaysRemaining();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
        
        <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <Activity className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Subscription Details</h3>
                  <p className="text-purple-100 text-sm">ID: #{subscription.id}</p>
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
            {/* Status and Validity Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Subscription Status */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-gray-700">Status</h4>
                  {getStatusIcon(subscription.status)}
                </div>
                <div className="flex items-center justify-between">
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full border ${getStatusBadge(subscription.status)}`}>
                    {subscription?.status?.toUpperCase()}
                  </span>
                  {daysRemaining !== null && daysRemaining >= 0 && (
                    <span className="text-xs text-gray-600">
                      {daysRemaining} days left
                    </span>
                  )}
                </div>
              </div>

              {/* Amount Paid */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-4 border border-green-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-gray-700">Amount Paid</h4>
                  <IndianRupee className="w-5 h-5 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-green-700">
                  {formatCurrency(subscription.paidAmount || subscription.payment?.paymentAmount || subscription.price || 0)}
                </div>
                <div className="text-xs text-green-600 mt-1">
                  via {subscription.paymentGateway || subscription.payment?.gateway || 'N/A'}
                </div>
              </div>
            </div>

            {/* User Information */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">User Information</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">Name</span>
                  </div>
                  <span className="text-sm text-gray-900">{subscription?.user?.name || subscription?.user?.firstName || 'N/A'}</span>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">Email</span>
                  </div>
                  <span className="text-sm text-gray-900">{subscription?.user?.email || subscription?.userEmail}</span>
                </div>

                {subscription?.user?.phoneNumber && (
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <span className="text-sm font-medium text-gray-700">Phone</span>
                    </div>
                    <span className="text-sm text-gray-900">{subscription?.user?.phoneNumber}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Subscription Details */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Subscription Details</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <Receipt className="w-5 h-5 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">Title</span>
                  </div>
                  <span className="text-sm text-gray-900">{subscription.subscription?.title || subscription.title || 'N/A'}</span>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">Validity Period</span>
                  </div>
                  <span className="text-sm text-gray-900">{subscription.subscription?.validityDays || subscription.validityDays || 0} days</span>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">Start Date</span>
                  </div>
                  <span className="text-sm text-gray-900">{formatDate(subscription.startDate)}</span>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">End Date</span>
                  </div>
                  <span className="text-sm text-gray-900">{formatDate(subscription.endDate)}</span>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">Created At</span>
                  </div>
                  <span className="text-sm text-gray-900">{formatDateTime(subscription.createdAt)}</span>
                </div>

                {subscription.updatedAt && (
                  <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                    <div className="flex items-center space-x-3">
                      <Clock className="w-5 h-5 text-gray-400" />
                      <span className="text-sm font-medium text-gray-700">Last Updated</span>
                    </div>
                    <span className="text-sm text-gray-900">{formatDateTime(subscription.updatedAt)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Gym Information */}
            {subscription.gym && (
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Gym Information</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      <Building className="w-5 h-5 text-gray-400" />
                      <span className="text-sm font-medium text-gray-700">Gym Name</span>
                    </div>
                    <span className="text-sm text-gray-900">{subscription.gym.name}</span>
                  </div>

                  <div className="flex items-start justify-between py-3 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      <Building className="w-5 h-5 text-gray-400" />
                      <span className="text-sm font-medium text-gray-700">Address</span>
                    </div>
                    <div className="text-right max-w-xs">
                      <div className="text-sm text-gray-900">{subscription.gym.address}</div>
                      <div className="text-sm text-gray-500">{subscription.gym.city}</div>
                    </div>
                  </div>

                  {subscription.gym.phoneNumber && (
                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                      <div className="flex items-center space-x-3">
                        <Phone className="w-5 h-5 text-gray-400" />
                        <span className="text-sm font-medium text-gray-700">Phone</span>
                      </div>
                      <span className="text-sm text-gray-900">{subscription.gym.phoneNumber}</span>
                    </div>
                  )}

                  {subscription.gym.email && (
                    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                      <div className="flex items-center space-x-3">
                        <Mail className="w-5 h-5 text-gray-400" />
                        <span className="text-sm font-medium text-gray-700">Email</span>
                      </div>
                      <span className="text-sm text-gray-900">{subscription.gym.email}</span>
                    </div>
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
