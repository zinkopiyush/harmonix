import React, { useState } from 'react';
import { useAudio } from '../context/AudioContext';
import { formatTime, getAlbumGradient } from '../utils/audioMetadata';
import { BigCoverOverlay } from './BigCoverOverlay';
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
  Sliders,
  ListMusic,
  Activity,
  Quote,
  Heart,
  Gauge,
  Music,
  Maximize2,
  Mic2,
} from 'lucide-react';

export const PlayerBar = () => {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    playbackRate,
    isShuffle,
    repeatMode,
    togglePlay,
    handleNextTrack,
    handlePrevTrack,
    seekTo,
    changeVolume,
    toggleMute,
    changePlaybackRate,
    setIsShuffle,
    setRepeatMode,
    toggleFavorite,
    setIsEqModalOpen,
    isQueueOpen,
    setIsQueueOpen,
    activeTab,
    setActiveTab,
  } = useAudio();

  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [isBigCoverOpen, setIsBigCoverOpen] = useState(false);

  const speedOptions = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];

  const albumGradient = getAlbumGradient(currentTrack ? currentTrack.album : 'Harmonix');
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
    <>
      <footer className="h-20 bg-bg-secondary border-t border-border-primary flex items-center justify-between px-4 select-none relative z-40">
        {/* Left Track Info Section */}
        <div className="flex items-center gap-3 w-60 min-w-[200px] flex-shrink-0">
          {currentTrack ? (
            <>
              <div
                className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 shadow-lg relative group cursor-pointer border border-border-primary"
                onClick={() => setIsBigCoverOpen(true)}
                title="Expand Big Cover Art"
                style={{ background: albumGradient }}
              >
                {currentTrack.picture && !imgError ? (
                  <img
                    src={currentTrack.picture}
                    alt=""
                    onError={() => setImgError(true)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-text-muted">
                    <Music className="w-5 h-5" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Maximize2 className="w-4 h-4 text-white" />
                </div>
              </div>

              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-sm font-bold text-text-primary truncate">
                  {currentTrack.title}
                </span>
                <span className="text-xs text-text-muted truncate">
                  {currentTrack.artist}
                </span>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3 text-text-muted text-xs font-medium">
              <div className="w-12 h-12 rounded-xl bg-bg-tertiary border border-border-primary flex items-center justify-center">
                <Music className="w-5 h-5 text-text-muted" />
              </div>
              <div>
                <p className="text-text-primary font-medium">No Track Playing</p>
                <p className="text-[10px] text-text-muted">Select a song to play</p>
              </div>
            </div>
          )}
        </div>

        {/* Center Controls & Progress Bar */}
        <div className="flex-1 max-w-xl px-4 flex flex-col items-center gap-1.5">
          <div className="flex items-center gap-4 text-text-muted">
            <button
              onClick={() => setIsShuffle(!isShuffle)}
              title={isShuffle ? 'Shuffle On' : 'Shuffle Off'}
              className={`p-2 rounded-full transition-all ${
                isShuffle ? 'text-accent hover:bg-accent/10' : 'hover:text-text-primary hover:bg-bg-hover'
              }`}
            >
              <Shuffle className="w-4 h-4" />
            </button>

            <button
              onClick={handlePrevTrack}
              title="Previous Track"
              className="p-2 rounded-full hover:text-text-primary hover:bg-bg-hover transition-colors"
            >
              <SkipBack className="w-5 h-5 fill-current" />
            </button>

            <button
              onClick={togglePlay}
              title={isPlaying ? 'Pause' : 'Play'}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-text-primary text-bg-primary hover:scale-105 transition-all shadow-md"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current translate-x-0.5" />
              )}
            </button>

            <button
              onClick={() => handleNextTrack(false)}
              title="Next Track"
              className="p-2 rounded-full hover:text-text-primary hover:bg-bg-hover transition-colors"
            >
              <SkipForward className="w-5 h-5 fill-current" />
            </button>

            <button
              onClick={() => {
                if (repeatMode === 'off') setRepeatMode('all');
                else if (repeatMode === 'all') setRepeatMode('one');
                else setRepeatMode('off');
              }}
              title={`Repeat: ${repeatMode}`}
              className={`p-2 rounded-full transition-all ${
                repeatMode !== 'off' ? 'text-accent hover:bg-accent/10' : 'hover:text-text-primary hover:bg-bg-hover'
              }`}
            >
              {repeatMode === 'one' ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
            </button>
          </div>

          <div className="w-full flex items-center gap-3">
            <span className="text-[11px] font-mono text-text-muted w-10 text-right">
              {formatTime(currentTime)}
            </span>

            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={(e) => seekTo(parseFloat(e.target.value))}
              className="flex-1 custom-slider"
              style={{
                background: `linear-gradient(to right, var(--accent) 0%, var(--accent) ${progressPercent}%, var(--border-secondary) ${progressPercent}%, var(--border-secondary) 100%)`
              }}
            />

            <span className="text-[11px] font-mono text-text-muted w-10">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Right Feature Controls */}
        <div className="flex items-center justify-end gap-1.5 w-60 min-w-[200px] flex-shrink-0">
          <button
            onClick={() => setActiveTab(activeTab === 'visualizer' ? 'songs' : 'visualizer')}
            title="Visualizer"
            className={`p-1.5 rounded-md transition-colors ${
              activeTab === 'visualizer' ? 'bg-accent/20 text-accent' : 'hover:bg-bg-hover text-text-muted hover:text-text-primary'
            }`}
          >
            <Activity className="w-4 h-4" />
          </button>

          <button
            onClick={() => setActiveTab(activeTab === 'lyrics' ? 'songs' : 'lyrics')}
            title="Synced Lyrics"
            className={`p-1.5 rounded-md transition-colors ${
              activeTab === 'lyrics' ? 'bg-accent/20 text-accent' : 'hover:bg-bg-hover text-text-muted hover:text-text-primary'
            }`}
          >
            <Mic2 className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsEqModalOpen(true)}
            title="Equalizer"
            className="p-1.5 rounded-md hover:bg-bg-hover text-text-muted hover:text-text-primary transition-colors"
          >
            <Sliders className="w-4 h-4" />
          </button>

          <button
            data-testid="queue-toggle-btn"
            onClick={() => setIsQueueOpen(!isQueueOpen)}
            title="Play Queue"
            className={`p-1.5 rounded-md transition-colors ${
              isQueueOpen ? 'bg-accent/20 text-accent' : 'hover:bg-bg-hover text-text-muted hover:text-text-primary'
            }`}
          >
            <ListMusic className="w-4 h-4" />
          </button>

          <div className="relative">
            <button
              onClick={() => setShowSpeedMenu(!showSpeedMenu)}
              title={`Playback Speed (${playbackRate}x)`}
              className={`p-1.5 rounded-md transition-colors ${
                playbackRate !== 1.0 ? 'bg-accent/20 text-accent' : 'hover:bg-bg-hover text-text-muted hover:text-text-primary'
              }`}
            >
              <Gauge className="w-4 h-4" />
            </button>

            {showSpeedMenu && (
              <div className="absolute right-0 bottom-12 bg-bg-secondary border border-border-primary rounded-xl shadow-2xl p-3 w-44 z-50 text-xs space-y-2">
                <div className="text-text-muted font-bold px-2 mb-2 uppercase tracking-wider">Speed</div>
                <div className="grid grid-cols-3 gap-1">
                  {speedOptions.map((rate) => (
                    <button
                      key={rate}
                      onClick={() => {
                        changePlaybackRate(rate);
                        setShowSpeedMenu(false);
                      }}
                      className={`py-1 text-[11px] font-semibold rounded transition-colors ${
                        playbackRate === rate
                          ? 'bg-accent text-white'
                          : 'bg-bg-tertiary text-text-primary hover:bg-bg-hover'
                      }`}
                    >
                      {rate}x
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Mouse Wheel Scrollable Volume Bar */}
          <div
            onWheel={handleVolumeWheel}
            title="Scroll mouse wheel here to adjust volume"
            className="flex items-center gap-1.5 ml-1 p-1 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
          >
            <button onClick={toggleMute} className="text-gray-400 hover:text-white cursor-pointer">
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-red-400" />
              ) : volume < 0.5 ? (
                <Volume1 className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={isMuted ? 0 : volume}
              onChange={(e) => changeVolume(parseFloat(e.target.value))}
              className="w-16 sm:w-20 custom-slider"
              style={{
                background: `linear-gradient(to right, var(--accent) 0%, var(--accent) ${volumePercent}%, var(--border-secondary) ${volumePercent}%, var(--border-secondary) 100%)`
              }}
            />
          </div>
        </div>
      </footer>

      {/* Big Cover Overlay Window */}
      <BigCoverOverlay isOpen={isBigCoverOpen} onClose={() => setIsBigCoverOpen(false)} />
    </>
  );
};
