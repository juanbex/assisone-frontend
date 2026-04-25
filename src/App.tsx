import { Routes, Route, Navigate } from 'react-router-dom'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/services" replace />} />
      <Route path="/services"  element={<div className="p-8 text-xl font-medium">Servicios — en construcción</div>} />
      <Route path="/providers" element={<div className="p-8 text-xl font-medium">Proveedores — en construcción</div>} />
      <Route path="/admin"     element={<div className="p-8 text-xl font-medium">Admin — en construcción</div>} />
    </Routes>
  )
}
