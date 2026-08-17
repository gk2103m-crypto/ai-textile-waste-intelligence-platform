import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from './context/ToastContext'; // Module 11: Notification & Alert System

const InventoryDashboard = () => {
  const [inventory, setInventory] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [viewItem, setViewItem] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [formData, setFormData] = useState({
    fabric_type: '', source: 'Pre-consumer', quantity_kg: '', color: '', condition: 'Good'
  });

  // Module 11: Notification & Alert System
  const { addToast } = useToast();

  // AI Scan State Variables
  const [showAiModal, setShowAiModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  const fetchInventory = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/inventory');
      setInventory(res.data);

      // Module 11 — Inventory Warning: alert when >10 pending batches
      if (res.data.length > 10) {
        addToast({
          type: 'warning',
          title: '⚠️ Inventory Warning',
          message: `${res.data.length} waste batches are pending processing. Consider scheduling a collection run.`,
          duration: 6000,
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => { fetchInventory(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editItem) {
        await axios.put(`http://localhost:8000/api/inventory/${editItem.batch_id}`, formData);
        setEditItem(null);
        // Module 11 — Success: edit saved
        addToast({
          type: 'success',
          title: '✏️ Batch Updated',
          message: `Batch #${editItem.batch_id} (${formData.fabric_type}) has been updated successfully.`,
        });
      } else {
        await axios.post('http://localhost:8000/api/inventory', formData);
        // Module 11 — Success: new inventory added
        addToast({
          type: 'success',
          title: '♻️ Inventory Added',
          message: `${formData.fabric_type} (${formData.quantity_kg} kg) saved to database.`,
        });
      }
      setShowForm(false);
      fetchInventory();
      setFormData({ fabric_type: '', source: 'Pre-consumer', quantity_kg: '', color: '', condition: 'Good' });
    } catch (error) {
      console.error("Error saving:", error);
      addToast({ type: 'error', title: '❌ Save Failed', message: 'Could not save inventory. Check backend connection.' });
    }
  };

  const handleView = async (batch_id) => {
    try {
      const res = await axios.get(`http://localhost:8000/api/inventory/${batch_id}`);
      setViewItem(res.data);
    } catch (error) { console.error("Error fetching item:", error); }
  };

  const handleEdit = (item) => {
    setEditItem(item);
    setFormData({
      fabric_type: item.fabric_type,
      source: item.source,
      quantity_kg: item.quantity_kg,
      color: item.color,
      condition: item.condition
    });
    setShowForm(true);
  };

  const handleDelete = async (batch_id) => {
    if (!window.confirm(`Are you sure you want to permanently delete Batch #${batch_id}? This action cannot be undone.`)) return;
    try {
      await axios.delete(`http://localhost:8000/api/inventory/${batch_id}`);
      fetchInventory();
      // Module 11 — Warning: deletion alert
      addToast({
        type: 'warning',
        title: '🗑️ Batch Deleted',
        message: `Inventory batch #${batch_id} has been permanently removed.`,
      });
    } catch (error) {
      console.error("Error deleting:", error);
      addToast({ type: 'error', title: '❌ Delete Failed', message: 'Could not delete batch. Check backend.' });
    }
  };

  // ==========================================
  // AI IMAGE SCANNER HANDLER
  // ==========================================
  const handleAiScan = async () => {
    if (!selectedFile) return alert("Please select an image file before scanning.");
    
    const uploadData = new FormData();
    uploadData.append('file', selectedFile);
    
    setAiLoading(true);
    setAiResult(null);

    try {
      const res = await axios.post('http://localhost:8000/api/inventory/upload', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      console.log("🔥 AI BACKEND RESPONSE:", res.data);
      setAiResult(res.data);
      fetchInventory(); // Auto update inventory table

      // Module 11 — Recycling Opportunity Notification: AI scan complete
      addToast({
        type: 'success',
        title: '🧠 AI Scan Complete',
        message: `Detected: ${res.data.detected_material} — Circularity Score: ${res.data.circularity_score}/100 — ${res.data.recommended_strategy}`,
        duration: 6000,
      });
    } catch (error) {
      console.error("AI Scan Error:", error);
      alert("AI Scan failed. Please ensure the FastAPI backend server is running on port 8000.");
      // Module 11 — Waste Collection Alert on scan failure
      addToast({
        type: 'error',
        title: '❌ AI Scan Failed',
        message: 'Could not connect to AI backend. Ensure FastAPI server is running on port 8000.',
        duration: 6000,
      });
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6 bg-white p-4 rounded shadow">
        <h1 className="text-2xl font-bold text-gray-800">My Inventory Dashboard</h1>
        <div className="space-x-3">
          <button
            onClick={() => { setShowAiModal(true); setAiResult(null); setSelectedFile(null); }}
            className="bg-purple-600 text-white px-5 py-2 rounded shadow hover:bg-purple-700 transition font-medium"
          >
            📸 AI Image Scanner
          </button>
          <button
            onClick={() => { setShowForm(!showForm); setEditItem(null); setFormData({ fabric_type: '', source: 'Pre-consumer', quantity_kg: '', color: '', condition: 'Good' }); }}
            className="bg-blue-600 text-white px-5 py-2 rounded shadow hover:bg-blue-700 transition"
          >
            {showForm ? 'Cancel' : '+ Add Inventory'}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6 border-t-4 border-blue-600">
          <h3 className="font-semibold mb-4 text-gray-700">{editItem ? `Edit Batch #${editItem.batch_id}` : 'Add New Inventory'}</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <input type="text" placeholder="Fabric Type (e.g. Cotton)" required className="border p-2 rounded" value={formData.fabric_type} onChange={e => setFormData({...formData, fabric_type: e.target.value})} />
            <input type="number" placeholder="Quantity (kg)" required className="border p-2 rounded" value={formData.quantity_kg} onChange={e => setFormData({...formData, quantity_kg: e.target.value})} />
            <input type="text" placeholder="Color" required className="border p-2 rounded" value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})} />
            <select className="border p-2 rounded" value={formData.source} onChange={e => setFormData({...formData, source: e.target.value})}>
              <option>Pre-consumer</option><option>Post-consumer</option><option>Manufacturing Scrap</option>
            </select>
            <select className="border p-2 rounded" value={formData.condition} onChange={e => setFormData({...formData, condition: e.target.value})}>
              <option>Good</option><option>Torn</option><option>Stained</option>
            </select>
            <button type="submit" className="col-span-2 bg-green-600 text-white p-2 rounded font-bold hover:bg-green-700">
              {editItem ? 'Update Item' : 'Save to Database'}
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-800 text-white">
              <th className="p-4">ID</th><th className="p-4">Fabric Type</th><th className="p-4">Color</th><th className="p-4">Quantity (kg)</th><th className="p-4">Condition</th><th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {inventory.length === 0 ? <tr><td colSpan="6" className="p-4 text-center text-gray-500">No data found. Add some inventory!</td></tr> :
              inventory.map((item) => (
                <tr key={item.batch_id} className="border-b">
                  <td className="p-4">#{item.batch_id}</td>
                  <td className="p-4 font-semibold">{item.fabric_type}</td>
                  <td className="p-4">{item.color}</td>
                  <td className="p-4">{item.quantity_kg}</td>
                  <td className="p-4"><span className="px-2 py-1 bg-gray-200 rounded text-sm">{item.condition}</span></td>
                  <td className="p-4 space-x-3">
                    <button onClick={() => handleView(item.batch_id)} className="text-blue-600 font-medium">View</button>
                    <button onClick={() => handleEdit(item)} className="text-green-600 font-medium">Edit</button>
                    <button onClick={() => handleDelete(item.batch_id)} className="text-red-600 font-medium">Delete</button>
                  </td>
                </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* View Modal */}
      {viewItem && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4 text-gray-800">Inventory Details — #{viewItem.batch_id}</h3>
            <div className="space-y-2 text-sm text-gray-700">
              <p><span className="font-medium">Fabric Type:</span> {viewItem.fabric_type}</p>
              <p><span className="font-medium">Source:</span> {viewItem.source}</p>
              <p><span className="font-medium">Quantity:</span> {viewItem.quantity_kg} kg</p>
              <p><span className="font-medium">Color:</span> {viewItem.color}</p>
              <p><span className="font-medium">Condition:</span> {viewItem.condition}</p>
              <p><span className="font-medium">Collected On:</span> {viewItem.collection_date}</p>
            </div>
            <button onClick={() => setViewItem(null)} className="mt-5 w-full bg-gray-800 text-white py-2 rounded-lg">Close</button>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* AI IMAGE SCANNER MODAL */}
      {/* ========================================== */}
      {showAiModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-lg">
            <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
              📸 AI Textile Waste Scanner
            </h3>
            
            <input 
              type="file" 
              accept="image/*"
              onChange={(e) => setSelectedFile(e.target.files[0])}
              className="border p-3 w-full rounded mb-4 text-sm"
            />

            <button 
              onClick={handleAiScan}
              disabled={aiLoading}
              className="w-full bg-purple-600 text-white py-2 rounded font-bold hover:bg-purple-700 disabled:bg-purple-400"
            >
              {aiLoading ? '🧠 Analyzing AI Models...' : '🚀 Scan with AI'}
            </button>

            {/* AI RESULT DISPLAY CARDS (WITH MULTI-KEY FALLBACK) */}
            {aiResult && (
              <div className="mt-6 bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h4 className="font-bold text-purple-900 mb-3 text-center border-b pb-1">AI Scan Results</h4>
                
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-white p-2 rounded shadow-sm">
                    <span className="font-bold text-gray-600 block">Fabric Type:</span>
                    <span className="text-lg font-semibold text-blue-700">
                      {aiResult.material || aiResult.fabric_type || aiResult.fabric || aiResult.detected_material || "Unknown"}
                    </span>
                  </div>

                  <div className="bg-white p-2 rounded shadow-sm">
                    <span className="font-bold text-gray-600 block">Condition / Defect:</span>
                    <span className="text-lg font-semibold text-red-600">
                      {aiResult.detected_defect || aiResult.condition || aiResult.defect || aiResult.damage_type || "Unknown"}
                    </span>
                  </div>

                  <div className="bg-white p-2 rounded shadow-sm col-span-2">
                    <span className="font-bold text-gray-600 block">Circularity Score:</span>
                    <span className="text-lg font-bold text-green-700">
                      {aiResult.circularity_score || aiResult.score || "75"}/100
                    </span>
                  </div>

                  <div className="bg-white p-2 rounded shadow-sm col-span-2">
                    <span className="font-bold text-gray-600 block">Recommended Strategy:</span>
                    <span className="font-medium text-purple-800">
                      {aiResult.recommended_strategy || aiResult.strategy || aiResult.recycling_strategy || "Mechanical Recycling"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <button 
              onClick={() => setShowAiModal(false)} 
              className="mt-5 w-full bg-gray-800 text-white py-2 rounded-lg"
            >
              Close Scanner
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryDashboard;