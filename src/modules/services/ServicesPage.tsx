import { useState } from 'react'

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

const MOCK: any[] = [
  { id: 'SRV-001', client: 'Carlos Pérez', policy: 'SBS-12345', type: 'Grúa liviana', status: 'in_coordination', front: 'Ana G.', back: 'Luis M.', created: '2026-04-25 09:12' },
  { id: 'SRV-002', client: 'María López', policy: 'SBS-67890', type: 'Conductor elegido', status: 'assigned', front: 'Ana G.', back: 'Luis M.', created: '2026-04-25 09:45' },
  { id: 'SRV-003', client: 'Pedro Ruiz', policy: 'EQD-33210', type: 'Plomería', status: 'uncoordinated', front: 'Sara V.', back: 'Luis M.', created: '2026-04-25 10:02' },
  { id: 'SRV-004', client: 'Laura Torres', policy: 'SDE-88741', type: 'Consulta médica', status: 'in_progress', front: 'Sara V.', back: 'Camilo R.', created: '2026-04-25 08:30' },
  { id: 'SRV-005', client: 'Andrés Mora', policy: 'SBS-55512', type: 'Carro taller', status: 'completed', front: 'Ana G.', back: 'Camilo R.', created: '2026-04-25 07:15' },
  { id: 'SRV-006', client: 'Sofía Castro', policy: 'EQD-11023', type: 'Gas domiciliario', status: 'received', front: 'Sara V.', back: '—', created: '2026-04-25 11:20' },
  { id: 'SRV-007', client: 'Felipe Ríos', policy: 'SBS-99001', type: 'Grúa pesada', status: 'coordinated', front: 'Ana G.', back: 'Luis M.', created: '2026-04-25 10:55' },
]

const STATS = [
  { label: 'Total', value: 7, color: '#0A1F44' },
  { label: 'En coordinación', value: 2, color: '#d97706' },
  { label: 'No coordinados', value: 1, color: '#dc2626' },
  { label: 'En seguimiento', value: 1, color: '#7c3aed' },
  { label: 'Finalizados hoy', value: 1, color: '#059669' },
]

export default function ServicesPage() {
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  const filtered = MOCK.filter(s => {
    const matchSearch = !search || s.client.toLowerCase().includes(search.toLowerCase()) || s.id.toLowerCase().includes(search.toLowerCase()) || s.policy.toLowerCase().includes(search.toLowerCase())
    const matchStatus = !filterStatus || s.status === filterStatus
    return matchSearch && matchStatus
  })

  return (
    <div style={{ padding: '24px 28px' }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 700, color: '#0A1F44', borderBottom: '3px solid #00A9E0', display: 'inline-block', paddingBottom: 6 }}>
          Bandeja de servicios
        </h1>
        <p style={{ margin: '6px 0 0', fontSize: 13, color: '#607090' }}>
          {new Date().toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        {STATS.map(s => (
          <div key={s.label} style={{
            background: '#fff',
            border: '1px solid #dde3ef',
            borderRadius: 10,
            padding: '12px 20px',
            minWidth: 120,
            boxShadow: '0 1px 3px rgba(10,31,68,.06)',
          }}>
            <div style={{ fontSize: 11, color: '#607090', textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 600, marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          placeholder="Buscar por ID, cliente o póliza..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            flex: '1 1 220px',
            padding: '7px 12px',
            border: '1.5px solid #dde3ef',
            borderRadius: 6,
            fontSize: 13,
            outline: 'none',
            color: '#0A1F44',
          }}
        />
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          style={{
            padding: '7px 12px',
            border: '1.5px solid #dde3ef',
            borderRadius: 6,
            fontSize: 13,
            color: '#0A1F44',
            background: '#fff',
            outline: 'none',
          }}
        >
          <option value="">Todos los estados</option>
          {Object.entries(STATUS_LABELS).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
        <button style={{
          padding: '7px 18px',
          background: '#00A9E0',
          color: '#fff',
          border: 'none',
          borderRadius: 6,
          fontSize: 13,
          fontWeight: 600,
          cursor: 'pointer',
        }}>
          + Nuevo servicio
        </button>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #dde3ef', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(10,31,68,.06)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#0A1F44' }}>
              {['ID', 'Cliente', 'Póliza', 'Tipo de servicio', 'Estado', 'Agente front', 'Agente back', 'Hora', 'Acciones'].map(h => (
                <th key={h} style={{
                  padding: '10px 14px',
                  textAlign: 'left',
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '.07em',
                  color: 'rgba(255,255,255,.8)',
                  whiteSpace: 'nowrap',
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '2.5rem', color: '#607090', fontSize: 14 }}>
                  No se encontraron servicios
                </td>
              </tr>
            ) : filtered.map((s, i) => (
              <tr key={s.id} style={{ borderBottom: '1px solid #dde3ef', background: i % 2 === 0 ? '#fff' : '#fafbfc' }}>
                <td style={td}><span style={{ fontWeight: 700, color: '#00A9E0', fontSize: 12 }}>{s.id}</span></td>
                <td style={td}><span style={{ fontWeight: 600 }}>{s.client}</span></td>
                <td style={{ ...td, color: '#607090', fontSize: 12 }}>{s.policy}</td>
                <td style={td}>{s.type}</td>
                <td style={td}>
                  <span className={`badge badge-${s.status}`}>{STATUS_LABELS[s.status]}</span>
                </td>
                <td style={{ ...td, color: '#607090' }}>{s.front}</td>
                <td style={{ ...td, color: '#607090' }}>{s.back}</td>
                <td style={{ ...td, color: '#607090', fontSize: 12 }}>{s.created.split(' ')[1]}</td>
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
        {filtered.length} servicio{filtered.length !== 1 ? 's' : ''} — Datos de muestra (conectar API próximamente)
      </p>
    </div>
  )
}

const td: React.CSSProperties = {
  padding: '10px 14px',
  fontSize: 13.5,
  verticalAlign: 'middle',
  color: '#0A1F44',
}

const actionBtn = (color: string): React.CSSProperties => ({
  padding: '4px 10px',
  fontSize: 12,
  fontWeight: 600,
  color,
  background: 'transparent',
  border: `1.5px solid ${color}`,
  borderRadius: 5,
  cursor: 'pointer',
})
