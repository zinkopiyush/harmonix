import React, { useState, useMemo, useEffect, useRef, memo } from 'react';
import { useAudio } from '../context/AudioContext';
import { formatTime, getAlbumGradient } from '../utils/audioMetadata';
import { ConfirmModal } from './ConfirmModal';
import {
  Play,
  Pause,
  Heart,
  MoreVertical,
  Music,
  ListPlus,
  Edit,
  Folder,
  Trash2,
  ArrowUpDown,
  Maximize2,
  Minimize2,
  SlidersHorizontal,
  Check,
  Plus,
  ChevronRight,
  ListMusic,
} from 'lucide-react';

const TrackRow = memo(({
  track,
  index,
  isCurrent,
  isPlaying,
  onPlay,
  onToggleFavorite,
  playlists,
  onAddToPlaylist,
  onEditTags,
  onShowInFolder,
  onRemoveTrack,
  onPlayNext,
  onAddToQueue,
  density,
  visibleCols,
  onContextMenu,
  playlistContextId,
}) => {
  const [imgFailed, setImgFailed] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showPlaylistSubmenu, setShowPlaylistSubmenu] = useState(false);
  const albumGrad = useMemo(() => getAlbumGradient(track.album), [track.album]);

  useEffect(() => {
    if (!isMenuOpen) return;
    const handleClose = () => {
      setIsMenuOpen(false);
      setShowPlaylistSubmenu(false);
    };
    window.addEventListener('click', handleClose);
    window.addEventListener('scroll', handleClose, true);
    return () => {
      window.removeEventListener('click', handleClose);
      window.removeEventListener('scroll', handleClose, true);
    };
  }, [isMenuOpen]);

  const isCompact = density === 'compact';
  const coverSizeClass = isCompact ? 'w-9 h-9' : 'w-12 h-12 sm:w-14 sm:h-14';

  return (
    <div
      onDoubleClick={onPlay}
      onContextMenu={(e) => {
        e.preventDefault();
        onContextMenu(e, track);
      }}
      className={`flex items-center gap-4 px-4 rounded-xl text-xs group transition-colors duration-100 relative select-none cursor-pointer transform-gpu ${
        isMenuOpen ? 'z-50' : 'z-0'
      } ${
        isCompact ? 'py-2' : 'py-3'
      } ${
        isCurrent
          ? 'bg-accent/15 border border-accent/30 text-accent shadow-md'
          : 'hover:bg-bg-hover text-text-secondary'
      }`}
    >
      {/* 1. Serial No. Column */}
      {visibleCols.serialNo && (
        <div className="w-10 flex-shrink-0 flex items-center justify-center relative">
          <span className={`group-hover:hidden font-mono text-xs ${isCurrent ? 'text-accent font-bold' : 'text-text-muted'}`}>
            {isCurrent && isPlaying ? (
              <div className="flex items-end justify-center gap-0.5 h-3">
                <span className="w-0.5 bg-accent animate-[bounce_1s_infinite_100ms] h-full"></span>
                <span className="w-0.5 bg-accent animate-[bounce_1s_infinite_300ms] h-2/3"></span>
                <span className="w-0.5 bg-accent animate-[bounce_1s_infinite_200ms] h-4/5"></span>
              </div>
            ) : (
              index + 1
            )}
          </span>
          <button
            onClick={onPlay}
            title="Double-click row or click play icon"
            className="hidden group-hover:flex items-center justify-center w-7 h-7 rounded-full bg-accent text-text-primary shadow-lg shadow-black/20 cursor-pointer"
          >
            {isCurrent && isPlaying ? (
              <Pause className="w-3.5 h-3.5 fill-current" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current translate-x-0.5" />
            )}
          </button>
        </div>
      )}

      {/* 2. Song Title & Cover Artwork */}
      {visibleCols.title && (
        <div className="flex-1 min-w-0 flex items-center gap-3.5">
          <div
            className={`${coverSizeClass} rounded-xl overflow-hidden flex-shrink-0 border border-border-primary flex items-center justify-center text-text-primary/70 shadow-md`}
            style={{ background: albumGrad }}
          >
            {track.picture && !imgFailed ? (
              <img
                src={track.picture}
                alt=""
                onError={() => setImgFailed(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <Music className={isCompact ? 'w-4 h-4' : 'w-6 h-6'} />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p
              className={`font-bold truncate hover:underline ${
                isCompact ? 'text-xs' : 'text-sm sm:text-base'
              } ${isCurrent ? 'text-accent' : 'text-text-primary'}`}
            >
              {track.title}
            </p>
            <p className="text-[11px] text-text-secondary truncate mt-0.5">
              {track.genre || 'Unknown Genre'}
            </p>
          </div>
        </div>
      )}

      {/* 3. Artist Column */}
      {visibleCols.artist && (
        <div className="w-1/4 hidden md:block truncate text-text-primary font-semibold text-xs sm:text-sm">
          {track.artist}
        </div>
      )}

      {/* 4. Album Column */}
      {visibleCols.album && (
        <div className="w-1/5 hidden lg:block truncate text-text-secondary text-xs">
          {track.album}
        </div>
      )}

      {/* 5. Time & Actions */}
      {visibleCols.time && (
        <div className="w-24 flex-shrink-0 flex items-center justify-end gap-3 font-mono text-text-secondary text-xs">
          <button
            onClick={onToggleFavorite}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-text-secondary hover:text-pink-500 cursor-pointer"
          >
            <Heart
              className={`w-4 h-4 ${
                track.isFavorite ? 'text-pink-500 fill-pink-500 opacity-100' : ''
              }`}
            />
          </button>

          <span>{formatTime(track.duration)}</span>

          {/* 3-Dot Context Menu Toggle */}
          <div className="relative">
            <button
              data-testid="track-row-menu-btn"
              onClick={(e) => {
                e.stopPropagation();
                setIsMenuOpen(!isMenuOpen);
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 text-text-secondary hover:text-text-primary rounded-md hover:bg-white/10 cursor-pointer"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 top-7 bg-bg-secondary border border-white/15 rounded-2xl shadow-2xl p-2 w-60 z-50 text-xs space-y-1">
                <div className="px-2.5 py-1.5 border-b border-border-primary flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded bg-accent-hover/20 text-accent flex items-center justify-center flex-shrink-0">
                    <Music className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-text-primary truncate text-[11px]">{track.title}</p>
                    <p className="text-[9px] text-text-secondary truncate">{track.artist}</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    onPlayNext();
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/10 text-text-primary font-medium transition-colors cursor-pointer"
                >
                  <Play className="w-4 h-4 text-accent fill-current" />
                  <span>Play Next</span>
                </button>

                <button
                  onClick={() => {
                    onAddToQueue();
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/10 text-text-primary font-medium transition-colors cursor-pointer"
                >
                  <ListPlus className="w-4 h-4 text-accent" />
                  <span>Add to Queue</span>
                </button>

                {playlists.length > 0 && (
                  <div className="border-t border-border-primary pt-1 mt-1">
                    <button
                      onClick={() => setShowPlaylistSubmenu(!showPlaylistSubmenu)}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-white/10 text-accent font-medium transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <ListMusic className="w-4 h-4 text-accent" />
                        <span>Add to Playlist</span>
                      </div>
                      <ChevronRight className={`w-3.5 h-3.5 transition-transform ${showPlaylistSubmenu ? 'rotate-90' : ''}`} />
                    </button>

                    {showPlaylistSubmenu && (
                      <div className="pl-3 pr-1 py-1 space-y-1 max-h-36 overflow-y-auto bg-black/20 rounded-xl my-1 border border-border-secondary">
                        {playlists.map((pl) => (
                          <button
                            key={pl.id}
                            onClick={() => {
                              onAddToPlaylist(pl.id);
                              setIsMenuOpen(false);
                            }}
                            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-accent/30 text-text-secondary hover:text-accent-hover text-[11px] font-medium transition-colors cursor-pointer"
                          >
                            <span className="truncate">{pl.name}</span>
                            <Plus className="w-3 h-3 text-accent flex-shrink-0" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="border-t border-border-primary pt-1 mt-1">
                  <button
                    onClick={() => {
                      onEditTags();
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/10 text-text-primary font-medium transition-colors cursor-pointer"
                  >
                    <Edit className="w-4 h-4 text-accent" />
                    <span>Edit Song Info</span>
                  </button>

                  <button
                    onClick={() => {
                      onShowInFolder();
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/10 text-text-primary font-medium transition-colors cursor-pointer"
                  >
                    <Folder className="w-4 h-4 text-accent" />
                    <span>Show in File Explorer</span>
                  </button>

                  <button
                    onClick={() => {
                      onRemoveTrack();
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-red-500/20 text-red-400 font-medium transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>{playlistContextId ? 'Remove from Playlist' : 'Remove from Library'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
});

export const TrackList = ({
  trackItems,
  title = 'All Songs',
  subtitle = '',
  hideHeader = false,
  hideViewOptions = false,
  playlistContextId = null,
  topContent = null,
}) => {
  const {
    currentTrack,
    isPlaying,
    playTrack,
    togglePlay,
    toggleFavorite,
    addToQueue,
    playNext,
    playlists,
    addTrackToPlaylist,
    removeTrackFromPlaylist,
    removeTrack,
    setEditingTrack,
    setIsTagEditorOpen,
  } = useAudio();

  const [sortField, setSortField] = useState('title');
  const [sortDirection, setSortDirection] = useState('asc');
  const [density, setDensity] = useState('comfortable');
  const [showColSettings, setShowColSettings] = useState(false);

  const [visibleCols, setVisibleCols] = useState({
    serialNo: true,
    title: true,
    artist: true,
    album: true,
    time: true,
  });

  const [trackToDelete, setTrackToDelete] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [contextMenu, setContextMenu] = useState(null);
  const [showContextPlaylistSubmenu, setShowContextPlaylistSubmenu] = useState(false);

  const uniqueTracks = useMemo(() => {
    const seen = new Set();
    const result = [];
    for (const t of trackItems) {
      const key = `${(t.title || '').toLowerCase()}|${(t.artist || '').toLowerCase()}|${t.duration || 0}`;
      if (!seen.has(key)) {
        seen.add(key);
        result.push(t);
      }
    }
    return result;
  }, [trackItems]);

  // Initial render batch of 30 items for instant load (<5ms)
  const [visibleCount, setVisibleCount] = useState(30);
  const containerRef = useRef(null);
  const sentinelRef = useRef(null);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < 600) {
      setVisibleCount((prev) => Math.min(prev + 30, uniqueTracks.length));
    }
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleNativeScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      if (scrollHeight - scrollTop - clientHeight < 600) {
        setVisibleCount((prev) => Math.min(prev + 30, uniqueTracks.length));
      }
    };

    el.addEventListener('scroll', handleNativeScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleNativeScroll);
  }, [uniqueTracks.length]);

  useEffect(() => {
    setVisibleCount(30);
  }, [playlistContextId, title]);

  useEffect(() => {
    const handleClickOutside = () => {
      setContextMenu(null);
      setShowColSettings(false);
    };
    window.addEventListener('click', handleClickOutside);
    window.addEventListener('scroll', handleClickOutside, true);
    return () => {
      window.removeEventListener('click', handleClickOutside);
      window.removeEventListener('scroll', handleClickOutside, true);
    };
  }, []);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedTracks = useMemo(() => {
    return [...uniqueTracks].sort((a, b) => {
      let valA = a[sortField] || '';
      let valB = b[sortField] || '';

      if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [uniqueTracks, sortField, sortDirection]);

  const displayedTracks = sortedTracks.slice(0, visibleCount);

  const handleShowInFolder = (track) => {
    if (window.electronAPI && track.path) {
      window.electronAPI.showInFolder(track.path);
    }
  };

  const toggleColumn = (colKey) => {
    setVisibleCols((prev) => ({ ...prev, [colKey]: !prev[colKey] }));
  };

  const handleContextMenu = (e, track) => {
    e.preventDefault();
    setShowContextPlaylistSubmenu(false);
    setContextMenu({
      x: Math.min(e.clientX, window.innerWidth - 250),
      y: Math.min(e.clientY, window.innerHeight - 340),
      track,
    });
  };

  const viewOptionsJSX = (
    <div className="flex items-center gap-3">
      {/* Column Customizer Toggle */}
      <div className="relative">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowColSettings(!showColSettings);
          }}
          title="Customize Columns"
          className="p-2 bg-white/5 hover:bg-white/10 text-text-secondary rounded-lg border border-border-primary text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-accent" />
          <span className="hidden sm:inline">Columns</span>
        </button>

        {showColSettings && (
          <div className="absolute right-0 top-10 bg-bg-secondary border border-border-primary rounded-xl shadow-2xl p-2.5 w-48 z-50 text-xs space-y-1.5">
            <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider px-2 mb-1">
              Show/Hide Columns
            </div>
            {[
              { key: 'serialNo', label: '# Serial Number' },
              { key: 'title', label: 'Title & Cover' },
              { key: 'artist', label: 'Artist' },
              { key: 'album', label: 'Album' },
              { key: 'time', label: 'Duration Time' },
            ].map((col) => (
              <button
                key={col.key}
                onClick={() => toggleColumn(col.key)}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-white/10 text-text-primary cursor-pointer"
              >
                <span>{col.label}</span>
                {visibleCols[col.key] && <Check className="w-3.5 h-3.5 text-accent" />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Density Toggle (Compact vs Comfortable) */}
      <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg border border-border-primary">
        <button
          onClick={() => setDensity('comfortable')}
          title="Expanded View (Big Covers & Titles)"
          className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
            density === 'comfortable'
              ? 'bg-accent text-text-primary shadow'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          <Maximize2 className="w-3.5 h-3.5" />
          <span>Expanded</span>
        </button>
        <button
          onClick={() => setDensity('compact')}
          title="Compact View (Dense Rows)"
          className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
            density === 'compact'
              ? 'bg-accent text-text-primary shadow'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          <Minimize2 className="w-3.5 h-3.5" />
          <span>Compact</span>
        </button>
      </div>

      {sortedTracks.length > 0 && (
        <button
          onClick={() => playTrack(sortedTracks[0], sortedTracks, 0)}
          className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-text-primary rounded-full text-xs font-semibold shadow-lg shadow-black/20 transition-all hover:scale-105 cursor-pointer"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>Play All</span>
        </button>
      )}
    </div>
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative">
      {/* List Header & View Options */}
      {(!hideHeader || !hideViewOptions) && (
        <div className={`px-6 py-4 flex items-center ${hideHeader ? 'justify-end' : 'justify-between'} border-b border-border-secondary`}>
          {!hideHeader && (
            <div>
              <h2 className="text-xl font-bold text-text-primary">{title}</h2>
              <p className="text-xs text-text-secondary mt-0.5">
                {subtitle || `${sortedTracks.length} unique tracks in collection`}
              </p>
            </div>
          )}

          {!hideViewOptions && viewOptionsJSX}
        </div>
      )}

      {/* Track Table Header */}
      {sortedTracks.length > 0 ? (
        <div ref={containerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto px-6 py-2 transform-gpu custom-scrollbar relative">
          {typeof topContent === 'function' ? topContent(viewOptionsJSX) : topContent}
          <div className="flex items-center gap-4 px-4 py-2 text-[11px] font-bold text-text-secondary uppercase tracking-wider border-b border-border-secondary sticky top-0 bg-bg-primary z-10">
            {visibleCols.serialNo && <div className="w-10 flex-shrink-0 text-center">#</div>}
            {visibleCols.title && (
              <div
                className="flex-1 cursor-pointer hover:text-text-primary flex items-center gap-1"
                onClick={() => handleSort('title')}
              >
                <span>Title & Cover</span>
                <ArrowUpDown className="w-3 h-3" />
              </div>
            )}
            {visibleCols.artist && (
              <div
                className="w-1/4 hidden md:flex cursor-pointer hover:text-text-primary items-center gap-1"
                onClick={() => handleSort('artist')}
              >
                <span>Artist</span>
                <ArrowUpDown className="w-3 h-3" />
              </div>
            )}
            {visibleCols.album && (
              <div
                className="w-1/5 hidden lg:flex cursor-pointer hover:text-text-primary items-center gap-1"
                onClick={() => handleSort('album')}
              >
                <span>Album</span>
                <ArrowUpDown className="w-3 h-3" />
              </div>
            )}
            {visibleCols.time && (
              <div
                className="w-24 flex-shrink-0 text-right cursor-pointer hover:text-text-primary flex items-center justify-end gap-1"
                onClick={() => handleSort('duration')}
              >
                <span>Time</span>
                <ArrowUpDown className="w-3 h-3" />
              </div>
            )}
          </div>

          {/* Track Rows */}
          <div className="divide-y divide-white/5 mt-1 space-y-1">
            {displayedTracks.map((track, index) => {
              const isCurrent = currentTrack && currentTrack.id === track.id;

              return (
                <TrackRow
                  key={track.id}
                  track={track}
                  index={index}
                  isCurrent={isCurrent}
                  isPlaying={isPlaying}
                  density={density}
                  visibleCols={visibleCols}
                  onPlay={() => (isCurrent ? togglePlay() : playTrack(track, sortedTracks, index))}
                  onToggleFavorite={() => toggleFavorite(track.id)}
                  playlists={playlists}
                  onAddToPlaylist={(plId) => addTrackToPlaylist(plId, track.id)}
                  onEditTags={() => {
                    setEditingTrack(track);
                    setIsTagEditorOpen(true);
                  }}
                  onShowInFolder={() => handleShowInFolder(track)}
                  onRemoveTrack={() => {
                    if (playlistContextId) {
                      removeTrackFromPlaylist(playlistContextId, track.id);
                    } else {
                      setTrackToDelete(track);
                      setIsDeleteModalOpen(true);
                    }
                  }}
                  onPlayNext={() => playNext(track)}
                  onAddToQueue={() => addToQueue(track)}
                  onContextMenu={handleContextMenu}
                  playlistContextId={playlistContextId}
                />
              );
            })}
          </div>

          {displayedTracks.length < sortedTracks.length && (
            <div ref={sentinelRef} className="py-4 text-center text-xs text-text-muted font-medium">
              Loading more tracks...
            </div>
          )}
          {displayedTracks.length === sortedTracks.length && sortedTracks.length > 30 && (
            <div className="py-4 text-center text-xs text-text-muted font-medium">
              Showing all {sortedTracks.length} tracks
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-gray-600 mb-4 border border-border-secondary">
            <Music className="w-8 h-8" />
          </div>
          <h3 className="text-base font-semibold text-text-secondary">No tracks found</h3>
          <p className="text-xs text-text-muted max-w-sm mt-1">
            Click "Folder" or "Files" in the top bar to scan your Windows PC for local audio files.
          </p>
        </div>
      )}

      {/* Redesigned Premium Glassmorphism Right-Click Context Menu Card */}
      {contextMenu && (
        <div
          style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
          className="fixed bg-bg-secondary border border-white/15 rounded-2xl shadow-2xl p-2 w-60 z-50 text-xs space-y-1 animate-in fade-in zoom-in-95 duration-100 select-none transform-gpu"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-2.5 py-1.5 border-b border-border-primary flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-lg bg-accent-hover/20 text-accent flex items-center justify-center flex-shrink-0">
              <Music className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-text-primary truncate text-[11px]">{contextMenu.track.title}</p>
              <p className="text-[9px] text-text-secondary truncate">{contextMenu.track.artist}</p>
            </div>
          </div>

          <button
            onClick={() => {
              playNext(contextMenu.track);
              setContextMenu(null);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/10 text-text-primary font-medium transition-colors cursor-pointer"
          >
            <Play className="w-4 h-4 text-accent fill-current" />
            <span>Play Next</span>
          </button>

          <button
            onClick={() => {
              addToQueue(contextMenu.track);
              setContextMenu(null);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/10 text-text-primary font-medium transition-colors cursor-pointer"
          >
            <ListPlus className="w-4 h-4 text-accent" />
            <span>Add to Queue</span>
          </button>

          {playlists.length > 0 && (
            <div className="border-t border-border-primary pt-1 mt-1">
              <button
                onClick={() => setShowContextPlaylistSubmenu(!showContextPlaylistSubmenu)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-white/10 text-accent font-medium transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <ListMusic className="w-4 h-4 text-accent" />
                  <span>Add to Playlist</span>
                </div>
                <ChevronRight className={`w-3.5 h-3.5 transition-transform ${showContextPlaylistSubmenu ? 'rotate-90' : ''}`} />
              </button>

              {showContextPlaylistSubmenu && (
                <div className="pl-3 pr-1 py-1 space-y-1 max-h-36 overflow-y-auto bg-black/20 rounded-xl my-1 border border-border-secondary">
                  {playlists.map((pl) => (
                    <button
                      key={pl.id}
                      onClick={() => {
                        addTrackToPlaylist(pl.id, contextMenu.track.id);
                        setContextMenu(null);
                      }}
                      className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-accent/30 text-text-secondary hover:text-accent-hover text-[11px] font-medium transition-colors cursor-pointer"
                    >
                      <span className="truncate">{pl.name}</span>
                      <Plus className="w-3 h-3 text-accent flex-shrink-0" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="border-t border-border-primary pt-1 mt-1">
            <button
              onClick={() => {
                setEditingTrack(contextMenu.track);
                setIsTagEditorOpen(true);
                setContextMenu(null);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/10 text-text-primary font-medium transition-colors cursor-pointer"
            >
              <Edit className="w-4 h-4 text-accent" />
              <span>Edit Song Info</span>
            </button>

            <button
              onClick={() => {
                handleShowInFolder(contextMenu.track);
                setContextMenu(null);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/10 text-text-primary font-medium transition-colors cursor-pointer"
            >
              <Folder className="w-4 h-4 text-accent" />
              <span>Show in File Explorer</span>
            </button>

            <button
              onClick={() => {
                if (playlistContextId) {
                  removeTrackFromPlaylist(playlistContextId, contextMenu.track.id);
                } else {
                  setTrackToDelete(contextMenu.track);
                  setIsDeleteModalOpen(true);
                }
                setContextMenu(null);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-red-500/20 text-red-400 font-medium transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>{playlistContextId ? 'Remove from Playlist' : 'Remove from Library'}</span>
            </button>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title={`Remove "${trackToDelete?.title}"?`}
        message="Are you sure you want to remove this song from your music library? The file on disk will NOT be deleted."
        confirmLabel="Remove Song"
        onConfirm={() => {
          if (trackToDelete) removeTrack(trackToDelete.id);
          setIsDeleteModalOpen(false);
        }}
        onCancel={() => setIsDeleteModalOpen(false)}
      />
    </div>
  );
};
