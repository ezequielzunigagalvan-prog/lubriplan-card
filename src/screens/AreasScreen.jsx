import { useMemo, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdmin } from '../admin/context/AdminContext'

const PALETTE = [
  '#818cf8',
  '#22C55E',
  '#3B82F6',
  '#A855F7',
  '#EF4444',
  '#06B6D4',
  '#FB923C',
  '#EC4899',
]

function BuildingIcon({ color, size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 26 26" fill="none">
      <rect x="3" y="12" width="20" height="11" rx="2" stroke={color} strokeWidth="1.5" />
      <path d="M3 14L13 6l10 8" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
      <rect x="10" y="17" width="6" height="6" rx="1" stroke={color} strokeWidth="1.4" />
      <rect x="5" y="16" width="3" height="3" rx="0.5" fill={color + '55'} stroke={color} strokeWidth="1.2" />
      <rect x="18" y="16" width="3" height="3" rx="0.5" fill={color + '55'} stroke={color} strokeWidth="1.2" />
    </svg>
  )
}

function ChevronRight({ color = '#8892b0' }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M6 4l4 4-4 4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function WarningDot() {
  return (
    <div
      title="Hay equipos sin puntos configurados"
      style={{
        width: 8,
        height: 8,
        borderRadius: '50%',
        background: '#FB923C',
        flexShrink: 0,
        boxShadow: '0 0 4px #FB923Caa',
      }}
    />
  )
}

function AreaCard({ area, count, puntos, sinConfigurar, color, onClick }) {
  const ref = useRef(null)
  const hasWarning = sinConfigurar > 0

  function handlePointerDown() {
    if (ref.current) {
      ref.current.style.borderColor = color
      ref.current.style.background = '#1c1a3a'
    }
  }

  function handlePointerUp() {
    if (ref.current) {
      ref.current.style.borderColor = '#2a2850'
      ref.current.style.background = '#13112a'
    }
  }

  return (
    <button
      ref={ref}
      onClick={onClick}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      style={{
        display: 'flex',
        flexDirection: 'column',
        background: '#13112a',
        border: '1px solid #2a2850',
        borderRadius: 16,
        overflow: 'hidden',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'border-color 0.15s, background 0.15s',
        padding: 0,
      }}
    >
      {/* Colored folder tab strip — 6px, rounded top corners */}
      <div
        style={{
          height: 6,
          background: `linear-gradient(90deg, ${color}, ${color}99)`,
          width: '100%',
          flexShrink: 0,
          borderRadius: '0',
        }}
      />

      {/* Card body */}
      <div
        style={{
          padding: '16px 14px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          flex: 1,
        }}
      >
        {/* Icon circle + warning dot row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div
            style={{
              width: 46,
              height: 46,
              borderRadius: 12,
              background: color + '18',
              border: `1px solid ${color}35`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <BuildingIcon color={color} />
          </div>
          {hasWarning && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <WarningDot />
            </div>
          )}
        </div>

        {/* Area name */}
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 600,
              fontSize: 14,
              color: '#e8eeff',
              lineHeight: 1.35,
              marginBottom: 4,
            }}
          >
            {area}
          </div>
          <div
            style={{
              fontSize: 12,
              color: '#8892b0',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {count} equipo{count !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Footer row: "X equipos · Y puntos" + chevron */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 4,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
            <span
              style={{
                fontSize: 11,
                color: color,
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 600,
              }}
            >
              {count} equipo{count !== 1 ? 's' : ''}
            </span>
            <span style={{ fontSize: 11, color: '#2a2850', fontWeight: 700 }}>·</span>
            <span
              style={{
                fontSize: 11,
                color: color + 'cc',
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 500,
              }}
            >
              {puntos} punto{puntos !== 1 ? 's' : ''}
            </span>
          </div>
          <ChevronRight color={color + 'AA'} />
        </div>
      </div>
    </button>
  )
}

function EquipoResultado({ equipo, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        width: '100%',
        background: '#13112a',
        border: '1px solid #2a2850',
        borderRadius: 14,
        padding: '13px 16px',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'border-color 0.15s',
      }}
      onPointerDown={e => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.background = '#1c1a3a' }}
      onPointerUp={e => { e.currentTarget.style.borderColor = '#2a2850'; e.currentTarget.style.background = '#13112a' }}
      onPointerLeave={e => { e.currentTarget.style.borderColor = '#2a2850'; e.currentTarget.style.background = '#13112a' }}
    >
      <div
        style={{
          flexShrink: 0,
          background: 'rgba(99,102,241,0.12)',
          border: '1px solid rgba(99,102,241,0.25)',
          borderRadius: 8,
          padding: '5px 8px',
          fontFamily: 'monospace',
          fontSize: 12,
          fontWeight: 700,
          color: '#818cf8',
          letterSpacing: 1,
          minWidth: 62,
          textAlign: 'center',
        }}
      >
        {equipo.codigo || '—'}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 14, fontWeight: 600, color: '#e8eeff',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          fontFamily: "'DM Sans', sans-serif",
        }}>
          {equipo.nombre}
        </div>
        <div style={{ fontSize: 12, color: '#8892b0', marginTop: 1 }}>{equipo.area}</div>
      </div>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M6 4l4 4-4 4" stroke="#8892b0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  )
}

