import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '../components/AdminLayout'
import ConfirmModal from '../components/ConfirmModal'
import { useAdmin } from '../context/AdminContext'

function ActionBtn({ color, children, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: '5px 12px', borderRadius: 6,
      border: `1px solid ${color}44`,
      background: `${color}11`, color,
      fontSize: 12, fontWeight: 600, cursor: 'pointer',
    }}>
      {children}
    </button>
  )
}

export default function ListaEquipos() {
  const { equipos, eliminarEquipo } = useAdmin()
  const navigate = useNavigate()
  const [busqueda, setBusqueda] = useState('')
  const [filtroArea, setFiltroArea] = useState('')
  const [confirmId, setConfirmId] = useState(null)

  const areas = [...new Set(equipos.map(e => e.area))]

  const filtrados = equipos.filter(e => {
    const matchNombre = e.nombre.toLowerCase().includes(busqueda.toLowerCase())
    const matchArea = !filtroArea || e.area === filtroArea
    return matchNombre && matchArea
  })

  const equipoAEliminar = equipos.find(e => e.id === confirmId)

  return (
    <AdminLayout titulo="Equipos">
      <div style={{ maxWidth: 1100 }}>
        {/* Toolbar */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Buscar equipo..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            style={{
              flex: 1, minWidth: 180, padding: '10px 14px',
              background: '#111418', border: '1px solid #2A3346',
              borderRadius: 8, color: '#E8EDF5', fontSize: 14, outline: 'none',
              fontFamily: "'DM Sans', sans-serif",
            }}
          />
          <select
            value={filtroArea}
            onChange={e => setFiltroArea(e.target.value)}
            style={{
              padding: '10px 14px',
              background: '#111418', border: '1px solid #2A3346',
              borderRadius: 8, color: filtroArea ? '#E8EDF5' : '#7A8BA8',
              fontSize: 14, outline: 'none',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            <option value="">Todas las áreas</option>
            {areas.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
          <button
            onClick={() => navigate('/admin/equipos/nuevo')}
            style={{
              padding: '10px 20px', borderRadius: 8, border: 'none',
              background: '#F4A020', color: '#0A0C0F',
              fontSize: 14, fontWeight: 700, cursor: 'pointer',
            }}
          >
            + Nuevo equipo
          </button>
        </div>

        {/* Table */}
        <div style={{
          background: '#111418', borderRadius: 12,
          border: '1px solid #1E2535', overflow: 'hidden',
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #1E2535' }}>
                {['Equipo', 'Área', 'Puntos', 'Estado', 'Acciones'].map(h => (
                  <th key={h} style={{
                    padding: '12px 20px', textAlign: 'left',
                    color: '#4A5568', fontSize: 11, fontWeight: 600,
                    textTransform: 'uppercase', letterSpacing: 0.5,
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtrados.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: 40, textAlign: 'center', color: '#4A5568', fontSize: 14 }}>
                    No hay equipos que coincidan con la búsqueda
                  </td>
                </tr>
              )}
              {filtrados.map((e, i) => (
                <tr key={e.id} style={{
                  borderBottom: i < filtrados.length - 1 ? '1px solid #1E2535' : 'none',
                  background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)',
                }}>
                  <td style={{ padding: '13px 20px' }}>
                    <div style={{ color: '#E8EDF5', fontSize: 14, fontWeight: 500 }}>{e.nombre}</div>
                  </td>
                  <td style={{ padding: '13px 20px', color: '#7A8BA8', fontSize: 13 }}>{e.area}</td>
                  <td style={{ padding: '13px 20px', color: '#7A8BA8', fontSize: 13 }}>{e.puntos?.length || 0}</td>
                  <td style={{ padding: '13px 20px' }}>
                    <span style={{
                      padding: '3px 10px', borderRadius: 20,
                      fontSize: 11, fontWeight: 600,
                      background: e.activo !== false ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
                      color: e.activo !== false ? '#22C55E' : '#EF4444',
                    }}>
                      {e.activo !== false ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td style={{ padding: '13px 20px' }}>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <ActionBtn color="#3B82F6" onClick={() => navigate(`/admin/equipos/${e.id}/carta`)}>Carta</ActionBtn>
                      <ActionBtn color="#F4A020" onClick={() => navigate(`/admin/equipos/${e.id}/editar`)}>Editar</ActionBtn>
                      <ActionBtn color="#EF4444" onClick={() => setConfirmId(e.id)}>Eliminar</ActionBtn>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {confirmId && (
        <ConfirmModal
          titulo="Eliminar equipo"
          mensaje={`¿Seguro que querés eliminar "${equipoAEliminar?.nombre}"? Se perderán todos sus puntos de lubricación.`}
          onConfirm={() => { eliminarEquipo(confirmId); setConfirmId(null) }}
          onCancel={() => setConfirmId(null)}
        />
      )}
    </AdminLayout>
  )
}
