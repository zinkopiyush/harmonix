import React, { useState, useEffect } from 'react';
import { useAudio } from '../context/AudioContext';
import { TrackList } from './TrackList';
import { getAlbumGradient } from '../utils/audioMetadata';
import { PlaylistCoverCropModal } from './PlaylistCoverCropModal';
import { ConfirmModal } from './ConfirmModal';
import {
  ListMusic,
  Plus,
  Trash2,
  Heart,
  Clock,
  Flame,
  FolderPlus,
  FilePlus,
  Image,
} from 'lucide-react';

const PlaylistCard = ({ playlist, tracks, onSelect, onDelete }) => {
  const [imgFailed, setImgFailed] = useState(false);
  const playlistTracks = tracks.filter((t) => playlist.trackIds.includes(t.id));

  let coverArt = playlist.picture;
  if (!coverArt && playlistTracks.length > 0) {
    const trackWithCover = playlistTracks.find((t) => t.picture);
    if (trackWithCover) coverArt = trackWithCover.picture;
  }

  const grad = getAlbumGradient(playlist.name);

  return (
    <div
      onClick={() => onSelect(playlist)}
      className="glass-card p-3 rounded-2xl cursor-pointer flex flex-col justify-between group relative border border-white/10 hover:border-indigo-500/40 transition-all hover:scale-[1.02]"
    >
      {/* 1:1 Square Cover Artwork Box */}
      <div
        className="w-full aspect-square rounded-xl overflow-hidden relative shadow-md flex items-center justify-center border border-white/10 bg-[#12121a] mb-3"
        style={{ background: coverArt ? '#12121a' : grad }}
      >
        {coverArt && !imgFailed ? (
          <img
            src={coverArt}
            alt=""
            onError={() => setImgFailed(true)}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <ListMusic className="w-10 h-10 text-white/80" />
        )}
      </div>

      <div className="flex items-end justify-between px-1 pb-1">
        <div className="min-w-0 flex-1">
          <h4 className="font-bold text-sm text-gray-100 group-hover:text-indigo-300 truncate">
            {playlist.name}
          </h4>
          <p className="text-[11px] text-gray-400 font-mono mt-0.5">
            {playlist.trackIds.length} {playlist.trackIds.length === 1 ? 'track' : 'tracks'}
          </p>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(playlist);
          }}
          title="Delete Playlist"
          className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-400 rounded-lg hover:bg-white/10 transition-all cursor-pointer"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export const PlaylistView = () => {
  const {
    playlists,
    createPlaylist,
    deletePlaylist,
    tracks,
    importFolderAsPlaylist,
    addFilesToPlaylist,
    updatePlaylistCover,
  } = useAudio();

  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [activeSmartPlaylist, setActiveSmartPlaylist] = useState(null);

  // Cover Crop Modal State
  const [cropImageSrc, setCropImageSrc] = useState(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [targetPlaylistId, setTargetPlaylistId] = useState(null);

  // Confirm Delete Modal State
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    if (selectedPlaylist) {
      const updated = playlists.find((p) => p.id === selectedPlaylist.id);
      if (updated) setSelectedPlaylist(updated);
    }
  }, [playlists]);

  const handleCreate = (e) => {
    e.preventDefault();
    if (newPlaylistName.trim()) {
      createPlaylist(newPlaylistName);
      setNewPlaylistName('');
    }
  };

  const handleDeletePrompt = (pl) => {
    setDeleteTarget(pl);
    setIsDeleteModalOpen(true);
  };

  const favoriteTracks = tracks.filter((t) => t.isFavorite);
  const recentlyAddedTracks = [...tracks].sort((a, b) => (b.dateAdded || 0) - (a.dateAdded || 0));
  const mostPlayedTracks = [...tracks]
    .filter((t) => (t.playCount || 0) > 0)
    .sort((a, b) => (b.playCount || 0) - (a.playCount || 0));

  if (selectedPlaylist) {
    const currentPlaylistObj = playlists.find((p) => p.id === selectedPlaylist.id) || selectedPlaylist;
    const playlistTrackList = tracks.filter((t) => currentPlaylistObj.trackIds.includes(t.id));

    const handleCoverFileSelected = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setCropImageSrc(event.target.result);
          setTargetPlaylistId(currentPlaylistObj.id);
          setIsCropModalOpen(true);
        };
        reader.readAsDataURL(file);
      }
    };

    return (
      <>
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="px-6 py-3 border-b border-white/5 flex items-center justify-between">
            <button
              onClick={() => setSelectedPlaylist(null)}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer"
            >
              ← Back to Playlists
            </button>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg text-xs font-medium border border-white/10 cursor-pointer transition-colors">
                <Image className="w-3.5 h-3.5 text-indigo-400" />
                <span>Set Playlist Cover</span>
                <input type="file" accept="image/*" onChange={handleCoverFileSelected} className="hidden" />
              </label>

              <button
                onClick={() => addFilesToPlaylist(currentPlaylistObj.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 rounded-lg text-xs font-medium border border-indigo-500/30 transition-colors cursor-pointer"
              >
                <FilePlus className="w-3.5 h-3.5" />
                <span>Add Song Files</span>
              </button>
            </div>
          </div>

          <TrackList
            trackItems={playlistTrackList}
            title={currentPlaylistObj.name}
            subtitle={`Custom Playlist • ${playlistTrackList.length} tracks`}
          />
        </div>

        <PlaylistCoverCropModal
          isOpen={isCropModalOpen}
          imageSrc={cropImageSrc}
          onSave={async (croppedUrl) => {
            if (targetPlaylistId) {
              await updatePlaylistCover(targetPlaylistId, croppedUrl);
              const updatedObj = playlists.find((p) => p.id === targetPlaylistId);
              if (updatedObj) setSelectedPlaylist(updatedObj);
            }
          }}
          onClose={() => setIsCropModalOpen(false)}
        />
      </>
    );
  }

  if (activeSmartPlaylist === 'favorites') {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-6 py-3 border-b border-white/5 flex items-center justify-between">
          <button
            onClick={() => setActiveSmartPlaylist(null)}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer"
          >
            ← Back to Playlists
          </button>
        </div>
        <TrackList trackItems={favoriteTracks} title="Favorite Songs" subtitle="Songs marked with a heart" />
      </div>
    );
  }

  if (activeSmartPlaylist === 'recent') {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-6 py-3 border-b border-white/5 flex items-center justify-between">
          <button
            onClick={() => setActiveSmartPlaylist(null)}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer"
          >
            ← Back to Playlists
          </button>
        </div>
        <TrackList trackItems={recentlyAddedTracks} title="Recently Added" subtitle="Sorted by import date" />
      </div>
    );
  }

  if (activeSmartPlaylist === 'mostPlayed') {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-6 py-3 border-b border-white/5 flex items-center justify-between">
          <button
            onClick={() => setActiveSmartPlaylist(null)}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer"
          >
            ← Back to Playlists
          </button>
        </div>
        <TrackList trackItems={mostPlayedTracks} title="Most Played" subtitle="Sorted by play count" />
      </div>
    );
  }

  return (
    <>
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-100">Playlists</h2>
            <p className="text-xs text-gray-400 mt-0.5">Organize your music collection</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <form onSubmit={handleCreate} className="flex items-center gap-2">
              <input
                type="text"
                placeholder="New Playlist Name..."
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow transition-all flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create</span>
              </button>
            </form>

            <button
              onClick={importFolderAsPlaylist}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl text-xs font-medium border border-white/10 transition-colors cursor-pointer"
            >
              <FolderPlus className="w-3.5 h-3.5 text-indigo-400" />
              <span>Import Folder</span>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Smart Auto Playlists */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Smart Mixes</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div
                onClick={() => setActiveSmartPlaylist('favorites')}
                className="glass-card p-4 rounded-2xl cursor-pointer flex items-center gap-4 border border-pink-500/20 hover:border-pink-500/50 bg-gradient-to-r from-pink-500/10 to-purple-500/10 transition-all hover:scale-[1.02]"
              >
                <div className="w-12 h-12 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center border border-pink-500/30">
                  <Heart className="w-6 h-6 fill-pink-500" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-100">Favorites</h4>
                  <p className="text-xs text-gray-400">{favoriteTracks.length} songs</p>
                </div>
              </div>

              <div
                onClick={() => setActiveSmartPlaylist('recent')}
                className="glass-card p-4 rounded-2xl cursor-pointer flex items-center gap-4 border border-indigo-500/20 hover:border-indigo-500/50 bg-gradient-to-r from-indigo-500/10 to-blue-500/10 transition-all hover:scale-[1.02]"
              >
                <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-100">Recently Added</h4>
                  <p className="text-xs text-gray-400">{recentlyAddedTracks.length} songs</p>
                </div>
              </div>

              <div
                onClick={() => setActiveSmartPlaylist('mostPlayed')}
                className="glass-card p-4 rounded-2xl cursor-pointer flex items-center gap-4 border border-amber-500/20 hover:border-amber-500/50 bg-gradient-to-r from-amber-500/10 to-orange-500/10 transition-all hover:scale-[1.02]"
              >
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                  <Flame className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-100">Most Played</h4>
                  <p className="text-xs text-gray-400">{mostPlayedTracks.length} songs</p>
                </div>
              </div>
            </div>
          </div>

          {/* Custom User Playlists */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Your Playlists</h3>
            {playlists.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
                {playlists.map((pl) => (
                  <PlaylistCard
                    key={pl.id}
                    playlist={pl}
                    tracks={tracks}
                    onSelect={(playlist) => setSelectedPlaylist(playlist)}
                    onDelete={(playlist) => handleDeletePrompt(playlist)}
                  />
                ))}
              </div>
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-center bg-white/5 rounded-2xl border border-white/5">
                <ListMusic className="w-10 h-10 text-gray-600 mb-2" />
                <p className="text-xs text-gray-400 font-medium">No custom playlists created yet</p>
                <p className="text-[11px] text-gray-500 mt-1">
                  Type a name above to create your first playlist or click "Import Folder".
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title={`Delete "${deleteTarget?.name}"?`}
        message="Are you sure you want to delete this playlist? The songs in your library will NOT be deleted."
        confirmText="Delete Playlist"
        onConfirm={() => {
          if (deleteTarget) deletePlaylist(deleteTarget.id);
        }}
        onClose={() => setIsDeleteModalOpen(false)}
      />
    </>
  );
};
