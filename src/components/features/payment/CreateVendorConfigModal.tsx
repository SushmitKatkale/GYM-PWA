import React, { useState } from 'react';
import { adminPaymentService, CreateVendorConfigRequest } from '../../../services/adminPaymentService';
import { Modal, ModalProps } from '../../ui/Modal';
import GymAutocomplete from '../../common/GymAutocomplete';

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };


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
            }}
            placeholder="Search for gym by name or address"
            required
          />
          {selectedGym && (
            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-sm text-blue-800">
                <strong>Owner:</strong> {selectedGym.ownerEmail}
              </div>
              <div className="text-xs text-blue-600 mt-1">
                Payment configuration will be created for this gym owner
              </div>
            </div>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Cut Value</label>
          <input
            type="number"
            name="cutValue"
            value={form.cutValue}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Cut Type</label>
          <select
            name="cutType"
            value={form.cutType}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
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
          className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save'}
        </button>
      </div>
    </Modal>
  );
}
