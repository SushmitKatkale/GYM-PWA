import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  AlertCircle,
  DollarSign,
  Building,
  User,
  Calendar,
  TrendingUp,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  X,
  IndianRupee,
  Grid,
  List
} from 'lucide-react';
import { adminPaymentService, VendorPaymentConfig, PaginatedVendorConfigs } from '../../services/adminPaymentService';
import { CreateVendorConfigModal } from './payment/CreateVendorConfigModal';
import { EditVendorConfigModal } from './payment/EditVendorConfigModal';
import { ViewVendorConfigModal } from './payment/ViewVendorConfigModal';
import { OnboardVendorModal } from './payment/OnboardVendorModal';
import { CommissionCalculator } from './payment/CommissionCalculator';
import { CreateOrderModal } from './payment/CreateOrderModal';

export function PaymentManagement() {
  const [activeTab, setActiveTab] = useState<'configs' | 'orders' | 'calculator'>('configs');
  const [vendorConfigs, setVendorConfigs] = useState<VendorPaymentConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [razorpayActiveFilter, setRazorpayActiveFilter] = useState('');
  const [kycStatusFilter, setKycStatusFilter] = useState('');
  const [razorpayVendorIdFilter, setRazorpayVendorIdFilter] = useState('');
  const [activeStatusFilter, setActiveStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showOnboardModal, setShowOnboardModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<VendorPaymentConfig | null>(null);
  const [viewConfigId, setViewConfigId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const loadVendorConfigs = async (page = 1, resetPage = false) => {
    setLoading(true);
    try {
      const filters = {
        status: statusFilter,
        razorpayActive: razorpayActiveFilter ? razorpayActiveFilter === 'true' : undefined,
        kycStatus: kycStatusFilter,
        razorpayVendorId: razorpayVendorIdFilter,
        activeStatus: activeStatusFilter ? activeStatusFilter === 'true' : undefined,
        ownerEmail: searchTerm.includes('@') ? searchTerm : undefined,
        gymName: !searchTerm.includes('@') ? searchTerm : undefined,
      };

      // Remove undefined values from filters
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== undefined && value !== '')
      );

      const response = await adminPaymentService.getVendorConfigs(
        resetPage ? 1 : page,
        itemsPerPage,
        Object.keys(cleanFilters).length > 0 ? cleanFilters : undefined
      );

      if (response.success && response.data) {
        setVendorConfigs(response.data.configs);
        setTotalPages(response.data.pagination.totalPages);
        setTotalRecords(response.data.pagination.total);
        setCurrentPage(resetPage ? 1 : page);
      }
    } catch (error) {
      console.error('Failed to load vendor configs:', error);
    } finally {
      setLoading(false);
    }
  };

  // Only trigger API call when itemsPerPage changes (for pagination)
  useEffect(() => {
    if (itemsPerPage !== 5) { // Only reload if user changed from default
      loadVendorConfigs(1, true);
    }
  }, [itemsPerPage]);

  // Load initial data
  useEffect(() => {
    loadVendorConfigs(1, true);
  }, []);

  const handleSearch = () => {
    loadVendorConfigs(1, true);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearAllFilters = async () => {
    // Clear all filter states
    setSearchTerm('');
    setStatusFilter('');
    setRazorpayActiveFilter('');
    setKycStatusFilter('');
    setRazorpayVendorIdFilter('');
    setActiveStatusFilter('');
    setCurrentPage(1);
    
    // Immediately call API with no filters
    setLoading(true);
    try {
      const response = await adminPaymentService.getVendorConfigs(
        1,
        itemsPerPage,
        undefined // No filters
      );

      if (response.success && response.data) {
        setVendorConfigs(response.data.configs);
        setTotalPages(response.data.pagination.totalPages);
        setTotalRecords(response.data.pagination.total);
        setCurrentPage(1);
      }
    } catch (error) {
      console.error('Failed to load vendor configs after clearing filters:', error);
    } finally {
      setLoading(false);
    }
  };

  const hasActiveFilters = statusFilter || razorpayActiveFilter || kycStatusFilter || razorpayVendorIdFilter || activeStatusFilter || searchTerm;

  const handleCreateConfig = () => {
    setShowCreateModal(true);
  };

  const handleViewConfig = (config: VendorPaymentConfig) => {
    setViewConfigId(config.id);
    setShowViewModal(true);
  };

  const handleEditConfig = (config: VendorPaymentConfig) => {
    setSelectedConfig(config);
    setShowEditModal(true);
  };

  const handleOnboardVendor = (config: VendorPaymentConfig) => {
    setSelectedConfig(config);
    setShowOnboardModal(true);
  };

  const handleCreateOrder = () => {
    setShowOrderModal(true);
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      pending_verification: 'bg-purple-100 text-purple-800',
      completed: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'in_progress':
        return <RefreshCw className="w-4 h-4 text-blue-600" />;
      case 'pending_verification':
        return <AlertCircle className="w-4 h-4 text-purple-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
    }
  };

  // Since we're now filtering on the server side, we don't need client-side filtering
  const filteredConfigs = vendorConfigs;

  const stats = [
    {
      label: 'Total Vendors',
      value: vendorConfigs.length.toString(),
      icon: Building,
      color: 'bg-blue-500'
    },
    {
      label: 'Active Configs',
      value: vendorConfigs.filter(c => c.isRazorpayActive).length.toString(),
      icon: CheckCircle,
      color: 'bg-green-500'
    },
    {
      label: 'Pending Onboarding',
      value: vendorConfigs.filter(c => c.onboardingStatus === 'pending').length.toString(),
      icon: AlertCircle,
      color: 'bg-yellow-500'
    },
    {
      label: 'Total Revenue Share',
      value: '₹45,678',
      icon: IndianRupee,
      color: 'bg-purple-500'
    }
  ];

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:items-center md:space-y-0">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Payment Management</h1>
          <p className="text-sm md:text-base text-gray-600">Manage vendor configurations and payment processing</p>
        </div>
        <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-3">
          {/* <button
            onClick={handleCreateOrder}
            className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm md:text-base"
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Create Order
          </button> */}
          <button
            onClick={handleCreateConfig}
            className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm md:text-base"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Vendor Config
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'configs', label: 'Vendor Configurations', icon: Building },
            // { id: 'orders', label: 'Order Management', icon: CreditCard },
            // { id: 'calculator', label: 'Commission Calculator', icon: TrendingUp }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'configs' && (
        <div className="space-y-6">
          {/* Search and Filters - Always Visible */}
          <div className="space-y-4">
            {/* Filter Controls - Always Visible */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gym Name / Owner Email</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search by gym name, owner email, or Razorpay ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>
                </div>

                                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Razorpay Account ID</label>
                  <input
                    type="text"
                    placeholder="Enter acc_xxx or partial ID"
                    value={razorpayVendorIdFilter}
                    onChange={(e) => setRazorpayVendorIdFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Onboarding Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white text-sm"
                  >
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="pending_verification">Pending Verification</option>
                    <option value="completed">Completed</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Razorpay Status</label>
                  <select
                    value={razorpayActiveFilter}
                    onChange={(e) => setRazorpayActiveFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white text-sm"
                  >
                    <option value="">All</option>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">KYC Status</label>
                  <select
                    value={kycStatusFilter}
                    onChange={(e) => setKycStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white text-sm"
                  >
                    <option value="">All KYC Status</option>
                    <option value="pending">Pending</option>
                    <option value="submitted">Submitted</option>
                    <option value="verified">Verified</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Configuration Status</label>
                  <select
                    value={activeStatusFilter}
                    onChange={(e) => setActiveStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white text-sm"
                  >
                    <option value="">All Configurations</option>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
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
                  Showing {vendorConfigs.length} of {totalRecords} vendor configurations
                  {hasActiveFilters && (
                    <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                      <Filter className="w-3 h-3 mr-1" />
                      {[statusFilter, razorpayActiveFilter, kycStatusFilter, razorpayVendorIdFilter, activeStatusFilter].filter(Boolean).length} filter{[statusFilter, razorpayActiveFilter, kycStatusFilter, razorpayVendorIdFilter, activeStatusFilter].filter(Boolean).length !== 1 ? 's' : ''} active
                    </span>
                  )}
                </p>
                <div className="flex items-center gap-4">
                  {/* Items per page selector */}
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600">Show:</label>
                    <select
                      value={itemsPerPage}
                      onChange={(e) => setItemsPerPage(Number(e.target.value))}
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
                      <Grid className="w-4 h-4" />
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
          

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {loading ? (
              <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                <RefreshCw className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">Loading vendor configurations...</p>
              </div>
            ) : filteredConfigs.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                <Building className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No vendor configurations found</p>
              </div>
            ) : (
              filteredConfigs.map((config) => (
                <div key={config.id} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  {/* Header with gym name and status */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <Building className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                        <h3 className="text-sm font-semibold text-gray-900 truncate">
                          {config.gym?.name || 'N/A'}
                        </h3>
                      </div>
                      <div className="flex items-center text-xs text-gray-500">
                        <User className="w-3 h-3 mr-1 flex-shrink-0" />
                        <span className="truncate">{config.ownerEmail}</span>
                      </div>
                    </div>
                    
                    {/* Quick Status Badge */}
                    <div className="ml-3">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(config.onboardingStatus)}`}>
                        {getStatusIcon(config.onboardingStatus)}
                        <span className="ml-1">
                          {config.onboardingStatus.replace('_', ' ').toUpperCase()}
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* Key Information Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {/* Commission */}
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs text-gray-500 mb-1">Commission</div>
                      <div className="text-sm font-medium text-gray-900">
                        {config.cutValue}{config.cutType === 'percentage' ? '%' : ' ₹'}
                      </div>
                      <div className="text-xs text-gray-500 capitalize">{config.cutType}</div>
                    </div>

                    {/* Razorpay Status */}
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs text-gray-500 mb-1">Razorpay Status</div>
                      <div className="flex items-center">
                        {config.isRazorpayActive ? (
                          <CheckCircle className="w-3 h-3 text-green-500 mr-1" />
                        ) : (
                          <XCircle className="w-3 h-3 text-red-500 mr-1" />
                        )}
                        <span className={`text-xs font-medium ${config.isRazorpayActive ? 'text-green-600' : 'text-red-600'}`}>
                          {config.isRazorpayActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <div className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      <span>Created: {new Date(config.createTimestamp).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleViewConfig(config)}
                      className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </button>
                    <button
                      onClick={() => handleEditConfig(config)}
                      className="flex-1 flex items-center justify-center px-3 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-sm"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </button>
                  </div>
                </div>
              ))
            )}
            
            {/* Mobile Pagination */}
            {totalPages > 1 && (
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => loadVendorConfigs(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </button>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-700">
                      Page {currentPage} of {totalPages}
                    </span>
                  </div>
                  
                  <button
                    onClick={() => loadVendorConfigs(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
                
                <div className="mt-4 text-center">
                  <p className="text-xs text-gray-500">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalRecords)} of {totalRecords} results
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Desktop Views */}
          {viewMode === 'grid' && (
            <React.Fragment>
              {/* Grid View */}
              <div className="hidden md:grid md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {loading ? (
                  <div className="col-span-full bg-white rounded-lg border border-gray-200 p-8 text-center">
                    <RefreshCw className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">Loading vendor configurations...</p>
                  </div>
                ) : filteredConfigs.length === 0 ? (
                  <div className="col-span-full bg-white rounded-lg border border-gray-200 p-8 text-center">
                    <Building className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">No vendor configurations found</p>
                  </div>
                ) : (
                  filteredConfigs.map((config) => (
                    <div key={config.id} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
                      {/* Header with gym name and status */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <Building className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                            <h3 className="text-sm font-semibold text-gray-900 truncate">
                              {config.gym?.name || 'N/A'}
                            </h3>
                          </div>
                          <div className="flex items-center text-xs text-gray-500">
                            <User className="w-3 h-3 mr-1 flex-shrink-0" />
                            <span className="truncate">{config.ownerEmail}</span>
                          </div>
                        </div>
                        
                        {/* Quick Status Badge */}
                        <div className="ml-3">
                          <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(config.onboardingStatus)}`}>
                            {getStatusIcon(config.onboardingStatus)}
                            <span className="ml-1">
                              {config.onboardingStatus.replace('_', ' ').toUpperCase()}
                            </span>
                          </span>
                        </div>
                      </div>

                      {/* Key Information Grid */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        {/* Commission */}
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="text-xs text-gray-500 mb-1">Commission</div>
                          <div className="text-sm font-medium text-gray-900">
                            {config.cutValue}{config.cutType === 'percentage' ? '%' : ' ₹'}
                          </div>
                          <div className="text-xs text-gray-500 capitalize">{config.cutType}</div>
                        </div>

                        {/* Razorpay Status */}
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="text-xs text-gray-500 mb-1">Razorpay Status</div>
                          <div className="flex items-center">
                            {config.isRazorpayActive ? (
                              <CheckCircle className="w-3 h-3 text-green-500 mr-1" />
                            ) : (
                              <XCircle className="w-3 h-3 text-red-500 mr-1" />
                            )}
                            <span className={`text-xs font-medium ${config.isRazorpayActive ? 'text-green-600' : 'text-red-600'}`}>
                              {config.isRazorpayActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Additional Info */}
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                        <div className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          <span>Created: {new Date(config.createTimestamp).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex space-x-2 pt-3 border-t border-gray-100">
                        <button
                          onClick={() => handleViewConfig(config)}
                          className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </button>
                        <button
                          onClick={() => handleEditConfig(config)}
                          className="flex-1 flex items-center justify-center px-3 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-sm"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              {/* Pagination for Grid View */}
              {totalPages > 1 && (
                <div className="bg-white rounded-lg border border-gray-200 px-4 py-3 mt-4">
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="text-sm text-gray-700">
                      Showing <span className="font-medium">{((currentPage - 1) * itemsPerPage) + 1}</span> to{' '}
                      <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalRecords)}</span> of{' '}
                      <span className="font-medium">{totalRecords}</span> results
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => loadVendorConfigs(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let page;
                        if (totalPages <= 5) {
                          page = i + 1;
                        } else if (currentPage <= 3) {
                          page = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          page = totalPages - 4 + i;
                        } else {
                          page = currentPage - 2 + i;
                        }
                        
                        return (
                          <button
                            key={page}
                            onClick={() => loadVendorConfigs(page)}
                            className={`px-4 py-2 text-sm font-medium rounded-md ${
                              page === currentPage
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                      
                      <button
                        onClick={() => loadVendorConfigs(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </React.Fragment>
          )}

          {viewMode === 'table' && (
            <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Gym & Owner
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Commission
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Razorpay Status
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
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <div className="flex justify-center">
                          <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
                        </div>
                      </td>
                    </tr>
                  ) : filteredConfigs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                        No vendor configurations found
                      </td>
                    </tr>
                  ) : (
                    filteredConfigs.map((config) => (
                      <tr key={config.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="flex items-center">
                              <Building className="w-4 h-4 text-gray-400 mr-2" />
                              <div className="text-sm font-medium text-gray-900">
                                {config.gym?.name || 'N/A'}
                              </div>
                            </div>
                            <div className="flex items-center mt-1">
                              <User className="w-4 h-4 text-gray-400 mr-2" />
                              <div className="text-sm text-gray-500">{config.ownerEmail}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {config.cutValue}{config.cutType === 'percentage' ? '%' : ' ₹'}
                          </div>
                          <div className="text-xs text-gray-500 capitalize">
                            {config.cutType}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getStatusIcon(config.onboardingStatus)}
                            <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(config.onboardingStatus)}`}>
                              {config.onboardingStatus.replace('_', ' ').toUpperCase()}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {config.isRazorpayActive ? (
                              <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-500 mr-2" />
                            )}
                            <span className={`text-sm ${config.isRazorpayActive ? 'text-green-600' : 'text-red-600'}`}>
                              {config.isRazorpayActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="w-4 h-4 mr-2" />
                            {new Date(config.createTimestamp).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handleViewConfig(config)}
                              className="text-blue-600 hover:text-blue-900"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEditConfig(config)}
                              className="text-green-600 hover:text-green-900"
                              title="Edit Configuration"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            {/* {config.onboardingStatus === 'pending' && (
                              <button
                                onClick={() => handleOnboardVendor(config)}
                                className="text-purple-600 hover:text-purple-900"
                                title="Onboard to Razorpay"
                              >
                                <CreditCard className="w-4 h-4" />
                              </button>
                            )} */}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              </div>

              {/* Enhanced Pagination */}
              {totalPages > 1 && (
                <div className="bg-white px-4 py-3 border-t border-gray-200">
                  {/* Mobile pagination */}
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => loadVendorConfigs(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Previous
                    </button>
                    <span className="text-sm text-gray-700 px-4 py-2">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => loadVendorConfigs(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </button>
                  </div>

                  {/* Desktop pagination */}
                  <div className="hidden sm:flex sm:items-center sm:justify-between">
                    <div className="flex items-center space-x-4">
                      <p className="text-sm text-gray-700">
                        Showing <span className="font-medium">{((currentPage - 1) * itemsPerPage) + 1}</span> to{' '}
                        <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalRecords)}</span> of{' '}
                        <span className="font-medium">{totalRecords}</span> results
                      </p>
                      <div className="flex items-center space-x-2">
                        <label className="text-sm text-gray-700">Show:</label>
                        <select
                          value={itemsPerPage}
                          onChange={(e) => setItemsPerPage(Number(e.target.value))}
                          className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value={5}>5</option>
                          <option value={10}>10</option>
                          <option value={25}>25</option>
                          <option value={50}>50</option>
                          <option value={100}>100</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1">
                      {/* First page */}
                      {currentPage > 3 && (
                        <>
                          <button
                            onClick={() => loadVendorConfigs(1)}
                            className="relative inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium text-gray-500 bg-white hover:bg-gray-50 rounded-l-md"
                          >
                            1
                          </button>
                          {currentPage > 4 && (
                            <span className="relative inline-flex items-center px-3 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                              <MoreHorizontal className="w-4 h-4" />
                            </span>
                          )}
                        </>
                      )}

                      {/* Previous page */}
                      <button
                        onClick={() => loadVendorConfigs(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 border border-gray-300 text-sm font-medium text-gray-500 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>

                      {/* Page numbers around current page */}
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let page;
                        if (totalPages <= 5) {
                          page = i + 1;
                        } else if (currentPage <= 3) {
                          page = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          page = totalPages - 4 + i;
                        } else {
                          page = currentPage - 2 + i;
                        }

                        return (
                          <button
                            key={page}
                            onClick={() => loadVendorConfigs(page)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${page === currentPage
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                              }`}
                          >
                            {page}
                          </button>
                        );
                      })}

                      {/* Next page */}
                      <button
                        onClick={() => loadVendorConfigs(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 border border-gray-300 text-sm font-medium text-gray-500 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>

                      {/* Last page */}
                      {currentPage < totalPages - 2 && (
                        <>
                          {currentPage < totalPages - 3 && (
                            <span className="relative inline-flex items-center px-3 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                              <MoreHorizontal className="w-4 h-4" />
                            </span>
                          )}
                          <button
                            onClick={() => loadVendorConfigs(totalPages)}
                            className="relative inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium text-gray-500 bg-white hover:bg-gray-50 rounded-r-md"
                          >
                            {totalPages}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === 'calculator' && <CommissionCalculator />}

      {/* Modals */}
      {showCreateModal && (
        <CreateVendorConfigModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadVendorConfigs();
          }}
        />
      )}

      {showViewModal && viewConfigId && (
        <ViewVendorConfigModal
          isOpen={showViewModal}
          onClose={() => {
            setShowViewModal(false);
            setViewConfigId(null);
          }}
          configId={viewConfigId}
        />
      )}

      {showEditModal && selectedConfig && (
        <EditVendorConfigModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedConfig(null);
          }}
          config={selectedConfig}
          onSuccess={() => {
            setShowEditModal(false);
            setSelectedConfig(null);
            loadVendorConfigs();
          }}
        />
      )}

      {showOnboardModal && selectedConfig && (
        <OnboardVendorModal
          isOpen={showOnboardModal}
          onClose={() => {
            setShowOnboardModal(false);
            setSelectedConfig(null);
          }}
          config={selectedConfig}
          onSuccess={() => {
            setShowOnboardModal(false);
            setSelectedConfig(null);
            loadVendorConfigs();
          }}
        />
      )}

      {showOrderModal && (
        <CreateOrderModal
          isOpen={showOrderModal}
          onClose={() => setShowOrderModal(false)}
          onSuccess={() => {
            setShowOrderModal(false);
          }}
        />
      )}
    </div>
  );
}
