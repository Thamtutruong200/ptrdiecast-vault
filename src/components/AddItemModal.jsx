import React, { useState, useEffect, useRef } from 'react';
import { 
  X, UploadCloud, Sparkles, AlertTriangle, Check, Trash2, Camera, Loader2, Star, HelpCircle, Smartphone 
} from 'lucide-react';
import { api, formatVND } from '../services/api';

const SCALES = ['1:64', '1:43', '1:24', '1:18', '1:12', 'Other'];

const BRANDS = [
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

const CONDITIONS = ['Mint in Box', 'Loose Mint', 'Displayed', 'Custom', 'Fair'];

const VALUATION_SOURCES = [
  'Market Comps (eBay / Auctions)',
  'HobbyDB & F1 Collector Index',
  'AI Vision & Collector Index',
  'Verified Appraisal Comps',
  'Retail MSRP Release',
  'Custom Collector Estimate'
];

export default function AddItemModal({ item, onClose, onSave, onDuplicateDetected, onOpenValuationInfo, isMobile }) {
  const isEditing = Boolean(item && item.id);

  const [formData, setFormData] = useState({
    brand: 'Minichamps',
    scale: '1:43',
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
        brand: item.brand || 'Minichamps',
        scale: item.scale || '1:43',
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
        reference_photos: item.reference_photos || [],
        is_favorite: item.is_favorite || false,
      });
    }
  }, [item]);

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
      alert('Please upload or snap a photo of the car first to scan with AI.');
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
      alert('Casting Name is required.');
      return;
    }

    onSave({
      ...formData,
      purchase_price: Number(formData.purchase_price) || 0,
      current_value: Number(formData.current_value) || 0,
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-lg" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h2>
            <Camera size={20} color="var(--apple-blue)" />
            <span>{isEditing ? 'Edit Diecast Model' : 'New Model Entry'}</span>
          </h2>
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
                Model Photos
              </span>
              
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {/* Mobile Direct Camera Snap Button */}
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
                  className="btn btn-ai btn-sm"
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
                  {isUploading ? 'Uploading photos...' : 'Drag photos, click to browse, or snap with camera'}
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
                {BRANDS.filter(b => b !== 'All').map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            {/* Scale */}
            <div className="form-group">
              <label className="form-label">Scale *</label>
              <select 
                className="form-control"
                value={formData.scale}
                onChange={(e) => setFormData({ ...formData, scale: e.target.value })}
                required
              >
                {SCALES.filter(s => s !== 'All').map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Casting / Model Name */}
            <div className="form-group col-span-2">
              <label className="form-label">Casting / Model Name *</label>
              <input 
                type="text"
                className="form-control"
                placeholder="e.g. Minichamps Porsche 911 GT3 RS or Red Bull RB19"
                value={formData.casting_name}
                onChange={(e) => setFormData({ ...formData, casting_name: e.target.value })}
                required
              />
            </div>

            {/* Livery */}
            <div className="form-group">
              <label className="form-label">Racing Livery / Edition</label>
              <input 
                type="text"
                className="form-control"
                placeholder="e.g. Weissach Package, Max Verstappen #1"
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
                placeholder="e.g. Ice Grey Metallic, Matte Navy"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              />
            </div>

            {/* Era */}
            <div className="form-group">
              <label className="form-label">Era / Category</label>
              <input 
                type="text"
                className="form-control"
                placeholder="e.g. Modern Supercar, 2023 Formula 1, 1990s JDM"
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
                {CONDITIONS.filter(c => c !== 'All').map(c => (
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
                <span>Valuation Provenance / Source</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>Basis for estimated value</span>
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
                placeholder="Serialized edition number, opening doors, rubber tires, certificate number, etc."
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
