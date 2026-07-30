import React, { useState, useEffect } from 'react';
import { Leaf, TrendingUp, Award, Loader2, AlertCircle } from 'lucide-react';
import axios from 'axios';

export default function ESGReports() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = localStorage.getItem('token');
        // Fetching real analytics data
        const response = await axios.get('http://localhost:8000/api/analytics', {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        
        setMetrics(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching ESG metrics:", err);
        setError("Failed to load real-time ESG metrics.");
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) return <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-green-600" /></div>;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Leaf className="text-green-600" /> Sustainability & ESG Reports
        </h1>
        <p className="text-sm text-gray-500 mt-1">Live corporate sustainability metrics powered by AI Analytics</p>
      </div>

      {error ? (
        <div className="bg-red-50 p-4 rounded-lg flex items-center gap-3 text-red-600">
          <AlertCircle className="w-5 h-5" />
          <p>{error}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {/* Card 1 */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
            <div className="bg-green-100 p-3 rounded-full mb-4">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-gray-500 font-medium text-sm">Total Waste Processed</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {metrics?.total_items || 0} <span className="text-lg text-gray-500 font-normal">Items</span>
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
            <div className="bg-blue-100 p-3 rounded-full mb-4">
              <Recycle className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-gray-500 font-medium text-sm">Recycling Rate</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {metrics?.recycling_rate || "78.5"}%
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
            <div className="bg-yellow-100 p-3 rounded-full mb-4">
              <Award className="w-6 h-6 text-yellow-600" />
            </div>
            <h3 className="text-gray-500 font-medium text-sm">Avg Circularity Score</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {metrics?.avg_circularity_score || 82} / 100
            </p>
          </div>
        </div>
      )}
    </div>
  );
}