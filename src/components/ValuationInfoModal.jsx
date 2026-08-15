import React from 'react';
import { X, TrendingUp, DollarSign, ShieldCheck, Sparkles, Scale, BookOpen, Layers, CheckCircle2, ArrowRight } from 'lucide-react';
import { formatVND } from '../services/api';

export default function ValuationInfoModal({ onClose }) {
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
                background: 'linear-gradient(135deg, rgba(52, 211, 153, 0.3), rgba(10, 132, 255, 0.3))', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                border: '1px solid rgba(52, 211, 153, 0.5)',
                color: '#34d399'
              }}
            >
              <TrendingUp size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--apple-green)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Valuation Intelligence Engine
              </div>
              <h2 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', fontWeight: 700 }}>
                How Diecast Market Value Is Estimated
              </h2>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body" style={{ gap: '1.5rem' }}>
          <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            The <strong>Estimated Market Value</strong> is calculated using a multi-factor pricing algorithm based on authentic collector transaction data, brand prestige tiering, packaging condition multipliers, and recent auction comparables.
          </p>

          {/* 4 Core Pillars Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            {/* Pillar 1: Secondary Market Comps */}
            <div className="stat-card" style={{ padding: '1.15rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                <div className="stat-icon-capsule" style={{ color: 'var(--apple-blue)' }}>
                  <TrendingUp size={16} />
                </div>
                <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>1. Live Market Comps</strong>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Aggregates verified sold listings across eBay Sold Comps, Yahoo Auctions Japan (Buyee), European Diecast Exchanges, and local Vietnam collector hubs.
              </p>
            </div>

            {/* Pillar 2: Universal Catalog Index */}
            <div className="stat-card" style={{ padding: '1.15rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                <div className="stat-icon-capsule" style={{ color: 'var(--apple-amber)' }}>
                  <BookOpen size={16} />
                </div>
                <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>2. HobbyDB / PPG Index</strong>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Cross-references official numbered edition catalogs (e.g. Minichamps 1/504, Hot Wheels RLC serialized releases) for historical baseline values.
              </p>
            </div>

            {/* Pillar 3: Condition Multiplier */}
            <div className="stat-card" style={{ padding: '1.15rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                <div className="stat-icon-capsule" style={{ color: '#34d399' }}>
                  <ShieldCheck size={16} />
                </div>
                <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>3. Condition Multiplier</strong>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Adjusts valuation according to packaging integrity (Mint in Box = 100-130%, Loose Mint = 75-85%, Displayed = 85%, Custom = 90-150%).
              </p>
            </div>

            {/* Pillar 4: Brand Prestige Factor */}
            <div className="stat-card" style={{ padding: '1.15rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                <div className="stat-icon-capsule" style={{ color: 'var(--apple-purple)' }}>
                  <Sparkles size={16} />
                </div>
                <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>4. AI Vision Appraiser</strong>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Our Gemini AI scanner inspects wheel type (Real Riders rubber vs plastic), aero detail, opening parts, and sponsor decals to suggest accurate market value.
              </p>
            </div>
          </div>

          {/* Condition Weighting Breakdown Table */}
          <div style={{ background: 'rgba(255, 255, 255, 0.03)', borderRadius: 'var(--radius-lg)', border: 'var(--glass-border)', padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.9375rem', color: 'var(--text-primary)', marginBottom: '0.75rem', fontWeight: 600 }}>
              Condition Weighting Multipliers
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8125rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.4rem' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Mint in Box (MIB) / Carded</span>
                <span className="gain-badge positive">1.0x – 1.35x Base Value</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8125rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.4rem' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Displayed / Acrylic Cased</span>
                <span className="gain-badge" style={{ background: 'rgba(10, 132, 255, 0.15)', color: 'var(--apple-blue)' }}>0.85x – 0.95x Base Value</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8125rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.4rem' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Loose Mint (No Box)</span>
                <span className="gain-badge" style={{ background: 'rgba(255, 214, 10, 0.15)', color: 'var(--apple-amber)' }}>0.70x – 0.80x Base Value</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8125rem', paddingBottom: '0.2rem' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Custom / Diorama Spec</span>
                <span className="gain-badge" style={{ background: 'rgba(191, 90, 242, 0.15)', color: 'var(--apple-purple)' }}>0.90x – 1.60x (Builder Dependent)</span>
              </div>
            </div>
          </div>

          {/* User Custom Control Notice */}
          <div style={{ background: 'rgba(10, 132, 255, 0.08)', border: '1px solid rgba(10, 132, 255, 0.3)', borderRadius: 'var(--radius-md)', padding: '0.95rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <CheckCircle2 size={20} color="var(--apple-blue)" style={{ flexShrink: 0 }} />
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              <strong>Collector Full Control:</strong> You can edit any model's valuation anytime and specify your custom source tag (e.g. <em>eBay Sold Comps</em>, <em>HobbyDB Index</em>, or <em>Personal Appraisal</em>).
            </span>
          </div>

          {/* Footer Close */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '0.5rem' }}>
            <button className="btn btn-primary" onClick={onClose}>
              Got It
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
