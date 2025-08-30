import { buildApiUrl, API_CONFIG } from '../config/api';
import { apiClient, ApiResponse } from './apiClient';

// Exact backend model interfaces
export interface GymAmenity {
  id: number;
  gymId: number;
  name: string;
  description?: string;
  recordStatus: number; // 1=active, 0=inactive
  createdBy?: number;
  updatedBy?: number;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionFeature {
  id: number;
  subscriptionId: number;
  title: string;
  description?: string;
  isHighlighted: number; // 1=highlighted, 0=normal
  displayOrder?: number;
  createdBy?: number;
  updatedBy?: number;
  recordStatus: number; // 1=active, 0=inactive
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: number;
  gymId: number;
  name: string;
  price: string; // DECIMAL as string
  validityDays: number;
  discountPercent?: string; // DECIMAL as string
  bufferDays?: number;
  bufferFee?: string; // DECIMAL as string
  createdBy?: number;
  updatedBy?: number;
  recordStatus: number; // 1=active, 0=inactive
  created_at: string;
  updated_at: string;
  features?: SubscriptionFeature[];
}

export interface GymOwner {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

export interface Gym {
  id: number;
  name: string;
  ownerId: number;
  address: string;
  city?: string;
  state?: string;
  zipCode?: string;
  latitude: string; // DECIMAL as string
  longitude: string; // DECIMAL as string
  rating?: string; // DECIMAL as string
  capacity?: number;
  email?: string;
  phone?: string;
  websiteUrl?: string;
  gstNumber?: string;
  registrationNo?: string;
  openingTime?: string;
  closingTime?: string;
  daysOpen?: string;
  description?: string;
  createdBy?: number;
  updatedBy?: number;
  recordStatus: number; // 1=active, 0=inactive
  created_at: string;
  updated_at: string;
  
  // Related entities (populated by includes)
  amenities?: GymAmenity[];
  subscriptions?: Subscription[];
  owner?: GymOwner;
  
  // Legacy computed fields for backward compatibility
  currentOccupancy?: number;
  operatingHours?: {
    open: string;
    close: string;
  };
  images?: string[];
}

export interface GymListResponse {
  gyms: Gym[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}


export interface GymFilters {
  latitude?: number;
  longitude?: number;
  radius?: number; // in kilometers
  minRating?: number;
  maxPrice?: number;
  amenities?: string[];
  city?: string;
  state?: string;
  sortBy?: 'distance' | 'rating' | 'price' | 'name';
  sortOrder?: 'asc' | 'desc';
}

// Management filters for admin/owner authenticated endpoints
export interface GymManagementFilters {
  page?: number;
  limit?: number;
  search?: string;
  activeOnly?: boolean;
  owner?: string;
  minRating?: string;
  capacity?: string;
}

class GymService {
  // Public discovery method for regular users (shows only active gyms)
  async getGyms(filters?: GymFilters): Promise<ApiResponse<Gym[]>> {
    try {
      // Build query parameters
      const params = new URLSearchParams();
      
      if (filters) {
        if (filters.latitude !== undefined) params.append('latitude', filters.latitude.toString());
        if (filters.longitude !== undefined) params.append('longitude', filters.longitude.toString());
        if (filters.radius !== undefined) params.append('radius', filters.radius.toString());
        if (filters.minRating !== undefined) params.append('minRating', filters.minRating.toString());
        if (filters.maxPrice !== undefined) params.append('maxPrice', filters.maxPrice.toString());
        if (filters.amenities && filters.amenities.length > 0) {
          params.append('amenities', filters.amenities.join(','));
        }
        if (filters.city) params.append('city', filters.city);
        if (filters.state) params.append('state', filters.state);
        if (filters.sortBy) params.append('sortBy', filters.sortBy);
        if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
      }
      
      const queryString = params.toString();
      const endpoint = queryString ? `${API_CONFIG.ENDPOINTS.GYMS_PUBLIC}?${queryString}` : API_CONFIG.ENDPOINTS.GYMS_PUBLIC;
      
      // Use direct fetch for public endpoint (no authentication required)
      const response = await fetch(buildApiUrl(endpoint));
      const result = await response.json();
      
      // Handle the response from the public API
      if (result.success && result.data && result.data.gyms) {
        return {
          success: true,
          message: result.message,
          data: result.data.gyms
        };
      }
      
      return {
        success: false,
        message: result.message || 'Failed to fetch gyms',
        data: null
      };
    } catch (error) {
      console.error('Error fetching gyms:', error);
      return {
        success: false,
        message: 'Failed to fetch gyms. Please try again.',
        data: null
      };
    }
  }
  
