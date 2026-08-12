import React, { useState, useEffect } from 'react';
import { useAudio } from '../context/AudioContext';
import { useTheme } from '../context/ThemeContext';
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
  Moon,
  Sun,
  Monitor,
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
  const { theme, setTheme } = useTheme();

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
      <div className="h-10 bg-bg-secondary border-b border-border-primary flex items-center justify-between px-3 titlebar-drag select-none text-xs">
        <div className="flex items-center gap-2 text-accent font-semibold titlebar-no-drag">
          <Music className="w-4 h-4 animate-pulse" />
          <span>Harmonix</span>
        </div>
        <div className="flex items-center gap-3 titlebar-no-drag">
          <div className="flex items-center gap-1 border border-border-secondary rounded-lg overflow-hidden">
            <button onClick={() => setTheme('light')} className={`p-1 transition-colors ${theme === 'light' ? 'bg-bg-tertiary text-text-primary' : 'text-text-muted'}`} title="Light"><Sun className="w-3 h-3" /></button>
            <button onClick={() => setTheme('dark')} className={`p-1 transition-colors ${theme === 'dark' ? 'bg-bg-tertiary text-text-primary' : 'text-text-muted'}`} title="Dark"><Moon className="w-3 h-3" /></button>
            <button onClick={() => setTheme('system')} className={`p-1 transition-colors ${theme === 'system' ? 'bg-bg-tertiary text-text-primary' : 'text-text-muted'}`} title="System"><Monitor className="w-3 h-3" /></button>
          </div>
          <button onClick={handleToggleMiniMode} title="Expand Full App" className="p-1.5 hover:bg-bg-hover rounded transition-colors text-text-muted hover:text-text-primary">
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
          <button onClick={handleClose} title="Close" className="p-1.5 hover:bg-red-500 rounded transition-colors text-text-muted hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <header className="h-12 bg-bg-secondary border-b border-border-primary flex items-center justify-between px-4 titlebar-drag select-none z-50">
      <div className="flex items-center gap-3 w-64 titlebar-no-drag">
        <div className="w-8 h-8 rounded-lg bg-accent/30 border border-accent/40 flex items-center justify-center text-accent">
          <Music className="w-4 h-4" />
        </div>
        <span className="font-bold text-sm tracking-wide text-text-primary">HARMONIX</span>
      </div>

      <div className="flex-1 flex justify-center titlebar-no-drag max-w-md px-4">
        <div className="relative group w-full">
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-accent transition-colors" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-bg-tertiary text-text-primary placeholder-text-muted text-xs sm:text-sm rounded-lg pl-9 pr-4 py-1.5 focus:outline-none focus:ring-1 focus:ring-accent transition-all"
          />
        </div>
      </div>

        <div className="flex items-center gap-4 titlebar-no-drag">
          <div className="flex items-center gap-1.5 mr-2">
            <button onClick={scanFolder} title="Open Folder" className="flex items-center gap-1.5 px-3 py-1.5 bg-accent hover:bg-accent-hover text-white rounded-md text-xs font-medium transition-colors"><FolderPlus className="w-3.5 h-3.5" /><span>Folder</span></button>
            <button onClick={addIndividualFiles} title="Open Files" className="flex items-center gap-1.5 px-3 py-1.5 bg-bg-tertiary hover:bg-border-primary text-text-primary rounded-md text-xs font-medium transition-colors"><FilePlus className="w-3.5 h-3.5" /><span>Files</span></button>
            <button onClick={() => setIsEqModalOpen(true)} title="Equalizer" className="p-2 hover:bg-bg-hover rounded-md text-text-muted hover:text-text-primary transition-colors"><Sliders className="w-4 h-4" /></button>
            <div className="h-4 w-px bg-border-secondary mx-1"></div>
            <button onClick={handleToggleMiniMode} title="Compact Mini Player View" className="p-2 hover:bg-bg-hover rounded-md text-text-muted hover:text-text-primary transition-colors"><Minimize2 className="w-4 h-4" /></button>
          </div>

          <div className="flex items-center gap-1 border border-border-secondary rounded-lg overflow-hidden">
            <button onClick={() => setTheme('light')} className={`p-1.5 transition-colors ${theme === 'light' ? 'bg-bg-tertiary text-text-primary' : 'text-text-muted hover:text-text-primary'}`} title="Light"><Sun className="w-3.5 h-3.5" /></button>
            <button onClick={() => setTheme('dark')} className={`p-1.5 transition-colors ${theme === 'dark' ? 'bg-bg-tertiary text-text-primary' : 'text-text-muted hover:text-text-primary'}`} title="Dark"><Moon className="w-3.5 h-3.5" /></button>
            <button onClick={() => setTheme('system')} className={`p-1.5 transition-colors ${theme === 'system' ? 'bg-bg-tertiary text-text-primary' : 'text-text-muted hover:text-text-primary'}`} title="System"><Monitor className="w-3.5 h-3.5" /></button>
          </div>

        <div className="flex items-center text-text-muted">
          <button onClick={handleMinimize} className="p-2 hover:bg-bg-hover hover:text-text-primary transition-colors"><Minus className="w-4 h-4" /></button>
          <button onClick={handleMaximize} className="p-2 hover:bg-bg-hover hover:text-text-primary transition-colors">{isMaximized ? <Copy className="w-4 h-4" /> : <Square className="w-4 h-4" />}</button>
          <button onClick={handleClose} className="p-2 hover:bg-red-500 hover:text-white transition-colors"><X className="w-4 h-4" /></button>
        </div>
      </div>
    </header>
  );
};
