import React from 'react';
import { Building2, Users, Star, FileText, User } from 'lucide-react';
import OwnerAutocomplete from '../../common/OwnerAutocomplete';

interface FormData {
  id: string;
  name: string;
  description: string;
  capacity: number;
  currentOccupancy: number;
  rating: number;
  ownerId: string;
  [key: string]: any;
}

interface StepBasicInfoProps {
  formData: FormData;
  onChange: (data: FormData) => void;
}

const StepBasicInfo: React.FC<StepBasicInfoProps> = ({ formData, onChange }) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const processedValue = type === 'number' ? parseFloat(value) || 0 : value;
    
    onChange({
      ...formData,
      [name]: processedValue
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Building2 className="w-8 h-8 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Basic Information</h3>
        <p className="text-sm text-gray-600">Let's start with the basic details about your gym</p>
      </div>

      {/* Progress Indicator */}
      <div className="flex justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">1</div>
          <div className="w-16 h-1 bg-gray-200 rounded"></div>
          <div className="w-8 h-8 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center text-sm font-medium">2</div>
          <div className="w-16 h-1 bg-gray-200 rounded"></div>
          <div className="w-8 h-8 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center text-sm font-medium">3</div>
          <div className="w-16 h-1 bg-gray-200 rounded"></div>
          <div className="w-8 h-8 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center text-sm font-medium">4</div>
        </div>
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        {/* Gym Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Building2 className="w-4 h-4 inline mr-2" />
            Gym Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter gym name (e.g., FitZone Downtown)"
            required
          />
          {!formData.name && (
            <p className="text-xs text-gray-500 mt-1">This field is required</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FileText className="w-4 h-4 inline mr-2" />
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="Brief description of your gym (e.g., Premium fitness center with state-of-the-art equipment)"
          />
          <p className="text-xs text-gray-500 mt-1">
            {formData.description.length}/200 characters
          </p>
        </div>

        {/* Capacity and Occupancy */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Users className="w-4 h-4 inline mr-2" />
              Total Capacity *
            </label>
            <input
              type="number"
              name="capacity"
              value={formData.capacity}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="100"
              min="1"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Occupancy
            </label>
            <input
              type="number"
              name="currentOccupancy"
              value={formData.currentOccupancy}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0"
              min="0"
              max={formData.capacity}
            />
          </div>
        </div>

        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Star className="w-4 h-4 inline mr-2" />
            Initial Rating
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              name="rating"
              value={formData.rating}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="4.5"
              min="0"
              max="5"
              step="0.1"
            />
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-5 h-5 ${
                    star <= formData.rating
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">Rate from 0.0 to 5.0 stars</p>
        </div>

        {/* Owner Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <User className="w-4 h-4 inline mr-2" />
            Owner *
          </label>
          <OwnerAutocomplete
            value={formData.ownerId}
            onChange={(ownerId) => onChange({ ...formData, ownerId })}
            placeholder="Search for owner by email or name"
            required
            className="w-full"
          />
        </div>
      </div>

      {/* Validation Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Required Fields:</h4>
        <div className="space-y-1 text-xs text-blue-700">
          <div className="flex items-center">
            <div className={`w-2 h-2 rounded-full mr-2 ${formData.name ? 'bg-green-500' : 'bg-red-500'}`}></div>
            Gym Name
          </div>
          <div className="flex items-center">
            <div className={`w-2 h-2 rounded-full mr-2 ${formData.capacity > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
            Total Capacity
          </div>
          <div className="flex items-center">
            <div className={`w-2 h-2 rounded-full mr-2 ${formData.ownerId ? 'bg-green-500' : 'bg-red-500'}`}></div>
            Owner Selection
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepBasicInfo;
