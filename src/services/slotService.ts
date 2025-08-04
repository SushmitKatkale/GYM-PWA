import { buildApiUrl, API_CONFIG } from '../config/api';
import { apiClient, ApiResponse } from './apiClient';

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


class SlotService {
  async getSlots(gymId?: string, date?: string): Promise<ApiResponse<TimeSlot[]>> {
    const params = new URLSearchParams();
    if (gymId) params.append('gymId', gymId);
    if (date) params.append('date', date);
    
    const endpoint = `${API_CONFIG.ENDPOINTS.SLOTS}${params.toString() ? `?${params.toString()}` : ''}`;
    return apiClient.get<TimeSlot[]>(endpoint);
  }

  async createSlot(slotData: CreateSlotRequest): Promise<ApiResponse<TimeSlot>> {
    return apiClient.post<TimeSlot>(API_CONFIG.ENDPOINTS.SLOTS, slotData);
  }

  async bookSlot(bookingData: BookSlotRequest): Promise<ApiResponse<Booking>> {
    return apiClient.post<Booking>(`${API_CONFIG.ENDPOINTS.SLOTS}/book`, bookingData);
  }

  async getSlotById(id: string): Promise<ApiResponse<TimeSlot>> {
    return apiClient.get<TimeSlot>(`${API_CONFIG.ENDPOINTS.SLOTS}/${id}`);
  }

  async updateSlot(id: string, slotData: Partial<TimeSlot>): Promise<ApiResponse<TimeSlot>> {
    return apiClient.put<TimeSlot>(`${API_CONFIG.ENDPOINTS.SLOTS}/${id}`, slotData);
  }

  async deleteSlot(id: string): Promise<ApiResponse> {
    return apiClient.delete(`${API_CONFIG.ENDPOINTS.SLOTS}/${id}`);
  }

  async getBookings(userId?: string): Promise<ApiResponse<Booking[]>> {
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId);
    
    const endpoint = `/bookings${params.toString() ? `?${params.toString()}` : ''}`;
    return apiClient.get<Booking[]>(endpoint);
  }
}

export const slotService = new SlotService();
