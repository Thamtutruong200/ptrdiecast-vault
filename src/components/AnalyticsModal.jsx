import React from 'react';
import { X, PieChart, TrendingUp, CircleDollarSign, Award, Layers, Sparkles, ArrowUpRight } from 'lucide-react';
import { formatVND } from '../services/api';

export default function AnalyticsModal({ stats, items = [], onClose, onSelectCar }) {
  if (!stats) return null;

  const totalValue = stats.total_value || 0;
  const totalPaid = stats.total_paid || 0;
  const profit = stats.total_profit || 0;
  const isPositive = profit >= 0;
  const profitPct = stats.profit_percentage || 0;

  // Calculate brand market share
  const brandValues = {};
  items.forEach(it => {
    const brand = it.brand || 'Other';
    brandValues[brand] = (brandValues[brand] || 0) + (it.current_value || 0);
  });

  const sortedBrands = Object.entries(brandValues).sort((a, b) => b[1] - a[1]);

  // Top 3 most valuable cars in collection
  const topValuedCars = [...items].sort((a, b) => (b.current_value || 0) - (a.current_value || 0)).slice(0, 3);

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
                Vault Financial & Portfolio Intelligence
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
              <div className="price-title">Total Market Asset Value</div>
              <div className="price-amount highlight" style={{ fontSize: '1.45rem', marginTop: '0.25rem' }}>
                {formatVND(totalValue)}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.35rem' }}>
                Across {stats.total_count} authenticated models
              </div>
            </div>

            <div className="stat-card">
              <div className="price-title">Net Capital Gain</div>
              <div className="price-amount" style={{ fontSize: '1.45rem', marginTop: '0.25rem', color: isPositive ? '#34d399' : '#f87171' }}>
                {isPositive ? '+' : ''}{formatVND(profit)}
              </div>
              <div style={{ fontSize: '0.75rem', marginTop: '0.35rem' }}>
                <span className={`gain-badge ${isPositive ? 'positive' : 'negative'}`}>
                  {isPositive ? '+' : ''}{profitPct}% Total ROI
                </span>
              </div>
            </div>

            <div className="stat-card">
              <div className="price-title">Average Value / Unit</div>
              <div className="price-amount" style={{ fontSize: '1.45rem', marginTop: '0.25rem' }}>
                {formatVND(stats.total_count ? totalValue / stats.total_count : 0)}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.35rem' }}>
                Cost basis: {formatVND(stats.total_count ? totalPaid / stats.total_count : 0)}
              </div>
            </div>
          </div>

          {/* Capital Allocation by Brand */}
          <div style={{ background: 'rgba(255, 255, 255, 0.03)', borderRadius: 'var(--radius-lg)', border: 'var(--glass-border)', padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.85rem' }}>
              Valuation Allocation by Manufacturer
            </h3>

            {/* Visual Multi-Segment Bar */}
            <div style={{ height: '14px', borderRadius: 'var(--radius-pill)', overflow: 'hidden', display: 'flex', gap: '2px', marginBottom: '1rem', background: 'rgba(255, 255, 255, 0.08)' }}>
              {sortedBrands.map(([brand, val], idx) => {
                const pct = totalValue > 0 ? (val / totalValue) * 100 : 0;
                const colors = ['#0a84ff', '#ffd60a', '#30d158', '#ff453a', '#bf5af2', '#ff9f0a'];
                return (
                  <div 
                    key={brand}
                    style={{ 
                      width: `${pct}%`, 
                      background: colors[idx % colors.length],
                      borderRadius: '2px'
                    }}
                    title={`${brand}: ${formatVND(val)} (${pct.toFixed(1)}%)`}
                  />
                );
              })}
            </div>

            {/* Brand Breakdown List */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
              {sortedBrands.map(([brand, val], idx) => {
                const pct = totalValue > 0 ? ((val / totalValue) * 100).toFixed(1) : 0;
                const colors = ['#0a84ff', '#ffd60a', '#30d158', '#ff453a', '#bf5af2', '#ff9f0a'];
                return (
                  <div key={brand} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: colors[idx % colors.length] }} />
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{brand}</span>
                    </div>
                    <span style={{ color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}>
                      {formatVND(val)} <strong style={{ color: colors[idx % colors.length] }}>({pct}%)</strong>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top 3 Crown Holdings */}
          <div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
              Top 3 Flagship Holdings in Vault
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.85rem' }}>
              {topValuedCars.map((car, idx) => (
                <div 
                  key={car.id}
                  className="stat-card"
                  onClick={() => {
                    onClose();
                    onSelectCar(car);
                  }}
                  style={{ cursor: 'pointer', padding: '1rem' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--apple-amber)' }}>
                      #{idx + 1} Flagship
                    </span>
                    <span className="scale-pill-badge" style={{ position: 'static', padding: '0.1rem 0.4rem', fontSize: '0.65rem' }}>
                      {car.scale}
                    </span>
                  </div>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem', margin: '0.35rem 0' }}>
                    {car.brand} {car.casting_name}
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#34d399' }}>
                    {formatVND(car.current_value)}
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
