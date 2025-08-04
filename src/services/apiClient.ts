import { buildApiUrl } from '../config/api';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface ApiRequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: HeadersInit;
  body?: any;
  requiresAuth?: boolean;
  skipAuthHeader?: boolean;
}

class ApiClient {
  private getTokens() {
    try {
      // Get tokens from localStorage (same key used by auth store)
      const authStorage = localStorage.getItem('auth-storage');
      if (authStorage) {
        const parsed = JSON.parse(authStorage);
        return parsed.state?.tokens;
      }
    } catch (error) {
      console.warn('Failed to get tokens from storage:', error);
    }
    return null;
  }

  private getAuthHeaders(skipAuthHeader = false): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (!skipAuthHeader) {
      const tokens = this.getTokens();
      if (tokens?.accessToken) {
        headers['Authorization'] = `Bearer ${tokens.accessToken}`;
      }
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    try {
      const data = await response.json();

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
            errorMessage = data.errors
              .map((err: any) => (typeof err === 'string' ? err : err.message || err.msg))
              .join(', ');
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
          error: errorMessage,
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
        error: response.statusText,
      };
    }
  }

  async request<T = any>(
    endpoint: string,
    config: ApiRequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      headers = {},
      body,
      requiresAuth = true,
      skipAuthHeader = false,
    } = config;

    try {
      // Check if authentication is required but no token is available
      if (requiresAuth && !skipAuthHeader && !this.getTokens()?.accessToken) {
        return {
          success: false,
          message: 'Authentication required. Please log in.',
          error: 'No access token available',
        };
      }

      const requestHeaders = {
        ...this.getAuthHeaders(skipAuthHeader),
        ...headers,
      };

      const requestConfig: RequestInit = {
        method,
        headers: requestHeaders,
      };

      // Add body for non-GET requests
      if (body && method !== 'GET') {
        if (body instanceof FormData) {
          // Remove Content-Type for FormData to let browser set it with boundary
          delete (requestHeaders as any)['Content-Type'];
          requestConfig.body = body;
        } else {
          requestConfig.body = JSON.stringify(body);
        }
      }

      const response = await fetch(buildApiUrl(endpoint), requestConfig);

      // Handle 401 Unauthorized - token might be expired
      if (response.status === 401 && requiresAuth) {
        console.warn('Received 401 Unauthorized, token may be expired');
        // You could trigger a token refresh here or redirect to login
        // For now, just return the error
      }

      return await this.handleResponse<T>(response);
    } catch (error) {
      console.error('API request error:', error);
      return {
        success: false,
        message: 'Network error occurred. Please check your connection and try again.',
        error: error instanceof Error ? error.message : 'Unknown network error',
      };
    }
  }

  // Convenience methods
  async get<T = any>(endpoint: string, config: Omit<ApiRequestConfig, 'method'> = {}) {
    return this.request<T>(endpoint, { ...config, method: 'GET' });
  }

  async post<T = any>(endpoint: string, body?: any, config: Omit<ApiRequestConfig, 'method' | 'body'> = {}) {
    return this.request<T>(endpoint, { ...config, method: 'POST', body });
  }

  async put<T = any>(endpoint: string, body?: any, config: Omit<ApiRequestConfig, 'method' | 'body'> = {}) {
    return this.request<T>(endpoint, { ...config, method: 'PUT', body });
  }

  async patch<T = any>(endpoint: string, body?: any, config: Omit<ApiRequestConfig, 'method' | 'body'> = {}) {
    return this.request<T>(endpoint, { ...config, method: 'PATCH', body });
  }

  async delete<T = any>(endpoint: string, config: Omit<ApiRequestConfig, 'method'> = {}) {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' });
  }
}

// Export a singleton instance
export const apiClient = new ApiClient();
