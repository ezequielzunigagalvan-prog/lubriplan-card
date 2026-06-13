import { useState, useEffect } from 'react'
import AdminLayout from '../components/AdminLayout'
import { useAdmin } from '../context/AdminContext'
import { obtenerHistoricoEquipo, obtenerEstadisticasLubricacion } from '../../api/cardApi'

export default function HistoricoLubricaciones() {
  const { equipos } = useAdmin()
  const [equipoSeleccionado, setEquipoSeleccionado] = useState(null)
  const [historicoEquipo, setHistoricoEquipo] = useState([])
  const [estadisticasEquipo, setEstadisticasEquipo] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!equipoSeleccionado) {
      setHistoricoEquipo([])
      setEstadisticasEquipo([])
      return
    }

    setLoading(true)
    Promise.all([
      obtenerHistoricoEquipo(equipoSeleccionado),
      obtenerEstadisticasLubricacion(equipoSeleccionado)
    ])
      .then(([hist, est]) => {
        setHistoricoEquipo(hist || [])
        setEstadisticasEquipo(est || [])
      })
      .catch(err => console.error('Error cargando datos:', err))
      .finally(() => setLoading(false))
  }, [equipoSeleccionado])

  const equipoActual = equipoSeleccionado ? equipos.find(e => e.id === equipoSeleccionado) : null
  const totalLubricaciones = historicoEquipo.length
  const totalPuntosUnicos = new Set(historicoEquipo.map(h => h.puntoNombre)).size

  return (
    <AdminLayout titulo="Histórico de Lubricaciones">
      <div style={{ maxWidth: 1200, display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Selector */}
        <div style={{ background: '#13112a', borderRadius: 12, border: '1px solid #2a2850', padding: 16 }}>
          <label style={{
            display: 'block',
            color: '#8892b0',
            fontSize: 11,
            letterSpacing: 0.5,
            marginBottom: 8,
            textTransform: 'uppercase',
            fontWeight: 600,
          }}>
            Selecciona un equipo
          </label>
          <select
            value={equipoSeleccionado || ''}
            onChange={(e) => setEquipoSeleccionado(e.target.value || null)}
            style={{
              width: '100%',
              padding: '10px 12px',
              background: '#0c0a1e',
              border: '1px solid #2a2850',
              borderRadius: 8,
              color: '#e8eeff',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            <option value="">Selecciona un equipo...</option>
            {equipos.filter(e => e.activo !== false).map(e => (
              <option key={e.id} value={e.id}>
                {e.nombre} ({e.puntos?.length || 0} puntos)
              </option>
            ))}
          </select>
        </div>

        {equipoSeleccionado && (
          <>
            {/* Estadísticas */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
              <div style={{ background: '#13112a', borderRadius: 12, border: '1px solid #2a2850', padding: 16 }}>
                <div style={{ color: '#8892b0', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
                  Total de lubricaciones
                </div>
                <div style={{ color: '#22C55E', fontSize: 32, fontWeight: 700 }}>
                  {totalLubricaciones}
                </div>
              </div>

              <div style={{ background: '#13112a', borderRadius: 12, border: '1px solid #2a2850', padding: 16 }}>
                <div style={{ color: '#8892b0', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
                  Puntos únicos lubricados
                </div>
                <div style={{ color: '#3B82F6', fontSize: 32, fontWeight: 700 }}>
                  {totalPuntosUnicos}
                </div>
              </div>

              <div style={{ background: '#13112a', borderRadius: 12, border: '1px solid #2a2850', padding: 16 }}>
                <div style={{ color: '#8892b0', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
                  Promedio por día
                </div>
                <div style={{ color: '#F97316', fontSize: 32, fontWeight: 700 }}>
                  {estadisticasEquipo.length > 0 ? (totalLubricaciones / estadisticasEquipo.length).toFixed(1) : '0'}
                </div>
              </div>
            </div>

            {/* Gráfico de Tendencia */}
            {estadisticasEquipo.length > 0 && (
              <div style={{ background: '#13112a', borderRadius: 12, border: '1px solid #2a2850', padding: 16 }}>
                <p style={{ color: '#e8eeff', fontSize: 15, fontWeight: 700, margin: '0 0 16px' }}>
                  📊 Últimos 30 días
                </p>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 120 }}>
                  {estadisticasEquipo.reverse().slice(-30).map((stat, i) => {
                    const maxVal = Math.max(...estadisticasEquipo.map(s => s.totalLubricaciones), 1)
                    const altura = (stat.totalLubricaciones / maxVal) * 100
                    return (
                      <div
                        key={i}
                        style={{
                          flex: 1,
                          height: `${altura || 5}%`,
                          background: '#6366f1',
                          borderRadius: 2,
                          minHeight: altura > 0 ? 4 : 2,
                          cursor: 'pointer',
                          opacity: 0.8,
                          transition: 'opacity 0.2s',
                        }}
                        title={`${stat.fecha}: ${stat.totalLubricaciones} lubricaciones`}
                        onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                        onMouseLeave={(e) => e.currentTarget.style.opacity = '0.8'}
                      />
                    )
                  })}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#4a5070', marginTop: 8 }}>
                  <span>Hace 30 días</span>
                  <span>Hoy</span>
                </div>
              </div>
            )}

            {/* Tabla de Histórico */}
            <div style={{ background: '#13112a', borderRadius: 12, border: '1px solid #2a2850', padding: 16 }}>
              <p style={{ color: '#e8eeff', fontSize: 15, fontWeight: 700, margin: '0 0 12px' }}>
                📋 Histórico de {equipoActual?.nombre}
              </p>

              {loading ? (
                <p style={{ color: '#4a5070', fontSize: 13, margin: 0 }}>Cargando...</p>
              ) : historicoEquipo.length === 0 ? (
                <p style={{ color: '#4a5070', fontSize: 13, margin: 0 }}>Sin lubricaciones registradas</p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: 12,
                  }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #2a2850' }}>
                        <th style={{ color: '#8892b0', fontWeight: 600, textAlign: 'left', padding: '8px 0', fontSize: 10, textTransform: 'uppercase' }}>
                          Punto
                        </th>
                        <th style={{ color: '#8892b0', fontWeight: 600, textAlign: 'left', padding: '8px 0', fontSize: 10, textTransform: 'uppercase' }}>
                          Técnico
                        </th>
                        <th style={{ color: '#8892b0', fontWeight: 600, textAlign: 'left', padding: '8px 0', fontSize: 10, textTransform: 'uppercase' }}>
                          Fecha
                        </th>
                        <th style={{ color: '#8892b0', fontWeight: 600, textAlign: 'left', padding: '8px 0', fontSize: 10, textTransform: 'uppercase' }}>
                          Hora
                        </th>
                        <th style={{ color: '#8892b0', fontWeight: 600, textAlign: 'center', padding: '8px 0', fontSize: 10, textTransform: 'uppercase' }}>
                          Estado
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {historicoEquipo.map((hub, i) => (
                        <tr
                          key={i}
                          style={{
                            borderBottom: i === historicoEquipo.length - 1 ? 'none' : '1px solid #2a2850',
                            background: i % 2 === 0 ? 'transparent' : 'rgba(99,102,241,0.03)',
                          }}
                        >
                          <td style={{ color: '#e8eeff', padding: '10px 0', fontWeight: 500 }}>
                            {hub.puntoNombre}
                          </td>
                          <td style={{ color: '#8892b0', padding: '10px 0' }}>
                            {hub.tecnicoNombre || '—'}
                          </td>
                          <td style={{ color: '#8892b0', padding: '10px 0' }}>
                            {hub.fecha}
                          </td>
                          <td style={{ color: '#8892b0', padding: '10px 0' }}>
                            {hub.hora || '—'}
                          </td>
                          <td style={{ textAlign: 'center', padding: '10px 0', color: '#22C55E', fontWeight: 700 }}>
                            ✓
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  )
}
