import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './modules/auth/LoginPage'
import ServicesPage from './modules/services/ServicesPage'
import ServiceDetailPage from './modules/services/ServiceDetailPage'
import NewServicePage from './modules/services/NewServicePage'
import SeguimientoPage from './modules/services/SeguimientoPage'
import ProvidersPage from './modules/providers/ProvidersPage'
import ProviderDetailPage from './modules/providers/ProviderDetailPage'
import ProviderFormPage from './modules/providers/ProviderFormPage'
import UsersPage from './modules/admin/UsersPage'
import RolesPage from './modules/admin/RolesPage'
import TenantsPage from './modules/admin/TenantsPage'
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
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<Navigate to="/services" replace />} />

      {/* Servicios */}
      <Route path="/services"              element={<PrivatePage><ServicesPage /></PrivatePage>} />
      <Route path="/services/new"          element={<PrivatePage><NewServicePage /></PrivatePage>} />
      <Route path="/services/:id"          element={<PrivatePage><ServiceDetailPage /></PrivatePage>} />
      <Route path="/dashboard"             element={<PrivatePage><ServicesPage /></PrivatePage>} />

      {/* Seguimiento */}
      <Route path="/seguimiento"           element={<PrivatePage><SeguimientoPage /></PrivatePage>} />

      {/* Proveedores */}
      <Route path="/providers"             element={<PrivatePage><ProvidersPage /></PrivatePage>} />
      <Route path="/providers/new"         element={<PrivatePage><ProviderFormPage /></PrivatePage>} />
      <Route path="/providers/:id"         element={<PrivatePage><ProviderDetailPage /></PrivatePage>} />
      <Route path="/providers/:id/edit"    element={<PrivatePage><ProviderFormPage /></PrivatePage>} />

      {/* Otros */}
      <Route path="/clients"               element={<PrivatePage><Placeholder title="Clientes" /></PrivatePage>} />
      <Route path="/appointments"          element={<PrivatePage><Placeholder title="Citas médicas" /></PrivatePage>} />
      <Route path="/reports"               element={<PrivatePage><Placeholder title="Reportes" /></PrivatePage>} />

      {/* Admin */}
      <Route path="/admin"                 element={<Navigate to="/admin/users" replace />} />
      <Route path="/admin/users"           element={<PrivatePage><UsersPage /></PrivatePage>} />
      <Route path="/admin/roles"           element={<PrivatePage><RolesPage /></PrivatePage>} />
      <Route path="/admin/tenants"         element={<PrivatePage><TenantsPage /></PrivatePage>} />
    </Routes>
  )
}
