import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { Trash2, Users, ShieldAlert } from 'lucide-react';

// GAP-11 FIX: Added role-based access guard (Admin-only), delete functionality, and proper auth headers

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const navigate = useNavigate();
  const { addToast } = useToast();

  // GAP-11 FIX: Role guard — redirect non-admins away
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.role !== 'Administrator') {
      addToast({
        type: 'warning',
        title: '🔒 Access Denied',
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
      .get('http://localhost:8000/api/auth/users', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      .then(res => setUsers(res.data))
      .catch(err => {
        console.error('Error fetching users:', err);
        addToast({
          type: 'error',
          title: '❌ Fetch Failed',
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
      await axios.delete(`http://localhost:8000/api/auth/users/${userId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      addToast({
        type: 'warning',
        title: '🗑️ User Deleted',
        message: `User "${username}" (#${userId}) has been removed from the platform.`,
        duration: 5000,
      });
      fetchUsers();
    } catch (err) {
      addToast({
        type: 'error',
        title: '❌ Delete Failed',
        message: err.response?.data?.detail || 'Could not delete user.',
        duration: 5000,
      });
    } finally {
      setDeletingId(null);
    }
  };

  const ROLE_COLORS = {
    'Administrator':              'bg-red-100 text-red-700 border-red-200 dark:bg-rose-900/40 dark:text-rose-400 dark:border-rose-800',
    'Textile Manufacturer':       'bg-blue-100 text-blue-700 border-blue-200 dark:bg-sky-900/40 dark:text-sky-400 dark:border-sky-800',
    'Recycling Facility Operator':'bg-green-100 text-green-700 border-green-200 dark:bg-emerald-900/40 dark:text-emerald-400 dark:border-emerald-800',
    'Sustainability Manager':     'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/40 dark:text-purple-400 dark:border-purple-800',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 gap-3 text-gray-500 dark:text-slate-400">
        <div className="w-6 h-6 border-2 border-gray-300 dark:border-slate-600 border-t-blue-600 rounded-full animate-spin" />
        Loading users…
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-slate-100 flex items-center gap-2">
          <Users className="w-6 h-6 text-blue-600" /> User Management
        </h2>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
          <ShieldAlert className="w-3.5 h-3.5 inline mr-1 text-amber-500" />
          Administrator access only — {users.length} registered user{users.length !== 1 ? 's' : ''}
        </p>
      </div>
      <button
        onClick={fetchUsers}
        className="text-sm text-gray-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
      >
        Refresh
      </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-lg shadow overflow-hidden border border-gray-100 dark:border-slate-700/50">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-800 dark:bg-slate-800 text-white">
              <th className="p-4">ID</th>
              <th className="p-4">Name</th>
              <th className="p-4">Email</th>
              <th className="p-4">Role</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-4 text-center text-gray-500 dark:text-slate-400">No users found.</td>
              </tr>
            ) : (
              users.map(u => (
                <tr key={u.id} className="border-b border-gray-100 dark:border-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-4 text-gray-400 dark:text-slate-500 font-mono text-sm">#{u.id}</td>
                  <td className="p-4 font-semibold text-gray-800 dark:text-slate-100">{u.username}</td>
                  <td className="p-4 text-gray-600 dark:text-slate-400">{u.email}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${ROLE_COLORS[u.role] || 'bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-slate-300'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    {u.role !== 'Administrator' && (
                      <button
                        onClick={() => handleDelete(u.id, u.username)}
                        disabled={deletingId === u.id}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-900 transition-all disabled:opacity-40"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        {deletingId === u.id ? 'Deleting…' : 'Delete'}
                      </button>
                    )}
                    {u.role === 'Administrator' && (
                      <span className="text-xs text-gray-400 dark:text-slate-500 italic">Protected</span>
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