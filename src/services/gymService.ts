import { buildApiUrl, API_CONFIG } from '../config/api';

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

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

class GymService {
  private getAuthHeaders(token?: string): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    try {
      const data = await response.json();

      if (!response.ok) {
        let errorMessage = '';

        if (data.message) {
          errorMessage = data.message;
        } else if (data.error) {
          if (typeof data.error === 'string') {
            errorMessage = data.error;
          } else if (Array.isArray(data.error)) {
            errorMessage = data.error.join(', ');
          } else if (typeof data.error === 'object') {
            errorMessage = data.error.message || JSON.stringify(data.error);
          }
        } else {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }

        return {
          success: false,
          message: errorMessage,
          error: errorMessage
        };
      }

      return data;
    } catch (parseError) {
      return {
        success: false,
        message: response.ok 
          ? 'Invalid response format from server'
          : `HTTP ${response.status}: ${response.statusText}`,
        error: response.statusText
      };
    }
  }

  async getGyms(token: string): Promise<ApiResponse<Gym[]>> {
    try {
      const url = buildApiUrl(API_CONFIG.ENDPOINTS.GYMS);

      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders(token),
      });

      const result = await this.handleResponse<any>(response);
      
      // Handle the nested data structure from the API
      if (result.success && result.data && result.data.gyms) {
        return {
          success: true,
          message: result.message,
          data: result.data.gyms
        };
      }
      
      return result;
    } catch (error) {
      console.error('Get gyms network error:', error);
      return {
        success: false,
        message: 'Network error occurred. Please check your connection and try again.',
        error: error instanceof Error ? error.message : 'Unknown network error'
      };
    }
  }
}

export const gymService = new GymService();

