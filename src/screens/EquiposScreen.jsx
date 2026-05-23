import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
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
        background: '#131820',
        border: '1px solid #2A3448',
        borderRadius: 16,
        padding: '18px 18px 16px',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'border-color 0.15s, background 0.15s',
      }}
      onPointerDown={e => {
        e.currentTarget.style.borderColor = '#F4A020'
        e.currentTarget.style.background = '#1C2230'
      }}
      onPointerUp={e => {
        e.currentTarget.style.borderColor = '#2A3448'
        e.currentTarget.style.background = '#131820'
      }}
      onPointerLeave={e => {
        e.currentTarget.style.borderColor = '#2A3448'
        e.currentTarget.style.background = '#131820'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%', gap: 8 }}>
        <span
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 600,
            fontSize: 16,
            color: '#E8EDF5',
            lineHeight: 1.3,
            flex: 1,
          }}
        >
          {equipo.nombre}
        </span>
        {equipo.vencidos > 0 && (
          <span
            style={{
              background: '#3F1010',
              color: '#EF4444',
              fontSize: 12,
              fontWeight: 700,
              padding: '3px 8px',
              borderRadius: 20,
              whiteSpace: 'nowrap',
              flexShrink: 0,
              border: '1px solid #EF444430',
            }}
          >
            {equipo.vencidos} vencido{equipo.vencidos !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M7 1.5C4.5 1.5 2.5 3.5 2.5 6C2.5 9 7 13 7 13C7 13 11.5 9 11.5 6C11.5 3.5 9.5 1.5 7 1.5Z" stroke="#7A8BA8" strokeWidth="1.2" />
          <circle cx="7" cy="6" r="1.5" stroke="#7A8BA8" strokeWidth="1.2" />
        </svg>
        <span style={{ fontSize: 13, color: '#7A8BA8', fontWeight: 400 }}>
          {equipo.area}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <circle cx="7" cy="7" r="5.5" stroke="#F4A020" strokeWidth="1.2" />
          <circle cx="7" cy="7" r="2" fill="#F4A020" />
        </svg>
        <span style={{ fontSize: 13, color: '#F4A020', fontWeight: 500 }}>
          {equipo.puntos.length} punto{equipo.puntos.length !== 1 ? 's' : ''} de lubricación
        </span>
      </div>
    </button>
  )
}

export default function EquiposScreen() {
  const navigate = useNavigate()
  const { equipos } = useAdmin()
  const [busqueda, setBusqueda] = useState('')
  const [areaActiva, setAreaActiva] = useState('Todas')

  const AREAS = useMemo(
    () => ['Todas', ...Array.from(new Set(equipos.map(e => e.area)))],
    [equipos]
  )

  const equiposFiltrados = useMemo(() => {
    return equipos.filter(e => {
      if (e.activo === false) return false
      const matchArea = areaActiva === 'Todas' || e.area === areaActiva
      const q = busqueda.toLowerCase()
      const matchBusqueda = !q || e.nombre.toLowerCase().includes(q) || e.area.toLowerCase().includes(q)
      return matchArea && matchBusqueda
    })
  }, [equipos, busqueda, areaActiva])

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: '#0A0C0F',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '52px 20px 16px',
          background: '#0A0C0F',
          borderBottom: '1px solid #2A3448',
          flexShrink: 0,
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 24,
              letterSpacing: 3,
              color: '#F4A020',
              lineHeight: 1,
            }}
          >
            LUBRIPLAN
          </div>
          <div style={{ fontSize: 12, color: '#7A8BA8', marginTop: 2 }}>
            {equipos.filter(e => e.activo !== false).length} equipos disponibles
          </div>
        </div>
        <button
          onClick={() => navigate('/')}
          style={{
            background: '#131820',
            border: '1px solid #2A3448',
            borderRadius: 10,
            padding: '10px 16px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            color: '#7A8BA8',
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

      {/* Search + filters */}
      <div
        style={{
          padding: '16px 20px 0',
          background: '#0A0C0F',
          flexShrink: 0,
        }}
      >
        {/* Search */}
        <div style={{ position: 'relative', marginBottom: 14 }}>
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }}
          >
            <circle cx="8" cy="8" r="5.5" stroke="#7A8BA8" strokeWidth="1.5" />
            <path d="M12.5 12.5L16 16" stroke="#7A8BA8" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            placeholder="Buscar equipo o área..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            style={{
              width: '100%',
              height: 52,
              background: '#131820',
              border: '1px solid #2A3448',
              borderRadius: 14,
              paddingLeft: 44,
              paddingRight: 16,
              color: '#E8EDF5',
              fontSize: 16,
              fontFamily: "'DM Sans', sans-serif",
              outline: 'none',
            }}
          />
        </div>

        {/* Area chips */}
        <div
          style={{
            display: 'flex',
            gap: 8,
            overflowX: 'auto',
            paddingBottom: 16,
            scrollbarWidth: 'none',
          }}
        >
          {AREAS.map(area => (
            <button
              key={area}
              onClick={() => setAreaActiva(area)}
              style={{
                height: 36,
                padding: '0 14px',
                borderRadius: 20,
                border: `1px solid ${areaActiva === area ? '#F4A020' : '#2A3448'}`,
                background: areaActiva === area ? '#F4A020' : '#131820',
                color: areaActiva === area ? '#0A0C0F' : '#7A8BA8',
                fontSize: 13,
                fontWeight: areaActiva === area ? 700 : 400,
                fontFamily: "'DM Sans', sans-serif",
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                transition: 'all 0.15s',
              }}
            >
              {area}
            </button>
          ))}
        </div>
      </div>

      {/* Equipment list */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '4px 20px 32px',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        {equiposFiltrados.length === 0 ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 12,
              paddingTop: 60,
              color: '#7A8BA8',
            }}
          >
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="20" stroke="#2A3448" strokeWidth="2" />
              <path d="M24 16v10M24 32h.01" stroke="#7A8BA8" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span style={{ fontSize: 15 }}>Sin resultados para "{busqueda}"</span>
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
