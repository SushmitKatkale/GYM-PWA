import { API_BASE_URL } from '../config/api';

export interface PaymentStatusResponse {
  success: boolean;
  data: {
    paymentId: number;
    status: 'pending' | 'completed' | 'failed' | 'cancelled';
    gateway: 'phonepe' | 'razorpay';
    amount: number;
    userEmail: string;
    subscription?: {
      id: number;
      title: string;
      validityDays: number;
      price: number;
    };
    gym?: {
      id: number;
      name: string;
      address: string;
    };
    userSubscription?: {
      id: number;
      validFrom: string;
      validTo: string;
      activeStatus: boolean;
    };
    message: string;
    nextAction: 'redirect_to_gym' | 'retry_payment' | 'wait_and_refresh' | 'contact_support';
    createdAt: string;
    completedAt?: string;
  };
  message: string;
}

export const paymentStatusService = {
  /**
   * Get payment status and process it
   */
  async getPaymentStatus(paymentId: string): Promise<PaymentStatusResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/gateway/status/${paymentId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Payment status check failed:', error);
      throw new Error('Failed to check payment status. Please try again.');
    }
  },

  /**
   * Retry payment status check after delay
   */
  async retryPaymentStatus(paymentId: string, retryCount = 3): Promise<PaymentStatusResponse> {
    for (let i = 0; i < retryCount; i++) {
      try {
        const result = await this.getPaymentStatus(paymentId);
        return result;
      } catch (error) {
        if (i === retryCount - 1) throw error;
        // Wait 2 seconds before retry
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    throw new Error('Payment status check failed after multiple retries');
  }
};
