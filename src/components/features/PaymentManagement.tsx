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
  RefreshCw
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
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showOnboardModal, setShowOnboardModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<VendorPaymentConfig | null>(null);
  const [viewConfigId, setViewConfigId] = useState<number | null>(null);

  const loadVendorConfigs = async (page = 1) => {
    setLoading(true);
    try {
      const response = await adminPaymentService.getVendorConfigs(page, 10, statusFilter);
      if (response.success && response.data) {
        setVendorConfigs(response.data.configs);
        setTotalPages(response.data.pagination.totalPages);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error('Failed to load vendor configs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVendorConfigs();
  }, [statusFilter]);

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

  const filteredConfigs = vendorConfigs.filter(config =>
    config.gym?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    config.ownerEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      icon: DollarSign,
      color: 'bg-purple-500'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payment Management</h1>
          <p className="text-gray-600">Manage vendor configurations and payment processing</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleCreateOrder}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Create Order
          </button>
          <button
            onClick={handleCreateConfig}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
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
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by gym name or owner email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="pending_verification">Pending Verification</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Vendor Configs Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
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
                            {config.onboardingStatus === 'pending' && (
                              <button
                                onClick={() => handleOnboardVendor(config)}
                                className="text-purple-600 hover:text-purple-900"
                                title="Onboard to Razorpay"
                              >
                                <CreditCard className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => loadVendorConfigs(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => loadVendorConfigs(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing page <span className="font-medium">{currentPage}</span> of{' '}
                      <span className="font-medium">{totalPages}</span>
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => loadVendorConfigs(page)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            page === currentPage
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
            )}
          </div>
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
