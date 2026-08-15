import React from 'react';
import { Star, Tag, TrendingUp, Sparkles } from 'lucide-react';
import { formatVND } from '../services/api';

export default function ItemCard({ item, onSelect, onToggleFavorite, showPrices = true }) {
  const primaryPhoto = (item.photos && item.photos.length > 0) 
    ? item.photos[0] 
    : 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=800&q=80';

  const handleCardClick = (e) => {
    if (e.target.closest('.fav-capsule')) {
      return;
    }
    onSelect(item);
  };

  const getValuationSourceShort = (source) => {
    if (!source) return 'Market Comps';
    if (source.includes('eBay') || source.includes('Auctions')) return 'Auction Comps';
    if (source.includes('HobbyDB')) return 'HobbyDB Index';
    if (source.includes('AI')) return 'AI Estimate';
    if (source.includes('Appraisal')) return 'Appraised';
    return source.length > 16 ? source.slice(0, 16) + '...' : source;
  };

  return (
    <div className="item-card" onClick={handleCardClick}>
      {/* Media Section */}
      <div className="card-media">
        <img 
          src={primaryPhoto} 
          alt={item.casting_name} 
          className="card-image"
          loading="lazy"
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
        <div className="card-brand-label">{item.brand}</div>
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
          {showPrices && (
            <span className="apple-tag" style={{ color: 'var(--apple-green)', borderColor: 'rgba(52, 211, 153, 0.25)' }} title={`Valuation Source: ${item.valuation_source || 'Market Comps'}`}>
              <TrendingUp size={10} />
              {getValuationSourceShort(item.valuation_source)}
            </span>
          )}
        </div>

        {/* Financial Footer (or Showcase Footer in Spectator Mode) */}
        <div className="card-footer">
          {showPrices ? (
            <>
              <div className="price-unit">
                <span className="price-title">Paid</span>
                <span className="price-amount">{formatVND(item.purchase_price)}</span>
              </div>

              <div className="price-unit" style={{ textAlign: 'right' }}>
                <span className="price-title">Est. Value</span>
                <span className="price-amount highlight">{formatVND(item.current_value)}</span>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              <span style={{ fontWeight: 600, color: 'var(--apple-blue)' }}>Showcase Spec</span>
              <span>Tap to Inspect →</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
