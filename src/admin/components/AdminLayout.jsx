import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAdmin } from '../context/AdminContext'

function LogoMark() {
  return (
    <svg viewBox="0 0 64 64" fill="none" style={{ width: 32, height: 32, flexShrink: 0 }}>
      <rect width="64" height="64" rx="10" fill="#F4A020" />
      <path d="M16 48V20h10c4 0 7 1 9 3s3 5 3 9c0 4-1 7-3 9s-5 3-9 3H16z" fill="#0A0C0F" />
      <path d="M22 42V26h4c2 0 3 .5 4 1.5S31 30 31 32c0 3-.5 5-1.5 6.5S27 40 25 40h-1v2h-2z" fill="#F4A020" />
      <rect x="38" y="20" width="6" height="28" fill="#0A0C0F" />
    </svg>
  )
}

const NAV_ITEMS = [
  {
    to: '/admin/dashboard',
    label: 'Dashboard',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    to: '/admin/equipos',
    label: 'Equipos',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
      </svg>
    ),
  },
  {
    to: '/admin/tecnicos',
    label: 'Técnicos',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
]

export default function AdminLayout({ children, titulo }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { logout } = useAdmin()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/admin/login', { replace: true })
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      background: '#0A0C0F',
      display: 'flex',
      overflow: 'hidden',
      fontFamily: "'DM Sans', sans-serif",
    }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 59,
            background: 'rgba(0,0,0,0.6)',
          }}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`admin-sidebar${sidebarOpen ? ' open' : ''}`}
        style={{
          width: 240,
          background: '#111418',
          display: 'flex',
          flexDirection: 'column',
          borderRight: '1px solid #1E2535',
          flexShrink: 0,
          zIndex: 60,
        }}
      >
        <div style={{
          height: 64, display: 'flex', alignItems: 'center', gap: 12,
          padding: '0 20px', borderBottom: '1px solid #1E2535', flexShrink: 0,
        }}>
          <LogoMark />
          <div>
            <div style={{ color: '#F4A020', fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, letterSpacing: 2, lineHeight: 1 }}>LUBRIPLAN</div>
            <div style={{ color: '#4A5568', fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', marginTop: 2 }}>Admin</div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 14px', borderRadius: 8,
                textDecoration: 'none', fontSize: 14, fontWeight: 500,
                background: isActive ? 'rgba(244,160,32,0.12)' : 'transparent',
                color: isActive ? '#F4A020' : '#7A8BA8',
                transition: 'background 0.15s, color 0.15s',
              })}
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div style={{ padding: '16px 12px', borderTop: '1px solid #1E2535' }}>
          <button onClick={handleLogout} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '10px 14px', width: '100%',
            borderRadius: 8, border: 'none',
            background: 'transparent', color: '#4A5568',
            cursor: 'pointer', fontSize: 14, fontWeight: 500,
          }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <header style={{
          height: 64, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 24px', borderBottom: '1px solid #1E2535',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button
              className="admin-menu-btn"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{
                background: 'none', border: 'none', color: '#7A8BA8',
                cursor: 'pointer', padding: 4, display: 'flex',
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <h1 style={{ color: '#E8EDF5', fontSize: 17, fontWeight: 600, margin: 0 }}>
              {titulo || 'Panel de Administración'}
            </h1>
          </div>
          <button onClick={handleLogout} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '7px 14px', borderRadius: 8,
            border: '1px solid #2A3346', background: 'transparent',
            color: '#7A8BA8', cursor: 'pointer', fontSize: 13,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Salir
          </button>
        </header>

        <main style={{ flex: 1, overflow: 'auto', padding: 28 }}>
          {children}
        </main>
      </div>
    </div>
  )
}
