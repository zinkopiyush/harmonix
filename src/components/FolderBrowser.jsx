import React, { useMemo } from 'react';
import { useAudio } from '../context/AudioContext';
import { TrackList } from './TrackList';
import { FolderTree, Folder, HardDrive } from 'lucide-react';

export const FolderBrowser = () => {
  const { tracks, currentFolder, scanFolder } = useAudio();

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

  const [selectedFolderPath, setSelectedFolderPath] = React.useState(null);

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
    <div className="flex-1 flex flex-col overflow-hidden">
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
    </div>
  );
};
