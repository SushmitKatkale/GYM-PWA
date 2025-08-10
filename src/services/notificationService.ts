import { apiClient } from './apiClient';

// Types for notifications
export interface Notification {
  id: string; // Using string to match backend string ID generation
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'promotion' | 'reminder';
  category?: 'subscription' | 'class' | 'workout' | 'payment' | 'system' | 'promotion' | 'reminder' | 'security';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  recipientEmail?: string;
  recipientRole?: '1' | '2' | '3'; // 1=user, 2=owner, 3=admin
  isRead: boolean;
  readAt?: string;
  gymId?: number;
  actionUrl?: string;
  actionText?: string;
  iconUrl?: string;
  imageUrl?: string;
  isGlobal: boolean;
  deliveryChannels: string[];
  deliveryStatus?: Record<string, string>;
  scheduledFor?: string;
  expiresAt?: string;
  tags?: string[];
  createTimestamp: string;
  updateTimestamp: string;
}

export interface PushSubscription {
  id: string;
  userEmail: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  platform: string;
  isActive: boolean;
  lastUsed: string;
  createTimestamp: string;
}

export interface CreateNotificationRequest {
  // Note: id is NOT included - backend will auto-generate it
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error' | 'promotion' | 'reminder';
  category?: 'subscription' | 'class' | 'workout' | 'payment' | 'system' | 'promotion' | 'reminder' | 'security';
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  recipientEmail?: string;
  recipientRole?: '1' | '2' | '3';
  isGlobal?: boolean;
  isRead?: boolean;
  readAt?: string;
  gymId?: number;
  actionUrl?: string;
  actionText?: string;
  iconUrl?: string;
  imageUrl?: string;
  deliveryChannels?: string[];
  deliveryStatus?: Record<string, string>;
  scheduledFor?: string;
  expiresAt?: string;
  tags?: string[];
  createTimestamp?: string;
  updateTimestamp?: string;
  data?: any;
}

export interface BulkNotificationRequest {
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error' | 'promotion' | 'reminder';
  category?: 'subscription' | 'class' | 'workout' | 'payment' | 'system' | 'promotion' | 'reminder' | 'security';
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  userEmails?: string[];
  role?: '1' | '2' | '3';
  gymId?: number;
  deliveryChannels?: string[];
  data?: any;
}

export interface NotificationResponse {
  success: boolean;
  data?: any;
  message?: string;
  errors?: string[];
}

export interface NotificationListResponse {
  success: boolean;
  data: {
    notifications: Notification[];
    pagination: {
      currentPage: number;
      totalPages: number;
      total: number;
      limit: number;
      unreadCount: number;
    };
  };
}

class NotificationService {
  private baseUrl = '/notifications';

  // User notification methods
  async getUserNotifications(params?: {
    page?: number;
    limit?: number;
    type?: string;
    category?: string;
    onlyUnread?: boolean;
  }): Promise<NotificationListResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.type) queryParams.append('type', params.type);
    if (params?.category) queryParams.append('category', params.category);
    if (params?.onlyUnread) queryParams.append('onlyUnread', params.onlyUnread.toString());

    const url = `${this.baseUrl}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    return apiClient.get(url);
  }

  async getUnreadCount(): Promise<{ success: boolean; data: { unreadCount: number } }> {
    return apiClient.get(`${this.baseUrl}/unread-count`);
  }

  async markAsRead(notificationId: string): Promise<NotificationResponse> {
    return apiClient.put(`${this.baseUrl}/${notificationId}/read`);
  }

  async markAllAsRead(): Promise<NotificationResponse> {
    return apiClient.put(`${this.baseUrl}/mark-all-read`);
  }

  async deleteNotification(notificationId: string): Promise<NotificationResponse> {
    return apiClient.delete(`${this.baseUrl}/${notificationId}`);
  }

  // Push subscription methods
  async registerPushSubscription(subscription: {
    subscription: {
      endpoint: string;
      keys: {
        p256dh: string;
        auth: string;
      };
    };
    deviceInfo?: {
      userAgent?: string;
    };
  }): Promise<NotificationResponse> {
    return apiClient.post(`${this.baseUrl}/push/subscribe`, subscription);
  }

  async unregisterPushSubscription(endpoint: string): Promise<NotificationResponse> {
    return apiClient.post(`${this.baseUrl}/push/unsubscribe`, { endpoint });
  }

  async getUserSubscriptions(): Promise<{
    success: boolean;
    data: { subscriptions: PushSubscription[] };
  }> {
    return apiClient.get(`${this.baseUrl}/push/subscriptions`);
  }

  // Test notification
  async sendTestNotification(data?: {
    title?: string;
    message?: string;
    type?: 'info' | 'success' | 'warning' | 'error';
  }): Promise<NotificationResponse> {
    return apiClient.post(`${this.baseUrl}/test`, data || {});
  }

  // Admin methods
  async createNotification(data: CreateNotificationRequest): Promise<NotificationResponse> {
    return apiClient.post(`${this.baseUrl}/admin/create`, data);
  }

  async getAllNotifications(params?: {
    page?: number;
    limit?: number;
    type?: string;
    category?: string;
    recipientEmail?: string;
    isGlobal?: boolean;
  }): Promise<NotificationListResponse> {
    console.log('🔍 getAllNotifications called with params:', params);
    
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.type) queryParams.append('type', params.type);
    if (params?.category) queryParams.append('category', params.category);
    if (params?.recipientEmail) queryParams.append('recipientEmail', params.recipientEmail);
    if (params?.isGlobal !== undefined) queryParams.append('isGlobal', params.isGlobal.toString());

    const url = `${this.baseUrl}/admin/all${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    console.log('🔍 Making API call to:', url);
    
    try {
      const response = await apiClient.get(url);
      console.log('🔍 API response received:', {
        success: response.success,
        notificationCount: response.data?.notifications?.length || 0,
        hasData: !!response.data,
        hasPagination: !!response.data?.pagination
      });
      return response;
    } catch (error) {
      console.error('🔍 API call failed:', error);
      throw error;
    }
  }

  async sendBulkNotification(data: BulkNotificationRequest): Promise<NotificationResponse> {
    return apiClient.post(`${this.baseUrl}/admin/bulk-send`, data);
  }

  async cleanupExpiredNotifications(): Promise<{
    success: boolean;
    data: {
      deletedNotifications: number;
      deletedSubscriptions: number;
    };
  }> {
    return apiClient.post(`${this.baseUrl}/admin/cleanup`);
  }

  // Utility methods
  getNotificationIcon(type: string): string {
    const iconMap: Record<string, string> = {
      info: '🔔',
      success: '✅',
      warning: '⚠️',
      error: '❌',
      promotion: '🎯',
      reminder: '⏰'
    };
    return iconMap[type] || iconMap.info;
  }

  getNotificationColor(type: string): string {
    const colorMap: Record<string, string> = {
      info: 'blue',
      success: 'green',
      warning: 'yellow',
      error: 'red',
      promotion: 'purple',
      reminder: 'orange'
    };
    return colorMap[type] || colorMap.info;
  }

  formatRelativeTime(timestamp: string): string {
    const now = new Date();
    const date = new Date(timestamp);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  }
}

export const notificationService = new NotificationService();
