import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useCreateProvider, useUpdateProvider, useProvider, PROVIDER_TYPES } from './useProviders'

export default function ProviderFormPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id?: string }>()
  const isEdit = !!id

  const { data } = useProvider(id ?? '')
  const { mutate: create, isPending: creating } = useCreateProvider()
  const { mutate: update, isPending: updating } = useUpdateProvider()

  const [form, setForm] = useState({ name: '', whatsapp: '', type: '', zones: '' })
  const [error, setError] = useState('')

  useEffect(() => {
    if (data?.data) {
      const p = data.data
      setForm({ name: p.name, whatsapp: p.whatsapp, type: p.type, zones: (p.coverageZones ?? []).join(', ') })
    }
  }, [data])

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const payload = {
      name:          form.name,
      whatsapp:      form.whatsapp.replace(/\D/g, ''),
      type:          form.type,
      coverageZones: form.zones.split(',').map(z => z.trim()).filter(Boolean),
    }

    if (isEdit) {
      update({ id, ...payload }, {
        onSuccess: () => navigate(`/providers/${id}`),
        onError: (err: any) => setError(err.response?.data?.error ?? 'Error al actualizar'),
      })
    } else {
      create(payload, {
        onSuccess: (data: any) => navigate(`/providers/${data.data.id}`),
        onError: (err: any) => setError(err.response?.data?.error ?? 'Error al crear proveedor'),
      })
    }
  }

  return (
    <div style={{ padding: '24px 28px', maxWidth: 640 }}>
      <button onClick={() => navigate('/providers')} style={{ background: 'none', border: 'none', color: '#00A9E0', cursor: 'pointer', fontSize: 13, padding: 0, marginBottom: 12 }}>
        ← Volver a proveedores
      </button>
      <h1 style={{ margin: '0 0 4px', fontSize: '1.25rem', fontWeight: 700, color: '#0A1F44', borderBottom: '3px solid #00A9E0', display: 'inline-block', paddingBottom: 5 }}>
        {isEdit ? 'Editar proveedor' : 'Nuevo proveedor'}
      </h1>
      <p style={{ margin: '8px 0 24px', fontSize: 13, color: '#607090' }}>
        {isEdit ? 'Actualiza los datos del proveedor.' : 'Registra un nuevo proveedor para el push de coordinación.'}
      </p>

      <form onSubmit={handleSubmit}>
        <Section title="Datos del proveedor">
          <Grid2>
            <Field label="Nombre *">
              <input value={form.name} onChange={set('name')} required style={inp} placeholder="Grúas García" />
            </Field>
            <Field label="WhatsApp * (solo números)">
              <input value={form.whatsapp} onChange={set('whatsapp')} required style={inp} placeholder="573001234567" />
            </Field>
          </Grid2>
          <Field label="Tipo de servicio *">
            <select value={form.type} onChange={set('type')} required style={inp}>
              <option value="">Selecciona...</option>
              {['auto', 'hogar', 'medico'].map(cat => (
                <optgroup key={cat} label={cat.toUpperCase()}>
                  {PROVIDER_TYPES.filter(t => t.category === cat).map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </Field>
        </Section>

        <Section title="Zonas de cobertura">
          <Field label="Ciudades o municipios (separados por coma)">
            <input value={form.zones} onChange={set('zones')} style={inp} placeholder="Bogotá, Soacha, Chía, Cajicá" />
          </Field>
          <p style={{ margin: '4px 0 0', fontSize: 12, color: '#607090' }}>
            El sistema filtrará proveedores por zona al hacer el push masivo de coordinación.
          </p>
        </Section>

        {error && (
          <div style={{ background: '#fee2e2', color: '#991b1b', borderLeft: '4px solid #dc2626', borderRadius: 6, padding: '10px 14px', fontSize: 13, marginBottom: 16 }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: 10 }}>
          <button type="submit" disabled={creating || updating}
            style={{ padding: '10px 28px', background: '#00A9E0', color: '#fff', border: 'none', borderRadius: 7, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
            {(creating || updating) ? 'Guardando...' : (isEdit ? 'Guardar cambios' : 'Crear proveedor')}
          </button>
          <button type="button" onClick={() => navigate('/providers')}
            style={{ padding: '10px 20px', background: 'transparent', border: '1.5px solid #dde3ef', borderRadius: 7, fontSize: 14, cursor: 'pointer', color: '#607090' }}>
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

function Grid2({ children }: { children: React.ReactNode }) {
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

const inp: React.CSSProperties = { padding: '8px 10px', border: '1.5px solid #dde3ef', borderRadius: 6, fontSize: 13, color: '#0A1F44', background: '#fff', outline: 'none', width: '100%', boxSizing: 'border-box' }
