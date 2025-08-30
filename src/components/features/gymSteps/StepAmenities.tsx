import React, { useState } from 'react';
import { CheckCircle, Plus, Trash2, Edit3, Sparkles } from 'lucide-react';

interface Amenity {
  id?: number;
  name: string;
  description: string;
}

interface FormData {
  amenities: Amenity[];
  [key: string]: any;
}

interface StepAmenitiesProps {
  formData: FormData;
  onChange: (data: FormData) => void;
}

const StepAmenities: React.FC<StepAmenitiesProps> = ({ formData, onChange, setCurrentStep }) => {
  const [newAmenity, setNewAmenity] = useState<Amenity>({ name: '', description: '' });
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editAmenity, setEditAmenity] = useState<Amenity>({ name: '', description: '' });

  // Predefined amenities for quick selection
  const quickAmenities = [
    { name: 'Swimming Pool', description: 'Indoor/outdoor swimming pool with lane markers' },
    { name: 'Sauna', description: 'Steam room and dry sauna facilities' },
    { name: 'Free Weights', description: 'Complete set of dumbbells and barbells' },
    { name: 'Cardio Equipment', description: 'Treadmills, ellipticals, and stationary bikes' },
    { name: 'Group Classes', description: 'Yoga, Pilates, Zumba, and other group fitness classes' },
    { name: 'Personal Training', description: 'One-on-one training sessions with certified trainers' },
    { name: 'Locker Rooms', description: 'Clean and secure changing facilities' },
    { name: 'Parking', description: 'Free parking for gym members' },
    { name: 'Juice Bar', description: 'Fresh smoothies and protein shakes' },
    { name: 'Towel Service', description: 'Clean towels provided for members' }
  ];

  const handleAddAmenity = () => {
    if (newAmenity.name.trim()) {
      const updatedAmenities = [...formData.amenities, { ...newAmenity }];
      onChange({ ...formData, amenities: updatedAmenities });
      setNewAmenity({ name: '', description: '' });
    }
  };

  const handleRemoveAmenity = (index: number) => {
    const updatedAmenities = formData.amenities.filter((_, i) => i !== index);
    onChange({ ...formData, amenities: updatedAmenities });
  };

  const handleEditAmenity = (index: number) => {
    setEditingIndex(index);
    const amenity = formData.amenities[index];
    if (typeof amenity === 'string') {
      setEditAmenity({ name: amenity, description: '' });
    } else {
      setEditAmenity({ ...amenity });
    }
  };

  const handleSaveEdit = () => {
    if (editingIndex !== null && editAmenity.name.trim()) {
      const updatedAmenities = [...formData.amenities];
      updatedAmenities[editingIndex] = { ...editAmenity };
      onChange({ ...formData, amenities: updatedAmenities });
      setEditingIndex(null);
      setEditAmenity({ name: '', description: '' });
    }
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditAmenity({ name: '', description: '' });
  };

  const handleQuickAdd = (quickAmenity: Amenity) => {
    // Check if amenity already exists
    const exists = formData.amenities.some(amenity => {
      if (typeof amenity === 'string') {
        return amenity.toLowerCase() === quickAmenity.name.toLowerCase();
      }
      return amenity?.name?.toLowerCase() === quickAmenity.name.toLowerCase();
    });
    
    if (!exists) {
      const updatedAmenities = [...formData.amenities, { ...quickAmenity }];
      onChange({ ...formData, amenities: updatedAmenities });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, isEdit = false) => {
    const { name, value } = e.target;
    if (isEdit) {
      setEditAmenity({ ...editAmenity, [name]: value });
    } else {
      setNewAmenity({ ...newAmenity, [name]: value });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-purple-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Gym Amenities</h3>
        <p className="text-sm text-gray-600">Add and manage all amenities that your gym offers to attract more members.</p>
      </div>

      {/* Progress Indicator */}
      <div className="flex justify-center">
        <div className="flex items-center space-x-2">
          <div onClick={() => {setCurrentStep(0)}} className="cursor-pointer w-8 h-8 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center text-sm font-medium">1</div>
          <div className="w-12 h-1 bg-gray-200 rounded"></div>
          <div onClick={() => {setCurrentStep(1)}} className="cursor-pointer w-8 h-8 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center text-sm font-medium">2</div>
          <div className="w-12 h-1 bg-gray-200 rounded"></div>
          <div onClick={() => {setCurrentStep(2)}} className="cursor-pointer w-8 h-8 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center text-sm font-medium">3</div>
          <div className="w-12 h-1 bg-gray-200 rounded"></div>
          <div onClick={() => {setCurrentStep(3)}} className="cursor-pointer w-8 h-8 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center text-sm font-medium">4</div>
          <div className="w-12 h-1 bg-gray-200 rounded"></div>
          <div onClick={() => {setCurrentStep(4)}} className="cursor-pointer w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">5</div>
        </div>
      </div>


      {/* Quick Add Amenities */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          <h4 className="text-lg font-semibold text-gray-700">Quick Add Popular Amenities</h4>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {quickAmenities.map((amenity, index) => {
            const isAdded = formData.amenities.some(a => {
              if (typeof a === 'string') {
                return a.toLowerCase() === amenity.name.toLowerCase();
              }
              return a?.name?.toLowerCase() === amenity.name.toLowerCase();
            });
            return (
              <button
                key={index}
                onClick={() => handleQuickAdd(amenity)}
                disabled={isAdded}
                className={`p-3 text-left border rounded-lg transition-colors ${
                  isAdded 
                    ? 'bg-purple-50 border-purple-200 text-purple-700 cursor-not-allowed' 
                    : 'bg-white border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                }`}
              >
                <div className="font-medium text-sm">
                  {amenity.name} {isAdded && '✓'}
                </div>
                <div className="text-xs text-gray-500 mt-1 truncate">
                  {amenity.description}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Add Custom Amenity */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Plus className="w-5 h-5 text-purple-600" />
          <h4 className="text-lg font-semibold text-gray-700">Add Custom Amenity</h4>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Amenity Name *</label>
              <input
                type="text"
                name="name"
                value={newAmenity.name}
                onChange={(e) => handleInputChange(e)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g., Rock Climbing Wall"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <input
                type="text"
                name="description"
                value={newAmenity.description}
                onChange={(e) => handleInputChange(e)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Brief description of the amenity"
              />
            </div>
          </div>
          <button
            onClick={handleAddAmenity}
            className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Amenity</span>
          </button>
        </div>
      </div>

      {/* Added Amenities List */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h4 className="text-lg font-semibold text-gray-700">Added Amenities ({formData.amenities.length})</h4>
        </div>
        
        {formData.amenities.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No amenities added yet</p>
            <p className="text-sm text-gray-400">Use quick add buttons above or add custom amenities</p>
          </div>
        ) : (
          <div className="space-y-3">
            {formData.amenities.map((amenity, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                {editingIndex === index ? (
                  // Edit mode
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        <input
                          type="text"
                          name="name"
                          value={editAmenity.name}
                          onChange={(e) => handleInputChange(e, true)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <input
                          type="text"
                          name="description"
                          value={editAmenity.description}
                          onChange={(e) => handleInputChange(e, true)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={handleSaveEdit}
                        className="flex items-center space-x-1 bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 transition-colors"
                      >
                        <CheckCircle className="w-3 h-3" />
                        <span className="text-sm">Save</span>
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="flex items-center space-x-1 bg-gray-100 text-gray-700 px-3 py-1 rounded-md hover:bg-gray-200 transition-colors"
                      >
                        <span className="text-sm">Cancel</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  // View mode
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {typeof amenity === 'string' ? amenity : amenity.name || 'Unnamed Amenity'}
                      </div>
                      {typeof amenity !== 'string' && amenity?.description && (
                        <div className="text-sm text-gray-500 mt-1">{amenity.description}</div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleEditAmenity(index)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit amenity"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRemoveAmenity(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove amenity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary */}
      {formData.amenities.length > 0 && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h5 className="text-sm font-medium text-purple-900 mb-2">Amenities Summary:</h5>
          <div className="text-sm text-purple-700">
            Your gym will feature <strong>{formData.amenities.length}</strong> amenities, including: {' '}
            <span className="font-medium">
              {formData.amenities.slice(0, 3).map(a => {
                return typeof a === 'string' ? a : a.name;
              }).join(', ')}
              {formData.amenities.length > 3 && ` and ${formData.amenities.length - 3} more`}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default StepAmenities;
