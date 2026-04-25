import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './modules/auth/LoginPage'
import ServicesPage from './modules/services/ServicesPage'
import ServiceDetailPage from './modules/services/ServiceDetailPage'
import NewServicePage from './modules/services/NewServicePage'
import AppShell from './shared/components/AppShell'
import { useAuthStore } from './shared/stores/auth.store'
import './shared/theme.css'

function PrivatePage({ children }: { children: React.ReactNode }) {
  const token = useAuthStore(s => s.token)
  if (!token) return <Navigate to="/login" replace />
  return <AppShell>{children}</AppShell>
}

const Placeholder = ({ title }: { title: string }) => (
  <div style={{ padding: 28 }}>
    <h1 style={{ color: '#0A1F44', borderBottom: '3px solid #00A9E0', display: 'inline-block', paddingBottom: 5 }}>{title}</h1>
    <p style={{ color: '#607090', marginTop: 8 }}>Próximamente</p>
  </div>
)

export default function App() {
  return (
    <Routes>
      <Route path="/login"          element={<LoginPage />} />
      <Route path="/"               element={<Navigate to="/services" replace />} />
      <Route path="/services"       element={<PrivatePage><ServicesPage /></PrivatePage>} />
      <Route path="/services/new"   element={<PrivatePage><NewServicePage /></PrivatePage>} />
      <Route path="/services/:id"   element={<PrivatePage><ServiceDetailPage /></PrivatePage>} />
      <Route path="/dashboard"      element={<PrivatePage><ServicesPage /></PrivatePage>} />
      <Route path="/providers"      element={<PrivatePage><Placeholder title="Proveedores" /></PrivatePage>} />
      <Route path="/clients"        element={<PrivatePage><Placeholder title="Clientes" /></PrivatePage>} />
      <Route path="/appointments"   element={<PrivatePage><Placeholder title="Citas médicas" /></PrivatePage>} />
      <Route path="/reports"        element={<PrivatePage><Placeholder title="Reportes" /></PrivatePage>} />
      <Route path="/admin/*"        element={<PrivatePage><Placeholder title="Admin" /></PrivatePage>} />
    </Routes>
  )
}
