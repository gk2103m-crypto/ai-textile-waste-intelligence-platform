import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Factory, ShieldAlert, Loader2 } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://ai-textile-waste-intelligence-platform-mccj.onrender.com';

export default function ManufacturerManagement() {
  const [manufacturers, setManufacturers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { addToast } = useToast();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userRole = user?.role?.toLowerCase()?.trim() || "";

    if (userRole !== 'admin' && userRole !== 'administrator') {
      addToast({
        type: 'warning',
        title: 'Access Denied',
        message: 'Manufacturer Management is restricted to Administrators only.',
        duration: 5000,
      });
      navigate('/dashboard');
      return;
    }

    const token = localStorage.getItem('token');
    axios
      .get(`${API_BASE_URL}/api/auth/users`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : [];
        // Flexible case-insensitive filter for MANUFACTURER or Textile Manufacturer
        const filtered = data.filter(u => u && u.role && u.role.toLowerCase().includes('manufacturer'));
        setManufacturers(filtered);
      })
      .catch(err => {
        console.error('Error fetching manufacturers:', err);
        setManufacturers([]);
        addToast({
          type: 'error',
          title: 'Fetch Failed',
          message: 'Could not load manufacturer accounts.',
          duration: 5000,
        });
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 gap-3 text-slate-400">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
        Loading manufacturers...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Factory className="w-7 h-7 text-emerald-500" /> Manufacturer Management
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
          Administrator access only — {Array.isArray(manufacturers) ? manufacturers.length : 0} registered manufacturer{(Array.isArray(manufacturers) ? manufacturers.length : 0) !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gradient-to-r from-slate-50/80 to-slate-100/60 dark:from-slate-900/80 dark:to-slate-800/60 text-slate-500 dark:text-slate-400 border-b border-white/30 dark:border-slate-800/50 text-xs font-semibold uppercase tracking-wider">
              <th className="p-4">ID</th>
              <th className="p-4">Manufacturer Name</th>
              <th className="p-4">Email</th>
              <th className="p-4">Role</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/20 dark:divide-slate-800/60 text-slate-900 dark:text-slate-200">
            {!Array.isArray(manufacturers) || manufacturers.length === 0 ? (
              <tr>
                <td colSpan="4" className="p-8 text-center text-slate-500 dark:text-slate-400 text-sm">
                  No manufacturers registered.
                </td>
              </tr>
            ) : (
              manufacturers.map(u => (
                <tr
                  key={u.id}
                  className="hover:bg-emerald-50/40 dark:hover:bg-emerald-900/10 transition-colors duration-150"
                >
                  <td className="p-4 text-slate-500 dark:text-slate-400 font-mono text-sm">#{u.id}</td>
                  <td className="p-4 font-semibold text-slate-900 dark:text-slate-100">{u.username}</td>
                  <td className="p-4 text-slate-600 dark:text-slate-400">{u.email}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 rounded-full text-xs font-semibold">
                      {u.role}
                    </span>
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