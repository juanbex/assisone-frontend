import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../stores/auth.store'
import Logo from './Logo'

const NAV = [
  { label: 'Dashboard', icon: '▦', path: '/dashboard' },
  {
    label: 'Servicios', icon: '⊞', path: '/services',
    sub: [
      { label: 'Bandeja', path: '/services' },
      { label: 'Nuevo servicio', path: '/services/new' },
      { label: 'No coordinados', path: '/services?status=uncoordinated' },
    ],
  },
  {
    label: 'Seguimiento', icon: '◎', path: '/seguimiento',
    badge: 'back',
  },
  {
    label: 'Proveedores', icon: '◉', path: '/providers',
    sub: [
      { label: 'Lista', path: '/providers' },
      { label: 'Asignaciones', path: '/providers/assignments' },
    ],
  },
  { label: 'Clientes',      icon: '◈', path: '/clients' },
  { label: 'Citas médicas', icon: '✚', path: '/appointments' },
  { label: 'Reportes',      icon: '▣', path: '/reports' },
  {
    label: 'Admin', icon: '◧', path: '/admin',
    sub: [
      { label: 'Usuarios', path: '/admin/users' },
      { label: 'Roles',    path: '/admin/roles' },
      { label: 'Tenants',  path: '/admin/tenants' },
    ],
  },
]

export default function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const logout = useAuthStore(s => s.logout)
  const user   = useAuthStore(s => s.user)
  const [collapsed, setCollapsed]   = useState(false)
  const [openMenus, setOpenMenus]   = useState<Record<string, boolean>>({ Servicios: true, Admin: false })

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/')

  const toggle = (label: string) => setOpenMenus(p => ({ ...p, [label]: !p[label] }))

  return (
    <div style={{
      width: collapsed ? 64 : 220, background: '#0A1F44', display: 'flex', flexDirection: 'column',
      flexShrink: 0, transition: 'width .2s', overflow: 'hidden',
    }}>
      {/* Logo */}
      <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, cursor: 'pointer' }}
        onClick={() => setCollapsed(c => !c)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
          <Logo size={32} />
          {!collapsed && <span style={{ fontSize: 14, fontWeight: 700, color: '#fff', letterSpacing: '.02em', whiteSpace: 'nowrap' }}>AssisOne</span>}
        </div>
        {!collapsed && <span style={{ color: 'rgba(255,255,255,.4)', fontSize: 12 }}>‹</span>}
      </div>

      {/* Nav */}
      <div style={{ flex: 1, padding: '6px 0', overflow: 'auto' }}>
        {NAV.map(item => (
          <div key={item.label}>
            <div
              onClick={() => {
                if (item.sub) toggle(item.label)
                else navigate(item.path)
              }}
              style={{
                display: 'flex', alignItems: 'center', gap: 9,
                padding: '8px 14px', cursor: 'pointer',
                color: isActive(item.path) ? '#fff' : 'rgba(255,255,255,.65)',
                background: isActive(item.path) && !item.sub ? 'rgba(0,169,224,.15)' : 'transparent',
                borderLeft: `3px solid ${isActive(item.path) && !item.sub ? '#00A9E0' : 'transparent'}`,
                fontSize: 13, transition: '.15s',
              }}>
              <span style={{ fontSize: 14, width: 18, textAlign: 'center', flexShrink: 0 }}>{item.icon}</span>
              {!collapsed && (
                <>
                  <span style={{ flex: 1, whiteSpace: 'nowrap' }}>{item.label}</span>
                  {item.badge && (
                    <span style={{ fontSize: 9, fontWeight: 700, background: '#00A9E0', color: '#fff', padding: '1px 5px', borderRadius: 99 }}>
                      {item.badge}
                    </span>
                  )}
                  {item.sub && (
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,.3)' }}>
                      {openMenus[item.label] ? '▾' : '▸'}
                    </span>
                  )}
                </>
              )}
            </div>

            {/* Submenu */}
            {!collapsed && item.sub && openMenus[item.label] && (
              <div style={{ paddingLeft: 38 }}>
                {item.sub.map(sub => (
                  <div key={sub.path} onClick={() => navigate(sub.path)}
                    style={{
                      fontSize: 12, padding: '5px 10px', borderRadius: 5, cursor: 'pointer',
                      color: location.pathname === sub.path ? '#00A9E0' : 'rgba(255,255,255,.45)',
                    }}>
                    {sub.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* User */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,.08)', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 9 }}>
        <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#00A9E0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
          {(user as any)?.name?.[0]?.toUpperCase() ?? 'U'}
        </div>
        {!collapsed && (
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>{(user as any)?.name ?? 'Usuario'}</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.35)', cursor: 'pointer' }} onClick={logout}>Cerrar sesión</div>
          </div>
        )}
      </div>
    </div>
  )
}
