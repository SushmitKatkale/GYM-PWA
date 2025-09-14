import React, { useState, useEffect } from 'react';
import {
  Plus, Search, Filter, Edit, Trash2, Eye, Upload, 
  X, Save, RotateCcw, Play, Pause, Volume2, 
  AlertCircle, CheckCircle, Clock, Users, Target,
  Dumbbell, Heart, Zap, FileVideo, Image as ImageIcon
} from 'lucide-react';
import { Exercise, exerciseService, ExerciseService } from '../../services/exerciseService';

interface ExerciseManagementProps {
  className?: string;
}

type ModalType = 'create' | 'edit' | 'view' | 'delete' | 'media' | null;

interface ExerciseFormData {
  exerciseTitle: string;
  description: string;
  instructions: string;
  youtubeUrl: string;
  thumbnailUrl: string;
  duration: number | '';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  muscleGroups: string[];
  equipmentNeeded: string[];
  calories: number | '';
  sets: number | '';
  reps: string;
  restTime: number | '';
  tags: string[];
  isPublic: boolean;
  gymId: number | '';
}

const initialFormData: ExerciseFormData = {
  exerciseTitle: '',
  description: '',
  instructions: '',
  youtubeUrl: '',
  thumbnailUrl: '',
  duration: '',
  difficulty: 'beginner',
  category: '',
  muscleGroups: [],
  equipmentNeeded: [],
  calories: '',
  sets: '',
  reps: '',
  restTime: '',
  tags: [],
  isPublic: true,
  gymId: ''
};

