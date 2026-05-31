import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import { equipos as equiposInicial } from '../../data/equipos'
import { idbSave, idbLoadAll, idbDelete } from '../../utils/imageStore'

const CREDS_KEY = 'lubriplan_admin_creds'
const SESSION_KEY = 'adminSession'
const EQUIPOS_KEY = 'masterlub_equipos'
const TECNICOS_KEY = 'masterlub_tecnicos'
const LUBRICANTES_KEY = 'masterlub_lubricantes'

function getCredenciales() {
  try {
    const saved = localStorage.getItem(CREDS_KEY)
    if (saved) return JSON.parse(saved)
  } catch {}
  return { email: 'admin@lubriplan.com', password: 'admin123' }
}

const TECNICOS_INICIALES = [
  { id: 't1', nombre: 'Juan Pérez',   pin: '1234', activo: true,  ultimaConsulta: '2026-05-20' },
  { id: 't2', nombre: 'María López',  pin: '5678', activo: true,  ultimaConsulta: '2026-05-19' },
  { id: 't3', nombre: 'Carlos Ruiz',  pin: '9012', activo: false, ultimaConsulta: '2026-04-30' },
]

const LUBRICANTES_INICIALES = [
  { id: 'lub1', nombre: 'Shell Omala S2 G 220',    tipo: 'Aceite industrial', viscosidad: 'ISO 220' },
  { id: 'lub2', nombre: 'Shell Alvania EP 2',       tipo: 'Grasa de litio',   viscosidad: 'NLGI 2'  },
  { id: 'lub3', nombre: 'Mobil DTE 25',             tipo: 'Aceite hidráulico', viscosidad: 'ISO 46' },
  { id: 'lub4', nombre: 'Mobil Grease XHP 222',     tipo: 'Grasa de litio',   viscosidad: 'NLGI 2'  },
  { id: 'lub5', nombre: 'Castrol Tribol 1100/220',  tipo: 'Aceite engranajes', viscosidad: 'ISO 220'},
  { id: 'lub6', nombre: 'SKF LGMT 2',               tipo: 'Grasa rodamientos', viscosidad: 'NLGI 2' },
]

// ── Load/save helpers ────────────────────────────────────────────────────────

// Equipos: metadata only (no images) → localStorage
function cargarEquiposMetadata() {
  try {
    const saved = localStorage.getItem(EQUIPOS_KEY)
    if (saved) {
      return JSON.parse(saved).map(e => ({ ...e, imagenes: [], imagenUrl: null }))
    }
  } catch {}
  return equiposInicial.map(e => ({ ...e, activo: true, imagenUrl: null, imagenes: [] }))
}

function persistirMetadata(equipos) {
  try {
    const sinImagen = equipos.map(({ imagenUrl, imagenes, ...e }) => e)
    localStorage.setItem(EQUIPOS_KEY, JSON.stringify(sinImagen))
  } catch (err) {
    console.error('Error guardando metadatos de equipos:', err)
  }
}

// Images: IndexedDB (no quota limit)
async function persistirImagenes(equipos) {
  await Promise.all(equipos.map(e => idbSave(e.id, e.imagenes || [])))
}

// Migrate old localStorage images to IDB and remove them
async function migrarImagenesLegacy(equiposIds) {
  for (const id of equiposIds) {
    const lsKey = `masterlub_imgs_${id}`
    const legacyKey = `masterlub_img_${id}`
    let imgs = null

    const raw = localStorage.getItem(lsKey)
    if (raw) {
      try { imgs = JSON.parse(raw) } catch {}
      localStorage.removeItem(lsKey)
    } else {
      const oldUrl = localStorage.getItem(legacyKey)
      if (oldUrl) {
        imgs = [{ id: 'img-legacy', url: oldUrl, flechas: [] }]
        localStorage.removeItem(legacyKey)
      }
    }

    if (imgs?.length) {
      await idbSave(id, imgs)
    }
  }
}

// ── Context ──────────────────────────────────────────────────────────────────

const AdminContext = createContext(null)

