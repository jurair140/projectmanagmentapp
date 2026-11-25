import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckSquare,
  FolderKanban,
  Layers,
  LayoutDashboard,
  LogOut,
  Settings,
  Users,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import Avatar from '../common/Avatar';

export default function Sidebar({ isOpen, onClose, unreadCount = 0 }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/projects', label: 'My Projects', icon: FolderKanban },
    { to: '/tasks', label: 'My Tasks', icon: CheckSquare },
    { to: '/team', label: 'Team', icon: Users },
    { to: '/notifications', label: 'Notifications', icon: Bell, badge: unreadCount },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  const handleLogout = async () => {
    await logout();
    toast.success('Signed out');
    navigate('/login');
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#131926] border-r border-slate-800/90 w-64">
      <div className="flex items-center justify-between px-5 h-16 border-b border-slate-800/80">
        <Link to="/dashboard" onClick={onClose} className="flex items-center gap-2.5 min-w-0">
          <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-sm shadow-indigo-950/60 shrink-0">
            <Layers className="h-4.5 w-4.5 text-white" />
          </div>
          <span className="text-sm font-bold tracking-tight text-white leading-tight">
            Jurair Project Management
          </span>
        </Link>
        <button
          type="button"
          onClick={onClose}
          className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          aria-label="Close navigation"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-600/15 text-indigo-300 border border-indigo-500/25'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-[#1A2234] border border-transparent'
                }`
              }
            >
              <span className="flex items-center gap-3">
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </span>
              {item.badge > 0 && (
                <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-indigo-600 text-white">
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-3 border-t border-slate-800/80 space-y-2">
        <Link
          to="/profile"
          onClick={onClose}
          className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-[#1A2234] transition-colors"
        >
          <Avatar user={user} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
            <p className="text-xs text-slate-400 truncate">{user?.email}</p>
          </div>
        </Link>

        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:block shrink-0">{sidebarContent}</aside>

      {isOpen && (
        <div className="fixed inset-0 z-40 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={onClose}
            aria-hidden="true"
          />
          <div className="relative z-50 h-full">{sidebarContent}</div>
        </div>
      )}
    </>
  );
}
