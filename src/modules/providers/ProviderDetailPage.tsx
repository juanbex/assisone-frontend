import { useParams, useNavigate } from 'react-router-dom'
import { useProvider } from './useProviders'

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente', accepted: 'Aceptado', rejected: 'Rechazado', cancelled: 'Cancelado',
}

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  pending:   { bg: '#fef3c7', color: '#92400e' },
  accepted:  { bg: '#d1fae5', color: '#065f46' },
  rejected:  { bg: '#fee2e2', color: '#991b1b' },
  cancelled: { bg: '#f1f5f9', color: '#475569' },
}

export default function ProviderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data, isLoading, isError } = useProvider(id!)

  if (isLoading) return <div style={wrap}><p style={{ color: '#607090' }}>Cargando proveedor...</p></div>
  if (isError || !data?.data) return <div style={wrap}><p style={{ color: '#dc2626' }}>Proveedor no encontrado</p></div>

  const p = data.data
  const acceptedCount = p.assignments?.filter((a: any) => a.status === 'accepted').length ?? 0
  const totalCount    = p._count?.assignments ?? 0
  const acceptRate    = totalCount > 0 ? Math.round((acceptedCount / totalCount) * 100) : 0

  return (
    <div style={wrap}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <button onClick={() => navigate('/providers')} style={{ background: 'none', border: 'none', color: '#00A9E0', cursor: 'pointer', fontSize: 13, padding: 0, marginBottom: 8 }}>
            ← Volver a proveedores
          </button>
          <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#0A1F44' }}>{p.name}</h1>
          <p style={{ margin: '4px 0 0', fontSize: 12, color: '#607090' }}>
            {p.type.replace('_', ' ')} · WhatsApp: {p.whatsapp}
          </p>
        </div>
        <button onClick={() => navigate(`/providers/${p.id}/edit`)} style={{ padding: '8px 18px', background: '#0A1F44', color: '#fff', border: 'none', borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          Editar
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <StatCard label="Servicios totales"  value={totalCount}    color="#0A1F44" />
        <StatCard label="Aceptados"          value={acceptedCount} color="#059669" />
        <StatCard label="Tasa de aceptación" value={`${acceptRate}%`} color={acceptRate >= 70 ? '#059669' : '#d97706'} />
      </div>

      {/* Info */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginBottom: 20 }}>
        <InfoCard title="Contacto">
          <Row label="Nombre"    value={p.name} />
          <Row label="WhatsApp"  value={p.whatsapp} />
          <Row label="Tipo"      value={p.type.replace('_', ' ')} />
          <Row label="Registrado" value={new Date(p.createdAt).toLocaleDateString('es-CO')} />
        </InfoCard>
        <InfoCard title="Zonas de cobertura">
          {Array.isArray(p.coverageZones) && p.coverageZones.length > 0
            ? (p.coverageZones as string[]).map((z, i) => (
                <div key={i} style={{ padding: '5px 0', borderBottom: '1px solid #f1f5f9', fontSize: 13, color: '#0A1F44' }}>
                  {z}
                </div>
              ))
            : <p style={{ color: '#607090', fontSize: 13, margin: 0 }}>Sin zonas registradas</p>
          }
        </InfoCard>
      </div>

      {/* Historial de servicios */}
      <div style={{ background: '#fff', border: '1px solid #dde3ef', borderRadius: 10, overflow: 'hidden', boxShadow: '0 1px 3px rgba(10,31,68,.06)' }}>
        <div style={{ background: '#0A1F44', padding: '10px 16px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: 'rgba(255,255,255,.8)' }}>
          Historial de asignaciones
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              {['Servicio', 'Cliente', 'Tipo', 'Estado', 'Fecha', 'ETA'].map(h => (
                <th key={h} style={{ padding: '8px 14px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#607090', borderBottom: '1px solid #dde3ef' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(!p.assignments || p.assignments.length === 0) && (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#607090', fontSize: 13 }}>Sin asignaciones aún</td></tr>
            )}
            {p.assignments?.map((a: any, i: number) => {
              const badge = STATUS_COLORS[a.status] ?? { bg: '#f1f5f9', color: '#475569' }
              return (
                <tr key={a.id} style={{ borderBottom: '1px solid #dde3ef', background: i % 2 === 0 ? '#fff' : '#fafbfc', cursor: 'pointer' }}
                  onClick={() => navigate(`/services/${a.service?.id}`)}>
                  <td style={{ ...td, fontWeight: 700, color: '#00A9E0', fontSize: 12, fontFamily: 'monospace' }}>
                    {a.service?.id?.slice(0, 8).toUpperCase()}
                  </td>
                  <td style={td}>{a.service?.client?.name ?? '—'}</td>
                  <td style={{ ...td, color: '#607090' }}>{a.service?.serviceType?.name ?? '—'}</td>
                  <td style={td}>
                    <span style={{ ...badgeS, background: badge.bg, color: badge.color }}>
                      {STATUS_LABELS[a.status] ?? a.status}
                    </span>
                  </td>
                  <td style={{ ...td, color: '#607090', fontSize: 12 }}>{new Date(a.sentAt).toLocaleDateString('es-CO')}</td>
                  <td style={{ ...td, color: '#607090' }}>{a.etaMinutes ? `${a.etaMinutes} min` : '—'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #dde3ef', borderRadius: 10, overflow: 'hidden', boxShadow: '0 1px 3px rgba(10,31,68,.06)' }}>
      <div style={{ background: '#0A1F44', padding: '8px 14px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: 'rgba(255,255,255,.8)' }}>{title}</div>
      <div style={{ padding: '12px 14px' }}>{children}</div>
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: any; color: string }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #dde3ef', borderRadius: 10, padding: '12px 20px', minWidth: 120, boxShadow: '0 1px 3px rgba(10,31,68,.06)' }}>
      <div style={{ fontSize: 11, color: '#607090', textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 600, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 700, color }}>{value}</div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #f1f5f9', gap: 12 }}>
      <span style={{ fontSize: 12, color: '#607090', flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 12, fontWeight: 600, color: '#0A1F44', textAlign: 'right' }}>{value}</span>
    </div>
  )
}

const wrap: React.CSSProperties  = { padding: '24px 28px' }
const td: React.CSSProperties    = { padding: '10px 14px', fontSize: 13, verticalAlign: 'middle', color: '#0A1F44' }
const badgeS: React.CSSProperties = { display: 'inline-block', padding: '2px 8px', borderRadius: 99, fontSize: 11, fontWeight: 700 }
