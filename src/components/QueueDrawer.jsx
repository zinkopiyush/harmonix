import React, { useState, useRef } from 'react';
import { useAudio } from '../context/AudioContext';
import { formatTime } from '../utils/audioMetadata';
import { X, Play, Trash2, Music, ListMusic } from 'lucide-react';

export const QueueDrawer = () => {
  const { queue, queueIndex, currentTrack, playTrack, removeFromQueue, clearQueue, moveInQueue, isQueueOpen, setIsQueueOpen, playHistory } =
    useAudio();

  const [displayCount, setDisplayCount] = useState(20);
  const [activeTab, setActiveTab] = useState('queue'); // 'queue' or 'history'
  const [draggedIdx, setDraggedIdx] = useState(null);
  const [dragOverIdx, setDragOverIdx] = useState(null);
  const scrollContainerRef = useRef(null);

  // Only show the current song and upcoming songs for queue tab
  const startIndex = Math.max(0, queueIndex);
  const remainingCount = Math.max(0, queue.length - startIndex);
  const visibleQueue = queue.slice(startIndex, startIndex + displayCount);

  // History tab data
  const historyCount = playHistory ? playHistory.length : 0;
  const visibleHistory = playHistory ? playHistory.slice().reverse().slice(0, displayCount) : [];

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollHeight - scrollTop <= clientHeight + 200) {
      const maxCount = activeTab === 'queue' ? remainingCount : historyCount;
      if (displayCount < maxCount) {
        setDisplayCount((prev) => Math.min(prev + 20, maxCount));
      }
    }
  };

  const handleDragOver = (e, actualIdx) => {
    e.preventDefault();
    setDragOverIdx(actualIdx);
    e.dataTransfer.dropEffect = 'move';

    if (scrollContainerRef.current) {
      const { top, bottom } = scrollContainerRef.current.getBoundingClientRect();
      const scrollThreshold = 60;
      if (e.clientY - top < scrollThreshold) {
        scrollContainerRef.current.scrollTop -= 20;
      } else if (bottom - e.clientY < scrollThreshold) {
        scrollContainerRef.current.scrollTop += 20;
      }
    }
  };

  if (!isQueueOpen) return null;

  return (
    <div
      onClick={() => setIsQueueOpen(false)}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-96 max-w-full h-full bg-[#12121c] border-l border-white/10 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300 select-none"
      >
        {/* Header */}
        <div className="p-4 border-b border-white/10 bg-white/5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ListMusic className="w-5 h-5 text-indigo-400" />
              <h3 className="font-bold text-sm text-white">Play Queue</h3>
            </div>

            <div className="flex items-center gap-2">
              {activeTab === 'queue' && queue.length > 0 && (
                <button
                  onClick={clearQueue}
                  title="Clear Queue"
                  className="p-1.5 text-gray-400 hover:text-red-400 rounded-lg hover:bg-white/10 transition-colors cursor-pointer text-xs font-semibold flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>
              )}

              <button
                data-testid="queue-close-btn"
                onClick={() => setIsQueueOpen(false)}
                className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="flex items-center bg-black/40 rounded-lg p-1">
            <button
              onClick={() => { setActiveTab('queue'); setDisplayCount(20); }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                activeTab === 'queue' ? 'bg-white/15 text-white shadow' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Up Next ({remainingCount})
            </button>
            <button
              onClick={() => { setActiveTab('history'); setDisplayCount(20); }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                activeTab === 'history' ? 'bg-white/15 text-white shadow' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              History ({historyCount})
            </button>
          </div>
        </div>

        {/* Queue / History List */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-3 custom-scrollbar space-y-1.5"
        >
          {activeTab === 'queue' ? (
            remainingCount === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 p-6">
                <Music className="w-12 h-12 mb-3 opacity-30" />
                <p className="text-sm font-semibold text-gray-400">Queue is Empty</p>
                <p className="text-xs mt-1">Play a song or add tracks to build your queue</p>
              </div>
            ) : (
              visibleQueue.map((track, idx) => {
                const actualIdx = startIndex + idx;
                const isCurrent = currentTrack && currentTrack.id === track.id && actualIdx === queueIndex;
                return (
                  <div
                    key={`queue-${track.id}-${actualIdx}`}
                    draggable={activeTab === 'queue' && actualIdx !== queueIndex}
                    onDragStart={(e) => {
                      setDraggedIdx(actualIdx);
                      e.dataTransfer.effectAllowed = 'move';
                    }}
                    onDragOver={(e) => handleDragOver(e, actualIdx)}
                    onDragLeave={() => setDragOverIdx(null)}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (draggedIdx !== null && draggedIdx !== actualIdx) {
                        let targetIdx = actualIdx;
                        if (targetIdx <= queueIndex) {
                          targetIdx = queueIndex + 1;
                        }
                        if (draggedIdx !== targetIdx) {
                          moveInQueue(draggedIdx, targetIdx);
                        }
                      }
                      setDraggedIdx(null);
                      setDragOverIdx(null);
                    }}
                    onDragEnd={() => {
                      setDraggedIdx(null);
                      setDragOverIdx(null);
                    }}
                    onDoubleClick={() => playTrack(track, queue, actualIdx)}
                    className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer group ${
                      isCurrent
                        ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-300'
                        : 'bg-white/5 border-white/5 hover:bg-white/10 text-gray-200'
                    } ${dragOverIdx === actualIdx ? 'border-indigo-400 border-t-2 bg-indigo-500/10' : ''} ${draggedIdx === actualIdx ? 'opacity-50' : ''}`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <span className="text-[11px] font-mono text-gray-500 w-4 text-right">
                        {actualIdx + 1}
                      </span>

                      <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 bg-white/10 flex items-center justify-center">
                        {track.picture ? (
                          <img src={track.picture} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Music className="w-4 h-4 text-gray-400" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h5 className="text-xs font-bold truncate group-hover:text-indigo-400 transition-colors">
                          {track.title}
                        </h5>
                        <p className="text-[10px] text-gray-400 truncate">{track.artist}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 ml-2">
                      <span className="text-[10px] font-mono text-gray-500">
                        {formatTime(track.duration)}
                      </span>
                      <button
                        onClick={() => removeFromQueue(actualIdx)}
                        title="Remove from queue"
                        className="p-1 text-gray-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )
          ) : (
            historyCount === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 p-6">
                <ListMusic className="w-12 h-12 mb-3 opacity-30" />
                <p className="text-sm font-semibold text-gray-400">History is Empty</p>
                <p className="text-xs mt-1">Recently played tracks will appear here</p>
              </div>
            ) : (
              visibleHistory.map((track, idx) => (
                <div
                  key={`hist-${track.id}-${idx}`}
                  onDoubleClick={() => {
                    const foundIdx = queue.findIndex((t) => t.id === track.id);
                    playTrack(track, queue, Math.max(0, foundIdx));
                  }}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all cursor-pointer group text-gray-400"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 bg-black/20 flex items-center justify-center grayscale opacity-60">
                      {track.picture ? (
                        <img src={track.picture} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Music className="w-4 h-4 text-gray-500" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h5 className="text-xs font-bold truncate group-hover:text-white transition-colors">
                        {track.title}
                      </h5>
                      <p className="text-[10px] text-gray-500 truncate">{track.artist}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 ml-2">
                    <span className="text-[10px] font-mono text-gray-600">
                      {formatTime(track.duration)}
                    </span>
                  </div>
                </div>
              ))
            )
          )}
        </div>
      </div>
    </div>
  );
};
