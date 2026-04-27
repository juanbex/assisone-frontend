import { useParams, useNavigate } from 'react-router-dom'
import { useService, useUpdateServiceStatus } from './useServices'
import { useState, useEffect } from 'react'

const ETA_BUFFER = 0.20

const STATUS_LABELS: Record<string, string> = {
  received:        'Recibido',
  in_coordination: 'En coordinación',
  uncoordinated:   'No coordinado',
  coordinated:     'Coordinado',
  in_service:      'En prestación',
  completed:       'Finalizado',
  cancelled:       'Cancelado',
}

// Solo el agente puede mover manualmente si el automático falla
const STATUS_FLOW: Record<string, string[]> = {
  received:        ['in_coordination', 'cancelled'],
  in_coordination: ['coordinated', 'uncoordinated', 'cancelled'],
  uncoordinated:   ['coordinated', 'cancelled'],
  coordinated:     ['in_service', 'cancelled'],
  in_service:      ['completed', 'cancelled'],
}

const STATUS_BADGE: Record<string, { bg: string; color: string }> = {
  received:        { bg: '#dbeafe', color: '#1d4ed8' },
  in_coordination: { bg: '#fef3c7', color: '#92400e' },
  uncoordinated:   { bg: '#fee2e2', color: '#991b1b' },
  coordinated:     { bg: '#d1fae5', color: '#065f46' },
  in_service:      { bg: '#fce7f3', color: '#9d174d' },
  completed:       { bg: '#f0fdf4', color: '#14532d' },
  cancelled:       { bg: '#f1f5f9', color: '#475569' },
}

const ASSIGNMENT_BADGE: Record<string, { bg: string; color: string; label: string }> = {
  pending:   { bg: '#fef9c3', color: '#854d0e', label: 'Pendiente' },
  accepted:  { bg: '#d1fae5', color: '#065f46', label: 'Aceptado' },
  rejected:  { bg: '#fee2e2', color: '#991b1b', label: 'Rechazado' },
  cancelled: { bg: '#f1f5f9', color: '#475569', label: 'Cancelado' },
}

