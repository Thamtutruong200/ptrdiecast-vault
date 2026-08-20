import React, { useState, useRef } from 'react';
import { Star, Tag, Sparkles } from 'lucide-react';
import { BrandBadge } from '../services/brandLogos';

export default function ItemCard({ item, onSelect, onToggleFavorite }) {
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0, glareX: 50, glareY: 50, opacity: 0 });

  const primaryPhoto = (item.photos && item.photos.length > 0) 
    ? item.photos[0] 
    : 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=800&q=80';

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Smooth subtle 3D tilt max 8 degrees
    const rotateX = ((y - centerY) / centerY) * -7;
    const rotateY = ((x - centerX) / centerX) * 7;
    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;

    setTilt({ x: rotateX, y: rotateY, glareX, glareY, opacity: 0.15 });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0, glareX: 50, glareY: 50, opacity: 0 });
  };

  const handleCardClick = (e) => {
    if (e.target.closest('.fav-capsule')) {
      return;
    }
    onSelect(item);
  };

  // Extract driver & year if present in direct properties or notes
  const driver = item.driver || item.notes?.match(/Driver(?:\(s\))?:\s*([^\n\r|]+)/i)?.[1]?.trim();
  const year = item.year || item.notes?.match(/Year(?:\/Season)?:\s*([^\n\r|]+)/i)?.[1]?.trim() || (item.casting_name?.match(/\b(19\d\d|20\d\d)\b/)?.[1]);

  return (
    <div 
      ref={cardRef}
      className="item-card" 
      onClick={handleCardClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateY(${tilt.opacity > 0 ? '-4px' : '0px'})`,
        transition: tilt.opacity > 0 ? 'transform 0.1s ease-out' : 'transform 0.4s ease, box-shadow 0.4s ease',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Specular Light Reflection Glare */}
      <div 
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background: `radial-gradient(circle at ${tilt.glareX}% ${tilt.glareY}%, rgba(255, 255, 255, ${tilt.opacity}) 0%, transparent 60%)`,
          zIndex: 5,
          transition: 'opacity 0.2s ease'
        }}
      />

      {/* Media Section */}
      <div className="card-media">
        <img 
          src={primaryPhoto} 
          alt={item.casting_name} 
          className="card-image"
          loading="lazy"
          decoding="async"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=800&q=80';
          }}
        />

        {/* Floating Liquid Scale Pill */}
        <span className="scale-pill-badge">
          {item.scale || '1:64'}
        </span>

        {/* Star Button */}
        <button 
          className={`fav-capsule ${item.is_favorite ? 'favorited' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(item);
          }}
          title={item.is_favorite ? 'Remove from favorites' : 'Star favorite'}
        >
          <Star size={14} fill={item.is_favorite ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Card Content */}
      <div className="card-body">
        {/* Brand Badge with Logo */}
        <div style={{ marginBottom: '0.45rem' }}>
          <BrandBadge brandName={item.brand} size="sm" />
        </div>

        <h3 className="card-title" title={item.casting_name}>
          {item.casting_name}
        </h3>

        {item.livery ? (
          <div className="card-livery-line" title={item.livery}>
            <span className="card-livery-dot" />
            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {item.livery}
            </span>
          </div>
        ) : (
          <div style={{ height: '1.25rem', marginBottom: '0.95rem' }} />
        )}

        {/* Tags */}
        <div className="card-tags">
          {driver && (
            <span className="apple-tag" style={{ color: 'var(--apple-blue)', borderColor: 'rgba(10, 132, 255, 0.35)', background: 'rgba(10, 132, 255, 0.08)' }} title={`Driver: ${driver}`}>
              🏎️ {driver}
            </span>
          )}
          {year && (
            <span className="apple-tag" style={{ color: 'var(--apple-amber)', borderColor: 'rgba(255, 159, 10, 0.35)', background: 'rgba(10, 132, 255, 0.08)' }} title={`Year / Racing Season: ${year}`}>
              📅 {year}
            </span>
          )}
          {item.condition && (
            <span className="apple-tag">
              <Tag size={11} />
              {item.condition}
            </span>
          )}
          {item.era && (
            <span className="apple-tag" style={{ color: 'var(--apple-purple)', borderColor: 'rgba(191, 90, 242, 0.25)' }}>
              {item.era}
            </span>
          )}
        </div>

        {/* Action / Showcase Footer */}
        <div className="card-footer">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            <span style={{ fontWeight: 600, color: 'var(--apple-blue)' }}>Vault Spec</span>
            <span>Inspect Details →</span>
          </div>
        </div>
      </div>
    </div>
  );
}
