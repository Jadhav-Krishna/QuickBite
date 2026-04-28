import { useEffect, useRef, useState } from 'react';
import { notificationService, type NotificationDTO } from '../api/notification';

const WS_URL = import.meta.env.VITE_WS_NOTIFICATION_URL || 'ws://localhost:8009/ws/notifications';

interface UseNotificationsOptions {
  userId: number | null;
  enabled?: boolean;
}

export const useNotifications = ({ userId, enabled = true }: UseNotificationsOptions) => {
  const [notifications, setNotifications] = useState<NotificationDTO[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const wsRef = useRef<WebSocket | null>(null);

  // Load initial notifications
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

    return () => {
      cancelled = true;
    };
  }, [userId, enabled]);

  // WebSocket connection for real-time updates
  useEffect(() => {
    if (!userId || !enabled) return;

    const connect = () => {
      const ws = new WebSocket(`${WS_URL}?userId=${userId}`);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        console.log('Notification WebSocket connected');
      };

      ws.onclose = () => {
        setIsConnected(false);
        console.log('Notification WebSocket disconnected, reconnecting...');
        setTimeout(connect, 5000);
      };

      ws.onerror = (error) => {
        console.error('Notification WebSocket error:', error);
        ws.close();
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === 'CONNECTED') {
            console.log('Notification WebSocket connection confirmed');
            return;
          }

          if (data.type === 'NEW_NOTIFICATION' && data.notification) {
            const newNotification = data.notification as NotificationDTO;
            
            setNotifications((prev) => [newNotification, ...prev]);
            setUnreadCount((prev) => prev + 1);

            // Show browser notification if permission granted
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification(newNotification.title, {
                body: newNotification.message,
                icon: '/logo.png',
                badge: '/logo.png',
              });
            }
          }
        } catch (error) {
          console.error('Failed to parse notification message:', error);
        }
      };
    };

    connect();

    return () => {
      wsRef.current?.close();
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

  const requestPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  return {
    notifications,
    unreadCount,
    isConnected,
    loading,
    markAsRead,
    markAllAsRead,
    requestPermission,
  };
};
