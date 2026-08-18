import React, { useState, useRef, useEffect } from 'react';
import { 
  X, Check, RotateCw, RotateCcw, ZoomIn, ZoomOut, Crop, Sparkles, RefreshCw 
} from 'lucide-react';
import { sound } from '../services/soundEffects';

const ASPECT_RATIOS = [
  { label: '4:3 (Card)', value: 4 / 3, desc: 'Recommended for Gallery' },
  { label: '16:9 (Wide)', value: 16 / 9, desc: 'Showcase banner' },
  { label: '1:1 (Square)', value: 1 / 1, desc: 'Macro detail' },
  { label: '3:2 (Photo)', value: 3 / 2, desc: 'Classic DSLR' },
  { label: 'Original', value: null, desc: 'Keep photo ratio' }
];

export default function ImageCropperModal({ 
  imageSrc, 
  onCropComplete, 
  onCancel,
  initialAspectRatio = 4 / 3 
}) {
  const [aspectRatio, setAspectRatio] = useState(initialAspectRatio);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0); // 0, 90, 180, 270
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const containerRef = useRef(null);
  const imgRef = useRef(null);

  // Load and cache image
  useEffect(() => {
    if (!imageSrc) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imgRef.current = img;
      setImageLoaded(true);
      // Reset pan/zoom
      setZoom(1);
      setRotation(0);
      setPan({ x: 0, y: 0 });
    };
    img.onerror = () => {
      alert('Unable to load image for cropping. It may have restrictive permissions.');
      onCancel?.();
    };

    if (typeof imageSrc === 'string') {
      img.src = imageSrc;
    } else if (imageSrc instanceof File || imageSrc instanceof Blob) {
      img.src = URL.createObjectURL(imageSrc);
    }
  }, [imageSrc, onCancel]);

  // Touch / Mouse Drag handlers for panning
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - pan.x,
      y: e.clientY - pan.y
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch event handlers for mobile
  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - pan.x,
        y: e.touches[0].clientY - pan.y
      });
    }
  };

  const handleTouchMove = (e) => {
    if (!isDragging || e.touches.length !== 1) return;
    setPan({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Rotate handlers
  const handleRotateCw = () => {
    sound.playTap();
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleRotateCcw = () => {
    sound.playTap();
    setRotation((prev) => (prev - 90 + 360) % 360);
  };

  // Reset to default
  const handleReset = () => {
    sound.playTap();
    setZoom(1);
    setRotation(0);
    setPan({ x: 0, y: 0 });
    setAspectRatio(4 / 3);
  };

  // Execute Canvas Crop and Export
  const handleApplyCrop = async () => {
    if (!imgRef.current) return;
    setIsProcessing(true);
    sound.playStar();

    try {
      const img = imgRef.current;
      const targetAspect = aspectRatio || (img.naturalWidth / img.naturalHeight);

      // Output resolution (high definition: min 1400px width)
      const outWidth = 1400;
      const outHeight = Math.round(outWidth / targetAspect);

      const canvas = document.createElement('canvas');
      canvas.width = outWidth;
      canvas.height = outHeight;
      const ctx = canvas.getContext('2d');

      if (!ctx) throw new Error('Could not initialize canvas context');

      // Enable high-quality smoothing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Fill background dark
      ctx.fillStyle = '#0a0d14';
      ctx.fillRect(0, 0, outWidth, outHeight);

      ctx.save();
      // Move to canvas center
      ctx.translate(outWidth / 2, outHeight / 2);

      // Apply User Rotation
      ctx.rotate((rotation * Math.PI) / 180);

      // Compute base draw scale to cover canvas
      const isRotated90or270 = rotation === 90 || rotation === 270;
      const imgW = isRotated90or270 ? img.naturalHeight : img.naturalWidth;
      const imgH = isRotated90or270 ? img.naturalWidth : img.naturalHeight;

      const scaleCover = Math.max(outWidth / imgW, outHeight / imgH) * zoom;

      // Translate pan proportional to canvas output scale
      const containerW = containerRef.current ? containerRef.current.clientWidth : 360;
      const panFactor = outWidth / Math.max(containerW, 100);

      const rad = (rotation * Math.PI) / 180;
      const rotatedPanX = pan.x * Math.cos(-rad) - pan.y * Math.sin(-rad);
      const rotatedPanY = pan.x * Math.sin(-rad) + pan.y * Math.cos(-rad);

      ctx.translate(rotatedPanX * panFactor, rotatedPanY * panFactor);

      // Draw original image centered
      ctx.drawImage(
        img,
        (-img.naturalWidth * scaleCover) / 2,
        (-img.naturalHeight * scaleCover) / 2,
        img.naturalWidth * scaleCover,
        img.naturalHeight * scaleCover
      );

      ctx.restore();

      // Convert to blob and trigger completion
      canvas.toBlob((blob) => {
        if (!blob) {
          alert('Failed to generate cropped image');
          setIsProcessing(false);
          return;
        }

        const croppedFile = new File(
          [blob], 
          `cropped-diecast-${Date.now()}.jpg`, 
          { type: 'image/jpeg' }
        );

        onCropComplete(croppedFile, canvas.toDataURL('image/jpeg', 0.92));
      }, 'image/jpeg', 0.92);

    } catch (err) {
      console.error('Cropping error:', err);
      alert('Error cropping image: ' + err.message);
      setIsProcessing(false);
    }
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 350 }} onClick={onCancel}>
      <div 
        className="modal-content modal-lg cropper-modal-container"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '640px', width: '95%' }}
      >
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div 
              style={{ 
                width: 34, 
                height: 34, 
                borderRadius: '50%', 
                background: 'rgba(10, 132, 255, 0.18)', 
                border: '1px solid rgba(10, 132, 255, 0.35)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                color: 'var(--apple-blue)' 
              }}
            >
              <Crop size={17} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Crop & Frame Diecast Photo
              </h3>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
                Drag to reposition • Slide to zoom • Select aspect ratio
              </p>
            </div>
          </div>
          <button className="close-btn" onClick={onCancel} title="Cancel">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body" style={{ gap: '1rem', padding: '1rem 1.15rem' }}>
          
          {/* Aspect Ratio Presets */}
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.45rem' }}>
              Aspect Ratio Presets
            </div>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {ASPECT_RATIOS.map((item, idx) => {
                const isActive = aspectRatio === item.value;
                return (
                  <button
                    key={idx}
                    type="button"
                    className={`btn btn-sm ${isActive ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => {
                      sound.playTap();
                      setAspectRatio(item.value);
                    }}
                    style={{ 
                      padding: '0.35rem 0.75rem', 
                      fontSize: '0.76rem',
                      fontWeight: isActive ? 700 : 500
                    }}
                    title={item.desc}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Crop Viewport Box */}
          <div 
            ref={containerRef}
            className="cropper-viewport-frame"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{
              position: 'relative',
              width: '100%',
              aspectRatio: aspectRatio ? `${aspectRatio}` : '16 / 10',
              maxHeight: '380px',
              backgroundColor: '#05070c',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              cursor: isDragging ? 'grabbing' : 'grab',
              userSelect: 'none',
              border: '2px solid rgba(10, 132, 255, 0.4)',
              boxShadow: 'inset 0 0 40px rgba(0, 0, 0, 0.8), 0 8px 32px rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              touchAction: 'none'
            }}
          >
            {imageLoaded && imgRef.current ? (
              <img
                src={imgRef.current.src}
                alt="Crop preview"
                draggable={false}
                style={{
                  position: 'absolute',
                  maxWidth: 'none',
                  maxHeight: 'none',
                  transform: `translate(${pan.x}px, ${pan.y}px) rotate(${rotation}deg) scale(${zoom})`,
                  transformOrigin: 'center center',
                  transition: isDragging ? 'none' : 'transform 0.15s ease-out',
                  pointerEvents: 'none',
                  userSelect: 'none'
                }}
              />
            ) : (
              <div style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
                Loading image...
              </div>
            )}

            {/* Rule of Thirds Grid Overlay */}
            <div 
              style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.25)',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gridTemplateRows: '1fr 1fr 1fr'
              }}
            >
              <div style={{ borderRight: '1px dashed rgba(255, 255, 255, 0.22)', borderBottom: '1px dashed rgba(255, 255, 255, 0.22)' }} />
              <div style={{ borderRight: '1px dashed rgba(255, 255, 255, 0.22)', borderBottom: '1px dashed rgba(255, 255, 255, 0.22)' }} />
              <div style={{ borderBottom: '1px dashed rgba(255, 255, 255, 0.22)' }} />
              <div style={{ borderRight: '1px dashed rgba(255, 255, 255, 0.22)', borderBottom: '1px dashed rgba(255, 255, 255, 0.22)' }} />
              <div style={{ borderRight: '1px dashed rgba(255, 255, 255, 0.22)', borderBottom: '1px dashed rgba(255, 255, 255, 0.22)' }} />
              <div style={{ borderBottom: '1px dashed rgba(255, 255, 255, 0.22)' }} />
              <div style={{ borderRight: '1px dashed rgba(255, 255, 255, 0.22)' }} />
              <div style={{ borderRight: '1px dashed rgba(255, 255, 255, 0.22)' }} />
              <div />
            </div>

            {/* Floating Guide Badge */}
            <div 
              style={{
                position: 'absolute',
                bottom: '0.65rem',
                left: '0.65rem',
                background: 'rgba(0, 0, 0, 0.65)',
                backdropFilter: 'blur(8px)',
                padding: '0.2rem 0.55rem',
                borderRadius: 'var(--radius-pill)',
                fontSize: '0.68rem',
                fontWeight: 600,
                color: '#fff',
                pointerEvents: 'none'
              }}
            >
              {rotation !== 0 ? `Rotated ${rotation}° • ` : ''}Zoom {zoom.toFixed(1)}x
            </div>
          </div>

          {/* Zoom Slider and Rotation Tool Bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
            
            {/* Zoom Slider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flex: 1, minWidth: '180px' }}>
              <ZoomOut size={15} color="var(--text-tertiary)" />
              <input 
                type="range"
                min="0.8"
                max="3.0"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                style={{ flex: 1, accentColor: 'var(--apple-blue)', cursor: 'pointer' }}
              />
              <ZoomIn size={15} color="var(--text-tertiary)" />
              <span style={{ fontSize: '0.75rem', fontWeight: 600, fontFamily: 'monospace', minWidth: '34px', color: 'var(--text-secondary)' }}>
                {zoom.toFixed(1)}x
              </span>
            </div>

            {/* Rotation & Reset Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button 
                type="button" 
                className="btn btn-secondary btn-sm"
                onClick={handleRotateCcw}
                title="Rotate 90° Counter-Clockwise"
                style={{ padding: '0.35rem 0.6rem' }}
              >
                <RotateCcw size={14} />
              </button>
              <button 
                type="button" 
                className="btn btn-secondary btn-sm"
                onClick={handleRotateCw}
                title="Rotate 90° Clockwise"
                style={{ padding: '0.35rem 0.6rem' }}
              >
                <RotateCw size={14} />
              </button>
              <button 
                type="button" 
                className="btn btn-secondary btn-sm"
                onClick={handleReset}
                title="Reset all transforms"
                style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
              >
                <RefreshCw size={13} style={{ marginRight: '0.25rem' }} />
                Reset
              </button>
            </div>
          </div>

          {/* Action Bar */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button 
              type="button" 
              className="btn btn-secondary btn-sm" 
              onClick={onCancel}
              disabled={isProcessing}
            >
              Cancel
            </button>
            <button 
              type="button" 
              className="btn btn-primary btn-sm" 
              onClick={handleApplyCrop}
              disabled={isProcessing || !imageLoaded}
              style={{ minWidth: '130px' }}
            >
              {isProcessing ? (
                <>
                  <Sparkles size={14} className="spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Check size={14} />
                  <span>Apply & Save Crop</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
