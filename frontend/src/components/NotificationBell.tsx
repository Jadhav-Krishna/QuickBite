import { useEffect, useRef, useState } from 'react';
import { Bell, Check, CheckCheck, X, Trash2 } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';
import { useAuth } from '../context/AuthContext';
import { formatDistanceToNow } from 'date-fns';

export default function NotificationBell() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
  } = useNotifications({
    userId: user?.userId || null,
    enabled: !!user,
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Auto-hide toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  if (!user) return null;

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'ORDER_PLACED':
      case 'ORDER_CONFIRMED':
      case 'ORDER_PREPARING':
        return '📦';
      case 'ORDER_READY':
      case 'ORDER_PICKED_UP':
        return '🚚';
      case 'ORDER_IN_TRANSIT':
        return '🛵';
      case 'ORDER_DELIVERED':
        return '✅';
      case 'ORDER_CANCELLED':
        return '❌';
      case 'PAYMENT_SUCCESS':
        return '💳';
      case 'PAYMENT_FAILED':
        return '⚠️';
      default:
        return '🔔';
    }
  };

  return (
    <>
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-[60] animate-fade-in">
          <div className="rounded-xl bg-green-600 px-4 py-3 text-sm font-bold text-white shadow-2xl">
            {toast}
          </div>
        </div>
      )}

      <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition-all hover:bg-slate-200 hover:text-slate-900"
        aria-label="Notifications"
      >
        <Bell size={20} />
        
        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-lg">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 top-12 z-50 w-96 max-w-[calc(100vw-2rem)] rounded-2xl border border-slate-200 bg-white shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 p-4">
            <div>
              <h3 className="font-display text-lg font-bold text-slate-900">Notifications</h3>
              {unreadCount > 0 && (
                <p className="text-xs font-semibold text-slate-500">
                  {unreadCount} unread
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {notifications.length > 0 && (
                <button
                  onClick={async () => {
                    if (window.confirm('Clear all notifications? This cannot be undone.')) {
                      setIsClearing(true);
                      await clearAllNotifications();
                      setIsClearing(false);
                      setToast('All notifications cleared');
                    }
                  }}
                  disabled={isClearing}
                  className="flex items-center gap-1 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600 transition-colors hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Clear all"
                >
                  <Trash2 size={14} />
                  {isClearing ? 'Clearing...' : 'Clear All'}
                </button>
              )}
              {unreadCount > 0 && (
                <button
                  onClick={() => void markAllAsRead()}
                  className="flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-200"
                  title="Mark all as read"
                >
                  <CheckCheck size={14} />
                  Mark all
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-[32rem] overflow-y-auto">
            {loading ? (
              <div className="space-y-2 p-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="skeleton h-20 rounded-xl" />
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                  <Bell size={32} className="text-slate-400" />
                </div>
                <p className="font-bold text-slate-600">No notifications yet</p>
                <p className="mt-1 text-xs text-slate-500">
                  We'll notify you when something happens
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`group relative p-4 transition-colors hover:bg-slate-50 ${
                      !notification.isRead ? 'bg-blue-50/50' : ''
                    }`}
                  >
                    {/* Unread Indicator */}
                    {!notification.isRead && (
                      <div className="absolute left-2 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-blue-600" />
                    )}

                    <div className="flex gap-3 pl-4">
                      {/* Icon */}
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xl">
                        {getEventIcon(notification.eventType)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-bold text-slate-900 text-sm">
                            {notification.title}
                          </h4>
                          <div className="flex items-center gap-1">
                            {!notification.isRead && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  void markAsRead(notification.id);
                                }}
                                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-slate-400 opacity-0 transition-all hover:bg-slate-200 hover:text-slate-700 group-hover:opacity-100"
                                title="Mark as read"
                              >
                                <Check size={14} />
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                void deleteNotification(notification.id);
                                setToast('Notification deleted');
                              }}
                              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-slate-400 opacity-0 transition-all hover:bg-red-100 hover:text-red-600 group-hover:opacity-100"
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                        <p className="mt-1 text-xs text-slate-600 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="mt-2 text-[10px] font-semibold text-slate-400">
                          {formatDistanceToNow(new Date(notification.createdAt), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t border-slate-200 p-3 text-center">
              <button className="text-xs font-bold text-red-600 transition-colors hover:text-red-700">
                View All Notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
    </>
  );
}
