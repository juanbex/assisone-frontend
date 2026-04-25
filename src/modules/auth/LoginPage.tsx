import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../shared/api/client'
import { useAuthStore } from '../../shared/stores/auth.store'
import Logo from '../../shared/components/Logo'

export default function LoginPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore(s => s.setAuth)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await api.post('/api/auth/login', { email, password })
      setAuth(data.token, data.user)
      navigate('/services')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Credenciales inválidas')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(145deg, #0A1F44 0%, #162d5c 55%, #1a3a78 100%)',
      padding: '2rem',
      fontFamily: 'Inter, system-ui, sans-serif',
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 14,
        boxShadow: '0 8px 40px rgba(10,31,68,.35)',
        padding: '2.5rem',
        width: '100%',
        maxWidth: 380,
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.75rem', gap: 12 }}>
          <div style={{
            background: '#0A1F44',
            borderRadius: 12,
            padding: 12,
            display: 'inline-block',
          }}>
            <Logo size={52} showText={false} />
          </div>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#0A1F44', letterSpacing: '.01em' }}>
              AssisOne
            </h1>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#607090' }}>
              Plataforma de gestión operativa
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: 5, fontSize: 13, fontWeight: 600, color: '#0A1F44' }}>
              Correo electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="juan@assisprex.com"
              required
              style={{
                width: '100%',
                padding: '9px 12px',
                border: '1.5px solid #dde3ef',
                borderRadius: 6,
                fontSize: 14,
                color: '#0A1F44',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color .15s',
              }}
              onFocus={e => e.target.style.borderColor = '#00A9E0'}
              onBlur={e => e.target.style.borderColor = '#dde3ef'}
            />
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', marginBottom: 5, fontSize: 13, fontWeight: 600, color: '#0A1F44' }}>
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{
                width: '100%',
                padding: '9px 12px',
                border: '1.5px solid #dde3ef',
                borderRadius: 6,
                fontSize: 14,
                color: '#0A1F44',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color .15s',
              }}
              onFocus={e => e.target.style.borderColor = '#00A9E0'}
              onBlur={e => e.target.style.borderColor = '#dde3ef'}
            />
          </div>

          {error && (
            <div style={{
              padding: '9px 12px',
              background: '#fee2e2',
              color: '#991b1b',
              borderRadius: 6,
              fontSize: 13,
              borderLeft: '4px solid #dc2626',
              marginBottom: '1rem',
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '10px',
              background: loading ? '#90d4f0' : '#00A9E0',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              fontSize: 14,
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background .15s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            {loading ? 'Ingresando...' : 'Iniciar sesión'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: 12, color: '#adb5c7', margin: '1.25rem 0 0' }}>
          AssisPrex S.A.S · AssisOne v0.1.0
        </p>
      </div>
    </div>
  )
}
