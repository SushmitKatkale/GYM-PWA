import React, { useEffect, useState } from 'react';
import { 
  Building, Users, Calendar, TrendingUp, Clock, DollarSign, 
  ArrowUp, ArrowDown, RefreshCw, AlertCircle, Star,
  MapPin, Phone, Mail, Plus, BarChart3, PieChart,
  Activity, Target, Zap
} from 'lucide-react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { useDashboardStore } from '../../stores/dashboardStore';
import { useAuthStore } from '../../stores/authStore';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export function OwnerDashboard() {
  const { user } = useAuthStore();
  const { 
    ownerDashboard,
    gymAnalytics,
    isLoading,
    error,
    fetchOwnerDashboard,
    fetchGymAnalytics,
    clearError
  } = useDashboardStore();
  
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedGym, setSelectedGym] = useState<number | null>(null);

  useEffect(() => {
    if (user?.role === 'owner') {
      fetchOwnerDashboard(user.id);
    }
  }, [user, fetchOwnerDashboard]);

  const handleRefresh = async () => {
    if (!user?.id) return;
    setRefreshing(true);
    try {
      await fetchOwnerDashboard(user.id);
    } finally {
      setRefreshing(false);
    }
  };

  const handleGymSelect = async (gymId: number) => {
    setSelectedGym(gymId);
    await fetchGymAnalytics(gymId);
  };

  const stats = [
    { 
      label: 'Total Gyms', 
      value: ownerDashboard?.totalGyms?.toString() || '0', 
      change: '+2 this month', 
      icon: Building, 
      color: 'bg-blue-500',
      trend: 'up'
    },
    { 
      label: 'Active Members', 
      value: ownerDashboard?.totalActiveMembers?.toString() || '0', 
      change: `+${ownerDashboard?.memberGrowthRate || 0}%`, 
      icon: Users, 
      color: 'bg-green-500',
      trend: 'up'
    },
    { 
      label: 'Monthly Revenue', 
      value: `$${ownerDashboard?.totalMonthlyRevenue?.toLocaleString() || '0'}`, 
      change: `+${ownerDashboard?.revenueGrowthRate || 0}%`, 
      icon: DollarSign, 
      color: 'bg-yellow-500',
      trend: 'up'
    },
    { 
      label: 'Avg. Occupancy', 
      value: `${ownerDashboard?.averageOccupancyRate || 0}%`, 
      change: `+${ownerDashboard?.occupancyChange || 0}%`, 
      icon: Activity, 
      color: 'bg-purple-500',
      trend: 'up'
    }
  ];

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          boxWidth: 6,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
    },
  };

  const memberGrowthData = {
    labels: ownerDashboard?.memberGrowthTrend?.map(item => item.period) || [],
    datasets: [{
      label: 'Active Members',
      data: ownerDashboard?.memberGrowthTrend?.map(item => item.count) || [],
      borderColor: 'rgb(34, 197, 94)',
      backgroundColor: 'rgba(34, 197, 94, 0.1)',
      tension: 0.4,
      fill: true,
    }]
  };

  const revenueData = {
    labels: ownerDashboard?.revenueTrend?.map(item => item.period) || [],
    datasets: [{
      label: 'Revenue ($)',
      data: ownerDashboard?.revenueTrend?.map(item => item.amount) || [],
      backgroundColor: 'rgba(59, 130, 246, 0.6)',
      borderColor: 'rgb(59, 130, 246)',
      borderWidth: 1,
    }]
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow p-6">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Dashboard</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={handleRefresh}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile-First Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Owner Dashboard</h1>
              <p className="text-sm text-gray-600">Welcome back, {user?.firstName || 'Owner'}!</p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing || isLoading}
              className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'overview'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('gyms')}
              className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'gyms'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              My Gyms
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'analytics'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Analytics
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
        {isLoading && !ownerDashboard ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your dashboard...</p>
          </div>
        ) : (
          <>
            {activeTab === 'overview' && (
              <>
                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-4">
                  {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                      <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className={`${stat.color} p-2 rounded-lg`}>
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          {stat.trend === 'up' ? (
                            <ArrowUp className="w-4 h-4 text-green-500" />
                          ) : (
                            <ArrowDown className="w-4 h-4 text-red-500" />
                          )}
                        </div>
                        <p className="text-xs font-medium text-gray-600 uppercase tracking-wider">{stat.label}</p>
                        <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                        <p className="text-xs text-green-600">{stat.change}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Member Growth Chart */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Member Growth Trend</h3>
                  <div className="h-64">
                    <Line data={memberGrowthData} options={chartOptions} />
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    {ownerDashboard?.recentActivities?.slice(0, 5).map((activity, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <Activity className="w-4 h-4 text-blue-600" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                          <p className="text-xs text-gray-500">{activity.timestamp}</p>
                        </div>
                      </div>
                    )) || (
                      <div className="text-center py-8">
                        <Activity className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500 text-sm">No recent activity</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {activeTab === 'gyms' && (
              <>
                {/* Gym List */}
                <div className="space-y-4">
                  {ownerDashboard?.gyms?.map((gym) => (
                    <div key={gym.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                            <Building className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{gym.name}</h3>
                            <p className="text-sm text-gray-500 flex items-center">
                              <MapPin className="w-3 h-3 mr-1" />
                              {gym.address}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleGymSelect(gym.id)}
                          className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                        >
                          View Details
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-lg font-semibold text-gray-900">{gym.activeMembers}</p>
                          <p className="text-xs text-gray-500">Members</p>
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-gray-900">{gym.occupancyRate}%</p>
                          <p className="text-xs text-gray-500">Occupancy</p>
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-gray-900">${gym.monthlyRevenue}</p>
                          <p className="text-xs text-gray-500">Revenue</p>
                        </div>
                      </div>
                      
                      {/* Status indicator */}
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${
                              gym.status === 'active' ? 'bg-green-500' : 
                              gym.status === 'maintenance' ? 'bg-yellow-500' : 'bg-red-500'
                            }`}></div>
                            <span className="text-sm text-gray-600 capitalize">{gym.status}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span className="text-sm text-gray-600">{gym.rating}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )) || (
                    <div className="text-center py-12">
                      <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Gyms Found</h3>
                      <p className="text-gray-500 mb-4">You haven't registered any gyms yet.</p>
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        <Plus className="w-4 h-4 inline mr-2" />
                        Add Your First Gym
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}

            {activeTab === 'analytics' && (
              <>
                {/* Revenue Chart */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
                  <div className="h-64">
                    <Bar data={revenueData} options={chartOptions} />
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Peak Hours</h4>
                    <div className="space-y-2">
                      {ownerDashboard?.peakHours?.map((hour, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">{hour.time}</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${hour.percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-gray-900">{hour.percentage}%</span>
                          </div>
                        </div>
                      )) || (
                        <p className="text-gray-500 text-sm">No data available</p>
                      )}
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Member Retention</h4>
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-3">
                        <span className="text-2xl font-bold text-green-600">
                          {ownerDashboard?.retentionRate || 0}%
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">Average retention rate across all gyms</p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Quick Actions - Always Visible */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <button className="flex flex-col items-center justify-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                  <Calendar className="w-6 h-6 text-blue-600 mb-2" />
                  <span className="text-blue-600 font-medium text-sm">Schedule Class</span>
                </button>
                <button className="flex flex-col items-center justify-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                  <Users className="w-6 h-6 text-green-600 mb-2" />
                  <span className="text-green-600 font-medium text-sm">Add Member</span>
                </button>
                <button className="flex flex-col items-center justify-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
                  <BarChart3 className="w-6 h-6 text-purple-600 mb-2" />
                  <span className="text-purple-600 font-medium text-sm">View Reports</span>
                </button>
                <button className="flex flex-col items-center justify-center p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors">
                  <Plus className="w-6 h-6 text-yellow-600 mb-2" />
                  <span className="text-yellow-600 font-medium text-sm">Add Gym</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}