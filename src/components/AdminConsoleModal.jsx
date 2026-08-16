import React, { useState } from 'react';
import { 
  X, Shield, KeyRound, Eye, Lock, Database, 
  PieChart, Plus, CheckCircle2, AlertCircle, FileSpreadsheet, Sparkles 
} from 'lucide-react';
import { auth } from '../services/auth';
import { sound } from '../services/soundEffects';

export default function AdminConsoleModal({ 
  onClose, 
  onSwitchToSpectator, 
  onOpenAdd, 
  onOpenSync, 
  onOpenAnalytics,
  onOpenExcelSheet
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
      setPinMessage('Master Password / PIN updated successfully!');
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
              <div style={{ fontSize: '0.72rem', color: '#34d399', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
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
        <div className="modal-body" style={{ gap: '1.25rem' }}>
          {/* Quick Action Shortcuts Grid */}
          <div>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
              Vault Management & Operations
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
              {/* Action 1: Excel Live Sheet */}
              <button 
                className="stat-card" 
                onClick={() => {
                  sound.playSheetOpen();
                  onClose();
                  onOpenExcelSheet();
                }}
                style={{ cursor: 'pointer', textAlign: 'left', padding: '1rem', border: '1px solid rgba(16, 185, 129, 0.35)', background: 'linear-gradient(145deg, rgba(16, 185, 129, 0.12), rgba(18, 22, 34, 0.7))' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#34d399' }}>
                  <FileSpreadsheet size={16} />
                  <strong>Excel Sheet</strong>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: '0.25rem' }}>
                  Live spreadsheet editor
                </div>
              </button>

              {/* Action 2: Add Model */}
              <button 
                className="stat-card" 
                onClick={() => {
                  sound.playSheetOpen();
                  onClose();
                  onOpenAdd();
                }}
                style={{ cursor: 'pointer', textAlign: 'left', padding: '1rem' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--apple-blue)' }}>
                  <Plus size={16} />
                  <strong>Add Model</strong>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: '0.25rem' }}>
                  Camera snap & AI
                </div>
              </button>

              {/* Action 3: Database Sync */}
              <button 
                className="stat-card" 
                onClick={() => {
                  sound.playSheetOpen();
                  onClose();
                  onOpenSync();
                }}
                style={{ cursor: 'pointer', textAlign: 'left', padding: '1rem' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--apple-amber)' }}>
                  <Database size={16} />
                  <strong>Cloud Sync</strong>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: '0.25rem' }}>
                  Supabase & CSV
                </div>
              </button>

              {/* Action 4: Analytics */}
              <button 
                className="stat-card" 
                onClick={() => {
                  sound.playSheetOpen();
                  onClose();
                  onOpenAnalytics();
                }}
                style={{ cursor: 'pointer', textAlign: 'left', padding: '1rem' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--apple-purple)' }}>
                  <PieChart size={16} />
                  <strong>Portfolio</strong>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: '0.25rem' }}>
                  Valuation ROI
                </div>
              </button>
            </div>
          </div>

          {/* Privacy & Spectator Mode Settings */}
          <div style={{ background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-lg)', border: 'var(--glass-border)', padding: '1.15rem' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.65rem' }}>
              Spectator Console Privacy Controls
            </h3>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.65rem 0', borderBottom: '1px solid var(--glass-border)' }}>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Hide Paid Costs & Valuations in Spectator Mode
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                  When enabled, visitors only see your collection as a museum showroom without sensitive purchase prices.
                </div>
              </div>
              <input 
                type="checkbox"
                checked={hidePrices}
                onChange={handleToggleHidePrices}
                style={{ width: 20, height: 20, cursor: 'pointer', accentColor: 'var(--apple-blue)' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem' }}>
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

          {/* Change Master PIN Section */}
          <div style={{ background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-lg)', border: 'var(--glass-border)', padding: '1.15rem' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.65rem' }}>
              Change Master Password / PIN
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
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Current Password</label>
                <input 
                  type="password"
                  className="form-control font-mono"
                  placeholder="••••••••"
                  value={currentPin}
                  onChange={(e) => setCurrentPin(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>New Password (min 4 chars)</label>
                <input 
                  type="password"
                  className="form-control font-mono"
                  placeholder="••••••••"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn btn-secondary btn-sm" style={{ height: '42px' }}>
                <KeyRound size={14} />
                <span>Update</span>
              </button>
            </form>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn btn-primary btn-sm" onClick={onClose}>
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
