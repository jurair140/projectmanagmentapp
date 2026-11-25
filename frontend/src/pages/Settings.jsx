import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, Lock, LogOut, Shield, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import DashboardLayout from '../components/layout/DashboardLayout';
import Button from '../components/common/Button';
import { useAuth } from '../hooks/useAuth';
import { changePassword } from '../services/authService';
import { markAllNotificationsRead } from '../services/notificationService';
import { getErrorMessage } from '../utils/formatters';

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export default function Settings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [savingPw, setSavingPw] = useState(false);
  const [clearingNotifs, setClearingNotifs] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  });

  const newPw = watch('newPassword');

  const onSubmitPassword = async (values) => {
    setSavingPw(true);
    try {
      await changePassword(values);
      toast.success('Password updated successfully');
      reset();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSavingPw(false);
    }
  };

  const handleMarkAllRead = async () => {
    setClearingNotifs(true);
    try {
      await markAllNotificationsRead();
      toast.success('All notifications marked as read');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setClearingNotifs(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    toast.success('Signed out');
    navigate('/login');
  };

  return (
    <DashboardLayout
      title="Settings"
      breadcrumbs={[{ label: 'Dashboard', to: '/dashboard' }, { label: 'Settings' }]}
    >
      <div className="max-w-3xl space-y-6">
        {/* Account & Profile Shortcut */}
        <div className="bg-[#151C2C] border border-slate-800/90 rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Account Profile</h2>
              <p className="text-sm text-slate-400 mt-0.5">
                Signed in as <span className="text-slate-200">{user?.email}</span>
              </p>
            </div>
          </div>
          <Link
            to="/profile"
            className="px-4 py-2 rounded-lg bg-[#202A3F] hover:bg-[#27334C] border border-slate-700/80 text-sm font-medium text-white text-center transition-colors"
          >
            Edit Profile & Avatar
          </Link>
        </div>

        {/* Notifications Management */}
        <div className="bg-[#151C2C] border border-slate-800/90 rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Notifications</h2>
              <p className="text-sm text-slate-400 mt-0.5">
                Task assignments, project invites, completions, and 3-day deadline alerts are active.
              </p>
            </div>
          </div>
          <Button variant="secondary" size="sm" onClick={handleMarkAllRead} loading={clearingNotifs}>
            Mark All Read
          </Button>
        </div>

        {/* Security / Password */}
        <div className="bg-[#151C2C] border border-slate-800/90 rounded-xl p-6">
          <div className="flex items-center gap-2.5 mb-4">
            <Lock className="h-5 w-5 text-indigo-400" />
            <h2 className="text-base font-semibold text-white">Security & Password</h2>
          </div>

          <form onSubmit={handleSubmit(onSubmitPassword)} className="space-y-4 max-w-md">
            <div>
              <label htmlFor="settings-cur-pw" className="block text-sm font-medium text-slate-200 mb-1.5">
                Current Password
              </label>
              <input
                id="settings-cur-pw"
                type="password"
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#0B0F19] border border-slate-700/80 text-sm text-white focus:outline-none focus:border-indigo-500"
                {...register('currentPassword', { required: 'Current password is required' })}
              />
              {errors.currentPassword && (
                <p className="text-xs text-rose-400 mt-1">{errors.currentPassword.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="settings-new-pw" className="block text-sm font-medium text-slate-200 mb-1.5">
                New Password
              </label>
              <input
                id="settings-new-pw"
                type="password"
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#0B0F19] border border-slate-700/80 text-sm text-white focus:outline-none focus:border-indigo-500"
                {...register('newPassword', {
                  required: 'New password is required',
                  pattern: {
                    value: PASSWORD_REGEX,
                    message: 'Must be 8+ chars with uppercase, lowercase, and a number',
                  },
                })}
              />
              {errors.newPassword && (
                <p className="text-xs text-rose-400 mt-1">{errors.newPassword.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="settings-conf-pw" className="block text-sm font-medium text-slate-200 mb-1.5">
                Confirm New Password
              </label>
              <input
                id="settings-conf-pw"
                type="password"
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#0B0F19] border border-slate-700/80 text-sm text-white focus:outline-none focus:border-indigo-500"
                {...register('confirmNewPassword', {
                  required: 'Please confirm your new password',
                  validate: (val) => val === newPw || 'New passwords do not match',
                })}
              />
              {errors.confirmNewPassword && (
                <p className="text-xs text-rose-400 mt-1">{errors.confirmNewPassword.message}</p>
              )}
            </div>

            <Button type="submit" loading={savingPw}>
              Update Password
            </Button>
          </form>
        </div>

        {/* Session */}
        <div className="bg-[#151C2C] border border-slate-800/90 rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Active Session</h2>
              <p className="text-sm text-slate-400 mt-0.5">
                Your session is secured via an HTTP-only authentication cookie.
              </p>
            </div>
          </div>
          <Button variant="danger" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
