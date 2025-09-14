import React, { useState, useEffect, useMemo } from 'react';
import {
  Search, Filter, Clock, Target, ChefHat,
  Play, ArrowLeft, X, Loader2, Apple,
  SlidersHorizontal, TrendingUp, Users,
  Star, Zap, Scale, ImageIcon, RefreshCw, Utensils
} from 'lucide-react';
import { dietService } from '../../services/dietService';
import { imageService } from '../../services/imageService';
import { DietPlan } from '../../models/Diet';

interface DietListProps {
  onBack: () => void;
  onDietSelect: (diet: DietPlan) => void;
}

interface DietFilters {
  goal: string;
  difficulty: string;
  dietaryRestrictions: string;
  calorieRange: string;
  search: string;
}

export const DietList: React.FC<DietListProps> = ({ onBack, onDietSelect }) => {
  const [dietPlans, setDietPlans] = useState<DietPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  // Filter options
  const [availableGoals, setAvailableGoals] = useState<string[]>([]);
  const [availableDietaryRestrictions, setAvailableDietaryRestrictions] = useState<string[]>([]);

  // Applied filters (what's actually used for API calls)
  const [appliedFilters, setAppliedFilters] = useState<DietFilters>({
    goal: '',
    difficulty: '',
    dietaryRestrictions: '',
    calorieRange: '',
    search: ''
  });

  // Draft filters (what user is selecting in UI)
  const [draftFilters, setDraftFilters] = useState<DietFilters>({
    goal: '',
    difficulty: '',
    dietaryRestrictions: '',
    calorieRange: '',
    search: ''
  });

  const [searchInput, setSearchInput] = useState('');
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isInfiniteLoading, setIsInfiniteLoading] = useState(false);

  // Load initial data
  useEffect(() => {
    loadDietPlans();
    loadFilterOptions();
  }, []);

  // Handle search with debouncing - apply search immediately
  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeout = setTimeout(() => {
      setAppliedFilters(prev => ({ ...prev, search: searchInput }));
      setDraftFilters(prev => ({ ...prev, search: searchInput }));
      setCurrentPage(1);
    }, 500);

    setSearchTimeout(timeout);

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [searchInput]);

  // Reload diet plans when applied filters change
  useEffect(() => {
    loadDietPlans(1, false); // Reset to page 1 when filters change
  }, [appliedFilters]);

  // Load more diet plans when currentPage changes (but not on first load)
  useEffect(() => {
    if (currentPage > 1) {
      loadDietPlans(currentPage, true); // Append to existing diet plans
    }
  }, [currentPage]);

  // Infinite scroll functionality
  useEffect(() => {
    const handleScroll = () => {
      // Check if we're near the bottom of the page
      const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
      const clientHeight = document.documentElement.clientHeight || window.innerHeight;
      const scrolledToBottom = scrollTop + clientHeight >= scrollHeight - 100; // 100px threshold

      // Load more if we're near bottom, not currently loading, and have more pages
      if (scrolledToBottom && !loadingMore && !loading && currentPage < totalPages) {
        setIsInfiniteLoading(true);
        setCurrentPage(prev => prev + 1);
      }
    };

    // Add scroll event listener
    window.addEventListener('scroll', handleScroll);

    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [loadingMore, loading, currentPage, totalPages]);

  const loadDietPlans = async (page: number = 1, append: boolean = false) => {
    try {
      const isLoadingMore = append && page > 1;
      if (isLoadingMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);

      // Build query parameters based on appliedFilters
      const queryParams = new URLSearchParams();
      queryParams.append('page', page.toString());
      queryParams.append('limit', '10');
      queryParams.append('status', 'active'); // Only show active diet plans

      // Use appliedFilters for API calls
      if (appliedFilters.goal) queryParams.append('goal', appliedFilters.goal);
      if (appliedFilters.difficulty) queryParams.append('difficulty', appliedFilters.difficulty);
      if (appliedFilters.dietaryRestrictions) queryParams.append('dietary_restrictions', appliedFilters.dietaryRestrictions);
      if (appliedFilters.calorieRange) queryParams.append('calorie_range', appliedFilters.calorieRange);
      if (appliedFilters.search) queryParams.append('search', appliedFilters.search);

      // Use the public diet plans endpoint for regular users to browse available plans
      const response = await dietService.getPublicDietPlans({
        page: page,
        limit: 10,
        status: 'active',
        goal: appliedFilters.goal,
        dietaryRestrictions: appliedFilters.dietaryRestrictions,
        calorieRange: appliedFilters.calorieRange,
        search: appliedFilters.search
      });

      if (response.success && response.data) {
        let plans = response.data.dietPlans;
        let pagination = response.data.pagination;

        if (append && page > 1) {
          // Append new diet plans to existing list
          setDietPlans(prev => [...prev, ...plans]);
        } else {
          // Replace diet plans list
          setDietPlans(plans);
        }
        setCurrentPage(pagination.currentPage);
        setTotalPages(pagination.totalPages);
        setTotalItems(pagination.total);
      } else {
        setError('Failed to load diet plans');
      }
    } catch (err) {
      setError('Failed to load diet plans. Please try again.');
      console.error('Error loading diet plans:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setIsInfiniteLoading(false);
    }
  };

  const loadFilterOptions = async () => {
    try {
      // For now, using static options. In a real implementation, 
      // these would come from API endpoints
      setAvailableGoals([
        'weight_loss',
        'muscle_gain',
        'maintenance',
        'athletic_performance',
        'general_health'
      ]);

      setAvailableDietaryRestrictions([
        'vegetarian',
        'vegan',
        'gluten_free',
        'dairy_free',
        'keto',
        'paleo',
        'mediterranean'
      ]);
    } catch (err) {
      console.error('Error loading filter options:', err);
    }
  };

  // Handle draft filter changes (for UI)
  const handleDraftFilterChange = (key: keyof DietFilters, value: string) => {
    setDraftFilters(prev => ({ ...prev, [key]: value }));
  };

  // Handle quick chip filter changes (apply immediately)
  const handleQuickFilterChange = (key: keyof DietFilters, value: string) => {
    const newValue = appliedFilters[key] === value ? '' : value;
    setAppliedFilters(prev => ({ ...prev, [key]: newValue }));
    setDraftFilters(prev => ({ ...prev, [key]: newValue }));
    setCurrentPage(1);
  };

  // Apply draft filters
  const applyFilters = () => {
    setAppliedFilters({ ...draftFilters });
    setCurrentPage(1);
    setShowFilters(false);
  };

  // Clear all filters
  const clearFilters = () => {
    const clearedFilters = {
      goal: '',
      difficulty: '',
      dietaryRestrictions: '',
      calorieRange: '',
      search: ''
    };
    setAppliedFilters(clearedFilters);
    setDraftFilters(clearedFilters);
    setSearchInput('');
    setCurrentPage(1);
  };

  // Clear draft filters (for cancel)
  const clearDraftFilters = () => {
    const clearedFilters = {
      goal: '',
      difficulty: '',
      dietaryRestrictions: '',
      calorieRange: '',
      search: ''
    };
    setDraftFilters(clearedFilters);
    setSearchInput('');
  };

  // Remove specific applied filter
  const removeAppliedFilter = (key: keyof DietFilters) => {
    setAppliedFilters(prev => ({ ...prev, [key]: '' }));
    setDraftFilters(prev => ({ ...prev, [key]: '' }));
    if (key === 'search') {
      setSearchInput('');
    }
    setCurrentPage(1);
  };

  // Check if we have active applied filters
  const hasActiveFilters = useMemo(() => {
    return Object.values(appliedFilters).some(value => value !== '');
  }, [appliedFilters]);

  // Check if draft filters are different from applied
  const hasFilterChanges = useMemo(() => {
    return JSON.stringify(draftFilters) !== JSON.stringify(appliedFilters);
  }, [draftFilters, appliedFilters]);

  // Handle advanced filters button click
  const handleAdvancedFiltersClick = () => {
    // Reset draft filters to match applied filters when opening
    setDraftFilters({ ...appliedFilters });
    setShowFilters(!showFilters);
  };

  const formatDisplayName = (str: string) => {
    return str.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getGoalIcon = (goal: string) => {
    switch (goal) {
      case 'weight_loss': return <Scale className="w-4 h-4" />;
      case 'muscle_gain': return <TrendingUp className="w-4 h-4" />;
      case 'athletic_performance': return <Zap className="w-4 h-4" />;
      case 'maintenance': return <Target className="w-4 h-4" />;
      default: return <Apple className="w-4 h-4" />;
    }
  };

  const getCalorieRangeDisplay = (calorieRange: string) => {
    switch (calorieRange) {
      case 'low': return '1200-1500 cal';
      case 'medium': return '1500-2000 cal';
      case 'high': return '2000-2500 cal';
      case 'very_high': return '2500+ cal';
      default: return calorieRange;
    }
  };

  if (loading && dietPlans.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600 font-poppins">Loading diet plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="px-4 py-4">
          {/* Top Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <button
                onClick={onBack}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-lg font-medium text-gray-900 font-poppins">Diet Plans</h1>
                <p className="text-sm text-gray-500">{totalItems} available</p>
              </div>
            </div>
            <div>
              <button
                onClick={handleAdvancedFiltersClick}
                className={`flex-shrink-0 p-2.5 rounded-full transition-colors ${showFilters || hasActiveFilters
                    ? 'bg-green-100 text-green-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                <SlidersHorizontal className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search diet plans..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border-0 rounded-sm focus:ring-2 focus:ring-green-500 focus:bg-white transition-colors font-poppins text-sm"
              />
            </div>
          </div>

          {/* Filter Chips */}
          <div className="flex items-center gap-3 pb-2">
            {/* Quick Filter Chips */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide flex-1">
              {/* Goal Chips */}
              {['weight_loss', 'muscle_gain', 'maintenance'].map((goal) => (
                <button
                  key={goal}
                  onClick={() => handleQuickFilterChange('goal', goal)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-[0.5rem] text-sm font-medium transition-colors ${appliedFilters.goal === goal
                      ? 'bg-green-100 text-green-700 border border-green-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                  {formatDisplayName(goal)}
                </button>
              ))}

              {/* Dietary Restriction Chips */}
              {['vegetarian', 'vegan', 'keto'].map((restriction) => (
                <button
                  key={restriction}
                  onClick={() => handleQuickFilterChange('dietaryRestrictions', restriction)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-[0.5rem] text-sm font-medium transition-colors ${appliedFilters.dietaryRestrictions === restriction
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                  {formatDisplayName(restriction)}
                </button>
              ))}
            </div>
          </div>

          {/* Active Filters Summary */}
          {hasActiveFilters && (
            <div className="mt-3 flex items-center gap-2">
              <div className="flex flex-wrap gap-1.5 flex-1">
                {Object.entries(appliedFilters).map(([key, value]) => {
                  if (!value || key === 'search') return null;
                  return (
                    <span
                      key={key}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium"
                    >
                      {key === 'calorieRange' ? getCalorieRangeDisplay(value) : formatDisplayName(value)}
                      <button
                        onClick={() => removeAppliedFilter(key as keyof DietFilters)}
                        className="hover:bg-gray-200 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  );
                })}
              </div>
              <button
                onClick={clearFilters}
                className="text-xs text-green-600 hover:text-green-700 font-medium"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Advanced Filters Bottom Sheet */}
        {showFilters && (
          <div className="fixed inset-0 z-50 md:relative md:z-auto">
            {/* Backdrop for mobile */}
            <div
              className="absolute inset-0 bg-black bg-opacity-50 md:hidden"
              onClick={() => setShowFilters(false)}
            />

            {/* Filter Panel */}
            <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 pb-20 max-h-[80vh] md:relative md:rounded-none md:max-h-none md:shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900 font-poppins">Filter Diet Plans</h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="p-2 hover:bg-gray-100 rounded-sm transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="overflow-y-auto max-h-[40vh] scrollbar-none">
                <div className="space-y-6">
                  {/* Goal Filter */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-3 font-poppins">Goals</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      <button
                        onClick={() => handleDraftFilterChange('goal', '')}
                        className={`p-3 text-sm font-medium rounded-sm transition-colors text-left ${draftFilters.goal === ''
                            ? 'bg-green-100 text-green-700 border-2 border-green-200'
                            : 'bg-gray-50 text-gray-700 border-2 border-transparent hover:bg-gray-100'
                          }`}
                      >
                        All Goals
                      </button>
                      {availableGoals.map(goal => (
                        <button
                          key={goal}
                          onClick={() => handleDraftFilterChange('goal', goal)}
                          className={`p-3 text-sm font-medium rounded-sm transition-colors text-left ${draftFilters.goal === goal
                              ? 'bg-green-100 text-green-700 border-2 border-green-200'
                              : 'bg-gray-50 text-gray-700 border-2 border-transparent hover:bg-gray-100'
                            }`}
                        >
                          {formatDisplayName(goal)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Dietary Restrictions Filter */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-3 font-poppins">Dietary Preferences</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleDraftFilterChange('dietaryRestrictions', '')}
                        className={`p-3 text-sm font-medium rounded-sm transition-colors text-left ${draftFilters.dietaryRestrictions === ''
                            ? 'bg-green-100 text-green-700 border-2 border-green-200'
                            : 'bg-gray-50 text-gray-700 border-2 border-transparent hover:bg-gray-100'
                          }`}
                      >
                        All Diets
                      </button>
                      {availableDietaryRestrictions.slice(0, 7).map(restriction => (
                        <button
                          key={restriction}
                          onClick={() => handleDraftFilterChange('dietaryRestrictions', restriction)}
                          className={`p-3 text-sm font-medium rounded-sm transition-colors text-left ${draftFilters.dietaryRestrictions === restriction
                              ? 'bg-green-100 text-green-700 border-2 border-green-200'
                              : 'bg-gray-50 text-gray-700 border-2 border-transparent hover:bg-gray-100'
                            }`}
                        >
                          {formatDisplayName(restriction)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Calorie Range Filter */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-3 font-poppins">Calorie Range</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['', 'low', 'medium', 'high', 'very_high'].map((range) => (
                        <button
                          key={range}
                          onClick={() => handleDraftFilterChange('calorieRange', range)}
                          className={`p-3 text-sm font-medium rounded-sm transition-colors ${draftFilters.calorieRange === range
                              ? 'bg-green-100 text-green-700 border-2 border-green-200'
                              : 'bg-gray-50 text-gray-700 border-2 border-transparent hover:bg-gray-100'
                            }`}
                        >
                          {range === '' ? 'All Ranges' : getCalorieRangeDisplay(range)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Filter Actions */}
              <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={clearDraftFilters}
                  className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-sm font-medium hover:bg-gray-200 transition-colors font-poppins"
                >
                  Clear All
                </button>
                <button
                  onClick={applyFilters}
                  className="flex-1 py-3 px-4 bg-green-600 text-white rounded-sm font-medium hover:bg-green-700 transition-colors font-poppins"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-600 font-poppins">{error}</p>
            <button
              onClick={loadDietPlans}
              className="mt-2 text-red-700 hover:text-red-800 underline font-poppins"
            >
              Try again
            </button>
          </div>
        )}

        {/* Diet Grid */}
        {dietPlans.length > 0 ? (
          <>
            <div className="space-y-4">
              {dietPlans.map((diet, index) => (
                <DietCard
                  key={`${diet.id}-${index}`}
                  diet={diet}
                  onClick={() => onDietSelect(diet)}
                />
              ))}

              {/* Infinite Scroll Loading Indicator */}
              {loadingMore && currentPage < totalPages && (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-green-600 mr-3" />
                  <p className="text-gray-600 font-poppins">Loading more diet plans...</p>
                </div>
              )}

              {/* End of List Indicator */}
              {currentPage >= totalPages && dietPlans.length > 0 && (
                <div className="flex justify-center items-center py-8">
                  <div className="text-center">
                    <div className="w-12 h-0.5 bg-gray-300 mx-auto mb-3 rounded-full"></div>
                    <p className="text-gray-500 text-sm font-poppins">You've reached the end of the list</p>
                    <p className="text-gray-400 text-xs font-poppins mt-1">{dietPlans.length} diet plans loaded</p>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : !loading && (
          <div className="text-center py-12">
            <ChefHat className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2 font-poppins">No diet plans found</h3>
            <p className="text-gray-600 mb-4 font-poppins">
              {hasActiveFilters
                ? 'Try adjusting your filters to see more results.'
                : 'No diet plans are available at the moment.'
              }
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-green-600 text-white rounded-sm hover:bg-green-700 transition-colors font-poppins"
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Infinite scroll loading indicator */}
      {isInfiniteLoading && (
        <div className="fixed bottom-4 right-4 bg-white shadow-lg rounded-full p-3">
          <Loader2 className="w-5 h-5 animate-spin text-green-600" />
        </div>
      )}
    </div>
  );
};

// Diet Card Component - Following ExerciseCard pattern
const DietCard: React.FC<{ diet: DietPlan; onClick: () => void }> = ({ diet, onClick }) => {
  // Get primary meal thumbnail or use placeholder
  const firstMealWithImage = diet.meals?.find(meal => meal.fullUrl);

  const thumbnailUrl = firstMealWithImage ? firstMealWithImage.fullUrl : null;

  // Check if we have meal content
  const hasMeals = diet.meals && diet.meals.length > 0;
  const mealCount = diet.meals?.length || 0;

  // Helper functions for styling
  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-700';
      case 'intermediate': return 'bg-yellow-100 text-yellow-700';
      case 'advanced': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getGoalColor = (goal?: string) => {
    switch (goal?.toLowerCase()) {
      case 'weight_loss': return 'bg-orange-100 text-orange-700';
      case 'muscle_gain': return 'bg-blue-100 text-blue-700';
      case 'maintenance': return 'bg-green-100 text-green-700';
      case 'athletic_performance': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const formatDuration = (days?: number) => {
    if (!days) return null;
    if (days === 1) return '1 day';
    if (days < 7) return `${days} days`;
    if (days === 7) return '1 week';
    if (days < 30) return `${Math.floor(days / 7)} weeks`;
    return `${Math.floor(days / 30)} months`;
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-sm shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex">
        {/* Thumbnail */}
        <div className="w-24 h-24 flex-shrink-0 bg-gray-100 relative">
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt={diet.name || diet.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = imageService.getMealPlaceholder(diet.name || 'Diet Plan', 'breakfast');
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ChefHat className="w-6 h-6 text-gray-400" />
            </div>
          )}

          {/* Meal count indicator */}
          {hasMeals && (
            <div className="absolute bottom-1 right-1 bg-black bg-opacity-75 rounded px-1 py-0.5">
              <span className="text-white text-xs font-medium">{mealCount}</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 font-poppins line-clamp-2 mb-1">
                {diet.name || diet.title}
              </h3>

              {/* Trainer info */}
              {diet.trainer && (
                <div className="flex items-center space-x-1 text-xs text-gray-500 mb-2">
                  <Users className="w-3 h-3" />
                  <span>by {diet.trainer.name || `${diet.trainer.firstName || ''} ${diet.trainer.lastName || ''}`.trim()}</span>
                </div>
              )}

              {/* Meta information */}
              <div className="flex items-center space-x-3 text-xs text-gray-500 mb-2">
                {diet.target_calories && (
                  <div className="flex items-center space-x-1">
                    <Zap className="w-3 h-3" />
                    <span>{diet.target_calories} cal</span>
                  </div>
                )}

                {mealCount > 0 && (
                  <div className="flex items-center space-x-1">
                    <Utensils className="w-3 h-3" />
                    <span>{mealCount} meals</span>
                  </div>
                )}

                {diet.duration && (
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{formatDuration(diet.duration)}</span>
                  </div>
                )}
              </div>

              {/* Nutrition summary */}
              {(diet.target_protein || diet.target_carbs || diet.target_fat) && (
                <div className="flex items-center space-x-2 text-xs text-gray-500 mb-2">
                  {diet.target_protein && (
                    <span className="bg-blue-50 text-blue-600 px-1 py-0.5 rounded">
                      P: {diet.target_protein}g
                    </span>
                  )}
                  {diet.target_carbs && (
                    <span className="bg-green-50 text-green-600 px-1 py-0.5 rounded">
                      C: {diet.target_carbs}g
                    </span>
                  )}
                  {diet.target_fat && (
                    <span className="bg-purple-50 text-purple-600 px-1 py-0.5 rounded">
                      F: {diet.target_fat}g
                    </span>
                  )}
                </div>
              )}

              {/* Tags */}
              <div className="flex flex-wrap gap-1">
                {diet.difficulty && (
                  <span className={`px-2 py-1 rounded-[0.25rem] text-xs font-medium ${getDifficultyColor(diet.difficulty)}`}>
                    {formatDisplayName(diet.difficulty)}
                  </span>
                )}

                {diet.goal && (
                  <span className={`px-2 py-1 rounded-[0.25rem] text-xs font-medium ${getGoalColor(diet.goal)}`}>
                    {formatDisplayName(diet.goal)}
                  </span>
                )}

                {diet.dietaryRestrictions && diet.dietaryRestrictions.length > 0 && (
                  <span className="px-2 py-1 rounded-[0.25rem] text-xs font-medium bg-indigo-100 text-indigo-700">
                    {formatDisplayName(diet.dietaryRestrictions[0])}
                    {diet.dietaryRestrictions.length > 1 && ` +${diet.dietaryRestrictions.length - 1}`}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function for formatting display names
const formatDisplayName = (str: string) => {
  return str.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};
