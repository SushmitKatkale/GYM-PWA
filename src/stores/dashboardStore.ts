import { create } from 'zustand';
import { 
  dashboardService, 
  AdminOverview, 
  AdminAnalytics, 
  OwnerDashboard, 
  UserDashboard,
  PersonalStats,
  ActivitySummary,
  Recommendations,
  GymAnalytics
} from '../services/dashboardService';

interface DashboardState {
  // Loading states
  isLoading: boolean;
  error: string | null;
  lastFetchTimes: { [key: string]: number };
  
  // Admin dashboard data
  adminOverview: AdminOverview | null;
  adminAnalytics: AdminAnalytics | null;
  
  // Owner dashboard data
  ownerDashboard: OwnerDashboard | null;
  gymAnalytics: { [gymId: number]: GymAnalytics };
  currentGymAnalytics: GymAnalytics | null;
  
  // User dashboard data
  userDashboard: UserDashboard | null;
  personalStats: PersonalStats | null;
  activitySummary: ActivitySummary | null;
  recommendations: Recommendations | null;
  
  // Methods
  clearError: () => void;
  clearAllData: () => void;
  
  // Admin methods
  fetchAdminOverview: () => Promise<void>;
  fetchAdminAnalytics: (period?: string) => Promise<void>;
  
  // Owner methods
  fetchOwnerDashboard: (userId?: string | number) => Promise<void>;
  fetchGymAnalytics: (gymId: number) => Promise<void>;
  
  // User methods
  fetchUserDashboard: (userId?: number) => Promise<void>;
  fetchPersonalStats: (period?: string) => Promise<void>;
  fetchActivitySummary: () => Promise<void>;
  fetchRecommendations: () => Promise<void>;
}

export const useDashboardStore = create<DashboardState>()((set, get) => ({
  // Initial state
  isLoading: false,
  error: null,
  lastFetchTimes: {},
  
  adminOverview: null,
  adminAnalytics: null,
  
  ownerDashboard: null,
  gymAnalytics: {},
  
  userDashboard: null,
  personalStats: null,
  activitySummary: null,
  recommendations: null,
  
  // Utility methods
  clearError: () => set({ error: null }),
  
  clearAllData: () => set({
    adminOverview: null,
    adminAnalytics: null,
    ownerDashboard: null,
    gymAnalytics: {},
    userDashboard: null,
    personalStats: null,
    activitySummary: null,
    recommendations: null,
    error: null,
    lastFetchTimes: {}
  }),
  
  // Admin methods
  fetchAdminOverview: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await dashboardService.getAdminOverview();
      
      if (response.success && response.data) {
        set({ 
          adminOverview: response.data,
          isLoading: false 
        });
      } else {
        set({ 
          error: response.message || 'Failed to fetch admin overview',
          isLoading: false 
        });
      }
    } catch (error: any) {
      set({ 
        error: error.message || 'Network error occurred',
        isLoading: false 
      });
    }
  },
  
  fetchAdminAnalytics: async (period = '30d') => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await dashboardService.getAdminAnalytics(period);
      
      if (response.success && response.data) {
        set({ 
          adminAnalytics: response.data,
          isLoading: false 
        });
      } else {
        set({ 
          error: response.message || 'Failed to fetch admin analytics',
          isLoading: false 
        });
      }
    } catch (error: any) {
      set({ 
        error: error.message || 'Network error occurred',
        isLoading: false 
      });
    }
  },
  
  // Owner methods
  fetchOwnerDashboard: async (userId?: string | number) => {
    const state = get();
    const now = Date.now();
    const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
    const cacheKey = `ownerDashboard_${userId || 'current'}`;
    
    // If we have recent data, don't fetch again
    if (state.ownerDashboard && state.lastFetchTimes[cacheKey] && (now - state.lastFetchTimes[cacheKey]) < CACHE_DURATION) {
      console.log('Using cached owner dashboard data');
      return;
    }
    
    try {
      set({ isLoading: true, error: null });
      
      const response = await dashboardService.getOwnerDashboard(userId);
      
      if (response.success && response.data) {
        set((state) => ({
          ownerDashboard: response.data,
          isLoading: false,
          lastFetchTimes: {
            ...state.lastFetchTimes,
            [cacheKey]: now
          }
        }));
      } else {
        set({ 
          error: response.message || 'Failed to fetch owner dashboard',
          isLoading: false 
        });
      }
    } catch (error: any) {
      set({ 
        error: error.message || 'Network error occurred',
        isLoading: false 
      });
    }
  },
  
  fetchGymAnalytics: async (gymId: number) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await dashboardService.getGymAnalytics(gymId);
      
      if (response.success && response.data) {
        set((state) => ({ 
          gymAnalytics: {
            ...state.gymAnalytics,
            [gymId]: response.data!
          },
          isLoading: false 
        }));
      } else {
        set({ 
          error: response.message || 'Failed to fetch gym analytics',
          isLoading: false 
        });
      }
    } catch (error: any) {
      set({ 
        error: error.message || 'Network error occurred',
        isLoading: false 
      });
    }
  },
  
  // User methods
  fetchUserDashboard: async (userId?: number) => {
    try {
      set({ isLoading: true, error: null });
      console.log('🔄 Dashboard store: Fetching user dashboard for user:', userId);
      
      const response = await dashboardService.getUserDashboard(userId);
      console.log('📊 Dashboard store: API response received:', response);
      
      if (response.success && response.data) {
        console.log('✅ Dashboard store: Setting dashboard data:', response.data);
        set({ 
          userDashboard: response.data,
          isLoading: false 
        });
      } else {
        console.error('❌ Dashboard store: API returned error:', response.message);
        set({ 
          error: response.message || 'Failed to fetch user dashboard',
          isLoading: false 
        });
      }
    } catch (error: any) {
      console.error('❌ Dashboard store: Exception occurred:', error);
      set({ 
        error: error.message || 'Network error occurred',
        isLoading: false 
      });
    }
  },
  
  fetchPersonalStats: async (period = '30d') => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await dashboardService.getPersonalStats(period);
      
      if (response.success && response.data) {
        set({ 
          personalStats: response.data,
          isLoading: false 
        });
      } else {
        set({ 
          error: response.message || 'Failed to fetch personal stats',
          isLoading: false 
        });
      }
    } catch (error: any) {
      set({ 
        error: error.message || 'Network error occurred',
        isLoading: false 
      });
    }
  },
  
  fetchActivitySummary: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await dashboardService.getActivitySummary();
      
      if (response.success && response.data) {
        set({ 
          activitySummary: response.data,
          isLoading: false 
        });
      } else {
        set({ 
          error: response.message || 'Failed to fetch activity summary',
          isLoading: false 
        });
      }
    } catch (error: any) {
      set({ 
        error: error.message || 'Network error occurred',
        isLoading: false 
      });
    }
  },
  
  fetchRecommendations: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await dashboardService.getRecommendations();
      
      if (response.success && response.data) {
        set({ 
          recommendations: response.data,
          isLoading: false 
        });
      } else {
        set({ 
          error: response.message || 'Failed to fetch recommendations',
          isLoading: false 
        });
      }
    } catch (error: any) {
      set({ 
        error: error.message || 'Network error occurred',
        isLoading: false 
      });
    }
  }
}));
