import React, { useState, Suspense, lazy } from 'react';
import { useAudio, AudioProvider } from './context/AudioContext';
import { TopBar } from './components/TopBar';
import { ThemeProvider } from './context/ThemeContext';
import { Sidebar } from './components/Sidebar';
import { PlayerBar } from './components/PlayerBar';
import { TrackList } from './components/TrackList';

// Code-split & Lazy-load heavy view components for instant startup & zero memory bloat
const AlbumGrid = lazy(() => import('./components/AlbumGrid').then((m) => ({ default: m.AlbumGrid })));
const ArtistGrid = lazy(() => import('./components/ArtistGrid').then((m) => ({ default: m.ArtistGrid })));
const GenreGrid = lazy(() => import('./components/GenreGrid').then((m) => ({ default: m.GenreGrid })));
const PlaylistView = lazy(() => import('./components/PlaylistView').then((m) => ({ default: m.PlaylistView })));
const FolderBrowser = lazy(() => import('./components/FolderBrowser').then((m) => ({ default: m.FolderBrowser })));
const LyricsView = lazy(() => import('./components/LyricsView').then((m) => ({ default: m.LyricsView })));
const VisualizerView = lazy(() => import('./components/VisualizerView').then((m) => ({ default: m.VisualizerView })));
const EqualizerModal = lazy(() => import('./components/EqualizerModal').then((m) => ({ default: m.EqualizerModal })));
const TagEditorModal = lazy(() => import('./components/TagEditorModal').then((m) => ({ default: m.TagEditorModal })));
const QueueDrawer = lazy(() => import('./components/QueueDrawer').then((m) => ({ default: m.QueueDrawer })));
const SearchResultsView = lazy(() => import('./components/SearchResultsView').then((m) => ({ default: m.SearchResultsView })));
const MiniPlayer = lazy(() => import('./components/MiniPlayer').then((m) => ({ default: m.MiniPlayer })));

// Minimal Loading Spinner Placeholder
const ViewLoader = () => (
  <div className="flex-1 flex items-center justify-center p-8 text-accent">
    <div className="flex items-center gap-3">
      <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
      <span className="text-xs font-semibold text-gray-400">Loading View...</span>
    </div>
  </div>
);

