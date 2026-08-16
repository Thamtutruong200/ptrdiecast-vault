import React, { useEffect } from 'react';
import ptrLogo from '../assets/ptr-logo.png';
import { sound } from '../services/soundEffects';

export default function IntroSequence({ onComplete }) {
  useEffect(() => {
    sound.playStar();
    const timer = setTimeout(() => {
      onComplete();
    }, 1800); // Quick, elegant 1.8s welcome

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="intro-sequence-overlay" onClick={onComplete} style={{ cursor: 'pointer' }}>
      {/* Ambient Radial Backdrop */}
      <div className="intro-light-bloom" />

      {/* Clean Minimal Welcome Card */}
      <div className="intro-logo-capsule">
        <img 
          src={ptrLogo} 
          alt="PTr's Diecast Collection" 
          className="intro-logo-image" 
        />
        <div className="intro-title-group">
          <h1 className="intro-brand-title">PTr's Diecast Collection</h1>
          <p className="intro-brand-sub">VAULT & MOTORSPORT SHOWCASE</p>
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: '2rem', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
        Click anywhere to enter →
      </div>
    </div>
  );
}
