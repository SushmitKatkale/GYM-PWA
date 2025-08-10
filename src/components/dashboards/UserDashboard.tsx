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

interface UserDashboardProps {
  onNavigateToSettings?: () => void;
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

export function UserDashboard({ onNavigateToSettings }: UserDashboardProps = {}) {
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
              <h1 className="text-xl font-bold text-gray-900">FItEspero Dashboard</h1>
              <p className="text-sm text-gray-600">Keep up the great work, {user?.firstName || 'User'}!</p>
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-600 hover:text-gray-900">
                <Bell className="w-5 h-5" />
              </button>
              <button
                onClick={handleRefresh}
                disabled={refreshing || isLoading}
                className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50"
              >
                <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'overview'
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('workouts')}
              className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'workouts'
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Workouts
            </button>
            <button
              onClick={() => setActiveTab('goals')}
              className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'goals'
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Goals
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
        {/* Push Notification Prompt */}
        <InlinePushNotificationPrompt onNavigateToSettings={onNavigateToSettings} />
        
        {isLoading && !userDashboard ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your FItEspero dashboard...</p>
          </div>
        ) : (
          <>
            {activeTab === 'overview' && (
              <>
                {/* Key Stats */}
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

                {/* Today's Progress */}
                {userDashboard?.todaysProgress && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Progress</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Workout Goal</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-purple-600 h-2 rounded-full" 
                              style={{ width: `${(userDashboard.todaysProgress.workouts / userDashboard.todaysProgress.workoutGoal) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            {userDashboard.todaysProgress.workouts}/{userDashboard.todaysProgress.workoutGoal}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Calories</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-red-600 h-2 rounded-full" 
                              style={{ width: `${(userDashboard.todaysProgress.calories / userDashboard.todaysProgress.calorieGoal) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            {userDashboard.todaysProgress.calories}/{userDashboard.todaysProgress.calorieGoal}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Upcoming Classes */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Classes</h3>
                  <div className="space-y-3">
                    {userDashboard?.upcomingClasses?.slice(0, 3).map((classItem, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                            <Activity className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{classItem.name}</p>
                            <p className="text-sm text-gray-500">{classItem.instructor} • {classItem.time}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`text-xs px-2 py-1 rounded ${
                            classItem.status === 'booked' 
                              ? 'bg-green-100 text-green-600' 
                              : classItem.spotsLeft > 0
                              ? 'bg-blue-100 text-blue-600'
                              : 'bg-red-100 text-red-600'
                          }`}>
                            {classItem.status === 'booked' ? 'Booked' : 
                             classItem.spotsLeft > 0 ? `${classItem.spotsLeft} spots` : 'Full'}
                          </span>
                        </div>
                      </div>
                    )) || (
                      <div className="text-center py-8">
                        <Calendar className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500 text-sm">No upcoming classes</p>
                        <button className="mt-2 text-purple-600 text-sm font-medium">Browse Classes</button>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {activeTab === 'workouts' && (
              <>
                {/* Workout Progress Chart */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Workout Trend</h3>
                  <div className="h-64">
                    <Line data={workoutProgressData} options={chartOptions} />
                  </div>
                </div>

                {/* Recent Workouts */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Workouts</h3>
                  <div className="space-y-3">
                    {userDashboard?.recentWorkouts?.map((workout, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            workout.type === 'cardio' ? 'bg-red-100' :
                            workout.type === 'strength' ? 'bg-blue-100' :
                            'bg-green-100'
                          }`}>
                            {workout.type === 'cardio' ? <Heart className="w-5 h-5 text-red-600" /> :
                             workout.type === 'strength' ? <Target className="w-5 h-5 text-blue-600" /> :
                             <Activity className="w-5 h-5 text-green-600" />}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{workout.name}</p>
                            <p className="text-sm text-gray-500">{workout.duration}min • {workout.calories} cal</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">{workout.date}</p>
                          <div className="flex items-center space-x-1">
                            <Star className="w-3 h-3 text-yellow-500 fill-current" />
                            <span className="text-xs text-gray-600">{workout.rating}</span>
                          </div>
                        </div>
                      </div>
                    )) || (
                      <div className="text-center py-8">
                        <Target className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500 text-sm">No workouts yet</p>
                        <button className="mt-2 text-purple-600 text-sm font-medium">Start Your First Workout</button>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {activeTab === 'goals' && (
              <>
                {/* Goal Progress */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Goal Progress</h3>
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-32 h-32">
                      <Doughnut data={goalProgressData} options={{ 
                        ...chartOptions, 
                        plugins: { ...chartOptions.plugins, legend: { display: false } }
                      }} />
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">
                      {Math.round(((userDashboard?.goalProgress?.completed || 0) / (userDashboard?.goalProgress?.target || 1)) * 100)}%
                    </p>
                    <p className="text-sm text-gray-600">
                      {userDashboard?.goalProgress?.completed || 0} of {userDashboard?.goalProgress?.target || 0} workouts completed
                    </p>
                  </div>
                </div>

                {/* Active Goals */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Goals</h3>
                  <div className="space-y-3">
                    {userDashboard?.activeGoals?.map((goal, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{goal.title}</h4>
                          <span className={`text-xs px-2 py-1 rounded ${
                            goal.progress >= goal.target ? 'bg-green-100 text-green-600' :
                            goal.progress >= goal.target * 0.7 ? 'bg-yellow-100 text-yellow-600' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {goal.progress >= goal.target ? 'Complete' : 'In Progress'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{goal.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex-1 mr-4">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-purple-600 h-2 rounded-full" 
                                style={{ width: `${Math.min((goal.progress / goal.target) * 100, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            {goal.progress}/{goal.target}
                          </span>
                        </div>
                      </div>
                    )) || (
                      <div className="text-center py-8">
                        <Trophy className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500 text-sm">No active goals</p>
                        <button className="mt-2 text-purple-600 text-sm font-medium">Set Your First Goal</button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Achievements */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Achievements</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {userDashboard?.recentAchievements?.map((achievement, index) => (
                      <div key={index} className="text-center p-3 bg-yellow-50 rounded-lg">
                        <Award className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                        <p className="text-sm font-medium text-gray-900">{achievement.title}</p>
                        <p className="text-xs text-gray-600">{achievement.date}</p>
                      </div>
                    )) || (
                      <div className="col-span-2 text-center py-8">
                        <Award className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500 text-sm">No achievements yet</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Quick Actions - Always Visible */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <button className="flex flex-col items-center justify-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
                  <Play className="w-6 h-6 text-purple-600 mb-2" />
                  <span className="text-purple-600 font-medium text-sm">Start Workout</span>
                </button>
                <button className="flex flex-col items-center justify-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                  <Calendar className="w-6 h-6 text-blue-600 mb-2" />
                  <span className="text-blue-600 font-medium text-sm">Book Class</span>
                </button>
                <button className="flex flex-col items-center justify-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                  <Target className="w-6 h-6 text-green-600 mb-2" />
                  <span className="text-green-600 font-medium text-sm">Set Goal</span>
                </button>
                <button className="flex flex-col items-center justify-center p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors">
                  <Trophy className="w-6 h-6 text-yellow-600 mb-2" />
                  <span className="text-yellow-600 font-medium text-sm">Challenges</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
