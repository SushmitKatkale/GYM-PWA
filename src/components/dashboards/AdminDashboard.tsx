import React, { useEffect, useState } from 'react';
import { 
  Users, Building, TrendingUp, DollarSign, Activity, 
  Server, Database, CreditCard, ArrowUp, ArrowDown,
  RefreshCw, AlertCircle, CheckCircle, Clock,
  UserPlus, Home, Target, BarChart3
} from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
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
  Title,
  Tooltip,
  Legend,
  Filler
);

export function AdminDashboard() {
  const { user } = useAuthStore();
  const { 
    adminOverview,
    adminAnalytics,
    isLoading,
    error,
    fetchAdminOverview,
    fetchAdminAnalytics,
    clearError
  } = useDashboardStore();
  
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchAdminOverview();
      fetchAdminAnalytics(selectedPeriod);
    }
  }, [user, selectedPeriod]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchAdminOverview(),
      fetchAdminAnalytics(selectedPeriod)
    ]);
    setRefreshing(false);
  };

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
    fetchAdminAnalytics(period);
  };

  const getSystemHealthIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getSystemHealthColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  // Chart configuration for analytics
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: '#f3f4f6',
        },
      },
      x: {
        grid: {
          color: '#f3f4f6',
        },
      },
    },
  };

  const userTrendsData = {
    labels: adminAnalytics?.userTrends.map(item => 
      new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    ) || [],
    datasets: [
      {
        label: 'New Users',
        data: adminAnalytics?.userTrends.map(item => item.users) || [],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
      },
    ],
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Dashboard</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => {
              clearError();
              handleRefresh();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">Platform analytics and system overview</p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Period Selector */}
              <select
                value={selectedPeriod}
                onChange={(e) => handlePeriodChange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="365d">Last year</option>
              </select>
              
              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                disabled={refreshing || isLoading}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* Overview Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Users */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {isLoading ? '...' : (adminOverview?.overview.totalUsers?.toLocaleString() || '0')}
                </p>
                <div className="flex items-center mt-2">
                  {adminOverview?.growth.userGrowthPercentage && parseFloat(adminOverview.growth.userGrowthPercentage) > 0 ? (
                    <ArrowUp className="w-4 h-4 text-green-600 mr-1" />
                  ) : (
                    <ArrowDown className="w-4 h-4 text-red-600 mr-1" />
                  )}
                  <span className="text-sm font-medium text-green-600">
                    {adminOverview?.growth.userGrowthPercentage || '0'}% from last month
                  </span>
                </div>
              </div>
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3 rounded-xl">
                <Users className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>

          {/* Active Gyms */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Gyms</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {isLoading ? '...' : (adminOverview?.overview.activeGyms?.toLocaleString() || '0')}
                </p>
                <div className="flex items-center mt-2">
                  {adminOverview?.growth.gymGrowthPercentage && parseFloat(adminOverview.growth.gymGrowthPercentage) > 0 ? (
                    <ArrowUp className="w-4 h-4 text-green-600 mr-1" />
                  ) : (
                    <ArrowDown className="w-4 h-4 text-red-600 mr-1" />
                  )}
                  <span className="text-sm font-medium text-green-600">
                    {adminOverview?.growth.gymGrowthPercentage || '0'}% from last month
                  </span>
                </div>
              </div>
              <div className="bg-gradient-to-r from-green-500 to-green-600 p-3 rounded-xl">
                <Building className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>

          {/* Active Subscriptions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Subscriptions</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {isLoading ? '...' : (adminOverview?.overview.activeSubscriptions?.toLocaleString() || '0')}
                </p>
                <div className="flex items-center mt-2">
                  <ArrowUp className="w-4 h-4 text-green-600 mr-1" />
                  <span className="text-sm font-medium text-green-600">
                    {adminOverview?.growth.newSubscriptionsThisMonth || '0'} new this month
                  </span>
                </div>
              </div>
              <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-3 rounded-xl">
                <CreditCard className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>

          {/* Platform Growth */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Platform Growth</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {isLoading ? '...' : (adminOverview?.overview.platformGrowth || '0%')}
                </p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                  <span className="text-sm font-medium text-green-600">
                    {adminOverview?.growth.newUsersThisYear || '0'} users this year
                  </span>
                </div>
              </div>
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-3 rounded-xl">
                <Target className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts and Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Growth Chart */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
                User Registration Trends
              </h3>
            </div>
            <div className="h-80">
              {!isLoading && adminAnalytics ? (
                <Line data={userTrendsData} options={chartOptions} />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              )}
            </div>
          </div>

          {/* User Type Breakdown */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <Users className="w-5 h-5 mr-2 text-green-600" />
              User Distribution
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                  <span className="font-medium text-gray-700">Regular Users</span>
                </div>
                <span className="text-xl font-bold text-gray-900">
                  {adminAnalytics?.userTypeBreakdown.users || 0}
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  <span className="font-medium text-gray-700">Gym Owners</span>
                </div>
                <span className="text-xl font-bold text-gray-900">
                  {adminAnalytics?.userTypeBreakdown.owners || 0}
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                  <span className="font-medium text-gray-700">Administrators</span>
                </div>
                <span className="text-xl font-bold text-gray-900">
                  {adminAnalytics?.userTypeBreakdown.admins || 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity and System Health */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-indigo-600" />
              Recent Platform Activity
            </h3>
            <div className="space-y-4">
              {adminOverview?.recentActivities && adminOverview.recentActivities.length > 0 ? (
                adminOverview.recentActivities.slice(0, 5).map((activity, index) => (
                  <div key={index} className="flex items-start p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex-shrink-0">
                      {activity.type === 'user_registered' && <UserPlus className="w-5 h-5 text-blue-600 mt-1" />}
                      {activity.type === 'gym_registered' && <Home className="w-5 h-5 text-green-600 mt-1" />}
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No recent activity</p>
                </div>
              )}
            </div>
          </div>

          {/* System Health */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <Server className="w-5 h-5 mr-2 text-emerald-600" />
              System Health Status
            </h3>
            <div className="space-y-6">
              {/* Server Status */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <Server className="w-6 h-6 text-gray-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Server Status</p>
                    <p className="text-sm text-gray-500">
                      Uptime: {adminOverview?.systemHealth.server.uptime || 'N/A'} | 
                      Response: {adminOverview?.systemHealth.server.responseTime || 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  {getSystemHealthIcon(adminOverview?.systemHealth.server.status || 'unknown')}
                  <span className={`ml-2 font-medium capitalize ${getSystemHealthColor(adminOverview?.systemHealth.server.status || 'unknown')}`}>
                    {adminOverview?.systemHealth.server.status || 'Unknown'}
                  </span>
                </div>
              </div>

              {/* Database Status */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <Database className="w-6 h-6 text-gray-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Database</p>
                    <p className="text-sm text-gray-500">
                      Connections: {adminOverview?.systemHealth.database.connections || 'N/A'} | 
                      Query Time: {adminOverview?.systemHealth.database.queryTime || 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  {getSystemHealthIcon(adminOverview?.systemHealth.database.status || 'unknown')}
                  <span className={`ml-2 font-medium capitalize ${getSystemHealthColor(adminOverview?.systemHealth.database.status || 'unknown')}`}>
                    {adminOverview?.systemHealth.database.status || 'Unknown'}
                  </span>
                </div>
              </div>

              {/* Payment Gateway Status */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <CreditCard className="w-6 h-6 text-gray-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Payment Gateway</p>
                    <p className="text-sm text-gray-500">
                      Success Rate: {adminOverview?.systemHealth.paymentGateway.successRate || 'N/A'} | 
                      Avg Process: {adminOverview?.systemHealth.paymentGateway.avgProcessTime || 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  {getSystemHealthIcon(adminOverview?.systemHealth.paymentGateway.status || 'unknown')}
                  <span className={`ml-2 font-medium capitalize ${getSystemHealthColor(adminOverview?.systemHealth.paymentGateway.status || 'unknown')}`}>
                    {adminOverview?.systemHealth.paymentGateway.status || 'Unknown'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}