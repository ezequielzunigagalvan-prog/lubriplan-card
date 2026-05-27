import { useState } from 'react'
import AdminLayout from '../components/AdminLayout'
import ConfirmModal from '../components/ConfirmModal'
import { useAdmin } from '../context/AdminContext'

function generarPIN() {
  return String(Math.floor(1000 + Math.random() * 9000))
}

function TecnicoModal({ tecnico, onSave, onClose }) {
  const isEditing = !!tecnico
  const [form, setForm] = useState({
    nombre: tecnico?.nombre || '',
    pin: tecnico?.pin || '',
  })
  const [error, setError] = useState('')

  const handleSave = () => {
    if (!form.nombre.trim()) { setError('El nombre es requerido'); return }
    if (!/^\d{4}$/.test(form.pin)) { setError('El PIN debe ser exactamente 4 dígitos'); return }
    onSave(form)
  }

  const commonInput = {
    width: '100%', padding: '10px 12px',
    background: '#0A0C0F', border: '1px solid #2A3346',
    borderRadius: 7, color: '#E8EDF5', fontSize: 14,
    outline: 'none', boxSizing: 'border-box',
    fontFamily: "'DM Sans', sans-serif",
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(0,0,0,0.75)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    }}>
      <div style={{
        background: '#1A1F2B', borderRadius: 12, padding: 28,
        maxWidth: 380, width: '100%', border: '1px solid #2A3346',
      }}>
        <h3 style={{ color: '#E8EDF5', fontSize: 17, fontWeight: 600, margin: '0 0 20px' }}>
          {isEditing ? 'Editar técnico' : 'Nuevo técnico'}
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', color: '#7A8BA8', fontSize: 12, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Nombre
            </label>
            <input
              type="text"
              value={form.nombre}
              onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))}
              placeholder="Nombre completo"
              style={commonInput}
            />
          </div>
          <div>
            <label style={{ display: 'block', color: '#7A8BA8', fontSize: 12, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              PIN (4 dígitos)
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                value={form.pin}
                onChange={e => setForm(p => ({ ...p, pin: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                placeholder="0000"
                maxLength={4}
                style={{ ...commonInput, flex: 1, letterSpacing: 8, fontFamily: 'monospace', fontSize: 18 }}
              />
              <button
                onClick={() => setForm(p => ({ ...p, pin: generarPIN() }))}
                style={{
                  padding: '10px 14px', borderRadius: 7, border: '1px solid #2A3346',
                  background: 'transparent', color: '#7A8BA8', cursor: 'pointer', fontSize: 12,
                  whiteSpace: 'nowrap', fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Generar
              </button>
            </div>
          </div>

          {error && <div style={{ color: '#EF4444', fontSize: 12 }}>{error}</div>}

          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button onClick={onClose} style={{
              flex: 1, padding: '11px', border: '1px solid #2A3346', borderRadius: 8,
              background: 'transparent', color: '#7A8BA8', cursor: 'pointer', fontSize: 14,
              fontFamily: "'DM Sans', sans-serif",
            }}>
              Cancelar
            </button>
            <button onClick={handleSave} style={{
              flex: 2, padding: '11px', background: '#F4A020', color: '#0A0C0F',
              border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif",
            }}>
              {isEditing ? 'Guardar' : 'Crear técnico'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function GestionTecnicos() {
  const { tecnicos, crearTecnico, editarTecnico, eliminarTecnico, toggleTecnico } = useAdmin()
  const [modal, setModal] = useState(null) // null | 'nuevo' | tecnico-obj
  const [confirmId, setConfirmId] = useState(null)

  const tecnicoAEditar = modal && modal !== 'nuevo' ? modal : null
  const tecnicoAEliminar = tecnicos.find(t => t.id === confirmId)

  const handleSave = (datos) => {
    if (tecnicoAEditar) {
      editarTecnico(tecnicoAEditar.id, datos)
    } else {
      crearTecnico(datos)
    }
    setModal(null)
  }

  function ActionBtn({ color, children, onClick }) {
    return (
      <button onClick={onClick} style={{
        padding: '5px 12px', borderRadius: 6,
        border: `1px solid ${color}44`,
        background: `${color}11`, color,
        fontSize: 12, fontWeight: 600, cursor: 'pointer',
        fontFamily: "'DM Sans', sans-serif",
      }}>
        {children}
      </button>
    )
  }

  return (
    <AdminLayout titulo="Técnicos">
      <div style={{ maxWidth: 820 }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
          <button
            onClick={() => setModal('nuevo')}
            style={{
              padding: '10px 20px', borderRadius: 8, border: 'none',
              background: '#F4A020', color: '#0A0C0F',
              fontSize: 14, fontWeight: 700, cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            + Nuevo técnico
          </button>
        </div>

        <div style={{
          background: '#111418', borderRadius: 12,
          border: '1px solid #1E2535', overflow: 'hidden',
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #1E2535' }}>
                {['Nombre', 'PIN', 'Última consulta', 'Estado', 'Acciones'].map(h => (
                  <th key={h} style={{
                    padding: '12px 20px', textAlign: 'left',
                    color: '#4A5568', fontSize: 11, fontWeight: 600,
                    textTransform: 'uppercase', letterSpacing: 0.5,
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tecnicos.map((t, i) => (
                <tr key={t.id} style={{
                  borderBottom: i < tecnicos.length - 1 ? '1px solid #1E2535' : 'none',
                  background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)',
                }}>
                  <td style={{ padding: '13px 20px', color: '#E8EDF5', fontSize: 14, fontWeight: 500 }}>
                    {t.nombre}
                  </td>
                  <td style={{ padding: '13px 20px' }}>
                    <span style={{ fontFamily: 'monospace', fontSize: 18, letterSpacing: 4, color: '#F4A020' }}>
                      {t.pin}
                    </span>
                  </td>
                  <td style={{ padding: '13px 20px', color: '#7A8BA8', fontSize: 13 }}>
                    {t.ultimaConsulta || '—'}
                  </td>
                  <td style={{ padding: '13px 20px' }}>
                    <button
                      onClick={() => toggleTecnico(t.id)}
                      title="Clic para cambiar estado"
                      style={{
                        padding: '3px 10px', borderRadius: 20, border: 'none',
                        fontSize: 11, fontWeight: 600, cursor: 'pointer',
                        background: t.activo ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
                        color: t.activo ? '#22C55E' : '#EF4444',
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      {t.activo ? 'Activo' : 'Inactivo'}
                    </button>
                  </td>
                  <td style={{ padding: '13px 20px' }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <ActionBtn color="#F4A020" onClick={() => setModal(t)}>Editar</ActionBtn>
                      <ActionBtn color="#EF4444" onClick={() => setConfirmId(t.id)}>Eliminar</ActionBtn>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p style={{ color: '#4A5568', fontSize: 12, marginTop: 12 }}>
          El estado del técnico controla si su PIN puede acceder a la aplicación.
        </p>
      </div>

      {(modal === 'nuevo' || tecnicoAEditar) && (
        <TecnicoModal
          tecnico={tecnicoAEditar}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}

      {confirmId && (
        <ConfirmModal
          titulo="Eliminar técnico"
          mensaje={`¿Seguro que quieres eliminar a "${tecnicoAEliminar?.nombre}"? El PIN ${tecnicoAEliminar?.pin} dejará de funcionar.`}
          onConfirm={() => { eliminarTecnico(confirmId); setConfirmId(null) }}
          onCancel={() => setConfirmId(null)}
        />
      )}
    </AdminLayout>
  )
}
