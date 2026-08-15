import React, { useState, useRef } from 'react';
import { X, Star, Edit3, Trash2, Tag, TrendingUp, HelpCircle, ShieldCheck, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { formatVND } from '../services/api';
import { sound } from '../services/soundEffects';

export default function ItemDetailModal({ 
  item, 
  onClose, 
  onEdit, 
  onDelete, 
  onToggleFavorite, 
  onOpenValuationInfo,
  isAdmin = true,
  showPrices = true
}) {
  if (!item) return null;

  const allPhotos = [
    ...(item.photos || []),
    ...(item.reference_photos || [])
  ];

  const defaultPhoto = allPhotos.length > 0 
    ? allPhotos[0] 
    : 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1200&q=80';

  const [activePhoto, setActivePhoto] = useState(defaultPhoto);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const imageContainerRef = useRef(null);

  const profit = (item.current_value || 0) - (item.purchase_price || 0);
  const isPositive = profit >= 0;
  const profitPct = item.purchase_price > 0 ? ((profit / item.purchase_price) * 100).toFixed(1) : 0;

  const handleMouseMove = (e) => {
    if (!isZoomed || !imageContainerRef.current) return;
    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  };

  const toggleZoom = () => {
    sound.playTap();
    setIsZoomed(!isZoomed);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-lg" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <span className="scale-pill-badge" style={{ position: 'static' }}>
              {item.scale || '1:64'}
            </span>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--apple-blue)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {item.brand}
              </div>
              <h2 style={{ fontSize: '1.3rem', color: 'var(--text-primary)', fontWeight: 700 }}>
                {item.casting_name}
              </h2>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button 
              className={`fav-capsule ${item.is_favorite ? 'favorited' : ''}`}
              style={{ position: 'static' }}
              onClick={() => {
                sound.playStar();
                onToggleFavorite(item);
              }}
              title="Bookmark Favorite"
            >
              <Star size={16} fill={item.is_favorite ? 'currentColor' : 'none'} />
            </button>
            <button className="close-btn" onClick={onClose}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="modal-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.25fr) minmax(0, 1fr)', gap: '1.85rem' }}>
            {/* Left: Photos Lightbox with Macro Zoom */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div 
                ref={imageContainerRef}
                className="detail-photo-stage"
                onMouseMove={handleMouseMove}
                onClick={toggleZoom}
                style={{ 
                  cursor: isZoomed ? 'zoom-out' : 'zoom-in',
                  position: 'relative'
                }}
                title={isZoomed ? 'Click to reset zoom' : 'Click to inspect macro details (2.5x)'}
              >
                <img 
                  src={activePhoto} 
                  alt={item.casting_name} 
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'contain',
                    transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                    transform: isZoomed ? 'scale(2.5)' : 'scale(1)',
                    transition: isZoomed ? 'none' : 'transform 0.3s ease'
                  }}
                />

                {/* Macro Zoom Hint Pill */}
                <div className="macro-zoom-pill">
                  {isZoomed ? <ZoomOut size={12} /> : <ZoomIn size={12} />}
                  <span>{isZoomed ? '2.5x Macro Loupe' : 'Tap to Zoom (2.5x)'}</span>
                </div>
              </div>

              {/* Thumbnails Carousel */}
              {allPhotos.length > 1 && (
                <div style={{ display: 'flex', gap: '0.6rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
                  {allPhotos.map((photo, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        sound.playTap();
                        setActivePhoto(photo);
                        setIsZoomed(false);
                      }}
                      style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: 'var(--radius-sm)',
                        overflow: 'hidden',
                        border: activePhoto === photo ? '2px solid var(--apple-blue)' : 'var(--glass-border)',
                        background: '#121520',
                        cursor: 'pointer',
                        padding: 0,
                        flexShrink: 0
                      }}
                    >
                      <img src={photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Specifications & Intelligence */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Valuation Intelligence Card (Shown only if permitted) */}
              {showPrices && (
                <div 
                  style={{ 
                    background: 'rgba(255, 255, 255, 0.05)', 
                    border: '1px solid rgba(52, 211, 153, 0.35)', 
                    borderRadius: 'var(--radius-lg)', 
                    padding: '1.25rem',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4), var(--glass-specular)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.85rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div className="price-title">Paid Cost</div>
                      <div className="price-amount" style={{ fontSize: '1.25rem', marginTop: '0.2rem' }}>
                        {formatVND(item.purchase_price)}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div className="price-title">Est. Market Value</div>
                      <div className="price-amount highlight" style={{ fontSize: '1.35rem', marginTop: '0.2rem' }}>
                        {formatVND(item.current_value)}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px solid var(--glass-border)', fontSize: '0.8125rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Net Capital Gain:</span>
                    <span className={`gain-badge ${isPositive ? 'positive' : 'negative'}`}>
                      {isPositive ? '+' : ''}{profitPct}% ({isPositive ? '+' : ''}{formatVND(profit)})
                    </span>
                  </div>

                  <div 
                    onClick={() => {
                      sound.playTap();
                      onOpenValuationInfo();
                    }}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      background: 'rgba(52, 211, 153, 0.12)',
                      border: '1px solid rgba(52, 211, 153, 0.3)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.45rem 0.75rem',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      color: '#34d399'
                    }}
                    title="Click to learn how valuation comps are calculated"
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <ShieldCheck size={14} />
                      <strong>Valuation Source:</strong> {item.valuation_source || 'Market Comps (eBay / Auctions)'}
                    </span>
                    <HelpCircle size={14} />
                  </div>
                </div>
              )}

              {/* iOS Inset Specs Table */}
              <div style={{ background: 'rgba(255, 255, 255, 0.04)', borderRadius: 'var(--radius-lg)', border: 'var(--glass-border)', padding: '0.25rem 1.15rem', boxShadow: 'var(--glass-specular)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid var(--glass-border)', fontSize: '0.875rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Racing Livery</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.livery || 'Factory Stock'}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid var(--glass-border)', fontSize: '0.875rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Body Color</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.color || 'N/A'}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid var(--glass-border)', fontSize: '0.875rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Era / Category</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.era || 'Motorsport'}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', fontSize: '0.875rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Condition Rating</span>
                  <span style={{ fontWeight: 600, color: 'var(--apple-amber)' }}>{item.condition}</span>
                </div>
              </div>

              {/* Collector Notes */}
              {item.notes && (
                <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '0.95rem 1.15rem', borderRadius: 'var(--radius-lg)', border: 'var(--glass-border)', boxShadow: 'var(--glass-specular)' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Collector Notes & Authenticity
                  </div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>
                    {item.notes}
                  </p>
                </div>
              )}

              {/* Action Bar (Only visible to Admin) */}
              {isAdmin ? (
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: 'auto', paddingTop: '1rem' }}>
                  <button 
                    className="btn btn-secondary" 
                    style={{ flex: 1 }}
                    onClick={() => {
                      sound.playTap();
                      onClose();
                      onEdit(item);
                    }}
                  >
                    <Edit3 size={15} />
                    <span>Edit Details</span>
                  </button>

                  <button 
                    className="btn btn-secondary" 
                    style={{ color: 'var(--apple-red)' }}
                    onClick={() => {
                      if (window.confirm(`Delete ${item.casting_name} from vault?`)) {
                        onDelete(item);
                        onClose();
                      }
                    }}
                  >
                    <Trash2 size={15} />
                    <span>Delete</span>
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'auto', paddingTop: '1rem' }}>
                  <button className="btn btn-secondary" onClick={onClose}>
                    Close Spectator View
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
