import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Calendar, Camera, LogOut, Mail, ShieldCheck, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../components/layout/DashboardLayout';
import Avatar from '../components/common/Avatar';
import Button from '../components/common/Button';
import { useAuth } from '../hooks/useAuth';
import { updateProfile } from '../services/userService';
import { changePassword } from '../services/authService';
import { formatDate } from '../utils/dateUtils';
import { getErrorMessage } from '../utils/formatters';

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export default function Profile() {
  const { user, updateUserState, logout } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [removeAvatarFlag, setRemoveAvatarFlag] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    reset: resetProfile,
    formState: { errors: profileErrors },
  } = useForm({
    defaultValues: { name: user?.name || '' },
  });

  const {
    register: registerPw,
    handleSubmit: handlePwSubmit,
    reset: resetPw,
    watch: watchPw,
    formState: { errors: pwErrors },
  } = useForm({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  });

  useEffect(() => {
    if (user) {
      resetProfile({ name: user.name || '' });
    }
  }, [user, resetProfile]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image file size must not exceed 2MB');
      return;
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setRemoveAvatarFlag(false);
  };

  const onSaveProfile = async (values) => {
    setSavingProfile(true);
    try {
      const formData = new FormData();
      formData.append('name', values.name);
      if (selectedFile) {
        formData.append('avatar', selectedFile);
      } else if (removeAvatarFlag) {
        formData.append('removeAvatar', 'true');
      }

      const res = await updateProfile(formData);
      updateUserState(res.user);
      setSelectedFile(null);
      setPreviewUrl('');
      setRemoveAvatarFlag(false);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSavingProfile(false);
    }
  };

  const onChangePassword = async (values) => {
    setSavingPassword(true);
    try {
      await changePassword(values);
      toast.success('Password updated successfully');
      resetPw();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSavingPassword(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    toast.success('Signed out');
    navigate('/login');
  };

  const newPwValue = watchPw('newPassword');
  const displayUser = {
    ...user,
    avatar: removeAvatarFlag ? '' : previewUrl || user?.avatar,
  };

  return (
    <DashboardLayout
      title="Profile"
      breadcrumbs={[{ label: 'Dashboard', to: '/dashboard' }, { label: 'Profile' }]}
    >
      <div className="max-w-4xl space-y-6">
        {/* Account Overview */}
        <div className="bg-[#151C2C] border border-slate-800/90 rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar user={displayUser} size="xl" />
            <div>
              <h2 className="text-lg font-semibold text-white">{user?.name}</h2>
              <p className="text-sm text-slate-400 flex items-center gap-1.5 mt-0.5">
                <Mail className="h-3.5 w-3.5" />
                {user?.email}
              </p>
              <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                <Calendar className="h-3.5 w-3.5" />
                Member since {formatDate(user?.createdAt)}
              </p>
            </div>
          </div>

          <Button variant="danger" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>

        {/* Update Profile Form */}
        <div className="bg-[#151C2C] border border-slate-800/90 rounded-xl p-6">
          <h3 className="text-base font-semibold text-white mb-4">Personal Information</h3>
          <form onSubmit={handleProfileSubmit(onSaveProfile)} className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleFileChange}
                className="hidden"
              />
              <Button
                variant="secondary"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera className="h-4 w-4" />
                Upload Profile Image
              </Button>
              {(user?.avatar || previewUrl) && !removeAvatarFlag && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedFile(null);
                    setPreviewUrl('');
                    setRemoveAvatarFlag(true);
                  }}
                >
                  <Trash2 className="h-4 w-4 text-rose-400" />
                  Remove Image
                </Button>
              )}
              <span className="text-xs text-slate-500">JPG, PNG, WEBP or GIF up to 2MB</span>
            </div>

            <div>
              <label htmlFor="profile-name" className="block text-sm font-medium text-slate-200 mb-1.5">
                Full Name
              </label>
              <input
                id="profile-name"
                type="text"
                className="w-full max-w-md px-3.5 py-2.5 rounded-lg bg-[#0B0F19] border border-slate-700/80 text-sm text-white focus:outline-none focus:border-indigo-500"
                {...registerProfile('name', {
                  required: 'Full name is required',
                  minLength: { value: 2, message: 'At least 2 characters required' },
                  maxLength: { value: 80, message: 'Maximum 80 characters' },
                })}
              />
              {profileErrors.name && (
                <p className="text-xs text-rose-400 mt-1">{profileErrors.name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="profile-email" className="block text-sm font-medium text-slate-400 mb-1.5">
                Email Address
              </label>
              <input
                id="profile-email"
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full max-w-md px-3.5 py-2.5 rounded-lg bg-[#0B0F19]/60 border border-slate-800 text-sm text-slate-400 cursor-not-allowed"
              />
            </div>

            <Button type="submit" loading={savingProfile}>
              Save Profile
            </Button>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="bg-[#151C2C] border border-slate-800/90 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="h-5 w-5 text-indigo-400" />
            <h3 className="text-base font-semibold text-white">Change Password</h3>
          </div>

          <form onSubmit={handlePwSubmit(onChangePassword)} className="space-y-4 max-w-md">
            <div>
              <label htmlFor="pw-current" className="block text-sm font-medium text-slate-200 mb-1.5">
                Current Password
              </label>
              <input
                id="pw-current"
                type="password"
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#0B0F19] border border-slate-700/80 text-sm text-white focus:outline-none focus:border-indigo-500"
                {...registerPw('currentPassword', {
                  required: 'Current password is required',
                })}
              />
              {pwErrors.currentPassword && (
                <p className="text-xs text-rose-400 mt-1">{pwErrors.currentPassword.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="pw-new" className="block text-sm font-medium text-slate-200 mb-1.5">
                New Password
              </label>
              <input
                id="pw-new"
                type="password"
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#0B0F19] border border-slate-700/80 text-sm text-white focus:outline-none focus:border-indigo-500"
                {...registerPw('newPassword', {
                  required: 'New password is required',
                  pattern: {
                    value: PASSWORD_REGEX,
                    message: 'Must be 8+ chars with uppercase, lowercase, and a number',
                  },
                })}
              />
              {pwErrors.newPassword && (
                <p className="text-xs text-rose-400 mt-1">{pwErrors.newPassword.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="pw-confirm" className="block text-sm font-medium text-slate-200 mb-1.5">
                Confirm New Password
              </label>
              <input
                id="pw-confirm"
                type="password"
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#0B0F19] border border-slate-700/80 text-sm text-white focus:outline-none focus:border-indigo-500"
                {...registerPw('confirmNewPassword', {
                  required: 'Please confirm your new password',
                  validate: (val) => val === newPwValue || 'New passwords do not match',
                })}
              />
              {pwErrors.confirmNewPassword && (
                <p className="text-xs text-rose-400 mt-1">
                  {pwErrors.confirmNewPassword.message}
                </p>
              )}
            </div>

            <Button type="submit" loading={savingPassword}>
              Update Password
            </Button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
