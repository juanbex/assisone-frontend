import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../shared/stores/auth.store'
import { api } from '../../shared/api/client'
import Logo from '../../shared/components/Logo'

export default function LoginPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore(s => s.setAuth)
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await api.post('/api/auth/login', { email, password })
      setAuth(data.token, data.user)
      navigate('/services')
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Credenciales incorrectas')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#0A1F44',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        {/* Logo */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 32 }}>
          <Logo size={52} />
          <h1 style={{ margin: '12px 0 4px', color: '#fff', fontSize: '1.6rem', fontWeight: 800, letterSpacing: '.02em' }}>
            AssisOne
          </h1>
          <p style={{ margin: 0, color: 'rgba(255,255,255,.45)', fontSize: 13 }}>
            Plataforma de asistencia AssisPrex
          </p>
        </div>

        {/* Card */}
        <div style={{ background: '#fff', borderRadius: 14, padding: '32px 28px', boxShadow: '0 12px 40px rgba(0,0,0,.3)' }}>
          <h2 style={{ margin: '0 0 24px', fontSize: '1.1rem', fontWeight: 700, color: '#0A1F44' }}>
            Iniciar sesión
          </h2>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Correo electrónico</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                required placeholder="usuario@assisprex.com"
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#00A9E0'}
                onBlur={e => e.target.style.borderColor = '#dde3ef'}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={labelStyle}>Contraseña</label>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)}
                required placeholder="••••••••"
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#00A9E0'}
                onBlur={e => e.target.style.borderColor = '#dde3ef'}
              />
            </div>

            {error && (
              <div style={{
                background: '#fee2e2', color: '#991b1b', borderLeft: '4px solid #dc2626',
                borderRadius: 6, padding: '10px 14px', fontSize: 13, marginBottom: 16,
              }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '11px', background: loading ? '#7fd4f0' : '#00A9E0',
              color: '#fff', border: 'none', borderRadius: 8, fontSize: 15,
              fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', transition: '.2s',
            }}>
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, color: 'rgba(255,255,255,.25)', fontSize: 12 }}>
          AssisOne © {new Date().getFullYear()} · AssisPrex S.A.S.
        </p>
      </div>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 12, fontWeight: 600, color: '#0A1F44', marginBottom: 6,
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 12px', border: '1.5px solid #dde3ef',
  borderRadius: 7, fontSize: 14, color: '#0A1F44', outline: 'none',
  boxSizing: 'border-box', transition: 'border-color .15s',
}
