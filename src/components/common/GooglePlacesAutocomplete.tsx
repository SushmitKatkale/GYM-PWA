import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { Search, MapPin, Loader2, Navigation } from 'lucide-react';

interface PlaceResult {
  place_id: string;
  formatted_address: string;
  name: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  address_components: google.maps.GeocoderAddressComponent[];
}

interface GooglePlacesAutocompleteProps {
  apiKey: string;
  onPlaceSelect: (place: PlaceResult) => void;
  placeholder?: string;
  types?: string[];
  componentRestrictions?: { country: string };
  className?: string;
  useCurrentLocation?: boolean;
}

const GooglePlacesAutocomplete: React.FC<GooglePlacesAutocompleteProps> = ({
  apiKey,
  onPlaceSelect,
  placeholder = "Search for a location...",
  types = ['establishment', 'geocode'],
  componentRestrictions,
  className = "",
  useCurrentLocation = true
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'getting' | 'success' | 'error'>('idle');

  // Get user's current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      return;
    }

    setLocationStatus('getting');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setCurrentLocation(location);
        setLocationStatus('success');
        
        // Reverse geocode to get address
        if (window.google && window.google.maps) {
          const geocoder = new google.maps.Geocoder();
          geocoder.geocode({ location }, (results, status) => {
            if (status === 'OK' && results && results[0] && inputRef.current) {
              inputRef.current.value = results[0].formatted_address;
              
              // Create place result from geocoding
              const placeResult: PlaceResult = {
                place_id: results[0].place_id || '',
                formatted_address: results[0].formatted_address,
                name: results[0].formatted_address,
                geometry: {
                  location: {
                    lat: location.lat,
                    lng: location.lng
                  }
                },
                address_components: results[0].address_components
              };
              onPlaceSelect(placeResult);
            }
          });
        } else {
          // Fallback when Google Maps is not loaded
          if (inputRef.current) {
            inputRef.current.value = `Current Location: ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`;
          }
          
          const placeResult: PlaceResult = {
            place_id: '',
            formatted_address: `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`,
            name: 'Current Location',
            geometry: {
              location: {
                lat: location.lat,
                lng: location.lng
              }
            },
            address_components: []
          };
          onPlaceSelect(placeResult);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        setLocationStatus('error');
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setError('Location access denied by user');
            break;
          case error.POSITION_UNAVAILABLE:
            setError('Location information unavailable');
            break;
          case error.TIMEOUT:
            setError('Location request timed out');
            break;
          default:
            setError('An unknown error occurred');
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  useEffect(() => {
    if (!apiKey || apiKey === 'your_google_maps_api_key_here') {
      setError('Please set a valid Google Maps API key in .env file');
      return;
    }

    const initAutocomplete = async () => {
      try {
        setIsLoading(true);
        const loader = new Loader({
          apiKey,
          version: 'weekly',
          libraries: ['places', 'geometry'],
          language: 'en',
          region: 'US'
        });

        await loader.load();

        if (inputRef.current) {
          const autocompleteOptions: google.maps.places.AutocompleteOptions = {
            types,
            fields: [
              'place_id',
              'formatted_address',
              'name',
              'geometry',
              'address_components'
            ]
          };

          // Add component restrictions if provided
          if (componentRestrictions) {
            autocompleteOptions.componentRestrictions = componentRestrictions;
          }

          // Set bias to current location if available
          if (currentLocation) {
            autocompleteOptions.locationBias = new google.maps.Circle({
              center: currentLocation,
              radius: 50000 // 50km radius
            });
          }

          const autocomplete = new google.maps.places.Autocomplete(
            inputRef.current,
            autocompleteOptions
          );

          autocompleteRef.current = autocomplete;

          autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();
            
            if (!place.geometry || !place.geometry.location) {
              console.log('No details available for input: ' + place.name);
              return;
            }

            const placeResult: PlaceResult = {
              place_id: place.place_id || '',
              formatted_address: place.formatted_address || '',
              name: place.name || '',
              geometry: {
                location: {
                  lat: place.geometry.location.lat(),
                  lng: place.geometry.location.lng()
                }
              },
              address_components: place.address_components || []
            };

            onPlaceSelect(placeResult);
          });
        }

        setIsLoading(false);
      } catch (err) {
        console.error('Error initializing Google Places:', err);
        setError('Failed to load Google Places');
        setIsLoading(false);
      }
    };

    initAutocomplete();

    // Cleanup
    return () => {
      if (autocompleteRef.current && google?.maps?.event) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [apiKey, types, componentRestrictions, currentLocation]);

  // Auto-get location on mount if enabled
  useEffect(() => {
    if (useCurrentLocation && locationStatus === 'idle') {
      getCurrentLocation();
    }
  }, [useCurrentLocation]);

  if (error && !inputRef.current?.value) {
    return (
      <div className={`relative ${className}`}>
        <div className="w-full px-3 py-2 border border-red-300 rounded-lg bg-red-50 text-red-700 text-sm">
          <div className="flex items-center">
            <MapPin className="w-4 h-4 mr-2" />
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={isLoading}
        />
        
        {/* Current Location Button */}
        {useCurrentLocation && (
          <button
            type="button"
            onClick={getCurrentLocation}
            disabled={locationStatus === 'getting' || isLoading}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-blue-500 disabled:opacity-50"
            title="Use current location"
          >
            {locationStatus === 'getting' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Navigation className="w-4 h-4" />
            )}
          </button>
        )}
        
        {/* Loading Indicator */}
        {isLoading && (
          <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
            <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
          </div>
        )}
      </div>

      {/* Location Status */}
      {locationStatus === 'success' && currentLocation && (
        <div className="mt-2 text-xs text-green-600 flex items-center">
          <Navigation className="w-3 h-3 mr-1" />
          Location detected: {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}
        </div>
      )}

      {locationStatus === 'error' && error && (
        <div className="mt-2 text-xs text-red-600 flex items-center">
          <MapPin className="w-3 h-3 mr-1" />
          {error}
        </div>
      )}
    </div>
  );
};

export default GooglePlacesAutocomplete;
