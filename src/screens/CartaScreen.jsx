import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FRECUENCIAS } from '../data/equipos'
import { getEquipo } from '../api/cardApi'
import EquipoSVG from '../components/EquipoSVG'
import BottomSheet from '../components/BottomSheet'

const BG = '#0c0a1e'
const BG_HERO = '#111027'
const BG_CARD = '#13112a'
const BORDER = '#2a2850'
const ACCENT = '#6366f1'
const ACCENT_L = '#818cf8'
const TEXT = '#e8eeff'
const TEXT_SUB = '#8892b0'
const TEXT_MUTED = '#4a5070'
const ORANGE = '#F4A020'

// ---------- Point marker ----------
function PuntoMarcador({ punto, globalIndex, activo, onClick }) {
  const freq = FRECUENCIAS[punto.frecuencia] || { color: '#7A8BA8' }
  return (
    <button
      onClick={onClick}
      style={{
        position: 'absolute',
        left: `${punto.x}%`,
        top: `${punto.y}%`,
        transform: 'translate(-50%, -50%)',
        width: activo ? 40 : 34,
        height: activo ? 40 : 34,
        borderRadius: '50%',
        background: freq.color,
        border: activo ? '3px solid #fff' : '2.5px solid rgba(255,255,255,0.35)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: 15,
        color: '#0A0C0F',
        fontWeight: 700,
        zIndex: 10,
        animation: activo ? 'none' : 'pulse-dot 2.4s ease-in-out infinite',
        boxShadow: activo
          ? `0 0 0 5px ${freq.color}40, 0 2px 16px rgba(0,0,0,0.6)`
          : `0 0 14px ${freq.color}90, 0 2px 8px rgba(0,0,0,0.5)`,
        padding: 0,
        lineHeight: 1,
        transition: 'width 0.15s, height 0.15s, box-shadow 0.15s',
        pointerEvents: 'auto',
      }}
    >
      {globalIndex + 1}
    </button>
  )
}

// ---------- Compact point row ----------
function PuntoRow({ punto, globalIndex, onClick }) {
  const freq = FRECUENCIAS[punto.frecuencia] || { color: '#7A8BA8', bg: '#1E2535', label: punto.frecuencia }
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        width: '100%',
        padding: '11px 16px',
        background: 'transparent',
        border: 'none',
        borderBottom: `1px solid ${BORDER}`,
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'background 0.12s',
      }}
      onPointerDown={e => e.currentTarget.style.background = 'rgba(99,102,241,0.07)'}
      onPointerUp={e => e.currentTarget.style.background = 'transparent'}
      onPointerLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      <div style={{
        width: 30, height: 30, borderRadius: '50%',
        background: freq.color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: 14, color: '#0A0C0F', fontWeight: 700,
        flexShrink: 0,
      }}>
        {globalIndex + 1}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 14, fontWeight: 600, color: TEXT,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          fontFamily: "'DM Sans', sans-serif",
        }}>
          {punto.nombre}
        </div>
        {punto.lubricante && (
          <div style={{ fontSize: 12, color: TEXT_SUB, marginTop: 1 }}>
            {punto.lubricante}
            {punto.cantidad > 0 ? ` · ${punto.cantidad} ${punto.unidad}` : ''}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
        <span style={{
          background: freq.bg, color: freq.color,
          fontSize: 10, fontWeight: 700,
          padding: '3px 7px', borderRadius: 6,
          fontFamily: "'DM Sans', sans-serif",
        }}>
          {freq.label}
        </span>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M5 3l4 4-4 4" stroke={TEXT_MUTED} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </button>
  )
}

// ---------- Main screen ----------
function decodeEquipoFromParam(encoded) {
  try {
    const b64 = encoded.replace(/-/g, '+').replace(/_/g, '/')
    const padded = b64 + '==='.slice((b64.length + 3) % 4)
    return JSON.parse(decodeURIComponent(escape(atob(padded))))
  } catch {
    return null
  }
}

