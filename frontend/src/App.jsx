import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Analysis from './pages/Analysis';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import InventoryDashboard from './InventoryDashboard';
import UserManagement from './pages/UserManagement';
import ManufacturerManagement from './pages/ManufacturerManagement';
import SustainabilityDataset from './pages/SustainabilityDataset';
import ESGReports from './pages/ESGReports';
import RecyclingOpportunities from './pages/RecyclingOpportunities';
import Layout from './components/Layout';
import { ErrorBoundary } from './components/ErrorBoundary';

function App() {
  return (
    <Router>
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
    </Router>
  );
}

export default App;