import React from 'react';
import { Phone, Mail, Globe, FileText, Building, Calendar } from 'lucide-react';

interface FormData {
  email: string;
  phone: string;
  websiteUrl: string;
  gstNumber: string;
  registrationNo: string;
  daysOpen: string;
  [key: string]: any;
}

interface StepContactInfoProps {
  formData: FormData;
  onChange: (data: FormData) => void;
  setCurrentStep: (step: number) => void;
}

const StepContactInfo: React.FC<StepContactInfoProps> = ({ formData, onChange, setCurrentStep }) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    onChange({
      ...formData,
      [name]: value
    });
  };

  const daysOptions = [
    { value: '', label: 'Select Days' },
    { value: 'Mon-Sun', label: 'Monday - Sunday (7 days)' },
    { value: 'Mon-Sat', label: 'Monday - Saturday (6 days)' },
    { value: 'Mon-Fri', label: 'Monday - Friday (5 days)' },
    { value: 'Tue-Sun', label: 'Tuesday - Sunday (6 days)' },
    { value: 'Custom', label: 'Custom Schedule' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Phone className="w-8 h-8 text-purple-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Contact & Business Info</h3>
        <p className="text-sm text-gray-600">Add contact details and business information for your gym</p>
      </div>

      {/* Progress Indicator */}
      <div className="flex justify-center">
        <div className="flex items-center space-x-2">
          <div onClick={() => setCurrentStep(0)} className="cursor-pointer w-8 h-8 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center text-sm font-medium">1</div>
          <div className="w-16 h-1 bg-gray-200 rounded"></div>
          <div onClick={() => setCurrentStep(1)} className="cursor-pointer w-8 h-8 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center text-sm font-medium">2</div>
          <div className="w-16 h-1 bg-gray-200 rounded"></div>
          <div onClick={() => setCurrentStep(2)} className="cursor-pointer w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-medium">3</div>
          <div className="w-16 h-1 bg-gray-200 rounded"></div>
          <div onClick={() => setCurrentStep(3)} className="cursor-pointer w-8 h-8 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center text-sm font-medium">4</div>
          <div className="w-16 h-1 bg-gray-200 rounded"></div>
          <div onClick={() => setCurrentStep(4)} className="cursor-pointer w-8 h-8 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center text-sm font-medium">5</div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-gray-900 border-b pb-2">Contact Information</h4>
        
        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Mail className="w-4 h-4 inline mr-2" />
            Email Address
          </label>
          <input
            type="email"
            name="email"
            value={formData.email || ''}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="contact@gymname.com"
          />
          <p className="text-xs text-gray-500 mt-1">Primary contact email for the gym</p>
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Phone className="w-4 h-4 inline mr-2" />
            Phone Number
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone || ''}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="+1 (555) 123-4567"
          />
          <p className="text-xs text-gray-500 mt-1">Contact phone number including country code</p>
        </div>

        {/* Website URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Globe className="w-4 h-4 inline mr-2" />
            Website URL
          </label>
          <input
            type="url"
            name="websiteUrl"
            value={formData.websiteUrl || ''}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="https://www.gymname.com"
          />
          <p className="text-xs text-gray-500 mt-1">Official website or social media page</p>
        </div>
      </div>

      {/* Business Information */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-gray-900 border-b pb-2">Business Information</h4>
        
        {/* GST Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FileText className="w-4 h-4 inline mr-2" />
            GST Number
          </label>
          <input
            type="text"
            name="gstNumber"
            value={formData.gstNumber || ''}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="22AAAAA0000A1Z5"
          />
          <p className="text-xs text-gray-500 mt-1">Goods and Services Tax registration number</p>
        </div>

        {/* Registration Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Building className="w-4 h-4 inline mr-2" />
            Business Registration Number
          </label>
          <input
            type="text"
            name="registrationNo"
            value={formData.registrationNo || ''}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="REG123456789"
          />
          <p className="text-xs text-gray-500 mt-1">Official business registration number</p>
        </div>

        {/* Days Open */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="w-4 h-4 inline mr-2" />
            Days of Operation
          </label>
          <select
            name="daysOpen"
            value={formData.daysOpen || ''}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-white"
          >
            {daysOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">Select the days your gym is open for business</p>
        </div>
      </div>

      {/* Validation Summary */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-purple-900 mb-2">Optional Fields Status:</h4>
        <div className="text-xs text-purple-700 grid grid-cols-2 gap-2">
          <div className="flex items-center">
            <div className={`w-2 h-2 rounded-full mr-2 ${formData.email ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            Email {formData.email ? '✓' : '(Optional)'}
          </div>
          <div className="flex items-center">
            <div className={`w-2 h-2 rounded-full mr-2 ${formData.phone ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            Phone {formData.phone ? '✓' : '(Optional)'}
          </div>
          <div className="flex items-center">
            <div className={`w-2 h-2 rounded-full mr-2 ${formData.websiteUrl ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            Website {formData.websiteUrl ? '✓' : '(Optional)'}
          </div>
          <div className="flex items-center">
            <div className={`w-2 h-2 rounded-full mr-2 ${formData.gstNumber ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            GST {formData.gstNumber ? '✓' : '(Optional)'}
          </div>
          <div className="flex items-center">
            <div className={`w-2 h-2 rounded-full mr-2 ${formData.registrationNo ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            Registration {formData.registrationNo ? '✓' : '(Optional)'}
          </div>
          <div className="flex items-center">
            <div className={`w-2 h-2 rounded-full mr-2 ${formData.daysOpen ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            Days Open {formData.daysOpen ? '✓' : '(Optional)'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepContactInfo;
