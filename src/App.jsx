import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Plus, Loader2, CheckCircle2, Inbox, Smartphone, Monitor, Sparkles 
} from 'lucide-react';
import { api } from './services/api';
import { sound } from './services/soundEffects';
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
import ptrLogo from './assets/ptr-logo.png';

export default function App() {
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);

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

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  // Keyboard Shortcuts (Apple Pro UX)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger shortcuts if user is typing in an input
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
        e.preventDefault();
        sound.playSheetOpen();
        setEditingItem(null);
        setIsAddModalOpen(true);
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
  }, []);

  // Load items and stats
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [itemsData, statsData] = await Promise.all([
        api.getItems(filters),
        api.getStats()
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
  }, [filters]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle Save (Create or Update)
  const handleSaveItem = async (itemData) => {
    try {
      if (editingItem && editingItem.id) {
        const updated = await api.updateItem(editingItem.id, itemData);
        addToast(`Updated ${updated.casting_name}`);
        if (selectedItem && selectedItem.id === editingItem.id) {
          setSelectedItem(updated);
        }
      } else {
        const created = await api.createItem(itemData);
        addToast(`Added ${created.casting_name} to vault`);
      }
      setIsAddModalOpen(false);
      setEditingItem(null);
      setDuplicateModalData(null);
      loadData();
    } catch (err) {
      alert('Error saving item: ' + err.message);
    }
  };

  // Handle Delete
  const handleDeleteItem = async (item) => {
    try {
      await api.deleteItem(item.id);
      addToast(`Removed ${item.casting_name} from vault`);
      if (selectedItem && selectedItem.id === item.id) {
        setSelectedItem(null);
      }
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
      const newStats = await api.getStats();
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

  return (
    <>
      {/* Liquid Ambient Background Fluid Orbs */}
      <div className="liquid-bg-canvas">
        <div className="liquid-orb liquid-orb-1" />
        <div className="liquid-orb liquid-orb-2" />
        <div className="liquid-orb liquid-orb-3" />
        <div className="liquid-orb liquid-orb-4" />
      </div>

      <div className={`app-layout layout-mode-${activeLayout}`}>
        {/* Liquid Frosted Top Navigation */}
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
          isSupabaseConnected={isSupabaseConnected}
          deviceMode={deviceMode}
          setDeviceMode={setDeviceMode}
          isMobile={isMobile}
          isRealMobile={isRealMobile}
        />

        <main className="container">
          {/* Liquid KPI Metric Cards with Vault Spotlight */}
          <StatsHeader 
            stats={stats} 
            items={items}
            onSelectCar={(it) => {
              sound.playSheetOpen();
              setSelectedItem(it);
            }}
            onOpenValuationInfo={() => {
              sound.playSheetOpen();
              setIsValuationInfoOpen(true);
            }}
          />

          {/* Liquid Segmented Control Filter Bar with View Mode Switcher */}
          <FilterBar 
            filters={filters} 
            setFilters={setFilters} 
            viewMode={viewMode}
            setViewMode={setViewMode}
            searchInputRef={searchInputRef}
          />

          {/* Dynamic View Modes: Gallery Grid (4-col) | 3D Showcase Stage | macOS Table List */}
          {isLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '6rem 0', gap: '0.85rem' }}>
              <Loader2 size={34} className="animate-spin" color="var(--apple-blue)" />
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 500 }}>
                Updating PTR Vault telemetry...
              </div>
            </div>
          ) : items.length > 0 ? (
            viewMode === 'showcase' ? (
              /* View 1: 3D Cinematic Showcase Studio Stage */
              <ShowcaseStage 
                items={items}
                onSelectCar={(it) => {
                  sound.playSheetOpen();
                  setSelectedItem(it);
                }}
                onToggleFavorite={handleToggleFavorite}
              />
            ) : viewMode === 'list' ? (
              /* View 2: macOS Finder Compact Table List */
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
              />
            ) : (
              /* View 3: 4 Cars Per Row Liquid Glass Gallery Grid */
              <div className="items-grid">
                {items.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
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
                No Models Found in Vault
              </h3>
              <p style={{ maxWidth: '400px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                {filters.q || filters.scale !== 'All' || filters.brand !== 'All' || filters.is_favorite
                  ? 'No diecasts match your search criteria. Try adjusting your scale or brand filters.'
                  : 'Your PTR collection vault is empty. Add your first motorsport model to start tracking.'}
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
                  <span>Add First Model</span>
                </button>
              )}
            </div>
          )}
        </main>

        {/* Mobile Floating Action Button (FAB) */}
        {isMobile && (
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
