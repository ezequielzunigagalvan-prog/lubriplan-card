import { useState, useEffect, useRef, useCallback } from 'react'

const FONT = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'

// ─── QA data ─────────────────────────────────────────────────────────────
const BOT_INTRO = {
  text: '¡Hola! Soy el asistente de LubriPlan Card. Puedo responderte cualquier consulta sobre la plataforma. ¿Por dónde quieres empezar?',
  chips: ['¿Qué es LubriPlan Card?', '¿Necesita instalación?', '¿Incluye historial?'],
}

const QA = {
  '¿Qué es LubriPlan Card?': {
    text: 'LubriPlan Card es una herramienta de visualización de cartas de lubricación industrial. El técnico escanea el QR del equipo y accede a su ficha: puntos de lubricación, lubricantes, frecuencias y procedimientos.\n\nEs una solución de solo consulta — no incluye historial, rutas ni alertas. Esas funciones están disponibles integrando con LubriPlan en el Plan Pro.',
    chips: ['¿Necesita instalación?', '¿Qué incluye cada plan?', '¿Incluye historial?'],
  },
  '¿Necesita instalación?': {
    text: 'No. El técnico solo necesita la cámara de su celular para escanear el QR. Accede directamente desde el navegador, sin descargas, sin registro y sin contraseñas.\n\nEl administrador sí accede a un panel web para cargar y actualizar la información de los equipos.',
    chips: ['¿Qué es LubriPlan Card?', '¿Cuántos técnicos puedo agregar?', '¿Qué incluye cada plan?'],
  },
  '¿Incluye historial?': {
    text: 'No. LubriPlan Card es visualización pura. El técnico puede ver qué lubricante usar, cuándo y cómo, pero no registra si la actividad fue realizada.\n\nEl historial de lubricación, rutas y alertas son funciones exclusivas de LubriPlan. Ambas plataformas se integran en el Plan Pro.',
    chips: ['¿Qué es el plan Pro?', '¿Qué incluye cada plan?', '¿Qué es LubriPlan Card?'],
  },
  '¿Qué incluye el plan Estándar?': {
    text: 'El plan Estándar incluye:\n\n✓ Ficha digital vía QR\n✓ Placa QR metálica por equipo\n✓ Carta rígida a color\n✓ PDF por equipo\n✓ Técnicos ilimitados\n✓ Equipos ilimitados\n\nTambién ofrece mantenimiento anual opcional (20% del valor) que cubre actualización de fichas, reimpresión, altas/bajas, soporte WhatsApp y más.',
    chips: ['¿Qué es el plan Pro?', '¿Qué incluye el mantenimiento?', '¿Qué incluye el plan Estándar?'],
  },
  '¿Qué es el plan Pro?': {
    text: 'El plan Pro combina LubriPlan Card + la plataforma LubriPlan. Incluye todo lo del plan Estándar más:\n\n✓ Ficha sincronizada en tiempo real con LubriPlan\n✓ Historial de lubricación\n✓ Rutas y alertas automáticas\n✓ Dashboard analítico\n\nEl mantenimiento está incluido en la suscripción mensual de LubriPlan.',
    chips: ['¿Qué incluye el plan Estándar?', '¿Incluye historial?', '¿Necesita instalación?'],
  },
  '¿Qué incluye cada plan?': {
    text: 'Tenemos 4 planes:\n\n• Básico ($80/eq): QR digital, hasta 3 técnicos y 30 equipos\n• Estándar ($350/eq): placa metálica, carta rígida, PDF, ilimitado\n• Pro ($350/eq + LubriPlan): todo lo anterior + historial y rutas\n• Personalizado: 100+ equipos con precio especial\n\n¿Quieres que te explique alguno en detalle?',
    chips: ['¿Qué incluye el plan Estándar?', '¿Qué es el plan Pro?', '¿Necesita instalación?'],
  },
  '¿Qué incluye el mantenimiento?': {
    text: 'El mantenimiento anual del plan Estándar es opcional y cuesta el 20% del valor de implementación (~$70/eq/año). Incluye:\n\n✓ Actualización de fichas técnicas\n✓ Reimpresión de tarjetas físicas\n✓ Altas y bajas de equipos\n✓ Corrección de fichas\n✓ Actualizaciones de plataforma\n✓ Respaldo y recuperación de datos\n✓ Soporte WhatsApp y correo (respuesta 24–48 hrs)',
    chips: ['¿Qué incluye el plan Estándar?', '¿Cuántos técnicos puedo agregar?', '¿Necesita instalación?'],
  },
  '¿Cuántos técnicos puedo agregar?': {
    text: 'Depende del plan:\n\n• Básico: hasta 3 técnicos\n• Estándar: técnicos ilimitados\n• Pro: técnicos ilimitados\n• Personalizado: ilimitados con gestión centralizada\n\nCada técnico accede con su PIN desde la app y puede consultar las fichas de los equipos que tenga asignados.',
    chips: ['¿Qué incluye cada plan?', '¿Necesita instalación?', '¿Qué es LubriPlan Card?'],
  },
}

