import { useState, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAdmin } from '../admin/context/AdminContext'

function EquipoCard({ equipo, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 6,
        width: '100%',
        background: '#13112a',
        border: '1px solid #2a2850',
        borderRadius: 16,
        padding: '18px 18px 16px',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'border-color 0.15s, background 0.15s',
      }}
      onPointerDown={e => {
        e.currentTarget.style.borderColor = '#6366f1'
        e.currentTarget.style.background = '#1c1a3a'
      }}
      onPointerUp={e => {
        e.currentTarget.style.borderColor = '#2a2850'
        e.currentTarget.style.background = '#13112a'
      }}
      onPointerLeave={e => {
        e.currentTarget.style.borderColor = '#2a2850'
        e.currentTarget.style.background = '#13112a'
      }}
    >
      <span style={{
        fontFamily: "'DM Sans', sans-serif",
        fontWeight: 600,
        fontSize: 16,
        color: '#e8eeff',
        lineHeight: 1.3,
      }}>
        {equipo.nombre}
      </span>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
          <path
            d="M6.5 1.5C4.3 1.5 2.5 3.3 2.5 5.5C2.5 8.2 6.5 12 6.5 12C6.5 12 10.5 8.2 10.5 5.5C10.5 3.3 8.7 1.5 6.5 1.5Z"
            stroke="#8892b0"
            strokeWidth="1.2"
          />
          <circle cx="6.5" cy="5.5" r="1.5" stroke="#8892b0" strokeWidth="1.2" />
        </svg>
        <span style={{ fontSize: 13, color: '#8892b0', fontWeight: 400 }}>
          {equipo.codigo}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <circle cx="7" cy="7" r="5.5" stroke="#818cf8" strokeWidth="1.2" />
          <circle cx="7" cy="7" r="2" fill="#818cf8" />
        </svg>
        <span style={{ fontSize: 13, color: '#818cf8', fontWeight: 500 }}>
          {equipo.puntos.length} punto{equipo.puntos.length !== 1 ? 's' : ''} de lubricación
        </span>
      </div>
    </button>
  )
}

export default function EquiposScreen() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const areaParam = searchParams.get('area') || ''
  const { equipos } = useAdmin()
  const [busqueda, setBusqueda] = useState('')

  const equiposFiltrados = useMemo(() => {
    return equipos.filter(e => {
      if (e.activo === false) return false
      const matchArea = !areaParam || e.area === areaParam
      const q = busqueda.toLowerCase()
      const matchBusqueda = !q || e.nombre.toLowerCase().includes(q) || e.codigo?.toLowerCase().includes(q)
      return matchArea && matchBusqueda
    })
  }, [equipos, busqueda, areaParam])

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      minHeight: 0,
      background: '#0c0a1e',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '52px 20px 16px',
        background: '#0c0a1e',
        borderBottom: '1px solid #2a2850',
        flexShrink: 0,
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
        }}>
          <div>
            <div style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 24,
              letterSpacing: 3,
              color: '#818cf8',
              lineHeight: 1,
            }}>
              LUBRIPLAN
            </div>
            <div style={{ fontSize: 12, color: '#8892b0', marginTop: 2 }}>
              {equiposFiltrados.length} equipo{equiposFiltrados.length !== 1 ? 's' : ''} encontrado{equiposFiltrados.length !== 1 ? 's' : ''}
            </div>
          </div>
          <button
            onClick={() => navigate('/areas')}
            style={{
              background: '#13112a',
              border: '1px solid #2a2850',
              borderRadius: 10,
              padding: '10px 16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              color: '#8892b0',
              fontSize: 13,
              fontWeight: 500,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 8H14M2 8L6 4M2 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Áreas
          </button>
        </div>

        {areaParam && (
          <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(99,102,241,0.1)',
              border: '1px solid rgba(99,102,241,0.25)',
              borderRadius: 20,
              padding: '5px 12px',
            }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <rect x="1" y="5" width="10" height="6" rx="1.5" stroke="#818cf8" strokeWidth="1.2" />
                <path d="M1 6.5l5-3.5 5 3.5" stroke="#818cf8" strokeWidth="1.2" strokeLinejoin="round" />
              </svg>
              <span style={{
                fontSize: 13,
                fontWeight: 600,
                color: '#818cf8',
                fontFamily: "'DM Sans', sans-serif",
              }}>
                {areaParam}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Search */}
      <div style={{ padding: '16px 20px 16px', background: '#0c0a1e', flexShrink: 0 }}>
        <div style={{ position: 'relative' }}>
          <svg width="17" height="17" viewBox="0 0 17 17" fill="none"
            style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }}>
            <circle cx="7.5" cy="7.5" r="5" stroke="#8892b0" strokeWidth="1.5" />
            <path d="M11.5 11.5L15 15" stroke="#8892b0" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            placeholder="Buscar equipo..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            style={{
              width: '100%',
              height: 48,
              background: '#13112a',
              border: '1px solid #2a2850',
              borderRadius: 12,
              paddingLeft: 42,
              paddingRight: 16,
              color: '#e8eeff',
              fontSize: 15,
              fontFamily: "'DM Sans', sans-serif",
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>
      </div>

      {/* Equipment list */}
      <div style={{
        flex: 1,
        minHeight: 0,
        overflowY: 'auto',
        padding: '0 20px 32px',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
      }}>
        {equiposFiltrados.length === 0 ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12,
            paddingTop: 60,
            color: '#8892b0',
          }}>
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="20" stroke="#2a2850" strokeWidth="2" />
              <path d="M24 16v10M24 32h.01" stroke="#8892b0" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span style={{ fontSize: 15 }}>
              {busqueda ? `Sin resultados para "${busqueda}"` : 'No hay equipos en esta área'}
            </span>
          </div>
        ) : (
          equiposFiltrados.map(equipo => (
            <EquipoCard
              key={equipo.id}
              equipo={equipo}
              onClick={() => navigate(`/carta/${equipo.id}`)}
            />
          ))
        )}
      </div>
    </div>
  )
}
