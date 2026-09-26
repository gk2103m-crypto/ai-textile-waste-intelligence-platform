import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Leaf, LogIn, Zap } from 'lucide-react';

// Define API base URL directly to avoid any missing file or path import errors
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://ai-textile-waste-intelligence-platform-mccj.onrender.com';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email: email,
        password: password,
      });

      // Backend returns { access_token, token_type, user: { name, role } }
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      navigate('/dashboard');
    } catch (err) {
      setError('Invalid Email or Password! Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (testEmail, testPassword) => {
    setEmail(testEmail);
    setPassword(testPassword);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient glow orbs */}
      <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

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
            <p className="text-slate-400 text-sm mt-0.5">Enterprise Waste Management & ESG Platform</p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800/70 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.3)] p-8">
          <h2 className="text-xl font-extrabold text-white tracking-tight mb-1">Sign In</h2>
          <p className="text-slate-500 text-sm mb-6">Access your sustainability dashboard</p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/40 text-red-400 text-sm p-3 rounded-xl mb-5 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                placeholder="admin@test.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-800/60 border border-slate-700/60 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-200"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-90 active:scale-95 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl transition-all duration-200 shadow shadow-emerald-500/25 mt-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in…
                </span>
              ) : (
                <>
                  <LogIn className="w-4 h-4" /> Sign In
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Card - Only visible in development mode */}
          {import.meta.env.DEV && (
            <div className="mt-6 p-4 bg-slate-800/50 border border-slate-700/50 rounded-xl text-xs text-slate-300">
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <Zap className="w-3 h-3" /> Quick Test Credentials (Demo):
                </span>
                <span className="text-[10px] text-slate-500">Click to autofill</span>
              </div>
              <div className="grid grid-cols-1 gap-2 font-mono">
                {[
                  { label: 'ADMIN SUPER-CONSOLE', email: 'test@eco.com', pass: 'test123' },
                  { label: 'MANUFACTURER', email: 'krish123@gmail.com', pass: 'test123' },
                  { label: 'RECYCLING FACILITY OPERATOR', email: 'facility@eco.com', pass: 'facility123' },
                  { label: 'SUSTAINABILITY MANAGER', email: 'sustainability@eco.com', pass: 'sustain123' },
                ].map(({ label, email: e, pass }) => (
                  <div
                    key={e}
                    onClick={() => fillCredentials(e, pass)}
                    className="p-2 bg-slate-900/60 rounded-lg border border-slate-700/60 hover:border-emerald-500/40 hover:bg-slate-900 cursor-pointer transition-all duration-150 flex justify-between items-center"
                  >
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase tracking-wider">{label}</span>
                      <span className="text-slate-200">{e}</span>
                    </div>
                    <span className="text-emerald-400 font-bold shrink-0 ml-2">{pass}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Registration Link */}
          <div className="mt-5 text-center text-sm text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
              Sign Up here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}