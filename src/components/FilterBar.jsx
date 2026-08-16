import React from 'react';
import { Search, LayoutGrid, Sparkles, Table, Star } from 'lucide-react';
import { sound } from '../services/soundEffects';

const DIECAST_SCALES = ['All', '1:64', '1:43', '1:24', '1:18', '1:12', 'Other'];
const TOY_SCALES = ['All', '1:8', '1:60', '400%', '1000%', 'Statue', 'Figure', 'Other'];

const DIECAST_BRANDS = [
  'All', 'Minichamps', 'Hot Wheels RLC', 'Hot Wheels Premium', 'AUTOart', 
  'Spark', 'Mini GT', 'Inno64', 'Kaido House', 'Tarmac Works', 'Tomica Limited Vintage', 'Other'
];

const TOY_BRANDS = [
  'All', 'Lego', 'Gundam / Bandai', 'Pop Mart', 'Medicom Bearbrick', 'Hot Toys', 'Good Smile Company', 'Hasbro', 'Other'
];

export default function FilterBar({ 
  filters, 
  setFilters, 
  viewMode, 
  setViewMode, 
  searchInputRef,
  activeCategory = 'diecast'
}) {
  const scales = activeCategory === 'diecast' ? DIECAST_SCALES : TOY_SCALES;
  const brands = activeCategory === 'diecast' ? DIECAST_BRANDS : TOY_BRANDS;

  const handleSearchChange = (e) => {
    setFilters(prev => ({ ...prev, q: e.target.value }));
  };

  const handleScaleSelect = (scale) => {
    sound.playTap();
    setFilters(prev => ({ ...prev, scale }));
  };

  const handleBrandChange = (e) => {
    sound.playTap();
    setFilters(prev => ({ ...prev, brand: e.target.value }));
  };

  const handleConditionChange = (e) => {
    sound.playTap();
    setFilters(prev => ({ ...prev, condition: e.target.value }));
  };

  const handleSortChange = (e) => {
    sound.playTap();
    setFilters(prev => ({ ...prev, sort_by: e.target.value }));
  };

  const handleFavoriteToggle = () => {
    sound.playStar();
    setFilters(prev => ({
      ...prev,
      is_favorite: prev.is_favorite === true ? null : true
    }));
  };

  return (
    <div className="filter-bar">
      {/* Top Search and View Switcher Row */}
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '1rem' }}>
        <div className="search-input-wrapper">
          <Search size={16} className="search-icon" />
          <input 
            ref={searchInputRef}
            type="text"
            className="search-input"
            placeholder={activeCategory === 'diecast' ? "Search casting, brand, livery, color... (⌘K or /)" : "Search collectible, series, brand, edition... (⌘K or /)"}
            value={filters.q || ''}
            onChange={handleSearchChange}
          />
        </div>

        {/* View Mode Segmented Switcher */}
        <div className="category-switcher-capsule" style={{ padding: '2px' }}>
          <button 
            type="button"
            className={`category-tab-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => {
              sound.playTap();
              setViewMode('grid');
            }}
            title="Gallery Grid View (1)"
          >
            <LayoutGrid size={13} />
            <span style={{ fontSize: '0.75rem' }}>Gallery</span>
          </button>

          <button 
            type="button"
            className={`category-tab-btn ${viewMode === 'showcase' ? 'active' : ''}`}
            onClick={() => {
              sound.playTap();
              setViewMode('showcase');
            }}
            title="3D Cinematic Showcase Studio (2)"
          >
            <Sparkles size={13} />
            <span style={{ fontSize: '0.75rem' }}>Showcase</span>
          </button>

          <button 
            type="button"
            className={`category-tab-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => {
              sound.playTap();
              setViewMode('list');
            }}
            title="Compact Table List View (3)"
          >
            <Table size={13} />
            <span style={{ fontSize: '0.75rem' }}>Table</span>
          </button>
        </div>
      </div>

      {/* Dropdowns Row */}
      <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '0.85rem' }}>
        <select 
          className="search-input" 
          style={{ width: 'auto', padding: '0.45rem 1rem' }}
          value={filters.brand || 'All'}
          onChange={handleBrandChange}
        >
          {brands.map(b => (
            <option key={b} value={b}>Brand: {b}</option>
          ))}
        </select>

        <select 
          className="search-input" 
          style={{ width: 'auto', padding: '0.45rem 1rem' }}
          value={filters.condition || 'All'}
          onChange={handleConditionChange}
        >
          <option value="All">Condition: All</option>
          <option value="Mint in Box">Mint in Box</option>
          <option value="Mint in Sealed Box">Mint in Sealed Box</option>
          <option value="Loose Mint">Loose Mint</option>
          <option value="Displayed">Displayed</option>
          <option value="Custom">Custom</option>
        </select>

        <select 
          className="search-input" 
          style={{ width: 'auto', padding: '0.45rem 1rem' }}
          value={filters.sort_by || 'created_at'}
          onChange={handleSortChange}
        >
          <option value="created_at">Sort: Newest Added</option>
          <option value="current_value">Sort: Est. Value (High to Low)</option>
          <option value="purchase_price">Sort: Purchase Cost</option>
          <option value="casting_name">Sort: Model Name (A-Z)</option>
        </select>

        {/* Favorite Bookmark Filter */}
        <button
          type="button"
          className={`btn btn-secondary btn-sm ${filters.is_favorite ? 'btn-primary' : ''}`}
          onClick={handleFavoriteToggle}
          style={{ height: '36px' }}
        >
          <Star size={13} fill={filters.is_favorite ? '#ffd60a' : 'none'} color={filters.is_favorite ? '#ffd60a' : 'currentColor'} />
          <span>Starred</span>
        </button>
      </div>

      {/* Scale / Format Pills */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {activeCategory === 'diecast' ? 'Scale:' : 'Format:'}
        </span>
        <div className="scale-segmented-control">
          {scales.map(s => (
            <button
              key={s}
              type="button"
              className={`scale-pill-btn ${(filters.scale || 'All') === s ? 'active' : ''}`}
              onClick={() => handleScaleSelect(s)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
