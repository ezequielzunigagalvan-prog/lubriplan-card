import { QRCodeCanvas } from 'qrcode.react'

const ACCENT  = '#E09517'
const DARK    = '#111827'
const GRAY    = '#374151'
const MUTED   = '#9CA3AF'
const BORDER  = '#E5E7EB'
const BG_ALT  = '#F9FAFB'

const FRECUENCIAS = {
  DAILY:      'Diaria',
  WEEKLY:     'Semanal',
  BIWEEKLY:   'Quincenal',
  MONTHLY:    'Mensual',
  BIMONTHLY:  'Bimestral',
  QUARTERLY:  'Trimestral',
  SEMIANNUAL: 'Semestral',
  ANNUAL:     'Anual',
}

export default function PDFTemplate({ equipo, imagenes, puntos }) {
  const qrUrl  = `https://card.lubriplan.com/carta/${equipo.id}`
  const today  = new Date().toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' })
  const imgActiva = imagenes[0] || null
  const puntosDeLaImagen = imgActiva
    ? puntos.filter(p => p.imagenId === imgActiva.id || !p.imagenId)
    : puntos

  return (
    <div
      id="pdf-template"
      style={{
        position: 'fixed',
        left: '-9999px',
        top: 0,
        width: '794px',
        background: '#fff',
        fontFamily: 'Arial, Helvetica, sans-serif',
        color: DARK,
        padding: '56px',
        boxSizing: 'border-box',
      }}
    >
      {/* ── HEADER ── */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 20, paddingBottom: 14,
        borderBottom: `2.5px solid ${ACCENT}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 8,
            background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ color: '#fff', fontWeight: 900, fontSize: 20, lineHeight: 1 }}>L</span>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13, color: DARK, lineHeight: 1.2 }}>LubriPlan Card</div>
            <div style={{ fontSize: 10, color: MUTED, marginTop: 2 }}>Carta de Lubricación Industrial</div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontWeight: 700, fontSize: 17, color: DARK }}>{equipo.nombre}</div>
          <div style={{ fontSize: 11, color: GRAY, marginTop: 3 }}>
            {equipo.area} &nbsp;·&nbsp; {today}
          </div>
        </div>
      </div>

      {/* ── DATOS DEL EQUIPO ── */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        gap: '6px 24px', marginBottom: 18,
        background: BG_ALT, border: `1px solid ${BORDER}`,
        borderRadius: 8, padding: '12px 16px',
      }}>
        <DataRow label="Código"         value={equipo.codigo      || '—'} />
        <DataRow label="Área / Planta"  value={equipo.area        || '—'} />
        <DataRow label="Tipo de equipo" value={equipo.imagen      || '—'} />
        <DataRow label="Total de puntos" value={String(puntos.length)} />
        {equipo.descripcion && (
          <div style={{ gridColumn: '1 / -1' }}>
            <DataRow label="Descripción" value={equipo.descripcion} />
          </div>
        )}
      </div>

      {/* ── FOTO CON PUNTOS ── */}
      {imgActiva && (
        <div style={{ marginBottom: 18 }}>
          <SectionTitle>Foto del equipo</SectionTitle>
          <div style={{
            position: 'relative',
            border: `1px solid ${BORDER}`, borderRadius: 8, overflow: 'hidden',
            background: BG_ALT,
          }}>
            {/* La imagen ocupa el 100% del ancho sin objectFit:contain,
                así los puntos en porcentaje mapean exactamente a la imagen */}
            <img
              src={imgActiva.url}
              crossOrigin="anonymous"
              alt={equipo.nombre}
              style={{ width: '100%', display: 'block', maxHeight: 310, objectFit: 'contain' }}
            />
            {/* Overlay de puntos — posicionado sobre el área exacta de la imagen */}
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
              {puntosDeLaImagen.map((p, i) => (
                <div
                  key={p.id}
                  style={{
                    position: 'absolute',
                    left: `${p.x}%`,
                    top: `${p.y}%`,
                    transform: 'translate(-50%, -50%)',
                    width: 22, height: 22, borderRadius: '50%',
                    background: ACCENT,
                    border: '2px solid #fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 10, fontWeight: 700, color: '#fff',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.55)',
                  }}
                >
                  {i + 1}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TABLA DE PUNTOS ── */}
      {puntos.length > 0 && (
        <div style={{ marginBottom: 22 }}>
          <SectionTitle>Puntos de lubricación</SectionTitle>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
            <thead>
              <tr style={{ background: '#F3F4F6' }}>
                {['#', 'Punto', 'Lubricante', 'Cantidad', 'Frecuencia', 'Método'].map(h => (
                  <th key={h} style={{
                    padding: '7px 9px', textAlign: 'left', fontWeight: 700,
                    color: GRAY, borderBottom: `2px solid ${BORDER}`, whiteSpace: 'nowrap',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {puntos.map((p, i) => (
                <tr
                  key={p.id}
                  style={{ borderBottom: `1px solid ${BORDER}`, background: i % 2 === 0 ? '#fff' : BG_ALT }}
                >
                  <td style={{ padding: '6px 9px', fontWeight: 700, color: ACCENT, textAlign: 'center', whiteSpace: 'nowrap' }}>
                    {i + 1}
                  </td>
                  <td style={{ padding: '6px 9px', color: DARK }}>
                    {p.nombre || '—'}
                  </td>
                  <td style={{ padding: '6px 9px', color: GRAY }}>
                    {p.lubricante || '—'}
                  </td>
                  <td style={{ padding: '6px 9px', color: GRAY, textAlign: 'center', whiteSpace: 'nowrap' }}>
                    {p.cantidad > 0 ? `${p.cantidad} ${p.unidad || ''}`.trim() : '—'}
                  </td>
                  <td style={{ padding: '6px 9px', color: GRAY, whiteSpace: 'nowrap' }}>
                    {FRECUENCIAS[p.frecuencia] || p.frecuencia || '—'}
                  </td>
                  <td style={{ padding: '6px 9px', color: GRAY }}>
                    {p.metodo || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── FOOTER: QR + nota ── */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
        paddingTop: 14, borderTop: `1px solid ${BORDER}`, marginTop: 8,
      }}>
        <div style={{ fontSize: 9, color: MUTED, maxWidth: 440, lineHeight: 1.6 }}>
          <span style={{ fontWeight: 700, color: GRAY, display: 'block', marginBottom: 3 }}>LubriPlan Card</span>
          Carta de lubricación generada digitalmente. Los datos provienen del sistema de gestión LubriPlan.
          Los puntos numerados en la fotografía corresponden a los puntos de lubricación listados en la tabla.
          <br />Fecha de emisión: {today}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flexShrink: 0, marginLeft: 24 }}>
          <QRCodeCanvas value={qrUrl} size={80} level="M" />
          <div style={{ fontSize: 8, color: MUTED, textAlign: 'center', maxWidth: 90, lineHeight: 1.4 }}>
            Escanea para ver ficha digital
          </div>
        </div>
      </div>
    </div>
  )
}

function SectionTitle({ children }) {
  return (
    <div style={{
      fontSize: 10, fontWeight: 700, color: GRAY,
      letterSpacing: '0.06em', textTransform: 'uppercase',
      marginBottom: 8, borderLeft: `3px solid ${ACCENT}`, paddingLeft: 8,
    }}>
      {children}
    </div>
  )
}

function DataRow({ label, value }) {
  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'baseline' }}>
      <span style={{ fontSize: 10, color: MUTED, fontWeight: 600, minWidth: 90, flexShrink: 0 }}>{label}:</span>
      <span style={{ fontSize: 12, color: DARK }}>{value}</span>
    </div>
  )
}
