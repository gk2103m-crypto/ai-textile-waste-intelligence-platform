import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Analysis from './pages/Analysis'; 
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import InventoryDashboard from './InventoryDashboard';
import UserManagement from './pages/UserManagement';
import ManufacturerManagement from './pages/ManufacturerManagement';
import SustainabilityDataset from './pages/SustainabilityDataset';
import RecyclingOpportunities from './pages/RecyclingOpportunities';
import ESGReports from './pages/ESGReports';
import Layout from './components/Layout';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* PROTECTED ROUTES */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/analysis" element={<Analysis />} />
          <Route path="/inventory" element={<InventoryDashboard />} />
          <Route path="/admin/users" element={<UserManagement />} />
          <Route path="/admin/manufacturers" element={<ManufacturerManagement />} />
          <Route path="/sustainability" element={<SustainabilityDataset />} />
          
          {/* NEW ROLE-SPECIFIC ROUTES */}
          <Route path="/recycling-opportunities" element={<RecyclingOpportunities />} />
          <Route path="/esg-reports" element={<ESGReports />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;