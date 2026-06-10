import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAdmin } from '../context/AdminContext'

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
  {
    to: '/admin/lubricantes',
    label: 'Lubricantes',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a7 7 0 0 1 7 7c0 5-7 13-7 13S5 14 5 9a7 7 0 0 1 7-7z" />
        <circle cx="12" cy="9" r="2.5" />
      </svg>
    ),
  },
  {
    to: '/admin/importar',
    label: 'Importar',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
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
      background: '#0c0a1e',
      display: 'flex',
      overflow: 'hidden',
      fontFamily: "'DM Sans', sans-serif",
    }}>
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
          background: '#13112a',
          display: 'flex',
          flexDirection: 'column',
          borderRight: '1px solid #2a2850',
          flexShrink: 0,
          zIndex: 60,
        }}
      >
        <div style={{
          height: 64, display: 'flex', alignItems: 'center', gap: 12,
          padding: '0 20px', borderBottom: '1px solid #2a2850', flexShrink: 0,
        }}>
          <img src="/logo.jpeg" alt="LubriPlan" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
          <div>
            <div style={{ color: '#818cf8', fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, letterSpacing: 2, lineHeight: 1 }}>LUBRIPLAN</div>
            <div style={{ color: '#4a5070', fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', marginTop: 2 }}>Admin</div>
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
                background: isActive ? 'rgba(99,102,241,0.15)' : 'transparent',
                color: isActive ? '#818cf8' : '#8892b0',
                transition: 'background 0.15s, color 0.15s',
              })}
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div style={{ padding: '16px 12px', borderTop: '1px solid #2a2850' }}>
          <button onClick={handleLogout} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '10px 14px', width: '100%',
            borderRadius: 8, border: 'none',
            background: 'transparent', color: '#4a5070',
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
          padding: '0 24px', borderBottom: '1px solid #2a2850',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button
              className="admin-menu-btn"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{
                background: 'none', border: 'none', color: '#8892b0',
                cursor: 'pointer', padding: 4, display: 'flex',
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <h1 style={{ color: '#e8eeff', fontSize: 17, fontWeight: 600, margin: 0 }}>
              {titulo || 'Panel de Administración'}
            </h1>
          </div>
          <button onClick={handleLogout} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '7px 14px', borderRadius: 8,
            border: '1px solid #2a2850', background: 'transparent',
            color: '#8892b0', cursor: 'pointer', fontSize: 13,
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