export default function CartaScreen() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [equipo,   setEquipo]   = useState(null)
  const [fetching, setFetching] = useState(true)
  const [fetchErr, setFetchErr] = useState(null)

  const imgElRef  = useRef(null)
  const heroRef   = useRef(null)
  const swipeStartX   = useRef(null)
  const imagenesCountRef = useRef(0)

  const [puntoActivo,  setPuntoActivo]  = useState(null)
  const [imgActivaIdx, setImgActivaIdx] = useState(0)
  const [imgNaturalSize, setImgNaturalSize] = useState(null)
  const [viewerImgRect,  setViewerImgRect]  = useState(null)
  const [listaAbierta, setListaAbierta] = useState(false)

  // Carga el equipo desde la API pública (funciona en cualquier dispositivo)
  useEffect(() => {
    setFetching(true)
    setFetchErr(null)
    setEquipo(null)
    getEquipo(id)
      .then(setEquipo)
      .catch(err => setFetchErr(err.message))
      .finally(() => setFetching(false))
  }, [id])

  // Get natural dimensions — works for both sync (data URL) and async image decoding
  useEffect(() => {
    setImgNaturalSize(null)
    setViewerImgRect(null)
    const img = imgElRef.current
    if (!img) return
    if (img.naturalWidth > 0 && img.naturalHeight > 0) {
      setImgNaturalSize({ w: img.naturalWidth, h: img.naturalHeight })
      return
    }
    let cancelled = false
    let tries = 0
    let rafId
    const check = () => {
      if (cancelled) return
      const el = imgElRef.current
      if (el?.naturalWidth > 0 && el?.naturalHeight > 0) {
        setImgNaturalSize({ w: el.naturalWidth, h: el.naturalHeight })
        return
      }
      if (tries++ < 60) rafId = requestAnimationFrame(check)
    }
    rafId = requestAnimationFrame(check)
    return () => { cancelled = true; cancelAnimationFrame(rafId) }
  }, [imgActivaIdx])

  const handleImgLoad = useCallback((e) => {
    if (e.target.naturalWidth > 0) {
      setImgNaturalSize({ w: e.target.naturalWidth, h: e.target.naturalHeight })
    }
  }, [])

  // Compute pixel rect of rendered image (objectFit:contain) inside hero
  const computeHeroRect = useCallback(() => {
    const hero = heroRef.current
    if (!hero || !imgNaturalSize) { setViewerImgRect(null); return }
    const { width: cW, height: cH } = hero.getBoundingClientRect()
    if (!cW || !cH) return
    const { w: iW, h: iH } = imgNaturalSize
    const iA = iW / iH, cA = cW / cH
    let rW, rH, oX, oY
    if (iA > cA) { rW = cW; rH = cW / iA; oX = 0; oY = (cH - rH) / 2 }
    else         { rH = cH; rW = cH * iA; oX = (cW - rW) / 2; oY = 0 }
    setViewerImgRect({ left: oX, top: oY, width: rW, height: rH })
  }, [imgNaturalSize])

  useEffect(() => { computeHeroRect() }, [computeHeroRect])
  useEffect(() => {
    const el = heroRef.current
    if (!el || !imgNaturalSize) return
    const ro = new ResizeObserver(computeHeroRect)
    ro.observe(el)
    return () => ro.disconnect()
  }, [imgNaturalSize, computeHeroRect])

  const handleHeroTouchStart = useCallback((e) => {
    swipeStartX.current = e.touches[0].clientX
  }, [])

  const handleHeroTouchEnd = useCallback((e) => {
    if (swipeStartX.current === null) return
    const dx = e.changedTouches[0].clientX - swipeStartX.current
    if (Math.abs(dx) > 50) {
      if (dx < 0) setImgActivaIdx(i => Math.min(i + 1, imagenesCountRef.current - 1))
      else setImgActivaIdx(i => Math.max(0, i - 1))
    }
    swipeStartX.current = null
  }, [])

  // Hooks que dependen de equipo — deben estar antes de cualquier early return
  const imageIds = useMemo(
    () => new Set((equipo?.imagenes || []).map(img => img.id)),
    [equipo?.imagenes]
  )

  const frecuenciasPresentes = useMemo(() => {
    const present = new Set((equipo?.puntos || []).map(p => p.frecuencia))
    return Object.entries(FRECUENCIAS).filter(([k]) => present.has(k))
  }, [equipo?.puntos])

  useEffect(() => {
    if (!equipo) return
    const imgs = equipo.imagenes?.length > 0
      ? equipo.imagenes
      : equipo.imagenUrl ? [{ id: 'legacy', url: equipo.imagenUrl, flechas: [] }] : []
    if (imgs.length === 0) setListaAbierta(true)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [equipo?.id])

  // Pantalla de carga
  if (fetching) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', background: BG }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', border: `3px solid ${ACCENT}`, borderTopColor: 'transparent', animation: 'spin 0.9s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  if (!equipo || fetchErr) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        height: '100%', gap: 16, background: BG, color: TEXT_SUB,
      }}>
        <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
          <circle cx="28" cy="28" r="26" stroke={BORDER} strokeWidth="2" />
          <path d="M28 18v14M28 38h.01" stroke={TEXT_SUB} strokeWidth="2.5" strokeLinecap="round" />
        </svg>
        <p style={{ fontSize: 16, margin: 0 }}>{fetchErr || 'Equipo no encontrado'}</p>
        <button onClick={() => navigate(-1)} style={{
          background: ACCENT, color: '#fff', border: 'none',
          borderRadius: 12, padding: '12px 28px', fontWeight: 700,
          cursor: 'pointer', fontSize: 15,
        }}>
          Volver
        </button>
      </div>
    )
  }

  const imagenes = equipo.imagenes?.length > 0
    ? equipo.imagenes
    : equipo.imagenUrl
      ? [{ id: 'legacy', url: equipo.imagenUrl, flechas: [] }]
      : []

  imagenesCountRef.current = imagenes.length

  const imgActiva = imagenes[imgActivaIdx] || null
  const flechas = imgActiva?.flechas || []

  const puntosDeLaImagen = imagenes.length === 0
    ? equipo.puntos
    : equipo.puntos.filter(p =>
        imgActiva && (
          p.imagenId === imgActiva.id ||
          (!imageIds.has(p.imagenId) && imgActivaIdx === 0)
        )
      )

  const puntoActivoGlobalIdx = puntoActivo ? equipo.puntos.indexOf(puntoActivo) : -1

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      height: '100%', background: BG,
      overflow: 'hidden', position: 'relative',
    }}>

      {/* ══ HERO ══ */}
      <div
        ref={heroRef}
        onTouchStart={handleHeroTouchStart}
        onTouchEnd={handleHeroTouchEnd}
        style={{
          position: 'relative',
          flexShrink: 0,
          height: '58vh',
          minHeight: 290,
          background: BG_HERO,
        }}
      >

        {/* Image */}
        <div style={{ position: 'absolute', inset: 0 }}>
          {imgActiva
            ? (
              <img
                key={imgActiva.id}
                ref={imgElRef}
                src={imgActiva.url}
                alt={equipo.nombre}
                onLoad={handleImgLoad}
                style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
              />
            )
            : (
              <div style={{ padding: '40px 24px 24px', width: '100%', height: '100%', boxSizing: 'border-box' }}>
                <EquipoSVG tipo={equipo.imagen} showName={false} />
              </div>
            )
          }
        </div>

        {/* Gradients */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 130,
          background: 'linear-gradient(to bottom, rgba(12,10,30,0.95) 0%, rgba(12,10,30,0.5) 60%, transparent 100%)',
          pointerEvents: 'none', zIndex: 6,
        }} />
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 60,
          background: 'linear-gradient(to top, rgba(12,10,30,0.85) 0%, transparent 100%)',
          pointerEvents: 'none', zIndex: 6,
        }} />

        {/* ── Overlay: pixel-perfect rect matching objectFit:contain area ── */}
        {/* viewerImgRect computed via JS (ResizeObserver). CSS aspect-ratio  */}
        {/* alone collapses to 0×0 on flex items without explicit dimensions.  */}
        {imgActiva && viewerImgRect && (
          <div style={{
            position: 'absolute',
            left: viewerImgRect.left,
            top: viewerImgRect.top,
            width: viewerImgRect.width,
            height: viewerImgRect.height,
            zIndex: 8,
            pointerEvents: 'none',
          }}>
            {/* SVG arrows */}
            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', overflow: 'visible' }}>
              <defs>
                <marker id="arrowhead-view" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                  <polygon points="0 0, 8 3, 0 6" fill={ORANGE} />
                </marker>
              </defs>
              {flechas.map(f => (
                <line
                  key={f.id}
                  x1={`${f.x1}%`} y1={`${f.y1}%`}
                  x2={`${f.x2}%`} y2={`${f.y2}%`}
                  stroke={ORANGE}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeDasharray={f.tipo === 'linea' ? '7 5' : undefined}
                  markerEnd={f.tipo === 'flecha' ? 'url(#arrowhead-view)' : undefined}
                  opacity="0.9"
                />
              ))}
            </svg>
            {/* Point markers */}
            {puntosDeLaImagen.map((punto) => (
              <PuntoMarcador
                key={punto.id}
                punto={punto}
                globalIndex={equipo.puntos.indexOf(punto)}
                activo={puntoActivo?.id === punto.id}
                onClick={() => setPuntoActivo(puntoActivo?.id === punto.id ? null : punto)}
              />
            ))}
          </div>
        )}

        {/* Points over SVG placeholder (no image) */}
        {!imgActiva && puntosDeLaImagen.map((punto) => (
          <PuntoMarcador
            key={punto.id}
            punto={punto}
            globalIndex={equipo.puntos.indexOf(punto)}
            activo={puntoActivo?.id === punto.id}
            onClick={() => setPuntoActivo(puntoActivo?.id === punto.id ? null : punto)}
          />
        ))}

        {/* Floating header */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          padding: '48px 16px 0',
          zIndex: 12,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <button
            onClick={() => {
              sessionStorage.removeItem('tecnicoActivoId')
              navigate('/pin', { replace: true })
            }}
            style={{
              width: 38, height: 38, borderRadius: 10,
              background: 'rgba(12,10,30,0.8)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              border: `1px solid ${BORDER}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', flexShrink: 0, color: TEXT,
            }}
            title="Volver"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M12 3L6 9L12 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 15, fontWeight: 700, color: TEXT,
              fontFamily: "'DM Sans', sans-serif",
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              textShadow: '0 1px 4px rgba(0,0,0,0.6)',
            }}>
              {equipo.nombre}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 3 }}>
              {equipo.codigo && (
                <span style={{
                  fontFamily: 'monospace', fontSize: 10, fontWeight: 700,
                  color: ACCENT_L, letterSpacing: 1,
                  background: 'rgba(99,102,241,0.18)', borderRadius: 4,
                  padding: '1px 6px', border: '1px solid rgba(99,102,241,0.3)',
                }}>
                  {equipo.codigo}
                </span>
              )}
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{equipo.area}</span>
            </div>
          </div>

          <button
            onClick={() => window.print()}
            style={{
              width: 38, height: 38, borderRadius: 10,
              background: 'rgba(12,10,30,0.8)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              border: `1px solid ${BORDER}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', flexShrink: 0, color: 'rgba(255,255,255,0.55)',
            }}
            title="Imprimir"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M5 6V2h8v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <rect x="2" y="6" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="1.5" />
              <path d="M5 11h8M5 14h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>

          <button
            onClick={() => {
              sessionStorage.removeItem('tecnicoActivoId')
              navigate('/pin', { replace: true })
            }}
            style={{
              padding: '8px 14px', borderRadius: 10,
              background: 'rgba(239,68,68,0.15)',
              border: '1px solid rgba(239,68,68,0.3)',
              color: '#EF4444', fontSize: 12, fontWeight: 600,
              cursor: 'pointer', flexShrink: 0,
              fontFamily: "'DM Sans', sans-serif",
            }}
            title="Cerrar sesión"
          >
            Salir
          </button>
        </div>

        {/* Multi-image nav */}
        {imagenes.length > 1 && (
          <>
            <button
              onClick={() => setImgActivaIdx(i => Math.max(0, i - 1))}
              disabled={imgActivaIdx === 0}
              style={{
                position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                width: 32, height: 32, borderRadius: '50%',
                background: 'rgba(12,10,30,0.75)', border: `1px solid ${BORDER}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: imgActivaIdx === 0 ? 'default' : 'pointer',
                zIndex: 12, color: imgActivaIdx === 0 ? 'rgba(255,255,255,0.2)' : TEXT,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M9 2L5 7l4 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <button
              onClick={() => setImgActivaIdx(i => Math.min(imagenes.length - 1, i + 1))}
              disabled={imgActivaIdx === imagenes.length - 1}
              style={{
                position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                width: 32, height: 32, borderRadius: '50%',
                background: 'rgba(12,10,30,0.75)', border: `1px solid ${BORDER}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: imgActivaIdx === imagenes.length - 1 ? 'default' : 'pointer',
                zIndex: 12, color: imgActivaIdx === imagenes.length - 1 ? 'rgba(255,255,255,0.2)' : TEXT,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M5 2l4 5-4 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <div style={{
              position: 'absolute', bottom: 14, left: 0, right: 0,
              display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, zIndex: 12,
            }}>
              <span style={{ fontSize: 11, color: TEXT_SUB, fontWeight: 600 }}>
                Imagen {imgActivaIdx + 1}/{imagenes.length}
              </span>
              <div style={{ display: 'flex', gap: 6 }}>
                {imagenes.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setImgActivaIdx(i)}
                    style={{
                      width: i === imgActivaIdx ? 20 : 6, height: 6, borderRadius: 3,
                      background: i === imgActivaIdx ? ACCENT_L : 'rgba(255,255,255,0.3)',
                      border: 'none', cursor: 'pointer', padding: 0,
                      transition: 'width 0.2s, background 0.2s',
                    }}
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* ══ BOTTOM PANEL ══ */}
      <div style={{
        flex: 1, overflowY: 'auto', background: BG,
        display: 'flex', flexDirection: 'column',
      }}>

        {/* Frequencies legend */}
        {frecuenciasPresentes.length > 0 && (
          <div style={{
            display: 'flex', gap: '6px 14px', flexWrap: 'wrap',
            padding: '10px 16px',
            background: BG_CARD,
            borderBottom: `1px solid ${BORDER}`,
          }}>
            {frecuenciasPresentes.map(([key, val]) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: val.color, flexShrink: 0 }} />
                <span style={{ fontSize: 11, color: TEXT_SUB, fontFamily: "'DM Sans', sans-serif" }}>
                  {val.label}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Points list */}
        <div style={{ flex: 1 }}>
          <button
            onClick={() => setListaAbierta(o => !o)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              width: '100%', padding: '14px 16px',
              background: 'transparent', border: 'none',
              borderBottom: listaAbierta ? `1px solid ${BORDER}` : 'none',
              cursor: 'pointer', textAlign: 'left',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 13, fontWeight: 700, color: TEXT,
                textTransform: 'uppercase', letterSpacing: 1,
              }}>
                Puntos de lubricación
              </span>
              <span style={{
                background: ACCENT, color: '#fff',
                fontSize: 11, fontWeight: 800,
                padding: '1px 8px', borderRadius: 20,
                fontFamily: "'DM Sans', sans-serif",
              }}>
                {equipo.puntos.length}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {!listaAbierta && (
                <div style={{ display: 'flex', gap: 3 }}>
                  {equipo.puntos.slice(0, 8).map((p, i) => {
                    const freq = FRECUENCIAS[p.frecuencia]
                    return (
                      <div key={i} style={{
                        width: 8, height: 8, borderRadius: '50%',
                        background: freq?.color || TEXT_SUB,
                      }} />
                    )
                  })}
                </div>
              )}
              <svg
                width="18" height="18" viewBox="0 0 18 18" fill="none"
                style={{ transition: 'transform 0.2s', transform: listaAbierta ? 'rotate(180deg)' : 'rotate(0deg)' }}
              >
                <path d="M4 7l5 5 5-5" stroke={TEXT_SUB} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </button>

          {listaAbierta && (
            <div>
              {equipo.puntos.map((punto, i) => (
                <PuntoRow
                  key={punto.id}
                  punto={punto}
                  globalIndex={i}
                  onClick={() => setPuntoActivo(punto)}
                />
              ))}
              <div style={{ height: 24 }} />
            </div>
          )}

          {!listaAbierta && (
            <div style={{
              padding: '4px 16px 16px',
              fontSize: 12, color: TEXT_MUTED,
              fontFamily: "'DM Sans', sans-serif",
            }}>
              Toca un punto en la imagen o despliega la lista
            </div>
          )}
        </div>
      </div>

      {puntoActivo && (
        <BottomSheet
          punto={puntoActivo}
          globalIndex={puntoActivoGlobalIdx}
          onClose={() => setPuntoActivo(null)}
          equipoId={id}
          tecnicoId={sessionStorage.getItem('tecnicoActivoId')}
        />
      )}
    </div>
  )
}
