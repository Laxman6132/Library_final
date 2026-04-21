import { useEffect } from 'react';

export default function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  const colors = {
    success: { bg: '#198754', icon: '✓' },
    error: { bg: '#dc3545', icon: '✕' },
    info: { bg: '#0d6efd', icon: 'ℹ' },
    warning: { bg: '#ffc107', icon: '⚠' },
  };
  const { bg, icon } = colors[type] || colors.info;

  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
      minWidth: 280, maxWidth: 380,
      background: '#fff', borderRadius: 12,
      boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
      border: `1px solid ${bg}30`,
      overflow: 'hidden',
      animation: 'slideInRight 0.3s ease',
    }}>
      <div style={{ height: 4, background: bg }} />
      <div className="d-flex align-items-center gap-3 p-3">
        <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white flex-shrink-0"
          style={{ width: 32, height: 32, background: bg, fontSize: 14 }}>
          {icon}
        </div>
        <span className="text-dark flex-grow-1" style={{ fontSize: '0.9rem' }}>{message}</span>
        <button className="btn-close btn-sm" onClick={onClose} style={{ fontSize: '0.7rem' }} />
      </div>
    </div>
  );
}
