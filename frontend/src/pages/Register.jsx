import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Leaf, UserPlus } from 'lucide-react';
import { useToast } from '../context/ToastContext'; // Use toast for success
import { API_BASE_URL } from '../config/api';

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
      await axios.post(`${API_BASE_URL}/api/auth/register`, form);

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
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient glow orbs */}
      <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo / Brand */}
        <div className="flex flex-col items-center mb-8 gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <Leaf className="w-6 h-6 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-extrabold tracking-tight text-white">
              Textile<span className="text-transparent bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text">.AI</span>
            </h1>
            <p className="text-slate-400 text-sm mt-0.5">Join the Enterprise Waste Management Platform</p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800/70 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.3)] p-8">
          <h2 className="text-xl font-extrabold text-white tracking-tight mb-1">Create Account</h2>
          <p className="text-slate-500 text-sm mb-6">Fill in your details to get started</p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/40 text-red-400 text-sm p-3 rounded-xl mb-5 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required
                placeholder="Jane Doe"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-800/60 border border-slate-700/60 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-slate-300 text-sm font-medium mb-1.5">
                Work Email Address
              </label>
              <input
                type="email"
                required
                placeholder="jane.doe@company.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-800/60 border border-slate-700/60 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-slate-300 text-sm font-medium mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-800/60 border border-slate-700/60 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-slate-300 text-sm font-medium mb-1.5">
                Role
              </label>
              <div className="relative">
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-800/60 border border-slate-700/60 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 appearance-none cursor-pointer transition-all duration-200"
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
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-90 active:scale-95 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl transition-all duration-200 shadow shadow-emerald-500/25 mt-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating Account…
                </span>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" /> Sign Up
                </>
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
              Log In here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}