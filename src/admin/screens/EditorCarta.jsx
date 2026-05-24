import { useState, useRef, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AdminLayout from '../components/AdminLayout'
import ConfirmModal from '../components/ConfirmModal'
import QRModal from '../components/QRModal'
import { useAdmin } from '../context/AdminContext'
import { convertToBase64 } from '../../utils/imageUtils'

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
  const [imgError, setImgError] = useState(null)
  const [selectMode, setSelectMode] = useState(false)
  const [checkedIds, setCheckedIds] = useState(new Set())
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

  const handleDeleteChecked = useCallback(() => {
    setPuntos(prev => {
      const nuevos = prev
        .filter(p => !checkedIds.has(p.id))
        .map((p, i) => ({ ...p, numero: i + 1 }))
      actualizarPuntos(id, nuevos)
      return nuevos
    })
    setCheckedIds(new Set())
    setSelectMode(false)
  }, [id, actualizarPuntos, checkedIds])

  const toggleCheck = useCallback((puntoId) => {
    setCheckedIds(prev => {
      const next = new Set(prev)
      next.has(puntoId) ? next.delete(puntoId) : next.add(puntoId)
      return next
    })
  }, [])

  const toggleSelectAll = useCallback(() => {
    setCheckedIds(prev => prev.size === puntos.length ? new Set() : new Set(puntos.map(p => p.id)))
  }, [puntos])

  const handleFileLoad = async (file) => {
    if (!file || !file.type.startsWith('image/')) return
    setImgError(null)
    try {
      const base64 = await convertToBase64(file)
      setImagenUrl(base64)
      actualizarImagenEquipo(id, base64)
    } catch (err) {
      setImgError('La imagen no debe superar 2MB. Usa una foto más pequeña.')
    }
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

        {equipo.codigo && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '7px 14px', borderRadius: 8,
            background: 'rgba(244,160,32,0.1)', border: '1px solid rgba(244,160,32,0.25)',
          }}>
            <span style={{ color: '#7A8BA8', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>Código</span>
            <span style={{ color: '#F4A020', fontFamily: 'monospace', fontSize: 15, fontWeight: 700, letterSpacing: 2 }}>
              {equipo.codigo}
            </span>
          </div>
        )}

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
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
          }}>
            <span style={{ color: '#7A8BA8', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {imagenUrl ? 'Clic en la imagen para agregar un punto' : 'Imagen del equipo'}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {imgError && imagenUrl && (
                <span style={{ color: '#EF4444', fontSize: 11 }}>{imgError}</span>
              )}
              {imagenUrl && (
                <button onClick={() => { setImgError(null); fileInputRef.current?.click() }} style={{
                  padding: '4px 12px', borderRadius: 6, border: '1px solid #2A3346',
                  background: 'transparent', color: '#7A8BA8', cursor: 'pointer', fontSize: 12,
                  fontFamily: "'DM Sans', sans-serif",
                }}>
                  Cambiar
                </button>
              )}
            </div>
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
                  border: `2px dashed ${imgError ? '#EF4444' : dragOver ? '#F4A020' : '#2A3346'}`,
                  background: dragOver ? 'rgba(244,160,32,0.05)' : 'transparent',
                  transition: 'border-color 0.2s, background 0.2s',
                }}
              >
                <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke={imgError ? '#EF4444' : dragOver ? '#F4A020' : '#4A5568'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                <div style={{ textAlign: 'center' }}>
                  {imgError ? (
                    <div style={{ color: '#EF4444', fontSize: 13, fontWeight: 600, maxWidth: 220 }}>{imgError}</div>
                  ) : (
                    <>
                      <div style={{ color: '#E8EDF5', fontSize: 14, fontWeight: 500, marginBottom: 4 }}>
                        Arrastrá la foto del equipo aquí
                      </div>
                      <div style={{ color: '#4A5568', fontSize: 12 }}>o hacé clic para seleccionar (máx. 2MB)</div>
                    </>
                  )}
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
          {selectedPunto && !selectMode ? (
            <PuntoForm
              punto={selectedPunto}
              onSave={handleSavePunto}
              onDelete={handleDeletePunto}
              onClose={() => setSelectedId(null)}
            />
          ) : (
            <>
              {/* Panel header */}
              <div style={{
                padding: '10px 12px 10px 16px', borderBottom: '1px solid #1E2535', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                {selectMode ? (
                  <>
                    <button
                      onClick={toggleSelectAll}
                      style={{
                        background: 'none', border: 'none', color: '#7A8BA8',
                        fontSize: 12, cursor: 'pointer', padding: 0,
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      {checkedIds.size === puntos.length ? 'Deseleccionar todo' : 'Seleccionar todo'}
                    </button>
                    <button
                      onClick={() => { setSelectMode(false); setCheckedIds(new Set()) }}
                      style={{
                        background: 'none', border: 'none', color: '#7A8BA8',
                        fontSize: 12, cursor: 'pointer', padding: '4px 8px',
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      Cancelar
                    </button>
                  </>
                ) : (
                  <>
                    <span style={{ color: '#7A8BA8', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Puntos ({puntos.length})
                    </span>
                    {puntos.length > 0 && (
                      <button
                        onClick={() => { setSelectMode(true); setSelectedId(null) }}
                        style={{
                          background: 'none', border: '1px solid #2A3346',
                          borderRadius: 6, color: '#7A8BA8',
                          fontSize: 11, cursor: 'pointer', padding: '3px 10px',
                          fontFamily: "'DM Sans', sans-serif",
                        }}
                      >
                        Seleccionar
                      </button>
                    )}
                  </>
                )}
              </div>

              {/* Points list */}
              <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
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
                  puntos.map((p, i) => {
                    const isChecked = checkedIds.has(p.id)
                    return (
                      <div
                        key={p.id}
                        onClick={() => selectMode ? toggleCheck(p.id) : setSelectedId(p.id)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 12,
                          padding: '11px 16px', cursor: 'pointer',
                          borderBottom: i < puntos.length - 1 ? '1px solid #1E2535' : 'none',
                          background: isChecked
                            ? 'rgba(239,68,68,0.07)'
                            : p.id === selectedId && !selectMode
                              ? 'rgba(244,160,32,0.05)'
                              : 'transparent',
                          transition: 'background 0.1s',
                        }}
                      >
                        {selectMode ? (
                          <div style={{
                            width: 20, height: 20, borderRadius: 5, flexShrink: 0,
                            border: `2px solid ${isChecked ? '#EF4444' : '#2A3346'}`,
                            background: isChecked ? '#EF4444' : 'transparent',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all 0.1s',
                          }}>
                            {isChecked && (
                              <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                                <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            )}
                          </div>
                        ) : (
                          <div style={{
                            width: 26, height: 26, borderRadius: '50%',
                            background: frecColor(p.frecuencia),
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0, fontSize: 11, fontWeight: 700, color: '#fff',
                          }}>
                            {p.numero}
                          </div>
                        )}
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
                        {!selectMode && (
                          <button
                            onClick={e => { e.stopPropagation(); handleDeletePunto(p.id) }}
                            style={{ background: 'none', border: 'none', color: '#4A5568', cursor: 'pointer', padding: 4, display: 'flex' }}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                          </button>
                        )}
                      </div>
                    )
                  })
                )}
              </div>

              {/* Footer */}
              <div style={{ padding: 14, borderTop: '1px solid #1E2535', flexShrink: 0 }}>
                {selectMode ? (
                  <button
                    onClick={handleDeleteChecked}
                    disabled={checkedIds.size === 0}
                    style={{
                      width: '100%', padding: '10px', borderRadius: 8, border: 'none',
                      background: checkedIds.size > 0 ? '#EF4444' : '#1E2535',
                      color: checkedIds.size > 0 ? '#fff' : '#4A5568',
                      cursor: checkedIds.size > 0 ? 'pointer' : 'not-allowed',
                      fontSize: 13, fontWeight: 700,
                      fontFamily: "'DM Sans', sans-serif",
                      transition: 'background 0.15s',
                    }}
                  >
                    {checkedIds.size > 0
                      ? `Eliminar ${checkedIds.size} punto${checkedIds.size !== 1 ? 's' : ''}`
                      : 'Seleccioná puntos para eliminar'}
                  </button>
                ) : (
                  <button onClick={() => setShowQR(true)} style={{
                    width: '100%', padding: '10px', borderRadius: 8,
                    border: '1px solid #2A3346', background: 'transparent',
                    color: '#7A8BA8', cursor: 'pointer', fontSize: 13,
                    fontFamily: "'DM Sans', sans-serif",
                  }}>
                    Generar QR
                  </button>
                )}
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
