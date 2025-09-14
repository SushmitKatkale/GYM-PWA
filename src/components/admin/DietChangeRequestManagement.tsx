import React, { useState, useEffect } from 'react';
import {
  Search, Filter, MessageSquare, Users, ChefHat,
  Clock, CheckCircle, XCircle, AlertTriangle,
  RefreshCw, Archive, Trash2, Eye, Calendar,
  User, Target, TrendingUp, Edit3, Save, X,
  Plus, Minus, Settings, Upload, Image as ImageIcon, Loader
} from 'lucide-react';
import { dietService } from '../../services/dietService';
import { imageService } from '../../services/imageService';
import { DietChangeRequest } from '../../models/Diet';

interface DietChangeRequestManagementProps {
  className?: string;
}

export const DietChangeRequestManagement: React.FC<DietChangeRequestManagementProps> = ({ className = '' }) => {
  const [changeRequests, setChangeRequests] = useState<DietChangeRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<DietChangeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [requestTypeFilter, setRequestTypeFilter] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState('');
  const [trainerFilter, setTrainerFilter] = useState('');

  // Bulk operations
  const [selectedRequests, setSelectedRequests] = useState<number[]>([]);
  const [bulkOperating, setBulkOperating] = useState(false);

  // Additional data
  const [trainers, setTrainers] = useState<any[]>([]);

  // Diet Plan Modification Modal State
  const [showModifyModal, setShowModifyModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<DietChangeRequest | null>(null);
  const [dietPlanData, setDietPlanData] = useState<any>(null);
  const [dietPlanMeals, setDietPlanMeals] = useState<any[]>([]);
  const [modifyingPlan, setModifyingPlan] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'meals'>('overview');
  const [planModifications, setPlanModifications] = useState({
    target_calories: '',
    target_protein: '',
    target_carbs: '',
    target_fat: '',
    notes: ''
  });
  const [mealModifications, setMealModifications] = useState<any[]>([]);
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
  const [uploadingImage, setUploadingImage] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    fulfilled: 0
  });

  const statusOptions = ['pending', 'in_progress', 'approved', 'rejected', 'fulfilled'];
  const requestTypeOptions = ['general', 'meal_change', 'allergy', 'preference', 'nutrition_adjustment'];
  const urgencyOptions = ['low', 'medium', 'high'];

  useEffect(() => {
    loadChangeRequests();
    loadTrainers();
  }, [currentPage]);

  useEffect(() => {
    filterRequests();
  }, [changeRequests, searchTerm, statusFilter, requestTypeFilter, urgencyFilter, trainerFilter]);

  const loadChangeRequests = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await dietService.getAdminChangeRequests({
        page: currentPage,
        limit: itemsPerPage,
        status: statusFilter || undefined,
        request_type: requestTypeFilter || undefined,
        urgency: urgencyFilter || undefined,
        trainer_id: trainerFilter ? parseInt(trainerFilter) : undefined
      });

      if (response.success && response.data) {
        let requests = response.data.changeRequests;
        setChangeRequests(requests);
        setTotalPages(response.data.pagination.totalPages);
        setTotalItems(response.data.pagination.total);

        // Calculate stats
        const newStats = {
          total: requests.length,
          pending: requests.filter(r => r.status === 'pending').length,
          approved: requests.filter(r => r.status === 'approved').length,
          rejected: requests.filter(r => r.status === 'rejected').length,
          fulfilled: requests.filter(r => r.status === 'fulfilled').length
        };
        setStats(newStats);
      }
    } catch (err) {
      setError('Failed to load change requests');
      console.error('Error loading change requests:', err);
    } finally {
      setLoading(false);
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

  const filterRequests = () => {
    let filtered = [...changeRequests];

    if (searchTerm) {
      filtered = filtered.filter(request =>
        request.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.trainer?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter) {
      filtered = filtered.filter(request => request.status === statusFilter);
    }

    if (requestTypeFilter) {
      filtered = filtered.filter(request => request.request_type === requestTypeFilter);
    }

    if (urgencyFilter) {
      filtered = filtered.filter(request => request.urgency === urgencyFilter);
    }

    if (trainerFilter) {
      filtered = filtered.filter(request => 
        request.trainer?.id?.toString() === trainerFilter
      );
    }

    setFilteredRequests(filtered);
  };

  const handleBulkUpdate = async (newStatus: string) => {
    if (selectedRequests.length === 0) return;
    if (!confirm(`Update ${selectedRequests.length} requests to ${newStatus}?`)) return;

    try {
      setBulkOperating(true);
      
      // In a real implementation, this would be a bulk API call
      for (const requestId of selectedRequests) {
        await dietService.respondToChangeRequest(requestId, {
          status: newStatus,
          trainer_response: `Bulk updated to ${newStatus} by admin`
        });
      }

      setSuccess(`${selectedRequests.length} requests updated to ${newStatus}`);
      setSelectedRequests([]);
      await loadChangeRequests();
    } catch (err: any) {
      setError(err.message || 'Bulk operation failed');
    } finally {
      setBulkOperating(false);
    }
  };

  const handleModifyDietPlan = async (request: DietChangeRequest) => {
    try {
      setSelectedRequest(request);
      setModifyingPlan(true);

      // Load the diet plan details and meals
      if (request.plan_id) {
        const [planResponse, mealsResponse] = await Promise.all([
          dietService.getDietPlanById(request.plan_id),
          dietService.getDietPlanMeals(request.plan_id)
        ]);
        
        if (planResponse.success && planResponse.data) {
          setDietPlanData(planResponse.data);
          setPlanModifications({
            target_calories: planResponse.data.calories?.toString() || '',
            target_protein: planResponse.data.protein_g?.toString() || '',
            target_carbs: planResponse.data.carbs_g?.toString() || '',
            target_fat: planResponse.data.fats_g?.toString() || '',
            notes: planResponse.data.description || ''
          });
        }
        
        if (mealsResponse.success && mealsResponse.data) {
          const meals = mealsResponse.data.meals || mealsResponse.data;
          setDietPlanMeals(meals);
          setMealModifications(meals.map(meal => ({ ...meal })));
        }
      } else {
        // Create a new plan for requests without existing plans
        setDietPlanData(null);
        setDietPlanMeals([]);
        setMealModifications([]);
        setPlanModifications({
          target_calories: '2000',
          target_protein: '120',
          target_carbs: '200',
          target_fat: '80',
          notes: `Plan created for change request: ${request.description}`
        });
      }
      
      setShowModifyModal(true);
    } catch (err: any) {
      setError(`Failed to load diet plan: ${err.message}`);
    } finally {
      setModifyingPlan(false);
    }
  };

  const handleSavePlanModifications = async () => {
    if (!selectedRequest) return;

    try {
      setModifyingPlan(true);

      const planData = {
        target_calories: parseInt(planModifications.target_calories) || 2000,
        target_protein: parseInt(planModifications.target_protein) || 120,
        target_carbs: parseInt(planModifications.target_carbs) || 200,
        target_fat: parseInt(planModifications.target_fat) || 80,
        notes: planModifications.notes
      };

      let planId = selectedRequest.plan_id;
      
      if (selectedRequest.plan_id) {
        // Update existing plan
        await dietService.updateDietPlan(selectedRequest.plan_id, planData);
      } else {
        // Create new plan
        const newPlanData = {
          ...planData,
          user_id: selectedRequest.user_id,
          trainer_id: selectedRequest.trainer_id,
          name: `Diet Plan for ${selectedRequest.user?.name || 'User'}`,
          goal: 'general'
        };
        const createResponse = await dietService.createDietPlan(newPlanData);
        if (createResponse.success && createResponse.data) {
          planId = createResponse.data.id;
        }
      }
      
      // Update or create meals if planId exists
      if (planId && mealModifications.length > 0) {
        for (const meal of mealModifications) {
          if (meal.id) {
            // Update existing meal
            await dietService.updateMeal(meal.id, meal);
          } else {
            // Create new meal
            await dietService.addMealToDietPlan(planId, meal);
          }
        }
      }

      // Update the change request status to fulfilled
      await dietService.respondToChangeRequest(selectedRequest.id, {
        status: 'fulfilled',
        trainer_response: 'Diet plan has been updated according to your request.'
      });

      setSuccess('Diet plan updated successfully and request fulfilled!');
      setShowModifyModal(false);
      await loadChangeRequests();
    } catch (err: any) {
      setError(`Failed to update diet plan: ${err.message}`);
    } finally {
      setModifyingPlan(false);
    }
  };

  const closeModifyModal = () => {
    setShowModifyModal(false);
    setSelectedRequest(null);
    setDietPlanData(null);
    setDietPlanMeals([]);
    setActiveTab('overview');
    setPlanModifications({
      target_calories: '',
      target_protein: '',
      target_carbs: '',
      target_fat: '',
      notes: ''
    });
    setMealModifications([]);
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
  
  // Image handling functions
  const handleImageUpload = async (file: File, mealIndex?: number) => {
    try {
      const uploadKey = mealIndex !== undefined ? `meal-${mealIndex}` : 'new-meal';
      setUploadingImage(uploadKey);
      
      // Upload image
      const response = await imageService.uploadMealImage(file, undefined, file.name);
      
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
          handleUpdateMeal(mealIndex, 'image_url', '');
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
  
  const getMealTypeColor = (mealType: string) => {
    switch (mealType) {
      case 'breakfast': return 'bg-yellow-100 text-yellow-800';
      case 'lunch': return 'bg-blue-100 text-blue-800';
      case 'dinner': return 'bg-purple-100 text-purple-800';
      case 'snack': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSelectRequest = (requestId: number) => {
    setSelectedRequests(prev =>
      prev.includes(requestId)
        ? prev.filter(id => id !== requestId)
        : [...prev, requestId]
    );
  };

  const handleSelectAll = () => {
    if (selectedRequests.length === filteredRequests.length) {
      setSelectedRequests([]);
    } else {
      setSelectedRequests(filteredRequests.map(request => request.id));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'fulfilled': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getRequestTypeIcon = (type: string) => {
    switch (type) {
      case 'meal_change': return <ChefHat className="w-4 h-4" />;
      case 'allergy': return <AlertTriangle className="w-4 h-4" />;
      case 'preference': return <User className="w-4 h-4" />;
      case 'nutrition_adjustment': return <Target className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  const formatDisplayName = (str: string) => {
    return str.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Diet Change Requests</h2>
            <p className="text-gray-600">Manage user requests for diet plan modifications</p>
          </div>
          <button
            onClick={loadChangeRequests}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-600">Total</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-600">Pending</span>
            </div>
            <p className="text-2xl font-bold text-yellow-900 mt-1">{stats.pending}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-600">Approved</span>
            </div>
            <p className="text-2xl font-bold text-green-900 mt-1">{stats.approved}</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2">
              <XCircle className="w-5 h-5 text-red-600" />
              <span className="text-sm font-medium text-red-600">Rejected</span>
            </div>
            <p className="text-2xl font-bold text-red-900 mt-1">{stats.rejected}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-600">Fulfilled</span>
            </div>
            <p className="text-2xl font-bold text-purple-900 mt-1">{stats.fulfilled}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search requests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            {statusOptions.map(status => (
              <option key={status} value={status}>
                {formatDisplayName(status)}
              </option>
            ))}
          </select>

          <select
            value={requestTypeFilter}
            onChange={(e) => setRequestTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">All Types</option>
            {requestTypeOptions.map(type => (
              <option key={type} value={type}>
                {formatDisplayName(type)}
              </option>
            ))}
          </select>

          <select
            value={urgencyFilter}
            onChange={(e) => setUrgencyFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">All Urgency</option>
            {urgencyOptions.map(urgency => (
              <option key={urgency} value={urgency}>
                {formatDisplayName(urgency)}
              </option>
            ))}
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
        {selectedRequests.length > 0 && (
          <div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg">
            <span className="text-blue-800 text-sm font-medium">
              {selectedRequests.length} request{selectedRequests.length !== 1 ? 's' : ''} selected
            </span>
            <div className="flex space-x-2">
              <button
                onClick={() => handleBulkUpdate('approved')}
                disabled={bulkOperating}
                className="text-sm px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 flex items-center space-x-1"
              >
                <CheckCircle className="w-3 h-3" />
                <span>Approve</span>
              </button>
              <button
                onClick={() => handleBulkUpdate('rejected')}
                disabled={bulkOperating}
                className="text-sm px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 flex items-center space-x-1"
              >
                <XCircle className="w-3 h-3" />
                <span>Reject</span>
              </button>
              <button
                onClick={() => handleBulkUpdate('fulfilled')}
                disabled={bulkOperating}
                className="text-sm px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 flex items-center space-x-1"
              >
                <TrendingUp className="w-3 h-3" />
                <span>Fulfill</span>
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
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <span className="text-red-800">{error}</span>
        </div>
      )}

      {/* Request List */}
      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            <span className="ml-2 text-gray-600">Loading change requests...</span>
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
                        checked={selectedRequests.length === filteredRequests.length && filteredRequests.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Request
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trainer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Urgency
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedRequests.includes(request.id)}
                          onChange={() => handleSelectRequest(request.id)}
                          className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-start space-x-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <MessageSquare className="w-4 h-4 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {request.description}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              ID: {request.id}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {`${request.user?.firstName} ${request.user?.lastName}` || `User ${request.user_id}`}
                        </div>
                        <div className="text-sm text-gray-500">
                          {request.user?.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {(request.trainer_id &&`${request.trainer?.firstName} ${request.trainer?.lastName}`) || (request.trainer_id ? `Trainer ${request.trainer_id}` : 'No trainer')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {getRequestTypeIcon(request.request_type)}
                          <span className="text-sm text-gray-900">
                            {formatDisplayName(request.request_type)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-medium ${getUrgencyColor(request.urgency)}`}>
                          {formatDisplayName(request.urgency)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(request.status)}`}>
                          {formatDisplayName(request.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(request.created_at)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleModifyDietPlan(request)}
                            className="text-blue-600 hover:text-blue-900 transition-colors"
                            title="Modify Diet Plan"
                          >
                            <Settings className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              // View request details (existing functionality)
                              alert(`Request Details:\n\nType: ${formatDisplayName(request.request_type)}\nUrgency: ${formatDisplayName(request.urgency)}\nDescription: ${request.description}`);
                            }}
                            className="text-gray-600 hover:text-gray-900 transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredRequests.length === 0 && !loading && (
              <div className="text-center py-12">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Change Requests</h3>
                <p className="text-gray-500">No requests match your current filters.</p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} requests
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

      {/* Diet Plan Modification Modal */}
      {showModifyModal && selectedRequest && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={closeModifyModal}></div>
            
            <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="border-b border-gray-200">
                <div className="flex items-center justify-between p-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Modify Diet Plan</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Request from {selectedRequest.user?.name} - {formatDisplayName(selectedRequest.request_type)}
                    </p>
                  </div>
                  <button
                    onClick={closeModifyModal}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                {/* Tab Navigation */}
                <div className="flex border-b border-gray-200">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === 'overview'
                        ? 'border-green-500 text-green-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Plan Overview
                  </button>
                  <button
                    onClick={() => setActiveTab('meals')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === 'meals'
                        ? 'border-green-500 text-green-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Meal Plan ({mealModifications.length} meals)
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Request Details - Always shown */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">User Request:</h4>
                  <p className="text-blue-800 text-sm">{selectedRequest.description}</p>
                  <div className="flex items-center space-x-4 mt-2 text-xs text-blue-700">
                    <span>Urgency: {formatDisplayName(selectedRequest.urgency)}</span>
                    <span>Type: {formatDisplayName(selectedRequest.request_type)}</span>
                  </div>
                </div>

                {/* Tab Content */}
                {activeTab === 'overview' && (
                  <>
                    {/* Current Plan Info */}
                    {dietPlanData && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">Current Diet Plan:</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div>
                            <span className="text-gray-600">Calories:</span>
                            <span className="ml-1 font-medium">{dietPlanData.target_calories || 'Not set'}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Protein:</span>
                            <span className="ml-1 font-medium">{dietPlanData.target_protein || 'Not set'}g</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Carbs:</span>
                            <span className="ml-1 font-medium">{dietPlanData.target_carbs || 'Not set'}g</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Fat:</span>
                            <span className="ml-1 font-medium">{dietPlanData.target_fat || 'Not set'}g</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Plan Modification Form */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900">Update Plan Targets:</h4>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Calories
                          </label>
                          <input
                            type="number"
                            value={planModifications.target_calories}
                            onChange={(e) => setPlanModifications(prev => ({
                              ...prev,
                              target_calories: e.target.value
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="2000"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Protein (g)
                          </label>
                          <input
                            type="number"
                            value={planModifications.target_protein}
                            onChange={(e) => setPlanModifications(prev => ({
                              ...prev,
                              target_protein: e.target.value
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="120"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Carbs (g)
                          </label>
                          <input
                            type="number"
                            value={planModifications.target_carbs}
                            onChange={(e) => setPlanModifications(prev => ({
                              ...prev,
                              target_carbs: e.target.value
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="200"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Fat (g)
                          </label>
                          <input
                            type="number"
                            value={planModifications.target_fat}
                            onChange={(e) => setPlanModifications(prev => ({
                              ...prev,
                              target_fat: e.target.value
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="80"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Plan Notes
                        </label>
                        <textarea
                          value={planModifications.notes}
                          onChange={(e) => setPlanModifications(prev => ({
                            ...prev,
                            notes: e.target.value
                          }))}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="Enter any additional notes or instructions..."
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Meal Planning Tab */}
                {activeTab === 'meals' && (
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
                              <h5 className="font-medium text-gray-900">{meal.name || 'Unnamed Meal'}</h5>
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
                              value={meal.name || ''}
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
                              {meal.fullUrl ? (
                                <div className="relative">
                                  <img
                                    src={meal.fullUrl}
                                    alt={meal.name || 'Meal'}
                                    className="w-full h-24 object-cover rounded-lg border border-gray-200"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.src = imageService.getMealPlaceholder(meal.name || 'Meal', meal.meal_type);
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

              {/* Modal Footer */}
              <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={closeModifyModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSavePlanModifications}
                  disabled={modifyingPlan}
                  className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  {modifyingPlan ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Update Plan & Fulfill Request</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Add Meal Modal */}
      {showAddMealModal && (
        <div className="fixed inset-0 z-60 overflow-y-auto">
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

export default DietChangeRequestManagement;
