import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import EquipoSVG from '../components/EquipoSVG'

const LUBRIPLAN_URL = 'https://app.lubriplan.com'

// ─── Planes ──────────────────────────────────────────────────────────────
const PLANES = [
  {
    id: 'basico',
    nombre: 'Básico',
    precio: '$80',
    unidad: '/equipo',
    subtitulo: 'Mínimo 20 equipos · Pago único',
    mantenimiento: null,
    badge: null,
    color: '#F4A020',
    destacado: false,
    incluye: ['Ficha digital vía QR', 'QR digital por equipo', 'Hasta 3 técnicos', 'Hasta 30 equipos'],
    noIncluye: ['PDF por equipo', 'Placa QR metálica', 'Carta rígida a color', 'Integración LubriPlan'],
    ejemplos: ['20 eq = $1,600', '30 eq = $2,400'],
    cta: 'Ver detalles',
    ctaSecundario: false,
  },
  {
    id: 'estandar',
    nombre: 'Estándar',
    precio: '$350',
    unidad: '/equipo',
    subtitulo: 'Equipos ilimitados · Pago único',
    mantenimiento: 'Mantenimiento anual opcional: 20% del valor (~$70/eq/año)',
    mantenimientoDetalle: [
      'Actualización de fichas',
      'Reimpresión de tarjetas físicas',
      'Altas y bajas de equipos',
      'Corrección de fichas',
      'Actualizaciones de plataforma y bugs',
      'Respaldo y recuperación de datos',
      'Soporte WhatsApp y correo (24–48 hrs)',
    ],
    badge: 'Más popular',
    color: '#F4A020',
    destacado: true,
    incluye: ['Ficha digital vía QR', 'Placa QR metálica por equipo', 'Carta rígida a color', 'PDF por equipo', 'Técnicos ilimitados', 'Equipos ilimitados'],
    noIncluye: ['Integración LubriPlan'],
    ejemplos: ['30 eq = $10,500', '50 eq = $17,500', '80 eq = $28,000'],
    cta: 'Cotizar',
    ctaSecundario: false,
  },
  {
    id: 'pro',
    nombre: 'Pro',
    precio: '$350',
    unidad: '/equipo + LubriPlan',
    subtitulo: 'Pago único Card + suscripción LubriPlan',
    mantenimiento: 'Mantenimiento incluido en la suscripción LubriPlan',
    badge: 'Con LubriPlan',
    badgeColor: '#22C55E',
    color: '#22C55E',
    destacado: false,
    incluye: ['Todo lo del plan Estándar', 'Ficha sincronizada en tiempo real', 'Historial de lubricación', 'Rutas y alertas desde LubriPlan', 'Dashboard analítico', 'Técnicos y equipos ilimitados'],
    noIncluye: [],
    ejemplos: [],
    cta: 'Ver detalles',
    ctaSecundario: false,
  },
  {
    id: 'personalizado',
    nombre: 'Personalizado',
    precio: 'A convenir',
    unidad: '',
    subtitulo: '100+ equipos · Múltiples plantas',
    mantenimiento: 'Soporte y mantenimiento incluido',
    badge: null,
    color: '#7A8BA8',
    destacado: false,
    incluye: ['Todo del plan Pro o Estándar', '100+ equipos con precio especial', 'Múltiples plantas y sitios', 'Integración ERP / CMMS', 'Capacitación presencial', 'SLA de soporte dedicado', 'Facturación corporativa'],
    noIncluye: [],
    ejemplos: [],
    cta: 'Contactar',
    ctaSecundario: true,
    nota: 'Con o sin LubriPlan · Visita técnica incluida',
  },
]

// ─── Demo equipo ─────────────────────────────────────────────────────────
const DEMO_PUNTOS = [
  { id: 1, x: 26, y: 38, nombre: 'Cojinete delantero rotor macho', lubricante: 'Shell Omala S2 G 220', cantidad: '5 ml', metodo: 'Engrasador manual', frecuencia: 'Diario', freqColor: '#EF4444', freqBg: '#3F1010' },
  { id: 2, x: 68, y: 38, nombre: 'Cojinete trasero rotor hembra', lubricante: 'Mobilux EP 2', cantidad: '8 ml', metodo: 'Engrasador manual', frecuencia: 'Semanal', freqColor: '#F97316', freqBg: '#3F1E08' },
  { id: 3, x: 50, y: 65, nombre: 'Caja de engranajes', lubricante: 'Mobil SHC 630', cantidad: '2.5 L', metodo: 'Sistema circulación', frecuencia: 'Mensual', freqColor: '#EAB308', freqBg: '#3A3006' },
  { id: 4, x: 82, y: 52, nombre: 'Cojinete motor eléctrico DE', lubricante: 'Klüber Isoflex NBU 15', cantidad: '3 ml', metodo: 'Engrasador manual', frecuencia: 'Trimestral', freqColor: '#22C55E', freqBg: '#0A2E18' },
]

// ─── Chatbot QA ───────────────────────────────────────────────────────────
const BOT_INTRO = {
  text: '¡Hola! Soy el asistente de LubriPlan Card. Puedo responderte cualquier consulta sobre la plataforma. ¿Por dónde quieres empezar?',
  chips: ['¿Qué es LubriPlan Card?', '¿Cuánto cuesta?', '¿Necesita instalación?', '¿Incluye historial?'],
}

