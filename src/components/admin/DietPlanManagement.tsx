import React, { useState, useEffect } from 'react';
import {
  Plus, Search, Filter, Edit, Trash2, Eye, Archive,
  X, Save, Users, Target, ChefHat, Activity,
  AlertCircle, CheckCircle, Clock, Calendar,
  Apple, TrendingUp, Scale, Zap, User, Minus, Settings,
  Upload, Image as ImageIcon, Loader
} from 'lucide-react';
import { dietService } from '../../services/dietService';
import { imageService } from '../../services/imageService';
import { DietPlan } from '../../models/Diet';

interface DietPlanManagementProps {
  className?: string;
}

type ModalType = 'create' | 'edit' | 'view' | 'delete' | 'meals' | null;

interface DietPlanFormData {
  title: string;
  description: string;
  user_id: number | '';
  trainer_id: number | '';
  calories: number | '';
  protein_g: number | '';
  carbs_g: number | '';
  fats_g: number | '';
  goal: string;
  dietary_restrictions: string[];
  notes: string;
  status: 'active' | 'archived';
}

const initialFormData: DietPlanFormData = {
  title: '',
  description: '',
  user_id: '',
  trainer_id: '',
  calories: '',
  protein_g: '',
  carbs_g: '',
  fats_g: '',
  goal: '',
  dietary_restrictions: [],
  notes: '',
  status: 'active'
};

