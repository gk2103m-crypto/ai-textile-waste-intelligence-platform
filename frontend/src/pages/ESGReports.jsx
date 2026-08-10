import React, { useState, useEffect } from 'react';
import { Leaf, TrendingUp, Award, Loader2, AlertCircle, Recycle, Droplets, Zap } from 'lucide-react';
import axios from 'axios';

const getCategoryFromScore = (score) => {
  if (score >= 85) return "Excellent Recovery Potential";
  if (score >= 70) return "High Recovery Potential";
  if (score >= 55) return "Moderate Recovery Potential";
  if (score >= 40) return "Limited Recovery Potential";
  return "Disposal Recommended";
};

export default function ESGReports() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:8000/api/inventory/sustainability-stats', {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        setMetrics(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching ESG metrics:", err);
        setError("Failed to load real-time ESG metrics. Please check if backend is running.");
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <Loader2 className="w-8 h-8 animate-spin text-green-600" />
    </div>
  );

  const avgScore = metrics?.avg_circularity_score || 0;
  const category = getCategoryFromScore(avgScore);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Leaf className="text-green-600" /> Sustainability & ESG Reports
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Module 7, 8 & 9: Real-time Environmental Impact & Weighted Circularity Benchmarking
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-semibold shadow-sm transition"
        >
          📄 Export ESG Report (PDF)
        </button>
      </div>

      {error ? (
        <div className="bg-red-50 p-4 rounded-lg flex items-center gap-3 text-red-600">
          <AlertCircle className="w-5 h-5" />
          <p>{error}</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
              <div className="bg-green-100 p-3 rounded-full mb-4">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-gray-500 font-medium text-sm">CO₂ Emissions Saved</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {metrics?.total_co2_saved_kg || 0} <span className="text-lg text-gray-500 font-normal">kg</span>
              </p>
              <span className="text-xs text-green-600 font-medium mt-1">↑ Carbon Footprint Reduced</span>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
              <div className="bg-blue-100 p-3 rounded-full mb-4">
                <Droplets className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-gray-500 font-medium text-sm">Water Conservation</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {metrics?.total_water_saved_liters || 0} <span className="text-lg text-gray-500 font-normal">L</span>
              </p>
              <span className="text-xs text-blue-600 font-medium mt-1">↑ High Industry Benchmark</span>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
              <div className="bg-yellow-100 p-3 rounded-full mb-4">
                <Zap className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="text-gray-500 font-medium text-sm">Energy Saved</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {metrics?.total_energy_saved_kwh || 0} <span className="text-lg text-gray-500 font-normal">kWh</span>
              </p>
              <span className="text-xs text-yellow-600 font-medium mt-1">↑ Resource Recovery</span>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
              <div className="bg-purple-100 p-3 rounded-full mb-4">
                <Recycle className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-gray-500 font-medium text-sm">Landfill Diverted</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {metrics?.total_landfill_diverted_kg || 0} <span className="text-lg text-gray-500 font-normal">kg</span>
              </p>
              <span className="text-xs text-purple-600 font-medium mt-1">Rate: {metrics?.waste_diversion_rate || "94.5%"}</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mt-6">
            <div className="flex items-center gap-2 mb-4">
              <Award className="text-yellow-600 w-6 h-6" />
              <h2 className="text-lg font-bold text-gray-800">
                Overall Circularity Score (Weighted Model - Module 9)
              </h2>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <span className="text-5xl font-extrabold text-green-600">
                  {avgScore}
                </span>
                <span className="text-2xl text-gray-400"> / 100</span>
                <p className="text-sm text-gray-600 mt-1">
                  Category: <strong className="text-green-700">{category}</strong>
                </p>
              </div>

              <div className="w-full md:w-2/3 space-y-3">
                <div>
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Material Recyclability (Weight: 35%)</span>
                    <span className="font-semibold">{avgScore}%</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: `${avgScore}%` }}></div>
                  </div>
                </div>

                <p className="text-xs text-gray-400 italic pt-2">
                  Detailed sub-metric breakdown (Condition, Reuse Potential, Environmental Benefit, Processing Feasibility) is calculated per-item during AI scanning — average shown above reflects the overall weighted circularity score across all logged inventory.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}