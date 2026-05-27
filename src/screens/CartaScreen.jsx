import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FRECUENCIAS } from '../data/equipos'
import { useAdmin } from '../admin/context/AdminContext'
import EquipoSVG from '../components/EquipoSVG'
import BottomSheet from '../components/BottomSheet'

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
        borderBottom: '1px solid #1A2030',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'background 0.12s',
      }}
      onPointerDown={e => e.currentTarget.style.background = 'rgba(244,160,32,0.06)'}
      onPointerUp={e => e.currentTarget.style.background = 'transparent'}
      onPointerLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      {/* Number badge */}
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

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 14, fontWeight: 600, color: '#E8EDF5',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          fontFamily: "'DM Sans', sans-serif",
        }}>
          {punto.nombre}
        </div>
        {punto.lubricante && (
          <div style={{ fontSize: 12, color: '#7A8BA8', marginTop: 1 }}>
            {punto.lubricante}
            {punto.cantidad > 0 ? ` · ${punto.cantidad} ${punto.unidad}` : ''}
          </div>
        )}
      </div>

      {/* Freq badge + chevron */}
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
          <path d="M5 3l4 4-4 4" stroke="#4A5568" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </button>
  )
}

// ---------- Main screen ----------
export default function CartaScreen() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { equipos, editarTecnico } = useAdmin()

  const heroRef = useRef(null)
  const imgElRef = useRef(null)
  const swipeStartX = useRef(null)
  const [puntoActivo, setPuntoActivo] = useState(null)
  const [imgActivaIdx, setImgActivaIdx] = useState(0)
  const [imgRect, setImgRect] = useState(null)
  const [listaAbierta, setListaAbierta] = useState(false)

  // Reset imgRect when switching images
  useEffect(() => { setImgRect(null) }, [imgActivaIdx])

  // Register technician's last activity
  useEffect(() => {
    const tecId = sessionStorage.getItem('tecnicoActivoId')
    if (tecId) {
      editarTecnico(tecId, { ultimaConsulta: new Date().toISOString().split('T')[0] })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const calcImgRect = useCallback((imgEl) => {
    const container = heroRef.current
    if (!container || !imgEl) return
    const cW = container.clientWidth
    const cH = container.clientHeight
    const iW = imgEl.naturalWidth
    const iH = imgEl.naturalHeight
    if (!iW || !iH) return
    const iAspect = iW / iH
    const cAspect = cW / cH
    let rW, rH
    if (iAspect > cAspect) { rW = cW; rH = cW / iAspect }
    else { rH = cH; rW = cH * iAspect }
    setImgRect({ left: (cW - rW) / 2, top: (cH - rH) / 2, width: rW, height: rH })
  }, [])

  const handleImgLoad = useCallback((e) => {
    calcImgRect(e.target)
  }, [calcImgRect])

  // Fallback for already-loaded images (data URLs load synchronously before onLoad fires)
  useEffect(() => {
    const img = imgElRef.current
    if (!img || imgRect) return
    if (img.complete && img.naturalWidth > 0) {
      calcImgRect(img)
    }
  }, [imgActivaIdx, imgRect, calcImgRect])

  // Swipe horizontal para navegar imágenes
  const handleHeroTouchStart = useCallback((e) => {
    swipeStartX.current = e.touches[0].clientX
  }, [])

  const handleHeroTouchEnd = useCallback((e) => {
    if (swipeStartX.current === null) return
    const dx = e.changedTouches[0].clientX - swipeStartX.current
    if (Math.abs(dx) > 50) {
      if (dx < 0) setImgActivaIdx(i => Math.min(i + 1, imagenes.length - 1))
      else setImgActivaIdx(i => Math.max(0, i - 1))
    }
    swipeStartX.current = null
  }, [imagenes.length])

  const equipo = equipos.find(e => e.id === id)

  if (!equipo) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        height: '100%', gap: 16, background: '#0A0C0F', color: '#7A8BA8',
      }}>
        <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
          <circle cx="28" cy="28" r="26" stroke="#2A3448" strokeWidth="2" />
          <path d="M28 18v14M28 38h.01" stroke="#7A8BA8" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
        <p style={{ fontSize: 16, margin: 0 }}>Equipo no encontrado</p>
        <button onClick={() => navigate(-1)} style={{
          background: '#F4A020', color: '#0A0C0F', border: 'none',
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

  const imgActiva = imagenes[imgActivaIdx] || null
  const flechas = imgActiva?.flechas || []

  const imageIds = useMemo(() => new Set(imagenes.map(img => img.id)), [imagenes])
  const puntosDeLaImagen = imagenes.length === 0
    ? equipo.puntos
    : equipo.puntos.filter(p =>
        imgActiva && (
          p.imagenId === imgActiva.id ||
          // Points with no imagenId OR orphaned imagenId show on first image
          (!imageIds.has(p.imagenId) && imgActivaIdx === 0)
        )
      )

  // Auto-open list when there are no images
  useEffect(() => {
    if (imagenes.length === 0) setListaAbierta(true)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [equipo.id])

  // Only frequencies actually present in this equipo
  const frecuenciasPresentes = useMemo(() => {
    const present = new Set(equipo.puntos.map(p => p.frecuencia))
    return Object.entries(FRECUENCIAS).filter(([k]) => present.has(k))
  }, [equipo.puntos])

  const puntoActivoGlobalIdx = puntoActivo ? equipo.puntos.indexOf(puntoActivo) : -1

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      height: '100%', background: '#080A0E',
      overflow: 'hidden', position: 'relative',
    }}>

      {/* ══════════════════════════════════════════
          HERO IMAGE SECTION
      ══════════════════════════════════════════ */}
      <div
        ref={heroRef}
        onTouchStart={handleHeroTouchStart}
        onTouchEnd={handleHeroTouchEnd}
        style={{
          position: 'relative',
          flexShrink: 0,
          height: '58vh',
          minHeight: 290,
          background: '#0D1117',
        }}
      >

        {/* Image / SVG */}
        <div style={{ position: 'absolute', inset: 0 }}>
          {imgActiva
            ? (
              <img
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

        {/* Top gradient for header readability */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 130,
          background: 'linear-gradient(to bottom, rgba(8,10,14,0.92) 0%, rgba(8,10,14,0.6) 60%, transparent 100%)',
          pointerEvents: 'none', zIndex: 6,
        }} />

        {/* Bottom gradient (subtle) */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 60,
          background: 'linear-gradient(to top, rgba(8,10,14,0.8) 0%, transparent 100%)',
          pointerEvents: 'none', zIndex: 6,
        }} />

        {/* ── Arrows + points overlay (positioned exactly on rendered image) ── */}
        {imgActiva && imgRect && (
          <div style={{
            position: 'absolute',
            left: imgRect.left, top: imgRect.top,
            width: imgRect.width, height: imgRect.height,
            zIndex: 8,
          }}>
            {/* SVG arrows */}
            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', overflow: 'visible' }}>
              <defs>
                <marker id="arrowhead-view" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                  <polygon points="0 0, 8 3, 0 6" fill="#F4A020" />
                </marker>
              </defs>
              {flechas.map(f => (
                <line
                  key={f.id}
                  x1={`${f.x1}%`} y1={`${f.y1}%`}
                  x2={`${f.x2}%`} y2={`${f.y2}%`}
                  stroke="#F4A020"
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

        {/* ── Point markers for SVG placeholder (no image) ── */}
        {!imgActiva && puntosDeLaImagen.map((punto) => (
          <PuntoMarcador
            key={punto.id}
            punto={punto}
            globalIndex={equipo.puntos.indexOf(punto)}
            activo={puntoActivo?.id === punto.id}
            onClick={() => setPuntoActivo(puntoActivo?.id === punto.id ? null : punto)}
          />
        ))}

        {/* ── Floating header ── */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          padding: '48px 16px 0',
          zIndex: 12,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              width: 38, height: 38, borderRadius: 10,
              background: 'rgba(19,24,32,0.75)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', flexShrink: 0, color: '#E8EDF5',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M12 3L6 9L12 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 15, fontWeight: 700, color: '#E8EDF5',
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
                  color: '#F4A020', letterSpacing: 1,
                  background: 'rgba(244,160,32,0.18)', borderRadius: 4,
                  padding: '1px 6px', border: '1px solid rgba(244,160,32,0.25)',
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
              background: 'rgba(19,24,32,0.75)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', flexShrink: 0, color: 'rgba(255,255,255,0.6)',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M5 6V2h8v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <rect x="2" y="6" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="1.5" />
              <path d="M5 11h8M5 14h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* ── Multi-image dots + prev/next ── */}
        {imagenes.length > 1 && (
          <>
            {/* Prev arrow */}
            <button
              onClick={() => setImgActivaIdx(i => Math.max(0, i - 1))}
              disabled={imgActivaIdx === 0}
              style={{
                position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                width: 32, height: 32, borderRadius: '50%',
                background: 'rgba(19,24,32,0.7)', border: '1px solid rgba(255,255,255,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: imgActivaIdx === 0 ? 'default' : 'pointer',
                zIndex: 12, color: imgActivaIdx === 0 ? 'rgba(255,255,255,0.2)' : '#E8EDF5',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M9 2L5 7l4 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {/* Next arrow */}
            <button
              onClick={() => setImgActivaIdx(i => Math.min(imagenes.length - 1, i + 1))}
              disabled={imgActivaIdx === imagenes.length - 1}
              style={{
                position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                width: 32, height: 32, borderRadius: '50%',
                background: 'rgba(19,24,32,0.7)', border: '1px solid rgba(255,255,255,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: imgActivaIdx === imagenes.length - 1 ? 'default' : 'pointer',
                zIndex: 12, color: imgActivaIdx === imagenes.length - 1 ? 'rgba(255,255,255,0.2)' : '#E8EDF5',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M5 2l4 5-4 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {/* Dots */}
            <div style={{
              position: 'absolute', bottom: 14, left: 0, right: 0,
              display: 'flex', justifyContent: 'center', gap: 6, zIndex: 12,
            }}>
              {imagenes.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setImgActivaIdx(i)}
                  style={{
                    width: i === imgActivaIdx ? 20 : 6, height: 6, borderRadius: 3,
                    background: i === imgActivaIdx ? '#F4A020' : 'rgba(255,255,255,0.35)',
                    border: 'none', cursor: 'pointer', padding: 0,
                    transition: 'width 0.2s, background 0.2s',
                  }}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* ══════════════════════════════════════════
          BOTTOM PANEL — scrollable
      ══════════════════════════════════════════ */}
      <div style={{
        flex: 1, overflowY: 'auto', background: '#0A0C0F',
        display: 'flex', flexDirection: 'column',
      }}>

        {/* ── Frequencies present (compact strip) ── */}
        {frecuenciasPresentes.length > 0 && (
          <div style={{
            display: 'flex', gap: '6px 14px', flexWrap: 'wrap',
            padding: '12px 16px',
            background: '#0D1117',
            borderBottom: '1px solid #1A2030',
          }}>
            {frecuenciasPresentes.map(([key, val]) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 9, height: 9, borderRadius: '50%', background: val.color, flexShrink: 0 }} />
                <span style={{
                  fontSize: 11, color: '#8A9BB8',
                  fontFamily: "'DM Sans', sans-serif",
                }}>
                  {val.label}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* ── Points list collapsible ── */}
        <div style={{ flex: 1 }}>
          {/* Header */}
          <button
            onClick={() => setListaAbierta(o => !o)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              width: '100%', padding: '14px 16px',
              background: 'transparent', border: 'none',
              borderBottom: listaAbierta ? '1px solid #1A2030' : 'none',
              cursor: 'pointer', textAlign: 'left',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 13, fontWeight: 700, color: '#E8EDF5',
                textTransform: 'uppercase', letterSpacing: 1,
              }}>
                Puntos de lubricación
              </span>
              <span style={{
                background: '#F4A020', color: '#0A0C0F',
                fontSize: 11, fontWeight: 800,
                padding: '1px 8px', borderRadius: 20,
                fontFamily: "'DM Sans', sans-serif",
              }}>
                {equipo.puntos.length}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {/* Frequency dots preview (collapsed state) */}
              {!listaAbierta && (
                <div style={{ display: 'flex', gap: 3 }}>
                  {equipo.puntos.slice(0, 8).map((p, i) => {
                    const freq = FRECUENCIAS[p.frecuencia]
                    return (
                      <div key={i} style={{
                        width: 8, height: 8, borderRadius: '50%',
                        background: freq?.color || '#7A8BA8',
                      }} />
                    )
                  })}
                </div>
              )}
              <svg
                width="18" height="18" viewBox="0 0 18 18" fill="none"
                style={{ transition: 'transform 0.2s', transform: listaAbierta ? 'rotate(180deg)' : 'rotate(0deg)' }}
              >
                <path d="M4 7l5 5 5-5" stroke="#7A8BA8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </button>

          {/* Expanded list */}
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
              {/* Last row has no border */}
              <div style={{ height: 24 }} />
            </div>
          )}

          {/* Collapsed hint */}
          {!listaAbierta && (
            <div style={{
              padding: '4px 16px 16px',
              fontSize: 12, color: '#4A5568',
              fontFamily: "'DM Sans', sans-serif",
            }}>
              Toca un punto en la imagen o despliega la lista
            </div>
          )}
        </div>
      </div>

      {/* BottomSheet */}
      {puntoActivo && (
        <BottomSheet
          punto={puntoActivo}
          globalIndex={puntoActivoGlobalIdx}
          onClose={() => setPuntoActivo(null)}
        />
      )}
    </div>
  )
}
