import React, { useState } from 'react';
import { X, Lock, KeyRound, AlertCircle, ShieldCheck } from 'lucide-react';
import { auth } from '../services/auth';
import { sound } from '../services/soundEffects';

export default function AdminLoginModal({ onClose, onLoginSuccess }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(null);
  const isConfigured = auth.isPinConfigured();

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
      setError(res.error || 'Invalid Master Password');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '420px', borderRadius: 'var(--radius-xl)' }} onClick={(e) => e.stopPropagation()}>
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
                {isConfigured ? 'Unlock Admin Console' : 'Set Master Password'}
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
            {isConfigured 
              ? 'Enter your Master Password / PIN to unlock the Admin Console (enables adding models, spreadsheet editor, and cloud sync).'
              : 'Create your private Master Password / PIN to lock and protect your collection vault.'}
          </p>

          {error && (
            <div style={{ background: 'rgba(255, 69, 58, 0.15)', border: '1px solid rgba(255, 69, 58, 0.4)', borderRadius: 'var(--radius-md)', padding: '0.75rem 1rem', color: '#f87171', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="form-label" style={{ marginBottom: '0.4rem' }}>
              <span>{isConfigured ? 'Master PIN / Password' : 'Create Master PIN (Min 4 chars)'}</span>
            </label>
            <input 
              type="password"
              className="form-control font-mono"
              placeholder="••••••••"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              autoFocus
              maxLength={16}
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
              <span>{isConfigured ? 'Unlock Admin' : 'Set & Unlock'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
