// Safe storage helper to prevent SecurityError in incognito or blocked environments.
class SafeStorage implements Storage {
  private store: Record<string, string> = {};
  private isFallback = false;
  private underlyingStorage: Storage | null = null;
  private type: 'localStorage' | 'sessionStorage';

  constructor(type: 'localStorage' | 'sessionStorage') {
    this.type = type;
    try {
      if (typeof window !== 'undefined' && window[type]) {
        this.underlyingStorage = window[type];
        // Test write ability
        const testKey = '__storage_test_key__';
        this.underlyingStorage.setItem(testKey, testKey);
        this.underlyingStorage.removeItem(testKey);
      } else {
        this.isFallback = true;
      }
    } catch (e) {
      this.isFallback = true;
      console.warn(`[SafeStorage] ${type} is blocked or inaccessible. Falling back to in-memory store.`, e);
    }

    if (this.isFallback) {
      this.loadFromWindowName();
    }
  }

  private loadFromWindowName(): void {
    if (typeof window === 'undefined') return;
    try {
      const name = window.name;
      if (name && name.startsWith('{')) {
        const parsed = JSON.parse(name);
        if (parsed && typeof parsed === 'object') {
          const section = parsed[this.type];
          if (section && typeof section === 'object') {
            this.store = { ...section };
          }
        }
      }
    } catch (e) {
      // Ignored
    }
  }

  private saveToWindowName(): void {
    if (typeof window === 'undefined') return;
    try {
      let parsed: Record<string, any> = {};
      const name = window.name;
      if (name && name.startsWith('{')) {
        try {
          const val = JSON.parse(name);
          if (val && typeof val === 'object') {
            parsed = val;
          }
        } catch {
          // Ignored
        }
      }
      parsed[this.type] = this.store;
      window.name = JSON.stringify(parsed);
    } catch (e) {
      // Ignored
    }
  }

  getItem(key: string): string | null {
    if (this.isFallback || !this.underlyingStorage) {
      return this.store.hasOwnProperty(key) ? this.store[key] : null;
    }
    try {
      return this.underlyingStorage.getItem(key);
    } catch (e) {
      return this.store.hasOwnProperty(key) ? this.store[key] : null;
    }
  }

  setItem(key: string, value: string): void {
    const valStr = String(value);
    if (this.isFallback || !this.underlyingStorage) {
      this.store[key] = valStr;
      this.saveToWindowName();
      return;
    }
    try {
      this.underlyingStorage.setItem(key, valStr);
    } catch (e) {
      this.store[key] = valStr;
      this.saveToWindowName();
    }
  }

  removeItem(key: string): void {
    if (this.isFallback || !this.underlyingStorage) {
      delete this.store[key];
      this.saveToWindowName();
      return;
    }
    try {
      this.underlyingStorage.removeItem(key);
    } catch (e) {
      delete this.store[key];
      this.saveToWindowName();
    }
  }

  clear(): void {
    this.store = {};
    if (this.isFallback || !this.underlyingStorage) {
      this.saveToWindowName();
      return;
    }
    try {
      this.underlyingStorage.clear();
    } catch (e) {
      this.saveToWindowName();
    }
  }

  key(index: number): string | null {
    if (this.isFallback || !this.underlyingStorage) {
      const keys = Object.keys(this.store);
      return keys[index] || null;
    }
    try {
      return this.underlyingStorage.key(index);
    } catch (e) {
      const keys = Object.keys(this.store);
      return keys[index] || null;
    }
  }

  get length(): number {
    if (this.isFallback || !this.underlyingStorage) {
      return Object.keys(this.store).length;
    }
    try {
      return this.underlyingStorage.length;
    } catch (e) {
      return Object.keys(this.store).length;
    }
  }
}

export const safeLocalStorage = new SafeStorage('localStorage');
export const safeSessionStorage = new SafeStorage('sessionStorage');
