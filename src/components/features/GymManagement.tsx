import React, { useEffect, useState } from 'react';
import { buildApiUrl, API_CONFIG } from '../../config/api';
import { Plus, Edit, Trash2, MapPin, Mail, X } from 'lucide-react';

interface Gym {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  rating: number;
  image: string;
  description: string;
  amenities: string[];
  operatingHours: {
    open: string;
    close: string;
  };
  plans: {
    daily: number;
    weekly: number;
    monthly: number;
    yearly: number;
  };
  ownerId: string;
  capacity: number;
  currentOccupancy: number;
}

const GymManagement = () => {
    const [gyms, setGyms] = useState<Gym[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        id: '',
        name: '',
        address: '',
        latitude: 0,
        longitude: 0,
        rating: 0,
        image: '',
        description: '',
        amenities: '',
        operatingHours: { open: '', close: '' },
        plans: { daily: 0, weekly: 0, monthly: 0, yearly: 0 },
        ownerId: '',
        capacity: 0,
        currentOccupancy: 0,
    });
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchGyms();
    }, []);

    const fetchGyms = async () => {
        setLoading(true);
        try {
            const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.GYMS));
            const data = await response.json();
            if (data.success) {
                setGyms(data.data);
            }
        } catch (error) {
            console.error('Error fetching gyms:', error);
        }
        setLoading(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const openModal = (gym: Gym | null = null) => {
        if (gym) {
            setFormData({
                id: gym.id,
                name: gym.name,
                address: gym.address,
                latitude: gym.latitude,
                longitude: gym.longitude,
                rating: gym.rating,
                image: gym.image,
                description: gym.description,
                amenities: gym.amenities.join(', '),
                operatingHours: gym.operatingHours,
                plans: gym.plans,
                ownerId: gym.ownerId,
                capacity: gym.capacity,
                currentOccupancy: gym.currentOccupancy,
            });
        } else {
            setFormData({
                id: '',
                name: '',
                address: '',
                latitude: 0,
                longitude: 0,
                rating: 0,
                image: '',
                description: '',
                amenities: '',
                operatingHours: { open: '', close: '' },
                plans: { daily: 0, weekly: 0, monthly: 0, yearly: 0 },
                ownerId: '',
                capacity: 0,
                currentOccupancy: 0,
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setFormData({
            id: '',
            name: '',
            address: '',
            latitude: 0,
            longitude: 0,
            rating: 0,
            image: '',
            description: '',
            amenities: '',
            operatingHours: { open: '', close: '' },
            plans: { daily: 0, weekly: 0, monthly: 0, yearly: 0 },
            ownerId: '',
            capacity: 0,
            currentOccupancy: 0,
        });
    };

    const handleSave = async () => {
        const amenitiesArray = formData.amenities.split(',').map((amenity) => amenity.trim());
        setLoading(true);
        try {
            if (formData.id) {
                const response = await fetch(buildApiUrl(`${API_CONFIG.ENDPOINTS.GYMS}/${formData.id}`), {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        ...formData,
                        amenities: amenitiesArray
                    })
                });
                const data = await response.json();
                if (data.success) {
                    alert('Gym updated successfully!');
                } else {
                    alert('Error updating gym: ' + data.message);
                }
            } else {
                const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.GYMS), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        ...formData,
                        amenities: amenitiesArray
                    })
                });
                const data = await response.json();
                if (data.success) {
                    alert('Gym created successfully!');
                } else {
                    alert('Error creating gym: ' + data.message);
                }
            }
            fetchGyms();
            closeModal();
        } catch (error) {
            console.error('Error saving gym:', error);
            alert('Error saving gym');
        }
        setLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this gym?')) return;

        setLoading(true);
        try {
            const response = await fetch(buildApiUrl(`${API_CONFIG.ENDPOINTS.GYMS}/${id}`), {
                method: 'DELETE'
            });
            const data = await response.json();
            if (data.success) {
                alert('Gym deleted successfully!');
                fetchGyms();
            } else {
                alert('Error deleting gym: ' + data.message);
            }
        } catch (error) {
            console.error('Error deleting gym:', error);
            alert('Error deleting gym');
        }
        setLoading(false);
    };

    const searchGyms = (query: string) => {
        return gyms.filter(gym =>
            gym.name.toLowerCase().includes(query.toLowerCase()) ||
            gym.address.toLowerCase().includes(query.toLowerCase())
        );
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Gym Management</h1>
                    <p className="text-gray-600">Manage gym listings and their details</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    <span>Add Gym</span>
                </button>
            </div>

            {/* Search */}
            <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                    type="text"
                    placeholder="Search gyms..."
                    value={searchTerm}
                    onChange={handleSearch}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
            </div>

            {/* Gyms List - Mobile First Design */}
            <div className="space-y-4">
                {searchGyms(searchTerm).length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg shadow border">
                        <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No gyms found</h3>
                        <p className="text-gray-500">
                            {searchTerm ? 'Try adjusting your search criteria' : 'Start by adding your first gym'}
                        </p>
                    </div>
                ) : (
                    searchGyms(searchTerm).map((gym) => (
                        <div key={gym.id} className="bg-white rounded-lg shadow border p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center space-x-3 mb-2">
                                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                                            {gym.name[0]}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-lg font-semibold text-gray-900 truncate">
                                                {gym.name}
                                            </h3>
                                            <p className="text-sm text-gray-500">{gym.address}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-1 mb-3">
                                        <div className="flex items-center text-sm text-gray-600">
                                            <Mail className="w-4 h-4 mr-2" />
                                            <span className="truncate">{gym.email}</span>
                                        </div>
                                        <p className="text-xs text-gray-400">
                                            Created: {new Date(gym.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2 ml-4">
                                    <button
                                        onClick={() => openModal(gym)}
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(gym.id)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Add/Edit Gym Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b">
                            <h2 className="text-xl font-semibold">{formData.id ? 'Edit Gym' : 'Add Gym'}</h2>
                            <button
                                onClick={closeModal}
                                className="p-2 hover:bg-gray-100 rounded-lg"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Latitude</label>
                                <input
                                    type="number"
                                    name="latitude"
                                    value={formData.latitude}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Longitude</label>
                                <input
                                    type="number"
                                    name="longitude"
                                    value={formData.longitude}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                                <input
                                    type="number"
                                    name="rating"
                                    value={formData.rating}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    step="0.1"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
                                <input
                                    type="text"
                                    name="image"
                                    value={formData.image}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                <input
                                    type="text"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Amenities (Comma Separated)</label>
                                <input
                                    type="text"
                                    name="amenities"
                                    value={formData.amenities}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Operating Hours - Open</label>
                                <input
                                    type="time"
                                    name="operatingHours.open"
                                    value={formData.operatingHours.open}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Operating Hours - Close</label>
                                <input
                                    type="time"
                                    name="operatingHours.close"
                                    value={formData.operatingHours.close}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Daily Plan ($)</label>
                                <input
                                    type="number"
                                    name="plans.daily"
                                    value={formData.plans.daily}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Weekly Plan ($)</label>
                                <input
                                    type="number"
                                    name="plans.weekly"
                                    value={formData.plans.weekly}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Plan ($)</label>
                                <input
                                    type="number"
                                    name="plans.monthly"
                                    value={formData.plans.monthly}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Yearly Plan ($)</label>
                                <input
                                    type="number"
                                    name="plans.yearly"
                                    value={formData.plans.yearly}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Owner ID</label>
                                <input
                                    type="text"
                                    name="ownerId"
                                    value={formData.ownerId}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Capacity</label>
                                <input
                                    type="number"
                                    name="capacity"
                                    value={formData.capacity}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Current Occupancy</label>
                                <input
                                    type="number"
                                    name="currentOccupancy"
                                    value={formData.currentOccupancy}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div className="flex space-x-3 p-6 border-t">
                            <button
                                onClick={closeModal}
                                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                {formData.id ? 'Update Gym' : 'Create Gym'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GymManagement;

