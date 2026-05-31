import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdmin } from '../admin/context/AdminContext'

export default function SyncPage() {
  const navigate = useNavigate()
  const { importarConfig } = useAdmin()
  const [estado, setEstado] = useState('procesando')
  const [stats, setStats] = useState(null)

  useEffect(() => {
    const raw = window.location.hash.slice(1)
    if (!raw) { setEstado('vacio'); return }

    try {
      const b64 = raw.replace(/-/g, '+').replace(/_/g, '/')
      const padded = b64 + '==='.slice((b64.length + 3) % 4)
      const json = decodeURIComponent(escape(atob(padded)))
      const data = JSON.parse(json)

      // Update AdminContext state (triggers persistirEquipos with full data incl. images)
      importarConfig(data)

      setStats({ equipos: data.equipos?.length ?? 0, tecnicos: data.tecnicos?.length ?? 0 })
      setEstado('ok')
      setTimeout(() => navigate('/pin'), 2800)
    } catch {
      setEstado('error')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const BG = '#0c0a1e'
  const ACCENT = '#6366f1'
  const TEXT_SUB = '#8892b0'

  return (
    <div style={{
      height: '100%', background: BG,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: 24, padding: 32, textAlign: 'center',
    }}>
      {estado === 'procesando' && (
        <>
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            border: `3px solid ${ACCENT}`,
            borderTopColor: 'transparent',
            animation: 'spin 0.9s linear infinite',
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          <p style={{ color: TEXT_SUB, fontSize: 15, margin: 0 }}>Importando configuración…</p>
        </>
      )}

      {estado === 'ok' && (
        <>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'rgba(34,197,94,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path d="M7 16l7 7 11-13" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <p style={{ color: '#22C55E', fontSize: 17, fontWeight: 700, margin: '0 0 6px', fontFamily: "'DM Sans', sans-serif" }}>
              ¡Configuración importada!
            </p>
            <p style={{ color: TEXT_SUB, fontSize: 13, margin: 0 }}>
              {stats?.equipos} equipo{stats?.equipos !== 1 ? 's' : ''} · {stats?.tecnicos} técnico{stats?.tecnicos !== 1 ? 's' : ''}
            </p>
          </div>
          <p style={{ color: TEXT_SUB, fontSize: 12, margin: 0 }}>Redirigiendo al PIN…</p>
        </>
      )}

      {(estado === 'error' || estado === 'vacio') && (
        <>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'rgba(239,68,68,0.10)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
              <path d="M15 9v8M15 21h.01" stroke="#EF4444" strokeWidth="2.2" strokeLinecap="round" />
              <circle cx="15" cy="15" r="13" stroke="#EF4444" strokeWidth="1.8" />
            </svg>
          </div>
          <div>
            <p style={{ color: '#EF4444', fontSize: 16, fontWeight: 600, margin: '0 0 6px' }}>
              Enlace inválido
            </p>
            <p style={{ color: TEXT_SUB, fontSize: 13, margin: 0 }}>
              Pedí al administrador un nuevo enlace de sincronización.
            </p>
          </div>
          <button
            onClick={() => navigate('/pin')}
            style={{
              padding: '12px 28px', borderRadius: 10, border: 'none',
              background: ACCENT, color: '#fff', fontSize: 14, fontWeight: 700,
              cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Ir al inicio
          </button>
        </>
      )}
    </div>
  )
}
