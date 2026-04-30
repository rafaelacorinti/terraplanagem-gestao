import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import ProjectsPage from './pages/ProjectsPage'
import MachinesPage from './pages/MachinesPage'
import EmployeesPage from './pages/EmployeesPage'
import FinancialPage from './pages/FinancialPage'
import MaintenancePage from './pages/MaintenancePage'
import ProductionPage from './pages/ProductionPage'
import FuelingPage from './pages/FuelingPage'
import ReportsPage from './pages/ReportsPage'
import AccessRequestsPage from './pages/AccessRequestsPage'
import Layout from './components/Layout'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="machines" element={<MachinesPage />} />
        <Route path="employees" element={<EmployeesPage />} />
        <Route path="production" element={<ProductionPage />} />
        <Route path="fueling" element={<FuelingPage />} />
        <Route path="maintenance" element={<MaintenancePage />} />
        <Route path="financial" element={<FinancialPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="access-requests" element={<AccessRequestsPage />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  )
}
