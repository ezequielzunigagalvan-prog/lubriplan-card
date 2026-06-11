import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '../components/AdminLayout'
import { useAdmin } from '../context/AdminContext'

const FREQ_ORDER = ['DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY', 'BIMONTHLY', 'QUARTERLY', 'SEMIANNUAL', 'ANNUAL']
const FREQ_META = {
  DAILY:      { label: 'Diario',      color: '#EF4444' },
  WEEKLY:     { label: 'Semanal',     color: '#F97316' },
  BIWEEKLY:   { label: 'Quincenal',   color: '#FB923C' },
  MONTHLY:    { label: 'Mensual',     color: '#EAB308' },
  BIMONTHLY:  { label: 'Bimestral',   color: '#A3E635' },
  QUARTERLY:  { label: 'Trimestral',  color: '#22C55E' },
  SEMIANNUAL: { label: 'Semestral',   color: '#06B6D4' },
  ANNUAL:     { label: 'Anual',       color: '#3B82F6' },
}

function diasAtras(fecha) {
  if (!fecha) return null
  const d = Math.floor((Date.now() - new Date(fecha).getTime()) / 86400000)
  if (d === 0) return 'Hoy'
  if (d === 1) return 'Ayer'
  return `Hace ${d} días`
}

// ── Modales auxiliares ──────────────────────────────────────────────────────

