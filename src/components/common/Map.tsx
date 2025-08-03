import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon } from 'leaflet';
import { Navigation, Star } from 'lucide-react';
import { Gym } from '../../stores/gymStore';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapProps {
  gyms: Gym[];
  center?: [number, number];
  zoom?: number;
  onGymSelect?: (gym: Gym) => void;
  selectedGym?: Gym | null;
  showUserLocation?: boolean;
  userLocation?: [number, number] | null;
}

function MapUpdater({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, zoom);
  }, [map, center, zoom]);
  
  return null;
}

export function Map({ 
  gyms, 
  center = [40.7128, -74.0060], 
  zoom = 12, 
  onGymSelect,
  showUserLocation = false,
  userLocation
}: MapProps) {
  const [mapCenter, setMapCenter] = useState<[number, number]>(center);

  useEffect(() => {
    if (userLocation) {
      setMapCenter(userLocation);
    }
  }, [userLocation]);

  const gymIcon = new Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
      <svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12.5" cy="12.5" r="12" fill="#10B981" stroke="white" stroke-width="1"/>
        <path d="M8 12h9m-9 0l3 3m-3-3l3-3" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `),
    iconSize: [25, 25],
    iconAnchor: [12, 25],
    popupAnchor: [0, -25]
  });

  const userIcon = new Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="10" cy="10" r="8" fill="#3B82F6" stroke="white" stroke-width="2"/>
        <circle cx="10" cy="10" r="3" fill="white"/>
      </svg>
    `),
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });

  return (
    <div className="w-full h-full rounded-lg overflow-hidden">
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <MapUpdater center={mapCenter} zoom={zoom} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* User location marker */}
        {showUserLocation && userLocation && (
          <Marker position={userLocation} icon={userIcon}>
            <Popup>
              <div className="text-center">
                <Navigation className="w-4 h-4 mx-auto mb-1 text-blue-600" />
                <p className="font-medium">Your Location</p>
              </div>
            </Popup>
          </Marker>
        )}
        
        {/* Gym markers */}
        {gyms.map((gym) => (
          <Marker
            key={gym.id}
            position={[gym.latitude, gym.longitude]}
            icon={gymIcon}
            eventHandlers={{
              click: () => onGymSelect?.(gym)
            }}
          >
            <Popup>
              <div className="min-w-[200px]">
                <img
                  src={gym.image}
                  alt={gym.name}
                  className="w-full h-24 object-cover rounded mb-2"
                />
                <h3 className="font-semibold text-gray-900 mb-1">{gym.name}</h3>
                <div className="flex items-center mb-2">
                  <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                  <span className="text-sm text-gray-600">{gym.rating}</span>
                </div>
                <p className="text-xs text-gray-500 mb-2">{gym.address}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-green-600">
                    ${gym.plans.monthly}/month
                  </span>
                  <button
                    onClick={() => onGymSelect?.(gym)}
                    className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 transition-colors"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}