const DEFAULT_RESPONSE = {
  text: 'Esa consulta la manejo mejor en directo. Te recomiendo contactarnos por WhatsApp o correo para que podamos ayudarte en detalle.',
  chips: ['¿Qué es LubriPlan Card?', '¿Necesita instalación?', '¿Qué incluye cada plan?'],
}

function findAnswer(text) {
  const trimmed = text.trim()
  if (QA[trimmed]) return QA[trimmed]
  const lower = trimmed.toLowerCase()
  for (const [key, value] of Object.entries(QA)) {
    const cleanKey = key.toLowerCase().replace(/[¿?¡!]/g, '').trim()
    if (lower.includes(cleanKey) || cleanKey.includes(lower)) return value
  }
  return DEFAULT_RESPONSE
}

function BotText({ text, isUser }) {
  if (isUser) return <div style={bubbleTextUser}>{text}</div>
  const parts = String(text || '').split('\n')
  return (
    <div style={bubbleTextBot}>
      {parts.map((line, i) => (
        <span key={i}>{line}{i < parts.length - 1 && <br />}</span>
      ))}
    </div>
  )
}

export default function CardChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [value, setValue] = useState('')
  const [typing, setTyping] = useState(false)
  const [pendingChips, setPendingChips] = useState([])
  const [hasNewMsg, setHasNewMsg] = useState(false)

  const panelRef = useRef(null)
  const textareaRef = useRef(null)
  const bottomRef = useRef(null)

  const isEmpty = messages.length === 0 && !typing

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  useEffect(() => {
    if (!open) return
    const onDoc = (e) => {
      const btn = document.getElementById('lp-card-fab')
      if (btn?.contains(e.target)) return
      if (!panelRef.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  const sendMessage = useCallback((text) => {
    if (typing) return
    const trimmed = text.trim()
    if (!trimmed) return
    setPendingChips([])
    setMessages(prev => [...prev, { role: 'user', content: trimmed }])
    setTyping(true)
    const response = findAnswer(trimmed)
    setTimeout(() => {
      setTyping(false)
      setMessages(prev => [...prev, { role: 'assistant', content: response.text }])
      setPendingChips(response.chips || [])
      if (!open) setHasNewMsg(true)
    }, 800)
  }, [typing, open])

  const submit = () => {
    if (!value.trim() || typing) return
    sendMessage(value.trim())
    setValue('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit() }
  }

  const onInput = (e) => {
    setValue(e.target.value)
    const ta = textareaRef.current
    if (ta) {
      ta.style.height = 'auto'
      ta.style.height = `${Math.min(ta.scrollHeight, 110)}px`
    }
  }

  const handleOpen = () => {
    setOpen(v => !v)
    setHasNewMsg(false)
  }

  const canSend = value.trim().length > 0 && !typing

  return (
    <>
      <style>{`
        @keyframes lpCardPop {
          0%  { opacity: 0; transform: scale(0.88) translateY(18px); }
          100%{ opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes lpCardFabPulse {
          0%,100%{ box-shadow: 0 8px 28px rgba(99,102,241,0.45), 0 0 0 0 rgba(99,102,241,0.22); }
          50%    { box-shadow: 0 12px 36px rgba(99,102,241,0.65), 0 0 0 8px rgba(99,102,241,0); }
        }
        @keyframes lpCardDot {
          0%,80%,100%{ opacity:0.25; transform:translateY(0); }
          40%        { opacity:1; transform:translateY(-4px); }
        }
        @keyframes lpCardBadge {
          0%  { transform: scale(0); }
          60% { transform: scale(1.3); }
          100%{ transform: scale(1); }
        }
        #lp-card-fab { transition: transform 150ms cubic-bezier(0.34,1.56,0.64,1), box-shadow 150ms ease; }
        #lp-card-fab:hover { transform: scale(1.10) !important; }
        #lp-card-fab:active { transform: scale(0.93) !important; }
        .lp-cc-chip:hover {
          background: rgba(99,102,241,0.14) !important;
          border-color: rgba(99,102,241,0.45) !important;
          color: #a5b4fc !important;
        }
        .lp-cc-sgbtn:hover {
          background: rgba(99,102,241,0.12) !important;
          border-color: rgba(99,102,241,0.42) !important;
          color: #a5b4fc !important;
          transform: translateY(-1px);
        }
        .lp-cc-icobtn:hover { background: rgba(255,255,255,0.10) !important; }
        .lp-cc-textarea:focus {
          outline: none;
          border-color: rgba(99,102,241,0.50) !important;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.12) !important;
        }
      `}</style>

      {open && (
        <div ref={panelRef} style={panelStyle} role="dialog" aria-label="Asistente LubriPlan Card">
          {/* Header */}
          <div style={headerStyle}>
            <div style={headerGlowStyle} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, zIndex: 1 }}>
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div style={avatarInnerStyle}>
                  <svg viewBox="0 0 32 32" fill="none" style={{ width: 20, height: 20 }}>
                    <rect width="32" height="32" rx="8" fill="#6366f1" />
                    <rect x="4" y="10" width="24" height="14" rx="3" fill="#fff" fillOpacity="0.15" />
                    <rect x="4" y="10" width="24" height="5" rx="2" fill="#fff" fillOpacity="0.30" />
                    <rect x="6" y="18" width="8" height="2" rx="1" fill="#fff" fillOpacity="0.60" />
                    <circle cx="24" cy="19" r="2" fill="#818cf8" />
                  </svg>
                </div>
                <div style={avatarOnlineStyle} />
              </div>
              <div>
                <div style={{ fontWeight: 900, fontSize: 13, color: '#f1f5f9', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                  Asistente LubriPlan Card
                </div>
                <div style={{ fontWeight: 700, fontSize: 10, color: '#64748b', marginTop: 2 }}>
                  {typing ? 'Escribiendo…' : 'Preguntas sobre LubriPlan Card'}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6, zIndex: 1 }}>
              {messages.length > 0 && (
                <button
                  type="button"
                  className="lp-cc-icobtn"
                  onClick={() => { setMessages([]); setPendingChips([]) }}
                  style={iconBtnStyle}
                  title="Limpiar"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14H6L5 6" />
                    <path d="M10 11v6M14 11v6M9 6V4h6v2" />
                  </svg>
                </button>
              )}
              <button
                type="button"
                className="lp-cc-icobtn"
                onClick={() => setOpen(false)}
                style={iconBtnStyle}
                title="Cerrar (Esc)"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>

          {/* Message area */}
          <div style={msgAreaStyle}>
            {isEmpty ? (
              <div style={emptyWrapStyle}>
                <div style={emptyCardStyle}>
                  <div style={emptyLogoStyle}>
                    <svg viewBox="0 0 32 32" fill="none" style={{ width: 28, height: 28 }}>
                      <rect width="32" height="32" rx="8" fill="rgba(99,102,241,0.18)" />
                      <rect x="4" y="10" width="24" height="14" rx="3" fill="rgba(99,102,241,0.5)" />
                      <rect x="4" y="10" width="24" height="5" rx="2" fill="rgba(99,102,241,0.8)" />
                      <rect x="6" y="18" width="8" height="2" rx="1" fill="#a5b4fc" />
                      <circle cx="24" cy="19" r="2" fill="#818cf8" />
                    </svg>
                  </div>
                  <div style={{ fontWeight: 900, fontSize: 14, color: '#f1f5f9', letterSpacing: '-0.02em' }}>
                    Hola, soy el asistente de LubriPlan Card
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', lineHeight: 1.6, maxWidth: 280, textAlign: 'center' }}>
                    Pregúntame sobre planes, precios y cómo funciona la tarjeta digital de lubricación.
                  </div>
                </div>

                <div style={{ fontSize: 10, fontWeight: 900, color: '#475569', letterSpacing: 1, textTransform: 'uppercase', alignSelf: 'flex-start', paddingLeft: 2 }}>
                  Preguntas frecuentes
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7, width: '100%' }}>
                  {BOT_INTRO.chips.map((chip, i) => {
                    const isLast = BOT_INTRO.chips.length % 2 !== 0 && i === BOT_INTRO.chips.length - 1
                    return (
                      <button
                        key={chip}
                        type="button"
                        className="lp-cc-sgbtn"
                        onClick={() => sendMessage(chip)}
                        style={{ ...suggestBtnStyle, ...(isLast ? { gridColumn: '1 / -1' } : {}) }}
                      >
                        <span style={{ fontSize: 11, fontWeight: 800, lineHeight: 1.3 }}>{chip}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '12px 12px 6px' }}>
                {messages.map((m, i) => {
                  const isUser = m.role === 'user'
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-end', gap: 7, flexDirection: isUser ? 'row-reverse' : 'row' }}>
                      {!isUser && (
                        <div style={botAvatarStyle}>LP</div>
                      )}
                      <div style={{ maxWidth: '84%', display: 'flex', flexDirection: 'column', gap: 2, alignItems: isUser ? 'flex-end' : 'flex-start' }}>
                        {!isUser && (
                          <div style={{ fontSize: 9, fontWeight: 900, color: '#818cf8', letterSpacing: 0.8, textTransform: 'uppercase', paddingLeft: 2, marginBottom: 1 }}>
                            LubriPlan Card
                          </div>
                        )}
                        <BotText text={m.content} isUser={isUser} />
                      </div>
                      {isUser && (
                        <div style={userAvatarStyle}>Tú</div>
                      )}
                    </div>
                  )
                })}

                {typing && (
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 7 }}>
                    <div style={botAvatarStyle}>LP</div>
                    <div style={{ padding: '11px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(99,102,241,0.16)', borderRadius: 15, borderBottomLeftRadius: 4, display: 'flex', gap: 5, alignItems: 'center' }}>
                      {[0, 1, 2].map(i => (
                        <span key={i} style={{ width: 7, height: 7, borderRadius: 999, background: '#6366f1', display: 'inline-block', animation: `lpCardDot 1.1s ease-in-out ${i * 0.18}s infinite` }} />
                      ))}
                    </div>
                  </div>
                )}

                {pendingChips.length > 0 && !typing && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, paddingLeft: 33, paddingBottom: 2 }}>
                    {pendingChips.map(chip => (
                      <button
                        key={chip}
                        type="button"
                        className="lp-cc-chip"
                        onClick={() => sendMessage(chip)}
                        style={qaChipStyle}
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                )}

                <div ref={bottomRef} />
              </div>
            )}
          </div>

          {/* Input */}
          <div style={inputWrapStyle}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 7 }}>
              <textarea
                ref={textareaRef}
                value={value}
                onInput={onInput}
                onChange={e => setValue(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder={typing ? 'Procesando…' : 'Escribe tu pregunta…'}
                disabled={typing}
                rows={1}
                className="lp-cc-textarea"
                style={{ ...textareaStyle, opacity: typing ? 0.55 : 1 }}
              />
              <button
                type="button"
                onClick={submit}
                disabled={!canSend}
                title="Enviar (Enter)"
                style={{ ...sendBtnStyle, opacity: canSend ? 1 : 0.32, cursor: canSend ? 'pointer' : 'default' }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
            <div style={{ marginTop: 5, fontSize: 10, fontWeight: 700, color: '#334155', letterSpacing: 0.1, textAlign: 'center' }}>
              Enter para enviar · o selecciona una pregunta sugerida
            </div>
          </div>
        </div>
      )}

      {/* FAB */}
      <button
        id="lp-card-fab"
        type="button"
        onClick={handleOpen}
        style={{
          ...fabStyle,
          background: open
            ? 'linear-gradient(135deg, #1e1b4b 0%, #0f0a2e 100%)'
            : 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
          animation: !open && messages.length === 0
            ? 'lpCardFabPulse 2.6s ease-in-out infinite'
            : 'none',
          border: open
            ? '1px solid rgba(99,102,241,0.25)'
            : '1px solid rgba(129,140,248,0.40)',
        }}
        title={open ? 'Cerrar asistente' : 'Hablar con el asistente de LubriPlan Card'}
        aria-label={open ? 'Cerrar asistente' : 'Abrir asistente'}
        aria-expanded={open}
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg viewBox="0 0 32 32" fill="none" style={{ width: 26, height: 26 }}>
            <rect x="2" y="8" width="28" height="17" rx="3" fill="white" fillOpacity="0.9" />
            <rect x="2" y="8" width="28" height="6" rx="2" fill="white" />
            <rect x="5" y="19" width="9" height="2" rx="1" fill="rgba(99,102,241,0.7)" />
            <circle cx="26" cy="20" r="2.5" fill="#a5b4fc" />
          </svg>
        )}

        {hasNewMsg && !open && (
          <span style={{ position: 'absolute', top: 4, right: 4, width: 12, height: 12, borderRadius: 999, background: '#22c55e', border: '2px solid #0c0a1e', animation: 'lpCardBadge 380ms cubic-bezier(0.22,1,0.36,1) both' }} />
        )}

        {!open && messages.length === 0 && (
          <div style={{ position: 'absolute', right: 'calc(100% + 12px)', top: '50%', transform: 'translateY(-50%)', background: '#0f0a2e', color: '#e2e8f0', fontSize: 12, fontWeight: 800, padding: '7px 13px', borderRadius: 10, whiteSpace: 'nowrap', boxShadow: '0 8px 28px rgba(2,2,20,0.40)', border: '1px solid rgba(99,102,241,0.20)', pointerEvents: 'none', letterSpacing: 0.1 }}>
            ¿Preguntas sobre LubriPlan Card?
          </div>
        )}
      </button>
    </>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────

