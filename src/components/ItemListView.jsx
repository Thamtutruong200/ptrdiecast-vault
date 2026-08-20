import React from 'react';
import { Star, Eye, Edit3, Trash2 } from 'lucide-react';
import { sound } from '../services/soundEffects';
import { BrandBadge } from '../services/brandLogos';

export default function ItemListView({ items, onSelect, onEdit, onDelete, onToggleFavorite, isAdmin = true }) {
  if (!items || items.length === 0) return null;

  return (
    <div className="list-view-table-wrapper">
      <table className="list-view-table">
        <thead>
          <tr>
            <th style={{ width: '44px', textAlign: 'center' }}>Fav</th>
            <th style={{ width: '56px', textAlign: 'center' }}>Photo</th>
            <th style={{ minWidth: '200px' }}>Model & Casting Name</th>
            <th style={{ width: '150px' }}>Brand / Maker</th>
            <th style={{ width: '85px', textAlign: 'center' }}>Scale</th>
            <th style={{ width: '140px' }}>Driver / Pilot</th>
            <th style={{ width: '90px', textAlign: 'center' }}>Year</th>
            <th style={{ minWidth: '140px' }}>Livery / Edition</th>
            <th style={{ width: '120px' }}>Condition</th>
            <th style={{ width: isAdmin ? '100px' : '60px', textAlign: 'center' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => {
            const photo = (item.photos && item.photos.length > 0)
              ? item.photos[0]
              : 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=120&q=80';

            const driver = item.driver || item.notes?.match(/Driver(?:\(s\))?:\s*([^\n\r|]+)/i)?.[1]?.trim() || '—';
            const year = item.year || item.notes?.match(/Year(?:\/Season)?:\s*([^\n\r|]+)/i)?.[1]?.trim() || (item.casting_name?.match(/\b(19\d\d|20\d\d)\b/)?.[1]) || '—';

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

                {/* Photo Thumbnail */}
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

                {/* Driver */}
                <td>
                  <span style={{ fontSize: '0.8125rem', color: driver !== '—' ? 'var(--apple-blue)' : 'var(--text-tertiary)', fontWeight: driver !== '—' ? 600 : 400 }}>
                    {driver}
                  </span>
                </td>

                {/* Year */}
                <td style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: '0.8125rem', color: year !== '—' ? 'var(--apple-amber)' : 'var(--text-tertiary)', fontWeight: year !== '—' ? 600 : 400 }}>
                    {year}
                  </span>
                </td>

                {/* Livery / Edition */}
                <td>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                    {item.livery || '—'}
                  </div>
                </td>

                {/* Condition */}
                <td>
                  <span style={{ fontSize: '0.78rem', color: 'var(--apple-amber)', fontWeight: 600 }}>
                    {item.condition}
                  </span>
                </td>

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
