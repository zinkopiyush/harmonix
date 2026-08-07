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
  Speaker,
  Gauge,
  Music,
  Maximize2,
  MoreHorizontal,
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
    audioDevices,
    selectedDevice,
    changeAudioDevice,
  } = useAudio();

  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [isBigCoverOpen, setIsBigCoverOpen] = useState(false);

  const speedOptions = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];

  const albumGradient = getAlbumGradient(currentTrack ? currentTrack.album : 'Harmonix');
  const progressPercent = duration ? (currentTime / duration) * 100 : 0;
  const volumePercent = (isMuted ? 0 : volume) * 100;

  return (
    <>
      <footer className="h-20 bg-[#0d0d14] border-t border-white/10 flex items-center justify-between px-4 select-none relative z-40">
        {/* Left Track Info Section */}
        <div className="flex items-center gap-3 w-60 min-w-[200px] flex-shrink-0">
          {currentTrack ? (
            <>
              <div
                className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 shadow-lg relative group cursor-pointer border border-white/10"
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
                  <div className="w-full h-full flex items-center justify-center text-white/80">
                    <Music className="w-5 h-5" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Maximize2 className="w-4 h-4 text-white" />
                </div>
              </div>

              <div className="overflow-hidden min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h4
                    className="text-xs font-bold text-gray-100 truncate hover:underline cursor-pointer"
                    onClick={() => setIsBigCoverOpen(true)}
                  >
                    {currentTrack.title}
                  </h4>
                  <button
                    onClick={() => toggleFavorite(currentTrack.id)}
                    className="text-gray-400 hover:text-pink-500 transition-colors flex-shrink-0 cursor-pointer"
                  >
                    <Heart
                      className={`w-3.5 h-3.5 ${
                        currentTrack.isFavorite ? 'text-pink-500 fill-pink-500' : ''
                      }`}
                    />
                  </button>
                </div>
                <p className="text-[11px] text-gray-400 truncate mt-0.5">{currentTrack.artist}</p>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3 text-gray-500 text-xs font-medium">
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center">
                <Music className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-gray-300 font-medium">No Track Playing</p>
                <p className="text-[10px] text-gray-500">Select a song to play</p>
              </div>
            </div>
          )}
        </div>

        {/* Center Controls & Progress Bar */}
        <div className="flex-1 max-w-xl px-4 flex flex-col items-center gap-1.5">
          <div className="flex items-center gap-5">
            <button
              onClick={() => setIsShuffle(!isShuffle)}
              title={isShuffle ? 'Shuffle On' : 'Shuffle Off'}
              className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                isShuffle ? 'text-indigo-400 bg-indigo-500/20' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Shuffle className="w-4 h-4" />
            </button>

            <button
              onClick={handlePrevTrack}
              title="Previous Track"
              className="text-gray-300 hover:text-white transition-colors cursor-pointer"
            >
              <SkipBack className="w-5 h-5 fill-current" />
            </button>

            <button
              onClick={togglePlay}
              title={isPlaying ? 'Pause' : 'Play'}
              className="w-10 h-10 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-600/40 hover:scale-105 transition-all cursor-pointer"
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
              className="text-gray-300 hover:text-white transition-colors cursor-pointer"
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
              className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                repeatMode !== 'off' ? 'text-indigo-400 bg-indigo-500/20' : 'text-gray-400 hover:text-white'
              }`}
            >
              {repeatMode === 'one' ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
            </button>
          </div>

          <div className="w-full flex items-center gap-3">
            <span className="text-[11px] font-mono text-gray-400 w-10 text-right">
              {formatTime(currentTime)}
            </span>

            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={(e) => seekTo(parseFloat(e.target.value))}
              className="flex-1"
              style={{
                background: `linear-gradient(to right, #6366f1 0%, #6366f1 ${progressPercent}%, rgba(255, 255, 255, 0.15) ${progressPercent}%, rgba(255, 255, 255, 0.15) 100%)`,
              }}
            />

            <span className="text-[11px] font-mono text-gray-400 w-10">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Right Feature Controls */}
        <div className="flex items-center justify-end gap-2 w-60 min-w-[200px] flex-shrink-0">
          <button
            onClick={() => setActiveTab(activeTab === 'visualizer' ? 'songs' : 'visualizer')}
            title="Visualizer"
            className={`p-2 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'visualizer' ? 'text-indigo-400 bg-indigo-500/20' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Activity className="w-4 h-4" />
          </button>

          <button
            onClick={() => setActiveTab(activeTab === 'lyrics' ? 'songs' : 'lyrics')}
            title="Synced Lyrics"
            className={`p-2 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'lyrics' ? 'text-indigo-400 bg-indigo-500/20' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Quote className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsEqModalOpen(true)}
            title="Equalizer"
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <Sliders className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsQueueOpen(!isQueueOpen)}
            title="Play Queue"
            className={`p-2 rounded-lg transition-colors cursor-pointer ${
              isQueueOpen ? 'text-indigo-400 bg-indigo-500/20' : 'text-gray-400 hover:text-white'
            }`}
          >
            <ListMusic className="w-4 h-4" />
          </button>

          <div className="relative">
            <button
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              title="Audio Output & Speed Options"
              className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {showMoreMenu && (
              <div className="absolute right-0 bottom-12 bg-[#161622] border border-white/10 rounded-xl shadow-2xl p-3 w-56 z-50 text-xs space-y-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1 flex items-center gap-1">
                    <Gauge className="w-3 h-3 text-indigo-400" />
                    <span>Speed ({playbackRate}x)</span>
                  </label>
                  <div className="grid grid-cols-3 gap-1">
                    {speedOptions.map((rate) => (
                      <button
                        key={rate}
                        onClick={() => changePlaybackRate(rate)}
                        className={`py-1 text-[11px] font-semibold rounded ${
                          playbackRate === rate
                            ? 'bg-indigo-600 text-white'
                            : 'bg-white/5 text-gray-300 hover:bg-white/10'
                        }`}
                      >
                        {rate}x
                      </button>
                    ))}
                  </div>
                </div>

                {audioDevices.length > 0 && (
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1 flex items-center gap-1">
                      <Speaker className="w-3 h-3 text-indigo-400" />
                      <span>Audio Output</span>
                    </label>
                    <select
                      value={selectedDevice}
                      onChange={(e) => changeAudioDevice(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-gray-200 text-[11px] focus:outline-none"
                    >
                      <option value="">Default Speaker</option>
                      {audioDevices.map((d) => (
                        <option key={d.deviceId} value={d.deviceId} className="bg-[#161622]">
                          {d.label || `Device ${d.deviceId.slice(0, 5)}...`}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5 ml-1">
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
              className="w-20"
              style={{
                background: `linear-gradient(to right, #6366f1 0%, #6366f1 ${volumePercent}%, rgba(255, 255, 255, 0.15) ${volumePercent}%, rgba(255, 255, 255, 0.15) 100%)`,
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
