import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Eye,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  X,
  Users,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Building,
  User,
  Download,
  Grid,
  List
} from 'lucide-react';
import { adminPaymentService, UserSubscription, PaginatedUserSubscriptions, UserSubscriptionStats } from '../../../services/adminPaymentService';

interface UserSubscriptionsTabProps {
  onViewSubscription?: (subscription: UserSubscription) => void;
}

export function UserSubscriptionsTab({ onViewSubscription }: UserSubscriptionsTabProps) {
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([]);
  const [stats, setStats] = useState<UserSubscriptionStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [gymNameFilter, setGymNameFilter] = useState('');

  const loadSubscriptions = async (page = 1, resetPage = false) => {
    setLoading(true);
    try {
      const filters = {
        status: statusFilter || undefined,
        userEmail: searchTerm.includes('@') ? searchTerm : undefined,
        gymName: gymNameFilter || (!searchTerm.includes('@') && searchTerm ? searchTerm : undefined),
      };

      // Remove undefined values
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== undefined && value !== '')
      );

      const response = await adminPaymentService.getAllUserSubscriptions(
        resetPage ? 1 : page,
        itemsPerPage,
        Object.keys(cleanFilters).length > 0 ? cleanFilters : undefined
      );

      if (response.success && response.data) {
        setSubscriptions(response.data.subscriptions);
        setTotalPages(response.data.pagination.totalPages);
        setTotalRecords(response.data.pagination.total);
        setCurrentPage(resetPage ? 1 : page);
      }
    } catch (error) {
      console.error('Failed to load subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await adminPaymentService.getUserSubscriptionStats();
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Failed to load subscription stats:', error);
    }
  };

  useEffect(() => {
    loadSubscriptions(1, true);
    loadStats();
  }, []);

  useEffect(() => {
    if (itemsPerPage !== 10) {
      loadSubscriptions(1, true);
    }
  }, [itemsPerPage]);

  const handleSearch = () => {
    loadSubscriptions(1, true);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setGymNameFilter('');
    setCurrentPage(1);
    setTimeout(() => loadSubscriptions(1, true), 100);
  };

  const hasActiveFilters = searchTerm || statusFilter || gymNameFilter;

  const getStatusBadge = (status: 'active' | 'expired' | 'expiring') => {
    const badges = {
      active: 'bg-green-100 text-green-800 border-green-200',
      expired: 'bg-red-100 text-red-800 border-red-200',
      expiring: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    };
    return badges[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusIcon = (status: 'active' | 'expired' | 'expiring') => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'expired':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'expiring':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const statsCards = stats ? [
    {
      label: 'Total Subscriptions',
      value: stats.totalSubscriptions.toString(),
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      label: 'Active',
      value: stats.activeSubscriptions.toString(),
      icon: CheckCircle,
      color: 'bg-green-500'
    },
    {
      label: 'Expiring Soon',
      value: stats.expiringSubscriptions.toString(),
      icon: Clock,
      color: 'bg-yellow-500'
    },
    {
      label: 'Today\'s New',
      value: stats.todaySubscriptions.toString(),
      icon: TrendingUp,
      color: 'bg-purple-500'
    }
  ] : [];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className="text-xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search User/Gym</label>
            <input
              type="text"
              placeholder="User email or gym name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
              <option value="expiring">Expiring Soon</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gym Name</label>
            <input
              type="text"
              placeholder="Filter by gym..."
              value={gymNameFilter}
              onChange={(e) => setGymNameFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mt-4">
          <div className="flex gap-2">
            <button
              onClick={handleSearch}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Search className="w-4 h-4 mr-2" />
              Search
            </button>
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

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Showing {subscriptions.length} of {totalRecords} subscriptions
            {hasActiveFilters && (
              <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                <Filter className="w-3 h-3 mr-1" />
                Filtered
              </span>
            )}
          </p>
          <div className="flex items-center gap-4">
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
            <div className="hidden md:flex bg-gray-100 rounded-lg p-1">
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
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User & Gym
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subscription
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Validity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="flex justify-center">
                        <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
                      </div>
                    </td>
                  </tr>
                ) : subscriptions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p>No subscriptions found</p>
                    </td>
                  </tr>
                ) : (
                  subscriptions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="flex items-center">
                            <User className="w-4 h-4 text-gray-400 mr-2" />
                            <div className="text-sm font-medium text-gray-900">
                              {sub.userEmail}
                            </div>
                          </div>
                          {sub.subscription?.gym && (
                            <div className="flex items-center mt-1">
                              <Building className="w-4 h-4 text-gray-400 mr-2" />
                              <div className="text-sm text-gray-500">
                                {sub.subscription.gym.name}
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {sub.subscription?.title || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {sub.subscription?.validityDays} days
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(sub.validFrom)} - {formatDate(sub.validTo)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getStatusIcon(new Date(sub.validTo) < new Date() ? 'expired' : (new Date(sub.validTo).getTime() - new Date().getTime()) / (1000 * 3600 * 24) <= 7 ? 'expiring' : 'active')}
                          <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusBadge(new Date(sub.validTo) < new Date() ? 'expired' : (new Date(sub.validTo).getTime() - new Date().getTime()) / (1000 * 3600 * 24) <= 7 ? 'expiring' : 'active')}`}>
                            {new Date(sub.validTo) < new Date() ? 'EXPIRED' : (new Date(sub.validTo).getTime() - new Date().getTime()) / (1000 * 3600 * 24) <= 7 ? 'EXPIRING' : 'ACTIVE'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => onViewSubscription?.(sub)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
             <div className="bg-white px-4 py-3 border-t border-gray-200">
             <div className="flex-1 flex justify-between sm:hidden">
               <button
                 onClick={() => loadSubscriptions(Math.max(1, currentPage - 1))}
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
                 onClick={() => loadSubscriptions(Math.min(totalPages, currentPage + 1))}
                 disabled={currentPage === totalPages}
                 className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
               >
                 Next
                 <ChevronRight className="w-4 h-4 ml-1" />
               </button>
             </div>

             <div className="hidden sm:flex sm:items-center sm:justify-between">
               <div className="flex items-center space-x-4">
                 <p className="text-sm text-gray-700">
                   Showing <span className="font-medium">{((currentPage - 1) * itemsPerPage) + 1}</span> to{' '}
                   <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalRecords)}</span> of{' '}
                   <span className="font-medium">{totalRecords}</span> results
                 </p>
               </div>

               <div className="flex items-center space-x-1">
                 <button
                   onClick={() => loadSubscriptions(Math.max(1, currentPage - 1))}
                   disabled={currentPage === 1}
                   className="relative inline-flex items-center px-2 py-2 border border-gray-300 text-sm font-medium text-gray-500 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                   <ChevronLeft className="w-4 h-4" />
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
                       onClick={() => loadSubscriptions(page)}
                       className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                         page === currentPage
                           ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                           : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                       }`}
                     >
                       {page}
                     </button>
                   );
                 })}

                 <button
                   onClick={() => loadSubscriptions(Math.min(totalPages, currentPage + 1))}
                   disabled={currentPage === totalPages}
                   className="relative inline-flex items-center px-2 py-2 border border-gray-300 text-sm font-medium text-gray-500 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                   <ChevronRight className="w-4 h-4" />
                 </button>
               </div>
             </div>
           </div>
          )}
        </div>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <div className="col-span-full bg-white rounded-lg border border-gray-200 p-8 text-center">
              <RefreshCw className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">Loading subscriptions...</p>
            </div>
          ) : subscriptions.length === 0 ? (
            <div className="col-span-full bg-white rounded-lg border border-gray-200 p-8 text-center">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No subscriptions found</p>
            </div>
          ) : (
            subscriptions.map((sub) => (
              <div key={sub.id} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <User className="w-4 h-4 text-gray-400 mr-2" />
                      <h3 className="text-sm font-semibold text-gray-900 truncate">
                        {sub.userEmail}
                      </h3>
                    </div>
                    {sub.subscription?.gym && (
                      <div className="flex items-center text-xs text-gray-500">
                        <Building className="w-3 h-3 mr-1" />
                        <span className="truncate">{sub.subscription.gym.name}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center">
                    {getStatusIcon(new Date(sub.validTo) < new Date() ? 'expired' : (new Date(sub.validTo).getTime() - new Date().getTime()) / (1000 * 3600 * 24) <= 7 ? 'expiring' : 'active')}
                    <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusBadge(new Date(sub.validTo) < new Date() ? 'expired' : (new Date(sub.validTo).getTime() - new Date().getTime()) / (1000 * 3600 * 24) <= 7 ? 'expiring' : 'active')}`}>
                      {new Date(sub.validTo) < new Date() ? 'EXPIRED' : (new Date(sub.validTo).getTime() - new Date().getTime()) / (1000 * 3600 * 24) <= 7 ? 'EXPIRING' : 'ACTIVE'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 mb-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs text-gray-500 mb-1">Validity</div>
                    <div className="text-sm font-medium text-gray-900">
                      {formatDate(sub.validFrom)} - {formatDate(sub.validTo)}
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => onViewSubscription?.(sub)}
                    className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View Details
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

