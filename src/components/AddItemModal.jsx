import React, { useState, useEffect, useRef } from 'react';
import { 
  X, UploadCloud, Sparkles, AlertTriangle, Check, Trash2, Camera, Loader2, Star, HelpCircle, Layers, DollarSign, FileText, Image as ImageIcon 
} from 'lucide-react';
import { api, formatVND } from '../services/api';
import { sound } from '../services/soundEffects';

const DIECAST_SCALES = ['1:64', '1:43', '1:24', '1:18', '1:12', 'Other'];
const TOY_SCALES = ['1:8', '1:60', '400%', '1000%', 'Statue', 'Figure', 'Other'];

const DIECAST_BRANDS = [
  'Minichamps', 'Hot Wheels RLC', 'Hot Wheels Premium', 'Mini GT',
  'Inno64', 'Kaido House', 'Tarmac Works', 'Tomica Limited Vintage',
  'AUTOart', 'Spark', 'Kyosho', 'Bburago', 'Matchbox Collectors', 'Other'
];

const TOY_BRANDS = [
  'Lego', 'Gundam / Bandai', 'Pop Mart', 'Medicom Bearbrick', 'Hot Toys', 'Good Smile Company', 'Hasbro', 'Other'
];

const CONDITIONS = ['Mint in Box', 'Mint in Sealed Box', 'Loose Mint', 'Displayed', 'Custom', 'Fair'];

const VALUATION_SOURCES = [
  'Market Comps (eBay / Auctions)',
  'HobbyDB & F1 Collector Index',
  'BrickEconomy & Collector Comps',
  'AI Vision & Collector Index',
  'Verified Appraisal Comps',
  'Retail MSRP Release',
  'Custom Collector Estimate'
];

