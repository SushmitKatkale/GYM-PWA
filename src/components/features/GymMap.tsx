import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Gym } from '../../contexts/AppContext';

delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface GymMapProps {
  filteredGyms: (Gym & { distance: number })[];
  userLocation: { lat: number; lng: number } | null;
  onGymSelect?: (gym: Gym) => void;
}

const GymMap = ({ filteredGyms, userLocation, onGymSelect }: GymMapProps) => {
  const [mapCenter, setMapCenter] = useState<[number, number]>([40.7128, -74.0060]);

  useEffect(() => {
    if (userLocation) {
      setMapCenter([userLocation.lat, userLocation.lng]);
    }
  }, [userLocation]);

  const handleMarkerClick = (gym: Gym) => {
    if (onGymSelect) {
      onGymSelect(gym);
    }
  };

  return (
    <div className="h-96 w-full rounded-lg overflow-hidden shadow-lg">
      <MapContainer
        center={mapCenter}
        zoom={13}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* User location marker */}
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]}>
            <Popup>
              <div className="text-center">
                <strong>Your Location</strong>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Gym markers */}
        {filteredGyms.map((gym) => (
          <Marker
            key={gym.id}
            position={[gym.latitude, gym.longitude]}
            eventHandlers={{
              click: () => handleMarkerClick(gym),
            }}
          >
            <Popup>
              <div className="min-w-48">
                <h3 className="font-bold text-lg mb-2">{gym.name}</h3>
                <p className="text-gray-600 mb-2">{gym.address}</p>
                <div className="flex items-center mb-2">
                  <span className="text-yellow-500">★</span>
                  <span className="ml-1">{gym.rating}</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{gym.distance.toFixed(1)}km away</p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {gym.amenities.slice(0, 3).map((amenity: string, index: number) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full"
                    >
                      {amenity}
                    </span>
                  ))}
                  {gym.amenities.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      +{gym.amenities.length - 3} more
                    </span>
                  )}
                </div>
                <div className="text-sm">
                  <p className="font-semibold text-green-600">${gym.plans.monthly}/month</p>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default GymMap;
