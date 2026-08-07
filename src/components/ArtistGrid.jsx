import React, { memo, useState } from 'react';
import { useAudio } from '../context/AudioContext';
import { getAlbumGradient } from '../utils/audioMetadata';
import { User, Play } from 'lucide-react';

const ArtistCard = memo(({ artist, onSelectArtist, onPlayArtist }) => {
  const [imgFailed, setImgFailed] = useState(false);
  const grad = getAlbumGradient(artist.name);

  return (
    <div
      className="glass-card rounded-2xl p-5 flex flex-col items-center text-center group cursor-pointer hover:border-indigo-500/40"
      onClick={() => onSelectArtist(artist)}
    >
      {/* Default Person Picture Avatar Circle */}
      <div
        className="w-28 h-28 rounded-full overflow-hidden relative shadow-xl mb-4 flex items-center justify-center border-2 border-white/10 group-hover:border-indigo-500/50 transition-all duration-300"
        style={{ background: grad }}
      >
        {artist.picture && !imgFailed ? (
          <img
            src={artist.picture}
            alt=""
            onError={() => setImgFailed(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-indigo-500/20 via-purple-600/30 to-indigo-900/40 text-indigo-200">
            <User className="w-12 h-12 text-indigo-300 drop-shadow-md" />
          </div>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            onPlayArtist();
          }}
          className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300"
        >
          <div className="w-11 h-11 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg hover:scale-110">
            <Play className="w-5 h-5 fill-current translate-x-0.5" />
          </div>
        </button>
      </div>

      <h4 className="font-bold text-sm text-gray-100 group-hover:text-indigo-300 truncate w-full px-1">
        {artist.name}
      </h4>
      <p className="text-[11px] text-gray-400 font-mono mt-1">
        {artist.tracks.length} {artist.tracks.length === 1 ? 'song' : 'songs'} • {artist.albums.size} {artist.albums.size === 1 ? 'album' : 'albums'}
      </p>
    </div>
  );
});

export const ArtistGrid = memo(({ onSelectArtist }) => {
  const { artistsMap, playTrack } = useAudio();

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="px-6 py-4 border-b border-white/5">
        <h2 className="text-xl font-bold text-gray-100">Artists</h2>
        <p className="text-xs text-gray-400 mt-0.5">{artistsMap.length} artists in your library</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {artistsMap.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {artistsMap.map((artist) => (
              <ArtistCard
                key={artist.name}
                artist={artist}
                onSelectArtist={onSelectArtist}
                onPlayArtist={() => {
                  if (artist.tracks.length > 0) playTrack(artist.tracks[0], artist.tracks, 0);
                }}
              />
            ))}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-500 text-xs">
            <User className="w-12 h-12 mb-3 text-gray-600" />
            <p>No artists found in library</p>
          </div>
        )}
      </div>
    </div>
  );
});
