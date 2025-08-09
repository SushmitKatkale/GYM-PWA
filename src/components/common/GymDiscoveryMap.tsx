import React, { useEffect, useRef, useState, useCallback } from 'react';
import { googleMapsLoader } from '../../services/googleMapsLoader';
import { Gym } from '../../services/gymService';
import { MapPin, Star } from 'lucide-react';

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
  refreshTrigger?: number; // Add refresh trigger
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
  className = '',
  refreshTrigger
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string>('');
  const markersRef = useRef<google.maps.Marker[]>([]);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const userMarkerRef = useRef<google.maps.Marker | null>(null);

  // Calculate distance between two points in kilometers
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

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
          // Hide all Points of Interest
          {
            featureType: 'poi',
            stylers: [{ visibility: 'off' }]
          },
          // Hide transit stations and icons
          {
            featureType: 'transit',
            stylers: [{ visibility: 'off' }]
          },
          // Hide business POIs specifically
          {
            featureType: 'poi.business',
            stylers: [{ visibility: 'off' }]
          },
          // Hide attraction POIs
          {
            featureType: 'poi.attraction',
            stylers: [{ visibility: 'off' }]
          },
          // Hide government POIs
          {
            featureType: 'poi.government',
            stylers: [{ visibility: 'off' }]
          },
          // Hide medical POIs
          {
            featureType: 'poi.medical',
            stylers: [{ visibility: 'off' }]
          },
          // Hide park POIs
          {
            featureType: 'poi.park',
            stylers: [{ visibility: 'off' }]
          },
          // Hide place of worship POIs
          {
            featureType: 'poi.place_of_worship',
            stylers: [{ visibility: 'off' }]
          },
          // Hide school POIs
          {
            featureType: 'poi.school',
            stylers: [{ visibility: 'off' }]
          },
          // Hide sports complex POIs
          {
            featureType: 'poi.sports_complex',
            stylers: [{ visibility: 'off' }]
          }
        ]
      });

      setMap(newMap);

      // Create info window
      infoWindowRef.current = new google.maps.InfoWindow();
    }
  }, [isLoaded, center, map, userLocation]);

  // Create gym info window content
  const createGymInfoContent = useCallback((gym: Gym) => {
    // Calculate distance if not already available
    const distance = userLocation ? calculateDistance(
      userLocation.lat, 
      userLocation.lng, 
      typeof gym.latitude === 'string' ? parseFloat(gym.latitude) : gym.latitude,
      typeof gym.longitude === 'string' ? parseFloat(gym.longitude) : gym.longitude
    ) : 0;

    // Get monthly price with discounted price priority
    const monthlySubscription = gym.subscriptions?.find(sub => sub.validityDays === 30) || gym.subscriptions?.[0];
    const monthlyPrice = monthlySubscription ? (
      monthlySubscription.discountedPrice ? 
        parseFloat(monthlySubscription.discountedPrice) : 
        parseFloat(monthlySubscription.price)
    ) : 0;
    
    const originalPrice = monthlySubscription ? parseFloat(monthlySubscription.price) : 0;
    const hasDiscount = monthlySubscription?.discountedPrice && parseFloat(monthlySubscription.discountedPrice) < originalPrice;

    return `
      <div style="padding: 16px; max-width: 320px; font-family: system-ui, -apple-system, sans-serif;">
        <!-- Header with gym name and rating -->
        <div style="margin-bottom: 12px;">
          <div style="display: flex; align-items: start; justify-content: space-between; margin-bottom: 8px;">
            <h3 style="margin: 0; font-size: 18px; font-weight: 600; color: #111827; line-height: 1.3;">${gym.name}</h3>
            <div style="background: #fef3c7; padding: 4px 8px; border-radius: 12px; margin-left: 8px;">
              <span style="color: #d97706; font-size: 12px; font-weight: 500;">★ ${gym.rating}</span>
            </div>
          </div>
          
          <!-- Address -->
          <div style="display: flex; align-items: start; color: #6b7280; font-size: 13px; margin-bottom: 4px;">
            <svg style="width: 14px; height: 14px; margin-right: 6px; margin-top: 2px; flex-shrink: 0;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
            <span style="line-height: 1.4;">${gym.address}</span>
          </div>
          
          ${distance > 0 ? `<p style="margin: 4px 0 0 0; font-size: 13px; color: #059669;">${distance.toFixed(1)} km away</p>` : ''}
        </div>
        
        <!-- Amenities -->
        ${gym.amenities && gym.amenities.length > 0 ? `
          <div style="margin: 12px 0;">
            <div style="display: flex; flex-wrap: wrap; gap: 4px;">
              ${gym.amenities.slice(0, 3).map(amenity => `
                <span style="padding: 4px 8px; background: #dcfce7; color: #166534; font-size: 11px; border-radius: 12px; white-space: nowrap;">
                  ${typeof amenity === 'string' ? amenity : amenity.name}
                </span>
              `).join('')}
              ${gym.amenities.length > 3 ? `
                <span style="padding: 4px 8px; background: #f3f4f6; color: #4b5563; font-size: 11px; border-radius: 12px;">
                  +${gym.amenities.length - 3} more
                </span>
              ` : ''}
            </div>
          </div>
        ` : ''}
        
        <!-- Price -->
        <div style="display: flex; align-items: center; margin: 12px 0; color: #4b5563; font-size: 14px;">
          <svg style="width: 16px; height: 16px; margin-right: 6px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
          </svg>
          ${hasDiscount ? `
            <div style="display: flex; align-items: center; gap: 6px;">
              <span style="text-decoration: line-through; color: #9ca3af; font-size: 12px;">₹${originalPrice}</span>
              <span style="color: #059669; font-weight: 600;">₹${monthlyPrice}</span>
              <span style="font-size: 12px;">/month</span>
              <span style="background: #fee2e2; color: #dc2626; padding: 2px 6px; border-radius: 8px; font-size: 10px; font-weight: 600; margin-left: 4px;">
                ${Math.round(((originalPrice - monthlyPrice) / originalPrice) * 100)}% OFF
              </span>
            </div>
          ` : `
            <span>₹${monthlyPrice}/month</span>
          `}
        </div>
        
        <!-- Action buttons -->
        <div style="display: flex; gap: 8px; margin-top: 16px;">
          <button
            onclick="window.selectGym && window.selectGym('${gym.id}')"
            style="flex: 1; background: #f3f4f6; color: #374151; font-weight: 500; padding: 10px 16px; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; transition: background 0.2s;"
            onmouseover="this.style.background='#e5e7eb'"
            onmouseout="this.style.background='#f3f4f6'"
          >
            View Details
          </button>
          <button
            style="flex: 1; background: #059669; color: white; font-weight: 500; padding: 10px 16px; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; transition: background 0.2s;"
            onmouseover="this.style.background='#047857'"
            onmouseout="this.style.background='#059669'"
          >
            Subscribe
          </button>
        </div>
      </div>
    `;
  }, [userLocation, calculateDistance]);

  // Create markers when gyms or map change (not on selection change)
  useEffect(() => {
    if (map && isLoaded && gyms.length > 0) {
      // Clear existing markers
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];

      // Add gym markers
      console.log('Adding markers for gyms:', gyms.length);
      gyms.forEach(gym => {
        const lat = typeof gym.latitude === 'string' ? parseFloat(gym.latitude) : gym.latitude;
        const lng = typeof gym.longitude === 'string' ? parseFloat(gym.longitude) : gym.longitude;

        console.log(`Gym ${gym.name}: Original coords (${gym.latitude}, ${gym.longitude}) -> Parsed (${lat}, ${lng})`);

        if (isNaN(lat) || isNaN(lng)) {
          console.warn(`Invalid coordinates for gym ${gym.name}: lat=${gym.latitude}, lng=${gym.longitude}`);
          return;
        }

        // Create a custom gym marker icon (initially unselected)
        const gymIconSvg = `
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" fill="#10b981" stroke="white" stroke-width="1.5"/>
            <g transform="translate(6, 8)">
              <!-- Dumbbell Icon -->
              <path d="M2 6h1.5a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1z" fill="white"/>
              <path d="M8.5 6H10a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1H8.5a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1z" fill="white"/>
              <rect x="3.5" y="3.5" width="4" height="1" fill="white" rx="0.5"/>
            </g>
          </svg>
        `;
        
        const markerIcon = {
          url: 'data:image/svg+xml;base64,' + btoa(gymIconSvg),
          scaledSize: new google.maps.Size(24, 24),
          anchor: new google.maps.Point(12, 12)
        };

        const marker = new google.maps.Marker({
          position: { lat, lng },
          map,
          title: gym.name,
          icon: markerIcon,
          zIndex: 100,
          optimized: true // Enable marker optimization
        }) as google.maps.Marker & { gymData?: Gym };
        
        // Store gym data on marker for easy access
        marker.gymData = gym;
        
        console.log(`Created marker for ${gym.name} at position (${lat}, ${lng})`);

        // Add click listener to marker
        marker.addListener('click', (e: google.maps.MapMouseEvent) => {
          // Prevent event propagation to avoid map click events
          e.stop();
          
          console.log('Gym marker clicked:', gym.name);
          
          // Close any existing info window first
          if (infoWindowRef.current) {
            infoWindowRef.current.close();
          }
          
          try {
            const content = createGymInfoContent(gym);
            console.log('Created info window content for:', gym.name);
            
            if (infoWindowRef.current) {
              infoWindowRef.current.setContent(content);
              infoWindowRef.current.open({ map, anchor: marker, shouldFocus: false });
              console.log('Info window opened for:', gym.name);
            } else {
              console.error('Info window ref is null');
              // Create a new info window if ref is null
              infoWindowRef.current = new google.maps.InfoWindow({
                content: content,
                disableAutoPan: true // Prevent auto-panning which can trigger viewport updates
              });
              infoWindowRef.current.open({ map, anchor: marker, shouldFocus: false });
            }
          } catch (error) {
            console.error('Error opening info window:', error);
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

        // Create enhanced user location icon
        const userIconSvg = `
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <!-- Outer pulse ring -->
            <circle cx="16" cy="16" r="14" fill="#3b82f6" fill-opacity="0.2" stroke="#3b82f6" stroke-width="1"/>
            <!-- Main location dot -->
            <circle cx="16" cy="16" r="8" fill="#3b82f6" stroke="white" stroke-width="3"/>
            <!-- Inner white dot -->
            <circle cx="16" cy="16" r="3" fill="white"/>
            <!-- User icon -->
            <g transform="translate(12, 10)">
              <path d="M4 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4z" fill="#3b82f6"/>
              <path d="M1 8v1a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1V8a3 3 0 0 0-6 0z" fill="#3b82f6"/>
            </g>
          </svg>
        `;

        userMarkerRef.current = new google.maps.Marker({
          position: userLocation,
          map,
          title: 'Your Location',
          icon: {
            url: 'data:image/svg+xml;base64,' + btoa(userIconSvg),
            scaledSize: new google.maps.Size(32, 32),
            anchor: new google.maps.Point(16, 16)
          },
          zIndex: 1500, // Higher than gym markers
          animation: google.maps.Animation.DROP
        });

        // Add info window for user location
        const userInfoWindow = new google.maps.InfoWindow({
          content: `
            <div style="padding: 12px; font-family: system-ui, -apple-system, sans-serif; text-align: center;">
              <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 8px;">
                <svg style="width: 20px; height: 20px; margin-right: 6px; color: #3b82f6;" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/>
                </svg>
                <h4 style="margin: 0; font-size: 16px; font-weight: 600; color: #111827;">Your Location</h4>
              </div>
              <p style="margin: 0; font-size: 13px; color: #6b7280;">You are here</p>
              <div style="margin-top: 8px; font-size: 11px; color: #9ca3af;">
                ${userLocation.lat.toFixed(6)}, ${userLocation.lng.toFixed(6)}
              </div>
            </div>
          `
        });

        // Add click listener to show user location info
        userMarkerRef.current.addListener('click', () => {
          userInfoWindow.open(map, userMarkerRef.current);
        });
      }

      // Set map view to 5km area around user location or center
      const centerPoint = userLocation || center;
      
      // Create a 5km radius bounds (approximately 0.045 degrees = ~5km)
      const radiusInDegrees = 0.045; // approximately 5km
      const bounds = new google.maps.LatLngBounds(
        new google.maps.LatLng(centerPoint.lat - radiusInDegrees, centerPoint.lng - radiusInDegrees),
        new google.maps.LatLng(centerPoint.lat + radiusInDegrees, centerPoint.lng + radiusInDegrees)
      );

      // Only include gyms within the 5km area
      let hasGymsInArea = false;
      gyms.forEach(gym => {
        const lat = typeof gym.latitude === 'string' ? parseFloat(gym.latitude) : gym.latitude;
        const lng = typeof gym.longitude === 'string' ? parseFloat(gym.longitude) : gym.longitude;
        
        if (!isNaN(lat) && !isNaN(lng)) {
          // Calculate distance from center point
          const distance = calculateDistance(centerPoint.lat, centerPoint.lng, lat, lng);
          if (distance <= 5) { // Within 5km
            hasGymsInArea = true;
          }
        }
      });

      // Fit map to the 5km bounds
      map.fitBounds(bounds);
      
      // Set appropriate zoom level for 5km area
      const listener = google.maps.event.addListener(map, 'idle', () => {
        const currentZoom = map.getZoom();
        if (currentZoom && currentZoom < 13) {
          map.setZoom(13); // Minimum zoom for ~5km view
        } else if (currentZoom && currentZoom > 16) {
          map.setZoom(16); // Maximum zoom for better visibility
        }
        google.maps.event.removeListener(listener);
      });
    }
  }, [map, gyms, showUserLocation, userLocation, isLoaded]);

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
