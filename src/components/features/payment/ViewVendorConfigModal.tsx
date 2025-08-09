import React, { useState, useEffect } from 'react';
import {
  X,
  Eye,
  Building,
  User,
  CreditCard,
  Calendar,
  Shield,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  FileText,
  Banknote,
  IndianRupee,
  Copy,
  Check
} from 'lucide-react';
import { VendorPaymentConfig, adminPaymentService } from '../../../services/adminPaymentService';

interface ViewVendorConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  configId: number;
}

export function ViewVendorConfigModal({ isOpen, onClose, configId }: ViewVendorConfigModalProps) {
  const [config, setConfig] = useState<VendorPaymentConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedVendorId, setCopiedVendorId] = useState(false);

  useEffect(() => {
    if (isOpen && configId) {
      loadVendorConfig();
    }
  }, [isOpen, configId]);

  const loadVendorConfig = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await adminPaymentService.getVendorConfig(configId);
      if (response.success && response.data) {
        setConfig(response.data);
      } else {
        setError('Failed to load vendor configuration');
      }
    } catch (err) {
      console.error('Error loading vendor config:', err);
      setError('An error occurred while loading the configuration');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      pending_verification: 'bg-purple-100 text-purple-800',
      completed: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      submitted: 'bg-blue-100 text-blue-800',
      verified: 'bg-green-100 text-green-800',
    };
    return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'verified':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'in_progress':
      case 'submitted':
        return <RefreshCw className="w-4 h-4 text-blue-600" />;
      case 'pending_verification':
        return <AlertCircle className="w-4 h-4 text-purple-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const copyVendorId = async (vendorId: string) => {
    try {
      await navigator.clipboard.writeText(vendorId);
      setCopiedVendorId(true);
      setTimeout(() => setCopiedVendorId(false), 2000);
    } catch (err) {
      console.error('Failed to copy vendor ID:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = vendorId;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedVendorId(true);
      setTimeout(() => setCopiedVendorId(false), 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Eye className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Vendor Configuration Details
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
              <span className="ml-3 text-gray-600">Loading configuration...</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12 text-red-600">
              <XCircle className="w-8 h-8 mr-3" />
              <span>{error}</span>
            </div>
          ) : config ? (
            <div className="space-y-8">
              {/* Basic Information */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Building className="w-5 h-5 mr-2 text-blue-600" />
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Configuration ID
                    </label>
                    <p className="text-gray-900 font-mono">#{config.id}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Owner Email
                    </label>
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-2 text-gray-400" />
                      <p className="text-gray-900">{config.ownerEmail}</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gym Name
                    </label>
                    <div className="flex items-center">
                      <Building className="w-4 h-4 mr-2 text-gray-400" />
                      <p className="text-gray-900">{config.gym?.name || 'N/A'}</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gym Address
                    </label>
                    <p className="text-gray-600 text-sm">
                      {config.gym?.address ? `${config.gym.address}, ${config.gym.city}` : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Commission Configuration */}
              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <IndianRupee className="w-5 h-5 mr-2 text-blue-600" />
                  Commission Configuration
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Commission Value
                    </label>
                    <p className="text-2xl font-bold text-blue-600">
                      {config.cutValue}{config.cutType === 'percentage' ? '%' : ' ₹'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Commission Type
                    </label>
                    <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
                      {config.cutType}
                    </span>
                  </div>
                </div>
              </div>

              {/* Razorpay Integration */}
              <div className="bg-green-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <CreditCard className="w-5 h-5 mr-2 text-green-600" />
                  Razorpay Integration
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Razorpay Status
                    </label>
                    <div className="flex items-center">
                      {config.isRazorpayActive ? (
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500 mr-2" />
                      )}
                      <span className={`text-sm font-medium ${
                        config.isRazorpayActive ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {config.isRazorpayActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Onboarding Status
                    </label>
                    <div className="flex items-center">
                      {getStatusIcon(config.onboardingStatus)}
                      <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        getStatusBadge(config.onboardingStatus)
                      }`}>
                        {config.onboardingStatus.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Razorpay Vendor ID
                    </label>
                    <div className="flex items-center space-x-2">
                      <p className="text-gray-900 font-mono text-sm">
                        {config.razorpayVendorId || 'Not assigned'}
                      </p>
                      {config.razorpayVendorId && (
                        <button
                          onClick={() => copyVendorId(config.razorpayVendorId!)}
                          className={`p-1.5 rounded-lg transition-all duration-200 ${
                            copiedVendorId
                              ? 'bg-green-100 text-green-600'
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800'
                          }`}
                          title={copiedVendorId ? 'Copied!' : 'Copy Vendor ID'}
                        >
                          {copiedVendorId ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Onboarding Date
                    </label>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      {formatDate(config.onboardingDate)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Verification Status */}
              <div className="bg-purple-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-purple-600" />
                  Account Verification
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      KYC Status
                    </label>
                    <div className="flex items-center">
                      {getStatusIcon(config.kycStatus)}
                      <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        getStatusBadge(config.kycStatus)
                      }`}>
                        {config.kycStatus.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bank Account Verified
                    </label>
                    <div className="flex items-center">
                      {config.bankAccountVerified ? (
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500 mr-2" />
                      )}
                      <span className={`text-sm font-medium ${
                        config.bankAccountVerified ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {config.bankAccountVerified ? 'Verified' : 'Not Verified'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Account Status
                    </label>
                    <div className="flex items-center">
                      {config.activeStatus ? (
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500 mr-2" />
                      )}
                      <span className={`text-sm font-medium ${
                        config.activeStatus ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {config.activeStatus ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Razorpay Account Details */}
              {(config.razorpayBankAccountId || config.razorpayStakeholderId) && (
                <div className="bg-yellow-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Banknote className="w-5 h-5 mr-2 text-yellow-600" />
                    Razorpay Account Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {config.razorpayBankAccountId && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Bank Account ID
                        </label>
                        <p className="text-gray-900 font-mono text-sm">
                          {config.razorpayBankAccountId}
                        </p>
                      </div>
                    )}
                    {config.razorpayStakeholderId && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Stakeholder ID
                        </label>
                        <p className="text-gray-900 font-mono text-sm">
                          {config.razorpayStakeholderId}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Audit Trail */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-gray-600" />
                  Audit Trail
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Created On
                    </label>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      {formatDate(config.createTimestamp)}
                    </div>
                    {config.createdBy && (
                      <p className="text-xs text-gray-500 mt-1">by {config.createdBy}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Updated
                    </label>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      {formatDate(config.updateTimestamp)}
                    </div>
                    {config.updatedBy && (
                      <p className="text-xs text-gray-500 mt-1">by {config.updatedBy}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              No configuration data found
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
