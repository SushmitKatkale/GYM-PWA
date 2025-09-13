import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Filter, Clock, Flame, Users, Star, 
  Play, ArrowLeft, ChevronDown, X, Loader2, 
  Target, Zap, Heart, Dumbbell 
} from 'lucide-react';
import { exerciseService, Exercise, ExerciseFilters, ExerciseService } from '../../services/exerciseService';
import { VideoPlayer } from '../common/VideoPlayer';

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
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState<{ category: string; count: number }[]>([]);
  const [muscleGroups, setMuscleGroups] = useState<string[]>([]);
  const [equipmentList, setEquipmentList] = useState<string[]>([]);
  
  const [filters, setFilters] = useState<FilterState>({
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

  // Handle search with debouncing
  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeout = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchInput }));
      setCurrentPage(1);
    }, 500);

    setSearchTimeout(timeout);

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [searchInput]);

  // Reload exercises when filters change
  useEffect(() => {
    if (filters.category || filters.difficulty || filters.muscleGroup || filters.equipment || filters.search) {
      loadExercises();
    }
  }, [filters, currentPage]);

  const loadExercises = async () => {
    try {
      setLoading(true);
      setError(null);

      const exerciseFilters: ExerciseFilters = {
        page: currentPage,
        limit: 20,
        includePrivate: false // Only show public exercises for regular users
      };

      // Add non-empty filters
      if (filters.category) exerciseFilters.category = filters.category;
      if (filters.difficulty) exerciseFilters.difficulty = filters.difficulty;
      if (filters.muscleGroup) exerciseFilters.muscleGroup = filters.muscleGroup;
      if (filters.equipment) exerciseFilters.equipment = filters.equipment;
      if (filters.search) exerciseFilters.search = filters.search;

      const response = await exerciseService.getExercises(exerciseFilters);
      
      if (response.success) {
        setExercises(response.data.exercises);
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

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      difficulty: '',
      muscleGroup: '',
      equipment: '',
      search: ''
    });
    setSearchInput('');
    setCurrentPage(1);
  };

  const hasActiveFilters = useMemo(() => {
    return Object.values(filters).some(value => value !== '');
  }, [filters]);

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
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={onBack}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-lg font-semibold text-gray-900 font-poppins">Exercises</h1>
                <p className="text-sm text-gray-500">{totalItems} exercises available</p>
              </div>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-full transition-colors ${
                showFilters || hasActiveFilters 
                  ? 'bg-purple-100 text-purple-600' 
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              <Filter className="w-5 h-5" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="mt-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search exercises..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-poppins"
              />
            </div>
          </div>

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="mt-3 flex flex-wrap gap-2">
              {Object.entries(filters).map(([key, value]) => {
                if (!value) return null;
                return (
                  <div
                    key={key}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium"
                  >
                    <span className="capitalize">{key}: {value}</span>
                    <button
                      onClick={() => handleFilterChange(key as keyof FilterState, '')}
                      className="hover:bg-purple-200 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
              <button
                onClick={clearFilters}
                className="text-xs text-gray-500 hover:text-gray-700 underline"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="border-t border-gray-200 bg-gray-50 p-4">
            <div className="space-y-4">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-poppins">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-poppins"
                >
                  <option value="">All categories</option>
                  {categories.map(cat => (
                    <option key={cat.category} value={cat.category}>
                      {cat.category.charAt(0).toUpperCase() + cat.category.slice(1)} ({cat.count})
                    </option>
                  ))}
                </select>
              </div>

              {/* Difficulty Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-poppins">Difficulty</label>
                <select
                  value={filters.difficulty}
                  onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-poppins"
                >
                  <option value="">All levels</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              {/* Muscle Group Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-poppins">Muscle Group</label>
                <select
                  value={filters.muscleGroup}
                  onChange={(e) => handleFilterChange('muscleGroup', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-poppins"
                >
                  <option value="">All muscle groups</option>
                  {muscleGroups.map(muscle => (
                    <option key={muscle} value={muscle}>
                      {muscle.replace('_', ' ').charAt(0).toUpperCase() + muscle.replace('_', ' ').slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Equipment Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-poppins">Equipment</label>
                <select
                  value={filters.equipment}
                  onChange={(e) => handleFilterChange('equipment', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-poppins"
                >
                  <option value="">All equipment</option>
                  {equipmentList.map(equipment => (
                    <option key={equipment} value={equipment}>
                      {equipment.replace('_', ' ').charAt(0).toUpperCase() + equipment.replace('_', ' ').slice(1)}
                    </option>
                  ))}
                </select>
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
                  disabled={loading}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-poppins"
                >
                  {loading ? (
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
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-poppins"
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Exercise Card Component
const ExerciseCard: React.FC<{ exercise: Exercise; onClick: () => void }> = ({ exercise, onClick }) => {
  const thumbnailUrl = exercise.youtubeThumbnail || exercise.thumbnailUrl;
  
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
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
          
          {/* Video indicator */}
          {exercise.youtubeUrl && (
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
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ExerciseService.getDifficultyColor(exercise.difficulty)}`}>
                  {exercise.difficulty}
                </span>
                
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ExerciseService.getCategoryColor(exercise.category)}`}>
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
