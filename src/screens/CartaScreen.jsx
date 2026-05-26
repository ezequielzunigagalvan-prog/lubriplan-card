import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FRECUENCIAS } from '../data/equipos'
import { useAdmin } from '../admin/context/AdminContext'
import EquipoSVG from '../components/EquipoSVG'
import BottomSheet from '../components/BottomSheet'

function PuntoMarcador({ punto, index, onClick }) {
  const freq = FRECUENCIAS[punto.frecuencia] || { color: '#7A8BA8', bg: '#1E2535', label: punto.frecuencia }
  return (
    <button
      onClick={onClick}
      style={{
        position: 'absolute',
        left: `${punto.x}%`,
        top: `${punto.y}%`,
        transform: 'translate(-50%, -50%)',
        width: 32,
        height: 32,
        borderRadius: '50%',
        background: freq.color,
        border: '2px solid rgba(255,255,255,0.25)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: 14,
        color: '#0A0C0F',
        fontWeight: 700,
        zIndex: 10,
        animation: 'pulse-dot 2s ease-in-out infinite',
        boxShadow: `0 0 12px ${freq.color}80`,
        padding: 0,
        lineHeight: 1,
      }}
    >
      {index + 1}
    </button>
  )
}

function Leyenda() {
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px 16px',
        padding: '12px 16px',
        background: '#131820',
        borderRadius: 12,
        border: '1px solid #2A3448',
      }}
    >
      {Object.entries(FRECUENCIAS).map(([key, val]) => (
        <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: val.color, flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: '#B8C5D8', fontFamily: "'DM Sans', sans-serif" }}>
            {val.label}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function CartaScreen() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { equipos } = useAdmin()
  const [puntoActivo, setPuntoActivo] = useState(null)
  const [imgActivaIdx, setImgActivaIdx] = useState(0)

  const equipo = equipos.find(e => e.id === id)

  if (!equipo) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          gap: 16,
          background: '#0A0C0F',
          color: '#7A8BA8',
        }}
      >
        <span style={{ fontSize: 48 }}>⚙️</span>
        <p style={{ fontSize: 16 }}>Equipo no encontrado</p>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: '#F4A020',
            color: '#0A0C0F',
            border: 'none',
            borderRadius: 12,
            padding: '12px 24px',
            fontWeight: 700,
            cursor: 'pointer',
            fontSize: 15,
          }}
        >
          Volver
        </button>
      </div>
    )
  }

  // Normalize images: support both new multi-image format and legacy single imagenUrl
  const imagenes = equipo.imagenes?.length > 0
    ? equipo.imagenes
    : equipo.imagenUrl
      ? [{ id: 'legacy', url: equipo.imagenUrl, flechas: [] }]
      : []

  const imgActiva = imagenes[imgActivaIdx] || null
  const flechas = imgActiva?.flechas || []

  // Points for the active image (or global points for legacy/SVG mode)
  const puntosDeLaImagen = imagenes.length === 0
    ? equipo.puntos
    : equipo.puntos.filter(p =>
        imgActiva && (p.imagenId === imgActiva.id || (!p.imagenId && imgActivaIdx === 0))
      )

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: '#0A0C0F',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '52px 16px 14px',
          background: '#0A0C0F',
          borderBottom: '1px solid #2A3448',
          flexShrink: 0,
        }}
      >
        <button
          onClick={() => navigate(-1)}
          style={{
            background: '#131820',
            border: '1px solid #2A3448',
            borderRadius: 10,
            width: 42,
            height: 42,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0,
            color: '#E8EDF5',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M12 3L6 9L12 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div style={{ flex: 1, minWidth: 0 }}>
          <h1
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 15,
              fontWeight: 700,
              color: '#E8EDF5',
              lineHeight: 1.3,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {equipo.nombre}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
            {equipo.codigo && (
              <span style={{
                fontFamily: 'monospace', fontSize: 11, fontWeight: 700,
                color: '#F4A020', letterSpacing: 1,
                background: 'rgba(244,160,32,0.1)', borderRadius: 4,
                padding: '1px 6px',
              }}>
                {equipo.codigo}
              </span>
            )}
            <p style={{ fontSize: 12, color: '#7A8BA8', margin: 0 }}>{equipo.area}</p>
          </div>
        </div>

        <button
          onClick={() => window.print()}
          style={{
            background: '#131820',
            border: '1px solid #2A3448',
            borderRadius: 10,
            width: 42,
            height: 42,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0,
            color: '#7A8BA8',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M5 6V2h8v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <rect x="2" y="6" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="1.5" />
            <path d="M5 11h8M5 14h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Scrollable content */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px 16px 40px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        {/* Equipment image with point markers */}
        <div
          style={{
            position: 'relative',
            background: '#131820',
            border: '1px solid #2A3448',
            borderRadius: 16,
            overflow: 'hidden',
          }}
        >
          {/* Image carousel tabs (only when multiple images) */}
          {imagenes.length > 1 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '10px 12px 8px',
                borderBottom: '1px solid #2A3448',
                overflowX: 'auto',
                scrollbarWidth: 'none',
              }}
            >
              {imagenes.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setImgActivaIdx(i)}
                  style={{
                    flexShrink: 0,
                    padding: '4px 12px',
                    borderRadius: 20,
                    border: `1px solid ${i === imgActivaIdx ? '#F4A020' : '#2A3448'}`,
                    background: i === imgActivaIdx ? '#F4A020' : 'transparent',
                    color: i === imgActivaIdx ? '#0A0C0F' : '#7A8BA8',
                    fontSize: 12,
                    fontWeight: i === imgActivaIdx ? 700 : 400,
                    cursor: 'pointer',
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  Foto {i + 1}
                </button>
              ))}
            </div>
          )}

          {/* Image area */}
          <div
            style={{
              position: 'relative',
              paddingTop: '68%',
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 0,
                padding: '10px',
              }}
            >
              {imgActiva
                ? <img src={imgActiva.url} alt={equipo.nombre} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                : <EquipoSVG tipo={equipo.imagen} />
              }
            </div>

            {/* SVG overlay for arrows/lines */}
            {flechas.length > 0 && (
              <svg
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  pointerEvents: 'none',
                  overflow: 'visible',
                }}
              >
                <defs>
                  <marker id="arrow-view" markerWidth="7" markerHeight="5" refX="7" refY="2.5" orient="auto">
                    <polygon points="0 0, 7 2.5, 0 5" fill="#F4A020" />
                  </marker>
                </defs>
                {flechas.map(f => (
                  <line
                    key={f.id}
                    x1={`${f.x1}%`} y1={`${f.y1}%`}
                    x2={`${f.x2}%`} y2={`${f.y2}%`}
                    stroke="#F4A020"
                    strokeWidth="2"
                    strokeDasharray={f.tipo === 'linea' ? '6 4' : undefined}
                    markerEnd={f.tipo === 'flecha' ? 'url(#arrow-view)' : undefined}
                    opacity="0.85"
                  />
                ))}
              </svg>
            )}

            {/* Point markers for this image */}
            {puntosDeLaImagen.map((punto, i) => (
              <PuntoMarcador
                key={punto.id}
                punto={punto}
                index={equipo.puntos.indexOf(punto)}
                onClick={() => setPuntoActivo(punto)}
              />
            ))}
          </div>

          {/* Carousel prev/next (when multiple images) */}
          {imagenes.length > 1 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px 10px',
                borderTop: '1px solid #2A3448',
              }}
            >
              <button
                onClick={() => setImgActivaIdx(i => Math.max(0, i - 1))}
                disabled={imgActivaIdx === 0}
                style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  background: 'none', border: 'none',
                  color: imgActivaIdx === 0 ? '#2A3448' : '#7A8BA8',
                  cursor: imgActivaIdx === 0 ? 'default' : 'pointer',
                  fontSize: 13, padding: '4px 8px',
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M9 2L5 7l4 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Anterior
              </button>

              {/* Dots */}
              <div style={{ display: 'flex', gap: 6 }}>
                {imagenes.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setImgActivaIdx(i)}
                    style={{
                      width: i === imgActivaIdx ? 16 : 6,
                      height: 6, borderRadius: 3,
                      background: i === imgActivaIdx ? '#F4A020' : '#2A3448',
                      border: 'none', cursor: 'pointer', padding: 0,
                      transition: 'width 0.2s, background 0.2s',
                    }}
                  />
                ))}
              </div>

              <button
                onClick={() => setImgActivaIdx(i => Math.min(imagenes.length - 1, i + 1))}
                disabled={imgActivaIdx === imagenes.length - 1}
                style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  background: 'none', border: 'none',
                  color: imgActivaIdx === imagenes.length - 1 ? '#2A3448' : '#7A8BA8',
                  cursor: imgActivaIdx === imagenes.length - 1 ? 'default' : 'pointer',
                  fontSize: 13, padding: '4px 8px',
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Siguiente
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M5 2l4 5-4 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Legend */}
        <Leyenda />

        {/* Points list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <h2
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13,
              fontWeight: 700,
              color: '#7A8BA8',
              letterSpacing: 1.5,
              textTransform: 'uppercase',
              marginBottom: 4,
            }}
          >
            Puntos de lubricación ({equipo.puntos.length})
          </h2>

          {equipo.puntos.map((punto, i) => {
            const freq = FRECUENCIAS[punto.frecuencia] || { color: '#7A8BA8', bg: '#1E2535', label: punto.frecuencia }
            const isVisible = puntosDeLaImagen.some(p => p.id === punto.id) || imagenes.length === 0
            return (
              <button
                key={punto.id}
                onClick={() => setPuntoActivo(punto)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  background: '#131820',
                  border: '1px solid #2A3448',
                  borderRadius: 12,
                  padding: '12px 14px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'border-color 0.15s, opacity 0.15s',
                  opacity: imagenes.length > 1 && !isVisible ? 0.35 : 1,
                }}
                onPointerDown={e => e.currentTarget.style.borderColor = freq.color}
                onPointerUp={e => e.currentTarget.style.borderColor = '#2A3448'}
                onPointerLeave={e => e.currentTarget.style.borderColor = '#2A3448'}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: freq.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: 14,
                    color: '#0A0C0F',
                    flexShrink: 0,
                  }}
                >
                  {i + 1}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: '#E8EDF5',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    {punto.nombre}
                  </p>
                  <p style={{ fontSize: 12, color: '#7A8BA8', marginTop: 2 }}>
                    {punto.lubricante}
                  </p>
                </div>
                <div
                  style={{
                    background: freq.bg,
                    color: freq.color,
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '4px 8px',
                    borderRadius: 8,
                    flexShrink: 0,
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  {freq.label}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* BottomSheet */}
      {puntoActivo && (
        <BottomSheet punto={puntoActivo} onClose={() => setPuntoActivo(null)} />
      )}
    </div>
  )
}
