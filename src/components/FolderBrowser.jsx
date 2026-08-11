import React, { useMemo, useState } from 'react';
import { useAudio } from '../context/AudioContext';
import { TrackList } from './TrackList';
import { FolderTree, Folder, HardDrive, Play, ListMusic, ListPlus, ArrowRightToLine } from 'lucide-react';

export const FolderBrowser = () => {
  const { tracks, currentFolder, scanFolder, playTrack, createPlaylistWithTracks, playNext, addToQueue } = useAudio();

  const foldersMap = useMemo(() => {
    const map = new Map();
    tracks.forEach((t) => {
      const folderPath = t.path.substring(0, t.path.lastIndexOf('\\')) || t.path.substring(0, t.path.lastIndexOf('/')) || 'Default Folder';
      if (!map.has(folderPath)) {
        map.set(folderPath, []);
      }
      map.get(folderPath).push(t);
    });
    return map;
  }, [tracks]);

  const [selectedFolderPath, setSelectedFolderPath] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);

  if (selectedFolderPath && foldersMap.has(selectedFolderPath)) {
    const folderTracks = foldersMap.get(selectedFolderPath);
    const folderName = selectedFolderPath.split('\\').pop().split('/').pop();
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-6 py-3 border-b border-white/5 flex items-center gap-3">
          <button
            onClick={() => setSelectedFolderPath(null)}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
          >
            ← Back to Folder Browser
          </button>
        </div>
        <TrackList
          trackItems={folderTracks}
          title={folderName}
          subtitle={`Location: ${selectedFolderPath} • ${folderTracks.length} files`}
        />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative" onClick={() => setContextMenu(null)}>
      <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-100">Folder Browser</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {currentFolder ? `Active Root: ${currentFolder}` : 'Browse scanned local folders on disk'}
          </p>
        </div>

        <button
          onClick={scanFolder}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow transition-all"
        >
          <FolderTree className="w-4 h-4" />
          <span>Scan New Folder</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {foldersMap.size > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from(foldersMap.entries()).map(([path, files]) => {
              const folderName = path.split('\\').pop().split('/').pop();
              return (
                <div
                  key={path}
                  onClick={() => setSelectedFolderPath(path)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setContextMenu({
                      x: e.clientX,
                      y: e.clientY,
                      path: path,
                      files: files,
                      folderName: folderName,
                    });
                  }}
                  className="glass-card p-4 rounded-xl cursor-pointer flex items-center gap-4 group hover:border-indigo-500/40"
                >
                  <div className="w-12 h-12 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
                    <Folder className="w-6 h-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-semibold text-xs text-gray-100 group-hover:text-indigo-300 truncate">
                      {folderName}
                    </h4>
                    <p className="text-[10px] text-gray-500 truncate mt-0.5" title={path}>
                      {path}
                    </p>
                    <span className="text-[10px] text-indigo-400 font-mono mt-1 block">
                      {files.length} audio files
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-500 text-xs">
            <HardDrive className="w-12 h-12 mb-3 text-gray-600" />
            <p>No local audio folders scanned yet</p>
            <p className="text-[10px] text-gray-600 mt-1">
              Click "Scan New Folder" to select your Music folder on Windows.
            </p>
          </div>
        )}
      </div>

      {contextMenu && (
        <div
          className="fixed z-50 bg-[#1e1e2d] border border-white/10 rounded-xl shadow-2xl py-2 min-w-[200px]"
          style={{ top: Math.min(contextMenu.y, window.innerHeight - 100), left: Math.min(contextMenu.x, window.innerWidth - 200) }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-white/10 hover:text-white flex items-center gap-3 transition-colors cursor-pointer"
            onClick={() => {
              if (contextMenu.files.length > 0) {
                playTrack(contextMenu.files[0], contextMenu.files, 0);
              }
              setContextMenu(null);
            }}
          >
            <Play className="w-4 h-4 text-indigo-400" />
            Play Folder
          </button>

          <button
            className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-white/10 hover:text-white flex items-center gap-3 transition-colors cursor-pointer"
            onClick={() => {
              if (contextMenu.files.length > 0) {
                playNext(contextMenu.files);
              }
              setContextMenu(null);
            }}
          >
            <ArrowRightToLine className="w-4 h-4 text-indigo-400" />
            Play Next
          </button>

          <button
            className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-white/10 hover:text-white flex items-center gap-3 transition-colors cursor-pointer"
            onClick={() => {
              if (contextMenu.files.length > 0) {
                addToQueue(contextMenu.files);
              }
              setContextMenu(null);
            }}
          >
            <ListPlus className="w-4 h-4 text-indigo-400" />
            Add to Queue
          </button>
          
          <button
            className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-white/10 hover:text-white flex items-center gap-3 transition-colors cursor-pointer"
            onClick={() => {
              const trackIds = contextMenu.files.map(f => f.id);
              createPlaylistWithTracks(contextMenu.folderName, trackIds);
              setContextMenu(null);
            }}
          >
            <ListMusic className="w-4 h-4 text-indigo-400" />
            Make a Playlist
          </button>
        </div>
      )}
    </div>
  );
};
