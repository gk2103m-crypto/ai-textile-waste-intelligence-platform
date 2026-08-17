import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Factory, ShieldAlert } from 'lucide-react';
import { useToast } from '../context/ToastContext';

/**
 * ManufacturerManagement — Admin-only page
 * Filters the user list to display only Textile Manufacturer accounts.
 * Authenticated requests sent with JWT token (GAP-11 FIX pattern applied).
 */
export default function ManufacturerManagement() {
  const [manufacturers, setManufacturers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { addToast } = useToast();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.role !== 'Administrator') {
      addToast({
        type: 'warning',
        title: '🔒 Access Denied',
        message: 'Manufacturer Management is restricted to Administrators only.',
        duration: 5000,
      });
      navigate('/dashboard');
      return;
    }

    const token = localStorage.getItem('token');
    axios
      .get('http://localhost:8000/api/auth/users', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      .then(res => {
        setManufacturers(res.data.filter(u => u.role === 'Textile Manufacturer'));
      })
      .catch(err => {
        console.error('Error fetching manufacturers:', err);
        addToast({
          type: 'error',
          title: '❌ Fetch Failed',
          message: 'Could not load manufacturer accounts.',
          duration: 5000,
        });
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 gap-3 text-gray-500">
        <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
        Loading manufacturers…
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Factory className="w-6 h-6 text-blue-600" /> Manufacturer Management
        </h2>
        <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
          Administrator access only — {manufacturers.length} registered manufacturer{manufacturers.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-100">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-800 text-white">
              <th className="p-4">ID</th>
              <th className="p-4">Manufacturer Name</th>
              <th className="p-4">Email</th>
              <th className="p-4">Role</th>
            </tr>
          </thead>
          <tbody>
            {manufacturers.length === 0 ? (
              <tr>
                <td colSpan="4" className="p-4 text-center text-gray-500">No manufacturers registered.</td>
              </tr>
            ) : (
              manufacturers.map(u => (
                <tr key={u.id} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="p-4 text-gray-400 font-mono text-sm">#{u.id}</td>
                  <td className="p-4 font-semibold text-gray-800">{u.username}</td>
                  <td className="p-4 text-gray-600">{u.email}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold border border-blue-200">
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