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
  
  // Admin dashboard data
  adminOverview: AdminOverview | null;
  adminAnalytics: AdminAnalytics | null;
  
  // Owner dashboard data
  ownerDashboard: OwnerDashboard | null;
  gymAnalytics: { [gymId: number]: GymAnalytics };
  
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
  fetchOwnerDashboard: () => Promise<void>;
  fetchGymAnalytics: (gymId: number) => Promise<void>;
  
  // User methods
  fetchUserDashboard: () => Promise<void>;
  fetchPersonalStats: (period?: string) => Promise<void>;
  fetchActivitySummary: () => Promise<void>;
  fetchRecommendations: () => Promise<void>;
}

export const useDashboardStore = create<DashboardState>()((set, get) => ({
  // Initial state
  isLoading: false,
  error: null,
  
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
    error: null
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
  fetchOwnerDashboard: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await dashboardService.getOwnerDashboard();
      
      if (response.success && response.data) {
        set({ 
          ownerDashboard: response.data,
          isLoading: false 
        });
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
  fetchUserDashboard: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await dashboardService.getUserDashboard();
      
      if (response.success && response.data) {
        set({ 
          userDashboard: response.data,
          isLoading: false 
        });
      } else {
        set({ 
          error: response.message || 'Failed to fetch user dashboard',
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
