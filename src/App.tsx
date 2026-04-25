import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './modules/auth/LoginPage'
import { useAuthStore } from './shared/stores/auth.store'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token)
  return token ? <>{children}</> : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/services" element={
        <PrivateRoute>
          <div className="p-8 text-xl font-medium" style={{ background: '#0b0f1a', color: '#e8eaf2', minHeight: '100vh' }}>
            Servicios — próximamente
          </div>
        </PrivateRoute>
      } />
      <Route path="/providers" element={
        <PrivateRoute>
          <div className="p-8 text-xl font-medium" style={{ background: '#0b0f1a', color: '#e8eaf2', minHeight: '100vh' }}>
            Proveedores — próximamente
          </div>
        </PrivateRoute>
      } />
    </Routes>
  )
}
