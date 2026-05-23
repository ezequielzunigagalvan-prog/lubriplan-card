import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AdminLayout from '../components/AdminLayout'
import { useAdmin } from '../context/AdminContext'

function Field({ label, error, children }) {
  return (
    <div>
      <label style={{
        display: 'block', color: '#7A8BA8', fontSize: 12,
        letterSpacing: 0.5, marginBottom: 8, textTransform: 'uppercase',
      }}>
        {label}
      </label>
      {children}
      {error && <span style={{ color: '#EF4444', fontSize: 12, marginTop: 5, display: 'block' }}>{error}</span>}
    </div>
  )
}

export default function FormEquipo() {
  const { id } = useParams()
  const isEditing = !!id
  const { equipos, crearEquipo, editarEquipo } = useAdmin()
  const navigate = useNavigate()

  const equipo = isEditing ? equipos.find(e => e.id === id) : null

  const [form, setForm] = useState({
    codigo: equipo?.codigo || '',
    nombre: equipo?.nombre || '',
    area: equipo?.area || '',
    descripcion: equipo?.descripcion || '',
    activo: equipo?.activo !== false,
  })
  const [errores, setErrores] = useState({})

  const set = (campo) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm(prev => ({ ...prev, [campo]: val }))
    if (errores[campo]) setErrores(prev => ({ ...prev, [campo]: undefined }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = {}
    if (!form.codigo.trim()) errs.codigo = 'El código es requerido'
    if (!form.nombre.trim()) errs.nombre = 'El nombre es requerido'
    if (!form.area.trim()) errs.area = 'El área es requerida'
    if (Object.keys(errs).length > 0) { setErrores(errs); return }

    if (isEditing) {
      editarEquipo(id, form)
    } else {
      crearEquipo(form)
    }
    navigate('/admin/equipos')
  }

  const inputStyle = (hasError = false) => ({
    width: '100%', padding: '11px 14px',
    background: '#0A0C0F',
    border: `1px solid ${hasError ? '#EF4444' : '#2A3346'}`,
    borderRadius: 8, color: '#E8EDF5', fontSize: 14,
    outline: 'none', boxSizing: 'border-box',
    fontFamily: "'DM Sans', sans-serif",
  })

  return (
    <AdminLayout titulo={isEditing ? 'Editar equipo' : 'Nuevo equipo'}>
      <div style={{ maxWidth: 560 }}>
        <div style={{
          background: '#111418', borderRadius: 12,
          border: '1px solid #1E2535', padding: '32px 28px',
        }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <Field label="Código del equipo *" error={errores.codigo}>
              <input
                type="text"
                value={form.codigo}
                onChange={set('codigo')}
                placeholder="Ej: CMP-001"
                style={{
                  ...inputStyle(!!errores.codigo),
                  fontFamily: 'monospace',
                  fontSize: 15,
                  letterSpacing: 2,
                  textTransform: 'uppercase',
                }}
                onInput={e => { e.target.value = e.target.value.toUpperCase() }}
              />
            </Field>

            <Field label="Nombre del equipo *" error={errores.nombre}>
              <input
                type="text"
                value={form.nombre}
                onChange={set('nombre')}
                placeholder="Ej: Compresor KAESER SK-19"
                style={inputStyle(!!errores.nombre)}
              />
            </Field>

            <Field label="Área / Ubicación *" error={errores.area}>
              <input
                type="text"
                value={form.area}
                onChange={set('area')}
                placeholder="Ej: Sala de compresores"
                style={inputStyle(!!errores.area)}
              />
            </Field>

            <Field label="Descripción (opcional)">
              <textarea
                value={form.descripcion}
                onChange={set('descripcion')}
                placeholder="Descripción general del equipo..."
                rows={3}
                style={{ ...inputStyle(), resize: 'vertical' }}
              />
            </Field>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <input
                type="checkbox"
                id="activo"
                checked={form.activo}
                onChange={set('activo')}
                style={{ width: 16, height: 16, accentColor: '#F4A020', cursor: 'pointer' }}
              />
              <label htmlFor="activo" style={{ color: '#E8EDF5', fontSize: 14, cursor: 'pointer' }}>
                Equipo activo
              </label>
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <button
                type="button"
                onClick={() => navigate('/admin/equipos')}
                style={{
                  flex: 1, padding: '12px',
                  border: '1px solid #2A3346', borderRadius: 8,
                  background: 'transparent', color: '#7A8BA8',
                  cursor: 'pointer', fontSize: 14,
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                style={{
                  flex: 2, padding: '12px',
                  background: '#F4A020', color: '#0A0C0F',
                  border: 'none', borderRadius: 8,
                  fontSize: 14, fontWeight: 700, cursor: 'pointer',
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {isEditing ? 'Guardar cambios' : 'Crear equipo'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  )
}
