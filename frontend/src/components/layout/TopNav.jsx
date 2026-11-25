import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronRight, LogOut, Menu, Search, Settings, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import Avatar from '../common/Avatar';
import NotificationDropdown from '../notifications/NotificationDropdown';

export default function TopNav({
  title,
  breadcrumbs = [],
  onMenuClick,
  unreadCount,
  onUnreadCountChange,
}) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const q = searchTerm.trim();
    if (!q) return;
    const targetPath = location.pathname.startsWith('/projects') ? '/projects' : '/tasks';
    navigate(`${targetPath}?search=${encodeURIComponent(q)}`);
  };

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
    toast.success('Signed out');
    navigate('/login');
  };

  return (
    <header className="h-16 bg-[#131926]/95 backdrop-blur border-b border-slate-800/90 px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-30">
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="min-w-0">
          {breadcrumbs.length > 0 && (
            <nav className="hidden sm:flex items-center gap-1 text-xs text-slate-400 mb-0.5">
              {breadcrumbs.map((crumb, idx) => (
                <span key={crumb.label} className="flex items-center gap-1">
                  {idx > 0 && <ChevronRight className="h-3 w-3 text-slate-600" />}
                  {crumb.to ? (
                    <Link to={crumb.to} className="hover:text-slate-200 transition-colors">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-slate-300 truncate max-w-[180px]">{crumb.label}</span>
                  )}
                </span>
              ))}
            </nav>
          )}
          <h1 className="text-base sm:text-lg font-semibold text-white truncate">{title}</h1>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <form onSubmit={handleSearchSubmit} className="hidden md:block relative">
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search tasks or projects..."
            aria-label="Global search"
            className="w-56 lg:w-64 pl-9 pr-3 py-1.5 text-sm bg-[#0B0F19] border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </form>

        <NotificationDropdown
          unreadCount={unreadCount}
          onUnreadCountChange={onUnreadCountChange}
        />

        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen((o) => !o)}
            className="flex items-center gap-2 p-1 rounded-full hover:bg-[#1E273B] transition-colors"
            aria-label="User menu"
          >
            <Avatar user={user} size="sm" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-[#151C2C] border border-slate-800 rounded-xl shadow-2xl z-50 overflow-hidden fade-in">
              <div className="px-4 py-3 border-b border-slate-800">
                <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                <p className="text-xs text-slate-400 truncate">{user?.email}</p>
              </div>
              <div className="p-1.5 space-y-0.5">
                <Link
                  to="/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-[#1E273B]"
                >
                  <User className="h-4 w-4" />
                  Profile
                </Link>
                <Link
                  to="/settings"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-[#1E273B]"
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-rose-300 hover:bg-rose-500/10"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
