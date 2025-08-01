import React, { useState } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { TrendingUp, Users, CreditCard, Calendar, Download, Filter } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useAuthStore } from '../../stores/authStore';
import { useAttendanceStore } from '../../stores/attendanceStore';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export function AnalyticsPage() {
  const { user } = useAuthStore();
  const { gyms } = useApp();
  const { getAllAttendance } = useAttendanceStore();
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [selectedMetric, setSelectedMetric] = useState<'attendance' | 'revenue' | 'users'>('attendance');

  // Mock analytics data
  const analyticsData = {
    totalRevenue: 45680,
    totalUsers: 1250,
    totalSessions: 3420,
    averageSessionDuration: 75,
    monthlyGrowth: 12.5,
    popularTimes: [
      { hour: '6:00', sessions: 45 },
      { hour: '7:00', sessions: 78 },
      { hour: '8:00', sessions: 92 },
      { hour: '17:00', sessions: 156 },
      { hour: '18:00', sessions: 203 },
      { hour: '19:00', sessions: 187 },
      { hour: '20:00', sessions: 134 },
      { hour: '21:00', sessions: 89 }
    ],
    gymPerformance: gyms.map(gym => ({
      name: gym.name,
      sessions: Math.floor(Math.random() * 500) + 100,
      revenue: Math.floor(Math.random() * 10000) + 2000,
      members: Math.floor(Math.random() * 200) + 50
    })),
    weeklyTrend: [
      { day: 'Mon', sessions: 124, revenue: 2480 },
      { day: 'Tue', sessions: 156, revenue: 3120 },
      { day: 'Wed', sessions: 189, revenue: 3780 },
      { day: 'Thu', sessions: 203, revenue: 4060 },
      { day: 'Fri', sessions: 178, revenue: 3560 },
      { day: 'Sat', sessions: 234, revenue: 4680 },
      { day: 'Sun', sessions: 198, revenue: 3960 }
    ]
  };

  // Chart configurations
  const attendanceChartData = {
    labels: analyticsData.weeklyTrend.map(item => item.day),
    datasets: [
      {
        label: 'Daily Sessions',
        data: analyticsData.weeklyTrend.map(item => item.sessions),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const revenueChartData = {
    labels: analyticsData.weeklyTrend.map(item => item.day),
    datasets: [
      {
        label: 'Daily Revenue ($)',
        data: analyticsData.weeklyTrend.map(item => item.revenue),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 1,
      },
    ],
  };

  const gymPerformanceData = {
    labels: analyticsData.gymPerformance.map(gym => gym.name),
    datasets: [
      {
        data: analyticsData.gymPerformance.map(gym => gym.sessions),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40'
        ],
        borderWidth: 0,
      },
    ],
  };

  const popularTimesData = {
    labels: analyticsData.popularTimes.map(item => item.hour),
    datasets: [
      {
        label: 'Sessions',
        data: analyticsData.popularTimes.map(item => item.sessions),
        backgroundColor: 'rgba(168, 85, 247, 0.8)',
        borderColor: 'rgb(168, 85, 247)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
  };

  const exportData = () => {
    // Simulate data export
    console.log('Exporting analytics data...');
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Analytics & Reports</h1>
        <p className="text-gray-600 mt-2">Comprehensive insights into your gym performance</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Filter className="w-5 h-5 text-gray-400" />
            <div className="flex space-x-4">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
                <option value="1y">Last Year</option>
              </select>
              <select
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="attendance">Attendance</option>
                <option value="revenue">Revenue</option>
                <option value="users">Users</option>
              </select>
            </div>
          </div>
          <button
            onClick={exportData}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export Data</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-3xl font-bold text-gray-900">${analyticsData.totalRevenue.toLocaleString()}</p>
              <p className="text-sm text-green-600 mt-1">+{analyticsData.monthlyGrowth}% from last month</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <CreditCard className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-3xl font-bold text-gray-900">{analyticsData.totalUsers.toLocaleString()}</p>
              <p className="text-sm text-blue-600 mt-1">Active members</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Sessions</p>
              <p className="text-3xl font-bold text-gray-900">{analyticsData.totalSessions.toLocaleString()}</p>
              <p className="text-sm text-purple-600 mt-1">This month</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Session</p>
              <p className="text-3xl font-bold text-gray-900">{analyticsData.averageSessionDuration}min</p>
              <p className="text-sm text-orange-600 mt-1">Average duration</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Trend */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Attendance Trend</h3>
          <Line data={attendanceChartData} options={chartOptions} />
        </div>

        {/* Revenue Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Revenue</h3>
          <Bar data={revenueChartData} options={chartOptions} />
        </div>

        {/* Popular Times */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Workout Times</h3>
          <Bar data={popularTimesData} options={chartOptions} />
        </div>

        {/* Gym Performance */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Gym Performance Distribution</h3>
          <div className="flex justify-center">
            <div className="w-80 h-80">
              <Doughnut data={gymPerformanceData} options={chartOptions} />
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Performance Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Gym Performance Details</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="px-6 py-3">Gym Name</th>
                <th className="px-6 py-3">Sessions</th>
                <th className="px-6 py-3">Revenue</th>
                <th className="px-6 py-3">Members</th>
                <th className="px-6 py-3">Avg Session Duration</th>
              </tr>
            </thead>
            <tbody>
              {analyticsData.gymPerformance.map((gym, index) => (
                <tr key={index} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{gym.name}</td>
                  <td className="px-6 py-4">{gym.sessions.toLocaleString()}</td>
                  <td className="px-6 py-4">${gym.revenue.toLocaleString()}</td>
                  <td className="px-6 py-4">{gym.members}</td>
                  <td className="px-6 py-4">{Math.floor(Math.random() * 30) + 60} min</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

