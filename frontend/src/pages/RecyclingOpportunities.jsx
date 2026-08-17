import React, { useState, useEffect } from 'react';
import { Recycle, CheckCircle, Loader2, AlertCircle, FileSpreadsheet, Download } from 'lucide-react';
import axios from 'axios';
import * as XLSX from 'xlsx'; // GAP-10 FIX: Excel export
import { useToast } from '../context/ToastContext'; // GAP-10 FIX: Toast notifications

// GAP-10 FIX: Added Excel export and toast notifications to this page
export default function RecyclingOpportunities() {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToast } = useToast(); // GAP-10 FIX

  useEffect(() => {
    const fetchOpportunities = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:8000/api/inventory', {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        setOpportunities(response.data || []);
        setLoading(false);

        // GAP-10 FIX: Module 11 — Recycling Opportunity Notifications
        const highValue = (response.data || []).filter(i => Number(i.circularity_score) >= 70);
        if (highValue.length > 0) {
          addToast({
            type: 'success',
            title: '♻️ Recycling Opportunities Found',
            message: `${highValue.length} high-value batches with ≥70 circularity score ready for processing.`,
            duration: 5000,
          });
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to fetch live data from backend.");
        setLoading(false);
        addToast({
          type: 'error',
          title: '❌ Data Fetch Failed',
          message: 'Could not load recycling opportunities. Check backend connection.',
          duration: 5000,
        });
      }
    };

    fetchOpportunities();
  }, []);

  // GAP-10 FIX: Module 12 — Excel Export for Recycling Opportunities
  const handleExportExcel = () => {
    if (opportunities.length === 0) {
      addToast({
        type: 'warning',
        title: '⚠️ No Data to Export',
        message: 'Scan some textile batches first before exporting.',
        duration: 4000,
      });
      return;
    }

    try {
      const wb = XLSX.utils.book_new();

      const headers = [['Batch ID', 'Fabric Type', 'Condition', 'Circularity Score (/100)', 'Recovery Category', 'Recommended Strategy', 'Source']];
      const rows = opportunities.map(item => [
        `#${item.batch_id}`,
        item.fabric_type || 'N/A',
        item.condition || 'N/A',
        Number(item.circularity_score || 0).toFixed(1),
        item.circularity_category || 'N/A',
        item.strategy || 'Not yet analyzed',
        item.source || 'N/A',
      ]);

      const ws = XLSX.utils.aoa_to_sheet([...headers, ...rows]);
      ws['!cols'] = [
        { wch: 10 }, { wch: 18 }, { wch: 18 }, { wch: 24 },
        { wch: 28 }, { wch: 36 }, { wch: 20 },
      ];
      XLSX.utils.book_append_sheet(wb, ws, 'Recycling Opportunities');

      // Summary sheet
      const summaryData = [
        ['Recycling Opportunities Report'],
        ['Generated', new Date().toLocaleString('en-IN', { dateStyle: 'long', timeStyle: 'short' })],
        [],
        ['Total Batches', opportunities.length],
        ['High Recovery (≥70)', opportunities.filter(i => Number(i.circularity_score) >= 70).length],
        ['Ready for Recycling', opportunities.filter(i => Number(i.circularity_score) >= 55).length],
      ];
      const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
      wsSummary['!cols'] = [{ wch: 28 }, { wch: 30 }];
      XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

      XLSX.writeFile(wb, 'Recycling_Opportunities_Report.xlsx');

      addToast({
        type: 'success',
        title: '📊 Excel Exported Successfully',
        message: `Recycling_Opportunities_Report.xlsx downloaded with ${opportunities.length} batches.`,
        duration: 4500,
      });
    } catch (err) {
      console.error('Excel export failed:', err);
      addToast({
        type: 'error',
        title: '❌ Export Failed',
        message: 'Could not generate the Excel file. Please try again.',
        duration: 5000,
      });
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-green-600" /></div>;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Recycle className="text-green-600" /> Recycling Opportunities
          </h1>
          <p className="text-sm text-gray-500 mt-1">Live data fetched from AI Analysis Backend — Module 6</p>
        </div>

        {/* GAP-10 FIX: Excel Export Button */}
        <button
          onClick={handleExportExcel}
          className="flex items-center gap-2 bg-green-700 hover:bg-green-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-all duration-200"
        >
          <FileSpreadsheet className="w-4 h-4" />
          Export to Excel
        </button>
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
                <th className="p-4 font-semibold">Batch ID</th>
                <th className="p-4 font-semibold">Material</th>
                <th className="p-4 font-semibold">Condition</th>
                <th className="p-4 font-semibold">Circularity Score</th>
                <th className="p-4 font-semibold">Recovery Category</th>
                <th className="p-4 font-semibold">Recommended Action</th>
              </tr>
            </thead>
            <tbody>
              {opportunities.length > 0 ? (
                opportunities.map((item) => (
                  <tr key={item.batch_id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-gray-500 text-sm font-mono">#{item.batch_id}</td>
                    <td className="p-4 font-medium text-gray-800">{item.fabric_type || 'N/A'}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${item.condition === 'Good' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {item.condition || 'N/A'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`font-bold text-sm ${Number(item.circularity_score) >= 70 ? 'text-green-600' : Number(item.circularity_score) >= 55 ? 'text-amber-600' : 'text-red-600'}`}>
                        {Number(item.circularity_score || 0).toFixed(1)} / 100
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-600">{item.circularity_category || 'N/A'}</td>
                    <td className="p-4 text-blue-600 font-medium flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" /> {item.strategy || 'Not yet analyzed'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500">
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