import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '../components/AdminLayout'
import ConfirmModal from '../components/ConfirmModal'
import QRModal from '../components/QRModal'
import { useAdmin } from '../context/AdminContext'

const PALETTE = [
  '#818cf8', '#22C55E', '#3B82F6', '#A855F7',
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

function EquipoRow({ equipo, isLast, onEdit, onCarta, onDelete, onQR, isSelected, onToggleSelect }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '28px 110px 1fr 120px 80px 240px',
        alignItems: 'center',
        gap: 0,
        padding: '13px 20px',
        borderBottom: isLast ? 'none' : '1px solid #2a2850',
        transition: 'background 0.1s',
        background: isSelected ? 'rgba(99,102,241,0.08)' : 'transparent',
      }}
      onMouseEnter={e => !isSelected && (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
      onMouseLeave={e => !isSelected && (e.currentTarget.style.background = 'transparent')}
    >
      <input
        type="checkbox"
        checked={isSelected}
        onChange={onToggleSelect}
        style={{
          width: 18,
          height: 18,
          cursor: 'pointer',
          accentColor: '#818cf8',
        }}
      />
      <span style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 700, color: '#818cf8', letterSpacing: 1 }}>
        {equipo.codigo || '—'}
      </span>

      <div>
        <div style={{ color: '#e8eeff', fontSize: 14, fontWeight: 500 }}>{equipo.nombre}</div>
        {equipo.imagenes?.length > 0 && (
          <span style={{ fontSize: 11, color: '#4a5070', marginTop: 2, display: 'block' }}>
            {equipo.imagenes.length} foto{equipo.imagenes.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      <span style={{ color: '#8892b0', fontSize: 13 }}>
        {equipo.puntos?.length || 0} punto{equipo.puntos?.length !== 1 ? 's' : ''}
      </span>

      <span style={{
        padding: '3px 10px', borderRadius: 20,
        fontSize: 11, fontWeight: 600, display: 'inline-block',
        background: equipo.activo !== false ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
        color: equipo.activo !== false ? '#22C55E' : '#EF4444',
      }}>
        {equipo.activo !== false ? 'Activo' : 'Inactivo'}
      </span>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <ActionBtn color="#06B6D4" onClick={onQR}>QR</ActionBtn>
        <ActionBtn color="#3B82F6" onClick={onCarta}>Carta</ActionBtn>
        <ActionBtn color="#818cf8" onClick={onEdit}>Editar</ActionBtn>
        <ActionBtn color="#EF4444" onClick={onDelete}>Eliminar</ActionBtn>
      </div>
    </div>
  )
}

function ColHeader({ onSelectAll, allSelected }) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '28px 110px 1fr 120px 80px 240px',
      gap: 0, padding: '8px 20px',
      background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid #2a2850',
    }}>
      <input
        type="checkbox"
        checked={allSelected}
        onChange={onSelectAll}
        style={{
          width: 18,
          height: 18,
          cursor: 'pointer',
          accentColor: '#818cf8',
        }}
      />
      {['Código', 'Equipo', 'Puntos', 'Estado', '', ''].map((h, i) => (
        <span key={i} style={{ color: '#4a5070', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</span>
      ))}
    </div>
  )
}

