import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../shared/api/client'
import { useAuthStore } from '../../shared/stores/auth.store'

export default function LoginPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)
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
    <div className="login-root">
      {/* Left panel — branding */}
      <div className="login-left">
        <div className="login-left-inner">
          <div className="login-logo">
            <span className="logo-mark">A</span>
            <span className="logo-name">AssisOne</span>
          </div>
          <div className="login-tagline">
            <h1>Operación de asistencia,<br /><em>centralizada.</em></h1>
            <p>Gestiona servicios de auto, hogar y médico para tus aseguradoras desde un solo lugar.</p>
          </div>
          <div className="login-stats">
            <div className="stat">
              <span className="stat-num">24/7</span>
              <span className="stat-label">Operación continua</span>
            </div>
            <div className="stat">
              <span className="stat-num">100%</span>
              <span className="stat-label">Trazabilidad</span>
            </div>
            <div className="stat">
              <span className="stat-num">&lt;10m</span>
              <span className="stat-label">Coordinación</span>
            </div>
          </div>
        </div>
        <div className="login-left-grid" aria-hidden="true">
          {Array.from({ length: 64 }).map((_, i) => (
            <div key={i} className="grid-dot" style={{ animationDelay: `${(i * 0.03).toFixed(2)}s` }} />
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="login-right">
        <div className="login-form-wrap">
          <div className="login-form-header">
            <h2>Iniciar sesión</h2>
            <p>Ingresa tus credenciales para continuar</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="field">
              <label htmlFor="email">Correo electrónico</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="juan@assisprex.com"
                required
                autoComplete="email"
              />
            </div>

            <div className="field">
              <label htmlFor="password">Contraseña</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>

            {error && <div className="login-error">{error}</div>}

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? <span className="btn-spinner" /> : 'Ingresar'}
            </button>
          </form>

          <p className="login-footer">
            AssisOne · AssisPrex S.A.S · v0.1.0
          </p>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&family=DM+Serif+Display:ital@0;1&display=swap');

        .login-root {
          display: flex;
          min-height: 100vh;
          font-family: 'DM Sans', sans-serif;
          background: #0b0f1a;
          color: #e8eaf2;
        }

        /* ── LEFT ── */
        .login-left {
          position: relative;
          flex: 1;
          display: flex;
          align-items: center;
          overflow: hidden;
          background: linear-gradient(135deg, #0d1220 0%, #0a1628 50%, #071020 100%);
          border-right: 1px solid rgba(99,139,255,0.1);
        }

        .login-left-inner {
          position: relative;
          z-index: 2;
          padding: 3rem 3.5rem;
          display: flex;
          flex-direction: column;
          gap: 3rem;
        }

        .login-logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .logo-mark {
          width: 38px;
          height: 38px;
          background: linear-gradient(135deg, #4f7aff, #3eccb0);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          font-weight: 600;
          color: #fff;
          flex-shrink: 0;
        }

        .logo-name {
          font-size: 20px;
          font-weight: 600;
          letter-spacing: -0.02em;
          color: #e8eaf2;
        }

        .login-tagline h1 {
          font-family: 'DM Serif Display', serif;
          font-size: clamp(2rem, 3.5vw, 3rem);
          line-height: 1.15;
          font-weight: 400;
          color: #e8eaf2;
          margin: 0 0 1rem;
        }

        .login-tagline h1 em {
          font-style: italic;
          color: #4f9eff;
        }

        .login-tagline p {
          font-size: 1rem;
          line-height: 1.7;
          color: #8892b0;
          max-width: 360px;
          margin: 0;
        }

        .login-stats {
          display: flex;
          gap: 2.5rem;
        }

        .stat {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }

        .stat-num {
          font-size: 1.5rem;
          font-weight: 600;
          color: #4f9eff;
          letter-spacing: -0.03em;
        }

        .stat-label {
          font-size: 0.75rem;
          color: #556;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        /* animated dot grid */
        .login-left-grid {
          position: absolute;
          inset: 0;
          display: grid;
          grid-template-columns: repeat(8, 1fr);
          grid-template-rows: repeat(8, 1fr);
          padding: 2rem;
          pointer-events: none;
          z-index: 1;
        }

        .grid-dot {
          width: 3px;
          height: 3px;
          border-radius: 50%;
          background: rgba(79,154,255,0.15);
          place-self: center;
          animation: pulse 4s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.15; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.8); }
        }

        /* ── RIGHT ── */
        .login-right {
          width: 420px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0f1320;
          padding: 2rem;
        }

        .login-form-wrap {
          width: 100%;
          max-width: 340px;
          display: flex;
          flex-direction: column;
          gap: 2rem;
          animation: fadeUp 0.4s ease both;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .login-form-header h2 {
          font-size: 1.6rem;
          font-weight: 600;
          letter-spacing: -0.03em;
          color: #e8eaf2;
          margin: 0 0 0.4rem;
        }

        .login-form-header p {
          font-size: 0.9rem;
          color: #556;
          margin: 0;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 1.2rem;
        }

        .field {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .field label {
          font-size: 0.8rem;
          font-weight: 500;
          color: #8892b0;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        .field input {
          background: #161b2e;
          border: 1px solid rgba(99,139,255,0.15);
          border-radius: 10px;
          padding: 0.75rem 1rem;
          font-size: 0.95rem;
          font-family: 'DM Sans', sans-serif;
          color: #e8eaf2;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .field input::placeholder { color: #3a4060; }

        .field input:focus {
          border-color: rgba(79,154,255,0.5);
          box-shadow: 0 0 0 3px rgba(79,154,255,0.08);
        }

        .login-error {
          font-size: 0.85rem;
          color: #ff6b6b;
          background: rgba(255,107,107,0.08);
          border: 1px solid rgba(255,107,107,0.2);
          border-radius: 8px;
          padding: 0.65rem 0.9rem;
        }

        .login-btn {
          margin-top: 0.4rem;
          background: linear-gradient(135deg, #4f7aff, #3eccb0);
          border: none;
          border-radius: 10px;
          padding: 0.85rem;
          font-size: 0.95rem;
          font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          color: #fff;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.1s;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 48px;
        }

        .login-btn:hover { opacity: 0.9; }
        .login-btn:active { transform: scale(0.99); }
        .login-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .btn-spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        .login-footer {
          font-size: 0.75rem;
          color: #3a4060;
          text-align: center;
          margin: 0;
        }

        @media (max-width: 768px) {
          .login-root { flex-direction: column; }
          .login-left { display: none; }
          .login-right { width: 100%; min-height: 100vh; }
        }
      `}</style>
    </div>
  )
}
