import React, { useEffect, useState } from 'react';
import { 
  Building, Users, Calendar, TrendingUp, Clock, 
  ArrowUp, ArrowDown, RefreshCw, AlertCircle, Star,
  MapPin, Phone, Mail, Plus, BarChart3, PieChart,
  Activity, Target, Zap, IndianRupee, Eye, Settings
} from 'lucide-react';
import { useDashboardStore } from '../../stores/dashboardStore';
import { useAuthStore } from '../../stores/authStore';
import { ScrollableMetricCards } from '../common/ScrollableMetricCards';
import { 
  DevelopmentErrorDisplay, 
  createApiError, 
  useDevelopmentErrors, 
  shouldShowErrors 
} from '../../utils/developmentError';

interface OwnerDashboardMobileProps {
  onNavigate?: (view: string) => void;
}

export function OwnerDashboardMobile({ onNavigate }: OwnerDashboardMobileProps) {
  const { user } = useAuthStore();
  const { 
    ownerDashboard,
    isLoading,
    error,
    fetchOwnerDashboard,
    clearError
  } = useDashboardStore();
  
  const [refreshing, setRefreshing] = useState(false);
  const { errors: devErrors, addError: addDevError, clearErrors: clearDevErrors } = useDevelopmentErrors();
  
  // Fallback data when API fails - no mock data, just empty structure
  const fallbackOwnerDashboard = {
    totalActiveMembers: 0,
    totalMonthlyRevenue: 0,
    averageOccupancyRate: 0,
    todayCheckIns: 0,
    revenueGrowthRate: 0,
    gym: null,
    last7DaysData: {
      members: [0, 0, 0, 0, 0, 0, 0],
      revenue: [0, 0, 0, 0, 0, 0, 0],
      checkIns: [0, 0, 0, 0, 0, 0, 0],
      occupancy: [0, 0, 0, 0, 0, 0, 0],
      dates: []
    },
    recentActivity: []
  };

  useEffect(() => {
    // Only fetch if we don't have dashboard data and user is owner
    if (user?.role === 'owner' && user.id && !ownerDashboard && !isLoading) {
      fetchOwnerDashboard(user.id);
    }
  }, [user?.role, user?.id, ownerDashboard, isLoading, fetchOwnerDashboard]);

  const handleRefresh = async () => {
    if (!user?.id) return;
    setRefreshing(true);
    clearDevErrors(); // Clear previous dev errors
    try {
      await fetchOwnerDashboard(user.id);
    } catch (err) {
      // Log API error for development
      const apiError = createApiError(
        `/api/owner/${user.id}/dashboard`,
        'GET',
        err
      );
      addDevError(apiError);
    } finally {
      setRefreshing(false);
    }
  };

  // Use fallback data when API fails or no data available
  const dashboardData = ownerDashboard || fallbackOwnerDashboard;
  
  // Transform owner data into metric cards format
  const ownerMetrics = {
    steps: dashboardData?.totalActiveMembers || 0,
    workoutTime: dashboardData?.gym?.capacity || 0,
    activeEnergy: Math.round(dashboardData?.totalMonthlyRevenue || 0),
    weeklyGoalProgress: dashboardData?.averageOccupancyRate || 0
  };


  // Custom metrics for owner with real historical chart data from API
  const ownerMetricsConfig = [
    {
      id: 'members',
      title: 'Active Members',
      value: dashboardData?.totalActiveMembers >= 1000 ? 
        (dashboardData.totalActiveMembers / 1000).toFixed(1) : 
        dashboardData?.totalActiveMembers?.toString() || '0',
      unit: dashboardData?.totalActiveMembers >= 1000 ? 'k' : '',
      icon: Users,
      color: 'blue',
      bgColor: 'bg-white',
      chartData: dashboardData?.last7DaysData?.members || [0, 0, 0, 0, 0, 0, 0]
    },
    {
      id: 'checkins',
      title: 'Daily Check-ins',
      value: dashboardData?.todayCheckIns?.toString() || '0',
      unit: '',
      icon: Activity,
      color: 'green',
      bgColor: 'bg-white',
      chartData: dashboardData?.last7DaysData?.checkIns || [0, 0, 0, 0, 0, 0, 0]
    },
    {
      id: 'revenue',
      title: 'Daily Revenue',
      value: dashboardData?.totalMonthlyRevenue >= 10000 ? 
        `${(dashboardData.totalMonthlyRevenue / 1000).toFixed(0)}k` : 
        dashboardData?.totalMonthlyRevenue?.toString() || '0',
      unit: '₹',
      icon: IndianRupee,
      color: 'amber',
      bgColor: 'bg-white',
      chartData: dashboardData?.last7DaysData?.revenue || [0, 0, 0, 0, 0, 0, 0]
    },
    {
      id: 'occupancy',
      title: 'Occupancy Rate',
      value: Math.round(dashboardData?.averageOccupancyRate || 0),
      unit: '%',
      icon: Building,
      color: 'purple',
      bgColor: 'bg-white',
      chartData: dashboardData?.last7DaysData?.occupancy || [0, 0, 0, 0, 0, 0, 0]
    }
  ];

  // In development, show API errors for debugging
  // In production, show available data gracefully

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Owner Info */}
      {user && (
        <div className="">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 border border-blue-600 rounded-full flex items-center justify-center overflow-hidden mt-[2px]">
                  {user?.profileImage ? (
                    <img src={user.profileImage} alt={user.username} className='object-cover h-full w-full' />
                  ) : (
                    <span className="text-blue-600 font-semibold text-lg">
                      {(user?.username || user?.firstName || 'O')[0].toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <h1 className="text-lg font-medium text-gray-900 font-poppins">Hey, {user?.username || `${user?.firstName || ""} ${user?.lastName || ""}`}!</h1>
                  <p className="text-xs text-gray-500 font-poppins">Ready to manage your business? <span>Let's grow!</span></p>
                </div>
              </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing || isLoading}
              className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      )}

      <div className="p-4 space-y-6">
        {/* Development Error Display */}
        {shouldShowErrors() && devErrors.length > 0 && (
          <div className="space-y-2">
            {devErrors.map((devError, index) => (
              <DevelopmentErrorDisplay
                key={index}
                error={devError}
                onRetry={handleRefresh}
                onDismiss={() => clearDevErrors()}
              />
            ))}
          </div>
        )}
        
        {isLoading && !ownerDashboard ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your business dashboard...</p>
          </div>
        ) : (
          <>
            {/* Business Metrics */}
            <ScrollableMetricCards 
              className="" 
              metrics={ownerMetricsConfig}
            />

            {/* Business Summary */}
            <div>
              <div className="flex items-center justify-between mb-3 px-1">
                <h2 className="text-base font-normal text-gray-900 font-poppins">Business Overview</h2>
                <button 
                  onClick={() => onNavigate?.('analytics')}
                  className="text-sm text-blue-600 font-medium"
                >
                  View All
                </button>
              </div>

              <div className="bg-white rounded-md shadow-sm border border-gray-200 p-4">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{dashboardData?.gym?.capacity || 0}</div>
                    <div className="text-sm text-gray-500">Gym Capacity</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{dashboardData?.totalActiveMembers || 0}</div>
                    <div className="text-sm text-gray-500">Active Members</div>
                  </div>
                </div>
                
                <div className="pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-gray-500">This Month's Revenue</div>
                      <div className="text-lg font-semibold text-gray-900">₹{dashboardData?.totalMonthlyRevenue?.toLocaleString() || '0'}</div>
                    </div>
                    <div className="flex items-center space-x-1 text-green-600">
                      <ArrowUp className="w-4 h-4" />
                      <span className="text-sm font-medium">+{dashboardData?.revenueGrowthRate || 0}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* My Gym Overview */}
            <div>
              <div className="flex items-center justify-between mb-3 px-1">
                <h2 className="text-base font-normal text-gray-900 font-poppins">My Gym</h2>
                <button 
                  onClick={() => onNavigate?.('owner-gyms')}
                  className="text-sm text-blue-600 font-medium"
                >
                  Manage
                </button>
              </div>

              <div>
                {dashboardData?.gym ? (
                  <div className="bg-white rounded-md shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                          <Building className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{dashboardData.gym.name}</h3>
                          <p className="text-xs text-gray-500 flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            {dashboardData.gym.address}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => onNavigate?.('owner-gyms')}
                        className="p-2 hover:bg-gray-50 rounded-full"
                      >
                        <Settings className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{dashboardData.gym.activeMembers || 0}</p>
                        <p className="text-xs text-gray-500">Members</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{dashboardData.gym.occupancyRate || 0}%</p>
                        <p className="text-xs text-gray-500">Occupancy</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">₹{dashboardData.gym.monthlyRevenue?.toLocaleString() || 0}</p>
                        <p className="text-xs text-gray-500">Revenue</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 bg-white rounded-md shadow-sm border border-gray-200">
                    <Building className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">No gym registered</p>
                    <button 
                      onClick={() => onNavigate?.('owner-gyms')}
                      className="text-blue-600 text-sm font-medium mt-1"
                    >
                      Register Your Gym
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <div className="flex items-center justify-between mb-3 px-1">
                <h2 className="text-base font-normal text-gray-900 font-poppins">Quick Actions</h2>
              </div>

              <div className="bg-white rounded-md shadow-sm border border-gray-200 p-4">
                <div className="grid grid-cols-2 gap-3">
                  {/* Manage Gym */}
                  <button 
                    onClick={() => onNavigate?.('owner-gyms')} 
                    className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors group"
                  >
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-blue-200 transition-colors">
                      <Building className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="text-left">
                      <h4 className="font-medium text-gray-900 text-sm">Manage Gym</h4>
                      <p className="text-xs text-gray-500">Settings & details</p>
                    </div>
                  </button>

                  {/* View Members */}
                  <button 
                    onClick={() => onNavigate?.('owner-trainers')} 
                    className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors group"
                  >
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-green-200 transition-colors">
                      <Users className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="text-left">
                      <h4 className="font-medium text-gray-900 text-sm">Trainers</h4>
                      <p className="text-xs text-gray-500">Manage staff</p>
                    </div>
                  </button>

                  {/* Check-in QR */}
                  <button 
                    onClick={() => onNavigate?.('owner-checkin')} 
                    className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors group"
                  >
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-purple-200 transition-colors">
                      <Activity className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="text-left">
                      <h4 className="font-medium text-gray-900 text-sm">Check-in</h4>
                      <p className="text-xs text-gray-500">QR codes & reports</p>
                    </div>
                  </button>

                  {/* Wallet */}
                  <button 
                    onClick={() => onNavigate?.('owner-wallet')} 
                    className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors group"
                  >
                    <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-amber-200 transition-colors">
                      <IndianRupee className="w-5 h-5 text-amber-600" />
                    </div>
                    <div className="text-left">
                      <h4 className="font-medium text-gray-900 text-sm">Wallet</h4>
                      <p className="text-xs text-gray-500">Earnings & payouts</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}