import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, MapPin, X, Image, Info } from 'lucide-react';
import StepBasicInfo from './gymSteps/StepBasicInfo';
import StepLocation from './gymSteps/StepLocation';
import StepOperatingHours from './gymSteps/StepOperatingHours';
import StepAmenities from './gymSteps/StepAmenities';
import GymImageEditModal from './GymImageEditModal';
import SuccessModal from '../ui/SuccessModal';
import ErrorModal from '../ui/ErrorModal';
import ImageUploadModal from '../ui/ImageUploadModal';
import ConfirmationModal from '../ui/ConfirmationModal';
import { gymService } from '../../services/gymService';
import { useAuthStore } from '../../stores/authStore';
import { buildApiUrl, API_CONFIG } from '../../config/api';

// Import the Gym interface from the service
import { Gym } from '../../services/gymService';

const GymManagement = () => {
    const [gyms, setGyms] = useState<Gym[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [isImageUploadModalOpen, setIsImageUploadModalOpen] = useState(false);
    const [selectedGymForImages, setSelectedGymForImages] = useState<Gym | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Success/Error Modal States
    const [successModal, setSuccessModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        actionLabel?: string;
        onAction?: () => void;
    }>({ isOpen: false, title: '', message: '' });

    const [errorModal, setErrorModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        error?: string;
        showRetry?: boolean;
        onRetry?: () => void;
    }>({ isOpen: false, title: '', message: '' });

    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        itemName?: string;
        onConfirm: () => void;
    }>({ isOpen: false, title: '', message: '', onConfirm: () => { } });

    const { getAccessToken, user, hasRole } = useAuthStore();

    // Check if current user is admin or owner
    const isAdmin = hasRole('admin');
    const isOwner = hasRole('owner');
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
        amenities: [] as any[],
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

            console.log('DEBUG: Fetching gyms from API...');
            console.log('DEBUG: Using token:', token ? 'Token available' : 'No token');
            console.log('DEBUG: API URL:', buildApiUrl(API_CONFIG.ENDPOINTS.GYMS));

            const response = await gymService.getGyms(token);
            console.log('DEBUG: Raw API response:', response);

            if (response.success && response.data) {
                console.log('DEBUG: Successfully fetched gyms:', response.data.length);
                console.log('DEBUG: Gym data structure:', response.data);
                setGyms(response.data);
            } else {
                console.error('DEBUG: API call failed:', response.message);
                setError(response.message || 'Failed to fetch gyms');
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            console.error('DEBUG: Network/catch error:', error);
            setError(errorMessage);
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
            console.log('DEBUG: Opening modal for gym:', {
                name: gym.name,
                address: gym.address,
                city: gym.city,
                state: gym.state,
                zipCode: gym.zipCode,
                latitude: gym.latitude,
                longitude: gym.longitude
            });
            setFormData({
                id: gym.id.toString(),
                name: gym.name,
                description: gym.description,
                capacity: gym.capacity,
                currentOccupancy: gym.currentOccupancy,
                rating: parseFloat(gym.rating),
                ownerId: gym.ownerId,
                location: {
                    address: gym.address || '',
                    city: gym.city || '',
                    state: gym.state || '',
                    zip: gym.zipCode || '',
                    coordinates: {
                        latitude: gym.latitude ? parseFloat(gym.latitude) : 0,
                        longitude: gym.longitude ? parseFloat(gym.longitude) : 0
                    }
                },
                operatingHours: gym.operatingHours || {
                    open: gym.openingTime,
                    close: gym.closingTime
                },
                plans: gym.subscriptions ? gym.subscriptions.map(sub => ({
                    name: sub.title,
                    title: sub.title,
                    description: `${sub.validityDays} days validity`,
                    validityDays: sub.validityDays,
                    price: parseFloat(sub.price),
                    discountedPrice: parseFloat(sub.discountedPrice) || 0,
                    isMostPopular: sub.isMostPopular || false,
                    isCheapest: sub.isCheapest || false,
                    features: sub.features || []
                })) : [],
                amenities: gym.amenities || [],
                images: [],
                imageUrls: gym.images || [],
            });
        } else {
            const initialFormData = {
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
            };

            // For owners, set their own email as ownerId
            if (isOwner && user?.email) {
                initialFormData.ownerId = user.email;
            }

            setFormData(initialFormData);
        }
        setCurrentStep(0);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        const initialFormData = {
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
        };

        // For owners, set their own email as ownerId
        if (isOwner && user?.email) {
            initialFormData.ownerId = user.email;
        }

        setFormData(initialFormData);
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
            const token = getAccessToken();
            if (!token) {
                alert('Authentication required. Please log in.');
                setLoading(false);
                return;
            }

            console.log('DEBUG: Saving gym data');
            console.log('DEBUG: Form data:', {
                name: formData.name,
                isEditing: !!formData.id,
                hasImages: formData.images.length > 0,
                existingImageUrls: formData.imageUrls.length,
                ownerId: formData.ownerId
            });

            // Prepare gym data as JSON
            const gymData = {
                id: formData.id,
                name: formData.name,
                description: formData.description,
                address: formData.location.address,
                city: formData.location.city,
                state: formData.location.state,
                zipCode: formData.location.zip,
                latitude: formData.location.coordinates.latitude,
                longitude: formData.location.coordinates.longitude,
                rating: formData.rating,
                amenities: formData.amenities.map(amenity =>
                    typeof amenity === 'string'
                        ? { name: amenity, description: '' }
                        : amenity
                ),
                operatingHours: formData.operatingHours,
                plans: formData.plans,
                ownerId: formData.ownerId,
                capacity: formData.capacity,
                currentOccupancy: formData.currentOccupancy,
                images: formData.imageUrls // Send existing image URLs
            };

            console.log('DEBUG: Sending JSON data to API:', gymData);

            const url = formData.id
                ? buildApiUrl(`${API_CONFIG.ENDPOINTS.GYMS}/${formData.id}`)
                : buildApiUrl(API_CONFIG.ENDPOINTS.GYMS);

            console.log('DEBUG: API URL for request:', url);

            const response = await fetch(url, {
                method: formData.id ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(gymData)
            });

            const data = await response.json();
            console.log('DEBUG: API response:', data);

            if (data.success) {
                setSuccessModal({
                    isOpen: true,
                    title: 'Success!',
                    message: `Gym ${formData.id ? 'updated' : 'created'} successfully!`,
                    actionLabel: 'View Gyms',
                    onAction: () => fetchGyms()
                });
                closeModal();
            } else {
                setErrorModal({
                    isOpen: true,
                    title: 'Operation Failed',
                    message: `Error ${formData.id ? 'updating' : 'creating'} gym`,
                    error: data.message,
                    showRetry: true,
                    onRetry: handleSave
                });
            }
        } catch (error) {
            console.error('Error saving gym:', error);
            setErrorModal({
                isOpen: true,
                title: 'Network Error',
                message: 'Failed to save gym DEBUGe to network error',
                error: error instanceof Error ? error.message : 'Unknown error',
                showRetry: true,
                onRetry: handleSave
            });
        }
        setLoading(false);
    };

    const showDeleteConfirmation = (gym: Gym) => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete Gym',
            message: 'Are you sure you want to delete this gym? All associated data will be permanently removed.',
            itemName: gym.name,
            onConfirm: () => performDelete(gym.id)
        });
    };

    const performDelete = async (id: number) => {
        setLoading(true);
        try {
            const response = await fetch(buildApiUrl(`${API_CONFIG.ENDPOINTS.GYMS}/${id}`), {
                method: 'DELETE'
            });
            const data = await response.json();
            if (data.success) {
                setSuccessModal({
                    isOpen: true,
                    title: 'Gym Deleted',
                    message: 'Gym has been successfully deleted from the system.',
                    actionLabel: 'Refresh List',
                    onAction: fetchGyms
                });
            } else {
                setErrorModal({
                    isOpen: true,
                    title: 'Delete Failed',
                    message: 'Failed to delete the gym.',
                    error: data.message,
                    showRetry: true,
                    onRetry: () => performDelete(id)
                });
            }
        } catch (error) {
            console.error('Error deleting gym:', error);
            setErrorModal({
                isOpen: true,
                title: 'Network Error',
                message: 'Failed to delete gym due to network error.',
                error: error instanceof Error ? error.message : 'Unknown error',
                showRetry: true,
                onRetry: () => performDelete(id)
            });
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

    // Handle image edit modal
    const openImageModal = (gym: Gym) => {
        setSelectedGymForImages(gym);
        setIsImageModalOpen(true);
    };

    const closeImageModal = () => {
        setSelectedGymForImages(null);
        setIsImageModalOpen(false);
    };

    const handleImageSave = async (gymId: number, images: string[]) => {
        setLoading(true);
        try {
            const token = getAccessToken();
            if (!token) {
                setErrorModal({
                    isOpen: true,
                    title: 'Authentication Required',
                    message: 'Please log in to update gym images.',
                    error: 'No authentication token found'
                });
                return;
            }

            // Update gym with new images
            const response = await fetch(buildApiUrl(`${API_CONFIG.ENDPOINTS.GYMS}/${gymId}/images`), {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ images })
            });

            const data = await response.json();
            if (data.success) {
                setSuccessModal({
                    isOpen: true,
                    title: 'Images Updated!',
                    message: 'Gym images have been successfully updated.',
                    actionLabel: 'Refresh List',
                    onAction: fetchGyms
                });
                closeImageModal();
            } else {
                setErrorModal({
                    isOpen: true,
                    title: 'Update Failed',
                    message: 'Failed to update gym images.',
                    error: data.message,
                    showRetry: true,
                    onRetry: () => handleImageSave(gymId, images)
                });
            }
        } catch (error) {
            console.error('Error updating images:', error);
            setErrorModal({
                isOpen: true,
                title: 'Network Error',
                message: 'Failed to update images due to network error.',
                error: error instanceof Error ? error.message : 'Unknown error',
                showRetry: true,
                onRetry: () => handleImageSave(gymId, images)
            });
        } finally {
            setLoading(false);
        }
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
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
                            {searchGyms(searchTerm).map((gym) => (
                                <div key={gym.id} className="bg-white rounded-lg shadow border p-4 hover:shadow-md transition-shadow -1/2">
                                    <div className="flex items-start justify-between relative">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center space-x-3 mb-3">
                                                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                                                    {gym.name[0]}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                                                        {gym.name}
                                                    </h3>
                                                </div>
                                            </div>

                                            {/* Owner Information */}
                                            <div className="bg-blue-50 rounded-lg p-3 mb-3">
                                                <div className="flex items-center space-x-2">
                                                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                                        <span className="text-xs font-bold text-blue-600">
                                                            {gym.owner.firstName[0]}{gym.owner.lastName[0]}
                                                        </span>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {gym.owner.firstName} {gym.owner.lastName}
                                                        </p>
                                                        <p className="text-xs text-gray-500 truncate">
                                                            {gym.owner.email}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>


                                            {/* Address Information */}
                                            <div className="bg-gray-50 rounded-lg p-3 mb-3">
                                                <div className="flex items-start space-x-2">
                                                    <MapPin className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-gray-900">{gym.address}</p>
                                                        <p className="text-xs text-gray-500">
                                                            {gym.city}, {gym.state} {gym.zipCode}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Decription */}
                                            <div className="bg-gray-50 rounded-lg p-3 mb-3">
                                                <div className="flex items-start space-x-2">
                                                    <Info className="w-4 h-4 text-blue-700 mt-0.5 flex-shrink-0" />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm text-gray-500 mb-1">{gym.description}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Stats */}
                                            <div className="grid grid-cols-2 gap-4 text-center">
                                                <div className="bg-yellow-50 rounded-lg p-2">
                                                    <p className="text-sm font-bold text-yellow-700">
                                                        {gym.rating}/5
                                                    </p>
                                                    <p className="text-xs font-medium text-yellow-600">
                                                        Rating
                                                    </p>
                                                </div>
                                                <div className="bg-green-50 rounded-lg p-2">
                                                    <p className="text-sm font-bold text-green-700">
                                                        {gym.currentOccupancy}/{gym.capacity}
                                                    </p>
                                                    <p className="text-xs font-medium text-green-600">
                                                        Members
                                                    </p>
                                                </div>
                                                <div className="bg-green-50 rounded-lg p-2">
                                                    <p className="text-sm font-bold text-green-700">
                                                        {gym.openingTime.slice(0, 5)}
                                                    </p>
                                                    <p className="text-xs font-medium text-green-600">
                                                        Opening Time
                                                    </p>
                                                </div>
                                                <div className="bg-green-50 rounded-lg p-2">
                                                    <p className="text-sm font-bold text-green-700">
                                                        {gym.closingTime.slice(0, 5)}
                                                    </p>
                                                    <p className="text-xs font-medium text-green-600">
                                                        Closing Time
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-2 ml-4 absolute top-0 right-0">
                                            <button
                                                onClick={() => openImageModal(gym)}
                                                className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                                title="Edit images"
                                            >
                                                <Image className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => openModal(gym)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Edit gym details"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => showDeleteConfirmation(gym)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Delete gym"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
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
                            {currentStep === 0 && <StepBasicInfo setCurrentStep={setCurrentStep} formData={formData} onChange={setFormData} />}
                            {currentStep === 1 && <StepLocation setCurrentStep={setCurrentStep} formData={formData} onChange={setFormData} isEditing={!!formData.id} />}
                            {currentStep === 2 && <StepOperatingHours setCurrentStep={setCurrentStep} formData={formData} onChange={setFormData} />}
                            {currentStep === 3 && <StepAmenities setCurrentStep={setCurrentStep} formData={formData} onChange={setFormData} />}
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

                            {/* For new gym creation, show Create button after step 3 (Amenities) */}
                            {!formData.id && currentStep < 3 && (
                                <button
                                    onClick={handleNextStep}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Next
                                </button>
                            )}

                            {!formData.id && currentStep === 3 && (
                                <button
                                    onClick={handleSave}
                                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                >
                                    Create Gym
                                </button>
                            )}

                            {/* For gym editing, show Update button after step 3 (Amenities) */}
                            {formData.id && currentStep < 3 && (
                                <button
                                    onClick={handleNextStep}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Next
                                </button>
                            )}

                            {formData.id && currentStep === 3 && (
                                <button
                                    onClick={handleSave}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Update Gym
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Image Edit Modal */}
            <GymImageEditModal
                gym={selectedGymForImages}
                isOpen={isImageModalOpen}
                onClose={closeImageModal}
                onSave={handleImageSave}
            />

            {/* Success Modal */}
            <SuccessModal
                isOpen={successModal.isOpen}
                onClose={() => setSuccessModal({ ...successModal, isOpen: false })}
                title={successModal.title}
                message={successModal.message}
                actionLabel={successModal.actionLabel}
                onAction={successModal.onAction}
            />

            {/* Error Modal */}
            <ErrorModal
                isOpen={errorModal.isOpen}
                onClose={() => setErrorModal({ ...errorModal, isOpen: false })}
                title={errorModal.title}
                message={errorModal.message}
                error={errorModal.error}
                showRetry={errorModal.showRetry}
                onRetry={errorModal.onRetry}
            />

            {/* Image Upload Modal */}
            <ImageUploadModal
                isOpen={isImageUploadModalOpen}
                onClose={() => setIsImageUploadModalOpen(false)}
                gymId={selectedGymForImages?.id || ''}
                gymName={selectedGymForImages?.name || 'Unknown Gym'}
                onSuccess={(uploadedImages) => {
                    setSuccessModal({
                        isOpen: true,
                        title: 'Images Uploaded!',
                        message: `Successfully uploaded ${uploadedImages.length} image(s)`,
                        actionLabel: 'Refresh Gyms',
                        onAction: fetchGyms
                    });
                    setIsImageUploadModalOpen(false);
                }}
            />

            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                title={confirmModal.title}
                message={confirmModal.message}
                itemName={confirmModal.itemName}
                onConfirm={() => {
                    confirmModal.onConfirm();
                    setConfirmModal({ ...confirmModal, isOpen: false });
                }}
            />
        </div>
    );
};

export default GymManagement;

