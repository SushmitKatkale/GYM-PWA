import { buildApiUrl, API_CONFIG } from '../config/api';
import { apiClient, ApiResponse } from './apiClient';
import { invoiceService } from './invoiceService';

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

  /**
   * Check payment status by payment ID
   */
  async checkPaymentStatus(paymentId: number): Promise<ApiResponse<any>> {
    return apiClient.get(`/payments/status/${paymentId}`);
  }

  /**
   * Get user's subscription history
   */
  async getUserSubscriptions(userEmail: string): Promise<ApiResponse<any>> {
    return apiClient.get(`/subscriptions/user/${userEmail}`);
  }

  /**
   * Download invoice for a payment
   */
  async downloadInvoice(paymentId: number): Promise<Blob> {
    const response = await fetch(buildApiUrl(`/payments/${paymentId}/invoice`), {
      headers: {
        'Authorization': `Bearer ${this.getToken()}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to download invoice');
    }

    return await response.blob();
  }

  /**
   * Retry a failed payment
   */
  async retryPayment(paymentId: number): Promise<ApiResponse<PaymentInitiationResponse>> {
    return apiClient.post(`/payments/${paymentId}/retry`);
  }

  /**
   * Cancel a pending payment
   */
  async cancelPayment(paymentId: number): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.post(`/payments/${paymentId}/cancel`);
  }

  /**
   * Get subscription analytics for user
   */
  async getSubscriptionAnalytics(userEmail: string): Promise<ApiResponse<any>> {
    return apiClient.get(`/subscriptions/user/${userEmail}/analytics`);
  }

  /**
   * Format currency for display
   */
  formatCurrency(amount: number, currency: string = 'INR'): string {
    if (currency === 'INR') {
      return `₹${amount.toFixed(2)}`;
    }
    return `${currency} ${amount.toFixed(2)}`;
  }

  /**
   * Get payment status color for UI
   */
  getStatusColor(status: string): string {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      case 'cancelled':
        return 'text-gray-600 bg-gray-100';
      case 'pending':
      default:
        return 'text-yellow-600 bg-yellow-100';
    }
  }

  /**
   * Get gateway display name
   */
  getGatewayDisplayName(gateway: string): string {
    switch (gateway) {
      case 'razorpay':
        return 'Razorpay';
      case 'phonepe':
        return 'PhonePe';
      default:
        return gateway.charAt(0).toUpperCase() + gateway.slice(1);
    }
  }

  /**
   * Generate invoice after successful payment
   */
  async generateInvoiceAfterPayment(subscriptionId: number, paymentId: number, userEmail: string): Promise<{ success: boolean; invoiceId?: string; error?: string }> {
    try {
      const invoiceResponse = await invoiceService.generateInvoice({
        subscriptionId,
        paymentId,
        userEmail
      });

      if (invoiceResponse.success && invoiceResponse.data) {
        return { 
          success: true, 
          invoiceId: invoiceResponse.data.id 
        };
      } else {
        return { 
          success: false, 
          error: invoiceResponse.message || 'Failed to generate invoice' 
        };
      }
    } catch (error) {
      console.error('Invoice generation error:', error);
      return { 
        success: false, 
        error: 'Failed to generate invoice' 
      };
    }
  }

  /**
   * Complete payment process with invoice generation
   */
  async completePaymentWithInvoice(
    subscriptionId: number,
    paymentId: number, 
    userEmail: string
  ): Promise<{ success: boolean; invoiceId?: string; error?: string }> {
    try {
      // First verify payment status
      const paymentStatus = await this.verifyPaymentStatus(paymentId);
      
      if (paymentStatus.success && paymentStatus.data?.status === 'completed') {
        // Generate invoice after successful payment
        return await this.generateInvoiceAfterPayment(subscriptionId, paymentId, userEmail);
      } else {
        return {
          success: false,
          error: 'Payment not completed yet'
        };
      }
    } catch (error) {
      console.error('Complete payment with invoice error:', error);
      return {
        success: false,
        error: 'Failed to complete payment process'
      };
    }
  }

  /**
   * Get current user's auth token
   */
  private getToken(): string {
    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('No authentication token found. Please login again.');
    }
    return token;
  }
}

export const paymentService = new PaymentService();
