import React from 'react';
import { useAudio } from '../context/AudioContext';
import { TrackList } from './TrackList';
import { getAlbumGradient } from '../utils/audioMetadata';
import { Search, User, Disc, Music, ListMusic, X } from 'lucide-react';

export const SearchResultsView = () => {
  const {
    searchQuery,
    setSearchQuery,
    filteredTracks,
    artistsMap,
    albumsMap,
    playlists,
    setActiveTab,
    playTrack,
  } = useAudio();

  if (!searchQuery.trim()) return null;

  const query = searchQuery.toLowerCase();

  const matchingArtists = artistsMap.filter((a) => a.name.toLowerCase().includes(query));
  const matchingAlbums = albumsMap.filter((a) =>
    a.name.toLowerCase().includes(query) || a.artist.toLowerCase().includes(query)
  );
  const matchingPlaylists = playlists.filter((p) => p.name.toLowerCase().includes(query));

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-bg-primary">
      {/* Search Header */}
      <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent-hover/20 text-accent border border-accent/30 flex items-center justify-center">
            <Search className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-100">Search Results</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Showing matches for <span className="text-accent font-semibold">"{searchQuery}"</span>
            </p>
          </div>
        </div>

        <button
          onClick={() => setSearchQuery('')}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg text-xs font-semibold border border-white/10 transition-colors"
        >
          <X className="w-4 h-4 text-gray-400" />
          <span>Clear Search</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Matching Artists */}
        {matchingArtists.length > 0 && (
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
              Matching Artists ({matchingArtists.length})
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
              {matchingArtists.slice(0, 6).map((artist) => (
                <div
                  key={artist.name}
                  onClick={() => {
                    setActiveTab('artists');
                    setSearchQuery('');
                  }}
                  className="glass-card p-3 rounded-xl flex items-center gap-3 cursor-pointer group hover:border-accent/40"
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white/80 overflow-hidden border border-white/10"
                    style={{ background: getAlbumGradient(artist.name) }}
                  >
                    {artist.picture ? (
                      <img src={artist.picture} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-5 h-5" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-xs text-gray-100 group-hover:text-accent truncate">
                      {artist.name}
                    </p>
                    <p className="text-[10px] text-gray-400 font-mono mt-0.5">
                      {artist.tracks.length} songs
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Matching Albums */}
        {matchingAlbums.length > 0 && (
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
              Matching Albums ({matchingAlbums.length})
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
              {matchingAlbums.slice(0, 6).map((album) => (
                <div
                  key={album.name}
                  onClick={() => {
                    setActiveTab('albums');
                    setSearchQuery('');
                  }}
                  className="glass-card p-3 rounded-xl flex items-center gap-3 cursor-pointer group hover:border-accent/40"
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white/80 overflow-hidden border border-white/10"
                    style={{ background: getAlbumGradient(album.name) }}
                  >
                    {album.picture ? (
                      <img src={album.picture} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Disc className="w-5 h-5" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-xs text-gray-100 group-hover:text-accent truncate">
                      {album.name}
                    </p>
                    <p className="text-[10px] text-gray-400 truncate mt-0.5">{album.artist}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Matching Playlists */}
        {matchingPlaylists.length > 0 && (
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
              Matching Playlists ({matchingPlaylists.length})
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
              {matchingPlaylists.slice(0, 6).map((pl) => (
                <div
                  key={pl.id}
                  onClick={() => {
                    setActiveTab('playlists');
                    setSearchQuery('');
                  }}
                  className="glass-card p-3 rounded-xl flex items-center gap-3 cursor-pointer group hover:border-accent/40"
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-text-primary overflow-hidden border border-border-secondary bg-bg-secondary"
                  >
                    {pl.picture ? (
                      <img src={pl.picture} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <ListMusic className="w-5 h-5 text-accent" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-xs text-gray-100 group-hover:text-accent truncate">
                      {pl.name}
                    </p>
                    <p className="text-[10px] text-gray-400 font-mono mt-0.5">
                      {pl.trackIds.length} tracks
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Matching Song Tracks */}
        <div>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
            Matching Song Tracks ({filteredTracks.length})
          </h3>
          <TrackList
            trackItems={filteredTracks}
            title={`Matching Songs (${filteredTracks.length})`}
            subtitle={`Search query: "${searchQuery}"`}
          />
        </div>
      </div>
    </div>
  );
};