const panelStyle = {
  position: 'fixed',
  bottom: 88,
  right: 20,
  width: 'min(400px, calc(100vw - 24px))',
  height: 'min(540px, calc(100dvh - 112px))',
  background: 'linear-gradient(180deg, #0f0a2e 0%, #0c0a1e 100%)',
  border: '1px solid rgba(99,102,241,0.20)',
  borderTop: '2px solid rgba(99,102,241,0.40)',
  borderRadius: 24,
  boxShadow: '0 40px 100px rgba(2,2,20,0.65), 0 0 0 1px rgba(99,102,241,0.08)',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  zIndex: 9999,
  animation: 'lpCardPop 240ms cubic-bezier(0.22,1,0.36,1) both',
  fontFamily: FONT,
}

const headerStyle = {
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '12px 14px 11px',
  background: 'rgba(10,8,30,0.85)',
  borderBottom: '1px solid rgba(99,102,241,0.16)',
  flexShrink: 0,
  overflow: 'hidden',
}

const headerGlowStyle = {
  position: 'absolute',
  top: -40, right: -20,
  width: 140, height: 140,
  borderRadius: 999,
  background: 'rgba(99,102,241,0.15)',
  filter: 'blur(36px)',
  pointerEvents: 'none',
}

const avatarInnerStyle = {
  width: 38, height: 38,
  borderRadius: 12,
  background: 'rgba(99,102,241,0.15)',
  border: '1.5px solid rgba(99,102,241,0.38)',
  display: 'grid',
  placeItems: 'center',
}

const avatarOnlineStyle = {
  position: 'absolute',
  bottom: -2, right: -2,
  width: 10, height: 10,
  borderRadius: 999,
  background: '#22c55e',
  border: '2px solid #0c0a1e',
}

const iconBtnStyle = {
  width: 28, height: 28,
  border: '1px solid rgba(99,102,241,0.18)',
  background: 'rgba(99,102,241,0.06)',
  borderRadius: 9,
  cursor: 'pointer',
  color: '#64748b',
  display: 'grid',
  placeItems: 'center',
  transition: 'background 120ms ease',
}

const msgAreaStyle = {
  flex: 1,
  overflowY: 'auto',
  overflowX: 'hidden',
  WebkitOverflowScrolling: 'touch',
}

const emptyWrapStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '16px 14px 12px',
  gap: 12,
}

const emptyCardStyle = {
  width: '100%',
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(99,102,241,0.18)',
  borderRadius: 18,
  padding: '16px 14px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 8,
  textAlign: 'center',
}

const emptyLogoStyle = {
  width: 52, height: 52,
  borderRadius: 14,
  background: 'rgba(99,102,241,0.12)',
  border: '1.5px solid rgba(99,102,241,0.30)',
  display: 'grid',
  placeItems: 'center',
  boxShadow: '0 0 0 6px rgba(99,102,241,0.06)',
}

const suggestBtnStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '10px 11px',
  border: '1px solid rgba(99,102,241,0.18)',
  borderRadius: 13,
  background: 'rgba(99,102,241,0.06)',
  cursor: 'pointer',
  textAlign: 'left',
  color: '#94a3b8',
  transition: 'background 120ms ease, border-color 120ms ease, color 120ms ease, transform 120ms ease',
  fontFamily: FONT,
}

const botAvatarStyle = {
  width: 26, height: 26,
  borderRadius: 999,
  background: 'linear-gradient(135deg, rgba(99,102,241,0.25) 0%, rgba(129,140,248,0.15) 100%)',
  border: '1px solid rgba(99,102,241,0.35)',
  display: 'grid',
  placeItems: 'center',
  fontSize: 8,
  fontWeight: 900,
  color: '#818cf8',
  flexShrink: 0,
  alignSelf: 'flex-start',
  marginTop: 16,
  letterSpacing: 0,
}

const userAvatarStyle = {
  width: 26, height: 26,
  borderRadius: 999,
  background: 'rgba(99,102,241,0.10)',
  border: '1px solid rgba(99,102,241,0.22)',
  display: 'grid',
  placeItems: 'center',
  fontSize: 8,
  fontWeight: 900,
  color: '#a5b4fc',
  flexShrink: 0,
  alignSelf: 'flex-start',
  letterSpacing: 0,
}

