import './index.css';
import { safeLocalStorage, safeSessionStorage } from './utils/safeStorage';

// Polyfill window storage properties inside try-catch to protect third-party libraries
if (typeof window !== 'undefined') {
  try {
    Object.defineProperty(window, 'localStorage', {
      value: safeLocalStorage,
      writable: true,
      configurable: true
    });
  } catch (e) {
    console.warn('Failed to define safeLocalStorage on window:', e);
  }

  try {
    Object.defineProperty(window, 'sessionStorage', {
      value: safeSessionStorage,
      writable: true,
      configurable: true
    });
  } catch (e) {
    console.warn('Failed to define safeSessionStorage on window:', e);
  }
}

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
const Sender = React.lazy(() => import('./components/shared/Sender'));
import { registerSW } from 'virtual:pwa-register';

// Unregister stale service workers in development mode, or register in production
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  if (import.meta.env.DEV) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister().then((success) => {
          if (success) {
            console.log('Unregistered active service worker in development mode:', registration);
            window.location.reload();
          }
        });
      }
    });
  } else {
    // Defer service worker registration to avoid network bandwidth congestion
    // during initial page mount and dynamic asset imports (Three.js, icons).
    const registerDeferredSW = () => {
      try {
        registerSW({
          immediate: false,
          onRegistered(registration) {
            console.log('Service worker registered successfully:', registration);
          },
          onRegisterError(error) {
            console.error('Service worker registration failed:', error);
          }
        });

        // Protect against chunk load failures when service worker claims the page
        let refreshing = false;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          if (refreshing) return;
          refreshing = true;
          const reloadKey = 'sw-controller-reload';
          const lastReload = safeSessionStorage.getItem(reloadKey);
          const now = Date.now();
          if (lastReload && now - parseInt(lastReload, 10) < 5000) {
            console.warn('Service worker controller changed too quickly. Skipping reload.');
            return;
          }
          safeSessionStorage.setItem(reloadKey, now.toString());
          console.warn('Service worker controller changed, reloading page to apply update.');
          window.location.reload();
        });
      } catch (err) {
        console.warn('Service worker registration failed or blocked:', err);
      }
    };

    if (document.readyState === 'complete') {
      setTimeout(registerDeferredSW, 4000);
    } else {
      window.addEventListener('load', () => {
        setTimeout(registerDeferredSW, 4000);
      });
    }
  }
}

// Catch and reload on dynamic import failures (preload errors and window-level chunk errors)
if (typeof window !== 'undefined') {
  const triggerReload = (reason: string) => {
    const reloadKey = 'chunk-load-error-reload';
    const lastReload = safeSessionStorage.getItem(reloadKey);
    const now = Date.now();
    if (lastReload && now - parseInt(lastReload, 10) < 6000) {
      console.error('Reload loop detected (last reload within 6s). Skipping reload. Reason:', reason);
      return;
    }
    safeSessionStorage.setItem(reloadKey, now.toString());
    console.warn('Chunk load/preload error detected, reloading page to fetch fresh assets. Reason:', reason);
    window.location.reload();
  };

  window.addEventListener('vite:preloadError', (event: any) => {
    event.preventDefault();
    triggerReload('vite:preloadError');
  });

  // Capture phase window error handler
  window.addEventListener('error', (event) => {
    const errorMsg = event.message || '';
    const errorObj = event.error;
    const isChunkError = 
      /chunk|load|loading|import|dynamically/i.test(errorMsg) ||
      (errorObj && /chunk|load|loading|import|dynamically/i.test(errorObj.message || errorObj.toString() || ''));
    
    if (isChunkError) {
      triggerReload('window error: ' + errorMsg);
    }
  }, true);

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    if (reason) {
      const reasonStr = typeof reason === 'string' ? reason : (reason.message || reason.toString() || '');
      if (/chunk|load|loading|import|dynamically/i.test(reasonStr)) {
        triggerReload('unhandledrejection: ' + reasonStr);
      }
    }
  });
}


const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
const params = new URLSearchParams(window.location.search);
const isPhoneSender = params.get('camera') === 'sender';

root.render(
  <React.StrictMode>
    <React.Suspense fallback={<div />}>
      {isPhoneSender ? <Sender /> : <App />}
    </React.Suspense>
  </React.StrictMode>
);



