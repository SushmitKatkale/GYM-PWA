import React, { useState, useEffect } from 'react';
import {
  ArrowLeft, ChefHat, Clock, User, Calendar,
  Utensils, Target, TrendingUp, Activity, MessageSquare,
  AlertCircle, RefreshCw, Plus, Edit, Trash2,
  CheckCircle, XCircle, Info, Zap, Apple, Scale,
  MapPin, Timer, Droplets, FileText, History
} from 'lucide-react';
import { useDietStore } from '../../stores/dietStore';
import { useAuthStore } from '../../stores/authStore';
import { DietPlan, DietPlanMeal } from '../../models/Diet';

interface DietPlanDetailsProps {
  planId?: number;
  plan?: DietPlan;
  onBack?: () => void;
  onNavigate?: (view: string, data?: any) => void;
}

export function DietPlanDetails({
  planId,
  plan: initialPlan,
  onBack,
  onNavigate
}: DietPlanDetailsProps) {
  const { user } = useAuthStore();
  const {
    selectedDietPlan: selectedPlan,
    isLoading,
    error,
    loadDietPlanById,
    clearError,
    getPlanMacroSummary
  } = useDietStore();

  const [activeTab, setActiveTab] = useState<'meals' | 'macros' | 'history'>('meals');
  const [expandedMeals, setExpandedMeals] = useState<Set<number>>(new Set());

  // Use passed plan or selected plan from store
  const plan = initialPlan || selectedPlan;

  useEffect(() => {
    if (planId && !initialPlan) {
      loadDietPlanById(planId);
    }
  }, [planId, initialPlan, loadDietPlanById]);

  const handleRefresh = () => {
    if (planId) {
      loadDietPlanById(planId);
    }
  };

  const toggleMealExpansion = (mealId: number) => {
    const newExpanded = new Set(expandedMeals);
    if (newExpanded.has(mealId)) {
      newExpanded.delete(mealId);
    } else {
      newExpanded.add(mealId);
    }
    setExpandedMeals(newExpanded);
  };

  const handleRequestChange = () => {
    if (plan && onNavigate) {
      onNavigate('change-request', { 
        planId: plan.id, 
        trainerId: plan.trainer_id 
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return 'Anytime';
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getMealTypeIcon = (mealType: string) => {
    switch (mealType.toLowerCase()) {
      case 'breakfast':
        return '🌅';
      case 'lunch':
        return '☀️';
      case 'dinner':
        return '🌙';
      case 'snack':
        return '🍎';
      default:
        return '🍽️';
    }
  };

  const groupMealsByType = (meals: DietPlanMeal[]) => {
    const grouped = meals.reduce((acc, meal) => {
      if (!acc[meal.meal_type]) {
        acc[meal.meal_type] = [];
      }
      acc[meal.meal_type].push(meal);
      return acc;
    }, {} as Record<string, DietPlanMeal[]>);

    // Sort meal types by typical order
    const order = ['breakfast', 'snack', 'lunch', 'snack', 'dinner', 'snack'];
    const sortedEntries = Object.entries(grouped).sort(([a], [b]) => {
      const aIndex = order.indexOf(a.toLowerCase());
      const bIndex = order.indexOf(b.toLowerCase());
      if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });

    return sortedEntries;
  };

  if (isLoading && !plan) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 font-poppins">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="flex items-center space-x-4 mb-8">
              <div className="w-8 h-8 bg-gray-200 rounded"></div>
              <div className="h-8 bg-gray-200 rounded w-64"></div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="h-6 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center font-poppins">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 mb-4">Diet plan not found</p>
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors mx-auto"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Go Back</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  const macros = getPlanMacroSummary(plan);
  const mealsByType = groupMealsByType(plan.meals || []);

  return (
    <div className="min-h-screen bg-gray-50 p-4 font-poppins">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            {onBack && (
              <button
                onClick={onBack}
                className="flex items-center justify-center w-10 h-10 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <ChefHat className="w-8 h-8 text-green-600 mr-3" />
                {plan.title}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Created by {plan.trainer?.firstName} {plan.trainer?.lastName} • {formatDate(plan.created_at)}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleRefresh}
              className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="text-sm font-medium">Refresh</span>
            </button>
            <button
              onClick={handleRequestChange}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              <span className="text-sm font-medium">Request Changes</span>
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6">
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

        {/* Plan Overview */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Plan Details</h3>
              {plan.description && (
                <p className="text-gray-600 mb-4">{plan.description}</p>
              )}
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Utensils className="w-4 h-4" />
                  <span>{plan.meals?.length || 0} meals</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Activity className="w-4 h-4" />
                  <span className="capitalize">{plan.status}</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Daily Macros</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {macros.calories}
                  </div>
                  <div className="text-sm text-gray-600">Calories</div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {macros.protein}g
                  </div>
                  <div className="text-sm text-gray-600">Protein</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {macros.carbs}g
                  </div>
                  <div className="text-sm text-gray-600">Carbs</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {macros.fat}g
                  </div>
                  <div className="text-sm text-gray-600">Fat</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
            {[
              { key: 'meals', label: 'Meals', icon: Utensils },
              { key: 'macros', label: 'Macro Breakdown', icon: Target },
              { key: 'history', label: 'History', icon: History }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === key
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

        {/* Tab Content */}
        {activeTab === 'meals' && (
          <div className="space-y-6">
            {mealsByType.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                <Utensils className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Meals Planned Yet
                </h3>
                <p className="text-gray-500 text-sm">
                  Your trainer hasn't added any meals to this plan yet.
                </p>
              </div>
            ) : (
              mealsByType.map(([mealType, meals]) => (
                <div key={mealType} className="bg-white rounded-lg border border-gray-200">
                  <div className="p-4 border-b border-gray-100 bg-gray-50 rounded-t-lg">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <span className="text-2xl mr-3">{getMealTypeIcon(mealType)}</span>
                      <span className="capitalize">{mealType}</span>
                      <span className="ml-2 text-sm text-gray-500">
                        ({meals.length} {meals.length === 1 ? 'option' : 'options'})
                      </span>
                    </h3>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {meals.map((meal, index) => (
                      <div key={meal.id} className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 className="font-semibold text-gray-900">
                                {meal.food_item}
                              </h4>
                              {meal.preferred_time && (
                                <span className="flex items-center space-x-1 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                  <Timer className="w-3 h-3" />
                                  <span>{formatTime(meal.preferred_time)}</span>
                                </span>
                              )}
                            </div>
                            
                            {meal.description && (
                              <p className="text-sm text-gray-600 mb-3">
                                {meal.description}
                              </p>
                            )}

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              {meal.calories && (
                                <div className="flex items-center space-x-2">
                                  <Zap className="w-4 h-4 text-orange-500" />
                                  <span className="text-gray-600">
                                    {meal.calories} cal
                                  </span>
                                </div>
                              )}
                              {meal.protein && (
                                <div className="flex items-center space-x-2">
                                  <Activity className="w-4 h-4 text-blue-500" />
                                  <span className="text-gray-600">
                                    {meal.protein}g protein
                                  </span>
                                </div>
                              )}
                              {meal.carbs && (
                                <div className="flex items-center space-x-2">
                                  <Apple className="w-4 h-4 text-green-500" />
                                  <span className="text-gray-600">
                                    {meal.carbs}g carbs
                                  </span>
                                </div>
                              )}
                              {meal.fat && (
                                <div className="flex items-center space-x-2">
                                  <Droplets className="w-4 h-4 text-purple-500" />
                                  <span className="text-gray-600">
                                    {meal.fat}g fat
                                  </span>
                                </div>
                              )}
                            </div>

                            {meal.instructions && (
                              <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                                <div className="flex items-start space-x-2">
                                  <FileText className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                                  <div>
                                    <h5 className="text-sm font-medium text-blue-900 mb-1">
                                      Instructions
                                    </h5>
                                    <p className="text-sm text-blue-700">
                                      {meal.instructions}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'macros' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Macro Nutrient Breakdown
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-700 mb-3">Daily Totals</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Total Calories</span>
                    <span className="font-semibold text-orange-600">
                      {macros.calories} cal
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Protein</span>
                    <span className="font-semibold text-blue-600">
                      {macros.protein}g ({Math.round((macros.protein * 4 / macros.calories) * 100)}%)
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Carbohydrates</span>
                    <span className="font-semibold text-green-600">
                      {macros.carbs}g ({Math.round((macros.carbs * 4 / macros.calories) * 100)}%)
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Fat</span>
                    <span className="font-semibold text-purple-600">
                      {macros.fat}g ({Math.round((macros.fat * 9 / macros.calories) * 100)}%)
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-700 mb-3">Visual Breakdown</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-blue-500 rounded"></div>
                    <span className="text-sm text-gray-600">
                      Protein: {Math.round((macros.protein * 4 / macros.calories) * 100)}%
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                    <span className="text-sm text-gray-600">
                      Carbs: {Math.round((macros.carbs * 4 / macros.calories) * 100)}%
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-purple-500 rounded"></div>
                    <span className="text-sm text-gray-600">
                      Fat: {Math.round((macros.fat * 9 / macros.calories) * 100)}%
                    </span>
                  </div>
                </div>
                <div className="mt-4 h-4 bg-gray-200 rounded-full overflow-hidden flex">
                  <div 
                    className="bg-blue-500 h-full"
                    style={{ width: `${(macros.protein * 4 / macros.calories) * 100}%` }}
                  ></div>
                  <div 
                    className="bg-green-500 h-full"
                    style={{ width: `${(macros.carbs * 4 / macros.calories) * 100}%` }}
                  ></div>
                  <div 
                    className="bg-purple-500 h-full"
                    style={{ width: `${(macros.fat * 9 / macros.calories) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Plan History
            </h3>
            <div className="text-center py-8">
              <History className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">
                Plan history feature coming soon
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
