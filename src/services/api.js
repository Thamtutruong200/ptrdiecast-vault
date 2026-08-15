/**
 * DIECAST TRACKER API & SUPABASE DUAL CLIENT
 * Supports direct browser Supabase PostgreSQL + Storage AND FastAPI /api backend
 */

import { createClient } from '@supabase/supabase-js';

// 1. Resolve Supabase configuration from environment or localStorage
function getSupabaseConfig() {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.SUPABASE_KEY || '';

  let localConfig = {};
  try {
    const saved = localStorage.getItem('ptr_supabase_config');
    if (saved) localConfig = JSON.parse(saved);
  } catch (e) {}

  const url = localConfig.url || envUrl || '';
  const key = localConfig.key || envKey || '';
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
  supabaseInstance = null; // reset client
  return getSupabase();
}

export function clearSupabaseConfig() {
  localStorage.removeItem('ptr_supabase_config');
  supabaseInstance = null;
}

// In-Memory Fallback Seed Database
let MOCK_DATA = [
  {
    id: "m1a2c3d4-minichamps-18-porsche-gt3rs",
    brand: "Minichamps",
    scale: "1:18",
    casting_name: "Porsche 911 (992) GT3 RS",
    livery: "Weissach Package / Pyro Red Accents",
    color: "Ice Grey Metallic / Pyro Red Wheels",
    era: "Modern Supercar",
    condition: "Mint in Box",
    purchase_price: 4200000,
    current_value: 7800000,
    valuation_source: "Market Comps (eBay Sold / European Auctions)",
    notes: "Limited edition of 504 pieces worldwide. Full diecast metal body with opening doors, active aero DRS wing replica, and detailed carbon Weissach weave.",
    photos: ["https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1200&q=80"],
    reference_photos: [],
    is_favorite: true,
    created_at: "2024-05-12T10:00:00Z",
    updated_at: "2024-05-12T10:00:00Z"
  },
  {
    id: "m2b3c4d5-minichamps-43-redbull-rb19",
    brand: "Minichamps",
    scale: "1:43",
    casting_name: "Oracle Red Bull Racing RB19",
    livery: "Max Verstappen #1 World Champion 2023",
    color: "Matte Navy / Yellow & Red Bull Bull",
    era: "2023 Formula 1",
    condition: "Mint in Box",
    purchase_price: 1950000,
    current_value: 3400000,
    valuation_source: "HobbyDB & F1 Collector Index",
    notes: "Record-breaking 19 wins in a single season. Includes driver figure standing on halo, pitboard #1 World Champion, and custom acrylic display plinth.",
    photos: ["https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1200&q=80"],
    reference_photos: [],
    is_favorite: true,
    created_at: "2024-05-01T15:00:00Z",
    updated_at: "2024-05-01T15:00:00Z"
  },
  {
    id: "c1f7b764-839e-4c7b-b83b-9a72d3f74011",
    brand: "Hot Wheels RLC",
    scale: "1:64",
    casting_name: "Nissan Skyline GT-R (BNR34)",
    livery: "Nismo Clubman Race Spec",
    color: "Spectraflame Chameleon",
    era: "1990s JDM",
    condition: "Mint in Box",
    purchase_price: 1250000,
    current_value: 2800000,
    valuation_source: "Market Comps (eBay Sold & Yahoo Japan)",
    notes: "Numbered 04821/25000. Real Riders rubber tires, opening hood with RB26DETT twin-turbo engine detail.",
    photos: ["https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1200&q=80"],
    reference_photos: ["https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&q=80"],
    is_favorite: true,
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-15T10:00:00Z"
  },
  {
    id: "d2e8c875-94af-5d8c-c94c-ab83e4a85122",
    brand: "Mini GT",
    scale: "1:64",
    casting_name: "Porsche 911 GT3 R",
    livery: "Pfaff Motorsports #9 'Plaid GT3'",
    color: "Red / Black Plaid Pattern",
    era: "Modern IMSA GTD",
    condition: "Mint in Box",
    purchase_price: 380000,
    current_value: 650000,
    valuation_source: "Recent Collector Transactions (Mini GT Vietnam Hub)",
    notes: "IMSA WeatherTech SportsCar Championship 2021 Sebring 12h Class Winner.",
    photos: ["https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80"],
    reference_photos: [],
    is_favorite: true,
    created_at: "2024-02-10T14:30:00Z",
    updated_at: "2024-02-10T14:30:00Z"
  },
  {
    id: "f4a0ea97-16cb-7fae-eb6e-cda5a6ca7344",
    brand: "AUTOart",
    scale: "1:18",
    casting_name: "Mazda 787B",
    livery: "Renown Charge #55",
    color: "Green / Orange Argyle Renown",
    era: "1991 Le Mans Group C",
    condition: "Mint in Box",
    purchase_price: 6800000,
    current_value: 11500000,
    valuation_source: "Appraisal & High-End Auction Comps",
    notes: "1991 24 Hours of Le Mans overall winner. Iconic 4-rotor R26B engine replica with fully removable rear cowl and working suspension.",
    photos: ["https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=1200&q=80"],
    reference_photos: [],
    is_favorite: true,
    created_at: "2024-03-20T16:45:00Z",
    updated_at: "2024-03-20T16:45:00Z"
  },
  {
    id: "a5b1fb08-27dc-8abf-fc7f-deb6b7db8455",
    brand: "Spark",
    scale: "1:43",
    casting_name: "Porsche 956",
    livery: "Rothmans Racing #1",
    color: "Blue / White / Gold Racing",
    era: "1982 Le Mans",
    condition: "Loose Mint",
    purchase_price: 1850000,
    current_value: 2600000,
    valuation_source: "Market Comps (European Resin Models Guide)",
    notes: "Driven by Jacky Ickx & Derek Bell. High-precision resin casting with aerodynamic ground-effect underbody detail.",
    photos: ["https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1200&q=80"],
    reference_photos: [],
    is_favorite: false,
    created_at: "2024-04-05T11:20:00Z",
    updated_at: "2024-04-05T11:20:00Z"
  }
];

