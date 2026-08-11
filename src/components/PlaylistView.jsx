import React, { useState, useRef } from 'react';
import { useAudio } from '../context/AudioContext';
import { TrackList } from './TrackList';
import { PlaylistCoverCropModal } from './PlaylistCoverCropModal';
import { ConfirmModal } from './ConfirmModal';
import {
  ListMusic,
  Plus,
  Play,
  Trash2,
  Edit2,
  FolderPlus,
  FilePlus,
  Music,
  ArrowLeft,
  Crop,
  ListPlus,
  ArrowRightToLine,
} from 'lucide-react';

export const PlaylistView = () => {
  const {
    playlists,
    tracks,
    createPlaylist,
    deletePlaylist,
    renamePlaylist,
    removeTrackFromPlaylist,
    playTrack,
    importFolderAsPlaylist,
    addFilesToPlaylist,
    updatePlaylistCover,
    playNext,
    addToQueue,
  } = useAudio();

  const [activePlaylistId, setActivePlaylistId] = useState(null);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [targetPlaylistIdForCrop, setTargetPlaylistIdForCrop] = useState(null);
  const [selectedCoverImage, setSelectedCoverImage] = useState(null);
  const fileInputRef = useRef(null);

  // Context Menu & Modal States
  const [contextMenu, setContextMenu] = useState(null); // { x, y, playlist }
  const [confirmDeleteModal, setConfirmDeleteModal] = useState({ isOpen: false, playlist: null });
  const [renameModal, setRenameModal] = useState({ isOpen: false, playlist: null, name: '' });

  const activePlaylist = playlists.find((p) => p.id === activePlaylistId);

  const playlistTracks = activePlaylist
    ? activePlaylist.trackIds
        .map((id) => tracks.find((t) => t.id === id))
        .filter(Boolean)
    : [];

  const handleCreate = (e) => {
    e.preventDefault();
    if (newPlaylistName.trim()) {
      createPlaylist(newPlaylistName.trim());
      setNewPlaylistName('');
    }
  };

  const handlePlayPlaylist = (playlist) => {
    const playlistTrackObjs = playlist.trackIds
      .map((id) => tracks.find((t) => t.id === id))
      .filter(Boolean);

    if (playlistTrackObjs.length > 0) {
      playTrack(playlistTrackObjs[0], playlistTrackObjs, 0);
    }
  };

  const handleContextMenu = (e, playlist) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      playlist,
    });
  };

  const openCropModal = (playlistId) => {
    setTargetPlaylistIdForCrop(playlistId);
    if (fileInputRef.current) {
      fileInputRef.current.value = null; // reset
      fileInputRef.current.click();
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedCoverImage(event.target.result);
        setIsCropModalOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveCroppedCover = (pictureDataUrl) => {
    if (targetPlaylistIdForCrop) {
      updatePlaylistCover(targetPlaylistIdForCrop, pictureDataUrl);
    }
    setIsCropModalOpen(false);
    setTargetPlaylistIdForCrop(null);
  };

  const handleRenameSubmit = (e) => {
    e.preventDefault();
    if (renameModal.playlist && renameModal.name.trim()) {
      renamePlaylist(renameModal.playlist.id, renameModal.name.trim());
      setRenameModal({ isOpen: false, playlist: null, name: '' });
    }
  };

  const playlistHeader = (viewOptionsJSX) => (
    <div className="flex items-center gap-6 p-6 relative flex-shrink-0">
      <button
        onClick={() => setActivePlaylistId(null)}
        className="absolute top-4 left-4 p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
      </button>

      <div className="w-32 h-32 rounded-2xl overflow-hidden shadow-xl bg-gradient-to-br from-indigo-900 to-purple-950 border border-white/10 flex items-center justify-center flex-shrink-0 relative group ml-8">
        {activePlaylist?.picture ? (
          <img src={activePlaylist.picture} alt="" className="w-full h-full object-cover" />
        ) : (
          <ListMusic className="w-12 h-12 text-indigo-400" />
        )}

        <button
          onClick={() => openCropModal(activePlaylist.id)}
          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-opacity gap-1 cursor-pointer"
        >
          <Crop className="w-4 h-4" />
          <span>Set Cover</span>
        </button>
      </div>

      <div className="flex-1 min-w-0">
        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block">
          Playlist
        </span>
        <h3 className="text-2xl font-extrabold text-white truncate mt-0.5">
          {activePlaylist?.name}
        </h3>
        <p className="text-xs font-mono text-gray-400 mt-1">
          {playlistTracks.length} tracks
        </p>

        <div className="flex items-center gap-3 mt-4">
          {viewOptionsJSX}

          <button
            onClick={() => addFilesToPlaylist(activePlaylist.id)}
            className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white font-bold text-xs rounded-xl border border-white/10 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <FilePlus className="w-4 h-4 text-indigo-400" />
            <span>Add Tracks</span>
          </button>

          <button
            onClick={() => setConfirmDeleteModal({ isOpen: true, playlist: activePlaylist })}
            className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold text-xs rounded-xl border border-red-500/20 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div
      onClick={() => setContextMenu(null)}
      className="p-6 h-full flex flex-col overflow-hidden select-none relative"
    >
      <input
        type="file"
        ref={fileInputRef}
        accept="image/png, image/jpeg, image/webp"
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />
      {/* Top Header */}
      {!activePlaylist && (
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4 flex-shrink-0">
          <div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <ListMusic className="w-6 h-6 text-indigo-400" />
              <span>Playlists</span>
            </h2>
            <p className="text-xs text-gray-400 mt-1 font-medium">
              Organize and customize your music playlists
            </p>
          </div>

          <div className="flex items-center gap-3">
            <form onSubmit={handleCreate} className="flex items-center gap-2">
              <input
                type="text"
                placeholder="New Playlist Name..."
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                className="bg-[#161622] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 w-48"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create</span>
              </button>
            </form>

            <button
              onClick={importFolderAsPlaylist}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/15 text-white border border-white/10 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <FolderPlus className="w-3.5 h-3.5 text-indigo-400" />
              <span>Import Folder</span>
            </button>
          </div>
        </div>
      )}

      {/* Playlist Detail View */}
      {activePlaylist ? (
        <div className="flex-1 min-h-0 bg-[#13131c] border border-white/5 rounded-2xl flex flex-col overflow-hidden">
          {playlistTracks.length === 0 ? (
            <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
              {playlistHeader(null)}
              <div className="flex-1 flex items-center justify-center py-12 text-center text-gray-500 text-xs">
                No songs in this playlist yet. Right-click any song or click "Add Tracks" above.
              </div>
            </div>
          ) : (
            <TrackList
              trackItems={playlistTracks}
              title={activePlaylist.name}
              subtitle={`${playlistTracks.length} tracks`}
              hideHeader={true}
              hideViewOptions={true}
              playlistContextId={activePlaylist.id}
              topContent={playlistHeader}
            />
          )}
        </div>
      ) : (
        /* Playlists Grid */
        <div className="flex-1 overflow-y-auto custom-scrollbar pb-8 pr-2">
          {playlists.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center text-gray-500">
              <ListMusic className="w-16 h-16 mb-4 opacity-40" />
              <p className="text-sm font-semibold text-gray-400">No Playlists Created Yet</p>
              <p className="text-xs mt-1">Create a playlist or import a folder to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
              {playlists.map((playlist) => (
                <div
                  key={playlist.id}
                  onClick={() => setActivePlaylistId(playlist.id)}
                  onContextMenu={(e) => handleContextMenu(e, playlist)}
                  className="group relative bg-[#13131c] hover:bg-[#191926] border border-white/5 hover:border-indigo-500/40 rounded-2xl p-3 transition-all duration-300 shadow-lg hover:shadow-indigo-500/10 cursor-pointer flex flex-col justify-between"
                >
                  <div className="w-full aspect-square rounded-xl overflow-hidden relative shadow-md mb-3 bg-gradient-to-br from-indigo-900 to-purple-950 border border-white/10 flex items-center justify-center flex-shrink-0">
                    {playlist.picture ? (
                      <img src={playlist.picture} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <ListMusic className="w-10 h-10 text-indigo-400" />
                    )}

                    {/* Play Button Overlay */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlayPlaylist(playlist);
                      }}
                      title="Play Playlist"
                      className="absolute right-2 bottom-2 w-10 h-10 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 group-hover:translate-y-0 translate-y-2 transition-all duration-300 cursor-pointer"
                    >
                      <Play className="w-5 h-5 fill-current translate-x-0.5" />
                    </button>
                  </div>

                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-gray-100 truncate group-hover:text-indigo-400 transition-colors">
                      {playlist.name}
                    </h4>
                    <p className="text-[11px] text-gray-400 font-mono mt-1">
                      {playlist.trackIds.length} {playlist.trackIds.length === 1 ? 'track' : 'tracks'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Right-Click Context Menu */}
      {contextMenu && (
        <div
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
          className="fixed z-50 bg-[#161622] border border-white/15 rounded-xl shadow-2xl p-1.5 w-48 text-xs animate-in fade-in zoom-in-95 duration-150"
        >
          <button
            onClick={() => {
              handlePlayPlaylist(contextMenu.playlist);
              setContextMenu(null);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-left rounded-lg text-gray-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <Play className="w-4 h-4 text-indigo-400 fill-current" />
            <span>Play Playlist</span>
          </button>

          <button
            onClick={() => {
              const playlistTrackObjs = contextMenu.playlist.trackIds
                .map((id) => tracks.find((t) => t.id === id))
                .filter(Boolean);
              if (playlistTrackObjs.length > 0) {
                playNext(playlistTrackObjs);
              }
              setContextMenu(null);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-left rounded-lg text-gray-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <ArrowRightToLine className="w-4 h-4 text-indigo-400" />
            <span>Play Next</span>
          </button>

          <button
            onClick={() => {
              const playlistTrackObjs = contextMenu.playlist.trackIds
                .map((id) => tracks.find((t) => t.id === id))
                .filter(Boolean);
              if (playlistTrackObjs.length > 0) {
                addToQueue(playlistTrackObjs);
              }
              setContextMenu(null);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-left rounded-lg text-gray-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <ListPlus className="w-4 h-4 text-indigo-400" />
            <span>Add to Queue</span>
          </button>

          <button
            onClick={() => {
              setRenameModal({
                isOpen: true,
                playlist: contextMenu.playlist,
                name: contextMenu.playlist.name,
              });
              setContextMenu(null);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-left rounded-lg text-gray-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <Edit2 className="w-4 h-4 text-indigo-400" />
            <span>Rename Playlist</span>
          </button>

          <button
            onClick={() => {
              openCropModal(contextMenu.playlist.id);
              setContextMenu(null);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-left rounded-lg text-gray-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <Crop className="w-4 h-4 text-indigo-400" />
            <span>Change Cover Art</span>
          </button>

          <div className="my-1 border-t border-white/10"></div>

          <button
            onClick={() => {
              setConfirmDeleteModal({ isOpen: true, playlist: contextMenu.playlist });
              setContextMenu(null);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-left rounded-lg text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Playlist</span>
          </button>
        </div>
      )}

      {/* Rename Modal */}
      {renameModal.isOpen && (
        <div
          onClick={() => setRenameModal({ isOpen: false, playlist: null, name: '' })}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4"
        >
          <form
            onSubmit={handleRenameSubmit}
            onClick={(e) => e.stopPropagation()}
            className="bg-[#161622] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4"
          >
            <h3 className="text-lg font-bold text-white">Rename Playlist</h3>
            <input
              type="text"
              value={renameModal.name}
              onChange={(e) => setRenameModal({ ...renameModal, name: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              autoFocus
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRenameModal({ isOpen: false, playlist: null, name: '' })}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Playlist Cover Crop Modal */}
      {isCropModalOpen && selectedCoverImage && (
        <PlaylistCoverCropModal
          isOpen={isCropModalOpen}
          imageSrc={selectedCoverImage}
          onClose={() => {
            setIsCropModalOpen(false);
            setSelectedCoverImage(null);
          }}
          onSave={handleSaveCroppedCover}
        />
      )}

      {/* Confirm Delete Warning Modal */}
      {confirmDeleteModal.isOpen && (
        <ConfirmModal
          isOpen={confirmDeleteModal.isOpen}
          title="Delete Playlist"
          message={`Are you sure you want to delete the playlist "${confirmDeleteModal.playlist?.name}"?`}
          confirmLabel="Delete"
          onConfirm={() => {
            if (confirmDeleteModal.playlist) {
              deletePlaylist(confirmDeleteModal.playlist.id);
              if (activePlaylistId === confirmDeleteModal.playlist.id) {
                setActivePlaylistId(null);
              }
            }
            setConfirmDeleteModal({ isOpen: false, playlist: null });
          }}
          onCancel={() => setConfirmDeleteModal({ isOpen: false, playlist: null })}
        />
      )}
    </div>
  );
};
