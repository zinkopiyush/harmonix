import React, { useState } from 'react';
import { useAudio } from '../context/AudioContext';
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
    <header className="h-14 bg-[#0d0d14] border-b border-white/10 flex items-center justify-between px-4 select-none drag-header z-30">
      {/* App Logo & Title */}
      <div className="flex items-center gap-3 no-drag" style={{ WebkitAppRegion: 'no-drag' }}>
        <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/40">
          <Music2 className="w-4 h-4" />
        </div>
        <div className="flex items-center gap-2">
          <h1 className="font-extrabold text-sm tracking-wider text-gray-100">HARMONIX</h1>
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
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
            className="w-full pl-9 pr-8 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:bg-white/10 transition-all"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2" />
          {inputVal && (
            <button
              type="button"
              onClick={() => {
                setInputVal('');
                setSearchQuery('');
              }}
              className="absolute right-2.5 top-2 text-gray-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <button
          type="submit"
          title="Search Music Library"
          className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full text-xs font-semibold shadow transition-all flex items-center gap-1 cursor-pointer"
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
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg text-xs font-medium border border-white/10 transition-colors cursor-pointer"
        >
          <FolderPlus className="w-3.5 h-3.5 text-indigo-400" />
          <span>+ Folder</span>
        </button>

        <button
          onClick={addIndividualFiles}
          title="Import Song Files: Select individual audio files (.mp3, .flac, .wav)"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg text-xs font-medium border border-white/10 transition-colors cursor-pointer"
        >
          <FilePlus className="w-3.5 h-3.5 text-indigo-400" />
          <span>+ Files</span>
        </button>

        <button
          onClick={() => setIsEqModalOpen(true)}
          title="Audio Equalizer"
          className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
        >
          <Sliders className="w-4 h-4" />
        </button>

        <div className="h-4 w-px bg-white/10 mx-1"></div>

        {/* Windows 11 Controls (Calling correct electronAPI methods) */}
        <div className="flex items-center gap-1 no-drag" style={{ WebkitAppRegion: 'no-drag' }}>
          <button
            type="button"
            onClick={handleToggleMini}
            title="Toggle Small Cover Mini Player (Pic 2)"
            className="p-1.5 text-indigo-400 hover:text-white rounded-lg hover:bg-indigo-600/30 transition-colors cursor-pointer"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={handleMinimize}
            title="Minimize Window"
            className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <Minus className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleMaximize}
            title="Maximize / Restore Window"
            className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <Square className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={handleClose}
            title="Close Window"
            className="p-1.5 text-gray-400 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
