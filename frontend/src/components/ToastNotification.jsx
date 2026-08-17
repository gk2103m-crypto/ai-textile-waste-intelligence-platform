import React from 'react';
import { useToast } from '../context/ToastContext';
import { CheckCircle, AlertTriangle, Info, XCircle, X } from 'lucide-react';

/**
 * Module 11: Notification & Alert System — Toast UI Component
 * ─────────────────────────────────────────────────────────────
 * Renders a stacked list of animated toast notifications in the top-right
 * corner of the screen. Consumes ToastContext — zero props required.
 * Mount this once inside Layout.jsx so it is globally visible across all pages.
 *
 * Visual Features:
 *  - Dark glass-style cards with left accent border
 *  - Slide-in animation from the right on mount
 *  - Shrinking bottom progress bar showing remaining display time
 *  - Manual dismiss via ✕ button
 *  - Stacks vertically (oldest at top, newest at bottom)
 *  - Fully accessible (role="alert", aria-live="polite", aria-label on dismiss)
 */

// ── Per-type visual config ─────────────────────────────────────────────────
const TOAST_CONFIG = {
  success: {
    Icon: CheckCircle,
    card: 'bg-slate-900 border border-emerald-500/60 shadow-emerald-900/40',
    iconColor: 'text-emerald-400',
    titleColor: 'text-emerald-300',
    bar: 'bg-emerald-500',
    accent: 'border-l-4 border-l-emerald-500',
  },
  warning: {
    Icon: AlertTriangle,
    card: 'bg-slate-900 border border-amber-500/60 shadow-amber-900/40',
    iconColor: 'text-amber-400',
    titleColor: 'text-amber-300',
    bar: 'bg-amber-500',
    accent: 'border-l-4 border-l-amber-500',
  },
  info: {
    Icon: Info,
    card: 'bg-slate-900 border border-blue-500/60 shadow-blue-900/40',
    iconColor: 'text-blue-400',
    titleColor: 'text-blue-300',
    bar: 'bg-blue-500',
    accent: 'border-l-4 border-l-blue-500',
  },
  error: {
    Icon: XCircle,
    card: 'bg-slate-900 border border-red-500/60 shadow-red-900/40',
    iconColor: 'text-red-400',
    titleColor: 'text-red-300',
    bar: 'bg-red-500',
    accent: 'border-l-4 border-l-red-500',
  },
};

// ── Single toast card ──────────────────────────────────────────────────────
function ToastItem({ toast, onRemove }) {
  const config = TOAST_CONFIG[toast.type] || TOAST_CONFIG.info;
  const { Icon } = config;

  return (
    <div
      className={`
        relative flex items-start gap-3 w-80 px-4 pt-4 pb-5 rounded-xl
        shadow-2xl overflow-hidden
        toast-slide-in
        ${config.card}
        ${config.accent}
      `}
      role="alert"
      aria-live="polite"
    >
      {/* Shrinking progress bar — tied to 4 s animation in index.css */}
      <div
        className={`absolute bottom-0 left-0 h-0.5 ${config.bar} toast-shrink`}
      />

      {/* Type icon */}
      <div className="mt-0.5 shrink-0">
        <Icon className={`w-5 h-5 ${config.iconColor}`} />
      </div>

      {/* Text content */}
      <div className="flex-1 min-w-0">
        {toast.title && (
          <p className={`text-sm font-semibold leading-snug ${config.titleColor}`}>
            {toast.title}
          </p>
        )}
        {toast.message && (
          <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
            {toast.message}
          </p>
        )}
      </div>

      {/* Dismiss button */}
      <button
        onClick={() => onRemove(toast.id)}
        className="shrink-0 text-slate-600 hover:text-slate-200 transition-colors mt-0.5"
        aria-label="Dismiss notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

// ── Toast stack — rendered once inside Layout.jsx ──────────────────────────
export default function ToastNotification() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none"
      aria-label="Notification area"
    >
      {toasts.map(toast => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} onRemove={removeToast} />
        </div>
      ))}
    </div>
  );
}
