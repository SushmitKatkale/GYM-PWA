import { apiClient, ApiResponse } from './apiClient';
import { API_CONFIG, buildApiUrl } from '../config/api';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phoneNumber?: string;
  type: '1' | '2' | '3'; // 1-user, 2-owner, 3-admin
  activeStatus: '0' | '1';
  isVerified: boolean;
  createTimestamp: string;
  updateTimestamp?: string;
  createdBy?: string;
  updatedBy?: string;
  lastLoginAt?: string;
  profileImageUrl?: string;
  
  // Additional fields that might be available
  gym?: {
    id: string;
    name: string;
  };
  subscriptions?: {
    id: string;
    planName: string;
    status: string;
    expiryDate: string;
  }[];
  totalLogins?: number;
  totalSpent?: number;
}

export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  phoneNumber?: string;
  type?: '1' | '2' | '3';
  activeStatus?: '0' | '1';
  isVerified?: boolean;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  username?: string;
  email?: string;
  phoneNumber?: string;
  type?: '1' | '2' | '3';
  activeStatus?: '0' | '1';
  isVerified?: boolean;
}

export interface UserFilters {
  type?: '1' | '2' | '3';
  activeStatus?: boolean;
  isVerified?: boolean;
  email?: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  phoneNumber?: string;
  createdAfter?: string;
  createdBefore?: string;
  lastLoginAfter?: string;
  lastLoginBefore?: string;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  verifiedUsers: number;
  unverifiedUsers: number;
  regularUsers: number; // type 1
  gymOwners: number; // type 2
  admins: number; // type 3
  newUsersThisMonth: number;
  avgLoginFrequency: number;
}

export interface PaginatedUsers {
  users: User[];
  pagination: {
    currentPage: number;
    totalPages: number;
    total: number;
    limit: number;
  };
  stats?: UserStats;
}

