import { createContext, useContext, useState, useCallback } from 'react'
import { equipos as equiposInicial } from '../../data/equipos'

const ADMIN_EMAIL = 'admin@lubriplan.com'
const ADMIN_PASSWORD = 'admin123'
const SESSION_KEY = 'adminSession'

const TECNICOS_INICIALES = [
  { id: 't1', nombre: 'Juan Pérez', pin: '1234', activo: true, ultimaConsulta: '2026-05-20' },
  { id: 't2', nombre: 'María López', pin: '5678', activo: true, ultimaConsulta: '2026-05-19' },
  { id: 't3', nombre: 'Carlos Ruiz', pin: '9012', activo: false, ultimaConsulta: '2026-04-30' },
]

const AdminContext = createContext(null)

export function AdminProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem(SESSION_KEY))
  const [equipos, setEquipos] = useState(() =>
    equiposInicial.map(e => ({ ...e, activo: true, imagenUrl: null }))
  )
  const [tecnicos, setTecnicos] = useState(TECNICOS_INICIALES)

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
