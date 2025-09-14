import React, { useState, useEffect } from 'react';
import {
  ArrowLeft, MessageSquare, Send, Clock, CheckCircle,
  AlertCircle, User, ChefHat, FileText, Calendar,
  Plus, X, RefreshCw, History, Eye, Target,
  Activity, Apple, Utensils, Timer, Users
} from 'lucide-react';
import { useDietStore } from '../../stores/dietStore';
import { useAuthStore } from '../../stores/authStore';
import { DietPlan, DietChangeRequest as DietChangeRequestType, DietChangeRequestStatus } from '../../models/Diet';

interface DietChangeRequestProps {
  planId?: number;
  trainerId?: number;
  plan?: DietPlan;
  onBack?: () => void;
  onNavigate?: (view: string, data?: any) => void;
}

export function DietChangeRequest({
  planId,
  trainerId,
  plan,
  onBack,
  onNavigate
}: DietChangeRequestProps) {
  const { user } = useAuthStore();
  const {
    selectedDietPlan: selectedPlan,
    changeRequests,
    isLoading,
    error,
    loadDietPlanById,
    loadChangeRequests,
    submitChangeRequest,
    clearError
  } = useDietStore();

  // Form state
  const [requestType, setRequestType] = useState<'general' | 'meal_change' | 'portion_adjustment' | 'allergy_accommodation'>('general');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState<'low' | 'medium' | 'high'>('medium');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // UI state
  const [activeTab, setActiveTab] = useState<'new' | 'history'>('new');
  const [showSuccess, setShowSuccess] = useState(false);

  const currentPlan = plan || selectedPlan;

  useEffect(() => {
    if (planId && !plan) {
      loadDietPlanById(planId);
    }
    if (planId) {
      loadChangeRequests({ planId });
    }
  }, [planId, plan, loadDietPlanById, loadChangeRequests]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPlan || !description.trim()) return;

    setIsSubmitting(true);
    try {
      await submitChangeRequest({
        planId: currentPlan.id,
        trainerId: trainerId || currentPlan.trainer_id,
        requestType,
        description: description.trim(),
        urgency
      });

      setDescription('');
      setRequestType('general');
      setUrgency('medium');
      setShowSuccess(true);
      setActiveTab('history');

      // Reload change requests
      loadChangeRequests({ planId: currentPlan.id });

      setTimeout(() => setShowSuccess(false), 5000);
    } catch (error) {
      console.error('Failed to submit change request:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRequestTypeDisplay = (type: string) => {
    const types = {
      general: 'General Feedback',
      meal_change: 'Meal Change Request',
      portion_adjustment: 'Portion Adjustment',
      allergy_accommodation: 'Allergy Accommodation'
    };
    return types[type as keyof typeof types] || type;
  };

  const getStatusColor = (status: DietChangeRequestStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'implemented':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'low':
        return 'text-green-600';
      case 'medium':
        return 'text-yellow-600';
      case 'high':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
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

  if (isLoading && !currentPlan) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 font-poppins">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="flex items-center space-x-4 mb-8">
              <div className="w-8 h-8 bg-gray-200 rounded"></div>
              <div className="h-8 bg-gray-200 rounded w-64"></div>
            </div>
            <div className="bg-white rounded-sm border border-gray-200 p-6">
              <div className="h-6 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentPlan) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center font-poppins">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 mb-4">Diet plan not found</p>
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-sm hover:bg-green-700 transition-colors mx-auto"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Go Back</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 font-poppins">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            {onBack && (
              <button
                onClick={onBack}
                className="flex items-center justify-center w-10 h-10 bg-white border border-gray-200 rounded-sm hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
            )}
            <div>
              <h1 className="text-xl font-medium text-gray-900 flex items-center">
                Request Diet Plan Changes
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                for "{currentPlan.title}" by {currentPlan.trainer?.firstName} {currentPlan.trainer?.lastName}
              </p>
            </div>
          </div>
          {/* {onNavigate && (
            <button
              onClick={() => onNavigate('diet-plan-details', { planId: currentPlan.id })}
              className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-sm hover:bg-gray-50 transition-colors"
            >
              <Eye className="w-4 h-4" />
              <span className="text-sm font-medium">View Plan</span>
            </button>
          )} */}
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="mb-6">
            <div className="bg-green-50 border border-green-200 rounded-sm p-4 flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-green-800 text-sm font-medium">
                  Change request submitted successfully!
                </p>
                <p className="text-green-700 text-sm mt-1">
                  Your trainer will review your request and respond shortly.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6">
            <div className="bg-red-50 border border-red-200 rounded-sm p-4 flex items-start space-x-3">
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

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-sm w-full">
            {[
              { key: 'new', label: 'New Request', icon: Plus },
              { key: 'history', label: 'Request History', icon: History }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-sm text-sm font-medium transition-colors w-full ${activeTab === key
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
        {activeTab === 'new' && (
          <div className="bg-white rounded-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Submit New Change Request
            </h3>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Request Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Request Type
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { value: 'general', label: 'General Feedback', desc: 'Overall plan feedback or suggestions' },
                    { value: 'meal_change', label: 'Meal Change', desc: 'Request specific meal modifications' },
                    { value: 'portion_adjustment', label: 'Portion Adjustment', desc: 'Adjust meal portion sizes' },
                    { value: 'allergy_accommodation', label: 'Allergy/Dietary Restriction', desc: 'Address food allergies or restrictions' }
                  ].map(({ value, label, desc }) => (
                    <label
                      key={value}
                      className={`flex items-start space-x-3 p-4 border-2 rounded-sm cursor-pointer transition-colors ${requestType === value
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                      <input
                        type="radio"
                        name="requestType"
                        value={value}
                        checked={requestType === value}
                        onChange={(e) => setRequestType(e.target.value as any)}
                        className="mt-0.5"
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">
                          {label}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {desc}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                  placeholder="Please describe your request in detail. Be specific about what you'd like to change and why..."
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  {description.length}/500 characters
                </p>
              </div>

              {/* Urgency */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority Level
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 'low', label: 'Low', desc: 'No rush, when convenient' },
                    { value: 'medium', label: 'Medium', desc: 'Normal priority' },
                    { value: 'high', label: 'High', desc: 'Urgent, needs attention soon' }
                  ].map(({ value, label, desc }) => (
                    <label
                      key={value}
                      className={`flex-1 flex items-center space-x-2 p-3 border-2 rounded-sm cursor-pointer transition-colors ${urgency === value
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                      <input
                        type="radio"
                        name="urgency"
                        value={value}
                        checked={urgency === value}
                        onChange={(e) => setUrgency(e.target.value as any)}
                      />
                      <div className="flex-1">
                        <div className={`text-sm font-medium ${getUrgencyColor(value)}`}>
                          {label}
                        </div>
                        <div className="text-xs text-gray-500">
                          {desc}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-3 w-full">
                <button
                  type="button"
                  onClick={() => {
                    setDescription('');
                    setRequestType('general');
                    setUrgency('medium');
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-sm hover:bg-gray-50 transition-colors"
                >
                  Clear Form
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !description.trim()}
                  className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-sm hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  <span>{isSubmitting ? 'Submitting...' : 'Submit Request'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-4">
            {changeRequests.length === 0 ? (
              <div className="bg-white rounded-sm border border-gray-200 p-8 text-center">
                <History className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Change Requests Yet
                </h3>
                <p className="text-gray-500 text-sm">
                  You haven't submitted any change requests for this diet plan.
                </p>
              </div>
            ) : (
              changeRequests.map((request) => (
                <div
                  key={request.id}
                  className="bg-white rounded-sm border border-gray-200 p-6"
                >
                  <div className={`flex items-start justify-between ${request.trainer_response && "mb-4"}`}>
                    <div className="flex-1">
                      <div className="flex flex-col mb-2">
                        <h4 className="font-semibold text-gray-900 mb-2">
                          {getRequestTypeDisplay(request.request_type)}
                        </h4>
                        <div className='flex items-center space-x-2'>
                          <span className={`px-2 py-1 text-xs font-medium rounded-[0.5rem] border ${getStatusColor(request.status)}`}>
                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                          </span>
                          <span className={`text-xs font-medium ${getUrgencyColor(request.urgency)}`}>
                            {request.urgency.charAt(0).toUpperCase() + request.urgency.slice(1)} Priority
                          </span>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 my-3">
                        {request.description}
                      </p>

                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>Submitted {formatDate(request.created_at)}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 text-xs text-gray-500 mt-2">
                        {request.trainer_response && (
                          <div className="flex items-center space-x-1">
                            <Users className="w-4 h-4" />
                            <span>Trainer responded</span>
                          </div>
                        )}
                      </div>

                    </div>
                  </div>

                  {/* Trainer Response */}
                  {request.trainer_response && (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-sm">
                      <div className="flex items-start space-x-3">
                        <ChefHat className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <h5 className="text-sm font-medium text-blue-900 mb-1">
                            Trainer Response
                          </h5>
                          <p className="text-sm text-blue-700 mb-2">
                            {request.trainer_response}
                          </p>
                          {request.updated_at && (
                            <p className="text-xs text-blue-600">
                              Responded on {formatDate(request.updated_at)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