export const ExerciseManagement: React.FC<ExerciseManagementProps> = ({ className = '' }) => {
  // State management
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Modal and form state
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [formData, setFormData] = useState<ExerciseFormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<Partial<ExerciseFormData>>({});
  const [submitting, setSubmitting] = useState(false);

  // Filter and search state
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Media upload state
  const [mediaFiles, setMediaFiles] = useState<{
    video: File | null;
    thumbnail: File | null;
  }>({ video: null, thumbnail: null });
  const [mediaUploading, setMediaUploading] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  // Categories and options
  const categories = [
    'strength', 'cardio', 'flexibility', 'balance', 'sports', 
    'yoga', 'pilates', 'crossfit', 'bodyweight', 'weightlifting'
  ];

  const muscleGroups = [
    'chest', 'back', 'shoulders', 'biceps', 'triceps', 'forearms',
    'abs', 'obliques', 'lower_back', 'quadriceps', 'hamstrings',
    'calves', 'glutes', 'full_body'
  ];

  const equipment = [
    'none', 'dumbbells', 'barbell', 'kettlebell', 'resistance_bands',
    'pull_up_bar', 'bench', 'cable_machine', 'treadmill', 'stationary_bike'
  ];

  // Load exercises
  useEffect(() => {
    loadExercises();
  }, [currentPage]);

  // Filter exercises
  useEffect(() => {
    filterExercises();
  }, [exercises, searchTerm, categoryFilter, difficultyFilter, statusFilter]);

  const loadExercises = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await exerciseService.getExercises({
        page: currentPage,
        limit: itemsPerPage,
        includePrivate: true
      });

      if (response.success) {
        setExercises(response.data.exercises);
        setTotalPages(response.data.pagination.totalPages);
        setTotalItems(response.data.pagination.totalItems);
      }
    } catch (err) {
      setError('Failed to load exercises');
      console.error('Error loading exercises:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterExercises = () => {
    let filtered = [...exercises];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(exercise =>
        exercise.exerciseTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exercise.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exercise.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (categoryFilter) {
      filtered = filtered.filter(exercise => exercise.category === categoryFilter);
    }

    // Difficulty filter
    if (difficultyFilter) {
      filtered = filtered.filter(exercise => exercise.difficulty === difficultyFilter);
    }

    // Status filter
    if (statusFilter) {
      if (statusFilter === 'public') {
        filtered = filtered.filter(exercise => exercise.isPublic);
      } else if (statusFilter === 'private') {
        filtered = filtered.filter(exercise => !exercise.isPublic);
      }
    }

    setFilteredExercises(filtered);
  };

  // Form handlers
  const handleInputChange = (field: keyof ExerciseFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleArrayInputChange = (field: 'muscleGroups' | 'equipmentNeeded' | 'tags', value: string) => {
    const array = formData[field];
    if (array.includes(value)) {
      handleInputChange(field, array.filter(item => item !== value));
    } else {
      handleInputChange(field, [...array, value]);
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<ExerciseFormData> = {};

    if (!formData.exerciseTitle.trim()) {
      errors.exerciseTitle = 'Exercise title is required';
    }

    if (!formData.category) {
      errors.category = 'Category is required';
    }

    if (!formData.description?.trim()) {
      errors.description = 'Description is required';
    }

    if (formData.duration && formData.duration <= 0) {
      errors.duration = 'Duration must be positive';
    }

    if (formData.calories && formData.calories <= 0) {
      errors.calories = 'Calories must be positive';
    }

    if (formData.sets && formData.sets <= 0) {
      errors.sets = 'Sets must be positive';
    }

    if (formData.restTime && formData.restTime < 0) {
      errors.restTime = 'Rest time cannot be negative';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // CRUD operations
  const handleCreateExercise = () => {
    setActiveModal('create');
    setFormData(initialFormData);
    setFormErrors({});
  };

  const handleEditExercise = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setFormData({
      exerciseTitle: exercise.exerciseTitle,
      description: exercise.description || '',
      instructions: exercise.instructions || '',
      youtubeUrl: exercise.youtubeUrl || '',
      thumbnailUrl: exercise.thumbnailUrl || '',
      duration: exercise.duration || '',
      difficulty: exercise.difficulty,
      category: exercise.category,
      muscleGroups: exercise.muscleGroups || [],
      equipmentNeeded: exercise.equipmentNeeded || [],
      calories: exercise.calories || '',
      sets: exercise.sets || '',
      reps: exercise.reps || '',
      restTime: exercise.restTime || '',
      tags: exercise.tags || [],
      isPublic: exercise.isPublic,
      gymId: exercise.gymId || ''
    });
    setActiveModal('edit');
    setFormErrors({});
  };

  const handleViewExercise = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setActiveModal('view');
  };

  const handleDeleteExercise = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setActiveModal('delete');
  };

  const handleManageMedia = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setActiveModal('media');
    setMediaFiles({ video: null, thumbnail: null });
  };

  const submitForm = async () => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      setError(null);

      const exerciseData = {
        ...formData,
        duration: formData.duration || undefined,
        calories: formData.calories || undefined,
        sets: formData.sets || undefined,
        restTime: formData.restTime || undefined,
        gymId: formData.gymId || undefined,
        muscleGroups: formData.muscleGroups.length > 0 ? formData.muscleGroups : undefined,
        equipmentNeeded: formData.equipmentNeeded.length > 0 ? formData.equipmentNeeded : undefined,
        tags: formData.tags.length > 0 ? formData.tags : undefined
      };

      if (activeModal === 'create') {
        await exerciseService.createExercise(exerciseData);
        setSuccess('Exercise created successfully');
      } else if (activeModal === 'edit' && selectedExercise) {
        await exerciseService.updateExercise(selectedExercise.id, exerciseData);
        setSuccess('Exercise updated successfully');
      }

      await loadExercises();
      setActiveModal(null);
    } catch (err: any) {
      setError(err.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!selectedExercise) return;

    try {
      setSubmitting(true);
      await exerciseService.deleteExercise(selectedExercise.id);
      setSuccess('Exercise deleted successfully');
      await loadExercises();
      setActiveModal(null);
    } catch (err: any) {
      setError(err.message || 'Failed to delete exercise');
    } finally {
      setSubmitting(false);
    }
  };

  const uploadMedia = async () => {
    if (!selectedExercise || (!mediaFiles.video && !mediaFiles.thumbnail)) return;

    try {
      setMediaUploading(true);
      setError(null);

      await exerciseService.uploadExerciseMedia(
        selectedExercise.id,
        {
          video: mediaFiles.video || undefined,
          thumbnail: mediaFiles.thumbnail || undefined
        },
        {
          video: `${selectedExercise.exerciseTitle} - Video`,
          thumbnail: `${selectedExercise.exerciseTitle} - Thumbnail`
        }
      );

      setSuccess('Media uploaded successfully');
      setMediaFiles({ video: null, thumbnail: null });
      await loadExercises();
    } catch (err: any) {
      setError(err.message || 'Failed to upload media');
    } finally {
      setMediaUploading(false);
    }
  };

  const toggleVisibility = async (exercise: Exercise) => {
    try {
      await exerciseService.toggleExerciseVisibility(exercise.id);
      setSuccess(`Exercise ${exercise.isPublic ? 'made private' : 'made public'}`);
      await loadExercises();
    } catch (err: any) {
      setError(err.message || 'Failed to update visibility');
    }
  };

  const deleteMedia = async (exerciseId: number, mediaId: number, mediaType: 'video' | 'thumbnail') => {
    if (!confirm(`Are you sure you want to delete this ${mediaType}? This action cannot be undone.`)) {
      return;
    }

    try {
      setError(null);
      await exerciseService.deleteExerciseMedia(mediaId);
      setSuccess(`${mediaType.charAt(0).toUpperCase() + mediaType.slice(1)} deleted successfully`);
      await loadExercises();
      
      // If we're in the media modal, refresh the selected exercise
      if (selectedExercise && selectedExercise.id === exerciseId) {
        const updatedExercise = await exerciseService.getExerciseById(exerciseId);
        if (updatedExercise.success) {
          setSelectedExercise(updatedExercise.data);
        }
      }
    } catch (err: any) {
      setError(err.message || `Failed to delete ${mediaType}`);
    }
  };

  // Clear messages after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <div className={`bg-white rounded-lg shadow-sm ${className}`}>
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Exercise Management</h2>
            <p className="text-gray-600">Manage exercises, upload media, and control visibility</p>
          </div>
          <button
            onClick={handleCreateExercise}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Exercise</span>
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search exercises..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>

          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">All Difficulties</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="mx-6 mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span className="text-green-800">{success}</span>
        </div>
      )}

      {error && (
        <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-red-800">{error}</span>
        </div>
      )}

      {/* Exercise List */}
      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <span className="ml-2 text-gray-600">Loading exercises...</span>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Exercise
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Difficulty
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Media
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredExercises.map((exercise) => (
                    <tr key={exercise.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {exercise.media?.primaryThumbnail ? (
                              <img
                                className="h-10 w-10 rounded-lg object-cover"
                                src={exercise.media.primaryThumbnail.fullUrl || exercise.media.primaryThumbnail.url}
                                alt={exercise.exerciseTitle}
                              />
                            ) : exercise.thumbnailUrl ? (
                              <img
                                className="h-10 w-10 rounded-lg object-cover"
                                src={exercise.thumbnailUrl}
                                alt={exercise.exerciseTitle}
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                                <Dumbbell className="w-5 h-5 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {exercise.exerciseTitle}
                            </div>
                            <div className="text-sm text-gray-500">
                              {exercise.description ? exercise.description.substring(0, 50) + '...' : 'No description'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${ExerciseService.getCategoryColor(exercise.category)}`}>
                          {exercise.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${ExerciseService.getDifficultyColor(exercise.difficulty)}`}>
                          {exercise.difficulty}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => toggleVisibility(exercise)}
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full transition-colors ${
                            exercise.isPublic 
                              ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                              : 'bg-red-100 text-red-800 hover:bg-red-200'
                          }`}
                        >
                          {exercise.isPublic ? 'Public' : 'Private'}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {exercise.media?.primaryVideo && (
                            <div className="flex items-center space-x-1">
                              <FileVideo className="w-4 h-4 text-blue-500" title="Has uploaded video" />
                              <span className="text-xs text-blue-600 font-medium">Video</span>
                            </div>
                          )}
                          {exercise.media?.primaryThumbnail && (
                            <div className="flex items-center space-x-1">
                              <ImageIcon className="w-4 h-4 text-green-500" title="Has uploaded thumbnail" />
                              <span className="text-xs text-green-600 font-medium">Thumb</span>
                            </div>
                          )}
                          {exercise.youtubeUrl && (
                            <div className="flex items-center space-x-1">
                              <Play className="w-4 h-4 text-red-500" title="YouTube video" />
                              <span className="text-xs text-red-600 font-medium">YT</span>
                            </div>
                          )}
                          {!exercise.media?.primaryVideo && !exercise.media?.primaryThumbnail && !exercise.youtubeUrl && (
                            <span className="text-gray-400 text-xs">No media</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleViewExercise(exercise)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditExercise(exercise)}
                            className="text-indigo-600 hover:text-indigo-900 p-1 rounded"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleManageMedia(exercise)}
                            className="text-green-600 hover:text-green-900 p-1 rounded"
                            title="Manage Media"
                          >
                            <Upload className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteExercise(exercise)}
                            className="text-red-600 hover:text-red-900 p-1 rounded"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} exercises
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1 text-sm">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      {activeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Create/Edit Modal */}
            {(activeModal === 'create' || activeModal === 'edit') && (
              <>
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {activeModal === 'create' ? 'Create Exercise' : 'Edit Exercise'}
                  </h3>
                  <button
                    onClick={() => setActiveModal(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form className="p-6 space-y-6">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Exercise Title *
                      </label>
                      <input
                        type="text"
                        value={formData.exerciseTitle}
                        onChange={(e) => handleInputChange('exerciseTitle', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                          formErrors.exerciseTitle ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Enter exercise title"
                      />
                      {formErrors.exerciseTitle && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.exerciseTitle}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category *
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => handleInputChange('category', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                          formErrors.category ? 'border-red-300' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Select category</option>
                        {categories.map(category => (
                          <option key={category} value={category}>
                            {category.charAt(0).toUpperCase() + category.slice(1)}
                          </option>
                        ))}
                      </select>
                      {formErrors.category && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.category}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Difficulty
                      </label>
                      <select
                        value={formData.difficulty}
                        onChange={(e) => handleInputChange('difficulty', e.target.value as 'beginner' | 'intermediate' | 'advanced')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Duration (minutes)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.duration}
                        onChange={(e) => handleInputChange('duration', e.target.value ? parseInt(e.target.value) : '')}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                          formErrors.duration ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Enter duration"
                      />
                      {formErrors.duration && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.duration}</p>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={3}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                        formErrors.description ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Describe the exercise"
                    />
                    {formErrors.description && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.description}</p>
                    )}
                  </div>

                  {/* Instructions */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Instructions
                    </label>
                    <textarea
                      value={formData.instructions}
                      onChange={(e) => handleInputChange('instructions', e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Step-by-step instructions"
                    />
                  </div>

                  {/* Video URLs */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        YouTube URL
                      </label>
                      <input
                        type="url"
                        value={formData.youtubeUrl}
                        onChange={(e) => handleInputChange('youtubeUrl', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="https://youtube.com/watch?v=..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Thumbnail URL
                      </label>
                      <input
                        type="url"
                        value={formData.thumbnailUrl}
                        onChange={(e) => handleInputChange('thumbnailUrl', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="https://example.com/thumbnail.jpg"
                      />
                    </div>
                  </div>

                  {/* Exercise Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Calories
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.calories}
                        onChange={(e) => handleInputChange('calories', e.target.value ? parseInt(e.target.value) : '')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sets
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.sets}
                        onChange={(e) => handleInputChange('sets', e.target.value ? parseInt(e.target.value) : '')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Reps
                      </label>
                      <input
                        type="text"
                        value={formData.reps}
                        onChange={(e) => handleInputChange('reps', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="e.g., 10-12"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rest Time (sec)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.restTime}
                        onChange={(e) => handleInputChange('restTime', e.target.value ? parseInt(e.target.value) : '')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Muscle Groups */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Target Muscle Groups
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {muscleGroups.map(muscle => (
                        <label key={muscle} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.muscleGroups.includes(muscle)}
                            onChange={() => handleArrayInputChange('muscleGroups', muscle)}
                            className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">
                            {muscle.replace('_', ' ').charAt(0).toUpperCase() + muscle.replace('_', ' ').slice(1)}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Equipment */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Equipment Needed
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {equipment.map(equip => (
                        <label key={equip} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.equipmentNeeded.includes(equip)}
                            onChange={() => handleArrayInputChange('equipmentNeeded', equip)}
                            className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">
                            {equip.replace('_', ' ').charAt(0).toUpperCase() + equip.replace('_', ' ').slice(1)}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tags (comma separated)
                    </label>
                    <input
                      type="text"
                      value={formData.tags.join(', ')}
                      onChange={(e) => handleInputChange('tags', e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="fitness, strength, gym"
                    />
                  </div>

                  {/* Visibility */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isPublic}
                      onChange={(e) => handleInputChange('isPublic', e.target.checked)}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <label className="ml-2 text-sm text-gray-700">
                      Make this exercise public
                    </label>
                  </div>
                </form>

                <div className="flex justify-end space-x-3 px-6 py-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={submitForm}
                    disabled={submitting}
                    className="px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>{activeModal === 'create' ? 'Create Exercise' : 'Update Exercise'}</span>
                      </>
                    )}
                  </button>
                </div>
              </>
            )}

            {/* View Modal */}
            {activeModal === 'view' && selectedExercise && (
              <>
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Exercise Details</h3>
                  <button
                    onClick={() => setActiveModal(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="p-6 space-y-6">
                  <div className="flex items-start space-x-6">
                    <div className="flex-shrink-0">
                      {selectedExercise.media?.primaryThumbnail ? (
                        <img
                          src={selectedExercise.media.primaryThumbnail.fullUrl || selectedExercise.media.primaryThumbnail.url}
                          alt={selectedExercise.exerciseTitle}
                          className="w-32 h-32 object-cover rounded-lg"
                        />
                      ) : selectedExercise.thumbnailUrl ? (
                        <img
                          src={selectedExercise.thumbnailUrl}
                          alt={selectedExercise.exerciseTitle}
                          className="w-32 h-32 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                          <Dumbbell className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-gray-900 mb-2">
                        {selectedExercise.exerciseTitle}
                      </h2>
                      <div className="flex items-center space-x-4 mb-4">
                        <span className={`px-3 py-1 text-sm font-medium rounded-full ${ExerciseService.getDifficultyColor(selectedExercise.difficulty)}`}>
                          {selectedExercise.difficulty}
                        </span>
                        <span className={`px-3 py-1 text-sm font-medium rounded-full ${ExerciseService.getCategoryColor(selectedExercise.category)}`}>
                          {selectedExercise.category}
                        </span>
                        <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                          selectedExercise.isPublic 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {selectedExercise.isPublic ? 'Public' : 'Private'}
                        </span>
                      </div>
                      <p className="text-gray-600">{selectedExercise.description}</p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {selectedExercise.duration && (
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <Clock className="w-6 h-6 text-purple-600 mx-auto mb-1" />
                        <p className="text-sm text-gray-500">Duration</p>
                        <p className="font-medium">{ExerciseService.formatDuration(selectedExercise.duration)}</p>
                      </div>
                    )}

                    {selectedExercise.calories && (
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <Zap className="w-6 h-6 text-orange-600 mx-auto mb-1" />
                        <p className="text-sm text-gray-500">Calories</p>
                        <p className="font-medium">{selectedExercise.calories}</p>
                      </div>
                    )}

                    {selectedExercise.sets && (
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <Target className="w-6 h-6 text-green-600 mx-auto mb-1" />
                        <p className="text-sm text-gray-500">Sets</p>
                        <p className="font-medium">{selectedExercise.sets}</p>
                      </div>
                    )}

                    {selectedExercise.reps && (
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <RotateCcw className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                        <p className="text-sm text-gray-500">Reps</p>
                        <p className="font-medium">{selectedExercise.reps}</p>
                      </div>
                    )}
                  </div>

                  {/* Instructions */}
                  {selectedExercise.instructions && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Instructions</h3>
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-gray-700 whitespace-pre-wrap">{selectedExercise.instructions}</p>
                      </div>
                    </div>
                  )}

                  {/* Muscle Groups */}
                  {Array.isArray(selectedExercise.muscleGroups) && selectedExercise.muscleGroups.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Target Muscles</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedExercise.muscleGroups.map(muscle => (
                          <span key={muscle} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                            {muscle.replace('_', ' ').charAt(0).toUpperCase() + muscle.replace('_', ' ').slice(1)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Equipment */}
                  {Array.isArray(selectedExercise.equipmentNeeded) && selectedExercise.equipmentNeeded.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Equipment Needed</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedExercise.equipmentNeeded.map(equip => (
                          <span key={equip} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                            {equip.replace('_', ' ').charAt(0).toUpperCase() + equip.replace('_', ' ').slice(1)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-3 px-6 py-4 border-t border-gray-200">
                  <button
                    onClick={() => setActiveModal(null)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => handleEditExercise(selectedExercise)}
                    className="px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-lg hover:bg-purple-700 flex items-center space-x-2"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit Exercise</span>
                  </button>
                </div>
              </>
            )}

            {/* Delete Modal */}
            {activeModal === 'delete' && selectedExercise && (
              <>
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Delete Exercise</h3>
                  <button
                    onClick={() => setActiveModal(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                      <AlertCircle className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">Are you sure?</h3>
                      <p className="text-gray-600">
                        This will permanently delete "{selectedExercise.exerciseTitle}" and all associated media. This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 px-6 py-4 border-t border-gray-200">
                  <button
                    onClick={() => setActiveModal(null)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    disabled={submitting}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Deleting...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        <span>Delete Exercise</span>
                      </>
                    )}
                  </button>
                </div>
              </>
            )}

            {/* Media Modal */}
            {activeModal === 'media' && selectedExercise && (
              <>
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Manage Media - {selectedExercise.exerciseTitle}
                  </h3>
                  <button
                    onClick={() => setActiveModal(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="p-6 space-y-6">
                  {/* Current Media */}
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-4">Current Media</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Current Video */}
                      <div className="border border-gray-200 rounded-lg p-4">
                        <h5 className="font-medium text-gray-700 mb-2 flex items-center">
                          <FileVideo className="w-4 h-4 mr-2" />
                          Video
                        </h5>
                          {selectedExercise.media?.primaryVideo ? (
                          <div className="space-y-2">
                            <video
                              src={selectedExercise.media.primaryVideo.fullUrl || selectedExercise.media.primaryVideo.url}
                              className="w-full h-32 object-cover rounded"
                              controls
                              preload="metadata"
                            />
                            <div className="flex justify-between items-center">
                              <p className="text-xs text-gray-500">
                                {selectedExercise.media.primaryVideo.mimeType}
                              </p>
                              <button
                                onClick={() => deleteMedia(selectedExercise.id, selectedExercise.media?.primaryVideo?.id!, 'video')}
                                className="text-red-500 hover:text-red-700 p-1 rounded"
                                title="Delete video"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ) : selectedExercise.youtubeUrl ? (
                          <div className="space-y-2">
                            <div className="w-full h-32 bg-gray-100 rounded flex items-center justify-center">
                              <Play className="w-8 h-8 text-red-500" />
                            </div>
                            <p className="text-xs text-gray-500">YouTube Video</p>
                          </div>
                        ) : (
                          <div className="w-full h-32 bg-gray-100 rounded flex items-center justify-center">
                            <FileVideo className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                      </div>

                      {/* Current Thumbnail */}
                      <div className="border border-gray-200 rounded-lg p-4">
                        <h5 className="font-medium text-gray-700 mb-2 flex items-center">
                          <ImageIcon className="w-4 h-4 mr-2" />
                          Thumbnail
                        </h5>
                          {selectedExercise.media?.primaryThumbnail ? (
                          <div className="space-y-2">
                            <img
                              src={selectedExercise.media.primaryThumbnail.fullUrl || selectedExercise.media.primaryThumbnail.url}
                              alt="Thumbnail"
                              className="w-full h-32 object-cover rounded"
                            />
                            <div className="flex justify-between items-center">
                              <p className="text-xs text-gray-500">
                                {selectedExercise.media.primaryThumbnail.mimeType}
                              </p>
                              <button
                                onClick={() => deleteMedia(selectedExercise.id, selectedExercise.media?.primaryThumbnail?.id!, 'thumbnail')}
                                className="text-red-500 hover:text-red-700 p-1 rounded"
                                title="Delete thumbnail"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ) : selectedExercise.thumbnailUrl ? (
                          <div className="space-y-2">
                            <img
                              src={selectedExercise.thumbnailUrl}
                              alt="Thumbnail"
                              className="w-full h-32 object-cover rounded"
                            />
                            <p className="text-xs text-gray-500">External URL</p>
                          </div>
                        ) : (
                          <div className="w-full h-32 bg-gray-100 rounded flex items-center justify-center">
                            <ImageIcon className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Upload New Media */}
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-4">Upload New Media</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Video Upload */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Upload Video
                        </label>
                        <input
                          type="file"
                          accept="video/*"
                          onChange={(e) => setMediaFiles(prev => ({ ...prev, video: e.target.files?.[0] || null }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                        {mediaFiles.video && (
                          <p className="mt-1 text-sm text-gray-500">
                            Selected: {mediaFiles.video.name}
                          </p>
                        )}
                      </div>

                      {/* Thumbnail Upload */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Upload Thumbnail
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setMediaFiles(prev => ({ ...prev, thumbnail: e.target.files?.[0] || null }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                        {mediaFiles.thumbnail && (
                          <p className="mt-1 text-sm text-gray-500">
                            Selected: {mediaFiles.thumbnail.name}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 px-6 py-4 border-t border-gray-200">
                  <button
                    onClick={() => setActiveModal(null)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={uploadMedia}
                    disabled={mediaUploading || (!mediaFiles.video && !mediaFiles.thumbnail)}
                    className="px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {mediaUploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        <span>Upload Media</span>
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExerciseManagement;
