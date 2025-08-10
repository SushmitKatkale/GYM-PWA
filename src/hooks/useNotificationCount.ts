import { useState, useEffect, useCallback } from 'react';
import { notificationService } from '../services/notificationService';
import { useAuthStore } from '../stores/authStore';

export function useNotificationCount() {
  const { user } = useAuthStore();
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUnreadCount = useCallback(async () => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await notificationService.getUnreadCount();
      
      if (response.success && response.data) {
        setUnreadCount(response.data.unreadCount);
      } else {
        setError(response.message || 'Failed to fetch notification count');
        setUnreadCount(0);
      }
    } catch (err) {
      console.error('Error fetching unread count:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch notification count');
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch count on mount and when user changes
  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  // Function to manually refresh count (useful after marking notifications as read)
  const refresh = useCallback(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  // Function to decrement count (useful after marking a single notification as read)
  const decrement = useCallback((amount: number = 1) => {
    setUnreadCount(prev => Math.max(0, prev - amount));
  }, []);

  // Function to reset count to zero (useful after marking all as read)
  const reset = useCallback(() => {
    setUnreadCount(0);
  }, []);

  return {
    unreadCount,
    loading,
    error,
    refresh,
    decrement,
    reset
  };
}
