import React, { useState, useEffect } from 'react';
import { adminPaymentService, CreateVendorConfigRequest, VendorPaymentConfig } from '../../../services/adminPaymentService';
import { Modal, ModalProps } from '../../ui/Modal';
import GymAutocomplete from '../../common/GymAutocomplete';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface CreateVendorConfigModalProps extends ModalProps {
  onSuccess: () => void;
}

export function CreateVendorConfigModal({ isOpen, onClose, onSuccess }: CreateVendorConfigModalProps) {
  const [form, setForm] = useState<CreateVendorConfigRequest>({
    ownerEmail: '',
    gymId: 0,
    cutValue: 0,
    cutType: 'percentage'
  });
  const [selectedGym, setSelectedGym] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [checkingExisting, setCheckingExisting] = useState(false);
  const [existingConfig, setExistingConfig] = useState<VendorPaymentConfig | null>(null);
  const [configExists, setConfigExists] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Check if configuration already exists for selected gym
  const checkExistingConfig = async (gymId: number, ownerEmail: string) => {
    if (!gymId || !ownerEmail) return;
    
    setCheckingExisting(true);
    try {
      const response = await adminPaymentService.checkVendorConfigExists(gymId, ownerEmail);
      if (response.success && response.data) {
        setConfigExists(response.data.exists);
        setExistingConfig(response.data.config || null);
      }
    } catch (error) {
      console.error('Failed to check existing config:', error);
    } finally {
      setCheckingExisting(false);
    }
  };

  // Check for existing config when gym is selected
  useEffect(() => {
    if (selectedGym && form.ownerEmail) {
      checkExistingConfig(selectedGym.id, form.ownerEmail);
    } else {
      setConfigExists(false);
      setExistingConfig(null);
    }
  }, [selectedGym, form.ownerEmail]);


  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await adminPaymentService.createVendorConfig(form);
      if (response.success) {
        onSuccess();
      }
    } catch (error) {
      console.error('Failed to create vendor config:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Vendor Configuration">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Gym *</label>
          <GymAutocomplete
            value={form.gymId}
            onChange={(gymId, gym) => {
              setForm({ ...form, gymId, ownerEmail: gym?.ownerEmail || '' });
              setSelectedGym(gym);
              // Reset existing config state when gym changes
              setConfigExists(false);
              setExistingConfig(null);
            }}
            placeholder="Search for gym by name or address"
            required
          />
          {selectedGym && (
            <div className="mt-2 space-y-2">
              {/* Loading state */}
              {checkingExisting && (
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="flex items-center text-sm text-gray-600">
                    <div className="animate-spin inline-block w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full mr-2"></div>
                    Checking existing configuration...
                  </div>
                </div>
              )}

              {/* Configuration already exists */}
              {!checkingExisting && configExists && existingConfig && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center text-sm text-red-800 mb-2">
                    <XCircle className="w-4 h-4 mr-2" />
                    <strong>Configuration Already Exists</strong>
                  </div>
                  <div className="text-xs text-red-700 space-y-1">
                    <div>Owner: {existingConfig.ownerEmail}</div>
                    <div>Commission: {existingConfig.cutValue}{existingConfig.cutType === 'percentage' ? '%' : ' ₹'}</div>
                    <div>Status: <span className="capitalize">{existingConfig.onboardingStatus.replace('_', ' ')}</span></div>
                    <div className="mt-2 font-medium">
                      A payment configuration already exists for this gym and owner combination.
                    </div>
                  </div>
                </div>
              )}

              {/* No existing configuration */}
              {!checkingExisting && !configExists && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center text-sm text-green-800 mb-1">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    <strong>Ready to Create</strong>
                  </div>
                  <div className="text-xs text-green-700 space-y-1">
                    <div>Owner: {selectedGym.ownerEmail}</div>
                    <div className="mt-1">
                      No existing configuration found. You can create a new payment configuration for this gym.
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Cut Value</label>
          <input
            type="number"
            name="cutValue"
            value={form.cutValue}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Cut Type</label>
          <select
            name="cutType"
            value={form.cutType}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="percentage">Percentage</option>
            <option value="flat">Flat</option>
          </select>
        </div>
      </div>
      <div className="mt-6 flex justify-end">
        <button
          onClick={onClose}
          className="mr-3 inline-flex justify-center rounded-md border border-transparent bg-gray-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          className={`inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            configExists 
              ? 'bg-gray-400 text-white cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
          }`}
          disabled={loading || configExists || checkingExisting || !selectedGym}
        >
          {loading ? 'Saving...' : configExists ? 'Configuration Exists' : 'Create Configuration'}
        </button>
      </div>
    </Modal>
  );
}
