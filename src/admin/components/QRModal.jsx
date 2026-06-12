import { useRef } from 'react'
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react'

export default function QRModal({ equipo, onClose }) {
  // Obtener URL base del QR
  // 1. Primero intenta usar VITE_QR_BASE_URL (variable de entorno - para producción)
  // 2. Si estamos en localhost, intenta usar la IP local (192.168.x.x)
  // 3. Si no hay IP local disponible, fallback a localhost (no funcionará en otro dispositivo)

  let baseUrl = import.meta.env.VITE_QR_BASE_URL
  const isLocalhost = ['localhost', '127.0.0.1', ''].includes(window.location.hostname)

  if (!baseUrl) {
    if (isLocalhost) {
      // En localhost, obtener IP local desde sessionStorage (si está disponible)
      // Esta IP se obtiene del servidor backend en el primer fetch
      const localIp = sessionStorage.getItem('localIp')
      if (localIp) {
        baseUrl = `http://${localIp}:5173`
      } else {
        // Fallback: intentar obtener la IP local desde window.location
        // Nota: esto solo funciona si accediste al servidor por IP, no por localhost
        baseUrl = window.location.origin
      }
    } else {
      // En producción, usar origin (ej: https://tudominio.com)
      baseUrl = window.location.origin
    }
  }

  const url = `${baseUrl}/pin?equipo=${equipo.id}`
  const canvasRef = useRef(null)

  const handleDownload = () => {
    const canvas = canvasRef.current?.querySelector('canvas')
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `QR-${equipo.codigo || equipo.id}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  const handlePrint = () => {
    const canvas = canvasRef.current?.querySelector('canvas')
    if (!canvas) return
    const dataUrl = canvas.toDataURL('image/png')
    const win = window.open('', '_blank')
    win.document.write(`
      <html>
        <head>
          <title>QR - ${equipo.nombre}</title>
          <style>
            body { margin:0; display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:100vh; font-family:sans-serif; }
            img { width:260px; height:260px; }
            h2 { font-size:18px; margin:0 0 8px; }
            p  { font-size:11px; color:#555; margin:8px 0 0; word-break:break-all; max-width:280px; text-align:center; }
          </style>
        </head>
        <body onload="window.print(); window.close()">
          <h2>${equipo.nombre}</h2>
          <img src="${dataUrl}" />
          <p>${url}</p>
        </body>
      </html>
    `)
    win.document.close()
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 300,
      background: 'rgba(0,0,0,0.75)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{
        background: '#1c1a3a', borderRadius: 12, padding: '32px 28px',
        maxWidth: 380, width: '100%', border: '1px solid #2a2850',
        textAlign: 'center',
      }}>
        <h3 style={{ color: '#e8eeff', fontSize: 16, fontWeight: 600, margin: '0 0 4px' }}>Código QR</h3>
        <p style={{ color: '#8892b0', fontSize: 13, margin: '0 0 20px' }}>{equipo.nombre}</p>

        <div ref={canvasRef} style={{ display: 'none' }}>
          <QRCodeCanvas value={url} size={400} level="M" />
        </div>

        <div style={{ background: '#fff', borderRadius: 8, padding: 16, display: 'inline-block', marginBottom: 12 }}>
          <QRCodeSVG value={url} size={200} level="M" />
        </div>

        <p style={{ color: '#4a5070', fontSize: 11, margin: '0 0 12px', wordBreak: 'break-all' }}>{url}</p>

        {isLocalhost && (
          <div style={{
            background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.25)',
            borderRadius: 8, padding: '12px 14px', marginBottom: 16, textAlign: 'left',
          }}>
            <p style={{ color: '#EAB308', fontSize: 12, margin: 0, fontWeight: 600, marginBottom: 6 }}>
              ⚠️ QR solo funciona en este dispositivo
            </p>
            <p style={{ color: '#8892b0', fontSize: 11, margin: 0, lineHeight: 1.5, marginBottom: 8 }}>
              El QR apunta a <strong>localhost</strong> que no es accesible desde otros dispositivos.
            </p>
            <p style={{ color: '#8892b0', fontSize: 11, margin: 0, lineHeight: 1.5 }}>
              <strong>Soluciones:</strong><br/>
              • <strong>Opción 1:</strong> Usa tu IP local: <code>http://192.168.x.x:5173</code><br/>
              • <strong>Opción 2:</strong> Deploy a Vercel/Railway (producción)<br/>
              • <strong>Opción 3:</strong> En .env, setea <code>VITE_QR_BASE_URL=http://tu-ip:5173</code>
            </p>
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
          <button onClick={handleDownload} style={{
            flex: 1, padding: '10px', borderRadius: 8, border: '1px solid #2a2850',
            background: 'transparent', color: '#e8eeff', cursor: 'pointer', fontSize: 13,
            fontFamily: "'DM Sans', sans-serif",
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Descargar
          </button>
          <button onClick={handlePrint} style={{
            flex: 1, padding: '10px', borderRadius: 8, border: '1px solid #2a2850',
            background: 'transparent', color: '#e8eeff', cursor: 'pointer', fontSize: 13,
            fontFamily: "'DM Sans', sans-serif",
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>
            </svg>
            Imprimir
          </button>
        </div>

        <button onClick={onClose} style={{
          padding: '11px 24px', borderRadius: 8, border: 'none',
          background: '#6366f1', color: '#fff', cursor: 'pointer',
          fontSize: 14, fontWeight: 700, width: '100%',
          fontFamily: "'DM Sans', sans-serif",
        }}>
          Cerrar
        </button>
      </div>
    </div>
  )
}
