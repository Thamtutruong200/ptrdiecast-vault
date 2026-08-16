/**
 * DIECAST & TOYS TRACKER API CLIENT (SUPABASE DUAL CLIENT)
 * Supports Diecast Models + Toys & Collectibles with live spreadsheet bulk commits
 */

import { createClient } from '@supabase/supabase-js';

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
  supabaseInstance = null;
  return getSupabase();
}

export function clearSupabaseConfig() {
  localStorage.removeItem('ptr_supabase_config');
  supabaseInstance = null;
}

// Master Seed Database: Diecast + Toys & Collectibles
let MOCK_DATA = [
  // --- 🏎️ DIECAST VAULT ITEMS ---
  {
    id: "m1a2c3d4-minichamps-18-porsche-gt3rs",
    category: "diecast",
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
    track_photos: [
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1200&q=80"
    ],
    reference_photos: [],
    is_favorite: true,
    created_at: "2024-05-12T10:00:00Z",
    updated_at: "2024-05-12T10:00:00Z"
  },
  {
    id: "m2b3c4d5-minichamps-43-redbull-rb19",
    category: "diecast",
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
    track_photos: [
      "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1200&q=80"
    ],
    reference_photos: [],
    is_favorite: true,
    created_at: "2024-05-01T15:00:00Z",
    updated_at: "2024-05-01T15:00:00Z"
  },
  {
    id: "c1f7b764-839e-4c7b-b83b-9a72d3f74011",
    category: "diecast",
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
    track_photos: [
      "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&q=80"
    ],
    reference_photos: [],
    is_favorite: true,
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-15T10:00:00Z"
  },
  {
    id: "d2e8c875-94af-5d8c-c94c-ab83e4a85122",
    category: "diecast",
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
    track_photos: [
      "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1200&q=80"
    ],
    reference_photos: [],
    is_favorite: true,
    created_at: "2024-02-10T14:30:00Z",
    updated_at: "2024-02-10T14:30:00Z"
  },
  {
    id: "f4a0ea97-16cb-7fae-eb6e-cda5a6ca7344",
    category: "diecast",
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
    track_photos: [
      "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1200&q=80"
    ],
    reference_photos: [],
    is_favorite: true,
    created_at: "2024-03-20T16:45:00Z",
    updated_at: "2024-03-20T16:45:00Z"
  },
  {
    id: "a5b1fb08-27dc-8abf-fc7f-deb6b7db8455",
    category: "diecast",
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
    track_photos: [
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80"
    ],
    reference_photos: [],
    is_favorite: false,
    created_at: "2024-04-05T11:20:00Z",
    updated_at: "2024-04-05T11:20:00Z"
  },

  // --- 🧸 TOYS & COLLECTIBLES VAULT ITEMS ---
  {
    id: "toy-lego-porsche-gt3rs",
    category: "toys",
    brand: "Lego",
    scale: "1:8",
    casting_name: "LEGO Technic Porsche 911 GT3 RS (42056)",
    livery: "Lava Orange Flagship Ultimate Series",
    color: "Lava Orange",
    era: "Technic Supercar",
    condition: "Mint in Sealed Box",
    purchase_price: 8500000,
    current_value: 18500000,
    valuation_source: "BrickEconomy & eBay Sold Comps",
    notes: "Retired 2,704 piece master set. Features functioning dual-clutch transmission with paddle shifters and working boxer 6 engine.",
    photos: ["https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?auto=format&fit=crop&w=1200&q=80"],
    track_photos: [],
    reference_photos: [],
    is_favorite: true,
    created_at: "2024-02-15T12:00:00Z",
    updated_at: "2024-02-15T12:00:00Z"
  },
  {
    id: "toy-gundam-pg-rx782",
    category: "toys",
    brand: "Gundam / Bandai",
    scale: "1:60",
    casting_name: "Perfect Grade Unleashed RX-78-2 Gundam",
    livery: "Mobile Suit Gundam 0079",
    color: "White / Blue / Red / Yellow",
    era: "Master Grade / PG",
    condition: "Mint in Sealed Box",
    purchase_price: 5200000,
    current_value: 7500000,
    valuation_source: "Bandai Collector Index",
    notes: "Multi-layered internal truss frame with chrome etched metal parts, LED lighting core block system, and magnetic hatch gimmicks.",
    photos: ["https://images.unsplash.com/photo-1598550476439-6847785fcea6?auto=format&fit=crop&w=1200&q=80"],
    track_photos: [],
    reference_photos: [],
    is_favorite: true,
    created_at: "2024-03-01T10:00:00Z",
    updated_at: "2024-03-01T10:00:00Z"
  },
  {
    id: "toy-bearbrick-400-daftpunk",
    category: "toys",
    brand: "Medicom Bearbrick",
    scale: "400%",
    casting_name: "BE@RBRICK Daft Punk (Discovery Guy-Manuel)",
    livery: "Discovery Era Chrome Helmet",
    color: "High Gloss Gold & Chrome",
    era: "Designer Art Toy",
    condition: "Mint in Box",
    purchase_price: 6000000,
    current_value: 14000000,
    valuation_source: "StockX & Sotheby's Designer Comps",
    notes: "Authentic Medicom Toy Japan release. Features iconic helmet visor details and mirror-like chrome electroplated finish.",
    photos: ["https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=1200&q=80"],
    track_photos: [],
    reference_photos: [],
    is_favorite: true,
    created_at: "2024-01-20T16:00:00Z",
    updated_at: "2024-01-20T16:00:00Z"
  },
  {
    id: "toy-popmart-mega-space-molly",
    category: "toys",
    brand: "Pop Mart",
    scale: "400%",
    casting_name: "MEGA SPACE MOLLY 400% Planet Series",
    livery: "Limited Astronaut Edition",
    color: "Iridescent Pearl White",
    era: "Art Vinyl Toy",
    condition: "Mint in Box",
    purchase_price: 3900000,
    current_value: 6200000,
    valuation_source: "Pop Mart Collectibles Exchange",
    notes: "Equipped with removable astronaut helmet visor, space blaster camera, and collector authentication NFC card.",
    photos: ["https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1200&q=80"],
    track_photos: [],
    reference_photos: [],
    is_favorite: false,
    created_at: "2024-04-10T09:30:00Z",
    updated_at: "2024-04-10T09:30:00Z"
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

  // Fetch Items by Category & Filters
  async getItems(filters = {}, category = 'diecast') {
    const supabase = getSupabase();
    if (supabase) {
      try {
        let query = supabase.from('diecasts').select('*');
        
        // Category filtering
        if (category && category !== 'all') {
          query = query.eq('category', category);
        }

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
          let resData = data;
          if (filters.q) {
            const q = filters.q.toLowerCase().trim();
            resData = resData.filter(x => 
              (x.casting_name && x.casting_name.toLowerCase().includes(q)) ||
              (x.brand && x.brand.toLowerCase().includes(q)) ||
              (x.livery && x.livery.toLowerCase().includes(q)) ||
              (x.notes && x.notes.toLowerCase().includes(q))
            );
          }
          return resData;
        }
      } catch (e) {
        console.warn('Supabase getItems query error:', e);
      }
    }

    // Local in-memory filter
    let res = [...MOCK_DATA];
    if (category && category !== 'all') {
      res = res.filter(x => (x.category || 'diecast') === category);
    }
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
        (x.livery && x.livery.toLowerCase().includes(q)) ||
        (x.notes && x.notes.toLowerCase().includes(q))
      );
    }

    const reverse = (filters.sort_order || 'desc').toLowerCase() === 'desc';
    if (filters.sort_by === 'current_value') {
      res.sort((a, b) => reverse ? (b.current_value - a.current_value) : (a.current_value - b.current_value));
    } else if (filters.sort_by === 'purchase_price') {
      res.sort((a, b) => reverse ? (b.purchase_price - a.purchase_price) : (a.purchase_price - b.purchase_price));
    } else if (filters.sort_by === 'casting_name') {
      res.sort((a, b) => reverse ? b.casting_name.localeCompare(a.casting_name) : a.casting_name.localeCompare(b.casting_name));
    } else {
      res.sort((a, b) => reverse ? (b.created_at || '').localeCompare(a.created_at || '') : (a.created_at || '').localeCompare(b.created_at || ''));
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

  // Create Item
  async createItem(itemData) {
    const supabase = getSupabase();
    const payload = {
      category: itemData.category || 'diecast',
      track_photos: itemData.track_photos || [],
      ...itemData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (supabase) {
      try {
        const { data, error } = await supabase.from('diecasts').insert([payload]).select();
        if (!error && data && data.length > 0) {
          return data[0];
        }
      } catch (e) {
        console.warn('Supabase createItem error:', e);
      }
    }

    const newItem = {
      ...payload,
      id: 'local-' + Date.now() + Math.random().toString(36).substring(2, 6)
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

    MOCK_DATA = MOCK_DATA.filter(x => x.id !== id);
    return true;
  },

  // Bulk Commit for Excel Spreadsheet Editor
  async bulkCommit(updatedItems) {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('diecasts').upsert(updatedItems, { onConflict: 'id' }).select();
        if (!error) {
          return { success: true, count: data?.length || updatedItems.length };
        }
      } catch (e) {
        console.warn('Supabase bulkCommit error:', e);
      }
    }

    // Local replacement
    MOCK_DATA = [...updatedItems];
    return { success: true, count: updatedItems.length };
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

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve({ url: e.target.result, filename: file.name });
      };
      reader.readAsDataURL(file);
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
