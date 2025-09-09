import { buildApiUrl, API_CONFIG } from '../config/api';
import { apiClient, ApiResponse } from './apiClient';

export interface CheckInData {
  method: 'quick_checkin' | 'gym_qr_scan' | 'gym_code' | 'owner_scan_user' | 'fingerprint' | 'face_scan';
  location?: {
    latitude: number;
    longitude: number;
  };
  qrCode?: string;
  uniqueCode?: string;
  deviceInfo?: any;
}

export interface Attendance {
  id: string;
  userEmail: string;
  gymId: string;
  checkInTime: string;
  checkOutTime?: string;
  checkInMethod: string;
  userLocationLat?: number;
  userLocationLng?: number;
  distanceFromGym?: number;
  durationMinutes?: number;
  qrCodeUsed?: string;
  sessionNotes?: string;
  sessionRating?: number;
  isValidSession: boolean;
  isActive: boolean;
  deviceInfo?: any;
  gym?: {
    id: string;
    name: string;
    address: string;
  };
}

export interface AttendanceResponse {
  success: boolean;
  data: {
    attendance: Attendance[];
    total: Number;
  };
  message: string;
}

class AttendanceService {
  async getUserAttendance(userEmail: string): Promise<ApiResponse<Attendance[]>> {
    return apiClient.get<Attendance[]>(`${API_CONFIG.ENDPOINTS.ATTENDANCE}/user/${userEmail}`);
  }

  async getActiveSession(userId: Number): Promise<ApiResponse<Attendance | null>> {
    return apiClient.get<Attendance | null>(`/attendance/active-session/${userId}`);
  }

  async checkIn(checkInData: CheckInData): Promise<ApiResponse<AttendanceResponse>> {
    return apiClient.post<AttendanceResponse>(`${API_CONFIG.ENDPOINTS.ATTENDANCE}/checkin`, checkInData);
  }

  async checkOut(attendanceId: string): Promise<ApiResponse<AttendanceResponse>> {
    return apiClient.post<AttendanceResponse>(`${API_CONFIG.ENDPOINTS.ATTENDANCE}/checkout/${attendanceId}`);
  }

  async quickCheckIn(gymId: string, location?: { latitude: number; longitude: number }): Promise<ApiResponse<AttendanceResponse>> {
    return apiClient.post<AttendanceResponse>(`${API_CONFIG.ENDPOINTS.ATTENDANCE}/quick-checkin`, {
      gymId,
      location
    });
  }

  async getGymCheckInMethods(gymId: string): Promise<ApiResponse<any[]>> {
    return apiClient.get<any[]>(`${API_CONFIG.ENDPOINTS.CHECKIN_METHODS}/gym/${gymId}`);
  }

  async validateQRCode(qrCode: string): Promise<ApiResponse<any>> {
    return apiClient.post<any>(`${API_CONFIG.ENDPOINTS.QR_CODES}/validate`, { qrCode });
  }

  async validateUniqueCode(code: string): Promise<ApiResponse<any>> {
    return apiClient.post<any>(`${API_CONFIG.ENDPOINTS.UNIQUE_CODES}/validate`, { uniqueCode: code });
  }
}

export const attendanceService = new AttendanceService();

