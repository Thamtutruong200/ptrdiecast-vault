import React from 'react';
import { Search, X, Star, LayoutGrid, Sparkles, List, ArrowUpDown } from 'lucide-react';
import { sound } from '../services/soundEffects';

const SCALES = ['All', '1:64', '1:43', '1:24', '1:18', '1:12', 'Other'];

const BRANDS = [
  'All',
  'Minichamps',
  'Hot Wheels RLC',
  'Hot Wheels Premium',
  'Mini GT',
  'Inno64',
  'Kaido House',
  'Tarmac Works',
  'Tomica Limited Vintage',
  'AUTOart',
  'Spark',
  'Kyosho',
  'Bburago',
  'Matchbox Collectors',
  'Other'
];

const CONDITIONS = ['All', 'Mint in Box', 'Loose Mint', 'Displayed', 'Custom', 'Fair'];

export default function FilterBar({ filters, setFilters, viewMode, setViewMode, searchInputRef }) {
  const handleScaleSelect = (scale) => {
    sound.playTap();
    setFilters(prev => ({ ...prev, scale }));
  };

  const handleClearSearch = () => {
    sound.playTap();
    setFilters(prev => ({ ...prev, q: '' }));
  };

  const toggleFavoriteFilter = () => {
    sound.playStar();
    setFilters(prev => ({
      ...prev,
      is_favorite: prev.is_favorite === true ? null : true
    }));
  };

  return (
    <div className="filter-bar">
      {/* Top Search, View Mode Switcher, and Filters */}
      <div className="filter-top-row">
        {/* Apple Inset Search Box with ⌘K Badge */}
        <div className="search-box">
          <Search size={16} />
          <input
            ref={searchInputRef}
            type="text"
            className="search-input"
            placeholder="Search casting, brand, livery, color... (⌘K / /)"
            value={filters.q || ''}
            onChange={(e) => setFilters(prev => ({ ...prev, q: e.target.value }))}
          />
          {filters.q && (
            <button className="clear-search-btn" onClick={handleClearSearch}>
              <X size={12} />
            </button>
          )}
        </div>

        {/* Apple View Mode Switcher (Gallery, Showcase Studio, Table List) */}
        <div className="segmented-control" style={{ padding: '3px' }}>
          <button
            type="button"
            className={`segment-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => {
              sound.playTap();
              setViewMode('grid');
            }}
            title="Gallery Grid View (4 Cars / Row)"
          >
            <LayoutGrid size={13} style={{ marginRight: '0.3rem', verticalAlign: '-1px' }} />
            <span>Gallery</span>
          </button>

          <button
            type="button"
            className={`segment-btn ${viewMode === 'showcase' ? 'active' : ''}`}
            onClick={() => {
              sound.playTap();
              setViewMode('showcase');
            }}
            title="3D Cinematic Showcase Stage"
          >
            <Sparkles size={13} style={{ marginRight: '0.3rem', verticalAlign: '-1px' }} color="var(--apple-blue)" />
            <span>Showcase Studio</span>
          </button>

          <button
            type="button"
            className={`segment-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => {
              sound.playTap();
              setViewMode('list');
            }}
            title="Compact Table List View"
          >
            <List size={13} style={{ marginRight: '0.3rem', verticalAlign: '-1px' }} />
            <span>Table List</span>
          </button>
        </div>

        {/* Filter Dropdowns */}
        <div className="filter-selectors">
          {/* Brand Picker */}
          <select 
            className="select-control"
            value={filters.brand || 'All'}
            onChange={(e) => {
              sound.playTap();
              setFilters(prev => ({ ...prev, brand: e.target.value }));
            }}
          >
            {BRANDS.map(b => (
              <option key={b} value={b}>Brand: {b}</option>
            ))}
          </select>

          {/* Condition Picker */}
          <select 
            className="select-control"
            value={filters.condition || 'All'}
            onChange={(e) => {
              sound.playTap();
              setFilters(prev => ({ ...prev, condition: e.target.value }));
            }}
          >
            {CONDITIONS.map(c => (
              <option key={c} value={c}>Condition: {c}</option>
            ))}
          </select>

          {/* Sort Picker */}
          <select 
            className="select-control"
            value={`${filters.sort_by || 'created_at'}-${filters.sort_order || 'desc'}`}
            onChange={(e) => {
              sound.playTap();
              const [sort_by, sort_order] = e.target.value.split('-');
              setFilters(prev => ({ ...prev, sort_by, sort_order }));
            }}
          >
            <option value="created_at-desc">Sort: Newest</option>
            <option value="created_at-asc">Sort: Oldest</option>
            <option value="current_value-desc">Sort: Highest Valuation</option>
            <option value="current_value-asc">Sort: Lowest Valuation</option>
            <option value="purchase_price-desc">Sort: Purchase Cost</option>
            <option value="casting_name-asc">Sort: Name (A-Z)</option>
          </select>

          {/* Starred Filter Button */}
          <button 
            type="button"
            className={`btn btn-sm ${filters.is_favorite ? 'btn-primary' : 'btn-secondary'}`}
            onClick={toggleFavoriteFilter}
            title="Filter Starred Favorites"
          >
            <Star 
              size={13} 
              fill={filters.is_favorite ? '#fff' : 'none'} 
              color={filters.is_favorite ? '#fff' : 'var(--apple-amber)'} 
            />
            <span>Starred</span>
          </button>
        </div>
      </div>

      {/* Scale Selector Segmented Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.2rem' }}>
        <span style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>
          Scale:
        </span>
        <div className="segmented-control">
          {SCALES.map((scale) => {
            const isActive = (filters.scale || 'All') === scale;
            return (
              <button
                key={scale}
                type="button"
                className={`segment-btn ${isActive ? 'active' : ''}`}
                onClick={() => handleScaleSelect(scale)}
              >
                {scale}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
