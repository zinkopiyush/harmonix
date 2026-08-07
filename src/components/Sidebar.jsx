import React, { memo, useState, useRef, useEffect } from 'react';
import { useAudio } from '../context/AudioContext';
import { ConfirmModal } from './ConfirmModal';
import {
  Music2,
  Disc,
  User,
  Radio,
  ListMusic,
  FolderTree,
  Activity,
  Quote,
  Heart,
  Sliders,
  Trash2,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';

export const Sidebar = memo(({ sidebarWidth, setSidebarWidth, isCollapsed, setIsCollapsed }) => {
  const {
    activeTab,
    setActiveTab,
    tracks,
    playlists,
    clearLibrary,
    setIsEqModalOpen,
  } = useAudio();

  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const rafRef = useRef(null);

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
  };

  // 144Hz Hardware-Accelerated Resizer Drag Handler
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);

      rafRef.current = requestAnimationFrame(() => {
        let newWidth = e.clientX;
        if (newWidth < 140) {
          setIsCollapsed(true);
          newWidth = 64;
        } else {
          setIsCollapsed(false);
          if (newWidth > 380) newWidth = 380;
        }
        setSidebarWidth(newWidth);
      });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      document.body.style.cursor = 'default';
    };

    if (isResizing) {
      document.body.style.cursor = 'col-resize';
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isResizing, setSidebarWidth, setIsCollapsed]);

  const navItems = [
    { id: 'songs', label: 'All Songs', icon: Music2, count: tracks.length },
    { id: 'albums', label: 'Albums', icon: Disc },
    { id: 'artists', label: 'Artists', icon: User },
    { id: 'genres', label: 'Genres', icon: Radio },
    { id: 'playlists', label: 'Playlists', icon: ListMusic, count: playlists.length },
    { id: 'folders', label: 'Folder Browser', icon: FolderTree },
  ];

  const featureItems = [
    { id: 'visualizer', label: 'Visualizer', icon: Activity },
    { id: 'lyrics', label: 'Synced Lyrics', icon: Quote },
  ];

  const favoritesCount = tracks.filter((t) => t.isFavorite).length;

  return (
    <>
      <aside
        style={{ width: isCollapsed ? '64px' : `${sidebarWidth}px` }}
        className="bg-[#101018] border-r border-white/10 flex flex-col justify-between p-3 select-none relative flex-shrink-0 transition-[width] duration-150 ease-out transform-gpu"
      >
        {/* Resizer Drag Handle */}
        <div
          onMouseDown={() => setIsResizing(true)}
          title="Drag to resize sidebar width"
          className="absolute top-0 right-0 bottom-0 w-1.5 cursor-col-resize hover:bg-indigo-500/50 transition-colors z-20"
        ></div>

        {/* Navigation Sections */}
        <div className="space-y-6">
          {/* Header & Far-Right Collapse Button */}
          <div className="w-full flex items-center justify-between px-2 mb-2">
            {!isCollapsed && (
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                Library
              </span>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              className={`p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer ${
                isCollapsed ? 'mx-auto' : 'ml-auto'
              }`}
            >
              {isCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
            </button>
          </div>

          {/* Main Navigation */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  title={item.label}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer active:scale-98 ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                  </div>
                  {!isCollapsed && item.count !== undefined && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full flex-shrink-0 ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-white/5 text-gray-500 border border-white/5'
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Experience Section */}
          <div className="space-y-1">
            {!isCollapsed && (
              <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider px-3 mb-2">
                Experience
              </div>
            )}
            {featureItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  title={item.label}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer active:scale-98 ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                  }`}
                >
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </button>
              );
            })}

            <button
              onClick={() => handleTabClick('favorites')}
              title="Favorites"
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer active:scale-98 ${
                activeTab === 'favorites'
                  ? 'bg-pink-600 text-white shadow-md shadow-pink-600/30'
                  : 'text-gray-400 hover:text-pink-400 hover:bg-pink-500/10'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Heart className="w-4 h-4 text-pink-500 flex-shrink-0" />
                {!isCollapsed && <span className="truncate">Favorites</span>}
              </div>
              {!isCollapsed && favoritesCount > 0 && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 flex-shrink-0">
                  {favoritesCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setIsEqModalOpen(true)}
              title="Audio Equalizer"
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-gray-400 hover:text-indigo-300 hover:bg-indigo-500/10 transition-colors cursor-pointer active:scale-98"
            >
              <Sliders className="w-4 h-4 text-indigo-400 flex-shrink-0" />
              {!isCollapsed && <span className="truncate">Audio Equalizer</span>}
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-white/10 space-y-2">
          {!isCollapsed && (
            <div className="px-3 py-2 rounded-lg bg-white/5 border border-white/5 text-[11px] text-gray-400">
              <div className="flex justify-between font-medium text-gray-300">
                <span>Audio Library</span>
                <span>{tracks.length} tracks</span>
              </div>
              <p className="text-[10px] text-gray-500 mt-0.5 truncate">Windows 11 Native Engine</p>
            </div>
          )}

          {tracks.length > 0 && (
            <button
              onClick={() => setIsClearModalOpen(true)}
              title="Clear Library Index"
              className="w-full flex items-center justify-center gap-2 px-3 py-1.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-md transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 flex-shrink-0" />
              {!isCollapsed && <span>Clear Library</span>}
            </button>
          )}
        </div>
      </aside>

      <ConfirmModal
        isOpen={isClearModalOpen}
        title="Clear Library Index?"
        message="Are you sure you want to clear your local music library index? Your audio files on disk will NOT be deleted."
        confirmText="Clear Library"
        onConfirm={clearLibrary}
        onClose={() => setIsClearModalOpen(false)}
      />
    </>
  );
});
