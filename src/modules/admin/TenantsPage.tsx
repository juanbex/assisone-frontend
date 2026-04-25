import { useState } from 'react'
import { useTenants, useCreateTenant, useUpdateTenant, Tenant } from './useAdmin'

export default function TenantsPage() {
  const { data, isLoading } = useTenants()
  const { mutate: createTenant, isPending: creating } = useCreateTenant()
  const { mutate: updateTenant, isPending: updating } = useUpdateTenant()

  const tenants = data?.data ?? []
  const [showCreate, setShowCreate] = useState(false)
  const [editTenant, setEditTenant] = useState<Tenant | null>(null)
  const [form, setForm] = useState({ name: '', slug: '' })
  const [error, setError] = useState('')

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const slugify = (v: string) => v.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-')

  const resetForm = () => { setForm({ name: '', slug: '' }); setError('') }

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    createTenant({ name: form.name, slug: form.slug || slugify(form.name) }, {
      onSuccess: () => { setShowCreate(false); resetForm() },
      onError: (err: any) => setError(err.response?.data?.error ?? 'Error al crear tenant'),
    })
  }

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editTenant) return
    updateTenant({ id: editTenant.id, name: form.name }, {
      onSuccess: () => { setEditTenant(null); resetForm() },
      onError: (err: any) => setError(err.response?.data?.error ?? 'Error al actualizar'),
    })
  }

  const openEdit = (t: Tenant) => {
    setEditTenant(t)
    setForm({ name: t.name, slug: t.slug })
  }

  return (
    <div style={{ padding: '24px 28px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 700, color: '#0A1F44', borderBottom: '3px solid #00A9E0', display: 'inline-block', paddingBottom: 6 }}>
            Tenants (Aseguradoras)
          </h1>
          <p style={{ margin: '6px 0 0', fontSize: 13, color: '#607090' }}>
            {tenants.length} aseguradora{tenants.length !== 1 ? 's' : ''} registrada{tenants.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button onClick={() => setShowCreate(true)}
          style={{ padding: '8px 20px', background: '#00A9E0', color: '#fff', border: 'none', borderRadius: 7, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
          + Nueva aseguradora
        </button>
      </div>

      {isLoading && <p style={{ color: '#607090' }}>Cargando...</p>}

      {/* Grid de tenants */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
        {tenants.map(t => (
          <div key={t.id} style={{ background: '#fff', border: '1px solid #dde3ef', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(10,31,68,.06)' }}>
            <div style={{ background: '#0A1F44', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{t.name}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', fontFamily: 'monospace' }}>{t.slug}</div>
              </div>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#00A9E0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#fff' }}>
                {t.name[0].toUpperCase()}
              </div>
            </div>
            <div style={{ padding: '14px 16px' }}>
              <div style={{ display: 'flex', gap: 16, marginBottom: 14 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#0A1F44' }}>{t._count.users}</div>
                  <div style={{ fontSize: 11, color: '#607090' }}>Usuarios</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#00A9E0' }}>{t._count.services}</div>
                  <div style={{ fontSize: 11, color: '#607090' }}>Servicios</div>
                </div>
                <div style={{ textAlign: 'center', marginLeft: 'auto' }}>
                  <div style={{ fontSize: 11, color: '#607090' }}>Creado</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#0A1F44' }}>
                    {new Date(t.createdAt).toLocaleDateString('es-CO')}
                  </div>
                </div>
              </div>
              <button onClick={() => openEdit(t)}
                style={{ width: '100%', padding: '7px', background: 'transparent', border: '1.5px solid #dde3ef', borderRadius: 7, fontSize: 12, fontWeight: 600, color: '#0A1F44', cursor: 'pointer' }}>
                Editar
              </button>
            </div>
          </div>
        ))}
      </div>

      {tenants.length === 0 && !isLoading && (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#607090', background: '#fff', borderRadius: 12, border: '1px dashed #dde3ef', fontSize: 14 }}>
          No hay aseguradoras registradas aún.
        </div>
      )}

      {/* Modal crear / editar */}
      {(showCreate || editTenant) && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,31,68,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: 14, padding: '28px', width: '100%', maxWidth: 420, boxShadow: '0 8px 40px rgba(10,31,68,.3)' }}>
            <h2 style={{ margin: '0 0 20px', fontSize: '1.1rem', fontWeight: 700, color: '#0A1F44' }}>
              {editTenant ? 'Editar aseguradora' : 'Nueva aseguradora'}
            </h2>
            <form onSubmit={editTenant ? handleEdit : handleCreate}>
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Nombre de la aseguradora *</label>
                <input value={form.name} onChange={set('name')} required style={inp} placeholder="SBS Seguros" />
              </div>
              {!editTenant && (
                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle}>Slug (identificador único)</label>
                  <input value={form.slug || slugify(form.name)} onChange={set('slug')}
                    style={inp} placeholder="sbs-seguros" />
                  <p style={{ margin: '4px 0 0', fontSize: 11, color: '#607090' }}>Se genera automáticamente si lo dejas vacío</p>
                </div>
              )}
              {error && <div style={errStyle}>{error}</div>}
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => { setShowCreate(false); setEditTenant(null); resetForm() }} style={cancelBtn}>Cancelar</button>
                <button type="submit" disabled={creating || updating} style={submitBtn}>
                  {(creating || updating) ? 'Guardando...' : (editTenant ? 'Guardar' : 'Crear')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

const labelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: '#0A1F44', display: 'block', marginBottom: 5 }
const inp: React.CSSProperties = { padding: '8px 10px', border: '1.5px solid #dde3ef', borderRadius: 6, fontSize: 13, color: '#0A1F44', background: '#fff', outline: 'none', width: '100%', boxSizing: 'border-box' }
const errStyle: React.CSSProperties = { background: '#fee2e2', color: '#991b1b', borderLeft: '4px solid #dc2626', borderRadius: 6, padding: '8px 12px', fontSize: 13, marginBottom: 14 }
const cancelBtn: React.CSSProperties = { padding: '8px 18px', background: 'transparent', border: '1.5px solid #dde3ef', borderRadius: 7, fontSize: 13, cursor: 'pointer', color: '#607090' }
const submitBtn: React.CSSProperties = { padding: '8px 22px', background: '#00A9E0', color: '#fff', border: 'none', borderRadius: 7, fontSize: 13, fontWeight: 700, cursor: 'pointer' }
