import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { attendanceService, Attendance as ApiAttendance, CheckInData } from '../services/attendanceService';
import { useAuthStore } from './authStore';

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
  // Legacy fields for backward compatibility
  userId?: string;
  checkIn?: string;
  checkOut?: string;
  date?: string;
  duration?: number;
  location?: {
    latitude: number;
    longitude: number;
  };
  qrCode?: string;
  method?: 'qr' | 'code' | 'manual';
}

interface AttendanceState {
  attendance: Attendance[];
  activeSession: Attendance | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  checkIn: (userId: string, gymId: string, method: 'qr' | 'code' | 'manual', location?: { latitude: number; longitude: number }, qrCode?: string) => Promise<boolean>;
  checkOut: (sessionId: string) => Promise<boolean>;
  getUserAttendance: (userId: string) => Attendance[];
  getActiveSession: (userId: string) => Attendance | null;
  loadUserAttendance: (userEmail: string) => Promise<void>;
  loadActiveSession: (userEmail: string) => Promise<void>;
  quickCheckIn: (gymId: string, location?: { latitude: number; longitude: number }) => Promise<boolean>;
  getAttendanceByDateRange: (userId: string, startDate: string, endDate: string) => Attendance[];
  exportAttendance: (userId: string, format: 'csv' | 'json') => string;
  clearError: () => void;
}

