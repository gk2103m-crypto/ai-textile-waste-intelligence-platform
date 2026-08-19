import React, { useState, useRef } from 'react';
import jsPDF from 'jspdf';
import {
  UploadCloud, CheckCircle, Loader2, RotateCcw, Clock,
  Leaf, Award, Layers, Download, AlertCircle, X,
  Sparkles, Recycle, FlaskConical, ChevronRight, ImagePlus, BarChart3
} from 'lucide-react';
import { useToast } from '../context/ToastContext'; // Module 11

// ─────────────────────────────────────────────────────────────────────────────
// Material Knowledge Base
// Maps detected_material → fabric class, type, description, common uses
// ─────────────────────────────────────────────────────────────────────────────
const MATERIAL_DB = {
  Cotton:       { fabricClass: 'Natural Fiber',          materialType: 'Cellulosic',            icon: '🌿', description: 'Cotton is a soft, fluffy staple fiber grown from cotton plants. It is breathable, hypoallergenic, and biodegradable — making it one of the most circular natural textile materials available.', commonUses: ['T-Shirts', 'Bedsheets', 'Towels', 'Denim', 'Underwear', 'Baby Clothing', 'Medical Gauze'] },
  Denim:        { fabricClass: 'Natural Fiber Weave',    materialType: 'Cotton-Based',          icon: '🎽', description: 'Denim is a sturdy cotton warp-faced textile in a twill pattern. Highly durable and widely associated with casualwear — one of the most recycled textiles globally.', commonUses: ['Jeans', 'Jackets', 'Skirts', 'Overalls', 'Bags', 'Upholstery'] },
  Polyester:    { fabricClass: 'Synthetic Fiber',        materialType: 'Thermoplastic Polymer', icon: '🔬', description: 'Polyester is a man-made fiber derived from petroleum-based chemicals. It offers high durability and moisture-wicking, but requires chemical recycling for end-of-life recovery.', commonUses: ['Sportswear', 'Outerwear', 'Fleece Jackets', 'Upholstery', 'Carpets', 'rPET Bottles'] },
  Wool:         { fabricClass: 'Natural Protein Fiber',  materialType: 'Keratin-Based',         icon: '🐑', description: 'Wool is a natural protein fiber obtained from sheep. It has exceptional thermal insulation, moisture management, and is fully biodegradable with high recovery value.', commonUses: ['Winter Coats', 'Sweaters', 'Blankets', 'Carpets', 'Socks', 'Suits'] },
  Silk:         { fabricClass: 'Natural Protein Fiber',  materialType: 'Fibroin-Based',         icon: '✨', description: 'Silk is a luxurious natural fiber produced by silkworms. It has a smooth texture, natural sheen, and excellent thermal regulation — valued highly in circular fashion.', commonUses: ['Sarees', 'Ties', 'Lingerie', 'Evening Wear', 'Pillowcases', 'Scarves'] },
  Nylon:        { fabricClass: 'Synthetic Fiber',        materialType: 'Polyamide Polymer',     icon: '⚙️', description: 'Nylon is a strong, elastic synthetic polymer with high abrasion resistance. Used extensively in performance wear and industrial applications — recyclable via chemical processes.', commonUses: ['Stockings', 'Swimwear', 'Parachutes', 'Ropes', 'Luggage', 'Toothbrushes'] },
  Acrylic:      { fabricClass: 'Synthetic Fiber',        materialType: 'Polyacrylonitrile',     icon: '🧪', description: 'Acrylic fiber is a lightweight synthetic material used as a wool substitute. It retains color well but is challenging to recycle — prioritize mechanical recovery paths.', commonUses: ['Sweaters', 'Knit Caps', 'Socks', 'Fleece Blankets', 'Craft Yarn'] },
  Linen:        { fabricClass: 'Natural Bast Fiber',     materialType: 'Cellulosic',            icon: '🌾', description: 'Linen is derived from the flax plant — one of the oldest known textiles. Stronger than cotton, naturally hypoallergenic, fully biodegradable and compostable.', commonUses: ['Summer Shirts', 'Tablecloths', 'Bed Linen', 'Curtains', 'Towels', 'Bags'] },
  Velvet:       { fabricClass: 'Cut Pile Fabric',        materialType: 'Mixed Fiber',           icon: '🎭', description: 'Velvet is a tufted woven fabric with a dense, short pile that reflects light. Often made from silk or synthetic fibers — recovery depends on fiber composition.', commonUses: ['Evening Wear', 'Upholstery', 'Curtains', 'Costumes', 'Pillows'] },
  Viscose:      { fabricClass: 'Semi-Synthetic Fiber',   materialType: 'Regenerated Cellulosic',icon: '🌀', description: 'Viscose (Rayon) is a regenerated cellulosic fiber made from wood pulp. It is soft and breathable but less durable than cotton — best managed via industrial composting.', commonUses: ['Blouses', 'Dresses', 'Linings', 'Scarves', 'Sportswear'] },
  Blended:      { fabricClass: 'Mixed Fiber Blend',      materialType: 'Multi-Fiber',           icon: '🔀', description: 'Blended fabrics combine two or more fiber types to achieve enhanced performance characteristics. Recycling blended textiles requires fiber separation technologies.', commonUses: ['Workwear', 'Casual Wear', 'Sportswear', 'Home Textiles', 'Industrial Fabrics'] },
};

