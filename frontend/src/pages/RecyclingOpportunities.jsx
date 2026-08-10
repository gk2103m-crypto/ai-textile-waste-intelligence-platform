import React, { useState, useEffect } from 'react';
import { Recycle, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import axios from 'axios';

export default function RecyclingOpportunities() {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOpportunities = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:8000/api/inventory', {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        setOpportunities(response.data || []);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to fetch live data from backend.");
        setLoading(false);
      }
    };

    fetchOpportunities();
  }, []);

  if (loading) return <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-green-600" /></div>;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Recycle className="text-green-600" /> Recycling Opportunities
          </h1>
          <p className="text-sm text-gray-500 mt-1">Live data fetched from AI Analysis Backend</p>
        </div>
      </div>

      {error ? (
        <div className="bg-red-50 p-4 rounded-lg flex items-center gap-3 text-red-600">
          <AlertCircle className="w-5 h-5" />
          <p>{error}</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-200">
                <th className="p-4 font-semibold">Material</th>
                <th className="p-4 font-semibold">Condition</th>
                <th className="p-4 font-semibold">Circularity Score</th>
                <th className="p-4 font-semibold">Recommended Action</th>
              </tr>
            </thead>
            <tbody>
              {opportunities.length > 0 ? (
                opportunities.map((item) => (
                  <tr key={item.batch_id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-medium text-gray-800">{item.fabric_type || 'N/A'}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${item.condition === 'Good' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {item.condition || 'N/A'}
                      </span>
                    </td>
                    <td className="p-4 text-gray-600">{item.circularity_score ?? 0} / 100</td>
                    <td className="p-4 text-blue-600 font-medium flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" /> {item.strategy || 'Not yet analyzed'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-gray-500">
                    No recycling records found in the database. Scan an item first!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}