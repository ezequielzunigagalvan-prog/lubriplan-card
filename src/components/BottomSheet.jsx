import { useEffect, useRef, useState } from 'react'
import { FRECUENCIAS, METODOS } from '../data/equipos'
import { registrarLubricacion } from '../api/cardApi'

function MetodoIcon({ metodo }) {
  const icons = {
    grasa: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M14.5 3.5a3 3 0 0 1-3.5 4.5L6 13a2 2 0 1 1-1.5-1.5l5-5a3 3 0 0 1 4.5-3.5l-2 2 1.5 1.5 2-2z" stroke="#818cf8" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    aceite: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M9 2L13 8H5L9 2Z" stroke="#818cf8" strokeWidth="1.4" strokeLinejoin="round" />
        <rect x="6" y="8" width="6" height="8" rx="1" stroke="#818cf8" strokeWidth="1.4" />
      </svg>
    ),
    circulacion: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M3 9a6 6 0 0 1 11-3.3" stroke="#818cf8" strokeWidth="1.4" strokeLinecap="round" />
        <path d="M15 9a6 6 0 0 1-11 3.3" stroke="#818cf8" strokeWidth="1.4" strokeLinecap="round" />
        <path d="M13.7 5.7l.3 2.3-2.3.3" stroke="#818cf8" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M4.3 12.3l-.3-2.3 2.3-.3" stroke="#818cf8" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    inmersion: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M9 3C7 6 5 8 5 10.5a4 4 0 0 0 8 0C13 8 11 6 9 3z" stroke="#818cf8" strokeWidth="1.4" strokeLinejoin="round" />
        <path d="M6.5 11.5a2.5 2.5 0 0 0 3 1.5" stroke="#818cf8" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    ),
    niebla: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M3 7h12M4 10h10M6 13h6" stroke="#818cf8" strokeWidth="1.4" strokeLinecap="round" />
        <path d="M6 4c0-1 1-2 3-2s3.5 1 3.5 3c1.5 0 2.5 1 2.5 2H4C4 5.5 5 4 6 4z" stroke="#818cf8" strokeWidth="1.3" strokeLinejoin="round" />
      </svg>
    ),
    spray: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <rect x="3" y="9" width="7" height="7" rx="1.5" stroke="#818cf8" strokeWidth="1.4" />
        <path d="M7 9V6h5v3" stroke="#818cf8" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 6h1.5M12 9h2M12 7.5h1.5" stroke="#818cf8" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    ),
  }
  return icons[metodo] || icons.grasa
}

