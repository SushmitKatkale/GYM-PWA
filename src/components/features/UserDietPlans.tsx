import React, { useState, useEffect } from 'react';
import {
  Apple, Clock, User, ChefHat, Activity, 
  MessageSquare, Calendar, Filter, RefreshCw,
  AlertCircle, Plus, Eye, History, Utensils,
  Target, TrendingUp, BookOpen, Zap
} from 'lucide-react';
import { useDietStore } from '../../stores/dietStore';
import { useAuthStore } from '../../stores/authStore';
import { dietService } from '../../services/dietService';
import { DietPlan } from '../../models/Diet';

interface UserDietPlansProps {
  onNavigate?: (view: string, data?: any) => void;
}

export function UserDietPlans({ onNavigate }: UserDietPlansProps = {}) {
  const { user } = useAuthStore();
  const {
    userDietPlans,
    isLoading,
    error,
    loadUserDietPlans,
    clearError,
    getPlanMacroSummary
  } = useDietStore();

  const [statusFilter, setStatusFilter] = useState<'active' | 'archived' | 'all'>('active');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<DietPlan | null>(null);

  useEffect(() => {
    if (user) {
      loadUserDietPlans({ 
        status: statusFilter === 'all' ? undefined : statusFilter 
      });
    }
  }, [user, statusFilter, loadUserDietPlans]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadUserDietPlans({ 
      status: statusFilter === 'all' ? undefined : statusFilter 
    });
    setRefreshing(false);
  };

  const handleViewDetails = (plan: DietPlan) => {
    if (onNavigate) {
      onNavigate('diet-plan-details', { planId: plan.id });
    } else {
      setSelectedPlan(plan);
    }
  };

  const handleRequestChange = (plan: DietPlan) => {
    if (onNavigate) {
      onNavigate('change-request', { planId: plan.id, trainerId: plan.trainer_id });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getMealTypesCount = (plan: DietPlan) => {
    const mealTypes = new Set(plan.meals?.map(meal => meal.meal_type) || []);
    return mealTypes.size;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'archived':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">Please log in to view your diet plans</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 font-poppins">
      {/* Header */}
      <div className="mb-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <Apple className="w-8 h-8 text-green-600 mr-3" />
                My Diet Plans
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Track your nutrition journey and stay healthy
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="text-sm font-medium">Refresh</span>
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
            {[
              { key: 'active', label: 'Active', icon: Zap },
              { key: 'archived', label: 'Archived', icon: BookOpen },
              { key: 'all', label: 'All', icon: Filter }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setStatusFilter(key as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  statusFilter === key
                    ? 'bg-white text-green-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="max-w-7xl mx-auto mb-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-800 text-sm">{error}</p>
              <button
                onClick={clearError}
                className="text-red-600 text-xs underline mt-1 hover:text-red-700"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && userDietPlans.length === 0 ? (
        <div className="max-w-7xl mx-auto">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="animate-pulse">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto">
          {userDietPlans.length === 0 ? (
            // Empty State
            <div className="text-center py-12">
              <div className="bg-white rounded-lg border border-gray-200 p-8 max-w-md mx-auto">
                <ChefHat className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Diet Plans Yet
                </h3>
                <p className="text-gray-500 text-sm mb-4">
                  You don't have any diet plans assigned yet. Contact your trainer to get started with a personalized nutrition plan.
                </p>
                <button
                  onClick={handleRefresh}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors mx-auto"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Check Again</span>
                </button>
              </div>
            </div>
          ) : (
            // Diet Plans Grid
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {userDietPlans.map((plan) => {
                const macros = getPlanMacroSummary(plan);
                const mealCount = getMealTypesCount(plan);
                
                return (
                  <div
                    key={plan.id}
                    className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                  >
                    {/* Header */}
                    <div className="p-6 pb-4">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                            <ChefHat className="w-6 h-6 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 text-lg leading-tight">
                              {plan.title}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                              by {plan.trainer?.firstName} {plan.trainer?.lastName}
                            </p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(plan.status)}`}>
                          {dietService.getStatusDisplayName(plan.status)}
                        </span>
                      </div>

                      {/* Description */}
                      {plan.description && (
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                          {plan.description}
                        </p>
                      )}

                      {/* Macros Summary */}
                      {(macros.calories > 0 || macros.protein > 0) && (
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          {macros.calories > 0 && (
                            <div className="text-center">
                              <div className="text-lg font-semibold text-gray-900">
                                {macros.calories}
                              </div>
                              <div className="text-xs text-gray-500">Calories</div>
                            </div>
                          )}
                          {macros.protein > 0 && (
                            <div className="text-center">
                              <div className="text-lg font-semibold text-blue-600">
                                {macros.protein}g
                              </div>
                              <div className="text-xs text-gray-500">Protein</div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Meal Info */}
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <div className="flex items-center space-x-1">
                          <Utensils className="w-4 h-4" />
                          <span>{mealCount} meal types</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(plan.created_at)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-lg">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleViewDetails(plan)}
                          className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                        >
                          <Eye className="w-4 h-4" />
                          <span>View Details</span>
                        </button>
                        <button
                          onClick={() => handleRequestChange(plan)}
                          className="flex items-center justify-center space-x-2 px-3 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                        >
                          <MessageSquare className="w-4 h-4" />
                          <span>Request Change</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