class AdminUserService {
  async getUsers(
    page = 1,
    limit = 10,
    filters?: UserFilters
  ): Promise<ApiResponse<PaginatedUsers>> {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    // Add filters to query params and map activeStatus to correct format
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (key === 'activeStatus') {
            // Convert boolean to string for backend compatibility
            queryParams.append(key, value ? '1' : '0');
          } else {
            queryParams.append(key, value.toString());
          }
        }
      });
    }

    return apiClient.get<PaginatedUsers>(
      `${API_CONFIG.ENDPOINTS.USERS}?${queryParams.toString()}`
    );
  }

  async getUserByEmail(email: string): Promise<ApiResponse<User>> {
    return apiClient.get<User>(`${API_CONFIG.ENDPOINTS.USERS}/${encodeURIComponent(email)}`);
  }

  async createUser(userData: CreateUserRequest): Promise<ApiResponse<User>> {
    return apiClient.post<User>(`${API_CONFIG.ENDPOINTS.USERS}`, userData);
  }

  async updateUser(email: string, userData: UpdateUserRequest): Promise<ApiResponse<User>> {
    return apiClient.put<User>(`${API_CONFIG.ENDPOINTS.USERS}/${encodeURIComponent(email)}`, userData);
  }

  async deleteUser(email: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`${API_CONFIG.ENDPOINTS.USERS}/${encodeURIComponent(email)}`);
  }

  async hardDeleteUser(email: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`${API_CONFIG.ENDPOINTS.USERS}/hard/${encodeURIComponent(email)}`);
  }

  async toggleUserStatus(email: string, activeStatus: '0' | '1'): Promise<ApiResponse<User>> {
    return apiClient.put<User>(`${API_CONFIG.ENDPOINTS.USERS}/toggle/${encodeURIComponent(email)}`, {
      activeStatus
    });
  }

  async activateUser(email: string): Promise<ApiResponse<User>> {
    return this.toggleUserStatus(email, '1');
  }

  async deactivateUser(email: string): Promise<ApiResponse<User>> {
    return this.toggleUserStatus(email, '0');
  }

  async verifyUser(email: string): Promise<ApiResponse<User>> {
    return apiClient.put<User>(`${API_CONFIG.ENDPOINTS.USERS}/${encodeURIComponent(email)}/verify`);
  }

  async unverifyUser(email: string): Promise<ApiResponse<User>> {
    return apiClient.put<User>(`${API_CONFIG.ENDPOINTS.USERS}/${encodeURIComponent(email)}/unverify`);
  }

  async resetUserPassword(email: string, newPassword?: string): Promise<ApiResponse<{ temporaryPassword: string }>> {
    return apiClient.post<{ temporaryPassword: string }>(
      `${API_CONFIG.ENDPOINTS.USERS}/${encodeURIComponent(email)}/reset-password`,
      newPassword ? { newPassword } : {}
    );
  }

  async getUserStats(): Promise<ApiResponse<UserStats>> {
    return apiClient.get<UserStats>(`${API_CONFIG.ENDPOINTS.USERS}/stats`);
  }

  async getUserActivity(
    email: string,
    days = 30
  ): Promise<ApiResponse<{
    loginHistory: { date: string; count: number }[];
    activitySummary: {
      totalLogins: number;
      lastLogin: string;
      avgSessionDuration: number;
      deviceTypes: { [key: string]: number };
    };
  }>> {
    return apiClient.get(`${API_CONFIG.ENDPOINTS.USERS}/${encodeURIComponent(email)}/activity?days=${days}`);
  }

  async bulkUpdateUsers(
    userEmails: string[],
    updates: Partial<UpdateUserRequest>
  ): Promise<ApiResponse<{ updated: number; errors: string[] }>> {
    return apiClient.patch(
      `${API_CONFIG.ENDPOINTS.USERS}/bulk-update`,
      { userEmails, updates }
    );
  }

  // Debug function to check auth state
  debugAuthState(): void {
    console.log('=== AUTH DEBUG INFO ===');
    const authStorage = localStorage.getItem('auth-storage');
    console.log('Raw auth-storage:', authStorage);
    
    if (authStorage) {
      try {
        const parsed = JSON.parse(authStorage);
        console.log('Parsed auth storage:', parsed);
        console.log('Tokens object:', parsed.state?.tokens);
        console.log('Access token:', parsed.state?.tokens?.accessToken ? 'Present' : 'Missing');
        console.log('Token length:', parsed.state?.tokens?.accessToken?.length || 0);
        console.log('Token starts with:', parsed.state?.tokens?.accessToken?.substring(0, 20) + '...');
      } catch (error) {
        console.error('Failed to parse auth storage:', error);
      }
    } else {
      console.log('No auth-storage found in localStorage');
    }
    
    // Check all localStorage keys
    console.log('All localStorage keys:', Object.keys(localStorage));
    console.log('========================');
  }

  // Test function to compare token retrieval
  async testTokenComparison(): Promise<void> {
    console.log('=== TOKEN COMPARISON TEST ===');
    
    // Get token the same way as export function
    const authStorage = localStorage.getItem('auth-storage');
    let exportToken = null;
    if (authStorage) {
      try {
        const parsed = JSON.parse(authStorage);
        exportToken = parsed.state?.tokens?.accessToken;
      } catch (error) {
        console.error('Export token retrieval failed:', error);
      }
    }
    
    console.log('Export function token:', exportToken ? `${exportToken.substring(0, 20)}...` : 'null');
    
    // Test a regular API call to see if it works
    try {
      const testResponse = await apiClient.get('/users?page=1&limit=1');
      console.log('Regular API call result:', testResponse.success ? 'SUCCESS' : 'FAILED');
      if (!testResponse.success) {
        console.log('Regular API error:', testResponse.message);
      }
    } catch (error) {
      console.error('Regular API call failed:', error);
    }
    
    console.log('==============================');
  }

  async exportUsers(
    filters?: UserFilters,
    format: 'csv' | 'xlsx' = 'csv'
  ): Promise<void> {
    // Debug auth state first
    this.debugAuthState();
    
    const queryParams = new URLSearchParams({ format });
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (key === 'activeStatus') {
            // Convert boolean to string for backend compatibility
            queryParams.append(key, value ? '1' : '0');
          } else {
            queryParams.append(key, value.toString());
          }
        }
      });
    }

    // Use apiClient's token retrieval logic - same as apiClient
    const authStorage = localStorage.getItem('auth-storage');
    let token = null;
    
    console.log('Auth storage retrieved:', !!authStorage);
    
    if (authStorage) {
      try {
        const parsed = JSON.parse(authStorage);
        console.log('Auth storage structure:', {
          hasState: !!parsed.state,
          hasTokens: !!parsed.state?.tokens,
          hasAccessToken: !!parsed.state?.tokens?.accessToken
        });
        token = parsed.state?.tokens?.accessToken;
        console.log('Extracted token:', token ? `${token.substring(0, 20)}...` : 'null');
      } catch (error) {
        console.error('Failed to parse auth storage:', error);
      }
    }
    
    if (!token) {
      throw new Error('Authentication required. Please log in.');
    }
    
    const headers: HeadersInit = {
      'Authorization': `Bearer ${token}`,
      'Accept': 'text/csv',
      'Content-Type': 'application/json',
    };

    // Use buildApiUrl for consistent URL construction
    const exportUrl = buildApiUrl(`${API_CONFIG.ENDPOINTS.USERS}/export?${queryParams.toString()}`);
    console.log('Export URL:', exportUrl);
    console.log('Request headers:', headers);
    
    try {
      // Fetch the CSV file directly
      const response = await fetch(exportUrl, {
        method: 'GET',
        headers
      });

      console.log('Response status:', response.status);
      console.log('Response statusText:', response.statusText);
      
      if (!response.ok) {
        let errorText = '';
        try {
          errorText = await response.text();
          console.error('Export failed with error response:', errorText);
        } catch (e) {
          console.error('Failed to read error response:', e);
        }
        throw new Error(`Failed to export users: ${response.status} ${response.statusText}${errorText ? ' - ' + errorText : ''}`);
      }

      // Get the filename from the response headers
      const contentDisposition = response.headers.get('content-disposition');
      let filename = `users_export_${Date.now()}.csv`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      console.log('Export completed successfully');
    } catch (error) {
      console.error('Export error:', error);
      throw error;
    }
  }

  async sendNotificationToUsers(
    userEmails: string[],
    notification: {
      title: string;
      message: string;
      type: 'info' | 'warning' | 'success' | 'error';
      actionUrl?: string;
    }
  ): Promise<ApiResponse<{ sent: number; failed: number }>> {
    return apiClient.post(`${API_CONFIG.ENDPOINTS.USERS}/notify`, {
      userEmails,
      ...notification,
    });
  }
}

export const adminUserService = new AdminUserService();
