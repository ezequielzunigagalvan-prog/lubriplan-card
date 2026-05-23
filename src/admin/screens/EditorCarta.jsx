import { useState, useRef, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AdminLayout from '../components/AdminLayout'
import ConfirmModal from '../components/ConfirmModal'
import QRModal from '../components/QRModal'
import { useAdmin } from '../context/AdminContext'

const FRECUENCIAS = [
  { value: 'DAILY', label: 'Diaria', color: '#EF4444' },
  { value: 'WEEKLY', label: 'Semanal', color: '#F97316' },
  { value: 'MONTHLY', label: 'Mensual', color: '#EAB308' },
  { value: 'QUARTERLY', label: 'Trimestral', color: '#22C55E' },
  { value: 'ANNUAL', label: 'Anual', color: '#3B82F6' },
]

const UNIDADES = ['ml', 'g', 'oz', 'L']
const METODOS = ['Aceitera', 'Pistola de engrase', 'Manual', 'Automático']

const frecColor = (f) => FRECUENCIAS.find(x => x.value === f)?.color || '#7A8BA8'

const labelStyle = {
  display: 'block', color: '#7A8BA8', fontSize: 11,
  letterSpacing: 0.5, marginBottom: 6, textTransform: 'uppercase',
}

const inputStyle = {
  width: '100%', padding: '9px 12px',
  background: '#0A0C0F', border: '1px solid #2A3346',
  borderRadius: 7, color: '#E8EDF5', fontSize: 13,
  outline: 'none', boxSizing: 'border-box',
  fontFamily: "'DM Sans', sans-serif",
}

function PuntoForm({ punto, onSave, onDelete, onClose }) {
  const [form, setForm] = useState({
    nombre: punto?.nombre || '',
    lubricante: punto?.lubricante || '',
    cantidad: punto?.cantidad ?? '',
    unidad: punto?.unidad || 'ml',
    frecuencia: punto?.frecuencia || 'MONTHLY',
    metodo: punto?.metodo || METODOS[0],
    notas: punto?.notas || '',
  })
  const [confirmDelete, setConfirmDelete] = useState(false)

  const set = (campo) => (e) => setForm(prev => ({ ...prev, [campo]: e.target.value }))

  const handleSave = () => {
    if (!form.nombre.trim()) return
    onSave({ ...punto, ...form, cantidad: parseFloat(form.cantidad) || 0 })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 16px', borderBottom: '1px solid #1E2535', flexShrink: 0,
      }}>
        <span style={{ color: '#E8EDF5', fontWeight: 600, fontSize: 15 }}>
          Punto #{punto?.numero}
        </span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#7A8BA8', cursor: 'pointer', padding: 4, display: 'flex' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div>
          <label style={labelStyle}>Nombre del punto *</label>
          <input type="text" value={form.nombre} onChange={set('nombre')}
            placeholder="Ej: Cojinete principal" style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Lubricante</label>
          <input type="text" value={form.lubricante} onChange={set('lubricante')}
            placeholder="Ej: Shell Omala 220" style={inputStyle} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <label style={labelStyle}>Cantidad</label>
            <input type="number" value={form.cantidad} onChange={set('cantidad')}
              style={inputStyle} min="0" step="0.1" />
          </div>
          <div>
            <label style={labelStyle}>Unidad</label>
            <select value={form.unidad} onChange={set('unidad')} style={inputStyle}>
              {UNIDADES.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label style={labelStyle}>Frecuencia</label>
          <select value={form.frecuencia} onChange={set('frecuencia')} style={inputStyle}>
            {FRECUENCIAS.map(f => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Método</label>
          <select value={form.metodo} onChange={set('metodo')} style={inputStyle}>
            {METODOS.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Notas (opcional)</label>
          <textarea value={form.notas} onChange={set('notas')} rows={3}
            placeholder="Observaciones adicionales..."
            style={{ ...inputStyle, resize: 'vertical' }} />
        </div>
      </div>

      <div style={{ padding: '12px 16px', borderTop: '1px solid #1E2535', display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
        <button
          onClick={handleSave}
          disabled={!form.nombre.trim()}
          style={{
            padding: '11px', background: form.nombre.trim() ? '#F4A020' : '#2A3346',
            color: form.nombre.trim() ? '#0A0C0F' : '#4A5568',
            border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 700,
            cursor: form.nombre.trim() ? 'pointer' : 'not-allowed',
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          Guardar punto
        </button>
        <button
          onClick={() => setConfirmDelete(true)}
          style={{
            padding: '11px', background: 'rgba(239,68,68,0.08)', color: '#EF4444',
            border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, fontSize: 14,
            cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
          }}
        >
          Eliminar punto
        </button>
      </div>

      {confirmDelete && (
        <ConfirmModal
          titulo="Eliminar punto"
          mensaje={`¿Seguro que querés eliminar "${punto?.nombre || `Punto #${punto?.numero}`}"?`}
          onConfirm={() => { onDelete(punto.id); setConfirmDelete(false) }}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </div>
  )
}

export default function EditorCarta() {
  const { id } = useParams()
  const { equipos, actualizarPuntos, actualizarImagenEquipo } = useAdmin()
  const navigate = useNavigate()
  const equipo = equipos.find(e => e.id === id)

  const [puntos, setPuntos] = useState(() =>
    (equipo?.puntos || []).map((p, i) => ({ ...p, numero: i + 1 }))
  )
  const [imagenUrl, setImagenUrl] = useState(equipo?.imagenUrl || null)
  const [selectedId, setSelectedId] = useState(null)
  const [showQR, setShowQR] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const imgRef = useRef(null)
  const fileInputRef = useRef(null)

  if (!equipo) {
    return (
      <AdminLayout titulo="Editor de carta">
        <div style={{ color: '#EF4444', fontSize: 14 }}>Equipo no encontrado.</div>
      </AdminLayout>
    )
  }

  const selectedPunto = puntos.find(p => p.id === selectedId)

  const handleImageClick = useCallback((e) => {
    const rect = imgRef.current.getBoundingClientRect()
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100)
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100)
    const newId = `p-${Date.now()}`
    setPuntos(prev => {
      const nuevo = {
        id: newId, numero: prev.length + 1,
        nombre: '', lubricante: '', cantidad: 0,
        unidad: 'ml', frecuencia: 'MONTHLY', metodo: METODOS[0], notas: '',
        x, y,
      }
      return [...prev, nuevo]
    })
    setSelectedId(newId)
  }, [])

  const handleSavePunto = useCallback((updated) => {
    setPuntos(prev => {
      const nuevos = prev.map(p => p.id === updated.id ? updated : p)
      actualizarPuntos(id, nuevos)
      return nuevos
    })
    setSelectedId(null)
  }, [id, actualizarPuntos])

  const handleDeletePunto = useCallback((puntoId) => {
    setPuntos(prev => {
      const nuevos = prev
        .filter(p => p.id !== puntoId)
        .map((p, i) => ({ ...p, numero: i + 1 }))
      actualizarPuntos(id, nuevos)
      return nuevos
    })
    setSelectedId(null)
  }, [id, actualizarPuntos])

  const handleFileLoad = (file) => {
    if (!file || !file.type.startsWith('image/')) return
    const url = URL.createObjectURL(file)
    setImagenUrl(url)
    actualizarImagenEquipo(id, url)
  }

  const handleSaveAll = () => {
    actualizarPuntos(id, puntos)
    navigate('/admin/equipos')
  }

  const handleExportPDF = async () => {
    try {
      const html2canvas = (await import('html2canvas')).default
      const { jsPDF } = await import('jspdf')
      const el = document.getElementById('carta-export-area')
      const canvas = await html2canvas(el, { backgroundColor: '#111418', scale: 1.5 })
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
      const imgData = canvas.toDataURL('image/jpeg', 0.85)
      const pdfW = pdf.internal.pageSize.getWidth()
      const pdfH = (canvas.height * pdfW) / canvas.width
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfW, pdfH)
      pdf.save(`carta-${equipo.nombre.replace(/\s+/g, '-')}.pdf`)
    } catch {
      alert('Error al generar el PDF')
    }
  }

  return (
    <AdminLayout titulo={`Carta: ${equipo.nombre}`}>
      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center', flexWrap: 'wrap' }}>
        <button onClick={() => navigate('/admin/equipos')} style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '9px 16px', borderRadius: 8,
          border: '1px solid #2A3346', background: 'transparent',
          color: '#7A8BA8', cursor: 'pointer', fontSize: 13,
          fontFamily: "'DM Sans', sans-serif",
        }}>
          ← Volver a equipos
        </button>
        <div style={{ flex: 1 }} />
        <button onClick={() => setShowQR(true)} style={{
          padding: '9px 16px', borderRadius: 8,
          border: '1px solid #2A3346', background: 'transparent',
          color: '#E8EDF5', cursor: 'pointer', fontSize: 13,
          fontFamily: "'DM Sans', sans-serif",
        }}>
          Generar QR
        </button>
        <button onClick={handleExportPDF} style={{
          padding: '9px 16px', borderRadius: 8,
          border: '1px solid #2A3346', background: 'transparent',
          color: '#E8EDF5', cursor: 'pointer', fontSize: 13,
          fontFamily: "'DM Sans', sans-serif",
        }}>
          Exportar PDF
        </button>
        <button onClick={handleSaveAll} style={{
          padding: '9px 20px', borderRadius: 8, border: 'none',
          background: '#F4A020', color: '#0A0C0F',
          fontSize: 13, fontWeight: 700, cursor: 'pointer',
          fontFamily: "'DM Sans', sans-serif",
        }}>
          Guardar carta
        </button>
      </div>

      {/* Main 2-column layout */}
      <div
        id="carta-export-area"
        style={{ display: 'flex', gap: 16, height: 'calc(100vh - 215px)', minHeight: 480 }}
      >
        {/* LEFT — image panel */}
        <div style={{
          flex: '0 0 60%',
          background: '#111418', borderRadius: 12,
          border: '1px solid #1E2535',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}>
          <div style={{
            padding: '10px 16px', borderBottom: '1px solid #1E2535', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span style={{ color: '#7A8BA8', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {imagenUrl ? 'Clic en la imagen para agregar un punto' : 'Imagen del equipo'}
            </span>
            {imagenUrl && (
              <button onClick={() => fileInputRef.current?.click()} style={{
                padding: '4px 12px', borderRadius: 6, border: '1px solid #2A3346',
                background: 'transparent', color: '#7A8BA8', cursor: 'pointer', fontSize: 12,
                fontFamily: "'DM Sans', sans-serif",
              }}>
                Cambiar
              </button>
            )}
          </div>

          <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
            {!imagenUrl ? (
              <div
                onDrop={e => { e.preventDefault(); setDragOver(false); handleFileLoad(e.dataTransfer.files[0]) }}
                onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  position: 'absolute', inset: 16,
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', gap: 12,
                  cursor: 'pointer', borderRadius: 8,
                  border: `2px dashed ${dragOver ? '#F4A020' : '#2A3346'}`,
                  background: dragOver ? 'rgba(244,160,32,0.05)' : 'transparent',
                  transition: 'border-color 0.2s, background 0.2s',
                }}
              >
                <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke={dragOver ? '#F4A020' : '#4A5568'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: '#E8EDF5', fontSize: 14, fontWeight: 500, marginBottom: 4 }}>
                    Arrastrá la foto del equipo aquí
                  </div>
                  <div style={{ color: '#4A5568', fontSize: 12 }}>o hacé clic para seleccionar</div>
                </div>
              </div>
            ) : (
              <div
                ref={imgRef}
                onClick={handleImageClick}
                style={{ position: 'absolute', inset: 0, cursor: 'crosshair', userSelect: 'none' }}
              >
                <img
                  src={imagenUrl}
                  alt={equipo.nombre}
                  style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block', pointerEvents: 'none' }}
                  draggable={false}
                />
                {puntos.map(p => (
                  <button
                    key={p.id}
                    onClick={e => { e.stopPropagation(); setSelectedId(p.id === selectedId ? null : p.id) }}
                    style={{
                      position: 'absolute',
                      left: `${p.x}%`, top: `${p.y}%`,
                      transform: 'translate(-50%, -50%)',
                      width: 30, height: 30, borderRadius: '50%',
                      background: frecColor(p.frecuencia),
                      border: p.id === selectedId ? '3px solid #fff' : '2px solid rgba(0,0,0,0.5)',
                      color: '#fff', fontSize: 11, fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
                      zIndex: 10, padding: 0,
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    {p.numero}
                  </button>
                ))}
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={e => handleFileLoad(e.target.files[0])}
          />
        </div>

        {/* RIGHT — point list or form */}
        <div style={{
          flex: '0 0 40%',
          background: '#111418', borderRadius: 12,
          border: '1px solid #1E2535',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}>
          {selectedPunto ? (
            <PuntoForm
              punto={selectedPunto}
              onSave={handleSavePunto}
              onDelete={handleDeletePunto}
              onClose={() => setSelectedId(null)}
            />
          ) : (
            <>
              <div style={{
                padding: '12px 16px', borderBottom: '1px solid #1E2535', flexShrink: 0,
                color: '#7A8BA8', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5,
              }}>
                Puntos de lubricación ({puntos.length})
              </div>

              <div style={{ flex: 1, overflowY: 'auto' }}>
                {puntos.length === 0 ? (
                  <div style={{
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    height: '100%', gap: 10, padding: 28, textAlign: 'center',
                  }}>
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#2A3346" strokeWidth="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                    <div style={{ color: '#4A5568', fontSize: 13 }}>
                      {imagenUrl
                        ? 'Hacé clic en la imagen para agregar un punto'
                        : 'Primero subí una imagen del equipo'}
                    </div>
                  </div>
                ) : (
                  puntos.map((p, i) => (
                    <div
                      key={p.id}
                      onClick={() => setSelectedId(p.id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '11px 16px', cursor: 'pointer',
                        borderBottom: i < puntos.length - 1 ? '1px solid #1E2535' : 'none',
                        background: p.id === selectedId ? 'rgba(244,160,32,0.05)' : 'transparent',
                        transition: 'background 0.1s',
                      }}
                    >
                      <div style={{
                        width: 26, height: 26, borderRadius: '50%',
                        background: frecColor(p.frecuencia),
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0, fontSize: 11, fontWeight: 700, color: '#fff',
                      }}>
                        {p.numero}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          color: p.nombre ? '#E8EDF5' : '#4A5568',
                          fontSize: 13, fontWeight: 500,
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                          {p.nombre || 'Sin nombre'}
                        </div>
                        <div style={{ color: '#4A5568', fontSize: 11 }}>
                          {FRECUENCIAS.find(f => f.value === p.frecuencia)?.label}
                        </div>
                      </div>
                      <button
                        onClick={e => { e.stopPropagation(); handleDeletePunto(p.id) }}
                        style={{ background: 'none', border: 'none', color: '#4A5568', cursor: 'pointer', padding: 4, display: 'flex' }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div style={{ padding: 14, borderTop: '1px solid #1E2535', flexShrink: 0 }}>
                <button onClick={() => setShowQR(true)} style={{
                  width: '100%', padding: '10px', borderRadius: 8,
                  border: '1px solid #2A3346', background: 'transparent',
                  color: '#7A8BA8', cursor: 'pointer', fontSize: 13,
                  fontFamily: "'DM Sans', sans-serif",
                }}>
                  Generar QR
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {showQR && (
        <QRModal
          equipoId={id}
          equipoNombre={equipo.nombre}
          onClose={() => setShowQR(false)}
        />
      )}
    </AdminLayout>
  )
}
