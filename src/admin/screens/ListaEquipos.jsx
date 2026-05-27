import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '../components/AdminLayout'
import ConfirmModal from '../components/ConfirmModal'
import { useAdmin } from '../context/AdminContext'

const PALETTE = [
  '#F4A020', '#22C55E', '#3B82F6', '#A855F7',
  '#EF4444', '#06B6D4', '#FB923C', '#EC4899',
]

function ActionBtn({ color, children, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '5px 12px', borderRadius: 6,
        border: `1px solid ${color}44`,
        background: `${color}11`, color,
        fontSize: 12, fontWeight: 600, cursor: 'pointer',
        fontFamily: "'DM Sans', sans-serif",
        transition: 'background 0.15s',
      }}
      onMouseEnter={e => e.currentTarget.style.background = `${color}22`}
      onMouseLeave={e => e.currentTarget.style.background = `${color}11`}
    >
      {children}
    </button>
  )
}

function EquipoRow({ equipo, isLast, onEdit, onCarta, onDelete }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '110px 1fr 140px 80px 90px auto',
        alignItems: 'center',
        gap: 0,
        padding: '13px 20px',
        borderBottom: isLast ? 'none' : '1px solid #1E2535',
        transition: 'background 0.1s',
      }}
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      {/* Código */}
      <span style={{
        fontFamily: 'monospace', fontSize: 13, fontWeight: 700,
        color: '#F4A020', letterSpacing: 1,
      }}>
        {equipo.codigo || '—'}
      </span>

      {/* Nombre */}
      <div>
        <div style={{ color: '#E8EDF5', fontSize: 14, fontWeight: 500 }}>{equipo.nombre}</div>
        {equipo.imagenes?.length > 0 && (
          <span style={{ fontSize: 11, color: '#4A5568', marginTop: 2, display: 'block' }}>
            {equipo.imagenes.length} foto{equipo.imagenes.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Puntos */}
      <span style={{ color: '#7A8BA8', fontSize: 13 }}>
        {equipo.puntos?.length || 0} punto{equipo.puntos?.length !== 1 ? 's' : ''}
      </span>

      {/* Estado */}
      <span style={{
        padding: '3px 10px', borderRadius: 20,
        fontSize: 11, fontWeight: 600, display: 'inline-block',
        background: equipo.activo !== false ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
        color: equipo.activo !== false ? '#22C55E' : '#EF4444',
      }}>
        {equipo.activo !== false ? 'Activo' : 'Inactivo'}
      </span>

      {/* Acciones */}
      <div style={{ gridColumn: '6', display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
        <ActionBtn color="#3B82F6" onClick={onCarta}>Carta</ActionBtn>
        <ActionBtn color="#F4A020" onClick={onEdit}>Editar</ActionBtn>
        <ActionBtn color="#EF4444" onClick={onDelete}>Eliminar</ActionBtn>
      </div>
    </div>
  )
}

function AreaSection({ area, equipos, color, areaIdx, defaultOpen, onEdit, onCarta, onDelete }) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div style={{
      background: '#111418',
      border: '1px solid #1E2535',
      borderRadius: 12,
      overflow: 'hidden',
    }}>
      {/* Area header */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '14px 20px',
          background: open ? `${color}08` : 'transparent',
          borderBottom: open ? '1px solid #1E2535' : 'none',
          cursor: 'pointer',
          border: 'none',
          textAlign: 'left',
          transition: 'background 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.background = `${color}10`}
        onMouseLeave={e => e.currentTarget.style.background = open ? `${color}08` : 'transparent'}
      >
        {/* Color dot */}
        <div style={{
          width: 10, height: 10, borderRadius: '50%',
          background: color, flexShrink: 0,
        }} />

        {/* Area name */}
        <span style={{
          color: '#E8EDF5', fontSize: 14, fontWeight: 700,
          flex: 1, fontFamily: "'DM Sans', sans-serif",
        }}>
          {area}
        </span>

        {/* Count badge */}
        <span style={{
          padding: '2px 10px', borderRadius: 20, fontSize: 12,
          background: `${color}18`, color, fontWeight: 600,
          border: `1px solid ${color}30`,
          fontFamily: "'DM Sans', sans-serif",
        }}>
          {equipos.length} equipo{equipos.length !== 1 ? 's' : ''}
        </span>

        {/* Chevron */}
        <svg
          width="16" height="16" viewBox="0 0 16 16" fill="none"
          style={{ transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)', flexShrink: 0 }}
        >
          <path d="M4 6l4 4 4-4" stroke="#7A8BA8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Equipment list */}
      {open && (
        <>
          {/* Table header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '110px 1fr 140px 80px 90px auto',
            gap: 0,
            padding: '8px 20px',
            background: 'rgba(255,255,255,0.02)',
            borderBottom: '1px solid #1E2535',
          }}>
            {['Código', 'Equipo', 'Puntos', 'Estado', '', ''].map((h, i) => (
              <span key={i} style={{
                color: '#4A5568', fontSize: 10, fontWeight: 600,
                textTransform: 'uppercase', letterSpacing: 0.5,
              }}>{h}</span>
            ))}
          </div>

          {equipos.map((equipo, i) => (
            <EquipoRow
              key={equipo.id}
              equipo={equipo}
              isLast={i === equipos.length - 1}
              onCarta={() => onCarta(equipo.id)}
              onEdit={() => onEdit(equipo.id)}
              onDelete={() => onDelete(equipo.id)}
            />
          ))}
        </>
      )}
    </div>
  )
}

export default function ListaEquipos() {
  const { equipos, eliminarEquipo } = useAdmin()
  const navigate = useNavigate()
  const [busqueda, setBusqueda] = useState('')
  const [confirmId, setConfirmId] = useState(null)

  const equipoAEliminar = equipos.find(e => e.id === confirmId)

  // Group equipment by area
  const areaGroups = useMemo(() => {
    const q = busqueda.toLowerCase().trim()
    const filtered = q
      ? equipos.filter(e =>
          e.nombre.toLowerCase().includes(q) ||
          e.codigo?.toLowerCase().includes(q) ||
          e.area.toLowerCase().includes(q)
        )
      : equipos

    const map = {}
    filtered.forEach(e => {
      if (!map[e.area]) map[e.area] = []
      map[e.area].push(e)
    })
    return Object.entries(map).map(([area, items]) => ({ area, items }))
  }, [equipos, busqueda])

  const totalEquipos = equipos.length
  const totalActivos = equipos.filter(e => e.activo !== false).length

  return (
    <AdminLayout titulo="Equipos">
      <div style={{ maxWidth: 1100 }}>
        {/* Toolbar */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
            <svg
              width="16" height="16" viewBox="0 0 16 16" fill="none"
              style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}
            >
              <circle cx="7" cy="7" r="4.5" stroke="#7A8BA8" strokeWidth="1.4" />
              <path d="M10.5 10.5L14 14" stroke="#7A8BA8" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              placeholder="Buscar por nombre, código o área..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              style={{
                width: '100%', padding: '10px 14px 10px 36px',
                background: '#111418', border: '1px solid #2A3346',
                borderRadius: 8, color: '#E8EDF5', fontSize: 14, outline: 'none',
                fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Stats chips */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{
              padding: '7px 14px', borderRadius: 8,
              background: 'rgba(244,160,32,0.1)', border: '1px solid rgba(244,160,32,0.2)',
              color: '#F4A020', fontSize: 13, fontWeight: 600,
              fontFamily: "'DM Sans', sans-serif",
            }}>
              {areaGroups.length} área{areaGroups.length !== 1 ? 's' : ''}
            </span>
            <span style={{
              padding: '7px 14px', borderRadius: 8,
              background: '#111418', border: '1px solid #2A3346',
              color: '#7A8BA8', fontSize: 13,
              fontFamily: "'DM Sans', sans-serif",
            }}>
              {totalActivos}/{totalEquipos} activos
            </span>
          </div>

          <button
            onClick={() => navigate('/admin/equipos/nuevo')}
            style={{
              padding: '10px 20px', borderRadius: 8, border: 'none',
              background: '#F4A020', color: '#0A0C0F',
              fontSize: 14, fontWeight: 700, cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif",
              flexShrink: 0,
            }}
          >
            + Nuevo equipo
          </button>
        </div>

        {/* Area sections */}
        {areaGroups.length === 0 ? (
          <div style={{
            background: '#111418', borderRadius: 12,
            border: '1px solid #1E2535',
            padding: 48, textAlign: 'center', color: '#4A5568', fontSize: 14,
          }}>
            {busqueda
              ? `No hay equipos que coincidan con "${busqueda}"`
              : 'No hay equipos registrados aún.'}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {areaGroups.map(({ area, items }, idx) => (
              <AreaSection
                key={area}
                area={area}
                equipos={items}
                color={PALETTE[idx % PALETTE.length]}
                areaIdx={idx}
                defaultOpen={true}
                onCarta={(id) => navigate(`/admin/equipos/${id}/carta`)}
                onEdit={(id) => navigate(`/admin/equipos/${id}/editar`)}
                onDelete={(id) => setConfirmId(id)}
              />
            ))}
          </div>
        )}
      </div>

      {confirmId && (
        <ConfirmModal
          titulo="Eliminar equipo"
          mensaje={`¿Seguro que quieres eliminar "${equipoAEliminar?.nombre}"? Se perderán todos sus puntos de lubricación.`}
          onConfirm={() => { eliminarEquipo(confirmId); setConfirmId(null) }}
          onCancel={() => setConfirmId(null)}
        />
      )}
    </AdminLayout>
  )
}
