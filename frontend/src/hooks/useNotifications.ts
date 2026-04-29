import { useEffect, useRef, useState } from 'react';
import { notificationService, type NotificationDTO } from '../api/notification';

interface UseNotificationsOptions {
  userId: number | null;
  enabled?: boolean;
}

export const useNotifications = ({ userId, enabled = true }: UseNotificationsOptions) => {
  const [notifications, setNotifications] = useState<NotificationDTO[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load and poll notifications
  useEffect(() => {
    if (!userId || !enabled) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const loadNotifications = async () => {
      try {
        const [allNotifications, unread] = await Promise.all([
          notificationService.getUserNotifications(userId),
          notificationService.getUnreadNotifications(userId),
        ]);

        if (!cancelled) {
          setNotifications(allNotifications);
          setUnreadCount(unread.length);
        }
      } catch (error) {
        console.error('Failed to load notifications:', error);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadNotifications();

    // Poll every 5 seconds for real-time updates
    pollIntervalRef.current = setInterval(() => {
      void loadNotifications();
    }, 5000);

    return () => {
      cancelled = true;
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [userId, enabled]);

  const markAsRead = async (notificationId: number) => {
    try {
      await notificationService.markAsRead(notificationId);
      
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!userId) return;

    try {
      await notificationService.markAllAsRead(userId);
      
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId: number) => {
    // Optimistic update - remove immediately from UI
    const notification = notifications.find((n) => n.id === notificationId);
    const wasUnread = notification && !notification.isRead;
    
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    if (wasUnread) {
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }

    try {
      await notificationService.deleteNotification(notificationId);
    } catch (error) {
      console.error('Failed to delete notification:', error);
      // Revert on error
      if (notification) {
        setNotifications((prev) => [...prev, notification].sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ));
        if (wasUnread) {
          setUnreadCount((prev) => prev + 1);
        }
      }
    }
  };

  const clearAllNotifications = async () => {
    if (!userId) return;

    // Optimistic update - clear immediately from UI
    const previousNotifications = notifications;
    const previousUnreadCount = unreadCount;
    
    setNotifications([]);
    setUnreadCount(0);

    try {
      await notificationService.clearAllNotifications(userId);
    } catch (error) {
      console.error('Failed to clear all notifications:', error);
      // Revert on error
      setNotifications(previousNotifications);
      setUnreadCount(previousUnreadCount);
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
  };
};
