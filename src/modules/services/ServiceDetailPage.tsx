import { useParams, useNavigate } from 'react-router-dom'
import { useService, useUpdateServiceStatus } from './useServices'
import { useState } from 'react'

const STATUS_LABELS: Record<string, string> = {
  received: 'Recibido', in_coordination: 'En coordinación', uncoordinated: 'No coordinado',
  coordinated: 'Coordinado', assigned: 'Asignado', in_progress: 'En seguimiento',
  completed: 'Finalizado', cancelled: 'Cancelado',
}

const STATUS_FLOW: Record<string, string[]> = {
  received:        ['in_coordination', 'cancelled'],
  in_coordination: ['coordinated', 'uncoordinated', 'cancelled'],
  uncoordinated:   ['coordinated', 'cancelled'],
  coordinated:     ['assigned', 'cancelled'],
  assigned:        ['in_progress', 'cancelled'],
  in_progress:     ['completed', 'cancelled'],
}

const BADGE_COLORS: Record<string, { bg: string; color: string }> = {
  received:        { bg: '#dbeafe', color: '#1d4ed8' },
  in_coordination: { bg: '#fef3c7', color: '#92400e' },
  uncoordinated:   { bg: '#fee2e2', color: '#991b1b' },
  coordinated:     { bg: '#d1fae5', color: '#065f46' },
  assigned:        { bg: '#e0f6fd', color: '#0088b8' },
  in_progress:     { bg: '#ede9fe', color: '#4c1d95' },
  completed:       { bg: '#f0fdf4', color: '#14532d' },
  cancelled:       { bg: '#f1f5f9', color: '#475569' },
}

