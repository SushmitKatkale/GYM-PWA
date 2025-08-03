import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useSubscriptionStore } from '../stores/subscriptionStore';
import { subscriptionService } from '../services/subscriptionService';
import { useAuthStore } from '../stores/authStore';

// Mock the services
vi.mock('../services/subscriptionService');
vi.mock('../stores/authStore');

const mockSubscriptionService = subscriptionService as jest.Mocked<typeof subscriptionService>;
const mockUseAuthStore = useAuthStore as unknown as {
  getState: () => { getAccessToken: () => string | null };
};

describe('subscriptionStore', () => {
  const mockToken = 'mock-token';
  const mockSubscription = {
    id: 'sub1',
    userId: 'user1',
    type: 'monthly' as const,
    startDate: '2024-01-01',
    endDate: '2024-02-01',
    status: 'active' as const
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock auth store to return a token
    mockUseAuthStore.getState = vi.fn().mockReturnValue({
      getAccessToken: () => mockToken
    });

    // Reset store state
    useSubscriptionStore.setState({
      subscriptions: [],
      isLoading: false,
      error: null
    });
  });

  describe('fetchSubscriptions', () => {
    it('should fetch subscriptions successfully', async () => {
      const mockResponse = {
        success: true,
        message: 'Subscriptions fetched successfully',
        data: [mockSubscription]
      };

      mockSubscriptionService.getUserSubscriptions.mockResolvedValue(mockResponse);

      const { fetchSubscriptions } = useSubscriptionStore.getState();
      const result = await fetchSubscriptions();

      expect(result).toBe(true);
      expect(mockSubscriptionService.getUserSubscriptions).toHaveBeenCalledWith(mockToken);

      const state = useSubscriptionStore.getState();
      expect(state.subscriptions).toEqual([mockSubscription]);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(null);
    });

    it('should handle fetch failure', async () => {
      const mockResponse = {
        success: false,
        message: 'Failed to fetch subscriptions',
        error: 'Server error'
      };

      mockSubscriptionService.getUserSubscriptions.mockResolvedValue(mockResponse);

      const { fetchSubscriptions } = useSubscriptionStore.getState();
      const result = await fetchSubscriptions();

      expect(result).toBe(false);

      const state = useSubscriptionStore.getState();
      expect(state.error).toBe('Failed to fetch subscriptions');
      expect(state.isLoading).toBe(false);
      expect(state.subscriptions).toEqual([]);
    });

    it('should handle missing token', async () => {
      mockUseAuthStore.getState = vi.fn().mockReturnValue({
        getAccessToken: () => null
      });

      const { fetchSubscriptions } = useSubscriptionStore.getState();
      const result = await fetchSubscriptions();

      expect(result).toBe(false);

      const state = useSubscriptionStore.getState();
      expect(state.error).toBe('No authentication token found');
      expect(state.isLoading).toBe(false);
    });

    it('should handle network error', async () => {
      mockSubscriptionService.getUserSubscriptions.mockRejectedValue(new Error('Network error'));

      const { fetchSubscriptions } = useSubscriptionStore.getState();
      const result = await fetchSubscriptions();

      expect(result).toBe(false);

      const state = useSubscriptionStore.getState();
      expect(state.error).toBe('Network error occurred. Please check your connection and try again.');
      expect(state.isLoading).toBe(false);
    });

    it('should set loading state during fetch', async () => {
      // Mock a delayed response
      mockSubscriptionService.getUserSubscriptions.mockImplementation(() => 
        new Promise(resolve => {
          setTimeout(() => resolve({
            success: true,
            message: 'Success',
            data: [mockSubscription]
          }), 100);
        })
      );

      const { fetchSubscriptions } = useSubscriptionStore.getState();
      const promise = fetchSubscriptions();

      // Check loading state is set immediately
      const loadingState = useSubscriptionStore.getState();
      expect(loadingState.isLoading).toBe(true);

      await promise;

      // Check loading state is cleared after completion
      const finalState = useSubscriptionStore.getState();
      expect(finalState.isLoading).toBe(false);
    });
  });

  describe('plans', () => {
    it('should have default plans available', () => {
      const state = useSubscriptionStore.getState();
      
      expect(state.plans).toEqual([
        { type: 'daily', price: 10 },
        { type: 'weekly', price: 50 },
        { type: 'monthly', price: 180 },
        { type: 'yearly', price: 2000 },
      ]);
    });
  });

  describe('subscribe', () => {
    it('should show alert when subscribing', () => {
      // Mock alert
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

      const { subscribe } = useSubscriptionStore.getState();
      subscribe('monthly');

      expect(alertSpy).toHaveBeenCalledWith('Subscribed to monthly plan!');

      alertSpy.mockRestore();
    });
  });

  describe('clearError', () => {
    it('should clear error state', () => {
      useSubscriptionStore.setState({ error: 'Some error' });

      const { clearError } = useSubscriptionStore.getState();
      clearError();

      const state = useSubscriptionStore.getState();
      expect(state.error).toBe(null);
    });
  });

  describe('error handling edge cases', () => {
    it('should handle undefined response data', async () => {
      const mockResponse = {
        success: true,
        message: 'Success but no data',
        data: undefined
      };

      mockSubscriptionService.getUserSubscriptions.mockResolvedValue(mockResponse);

      const { fetchSubscriptions } = useSubscriptionStore.getState();
      const result = await fetchSubscriptions();

      expect(result).toBe(false);

      const state = useSubscriptionStore.getState();
      expect(state.error).toBe('Success but no data');
    });

    it('should handle empty response message', async () => {
      const mockResponse = {
        success: false,
        message: '',
        error: 'Detailed error'
      };

      mockSubscriptionService.getUserSubscriptions.mockResolvedValue(mockResponse);

      const { fetchSubscriptions } = useSubscriptionStore.getState();
      const result = await fetchSubscriptions();

      expect(result).toBe(false);

      const state = useSubscriptionStore.getState();
      expect(state.error).toBe('Failed to fetch subscriptions');
    });
  });
});
