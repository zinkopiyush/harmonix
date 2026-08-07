import * as mm from 'music-metadata-browser';

// Curated sleek dark Indigo/Purple/Blue palettes without green
export function getAlbumGradient(albumName = 'Unknown') {
  let hash = 0;
  for (let i = 0; i < albumName.length; i++) {
    hash = albumName.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Palette hues: Blue (210), Indigo (240), Purple (270), Magenta (300), Slate (220)
  const hues = [210, 235, 255, 275, 295, 315, 225];
  const hue1 = hues[Math.abs(hash) % hues.length];
  const hue2 = (hue1 + 35) % 360;

  return `linear-gradient(135deg, hsl(${hue1}, 65%, 25%), hsl(${hue2}, 75%, 15%))`;
}

export function formatTime(seconds) {
  if (isNaN(seconds) || seconds === null || seconds === undefined || seconds < 0) return '0:00';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hrs > 0) {
    return `${hrs}:${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export function formatFileSize(bytes) {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export async function parseTrackMetadata(fileObjOrPath) {
  const filePath = typeof fileObjOrPath === 'string' ? fileObjOrPath : fileObjOrPath.path;

  if (window.electronAPI && window.electronAPI.parseAudioMetadata) {
    try {
      const meta = await window.electronAPI.parseAudioMetadata(filePath);
      if (meta) return meta;
    } catch (err) {
      console.warn('Native metadata parse error:', err);
    }
  }

  const fileName = filePath.split('\\').pop().split('/').pop();
  const cleanTitle = fileName.substring(0, fileName.lastIndexOf('.')) || fileName;

  return {
    id: btoa(encodeURIComponent(filePath)).replace(/=/g, ''),
    path: filePath,
    title: cleanTitle,
    artist: 'Unknown Artist',
    album: 'Unknown Album',
    genre: 'Unknown Genre',
    year: '',
    trackNo: null,
    duration: 0,
    bitrate: null,
    sampleRate: null,
    picture: null,
    isFavorite: false,
    playCount: 0,
    dateAdded: Date.now(),
    size: 0,
  };
}
