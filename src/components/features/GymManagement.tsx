import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Map, MapPin, Mail, X } from 'lucide-react';
import StepBasicInfo from './gymSteps/StepBasicInfo';
import StepLocation from './gymSteps/StepLocation';
import StepOperatingHours from './gymSteps/StepOperatingHours';
import StepAmenities from './gymSteps/StepAmenities';
import StepImageUpload from './gymSteps/StepImageUpload';
import { gymService } from '../../services/gymService';
import { useAuthStore } from '../../stores/authStore';
import { buildApiUrl, API_CONFIG } from '../../config/api';

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
    const [error, setError] = useState<string | null>(null);
    const { getAccessToken } = useAuthStore();
    const [formData, setFormData] = useState({
        id: '',
        name: '',
        description: '',
        capacity: 0,
        currentOccupancy: 0,
        rating: 0,
        ownerId: '',
        location: {
            address: '',
            city: '',
            state: '',
            zip: '',
            coordinates: {
                latitude: 0,
                longitude: 0
            }
        },
        operatingHours: { open: '', close: '' },
        plans: [] as { name: string; description: string; price: number }[],
        amenities: [] as string[],
        images: [] as { file: File; previewUrl: string; id: string }[],
        imageUrls: [] as string[],
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        fetchGyms();
    }, []);

    const fetchGyms = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = getAccessToken();
            if (!token) {
                setError('Authentication required. Please log in.');
                setLoading(false);
                return;
            }

            const response = await gymService.getGyms(token);
            if (response.success && response.data) {
                setGyms(response.data);
                console.log('Fetched gyms:', response.data.length);
            } else {
                setError(response.message || 'Failed to fetch gyms');
                console.error('Failed to fetch gyms:', response.message);
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            setError(errorMessage);
            console.error('Error fetching gyms:', error);
        } finally {
            setLoading(false);
        }
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
                description: gym.description,
                capacity: gym.capacity,
                currentOccupancy: gym.currentOccupancy,
                rating: gym.rating,
                ownerId: gym.ownerId,
                location: {
                    address: gym.address,
                    city: '',
                    state: '',
                    zip: '',
                    coordinates: {
                        latitude: gym.latitude,
                        longitude: gym.longitude
                    }
                },
                operatingHours: gym.operatingHours,
                plans: [],
                amenities: gym.amenities,
                images: [],
                imageUrls: [gym.image],
            });
        } else {
            setFormData({
                id: '',
                name: '',
                description: '',
                capacity: 0,
                currentOccupancy: 0,
                rating: 0,
                ownerId: '',
                location: {
                    address: '',
                    city: '',
                    state: '',
                    zip: '',
                    coordinates: {
                        latitude: 0,
                        longitude: 0
                    }
                },
                operatingHours: { open: '', close: '' },
                plans: [],
                amenities: [],
                images: [],
                imageUrls: [],
            });
        }
        setCurrentStep(0);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setFormData({
            id: '',
            name: '',
            description: '',
            capacity: 0,
            currentOccupancy: 0,
            rating: 0,
            ownerId: '',
            location: {
                address: '',
                city: '',
                state: '',
                zip: '',
                coordinates: {
                    latitude: 0,
                    longitude: 0
                }
            },
            operatingHours: { open: '', close: '' },
            plans: [],
            amenities: [],
            images: [],
            imageUrls: [],
        });
    };

    const handleNextStep = () => {
        setCurrentStep(currentStep + 1);
    };

    const handlePreviousStep = () => {
        setCurrentStep(currentStep - 1);
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            // Transform the data to match the expected API format
            const gymData = {
                id: formData.id,
                name: formData.name,
                description: formData.description,
                address: formData.location.address,
                latitude: formData.location.coordinates.latitude,
                longitude: formData.location.coordinates.longitude,
                rating: formData.rating,
                images: formData.imageUrls, // Use imageUrls array instead of single image
                amenities: formData.amenities,
                operatingHours: formData.operatingHours,
                plans: formData.plans,
                ownerId: formData.ownerId,
                capacity: formData.capacity,
                currentOccupancy: formData.currentOccupancy,
            };

            const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.GYMS), {
                method: formData.id ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(gymData)
            });
            const data = await response.json();
            if (data.success) {
                alert(`Gym ${formData.id ? 'updated' : 'created'} successfully!`);
                fetchGyms();
                closeModal();
            } else {
                alert(`Error ${formData.id ? 'updating' : 'creating'} gym: ${data.message}`);
            }
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
            const response = await fetch(`/gyms/${id}`, {
                method: 'DELETE'
            });
            const data = await response.json();
            if (data.success) {
                alert('Gym deleted successfully!');
                fetchGyms();
            } else {
                alert(`Error deleting gym: ${data.message}`);
            }
        } catch (error) {
            console.error('Error deleting gym:', error);
            alert('Error deleting gym');
        }
        setLoading(false);
    };

    const searchGyms = (query: string) => {
        return gyms?.length > 0 ? gyms.filter(gym =>
            gym.name.toLowerCase().includes(query.toLowerCase()) ||
            gym.address.toLowerCase().includes(query.toLowerCase())
        ) : [];
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    // Handle location selection from Google Places or Map
    const handleLocationSelect = (location: { lat: number; lng: number; address?: string }) => {
        setFormData({
            ...formData,
            latitude: location.lat,
            longitude: location.lng,
            address: location.address || formData.address
        });
    };

    // Handle nested object changes (for operating hours and plans)
    const handleNestedInputChange = (path: string, value: string | number) => {
        const keys = path.split('.');
        const updatedFormData = { ...formData };
        
        if (keys.length === 2) {
            (updatedFormData as any)[keys[0]][keys[1]] = value;
        }
        
        setFormData(updatedFormData);
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
            <div className="space-y-4">
                <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search gyms by name or location..."
                        value={searchTerm}
                        onChange={handleSearch}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
                
                {/* Search Results Count */}
                {searchTerm && (
                    <div className="text-sm text-gray-600">
                        {searchGyms(searchTerm).length === 0 
                            ? 'No gyms found'
                            : `Found ${searchGyms(searchTerm).length} gym${searchGyms(searchTerm).length !== 1 ? 's' : ''}`
                        }
                        {searchTerm && (
                            <span className="ml-2">
                                for "{searchTerm}"
                                <button 
                                    onClick={() => setSearchTerm('')}
                                    className="ml-2 text-blue-600 hover:text-blue-800 underline"
                                >
                                    Clear
                                </button>
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Error State */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center">
                        <X className="w-5 h-5 text-red-500 mr-2" />
                        <p className="text-red-700">{error}</p>
                        <button
                            onClick={() => setError(null)}
                            className="ml-auto text-red-500 hover:text-red-700"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                    <button
                        onClick={fetchGyms}
                        className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                    >
                        Try again
                    </button>
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="mt-2 text-gray-600">Loading gyms...</p>
                </div>
            )}

            {/* Gyms List - Mobile First Design */}
            {!loading && !error && (
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
                                            <MapPin className="w-4 h-4 mr-2" />
                                            <span className="truncate">Rating: {gym.rating}/5</span>
                                        </div>
                                        <p className="text-xs text-gray-400">
                                            Capacity: {gym.currentOccupancy}/{gym.capacity} members
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
            )}

            {/* Add/Edit Gym Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg w-full max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-4xl xl:max-w-5xl max-h-[90vh] overflow-y-auto">
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
                            {currentStep === 0 && <StepBasicInfo formData={formData} onChange={setFormData} />}
                            {currentStep === 1 && <StepLocation formData={formData} onChange={setFormData} />}
                            {currentStep === 2 && <StepOperatingHours formData={formData} onChange={setFormData} />}
                            {currentStep === 3 && <StepAmenities formData={formData} onChange={setFormData} />}
                            {currentStep === 4 && <StepImageUpload formData={formData} onChange={(newData) => {
                                console.log('[DEBUG] GymManagement onChange called');
                                console.log('[DEBUG] Old formData images:', formData.images?.length || 0);
                                console.log('[DEBUG] New formData images:', newData.images?.length || 0);
                                setFormData(newData);
                            }} />}
                        </div>

                        <div className="flex space-x-3 p-6 border-t">
                            {currentStep > 0 && (
                                <button
                                    onClick={handlePreviousStep}
                                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Previous
                                </button>
                            )}

                            {currentStep < 4 && (
                                <button
                                    onClick={handleNextStep}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Next
                                </button>
                            )}

                            {currentStep === 4 && (
                                <button
                                    onClick={handleSave}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    {formData.id ? 'Update Gym' : 'Create Gym'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GymManagement;

