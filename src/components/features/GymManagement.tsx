import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, MapPin, X, Image, Info, Search, Filter, Star, Users, Building, Grid, List, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import StepBasicInfo from './gymSteps/StepBasicInfo';
import StepLocation from './gymSteps/StepLocation';
import StepOperatingHours from './gymSteps/StepOperatingHours';
import StepContactInfo from './gymSteps/StepContactInfo';
import StepAmenities from './gymSteps/StepAmenities';
import GymImageEditModal from './GymImageEditModal';
import SuccessModal from '../ui/SuccessModal';
import ErrorModal from '../ui/ErrorModal';
import ImageUploadModal from '../ui/ImageUploadModal';
import ConfirmationModal from '../ui/ConfirmationModal';
import { gymService, Gym, GymManagementFilters, GymListResponse } from '../../services/gymService';
import { useAuthStore } from '../../stores/authStore';
import { buildApiUrl, API_CONFIG } from '../../config/api';

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
        rating: 0,
        ownerId: '',
        email: '',
        phone: '',
        websiteUrl: '',
        gstNumber: '',
        registrationNo: '',
        daysOpen: '',
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
        plans: [] as { title: string; validityDays: number; price: number; discountPercent: number; bufferDays: number; bufferFee: number; features: any[] }[],
        amenities: [] as any[],
        images: [] as { file: File; previewUrl: string; id: string }[],
        imageUrls: [] as string[],
    });

    // Debug formData changes
    useEffect(() => {
        console.log('DEBUG GymManagement formData changed:', {
            location: formData.location,
            operatingHours: formData.operatingHours
        });
    }, [formData]);
    const [searchTerm, setSearchTerm] = useState('');
    const [ownerFilter, setOwnerFilter] = useState('');
    const [ratingFilter, setRatingFilter] = useState('');
    const [capacityFilter, setCapacityFilter] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalResults, setTotalResults] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'inactive'
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        fetchGyms();
    }, []);

    const fetchGyms = async (reset = false) => {
        setLoading(true);
        setError(null);
        
        if (reset) {
            setCurrentPage(1);
        }
        
        try {
            const token = getAccessToken();
            if (!token) {
                setError('Authentication required. Please log in.');
                setLoading(false);
                return;
            }

            console.log('DEBUG: Fetching gyms from API...');
            console.log('DEBUG: Using token:', token ? 'Token available' : 'No token');

            // Prepare all filters for API call
            const trimmedSearch = searchTerm?.trim();
            const isValidSearch = trimmedSearch && trimmedSearch.length >= 2;
            
            const filters: GymManagementFilters = {
                page: reset ? 1 : currentPage,
                limit: itemsPerPage,
                search: isValidSearch ? trimmedSearch : undefined,
                owner: ownerFilter && ownerFilter.trim().length > 0 ? ownerFilter.trim() : undefined,
                minRating: ratingFilter && ratingFilter !== '' ? ratingFilter : undefined,
                capacity: capacityFilter && capacityFilter !== '' ? capacityFilter : undefined
            };
            
            console.log('DEBUG: All filters being sent:', {
                searchTerm: searchTerm,
                trimmedSearch: trimmedSearch,
                isValidSearch: isValidSearch,
                ownerFilter: ownerFilter,
                ratingFilter: ratingFilter,
                capacityFilter: capacityFilter,
                finalFilters: filters
            });

            console.log('DEBUG: API filters:', filters);

            const response = await gymService.getGymsForManagement(filters);
            console.log('DEBUG: Raw API response:', response);

            if (response.success && response.data) {
                console.log('DEBUG: Successfully fetched gyms:', response.data.gyms?.length || 0);
                console.log('DEBUG: Gym data structure:', response.data.gyms);
                console.log('DEBUG: Pagination data:', response.data.pagination);
                
                // Handle both paginated and non-paginated responses
                if (Array.isArray(response.data)) {
                    // Non-paginated response (fallback to old structure)
                    setGyms(response.data);
                    setTotalResults(response.data.length);
                    setTotalPages(Math.ceil(response.data.length / itemsPerPage));
                } else if (response.data.gyms) {
                    // New paginated response structure
                    setGyms(response.data.gyms);
                    
                    if (response.data.pagination) {
                        // Use the new pagination structure
                        setTotalResults(response.data.pagination.totalItems || response.data.gyms.length);
                        setTotalPages(response.data.pagination.totalPages || Math.ceil((response.data.pagination.totalItems || response.data.gyms.length) / itemsPerPage));
                        setCurrentPage(response.data.pagination.currentPage || (reset ? 1 : currentPage));
                    } else {
                        // Fallback to old pagination structure if exists
                        setTotalResults(response.data.total || response.data.gyms.length);
                        setTotalPages(response.data.totalPages || Math.ceil((response.data.total || response.data.gyms.length) / itemsPerPage));
                        setCurrentPage(response.data.currentPage || (reset ? 1 : currentPage));
                    }
                } else {
                    setGyms([]);
                    setTotalResults(0);
                    setTotalPages(0);
                }
            } else {
                console.error('DEBUG: API call failed:', response.message);
                setError(response.message || 'Failed to fetch gyms');
                setGyms([]);
                setTotalResults(0);
                setTotalPages(0);
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            console.error('DEBUG: Network/catch error:', error);
            setError(errorMessage);
            setGyms([]);
            setTotalResults(0);
            setTotalPages(0);
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
                id: gym.id,
                name: gym.name,
                description: gym.description,
                capacity: gym.capacity,
                currentOccupancy: gym.currentOccupancy,
                rating: gym.rating,
                ownerId: gym.ownerId,
                address: gym.address,
                city: gym.city,
                state: gym.state,
                zipCode: gym.zipCode,
                latitude: gym.latitude,
                longitude: gym.longitude,
                openingTime: gym.openingTime,
                closingTime: gym.closingTime,
                email: gym.email,
                phone: gym.phone,
                websiteUrl: gym.websiteUrl,
                gstNumber: gym.gstNumber,
                registrationNo: gym.registrationNo,
                daysOpen: gym.daysOpen,
                amenities: gym.amenities,
                subscriptions: gym.subscriptions,
                images: gym.images
            });
            console.log('DEBUG: Setting formData with ownerId:', {
                originalOwnerId: gym.ownerId,
                convertedOwnerId: gym.ownerId ? gym.ownerId.toString() : '',
                ownerObject: gym.owner
            });
            
            setFormData({
                id: gym.id ? gym.id.toString() : '',
                name: gym.name || '',
                description: gym.description || '',
                capacity: gym.capacity || 0,
                rating: gym.rating ? parseFloat(gym.rating.toString()) : 0,
                ownerId: gym.ownerId ? gym.ownerId.toString() : '',
                email: gym.email || '',
                phone: gym.phone || '',
                websiteUrl: gym.websiteUrl || '',
                gstNumber: gym.gstNumber || '',
                registrationNo: gym.registrationNo || '',
                daysOpen: gym.daysOpen || '',
                location: {
                    address: gym.address || '',
                    city: gym.city || '',
                    state: gym.state || '',
                    zip: gym.zipCode || '',
                    coordinates: {
                        latitude: gym.latitude ? parseFloat(gym.latitude.toString()) : 0,
                        longitude: gym.longitude ? parseFloat(gym.longitude.toString()) : 0
                    }
                },
                operatingHours: gym.operatingHours || {
                    open: gym.openingTime || '',
                    close: gym.closingTime || ''
                },
                plans: gym.subscriptions ? gym.subscriptions.map(sub => ({
                    title: sub.name || '',
                    validityDays: sub.validityDays || 0,
                    price: sub.price ? parseFloat(sub.price.toString()) : 0,
                    discountPercent: sub.discountPercent ? parseFloat(sub.discountPercent.toString()) : 0,
                    bufferDays: sub.bufferDays || 0,
                    bufferFee: sub.bufferFee ? parseFloat(sub.bufferFee.toString()) : 0,
                    features: sub.features ? sub.features.map(f => ({
                        title: f.title || f.description || '',
                        isHighlighted: f.isHighlighted === 1 || f.isHighlighted === true
                    })) : []
                })) : [],
                amenities: gym.amenities ? gym.amenities.map(amenity => 
                    typeof amenity === 'string' ? amenity : (amenity.name || '')
                ) : [],
                images: [],
                imageUrls: gym.images || [],
            });
        } else {
            const initialFormData = {
                id: '',
                name: '',
                description: '',
                capacity: 0,
                rating: 0,
                ownerId: '',
                email: '',
                phone: '',
                websiteUrl: '',
                gstNumber: '',
                registrationNo: '',
                daysOpen: '',
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

            // For owners, set their own user ID as ownerId
            if (isOwner && user?.id) {
                initialFormData.ownerId = user.id.toString();
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
            rating: 0,
            ownerId: '',
            email: '',
            phone: '',
            websiteUrl: '',
            gstNumber: '',
            registrationNo: '',
            daysOpen: '',
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

        // For owners, set their own user ID as ownerId
        if (isOwner && user?.id) {
            initialFormData.ownerId = user.id.toString();
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
                ownerId: formData.ownerId,
                operatingHours: formData.operatingHours
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
                email: formData.email,
                phone: formData.phone,
                websiteUrl: formData.websiteUrl,
                gstNumber: formData.gstNumber,
                registrationNo: formData.registrationNo,
                daysOpen: formData.daysOpen,
                // Send operating hours as individual fields for backend compatibility
                openingTime: formData.operatingHours?.open || '',
                closingTime: formData.operatingHours?.close || '',
                operatingHours: formData.operatingHours, // Also send as nested object
                amenities: formData.amenities.map(amenity =>
                    typeof amenity === 'string'
                        ? { name: amenity, description: '' }
                        : amenity
                ),
                plans: formData.plans,
                ownerId: parseInt(formData.ownerId) || 0,
                capacity: formData.capacity,
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
            const token = getAccessToken();
            if (!token) {
                setErrorModal({
                    isOpen: true,
                    title: 'Authentication Error',
                    message: 'You need to be logged in to delete gyms.',
                    error: 'No authentication token found'
                });
                setLoading(false);
                return;
            }

            const response = await fetch(buildApiUrl(`${API_CONFIG.ENDPOINTS.GYMS}/${id}`), {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
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

    const handleSearch = () => {
        fetchGyms(true); // Reset to first page and fetch with current filters
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const clearAllFilters = () => {
        setSearchTerm('');
        setOwnerFilter('');
        setRatingFilter('');
        setCapacityFilter('');
        // Trigger search with cleared filters
        setTimeout(() => fetchGyms(true), 0);
    };

    // Check for active filters (only count those that actually affect the API)
    const hasActiveFilters = 
        (searchTerm && searchTerm.trim().length >= 2) || 
        (ownerFilter && ownerFilter.trim().length > 0) || 
        (ratingFilter && ratingFilter !== '') || 
        (capacityFilter && capacityFilter !== '');

    // Use API pagination instead of client-side
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + gyms.length, totalResults);

    // Fetch gyms when pagination or key filters change
    useEffect(() => {
        // if (currentPage > 1) {
            fetchGyms(); // Don't reset page when changing pages
        // }
    }, [currentPage, itemsPerPage]);

    // Fetch gyms when any filter changes (with debounce)
    useEffect(() => {
        const debounceTimeout = setTimeout(() => {
            fetchGyms(true); // Reset to first page when filters change
        }, 500);

        return () => clearTimeout(debounceTimeout);
    }, [searchTerm, ownerFilter, ratingFilter, capacityFilter]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleItemsPerPageChange = (newItemsPerPage: number) => {
        setItemsPerPage(newItemsPerPage);
        setCurrentPage(1);
        // Will trigger useEffect to fetch gyms with new page size
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
            setSuccessModal({
                isOpen: true,
                title: 'Images Updated!',
                message: 'Gym images have been successfully updated.',
                actionLabel: 'Refresh List',
                onAction: fetchGyms
            });
            closeImageModal();
            
            // Refresh the gym list to get updated image data
            await fetchGyms();
        } catch (error) {
            console.error('Error updating images:', error);
            setErrorModal({
                isOpen: true,
                title: 'Update Error',
                message: 'An error occurred while updating images.',
                error: error instanceof Error ? error.message : 'Unknown error'
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

            {/* Search and Filters */}
            <div className="space-y-4">
                {/* Advanced Filter Panel */}
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Search Gyms</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Name, location, owner... (min 2 chars)"
                                    value={searchTerm}
                                    onChange={(e) => {
                                        const rawValue = e.target.value.trimStart(); // Remove leading whitespace but allow trailing for UX
                                        // Basic sanitization: remove excessive whitespace and potentially dangerous characters
                                        const sanitizedValue = rawValue
                                            .replace(/\s+/g, ' ') // Replace multiple spaces with single space
                                            .replace(/[<>"'&]/g, ''); // Remove basic HTML/script injection characters
                                        setSearchTerm(sanitizedValue);
                                    }}
                                    onKeyPress={handleKeyPress}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                />
                                {searchTerm && searchTerm.trim().length > 0 && searchTerm.trim().length < 2 && (
                                    <div className="absolute top-full left-0 mt-1 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-200">
                                        Minimum 2 characters required
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Owner</label>
                            <input
                                type="text"
                                placeholder="Owner name or email..."
                                value={ownerFilter}
                                onChange={(e) => setOwnerFilter(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                            <select
                                value={ratingFilter}
                                onChange={(e) => setRatingFilter(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white text-sm"
                            >
                                <option value="">All Ratings</option>
                                <option value="4+">4+ Stars</option>
                                <option value="3+">3+ Stars</option>
                                <option value="2+">2+ Stars</option>
                                <option value="1+">1+ Stars</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                            <select
                                value={capacityFilter}
                                onChange={(e) => setCapacityFilter(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white text-sm"
                            >
                                <option value="">All Sizes</option>
                                <option value="small">Small (≤50)</option>
                                <option value="medium">Medium (51-200)</option>
                                <option value="large">Large (200+)</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mt-4">
                        {/* <div className="flex gap-2">
                            <button
                                onClick={handleSearch}
                                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <Search className="w-4 h-4 mr-2" />
                                Search
                            </button>
                        </div> */}
                        {hasActiveFilters && (
                            <button
                                onClick={clearAllFilters}
                                className="flex items-center px-4 py-2 text-red-600 hover:text-red-700 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                            >
                                <X className="w-4 h-4 mr-2" />
                                Clear All
                            </button>
                        )}
                    </div>

                    <div className="mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <p className="text-sm text-gray-600">
                            Showing {startIndex + 1}-{endIndex} of {totalResults} gyms
                            {hasActiveFilters && (
                                <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                                    <Filter className="w-3 h-3 mr-1" />
                                    {[searchTerm, ownerFilter, ratingFilter, capacityFilter].filter(Boolean).length} filter{[searchTerm, ownerFilter, ratingFilter, capacityFilter].filter(Boolean).length !== 1 ? 's' : ''} active
                                </span>
                            )}
                        </p>
                        <div className="flex items-center gap-4">
                            {/* Items per page selector */}
                            <div className="flex items-center gap-2">
                                <label className="text-sm text-gray-600">Show:</label>
                                <select
                                    value={itemsPerPage}
                                    onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                                    className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value={5}>5</option>
                                    <option value={10}>10</option>
                                    <option value={25}>25</option>
                                    <option value={50}>50</option>
                                </select>
                            </div>
                            {/* View mode toggle */}
                            <div className="flex bg-gray-100 rounded-lg p-1">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 rounded transition-colors ${
                                        viewMode === 'grid'
                                            ? 'bg-white text-blue-600 shadow-sm'
                                            : 'text-gray-600 hover:text-gray-800'
                                    }`}
                                    title="Grid View"
                                >
                                    <Grid className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setViewMode('table')}
                                    className={`p-2 rounded transition-colors ${
                                        viewMode === 'table'
                                            ? 'bg-white text-blue-600 shadow-sm'
                                            : 'text-gray-600 hover:text-gray-800'
                                    }`}
                                    title="Table View"
                                >
                                    <List className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
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

            {/* Gyms Display */}
            {!loading && !error && (
                <div className="space-y-4">
                    {gyms.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-lg shadow border">
                            <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                {hasActiveFilters ? 'No gyms match your search criteria' : 'No gyms found'}
                            </h3>
                            <div className="max-w-md mx-auto text-gray-500 space-y-2">
                                {hasActiveFilters ? (
                                    <>
                                        <p>Your search for {searchTerm && `"${searchTerm}"`} didn't return any results.</p>
                                        <div className="text-sm space-y-1">
                                            <p><strong>Try:</strong></p>
                                            <ul className="list-disc list-inside space-y-1">
                                                <li>Using different keywords</li>
                                                <li>Checking your spelling</li>
                                                <li>Removing some filters</li>
                                                <li>Searching for gym names or locations</li>
                                            </ul>
                                        </div>
                                    </>
                                ) : (
                                    <p>Start by adding your first gym to get started with gym management.</p>
                                )}
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Grid View */}
                            {viewMode === 'grid' && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
                                    {gyms.map((gym) => (
                                        <div key={gym.id} className="bg-white rounded-lg shadow border p-4 hover:shadow-md transition-shadow">
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

                                                    {/* Description */}
                                                    <div className="bg-gray-50 rounded-lg p-3 mb-3">
                                                        <div className="flex items-start space-x-2">
                                                            <Info className="w-4 h-4 text-blue-700 mt-0.5 flex-shrink-0" />
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm text-gray-500 mb-1 line-clamp-2">{gym.description}</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Stats */}
                                                    <div className="grid grid-cols-2 gap-2 text-center">
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
                                                                {gym.capacity}
                                                            </p>
                                                            <p className="text-xs font-medium text-green-600">
                                                                Members
                                                            </p>
                                                        </div>
                                                        <div className="bg-green-50 rounded-lg p-2">
                                                            <p className="text-sm font-bold text-green-700">
                                                                {gym.openingTime ? gym.openingTime.slice(0, 5) : 'N/A'}
                                                            </p>
                                                            <p className="text-xs font-medium text-green-600">
                                                                Opening
                                                            </p>
                                                        </div>
                                                        <div className="bg-green-50 rounded-lg p-2">
                                                            <p className="text-sm font-bold text-green-700">
                                                                {gym.closingTime ? gym.closingTime.slice(0, 5) : 'N/A'}
                                                            </p>
                                                            <p className="text-xs font-medium text-green-600">
                                                                Closing
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

                            {/* Table View */}
                            {viewMode === 'table' && (
                                <div className="bg-white rounded-lg shadow border overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gym</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacity</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hours</th>
                                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {gyms.map((gym) => (
                                                    <tr key={gym.id} className="hover:bg-gray-50">
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex items-center">
                                                                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                                                    {gym.name[0]}
                                                                </div>
                                                                <div className="ml-4">
                                                                    <div className="text-sm font-medium text-gray-900">{gym.name}</div>
                                                                    <div className="text-sm text-gray-500 max-w-xs truncate">{gym.description}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm text-gray-900">{gym.owner.firstName} {gym.owner.lastName}</div>
                                                            <div className="text-sm text-gray-500">{gym.owner.email}</div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm text-gray-900">{gym.address}</div>
                                                            <div className="text-sm text-gray-500">{gym.city}, {gym.state} {gym.zipCode}</div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex items-center">
                                                                <Star className="w-4 h-4 text-yellow-400 mr-1" />
                                                                <span className="text-sm text-gray-900">{gym.rating}/5</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm text-gray-900">
                                                                {gym.capacity}
                                                            </div>
                                                            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                                                <div 
                                                                    className="bg-blue-600 h-2 rounded-full" 
                                                                    style={{ width: `${Math.min((gym.currentOccupancy / gym.capacity) * 100, 100)}%` }}
                                                                ></div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            <div>
                                                                {gym.openingTime && gym.closingTime 
                                                                    ? `${gym.openingTime.slice(0, 5)} - ${gym.closingTime.slice(0, 5)}`
                                                                    : 'Hours not set'
                                                                }
                                                            </div>
                                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                            <div className="flex items-center justify-end space-x-2">
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
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white rounded-lg border p-4">
                                    <div className="text-sm text-gray-700">
                                        Showing <span className="font-medium">{startIndex + 1}</span> to <span className="font-medium">{endIndex}</span> of <span className="font-medium">{totalResults}</span> results
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Previous
                                        </button>
                                        
                                        {/* Page Numbers */}
                                        <div className="flex items-center space-x-1">
                                            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                                let pageNumber;
                                                if (totalPages <= 5) {
                                                    pageNumber = i + 1;
                                                } else if (currentPage <= 3) {
                                                    pageNumber = i + 1;
                                                } else if (currentPage >= totalPages - 2) {
                                                    pageNumber = totalPages - 4 + i;
                                                } else {
                                                    pageNumber = currentPage - 2 + i;
                                                }
                                                
                                                return (
                                                    <button
                                                        key={pageNumber}
                                                        onClick={() => handlePageChange(pageNumber)}
                                                        className={`px-3 py-2 text-sm font-medium rounded-md ${
                                                            currentPage === pageNumber
                                                                ? 'bg-blue-600 text-white'
                                                                : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                                                        }`}
                                                    >
                                                        {pageNumber}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        
                                        <button
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
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
                            {currentStep === 2 && <StepContactInfo setCurrentStep={setCurrentStep} formData={formData} onChange={setFormData} />}
                            {currentStep === 3 && <StepOperatingHours setCurrentStep={setCurrentStep} formData={formData} onChange={setFormData} />}
                            {currentStep === 4 && <StepAmenities setCurrentStep={setCurrentStep} formData={formData} onChange={setFormData} />}
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

                            {/* For new gym creation, show Create button after step 4 (Amenities) */}
                            {!formData.id && currentStep < 4 && (
                                <button
                                    onClick={handleNextStep}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Next
                                </button>
                            )}

                            {!formData.id && currentStep === 4 && (
                                <button
                                    onClick={handleSave}
                                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                >
                                    Create Gym
                                </button>
                            )}

                            {/* For gym editing, show Update button after step 4 (Amenities) */}
                            {formData.id && currentStep < 4 && (
                                <button
                                    onClick={handleNextStep}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Next
                                </button>
                            )}

                            {formData.id && currentStep === 4 && (
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

