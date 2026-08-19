import React, { useEffect, useState } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  Leaf, RefreshCw, Loader2, Layers, Thermometer,
  Award, AlertCircle, CheckCircle2, Recycle, PackageSearch, FileText
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

// ─────────────────────────────────────────────────────────────────────────────
// Score colour helpers — used for both the pill and the progress bar
// ─────────────────────────────────────────────────────────────────────────────
const getScoreTheme = (score) => {
  if (score >= 85) return {
    bar:   '#10b981',   // emerald-500
    pill:  'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    ring:  'text-emerald-500',
    badge: 'bg-emerald-600',
  };
  if (score >= 70) return {
    bar:   '#3b82f6',   // blue-500
    pill:  'bg-blue-500/15 text-blue-400 border-blue-500/30',
    ring:  'text-blue-500',
    badge: 'bg-blue-600',
  };
  if (score >= 55) return {
    bar:   '#f59e0b',   // amber-500
    pill:  'bg-amber-500/15 text-amber-400 border-amber-500/30',
    ring:  'text-amber-500',
    badge: 'bg-amber-600',
  };
  return {
    bar:   '#ef4444',   // red-500
    pill:  'bg-rose-500/15 text-rose-400 border-rose-500/30',
    ring:  'text-rose-500',
    badge: 'bg-rose-600',
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// Condition icon helper
// ─────────────────────────────────────────────────────────────────────────────
const ConditionBadge = ({ condition }) => {
  const c = (condition || '').toLowerCase();
  if (c === 'good') return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
      <CheckCircle2 className="w-3 h-3" /> {condition}
    </span>
  );
  if (c.includes('torn') || c.includes('damage') || c.includes('flawed')) return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 rounded-full">
      <AlertCircle className="w-3 h-3" /> {condition}
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full">
      <Thermometer className="w-3 h-3" /> {condition}
    </span>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Individual Inventory Card
// ─────────────────────────────────────────────────────────────────────────────
function SustainabilityCard({ item }) {
  const score  = Number(item.circularity_score || 0);
  const theme  = getScoreTheme(score);
  const cat    = item.circularity_category || 'Uncategorised';

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-700/50 shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 flex flex-col overflow-hidden">

      {/* ── Card header: Batch ID badge + Fabric type ── */}
      <div className="px-5 pt-5 pb-4 flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-0.5">Fabric</p>
          <p className="text-lg font-extrabold text-white truncate flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-emerald-400 shrink-0" />
            {item.fabric_type || 'Unknown'}
          </p>
        </div>

        {/* Batch ID corner badge */}
        <span className={`shrink-0 text-[10px] font-extrabold text-white px-2.5 py-1 rounded-lg ${theme.badge}`}>
          #{item.batch_id}
        </span>
      </div>

      {/* ── Divider ── */}
      <div className="mx-5 border-t border-slate-800" />

      {/* ── Meta row: condition + source + qty ── */}
      <div className="px-5 py-3 flex flex-wrap gap-2 items-center">
        <ConditionBadge condition={item.condition} />
        {item.source && (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-300 bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-full">
            <Recycle className="w-3 h-3 text-slate-400" /> {item.source}
          </span>
        )}
        {item.quantity_kg && (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-300 bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-full">
            {item.quantity_kg} kg
          </span>
        )}
      </div>

      {/* ── Circularity Score bar section ── */}
      <div className="px-5 pb-4 space-y-2 flex-1">
        <div className="flex justify-between items-center">
          <span className="text-xs font-semibold text-slate-400">Circularity Score</span>
          <span className="text-sm font-extrabold text-white">{score.toFixed(1)}<span className="text-slate-500 font-normal text-xs">/100</span></span>
        </div>
        {/* Progress bar */}
        <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${score}%`, backgroundColor: theme.bar }}
          />
        </div>
        {/* Score ticks */}
        <div className="flex justify-between text-[9px] text-slate-500 font-medium px-0.5">
          <span>0</span><span>25</span><span>50</span><span>75</span><span>100</span>
        </div>
      </div>

      {/* ── Footer: Category pill ── */}
      <div className="px-5 pb-5">
        <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border ${theme.pill}`}>
          <Award className="w-3 h-3" />
          {cat}
        </span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Score Summary Stats bar
// ─────────────────────────────────────────────────────────────────────────────
function StatBar({ items }) {
  const total   = items.length;
  const avgScore = total > 0
    ? (items.reduce((s, i) => s + Number(i.circularity_score || 0), 0) / total).toFixed(1)
    : 0;
  const excellent = items.filter(i => Number(i.circularity_score) >= 85).length;
  const low       = items.filter(i => Number(i.circularity_score) < 55).length;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {[
        { label: 'Total Batches',   value: total,        color: 'text-slate-100' },
        { label: 'Avg Circularity', value: `${avgScore}`, color: 'text-emerald-400' },
        { label: 'High Recovery',   value: excellent,    color: 'text-blue-400' },
        { label: 'Low Priority',    value: low,          color: 'text-rose-400' },
      ].map(({ label, value, color }) => (
        <div key={label} className="bg-slate-900 border border-slate-700/50 rounded-xl px-4 py-3.5 shadow-sm">
          <p className={`text-2xl font-extrabold ${color}`}>{value}</p>
          <p className="text-xs text-slate-400 font-medium mt-0.5">{label}</p>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE COMPONENT — Sustainability Manager
// ─────────────────────────────────────────────────────────────────────────────
export default function SustainabilityDataset() {
  const [items, setItems]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [sortBy, setSortBy]         = useState('score_desc');
  const [search, setSearch]         = useState('');
  const [exportingPDF, setExportingPDF] = useState(false);

  const { addToast } = useToast();

  const fetchData = () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    axios.get('http://localhost:8000/api/inventory', {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then(res => setItems(res.data))
      .catch(err => console.error('Error fetching inventory:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  // ── Programmatic PDF Export (pure jsPDF + autoTable) ───────────────────────
  const handleExportPDF = () => {
    if (items.length === 0) return;
    setExportingPDF(true);
    try {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const W = doc.internal.pageSize.getWidth();
      const H = doc.internal.pageSize.getHeight();
      
      const GREEN = [16, 185, 129];
      const DARK = [15, 23, 42];
      const WHITE = [255, 255, 255];
      const LIGHT = [248, 250, 252];
      const MUTED = [100, 116, 139];

      // Header
      doc.setFillColor(...GREEN);
      doc.rect(0, 0, W, 36, 'F');
      doc.setFillColor(...DARK);
      doc.rect(0, 33, W, 3, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(...WHITE);
      doc.text('Sustainability Manager - Circular Economy Report', 12, 15);

      const now = new Date().toLocaleString('en-IN', { dateStyle: 'long', timeStyle: 'short' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(209, 250, 229);
      doc.text(`Generated: ${now}`, 12, 22);

      // KPIs
      const total = items.length;
      const avgScore = total > 0 ? (items.reduce((s, i) => s + Number(i.circularity_score || 0), 0) / total).toFixed(1) : 0;
      const excellent = items.filter(i => Number(i.circularity_score) >= 85).length;
      const low = items.filter(i => Number(i.circularity_score) < 55).length;

      const kpiY = 44;
      const kpiH = 26;
      const kpiW = (W - 24) / 4;
      
      const kpis = [
        { label: 'Total Batches', value: `${total}`, color: [59, 130, 246] },
        { label: 'Avg Circularity', value: `${avgScore}`, color: [16, 185, 129] },
        { label: 'High Recovery', value: `${excellent}`, color: [37, 99, 235] },
        { label: 'Low Priority', value: `${low}`, color: [239, 68, 68] },
      ];

      kpis.forEach(({ label, value, color }, i) => {
        const x = 12 + i * kpiW;
        doc.setFillColor(...LIGHT);
        doc.roundedRect(x, kpiY, kpiW - 4, kpiH, 3, 3, 'F');
        doc.setFillColor(...color);
        doc.rect(x, kpiY, 3, kpiH, 'F');
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(...MUTED);
        doc.text(label, x + 7, kpiY + 9);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(15);
        doc.setTextColor(...DARK);
        doc.text(value, x + 7, kpiY + 20);
      });

      // Data Table
      const tableStartY = kpiY + kpiH + 10;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...GREEN);
      doc.text('Inventory Circularity Data', 12, tableStartY);
      doc.setDrawColor(...GREEN);
      doc.setLineWidth(0.5);
      doc.line(12, tableStartY + 1.5, W - 12, tableStartY + 1.5);

      const tableRows = items.map(i => [
        `#${i.batch_id}`,
        i.fabric_type || 'Unknown',
        i.condition || 'N/A',
        `${Number(i.circularity_score || 0).toFixed(1)} / 100`,
        i.circularity_category || 'Uncategorised'
      ]);

      autoTable(doc, {
        startY: tableStartY + 5,
        head: [['Batch ID', 'Fabric', 'Condition', 'Circularity Score', 'Recovery Potential']],
        body: tableRows.length > 0 ? tableRows : [['No items found', '', '', '', '']],
        theme: 'grid',
        styles: { font: 'helvetica', fontSize: 9, cellPadding: 3, textColor: DARK },
        headStyles: { fillColor: GREEN, textColor: WHITE, fontStyle: 'bold', fontSize: 9 },
        alternateRowStyles: { fillColor: [240, 253, 244] },
        margin: { left: 12, right: 12 },
      });

      // Footer
      const totalPages = doc.internal.getNumberOfPages();
      for (let p = 1; p <= totalPages; p++) {
        doc.setPage(p);
        doc.setFillColor(...DARK);
        doc.rect(0, H - 10, W, 10, 'F');
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...WHITE);
        doc.text('Confidential — AI Textile Waste Intelligence Platform © 2026', W / 2, H - 4, { align: 'center' });
        doc.text(`Page ${p} of ${totalPages}`, W - 12, H - 4, { align: 'right' });
      }

      doc.save('Sustainability_Report.pdf');

      addToast({
        type: 'success',
        title: '📄 Report Exported',
        message: 'Sustainability_Report.pdf downloaded successfully.',
        duration: 4500,
      });
    } catch (err) {
      console.error('Sustainability PDF export failed:', err);
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

  // ── Filter + Sort ────────────────────────────────────────────────────────
  const processed = items
    .filter(i =>
      !search ||
      (i.fabric_type || '').toLowerCase().includes(search.toLowerCase()) ||
      (i.circularity_category || '').toLowerCase().includes(search.toLowerCase()) ||
      String(i.batch_id).includes(search)
    )
    .sort((a, b) => {
      if (sortBy === 'score_desc') return Number(b.circularity_score || 0) - Number(a.circularity_score || 0);
      if (sortBy === 'score_asc')  return Number(a.circularity_score || 0) - Number(b.circularity_score || 0);
      if (sortBy === 'id_asc')     return Number(a.batch_id) - Number(b.batch_id);
      if (sortBy === 'fabric')     return (a.fabric_type || '').localeCompare(b.fabric_type || '');
      return 0;
    });

  return (
    <div className="space-y-6 pb-8">

      {/* ═══ PAGE HEADER ════════════════════════════════════════════════════ */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Leaf className="w-6 h-6 text-emerald-500" />
            Sustainability Manager
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Circular economy scoring for every textile batch in your inventory
          </p>
        </div>

        {/* Header actions: Refresh + Export PDF */}
        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-slate-800 border border-slate-700 text-slate-200 rounded-xl hover:bg-slate-700 shadow-sm transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>

          <button
            onClick={handleExportPDF}
            disabled={exportingPDF || loading || items.length === 0}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-900/50 disabled:text-emerald-400 disabled:cursor-not-allowed text-white rounded-xl shadow-sm transition-all duration-200"
          >
            {exportingPDF ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</>
            ) : (
              <><FileText className="w-4 h-4" /> Export PDF</>
            )}
          </button>
        </div>
      </div>

      {/* ═══ CAPTURED CONTENT: everything below enters the PDF ════════════ */}
      <div id="sustainability-report-content" className="space-y-6">

      {/* ═══ STAT BAR ═══════════════════════════════════════════════════════ */}
      {!loading && items.length > 0 && <StatBar items={items} />}

      {/* ═══ FILTER + SORT TOOLBAR ══════════════════════════════════════════ */}
      {!loading && items.length > 0 && (
        <div className="flex flex-wrap gap-3 items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-48">
            <PackageSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search fabric, category, or batch ID…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-700 rounded-xl bg-slate-900 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>
          {/* Sort */}
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-700 rounded-xl bg-slate-900 text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer"
          >
            <option value="score_desc" className="bg-slate-900 text-slate-200">Score: High → Low</option>
            <option value="score_asc" className="bg-slate-900 text-slate-200">Score: Low → High</option>
            <option value="id_asc" className="bg-slate-900 text-slate-200">Batch ID</option>
            <option value="fabric" className="bg-slate-900 text-slate-200">Fabric Type A–Z</option>
          </select>
          <span className="text-xs text-slate-400 font-medium shrink-0">
            {processed.length} of {items.length} batches
          </span>
        </div>
      )}

      {/* ═══ STATES: Loading / Empty / Grid ════════════════════════════════ */}
      {loading ? (
        /* Loading skeleton */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-slate-900 rounded-2xl border border-slate-800 p-5 space-y-4 animate-pulse">
              <div className="flex justify-between">
                <div className="h-5 w-32 bg-slate-800 rounded-lg" />
                <div className="h-5 w-10 bg-slate-800 rounded-lg" />
              </div>
              <div className="h-2.5 w-full bg-slate-800 rounded-full" />
              <div className="h-4 w-24 bg-slate-800 rounded-full" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
          <div className="w-20 h-20 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center">
            <Leaf className="w-10 h-10 text-slate-500" />
          </div>
          <div>
            <p className="text-base font-bold text-slate-300">No inventory data yet</p>
            <p className="text-sm text-slate-400 mt-1">
              Scan or add textile batches in the Inventory Dashboard to see circularity scores here.
            </p>
          </div>
        </div>
      ) : processed.length === 0 ? (
        /* No search results */
        <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
          <PackageSearch className="w-10 h-10 text-slate-500" />
          <p className="text-sm font-semibold text-slate-400">No batches match your search</p>
          <button onClick={() => setSearch('')} className="text-xs text-emerald-400 hover:underline">
            Clear filter
          </button>
        </div>
      ) : (
        /* ── Cards Grid ── */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {processed.map(item => (
            <SustainabilityCard key={item.batch_id} item={item} />
          ))}
        </div>
      )}

      </div>{/* end #sustainability-report-content */}
    </div>
  );
}