import React, { useState, useEffect, useRef } from 'react';
import { 
  X, UploadCloud, Sparkles, AlertTriangle, Check, Trash2, Camera, Loader2, Star, HelpCircle 
} from 'lucide-react';
import { api, formatVND } from '../services/api';

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
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false);
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
      setIsCheckingDuplicate(true);
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
      } finally {
        setIsCheckingDuplicate(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [formData.casting_name, formData.brand, formData.livery, item]);

  // Handle Photo File Upload
  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsUploading(true);
    try {
      const uploadRes = await api.uploadMultiplePhotos(files);
      const newUrls = (uploadRes.uploaded || []).map(u => u.url);
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
      alert('Please upload or snap a photo of the item first to scan with AI.');
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
      alert('AI Vision Scanner error: ' + err.message);
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
      alert('Item Name is required.');
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
      <div className="modal-content modal-lg" onClick={(e) => e.stopPropagation()}>
        {/* iOS Handle Bar */}
        <div className="sheet-handle-bar" />

        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <Camera size={20} color="var(--apple-blue)" />
            <h2 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', fontWeight: 700 }}>
              {isEditing ? `Edit ${formData.casting_name || 'Entry'}` : `New ${activeCategory === 'diecast' ? 'Diecast Model' : 'Toy Collectible'}`}
            </h2>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="modal-body">
          {/* Upload & Mobile Camera Area */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className="form-label">
                Photos & Visual Proof
              </span>
              
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => cameraInputRef.current?.click()}
                  title="Snap photo with camera"
                >
                  <Camera size={13} />
                  <span>Snap Photo</span>
                </button>

                <button 
                  type="button" 
                  className="btn btn-primary btn-sm"
                  onClick={handleAIScan}
                  disabled={isScanningAI || formData.photos.length === 0}
                  title="Auto-fill specs & valuation from photo using AI Vision"
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
              <UploadCloud size={28} color="var(--text-tertiary)" />
              <div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                  {isUploading ? 'Uploading photos...' : 'Drag photos, click to browse, or snap with phone camera'}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.15rem' }}>
                  High-res JPG, PNG, or WebP
                </div>
              </div>
            </div>

            {/* Thumbnails */}
            {formData.photos.length > 0 && (
              <div className="upload-thumbnails">
                {formData.photos.map((url, idx) => (
                  <div key={idx} className="upload-thumb">
                    <img src={url} alt="Thumbnail preview" />
                    <button 
                      type="button" 
                      className="upload-thumb-remove"
                      onClick={(e) => {
                        e.stopPropagation();
                        removePhoto(idx);
                      }}
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
                <AlertTriangle size={17} />
                <span>
                  <strong>Duplicate Notice:</strong> {duplicateMatches.length} matching item(s) already in vault ({duplicateMatches.map(m => `${m.brand} ${m.casting_name}`).join(', ')}).
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

          {/* Form Fields Grid */}
          <div className="form-grid">
            {/* Brand */}
            <div className="form-group">
              <label className="form-label">Brand / Manufacturer *</label>
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
              <label className="form-label">{activeCategory === 'diecast' ? 'Scale *' : 'Format / Scale *'}</label>
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
                placeholder={activeCategory === 'diecast' ? "e.g. Porsche 911 GT3 RS or Red Bull RB19" : "e.g. LEGO Technic Porsche 911 GT3 RS (42056)"}
                value={formData.casting_name}
                onChange={(e) => setFormData({ ...formData, casting_name: e.target.value })}
                required
              />
            </div>

            {/* Livery / Edition */}
            <div className="form-group">
              <label className="form-label">Livery / Edition / Series</label>
              <input 
                type="text"
                className="form-control"
                placeholder="e.g. Weissach Package, Ultimate Series"
                value={formData.livery}
                onChange={(e) => setFormData({ ...formData, livery: e.target.value })}
              />
            </div>

            {/* Color */}
            <div className="form-group">
              <label className="form-label">Primary Color</label>
              <input 
                type="text"
                className="form-control"
                placeholder="e.g. Lava Orange, Ice Grey Metallic"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              />
            </div>

            {/* Era / Series */}
            <div className="form-group">
              <label className="form-label">Era / Category</label>
              <input 
                type="text"
                className="form-control"
                placeholder="e.g. Modern Supercar, Technic, JDM"
                value={formData.era}
                onChange={(e) => setFormData({ ...formData, era: e.target.value })}
              />
            </div>

            {/* Condition */}
            <div className="form-group">
              <label className="form-label">Condition Rating</label>
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

            {/* Purchase Price */}
            <div className="form-group">
              <label className="form-label">Purchase Price (VND ₫)</label>
              <input 
                type="number"
                step="10000"
                className="form-control font-mono"
                value={formData.purchase_price}
                onChange={(e) => setFormData({ ...formData, purchase_price: Number(e.target.value) })}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.1rem' }}>
                {formatVND(formData.purchase_price)}
              </span>
            </div>

            {/* Current Value */}
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Market Valuation (VND ₫)</span>
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
              </label>
              <input 
                type="number"
                step="10000"
                className="form-control font-mono"
                value={formData.current_value}
                onChange={(e) => setFormData({ ...formData, current_value: Number(e.target.value) })}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--apple-green)', marginTop: '0.1rem', fontWeight: 600 }}>
                {formatVND(formData.current_value)}
              </span>
            </div>

            {/* Valuation Source */}
            <div className="form-group col-span-2">
              <label className="form-label">
                <span>Valuation Provenance / Basis</span>
              </label>
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

            {/* Notes */}
            <div className="form-group col-span-2">
              <label className="form-label">Collector Notes & Authenticity</label>
              <textarea 
                className="form-control"
                placeholder="Serialized edition number, opening doors, rubber tires, piece count, etc."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>

            {/* Starred Favorite Toggle */}
            <div className="form-group col-span-2" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.6rem' }}>
              <input 
                type="checkbox"
                id="is_favorite_chk"
                checked={formData.is_favorite}
                onChange={(e) => setFormData({ ...formData, is_favorite: e.target.checked })}
                style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--apple-amber)' }}
              />
              <label htmlFor="is_favorite_chk" style={{ fontSize: '0.875rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Star size={15} color="var(--apple-amber)" fill={formData.is_favorite ? 'var(--apple-amber)' : 'none'} />
                <span>Mark as Starred Favorite</span>
              </label>
            </div>
          </div>

          {/* Action Bar */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)' }}>
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
