import React, { useEffect, useState } from 'react';
import { MapPin, Map, Navigation, Loader2, Target, CheckCircle, AlertCircle, Building, Phone, Globe } from 'lucide-react';
import GoogleMapComponent from '../../common/GoogleMapComponent';
import GooglePlacesAutocomplete from '../../common/GooglePlacesAutocomplete';
import FallbackLocationInput from '../../common/FallbackLocationInput';
import useGeolocation from '../../hooks/useGeolocation';

interface Location {
  address: string;
  city: string;
  state: string;
  zip: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

interface FormData {
  location: Location;
  [key: string]: any;
}

interface StepLocationProps {
  formData: FormData;
  onChange: (data: FormData) => void;
  isEditing?: boolean;
  setCurrentStep?: (step: number) => void;
}

const StepLocation: React.FC<StepLocationProps> = ({ formData, onChange, isEditing, setCurrentStep }) => {
  const [mapCenter, setMapCenter] = useState({
    lat: formData.location.coordinates.latitude || 40.7128,
    lng: formData.location.coordinates.longitude || -74.0060
  });
  
  console.log('DEBUG StepLocation ENTRY:', {
    isEditing,
    formDataLocation: formData.location
  });

  // Completely avoid geolocation when editing
  const geolocationResult = !isEditing ? useGeolocation() : null;
  const coordinates = geolocationResult?.coordinates || null;
  const loading = geolocationResult?.loading || false;
  const error = geolocationResult?.error || null;
  const getCurrentPosition = geolocationResult?.getCurrentPosition || (() => {});

  const [hasExistingLocation, setHasExistingLocation] = useState(false);

  console.log('DEBUG StepLocation STATE:', {
    isEditing,
    hasExistingLocation,
    formDataLocation: formData.location,
    coordinates,
    geolocationResult: !!geolocationResult
  });

  // Check if we have existing location data on mount
  useEffect(() => {
    if (formData.location.coordinates.latitude !== 0 || formData.location.coordinates.longitude !== 0 ||
        formData.location.address || formData.location.city || formData.location.state || formData.location.zip) {
      setHasExistingLocation(true);
    }
  }, []);

  // Only update with current location if we don't have existing location data AND not editing
  useEffect(() => {
    if (coordinates && !hasExistingLocation && !isEditing) {
      const newCenter = {
        lat: coordinates.latitude,
        lng: coordinates.longitude
      };
      setMapCenter(newCenter);
      
      // Only update form data with current location if no existing location and not editing
      onChange({
        ...formData,
        location: {
          ...formData.location,
          coordinates: {
            latitude: coordinates.latitude,
            longitude: coordinates.longitude
          }
        }
      });
    }
  }, [coordinates, hasExistingLocation, isEditing]);

  // Update map center when form data coordinates change
  useEffect(() => {
    if (formData.location.coordinates.latitude !== 0 || formData.location.coordinates.longitude !== 0) {
      setMapCenter({
        lat: formData.location.coordinates.latitude,
        lng: formData.location.coordinates.longitude
      });
    }
  }, [formData.location.coordinates.latitude, formData.location.coordinates.longitude]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    console.log('DEBUG StepLocation handleInputChange:', {
      name,
      value,
      currentLocationData: formData.location
    });

    const updatedLocation = {
      ...formData.location,
      [name]: value
    };

    console.log('DEBUG StepLocation updatedLocation:', updatedLocation);

    onChange({
      ...formData,
      location: updatedLocation
    });
  };

  const handleMapLocationSelect = (location: { lat: number; lng: number; address?: string }) => {
    const updatedLocation = {
      ...formData.location,
      coordinates: {
        latitude: location.lat,
        longitude: location.lng
      }
    };

    if (location.address) {
      // Parse address components if available
      updatedLocation.address = location.address;
    }

    onChange({
      ...formData,
      location: updatedLocation
    });
  };

  const handlePlaceSelect = (place: any) => {
    const addressComponents = place.address_components || [];
    
    // Parse address components
    let streetNumber = '';
    let route = '';
    let city = '';
    let state = '';
    let zip = '';
    let country = '';

    addressComponents.forEach((component: any) => {
      const types = component.types;
      
      if (types.includes('street_number')) {
        streetNumber = component.long_name;
      } else if (types.includes('route')) {
        route = component.long_name;
      } else if (types.includes('locality') || types.includes('administrative_area_level_3')) {
        city = component.long_name;
      } else if (types.includes('administrative_area_level_1')) {
        state = component.short_name;
      } else if (types.includes('postal_code')) {
        zip = component.long_name;
      } else if (types.includes('country')) {
        country = component.long_name;
      }
    });

    const fullAddress = `${streetNumber} ${route}`.trim();
    
    const updatedLocation = {
      address: fullAddress || place.formatted_address,
      city: city,
      state: state,
      zip: zip,
      coordinates: {
        latitude: place.geometry.location.lat,
        longitude: place.geometry.location.lng
      }
    };

    onChange({
      ...formData,
      location: updatedLocation
    });
  };

  const handleFallbackLocationSelect = (location: {
    address: string;
    city: string;
    state: string;
    zip: string;
    coordinates: { latitude: number; longitude: number };
  }) => {
    onChange({
      ...formData,
      location: {
        address: location.address,
        city: location.city,
        state: location.state,
        zip: location.zip,
        coordinates: {
          latitude: location.coordinates.latitude,
          longitude: location.coordinates.longitude
        }
      }
    });
  };

  // Get API key from environment variables
  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <MapPin className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Location</h3>
        <p className="text-sm text-gray-600">
          {isEditing 
            ? "Location details (cannot be changed after gym creation)"
            : "Specify the physical location of the gym."
          }
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="flex justify-center">
        <div className="flex items-center space-x-2">
          <div onClick={() => {setCurrentStep(0)}} className="cursor-pointer w-8 h-8 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center text-sm font-medium">1</div>
          <div className="w-12 h-1 bg-gray-200 rounded"></div>
          <div onClick={() => {setCurrentStep(1)}} className="cursor-pointer w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">2</div>
          <div className="w-12 h-1 bg-gray-200 rounded"></div>
          <div onClick={() => {setCurrentStep(2)}} className="cursor-pointer w-8 h-8 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center text-sm font-medium">3</div>
          <div className="w-12 h-1 bg-gray-200 rounded"></div>
          <div onClick={() => {setCurrentStep(3)}} className="cursor-pointer w-8 h-8 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center text-sm font-medium">4</div>
          <div className="w-12 h-1 bg-gray-200 rounded"></div>
          <div onClick={() => {setCurrentStep(4)}} className="cursor-pointer w-8 h-8 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center text-sm font-medium">5</div>
        </div>
      </div>


      {/* Address Search - Hide when editing */}
      {!isEditing && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Location
            </label>
            <p className="text-xs text-gray-500 mb-2">
              Search for an address or use your current location
            </p>
            {googleMapsApiKey && googleMapsApiKey !== 'your_google_maps_api_key_here' ? (
              <GooglePlacesAutocomplete
                apiKey={googleMapsApiKey}
                onPlaceSelect={handlePlaceSelect}
                placeholder="Search for gym location..."
                types={['establishment', 'geocode']}
                useCurrentLocation={!isEditing}
              />
            ) : (
              <FallbackLocationInput
                onLocationSelect={handleFallbackLocationSelect}
                placeholder="Enter address or use current location..."
              />
            )}
          </div>
        </div>
      )}

