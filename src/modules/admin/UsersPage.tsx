import { useState } from 'react'
import { useUsers, useRoles, useCreateUser, useUpdateUser, useSeedRoles, AppUser } from './useAdmin'

const ROLE_COLORS: Record<string, string> = {
  'admin':        '#0A1F44',
  'agente-front': '#0088b8',
  'agente-back':  '#7c3aed',
  'supervisor':   '#059669',
  'proveedor':    '#d97706',
}

export default function UsersPage() {
  const { data: usersData, isLoading } = useUsers()
  const { data: rolesData } = useRoles()
  const { mutate: createUser, isPending: creating } = useCreateUser()
  const { mutate: updateUser, isPending: updating } = useUpdateUser()
  const { mutate: seedRoles, isPending: seeding } = useSeedRoles()

  const users = usersData?.data ?? []
  const roles = rolesData?.data ?? []

  const [showCreate, setShowCreate] = useState(false)
  const [editUser, setEditUser] = useState<AppUser | null>(null)
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', roleIds: [] as string[] })
  const [error, setError] = useState('')

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const toggleRole = (id: string) =>
    setForm(f => ({ ...f, roleIds: f.roleIds.includes(id) ? f.roleIds.filter(r => r !== id) : [...f.roleIds, id] }))

  const resetForm = () => { setForm({ name: '', email: '', phone: '', password: '', roleIds: [] }); setError('') }

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    createUser(form, {
      onSuccess: () => { setShowCreate(false); resetForm() },
      onError: (err: any) => setError(err.response?.data?.error ?? 'Error al crear usuario'),
    })
  }

  const handleStatusToggle = (u: AppUser) => {
    const next = u.status === 'active' ? 'inactive' : 'active'
    updateUser({ id: u.id, status: next })
  }

  const openEdit = (u: AppUser) => {
    setEditUser(u)
    setForm({ name: u.name, email: u.email, phone: u.phone ?? '', password: '', roleIds: u.userRoles.map(r => r.role.id) })
  }

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editUser) return
    setError('')
    updateUser({ id: editUser.id, name: form.name, phone: form.phone, roleIds: form.roleIds }, {
      onSuccess: () => { setEditUser(null); resetForm() },
      onError: (err: any) => setError(err.response?.data?.error ?? 'Error al actualizar'),
    })
  }

  return (
    <div style={{ padding: '24px 28px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 700, color: '#0A1F44', borderBottom: '3px solid #00A9E0', display: 'inline-block', paddingBottom: 6 }}>
            Gestión de usuarios
          </h1>
          <p style={{ margin: '6px 0 0', fontSize: 13, color: '#607090' }}>
            {users.length} usuario{users.length !== 1 ? 's' : ''} en este tenant
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {roles.length === 0 && (
            <button onClick={() => seedRoles()} disabled={seeding}
              style={{ padding: '8px 16px', background: '#f1f5f9', border: '1.5px solid #dde3ef', borderRadius: 7, fontSize: 13, color: '#607090', cursor: 'pointer' }}>
              {seeding ? 'Creando roles...' : '⚙ Inicializar roles'}
            </button>
          )}
          <button onClick={() => setShowCreate(true)}
            style={{ padding: '8px 20px', background: '#00A9E0', color: '#fff', border: 'none', borderRadius: 7, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
            + Nuevo usuario
          </button>
        </div>
      </div>

      {/* Roles chips */}
      {roles.length > 0 && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: '#607090', fontWeight: 600 }}>Roles:</span>
          {roles.map(r => (
            <span key={r.id} style={{
              padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700,
              background: `${ROLE_COLORS[r.name] ?? '#607090'}18`,
              color: ROLE_COLORS[r.name] ?? '#607090',
              border: `1px solid ${ROLE_COLORS[r.name] ?? '#607090'}40`,
            }}>
              {r.name}{r.isSystem ? ' ●' : ''}
            </span>
          ))}
        </div>
      )}

      {/* Users table */}
      <div style={{ background: '#fff', border: '1px solid #dde3ef', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(10,31,68,.06)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#0A1F44' }}>
              {['Usuario', 'Email', 'Teléfono', 'Roles', 'Estado', 'Creado', 'Acciones'].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: 'rgba(255,255,255,.8)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={7} style={emptyTd}>Cargando usuarios...</td></tr>}
            {!isLoading && users.length === 0 && <tr><td colSpan={7} style={emptyTd}>No hay usuarios. Crea el primero.</td></tr>}
            {users.map((u, i) => (
              <tr key={u.id} style={{ borderBottom: '1px solid #dde3ef', background: i % 2 === 0 ? '#fff' : '#fafbfc' }}>
                <td style={td}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#00A9E0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                      {u.name[0].toUpperCase()}
                    </div>
                    <span style={{ fontWeight: 600 }}>{u.name}</span>
                  </div>
                </td>
                <td style={{ ...td, color: '#607090', fontSize: 12 }}>{u.email}</td>
                <td style={{ ...td, color: '#607090', fontSize: 12 }}>{u.phone ?? '—'}</td>
                <td style={td}>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {u.userRoles.length === 0
                      ? <span style={{ fontSize: 11, color: '#adb5c7' }}>Sin rol</span>
                      : u.userRoles.map(r => (
                        <span key={r.role.id} style={{
                          padding: '2px 8px', borderRadius: 99, fontSize: 10, fontWeight: 700,
                          background: `${ROLE_COLORS[r.role.name] ?? '#607090'}18`,
                          color: ROLE_COLORS[r.role.name] ?? '#607090',
                        }}>
                          {r.role.name}
                        </span>
                      ))
                    }
                  </div>
                </td>
                <td style={td}>
                  <span style={{
                    padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700,
                    background: u.status === 'active' ? '#d1fae5' : '#fee2e2',
                    color: u.status === 'active' ? '#065f46' : '#991b1b',
                  }}>
                    {u.status === 'active' ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td style={{ ...td, color: '#607090', fontSize: 12 }}>
                  {new Date(u.createdAt).toLocaleDateString('es-CO')}
                </td>
                <td style={td}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => openEdit(u)} style={actionBtn('#00A9E0')}>Editar</button>
                    <button onClick={() => handleStatusToggle(u)} disabled={updating}
                      style={actionBtn(u.status === 'active' ? '#dc2626' : '#059669')}>
                      {u.status === 'active' ? 'Desactivar' : 'Activar'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal crear usuario */}
      {(showCreate || editUser) && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,31,68,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: 14, padding: '28px', width: '100%', maxWidth: 480, boxShadow: '0 8px 40px rgba(10,31,68,.3)' }}>
            <h2 style={{ margin: '0 0 20px', fontSize: '1.1rem', fontWeight: 700, color: '#0A1F44' }}>
              {editUser ? 'Editar usuario' : 'Nuevo usuario'}
            </h2>

            <form onSubmit={editUser ? handleEdit : handleCreate}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                <FormField label="Nombre *">
                  <input value={form.name} onChange={set('name')} required style={inp} placeholder="Ana García" />
                </FormField>
                <FormField label="Teléfono">
                  <input value={form.phone} onChange={set('phone')} style={inp} placeholder="3001234567" />
                </FormField>
              </div>

              {!editUser && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                  <FormField label="Email *">
                    <input type="email" value={form.email} onChange={set('email')} required style={inp} placeholder="ana@assisprex.com" />
                  </FormField>
                  <FormField label="Contraseña *">
                    <input type="password" value={form.password} onChange={set('password')} required minLength={6} style={inp} placeholder="••••••••" />
                  </FormField>
                </div>
              )}

              {roles.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#0A1F44', display: 'block', marginBottom: 8 }}>Roles</label>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {roles.map(r => (
                      <button type="button" key={r.id} onClick={() => toggleRole(r.id)} style={{
                        padding: '5px 12px', borderRadius: 99, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                        background: form.roleIds.includes(r.id) ? (ROLE_COLORS[r.name] ?? '#607090') : 'transparent',
                        color: form.roleIds.includes(r.id) ? '#fff' : (ROLE_COLORS[r.name] ?? '#607090'),
                        border: `1.5px solid ${ROLE_COLORS[r.name] ?? '#607090'}`,
                      }}>
                        {r.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {error && (
                <div style={{ background: '#fee2e2', color: '#991b1b', borderLeft: '4px solid #dc2626', borderRadius: 6, padding: '8px 12px', fontSize: 13, marginBottom: 14 }}>
                  {error}
                </div>
              )}

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => { setShowCreate(false); setEditUser(null); resetForm() }}
                  style={{ padding: '8px 18px', background: 'transparent', border: '1.5px solid #dde3ef', borderRadius: 7, fontSize: 13, cursor: 'pointer', color: '#607090' }}>
                  Cancelar
                </button>
                <button type="submit" disabled={creating || updating}
                  style={{ padding: '8px 22px', background: '#00A9E0', color: '#fff', border: 'none', borderRadius: 7, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                  {(creating || updating) ? 'Guardando...' : (editUser ? 'Guardar cambios' : 'Crear usuario')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: '#0A1F44' }}>{label}</label>
      {children}
    </div>
  )
}

const td: React.CSSProperties = { padding: '10px 14px', fontSize: 13.5, verticalAlign: 'middle', color: '#0A1F44' }
const emptyTd: React.CSSProperties = { textAlign: 'center', padding: '2.5rem', color: '#607090', fontSize: 14 }
const inp: React.CSSProperties = { padding: '8px 10px', border: '1.5px solid #dde3ef', borderRadius: 6, fontSize: 13, color: '#0A1F44', background: '#fff', outline: 'none', width: '100%', boxSizing: 'border-box' }
const actionBtn = (color: string): React.CSSProperties => ({
  padding: '4px 10px', fontSize: 11, fontWeight: 600, color,
  background: 'transparent', border: `1.5px solid ${color}`, borderRadius: 5, cursor: 'pointer', whiteSpace: 'nowrap',
})
