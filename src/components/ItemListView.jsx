import React from 'react';
import { Star, Tag, Eye, Edit3, Trash2, TrendingUp } from 'lucide-react';
import { formatVND } from '../services/api';
import { sound } from '../services/soundEffects';

export default function ItemListView({ items, onSelect, onEdit, onDelete, onToggleFavorite }) {
  if (!items || items.length === 0) return null;

  return (
    <div className="list-view-table-wrapper">
      <table className="list-view-table">
        <thead>
          <tr>
            <th style={{ width: '40px' }}></th>
            <th style={{ width: '64px' }}>Photo</th>
            <th>Model & Specification</th>
            <th>Brand</th>
            <th>Scale</th>
            <th>Condition</th>
            <th style={{ textAlign: 'right' }}>Cost Paid</th>
            <th style={{ textAlign: 'right' }}>Est. Value</th>
            <th style={{ textAlign: 'center', width: '110px' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const photo = (item.photos && item.photos.length > 0)
              ? item.photos[0]
              : 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=200&q=80';

            const profit = (item.current_value || 0) - (item.purchase_price || 0);
            const isPositive = profit >= 0;

            return (
              <tr key={item.id} onClick={() => onSelect(item)} style={{ cursor: 'pointer' }}>
                {/* Favorite Star */}
                <td onClick={(e) => e.stopPropagation()}>
                  <button
                    className={`fav-capsule ${item.is_favorite ? 'favorited' : ''}`}
                    style={{ position: 'static', width: 28, height: 28 }}
                    onClick={() => {
                      sound.playStar();
                      onToggleFavorite(item);
                    }}
                  >
                    <Star size={13} fill={item.is_favorite ? 'currentColor' : 'none'} />
                  </button>
                </td>

                {/* Thumbnail */}
                <td>
                  <div className="list-thumb-cell">
                    <img src={photo} alt={item.casting_name} />
                  </div>
                </td>

                {/* Casting & Livery */}
                <td>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.92rem' }}>
                    {item.casting_name}
                  </div>
                  {item.livery && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <span className="card-livery-dot" style={{ width: 5, height: 5 }} />
                      <span>{item.livery}</span>
                    </div>
                  )}
                </td>

                {/* Brand */}
                <td>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--apple-blue)' }}>
                    {item.brand}
                  </span>
                </td>

                {/* Scale */}
                <td>
                  <span className="scale-pill-badge" style={{ position: 'static', fontSize: '0.68rem', padding: '0.15rem 0.5rem' }}>
                    {item.scale}
                  </span>
                </td>

                {/* Condition */}
                <td>
                  <span style={{ fontSize: '0.75rem', color: 'var(--apple-amber)', fontWeight: 600 }}>
                    {item.condition}
                  </span>
                </td>

                {/* Purchase Cost */}
                <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontWeight: 600, fontSize: '0.85rem' }}>
                  {formatVND(item.purchase_price)}
                </td>

                {/* Valuation & Gain */}
                <td style={{ textAlign: 'right' }}>
                  <div style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 700, color: '#34d399', fontSize: '0.9rem' }}>
                    {formatVND(item.current_value)}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: isPositive ? 'var(--apple-green)' : 'var(--apple-red)' }}>
                    {isPositive ? '+' : ''}{formatVND(profit)}
                  </div>
                </td>

                {/* Quick Actions */}
                <td style={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                  <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                    <button 
                      className="btn btn-secondary btn-icon"
                      style={{ width: 28, height: 28 }}
                      onClick={() => onSelect(item)}
                      title="View Details"
                    >
                      <Eye size={12} />
                    </button>
                    <button 
                      className="btn btn-secondary btn-icon"
                      style={{ width: 28, height: 28 }}
                      onClick={() => onEdit(item)}
                      title="Edit Model"
                    >
                      <Edit3 size={12} />
                    </button>
                    <button 
                      className="btn btn-secondary btn-icon"
                      style={{ width: 28, height: 28, color: 'var(--apple-red)' }}
                      onClick={() => onDelete(item)}
                      title="Delete Model"
                    >
                      <Trash2 size={12} />
                    </button>
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
