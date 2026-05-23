import { QRCodeSVG } from 'qrcode.react'

export default function QRModal({ equipoId, equipoNombre, onClose }) {
  const url = `https://card.lubriplan.com?equipo=${equipoId}`
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
        <div style={{
          background: '#fff', borderRadius: 8, padding: 16,
          display: 'inline-block', marginBottom: 12,
        }}>
          <QRCodeSVG value={url} size={200} />
        </div>
        <p style={{ color: '#4A5568', fontSize: 11, margin: '0 0 24px', wordBreak: 'break-all' }}>{url}</p>
        <button onClick={onClose} style={{
          padding: '11px 24px', borderRadius: 8, border: 'none',
          background: '#F4A020', color: '#0A0C0F', cursor: 'pointer',
          fontSize: 14, fontWeight: 700, width: '100%',
        }}>
          Cerrar
        </button>
      </div>
    </div>
  )
}