export const DietPlanManagement: React.FC<DietPlanManagementProps> = ({ className = '' }) => {
  // State management
  const [dietPlans, setDietPlans] = useState<DietPlan[]>([]);
  const [filteredDietPlans, setFilteredDietPlans] = useState<DietPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Modal and form state
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [selectedDietPlan, setSelectedDietPlan] = useState<DietPlan | null>(null);
  const [formData, setFormData] = useState<DietPlanFormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<Partial<DietPlanFormData>>({});
  const [submitting, setSubmitting] = useState(false);

  // Filter and search state
  const [searchTerm, setSearchTerm] = useState('');
  const [goalFilter, setGoalFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [trainerFilter, setTrainerFilter] = useState('');

  // Bulk operations
  const [selectedPlans, setSelectedPlans] = useState<number[]>([]);
  const [bulkOperating, setBulkOperating] = useState(false);

  // Options data
  const [users, setUsers] = useState<any[]>([]);
  const [trainers, setTrainers] = useState<any[]>([]);
  
  // Meal management state
  const [dietPlanMeals, setDietPlanMeals] = useState<any[]>([]);
  const [mealModifications, setMealModifications] = useState<any[]>([]);
  const [loadingMeals, setLoadingMeals] = useState(false);
  const [showAddMealModal, setShowAddMealModal] = useState(false);
  const [newMeal, setNewMeal] = useState({
    meal_type: 'breakfast',
    name: '',
    description: '',
    calories: '',
    protein: '',
    carbs: '',
    fats: '',
    is_mandatory: true,
    instructions: '',
    image_url: ''
  });
  
  // Image upload state
  const [uploadingImage, setUploadingImage] = useState<string | null>(null); // Track which meal is being uploaded
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  // Goal options
  const goalOptions = [
    'weight_loss',
    'muscle_gain',
    'maintenance',
    'athletic_performance',
    'general_health'
  ];

  // Dietary restrictions options
  const dietaryRestrictionsOptions = [
    'vegetarian',
    'vegan',
    'gluten_free',
    'dairy_free',
    'keto',
    'paleo',
    'mediterranean',
    'low_carb',
    'low_fat'
  ];

  // Load data
  useEffect(() => {
    loadDietPlans();
    loadUsers();
    loadTrainers();
  }, [currentPage]);

  // Filter diet plans
  useEffect(() => {
    filterDietPlans();
  }, [dietPlans, searchTerm, goalFilter, statusFilter, trainerFilter]);

  const loadDietPlans = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await dietService.getAllDietPlans({
        page: currentPage,
        limit: itemsPerPage
      });

      if (response.success && response.data) {
        setDietPlans(response.data.dietPlans);
        setTotalPages(response.data.pagination.totalPages);
        setTotalItems(response.data.pagination.total);
      }
    } catch (err) {
      setError('Failed to load diet plans');
      console.error('Error loading diet plans:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await dietService.getRegularUsers();
      if (response.success) {
        setUsers(response.data.users || []);
      }
    } catch (err) {
      console.error('Error loading users:', err);
    }
  };

  const loadTrainers = async () => {
    try {
      const response = await dietService.getTrainers();
      if (response.success) {
        setTrainers(response.data.users || []);
      }
    } catch (err) {
      console.error('Error loading trainers:', err);
    }
  };

  const filterDietPlans = () => {
    let filtered = [...dietPlans];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(plan =>
        plan.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.trainer?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Goal filter
    if (goalFilter) {
      filtered = filtered.filter(plan => plan.goal === goalFilter);
    }

    // Status filter
    if (statusFilter) {
      filtered = filtered.filter(plan => plan.status === statusFilter);
    }

    // Trainer filter
    if (trainerFilter) {
      filtered = filtered.filter(plan => 
        plan.trainer?.id?.toString() === trainerFilter
      );
    }

    setFilteredDietPlans(filtered);
  };

  // Form handlers
  const handleInputChange = (field: keyof DietPlanFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleArrayInputChange = (field: 'dietary_restrictions', value: string) => {
    const array = formData[field];
    if (array.includes(value)) {
      handleInputChange(field, array.filter(item => item !== value));
    } else {
      handleInputChange(field, [...array, value]);
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<DietPlanFormData> = {};

    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    }

    if (!formData.user_id) {
      errors.user_id = 'User is required';
    }

    if (!formData.goal) {
      errors.goal = 'Goal is required';
    }

    if (formData.calories && formData.calories <= 0) {
      errors.calories = 'Calories must be positive';
    }

    if (formData.protein_g && formData.protein_g < 0) {
      errors.protein_g = 'Protein cannot be negative';
    }

    if (formData.carbs_g && formData.carbs_g < 0) {
      errors.carbs_g = 'Carbs cannot be negative';
    }

    if (formData.fats_g && formData.fats_g < 0) {
      errors.fats_g = 'Fats cannot be negative';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // CRUD operations
  const handleCreateDietPlan = () => {
    setActiveModal('create');
    setFormData(initialFormData);
    setFormErrors({});
  };

  const handleEditDietPlan = (plan: DietPlan) => {
    setSelectedDietPlan(plan);
    setFormData({
      title: plan.name || plan.title || '',
      description: plan.description || '',
      user_id: plan.user_id,
      trainer_id: plan.trainer_id || '',
      calories: plan.target_calories || '',
      protein_g: plan.target_protein || '',
      carbs_g: plan.target_carbs || '',
      fats_g: plan.target_fat || '',
      goal: plan.goal || '',
      dietary_restrictions: [], // Would come from API
      notes: plan.notes || '',
      status: plan.status
    });
    setActiveModal('edit');
    setFormErrors({});
  };

  const handleViewDietPlan = (plan: DietPlan) => {
    setSelectedDietPlan(plan);
    setActiveModal('view');
  };

  const handleDeleteDietPlan = (plan: DietPlan) => {
    setSelectedDietPlan(plan);
    setActiveModal('delete');
  };
  
  const handleManageMeals = async (plan: DietPlan) => {
    try {
      setSelectedDietPlan(plan);
      setLoadingMeals(true);
      
      // Load meals for the selected diet plan
      const response = await dietService.getDietPlanMeals(plan.id);
      if (response.success && response.data) {
        const meals = response.data.meals || [];
        setDietPlanMeals(meals);
        setMealModifications(meals.map(meal => ({ ...meal })));
      } else {
        setDietPlanMeals([]);
        setMealModifications([]);
      }
      
      setActiveModal('meals');
    } catch (err) {
      console.error('Error loading meals:', err);
      setDietPlanMeals([]);
      setMealModifications([]);
      setActiveModal('meals');
    } finally {
      setLoadingMeals(false);
    }
  };

  const submitForm = async () => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      setError(null);

      const planData = {
        user_id: formData.user_id,
        trainer_id: formData.trainer_id || undefined,
        title: formData.title,
        description: formData.description,
        calories: formData.calories || undefined,
        protein_g: formData.protein_g || undefined,
        carbs_g: formData.carbs_g || undefined,
        fats_g: formData.fats_g || undefined,
        status: formData.status,
        // Additional fields would be added based on API requirements
        goal: formData.goal,
        notes: formData.notes
      };

      if (activeModal === 'create') {
        await dietService.createDietPlan(planData);
        setSuccess('Diet plan created successfully');
      } else if (activeModal === 'edit' && selectedDietPlan) {
        await dietService.updateDietPlan(selectedDietPlan.id, planData);
        setSuccess('Diet plan updated successfully');
      }

      await loadDietPlans();
      setActiveModal(null);
    } catch (err: any) {
      setError(err.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!selectedDietPlan) return;

    try {
      setSubmitting(true);
      // Use archive instead of delete for soft deletion
      await dietService.archiveDietPlan(selectedDietPlan.id);
      setSuccess('Diet plan archived successfully');
      await loadDietPlans();
      setActiveModal(null);
    } catch (err: any) {
      setError(err.message || 'Failed to archive diet plan');
    } finally {
      setSubmitting(false);
    }
  };

  // Bulk operations
  const handleSelectPlan = (planId: number) => {
    setSelectedPlans(prev =>
      prev.includes(planId)
        ? prev.filter(id => id !== planId)
        : [...prev, planId]
    );
  };

  const handleSelectAll = () => {
    if (selectedPlans.length === filteredDietPlans.length) {
      setSelectedPlans([]);
    } else {
      setSelectedPlans(filteredDietPlans.map(plan => plan.id));
    }
  };

  const handleBulkArchive = async () => {
    if (selectedPlans.length === 0) return;
    if (!confirm(`Archive ${selectedPlans.length} diet plans?`)) return;

    try {
      setBulkOperating(true);
      await dietService.bulkArchiveDietPlans(selectedPlans);
      setSuccess(`${selectedPlans.length} diet plans archived successfully`);
      setSelectedPlans([]);
      await loadDietPlans();
    } catch (err: any) {
      setError(err.message || 'Bulk operation failed');
    } finally {
      setBulkOperating(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedPlans.length === 0) return;
    if (!confirm(`Permanently delete ${selectedPlans.length} diet plans? This cannot be undone.`)) return;

    try {
      setBulkOperating(true);
      await dietService.bulkDeleteDietPlans(selectedPlans);
      setSuccess(`${selectedPlans.length} diet plans deleted successfully`);
      setSelectedPlans([]);
      await loadDietPlans();
    } catch (err: any) {
      setError(err.message || 'Bulk operation failed');
    } finally {
      setBulkOperating(false);
    }
  };
  
  // Meal management functions
  const handleAddMeal = () => {
    const meal = {
      ...newMeal,
      calories: parseInt(newMeal.calories) || 0,
      protein: parseInt(newMeal.protein) || 0,
      carbs: parseInt(newMeal.carbs) || 0,
      fats: parseInt(newMeal.fats) || 0,
      id: null // New meal
    };
    
    setMealModifications(prev => [...prev, meal]);
    setShowAddMealModal(false);
    setImagePreview(null);
    setNewMeal({
      meal_type: 'breakfast',
      name: '',
      description: '',
      calories: '',
      protein: '',
      carbs: '',
      fats: '',
      is_mandatory: true,
      instructions: '',
      image_url: ''
    });
  };
  
  const handleRemoveMeal = (index: number) => {
    setMealModifications(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleUpdateMeal = (index: number, field: string, value: any) => {
    setMealModifications(prev => 
      prev.map((meal, i) => i === index ? { ...meal, [field]: value } : meal)
    );
  };
  
  const handleSaveMeals = async () => {
    if (!selectedDietPlan) return;
    
    try {
      setSubmitting(true);
      setError(null);
      
      // Update or create meals
      for (const meal of mealModifications) {
        if (meal.id) {
          // Update existing meal
          await dietService.updateMeal(meal.id, meal);
        } else {
          // Create new meal
          await dietService.addMealToDietPlan(selectedDietPlan.id, meal);
        }
      }
      
      // Remove deleted meals (meals that were in original but not in modifications)
      const originalMealIds = dietPlanMeals.map(m => m.id);
      const currentMealIds = mealModifications.filter(m => m.id).map(m => m.id);
      const deletedMealIds = originalMealIds.filter(id => !currentMealIds.includes(id));
      
      for (const mealId of deletedMealIds) {
        await dietService.deleteMeal(mealId);
      }
      
      setSuccess('Meals updated successfully!');
      setActiveModal(null);
      
      // Reload diet plans to reflect changes
      await loadDietPlans();
    } catch (err: any) {
      setError(`Failed to update meals: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };
  
  const getMealTypeColor = (mealType: string) => {
    switch (mealType) {
      case 'breakfast': return 'bg-yellow-100 text-yellow-800';
      case 'lunch': return 'bg-blue-100 text-blue-800';
      case 'dinner': return 'bg-purple-100 text-purple-800';
      case 'snack': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Image handling functions
  const handleImageUpload = async (file: File, mealIndex?: number) => {
    try {
      const uploadKey = mealIndex !== undefined ? `meal-${mealIndex}` : 'new-meal';
      setUploadingImage(uploadKey);
      
      // Get meal ID if we're uploading for an existing meal
      let mealId: string | number | undefined = undefined;
      if (mealIndex !== undefined) {
        const meal = mealModifications[mealIndex];
        mealId = meal?.id || undefined;
      }
      
      // Upload image
      const response = await imageService.uploadMealImage(file, mealId, file.name);
      
      if (response.success && response.data) {
        if (mealIndex !== undefined) {
          // Update existing meal
          handleUpdateMeal(mealIndex, 'image_url', response.data.url);
        } else {
          // Update new meal
          setNewMeal(prev => ({ ...prev, image_url: response.data!.url }));
          setImagePreview(response.data.url);
        }
        setSuccess('Image uploaded successfully!');
      } else {
        setError(response.message || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Image upload error:', error);
      setError('Failed to upload image');
    } finally {
      setUploadingImage(null);
    }
  };
  
  const handleImageRemove = async (imageUrl: string, mealIndex?: number) => {
    try {
      const result = await imageService.deleteMealImage(imageUrl);
      
      if (result.success) {
        
        if (mealIndex !== undefined) {
          // Remove from existing meal
          handleUpdateMeal(mealIndex, 'image_url', null);
          setImagePreview(null);
        } else {
          // Remove from new meal
          setNewMeal(prev => ({ ...prev, image_url: '' }));
          setImagePreview(null);
        }
        setSuccess('Image removed successfully!');
      } else {
        setError(result.error || 'Failed to remove image');
      }
    } catch (error) {
      console.error('Image removal error:', error);
      setError('Failed to remove image');
    }
  };
  
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>, mealIndex?: number) => {
    const file = event.target.files?.[0];
    if (file) {
      const validation = imageService.validateImage(file, {
        maxSize: 3, // 3MB for meal images
        allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
      });
      
      if (validation.valid) {
        handleImageUpload(file, mealIndex);
        
        // Show preview for new meal
        if (mealIndex === undefined) {
          const previewUrl = imageService.createPreviewUrl(file);
          setImagePreview(previewUrl);
        }
      } else {
        setError(validation.error || 'Invalid image file');
      }
    }
    
    // Reset input value
    event.target.value = '';
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getGoalColor = (goal: string) => {
    switch (goal) {
      case 'weight_loss':
        return 'bg-red-100 text-red-800';
      case 'muscle_gain':
        return 'bg-blue-100 text-blue-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'athletic_performance':
        return 'bg-purple-100 text-purple-800';
      case 'general_health':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
            <h2 className="text-2xl font-bold text-gray-900">Diet Plan Management</h2>
            <p className="text-gray-600">Manage diet plans, assign to users, and track nutrition goals</p>
          </div>
          <button
            onClick={handleCreateDietPlan}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Diet Plan</span>
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search diet plans..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <select
            value={goalFilter}
            onChange={(e) => setGoalFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">All Goals</option>
            {goalOptions.map(goal => (
              <option key={goal} value={goal}>
                {formatDisplayName(goal)}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>

          <select
            value={trainerFilter}
            onChange={(e) => setTrainerFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">All Trainers</option>
            {trainers.map(trainer => (
              <option key={trainer.id} value={trainer.id}>
                {trainer.name || `${trainer.firstName} ${trainer.lastName}`}
              </option>
            ))}
          </select>
        </div>

        {/* Bulk Actions */}
        {selectedPlans.length > 0 && (
          <div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg">
            <span className="text-blue-800 text-sm font-medium">
              {selectedPlans.length} diet plan{selectedPlans.length !== 1 ? 's' : ''} selected
            </span>
            <div className="flex space-x-2">
              <button
                onClick={handleBulkArchive}
                disabled={bulkOperating}
                className="text-sm px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:opacity-50 flex items-center space-x-1"
              >
                <Archive className="w-3 h-3" />
                <span>Archive</span>
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={bulkOperating}
                className="text-sm px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 flex items-center space-x-1"
              >
                <Trash2 className="w-3 h-3" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        )}
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

      {/* Diet Plans List */}
      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            <span className="ml-2 text-gray-600">Loading diet plans...</span>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        checked={selectedPlans.length === filteredDietPlans.length && filteredDietPlans.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Diet Plan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trainer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Goal
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nutrition
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredDietPlans.map((plan) => (
                    <tr key={plan.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedPlans.includes(plan.id)}
                          onChange={() => handleSelectPlan(plan.id)}
                          className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                              <ChefHat className="w-5 h-5 text-green-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {plan.name || plan.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              {plan.description ? plan.description.substring(0, 40) + '...' : 'No description'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {`${plan.user?.firstName} ${plan.user?.lastName}` || `User ${plan.user_id}`}
                        </div>
                        <div className="text-sm text-gray-500">
                          {plan.user?.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {plan.trainer?.firstName &&`${plan.trainer?.firstName} ${plan.trainer?.lastName}` || (plan.trainer_id ? `Trainer ${plan.trainer_id}` : 'No trainer')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {plan.goal && (
                          <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getGoalColor(plan.goal)}`}>
                            {getGoalIcon(plan.goal)}
                            <span className="ml-1">{formatDisplayName(plan.goal)}</span>
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(plan.status)}`}>
                          {plan.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-xs text-gray-500 space-y-1">
                          {plan.target_calories && (
                            <div className="flex items-center space-x-1">
                              <Zap className="w-3 h-3 text-orange-500" />
                              <span>{plan.target_calories} cal</span>
                            </div>
                          )}
                          {plan.target_protein && (
                            <div className="flex items-center space-x-1">
                              <TrendingUp className="w-3 h-3 text-blue-500" />
                              <span>{plan.target_protein}g protein</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleViewDietPlan(plan)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleManageMeals(plan)}
                            className="text-green-600 hover:text-green-900 p-1 rounded"
                            title="Manage Meals"
                          >
                            <ChefHat className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditDietPlan(plan)}
                            className="text-indigo-600 hover:text-indigo-900 p-1 rounded"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteDietPlan(plan)}
                            className="text-red-600 hover:text-red-900 p-1 rounded"
                            title="Archive"
                          >
                            <Archive className="w-4 h-4" />
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
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} diet plans
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
                    {activeModal === 'create' ? 'Create Diet Plan' : 'Edit Diet Plan'}
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
                        Title *
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                          formErrors.title ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Enter diet plan title"
                      />
                      {formErrors.title && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.title}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Goal *
                      </label>
                      <select
                        value={formData.goal}
                        onChange={(e) => handleInputChange('goal', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                          formErrors.goal ? 'border-red-300' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Select goal</option>
                        {goalOptions.map(goal => (
                          <option key={goal} value={goal}>
                            {formatDisplayName(goal)}
                          </option>
                        ))}
                      </select>
                      {formErrors.goal && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.goal}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        User *
                      </label>
                      <select
                        value={formData.user_id}
                        onChange={(e) => handleInputChange('user_id', parseInt(e.target.value))}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                          formErrors.user_id ? 'border-red-300' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Select user</option>
                        {users.map(user => (
                          <option key={user.id} value={user.id}>
                            {user.name || `${user.firstName} ${user.lastName}`} ({user.email})
                          </option>
                        ))}
                      </select>
                      {formErrors.user_id && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.user_id}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Trainer (Optional)
                      </label>
                      <select
                        value={formData.trainer_id}
                        onChange={(e) => handleInputChange('trainer_id', e.target.value ? parseInt(e.target.value) : '')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="">No trainer assigned</option>
                        {trainers.map(trainer => (
                          <option key={trainer.id} value={trainer.id}>
                            {trainer.name || `${trainer.firstName} ${trainer.lastName}`}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Describe the diet plan goals and approach"
                    />
                  </div>

                  {/* Macros */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Daily Calories
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.calories}
                        onChange={(e) => handleInputChange('calories', e.target.value ? parseInt(e.target.value) : '')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="2000"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Protein (g)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.protein_g}
                        onChange={(e) => handleInputChange('protein_g', e.target.value ? parseInt(e.target.value) : '')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="150"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Carbs (g)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.carbs_g}
                        onChange={(e) => handleInputChange('carbs_g', e.target.value ? parseInt(e.target.value) : '')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="200"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fats (g)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.fats_g}
                        onChange={(e) => handleInputChange('fats_g', e.target.value ? parseInt(e.target.value) : '')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="70"
                      />
                    </div>
                  </div>

                  {/* Dietary Restrictions */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dietary Restrictions
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {dietaryRestrictionsOptions.map(restriction => (
                        <label key={restriction} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.dietary_restrictions.includes(restriction)}
                            onChange={() => handleArrayInputChange('dietary_restrictions', restriction)}
                            className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">
                            {formatDisplayName(restriction)}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Additional notes, special instructions, etc."
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => handleInputChange('status', e.target.value as 'active' | 'archived')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="active">Active</option>
                      <option value="archived">Archived</option>
                    </select>
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
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>{activeModal === 'create' ? 'Create Diet Plan' : 'Update Diet Plan'}</span>
                      </>
                    )}
                  </button>
                </div>
              </>
            )}

            {/* View Modal */}
            {activeModal === 'view' && selectedDietPlan && (
              <>
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Diet Plan Details</h3>
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
                      <div className="w-20 h-20 bg-green-100 rounded-lg flex items-center justify-center">
                        <ChefHat className="w-10 h-10 text-green-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-gray-900 mb-2">
                        {selectedDietPlan.name || selectedDietPlan.title}
                      </h2>
                      <div className="flex items-center space-x-4 mb-4">
                        {selectedDietPlan.goal && (
                          <span className={`px-3 py-1 text-sm font-medium rounded-full ${getGoalColor(selectedDietPlan.goal)}`}>
                            {formatDisplayName(selectedDietPlan.goal)}
                          </span>
                        )}
                        <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(selectedDietPlan.status)}`}>
                          {selectedDietPlan.status}
                        </span>
                      </div>
                      <p className="text-gray-600">{selectedDietPlan.description}</p>
                    </div>
                  </div>

                  {/* User and Trainer Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Assigned User</h4>
                      <div className="flex items-center space-x-3">
                        <User className="w-8 h-8 text-gray-400" />
                        <div>
                          <p className="font-medium">{selectedDietPlan.user?.name || `User ${selectedDietPlan.user_id}`}</p>
                          <p className="text-sm text-gray-500">{selectedDietPlan.user?.email}</p>
                        </div>
                      </div>
                    </div>
                    {selectedDietPlan.trainer && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Trainer</h4>
                        <div className="flex items-center space-x-3">
                          <Users className="w-8 h-8 text-gray-400" />
                          <div>
                            <p className="font-medium">{selectedDietPlan.trainer.name}</p>
                            <p className="text-sm text-gray-500">{selectedDietPlan.trainer.email}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Nutrition Targets */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Daily Nutrition Targets</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {selectedDietPlan.target_calories && (
                        <div className="text-center p-3 bg-orange-50 rounded-lg">
                          <Zap className="w-6 h-6 text-orange-600 mx-auto mb-1" />
                          <p className="text-sm text-gray-500">Calories</p>
                          <p className="font-medium">{selectedDietPlan.target_calories}</p>
                        </div>
                      )}
                      {selectedDietPlan.target_protein && (
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <TrendingUp className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                          <p className="text-sm text-gray-500">Protein</p>
                          <p className="font-medium">{selectedDietPlan.target_protein}g</p>
                        </div>
                      )}
                      {selectedDietPlan.target_carbs && (
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <Apple className="w-6 h-6 text-green-600 mx-auto mb-1" />
                          <p className="text-sm text-gray-500">Carbs</p>
                          <p className="font-medium">{selectedDietPlan.target_carbs}g</p>
                        </div>
                      )}
                      {selectedDietPlan.target_fat && (
                        <div className="text-center p-3 bg-purple-50 rounded-lg">
                          <Target className="w-6 h-6 text-purple-600 mx-auto mb-1" />
                          <p className="text-sm text-gray-500">Fat</p>
                          <p className="font-medium">{selectedDietPlan.target_fat}g</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Notes */}
                  {selectedDietPlan.notes && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Notes</h4>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-gray-700">{selectedDietPlan.notes}</p>
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
                    onClick={() => handleEditDietPlan(selectedDietPlan)}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700 flex items-center space-x-2"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit Diet Plan</span>
                  </button>
                </div>
              </>
            )}

            {/* Meal Management Modal */}
            {activeModal === 'meals' && selectedDietPlan && (
              <>
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Manage Meals</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {selectedDietPlan.name || selectedDietPlan.title} - {selectedDietPlan.user?.name}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setActiveModal(null);
                      setShowAddMealModal(false);
                      setMealModifications([]);
                      setDietPlanMeals([]);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="p-6">
                  {loadingMeals ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                      <span className="ml-2 text-gray-600">Loading meals...</span>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-900">Daily Meal Plan:</h4>
                        <button
                          onClick={() => setShowAddMealModal(true)}
                          className="flex items-center space-x-2 px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Add Meal</span>
                        </button>
                      </div>

                      {/* Meals List */}
                      <div className="space-y-3">
                        {mealModifications.map((meal, index) => (
                          <div key={index} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center space-x-3">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getMealTypeColor(meal.meal_type)}`}>
                                  {formatDisplayName(meal.meal_type)}
                                </span>
                                <h5 className="font-medium text-gray-900">{meal.food_item || 'Unnamed Meal'}</h5>
                              </div>
                              <button
                                onClick={() => handleRemoveMeal(index)}
                                className="text-red-600 hover:text-red-800 transition-colors"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Calories</label>
                                <input
                                  type="number"
                                  value={meal.calories || ''}
                                  onChange={(e) => handleUpdateMeal(index, 'calories', parseInt(e.target.value) || 0)}
                                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-green-500"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Protein (g)</label>
                                <input
                                  type="number"
                                  value={meal.protein || ''}
                                  onChange={(e) => handleUpdateMeal(index, 'protein', parseInt(e.target.value) || 0)}
                                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-green-500"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Carbs (g)</label>
                                <input
                                  type="number"
                                  value={meal.carbs || ''}
                                  onChange={(e) => handleUpdateMeal(index, 'carbs', parseInt(e.target.value) || 0)}
                                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-green-500"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Fat (g)</label>
                                <input
                                  type="number"
                                  value={meal.fats || ''}
                                  onChange={(e) => handleUpdateMeal(index, 'fats', parseInt(e.target.value) || 0)}
                                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-green-500"
                                />
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <input
                                type="text"
                                placeholder="Meal name..."
                                value={meal.food_item || ''}
                                onChange={(e) => handleUpdateMeal(index, 'name', e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-green-500"
                              />
                              <textarea
                                placeholder="Description and instructions..."
                                value={meal.description || ''}
                                onChange={(e) => handleUpdateMeal(index, 'description', e.target.value)}
                                rows={2}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-green-500"
                              />
                              
                              {/* Meal Image */}
                              <div className="space-y-2">
                                <label className="block text-xs font-medium text-gray-700">Meal Image</label>
                                {(meal.fullUrl || meal.image_url) ? (
                                  <div className="relative">
                                    <img
                                      src={meal.fullUrl}
                                      alt={meal.name || 'Meal'}
                                      className="w-full h-24 object-cover rounded-lg border border-gray-200"
                                      onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.src = imageService.getMealPlaceholder(meal.food_item || 'Meal', meal.meal_type);
                                      }}
                                    />
                                    <button
                                      onClick={() => handleImageRemove(meal.image_url, index)}
                                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                                      title="Remove image"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                ) : (
                                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) => handleFileSelect(e, index)}
                                      className="hidden"
                                      id={`meal-image-${index}`}
                                    />
                                    <label
                                      htmlFor={`meal-image-${index}`}
                                      className="cursor-pointer flex flex-col items-center space-y-1"
                                    >
                                      {uploadingImage === `meal-${index}` ? (
                                        <>
                                          <Loader className="w-6 h-6 text-gray-400 animate-spin" />
                                          <span className="text-xs text-gray-500">Uploading...</span>
                                        </>
                                      ) : (
                                        <>
                                          <Upload className="w-6 h-6 text-gray-400" />
                                          <span className="text-xs text-gray-500">Click to upload image</span>
                                          <span className="text-xs text-gray-400">PNG, JPG, WebP up to 3MB</span>
                                        </>
                                      )}
                                    </label>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center mt-3">
                              <input
                                type="checkbox"
                                checked={meal.is_mandatory || false}
                                onChange={(e) => handleUpdateMeal(index, 'is_mandatory', e.target.checked)}
                                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                              />
                              <label className="ml-2 text-sm text-gray-700">Mandatory meal</label>
                            </div>
                          </div>
                        ))}
                        
                        {mealModifications.length === 0 && (
                          <div className="text-center py-8 text-gray-500">
                            <ChefHat className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                            <p>No meals added yet. Click "Add Meal" to start building the diet plan.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
                  <button
                    onClick={() => {
                      setActiveModal(null);
                      setShowAddMealModal(false);
                      setMealModifications([]);
                      setDietPlanMeals([]);
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveMeals}
                    disabled={submitting}
                    className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Save Meals</span>
                      </>
                    )}
                  </button>
                </div>
              </>
            )}

            {/* Delete Modal */}
            {activeModal === 'delete' && selectedDietPlan && (
              <>
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Archive Diet Plan</h3>
                  <button
                    onClick={() => setActiveModal(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                      <AlertCircle className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">Are you sure?</h3>
                      <p className="text-gray-600">
                        This will archive "{selectedDietPlan.name || selectedDietPlan.title}" and make it unavailable to the user. You can restore it later if needed.
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
                    className="px-4 py-2 text-sm font-medium text-white bg-yellow-600 border border-transparent rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Archiving...</span>
                      </>
                    ) : (
                      <>
                        <Archive className="w-4 h-4" />
                        <span>Archive Diet Plan</span>
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      
      {/* Add Meal Modal */}
      {showAddMealModal && (
        <div className="fixed inset-0 z-[60] overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowAddMealModal(false)}></div>
            
            <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h4 className="text-lg font-semibold text-gray-900">Add New Meal</h4>
                <button
                  onClick={() => setShowAddMealModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Meal Type</label>
                    <select
                      value={newMeal.meal_type}
                      onChange={(e) => setNewMeal(prev => ({ ...prev, meal_type: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    >
                      <option value="breakfast">Breakfast</option>
                      <option value="lunch">Lunch</option>
                      <option value="dinner">Dinner</option>
                      <option value="snack">Snack</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Calories</label>
                    <input
                      type="number"
                      value={newMeal.calories}
                      onChange={(e) => setNewMeal(prev => ({ ...prev, calories: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="300"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Meal Name</label>
                  <input
                    type="text"
                    value={newMeal.name}
                    onChange={(e) => setNewMeal(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="e.g. Grilled Chicken Salad"
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Protein (g)</label>
                    <input
                      type="number"
                      value={newMeal.protein}
                      onChange={(e) => setNewMeal(prev => ({ ...prev, protein: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="25"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Carbs (g)</label>
                    <input
                      type="number"
                      value={newMeal.carbs}
                      onChange={(e) => setNewMeal(prev => ({ ...prev, carbs: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fat (g)</label>
                    <input
                      type="number"
                      value={newMeal.fats}
                      onChange={(e) => setNewMeal(prev => ({ ...prev, fats: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="10"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description & Instructions</label>
                  <textarea
                    value={newMeal.description}
                    onChange={(e) => setNewMeal(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="Describe the meal and any preparation instructions..."
                  />
                </div>
                
                {/* Meal Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Meal Image</label>
                  {(newMeal.image_url || imagePreview) ? (
                    <div className="relative">
                      <img
                        src={newMeal.image_url || imagePreview || imageService.getMealPlaceholder(newMeal.name || 'New Meal', newMeal.meal_type)}
                        alt={newMeal.name || 'New Meal'}
                        className="w-full h-32 object-cover rounded-lg border border-gray-200"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = imageService.getMealPlaceholder(newMeal.name || 'New Meal', newMeal.meal_type);
                        }}
                      />
                      <button
                        onClick={() => handleImageRemove(newMeal.image_url || imagePreview!)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                        title="Remove image"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileSelect(e)}
                        className="hidden"
                        id="new-meal-image"
                      />
                      <label htmlFor="new-meal-image" className="cursor-pointer flex flex-col items-center space-y-2">
                        {uploadingImage === 'new-meal' ? (
                          <>
                            <Loader className="w-8 h-8 text-gray-400 animate-spin" />
                            <span className="text-sm text-gray-500">Uploading image...</span>
                          </>
                        ) : (
                          <>
                            <div className="flex items-center space-x-2 text-gray-500">
                              <ImageIcon className="w-8 h-8" />
                              <Upload className="w-6 h-6" />
                            </div>
                            <span className="text-sm text-gray-700 font-medium">Click to upload meal image</span>
                            <span className="text-xs text-gray-500">PNG, JPG, WebP up to 3MB</span>
                          </>
                        )}
                      </label>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newMeal.is_mandatory}
                    onChange={(e) => setNewMeal(prev => ({ ...prev, is_mandatory: e.target.checked }))}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <label className="ml-2 text-sm text-gray-700">Mandatory meal</label>
                </div>
              </div>
              
              <div className="flex items-center justify-end space-x-3 p-4 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={() => setShowAddMealModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddMeal}
                  className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Meal</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DietPlanManagement;
