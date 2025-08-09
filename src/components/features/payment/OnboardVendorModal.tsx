import React, { useState } from 'react';
import { adminPaymentService, VendorPaymentConfig, BankDetails } from '../../../services/adminPaymentService';
import { Modal, ModalProps } from '../../ui/Modal';

interface OnboardVendorModalProps extends ModalProps {
  config: VendorPaymentConfig;
  onSuccess: () => void;
}

export function OnboardVendorModal({ isOpen, onClose, config, onSuccess }: OnboardVendorModalProps) {
  const [bankDetails, setBankDetails] = useState<BankDetails>({
    accountNumber: '',
    ifsc: '',
    accountHolderName: '',
    pan: '',
    gst: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBankDetails({ ...bankDetails, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await adminPaymentService.onboardVendor(config.id, { bankDetails });
      if (response.success) {
        onSuccess();
      } else {
        setError(response.message || 'Failed to onboard vendor');
      }
    } catch (error) {
      setError('Failed to onboard vendor');
      console.error('Failed to onboard vendor:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Onboard Vendor to Razorpay" maxWidth="lg">
      <div className="space-y-6">
        {/* Vendor Info */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Vendor Information</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Gym:</span>
              <span className="ml-2 font-medium">{config.gym?.name}</span>
            </div>
            <div>
              <span className="text-gray-500">Owner:</span>
              <span className="ml-2 font-medium">{config.ownerEmail}</span>
            </div>
            <div>
              <span className="text-gray-500">Commission:</span>
              <span className="ml-2 font-medium">
                {config.cutValue}{config.cutType === 'percentage' ? '%' : ' ₹'}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Status:</span>
              <span className="ml-2 font-medium capitalize">{config.onboardingStatus}</span>
            </div>
          </div>
        </div>

        {/* Bank Details Form */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Bank Account Details</h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Account Holder Name</label>
              <input
                type="text"
                name="accountHolderName"
                value={bankDetails.accountHolderName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
              <input
                type="text"
                name="accountNumber"
                value={bankDetails.accountNumber}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">IFSC Code</label>
              <input
                type="text"
                name="ifsc"
                value={bankDetails.ifsc}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">PAN Number</label>
              <input
                type="text"
                name="pan"
                value={bankDetails.pan}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">GST Number (Optional)</label>
              <input
                type="text"
                name="gst"
                value={bankDetails.gst}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={loading || !bankDetails.accountNumber || !bankDetails.ifsc || !bankDetails.accountHolderName || !bankDetails.pan}
          >
            {loading ? 'Onboarding...' : 'Onboard to Razorpay'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
