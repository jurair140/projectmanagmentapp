import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Check, CheckCheck, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  deleteNotification,
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../../services/notificationService';
import { formatRelativeTime } from '../../utils/dateUtils';
import { getErrorMessage } from '../../utils/formatters';

export default function NotificationDropdown({ unreadCount, onUnreadCountChange }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const data = await getNotifications({ limit: 6 });
      setItems(data.notifications || []);
      if (onUnreadCountChange) onUnreadCountChange(data.unreadCount || 0);
    } catch {
      // ignore dropdown silent background failure
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 60000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const handleToggle = () => {
    const next = !open;
    setOpen(next);
    if (next) loadNotifications();
  };

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id);
      setItems((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
      if (onUnreadCountChange) onUnreadCountChange(Math.max(0, unreadCount - 1));
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
      if (onUnreadCountChange) onUnreadCountChange(0);
      toast.success('All notifications marked as read');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleDelete = async (id, wasUnread) => {
    try {
      await deleteNotification(id);
      setItems((prev) => prev.filter((n) => n._id !== id));
      if (wasUnread && onUnreadCountChange) {
        onUnreadCountChange(Math.max(0, unreadCount - 1));
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={handleToggle}
        aria-label="Notifications"
        className="relative p-2 rounded-lg text-slate-300 hover:text-white hover:bg-[#1E273B] border border-transparent hover:border-slate-700/70 transition-colors"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-indigo-600 text-white text-[10px] font-semibold flex items-center justify-center border border-[#0B0F19]">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#151C2C] border border-slate-800 rounded-xl shadow-2xl z-50 overflow-hidden fade-in">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-white">Notifications</span>
              {unreadCount > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                  {unreadCount} unread
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-medium"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/70">
            {loading ? (
              <div className="p-6 text-center text-xs text-slate-400">Loading notifications...</div>
            ) : items.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                You are all caught up. No notifications yet.
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item._id}
                  className={`px-4 py-3 flex items-start gap-3 transition-colors ${
                    item.isRead ? 'bg-transparent' : 'bg-indigo-500/[0.06]'
                  }`}
                >
                  <span
                    className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${
                      item.isRead ? 'bg-slate-700' : 'bg-indigo-400'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-200 leading-relaxed">{item.message}</p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      {formatRelativeTime(item.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {!item.isRead && (
                      <button
                        type="button"
                        onClick={() => handleMarkRead(item._id)}
                        title="Mark as read"
                        className="p-1 rounded text-slate-400 hover:text-emerald-400 hover:bg-slate-800"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDelete(item._id, !item.isRead)}
                      title="Delete notification"
                      className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="px-4 py-2.5 border-t border-slate-800 bg-[#121826] text-center">
            <Link
              to="/notifications"
              onClick={() => setOpen(false)}
              className="text-xs font-medium text-indigo-400 hover:text-indigo-300"
            >
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
