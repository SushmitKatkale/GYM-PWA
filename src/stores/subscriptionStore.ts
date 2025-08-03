import { create } from 'zustand';
import { subscriptionService, Subscription } from '../services/subscriptionService';
import { useAuthStore } from './authStore';

interface SubscriptionPlan {
  type: 'daily' | 'weekly' | 'monthly' | 'yearly';
  price: number;
}

interface SubscriptionState {
  plans: SubscriptionPlan[];
  subscriptions: Subscription[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchSubscriptions: () => Promise<boolean>;
  subscribe: (planType: SubscriptionPlan['type']) => void;
  clearError: () => void;
}

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  plans: [
    { type: 'daily', price: 10 },
    { type: 'weekly', price: 50 },
    { type: 'monthly', price: 180 },
    { type: 'yearly', price: 2000 },
  ],
  subscriptions: [],
  isLoading: false,
  error: null,

  fetchSubscriptions: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const token = useAuthStore.getState().getAccessToken();
      if (!token) {
        set({ error: 'No authentication token found', isLoading: false });
        return false;
      }

      const response = await subscriptionService.getUserSubscriptions(token);
      
      if (response.success && response.data) {
        set({
          subscriptions: response.data,
          isLoading: false
        });
        return true;
      } else {
        set({
          error: response.message || 'Failed to fetch subscriptions',
          isLoading: false
        });
        return false;
      }
    } catch (error) {
      console.error('Fetch subscriptions error:', error);
      set({
        error: 'Network error occurred. Please check your connection and try again.',
        isLoading: false
      });
      return false;
    }
  },

  subscribe: (planType) => {
    alert(`Subscribed to ${planType} plan!`);
  },

  clearError: () => set({ error: null })
}));

