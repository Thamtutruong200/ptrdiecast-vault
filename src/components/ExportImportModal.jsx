import React, { useState, useEffect, useRef } from 'react';
import { 
  X, ArrowDownToLine, UploadCloud, FileSpreadsheet, FileJson, Check, Loader2, Database, ShieldCheck, Link2, CheckCircle2, AlertCircle 
} from 'lucide-react';
import { api, saveSupabaseConfig, clearSupabaseConfig } from '../services/api';
import { sound } from '../services/soundEffects';

export default function ExportImportModal({ items, onClose, onRefresh }) {
  const [isImporting, setIsImporting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('ptr_supabase_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        setSupabaseUrl(parsed.url || '');
        setSupabaseKey(parsed.key || '');
      }
    } catch (e) {}

    api.checkConnectionStatus().then(status => {
      setConnectionStatus(status);
    });
  }, []);

  // Handle Supabase Direct Connect
  const handleConnectSupabase = async (e) => {
    e.preventDefault();
    if (!supabaseUrl.trim() || !supabaseKey.trim()) {
      alert('Please enter both Supabase Project URL and anon/service_role API Key.');
      return;
    }

    setIsConnecting(true);
    setStatusMessage(null);

    try {
      saveSupabaseConfig(supabaseUrl, supabaseKey);
      const status = await api.checkConnectionStatus();
      setConnectionStatus(status);

      if (status.connected) {
        sound.playStar();
        setStatusMessage('Successfully connected to Supabase PostgreSQL & Storage Cloud!');
        if (onRefresh) onRefresh();
      } else {
        alert('Could not verify connection to Supabase. Please check your Project URL and anon API key.');
      }
    } catch (err) {
      alert('Connection error: ' + err.message);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnectSupabase = () => {
    clearSupabaseConfig();
    setSupabaseUrl('');
    setSupabaseKey('');
    setConnectionStatus({ connected: false, source: 'local_fallback' });
    setStatusMessage('Switched back to Local Vault storage.');
    if (onRefresh) onRefresh();
  };

  // Export JSON
  const handleExportJSON = () => {
    sound.playTap();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(items, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `diecast-vault-backup-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Export CSV
  const handleExportCSV = () => {
    sound.playTap();
    const headers = [
      'Brand',
      'Scale',
      'Casting Name',
      'Livery',
      'Color',
      'Era',
      'Condition',
      'Purchase Price (VND)',
      'Current Value (VND)',
      'Valuation Source',
      'Notes'
    ];

    const rows = items.map(item => [
      `"${(item.brand || '').replace(/"/g, '""')}"`,
      `"${(item.scale || '').replace(/"/g, '""')}"`,
      `"${(item.casting_name || '').replace(/"/g, '""')}"`,
      `"${(item.livery || '').replace(/"/g, '""')}"`,
      `"${(item.color || '').replace(/"/g, '""')}"`,
      `"${(item.era || '').replace(/"/g, '""')}"`,
      `"${(item.condition || '').replace(/"/g, '""')}"`,
      item.purchase_price || 0,
      item.current_value || 0,
      `"${(item.valuation_source || '').replace(/"/g, '""')}"`,
      `"${(item.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `diecast-collection-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  // Import File
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setStatusMessage(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target.result;
        let importedItems = [];

        if (file.name.endsWith('.json')) {
          importedItems = JSON.parse(text);
        } else if (file.name.endsWith('.csv')) {
          const lines = text.split('\n').filter(l => l.trim().length > 0);
          if (lines.length > 1) {
            for (let i = 1; i < lines.length; i++) {
              const cols = lines[i].split(',').map(c => c.replace(/^"|"$/g, '').trim());
              if (cols.length >= 3 && cols[2]) {
                importedItems.push({
                  brand: cols[0] || 'Hot Wheels',
                  scale: cols[1] || '1:64',
                  casting_name: cols[2],
                  livery: cols[3] || '',
                  color: cols[4] || '',
                  era: cols[5] || '',
                  condition: cols[6] || 'Mint in Box',
                  purchase_price: Number(cols[7]) || 0,
                  current_value: Number(cols[8]) || 0,
                  valuation_source: cols[9] || 'Market Comps (eBay / Auctions)',
                  notes: cols[10] || '',
                  photos: [],
                  reference_photos: []
                });
              }
            }
          }
        }

        if (importedItems.length === 0) {
          throw new Error('No valid diecast items found in file.');
        }

        const res = await api.bulkImport(importedItems);
        setStatusMessage(`Successfully imported ${res.length} models into vault.`);
        if (onRefresh) onRefresh();
      } catch (err) {
        alert('Import failed: ' + err.message);
      } finally {
        setIsImporting(false);
      }
    };

    reader.readAsText(file);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Database size={20} color="var(--apple-blue)" />
            <h2 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', fontWeight: 700 }}>
              Cloud Database Sync & Backup
            </h2>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ gap: '1.5rem' }}>
          {statusMessage && (
            <div style={{ background: 'rgba(48, 209, 88, 0.15)', border: '1px solid rgba(48, 209, 88, 0.4)', borderRadius: 'var(--radius-md)', padding: '0.85rem 1.15rem', color: '#34d399', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
              <CheckCircle2 size={18} />
              <span>{statusMessage}</span>
            </div>
          )}

          {/* Section 1: Supabase Direct Connect */}
          <div style={{ background: 'rgba(255, 255, 255, 0.04)', borderRadius: 'var(--radius-lg)', border: 'var(--glass-border)', padding: '1.35rem', boxShadow: 'var(--glass-specular)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Link2 size={16} color="var(--apple-blue)" />
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Supabase Cloud Connection
                </h3>
              </div>

              {connectionStatus?.connected ? (
                <span className="gain-badge positive" style={{ fontSize: '0.72rem' }}>
                  ● Connected to Supabase Cloud
                </span>
              ) : (
                <span className="gain-badge" style={{ background: 'rgba(255, 214, 10, 0.15)', color: 'var(--apple-amber)', fontSize: '0.72rem' }}>
                  ● Local Vault (Offline)
                </span>
              )}
            </div>

            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1rem' }}>
              Paste your Supabase credentials below to sync your collection in real-time across your phone and computer.
            </p>

            <form onSubmit={handleConnectSupabase} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '0.3rem' }}>
                  Supabase Project URL
                </label>
                <input 
                  type="url"
                  className="form-control"
                  placeholder="https://abcdefghijkl.supabase.co"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '0.3rem' }}>
                  Supabase Anon / Public API Key
                </label>
                <input 
                  type="password"
                  className="form-control font-mono"
                  placeholder="eyJhbGciOi..."
                  value={supabaseKey}
                  onChange={(e) => setSupabaseKey(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.4rem' }}>
                <button type="submit" className="btn btn-primary btn-sm" disabled={isConnecting}>
                  {isConnecting ? <Loader2 size={14} className="animate-spin" /> : <Database size={14} />}
                  <span>{isConnecting ? 'Verifying...' : 'Connect Cloud Vault'}</span>
                </button>

                {connectionStatus?.connected && (
                  <button type="button" className="btn btn-secondary btn-sm" onClick={handleDisconnectSupabase}>
                    Disconnect
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Section 2: Export Options */}
          <div>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
              Export Vault Offline Backup
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <button className="btn btn-secondary" onClick={handleExportJSON}>
                <FileJson size={16} color="var(--apple-amber)" />
                <span>Export JSON</span>
              </button>

              <button className="btn btn-secondary" onClick={handleExportCSV}>
                <FileSpreadsheet size={16} color="var(--apple-green)" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Section 3: Import Section */}
          <div>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
              Import Collection
            </h3>
            <div 
              className="upload-dropzone" 
              onClick={() => fileInputRef.current?.click()}
              style={{ padding: '1.5rem' }}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                accept=".json,.csv" 
                style={{ display: 'none' }} 
              />
              {isImporting ? (
                <Loader2 size={24} className="animate-spin" color="var(--apple-blue)" />
              ) : (
                <UploadCloud size={24} color="var(--text-tertiary)" />
              )}
              <div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                  {isImporting ? 'Importing models to vault...' : 'Upload JSON or CSV File'}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.15rem' }}>
                  Supports exported backups and spreadsheets
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
