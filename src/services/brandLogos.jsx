import React from 'react';

/**
 * Curated Brand Badges & SVG Logos Dictionary
 * Provides crisp brand identifiers for all Diecast and Toys & Collectibles manufacturers
 */

export const BRAND_COLORS = {
  'Minichamps': '#ffcc00',
  'Hot Wheels RLC': '#e11d48',
  'Hot Wheels Premium': '#f97316',
  'AUTOart': '#dc2626',
  'Spark': '#2563eb',
  'Mini GT': '#0284c7',
  'Inno64': '#4f46e5',
  'Kaido House': '#10b981',
  'Tarmac Works': '#84cc16',
  'Tomica Limited Vintage': '#ef4444',
  'Kyosho': '#ea580c',
  'Bburago': '#b91c1c',
  'Matchbox Collectors': '#f59e0b',
  'Lego': '#e11d48',
  'Gundam / Bandai': '#0284c7',
  'Pop Mart': '#ec4899',
  'Medicom Bearbrick': '#6366f1',
  'Hot Toys': '#f43f5e',
  'Good Smile Company': '#f97316',
  'Hasbro': '#3b82f6',
  'Other': '#64748b'
};

export const BRAND_LOGOS = {
  'Minichamps': {
    initials: 'MC',
    name: 'Minichamps',
    country: '🇩🇪 Aachen, Germany',
    accent: '#ffcc00',
    svg: (
      <svg viewBox="0 0 32 32" fill="none" className="brand-logo-svg">
        <rect width="32" height="32" rx="8" fill="#18181b" />
        <path d="M7 23V9L16 17L25 9V23" stroke="#ffcc00" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  },
  'Hot Wheels RLC': {
    initials: 'RLC',
    name: 'Hot Wheels RLC',
    country: '🇺🇸 El Segundo, USA',
    accent: '#e11d48',
    svg: (
      <svg viewBox="0 0 32 32" fill="none" className="brand-logo-svg">
        <rect width="32" height="32" rx="8" fill="#881337" />
        <path d="M6 18C10 12 14 12 18 15C22 18 24 13 26 10C24 19 18 22 13 21C9 20 7 23 6 18Z" fill="#fb7185" />
      </svg>
    )
  },
  'AUTOart': {
    initials: 'AA',
    name: 'AUTOart',
    country: '🇩🇪 Germany / 🇭🇰 HK',
    accent: '#dc2626',
    svg: (
      <svg viewBox="0 0 32 32" fill="none" className="brand-logo-svg">
        <rect width="32" height="32" rx="8" fill="#450a0a" />
        <circle cx="16" cy="16" r="9" stroke="#ef4444" strokeWidth="2" />
        <path d="M12 20L16 11L20 20" stroke="#fca5a5" strokeWidth="2" strokeLinecap="round" />
      </svg>
    )
  },
  'Spark': {
    initials: 'SPK',
    name: 'Spark Models',
    country: '🇫🇷 France',
    accent: '#3b82f6',
    svg: (
      <svg viewBox="0 0 32 32" fill="none" className="brand-logo-svg">
        <rect width="32" height="32" rx="8" fill="#172554" />
        <path d="M16 6L18.5 13.5H26L20 18L22.5 25.5L16 21L9.5 25.5L12 18L6 13.5H13.5L16 6Z" fill="#60a5fa" />
      </svg>
    )
  },
  'Mini GT': {
    initials: 'MGT',
    name: 'Mini GT',
    country: '🇭🇰 Hong Kong',
    accent: '#06b6d4',
    svg: (
      <svg viewBox="0 0 32 32" fill="none" className="brand-logo-svg">
        <rect width="32" height="32" rx="8" fill="#083344" />
        <path d="M8 20V12H13L16 17L19 12H24V20" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round" />
      </svg>
    )
  },
  'Inno64': {
    initials: 'INNO',
    name: 'Inno64',
    country: '🇲🇴 Macau',
    accent: '#818cf8',
    svg: (
      <svg viewBox="0 0 32 32" fill="none" className="brand-logo-svg">
        <rect width="32" height="32" rx="8" fill="#1e1b4b" />
        <rect x="9" y="9" width="14" height="14" rx="3" stroke="#a5b4fc" strokeWidth="2" />
        <circle cx="16" cy="16" r="3" fill="#818cf8" />
      </svg>
    )
  },
  'Kaido House': {
    initials: 'KH',
    name: 'Kaido House',
    country: '🇺🇸 / 🇯🇵 Jun Imai',
    accent: '#10b981',
    svg: (
      <svg viewBox="0 0 32 32" fill="none" className="brand-logo-svg">
        <rect width="32" height="32" rx="8" fill="#064e3b" />
        <path d="M16 7L7 15H11V24H21V15H25L16 7Z" fill="#34d399" />
      </svg>
    )
  },
  'Tarmac Works': {
    initials: 'TW',
    name: 'Tarmac Works',
    country: '🇭🇰 Hong Kong',
    accent: '#84cc16',
    svg: (
      <svg viewBox="0 0 32 32" fill="none" className="brand-logo-svg">
        <rect width="32" height="32" rx="8" fill="#14532d" />
        <path d="M8 11H24M16 11V23" stroke="#a3e635" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    )
  },
  'Tomica Limited Vintage': {
    initials: 'TLV',
    name: 'Tomica Limited Vintage',
    country: '🇯🇵 Takara Tomy Japan',
    accent: '#ef4444',
    svg: (
      <svg viewBox="0 0 32 32" fill="none" className="brand-logo-svg">
        <rect width="32" height="32" rx="8" fill="#7f1d1d" />
        <circle cx="16" cy="16" r="8" fill="#f87171" />
        <text x="16" y="20" fontSize="10" fontWeight="bold" textAnchor="middle" fill="#fff">T</text>
      </svg>
    )
  },
  // Toys & Collectibles Brands
  'Lego': {
    initials: 'LEGO',
    name: 'LEGO Technic & Sets',
    country: '🇩🇰 Billund, Denmark',
    accent: '#ef4444',
    svg: (
      <svg viewBox="0 0 32 32" fill="none" className="brand-logo-svg">
        <rect width="32" height="32" rx="8" fill="#dc2626" />
        <circle cx="11" cy="11" r="3" fill="#fef08a" />
        <circle cx="21" cy="11" r="3" fill="#fef08a" />
        <circle cx="11" cy="21" r="3" fill="#fef08a" />
        <circle cx="21" cy="21" r="3" fill="#fef08a" />
      </svg>
    )
  },
  'Gundam / Bandai': {
    initials: 'GN',
    name: 'Gundam & Bandai Spirits',
    country: '🇯🇵 Shizuoka, Japan',
    accent: '#0284c7',
    svg: (
      <svg viewBox="0 0 32 32" fill="none" className="brand-logo-svg">
        <rect width="32" height="32" rx="8" fill="#0f172a" />
        <path d="M16 6L21 16H11L16 6Z" fill="#38bdf8" />
        <path d="M8 18L16 26L24 18" stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" />
      </svg>
    )
  },
  'Pop Mart': {
    initials: 'PM',
    name: 'Pop Mart Designer Toys',
    country: '🇨🇳 Beijing, China',
    accent: '#ec4899',
    svg: (
      <svg viewBox="0 0 32 32" fill="none" className="brand-logo-svg">
        <rect width="32" height="32" rx="8" fill="#831843" />
        <circle cx="16" cy="16" r="7" fill="#f472b6" />
        <circle cx="13" cy="15" r="1.5" fill="#fff" />
        <circle cx="19" cy="15" r="1.5" fill="#fff" />
      </svg>
    )
  },
  'Medicom Bearbrick': {
    initials: 'B@',
    name: 'Medicom Toy BE@RBRICK',
    country: '🇯🇵 Tokyo, Japan',
    accent: '#6366f1',
    svg: (
      <svg viewBox="0 0 32 32" fill="none" className="brand-logo-svg">
        <rect width="32" height="32" rx="8" fill="#1e1b4b" />
        <circle cx="10" cy="10" r="3" fill="#818cf8" />
        <circle cx="22" cy="10" r="3" fill="#818cf8" />
        <circle cx="16" cy="18" r="7" fill="#a5b4fc" />
      </svg>
    )
  },
  'Hot Toys': {
    initials: 'HT',
    name: 'Hot Toys Masterpiece',
    country: '🇭🇰 Hong Kong',
    accent: '#f43f5e',
    svg: (
      <svg viewBox="0 0 32 32" fill="none" className="brand-logo-svg">
        <rect width="32" height="32" rx="8" fill="#4c0519" />
        <path d="M10 16L16 9L22 16L16 23L10 16Z" fill="#fb7185" />
      </svg>
    )
  }
};

export function getBrandLogo(brandName) {
  if (!brandName) return null;
  const match = Object.keys(BRAND_LOGOS).find(
    k => k.toLowerCase() === brandName.toLowerCase() || brandName.toLowerCase().includes(k.toLowerCase())
  );
  return match ? BRAND_LOGOS[match] : null;
}

export function BrandBadge({ brandName, size = 'sm' }) {
  const brand = getBrandLogo(brandName);
  const color = BRAND_COLORS[brandName] || '#64748b';

  return (
    <span className={`brand-badge-pill size-${size}`} style={{ borderColor: `${color}40` }}>
      {brand?.svg ? (
        <span className="brand-badge-icon">{brand.svg}</span>
      ) : (
        <span className="brand-badge-dot" style={{ background: color }} />
      )}
      <span className="brand-badge-text">{brandName}</span>
    </span>
  );
}
