import { useState, useEffect } from 'react';

/**
 * Custom hook to handle PWA installation logic.
 * Captures the 'beforeinstallprompt' event and provides a trigger function.
 */
export const usePWAInstall = () => {
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (e: any) => {
      // Prevent the browser's default automatic banner
      e.preventDefault();
      // Save the event so it can be triggered later
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    
    // Show the install prompt
    installPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await installPrompt.userChoice;
    
    if (outcome === 'accepted') {
      // Clear the prompt after successful installation
      setInstallPrompt(null);
    }
  };

  return { 
    isInstallable: !!installPrompt, 
    handleInstallClick 
  };
};