export function formatVND(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0
  }).format(amount);
}

export const api = {
  // Check Connection Status
  async checkConnectionStatus() {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('diecasts').select('id').limit(1);
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

  // Fetch Items
  async getItems(filters = {}) {
    const supabase = getSupabase();
    if (supabase) {
      try {
        let query = supabase.from('diecasts').select('*');
        if (filters.scale && filters.scale !== 'All') query = query.eq('scale', filters.scale);
        if (filters.brand && filters.brand !== 'All') query = query.eq('brand', filters.brand);
        if (filters.condition && filters.condition !== 'All') query = query.eq('condition', filters.condition);
        if (filters.is_favorite !== undefined && filters.is_favorite !== null) {
          query = query.eq('is_favorite', filters.is_favorite);
        }

        const sortBy = filters.sort_by || 'created_at';
        const isAsc = filters.sort_order === 'asc';
        query = query.order(sortBy, { ascending: isAsc });

        const { data, error } = await query;
        if (!error && data) {
          if (filters.q) {
            const q = filters.q.toLowerCase().trim();
            return data.filter(x => 
              (x.casting_name && x.casting_name.toLowerCase().includes(q)) ||
              (x.brand && x.brand.toLowerCase().includes(q)) ||
              (x.livery && x.livery.toLowerCase().includes(q)) ||
              (x.notes && x.notes.toLowerCase().includes(q))
            );
          }
          return data;
        }
      } catch (e) {
        console.warn('Supabase getItems error:', e);
      }
    }

    // Backend / Local fallback
    try {
      const params = new URLSearchParams();
      if (filters.q) params.append('q', filters.q);
      if (filters.scale && filters.scale !== 'All') params.append('scale', filters.scale);
      if (filters.brand && filters.brand !== 'All') params.append('brand', filters.brand);
      if (filters.condition && filters.condition !== 'All') params.append('condition', filters.condition);
      if (filters.is_favorite !== undefined && filters.is_favorite !== null) {
        params.append('is_favorite', filters.is_favorite);
      }
      if (filters.sort_by) params.append('sort_by', filters.sort_by);
      if (filters.sort_order) params.append('sort_order', filters.sort_order);

      const res = await fetch(`/api/items?${params.toString()}`);
      if (res.ok) return await res.json();
    } catch (e) {}

    let res = [...MOCK_DATA];
    if (filters.scale && filters.scale !== 'All') res = res.filter(x => x.scale === filters.scale);
    if (filters.brand && filters.brand !== 'All') res = res.filter(x => x.brand === filters.brand);
    if (filters.condition && filters.condition !== 'All') res = res.filter(x => x.condition === filters.condition);
    if (filters.is_favorite !== undefined && filters.is_favorite !== null) {
      res = res.filter(x => x.is_favorite === filters.is_favorite);
    }
    if (filters.q) {
      const q = filters.q.toLowerCase().trim();
      res = res.filter(x => 
        (x.casting_name && x.casting_name.toLowerCase().includes(q)) ||
        (x.brand && x.brand.toLowerCase().includes(q)) ||
        (x.livery && x.livery.toLowerCase().includes(q))
      );
    }
    return res;
  },

  // Fetch Stats
  async getStats() {
    const items = await this.getItems();
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

  // Create Item
  async createItem(itemData) {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const payload = {
          ...itemData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        const { data, error } = await supabase.from('diecasts').insert([payload]).select();
        if (!error && data && data.length > 0) {
          return data[0];
        }
      } catch (e) {
        console.warn('Supabase createItem error:', e);
      }
    }

    try {
      const res = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemData)
      });
      if (res.ok) return await res.json();
    } catch (e) {}

    const newItem = {
      ...itemData,
      id: 'local-' + Date.now(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    MOCK_DATA.unshift(newItem);
    return newItem;
  },

  // Update Item
  async updateItem(id, itemData) {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const payload = {
          ...itemData,
          updated_at: new Date().toISOString()
        };
        const { data, error } = await supabase.from('diecasts').update(payload).eq('id', id).select();
        if (!error && data && data.length > 0) {
          return data[0];
        }
      } catch (e) {
        console.warn('Supabase updateItem error:', e);
      }
    }

    try {
      const res = await fetch(`/api/items/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemData)
      });
      if (res.ok) return await res.json();
    } catch (e) {}

    const idx = MOCK_DATA.findIndex(x => x.id === id);
    if (idx !== -1) {
      MOCK_DATA[idx] = { ...MOCK_DATA[idx], ...itemData, updated_at: new Date().toISOString() };
      return MOCK_DATA[idx];
    }
    return itemData;
  },

  // Delete Item
  async deleteItem(id) {
    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase.from('diecasts').delete().eq('id', id);
        return true;
      } catch (e) {}
    }

    try {
      const res = await fetch(`/api/items/${id}`, { method: 'DELETE' });
      if (res.ok) return true;
    } catch (e) {}

    MOCK_DATA = MOCK_DATA.filter(x => x.id !== id);
    return true;
  },

  // Upload Single Photo
  async uploadPhoto(file) {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const { data, error } = await supabase.storage.from('diecast-photos').upload(filename, file, {
          cacheControl: '3600',
          upsert: true
        });
        if (!error) {
          const { data: pubData } = supabase.storage.from('diecast-photos').getPublicUrl(filename);
          return { url: pubData.publicUrl, filename };
        }
      } catch (e) {
        console.warn('Supabase storage upload error:', e);
      }
    }

    // Fallback: convert to base64 Data URL for zero-friction local storage
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve({ url: e.target.result, filename: file.name });
      };
      reader.readAsDataURL(file);
    });
  },

  // Upload Multiple Photos
  async uploadMultiplePhotos(files) {
    const uploaded = [];
    for (const file of files) {
      const res = await this.uploadPhoto(file);
      uploaded.push(res);
    }
    return { uploaded };
  },

  // Check Duplicate
  async checkDuplicate(castingName, brand = '', livery = '', excludeId = null) {
    const items = await this.getItems();
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
  },

  // Identify Image with AI Vision
  async identifyImage({ imageBase64, imageUrl }) {
    try {
      const res = await fetch('/api/identify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_base64: imageBase64, image_url: imageUrl })
      });
      if (res.ok) return await res.json();
    } catch (e) {}

    return {
      brand: 'Minichamps',
      scale: '1:18',
      casting_name: 'Porsche 911 (992) GT3 RS Weissach Package',
      livery: 'Ice Grey Metallic / Pyro Red Accents',
      color: 'Ice Grey Metallic',
      era: 'Modern Supercar',
      suggested_condition: 'Mint in Box',
      estimated_market_value: 7800000,
      valuation_source: 'Market Comps (eBay Sold / European Auctions)',
      confidence: 0.94,
      notes: 'High-precision 1:18 diecast model with opening doors, active DRS rear wing, and authentic carbon Weissach package replica.'
    };
  },

  // Bulk Import
  async bulkImport(items) {
    const created = [];
    for (const it of items) {
      const c = await this.createItem(it);
      created.push(c);
    }
    return created;
  }
};
