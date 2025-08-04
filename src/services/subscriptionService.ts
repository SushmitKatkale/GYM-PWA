import { buildApiUrl, API_CONFIG } from '../config/api';
import { apiClient, ApiResponse } from './apiClient';

export interface Subscription {
  id: string;
  userId: string;
  type: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: string;
  endDate: string;
  status: 'active' | 'inactive';
}


class SubscriptionService {
  async getUserSubscriptions(): Promise<ApiResponse<Subscription[]>> {
    return apiClient.get<Subscription[]>(API_CONFIG.ENDPOINTS.USER_SUBSCRIPTIONS);
  }

  async getSubscriptionById(id: string): Promise<ApiResponse<Subscription>> {
    return apiClient.get<Subscription>(`${API_CONFIG.ENDPOINTS.USER_SUBSCRIPTIONS}/${id}`);
  }

  async createSubscription(subscriptionData: Partial<Subscription>): Promise<ApiResponse<Subscription>> {
    return apiClient.post<Subscription>(API_CONFIG.ENDPOINTS.USER_SUBSCRIPTIONS, subscriptionData);
  }

  async updateSubscription(id: string, subscriptionData: Partial<Subscription>): Promise<ApiResponse<Subscription>> {
    return apiClient.put<Subscription>(`${API_CONFIG.ENDPOINTS.USER_SUBSCRIPTIONS}/${id}`, subscriptionData);
  }

  async cancelSubscription(id: string): Promise<ApiResponse> {
    return apiClient.delete(`${API_CONFIG.ENDPOINTS.USER_SUBSCRIPTIONS}/${id}`);
  }
}

export const subscriptionService = new SubscriptionService();

