import { apiClient, ApiResponse } from './apiClient';

export interface VendorPaymentConfig {
  id: number;
  ownerEmail: string;
  gymId: number;
  razorpayVendorId?: string;
  cutValue: number;
  cutType: 'percentage' | 'flat';
  isRazorpayActive: boolean;
  onboardingStatus: 'pending' | 'in_progress' | 'pending_verification' | 'completed' | 'rejected';
  onboardingDate?: string;
  bankAccountVerified: boolean;
  kycStatus: 'pending' | 'submitted' | 'verified' | 'rejected';
  activeStatus: boolean;
  createTimestamp: string;
  createdBy?: string;
  updateTimestamp: string;
  updatedBy?: string;
  razorpayBankAccountId?: string;
  razorpayStakeholderId?: string;
  gym?: {
    id: number;
    name: string;
    address: string;
    city: string;
  };
}

export interface CreateVendorConfigRequest {
  ownerEmail: string;
  gymId: number;
  cutValue: number;
  cutType: 'percentage' | 'flat';
}

export interface UpdateVendorConfigRequest {
  razorpayVendorId?: string;
  cutValue?: number;
  cutType?: 'percentage' | 'flat';
  isRazorpayActive?: boolean;
  onboardingStatus?: 'pending' | 'in_progress' | 'pending_verification' | 'completed' | 'rejected';
  onboardingDate?: string;
  bankAccountVerified?: boolean;
  kycStatus?: 'pending' | 'submitted' | 'verified' | 'rejected';
  activeStatus?: boolean;
  razorpayBankAccountId?: string;
  razorpayStakeholderId?: string;
  updatedBy?: string;
}

export interface BankDetails {
  accountNumber: string;
  ifsc: string;
  accountHolderName: string;
  pan: string;
  gst?: string;
}

export interface OnboardVendorRequest {
  bankDetails: BankDetails;
}

export interface CreateOrderRequest {
  subscriptionId: number;
  totalAmount: number;
}

export interface VendorAccountStatus {
  status: string;
  kycStatus: string;
  bankAccountVerified: boolean;
}

