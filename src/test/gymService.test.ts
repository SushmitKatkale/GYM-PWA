import { describe, it, expect, vi, beforeEach } from 'vitest';
import { gymService } from '../services/gymService';
import type { Gym } from '../services/gymService';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('gymService', () => {
  const mockToken = 'mock-token';
  const mockGym: Gym = {
    id: '1',
    name: 'Test Gym',
    address: '123 Test St',
    latitude: 40.7128,
    longitude: -74.0060,
    rating: 4.5,
    image: 'https://example.com/gym.jpg',
    description: 'A great gym for testing',
    amenities: ['Cardio', 'Weights'],
    operatingHours: {
      open: '06:00',
      close: '22:00'
    },
    plans: {
      daily: 15,
      weekly: 75,
      monthly: 200,
      yearly: 2000
    },
    ownerId: 'owner1',
    capacity: 100,
    currentOccupancy: 50
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getGyms', () => {
    it('should fetch gyms successfully', async () => {
      const mockResponse = {
        success: true,
        message: 'Gyms fetched successfully',
        data: [mockGym]
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await gymService.getGyms(mockToken);

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/gyms',
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
        message: 'Failed to fetch gyms',
        error: 'Server error'
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => mockErrorResponse,
      });

      const result = await gymService.getGyms(mockToken);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Failed to fetch gyms');
    });

    it('should handle network error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await gymService.getGyms(mockToken);

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

      const result = await gymService.getGyms(mockToken);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Invalid response format from server');
    });
  });
});
