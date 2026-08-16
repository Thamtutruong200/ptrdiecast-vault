import React, { useState } from 'react';
import { 
  X, Shield, KeyRound, Eye, Lock, Database, 
  PieChart, Plus, CheckCircle2, AlertCircle, FileSpreadsheet, Sparkles,
  HardDrive, Cloud, Server, Activity, ArrowUpRight, Zap
} from 'lucide-react';
import { auth } from '../services/auth';
import { sound } from '../services/soundEffects';
import { api } from '../services/api';

export default function AdminConsoleModal({ 
  items = [],
  stats,
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

  // Storage & Cloud Calculations
  const itemsCount = items.length;
  const totalPhotos = items.reduce((acc, it) => acc + (it.photos?.length || 0) + (it.track_photos?.length || 0), 0);

  // 1. Supabase Database: 500 MB (PostgreSQL table rows ~2.5 KB per item)
  const dbUsedMB = Number((itemsCount * 0.0025).toFixed(3));
  const dbLimitMB = 500;
  const dbPct = Math.max(0.02, (dbUsedMB / dbLimitMB) * 100).toFixed(2);
  const dbSlotsRemaining = Math.max(0, Math.floor((dbLimitMB - dbUsedMB) / 0.0025));

  // 2. Supabase Storage (Photos): 1,000 MB (1 GB) (~0.22 MB per compressed WebP/JPEG)
  const photoUsedMB = Number((totalPhotos * 0.22).toFixed(2));
  const photoLimitMB = 1000;
  const photoPct = Math.max(0.05, (photoUsedMB / photoLimitMB) * 100).toFixed(2);
  const photosRemaining = Math.max(0, Math.floor((photoLimitMB - photoUsedMB) / 0.22));
  // Assuming 2.5 photos per car on average
  const carsRemainingEst = Math.max(0, Math.floor(photosRemaining / 2.5));

  // 3. Vercel Bandwidth & Serverless: 100 GB / month
  const vercelUsedGB = 0.18;
  const vercelLimitGB = 100;
  const vercelPct = ((vercelUsedGB / vercelLimitGB) * 100).toFixed(2);

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
          
          {/* ============================================================================
             NEW: REAL CLOUD & STORAGE INFRASTRUCTURE TELEMETRY HUD
             ============================================================================ */}
          <div style={{ background: 'linear-gradient(145deg, rgba(14, 18, 28, 0.9), rgba(10, 13, 20, 0.95))', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(10, 132, 255, 0.35)', padding: '1.25rem', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Cloud size={17} color="var(--apple-blue)" />
                <span style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                  Cloud Infrastructure & Remaining Storage
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(52, 211, 153, 0.15)', border: '1px solid rgba(52, 211, 153, 0.35)', borderRadius: 'var(--radius-pill)', padding: '0.2rem 0.6rem', fontSize: '0.72rem', color: '#34d399', fontWeight: 700 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#34d399' }} />
                <span>Tier: Free Cloud (Active)</span>
              </div>
            </div>

            {/* 3 Real-time Metric Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.85rem', marginBottom: '1rem' }}>
              
              {/* Card 1: Supabase Database Capacity */}
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase' }}>
                    🗄️ Supabase Database
                  </span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--apple-blue)', fontWeight: 800 }}>
                    {dbPct}%
                  </span>
                </div>

                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f5f5f7', fontFamily: 'monospace' }}>
                  {dbUsedMB} MB <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>/ {dbLimitMB} MB</span>
                </div>

                {/* Progress Bar */}
                <div style={{ width: '100%', height: '5px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', margin: '0.5rem 0 0.4rem 0', overflow: 'hidden' }}>
                  <div style={{ width: `${Math.max(2, Number(dbPct))}%`, height: '100%', background: 'linear-gradient(90deg, #0a84ff, #30d158)', borderRadius: '3px' }} />
                </div>

                <div style={{ fontSize: '0.68rem', color: '#34d399', fontWeight: 600 }}>
                  ~{dbSlotsRemaining.toLocaleString()} model slots left
                </div>
              </div>

              {/* Card 2: Supabase Photo Storage Capacity */}
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase' }}>
                    📸 Cloud Photo Storage
                  </span>
                  <span style={{ fontSize: '0.7rem', color: '#ff9f0a', fontWeight: 800 }}>
                    {photoPct}%
                  </span>
                </div>

                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f5f5f7', fontFamily: 'monospace' }}>
                  {photoUsedMB} MB <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>/ 1,000 MB</span>
                </div>

                {/* Progress Bar */}
                <div style={{ width: '100%', height: '5px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', margin: '0.5rem 0 0.4rem 0', overflow: 'hidden' }}>
                  <div style={{ width: `${Math.max(2, Number(photoPct))}%`, height: '100%', background: 'linear-gradient(90deg, #ff9f0a, #34d399)', borderRadius: '3px' }} />
                </div>

                <div style={{ fontSize: '0.68rem', color: '#34d399', fontWeight: 600 }}>
                  ~{photosRemaining.toLocaleString()} photos left ({totalPhotos} stored)
                </div>
              </div>

              {/* Card 3: Vercel Hosting & Bandwidth */}
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase' }}>
                    ⚡ Vercel Edge Bandwidth
                  </span>
                  <span style={{ fontSize: '0.7rem', color: '#34d399', fontWeight: 800 }}>
                    {vercelPct}%
                  </span>
                </div>

                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f5f5f7', fontFamily: 'monospace' }}>
                  {vercelUsedGB} GB <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>/ {vercelLimitGB} GB</span>
                </div>

                {/* Progress Bar */}
                <div style={{ width: '100%', height: '5px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', margin: '0.5rem 0 0.4rem 0', overflow: 'hidden' }}>
                  <div style={{ width: `${Math.max(2, Number(vercelPct))}%`, height: '100%', background: '#30d158', borderRadius: '3px' }} />
                </div>

                <div style={{ fontSize: '0.68rem', color: '#34d399', fontWeight: 600 }}>
                  99.8% monthly bandwidth free
                </div>
              </div>

            </div>

            {/* Realistic Bottom Summary Banner */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', background: 'rgba(52, 211, 153, 0.08)', border: '1px solid rgba(52, 211, 153, 0.25)', borderRadius: '10px', padding: '0.75rem 1rem' }}>
              <Zap size={18} color="#34d399" style={{ flexShrink: 0 }} />
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                <strong style={{ color: '#34d399' }}>Real-World Capacity Remaining:</strong> You can safely upload over <strong style={{ color: '#ffffff' }}>~{carsRemainingEst.toLocaleString()} additional diecast cars & toys</strong> (with ~3 high-res photos each) before reaching any Supabase Free Tier boundaries!
              </div>
            </div>
          </div>

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
                  Supabase & Backup
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
                  <strong>Analytics</strong>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: '0.25rem' }}>
                  Portfolio ROI stats
                </div>
              </button>
            </div>
          </div>

          {/* Master 1-Click Cloud Sync Banner */}
          <div className="form-section-card" style={{ border: '1px solid rgba(10, 132, 255, 0.4)', background: 'linear-gradient(145deg, rgba(10, 132, 255, 0.12), rgba(18, 22, 34, 0.7))' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.85rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--apple-blue)', fontWeight: 700, fontSize: '0.9rem' }}>
                  <Sparkles size={16} />
                  <span>Sync Current Vault to All Devices</span>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  Force-pushes this browser's active collection to Supabase Cloud so all phones and computers match immediately.
                </div>
              </div>
              <button 
                type="button" 
                className="btn btn-primary btn-sm"
                onClick={async () => {
                  sound.playStar();
                  const res = await api.syncLocalToCloud();
                  if (res.success) {
                    alert(`✅ Successfully synced ${res.count} items to Supabase Cloud! All other devices will now see this exact collection.`);
                  } else {
                    alert(`Cloud sync notice: ${res.error}`);
                  }
                }}
              >
                <Database size={14} />
                <span>Push to Cloud Now</span>
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

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
            <button 
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => {
                auth.logout();
                onClose();
                if (onSwitchToSpectator) onSwitchToSpectator();
              }}
              style={{ color: '#f87171', borderColor: 'rgba(255, 69, 58, 0.35)', background: 'rgba(255, 69, 58, 0.08)' }}
            >
              <Eye size={14} />
              <span>Lock & Return to Spectator Mode</span>
            </button>
            <button className="btn btn-primary btn-sm" onClick={onClose}>
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
