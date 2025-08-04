import { buildApiUrl, API_CONFIG } from '../config/api';
import { apiClient, ApiResponse } from './apiClient';

export interface Gym {
  id: number;
  name: string;
  address: string;
  latitude: string;
  longitude: string;
  rating: string;
  image?: string;
  description: string;
  amenities: {
    id: number;
    name: string;
    description: string;
    gymId: number;
    activeStatus: boolean;
  }[];
  operatingHours?: {
    open: string;
    close: string;
  };
  openingTime: string;
  closingTime: string;
  subscriptions: {
    id: number;
    title: string;
    validityDays: number;
    price: string;
    discountedPrice: string;
    gymId: number;
    isMostPopular: boolean;
    isCheapest: boolean;
    activeStatus: boolean;
    features: {
      id: number;
      title: string;
      subscriptionId: number;
      isHighlighted: boolean;
      activeStatus: boolean;
    }[];
  }[];
  ownerId: string;
  capacity: number;
  currentOccupancy: number;
  city: string;
  state: string;
  zipCode: string;
  activeStatus: boolean;
  owner: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  images: any[];
  createTimestamp: string;
  updateTimestamp?: string;
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

class GymService {
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
}

export const gymService = new GymService();

