import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useServices, useServicesStats } from './useServices'

const STATUS_LABELS: Record<string, string> = {
  received:        'Recibido',
  in_coordination: 'En coordinación',
  uncoordinated:   'No coordinado',
  coordinated:     'Coordinado',
  assigned:        'Asignado',
  in_progress:     'En seguimiento',
  in_service:      'En prestación',
  completed:       'Finalizado',
  cancelled:       'Cancelado',
}

const STATUS_BADGE_STYLE: Record<string, { bg: string; color: string }> = {
  received:        { bg: '#dbeafe', color: '#1d4ed8' },
  in_coordination: { bg: '#fef3c7', color: '#92400e' },
  uncoordinated:   { bg: '#fee2e2', color: '#991b1b' },
  coordinated:     { bg: '#d1fae5', color: '#065f46' },
  assigned:        { bg: '#e0f6fd', color: '#0088b8' },
  in_progress:     { bg: '#ede9fe', color: '#4c1d95' },
  in_service:      { bg: '#fce7f3', color: '#9d174d' },
  completed:       { bg: '#f0fdf4', color: '#14532d' },
  cancelled:       { bg: '#f1f5f9', color: '#475569' },
}

export default function ServicesPage() {
  const navigate = useNavigate()
  const [search, setSearch]         = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [searchInput, setSearchInput]   = useState('')

  const { data, isLoading, isError, refetch } = useServices({ status: filterStatus, search })
  const { data: statsData } = useServicesStats()

  const stats    = (statsData as any)?.data
  const services = data?.data ?? []
  const total    = data?.total ?? 0

  // Counters clickables — cada uno filtra la tabla por ese estado
  const STAT_CARDS = [
    { label: 'Total activos',      value: stats?.active          ?? 0, color: '#0A1F44', status: '',               hint: 'Todos excepto finalizados y cancelados' },
    { label: 'Recibidos',          value: stats?.received        ?? 0, color: '#1d4ed8', status: 'received',        hint: 'Esperando inicio de coordinación' },
    { label: 'En coordinación',    value: stats?.in_coordination ?? 0, color: '#d97706', status: 'in_coordination', hint: 'Buscando proveedor activamente' },
    { label: 'No coordinados',     value: stats?.uncoordinated   ?? 0, color: '#dc2626', status: 'uncoordinated',   hint: 'Sin proveedor disponible — requieren atención' },
    { label: 'En seguimiento',     value: (stats?.coordinated ?? 0) + (stats?.assigned ?? 0) + (stats?.in_progress ?? 0) + (stats?.in_service ?? 0), color: '#7c3aed', status: '',    hint: 'Coordinados, asignados y en curso' },
    { label: 'Finalizados hoy',    value: stats?.completed_today ?? 0, color: '#059669', status: 'completed',       hint: 'Completados en el día de hoy' },
  ]

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setSearch(searchInput) }

  const toggleFilter = (status: string) => {
    setFilterStatus(f => f === status ? '' : status)
    setSearch('')
    setSearchInput('')
  }

  return (
    <div style={{ padding: '24px 28px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 700, color: '#0A1F44', borderBottom: '3px solid #00A9E0', display: 'inline-block', paddingBottom: 6 }}>
            Bandeja de servicios
          </h1>
          <p style={{ margin: '6px 0 0', fontSize: 13, color: '#607090' }}>
            {new Date().toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <button onClick={() => refetch()} style={{ padding: '6px 14px', background: 'transparent', border: '1.5px solid #dde3ef', borderRadius: 6, fontSize: 12, color: '#607090', cursor: 'pointer' }}>
          ↻ Actualizar
        </button>
      </div>

      {/* Stat Cards — clickables para filtrar */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
        {STAT_CARDS.map(s => {
          const active = filterStatus === s.status && s.status !== ''
          return (
            <div key={s.label}
              onClick={() => toggleFilter(s.status)}
              title={s.hint}
              style={{
                background: active ? '#e0f6fd' : '#fff',
                border: `1.5px solid ${active ? '#00A9E0' : '#dde3ef'}`,
                borderRadius: 10, padding: '10px 16px', minWidth: 110,
                boxShadow: active ? '0 0 0 3px #00A9E020' : '0 1px 3px rgba(10,31,68,.06)',
                cursor: s.status !== '' ? 'pointer' : 'default',
                transition: '.15s',
              }}>
              <div style={{ fontSize: 10, color: '#607090', textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 600, marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: s.color }}>{s.value}</div>
              {s.status !== '' && (
                <div style={{ fontSize: 10, color: '#adb5c7', marginTop: 2 }}>
                  {active ? '✓ filtro activo' : 'clic para filtrar'}
                </div>
              )}
            </div>
          )
        })}
      </div>
      <p style={{ margin: '0 0 18px', fontSize: 11, color: '#adb5c7' }}>
        Haz clic en un contador para filtrar la tabla por ese estado
      </p>

      {/* Filtro activo banner */}
      {filterStatus && (
        <div style={{ background: '#e0f6fd', border: '1px solid #00A9E040', borderRadius: 7, padding: '8px 14px', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13 }}>
          <span>Mostrando: <strong style={{ color: '#0088b8' }}>{STATUS_LABELS[filterStatus]}</strong></span>
          <button onClick={() => setFilterStatus('')} style={{ background: 'none', border: 'none', color: '#00A9E0', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
            ✕ Limpiar filtro
          </button>
        </div>
      )}

      {/* Filters */}
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <input placeholder="Buscar por cliente o póliza..." value={searchInput} onChange={e => setSearchInput(e.target.value)}
          style={{ flex: '1 1 220px', padding: '7px 12px', border: '1.5px solid #dde3ef', borderRadius: 6, fontSize: 13, outline: 'none', color: '#0A1F44' }} />
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          style={{ padding: '7px 12px', border: '1.5px solid #dde3ef', borderRadius: 6, fontSize: 13, color: '#0A1F44', background: '#fff', outline: 'none' }}>
          <option value="">Todos los estados</option>
          {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <button type="submit" style={{ padding: '7px 16px', background: '#0A1F44', color: '#fff', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Buscar</button>
        <button type="button" onClick={() => navigate('/services/new')}
          style={{ padding: '7px 16px', background: '#00A9E0', color: '#fff', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          + Nuevo servicio
        </button>
      </form>

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #dde3ef', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(10,31,68,.06)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#0A1F44' }}>
              {['ID','Cliente','Póliza','Tipo','Estado','Front','Back','Hora'].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: 'rgba(255,255,255,.8)', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={8} style={emptyTd}>Cargando servicios...</td></tr>}
            {isError   && <tr><td colSpan={8} style={{ ...emptyTd, color: '#dc2626' }}>Error al cargar servicios</td></tr>}
            {!isLoading && !isError && services.length === 0 && (
              <tr><td colSpan={8} style={emptyTd}>
                {filterStatus
                  ? `No hay servicios con estado "${STATUS_LABELS[filterStatus]}"`
                  : <>No hay servicios aún. <span onClick={() => navigate('/services/new')} style={{ color: '#00A9E0', cursor: 'pointer', fontWeight: 600 }}>Crear el primero →</span></>
                }
              </td></tr>
            )}
            {services.map((s, i) => {
              const badge = STATUS_BADGE_STYLE[s.status] ?? { bg: '#f1f5f9', color: '#475569' }
              return (
                <tr key={s.id} onClick={() => navigate(`/services/${s.id}`)}
                  style={{ borderBottom: '1px solid #dde3ef', background: i % 2 === 0 ? '#fff' : '#fafbfc', cursor: 'pointer' }}>
                  <td style={td}><span style={{ fontWeight: 700, color: '#00A9E0', fontSize: 12, fontFamily: 'monospace' }}>{s.id.slice(0, 8).toUpperCase()}</span></td>
                  <td style={td}><span style={{ fontWeight: 600 }}>{s.client.name}</span></td>
                  <td style={{ ...td, color: '#607090', fontSize: 12 }}>{s.client.policyNumber ?? '—'}</td>
                  <td style={td}>{s.serviceType.name}</td>
                  <td style={td}>
                    <span style={{ padding: '3px 9px', borderRadius: 99, fontSize: 11, fontWeight: 700, background: badge.bg, color: badge.color }}>
                      {STATUS_LABELS[s.status] ?? s.status}
                    </span>
                  </td>
                  <td style={{ ...td, color: '#607090' }}>{s.frontAgent?.name ?? '—'}</td>
                  <td style={{ ...td, color: '#607090' }}>{s.backAgent?.name ?? '—'}</td>
                  <td style={{ ...td, color: '#607090', fontSize: 12 }}>{new Date(s.createdAt).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <p style={{ fontSize: 12, color: '#607090', marginTop: 12 }}>
        {total} servicio{total !== 1 ? 's' : ''} {filterStatus ? `con estado "${STATUS_LABELS[filterStatus]}"` : 'en total'} · actualiza cada 30s
      </p>
    </div>
  )
}

const td: React.CSSProperties = { padding: '10px 14px', fontSize: 13.5, verticalAlign: 'middle', color: '#0A1F44' }
const emptyTd: React.CSSProperties = { textAlign: 'center', padding: '2.5rem', color: '#607090', fontSize: 14 }
