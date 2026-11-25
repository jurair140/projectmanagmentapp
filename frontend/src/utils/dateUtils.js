/**
 * Format an ISO date string into a clean human-readable date (e.g. Nov 25, 2026).
 */
export const formatDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
};

/**
 * Format an ISO date string into date and time.
 */
export const formatDateTime = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

/**
 * Convert an ISO date string to YYYY-MM-DD for HTML date inputs.
 */
export const toInputDate = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
};

/**
 * Format a timestamp as relative time (e.g. "5m ago", "2d ago").
 */
export const formatRelativeTime = (value) => {
  if (!value) return '';
  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(value);
};

/**
 * Check deadline flags client-side consistently with backend logic.
 */
export const getClientDeadlineFlags = (task) => {
  if (!task || !task.dueDate || task.status === 'Completed') {
    return { isOverdue: false, isDueSoon: false };
  }
  if (typeof task.isOverdue === 'boolean' && typeof task.isDueSoon === 'boolean') {
    return { isOverdue: task.isOverdue, isDueSoon: task.isDueSoon };
  }
  const now = new Date();
  const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const due = new Date(task.dueDate);
  const dueDayStart = new Date(Date.UTC(due.getUTCFullYear(), due.getUTCMonth(), due.getUTCDate()));
  const threeDays = new Date(todayStart);
  threeDays.setUTCDate(threeDays.getUTCDate() + 3);

  const isOverdue = dueDayStart < todayStart;
  const isDueSoon = !isOverdue && dueDayStart <= threeDays;
  return { isOverdue, isDueSoon };
};
