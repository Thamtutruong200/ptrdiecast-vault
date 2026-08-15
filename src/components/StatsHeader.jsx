import React, { useState, useEffect } from 'react';
import { Layers, CircleDollarSign, TrendingUp, Star, HelpCircle, Dices, Sparkles, Eye, ArrowRight } from 'lucide-react';
import { formatVND } from '../services/api';

export default function StatsHeader({ stats, items = [], onSelectCar, onOpenValuationInfo }) {
  const [highlightCar, setHighlightCar] = useState(null);
  const [isShuffling, setIsShuffling] = useState(false);

  // Pick a random car on initial load or when items change
  useEffect(() => {
    if (items && items.length > 0) {
      // Pick random item
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
      // Try to pick a different one if more than 1 item
      if (items.length > 1 && items[nextIndex]?.id === highlightCar?.id) {
        nextIndex = (nextIndex + 1) % items.length;
      }
      setHighlightCar(items[nextIndex]);
      setIsShuffling(false);
    }, 200);
  };

  if (!stats) return null;

  const profit = stats.total_profit || 0;
  const isPositive = profit >= 0;
  const profitPct = stats.profit_percentage || 0;

  const highlightPhoto = highlightCar?.photos && highlightCar.photos.length > 0
    ? highlightCar.photos[0]
    : 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=300&q=80';

  return (
    <section className="stats-header">
      <div className="stats-grid">
        {/* Card 1: Total Vault */}
        <div className="stat-card">
          <div className="stat-top">
            <span className="stat-label">Total Vault</span>
            <div className="stat-icon-capsule">
              <Layers size={15} />
            </div>
          </div>
          <div className="stat-number">{stats.total_count || 0}</div>
          <div className="stat-sub">
            <Star size={13} color="var(--apple-amber)" fill="var(--apple-amber)" />
            <span>{stats.favorites_count || 0} starred models</span>
          </div>
        </div>

        {/* Card 2: Invested Capital */}
        <div className="stat-card">
          <div className="stat-top">
            <span className="stat-label">Invested Cost</span>
            <div className="stat-icon-capsule">
              <CircleDollarSign size={15} />
            </div>
          </div>
          <div className="stat-number">{formatVND(stats.total_paid)}</div>
          <div className="stat-sub">
            <span>Avg {formatVND(stats.total_count ? stats.total_paid / stats.total_count : 0)} / model</span>
          </div>
        </div>

        {/* Card 3: Market Valuation & Intelligence Trigger */}
        <div className="stat-card" style={{ border: '1px solid rgba(52, 211, 153, 0.35)' }}>
          <div className="stat-top">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span className="stat-label">Est. Valuation</span>
              <button 
                type="button"
                onClick={onOpenValuationInfo}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: 'var(--apple-green)', 
                  cursor: 'pointer', 
                  display: 'flex', 
                  alignItems: 'center',
                  padding: 0
                }}
                title="Learn how market value is calculated"
              >
                <HelpCircle size={13} />
              </button>
            </div>
            <div className="stat-icon-capsule" style={{ background: 'rgba(48, 209, 88, 0.15)', color: '#34d399' }}>
              <TrendingUp size={15} />
            </div>
          </div>
          <div className="stat-number" style={{ color: '#34d399' }}>{formatVND(stats.total_value)}</div>
          <div className="stat-sub">
            <span className={`gain-badge ${isPositive ? 'positive' : 'negative'}`}>
              {isPositive ? '+' : ''}{profitPct}%
            </span>
            <span>{isPositive ? '+' : ''}{formatVND(profit)} gain</span>
          </div>
        </div>

        {/* Card 4: Highlight Random Car from Collection */}
        <div 
          className="stat-card" 
          onClick={() => highlightCar && onSelectCar && onSelectCar(highlightCar)}
          style={{ 
            cursor: highlightCar ? 'pointer' : 'default',
            border: '1px solid rgba(10, 132, 255, 0.3)',
            background: 'linear-gradient(145deg, rgba(22, 24, 30, 0.65), rgba(10, 132, 255, 0.1))'
          }}
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
              <div 
                style={{ 
                  width: '52px', 
                  height: '52px', 
                  borderRadius: 'var(--radius-sm)', 
                  overflow: 'hidden', 
                  background: '#090b10', 
                  border: 'var(--glass-border)',
                  flexShrink: 0,
                  boxShadow: 'var(--glass-specular)'
                }}
              >
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
                  <span style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem', borderRadius: 'var(--radius-pill)', background: 'rgba(255, 255, 255, 0.1)', color: 'var(--text-secondary)' }}>
                    {highlightCar.scale}
                  </span>
                </div>
                <div 
                  style={{ 
                    fontSize: '0.95rem', 
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
                <div style={{ fontSize: '0.78rem', color: '#34d399', fontWeight: 600, marginTop: '0.15rem' }}>
                  {formatVND(highlightCar.current_value)}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem', padding: '0.5rem 0' }}>
              Add cars to see vault highlights
            </div>
          )}

          <div className="stat-sub" style={{ marginTop: '0.65rem', justifyContent: 'space-between' }}>
            <span>{items.length > 0 ? 'Click card to view details' : 'No items yet'}</span>
            {highlightCar && <ArrowRight size={12} color="var(--apple-blue)" />}
          </div>
        </div>
      </div>
    </section>
  );
}
