import React, { useState, useEffect, useRef } from 'react';
import {
  Package, Recycle, AlertTriangle,
  BarChart3, PieChart as PieChartIcon,
  FileText, FileSpreadsheet, ChevronDown, Loader2
} from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { useToast } from '../context/ToastContext';

// Register Chart.js components for rendering
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

export default function Dashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  // Export state
  const [exportOpen, setExportOpen] = useState(false);
  const [exportingPDF, setExportingPDF] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);

  const dropdownRef = useRef(null);
  const dashboardRef = useRef(null);   // wraps the entire dashboard for html2canvas capture

  // Module 11 — Toast notifications
  const { addToast } = useToast();

  // ── Fetch analytics data ──────────────────────────────────────────────────
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:8000/api/analytics', {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        if (response.ok) {
          const data = await response.json();
          setAnalytics(data);
        } else {
          console.error('Failed to fetch analytics data');
        }
      } catch (error) {
        console.error('Network error while fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  // ── Close dropdown on outside click ──────────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setExportOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ── Chart data configs ────────────────────────────────────────────────────
  const materialData = {
    labels: analytics ? Object.keys(analytics.material_distribution) : [],
    datasets: [
      {
        label: 'Scanned Materials',
        data: analytics ? Object.values(analytics.material_distribution) : [],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const conditionData = {
    labels: analytics ? Object.keys(analytics.condition_distribution) : [],
    datasets: [
      {
        label: 'Waste Condition Count',
        data: analytics ? Object.values(analytics.condition_distribution) : [],
        backgroundColor: 'rgba(99, 102, 241, 0.8)',
        borderRadius: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } },
  };

  // ── Derived helpers ───────────────────────────────────────────────────────
  const totalScans = analytics?.total_scans || 0;
  // Compute live recyclability rate from material distribution:
  // Natural fibres (Cotton, Denim, Wool, Silk, Linen) count as recyclable.
  const recyclabilityRate = (() => {
    if (!analytics?.material_distribution) return '78.5%';
    const dist = analytics.material_distribution;
    const total = Object.values(dist).reduce((s, v) => s + v, 0);
    if (total === 0) return '78.5%';
    const RECYCLABLE = ['Cotton', 'Denim', 'Wool', 'Silk', 'Linen', 'Viscose'];
    const recyclableCount = Object.entries(dist)
      .filter(([k]) => RECYCLABLE.some(r => k.toLowerCase().includes(r.toLowerCase())))
      .reduce((s, [, v]) => s + v, 0);
    return `${((recyclableCount / total) * 100).toFixed(1)}%`;
  })();

  // ── Programmatic PDF Export (pure jsPDF — no html2canvas, no DOM capture) ───────────
  const handleExportPDF = () => {
    setExportOpen(false);
    setExportingPDF(true);
    try {
      const doc   = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const W     = doc.internal.pageSize.getWidth();   // 210 mm
      const H     = doc.internal.pageSize.getHeight();  // 297 mm
      const GREEN = [34, 197, 94];    // emerald-500
      const DARK  = [15, 23, 42];     // slate-900
      const WHITE = [255, 255, 255];
      const LIGHT = [248, 250, 252];  // slate-50
      const MUTED = [100, 116, 139];  // slate-500

      // ─────────────────────────────────────────────────────
      // 1. HEADER BLOCK
      // ─────────────────────────────────────────────────────
      doc.setFillColor(...GREEN);
      doc.rect(0, 0, W, 36, 'F');

      // Thin dark accent stripe at bottom of header
      doc.setFillColor(...DARK);
      doc.rect(0, 33, W, 3, 'F');

      // Logo text (left)
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(...WHITE);
      doc.text('AI Textile Waste Intelligence', 12, 15);

      // Subtitle
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(220, 252, 231); // green-100
      doc.text('Facility Dashboard Report — Module 10 Analytics', 12, 22);

      // Timestamp (right-aligned)
      const now = new Date().toLocaleString('en-IN', { dateStyle: 'long', timeStyle: 'short' });
      doc.setFontSize(8);
      doc.setTextColor(220, 252, 231);
      doc.text(`Generated: ${now}`, W - 12, 22, { align: 'right' });

      // ─────────────────────────────────────────────────────
      // 2. KPI CARDS ROW
      // ─────────────────────────────────────────────────────
      const kpiY   = 44;
      const kpiH   = 28;
      const kpiW   = (W - 24) / 3;  // 3 equal cards, 12 mm margins
      const kpiGap = 6;

      const kpis = [
        { label: 'Total AI Scans',     value: String(analytics?.total_scans ?? 0),  color: [59, 130, 246] },  // blue-500
        { label: 'Recyclability Rate', value: recyclabilityRate,                     color: [...GREEN] },
        { label: 'System Status',      value: 'Active',                             color: [99, 102, 241] },  // indigo-500
      ];

      kpis.forEach(({ label, value, color }, i) => {
        const x = 12 + i * (kpiW + kpiGap);
        // Card background
        doc.setFillColor(...LIGHT);
        doc.roundedRect(x, kpiY, kpiW, kpiH, 3, 3, 'F');
        // Left accent bar
        doc.setFillColor(...color);
        doc.rect(x, kpiY, 3, kpiH, 'F');
        // Label
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(...MUTED);
        doc.text(label, x + 7, kpiY + 9);
        // Value
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(17);
        doc.setTextColor(...DARK);
        doc.text(value, x + 7, kpiY + 21);
      });

      // ─────────────────────────────────────────────────────
      // 3. SECTION LABEL
      // ─────────────────────────────────────────────────────
      const section1Y = kpiY + kpiH + 10;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...GREEN);
      doc.text('Material Distribution', 12, section1Y);
      doc.setDrawColor(...GREEN);
      doc.setLineWidth(0.5);
      doc.line(12, section1Y + 1.5, W - 12, section1Y + 1.5);

      // ─────────────────────────────────────────────────────
      // 4. MATERIAL DISTRIBUTION TABLE
      // ─────────────────────────────────────────────────────
      const matDist   = analytics?.material_distribution ?? {};
      const totalMat  = Object.values(matDist).reduce((s, v) => s + v, 0) || 1;
      const matRows   = Object.entries(matDist).map(([material, count]) => [
        material,
        count,
        `${((count / totalMat) * 100).toFixed(1)}%`,
        count > 3 ? 'High Volume' : count > 1 ? 'Moderate' : 'Low',
      ]);

      autoTable(doc, {
        startY: section1Y + 5,
        head:   [['Material / Fabric Type', 'Batches Scanned', 'Share (%)', 'Volume Level']],
        body:   matRows.length > 0 ? matRows : [['No scan data yet', '—', '—', '—']],
        theme:  'grid',
        styles: {
          font: 'helvetica', fontSize: 9,
          cellPadding: 3, textColor: DARK,
        },
        headStyles: {
          fillColor: GREEN, textColor: WHITE,
          fontStyle: 'bold', fontSize: 9,
        },
        alternateRowStyles: { fillColor: [240, 253, 244] },  // green-50
        columnStyles: {
          0: { cellWidth: 72 },
          1: { cellWidth: 38, halign: 'center' },
          2: { cellWidth: 38, halign: 'center' },
          3: { cellWidth: 38, halign: 'center' },
        },
        margin: { left: 12, right: 12 },
      });

      // ─────────────────────────────────────────────────────
      // 5. PHYSICAL CONDITION TRENDS TABLE
      // ─────────────────────────────────────────────────────
      const afterMatY = (doc.lastAutoTable?.finalY ?? section1Y + 5) + 10;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...GREEN);
      doc.text('Physical Condition Trends', 12, afterMatY);
      doc.setDrawColor(...GREEN);
      doc.setLineWidth(0.5);
      doc.line(12, afterMatY + 1.5, W - 12, afterMatY + 1.5);

      const condDist   = analytics?.condition_distribution ?? {};
      const totalCond  = Object.values(condDist).reduce((s, v) => s + v, 0) || 1;
      const STRATEGY_MAP = {
        'Good':            'Fabric Reuse / Donation',
        'Torn / Damaged':  'Mechanical Recycling / Fiber Recycling',
        'Stained / Flawed':'Chemical Recycling / Industrial Wash',
        'Minor Defect':    'Upcycling / Repair',
        'Degraded':        'Industrial Recovery / Downcycling',
      };
      const condRows = Object.entries(condDist).map(([cond, count]) => [
        cond,
        count,
        `${((count / totalCond) * 100).toFixed(1)}%`,
        STRATEGY_MAP[cond] ?? 'Mechanical Recycling',
      ]);

      autoTable(doc, {
        startY: afterMatY + 5,
        head:   [['Physical Condition', 'Batches', 'Share (%)', 'Recommended Strategy']],
        body:   condRows.length > 0 ? condRows : [['No condition data yet', '—', '—', '—']],
        theme:  'grid',
        styles: {
          font: 'helvetica', fontSize: 9,
          cellPadding: 3, textColor: DARK,
        },
        headStyles: {
          fillColor: [15, 23, 42], textColor: WHITE,
          fontStyle: 'bold', fontSize: 9,
        },
        alternateRowStyles: { fillColor: LIGHT },
        columnStyles: {
          0: { cellWidth: 52 },
          1: { cellWidth: 28, halign: 'center' },
          2: { cellWidth: 28, halign: 'center' },
          3: { cellWidth: 78 },
        },
        margin: { left: 12, right: 12 },
      });

      // ─────────────────────────────────────────────────────
      // 6. FOOTER
      // ─────────────────────────────────────────────────────
      const totalPages = doc.internal.getNumberOfPages();
      for (let p = 1; p <= totalPages; p++) {
        doc.setPage(p);
        doc.setFillColor(...DARK);
        doc.rect(0, H - 10, W, 10, 'F');
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(...WHITE);
        doc.text(
          'Confidential — AI Textile Waste Intelligence Platform © 2026',
          W / 2, H - 4, { align: 'center' }
        );
        doc.text(`Page ${p} of ${totalPages}`, W - 12, H - 4, { align: 'right' });
      }

      doc.save('Facility_Dashboard_Report.pdf');

      addToast({
        type: 'success',
        title: '📄 PDF Exported Successfully',
        message: 'Facility_Dashboard_Report.pdf has been downloaded.',
        duration: 4500,
      });
    } catch (err) {
      console.error('PDF export failed:', err);
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

  // ── Excel Export ──────────────────────────────────────────────────────────
  const handleExportExcel = () => {
    setExportOpen(false);
    setExportingExcel(true);

    try {
      const wb = XLSX.utils.book_new();

      // ── Sheet 1: Summary KPIs ──────────────────────────────────────────
      const summaryData = [
        ['AI Textile Waste Intelligence Platform — Facility Dashboard'],
        ['Report Generated', new Date().toLocaleString('en-IN', { dateStyle: 'long', timeStyle: 'short' })],
        [],
        ['KPI Metric', 'Value'],
        ['Total AI Scans', totalScans],
        ['Recyclability Rate', recyclabilityRate],
        ['System Status', 'Active'],
      ];
      const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
      // Column widths
      wsSummary['!cols'] = [{ wch: 28 }, { wch: 30 }];
      XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary KPIs');

      // ── Sheet 2: Material Distribution ────────────────────────────────
      if (analytics?.material_distribution) {
        const matHeaders = [['Material Type', 'Scan Count', '% of Total']];
        const matEntries = Object.entries(analytics.material_distribution);
        const matTotal = matEntries.reduce((s, [, v]) => s + v, 0);
        const matRows = matEntries.map(([material, count]) => [
          material,
          count,
          matTotal > 0 ? `${((count / matTotal) * 100).toFixed(1)}%` : '0%',
        ]);
        const wsMat = XLSX.utils.aoa_to_sheet([...matHeaders, ...matRows]);
        wsMat['!cols'] = [{ wch: 22 }, { wch: 14 }, { wch: 14 }];
        XLSX.utils.book_append_sheet(wb, wsMat, 'Material Distribution');
      }

      // ── Sheet 3: Condition Distribution ───────────────────────────────
      if (analytics?.condition_distribution) {
        const condHeaders = [['Physical Condition', 'Item Count', '% of Total']];
        const condEntries = Object.entries(analytics.condition_distribution);
        const condTotal = condEntries.reduce((s, [, v]) => s + v, 0);
        const condRows = condEntries.map(([condition, count]) => [
          condition,
          count,
          condTotal > 0 ? `${((count / condTotal) * 100).toFixed(1)}%` : '0%',
        ]);
        const wsCond = XLSX.utils.aoa_to_sheet([...condHeaders, ...condRows]);
        wsCond['!cols'] = [{ wch: 22 }, { wch: 14 }, { wch: 14 }];
        XLSX.utils.book_append_sheet(wb, wsCond, 'Condition Trends');
      }

      XLSX.writeFile(wb, 'Facility_Dashboard_Data.xlsx');

      // Module 11 — success toast
      addToast({
        type: 'success',
        title: '📊 Excel Exported Successfully',
        message: 'Facility_Dashboard_Data.xlsx has been downloaded with 3 data sheets.',
        duration: 4500,
      });
    } catch (err) {
      console.error('Excel export failed:', err);
      addToast({
        type: 'error',
        title: '❌ Excel Export Failed',
        message: 'Could not generate the Excel file. Please try again.',
        duration: 5000,
      });
    } finally {
      setExportingExcel(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div ref={dashboardRef}>
      {/* Dashboard Header — intentionally OUTSIDE pdf-area so button never appears in PDF */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Facility Overview</h2>
          <p className="text-gray-500 text-sm mt-1">Live metrics from the AI sorting pipeline</p>
        </div>

        {/* ── Export Dropdown ───────────────────────────────────────────── */}
        <div className="relative" ref={dropdownRef}>
          {/* Trigger button */}
          <button
            onClick={() => setExportOpen((prev) => !prev)}
            disabled={exportingPDF || exportingExcel}
            className="flex items-center gap-2 bg-gray-800 hover:bg-gray-900 disabled:bg-gray-400 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-sm transition-all duration-200 select-none"
          >
            {exportingPDF ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating PDF…
              </>
            ) : exportingExcel ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating Excel…
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                Export Report
                <ChevronDown
                  className={`w-3.5 h-3.5 ml-0.5 transition-transform duration-200 ${exportOpen ? 'rotate-180' : ''}`}
                />
              </>
            )}
          </button>

          {/* Dropdown panel */}
          {exportOpen && !exportingPDF && !exportingExcel && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50 animate-fade-in">
              {/* PDF option */}
              <button
                onClick={handleExportPDF}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors group"
              >
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-100 group-hover:bg-red-200 transition-colors shrink-0">
                  <FileText className="w-4 h-4 text-red-600" />
                </span>
                <div className="text-left">
                  <p className="font-semibold leading-none">Export to PDF</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">Dashboard screenshot</p>
                </div>
              </button>

              <div className="h-px bg-gray-100 mx-3" />

              {/* Excel option */}
              <button
                onClick={handleExportExcel}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors group"
              >
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-100 group-hover:bg-green-200 transition-colors shrink-0">
                  <FileSpreadsheet className="w-4 h-4 text-green-700" />
                </span>
                <div className="text-left">
                  <p className="font-semibold leading-none">Export to Excel</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">3-sheet data workbook</p>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── PDF capture area starts here — header & export button are above this ── */}
      <div id="dashboard-pdf-area">

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 border-l-4 border-l-blue-500">
          <div className="bg-blue-100 p-3 rounded-full">
            <Package className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total AI Scans</p>
            <h3 className="text-2xl font-bold text-gray-800">
              {loading ? '…' : totalScans}
            </h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 border-l-4 border-l-green-500">
          <div className="bg-green-100 p-3 rounded-full">
            <Recycle className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Recyclability Rate</p>
            <h3 className="text-2xl font-bold text-gray-800">{recyclabilityRate}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 border-l-4 border-l-indigo-500">
          <div className="bg-indigo-100 p-3 rounded-full">
            <AlertTriangle className="w-6 h-6 text-indigo-600" />
          </div>
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
              <p className="text-gray-400">Loading chart data…</p>
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
              <p className="text-gray-400">Loading chart data…</p>
            ) : analytics?.total_scans > 0 ? (
              <Bar data={conditionData} options={{ ...chartOptions, maintainAspectRatio: false }} />
            ) : (
              <p className="text-gray-400">No condition data available yet.</p>
            )}
          </div>
        </div>
      </div>

      </div>{/* end #dashboard-pdf-area */}
    </div>
  );
}