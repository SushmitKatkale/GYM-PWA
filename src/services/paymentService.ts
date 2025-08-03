import { buildApiUrl, API_CONFIG } from '../config/api';

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

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

class PaymentService {
  private getAuthHeaders(token?: string): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    try {
      const data = await response.json();

      if (!response.ok) {
        let errorMessage = '';

        if (data.message) {
          errorMessage = data.message;
        } else if (data.error) {
          if (typeof data.error === 'string') {
            errorMessage = data.error;
          } else if (Array.isArray(data.error)) {
            errorMessage = data.error.join(', ');
          } else if (typeof data.error === 'object') {
            errorMessage = data.error.message || JSON.stringify(data.error);
          }
        } else {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }

        return {
          success: false,
          message: errorMessage,
          error: errorMessage
        };
      }

      return data;
    } catch (parseError) {
      return {
        success: false,
        message: response.ok 
          ? 'Invalid response format from server'
          : `HTTP ${response.status}: ${response.statusText}`,
        error: response.statusText
      };
    }
  }

  async createPayment(paymentData: CreatePaymentRequest, token: string): Promise<ApiResponse<Payment>> {
    try {
      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.PAYMENTS), {
        method: 'POST',
        headers: this.getAuthHeaders(token),
        body: JSON.stringify(paymentData),
      });

      return await this.handleResponse<Payment>(response);
    } catch (error) {
      console.error('Create payment network error:', error);
      return {
        success: false,
        message: 'Network error occurred. Please check your connection and try again.',
        error: error instanceof Error ? error.message : 'Unknown network error'
      };
    }
  }

  async getPayments(token: string): Promise<ApiResponse<Payment[]>> {
    try {
      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.PAYMENTS), {
        method: 'GET',
        headers: this.getAuthHeaders(token),
      });

      return await this.handleResponse<Payment[]>(response);
    } catch (error) {
      console.error('Get payments network error:', error);
      return {
        success: false,
        message: 'Network error occurred. Please check your connection and try again.',
        error: error instanceof Error ? error.message : 'Unknown network error'
      };
    }
  }
}

export const paymentService = new PaymentService();
