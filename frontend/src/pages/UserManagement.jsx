import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { Trash2, Users, ShieldAlert, RefreshCw, Loader2 } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://ai-textile-backend.onrender.com';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const navigate = useNavigate();
  const { addToast } = useToast();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userRole = user?.role?.toLowerCase()?.trim() || "";

    // Restrict access to admin or administrator roles only
    if (userRole !== 'admin' && userRole !== 'administrator') {
      addToast({
        type: 'warning',
        title: 'Access Denied',
        message: 'User Management is restricted to Administrators only.',
        duration: 5000,
      });
      navigate('/dashboard');
      return;
    }
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    axios
      .get(`${API_BASE_URL}/api/auth/users`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      .then(res => {
        // Safely check if response data is an array
        const data = Array.isArray(res.data) ? res.data : [];
        setUsers(data);
      })
      .catch(err => {
        console.error('Error fetching users:', err);
        setUsers([]); // Reset to empty array on failure to prevent UI crash
        addToast({
          type: 'error',
          title: 'Fetch Failed',
          message: 'Could not load users. Ensure you are logged in as Administrator.',
          duration: 5000,
        });
      })
      .finally(() => setLoading(false));
  };

  const handleDelete = async (userId, username) => {
    if (!window.confirm(`Are you sure you want to delete user "${username}"? This cannot be undone.`)) return;
    setDeletingId(userId);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/api/auth/users/${userId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      addToast({
        type: 'warning',
        title: 'User Deleted',
        message: `User "${username}" (#${userId}) has been removed from the platform.`,
        duration: 5000,
      });
      fetchUsers();
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Delete Failed',
        message: err.response?.data?.detail || 'Could not delete user.',
        duration: 5000,
      });
    } finally {
      setDeletingId(null);
    }
  };

  const ROLE_COLORS = {
    'Admin': 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20',
    'Administrator': 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20',
    'Textile Manufacturer': 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20',
    'Recycling Facility Operator': 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
    'Sustainability Manager': 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 gap-3 text-slate-400">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
        Loading users...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Users className="w-7 h-7 text-emerald-500" /> User Management
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
            Administrator access only — {Array.isArray(users) ? users.length : 0} registered user{(Array.isArray(users) ? users.length : 0) !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={fetchUsers}
          className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-500/30 transition-all duration-200"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gradient-to-r from-slate-50/80 to-slate-100/60 dark:from-slate-900/80 dark:to-slate-800/60 text-slate-500 dark:text-slate-400 border-b border-white/30 dark:border-slate-800/50 text-xs font-semibold uppercase tracking-wider">
              <th className="p-4">ID</th>
              <th className="p-4">Name</th>
              <th className="p-4">Email</th>
              <th className="p-4">Role</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/20 dark:divide-slate-800/60 text-slate-900 dark:text-slate-200">
            {!Array.isArray(users) || users.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-8 text-center text-slate-500 dark:text-slate-400 text-sm">No users found.</td>
              </tr>
            ) : (
              users.map(u => (
                <tr
                  key={u.id}
                  className="hover:bg-emerald-50/40 dark:hover:bg-emerald-900/10 transition-colors duration-150"
                >
                  <td className="p-4 text-slate-500 dark:text-slate-400 font-mono text-sm">#{u.id}</td>
                  <td className="p-4 font-semibold text-slate-900 dark:text-slate-100">{u.username}</td>
                  <td className="p-4 text-slate-600 dark:text-slate-400">{u.email}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${ROLE_COLORS[u.role] || 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    {(u.role !== 'Administrator' && u.role !== 'Admin') && (
                      <button
                        onClick={() => handleDelete(u.id, u.username)}
                        disabled={deletingId === u.id}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-900/20 px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-900/50 transition-all duration-200 active:scale-95 disabled:opacity-40"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        {deletingId === u.id ? 'Deleting...' : 'Delete'}
                      </button>
                    )}
                    {(u.role === 'Administrator' || u.role === 'Admin') && (
                      <span className="text-xs text-slate-400 dark:text-slate-600 italic">Protected</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}