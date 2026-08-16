/**
 * PTR MOTORSPORT DIECAST & TOYS VAULT
 * Cloud-Native Supabase API Client
 * Direct Real-Time Cloud Engine (Zero Cache Flapping)
 */

import { createClient } from '@supabase/supabase-js';

// Production Supabase Cloud Credentials
export const SUPABASE_URL = 'https://kzrmijhrokdrjmivvxql.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_HtcJhl5ghYUEhzC3ZyQVrQ_3XFJ4-YA';

// Auto-purge obsolete local caches to prevent cross-browser desync
try {
  localStorage.removeItem('ptr_vault_items_v2');
  localStorage.removeItem('ptr_vault_items');
  localStorage.removeItem('ptr_deleted_ids');
  localStorage.removeItem('ptr_edited_items');
} catch (e) {}

let supabaseClient = null;

export function getSupabase() {
  if (supabaseClient) return supabaseClient;
  try {
    const saved = localStorage.getItem('ptr_supabase_config');
    let url = SUPABASE_URL;
    let key = SUPABASE_ANON_KEY;
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.url && parsed.key) {
        url = parsed.url;
        key = parsed.key;
      }
    }
    supabaseClient = createClient(url, key);
    return supabaseClient;
  } catch (e) {
    console.error('Failed to initialize Supabase client:', e);
    return null;
  }
}

export function saveSupabaseConfig(url, key) {
  localStorage.setItem('ptr_supabase_config', JSON.stringify({ url: url.trim(), key: key.trim() }));
  supabaseClient = null;
  return getSupabase();
}

export function clearSupabaseConfig() {
  localStorage.removeItem('ptr_supabase_config');
  supabaseClient = null;
}

export function formatVND(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0
  }).format(amount);
}

// Client-Side Canvas Image Compression (~250KB - 400KB, max 1920px)
export async function compressImage(file, maxDimension = 1920, quality = 0.85) {
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

// RFC 4122 Compliant UUID v4 Generator
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
    return { connected: false, source: 'offline' };
  },

  // Fetch Items by Category & Filters (Direct Cloud Query)
  async getItems(filters = {}, category = 'diecast') {
    const supabase = getSupabase();
    let items = [];

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('diecasts')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && Array.isArray(data)) {
          items = data;
        } else if (error) {
          console.error('Supabase getItems error:', error);
        }
      } catch (e) {
        console.error('Supabase getItems exception:', e);
      }
    }

    // Category filtering
    let res = items;
    if (category && category !== 'all') {
      res = res.filter(x => (x.category || 'diecast') === category);
    }

    // Dynamic Filters
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

  // Calculate Statistics for Category
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

  // Direct Cloud Create (Resilient to Schema Columns)
  async createItem(itemData) {
    const validUUID = (itemData.id && itemData.id.includes('-') && itemData.id.length >= 32)
      ? itemData.id
      : generateUUID();

    const basePayload = {
      id: validUUID,
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
      reference_photos: Array.isArray(itemData.reference_photos) ? itemData.reference_photos : [],
      is_favorite: Boolean(itemData.is_favorite),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const fullPayload = {
      ...basePayload,
      category: itemData.category || 'diecast',
      track_photos: Array.isArray(itemData.track_photos) ? itemData.track_photos : []
    };

    const supabase = getSupabase();
    if (!supabase) throw new Error('Supabase client unavailable');

    // Attempt 1: Try inserting full payload
    const { data: fullData, error: fullError } = await supabase.from('diecasts').insert([fullPayload]).select();
    if (!fullError && fullData && fullData.length > 0) {
      return fullData[0];
    }

    // Attempt 2: If Postgres schema doesn't have 'category' or 'track_photos' column, insert without them
    if (fullError) {
      const { data: baseData, error: baseError } = await supabase.from('diecasts').insert([basePayload]).select();
      if (!baseError && baseData && baseData.length > 0) {
        return { ...baseData[0], category: itemData.category || 'diecast' };
      }
      console.error('Supabase createItem error:', baseError || fullError);
      throw baseError || fullError;
    }
  },

  // Direct Cloud Update (Resilient Schema)
  async updateItem(id, itemData) {
    const payload = {
      ...itemData,
      updated_at: new Date().toISOString()
    };

    const supabase = getSupabase();
    if (!supabase) throw new Error('Supabase client unavailable');

    const { data, error } = await supabase.from('diecasts').update(payload).eq('id', id).select();
    if (!error && data && data.length > 0) {
      return data[0];
    }

    // Fallback if custom columns missing
    if (error) {
      const cleanPayload = { ...payload };
      delete cleanPayload.category;
      delete cleanPayload.track_photos;
      const { data: bData, error: bError } = await supabase.from('diecasts').update(cleanPayload).eq('id', id).select();
      if (!bError && bData && bData.length > 0) {
        return { ...bData[0], category: itemData.category || 'diecast' };
      }
      throw bError || error;
    }

    return { id, ...payload };
  },

  // Direct Cloud Delete
  async deleteItem(id) {
    const supabase = getSupabase();
    if (!supabase) throw new Error('Supabase client unavailable');

    const { error } = await supabase.from('diecasts').delete().eq('id', id);
    if (error) {
      console.error('Supabase deleteItem error:', error);
      throw error;
    }
    return true;
  },

  // Bulk Upsert for Excel Spreadsheet Editor
  async bulkCommit(updatedItems) {
    const supabase = getSupabase();
    if (!supabase) throw new Error('Supabase client unavailable');

    const cleanItems = updatedItems.map(it => ({
      ...it,
      id: (it.id && it.id.includes('-') && it.id.length >= 32) ? it.id : generateUUID(),
      updated_at: new Date().toISOString()
    }));

    const { data, error } = await supabase
      .from('diecasts')
      .upsert(cleanItems, { onConflict: 'id' })
      .select();

    if (!error) return { success: true, count: data?.length || cleanItems.length };

    // Fallback without category/track_photos if table lacks them
    const legacy = cleanItems.map(it => {
      const copy = { ...it };
      delete copy.category;
      delete copy.track_photos;
      return copy;
    });

    const { data: lData, error: lError } = await supabase
      .from('diecasts')
      .upsert(legacy, { onConflict: 'id' })
      .select();

    if (lError) throw lError;
    return { success: true, count: lData?.length || legacy.length };
  },

  // Upload Single Photo to Supabase Object Storage
  async uploadPhoto(file) {
    const optimizedFile = await compressImage(file);
    const supabase = getSupabase();

    if (supabase) {
      try {
        const cleanName = optimizedFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const filename = `vault-${Date.now()}-${cleanName}`;
        
        const { data, error } = await supabase.storage.from('diecast-photos').upload(filename, optimizedFile, {
          cacheControl: '31536000',
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

  // Check Duplicate against live Supabase data
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
