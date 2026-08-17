import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useToast } from '../context/ToastContext'; // Use toast for success

export default function Register() {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    role: 'Textile Manufacturer',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await axios.post('http://localhost:8000/api/auth/register', form);

      // Show success toast
      addToast({
        type: 'success',
        title: 'Registration Successful',
        message: 'Your account has been created successfully. Please log in.',
        duration: 5000,
      });

      // Redirect to login
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed! Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-white text-center mb-2">
          Create Account
        </h2>
        <p className="text-slate-400 text-sm text-center mb-6">
          Join the Enterprise Waste Management Platform
        </p>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-400 text-sm p-3 rounded-lg mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              placeholder="Jane Doe"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 text-sm font-medium mb-1">
              Work Email Address
            </label>
            <input
              type="email"
              required
              placeholder="jane.doe@company.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 text-sm font-medium mb-1">
              Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 text-sm font-medium mb-1">
              Role
            </label>
            <div className="relative">
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500 appearance-none cursor-pointer"
              >
                <option value="Administrator">Administrator</option>
                <option value="Recycling Facility Operator">Recycling Facility Operator</option>
                <option value="Sustainability Manager">Sustainability Manager</option>
                <option value="Textile Manufacturer">Textile Manufacturer</option>
              </select>
              {/* Custom arrow for select since appearance-none hides default */}
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 rounded-lg transition-colors duration-200 mt-2"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        {/* Login Link */}
        <div className="mt-6 text-center text-sm text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
            Log In here
          </Link>
        </div>
      </div>
    </div>
  );
}