export function AdminProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem(SESSION_KEY))
  const [equipos, setEquipos] = useState(cargarEquiposMetadata)
  const [tecnicos, setTecnicos] = useState(() => {
    try {
      const s = localStorage.getItem(TECNICOS_KEY)
      if (s) return JSON.parse(s)
    } catch {}
    return TECNICOS_INICIALES
  })
  const [lubricantes, setLubricantes] = useState(() => {
    try {
      const s = localStorage.getItem(LUBRICANTES_KEY)
      if (s) return JSON.parse(s)
    } catch {}
    return LUBRICANTES_INICIALES
  })

  // True once IDB images have been loaded into state — prevents empty-write race
  const imgsLoadedRef = useRef(false)

  // ── Load images from IDB on mount, migrate legacy localStorage images ──────
  useEffect(() => {
    const ids = equipos.map(e => e.id)
    migrarImagenesLegacy(ids).then(() => idbLoadAll()).then(allImgs => {
      setEquipos(prev => prev.map(e => {
        const imgs = allImgs[e.id] || []
        return imgs.length ? { ...e, imagenes: imgs, imagenUrl: imgs[0]?.url || null } : e
      }))
      imgsLoadedRef.current = true
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Persist metadata to localStorage whenever equipos change ────────────────
  useEffect(() => {
    persistirMetadata(equipos)
  }, [equipos])

  // ── Persist images to IDB whenever equipos change (after initial load) ──────
  useEffect(() => {
    if (!imgsLoadedRef.current) return
    persistirImagenes(equipos)
  }, [equipos])

  // ── Persist tecnicos & lubricantes ──────────────────────────────────────────
  useEffect(() => {
    try { localStorage.setItem(TECNICOS_KEY, JSON.stringify(tecnicos)) } catch {}
  }, [tecnicos])
  useEffect(() => {
    try { localStorage.setItem(LUBRICANTES_KEY, JSON.stringify(lubricantes)) } catch {}
  }, [lubricantes])

  // ── Cross-tab sync (same browser, different tabs) ────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (e.key === EQUIPOS_KEY && e.newValue) {
        try {
          const lista = JSON.parse(e.newValue)
          idbLoadAll().then(allImgs => {
            setEquipos(lista.map(eq => {
              const imgs = allImgs[eq.id] || []
              return { ...eq, imagenes: imgs, imagenUrl: imgs[0]?.url || null }
            }))
          })
        } catch {}
      }
      if (e.key === TECNICOS_KEY && e.newValue) {
        try { setTecnicos(JSON.parse(e.newValue)) } catch {}
      }
    }
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [])

  // ── Auth ─────────────────────────────────────────────────────────────────────
  const login = useCallback((email, password) => {
    const creds = getCredenciales()
    if (email === creds.email && password === creds.password) {
      localStorage.setItem(SESSION_KEY, JSON.stringify({ email, ts: Date.now() }))
      setIsLoggedIn(true)
      return true
    }
    return false
  }, [])

  const cambiarCredenciales = useCallback((email, password) => {
    localStorage.setItem(CREDS_KEY, JSON.stringify({ email, password }))
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY)
    setIsLoggedIn(false)
  }, [])

  // ── Equipos CRUD ─────────────────────────────────────────────────────────────
  const crearEquipo = useCallback((datos) => {
    const id = `equipo-${Date.now()}`
    const nuevo = { id, puntos: [], vencidos: 0, imagen: 'motor', activo: true, imagenUrl: null, imagenes: [], ...datos }
    setEquipos(prev => [...prev, nuevo])
    return id
  }, [])

  const editarEquipo = useCallback((id, datos) => {
    setEquipos(prev => prev.map(e => e.id === id ? { ...e, ...datos } : e))
  }, [])

  const eliminarEquipo = useCallback((id) => {
    idbDelete(id)
    setEquipos(prev => prev.filter(e => e.id !== id))
  }, [])

  const actualizarPuntos = useCallback((equipoId, puntos) => {
    setEquipos(prev => prev.map(e => e.id === equipoId ? { ...e, puntos } : e))
  }, [])

  const actualizarImagenEquipo = useCallback((equipoId, imagenUrl) => {
    setEquipos(prev => prev.map(e => {
      if (e.id !== equipoId) return e
      const imagenes = imagenUrl ? [{ id: 'img-legacy', url: imagenUrl, flechas: [] }] : []
      return { ...e, imagenes, imagenUrl }
    }))
  }, [])

  const actualizarImagenesEquipo = useCallback((equipoId, imagenes) => {
    imgsLoadedRef.current = true // ensure IDB write is triggered
    setEquipos(prev => prev.map(e => {
      if (e.id !== equipoId) return e
      return { ...e, imagenes, imagenUrl: imagenes[0]?.url || null }
    }))
  }, [])

  // ── Lubricantes CRUD ──────────────────────────────────────────────────────────
  const crearLubricante = useCallback((datos) => {
    setLubricantes(prev => [...prev, { id: `lub-${Date.now()}`, ...datos }])
  }, [])
  const editarLubricante = useCallback((id, datos) => {
    setLubricantes(prev => prev.map(l => l.id === id ? { ...l, ...datos } : l))
  }, [])
  const eliminarLubricante = useCallback((id) => {
    setLubricantes(prev => prev.filter(l => l.id !== id))
  }, [])

  // ── Técnicos CRUD ─────────────────────────────────────────────────────────────
  const crearTecnico = useCallback((datos) => {
    setTecnicos(prev => [...prev, { id: `t-${Date.now()}`, activo: true, ultimaConsulta: null, ...datos }])
  }, [])
  const editarTecnico = useCallback((id, datos) => {
    setTecnicos(prev => prev.map(t => t.id === id ? { ...t, ...datos } : t))
  }, [])
  const eliminarTecnico = useCallback((id) => {
    setTecnicos(prev => prev.filter(t => t.id !== id))
  }, [])
  const toggleTecnico = useCallback((id) => {
    setTecnicos(prev => prev.map(t => t.id === id ? { ...t, activo: !t.activo } : t))
  }, [])

  // ── Sync import (from SyncPage) ───────────────────────────────────────────────
  const importarConfig = useCallback((data) => {
    if (data.equipos?.length) {
      const procesados = data.equipos.map(e => ({
        ...e,
        imagenes: e.imagenes || [],
        imagenUrl: (e.imagenes || [])[0]?.url || null,
      }))
      imgsLoadedRef.current = true
      setEquipos(procesados)
    }
    if (data.tecnicos?.length) {
      setTecnicos(data.tecnicos)
    }
  }, [])

  return (
    <AdminContext.Provider value={{
      isLoggedIn, login, logout, cambiarCredenciales,
      equipos, crearEquipo, editarEquipo, eliminarEquipo,
      actualizarPuntos, actualizarImagenEquipo, actualizarImagenesEquipo,
      tecnicos, crearTecnico, editarTecnico, eliminarTecnico, toggleTecnico,
      lubricantes, crearLubricante, editarLubricante, eliminarLubricante,
      importarConfig,
    }}>
      {children}
    </AdminContext.Provider>
  )
}

export function useAdmin() {
  const ctx = useContext(AdminContext)
  if (!ctx) throw new Error('useAdmin must be used within AdminProvider')
  return ctx
}
