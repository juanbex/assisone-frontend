import { useParams, useNavigate } from 'react-router-dom'
import { useProvider, PROVIDER_TYPES, TYPE_CATEGORY_COLOR } from './useProviders'

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente', accepted: 'Aceptado', rejected: 'Rechazado', cancelled: 'Cancelado',
}

export default function ProviderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data, isLoading, isError } = useProvider(id!)

  if (isLoading) return <div style={wrap}><p style={{ color: '#607090' }}>Cargando proveedor...</p></div>
  if (isError || !data?.data) return <div style={wrap}><p style={{ color: '#dc2626' }}>Proveedor no encontrado</p></div>

  const p = data.data
  const cat = PROVIDER_TYPES.find(t => t.value === p.type)?.category ?? 'auto'
  const color = TYPE_CATEGORY_COLOR[cat]
  const typeLabel = PROVIDER_TYPES.find(t => t.value === p.type)?.label ?? p.type
  const zones: string[] = p.coverageZones ?? []
  const accepted = p.assignments.filter(a => a.status === 'accepted').length
  const rate = p.assignments.length > 0 ? Math.round((accepted / p.assignments.length) * 100) : 0

  return (
    <div style={wrap}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <button onClick={() => navigate('/providers')} style={{ background: 'none', border: 'none', color: '#00A9E0', cursor: 'pointer', fontSize: 13, padding: 0, marginBottom: 8 }}>
            ← Volver a proveedores
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: `${color}18`, border: `2px solid ${color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, color }}>
              {p.name[0].toUpperCase()}
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#0A1F44' }}>{p.name}</h1>
              <span style={{ padding: '2px 9px', borderRadius: 99, fontSize: 11, fontWeight: 700, background: `${color}18`, color, border: `1px solid ${color}30` }}>
                {typeLabel}
              </span>
            </div>
          </div>
        </div>
        <button onClick={() => navigate(`/providers/${id}/edit`)}
          style={{ padding: '8px 18px', background: '#0A1F44', color: '#fff', border: 'none', borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          Editar
        </button>
      </div>

      {/* Info cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 20 }}>
        <InfoCard title="Contacto">
          <Row label="WhatsApp" value={p.whatsapp} />
          <Row label="Registrado" value={new Date(p.createdAt).toLocaleDateString('es-CO')} />
        </InfoCard>
        <InfoCard title="Cobertura">
          {zones.length === 0
            ? <p style={{ margin: 0, fontSize: 12, color: '#adb5c7' }}>Sin zonas configuradas</p>
            : zones.map(z => <div key={z} style={{ fontSize: 12, color: '#0A1F44', padding: '3px 0', borderBottom: '1px solid #f1f5f9' }}>{z}</div>)
          }
        </InfoCard>
        <InfoCard title="Estadísticas">
          <Row label="Total asignaciones" value={String(p.assignments.length)} />
          <Row label="Aceptadas" value={String(accepted)} />
          <Row label="Tasa de aceptación" value={`${rate}%`} />
        </InfoCard>
      </div>

      {/* Historial */}
      <div style={{ background: '#fff', border: '1px solid #dde3ef', borderRadius: 10, overflow: 'hidden', boxShadow: '0 1px 3px rgba(10,31,68,.06)' }}>
        <div style={{ padding: '10px 16px', borderBottom: '1px solid #dde3ef', fontSize: 13, fontWeight: 700, color: '#0A1F44' }}>
          Historial de asignaciones ({p.assignments.length})
        </div>
        {p.assignments.length === 0
          ? <p style={{ textAlign: 'center', padding: '2rem', color: '#607090', fontSize: 13, margin: 0 }}>Sin asignaciones aún</p>
          : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  {['Servicio', 'Cliente', 'Tipo', 'Estado', 'Fecha'].map(h => (
                    <th key={h} style={{ padding: '8px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#607090', textTransform: 'uppercase', letterSpacing: '.06em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {p.assignments.map((a, i) => (
                  <tr key={a.id} onClick={() => navigate(`/services/${a.service.id}`)}
                    style={{ borderTop: '1px solid #dde3ef', cursor: 'pointer', background: i % 2 === 0 ? '#fff' : '#fafbfc' }}>
                    <td style={td}><span style={{ fontWeight: 700, color: '#00A9E0', fontSize: 11, fontFamily: 'monospace' }}>{a.service.id.slice(0, 8).toUpperCase()}</span></td>
                    <td style={td}>{a.service.client.name}</td>
                    <td style={td}>{a.service.serviceType.name}</td>
                    <td style={td}>
                      <span style={{
                        padding: '2px 8px', borderRadius: 99, fontSize: 10, fontWeight: 700,
                        background: a.status === 'accepted' ? '#d1fae5' : a.status === 'rejected' ? '#fee2e2' : '#f1f5f9',
                        color: a.status === 'accepted' ? '#065f46' : a.status === 'rejected' ? '#991b1b' : '#475569',
                      }}>
                        {STATUS_LABELS[a.status] ?? a.status}
                      </span>
                    </td>
                    <td style={{ ...td, color: '#607090', fontSize: 12 }}>{new Date(a.sentAt).toLocaleDateString('es-CO')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        }
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

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #f1f5f9', gap: 12 }}>
      <span style={{ fontSize: 12, color: '#607090' }}>{label}</span>
      <span style={{ fontSize: 12, fontWeight: 600, color: '#0A1F44' }}>{value}</span>
    </div>
  )
}

const wrap: React.CSSProperties = { padding: '24px 28px' }
const td: React.CSSProperties = { padding: '9px 14px', fontSize: 13, verticalAlign: 'middle', color: '#0A1F44' }
