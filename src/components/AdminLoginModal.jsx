import React, { useState } from 'react';
import { X, Lock, Shield, KeyRound, Check, AlertCircle } from 'lucide-react';
import { auth } from '../services/auth';
import { sound } from '../services/soundEffects';

export default function AdminLoginModal({ onClose, onLoginSuccess }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    const res = auth.login(pin);
    if (res.success) {
      sound.playStar();
      onLoginSuccess();
      onClose();
    } else {
      sound.playTap();
      setError(res.error || 'Invalid PIN');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '420px' }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div 
              style={{ 
                width: 34, 
                height: 34, 
                borderRadius: '50%', 
                background: 'linear-gradient(135deg, rgba(10, 132, 255, 0.35), rgba(191, 90, 242, 0.35))',
                border: '1px solid rgba(10, 132, 255, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--apple-blue)'
              }}
            >
              <Lock size={16} />
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--apple-blue)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Owner Authentication
              </div>
              <h2 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', fontWeight: 700 }}>
                Unlock Admin Console
              </h2>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="modal-body" style={{ gap: '1.25rem' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Enter your Master PIN to unlock the <strong>Admin Console</strong> (enables model editing, adding, deletions, and cloud sync).
          </p>

          {error && (
            <div style={{ background: 'rgba(255, 69, 58, 0.15)', border: '1px solid rgba(255, 69, 58, 0.4)', borderRadius: 'var(--radius-md)', padding: '0.75rem 1rem', color: '#f87171', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="form-label" style={{ marginBottom: '0.4rem' }}>
              <span>Admin PIN</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>Default: 1234</span>
            </label>
            <input 
              type="password"
              className="form-control font-mono"
              placeholder="••••"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              autoFocus
              maxLength={8}
              style={{ textAlign: 'center', fontSize: '1.4rem', letterSpacing: '0.3em', padding: '0.6rem' }}
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1.5 }}>
              <KeyRound size={15} />
              <span>Unlock Admin</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
