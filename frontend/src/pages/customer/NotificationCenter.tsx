import { useEffect, useState } from 'react';
import { notificationService, type NotificationDTO } from '../../api/notification';
import { requireCurrentUserId } from '../../utils/session';

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<NotificationDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const userId = requireCurrentUserId();
      const data = await notificationService.getUserNotifications(userId);
      setNotifications(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to load notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void Promise.resolve().then(loadNotifications);
  }, []);

  const markAsRead = async (notificationId: number) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications((prev) => prev.map((note) => (note.id === notificationId ? { ...note, isRead: true } : note)));
    } catch {
      // no-op to keep UX responsive
    }
  };

  const markAllAsRead = async () => {
    try {
      const userId = requireCurrentUserId();
      await notificationService.markAllAsRead(userId);
      setNotifications((prev) => prev.map((note) => ({ ...note, isRead: true })));
    } catch {
      // no-op to keep UX responsive
    }
  };

  return (
    <div className="mx-auto max-w-3xl p-4 md:p-8">
      <header className="mb-8 flex items-center justify-between">
        <h1 className="font-display text-4xl font-bold">Notifications</h1>
        <button
          type="button"
          onClick={markAllAsRead}
          className="rounded-full border border-[var(--color-outline-variant)] px-4 py-2 text-sm font-semibold transition hover:bg-[var(--color-surface-container-high)]"
        >
          Mark all read
        </button>
      </header>

      {error ? (
        <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}

      {loading ? (
        <p className="text-[var(--color-on-surface-variant)]">Loading notifications...</p>
      ) : (
        <div className="space-y-4">
          {notifications.map((note) => (
            <button
              type="button"
              key={note.id}
              onClick={() => markAsRead(note.id)}
              className={`w-full rounded-[2rem] p-5 text-left transition ${note.isRead ? 'bg-[var(--color-surface-container-high)]' : 'border border-[var(--color-primary)]/20 bg-[var(--color-surface-container-lowest)] shadow-ambient'}`}
            >
              <div className="mb-1 flex items-start justify-between gap-4">
                <h3 className={`text-lg font-bold ${note.isRead ? 'text-[var(--color-on-surface-variant)]' : 'text-[var(--color-on-surface)]'}`}>
                  {note.title}
                </h3>
                <span className="text-xs text-[var(--color-on-surface-variant)]">{new Date(note.createdAt).toLocaleString()}</span>
              </div>
              <p className="text-[var(--color-on-surface-variant)]">{note.message}</p>
            </button>
          ))}

          {notifications.length === 0 ? (
            <p className="text-[var(--color-on-surface-variant)]">You are all caught up.</p>
          ) : null}
        </div>
      )}
    </div>
  );
}
