import React, { useState } from 'react';
import { adminPaymentService } from '../../../services/adminPaymentService';
import { Modal, ModalProps } from '../../ui/Modal';
import SubscriptionAutocomplete from '../../common/SubscriptionAutocomplete';

interface CreateOrderModalProps extends ModalProps {
  onSuccess: () => void;
}

export function CreateOrderModal({ isOpen, onClose, onSuccess }: CreateOrderModalProps) {
  const [form, setForm] = useState({ subscriptionId: 0, totalAmount: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };


  const handleSubscriptionChange = (subscriptionId: number, subscription?: any) => {
    setForm({ ...form, subscriptionId });
    // Auto-populate total amount from subscription price if available
    if (subscription?.price) {
      const price = parseInt(subscription.price.replace(',', ''));
      setForm(prev => ({ ...prev, subscriptionId, totalAmount: price }));
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await adminPaymentService.createOrder(form);
      if (response.success) {
        onSuccess();
      } else {
        setError(response.message || 'Failed to create order');
      }
    } catch (error) {
      setError('Failed to create order');
      console.error('Failed to create order:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Order" maxWidth="md">
      <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Subscription *</label>
        <SubscriptionAutocomplete
          value={form.subscriptionId}
          onChange={handleSubscriptionChange}
          placeholder="Search for subscription by title or gym"
          required
        />
      </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Total Amount</label>
          <input
            type="number"
            name="totalAmount"
            value={form.totalAmount}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            required
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="flex justify-end space-x-3 mt-6">
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
          disabled={loading || !form.subscriptionId || !form.totalAmount}
        >
          {loading ? 'Creating...' : 'Create Order'}
        </button>
      </div>
    </Modal>
  );
}
