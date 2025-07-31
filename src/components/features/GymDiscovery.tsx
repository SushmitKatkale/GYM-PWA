import { useState } from 'react';
import { MapPin, Star, Filter, Navigation, Clock, DollarSign, Map, List } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

export function GymDiscovery() {
  const { gyms, currentLocation, getCurrentLocation, isLoadingLocation } = useApp();
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('distance');
  const [selectedGym, setSelectedGym] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  const calculateDistance = (gymLat: number, gymLng: number) => {
    if (!currentLocation) return 0;
    
    const R = 6371; // Earth's radius in km
    const dLat = (gymLat - currentLocation.lat) * Math.PI / 180;
    const dLng = (gymLng - currentLocation.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(currentLocation.lat * Math.PI / 180) * Math.cos(gymLat * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const filteredAndSortedGyms = gyms
    .map(gym => ({
      ...gym,
      distance: calculateDistance(gym.latitude, gym.longitude)
    }))
    .filter(gym => {
      if (filter === 'all') return true;
      if (filter === 'nearby') return gym.distance <= 5;
      if (filter === 'premium') return gym.rating >= 4.5;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'distance': return a.distance - b.distance;
        case 'rating': return b.rating - a.rating;
        case 'price': return a.plans.monthly - b.plans.monthly;
        default: return 0;
      }
    });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Discover Gyms</h1>
          <p className="text-gray-600 mt-1">Find the perfect gym near you</p>
        </div>
        <button
          onClick={getCurrentLocation}
          disabled={isLoadingLocation}
          className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
        >
          <Navigation className="w-4 h-4" />
          <span>{isLoadingLocation ? 'Locating...' : 'Update Location'}</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filter:</span>
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Gyms</option>
              <option value="nearby">Within 5km</option>
              <option value="premium">Premium (4.5+ rating)</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="distance">Distance</option>
              <option value="rating">Rating</option>
              <option value="price">Price</option>
            </select>
            
            {/* View Mode Toggle */}
            <div className="flex bg-gray-200 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1 rounded-md flex items-center gap-1 text-sm ${
                  viewMode === 'list' ? 'bg-white shadow-sm text-green-600' : 'text-gray-600'
                }`}
              >
                <List className="h-4 w-4" />
                List
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`px-3 py-1 rounded-md flex items-center gap-1 text-sm ${
                  viewMode === 'map' ? 'bg-white shadow-sm text-green-600' : 'text-gray-600'
                }`}
              >
                <Map className="h-4 w-4" />
                Map
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Map or List View */}
      {viewMode === 'map' ? (
        <div className="mb-6">
          <div className="h-96 w-full rounded-lg overflow-hidden shadow-lg bg-gray-100 flex items-center justify-center">
            <div className="text-center">
              <div className="text-gray-600 mb-2">🗺️</div>
              <p className="text-gray-600">Interactive Map</p>
              <p className="text-sm text-gray-500">Showing {filteredAndSortedGyms.length} gyms</p>
            </div>
          </div>
        </div>
      ) : null}

      {/* Gym List */}
      <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 ${viewMode === 'map' ? 'mt-6' : ''}`}>
        {filteredAndSortedGyms.map((gym) => (
          <div key={gym.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="relative h-48">
              <img
                src={gym.image}
                alt={gym.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 right-4 bg-white rounded-full px-3 py-1 flex items-center space-x-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="text-sm font-medium">{gym.rating}</span>
              </div>
            </div>
            
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{gym.name}</h3>
                  <div className="flex items-center text-gray-500 mt-1">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span className="text-sm">{gym.address}</span>
                  </div>
                  {currentLocation && (
                    <p className="text-sm text-green-600 mt-1">
                      {gym.distance.toFixed(1)} km away
                    </p>
                  )}
                </div>
              </div>

              <p className="text-gray-600 text-sm mb-4">{gym.description}</p>

              {/* Amenities */}
              <div className="mb-4">
                <div className="flex flex-wrap gap-2">
                  {gym.amenities.slice(0, 3).map((amenity, index) => (
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
              </div>

              {/* Operating Hours & Price */}
              <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{gym.operatingHours.open} - {gym.operatingHours.close}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <DollarSign className="w-4 h-4" />
                  <span>${gym.plans.monthly}/month</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-3">
                <button
                  onClick={() => setSelectedGym(selectedGym === gym.id ? null : gym.id)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  {selectedGym === gym.id ? 'Hide Details' : 'View Details'}
                </button>
                <button className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                  Subscribe
                </button>
              </div>

              {/* Expanded Details */}
              {selectedGym === gym.id && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-3">All Amenities</h4>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {gym.amenities.map((amenity, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">{amenity}</span>
                      </div>
                    ))}
                  </div>
                  
                  <h4 className="font-medium text-gray-900 mb-3">Pricing Plans</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Daily</p>
                      <p className="text-lg font-semibold text-gray-900">${gym.plans.daily}</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Weekly</p>
                      <p className="text-lg font-semibold text-gray-900">${gym.plans.weekly}</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <p className="text-sm text-green-600">Monthly</p>
                      <p className="text-lg font-semibold text-green-700">${gym.plans.monthly}</p>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-600">Yearly</p>
                      <p className="text-lg font-semibold text-blue-700">${gym.plans.yearly}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredAndSortedGyms.length === 0 && (
        <div className="text-center py-12">
          <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-xl text-gray-500">No gyms found</p>
          <p className="text-gray-400">Try adjusting your filters or location</p>
        </div>
      )}
    </div>
  );
}
