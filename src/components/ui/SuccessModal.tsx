import React from 'react';
import { CheckCircle, X } from 'lucide-react';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  actionLabel,
  onAction
}) => {
  if (!isOpen) return null;

  const handleAction = () => {
    if (onAction) {
      onAction();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full mx-4">
        <div className="p-6">
          {/* Success Icon */}
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>

          {/* Content */}
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {title}
            </h3>
            <p className="text-gray-600 mb-6">
              {message}
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            {actionLabel && onAction && (
              <button
                onClick={handleAction}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                {actionLabel}
              </button>
            )}
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default SuccessModal;
