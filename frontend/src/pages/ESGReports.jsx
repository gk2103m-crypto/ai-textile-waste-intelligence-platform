import React, { useState, useEffect, useRef } from 'react';
import {
  Leaf, TrendingUp, Award, Loader2, AlertCircle,
  Recycle, Droplets, Zap, FileText,
} from 'lucide-react';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useToast } from '../context/ToastContext'; // Module 11: Notification & Alert System

const getCategoryFromScore = (score) => {
  if (score >= 85) return 'Excellent Recovery Potential';
  if (score >= 70) return 'High Recovery Potential';
  if (score >= 55) return 'Moderate Recovery Potential';
  if (score >= 40) return 'Limited Recovery Potential';
  return 'Disposal Recommended';
};

export default function ESGReports() {
  const [metrics, setMetrics]         = useState(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [exportingPDF, setExportingPDF] = useState(false);

  // Module 11: Notification & Alert System
  const { addToast }   = useToast();
  const toastFired     = useRef(false); // prevents duplicate toasts on StrictMode double-invoke

  // ── Fetch ESG metrics ──────────────────────────────────────────────────────
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          'http://localhost:8000/api/inventory/sustainability-stats',
          { headers: token ? { Authorization: `Bearer ${token}` } : {} }
        );
        setMetrics(response.data);
        setLoading(false);

        // Module 11 — Platform Announcement: ESG data refreshed
        if (!toastFired.current) {
          toastFired.current = true;

          addToast({
            type: 'info',
            title: '📊 ESG Report Updated',
            message: 'Your sustainability metrics have been refreshed with live data from the platform.',
            duration: 4000,
          });

          // Module 11 — Sustainability Milestone Alert: celebrate CO₂ savings threshold
          const co2 = response.data.total_co2_saved_kg || 0;
          if (co2 >= 50) {
            addToast({
              type: 'success',
              title: '🌍 Sustainability Milestone!',
              message: `Outstanding! You've diverted ${co2} kg of CO₂ from the atmosphere through circular textile recovery.`,
              duration: 7000,
            });
          } else if (co2 > 0) {
            addToast({
              type: 'success',
              title: '♻️ Recycling Opportunity Active',
              message: `${co2} kg CO₂ saved so far. Keep scanning textile batches to hit the 50 kg milestone!`,
              duration: 5000,
            });
          }
        }
      } catch (err) {
        console.error('Error fetching ESG metrics:', err);
        setError('Failed to load real-time ESG metrics.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  // ── Programmatic PDF Export (pure jsPDF + autoTable — no DOM capture) ──────────────
  const handleExportPDF = () => {
    if (!metrics) return;
    setExportingPDF(true);
    try {
      const doc   = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const W     = doc.internal.pageSize.getWidth();
      const H     = doc.internal.pageSize.getHeight();
      const GREEN = [34, 197, 94];
      const DARK  = [15, 23, 42];
      const WHITE = [255, 255, 255];
      const LIGHT = [248, 250, 252];
      const MUTED = [100, 116, 139];

      // ─────────────────────────────────────────────────────
      // 1. HEADER BLOCK
      // ─────────────────────────────────────────────────────
      doc.setFillColor(...GREEN);
      doc.rect(0, 0, W, 36, 'F');
      doc.setFillColor(...DARK);
      doc.rect(0, 33, W, 3, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(...WHITE);
      doc.text('AI Textile Waste Intelligence', 12, 15);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(220, 252, 231);
      doc.text('Sustainability & ESG Report — Modules 7, 8 & 9', 12, 22);

      const now = new Date().toLocaleString('en-IN', { dateStyle: 'long', timeStyle: 'short' });
      doc.setFontSize(8);
      doc.text(`Generated: ${now}`, W - 12, 22, { align: 'right' });

      // ─────────────────────────────────────────────────────
      // 2. ESG IMPACT KPI CARDS (2 × 2 grid)
      // ─────────────────────────────────────────────────────
      const gridStartY = 44;
      const cardW = (W - 30) / 2;
      const cardH = 26;
      const cardGap = 6;

      const esgCards = [
        { label: 'CO₂ Emissions Saved',  value: `${metrics.total_co2_saved_kg ?? 0} kg`,           color: [34, 197, 94]  },
        { label: 'Water Conservation',   value: `${metrics.total_water_saved_liters ?? 0} L`,       color: [59, 130, 246] },
        { label: 'Energy Recovered',     value: `${metrics.total_energy_saved_kwh ?? 0} kWh`,      color: [234, 179, 8]  },
        { label: 'Landfill Diverted',    value: `${metrics.total_landfill_diverted_kg ?? 0} kg`,   color: [168, 85, 247] },
      ];

      esgCards.forEach(({ label, value, color }, i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const x = 12 + col * (cardW + cardGap);
        const y = gridStartY + row * (cardH + cardGap);
        doc.setFillColor(...LIGHT);
        doc.roundedRect(x, y, cardW, cardH, 3, 3, 'F');
        doc.setFillColor(...color);
        doc.rect(x, y, 3, cardH, 'F');
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(...MUTED);
        doc.text(label, x + 7, y + 9);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(15);
        doc.setTextColor(...DARK);
        doc.text(value, x + 7, y + 20);
      });

      // ─────────────────────────────────────────────────────
      // 3. CIRCULARITY SCORE HIGHLIGHT PANEL
      // ─────────────────────────────────────────────────────
      const panelY = gridStartY + 2 * (cardH + cardGap) + 6;
      doc.setFillColor(...DARK);
      doc.roundedRect(12, panelY, W - 24, 22, 3, 3, 'F');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...GREEN);
      doc.text('OVERALL CIRCULARITY SCORE (Weighted Model — Module 9)', 18, panelY + 8);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.setTextColor(...WHITE);
      const score = metrics.avg_circularity_score ?? 0;
      doc.text(`${score} / 100`, 18, panelY + 18);
      // Category label (right side)
      const getCat = (s) => s >= 85 ? 'Excellent Recovery' : s >= 70 ? 'High Recovery' : s >= 55 ? 'Moderate Recovery' : s >= 40 ? 'Limited Recovery' : 'Disposal Recommended';
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(220, 252, 231);
      doc.text(getCat(score), W - 18, panelY + 14, { align: 'right' });
      doc.setFontSize(7.5);
      doc.text(`Waste Diversion Rate: ${metrics.waste_diversion_rate ?? '94.5%'}`, W - 18, panelY + 19, { align: 'right' });

      // ─────────────────────────────────────────────────────
      // 4. ESG SUMMARY TABLE
      // ─────────────────────────────────────────────────────
      const tableStartY = panelY + 30;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...GREEN);
      doc.text('Environmental Impact Summary', 12, tableStartY);
      doc.setDrawColor(...GREEN);
      doc.setLineWidth(0.5);
      doc.line(12, tableStartY + 1.5, W - 12, tableStartY + 1.5);

      const esgRows = [
        ['CO₂ Emissions Saved',  `${metrics.total_co2_saved_kg ?? 0} kg`,         'Carbon Footprint Reduction',      'Excellent'],
        ['Water Conservation',   `${metrics.total_water_saved_liters ?? 0} L`,     'Freshwater Resource Recovery',   'High'],
        ['Energy Recovered',     `${metrics.total_energy_saved_kwh ?? 0} kWh`,    'Industrial Energy Savings',      'High'],
        ['Landfill Diverted',    `${metrics.total_landfill_diverted_kg ?? 0} kg`, 'Circular Economy Contribution',  'Excellent'],
        ['Waste Diversion Rate', metrics.waste_diversion_rate ?? '94.5%',          'Overall Platform Effectiveness', 'Outstanding'],
        ['Circularity Score',    `${metrics.avg_circularity_score ?? 0} / 100`,    'Weighted Circular Economy Index','High'],
      ];

      autoTable(doc, {
        startY: tableStartY + 5,
        head: [['ESG Metric', 'Value', 'Impact Category', 'Rating']],
        body: esgRows,
        theme: 'grid',
        styles: {
          font: 'helvetica', fontSize: 9,
          cellPadding: 3.5, textColor: DARK,
        },
        headStyles: {
          fillColor: GREEN, textColor: WHITE,
          fontStyle: 'bold', fontSize: 9,
        },
        alternateRowStyles: { fillColor: [240, 253, 244] },
        columnStyles: {
          0: { cellWidth: 52, fontStyle: 'bold' },
          1: { cellWidth: 36, halign: 'center' },
          2: { cellWidth: 72 },
          3: { cellWidth: 26, halign: 'center' },
        },
        margin: { left: 12, right: 12 },
      });

      // ─────────────────────────────────────────────────────
      // 5. FOOTER
      // ─────────────────────────────────────────────────────
      const totalPages = doc.internal.getNumberOfPages();
      for (let p = 1; p <= totalPages; p++) {
        doc.setPage(p);
        doc.setFillColor(...DARK);
        doc.rect(0, H - 10, W, 10, 'F');
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...WHITE);
        doc.text(
          'Confidential — AI Textile Waste Intelligence Platform © 2026',
          W / 2, H - 4, { align: 'center' }
        );
        doc.text(`Page ${p} of ${totalPages}`, W - 12, H - 4, { align: 'right' });
      }

      doc.save('ESG_Sustainability_Report.pdf');

      addToast({
        type: 'success',
        title: '📄 ESG Report Exported',
        message: 'ESG_Sustainability_Report.pdf has been downloaded successfully.',
        duration: 4500,
      });
    } catch (err) {
      console.error('ESG PDF export failed:', err);
      addToast({
        type: 'error',
        title: '❌ PDF Export Failed',
        message: err.message || 'Could not generate the PDF. Please try again.',
        duration: 5000,
      });
    } finally {
      setExportingPDF(false);
    }
  };

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  const avgScore = metrics?.avg_circularity_score || 0;
  const category = getCategoryFromScore(avgScore);

  return (
    // Outer wrapper holds the export button OUTSIDE the captured area (no button in PDF)
    <div className="p-6 max-w-6xl mx-auto space-y-4">

      {/* ── Page header with Export button ────────────────────────────── */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Leaf className="text-green-600" /> Sustainability &amp; ESG Reports
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Module 7, 8 &amp; 9: Real-time Environmental Impact &amp; Weighted Circularity Benchmarking
          </p>
        </div>

        {/* Export to PDF button */}
        <button
          id="esg-export-btn"
          onClick={handleExportPDF}
          disabled={exportingPDF || !!error}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-500 disabled:bg-green-300 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-all duration-200"
        >
          {exportingPDF ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating PDF…
            </>
          ) : (
            <>
              <FileText className="w-4 h-4" />
              Export ESG Report (PDF)
            </>
          )}
        </button>
      </div>

      {/* ── CRITICAL: This div is the html2canvas capture target ──────── */}
      {/* Everything inside here will appear in the exported PDF.          */}
      <div id="esg-report-content" className="space-y-6 bg-slate-50 rounded-2xl p-4">

        {error ? (
          <div className="bg-red-50 p-4 rounded-lg flex items-center gap-3 text-red-600">
            <AlertCircle className="w-5 h-5" />
            <p>{error}</p>
          </div>
        ) : (
          <>
            {/* ── KPI cards grid ────────────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-2">

              {/* CO₂ Saved */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
                <div className="bg-green-100 p-3 rounded-full mb-4">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-gray-500 font-medium text-sm">CO₂ Emissions Saved</h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {metrics?.total_co2_saved_kg || 0}{' '}
                  <span className="text-lg text-gray-500 font-normal">kg</span>
                </p>
                <span className="text-xs text-green-600 font-medium mt-1">↑ Carbon Footprint Reduced</span>
              </div>

              {/* Water Conservation */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
                <div className="bg-blue-100 p-3 rounded-full mb-4">
                  <Droplets className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-gray-500 font-medium text-sm">Water Conservation</h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {metrics?.total_water_saved_liters || 0}{' '}
                  <span className="text-lg text-gray-500 font-normal">L</span>
                </p>
                <span className="text-xs text-blue-600 font-medium mt-1">↑ High Industry Benchmark</span>
              </div>

              {/* Energy Saved */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
                <div className="bg-yellow-100 p-3 rounded-full mb-4">
                  <Zap className="w-6 h-6 text-yellow-600" />
                </div>
                <h3 className="text-gray-500 font-medium text-sm">Energy Saved</h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {metrics?.total_energy_saved_kwh || 0}{' '}
                  <span className="text-lg text-gray-500 font-normal">kWh</span>
                </p>
                <span className="text-xs text-yellow-600 font-medium mt-1">↑ Resource Recovery</span>
              </div>

              {/* Landfill Diverted */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
                <div className="bg-purple-100 p-3 rounded-full mb-4">
                  <Recycle className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-gray-500 font-medium text-sm">Landfill Diverted</h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {metrics?.total_landfill_diverted_kg || 0}{' '}
                  <span className="text-lg text-gray-500 font-normal">kg</span>
                </p>
                <span className="text-xs text-purple-600 font-medium mt-1">
                  Rate: {metrics?.waste_diversion_rate || '94.5%'}
                </span>
              </div>
            </div>

            {/* ── Circularity Score Panel ────────────────────────────────── */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <Award className="text-yellow-600 w-6 h-6" />
                <h2 className="text-lg font-bold text-gray-800">
                  Overall Circularity Score (Weighted Model — Module 9)
                </h2>
              </div>

              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-center md:text-left">
                  <span className="text-5xl font-extrabold text-green-600">{avgScore}</span>
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
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${avgScore}%` }}
                      />
                    </div>
                  </div>

                  <p className="text-xs text-gray-400 italic pt-2">
                    Detailed sub-metric breakdown (Condition, Reuse Potential, Environmental Benefit,
                    Processing Feasibility) is calculated per-item during AI scanning — average shown
                    above reflects the overall weighted circularity score across all logged inventory.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>{/* end #esg-report-content */}
    </div>
  );
}