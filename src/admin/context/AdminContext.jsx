import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import * as api from '../../api/cardApi'

const AdminContext = createContext(null)

export function AdminProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(
    () => !!localStorage.getItem('adminToken')
  )
  const [equipos,    setEquipos]    = useState([])
  const [tecnicos,   setTecnicos]   = useState([])
  const [lubricantes, setLubricantes] = useState(() => {
    try { return JSON.parse(localStorage.getItem('masterlub_lubricantes') || 'null') || [] }
    catch { return [] }
  })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  // ── Carga inicial desde la API ──────────────────────────────────────────────
  const cargarDatos = useCallback(async () => {
    if (!isLoggedIn) return
    setLoading(true)
    setError(null)
    try {
      const [eqs, tecs] = await Promise.all([api.getEquipos(), api.getTecnicos()])
      setEquipos(eqs)
      setTecnicos(tecs)
    } catch (err) {
      console.error('[AdminContext] Error cargando datos:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [isLoggedIn])

  useEffect(() => { cargarDatos() }, [cargarDatos])

  // ── Auth ────────────────────────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    try {
      const { token } = await api.loginAdmin(email, password)
      localStorage.setItem('adminToken', token)
      localStorage.setItem('adminSession', JSON.stringify({ email, ts: Date.now() }))
      setIsLoggedIn(true)
      return true
    } catch (err) {
      console.error('[login]', err)
      return false
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminSession')
    setIsLoggedIn(false)
    setEquipos([])
    setTecnicos([])
  }, [])

  // ── Equipos CRUD ────────────────────────────────────────────────────────────
  const crearEquipo = useCallback(async (datos) => {
    try {
      const nuevo = await api.createEquipo(datos)
      setEquipos(prev => [nuevo, ...prev])
      return nuevo.id
    } catch (err) {
      console.error('[crearEquipo]', err)
      throw err
    }
  }, [])

  const editarEquipo = useCallback(async (id, datos) => {
    try {
      const actualizado = await api.updateEquipo(id, datos)
      setEquipos(prev => prev.map(e => e.id === id ? actualizado : e))
    } catch (err) {
      console.error('[editarEquipo]', err)
      throw err
    }
  }, [])

  const eliminarEquipo = useCallback(async (id) => {
    try {
      await api.deleteEquipo(id)
      setEquipos(prev => prev.filter(e => e.id !== id))
    } catch (err) {
      console.error('[eliminarEquipo]', err)
      throw err
    }
  }, [])

  // ── Puntos ──────────────────────────────────────────────────────────────────
  const actualizarPuntos = useCallback(async (equipoId, puntos) => {
    try {
      const equipo = await api.updatePuntos(equipoId, puntos)
      setEquipos(prev => prev.map(e => e.id === equipoId ? equipo : e))
    } catch (err) {
      console.error('[actualizarPuntos]', err)
      throw err
    }
  }, [])

  // ── Imágenes ────────────────────────────────────────────────────────────────
  const actualizarImagenesEquipo = useCallback(async (equipoId, imagenes) => {
    // Actualiza estado local inmediatamente (optimista)
    setEquipos(prev => prev.map(e => {
      if (e.id !== equipoId) return e
      return { ...e, imagenes, imagenUrl: imagenes[0]?.url || null }
    }))
    // Sincroniza flechas con la API (sin bloquear)
    api.updateImagenes(equipoId, imagenes).catch(err =>
      console.error('[actualizarImagenesEquipo]', err)
    )
  }, [])

  // ── Técnicos CRUD ───────────────────────────────────────────────────────────
  const crearTecnico = useCallback(async (datos) => {
    try {
      const t = await api.createTecnico(datos)
      setTecnicos(prev => [...prev, t])
    } catch (err) {
      console.error('[crearTecnico]', err)
      throw err
    }
  }, [])

  const editarTecnico = useCallback(async (id, datos) => {
    try {
      const t = await api.updateTecnico(id, datos)
      setTecnicos(prev => prev.map(x => x.id === id ? t : x))
    } catch (err) {
      console.error('[editarTecnico]', err)
      throw err
    }
  }, [])

  const eliminarTecnico = useCallback(async (id) => {
    try {
      await api.deleteTecnico(id)
      setTecnicos(prev => prev.filter(t => t.id !== id))
    } catch (err) {
      console.error('[eliminarTecnico]', err)
      throw err
    }
  }, [])

  const toggleTecnico = useCallback(async (id) => {
    try {
      const { activo } = await api.toggleTecnico(id)
      setTecnicos(prev => prev.map(t => t.id === id ? { ...t, activo } : t))
    } catch (err) {
      console.error('[toggleTecnico]', err)
    }
  }, [])

  // ── Lubricantes (siguen en localStorage) ────────────────────────────────────
  const crearLubricante = useCallback((datos) => {
    const nuevo = { id: `lub-${Date.now()}`, ...datos }
    setLubricantes(prev => {
      const next = [...prev, nuevo]
      localStorage.setItem('masterlub_lubricantes', JSON.stringify(next))
      return next
    })
  }, [])

  const editarLubricante = useCallback((id, datos) => {
    setLubricantes(prev => {
      const next = prev.map(l => l.id === id ? { ...l, ...datos } : l)
      localStorage.setItem('masterlub_lubricantes', JSON.stringify(next))
      return next
    })
  }, [])

  const eliminarLubricante = useCallback((id) => {
    setLubricantes(prev => {
      const next = prev.filter(l => l.id !== id)
      localStorage.setItem('masterlub_lubricantes', JSON.stringify(next))
      return next
    })
  }, [])

  return (
    <AdminContext.Provider value={{
      isLoggedIn, login, logout,
      equipos, crearEquipo, editarEquipo, eliminarEquipo,
      actualizarPuntos, actualizarImagenesEquipo,
      tecnicos, crearTecnico, editarTecnico, eliminarTecnico, toggleTecnico,
      lubricantes, crearLubricante, editarLubricante, eliminarLubricante,
      loading, error, recargar: cargarDatos,
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