export const useAttendanceStore = create<AttendanceState>()(
  persist(
    (set, get) => ({
      attendance: [],
      activeSession: null,
      isLoading: false,
      error: null,

      loadUserAttendance: async (userEmail: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await attendanceService.getUserAttendance(userEmail);
          
          if (response.success && response.data) {
            const attendanceData = response.data?.attendance?.map((a: ApiAttendance) => ({
              ...a,
              // Add legacy fields for backward compatibility
              userId: userEmail,
              checkIn: a.checkInTime,
              checkOut: a.checkOutTime,
              date: a.checkInTime ? new Date(a.checkInTime).toISOString().split('T')[0] : '',
              duration: a.durationMinutes ? a.durationMinutes * 60 : undefined,
              qrCode: a.qrCodeUsed,
              method: (a.checkInMethod === 'quick_checkin' ? 'manual' : 
                      a.checkInMethod === 'gym_qr_scan' ? 'qr' : 'code') as 'qr' | 'code' | 'manual'
            }));
            
            set({ attendance: attendanceData, isLoading: false });
          } else {
            set({ error: response.message || 'Failed to load attendance', isLoading: false });
          }
        } catch (error: any) {
          set({ error: error.message || 'Failed to load attendance', isLoading: false });
        }
      },

      loadActiveSession: async (userEmail: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await attendanceService.getActiveSession(userEmail);
          
          if (response.success) {
            const sessionData = response.data ? {
              ...response.data,
              // Add legacy fields for backward compatibility
              userId: userEmail,
              checkIn: response.data.checkInTime,
              checkOut: response.data.checkOutTime,
              date: response.data.checkInTime ? new Date(response.data.checkInTime).toISOString().split('T')[0] : '',
              duration: response.data.durationMinutes ? response.data.durationMinutes * 60 : undefined,
              qrCode: response.data.qrCodeUsed,
              method: (response.data.checkInMethod === 'quick_checkin' ? 'manual' : 
                      response.data.checkInMethod === 'gym_qr_scan' ? 'qr' : 'code') as 'qr' | 'code' | 'manual'
            } : null;
            
            set({ activeSession: sessionData, isLoading: false });
          } else {
            set({ error: response.message || 'Failed to load active session', isLoading: false });
          }
        } catch (error: any) {
          set({ error: error.message || 'Failed to load active session', isLoading: false });
        }
      },

      quickCheckIn: async (gymId: string, location?: { latitude: number; longitude: number }) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await attendanceService.quickCheckIn(gymId, location);
          
          if (response.success && response.data) {
            const attendanceData = {
              ...response.data.data,
              // Add legacy fields for backward compatibility
              userId: response.data.data.userEmail,
              checkIn: response.data.data.checkInTime,
              date: new Date(response.data.data.checkInTime).toISOString().split('T')[0],
              qrCode: response.data.data.qrCodeUsed,
              method: 'manual' as const
            };
            
            set(state => ({
              attendance: [...state.attendance, attendanceData],
              activeSession: attendanceData,
              isLoading: false
            }));
            
            return true;
          } else {
            set({ error: response.message || 'Check-in failed', isLoading: false });
            return false;
          }
        } catch (error: any) {
          set({ error: error.message || 'Check-in failed. Please try again.', isLoading: false });
          return false;
        }
      },

      checkIn: async (userId, gymId, method, location, qrCode) => {
        set({ isLoading: true, error: null });
        
        try {
          const checkInData: CheckInData = {
            gymId,
            method: method === 'manual' ? 'quick_checkin' : 
                   method === 'qr' ? 'gym_qr_scan' : 'gym_code',
            location,
            qrCode,
            deviceInfo: {
              platform: navigator.platform,
              userAgent: navigator.userAgent.substring(0, 200)
            }
          };
          
          const response = await attendanceService.checkIn(checkInData);
          
          if (response.success && response.data) {
            const attendanceData = {
              ...response.data.data,
              // Add legacy fields for backward compatibility
              userId: userId,
              checkIn: response.data.data.checkInTime,
              date: new Date(response.data.data.checkInTime).toISOString().split('T')[0],
              qrCode: response.data.data.qrCodeUsed,
              method
            };
            
            set(state => ({
              attendance: [...state.attendance, attendanceData],
              activeSession: attendanceData,
              isLoading: false
            }));
            
            return true;
          } else {
            set({ error: response.message || 'Check-in failed', isLoading: false });
            return false;
          }
        } catch (error: any) {
          set({ error: error.message || 'Check-in failed. Please try again.', isLoading: false });
          return false;
        }
      },

      checkOut: async (sessionId) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await attendanceService.checkOut(sessionId);
          
          if (response.success && response.data) {
            const updatedAttendance = {
              ...response.data.data,
              // Add legacy fields for backward compatibility
              userId: response.data.data.userEmail,
              checkIn: response.data.data.checkInTime,
              checkOut: response.data.data.checkOutTime,
              duration: response.data.data.durationMinutes ? response.data.data.durationMinutes * 60 : 0
            };
            
            set(state => ({
              attendance: state.attendance.map(a => 
                a.id === sessionId ? updatedAttendance : a
              ),
              activeSession: null,
              isLoading: false
            }));
            
            return true;
          } else {
            set({ error: response.message || 'Check-out failed', isLoading: false });
            return false;
          }
        } catch (error: any) {
          set({ error: error.message || 'Check-out failed. Please try again.', isLoading: false });
          return false;
        }
      },

      getUserAttendance: (userId) => {
        return get().attendance.filter(a => a.userId === userId);
      },

      getActiveSession: (userId) => {
        return get().attendance.find(a => a.userId === userId && !a.checkOut) || null;
      },

      getAttendanceByDateRange: (userId, startDate, endDate) => {
        return get().attendance.filter(a => 
          a.userId === userId && 
          a.date >= startDate && 
          a.date <= endDate
        );
      },

      exportAttendance: (userId, format) => {
        const userAttendance = get().getUserAttendance(userId);
        
        if (format === 'csv') {
          const headers = ['Date', 'Check In', 'Check Out', 'Duration (mins)', 'Method'];
          const rows = userAttendance.map(a => [
            a.date,
            new Date(a.checkIn).toLocaleTimeString(),
            a.checkOut ? new Date(a.checkOut).toLocaleTimeString() : 'Active',
            a.duration ? Math.round(a.duration / 60).toString() : '0',
            a.method
          ]);
          
          return [headers, ...rows].map(row => row.join(',')).join('\n');
        } else {
          return JSON.stringify(userAttendance, null, 2);
        }
      },

      clearError: () => set({ error: null })
    }),
    {
      name: 'attendance-storage',
      partialize: (state) => ({ 
        attendance: state.attendance,
        activeSession: state.activeSession 
      })
    }
  )
);