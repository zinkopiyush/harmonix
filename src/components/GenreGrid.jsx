import React, { useMemo } from 'react';
import { useAudio } from '../context/AudioContext';
import { getAlbumGradient } from '../utils/audioMetadata';
import { Radio, Play } from 'lucide-react';

export const GenreGrid = ({ onSelectGenre }) => {
  const { tracks, playTrack } = useAudio();

  const genresMap = useMemo(() => {
    const map = new Map();
    tracks.forEach((track) => {
      const genreName = track.genre || 'Unknown Genre';
      if (!map.has(genreName)) {
        map.set(genreName, {
          name: genreName,
          tracks: [],
        });
      }
      map.get(genreName).tracks.push(track);
    });
    return Array.from(map.values());
  }, [tracks]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="px-6 py-4 border-b border-white/5">
        <h2 className="text-xl font-bold text-gray-100">Genres</h2>
        <p className="text-xs text-gray-400 mt-0.5">{genresMap.length} musical genres identified</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {genresMap.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {genresMap.map((genre) => {
              const grad = getAlbumGradient(genre.name);
              return (
                <div
                  key={genre.name}
                  className="glass-card rounded-xl p-5 relative overflow-hidden flex flex-col justify-between h-36 cursor-pointer group"
                  onClick={() => onSelectGenre(genre)}
                  style={{ background: grad }}
                >
                  <div className="flex items-center justify-between z-10">
                    <Radio className="w-6 h-6 text-white/80" />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (genre.tracks.length > 0) playTrack(genre.tracks[0], genre.tracks, 0);
                      }}
                      className="w-9 h-9 rounded-full bg-white text-gray-900 flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                    >
                      <Play className="w-4 h-4 fill-current translate-x-0.5" />
                    </button>
                  </div>

                  <div className="z-10">
                    <h4 className="font-bold text-sm text-white drop-shadow-md">{genre.name}</h4>
                    <p className="text-[11px] text-white/70 font-mono mt-0.5">
                      {genre.tracks.length} {genre.tracks.length === 1 ? 'track' : 'tracks'}
                    </p>
                  </div>

                  {/* Decorative background circle */}
                  <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-white/10 blur-md pointer-events-none"></div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-500 text-xs">
            <Radio className="w-12 h-12 mb-3 text-gray-600" />
            <p>No genres found</p>
          </div>
        )}
      </div>
    </div>
  );
};
