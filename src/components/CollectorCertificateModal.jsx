import React, { useRef } from 'react';
import { X, ShieldCheck, Printer, Download, Share2, Award, QrCode, Sparkles } from 'lucide-react';
import { formatCurrency } from '../services/currency';
import { sound } from '../services/soundEffects';
import ptrLogo from '../assets/ptr-logo.png';

export default function CollectorCertificateModal({ item, onClose, currency = 'VND' }) {
  const printRef = useRef(null);
  if (!item) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://ptrdiecast-vault.vercel.app';
  // Generate public QR code link using high-res SVG QR API
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(currentUrl)}&color=ffffff&bgcolor=121622`;

  const handlePrint = () => {
    sound.playStar();
    window.print();
  };

  const serialHash = `PTR-${(item.id || '0000').slice(0, 8).toUpperCase()}`;
  const photoUrl = item.photos && item.photos.length > 0 ? item.photos[0] : null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        style={{ maxWidth: '680px', borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Actions */}
        <div className="modal-header" style={{ borderBottom: '1px solid rgba(212, 175, 55, 0.25)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div 
              style={{ 
                width: 34, 
                height: 34, 
                borderRadius: '50%', 
                background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.3), rgba(255, 215, 0, 0.15))',
                border: '1px solid rgba(212, 175, 55, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#d4af37'
              }}
            >
              <Award size={17} />
            </div>
            <div>
              <div style={{ fontSize: '0.68rem', color: '#d4af37', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Archival Provenance Document
              </div>
              <h2 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', fontWeight: 800 }}>
                Certificate of Authenticity
              </h2>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button 
              type="button" 
              className="btn btn-secondary btn-sm"
              onClick={handlePrint}
              style={{ color: '#d4af37', borderColor: 'rgba(212, 175, 55, 0.4)' }}
            >
              <Printer size={13} />
              <span>Print / PDF</span>
            </button>
            <button className="close-btn" onClick={onClose}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Certificate Printable Canvas */}
        <div className="modal-body" style={{ padding: '1.5rem', background: '#0a0d14' }}>
          <div 
            ref={printRef}
            className="certificate-card"
            style={{
              background: 'linear-gradient(145deg, #111522 0%, #0c0f18 100%)',
              border: '2px solid rgba(212, 175, 55, 0.45)',
              borderRadius: '16px',
              padding: '2rem',
              position: 'relative',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), inset 0 0 40px rgba(212, 175, 55, 0.05)',
            }}
          >
            {/* Watermark Crest */}
            <div 
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                opacity: 0.04,
                pointerEvents: 'none',
                width: '320px',
                height: '320px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <img src={ptrLogo} alt="Watermark" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>

            {/* Certificate Top Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(212, 175, 55, 0.25)', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <img src={ptrLogo} alt="PTR Logo" style={{ width: 44, height: 44, borderRadius: 8 }} />
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 900, letterSpacing: '0.12em', color: '#f5f5f7', textTransform: 'uppercase' }}>
                    PTR MOTORSPORT
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#d4af37', fontWeight: 700, letterSpacing: '0.06em' }}>
                    VAULT COLLECTOR ARCHIVES · SERIALIZED SPEC
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  CERTIFICATE IDENTIFIER
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#d4af37', fontFamily: 'monospace', letterSpacing: '0.08em' }}>
                  {serialHash}
                </div>
              </div>
            </div>

            {/* Model Presentation Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: photoUrl ? '160px 1fr' : '1fr', gap: '1.5rem', alignItems: 'center', marginBottom: '1.5rem' }}>
              {photoUrl && (
                <div style={{ width: '160px', height: '120px', borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.15)', background: '#000' }}>
                  <img src={photoUrl} alt={item.casting_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                  <span style={{ background: 'rgba(212, 175, 55, 0.15)', border: '1px solid rgba(212, 175, 55, 0.4)', padding: '0.15rem 0.5rem', borderRadius: '4px', color: '#d4af37', fontSize: '0.7rem', fontWeight: 800 }}>
                    {item.scale || '1:64'}
                  </span>
                  <span style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem', fontWeight: 700 }}>
                    {item.brand}
                  </span>
                </div>

                <h1 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em', lineHeight: 1.2, margin: '0 0 0.4rem 0' }}>
                  {item.casting_name}
                </h1>

                {item.livery && (
                  <div style={{ fontSize: '0.8rem', color: '#34d399', fontWeight: 600 }}>
                    🏁 {item.livery}
                  </div>
                )}
              </div>
            </div>

            {/* Specifications Matrix Table */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '10px', padding: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 700 }}>Colorway</div>
                <div style={{ fontSize: '0.8rem', color: '#f5f5f7', fontWeight: 700, marginTop: '0.15rem' }}>{item.color || 'Factory Standard'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 700 }}>Condition Rating</div>
                <div style={{ fontSize: '0.8rem', color: '#34d399', fontWeight: 700, marginTop: '0.15rem' }}>{item.condition || 'Mint in Box'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 700 }}>Era / Series</div>
                <div style={{ fontSize: '0.8rem', color: '#f5f5f7', fontWeight: 700, marginTop: '0.15rem' }}>{item.era || 'Modern Supercar'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 700 }}>Purchase Index</div>
                <div style={{ fontSize: '0.85rem', color: '#f5f5f7', fontWeight: 800, marginTop: '0.15rem', fontFamily: 'monospace' }}>
                  {formatCurrency(item.purchase_price, currency)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 700 }}>Market Appraisal</div>
                <div style={{ fontSize: '0.85rem', color: '#34d399', fontWeight: 800, marginTop: '0.15rem', fontFamily: 'monospace' }}>
                  {formatCurrency(item.current_value, currency)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 700 }}>Valuation Methodology</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600, marginTop: '0.15rem' }}>{item.valuation_source || 'Verified Comps'}</div>
              </div>
            </div>

            {item.notes && (
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5, borderLeft: '2px solid #d4af37', paddingLeft: '0.75rem', marginBottom: '1.5rem', fontStyle: 'italic' }}>
                "{item.notes}"
              </div>
            )}

            {/* Footer QR Verification */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(212, 175, 55, 0.25)', paddingTop: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#d4af37', fontSize: '0.72rem', fontWeight: 700 }}>
                <ShieldCheck size={16} />
                <span>OFFICIALLY REGISTERED IN PTR MOTORSPORT VAULT DATABASE</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Scan to Verify</div>
                  <div style={{ fontSize: '0.7rem', color: '#f5f5f7', fontWeight: 700 }}>Live Telemetry</div>
                </div>
                <img src={qrUrl} alt="QR Code" style={{ width: 44, height: 44, borderRadius: 4, background: '#fff', padding: 2 }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