function CambiarCredencialesModal({ onClose, onSave }) {
  const [form, setForm] = useState({ email: '', password: '', confirmar: '' })
  const [error, setError] = useState('')
  const [ok, setOk] = useState(false)
  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }))

  const validatePassword = (pwd) => {
    if (pwd.length < 8) return 'Mínimo 8 caracteres'
    if (!/[A-Z]/.test(pwd)) return 'Debe contener al menos 1 mayúscula (A-Z)'
    if (!/[0-9]/.test(pwd)) return 'Debe contener al menos 1 número (0-9)'
    if (!/[!@#$%^&*]/.test(pwd)) return 'Debe contener al menos 1 símbolo (!@#$%^&*)'
    return null
  }

  const handleSave = () => {
    if (!form.email.trim() || !form.password) { setError('Completa todos los campos'); return }
    if (form.password !== form.confirmar) { setError('Las contraseñas no coinciden'); return }
    const pwdError = validatePassword(form.password)
    if (pwdError) { setError(pwdError); return }
    onSave(form.email.trim(), form.password)
    setOk(true)
    setTimeout(onClose, 1200)
  }

  const inp = {
    width: '100%', padding: '10px 12px', background: '#0c0a1e',
    border: '1px solid #2a2850', borderRadius: 7, color: '#e8eeff',
    fontSize: 14, outline: 'none', boxSizing: 'border-box',
    fontFamily: "'DM Sans', sans-serif",
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: '#1c1a3a', borderRadius: 12, padding: 28, maxWidth: 380, width: '100%', border: '1px solid #2a2850' }}>
        <h3 style={{ color: '#e8eeff', fontSize: 17, fontWeight: 600, margin: '0 0 20px' }}>Cambiar credenciales</h3>
        {ok ? (
          <div style={{ textAlign: 'center', padding: '20px 0', color: '#22C55E', fontSize: 15, fontWeight: 600 }}>✓ Credenciales actualizadas</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[{ label: 'Nuevo email', key: 'email', type: 'email' }, { label: 'Nueva contraseña', key: 'password', type: 'password' }, { label: 'Confirmar contraseña', key: 'confirmar', type: 'password' }].map(({ label, key, type }) => {
              const pwd = form.password
              const requirements = key === 'password' && pwd ? [
                { met: pwd.length >= 8, text: '8+ caracteres' },
                { met: /[A-Z]/.test(pwd), text: '1 mayúscula' },
                { met: /[0-9]/.test(pwd), text: '1 número' },
                { met: /[!@#$%^&*]/.test(pwd), text: '1 símbolo' },
              ] : null
              return (
                <div key={key}>
                  <label style={{ display: 'block', color: '#8892b0', fontSize: 11, marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</label>
                  <input type={type} value={form[key]} onChange={set(key)} style={inp} />
                  {requirements && (
                    <div style={{ marginTop: 6, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                      {requirements.map((req, i) => (
                        <span key={i} style={{ fontSize: 10, color: req.met ? '#22C55E' : '#4a5070' }}>
                          {req.met ? '✓' : '○'} {req.text}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
            {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 7, padding: '8px 12px', color: '#EF4444', fontSize: 13 }}>{error}</div>}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
              <button onClick={onClose} style={{ padding: '9px 18px', borderRadius: 7, border: '1px solid #2a2850', background: 'transparent', color: '#8892b0', cursor: 'pointer', fontSize: 13 }}>Cancelar</button>
              <button onClick={handleSave} style={{ padding: '9px 18px', borderRadius: 7, border: 'none', background: '#6366f1', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>Guardar</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Componentes del dashboard ───────────────────────────────────────────────

function KpiCard({ label, value, sub, color, icon }) {
  return (
    <div style={{
      background: '#13112a', borderRadius: 12, border: '1px solid #2a2850',
      padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14,
    }}>
      <div style={{
        width: 42, height: 42, borderRadius: 10, background: `${color}18`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color, flexShrink: 0,
      }}>
        {icon}
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ color: '#8892b0', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 }}>{label}</div>
        <div style={{ color: '#e8eeff', fontSize: 24, fontWeight: 700, lineHeight: 1 }}>{value}</div>
        {sub && <div style={{ color: '#4a5070', fontSize: 11, marginTop: 3 }}>{sub}</div>}
      </div>
    </div>
  )
}

function SeccionHeader({ title, action, onAction }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid #2a2850' }}>
      <h3 style={{ color: '#e8eeff', fontSize: 14, fontWeight: 600, margin: 0 }}>{title}</h3>
      {action && (
        <button onClick={onAction} style={{ background: 'none', border: 'none', color: '#818cf8', cursor: 'pointer', fontSize: 12, fontFamily: "'DM Sans', sans-serif" }}>
          {action}
        </button>
      )}
    </div>
  )
}

// ── Dashboard principal ─────────────────────────────────────────────────────

export default function DashboardAdmin() {
  const { equipos, tecnicos, cambiarCredenciales } = useAdmin()
  const navigate = useNavigate()
  const [showCreds, setShowCreds] = useState(false)

  const stats = useMemo(() => {
    const activos = equipos.filter(e => e.activo !== false)
    const sinPuntos = activos.filter(e => !e.puntos?.length)
    const sinImagen = activos.filter(e => !e.imagenes?.length && !e.imagenUrl)
    const completos = activos.filter(e => e.puntos?.length > 0 && (e.imagenes?.length > 0 || e.imagenUrl))
    const totalPuntos = activos.reduce((s, e) => s + (e.puntos?.length || 0), 0)

    const puntosPorFrecuencia = {}
    activos.forEach(e => e.puntos?.forEach(p => {
      puntosPorFrecuencia[p.frecuencia] = (puntosPorFrecuencia[p.frecuencia] || 0) + 1
    }))
    const freqEntries = FREQ_ORDER.filter(k => puntosPorFrecuencia[k]).map(k => ({
      key: k, count: puntosPorFrecuencia[k], ...FREQ_META[k],
    }))
    const maxFreq = Math.max(1, ...freqEntries.map(f => f.count))

    const semanaAtras = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const tecActivos = tecnicos.filter(t => t.activo)
    const tecSemana = tecnicos.filter(t => t.activo && t.ultimaConsulta >= semanaAtras)

    return {
      activos, sinPuntos, sinImagen, completos, totalPuntos,
      freqEntries, maxFreq,
      tecActivos, tecSemana,
      cobertura: activos.length > 0 ? Math.round(completos.length / activos.length * 100) : 100,
      requierenAtencion: sinPuntos.length + sinImagen.length,
    }
  }, [equipos, tecnicos])

  const coberturaColor = stats.cobertura >= 80 ? '#22C55E' : stats.cobertura >= 40 ? '#EAB308' : '#EF4444'

  return (
    <AdminLayout titulo="Dashboard">
      <div style={{ maxWidth: 1100 }}>

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 24 }}>
          <KpiCard
            label="Total de equipos"
            value={equipos.length}
            sub={`${stats.activos.length} activos · ${equipos.length - stats.activos.length} inactivos`}
            color="#818cf8"
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>}
          />
          <KpiCard
            label="Cobertura de configuración"
            value={`${stats.cobertura}%`}
            sub={`${stats.completos.length} de ${stats.activos.length} equipos completos`}
            color={coberturaColor}
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>}
          />
          <KpiCard
            label="Puntos de lubricación"
            value={stats.totalPuntos}
            sub={stats.freqEntries[0] ? `${stats.freqEntries[0].count} puntos ${stats.freqEntries[0].label.toLowerCase()}s` : 'Sin puntos aún'}
            color="#3B82F6"
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>}
          />
          <KpiCard
            label="Actividad de técnicos"
            value={`${stats.tecSemana.length}/${stats.tecActivos.length}`}
            sub="activos esta semana / total habilitados"
            color="#22C55E"
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
          />
          {stats.requierenAtencion > 0 && (
            <KpiCard
              label="Requieren atención"
              value={stats.requierenAtencion}
              sub={`${stats.sinPuntos.length} sin puntos · ${stats.sinImagen.length} sin imagen`}
              color="#EF4444"
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>}
            />
          )}
        </div>

        {/* Main grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, alignItems: 'flex-start' }}>

          {/* Left column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Requieren atención */}
            {stats.requierenAtencion > 0 ? (
              <div style={{ background: '#13112a', borderRadius: 12, border: '1px solid #2a2850', overflow: 'hidden' }}>
                <SeccionHeader title="Requieren atención" action="Ver todos →" onAction={() => navigate('/admin/equipos')} />
                <div>
                  {stats.sinPuntos.slice(0, 4).map((e, i, arr) => (
                    <button
                      key={e.id}
                      onClick={() => navigate(`/admin/equipos/${e.id}/carta`)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        width: '100%', padding: '11px 20px',
                        borderBottom: (i < arr.length - 1 || stats.sinImagen.length > 0) ? '1px solid #2a2850' : 'none',
                        background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.04)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#EF4444', flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ color: '#e8eeff', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>{e.nombre}</span>
                        <span style={{ color: '#EF4444', fontSize: 11 }}>Sin puntos de lubricación</span>
                      </div>
                      {e.codigo && <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#4a5070', letterSpacing: 1, flexShrink: 0 }}>{e.codigo}</span>}
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 3l4 4-4 4" stroke="#4a5070" strokeWidth="1.5" strokeLinecap="round"/></svg>
                    </button>
                  ))}
                  {stats.sinImagen.slice(0, 4).map((e, i, arr) => (
                    <button
                      key={e.id + '-img'}
                      onClick={() => navigate(`/admin/equipos/${e.id}/carta`)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        width: '100%', padding: '11px 20px',
                        borderBottom: i < arr.length - 1 ? '1px solid #2a2850' : 'none',
                        background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(234,179,8,0.04)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#EAB308', flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ color: '#e8eeff', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>{e.nombre}</span>
                        <span style={{ color: '#EAB308', fontSize: 11 }}>Sin imagen de referencia</span>
                      </div>
                      {e.codigo && <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#4a5070', letterSpacing: 1, flexShrink: 0 }}>{e.codigo}</span>}
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 3l4 4-4 4" stroke="#4a5070" strokeWidth="1.5" strokeLinecap="round"/></svg>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ background: '#13112a', borderRadius: 12, border: '1px solid #2a2850', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(34,197,94,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                </div>
                <div>
                  <div style={{ color: '#22C55E', fontSize: 14, fontWeight: 600 }}>Todo configurado</div>
                  <div style={{ color: '#8892b0', fontSize: 12, marginTop: 2 }}>Todos los equipos tienen puntos e imagen asignados.</div>
                </div>
              </div>
            )}

            {/* Distribución por frecuencia */}
            {stats.freqEntries.length > 0 && (
              <div style={{ background: '#13112a', borderRadius: 12, border: '1px solid #2a2850', overflow: 'hidden' }}>
                <SeccionHeader title="Distribución de frecuencias" />
                <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {stats.freqEntries.map(({ key, label, color, count }) => (
                    <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ width: 72, fontSize: 12, color: '#8892b0', flexShrink: 0, fontFamily: "'DM Sans', sans-serif" }}>{label}</span>
                      <div style={{ flex: 1, height: 8, background: '#0c0a1e', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${Math.round(count / stats.maxFreq * 100)}%`, background: color, borderRadius: 4, transition: 'width 0.4s' }} />
                      </div>
                      <span style={{ width: 28, fontSize: 12, fontWeight: 700, color, textAlign: 'right', flexShrink: 0 }}>{count}</span>
                    </div>
                  ))}
                  <p style={{ color: '#4a5070', fontSize: 11, margin: '4px 0 0' }}>
                    Puntos que requieren atención más urgente aparecen primero.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Técnicos */}
            <div style={{ background: '#13112a', borderRadius: 12, border: '1px solid #2a2850', overflow: 'hidden' }}>
              <SeccionHeader title="Técnicos" action="Gestionar →" onAction={() => navigate('/admin/tecnicos')} />
              {tecnicos.length === 0 ? (
                <p style={{ color: '#4a5070', fontSize: 13, padding: '16px 20px', margin: 0 }}>No hay técnicos registrados.</p>
              ) : (
                tecnicos.map((t, i) => (
                  <div key={t.id} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 20px',
                    borderBottom: i < tecnicos.length - 1 ? '1px solid #2a2850' : 'none',
                  }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                      background: t.activo ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.04)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: t.activo ? '#818cf8' : '#4a5070',
                      fontFamily: "'Bebas Neue', sans-serif", fontSize: 15, letterSpacing: 1,
                    }}>
                      {t.nombre.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ color: t.activo ? '#e8eeff' : '#4a5070', fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.nombre}</span>
                        {!t.activo && <span style={{ fontSize: 10, color: '#EF4444', background: 'rgba(239,68,68,0.1)', padding: '1px 5px', borderRadius: 4, flexShrink: 0 }}>INACTIVO</span>}
                      </div>
                      <div style={{ display: 'flex', gap: 8, marginTop: 1 }}>
                        <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#818cf8', letterSpacing: 3 }}>{t.pin}</span>
                        {t.ultimaConsulta && (
                          <span style={{ fontSize: 11, color: '#4a5070' }}>{diasAtras(t.ultimaConsulta)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Acciones */}
            <div style={{ background: '#13112a', borderRadius: 12, border: '1px solid #2a2850', padding: '16px 16px' }}>
              <p style={{ color: '#4a5070', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, margin: '0 0 12px' }}>Acciones</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button onClick={() => navigate('/admin/equipos/nuevo')} style={{ padding: '10px 14px', borderRadius: 8, border: 'none', background: '#6366f1', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", textAlign: 'left' }}>
                  + Agregar equipo
                </button>
                <button onClick={() => navigate('/admin/equipos')} style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #2a2850', background: 'transparent', color: '#e8eeff', fontSize: 13, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", textAlign: 'left' }}>
                  Ver todos los equipos →
                </button>
                <button onClick={() => navigate('/admin/tecnicos')} style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #2a2850', background: 'transparent', color: '#e8eeff', fontSize: 13, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", textAlign: 'left' }}>
                  Gestionar técnicos →
                </button>
                <button onClick={() => setShowCreds(true)} style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #2a2850', background: 'transparent', color: '#8892b0', fontSize: 13, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", textAlign: 'left' }}>
                  Cambiar credenciales →
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>

      {showCreds && (
        <CambiarCredencialesModal onClose={() => setShowCreds(false)} onSave={cambiarCredenciales} />
      )}
    </AdminLayout>
  )
}
