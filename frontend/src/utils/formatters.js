const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const BACKEND_ORIGIN = API_URL.replace(/\/api\/?$/, '');

export const resolveAvatarUrl = (avatar) => {
  if (!avatar) return '';
  if (avatar.startsWith('http://') || avatar.startsWith('https://') || avatar.startsWith('data:')) {
    return avatar;
  }
  if (avatar.startsWith('/')) {
    return `${BACKEND_ORIGIN}${avatar}`;
  }
  return avatar;
};

export const getInitials = (name = '') => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'U';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

export const PROJECT_STATUS_STYLES = {
  Planning: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
  Active: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
  Completed: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  'On Hold': 'bg-amber-500/15 text-amber-300 border-amber-500/30',
};

export const TASK_PRIORITY_STYLES = {
  High: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
  Medium: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  Low: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
};

export const TASK_STATUS_STYLES = {
  'To Do': 'bg-slate-500/20 text-slate-300 border-slate-500/30',
  'In Progress': 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
  Completed: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
};

export const getErrorMessage = (error, fallback = 'Something went wrong') => {
  return error?.response?.data?.message || error?.message || fallback;
};
