import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './modules/auth/LoginPage'
import ServicesPage from './modules/services/ServicesPage'
import AppShell from './shared/components/AppShell'
import { useAuthStore } from './shared/stores/auth.store'
import './shared/theme.css'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore(s => s.token)
  return token ? <>{children}</> : <Navigate to="/login" replace />
}

function PrivatePage({ children }: { children: React.ReactNode }) {
  return (
    <PrivateRoute>
      <AppShell>{children}</AppShell>
    </PrivateRoute>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<Navigate to="/services" replace />} />
      <Route path="/services" element={<PrivatePage><ServicesPage /></PrivatePage>} />
      <Route path="/dashboard" element={<PrivatePage><ServicesPage /></PrivatePage>} />
      <Route path="/providers" element={<PrivatePage><div style={{ padding: 28 }}><h1 style={{ color: '#0A1F44' }}>Proveedores — próximamente</h1></div></PrivatePage>} />
      <Route path="/clients" element={<PrivatePage><div style={{ padding: 28 }}><h1 style={{ color: '#0A1F44' }}>Clientes — próximamente</h1></div></PrivatePage>} />
      <Route path="/appointments" element={<PrivatePage><div style={{ padding: 28 }}><h1 style={{ color: '#0A1F44' }}>Citas médicas — próximamente</h1></div></PrivatePage>} />
      <Route path="/reports" element={<PrivatePage><div style={{ padding: 28 }}><h1 style={{ color: '#0A1F44' }}>Reportes — próximamente</h1></div></PrivatePage>} />
      <Route path="/admin/*" element={<PrivatePage><div style={{ padding: 28 }}><h1 style={{ color: '#0A1F44' }}>Admin — próximamente</h1></div></PrivatePage>} />
    </Routes>
  )
}
