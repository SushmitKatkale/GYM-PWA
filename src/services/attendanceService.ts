import { buildApiUrl, API_CONFIG } from '../config/api';
import { apiClient, ApiResponse } from './apiClient';

export interface Attendance {
  id: string;
  userId: string;
  gymId: string;
  checkIn: string;
  checkOut?: string;
  date: string;
  method: 'qr' | 'code' | 'manual';
}


class AttendanceService {
  async getUserAttendance(userId: string): Promise<ApiResponse<Attendance[]>> {
    return apiClient.get<Attendance[]>(`${API_CONFIG.ENDPOINTS.OWNERS}/${userId}/attendance`);
  }

  async createAttendance(attendanceData: Partial<Attendance>): Promise<ApiResponse<Attendance>> {
    return apiClient.post<Attendance>('/attendance', attendanceData);
  }

  async updateAttendance(id: string, attendanceData: Partial<Attendance>): Promise<ApiResponse<Attendance>> {
    return apiClient.put<Attendance>(`/attendance/${id}`, attendanceData);
  }

  async deleteAttendance(id: string): Promise<ApiResponse> {
    return apiClient.delete(`/attendance/${id}`);
  }
}

export const attendanceService = new AttendanceService();

