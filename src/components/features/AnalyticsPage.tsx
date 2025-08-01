import React, { useState, useEffect, useRef } from 'react';
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
import { TrendingUp, Users, CreditCard, Calendar, Download, Filter, ChevronDown, BarChart3, DollarSign, UserCheck } from 'lucide-react';
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
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false);
  const [showMetricDropdown, setShowMetricDropdown] = useState(false);
  const periodDropdownRef = useRef<HTMLDivElement>(null);
  const metricDropdownRef = useRef<HTMLDivElement>(null);

  // Handle outside clicks to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (periodDropdownRef.current && !periodDropdownRef.current.contains(event.target as Node)) {
        setShowPeriodDropdown(false);
      }
      if (metricDropdownRef.current && !metricDropdownRef.current.contains(event.target as Node)) {
        setShowMetricDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    <div className="space-y-4 md:space-y-6 px-4 md:px-6 max-w-full mx-auto">
      {/* Mobile-First Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="space-y-4">
          {/* Period Filter */}
          <div ref={periodDropdownRef}>
            <label className="block text-sm font-medium text-gray-700 mb-2">Time Period</label>
            <div className="relative">
              <button
                onClick={() => setShowPeriodDropdown(!showPeriodDropdown)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base bg-white text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span>
                    {selectedPeriod === '7d' && 'Last 7 Days'}
                    {selectedPeriod === '30d' && 'Last 30 Days'}
                    {selectedPeriod === '90d' && 'Last 90 Days'}
                    {selectedPeriod === '1y' && 'Last Year'}
                  </span>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${showPeriodDropdown ? 'rotate-180' : ''}`} />
              </button>
              
              {showPeriodDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
                  {[
                    { value: '7d', label: 'Last 7 Days' },
                    { value: '30d', label: 'Last 30 Days' },
                    { value: '90d', label: 'Last 90 Days' },
                    { value: '1y', label: 'Last Year' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSelectedPeriod(option.value as any);
                        setShowPeriodDropdown(false);
                      }}
                      className={`w-full px-3 py-2 text-left hover:bg-blue-50 flex items-center space-x-2 first:rounded-t-lg last:rounded-b-lg transition-colors ${
                        selectedPeriod === option.value ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                      }`}
                    >
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>{option.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Metric Filter */}
          <div ref={metricDropdownRef}>
            <label className="block text-sm font-medium text-gray-700 mb-2">View</label>
            <div className="relative">
              <button
                onClick={() => setShowMetricDropdown(!showMetricDropdown)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base bg-white text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4 text-gray-500" />
                  <span>
                    {selectedMetric === 'attendance' && '📊 Attendance'}
                    {selectedMetric === 'revenue' && '💰 Revenue'}
                    {selectedMetric === 'users' && '👥 Users'}
                  </span>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${showMetricDropdown ? 'rotate-180' : ''}`} />
              </button>
              
              {showMetricDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
                  {[
                    { value: 'attendance', label: '📊 Attendance' },
                    { value: 'revenue', label: '💰 Revenue' },
                    { value: 'users', label: '👥 Users' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSelectedMetric(option.value as any);
                        setShowMetricDropdown(false);
                      }}
                      className={`w-full px-3 py-2 text-left hover:bg-blue-50 flex items-center space-x-2 first:rounded-t-lg last:rounded-b-lg transition-colors ${
                        selectedMetric === option.value ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                      }`}
                    >
                      <BarChart3 className="w-4 h-4 text-gray-400" />
                      <span>{option.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Export Button - Mobile Friendly */}
          <button
            onClick={exportData}
            className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg transition-colors font-medium"
          >
            <Download className="w-4 h-4" />
            <span>Export Data</span>
          </button>
        </div>
      </div>

      {/* Mobile-First KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="text-center">
            <div className="bg-green-100 w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center mx-auto mb-2">
              <CreditCard className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
            </div>
            <p className="text-xs text-gray-600 mb-1">Revenue</p>
            <p className="text-lg md:text-2xl font-bold text-gray-900">${(analyticsData.totalRevenue / 1000).toFixed(0)}k</p>
            <p className="text-xs text-green-600">+{analyticsData.monthlyGrowth}%</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="text-center">
            <div className="bg-blue-100 w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center mx-auto mb-2">
              <Users className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
            </div>
            <p className="text-xs text-gray-600 mb-1">Users</p>
            <p className="text-lg md:text-2xl font-bold text-gray-900">{(analyticsData.totalUsers / 1000).toFixed(1)}k</p>
            <p className="text-xs text-blue-600">Active</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="text-center">
            <div className="bg-purple-100 w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center mx-auto mb-2">
              <Calendar className="w-5 h-5 md:w-6 md:h-6 text-purple-600" />
            </div>
            <p className="text-xs text-gray-600 mb-1">Sessions</p>
            <p className="text-lg md:text-2xl font-bold text-gray-900">{(analyticsData.totalSessions / 1000).toFixed(1)}k</p>
            <p className="text-xs text-purple-600">Monthly</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="text-center">
            <div className="bg-orange-100 w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center mx-auto mb-2">
              <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-orange-600" />
            </div>
            <p className="text-xs text-gray-600 mb-1">Avg Time</p>
            <p className="text-lg md:text-2xl font-bold text-gray-900">{analyticsData.averageSessionDuration}m</p>
            <p className="text-xs text-orange-600">Duration</p>
          </div>
        </div>
      </div>

      {/* Mobile-First Charts */}
      <div className="space-y-4">
        {/* Main Trend Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-4">📈 Weekly Trend</h3>
          <div className="h-64 md:h-80">
            <Line data={attendanceChartData} options={{
              ...chartOptions,
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: false
                }
              },
              scales: {
                x: {
                  ticks: {
                    font: {
                      size: 12
                    }
                  }
                },
                y: {
                  ticks: {
                    font: {
                      size: 12
                    }
                  }
                }
              }
            }} />
          </div>
        </div>

        {/* Popular Times - Mobile Optimized */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-4">🕒 Peak Hours</h3>
          <div className="space-y-2">
            {analyticsData.popularTimes.map((time, index) => (
              <div key={time.hour} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">{time.hour}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full" 
                      style={{ width: `${(time.sessions / 203) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-8">{time.sessions}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gym Performance - Mobile List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-4">🏢 Gym Performance</h3>
          <div className="space-y-3">
            {analyticsData.gymPerformance.map((gym, index) => (
              <div key={gym.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 text-sm">{gym.name}</p>
                  <p className="text-xs text-gray-600">{gym.members} members</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900 text-sm">{gym.sessions}</p>
                  <p className="text-xs text-green-600">${gym.revenue.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Weekly Summary - Mobile Cards */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-4">📅 This Week</h3>
        <div className="grid grid-cols-1 gap-3">
          {analyticsData.weeklyTrend.map((day, index) => (
            <div key={day.day} className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-white">{day.day[0]}</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">{day.day}</p>
                  <p className="text-xs text-gray-600">{day.sessions} sessions</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-green-600 text-sm">${day.revenue}</p>
                <p className="text-xs text-gray-500">revenue</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

