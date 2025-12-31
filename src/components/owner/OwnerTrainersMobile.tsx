import React, { useEffect, useState } from 'react';
import { 
  Building, Plus, Search, Filter, MapPin, Star, Users, Eye, 
  Trash2, MoreVertical, ArrowLeft, Phone, Mail,
  AlertCircle, RefreshCw, ChevronRight, UserPlus, CheckCircle,
  XCircle, Loader, Send, Power, PowerOff, User
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useGymStore } from '../../stores/gymStore';
import { trainerService, TrainerInvitation, TrainerData } from '../../services/trainerService';
import { InviteTrainerModal } from '../modals/InviteTrainerModal';
import { 
  DevelopmentErrorDisplay, 
  createApiError, 
  useDevelopmentErrors, 
  shouldShowErrors 
} from '../../utils/developmentError';

interface OwnerTrainersMobileProps {
  onBack?: () => void;
  onNavigate?: (view: string, data?: any) => void;
}

export function OwnerTrainersMobile({ onBack, onNavigate }: OwnerTrainersMobileProps) {
  const { user } = useAuthStore();
  
  const [selectedGym, setSelectedGym] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive' | 'pending'>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTrainer, setSelectedTrainer] = useState<any>(null);
  const [showTrainerDetails, setShowTrainerDetails] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [trainers, setTrainers] = useState<TrainerData[]>([]);
  const [loading, setLoading] = useState(false);
  const { errors: devErrors, addError: addDevError, clearErrors: clearDevErrors } = useDevelopmentErrors();

  // API functions
  const fetchTrainers = async () => {
    setLoading(true);
    clearDevErrors();
    try {
      const response = await trainerService.getGymTrainers(); // No gymId needed - backend uses owner's gym
      if (response.success && response.data) {
        setTrainers(response.data.trainers || []);
      } else {
        const apiError = createApiError('/api/owner/trainers', 'GET', new Error(response.message));
        addDevError(apiError);
      }
    } catch (err) {
      const apiError = createApiError('/api/owner/trainers', 'GET', err);
      addDevError(apiError);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTrainerStatus = async (trainerId: string, status: 'active' | 'inactive') => {
    try {
      const response = await trainerService.updateTrainerStatus(parseInt(trainerId), status);
      if (response.success) {
        await fetchTrainers(); // Refresh data
      } else {
        const apiError = createApiError('/api/owner/trainers/status', 'PUT', new Error(response.message));
        addDevError(apiError);
      }
    } catch (err) {
      const apiError = createApiError('/api/owner/trainers/status', 'PUT', err);
      addDevError(apiError);
    }
  };

  const handleRemoveTrainer = async (trainerId: string) => {
    try {
      const response = await trainerService.removeTrainer(parseInt(trainerId));
      if (response.success) {
        await fetchTrainers(); // Refresh data
      } else {
        const apiError = createApiError('/api/owner/trainers/remove', 'DELETE', new Error(response.message));
        addDevError(apiError);
      }
    } catch (err) {
      const apiError = createApiError('/api/owner/trainers/remove', 'DELETE', err);
      addDevError(apiError);
    }
  };

  const handleResendInvitation = async (trainerId: string) => {
    try {
      const response = await trainerService.resendInvitation(parseInt(trainerId));
      if (response.success) {
        // Show success message - could add toast notification here
        await fetchTrainers(); // Refresh data
      } else {
        const apiError = createApiError('/api/owner/trainers/resend', 'POST', new Error(response.message));
        addDevError(apiError);
      }
    } catch (err) {
      const apiError = createApiError('/api/owner/trainers/resend', 'POST', err);
      addDevError(apiError);
    }
  };

  useEffect(() => {
    console.log('OwnerTrainersMobile useEffect - user:', user);
    if (user?.role === 'owner') {
      console.log('User is owner, fetching trainers...');
      fetchTrainers();
    } else {
      console.log('User is not owner or no user:', user?.role);
    }
  }, [user]);

  const handleRefresh = async () => {
    setRefreshing(true);
    clearDevErrors();
    try {
      await fetchTrainers();
    } catch (err) {
      const apiError = createApiError('/api/owner/trainers', 'GET', err);
      addDevError(apiError);
    } finally {
      setRefreshing(false);
    }
  };

  const filteredTrainers = trainers.filter(trainer => {
    const matchesSearch = !searchQuery || 
      trainer.trainer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trainer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trainer.trainer?.specialty?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'all' || trainer.status === activeFilter;
    
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleTrainerClick = (trainer: any) => {
    setSelectedTrainer(trainer);
    setShowTrainerDetails(true);
  };

  // Trainer Details Modal
  if (showTrainerDetails && selectedTrainer) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowTrainerDetails(false)}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ChevronRight className="w-5 h-5 text-gray-600 transform rotate-180" />
            </button>
            <div className="flex-1">
              <h1 className="text-lg font-medium text-gray-900 font-poppins">{selectedTrainer.trainer?.name || 'Trainer'}</h1>
              <p className="text-sm text-gray-500">Diet Plan Trainer</p>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Profile Card */}
          <div className="bg-white rounded-md shadow-sm border border-gray-200 p-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{selectedTrainer.trainer?.name || 'Trainer'}</h3>
                <p className="text-sm text-gray-500">Diet Plan Trainer</p>
                <div className="flex items-center space-x-4 mt-2">
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm text-gray-600">New</span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedTrainer.status)}`}>
                    {selectedTrainer.status}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="bg-white rounded-md shadow-sm border border-gray-200 p-4">
            <h3 className="font-medium text-gray-900 mb-3">Performance</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">0</div>
                <div className="text-xs text-gray-500">Members Assigned</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{selectedTrainer.joined_at ? 'Active' : 'New'}</div>
                <div className="text-xs text-gray-500">Status</div>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-white rounded-md shadow-sm border border-gray-200 p-4">
            <h3 className="font-medium text-gray-900 mb-3">Contact Information</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-900">{selectedTrainer.trainer?.phone || 'Not provided'}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-900">{selectedTrainer.trainer?.email || selectedTrainer.email}</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-900">Your Gym</span>
              </div>
            </div>
          </div>



        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-lg font-medium text-gray-900 font-poppins">Trainers</h1>
            <p className="text-sm text-gray-500">{filteredTrainers.length} trainers</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <Search className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 hover:bg-gray-100 rounded-full disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <button 
              onClick={() => setShowInviteModal(true)}
              className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Current Gym Display */}
        <div className="mb-4 bg-blue-50 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Building className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Your Gym</h3>
              <p className="text-sm text-blue-600">Managing trainers for your gym</p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        {showSearch && (
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search trainers..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveFilter('all')}
            className={`flex-1 py-2 px-2 text-xs font-medium rounded-md transition-colors ${
              activeFilter === 'all'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All ({trainers?.length || 0})
          </button>
          <button
            onClick={() => setActiveFilter('pending')}
            className={`flex-1 py-2 px-2 text-xs font-medium rounded-md transition-colors ${
              activeFilter === 'pending'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Pending ({(trainers || []).filter(t => t.status === 'pending').length})
          </button>
          <button
            onClick={() => setActiveFilter('active')}
            className={`flex-1 py-2 px-2 text-xs font-medium rounded-md transition-colors ${
              activeFilter === 'active'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Active ({(trainers || []).filter(t => t.status === 'active').length})
          </button>
          <button
            onClick={() => setActiveFilter('inactive')}
            className={`flex-1 py-2 px-2 text-xs font-medium rounded-md transition-colors ${
              activeFilter === 'inactive'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Inactive ({(trainers || []).filter(t => t.status === 'inactive').length})
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Development Error Display */}
        {shouldShowErrors() && devErrors.length > 0 && (
          <div className="mb-4 space-y-2">
            {devErrors.map((devError, index) => (
              <DevelopmentErrorDisplay
                key={index}
                error={devError}
                onRetry={handleRefresh}
                onDismiss={() => clearDevErrors()}
              />
            ))}
          </div>
        )}
        
        {(filteredTrainers || []).length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Trainers Found</h3>
            <p className="text-gray-500 mb-6">
              {searchQuery 
                ? 'No trainers match your search criteria.'
                : 'You haven\'t added any trainers yet.'
              }
            </p>
            <button 
              onClick={() => setShowInviteModal(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              <Plus className="w-5 h-5 inline mr-2" />
              Add First Trainer
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTrainers.map((trainer) => (
              <div 
                key={trainer.id}
                className="bg-white rounded-md shadow-sm border border-gray-200 p-4"
                onClick={() => trainer.status !== 'pending' && handleTrainerClick(trainer)}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    {trainer.status === 'pending' ? (
                      <Mail className="w-6 h-6 text-white" />
                    ) : (
                      <User className="w-6 h-6 text-white" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900">
                        {trainer.trainer?.name || trainer.email}
                      </h3>
                      {trainer.status !== 'pending' && (
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-3 mt-1">
                      {trainer.status === 'pending' ? (
                        <p className="text-sm text-gray-500">Invitation sent</p>
                      ) : (
                        <p className="text-sm text-gray-500">{trainer.trainer?.specialty || 'Trainer'}</p>
                      )}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(trainer.status)}`}>
                        {trainer.status}
                      </span>
                    </div>
                    
                    {trainer.status === 'pending' ? (
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-gray-500">
                          Invited {new Date(trainer.invited_at || '').toLocaleDateString()}
                        </p>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleResendInvitation(trainer.id);
                            }}
                            className="text-xs text-blue-600 hover:text-blue-700 px-2 py-1 rounded"
                          >
                            Resend
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveTrainer(trainer.id);
                            }}
                            className="text-xs text-red-600 hover:text-red-700 px-2 py-1 rounded"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center space-x-4">
                          {trainer.trainer?.rating && (
                            <div className="flex items-center space-x-1">
                              <Star className="w-3 h-3 text-yellow-500 fill-current" />
                              <span className="text-xs text-gray-600">{trainer.trainer.rating}</span>
                            </div>
                          )}
                          <div className="flex items-center space-x-1">
                            <Users className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-600">{trainer.trainer?.membersAssigned || 0} members</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpdateTrainerStatus(trainer.id, trainer.status === 'active' ? 'inactive' : 'active');
                            }}
                            className={`text-xs px-2 py-1 rounded ${
                              trainer.status === 'active'
                                ? 'text-red-600 hover:text-red-700'
                                : 'text-green-600 hover:text-green-700'
                            }`}
                          >
                            {trainer.status === 'active' ? 'Deactivate' : 'Activate'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Invite Trainer Modal */}
      {showInviteModal && (
        <InviteTrainerModal
          isOpen={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          onInvite={async (email: string) => {
            console.log('InviteModal onInvite - email:', email);
            console.log('InviteModal onInvite - user:', user);
            
            try {
              console.log('Inviting trainer email:', email);
              const response = await trainerService.inviteTrainer(email);
              if (!response.success) {
                throw new Error(response.message || 'Failed to send invitation');
              }
              // Refresh the trainers list after successful invitation
              await fetchTrainers();
            } catch (error) {
              console.error('Invitation error:', error);
              const apiError = createApiError('/api/owner/trainers/invite', 'POST', error);
              addDevError(apiError);
              throw error; // Re-throw to let the modal handle the error display
            }
          }}
          isLoading={loading}
        />
      )}
    </div>
  );
}
