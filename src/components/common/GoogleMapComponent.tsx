import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

interface GoogleMapComponentProps {
  center: {
    lat: number;
    lng: number;
  };
  onLocationSelect?: (location: { lat: number; lng: number; address?: string }) => void;
  height?: string;
  zoom?: number;
  apiKey: string;
}

const GoogleMapComponent: React.FC<GoogleMapComponentProps> = ({
  center,
  onLocationSelect,
  height = '300px',
  zoom = 15,
  apiKey
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!apiKey || apiKey === 'your_google_maps_api_key_here') {
      setError('Please set a valid Google Maps API key in .env file');
      setIsLoading(false);
      return;
    }

    const initMap = async () => {
      try {
        const loader = new Loader({
          apiKey,
          version: 'weekly',
          libraries: ['places', 'geometry'],
          language: 'en',
          region: 'US'
        });

        await loader.load();

        if (mapRef.current) {
          const mapInstance = new google.maps.Map(mapRef.current, {
            center,
            zoom,
            mapTypeControl: true,
            streetViewControl: true,
            fullscreenControl: true,
          });

          setMap(mapInstance);

          // Create initial marker
          const initialMarker = new google.maps.Marker({
            position: center,
            map: mapInstance,
            draggable: true,
            title: 'Gym Location'
          });

          setMarker(initialMarker);

          // Handle marker drag
          initialMarker.addListener('dragend', () => {
            const position = initialMarker.getPosition();
            if (position && onLocationSelect) {
              const lat = position.lat();
              const lng = position.lng();
              
              // Reverse geocoding to get address
              const geocoder = new google.maps.Geocoder();
              geocoder.geocode({ location: { lat, lng } }, (results, status) => {
                if (status === 'OK' && results && results[0]) {
                  onLocationSelect({
                    lat,
                    lng,
                    address: results[0].formatted_address
                  });
                } else {
                  onLocationSelect({ lat, lng });
                }
              });
            }
          });

          // Handle map click
          mapInstance.addListener('click', (event: google.maps.MapMouseEvent) => {
            if (event.latLng) {
              const lat = event.latLng.lat();
              const lng = event.latLng.lng();

              // Move marker to clicked position
              initialMarker.setPosition({ lat, lng });

              if (onLocationSelect) {
                // Reverse geocoding to get address
                const geocoder = new google.maps.Geocoder();
                geocoder.geocode({ location: { lat, lng } }, (results, status) => {
                  if (status === 'OK' && results && results[0]) {
                    onLocationSelect({
                      lat,
                      lng,
                      address: results[0].formatted_address
                    });
                  } else {
                    onLocationSelect({ lat, lng });
                  }
                });
              }
            }
          });

          setIsLoading(false);
        }
      } catch (err) {
        console.error('Error loading Google Maps:', err);
        setError('Failed to load Google Maps');
        setIsLoading(false);
      }
    };

    initMap();
  }, [apiKey, center.lat, center.lng, zoom, onLocationSelect]);

  // Update marker position when center prop changes
  useEffect(() => {
    if (map && marker && (center.lat !== 0 || center.lng !== 0)) {
      const newPosition = { lat: center.lat, lng: center.lng };
      marker.setPosition(newPosition);
      map.setCenter(newPosition);
      map.setZoom(zoom);
    }
  }, [center.lat, center.lng, map, marker, zoom]);

  if (error) {
    return (
      <div 
        className="w-full bg-red-50 border border-red-200 rounded-lg flex items-center justify-center text-red-600"
        style={{ height }}
      >
        <div className="text-center">
          <p className="font-medium">Map Error</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full" style={{ height }}>
      <div 
        ref={mapRef} 
        className="w-full h-full rounded-lg"
        style={{ height }}
      />
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-sm text-gray-600 mt-2">Loading map...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoogleMapComponent;