export default function AddItemModal({ item, onClose, onSave, onDuplicateDetected, onOpenValuationInfo, isMobile, activeCategory = 'diecast' }) {
  const isEditing = Boolean(item && item.id);
  const scales = activeCategory === 'diecast' ? DIECAST_SCALES : TOY_SCALES;
  const brands = activeCategory === 'diecast' ? DIECAST_BRANDS : TOY_BRANDS;

  const [formData, setFormData] = useState({
    category: activeCategory,
    brand: activeCategory === 'diecast' ? 'Minichamps' : 'Lego',
    scale: activeCategory === 'diecast' ? '1:64' : '1:8',
    casting_name: '',
    livery: '',
    color: '',
    era: '',
    condition: 'Mint in Box',
    purchase_price: 0,
    current_value: 0,
    valuation_source: 'Market Comps (eBay / Auctions)',
    notes: '',
    photos: [],
    track_photos: [],
    reference_photos: [],
    is_favorite: false,
  });

  const [isUploading, setIsUploading] = useState(false);
  const [isScanningAI, setIsScanningAI] = useState(false);
  const [duplicateMatches, setDuplicateMatches] = useState([]);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  useEffect(() => {
    if (item) {
      setFormData({
        category: item.category || activeCategory,
        brand: item.brand || (activeCategory === 'diecast' ? 'Minichamps' : 'Lego'),
        scale: item.scale || (activeCategory === 'diecast' ? '1:64' : '1:8'),
        casting_name: item.casting_name || '',
        livery: item.livery || '',
        color: item.color || '',
        era: item.era || '',
        condition: item.condition || 'Mint in Box',
        purchase_price: item.purchase_price || 0,
        current_value: item.current_value || 0,
        valuation_source: item.valuation_source || 'Market Comps (eBay / Auctions)',
        notes: item.notes || '',
        photos: item.photos || [],
        track_photos: item.track_photos || [],
        reference_photos: item.reference_photos || [],
        is_favorite: item.is_favorite || false,
      });
    }
  }, [item, activeCategory]);

  // Debounced duplicate check
  useEffect(() => {
    if (!formData.casting_name || formData.casting_name.trim().length < 3) {
      setDuplicateMatches([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await api.checkDuplicate(
          formData.casting_name,
          formData.brand,
          formData.livery,
          item?.id
        );
        if (res.is_duplicate) {
          setDuplicateMatches(res.matching_items);
        } else {
          setDuplicateMatches([]);
        }
      } catch (err) {
        console.error('Duplicate check error:', err);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [formData.casting_name, formData.brand, formData.livery, item]);

  // Handle Photo File Upload with Auto-Compressor
  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsUploading(true);
    try {
      const uploadPromises = files.map(f => api.uploadPhoto(f));
      const results = await Promise.all(uploadPromises);
      const newUrls = results.map(r => r.url);
      setFormData(prev => ({
        ...prev,
        photos: [...prev.photos, ...newUrls]
      }));
    } catch (err) {
      alert('Photo upload error: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  // Trigger AI Auto-Scanner
  const handleAIScan = async () => {
    if (formData.photos.length === 0) {
      alert('Please upload or snap a photo of the item first to scan with Apple Intelligence.');
      return;
    }

    setIsScanningAI(true);
    try {
      const firstPhoto = formData.photos[0];
      const res = await api.identifyImage({
        imageBase64: firstPhoto.startsWith('data:') ? firstPhoto : null,
        imageUrl: !firstPhoto.startsWith('data:') ? firstPhoto : null,
      });

      setFormData(prev => ({
        ...prev,
        brand: res.brand || prev.brand,
        scale: res.scale || prev.scale,
        casting_name: res.casting_name || prev.casting_name,
        livery: res.livery || prev.livery,
        color: res.color || prev.color,
        era: res.era || prev.era,
        condition: res.suggested_condition || prev.condition,
        current_value: res.estimated_market_value || prev.current_value,
        valuation_source: res.valuation_source || 'AI Vision & Collector Comps Index',
        notes: (prev.notes ? prev.notes + '\n' : '') + (res.notes || ''),
      }));
    } catch (err) {
      alert('AI Vision Scanner notice: ' + err.message);
    } finally {
      setIsScanningAI(false);
    }
  };

  const removePhoto = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.casting_name.trim()) {
      alert('Item / Casting Name is required.');
      return;
    }

    onSave({
      ...formData,
      category: activeCategory,
      purchase_price: Number(formData.purchase_price) || 0,
      current_value: Number(formData.current_value) || 0,
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-lg add-item-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Apple Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="modal-header-icon-badge">
              <Camera size={18} color="var(--apple-blue)" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', fontWeight: 800, letterSpacing: '-0.02em' }}>
                {isEditing ? `Edit Entry: ${formData.casting_name || 'Item'}` : `Add New ${activeCategory === 'diecast' ? 'Diecast Model' : 'Toy Collectible'}`}
              </h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                {activeCategory === 'diecast' ? '🏎️ PTR Motorsport Vault' : '🧸 Toys & Designer Art Sets'}
              </p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose} title="Close (Esc)">
            <X size={18} />
          </button>
        </div>

        {/* Form Body with Clear Sections */}
        <form onSubmit={handleSubmit} className="modal-body form-body-custom">
          {/* SECTION 1: PHOTOS & VISUAL PROOF */}
          <div className="form-section-card">
            <div className="form-section-header">
              <div className="form-section-title">
                <ImageIcon size={15} color="var(--apple-blue)" />
                <span>Photos & Visual Proof</span>
              </div>
              
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => cameraInputRef.current?.click()}
                  title="Snap photo with camera"
                >
                  <Camera size={13} />
                  <span>Camera</span>
                </button>

                <button 
                  type="button" 
                  className="btn btn-primary btn-sm"
                  onClick={handleAIScan}
                  disabled={isScanningAI || formData.photos.length === 0}
                  title="Auto-fill specs from photo using AI Vision"
                >
                  {isScanningAI ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
                  <span>{isScanningAI ? 'Scanning...' : 'Apple Intelligence'}</span>
                </button>
              </div>
            </div>

            {/* Hidden Inputs */}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              multiple 
              accept="image/*" 
              style={{ display: 'none' }} 
            />
            <input 
              type="file" 
              ref={cameraInputRef} 
              onChange={handleFileUpload} 
              accept="image/*" 
              capture="environment" 
              style={{ display: 'none' }} 
            />

            {/* Dropzone */}
            <div 
              className="upload-dropzone"
              onClick={() => fileInputRef.current?.click()}
            >
              <UploadCloud size={30} color="var(--apple-blue)" />
              <div>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                  {isUploading ? 'Compressing & uploading to Supabase...' : 'Click to Browse, Drag Photos, or Snap with Phone'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.72rem', color: '#34d399', marginTop: '0.25rem', fontWeight: 600 }}>
                  <Sparkles size={11} />
                  <span>⚡ In-Browser Auto-Compressor (~250 KB – 400 KB, Max 1920px)</span>
                </div>
              </div>
            </div>

            {/* Thumbnails */}
            {formData.photos.length > 0 && (
              <div className="upload-thumbnails">
                {formData.photos.map((url, idx) => (
                  <div key={idx} className="upload-thumb">
                    <img src={url} alt="Uploaded preview" />
                    <button 
                      type="button" 
                      className="upload-thumb-remove"
                      onClick={(e) => {
                        e.stopPropagation();
                        removePhoto(idx);
                      }}
                      title="Remove photo"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Real-time Duplicate Banner */}
          {duplicateMatches.length > 0 && (
            <div className="duplicate-banner">
              <div className="duplicate-banner-content">
                <AlertTriangle size={17} color="var(--apple-amber)" />
                <span>
                  <strong>Duplicate Notice:</strong> {duplicateMatches.length} item(s) match ({duplicateMatches.map(m => `${m.brand} ${m.casting_name}`).join(', ')}).
                </span>
              </div>
              <button 
                type="button" 
                className="btn btn-secondary btn-sm"
                onClick={() => onDuplicateDetected(duplicateMatches[0], formData)}
              >
                Compare
              </button>
            </div>
          )}

          {/* SECTION 2: IDENTITY & SPECIFICATIONS */}
          <div className="form-section-card">
            <div className="form-section-title" style={{ marginBottom: '1rem' }}>
              <Layers size={15} color="var(--apple-blue)" />
              <span>Identity & Specifications</span>
            </div>

            <div className="form-grid">
              {/* Brand */}
              <div className="form-group">
                <label className="form-label">Manufacturer / Brand *</label>
                <select 
                  className="form-control"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  required
                >
                  {brands.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              {/* Scale / Format */}
              <div className="form-group">
                <label className="form-label">{activeCategory === 'diecast' ? 'Scale Ratio *' : 'Format / Scale *'}</label>
                <select 
                  className="form-control"
                  value={formData.scale}
                  onChange={(e) => setFormData({ ...formData, scale: e.target.value })}
                  required
                >
                  {scales.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Model / Casting Name */}
              <div className="form-group col-span-2">
                <label className="form-label">{activeCategory === 'diecast' ? 'Casting / Model Name *' : 'Collectible / Set Name *'}</label>
                <input 
                  type="text"
                  className="form-control"
                  placeholder={activeCategory === 'diecast' ? "e.g. Porsche 911 (992) GT3 RS or Red Bull RB19" : "e.g. LEGO Technic Porsche 911 GT3 RS (42056)"}
                  value={formData.casting_name}
                  onChange={(e) => setFormData({ ...formData, casting_name: e.target.value })}
                  required
                />
              </div>

              {/* Livery / Edition */}
              <div className="form-group">
                <label className="form-label">Racing Livery / Special Edition</label>
                <input 
                  type="text"
                  className="form-control"
                  placeholder="e.g. Weissach Package, Rothmans #1"
                  value={formData.livery}
                  onChange={(e) => setFormData({ ...formData, livery: e.target.value })}
                />
              </div>

              {/* Color */}
              <div className="form-group">
                <label className="form-label">Body Color</label>
                <input 
                  type="text"
                  className="form-control"
                  placeholder="e.g. Ice Grey Metallic, Lava Orange"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                />
              </div>

              {/* Era / Series */}
              <div className="form-group">
                <label className="form-label">Era / Motorsport Category</label>
                <input 
                  type="text"
                  className="form-control"
                  placeholder="e.g. Modern Supercar, 2023 F1, 1990s JDM"
                  value={formData.era}
                  onChange={(e) => setFormData({ ...formData, era: e.target.value })}
                />
              </div>

              {/* Condition */}
              <div className="form-group">
                <label className="form-label">Condition Rating *</label>
                <select 
                  className="form-control"
                  value={formData.condition}
                  onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                >
                  {CONDITIONS.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 3: VALUATION & FINANCIALS */}
          <div className="form-section-card">
            <div className="form-section-title" style={{ marginBottom: '1rem' }}>
              <DollarSign size={15} color="var(--apple-green)" />
              <span>Valuation & Financial Telemetry</span>
            </div>

            <div className="form-grid">
              {/* Purchase Price */}
              <div className="form-group">
                <label className="form-label">Purchase Price (VND ₫)</label>
                <input 
                  type="number"
                  step="10000"
                  className="form-control font-mono"
                  value={formData.purchase_price || ''}
                  placeholder="0"
                  onChange={(e) => setFormData({ ...formData, purchase_price: Number(e.target.value) })}
                />
                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.2rem', fontWeight: 600 }}>
                  Paid: {formatVND(formData.purchase_price)}
                </div>
              </div>

              {/* Market Valuation */}
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <label className="form-label" style={{ margin: 0 }}>Estimated Valuation (VND ₫)</label>
                  {onOpenValuationInfo && (
                    <button
                      type="button"
                      onClick={onOpenValuationInfo}
                      style={{ background: 'none', border: 'none', color: '#34d399', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.7rem' }}
                    >
                      <HelpCircle size={11} />
                      <span>How it works</span>
                    </button>
                  )}
                </div>
                <input 
                  type="number"
                  step="10000"
                  className="form-control font-mono"
                  value={formData.current_value || ''}
                  placeholder="0"
                  onChange={(e) => setFormData({ ...formData, current_value: Number(e.target.value) })}
                />
                <div style={{ fontSize: '0.75rem', color: '#34d399', marginTop: '0.2rem', fontWeight: 700 }}>
                  Market Value: {formatVND(formData.current_value)}
                </div>
              </div>

              {/* Valuation Source */}
              <div className="form-group col-span-2">
                <label className="form-label">Valuation Provenance / Methodology</label>
                <select 
                  className="form-control"
                  value={formData.valuation_source}
                  onChange={(e) => setFormData({ ...formData, valuation_source: e.target.value })}
                >
                  {VALUATION_SOURCES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 4: COLLECTOR NOTES & FAVORITE */}
          <div className="form-section-card">
            <div className="form-section-title" style={{ marginBottom: '1rem' }}>
              <FileText size={15} color="var(--apple-amber)" />
              <span>Collector Heritage & Notes</span>
            </div>

            <div className="form-grid">
              <div className="form-group col-span-2">
                <label className="form-label">Authentication Notes & Special Features</label>
                <textarea 
                  className="form-control"
                  placeholder="Serialized limited edition number, opening parts, certificate number, real riders rubber tires, etc."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                />
              </div>

              {/* Starred Favorite Toggle */}
              <div className="form-group col-span-2" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.65rem', paddingTop: '0.25rem' }}>
                <input 
                  type="checkbox"
                  id="is_favorite_chk"
                  checked={formData.is_favorite}
                  onChange={(e) => setFormData({ ...formData, is_favorite: e.target.checked })}
                  style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--apple-amber)' }}
                />
                <label htmlFor="is_favorite_chk" style={{ fontSize: '0.875rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  <Star size={15} color="var(--apple-amber)" fill={formData.is_favorite ? 'var(--apple-amber)' : 'none'} />
                  <span>Add to Vault Favorites</span>
                </label>
              </div>
            </div>
          </div>

          {/* Sticky Apple Action Bar */}
          <div className="modal-action-bar">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Check size={16} />
              <span>{isEditing ? 'Save Changes' : 'Add to Vault'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
