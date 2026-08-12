import React, { useState } from 'react';
import { useAudio } from '../context/AudioContext';
import { formatTime, getAlbumGradient } from '../utils/audioMetadata';
import { LyricsView } from './LyricsView';
import { VisualizerView } from './VisualizerView';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  Volume1,
  Heart,
  Music,
  X,
  Quote,
  Activity,
  Image,
  Sliders,
} from 'lucide-react';

export const BigCoverOverlay = ({ isOpen, onClose }) => {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isShuffle,
    repeatMode,
    togglePlay,
    handleNextTrack,
    handlePrevTrack,
    seekTo,
    changeVolume,
    toggleMute,
    setIsShuffle,
    setRepeatMode,
    toggleFavorite,
    setIsEqModalOpen,
  } = useAudio();

  const [imgError, setImgError] = useState(false);
  const [activeViewMode, setActiveViewMode] = useState('cover'); // 'cover' | 'lyrics' | 'visualizer'

  if (!isOpen || !currentTrack) return null;

  const albumGradient = getAlbumGradient(currentTrack.album);
  const progressPercent = duration ? (currentTime / duration) * 100 : 0;
  const volumePercent = (isMuted ? 0 : volume) * 100;

  const handleVolumeWheel = (e) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      changeVolume(volume + 0.05);
    } else if (e.deltaY > 0) {
      changeVolume(volume - 0.05);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-bg-primary text-text-primary flex flex-col justify-between p-6 sm:p-10 select-none overflow-hidden animate-in fade-in zoom-in-95 duration-200">
      {/* Dynamic Ambient Background Glow */}
      <div
        className="absolute inset-0 opacity-25 blur-3xl pointer-events-none transition-all duration-700"
        style={{ background: albumGradient }}
      ></div>

      {/* Top Overlay Header with Switcher Tabs + Equalizer Button */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-accent-hover/20 text-accent flex items-center justify-center border border-accent/30">
            <Music className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-xs uppercase tracking-wider text-text-muted">
              Now Playing View
            </h3>
            {currentTrack.bitrate && (
              <span className="text-bg-secondary font-mono text-accent">
                {currentTrack.bitrate} kbps • High Resolution
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Switcher Buttons: Cover Art, Lyrics, Visualizer, Equalizer */}
          <div className="flex items-center gap-1 bg-white/10 p-1 rounded-xl border border-border-primary">
            <button
              onClick={() => setActiveViewMode('cover')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeViewMode === 'cover'
                  ? 'bg-accent text-text-primary shadow'
                  : 'text-gray-300 hover:text-text-primary'
              }`}
            >
              <Image className="w-3.5 h-3.5" />
              <span>Cover Art</span>
            </button>

            <button
              onClick={() => setActiveViewMode(activeViewMode === 'lyrics' ? 'cover' : 'lyrics')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeViewMode === 'lyrics'
                  ? 'bg-accent text-text-primary shadow'
                  : 'text-gray-300 hover:text-text-primary'
              }`}
            >
              <Quote className="w-3.5 h-3.5" />
              <span>Synced Lyrics</span>
            </button>

            <button
              onClick={() => setActiveViewMode(activeViewMode === 'visualizer' ? 'cover' : 'visualizer')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeViewMode === 'visualizer'
                  ? 'bg-accent text-text-primary shadow'
                  : 'text-gray-300 hover:text-text-primary'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Visualizer</span>
            </button>

            <button
              onClick={() => setIsEqModalOpen(true)}
              title="Open Audio Equalizer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-300 hover:text-text-primary hover:bg-bg-hover transition-all cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5 text-accent" />
              <span>Equalizer</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-gray-300 hover:text-text-primary transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content Area (Perfectly Centered in the Middle) */}
      <div className="relative z-10 flex-1 flex items-center justify-center my-4 overflow-hidden w-full max-w-5xl mx-auto">
        {activeViewMode === 'cover' && (
          <div className="flex flex-col items-center justify-center text-center max-w-lg mx-auto space-y-6">
            {/* Centered 1:1 Album Artwork Box */}
            <div
              className="w-64 h-64 sm:w-80 sm:h-80 md:w-88 md:h-88 rounded-3xl overflow-hidden shadow-2xl border border-border-secondary relative group flex-shrink-0"
              style={{ background: albumGradient }}
            >
              {currentTrack.picture && !imgError ? (
                <img
                  src={currentTrack.picture}
                  alt=""
                  onError={() => setImgError(true)}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-text-primary/80">
                  <Music className="w-20 h-20" />
                </div>
              )}
            </div>

            {/* Centered Track Information */}
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary truncate drop-shadow-md">
                  {currentTrack.title}
                </h1>
                <button
                  onClick={() => toggleFavorite(currentTrack.id)}
                  className="text-text-muted hover:text-pink-500 transition-colors flex-shrink-0 cursor-pointer"
                >
                  <Heart
                    className={`w-6 h-6 ${
                      currentTrack.isFavorite ? 'text-pink-500 fill-pink-500' : ''
                    }`}
                  />
                </button>
              </div>

              <p className="text-lg text-accent font-semibold truncate">
                {currentTrack.artist}
              </p>

              <div className="flex items-center justify-center gap-3 text-xs text-text-muted font-mono pt-1">
                <span>{currentTrack.album}</span>
                <span>•</span>
                <span>{currentTrack.genre || 'Unknown Genre'}</span>
                {currentTrack.year && (
                  <>
                    <span>•</span>
                    <span>{currentTrack.year}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {activeViewMode === 'lyrics' && (
          <div className="w-full h-full rounded-2xl bg-bg-tertiary border border-border-primary overflow-hidden">
            <LyricsView />
          </div>
        )}

        {activeViewMode === 'visualizer' && (
          <div className="w-full h-full rounded-2xl bg-bg-tertiary border border-border-primary overflow-hidden flex items-center justify-center">
            <VisualizerView />
          </div>
        )}
      </div>

      {/* Bottom Audio Player Controls & Mouse Wheel Volume Bar */}
      <div className="relative z-10 w-full max-w-3xl mx-auto space-y-4">
        {/* Timeline Seek Bar */}
        <div className="w-full flex items-center gap-4">
          <span className="text-xs font-mono text-text-muted w-12 text-right">
            {formatTime(currentTime)}
          </span>

          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={(e) => seekTo(parseFloat(e.target.value))}
            className="flex-1 custom-slider cursor-pointer"
            style={{
              background: `linear-gradient(to right, var(--accent) 0%, var(--accent) ${progressPercent}%, var(--border-secondary) ${progressPercent}%, var(--border-secondary) 100%)`,
            }}
          />

          <span className="text-xs font-mono text-text-muted w-12">
            {formatTime(duration)}
          </span>
        </div>

        {/* Control Buttons & Mouse Scroll Volume */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsShuffle(!isShuffle)}
              className={`p-2 rounded-full transition-colors cursor-pointer ${
                isShuffle ? 'text-accent bg-accent-hover/20' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Shuffle className="w-5 h-5" />
            </button>

            <button
              onClick={() => {
                if (repeatMode === 'off') setRepeatMode('all');
                else if (repeatMode === 'all') setRepeatMode('one');
                else setRepeatMode('off');
              }}
              className={`p-2 rounded-full transition-colors cursor-pointer ${
                repeatMode !== 'off' ? 'text-accent bg-accent-hover/20' : 'text-gray-400 hover:text-white'
              }`}
            >
              {repeatMode === 'one' ? <Repeat1 className="w-5 h-5" /> : <Repeat className="w-5 h-5" />}
            </button>

            <button
              onClick={() => setIsEqModalOpen(true)}
              title="Equalizer"
              className="p-2 text-gray-400 hover:text-white rounded-full transition-colors cursor-pointer"
            >
              <Sliders className="w-5 h-5 text-accent" />
            </button>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={handlePrevTrack}
              title="Previous Track (Shift + Left Arrow)"
              className="text-gray-300 hover:text-white transition-colors cursor-pointer"
            >
              <SkipBack className="w-7 h-7 fill-current" />
            </button>

            <button
              onClick={togglePlay}
              className="w-14 h-14 rounded-full bg-accent hover:bg-accent-hover text-white flex items-center justify-center shadow-xl shadow-black/20 hover:scale-105 transition-all cursor-pointer"
            >
              {isPlaying ? (
                <Pause className="w-7 h-7 fill-current" />
              ) : (
                <Play className="w-7 h-7 fill-current translate-x-0.5" />
              )}
            </button>

            <button
              onClick={() => handleNextTrack(false)}
              title="Next Track (Shift + Right Arrow)"
              className="text-gray-300 hover:text-white transition-colors cursor-pointer"
            >
              <SkipForward className="w-7 h-7 fill-current" />
            </button>
          </div>

          {/* Mouse Wheel Scroll Volume Bar */}
          <div
            onWheel={handleVolumeWheel}
            title="Scroll mouse wheel here to adjust volume"
            className="flex items-center gap-2 p-1 rounded-lg hover:bg-white/5 transition-colors"
          >
            <button onClick={toggleMute} className="text-gray-400 hover:text-white cursor-pointer">
              {isMuted || volume === 0 ? (
                <VolumeX className="w-5 h-5 text-red-400" />
              ) : volume < 0.5 ? (
                <Volume1 className="w-5 h-5" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={isMuted ? 0 : volume}
              onChange={(e) => changeVolume(parseFloat(e.target.value))}
              className="w-24 custom-slider cursor-pointer"
              style={{
                background: `linear-gradient(to right, var(--accent) 0%, var(--accent) ${volumePercent}%, var(--border-secondary) ${volumePercent}%, var(--border-secondary) 100%)`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
