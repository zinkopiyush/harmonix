const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const mm = require('music-metadata');

// Enable GPU Hardware Acceleration & Smooth 144Hz Compositing
app.commandLine.appendSwitch('enable-gpu-rasterization');
app.commandLine.appendSwitch('enable-zero-copy');
app.commandLine.appendSwitch('ignore-gpu-blocklist');

let mainWindow = null;
let isMiniMode = false;
let normalBounds = { width: 1240, height: 800 };

const AUDIO_EXTENSIONS = new Set(['.mp3', '.flac', '.wav', '.ogg', '.m4a', '.aac', '.webm', '.opus', '.wma']);

function createWindow() {
  mainWindow = new BrowserWindow({
    width: normalBounds.width,
    height: normalBounds.height,
    minWidth: 360,
    minHeight: 480,
    frame: false,
    transparent: false,
    backgroundColor: '#0f0f13',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false,
    },
  });

  const isDev = process.env.NODE_ENV === 'development';
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173').catch(() => {
      mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    });
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC Handlers
ipcMain.handle('window:minimize', () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.handle('window:maximize', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.handle('window:close', () => {
  if (mainWindow) mainWindow.close();
});

ipcMain.handle('window:isMaximized', () => {
  return mainWindow ? mainWindow.isMaximized() : false;
});

ipcMain.handle('window:toggleMiniMode', () => {
  if (!mainWindow) return false;

  if (isMiniMode) {
    mainWindow.setSize(normalBounds.width, normalBounds.height);
    mainWindow.setAlwaysOnTop(false);
    mainWindow.setResizable(true);
    isMiniMode = false;
  } else {
    normalBounds = mainWindow.getBounds();
    mainWindow.setSize(380, 480);
    mainWindow.setAlwaysOnTop(true);
    mainWindow.setResizable(false);
    isMiniMode = true;
  }
  return isMiniMode;
});

ipcMain.handle('dialog:openDirectory', async () => {
  if (!mainWindow) return null;
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
    title: 'Select Music Folder',
  });
  if (result.canceled || result.filePaths.length === 0) return null;
  return result.filePaths[0];
});

ipcMain.handle('dialog:openFiles', async () => {
  if (!mainWindow) return [];
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile', 'multiSelections'],
    title: 'Select Audio Files',
    filters: [
      { name: 'Audio Files', extensions: ['mp3', 'flac', 'wav', 'ogg', 'm4a', 'aac', 'webm', 'opus'] },
    ],
  });
  if (result.canceled) return [];
  return result.filePaths;
});

// Helper: Smart Filename Fallback Parser
function parseFilenameFallback(fileName) {
  const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.')) || fileName;

  if (nameWithoutExt.includes(' - ')) {
    const parts = nameWithoutExt.split(' - ').map((p) => p.trim());
    if (parts.length === 2) {
      return { title: parts[0], artist: parts[1] };
    } else if (parts.length >= 3) {
      const artist = parts[parts.length - 1];
      const title = parts.slice(0, parts.length - 1).join(' - ');
      return { title, artist };
    }
  }

  return { title: nameWithoutExt, artist: 'Unknown Artist' };
}

// Helper: Check local directory for cover artwork image
function findFolderArtwork(dir) {
  try {
    const items = fs.readdirSync(dir);
    const imgFile = items.find((item) => {
      const lower = item.toLowerCase();
      return (
        lower.endsWith('.jpg') ||
        lower.endsWith('.jpeg') ||
        lower.endsWith('.png') ||
        lower.endsWith('.webp')
      );
    });

    if (imgFile) {
      const fullPath = path.join(dir, imgFile);
      const buf = fs.readFileSync(fullPath);
      const ext = path.extname(imgFile).replace('.', '').toLowerCase();
      const mime = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
      return `data:${mime};base64,${buf.toString('base64')}`;
    }
  } catch (err) {
    // Ignore error
  }
  return null;
}

