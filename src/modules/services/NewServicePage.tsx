import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useCreateService, useServiceTypes } from './useServices'

const DURATION_OPTIONS = [
  { value: 30,  label: '30 minutos' },
  { value: 45,  label: '45 minutos' },
  { value: 60,  label: '1 hora' },
  { value: 90,  label: '1 hora 30 min' },
  { value: 120, label: '2 horas' },
  { value: 180, label: '3 horas' },
  { value: 240, label: '4 horas o más' },
]

export default function NewServicePage() {
  const navigate = useNavigate()
  const { mutate: createService, isPending, error } = useCreateService()
  const { data: typesData } = useServiceTypes()
  const allTypes = typesData?.data ?? []

  const [form, setForm] = useState({
    clientName: '', clientPhone: '', clientPolicyNumber: '',
    serviceTypeId: '', address: '', notes: '', durationMinutes: 60,
  })
  const [category, setCategory] = useState('')

  const filteredTypes = category
    ? allTypes.filter(t => t.category.name.toLowerCase() === category)
    : allTypes

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createService({
      clientName:         form.clientName,
      clientPhone:        form.clientPhone,
      clientPolicyNumber: form.clientPolicyNumber || undefined,
      serviceTypeId:      form.serviceTypeId,
      location:           { address: form.address, durationMinutes: parseInt(String(form.durationMinutes)) },
      notes:              form.notes || undefined,
    }, {
      onSuccess: (data: any) => navigate(`/services/${data.data.id}`),
    })
  }

  return (
    <div style={{ padding: '24px 28px', maxWidth: 720 }}>
      <button onClick={() => navigate('/services')} style={{ background: 'none', border: 'none', color: '#00A9E0', cursor: 'pointer', fontSize: 13, padding: 0, marginBottom: 12 }}>
        ← Volver a bandeja
      </button>
      <h1 style={{ margin: '0 0 4px', fontSize: '1.25rem', fontWeight: 700, color: '#0A1F44', borderBottom: '3px solid #00A9E0', display: 'inline-block', paddingBottom: 5 }}>
        Nuevo servicio
      </h1>
      <p style={{ margin: '8px 0 24px', fontSize: 13, color: '#607090' }}>
        Completa los datos del asegurado y el tipo de servicio requerido.
      </p>

      <form onSubmit={handleSubmit}>
        {/* Cliente */}
        <Section title="Datos del asegurado">
          <Row2>
            <Field label="Nombre completo *">
              <input value={form.clientName} onChange={set('clientName')} required placeholder="Carlos Pérez" style={inp} />
            </Field>
            <Field label="Teléfono (WhatsApp) *">
              <input value={form.clientPhone} onChange={set('clientPhone')} required placeholder="3001234567" style={inp} />
            </Field>
          </Row2>
          <Field label="Número de póliza">
            <input value={form.clientPolicyNumber} onChange={set('clientPolicyNumber')} placeholder="SBS-12345" style={inp} />
          </Field>
        </Section>

        {/* Servicio */}
        <Section title="Tipo de servicio">
          <Row2>
            <Field label="Categoría">
              <select value={category} onChange={e => { setCategory(e.target.value); setForm(f => ({ ...f, serviceTypeId: '' })) }} style={inp}>
                <option value="">Todas</option>
                <option value="auto">Auto</option>
                <option value="hogar">Hogar</option>
                <option value="medico">Médico</option>
              </select>
            </Field>
            <Field label="Tipo de servicio *">
              <select value={form.serviceTypeId} onChange={set('serviceTypeId')} required style={inp}>
                <option value="">Selecciona...</option>
                {filteredTypes.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </Field>
          </Row2>
        </Section>

        {/* Ubicación y duración */}
        <Section title="Ubicación y tiempo de prestación">
          <Field label="Dirección del incidente *">
            <input value={form.address} onChange={set('address')} required placeholder="Calle 80 con Av. Boyacá, Bogotá" style={inp} />
          </Field>
          <Field label="Tiempo estimado de prestación del servicio *">
            <select value={form.durationMinutes} onChange={e => setForm(f => ({ ...f, durationMinutes: parseInt(e.target.value) }))} style={inp}>
              {DURATION_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <p style={{ margin: '4px 0 0', fontSize: 11, color: '#607090' }}>
              Tiempo estimado que tarda el servicio en prestarse una vez el técnico llega al sitio.
            </p>
          </Field>
          <Field label="Notas adicionales">
            <textarea value={form.notes} onChange={set('notes')} rows={3}
              placeholder="Detalles del incidente, referencias, observaciones..."
              style={{ ...inp, resize: 'vertical', fontFamily: 'Inter, system-ui, sans-serif' }} />
          </Field>
        </Section>

        {error && (
          <div style={{ background: '#fee2e2', color: '#991b1b', borderLeft: '4px solid #dc2626', borderRadius: 6, padding: '10px 14px', fontSize: 13, marginBottom: 16 }}>
            {(error as any)?.response?.data?.error ?? 'Error al crear el servicio'}
          </div>
        )}

        <div style={{ display: 'flex', gap: 10 }}>
          <button type="submit" disabled={isPending} style={{ padding: '10px 28px', background: '#00A9E0', color: '#fff', border: 'none', borderRadius: 7, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
            {isPending ? 'Creando...' : 'Crear servicio'}
          </button>
          <button type="button" onClick={() => navigate('/services')} style={{ padding: '10px 20px', background: 'transparent', border: '1.5px solid #dde3ef', borderRadius: 7, fontSize: 14, cursor: 'pointer', color: '#607090' }}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #dde3ef', borderRadius: 10, marginBottom: 16, overflow: 'hidden', boxShadow: '0 1px 3px rgba(10,31,68,.06)' }}>
      <div style={{ background: '#0A1F44', padding: '8px 16px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: 'rgba(255,255,255,.8)' }}>{title}</div>
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>{children}</div>
    </div>
  )
}

function Row2({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>{children}</div>
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: '#0A1F44' }}>{label}</label>
      {children}
    </div>
  )
}

const inp: React.CSSProperties = {
  padding: '8px 10px', border: '1.5px solid #dde3ef', borderRadius: 6,
  fontSize: 13, color: '#0A1F44', background: '#fff', outline: 'none', width: '100%', boxSizing: 'border-box',
}
