import React, { useState } from 'react';
import { 
  Plus, ArrowDownToLine, Smartphone, Monitor, PieChart, Volume2, 
  VolumeX, Shield, Lock, Eye, Sparkles 
} from 'lucide-react';
import { sound } from '../services/soundEffects';
import ptrLogo from '../assets/ptr-logo.png';

export default function Navbar({ 
  totalCount, 
  onOpenAdd, 
  onOpenExportImport, 
  onOpenAnalytics,
  onOpenAdminConsole,
  onOpenAdminLogin,
  isAdmin,
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
            <span>{isAdmin ? 'Admin Console' : 'Spectator Mode'}</span>
          </button>

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

          {/* Portfolio Analytics (Visible to Admin or when permitted) */}
          {isAdmin && (
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
          )}

          {/* Device Switcher */}
          <button 
            type="button"
            className={`device-toggle-pill ${isMobile ? 'active-mobile' : 'active-desktop'}`}
            onClick={cycleDeviceMode}
            title={`Active layout: ${getDeviceLabel()}. Click to toggle between Auto, Mobile, and Desktop.`}
          >
            {isMobile ? <Smartphone size={13} /> : <Monitor size={13} />}
            <span style={{ display: isRealMobile ? 'none' : 'inline' }}>{getDeviceLabel()}</span>
          </button>

          {/* Cloud Sync Status */}
          <div className="status-pill" title={isSupabaseConnected ? 'Connected to Supabase PostgreSQL & Storage' : 'Local Storage Mode'}>
            <span className={`status-dot ${isSupabaseConnected ? 'connected' : 'local'}`} />
            <span style={{ display: isRealMobile ? 'none' : 'inline' }}>
              {isSupabaseConnected ? 'Cloud Sync' : 'Local Vault'}
            </span>
          </div>

          {/* Admin Operations: Sync and Add Model */}
          {isAdmin && (
            <>
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
            </>
          )}
        </div>
      </div>
    </header>
  );
}
