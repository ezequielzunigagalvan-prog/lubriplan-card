import { useState } from 'react'
import AdminLayout from '../components/AdminLayout'
import ConfirmModal from '../components/ConfirmModal'
import { useAdmin } from '../context/AdminContext'

const TIPOS = ['Aceite industrial', 'Aceite hidráulico', 'Aceite engranajes', 'Grasa de litio', 'Grasa rodamientos', 'Grasa multipropósito', 'Spray lubricante', 'Otro']

const inputStyle = (hasError = false) => ({
  width: '100%', padding: '10px 13px',
  background: '#0A0C0F',
  border: `1px solid ${hasError ? '#EF4444' : '#2A3346'}`,
  borderRadius: 7, color: '#E8EDF5', fontSize: 13,
  outline: 'none', boxSizing: 'border-box',
  fontFamily: "'DM Sans', sans-serif",
})

const labelStyle = {
  display: 'block', color: '#7A8BA8', fontSize: 11,
  letterSpacing: 0.5, marginBottom: 6, textTransform: 'uppercase',
}

function LubricanteForm({ lubricante, onSave, onCancel }) {
  const isEditing = !!lubricante
  const [form, setForm] = useState({
    nombre: lubricante?.nombre || '',
    tipo: lubricante?.tipo || TIPOS[0],
    viscosidad: lubricante?.viscosidad || '',
    notas: lubricante?.notas || '',
  })
  const [errores, setErrores] = useState({})

  const set = (campo) => (e) => {
    setForm(prev => ({ ...prev, [campo]: e.target.value }))
    if (errores[campo]) setErrores(prev => ({ ...prev, [campo]: undefined }))
  }

  const handleSave = () => {
    const errs = {}
    if (!form.nombre.trim()) errs.nombre = 'El nombre es requerido'
    if (Object.keys(errs).length > 0) { setErrores(errs); return }
    onSave(form)
  }

  return (
    <div style={{
      background: '#111418', borderRadius: 12,
      border: '1px solid #2A3346', padding: '24px 20px',
      marginBottom: 24,
    }}>
      <h3 style={{ color: '#E8EDF5', fontSize: 14, fontWeight: 600, margin: '0 0 20px' }}>
        {isEditing ? 'Editar lubricante' : 'Nuevo lubricante'}
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label style={labelStyle}>Nombre del lubricante *</label>
          <input
            type="text"
            value={form.nombre}
            onChange={set('nombre')}
            placeholder="Ej: Shell Omala S2 G 220"
            style={inputStyle(!!errores.nombre)}
            autoFocus
          />
          {errores.nombre && <span style={{ color: '#EF4444', fontSize: 11, marginTop: 4, display: 'block' }}>{errores.nombre}</span>}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={labelStyle}>Tipo</label>
            <select value={form.tipo} onChange={set('tipo')} style={inputStyle()}>
              {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Viscosidad / Grado</label>
            <input
              type="text"
              value={form.viscosidad}
              onChange={set('viscosidad')}
              placeholder="Ej: ISO 220 / NLGI 2"
              style={inputStyle()}
            />
          </div>
        </div>

        <div>
          <label style={labelStyle}>Notas (opcional)</label>
          <textarea
            value={form.notas}
            onChange={set('notas')}
            placeholder="Aplicaciones, precauciones, etc."
            rows={2}
            style={{ ...inputStyle(), resize: 'vertical' }}
          />
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1, padding: '10px',
              border: '1px solid #2A3346', borderRadius: 8,
              background: 'transparent', color: '#7A8BA8',
              cursor: 'pointer', fontSize: 13,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            style={{
              flex: 2, padding: '10px',
              background: '#F4A020', color: '#0A0C0F',
              border: 'none', borderRadius: 8,
              fontSize: 13, fontWeight: 700, cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {isEditing ? 'Guardar cambios' : 'Agregar lubricante'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function GestionLubricantes() {
  const { lubricantes, crearLubricante, editarLubricante, eliminarLubricante } = useAdmin()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [confirmId, setConfirmId] = useState(null)
  const [busqueda, setBusqueda] = useState('')

  const filtrados = lubricantes.filter(l =>
    l.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    l.tipo?.toLowerCase().includes(busqueda.toLowerCase())
  )

  const lubAEliminar = lubricantes.find(l => l.id === confirmId)
  const lubEditing = lubricantes.find(l => l.id === editingId)

  const handleSaveNew = (datos) => {
    crearLubricante(datos)
    setShowForm(false)
  }

  const handleSaveEdit = (datos) => {
    editarLubricante(editingId, datos)
    setEditingId(null)
  }

  return (
    <AdminLayout titulo="Lubricantes">
      <div style={{ maxWidth: 800 }}>
        {/* Toolbar */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24, alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Buscar lubricante o tipo..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            style={{
              flex: 1, minWidth: 180, padding: '10px 14px',
              background: '#111418', border: '1px solid #2A3346',
              borderRadius: 8, color: '#E8EDF5', fontSize: 14, outline: 'none',
              fontFamily: "'DM Sans', sans-serif",
            }}
          />
          {!showForm && !editingId && (
            <button
              onClick={() => setShowForm(true)}
              style={{
                padding: '10px 20px', borderRadius: 8, border: 'none',
                background: '#F4A020', color: '#0A0C0F',
                fontSize: 14, fontWeight: 700, cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif",
                whiteSpace: 'nowrap',
              }}
            >
              + Nuevo lubricante
            </button>
          )}
        </div>

        {/* Form panel */}
        {showForm && (
          <LubricanteForm
            onSave={handleSaveNew}
            onCancel={() => setShowForm(false)}
          />
        )}
        {editingId && (
          <LubricanteForm
            lubricante={lubEditing}
            onSave={handleSaveEdit}
            onCancel={() => setEditingId(null)}
          />
        )}

        {/* Table */}
        <div style={{
          background: '#111418', borderRadius: 12,
          border: '1px solid #1E2535', overflow: 'hidden',
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #1E2535' }}>
                {['Nombre', 'Tipo', 'Viscosidad', 'Acciones'].map(h => (
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
                  <td colSpan={4} style={{ padding: 40, textAlign: 'center', color: '#4A5568', fontSize: 14 }}>
                    {lubricantes.length === 0
                      ? 'No hay lubricantes registrados. Agregá el primero.'
                      : 'No hay lubricantes que coincidan con la búsqueda'}
                  </td>
                </tr>
              )}
              {filtrados.map((l, i) => (
                <tr key={l.id} style={{
                  borderBottom: i < filtrados.length - 1 ? '1px solid #1E2535' : 'none',
                  background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)',
                }}>
                  <td style={{ padding: '13px 20px' }}>
                    <div style={{ color: '#E8EDF5', fontSize: 14, fontWeight: 500 }}>{l.nombre}</div>
                    {l.notas && (
                      <div style={{ color: '#4A5568', fontSize: 11, marginTop: 2 }}>{l.notas}</div>
                    )}
                  </td>
                  <td style={{ padding: '13px 20px', color: '#7A8BA8', fontSize: 13 }}>{l.tipo || '—'}</td>
                  <td style={{ padding: '13px 20px' }}>
                    {l.viscosidad ? (
                      <span style={{
                        padding: '2px 8px', borderRadius: 4,
                        background: 'rgba(244,160,32,0.1)', border: '1px solid rgba(244,160,32,0.2)',
                        color: '#F4A020', fontSize: 11, fontFamily: 'monospace',
                      }}>
                        {l.viscosidad}
                      </span>
                    ) : (
                      <span style={{ color: '#2A3346', fontSize: 13 }}>—</span>
                    )}
                  </td>
                  <td style={{ padding: '13px 20px' }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        onClick={() => { setEditingId(l.id); setShowForm(false) }}
                        style={{
                          padding: '5px 12px', borderRadius: 6,
                          border: '1px solid #F4A02044',
                          background: '#F4A02011', color: '#F4A020',
                          fontSize: 12, fontWeight: 600, cursor: 'pointer',
                          fontFamily: "'DM Sans', sans-serif",
                        }}
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => setConfirmId(l.id)}
                        style={{
                          padding: '5px 12px', borderRadius: 6,
                          border: '1px solid #EF444444',
                          background: '#EF444411', color: '#EF4444',
                          fontSize: 12, fontWeight: 600, cursor: 'pointer',
                          fontFamily: "'DM Sans', sans-serif",
                        }}
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: 12, color: '#4A5568', fontSize: 12 }}>
          {lubricantes.length} lubricante{lubricantes.length !== 1 ? 's' : ''} registrado{lubricantes.length !== 1 ? 's' : ''}
        </div>
      </div>

      {confirmId && (
        <ConfirmModal
          titulo="Eliminar lubricante"
          mensaje={`¿Seguro que quieres eliminar "${lubAEliminar?.nombre}"?`}
          onConfirm={() => { eliminarLubricante(confirmId); setConfirmId(null) }}
          onCancel={() => setConfirmId(null)}
        />
      )}
    </AdminLayout>
  )
}
