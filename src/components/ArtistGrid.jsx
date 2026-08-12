import React, { useState, useRef } from 'react';
import { useAudio } from '../context/AudioContext';
import { Users, Play, Music, Mic2, ListPlus, ArrowRightToLine } from 'lucide-react';

export const ArtistGrid = () => {
  const { artistsMap, playTrack, playNext, addToQueue } = useAudio();
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [displayCount, setDisplayCount] = useState(24);
  const containerRef = useRef(null);

  const visibleArtists = artistsMap.slice(0, displayCount);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollHeight - scrollTop <= clientHeight + 300) {
      if (displayCount < artistsMap.length) {
        setDisplayCount((prev) => Math.min(prev + 24, artistsMap.length));
      }
    }
  };

  const handlePlayArtist = (artist) => {
    if (artist.tracks.length > 0) {
      playTrack(artist.tracks[0], artist.tracks, 0);
    }
  };

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      onClick={() => setContextMenu(null)}
      className="p-6 h-full overflow-y-auto custom-scrollbar select-none relative"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-extrabold text-text-primary tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-accent" />
            <span>Artists</span>
          </h2>
          <p className="text-xs text-text-secondary mt-1 font-medium">
            {artistsMap.length} artists in your collection
          </p>
        </div>
      </div>

      {artistsMap.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center text-text-muted">
          <Mic2 className="w-16 h-16 mb-4 opacity-40" />
          <p className="text-sm font-semibold text-text-secondary">No Artists Found</p>
          <p className="text-xs mt-1">Import music files to explore artist profiles</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
          {visibleArtists.map((artist) => (
            <div
              key={artist.name}
              onClick={() => setSelectedArtist(artist)}
              onContextMenu={(e) => {
                e.preventDefault();
                setContextMenu({
                  x: e.clientX,
                  y: e.clientY,
                  artist,
                });
              }}
              className="group bg-bg-primary hover:bg-bg-hover border border-border-primary rounded-2xl p-4 transition-all duration-300 cursor-pointer flex flex-col items-center text-center justify-between"
            >
              {/* Circular Avatar */}
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden relative shadow-md mb-3 bg-bg-primary border border-border-primary flex items-center justify-center flex-shrink-0">
                {artist.picture ? (
                  <img
                    src={artist.picture}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <Mic2 className="w-10 h-10 text-accent" />
                )}

                {/* Play Button Overlay */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlayArtist(artist);
                  }}
                  title="Play Artist Tracks"
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-full bg-accent hover:bg-accent-hover text-text-primary flex items-center justify-center shadow-lg">
                    <Play className="w-5 h-5 fill-current translate-x-0.5" />
                  </div>
                </button>
              </div>

              {/* Details */}
              <div className="w-full min-w-0">
                <h4 className="text-xs font-bold text-text-primary truncate group-hover:text-accent transition-colors">
                  {artist.name}
                </h4>
                <p className="text-[11px] text-text-secondary font-mono mt-1">
                  {artist.tracks.length} {artist.tracks.length === 1 ? 'song' : 'songs'} • {artist.albums.size} {artist.albums.size === 1 ? 'album' : 'albums'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Artist Details Modal */}
      {selectedArtist && (
        <div
          onClick={() => setSelectedArtist(null)}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-bg-secondary border border-border-primary rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-border-primary flex items-center gap-5 bg-bg-tertiary">
              <div className="w-20 h-20 rounded-full overflow-hidden shadow-lg flex-shrink-0 bg-gradient-to-br from-indigo-900 to-purple-950 border border-border-primary flex items-center justify-center">
                {selectedArtist.picture ? (
                  <img src={selectedArtist.picture} alt="" className="w-full h-full object-cover" />
                ) : (
                  <Mic2 className="w-9 h-9 text-accent" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-bold text-accent uppercase tracking-widest block">
                  Artist Profile
                </span>
                <h3 className="text-xl font-extrabold text-text-primary truncate mt-0.5">
                  {selectedArtist.name}
                </h3>
                <p className="text-xs font-mono text-text-secondary mt-1">
                  {selectedArtist.tracks.length} tracks • {selectedArtist.albums.size} albums
                </p>
              </div>

              <button
                onClick={() => handlePlayArtist(selectedArtist)}
                className="px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover text-text-primary font-bold text-xs flex items-center gap-2 shadow-lg shadow-black/20 transition-all cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Play All</span>
              </button>
            </div>

            {/* Tracks */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-1">
              {selectedArtist.tracks.map((track, idx) => (
                <div
                  key={track.id}
                  onDoubleClick={() => playTrack(track, selectedArtist.tracks, idx)}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-bg-tertiary transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs font-mono text-text-muted w-5 text-right">{idx + 1}</span>
                    <div className="truncate">
                      <h5 className="text-xs font-bold text-text-primary group-hover:text-accent transition-colors truncate">
                        {track.title}
                      </h5>
                      <p className="text-[11px] text-text-secondary truncate">{track.album || 'Unknown Album'}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => playTrack(track, selectedArtist.tracks, idx)}
                    className="p-2 rounded-lg bg-accent/20 text-accent opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Right-Click Context Menu */}
      {contextMenu && (
        <div
          style={{ top: Math.min(contextMenu.y, window.innerHeight - 150), left: Math.min(contextMenu.x, window.innerWidth - 200) }}
          onClick={(e) => e.stopPropagation()}
          className="fixed z-50 bg-bg-secondary border border-border-primary rounded-xl shadow-2xl p-1.5 w-48 text-xs animate-in fade-in zoom-in-95 duration-150"
        >
          <button
            onClick={() => {
              handlePlayArtist(contextMenu.artist);
              setContextMenu(null);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-left rounded-lg text-text-primary hover:text-text-primary hover:bg-bg-hover transition-colors cursor-pointer"
          >
            <Play className="w-4 h-4 text-accent fill-current" />
            <span>Play Artist</span>
          </button>

          <button
            onClick={() => {
              if (contextMenu.artist.tracks.length > 0) {
                playNext(contextMenu.artist.tracks);
              }
              setContextMenu(null);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-left rounded-lg text-text-primary hover:text-text-primary hover:bg-bg-hover transition-colors cursor-pointer"
          >
            <ArrowRightToLine className="w-4 h-4 text-accent" />
            <span>Play Next</span>
          </button>

          <button
            onClick={() => {
              if (contextMenu.artist.tracks.length > 0) {
                addToQueue(contextMenu.artist.tracks);
              }
              setContextMenu(null);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-left rounded-lg text-text-primary hover:text-text-primary hover:bg-bg-hover transition-colors cursor-pointer"
          >
            <ListPlus className="w-4 h-4 text-accent" />
            <span>Add to Queue</span>
          </button>
        </div>
      )}
    </div>
  );
};
