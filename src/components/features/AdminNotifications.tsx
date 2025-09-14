import React, { useState, useEffect } from 'react';
import { 
  Bell, Plus, Send, Users, Filter, Search, Calendar, 
  Clock, CheckCircle, AlertCircle, Info, Target, Trash2,
  Eye, EyeOff, Settings, Zap, RefreshCw, Download,
  MessageSquare, Mail, Smartphone
} from 'lucide-react';
import { notificationService, Notification } from '../../services/notificationService';
import { useAuthStore } from '../../stores/authStore';
import { CreateNotificationModal } from './notifications/CreateNotificationModal';
import { BulkNotificationModal } from './notifications/BulkNotificationModal';
import { NotificationDetailsModal } from './notifications/NotificationDetailsModal';

interface AdminNotificationsProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function AdminNotifications({ isOpen = true, onClose }: AdminNotificationsProps = {}) {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  
  // Filter states
  const [filters, setFilters] = useState({
    type: '',
    category: '',
    recipientEmail: '',
    isGlobal: '',
    page: 1,
    limit: 20
  });
  
  // Stats states
  const [stats, setStats] = useState({
    total: 0,
    sent: 0,
    delivered: 0,
    failed: 0
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    console.log('🔍 AdminNotifications useEffect triggered:', { 
      userExists: !!user, 
      userRole: user?.role,
      isAdmin: user?.role === 'admin',
      filters 
    });
    
    if (user?.role === 'admin') { 
      console.log('🔍 User is admin, loading notifications...');
      loadStats();
      loadNotifications();
    } else {
      console.log('🔍 User is not admin, skipping notification load');
    }
  }, [user, filters]);