export default function AreasScreen() {
  const navigate = useNavigate()
  const { equipos } = useAdmin()
  const [busquedaRapida, setBusquedaRapida] = useState('')
  const [busquedaArea, setBusquedaArea] = useState('')
  const searchRef = useRef(null)

  const equiposActivos = useMemo(
    () => equipos.filter(e => e.activo !== false),
    [equipos]
  )

  const areas = useMemo(() => {
    const map = {}
    equiposActivos.forEach(e => {
      if (!map[e.area]) {
        map[e.area] = { count: 0, puntos: 0, sinConfigurar: 0 }
      }
      map[e.area].count += 1
      const numPuntos = Array.isArray(e.puntos) ? e.puntos.length : 0
      map[e.area].puntos += numPuntos
      if (numPuntos === 0) map[e.area].sinConfigurar += 1
    })
    return Object.entries(map).map(([nombre, stats]) => ({ nombre, ...stats }))
  }, [equiposActivos])

  const areasFiltradas = useMemo(() => {
    if (!busquedaArea.trim()) return areas
    const q = busquedaArea.toLowerCase()
    return areas.filter(a => a.nombre.toLowerCase().includes(q))
  }, [areas, busquedaArea])

  const resultadosRapidos = useMemo(() => {
    const q = busquedaRapida.trim().toLowerCase()
    if (!q) return []
    return equiposActivos.filter(e =>
      e.codigo?.toLowerCase().includes(q) ||
      e.nombre.toLowerCase().includes(q)
    ).slice(0, 8)
  }, [equiposActivos, busquedaRapida])

  const modoRapido = busquedaRapida.trim().length > 0

  const totalPuntos = useMemo(
    () => equiposActivos.reduce((acc, e) => acc + (Array.isArray(e.puntos) ? e.puntos.length : 0), 0),
    [equiposActivos]
  )

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0,
        background: '#0c0a1e',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '52px 20px 16px',
          background: '#0c0a1e',
          borderBottom: '1px solid #2a2850',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: 24,
                letterSpacing: 3,
                color: '#818cf8',
                lineHeight: 1,
              }}
            >
              LUBRIPLAN
            </div>
            <div style={{ fontSize: 12, color: '#8892b0', marginTop: 4 }}>
              {areas.length} área{areas.length !== 1 ? 's' : ''} · {equiposActivos.length} equipos · {totalPuntos} puntos
            </div>
          </div>
          <button
            onClick={() => navigate('/')}
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
            Salir
          </button>
        </div>

        {/* Quick search input */}
        <div style={{ marginTop: 18, position: 'relative' }}>
          <svg
            width="17" height="17" viewBox="0 0 17 17" fill="none"
            style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', zIndex: 1 }}
          >
            <circle cx="7.5" cy="7.5" r="5" stroke={modoRapido ? '#6366f1' : '#8892b0'} strokeWidth="1.5" />
            <path d="M11.5 11.5L15 15" stroke={modoRapido ? '#6366f1' : '#8892b0'} strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            ref={searchRef}
            type="text"
            placeholder="Buscar por código o nombre de equipo..."
            value={busquedaRapida}
            onChange={e => setBusquedaRapida(e.target.value)}
            style={{
              width: '100%',
              height: 48,
              background: '#13112a',
              border: `1px solid ${modoRapido ? '#6366f160' : '#2a2850'}`,
              borderRadius: 12,
              paddingLeft: 42,
              paddingRight: busquedaRapida ? 40 : 16,
              color: '#e8eeff',
              fontSize: 15,
              fontFamily: "'DM Sans', sans-serif",
              outline: 'none',
              boxSizing: 'border-box',
              transition: 'border-color 0.15s',
            }}
          />
          {busquedaRapida && (
            <button
              onClick={() => setBusquedaRapida('')}
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

      {/* Scrollable content */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          padding: '16px 20px 32px',
        }}
      >
        {modoRapido ? (
          /* Quick search results */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ fontSize: 12, color: '#8892b0', marginBottom: 4 }}>
              {resultadosRapidos.length > 0
                ? `${resultadosRapidos.length} resultado${resultadosRapidos.length !== 1 ? 's' : ''} — toca para ver la carta`
                : 'Sin resultados'}
            </div>
            {resultadosRapidos.length === 0 ? (
              <div
                style={{
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', gap: 12, paddingTop: 40, color: '#8892b0',
                }}
              >
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                  <circle cx="24" cy="24" r="20" stroke="#2a2850" strokeWidth="2" />
                  <path d="M24 16v10M24 32h.01" stroke="#8892b0" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <span style={{ fontSize: 14 }}>
                  Sin equipos para "{busquedaRapida}"
                </span>
              </div>
            ) : (
              resultadosRapidos.map(e => (
                <EquipoResultado
                  key={e.id}
                  equipo={e}
                  onClick={() => navigate(`/carta/${e.id}`)}
                />
              ))
            )}
          </div>
        ) : (
          /* Normal areas grid */
          <div>
            {/* Area filter search */}
            <div style={{ position: 'relative', marginBottom: 16 }}>
              <svg
                width="15" height="15" viewBox="0 0 15 15" fill="none"
                style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}
              >
                <circle cx="6.5" cy="6.5" r="4.5" stroke="#8892b0" strokeWidth="1.3" />
                <path d="M10 10L13 13" stroke="#8892b0" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
              <input
                type="text"
                placeholder="Filtrar áreas..."
                value={busquedaArea}
                onChange={e => setBusquedaArea(e.target.value)}
                style={{
                  width: '100%',
                  height: 40,
                  background: '#13112a',
                  border: '1px solid #2a2850',
                  borderRadius: 10,
                  paddingLeft: 36,
                  paddingRight: 12,
                  color: '#e8eeff',
                  fontSize: 13,
                  fontFamily: "'DM Sans', sans-serif",
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {areasFiltradas.length === 0 ? (
              <div
                style={{
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', gap: 12, paddingTop: 40, color: '#8892b0',
                }}
              >
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                  <circle cx="24" cy="24" r="20" stroke="#2a2850" strokeWidth="2" />
                  <path d="M24 16v10M24 32h.01" stroke="#8892b0" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <span style={{ fontSize: 15 }}>Sin áreas para "{busquedaArea}"</span>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {areasFiltradas.map(({ nombre, count, puntos, sinConfigurar }, idx) => (
                  <AreaCard
                    key={nombre}
                    area={nombre}
                    count={count}
                    puntos={puntos}
                    sinConfigurar={sinConfigurar}
                    color={PALETTE[idx % PALETTE.length]}
                    onClick={() => navigate(`/equipos?area=${encodeURIComponent(nombre)}`)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
