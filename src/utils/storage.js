import { openDB } from 'idb';

const DB_NAME = 'HarmonixMusicPlayerDB';
const DB_VERSION = 1;

let dbPromise = null;

export function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Tracks store
        if (!db.objectStoreNames.contains('tracks')) {
          const trackStore = db.createObjectStore('tracks', { keyPath: 'id' });
          trackStore.createIndex('artist', 'artist', { unique: false });
          trackStore.createIndex('album', 'album', { unique: false });
          trackStore.createIndex('genre', 'genre', { unique: false });
        }
        // Playlists store
        if (!db.objectStoreNames.contains('playlists')) {
          db.createObjectStore('playlists', { keyPath: 'id' });
        }
        // Settings store
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
      },
    });
  }
  return dbPromise;
}

// Tracks CRUD
export async function saveTracksToDB(tracks) {
  try {
    const db = await getDB();
    const tx = db.transaction('tracks', 'readwrite');
    for (const track of tracks) {
      await tx.store.put(track);
    }
    await tx.done;
  } catch (err) {
    console.error('Error saving tracks to IndexedDB:', err);
  }
}

export async function getAllTracksFromDB() {
  try {
    const db = await getDB();
    return await db.getAll('tracks');
  } catch (err) {
    console.error('Error getting tracks from IndexedDB:', err);
    return [];
  }
}

export async function deleteTrackFromDB(id) {
  try {
    const db = await getDB();
    await db.delete('tracks', id);
  } catch (err) {
    console.error('Error deleting track from DB:', err);
  }
}

export async function clearTracksDB() {
  try {
    const db = await getDB();
    await db.clear('tracks');
  } catch (err) {
    console.error('Error clearing tracks DB:', err);
  }
}

// Playlists CRUD
export async function getAllPlaylistsFromDB() {
  try {
    const db = await getDB();
    return await db.getAll('playlists');
  } catch (err) {
    console.error('Error getting playlists:', err);
    return [];
  }
}

export async function savePlaylistToDB(playlist) {
  try {
    const db = await getDB();
    await db.put('playlists', playlist);
  } catch (err) {
    console.error('Error saving playlist:', err);
  }
}

export async function deletePlaylistFromDB(id) {
  try {
    const db = await getDB();
    await db.delete('playlists', id);
  } catch (err) {
    console.error('Error deleting playlist:', err);
  }
}

// Key-Value Settings Storage
export async function setSettingDB(key, value) {
  try {
    const db = await getDB();
    await db.put('settings', { key, value });
  } catch (err) {
    console.error('Error setting setting:', err);
  }
}

export async function getSettingDB(key, defaultValue = null) {
  try {
    const db = await getDB();
    const result = await db.get('settings', key);
    return result ? result.value : defaultValue;
  } catch (err) {
    console.error('Error getting setting:', err);
    return defaultValue;
  }
}
