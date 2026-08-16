import React, { useState, useEffect } from 'react';
import { Layers, Star, Dices, Sparkles, PieChart, ArrowRight } from 'lucide-react';
import { formatVND } from '../services/api';

export default function StatsHeader({ stats, items = [], onSelectCar }) {
  const [highlightCar, setHighlightCar] = useState(null);
  const [isShuffling, setIsShuffling] = useState(false);

  // Pick a random car on initial load or when items change
  useEffect(() => {
    if (items && items.length > 0) {
      const randomIndex = Math.floor(Math.random() * items.length);
      setHighlightCar(items[randomIndex]);
    } else {
      setHighlightCar(null);
    }
  }, [items]);

  // Handle manual roll / shuffle
  const handleShuffle = (e) => {
    e.stopPropagation();
    if (!items || items.length === 0) return;
    setIsShuffling(true);
    setTimeout(() => {
      let nextIndex = Math.floor(Math.random() * items.length);
      if (items.length > 1 && items[nextIndex]?.id === highlightCar?.id) {
        nextIndex = (nextIndex + 1) % items.length;
      }
      setHighlightCar(items[nextIndex]);
      setIsShuffling(false);
    }, 200);
  };

  if (!stats) return null;

  const highlightPhoto = highlightCar?.photos && highlightCar.photos.length > 0
    ? highlightCar.photos[0]
    : 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=300&q=80';

  const brandCount = Object.keys(stats.brand_breakdown || {}).length;

  return (
    <section className="stats-header">
      <div className="stats-grid">
        {/* Card 1: Total Vault Count */}
        <div className="stat-card">
          <div className="stat-top">
            <span className="stat-label">Vault Collection</span>
            <div className="stat-icon-capsule">
              <Layers size={15} />
            </div>
          </div>
          <div className="stat-number">{stats.total_count || 0} Models</div>
          <div className="stat-sub">
            <Star size={13} color="var(--apple-amber)" fill="var(--apple-amber)" />
            <span>{stats.favorites_count || 0} starred favorites</span>
          </div>
        </div>

        {/* Card 2: Vault Diversity & Scales */}
        <div className="stat-card">
          <div className="stat-top">
            <span className="stat-label">Portfolio Diversity</span>
            <div className="stat-icon-capsule" style={{ color: 'var(--apple-purple)' }}>
              <PieChart size={15} />
            </div>
          </div>
          <div className="stat-number">{brandCount} Brands</div>
          <div className="stat-sub">
            <span style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
              {Object.entries(stats.scale_breakdown || {}).slice(0, 3).map(([scale, count]) => (
                <span key={scale} style={{ fontSize: '0.72rem', padding: '0.15rem 0.45rem', borderRadius: '4px', background: 'rgba(255, 255, 255, 0.08)' }}>
                  {scale}: {count}
                </span>
              ))}
            </span>
          </div>
        </div>

        {/* Card 3: Highlight Random Car from Collection */}
        <div 
          className="stat-card stat-card-spotlight" 
          onClick={() => highlightCar && onSelectCar && onSelectCar(highlightCar)}
          title={highlightCar ? `Click to view ${highlightCar.casting_name}` : 'Vault Spotlight'}
        >
          <div className="stat-top">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <Sparkles size={14} color="var(--apple-blue)" />
              <span className="stat-label" style={{ color: 'var(--apple-blue)', fontWeight: 700 }}>
                Vault Spotlight
              </span>
            </div>
            
            {items.length > 1 && (
              <button
                type="button"
                className="btn btn-secondary btn-icon"
                onClick={handleShuffle}
                style={{ width: '28px', height: '28px', borderRadius: '50%' }}
                title="Shuffle / Roll another random model"
              >
                <Dices size={14} style={{ transform: isShuffling ? 'rotate(180deg)' : 'none', transition: 'transform 0.25s ease' }} />
              </button>
            )}
          </div>

          {highlightCar ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.2rem' }}>
              {/* Mini Thumbnail */}
              <div className="spotlight-thumb">
                <img 
                  src={highlightPhoto} 
                  alt={highlightCar.casting_name} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              {/* Model Info */}
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--apple-blue)', textTransform: 'uppercase' }}>
                    {highlightCar.brand}
                  </span>
                  <span className="scale-pill-badge" style={{ position: 'static', padding: '0.1rem 0.4rem', fontSize: '0.65rem' }}>
                    {highlightCar.scale}
                  </span>
                </div>
                <div 
                  style={{ 
                    fontSize: '0.92rem', 
                    fontWeight: 700, 
                    color: 'var(--text-primary)', 
                    whiteSpace: 'nowrap', 
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis',
                    lineHeight: 1.25,
                    marginTop: '0.15rem'
                  }}
                >
                  {highlightCar.casting_name}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem', padding: '0.5rem 0' }}>
              Add cars to see vault highlights
            </div>
          )}

          <div className="stat-sub" style={{ marginTop: '0.65rem', justifyContent: 'space-between' }}>
            <span>{items.length > 0 ? 'Click to inspect model' : 'No items yet'}</span>
            {highlightCar && <ArrowRight size={12} color="var(--apple-blue)" />}
          </div>
        </div>
      </div>
    </section>
  );
}
