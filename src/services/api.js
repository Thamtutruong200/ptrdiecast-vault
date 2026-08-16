import { createClient } from '@supabase/supabase-js';

// Built-in Production Supabase Credentials (Unified Cloud Database)
const BUILTIN_SUPABASE_URL = 'https://kzrmijhrokdrjmivvxql.supabase.co';
const BUILTIN_SUPABASE_ANON_KEY = 'sb_publishable_HtcJhl5ghYUEhzC3ZyQVrQ_3XFJ4-YA';

function getSupabaseConfig() {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.SUPABASE_KEY || '';

  let localConfig = {};
  try {
    const saved = localStorage.getItem('ptr_supabase_config');
    if (saved) localConfig = JSON.parse(saved);
  } catch (e) {}

  const url = localConfig.url || envUrl || BUILTIN_SUPABASE_URL;
  const key = localConfig.key || envKey || BUILTIN_SUPABASE_ANON_KEY;
  const isConfigured = Boolean(url && key && !url.includes('your-project'));

  return { url, key, isConfigured };
}

let supabaseInstance = null;

export function getSupabase() {
  if (supabaseInstance) return supabaseInstance;
  const { url, key, isConfigured } = getSupabaseConfig();
  if (isConfigured) {
    try {
      supabaseInstance = createClient(url, key);
      return supabaseInstance;
    } catch (e) {
      console.warn('Failed to init Supabase browser client:', e);
      return null;
    }
  }
  return null;
}

export function saveSupabaseConfig(url, key) {
  localStorage.setItem('ptr_supabase_config', JSON.stringify({ url: url.trim(), key: key.trim() }));
  supabaseInstance = null;
  return getSupabase();
}

export function clearSupabaseConfig() {
  localStorage.removeItem('ptr_supabase_config');
  supabaseInstance = null;
}

// Default local mock data (empty by default so Supabase cloud is the single source of truth)
let MOCK_DATA = [];

export function formatVND(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0
  }).format(amount);
}

// Client-Side Canvas Image Compression for Lightning-Fast Supabase Storage
async function compressImage(file, maxDimension = 1920, quality = 0.85) {
  // If not an image or already very small (< 150KB), return as is
  if (!file.type.startsWith('image/') || file.size < 150 * 1024) {
    return file;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const optimizedFile = new File([blob], file.name.replace(/\.[^/.]+$/, ".jpg"), {
                type: 'image/jpeg',
                lastModified: Date.now()
              });
              resolve(optimizedFile);
            } else {
              resolve(file);
            }
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => resolve(file);
      img.src = e.target.result;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}

// UUID v4 Generator for PostgreSQL Compliance
export function generateUUID() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    try {
      return crypto.randomUUID();
    } catch (e) {}
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Local Storage Persistent Store & Deletion Blacklist Helpers
const STORAGE_KEY = 'ptr_vault_items_v2';
const DELETED_IDS_KEY = 'ptr_deleted_ids';

function getDeletedIds() {
  try {
    const saved = localStorage.getItem(DELETED_IDS_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    return [];
  }
}

function addDeletedId(id) {
  try {
    const deleted = getDeletedIds();
    if (!deleted.includes(id)) {
      deleted.push(id);
      localStorage.setItem(DELETED_IDS_KEY, JSON.stringify(deleted));
    }
  } catch (e) {}
}

function loadLocalItems() {
  const deletedIds = getDeletedIds();
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.filter(x => !deletedIds.includes(x.id));
      }
    }
  } catch (e) {}
  return MOCK_DATA.filter(x => !deletedIds.includes(x.id));
}

function saveLocalItems(items) {
  try {
    const deletedIds = getDeletedIds();
    const cleanItems = (items || []).filter(x => !deletedIds.includes(x.id));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanItems));
  } catch (e) {}
}

