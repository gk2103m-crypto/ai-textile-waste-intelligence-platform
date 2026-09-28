import React, { useState, useEffect, useRef } from 'react';
import {
  Leaf, TrendingUp, Award, Loader2, AlertCircle,
  Recycle, Droplets, Zap, FileText,
} from 'lucide-react';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useToast } from '../context/ToastContext';
import { API_BASE_URL } from '../config/api';

// ─── Mock fallback shown when backend is unavailable (Render cold start) ───
const FALLBACK_METRICS = {
  total_co2_saved_kg: 0,
  total_water_saved_liters: 0,
  total_energy_saved_kwh: 0,
  total_landfill_diverted_kg: 0,
  avg_circularity_score: 0,
  waste_diversion_rate: '0%',
};


const getCategoryFromScore = (score) => {
  if (score >= 85) return 'Excellent Recovery Potential';
  if (score >= 70) return 'High Recovery Potential';
  if (score >= 55) return 'Moderate Recovery Potential';
  if (score >= 40) return 'Limited Recovery Potential';
  return 'Disposal Recommended';
};

export default function ESGReports() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [backendDown, setBackendDown] = useState(false);
  const [exportingPDF, setExportingPDF] = useState(false);

  const { addToast } = useToast();
  const toastFired = useRef(false);
  const attemptRef = useRef(0);
  const MAX_ATTEMPTS = 8;

  useEffect(() => {
    let cancelled = false;

    const tryFetch = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/inventory/sustainability-stats`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            timeout: 12000,
          }
        );

        if (cancelled) return;

        setMetrics(response.data);
        setLoading(false);
        setBackendDown(false);

        if (!toastFired.current) {
          toastFired.current = true;
          addToast({
            type: 'info',
            title: '📊 ESG Report Updated',
            message: 'Sustainability metrics loaded successfully.',
            duration: 3500,
          });
          const co2 = response.data?.total_co2_saved_kg || 0;
          if (co2 >= 50) {
            addToast({
              type: 'success',
              title: '🌍 Sustainability Milestone!',
              message: `Outstanding! You've diverted ${co2} kg of CO₂ through circular textile recovery.`,
              duration: 7000,
            });
          } else if (co2 > 0) {
            addToast({
              type: 'success',
              title: '♻️ Recycling Opportunity Active',
              message: `${co2} kg CO₂ saved so far. Keep scanning to hit the 50 kg milestone!`,
              duration: 5000,
            });
          }
        }
      } catch (err) {
        if (cancelled) return;
        attemptRef.current += 1;
        setRetryCount(attemptRef.current);
        console.warn(`ESG fetch attempt ${attemptRef.current}/${MAX_ATTEMPTS} failed:`, err?.message);

        if (attemptRef.current < MAX_ATTEMPTS) {
          // Backend still waking up — schedule next attempt in 8s (skeleton stays visible)
          setTimeout(tryFetch, 8000);
        } else {
          // All attempts exhausted — show fallback as last resort
          console.warn('ESG: all attempts exhausted, showing fallback data');
          setMetrics(FALLBACK_METRICS);
          setBackendDown(true);
          setLoading(false);
        }
      }
    };

    tryFetch();
    return () => { cancelled = true; };
  }, []);

  const handleExportPDF = () => {
    if (!metrics) return;
    setExportingPDF(true);
    try {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const W = doc.internal.pageSize.getWidth();
      const H = doc.internal.pageSize.getHeight();
      const GREEN = [34, 197, 94];
      const DARK = [15, 23, 42];
      const WHITE = [255, 255, 255];
      const LIGHT = [248, 250, 252];
      const MUTED = [100, 116, 139];

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

      const gridStartY = 44;
      const cardW = (W - 30) / 2;
      const cardH = 26;
      const cardGap = 6;

      const esgCards = [
        { label: 'CO₂ Emissions Saved', value: `${metrics.total_co2_saved_kg ?? 0} kg`, color: [34, 197, 94] },
        { label: 'Water Conservation', value: `${metrics.total_water_saved_liters ?? 0} L`, color: [59, 130, 246] },
        { label: 'Energy Recovered', value: `${metrics.total_energy_saved_kwh ?? 0} kWh`, color: [234, 179, 8] },
        { label: 'Landfill Diverted', value: `${metrics.total_landfill_diverted_kg ?? 0} kg`, color: [168, 85, 247] },
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
      const getCat = (s) => s >= 85 ? 'Excellent Recovery' : s >= 70 ? 'High Recovery' : s >= 55 ? 'Moderate Recovery' : s >= 40 ? 'Limited Recovery' : 'Disposal Recommended';
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(220, 252, 231);
      doc.text(getCat(score), W - 18, panelY + 14, { align: 'right' });
      doc.setFontSize(7.5);
      doc.text(`Waste Diversion Rate: ${metrics.waste_diversion_rate ?? '94.5%'}`, W - 18, panelY + 19, { align: 'right' });

      const tableStartY = panelY + 30;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...GREEN);
      doc.text('Environmental Impact Summary', 12, tableStartY);
      doc.setDrawColor(...GREEN);
      doc.setLineWidth(0.5);
      doc.line(12, tableStartY + 1.5, W - 12, tableStartY + 1.5);

      const esgRows = [
        ['CO₂ Emissions Saved', `${metrics.total_co2_saved_kg ?? 0} kg`, 'Carbon Footprint Reduction', 'Excellent'],
        ['Water Conservation', `${metrics.total_water_saved_liters ?? 0} L`, 'Freshwater Resource Recovery', 'High'],
        ['Energy Recovered', `${metrics.total_energy_saved_kwh ?? 0} kWh`, 'Industrial Energy Savings', 'High'],
        ['Landfill Diverted', `${metrics.total_landfill_diverted_kg ?? 0} kg`, 'Circular Economy Contribution', 'Excellent'],
        ['Waste Diversion Rate', metrics.waste_diversion_rate ?? '94.5%', 'Overall Platform Effectiveness', 'Outstanding'],
        ['Circularity Score', `${metrics.avg_circularity_score ?? 0} / 100`, 'Weighted Circular Economy Index', 'High'],
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

  if (loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto space-y-4">
        {/* Page header skeleton */}
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className="h-8 w-72 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
            <div className="h-4 w-96 bg-slate-100 dark:bg-slate-700 rounded-lg animate-pulse" />
          </div>
          <div className="h-10 w-44 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
        </div>

        <div className="glass-card rounded-2xl p-6 space-y-6">
          {/* Connecting indicator */}
          <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 text-sm">
            <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
            <span>
              Connecting to analytics server
              {retryCount > 0 ? ` — attempt ${retryCount + 1} of ${MAX_ATTEMPTS}…` : '…'}
            </span>
          </div>

          {/* 4-column metric card skeletons */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="glass-card p-6 rounded-2xl flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
                <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                <div className="h-8 w-16 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
              </div>
            ))}
          </div>

          {/* Score card skeleton */}
          <div className="glass-card p-6 rounded-2xl space-y-4">
            <div className="h-4 w-64 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
            <div className="flex gap-6 items-center">
              <div className="w-20 h-20 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse" />
              <div className="flex-1 space-y-3">
                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                <div className="h-3 w-3/4 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const avgScore = metrics?.avg_circularity_score || 0;
  const category = getCategoryFromScore(avgScore);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-4 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Leaf className="w-7 h-7 text-emerald-500" /> Sustainability &amp; ESG Reports
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Module 7, 8 &amp; 9: Real-time Environmental Impact &amp; Weighted Circularity Benchmarking
          </p>
        </div>

        <button
          id="esg-export-btn"
          onClick={handleExportPDF}
          disabled={exportingPDF || !metrics}
          className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-90 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm shadow-emerald-500/25 transition-all duration-200"
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

      <div id="esg-report-content" className="space-y-6 glass-card rounded-2xl p-6">
        {backendDown && (
          <div className="bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 p-3 rounded-lg flex items-center gap-3 text-slate-500 dark:text-slate-400 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <p>Analytics server is temporarily offline. Scan a new textile item to wake it up and refresh data.</p>
          </div>
        )}
        {metrics && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-2">
              <div className="glass-card p-6 rounded-2xl flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group">
                <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 p-3 rounded-xl mb-4 border border-emerald-500/10 group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-slate-500 dark:text-slate-400 font-medium text-sm">CO₂ Emissions Saved</h3>
                <p className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-2">
                  {metrics?.total_co2_saved_kg || 0}{' '}
                  <span className="text-lg text-slate-500 dark:text-slate-400 font-normal">kg</span>
                </p>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1">↑ Carbon Footprint Reduced</span>
              </div>

              <div className="glass-card p-6 rounded-2xl flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group">
                <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 p-3 rounded-xl mb-4 border border-blue-500/10 group-hover:scale-110 transition-transform duration-300">
                  <Droplets className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-slate-500 dark:text-slate-400 font-medium text-sm">Water Conservation</h3>
                <p className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-2">
                  {metrics?.total_water_saved_liters || 0}{' '}
                  <span className="text-lg text-slate-500 dark:text-slate-400 font-normal">L</span>
                </p>
                <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold mt-1">↑ High Industry Benchmark</span>
              </div>

              <div className="glass-card p-6 rounded-2xl flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group">
                <div className="bg-gradient-to-br from-amber-500/10 to-yellow-500/10 p-3 rounded-xl mb-4 border border-amber-500/10 group-hover:scale-110 transition-transform duration-300">
                  <Zap className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
                <h3 className="text-slate-500 dark:text-slate-400 font-medium text-sm">Energy Saved</h3>
                <p className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-2">
                  {metrics?.total_energy_saved_kwh || 0}{' '}
                  <span className="text-lg text-slate-500 dark:text-slate-400 font-normal">kWh</span>
                </p>
                <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold mt-1">↑ Resource Recovery</span>
              </div>

              <div className="glass-card p-6 rounded-2xl flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group">
                <div className="bg-gradient-to-br from-purple-500/10 to-indigo-500/10 p-3 rounded-xl mb-4 border border-purple-500/10 group-hover:scale-110 transition-transform duration-300">
                  <Recycle className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-slate-500 dark:text-slate-400 font-medium text-sm">Landfill Diverted</h3>
                <p className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-2">
                  {metrics?.total_landfill_diverted_kg || 0}{' '}
                  <span className="text-lg text-slate-500 dark:text-slate-400 font-normal">kg</span>
                </p>
                <span className="text-xs text-purple-600 dark:text-purple-400 font-semibold mt-1">
                  Rate: {metrics?.waste_diversion_rate || '94.5%'}
                </span>
              </div>
            </div>

            <div className="glass-card p-6 rounded-2xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-amber-500/10 to-yellow-500/10">
                  <Award className="text-amber-500 w-5 h-5" />
                </div>
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Overall Circularity Score (Weighted Model — Module 9)
                </h2>
              </div>

              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-center md:text-left">
                  <span className="text-5xl font-extrabold text-transparent bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text">{avgScore}</span>
                  <span className="text-2xl text-slate-400 dark:text-slate-500"> / 100</span>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    Category: <strong className="text-emerald-600 dark:text-emerald-400">{category}</strong>
                  </p>
                </div>

                <div className="w-full md:w-2/3 space-y-3">
                  <div>
                    <div className="flex justify-between text-xs text-gray-600 dark:text-slate-400 mb-1">
                      <span>Material Recyclability (Weight: 35%)</span>
                      <span className="font-semibold">{avgScore}%</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-slate-700 h-2 rounded-full">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${avgScore}%` }}
                      />
                    </div>
                  </div>

                  <p className="text-xs text-gray-400 dark:text-slate-500 italic pt-2">
                    Detailed sub-metric breakdown (Condition, Reuse Potential, Environmental Benefit,
                    Processing Feasibility) is calculated per-item during AI scanning — average shown
                    above reflects the overall weighted circularity score across all logged inventory.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}