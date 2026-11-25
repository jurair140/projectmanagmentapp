import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Check, CheckCheck, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../components/layout/DashboardLayout';
import Button from '../components/common/Button';
import EmptyState from '../components/common/EmptyState';
import Pagination from '../components/common/Pagination';
import { Skeleton } from '../components/common/Skeleton';
import {
  deleteNotification,
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../services/notificationService';
import { formatRelativeTime } from '../utils/dateUtils';
import { getErrorMessage } from '../utils/formatters';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getNotifications({
        page,
        limit: 15,
        unreadOnly: unreadOnly ? 'true' : undefined,
      });
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
      setPagination(data.pagination || { page: 1, totalPages: 1, total: 0 });
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to load notifications'));
    } finally {
      setLoading(false);
    }
  }, [page, unreadOnly]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id);
      await loadNotifications();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      toast.success('All notifications marked as read');
      await loadNotifications();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteNotification(id);
      toast.success('Notification removed');
      await loadNotifications();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <DashboardLayout
      title="Notifications"
      breadcrumbs={[{ label: 'Dashboard', to: '/dashboard' }, { label: 'Notifications' }]}
    >
      <div className="space-y-6 max-w-4xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="inline-flex rounded-lg bg-[#151C2C] border border-slate-800 p-1 self-start">
            <button
              type="button"
              onClick={() => {
                setUnreadOnly(false);
                setPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-md text-xs font-medium ${
                !unreadOnly ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => {
                setUnreadOnly(true);
                setPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-md text-xs font-medium ${
                unreadOnly ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {unreadCount > 0 && (
            <Button variant="secondary" size="sm" onClick={handleMarkAllRead}>
              <CheckCheck className="h-4 w-4" />
              Mark all as read
            </Button>
          )}
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <EmptyState
            icon={Bell}
            title={unreadOnly ? 'No unread notifications' : 'No notifications yet'}
            description="Activity alerts for task assignments, project invites, completions, and approaching deadlines will appear here."
          />
        ) : (
          <div className="bg-[#151C2C] border border-slate-800/90 rounded-xl divide-y divide-slate-800/80 overflow-hidden">
            {notifications.map((item) => (
              <div
                key={item._id}
                className={`p-4 flex items-start justify-between gap-4 transition-colors ${
                  item.isRead ? 'bg-transparent' : 'bg-indigo-500/[0.05]'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <span
                    className={`mt-2 h-2 w-2 rounded-full shrink-0 ${
                      item.isRead ? 'bg-slate-700' : 'bg-indigo-400'
                    }`}
                  />
                  <div className="min-w-0">
                    <p className="text-sm text-slate-200">{item.message}</p>
                    <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-500">
                      <span>{formatRelativeTime(item.createdAt)}</span>
                      {item.relatedProject?._id && (
                        <Link
                          to={`/projects/${item.relatedProject._id}`}
                          className="text-indigo-400 hover:text-indigo-300"
                        >
                          View {item.relatedProject.name}
                        </Link>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {!item.isRead && (
                    <button
                      type="button"
                      onClick={() => handleMarkRead(item._id)}
                      title="Mark as read"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition-colors"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDelete(item._id)}
                    title="Delete notification"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          onPageChange={setPage}
        />
      </div>
    </DashboardLayout>
  );
}
