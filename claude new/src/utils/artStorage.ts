import { Painting } from '../types';

const DB_NAME = 'paintlabs_studio_db';
const DB_VERSION = 1;
const STORE_NAME = 'paintings_store';
const KEY = 'user_paintings';
const LOCAL_STORAGE_KEY = 'paintlabs_user_paintings';

/**
 * Open or create the IndexedDB database
 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

/**
 * Sync paintings to server-side JSON storage via /api/paintings
 */
async function syncToServer(paintings: Painting[]): Promise<void> {
  try {
    await fetch('/api/paintings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paintings),
    });
  } catch (e) {
    // Non-blocking in case offline or API is not ready
    console.debug('Server sync skipped:', e);
  }
}

/**
 * Fetch paintings stored on the server disk
 */
async function fetchFromServer(): Promise<Painting[] | null> {
  try {
    const res = await fetch('/api/paintings');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data as Painting[];
      }
    }
  } catch (e) {
    console.debug('Server fetch skipped:', e);
  }
  return null;
}

/**
 * Retrieve all paintings from IndexedDB, with server sync and localStorage migration
 */
export async function loadPaintingsFromStorage(): Promise<Painting[]> {
  // 1. First check if the server has persisted paintings
  const serverPaintings = await fetchFromServer();

  // 2. Read from IndexedDB
  let idbPaintings: Painting[] = [];
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);

    const getRequest = store.get(KEY);

    const paintingsFromIDB: Painting[] | undefined = await new Promise((resolve, reject) => {
      getRequest.onsuccess = () => resolve(getRequest.result);
      getRequest.onerror = () => reject(getRequest.error);
    });

    if (paintingsFromIDB && Array.isArray(paintingsFromIDB) && paintingsFromIDB.length > 0) {
      idbPaintings = paintingsFromIDB;
    }
  } catch (err) {
    console.warn('Could not read from IndexedDB, falling back to localStorage', err);
  }

  // 3. Fallback / migration from localStorage if IndexedDB was empty
  if (idbPaintings.length === 0) {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed: Painting[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          idbPaintings = parsed;
          savePaintingsToStorage(parsed).catch(console.error);
        }
      }
    } catch (e) {
      console.warn('Could not read from localStorage', e);
    }
  }

  // If server has more/different paintings or IDB has more, combine them (preferring latest by id)
  if (serverPaintings && serverPaintings.length > 0) {
    const mergedMap = new Map<string, Painting>();
    // Add server paintings
    serverPaintings.forEach((p) => mergedMap.set(p.id, p));
    // Overlay client paintings
    idbPaintings.forEach((p) => mergedMap.set(p.id, p));
    const merged = Array.from(mergedMap.values());

    // Sync any newly merged items back to server & IDB
    if (merged.length > serverPaintings.length) {
      syncToServer(merged).catch(console.error);
    }
    if (merged.length > idbPaintings.length) {
      savePaintingsToStorage(merged).catch(console.error);
    }
    return merged;
  }

  // If client has paintings but server didn't, save them to the server
  if (idbPaintings.length > 0) {
    syncToServer(idbPaintings).catch(console.error);
    return idbPaintings;
  }

  return [];
}

/**
 * Persist paintings to IndexedDB + server disk + localStorage fallback
 */
export async function savePaintingsToStorage(paintings: Painting[]): Promise<void> {
  // 1. Save to IndexedDB (virtually unlimited capacity)
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put(paintings, KEY);
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.error('Failed to write to IndexedDB', err);
  }

  // 2. Persist to server disk via /api/paintings
  syncToServer(paintings).catch(console.error);

  // 3. Safely attempt localStorage as redundant backup
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(paintings));
  } catch (err) {
    console.warn('LocalStorage quota reached, paintings safely preserved in IndexedDB.', err);
  }
}

/**
 * Compress an image File or Data URL to max 1200px dimension and ~80% JPEG quality.
 * Reduces 5MB-10MB smartphone/camera photos to ~100-200KB without loss of gallery quality.
 */
export function compressImage(
  source: File | string,
  maxDimension = 1200,
  quality = 0.82
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      let width = img.width;
      let height = img.height;

      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(typeof source === 'string' ? source : '');
        return;
      }

      // Smooth scaling
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      try {
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = (err) => {
      reject(err);
    };

    if (typeof source === 'string') {
      img.src = source;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(source);
    }
  });
}

/**
 * 1-Click Export of all artworks to a JSON file backup
 */
export function exportPaintingsBackup(paintings: Painting[]): void {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(paintings, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `paintlabs_artworks_backup_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

/**
 * 1-Click Import from a JSON backup file
 */
export function importPaintingsBackup(file: File): Promise<Painting[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) {
          resolve(parsed as Painting[]);
        } else {
          reject(new Error('Invalid backup file format. Expected a list of paintings.'));
        }
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

/**
 * 1-Click Copy all artworks to JSON text on clipboard
 */
export async function copyPaintingsToClipboard(paintings: Painting[]): Promise<boolean> {
  try {
    const json = JSON.stringify(paintings, null, 2);
    if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(json);
      return true;
    }
  } catch (err) {
    console.warn('Clipboard write failed:', err);
  }
  return false;
}

