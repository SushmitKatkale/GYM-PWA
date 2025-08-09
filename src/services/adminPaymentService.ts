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
