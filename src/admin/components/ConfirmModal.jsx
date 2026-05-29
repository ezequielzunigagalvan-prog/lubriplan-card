export default function ConfirmModal({ titulo, mensaje, onConfirm, onCancel, labelConfirm = 'Eliminar' }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 300,
      background: 'rgba(0,0,0,0.75)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{
        background: '#1c1a3a', borderRadius: 12, padding: '32px 28px',
        maxWidth: 400, width: '100%', border: '1px solid #2a2850',
      }}>
        <h3 style={{ color: '#e8eeff', fontSize: 18, fontWeight: 600, margin: '0 0 12px' }}>{titulo}</h3>
        <p style={{ color: '#8892b0', fontSize: 14, lineHeight: 1.6, margin: '0 0 28px' }}>{mensaje}</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button onClick={onCancel} style={{
            padding: '10px 20px', borderRadius: 8, border: '1px solid #2a2850',
            background: 'transparent', color: '#8892b0', cursor: 'pointer', fontSize: 14,
          }}>
            Cancelar
          </button>
          <button onClick={onConfirm} style={{
            padding: '10px 20px', borderRadius: 8, border: 'none',
            background: '#EF4444', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600,
          }}>
            {labelConfirm}
          </button>
        </div>
      </div>
    </div>
  )
}
