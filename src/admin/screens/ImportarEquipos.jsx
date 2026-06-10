import { useState, useCallback, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '../components/AdminLayout'
import { useAdmin } from '../context/AdminContext'
import { importarEquipos } from '../../api/cardApi'

const COLS = ['Nombre del Equipo', 'Código', 'Área', 'Sub Área']

// ── Utilidades Excel ─────────────────────────────────────────────────────────

async function parsearExcel(file) {
  const XLSX = await import('xlsx')
  const data = await file.arrayBuffer()
  const wb   = XLSX.read(data, { type: 'array' })
  const ws   = wb.Sheets[wb.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' })
  if (rows.length < 2) return []
  return rows.slice(1).map(r => ({
    nombre: String(r[0] || '').trim(),
    codigo: String(r[1] || '').trim(),
    area:   String(r[2] || '').trim(),
    subArea:String(r[3] || '').trim(),
  })).filter(r => r.nombre || r.area)
}

function descargarPlantilla() {
  import('xlsx').then(XLSX => {
    const datos = [
      COLS,
      ['Bomba centrífuga #1',    'BOM-001', 'Sala de bombas',   'Nivel 2'],
      ['Compresor de aire',      'CMP-001', 'Cuarto técnico',   ''],
      ['Banda transportadora',   'BAN-001', 'Producción',       'Sector Norte'],
    ]
    const ws = XLSX.utils.aoa_to_sheet(datos)
    ws['!cols'] = [{ wch: 30 }, { wch: 14 }, { wch: 22 }, { wch: 20 }]
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Equipos')
    XLSX.writeFile(wb, 'plantilla-equipos-lubriplan.xlsx')
  })
}

// ── Validación de filas ───────────────────────────────────────────────────────

function validarFila(row, areasExistentes) {
  if (!row.nombre) return { estado: 'error', msg: 'Nombre vacío' }
  if (!row.area)   return { estado: 'error', msg: 'Área vacía' }
  const esNueva = !areasExistentes.has(row.area.toLowerCase())
  return {
    estado: esNueva ? 'nueva-area' : 'ok',
    msg:    esNueva ? `Área nueva: "${row.area}"` : '',
  }
}

// ── Estilos reutilizables ─────────────────────────────────────────────────────

const card = { background: '#13112a', borderRadius: 12, border: '1px solid #2a2850', padding: '28px 24px' }

function Pill({ color, bg, border, children }) {
  return (
    <span style={{
      padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
      background: bg, color, border: `1px solid ${border}`,
      fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap',
    }}>{children}</span>
  )
}

function Stepper({ paso }) {
  const steps = ['Subir archivo', 'Revisar', 'Importar']
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 32 }}>
      {steps.map((s, i) => {
        const n = i + 1
        const activo   = n === paso
        const completo = n < paso
        return (
          <div key={s} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 700,
                background: completo ? '#22C55E' : activo ? '#6366f1' : '#2a2850',
                color: completo || activo ? '#fff' : '#4a5070',
                border: activo ? '2px solid #818cf8' : 'none',
                flexShrink: 0,
              }}>
                {completo ? '✓' : n}
              </div>
              <span style={{ fontSize: 13, fontWeight: activo ? 600 : 400, color: activo ? '#e8eeff' : '#4a5070', whiteSpace: 'nowrap' }}>
                {s}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div style={{ flex: 1, height: 1, background: n < paso ? '#22C55E44' : '#2a2850', margin: '0 12px' }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Pantalla paso 1: subir archivo ────────────────────────────────────────────

function PasoSubir({ onFileParsed }) {
  const [drag, setDrag]     = useState(false)
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const inputRef = useRef(null)

  const procesar = useCallback(async (file) => {
    if (!file) return
    if (!file.name.endsWith('.xlsx')) { setError('Solo se aceptan archivos .xlsx'); return }
    setError('')
    setLoading(true)
    try {
      const filas = await parsearExcel(file)
      if (!filas.length) { setError('El archivo está vacío o no tiene filas de datos'); return }
      onFileParsed(filas)
    } catch {
      setError('Error leyendo el archivo. Verificá que sea un .xlsx válido.')
    } finally {
      setLoading(false)
    }
  }, [onFileParsed])

  return (
    <div style={{ maxWidth: 560 }}>
      <div
        onDragOver={e => { e.preventDefault(); setDrag(true) }}
        onDragLeave={() => setDrag(false)}
        onDrop={e => { e.preventDefault(); setDrag(false); procesar(e.dataTransfer.files[0]) }}
        onClick={() => inputRef.current?.click()}
        style={{
          border: `2px dashed ${drag ? '#6366f1' : '#2a2850'}`,
          borderRadius: 16, padding: '48px 24px', textAlign: 'center',
          cursor: 'pointer', background: drag ? 'rgba(99,102,241,0.06)' : '#13112a',
          transition: 'border-color 0.15s, background 0.15s', marginBottom: 20,
        }}
      >
        <input ref={inputRef} type="file" accept=".xlsx" style={{ display: 'none' }} onChange={e => procesar(e.target.files[0])} />
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" style={{ margin: '0 auto 16px' }}>
          <rect x="8" y="6" width="32" height="36" rx="4" stroke="#4a5070" strokeWidth="1.8" />
          <path d="M8 14h32" stroke="#4a5070" strokeWidth="1.5" />
          <rect x="14" y="20" width="8" height="8" rx="1" fill="#4a5070" opacity="0.4" />
          <rect x="26" y="20" width="8" height="3" rx="1" fill="#4a5070" opacity="0.4" />
          <rect x="26" y="25" width="5" height="3" rx="1" fill="#4a5070" opacity="0.4" />
          <rect x="14" y="31" width="20" height="3" rx="1" fill="#4a5070" opacity="0.4" />
          <circle cx="36" cy="36" r="10" fill="#6366f1" />
          <path d="M36 31v10M31 36l5-5 5 5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <div style={{ color: '#e8eeff', fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
          {loading ? 'Leyendo archivo…' : 'Arrastrá tu archivo Excel aquí'}
        </div>
        <div style={{ color: '#4a5070', fontSize: 13 }}>
          o hacé clic para seleccionarlo · Solo .xlsx
        </div>
      </div>

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8, padding: '10px 14px', color: '#EF4444', fontSize: 13, marginBottom: 16 }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={descargarPlantilla}
          style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px',
            border: '1px solid #2a2850', borderRadius: 8, background: 'transparent',
            color: '#8892b0', cursor: 'pointer', fontSize: 13, fontFamily: "'DM Sans', sans-serif",
          }}
        >
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <path d="M7.5 1v9M3 7l4.5 4 4.5-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M1 13h13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          Descargar plantilla Excel
        </button>
        <span style={{ fontSize: 11, color: '#4a5070' }}>
          Columnas: Nombre · Código · Área · Sub Área
        </span>
      </div>
    </div>
  )
}

// ── Pantalla paso 2: vista previa ─────────────────────────────────────────────

function PasoRevisar({ filas, equiposExistentes, onConfirmar, onCancelar }) {
  const areasExistentes = new Set(equiposExistentes.map(e => e.area?.toLowerCase()))

  const filasProcesadas = filas.map(row => ({ ...row, ...validarFila(row, areasExistentes) }))
  const validos   = filasProcesadas.filter(r => r.estado !== 'error')
  const nuevasAreas = new Set(filasProcesadas.filter(r => r.estado === 'nueva-area').map(r => r.area))
  const errores   = filasProcesadas.filter(r => r.estado === 'error')

  return (
    <div style={{ maxWidth: 900 }}>
      {/* Resumen */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <Pill color="#22C55E" bg="rgba(34,197,94,0.1)" border="rgba(34,197,94,0.25)">
          ✅ {validos.length} equipo{validos.length !== 1 ? 's' : ''} válido{validos.length !== 1 ? 's' : ''}
        </Pill>
        {nuevasAreas.size > 0 && (
          <Pill color="#EAB308" bg="rgba(234,179,8,0.1)" border="rgba(234,179,8,0.25)">
            ⚠️ {nuevasAreas.size} área{nuevasAreas.size !== 1 ? 's' : ''} nueva{nuevasAreas.size !== 1 ? 's' : ''}
          </Pill>
        )}
        {errores.length > 0 && (
          <Pill color="#EF4444" bg="rgba(239,68,68,0.1)" border="rgba(239,68,68,0.25)">
            ❌ {errores.length} error{errores.length !== 1 ? 'es' : ''}
          </Pill>
        )}
      </div>

      {/* Tabla */}
      <div style={{ ...card, padding: 0, overflow: 'hidden', marginBottom: 20 }}>
        {/* Header */}
        <div style={{ display: 'grid', gridTemplateColumns: '28px 1fr 120px 160px 140px', gap: 0, padding: '10px 16px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid #2a2850' }}>
          {['', 'Nombre', 'Código', 'Área', 'Sub Área'].map((h, i) => (
            <span key={i} style={{ color: '#4a5070', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</span>
          ))}
        </div>

        <div style={{ maxHeight: 400, overflowY: 'auto' }}>
          {filasProcesadas.map((row, i) => {
            const isError = row.estado === 'error'
            const isNueva = row.estado === 'nueva-area'
            const rowBg   = isError ? 'rgba(239,68,68,0.04)' : isNueva ? 'rgba(234,179,8,0.03)' : 'transparent'
            return (
              <div
                key={i}
                style={{ display: 'grid', gridTemplateColumns: '28px 1fr 120px 160px 140px', gap: 0, padding: '10px 16px', borderBottom: i < filasProcesadas.length - 1 ? '1px solid #2a2850' : 'none', background: rowBg, alignItems: 'center' }}
              >
                <span style={{ fontSize: 14 }}>
                  {isError ? '❌' : isNueva ? '⚠️' : '✅'}
                </span>
                <div>
                  <div style={{ color: '#e8eeff', fontSize: 13, fontWeight: 500 }}>{row.nombre || <span style={{ color: '#EF4444' }}>— vacío —</span>}</div>
                  {isError && <div style={{ color: '#EF4444', fontSize: 11, marginTop: 2 }}>{row.msg}</div>}
                  {isNueva && <div style={{ color: '#EAB308', fontSize: 11, marginTop: 2 }}>{row.msg}</div>}
                </div>
                <span style={{ color: '#818cf8', fontFamily: 'monospace', fontSize: 12, letterSpacing: 1 }}>{row.codigo || '—'}</span>
                <span style={{ color: '#8892b0', fontSize: 13 }}>{row.area || <span style={{ color: '#EF4444' }}>— vacío —</span>}</span>
                <span style={{ color: '#8892b0', fontSize: 13 }}>{row.subArea || '—'}</span>
              </div>
            )
          })}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <button
          onClick={onCancelar}
          style={{ padding: '11px 20px', border: '1px solid #2a2850', borderRadius: 8, background: 'transparent', color: '#8892b0', cursor: 'pointer', fontSize: 14, fontFamily: "'DM Sans', sans-serif" }}
        >
          ← Volver
        </button>
        <button
          onClick={() => onConfirmar(validos)}
          disabled={validos.length === 0}
          style={{
            padding: '11px 24px', border: 'none', borderRadius: 8,
            background: validos.length > 0 ? '#6366f1' : '#2a2850',
            color: validos.length > 0 ? '#fff' : '#4a5070',
            cursor: validos.length > 0 ? 'pointer' : 'not-allowed',
            fontSize: 14, fontWeight: 700, fontFamily: "'DM Sans', sans-serif",
          }}
        >
          Importar {validos.length} equipo{validos.length !== 1 ? 's' : ''}
        </button>
      </div>
    </div>
  )
}

// ── Pantalla paso 3: progreso y resultado ─────────────────────────────────────

function PasoImportar({ filas, onDone }) {
  const navigate    = useNavigate()
  const [estado,    setEstado]  = useState('cargando')
  const [resultado, setResult]  = useState(null)
  const hasStarted  = useRef(false)

  const ejecutar = useCallback(async () => {
    if (hasStarted.current) return
    hasStarted.current = true
    setEstado('cargando')
    try {
      const res = await importarEquipos(filas)
      setResult(res)
      setEstado('done')
      onDone()
    } catch (err) {
      console.error('[importar]', err)
      hasStarted.current = false
      setEstado('error')
    }
  }, [filas, onDone])

  // Solo corre una vez al montar — deps vacías evitan el loop
  useEffect(() => { ejecutar() }, [])

  return (
    <div style={{ maxWidth: 480, textAlign: 'center' }}>
      {estado === 'cargando' && (
        <div style={{ ...card, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, padding: 48 }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', border: '3px solid #6366f1', borderTopColor: 'transparent', animation: 'spin 0.9s linear infinite' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          <div style={{ color: '#e8eeff', fontSize: 16, fontWeight: 600 }}>Importando equipos…</div>
          <div style={{ color: '#4a5070', fontSize: 13 }}>{filas.length} equipo{filas.length !== 1 ? 's' : ''} en proceso</div>
        </div>
      )}

      {estado === 'done' && resultado && (
        <div style={{ ...card, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, padding: 48 }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(34,197,94,0.12)', border: '2px solid rgba(34,197,94,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>✅</div>
          <div style={{ color: '#e8eeff', fontSize: 18, fontWeight: 700 }}>¡Importación completa!</div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Pill color="#22C55E" bg="rgba(34,197,94,0.1)" border="rgba(34,197,94,0.25)">
              {resultado.creados} equipo{resultado.creados !== 1 ? 's' : ''} creado{resultado.creados !== 1 ? 's' : ''}
            </Pill>
            {resultado.errores?.length > 0 && (
              <Pill color="#EF4444" bg="rgba(239,68,68,0.1)" border="rgba(239,68,68,0.25)">
                {resultado.errores.length} error{resultado.errores.length !== 1 ? 'es' : ''}
              </Pill>
            )}
          </div>
          <button
            onClick={() => navigate('/admin/equipos')}
            style={{ padding: '12px 28px', background: '#6366f1', border: 'none', borderRadius: 8, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}
          >
            Ver equipos →
          </button>
        </div>
      )}

      {estado === 'error' && (
        <div style={{ ...card, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: 48 }}>
          <div style={{ fontSize: 32 }}>❌</div>
          <div style={{ color: '#EF4444', fontSize: 16, fontWeight: 600 }}>Error en la importación</div>
          <div style={{ color: '#4a5070', fontSize: 13 }}>Revisá los logs del servidor o intentá de nuevo.</div>
          <button onClick={() => { hasStarted.current = false; ejecutar() }} style={{ padding: '10px 20px', background: '#6366f1', border: 'none', borderRadius: 8, color: '#fff', fontSize: 13, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
            Reintentar
          </button>
        </div>
      )}
    </div>
  )
}

// ── Componente principal ──────────────────────────────────────────────────────

export default function ImportarEquipos() {
  const { equipos, recargar } = useAdmin()
  const [paso,  setPaso]  = useState(1)
  const [filas, setFilas] = useState([])
  const [filasValidas, setFilasValidas] = useState([])

  const handleFileParsed = useCallback((rows) => { setFilas(rows); setPaso(2) }, [])
  const handleConfirmar  = useCallback((rows) => { setFilasValidas(rows); setPaso(3) }, [])
  const handleDone       = useCallback(() => { recargar?.() }, [recargar])

  return (
    <AdminLayout titulo="Importar equipos">
      <div style={{ maxWidth: 960 }}>
        <Stepper paso={paso} />
        {paso === 1 && <PasoSubir onFileParsed={handleFileParsed} />}
        {paso === 2 && (
          <PasoRevisar
            filas={filas}
            equiposExistentes={equipos}
            onConfirmar={handleConfirmar}
            onCancelar={() => setPaso(1)}
          />
        )}
        {paso === 3 && <PasoImportar filas={filasValidas} onDone={handleDone} />}
      </div>
    </AdminLayout>
  )
}