  // Admin/Owner management method (shows both active and inactive gyms)
  async getGymsForManagement(filters?: GymManagementFilters): Promise<ApiResponse<GymListResponse>> {
    try {
      const params = new URLSearchParams();
      
      // Set defaults - by default show both active and inactive gyms for management
      const page = filters?.page || 1;
      const limit = filters?.limit || 10;
      const activeOnly = filters?.activeOnly !== undefined ? filters.activeOnly : false;
      
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      params.append('activeOnly', activeOnly.toString());
      
      // Add search filter only if it has valid content
      if (filters?.search && filters.search.trim().length >= 2) {
        params.append('search', filters.search.trim());
      }
      
      // Add owner filter if provided
      if (filters?.owner && filters.owner.trim().length > 0) {
        params.append('owner', filters.owner.trim());
      }
      
      // Add rating filter if provided
      if (filters?.minRating && filters.minRating !== '') {
        params.append('minRating', filters.minRating);
      }
      
      // Add capacity filter if provided
      if (filters?.capacity && filters.capacity !== '') {
        params.append('capacity', filters.capacity);
      }
      
      console.log('DEBUG: Final URL params:', params.toString());
      
      const endpoint = `${API_CONFIG.ENDPOINTS.GYMS}?${params.toString()}`;
      
      // Use authenticated API client
      return apiClient.get<GymListResponse>(endpoint);
    } catch (error) {
      console.error('Error fetching gyms for management:', error);
      return {
        success: false,
        message: 'Failed to fetch gyms. Please try again.',
        data: null
      };
    }
  }

  async getGymById(id: string): Promise<ApiResponse<Gym>> {
    return apiClient.get<Gym>(`${API_CONFIG.ENDPOINTS.GYMS}/${id}`);
  }

  async createGym(gymData: Partial<Gym>): Promise<ApiResponse<Gym>> {
    return apiClient.post<Gym>(API_CONFIG.ENDPOINTS.GYMS, gymData);
  }

  async updateGym(id: string, gymData: Partial<Gym>): Promise<ApiResponse<Gym>> {
    return apiClient.put<Gym>(`${API_CONFIG.ENDPOINTS.GYMS}/${id}`, gymData);
  }

  async deleteGym(id: string): Promise<ApiResponse> {
    return apiClient.delete(`${API_CONFIG.ENDPOINTS.GYMS}/${id}`);
  }

  // Gym Image Management Methods
  async getGymImages(gymId: string | number): Promise<ApiResponse<any[]>> {
    try {
      // Use direct fetch for public endpoint (no authentication required)
      const response = await fetch(buildApiUrl(`${API_CONFIG.ENDPOINTS.GYM_IMAGES}/gym/${gymId}`));
      const result = await response.json();
      
      if (result.success && result.data) {
        return {
          success: true,
          message: result.message,
          data: result.data
        };
      }
      
      return {
        success: false,
        message: result.message || 'Failed to fetch gym images',
        data: null
      };
    } catch (error) {
      console.error('Error fetching gym images:', error);
      return {
        success: false,
        message: 'Failed to fetch gym images. Please try again.',
        data: null
      };
    }
  }

  async deleteGymImage(imageId: string | number): Promise<ApiResponse> {
    return apiClient.delete(`${API_CONFIG.ENDPOINTS.GYM_IMAGES}/${imageId}`);
  }
}

export const gymService = new GymService();

