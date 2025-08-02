import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService, LoginRequest, RegisterRequest, SendOtpRequest, VerifyOtpRequest, ResendOtpRequest } from '../services/authService';

export type UserRole = 'admin' | 'owner' | 'user';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  role: UserRole;
  gymId?: string;
  phoneNumber?: string;
  avatar?: string;
  subscriptions?: Subscription[];
  isVerified: boolean;
  activeStatus: '0' | '1';
  createTimestamp: string;
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

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  
  // Authentication methods
  login: (email: string, password: string) => Promise<boolean>;
  loginWithCode: (code: string) => Promise<boolean>;
  sendOtp: (email: string, firstName?: string) => Promise<boolean>;
  verifyOtp: (email: string, otp: string) => Promise<boolean>;
  resendOtp: (email: string) => Promise<boolean>;
  register: (userData: RegisterRequest) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshTokens: () => Promise<boolean>;
  
  // User management
  updateUser: (userData: Partial<User>) => void;
  
  // Utility methods
  clearError: () => void;
  getAccessToken: () => string | null;
  hasRole: (roles: UserRole | UserRole[]) => boolean;
  validateSession: () => void;
  initializeAuth: () => void;
}

// Helper function to map backend user type to frontend role
const mapUserTypeToRole = (type: string): UserRole => {
  switch (type) {
    case '3': return 'admin';
    case '2': return 'owner';
    case '1': 
    default: return 'user';
  }
};

