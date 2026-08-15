import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronLeft, ChevronRight, Eye, Star, Sparkles, Tag, 
  TrendingUp, ShieldCheck, Sun, Lightbulb, Compass, Maximize2 
} from 'lucide-react';
import { formatVND } from '../services/api';
import { sound } from '../services/soundEffects';

const LIGHTING_MODES = [
  { id: 'studio', label: 'Studio Spotlight', color: 'rgba(255, 255, 255, 0.15)' },
  { id: 'neon', label: 'Neon Telemetry', color: 'rgba(10, 132, 255, 0.25)' },
  { id: 'sunset', label: 'Warm Octane', color: 'rgba(255, 159, 10, 0.25)' },
];

export default function ShowcaseStage({ items, onSelectCar, onToggleFavorite }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lightingMode, setLightingMode] = useState('studio');
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const stageRef = useRef(null);

  if (!items || items.length === 0) return null;

  const currentCar = items[currentIndex] || items[0];

  const handleNext = () => {
    sound.playTap();
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  const handlePrev = () => {
    sound.playTap();
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  const handleMouseMove = (e) => {
    if (!stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 20; // -10 to +10 deg
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -20;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  const currentPhoto = (currentCar.photos && currentCar.photos.length > 0)
    ? currentCar.photos[0]
    : 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1200&q=80';

  const profit = (currentCar.current_value || 0) - (currentCar.purchase_price || 0);
  const isPositive = profit >= 0;
  const profitPct = currentCar.purchase_price > 0 
    ? ((profit / currentCar.purchase_price) * 100).toFixed(1) 
    : 0;

  return (
    <div className="showcase-studio-wrapper">
      {/* Top Studio Stage Toolbar */}
      <div className="showcase-toolbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Sparkles size={16} color="var(--apple-blue)" />
          <span style={{ fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-primary)' }}>
            Cinematic Studio Showcase
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
            ({currentIndex + 1} of {items.length})
          </span>
        </div>

        {/* Lighting Selector Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginRight: '0.2rem' }}>Stage Light:</span>
          {LIGHTING_MODES.map((mode) => (
            <button
              key={mode.id}
              className={`btn btn-sm ${lightingMode === mode.id ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.72rem', padding: '0.25rem 0.65rem' }}
              onClick={() => {
                sound.playTap();
                setLightingMode(mode.id);
              }}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main 3D Parallax Showcase Stage */}
      <div 
        ref={stageRef}
        className={`showcase-stage light-${lightingMode}`}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Navigation Arrow Left */}
        <button 
          className="stage-nav-btn stage-nav-left" 
          onClick={handlePrev}
          title="Previous Model (Left Arrow)"
        >
          <ChevronLeft size={24} />
        </button>

        {/* Navigation Arrow Right */}
        <button 
          className="stage-nav-btn stage-nav-right" 
          onClick={handleNext}
          title="Next Model (Right Arrow)"
        >
          <ChevronRight size={24} />
        </button>

        {/* 3D Floating Stage Content */}
        <div 
          className="stage-interactive-container"
          style={{
            transform: `perspective(1000px) rotateY(${mousePos.x * 0.75}deg) rotateX(${mousePos.y * 0.75}deg)`
          }}
        >
          {/* Main Diecast Image on Pedestal */}
          <div className="stage-image-plinth" onClick={() => onSelectCar(currentCar)}>
            <img 
              src={currentPhoto} 
              alt={currentCar.casting_name} 
              className="stage-car-image"
            />
            {/* Pedestal Acrylic Reflection */}
            <div className="stage-pedestal-mirror" />
          </div>

          {/* Floating Telemetry Glass HUD Card */}
          <div className="stage-telemetry-hud">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="scale-pill-badge" style={{ position: 'static' }}>
                  {currentCar.scale}
                </span>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--apple-blue)', textTransform: 'uppercase' }}>
                  {currentCar.brand}
                </span>
              </div>

              <button 
                className={`fav-capsule ${currentCar.is_favorite ? 'favorited' : ''}`}
                style={{ position: 'static', width: 30, height: 30 }}
                onClick={(e) => {
                  e.stopPropagation();
                  sound.playStar();
                  onToggleFavorite(currentCar);
                }}
              >
                <Star size={13} fill={currentCar.is_favorite ? 'currentColor' : 'none'} />
              </button>
            </div>

            <h2 className="stage-car-title">{currentCar.casting_name}</h2>
            {currentCar.livery && (
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
                <span className="card-livery-dot" />
                <span>{currentCar.livery}</span>
              </div>
            )}

            {/* Price & Valuation HUD */}
            <div className="stage-hud-price-row">
              <div>
                <div className="price-title">Paid Cost</div>
                <div className="price-amount" style={{ fontSize: '1.15rem' }}>{formatVND(currentCar.purchase_price)}</div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div className="price-title">Est. Valuation</div>
                <div className="price-amount highlight" style={{ fontSize: '1.25rem' }}>{formatVND(currentCar.current_value)}</div>
                <div style={{ fontSize: '0.72rem', color: '#34d399', fontWeight: 600 }}>
                  {isPositive ? '+' : ''}{profitPct}% ({isPositive ? '+' : ''}{formatVND(profit)})
                </div>
              </div>
            </div>

            {/* Quick Action Button */}
            <button 
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '0.5rem' }}
              onClick={() => {
                sound.playSheetOpen();
                onSelectCar(currentCar);
              }}
            >
              <Eye size={15} />
              <span>Inspect Full Specifications & Lightbox</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stage Thumbnails Carousel Strip */}
      <div className="stage-carousel-strip">
        {items.map((car, idx) => (
          <button
            key={car.id}
            className={`stage-thumb-item ${currentIndex === idx ? 'active' : ''}`}
            onClick={() => {
              sound.playTap();
              setCurrentIndex(idx);
            }}
          >
            <img 
              src={(car.photos && car.photos.length > 0) ? car.photos[0] : currentPhoto} 
              alt={car.casting_name} 
            />
            <div className="stage-thumb-overlay">
              <span style={{ fontSize: '0.65rem', fontWeight: 700 }}>{car.scale}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
