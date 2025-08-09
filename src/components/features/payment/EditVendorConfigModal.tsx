import React, { useState } from 'react';
import { X, Save, AlertCircle, ChevronLeft, ChevronRight, Building, CreditCard, Settings } from 'lucide-react';
import { adminPaymentService, VendorPaymentConfig, UpdateVendorConfigRequest } from '../../../services/adminPaymentService';

interface EditVendorConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  config: VendorPaymentConfig;
}

type EditStep = 'commission' | 'razorpay' | 'status';

export function EditVendorConfigModal({ isOpen, onClose, onSuccess, config }: EditVendorConfigModalProps) {
  const [currentStep, setCurrentStep] = useState<EditStep>('commission');
  const [formData, setFormData] = useState<UpdateVendorConfigRequest>({
    razorpayVendorId: config.razorpayVendorId || '',
    cutValue: config.cutValue,
    cutType: config.cutType,
    isRazorpayActive: config.isRazorpayActive,
    onboardingStatus: config.onboardingStatus,
    onboardingDate: config.onboardingDate || '',
    bankAccountVerified: config.bankAccountVerified,
    kycStatus: config.kycStatus,
    activeStatus: config.activeStatus,
    razorpayBankAccountId: config.razorpayBankAccountId || '',
    razorpayStakeholderId: config.razorpayStakeholderId || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validateCurrentStep = (): string | null => {
    switch (currentStep) {
      case 'commission':
        // Only validate if user is trying to change commission values
        if (formData.cutValue !== undefined && formData.cutValue <= 0) {
          return 'Cut value must be greater than 0';
        }
        if (formData.cutType === 'percentage' && formData.cutValue && formData.cutValue > 100) {
          return 'Percentage cannot exceed 100%';
        }
        break;
      case 'razorpay':
        // Optional validation for Razorpay fields
        break;
      case 'status':
        // Optional validation for status fields
        break;
    }
    return null;
  };

  const handleNext = (e?: React.MouseEvent) => {
    e?.preventDefault(); // Prevent form submission
    
    const validationError = validateCurrentStep();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError('');
    
    if (currentStep === 'commission') {
      setCurrentStep('razorpay');
    } else if (currentStep === 'razorpay') {
      setCurrentStep('status');
    }
  };

  const handlePrevious = () => {
    setError('');
    if (currentStep === 'status') {
      setCurrentStep('razorpay');
    } else if (currentStep === 'razorpay') {
      setCurrentStep('commission');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateCurrentStep();
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      // Check if there are any changes
      const hasChanges = Object.keys(formData).some(key => {
        const formValue = formData[key as keyof UpdateVendorConfigRequest];
        const configValue = config[key as keyof VendorPaymentConfig];
        return formValue !== configValue;
      });
      
      if (!hasChanges) {
        setError('No changes detected');
        setLoading(false);
        return;
      }

      // Add updated by field (you can get this from auth context)
      const updateData = {
        ...formData,
        updatedBy: 'admin' // Replace with actual user from auth context
      };

      const response = await adminPaymentService.updateVendorConfig(config.id, updateData);

      if (response.success) {
        onSuccess();
      } else {
        setError(response.message || 'Failed to update vendor configuration');
      }
    } catch (error) {
      console.error('Error updating vendor config:', error);
      setError('Failed to update vendor configuration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof UpdateVendorConfigRequest, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const steps = [
    { id: 'commission', label: 'Commission Settings', icon: Building },
    { id: 'razorpay', label: 'Razorpay Details', icon: CreditCard },
    { id: 'status', label: 'Status & Settings', icon: Settings },
  ];

  const currentStepIndex = steps.findIndex(step => step.id === currentStep);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Edit Vendor Configuration</h2>
            <p className="text-sm text-gray-500 mt-1">
              Step {currentStepIndex + 1} of {steps.length}: {steps[currentStepIndex].label}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Step Progress */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = step.id === currentStep;
              const isCompleted = index < currentStepIndex;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                    isActive ? 'bg-blue-600 text-white' :
                    isCompleted ? 'bg-green-600 text-white' :
                    'bg-gray-200 text-gray-500'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className={`ml-2 text-sm font-medium ${
                    isActive ? 'text-blue-600' :
                    isCompleted ? 'text-green-600' :
                    'text-gray-500'
                  }`}>
                    {step.label}
                  </span>
                  {index < steps.length - 1 && (
                    <div className={`mx-4 h-0.5 w-8 ${
                      isCompleted ? 'bg-green-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Vendor Info (Read-only) */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Vendor Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Gym:</span> {config.gym?.name || 'N/A'}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Owner Email:</span> {config.ownerEmail}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Created:</span> {new Date(config.createTimestamp).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Updated:</span> {new Date(config.updateTimestamp).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Step Content */}
          {currentStep === 'commission' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Commission Settings</h3>
              
              {/* Cut Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Commission Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="cutType"
                      value="percentage"
                      checked={formData.cutType === 'percentage'}
                      onChange={(e) => handleInputChange('cutType', e.target.value)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm font-medium">Percentage (%)</span>
                  </label>
                  <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="cutType"
                      value="flat"
                      checked={formData.cutType === 'flat'}
                      onChange={(e) => handleInputChange('cutType', e.target.value)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm font-medium">Flat Amount (₹)</span>
                  </label>
                </div>
              </div>

              {/* Cut Value */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Commission Value
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step={formData.cutType === 'percentage' ? '0.01' : '1'}
                    min="0"
                    max={formData.cutType === 'percentage' ? '100' : undefined}
                    value={formData.cutValue || ''}
                    onChange={(e) => handleInputChange('cutValue', parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={formData.cutType === 'percentage' ? '10' : '100'}
                    required
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <span className="text-gray-500 text-sm">
                      {formData.cutType === 'percentage' ? '%' : '₹'}
                    </span>
                  </div>
                </div>
                {formData.cutType === 'percentage' && (
                  <p className="text-xs text-gray-500 mt-1">
                    Maximum 100%
                  </p>
                )}
              </div>

              {/* Preview */}
              {formData.cutValue && formData.cutValue > 0 && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">Commission Preview</h4>
                  <p className="text-xs text-blue-700">
                    For a ₹1000 transaction:{' '}
                    {formData.cutType === 'percentage' 
                      ? `₹${((1000 * formData.cutValue) / 100).toFixed(2)} commission (${formData.cutValue}%)`
                      : `₹${formData.cutValue} commission (flat rate)`
                    }
                  </p>
                </div>
              )}
            </div>
          )}

          {currentStep === 'razorpay' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Razorpay Integration Details</h3>
              
              {/* Razorpay Vendor ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Razorpay Vendor ID
                </label>
                <input
                  type="text"
                  value={formData.razorpayVendorId || ''}
                  onChange={(e) => handleInputChange('razorpayVendorId', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="acc_xxxxxxxxxxxxx"
                />
              </div>

              {/* Razorpay Bank Account ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Razorpay Bank Account ID
                </label>
                <input
                  type="text"
                  value={formData.razorpayBankAccountId || ''}
                  onChange={(e) => handleInputChange('razorpayBankAccountId', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="ba_xxxxxxxxxxxxx"
                />
              </div>

              {/* Razorpay Stakeholder ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Razorpay Stakeholder ID
                </label>
                <input
                  type="text"
                  value={formData.razorpayStakeholderId || ''}
                  onChange={(e) => handleInputChange('razorpayStakeholderId', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="stakeholder_xxxxxxxxxxxxx"
                />
              </div>

              {/* Razorpay Active Status */}
              <div>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.isRazorpayActive || false}
                    onChange={(e) => handleInputChange('isRazorpayActive', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Razorpay Integration Active</span>
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  Enable this when Razorpay account is fully set up and verified
                </p>
              </div>
            </div>
          )}

          {currentStep === 'status' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Status & Settings</h3>
              
              {/* Onboarding Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Onboarding Status
                </label>
                <select
                  value={formData.onboardingStatus || ''}
                  onChange={(e) => handleInputChange('onboardingStatus', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="pending_verification">Pending Verification</option>
                  <option value="completed">Completed</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              {/* KYC Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  KYC Status
                </label>
                <select
                  value={formData.kycStatus || ''}
                  onChange={(e) => handleInputChange('kycStatus', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="pending">Pending</option>
                  <option value="submitted">Submitted</option>
                  <option value="verified">Verified</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              {/* Onboarding Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Onboarding Date
                </label>
                <input
                  type="datetime-local"
                  value={formData.onboardingDate ? new Date(formData.onboardingDate).toISOString().slice(0, 16) : ''}
                  onChange={(e) => handleInputChange('onboardingDate', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Checkboxes */}
              <div className="space-y-3">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.bankAccountVerified || false}
                    onChange={(e) => handleInputChange('bankAccountVerified', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Bank Account Verified</span>
                </label>

                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.activeStatus || false}
                    onChange={(e) => handleInputChange('activeStatus', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Configuration Active</span>
                </label>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Navigation Actions */}
          <div className="flex justify-between pt-4 border-t border-gray-200">
            <div>
              {currentStep !== 'commission' && (
                <button
                  type="button"
                  onClick={handlePrevious}
                  className="flex items-center px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  disabled={loading}
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Previous
                </button>
              )}
            </div>
            
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              
              {currentStep !== 'status' ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    handleNext(e);
                  }}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  disabled={loading}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Update Configuration
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
