import React, { useEffect, useState } from 'react';
import { X, ArrowLeft, ArrowRight, Check, Save } from 'lucide-react';
import StepBasicInfo from '../features/gymSteps/StepBasicInfo';
import StepLocation from '../features/gymSteps/StepLocation';
import StepOperatingHours from '../features/gymSteps/StepOperatingHours';
import StepContactInfo from '../features/gymSteps/StepContactInfo';
import StepAmenities from '../features/gymSteps/StepAmenities';
import { buildApiUrl } from '../../config/api';
import { useAuthStore } from '../../stores/authStore';

interface EditGymModalProps {
  isOpen: boolean;
  onClose: () => void;
  gym: any; // Gym data from the API
  onSave?: (updatedGym: any) => void;
}

const STEPS = [
  { title: 'Basic Info', component: StepBasicInfo },
  { title: 'Location', component: StepLocation },
  { title: 'Contact', component: StepContactInfo },
  { title: 'Hours', component: StepOperatingHours },
  { title: 'Amenities', component: StepAmenities }
];

export function EditGymModal({ isOpen, onClose, gym, onSave }: EditGymModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getAccessToken } = useAuthStore();

  // Initialize form data with existing gym data
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    description: '',
    capacity: 0,
    rating: 0,
    ownerId: '',
    email: '',
    phone: '',
    websiteUrl: '',
    gstNumber: '',
    registrationNo: '',
    daysOpen: '',
    location: {
      address: '',
      city: '',
      state: '',
      zip: '',
      coordinates: {
        latitude: 0,
        longitude: 0
      }
    },
    operatingHours: { open: '06:00', close: '22:00' },
    plans: [] as any[],
    amenities: [] as any[],
  });

  // Update form data when gym prop changes
  useEffect(() => {
    if (gym && isOpen) {
      console.log('🔄 Initializing edit form with gym data:', gym);
      
      setFormData({
        id: gym.id?.toString() || '',
        name: gym.name || '',
        description: gym.description || '',
        capacity: gym.capacity || 0,
        rating: gym.rating || 0,
        ownerId: gym.ownerId || gym.owner?.id?.toString() || '',
        email: gym.email || '',
        phone: gym.phone || '',
        websiteUrl: gym.websiteUrl || '',
        gstNumber: gym.gstNumber || '',
        registrationNo: gym.registrationNo || '',
        daysOpen: gym.daysOpen || '',
        location: {
          address: gym.address || '',
          city: gym.city || '',
          state: gym.state || '',
          zip: gym.zip || gym.zipCode || '',
          coordinates: {
            latitude: parseFloat(gym.latitude) || 0,
            longitude: parseFloat(gym.longitude) || 0
          }
        },
        operatingHours: {
          open: gym.operatingHours?.open || '06:00',
          close: gym.operatingHours?.close || '22:00'
        },
        plans: gym.plans || [],
        amenities: gym.amenities || [],
      });
    }
  }, [gym, isOpen]);

  const handleFormChange = (newData: any) => {
    console.log('📝 Form data updated:', newData);
    setFormData(newData);
  };

  const handleNextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      const token = getAccessToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      console.log('💾 Saving gym updates:', formData);

      // Prepare the update data
      const updateData = {
        name: formData.name,
        address: formData.location.address,
        city: formData.location.city,
        state: formData.location.state,
        zipCode: formData.location.zip,
        phone: formData.phone,
        email: formData.email,
        capacity: formData.capacity,
        openTime: formData.operatingHours.open,
        closeTime: formData.operatingHours.close,
        latitude: formData.location.coordinates.latitude,
        longitude: formData.location.coordinates.longitude,
      };

      const response = await fetch(buildApiUrl('/owner/gym'), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ Gym updated successfully:', result);

      // Call the onSave callback if provided
      if (onSave) {
        onSave(result.data);
      }

      // Show success message and close modal
      alert('🎉 Gym information updated successfully!');
      onClose();

    } catch (error) {
      console.error('❌ Error updating gym:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update gym information';
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const getCurrentStepComponent = () => {
    const StepComponent = STEPS[currentStep].component;
    return (
      <StepComponent
        formData={formData}
        onChange={handleFormChange}
        setCurrentStep={setCurrentStep}
        isEditing={true}
      />
    );
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[60] bg-white md:bg-black md:bg-opacity-50 md:flex md:items-center md:justify-center md:p-4">
      <div className="bg-white md:rounded-lg md:shadow-xl md:max-w-2xl w-full h-full md:h-auto md:max-h-[90vh] overflow-y-auto flex flex-col">
        {/* Mobile Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200 bg-white sticky top-0 z-10">
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors md:hidden"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
            <div>
              <h2 className="text-lg md:text-xl font-semibold text-gray-900">Edit Gym</h2>
              <p className="text-xs md:text-sm text-gray-500 mt-1">
                {currentStep + 1}/{STEPS.length}: {STEPS[currentStep].title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors hidden md:block"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Progress Bar - Mobile */}
        <div className="px-4 py-3 bg-gray-50 md:hidden">
          <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
            <span>Progress</span>
            <span>{currentStep + 1} of {STEPS.length}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mx-4 md:mx-6 mt-2 md:mt-4 p-3 md:p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex">
              <div className="text-xs md:text-sm text-red-700">
                <strong>Error:</strong> {error}
              </div>
            </div>
          </div>
        )}

        {/* Step Content */}
        <div className="flex-1 p-4 md:p-6 pb-20 md:pb-6">
          {getCurrentStepComponent()}
        </div>

        {/* Footer - Mobile Fixed, Desktop Normal */}
        <div className="fixed md:relative bottom-0 left-0 right-0 md:bottom-auto md:left-auto md:right-auto bg-white md:bg-gray-50 border-t border-gray-200 p-4 md:p-6 flex items-center justify-between">
          <button
            onClick={handlePrevStep}
            disabled={currentStep === 0}
            className="flex items-center px-3 md:px-4 py-2 text-xs md:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-3 md:w-4 h-3 md:h-4 mr-1 md:mr-2" />
            <span className="hidden sm:inline">Previous</span>
            <span className="sm:hidden">Prev</span>
          </button>

          <div className="text-xs md:text-sm text-gray-500 hidden md:block">
            {currentStep + 1} / {STEPS.length}
          </div>

          <div className="flex items-center space-x-2 md:space-x-3">
            {currentStep < STEPS.length - 1 ? (
              <button
                onClick={handleNextStep}
                className="flex items-center px-4 md:px-4 py-2 text-xs md:text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
              >
                <span className="hidden sm:inline">Next</span>
                <span className="sm:hidden">Next</span>
                <ArrowRight className="w-3 md:w-4 h-3 md:h-4 ml-1 md:ml-2" />
              </button>
            ) : (
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex items-center px-4 md:px-6 py-2 text-xs md:text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-3 md:w-4 h-3 md:h-4 mr-1 md:mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span className="hidden sm:inline">Saving...</span>
                    <span className="sm:hidden">Save</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3 md:w-4 h-3 md:h-4 mr-1 md:mr-2" />
                    <span className="hidden sm:inline">Save Changes</span>
                    <span className="sm:hidden">Save</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}