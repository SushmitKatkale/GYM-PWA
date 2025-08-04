import { buildApiUrl, API_CONFIG } from '../config/api';
import { apiClient, ApiResponse } from './apiClient';

export interface Payment {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  method: 'card' | 'bank' | 'cash';
  createdAt: string;
  updatedAt?: string;
}

export interface CreatePaymentRequest {
  userId: string;
  amount: number;
  currency: string;
  method: 'card' | 'bank' | 'cash';
  description?: string;
}


class PaymentService {
  async createPayment(paymentData: CreatePaymentRequest): Promise<ApiResponse<Payment>> {
    return apiClient.post<Payment>(API_CONFIG.ENDPOINTS.PAYMENTS, paymentData);
  }

  async getPayments(): Promise<ApiResponse<Payment[]>> {
    return apiClient.get<Payment[]>(API_CONFIG.ENDPOINTS.PAYMENTS);
  }

  async getPaymentById(id: string): Promise<ApiResponse<Payment>> {
    return apiClient.get<Payment>(`${API_CONFIG.ENDPOINTS.PAYMENTS}/${id}`);
  }

  async updatePayment(id: string, paymentData: Partial<Payment>): Promise<ApiResponse<Payment>> {
    return apiClient.put<Payment>(`${API_CONFIG.ENDPOINTS.PAYMENTS}/${id}`, paymentData);
  }

  async deletePayment(id: string): Promise<ApiResponse> {
    return apiClient.delete(`${API_CONFIG.ENDPOINTS.PAYMENTS}/${id}`);
  }
}

export const paymentService = new PaymentService();
