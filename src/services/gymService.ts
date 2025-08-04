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


class GymService {
  async getGyms(): Promise<ApiResponse<Gym[]>> {
    const result = await apiClient.get<any>(API_CONFIG.ENDPOINTS.GYMS);
    
    // Handle the nested data structure from the API
    if (result.success && result.data && result.data.gyms) {
      return {
        success: true,
        message: result.message,
        data: result.data.gyms
      };
    }
    
    return result;
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

