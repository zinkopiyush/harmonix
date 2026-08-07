import React, { useState, useEffect } from 'react';
import { useAudio } from '../context/AudioContext';
import {
  Music,
  Search,
  Minus,
  Square,
  Copy,
  X,
  Minimize2,
  Maximize2,
  FolderPlus,
  FilePlus,
  Sliders,
  Volume2,
} from 'lucide-react';

export const TitleBar = () => {
  const {
    searchQuery,
    setSearchQuery,
    setIsEqModalOpen,
    scanFolder,
    addIndividualFiles,
    isMiniMode,
    setIsMiniMode,
    isScanning,
    scanProgress,
  } = useAudio();

  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.isMaximized().then(setIsMaximized);
    }
  }, []);

  const handleMinimize = () => {
    if (window.electronAPI) window.electronAPI.minimize();
  };

  const handleMaximize = async () => {
    if (window.electronAPI) {
      await window.electronAPI.maximize();
      const maxState = await window.electronAPI.isMaximized();
      setIsMaximized(maxState);
    }
  };

  const handleClose = () => {
    if (window.electronAPI) window.electronAPI.close();
  };

  const handleToggleMiniMode = async () => {
    if (window.electronAPI) {
      const mode = await window.electronAPI.toggleMiniMode();
      setIsMiniMode(mode);
    } else {
      setIsMiniMode(!isMiniMode);
    }
  };

  if (isMiniMode) {
    return (
      <div className="h-10 bg-[#0c0c12]/90 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-3 titlebar-drag select-none text-xs">
        <div className="flex items-center gap-2 text-indigo-400 font-semibold titlebar-no-drag">
          <Music className="w-4 h-4 animate-pulse" />
          <span>Harmonix</span>
        </div>
        <div className="flex items-center gap-1 titlebar-no-drag">
          <button
            onClick={handleToggleMiniMode}
            title="Expand Full App"
            className="p-1.5 hover:bg-white/10 rounded transition-colors text-gray-400 hover:text-white"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleClose}
            title="Close"
            className="p-1.5 hover:bg-red-500/80 rounded transition-colors text-gray-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <header className="h-12 bg-[#0c0c12]/90 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-4 titlebar-drag select-none z-50">
      {/* App Branding & Logo */}
      <div className="flex items-center gap-3 w-64 titlebar-no-drag">
        <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shadow-[0_0_12px_rgba(99,102,241,0.4)]">
          <Music className="w-4 h-4" />
        </div>
        <span className="font-bold text-sm tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400">
          HARMONIX
        </span>
        <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
          PRO
        </span>
      </div>

      {/* Center Search Bar & Scanning Status */}
      <div className="flex-1 max-w-md px-4 titlebar-no-drag flex items-center gap-3">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search songs, artists, albums..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-indigo-500/60 focus:bg-white/10 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {isScanning && (
          <div className="flex items-center gap-2 text-xs text-indigo-400 whitespace-nowrap bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
            <div className="w-3 h-3 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
            <span>
              Scanning ({scanProgress.current}/{scanProgress.total})
            </span>
          </div>
        )}
      </div>

      {/* Quick Action Buttons & Window Controls */}
      <div className="flex items-center gap-2 titlebar-no-drag">
        {/* Import Files/Folders */}
        <button
          onClick={scanFolder}
          title="Open Folder"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 rounded-md border border-indigo-500/30 text-xs font-medium transition-all"
        >
          <FolderPlus className="w-3.5 h-3.5" />
          <span>Folder</span>
        </button>

        <button
          onClick={addIndividualFiles}
          title="Open Files"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-gray-300 rounded-md border border-white/10 text-xs font-medium transition-all"
        >
          <FilePlus className="w-3.5 h-3.5" />
          <span>Files</span>
        </button>

        <button
          onClick={() => setIsEqModalOpen(true)}
          title="Equalizer"
          className="p-2 hover:bg-white/10 rounded-md text-gray-300 hover:text-white transition-colors"
        >
          <Sliders className="w-4 h-4" />
        </button>

        <div className="h-4 w-px bg-white/10 mx-1"></div>

        {/* Mini Mode Toggle */}
        <button
          onClick={handleToggleMiniMode}
          title="Compact Mini Player View"
          className="p-2 hover:bg-white/10 rounded-md text-gray-400 hover:text-white transition-colors"
        >
          <Minimize2 className="w-4 h-4" />
        </button>

        {/* Windows 11 Standard Window Controls */}
        <button
          onClick={handleMinimize}
          title="Minimize"
          className="p-2 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
        >
          <Minus className="w-4 h-4" />
        </button>

        <button
          onClick={handleMaximize}
          title="Maximize"
          className="p-2 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
        >
          {isMaximized ? <Copy className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
        </button>

        <button
          onClick={handleClose}
          title="Close"
          className="p-2 hover:bg-red-600/80 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
