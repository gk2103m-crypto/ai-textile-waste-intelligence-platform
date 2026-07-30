import React, { useState, useEffect } from 'react';
import { Plus, Package, Recycle, AlertTriangle, BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

// Register Chart.js components for rendering
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

export default function Dashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch live analytics data from FastAPI backend
    const fetchAnalytics = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/analytics');
        if (response.ok) {
          const data = await response.json();
          setAnalytics(data);
        } else {
          console.error("Failed to fetch analytics data");
        }
      } catch (error) {
        console.error("Network error while fetching analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  // Configuration for the Material Distribution Pie Chart
  const materialData = {
    labels: analytics ? Object.keys(analytics.material_distribution) : [],
    datasets: [
      {
        label: 'Scanned Materials',
        data: analytics ? Object.values(analytics.material_distribution) : [],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)', // Blue
          'rgba(16, 185, 129, 0.8)', // Green
          'rgba(245, 158, 11, 0.8)', // Yellow
          'rgba(139, 92, 246, 0.8)', // Purple
          'rgba(239, 68, 68, 0.8)'   // Red
        ],
        borderWidth: 1,
      },
    ],
  };

  // Configuration for the Condition Distribution Bar Chart
  const conditionData = {
    labels: analytics ? Object.keys(analytics.condition_distribution) : [],
    datasets: [
      {
        label: 'Waste Condition Count',
        data: analytics ? Object.values(analytics.condition_distribution) : [],
        backgroundColor: 'rgba(99, 102, 241, 0.8)', // Indigo
        borderRadius: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' }
    }
  };

  return (
    <div>
      {/* Dashboard Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Facility Overview</h2>
          <p className="text-gray-500 text-sm mt-1">Live metrics from the AI sorting pipeline</p>
        </div>
        <button className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-colors">
          <Plus className="w-5 h-5" /> Export Report
        </button>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 border-l-4 border-l-blue-500">
          <div className="bg-blue-100 p-3 rounded-full"><Package className="w-6 h-6 text-blue-600" /></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total AI Scans</p>
            <h3 className="text-2xl font-bold text-gray-800">
              {loading ? "..." : (analytics?.total_scans || 0)}
            </h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 border-l-4 border-l-green-500">
          <div className="bg-green-100 p-3 rounded-full"><Recycle className="w-6 h-6 text-green-600" /></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Recyclability Rate</p>
            <h3 className="text-2xl font-bold text-gray-800">78.5%</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 border-l-4 border-l-indigo-500">
          <div className="bg-indigo-100 p-3 rounded-full"><AlertTriangle className="w-6 h-6 text-indigo-600" /></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">System Status</p>
            <h3 className="text-2xl font-bold text-gray-800">Active</h3>
          </div>
        </div>
      </div>

      {/* Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart: Material Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-gray-500" /> Material Distribution
            </h3>
          </div>
          <div className="p-6 h-80 flex justify-center items-center">
            {loading ? (
              <p className="text-gray-400">Loading chart data...</p>
            ) : analytics?.total_scans > 0 ? (
              <Pie data={materialData} options={chartOptions} />
            ) : (
              <p className="text-gray-400">No scan data available yet.</p>
            )}
          </div>
        </div>

        {/* Bar Chart: Condition Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-gray-500" /> Physical Condition Trends
            </h3>
          </div>
          <div className="p-6 h-80 flex justify-center items-center">
            {loading ? (
              <p className="text-gray-400">Loading chart data...</p>
            ) : analytics?.total_scans > 0 ? (
              <Bar data={conditionData} options={{ ...chartOptions, maintainAspectRatio: false }} />
            ) : (
              <p className="text-gray-400">No condition data available yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}