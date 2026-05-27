import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

// ─── URL de la plataforma LubriPlan (actualizar cuando esté disponible) ───
const LUBRIPLAN_URL = 'https://app.lubriplan.com'

// ─── Datos de precios ────────────────────────────────────────────────────
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
    incluye: [
      'Ficha digital vía QR',
      'QR digital por equipo',
      'Hasta 3 técnicos',
      'Hasta 30 equipos',
    ],
    noIncluye: [
      'PDF por equipo',
      'Placa QR metálica',
      'Carta rígida a color',
      'Integración LubriPlan',
    ],
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
    mantenimiento: 'Mantenimiento anual opcional: 20% del valor de implementación (~$70/eq/año)',
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
    incluye: [
      'Ficha digital vía QR',
      'Placa QR metálica por equipo',
      'Carta rígida a color',
      'PDF por equipo',
      'Técnicos ilimitados',
      'Equipos ilimitados',
    ],
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
    incluye: [
      'Todo lo del plan Estándar',
      'Ficha sincronizada en tiempo real',
      'Historial de lubricación',
      'Rutas y alertas desde LubriPlan',
      'Dashboard analítico',
      'Técnicos y equipos ilimitados',
    ],
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
    incluye: [
      'Todo del plan Pro o Estándar',
      '100+ equipos con precio especial',
      'Múltiples plantas y sitios',
      'Integración ERP / CMMS',
      'Capacitación presencial',
      'SLA de soporte dedicado',
      'Facturación corporativa',
    ],
    noIncluye: [],
    ejemplos: [],
    cta: 'Contactar',
    ctaSecundario: true,
    nota: 'Con o sin LubriPlan · Visita técnica incluida',
  },
]

// ─── FAQ / Asistente ────────────────────────────────────────────────────
const FAQS = [
  {
    q: '¿Qué es LubriPlan Card?',
    a: 'LubriPlan Card es una herramienta de visualización de cartas de lubricación industrial. El técnico escanea el QR del equipo y accede instantáneamente a su ficha: puntos de lubricación, lubricantes, frecuencias y procedimientos. Es de solo consulta — no incluye historial, rutas ni gestión de tareas. Esas funciones están disponibles integrándose con LubriPlan en el Plan Pro.',
  },
  {
    q: '¿Necesita instalación o una app especial?',
    a: 'No. El técnico escanea el QR con la cámara del celular y accede directamente desde el navegador. Sin descargas, sin registro, sin contraseñas.',
  },
  {
    q: '¿LubriPlan Card incluye historial o rutas de lubricación?',
    a: 'No. LubriPlan Card es únicamente una herramienta de visualización. El historial de lubricación, rutas y alertas son funciones exclusivas de LubriPlan. Ambas plataformas se integran en el Plan Pro.',
  },
  {
    q: '¿Cuántos técnicos puedo agregar?',
    a: 'En el plan Básico hasta 3 técnicos. En los planes Estándar, Pro y Personalizado los técnicos son ilimitados.',
  },
  {
    q: '¿Qué incluye el mantenimiento anual del plan Estándar?',
    a: 'El mantenimiento es opcional y cubre actualización de fichas, reimpresión de tarjetas físicas, altas/bajas de equipos, corrección de fichas, actualizaciones de plataforma, corrección de bugs, respaldo de datos y soporte por WhatsApp y correo con respuesta en 24–48 hrs. Su costo es el 20% del valor de implementación.',
  },
  {
    q: '¿Puedo escalar de un plan a otro?',
    a: 'Sí. Si comenzás con el plan Básico o Estándar y luego querés integrar LubriPlan o necesitás funciones adicionales, podés migrar al plan Pro o Personalizado. Contactanos para recibir una propuesta de actualización.',
  },
]

// ─── Componente Check / X ────────────────────────────────────────────────
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

