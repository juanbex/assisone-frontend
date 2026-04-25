import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './modules/auth/LoginPage'
import ServicesPage from './modules/services/ServicesPage'
import ServiceDetailPage from './modules/services/ServiceDetailPage'
import NewServicePage from './modules/services/NewServicePage'
import ProvidersPage from './modules/providers/ProvidersPage'
import ProviderDetailPage from './modules/providers/ProviderDetailPage'
import NewProviderPage from './modules/providers/NewProviderPage'
import AppShell from './shared/components/AppShell'
import { useAuthStore } from './shared/stores/auth.store'
import './shared/theme.css'

function PrivatePage({ children }: { children: React.ReactNode }) {
  const token = useAuthStore(s => s.token)
  if (!token) return <Navigate to="/login" replace />
  return <AppShell>{children}</AppShell>
}

const Soon = ({ title }: { title: string }) => (
  <div style={{ padding: 28 }}>
    <h1 style={{ color: '#0A1F44', borderBottom: '3px solid #00A9E0', display: 'inline-block', paddingBottom: 5 }}>{title}</h1>
    <p style={{ color: '#607090', marginTop: 8 }}>Próximamente</p>
  </div>
)

export default function App() {
  return (
    <Routes>
      <Route path="/login"              element={<LoginPage />} />
      <Route path="/"                   element={<Navigate to="/services" replace />} />
      <Route path="/dashboard"          element={<PrivatePage><ServicesPage /></PrivatePage>} />
      <Route path="/services"           element={<PrivatePage><ServicesPage /></PrivatePage>} />
      <Route path="/services/new"       element={<PrivatePage><NewServicePage /></PrivatePage>} />
      <Route path="/services/:id"       element={<PrivatePage><ServiceDetailPage /></PrivatePage>} />
      <Route path="/providers"          element={<PrivatePage><ProvidersPage /></PrivatePage>} />
      <Route path="/providers/new"      element={<PrivatePage><NewProviderPage /></PrivatePage>} />
      <Route path="/providers/:id"      element={<PrivatePage><ProviderDetailPage /></PrivatePage>} />
      <Route path="/providers/:id/edit" element={<PrivatePage><Soon title="Editar proveedor" /></PrivatePage>} />
      <Route path="/clients"            element={<PrivatePage><Soon title="Clientes" /></PrivatePage>} />
      <Route path="/appointments"       element={<PrivatePage><Soon title="Citas médicas" /></PrivatePage>} />
      <Route path="/reports"            element={<PrivatePage><Soon title="Reportes" /></PrivatePage>} />
      <Route path="/admin/*"            element={<PrivatePage><Soon title="Admin" /></PrivatePage>} />
    </Routes>
  )
}
