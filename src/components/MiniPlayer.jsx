import React, { useState } from 'react';
import { useAudio } from '../context/AudioContext';
import { formatTime, getAlbumGradient } from '../utils/audioMetadata';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Music,
  Maximize2,
  X,
  Music2,
  Volume2,
  VolumeX,
} from 'lucide-react';

export const MiniPlayer = () => {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    togglePlay,
    handleNextTrack,
    handlePrevTrack,
    seekTo,
    changeVolume,
    toggleMute,
    setIsMiniMode,
  } = useAudio();

  const [imgError, setImgError] = useState(false);

  const handleExpandApp = async () => {
    if (window.electronAPI && window.electronAPI.toggleMiniMode) {
      await window.electronAPI.toggleMiniMode();
    }
    setIsMiniMode(false);
  };

  const handleCloseApp = () => {
    if (window.electronAPI && window.electronAPI.close) {
      window.electronAPI.close();
    }
  };

  const handleVolumeWheel = (e) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      changeVolume(volume + 0.05);
    } else if (e.deltaY > 0) {
      changeVolume(volume - 0.05);
    }
  };

  const albumGradient = getAlbumGradient(currentTrack ? currentTrack.album : 'Harmonix');
  const progressPercent = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className="w-full h-full bg-[#0d0d14] text-white flex flex-col justify-between p-5 select-none relative overflow-hidden drag-header border border-white/10 rounded-2xl shadow-2xl">
      {/* Dynamic Background Glow */}
      <div
        className="absolute inset-0 opacity-20 blur-3xl pointer-events-none"
        style={{ background: albumGradient }}
      ></div>

      {/* Top Header Bar */}
      <div className="relative z-10 flex items-center justify-between no-drag" style={{ WebkitAppRegion: 'no-drag' }}>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow">
            <Music2 className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-extrabold tracking-wide text-indigo-300">
            Harmonix
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleExpandApp}
            title="Expand Window"
            className="p-1 text-gray-400 hover:text-white rounded hover:bg-white/10 transition-colors cursor-pointer"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleCloseApp}
            title="Close Window"
            className="p-1 text-gray-400 hover:text-red-400 rounded hover:bg-red-500/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Center 1:1 Square Album Cover Artwork */}
      <div className="relative z-10 flex flex-col items-center text-center my-auto px-2">
        <div
          className="w-56 h-56 rounded-2xl overflow-hidden shadow-2xl border border-white/15 relative group mb-4 flex-shrink-0"
          style={{ background: albumGradient }}
        >
          {currentTrack && currentTrack.picture && !imgError ? (
            <img
              src={currentTrack.picture}
              alt=""
              onError={() => setImgError(true)}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/80">
              <Music className="w-16 h-16" />
            </div>
          )}
        </div>

        {/* Song Title & Artist */}
        {currentTrack ? (
          <div className="w-full max-w-[260px]">
            <h3 className="font-extrabold text-sm text-gray-100 truncate">{currentTrack.title}</h3>
            <p className="text-xs text-gray-400 truncate mt-0.5 font-medium">{currentTrack.artist}</p>
          </div>
        ) : (
          <div>
            <h3 className="font-extrabold text-sm text-gray-200">No Track Playing</h3>
            <p className="text-xs text-gray-500 mt-0.5">Select a song to play</p>
          </div>
        )}
      </div>

      {/* Bottom Timeline Progress Slider & Playback Controls */}
      <div className="relative z-10 space-y-3 no-drag" style={{ WebkitAppRegion: 'no-drag' }}>
        <div className="w-full border-t border-white/10 pt-2"></div>

        {/* Timeline Seek Bar */}
        <div className="flex items-center gap-2.5">
          <span className="text-[10px] font-mono text-gray-400 w-8 text-right">
            {formatTime(currentTime)}
          </span>

          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={(e) => seekTo(parseFloat(e.target.value))}
            className="flex-1 cursor-pointer"
            style={{
              background: `linear-gradient(to right, #6366f1 0%, #6366f1 ${progressPercent}%, rgba(255, 255, 255, 0.15) ${progressPercent}%, rgba(255, 255, 255, 0.15) 100%)`,
            }}
          />

          <span className="text-[10px] font-mono text-gray-400 w-8">
            {formatTime(duration)}
          </span>
        </div>

        {/* Controls: Prev, Big Round Play/Pause, Next & Wheel Volume */}
        <div className="flex items-center justify-between pt-1">
          <div
            onWheel={handleVolumeWheel}
            title="Scroll mouse wheel to adjust volume"
            className="flex items-center gap-1 cursor-pointer hover:bg-white/5 p-1 rounded-lg"
          >
            <button onClick={toggleMute} className="text-gray-400 hover:text-white cursor-pointer">
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-red-400" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={handlePrevTrack}
              title="Previous Track (Shift + Left Arrow)"
              className="text-gray-300 hover:text-white transition-colors cursor-pointer"
            >
              <SkipBack className="w-6 h-6 fill-current" />
            </button>

            <button
              onClick={togglePlay}
              className="w-12 h-12 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-600/50 hover:scale-105 transition-all cursor-pointer"
            >
              {isPlaying ? (
                <Pause className="w-6 h-6 fill-current" />
              ) : (
                <Play className="w-6 h-6 fill-current translate-x-0.5" />
              )}
            </button>

            <button
              onClick={() => handleNextTrack(false)}
              title="Next Track (Shift + Right Arrow)"
              className="text-gray-300 hover:text-white transition-colors cursor-pointer"
            >
              <SkipForward className="w-6 h-6 fill-current" />
            </button>
          </div>

          <div className="w-5"></div>
        </div>
      </div>
    </div>
  );
};
