import React from 'react';
import { AlertCircle, X } from 'lucide-react';
import { UserSubscription } from '../../services/subscriptionService';

interface SubscriptionConflictModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  conflictingSubscriptions: UserSubscription[];
  newGymName: string;
  newPlanName: string;
}

const SubscriptionConflictModal: React.FC<SubscriptionConflictModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  conflictingSubscriptions,
  newGymName,
  newPlanName
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
      <div className="bg-white rounded-xl max-w-md w-full mx-4">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <AlertCircle className="w-6 h-6 text-amber-500 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">
                Existing Subscription Found
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="mb-6">
            <p className="text-gray-700 mb-4">
              You already have an active subscription to a different gym. 
              Purchasing this subscription will allow you to access both gyms.
            </p>

            {/* Current Subscriptions */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-gray-900 mb-2">Current Active Subscriptions:</h4>
              {conflictingSubscriptions.map((sub, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                  <div>
                    <p className="font-medium text-gray-800">{sub.subscription.gym.name}</p>
                    <p className="text-sm text-gray-600">{sub.subscription.title}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Valid until</p>
                    <p className="text-sm font-medium text-gray-800">
                      {new Date(sub.validTo).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* New Subscription */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">New Subscription:</h4>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-blue-800">{newGymName}</p>
                  <p className="text-sm text-blue-600">{newPlanName}</p>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                <strong>Note:</strong> Both subscriptions will remain active. You can use either gym during their respective validity periods.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors font-medium"
            >
              Continue to Payment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionConflictModal;