const bubbleTextUser = {
  background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
  color: '#fff',
  padding: '9px 13px',
  borderRadius: 15,
  borderBottomRightRadius: 4,
  fontSize: 13,
  fontWeight: 800,
  lineHeight: 1.55,
  wordBreak: 'break-word',
  boxShadow: '0 4px 16px rgba(99,102,241,0.30)',
}

const bubbleTextBot = {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(99,102,241,0.16)',
  color: '#e2e8f0',
  padding: '9px 13px',
  borderRadius: 15,
  borderBottomLeftRadius: 4,
  fontSize: 13,
  fontWeight: 600,
  lineHeight: 1.65,
  wordBreak: 'break-word',
}

const qaChipStyle = {
  padding: '5px 12px',
  border: '1px solid rgba(99,102,241,0.22)',
  borderRadius: 999,
  background: 'rgba(99,102,241,0.06)',
  color: '#94a3b8',
  fontSize: 11,
  fontWeight: 700,
  cursor: 'pointer',
  fontFamily: FONT,
  transition: 'background 120ms ease, border-color 120ms ease, color 120ms ease',
  whiteSpace: 'nowrap',
}

const inputWrapStyle = {
  padding: '9px 11px 8px',
  borderTop: '1px solid rgba(99,102,241,0.12)',
  background: 'rgba(10,8,30,0.80)',
  flexShrink: 0,
}

const textareaStyle = {
  flex: 1,
  resize: 'none',
  border: '1px solid rgba(99,102,241,0.22)',
  borderRadius: 13,
  padding: '9px 12px',
  fontSize: 13,
  fontWeight: 700,
  color: '#e2e8f0',
  background: 'rgba(255,255,255,0.04)',
  lineHeight: 1.5,
  fontFamily: FONT,
  minHeight: 40,
  maxHeight: 110,
  overflowY: 'auto',
  transition: 'border-color 140ms ease, box-shadow 140ms ease',
  width: '100%',
  boxSizing: 'border-box',
}

const sendBtnStyle = {
  width: 38, height: 38,
  flexShrink: 0,
  border: 'none',
  borderRadius: 13,
  background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
  color: '#fff',
  display: 'grid',
  placeItems: 'center',
  boxShadow: '0 4px 14px rgba(99,102,241,0.35)',
  transition: 'opacity 140ms ease, transform 140ms ease',
}

const fabStyle = {
  position: 'fixed',
  bottom: 20, right: 20,
  width: 58, height: 58,
  borderRadius: 999,
  color: '#ffffff',
  cursor: 'pointer',
  display: 'grid',
  placeItems: 'center',
  zIndex: 9999,
  fontFamily: FONT,
}
