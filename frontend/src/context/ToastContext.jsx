import React, { createContext, useContext, useState, useCallback } from 'react';

/**
 * Module 11: Notification & Alert System
 * ─────────────────────────────────────
 * Global Toast Context — provides addToast() and removeToast() to every
 * component in the authenticated app.
 *
 * Toast Types (mapped to document Module 11 requirements):
 *  'success' → Recycling opportunity notifications, sustainability milestone alerts
 *  'warning' → Inventory warnings, waste collection alerts
 *  'info'    → Platform announcements
 *  'error'   → Failed scans, system errors
 *
 * Usage (in any child component):
 *   const { addToast } = useToast();
 *   addToast({ type: 'success', title: 'Scan Complete', message: 'Cotton detected!' });
 */

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  /**
   * addToast — fires a new notification
   * @param {object} options
   * @param {'success'|'warning'|'info'|'error'} options.type
   * @param {string}  options.title   — bold heading line
   * @param {string}  options.message — supporting detail line
   * @param {number}  options.duration — auto-dismiss ms (default 4000)
   */
  const addToast = useCallback(({ type = 'info', title = '', message = '', duration = 4000 }) => {
    const id = Date.now() + Math.random();

    setToasts(prev => [...prev, { id, type, title, message }]);

    // Auto-dismiss after duration
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);

    return id;
  }, []);

  /**
   * removeToast — immediately dismiss a toast by id (used by ✕ button)
   */
  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
}

/**
 * useToast — custom hook to access the toast API
 * Must be called inside a component that is a descendant of <ToastProvider>
 */
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast() must be used inside a <ToastProvider>. Check your main.jsx wrapping.');
  }
  return ctx;
}
