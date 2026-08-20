import React, { useState, useEffect } from 'react';
import { 
  X, FileSpreadsheet, Plus, Trash2, Save, Download, Upload, 
  Search, CheckCircle2, AlertCircle, Loader2, Sparkles, RefreshCw, Copy 
} from 'lucide-react';
import { api, formatVND } from '../services/api';
import { sound } from '../services/soundEffects';

export default function ExcelSheetModal({ items, onClose, onRefresh, activeCategory = 'diecast' }) {
  const [sheetData, setSheetData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [dirty, setDirty] = useState(false);

  // Initialize sheet rows from collection items
  useEffect(() => {
    if (items) {
      // Clone items so we can edit in place
      setSheetData(items.map(it => ({ ...it })));
    }
  }, [items]);

  // Handle cell edit
  const handleCellChange = (index, field, value) => {
    setSheetData(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: value
      };
      return updated;
    });
    setDirty(true);
  };

  // Add a new empty row
  const handleAddRow = () => {
    sound.playTap();
    const newRow = {
      id: 'sheet-new-' + Date.now() + Math.random().toString(36).substring(2, 5),
      category: activeCategory,
      brand: activeCategory === 'diecast' ? 'Minichamps' : 'Lego',
      scale: activeCategory === 'diecast' ? '1:64' : '1:8',
      casting_name: 'New Item Model ' + (sheetData.length + 1),
      livery: '',
      color: '',
      era: activeCategory === 'diecast' ? 'Modern GT3' : 'Flagship Set',
      condition: 'Mint in Box',
      purchase_price: 0,
      current_value: 0,
      valuation_source: 'Market Comps (eBay / Auctions)',
      notes: '',
      photos: [],
      track_photos: [],
      reference_photos: [],
      is_favorite: false
    };

    setSheetData(prev => [newRow, ...prev]);
    setDirty(true);
  };

  // Duplicate Row
  const handleDuplicateRow = (index) => {
    sound.playTap();
    const source = sheetData[index];
    const cloned = {
      ...source,
      id: 'sheet-clone-' + Date.now() + Math.random().toString(36).substring(2, 5),
      casting_name: `${source.casting_name} (Copy)`
    };
    setSheetData(prev => {
      const updated = [...prev];
      updated.splice(index + 1, 0, cloned);
      return updated;
    });
    setDirty(true);
  };

  // Delete Row
  const handleDeleteRow = (index) => {
    sound.playTap();
    setSheetData(prev => prev.filter((_, i) => i !== index));
    setDirty(true);
  };

  // Commit & Publish to Cloud Vault
  const handleCommitAndPublish = async () => {
    sound.playStar();
    setIsSaving(true);
    setSaveStatus(null);

    try {
      // Validate sheet rows
      const cleaned = sheetData.map(row => ({
        ...row,
        purchase_price: Number(row.purchase_price) || 0,
        current_value: Number(row.current_value) || 0,
        updated_at: new Date().toISOString()
      }));

      const res = await api.bulkCommit(cleaned);
      if (res.success) {
        setSaveStatus(`Successfully committed ${cleaned.length} records to Cloud Vault.`);
        setDirty(false);
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      alert('Commit failed: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Export CSV from Sheet
  const handleExportCSV = () => {
    sound.playTap();
    const headers = ['Category', 'Brand', 'Scale', 'Casting Name', 'Livery', 'Era', 'Condition', 'Purchase Price', 'Notes'];
    const rows = sheetData.map(r => [
      r.category || 'diecast',
      r.brand || '',
      r.scale || '',
      `"${(r.casting_name || '').replace(/"/g, '""')}"`,
      `"${(r.livery || '').replace(/"/g, '""')}"`,
      `"${(r.era || '').replace(/"/g, '""')}"`,
      r.condition || '',
      r.purchase_price || 0,
      `"${(r.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `vault-excel-export-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const filteredSheet = sheetData.filter(row => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (row.casting_name || '').toLowerCase().includes(q) ||
      (row.brand || '').toLowerCase().includes(q) ||
      (row.livery || '').toLowerCase().includes(q) ||
      (row.notes || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="modal-overlay excel-editor-overlay" onClick={onClose}>
      <div className="modal-content excel-editor-modal" onClick={(e) => e.stopPropagation()}>
        {/* Top Spreadsheet Bar */}
        <div className="excel-top-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="excel-icon-badge">
              <FileSpreadsheet size={20} color="#34d399" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h2 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', fontWeight: 700 }}>
                  Live Data Spreadsheet Editor
                </h2>
                {dirty && (
                  <span className="gain-badge" style={{ background: 'rgba(255, 159, 10, 0.2)', color: 'var(--apple-amber)', fontSize: '0.7rem' }}>
                    ● Unsaved Edits
                  </span>
                )}
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                Edit cells directly like Excel • Click <strong>Commit & Publish</strong> to sync live with Cloud Database
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <button 
              type="button" 
              className="btn btn-secondary btn-sm"
              onClick={handleAddRow}
              title="Add a new blank row"
            >
              <Plus size={14} />
              <span>Add Row</span>
            </button>

            <button 
              type="button" 
              className="btn btn-secondary btn-sm"
              onClick={handleExportCSV}
              title="Export as CSV spreadsheet"
            >
              <Download size={14} />
              <span>Export CSV</span>
            </button>

            <button 
              type="button" 
              className="btn btn-primary btn-sm"
              onClick={handleCommitAndPublish}
              disabled={isSaving}
              style={{ background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none' }}
            >
              {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              <span>{isSaving ? 'Publishing...' : 'Commit & Publish to Cloud'}</span>
            </button>

            <button className="close-btn" onClick={onClose}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Search & Filter Bar inside Sheet */}
        <div className="excel-filter-strip">
          <div className="excel-search-box">
            <Search size={14} color="var(--text-tertiary)" />
            <input 
              type="text"
              placeholder="Search spreadsheet rows..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Showing <strong>{filteredSheet.length}</strong> of <strong>{sheetData.length}</strong> rows
          </div>

          {saveStatus && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#34d399', fontSize: '0.8rem', marginLeft: 'auto' }}>
              <CheckCircle2 size={14} />
              <span>{saveStatus}</span>
            </div>
          )}
        </div>

        {/* Main Editable Spreadsheet Table Grid */}
        <div className="excel-table-container">
          <table className="excel-grid-table">
            <thead>
              <tr>
                <th style={{ width: '40px', textAlign: 'center' }}>#</th>
                <th style={{ minWidth: '110px' }}>Category</th>
                <th style={{ minWidth: '150px' }}>Brand / Maker</th>
                <th style={{ minWidth: '90px' }}>Scale / Type</th>
                <th style={{ minWidth: '220px' }}>Model / Casting Name</th>
                <th style={{ minWidth: '180px' }}>Livery / Edition</th>
                <th style={{ minWidth: '150px' }}>Era / Series</th>
                <th style={{ minWidth: '150px' }}>Condition</th>
                <th style={{ minWidth: '160px' }}>Driver / Pilot</th>
                <th style={{ minWidth: '260px' }}>Collector Notes</th>
                <th style={{ width: '80px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSheet.map((row, index) => (
                <tr key={row.id || index}>
                  {/* Row index */}
                  <td style={{ textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.75rem', background: 'rgba(255,255,255,0.02)' }}>
                    {index + 1}
                  </td>

                  {/* Category */}
                  <td>
                    <select
                      className="excel-cell-input"
                      value={row.category || 'diecast'}
                      onChange={(e) => handleCellChange(index, 'category', e.target.value)}
                    >
                      <option value="diecast">🏎️ Diecast</option>
                      <option value="toys">🧸 Toys & Sets</option>
                    </select>
                  </td>

                  {/* Brand */}
                  <td>
                    <input 
                      type="text"
                      className="excel-cell-input"
                      value={row.brand || ''}
                      onChange={(e) => handleCellChange(index, 'brand', e.target.value)}
                    />
                  </td>

                  {/* Scale */}
                  <td>
                    <input 
                      type="text"
                      className="excel-cell-input"
                      value={row.scale || ''}
                      onChange={(e) => handleCellChange(index, 'scale', e.target.value)}
                    />
                  </td>

                  {/* Model / Casting Name */}
                  <td>
                    <input 
                      type="text"
                      className="excel-cell-input font-semibold"
                      value={row.casting_name || ''}
                      onChange={(e) => handleCellChange(index, 'casting_name', e.target.value)}
                    />
                  </td>

                  {/* Livery */}
                  <td>
                    <input 
                      type="text"
                      className="excel-cell-input"
                      value={row.livery || ''}
                      onChange={(e) => handleCellChange(index, 'livery', e.target.value)}
                    />
                  </td>

                  {/* Era */}
                  <td>
                    <input 
                      type="text"
                      className="excel-cell-input"
                      value={row.era || ''}
                      onChange={(e) => handleCellChange(index, 'era', e.target.value)}
                    />
                  </td>

                  {/* Condition */}
                  <td>
                    <select
                      className="excel-cell-input"
                      value={row.condition || 'Mint in Box'}
                      onChange={(e) => handleCellChange(index, 'condition', e.target.value)}
                    >
                      <option value="Mint in Box">Mint in Box</option>
                      <option value="Mint in Sealed Box">Mint in Sealed Box</option>
                      <option value="Loose Mint">Loose Mint</option>
                      <option value="Displayed">Displayed</option>
                      <option value="Custom">Custom</option>
                      <option value="Fair / Playwear">Fair / Playwear</option>
                    </select>
                  </td>

                  {/* Driver / Pilot */}
                  <td>
                    <input 
                      type="text"
                      className="excel-cell-input"
                      value={row.driver || row.notes?.match(/Driver(?:\(s\))?:\s*([^\n\r|]+)/i)?.[1]?.trim() || ''}
                      onChange={(e) => handleCellChange(index, 'driver', e.target.value)}
                      placeholder="e.g. Dale Earnhardt"
                    />
                  </td>

                  {/* Collector Notes */}
                  <td>
                    <input 
                      type="text"
                      className="excel-cell-input"
                      value={row.notes || ''}
                      onChange={(e) => handleCellChange(index, 'notes', e.target.value)}
                    />
                  </td>

                  {/* Actions */}
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', gap: '0.25rem' }}>
                      <button
                        type="button"
                        className="btn btn-secondary btn-icon"
                        style={{ width: 24, height: 24 }}
                        onClick={() => handleDuplicateRow(index)}
                        title="Duplicate row"
                      >
                        <Copy size={11} />
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary btn-icon"
                        style={{ width: 24, height: 24, color: 'var(--apple-red)' }}
                        onClick={() => handleDeleteRow(index)}
                        title="Delete row"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Summary Strip */}
        <div className="excel-footer-strip">
          <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.8125rem' }}>
            <span>Total Rows: <strong>{sheetData.length}</strong></span>
            <span>Total Invested: <strong>{formatVND(sheetData.reduce((acc, r) => acc + (Number(r.purchase_price) || 0), 0))}</strong></span>
            <span>Total Valuation: <strong style={{ color: '#34d399' }}>{formatVND(sheetData.reduce((acc, r) => acc + (Number(r.current_value) || 0), 0))}</strong></span>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn btn-secondary btn-sm" onClick={onClose}>
              Close Sheet
            </button>
            <button className="btn btn-primary btn-sm" onClick={handleCommitAndPublish} disabled={isSaving}>
              {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              <span>Commit & Publish Changes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
