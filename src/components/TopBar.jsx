import React, { useState } from 'react';
import { useAudio } from '../context/AudioContext';
import { useTheme } from '../context/ThemeContext';
import {
  Search,
  FolderPlus,
  FilePlus,
  Minus,
  Square,
  X,
  Sliders,
  Music2,
  Maximize2,
  Sun,
  Moon,
  Monitor
} from 'lucide-react';

export const TopBar = () => {
  const {
    searchQuery,
    setSearchQuery,
    scanFolder,
    addIndividualFiles,
    setIsEqModalOpen,
    setIsMiniMode,
    isMiniMode,
  } = useAudio();
  const { theme, setTheme, accentColor, setAccentColor } = useTheme();

  const [inputVal, setInputVal] = useState(searchQuery);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchQuery(inputVal.trim());
  };

  const handleMinimize = () => {
    if (window.electronAPI && window.electronAPI.minimize) {
      window.electronAPI.minimize();
    }
  };

  const handleMaximize = () => {
    if (window.electronAPI && window.electronAPI.maximize) {
      window.electronAPI.maximize();
    }
  };

  const handleClose = () => {
    if (window.electronAPI && window.electronAPI.close) {
      window.electronAPI.close();
    }
  };

  const handleToggleMini = async () => {
    if (window.electronAPI && window.electronAPI.toggleMiniMode) {
      const isMini = await window.electronAPI.toggleMiniMode();
      setIsMiniMode(isMini);
    } else {
      setIsMiniMode(!isMiniMode);
    }
  };

  return (
    <header className="h-14 bg-bg-secondary border-b border-border-primary flex items-center justify-between px-4 select-none titlebar-drag z-30">
      {/* App Logo & Title */}
      <div className="flex items-center gap-3 no-drag" style={{ WebkitAppRegion: 'no-drag' }}>
        <div className="w-8 h-8 rounded-xl bg-accent flex items-center justify-center text-text-primary shadow-lg shadow-black/20">
          <Music2 className="w-4 h-4" />
        </div>
        <div className="flex items-center gap-2">
          <h1 className="font-extrabold text-sm tracking-wider text-text-primary">HARMONIX</h1>
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-accent-hover/20 text-accent border border-accent/30">
            WIN11 PRO
          </span>
        </div>
      </div>

      {/* Center Interactive Search Bar */}
      <form
        onSubmit={handleSearchSubmit}
        style={{ WebkitAppRegion: 'no-drag' }}
        className="flex-1 max-w-md mx-6 no-drag flex items-center gap-2"
      >
        <div className="relative flex-1">
          <input
            id="searchInputField"
            type="text"
            placeholder="Search songs, artists, albums... (Ctrl+F)"
            value={inputVal}
            onChange={(e) => {
              setInputVal(e.target.value);
              setSearchQuery(e.target.value);
            }}
            className="w-full pl-9 pr-8 py-1.5 bg-bg-tertiary border border-border-primary rounded-full text-xs text-text-primary placeholder-gray-500 focus:outline-none focus:border-accent focus:bg-bg-hover transition-all"
          />
          <Search className="w-4 h-4 text-text-secondary absolute left-3 top-2" />
          {inputVal && (
            <button
              type="button"
              onClick={() => {
                setInputVal('');
                setSearchQuery('');
              }}
              className="absolute right-2.5 top-2 text-text-secondary hover:text-text-primary"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <button
          type="submit"
          title="Search Music Library"
          className="px-3.5 py-1.5 bg-accent hover:bg-accent-hover text-text-primary rounded-full text-xs font-semibold shadow transition-all flex items-center gap-1 cursor-pointer"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Search</span>
        </button>
      </form>

      {/* Right Top Actions & Native Window Controls */}
      <div className="flex items-center gap-2 no-drag" style={{ WebkitAppRegion: 'no-drag' }}>
        <button
          onClick={scanFolder}
          title="Import Music Folder: Scan a folder on your computer for audio files"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-bg-tertiary hover:bg-bg-hover text-text-secondary rounded-lg text-xs font-medium border border-border-primary transition-colors cursor-pointer"
        >
          <FolderPlus className="w-3.5 h-3.5 text-accent" />
          <span>+ Folder</span>
        </button>

        <button
          onClick={addIndividualFiles}
          title="Import Song Files: Select individual audio files (.mp3, .flac, .wav)"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-bg-tertiary hover:bg-bg-hover text-text-secondary rounded-lg text-xs font-medium border border-border-primary transition-colors cursor-pointer"
        >
          <FilePlus className="w-3.5 h-3.5 text-accent" />
          <span>+ Files</span>
        </button>

        <button
          onClick={() => setIsEqModalOpen(true)}
          title="Audio Equalizer"
          className="p-1.5 text-text-secondary hover:text-text-primary rounded-lg hover:bg-bg-hover transition-colors cursor-pointer"
        >
          <Sliders className="w-4 h-4" />
        </button>

        <div className="h-4 w-px bg-bg-hover mx-1"></div>

        {/* Color Theme Picker */}
        <div className="flex items-center gap-1.5 px-2">
          {['sky', 'emerald', 'rose', 'amber', 'purple'].map(color => (
            <button
              key={color}
              onClick={() => setAccentColor(color)}
              title={`${color.charAt(0).toUpperCase() + color.slice(1)} Theme`}
              className={`w-3.5 h-3.5 rounded-full transition-transform cursor-pointer ${
                accentColor === color ? 'scale-125 ring-2 ring-white/40 shadow-sm' : 'hover:scale-110 opacity-70 hover:opacity-100'
              }`}
              style={{
                backgroundColor: 
                  color === 'sky' ? '#0ea5e9' : 
                  color === 'emerald' ? '#10b981' : 
                  color === 'rose' ? '#f43f5e' : 
                  color === 'amber' ? '#f59e0b' : '#a855f7'
              }}
            />
          ))}
        </div>

        <div className="h-4 w-px bg-bg-hover mx-1"></div>

        {/* Light/Dark Toggle */}
        <div className="flex items-center bg-bg-tertiary rounded-lg p-0.5">
          <button onClick={() => setTheme('light')} title="Light Mode" className={`p-1 rounded cursor-pointer ${theme === 'light' ? 'bg-bg-hover text-white' : 'text-text-secondary hover:text-text-primary'}`}><Sun className="w-3.5 h-3.5" /></button>
          <button onClick={() => setTheme('dark')} title="Dark Mode" className={`p-1 rounded cursor-pointer ${theme === 'dark' ? 'bg-bg-hover text-white' : 'text-text-secondary hover:text-text-primary'}`}><Moon className="w-3.5 h-3.5" /></button>
          <button onClick={() => setTheme('system')} title="System Default" className={`p-1 rounded cursor-pointer ${theme === 'system' ? 'bg-bg-hover text-white' : 'text-text-secondary hover:text-text-primary'}`}><Monitor className="w-3.5 h-3.5" /></button>
        </div>

        <div className="h-4 w-px bg-bg-hover mx-1"></div>

        {/* Windows 11 Controls (Calling correct electronAPI methods) */}
        <div className="flex items-center gap-1 no-drag" style={{ WebkitAppRegion: 'no-drag' }}>
          <button
            type="button"
            onClick={handleToggleMini}
            title="Toggle Small Cover Mini Player (Pic 2)"
            className="p-1.5 text-accent hover:text-text-primary rounded-lg hover:bg-accent/30 transition-colors cursor-pointer"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={handleMinimize}
            title="Minimize Window"
            className="p-1.5 text-text-secondary hover:text-text-primary rounded-lg hover:bg-bg-hover transition-colors cursor-pointer"
          >
            <Minus className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleMaximize}
            title="Maximize / Restore Window"
            className="p-1.5 text-text-secondary hover:text-text-primary rounded-lg hover:bg-bg-hover transition-colors cursor-pointer"
          >
            <Square className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={handleClose}
            title="Close Window"
            className="p-1.5 text-text-secondary hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
