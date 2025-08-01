import React, { useState } from 'react';
import { Plus, Edit, Trash2, MapPin, Star, Users, Clock, Search, Filter } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useGymStore } from '../../stores/gymStore';
import { useApp } from '../../contexts/AppContext';

export function GymManagement() {
  const { user } = useAuthStore();
  const { gyms } = useGymStore();
  const { addNotification } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedGym, setSelectedGym] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Filter gyms based on user role
  const filteredGyms = gyms.filter(gym => {
    const matchesSearch = gym.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         gym.address.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (user?.role === 'owner') {
      return matchesSearch && gym.ownerId === user.id;
    }
    return matchesSearch;
  });

  const [newGym, setNewGym] = useState({
    name: '',
    address: '',
    description: '',
    latitude: 0,
    longitude: 0,
    capacity: 100,
    amenities: [] as string[],
    operatingHours: { open: '06:00', close: '22:00' },
    plans: { daily: 15, weekly: 75, monthly: 59.99, yearly: 599 }
  });

  const handleAddGym = () => {
    // Simulate adding gym
    addNotification({
      title: 'Gym Added',
      message: `${newGym.name} has been successfully added`,
      type: 'success'
    });
    setShowAddModal(false);
    setNewGym({
      name: '',
      address: '',
      description: '',
      latitude: 0,
      longitude: 0,
      capacity: 100,
      amenities: [],
      operatingHours: { open: '06:00', close: '22:00' },
      plans: { daily: 15, weekly: 75, monthly: 59.99, yearly: 599 }
    });
  };

  const handleEditGym = (gym: any) => {
    setSelectedGym(gym);
    setShowEditModal(true);
  };

  const handleDeleteGym = (gymId: string, gymName: string) => {
    if (window.confirm(`Are you sure you want to delete ${gymName}?`)) {
      addNotification({
        title: 'Gym Deleted',
        message: `${gymName} has been deleted`,
        type: 'info'
      });
    }
  };

  const availableAmenities = [
    'Cardio Equipment', 'Weight Training', 'Group Classes', 'Personal Training',
    'Sauna', 'Swimming Pool', 'Yoga Studio', 'CrossFit Box', 'Boxing Ring',
    'Basketball Court', 'Parking', 'Locker Rooms', 'Showers', 'Nutrition Bar'
  ];

  return (
    <div className="space-y-6 px-4 md:px-8 max-w-full mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {user?.role === 'admin' ? 'Manage Gyms' : 'My Gyms'}
          </h1>
          <p className="text-gray-600 mt-2">
            {user?.role === 'admin' 
              ? 'Manage all gyms in the system' 
              : 'Manage your gym locations and settings'
            }
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Gym</span>
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search gyms by name or address..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </button>
        </div>
      </div>

      {/* Gyms Grid */}
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
        {filteredGyms.map((gym) => (
          <div key={gym.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <img
              src={gym.image}
              alt={gym.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{gym.name}</h3>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <MapPin className="w-4 h-4 mr-1" />
                    {gym.address}
                  </div>
                </div>
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm text-gray-600 ml-1">{gym.rating}</span>
                </div>
              </div>

              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{gym.description}</p>

              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  <span>{gym.currentOccupancy}/{gym.capacity}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>{gym.operatingHours.open} - {gym.operatingHours.close}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleEditGym(gym)}
                  className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDeleteGym(gym.id, gym.name)}
                  className="flex items-center justify-center bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredGyms.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <MapPin className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No gyms found</h3>
          <p className="text-gray-500">
            {searchTerm ? 'No gyms match your search criteria.' : 'Get started by adding your first gym.'}
          </p>
        </div>
      )}

      {/* Add Gym Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">Add New Gym</h3>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gym Name *</label>
                  <input
                    type="text"
                    value={newGym.name}
                    onChange={(e) => setNewGym(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter gym name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Capacity</label>
                  <input
                    type="number"
                    value={newGym.capacity}
                    onChange={(e) => setNewGym(prev => ({ ...prev, capacity: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
                <input
                  type="text"
                  value={newGym.address}
                  onChange={(e) => setNewGym(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter full address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={newGym.description}
                  onChange={(e) => setNewGym(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe your gym..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Opening Time</label>
                  <input
                    type="time"
                    value={newGym.operatingHours.open}
                    onChange={(e) => setNewGym(prev => ({ 
                      ...prev, 
                      operatingHours: { ...prev.operatingHours, open: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Closing Time</label>
                  <input
                    type="time"
                    value={newGym.operatingHours.close}
                    onChange={(e) => setNewGym(prev => ({ 
                      ...prev, 
                      operatingHours: { ...prev.operatingHours, close: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amenities</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                  {availableAmenities.map((amenity) => (
                    <label key={amenity} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newGym.amenities.includes(amenity)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewGym(prev => ({ ...prev, amenities: [...prev.amenities, amenity] }));
                          } else {
                            setNewGym(prev => ({ 
                              ...prev, 
                              amenities: prev.amenities.filter(a => a !== amenity) 
                            }));
                          }
                        }}
                        className="mr-2 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{amenity}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex space-x-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddGym}
                disabled={!newGym.name || !newGym.address}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Gym
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
