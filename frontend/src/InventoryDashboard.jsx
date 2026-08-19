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

  const getConditionBadgeClass = (condition) => {
    const cond = (condition || '').toLowerCase();
    if (cond.includes('good')) {
      return 'px-2.5 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-md text-xs font-medium';
    }
    if (cond.includes('stained') || cond.includes('flawed')) {
      return 'px-2.5 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 rounded-md text-xs font-medium';
    }
    if (cond.includes('torn') || cond.includes('degraded')) {
      return 'px-2.5 py-1 bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 rounded-md text-xs font-medium';
    }
    return 'px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-md text-xs font-medium';
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-lg">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">My Inventory Dashboard</h1>
        <div className="space-x-3">
          <button
            onClick={() => { setShowAiModal(true); setAiResult(null); setSelectedFile(null); }}
            className="bg-purple-600 text-white px-5 py-2 rounded-lg shadow hover:bg-purple-500 transition font-medium"
          >
            📸 AI Image Scanner
          </button>
          <button
            onClick={() => { setShowForm(!showForm); setEditItem(null); setFormData({ fabric_type: '', source: 'Pre-consumer', quantity_kg: '', color: '', condition: 'Good' }); }}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg shadow hover:bg-blue-500 transition font-medium"
          >
            {showForm ? 'Cancel' : '+ Add Inventory'}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 border-t-4 border-t-blue-500">
          <h3 className="font-semibold mb-4 text-slate-900 dark:text-slate-200">{editItem ? `Edit Batch #${editItem.batch_id}` : 'Add New Inventory'}</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <input type="text" placeholder="Fabric Type (e.g. Cotton)" required className="bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 p-2.5 rounded-lg focus:outline-none focus:border-blue-500" value={formData.fabric_type} onChange={e => setFormData({...formData, fabric_type: e.target.value})} />
            <input type="number" placeholder="Quantity (kg)" required className="bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 p-2.5 rounded-lg focus:outline-none focus:border-blue-500" value={formData.quantity_kg} onChange={e => setFormData({...formData, quantity_kg: e.target.value})} />
            <input type="text" placeholder="Color" required className="bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 p-2.5 rounded-lg focus:outline-none focus:border-blue-500" value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})} />
            <select className="bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-200 p-2.5 rounded-lg focus:outline-none focus:border-blue-500" value={formData.source} onChange={e => setFormData({...formData, source: e.target.value})}>
              <option className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200">Pre-consumer</option>
              <option className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200">Post-consumer</option>
              <option className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200">Manufacturing Scrap</option>
            </select>
            <select className="bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-200 p-2.5 rounded-lg focus:outline-none focus:border-blue-500" value={formData.condition} onChange={e => setFormData({...formData, condition: e.target.value})}>
              <option className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200">Good</option>
              <option className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200">Torn</option>
              <option className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200">Stained</option>
            </select>
            <button type="submit" className="col-span-2 bg-emerald-600 text-white p-2.5 rounded-lg font-bold hover:bg-emerald-500 transition">
              {editItem ? 'Update Item' : 'Save to Database'}
            </button>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700 text-xs font-semibold uppercase tracking-wider">
              <th className="p-4">ID</th>
              <th className="p-4">Fabric Type</th>
              <th className="p-4">Color</th>
              <th className="p-4">Quantity (kg)</th>
              <th className="p-4">Condition</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-800 text-slate-900 dark:text-slate-200">
            {inventory.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-4 text-center text-slate-500 dark:text-slate-400">
                  No data found. Add some inventory!
                </td>
              </tr>
            ) : (
              inventory.map((item) => (
                <tr key={item.batch_id} className="border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-4 text-slate-500 dark:text-slate-400">#{item.batch_id}</td>
                  <td className="p-4 font-semibold text-slate-900 dark:text-slate-100">{item.fabric_type}</td>
                  <td className="p-4 text-slate-700 dark:text-slate-300">{item.color}</td>
                  <td className="p-4 text-slate-700 dark:text-slate-300">{item.quantity_kg}</td>
                  <td className="p-4">
                    <span className={getConditionBadgeClass(item.condition)}>
                      {item.condition}
                    </span>
                  </td>
                  <td className="p-4 space-x-3">
                    <button onClick={() => handleView(item.batch_id)} className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 font-medium transition-colors">View</button>
                    <button onClick={() => handleEdit(item)} className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300 font-medium transition-colors">Edit</button>
                    <button onClick={() => handleDelete(item.batch_id)} className="text-rose-600 dark:text-rose-400 hover:text-rose-500 dark:hover:text-rose-300 font-medium transition-colors">Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* View Modal */}
      {viewItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4 text-slate-900 dark:text-slate-100">Inventory Details — #{viewItem.batch_id}</h3>
            <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
              <p><span className="font-medium text-slate-900 dark:text-slate-100">Fabric Type:</span> {viewItem.fabric_type}</p>
              <p><span className="font-medium text-slate-900 dark:text-slate-100">Source:</span> {viewItem.source}</p>
              <p><span className="font-medium text-slate-900 dark:text-slate-100">Quantity:</span> {viewItem.quantity_kg} kg</p>
              <p><span className="font-medium text-slate-900 dark:text-slate-100">Color:</span> {viewItem.color}</p>
              <p><span className="font-medium text-slate-900 dark:text-slate-100">Condition:</span> {viewItem.condition}</p>
              <p><span className="font-medium text-slate-900 dark:text-slate-100">Collected On:</span> {viewItem.collection_date}</p>
            </div>
            <button onClick={() => setViewItem(null)} className="mt-5 w-full bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 py-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition font-medium border border-slate-200 dark:border-slate-600">Close</button>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* AI IMAGE SCANNER MODAL */}
      {/* ========================================== */}
      {showAiModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl p-6 w-full max-w-lg">
            <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-slate-100 flex items-center gap-2">
              📸 AI Textile Waste Scanner
            </h3>
            
            <input 
              type="file" 
              accept="image/*"
              onChange={(e) => setSelectedFile(e.target.files[0])}
              className="bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-200 p-3 w-full rounded-lg mb-4 text-sm focus:outline-none focus:border-purple-500"
            />

            <button 
              onClick={handleAiScan}
              disabled={aiLoading}
              className="w-full bg-purple-600 text-white py-2.5 rounded-lg font-bold hover:bg-purple-500 disabled:bg-purple-900/50 disabled:text-purple-400 transition"
            >
              {aiLoading ? '🧠 Analyzing AI Models...' : '🚀 Scan with AI'}
            </button>

            {/* AI RESULT DISPLAY CARDS (WITH MULTI-KEY FALLBACK) */}
            {aiResult && (
              <div className="mt-6 bg-slate-50 dark:bg-slate-900/90 p-4 rounded-xl border border-purple-500/30">
                <h4 className="font-bold text-purple-600 dark:text-purple-300 mb-3 text-center border-b border-slate-200 dark:border-slate-700/80 pb-2">AI Scan Results</h4>
                
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 p-3 rounded-lg shadow-sm">
                    <span className="font-bold text-slate-500 dark:text-slate-400 block text-xs mb-1">Fabric Type:</span>
                    <span className="text-base font-semibold text-blue-600 dark:text-blue-400">
                      {aiResult.material || aiResult.fabric_type || aiResult.fabric || aiResult.detected_material || "Unknown"}
                    </span>
                  </div>

                  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 p-3 rounded-lg shadow-sm">
                    <span className="font-bold text-slate-500 dark:text-slate-400 block text-xs mb-1">Condition / Defect:</span>
                    <span className="text-base font-semibold text-rose-600 dark:text-rose-400">
                      {aiResult.detected_defect || aiResult.condition || aiResult.defect || aiResult.damage_type || "Unknown"}
                    </span>
                  </div>

                  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 p-3 rounded-lg shadow-sm col-span-2">
                    <span className="font-bold text-slate-500 dark:text-slate-400 block text-xs mb-1">Circularity Score:</span>
                    <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                      {aiResult.circularity_score || aiResult.score || "75"}/100
                    </span>
                  </div>

                  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 p-3 rounded-lg shadow-sm col-span-2">
                    <span className="font-bold text-slate-500 dark:text-slate-400 block text-xs mb-1">Recommended Strategy:</span>
                    <span className="font-medium text-purple-600 dark:text-purple-300">
                      {aiResult.recommended_strategy || aiResult.strategy || aiResult.recycling_strategy || "Mechanical Recycling"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <button 
              onClick={() => setShowAiModal(false)} 
              className="mt-5 w-full bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 py-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition font-medium border border-slate-200 dark:border-slate-600"
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