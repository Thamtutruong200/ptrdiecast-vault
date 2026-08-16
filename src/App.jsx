import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Plus, Loader2, CheckCircle2, Smartphone, Monitor, Sparkles 
} from 'lucide-react';
import { api } from './services/api';
import { sound } from './services/soundEffects';
import { auth } from './services/auth';
import { useDeviceDetect } from './hooks/useDeviceDetect';
import Navbar from './components/Navbar';
import StatsHeader from './components/StatsHeader';
import FilterBar from './components/FilterBar';
import ItemCard from './components/ItemCard';
import ItemListView from './components/ItemListView';
import ShowcaseStage from './components/ShowcaseStage';
import ItemDetailModal from './components/ItemDetailModal';
import AddItemModal from './components/AddItemModal';
import DuplicateModal from './components/DuplicateModal';
import ExportImportModal from './components/ExportImportModal';
import ValuationInfoModal from './components/ValuationInfoModal';
import AnalyticsModal from './components/AnalyticsModal';
import AdminLoginModal from './components/AdminLoginModal';
import AdminConsoleModal from './components/AdminConsoleModal';
import ExcelSheetModal from './components/ExcelSheetModal';
import IntroSequence from './components/IntroSequence';
import ptrLogo from './assets/ptr-logo.png';

export default function App() {
  // Category Vault Switcher: 'diecast' | 'toys'
  const [activeCategory, setActiveCategory] = useState('diecast');

  // Theme: 'dark' | 'light'
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('ptr_theme');
    return saved || 'dark';
  });

  // Welcoming Unboxing Intro Animation
  const [showIntro, setShowIntro] = useState(() => {
    return !sessionStorage.getItem('ptr_intro_seen');
  });

  const [items, setItems] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);

  // Admin & Spectator Console State
  const [isAdmin, setIsAdmin] = useState(auth.isAdmin());
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isAdminConsoleOpen, setIsAdminConsoleOpen] = useState(false);
  const [isExcelSheetOpen, setIsExcelSheetOpen] = useState(false);

  // View Mode: 'grid' (Gallery 4-col), 'showcase' (3D Studio), 'list' (macOS Table)
  const [viewMode, setViewMode] = useState('grid');

  // Device Auto-Detection Hook
  const { isMobile, isRealMobile, deviceMode, setDeviceMode, activeLayout } = useDeviceDetect();

  // Filters State
  const [filters, setFilters] = useState({
    q: '',
    scale: 'All',
    brand: 'All',
    condition: 'All',
    is_favorite: null,
    sort_by: 'created_at',
    sort_order: 'desc'
  });

  // Modals & Active Selections
  const [selectedItem, setSelectedItem] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isExportImportOpen, setIsExportImportOpen] = useState(false);
  const [isValuationInfoOpen, setIsValuationInfoOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);

  // Duplicate Warning Modal State
  const [duplicateModalData, setDuplicateModalData] = useState(null);

  // Toast Notifications
  const [toasts, setToasts] = useState([]);
  const searchInputRef = useRef(null);

  // Sync Theme attribute
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  const showPrices = isAdmin || !auth.hidePricesInSpectator();

  // Keyboard Shortcuts (Apple Pro UX)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) {
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === '/') {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === 'n' || e.key === 'N') {
        if (isAdmin) {
          e.preventDefault();
          sound.playSheetOpen();
          setEditingItem(null);
          setIsAddModalOpen(true);
        }
      } else if (e.key === '1') {
        sound.playTap();
        setViewMode('grid');
      } else if (e.key === '2') {
        sound.playTap();
        setViewMode('showcase');
      } else if (e.key === '3') {
        sound.playTap();
        setViewMode('list');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAdmin]);

  // Load items and stats based on category
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [itemsData, statsData] = await Promise.all([
        api.getItems(filters, activeCategory),
        api.getStats(activeCategory)
      ]);
      setItems(itemsData);
      setStats(statsData);

      const conn = await api.checkConnectionStatus();
      setIsSupabaseConnected(Boolean(conn.connected));
    } catch (err) {
      console.error('Failed to load collection data:', err);
      addToast('Backend connection unavailable', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [filters, activeCategory]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle Save (Create or Update)
  const handleSaveItem = async (itemData) => {
    try {
      const payload = {
        ...itemData,
        category: activeCategory
      };

      if (editingItem && editingItem.id) {
        const updated = await api.updateItem(editingItem.id, payload);
        setItems(prev => prev.map(i => i.id === editingItem.id ? { ...i, ...updated } : i));
        addToast(`Updated ${updated.casting_name}`);
        if (selectedItem && selectedItem.id === editingItem.id) {
          setSelectedItem(updated);
        }
      } else {
        const created = await api.createItem(payload);
        setItems(prev => [created, ...prev]);
        addToast(`Added ${created.casting_name} to vault`);
      }
      setIsAddModalOpen(false);
      setEditingItem(null);
      setDuplicateModalData(null);
      
      const newStats = await api.getStats(activeCategory);
      setStats(newStats);
      loadData();
    } catch (err) {
      alert('Error saving item: ' + err.message);
    }
  };

  // Handle Delete
  const handleDeleteItem = async (item) => {
    try {
      try { sound.playTrash(); } catch (e) {}
      // Instant Optimistic Removal
      setItems(prev => prev.filter(i => i.id !== item.id));
      if (selectedItem && selectedItem.id === item.id) {
        setSelectedItem(null);
      }
      await api.deleteItem(item.id);
      addToast(`Removed ${item.casting_name} from vault`);
      const newStats = await api.getStats(activeCategory);
      setStats(newStats);
      loadData();
    } catch (err) {
      alert('Failed to delete item: ' + err.message);
    }
  };

  // Toggle Favorite
  const handleToggleFavorite = async (item) => {
    try {
      const updated = await api.updateItem(item.id, {
        is_favorite: !item.is_favorite
      });
      setItems(prev => prev.map(i => i.id === item.id ? updated : i));
      if (selectedItem && selectedItem.id === item.id) {
        setSelectedItem(updated);
      }
      const newStats = await api.getStats(activeCategory);
      setStats(newStats);
      addToast(
        updated.is_favorite 
          ? `Starred ${updated.casting_name}` 
          : `Unstarred ${updated.casting_name}`
      );
    } catch (err) {
      alert('Failed to update favorite status');
    }
  };

  const handleIntroComplete = () => {
    sessionStorage.setItem('ptr_intro_seen', 'true');
    setShowIntro(false);
  };

  // Is any sheet or modal open for retreat animation
  const isSheetOpen = Boolean(selectedItem || isAddModalOpen || isExportImportOpen || isValuationInfoOpen || isAnalyticsOpen || isAdminLoginOpen || isAdminConsoleOpen || isExcelSheetOpen);

  return (
    <>
      {/* Cinematic Welcoming Intro Unboxing Animation */}
      {showIntro && <IntroSequence onComplete={handleIntroComplete} />}

      {/* Liquid Ambient Background Fluid Orbs */}
      <div className="liquid-bg-canvas">
        <div className="liquid-orb liquid-orb-1" />
        <div className="liquid-orb liquid-orb-2" />
        <div className="liquid-orb liquid-orb-3" />
        <div className="liquid-orb liquid-orb-4" />
      </div>

      <div className={`app-layout layout-mode-${activeLayout}`}>
        {/* Top Navigation */}
        <Navbar 
          totalCount={stats?.total_count || 0}
          onOpenAdd={() => {
            sound.playSheetOpen();
            setEditingItem(null);
            setIsAddModalOpen(true);
          }}
          onOpenExportImport={() => {
            sound.playSheetOpen();
            setIsExportImportOpen(true);
          }}
          onOpenAnalytics={() => {
            sound.playSheetOpen();
            setIsAnalyticsOpen(true);
          }}
          onOpenExcelSheet={() => {
            sound.playSheetOpen();
            setIsExcelSheetOpen(true);
          }}
          onOpenAdminConsole={() => {
            sound.playSheetOpen();
            setIsAdminConsoleOpen(true);
          }}
          onOpenAdminLogin={() => {
            sound.playSheetOpen();
            setIsAdminLoginOpen(true);
          }}
          isAdmin={isAdmin}
          isSupabaseConnected={isSupabaseConnected}
          deviceMode={deviceMode}
          setDeviceMode={setDeviceMode}
          isMobile={isMobile}
          isRealMobile={isRealMobile}
          activeCategory={activeCategory}
          setActiveCategory={(cat) => {
            setActiveCategory(cat);
            setFilters(prev => ({ ...prev, scale: 'All', brand: 'All' }));
          }}
          theme={theme}
          setTheme={setTheme}
        />

        <main className="container">
          {/* Liquid KPI Metric Cards (Cost & Value removed for clean 3-card layout) */}
          <StatsHeader 
            stats={stats} 
            items={items}
            onSelectCar={(it) => {
              sound.playSheetOpen();
              setSelectedItem(it);
            }}
          />

          {/* Liquid Segmented Control Filter Bar with View Mode Switcher */}
          <FilterBar 
            filters={filters} 
            setFilters={setFilters} 
            viewMode={viewMode}
            setViewMode={setViewMode}
            searchInputRef={searchInputRef}
            activeCategory={activeCategory}
          />

          {/* Dynamic View Modes: Gallery Grid (4-col) | macOS List View */}
          {isLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '6rem 0', gap: '0.85rem' }}>
              <Loader2 size={34} className="animate-spin" color="var(--apple-blue)" />
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 500 }}>
                Loading {activeCategory === 'diecast' ? 'PTR Motorsport' : 'Toys & Collectibles'} telemetry...
              </div>
            </div>
          ) : items.length > 0 ? (
            viewMode === 'list' ? (
              /* View 1: macOS Finder Compact Table List */
              <ItemListView 
                items={items}
                onSelect={(it) => {
                  sound.playSheetOpen();
                  setSelectedItem(it);
                }}
                onEdit={(it) => {
                  sound.playSheetOpen();
                  setEditingItem(it);
                  setIsAddModalOpen(true);
                }}
                onDelete={handleDeleteItem}
                onToggleFavorite={handleToggleFavorite}
                isAdmin={isAdmin}
                showPrices={showPrices}
              />
            ) : (
              /* View 2: 4 Cars Per Row Liquid Glass Gallery Grid */
              <div className="items-grid">
                {items.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    onSelect={(it) => {
                      sound.playSheetOpen();
                      setSelectedItem(it);
                    }}
                    onToggleFavorite={handleToggleFavorite}
                    showPrices={showPrices}
                  />
                ))}
              </div>
            )
          ) : (
            /* Liquid Empty State with Mascot */
            <div className="empty-state">
              <img 
                src={ptrLogo} 
                alt="PTR Motorsport" 
                style={{ width: '80px', height: '80px', borderRadius: '50%', boxShadow: '0 0 30px rgba(255, 159, 10, 0.4)' }} 
              />
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                No {activeCategory === 'diecast' ? 'Diecast Models' : 'Toys & Sets'} Found
              </h3>
              <p style={{ maxWidth: '400px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                {filters.q || filters.scale !== 'All' || filters.brand !== 'All' || filters.is_favorite
                  ? 'No items match your search criteria. Try adjusting your filters.'
                  : `Your ${activeCategory === 'diecast' ? 'diecast motorsport' : 'toys & collectibles'} vault is empty. Add your first item.`}
              </p>
              {filters.q || filters.scale !== 'All' || filters.brand !== 'All' || filters.is_favorite ? (
                <button 
                  className="btn btn-secondary btn-sm" 
                  onClick={() => setFilters({ q: '', scale: 'All', brand: 'All', condition: 'All', is_favorite: null, sort_by: 'created_at', sort_order: 'desc' })}
                  style={{ marginTop: '0.5rem' }}
                >
                  Reset All Filters
                </button>
              ) : (
                isAdmin && (
                  <button 
                    className="btn btn-primary"
                    onClick={() => {
                      sound.playSheetOpen();
                      setEditingItem(null);
                      setIsAddModalOpen(true);
                    }}
                    style={{ marginTop: '0.5rem' }}
                  >
                    <Plus size={16} strokeWidth={2.5} />
                    <span>Add First {activeCategory === 'diecast' ? 'Model' : 'Collectible'}</span>
                  </button>
                )
              )}
            </div>
          )}
        </main>

        {/* Mobile Floating Action Button (Only for Admin) */}
        {isMobile && isAdmin && (
          <button 
            type="button"
            className="mobile-fab"
            onClick={() => {
              sound.playSheetOpen();
              setEditingItem(null);
              setIsAddModalOpen(true);
            }}
            title="Add Model from Phone"
          >
            <Plus size={26} strokeWidth={2.5} />
          </button>
        )}

        {/* Live Excel-Style Spreadsheet Data Editor */}
        {isExcelSheetOpen && (
          <ExcelSheetModal 
            items={items}
            onClose={() => setIsExcelSheetOpen(false)}
            onRefresh={loadData}
            activeCategory={activeCategory}
          />
        )}

        {/* Modals */}
        {selectedItem && (
          <ItemDetailModal 
            item={selectedItem}
            onClose={() => setSelectedItem(null)}
            onEdit={(it) => {
              setSelectedItem(null);
              setEditingItem(it);
              setIsAddModalOpen(true);
            }}
            onDelete={handleDeleteItem}
            onToggleFavorite={handleToggleFavorite}
            onOpenValuationInfo={() => setIsValuationInfoOpen(true)}
            isAdmin={isAdmin}
            showPrices={showPrices}
          />
        )}

        {isAddModalOpen && (
          <AddItemModal 
            item={editingItem}
            onClose={() => {
              setIsAddModalOpen(false);
              setEditingItem(null);
            }}
            onSave={handleSaveItem}
            onDuplicateDetected={(existing, newData) => {
              setDuplicateModalData({ existing, newData });
            }}
            onOpenValuationInfo={() => setIsValuationInfoOpen(true)}
            isMobile={isMobile}
          />
        )}

        {duplicateModalData && (
          <DuplicateModal 
            existingItem={duplicateModalData.existing}
            newItemData={duplicateModalData.newData}
            onConfirmAdd={() => {
              handleSaveItem(duplicateModalData.newData);
              setDuplicateModalData(null);
            }}
            onCancel={() => setDuplicateModalData(null)}
          />
        )}

        {isExportImportOpen && (
          <ExportImportModal 
            items={items}
            onClose={() => setIsExportImportOpen(false)}
            onRefresh={loadData}
          />
        )}

        {/* Valuation Methodology Modal */}
        {isValuationInfoOpen && (
          <ValuationInfoModal 
            onClose={() => setIsValuationInfoOpen(false)}
          />
        )}

        {/* Collection Analytics Modal */}
        {isAnalyticsOpen && (
          <AnalyticsModal 
            stats={stats}
            items={items}
            onClose={() => setIsAnalyticsOpen(false)}
            onSelectCar={(it) => {
              sound.playSheetOpen();
              setSelectedItem(it);
            }}
          />
        )}

        {/* Admin Login PIN Modal */}
        {isAdminLoginOpen && (
          <AdminLoginModal 
            onClose={() => setIsAdminLoginOpen(false)}
            onLoginSuccess={() => {
              setIsAdmin(true);
              addToast('Admin Console Unlocked', 'success');
            }}
          />
        )}

        {/* Admin Console Sheet Modal */}
        {isAdminConsoleOpen && (
          <AdminConsoleModal 
            onClose={() => setIsAdminConsoleOpen(false)}
            onSwitchToSpectator={() => {
              auth.logout();
              setIsAdmin(false);
              addToast('Switched to Public Spectator Mode', 'success');
            }}
            onOpenAdd={() => {
              setEditingItem(null);
              setIsAddModalOpen(true);
            }}
            onOpenSync={() => setIsExportImportOpen(true)}
            onOpenAnalytics={() => setIsAnalyticsOpen(true)}
            onOpenExcelSheet={() => setIsExcelSheetOpen(true)}
          />
        )}

        {/* Floating Liquid Toast Capsule */}
        <div className="toast-container">
          {toasts.map((toast) => (
            <div key={toast.id} className="toast">
              <CheckCircle2 size={18} color="var(--apple-green)" />
              <span>{toast.message}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
