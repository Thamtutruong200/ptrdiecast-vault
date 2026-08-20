import React from 'react';
import { 
  Layers, Star, Sparkles, PieChart, Shield, Eye, 
  Plus, Home, Smartphone, Compass, Box
} from 'lucide-react';
import { sound } from '../services/soundEffects';

export default function MobileBottomNav({
  activeCategory,
  setActiveCategory,
  filters,
  setFilters,
  onOpenShowroom,
  onOpenAnalytics,
  onOpenAdminConsole,
  onOpenAdminLogin,
  onOpenAdd,
  isAdmin
}) {
  const isFavoritesOnly = filters.is_favorite === true;

  const toggleFavorites = () => {
    sound.playStar();
    setFilters(prev => ({
      ...prev,
      is_favorite: prev.is_favorite ? null : true
    }));
  };

  const handleSwitchCategory = (cat) => {
    sound.playTap();
    setActiveCategory(cat);
    setFilters(prev => ({ ...prev, scale: 'All', brand: 'All', is_favorite: null }));
  };

  return (
    <nav className="mobile-bottom-nav">
      <div className="mobile-nav-inner">
        {/* Tab 1: Vault Models */}
        <button
          type="button"
          className={`mobile-nav-item ${!isFavoritesOnly && activeCategory === 'diecast' ? 'active' : ''}`}
          onClick={() => handleSwitchCategory('diecast')}
        >
          <Layers size={19} strokeWidth={2.2} />
          <span className="mobile-nav-label">Diecast</span>
        </button>

        {/* Tab 2: Toys / Collectibles */}
        <button
          type="button"
          className={`mobile-nav-item ${!isFavoritesOnly && activeCategory === 'toys' ? 'active' : ''}`}
          onClick={() => handleSwitchCategory('toys')}
        >
          <Box size={19} strokeWidth={2.2} />
          <span className="mobile-nav-label">Toys</span>
        </button>

        {/* Center: Admin Add FAB or Showroom */}
        {isAdmin ? (
          <button
            type="button"
            className="mobile-nav-fab"
            onClick={() => {
              sound.playSheetOpen();
              onOpenAdd();
            }}
            title="Add New Model"
          >
            <Plus size={22} strokeWidth={2.5} />
          </button>
        ) : (
          <button
            type="button"
            className="mobile-nav-fab-spectator"
            onClick={() => {
              sound.playSheetOpen();
              onOpenShowroom();
            }}
            title="Open Museum Showroom"
          >
            <Sparkles size={18} color="#d4af37" />
          </button>
        )}

        {/* Tab 4: Starred Favorites */}
        <button
          type="button"
          className={`mobile-nav-item ${isFavoritesOnly ? 'active' : ''}`}
          onClick={toggleFavorites}
        >
          <Star 
            size={19} 
            color={isFavoritesOnly ? 'var(--apple-amber)' : 'currentColor'} 
            fill={isFavoritesOnly ? 'var(--apple-amber)' : 'none'} 
          />
          <span className="mobile-nav-label">Favorites</span>
        </button>

        {/* Tab 5: Admin / Spectator Console */}
        <button
          type="button"
          className={`mobile-nav-item ${isAdmin ? 'active-admin' : ''}`}
          onClick={() => {
            sound.playSheetOpen();
            if (isAdmin) {
              onOpenAdminConsole();
            } else {
              onOpenAdminLogin();
            }
          }}
        >
          {isAdmin ? <Shield size={19} color="#34d399" /> : <Eye size={19} />}
          <span className="mobile-nav-label">{isAdmin ? 'Admin' : 'Spectator'}</span>
        </button>
      </div>
    </nav>
  );
}
