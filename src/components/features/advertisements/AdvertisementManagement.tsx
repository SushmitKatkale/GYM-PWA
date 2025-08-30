import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Filter, Edit, Trash2, Copy, 
  Eye, EyeOff, BarChart3, Calendar, Upload, Download, Grid3X3, List, X
} from 'lucide-react';
import { useAdvertisementStore } from '../../../stores/advertisementStore';
import { Advertisement, AdStatus, AdType } from '../../../models/Advertisement';
import { AdvertisementForm } from './AdvertisementForm';
import { AdvertisementAnalytics } from './AdvertisementAnalytics';

export function AdvertisementManagement() {
  const {
    advertisements,
    advertisementStats,
    pagination,
    filters,
    loading,
    error,
    selectedAdvertisements,
    fetchAdvertisements,
    fetchAdvertisementStats,
    deleteAdvertisement,
    duplicateAdvertisement,
    toggleAdvertisementStatus,
    setFilters,
    clearFilters,
    toggleAdvertisementSelection,
    clearSelection,
    exportAdvertisements
  } = useAdvertisementStore();

  const [currentView, setCurrentView] = useState<'list' | 'form' | 'analytics'>('list');
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Load data on component mount
  useEffect(() => {
    fetchAdvertisements();
    fetchAdvertisementStats();
  }, [fetchAdvertisements, fetchAdvertisementStats]);

  // Handle search - manual search only
  const handleSearch = () => {
    const searchFilters = {
      search: searchTerm.trim() || undefined,
      status: filters.status,
      adType: filters.adType,
      targetAudience: filters.targetAudience,
      startDate: filters.startDate,
      endDate: filters.endDate,
      minBudget: filters.minBudget,
      maxBudget: filters.maxBudget,
      sortBy: filters.sortBy || 'created_at',
      sortOrder: filters.sortOrder || 'DESC',
    };
    
    // Remove undefined values from filters
    const cleanFilters = Object.fromEntries(
      Object.entries(searchFilters).filter(([_, value]) => value !== undefined && value !== '')
    );
    
    setFilters(cleanFilters);
    fetchAdvertisements(1, pagination.limit);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearAllFilters = async () => {
    // Clear all filter states
    setSearchTerm('');
    setFilters({});
    
    // Immediately call API with no filters
    fetchAdvertisements(1, pagination.limit);
  };

  // Check for active filters including search
  const hasActiveFilters = searchTerm || Object.keys(filters).some(key => filters[key] !== undefined && filters[key] !== '');

  const handleFilterChange = (key: string, value: any) => {
    setFilters({ ...filters, [key]: value });
  };

  const handlePageChange = (page: number) => {
    fetchAdvertisements(page, pagination.limit);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this advertisement?')) {
      await deleteAdvertisement(id);
    }
  };

  const handleDuplicate = async (ad: Advertisement) => {
    await duplicateAdvertisement(ad.id, `${ad.title} - Copy`);
  };

  const handleStatusToggle = async (id: string, currentStatus: AdStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    await toggleAdvertisementStatus(id, newStatus);
  };

  // Count active filters (excluding search)
  const getActiveFilterCount = () => {
    const filterKeys = Object.keys(filters).filter(key => 
      key !== 'search' && filters[key] !== undefined && filters[key] !== ''
    );
    return filterKeys.length;
  };

  // Handle bulk actions
  const handleBulkDelete = async () => {
    if (selectedAdvertisements.length === 0) return;
    if (window.confirm(`Are you sure you want to delete ${selectedAdvertisements.length} advertisement(s)?`)) {
      // Implementation depends on your store having bulk delete method
      for (const id of selectedAdvertisements) {
        await deleteAdvertisement(id);
      }
      clearSelection();
    }
  };

  const handleBulkStatusChange = async (newStatus: AdStatus) => {
    if (selectedAdvertisements.length === 0) return;
    for (const id of selectedAdvertisements) {
      await toggleAdvertisementStatus(id, newStatus);
    }
    clearSelection();
  };

  const getStatusBadge = (status: AdStatus) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-red-100 text-red-800',
      draft: 'bg-yellow-100 text-yellow-800',
      expired: 'bg-gray-100 text-gray-800'
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getTypeBadge = (type: AdType) => {
    const styles = {
      banner: 'bg-blue-100 text-blue-800',
      popup: 'bg-purple-100 text-purple-800',
      card: 'bg-indigo-100 text-indigo-800',
      video: 'bg-pink-100 text-pink-800',
      carousel: 'bg-cyan-100 text-cyan-800'
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[type]}`}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </span>
    );
  };

  const StatCard = ({ title, value, icon: Icon, color }: { 
    title: string; 
    value: string | number; 
    icon: any; 
    color: string; 
  }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  if (currentView === 'form') {
    return (
      <AdvertisementForm
        advertisement={editingAd}
        onSave={() => {
          setCurrentView('list');
          setEditingAd(null);
          fetchAdvertisements();
        }}
        onCancel={() => {
          setCurrentView('list');
          setEditingAd(null);
        }}
      />
    );
  }

  if (currentView === 'analytics') {
    return (
      <AdvertisementAnalytics
        onBack={() => setCurrentView('list')}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Advertisement Management</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage and track your advertising campaigns
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            onClick={() => setCurrentView('analytics')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </button>
          {/* <button
            onClick={() => exportAdvertisements()}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </button> */}
          <button
            onClick={() => setCurrentView('form')}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Ad
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {advertisementStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Advertisements"
            value={advertisementStats.totalAds}
            icon={BarChart3}
            color="bg-blue-600"
          />
          <StatCard
            title="Active Campaigns"
            value={advertisementStats.activeAds}
            icon={Eye}
            color="bg-green-600"
          />
          <StatCard
            title="Total Impressions"
            value={advertisementStats.totalImpressions.toLocaleString()}
            icon={BarChart3}
            color="bg-purple-600"
          />
          <StatCard
            title="Average CTR"
            value={`${(advertisementStats.averageCTR * 100).toFixed(2)}%`}
            icon={BarChart3}
            color="bg-orange-600"
          />
        </div>
      )}

      {/* Search and Filters - Always Visible */}
      <div className="space-y-4">
        {/* Filter Controls - Always Visible */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by title, content, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status || ''}
                onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white text-sm"
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="draft">Draft</option>
                <option value="expired">Expired</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ad Type</label>
              <select
                value={filters.adType || ''}
                onChange={(e) => handleFilterChange('adType', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white text-sm"
              >
                <option value="">All Types</option>
                <option value="banner">Banner</option>
                <option value="popup">Popup</option>
                <option value="card">Card</option>
                <option value="video">Video</option>
                <option value="carousel">Carousel</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
              <select
                value={filters.targetAudience || ''}
                onChange={(e) => handleFilterChange('targetAudience', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white text-sm"
              >
                <option value="">All Audiences</option>
                <option value="all">All</option>
                <option value="members">Members</option>
                <option value="gym_owners">Gym Owners</option>
                <option value="specific_gyms">Specific Gyms</option>
                <option value="location_based">Location Based</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={filters.startDate || ''}
                onChange={(e) => handleFilterChange('startDate', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={filters.endDate || ''}
                onChange={(e) => handleFilterChange('endDate', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          {/* Budget Filter Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Budget</label>
              <input
                type="number"
                placeholder="Min budget"
                value={filters.minBudget || ''}
                onChange={(e) => handleFilterChange('minBudget', e.target.value ? parseFloat(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Budget</label>
              <input
                type="number"
                placeholder="Max budget"
                value={filters.maxBudget || ''}
                onChange={(e) => handleFilterChange('maxBudget', e.target.value ? parseFloat(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
              <select
                value={filters.sortBy || 'created_at'}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white text-sm"
              >
                <option value="created_at">Created Date</option>
                <option value="updated_at">Updated Date</option>
                <option value="title">Title</option>
                <option value="status">Status</option>
                <option value="budget">Budget</option>
                <option value="clicks">Clicks</option>
                <option value="impressions">Impressions</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
              <select
                value={filters.sortOrder || 'DESC'}
                onChange={(e) => handleFilterChange('sortOrder', e.target.value as 'ASC' | 'DESC')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white text-sm"
              >
                <option value="DESC">Newest First</option>
                <option value="ASC">Oldest First</option>
              </select>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mt-6">
              <div className="flex gap-2">
                <button
                  onClick={handleSearch}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </button>
              </div>
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="flex items-center px-4 py-2 text-red-600 hover:text-red-700 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear All
                </button>
              )}
            </div>
          </div>

          <div className="mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <p className="text-sm text-gray-600">
              Showing {advertisements.length} of {pagination.total || 0} advertisements
              {hasActiveFilters && (
                <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                  <Filter className="w-3 h-3 mr-1" />
                  {getActiveFilterCount() + (searchTerm ? 1 : 0)} filter{(getActiveFilterCount() + (searchTerm ? 1 : 0)) !== 1 ? 's' : ''} active
                </span>
              )}
            </p>
            <div className="flex items-center gap-4">
              {/* Items per page selector */}
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Show:</label>
                <select
                  value={pagination.limit}
                  onChange={(e) => {
                    const newLimit = Number(e.target.value);
                    fetchAdvertisements(1, newLimit);
                  }}
                  className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>
              {/* View mode toggle - Desktop only */}
              <div className="hidden md:flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                  title="Grid View"
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'table'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                  title="Table View"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedAdvertisements.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-sm font-medium text-blue-800">
                {selectedAdvertisements.length} advertisement{selectedAdvertisements.length > 1 ? 's' : ''} selected
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => handleBulkStatusChange('active')}
                className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-green-700 bg-green-100 hover:bg-green-200"
              >
                <Eye className="w-3 h-3 mr-1" />
                Activate
              </button>
              <button
                onClick={() => handleBulkStatusChange('inactive')}
                className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200"
              >
                <EyeOff className="w-3 h-3 mr-1" />
                Deactivate
              </button>
              <button
                onClick={handleBulkDelete}
                className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200"
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Delete
              </button>
              <button
                onClick={clearSelection}
                className="text-xs text-blue-600 hover:text-blue-500"
              >
                Clear selection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Advertisements Table */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) {
                        // Select all visible ads
                      } else {
                        clearSelection();
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Advertisement
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Performance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Budget
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <p className="mt-2 text-sm text-gray-500">Loading advertisements...</p>
                  </td>
                </tr>
              ) : advertisements.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <p className="text-sm text-gray-500">No advertisements found</p>
                    <button
                      onClick={() => setCurrentView('form')}
                      className="mt-2 text-sm text-blue-600 hover:text-blue-500"
                    >
                      Create your first advertisement
                    </button>
                  </td>
                </tr>
              ) : (
                advertisements.map((ad) => (
                  <tr key={ad.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedAdvertisements.includes(ad.id)}
                        onChange={() => toggleAdvertisementSelection(ad.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12">
                          {ad.media && ad.media.length > 0 ? (
                            <img
                              className="h-12 w-12 rounded-lg object-cover"
                              src={ad.media[0].url || ad.media[0].location}
                              alt={ad.media[0].alt_text || ad.title}
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                              <BarChart3 className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{ad.title}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {ad.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getTypeBadge(ad.adType)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(ad.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {(ad.impressions || 0).toLocaleString()} views
                      </div>
                      <div className="text-sm text-gray-500">
                        {(ad.clicks || 0).toLocaleString()} clicks
                      </div>
                      <div className="text-sm text-gray-500">
                        CTR: {(ad.impressions || 0) > 0 ? (((ad.clicks || 0) / (ad.impressions || 0)) * 100).toFixed(2) : 0}%
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {ad.budget ? (typeof ad.budget === 'number' ? `$${ad.budget.toFixed(2)}` : ad.budget) : 'Not set'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(ad.created_at).toLocaleDateString()}
                      </div>
                      {ad.creator && (
                        <div className="text-xs text-gray-500">
                          by {ad.creator.firstName} {ad.creator.lastName}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        {/* Edit Button */}
                        <button
                          onClick={() => {
                            setEditingAd(ad);
                            setCurrentView('form');
                          }}
                          className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                          title="Edit Advertisement"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        
                        {/* Duplicate Button */}
                        <button
                          onClick={() => handleDuplicate(ad)}
                          className="p-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-md transition-colors"
                          title="Duplicate"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        
                        {/* Status Toggle Button */}
                        <button
                          onClick={() => handleStatusToggle(ad.id, ad.status)}
                          className={`p-1.5 rounded-md transition-colors ${
                            ad.status === 'active'
                              ? 'text-orange-600 hover:text-orange-800 hover:bg-orange-50'
                              : 'text-green-600 hover:text-green-800 hover:bg-green-50'
                          }`}
                          title={ad.status === 'active' ? 'Deactivate' : 'Activate'}
                        >
                          {ad.status === 'active' ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                        
                        {/* Delete Button */}
                        <button
                          onClick={() => handleDelete(ad.id)}
                          className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing{' '}
                    <span className="font-medium">
                      {(pagination.currentPage - 1) * pagination.limit + 1}
                    </span>{' '}
                    to{' '}
                    <span className="font-medium">
                      {Math.min(pagination.currentPage * pagination.limit, pagination.total)}
                    </span>{' '}
                    of{' '}
                    <span className="font-medium">{pagination.total}</span>{' '}
                    results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          page === pagination.currentPage
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </nav>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
