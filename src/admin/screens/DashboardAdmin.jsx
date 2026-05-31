import { useMemo, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '../components/AdminLayout'
import { useAdmin } from '../context/AdminContext'
import { QRCodeSVG } from 'qrcode.react'

function CambiarCredencialesModal({ onClose, onSave }) {
  const [form, setForm] = useState({ email: '', password: '', confirmar: '' })
  const [error, setError] = useState('')
  const [ok, setOk] = useState(false)

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }))

  const handleSave = () => {
    if (!form.email.trim() || !form.password) { setError('Completa todos los campos'); return }
    if (form.password !== form.confirmar) { setError('Las contraseñas no coinciden'); return }
    if (form.password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return }
    onSave(form.email.trim(), form.password)
    setOk(true)
    setTimeout(onClose, 1200)
  }

  const inp = {
    width: '100%', padding: '10px 12px',
    background: '#0c0a1e', border: '1px solid #2a2850',
    borderRadius: 7, color: '#e8eeff', fontSize: 14,
    outline: 'none', boxSizing: 'border-box',
    fontFamily: "'DM Sans', sans-serif",
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: '#1c1a3a', borderRadius: 12, padding: 28, maxWidth: 380, width: '100%', border: '1px solid #2a2850' }}>
        <h3 style={{ color: '#e8eeff', fontSize: 17, fontWeight: 600, margin: '0 0 20px' }}>Cambiar credenciales</h3>
        {ok ? (
          <div style={{ textAlign: 'center', padding: '20px 0', color: '#22C55E', fontSize: 15, fontWeight: 600 }}>
            ✓ Credenciales actualizadas
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { label: 'Nuevo email', key: 'email', type: 'email' },
              { label: 'Nueva contraseña', key: 'password', type: 'password' },
              { label: 'Confirmar contraseña', key: 'confirmar', type: 'password' },
            ].map(({ label, key, type }) => (
              <div key={key}>
                <label style={{ display: 'block', color: '#8892b0', fontSize: 11, marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</label>
                <input type={type} value={form[key]} onChange={set(key)} style={inp} />
              </div>
            ))}
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

const PALETTE = [
  '#818cf8', '#22C55E', '#3B82F6', '#A855F7',
  '#EF4444', '#06B6D4', '#FB923C', '#EC4899',
]

function compressImage(dataUrl, maxDim = 900, quality = 0.65) {
  return new Promise((resolve) => {
    if (!dataUrl?.startsWith('data:')) { resolve(dataUrl); return }
    const img = new Image()
    img.onload = () => {
      const scale = Math.min(1, maxDim / Math.max(img.width || 1, img.height || 1))
      const w = Math.round(img.width * scale)
      const h = Math.round(img.height * scale)
      const canvas = document.createElement('canvas')
      canvas.width = w; canvas.height = h
      canvas.getContext('2d').drawImage(img, 0, 0, w, h)
      resolve(canvas.toDataURL('image/jpeg', quality))
    }
    img.onerror = () => resolve(dataUrl)
    img.src = dataUrl
  })
}

function SyncModal({ equipos, tecnicos, onClose }) {
  const [fase, setFase] = useState('idle') // idle | generando | listo
  const [syncUrl, setSyncUrl] = useState('')
  const [copiado, setCopiado] = useState(false)

  const handleGenerar = useCallback(async () => {
    setFase('generando')
    const equiposConImgs = await Promise.all(equipos.map(async (e) => {
      let imagenes = []
      try {
        const raw = localStorage.getItem(`masterlub_imgs_${e.id}`)
        if (raw) {
          const imgs = JSON.parse(raw)
          imagenes = await Promise.all(imgs.map(async (img) => ({
            ...img,
            url: await compressImage(img.url),
          })))
        }
      } catch {}
      return { id: e.id, codigo: e.codigo, nombre: e.nombre, area: e.area,
               imagen: e.imagen, activo: e.activo, puntos: e.puntos, imagenes }
    }))

    const tecnicosMin = tecnicos.map(({ id, nombre, pin, activo, ultimaConsulta }) =>
      ({ id, nombre, pin, activo, ultimaConsulta }))

    const json = JSON.stringify({ version: 1, equipos: equiposConImgs, tecnicos: tecnicosMin })
    const encoded = btoa(unescape(encodeURIComponent(json)))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
    setSyncUrl(`${window.location.origin}/sync#${encoded}`)
    setFase('listo')
  }, [equipos, tecnicos])

  const handleCopiar = async () => {
    try { await navigator.clipboard.writeText(syncUrl) } catch {}
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2200)
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.75)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    }}>
      <div style={{
        background: '#1c1a3a', borderRadius: 14, padding: '28px 24px',
        maxWidth: 400, width: '100%', border: '1px solid #2a2850',
      }}>
        <h3 style={{ color: '#e8eeff', fontSize: 16, fontWeight: 600, margin: '0 0 6px' }}>
          Compartir configuración
        </h3>
        <p style={{ color: '#8892b0', fontSize: 13, margin: '0 0 20px', lineHeight: 1.5 }}>
          Genera un enlace que incluye todos los equipos <strong style={{ color: '#e8eeff' }}>con sus imágenes</strong> y los PINs de técnicos.
          Compártelo por WhatsApp o email — cada dispositivo lo importa una sola vez.
        </p>

        {fase === 'idle' && (
          <button onClick={handleGenerar} style={{
            width: '100%', padding: '12px', borderRadius: 9, border: 'none',
            background: '#6366f1', color: '#fff', fontSize: 14, fontWeight: 700,
            cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
          }}>
            Generar enlace de sincronización
          </button>
        )}

        {fase === 'generando' && (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              border: '3px solid #6366f1', borderTopColor: 'transparent',
              animation: 'spin 0.9s linear infinite', margin: '0 auto 12px',
            }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
            <p style={{ color: '#8892b0', fontSize: 13, margin: 0 }}>
              Comprimiendo imágenes…
            </p>
          </div>
        )}

        {fase === 'listo' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{
              background: '#fff', borderRadius: 8, padding: 12,
              display: 'flex', justifyContent: 'center',
            }}>
              <QRCodeSVG value={syncUrl} size={160} level="L" />
            </div>
            <p style={{ color: '#4a5070', fontSize: 10, margin: 0, wordBreak: 'break-all', lineHeight: 1.4 }}>
              {syncUrl.length > 80 ? syncUrl.slice(0, 80) + '…' : syncUrl}
            </p>
            <button onClick={handleCopiar} style={{
              width: '100%', padding: '11px', borderRadius: 9, border: 'none',
              background: copiado ? '#22C55E' : '#6366f1',
              color: '#fff', fontSize: 14, fontWeight: 700,
              cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
              transition: 'background 0.2s',
            }}>
              {copiado ? '✓ Copiado' : 'Copiar enlace'}
            </button>
            <p style={{ color: '#4a5070', fontSize: 11, margin: 0, textAlign: 'center' }}>
              También podés escanear el QR de arriba con la cámara del teléfono.
            </p>
          </div>
        )}

        <button onClick={onClose} style={{
          width: '100%', marginTop: 12, padding: '10px', borderRadius: 8,
          border: '1px solid #2a2850', background: 'transparent',
          color: '#8892b0', fontSize: 13, cursor: 'pointer',
          fontFamily: "'DM Sans', sans-serif",
        }}>
          Cerrar
        </button>
      </div>
    </div>
  )
}

