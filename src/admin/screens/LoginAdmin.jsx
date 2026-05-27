import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdmin } from '../context/AdminContext'

function LogoMark() {
  return (
    <svg viewBox="0 0 64 64" fill="none" style={{ width: 64, height: 64 }}>
      <rect width="64" height="64" rx="12" fill="#F4A020" />
      <path d="M16 48V20h10c4 0 7 1 9 3s3 5 3 9c0 4-1 7-3 9s-5 3-9 3H16z" fill="#0A0C0F" />
      <path d="M22 42V26h4c2 0 3 .5 4 1.5S31 30 31 32c0 3-.5 5-1.5 6.5S27 40 25 40h-1v2h-2z" fill="#F4A020" />
      <rect x="38" y="20" width="6" height="28" fill="#0A0C0F" />
    </svg>
  )
}

export default function LoginAdmin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, isLoggedIn } = useAdmin()
  const navigate = useNavigate()

  useEffect(() => {
    if (isLoggedIn) navigate('/admin/dashboard', { replace: true })
  }, [isLoggedIn, navigate])

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    setTimeout(() => {
      const ok = login(email.trim(), password)
      if (ok) {
        navigate('/admin/dashboard', { replace: true })
      } else {
        setError('Credenciales incorrectas. Verifica email y contraseña.')
        setLoading(false)
      }
    }, 300)
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      background: '#0A0C0F',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'DM Sans', sans-serif",
      padding: 24,
    }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <LogoMark />
          <div style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 28, letterSpacing: 4, color: '#F4A020', lineHeight: 1, marginTop: 16,
          }}>
            LUBRIPLAN
          </div>
          <div style={{ color: '#4A5568', fontSize: 12, letterSpacing: 2, marginTop: 4, textTransform: 'uppercase' }}>
            Panel de Administración
          </div>
        </div>

        <div style={{
          background: '#111418', borderRadius: 16,
          border: '1px solid #1E2535', padding: '32px 28px',
        }}>
          <h2 style={{ color: '#E8EDF5', fontSize: 18, fontWeight: 600, margin: '0 0 24px', textAlign: 'center' }}>
            Iniciar sesión
          </h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={labelStyle}>Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@lubriplan.com"
                required
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={inputStyle}
              />
            </div>

            {error && (
              <div style={{
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: 8, padding: '10px 14px',
                color: '#EF4444', fontSize: 13,
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: 8, padding: '14px',
                background: loading ? '#8B6014' : '#F4A020', color: '#0A0C0F',
                border: 'none', borderRadius: 10,
                fontSize: 15, fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                letterSpacing: 0.5, transition: 'background 0.2s',
              }}
            >
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', color: '#2A3346', fontSize: 11, marginTop: 24 }}>
          LubriPlan Card — Sistema de Gestión de Lubricación
        </p>
      </div>
    </div>
  )
}

const labelStyle = {
  display: 'block', color: '#7A8BA8', fontSize: 12,
  letterSpacing: 0.5, marginBottom: 8, textTransform: 'uppercase',
}

const inputStyle = {
  width: '100%', padding: '12px 14px',
  background: '#0A0C0F', border: '1px solid #2A3346',
  borderRadius: 8, color: '#E8EDF5', fontSize: 15,
  outline: 'none', boxSizing: 'border-box',
  fontFamily: "'DM Sans', sans-serif",
}
