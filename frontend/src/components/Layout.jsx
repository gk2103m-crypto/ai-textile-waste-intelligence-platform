import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Leaf, LogOut, Sun, Moon } from 'lucide-react';
import { MENU_CONFIG } from '../config/menuConfig';
import ToastNotification from './ToastNotification';
import { useTheme } from '../context/ThemeContext';

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const menu = MENU_CONFIG[user.role] || [];
  const { isDark, toggleTheme } = useTheme();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-200">
      {/* Module 11: Global Toast Notification Stack */}
      <ToastNotification />

      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-700/50 flex flex-col transition-colors duration-200">
        <div className="h-16 flex items-center gap-2 px-6 border-b border-gray-100 dark:border-slate-700/50">
          <Leaf className="w-6 h-6 text-green-600 dark:text-emerald-400" />
          <span className="font-bold text-lg text-gray-900 dark:text-slate-100">
            TextileWaste<span className="text-green-600 dark:text-emerald-400">.AI</span>
          </span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {menu.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-green-50 dark:bg-emerald-900/30 text-green-700 dark:text-emerald-400'
                    : 'text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700/50 flex items-center justify-between px-6 transition-colors duration-200">
          <span className="text-sm text-gray-500 dark:text-slate-400">Facility Overview</span>
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <span className="text-sm font-medium text-gray-700 dark:text-slate-200">{user.name}</span>
            <span className="text-xs bg-green-100 dark:bg-emerald-900/40 text-green-700 dark:text-emerald-400 px-2 py-1 rounded-full">
              {user.role}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 text-sm text-gray-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}