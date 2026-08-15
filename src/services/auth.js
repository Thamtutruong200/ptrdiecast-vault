/**
 * PTR MOTORSPORT - ADMIN & SPECTATOR CONSOLE AUTH SERVICE
 * Handles Owner Mode vs Public Spectator Mode permissions, PIN authentication, and privacy settings
 */

const DEFAULT_PIN = '1234';

export const auth = {
  // Check if current user is logged in as Admin / Owner
  isAdmin() {
    try {
      return localStorage.getItem('ptr_admin_auth') === 'true';
    } catch (e) {
      return false;
    }
  },

  // Authenticate Admin with PIN
  login(pin) {
    const savedPin = localStorage.getItem('ptr_admin_pin') || DEFAULT_PIN;
    if (pin === savedPin) {
      localStorage.setItem('ptr_admin_auth', 'true');
      return { success: true };
    }
    return { success: false, error: 'Incorrect Admin Master PIN.' };
  },

  // Logout back to Spectator Mode
  logout() {
    localStorage.setItem('ptr_admin_auth', 'false');
  },

  // Change Admin Master PIN
  changePin(currentPin, newPin) {
    const savedPin = localStorage.getItem('ptr_admin_pin') || DEFAULT_PIN;
    if (currentPin !== savedPin) {
      return { success: false, error: 'Current PIN is incorrect.' };
    }
    if (!newPin || newPin.length < 4) {
      return { success: false, error: 'New PIN must be at least 4 digits.' };
    }
    localStorage.setItem('ptr_admin_pin', newPin);
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
