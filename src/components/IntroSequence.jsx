import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, X } from 'lucide-react';
import ptrLogo from '../assets/ptr-logo.png';
import { sound } from '../services/soundEffects';

export default function IntroSequence({ onComplete }) {
  const [phase, setPhase] = useState(1); // 1: Logo & Emblem, 2: 3D Collector Box Zoom, 3: Unboxing Reveal

  useEffect(() => {
    // Stage 1: Logo pulse
    const timer1 = setTimeout(() => {
      sound.playSheetOpen();
      setPhase(2);
    }, 1100);

    // Stage 2: Box unboxing zoom
    const timer2 = setTimeout(() => {
      sound.playStar();
      setPhase(3);
    }, 2400);

    // Stage 3: Smooth transition to main app
    const timer3 = setTimeout(() => {
      onComplete();
    }, 3600);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onComplete]);

  const handleSkip = () => {
    sound.playTap();
    onComplete();
  };

  return (
    <div className={`intro-sequence-overlay phase-${phase}`}>
      {/* Skip Button */}
      <button 
        type="button" 
        className="intro-skip-btn"
        onClick={handleSkip}
      >
        <span>Skip Intro</span>
        <ArrowRight size={13} />
      </button>

      {/* Cinematic Ambient Background Rays */}
      <div className="intro-light-bloom" />
      <div className="intro-grid-floor" />

      {/* Phase 1 & 2: PTR Mascot Logo Hero */}
      <div className={`intro-logo-capsule ${phase >= 2 ? 'zoom-box-trigger' : ''}`}>
        <div className="intro-logo-glow" />
        <img 
          src={ptrLogo} 
          alt="PTR Motorsport" 
          className="intro-logo-image" 
        />
        <div className="intro-title-group">
          <h1 className="intro-brand-title">PTR MOTORSPORT</h1>
          <p className="intro-brand-sub">DIECAST & COLLECTIBLES VAULT</p>
        </div>
      </div>

      {/* Phase 2 & 3: 3D Acrylic Collector Showcase Box */}
      <div className={`intro-collector-box-3d ${phase >= 2 ? 'visible' : ''} ${phase === 3 ? 'unboxing-open' : ''}`}>
        <div className="box-face box-front">
          <div className="box-acrylic-glass">
            <div className="box-specular-sheen" />
            <div className="box-inner-plinth">
              <div className="box-spotlight-beam" />
              <img 
                src="https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=800&q=80" 
                alt="Vault Model"
                className="box-hero-car"
              />
              <div className="box-gold-plaque">
                <span>PTR MOTORSPORT • LIMITED EDITION VAULT</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Loading Progress Bar */}
      <div className="intro-progress-bar-container">
        <div className="intro-progress-bar" />
      </div>
    </div>
  );
}
