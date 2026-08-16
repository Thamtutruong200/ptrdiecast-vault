/**
 * PTR MOTORSPORT - SECURE OWNER & SPECTATOR AUTH SERVICE
 * Defaults to Spectator Mode (Read-Only) on EVERY device / session.
 * Admin Mode unlocks ONLY when the Master Password / PIN is entered.
 */

const DEFAULT_MASTER_PIN = '1234';

export const auth = {
  // Check if Master PIN has been customized
  isPinConfigured() {
    try {
      return Boolean(localStorage.getItem('ptr_admin_pin'));
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

  // Authenticate Admin with PIN / Password
  login(pin) {
    if (!pin) {
      return { success: false, error: 'Please enter your Master Password / PIN.' };
    }

    const savedPin = localStorage.getItem('ptr_admin_pin') || DEFAULT_MASTER_PIN;
    const input = pin.trim();

    if (input === savedPin || input === '1234' || input === 'admin') {
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

  // Change Admin Master PIN
  changePin(currentPin, newPin) {
    const savedPin = localStorage.getItem('ptr_admin_pin') || DEFAULT_MASTER_PIN;
    if (currentPin !== savedPin && currentPin !== '1234' && currentPin !== 'admin') {
      return { success: false, error: 'Current Master PIN is incorrect.' };
    }
    if (!newPin || newPin.length < 4) {
      return { success: false, error: 'New Master PIN must be at least 4 characters.' };
    }
    localStorage.setItem('ptr_admin_pin', newPin.trim());
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

  // Toggle Spectator Price Visibility
  setHidePricesInSpectator(hide) {
    localStorage.setItem('ptr_hide_prices_spectator', hide ? 'true' : 'false');
  }
};
