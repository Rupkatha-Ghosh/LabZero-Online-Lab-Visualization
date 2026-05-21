import { safeLocalStorage, safeSessionStorage } from './utils/safeStorage';

if (typeof window !== 'undefined') {
  // Helper to define storage property safely
  const polyfillStorage = (prop: 'localStorage' | 'sessionStorage', fallback: any) => {
    let needsPolyfill = false;
    try {
      const storage = window[prop];
      if (!storage) {
        needsPolyfill = true;
      } else {
        // Test read/write to verify it doesn't throw SecurityError
        const testKey = '__test_polyfill__';
        storage.setItem(testKey, '1');
        storage.removeItem(testKey);
      }
    } catch (e) {
      needsPolyfill = true;
      console.warn(`[Polyfill] Native ${prop} is blocked or threw an error:`, e);
    }

    if (needsPolyfill) {
      // Try defining directly on window
      try {
        Object.defineProperty(window, prop, {
          value: fallback,
          writable: true,
          configurable: true,
          enumerable: true
        });
        console.log(`[Polyfill] Successfully polyfilled window.${prop} directly.`);
      } catch (e1) {
        // Fallback to Window.prototype
        try {
          Object.defineProperty(Window.prototype, prop, {
            get() {
              return fallback;
            },
            configurable: true,
            enumerable: true
          });
          console.log(`[Polyfill] Successfully polyfilled Window.prototype.${prop}.`);
        } catch (e2) {
          console.error(`[Polyfill] Critical: Failed to polyfill ${prop}:`, e2);
        }
      }
    }
  };

  // Helper to define indexedDB safely
  const polyfillIndexedDB = () => {
    let needsPolyfill = false;
    try {
      const db = window.indexedDB;
      if (!db) {
        needsPolyfill = true;
      }
    } catch (e) {
      needsPolyfill = true;
      console.warn('[Polyfill] Native indexedDB is blocked or threw an error:', e);
    }

    if (needsPolyfill) {
      // Try defining directly on window
      try {
        Object.defineProperty(window, 'indexedDB', {
          value: null,
          writable: true,
          configurable: true,
          enumerable: true
        });
        console.log('[Polyfill] Successfully polyfilled window.indexedDB directly to null.');
      } catch (e1) {
        // Fallback to Window.prototype
        try {
          Object.defineProperty(Window.prototype, 'indexedDB', {
            get() {
              return null;
            },
            configurable: true,
            enumerable: true
          });
          console.log('[Polyfill] Successfully polyfilled Window.prototype.indexedDB to null.');
        } catch (e2) {
          console.error('[Polyfill] Critical: Failed to polyfill indexedDB:', e2);
        }
      }
    }
  };

  // Execute polyfills immediately when this module is evaluated
  polyfillStorage('localStorage', safeLocalStorage);
  polyfillStorage('sessionStorage', safeSessionStorage);
  polyfillIndexedDB();
}
