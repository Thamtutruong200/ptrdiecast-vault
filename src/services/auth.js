/**
 * PTR MOTORSPORT - SECURE CLOUD-SYNCED OWNER AUTH SERVICE
 * Synchronizes Master Password / PIN across ALL browsers and devices via Supabase.
 * Defaults to Spectator Mode (Read-Only) on EVERY device / session.
 * Admin Mode unlocks ONLY when the Master Password / PIN is entered.
 */

import { getSupabase } from './api';

const SYSTEM_CONFIG_ID = '00000000-0000-0000-0000-000000000001';
const DEFAULT_MASTER_PIN = '131415';

export const auth = {
  // Sync Cloud Master PIN & Settings from Supabase
  async syncCloudPin() {
    const supabase = getSupabase();
    if (!supabase) return;

    try {
      const { data, error } = await supabase
        .from('diecasts')
        .select('notes')
        .eq('id', SYSTEM_CONFIG_ID)
        .maybeSingle();

      if (!error && data && data.notes) {
        try {
          const config = JSON.parse(data.notes);
          if (config.admin_pin) {
            localStorage.setItem('ptr_admin_pin', config.admin_pin.trim());
          }
          if (typeof config.hide_prices_spectator === 'boolean') {
            localStorage.setItem('ptr_hide_prices_spectator', config.hide_prices_spectator ? 'true' : 'false');
          }
        } catch (e) {}
      }
    } catch (err) {
      console.warn('Could not sync cloud PIN (offline or fallback mode):', err);
    }
  },

  // Check if Master PIN has been customized
  isPinConfigured() {
    try {
      const pin = localStorage.getItem('ptr_admin_pin');
      return Boolean(pin && pin !== DEFAULT_MASTER_PIN);
    } catch (e) {
      return false;
    }
  },

  // Check if current session is logged in as Admin / Owner (Default: FALSE / Spectator)
  isAdmin() {
    try {
      // Use sessionStorage so every new session / spectator device starts in Spectator Mode
      return sessionStorage.getItem('ptr_admin_auth') === 'true';
    } catch (e) {
      return false;
    }
  },

  // Authenticate Admin with PIN / Password (Checks local cache & cloud)
  async login(pin) {
    if (!pin) {
      return { success: false, error: 'Please enter your Master Password / PIN.' };
    }

    const input = pin.trim();

    // 1. Check current local cached PIN
    let validPin = localStorage.getItem('ptr_admin_pin') || DEFAULT_MASTER_PIN;

    // 2. Try fetching latest cloud PIN for cross-browser accuracy
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data } = await supabase
          .from('diecasts')
          .select('notes')
          .eq('id', SYSTEM_CONFIG_ID)
          .maybeSingle();

        if (data && data.notes) {
          const config = JSON.parse(data.notes);
          if (config.admin_pin) {
            validPin = config.admin_pin.trim();
            localStorage.setItem('ptr_admin_pin', validPin);
          }
        }
      } catch (e) {}
    }

    if (input === validPin) {
      try {
        sessionStorage.setItem('ptr_admin_auth', 'true');
      } catch (e) {}
      return { success: true };
    }

    return { success: false, error: 'Access Denied: Incorrect Master Password / PIN.' };
  },

  // Logout / Switch back to Spectator Mode
  logout() {
    try {
      sessionStorage.removeItem('ptr_admin_auth');
    } catch (e) {}
  },

  // Change Admin Master PIN (Persists to Supabase Cloud so ALL devices update)
  async changePin(currentPin, newPin) {
    let savedPin = localStorage.getItem('ptr_admin_pin') || DEFAULT_MASTER_PIN;

    // Verify latest cloud PIN
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data } = await supabase
          .from('diecasts')
          .select('notes')
          .eq('id', SYSTEM_CONFIG_ID)
          .maybeSingle();

        if (data && data.notes) {
          const config = JSON.parse(data.notes);
          if (config.admin_pin) {
            savedPin = config.admin_pin.trim();
          }
        }
      } catch (e) {}
    }

    if (currentPin !== savedPin) {
      return { success: false, error: 'Current Master PIN is incorrect.' };
    }

    if (!newPin || newPin.trim().length < 4) {
      return { success: false, error: 'New Master PIN must be at least 4 characters.' };
    }

    const cleanNewPin = newPin.trim();
    localStorage.setItem('ptr_admin_pin', cleanNewPin);

    // Write to Supabase Cloud
    if (supabase) {
      try {
        const payload = {
          id: SYSTEM_CONFIG_ID,
          category: '_system_config_',
          brand: 'PTR System',
          casting_name: '__SYSTEM_SETTINGS__',
          notes: JSON.stringify({
            admin_pin: cleanNewPin,
            hide_prices_spectator: this.hidePricesInSpectator()
          }),
          updated_at: new Date().toISOString()
        };

        await supabase.from('diecasts').upsert([payload]);
      } catch (e) {
        console.error('Failed to sync new PIN to cloud:', e);
      }
    }

    return { success: true };
  },

  // Check if Spectator Mode hides financial purchase prices
  hidePricesInSpectator() {
    try {
      const setting = localStorage.getItem('ptr_hide_prices_spectator');
      return setting === null ? true : setting === 'true';
    } catch (e) {
      return true;
    }
  },

  // Toggle Spectator Price Visibility (Persists to Cloud)
  async setHidePricesInSpectator(hide) {
    localStorage.setItem('ptr_hide_prices_spectator', hide ? 'true' : 'false');
    const supabase = getSupabase();
    if (supabase) {
      try {
        const savedPin = localStorage.getItem('ptr_admin_pin') || DEFAULT_MASTER_PIN;
        const payload = {
          id: SYSTEM_CONFIG_ID,
          category: '_system_config_',
          brand: 'PTR System',
          casting_name: '__SYSTEM_SETTINGS__',
          notes: JSON.stringify({
            admin_pin: savedPin,
            hide_prices_spectator: hide
          }),
          updated_at: new Date().toISOString()
        };
        await supabase.from('diecasts').upsert([payload]);
      } catch (e) {}
    }
  }
};
