import React, { useState } from 'react';
import { Plus, ArrowDownToLine, Smartphone, Monitor, PieChart, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { sound } from '../services/soundEffects';
import ptrLogo from '../assets/ptr-logo.png';

export default function Navbar({ 
  totalCount, 
  onOpenAdd, 
  onOpenExportImport, 
  onOpenAnalytics,
  isSupabaseConnected,
  deviceMode,
  setDeviceMode,
  isMobile,
  isRealMobile
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
        {/* PTR Motorsport Brand Logo */}
        <div className="brand-logo">
          <img 
            src={ptrLogo} 
            alt="PTR Motorsport" 
            className="brand-logo-img"
          />
          <div className="brand-title">
            <span>PTR Motorsport</span>
            <span className="brand-sub">Diecast Collection Vault</span>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          {/* Audio Feedback Haptic Mute Toggle */}
          <button 
            type="button"
            className="btn btn-secondary btn-icon"
            style={{ width: 34, height: 34 }}
            onClick={toggleSound}
            title={isMuted ? 'Turn Sound FX On' : 'Mute Sound FX'}
          >
            {isMuted ? <VolumeX size={14} color="var(--text-tertiary)" /> : <Volume2 size={14} color="var(--apple-blue)" />}
          </button>

          {/* Portfolio Analytics Button */}
          <button 
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => {
              sound.playSheetOpen();
              onOpenAnalytics();
            }}
            title="Open Collection Financial & Brand Analytics"
          >
            <PieChart size={14} color="var(--apple-purple)" />
            <span style={{ display: isRealMobile ? 'none' : 'inline' }}>Analytics</span>
          </button>

          {/* Device Mode Switcher Capsule */}
          <button 
            type="button"
            className={`device-toggle-pill ${isMobile ? 'active-mobile' : 'active-desktop'}`}
            onClick={cycleDeviceMode}
            title={`Active layout: ${getDeviceLabel()}. Click to toggle between Auto, Mobile, and Desktop.`}
          >
            {isMobile ? <Smartphone size={13} /> : <Monitor size={13} />}
            <span>{getDeviceLabel()}</span>
          </button>

          {/* Liquid Cloud Sync Status */}
          <div className="status-pill" title={isSupabaseConnected ? 'Connected to Supabase PostgreSQL & Storage' : 'Local Storage Mode'}>
            <span className={`status-dot ${isSupabaseConnected ? 'connected' : 'local'}`} />
            <span style={{ display: isRealMobile ? 'none' : 'inline' }}>
              {isSupabaseConnected ? 'Cloud Sync' : 'Local Vault'}
            </span>
          </div>

          {/* Sync Button */}
          <button 
            className="btn btn-secondary btn-sm"
            onClick={() => {
              sound.playSheetOpen();
              onOpenExportImport();
            }}
            title="Data Sync & Backup"
          >
            <ArrowDownToLine size={14} />
            <span style={{ display: isRealMobile ? 'none' : 'inline' }}>Sync</span>
          </button>

          {/* Add Model Primary CTA */}
          <button 
            className="btn btn-primary btn-sm"
            onClick={() => {
              sound.playSheetOpen();
              onOpenAdd();
            }}
          >
            <Plus size={15} strokeWidth={2.5} />
            <span>Add Model</span>
          </button>
        </div>
      </div>
    </header>
  );
}