function SubAreaSection({ subArea, equipos, color, onEdit, onCarta, onDelete, onQR, seleccionados, onToggleSelect }) {
  const [open, setOpen] = useState(true)
  return (
    <div style={{ marginLeft: 20, borderLeft: `2px solid ${color}40` }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 10,
          padding: '9px 16px', background: 'transparent',
          borderBottom: open ? '1px solid #2a2850' : 'none',
          cursor: 'pointer', border: 'none', textAlign: 'left',
        }}
      >
        <div style={{ width: 7, height: 7, borderRadius: '50%', background: color + '88', flexShrink: 0 }} />
        <span style={{ color: '#a5b4c8', fontSize: 13, fontWeight: 600, flex: 1, fontFamily: "'DM Sans', sans-serif" }}>
          {subArea}
        </span>
        <span style={{ fontSize: 11, color: '#4a5070' }}>
          {equipos.length} equipo{equipos.length !== 1 ? 's' : ''}
        </span>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
          style={{ transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none', flexShrink: 0 }}>
          <path d="M3 5l4 4 4-4" stroke="#4a5070" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <>
          <ColHeader />
          {equipos.map((equipo, i) => (
            <EquipoRow key={equipo.id} equipo={equipo} isLast={i === equipos.length - 1}
              onCarta={() => onCarta(equipo.id)} onEdit={() => onEdit(equipo.id)}
              onDelete={() => onDelete(equipo.id)} onQR={() => onQR(equipo)}
              isSelected={seleccionados.has(equipo.id)} onToggleSelect={() => onToggleSelect(equipo.id)} />
          ))}
        </>
      )}
    </div>
  )
}

