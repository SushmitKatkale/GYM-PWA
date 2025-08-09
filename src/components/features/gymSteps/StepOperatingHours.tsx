import React, { useState } from 'react';
import { Calendar, Clock, Plus, Trash2, Star, Tag } from 'lucide-react';

interface OperatingHours {
  open: string;
  close: string;
}

interface SubscriptionFeature {
  title: string;
  isHighlighted: boolean;
}

interface Plan {
  title: string;
  validityDays: number;
  price: number;
  discountedPrice: number;
  isMostPopular: boolean;
  isCheapest: boolean;
  features: SubscriptionFeature[];
}

interface FormData {
  operatingHours: OperatingHours;
  plans: Plan[];
  [key: string]: any;
}

interface StepOperatingHoursProps {
  formData: FormData;
  onChange: (data: FormData) => void;
}

const StepOperatingHours: React.FC<StepOperatingHoursProps> = ({ formData, onChange, setCurrentStep }) => {
  const [newFeature, setNewFeature] = useState<SubscriptionFeature>({ title: '', isHighlighted: false });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, dataset, type, checked } = e.target;

    if (dataset.type === 'operatingHours') {
      const updatedHours = {
        ...formData.operatingHours,
        [name]: value
      };
      onChange({ ...formData, operatingHours: updatedHours });
    }

    if (dataset.type === 'plans') {
      const index = Number(dataset.index);
      const updatedPlans = [...formData.plans];
      const processedValue = type === 'checkbox' ? checked : 
        (name === 'price' || name === 'discountedPrice' || name === 'validityDays') ? 
        parseFloat(value) || 0 : value;
      
      updatedPlans[index] = {
        ...updatedPlans[index],
        [name]: processedValue
      };
      onChange({ ...formData, plans: updatedPlans });
    }
  };

  const handleAddPlan = () => {
    const newPlan: Plan = {
      title: '',
      validityDays: 30,
      price: 0,
      discountedPrice: 0,
      isMostPopular: false,
      isCheapest: false,
      features: []
    };
    onChange({ ...formData, plans: [...formData.plans, newPlan] });
  };

  const handleRemovePlan = (index: number) => {
    const updatedPlans = formData.plans.filter((_, i) => i !== index);
    onChange({ ...formData, plans: updatedPlans });
  };

  const handleAddFeature = (planIndex: number) => {
    if (newFeature.title.trim()) {
      const updatedPlans = [...formData.plans];
      // Initialize features array if it doesn't exist
      if (!updatedPlans[planIndex].features) {
        updatedPlans[planIndex].features = [];
      }
      updatedPlans[planIndex].features.push({ ...newFeature });
      
      onChange({ ...formData, plans: updatedPlans });
      setNewFeature({ title: '', isHighlighted: false });
    }
  };

  const handleRemoveFeature = (planIndex: number, featureIndex: number) => {
    const updatedPlans = [...formData.plans];
    // Initialize features array if it doesn't exist
    if (!updatedPlans[planIndex].features) {
      updatedPlans[planIndex].features = [];
    }
    updatedPlans[planIndex].features.splice(featureIndex, 1);
    onChange({ ...formData, plans: updatedPlans });
  };

  const handleFeatureInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const processedValue = type === 'checkbox' ? checked : value;
    setNewFeature({ ...newFeature, [name]: processedValue });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Clock className="w-8 h-8 text-yellow-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Operating Hours & Plans</h3>
        <p className="text-sm text-gray-600">Define the gym's operating hours and membership plans.</p>
      </div>

      {/* Progress Indicator */}
      <div className="flex justify-center">
        <div className="flex items-center space-x-2">
          <div onClick={() => {setCurrentStep(0)}} className="cursor-pointer w-8 h-8 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center text-sm font-medium">1</div>
          <div className="w-16 h-1 bg-gray-200 rounded"></div>
          <div onClick={() => {setCurrentStep(1)}} className="cursor-pointer w-8 h-8 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center text-sm font-medium">2</div>
          <div className="w-16 h-1 bg-gray-200 rounded"></div>
          <div onClick={() => {setCurrentStep(2)}} className="cursor-pointer w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">3</div>
          <div className="w-16 h-1 bg-gray-200 rounded"></div>
          <div onClick={() => {setCurrentStep(3)}} className="cursor-pointer w-8 h-8 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center text-sm font-medium">4</div>
        </div>
      </div>


      {/* Operating Hours */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Opening Time
            </label>
            <input
              type="time"
              name="open"
              data-type="operatingHours"
              value={formData.operatingHours.open}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Closing Time
            </label>
            <input
              type="time"
              name="close"
              data-type="operatingHours"
              value={formData.operatingHours.close}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              required
            />
          </div>
        </div>
      </div>

      {/* Membership Plans */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h4 className="text-lg font-semibold text-gray-700 flex items-center">
            <Tag className="w-5 h-5 mr-2" />
            Membership Plans
          </h4>
          <button
            onClick={handleAddPlan}
            className="flex items-center space-x-2 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Plan</span>
          </button>
        </div>

        {formData.plans.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <Tag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No membership plans added yet</p>
            <p className="text-sm text-gray-400">Click "Add Plan" to create your first subscription plan</p>
          </div>
        ) : (
          formData.plans.map((plan, planIndex) => (
            <div key={planIndex} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              {/* Plan Header */}
              <div className="flex justify-between items-center mb-4">
                <h5 className="text-md font-semibold text-gray-800">
                  Plan {planIndex + 1}
                </h5>
                <button
                  onClick={() => handleRemovePlan(planIndex)}
                  className="flex items-center space-x-1 text-red-500 hover:text-red-700 transition-colors p-2 rounded-lg hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="text-sm">Remove</span>
                </button>
              </div>

              {/* Basic Plan Information */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Plan Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    data-type="plans"
                    data-index={planIndex}
                    value={plan.title}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="e.g., Premium Monthly"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Validity (Days) *
                  </label>
                  <input
                    type="number"
                    name="validityDays"
                    data-type="plans"
                    data-index={planIndex}
                    value={plan.validityDays}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="30"
                    min="1"
                    required
                  />
                </div>
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Regular Price * ($)
                  </label>
                  <input
                    type="number"
                    name="price"
                    data-type="plans"
                    data-index={planIndex}
                    value={plan.price}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="49.99"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Discounted Price ($)
                  </label>
                  <input
                    type="number"
                    name="discountedPrice"
                    data-type="plans"
                    data-index={planIndex}
                    value={plan.discountedPrice}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="39.99"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              {/* Plan Flags */}
              <div className="flex items-center space-x-6 mb-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isMostPopular"
                    data-type="plans"
                    data-index={planIndex}
                    checked={plan.isMostPopular}
                    onChange={handleInputChange}
                    className="mr-2 h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                  />
                  <label className="text-sm text-gray-700 flex items-center">
                    <Star className="w-4 h-4 mr-1 text-yellow-500" />
                    Most Popular
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isCheapest"
                    data-type="plans"
                    data-index={planIndex}
                    checked={plan.isCheapest}
                    onChange={handleInputChange}
                    className="mr-2 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <label className="text-sm text-gray-700 flex items-center">
                    <Tag className="w-4 h-4 mr-1 text-green-500" />
                    Cheapest Option
                  </label>
                </div>
              </div>

              {/* Features Section */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-3">
                  <h6 className="text-sm font-semibold text-gray-700">Plan Features</h6>
                </div>

                {/* Add Feature Form */}
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <input
                      type="text"
                      name="title"
                      value={newFeature.title}
                      onChange={handleFeatureInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      placeholder="e.g., Access to swimming pool"
                    />
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="isHighlighted"
                        checked={newFeature.isHighlighted}
                        onChange={handleFeatureInputChange}
                        className="mr-2 h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                      />
                      <label className="text-sm text-gray-700">Highlight</label>
                    </div>
                    <button
                      onClick={() => handleAddFeature(planIndex)}
                      className="flex items-center space-x-1 bg-gray-100 text-gray-700 px-3 py-1 rounded-md hover:bg-gray-200 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                      <span className="text-sm">Add</span>
                    </button>
                  </div>
                </div>

                {/* Features List */}
                {plan.features && plan.features.length > 0 && (
                  <div className="space-y-2">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center justify-between bg-gray-50 p-2 rounded-lg">
                        <div className="flex items-center space-x-2">
                          {feature.isHighlighted && <Star className="w-4 h-4 text-yellow-500" />}
                          <span className={`text-sm ${feature.isHighlighted ? 'font-medium text-yellow-700' : 'text-gray-700'}`}>
                            {feature.title}
                          </span>
                        </div>
                        <button
                          onClick={() => handleRemoveFeature(planIndex, featureIndex)}
                          className="text-red-500 hover:text-red-700 p-1 rounded"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {(!plan.features || plan.features.length === 0) && (
                  <p className="text-sm text-gray-400 text-center py-2">No features added yet</p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StepOperatingHours;
