import React from 'react';
import { Star, Eye, Edit3, Trash2 } from 'lucide-react';
import { formatCurrency } from '../services/currency';
import { sound } from '../services/soundEffects';
import { BrandBadge } from '../services/brandLogos';

export default function ItemListView({ items, onSelect, onEdit, onDelete, onToggleFavorite, isAdmin = true, showPrices = true, currency = 'VND' }) {
  if (!items || items.length === 0) return null;

  return (
    <div className="list-view-table-wrapper">
      <table className="list-view-table">
        <thead>
          <tr>
            <th style={{ width: '44px', textAlign: 'center' }}>Fav</th>
            <th style={{ width: '56px', textAlign: 'center' }}>Photo</th>
            <th style={{ minWidth: '220px' }}>Model & Casting Name</th>
            <th style={{ width: '160px' }}>Brand / Maker</th>
            <th style={{ width: '90px', textAlign: 'center' }}>Scale / Type</th>
            <th style={{ minWidth: '160px' }}>Livery / Edition</th>
            <th style={{ width: '130px' }}>Condition</th>
            {showPrices && (
              <>
                <th style={{ width: '130px', textAlign: 'right' }}>Cost Paid</th>
                <th style={{ width: '130px', textAlign: 'right' }}>Value</th>
              </>
            )}
            <th style={{ width: isAdmin ? '100px' : '60px', textAlign: 'center' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => {
            const photo = (item.photos && item.photos.length > 0)
              ? item.photos[0]
              : 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=120&q=80';

            const effectiveValue = (item.current_value && item.current_value > 0) ? item.current_value : (item.purchase_price || 0);
            const profit = effectiveValue - (item.purchase_price || 0);
            const isPositive = profit >= 0;

            return (
              <tr key={item.id || idx} onClick={() => onSelect(item)} className="list-view-row">
                {/* Favorite Star */}
                <td style={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                  <button
                    className={`fav-capsule ${item.is_favorite ? 'favorited' : ''}`}
                    style={{ position: 'static', width: 26, height: 26, margin: '0 auto' }}
                    onClick={() => {
                      sound.playStar();
                      onToggleFavorite(item);
                    }}
                    title={item.is_favorite ? 'Favorited' : 'Add to Favorites'}
                  >
                    <Star size={13} fill={item.is_favorite ? 'currentColor' : 'none'} />
                  </button>
                </td>

                {/* Thumbnail */}
                <td style={{ textAlign: 'center' }}>
                  <div style={{ width: '40px', height: '28px', borderRadius: '4px', overflow: 'hidden', margin: '0 auto', background: '#000' }}>
                    <img src={photo} alt={item.casting_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                </td>

                {/* Model Title */}
                <td>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                    {item.casting_name}
                  </div>
                </td>

                {/* Brand */}
                <td>
                  <BrandBadge brandName={item.brand} size="sm" />
                </td>

                {/* Scale / Type */}
                <td style={{ textAlign: 'center' }}>
                  <span className="scale-pill-badge" style={{ position: 'static', fontSize: '0.68rem', padding: '0.15rem 0.45rem' }}>
                    {item.scale || '1:64'}
                  </span>
                </td>

                {/* Livery / Color */}
                <td>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                    {item.livery || item.color || '—'}
                  </div>
                </td>

                {/* Condition */}
                <td>
                  <span style={{ fontSize: '0.78rem', color: 'var(--apple-amber)', fontWeight: 600 }}>
                    {item.condition}
                  </span>
                </td>

                {/* Optional Prices */}
                {showPrices && (
                  <>
                    <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {formatCurrency(item.purchase_price, currency)}
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 700, color: '#34d399', fontSize: '0.875rem' }}>
                        {formatCurrency(effectiveValue, currency)}
                      </div>
                      <div style={{ fontSize: '0.68rem', color: isPositive ? '#34d399' : '#f87171' }}>
                        {isPositive ? '+' : ''}{formatCurrency(profit, currency)}
                      </div>
                    </td>
                  </>
                )}

                {/* Quick Actions */}
                <td style={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                  <div style={{ display: 'inline-flex', gap: '0.25rem' }}>
                    <button 
                      className="btn btn-secondary btn-icon"
                      style={{ width: 26, height: 26 }}
                      onClick={() => onSelect(item)}
                      title="Inspect Model Details"
                    >
                      <Eye size={12} />
                    </button>
                    {isAdmin && (
                      <>
                        <button 
                          className="btn btn-secondary btn-icon"
                          style={{ width: 26, height: 26 }}
                          onClick={() => onEdit(item)}
                          title="Edit"
                        >
                          <Edit3 size={11} />
                        </button>
                        <button 
                          className="btn btn-secondary btn-icon"
                          style={{ width: 26, height: 26, color: 'var(--apple-red)' }}
                          onClick={() => onDelete(item)}
                          title="Delete"
                        >
                          <Trash2 size={11} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