const QA = {
  '¿Qué es LubriPlan Card?': {
    text: 'LubriPlan Card es una herramienta de visualización de cartas de lubricación industrial. El técnico escanea el QR del equipo y accede a su ficha: puntos de lubricación, lubricantes, frecuencias y procedimientos.\n\nEs una solución de solo consulta — no incluye historial, rutas ni alertas. Esas funciones están disponibles integrando con LubriPlan en el Plan Pro.',
    chips: ['¿Necesita instalación?', '¿Qué incluye cada plan?', '¿Incluye historial?'],
  },
  '¿Cuánto cuesta?': {
    text: 'Los planes arrancan en $80 MXN por equipo (mínimo 20 equipos, pago único).\n\n• Básico: $80/equipo hasta 30 equipos\n• Estándar: $350/equipo ilimitado\n• Pro: $350/equipo + suscripción LubriPlan\n• Personalizado: precio a convenir para 100+ equipos\n\nTodos son pagos únicos (excepto Pro que incluye suscripción mensual a LubriPlan). IVA no incluido.',
    chips: ['¿Qué incluye el plan Estándar?', '¿Qué es el plan Pro?', '¿Qué incluye el mantenimiento?'],
  },
  '¿Necesita instalación?': {
    text: 'No. El técnico solo necesita la cámara de su celular para escanear el QR. Accede directamente desde el navegador, sin descargas, sin registro y sin contraseñas.\n\nEl administrador sí accede a un panel web para cargar y actualizar la información de los equipos.',
    chips: ['¿Qué es LubriPlan Card?', '¿Cuánto cuesta?', '¿Cuántos técnicos puedo agregar?'],
  },
  '¿Incluye historial?': {
    text: 'No. LubriPlan Card es visualización pura. El técnico puede ver qué lubricante usar, cuándo y cómo, pero no registra si la actividad fue realizada.\n\nEl historial de lubricación, rutas y alertas son funciones exclusivas de LubriPlan. Ambas plataformas se integran en el Plan Pro.',
    chips: ['¿Qué es el plan Pro?', '¿Cuánto cuesta?', '¿Qué es LubriPlan Card?'],
  },
  '¿Qué incluye el plan Estándar?': {
    text: 'El plan Estándar incluye:\n\n✓ Ficha digital vía QR\n✓ Placa QR metálica por equipo\n✓ Carta rígida a color\n✓ PDF por equipo\n✓ Técnicos ilimitados\n✓ Equipos ilimitados\n\nTambién ofrece mantenimiento anual opcional (20% del valor) que cubre actualización de fichas, reimpresión, altas/bajas, soporte WhatsApp y más.',
    chips: ['¿Qué es el plan Pro?', '¿Qué incluye el mantenimiento?', '¿Cuánto cuesta?'],
  },
  '¿Qué es el plan Pro?': {
    text: 'El plan Pro combina LubriPlan Card + la plataforma LubriPlan. Incluye todo lo del plan Estándar más:\n\n✓ Ficha sincronizada en tiempo real con LubriPlan\n✓ Historial de lubricación\n✓ Rutas y alertas automáticas\n✓ Dashboard analítico\n\nEl mantenimiento está incluido en la suscripción mensual de LubriPlan.',
    chips: ['¿Cuánto cuesta?', '¿Qué incluye el plan Estándar?', '¿Incluye historial?'],
  },
  '¿Qué incluye cada plan?': {
    text: 'Tenemos 4 planes:\n\n• Básico ($80/eq): QR digital, hasta 3 técnicos y 30 equipos\n• Estándar ($350/eq): placa metálica, carta rígida, PDF, ilimitado\n• Pro ($350/eq + LubriPlan): todo lo anterior + historial y rutas\n• Personalizado: 100+ equipos con precio especial\n\n¿Quieres que te explique alguno en detalle?',
    chips: ['¿Qué incluye el plan Estándar?', '¿Qué es el plan Pro?', '¿Cuánto cuesta?'],
  },
  '¿Qué incluye el mantenimiento?': {
    text: 'El mantenimiento anual del plan Estándar es opcional y cuesta el 20% del valor de implementación (~$70/eq/año). Incluye:\n\n✓ Actualización de fichas técnicas\n✓ Reimpresión de tarjetas físicas\n✓ Altas y bajas de equipos\n✓ Corrección de fichas\n✓ Actualizaciones de plataforma\n✓ Respaldo y recuperación de datos\n✓ Soporte WhatsApp y correo (respuesta 24–48 hrs)',
    chips: ['¿Cuánto cuesta?', '¿Qué incluye el plan Estándar?', '¿Cuántos técnicos puedo agregar?'],
  },
  '¿Cuántos técnicos puedo agregar?': {
    text: 'Depende del plan:\n\n• Básico: hasta 3 técnicos\n• Estándar: técnicos ilimitados\n• Pro: técnicos ilimitados\n• Personalizado: ilimitados con gestión centralizada\n\nCada técnico accede con su PIN desde la app y puede consultar las fichas de los equipos que tenga asignados.',
    chips: ['¿Cuánto cuesta?', '¿Necesita instalación?', '¿Qué es LubriPlan Card?'],
  },
}

const DEFAULT_RESPONSE = {
  text: 'Esa consulta la manejo mejor en directo. Te recomiendo contactarnos por WhatsApp o correo para que podamos ayudarte en detalle.',
  chips: ['¿Qué es LubriPlan Card?', '¿Cuánto cuesta?', '¿Necesita instalación?'],
}

