import React from 'react';
import { useAudio } from '../context/AudioContext';
import { formatTime, getAlbumGradient } from '../utils/audioMetadata';
import { ListMusic, X, Trash2, Play, Music } from 'lucide-react';

export const QueueDrawer = () => {
  const {
    isQueueOpen,
    setIsQueueOpen,
    queue,
    queueIndex,
    currentTrack,
    playTrack,
    removeFromQueue,
    clearQueue,
  } = useAudio();

  if (!isQueueOpen) return null;

  return (
    <aside className="w-80 bg-[#12121c]/95 backdrop-blur-2xl border-l border-white/10 flex flex-col justify-between z-30 animate-in slide-in-from-right duration-200 shadow-2xl">
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ListMusic className="w-4 h-4 text-indigo-400" />
          <h3 className="font-bold text-xs text-gray-100 uppercase tracking-wider">
            Up Next Queue ({queue.length})
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {queue.length > 0 && (
            <button
              onClick={clearQueue}
              title="Clear Queue"
              className="text-[10px] text-red-400 hover:text-red-300 transition-colors"
            >
              Clear All
            </button>
          )}
          <button
            onClick={() => setIsQueueOpen(false)}
            className="p-1 text-gray-400 hover:text-white rounded hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Queue Tracks List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1 divide-y divide-white/5">
        {queue.length > 0 ? (
          queue.map((track, index) => {
            const isPlayingThis = index === queueIndex;
            const grad = getAlbumGradient(track.album);

            return (
              <div
                key={`${track.id}-${index}`}
                className={`flex items-center justify-between p-2 rounded-lg text-xs group transition-all ${
                  isPlayingThis
                    ? 'bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 font-semibold'
                    : 'hover:bg-white/5 text-gray-300'
                }`}
              >
                <div
                  className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer"
                  onClick={() => playTrack(track, queue, index)}
                >
                  <div
                    className="w-8 h-8 rounded overflow-hidden flex-shrink-0 border border-white/10 flex items-center justify-center text-white/70"
                    style={{ background: track.picture ? 'transparent' : grad }}
                  >
                    {track.picture ? (
                      <img src={track.picture} alt={track.title} className="w-full h-full object-cover" />
                    ) : (
                      <Music className="w-3.5 h-3.5" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs">{track.title}</p>
                    <p className="text-[10px] text-gray-400 truncate">{track.artist}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 font-mono text-[10px] text-gray-400">
                  <span>{formatTime(track.duration)}</span>
                  <button
                    onClick={() => removeFromQueue(index)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-400 rounded transition-opacity"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-500 text-xs p-6 text-center">
            <ListMusic className="w-10 h-10 mb-2 text-gray-600" />
            <p>Your play queue is empty</p>
            <p className="text-[10px] text-gray-600 mt-1">
              Right-click any track and select "Add to Queue" to build your playlist.
            </p>
          </div>
        )}
      </div>
    </aside>
  );
};
