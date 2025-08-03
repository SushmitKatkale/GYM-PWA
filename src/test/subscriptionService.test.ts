import { describe, it, expect, vi, beforeEach } from 'vitest';
import { subscriptionService } from '../services/subscriptionService';
import type { Subscription } from '../services/subscriptionService';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('subscriptionService', () => {
  const mockToken = 'mock-token';
  const mockSubscription: Subscription = {
    id: 'sub1',
    userId: 'user1',
    type: 'monthly',
    startDate: '2024-01-01',
    endDate: '2024-02-01',
    status: 'active'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getUserSubscriptions', () => {
    it('should fetch user subscriptions successfully', async () => {
      const mockResponse = {
        success: true,
        message: 'Subscriptions fetched successfully',
        data: [mockSubscription]
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await subscriptionService.getUserSubscriptions(mockToken);

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/user-subscriptions',
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
        message: 'Failed to fetch subscriptions',
        error: 'User not found'
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => mockErrorResponse,
      });

      const result = await subscriptionService.getUserSubscriptions(mockToken);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Failed to fetch subscriptions');
    });

    it('should handle network error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await subscriptionService.getUserSubscriptions(mockToken);

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

      const result = await subscriptionService.getUserSubscriptions(mockToken);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Invalid response format from server');
    });

    it('should handle error object with nested message', async () => {
      const mockErrorResponse = {
        error: {
          message: 'Nested error message'
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => mockErrorResponse,
      });

      const result = await subscriptionService.getUserSubscriptions(mockToken);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Nested error message');
    });

    it('should handle error array', async () => {
      const mockErrorResponse = {
        error: ['First error', 'Second error']
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => mockErrorResponse,
      });

      const result = await subscriptionService.getUserSubscriptions(mockToken);

      expect(result.success).toBe(false);
      expect(result.message).toBe('First error, Second error');
    });
  });
});
