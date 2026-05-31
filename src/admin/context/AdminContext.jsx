import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { equipos as equiposInicial } from '../../data/equipos'

const CREDS_KEY = 'lubriplan_admin_creds'
const SESSION_KEY = 'adminSession'

function getCredenciales() {
  try {
    const saved = localStorage.getItem(CREDS_KEY)
    if (saved) return JSON.parse(saved)
  } catch {}
  return { email: 'admin@lubriplan.com', password: 'admin123' }
}
const EQUIPOS_KEY = 'masterlub_equipos'
const TECNICOS_KEY = 'masterlub_tecnicos'
const LUBRICANTES_KEY = 'masterlub_lubricantes'

const TECNICOS_INICIALES = [
  { id: 't1', nombre: 'Juan Pérez', pin: '1234', activo: true, ultimaConsulta: '2026-05-20' },
  { id: 't2', nombre: 'María López', pin: '5678', activo: true, ultimaConsulta: '2026-05-19' },
  { id: 't3', nombre: 'Carlos Ruiz', pin: '9012', activo: false, ultimaConsulta: '2026-04-30' },
]

const LUBRICANTES_INICIALES = [
  { id: 'lub1', nombre: 'Shell Omala S2 G 220', tipo: 'Aceite industrial', viscosidad: 'ISO 220' },
  { id: 'lub2', nombre: 'Shell Alvania EP 2', tipo: 'Grasa de litio', viscosidad: 'NLGI 2' },
  { id: 'lub3', nombre: 'Mobil DTE 25', tipo: 'Aceite hidráulico', viscosidad: 'ISO 46' },
  { id: 'lub4', nombre: 'Mobil Grease XHP 222', tipo: 'Grasa de litio', viscosidad: 'NLGI 2' },
  { id: 'lub5', nombre: 'Castrol Tribol 1100/220', tipo: 'Aceite engranajes', viscosidad: 'ISO 220' },
  { id: 'lub6', nombre: 'SKF LGMT 2', tipo: 'Grasa rodamientos', viscosidad: 'NLGI 2' },
]

// Legacy single-image key
function imgKey(id) { return `masterlub_img_${id}` }
// New multi-image key — stores full [{id, url, flechas}] array
function imgsKey(id) { return `masterlub_imgs_${id}` }

function cargarImagenes(equipoId) {
  try {
    const raw = localStorage.getItem(imgsKey(equipoId))
    if (raw) return JSON.parse(raw)
  } catch {}
  // Migrate from old single-image format
  const oldUrl = localStorage.getItem(imgKey(equipoId))
  if (oldUrl) return [{ id: 'img-legacy', url: oldUrl, flechas: [] }]
  return []
}

function cargarEquipos() {
  try {
    const saved = localStorage.getItem(EQUIPOS_KEY)
    if (saved) {
      const lista = JSON.parse(saved)
      return lista.map(e => {
        const imagenes = cargarImagenes(e.id)
        return { ...e, imagenes, imagenUrl: imagenes[0]?.url || null }
      })
    }
  } catch {}
  return equiposInicial.map(e => ({ ...e, activo: true, imagenUrl: null, imagenes: [] }))
}

function persistirEquipos(equipos) {
  try {
    const sinImagen = equipos.map(({ imagenUrl, imagenes, ...e }) => e)
    localStorage.setItem(EQUIPOS_KEY, JSON.stringify(sinImagen))
  } catch (err) {
    console.error('Error guardando equipos:', err)
  }
  equipos.forEach(e => {
    try {
      const imgs = e.imagenes || []
      if (imgs.length > 0) {
        localStorage.setItem(imgsKey(e.id), JSON.stringify(imgs))
      } else {
        localStorage.removeItem(imgsKey(e.id))
      }
    } catch {}
  })
}

const AdminContext = createContext(null)

export function AdminProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem(SESSION_KEY))

  const [equipos, setEquipos] = useState(cargarEquipos)

  const [tecnicos, setTecnicos] = useState(() => {
    try {
      const saved = localStorage.getItem(TECNICOS_KEY)
      if (saved) return JSON.parse(saved)
    } catch {}
    return TECNICOS_INICIALES
  })

  const [lubricantes, setLubricantes] = useState(() => {
    try {
      const saved = localStorage.getItem(LUBRICANTES_KEY)
      if (saved) return JSON.parse(saved)
    } catch {}
    return LUBRICANTES_INICIALES
  })

  useEffect(() => { persistirEquipos(equipos) }, [equipos])
  useEffect(() => {
    try { localStorage.setItem(TECNICOS_KEY, JSON.stringify(tecnicos)) } catch {}
  }, [tecnicos])
  useEffect(() => {
    try { localStorage.setItem(LUBRICANTES_KEY, JSON.stringify(lubricantes)) } catch {}
  }, [lubricantes])

  useEffect(() => {
    const handler = (e) => {
      if (e.key === EQUIPOS_KEY && e.newValue) {
        try {
          const lista = JSON.parse(e.newValue)
          setEquipos(lista.map(eq => {
            const imagenes = cargarImagenes(eq.id)
            return { ...eq, imagenes, imagenUrl: imagenes[0]?.url || null }
          }))
        } catch {}
      }
      if (e.key === TECNICOS_KEY && e.newValue) {
        try { setTecnicos(JSON.parse(e.newValue)) } catch {}
      }
    }
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [])

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
    localStorage.removeItem(imgKey(id))
    localStorage.removeItem(imgsKey(id))
    setEquipos(prev => prev.filter(e => e.id !== id))
  }, [])

  const actualizarPuntos = useCallback((equipoId, puntos) => {
    setEquipos(prev => prev.map(e => e.id === equipoId ? { ...e, puntos } : e))
  }, [])

  // Legacy single-image update — kept for backwards compat
  const actualizarImagenEquipo = useCallback((equipoId, imagenUrl) => {
    setEquipos(prev => prev.map(e => {
      if (e.id !== equipoId) return e
      const imagenes = imagenUrl ? [{ id: 'img-legacy', url: imagenUrl, flechas: [] }] : []
      return { ...e, imagenes, imagenUrl }
    }))
  }, [])

  // Multi-image update — replaces the full imagenes array
  const actualizarImagenesEquipo = useCallback((equipoId, imagenes) => {
    setEquipos(prev => prev.map(e => {
      if (e.id !== equipoId) return e
      return { ...e, imagenes, imagenUrl: imagenes[0]?.url || null }
    }))
  }, [])

  const crearLubricante = useCallback((datos) => {
    setLubricantes(prev => [...prev, { id: `lub-${Date.now()}`, ...datos }])
  }, [])

  const editarLubricante = useCallback((id, datos) => {
    setLubricantes(prev => prev.map(l => l.id === id ? { ...l, ...datos } : l))
  }, [])

  const eliminarLubricante = useCallback((id) => {
    setLubricantes(prev => prev.filter(l => l.id !== id))
  }, [])

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

  const importarConfig = useCallback((data) => {
    if (data.equipos?.length) {
      setEquipos(data.equipos.map(e => ({
        ...e,
        imagenes: e.imagenes || [],
        imagenUrl: (e.imagenes || [])[0]?.url || null,
      })))
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
