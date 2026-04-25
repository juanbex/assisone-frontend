import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProviders, useProviderStats, PROVIDER_TYPES, TYPE_CATEGORY_COLOR } from './useProviders'

export default function ProvidersPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [filterType, setFilterType] = useState('')

  const { data, isLoading } = useProviders({ type: filterType, search })
  const { data: statsData } = useProviderStats()

  const providers = data?.data ?? []
  const stats = statsData?.data

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setSearch(searchInput) }

  const getTypeLabel = (type: string) => PROVIDER_TYPES.find(t => t.value === type)?.label ?? type
  const getTypeCategory = (type: string) => PROVIDER_TYPES.find(t => t.value === type)?.category ?? 'auto'

  return (
    <div style={{ padding: '24px 28px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 700, color: '#0A1F44', borderBottom: '3px solid #00A9E0', display: 'inline-block', paddingBottom: 6 }}>
            Proveedores
          </h1>
          <p style={{ margin: '6px 0 0', fontSize: 13, color: '#607090' }}>
            {stats?.total ?? 0} proveedor{stats?.total !== 1 ? 'es' : ''} registrado{stats?.total !== 1 ? 's' : ''}
          </p>
        </div>
        <button onClick={() => navigate('/providers/new')}
          style={{ padding: '8px 20px', background: '#00A9E0', color: '#fff', border: 'none', borderRadius: 7, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
          + Nuevo proveedor
        </button>
      </div>

      {/* Stats por categoría */}
      {stats && stats.byType.length > 0 && (
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
          {['auto', 'hogar', 'medico'].map(cat => {
            const count = stats.byType
              .filter(t => PROVIDER_TYPES.find(p => p.value === t.type)?.category === cat)
              .reduce((a, b) => a + b._count._all, 0)
            return (
              <div key={cat} style={{ background: '#fff', border: '1px solid #dde3ef', borderRadius: 10, padding: '10px 18px', boxShadow: '0 1px 3px rgba(10,31,68,.06)' }}>
                <div style={{ fontSize: 11, color: '#607090', textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 600, marginBottom: 3 }}>{cat}</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: TYPE_CATEGORY_COLOR[cat] }}>{count}</div>
              </div>
            )
          })}
        </div>
      )}

      {/* Filters */}
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <input placeholder="Buscar por nombre o WhatsApp..." value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          style={{ flex: '1 1 220px', padding: '7px 12px', border: '1.5px solid #dde3ef', borderRadius: 6, fontSize: 13, outline: 'none', color: '#0A1F44' }} />
        <select value={filterType} onChange={e => setFilterType(e.target.value)}
          style={{ padding: '7px 12px', border: '1.5px solid #dde3ef', borderRadius: 6, fontSize: 13, color: '#0A1F44', background: '#fff', outline: 'none' }}>
          <option value="">Todos los tipos</option>
          {PROVIDER_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        <button type="submit" style={{ padding: '7px 16px', background: '#0A1F44', color: '#fff', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Buscar</button>
      </form>

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #dde3ef', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(10,31,68,.06)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#0A1F44' }}>
              {['Proveedor', 'WhatsApp', 'Tipo', 'Cobertura', 'Servicios', 'Acciones'].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: 'rgba(255,255,255,.8)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={6} style={emptyTd}>Cargando proveedores...</td></tr>}
            {!isLoading && providers.length === 0 && (
              <tr><td colSpan={6} style={emptyTd}>
                No hay proveedores.{' '}
                <span onClick={() => navigate('/providers/new')} style={{ color: '#00A9E0', cursor: 'pointer', fontWeight: 600 }}>Crear el primero →</span>
              </td></tr>
            )}
            {providers.map((p, i) => {
              const cat = getTypeCategory(p.type)
              const color = TYPE_CATEGORY_COLOR[cat]
              const zones: string[] = p.coverageZones ?? []
              return (
                <tr key={p.id} onClick={() => navigate(`/providers/${p.id}`)}
                  style={{ borderBottom: '1px solid #dde3ef', background: i % 2 === 0 ? '#fff' : '#fafbfc', cursor: 'pointer' }}>
                  <td style={td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: `${color}18`, border: `1.5px solid ${color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color, flexShrink: 0 }}>
                        {p.name[0].toUpperCase()}
                      </div>
                      <span style={{ fontWeight: 600 }}>{p.name}</span>
                    </div>
                  </td>
                  <td style={{ ...td, color: '#607090', fontFamily: 'monospace', fontSize: 12 }}>{p.whatsapp}</td>
                  <td style={td}>
                    <span style={{ padding: '3px 9px', borderRadius: 99, fontSize: 11, fontWeight: 700, background: `${color}18`, color, border: `1px solid ${color}30` }}>
                      {getTypeLabel(p.type)}
                    </span>
                  </td>
                  <td style={{ ...td, color: '#607090', fontSize: 12 }}>
                    {zones.length === 0 ? '—' : zones.slice(0, 3).join(', ') + (zones.length > 3 ? ` +${zones.length - 3}` : '')}
                  </td>
                  <td style={{ ...td, fontWeight: 700, color: '#0A1F44' }}>{p._count?.assignments ?? 0}</td>
                  <td style={td} onClick={e => e.stopPropagation()}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => navigate(`/providers/${p.id}`)} style={actionBtn('#00A9E0')}>Ver</button>
                      <button onClick={() => navigate(`/providers/${p.id}/edit`)} style={actionBtn('#0A1F44')}>Editar</button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const td: React.CSSProperties = { padding: '10px 14px', fontSize: 13.5, verticalAlign: 'middle', color: '#0A1F44' }
const emptyTd: React.CSSProperties = { textAlign: 'center', padding: '2.5rem', color: '#607090', fontSize: 14 }
const actionBtn = (color: string): React.CSSProperties => ({ padding: '4px 10px', fontSize: 11, fontWeight: 600, color, background: 'transparent', border: `1.5px solid ${color}`, borderRadius: 5, cursor: 'pointer' })
