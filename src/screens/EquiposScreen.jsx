import { useState, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAdmin } from '../admin/context/AdminContext'

function EquipoCard({ equipo, onClick }) {
  const numPuntos = Array.isArray(equipo.puntos) ? equipo.puntos.length : 0
  const tieneImagen = equipo.imagenes?.length > 0 || !!equipo.imagenUrl

  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        width: '100%',
        background: '#13112a',
        border: '1px solid #2a2850',
        borderRadius: 14,
        padding: '16px 16px',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'border-color 0.15s, background 0.15s',
        boxSizing: 'border-box',
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
      {/* Left: code badge */}
      <div
        style={{
          flexShrink: 0,
          background: 'rgba(99,102,241,0.12)',
          border: '1px solid rgba(99,102,241,0.28)',
          borderRadius: 8,
          padding: '6px 9px',
          fontFamily: 'monospace',
          fontSize: 12,
          fontWeight: 700,
          color: '#818cf8',
          letterSpacing: 1,
          minWidth: 66,
          textAlign: 'center',
          lineHeight: 1.4,
        }}
      >
        {equipo.codigo || '—'}
      </div>

      {/* Center: name + meta row */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 700,
            fontSize: 14,
            color: '#e8eeff',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            lineHeight: 1.35,
            marginBottom: 5,
          }}
        >
          {equipo.nombre}
        </div>

        {/* Meta row: points + image indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {/* Points count */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <circle cx="6.5" cy="6.5" r="5" stroke="#818cf8" strokeWidth="1.2" />
              <circle cx="6.5" cy="6.5" r="1.8" fill="#818cf8" />
            </svg>
            <span style={{
              fontSize: 12,
              color: '#818cf8',
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 500,
            }}>
              {numPuntos} punto{numPuntos !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Image indicator */}
          {tieneImagen ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <rect x="1.5" y="2.5" width="10" height="8" rx="1.5" stroke="#06B6D4" strokeWidth="1.2" />
                <circle cx="4.5" cy="5.5" r="1" fill="#06B6D4" />
                <path d="M1.5 9L4 6.5l2.5 2 2-2L11.5 9" stroke="#06B6D4" strokeWidth="1.1" strokeLinejoin="round" />
              </svg>
              <span style={{
                fontSize: 12,
                color: '#06B6D4',
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 500,
              }}>
                Con imagen
              </span>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <rect x="1.5" y="2.5" width="10" height="8" rx="1.5" stroke="#4a5060" strokeWidth="1.2" />
                <path d="M1.5 9L4 6.5l2.5 2 2-2L11.5 9" stroke="#4a5060" strokeWidth="1.1" strokeLinejoin="round" />
              </svg>
              <span style={{
                fontSize: 12,
                color: '#4a5060',
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 400,
              }}>
                Sin imagen
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Right: chevron */}
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
        <path d="M6 4l4 4-4 4" stroke="#8892b0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
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

  const titulo = areaParam || 'Todos los equipos'

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
          alignItems: 'center',
          gap: 12,
        }}>
          {/* Left: back arrow */}
          <button
            onClick={() => navigate('/areas')}
            style={{
              flexShrink: 0,
              width: 40,
              height: 40,
              background: '#13112a',
              border: '1px solid #2a2850',
              borderRadius: 12,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#8892b0',
            }}
            onPointerDown={e => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.background = '#1c1a3a' }}
            onPointerUp={e => { e.currentTarget.style.borderColor = '#2a2850'; e.currentTarget.style.background = '#13112a' }}
            onPointerLeave={e => { e.currentTarget.style.borderColor = '#2a2850'; e.currentTarget.style.background = '#13112a' }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M11 4L6 9l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {/* Center: area title */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 700,
                fontSize: 17,
                color: '#e8eeff',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                lineHeight: 1.3,
              }}
            >
              {titulo}
            </div>
          </div>

          {/* Right: count badge */}
          <div
            style={{
              flexShrink: 0,
              background: 'rgba(99,102,241,0.14)',
              border: '1px solid rgba(99,102,241,0.28)',
              borderRadius: 20,
              padding: '4px 11px',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13,
              fontWeight: 700,
              color: '#818cf8',
            }}
          >
            {equiposFiltrados.length}
          </div>
        </div>
      </div>

      {/* Search */}
      <div style={{ padding: '14px 20px', background: '#0c0a1e', flexShrink: 0 }}>
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
              paddingRight: busqueda ? 40 : 16,
              color: '#e8eeff',
              fontSize: 15,
              fontFamily: "'DM Sans', sans-serif",
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          {busqueda && (
            <button
              onClick={() => setBusqueda('')}
              style={{
                position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', color: '#8892b0',
                cursor: 'pointer', fontSize: 18, lineHeight: 1, padding: 4,
              }}
            >
              ×
            </button>
          )}
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
            <span style={{ fontSize: 15, textAlign: 'center', lineHeight: 1.5 }}>
              {busqueda
                ? `Sin resultados para "${busqueda}"`
                : areaParam
                  ? `No hay equipos en "${areaParam}"`
                  : 'No hay equipos registrados'}
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
