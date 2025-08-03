import React, { useEffect, useRef, useState } from 'react';
import { googleMapsLoader } from '../../services/googleMapsLoader';

interface GoogleMapProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  height?: string;
  onLocationSelect?: (location: { lat: number; lng: number; address?: string }) => void;
  markers?: Array<{
    position: { lat: number; lng: number };
    title?: string;
    info?: string;
  }>;
  enableLocationPicker?: boolean;
  className?: string;
}

export const GoogleMap: React.FC<GoogleMapProps> = ({
  center = { lat: 40.7128, lng: -74.0060 }, // Default to NYC
  zoom = 12,
  height = '400px',
  onLocationSelect,
  markers = [],
  enableLocationPicker = false,
  className = ''
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string>('');
  const markersRef = useRef<google.maps.Marker[]>([]);

  useEffect(() => {
    const loadGoogleMaps = async () => {
      try {
        await googleMapsLoader.load();
        setIsLoaded(true);
      } catch (error) {
        console.error('Error loading Google Maps:', error);
        setError(error instanceof Error ? error.message : 'Failed to load Google Maps. Please check your API key and internet connection.');
      }
    };

    loadGoogleMaps();
  }, []);

  useEffect(() => {
    if (isLoaded && mapRef.current && !map) {
      const newMap = new google.maps.Map(mapRef.current, {
        center,
        zoom,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
        zoomControl: true,
        styles: [
          {
            featureType: 'poi.business',
            stylers: [{ visibility: 'off' }]
          }
        ]
      });

      setMap(newMap);

      // Add click listener for location selection
      if (enableLocationPicker) {
        // Safely cast to unknown before assigning to avoid TypeScript warning
        const mapElement = newMap as unknown as HTMLElement;
        newMap.addListener('click', async (event: google.maps.MapMouseEvent) => {
          if (event.latLng && onLocationSelect) {
            const lat = event.latLng.lat();
            const lng = event.latLng.lng();
            
            // Try to get address using reverse geocoding
            try {
              const geocoder = new google.maps.Geocoder();
              const result = await geocoder.geocode({ location: { lat, lng } });
              const address = result.results[0]?.formatted_address || '';
              
              onLocationSelect({ lat, lng, address });
            } catch (error) {
              console.error('Reverse geocoding failed:', error);
              onLocationSelect({ lat, lng });
            }
          }
        });
      }
    }
  }, [isLoaded, center, zoom, map, enableLocationPicker, onLocationSelect]);

  // Update markers when props change
  useEffect(() => {
    if (map) {
      // Clear existing markers
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];

      // Add new markers
      markers.forEach(markerData => {
        // Note: google.maps.Marker is deprecated. Consider migrating to AdvancedMarkerElement in the future
        const marker = new google.maps.Marker({
          position: markerData.position,
          map,
          title: markerData.title
        });

        if (markerData.info) {
          const infoWindow = new google.maps.InfoWindow({
            content: markerData.info
          });

          marker.addListener('click', () => {
            infoWindow.open(map, marker);
          });
        }

        markersRef.current.push(marker);
      });
    }
  }, [map, markers]);

  // Update map center when props change
  useEffect(() => {
    if (map) {
      map.setCenter(center);
      map.setZoom(zoom);
    }
  }, [map, center, zoom]);

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`} style={{ height }}>
        <div className="text-center p-4">
          <div className="text-red-500 mb-2">⚠️</div>
          <p className="text-sm text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`} style={{ height }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-lg overflow-hidden ${className}`} style={{ height }}>
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};
