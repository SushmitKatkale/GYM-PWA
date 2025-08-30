import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  Mail,
  Phone,
  Calendar,
  Shield,
  UserCheck,
  UserX,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  X,
  Download,
  Bell,
  Key,
  Activity,
  Crown,
  Building
} from 'lucide-react';
import { adminUserService, User as AdminUser, PaginatedUsers, UserFilters } from '../../services/adminUserService';
import { CreateUserModal } from './users/CreateUserModal';
import { EditUserModal } from './users/EditUserModal';
import { ViewUserModal } from './users/ViewUserModal';
import { UserActivityModal } from './users/UserActivityModal';
import { BulkActionsModal } from './users/BulkActionsModal';

export function UserManagement() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [userTypeFilter, setUserTypeFilter] = useState('');
  const [recordStatusFilter, setRecordStatusFilter] = useState(''); // Changed from activeStatusFilter
  const [verifiedFilter, setVerifiedFilter] = useState('');
  const [dateRangeFilter, setDateRangeFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [viewUserId, setViewUserId] = useState<string | null>(null);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]); // Changed to number[]

  // Stats
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    verifiedUsers: 0,
    newUsersThisMonth: 0
  });

  const loadUsers = async (page = 1, resetPage = false) => {
    setLoading(true);
    try {
      const filters: UserFilters = {};
      
      // Build filters
      if (userTypeFilter) filters.type = userTypeFilter as '1' | '2' | '3' | '4';
      if (recordStatusFilter) filters.recordStatus = recordStatusFilter as '0' | '1';
      if (verifiedFilter) filters.isVerified = verifiedFilter === 'true';
      if (searchTerm.includes('@')) {
        filters.email = searchTerm;
      } else if (searchTerm) {
        filters.firstName = searchTerm;
        filters.lastName = searchTerm;
        filters.username = searchTerm;
      }

      // Date range filter
      if (dateRangeFilter) {
        const now = new Date();
        let startDate: Date;
        
        switch (dateRangeFilter) {
          case 'today':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            break;
          case 'week':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case 'month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
          case '3months':
            startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
            break;
          default:
            startDate = new Date(0);
        }
        
        filters.createdAfter = startDate.toISOString();
      }

      // Remove undefined values from filters
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== undefined && value !== '')
      );

      const response = await adminUserService.getUsers(
        resetPage ? 1 : page,
        itemsPerPage,
        Object.keys(cleanFilters).length > 0 ? cleanFilters : undefined
      );

      if (response.success && response.data) {
        setUsers(response.data.users || []);
        setTotalPages(response.data.pagination?.totalPages || 0);
        setTotalRecords(response.data.pagination?.total || 0);
        setCurrentPage(resetPage ? 1 : page);
        
        // Update stats
        if (response.data.stats) {
          setStats({
            totalUsers: response.data.stats.totalUsers || 0,
            activeUsers: response.data.stats.activeUsers || 0,
            verifiedUsers: response.data.stats.verifiedUsers || 0,
            newUsersThisMonth: response.data.stats.newUsersThisMonth || 0
          });
        }
      }
    } catch (error) {
      console.error('Failed to load users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (itemsPerPage !== 5) {
      loadUsers(1, true);
    }
  }, [itemsPerPage]);

  useEffect(() => {
    loadUsers(1, true);
  }, []);

  const handleSearch = () => {
    loadUsers(1, true);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearAllFilters = async () => {
    setSearchTerm('');
    setUserTypeFilter('');
    setRecordStatusFilter('');
    setVerifiedFilter('');
    setDateRangeFilter('');
    setCurrentPage(1);
    
    setLoading(true);
    try {
      const response = await adminUserService.getUsers(1, itemsPerPage);

      if (response.success && response.data) {
        setUsers(response.data.users || []);
        setTotalPages(response.data.pagination?.totalPages || 0);
        setTotalRecords(response.data.pagination?.total || 0);
        setCurrentPage(1);
        
        if (response.data.stats) {
          setStats({
            totalUsers: response.data.stats.totalUsers || 0,
            activeUsers: response.data.stats.activeUsers || 0,
            verifiedUsers: response.data.stats.verifiedUsers || 0,
            newUsersThisMonth: response.data.stats.newUsersThisMonth || 0
          });
        }
      }
    } catch (error) {
      console.error('Failed to load users after clearing filters:', error);
    } finally {
      setLoading(false);
    }
  };

  const hasActiveFilters = userTypeFilter || recordStatusFilter || verifiedFilter || dateRangeFilter || searchTerm;

  const handleCreateUser = () => {
    setShowCreateModal(true);
  };

  const handleViewUser = (user: AdminUser) => {
    setViewUserId(user.email);
    setShowViewModal(true);
  };

  const handleEditUser = (user: AdminUser) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleViewActivity = (user: AdminUser) => {
    setSelectedUser(user);
    setShowActivityModal(true);
  };

  const handleToggleUserSelection = (userId: number) => {
    setSelectedUserIds(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAllUsers = () => {
    if (selectedUserIds.length === users.length) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(users.map(user => user.id));
    }
  };

  const handleBulkActions = () => {
    setShowBulkModal(true);
  };

  const handleQuickAction = async (action: string, user: AdminUser) => {
    try {
      setLoading(true);
      let response;
      
      switch (action) {
        case 'activate':
          response = await adminUserService.activateUser(user.id);
          loadUsers(currentPage);
          break;
        case 'deactivate':
          response = await adminUserService.deactivateUser(user.id);
          loadUsers(currentPage);
          break;
        case 'verify':
          response = await adminUserService.verifyUser(user.id);
          break;
        case 'unverify':
          response = await adminUserService.unverifyUser(user.id);
          break;
        default:
          return;
      }
      
      if (response.success) {
        loadUsers(currentPage);
      }
    } catch (error) {
      console.error(`Failed to ${action} user:`, error);
      alert(`Failed to ${action} user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const getUserTypeBadge = (role: number) => {
    const badges = {
      1: { label: 'Member', class: 'bg-blue-100 text-blue-800', icon: User },
      2: { label: 'Owner', class: 'bg-purple-100 text-purple-800', icon: Building },
      3: { label: 'Admin', class: 'bg-red-100 text-red-800', icon: Crown },
      4: { label: 'Trainer', class: 'bg-green-100 text-green-800', icon: Activity },
    };
    return badges[role as keyof typeof badges] || badges[1];
  };

  const getStatusIcon = (user: AdminUser) => {
    if (user.recordStatus === 1 && user.isVerified) {
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    } else if (user.recordStatus === 1) {
      return <AlertCircle className="w-4 h-4 text-yellow-600" />;
    } else {
      return <XCircle className="w-4 h-4 text-red-600" />;
    }
  };

  const handleExportUsers = async () => {
    try {
      const filters: UserFilters = {};
      if (userTypeFilter) filters.type = userTypeFilter as '1' | '2' | '3' | '4';
      if (recordStatusFilter) filters.recordStatus = recordStatusFilter as '0' | '1';
      if (verifiedFilter) filters.isVerified = verifiedFilter === 'true';
      
      // The exportUsers method now handles the download directly
      await adminUserService.exportUsers(filters);
      
      // Optional: Show success message
      console.log('Export completed successfully');
    } catch (error) {
      console.error('Failed to export users:', error);
      alert('Failed to export users. Please try again.');
    }
  };

  const statsCards = [
    {
      label: 'Total Users',
      value: stats.totalUsers.toString(),
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      label: 'Active Users',
      value: stats.activeUsers.toString(),
      icon: UserCheck,
      color: 'bg-green-500'
    },
    {
      label: 'Verified Users',
      value: stats.verifiedUsers.toString(),
      icon: Shield,
      color: 'bg-purple-500'
    },
    {
      label: 'New This Month',
      value: stats.newUsersThisMonth.toString(),
      icon: Calendar,
      color: 'bg-orange-500'
    }
  ];

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:items-center md:space-y-0">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-sm md:text-base text-gray-600">Manage users, permissions, and account settings</p>
        </div>
        <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-3">
          {selectedUserIds.length > 0 && (
            <button
              onClick={handleBulkActions}
              className="flex items-center justify-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm md:text-base"
            >
              <Users className="w-4 h-4 mr-2" />
              Bulk Actions ({selectedUserIds.length})
            </button>
          )}
          {/* <button
            onClick={handleExportUsers}
            className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm md:text-base"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </button> */}
          <button
            onClick={handleCreateUser}
            className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm md:text-base"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add User
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => {
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

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search Users</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Name, email, username..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">User Type</label>
              <select
                value={userTypeFilter}
                onChange={(e) => setUserTypeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white text-sm"
              >
                <option value="">All Types</option>
                <option value="1">Members</option>
                <option value="2">Gym Owners</option>
                <option value="3">Admins</option>
                <option value="4">Trainers</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Active Status</label>
              <select
                value={recordStatusFilter}
                onChange={(e) => setRecordStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white text-sm"
              >
                <option value="">All Status</option>
                <option value="1">Active</option>
                <option value="0">Inactive</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Verification</label>
              <select
                value={verifiedFilter}
                onChange={(e) => setVerifiedFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white text-sm"
              >
                <option value="">All</option>
                <option value="true">Verified</option>
                <option value="false">Unverified</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Created</label>
              <select
                value={dateRangeFilter}
                onChange={(e) => setDateRangeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white text-sm"
              >
                <option value="">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="3months">Last 3 Months</option>
              </select>
            </div>

            <div className="flex flex-col justify-end">
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
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Showing {users.length} of {totalRecords} users
              {hasActiveFilters && (
                <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                  <Filter className="w-3 h-3 mr-1" />
                  {[userTypeFilter, recordStatusFilter, verifiedFilter, dateRangeFilter, searchTerm].filter(Boolean).length} filter{[userTypeFilter, recordStatusFilter, verifiedFilter, dateRangeFilter, searchTerm].filter(Boolean).length !== 1 ? 's' : ''} active
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={selectedUserIds.length === users.length && users.length > 0}
                    onChange={handleSelectAllUsers}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type & Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
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
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => {
                  const typeBadge = getUserTypeBadge(user.role);
                  const TypeIcon = typeBadge.icon;
                  
                  return (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedUserIds.includes(user.id)}
                          onChange={() => handleToggleUserSelection(user.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
                              {user.firstName[0]}{user.lastName[0]}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-sm text-gray-500">@{user.username}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900 mb-1">
                          <Mail className="w-4 h-4 text-gray-400 mr-2" />
                          {user.email}
                        </div>
                        {user.phone && (
                          <div className="flex items-center text-sm text-gray-500">
                            <Phone className="w-4 h-4 text-gray-400 mr-2" />
                            {user.phone}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col space-y-2">
                          <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${typeBadge.class}`}>
                            <TypeIcon className="w-3 h-3 mr-1" />
                            {typeBadge.label}
                          </span>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(user)}
                            <span className={`text-xs ${
                              user.recordStatus === 1 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {user.recordStatus === 1 ? 'Active' : 'Inactive'}
                            </span>
                            {user.isVerified && (
                              <span className="text-xs text-blue-600">• Verified</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="w-4 h-4 mr-2" />
                          {new Date(user.created_at).toLocaleDateString()}
                        </div>
                        {user.lastLoginAt && (
                          <div className="text-xs text-gray-400 mt-1">
                            Last: {new Date(user.lastLoginAt).toLocaleDateString()}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-1">
                          <button
                            onClick={() => handleViewUser(user)}
                            className="text-blue-600 hover:text-blue-900 p-1"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditUser(user)}
                            className="text-green-600 hover:text-green-900 p-1"
                            title="Edit User"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleViewActivity(user)}
                            className="text-purple-600 hover:text-purple-900 p-1"
                            title="View Activity"
                          >
                            <Activity className="w-4 h-4" />
                          </button>
                          {user.recordStatus === 1 ? (
                            <button
                              onClick={() => handleQuickAction('deactivate', user)}
                              className="text-red-600 hover:text-red-900 p-1"
                              title="Deactivate User"
                            >
                              <UserX className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleQuickAction('activate', user)}
                              className="text-green-600 hover:text-green-900 p-1"
                              title="Activate User"
                            >
                              <UserCheck className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <div className="flex justify-center py-12">
            <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No users found</p>
          </div>
        ) : (
          users.map((user) => {
            const typeBadge = getUserTypeBadge(user.role);
            const TypeIcon = typeBadge.icon;
            
            return (
              <div key={user.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                {/* Header with checkbox and user info */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={selectedUserIds.includes(user.id)}
                      onChange={() => handleToggleUserSelection(user.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-1"
                    />
                    <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium text-lg">
                      {user.firstName[0]}{user.lastName[0]}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {user.firstName} {user.lastName}
                      </h3>
                      <p className="text-sm text-gray-500">@{user.username}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(user)}
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${typeBadge.class}`}>
                      <TypeIcon className="w-3 h-3 mr-1" />
                      {typeBadge.label}
                    </span>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                    <span className="truncate">{user.email}</span>
                  </div>
                  {user.phone && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                      <span>{user.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                    <span>Joined {new Date(user.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Status badges */}
                <div className="flex items-center space-x-2 mb-4">
                  <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${
                    user.recordStatus === 1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {user.recordStatus === 1 ? 'Active' : 'Inactive'}
                  </span>
                  {user.isVerified && (
                    <span className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                      <Shield className="w-3 h-3 mr-1" />
                      Verified
                    </span>
                  )}
                  {user.lastLoginAt && (
                    <span className="text-xs text-gray-500">
                      Last login: {new Date(user.lastLoginAt).toLocaleDateString()}
                    </span>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleViewUser(user)}
                      className="flex items-center px-3 py-2 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      View
                    </button>
                    <button
                      onClick={() => handleEditUser(user)}
                      className="flex items-center px-3 py-2 text-xs bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleViewActivity(user)}
                      className="flex items-center px-3 py-2 text-xs bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                    >
                      <Activity className="w-3 h-3 mr-1" />
                      Activity
                    </button>
                  </div>
                  <div>
                    {user.recordStatus === 1 ? (
                      <button
                        onClick={() => handleQuickAction('deactivate', user)}
                        className="flex items-center px-3 py-2 text-xs bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                      >
                        <UserX className="w-3 h-3 mr-1" />
                        Deactivate
                      </button>
                    ) : (
                      <button
                        onClick={() => handleQuickAction('activate', user)}
                        className="flex items-center px-3 py-2 text-xs bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                      >
                        <UserCheck className="w-3 h-3 mr-1" />
                        Activate
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white rounded-lg border border-gray-200 px-4 py-3 mt-4">
          {/* Desktop Pagination */}
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
              <button
                onClick={() => loadUsers(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-2 py-2 border border-gray-300 text-sm font-medium text-gray-500 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-l"
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
                    onClick={() => loadUsers(page)}
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
                onClick={() => loadUsers(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center px-2 py-2 border border-gray-300 text-sm font-medium text-gray-500 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-r"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Mobile Pagination */}
          <div className="sm:hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-600">Show:</label>
                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <button
                onClick={() => loadUsers(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </button>
              <div className="text-sm text-gray-600">
                {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, totalRecords)} of {totalRecords}
              </div>
              <button
                onClick={() => loadUsers(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {showCreateModal && (
        <CreateUserModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadUsers();
          }}
        />
      )}

      {showViewModal && viewUserId && (
        <ViewUserModal
          isOpen={showViewModal}
          onClose={() => {
            setShowViewModal(false);
            setViewUserId(null);
          }}
          userId={viewUserId}
        />
      )}

      {showEditModal && selectedUser && (
        <EditUserModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedUser(null);
          }}
          user={selectedUser}
          onSuccess={() => {
            setShowEditModal(false);
            setSelectedUser(null);
            loadUsers();
          }}
        />
      )}

      {showActivityModal && selectedUser && (
        <UserActivityModal
          isOpen={showActivityModal}
          onClose={() => {
            setShowActivityModal(false);
            setSelectedUser(null);
          }}
          user={selectedUser}
        />
      )}

      {showBulkModal && (
        <BulkActionsModal
          isOpen={showBulkModal}
          onClose={() => {
            setShowBulkModal(false);
            setSelectedUserIds([]);
          }}
          userIds={selectedUserIds}
          onSuccess={() => {
            setShowBulkModal(false);
            setSelectedUserIds([]);
            loadUsers();
          }}
        />
      )}
    </div>
  );
}