export default function ServiceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data, isLoading, isError } = useService(id!)
  const { mutate: updateStatus, isPending } = useUpdateServiceStatus()
  const [statusNotes, setStatusNotes] = useState('')
  const [showStatusChange, setShowStatusChange] = useState(false)
  const [nextStatus, setNextStatus] = useState('')

  if (isLoading) return <div style={pageWrap}><p style={{ color: '#607090' }}>Cargando servicio...</p></div>
  if (isError || !data?.data) return <div style={pageWrap}><p style={{ color: '#dc2626' }}>Servicio no encontrado</p></div>

  const s = data.data
  const badge = BADGE_COLORS[s.status] ?? { bg: '#f1f5f9', color: '#475569' }
  const nextStates = STATUS_FLOW[s.status] ?? []

  const handleStatusChange = () => {
    if (!nextStatus) return
    updateStatus({ id: s.id, status: nextStatus, notes: statusNotes }, {
      onSuccess: () => { setShowStatusChange(false); setStatusNotes(''); setNextStatus('') }
    })
  }

  return (
    <div style={pageWrap}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <button onClick={() => navigate('/services')} style={{ background: 'none', border: 'none', color: '#00A9E0', cursor: 'pointer', fontSize: 13, padding: 0, marginBottom: 8 }}>
            ← Volver a bandeja
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#0A1F44' }}>
              Servicio #{s.id.slice(0, 8).toUpperCase()}
            </h1>
            <span style={{ ...badgeStyle, background: badge.bg, color: badge.color }}>
              {STATUS_LABELS[s.status]}
            </span>
          </div>
          <p style={{ margin: '4px 0 0', fontSize: 12, color: '#607090' }}>
            Creado {new Date(s.createdAt).toLocaleString('es-CO')} · {s.serviceType.category.name}
          </p>
        </div>
        {nextStates.length > 0 && (
          <button onClick={() => setShowStatusChange(!showStatusChange)}
            style={{ padding: '8px 18px', background: '#0A1F44', color: '#fff', border: 'none', borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            Cambiar estado
          </button>
        )}
      </div>

      {/* Status change panel */}
      {showStatusChange && (
        <div style={{ background: '#fff', border: '1.5px solid #00A9E0', borderRadius: 10, padding: '16px 20px', marginBottom: 20 }}>
          <p style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 600, color: '#0A1F44' }}>Nuevo estado</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
            {nextStates.map(st => (
              <button key={st} onClick={() => setNextStatus(st)} style={{
                padding: '6px 14px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                background: nextStatus === st ? '#00A9E0' : 'transparent',
                color: nextStatus === st ? '#fff' : '#00A9E0',
                border: '1.5px solid #00A9E0',
              }}>
                {STATUS_LABELS[st]}
              </button>
            ))}
          </div>
          <textarea
            placeholder="Notas (opcional)..."
            value={statusNotes}
            onChange={e => setStatusNotes(e.target.value)}
            rows={2}
            style={{ width: '100%', padding: '8px 10px', border: '1.5px solid #dde3ef', borderRadius: 6, fontSize: 13, resize: 'vertical', boxSizing: 'border-box', fontFamily: 'Inter, system-ui, sans-serif' }}
          />
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <button onClick={handleStatusChange} disabled={!nextStatus || isPending}
              style={{ padding: '7px 18px', background: '#00A9E0', color: '#fff', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              {isPending ? 'Guardando...' : 'Confirmar'}
            </button>
            <button onClick={() => setShowStatusChange(false)}
              style={{ padding: '7px 14px', background: 'transparent', border: '1.5px solid #dde3ef', borderRadius: 6, fontSize: 13, cursor: 'pointer', color: '#607090' }}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Info cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14, marginBottom: 20 }}>
        <InfoCard title="Cliente">
          <Row label="Nombre"   value={s.client.name} />
          <Row label="Teléfono" value={s.client.phone} />
          <Row label="Póliza"   value={s.client.policyNumber ?? '—'} />
        </InfoCard>
        <InfoCard title="Servicio">
          <Row label="Tipo"      value={s.serviceType.name} />
          <Row label="Categoría" value={s.serviceType.category.name} />
          <Row label="Ubicación" value={s.location?.address ?? '—'} />
          {s.notes && <Row label="Notas" value={s.notes} />}
        </InfoCard>
        <InfoCard title="Agentes">
          <Row label="Front" value={s.frontAgent?.name ?? '—'} />
          <Row label="Back"  value={s.backAgent?.name ?? '—'} />
          {s.assignedAt  && <Row label="Asignado"   value={new Date(s.assignedAt).toLocaleString('es-CO')} />}
          {s.completedAt && <Row label="Finalizado" value={new Date(s.completedAt).toLocaleString('es-CO')} />}
        </InfoCard>
      </div>

      {/* Timeline */}
      {s.events && s.events.length > 0 && (
        <SectionCard title="Timeline del servicio">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {s.events.map((ev: any, i: number) => (
              <div key={ev.id} style={{ display: 'flex', gap: 12, paddingBottom: 16 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#00A9E0', flexShrink: 0, marginTop: 3 }} />
                  {i < s.events!.length - 1 && <div style={{ width: 2, flex: 1, background: '#dde3ef', marginTop: 4 }} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#0A1F44', textTransform: 'capitalize' }}>{ev.eventType.replace('_', ' ')}</div>
                  {ev.payload?.notes && <div style={{ fontSize: 12, color: '#607090', marginTop: 2 }}>{ev.payload.notes}</div>}
                  <div style={{ fontSize: 11, color: '#adb5c7', marginTop: 2 }}>{new Date(ev.createdAt).toLocaleString('es-CO')}</div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* Assignments */}
      {s.assignments && s.assignments.length > 0 && (
        <SectionCard title="Proveedores contactados">
          {s.assignments.map((a: any) => (
            <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #dde3ef' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#0A1F44' }}>{a.provider.name}</div>
                <div style={{ fontSize: 11, color: '#607090' }}>{a.provider.whatsapp} · {a.provider.type}</div>
              </div>
              <span style={{ ...badgeStyle, ...(BADGE_COLORS[a.status] ?? {}) }}>{a.status}</span>
            </div>
          ))}
        </SectionCard>
      )}

      {/* Evidences */}
      {s.evidences && s.evidences.length > 0 && (
        <SectionCard title={`Evidencias (${s.evidences.length})`}>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {s.evidences.map((ev: any) => (
              <a key={ev.id} href={ev.s3Url} target="_blank" rel="noopener noreferrer"
                style={{ width: 80, height: 80, background: '#f1f5f9', borderRadius: 8, border: '1px solid #dde3ef', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#607090' }}>
                foto
              </a>
            ))}
          </div>
        </SectionCard>
      )}
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

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #dde3ef', borderRadius: 10, overflow: 'hidden', boxShadow: '0 1px 3px rgba(10,31,68,.06)', marginBottom: 14 }}>
      <div style={{ padding: '10px 16px', borderBottom: '1px solid #dde3ef', fontSize: 13, fontWeight: 700, color: '#0A1F44' }}>{title}</div>
      <div style={{ padding: '12px 16px' }}>{children}</div>
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

const pageWrap: React.CSSProperties = { padding: '24px 28px' }
const badgeStyle: React.CSSProperties = { display: 'inline-block', padding: '3px 8px', borderRadius: 99, fontSize: 11, fontWeight: 700 }
