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
    status?: string
  ): Promise<ApiResponse<PaginatedVendorConfigs>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (status) {
      params.append('status', status);
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
