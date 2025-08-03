import React, { useState } from 'react';
import { Search, MapPin, Navigation, Loader2 } from 'lucide-react';

interface FallbackLocationInputProps {
  onLocationSelect: (location: {
    address: string;
    city: string;
    state: string;
    zip: string;
    coordinates: { latitude: number; longitude: number };
  }) => void;
  placeholder?: string;
  className?: string;
}

const FallbackLocationInput: React.FC<FallbackLocationInputProps> = ({
  onLocationSelect,
  placeholder = "Enter address manually...",
  className = ""
}) => {
  const [address, setAddress] = useState('');
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress(e.target.value);
  };

  const handleAddressSubmit = () => {
    if (address.trim()) {
      // Parse basic address (this is a simple fallback)
      const parts = address.split(',').map(part => part.trim());
      
      onLocationSelect({
        address: parts[0] || address,
        city: parts[1] || '',
        state: parts[2] || '',
        zip: parts[3] || '',
        coordinates: { latitude: 0, longitude: 0 } // Will need manual input
      });
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser');
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setIsGettingLocation(false);
        
        // For fallback, we'll just set coordinates and let user fill address
        onLocationSelect({
          address: `Location: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
          city: '',
          state: '',
          zip: '',
          coordinates: { latitude, longitude }
        });
        
        setAddress(`Location: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
      },
      (error) => {
        setIsGettingLocation(false);
        console.error('Geolocation error:', error);
        alert('Could not get your location. Please enter address manually.');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          value={address}
          onChange={handleAddressChange}
          onKeyPress={(e) => e.key === 'Enter' && handleAddressSubmit()}
          placeholder={placeholder}
          className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        
        {/* Current Location Button */}
        <button
          type="button"
          onClick={getCurrentLocation}
          disabled={isGettingLocation}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-blue-500 disabled:opacity-50"
          title="Use current location"
        >
          {isGettingLocation ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Navigation className="w-4 h-4" />
          )}
        </button>
      </div>

      {address && (
        <button
          onClick={handleAddressSubmit}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Use This Address
        </button>
      )}

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
        <div className="flex items-start">
          <MapPin className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-yellow-800">Google Maps API not configured</p>
            <p className="text-yellow-700 mt-1">
              Enter address manually or use current location. Format: Street, City, State, ZIP
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FallbackLocationInput;
