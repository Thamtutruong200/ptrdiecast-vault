import React from 'react';
import { X, PieChart, Layers, Star, Award, Compass } from 'lucide-react';

export default function AnalyticsModal({ stats, items = [], onClose, onSelectCar }) {
  if (!stats) return null;

  const totalCount = stats.total_count || items.length || 0;

  // Calculate brand distribution by count
  const brandCounts = {};
  items.forEach(it => {
    const brand = it.brand || 'Other';
    brandCounts[brand] = (brandCounts[brand] || 0) + 1;
  });

  const sortedBrands = Object.entries(brandCounts).sort((a, b) => b[1] - a[1]);

  // Calculate scale distribution by count
  const scaleCounts = {};
  items.forEach(it => {
    const scale = it.scale || '1:64';
    scaleCounts[scale] = (scaleCounts[scale] || 0) + 1;
  });

  const sortedScales = Object.entries(scaleCounts).sort((a, b) => b[1] - a[1]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-lg" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div 
              style={{ 
                width: 36, 
                height: 36, 
                borderRadius: '50%', 
                background: 'linear-gradient(135deg, rgba(10, 132, 255, 0.4), rgba(191, 90, 242, 0.4))', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                border: '1px solid rgba(10, 132, 255, 0.5)',
                color: '#fff'
              }}
            >
              <PieChart size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--apple-blue)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Collection Analytics
              </div>
              <h2 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', fontWeight: 700 }}>
                Vault Distribution & Maker Overview
              </h2>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="modal-body">
          {/* Top KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            <div className="stat-card">
              <div className="price-title">Total Vault Models</div>
              <div className="price-amount" style={{ fontSize: '1.45rem', marginTop: '0.25rem', color: 'var(--apple-blue)' }}>
                {totalCount} Items
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.35rem' }}>
                Authenticated collection
              </div>
            </div>

            <div className="stat-card">
              <div className="price-title">Starred Favorites</div>
              <div className="price-amount" style={{ fontSize: '1.45rem', marginTop: '0.25rem', color: 'var(--apple-amber)' }}>
                {stats.favorites_count || 0} Models
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.35rem' }}>
                {totalCount > 0 ? `${(((stats.favorites_count || 0) / totalCount) * 100).toFixed(0)}% of collection` : '0%'}
              </div>
            </div>

            <div className="stat-card">
              <div className="price-title">Active Makers</div>
              <div className="price-amount" style={{ fontSize: '1.45rem', marginTop: '0.25rem', color: 'var(--apple-purple)' }}>
                {sortedBrands.length} Brands
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.35rem' }}>
                Across diverse scales
              </div>
            </div>
          </div>

          {/* Collection Distribution by Brand */}
          <div style={{ background: 'rgba(255, 255, 255, 0.03)', borderRadius: 'var(--radius-lg)', border: 'var(--glass-border)', padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.85rem' }}>
              Models by Manufacturer
            </h3>

            {/* Visual Multi-Segment Bar */}
            <div style={{ height: '14px', borderRadius: 'var(--radius-pill)', overflow: 'hidden', display: 'flex', gap: '2px', marginBottom: '1rem', background: 'rgba(255, 255, 255, 0.08)' }}>
              {sortedBrands.map(([brand, count], idx) => {
                const pct = totalCount > 0 ? (count / totalCount) * 100 : 0;
                const colors = ['#0a84ff', '#ffd60a', '#30d158', '#ff453a', '#bf5af2', '#ff9f0a', '#64d2ff'];
                return (
                  <div 
                    key={brand}
                    style={{ 
                      width: `${pct}%`, 
                      background: colors[idx % colors.length],
                      borderRadius: '2px'
                    }}
                    title={`${brand}: ${count} models (${pct.toFixed(1)}%)`}
                  />
                );
              })}
            </div>

            {/* Brand Breakdown List */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
              {sortedBrands.map(([brand, count], idx) => {
                const pct = totalCount > 0 ? ((count / totalCount) * 100).toFixed(1) : 0;
                const colors = ['#0a84ff', '#ffd60a', '#30d158', '#ff453a', '#bf5af2', '#ff9f0a', '#64d2ff'];
                return (
                  <div key={brand} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: colors[idx % colors.length] }} />
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{brand}</span>
                    </div>
                    <span style={{ color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}>
                      {count} models <strong style={{ color: colors[idx % colors.length] }}>({pct}%)</strong>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Scale Ratio Breakdown */}
          <div style={{ background: 'rgba(255, 255, 255, 0.03)', borderRadius: 'var(--radius-lg)', border: 'var(--glass-border)', padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.85rem' }}>
              Scale Ratio Breakdown
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
              {sortedScales.map(([scale, count]) => (
                <div key={scale} className="stat-card" style={{ padding: '0.85rem' }}>
                  <span className="scale-pill-badge" style={{ position: 'static', padding: '0.15rem 0.5rem', fontSize: '0.7rem' }}>
                    {scale}
                  </span>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.4rem' }}>
                    {count} <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 400 }}>models</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Close button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '0.5rem' }}>
            <button className="btn btn-primary" onClick={onClose}>
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
