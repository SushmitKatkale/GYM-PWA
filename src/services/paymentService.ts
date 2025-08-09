import { buildApiUrl, API_CONFIG } from '../config/api';
import { apiClient, ApiResponse } from './apiClient';

export interface Payment {
  id: string;
  userEmail: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  method: 'card' | 'bank' | 'cash';
  gateway?: 'razorpay' | 'phonepe';
  createdAt: string;
  updatedAt?: string;
}

export interface CreatePaymentRequest {
  userEmail: string;
  amount: number;
  currency: string;
  method: 'card' | 'bank' | 'cash';
  description?: string;
}

export interface PaymentInitiationRequest {
  gymId: number;
  subscriptionId: number;
  amount: number;
}

export interface PaymentInitiationResponse {
  success: boolean;
  gateway: 'razorpay' | 'phonepe';
  orderId: string;
  amount: number;
  currency?: string;
  key?: string; // For Razorpay
  paymentUrl?: string; // For PhonePe
  paymentId: number;
  splits?: any;
}

export interface PaymentConfig {
  gymId: number;
  gateway: 'razorpay' | 'phonepe';
  hasVendorConfig: boolean;
  isRazorpayActive: boolean;
}

// Razorpay integration
declare global {
  interface Window {
    Razorpay: any;
  }
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

  /**
   * Initiate payment with automatic gateway selection
   */
  async initiatePayment(paymentData: PaymentInitiationRequest): Promise<ApiResponse<PaymentInitiationResponse>> {
    return apiClient.post<PaymentInitiationResponse>(`${API_CONFIG.ENDPOINTS.PAYMENTS}/initiate`, paymentData);
  }

  /**
   * Get payment configuration for a gym
   */
  async getPaymentConfig(gymId: number): Promise<ApiResponse<PaymentConfig>> {
    return apiClient.get<PaymentConfig>(`${API_CONFIG.ENDPOINTS.PAYMENTS}/config/${gymId}`);
  }

  /**
   * Verify payment status
   */
  async verifyPaymentStatus(paymentId: number): Promise<ApiResponse<Payment>> {
    return apiClient.get<Payment>(`${API_CONFIG.ENDPOINTS.PAYMENTS}/${paymentId}/status`);
  }

  /**
   * Get user payment history
   */
  async getUserPayments(userEmail: string, page: number = 1, limit: number = 10): Promise<ApiResponse<{payments: Payment[], pagination: any}>> {
    return apiClient.get<{payments: Payment[], pagination: any}>(`${API_CONFIG.ENDPOINTS.PAYMENTS}/user/${userEmail}?page=${page}&limit=${limit}`);
  }

  /**
   * Process Razorpay payment
   */
  async processRazorpayPayment(
    paymentData: PaymentInitiationResponse,
    user: { firstName: string; lastName: string; email: string; phoneNumber: string }
  ): Promise<{ success: boolean; paymentId?: string; error?: string }> {
    return new Promise((resolve) => {
      if (!window.Razorpay) {
        resolve({ success: false, error: 'Razorpay SDK not loaded' });
        return;
      }

      const options = {
        key: paymentData.key,
        amount: paymentData.amount * 100, // Amount in paise
        currency: paymentData.currency || 'INR',
        name: 'Gym Subscription',
        description: 'Gym membership subscription payment',
        order_id: paymentData.orderId,
        prefill: {
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          contact: user.phoneNumber
        },
        theme: {
          color: '#16a34a' // Green color matching your app theme
        },
        handler: async (response: any) => {
          try {
            // Send payment details to backend for verification
            const verificationResponse = await apiClient.post(
              `${API_CONFIG.ENDPOINTS.PAYMENTS}/callback/razorpay`,
              {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature
              }
            );

            if (verificationResponse.success) {
              resolve({ success: true, paymentId: response.razorpay_payment_id });
            } else {
              resolve({ success: false, error: 'Payment verification failed' });
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            resolve({ success: false, error: 'Payment verification failed' });
          }
        },
        modal: {
          ondismiss: () => {
            resolve({ success: false, error: 'Payment cancelled by user' });
          }
        }
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();
    });
  }

  /**
   * Process PhonePe payment
   */
  async processPhonepePayment(paymentData: PaymentInitiationResponse): Promise<{ success: boolean; error?: string }> {
    try {
      if (paymentData.paymentUrl) {
        // Redirect to PhonePe payment URL
        window.location.href = paymentData.paymentUrl;
        return { success: true };
      } else {
        return { success: false, error: 'No payment URL received from PhonePe' };
      }
    } catch (error) {
      console.error('PhonePe payment error:', error);
      return { success: false, error: 'Failed to initiate PhonePe payment' };
    }
  }

  /**
   * Load Razorpay SDK dynamically
   */
  async loadRazorpaySDK(): Promise<boolean> {
    if (window.Razorpay) {
      return true;
    }

    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.head.appendChild(script);
    });
  }

  /**
   * Main payment processing method
   */
  async processPayment(
    paymentData: PaymentInitiationResponse,
    user: { firstName: string; lastName: string; email: string; phoneNumber: string }
  ): Promise<{ success: boolean; paymentId?: string; error?: string }> {
    try {
      if (paymentData.gateway === 'razorpay') {
        // Load Razorpay SDK if not already loaded
        const sdkLoaded = await this.loadRazorpaySDK();
        if (!sdkLoaded) {
          return { success: false, error: 'Failed to load Razorpay SDK' };
        }
        return await this.processRazorpayPayment(paymentData, user);
      } else if (paymentData.gateway === 'phonepe') {
        return await this.processPhonepePayment(paymentData);
      } else {
        return { success: false, error: 'Unsupported payment gateway' };
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      return { success: false, error: 'Payment processing failed' };
    }
  }
}

export const paymentService = new PaymentService();
