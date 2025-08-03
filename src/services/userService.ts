import { buildApiUrl, API_CONFIG } from '../config/api';

export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  phoneNumber?: string;
  type?: '1' | '2' | '3'; // 1-user, 2-owner, 3-admin
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  username?: string;
  email?: string;
  phoneNumber?: string;
  activeStatus?: '0' | '1';
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phoneNumber?: string;
  type: '1' | '2' | '3';
  activeStatus: '0' | '1';
  isVerified: boolean;
  createTimestamp: string;
  updateTimestamp?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

class UserService {
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

  async getAllUsers(token: string, page?: number, limit?: number): Promise<ApiResponse<{ users: User[], totalPages: number, currentPage: number, totalUsers: number }>> {
    try {
      const queryParams = new URLSearchParams();
      if (page) queryParams.append('page', page.toString());
      if (limit) queryParams.append('limit', limit.toString());
      
      const url = `${buildApiUrl(API_CONFIG.ENDPOINTS.USERS)}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders(token),
      });

      return await this.handleResponse<{ users: User[], totalPages: number, currentPage: number, totalUsers: number }>(response);
    } catch (error) {
      console.error('Get users network error:', error);
      return {
        success: false,
        message: 'Network error occurred. Please check your connection and try again.',
        error: error instanceof Error ? error.message : 'Unknown network error'
      };
    }
  }

  async getUserById(id: string, token: string): Promise<ApiResponse<User>> {
    try {
      const response = await fetch(buildApiUrl(`${API_CONFIG.ENDPOINTS.USERS}/${id}`), {
        method: 'GET',
        headers: this.getAuthHeaders(token),
      });

      return await this.handleResponse<User>(response);
    } catch (error) {
      console.error('Get user by ID network error:', error);
      return {
        success: false,
        message: 'Network error occurred. Please check your connection and try again.',
        error: error instanceof Error ? error.message : 'Unknown network error'
      };
    }
  }

  async createUser(userData: CreateUserRequest, token: string): Promise<ApiResponse<User>> {
    try {
      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.USERS), {
        method: 'POST',
        headers: this.getAuthHeaders(token),
        body: JSON.stringify(userData),
      });

      return await this.handleResponse<User>(response);
    } catch (error) {
      console.error('Create user network error:', error);
      return {
        success: false,
        message: 'Network error occurred. Please check your connection and try again.',
        error: error instanceof Error ? error.message : 'Unknown network error'
      };
    }
  }

  async updateUser(id: string, userData: UpdateUserRequest, token: string): Promise<ApiResponse<User>> {
    try {
      const response = await fetch(buildApiUrl(`${API_CONFIG.ENDPOINTS.USERS}/${id}`), {
        method: 'PUT',
        headers: this.getAuthHeaders(token),
        body: JSON.stringify(userData),
      });

      return await this.handleResponse<User>(response);
    } catch (error) {
      console.error('Update user network error:', error);
      return {
        success: false,
        message: 'Network error occurred. Please check your connection and try again.',
        error: error instanceof Error ? error.message : 'Unknown network error'
      };
    }
  }

  async deleteUser(id: string, token: string): Promise<ApiResponse> {
    try {
      const response = await fetch(buildApiUrl(`${API_CONFIG.ENDPOINTS.USERS}/${id}`), {
        method: 'DELETE',
        headers: this.getAuthHeaders(token),
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Delete user network error:', error);
      return {
        success: false,
        message: 'Network error occurred. Please check your connection and try again.',
        error: error instanceof Error ? error.message : 'Unknown network error'
      };
    }
  }

  async searchUsers(query: string, token: string): Promise<ApiResponse<User[]>> {
    try {
      const response = await fetch(buildApiUrl(`${API_CONFIG.ENDPOINTS.USERS}/search?q=${encodeURIComponent(query)}`), {
        method: 'GET',
        headers: this.getAuthHeaders(token),
      });

      return await this.handleResponse<User[]>(response);
    } catch (error) {
      console.error('Search users network error:', error);
      return {
        success: false,
        message: 'Network error occurred. Please check your connection and try again.',
        error: error instanceof Error ? error.message : 'Unknown network error'
      };
    }
  }
}

export const userService = new UserService();