// ─── SVG Icons ────────────────────────────────────────────────────────────
function IconPhone() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <rect x="7" y="2" width="14" height="24" rx="3" stroke="#F4A020" strokeWidth="1.5" />
      <rect x="10" y="5" width="8" height="12" rx="1" fill="#F4A02020" stroke="#F4A020" strokeWidth="1" />
      <circle cx="14" cy="21" r="1.5" fill="#F4A020" />
    </svg>
  )
}
function IconCard() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <rect x="3" y="6" width="22" height="16" rx="2.5" stroke="#F4A020" strokeWidth="1.5" />
      <path d="M7 12h6M7 16h4" stroke="#F4A020" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="20" cy="14" r="3" stroke="#F4A020" strokeWidth="1.3" />
    </svg>
  )
}
function IconCheck({ size = 28, color = '#F4A020' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <circle cx="14" cy="14" r="11" stroke={color} strokeWidth="1.5" />
      <path d="M9 14l4 4 6-7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function IconQR({ size = 24, color = '#F4A020' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="2" y="2" width="8" height="8" rx="1" stroke={color} strokeWidth="1.5" />
      <rect x="14" y="2" width="8" height="8" rx="1" stroke={color} strokeWidth="1.5" />
      <rect x="2" y="14" width="8" height="8" rx="1" stroke={color} strokeWidth="1.5" />
      <rect x="4.5" y="4.5" width="3" height="3" rx="0.5" fill={color} />
      <rect x="16.5" y="4.5" width="3" height="3" rx="0.5" fill={color} />
      <rect x="4.5" y="16.5" width="3" height="3" rx="0.5" fill={color} />
      <path d="M14 14h2v2h-2zM18 14h2v2h-2zM16 16h2v2h-2zM14 18h2v2h-2zM18 18h2v2h-2z" fill={color} />
    </svg>
  )
}
function IconGlobe({ size = 24, color = '#F4A020' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.5" />
      <ellipse cx="12" cy="12" rx="3.5" ry="9" stroke={color} strokeWidth="1.3" />
      <path d="M3 12h18" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <path d="M3.5 8h17M3.5 16h17" stroke={color} strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  )
}
function IconCamera({ size = 24, color = '#F4A020' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="2" y="7" width="20" height="14" rx="2.5" stroke={color} strokeWidth="1.5" />
      <circle cx="12" cy="14" r="3.5" stroke={color} strokeWidth="1.5" />
      <path d="M9 7l1.5-3h3L15 7" stroke={color} strokeWidth="1.4" strokeLinejoin="round" />
      <circle cx="18" cy="10" r="1" fill={color} />
    </svg>
  )
}
function IconPalette({ size = 24, color = '#F4A020' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.5" />
      <circle cx="8" cy="10" r="1.5" fill="#EF4444" />
      <circle cx="12" cy="8" r="1.5" fill="#22C55E" />
      <circle cx="16" cy="10" r="1.5" fill="#3B82F6" />
      <circle cx="16" cy="14.5" r="1.5" fill="#EAB308" />
      <path d="M14 17.5a3 3 0 0 1-4 0" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}
function IconUsers({ size = 24, color = '#F4A020' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="9" cy="7" r="3.5" stroke={color} strokeWidth="1.5" />
      <path d="M2 20c0-4 3-6 7-6s7 2 7 6" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="17" cy="8" r="2.5" stroke={color} strokeWidth="1.3" />
      <path d="M20 18c0-2.5-1.5-4-3.5-4.5" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}
function IconTag({ size = 24, color = '#F4A020' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M12 3H5a2 2 0 0 0-2 2v7l9.5 9.5a2 2 0 0 0 2.83 0l5.67-5.67a2 2 0 0 0 0-2.83L12 3z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="7.5" cy="8.5" r="1.5" fill={color} />
    </svg>
  )
}
function IconBolt({ size = 24, color = '#F4A020' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M13 2L4.5 13.5H11L10 22L20.5 10H14L13 2z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  )
}
function IconWrench({ size = 16, color = '#F4A020' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <path d="M14.5 3.5a3 3 0 0 1-3.5 4.5L6 13a2 2 0 1 1-1.5-1.5l5-5a3 3 0 0 1 4.5-3.5l-2 2 1.5 1.5 2-2z" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function IconInfo({ size = 14, color = '#7A8BA8' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="6" stroke={color} strokeWidth="1.2" />
      <path d="M7 5v4M7 4h.01" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}
function IconChevronDown({ size = 12, color = '#7A8BA8' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none">
      <path d="M2 4l4 4 4-4" stroke={color} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ─── Check / X ────────────────────────────────────────────────────────────
function CheckIcon({ color = '#22C55E' }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
      <circle cx="8" cy="8" r="7" fill={color + '20'} />
      <path d="M4.5 8L7 10.5L11.5 6" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function XIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
      <circle cx="8" cy="8" r="7" fill="#EF444415" />
      <path d="M5.5 5.5L10.5 10.5M10.5 5.5L5.5 10.5" stroke="#EF4444" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

// ─── Demo interactivo ─────────────────────────────────────────────────────
function DemoEquipo() {
  const [activeId, setActiveId] = useState(null)
  const activePunto = DEMO_PUNTOS.find(p => p.id === activeId)

  return (
    <section style={{ padding: '80px 5%', background: '#0A0C0F' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#F4A020', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>
            Demo interactivo
          </div>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(30px,4vw,48px)', letterSpacing: 2, color: '#E8EDF5', marginBottom: 12 }}>
            ASÍ VE EL TÉCNICO LA FICHA
          </h2>
          <p style={{ fontSize: 14, color: '#7A8BA8', maxWidth: 480, margin: '0 auto' }}>
            Pasa el cursor sobre los puntos numerados para ver los datos de lubricación de cada uno
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 24,
          alignItems: 'start',
        }}>
          {/* Imagen con puntos */}
          <div style={{
            background: '#0D1117',
            border: '1px solid #1E2535',
            borderRadius: 20,
            overflow: 'hidden',
          }}>
            {/* Header */}
            <div style={{
              padding: '14px 18px',
              borderBottom: '1px solid #1E2535',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#E8EDF5', fontFamily: "'DM Sans', sans-serif" }}>
                  Compresor de tornillo
                </div>
                <div style={{ fontSize: 11, color: '#4A5568', marginTop: 2 }}>
                  <span style={{ color: '#F4A020', fontFamily: 'monospace', fontSize: 10, background: 'rgba(244,160,32,0.1)', padding: '1px 6px', borderRadius: 4, marginRight: 6 }}>CMP-001</span>
                  Sala de compresores
                </div>
              </div>
              <div style={{ display: 'flex', gap: 5 }}>
                {DEMO_PUNTOS.map(p => (
                  <div key={p.id} style={{ width: 8, height: 8, borderRadius: '50%', background: p.freqColor, opacity: activeId === p.id ? 1 : 0.4 }} />
                ))}
              </div>
            </div>

            {/* SVG + puntos */}
            <div style={{ padding: '24px 24px 20px' }}>
              <div style={{ width: '100%', aspectRatio: '16/9', minHeight: 160, position: 'relative' }}>
                <EquipoSVG tipo="compresor" showName={false} />

                {/* Puntos numerados — posicionados dentro del contenedor SVG */}
                {DEMO_PUNTOS.map(p => (
                  <button
                    key={p.id}
                    onMouseEnter={() => setActiveId(p.id)}
                    onMouseLeave={() => setActiveId(null)}
                    onClick={() => setActiveId(activeId === p.id ? null : p.id)}
                    style={{
                      position: 'absolute',
                      left: `${p.x}%`,
                      top: `${p.y}%`,
                      transform: 'translate(-50%, -50%)',
                    width: activeId === p.id ? 38 : 32,
                    height: activeId === p.id ? 38 : 32,
                    borderRadius: '50%',
                    background: p.freqColor,
                    border: activeId === p.id ? '3px solid #fff' : '2.5px solid rgba(255,255,255,0.35)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: 15,
                    color: '#0A0C0F',
                    fontWeight: 700,
                    zIndex: 10,
                    animation: activeId === p.id ? 'none' : 'pulse-dot 2.4s ease-in-out infinite',
                    boxShadow: activeId === p.id
                      ? `0 0 0 6px ${p.freqColor}35, 0 2px 16px rgba(0,0,0,0.6)`
                      : `0 0 14px ${p.freqColor}90`,
                    transition: 'width 0.15s, height 0.15s, box-shadow 0.15s',
                    padding: 0,
                  }}
                >
                    {p.id}
                  </button>
                ))}
              </div>
            </div>

            {/* Leyenda frecuencias */}
            <div style={{ padding: '0 18px 16px', display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              {DEMO_PUNTOS.map(p => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.freqColor }} />
                  <span style={{ fontSize: 11, color: '#4A5568', fontFamily: "'DM Sans', sans-serif" }}>{p.frecuencia}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Panel de detalle */}
          <div>
            {activePunto ? (
              <div style={{
                background: '#0D1117',
                border: `1px solid ${activePunto.freqColor}40`,
                borderRadius: 20,
                overflow: 'hidden',
                animation: 'fade-in 0.15s ease-out',
              }}>
                {/* Header punto */}
                <div style={{ padding: '18px 20px', borderBottom: '1px solid #1E2535' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: '50%',
                      background: activePunto.freqColor,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: "'Bebas Neue', sans-serif",
                      fontSize: 20, color: '#0A0C0F', fontWeight: 700, flexShrink: 0,
                    }}>
                      {activePunto.id}
                    </div>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: '#E8EDF5', fontFamily: "'DM Sans', sans-serif", lineHeight: 1.3 }}>
                        {activePunto.nombre}
                      </div>
                      <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        background: activePunto.freqBg,
                        border: `1px solid ${activePunto.freqColor}30`,
                        borderRadius: 8, padding: '3px 10px', marginTop: 5,
                      }}>
                        <div style={{ width: 7, height: 7, borderRadius: '50%', background: activePunto.freqColor }} />
                        <span style={{ color: activePunto.freqColor, fontSize: 11, fontWeight: 700 }}>{activePunto.frecuencia}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Filas de datos */}
                {[
                  {
                    icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M3 9C3 6 6 3 9 3s6 3 6 6-3 6-6 6-6-3-6-6z" stroke="#F4A020" strokeWidth="1.4" /><path d="M9 6v4M9 12h.01" stroke="#F4A020" strokeWidth="1.4" strokeLinecap="round" /></svg>,
                    label: 'Lubricante', value: activePunto.lubricante,
                  },
                  {
                    icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 2L13 8H5L9 2Z" stroke="#F4A020" strokeWidth="1.4" strokeLinejoin="round" /><rect x="6" y="8" width="6" height="8" rx="1" stroke="#F4A020" strokeWidth="1.4" /></svg>,
                    label: 'Cantidad', value: activePunto.cantidad,
                  },
                  {
                    icon: <IconWrench />,
                    label: 'Método', value: activePunto.metodo,
                  },
                ].map((row, i, arr) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '14px 20px',
                    borderBottom: i < arr.length - 1 ? '1px solid #1E2535' : 'none',
                  }}>
                    <div style={{ width: 20, display: 'flex', justifyContent: 'center', flexShrink: 0 }}>{row.icon}</div>
                    <div>
                      <div style={{ fontSize: 10, color: '#4A5568', fontWeight: 600, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 2 }}>{row.label}</div>
                      <div style={{ fontSize: 14, color: '#E8EDF5', fontWeight: 500, fontFamily: "'DM Sans', sans-serif" }}>{row.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                background: '#0D1117',
                border: '1px solid #1E2535',
                borderRadius: 20,
                padding: '48px 24px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 14,
                textAlign: 'center',
              }}>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%',
                  background: 'rgba(244,160,32,0.08)',
                  border: '1px solid rgba(244,160,32,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <IconBolt size={26} />
                </div>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#E8EDF5' }}>
                  Selecciona un punto
                </div>
                <div style={{ fontSize: 13, color: '#4A5568', lineHeight: 1.6, maxWidth: 220 }}>
                  Pasa el cursor sobre los círculos numerados en la imagen del equipo para ver los datos de lubricación
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8, width: '100%' }}>
                  {DEMO_PUNTOS.map(p => (
                    <button
                      key={p.id}
                      onMouseEnter={() => setActiveId(p.id)}
                      onMouseLeave={() => setActiveId(null)}
                      onClick={() => setActiveId(activeId === p.id ? null : p.id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        background: 'none', border: '1px solid #1E2535',
                        borderRadius: 10, padding: '9px 14px',
                        cursor: 'pointer', textAlign: 'left',
                        transition: 'border-color 0.15s',
                      }}
                      onFocus={e => e.currentTarget.style.borderColor = p.freqColor}
                      onBlur={e => e.currentTarget.style.borderColor = '#1E2535'}
                    >
                      <div style={{ width: 26, height: 26, borderRadius: '50%', background: p.freqColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Bebas Neue', sans-serif", fontSize: 13, color: '#0A0C0F', fontWeight: 700, flexShrink: 0 }}>
                        {p.id}
                      </div>
                      <span style={{ fontSize: 12, color: '#7A8BA8', fontFamily: "'DM Sans', sans-serif" }}>{p.nombre}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Chatbot ──────────────────────────────────────────────────────────────
function formatBotText(text) {
  return text.split('\n').map((line, i) => (
    <span key={i}>
      {line}
      {i < text.split('\n').length - 1 && <br />}
    </span>
  ))
}

function LubriBot() {
  const [messages, setMessages] = useState([{ from: 'bot', text: BOT_INTRO.text, chips: BOT_INTRO.chips }])
  const [typing, setTyping] = useState(false)
  const [pendingChips, setPendingChips] = useState(BOT_INTRO.chips)
  const endRef = useRef(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  const handleChip = useCallback((question) => {
    if (typing) return
    setPendingChips([])
    setMessages(prev => [...prev, { from: 'user', text: question }])
    setTyping(true)
    const response = QA[question] || DEFAULT_RESPONSE
    setTimeout(() => {
      setTyping(false)
      setMessages(prev => [...prev, { from: 'bot', text: response.text, chips: response.chips }])
      setPendingChips(response.chips)
    }, 800)
  }, [typing])

  return (
    <section style={{ padding: '80px 5%', background: '#080A0E' }}>
      <div style={{ maxWidth: 740, margin: '0 auto' }}>

        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#F4A020', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>
            Asistente LubriPlan Card
          </div>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(30px,4vw,46px)', letterSpacing: 2, color: '#E8EDF5', marginBottom: 10 }}>
            ¿TIENES DUDAS?
          </h2>
          <p style={{ fontSize: 14, color: '#4A5568' }}>
            Preguntale al asistente sobre qué es LubriPlan Card, planes y precios
          </p>
        </div>

        {/* Chat container */}
        <div style={{
          background: '#0D1117',
          border: '1px solid #1E2535',
          borderRadius: 20,
          overflow: 'hidden',
        }}>
          {/* Chat header */}
          <div style={{
            padding: '14px 20px',
            borderBottom: '1px solid #1E2535',
            display: 'flex', alignItems: 'center', gap: 12,
            background: '#131820',
          }}>
            <div style={{ position: 'relative' }}>
              <img src="/logo.jpeg" alt="Bot" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
              <div style={{
                position: 'absolute', bottom: 0, right: 0,
                width: 10, height: 10, borderRadius: '50%',
                background: '#22C55E', border: '2px solid #131820',
              }} />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#E8EDF5', fontFamily: "'DM Sans', sans-serif" }}>
                Asistente LubriPlan Card
              </div>
              <div style={{ fontSize: 11, color: '#22C55E', marginTop: 1 }}>En línea</div>
            </div>
          </div>

          {/* Messages */}
          <div style={{
            height: 380,
            overflowY: 'auto',
            padding: '20px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            scrollbarWidth: 'none',
          }}>
            {messages.map((msg, i) => (
              <div key={i} style={{
                display: 'flex',
                justifyContent: msg.from === 'user' ? 'flex-end' : 'flex-start',
                gap: 8,
                alignItems: 'flex-end',
              }}>
                {msg.from === 'bot' && (
                  <img src="/logo.jpeg" alt="Bot" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, marginBottom: 2 }} />
                )}
                <div style={{
                  maxWidth: '78%',
                  padding: '11px 14px',
                  borderRadius: msg.from === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  background: msg.from === 'user' ? '#F4A020' : '#1C2230',
                  color: msg.from === 'user' ? '#0A0C0F' : '#D8E3F0',
                  fontSize: 13,
                  lineHeight: 1.65,
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: msg.from === 'user' ? 600 : 400,
                  whiteSpace: 'pre-line',
                }}>
                  {formatBotText(msg.text)}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {typing && (
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                <img src="/logo.jpeg" alt="Bot" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                <div style={{
                  padding: '13px 16px',
                  borderRadius: '16px 16px 16px 4px',
                  background: '#1C2230',
                  display: 'flex', gap: 4, alignItems: 'center',
                }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{
                      width: 7, height: 7, borderRadius: '50%', background: '#4A5568',
                      animation: `pulse-dot 1.2s ease-in-out ${i * 0.2}s infinite`,
                    }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Chips */}
          {pendingChips.length > 0 && !typing && (
            <div style={{
              padding: '14px 16px',
              borderTop: '1px solid #1E2535',
              display: 'flex', flexWrap: 'wrap', gap: 8,
              background: '#0A0C0F',
            }}>
              <span style={{ fontSize: 11, color: '#2A3448', width: '100%', marginBottom: 2, fontFamily: "'DM Sans', sans-serif" }}>
                Preguntas sugeridas:
              </span>
              {pendingChips.map(chip => (
                <button
                  key={chip}
                  onClick={() => handleChip(chip)}
                  style={{
                    padding: '7px 14px',
                    background: 'transparent',
                    border: '1px solid #2A3448',
                    borderRadius: 20,
                    color: '#B8C5D8',
                    fontSize: 12,
                    cursor: 'pointer',
                    fontFamily: "'DM Sans', sans-serif",
                    transition: 'border-color 0.15s, color 0.15s, background 0.15s',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#F4A020'; e.currentTarget.style.color = '#F4A020'; e.currentTarget.style.background = 'rgba(244,160,32,0.06)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#2A3448'; e.currentTarget.style.color = '#B8C5D8'; e.currentTarget.style.background = 'transparent' }}
                >
                  {chip}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Contacto directo */}
        <div style={{
          marginTop: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
          padding: '20px 24px',
          background: '#0D1117',
          border: '1px solid #1E2535',
          borderRadius: 16,
        }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#E8EDF5', marginBottom: 3 }}>¿Prefieres hablar con una persona?</div>
            <div style={{ fontSize: 12, color: '#4A5568' }}>Te respondemos en menos de 24 hrs por WhatsApp o correo</div>
          </div>
          <button
            onClick={() => window.open('mailto:contacto@lubriplan.com', '_blank')}
            style={{
              padding: '11px 22px', background: '#F4A020', border: 'none',
              borderRadius: 10, color: '#0A0C0F', fontSize: 13, fontWeight: 700,
              cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", flexShrink: 0,
            }}
          >
            Contactar
          </button>
        </div>
      </div>
    </section>
  )
}

// ─── Plan Card ────────────────────────────────────────────────────────────
function PlanCard({ plan, onCTA }) {
  const [showMant, setShowMant] = useState(false)
  return (
    <div style={{
      position: 'relative',
      display: 'flex', flexDirection: 'column',
      background: '#0D1117',
      border: plan.destacado ? `2px solid ${plan.color}` : '1px solid #1E2535',
      borderRadius: 20,
      padding: '28px 24px 24px',
      boxShadow: plan.destacado ? `0 0 40px ${plan.color}22` : 'none',
    }}>
      {plan.badge && (
        <div style={{
          position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)',
          background: plan.badgeColor || plan.color,
          color: plan.badgeColor ? '#fff' : '#0A0C0F',
          fontSize: 11, fontWeight: 800, letterSpacing: 1.2, textTransform: 'uppercase',
          padding: '5px 16px', borderRadius: 20, whiteSpace: 'nowrap',
          fontFamily: "'DM Sans', sans-serif",
        }}>
          {plan.badge}
        </div>
      )}

      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, letterSpacing: 2, color: plan.color, marginBottom: 4 }}>{plan.nombre}</div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 4 }}>
        <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: plan.precio === 'A convenir' ? 28 : 46, color: '#E8EDF5', lineHeight: 1 }}>{plan.precio}</span>
        {plan.unidad && <span style={{ fontSize: 12, color: '#7A8BA8' }}>{plan.unidad}</span>}
      </div>
      <div style={{ fontSize: 11, color: '#4A5568', marginBottom: 14 }}>MXN · IVA no incluido</div>
      <div style={{ fontSize: 13, color: '#8A9BB8', marginBottom: 18, paddingBottom: 18, borderBottom: '1px solid #1E2535', fontFamily: "'DM Sans', sans-serif" }}>{plan.subtitulo}</div>

      {plan.incluye.length > 0 && (
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#4A5568', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 }}>Incluye</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {plan.incluye.map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <CheckIcon color={plan.color} />
                <span style={{ fontSize: 13, color: '#B8C5D8', lineHeight: 1.4 }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {plan.noIncluye.length > 0 && (
        <div style={{ marginBottom: 10, marginTop: 8 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#4A5568', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 }}>No incluye</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {plan.noIncluye.map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <XIcon />
                <span style={{ fontSize: 13, color: '#4A5568', lineHeight: 1.4 }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {plan.nota && (
        <div style={{ background: '#1C2230', borderRadius: 10, padding: '10px 14px', fontSize: 12, color: '#7A8BA8', marginBottom: 10, marginTop: 4 }}>
          {plan.nota}
        </div>
      )}

      {plan.mantenimiento && (
        <div style={{ marginTop: 8, marginBottom: 10 }}>
          <button onClick={() => setShowMant(v => !v)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#7A8BA8' }}>
            <IconInfo />
            <span style={{ fontSize: 12, textAlign: 'left' }}>{plan.mantenimiento}</span>
            {plan.mantenimientoDetalle && (
              <div style={{ transition: 'transform 0.2s', transform: showMant ? 'rotate(180deg)' : 'none', flexShrink: 0 }}>
                <IconChevronDown />
              </div>
            )}
          </button>
          {showMant && plan.mantenimientoDetalle && (
            <div style={{ marginTop: 8, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {plan.mantenimientoDetalle.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <CheckIcon color="#7A8BA8" />
                  <span style={{ fontSize: 12, color: '#7A8BA8' }}>{item}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {plan.ejemplos.length > 0 && (
        <div style={{ background: '#1C2230', borderRadius: 10, padding: '10px 14px', marginBottom: 14, marginTop: 4 }}>
          <div style={{ fontSize: 10, color: '#4A5568', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 }}>Ejemplos</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 16px' }}>
            {plan.ejemplos.map((e, i) => <span key={i} style={{ fontSize: 12, color: '#8A9BB8', fontFamily: 'monospace' }}>{e}</span>)}
          </div>
        </div>
      )}

      <div style={{ flex: 1 }} />

      <button
        onClick={() => onCTA(plan)}
        style={{
          marginTop: 18, padding: '13px',
          borderRadius: 12,
          border: plan.ctaSecundario ? '1px solid #2A3448' : plan.destacado ? 'none' : `1px solid ${plan.color}50`,
          background: plan.destacado ? plan.color : plan.ctaSecundario ? '#1C2230' : 'transparent',
          color: plan.destacado ? '#0A0C0F' : plan.color,
          fontSize: 14, fontWeight: 700, cursor: 'pointer',
          fontFamily: "'DM Sans', sans-serif",
          transition: 'opacity 0.15s',
        }}
        onMouseEnter={e => { if (!plan.destacado) e.currentTarget.style.background = plan.color + '15'; else e.currentTarget.style.opacity = '0.88' }}
        onMouseLeave={e => { if (!plan.destacado) e.currentTarget.style.background = plan.ctaSecundario ? '#1C2230' : 'transparent'; else e.currentTarget.style.opacity = '1' }}
      >
        {plan.cta}
      </button>
    </div>
  )
}

// ─── LandingPage ──────────────────────────────────────────────────────────
export default function LandingPage() {
  const navigate = useNavigate()
  const pricingRef = useRef(null)
  const chatRef = useRef(null)

  const scrollTo = (ref) => ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  const handleCTA = (plan) => {
    if (plan.id === 'personalizado') {
      window.location.href = 'mailto:contacto@lubriplan.com?subject=Consulta%20Plan%20Personalizado%20LubriPlan%20Card'
    } else {
      scrollTo(chatRef)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, overflowY: 'auto', overflowX: 'hidden',
      background: '#080A0E', fontFamily: "'DM Sans', sans-serif", zIndex: 1,
    }}>

      {/* ── NAV ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(8,10,14,0.92)',
        backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid #1A2030',
        padding: '0 5%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="/logo.jpeg" alt="LubriPlan Card" style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover' }} />
          <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, letterSpacing: 2, color: '#E8EDF5' }}>
            LUBRIPLAN <span style={{ color: '#F4A020' }}>CARD</span>
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={() => scrollTo(pricingRef)}
            style={{
              padding: '8px 16px', background: 'none', border: '1px solid #2A3448',
              borderRadius: 8, color: '#7A8BA8', fontSize: 13, cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#F4A020'}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#2A3448'}
          >
            Precios
          </button>
          <button
            onClick={() => navigate('/entrar')}
            style={{
              padding: '9px 20px', background: '#F4A020', border: 'none',
              borderRadius: 8, color: '#0A0C0F', fontSize: 13, fontWeight: 700,
              cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
              transition: 'opacity 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            Entrar
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{
        minHeight: '90vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '80px 5% 60px', textAlign: 'center', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: '35%', left: '50%', transform: 'translate(-50%,-50%)',
          width: 700, height: 420, borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(244,160,32,0.07) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(244,160,32,0.1)', border: '1px solid rgba(244,160,32,0.25)',
          borderRadius: 20, padding: '6px 16px', marginBottom: 28,
          fontSize: 12, fontWeight: 600, color: '#F4A020', letterSpacing: 1,
        }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#F4A020', animation: 'pulse-dot 2s ease-in-out infinite' }} />
          FICHA DIGITAL · CÓDIGO QR · VISUALIZACIÓN INDUSTRIAL
        </div>

        <h1 style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 'clamp(52px, 9vw, 100px)',
          letterSpacing: 4, color: '#E8EDF5', lineHeight: 1, marginBottom: 12, maxWidth: 900,
        }}>
          CARTAS DE LUBRICACIÓN<br />
          <span style={{ color: '#F4A020' }}>SIEMPRE DISPONIBLES</span>
        </h1>

        <p style={{
          fontSize: 'clamp(15px, 2vw, 19px)', color: '#7A8BA8',
          maxWidth: 580, lineHeight: 1.75, marginBottom: 40,
        }}>
          El técnico escanea el QR del equipo y accede instantáneamente a su ficha de lubricación.
          Sin apps, sin contraseñas, sin demoras.
        </p>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            onClick={() => scrollTo(pricingRef)}
            style={{
              padding: '15px 36px', background: '#F4A020', border: 'none',
              borderRadius: 12, color: '#0A0C0F', fontSize: 15, fontWeight: 700,
              cursor: 'pointer', transition: 'transform 0.15s, opacity 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.opacity = '0.9' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.opacity = '1' }}
          >
            Ver planes y precios
          </button>
          <button
            onClick={() => scrollTo(chatRef)}
            style={{
              padding: '15px 36px', background: 'transparent', border: '1px solid #2A3448',
              borderRadius: 12, color: '#E8EDF5', fontSize: 15, fontWeight: 500,
              cursor: 'pointer', transition: 'border-color 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#F4A020'}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#2A3448'}
          >
            Consultar asistente
          </button>
        </div>

        {/* 3 pasos con iconos SVG */}
        <div style={{ marginTop: 64, display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap' }}>
          {[
            { label: 'Escanea el QR', icon: <IconPhone />, desc: 'Con la cámara del celular' },
            { label: 'Accede a la ficha', icon: <IconCard />, desc: 'Sin apps ni registro' },
            { label: 'Lubrica correctamente', icon: <IconCheck size={28} />, desc: 'Información precisa siempre' },
          ].map((step, i) => (
            <div key={i} style={{
              background: '#0D1117', border: '1px solid #1E2535',
              borderRadius: 16, padding: '20px 24px', textAlign: 'center',
              minWidth: 160, maxWidth: 200, display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center',
            }}>
              {step.icon}
              <div style={{ fontSize: 14, fontWeight: 700, color: '#E8EDF5' }}>{step.label}</div>
              <div style={{ fontSize: 12, color: '#4A5568' }}>{step.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── QUÉ ES ── */}
      <section style={{ padding: '80px 5%', maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 60, alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#F4A020', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16 }}>
            ¿Qué es LubriPlan Card?
          </div>
          <h2 style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 'clamp(34px, 5vw, 52px)',
            letterSpacing: 2, color: '#E8EDF5', lineHeight: 1.1, marginBottom: 20,
          }}>
            LA FICHA TÉCNICA<br />DE TUS EQUIPOS,<br />
            <span style={{ color: '#F4A020' }}>SIEMPRE A MANO</span>
          </h2>
          <p style={{ fontSize: 15, color: '#7A8BA8', lineHeight: 1.8, marginBottom: 24 }}>
            LubriPlan Card es una herramienta de <strong style={{ color: '#E8EDF5' }}>visualización de cartas de lubricación industrial</strong>.
            No reemplaza tu sistema de gestión — lo complementa en el piso de planta.
          </p>
          <div style={{ fontSize: 13, color: '#4A5568', lineHeight: 1.7, marginBottom: 28, background: '#0D1117', borderRadius: 12, padding: '14px 16px', border: '1px solid #1E2535' }}>
            LubriPlan Card es visualización pura. No incluye historial, rutas ni alertas.
            Para esas funciones existe la integración con <span style={{ color: '#F4A020', fontWeight: 600 }}>LubriPlan</span> en el Plan Pro.
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              'El técnico solo necesita su celular',
              'El admin carga y actualiza la información',
              'Cada equipo tiene su QR único',
              'Disponible en toda la planta, sin Internet requerido*',
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <CheckIcon />
                <span style={{ fontSize: 14, color: '#B8C5D8' }}>{item}</span>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 11, color: '#2A3448', marginTop: 10 }}>* Una vez cargada la ficha, funciona offline en el navegador.</p>
        </div>

        {/* Features con iconos SVG */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {[
            { title: 'QR por equipo', desc: 'Código único por máquina', icon: <IconQR /> },
            { title: 'Sin apps', desc: 'Acceso desde el navegador', icon: <IconGlobe /> },
            { title: 'Imágenes técnicas', desc: 'Fotos con puntos marcados', icon: <IconCamera /> },
            { title: 'Código por color', desc: 'Frecuencias al instante', icon: <IconPalette /> },
            { title: 'Multi-técnico', desc: 'Ilimitados según el plan', icon: <IconUsers /> },
            { title: 'Placa metálica', desc: 'QR físico resistente (Estándar+)', icon: <IconTag /> },
          ].map((f, i) => (
            <div key={i} style={{ background: '#0D1117', border: '1px solid #1E2535', borderRadius: 14, padding: '18px 16px' }}>
              <div style={{ marginBottom: 10 }}>{f.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#E8EDF5', marginBottom: 4 }}>{f.title}</div>
              <div style={{ fontSize: 12, color: '#4A5568', lineHeight: 1.5 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── DEMO ── */}
      <DemoEquipo />

      {/* ── PRICING ── */}
      <section ref={pricingRef} style={{ padding: '80px 5%', background: '#0A0C0F' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#F4A020', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>
              Planes y precios
            </div>
            <h2 style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 'clamp(36px, 5vw, 56px)',
              letterSpacing: 2, color: '#E8EDF5', lineHeight: 1.1, marginBottom: 16,
            }}>
              ELIGE EL PLAN IDEAL<br />
              <span style={{ color: '#F4A020' }}>PARA TU EMPRESA</span>
            </h2>
            <p style={{ fontSize: 14, color: '#7A8BA8', maxWidth: 500, margin: '0 auto' }}>
              Precios en MXN · IVA no incluido · Pago único sin mensualidades (excepto Plan Pro)
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20, alignItems: 'start' }}>
            {PLANES.map(plan => <PlanCard key={plan.id} plan={plan} onCTA={handleCTA} />)}
          </div>
          <p style={{ textAlign: 'center', fontSize: 12, color: '#2A3448', marginTop: 28 }}>
            ¿Dudas sobre qué plan elegir? Contactanos y te ayudamos según tu operación.
          </p>
        </div>
      </section>

      {/* ── CHATBOT ── */}
      <div ref={chatRef}>
        <LubriBot />
      </div>

      {/* ── FOOTER ── */}
      <footer style={{
        padding: '36px 5%', borderTop: '1px solid #1A2030',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="/logo.jpeg" alt="LubriPlan Card" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }} />
          <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 16, letterSpacing: 2, color: '#E8EDF5' }}>
            LUBRIPLAN <span style={{ color: '#F4A020' }}>CARD</span>
          </span>
        </div>
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          <button onClick={() => scrollTo(pricingRef)} style={{ background: 'none', border: 'none', color: '#4A5568', fontSize: 13, cursor: 'pointer' }}>Precios</button>
          <button onClick={() => scrollTo(chatRef)} style={{ background: 'none', border: 'none', color: '#4A5568', fontSize: 13, cursor: 'pointer' }}>Asistente</button>
          <button onClick={() => navigate('/admin/login')} style={{ background: 'none', border: 'none', color: '#4A5568', fontSize: 13, cursor: 'pointer' }}>Admin</button>
        </div>
        <div style={{ fontSize: 12, color: '#2A3448' }}>© 2026 LubriPlan Card · MXN sin IVA</div>
      </footer>
    </div>
  )
}
