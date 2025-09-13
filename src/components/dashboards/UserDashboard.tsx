import React, { useEffect, useState } from 'react';
import {
  Calendar, Clock, Target, Trophy, BarChart3, Heart,
  Activity, Zap, Award, TrendingUp, CheckCircle,
  RefreshCw, AlertCircle, Play, Pause, MapPin,
  Users, Star, ArrowUp, ArrowDown, Plus, Bell
} from 'lucide-react';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
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
import { paymentService } from '../../services/paymentService';
import { InlinePushNotificationPrompt } from '../features/PushNotificationBanner';
import { ScrollableMetricCards } from '../common/ScrollableMetricCards';
import { ExerciseCollections } from '../common/ExerciseCollections';
import { BodyStatistics } from '../common/BodyStatistics';
import { DailyActivity } from '../common/DailyActivity';

interface UserDashboardProps {
  onNavigateToSettings?: () => void;
  onNavigate?: (view: string) => void;
}

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

export function UserDashboard({ onNavigateToSettings, onNavigate }: UserDashboardProps = {}) {
  const { user } = useAuthStore();
  const {
    userDashboard,
    isLoading,
    error,
    fetchUserDashboard,
    clearError
  } = useDashboardStore();

  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    console.log(user);

    if (user?.role === 'user') {
      fetchUserDashboard(user.id);
    }
  }, [user, fetchUserDashboard]);

  const handleRefresh = async () => {
    if (!user?.id) return;
    setRefreshing(true);
    try {
      await fetchUserDashboard(user.id);
    } finally {
      setRefreshing(false);
    }
  };

  const stats = [
    {
      label: 'Workouts This Week',
      value: userDashboard?.weeklyWorkouts?.toString() || '0',
      change: `+${userDashboard?.workoutGrowthRate || 0}%`,
      icon: Target,
      color: 'bg-purple-500',
      trend: 'up'
    },
    {
      label: 'Total Hours',
      value: `${userDashboard?.totalHours || 0}h`,
      change: `+${userDashboard?.hoursThisWeek || 0}h this week`,
      icon: Clock,
      color: 'bg-blue-500',
      trend: 'up'
    },
    {
      label: 'Calories Burned',
      value: userDashboard?.totalCaloriesBurned?.toLocaleString() || '0',
      change: `+${userDashboard?.caloriesThisWeek || 0} this week`,
      icon: Heart,
      color: 'bg-red-500',
      trend: 'up'
    },
    {
      label: 'Current Streak',
      value: `${userDashboard?.currentStreak || 0} days`,
      change: userDashboard?.currentStreak > (userDashboard?.bestStreak || 0) ? 'New record!' : `Best: ${userDashboard?.bestStreak || 0} days`,
      icon: Trophy,
      color: 'bg-yellow-500',
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

  const workoutProgressData = {
    labels: userDashboard?.workoutHistory?.map(item => item.date) || [],
    datasets: [{
      label: 'Workouts',
      data: userDashboard?.workoutHistory?.map(item => item.count) || [],
      borderColor: 'rgb(147, 51, 234)',
      backgroundColor: 'rgba(147, 51, 234, 0.1)',
      tension: 0.4,
      fill: true,
    }]
  };

  const goalProgressData = {
    labels: ['Completed', 'Remaining'],
    datasets: [{
      data: [
        userDashboard?.goalProgress?.completed || 0,
        (userDashboard?.goalProgress?.target || 0) - (userDashboard?.goalProgress?.completed || 0)
      ],
      backgroundColor: [
        'rgba(34, 197, 94, 0.8)',
        'rgba(229, 231, 235, 0.8)'
      ],
      borderWidth: 0,
    }]
  };

  // if (error) {
  //   return (
  //     <div className="min-h-screen bg-gray-50 p-4">
  //       <div className="max-w-md mx-auto bg-white rounded-lg shadow p-6">
  //         <div className="text-center">
  //           <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
  //           <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Dashboard</h3>
  //           <p className="text-gray-600 mb-4">{error}</p>
  //           <button 
  //             onClick={handleRefresh}
  //             className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
  //           >
  //             Try Again
  //           </button>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* User Info */}

      {user && (
        <div className="">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-purple-100 border border-red-600 rounded-full flex items-center justify-center overflow-hidden mt-[2px]">
                <img src={user.profileImage} alt={user.username} />
              </div>
              <div>
                <h1 className="text-lg font-medium text-gray-900 font-poppins">Hey, {user.username || `${user.firstName || ""} ${user.lastName || ""}`}!</h1>
                <p className="text-xs text-gray-500 font-poppins">Ready for new wins? <span>Crush it!</span></p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="p-4 space-y-6">

        {/* Charts Cards - Scrollable Metric Cards */}
        <ScrollableMetricCards className="" />


        {/* Daily Activity */}
        <DailyActivity className="" />

        {/* Exercise Collections */}
        <ExerciseCollections
          className=""
          onCardClick={(collection) => {
            console.log('Clicked collection:', collection);
            // Navigate to exercises for collections with exercises
            if (collection.id === 'chest-abs-2' || collection.title.includes('exercises')) {
              onNavigate?.('exercises');
            } else if (collection.id === 'chest-abs' || collection.title.includes('Diet Plan')) {
              onNavigate?.('diet-plans');
            }
          }}
        />

        {/* Quick Actions - Always Visible */}
        <div>
          {/* Header */}
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-base font-normal text-gray-900 font-poppins">Quick Actions</h2>
          </div>

          {/* Actions Container */}
          <div className="bg-white rounded-md shadow-sm border border-gray-200 p-4">
            <div className="grid grid-cols-2 gap-3">
              {/* Start Workout */}
              <button className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors group">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-purple-200 transition-colors">
                  <Play className="w-5 h-5 text-purple-600" />
                </div>
                <div className="text-left">
                  <h4 className="font-medium text-gray-900 text-sm">Start Workout</h4>
                  <p className="text-xs text-gray-500">Begin your session</p>
                </div>
              </button>

              {/* Book Class */}
              <button className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors group">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-blue-200 transition-colors">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-left">
                  <h4 className="font-medium text-gray-900 text-sm">Book Class</h4>
                  <p className="text-xs text-gray-500">Schedule a session</p>
                </div>
              </button>

              {/* Set Goal */}
              <button className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors group">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-green-200 transition-colors">
                  <Target className="w-5 h-5 text-green-600" />
                </div>
                <div className="text-left">
                  <h4 className="font-medium text-gray-900 text-sm">Set Goal</h4>
                  <p className="text-xs text-gray-500">Define targets</p>
                </div>
              </button>

              {/* Challenges */}
              <button className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors group">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-orange-200 transition-colors">
                  <Trophy className="w-5 h-5 text-orange-600" />
                </div>
                <div className="text-left">
                  <h4 className="font-medium text-gray-900 text-sm">Challenges</h4>
                  <p className="text-xs text-gray-500">Join competitions</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
