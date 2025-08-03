import { buildApiUrl, API_CONFIG } from '../config/api';

export interface TimeSlot {
  id: string;
  gymId: string;
  date: string;
  startTime: string;
  endTime: string;
  capacity: number;
  booked: number;
  type: 'general' | 'class' | 'personal';
  title?: string;
  instructor?: string;
  price?: number;
}

export interface CreateSlotRequest {
  gymId: string;
  date: string;
  startTime: string;
  endTime: string;
  capacity: number;
  type: 'general' | 'class' | 'personal';
  title?: string;
  instructor?: string;
  price?: number;
}

export interface BookSlotRequest {
  userId: string;
  slotId: string;
}

export interface Booking {
  id: string;
  userId: string;
  gymId: string;
  slotId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'confirmed' | 'cancelled' | 'completed';
  type: 'general' | 'class' | 'personal';
  amount: number;
  createdAt: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

class SlotService {
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

  async getSlots(gymId?: string, date?: string, token?: string): 
    Promise<ApiResponse<TimeSlot[]>> {
    try {
      const params = new URLSearchParams();
      if (gymId) params.append('gymId', gymId);
      if (date) params.append('date', date);
      
      const url = buildApiUrl(`${API_CONFIG.ENDPOINTS.SLOTS}${params.toString() ? `?${params.toString()}` : ''}`);

      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders(token),
      });

      return await this.handleResponse<TimeSlot[]>(response);
    } catch (error) {
      console.error('Get slots network error:', error);
      return {
        success: false,
        message: 'Network error occurred. Please check your connection and try again.',
        error: error instanceof Error ? error.message : 'Unknown network error'
      };
    }
  }

  async createSlot(slotData: CreateSlotRequest, token: string): Promise<ApiResponse<TimeSlot>> {
    try {
      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.SLOTS), {
        method: 'POST',
        headers: this.getAuthHeaders(token),
        body: JSON.stringify(slotData),
      });

      return await this.handleResponse<TimeSlot>(response);
    } catch (error) {
      console.error('Create slot network error:', error);
      return {
        success: false,
        message: 'Network error occurred. Please check your connection and try again.',
        error: error instanceof Error ? error.message : 'Unknown network error'
      };
    }
  }

  async bookSlot(bookingData: BookSlotRequest, token: string): Promise<ApiResponse<Booking>> {
    try {
      const response = await fetch(buildApiUrl(`${API_CONFIG.ENDPOINTS.SLOTS}/book`), {
        method: 'POST',
        headers: this.getAuthHeaders(token),
        body: JSON.stringify(bookingData),
      });

      return await this.handleResponse<Booking>(response);
    } catch (error) {
      console.error('Book slot network error:', error);
      return {
        success: false,
        message: 'Network error occurred. Please check your connection and try again.',
        error: error instanceof Error ? error.message : 'Unknown network error'
      };
    }
  }
}

export const slotService = new SlotService();