  const loadNotifications = async () => {
    console.log('🔍 loadNotifications called with filters:', filters);
    try {
      setLoading(true);
      setError(null); // Clear any previous errors
      console.log('🔍 Calling notificationService.getAllNotifications...');
      const response = await notificationService.getAllNotifications(filters);
      console.log('🔍 Response received:', { 
        success: response.success,
        notificationCount: response.data?.notifications?.length || 0
      });
      
      if (response.success) {
        const notifications = response.data.notifications || [];
        console.log('🔍 Setting notifications:', notifications.length, 'items');
        setNotifications(notifications);
      } else {
        console.error('🔍 API returned failure:', response.message);
        setError(response.message || 'Failed to load notifications');
      }
    } catch (error) {
      console.error('🔍 loadNotifications error:', error);
      setError(error instanceof Error ? error.message : 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    // This would typically come from a separate analytics endpoint
    // For now, we'll calculate from the current notifications
    try {
      const response = await notificationService.getAllNotifications({
        page: 1,
        limit: 20
      });
      
      if (response.success) {
        const allNotifications = response.data.notifications;
        const total = allNotifications.length;
        const sent = allNotifications.filter(n => n.deliveryStatus).length;
        const delivered = allNotifications.filter(n => 
          n.deliveryStatus && Object.values(n.deliveryStatus).some(status => status === 'delivered')
        ).length;
        const failed = allNotifications.filter(n => 
          n.deliveryStatus && Object.values(n.deliveryStatus).some(status => status === 'failed')
        ).length;

        setStats({ total, sent, delivered, failed });
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadNotifications(), loadStats()]);
    setRefreshing(false);
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filtering
    }));
  };

  const handleCleanup = async () => {
    if (window.confirm('Are you sure you want to cleanup expired notifications? This action cannot be undone.')) {
      try {
        const response = await notificationService.cleanupExpiredNotifications();
        if (response.success) {
          alert(`Cleaned up ${response.data.deletedNotifications} notifications and ${response.data.deletedSubscriptions} subscriptions`);
          handleRefresh();
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to cleanup notifications');
      }
    }
  };

  const filteredNotifications = notifications.filter(notification => 
    notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    notification.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
    notification.recipientEmail?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return CheckCircle;
      case 'warning': return AlertCircle;
      case 'error': return AlertCircle;
      case 'promotion': return Target;
      case 'reminder': return Clock;
      default: return Info;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-green-600 bg-green-50 border-green-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'error': return 'text-red-600 bg-red-50 border-red-200';
      case 'promotion': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'reminder': return 'text-orange-600 bg-orange-50 border-orange-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const getPriorityBadge = (priority: string) => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full";
    switch (priority) {
      case 'urgent': return `${baseClasses} bg-red-100 text-red-800`;
      case 'high': return `${baseClasses} bg-orange-100 text-orange-800`;
      case 'normal': return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'low': return `${baseClasses} bg-gray-100 text-gray-800`;
      default: return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getDeliveryChannelIcons = (channels: string[]) => {
    return channels.map(channel => {
      switch (channel) {
        case 'email': return <Mail key={channel} className="w-4 h-4 text-gray-600" title="Email" />;
        case 'push': return <Bell key={channel} className="w-4 h-4 text-gray-600" title="Push" />;
        case 'sms': return <Smartphone key={channel} className="w-4 h-4 text-gray-600" title="SMS" />;
        default: return <MessageSquare key={channel} className="w-4 h-4 text-gray-600" />;
      }
    });
  };

  if (!user || user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900">Access Denied</h3>
          <p className="text-gray-600">Admin access required to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <Bell className="w-8 h-8 mr-3 text-blue-600" />
                Notification Center
              </h1>
              <p className="text-gray-600 mt-1">Manage platform-wide notifications and messaging</p>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                title="Refresh"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              </button>

              {/* Cleanup Button */}
              <button
                onClick={handleCleanup}
                className="flex items-center px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                title="Cleanup Expired"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              {/* Bulk Send Button */}
              <button
                onClick={() => setShowBulkModal(true)}
                className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Users className="w-4 h-4 mr-2" />
                Bulk Send
              </button>

              {/* Create Button */}
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Notification
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Notifications</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total.toLocaleString()}</p>
              </div>
              <Bell className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Sent</p>
                <p className="text-3xl font-bold text-blue-900 mt-1">{stats.sent.toLocaleString()}</p>
              </div>
              <Send className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Delivered</p>
                <p className="text-3xl font-bold text-green-900 mt-1">{stats.delivered.toLocaleString()}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Failed</p>
                <p className="text-3xl font-bold text-red-900 mt-1">{stats.failed.toLocaleString()}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search notifications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Types</option>
                <option value="info">Info</option>
                <option value="success">Success</option>
                <option value="warning">Warning</option>
                <option value="error">Error</option>
                <option value="promotion">Promotion</option>
                <option value="reminder">Reminder</option>
              </select>

              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                <option value="subscription">Subscription</option>
                <option value="class">Class</option>
                <option value="workout">Workout</option>
                <option value="payment">Payment</option>
                <option value="system">System</option>
                <option value="promotion">Promotion</option>
                <option value="reminder">Reminder</option>
                <option value="security">Security</option>
              </select>

              <select
                value={filters.isGlobal}
                onChange={(e) => handleFilterChange('isGlobal', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Audiences</option>
                <option value="true">Global</option>
                <option value="false">Targeted</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Notifications ({filteredNotifications.length})
              </h2>
              {selectedNotifications.length > 0 && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <span>{selectedNotifications.length} selected</span>
                  <button
                    onClick={() => setSelectedNotifications([])}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600">Loading notifications...</p>
              </div>
            ) : error ? (
              <div className="p-8 text-center">
                <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                <p className="text-red-600">{error}</p>
                <button 
                  onClick={() => {
                    setError(null);
                    loadNotifications();
                  }}
                  className="mt-2 text-blue-600 hover:text-blue-700"
                >
                  Try Again
                </button>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-xl text-gray-500">No notifications found</p>
                <p className="text-gray-400">Try adjusting your filters or create a new notification</p>
              </div>
            ) : (
              filteredNotifications.map((notification) => {
                const Icon = getNotificationIcon(notification.type);
                const colorClass = getNotificationColor(notification.type);
                
                return (
                  <div 
                    key={notification.id} 
                    className="p-4 hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedNotification(notification)}
                  >
                    <div className="flex items-start space-x-4">
                      {/* Selection checkbox */}
                      <input
                        type="checkbox"
                        checked={selectedNotifications.includes(notification.id)}
                        onChange={(e) => {
                          e.stopPropagation();
                          if (e.target.checked) {
                            setSelectedNotifications(prev => [...prev, notification.id]);
                          } else {
                            setSelectedNotifications(prev => prev.filter(id => id !== notification.id));
                          }
                        }}
                        className="mt-1 rounded"
                      />

                      {/* Icon */}
                      <div className={`p-2 rounded-lg ${colorClass.split(' ')[1]} ${colorClass.split(' ')[2]}`}>
                        <Icon className={`w-4 h-4 ${colorClass.split(' ')[0]}`} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-medium text-gray-900 truncate">
                                {notification.title}
                              </h3>
                              <span className={getPriorityBadge(notification.priority)}>
                                {notification.priority}
                              </span>
                              {notification.isGlobal && (
                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                  Global
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                            
                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center space-x-4 text-xs text-gray-500">
                                <span>
                                  {notificationService.formatRelativeTime(notification.createTimestamp || notification.created_at)}
                                </span>
                                {notification.recipientEmail && (
                                  <span>To: {notification.recipientEmail}</span>
                                )}
                                {notification.category && (
                                  <span className="capitalize">{notification.category}</span>
                                )}
                              </div>
                              
                              <div className="flex items-center space-x-1">
                                {getDeliveryChannelIcons(notification.deliveryChannels)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateNotificationModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            handleRefresh();
          }}
        />
      )}

      {showBulkModal && (
        <BulkNotificationModal
          onClose={() => setShowBulkModal(false)}
          onSuccess={() => {
            setShowBulkModal(false);
            handleRefresh();
          }}
        />
      )}

      {selectedNotification && (
        <NotificationDetailsModal
          notification={selectedNotification}
          onClose={() => setSelectedNotification(null)}
        />
      )}
    </div>
  );
}
