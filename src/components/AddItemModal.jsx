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
  const [isTrackUploading, setIsTrackUploading] = useState(false);
  const [modelPhotoUrlInput, setModelPhotoUrlInput] = useState('');
  const [trackPhotoUrlInput, setTrackPhotoUrlInput] = useState('');
  const [duplicateMatches, setDuplicateMatches] = useState([]);
  
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const trackFileInputRef = useRef(null);

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

  // Handle Model Photo File Upload (Direct Batch)
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

  const removePhoto = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  const handleAddModelPhotoUrl = (e) => {
    e.preventDefault();
    if (!modelPhotoUrlInput.trim()) return;
    setFormData(prev => ({
      ...prev,
      photos: [...prev.photos, modelPhotoUrlInput.trim()]
    }));
    setModelPhotoUrlInput('');
  };

  // Handle Real Race Track Photo File Upload
  const handleTrackFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsTrackUploading(true);
    try {
      const uploadPromises = files.map(f => api.uploadPhoto(f));
      const results = await Promise.all(uploadPromises);
      const newUrls = results.map(r => r.url);
      setFormData(prev => ({
        ...prev,
        track_photos: [...prev.track_photos, ...newUrls]
      }));
    } catch (err) {
      alert('Track photo upload error: ' + err.message);
    } finally {
      setIsTrackUploading(false);
    }
  };

  const removeTrackPhoto = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      track_photos: prev.track_photos.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  const handleAddTrackPhotoUrl = (e) => {
    e.preventDefault();
    if (!trackPhotoUrlInput.trim()) return;
    setFormData(prev => ({
      ...prev,
      track_photos: [...prev.track_photos, trackPhotoUrlInput.trim()]
    }));
    setTrackPhotoUrlInput('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.casting_name.trim()) {
      alert('Item / Casting Name is required.');
      return;
    }

    const finalPaid = Number(formData.purchase_price) || 0;
    const finalVal = Number(formData.current_value) || finalPaid;

    onSave({
      ...formData,
      category: activeCategory,
      purchase_price: finalPaid,
      current_value: finalVal,
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
          {/* SECTION 1: DIECAST / TOY MODEL PHOTOS */}
          <div className="form-section-card">
            <div className="form-section-header">
              <div className="form-section-title">
                <ImageIcon size={15} color="var(--apple-blue)" />
                <span>1. Vault Model Photos ({formData.photos.length})</span>
              </div>
              
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
                  className="btn btn-secondary btn-sm"
                  onClick={() => fileInputRef.current?.click()}
                  title="Upload from computer"
                >
                  <UploadCloud size={13} />
                  <span>Upload Model Photos</span>
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
              <UploadCloud size={26} color="var(--apple-blue)" />
              <div>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                  {isUploading ? 'Compressing & uploading model photos to Supabase...' : 'Click to Upload Physical Scale Model Photos'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.72rem', color: '#34d399', marginTop: '0.2rem', fontWeight: 600 }}>
                  <Sparkles size={11} />
                  <span>⚡ In-Browser Auto-Compressor (~250 KB – 400 KB, Max 1920px)</span>
                </div>
              </div>
            </div>

            {/* Quick URL Adder for Model Photo */}
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.65rem' }}>
              <input 
                type="url"
                className="form-control"
                style={{ fontSize: '0.8rem', height: '36px' }}
                placeholder="Or paste direct image URL (https://...)"
                value={modelPhotoUrlInput}
                onChange={(e) => setModelPhotoUrlInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddModelPhotoUrl(e);
                  }
                }}
              />
              <button 
                type="button" 
                className="btn btn-secondary btn-sm"
                onClick={handleAddModelPhotoUrl}
                style={{ flexShrink: 0, height: '36px' }}
              >
                + Add URL
              </button>
            </div>

            {/* Thumbnails */}
            {formData.photos.length > 0 && (
              <div className="upload-thumbnails" style={{ marginTop: '0.75rem' }}>
                {formData.photos.map((url, idx) => (
                  <div key={idx} className="upload-thumb">
                    <img src={url} alt="Uploaded model preview" />
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

          {/* SECTION 2: REAL 1:1 RACE TRACK & VEHICLE PHOTOS */}
          <div className="form-section-card" style={{ borderColor: 'rgba(255, 159, 10, 0.35)', background: 'linear-gradient(145deg, rgba(255, 159, 10, 0.04), rgba(18, 22, 34, 0.6))' }}>
            <div className="form-section-header">
              <div>
                <div className="form-section-title" style={{ color: 'var(--apple-amber)' }}>
                  <span>🏁</span>
                  <span>2. Real 1:1 Race Track & Vehicle Photos ({formData.track_photos.length})</span>
                </div>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: '0.2rem' }}>
                  Real race photos displayed on the <strong>🏁 Real Race Track</strong> tab in the car inspector.
                </p>
              </div>
              
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => trackFileInputRef.current?.click()}
                title="Upload real race photos"
                style={{ color: 'var(--apple-amber)', borderColor: 'rgba(255, 159, 10, 0.4)' }}
              >
                <UploadCloud size={13} />
                <span>Upload Track Photos</span>
              </button>
            </div>

            {/* Hidden Track File Input */}
            <input 
              type="file" 
              ref={trackFileInputRef} 
              onChange={handleTrackFileUpload} 
              multiple 
              accept="image/*" 
              style={{ display: 'none' }} 
            />

            {/* Track Dropzone */}
            <div 
              className="upload-dropzone"
              onClick={() => trackFileInputRef.current?.click()}
              style={{ borderColor: 'rgba(255, 159, 10, 0.35)' }}
            >
              <span style={{ fontSize: '1.5rem' }}>🏎️</span>
              <div>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                  {isTrackUploading ? 'Compressing & uploading race track photos...' : 'Click to Upload Real 1:1 Race Car / Track Action Photos'}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  Upload photos of the real car at Le Mans, Monaco GP, Nürburgring, or IMSA
                </div>
              </div>
            </div>

            {/* Quick URL Adder for Track Photo */}
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.65rem' }}>
              <input 
                type="url"
                className="form-control"
                style={{ fontSize: '0.8rem', height: '36px' }}
                placeholder="Or paste direct real race photo URL (e.g. Wikipedia / Motorsport.com)"
                value={trackPhotoUrlInput}
                onChange={(e) => setTrackPhotoUrlInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTrackPhotoUrl(e);
                  }
                }}
              />
              <button 
                type="button" 
                className="btn btn-secondary btn-sm"
                onClick={handleAddTrackPhotoUrl}
                style={{ flexShrink: 0, height: '36px', color: 'var(--apple-amber)', borderColor: 'rgba(255, 159, 10, 0.4)' }}
              >
                + Add Track URL
              </button>
            </div>

            {/* Track Thumbnails */}
            {formData.track_photos.length > 0 && (
              <div className="upload-thumbnails" style={{ marginTop: '0.75rem' }}>
                {formData.track_photos.map((url, idx) => (
                  <div key={idx} className="upload-thumb" style={{ borderColor: 'rgba(255, 159, 10, 0.5)' }}>
                    <img src={url} alt="Track preview" />
                    <button 
                      type="button" 
                      className="upload-thumb-remove"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeTrackPhoto(idx);
                      }}
                      title="Remove track photo"
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
              <div className="form-group col-span-2">
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

          {/* SECTION 3: PURCHASE PRICE */}
          <div className="form-section-card">
            <div className="form-section-title" style={{ marginBottom: '1rem' }}>
              <DollarSign size={15} color="var(--apple-green)" />
              <span>Purchase Price</span>
            </div>

            <div className="form-grid">
              {/* Purchase Price */}
              <div className="form-group col-span-2">
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
                  Price: {formatVND(formData.purchase_price)}
                </div>
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
