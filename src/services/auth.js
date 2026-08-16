/**
 * PTR MOTORSPORT - SECURE OWNER & SPECTATOR AUTH SERVICE
 * Upgraded authentication gate without exposed default password hints
 */

export const auth = {
  // Check if Master PIN has been configured
  isPinConfigured() {
    try {
      return Boolean(localStorage.getItem('ptr_admin_pin'));
    } catch (e) {
      return false;
    }
  },

  // Setup Initial Master PIN / Password on first run
  setupMasterPin(pin) {
    if (!pin || pin.length < 4) {
      return { success: false, error: 'PIN / Password must be at least 4 characters.' };
    }
    localStorage.setItem('ptr_admin_pin', pin.trim());
    localStorage.setItem('ptr_admin_auth', 'true');
    return { success: true };
  },

  // Check if current user is logged in as Admin / Owner
  isAdmin() {
    try {
      return localStorage.getItem('ptr_admin_auth') === 'true';
    } catch (e) {
      return false;
    }
  },

  // Authenticate Admin with PIN / Password
  login(pin) {
    const savedPin = localStorage.getItem('ptr_admin_pin');
    // If not configured yet, any valid 4+ digit setup initializes the vault
    if (!savedPin) {
      return this.setupMasterPin(pin);
    }

    if (pin.trim() === savedPin) {
      localStorage.setItem('ptr_admin_auth', 'true');
      return { success: true };
    }
    return { success: false, error: 'Access Denied: Incorrect Master Password / PIN.' };
  },

  // Logout back to Spectator Mode
  logout() {
    localStorage.setItem('ptr_admin_auth', 'false');
  },

  // Change Admin Master PIN
  changePin(currentPin, newPin) {
    const savedPin = localStorage.getItem('ptr_admin_pin');
    if (savedPin && currentPin !== savedPin) {
      return { success: false, error: 'Current Master PIN is incorrect.' };
    }
    if (!newPin || newPin.length < 4) {
      return { success: false, error: 'New Master PIN must be at least 4 characters.' };
    }
    localStorage.setItem('ptr_admin_pin', newPin.trim());
    return { success: true };
  },

  // Check if Spectator Mode hides financial prices
  hidePricesInSpectator() {
    try {
      const setting = localStorage.getItem('ptr_hide_prices_spectator');
      return setting === null ? true : setting === 'true';
    } catch (e) {
      return true;
    }
  },

  // Toggle Spectator Price Visibility
  setHidePricesInSpectator(hide) {
    localStorage.setItem('ptr_hide_prices_spectator', hide ? 'true' : 'false');
  }
};
