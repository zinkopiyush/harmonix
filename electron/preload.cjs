// if (process.env.NODE_ENV === 'development') {
//   require('@reticlehq/electron/preload');
// }

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  minimize: () => ipcRenderer.invoke('window:minimize'),
  maximize: () => ipcRenderer.invoke('window:maximize'),
  close: () => ipcRenderer.invoke('window:close'),
  isMaximized: () => ipcRenderer.invoke('window:isMaximized'),
  toggleMiniMode: () => ipcRenderer.invoke('window:toggleMiniMode'),
  openDirectory: () => ipcRenderer.invoke('dialog:openDirectory'),
  openFiles: () => ipcRenderer.invoke('dialog:openFiles'),
  scanFolder: (folderPath) => ipcRenderer.invoke('fs:scanFolder', folderPath),
  parseAudioMetadata: (filePath) => ipcRenderer.invoke('fs:parseAudioMetadata', filePath),
  readFileBuffer: (filePath) => ipcRenderer.invoke('fs:readFileBuffer', filePath),
  showInFolder: (filePath) => ipcRenderer.invoke('fs:showInFolder', filePath),
});