function StatCard({ label, value, color, icon }) {
  return (
    <div style={{
      background: '#13112a', borderRadius: 12,
      border: '1px solid #2a2850', padding: '20px 24px',
      display: 'flex', alignItems: 'center', gap: 16,
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 10,
        background: `${color}18`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color, flexShrink: 0,
      }}>
        {icon}
      </div>
      <div>
        <div style={{ color: '#8892b0', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
          {label}
        </div>
        <div style={{ color: '#e8eeff', fontSize: 28, fontWeight: 700, lineHeight: 1 }}>{value}</div>
      </div>
    </div>
  )
}

function AreaCard({ area, count, puntos, color, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 14,
        background: '#13112a', border: '1px solid #2a2850',
        borderRadius: 10, padding: '14px 18px',
        cursor: 'pointer', textAlign: 'left',
        transition: 'border-color 0.15s, background 0.15s',
        width: '100%',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = color + '60'
        e.currentTarget.style.background = color + '08'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = '#2a2850'
        e.currentTarget.style.background = '#13112a'
      }}
    >
      <div style={{ width: 4, height: 40, borderRadius: 2, background: color, flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          color: '#e8eeff', fontSize: 13, fontWeight: 600,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          fontFamily: "'DM Sans', sans-serif",
        }}>
          {area}
        </div>
        <div style={{ color: '#8892b0', fontSize: 12, marginTop: 2, fontFamily: "'DM Sans', sans-serif" }}>
          {count} equipo{count !== 1 ? 's' : ''} · {puntos} punto{puntos !== 1 ? 's' : ''}
        </div>
      </div>
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M5 3l4 4-4 4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  )
}