export function AppContent() {
  const {
    activeTab,
    filteredTracks,
    searchQuery,
    isEqModalOpen,
    setIsEqModalOpen,
    isTagEditorOpen,
    setIsTagEditorOpen,
    editingTrack,
    updateTrackTags,
    isQueueOpen,
    setIsQueueOpen,
    isScanning,
    scanProgress,
    isMiniMode,
  } = useAudio();

  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [selectedGenre, setSelectedGenre] = useState(null);

  const [sidebarWidth, setSidebarWidth] = useState(240);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  if (isMiniMode) {
    return (
      <Suspense fallback={<ViewLoader />}>
        <MiniPlayer />
      </Suspense>
    );
  }

  const renderMainContent = () => {
    if (searchQuery.trim()) {
      return (
        <Suspense fallback={<ViewLoader />}>
          <SearchResultsView />
        </Suspense>
      );
    }

    if (selectedAlbum) {
      return (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="px-6 py-3 border-b border-white/5 flex items-center gap-3">
            <button
              onClick={() => setSelectedAlbum(null)}
              className="text-xs text-accent hover:text-accent font-medium cursor-pointer"
            >
              ← Back to Albums
            </button>
          </div>
          <TrackList
            trackItems={selectedAlbum.tracks}
            title={selectedAlbum.name}
            subtitle={`Album • ${selectedAlbum.artist} • ${selectedAlbum.tracks.length} tracks`}
          />
        </div>
      );
    }

    if (selectedArtist) {
      return (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="px-6 py-3 border-b border-white/5 flex items-center gap-3">
            <button
              onClick={() => setSelectedArtist(null)}
              className="text-xs text-accent hover:text-accent font-medium cursor-pointer"
            >
              ← Back to Artists
            </button>
          </div>
          <TrackList
            trackItems={selectedArtist.tracks}
            title={selectedArtist.name}
            subtitle={`Artist • ${selectedArtist.tracks.length} tracks`}
          />
        </div>
      );
    }

    if (selectedGenre) {
      return (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="px-6 py-3 border-b border-white/5 flex items-center gap-3">
            <button
              onClick={() => setSelectedGenre(null)}
              className="text-xs text-accent hover:text-accent font-medium cursor-pointer"
            >
              ← Back to Genres
            </button>
          </div>
          <TrackList
            trackItems={selectedGenre.tracks}
            title={selectedGenre.name}
            subtitle={`Genre • ${selectedGenre.tracks.length} tracks`}
          />
        </div>
      );
    }

    switch (activeTab) {
      case 'songs':
        return <TrackList trackItems={filteredTracks} title="All Songs" />;
      case 'albums':
        return (
          <Suspense fallback={<ViewLoader />}>
            <AlbumGrid onSelectAlbum={(album) => setSelectedAlbum(album)} />
          </Suspense>
        );
      case 'artists':
        return (
          <Suspense fallback={<ViewLoader />}>
            <ArtistGrid onSelectArtist={(artist) => setSelectedArtist(artist)} />
          </Suspense>
        );
      case 'genres':
        return (
          <Suspense fallback={<ViewLoader />}>
            <GenreGrid onSelectGenre={(genre) => setSelectedGenre(genre)} />
          </Suspense>
        );
      case 'playlists':
        return (
          <Suspense fallback={<ViewLoader />}>
            <PlaylistView />
          </Suspense>
        );
      case 'folders':
        return (
          <Suspense fallback={<ViewLoader />}>
            <FolderBrowser />
          </Suspense>
        );
      case 'visualizer':
        return (
          <Suspense fallback={<ViewLoader />}>
            <VisualizerView />
          </Suspense>
        );
      case 'lyrics':
        return (
          <Suspense fallback={<ViewLoader />}>
            <LyricsView />
          </Suspense>
        );
      case 'favorites':
        return (
          <TrackList
            trackItems={filteredTracks.filter((t) => t.isFavorite)}
            title="Favorite Songs"
            subtitle="Songs marked with a heart"
          />
        );
      default:
        return <TrackList trackItems={filteredTracks} title="All Songs" />;
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-bg-primary text-text-primary overflow-hidden font-sans antialiased select-none transform-gpu">
      {/* Top Title Bar (Draggable) */}
      <TopBar />

      {/* Main Layout Body */}
      <div className="flex-1 flex min-h-0 relative">
        {/* Fixed Width Sidebar Navigation */}
        <Sidebar
          sidebarWidth={sidebarWidth}
          setSidebarWidth={setSidebarWidth}
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
        />

        {/* Dynamic Center Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0 bg-bg-primary relative overflow-hidden">
          {/* Scanning Progress Overlay Banner */}
          {isScanning && (
            <div className="bg-accent/90 text-white px-6 py-2 flex items-center justify-between text-xs shadow-lg border-b border-accent/30 z-30">
              <div className="flex items-center gap-3 font-semibold">
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>
                  Scanning Music Library ({scanProgress.current} / {scanProgress.total})...
                </span>
              </div>
              <div className="w-48 bg-black/30 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-white h-full transition-all duration-150"
                  style={{
                    width: `${
                      scanProgress.total
                        ? (scanProgress.current / scanProgress.total) * 100
                        : 0
                    }%`,
                  }}
                ></div>
              </div>
            </div>
          )}

          {renderMainContent()}
        </main>

        {/* Play Queue Right Drawer */}
        <Suspense fallback={null}>
          <QueueDrawer isOpen={isQueueOpen} onClose={() => setIsQueueOpen(false)} />
        </Suspense>
      </div>

      <PlayerBar />

      {/* Modals */}
      <Suspense fallback={null}>
        <EqualizerModal isOpen={isEqModalOpen} onClose={() => setIsEqModalOpen(false)} />
      </Suspense>
      <Suspense fallback={null}>
        <TagEditorModal
          isOpen={isTagEditorOpen}
          track={editingTrack}
          onSave={(trackId, updatedFields) => updateTrackTags(trackId, updatedFields)}
          onClose={() => setIsTagEditorOpen(false)}
        />
      </Suspense>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AudioProvider>
        <AppContent />
      </AudioProvider>
    </ThemeProvider>
  );
}