      {/* Read-only notice when editing */}
      {isEditing && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-amber-600 mr-2" />
            <div>
              <h4 className="text-sm font-medium text-amber-800">Location cannot be changed</h4>
              <p className="text-xs text-amber-700 mt-1">
                The gym location is fixed and cannot be modified after creation. Contact support if you need to update the location.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">

        {/* Manual Address Fields */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Address {isEditing && <span className="text-xs text-gray-500">(Read-only)</span>}
          </label>
          <input
            type="text"
            name="address"
            value={formData.location.address}
            onChange={handleInputChange}
            disabled={isEditing}
            className={`w-full px-3 py-2 border rounded-lg ${
              isEditing 
                ? 'border-gray-200 bg-gray-50 text-gray-600 cursor-not-allowed'
                : 'border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent'
            }`}
            placeholder="123 Main St"
            required={!isEditing}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              City {isEditing && <span className="text-xs text-gray-500">(Read-only)</span>}
            </label>
            <input
              type="text"
              name="city"
              value={formData.location.city}
              onChange={handleInputChange}
              disabled={isEditing}
              className={`w-full px-3 py-2 border rounded-lg ${
                isEditing 
                  ? 'border-gray-200 bg-gray-50 text-gray-600 cursor-not-allowed'
                  : 'border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent'
              }`}
              placeholder="City"
              required={!isEditing}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              State {isEditing && <span className="text-xs text-gray-500">(Read-only)</span>}
            </label>
            <input
              type="text"
              name="state"
              value={formData.location.state}
              onChange={handleInputChange}
              disabled={isEditing}
              className={`w-full px-3 py-2 border rounded-lg ${
                isEditing 
                  ? 'border-gray-200 bg-gray-50 text-gray-600 cursor-not-allowed'
                  : 'border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent'
              }`}
              placeholder="State"
              required={!isEditing}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ZIP Code {isEditing && <span className="text-xs text-gray-500">(Read-only)</span>}
            </label>
            <input
              type="text"
              name="zip"
              value={formData.location.zip}
              onChange={handleInputChange}
              disabled={isEditing}
              className={`w-full px-3 py-2 border rounded-lg ${
                isEditing 
                  ? 'border-gray-200 bg-gray-50 text-gray-600 cursor-not-allowed'
                  : 'border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent'
              }`}
              placeholder="ZIP Code"
              required={!isEditing}
            />
          </div>
          <div></div>
        </div>
      </div>

      {/* Map */}
      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Exact Location {isEditing && <span className="text-xs text-gray-500">(Read-only)</span>}
        </label>
        <p className="text-xs text-gray-500 mb-2">
          {isEditing 
            ? "Current location marker (interaction disabled)"
            : "Click on the map or drag the marker to set the gym's exact location"
          }
        </p>
        {googleMapsApiKey ? (
          <div className={isEditing ? "pointer-events-none opacity-75" : ""}>
            <GoogleMapComponent
              center={{
                lat: formData.location.coordinates.latitude || 40.7128, // Default to NYC if no coordinates
                lng: formData.location.coordinates.longitude || -74.0060
              }}
              onLocationSelect={isEditing ? () => {} : handleMapLocationSelect}
              height="300px"
              zoom={15}
              apiKey={googleMapsApiKey}
            />
          </div>
        ) : (
          <div className="w-full h-48 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center justify-center">
            <div className="text-center text-yellow-700">
              <Map className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm font-medium">Google Maps API Key Required</p>
              <p className="text-xs">Please add VITE_GOOGLE_MAPS_API_KEY to your .env file</p>
            </div>
          </div>
        )}
      </div>

      {/* Coordinates Display */}
      {(formData.location.coordinates.latitude !== 0 || formData.location.coordinates.longitude !== 0) && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <h4 className="text-sm font-medium text-green-900 mb-1">Selected Coordinates</h4>
          <div className="text-xs text-green-700">
            <p>Latitude: {formData.location.coordinates.latitude.toFixed(6)}</p>
            <p>Longitude: {formData.location.coordinates.longitude.toFixed(6)}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default StepLocation;