function AreaSection({ area, equipos, color, defaultOpen, onEdit, onCarta, onDelete, onQR, seleccionados, onToggleSelect }) {
  const [open, setOpen] = useState(defaultOpen)

  // Agrupar por sub_area
  const { sinSubArea, subAreas } = useMemo(() => {
    const sin = equipos.filter(e => !e.subArea)
    const map = {}
    equipos.filter(e => e.subArea).forEach(e => {
      if (!map[e.subArea]) map[e.subArea] = []
      map[e.subArea].push(e)
    })
    return { sinSubArea: sin, subAreas: Object.entries(map) }
  }, [equipos])

  const tieneSubAreas = subAreas.length > 0

  return (
    <div style={{ background: '#13112a', border: '1px solid #2a2850', borderRadius: 12, overflow: 'hidden' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 12,
          padding: '14px 20px',
          background: open ? `${color}08` : 'transparent',
          borderBottom: open ? '1px solid #2a2850' : 'none',
          cursor: 'pointer', border: 'none', textAlign: 'left',
          transition: 'background 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.background = `${color}10`}
        onMouseLeave={e => e.currentTarget.style.background = open ? `${color}08` : 'transparent'}
      >
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, flexShrink: 0 }} />
        <span style={{ color: '#e8eeff', fontSize: 14, fontWeight: 700, flex: 1, fontFamily: "'DM Sans', sans-serif" }}>
          {area}
        </span>
        {tieneSubAreas && (
          <span style={{ fontSize: 11, color: '#4a5070', marginRight: 4 }}>
            {subAreas.length} sub-área{subAreas.length !== 1 ? 's' : ''}
          </span>
        )}
        <span style={{
          padding: '2px 10px', borderRadius: 20, fontSize: 12,
          background: `${color}18`, color, fontWeight: 600,
          border: `1px solid ${color}30`, fontFamily: "'DM Sans', sans-serif",
        }}>
          {equipos.length} equipo{equipos.length !== 1 ? 's' : ''}
        </span>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
          style={{ transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)', flexShrink: 0 }}>
          <path d="M4 6l4 4 4-4" stroke="#8892b0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <>
          {/* Sub-áreas */}
          {subAreas.map(([subArea, eqs]) => (
            <SubAreaSection key={subArea} subArea={subArea} equipos={eqs} color={color}
              onCarta={onCarta} onEdit={onEdit} onDelete={onDelete} onQR={onQR}
              seleccionados={seleccionados} onToggleSelect={onToggleSelect} />
          ))}

          {/* Equipos sin sub-área */}
          {sinSubArea.length > 0 && (
            <>
              {tieneSubAreas && (
                <div style={{ padding: '7px 20px', background: 'rgba(255,255,255,0.01)', borderTop: '1px solid #2a2850' }}>
                  <span style={{ color: '#4a5070', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Sin sub-área</span>
                </div>
              )}
              <ColHeader />
              {sinSubArea.map((equipo, i) => (
                <EquipoRow key={equipo.id} equipo={equipo} isLast={i === sinSubArea.length - 1}
                  onCarta={() => onCarta(equipo.id)} onEdit={() => onEdit(equipo.id)}
                  onDelete={() => onDelete(equipo.id)} onQR={() => onQR(equipo)}
                  isSelected={seleccionados.has(equipo.id)} onToggleSelect={() => onToggleSelect(equipo.id)} />
              ))}
            </>
          )}
        </>
      )}
    </div>
  )
}

export default function ListaEquipos() {
  const { equipos, eliminarEquipo, eliminarEquiposMasivo, exportarEquipos } = useAdmin()
  const navigate = useNavigate()
  const [busqueda, setBusqueda] = useState('')
  const [confirmId, setConfirmId] = useState(null)
  const [qrEquipo, setQrEquipo] = useState(null)
  const [seleccionados, setSeleccionados] = useState(new Set())
  const [exportando, setExportando] = useState(false)
  const [eliminandoMasivo, setEliminandoMasivo] = useState(false)

  const equipoAEliminar = equipos.find(e => e.id === confirmId)

  const toggleSeleccion = (id) => {
    const nuevo = new Set(seleccionados)
    if (nuevo.has(id)) {
      nuevo.delete(id)
    } else {
      nuevo.add(id)
    }
    setSeleccionados(nuevo)
  }

  const seleccionarTodos = () => {
    if (seleccionados.size === equipos.length) {
      setSeleccionados(new Set())
    } else {
      setSeleccionados(new Set(equipos.map(e => e.id)))
    }
  }

  const handleExportarEquipos = async () => {
    try {
      setExportando(true)
      await exportarEquipos()
    } catch (err) {
      alert(`Error al exportar: ${err.message}`)
    } finally {
      setExportando(false)
    }
  }

  const handleEliminarMasivo = async () => {
    if (seleccionados.size === 0) return
    if (!window.confirm(`¿Seguro que querés eliminar ${seleccionados.size} equipo${seleccionados.size !== 1 ? 's' : ''}? Esta acción no se puede deshacer.`)) return

    try {
      setEliminandoMasivo(true)
      await eliminarEquiposMasivo(Array.from(seleccionados))
      setSeleccionados(new Set())
    } catch (err) {
      alert(`Error al eliminar: ${err.message}`)
    } finally {
      setEliminandoMasivo(false)
    }
  }

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
        <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
              style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}>
              <circle cx="7" cy="7" r="4.5" stroke="#8892b0" strokeWidth="1.4" />
              <path d="M10.5 10.5L14 14" stroke="#8892b0" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              placeholder="Buscar por nombre, código o área..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              style={{
                width: '100%', padding: '10px 14px 10px 36px',
                background: '#13112a', border: '1px solid #2a2850',
                borderRadius: 8, color: '#e8eeff', fontSize: 14, outline: 'none',
                fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{
              padding: '7px 14px', borderRadius: 8,
              background: 'rgba(129,140,248,0.1)', border: '1px solid rgba(129,140,248,0.2)',
              color: '#818cf8', fontSize: 13, fontWeight: 600,
              fontFamily: "'DM Sans', sans-serif",
            }}>
              {areaGroups.length} área{areaGroups.length !== 1 ? 's' : ''}
            </span>
            <span style={{
              padding: '7px 14px', borderRadius: 8,
              background: '#13112a', border: '1px solid #2a2850',
              color: '#8892b0', fontSize: 13,
              fontFamily: "'DM Sans', sans-serif",
            }}>
              {totalActivos}/{totalEquipos} activos
            </span>
          </div>

          {seleccionados.size > 0 ? (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{
                padding: '7px 14px', borderRadius: 8,
                background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)',
                color: '#818cf8', fontSize: 13, fontWeight: 600,
                fontFamily: "'DM Sans', sans-serif",
              }}>
                {seleccionados.size} seleccionado{seleccionados.size !== 1 ? 's' : ''}
              </span>
              <button
                onClick={() => setSeleccionados(new Set())}
                style={{
                  padding: '10px 14px', borderRadius: 8, border: '1px solid #2a2850',
                  background: 'transparent', color: '#8892b0',
                  fontSize: 13, cursor: 'pointer',
                  fontFamily: "'DM Sans', sans-serif", flexShrink: 0,
                }}
              >
                Limpiar
              </button>
              <button
                onClick={handleEliminarMasivo}
                disabled={eliminandoMasivo}
                style={{
                  padding: '10px 16px', borderRadius: 8, border: 'none',
                  background: eliminandoMasivo ? '#666' : '#EF4444', color: '#fff',
                  fontSize: 13, fontWeight: 700, cursor: eliminandoMasivo ? 'not-allowed' : 'pointer',
                  fontFamily: "'DM Sans', sans-serif", flexShrink: 0,
                }}
              >
                {eliminandoMasivo ? 'Eliminando...' : `🗑️ Eliminar (${seleccionados.size})`}
              </button>
            </div>
          ) : totalEquipos > 0 && (
            <button
              onClick={seleccionarTodos}
              style={{
                padding: '10px 14px', borderRadius: 8, border: '1px solid #2a2850',
                background: 'transparent', color: '#8892b0',
                fontSize: 13, cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif", flexShrink: 0,
              }}
            >
              ☑️ Seleccionar todos
            </button>
          )}

          <button
            onClick={handleExportarEquipos}
            disabled={exportando || equipos.length === 0}
            style={{
              padding: '10px 16px', borderRadius: 8, border: '1px solid #2a2850',
              background: 'transparent', color: exportando ? '#666' : '#8892b0',
              fontSize: 13, cursor: exportando || equipos.length === 0 ? 'not-allowed' : 'pointer',
              fontFamily: "'DM Sans', sans-serif", flexShrink: 0,
            }}
          >
            {exportando ? '📥 Exportando...' : '📥 Exportar Excel'}
          </button>

          <button
            onClick={() => navigate('/admin/equipos/nuevo')}
            style={{
              padding: '10px 20px', borderRadius: 8, border: 'none',
              background: '#6366f1', color: '#fff',
              fontSize: 14, fontWeight: 700, cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif", flexShrink: 0,
            }}
          >
            + Nuevo equipo
          </button>
        </div>

        {areaGroups.length === 0 ? (
          <div style={{
            background: '#13112a', borderRadius: 12,
            border: '1px solid #2a2850',
            padding: 48, textAlign: 'center', color: '#4a5070', fontSize: 14,
          }}>
            {busqueda ? `No hay equipos que coincidan con "${busqueda}"` : 'No hay equipos registrados aún.'}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {areaGroups.map(({ area, items }, idx) => (
              <AreaSection
                key={area}
                area={area}
                equipos={items}
                color={PALETTE[idx % PALETTE.length]}
                defaultOpen={true}
                onCarta={(id) => navigate(`/admin/equipos/${id}/carta`)}
                onEdit={(id) => navigate(`/admin/equipos/${id}/editar`)}
                onDelete={(id) => setConfirmId(id)}
                onQR={(equipo) => setQrEquipo(equipo)}
                seleccionados={seleccionados}
                onToggleSelect={toggleSeleccion}
              />
            ))}
          </div>
        )}
      </div>

      {confirmId && (
        <ConfirmModal
          titulo="Eliminar equipo"
          mensaje={`¿Seguro que quieres eliminar "${equipoAEliminar?.nombre}"? Se perderán todos sus puntos de lubricación.`}
          onConfirm={async () => {
            try {
              await eliminarEquipo(confirmId)
            } catch (err) {
              alert(`Error al eliminar: ${err.message}`)
            } finally {
              setConfirmId(null)
            }
          }}
          onCancel={() => setConfirmId(null)}
        />
      )}

      {qrEquipo && (
        <QRModal equipo={qrEquipo} onClose={() => setQrEquipo(null)} />
      )}
    </AdminLayout>
  )
}
