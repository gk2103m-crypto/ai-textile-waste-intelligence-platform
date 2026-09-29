import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import { ErrorBoundary } from './components/ErrorBoundary';

// Task 1: Top-Level Error Boundaries and Suspense Fallbacks
const Analysis = lazy(() => import('./pages/Analysis'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const InventoryDashboard = lazy(() => import('./InventoryDashboard'));
const UserManagement = lazy(() => import('./pages/UserManagement'));
const ManufacturerManagement = lazy(() => import('./pages/ManufacturerManagement'));
const SustainabilityDataset = lazy(() => import('./pages/SustainabilityDataset'));
const ESGReports = lazy(() => import('./pages/ESGReports'));
const RecyclingOpportunities = lazy(() => import('./pages/RecyclingOpportunities'));

// Suspense Fallback Component
const PageLoader = () => (
  <div className="flex h-screen w-full items-center justify-center bg-slate-950">
    <div className="flex flex-col items-center gap-4">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500/20 border-t-emerald-500"></div>
      <p className="text-sm font-semibold text-emerald-500">Loading module...</p>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <ErrorBoundary>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route element={<Layout />}>
              <Route path="/dashboard" element={<ErrorBoundary><Dashboard /></ErrorBoundary>} />
              {/* Both /analysis and /ai-analysis point to same page — sidebar uses /ai-analysis */}
              <Route path="/analysis" element={<ErrorBoundary><Analysis /></ErrorBoundary>} />
              <Route path="/ai-analysis" element={<ErrorBoundary><Analysis /></ErrorBoundary>} />
              <Route path="/inventory" element={<ErrorBoundary><InventoryDashboard /></ErrorBoundary>} />
              <Route path="/admin/users" element={<ErrorBoundary><UserManagement /></ErrorBoundary>} />
              <Route path="/admin/manufacturers" element={<ErrorBoundary><ManufacturerManagement /></ErrorBoundary>} />
              <Route path="/sustainability" element={<ErrorBoundary><SustainabilityDataset /></ErrorBoundary>} />
              <Route path="/sustainability-manager" element={<ErrorBoundary><SustainabilityDataset /></ErrorBoundary>} />
              <Route path="/esg-reports" element={<ErrorBoundary><ESGReports /></ErrorBoundary>} />
              <Route path="/recycling-opportunities" element={<ErrorBoundary><RecyclingOpportunities /></ErrorBoundary>} />
            </Route>
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </Router>
  );
}

export default App;