export default function DashboardAdmin() {
  const { equipos, tecnicos, cambiarCredenciales } = useAdmin()
  const navigate = useNavigate()
  const [showCreds, setShowCreds] = useState(false)
  const [showSync, setShowSync] = useState(false)

  const totalPuntos = equipos.reduce((acc, e) => acc + (e.puntos?.length || 0), 0)
  const tecnicosActivos = tecnicos.filter(t => t.activo).length

  const areaGroups = useMemo(() => {
    const map = {}
    equipos.forEach(e => {
      if (!map[e.area]) map[e.area] = { count: 0, puntos: 0 }
      map[e.area].count++
      map[e.area].puntos += e.puntos?.length || 0
    })
    return Object.entries(map).map(([area, stats]) => ({ area, ...stats }))
  }, [equipos])

  return (
    <AdminLayout titulo="Dashboard">
      <div style={{ maxWidth: 1100 }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: 16, marginBottom: 28,
        }}>
          <StatCard label="Equipos registrados" value={equipos.length} color="#818cf8" icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
            </svg>
          } />
          <StatCard label="Áreas" value={areaGroups.length} color="#06B6D4" icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="10" width="18" height="11" rx="2" />
              <path d="M3 12L12 5l9 7" />
            </svg>
          } />
          <StatCard label="Puntos de lubricación" value={totalPuntos} color="#3B82F6" icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          } />
          <StatCard label="Técnicos activos" value={tecnicosActivos} color="#22C55E" icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          } />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, alignItems: 'flex-start' }}>
          {/* Áreas */}
          <div style={{ background: '#13112a', borderRadius: 12, border: '1px solid #2a2850', overflow: 'hidden' }}>
            <div style={{
              padding: '16px 24px', borderBottom: '1px solid #2a2850',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <h2 style={{ color: '#e8eeff', fontSize: 15, fontWeight: 600, margin: 0 }}>Equipos por área</h2>
              <button onClick={() => navigate('/admin/equipos')} style={{
                background: 'none', border: 'none', color: '#818cf8', cursor: 'pointer', fontSize: 13,
                fontFamily: "'DM Sans', sans-serif",
              }}>
                Gestionar →
              </button>
            </div>
            <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {areaGroups.map(({ area, count, puntos }, idx) => (
                <AreaCard
                  key={area}
                  area={area}
                  count={count}
                  puntos={puntos}
                  color={PALETTE[idx % PALETTE.length]}
                  onClick={() => navigate('/admin/equipos')}
                />
              ))}
            </div>
          </div>

          {/* Right column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Quick actions */}
            <div style={{ background: '#13112a', borderRadius: 12, border: '1px solid #2a2850', padding: '16px 20px' }}>
              <h3 style={{ color: '#8892b0', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, margin: '0 0 14px' }}>
                Acciones rápidas
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button
                  onClick={() => navigate('/admin/equipos/nuevo')}
                  style={{
                    padding: '11px 16px', borderRadius: 8, border: 'none',
                    background: '#6366f1', color: '#fff',
                    fontSize: 13, fontWeight: 700, cursor: 'pointer',
                    fontFamily: "'DM Sans', sans-serif", textAlign: 'left',
                  }}
                >
                  + Agregar equipo
                </button>
                {[
                  { label: 'Ver todos los equipos →', path: '/admin/equipos' },
                  { label: 'Gestionar técnicos →', path: '/admin/tecnicos' },
                  { label: 'Biblioteca de lubricantes →', path: '/admin/lubricantes' },
                ].map(({ label, path }) => (
                  <button
                    key={path}
                    onClick={() => navigate(path)}
                    style={{
                      padding: '11px 16px', borderRadius: 8,
                      border: '1px solid #2a2850', background: 'transparent',
                      color: '#e8eeff', fontSize: 13, cursor: 'pointer',
                      fontFamily: "'DM Sans', sans-serif", textAlign: 'left',
                    }}
                  >
                    {label}
                  </button>
                ))}
                <button
                  onClick={() => setShowSync(true)}
                  style={{
                    padding: '11px 16px', borderRadius: 8,
                    border: '1px solid rgba(6,182,212,0.3)',
                    background: 'rgba(6,182,212,0.07)',
                    color: '#06B6D4', fontSize: 13, cursor: 'pointer',
                    fontFamily: "'DM Sans', sans-serif", textAlign: 'left',
                    fontWeight: 600,
                  }}
                >
                  Compartir configuración →
                </button>
                <button
                  onClick={() => setShowCreds(true)}
                  style={{
                    padding: '11px 16px', borderRadius: 8,
                    border: '1px solid #2a2850', background: 'transparent',
                    color: '#8892b0', fontSize: 13, cursor: 'pointer',
                    fontFamily: "'DM Sans', sans-serif", textAlign: 'left',
                  }}
                >
                  Cambiar credenciales →
                </button>
              </div>
            </div>

            {/* Recent equipment */}
            <div style={{ background: '#13112a', borderRadius: 12, border: '1px solid #2a2850', overflow: 'hidden' }}>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid #2a2850' }}>
                <h3 style={{ color: '#e8eeff', fontSize: 14, fontWeight: 600, margin: 0 }}>Últimos equipos</h3>
              </div>
              {equipos.slice(-5).reverse().map((e, i, arr) => (
                <button
                  key={e.id}
                  onClick={() => navigate(`/admin/equipos/${e.id}/carta`)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    width: '100%', padding: '11px 20px',
                    borderBottom: i < arr.length - 1 ? '1px solid #2a2850' : 'none',
                    background: 'transparent', border: 'none',
                    cursor: 'pointer', textAlign: 'left',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={ev => ev.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                  onMouseLeave={ev => ev.currentTarget.style.background = 'transparent'}
                >
                  {e.codigo && (
                    <span style={{
                      fontFamily: 'monospace', fontSize: 11, fontWeight: 700,
                      color: '#818cf8', letterSpacing: 1,
                      background: 'rgba(129,140,248,0.1)', borderRadius: 4,
                      padding: '2px 6px', flexShrink: 0,
                    }}>
                      {e.codigo}
                    </span>
                  )}
                  <span style={{
                    color: '#e8eeff', fontSize: 13,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    fontFamily: "'DM Sans', sans-serif",
                  }}>
                    {e.nombre}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      {showCreds && (
        <CambiarCredencialesModal
          onClose={() => setShowCreds(false)}
          onSave={(email, password) => cambiarCredenciales(email, password)}
        />
      )}
      {showSync && (
        <SyncModal
          equipos={equipos}
          tecnicos={tecnicos}
          onClose={() => setShowSync(false)}
        />
      )}
    </AdminLayout>
  )
}
