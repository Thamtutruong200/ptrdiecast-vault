import React, { useState } from 'react';
import { 
  Plus, ArrowDownToLine, Smartphone, Monitor, PieChart, Volume2, 
  VolumeX, Shield, Lock, Eye, Sparkles, FileSpreadsheet 
} from 'lucide-react';
import { sound } from '../services/soundEffects';
import ptrLogo from '../assets/ptr-logo.png';
import ThemeToggle from './ThemeToggle';

export default function Navbar({ 
  totalCount, 
  onOpenAdd, 
  onOpenExportImport, 
  onOpenAnalytics,
  onOpenExcelSheet,
  onOpenAdminConsole,
  onOpenAdminLogin,
  isAdmin,
  isSupabaseConnected,
  deviceMode,
  setDeviceMode,
  isMobile,
  isRealMobile,
  activeCategory,
  setActiveCategory,
  theme,
  setTheme,
  currency = 'VND',
  onCurrencyChange,
  onOpenShowroom
}) {
  const [isMuted, setIsMuted] = useState(sound.muted);

  const toggleSound = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
    if (!muted) sound.playTap();
  };

  const cycleDeviceMode = () => {
    sound.playTap();
    if (deviceMode === 'auto') {
      setDeviceMode('mobile');
    } else if (deviceMode === 'mobile') {
      setDeviceMode('desktop');
    } else {
      setDeviceMode('auto');
    }
  };

  const getDeviceLabel = () => {
    if (deviceMode === 'auto') {
      return isRealMobile ? 'Auto: Mobile' : 'Auto: Desktop';
    }
    return deviceMode === 'mobile' ? 'Mobile View' : 'Desktop View';
  };

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        {/* Brand Logo & Title */}
        <div className="brand-logo">
          <img 
            src={ptrLogo} 
            alt="PTR Motorsport" 
            className="brand-logo-img"
          />
          <div className="brand-title">
            <span>PTR Motorsport</span>
            <span className="brand-sub">Vault & Collectibles</span>
          </div>
        </div>

        {/* Center: Multi-Category Vault Switcher (Diecast vs Toys) */}
        <div className="category-switcher-capsule">
          <button
            type="button"
            className={`category-tab-btn ${activeCategory === 'diecast' ? 'active' : ''}`}
            onClick={() => {
              sound.playTap();
              setActiveCategory('diecast');
            }}
          >
            <span>🏎️</span>
            <span>Diecast Vault</span>
          </button>

          <button
            type="button"
            className={`category-tab-btn ${activeCategory === 'toys' ? 'active' : ''}`}
            onClick={() => {
              sound.playTap();
              setActiveCategory('toys');
            }}
          >
            <span>🧸</span>
            <span>Toys & Sets</span>
          </button>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {/* Global Currency Switcher */}
          <select
            className="currency-select-pill"
            value={currency}
            onChange={(e) => {
              sound.playTap();
              onCurrencyChange && onCurrencyChange(e.target.value);
            }}
            title="Convert currency (VND, USD, EUR, JPY, GBP)"
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: 'var(--radius-pill)',
              color: '#34d399',
              fontSize: '0.75rem',
              fontWeight: 800,
              padding: '0.35rem 0.65rem',
              cursor: 'pointer',
              outline: 'none',
              fontFamily: 'inherit'
            }}
          >
            <option value="VND" style={{ background: '#121622', color: '#fff' }}>₫ VND</option>
            <option value="USD" style={{ background: '#121622', color: '#fff' }}>$ USD</option>
            <option value="EUR" style={{ background: '#121622', color: '#fff' }}>€ EUR</option>
            <option value="JPY" style={{ background: '#121622', color: '#fff' }}>¥ JPY</option>
            <option value="GBP" style={{ background: '#121622', color: '#fff' }}>£ GBP</option>
          </select>

          {/* Museum Exhibition Mode */}
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => {
              sound.playSheetOpen();
              onOpenShowroom && onOpenShowroom();
            }}
            title="Open Fullscreen Museum Kiosk Presentation (Shortcut: F)"
            style={{ borderRadius: 'var(--radius-pill)', borderColor: 'rgba(212, 175, 55, 0.35)', color: '#d4af37' }}
          >
            <span>🏛️</span>
            <span style={{ display: isRealMobile ? 'none' : 'inline' }}>Showroom</span>
          </button>

          {/* Light / Dark Mode Toggle */}
          <ThemeToggle theme={theme} setTheme={setTheme} />

          {/* Admin / Spectator Console Switcher Pill */}
          <button
            type="button"
            className={`device-toggle-pill ${isAdmin ? 'active-desktop' : ''}`}
            onClick={() => {
              sound.playSheetOpen();
              if (isAdmin) {
                onOpenAdminConsole();
              } else {
                onOpenAdminLogin();
              }
            }}
            title={isAdmin ? 'Admin Console (Unlocked). Click to manage settings.' : 'Spectator Mode (Read-only). Click to unlock Admin.'}
            style={{
              borderColor: isAdmin ? 'rgba(52, 211, 153, 0.5)' : 'rgba(255, 255, 255, 0.15)',
              color: isAdmin ? '#34d399' : 'var(--text-secondary)'
            }}
          >
            {isAdmin ? <Shield size={13} color="#34d399" /> : <Eye size={13} />}
            <span style={{ display: isRealMobile ? 'none' : 'inline' }}>
              {isAdmin ? 'Admin Console' : 'Spectator'}
            </span>
          </button>

          {/* Excel Live Sheet Editor (Admin View) */}
          {isAdmin && (
            <button 
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => {
                sound.playSheetOpen();
                onOpenExcelSheet();
              }}
              title="Open Live Excel-Style Spreadsheet Data Editor"
              style={{ background: 'rgba(16, 185, 129, 0.15)', borderColor: 'rgba(16, 185, 129, 0.35)', color: '#34d399' }}
            >
              <FileSpreadsheet size={14} />
              <span style={{ display: isRealMobile ? 'none' : 'inline' }}>Excel Sheet</span>
            </button>
          )}

          {/* Sound FX Toggle */}
          <button 
            type="button"
            className="btn btn-secondary btn-icon"
            style={{ width: 34, height: 34 }}
            onClick={toggleSound}
            title={isMuted ? 'Turn Sound FX On' : 'Mute Sound FX'}
          >
            {isMuted ? <VolumeX size={14} color="var(--text-tertiary)" /> : <Volume2 size={14} color="var(--apple-blue)" />}
          </button>

          {/* Cloud Sync Status */}
          <div className="status-pill" title={isSupabaseConnected ? 'Connected to Supabase PostgreSQL & Storage' : 'Local Storage Mode'}>
            <span className={`status-dot ${isSupabaseConnected ? 'connected' : 'local'}`} />
            <span style={{ display: isRealMobile ? 'none' : 'inline' }}>
              {isSupabaseConnected ? 'Cloud' : 'Local'}
            </span>
          </div>

          {/* Admin Operations: Add Model */}
          {isAdmin && (
            <button 
              className="btn btn-primary btn-sm"
              onClick={() => {
                sound.playSheetOpen();
                onOpenAdd();
              }}
            >
              <Plus size={15} strokeWidth={2.5} />
              <span style={{ display: isRealMobile ? 'none' : 'inline' }}>
                {activeCategory === 'diecast' ? 'Add Model' : 'Add Collectible'}
              </span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
