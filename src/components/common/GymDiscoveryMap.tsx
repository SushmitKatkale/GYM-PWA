import React, { useEffect, useRef, useState, useCallback } from 'react';
import { googleMapsLoader } from '../../services/googleMapsLoader';
import { Gym } from '../../services/gymService';
import { MapPin, Star, DollarSign } from 'lucide-react';

interface GymDiscoveryMapProps {
  gyms: Gym[];
  center?: { lat: number; lng: number };
  zoom?: number;
  height?: string;
  onGymSelect?: (gym: Gym) => void;
  selectedGym?: Gym | null;
  showUserLocation?: boolean;
  userLocation?: { lat: number; lng: number } | null;
  className?: string;
}

export const GymDiscoveryMap: React.FC<GymDiscoveryMapProps> = ({
  gyms,
  center = { lat: 40.7128, lng: -74.0060 },
  zoom = 12,
  height = '600px',
  onGymSelect,
  selectedGym,
  showUserLocation = false,
  userLocation,
  className = ''
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string>('');
  const markersRef = useRef<google.maps.Marker[]>([]);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const userMarkerRef = useRef<google.maps.Marker | null>(null);

  // Load Google Maps
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

  // Initialize map
  useEffect(() => {
    if (isLoaded && mapRef.current && !map) {
      const newMap = new google.maps.Map(mapRef.current, {
        center: userLocation || center,
        zoom,
        mapTypeControl: true,
        streetViewControl: false,
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

      // Create info window
      infoWindowRef.current = new google.maps.InfoWindow();
    }
  }, [isLoaded, center, zoom, map, userLocation]);

  // Create gym info window content
  const createGymInfoContent = useCallback((gym: Gym) => {
    const price = gym.subscriptions && gym.subscriptions.length > 0 
      ? gym.subscriptions[0].price 
      : '0';
    
    const operatingHours = gym.operatingHours || {
      open: gym.openingTime || '06:00',
      close: gym.closingTime || '22:00'
    };

    return `
      <div class="p-4 max-w-sm">
        <div class="flex items-start justify-between mb-3">
          <h3 class="text-lg font-semibold text-gray-900 pr-2">${gym.name}</h3>
          <div class="flex items-center bg-yellow-100 px-2 py-1 rounded-full">
            <span class="text-yellow-600 text-sm font-medium">★ ${gym.rating}</span>
          </div>
        </div>
        
        <div class="space-y-2 mb-4">
          <div class="flex items-start text-sm text-gray-600">
            <svg class="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
            <span>${gym.address}</span>
          </div>
          
          <div class="flex items-center text-sm text-gray-600">
            <svg class="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>${operatingHours.open} - ${operatingHours.close}</span>
          </div>
          
          <div class="flex items-center text-sm text-gray-600">
            <svg class="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
            </svg>
            <span>From $${price}/month</span>
          </div>
        </div>

        ${gym.amenities && gym.amenities.length > 0 ? `
          <div class="mb-4">
            <h4 class="text-sm font-medium text-gray-900 mb-2">Amenities:</h4>
            <div class="flex flex-wrap gap-1">
              ${gym.amenities.slice(0, 3).map(amenity => `
                <span class="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                  ${typeof amenity === 'string' ? amenity : amenity.name}
                </span>
              `).join('')}
              ${gym.amenities.length > 3 ? `
                <span class="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                  +${gym.amenities.length - 3} more
                </span>
              ` : ''}
            </div>
          </div>
        ` : ''}

        <div class="flex space-x-2">
          <button 
            onclick="window.selectGym && window.selectGym('${gym.id}')" 
            class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-3 rounded-lg text-sm transition-colors"
          >
            View Details
          </button>
          <button class="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-3 rounded-lg text-sm transition-colors">
            Subscribe
          </button>
        </div>
      </div>
    `;
  }, []);

  // Update markers when gyms change
  useEffect(() => {
    if (map && isLoaded) {
      // Clear existing markers
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];

      // Add gym markers
      gyms.forEach(gym => {
        const lat = typeof gym.latitude === 'string' ? parseFloat(gym.latitude) : gym.latitude;
        const lng = typeof gym.longitude === 'string' ? parseFloat(gym.longitude) : gym.longitude;

        if (isNaN(lat) || isNaN(lng)) {
          console.warn(`Invalid coordinates for gym ${gym.name}: lat=${gym.latitude}, lng=${gym.longitude}`);
          return;
        }

        const marker = new google.maps.Marker({
          position: { lat, lng },
          map,
          title: gym.name,
          icon: {
            url: selectedGym?.id === gym.id 
              ? 'data:image/svg+xml;base64,' + btoa(`
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="16" cy="16" r="12" fill="#10b981" stroke="white" stroke-width="2"/>
                  <path d="M12 16l3 3 6-6" stroke="white" stroke-width="2" fill="none"/>
                </svg>
              `)
              : 'data:image/svg+xml;base64,' + btoa(`
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="16" cy="16" r="12" fill="#ef4444" stroke="white" stroke-width="2"/>
                  <path d="M10 14h12M14 10v12M18 10v12" stroke="white" stroke-width="2"/>
                </svg>
              `),
            scaledSize: new google.maps.Size(32, 32),
            anchor: new google.maps.Point(16, 16)
          }
        });

        // Add click listener to marker
        marker.addListener('click', () => {
          if (infoWindowRef.current) {
            infoWindowRef.current.setContent(createGymInfoContent(gym));
            infoWindowRef.current.open(map, marker);
          }
          
          if (onGymSelect) {
            onGymSelect(gym);
          }
        });

        markersRef.current.push(marker);
      });

      // Add user location marker if available
      if (showUserLocation && userLocation) {
        if (userMarkerRef.current) {
          userMarkerRef.current.setMap(null);
        }

        userMarkerRef.current = new google.maps.Marker({
          position: userLocation,
          map,
          title: 'Your Location',
          icon: {
            url: 'data:image/svg+xml;base64,' + btoa(`
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="8" fill="#3b82f6" stroke="white" stroke-width="2"/>
                <circle cx="12" cy="12" r="3" fill="white"/>
              </svg>
            `),
            scaledSize: new google.maps.Size(24, 24),
            anchor: new google.maps.Point(12, 12)
          },
          zIndex: 1000
        });
      }

      // Fit map to show all gyms and user location
      if (gyms.length > 0) {
        const bounds = new google.maps.LatLngBounds();
        
        gyms.forEach(gym => {
          const lat = typeof gym.latitude === 'string' ? parseFloat(gym.latitude) : gym.latitude;
          const lng = typeof gym.longitude === 'string' ? parseFloat(gym.longitude) : gym.longitude;
          
          if (!isNaN(lat) && !isNaN(lng)) {
            bounds.extend({ lat, lng });
          }
        });

        if (userLocation) {
          bounds.extend(userLocation);
        }

        map.fitBounds(bounds);
        
        // Set maximum zoom level after fitting bounds
        const listener = google.maps.event.addListener(map, 'idle', () => {
          if (map.getZoom() && map.getZoom()! > 15) {
            map.setZoom(15);
          }
          google.maps.event.removeListener(listener);
        });
      }
    }
  }, [map, gyms, selectedGym, showUserLocation, userLocation, onGymSelect, createGymInfoContent, isLoaded]);

  // Global function for info window buttons
  useEffect(() => {
    (window as any).selectGym = (gymId: string) => {
      const gym = gyms.find(g => g.id.toString() === gymId);
      if (gym && onGymSelect) {
        onGymSelect(gym);
      }
    };

    return () => {
      delete (window as any).selectGym;
    };
  }, [gyms, onGymSelect]);

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
