import { useNavigate } from 'react-router-dom';
import { Leaf, LogOut, Plus, Package } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-dark text-white px-6 py-4 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-2">
          <Leaf className="text-primary w-6 h-6" />
          <h1 className="font-bold text-lg">AI Textile Intelligence</h1>
        </div>
        <button onClick={() => navigate('/login')} className="flex items-center gap-2 text-sm text-gray-300 hover:text-white">
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Waste Inventory</h2>
          </div>
          <button className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2">
            <Plus className="w-5 h-5" /> Register Batch
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden p-4">
           <p className="text-gray-600 font-medium flex gap-2 items-center"><Package className="w-5 h-5" /> Recent Scans will appear here.</p>
        </div>
      </main>
    </div>
  );
}