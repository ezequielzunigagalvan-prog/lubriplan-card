import { useState, useCallback, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAdmin } from '../admin/context/AdminContext'

const KEYS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['', '0', 'DEL'],
]

export default function PinScreen() {
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)
  const [shake, setShake] = useState(false)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const equipoParam = searchParams.get('equipo')
  const { tecnicos } = useAdmin()

  const handleKey = useCallback((key) => {
    if (error) setError(false)

    if (key === 'DEL') {
      setPin(p => p.slice(0, -1))
      return
    }
    if (pin.length >= 4) return

    const newPin = pin + key

    if (newPin.length === 4) {
      const pinValido = tecnicos.some(t => t.activo && t.pin === newPin)
      if (pinValido) {
        if (equipoParam) {
          navigate(`/carta/${equipoParam}`)
        } else {
          navigate('/areas')
        }
      } else {
        if (window.navigator.vibrate) window.navigator.vibrate([100, 50, 100])
        setShake(true)
        setError(true)
        setTimeout(() => {
          setPin('')
          setShake(false)
          setError(false)
        }, 800)
      }
    } else {
      setPin(newPin)
    }
  }, [pin, error, navigate, equipoParam, tecnicos])

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
      style={{ background: '#0A0C0F', padding: '48px 24px 36px' }}
    >
      {/* Logo */}
      <div className="flex flex-col items-center gap-4">
        <img
          src="/logo.jpeg"
          alt="LubriPlan Card"
          style={{ width: 120, height: 120, borderRadius: '50%', objectFit: 'cover' }}
        />
      </div>

      {/* PIN indicator + error */}
      <div className="flex flex-col items-center gap-6">
        <div className={shake ? 'animate-shake' : ''}>
          <div className="flex gap-4">
            {[0, 1, 2, 3].map(i => (
              <div
                key={i}
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  border: `2px solid ${error ? '#EF4444' : '#F4A020'}`,
                  background: pin.length > i
                    ? (error ? '#EF4444' : '#F4A020')
                    : 'transparent',
                  transition: 'background 0.15s, border-color 0.15s',
                }}
              />
            ))}
          </div>
        </div>

        {error && (
          <span
            style={{
              color: '#EF4444',
              fontSize: 14,
              fontWeight: 500,
              letterSpacing: 0.5,
            }}
          >
            PIN incorrecto
          </span>
        )}
      </div>

      {/* Keypad */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 12,
          width: '100%',
          maxWidth: 300,
        }}
      >
        {KEYS.flat().map((key, idx) => {
          if (key === '') {
            return <div key={idx} />
          }
          return (
            <button
              key={idx}
              onClick={() => handleKey(key)}
              disabled={key === '' || (key !== 'DEL' && pin.length >= 4)}
              style={{
                height: 76,
                borderRadius: 16,
                border: 'none',
                background: key === 'DEL' ? '#1C2230' : '#131820',
                color: key === 'DEL' ? '#7A8BA8' : '#E8EDF5',
                fontFamily: key === 'DEL' ? "'DM Sans', sans-serif" : "'Bebas Neue', sans-serif",
                fontSize: key === 'DEL' ? 13 : 28,
                fontWeight: key === 'DEL' ? 600 : 400,
                letterSpacing: key === 'DEL' ? 0.5 : 2,
                cursor: 'pointer',
                userSelect: 'none',
                WebkitUserSelect: 'none',
                touchAction: 'manipulation',
                transition: 'background 0.1s, transform 0.08s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
              }}
              onPointerDown={e => {
                e.currentTarget.style.background = '#F4A020'
                e.currentTarget.style.color = '#0A0C0F'
                e.currentTarget.style.transform = 'scale(0.95)'
              }}
              onPointerUp={e => {
                e.currentTarget.style.background = key === 'DEL' ? '#1C2230' : '#131820'
                e.currentTarget.style.color = key === 'DEL' ? '#7A8BA8' : '#E8EDF5'
                e.currentTarget.style.transform = 'scale(1)'
              }}
              onPointerLeave={e => {
                e.currentTarget.style.background = key === 'DEL' ? '#1C2230' : '#131820'
                e.currentTarget.style.color = key === 'DEL' ? '#7A8BA8' : '#E8EDF5'
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
