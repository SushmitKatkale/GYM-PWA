import React, { useState, useEffect, useMemo } from 'react';
import {
  Search, Filter, Clock, Flame,
  Play, ArrowLeft, X, Loader2,
  Target, ChevronDown, SlidersHorizontal
} from 'lucide-react';
import { exerciseService, Exercise, ExerciseFilters, ExerciseService } from '../../services/exerciseService';

interface ExerciseListProps {
  onBack: () => void;
  onExerciseSelect: (exercise: Exercise) => void;
}

interface FilterState {
  category: string;
  difficulty: string;
  muscleGroup: string;
  equipment: string;
  search: string;
}

export const ExerciseList: React.FC<ExerciseListProps> = ({ onBack, onExerciseSelect }) => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState<{ category: string; count: number }[]>([]);
  const [muscleGroups, setMuscleGroups] = useState<string[]>([]);
  const [equipmentList, setEquipmentList] = useState<string[]>([]);

  // Applied filters (what's actually used for API calls)
  const [appliedFilters, setAppliedFilters] = useState<FilterState>({
    category: '',
    difficulty: '',
    muscleGroup: '',
    equipment: '',
    search: ''
  });

  // Draft filters (what user is selecting in UI)
  const [draftFilters, setDraftFilters] = useState<FilterState>({
    category: '',
    difficulty: '',
    muscleGroup: '',
    equipment: '',
    search: ''
  });

  const [searchInput, setSearchInput] = useState('');
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  // Load initial data
  useEffect(() => {
    loadExercises();
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

  // Reload exercises when applied filters change
  useEffect(() => {
    loadExercises(1, false); // Reset to page 1 when filters change
  }, [appliedFilters]);

  // Load more exercises when currentPage changes (but not on first load)
  useEffect(() => {
    if (currentPage > 1) {
      loadExercises(currentPage, true); // Append to existing exercises
    }
  }, [currentPage]);

  const loadExercises = async (page: number = 1, append: boolean = false) => {
    try {
      const isLoadingMore = append && page > 1;
      if (isLoadingMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const exerciseFilters: ExerciseFilters = {
        page: page,
        limit: 10,
        includePrivate: false // Only show public exercises for regular users
      };

      // Use appliedFilters for API calls
      if (appliedFilters.category) exerciseFilters.category = appliedFilters.category;
      if (appliedFilters.difficulty) exerciseFilters.difficulty = appliedFilters.difficulty;
      if (appliedFilters.muscleGroup) exerciseFilters.muscleGroup = appliedFilters.muscleGroup;
      if (appliedFilters.equipment) exerciseFilters.equipment = appliedFilters.equipment;
      if (appliedFilters.search) exerciseFilters.search = appliedFilters.search;

      const response = await exerciseService.getExercises(exerciseFilters);

      if (response.success) {
        if (append && page > 1) {
          // Append new exercises to existing list
          setExercises(prev => [...prev, ...response.data.exercises]);
        } else {
          // Replace exercises list
          setExercises(response.data.exercises);
        }
        setCurrentPage(response.data.pagination.currentPage);
        setTotalPages(response.data.pagination.totalPages);
        setTotalItems(response.data.pagination.totalItems);
      } else {
        setError('Failed to load exercises');
      }
    } catch (err) {
      setError('Failed to load exercises. Please try again.');
      console.error('Error loading exercises:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadFilterOptions = async () => {
    try {
      const [categoriesRes, muscleGroupsRes, equipmentRes] = await Promise.all([
        exerciseService.getCategories(),
        exerciseService.getMuscleGroups(),
        exerciseService.getEquipmentList()
      ]);

      if (categoriesRes.success) setCategories(categoriesRes.data);
      if (muscleGroupsRes.success) setMuscleGroups(muscleGroupsRes.data);
      if (equipmentRes.success) setEquipmentList(equipmentRes.data);
    } catch (err) {
      console.error('Error loading filter options:', err);
    }
  };

  // Handle draft filter changes (for UI)
  const handleDraftFilterChange = (key: keyof FilterState, value: string) => {
    setDraftFilters(prev => ({ ...prev, [key]: value }));
  };

  // Handle quick chip filter changes (apply immediately)
  const handleQuickFilterChange = (key: keyof FilterState, value: string) => {
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
      category: '',
      difficulty: '',
      muscleGroup: '',
      equipment: '',
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
      category: '',
      difficulty: '',
      muscleGroup: '',
      equipment: '',
      search: ''
    };
    setDraftFilters(clearedFilters);
    setSearchInput('');
  };

  // Remove specific applied filter
  const removeAppliedFilter = (key: keyof FilterState) => {
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

  const handleLoadMore = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  if (loading && exercises.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600 font-poppins">Loading exercises...</p>
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
                <h1 className="text-lg font-medium text-gray-900 font-poppins">Exercises</h1>
                <p className="text-sm text-gray-500">{totalItems} available</p>
              </div>
            </div>
            <div>
              <button
                onClick={handleAdvancedFiltersClick}
                className={`flex-shrink-0 p-2.5 rounded-full transition-colors ${showFilters || hasActiveFilters
                  ? 'bg-purple-100 text-purple-600'
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
                placeholder="Search exercises..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border-0 rounded-sm focus:ring-2 focus:ring-purple-500 focus:bg-white transition-colors font-poppins text-sm"
              />
            </div>
          </div>

          {/* Filter Chips */}
          <div className="flex items-center gap-3 pb-2">
            {/* Quick Filter Chips */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide flex-1">
              {/* Difficulty Chips */}
              {['beginner', 'intermediate', 'advanced'].map((difficulty) => (
                <button
                  key={difficulty}
                  onClick={() => handleQuickFilterChange('difficulty', difficulty)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-[0.5rem] text-sm font-medium transition-colors ${appliedFilters.difficulty === difficulty
                    ? 'bg-purple-100 text-purple-700 border border-purple-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                  {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                </button>
              ))}

              {/* Category Chips - Show first 3 */}
              {categories.slice(0, 3).map((cat) => (
                <button
                  key={cat.category}
                  onClick={() => handleQuickFilterChange('category', cat.category)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-[0.5rem] text-sm font-medium transition-colors ${appliedFilters.category === cat.category
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                  {cat.category.charAt(0).toUpperCase() + cat.category.slice(1)}
                </button>
              ))}
              {/* Advanced Filters Button */}
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
                      {value}
                      <button
                        onClick={() => removeAppliedFilter(key as keyof FilterState)}
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
                className="text-xs text-purple-600 hover:text-purple-700 font-medium"
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
                <h3 className="text-lg font-medium text-gray-900 font-poppins">Filter Exercises</h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="p-2 hover:bg-gray-100 rounded-sm transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className='overflow-y-auto max-h-[40vh] scrollbar-none'>
                <div className="space-y-6">
                  {/* Category Filter */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-3 font-poppins">Category</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      <button
                        onClick={() => handleDraftFilterChange('category', '')}
                        className={`p-3 text-sm font-medium rounded-sm transition-colors text-left ${draftFilters.category === ''
                          ? 'bg-purple-100 text-purple-700 border-2 border-purple-200'
                          : 'bg-gray-50 text-gray-700 border-2 border-transparent hover:bg-gray-100'
                          }`}
                      >
                        All Categories
                      </button>
                      {categories.map(cat => (
                        <button
                          key={cat.category}
                          onClick={() => handleDraftFilterChange('category', cat.category)}
                          className={`p-3 text-sm font-medium rounded-sm transition-colors text-left ${draftFilters.category === cat.category
                            ? 'bg-purple-100 text-purple-700 border-2 border-purple-200'
                            : 'bg-gray-50 text-gray-700 border-2 border-transparent hover:bg-gray-100'
                            }`}
                        >
                          {cat.category.charAt(0).toUpperCase() + cat.category.slice(1)}
                          <span className="block text-xs text-gray-500 mt-1">({cat.count})</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Difficulty Filter */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-3 font-poppins">Difficulty Level</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['', 'beginner', 'intermediate', 'advanced'].map((difficulty) => (
                        <button
                          key={difficulty}
                          onClick={() => handleDraftFilterChange('difficulty', difficulty)}
                          className={`p-3 text-sm font-medium rounded-sm transition-colors ${draftFilters.difficulty === difficulty
                            ? 'bg-purple-100 text-purple-700 border-2 border-purple-200'
                            : 'bg-gray-50 text-gray-700 border-2 border-transparent hover:bg-gray-100'
                            }`}
                        >
                          {difficulty === '' ? 'All Levels' : difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Muscle Group Filter */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-3 font-poppins">Muscle Groups</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleDraftFilterChange('muscleGroup', '')}
                        className={`p-3 text-sm font-medium rounded-sm transition-colors text-left ${draftFilters.muscleGroup === ''
                          ? 'bg-purple-100 text-purple-700 border-2 border-purple-200'
                          : 'bg-gray-50 text-gray-700 border-2 border-transparent hover:bg-gray-100'
                          }`}
                      >
                        All Muscles
                      </button>
                      {muscleGroups.slice(0, 7).map(muscle => (
                        <button
                          key={muscle}
                          onClick={() => handleDraftFilterChange('muscleGroup', muscle)}
                          className={`p-3 text-sm font-medium rounded-sm transition-colors text-left ${draftFilters.muscleGroup === muscle
                            ? 'bg-purple-100 text-purple-700 border-2 border-purple-200'
                            : 'bg-gray-50 text-gray-700 border-2 border-transparent hover:bg-gray-100'
                            }`}
                        >
                          {muscle.replace('_', ' ').charAt(0).toUpperCase() + muscle.replace('_', ' ').slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Equipment Filter */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-3 font-poppins">Equipment</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleDraftFilterChange('equipment', '')}
                        className={`p-3 text-sm font-medium rounded-sm transition-colors text-left ${draftFilters.equipment === ''
                          ? 'bg-purple-100 text-purple-700 border-2 border-purple-200'
                          : 'bg-gray-50 text-gray-700 border-2 border-transparent hover:bg-gray-100'
                          }`}
                      >
                        All Equipment
                      </button>
                      {equipmentList.slice(0, 7).map(equipment => (
                        <button
                          key={equipment}
                          onClick={() => handleDraftFilterChange('equipment', equipment)}
                          className={`p-3 text-sm font-medium rounded-sm transition-colors text-left ${draftFilters.equipment === equipment
                            ? 'bg-purple-100 text-purple-700 border-2 border-purple-200'
                            : 'bg-gray-50 text-gray-700 border-2 border-transparent hover:bg-gray-100'
                            }`}
                        >
                          {equipment.replace('_', ' ').charAt(0).toUpperCase() + equipment.replace('_', ' ').slice(1)}
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
                  className="flex-1 py-3 px-4 bg-purple-600 text-white rounded-sm font-medium hover:bg-purple-700 transition-colors font-poppins"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-600 font-poppins">{error}</p>
              <button
                onClick={loadExercises}
                className="mt-2 text-red-700 hover:text-red-800 underline font-poppins"
              >
                Try again
              </button>
            </div>
          )}

          {/* Exercise Grid */}
          {exercises.length > 0 ? (
            <>
              <div className="space-y-4">
                {exercises.map((exercise) => (
                  <ExerciseCard
                    key={exercise.id}
                    exercise={exercise}
                    onClick={() => onExerciseSelect(exercise)}
                  />
                ))}
              </div>

              {/* Load More Button */}
              {currentPage < totalPages && (
                <div className="flex justify-center mt-6">
                  <button
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-poppins"
                  >
                    {loadingMore ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin inline-block mr-2" />
                        Loading...
                      </>
                    ) : (
                      'Load More'
                    )}
                  </button>
                </div>
              )}
            </>
          ) : !loading && (
            <div className="text-center py-12">
              <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2 font-poppins">No exercises found</h3>
              <p className="text-gray-600 mb-4 font-poppins">
                {hasActiveFilters
                  ? 'Try adjusting your filters to see more results.'
                  : 'No exercises are available at the moment.'
                }
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-purple-600 text-white rounded-sm hover:bg-purple-700 transition-colors font-poppins"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Exercise Card Component
const ExerciseCard: React.FC<{ exercise: Exercise; onClick: () => void }> = ({ exercise, onClick }) => {
  // Prioritize uploaded media over YouTube
  const thumbnailUrl = exercise.media?.primaryThumbnail?.fullUrl ||
    exercise.media?.primaryThumbnail?.url ||
    exercise.youtubeThumbnail ||
    exercise.thumbnailUrl;

  // Check if we have any video content (uploaded or YouTube)
  const hasVideo = exercise.media?.primaryVideo || exercise.youtubeUrl;

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
              alt={exercise.exerciseTitle}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Play className="w-6 h-6 text-gray-400" />
            </div>
          )}

          {/* Video indicator - show if we have any video */}
          {hasVideo && (
            <div className="absolute bottom-1 right-1 bg-black bg-opacity-75 rounded px-1 py-0.5">
              <Play className="w-3 h-3 text-white" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 font-poppins line-clamp-2 mb-1">
                {exercise.exerciseTitle}
              </h3>

              {/* Meta information */}
              <div className="flex items-center space-x-3 text-xs text-gray-500 mb-2">
                {exercise.duration && (
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{ExerciseService.formatDuration(exercise.duration)}</span>
                  </div>
                )}

                {exercise.calories && (
                  <div className="flex items-center space-x-1">
                    <Flame className="w-3 h-3" />
                    <span>{exercise.calories} cal</span>
                  </div>
                )}
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1">
                <span className={`px-2 py-1 rounded-[0.25rem] text-xs font-medium ${ExerciseService.getDifficultyColor(exercise.difficulty)}`}>
                  {exercise.difficulty}
                </span>

                <span className={`px-2 py-1 rounded-[0.25rem] text-xs font-medium ${ExerciseService.getCategoryColor(exercise.category)}`}>
                  {exercise.category}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
