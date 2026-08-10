import React, { useState, useEffect, useRef } from 'react';
import { useAudio } from '../context/AudioContext';
import { getAlbumGradient } from '../utils/audioMetadata';
import { Disc, Play, Music } from 'lucide-react';

export const AlbumGrid = () => {
  const { albumsMap, playTrack } = useAudio();
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [displayCount, setDisplayCount] = useState(24);
  const containerRef = useRef(null);

  const visibleAlbums = albumsMap.slice(0, displayCount);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollHeight - scrollTop <= clientHeight + 300) {
      if (displayCount < albumsMap.length) {
        setDisplayCount((prev) => Math.min(prev + 24, albumsMap.length));
      }
    }
  };

  const handlePlayAlbum = (album) => {
    if (album.tracks.length > 0) {
      playTrack(album.tracks[0], album.tracks, 0);
    }
  };

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="p-6 h-full overflow-y-auto custom-scrollbar select-none"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Disc className="w-6 h-6 text-indigo-400" />
            <span>Albums</span>
          </h2>
          <p className="text-xs text-gray-400 mt-1 font-medium">
            {albumsMap.length} albums in your collection
          </p>
        </div>
      </div>

      {albumsMap.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center text-gray-500">
          <Disc className="w-16 h-16 mb-4 opacity-40" />
          <p className="text-sm font-semibold text-gray-400">No Albums Found</p>
          <p className="text-xs mt-1">Import music files to explore your album collection</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
          {visibleAlbums.map((album) => {
            const gradient = getAlbumGradient(album.name);
            return (
              <div
                key={album.name}
                onClick={() => setSelectedAlbum(album)}
                className="group relative bg-[#13131c] hover:bg-[#191926] border border-white/5 hover:border-indigo-500/40 rounded-2xl p-3 transition-all duration-300 shadow-lg hover:shadow-indigo-500/10 cursor-pointer flex flex-col justify-between"
              >
                {/* 1:1 Album Artwork Container */}
                <div
                  className="w-full aspect-square rounded-xl overflow-hidden relative shadow-md mb-3 flex items-center justify-center flex-shrink-0"
                  style={{ background: gradient }}
                >
                  {album.picture ? (
                    <img
                      src={album.picture}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <Music className="w-10 h-10 text-white/70" />
                  )}

                  {/* Play Button Overlay */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlayAlbum(album);
                    }}
                    title="Play Album"
                    className="absolute right-2 bottom-2 w-10 h-10 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 group-hover:translate-y-0 translate-y-2 transition-all duration-300 cursor-pointer"
                  >
                    <Play className="w-5 h-5 fill-current translate-x-0.5" />
                  </button>
                </div>

                {/* Album Details */}
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-gray-100 truncate group-hover:text-indigo-400 transition-colors">
                    {album.name}
                  </h4>
                  <p className="text-[11px] text-gray-400 truncate mt-0.5">{album.artist}</p>
                  <p className="text-[10px] text-indigo-300/80 font-mono mt-1">
                    {album.tracks.length} {album.tracks.length === 1 ? 'song' : 'songs'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Album Detail Modal View */}
      {selectedAlbum && (
        <div
          onClick={() => setSelectedAlbum(null)}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#161622] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden"
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-white/10 flex items-center gap-5 relative bg-white/5">
              <div
                className="w-24 h-24 rounded-xl overflow-hidden shadow-lg flex-shrink-0 flex items-center justify-center"
                style={{ background: getAlbumGradient(selectedAlbum.name) }}
              >
                {selectedAlbum.picture ? (
                  <img src={selectedAlbum.picture} alt="" className="w-full h-full object-cover" />
                ) : (
                  <Music className="w-10 h-10 text-white/70" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block">
                  Album Collection
                </span>
                <h3 className="text-xl font-extrabold text-white truncate mt-0.5">
                  {selectedAlbum.name}
                </h3>
                <p className="text-xs text-gray-300 font-medium mt-1">{selectedAlbum.artist}</p>
                <p className="text-xs font-mono text-gray-400 mt-1">
                  {selectedAlbum.tracks.length} tracks
                </p>
              </div>

              <button
                onClick={() => handlePlayAlbum(selectedAlbum)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Play All</span>
              </button>
            </div>

            {/* Track List */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-1">
              {selectedAlbum.tracks.map((track, idx) => (
                <div
                  key={track.id}
                  onDoubleClick={() => playTrack(track, selectedAlbum.tracks, idx)}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs font-mono text-gray-500 w-5 text-right">{idx + 1}</span>
                    <div className="truncate">
                      <h5 className="text-xs font-bold text-gray-200 group-hover:text-indigo-400 transition-colors truncate">
                        {track.title}
                      </h5>
                      <p className="text-[11px] text-gray-400 truncate">{track.artist}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => playTrack(track, selectedAlbum.tracks, idx)}
                    className="p-2 rounded-lg bg-indigo-600/20 text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
