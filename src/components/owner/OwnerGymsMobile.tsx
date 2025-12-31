import React, { useEffect, useState } from 'react';
import { 
  Building, Plus, Search, Filter, MapPin, Star, Users, Eye, 
  Edit, Trash2, MoreVertical, ArrowLeft, Clock, Phone, Mail,
  AlertCircle, RefreshCw, ChevronRight
} from 'lucide-react';
import { useGymStore } from '../../stores/gymStore';
import { useAuthStore } from '../../stores/authStore';
import { 
  DevelopmentErrorDisplay, 
  createApiError, 
  useDevelopmentErrors, 
  shouldShowErrors 
} from '../../utils/developmentError';
import { EditGymModal } from './EditGymModal';
import { ViewMembersModal } from './ViewMembersModal';

interface OwnerGymsMobileProps {
  onBack?: () => void;
  onNavigate?: (view: string, data?: any) => void;
}

export function OwnerGymsMobile({ onBack, onNavigate }: OwnerGymsMobileProps) {
  const { user } = useAuthStore();
  const gymStore = useGymStore();
  const {
    gyms,
    isLoading,
    error,
    fetchOwnerGyms,
    searchGyms,
    clearError
  } = gymStore;
  
  // Debug logging
  console.log('GymStore object:', gymStore);
  console.log('fetchOwnerGyms function:', fetchOwnerGyms);
  console.log('searchGyms function:', searchGyms);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [selectedGym, setSelectedGym] = useState<any>(null);
  const [showGymDetails, setShowGymDetails] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const [hasFetchedOnce, setHasFetchedOnce] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [gymToEdit, setGymToEdit] = useState<any>(null);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [gymForMembers, setGymForMembers] = useState<any>(null);
  const { errors: devErrors, addError: addDevError, clearErrors: clearDevErrors } = useDevelopmentErrors();

  useEffect(() => {
    console.log('OwnerGymsMobile useEffect triggered:');
    console.log('- User:', user);
    console.log('- User role:', user?.role);
    console.log('- User role type:', typeof user?.role);
    console.log('- Is owner?', user?.role === 'owner');
    console.log('- Gyms length:', gyms.length);
    console.log('- Is loading:', isLoading);
    
    // Only fetch if user is owner and we haven't fetched before and not already loading
    if (user?.role === 'owner' && !hasFetchedOnce && !isLoading) {
      console.log('✅ Conditions met, calling fetchOwnerGyms...');
      setHasFetchedOnce(true);
      fetchOwnerGyms().catch(err => {
        console.error('Failed to fetch owner gym:', err);
        setHasFetchedOnce(false); // Reset flag on error to allow retry
      });
    } else {
      console.log('❌ Conditions not met for fetching gyms:');
      console.log('- Is owner:', user?.role === 'owner');
      console.log('- Has fetched once:', hasFetchedOnce);
      console.log('- Not loading:', !isLoading);
    }
  }, [user?.role]); // Only depend on user role, not on fetchOwnerGyms or other changing values

  // Cleanup search timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  const handleRefresh = async () => {
    setRefreshing(true);
    setHasFetchedOnce(false); // Reset fetch flag to allow new fetch
    clearDevErrors();
    try {
      await fetchOwnerGyms();
    } catch (err) {
      const apiError = createApiError('/api/owner/gym', 'GET', err);
      addDevError(apiError);
    } finally {
      setRefreshing(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    // Clear existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    // Set new timeout for debounced search
    const timeout = setTimeout(async () => {
      try {
        if (query.trim()) {
          if (searchGyms) {
            await searchGyms(query);
          }
        } else {
          if (fetchOwnerGyms) {
            await fetchOwnerGyms();
          } else if (gymStore.fetchGyms) {
            await gymStore.fetchGyms();
          }
        }
      } catch (err) {
        const apiError = createApiError(
          query.trim() ? `/api/gyms/search?q=${query}` : '/api/owner/gyms',
          'GET',
          err
        );
        addDevError(apiError);
      }
    }, 300); // 300ms debounce
    
    setSearchTimeout(timeout);
  };

  const handleGymClick = (gym: any) => {
    setSelectedGym(gym);
    setShowGymDetails(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleEditGym = (gym?: any) => {
    const targetGym = gym || gyms[0];
    console.log('🏗️ Opening gym edit form for:', targetGym?.name, targetGym);
    console.log('Current showEditModal state:', showEditModal);
    console.log('Current gymToEdit state:', gymToEdit);
    
    if (targetGym) {
      console.log('✅ Target gym found, setting modal state...');
      setGymToEdit(targetGym);
      setShowEditModal(true);
      console.log('✅ Modal state set, showEditModal should be true now');
    } else {
      console.error('❌ No target gym found');
      alert('No gym data available to edit');
    }
  };

  const handleEditModalClose = () => {
    setShowEditModal(false);
    setGymToEdit(null);
  };

  const handleGymUpdated = async (updatedGym: any) => {
    console.log('✅ Gym updated successfully:', updatedGym);
    // Refresh the gym data to show the updates
    setHasFetchedOnce(false);
    await fetchOwnerGyms();
  };

  const handleViewMembers = (gym?: any) => {
    const targetGym = gym || gyms[0];
    console.log('👥 Opening members view for:', targetGym?.name, targetGym);
    
    if (targetGym) {
      setGymForMembers(targetGym);
      setShowMembersModal(true);
    } else {
      alert('No gym data available to view members');
    }
  };

  const handleMembersModalClose = () => {
    setShowMembersModal(false);
    setGymForMembers(null);
  };

  const handleRegisterGym = () => {
    console.log('🏗️ Opening gym registration form');
    
    if (onNavigate) {
      onNavigate('register-gym');
    } else {
      // Fallback: show registration info
      const regInfo = [
        `🏋️ Gym Registration`,
        ``,
        `Registration form would allow you to:`,
        `• Enter gym name and description`,
        `• Set gym address and location`,
        `• Configure operating hours`,
        `• Add contact information`,
        `• Set gym capacity`,
        `• Upload gym images`,
        `• Configure amenities and features`
      ].join('\n');
      
      alert(regInfo);
    }
  };

  // Show available data even if there are errors - hide error throwing

  // Gym Details Modal
  if (showGymDetails && selectedGym) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                setShowGymDetails(false);
                setSelectedGym(null);
              }}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex-1">
              <h1 className="text-lg font-medium text-gray-900 font-poppins">{selectedGym.name}</h1>
              <p className="text-sm text-gray-500">Gym Details</p>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Gym Images */}
          <div className="bg-white rounded-md shadow-sm border border-gray-200 p-4">
            <h3 className="font-medium text-gray-900 mb-3">Gym Images</h3>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
              {/* Main gym image */}
              <div className="col-span-2 md:col-span-2 aspect-video bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Building className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <p className="text-xs text-gray-500">Main Gym View</p>
                </div>
              </div>
              
              {/* Equipment images */}
              <div className="space-y-2">
                <div className="aspect-square bg-gradient-to-br from-green-100 to-blue-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Users className="w-6 h-6 text-green-500 mx-auto mb-1" />
                    <p className="text-xs text-gray-500">Equipment</p>
                  </div>
                </div>
                <div className="aspect-square bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Star className="w-6 h-6 text-purple-500 mx-auto mb-1" />
                    <p className="text-xs text-gray-500">Interior</p>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">
              📸 Add gym photos to showcase your facility to potential members
            </p>
          </div>

          {/* Status Card */}
          <div className="bg-white rounded-md shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-gray-900">Status</h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(selectedGym.status)}`}>
                {selectedGym.status}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-gray-900">{selectedGym.activeMembers || 0}</div>
                <div className="text-xs text-gray-500">Active Members</div>
              </div>
              <div>
                <div className="text-lg font-bold text-gray-900">{selectedGym.capacity || 0}</div>
                <div className="text-xs text-gray-500">Capacity</div>
              </div>
              <div>
                <div className="text-lg font-bold text-gray-900">{selectedGym.occupancyRate || 0}%</div>
                <div className="text-xs text-gray-500">Occupancy</div>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-md shadow-sm border border-gray-200 p-4">
            <h3 className="font-medium text-gray-900 mb-3">Location</h3>
            <div className="flex items-start space-x-3">
              <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-900">{selectedGym.address}</p>
                <p className="text-xs text-gray-500">{selectedGym.city}, {selectedGym.state} {selectedGym.zip}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-md shadow-sm border border-gray-200 p-4">
            <h3 className="font-medium text-gray-900 mb-3">About This Gym</h3>
            <p className="text-sm text-gray-700 leading-relaxed">
              {selectedGym?.description || 'Modern fitness facility equipped with state-of-the-art equipment and professional training programs. Join our community for a comprehensive fitness experience.'}
            </p>
            {selectedGym?.rating && (
              <div className="flex items-center mt-3 pt-3 border-t border-gray-100">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="text-sm font-medium text-gray-900 ml-1">{selectedGym.rating}</span>
                <span className="text-xs text-gray-500 ml-1">/ 5.0 rating</span>
              </div>
            )}
          </div>

          {/* Contact Info */}
          <div className="bg-white rounded-md shadow-sm border border-gray-200 p-4">
            <h3 className="font-medium text-gray-900 mb-3">Contact Information</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-900">{selectedGym?.phone || 'Not provided'}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-900">{selectedGym?.email || 'Not provided'}</span>
              </div>
              {selectedGym?.websiteUrl && (
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 text-gray-400">🌐</div>
                  <a href={selectedGym.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:text-blue-800">
                    Visit Website
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Operating Hours */}
          <div className="bg-white rounded-md shadow-sm border border-gray-200 p-4">
            <h3 className="font-medium text-gray-900 mb-3">Operating Hours</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-900">
                  {selectedGym.operatingHours?.open || '06:00'} - {selectedGym.operatingHours?.close || '22:00'}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 text-gray-400">📅</div>
                <span className="text-sm text-gray-600">
                  {selectedGym?.daysOpen || 'Monday to Sunday'}
                </span>
              </div>
            </div>
          </div>

          {/* Amenities & Facilities */}
          <div className="bg-white rounded-md shadow-sm border border-gray-200 p-4">
            <h3 className="font-medium text-gray-900 mb-3">Amenities & Facilities</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center space-x-2 p-2 bg-green-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-gray-700">Free Weights</span>
              </div>
              <div className="flex items-center space-x-2 p-2 bg-blue-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-xs text-gray-700">Cardio Equipment</span>
              </div>
              <div className="flex items-center space-x-2 p-2 bg-purple-50 rounded-lg">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-xs text-gray-700">Personal Training</span>
              </div>
              <div className="flex items-center space-x-2 p-2 bg-orange-50 rounded-lg">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-xs text-gray-700">Group Classes</span>
              </div>
              <div className="flex items-center space-x-2 p-2 bg-teal-50 rounded-lg">
                <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                <span className="text-xs text-gray-700">Locker Rooms</span>
              </div>
              <div className="flex items-center space-x-2 p-2 bg-pink-50 rounded-lg">
                <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                <span className="text-xs text-gray-700">WiFi</span>
              </div>
            </div>
          </div>

          {/* Revenue */}
          <div className="bg-white rounded-md shadow-sm border border-gray-200 p-4">
            <h3 className="font-medium text-gray-900 mb-3">Revenue</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-lg font-bold text-gray-900">₹{selectedGym.monthlyRevenue || 0}</div>
                <div className="text-xs text-gray-500">This Month</div>
              </div>
              <div>
                <div className="text-lg font-bold text-green-600">+12%</div>
                <div className="text-xs text-gray-500">Growth</div>
              </div>
            </div>
          </div>

          {/* Business Information */}
          <div className="bg-white rounded-md shadow-sm border border-gray-200 p-4">
            <h3 className="font-medium text-gray-900 mb-3">Business Information</h3>
            <div className="space-y-3">
              {selectedGym?.gstNumber && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">GST Number</span>
                  <span className="text-sm font-medium text-gray-900">{selectedGym.gstNumber}</span>
                </div>
              )}
              {selectedGym?.registrationNo && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Registration No</span>
                  <span className="text-sm font-medium text-gray-900">{selectedGym.registrationNo}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Established</span>
                <span className="text-sm font-medium text-gray-900">{selectedGym?.establishedYear || new Date().getFullYear()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Gym ID</span>
                <span className="text-sm font-medium text-gray-900">#{selectedGym?.id || '001'}</span>
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-medium text-gray-900 font-poppins">My Gym</h1>
            <p className="text-sm text-gray-500">Manage your gym details</p>
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
              disabled={refreshing || isLoading}
              className="p-2 hover:bg-gray-100 rounded-full disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {showSearch && (
          <div className="mt-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search gyms..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        )}
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
        
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your gym...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Gym</h3>
            <p className="text-red-600 mb-4 text-sm">{error}</p>
            <button 
              onClick={handleRefresh}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
            >
              <RefreshCw className="w-5 h-5 inline mr-2" />
              Try Again
            </button>
          </div>
        ) : !gyms || gyms.length === 0 ? (
          <div className="text-center py-12">
            <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Gym Registered</h3>
            <p className="text-gray-500 mb-6">Register your gym to start managing it.</p>
            <p className="text-xs text-gray-400 mb-4">Debug: User role is '{user?.role}', expected 'owner'</p>
            <div className="space-y-3">
              <button 
                onClick={() => handleRegisterGym()}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium block mx-auto"
              >
                <Plus className="w-5 h-5 inline mr-2" />
                Register Your Gym
              </button>
              <button 
                onClick={() => {
                  console.log('Force fetching gym data...');
                  setHasFetchedOnce(false);
                  fetchOwnerGyms();
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium text-sm block mx-auto"
              >
                <RefreshCw className="w-4 h-4 inline mr-2" />
                Force Fetch (Debug)
              </button>
            </div>
          </div>
        ) : (
          // Single gym display
          <div className="space-y-4">
            {/* Gym Overview Card */}
            <div className="bg-white rounded-md shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Building className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{gyms[0]?.name}</h3>
                    <p className="text-xs text-gray-500 flex items-center">
                      <MapPin className="w-3 h-3 mr-1" />
                      {gyms[0]?.city}, {gyms[0]?.state}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(gyms[0]?.status || 'active')}`}>
                    {gyms[0]?.status || 'active'}
                  </span>
                  <button
                    onClick={() => handleGymClick(gyms[0])}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <Eye className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-3 text-center bg-gray-50 rounded-lg p-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">{gyms[0]?.activeMembers || 0}</p>
                  <p className="text-xs text-gray-500">Members</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{gyms[0]?.occupancyRate || 0}%</p>
                  <p className="text-xs text-gray-500">Occupancy</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">₹{gyms[0]?.monthlyRevenue || 0}</p>
                  <p className="text-xs text-gray-500">Revenue</p>
                </div>
              </div>
            </div>
            
            {/* Quick Management Options */}
            <div className="bg-white rounded-md shadow-sm border border-gray-200 p-4">
              <h3 className="font-medium text-gray-900 mb-3">Quick Actions</h3>
              <div className="grid grid-cols-1 gap-3">
                <button 
                  onClick={() => handleGymClick(gyms[0])}
                  className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors group"
                >
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-blue-200 transition-colors">
                    <Eye className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">View Gym Details</span>
                  <ChevronRight className="w-4 h-4 text-gray-400 ml-auto" />
                </button>
                
                <button 
                  onClick={() => handleEditGym()}
                  className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors group"
                >
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-green-200 transition-colors">
                    <Edit className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">Edit Gym Information</span>
                  <ChevronRight className="w-4 h-4 text-gray-400 ml-auto" />
                </button>
                
                <button 
                  onClick={() => handleViewMembers()}
                  className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors group"
                >
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-purple-200 transition-colors">
                    <Users className="w-4 h-4 text-purple-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">View Members</span>
                  <ChevronRight className="w-4 h-4 text-gray-400 ml-auto" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Gym Modal */}
      {console.log('💬 Modal render - showEditModal:', showEditModal, 'gymToEdit:', gymToEdit)}
      <EditGymModal
        isOpen={showEditModal}
        onClose={handleEditModalClose}
        gym={gymToEdit}
        onSave={handleGymUpdated}
      />

      {/* View Members Modal */}
      <ViewMembersModal
        isOpen={showMembersModal}
        onClose={handleMembersModalClose}
        gym={gymForMembers}
      />
    </div>
  );
}