// Helper: Normalize picture object format to valid browser MIME type
function formatPictureDataUrl(pic) {
  if (!pic || !pic.data) return null;

  let mimeType = pic.format || 'image/jpeg';
  mimeType = mimeType.toLowerCase().trim();

  if (!mimeType.includes('/')) {
    if (mimeType === 'jpg' || mimeType === 'jpeg') mimeType = 'image/jpeg';
    else if (mimeType === 'png') mimeType = 'image/png';
    else if (mimeType === 'webp') mimeType = 'image/webp';
    else if (mimeType === 'gif') mimeType = 'image/gif';
    else mimeType = `image/${mimeType}`;
  }

  const base64Str = Buffer.isBuffer(pic.data)
    ? pic.data.toString('base64')
    : Buffer.from(pic.data).toString('base64');

  return `data:${mimeType};base64,${base64Str}`;
}

// Native FLAC / MP3 / Audio Metadata Extractor
ipcMain.handle('fs:parseAudioMetadata', async (event, filePath) => {
  const fileName = path.basename(filePath);
  const dir = path.dirname(filePath);
  const fallback = parseFilenameFallback(fileName);

  const defaultMeta = {
    id: Buffer.from(filePath).toString('base64').replace(/=/g, ''),
    path: filePath,
    title: fallback.title,
    artist: fallback.artist,
    album: 'Unknown Album',
    albumArtist: fallback.artist !== 'Unknown Artist' ? fallback.artist : 'Unknown Artist',
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

  try {
    const stats = fs.statSync(filePath);
    defaultMeta.size = stats.size;
    defaultMeta.dateAdded = stats.mtimeMs;

    const metadata = await mm.parseFile(filePath, { duration: true, skipCovers: false });
    if (metadata) {
      const common = metadata.common || {};
      const format = metadata.format || {};

      if (common.title && common.title.trim()) {
        defaultMeta.title = common.title.trim();
      }
      if (common.artist && common.artist.trim()) {
        defaultMeta.artist = common.artist.trim();
      }
      if (common.album && common.album.trim()) {
        defaultMeta.album = common.album.trim();
      }
      if (common.albumartist && common.albumartist.trim()) {
        defaultMeta.albumArtist = common.albumartist.trim();
      }
      if (common.genre && common.genre.length > 0) {
        defaultMeta.genre = common.genre.join(', ');
      }
      if (common.year) {
        defaultMeta.year = String(common.year);
      }
      if (common.track && common.track.no) {
        defaultMeta.trackNo = common.track.no;
      }

      defaultMeta.duration = format.duration || 0;
      defaultMeta.bitrate = format.bitrate ? Math.round(format.bitrate / 1000) : null;
      defaultMeta.sampleRate = format.sampleRate || null;

      if (common.picture && common.picture.length > 0) {
        defaultMeta.picture = formatPictureDataUrl(common.picture[0]);
      }
    }
  } catch (err) {
    console.warn(`Node metadata parsing warning for ${filePath}:`, err.message);
  }

  if (!defaultMeta.picture) {
    const folderArt = findFolderArtwork(dir);
    if (folderArt) {
      defaultMeta.picture = folderArt;
    }
  }

  return defaultMeta;
});

// Scan folder recursively for audio files
ipcMain.handle('fs:scanFolder', async (event, folderPath) => {
  const audioFiles = [];

  function scan(dir) {
    try {
      const items = fs.readdirSync(dir, { withFileTypes: true });
      for (const item of items) {
        const fullPath = path.join(dir, item.name);
        if (item.isDirectory()) {
          if (!item.name.startsWith('.') && item.name !== 'node_modules') {
            scan(fullPath);
          }
        } else if (item.isFile()) {
          const ext = path.extname(item.name).toLowerCase();
          if (AUDIO_EXTENSIONS.has(ext)) {
            audioFiles.push(fullPath);
          }
        }
      }
    } catch (err) {
      console.error(`Error scanning folder ${dir}:`, err);
    }
  }

  scan(folderPath);
  return audioFiles;
});

// Read file buffer
ipcMain.handle('fs:readFileBuffer', async (event, filePath) => {
  try {
    const buffer = fs.readFileSync(filePath);
    return buffer;
  } catch (err) {
    console.error(`Failed to read file buffer for ${filePath}:`, err);
    return null;
  }
});

// Show file in Windows File Explorer
ipcMain.handle('fs:showInFolder', (event, filePath) => {
  if (fs.existsSync(filePath)) {
    shell.showItemInFolder(filePath);
  }
});
