import { create } from 'zustand';

interface SubscriptionPlan {
  type: 'daily' | 'weekly' | 'monthly' | 'yearly';
  price: number;
}

interface SubscriptionState {
  plans: SubscriptionPlan[];
  subscribe: (planType: SubscriptionPlan['type']) => void;
}

export const useSubscriptionStore = create<SubscriptionState>((set) => ({
  plans: [
    { type: 'daily', price: 10 },
    { type: 'weekly', price: 50 },
    { type: 'monthly', price: 180 },
    { type: 'yearly', price: 2000 },
  ],
  subscribe: (planType) => {
    alert(`Subscribed to ${planType} plan!`);
  },
}));

