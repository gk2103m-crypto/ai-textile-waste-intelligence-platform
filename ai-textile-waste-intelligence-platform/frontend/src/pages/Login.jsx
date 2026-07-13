import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf, Mail, Lock, Shield } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [role, setRole] = useState('Textile Manufacturer');

  const handleLogin = (e) => {
    e.preventDefault();
    navigate('/dashboard'); 
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-green-100 p-3 rounded-full mb-2">
            <Leaf className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Textile Waste AI</h2>
          <p className="text-sm text-gray-500 mt-1">Sign in to your account</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input type="email" required className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg outline-none" placeholder="admin@eco-textile.com" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input type="password" required className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg outline-none" placeholder="••••••••" />
            </div>
          </div>

          <button type="submit" className="w-full bg-primary text-white font-semibold py-2.5 rounded-lg mt-6">
            Secure Login
          </button>
        </form>
      </div>
    </div>
  );
}