import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '../../shared/api/client'

const STATUS_LABELS: Record<string, string> = {
  coordinated: 'Coordinado', assigned: 'Asignado', in_progress: 'En seguimiento',
}

const STATUS_BADGE: Record<string, { bg: string; color: string }> = {
  coordinated: { bg: '#d1fae5', color: '#065f46' },
  assigned:    { bg: '#e0f6fd', color: '#0088b8' },
  in_progress: { bg: '#ede9fe', color: '#4c1d95' },
}

function useTracking() {
  return useQuery({
    queryKey: ['seguimiento'],
    queryFn: async () => { const { data } = await api.get('/api/services/seguimiento'); return data },
    refetchInterval: 15_000,
  })
}

function useNow() {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])
  return now
}

function EtaTimer({ respondedAt, etaMinutes }: { respondedAt: string; etaMinutes: number }) {
  const now = useNow()
  const startMs    = new Date(respondedAt).getTime()
  const totalMs    = etaMinutes * 60 * 1000
  const elapsedMs  = now - startMs
  const remainMs   = Math.max(0, totalMs - elapsedMs)
  const pct        = Math.min(100, (elapsedMs / totalMs) * 100)
  const isAlert    = pct >= 80   // ≤20% tiempo restante
  const isExpired  = remainMs === 0

  const mins = Math.floor(remainMs / 60000)
  const secs = Math.floor((remainMs % 60000) / 1000)

  const barColor = isExpired ? '#dc2626' : isAlert ? '#d97706' : '#059669'

  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: '#607090' }}>
          ⏱ ETA prometido: {etaMinutes} min
        </span>
        <span style={{
          fontSize: 13, fontWeight: 700,
          color: isExpired ? '#dc2626' : isAlert ? '#d97706' : '#059669',
        }}>
          {isExpired ? '⚠️ VENCIDO' : `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')} restantes`}
        </span>
      </div>
      <div style={{ background: '#e5e7eb', borderRadius: 99, height: 6, overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: 99,
          width: `${pct}%`,
          background: barColor,
          transition: 'width 1s linear, background .3s',
        }} />
      </div>
      {isAlert && !isExpired && (
        <div style={{ marginTop: 6, fontSize: 11, fontWeight: 700, color: '#d97706', background: '#fef3c7', padding: '4px 8px', borderRadius: 6, display: 'inline-block' }}>
          ⚠️ Menos del 20% del tiempo restante — seguimiento requerido
        </div>
      )}
      {isExpired && (
        <div style={{ marginTop: 6, fontSize: 11, fontWeight: 700, color: '#dc2626', background: '#fee2e2', padding: '4px 8px', borderRadius: 6, display: 'inline-block' }}>
          🚨 Tiempo prometido vencido — contactar al proveedor
        </div>
      )}
    </div>
  )
}

