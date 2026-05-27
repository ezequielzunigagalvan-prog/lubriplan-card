import { useNavigate } from 'react-router-dom'

// Actualizar con la URL real de la plataforma LubriPlan
const LUBRIPLAN_APP_URL = 'https://app.lubriplan.com'

export default function LoginLubriPlan() {
  const navigate = useNavigate()

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: '#080A0E',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      overflowY: 'auto',
      zIndex: 1,
    }}>
      {/* Back */}
      <button
        onClick={() => navigate('/')}
        style={{
          position: 'absolute',
          top: 24, left: 24,
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'none', border: 'none',
          color: '#7A8BA8', cursor: 'pointer',
          fontSize: 13, fontFamily: "'DM Sans', sans-serif",
          padding: '8px 12px',
          borderRadius: 8,
          transition: 'background 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.background = '#131820'}
        onMouseLeave={e => e.currentTarget.style.background = 'none'}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Volver
      </button>

      <div style={{
        width: '100%',
        maxWidth: 420,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 0,
      }}>
        {/* Logo */}
        <img
          src="/logo.jpeg"
          alt="LubriPlan Card"
          style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', marginBottom: 24 }}
        />

        {/* Headline */}
        <h1 style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 36,
          letterSpacing: 3,
          color: '#E8EDF5',
          textAlign: 'center',
          marginBottom: 8,
        }}>
          ACCEDÉ A LUBRIPLAN
        </h1>

        <p style={{
          fontSize: 14,
          color: '#7A8BA8',
          textAlign: 'center',
          lineHeight: 1.7,
          marginBottom: 36,
          maxWidth: 340,
          fontFamily: "'DM Sans', sans-serif",
        }}>
          LubriPlan Card forma parte del ecosistema LubriPlan.
          La gestión completa — historial, rutas y alertas — se administra desde la plataforma principal.
        </p>

        {/* Main CTA */}
        <a
          href={LUBRIPLAN_APP_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            padding: '16px',
            background: '#F4A020',
            border: 'none',
            borderRadius: 14,
            color: '#0A0C0F',
            fontSize: 16,
            fontWeight: 700,
            fontFamily: "'DM Sans', sans-serif",
            textDecoration: 'none',
            cursor: 'pointer',
            transition: 'opacity 0.15s, transform 0.15s',
            marginBottom: 16,
          }}
          onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.transform = 'translateY(-1px)' }}
          onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)' }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M15 9A6 6 0 1 1 3 9a6 6 0 0 1 12 0z" stroke="currentColor" strokeWidth="1.5" />
            <path d="M9 6v3l2 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          Entrar a LubriPlan
        </a>

        {/* Divider */}
        <div style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 16,
        }}>
          <div style={{ flex: 1, height: 1, background: '#1E2535' }} />
          <span style={{ fontSize: 12, color: '#2A3448', fontFamily: "'DM Sans', sans-serif" }}>o</span>
          <div style={{ flex: 1, height: 1, background: '#1E2535' }} />
        </div>

        {/* Admin access */}
        <button
          onClick={() => navigate('/admin/login')}
          style={{
            width: '100%',
            padding: '14px',
            background: 'transparent',
            border: '1px solid #2A3448',
            borderRadius: 14,
            color: '#7A8BA8',
            fontSize: 14,
            fontWeight: 500,
            cursor: 'pointer',
            fontFamily: "'DM Sans', sans-serif",
            transition: 'border-color 0.15s, color 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#F4A020'; e.currentTarget.style.color = '#E8EDF5' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#2A3448'; e.currentTarget.style.color = '#7A8BA8' }}
        >
          Acceso de administrador
        </button>

        {/* Nota */}
        <p style={{
          marginTop: 28,
          fontSize: 12,
          color: '#2A3448',
          textAlign: 'center',
          fontFamily: "'DM Sans', sans-serif",
          lineHeight: 1.6,
          maxWidth: 320,
        }}>
          ¿Eres técnico? No necesitas iniciar sesión.
          Escanea el QR del equipo directamente con tu celular.
        </p>
      </div>
    </div>
  )
}
