import { useNavigate } from 'react-router-dom'
import AdminLayout from '../components/AdminLayout'
import { useAdmin } from '../context/AdminContext'

function StatCard({ label, value, color, icon }) {
  return (
    <div style={{
      background: '#111418', borderRadius: 12,
      border: '1px solid #1E2535', padding: '20px 24px',
      display: 'flex', alignItems: 'center', gap: 16,
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 10,
        background: `${color}18`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color, flexShrink: 0,
      }}>
        {icon}
      </div>
      <div>
        <div style={{ color: '#7A8BA8', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
          {label}
        </div>
        <div style={{ color: '#E8EDF5', fontSize: 28, fontWeight: 700, lineHeight: 1 }}>{value}</div>
      </div>
    </div>
  )
}

export default function DashboardAdmin() {
  const { equipos, tecnicos } = useAdmin()
  const navigate = useNavigate()

  const totalPuntos = equipos.reduce((acc, e) => acc + (e.puntos?.length || 0), 0)
  const tecnicosActivos = tecnicos.filter(t => t.activo).length
  const equiposConVencidos = equipos.filter(e => (e.vencidos || 0) > 0).length

  return (
    <AdminLayout titulo="Dashboard">
      <div style={{ maxWidth: 1100 }}>
        {/* Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: 16, marginBottom: 32,
        }}>
          <StatCard label="Equipos registrados" value={equipos.length} color="#F4A020" icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" /></svg>
          } />
          <StatCard label="Puntos de lubricación" value={totalPuntos} color="#3B82F6" icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
          } />
          <StatCard label="Técnicos activos" value={tecnicosActivos} color="#22C55E" icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>
          } />
          <StatCard label="Equipos con vencidos" value={equiposConVencidos} color="#EF4444" icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
          } />
        </div>

        {/* Content row */}
        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          {/* Equipos table */}
          <div style={{
            flex: '1 1 500px',
            background: '#111418', borderRadius: 12,
            border: '1px solid #1E2535', overflow: 'hidden',
          }}>
            <div style={{
              padding: '16px 24px', borderBottom: '1px solid #1E2535',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <h2 style={{ color: '#E8EDF5', fontSize: 15, fontWeight: 600, margin: 0 }}>Cartas recientes</h2>
              <button onClick={() => navigate('/admin/equipos')} style={{
                background: 'none', border: 'none', color: '#F4A020', cursor: 'pointer', fontSize: 13,
              }}>
                Ver todos →
              </button>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #1E2535' }}>
                  {['Equipo', 'Área', 'Puntos', 'Vencidos', ''].map(h => (
                    <th key={h} style={{
                      padding: '10px 20px', textAlign: 'left',
                      color: '#4A5568', fontSize: 11, fontWeight: 600,
                      textTransform: 'uppercase', letterSpacing: 0.5,
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {equipos.slice(0, 6).map((e, i) => (
                  <tr key={e.id} style={{
                    borderBottom: i < 5 ? '1px solid #1E2535' : 'none',
                    background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
                  }}>
                    <td style={{ padding: '12px 20px', color: '#E8EDF5', fontSize: 14 }}>{e.nombre}</td>
                    <td style={{ padding: '12px 20px', color: '#7A8BA8', fontSize: 13 }}>{e.area}</td>
                    <td style={{ padding: '12px 20px', color: '#7A8BA8', fontSize: 13 }}>{e.puntos?.length || 0}</td>
                    <td style={{ padding: '12px 20px' }}>
                      <span style={{ color: e.vencidos > 0 ? '#EF4444' : '#22C55E', fontSize: 13, fontWeight: 600 }}>
                        {e.vencidos || 0}
                      </span>
                    </td>
                    <td style={{ padding: '12px 20px' }}>
                      <button onClick={() => navigate(`/admin/equipos/${e.id}/carta`)} style={{
                        background: 'none', border: 'none', color: '#F4A020', cursor: 'pointer', fontSize: 12,
                      }}>
                        Ver →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* CTA */}
          <button
            onClick={() => navigate('/admin/equipos/nuevo')}
            style={{
              flex: '0 0 auto',
              background: '#F4A020', color: '#0A0C0F',
              border: 'none', borderRadius: 10,
              padding: '14px 28px',
              fontSize: 14, fontWeight: 700,
              cursor: 'pointer', whiteSpace: 'nowrap',
              letterSpacing: 0.3,
            }}
          >
            + Agregar equipo
          </button>
        </div>
      </div>
    </AdminLayout>
  )
}
