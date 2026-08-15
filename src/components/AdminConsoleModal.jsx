import React, { useState } from 'react';
import { 
  X, Shield, KeyRound, Eye, EyeOff, Lock, Unlock, Database, 
  PieChart, Plus, CheckCircle2, AlertCircle, Sparkles 
} from 'lucide-react';
import { auth } from '../services/auth';
import { sound } from '../services/soundEffects';

export default function AdminConsoleModal({ 
  onClose, 
  onSwitchToSpectator, 
  onOpenAdd, 
  onOpenSync, 
  onOpenAnalytics 
}) {
  const [hidePrices, setHidePrices] = useState(auth.hidePricesInSpectator());
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [pinMessage, setPinMessage] = useState(null);
  const [pinError, setPinError] = useState(null);

  const handleToggleHidePrices = (e) => {
    sound.playTap();
    const val = e.target.checked;
    setHidePrices(val);
    auth.setHidePricesInSpectator(val);
  };

  const handleChangePin = (e) => {
    e.preventDefault();
    setPinMessage(null);
    setPinError(null);

    const res = auth.changePin(currentPin, newPin);
    if (res.success) {
      sound.playStar();
      setPinMessage('Admin Master PIN updated successfully!');
      setCurrentPin('');
      setNewPin('');
    } else {
      sound.playTap();
      setPinError(res.error || 'Failed to update PIN');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-lg" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div 
              style={{ 
                width: 36, 
                height: 36, 
                borderRadius: '50%', 
                background: 'linear-gradient(135deg, rgba(48, 209, 88, 0.3), rgba(10, 132, 255, 0.3))', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                border: '1px solid rgba(48, 209, 88, 0.4)',
                color: '#34d399'
              }}
            >
              <Shield size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Master Owner Panel
              </div>
              <h2 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', fontWeight: 700 }}>
                Vault Admin Console
              </h2>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body" style={{ gap: '1.5rem' }}>
          {/* Quick Action Shortcuts Grid */}
          <div>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
              Vault Operations
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.85rem' }}>
              <button 
                className="stat-card" 
                onClick={() => {
                  sound.playSheetOpen();
                  onClose();
                  onOpenAdd();
                }}
                style={{ cursor: 'pointer', textAlign: 'left', padding: '1.15rem' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--apple-blue)' }}>
                  <Plus size={16} />
                  <strong>Add New Model</strong>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.35rem' }}>
                  Camera snap & AI scan
                </div>
              </button>

              <button 
                className="stat-card" 
                onClick={() => {
                  sound.playSheetOpen();
                  onClose();
                  onOpenSync();
                }}
                style={{ cursor: 'pointer', textAlign: 'left', padding: '1.15rem' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--apple-amber)' }}>
                  <Database size={16} />
                  <strong>Cloud Database Sync</strong>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.35rem' }}>
                  Supabase & CSV backups
                </div>
              </button>

              <button 
                className="stat-card" 
                onClick={() => {
                  sound.playSheetOpen();
                  onClose();
                  onOpenAnalytics();
                }}
                style={{ cursor: 'pointer', textAlign: 'left', padding: '1.15rem' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--apple-purple)' }}>
                  <PieChart size={16} />
                  <strong>Financial Portfolio</strong>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.35rem' }}>
                  Total cost & valuation ROI
                </div>
              </button>
            </div>
          </div>

          {/* Privacy & Spectator Mode Settings */}
          <div style={{ background: 'rgba(255, 255, 255, 0.04)', borderRadius: 'var(--radius-lg)', border: 'var(--glass-border)', padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.85rem' }}>
              Spectator Console Privacy Controls
            </h3>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid var(--glass-border)' }}>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Hide Paid Costs & Valuations in Spectator Mode
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                  When enabled, visitors / spectators only see models as a museum showroom without sensitive purchase prices.
                </div>
              </div>
              <input 
                type="checkbox"
                checked={hidePrices}
                onChange={handleToggleHidePrices}
                style={{ width: 20, height: 20, cursor: 'pointer', accentColor: 'var(--apple-blue)' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.85rem' }}>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                Active Mode: <strong>Admin (Unlocked)</strong>
              </span>
              <button 
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  sound.playTap();
                  onSwitchToSpectator();
                  onClose();
                }}
              >
                <Lock size={13} />
                <span>Switch to Spectator Mode (Lock)</span>
              </button>
            </div>
          </div>

          {/* Change PIN Section */}
          <div style={{ background: 'rgba(255, 255, 255, 0.04)', borderRadius: 'var(--radius-lg)', border: 'var(--glass-border)', padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.85rem' }}>
              Change Admin Master PIN
            </h3>

            {pinMessage && (
              <div style={{ background: 'rgba(48, 209, 88, 0.15)', border: '1px solid rgba(48, 209, 88, 0.4)', borderRadius: 'var(--radius-md)', padding: '0.65rem 1rem', color: '#34d399', fontSize: '0.8125rem', marginBottom: '0.75rem' }}>
                {pinMessage}
              </div>
            )}
            {pinError && (
              <div style={{ background: 'rgba(255, 69, 58, 0.15)', border: '1px solid rgba(255, 69, 58, 0.4)', borderRadius: 'var(--radius-md)', padding: '0.65rem 1rem', color: '#f87171', fontSize: '0.8125rem', marginBottom: '0.75rem' }}>
                {pinError}
              </div>
            )}

            <form onSubmit={handleChangePin} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '0.75rem', alignItems: 'flex-end' }}>
              <div>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Current PIN</label>
                <input 
                  type="password"
                  className="form-control font-mono"
                  placeholder="••••"
                  value={currentPin}
                  onChange={(e) => setCurrentPin(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>New PIN (min 4 digits)</label>
                <input 
                  type="password"
                  className="form-control font-mono"
                  placeholder="••••"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn btn-secondary btn-sm" style={{ height: '42px' }}>
                <KeyRound size={14} />
                <span>Update PIN</span>
              </button>
            </form>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn btn-primary" onClick={onClose}>
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
