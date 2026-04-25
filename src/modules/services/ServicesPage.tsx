import { useState } from 'react'
import { useServices, useServicesStats } from './useServices'

const STATUS_LABELS: Record<string, string> = {
  received:        'Recibido',
  in_coordination: 'En coordinación',
  uncoordinated:   'No coordinado',
  coordinated:     'Coordinado',
  assigned:        'Asignado',
  in_progress:     'En seguimiento',
  completed:       'Finalizado',
  cancelled:       'Cancelado',
}

export default function ServicesPage() {
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [searchInput, setSearchInput] = useState('')

  const { data, isLoading, isError, refetch } = useServices({ status: filterStatus, search })
  const { data: statsData } = useServicesStats()

  const stats = statsData?.data
  const services = data?.data ?? []
  const total = data?.total ?? 0

  const STAT_CARDS = [
    { label: 'Total', value: stats?.total ?? 0, color: '#0A1F44' },
    { label: 'En coordinación', value: stats?.in_coordination ?? 0, color: '#d97706' },
    { label: 'No coordinados', value: stats?.uncoordinated ?? 0, color: '#dc2626' },
    { label: 'En seguimiento', value: stats?.in_progress ?? 0, color: '#7c3aed' },
    { label: 'Finalizados hoy', value: stats?.completed ?? 0, color: '#059669' },
  ]

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearch(searchInput)
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
        <button
          onClick={() => refetch()}
          style={{ padding: '6px 14px', background: 'transparent', border: '1.5px solid #dde3ef', borderRadius: 6, fontSize: 12, color: '#607090', cursor: 'pointer' }}
        >
          ↻ Actualizar
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        {STAT_CARDS.map(s => (
          <div key={s.label} style={{ background: '#fff', border: '1px solid #dde3ef', borderRadius: 10, padding: '12px 20px', minWidth: 110, boxShadow: '0 1px 3px rgba(10,31,68,.06)', cursor: 'pointer' }}
            onClick={() => setFilterStatus(filterStatus === '' ? '' : '')}>
            <div style={{ fontSize: 11, color: '#607090', textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 600, marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          placeholder="Buscar por cliente o póliza..."
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          style={{ flex: '1 1 220px', padding: '7px 12px', border: '1.5px solid #dde3ef', borderRadius: 6, fontSize: 13, outline: 'none', color: '#0A1F44' }}
        />
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          style={{ padding: '7px 12px', border: '1.5px solid #dde3ef', borderRadius: 6, fontSize: 13, color: '#0A1F44', background: '#fff', outline: 'none' }}
        >
          <option value="">Todos los estados</option>
          {Object.entries(STATUS_LABELS).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
        <button type="submit" style={{ padding: '7px 16px', background: '#00A9E0', color: '#fff', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          Buscar
        </button>
        <button type="button" style={{ padding: '7px 16px', background: '#0A1F44', color: '#fff', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          + Nuevo servicio
        </button>
      </form>

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #dde3ef', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(10,31,68,.06)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#0A1F44' }}>
              {['ID', 'Cliente', 'Póliza', 'Tipo', 'Estado', 'Front', 'Back', 'Hora', 'Acciones'].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: 'rgba(255,255,255,.8)', whiteSpace: 'nowrap' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr><td colSpan={9} style={{ textAlign: 'center', padding: '2.5rem', color: '#607090', fontSize: 14 }}>Cargando servicios...</td></tr>
            )}
            {isError && (
              <tr><td colSpan={9} style={{ textAlign: 'center', padding: '2.5rem', color: '#dc2626', fontSize: 14 }}>Error al cargar servicios</td></tr>
            )}
            {!isLoading && !isError && services.length === 0 && (
              <tr><td colSpan={9} style={{ textAlign: 'center', padding: '2.5rem', color: '#607090', fontSize: 14 }}>No se encontraron servicios</td></tr>
            )}
            {services.map((s, i) => (
              <tr key={s.id} style={{ borderBottom: '1px solid #dde3ef', background: i % 2 === 0 ? '#fff' : '#fafbfc' }}>
                <td style={td}><span style={{ fontWeight: 700, color: '#00A9E0', fontSize: 12, fontFamily: 'monospace' }}>{s.id.slice(0, 8).toUpperCase()}</span></td>
                <td style={td}><span style={{ fontWeight: 600 }}>{s.client.name}</span></td>
                <td style={{ ...td, color: '#607090', fontSize: 12 }}>{s.client.policyNumber ?? '—'}</td>
                <td style={td}>{s.serviceType.name}</td>
                <td style={td}><span className={`badge badge-${s.status}`}>{STATUS_LABELS[s.status] ?? s.status}</span></td>
                <td style={{ ...td, color: '#607090' }}>{s.frontAgent?.name ?? '—'}</td>
                <td style={{ ...td, color: '#607090' }}>{s.backAgent?.name ?? '—'}</td>
                <td style={{ ...td, color: '#607090', fontSize: 12 }}>{new Date(s.createdAt).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}</td>
                <td style={td}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button style={actionBtn('#00A9E0')}>Ver</button>
                    <button style={actionBtn('#0A1F44')}>Gestionar</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p style={{ fontSize: 12, color: '#607090', marginTop: 12 }}>
        {total} servicio{total !== 1 ? 's' : ''} · actualiza cada 30s
      </p>
    </div>
  )
}

const td: React.CSSProperties = { padding: '10px 14px', fontSize: 13.5, verticalAlign: 'middle', color: '#0A1F44' }
const actionBtn = (color: string): React.CSSProperties => ({
  padding: '4px 10px', fontSize: 12, fontWeight: 600, color,
  background: 'transparent', border: `1.5px solid ${color}`, borderRadius: 5, cursor: 'pointer',
})
