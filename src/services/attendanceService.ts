import { buildApiUrl, API_CONFIG } from '../config/api';

export interface Attendance {
  id: string;
  userId: string;
  gymId: string;
  checkIn: string;
  checkOut?: string;
  date: string;
  method: 'qr' | 'code' | 'manual';
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

class AttendanceService {
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

  async getUserAttendance(userId: string, token: string): Promise<ApiResponse<Attendance[]>> {
    try {
      const url = buildApiUrl(`${API_CONFIG.ENDPOINTS.OWNERS}/${userId}/attendance`);

      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders(token),
      });

      return await this.handleResponse<Attendance[]>(response);
    } catch (error) {
      console.error('Get user attendance network error:', error);
      return {
        success: false,
        message: 'Network error occurred. Please check your connection and try again.',
        error: error instanceof Error ? error.message : 'Unknown network error'
      };
    }
  }
}

export const attendanceService = new AttendanceService();

