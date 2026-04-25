import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import Logo from './Logo'
import { useAuthStore } from '../stores/auth.store'

const NAV = [
  {
    icon: '▦',
    label: 'Dashboard',
    to: '/dashboard',
  },
  {
    icon: '⊞',
    label: 'Servicios',
    to: '/services',
    children: [
      { label: 'Bandeja', to: '/services' },
      { label: 'Nuevo servicio', to: '/services/new' },
      { label: 'No coordinados', to: '/services/uncoordinated' },
    ],
  },
  {
    icon: '◎',
    label: 'Proveedores',
    to: '/providers',
    children: [
      { label: 'Lista', to: '/providers' },
      { label: 'Asignaciones', to: '/providers/assignments' },
    ],
  },
  {
    icon: '◉',
    label: 'Clientes',
    to: '/clients',
  },
  {
    icon: '◈',
    label: 'Citas médicas',
    to: '/appointments',
  },
  {
    icon: '▣',
    label: 'Reportes',
    to: '/reports',
  },
  {
    icon: '◧',
    label: 'Admin',
    to: '/admin',
    children: [
      { label: 'Usuarios', to: '/admin/users' },
      { label: 'Roles', to: '/admin/roles' },
      { label: 'Tenants', to: '/admin/tenants' },
    ],
  },
]

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const [open, setOpen] = useState<string | null>('Servicios')
  const logout = useAuthStore(s => s.logout)
  const user = useAuthStore(s => s.user)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const w = collapsed ? 64 : 240

  return (
    <div style={{
      width: w,
      minHeight: '100vh',
      background: '#0A1F44',
      display: 'flex',
      flexDirection: 'column',
      transition: 'width .2s ease',
      flexShrink: 0,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Logo */}
      <div style={{
        padding: collapsed ? '16px 14px' : '16px 20px',
        borderBottom: '1px solid rgba(255,255,255,.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
        minHeight: 64,
      }}>
        <Logo size={32} showText={!collapsed} />
        {!collapsed && (
          <button onClick={() => setCollapsed(true)} style={btnStyle} title="Colapsar">
            ‹
          </button>
        )}
      </div>

      {collapsed && (
        <button onClick={() => setCollapsed(false)} style={{
          ...btnStyle,
          display: 'block',
          margin: '8px auto',
          transform: 'rotate(180deg)',
        }} title="Expandir">
          ‹
        </button>
      )}

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
        {NAV.map(item => (
          <div key={item.label}>
            {item.children ? (
              <>
                <button
                  onClick={() => !collapsed && setOpen(open === item.label ? null : item.label)}
                  style={{
                    ...navItemBase,
                    justifyContent: collapsed ? 'center' : 'space-between',
                    width: '100%',
                    background: open === item.label ? 'rgba(0,169,224,.15)' : 'transparent',
                    borderLeft: open === item.label ? '3px solid #00A9E0' : '3px solid transparent',
                  }}
                  title={collapsed ? item.label : undefined}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 16, width: 20, textAlign: 'center' }}>{item.icon}</span>
                    {!collapsed && <span style={{ fontSize: 13.5, fontWeight: 500 }}>{item.label}</span>}
                  </span>
                  {!collapsed && (
                    <span style={{ fontSize: 10, opacity: .6, transform: open === item.label ? 'rotate(90deg)' : 'none', transition: '.15s' }}>▶</span>
                  )}
                </button>
                {!collapsed && open === item.label && (
                  <div style={{ paddingLeft: 44, paddingBottom: 4 }}>
                    {item.children.map(child => (
                      <NavLink key={child.to} to={child.to} style={({ isActive }) => ({
                        display: 'block',
                        padding: '6px 12px',
                        fontSize: 13,
                        color: isActive ? '#00A9E0' : 'rgba(255,255,255,.55)',
                        textDecoration: 'none',
                        borderRadius: 6,
                        transition: 'color .15s',
                      })}>
                        {child.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <NavLink to={item.to} style={({ isActive }) => ({
                ...navItemBase,
                justifyContent: collapsed ? 'center' : 'flex-start',
                background: isActive ? 'rgba(0,169,224,.15)' : 'transparent',
                borderLeft: isActive ? '3px solid #00A9E0' : '3px solid transparent',
                textDecoration: 'none',
              })} title={collapsed ? item.label : undefined}>
                <span style={{ fontSize: 16, width: 20, textAlign: 'center' }}>{item.icon}</span>
                {!collapsed && <span style={{ fontSize: 13.5, fontWeight: 500 }}>{item.label}</span>}
              </NavLink>
            )}
          </div>
        ))}
      </nav>

      {/* User */}
      <div style={{
        borderTop: '1px solid rgba(255,255,255,.08)',
        padding: collapsed ? '12px 8px' : '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        justifyContent: collapsed ? 'center' : 'flex-start',
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          background: '#00A9E0',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0,
        }}>
          {user?.name?.[0] ?? 'U'}
        </div>
        {!collapsed && (
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.name ?? 'Usuario'}
            </div>
            <button onClick={handleLogout} style={{
              background: 'none', border: 'none', padding: 0,
              fontSize: 11, color: 'rgba(255,255,255,.4)',
              cursor: 'pointer', textAlign: 'left',
            }}>
              Cerrar sesión
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

const navItemBase: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  padding: '9px 16px',
  color: 'rgba(255,255,255,.7)',
  background: 'transparent',
  border: 'none',
  borderLeft: '3px solid transparent',
  cursor: 'pointer',
  transition: 'background .15s, color .15s',
  textDecoration: 'none',
}

const btnStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,.1)',
  border: 'none',
  color: 'rgba(255,255,255,.7)',
  borderRadius: 6,
  width: 28, height: 28,
  cursor: 'pointer',
  fontSize: 18,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  flexShrink: 0,
}
