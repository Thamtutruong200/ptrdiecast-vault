import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Play, Pause, ChevronLeft, ChevronRight, Star, 
  Flag, Image as ImageIcon, Maximize, Minimize, Volume2, VolumeX, Shield 
} from 'lucide-react';
import { formatCurrency } from '../services/currency';
import { sound } from '../services/soundEffects';
import { BrandBadge } from '../services/brandLogos';
import ptrLogo from '../assets/ptr-logo.png';

export default function MuseumShowroomModal({ items = [], onClose, currency = 'VND' }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [activeTab, setActiveTab] = useState('model'); // 'model' | 'track'
  const [progress, setProgress] = useState(0);

  const displayList = items.length > 0 ? items : [];
  const currentItem = displayList[currentIndex] || null;

  // Auto-advance timer (8 seconds per slide)
  useEffect(() => {
    if (!isPlaying || displayList.length <= 1) return;

    const interval = 100;
    const duration = 8000;
    const step = (interval / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setCurrentIndex((idx) => (idx + 1) % displayList.length);
          setActiveTab('model');
          return 0;
        }
        return prev + step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [isPlaying, displayList.length, currentIndex]);

  const handleNext = () => {
    sound.playTap();
    setCurrentIndex((prev) => (prev + 1) % displayList.length);
    setProgress(0);
    setActiveTab('model');
  };

  const handlePrev = () => {
    sound.playTap();
    setCurrentIndex((prev) => (prev - 1 + displayList.length) % displayList.length);
    setProgress(0);
    setActiveTab('model');
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' || e.key === ' ') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [displayList.length]);

  if (!currentItem) return null;

  const modelPhotos = currentItem.photos && currentItem.photos.length > 0
    ? currentItem.photos
    : ['https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1200&q=80'];

  const trackPhotos = currentItem.track_photos && currentItem.track_photos.length > 0
    ? currentItem.track_photos
    : modelPhotos;

  const displayPhoto = activeTab === 'model' ? modelPhotos[0] : trackPhotos[0];

  return (
    <div 
      className="museum-showroom-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: '#07090e',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '2rem',
        animation: 'fadeIn 0.3s ease'
      }}
    >
      {/* Progress Bar Top */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          height: '4px',
          width: `${progress}%`,
          background: 'linear-gradient(90deg, #0a84ff, #d4af37, #30d158)',
          transition: 'width 0.1s linear'
        }}
      />

      {/* Top Header Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <img src={ptrLogo} alt="Logo" style={{ width: 38, height: 38, borderRadius: 8 }} />
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.1em', color: '#d4af37', textTransform: 'uppercase' }}>
              Museum Exhibition Mode
            </div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>
              PTR Motorsport Vault · ({currentIndex + 1} of {displayList.length})
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          {/* Play / Pause */}
          <button 
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => {
              sound.playTap();
              setIsPlaying(!isPlaying);
            }}
            style={{ borderRadius: 'var(--radius-pill)' }}
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
            <span>{isPlaying ? 'Pause' : 'Play'}</span>
          </button>

          {/* Close */}
          <button 
            type="button"
            className="btn btn-secondary btn-icon"
            onClick={onClose}
            style={{ width: 38, height: 38, borderRadius: '50%' }}
            title="Exit Museum Mode (Esc)"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Center Stage Presentation */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '3rem', alignItems: 'center', maxWidth: '1400px', width: '100%', margin: '0 auto', zIndex: 10 }}>
        {/* Photo Stage */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Photo Mode Switcher */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              type="button"
              className={`photo-tab-btn ${activeTab === 'model' ? 'active' : ''}`}
              onClick={() => {
                sound.playTap();
                setActiveTab('model');
              }}
              style={{ background: activeTab === 'model' ? 'rgba(10, 132, 255, 0.25)' : 'rgba(255,255,255,0.05)', color: activeTab === 'model' ? '#0a84ff' : '#fff' }}
            >
              <ImageIcon size={13} />
              <span>Vault Model</span>
            </button>
            <button 
              type="button"
              className={`photo-tab-btn ${activeTab === 'track' ? 'active' : ''}`}
              onClick={() => {
                sound.playTap();
                setActiveTab('track');
              }}
              style={{ background: activeTab === 'track' ? 'rgba(255, 159, 10, 0.25)' : 'rgba(255,255,255,0.05)', color: activeTab === 'track' ? '#ff9f0a' : '#fff' }}
            >
              <Flag size={13} />
              <span>🏁 Real Race Track</span>
            </button>
          </div>

          <div 
            style={{
              width: '100%',
              height: '480px',
              borderRadius: '20px',
              overflow: 'hidden',
              background: 'radial-gradient(circle at center, #1a2030 0%, #0c0f17 100%)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              boxShadow: '0 30px 80px rgba(0, 0, 0, 0.8), 0 0 40px rgba(10, 132, 255, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative'
            }}
          >
            <img 
              key={displayPhoto}
              src={displayPhoto} 
              alt={currentItem.casting_name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: activeTab === 'model' ? 'contain' : 'cover',
                padding: activeTab === 'model' ? '1.5rem' : '0',
                animation: 'fadeIn 0.5s ease'
              }}
            />
          </div>
        </div>

        {/* Telemetry & Spec Sheet */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span className="scale-pill-badge" style={{ position: 'static', fontSize: '0.85rem', padding: '0.3rem 0.75rem' }}>
              {currentItem.scale || '1:64'}
            </span>
            <BrandBadge brandName={currentItem.brand} size="md" />
          </div>

          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.15, margin: 0 }}>
            {currentItem.casting_name}
          </h1>

          {currentItem.livery && (
            <div style={{ fontSize: '1.1rem', color: '#34d399', fontWeight: 700 }}>
              🏁 {currentItem.livery}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '14px', padding: '1.25rem' }}>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', fontWeight: 700 }}>Chassis Scale</div>
              <div style={{ fontSize: '1rem', color: '#fff', fontWeight: 700, marginTop: '0.2rem' }}>{currentItem.scale || '1:64'}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', fontWeight: 700 }}>Condition</div>
              <div style={{ fontSize: '1rem', color: '#34d399', fontWeight: 700, marginTop: '0.2rem' }}>{currentItem.condition || 'Mint in Box'}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', fontWeight: 700 }}>Motorsport Era</div>
              <div style={{ fontSize: '1rem', color: '#fff', fontWeight: 700, marginTop: '0.2rem' }}>{currentItem.era || 'Modern Supercar'}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', fontWeight: 700 }}>Purchase Price</div>
              <div style={{ fontSize: '1.25rem', color: '#d4af37', fontWeight: 900, marginTop: '0.2rem', fontFamily: 'monospace' }}>
                {formatCurrency(currentItem.purchase_price, currency)}
              </div>
            </div>
          </div>

          {currentItem.notes && (
            <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, margin: 0 }}>
              {currentItem.notes}
            </p>
          )}
        </div>
      </div>

      {/* Bottom Navigation Carousel Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10, maxWidth: '1400px', width: '100%', margin: '0 auto' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            type="button" 
            className="btn btn-secondary btn-sm"
            onClick={handlePrev}
            style={{ borderRadius: 'var(--radius-pill)', padding: '0.5rem 1rem' }}
          >
            <ChevronLeft size={16} />
            <span>Previous</span>
          </button>
          <button 
            type="button" 
            className="btn btn-secondary btn-sm"
            onClick={handleNext}
            style={{ borderRadius: 'var(--radius-pill)', padding: '0.5rem 1rem' }}
          >
            <span>Next</span>
            <ChevronRight size={16} />
          </button>
        </div>

        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>
          Press Space or Arrow keys to advance · Esc to exit
        </div>
      </div>
    </div>
  );
}
