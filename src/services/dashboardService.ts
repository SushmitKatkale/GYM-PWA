import { apiClient, ApiResponse } from './apiClient';
import { API_CONFIG } from '../config/api';

// Types for dashboard data
export interface AdminOverview {
  overview: {
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    totalGyms: number;
    activeGyms: number;
    inactiveGyms: number;
    activeSubscriptions: number;
    platformGrowth: string;
  };
  growth: {
    newUsersThisMonth: number;
    newGymsThisMonth: number;
    newSubscriptionsThisMonth: number;
    newUsersThisYear: number;
    newGymsThisYear: number;
    userGrowthPercentage: string;
    gymGrowthPercentage: string;
  };
  recentActivities: Activity[];
  systemHealth: SystemHealth;
}

export interface AdminAnalytics {
  userTrends: TrendData[];
  gymTrends: TrendData[];
  revenueTrends: TrendData[];
  userTypeBreakdown: {
    users: number;
    owners: number;
    admins: number;
  };
}

export interface OwnerDashboard {
  overview: {
    totalGyms: number;
    activeMembers: number;
    monthlyRevenue: number;
    todayCheckIns: number;
    averageOccupancy: number;
  };
  gyms: GymInfo[];
  recentActivity: Activity[];
}

export interface UserDashboard {
  user: {
    id: number;
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    profileImage: string;
    gymName: string;
  };
  overview: {
    weeklyWorkouts: number;
    workoutGrowthRate: number;
    totalHours: number;
    hoursThisWeek: number;
    totalCaloriesBurned: number;
    caloriesThisWeek: number;
    currentStreak: number;
    bestStreak: number;
  };
  metrics: {
    steps: number;
    workoutTime: number;
    activeEnergy: number;
    weeklyGoalProgress: number;
  };
  gymDetails: {
    gymName: string;
    activeMembers: number;
    subscription: {
      duration: string;
      gymName: string;
    };
    trainer: {
      name: string;
      schedule: string;
      specialization: string;
    };
  };
  workoutHistory: {
    date: string;
    count: number;
    duration: number;
    calories: number;
  }[];
  goalProgress: {
    completed: number;
    target: number;
  };
  exerciseCollections: {
    id: string;
    title: string;
    subtitle: string;
    exerciseCount: string;
  }[];
  subscriptions: {
    active: number;
    list: string[];
  };
  upcomingBookings: Booking[];
  recentActivity: Activity[];
  quickActions: {
    id: string;
    title: string;
    subtitle: string;
    icon: string;
    color: string;
    action: string;
    target: string;
  }[];
  lastUpdated: string;
  timezone: string;
}

export interface PersonalStats {
  workoutStreak: number;
  totalWorkouts: number;
  caloriesBurned: number;
  averageWorkoutTime: number;
  favoriteWorkoutTime: string;
  achievements: Achievement[];
  weeklyProgress: WeeklyProgress[];
}

export interface ActivitySummary {
  thisWeek: {
    workouts: number;
    duration: number;
    calories: number;
  };
  thisMonth: {
    workouts: number;
    duration: number;
    calories: number;
  };
  recentWorkouts: RecentWorkout[];
}

export interface Recommendations {
  nearbyGyms: NearbyGym[];
  suggestedPlans: SuggestedPlan[];
  workoutTips: WorkoutTip[];
}

export interface GymAnalytics {
  gymInfo: {
    id: number;
    name: string;
    capacity: number;
    currentOccupancy: number;
    occupancyRate: number;
    rating: number;
    activeMembers: number;
  };
  weeklyTrends: WeeklyTrend[];
  popularTimes: PopularTime[];
}

// Supporting interfaces
export interface TrendData {
  date: string;
  users?: number;
  gyms?: number;
  revenue?: number;
}

export interface Activity {
  type: string;
  message: string;
  timestamp: Date | string;
  metadata?: any;
}

export interface SystemHealth {
  server: { status: string; uptime?: string; responseTime?: string };
  database: { status: string; connections?: string; queryTime?: string };
  paymentGateway: { status: string; successRate?: string; avgProcessTime?: string };
}

export interface GymInfo {
  id: number;
  name: string;
  capacity: number;
  currentOccupancy: number;
  occupancyRate: number;
  activeMembers: number;
  rating: number;
}

export interface UserSubscription {
  id: number;
  gymName: string;
  planName: string;
  status: string;
  startDate: string;
  endDate: string;
  price: number;
}

export interface Booking {
  id: number;
  gymName: string;
  sessionType: string;
  date: Date;
  timeSlot: string;
}

export interface Achievement {
  id: number;
  name: string;
  description: string;
  unlocked: boolean;
  icon: string;
}

export interface WeeklyProgress {
  day: string;
  workouts: number;
}

export interface RecentWorkout {
  id: number;
  gymName: string;
  date: Date;
  duration: number;
  type: string;
  calories: number;
}

export interface NearbyGym {
  id: number;
  name: string;
  distance: number;
  rating: number;
  price: string;
  image: string;
}

export interface SuggestedPlan {
  id: number;
  title: string;
  price: number;
  features: string[];
  discount: number;
}

export interface WorkoutTip {
  title: string;
  description: string;
  category: string;
}

export interface WeeklyTrend {
  day: string;
  checkins: number;
}

export interface PopularTime {
  hour: string;
  usage: number;
}

class DashboardService {
  // Admin Dashboard Methods
  async getAdminOverview(): Promise<ApiResponse<AdminOverview>> {
    return apiClient.get<AdminOverview>('/dashboard/admin/overview');
  }

  async getAdminAnalytics(period: string = '30d'): Promise<ApiResponse<AdminAnalytics>> {
    return apiClient.get<AdminAnalytics>(`/dashboard/admin/analytics?period=${period}`);
  }

  // Owner Dashboard Methods
  async getOwnerDashboard(): Promise<ApiResponse<OwnerDashboard>> {
    return apiClient.get<OwnerDashboard>('/dashboard/owner');
  }

  async getGymAnalytics(gymId: number): Promise<ApiResponse<GymAnalytics>> {
    return apiClient.get<GymAnalytics>(`/dashboard/owner/gym/${gymId}/analytics`);
  }

  // User Dashboard Methods
  async getUserDashboard(userId?: number): Promise<ApiResponse<UserDashboard>> {
    // The userId is handled by the JWT token in the backend, so we don't need to pass it in the URL
    console.log('🔄 Fetching user dashboard data...');
    try {
      const response = await apiClient.get<UserDashboard>('/dashboard/user');
      console.log('📊 User dashboard response:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to fetch user dashboard:', error);
      throw error;
    }
  }

  // Quick stats for dashboard refresh
  async getUserQuickStats(): Promise<ApiResponse<{weekly_workouts: number, calories_today: number, hours_this_week: number}>> {
    console.log('⚡ Fetching user quick stats...');
    try {
      const response = await apiClient.get('/dashboard/user/quick-stats');
      console.log('📈 Quick stats response:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to fetch quick stats:', error);
      throw error;
    }
  }

  async getPersonalStats(period: string = '30d'): Promise<ApiResponse<PersonalStats>> {
    return apiClient.get<PersonalStats>(`/dashboard/user/stats?period=${period}`);
  }

  async getActivitySummary(): Promise<ApiResponse<ActivitySummary>> {
    return apiClient.get<ActivitySummary>('/dashboard/user/activity');
  }

  async getRecommendations(): Promise<ApiResponse<Recommendations>> {
    return apiClient.get<Recommendations>('/dashboard/user/recommendations');
  }
}

export const dashboardService = new DashboardService();
