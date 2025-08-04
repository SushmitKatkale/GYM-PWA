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
  sendOtp: (email: string, firstName?: string) => Promise<boolean>;
  verifyOtp: (email: string, otp: string) => Promise<boolean>;
  resendOtp: (email: string) => Promise<boolean>;
  register: (userData: RegisterRequest) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshTokens: () => Promise<boolean>;
  
  // User management
  updateUser: (userData: Partial<User>) => void;
  fetchUserProfile: () => Promise<boolean>;
  
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
            
            // Create a basic user object first to allow login
            const basicUser: User = {
              id: '',
              firstName: '',
              lastName: '',
              username: '',
              email: email,
              role: 'user',
              isVerified: true,
              activeStatus: '1',
              createTimestamp: new Date().toISOString()
            };
            
            set({ user: basicUser });
            
            // Try to fetch detailed user profile from the backend (optional)
            // This runs in the background and updates the user object if successful
            authService.getUserProfile(tokens.accessToken)
              .then(profileResponse => {
                if (profileResponse.success && profileResponse.data) {
                  const profileData = profileResponse.data;
                  const enhancedUser: User = {
                    id: profileData.id || basicUser.id,
                    firstName: profileData.firstName || basicUser.firstName,
                    lastName: profileData.lastName || basicUser.lastName,
                    username: profileData.username || basicUser.username,
                    email: profileData.email || email,
                    role: mapUserTypeToRole(profileData.type || '1'),
                    gymId: profileData.gymId,
                    phoneNumber: profileData.phoneNumber,
                    avatar: profileData.avatar,
                    isVerified: profileData.isVerified !== false,
                    activeStatus: profileData.activeStatus || '1',
                    createTimestamp: profileData.createTimestamp || basicUser.createTimestamp
                  };
                  
                  console.log('User profile loaded successfully:', enhancedUser);
                  set({ user: enhancedUser });
                } else {
                  console.warn('Failed to fetch user profile, using basic user info:', profileResponse.message);
                }
              })
              .catch(profileError => {
                console.warn('Error fetching user profile, using basic user info:', profileError);
              });
            
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

      fetchUserProfile: async () => {
        const { tokens, user } = get();
        
        if (!tokens?.accessToken) {
          console.warn('Cannot fetch user profile: No access token available');
          return false;
        }
        
        try {
          const profileResponse = await authService.getUserProfile(tokens.accessToken);
          
          if (profileResponse.success && profileResponse.data) {
            const profileData = profileResponse.data;
            const enhancedUser: User = {
              id: profileData.id || user?.id || '',
              firstName: profileData.firstName || user?.firstName || '',
              lastName: profileData.lastName || user?.lastName || '',
              username: profileData.username || user?.username || '',
              email: profileData.email || user?.email || '',
              role: mapUserTypeToRole(profileData.type || '1'),
              gymId: profileData.gymId,
              phoneNumber: profileData.phoneNumber,
              avatar: profileData.avatar,
              isVerified: profileData.isVerified !== false,
              activeStatus: profileData.activeStatus || '1',
              createTimestamp: profileData.createTimestamp || user?.createTimestamp || new Date().toISOString()
            };
            
            console.log('User profile fetched successfully:', enhancedUser);
            set({ user: enhancedUser });
            return true;
          } else {
            console.warn('Failed to fetch user profile:', profileResponse.message);
            return false;
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          return false;
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
