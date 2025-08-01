import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Attendance {
  id: string;
  userId: string;
  gymId: string;
  checkIn: string;
  checkOut?: string;
  date: string;
  duration?: number;
  location?: {
    latitude: number;
    longitude: number;
  };
  qrCode?: string;
  method: 'qr' | 'code' | 'manual';
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

      checkIn: async (userId, gymId, method, location, qrCode) => {
        set({ isLoading: true, error: null });
        
        try {
          // Check if user already has an active session
          const existingSession = get().attendance.find(
            a => a.userId === userId && !a.checkOut
          );
          
          if (existingSession) {
            set({ error: 'You already have an active session', isLoading: false });
            return false;
          }
          
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const now = new Date();
          const attendance: Attendance = {
            id: Date.now().toString(),
            userId,
            gymId,
            checkIn: now.toISOString(),
            date: now.toISOString().split('T')[0],
            location,
            qrCode,
            method
          };
          
          set(state => ({
            attendance: [...state.attendance, attendance],
            activeSession: attendance,
            isLoading: false
          }));
          
          return true;
        } catch (error) {
          set({ error: 'Check-in failed. Please try again.', isLoading: false });
          return false;
        }
      },

      checkOut: async (sessionId) => {
        set({ isLoading: true, error: null });
        
        try {
          await new Promise(resolve => setTimeout(resolve, 800));
          
          const session = get().attendance.find(a => a.id === sessionId);
          if (!session) {
            set({ error: 'Session not found', isLoading: false });
            return false;
          }
          
          const checkOutTime = new Date();
          const duration = (checkOutTime.getTime() - new Date(session.checkIn).getTime()) / 1000;
          
          set(state => ({
            attendance: state.attendance.map(a => 
              a.id === sessionId 
                ? { ...a, checkOut: checkOutTime.toISOString(), duration }
                : a
            ),
            activeSession: null,
            isLoading: false
          }));
          
          return true;
        } catch (error) {
          set({ error: 'Check-out failed. Please try again.', isLoading: false });
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