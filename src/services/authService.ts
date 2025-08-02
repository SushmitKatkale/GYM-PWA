import { buildApiUrl } from '../config/api';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

export interface SendOtpRequest {
  email: string;
  firstName?: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export interface ResendOtpRequest {
  email: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  phoneNumber?: string;
  type?: '1' | '2' | '3'; // 1-user, 2-owner, 3-admin
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

class AuthService {
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
      
      // If response is not ok, but we got JSON data, extract error message
      if (!response.ok) {
        let errorMessage = '';
        
        // Handle different error response formats
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
        } else if (data.errors) {
          // Handle validation errors array
          if (Array.isArray(data.errors)) {
            errorMessage = data.errors.map((err: any) => 
              typeof err === 'string' ? err : err.message || err.msg
            ).join(', ');
          } else if (typeof data.errors === 'object') {
            // Handle validation errors object
            errorMessage = Object.values(data.errors).flat().join(', ');
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
      
      // Return the API response as-is if it's successful
      return data;
    } catch (parseError) {
      // If we can't parse JSON, return a generic error with status info
      return {
        success: false,
        message: response.ok 
          ? 'Invalid response format from server'
          : `HTTP ${response.status}: ${response.statusText}`,
        error: response.statusText
      };
    }
  }

  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    try {
      const response = await fetch(buildApiUrl('/auth/login'), {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(credentials),
      });

      return await this.handleResponse<LoginResponse>(response);
    } catch (error) {
      console.error('Login network error:', error);
      return {
        success: false,
        message: 'Network error occurred. Please check your connection and try again.',
        error: error instanceof Error ? error.message : 'Unknown network error'
      };
    }
  }

  async sendOtp(request: SendOtpRequest): Promise<ApiResponse> {
    try {
      const response = await fetch(buildApiUrl('/auth/send-otp'), {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(request),
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Send OTP network error:', error);
      return {
        success: false,
        message: 'Network error occurred. Please check your connection and try again.',
        error: error instanceof Error ? error.message : 'Unknown network error'
      };
    }
  }

  async verifyOtp(request: VerifyOtpRequest): Promise<ApiResponse> {
    try {
      const response = await fetch(buildApiUrl('/auth/verify-otp'), {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(request),
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Verify OTP network error:', error);
      return {
        success: false,
        message: 'Network error occurred. Please check your connection and try again.',
        error: error instanceof Error ? error.message : 'Unknown network error'
      };
    }
  }

  async resendOtp(request: ResendOtpRequest): Promise<ApiResponse> {
    try {
      const response = await fetch(buildApiUrl('/auth/resend-otp'), {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(request),
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Resend OTP network error:', error);
      return {
        success: false,
        message: 'Network error occurred. Please check your connection and try again.',
        error: error instanceof Error ? error.message : 'Unknown network error'
      };
    }
  }

  async register(request: RegisterRequest): Promise<ApiResponse> {
    try {
      const url = buildApiUrl('/auth/register');
      console.log('Making register request to:', url);
      console.log('Request payload:', request);
      console.log('Request headers:', this.getAuthHeaders());
      
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(request),
      });
      
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      const result = await this.handleResponse(response);
      console.log('Processed response:', result);
      return result;
    } catch (error) {
      console.error('Register network error:', error);
      return {
        success: false,
        message: 'Network error occurred. Please check your connection and try again.',
        error: error instanceof Error ? error.message : 'Unknown network error'
      };
    }
  }

  async refreshToken(refreshToken: string): Promise<ApiResponse<{ accessToken: string }>> {
    try {
      const response = await fetch(buildApiUrl('/auth/refresh-token'), {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ refreshToken }),
      });

      return await this.handleResponse<{ accessToken: string }>(response);
    } catch (error) {
      console.error('Refresh token network error:', error);
      return {
        success: false,
        message: 'Network error occurred. Please check your connection and try again.',
        error: error instanceof Error ? error.message : 'Unknown network error'
      };
    }
  }

  async logout(refreshToken: string): Promise<ApiResponse> {
    try {
      const response = await fetch(buildApiUrl('/auth/logout'), {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ refreshToken }),
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Logout network error:', error);
      return {
        success: false,
        message: 'Network error occurred. Please check your connection and try again.',
        error: error instanceof Error ? error.message : 'Unknown network error'
      };
    }
  }

  async getUserProfile(token: string): Promise<ApiResponse> {
    try {
      const response = await fetch(buildApiUrl('/users/profile'), {
        method: 'GET',
        headers: this.getAuthHeaders(token),
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Get user profile network error:', error);
      return {
        success: false,
        message: 'Network error occurred. Please check your connection and try again.',
        error: error instanceof Error ? error.message : 'Unknown network error'
      };
    }
  }
}

export const authService = new AuthService();