// ─── Tarjeta de precio ───────────────────────────────────────────────────
function PlanCard({ plan, onCTA }) {
  const [showMant, setShowMant] = useState(false)

  return (
    <div style={{
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      background: plan.ctaSecundario ? '#131820' : plan.destacado ? '#0D1117' : '#0D1117',
      border: plan.destacado
        ? `2px solid ${plan.color}`
        : plan.ctaSecundario
          ? '1px solid #2A3448'
          : '1px solid #1E2535',
      borderRadius: 20,
      padding: '28px 24px 24px',
      gap: 0,
      transition: 'transform 0.2s, box-shadow 0.2s',
      boxShadow: plan.destacado ? `0 0 40px ${plan.color}22` : 'none',
    }}>
      {/* Badge */}
      {plan.badge && (
        <div style={{
          position: 'absolute',
          top: -14,
          left: '50%',
          transform: 'translateX(-50%)',
          background: plan.badgeColor || plan.color,
          color: plan.badgeColor ? '#fff' : '#0A0C0F',
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: 1.2,
          textTransform: 'uppercase',
          padding: '5px 16px',
          borderRadius: 20,
          whiteSpace: 'nowrap',
          fontFamily: "'DM Sans', sans-serif",
        }}>
          {plan.badge}
        </div>
      )}

      {/* Nombre */}
      <div style={{
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: 28,
        letterSpacing: 2,
        color: plan.color,
        marginBottom: 4,
      }}>
        {plan.nombre}
      </div>

      {/* Precio */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 6 }}>
        <span style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: plan.precio === 'A convenir' ? 30 : 48,
          letterSpacing: plan.precio === 'A convenir' ? 1 : 0,
          color: '#E8EDF5',
          lineHeight: 1,
        }}>
          {plan.precio}
        </span>
        {plan.unidad && (
          <span style={{ fontSize: 13, color: '#7A8BA8', fontFamily: "'DM Sans', sans-serif" }}>
            {plan.unidad}
          </span>
        )}
      </div>
      <div style={{ fontSize: 12, color: '#4A5568', marginBottom: 16, fontFamily: "'DM Sans', sans-serif" }}>
        MXN · IVA no incluido
      </div>

      {/* Subtítulo */}
      <div style={{
        fontSize: 13, color: '#8A9BB8',
        fontFamily: "'DM Sans', sans-serif",
        fontWeight: 500,
        marginBottom: 20,
        paddingBottom: 20,
        borderBottom: '1px solid #1E2535',
      }}>
        {plan.subtitulo}
      </div>

      {/* Incluye */}
      {plan.incluye.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#4A5568', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10, fontFamily: "'DM Sans', sans-serif" }}>
            Incluye
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {plan.incluye.map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <CheckIcon color={plan.color} />
                <span style={{ fontSize: 13, color: '#B8C5D8', fontFamily: "'DM Sans', sans-serif", lineHeight: 1.4 }}>
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No incluye */}
      {plan.noIncluye.length > 0 && (
        <div style={{ marginBottom: 12, marginTop: 8 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#4A5568', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10, fontFamily: "'DM Sans', sans-serif" }}>
            No incluye
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {plan.noIncluye.map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <XIcon />
                <span style={{ fontSize: 13, color: '#4A5568', fontFamily: "'DM Sans', sans-serif", lineHeight: 1.4 }}>
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Nota plan personalizado */}
      {plan.nota && (
        <div style={{
          background: '#1C2230',
          borderRadius: 10,
          padding: '10px 14px',
          fontSize: 12,
          color: '#7A8BA8',
          fontFamily: "'DM Sans', sans-serif",
          marginBottom: 12,
          marginTop: 4,
        }}>
          {plan.nota}
        </div>
      )}

      {/* Mantenimiento */}
      {plan.mantenimiento && (
        <div style={{ marginTop: 8, marginBottom: 12 }}>
          <button
            onClick={() => setShowMant(v => !v)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'none', border: 'none', cursor: 'pointer',
              padding: 0, color: '#7A8BA8',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="7" r="6" stroke="#7A8BA8" strokeWidth="1.2" />
              <path d="M7 5v4M7 4h.01" stroke="#7A8BA8" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            <span style={{ fontSize: 12, fontFamily: "'DM Sans', sans-serif", textAlign: 'left' }}>
              {plan.mantenimiento}
            </span>
            {plan.mantenimientoDetalle && (
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ transition: 'transform 0.2s', transform: showMant ? 'rotate(180deg)' : 'none', flexShrink: 0 }}>
                <path d="M2 4l4 4 4-4" stroke="#7A8BA8" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
          {showMant && plan.mantenimientoDetalle && (
            <div style={{ marginTop: 8, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {plan.mantenimientoDetalle.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <CheckIcon color="#7A8BA8" />
                  <span style={{ fontSize: 12, color: '#7A8BA8', fontFamily: "'DM Sans', sans-serif" }}>{item}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Ejemplos de precio */}
      {plan.ejemplos.length > 0 && (
        <div style={{
          background: '#1C2230', borderRadius: 10,
          padding: '10px 14px', marginBottom: 16, marginTop: 4,
        }}>
          <div style={{ fontSize: 10, color: '#4A5568', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6, fontFamily: "'DM Sans', sans-serif" }}>
            Ejemplos
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 16px' }}>
            {plan.ejemplos.map((e, i) => (
              <span key={i} style={{ fontSize: 12, color: '#8A9BB8', fontFamily: 'monospace' }}>{e}</span>
            ))}
          </div>
        </div>
      )}

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* CTA */}
      <button
        onClick={() => onCTA(plan)}
        style={{
          marginTop: 20,
          padding: '14px',
          borderRadius: 12,
          border: plan.ctaSecundario ? `1px solid #2A3448` : plan.destacado ? 'none' : `1px solid ${plan.color}50`,
          background: plan.destacado ? plan.color : plan.ctaSecundario ? '#1C2230' : 'transparent',
          color: plan.destacado ? '#0A0C0F' : plan.color,
          fontSize: 14,
          fontWeight: 700,
          cursor: 'pointer',
          fontFamily: "'DM Sans', sans-serif",
          transition: 'background 0.15s, transform 0.1s',
          letterSpacing: 0.3,
        }}
        onMouseEnter={e => {
          if (!plan.destacado && !plan.ctaSecundario) e.currentTarget.style.background = plan.color + '15'
          if (plan.destacado) e.currentTarget.style.transform = 'translateY(-1px)'
        }}
        onMouseLeave={e => {
          if (!plan.destacado && !plan.ctaSecundario) e.currentTarget.style.background = 'transparent'
          if (plan.destacado) e.currentTarget.style.transform = 'translateY(0)'
        }}
      >
        {plan.cta}
      </button>
    </div>
  )
}

// ─── FAQ item ────────────────────────────────────────────────────────────
function FAQItem({ item, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div style={{
      background: '#0D1117',
      border: '1px solid #1E2535',
      borderRadius: 12,
      overflow: 'hidden',
      transition: 'border-color 0.15s',
    }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
          gap: 12,
        }}
      >
        <span style={{ fontSize: 14, fontWeight: 600, color: '#E8EDF5', fontFamily: "'DM Sans', sans-serif", flex: 1, lineHeight: 1.4 }}>
          {item.q}
        </span>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none', flexShrink: 0 }}>
          <path d="M4 7l5 5 5-5" stroke="#7A8BA8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div style={{ padding: '0 20px 18px', fontSize: 14, color: '#8A9BB8', fontFamily: "'DM Sans', sans-serif", lineHeight: 1.7 }}>
          {item.a}
        </div>
      )}
    </div>
  )
}

// ─── Main LandingPage ────────────────────────────────────────────────────
export default function LandingPage() {
  const navigate = useNavigate()
  const pricingRef = useRef(null)
  const faqRef = useRef(null)

  const scrollTo = (ref) => ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  const handleCTA = (plan) => {
    if (plan.id === 'personalizado') {
      window.location.href = 'mailto:contacto@lubriplan.com?subject=Consulta%20Plan%20Personalizado%20LubriPlan%20Card'
    } else {
      scrollTo(pricingRef)
    }
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      overflowY: 'auto',
      overflowX: 'hidden',
      background: '#080A0E',
      fontFamily: "'DM Sans', sans-serif",
      zIndex: 1,
    }}>

      {/* ══ NAV ══ */}
      <nav style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'rgba(8,10,14,0.92)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid #1A2030',
        padding: '0 5%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 64,
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
              display: 'none',
            }}
            className="nav-precios-btn"
          >
            Precios
          </button>
          <button
            onClick={() => navigate('/entrar')}
            style={{
              padding: '9px 20px', background: '#F4A020',
              border: 'none', borderRadius: 8, color: '#0A0C0F',
              fontSize: 13, fontWeight: 700, cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif",
              transition: 'opacity 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            Entrar
          </button>
        </div>
      </nav>

      {/* ══ HERO ══ */}
      <section style={{
        minHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 5% 60px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Glow background */}
        <div style={{
          position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%,-50%)',
          width: 600, height: 400, borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(244,160,32,0.08) 0%, transparent 70%)',
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
          letterSpacing: 4,
          color: '#E8EDF5',
          lineHeight: 1,
          marginBottom: 12,
          maxWidth: 900,
        }}>
          CARTAS DE LUBRICACIÓN
          <br />
          <span style={{ color: '#F4A020' }}>SIEMPRE DISPONIBLES</span>
        </h1>

        <p style={{
          fontSize: 'clamp(16px, 2vw, 20px)',
          color: '#7A8BA8',
          maxWidth: 600,
          lineHeight: 1.7,
          marginBottom: 40,
        }}>
          El técnico escanea el QR del equipo y accede instantáneamente a su ficha de lubricación.
          Sin apps, sin contraseñas, sin demoras.
        </p>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            onClick={() => scrollTo(pricingRef)}
            style={{
              padding: '15px 36px', background: '#F4A020',
              border: 'none', borderRadius: 12, color: '#0A0C0F',
              fontSize: 15, fontWeight: 700, cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif",
              transition: 'transform 0.15s, opacity 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.opacity = '0.9' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.opacity = '1' }}
          >
            Ver planes y precios
          </button>
          <button
            onClick={() => scrollTo(faqRef)}
            style={{
              padding: '15px 36px',
              background: 'transparent',
              border: '1px solid #2A3448',
              borderRadius: 12, color: '#E8EDF5',
              fontSize: 15, fontWeight: 500, cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif",
              transition: 'border-color 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#F4A020'}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#2A3448'}
          >
            Conocer más
          </button>
        </div>

        {/* Mockup visual */}
        <div style={{
          marginTop: 60,
          display: 'flex',
          gap: 20,
          justifyContent: 'center',
          flexWrap: 'wrap',
        }}>
          {[
            { label: 'Escanea QR', icon: '📱', desc: 'Con la cámara del celular' },
            { label: 'Accede a la ficha', icon: '📋', desc: 'Sin apps ni registro' },
            { label: 'Lubrica correctamente', icon: '✅', desc: 'Información precisa siempre' },
          ].map((step, i) => (
            <div key={i} style={{
              background: '#0D1117',
              border: '1px solid #1E2535',
              borderRadius: 16,
              padding: '20px 24px',
              textAlign: 'center',
              minWidth: 160,
              maxWidth: 200,
            }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>{step.icon}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#E8EDF5', marginBottom: 4 }}>{step.label}</div>
              <div style={{ fontSize: 12, color: '#4A5568' }}>{step.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ QUÉ ES ══ */}
      <section style={{
        padding: '80px 5%',
        maxWidth: 1200,
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: 60,
        alignItems: 'center',
      }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#F4A020', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16 }}>
            ¿Qué es LubriPlan Card?
          </div>
          <h2 style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 'clamp(36px, 5vw, 54px)',
            letterSpacing: 2,
            color: '#E8EDF5',
            lineHeight: 1.1,
            marginBottom: 20,
          }}>
            LA FICHA TÉCNICA<br />DE TUS EQUIPOS,<br />
            <span style={{ color: '#F4A020' }}>SIEMPRE A MANO</span>
          </h2>
          <p style={{ fontSize: 15, color: '#7A8BA8', lineHeight: 1.8, marginBottom: 24 }}>
            LubriPlan Card es una herramienta de <strong style={{ color: '#E8EDF5' }}>visualización de cartas de lubricación industrial</strong>.
            No reemplaza tu sistema de gestión — lo complementa en el piso de planta.
          </p>
          <p style={{ fontSize: 14, color: '#4A5568', lineHeight: 1.7, marginBottom: 28,
            background: '#0D1117', borderRadius: 12, padding: '14px 16px', border: '1px solid #1E2535' }}>
            LubriPlan Card es visualización pura. No incluye historial, rutas de lubricación ni alertas.
            Para esas funciones, existe la integración con <span style={{ color: '#F4A020', fontWeight: 600 }}>LubriPlan</span> en el Plan Pro.
          </p>
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
          <p style={{ fontSize: 11, color: '#2A3448', marginTop: 12 }}>* Una vez cargada la ficha, funciona offline en el navegador.</p>
        </div>

        {/* Features grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {[
            { title: 'QR por equipo', desc: 'Código único que identifica cada máquina', icon: '🔲' },
            { title: 'Sin apps', desc: 'Acceso directo desde el navegador', icon: '🌐' },
            { title: 'Imágenes técnicas', desc: 'Fotos con puntos de lubricación marcados', icon: '📸' },
            { title: 'Código por color', desc: 'Frecuencias visualizadas al instante', icon: '🎨' },
            { title: 'Multi-técnico', desc: 'Hasta ilimitados según el plan', icon: '👥' },
            { title: 'Placa metálica', desc: 'QR físico resistente para el equipo (Estándar+)', icon: '🏷️' },
          ].map((f, i) => (
            <div key={i} style={{
              background: '#0D1117',
              border: '1px solid #1E2535',
              borderRadius: 14,
              padding: '18px 16px',
            }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>{f.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#E8EDF5', marginBottom: 4 }}>{f.title}</div>
              <div style={{ fontSize: 12, color: '#4A5568', lineHeight: 1.5 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ PRICING ══ */}
      <section ref={pricingRef} style={{ padding: '80px 5%', background: '#0A0C0F' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#F4A020', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>
              Planes y precios
            </div>
            <h2 style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 'clamp(36px, 5vw, 56px)',
              letterSpacing: 2,
              color: '#E8EDF5',
              lineHeight: 1.1,
              marginBottom: 16,
            }}>
              ELIGE EL PLAN IDEAL<br />
              <span style={{ color: '#F4A020' }}>PARA TU EMPRESA</span>
            </h2>
            <p style={{ fontSize: 14, color: '#7A8BA8', maxWidth: 500, margin: '0 auto' }}>
              Precios en MXN · IVA no incluido · Pago único, sin mensualidades (excepto Plan Pro con suscripción LubriPlan)
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 20,
            alignItems: 'start',
          }}>
            {PLANES.map(plan => (
              <PlanCard key={plan.id} plan={plan} onCTA={handleCTA} />
            ))}
          </div>

          <p style={{ textAlign: 'center', fontSize: 12, color: '#2A3448', marginTop: 28 }}>
            ¿Tenés dudas sobre qué plan elegir? Contactanos y te ayudamos a decidir según tu operación.
          </p>
        </div>
      </section>

      {/* ══ FAQ / ASISTENTE ══ */}
      <section ref={faqRef} style={{ padding: '80px 5%', background: '#080A0E' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#F4A020', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>
              Asistente LubriPlan Card
            </div>
            <h2 style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 'clamp(30px, 4vw, 46px)',
              letterSpacing: 2,
              color: '#E8EDF5',
              marginBottom: 12,
            }}>
              PREGUNTAS FRECUENTES
            </h2>
            <p style={{ fontSize: 14, color: '#4A5568' }}>
              Respuestas sobre qué es LubriPlan Card, qué incluye y cómo funciona
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {FAQS.map((item, i) => (
              <FAQItem key={i} item={item} defaultOpen={i === 0} />
            ))}
          </div>

          {/* Card de contacto */}
          <div style={{
            marginTop: 40,
            background: '#0D1117',
            border: '1px solid #1E2535',
            borderRadius: 16,
            padding: '28px 32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 20,
          }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#E8EDF5', marginBottom: 4 }}>
                ¿Tenés más preguntas?
              </div>
              <div style={{ fontSize: 13, color: '#7A8BA8' }}>
                Contactanos por WhatsApp o correo y te respondemos en menos de 24 hrs.
              </div>
            </div>
            <button
              onClick={() => window.open('mailto:contacto@lubriplan.com', '_blank')}
              style={{
                padding: '12px 24px',
                background: '#F4A020',
                border: 'none',
                borderRadius: 10,
                color: '#0A0C0F',
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif",
                flexShrink: 0,
              }}
            >
              Contactar
            </button>
          </div>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer style={{
        padding: '40px 5%',
        borderTop: '1px solid #1A2030',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="/logo.jpeg" alt="LubriPlan Card" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }} />
          <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 16, letterSpacing: 2, color: '#E8EDF5' }}>
            LUBRIPLAN <span style={{ color: '#F4A020' }}>CARD</span>
          </span>
        </div>

        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          <button onClick={() => scrollTo(pricingRef)} style={{ background: 'none', border: 'none', color: '#4A5568', fontSize: 13, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
            Precios
          </button>
          <button onClick={() => scrollTo(faqRef)} style={{ background: 'none', border: 'none', color: '#4A5568', fontSize: 13, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
            FAQ
          </button>
          <button onClick={() => navigate('/admin/login')} style={{ background: 'none', border: 'none', color: '#4A5568', fontSize: 13, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
            Admin
          </button>
        </div>

        <div style={{ fontSize: 12, color: '#2A3448' }}>
          © 2026 LubriPlan Card · Todos los precios en MXN sin IVA
        </div>
      </footer>

    </div>
  )
}
