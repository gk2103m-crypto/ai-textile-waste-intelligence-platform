import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

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
      const response = await axios.post('http://localhost:8000/api/auth/login', {
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
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-white text-center mb-2">
          AI Textile Intelligence
        </h2>
        <p className="text-slate-400 text-sm text-center mb-6">
          Enterprise Waste Management & ESG Platform
        </p>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-400 text-sm p-3 rounded-lg mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              placeholder="admin@test.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 rounded-lg transition-colors duration-200"
          >
            {loading ? 'Logging in...' : 'Sign In'}
          </button>
        </form>

        {/* Quick Demo Credentials Card */}
        <div className="mt-8 p-4 bg-slate-800/60 border border-slate-700/80 rounded-xl text-xs text-slate-300">
          <div className="flex items-center justify-between mb-3">
            <span className="font-bold text-emerald-400">⚡ Quick Test Credentials (Demo):</span>
            <span className="text-[10px] text-slate-400">Click to autofill</span>
          </div>
          <div className="grid grid-cols-1 gap-2 font-mono">
            <div
              onClick={() => fillCredentials('test@eco.com', 'test123')}
              className="p-2 bg-slate-800 rounded border border-slate-700 hover:border-emerald-500/50 cursor-pointer transition flex justify-between items-center"
            >
              <div>
                <span className="text-slate-400 block text-[10px]">ADMIN SUPER-CONSOLE</span>
                <span className="text-white">test@eco.com</span>
              </div>
              <span className="text-emerald-400 font-bold">test123</span>
            </div>

            <div
              onClick={() => fillCredentials('krish123@gmail.com', 'YOUR_PASSWORD')}
              className="p-2 bg-slate-800 rounded border border-slate-700 hover:border-emerald-500/50 cursor-pointer transition flex justify-between items-center"
            >
              <div>
                <span className="text-slate-400 block text-[10px]">MANUFACTURER</span>
                <span className="text-white">krish123@gmail.com</span>
              </div>
            </div>

            <div
              onClick={() => fillCredentials('facility@eco.com', 'facility123')}
              className="p-2 bg-slate-800 rounded border border-slate-700 hover:border-emerald-500/50 cursor-pointer transition flex justify-between items-center"
            >
              <div>
                <span className="text-slate-400 block text-[10px]">RECYCLING FACILITY OPERATOR</span>
                <span className="text-white">facility@eco.com</span>
              </div>
              <span className="text-emerald-400 font-bold">facility123</span>
            </div>

            <div
              onClick={() => fillCredentials('sustainability@eco.com', 'sustain123')}
              className="p-2 bg-slate-800 rounded border border-slate-700 hover:border-emerald-500/50 cursor-pointer transition flex justify-between items-center"
            >
              <div>
                <span className="text-slate-400 block text-[10px]">SUSTAINABILITY MANAGER</span>
                <span className="text-white">sustainability@eco.com</span>
              </div>
              <span className="text-emerald-400 font-bold">sustain123</span>
            </div>
          </div>
        </div>

        {/* Registration Link */}
        <div className="mt-6 text-center text-sm text-slate-400">
          Don't have an account?{' '}
          <Link to="/register" className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
            Sign Up here
          </Link>
        </div>
      </div>
    </div>
  );
}