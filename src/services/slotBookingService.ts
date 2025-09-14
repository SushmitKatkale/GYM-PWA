import { buildApiUrl, API_CONFIG } from '../config/api';
import { apiClient, ApiResponse } from './apiClient';

export interface GymSlot {
  id: string;
  gymId: string;
  slotDate: string;
  startTime: string;
  endTime: string;
  capacity: number;
  recordStatus: number;
  createdAt: string;
  gym?: {
    id: string;
    name: string;
    address: string;
  };
}

export interface SlotBooking {
  id: string;
  userId: string;
  slotId: string;
  bookingStatus: number; // 1=booked, 0=cancelled
  bookingDate: string;
  recordStatus: number;
  createdAt: string;
  checkinTime?: string;
  checkoutTime?: string;
  cancellationReason?: string;
  cancellationTime?: string;
  gymSlot?: GymSlot;
}

export interface WaitlistEntry {
  id: string;
  slotId: string;
  userId: string;
  waitlistPosition: number;
  status: 'waiting' | 'cleared';
  recordStatus: number;
  createdAt: string;
  gymSlot?: GymSlot;
}

export interface SlotAvailability {
  gymSlotId: string;
  availabilityDate: string;
  availableCapacity: number;
  bookedCount: number;
  gymSlot: GymSlot;
}

export interface BookSlotRequest {
  gymSlotId: string;
  bookingDate: string;
  bookingType?: 'regular' | 'one_time_change' | 'temporary';
}

export interface GetSlotsParams {
  gymId?: string;
  dayOfWeek?: number;
  status?: 'active' | 'inactive';
  page?: number;
  limit?: number;
}

export interface GetBookingsParams {
  status?: 'active' | 'cancelled' | 'completed' | 'no_show' | 'checked_in';
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

class SlotBookingService {
  // Get available gym slots
  async getGymSlots(params: GetSlotsParams = {}): Promise<ApiResponse<{
    data: GymSlot[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  }>> {
    const searchParams = new URLSearchParams();
    if (params.gymId) searchParams.append('gymId', params.gymId);
    if (params.dayOfWeek !== undefined) searchParams.append('dayOfWeek', params.dayOfWeek.toString());
    if (params.status) searchParams.append('status', params.status);
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());

    const endpoint = `${API_CONFIG.ENDPOINTS.SLOTS}?${searchParams.toString()}`;
    return apiClient.get(endpoint);
  }

  // Book a gym slot
  async bookSlot(bookingData: BookSlotRequest): Promise<ApiResponse<SlotBooking>> {
    return apiClient.post(`${API_CONFIG.ENDPOINTS.SLOTS}/book`, bookingData);
  }

  // Get user's bookings
  async getUserBookings(params: GetBookingsParams = {}): Promise<ApiResponse<{
    data: SlotBooking[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  }>> {
    const searchParams = new URLSearchParams();
    if (params.status) searchParams.append('status', params.status);
    if (params.startDate) searchParams.append('startDate', params.startDate);
    if (params.endDate) searchParams.append('endDate', params.endDate);
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());

    const endpoint = `${API_CONFIG.ENDPOINTS.SLOTS}/bookings?${searchParams.toString()}`;
    return apiClient.get(endpoint);
  }

  // Cancel a booking
  async cancelBooking(bookingId: string, cancellationReason?: string): Promise<ApiResponse> {
    return apiClient.put(`${API_CONFIG.ENDPOINTS.SLOTS}/bookings/${bookingId}/cancel`, {
      cancellationReason
    });
  }

  // Check in to a slot
  async checkInSlot(bookingId: string): Promise<ApiResponse<{ checkinTime: string }>> {
    return apiClient.put(`${API_CONFIG.ENDPOINTS.SLOTS}/bookings/${bookingId}/checkin`);
  }

  // Check out from a slot
  async checkOutSlot(bookingId: string): Promise<ApiResponse<{ checkoutTime: string }>> {
    return apiClient.put(`${API_CONFIG.ENDPOINTS.SLOTS}/bookings/${bookingId}/checkout`);
  }

  // Get slot availability
  async getSlotAvailability(gymSlotId: string, date: string): Promise<ApiResponse<SlotAvailability>> {
    const searchParams = new URLSearchParams();
    searchParams.append('gymSlotId', gymSlotId);
    searchParams.append('date', date);

    const endpoint = `${API_CONFIG.ENDPOINTS.SLOTS}/availability?${searchParams.toString()}`;
    return apiClient.get(endpoint);
  }

  // Get slots for a specific date and gym
  async getSlotsByDateAndGym(gymId: string, date: string): Promise<ApiResponse<GymSlot[]>> {
    const params = new URLSearchParams();
    params.append('gymId', gymId);
    params.append('date', date);

    return apiClient.get(`${API_CONFIG.ENDPOINTS.SLOTS}?${params.toString()}`);
  }

  // Get waitlist status for user
  async getUserWaitlistStatus(): Promise<ApiResponse<WaitlistEntry[]>> {
    return apiClient.get(`${API_CONFIG.ENDPOINTS.SLOTS}/waitlist`);
  }

  // Helper method to format time slots
  formatTimeSlot(startTime: string, endTime: string): string {
    const formatTime = (time: string) => {
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    };

    return `${formatTime(startTime)} - ${formatTime(endTime)}`;
  }

  // Helper method to check if slot is available
  isSlotAvailable(slot: GymSlot, bookedCount: number): boolean {
    return bookedCount < slot.capacity;
  }

  // Helper method to get available spots
  getAvailableSpots(slot: GymSlot, bookedCount: number): number {
    return Math.max(0, slot.capacity - bookedCount);
  }
}

export const slotBookingService = new SlotBookingService();
