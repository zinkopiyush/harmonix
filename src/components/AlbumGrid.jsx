import React, { memo, useState } from 'react';
import { useAudio } from '../context/AudioContext';
import { getAlbumGradient } from '../utils/audioMetadata';
import { Play, Disc } from 'lucide-react';

const AlbumCard = memo(({ album, onSelectAlbum, onPlayAlbum }) => {
  const [imgFailed, setImgFailed] = useState(false);
  const grad = getAlbumGradient(album.name);

  return (
    <div
      className="glass-card rounded-xl p-3 flex flex-col group cursor-pointer"
      onClick={() => onSelectAlbum(album)}
    >
      <div
        className="w-full aspect-square rounded-lg overflow-hidden relative shadow-lg mb-3 flex items-center justify-center text-white/70 border border-white/10"
        style={{ background: grad }}
      >
        {album.picture && !imgFailed ? (
          <img
            src={album.picture}
            alt=""
            onError={() => setImgFailed(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <Disc className="w-10 h-10 group-hover:scale-110 transition-transform text-white/80" />
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            onPlayAlbum();
          }}
          className="absolute right-3 bottom-3 w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-xl opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all hover:bg-indigo-500 hover:scale-110"
        >
          <Play className="w-5 h-5 fill-current translate-x-0.5" />
        </button>
      </div>

      <h4 className="font-semibold text-xs text-gray-100 truncate">{album.name}</h4>
      <p className="text-[11px] text-gray-400 truncate mt-0.5">{album.artist}</p>
      <span className="text-[10px] text-gray-500 mt-1 font-mono">
        {album.tracks.length} {album.tracks.length === 1 ? 'song' : 'songs'}
      </span>
    </div>
  );
});

export const AlbumGrid = memo(({ onSelectAlbum }) => {
  const { albumsMap, playTrack } = useAudio();

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="px-6 py-4 border-b border-white/5">
        <h2 className="text-xl font-bold text-gray-100">Albums</h2>
        <p className="text-xs text-gray-400 mt-0.5">{albumsMap.length} albums in your collection</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {albumsMap.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
            {albumsMap.map((album) => (
              <AlbumCard
                key={album.name}
                album={album}
                onSelectAlbum={onSelectAlbum}
                onPlayAlbum={() => {
                  if (album.tracks.length > 0) playTrack(album.tracks[0], album.tracks, 0);
                }}
              />
            ))}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-500 text-xs">
            <Disc className="w-12 h-12 mb-3 text-gray-600" />
            <p>No albums found in library</p>
          </div>
        )}
      </div>
    </div>
  );
});
