import { useState } from 'react'
import { useRoles, useCreateRole, useDeleteRole, useSeedRoles, Role } from './useAdmin'

const ROLE_COLORS: Record<string, string> = {
  'admin': '#0A1F44', 'agente-front': '#0088b8',
  'agente-back': '#7c3aed', 'supervisor': '#059669', 'proveedor': '#d97706',
}

const ROLE_DESC: Record<string, string> = {
  'admin': 'Acceso total al sistema',
  'agente-front': 'Recibe llamadas y abre casos',
  'agente-back': 'Coordina proveedores y hace seguimiento',
  'supervisor': 'Monitor en vivo, alertas y reportes',
  'proveedor': 'Portal de gestión de servicios asignados',
}

export default function RolesPage() {
  const { data, isLoading } = useRoles()
  const { mutate: createRole, isPending: creating } = useCreateRole()
  const { mutate: deleteRole, isPending: deleting } = useDeleteRole()
  const { mutate: seedRoles, isPending: seeding } = useSeedRoles()

  const roles = data?.data ?? []
  const systemRoles = roles.filter(r => r.isSystem)
  const customRoles = roles.filter(r => !r.isSystem)

  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ name: '', description: '' })
  const [error, setError] = useState('')

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    createRole(form, {
      onSuccess: () => { setShowCreate(false); setForm({ name: '', description: '' }) },
      onError: (err: any) => setError(err.response?.data?.error ?? 'Error al crear rol'),
    })
  }

  const handleDelete = (role: Role) => {
    if (role.isSystem) return
    if (!confirm(`¿Eliminar el rol "${role.name}"? Los usuarios perderán este rol.`)) return
    deleteRole(role.id)
  }

  return (
    <div style={{ padding: '24px 28px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 700, color: '#0A1F44', borderBottom: '3px solid #00A9E0', display: 'inline-block', paddingBottom: 6 }}>
            Roles del sistema
          </h1>
          <p style={{ margin: '6px 0 0', fontSize: 13, color: '#607090' }}>
            {roles.length} rol{roles.length !== 1 ? 'es' : ''} configurados
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {systemRoles.length < 5 && (
            <button onClick={() => seedRoles()} disabled={seeding}
              style={{ padding: '8px 16px', background: '#f1f5f9', border: '1.5px solid #dde3ef', borderRadius: 7, fontSize: 13, color: '#607090', cursor: 'pointer' }}>
              {seeding ? 'Inicializando...' : '⚙ Inicializar roles del sistema'}
            </button>
          )}
          <button onClick={() => setShowCreate(true)}
            style={{ padding: '8px 20px', background: '#00A9E0', color: '#fff', border: 'none', borderRadius: 7, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
            + Nuevo rol
          </button>
        </div>
      </div>

      {isLoading && <p style={{ color: '#607090' }}>Cargando roles...</p>}

      {/* System roles */}
      {systemRoles.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 13, fontWeight: 700, color: '#607090', textTransform: 'uppercase', letterSpacing: '.07em', margin: '0 0 12px' }}>
            Roles del sistema
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
            {systemRoles.map(r => (
              <RoleCard key={r.id} role={r} color={ROLE_COLORS[r.name] ?? '#607090'} description={ROLE_DESC[r.name]} />
            ))}
          </div>
        </div>
      )}

      {/* Custom roles */}
      {customRoles.length > 0 && (
        <div>
          <h2 style={{ fontSize: 13, fontWeight: 700, color: '#607090', textTransform: 'uppercase', letterSpacing: '.07em', margin: '0 0 12px' }}>
            Roles personalizados
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
            {customRoles.map(r => (
              <RoleCard key={r.id} role={r} color="#607090" onDelete={() => handleDelete(r)} deleting={deleting} />
            ))}
          </div>
        </div>
      )}

      {roles.length === 0 && !isLoading && (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#607090', background: '#fff', borderRadius: 12, border: '1px dashed #dde3ef' }}>
          <p style={{ margin: '0 0 16px', fontSize: 14 }}>No hay roles aún. Inicializa los roles del sistema para empezar.</p>
          <button onClick={() => seedRoles()} disabled={seeding}
            style={{ padding: '10px 24px', background: '#0A1F44', color: '#fff', border: 'none', borderRadius: 7, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
            {seeding ? 'Creando...' : '⚙ Inicializar roles del sistema'}
          </button>
        </div>
      )}

      {/* Modal crear rol */}
      {showCreate && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,31,68,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: 14, padding: '28px', width: '100%', maxWidth: 420, boxShadow: '0 8px 40px rgba(10,31,68,.3)' }}>
            <h2 style={{ margin: '0 0 20px', fontSize: '1.1rem', fontWeight: 700, color: '#0A1F44' }}>Nuevo rol personalizado</h2>
            <form onSubmit={handleCreate}>
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Nombre del rol *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required
                  style={inp} placeholder="ej: coordinador-regional" />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Descripción</label>
                <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  style={inp} placeholder="¿Qué puede hacer este rol?" />
              </div>
              {error && <div style={errStyle}>{error}</div>}
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowCreate(false)} style={cancelBtn}>Cancelar</button>
                <button type="submit" disabled={creating} style={submitBtn}>{creating ? 'Creando...' : 'Crear rol'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function RoleCard({ role, color, description, onDelete, deleting }: {
  role: Role; color: string; description?: string; onDelete?: () => void; deleting?: boolean
}) {
  return (
    <div style={{ background: '#fff', border: '1px solid #dde3ef', borderRadius: 10, overflow: 'hidden', boxShadow: '0 1px 3px rgba(10,31,68,.06)' }}>
      <div style={{ height: 4, background: color }} />
      <div style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#0A1F44' }}>{role.name}</span>
              {role.isSystem && <span style={{ fontSize: 10, fontWeight: 700, color, background: `${color}18`, padding: '1px 6px', borderRadius: 99 }}>sistema</span>}
            </div>
            <p style={{ margin: 0, fontSize: 12, color: '#607090', lineHeight: 1.4 }}>
              {description ?? role.description ?? 'Sin descripción'}
            </p>
          </div>
          {onDelete && !role.isSystem && (
            <button onClick={onDelete} disabled={deleting}
              style={{ padding: '3px 8px', fontSize: 11, color: '#dc2626', background: 'transparent', border: '1px solid #fca5a5', borderRadius: 5, cursor: 'pointer', flexShrink: 0 }}>
              Eliminar
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

const labelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: '#0A1F44', display: 'block', marginBottom: 5 }
const inp: React.CSSProperties = { padding: '8px 10px', border: '1.5px solid #dde3ef', borderRadius: 6, fontSize: 13, color: '#0A1F44', background: '#fff', outline: 'none', width: '100%', boxSizing: 'border-box' }
const errStyle: React.CSSProperties = { background: '#fee2e2', color: '#991b1b', borderLeft: '4px solid #dc2626', borderRadius: 6, padding: '8px 12px', fontSize: 13, marginBottom: 14 }
const cancelBtn: React.CSSProperties = { padding: '8px 18px', background: 'transparent', border: '1.5px solid #dde3ef', borderRadius: 7, fontSize: 13, cursor: 'pointer', color: '#607090' }
const submitBtn: React.CSSProperties = { padding: '8px 22px', background: '#00A9E0', color: '#fff', border: 'none', borderRadius: 7, fontSize: 13, fontWeight: 700, cursor: 'pointer' }
