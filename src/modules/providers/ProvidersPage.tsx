import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProviders, useProviderStats, useSeed } from './useProviders'

const TYPE_LABELS: Record<string, string> = {
  grua_liviana: 'Grúa liviana', grua_pesada: 'Grúa pesada', carro_taller: 'Carro taller',
  conductor_elegido: 'Conductor elegido', plomeria: 'Plomería', gas: 'Gas', electricidad: 'Electricidad',
  medico: 'Médico', cerrajeria: 'Cerrajería', otro: 'Otro',
}

export default function ProvidersPage() {
  const navigate = useNavigate()
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch]           = useState('')
  const [typeFilter, setTypeFilter]   = useState('')

  const { data, isLoading, isError } = useProviders({ search, type: typeFilter })
  const { data: statsData }          = useProviderStats()
  const { mutate: seed, isPending: seeding, data: seedResult } = useSeed()

  const providers = data?.data ?? []
  const total     = data?.total ?? 0
  const stats     = statsData?.data

  return (
    <div style={{ padding: '24px 28px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 700, color: '#0A1F44', borderBottom: '3px solid #00A9E0', display: 'inline-block', paddingBottom: 6 }}>
            Proveedores
          </h1>
          <p style={{ margin: '6px 0 0', fontSize: 13, color: '#607090' }}>
            Red de proveedores disponibles — {total} registrados
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => seed()} disabled={seeding}
            style={{ padding: '7px 14px', background: seeding ? '#90d4f0' : 'transparent', border: '1.5px solid #00A9E0', color: '#00A9E0', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            {seeding ? 'Ejecutando...' : '⚡ Seed tipos de servicio'}
          </button>
          <button onClick={() => navigate('/providers/new')}
            style={{ padding: '7px 16px', background: '#00A9E0', color: '#fff', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            + Nuevo proveedor
          </button>
        </div>
      </div>

      {/* Seed result */}
      {seedResult && (
        <div style={{ background: '#d1fae5', border: '1px solid #a7f3d0', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 12, color: '#065f46' }}>
          <strong>Seed completado:</strong> {seedResult.results?.length} acciones ejecutadas.
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <StatCard label="Total proveedores" value={stats?.total ?? 0} color="#0A1F44" />
        {stats?.byType?.map((t: any) => (
          <StatCard key={t.type} label={t.type} value={t._count} color="#00A9E0" />
        ))}
      </div>

      {/* Filters */}
      <form onSubmit={e => { e.preventDefault(); setSearch(searchInput) }}
        style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <input placeholder="Buscar por nombre o WhatsApp..." value={searchInput} onChange={e => setSearchInput(e.target.value)}
          style={{ flex: '1 1 220px', padding: '7px 12px', border: '1.5px solid #dde3ef', borderRadius: 6, fontSize: 13, outline: 'none', color: '#0A1F44' }} />
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
          style={{ padding: '7px 12px', border: '1.5px solid #dde3ef', borderRadius: 6, fontSize: 13, color: '#0A1F44', background: '#fff', outline: 'none' }}>
          <option value="">Todos los tipos</option>
          {Object.entries(TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <button type="submit" style={{ padding: '7px 16px', background: '#0A1F44', color: '#fff', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          Buscar
        </button>
      </form>

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #dde3ef', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(10,31,68,.06)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#0A1F44' }}>
              {['Proveedor', 'WhatsApp', 'Tipo', 'Zonas', 'Servicios', 'Registrado', 'Acciones'].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: 'rgba(255,255,255,.8)', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={7} style={emptyTd}>Cargando proveedores...</td></tr>}
            {isError   && <tr><td colSpan={7} style={{ ...emptyTd, color: '#dc2626' }}>Error al cargar proveedores</td></tr>}
            {!isLoading && !isError && providers.length === 0 && (
              <tr><td colSpan={7} style={emptyTd}>
                No hay proveedores.{' '}
                <span onClick={() => navigate('/providers/new')} style={{ color: '#00A9E0', cursor: 'pointer', fontWeight: 600 }}>Crear el primero →</span>
              </td></tr>
            )}
            {providers.map((p, i) => (
              <tr key={p.id} style={{ borderBottom: '1px solid #dde3ef', background: i % 2 === 0 ? '#fff' : '#fafbfc', cursor: 'pointer' }}
                onClick={() => navigate(`/providers/${p.id}`)}>
                <td style={{ ...td, fontWeight: 600 }}>{p.name}</td>
                <td style={{ ...td, fontFamily: 'monospace', fontSize: 12, color: '#00A9E0' }}>{p.whatsapp}</td>
                <td style={td}><TypeBadge type={p.type} /></td>
                <td style={{ ...td, color: '#607090', fontSize: 12 }}>
                  {Array.isArray(p.coverageZones) && p.coverageZones.length > 0
                    ? (p.coverageZones as string[]).join(', ')
                    : '—'}
                </td>
                <td style={{ ...td, textAlign: 'center', fontWeight: 700, color: '#0A1F44' }}>{p._count?.assignments ?? 0}</td>
                <td style={{ ...td, color: '#607090', fontSize: 12 }}>{new Date(p.createdAt).toLocaleDateString('es-CO')}</td>
                <td style={td} onClick={e => e.stopPropagation()}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => navigate(`/providers/${p.id}`)} style={actionBtn('#00A9E0')}>Ver</button>
                    <button onClick={() => navigate(`/providers/${p.id}/edit`)} style={actionBtn('#0A1F44')}>Editar</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p style={{ fontSize: 12, color: '#607090', marginTop: 12 }}>{total} proveedor{total !== 1 ? 'es' : ''}</p>
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #dde3ef', borderRadius: 10, padding: '12px 20px', minWidth: 110, boxShadow: '0 1px 3px rgba(10,31,68,.06)' }}>
      <div style={{ fontSize: 11, color: '#607090', textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 600, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 700, color }}>{value}</div>
    </div>
  )
}

function TypeBadge({ type }: { type: string }) {
  const colors: Record<string, string> = { grua_liviana: '#0088b8', grua_pesada: '#1d4ed8', carro_taller: '#7c3aed', conductor_elegido: '#059669', plomeria: '#d97706', gas: '#dc2626', medico: '#065f46' }
  return (
    <span style={{ background: '#f1f5f9', color: colors[type] ?? '#475569', padding: '2px 8px', borderRadius: 99, fontSize: 11, fontWeight: 700 }}>
      {type.replace('_', ' ')}
    </span>
  )
}

const td: React.CSSProperties = { padding: '10px 14px', fontSize: 13.5, verticalAlign: 'middle', color: '#0A1F44' }
const emptyTd: React.CSSProperties = { textAlign: 'center', padding: '2.5rem', color: '#607090', fontSize: 14 }
const actionBtn = (color: string): React.CSSProperties => ({
  padding: '4px 10px', fontSize: 12, fontWeight: 600, color,
  background: 'transparent', border: `1.5px solid ${color}`, borderRadius: 5, cursor: 'pointer',
})