export default function SeguimientoPage() {
  const navigate = useNavigate()
  const { data, isLoading } = useTracking()
  const services = data?.data ?? []

  const alerts  = services.filter((s: any) => {
    const a = s.acceptedAssignment
    if (!a?.etaMinutes || !a?.respondedAt) return false
    const elapsed = Date.now() - new Date(a.respondedAt).getTime()
    const total   = a.etaMinutes * 60 * 1000
    return elapsed / total >= 0.8
  })

  return (
    <div style={{ padding: '24px 28px' }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 700, color: '#0A1F44', borderBottom: '3px solid #00A9E0', display: 'inline-block', paddingBottom: 6 }}>
          Dashboard de seguimiento
        </h1>
        <p style={{ margin: '6px 0 0', fontSize: 13, color: '#607090' }}>
          Servicios coordinados en tiempo real · actualiza cada 15s
        </p>
      </div>

      {/* Alerta global */}
      {alerts.length > 0 && (
        <div style={{ background: '#fef3c7', border: '1.5px solid #d97706', borderRadius: 10, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 20 }}>⚠️</span>
          <div>
            <div style={{ fontWeight: 700, color: '#92400e', fontSize: 14 }}>
              {alerts.length} servicio{alerts.length > 1 ? 's' : ''} requiere{alerts.length === 1 ? '' : 'n'} atención inmediata
            </div>
            <div style={{ fontSize: 12, color: '#b45309' }}>Tiempo prometido próximo a vencer o ya vencido</div>
          </div>
        </div>
      )}

      {/* Stats rápidas */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { label: 'Total en seguimiento', value: services.length, color: '#0A1F44' },
          { label: 'Coordinados',  value: services.filter((s: any) => s.status === 'coordinated').length,  color: '#059669' },
          { label: 'Asignados',    value: services.filter((s: any) => s.status === 'assigned').length,     color: '#0088b8' },
          { label: 'En progreso',  value: services.filter((s: any) => s.status === 'in_progress').length,  color: '#7c3aed' },
          { label: '⚠️ Alertas',   value: alerts.length,                                                   color: '#d97706' },
        ].map(c => (
          <div key={c.label} style={{ background: '#fff', border: '1px solid #dde3ef', borderRadius: 10, padding: '10px 18px', boxShadow: '0 1px 3px rgba(10,31,68,.06)' }}>
            <div style={{ fontSize: 11, color: '#607090', textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 600, marginBottom: 3 }}>{c.label}</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: c.color }}>{c.value}</div>
          </div>
        ))}
      </div>

      {/* Bandeja */}
      {isLoading && <p style={{ color: '#607090' }}>Cargando servicios...</p>}

      {!isLoading && services.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', background: '#fff', borderRadius: 12, border: '1px dashed #dde3ef', color: '#607090', fontSize: 14 }}>
          No hay servicios en seguimiento en este momento
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {services.map((s: any) => {
          const a = s.acceptedAssignment
          const badge = STATUS_BADGE[s.status] ?? { bg: '#f1f5f9', color: '#475569' }
          const hasEta = a?.etaMinutes && a?.respondedAt
          const elapsed = hasEta ? (Date.now() - new Date(a.respondedAt).getTime()) / (a.etaMinutes * 60 * 1000) : 0
          const isAlert = elapsed >= 0.8

          return (
            <div key={s.id}
              onClick={() => navigate(`/services/${s.id}`)}
              style={{
                background: '#fff',
                border: `1.5px solid ${isAlert ? '#d97706' : '#dde3ef'}`,
                borderRadius: 12,
                padding: '16px 20px',
                cursor: 'pointer',
                boxShadow: isAlert ? '0 0 0 3px #fef3c720' : '0 1px 3px rgba(10,31,68,.06)',
                transition: '.15s',
              }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                {/* Left */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <span style={{ fontWeight: 700, color: '#00A9E0', fontFamily: 'monospace', fontSize: 13 }}>
                      #{s.id.slice(0, 8).toUpperCase()}
                    </span>
                    <span style={{ padding: '2px 8px', borderRadius: 99, fontSize: 10, fontWeight: 700, background: badge.bg, color: badge.color }}>
                      {STATUS_LABELS[s.status]}
                    </span>
                    {isAlert && (
                      <span style={{ padding: '2px 8px', borderRadius: 99, fontSize: 10, fontWeight: 700, background: '#fef3c7', color: '#92400e' }}>
                        ⚠️ ALERTA
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#0A1F44' }}>{s.client.name}</div>
                  <div style={{ fontSize: 12, color: '#607090', marginTop: 2 }}>
                    {s.serviceType.name} · {s.location?.address ?? '—'}
                  </div>
                </div>
                {/* Right */}
                <div style={{ textAlign: 'right' }}>
                  {a && (
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#0A1F44' }}>{a.provider.name}</div>
                  )}
                  <div style={{ fontSize: 11, color: '#607090' }}>
                    Agente back: {s.backAgent?.name ?? '—'}
                  </div>
                  <div style={{ fontSize: 11, color: '#adb5c7', marginTop: 2 }}>
                    {new Date(s.createdAt).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>

              {/* ETA Timer */}
              {hasEta && (
                <EtaTimer respondedAt={a.respondedAt} etaMinutes={a.etaMinutes} />
              )}
              {!hasEta && a && (
                <div style={{ marginTop: 8, fontSize: 12, color: '#adb5c7', fontStyle: 'italic' }}>
                  Esperando confirmación de tiempo estimado del proveedor...
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
