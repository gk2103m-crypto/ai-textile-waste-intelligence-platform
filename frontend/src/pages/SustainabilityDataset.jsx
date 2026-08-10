import { useEffect, useState } from 'react';
import axios from 'axios';

export default function SustainabilityDataset() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('http://localhost:8000/api/inventory')
      .then(res => setItems(res.data))
      .catch(err => console.error("Error fetching inventory:", err))
      .finally(() => setLoading(false));
  }, []);

  const getRatingColor = (score) => {
    if (score >= 85) return "bg-green-100 text-green-700";
    if (score >= 70) return "bg-blue-100 text-blue-700";
    if (score >= 55) return "bg-yellow-100 text-yellow-700";
    return "bg-red-100 text-red-700";
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Sustainability Dataset</h2>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-800 text-white">
              <th className="p-4">Batch ID</th>
              <th className="p-4">Fabric Type</th>
              <th className="p-4">Condition</th>
              <th className="p-4">Circularity Score</th>
              <th className="p-4">Category</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" className="p-4 text-center text-gray-500">Loading...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan="5" className="p-4 text-center text-gray-500">No data found. Scan or add inventory first.</td></tr>
            ) : (
              items.map(item => (
                <tr key={item.batch_id} className="border-b">
                  <td className="p-4">#{item.batch_id}</td>
                  <td className="p-4 font-semibold">{item.fabric_type}</td>
                  <td className="p-4">{item.condition}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-sm font-medium ${getRatingColor(item.circularity_score)}`}>
                      {item.circularity_score || 0}/100
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-600">{item.circularity_category || "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}