function EtaCountdown({ respondedAt, providerMinutes }: { respondedAt: string; providerMinutes: number }) {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  const clientMinutes = Math.ceil(providerMinutes * (1 + ETA_BUFFER))
  const totalMs   = clientMinutes * 60 * 1000
  const startMs   = new Date(respondedAt).getTime()
  const elapsed   = now - startMs
  const remainMs  = Math.max(0, totalMs - elapsed)
  const pct       = Math.min(100, (elapsed / totalMs) * 100)
  const isAlert   = pct >= 80
  const isExpired = remainMs === 0

  const mins = Math.floor(remainMs / 60000)
  const secs = Math.floor((remainMs % 60000) / 1000)
  const barColor = isExpired ? '#dc2626' : isAlert ? '#d97706' : '#059669'

  return (
    <div style={{ marginTop: 12, background: isExpired ? '#fee2e2' : isAlert ? '#fef3c7' : '#f0fdf4', borderRadius: 8, padding: '10px 14px', border: `1px solid ${barColor}30` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <span style={{ fontSize: 12, color: '#607090' }}>
          Proveedor: <strong>{providerMinutes} min</strong> · Cliente: <strong>{clientMinutes} min</strong> (+{ETA_BUFFER * 100}%)
        </span>
        <span style={{ fontSize: 14, fontWeight: 700, color: barColor }}>
          {isExpired ? '🚨 VENCIDO' : `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')} restantes`}
        </span>
      </div>
      <div style={{ background: '#e5e7eb', borderRadius: 99, height: 6, overflow: 'hidden' }}>
        <div style={{ height: '100%', borderRadius: 99, width: `${pct}%`, background: barColor, transition: 'width 1s linear' }} />
      </div>
      {isAlert && !isExpired && (
        <div style={{ marginTop: 6, fontSize: 11, fontWeight: 700, color: '#d97706' }}>
          ⚠️ ≤20% restante — verificación al cliente en camino
        </div>
      )}
      {isExpired && (
        <div style={{ marginTop: 6, fontSize: 11, fontWeight: 700, color: '#dc2626' }}>
          🚨 Tiempo vencido — contactar al proveedor inmediatamente
        </div>
      )}
    </div>
  )
}

export default function ServiceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data, isLoading, isError } = useService(id!)
  const { mutate: updateStatus, isPending } = useUpdateServiceStatus()
  const [statusNotes, setStatusNotes] = useState('')
  const [showStatusChange, setShowStatusChange] = useState(false)
  const [nextStatus, setNextStatus] = useState('')

  if (isLoading) return <div style={pageWrap}><p style={{ color: '#607090' }}>Cargando...</p></div>
  if (isError || !data?.data) return <div style={pageWrap}><p style={{ color: '#dc2626' }}>Servicio no encontrado</p></div>

  const s = data.data
  const badge = STATUS_BADGE[s.status] ?? { bg: '#f1f5f9', color: '#475569' }
  const nextStates = STATUS_FLOW[s.status] ?? []
  const address = s.location?.address ?? ''
  const mapUrl = address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}` : null
  const acceptedAssignment = s.assignments?.find((a: any) => a.status === 'accepted')
  const hasEta = acceptedAssignment?.etaMinutes && acceptedAssignment?.respondedAt

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
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#0A1F44' }}>
              Servicio #{s.id.slice(0, 8).toUpperCase()}
            </h1>
            <span style={{ ...badgeStyle, background: badge.bg, color: badge.color }}>
              {STATUS_LABELS[s.status]}
            </span>
            {hasEta && (
              <span style={{ ...badgeStyle, background: '#e0f6fd', color: '#0088b8' }}>
                ⏱ Prov: {acceptedAssignment.etaMinutes}min · Cliente: {Math.ceil(acceptedAssignment.etaMinutes * (1 + ETA_BUFFER))}min
              </span>
            )}
          </div>
          <p style={{ margin: '4px 0 0', fontSize: 12, color: '#607090' }}>
            Creado {new Date(s.createdAt).toLocaleString('es-CO')} · {s.serviceType?.category?.name ?? '—'}
          </p>
        </div>
        {nextStates.length > 0 && (
          <button onClick={() => setShowStatusChange(!showStatusChange)}
            style={{ padding: '8px 18px', background: '#0A1F44', color: '#fff', border: 'none', borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            Cambiar estado
          </button>
        )}
      </div>

      {/* ETA Countdown */}
      {hasEta && (
        <EtaCountdown respondedAt={acceptedAssignment.respondedAt} providerMinutes={acceptedAssignment.etaMinutes} />
      )}

      {/* Status change */}
      {showStatusChange && (
        <div style={{ background: '#fff', border: '1.5px solid #00A9E0', borderRadius: 10, padding: '16px 20px', marginTop: 16, marginBottom: 8 }}>
          <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 600, color: '#0A1F44' }}>
            Cambio manual de estado
          </p>
          <p style={{ margin: '0 0 12px', fontSize: 12, color: '#607090' }}>
            Los estados cambian automáticamente vía WhatsApp. Usa esto solo si hay un problema técnico.
          </p>
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
          <textarea placeholder="Motivo del cambio manual..." value={statusNotes} onChange={e => setStatusNotes(e.target.value)} rows={2}
            style={{ width: '100%', padding: '8px 10px', border: '1.5px solid #dde3ef', borderRadius: 6, fontSize: 13, resize: 'vertical', boxSizing: 'border-box', fontFamily: 'Inter, system-ui, sans-serif' }} />
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14, marginTop: 20, marginBottom: 20 }}>
        <InfoCard title="Cliente">
          <Row label="Nombre"   value={s.client?.name ?? '—'} />
          <Row label="Teléfono" value={s.client?.phone ?? '—'} />
          <Row label="Póliza"   value={s.client?.policyNumber ?? '—'} />
        </InfoCard>
        <InfoCard title="Servicio">
          <Row label="Tipo"      value={s.serviceType?.name ?? '—'} />
          <Row label="Categoría" value={s.serviceType?.category?.name ?? '—'} />
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #f1f5f9', gap: 12, alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: '#607090' }}>Ubicación</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#0A1F44', textAlign: 'right' }}>{address || '—'}</span>
              {mapUrl && (
                <a href={mapUrl} target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: 11, color: '#00A9E0', textDecoration: 'none', fontWeight: 600, border: '1px solid #00A9E040', borderRadius: 4, padding: '1px 6px', whiteSpace: 'nowrap' }}>
                  🗺 Ver
                </a>
              )}
            </div>
          </div>
          {s.notes && <Row label="Notas" value={s.notes} />}
        </InfoCard>
        <InfoCard title="Agentes">
          <Row label="Front" value={s.frontAgent?.name ?? '—'} />
          <Row label="Back"  value={s.backAgent?.name ?? '—'} />
          {hasEta && <Row label="ETA proveedor" value={`${acceptedAssignment.etaMinutes} min (cliente: ${Math.ceil(acceptedAssignment.etaMinutes * 1.2)} min)`} />}
          {s.completedAt && <Row label="Finalizado" value={new Date(s.completedAt).toLocaleString('es-CO')} />}
        </InfoCard>
      </div>

      {/* Timeline */}
      {s.events && s.events.length > 0 && (
        <SectionCard title="Timeline">
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {s.events.map((ev: any, i: number) => (
              <div key={ev.id} style={{ display: 'flex', gap: 12, paddingBottom: 16 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#00A9E0', flexShrink: 0, marginTop: 3 }} />
                  {i < s.events!.length - 1 && <div style={{ width: 2, flex: 1, background: '#dde3ef', marginTop: 4 }} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#0A1F44', textTransform: 'capitalize' }}>
                    {ev.eventType.replace(/_/g, ' ')}
                  </div>
                  {ev.payload?.notes    && <div style={{ fontSize: 12, color: '#607090', marginTop: 2 }}>{ev.payload.notes}</div>}
                  {ev.payload?.reason   && <div style={{ fontSize: 12, color: '#dc2626', marginTop: 2 }}>{ev.payload.reason}</div>}
                  {ev.payload?.providersContacted !== undefined && (
                    <div style={{ fontSize: 12, color: '#607090', marginTop: 2 }}>{ev.payload.providersContacted} proveedor(es) contactado(s)</div>
                  )}
                  {ev.payload?.providerMinutes && (
                    <div style={{ fontSize: 12, color: '#0088b8', marginTop: 2 }}>
                      Proveedor: {ev.payload.providerMinutes}min → Cliente: {ev.payload.clientMinutes}min (+{ev.payload.bufferPct}%)
                    </div>
                  )}
                  {ev.payload?.alert && <div style={{ fontSize: 12, color: '#dc2626', fontWeight: 600, marginTop: 2 }}>🚨 {ev.payload.alert}</div>}
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
          {s.assignments.map((a: any) => {
            const ab = ASSIGNMENT_BADGE[a.status] ?? { bg: '#f1f5f9', color: '#475569', label: a.status }
            return (
              <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#0A1F44' }}>{a.provider.name}</div>
                  <div style={{ fontSize: 11, color: '#607090', marginTop: 2 }}>
                    {a.provider.whatsapp} · {a.provider.type}
                    {a.etaMinutes && <span style={{ marginLeft: 8, color: '#0088b8', fontWeight: 600 }}>⏱ Prometió: {a.etaMinutes} min</span>}
                  </div>
                </div>
                <span style={{ padding: '4px 12px', borderRadius: 99, fontSize: 11, fontWeight: 700, background: ab.bg, color: ab.color, border: `1px solid ${ab.color}30` }}>
                  {ab.label}
                </span>
              </div>
            )
          })}
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
