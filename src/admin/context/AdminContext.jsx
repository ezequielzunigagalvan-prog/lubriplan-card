import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { equipos as equiposInicial } from '../../data/equipos'

const ADMIN_EMAIL = 'admin@lubriplan.com'
const ADMIN_PASSWORD = 'admin123'
const SESSION_KEY = 'adminSession'

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

const AdminContext = createContext(null)

export function AdminProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem(SESSION_KEY))
  const [equipos, setEquipos] = useState(() => {
    try {
      const saved = localStorage.getItem('masterlub_equipos')
      if (saved) return JSON.parse(saved)
    } catch {}
    return equiposInicial.map(e => ({ ...e, activo: true, imagenUrl: null }))
  })
  const [tecnicos, setTecnicos] = useState(() => {
    try {
      const saved = localStorage.getItem('masterlub_tecnicos')
      if (saved) return JSON.parse(saved)
    } catch {}
    return TECNICOS_INICIALES
  })
  const [lubricantes, setLubricantes] = useState(() => {
    try {
      const saved = localStorage.getItem('masterlub_lubricantes')
      if (saved) return JSON.parse(saved)
    } catch {}
    return LUBRICANTES_INICIALES
  })

  useEffect(() => {
    try {
      localStorage.setItem('masterlub_equipos', JSON.stringify(equipos))
    } catch {
      console.error('Error guardando equipos en localStorage')
    }
  }, [equipos])

  useEffect(() => {
    try {
      localStorage.setItem('masterlub_tecnicos', JSON.stringify(tecnicos))
    } catch {
      console.error('Error guardando técnicos en localStorage')
    }
  }, [tecnicos])

  useEffect(() => {
    try {
      localStorage.setItem('masterlub_lubricantes', JSON.stringify(lubricantes))
    } catch {
      console.error('Error guardando lubricantes en localStorage')
    }
  }, [lubricantes])

  const login = useCallback((email, password) => {
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      localStorage.setItem(SESSION_KEY, JSON.stringify({ email, ts: Date.now() }))
      setIsLoggedIn(true)
      return true
    }
    return false
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY)
    setIsLoggedIn(false)
  }, [])

  const crearEquipo = useCallback((datos) => {
    const id = `equipo-${Date.now()}`
    setEquipos(prev => [...prev, {
      id, puntos: [], vencidos: 0, imagen: 'motor', activo: true, imagenUrl: null, ...datos,
    }])
    return id
  }, [])

  const editarEquipo = useCallback((id, datos) => {
    setEquipos(prev => prev.map(e => e.id === id ? { ...e, ...datos } : e))
  }, [])

  const eliminarEquipo = useCallback((id) => {
    setEquipos(prev => prev.filter(e => e.id !== id))
  }, [])

  const actualizarPuntos = useCallback((equipoId, puntos) => {
    setEquipos(prev => prev.map(e => e.id === equipoId ? { ...e, puntos } : e))
  }, [])

  const actualizarImagenEquipo = useCallback((equipoId, imagenUrl) => {
    setEquipos(prev => prev.map(e => e.id === equipoId ? { ...e, imagenUrl } : e))
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

  return (
    <AdminContext.Provider value={{
      isLoggedIn, login, logout,
      equipos, crearEquipo, editarEquipo, eliminarEquipo, actualizarPuntos, actualizarImagenEquipo,
      tecnicos, crearTecnico, editarTecnico, eliminarTecnico, toggleTecnico,
      lubricantes, crearLubricante, editarLubricante, eliminarLubricante,
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
