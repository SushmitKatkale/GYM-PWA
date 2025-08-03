import React, { useEffect, useRef, useState } from 'react';
import { googleMapsLoader } from '../../services/googleMapsLoader';
import { MapPin, X, Search } from 'lucide-react';

interface PlacesAutocompleteProps {
  onPlaceSelect: (place: {
    address: string;
    lat: number;
    lng: number;
    placeId?: string;
  }) => void;
  placeholder?: string;
  value?: string;
  className?: string;
  disabled?: boolean;
}

export const PlacesAutocomplete: React.FC<PlacesAutocompleteProps> = ({
  onPlaceSelect,
  placeholder = "Search for a location...",
  value = "",
  className = "",
  disabled = false
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [error, setError] = useState<string>('');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const loadGoogleMaps = async () => {
      try {
        await googleMapsLoader.load();
        setIsLoaded(true);
      } catch (error) {
        console.error('Error loading Google Maps:', error);
        setError(error instanceof Error ? error.message : 'Failed to load Google Maps');
      }
    };

    loadGoogleMaps();
  }, []);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleGeocodeSearch = async () => {
    if (!inputValue.trim() || !isLoaded) return;
    
    setIsSearching(true);
    try {
      const geocoder = new google.maps.Geocoder();
      const result = await geocoder.geocode({ address: inputValue });
      
      if (result.results && result.results.length > 0) {
        const place = result.results[0];
        const location = place.geometry.location;
        
        onPlaceSelect({
          address: place.formatted_address,
          lat: location.lat(),
          lng: location.lng(),
          placeId: place.place_id
        });
        
        setInputValue(place.formatted_address);
      } else {
        alert('Location not found. Please try a different address.');
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      alert('Error searching for location. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleGeocodeSearch();
    }
  };

  const handleClear = () => {
    setInputValue('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  if (error) {
    return (
      <div className={`relative ${className}`}>
        <div className="w-full pl-10 pr-10 py-3 border border-red-300 rounded-lg bg-red-50 flex items-center text-red-600">
          <MapPin className="absolute left-3 w-5 h-5" />
          <span className="text-sm">{error}</span>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className={`relative ${className}`}>
        <div className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-100 flex items-center text-gray-500">
          <MapPin className="absolute left-3 w-5 h-5" />
          <span className="text-sm">Loading Google Maps...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
      
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        disabled={disabled || !isLoaded}
        className={`w-full pl-10 pr-20 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
          disabled || !isLoaded ? 'bg-gray-100 cursor-not-allowed' : ''
        }`}
      />
      
      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
        {inputValue && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        
        <button
          type="button"
          onClick={handleGeocodeSearch}
          disabled={disabled || !isLoaded || !inputValue.trim() || isSearching}
          className="text-blue-500 hover:text-blue-700 disabled:text-gray-400 transition-colors"
          title="Search location"
        >
          {isSearching ? (
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
};