const getMaterialInfo = (material) => {
  if (!material) return null;
  const exact = MATERIAL_DB[material];
  if (exact) return exact;
  const fuzzyKey = Object.keys(MATERIAL_DB).find(k =>
    material.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(material.toLowerCase())
  );
  return fuzzyKey ? MATERIAL_DB[fuzzyKey] : {
    fabricClass: 'Classified Textile',
    materialType: 'AI-Identified Fiber',
    icon: '🧵',
    description: `${material} is a textile fiber identified by the AI vision engine through deep analysis of surface texture, weave pattern, and spectral fiber characteristics.`,
    commonUses: ['Apparel', 'Home Textiles', 'Industrial Use', 'Technical Fabrics'],
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// SVG Circular Gauge — used for Confidence Score and Circularity Score
// ─────────────────────────────────────────────────────────────────────────────
function CircleGauge({ value = 0, max = 100, size = 140, strokeWidth = 12, color = '#10b981', trackColor, centerLabel = '', subLabel = '' }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedValue = Math.min(Number(value) || 0, max);
  const dashOffset = circumference - (clampedValue / max) * circumference;
  const cx = size / 2;
  const cy = size / 2;

  return (
    <svg width={size} height={size} style={{ overflow: 'visible' }}>
      {/* Track ring */}
      <circle cx={cx} cy={cy} r={radius} fill="none" stroke={trackColor || undefined} className={trackColor ? '' : 'stroke-slate-200 dark:stroke-slate-700'} strokeWidth={strokeWidth} />
      {/* Progress ring */}
      <circle
        cx={cx} cy={cy} r={radius} fill="none"
        stroke={color} strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={dashOffset}
        strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`}
        style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)' }}
      />
      {/* Center value */}
      <text x="50%" y={subLabel ? '44%' : '50%'} dominantBaseline="middle" textAnchor="middle"
        className="fill-slate-900 dark:fill-slate-100"
        style={{ fontSize: size >= 130 ? '1.4rem' : '1.1rem', fontWeight: 800, fontFamily: 'inherit' }}>
        {centerLabel || clampedValue}
      </text>
      {/* Sub label */}
      {subLabel && (
        <text x="50%" y="62%" dominantBaseline="middle" textAnchor="middle"
          className="fill-slate-500 dark:fill-slate-400"
          style={{ fontSize: '0.62rem', fontWeight: 600, fontFamily: 'inherit', letterSpacing: '0.03em' }}>
          {subLabel}
        </text>
      )}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Weighted Score Breakdown Bar
// Shows one of the 5 circularity factors as a labeled progress bar
// ─────────────────────────────────────────────────────────────────────────────
function BreakdownBar({ label, weight, achieved, color = '#10b981' }) {
  const fillPercent = weight > 0 ? Math.round((achieved / weight) * 100) : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">{label}</span>
        <div className="flex items-center gap-1">
          <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{Number(achieved).toFixed(1)}</span>
          <span className="text-xs text-slate-500 dark:text-slate-400">/ {weight}</span>
        </div>
      </div>
      <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width: `${fillPercent}%`,
            backgroundColor: color,
            transition: 'width 0.9s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Pill Badge — for common uses and tags
// ─────────────────────────────────────────────────────────────────────────────
function Pill({ label }) {
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
      {label}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Batch Result Mini-Card
// Shown in the responsive grid after batch analysis completes
// ─────────────────────────────────────────────────────────────────────────────
function BatchResultCard({ item, index }) {
  const confidence = item.result
    ? parseFloat(String(item.result.material_confidence || '0').replace('%', ''))
    : 0;
  const score = item.result ? Number(item.result.circularity_score || 0) : 0;
  const scoreColor =
    score >= 85 ? '#10b981' : score >= 70 ? '#3b82f6' : score >= 55 ? '#f59e0b' : '#ef4444';
  const confColor =
    confidence >= 85 ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' :
    confidence >= 65 ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400' :
                       'bg-rose-500/15 text-rose-600 dark:text-rose-400';

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
      {/* Thumbnail */}
      <div className="relative h-36 bg-slate-100 dark:bg-slate-900 shrink-0">
        <img
          src={item.previewUrl}
          alt={item.fileName}
          className="w-full h-full object-cover"
        />
        {/* Index badge */}
        <span className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">
          #{index + 1}
        </span>
        {/* Error overlay */}
        {item.error && (
          <div className="absolute inset-0 bg-rose-500/20 flex flex-col items-center justify-center gap-1">
            <AlertCircle className="w-7 h-7 text-rose-400" />
            <span className="text-xs font-bold text-rose-300">Failed</span>
          </div>
        )}
        {/* Processing overlay */}
        {item.processing && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex flex-col items-center justify-center gap-1">
            <Loader2 className="w-6 h-6 text-white animate-spin" />
            <span className="text-xs font-semibold text-white">Analyzing…</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 space-y-2.5 flex-1">
        {item.result ? (
          <>
            {/* Material name */}
            <div>
              <p className="text-sm font-extrabold text-slate-900 dark:text-slate-100 truncate">
                {item.result.detected_material || 'Unknown'}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">{item.fileName}</p>
            </div>

            {/* Confidence badge */}
            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${confColor}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              {confidence.toFixed(1)}% confidence
            </span>

            {/* Circularity score mini bar */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Circularity</span>
                <span className="text-[10px] font-extrabold text-slate-800 dark:text-slate-200">{score.toFixed(1)}/100</span>
              </div>
              <div className="h-1.5 bg-slate-200 dark:bg-slate-900 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${score}%`, backgroundColor: scoreColor, transition: 'width 1s ease' }}
                />
              </div>
            </div>

            {/* Strategy chip */}
            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed truncate">
              ♻ {item.result.recommended_strategy || 'Mechanical Recycling'}
            </p>
          </>
        ) : item.error ? (
          <div className="space-y-1">
            <p className="text-xs font-bold text-rose-500 dark:text-rose-400">Analysis Failed</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{item.fileName}</p>
            <p className="text-[10px] text-rose-500 dark:text-rose-300">{item.error}</p>
          </div>
        ) : (
          /* Still queued */
          <div className="flex items-center gap-2 py-2">
            <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
            <span className="text-xs text-slate-500 dark:text-slate-400">Queued…</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Batch Analysis — full multi-file drag-and-drop + sequential API processing
// Module 12: Reports & Export System — Batch Classification
// ─────────────────────────────────────────────────────────────────────────────
function BatchAnalysis({ addToast }) {
  const [batchFiles, setBatchFiles] = useState([]);
  const [batchItems, setBatchItems] = useState([]);  // { previewUrl, fileName, result, error, processing }
  const [batchLoading, setBatchLoading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const batchInputRef = useRef(null);

  const loadFiles = (files) => {
    const arr = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (arr.length === 0) return;
    setBatchFiles(arr);
    // Pre-populate items with queued state (shows thumbnails immediately)
    setBatchItems(arr.map(f => ({
      previewUrl: URL.createObjectURL(f),
      fileName: f.name,
      result: null,
      error: null,
      processing: false,
    })));
    setProgress({ current: 0, total: 0 });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    loadFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleClear = () => {
    setBatchFiles([]);
    setBatchItems([]);
    setProgress({ current: 0, total: 0 });
    if (batchInputRef.current) batchInputRef.current.value = '';
  };

  const handleBatchAnalyze = async () => {
    if (batchFiles.length === 0) return;
    setBatchLoading(true);
    const total = batchFiles.length;
    setProgress({ current: 0, total });

    // Reset all to queued state
    setBatchItems(batchFiles.map((f, i) => ({
      previewUrl: URL.createObjectURL(batchFiles[i]),
      fileName: f.name,
      result: null,
      error: null,
      processing: false,
    })));

    // Sequential processing — avoids overwhelming FastAPI TensorFlow backend
    for (let i = 0; i < batchFiles.length; i++) {
      setProgress({ current: i + 1, total });

      // Mark this card as "processing" with spinner overlay
      setBatchItems(prev =>
        prev.map((item, idx) => idx === i ? { ...item, processing: true } : item)
      );

      const formData = new FormData();
      formData.append('file', batchFiles[i]);
      formData.append('condition', 'Torn');

      try {
        const res = await fetch('http://127.0.0.1:8000/api/inventory/upload', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
          body: formData,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        // Update this card with result
        setBatchItems(prev =>
          prev.map((item, idx) =>
            idx === i ? { ...item, result: data, error: null, processing: false } : item
          )
        );
      } catch (err) {
        setBatchItems(prev =>
          prev.map((item, idx) =>
            idx === i ? { ...item, result: null, error: err.message || 'Failed', processing: false } : item
          )
        );
      }
    }

    setBatchLoading(false);

    // Module 11 — Success: batch complete
    addToast({
      type: 'success',
      title: '🧠 Batch Analysis Complete',
      message: `${total} textile image${total > 1 ? 's' : ''} processed and classified successfully.`,
      duration: 5000,
    });
  };

  const progressPct = progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0;

  return (
    <div className="p-6 space-y-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-500" />
            Batch Textile Analysis
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            Upload multiple images — each is classified by the AI engine sequentially
          </p>
        </div>
        {batchItems.length > 0 && !batchLoading && (
          <button
            onClick={handleClear}
            className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-all"
          >
            <X className="w-3.5 h-3.5" /> Clear All
          </button>
        )}
      </div>

      {/* ── Drag-and-Drop Upload Zone ── */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => !batchLoading && batchInputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 py-10 px-6 text-center
          ${
            isDragging
              ? 'border-emerald-500 bg-emerald-500/10 scale-[1.01]'
              : batchFiles.length > 0
              ? 'border-emerald-500/40 bg-slate-50 dark:bg-slate-800/80'
              : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 hover:border-emerald-500/60 hover:bg-slate-100 dark:hover:bg-slate-800'
          }
          ${batchLoading ? 'pointer-events-none opacity-60' : ''}
        `}
      >
        <input
          ref={batchInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => loadFiles(e.target.files)}
          className="hidden"
        />

        {batchFiles.length > 0 ? (
          <div className="space-y-2">
            <div className="w-12 h-12 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto">
              <CheckCircle className="w-6 h-6 text-emerald-500 dark:text-emerald-400" />
            </div>
            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
              {batchFiles.length} image{batchFiles.length > 1 ? 's' : ''} selected
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400">Drop more to add, or click to replace</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto border border-slate-200 dark:border-slate-700">
              <UploadCloud className="w-7 h-7 text-slate-500 dark:text-slate-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-300">Drop multiple textile images here</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">or click to browse — JPG, PNG, WebP supported</p>
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700">
              <Layers className="w-3.5 h-3.5" /> Select up to 20 images at once
            </span>
          </div>
        )}
      </div>

      {/* ── File list summary chips ── */}
      {batchFiles.length > 0 && !batchLoading && (
        <div className="flex flex-wrap gap-2">
          {batchFiles.map((f, i) => (
            <span key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-[10px] text-slate-700 dark:text-slate-300 font-medium border border-slate-200 dark:border-slate-700 max-w-[180px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 shrink-0" />
              <span className="truncate">{f.name}</span>
              <span className="text-slate-500 dark:text-slate-400 shrink-0">· {(f.size / 1024).toFixed(0)}KB</span>
            </span>
          ))}
        </div>
      )}

      {/* ── Action Button ── */}
      {batchFiles.length > 0 && (
        <button
          onClick={handleBatchAnalyze}
          disabled={batchLoading}
          className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold transition-all ${
            batchLoading
              ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700 cursor-not-allowed'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm shadow-emerald-900/30'
          }`}
        >
          {batchLoading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing batch…</>
          ) : (
            <><BarChart3 className="w-4 h-4" /> Analyze Batch ({batchFiles.length} image{batchFiles.length > 1 ? 's' : ''})</>
          )}
        </button>
      )}

      {/* ── Progress Indicator ── */}
      {batchLoading && progress.total > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Processing {progress.current} of {progress.total} image{progress.total > 1 ? 's' : ''}…
            </span>
            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{progressPct}%</span>
          </div>
          <div className="h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full"
              style={{ width: `${progressPct}%`, transition: 'width 0.4s ease' }}
            />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {progress.total - progress.current} remaining · Each image is sent to the AI engine sequentially
          </p>
        </div>
      )}

      {/* ── Results Grid — cards stream in as each image completes ── */}
      {batchItems.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
              Results
              {batchLoading && (
                <span className="ml-2 text-emerald-600 dark:text-emerald-400 normal-case font-normal">· Live updating…</span>
              )}
            </p>
            {!batchLoading && batchItems.filter(i => i.result).length > 0 && (
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {batchItems.filter(i => i.result).length} / {batchItems.length} classified
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {batchItems.map((item, index) => (
              <BatchResultCard key={index} item={item} index={index} />
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const Analysis = () => {
  const [activeTab, setActiveTab] = useState('single');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewBase64, setPreviewBase64] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [processingTime, setProcessingTime] = useState(null);
  const fileInputRef = useRef(null);

  // Module 11: Notification & Alert System
  const { addToast } = useToast();

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setAnalysisResult(null);
    setProcessingTime(null);
    const reader = new FileReader();
    reader.onloadend = () => setPreviewBase64(reader.result);
    reader.readAsDataURL(file);
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setPreviewBase64(null);
    setAnalysisResult(null);
    setProcessingTime(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    setLoading(true);
    const t0 = performance.now();

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('condition', 'Torn');

    try {
      const response = await fetch('http://127.0.0.1:8000/api/inventory/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: formData,
      });
      if (!response.ok) throw new Error('Analysis Failed');
      const data = await response.json();
      const elapsed = ((performance.now() - t0) / 1000).toFixed(2);
      setAnalysisResult(data);
      setProcessingTime(elapsed);

      // Module 11 — Recycling Opportunity Notification
      addToast({
        type: 'success',
        title: '✅ Analysis Complete',
        message: `${data.detected_material} identified — Circularity Score: ${data.circularity_score}/100`,
        duration: 5000,
      });
    } catch (error) {
      console.error('Error during analysis:', error);
      // Module 11 — Waste Collection Alert
      addToast({
        type: 'error',
        title: '❌ Analysis Failed',
        message: 'Backend connection failed. Check if FastAPI is running and CORS is enabled.',
        duration: 6000,
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadPDFReport = () => {
    if (!analysisResult) return;
    const doc = new jsPDF();
    const currentDateTime = new Date().toLocaleString();
    // Header
    doc.setFontSize(22);
    doc.setTextColor(34, 139, 34);
    doc.text('AI Textile Waste Analysis Report', 20, 20);
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(`Scan Date & Time: ${currentDateTime}`, 20, 30);
    doc.line(20, 35, 190, 35);
    // Core Results
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text(`1. Detected Material: ${analysisResult.detected_material || 'Unknown'}`, 20, 50);
    doc.text(`2. Confidence Score: ${analysisResult.material_confidence || '0%'}`, 20, 60);
    doc.text(`3. Physical Condition: ${analysisResult.detected_condition || 'Unknown'}`, 20, 70);
    doc.text(`4. Defect Detected: ${analysisResult.detected_defect || 'None'}`, 20, 80);
    doc.text(`5. Waste Category: ${analysisResult.waste_category || 'Recyclable'}`, 20, 90);
    doc.text(`6. Circularity / Reusable Score: ${analysisResult.circularity_score || 0}/100`, 20, 100);
    doc.text(`7. Circularity Category: ${analysisResult.circularity_category || 'N/A'}`, 20, 110);
    doc.text(`8. Recommended Strategy: ${analysisResult.recommended_strategy || 'Unknown'}`, 20, 120);
    // GAP-16 FIX: Environmental Impact Section (Module 8)
    doc.setFontSize(12);
    doc.setTextColor(34, 139, 34);
    doc.text('Environmental Impact (Module 7 & 8):', 20, 135);
    doc.line(20, 138, 190, 138);
    doc.setTextColor(0, 0, 0);
    doc.text(`  CO₂ Emissions Saved:  ${analysisResult.co2_savings_kg || 0} kg`, 20, 148);
    doc.text(`  Water Conservation:   ${analysisResult.water_savings_liters || 0} L`, 20, 158);
    doc.text(`  Energy Recovered:     ${analysisResult.energy_savings_kwh || 0} kWh`, 20, 168);
    doc.text(`  Landfill Diverted:    ${analysisResult.landfill_reduction_kg || 0} kg`, 20, 178);
    // Textile Image
    if (previewBase64) {
      try {
        doc.text('Scanned Textile Image:', 20, 192);
        doc.addImage(previewBase64, 'JPEG', 20, 197, 80, 80);
      } catch (err) {
        doc.text('(Image could not be embedded)', 20, 200);
      }
    }
    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('AI Textile Waste Intelligence Platform © 2026 — Confidential', 20, 285);
    doc.save(`AI_Textile_Report_${Date.now()}.pdf`);
  };

  // ── Derived values from analysisResult ────────────────────────────────────
  const confidence = analysisResult
    ? parseFloat(String(analysisResult.material_confidence || '0').replace('%', ''))
    : 0;
  const circScore = analysisResult ? Number(analysisResult.circularity_score || 0) : 0;
  const matInfo = analysisResult ? getMaterialInfo(analysisResult.detected_material) : null;

  const breakdown = analysisResult?.score_breakdown || {};
  const barsData = [
    { label: 'Material Recyclability', weight: 35, achieved: breakdown.material_recyclability_35  || 0, color: '#10b981' },
    { label: 'Reuse Potential',        weight: 20, achieved: breakdown.reuse_potential_20         || 0, color: '#3b82f6' },
    { label: 'Material Condition',     weight: 20, achieved: breakdown.material_condition_20      || 0, color: '#8b5cf6' },
    { label: 'Environmental Benefit',  weight: 15, achieved: breakdown.environmental_benefit_15   || 0, color: '#f59e0b' },
    { label: 'Processing Feasibility', weight: 10, achieved: breakdown.processing_feasibility_10  || 0, color: '#ef4444' },
  ];

  const confidenceLabel =
    confidence >= 85 ? 'High Confidence' :
    confidence >= 65 ? 'Medium Confidence' :
    'Low Confidence';

  const circCategory = analysisResult?.circularity_category || '';
  const defectLabel  = analysisResult?.detected_defect || 'No Defect Detected';
  const defectPct    = analysisResult
    ? `${Math.round((breakdown.material_condition_20 / 20) * 100)}%`
    : '—';

  // ── RENDER ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5 pb-8">

      {/* ═══ PAGE HEADER ══════════════════════════════════════════════════════ */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-emerald-500" />
            AI Fabric Prediction Engine
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
            Module 3 &amp; 4 — Computer Vision · Material Classification · Waste Scoring
          </p>
        </div>
        {analysisResult && (
          <button
            onClick={downloadPDFReport}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-white text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-colors"
          >
            <Download className="w-4 h-4" /> Export PDF Report
          </button>
        )}
      </div>

      {/* ═══ TABS ═════════════════════════════════════════════════════════════ */}
      <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/60 rounded-xl w-fit">
        {[
          { id: 'single', label: 'Single Image',   Icon: ImagePlus },
          { id: 'batch',  label: 'Batch Analysis', Icon: BarChart3 },
        ].map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
              activeTab === id
                ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm border border-slate-200/60 dark:border-transparent'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800/60'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* ═══ BATCH TAB ════════════════════════════════════════════════════════ */}
      {activeTab === 'batch' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700/50 shadow-md">
          <BatchAnalysis addToast={addToast} />
        </div>
      )}

      {/* ═══ SINGLE IMAGE TAB ═════════════════════════════════════════════════ */}
      {activeTab === 'single' && (
        <div className="space-y-5">

          {/* ── SECTION 1: Upload + Prediction Result ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

            {/* LEFT: Image Upload Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700/50 shadow-md p-6 flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Textile Image Upload</h2>
                <span className="text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-full font-semibold border border-emerald-500/20">
                  JPG · PNG · WebP
                </span>
              </div>

              {/* Drop zone */}
              <label
                htmlFor="fileInput"
                className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 min-h-52
                  ${previewUrl
                    ? 'border-emerald-500/50 bg-emerald-500/10'
                    : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 hover:border-emerald-500/60 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                  }`}
              >
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Textile preview"
                    className="max-h-52 w-full object-contain rounded-xl"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-3 py-10 px-6 text-center">
                    <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center border border-slate-200 dark:border-slate-700">
                      <UploadCloud className="w-7 h-7 text-slate-500 dark:text-slate-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Drop your textile image here</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">or click to browse files</p>
                    </div>
                  </div>
                )}
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="fileInput"
              />

              {/* File name chip */}
              {selectedFile && (
                <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                  <Layers className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" />
                  <span className="text-xs text-slate-700 dark:text-slate-300 truncate flex-1 font-medium">{selectedFile.name}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 shrink-0">
                    {(selectedFile.size / 1024).toFixed(0)} KB
                  </span>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleAnalyze}
                  disabled={!selectedFile || loading}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all shadow-sm ${
                    !selectedFile || loading
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700 cursor-not-allowed'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/30'
                  }`}
                >
                  {loading
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing…</>
                    : <><CheckCircle className="w-4 h-4" /> Analyze Fabric</>
                  }
                </button>
                <button
                  onClick={handleReset}
                  disabled={!selectedFile && !analysisResult}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <RotateCcw className="w-4 h-4" /> Reset
                </button>
              </div>
            </div>

            {/* RIGHT: Prediction Result Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700/50 shadow-md p-6 flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Prediction Result</h2>
                {processingTime && (
                  <span className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700">
                    <Clock className="w-3.5 h-3.5" /> {processingTime}s processing time
                  </span>
                )}
              </div>

              {analysisResult ? (
                <div className="space-y-5">

                  {/* Predicted Material banner */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-emerald-500/30">
                    <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1">
                      Predicted Material
                    </p>
                    <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
                      {analysisResult.detected_material || 'Unknown'}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                      {matInfo?.fabricClass} — {matInfo?.materialType}
                    </p>
                  </div>

                  {/* Confidence Score circular gauge */}
                  <div className="flex items-center gap-6 p-4 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700">
                    <CircleGauge
                      value={confidence.toFixed(1)}
                      max={100}
                      size={110}
                      strokeWidth={11}
                      color={confidence >= 85 ? '#10b981' : confidence >= 65 ? '#f59e0b' : '#ef4444'}
                      subLabel={confidenceLabel}
                    />
                    <div className="flex-1 space-y-2">
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                        Confidence Score
                      </p>
                      <p className="text-3xl font-extrabold text-slate-900 dark:text-white">
                        {confidence.toFixed(2)}
                        <span className="text-lg text-slate-500 dark:text-slate-400 font-medium">%</span>
                      </p>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                        confidence >= 85 ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' :
                        confidence >= 65 ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'    :
                                           'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                      }`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current inline-block" />
                        {confidenceLabel}
                      </span>
                    </div>
                  </div>

                  {/* Defect Detection row */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700">
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">Defect Detection</p>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{defectLabel}</p>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700">
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">Condition Score</p>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{defectPct} confidence</p>
                    </div>
                  </div>

                </div>
              ) : (
                /* Empty state */
                <div className="flex-1 flex flex-col items-center justify-center text-center py-12 gap-4">
                  <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl flex items-center justify-center">
                    <FlaskConical className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No analysis yet</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Upload a textile image and click Analyze Fabric</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── SECTION 2: Material Information Card ── */}
          {analysisResult && matInfo && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700/50 shadow-md p-6">
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Leaf className="w-5 h-5 text-emerald-500" />
                    Material Information
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">AI-enriched material profile from knowledge base</p>
                </div>
                <div className="flex gap-2 flex-wrap justify-end">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700">
                    <span className="text-base">{matInfo.icon}</span>
                    {matInfo.fabricClass}
                  </span>
                  <span className="inline-flex items-center px-3 py-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg text-xs font-semibold border border-emerald-500/20">
                    {matInfo.materialType}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Description */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Description</p>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{matInfo.description}</p>
                </div>
                {/* Common Uses */}
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Common Uses</p>
                  <div className="flex flex-wrap gap-2">
                    {matInfo.commonUses.map((use) => (
                      <Pill key={use} label={use} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── SECTION 3: Circular Economy Score & Recommendations ── */}
          {analysisResult && (
            <div className="space-y-5">

              {/* Score Card — 3 columns */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700/50 shadow-md p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Award className="w-5 h-5 text-amber-500" />
                  <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Circular Economy Score</h2>
                  <span className="ml-auto text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700">
                    Module 9 — Weighted Scoring Model
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                  {/* LEFT: Overall Score Ring */}
                  <div className="flex flex-col items-center justify-center gap-4 py-4">
                    <CircleGauge
                      value={circScore.toFixed(1)}
                      max={100}
                      size={150}
                      strokeWidth={14}
                      color={
                        circScore >= 85 ? '#10b981' :
                        circScore >= 70 ? '#3b82f6' :
                        circScore >= 55 ? '#f59e0b' :
                                         '#ef4444'
                      }
                      subLabel="/ 100"
                    />
                    <div className="text-center space-y-1">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
                        circScore >= 85 ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' :
                        circScore >= 70 ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400'    :
                        circScore >= 55 ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'  :
                                         'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                      }`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {circCategory || 'Calculating...'}
                      </span>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Overall Circularity</p>
                    </div>
                  </div>

                  {/* CENTER: Score Breakdown Bars */}
                  <div className="space-y-4">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Score Breakdown</p>
                    {barsData.map((b) => (
                      <BreakdownBar
                        key={b.label}
                        label={b.label}
                        weight={b.weight}
                        achieved={b.achieved}
                        color={b.color}
                      />
                    ))}
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Score</span>
                      <span className="text-sm font-extrabold text-slate-900 dark:text-slate-100">{circScore.toFixed(2)} / 100</span>
                    </div>
                  </div>

                  {/* RIGHT: Score Calculation Explanation */}
                  <div className="space-y-4">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Score Calculation</p>
                    <div className="space-y-3 text-xs text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-800/80 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">Weighted Formula:</p>
                      {[
                        ['🟢', 'Material Recyclability', '35%'],
                        ['🔵', 'Reuse Potential',        '20%'],
                        ['🟣', 'Material Condition',     '20%'],
                        ['🟡', 'Environmental Benefit',  '15%'],
                        ['🔴', 'Processing Feasibility', '10%'],
                      ].map(([dot, lbl, wt]) => (
                        <div key={lbl} className="flex justify-between items-center">
                          <span className="flex items-center gap-1.5">
                            <span>{dot}</span> {lbl}
                          </span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{wt}</span>
                        </div>
                      ))}
                      <div className="pt-2 border-t border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 italic">
                        Based on industry circular economy benchmarks. Scores calculated per-item at scan time.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recommendation Card */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700/50 shadow-md p-6">
                <div className="flex items-center gap-2 mb-5">
                  <Recycle className="w-5 h-5 text-emerald-500" />
                  <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Recycling Recommendations</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                  {/* Primary Method — highlighted emerald gradient */}
                  <div className="sm:col-span-1 p-5 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-xl text-white shadow-lg shadow-emerald-950/30">
                    <p className="text-xs font-semibold text-emerald-100 uppercase tracking-widest mb-2">Primary Method</p>
                    <p className="text-xl font-extrabold leading-tight">
                      {analysisResult.recommended_strategy || 'Mechanical Recycling'}
                    </p>
                    <div className="mt-4 flex items-center gap-1.5 text-emerald-100 text-xs font-medium">
                      <ChevronRight className="w-3.5 h-3.5" />
                      Recommended Action
                    </div>
                  </div>

                  {/* Waste Category */}
                  <div className="p-5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Waste Category</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                      {analysisResult.detected_condition === 'Good'
                        ? 'Reusable / Resalable'
                        : analysisResult.detected_condition?.includes('Stain')
                        ? 'Chemical Processing'
                        : 'Mechanical Recycling'
                      }
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                      AI condition: <strong className="text-slate-800 dark:text-slate-200">{analysisResult.detected_condition}</strong>
                    </p>
                  </div>

                  {/* Reuse Potential */}
                  <div className="p-5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Reuse Potential</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                      {barsData[1].achieved >= 16
                        ? 'High Reuse Potential'
                        : barsData[1].achieved >= 8
                        ? 'Moderate Potential'
                        : 'Low Reuse Potential'}
                    </p>
                    <div className="mt-2 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-blue-500"
                        style={{ width: `${(barsData[1].achieved / 20) * 100}%`, transition: 'width 1s ease' }}
                      />
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                      {barsData[1].achieved.toFixed(1)} / 20 score points
                    </p>
                  </div>

                </div>
              </div>

            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Analysis;