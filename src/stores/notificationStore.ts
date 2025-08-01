import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
  userId?: string;
  role?: string;
  actionUrl?: string;
  data?: any;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  
  // Actions
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: (userId?: string) => void;
  deleteNotification: (id: string) => void;
  getNotificationsForUser: (userId: string, role: string) => Notification[];
  getUnreadCount: (userId: string, role: string) => number;
  clearAll: () => void;
}

const initialNotifications: Notification[] = [
  {
    id: '1',
    title: 'Welcome to Gym MS!',
    message: 'Your account has been successfully created. Start exploring gyms near you!',
    type: 'success',
    read: false,
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Subscription Reminder',
    message: 'Your monthly subscription at FitZone Downtown expires in 3 days.',
    type: 'warning',
    read: false,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    userId: '3'
  },
  {
    id: '3',
    title: 'New Gym Registration',
    message: 'PowerFit Center has registered on the platform and is awaiting approval.',
    type: 'info',
    read: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    role: 'admin'
  }
];

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: initialNotifications,
      unreadCount: initialNotifications.filter(n => !n.read).length,
      isLoading: false,

      addNotification: (notificationData) => {
        const notification: Notification = {
          ...notificationData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          read: false
        };
        
        set(state => ({
          notifications: [notification, ...state.notifications],
          unreadCount: state.unreadCount + 1
        }));
      },

      markAsRead: (id) => {
        set(state => ({
          notifications: state.notifications.map(n => 
            n.id === id ? { ...n, read: true } : n
          ),
          unreadCount: Math.max(0, state.unreadCount - 1)
        }));
      },

      markAllAsRead: (userId) => {
        set(state => {
          const updatedNotifications = state.notifications.map(n => {
            if (userId && n.userId !== userId) return n;
            return { ...n, read: true };
          });
          
          const newUnreadCount = updatedNotifications.filter(n => !n.read).length;
          
          return {
            notifications: updatedNotifications,
            unreadCount: newUnreadCount
          };
        });
      },

      deleteNotification: (id) => {
        set(state => {
          const notification = state.notifications.find(n => n.id === id);
          const wasUnread = notification && !notification.read;
          
          return {
            notifications: state.notifications.filter(n => n.id !== id),
            unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount
          };
        });
      },

      getNotificationsForUser: (userId, role) => {
        return get().notifications.filter(n => 
          !n.userId && !n.role || // Global notifications
          n.userId === userId || // User-specific notifications
          n.role === role // Role-specific notifications
        );
      },

      getUnreadCount: (userId, role) => {
        return get().getNotificationsForUser(userId, role).filter(n => !n.read).length;
      },

      clearAll: () => {
        set({ notifications: [], unreadCount: 0 });
      }
    }),
    {
      name: 'notification-storage'
    }
  )
);