export const api = {
  // Check Connection Status
  async checkConnectionStatus() {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { error } = await supabase.from('diecasts').select('id').limit(1);
        if (!error) {
          return { connected: true, source: 'supabase_direct' };
        }
      } catch (e) {}
    }

    try {
      const res = await fetch('/api/health').then(r => r.json());
      if (res.status === 'healthy') {
        return { connected: Boolean(res.supabase_connected), source: 'fastapi_backend' };
      }
    } catch (e) {}

    return { connected: false, source: 'local_fallback' };
  },

  // Fetch Items by Category & Filters (With Automatic Background Cloud Sync)
  async getItems(filters = {}, category = 'diecast') {
    const supabase = getSupabase();
    const deletedIds = getDeletedIds();
    let items = [];
    let isFromCloud = false;

    if (supabase) {
      try {
        const { data, error } = await supabase.from('diecasts').select('*');
        if (!error && Array.isArray(data)) {
          isFromCloud = true;
          // Auto-purge any blacklisted deleted items from Supabase in the background
          if (deletedIds.length > 0) {
            const staleRows = data.filter(x => deletedIds.includes(x.id));
            if (staleRows.length > 0) {
              const staleIds = staleRows.map(r => r.id);
              supabase.from('diecasts').delete().in('id', staleIds).then(() => {});
            }
          }

          // Clean out unwanted demo test rows from Supabase
          const testRows = data.filter(x => x.casting_name === 'hacked by mdl' || x.casting_name === '956');
          if (testRows.length > 0) {
            testRows.forEach(tr => {
              supabase.from('diecasts').delete().eq('id', tr.id).then(() => {});
            });
          }

          // Filter out deleted IDs
          const cleanCloudItems = data.filter(x => !deletedIds.includes(x.id) && x.casting_name !== 'hacked by mdl' && x.casting_name !== '956');

          // Auto-upload any locally created items that haven't reached Supabase yet
          const local = loadLocalItems();
          const cloudIds = new Set(cleanCloudItems.map(x => x.id));
          const unsyncedLocal = local.filter(x => !cloudIds.has(x.id) && !deletedIds.includes(x.id) && x.casting_name !== 'hacked by mdl' && x.casting_name !== '956');

          if (unsyncedLocal.length > 0) {
            // Silently upload unsynced items to Supabase
            unsyncedLocal.forEach(it => {
              const validUUID = (it.id && it.id.includes('-') && it.id.length >= 32) ? it.id : generateUUID();
              const uploadPayload = { ...it, id: validUUID };
              supabase.from('diecasts').insert([uploadPayload]).then(() => {});
            });
          }

          items = cleanCloudItems.length > 0 ? cleanCloudItems : unsyncedLocal;
          saveLocalItems(items);
        } else if (error) {
          console.warn('Supabase getItems notice:', error.message);
        }
      } catch (e) {
        console.warn('Supabase fetch exception:', e);
      }
    }

    if (!isFromCloud || items.length === 0) {
      items = loadLocalItems();
    }

    // Category filtering
    let res = items;
    if (category && category !== 'all') {
      res = res.filter(x => (x.category || 'diecast') === category);
    }

    // Dynamic Filter properties
    if (filters.scale && filters.scale !== 'All') {
      res = res.filter(x => x.scale === filters.scale);
    }
    if (filters.brand && filters.brand !== 'All') {
      res = res.filter(x => x.brand === filters.brand);
    }
    if (filters.condition && filters.condition !== 'All') {
      res = res.filter(x => x.condition === filters.condition);
    }
    if (filters.is_favorite !== undefined && filters.is_favorite !== null) {
      res = res.filter(x => x.is_favorite === filters.is_favorite);
    }
    if (filters.q) {
      const q = filters.q.toLowerCase().trim();
      res = res.filter(x => 
        (x.casting_name && x.casting_name.toLowerCase().includes(q)) ||
        (x.brand && x.brand.toLowerCase().includes(q)) ||
        (x.livery && x.livery.toLowerCase().includes(q)) ||
        (x.notes && x.notes.toLowerCase().includes(q))
      );
    }

    // Sort order
    const reverse = (filters.sort_order || 'desc').toLowerCase() === 'desc';
    if (filters.sort_by === 'current_value') {
      res.sort((a, b) => reverse ? (b.current_value - a.current_value) : (a.current_value - b.current_value));
    } else if (filters.sort_by === 'purchase_price') {
      res.sort((a, b) => reverse ? (b.purchase_price - a.purchase_price) : (a.purchase_price - b.purchase_price));
    } else if (filters.sort_by === 'casting_name') {
      res.sort((a, b) => reverse ? (b.casting_name || '').localeCompare(a.casting_name || '') : (a.casting_name || '').localeCompare(b.casting_name || ''));
    } else {
      res.sort((a, b) => reverse ? ((b.created_at || '').localeCompare(a.created_at || '')) : ((a.created_at || '').localeCompare(b.created_at || '')));
    }

    return res;
  },

  // Get Stats for category
  async getStats(category = 'diecast') {
    const items = await this.getItems({}, category);
    const totalCount = items.length;
    const totalPaid = items.reduce((acc, it) => acc + (Number(it.purchase_price) || 0), 0);
    const totalValue = items.reduce((acc, it) => acc + (Number(it.current_value) || 0), 0);
    const totalProfit = totalValue - totalPaid;
    const profitPct = totalPaid > 0 ? (totalProfit / totalPaid) * 100 : 0;

    const scaleCounts = {};
    const brandCounts = {};
    const conditionCounts = {};
    let favCount = 0;
    let topGainer = null;
    let maxGain = -1;

    items.forEach(it => {
      const sc = it.scale || 'Other';
      scaleCounts[sc] = (scaleCounts[sc] || 0) + 1;

      const br = it.brand || 'Other';
      brandCounts[br] = (brandCounts[br] || 0) + 1;

      const cond = it.condition || 'Other';
      conditionCounts[cond] = (conditionCounts[cond] || 0) + 1;

      if (it.is_favorite) favCount++;

      const gain = (Number(it.current_value) || 0) - (Number(it.purchase_price) || 0);
      if (gain > maxGain) {
        maxGain = gain;
        topGainer = it;
      }
    });

    return {
      total_count: totalCount,
      total_paid: totalPaid,
      total_value: totalValue,
      total_profit: totalProfit,
      profit_percentage: Number(profitPct.toFixed(1)),
      scale_breakdown: scaleCounts,
      brand_breakdown: brandCounts,
      condition_breakdown: conditionCounts,
      favorites_count: favCount,
      top_gainer: topGainer
    };
  },

  // Create Item (Guaranteed UUID & Multi-Table Fallback)
  async createItem(itemData) {
    const validUUID = (itemData.id && itemData.id.includes('-') && itemData.id.length >= 32)
      ? itemData.id
      : generateUUID();

    const payload = {
      id: validUUID,
      category: itemData.category || 'diecast',
      brand: itemData.brand || 'Minichamps',
      scale: itemData.scale || '1:64',
      casting_name: itemData.casting_name || 'Untitled Model',
      livery: itemData.livery || '',
      color: itemData.color || '',
      era: itemData.era || '',
      condition: itemData.condition || 'Mint in Box',
      purchase_price: Number(itemData.purchase_price) || 0,
      current_value: Number(itemData.current_value) || 0,
      valuation_source: itemData.valuation_source || 'Market Comps (eBay / Auctions)',
      notes: itemData.notes || '',
      photos: Array.isArray(itemData.photos) ? itemData.photos : [],
      track_photos: Array.isArray(itemData.track_photos) ? itemData.track_photos : [],
      reference_photos: Array.isArray(itemData.reference_photos) ? itemData.reference_photos : [],
      is_favorite: Boolean(itemData.is_favorite),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // 1. Immediately persist to Local Store
    const local = loadLocalItems();
    saveLocalItems([payload, ...local.filter(x => x.id !== payload.id)]);

    // 2. Synchronize to Supabase
    const supabase = getSupabase();
    if (supabase) {
      try {
        // Attempt 1: Full payload insert
        const { data, error } = await supabase.from('diecasts').insert([payload]).select();
        if (!error && data && data.length > 0) {
          const created = data[0];
          saveLocalItems([created, ...local.filter(x => x.id !== created.id)]);
          return created;
        }

        // Attempt 2: If Postgres table is missing category or track_photos column, strip them and insert
        if (error) {
          console.warn('Full insert failed, retrying legacy schema insert:', error.message);
          const legacyPayload = { ...payload };
          delete legacyPayload.category;
          delete legacyPayload.track_photos;
          const { data: legData, error: legErr } = await supabase.from('diecasts').insert([legacyPayload]).select();
          if (!legErr && legData && legData.length > 0) {
            const merged = { ...legData[0], category: payload.category, track_photos: payload.track_photos };
            saveLocalItems([merged, ...local.filter(x => x.id !== merged.id)]);
            return merged;
          }
        }
      } catch (e) {
        console.warn('Supabase createItem exception:', e);
      }
    }

    return payload;
  },

  // Update Item
  async updateItem(id, itemData) {
    const payload = {
      ...itemData,
      updated_at: new Date().toISOString()
    };

    // 1. Immediately update Local Store
    const local = loadLocalItems();
    const updatedList = local.map(x => x.id === id ? { ...x, ...payload } : x);
    saveLocalItems(updatedList);

    // 2. Synchronize to Supabase
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('diecasts').update(payload).eq('id', id).select();
        if (!error && data && data.length > 0) {
          const updated = data[0];
          saveLocalItems(local.map(x => x.id === id ? { ...x, ...updated } : x));
          return updated;
        }

        if (error) {
          const legacyPayload = { ...payload };
          delete legacyPayload.category;
          delete legacyPayload.track_photos;
          const { data: legData } = await supabase.from('diecasts').update(legacyPayload).eq('id', id).select();
          if (legData && legData.length > 0) {
            return { ...legData[0], ...payload };
          }
        }
      } catch (e) {
        console.warn('Supabase updateItem exception:', e);
      }
    }

    const found = updatedList.find(x => x.id === id);
    return found || { id, ...payload };
  },

  // Delete Item
  async deleteItem(id) {
    // 1. Blacklist ID so it can NEVER return locally
    addDeletedId(id);

    // 2. Remove from local store immediately
    const local = loadLocalItems();
    const targetItem = local.find(x => x.id === id);
    const filtered = local.filter(x => x.id !== id);
    saveLocalItems(filtered);

    // 3. Delete from Supabase
    const supabase = getSupabase();
    if (supabase) {
      try {
        // Attempt delete by ID
        const { error } = await supabase.from('diecasts').delete().eq('id', id);
        if (error && targetItem?.casting_name) {
          // If ID was legacy format, fallback delete by casting_name & brand
          await supabase.from('diecasts').delete().eq('casting_name', targetItem.casting_name).eq('brand', targetItem.brand);
        }
      } catch (e) {
        console.warn('Supabase delete exception:', e);
      }
    }

    return true;
  },

  // 1-Click Master Cloud Sync: Push current local vault to Supabase so ALL devices match immediately
  async syncLocalToCloud() {
    const supabase = getSupabase();
    if (!supabase) {
      return { success: false, error: 'Supabase not connected' };
    }

    const localItems = loadLocalItems();
    try {
      // 1. Clear stale rows in Supabase
      await supabase.from('diecasts').delete().neq('casting_name', '__dummy_impossible_name__');

      // 2. Format items with valid UUIDs
      const formatted = localItems.map(it => ({
        id: (it.id && it.id.includes('-') && it.id.length >= 32) ? it.id : generateUUID(),
        category: it.category || 'diecast',
        brand: it.brand || 'Minichamps',
        scale: it.scale || '1:64',
        casting_name: it.casting_name || 'Model',
        livery: it.livery || '',
        color: it.color || '',
        era: it.era || '',
        condition: it.condition || 'Mint in Box',
        purchase_price: Number(it.purchase_price) || 0,
        current_value: Number(it.current_value) || 0,
        valuation_source: it.valuation_source || 'Market Comps (eBay / Auctions)',
        notes: it.notes || '',
        photos: Array.isArray(it.photos) ? it.photos : [],
        track_photos: Array.isArray(it.track_photos) ? it.track_photos : [],
        reference_photos: Array.isArray(it.reference_photos) ? it.reference_photos : [],
        is_favorite: Boolean(it.is_favorite),
        created_at: it.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      // 3. Insert active local items
      if (formatted.length > 0) {
        const { error: insErr } = await supabase.from('diecasts').insert(formatted);
        if (insErr) {
          // If custom columns failed, try legacy
          const legacy = formatted.map(f => {
            const copy = { ...f };
            delete copy.category;
            delete copy.track_photos;
            return copy;
          });
          await supabase.from('diecasts').insert(legacy);
        }
      }

      // Update local storage with cleaned valid UUID items
      saveLocalItems(formatted);
      return { success: true, count: formatted.length };
    } catch (e) {
      console.error('syncLocalToCloud exception:', e);
      return { success: false, error: e.message };
    }
  },

  // Bulk Commit for Excel Spreadsheet Editor
  async bulkCommit(updatedItems) {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('diecasts').upsert(updatedItems, { onConflict: 'id' }).select();
        if (!error) {
          saveLocalItems(data || updatedItems);
          return { success: true, count: data?.length || updatedItems.length };
        }
      } catch (e) {
        console.warn('Supabase bulkCommit error:', e);
      }
    }

    saveLocalItems(updatedItems);
    return { success: true, count: updatedItems.length };
  },

  // Upload Single Photo to Supabase Object Storage
  async uploadPhoto(file) {
    // 1. Optimize / compress image before upload
    const optimizedFile = await compressImage(file);

    const supabase = getSupabase();
    if (supabase) {
      try {
        const cleanName = optimizedFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const filename = `vault-${Date.now()}-${cleanName}`;
        
        const { data, error } = await supabase.storage.from('diecast-photos').upload(filename, optimizedFile, {
          cacheControl: '31536000', // 1 year cache
          contentType: optimizedFile.type || 'image/jpeg',
          upsert: true
        });

        if (!error && data) {
          const { data: pubData } = supabase.storage.from('diecast-photos').getPublicUrl(filename);
          return { url: pubData.publicUrl, filename };
        } else if (error) {
          console.warn('Supabase storage upload error:', error.message);
        }
      } catch (e) {
        console.warn('Supabase storage upload exception:', e);
      }
    }

    // Fallback: convert to base64 Data URL
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve({ url: e.target.result, filename: file.name });
      };
      reader.readAsDataURL(optimizedFile);
    });
  },

  // Check Duplicate
  async checkDuplicate(castingName, brand = '', livery = '', excludeId = null) {
    const items = await this.getItems({}, 'all');
    const targetC = (castingName || '').trim().toLowerCase();
    const targetB = (brand || '').trim().toLowerCase();
    const targetL = (livery || '').trim().toLowerCase();

    const matches = items.filter(item => {
      if (excludeId && item.id === excludeId) return false;
      const ic = (item.casting_name || '').trim().toLowerCase();
      const ib = (item.brand || '').trim().toLowerCase();
      const il = (item.livery || '').trim().toLowerCase();

      if (targetC && (targetC === ic || targetC.includes(ic) || ic.includes(targetC))) {
        if (targetB && ib && (targetB.includes(ib) || ib.includes(targetB))) return true;
        if (targetL && il && (targetL.includes(il) || il.includes(targetL))) return true;
        if (!targetB && !targetL) return true;
      }
      return false;
    });

    return {
      is_duplicate: matches.length > 0,
      matching_items: matches
    };
  }
};

