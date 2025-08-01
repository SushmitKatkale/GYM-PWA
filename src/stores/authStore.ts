import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'admin' | 'owner' | 'user';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  gymId?: string;
  phone?: string;
  avatar?: string;
  subscriptions?: Subscription[];
  createdAt: string;
}

export interface Subscription {
  id: string;
  gymId: string;
  gymName: string;
  planType: 'daily' | 'weekly' | 'monthly' | 'yearly';
  status: 'active' | 'expired' | 'cancelled';
  startDate: string;
  endDate: string;
  amount: number;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithCode: (code: string) => Promise<boolean>;
  register: (userData: Partial<User>, password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  clearError: () => void;
}

// Mock users for demo
const mockUsers: (User & { password: string; code?: string })[] = [
  {
    id: '1',
    name: 'System Admin',
    email: 'admin@gymms.com',
    password: 'admin123',
    code: '123456',
    role: 'admin',
    avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=150',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'John Smith',
    email: 'owner@gym.com',
    password: 'owner123',
    code: '234567',
    role: 'owner',
    gymId: 'gym1',
    phone: '+1234567890',
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '3',
    name: 'Sarah Johnson',
    email: 'user@email.com',
    password: 'user123',
    code: '345678',
    role: 'user',
    phone: '+1234567891',
    avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150',
    createdAt: '2024-01-01T00:00:00Z',
    subscriptions: [
      {
        id: 'sub1',
        gymId: 'gym1',
        gymName: 'FitZone Downtown',
        planType: 'monthly',
        status: 'active',
        startDate: '2024-01-01',
        endDate: '2024-02-01',
        amount: 59.99
      }
    ]
  }
];

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        
        try {
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const foundUser = mockUsers.find(u => u.email === email && u.password === password);
          if (foundUser) {
            const { password: _, code: __, ...userData } = foundUser;
            set({ user: userData, isLoading: false });
            return true;
          }
          
          set({ error: 'Invalid email or password', isLoading: false });
          return false;
        } catch (error) {
          set({ error: 'Login failed. Please try again.', isLoading: false });
          return false;
        }
      },

      loginWithCode: async (code: string) => {
        set({ isLoading: true, error: null });
        
        try {
          await new Promise(resolve => setTimeout(resolve, 800));
          
          const foundUser = mockUsers.find(u => u.code === code);
          if (foundUser) {
            const { password: _, code: __, ...userData } = foundUser;
            set({ user: userData, isLoading: false });
            return true;
          }
          
          set({ error: 'Invalid access code', isLoading: false });
          return false;
        } catch (error) {
          set({ error: 'Login failed. Please try again.', isLoading: false });
          return false;
        }
      },

      register: async (userData: Partial<User>, password: string) => {
        set({ isLoading: true, error: null });
        
        try {
          await new Promise(resolve => setTimeout(resolve, 1200));
          
          const newUser: User = {
            id: Date.now().toString(),
            name: userData.name || '',
            email: userData.email || '',
            role: userData.role || 'user',
            phone: userData.phone,
            gymId: userData.gymId,
            createdAt: new Date().toISOString()
          };
          
          set({ user: newUser, isLoading: false });
          return true;
        } catch (error) {
          set({ error: 'Registration failed. Please try again.', isLoading: false });
          return false;
        }
      },

      logout: () => {
        set({ user: null, error: null });
      },

      updateUser: (userData: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...userData } });
        }
      },

      clearError: () => {
        set({ error: null });
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user })
    }
  )
);