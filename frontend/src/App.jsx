import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Shell from './components/layout/Shell'
import Login from './pages/Login'
import Dashboard from './pages/user/Dashboard'
import MyLeads from './pages/user/MyLeads'
import LeadDetail from './pages/user/LeadDetail'
import AdminDashboard from './pages/admin/AdminDashboard'
import AllLeads from './pages/admin/AllLeads'
import AssignLeads from './pages/admin/AssignLeads'
import UploadCSV from './pages/admin/UploadCSV'
import Users from './pages/admin/Users'
import Analytics from './pages/admin/Analytics'
import AdminLeadDetail from './pages/admin/AdminLeadDetail'

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, isAdmin } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (adminOnly && !isAdmin) return <Navigate to="/dashboard" replace />
  return children
}

function RootRedirect() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Shell /></ProtectedRoute>}>
            <Route index element={<RootRedirect />} />
            <Route path="dashboard"       element={<Dashboard />} />
            <Route path="leads"           element={<MyLeads />} />
            <Route path="leads/:id"       element={<LeadDetail />} />
            <Route path="admin"           element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
            <Route path="admin/leads"     element={<ProtectedRoute adminOnly><AllLeads /></ProtectedRoute>} />
            <Route path="admin/leads/:id" element={<ProtectedRoute adminOnly><AdminLeadDetail /></ProtectedRoute>} />
            <Route path="admin/assign"    element={<ProtectedRoute adminOnly><AssignLeads /></ProtectedRoute>} />
            <Route path="admin/upload"    element={<ProtectedRoute adminOnly><UploadCSV /></ProtectedRoute>} />
            <Route path="admin/users"     element={<ProtectedRoute adminOnly><Users /></ProtectedRoute>} />
            <Route path="admin/analytics" element={<ProtectedRoute adminOnly><Analytics /></ProtectedRoute>} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
