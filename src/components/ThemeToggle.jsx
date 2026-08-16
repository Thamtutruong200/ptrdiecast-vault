import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { sound } from '../services/soundEffects';

export default function ThemeToggle({ theme, setTheme }) {
  const toggleTheme = () => {
    sound.playTap();
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('ptr_theme', nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  return (
    <button
      type="button"
      className="btn btn-secondary btn-icon theme-toggle-btn"
      onClick={toggleTheme}
      title={theme === 'dark' ? 'Switch to Daylight Studio (Light Mode)' : 'Switch to Space Black Glass (Dark Mode)'}
      style={{ width: 34, height: 34 }}
    >
      {theme === 'dark' ? (
        <Sun size={15} color="var(--apple-amber)" />
      ) : (
        <Moon size={15} color="var(--apple-blue)" />
      )}
    </button>
  );
}
