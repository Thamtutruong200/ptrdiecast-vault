import React, { useState } from 'react';
import { X, Lock, KeyRound, AlertCircle, Shield } from 'lucide-react';
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
      setError(res.error || 'Access Denied: Incorrect Master Password');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '400px', borderRadius: 'var(--radius-xl)' }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div 
              style={{ 
                width: 36, 
                height: 36, 
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
                Owner Security Gate
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
        <form onSubmit={handleSubmit} className="modal-body" style={{ gap: '1.15rem' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            This vault is currently in read-only <strong>Spectator Mode</strong>. Enter the Owner Master Password / PIN to unlock editing, deletions, and adding models.
          </p>

          {error && (
            <div style={{ background: 'rgba(255, 69, 58, 0.15)', border: '1px solid rgba(255, 69, 58, 0.4)', borderRadius: 'var(--radius-md)', padding: '0.75rem 1rem', color: '#f87171', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="form-label" style={{ marginBottom: '0.4rem' }}>
              <span>Master Password / PIN</span>
            </label>
            <input 
              type="password"
              className="form-control font-mono"
              placeholder="••••••••"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              autoFocus
              maxLength={24}
              style={{ textAlign: 'center', fontSize: '1.3rem', letterSpacing: '0.25em', padding: '0.65rem' }}
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
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
