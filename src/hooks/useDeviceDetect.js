import { useState, useEffect } from 'react';

/**
 * Hook for Auto-Detecting Device Type (Mobile / Tablet / Desktop)
 * Checks userAgent, touch points, and responsive viewport width
 */
export function useDeviceDetect() {
  const [deviceMode, setDeviceMode] = useState('auto'); // 'auto', 'desktop', 'mobile'
  const [isMobile, setIsMobile] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [orientation, setOrientation] = useState('portrait');

  useEffect(() => {
    const checkDevice = () => {
      const userAgent = typeof navigator === 'undefined' ? '' : navigator.userAgent;
      const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
      const isMobileUA = Boolean(userAgent.match(mobileRegex));
      const hasTouch = Boolean('ontouchstart' in window || navigator.maxTouchPoints > 0);
      const isSmallScreen = window.innerWidth <= 768;

      setIsTouchDevice(hasTouch);
      setIsMobile(isMobileUA || isSmallScreen);
      setOrientation(window.innerWidth > window.innerHeight ? 'landscape' : 'portrait');
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    window.addEventListener('orientationchange', checkDevice);

    return () => {
      window.removeEventListener('resize', checkDevice);
      window.removeEventListener('orientationchange', checkDevice);
    };
  }, []);

  // Compute active layout mode based on user override or auto-detection
  const activeLayout = deviceMode === 'auto' 
    ? (isMobile ? 'mobile' : 'desktop') 
    : deviceMode;

  return {
    isMobile: activeLayout === 'mobile',
    isRealMobile: isMobile,
    isTouchDevice,
    orientation,
    deviceMode,
    setDeviceMode,
    activeLayout
  };
}
