import { useState, useCallback, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { validatePin } from '../api/cardApi'

const KEYS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['', '0', 'DEL'],
]

export default function PinScreen() {
  const [pin,     setPin]     = useState('')
  const [error,   setError]   = useState(false)
  const [shake,   setShake]   = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const equipoParam = searchParams.get('equipo')

  const handleError = useCallback(() => {
    if (window.navigator.vibrate) window.navigator.vibrate([100, 50, 100])
    setShake(true)
    setError(true)
    setTimeout(() => { setPin(''); setShake(false); setError(false) }, 800)
  }, [])

  const handleKey = useCallback(async (key) => {
    if (loading) return
    if (error) setError(false)

    if (key === 'DEL') { setPin(p => p.slice(0, -1)); return }
    if (pin.length >= 4) return

    const newPin = pin + key
    setPin(newPin)

    if (newPin.length === 4) {
      setLoading(true)
      try {
        const tecnico = await validatePin(newPin)
        sessionStorage.setItem('tecnicoActivoId', tecnico.id)
        if (equipoParam) {
          navigate(`/carta/${equipoParam}`)
        } else {
          navigate('/areas')
        }
      } catch {
        handleError()
      } finally {
        setLoading(false)
      }
    }
  }, [pin, error, loading, navigate, equipoParam, handleError])

  useEffect(() => {
    const handler = (e) => {
      if (e.key >= '0' && e.key <= '9') handleKey(e.key)
      if (e.key === 'Backspace') handleKey('DEL')
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [handleKey])

  return (
    <div
      className="flex flex-col items-center justify-between h-full"
      style={{ background: '#0c0a1e', padding: '48px 24px 36px' }}
    >
      <div className="flex flex-col items-center gap-4">
        <img
          src="/logo.jpeg"
          alt="LubriPlan Card"
          style={{ width: 120, height: 120, borderRadius: '50%', objectFit: 'cover' }}
        />
      </div>

      <div className="flex flex-col items-center gap-6">
        <div className={shake ? 'animate-shake' : ''}>
          <div className="flex gap-4">
            {[0, 1, 2, 3].map(i => (
              <div
                key={i}
                style={{
                  width: 18, height: 18, borderRadius: '50%',
                  border: `2px solid ${error ? '#EF4444' : loading ? '#EAB308' : '#6366f1'}`,
                  background: pin.length > i
                    ? (error ? '#EF4444' : loading ? '#EAB308' : '#6366f1')
                    : 'transparent',
                  transition: 'background 0.15s, border-color 0.15s',
                }}
              />
            ))}
          </div>
        </div>

        {loading && (
          <span style={{ color: '#8892b0', fontSize: 13 }}>Verificando…</span>
        )}
        {error && !loading && (
          <span style={{ color: '#EF4444', fontSize: 14, fontWeight: 500, letterSpacing: 0.5 }}>
            PIN incorrecto
          </span>
        )}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 12, width: '100%', maxWidth: 300,
      }}>
        {KEYS.flat().map((key, idx) => {
          if (key === '') return <div key={idx} />
          return (
            <button
              key={idx}
              onClick={() => handleKey(key)}
              disabled={loading || key === '' || (key !== 'DEL' && pin.length >= 4)}
              style={{
                height: 76, borderRadius: 16, border: 'none',
                background: key === 'DEL' ? '#1c1a3a' : '#13112a',
                color: key === 'DEL' ? '#8892b0' : '#e8eeff',
                fontFamily: key === 'DEL' ? "'DM Sans', sans-serif" : "'Bebas Neue', sans-serif",
                fontSize: key === 'DEL' ? 13 : 28,
                fontWeight: key === 'DEL' ? 600 : 400,
                letterSpacing: key === 'DEL' ? 0.5 : 2,
                cursor: loading ? 'not-allowed' : 'pointer',
                userSelect: 'none', WebkitUserSelect: 'none',
                touchAction: 'manipulation',
                transition: 'background 0.1s, transform 0.08s',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
                opacity: loading ? 0.6 : 1,
              }}
              onPointerDown={e => {
                if (loading) return
                e.currentTarget.style.background = '#6366f1'
                e.currentTarget.style.color = '#0c0a1e'
                e.currentTarget.style.transform = 'scale(0.95)'
              }}
              onPointerUp={e => {
                e.currentTarget.style.background = key === 'DEL' ? '#1c1a3a' : '#13112a'
                e.currentTarget.style.color = key === 'DEL' ? '#8892b0' : '#e8eeff'
                e.currentTarget.style.transform = 'scale(1)'
              }}
              onPointerLeave={e => {
                e.currentTarget.style.background = key === 'DEL' ? '#1c1a3a' : '#13112a'
                e.currentTarget.style.color = key === 'DEL' ? '#8892b0' : '#e8eeff'
                e.currentTarget.style.transform = 'scale(1)'
              }}
            >
              {key === 'DEL' ? (
                <svg width="22" height="16" viewBox="0 0 22 16" fill="none">
                  <path d="M8 1L1 8L8 15H21V1H8Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                  <path d="M13 5L17 10M17 5L13 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              ) : key}
            </button>
          )
        })}
      </div>
    </div>
  )
}
