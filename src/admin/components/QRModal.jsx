import { useRef } from 'react'
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react'

export default function QRModal({ equipoId, equipoNombre, onClose }) {
  const url = `${window.location.origin}/?equipo=${equipoId}`
  const canvasRef = useRef(null)

  const handleDownload = () => {
    const canvas = canvasRef.current?.querySelector('canvas')
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `QR-${equipoId}.png`
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
          <title>QR - ${equipoNombre}</title>
          <style>
            body { margin: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; font-family: sans-serif; }
            img { width: 260px; height: 260px; }
            h2 { font-size: 18px; margin: 0 0 8px; }
            p { font-size: 11px; color: #555; margin: 8px 0 0; word-break: break-all; max-width: 280px; text-align: center; }
          </style>
        </head>
        <body onload="window.print(); window.close()">
          <h2>${equipoNombre}</h2>
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
        background: '#1A1F2B', borderRadius: 12, padding: '32px 28px',
        maxWidth: 360, width: '100%', border: '1px solid #2A3346',
        textAlign: 'center',
      }}>
        <h3 style={{ color: '#E8EDF5', fontSize: 16, fontWeight: 600, margin: '0 0 4px' }}>Código QR</h3>
        <p style={{ color: '#7A8BA8', fontSize: 13, margin: '0 0 24px' }}>{equipoNombre}</p>

        {/* Canvas oculto para descarga/impresión */}
        <div ref={canvasRef} style={{ display: 'none' }}>
          <QRCodeCanvas value={url} size={400} />
        </div>

        {/* SVG visible */}
        <div style={{
          background: '#fff', borderRadius: 8, padding: 16,
          display: 'inline-block', marginBottom: 12,
        }}>
          <QRCodeSVG value={url} size={200} />
        </div>

        <p style={{ color: '#4A5568', fontSize: 11, margin: '0 0 20px', wordBreak: 'break-all' }}>{url}</p>

        {/* Botones de acción */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
          <button onClick={handleDownload} style={{
            flex: 1, padding: '10px', borderRadius: 8,
            border: '1px solid #2A3346', background: 'transparent',
            color: '#E8EDF5', cursor: 'pointer', fontSize: 13,
            fontFamily: "'DM Sans', sans-serif",
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Descargar
          </button>
          <button onClick={handlePrint} style={{
            flex: 1, padding: '10px', borderRadius: 8,
            border: '1px solid #2A3346', background: 'transparent',
            color: '#E8EDF5', cursor: 'pointer', fontSize: 13,
            fontFamily: "'DM Sans', sans-serif",
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 6 2 18 2 18 9" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect x="6" y="14" width="12" height="8" />
            </svg>
            Imprimir
          </button>
        </div>

        <button onClick={onClose} style={{
          padding: '11px 24px', borderRadius: 8, border: 'none',
          background: '#F4A020', color: '#0A0C0F', cursor: 'pointer',
          fontSize: 14, fontWeight: 700, width: '100%',
          fontFamily: "'DM Sans', sans-serif",
        }}>
          Cerrar
        </button>
      </div>
    </div>
  )
}
