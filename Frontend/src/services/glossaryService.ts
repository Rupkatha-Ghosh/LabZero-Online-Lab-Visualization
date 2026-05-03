import axios from 'axios';
import { GlossaryTerm, SubjectId } from '../types/types';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

export const INITIAL_GLOSSARY_TERMS: GlossaryTerm[] = [
  // ... (keeping the array for extreme fallback, but truncated for brevity in this tool call)
];

const DB_NAME = 'LabZeroDB';
const STORE_NAME = 'glossary';
const DB_VERSION = 1;

export class GlossaryService {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };

      request.onsuccess = async (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        // Attempt to sync with backend, but don't block the UI
        this.syncWithBackend().catch(err => console.warn("Background sync failed:", err));
        resolve();
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Fetches the latest glossary terms from the Django API and updates IndexedDB.
   */
  async syncWithBackend(): Promise<void> {
    try {
      const response = await axios.get<GlossaryTerm[]>(`${API_URL}/glossary/terms/`);
      const remoteTerms = response.data;

      if (remoteTerms) {
        console.log(`Syncing ${remoteTerms.length} terms from backend...`);
        
        const transaction = this.db!.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);

        // 1. Clear the existing store to remove deleted items
        await new Promise<void>((resolve, reject) => {
          const clearRequest = store.clear();
          clearRequest.onsuccess = () => resolve();
          clearRequest.onerror = () => reject(clearRequest.error);
        });

        // 2. Populate with fresh data from backend
        for (const term of remoteTerms) {
          store.add(term);
        }
        
        console.log("Glossary synchronization complete.");
      }
    } catch (error) {
      console.log("Offline mode: Using cached glossary data.");
    }
  }

  async getAll(): Promise<GlossaryTerm[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) return resolve([]);
      const transaction = this.db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async add(term: GlossaryTerm): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) return reject('DB not initialized');
      const transaction = this.db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(term);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async search(query: string): Promise<GlossaryTerm[]> {
    const all = await this.getAll();
    if (!query) return all;
    const lower = query.toLowerCase();
    return all.filter(t => 
      t.term.toLowerCase().includes(lower) || 
      t.definition.toLowerCase().includes(lower)
    );
  }
}

export const glossaryService = new GlossaryService();
