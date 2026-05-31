import { useState, useRef, useCallback, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AdminLayout from '../components/AdminLayout'
import ConfirmModal from '../components/ConfirmModal'
import QRModal from '../components/QRModal'
import { useAdmin } from '../context/AdminContext'
import { uploadImagen, deleteImagen } from '../../api/cardApi'
import { METODOS as METODOS_DATA } from '../../data/equipos'

const LUBRICANTES_DATALIST_ID = 'lubricantes-list'

const FRECUENCIAS = [
  { value: 'DAILY',      label: 'Diaria',     color: '#EF4444' },
  { value: 'WEEKLY',     label: 'Semanal',    color: '#F97316' },
  { value: 'BIWEEKLY',   label: 'Quincenal',  color: '#FB923C' },
  { value: 'MONTHLY',    label: 'Mensual',    color: '#EAB308' },
  { value: 'BIMONTHLY',  label: 'Bimestral',  color: '#A3E635' },
  { value: 'QUARTERLY',  label: 'Trimestral', color: '#22C55E' },
  { value: 'SEMIANNUAL', label: 'Semestral',  color: '#06B6D4' },
  { value: 'ANNUAL',     label: 'Anual',      color: '#3B82F6' },
]

const UNIDADES = ['ml', 'g', 'oz', 'L']
const METODOS_OPTIONS = Object.entries(METODOS_DATA).map(([key, val]) => ({ key, label: val.label }))
const frecColor = (f) => FRECUENCIAS.find(x => x.value === f)?.color || '#8892b0'

const labelStyle = {
  display: 'block', color: '#8892b0', fontSize: 11,
  letterSpacing: 0.5, marginBottom: 6, textTransform: 'uppercase',
}
const inputStyle = {
  width: '100%', padding: '9px 12px',
  background: '#0c0a1e', border: '1px solid #2a2850',
  borderRadius: 7, color: '#e8eeff', fontSize: 13,
  outline: 'none', boxSizing: 'border-box',
  fontFamily: "'DM Sans', sans-serif",
}

// ─── PuntoForm ───────────────────────────────────────────────────────────────
function PuntoForm({ punto, onSave, onDelete, onClose, lubricantes }) {
  const [form, setForm] = useState({
    nombre:    punto?.nombre    || '',
    lubricante:punto?.lubricante|| '',
    cantidad:  punto?.cantidad  ?? '',
    unidad:    punto?.unidad    || 'ml',
    frecuencia:punto?.frecuencia|| 'MONTHLY',
    metodo:    punto?.metodo    || METODOS_OPTIONS[0].key,
    notas:     punto?.notas     || '',
  })
  const [confirmDelete, setConfirmDelete] = useState(false)
  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }))
  const handleSave = () => {
    if (!form.nombre.trim()) return
    onSave({ ...punto, ...form, cantidad: parseFloat(form.cantidad) || 0 })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 16px', borderBottom: '1px solid #2a2850', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 24, height: 24, borderRadius: '50%',
            background: frecColor(form.frecuencia),
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 700, color: '#fff',
          }}>
            {punto?.numero}
          </div>
          <span style={{ color: '#e8eeff', fontWeight: 600, fontSize: 15 }}>
            {form.nombre || `Punto #${punto?.numero}`}
          </span>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#8892b0', cursor: 'pointer', padding: 4, display: 'flex' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div>
          <label style={labelStyle}>Nombre del punto *</label>
          <input autoFocus type="text" value={form.nombre} onChange={set('nombre')}
            placeholder="Ej: Cojinete principal" style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Lubricante</label>
          <input type="text" list={LUBRICANTES_DATALIST_ID} value={form.lubricante}
            onChange={set('lubricante')} placeholder="Ej: Shell Omala 220" style={inputStyle} />
          <datalist id={LUBRICANTES_DATALIST_ID}>
            {(lubricantes || []).map(l => <option key={l.id} value={l.nombre} />)}
          </datalist>
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
          {/* Color preview */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: frecColor(form.frecuencia) }} />
            <span style={{ fontSize: 11, color: '#8892b0' }}>
              {FRECUENCIAS.find(f => f.value === form.frecuencia)?.label}
            </span>
          </div>
        </div>
        <div>
          <label style={labelStyle}>Método</label>
          <select value={form.metodo} onChange={set('metodo')} style={inputStyle}>
            {METODOS_OPTIONS.map(({ key, label }) => <option key={key} value={key}>{label}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Notas técnicas</label>
          <textarea value={form.notas} onChange={set('notas')} rows={3}
            placeholder="Verificar temperatura, precauciones..."
            style={{ ...inputStyle, resize: 'vertical' }} />
        </div>
      </div>

      <div style={{ padding: '12px 16px', borderTop: '1px solid #2a2850', display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
        <button
          onClick={handleSave}
          disabled={!form.nombre.trim()}
          style={{
            padding: '11px',
            background: form.nombre.trim() ? '#6366f1' : '#2a2850',
            color: form.nombre.trim() ? '#fff' : '#4a5070',
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

// ─── BulkFrecuenciaPanel ──────────────────────────────────────────────────────
function BulkFrecuenciaPanel({ count, onApply, onCancel }) {
  const [freq, setFreq] = useState('MONTHLY')
  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ color: '#e8eeff', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
        Cambiar frecuencia de {count} punto{count !== 1 ? 's' : ''}
      </div>
      <select value={freq} onChange={e => setFreq(e.target.value)} style={inputStyle}>
        {FRECUENCIAS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
      </select>
      <button onClick={() => onApply(freq)} style={{
        padding: '10px', background: '#6366f1', color: '#fff',
        border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700,
        cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
      }}>
        Aplicar a seleccionados
      </button>
      <button onClick={onCancel} style={{
        padding: '10px', background: 'transparent', color: '#8892b0',
        border: '1px solid #2a2850', borderRadius: 8, fontSize: 13,
        cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
      }}>
        Cancelar
      </button>
    </div>
  )
}

// ─── Herramientas ─────────────────────────────────────────────────────────────
const HERRAMIENTAS = [
  {
    id: 'punto', label: 'Punto', title: 'Colocar/mover punto de lubricación',
    icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="8" cy="8" r="2" fill="currentColor" />
    </svg>,
  },
  {
    id: 'flecha', label: 'Flecha', title: 'Dibujar flecha indicadora',
    icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M3 13L13 3M13 3H8M13 3V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>,
  },
  {
    id: 'linea', label: 'Línea', title: 'Dibujar línea indicadora',
    icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M3 13L13 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2 2" />
    </svg>,
  },
]

// ─── EditorCarta ──────────────────────────────────────────────────────────────
export default function EditorCarta() {
  const { id } = useParams()
  const { equipos, actualizarPuntos, actualizarImagenesEquipo, lubricantes } = useAdmin()
  const navigate = useNavigate()
  const equipo = equipos.find(e => e.id === id)

  const [puntos, setPuntos]         = useState(() => (equipo?.puntos || []).map((p, i) => ({ ...p, numero: i + 1 })))
  const [imagenes, setImagenes]     = useState(() => equipo?.imagenes || [])
  const [imgActivaIdx, setImgActivaIdx] = useState(0)
  const [selectedId, setSelectedId] = useState(null)
  const [herramienta, setHerramienta] = useState('punto')
  const [drawStart, setDrawStart]   = useState(null)
  const [previewEnd, setPreviewEnd] = useState(null)
  const [selectMode, setSelectMode] = useState(false)
  const [checkedIds, setCheckedIds] = useState(new Set())
  const [bulkFrecuencia, setBulkFrecuencia] = useState(false)
  const [showQR, setShowQR]         = useState(false)
  const [dragOver, setDragOver]     = useState(false)
  const [imgError, setImgError]     = useState(null)
  const [imgNaturalSize, setImgNaturalSize] = useState(null)
  const [editorImgRect, setEditorImgRect] = useState(null)
  const [hoveredId, setHoveredId]   = useState(null)

  // Drag-to-move state
  const [draggingId, setDraggingId] = useState(null)
  const dragMovedRef  = useRef(false)

  const containerRef = useRef(null)  // outer click-handler div
  const fileInputRef = useRef(null)

  const imgActiva    = imagenes[imgActivaIdx] || null
  const selectedPunto = puntos.find(p => p.id === selectedId)

  // ── Compute editorImgRect: pixel rect of image rendered by objectFit:contain ─
  const computeRect = useCallback(() => {
    const container = containerRef.current
    if (!container || !imgNaturalSize) { setEditorImgRect(null); return }
    const { width: cW, height: cH } = container.getBoundingClientRect()
    if (!cW || !cH) return
    const { w: iW, h: iH } = imgNaturalSize
    const iA = iW / iH, cA = cW / cH
    let rW, rH, oX, oY
    if (iA > cA) { rW = cW; rH = cW / iA; oX = 0; oY = (cH - rH) / 2 }
    else         { rH = cH; rW = cH * iA; oX = (cW - rW) / 2; oY = 0 }
    setEditorImgRect({ left: oX, top: oY, width: rW, height: rH })
  }, [imgNaturalSize])

  // Recompute when imgNaturalSize changes or container resizes
  useEffect(() => { computeRect() }, [computeRect])
  useEffect(() => {
    const el = containerRef.current
    if (!el || !imgNaturalSize) return
    const ro = new ResizeObserver(computeRect)
    ro.observe(el)
    return () => ro.disconnect()
  }, [imgNaturalSize, computeRect])

  // ── Detect natural size (works for cached base64 images too) ─────────────
  useEffect(() => {
    setImgNaturalSize(null)
    setEditorImgRect(null)
    if (!imgActiva) return
    let cancelled = false
    let tries = 0
    let rafId
    const check = () => {
      if (cancelled) return
      const img = containerRef.current?.querySelector('img')
      if (img?.naturalWidth > 0 && img?.naturalHeight > 0) {
        setImgNaturalSize({ w: img.naturalWidth, h: img.naturalHeight })
        return
      }
      if (tries++ < 120) rafId = requestAnimationFrame(check)
    }
    rafId = requestAnimationFrame(check)
    return () => { cancelled = true; cancelAnimationFrame(rafId) }
  }, [imgActivaIdx, imgActiva?.url])

  const handleEditorImgLoad = useCallback((e) => {
    if (e.target.naturalWidth > 0) {
      setImgNaturalSize({ w: e.target.naturalWidth, h: e.target.naturalHeight })
    }
  }, [])

  // ── Escape cancels drawing ────────────────────────────────────────────────
  useEffect(() => {
    const h = (e) => {
      if (e.key === 'Escape') { setDrawStart(null); setPreviewEnd(null) }
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [])

  if (!equipo) {
    return (
      <AdminLayout titulo="Editor de carta">
        <div style={{ color: '#EF4444', fontSize: 14 }}>Equipo no encontrado.</div>
      </AdminLayout>
    )
  }

  // ── getCoords: maps viewport click → percentage within image area ─────────
  // Uses editorImgRect (pixel rect of rendered image inside container) + the
  // container's viewport position. Always accurate; no CSS side-effects.
  const getCoords = useCallback((e) => {
    if (!editorImgRect || !containerRef.current) return null
    const cRect = containerRef.current.getBoundingClientRect()
    const relX = Math.max(0, Math.min(editorImgRect.width,  e.clientX - cRect.left - editorImgRect.left))
    const relY = Math.max(0, Math.min(editorImgRect.height, e.clientY - cRect.top  - editorImgRect.top))
    return {
      x: Math.round((relX / editorImgRect.width)  * 100),
      y: Math.round((relY / editorImgRect.height) * 100),
    }
  }, [editorImgRect])

  // ── Image handlers ────────────────────────────────────────────────────────
  const handleFileLoad = async (file, replaceIdx = null) => {
    if (!file || !file.type.startsWith('image/')) return
    setImgError(null)
    try {
      // Sube al servidor — devuelve { id, url, flechas: [] }
      const uploaded = await uploadImagen(id, file)

      setImagenes(prev => {
        let next
        if (replaceIdx !== null) {
          // Si reemplaza, elimina la imagen anterior del servidor
          if (prev[replaceIdx]?.id) {
            deleteImagen(id, prev[replaceIdx].id).catch(console.error)
          }
          next = prev.map((img, i) => i === replaceIdx ? uploaded : img)
        } else {
          next = [...prev, uploaded]
          setTimeout(() => setImgActivaIdx(next.length - 1), 0)
        }
        actualizarImagenesEquipo(id, next)
        return next
      })
    } catch (err) {
      setImgError(err.message || 'Error subiendo imagen.')
      console.error('[handleFileLoad]', err)
    }
  }

  const handleDeleteImage = useCallback((idx) => {
    setImagenes(prev => {
      const deleted = prev[idx]
      if (deleted?.id) {
        deleteImagen(id, deleted.id).catch(console.error)
      }
      const next = prev.filter((_, i) => i !== idx)
      actualizarImagenesEquipo(id, next)
      if (imgActivaIdx >= next.length) setImgActivaIdx(Math.max(0, next.length - 1))
      if (deleted?.id) setPuntos(pts => pts.map(p => p.imagenId === deleted.id ? { ...p, imagenId: null } : p))
      return next
    })
  }, [id, actualizarImagenesEquipo, imgActivaIdx])

  // ── Canvas: add point / draw arrow ───────────────────────────────────────
  const handleCanvasClick = useCallback((e) => {
    if (!imgActiva) return
    if (draggingId || dragMovedRef.current) { dragMovedRef.current = false; return }

    const coords = getCoords(e)
    if (!coords) return

    if (herramienta === 'punto') {
      const newId = `p-${Date.now()}`
      setPuntos(prev => {
        const nuevo = {
          id: newId, numero: prev.length + 1,
          nombre: '', lubricante: '', cantidad: 0,
          unidad: 'ml', frecuencia: 'MONTHLY', metodo: METODOS_OPTIONS[0].key, notas: '',
          x: coords.x, y: coords.y, imagenId: imgActiva.id,
        }
        return [...prev, nuevo]
      })
      setSelectedId(newId)
      return
    }

    // Arrow / line drawing
    if (!drawStart) {
      setDrawStart(coords)
    } else {
      const newFlecha = { id: `f-${Date.now()}`, x1: drawStart.x, y1: drawStart.y, x2: coords.x, y2: coords.y, tipo: herramienta }
      setImagenes(prev => {
        const next = prev.map((img, i) =>
          i === imgActivaIdx ? { ...img, flechas: [...(img.flechas || []), newFlecha] } : img
        )
        actualizarImagenesEquipo(id, next)
        return next
      })
      setDrawStart(null)
      setPreviewEnd(null)
    }
  }, [herramienta, drawStart, imgActiva, imgActivaIdx, draggingId, editorImgRect, getCoords, id, actualizarImagenesEquipo])

  const handleCanvasMouseMove = useCallback((e) => {
    // Update arrow preview
    if ((herramienta === 'flecha' || herramienta === 'linea') && drawStart) {
      setPreviewEnd(getCoords(e))
    }

    // Drag point
    if (draggingId && herramienta === 'punto') {
      const coords = getCoords(e)
      if (!coords) return
      dragMovedRef.current = true
      setPuntos(prev => prev.map(p => p.id === draggingId ? { ...p, x: coords.x, y: coords.y } : p))
    }
  }, [herramienta, drawStart, draggingId, getCoords])

  const handleCanvasMouseUp = useCallback(() => {
    if (draggingId) {
      if (dragMovedRef.current) {
        // Persist moved position
        setPuntos(prev => {
          actualizarPuntos(id, prev)
          return prev
        })
      }
      setDraggingId(null)
    }
  }, [draggingId, id, actualizarPuntos])

  // Point drag start — called from the point marker button
  const handlePointMouseDown = useCallback((e, puntoId) => {
    if (herramienta !== 'punto' || selectMode) return
    e.stopPropagation()
    setDraggingId(puntoId)
    dragMovedRef.current = false
  }, [herramienta, selectMode])

  // Point click (no drag) — fires when mouseup without movement
  const handlePointClick = useCallback((e, puntoId) => {
    e.stopPropagation()
    if (dragMovedRef.current) return  // was a drag, not a click
    if (selectMode) { toggleCheck(puntoId); return }
    setSelectedId(prev => prev === puntoId ? null : puntoId)
  }, [selectMode])

  const handleDeleteFlecha = useCallback((flechaId) => {
    setImagenes(prev => {
      const next = prev.map((img, i) =>
        i === imgActivaIdx ? { ...img, flechas: (img.flechas || []).filter(f => f.id !== flechaId) } : img
      )
      actualizarImagenesEquipo(id, next)
      return next
    })
  }, [imgActivaIdx, id, actualizarImagenesEquipo])

  // ── Punto CRUD ────────────────────────────────────────────────────────────
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
      const nuevos = prev.filter(p => p.id !== puntoId).map((p, i) => ({ ...p, numero: i + 1 }))
      actualizarPuntos(id, nuevos)
      return nuevos
    })
    setSelectedId(null)
  }, [id, actualizarPuntos])

  const handleDeleteChecked = useCallback(() => {
    setPuntos(prev => {
      const nuevos = prev.filter(p => !checkedIds.has(p.id)).map((p, i) => ({ ...p, numero: i + 1 }))
      actualizarPuntos(id, nuevos)
      return nuevos
    })
    setCheckedIds(new Set()); setSelectMode(false)
  }, [id, actualizarPuntos, checkedIds])

  const handleBulkFrecuencia = useCallback((freq) => {
    setPuntos(prev => {
      const nuevos = prev.map(p => checkedIds.has(p.id) ? { ...p, frecuencia: freq } : p)
      actualizarPuntos(id, nuevos)
      return nuevos
    })
    setCheckedIds(new Set()); setSelectMode(false); setBulkFrecuencia(false)
  }, [id, actualizarPuntos, checkedIds])

  const toggleCheck = useCallback((puntoId) => {
    setCheckedIds(prev => { const n = new Set(prev); n.has(puntoId) ? n.delete(puntoId) : n.add(puntoId); return n })
  }, [])

  const toggleSelectAll = useCallback(() => {
    setCheckedIds(prev => prev.size === puntos.length ? new Set() : new Set(puntos.map(p => p.id)))
  }, [puntos])

  const handleSaveAll = () => {
    actualizarPuntos(id, puntos)
    actualizarImagenesEquipo(id, imagenes)
    navigate('/admin/equipos')
  }

  const handleExportPDF = async () => {
    try {
      const html2canvas = (await import('html2canvas')).default
      const { jsPDF } = await import('jspdf')
      const el = document.getElementById('carta-export-area')
      const canvas = await html2canvas(el, { backgroundColor: '#13112a', scale: 1.5 })
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
      const imgData = canvas.toDataURL('image/jpeg', 0.85)
      const pdfW = pdf.internal.pageSize.getWidth()
      const pdfH = (canvas.height * pdfW) / canvas.width
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfW, pdfH)
      pdf.save(`carta-${equipo.nombre.replace(/\s+/g, '-')}.pdf`)
    } catch { alert('Error al generar el PDF') }
  }

  const puntosDeLaImagen = puntos.filter(p =>
    imgActiva && (p.imagenId === imgActiva.id || (!p.imagenId && imgActivaIdx === 0))
  )

  const cursorCanvas = draggingId
    ? 'grabbing'
    : herramienta === 'punto'
      ? (editorImgRect ? 'crosshair' : 'default')
      : drawStart ? 'crosshair' : 'cell'

  // ── RENDER ────────────────────────────────────────────────────────────────
  return (
    <AdminLayout titulo={`Carta: ${equipo.nombre}`}>
      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <button onClick={() => navigate('/admin/equipos')} style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '9px 16px', borderRadius: 8,
          border: '1px solid #2a2850', background: 'transparent', color: '#8892b0',
          cursor: 'pointer', fontSize: 13, fontFamily: "'DM Sans', sans-serif",
        }}>
          ← Volver a equipos
        </button>

        {equipo.codigo && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '7px 14px', borderRadius: 8,
            background: 'rgba(129,140,248,0.1)', border: '1px solid rgba(129,140,248,0.25)',
          }}>
            <span style={{ color: '#8892b0', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>Código</span>
            <span style={{ color: '#818cf8', fontFamily: 'monospace', fontSize: 15, fontWeight: 700, letterSpacing: 2 }}>
              {equipo.codigo}
            </span>
          </div>
        )}

        <div style={{ flex: 1 }} />
        <button onClick={() => setShowQR(true)} style={{
          padding: '9px 16px', borderRadius: 8, border: '1px solid #2a2850',
          background: 'transparent', color: '#e8eeff', cursor: 'pointer', fontSize: 13,
          fontFamily: "'DM Sans', sans-serif",
        }}>
          Generar QR
        </button>
        <button onClick={handleExportPDF} style={{
          padding: '9px 16px', borderRadius: 8, border: '1px solid #2a2850',
          background: 'transparent', color: '#e8eeff', cursor: 'pointer', fontSize: 13,
          fontFamily: "'DM Sans', sans-serif",
        }}>
          Exportar PDF
        </button>
        <button onClick={handleSaveAll} style={{
          padding: '9px 20px', borderRadius: 8, border: 'none',
          background: '#6366f1', color: '#fff', fontSize: 13, fontWeight: 700,
          cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
        }}>
          Guardar carta
        </button>
      </div>

      {/* 2-column layout */}
      <div id="carta-export-area" style={{ display: 'flex', gap: 14, height: 'calc(100vh - 205px)', minHeight: 480 }}>

        {/* ── LEFT: Image panel ── */}
        <div style={{
          flex: '0 0 60%', background: '#13112a', borderRadius: 12,
          border: '1px solid #2a2850', display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}>
          {/* Image tabs */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px',
            borderBottom: '1px solid #2a2850', flexShrink: 0, overflowX: 'auto', scrollbarWidth: 'none',
          }}>
            {imagenes.map((img, i) => (
              <div key={img.id} style={{ position: 'relative', flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                <button
                  onClick={() => { setImgActivaIdx(i); setDrawStart(null); setPreviewEnd(null) }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', borderRadius: 7,
                    border: `1px solid ${i === imgActivaIdx ? '#6366f1' : '#2a2850'}`,
                    background: i === imgActivaIdx ? 'rgba(99,102,241,0.12)' : 'transparent',
                    color: i === imgActivaIdx ? '#818cf8' : '#8892b0',
                    cursor: 'pointer', fontSize: 12, fontWeight: i === imgActivaIdx ? 700 : 400,
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                    <rect x="1.5" y="1.5" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.3" />
                    <circle cx="4.5" cy="4.5" r="1" fill="currentColor" />
                    <path d="M1.5 9l3-3 2.5 2.5 2-2 2 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Foto {i + 1}
                </button>
                <button
                  onClick={() => handleDeleteImage(i)}
                  style={{
                    width: 16, height: 16, borderRadius: '50%', background: '#EF444499', border: 'none',
                    color: '#fff', fontSize: 10, cursor: 'pointer', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', padding: 0, marginLeft: 2, flexShrink: 0,
                  }}
                >×</button>
              </div>
            ))}

            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                flexShrink: 0, display: 'flex', alignItems: 'center', gap: 5,
                padding: '5px 10px', borderRadius: 7,
                border: '1px dashed #2a2850', background: 'transparent',
                color: '#4a5070', cursor: 'pointer', fontSize: 12,
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path d="M6.5 2v9M2 6.5h9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              Agregar foto
            </button>

            {imgError && <span style={{ color: '#EF4444', fontSize: 11, flexShrink: 0 }}>{imgError}</span>}
          </div>

          {/* Toolbar */}
          {imgActiva && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px',
              borderBottom: '1px solid #2a2850', flexShrink: 0,
            }}>
              <span style={{ color: '#4a5070', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, marginRight: 4 }}>
                Herramienta:
              </span>
              {HERRAMIENTAS.map(h => (
                <button
                  key={h.id}
                  title={h.title}
                  onClick={() => { setHerramienta(h.id); setDrawStart(null); setPreviewEnd(null); setSelectedId(null) }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 6,
                    border: `1px solid ${herramienta === h.id ? '#6366f1' : '#2a2850'}`,
                    background: herramienta === h.id ? 'rgba(99,102,241,0.12)' : 'transparent',
                    color: herramienta === h.id ? '#818cf8' : '#8892b0',
                    cursor: 'pointer', fontSize: 12, fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  {h.icon} {h.label}
                </button>
              ))}

              {(herramienta === 'flecha' || herramienta === 'linea') && (
                <span style={{ color: '#4a5070', fontSize: 11, marginLeft: 6 }}>
                  {drawStart ? '→ clic para fijar el extremo' : 'Clic para fijar el inicio'}
                </span>
              )}

              {herramienta === 'punto' && imgNaturalSize && (
                <span style={{ color: '#4a5070', fontSize: 11, marginLeft: 6 }}>
                  Clic para añadir · arrastrá para mover
                </span>
              )}

              {imgActiva && (imgActiva.flechas || []).length > 0 && (
                <button
                  onClick={() => {
                    setImagenes(prev => {
                      const next = prev.map((img, i) => i === imgActivaIdx ? { ...img, flechas: [] } : img)
                      actualizarImagenesEquipo(id, next)
                      return next
                    })
                  }}
                  style={{
                    marginLeft: 'auto', padding: '4px 8px', borderRadius: 5,
                    border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)',
                    color: '#EF4444', cursor: 'pointer', fontSize: 11,
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  Limpiar líneas
                </button>
              )}
            </div>
          )}

          {/* Canvas */}
          <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
            {!imgActiva ? (
              /* Drop zone */
              <div
                onDrop={e => { e.preventDefault(); setDragOver(false); handleFileLoad(e.dataTransfer.files[0]) }}
                onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  position: 'absolute', inset: 16, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', gap: 14,
                  cursor: 'pointer', borderRadius: 8,
                  border: `2px dashed ${imgError ? '#EF4444' : dragOver ? '#6366f1' : '#2a2850'}`,
                  background: dragOver ? 'rgba(99,102,241,0.05)' : 'transparent',
                  transition: 'border-color 0.2s, background 0.2s',
                }}
              >
                <svg width="44" height="44" viewBox="0 0 24 24" fill="none"
                  stroke={imgError ? '#EF4444' : dragOver ? '#6366f1' : '#4a5070'}
                  strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                <div style={{ textAlign: 'center' }}>
                  {imgError
                    ? <div style={{ color: '#EF4444', fontSize: 13, fontWeight: 600, maxWidth: 220 }}>{imgError}</div>
                    : <>
                        <div style={{ color: '#e8eeff', fontSize: 14, fontWeight: 500, marginBottom: 4 }}>
                          Arrastrá fotos del equipo aquí
                        </div>
                        <div style={{ color: '#4a5070', fontSize: 12 }}>o hacé clic para seleccionar (máx. 2 MB c/u)</div>
                      </>
                  }
                </div>
              </div>
            ) : (
              /* Image + overlay */
              <div
                ref={containerRef}
                onClick={handleCanvasClick}
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
                onMouseLeave={() => {
                  if (drawStart) setPreviewEnd(null)
                  if (draggingId) {
                    if (dragMovedRef.current) setPuntos(prev => { actualizarPuntos(id, prev); return prev })
                    setDraggingId(null)
                  }
                }}
                style={{ position: 'absolute', inset: 0, cursor: cursorCanvas, userSelect: 'none' }}
              >
                <img
                  key={imgActiva.id}
                  src={imgActiva.url}
                  alt={equipo.nombre}
                  onLoad={handleEditorImgLoad}
                  style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block', pointerEvents: 'none' }}
                  draggable={false}
                />

                {/* ── Overlay: pixel-perfect rect matching objectFit:contain area ── */}
                {/* editorImgRect is computed via JS (ResizeObserver + rAF), not CSS.  */}
                {/* CSS aspect-ratio on a flex item collapses to 0×0 without content. */}
                {editorImgRect && (
                  <div
                    style={{
                      position: 'absolute',
                      left: editorImgRect.left,
                      top: editorImgRect.top,
                      width: editorImgRect.width,
                      height: editorImgRect.height,
                      pointerEvents: 'none',
                    }}
                  >
                      {/* SVG: arrows + preview */}
                      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', overflow: 'visible' }}>
                        <defs>
                          <marker id="arrowhead" markerWidth="7" markerHeight="5" refX="7" refY="2.5" orient="auto">
                            <polygon points="0 0, 7 2.5, 0 5" fill="#818cf8" />
                          </marker>
                          <marker id="arrowhead-prev" markerWidth="7" markerHeight="5" refX="7" refY="2.5" orient="auto">
                            <polygon points="0 0, 7 2.5, 0 5" fill="#818cf888" />
                          </marker>
                        </defs>

                        {(imgActiva.flechas || []).map(f => (
                          <line key={f.id}
                            x1={`${f.x1}%`} y1={`${f.y1}%`}
                            x2={`${f.x2}%`} y2={`${f.y2}%`}
                            stroke="#818cf8" strokeWidth="2"
                            strokeDasharray={f.tipo === 'linea' ? '6 4' : undefined}
                            markerEnd={f.tipo === 'flecha' ? 'url(#arrowhead)' : undefined}
                          />
                        ))}

                        {drawStart && (
                          <circle cx={`${drawStart.x}%`} cy={`${drawStart.y}%`} r="4"
                            fill="#818cf8" stroke="#fff" strokeWidth="1" />
                        )}
                        {drawStart && previewEnd && (
                          <line
                            x1={`${drawStart.x}%`} y1={`${drawStart.y}%`}
                            x2={`${previewEnd.x}%`} y2={`${previewEnd.y}%`}
                            stroke="#818cf888" strokeWidth="1.5" strokeDasharray="5 4"
                            markerEnd={herramienta === 'flecha' ? 'url(#arrowhead-prev)' : undefined}
                          />
                        )}
                      </svg>

                      {/* Delete buttons for arrows (only in punto mode) */}
                      {herramienta === 'punto' && (imgActiva.flechas || []).map(f => (
                        <button
                          key={`del-${f.id}`}
                          onClick={e => { e.stopPropagation(); handleDeleteFlecha(f.id) }}
                          style={{
                            position: 'absolute',
                            left: `${(f.x1 + f.x2) / 2}%`, top: `${(f.y1 + f.y2) / 2}%`,
                            transform: 'translate(-50%, -50%)',
                            width: 18, height: 18, borderRadius: '50%',
                            background: '#EF4444', border: '1px solid #fff',
                            color: '#fff', fontSize: 11, fontWeight: 700,
                            cursor: 'pointer', zIndex: 20, padding: 0,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            lineHeight: 1, pointerEvents: 'auto',
                          }}
                        >×</button>
                      ))}

                      {/* Point markers */}
                      {puntosDeLaImagen.map(p => {
                        const isSelected = p.id === selectedId
                        const isHovered  = p.id === hoveredId
                        const isChecked  = checkedIds.has(p.id)
                        const isDragging = p.id === draggingId
                        return (
                          <button
                            key={p.id}
                            onMouseDown={e => handlePointMouseDown(e, p.id)}
                            onClick={e => handlePointClick(e, p.id)}
                            onMouseEnter={() => setHoveredId(p.id)}
                            onMouseLeave={() => setHoveredId(null)}
                            title={p.nombre || `Punto ${p.numero}`}
                            style={{
                              position: 'absolute',
                              left: `${p.x}%`, top: `${p.y}%`,
                              transform: 'translate(-50%, -50%)',
                              width: isSelected || isHovered ? 34 : 28,
                              height: isSelected || isHovered ? 34 : 28,
                              borderRadius: '50%',
                              background: frecColor(p.frecuencia),
                              border: isSelected || isChecked
                                ? '3px solid #fff'
                                : isHovered ? `2px solid ${frecColor(p.frecuencia)}88` : '2px solid rgba(0,0,0,0.45)',
                              color: '#fff', fontSize: isSelected || isHovered ? 12 : 11, fontWeight: 700,
                              cursor: isDragging ? 'grabbing' : herramienta === 'punto' ? 'grab' : 'pointer',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              boxShadow: isSelected ? `0 0 0 3px ${frecColor(p.frecuencia)}55, 0 4px 12px rgba(0,0,0,0.5)` : '0 2px 8px rgba(0,0,0,0.45)',
                              zIndex: isDragging ? 30 : isSelected ? 20 : 10,
                              padding: 0,
                              fontFamily: "'DM Sans', sans-serif",
                              pointerEvents: 'auto',
                              transition: isDragging ? 'none' : 'width 0.1s, height 0.1s, box-shadow 0.1s',
                            }}
                          >
                            {p.numero}
                          </button>
                        )
                      })}
                  </div>
                )}

                {/* Loading indicator while waiting for natural size */}
                {!imgNaturalSize && (
                  <div style={{
                    position: 'absolute', inset: 0, display: 'flex',
                    alignItems: 'center', justifyContent: 'center', pointerEvents: 'none',
                  }}>
                    <div style={{ color: '#4a5070', fontSize: 12 }}>Cargando imagen…</div>
                  </div>
                )}
              </div>
            )}
          </div>

          <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }}
            onChange={e => handleFileLoad(e.target.files[0])} />
        </div>

        {/* ── RIGHT: Point list / form ── */}
        <div style={{
          flex: '0 0 40%', background: '#13112a', borderRadius: 12,
          border: '1px solid #2a2850', display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}>
          {bulkFrecuencia && selectMode ? (
            <BulkFrecuenciaPanel
              count={checkedIds.size}
              onApply={handleBulkFrecuencia}
              onCancel={() => setBulkFrecuencia(false)}
            />
          ) : selectedPunto && !selectMode ? (
            <PuntoForm
              punto={selectedPunto}
              onSave={handleSavePunto}
              onDelete={handleDeletePunto}
              onClose={() => setSelectedId(null)}
              lubricantes={lubricantes}
            />
          ) : (
            <>
              {/* Panel header */}
              <div style={{
                padding: '10px 12px 10px 16px', borderBottom: '1px solid #2a2850',
                flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                {selectMode ? (
                  <>
                    <button onClick={toggleSelectAll} style={{
                      background: 'none', border: 'none', color: '#8892b0',
                      fontSize: 12, cursor: 'pointer', padding: 0, fontFamily: "'DM Sans', sans-serif",
                    }}>
                      {checkedIds.size === puntos.length ? 'Desmarcar todo' : 'Seleccionar todo'}
                    </button>
                    <button onClick={() => { setSelectMode(false); setCheckedIds(new Set()) }} style={{
                      background: 'none', border: 'none', color: '#8892b0',
                      fontSize: 12, cursor: 'pointer', padding: '4px 8px', fontFamily: "'DM Sans', sans-serif",
                    }}>
                      Cancelar
                    </button>
                  </>
                ) : (
                  <>
                    <span style={{ color: '#8892b0', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Puntos ({puntos.length})
                      {imgActiva && (
                        <span style={{ color: '#4a5070', marginLeft: 6, fontSize: 10 }}>
                          · {puntosDeLaImagen.length} en esta foto
                        </span>
                      )}
                    </span>
                    {puntos.length > 0 && (
                      <button onClick={() => { setSelectMode(true); setSelectedId(null) }} style={{
                        background: 'none', border: '1px solid #2a2850', borderRadius: 6,
                        color: '#8892b0', fontSize: 11, cursor: 'pointer', padding: '3px 10px',
                        fontFamily: "'DM Sans', sans-serif",
                      }}>
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
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    justifyContent: 'center', height: '100%', gap: 10, padding: 28, textAlign: 'center',
                  }}>
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#2a2850" strokeWidth="1.5">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <div style={{ color: '#4a5070', fontSize: 13 }}>
                      {imagenes.length > 0
                        ? 'Hacé clic en la foto para agregar un punto'
                        : 'Primero agregá una foto del equipo'}
                    </div>
                  </div>
                ) : (
                  puntos.map((p, i) => {
                    const isChecked   = checkedIds.has(p.id)
                    const isSelected  = p.id === selectedId && !selectMode
                    const isHovered   = p.id === hoveredId
                    const isOnThisImg = puntosDeLaImagen.some(pd => pd.id === p.id)
                    return (
                      <div
                        key={p.id}
                        onClick={() => selectMode ? toggleCheck(p.id) : setSelectedId(p.id)}
                        onMouseEnter={() => setHoveredId(p.id)}
                        onMouseLeave={() => setHoveredId(null)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 12,
                          padding: '11px 16px', cursor: 'pointer',
                          borderBottom: i < puntos.length - 1 ? '1px solid #2a2850' : 'none',
                          background: isChecked
                            ? 'rgba(239,68,68,0.07)'
                            : isSelected || isHovered
                              ? 'rgba(99,102,241,0.08)'
                              : 'transparent',
                          opacity: !selectMode && imgActiva && !isOnThisImg ? 0.35 : 1,
                          transition: 'background 0.1s, opacity 0.1s',
                        }}
                      >
                        {selectMode ? (
                          <div style={{
                            width: 20, height: 20, borderRadius: 5, flexShrink: 0,
                            border: `2px solid ${isChecked ? '#EF4444' : '#2a2850'}`,
                            background: isChecked ? '#EF4444' : 'transparent',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
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
                            boxShadow: isSelected ? `0 0 0 2px ${frecColor(p.frecuencia)}55` : 'none',
                            transition: 'box-shadow 0.15s',
                          }}>
                            {p.numero}
                          </div>
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            color: p.nombre ? '#e8eeff' : '#4a5070',
                            fontSize: 13, fontWeight: p.nombre ? 500 : 400,
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          }}>
                            {p.nombre || 'Sin nombre — clic para editar'}
                          </div>
                          <div style={{ fontSize: 11, color: '#4a5070', marginTop: 1 }}>
                            {FRECUENCIAS.find(f => f.value === p.frecuencia)?.label}
                            {!isOnThisImg && imgActiva && (
                              <span style={{ marginLeft: 6, color: '#3a3860' }}>· otra foto</span>
                            )}
                          </div>
                        </div>
                        {!selectMode && (
                          <button
                            onClick={e => { e.stopPropagation(); handleDeletePunto(p.id) }}
                            title="Eliminar punto"
                            style={{ background: 'none', border: 'none', color: '#4a5070', cursor: 'pointer', padding: 4, display: 'flex' }}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                          </button>
                        )}
                      </div>
                    )
                  })
                )}
              </div>

              {/* Footer */}
              <div style={{ padding: 14, borderTop: '1px solid #2a2850', flexShrink: 0 }}>
                {selectMode ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <button
                      onClick={() => setBulkFrecuencia(true)}
                      disabled={checkedIds.size === 0}
                      style={{
                        width: '100%', padding: '9px', borderRadius: 8,
                        border: checkedIds.size > 0 ? '1px solid rgba(129,140,248,0.4)' : '1px solid #2a2850',
                        background: checkedIds.size > 0 ? 'rgba(99,102,241,0.1)' : '#2a2850',
                        color: checkedIds.size > 0 ? '#818cf8' : '#4a5070',
                        cursor: checkedIds.size > 0 ? 'pointer' : 'not-allowed',
                        fontSize: 13, fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      Cambiar frecuencia
                    </button>
                    <button
                      onClick={handleDeleteChecked}
                      disabled={checkedIds.size === 0}
                      style={{
                        width: '100%', padding: '9px', borderRadius: 8, border: 'none',
                        background: checkedIds.size > 0 ? '#EF4444' : '#2a2850',
                        color: checkedIds.size > 0 ? '#fff' : '#4a5070',
                        cursor: checkedIds.size > 0 ? 'pointer' : 'not-allowed',
                        fontSize: 13, fontWeight: 700, fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      {checkedIds.size > 0 ? `Eliminar ${checkedIds.size} punto${checkedIds.size !== 1 ? 's' : ''}` : 'Seleccioná puntos'}
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setShowQR(true)} style={{
                    width: '100%', padding: '10px', borderRadius: 8,
                    border: '1px solid #2a2850', background: 'transparent',
                    color: '#8892b0', cursor: 'pointer', fontSize: 13,
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
        <QRModal equipo={equipo} onClose={() => setShowQR(false)} />
      )}
    </AdminLayout>
  )
}