// Helper function to map frontend role to backend type
const mapRoleToUserType = (role: UserRole): '1' | '2' | '3' => {
  switch (role) {
    case 'admin': return '3';
    case 'owner': return '2';
    case 'user':
    default: return '1';
  }
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      tokens: null,
      isLoading: false,
      error: null,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await authService.login({ email, password });
          
          if (response.success && response.data) {
            const tokens = {
              accessToken: response.data.accessToken,
              refreshToken: response.data.refreshToken
            };
            
            // Store tokens and set authentication state
            set({ 
              tokens, 
              isAuthenticated: true,
              isLoading: false 
            });
            
            // TODO: Get user profile from the backend
            // For now, create a minimal user object
            const user: User = {
              id: '',
              firstName: '',
              lastName: '',
              username: '',
              email: email,
              role: 'user', // Will be updated when we get the profile
              isVerified: true,
              activeStatus: '1',
              createTimestamp: new Date().toISOString()
            };
            
            set({ user });
            return true;
          } else {
            set({ 
              error: response.message || response.error || 'Login failed', 
              isLoading: false,
              isAuthenticated: false 
            });
            return false;
          }
        } catch (error: any) {
          console.error('Login error:', error);
          const errorMessage = error?.response?.data?.message || 
                              error?.message || 
                              'Network error occurred. Please check your connection and try again.';
          set({ 
            error: errorMessage, 
            isLoading: false,
            isAuthenticated: false 
          });
          return false;
        }
      },

      loginWithCode: async (code: string) => {
        set({ isLoading: true, error: null });
        
        try {
          // For demo purposes, check against predefined codes
          const demoCredentials = {
            '123456': { email: 'admin@gymms.com', role: 'admin' as UserRole },
            '234567': { email: 'owner@gym.com', role: 'owner' as UserRole },
            '345678': { email: 'user@email.com', role: 'user' as UserRole }
          };
          
          const credential = demoCredentials[code as keyof typeof demoCredentials];
          
          if (credential) {
            // Create mock tokens for demo
            const tokens = {
              accessToken: `demo_access_token_${code}`,
              refreshToken: `demo_refresh_token_${code}`
            };
            
            const user: User = {
              id: `demo_user_${code}`,
              firstName: credential.role === 'admin' ? 'Admin' : credential.role === 'owner' ? 'Owner' : 'User',
              lastName: 'Demo',
              username: credential.role,
              email: credential.email,
              role: credential.role,
              isVerified: true,
              activeStatus: '1',
              createTimestamp: new Date().toISOString()
            };
            
            set({ 
              tokens, 
              user,
              isAuthenticated: true,
              isLoading: false 
            });
            
            return true;
          } else {
            set({ 
              error: 'Invalid access code', 
              isLoading: false,
              isAuthenticated: false 
            });
            return false;
          }
        } catch (error) {
          set({ 
            error: 'Network error occurred', 
            isLoading: false,
            isAuthenticated: false 
          });
          return false;
        }
      },

      sendOtp: async (email: string, firstName?: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await authService.sendOtp({ email, firstName });
          
          if (response.success) {
            set({ isLoading: false });
            return true;
          } else {
            set({ 
              error: response.message || response.error || 'Failed to send OTP', 
              isLoading: false 
            });
            return false;
          }
        } catch (error: any) {
          console.error('Send OTP error:', error);
          const errorMessage = error?.response?.data?.message || 
                              error?.message || 
                              'Network error occurred. Please check your connection and try again.';
          set({ 
            error: errorMessage, 
            isLoading: false 
          });
          return false;
        }
      },

      verifyOtp: async (email: string, otp: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await authService.verifyOtp({ email, otp });
          
          if (response.success) {
            set({ isLoading: false });
            return true;
          } else {
            set({ 
              error: response.message || response.error || 'Invalid OTP', 
              isLoading: false 
            });
            return false;
          }
        } catch (error: any) {
          console.error('Verify OTP error:', error);
          const errorMessage = error?.response?.data?.message || 
                              error?.message || 
                              'Network error occurred. Please check your connection and try again.';
          set({ 
            error: errorMessage, 
            isLoading: false 
          });
          return false;
        }
      },

      resendOtp: async (email: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await authService.resendOtp({ email });
          
          if (response.success) {
            set({ isLoading: false });
            return true;
          } else {
            set({ 
              error: response.message || response.error || 'Failed to resend OTP', 
              isLoading: false 
            });
            return false;
          }
        } catch (error: any) {
          console.error('Resend OTP error:', error);
          const errorMessage = error?.response?.data?.message || 
                              error?.message || 
                              'Network error occurred. Please check your connection and try again.';
          set({ 
            error: errorMessage, 
            isLoading: false 
          });
          return false;
        }
      },

      register: async (userData: RegisterRequest) => {
        console.log('Auth store register called with:', userData);
        set({ isLoading: true, error: null });
        
        try {
          console.log('Calling authService.register...');
          const response = await authService.register(userData);
          console.log('Auth service response:', response);
          
          if (response.success) {
            console.log('Registration successful - OTP should be sent by backend');
            set({ isLoading: false });
            return true;
          } else {
            console.log('Registration failed:', response.message);
            set({ 
              error: response.message || response.error || 'Registration failed', 
              isLoading: false 
            });
            return false;
          }
        } catch (error: any) {
          console.error('Registration error in store:', error);
          const errorMessage = error?.response?.data?.message || 
                              error?.message || 
                              'Network error occurred. Please check your connection and try again.';
          set({ 
            error: errorMessage, 
            isLoading: false 
          });
          return false;
        }
      },

      logout: async () => {
        const { tokens } = get();
        
        if (tokens?.refreshToken) {
          try {
            await authService.logout(tokens.refreshToken);
          } catch (error) {
            console.error('Logout error:', error);
          }
        }
        
        set({ 
          user: null, 
          tokens: null, 
          error: null,
          isAuthenticated: false 
        });
      },

      refreshTokens: async () => {
        const { tokens } = get();
        
        if (!tokens?.refreshToken) {
          return false;
        }
        
        try {
          const response = await authService.refreshToken(tokens.refreshToken);
          
          if (response.success && response.data) {
            const newTokens = {
              ...tokens,
              accessToken: response.data.accessToken
            };
            
            set({ tokens: newTokens });
            return true;
          } else {
            // Refresh token is invalid, logout user
            get().logout();
            return false;
          }
        } catch (error) {
          // Refresh token is invalid, logout user
          get().logout();
          return false;
        }
      },

      updateUser: (userData: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...userData } });
        }
      },

      clearError: () => {
        set({ error: null });
      },

      getAccessToken: () => {
        const { tokens } = get();
        return tokens?.accessToken || null;
      },

      hasRole: (roles: UserRole | UserRole[]) => {
        const { user } = get();
        if (!user) return false;
        
        const roleArray = Array.isArray(roles) ? roles : [roles];
        return roleArray.includes(user.role);
      },

      validateSession: () => {
        const { tokens, isAuthenticated } = get();
        
        // If user is supposed to be authenticated but has no tokens, logout
        if (isAuthenticated && (!tokens || !tokens.accessToken || !tokens.refreshToken)) {
          console.warn('Session validation failed: Missing tokens');
          get().logout();
          return;
        }
        
        // If tokens exist but user is not marked as authenticated, fix the state
        if (tokens && tokens.accessToken && !isAuthenticated) {
          set({ isAuthenticated: true });
        }
      },

      initializeAuth: () => {
        const { tokens, isAuthenticated } = get();
        
        // If no tokens exist, ensure user is logged out
        if (!tokens || !tokens.accessToken || !tokens.refreshToken) {
          if (isAuthenticated) {
            console.warn('Auth initialization: No tokens found, logging out');
            get().logout();
          }
          return;
        }
        
        // Validate tokens and try to refresh if needed
        set({ isAuthenticated: true });
        
        // Try to refresh tokens to ensure they're still valid
        get().refreshTokens().catch(() => {
          console.warn('Auth initialization: Token refresh failed, logging out');
          get().logout();
        });
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated 
      })
    }
  )
);
