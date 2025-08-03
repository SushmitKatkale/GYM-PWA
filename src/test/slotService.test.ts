import { describe, it, expect, vi, beforeEach } from 'vitest';
import { slotService } from '../services/slotService';
import type { TimeSlot, CreateSlotRequest, BookSlotRequest, Booking } from '../services/slotService';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('slotService', () => {
  const mockToken = 'mock-token';
  const mockTimeSlot: TimeSlot = {
    id: 'slot1',
    gymId: 'gym1',
    date: '2024-01-01',
    startTime: '09:00',
    endTime: '10:00',
    capacity: 20,
    booked: 5,
    type: 'general',
    title: 'Morning Session',
    instructor: 'John Trainer',
    price: 25
  };

  const mockBooking: Booking = {
    id: 'booking1',
    userId: 'user1',
    gymId: 'gym1',
    slotId: 'slot1',
    date: '2024-01-01',
    startTime: '09:00',
    endTime: '10:00',
    status: 'confirmed',
    type: 'general',
    amount: 25,
    createdAt: '2024-01-01T00:00:00Z'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getSlots', () => {
    it('should fetch slots without filters', async () => {
      const mockResponse = {
        success: true,
        message: 'Slots fetched successfully',
        data: [mockTimeSlot]
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await slotService.getSlots();

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/slots',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    });

    it('should fetch slots with gym filter', async () => {
      const mockResponse = {
        success: true,
        message: 'Slots fetched successfully',
        data: [mockTimeSlot]
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await slotService.getSlots('gym1', undefined, mockToken);

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/slots?gymId=gym1',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${mockToken}`,
          },
        }
      );
    });

    it('should fetch slots with date filter', async () => {
      const mockResponse = {
        success: true,
        message: 'Slots fetched successfully',
        data: [mockTimeSlot]
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await slotService.getSlots(undefined, '2024-01-01', mockToken);

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/slots?date=2024-01-01',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${mockToken}`,
          },
        }
      );
    });

    it('should fetch slots with both filters', async () => {
      const mockResponse = {
        success: true,
        message: 'Slots fetched successfully',
        data: [mockTimeSlot]
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await slotService.getSlots('gym1', '2024-01-01', mockToken);

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/slots?gymId=gym1&date=2024-01-01',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${mockToken}`,
          },
        }
      );
    });

    it('should handle API error response', async () => {
      const mockErrorResponse = {
        success: false,
        message: 'Failed to fetch slots',
        error: 'Server error'
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => mockErrorResponse,
      });

      const result = await slotService.getSlots('gym1', '2024-01-01', mockToken);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Failed to fetch slots');
    });
  });

  describe('createSlot', () => {
    it('should create slot successfully', async () => {
      const createSlotData: CreateSlotRequest = {
        gymId: 'gym1',
        date: '2024-01-01',
        startTime: '11:00',
        endTime: '12:00',
        capacity: 15,
        type: 'class',
        title: 'Yoga Class',
        instructor: 'Jane Doe',
        price: 30
      };

      const mockResponse = {
        success: true,
        message: 'Slot created successfully',
        data: { ...mockTimeSlot, ...createSlotData, id: 'slot2' }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await slotService.createSlot(createSlotData, mockToken);

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/slots',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${mockToken}`,
          },
          body: JSON.stringify(createSlotData),
        }
      );
    });

    it('should handle creation failure', async () => {
      const createSlotData: CreateSlotRequest = {
        gymId: 'gym1',
        date: '2024-01-01',
        startTime: '11:00',
        endTime: '12:00',
        capacity: 15,
        type: 'class'
      };

      const mockResponse = {
        success: false,
        message: 'Failed to create slot',
        error: 'Validation error'
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => mockResponse,
      });

      const result = await slotService.createSlot(createSlotData, mockToken);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Failed to create slot');
    });
  });

  describe('bookSlot', () => {
    it('should book slot successfully', async () => {
      const bookSlotData: BookSlotRequest = {
        userId: 'user1',
        slotId: 'slot1'
      };

      const mockResponse = {
        success: true,
        message: 'Slot booked successfully',
        data: mockBooking
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await slotService.bookSlot(bookSlotData, mockToken);

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/slots/book',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${mockToken}`,
          },
          body: JSON.stringify(bookSlotData),
        }
      );
    });

    it('should handle booking failure', async () => {
      const bookSlotData: BookSlotRequest = {
        userId: 'user1',
        slotId: 'slot1'
      };

      const mockResponse = {
        success: false,
        message: 'Slot is fully booked',
        error: 'No capacity available'
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 409,
        statusText: 'Conflict',
        json: async () => mockResponse,
      });

      const result = await slotService.bookSlot(bookSlotData, mockToken);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Slot is fully booked');
    });
  });

  describe('error handling', () => {
    it('should handle network error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await slotService.getSlots();

      expect(result.success).toBe(false);
      expect(result.message).toBe('Network error occurred. Please check your connection and try again.');
    });

    it('should handle JSON parse error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      });

      const result = await slotService.getSlots();

      expect(result.success).toBe(false);
      expect(result.message).toBe('Invalid response format from server');
    });
  });
});