export default function BottomSheet({ punto, globalIndex, onClose, equipoId, tecnicoId }) {
  const sheetRef = useRef(null)
  const startYRef = useRef(null)
  const [dragging, setDragging] = useState(false)
  const [translateY, setTranslateY] = useState(0)
  const [registrando, setRegistrando] = useState(false)
  const [error, setError] = useState(null)
  const [exito, setExito] = useState(false)

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  const handleTouchStart = (e) => {
    startYRef.current = e.touches[0].clientY
    setDragging(true)
  }

  const handleTouchMove = (e) => {
    if (!dragging || startYRef.current === null) return
    const delta = e.touches[0].clientY - startYRef.current
    if (delta > 0) setTranslateY(delta)
  }

  const handleTouchEnd = () => {
    setDragging(false)
    if (translateY > 80) {
      onClose()
    } else {
      setTranslateY(0)
    }
  }

  if (!punto) return null

  const freq = FRECUENCIAS[punto.frecuencia]
  const metodo = METODOS[punto.metodo]

  return (
    <>
      <div
        className="animate-fade-in"
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.6)',
          zIndex: 40,
        }}
      />

      <div
        ref={sheetRef}
        className="animate-slide-up"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '65%',
          background: '#13112a',
          borderRadius: '24px 24px 0 0',
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          transform: `translateY(${translateY}px)`,
          transition: dragging ? 'none' : 'transform 0.2s ease',
          borderTop: '1px solid #2a2850',
        }}
      >
        {/* Drag handle */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          padding: '14px 0 10px',
          flexShrink: 0,
        }}>
          <div style={{
            width: 40,
            height: 4,
            borderRadius: 2,
            background: '#2a2850',
          }} />
        </div>

        {/* Scrollable content */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '8px 24px 40px',
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
        }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flex: 1, minWidth: 0 }}>
              {globalIndex != null && (
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: freq?.color || '#6366f1',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: 18, color: '#0c0a1e', fontWeight: 700,
                  flexShrink: 0, marginTop: 2,
                }}>
                  {globalIndex + 1}
                </div>
              )}
              <h2 style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 20,
                fontWeight: 700,
                color: '#e8eeff',
                lineHeight: 1.3,
                flex: 1,
              }}>
                {punto.nombre}
              </h2>
            </div>
            <button
              onClick={onClose}
              style={{
                background: '#1c1a3a',
                border: 'none',
                borderRadius: 10,
                width: 36,
                height: 36,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0,
                color: '#8892b0',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 2L12 12M12 2L2 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* Frequency badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: freq.bg,
            border: `1px solid ${freq.color}30`,
            borderRadius: 10,
            padding: '8px 14px',
            alignSelf: 'flex-start',
          }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: freq.color }} />
            <span style={{
              color: freq.color,
              fontSize: 14,
              fontWeight: 700,
              fontFamily: "'DM Sans', sans-serif",
            }}>
              {freq.label}
            </span>
          </div>

          {/* Info rows */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 0,
            background: '#1c1a3a',
            borderRadius: 14,
            overflow: 'hidden',
            border: '1px solid #2a2850',
          }}>
            <InfoRow
              icon={
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M3 9C3 6 6 3 9 3s6 3 6 6-3 6-6 6-6-3-6-6z" stroke="#818cf8" strokeWidth="1.4" />
                  <path d="M9 6v4M9 12h.01" stroke="#818cf8" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
              }
              label="Lubricante"
              value={punto.lubricante}
              last={false}
            />

            {punto.cantidad > 0 && (
              <InfoRow
                icon={
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M9 2L13 8H5L9 2Z" stroke="#818cf8" strokeWidth="1.4" strokeLinejoin="round" />
                    <rect x="6" y="8" width="6" height="8" rx="1" stroke="#818cf8" strokeWidth="1.4" />
                  </svg>
                }
                label="Cantidad"
                value={`${punto.cantidad} ${punto.unidad}`}
                last={false}
              />
            )}

            <InfoRow
              icon={<MetodoIcon metodo={punto.metodo} />}
              label="Método"
              value={metodo?.label || punto.metodo}
              last={true}
            />
          </div>

          {/* Technical notes */}
          {punto.notas && (
            <div style={{
              background: '#0c0a1e',
              borderRadius: 14,
              padding: '14px 16px',
              border: '1px solid #2a2850',
            }}>
              <div style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 1.5,
                color: '#8892b0',
                textTransform: 'uppercase',
                marginBottom: 8,
              }}>
                Notas técnicas
              </div>
              <p style={{
                fontSize: 14,
                color: '#b8c5e8',
                lineHeight: 1.6,
                fontFamily: "'DM Sans', sans-serif",
              }}>
                {punto.notas}
              </p>
            </div>
          )}

          {/* Botón Lubricado hoy */}
          <button
            style={{
              padding: '14px 16px',
              background: exito ? '#1f6b3f' : registrando ? '#164030' : '#1c3a2a',
              border: `1px solid ${exito ? 'rgba(34,197,94,0.6)' : 'rgba(34,197,94,0.3)'}`,
              borderRadius: 14,
              color: '#22C55E',
              fontSize: 14,
              fontWeight: 700,
              fontFamily: "'DM Sans', sans-serif",
              cursor: registrando ? 'wait' : 'pointer',
              transition: 'background 0.2s, border 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              opacity: registrando ? 0.7 : 1,
            }}
            onMouseEnter={e => !registrando && (e.currentTarget.style.background = '#1f4a36')}
            onMouseLeave={e => !registrando && (e.currentTarget.style.background = '#1c3a2a')}
            onClick={async () => {
              setRegistrando(true)
              setError(null)
              setExito(false)
              try {
                const tecId = tecnicoId || sessionStorage.getItem('tecnicoActivoId')
                if (!tecId || !equipoId || !punto.id) {
                  throw new Error('Faltan datos para registrar lubricación')
                }
                await registrarLubricacion(punto.id, equipoId, tecId, null)
                setExito(true)
                setTimeout(() => {
                  setExito(false)
                  onClose()
                }, 1500)
              } catch (err) {
                setError(err.message)
              } finally {
                setRegistrando(false)
              }
            }}
            disabled={registrando}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points={exito ? '20 6 9 17 4 12' : '20 6 9 17 4 12'}></polyline>
            </svg>
            {registrando ? 'Registrando...' : exito ? '✓ Registrado' : 'Marcar como lubricado hoy'}
          </button>
          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 8,
              padding: '8px 12px',
              color: '#EF4444',
              fontSize: 12,
              marginTop: 8,
            }}>
              {error}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

function InfoRow({ icon, label, value, last }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      padding: '14px 16px',
      borderBottom: last ? 'none' : '1px solid #2a2850',
    }}>
      <div style={{ width: 20, display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11, color: '#8892b0', fontWeight: 600, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 3 }}>
          {label}
        </div>
        <div style={{ fontSize: 15, color: '#e8eeff', fontWeight: 500, fontFamily: "'DM Sans', sans-serif" }}>
          {value}
        </div>
      </div>
    </div>
  )
}