export interface PaginatedVendorConfigs {
  configs: VendorPaymentConfig[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface Payment {
  id: number;
  userEmail: string;
  subscriptionId: number;
  paymentAmount: number;
  status: 'pending' | 'completed' | 'failed';
  gateway: 'razorpay' | 'phonepe';
  transactionId?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  // Refund tracking fields
  refunded?: boolean;
  totalRefunded?: number;
  refundableAmount?: number;
  subscription?: {
    id: number;
    title: string;
    price: number;
    validityDays: number;
    gym?: {
      id: number;
      name: string;
      address: string;
      city: string;
    };
  };
}

export interface PaymentStats {
  totalPayments: number;
  totalRevenue: number;
  completedPayments: number;
  pendingPayments: number;
  failedPayments: number;
  razorpayPayments: number;
  phonePePayments: number;
  todayPayments: number;
  todayRevenue: number;
}

export interface PaginatedPayments {
  payments: Payment[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface UserSubscription {
  id: number;
  userEmail: string;
  subscriptionId: number;
  paymentId?: number;
  validFrom: string;
  validTo: string;
  activeStatus: boolean;
  createdAt: string;
  updatedAt: string;
  // Added backend-calculated fields
  status: 'active' | 'expired' | 'cancelled';
  endDate: string;
  startDate: string;
  price: number;
  paidAmount?: number;
  paymentStatus?: string;
  paymentGateway?: string;
  transactionId?: string;
  // User information
  user?: {
    id: number;
    name: string;
    firstName?: string;
    lastName?: string;
    email: string;
    phoneNumber?: string;
  };
  // Subscription plan information
  subscription?: {
    id: number;
    title: string;
    price: number;
    validityDays: number;
    description?: string;
    gym?: {
      id: number;
      name: string;
      address: string;
      city: string;
      phoneNumber?: string;
      email?: string;
    };
  };
  // Gym information (can be separate from subscription.gym)
  gym?: {
    id: number;
    name: string;
    address: string;
    city: string;
    phoneNumber?: string;
    email?: string;
  };
  // Payment information
  payment?: {
    id: number;
    paymentAmount: number;
    status: string;
    gateway: string;
    completedAt?: string;
    transactionId?: string;
    createdAt?: string;
  };
  // Additional computed fields for display
  title?: string;
  validityDays?: number;
}

export interface UserSubscriptionStats {
  totalSubscriptions: number;
  activeSubscriptions: number;
  expiredSubscriptions: number;
  expiringSubscriptions: number;
  todaySubscriptions: number;
}

export interface Refund {
  id: number;
  paymentId: number;
  userEmail: string;
  subscriptionId?: number;
  originalAmount: number;
  refundAmount: number;
  refundReason?: string;
  refundType: 'full' | 'partial';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  gatewayRefundId?: string;
  gatewayResponse?: any;
  processedBy?: string;
  processedAt?: string;
  createdAt: string;
  updatedAt: string;
  // Related data
  payment?: {
    id: number;
    paymentAmount: number;
    status: string;
    gateway: string;
    transactionId?: string;
    userEmail: string;
  };
  subscription?: {
    id: number;
    title: string;
    validityDays: number;
    gym?: {
      id: number;
      name: string;
      city: string;
    };
  };
  user?: {
    name: string;
    email: string;
    phoneNumber?: string;
  };
}

export interface CreateRefundRequest {
  paymentId: number;
  subscriptionId?: number;
  refundAmount: number;
  refundReason: string;
  refundType: 'full' | 'partial';
}

export interface RefundStats {
  totalRefunds: number;
  totalRefundAmount: number;
  pendingRefunds: number;
  completedRefunds: number;
  failedRefunds: number;
  todayRefunds: number;
  todayRefundAmount: number;
}

export interface PaginatedRefunds {
  refunds: Refund[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface PaginatedUserSubscriptions {
  subscriptions: UserSubscription[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

class AdminPaymentService {
  private baseEndpoint = '/admin';

  // Vendor Configuration Management
  async createVendorConfig(data: CreateVendorConfigRequest): Promise<ApiResponse<VendorPaymentConfig>> {
    return apiClient.post(`${this.baseEndpoint}/vendor-configs`, data);
  }

  async getVendorConfigs(
    page = 1,
    limit = 10,
    filters?: {
      status?: string;
      razorpayActive?: boolean;
      kycStatus?: string;
      razorpayVendorId?: string;
      ownerEmail?: string;
      gymName?: string;
      activeStatus?: boolean;
    }
  ): Promise<ApiResponse<PaginatedVendorConfigs>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (filters) {
      if (filters.status) params.append('status', filters.status);
      if (filters.razorpayActive !== undefined) params.append('razorpayActive', filters.razorpayActive.toString());
      if (filters.kycStatus) params.append('kycStatus', filters.kycStatus);
      if (filters.razorpayVendorId) params.append('razorpayVendorId', filters.razorpayVendorId);
      if (filters.ownerEmail) params.append('ownerEmail', filters.ownerEmail);
      if (filters.gymName) params.append('gymName', filters.gymName);
      if (filters.activeStatus !== undefined) params.append('activeStatus', filters.activeStatus.toString());
    }

    return apiClient.get(`${this.baseEndpoint}/vendor-configs?${params.toString()}`);
  }

  async getVendorConfig(id: number): Promise<ApiResponse<VendorPaymentConfig>> {
    return apiClient.get(`${this.baseEndpoint}/vendor-configs/${id}`);
  }

  async updateVendorConfig(
    id: number,
    data: UpdateVendorConfigRequest
  ): Promise<ApiResponse<VendorPaymentConfig>> {
    // Use the new comprehensive update endpoint
    return apiClient.put(`${this.baseEndpoint}/vendor-configs/${id}/complete`, data);
  }

  async onboardVendor(
    id: number,
    data: OnboardVendorRequest
  ): Promise<ApiResponse<{ success: boolean; accountId: string; message: string }>> {
    return apiClient.post(`${this.baseEndpoint}/vendor-configs/${id}/onboard`, data);
  }

  async getVendorStatus(id: number): Promise<ApiResponse<VendorAccountStatus>> {
    return apiClient.get(`${this.baseEndpoint}/vendor-configs/${id}/status`);
  }

  // Payment Management
  async createOrder(data: CreateOrderRequest): Promise<ApiResponse<any>> {
    return apiClient.post(`${this.baseEndpoint}/create-order`, data);
  }

  // Search/Suggestion APIs for autocomplete
  async searchOwners(query: string): Promise<ApiResponse<{ id: string; email: string; name: string }[]>> {
    return apiClient.get(`${this.baseEndpoint}/search/owners?q=${encodeURIComponent(query)}`);
  }

  async searchGyms(query: string): Promise<ApiResponse<{ id: number; name: string; address: string; ownerEmail: string }[]>> {
    return apiClient.get(`${this.baseEndpoint}/search/gyms?q=${encodeURIComponent(query)}`);
  }

  async searchSubscriptions(query: string): Promise<ApiResponse<{ id: number; title: string; price: string; gymName: string; gymId: number }[]>> {
    return apiClient.get(`${this.baseEndpoint}/search/subscriptions?q=${encodeURIComponent(query)}`);
  }

  // Check if vendor config exists for a gym
  async checkVendorConfigExists(gymId: number, ownerEmail: string): Promise<ApiResponse<{ exists: boolean; config?: VendorPaymentConfig }>> {
    try {
      const response = await this.getVendorConfigs(1, 1, {
        gymName: undefined, // Don't filter by gym name
        ownerEmail: ownerEmail
      });
      
      if (response.success && response.data && response.data.configs.length > 0) {
        // Check if any config matches the exact gymId and ownerEmail
        const existingConfig = response.data.configs.find(config => 
          config.gymId === gymId && config.ownerEmail === ownerEmail
        );
        
        return {
          success: true,
          message: existingConfig ? 'Configuration exists' : 'Configuration not found',
          data: {
            exists: !!existingConfig,
            config: existingConfig
          }
        };
      }
      
      return {
        success: true,
        message: 'Configuration not found',
        data: {
          exists: false
        }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to check configuration',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // All Payments Management
  async getAllPayments(
    page = 1,
    limit = 10,
    filters?: {
      status?: string;
      gateway?: string;
      userEmail?: string;
      gymName?: string;
      dateFrom?: string;
      dateTo?: string;
    }
  ): Promise<ApiResponse<PaginatedPayments>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (filters) {
      if (filters.status) params.append('status', filters.status);
      if (filters.gateway) params.append('gateway', filters.gateway);
      if (filters.userEmail) params.append('userEmail', filters.userEmail);
      if (filters.gymName) params.append('gymName', filters.gymName);
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.append('dateTo', filters.dateTo);
    }

    return apiClient.get(`${this.baseEndpoint}/payments?${params.toString()}`);
  }

  async getPaymentById(id: number): Promise<ApiResponse<Payment>> {
    return apiClient.get(`${this.baseEndpoint}/payments/${id}`);
  }

  async getPaymentStats(): Promise<ApiResponse<PaymentStats>> {
    return apiClient.get(`${this.baseEndpoint}/payments/stats`);
  }

  // User Subscriptions Management
  async getAllUserSubscriptions(
    page = 1,
    limit = 10,
    filters?: {
      status?: 'active' | 'expired' | 'expiring';
      userEmail?: string;
      gymName?: string;
    }
  ): Promise<ApiResponse<PaginatedUserSubscriptions>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (filters) {
      if (filters.status) params.append('status', filters.status);
      if (filters.userEmail) params.append('userEmail', filters.userEmail);
      if (filters.gymName) params.append('gymName', filters.gymName);
    }

    return apiClient.get(`${this.baseEndpoint}/user-subscriptions?${params.toString()}`);
  }

  async getUserSubscriptionById(id: number): Promise<ApiResponse<UserSubscription>> {
    return apiClient.get(`${this.baseEndpoint}/user-subscriptions/${id}`);
  }

  async getUserSubscriptionStats(): Promise<ApiResponse<UserSubscriptionStats>> {
    return apiClient.get(`${this.baseEndpoint}/user-subscriptions/stats`);
  }

  // Refund Management
  async getAllRefunds(
    page = 1,
    limit = 10,
    filters?: {
      status?: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
      userEmail?: string;
      refundType?: 'full' | 'partial';
      dateFrom?: string;
      dateTo?: string;
    }
  ): Promise<ApiResponse<PaginatedRefunds>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (filters) {
      if (filters.status) params.append('status', filters.status);
      if (filters.userEmail) params.append('userEmail', filters.userEmail);
      if (filters.refundType) params.append('refundType', filters.refundType);
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.append('dateTo', filters.dateTo);
    }

    return apiClient.get(`${this.baseEndpoint}/refunds?${params.toString()}`);
  }

  async getRefundById(id: number): Promise<ApiResponse<Refund>> {
    return apiClient.get(`${this.baseEndpoint}/refunds/${id}`);
  }

  async createRefund(data: CreateRefundRequest): Promise<ApiResponse<Refund>> {
    return apiClient.post(`${this.baseEndpoint}/refunds`, data);
  }

  async updateRefundStatus(
    id: number,
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled',
    notes?: string
  ): Promise<ApiResponse<Refund>> {
    return apiClient.put(`${this.baseEndpoint}/refunds/${id}/status`, {
      status,
      notes
    });
  }

  async processRefund(id: number): Promise<ApiResponse<{ success: boolean; gatewayRefundId?: string; message: string }>> {
    return apiClient.post(`${this.baseEndpoint}/refunds/${id}/process`);
  }

  // New method: Initiate refund with gateway first, then create refund record
  async initiateRefundWithGateway(data: CreateRefundRequest): Promise<ApiResponse<{ 
    refund: Refund;
    gatewayRefundId: string;
    message: string;
  }>> {
    return apiClient.post(`${this.baseEndpoint}/refunds/initiate-with-gateway`, data);
  }

  async getRefundStats(): Promise<ApiResponse<RefundStats>> {
    return apiClient.get(`${this.baseEndpoint}/refunds/stats`);
  }

  // Alias for getAllRefunds to maintain consistency
  async getRefunds(
    page = 1,
    limit = 10,
    filters?: {
      status?: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
      userEmail?: string;
      refundType?: 'full' | 'partial';
      dateFrom?: string;
      dateTo?: string;
    }
  ): Promise<ApiResponse<PaginatedRefunds>> {
    return this.getAllRefunds(page, limit, filters);
  }

  // Check if payment is refundable
  async checkPaymentRefundable(paymentId: number): Promise<ApiResponse<{ 
    isRefundable: boolean; 
    reason?: string; 
    maxRefundAmount: number;
    alreadyRefunded: number;
  }>> {
    return apiClient.get(`${this.baseEndpoint}/payments/${paymentId}/refund-check`);
  }

  // Commission calculation helper
  calculateCommission(totalAmount: number, cutValue: number, cutType: 'percentage' | 'flat') {
    let commission = 0;
    if (cutType === 'percentage') {
      commission = (totalAmount * cutValue) / 100;
    } else {
      commission = cutValue;
    }
    
    const gstOnCommission = (commission * 18) / 100;
    const totalDeduction = commission + gstOnCommission;
    const vendorAmount = totalAmount - totalDeduction;

    return {
      commission,
      gstOnCommission,
      totalDeduction,
      vendorAmount,
    };
  }
}

export const adminPaymentService = new AdminPaymentService();
