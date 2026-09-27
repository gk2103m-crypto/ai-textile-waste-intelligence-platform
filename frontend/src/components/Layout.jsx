import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Leaf, LogOut, Sun, Moon } from 'lucide-react';
import { MENU_CONFIG } from '../config/menuConfig';
import ToastNotification from './ToastNotification';
import { useTheme } from '../context/ThemeContext';

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // Normalize role string (removes underscores and extra spaces for matching)
  const normalizeRole = (roleStr) =>
    (roleStr || '').toLowerCase().replace(/_/g, ' ').replace(/\s+/g, ' ').trim();

  const userRole = normalizeRole(user?.role);

  // Match key in MENU_CONFIG seamlessly
  const matchedRoleKey = Object.keys(MENU_CONFIG).find(
    (key) => normalizeRole(key) === userRole
  );

  const menu = matchedRoleKey ? MENU_CONFIG[matchedRoleKey] : [];

  const { isDark, toggleTheme } = useTheme();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      {/* Module 11: Global Toast Notification Stack */}
      <ToastNotification />

      {/* ── Sidebar ── */}
      <aside className="glass-sidebar w-64 flex flex-col transition-colors duration-200 z-20">
        {/* Logo */}
        <div className="h-16 flex items-center gap-2.5 px-6 border-b border-white/30 dark:border-slate-800/60">
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-sm shadow-emerald-500/30">
            <Leaf className="w-4 h-4 text-white" />
          </div>
          <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">
            Textile<span className="text-transparent bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text">.AI</span>
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {menu.length === 0 && (
            <div className="px-3 py-4 text-sm text-slate-500 text-center">
              Loading Menus...
            </div>
          )}
          {menu.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${active
                  ? 'bg-gradient-to-r from-emerald-500/10 to-teal-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer hint */}
        <div className="px-4 py-3 border-t border-white/30 dark:border-slate-800/60">
          <p className="text-[10px] text-slate-400 dark:text-slate-600 font-medium tracking-wide text-center">
            AI Textile Waste Platform © 2026
          </p>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="glass-header h-16 flex items-center justify-between px-6 transition-colors duration-200 z-10">
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Facility Overview</span>
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 transition-all duration-200"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Divider */}
            <div className="w-px h-5 bg-slate-200 dark:bg-slate-700" />

            {/* User name */}
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{user.name || user.username || 'User'}</span>

            {/* Role badge */}
            <span className="text-xs bg-gradient-to-r from-emerald-500/10 to-teal-500/10 text-emerald-700 dark:text-emerald-400 px-2.5 py-1 rounded-full font-semibold border border-emerald-500/20 capitalize">
              {matchedRoleKey || user.role || 'Guest'}
            </span>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 px-2 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}