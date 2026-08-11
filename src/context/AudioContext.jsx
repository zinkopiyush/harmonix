import React, { createContext, useContext, useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  getAllTracksFromDB,
  saveTracksToDB,
  deleteTrackFromDB,
  clearTracksDB,
  getAllPlaylistsFromDB,
  savePlaylistToDB,
  deletePlaylistFromDB,
  getSettingDB,
  setSettingDB,
} from '../utils/storage';
import { parseTrackMetadata } from '../utils/audioMetadata';
import { AlertModal } from '../components/AlertModal';

const AudioContext = createContext(null);

export const EQ_FREQUENCIES = [32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];

export const EQ_PRESETS = {
  Flat: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  'Bass Boost': [6, 5, 4, 2, 0, 0, 0, 0, 0, 0],
  'Bass Reducer': [-6, -5, -4, -2, 0, 0, 0, 0, 0, 0],
  'Treble Boost': [0, 0, 0, 0, 0, 1, 3, 5, 6, 7],
  Rock: [4, 3, 2, 0, -1, 0, 2, 3, 4, 4],
  Pop: [-1, 1, 3, 4, 3, 0, -1, -1, 2, 3],
  Jazz: [3, 2, 1, 2, -1, -1, 0, 1, 2, 3],
  Classical: [4, 3, 2, 2, -1, -1, 0, 2, 3, 4],
  EDM: [5, 4, 2, 0, -2, 2, 3, 4, 4, 3],
  Vocal: [-2, -2, 0, 3, 4, 3, 2, 1, 0, -1],
};

function fixPictureMimeType(picUrl) {
  if (!picUrl || typeof picUrl !== 'string') return null;
  if (picUrl.startsWith('data:jpeg;')) return picUrl.replace('data:jpeg;', 'data:image/jpeg;');
  if (picUrl.startsWith('data:jpg;')) return picUrl.replace('data:jpg;', 'data:image/jpeg;');
  if (picUrl.startsWith('data:png;')) return picUrl.replace('data:png;', 'data:image/png;');
  if (picUrl.startsWith('data:webp;')) return picUrl.replace('data:webp;', 'data:image/webp;');
  return picUrl;
}

export const AudioProvider = ({ children }) => {
  const [tracks, setTracks] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [currentFolder, setCurrentFolder] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState({ current: 0, total: 0 });

  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRateState] = useState(1.0);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState('off');

  const [queue, setQueue] = useState([]);
  const [queueIndex, setQueueIndex] = useState(-1);
  const [playHistory, setPlayHistory] = useState([]); // True history stack for previous track playback in shuffle

  const [isEqEnabled, setIsEqEnabled] = useState(true);
  const [eqPreset, setEqPreset] = useState('Flat');
  const [eqGains, setEqGains] = useState([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  const [preampGain, setPreampGain] = useState(0);

  const [audioDevices, setAudioDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState('');

  const [activeTab, setActiveTab] = useState('songs');
  const [searchQuery, setSearchQuery] = useState('');
  const [isEqModalOpen, setIsEqModalOpen] = useState(false);
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [isTagEditorOpen, setIsTagEditorOpen] = useState(false);
  const [editingTrack, setEditingTrack] = useState(null);
  const [isMiniMode, setIsMiniMode] = useState(false);

  const audioRef = useRef(new Audio());
  const audioCtxRef = useRef(null);
  const sourceNodeRef = useRef(null);
  const analyserNodeRef = useRef(null);
  const filtersRef = useRef([]);
  const preampNodeRef = useRef(null);
  const lastTimeUpdateRef = useRef(0);
  const [alertModal, setAlertModal] = useState({ isOpen: false, title: '', message: '', type: 'info' });

  const showAlert = (title, message, type = 'info') => {
    setAlertModal({ isOpen: true, title, message, type });
  };

  const initWebAudio = useCallback(() => {
    if (audioCtxRef.current) return;

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const audioEl = audioRef.current;
      audioEl.crossOrigin = 'anonymous';

      const source = ctx.createMediaElementSource(audioEl);
      sourceNodeRef.current = source;

      const preamp = ctx.createGain();
      preamp.gain.value = Math.pow(10, preampGain / 20);
      preampNodeRef.current = preamp;

      const filters = EQ_FREQUENCIES.map((freq, index) => {
        const filter = ctx.createBiquadFilter();
        if (index === 0) {
          filter.type = 'lowshelf';
        } else if (index === EQ_FREQUENCIES.length - 1) {
          filter.type = 'highshelf';
        } else {
          filter.type = 'peaking';
          filter.Q.value = 1.4;
        }
        filter.frequency.value = freq;
        filter.gain.value = eqGains[index];
        return filter;
      });
      filtersRef.current = filters;

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      analyserNodeRef.current = analyser;

      let lastNode = source;
      lastNode.connect(preamp);
      lastNode = preamp;

      filters.forEach((filter) => {
        lastNode.connect(filter);
        lastNode = filter;
      });

      lastNode.connect(analyser);
      analyser.connect(ctx.destination);
    } catch (err) {
      console.error('Failed to initialize Web Audio API engine:', err);
    }
  }, [preampGain, eqGains]);

  useEffect(() => {
    async function loadData() {
      const dbTracks = await getAllTracksFromDB();
      if (dbTracks && dbTracks.length > 0) {
        const sanitized = dbTracks.map((t) => ({
          ...t,
          picture: fixPictureMimeType(t.picture),
        }));
        setTracks(sanitized);
      }
      const dbPlaylists = await getAllPlaylistsFromDB();
      if (dbPlaylists && dbPlaylists.length > 0) {
        setPlaylists(dbPlaylists);
      }

      const savedVol = await getSettingDB('volume', 0.8);
      setVolumeState(savedVol);
      audioRef.current.volume = Math.pow(savedVol, 3);

      const savedEqPreset = await getSettingDB('eqPreset', 'Flat');
      setEqPreset(savedEqPreset);
      if (EQ_PRESETS[savedEqPreset]) {
        setEqGains(EQ_PRESETS[savedEqPreset]);
      }
    }

    loadData();
  }, []);

  // Listen to native play/pause for Windows 11 touchpad gesture & media keys
  useEffect(() => {
    const audio = audioRef.current;

    const handlePlayEvent = () => setIsPlaying(true);
    const handlePauseEvent = () => setIsPlaying(false);

    const handleTimeUpdate = () => {
      const now = Date.now();
      if (now - lastTimeUpdateRef.current > 250) {
        lastTimeUpdateRef.current = now;
        setCurrentTime(audio.currentTime);
      }
    };
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleEnded = () => handleNextTrack(true);
    const handleError = (e) => console.error('Audio playback error:', e);

    audio.addEventListener('play', handlePlayEvent);
    audio.addEventListener('pause', handlePauseEvent);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('play', handlePlayEvent);
      audio.removeEventListener('pause', handlePauseEvent);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [queue, queueIndex, repeatMode, isShuffle, playHistory]);

  // Fast Memoized maps for Albums and Artists
  const albumsMap = useMemo(() => {
    if (tracks.length === 0) return [];
    const map = new Map();
    tracks.forEach((track) => {
      const albumName = track.album || 'Unknown Album';
      if (!map.has(albumName)) {
        map.set(albumName, {
          name: albumName,
          artist: track.artist || 'Unknown Artist',
          picture: track.picture,
          tracks: [],
        });
      }
      map.get(albumName).tracks.push(track);
    });
    return Array.from(map.values());
  }, [tracks]);

  const artistsMap = useMemo(() => {
    if (tracks.length === 0) return [];
    const map = new Map();
    tracks.forEach((track) => {
      const artistName = track.artist || 'Unknown Artist';
      if (!map.has(artistName)) {
        map.set(artistName, {
          name: artistName,
          picture: track.picture,
          tracks: [],
          albums: new Set(),
        });
      }
      const entry = map.get(artistName);
      entry.tracks.push(track);
      if (track.album) entry.albums.add(track.album);
    });
    return Array.from(map.values());
  }, [tracks]);

  const playTrack = (track, newQueue = null, indexInQueue = 0, addToHistory = true) => {
    initWebAudio();
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }

    if (currentTrack && addToHistory) {
      setPlayHistory((prev) => [...prev, currentTrack]);
    }

    if (newQueue) {
      setQueue(newQueue);
      setQueueIndex(indexInQueue);
    }

    setCurrentTrack(track);

    let audioSrc = track.path;
    if (!audioSrc.startsWith('http') && !audioSrc.startsWith('file://')) {
      audioSrc = `file:///${track.path.replace(/\\/g, '/')}`;
    }

    audioRef.current.src = audioSrc;
    audioRef.current.playbackRate = playbackRate;
    audioRef.current.volume = isMuted ? 0 : Math.pow(volume, 3);

    audioRef.current
      .play()
      .then(() => {
        setIsPlaying(true);
        const updatedTracks = tracks.map((t) =>
          t.id === track.id ? { ...t, playCount: (t.playCount || 0) + 1 } : t
        );
        setTracks(updatedTracks);
        saveTracksToDB(updatedTracks);
      })
      .catch((err) => {
        console.error('Failed to play audio file:', err);
        setIsPlaying(false);
      });
  };

  const togglePlay = () => {
    initWebAudio();
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }

    if (!currentTrack) {
      if (tracks.length > 0) {
        playTrack(tracks[0], tracks, 0);
      }
      return;
    }

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(console.error);
    }
  };

  const handleNextTrack = (autoEnded = false) => {
    if (repeatMode === 'one' && autoEnded && currentTrack) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      return;
    }

    if (queue.length === 0) return;

    let nextIndex = queueIndex + 1;

    if (queue[nextIndex]?._isManualNext) {
      setQueue((prev) => {
        const copy = [...prev];
        copy[nextIndex] = { ...copy[nextIndex] };
        delete copy[nextIndex]._isManualNext;
        return copy;
      });
    } else if (isShuffle) {
      nextIndex = Math.floor(Math.random() * queue.length);
    } else if (nextIndex >= queue.length) {
      if (repeatMode === 'all') {
        nextIndex = 0;
      } else {
        setIsPlaying(false);
        return;
      }
    }

    const nextTrack = queue[nextIndex];
    if (nextTrack) {
      playTrack(nextTrack, queue, nextIndex, true);
    }
  };

  // Fixed Previous Track: On Shuffle mode, pop from playHistory so it ALWAYS plays the true previous song
  const handlePrevTrack = () => {
    if (currentTime > 3) {
      seekTo(0);
      return;
    }

    if (playHistory.length > 0) {
      const prevTrack = playHistory[playHistory.length - 1];
      setPlayHistory((prev) => prev.slice(0, -1));

      const newIndex = queue.findIndex((t) => t.id === prevTrack.id);
      playTrack(prevTrack, null, newIndex >= 0 ? newIndex : 0, false);
      return;
    }

    if (queue.length === 0) return;

    let prevIndex = queueIndex - 1;
    if (prevIndex < 0) {
      prevIndex = queue.length - 1;
    }

    const prevTrack = queue[prevIndex];
    if (prevTrack) {
      playTrack(prevTrack, queue, prevIndex, false);
    }
  };

  // Natively hook into Windows 11/macOS Media Transport Controls (enables touchpad sliding & media keys)
  useEffect(() => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.setActionHandler('play', () => {
        if (!isPlaying) togglePlay();
      });
      navigator.mediaSession.setActionHandler('pause', () => {
        if (isPlaying) togglePlay();
      });
      navigator.mediaSession.setActionHandler('previoustrack', handlePrevTrack);
      navigator.mediaSession.setActionHandler('nexttrack', () => handleNextTrack(false));
    }
  }); // Runs after every render to capture the latest handler closures without stale state

  useEffect(() => {
    if ('mediaSession' in navigator && currentTrack) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentTrack.title || 'Unknown Title',
        artist: currentTrack.artist || 'Unknown Artist',
        album: currentTrack.album || 'Unknown Album',
        artwork: currentTrack.picture
          ? [
              {
                src: currentTrack.picture,
                sizes: '512x512',
                type: 'image/jpeg',
              },
            ]
          : [],
      });
    }
  }, [currentTrack]);

  const seekTo = (newTime) => {
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const changeVolume = (val) => {
    const newVol = Math.max(0, Math.min(1, val));
    setVolumeState(newVol);
    audioRef.current.volume = isMuted ? 0 : Math.pow(newVol, 3);
    setSettingDB('volume', newVol);
  };

  const toggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    audioRef.current.volume = nextMute ? 0 : Math.pow(volume, 3);
  };

  const changePlaybackRate = (rate) => {
    setPlaybackRateState(rate);
    audioRef.current.playbackRate = rate;
  };

  // Updated Keyboard Shortcuts: Ctrl + Left Arrow / Ctrl + Right Arrow = Prev / Next Track
  useEffect(() => {
    const handleKeyDown = (e) => {
      const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
      if (activeTag === 'input' || activeTag === 'textarea' || document.activeElement.isContentEditable) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        const searchInput = document.getElementById('searchInputField');
        if (searchInput) searchInput.focus();
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        if (e.ctrlKey || e.metaKey) {
          handlePrevTrack();
        } else {
          seekTo(Math.max(0, audioRef.current.currentTime - 10));
        }
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        if (e.ctrlKey || e.metaKey) {
          handleNextTrack(false);
        } else {
          seekTo(Math.min(audioRef.current.duration || 100, audioRef.current.currentTime + 10));
        }
      } else if (e.code === 'ArrowUp') {
        e.preventDefault();
        changeVolume(volume + 0.05);
      } else if (e.code === 'ArrowDown') {
        e.preventDefault();
        changeVolume(volume - 0.05);
      } else if (e.key === 'm' || e.key === 'M') {
        toggleMute();
      } else if (e.key === 's' || e.key === 'S') {
        setIsShuffle(!isShuffle);
      } else if (e.key === 'r' || e.key === 'R') {
        if (repeatMode === 'off') setRepeatMode('all');
        else if (repeatMode === 'all') setRepeatMode('one');
        else setRepeatMode('off');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, handlePrevTrack, handleNextTrack, volume, isMuted, isShuffle, repeatMode, seekTo, changeVolume]);

  const applyPreset = (presetName) => {
    setEqPreset(presetName);
    setSettingDB('eqPreset', presetName);
    const gains = EQ_PRESETS[presetName] || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    setEqGains(gains);

    if (filtersRef.current.length > 0) {
      filtersRef.current.forEach((filter, index) => {
        filter.gain.value = isEqEnabled ? gains[index] : 0;
      });
    }
  };

  const changeEqGain = (bandIndex, gainVal) => {
    const newGains = [...eqGains];
    newGains[bandIndex] = gainVal;
    setEqGains(newGains);
    setEqPreset('Custom');

    if (filtersRef.current[bandIndex]) {
      filtersRef.current[bandIndex].gain.value = isEqEnabled ? gainVal : 0;
    }
  };

  const changePreamp = (gainVal) => {
    setPreampGain(gainVal);
    if (preampNodeRef.current) {
      preampNodeRef.current.gain.value = Math.pow(10, gainVal / 20);
    }
  };

  const toggleEqEnabled = () => {
    const nextEnabled = !isEqEnabled;
    setIsEqEnabled(nextEnabled);
    if (filtersRef.current.length > 0) {
      filtersRef.current.forEach((filter, index) => {
        filter.gain.value = nextEnabled ? eqGains[index] : 0;
      });
    }
  };

  const scanFolder = async () => {
    if (!window.electronAPI) return;
    const folderPath = await window.electronAPI.openDirectory();
    if (!folderPath) return;

    setCurrentFolder(folderPath);
    setIsScanning(true);
    setScanProgress({ current: 0, total: 0 });

    try {
      const fileList = await window.electronAPI.scanFolder(folderPath);
      setScanProgress({ current: 0, total: fileList.length });

      const newParsedTracks = [];
      const CHUNK_SIZE = 5;

      for (let i = 0; i < fileList.length; i += CHUNK_SIZE) {
        const chunk = fileList.slice(i, i + CHUNK_SIZE);
        const parsedChunk = await Promise.all(chunk.map((f) => parseTrackMetadata(f)));
        newParsedTracks.push(...parsedChunk);
        setScanProgress({ current: Math.min(i + CHUNK_SIZE, fileList.length), total: fileList.length });
        await new Promise((resolve) => setTimeout(resolve, 0));
      }

      const trackMap = new Map();
      tracks.forEach((t) => trackMap.set(t.path, t));
      newParsedTracks.forEach((t) => trackMap.set(t.path, t));

      const mergedTracks = Array.from(trackMap.values());
      setTracks(mergedTracks);
      await saveTracksToDB(mergedTracks);
    } catch (err) {
      console.error('Error during folder scan:', err);
    } finally {
      setIsScanning(false);
    }
  };

  const addIndividualFiles = async () => {
    if (!window.electronAPI) return;
    const filePaths = await window.electronAPI.openFiles();
    if (!filePaths || filePaths.length === 0) return;

    setIsScanning(true);
    setScanProgress({ current: 0, total: filePaths.length });

    try {
      const newParsedTracks = [];
      for (let i = 0; i < filePaths.length; i++) {
        const p = filePaths[i];
        const parsed = await parseTrackMetadata(p);
        newParsedTracks.push(parsed);
        setScanProgress({ current: i + 1, total: filePaths.length });
      }

      const trackMap = new Map();
      tracks.forEach((t) => trackMap.set(t.path, t));
      newParsedTracks.forEach((t) => trackMap.set(t.path, t));

      const mergedTracks = Array.from(trackMap.values());
      setTracks(mergedTracks);
      await saveTracksToDB(mergedTracks);
    } catch (err) {
      console.error('Error adding individual files:', err);
    } finally {
      setIsScanning(false);
    }
  };

  const importFolderAsPlaylist = async () => {
    if (!window.electronAPI) return;
    const folderPath = await window.electronAPI.openDirectory();
    if (!folderPath) return;

    const folderName = folderPath.split('\\').pop().split('/').pop() || 'New Folder Playlist';
    
    // Check for duplicate playlist
    const exists = playlists.some((p) => p.name.toLowerCase() === folderName.toLowerCase());
    if (exists) {
      showAlert('Playlist Exists', `A playlist named "${folderName}" already exists.`, 'error');
      return;
    }

    setIsScanning(true);

    try {
      const fileList = await window.electronAPI.scanFolder(folderPath);
      setScanProgress({ current: 0, total: fileList.length });

      const newParsedTracks = [];
      const newTrackIds = [];

      for (let i = 0; i < fileList.length; i++) {
        const parsed = await parseTrackMetadata(fileList[i]);
        newParsedTracks.push(parsed);
        newTrackIds.push(parsed.id);
        setScanProgress({ current: i + 1, total: fileList.length });
      }

      const trackMap = new Map();
      tracks.forEach((t) => trackMap.set(t.path, t));
      newParsedTracks.forEach((t) => trackMap.set(t.path, t));

      const mergedTracks = Array.from(trackMap.values());
      setTracks(mergedTracks);
      await saveTracksToDB(mergedTracks);

      const newPlaylist = {
        id: Date.now().toString(),
        name: folderName,
        trackIds: newTrackIds,
        picture: null,
        createdAt: Date.now(),
      };

      const updatedPlaylists = [...playlists, newPlaylist];
      setPlaylists(updatedPlaylists);
      await savePlaylistToDB(newPlaylist);
      showAlert('Playlist Created', `Playlist "${folderName}" was successfully created with ${newTrackIds.length} tracks.`, 'success');
    } catch (err) {
      console.error('Error importing folder as playlist:', err);
    } finally {
      setIsScanning(false);
    }
  };

  const addFilesToPlaylist = async (playlistId) => {
    if (!window.electronAPI) return;
    const filePaths = await window.electronAPI.openFiles();
    if (!filePaths || filePaths.length === 0) return;

    setIsScanning(true);
    try {
      const newParsedTracks = [];
      const addedTrackIds = [];

      for (let i = 0; i < filePaths.length; i++) {
        const parsed = await parseTrackMetadata(filePaths[i]);
        newParsedTracks.push(parsed);
        addedTrackIds.push(parsed.id);
      }

      const trackMap = new Map();
      tracks.forEach((t) => trackMap.set(t.path, t));
      newParsedTracks.forEach((t) => trackMap.set(t.path, t));

      const mergedTracks = Array.from(trackMap.values());
      setTracks(mergedTracks);
      await saveTracksToDB(mergedTracks);

      const updatedPlaylists = playlists.map((p) => {
        if (p.id === playlistId) {
          const uniqueIds = Array.from(new Set([...p.trackIds, ...addedTrackIds]));
          return { ...p, trackIds: uniqueIds };
        }
        return p;
      });

      setPlaylists(updatedPlaylists);
      const target = updatedPlaylists.find((p) => p.id === playlistId);
      if (target) await savePlaylistToDB(target);
    } catch (err) {
      console.error('Error adding files to playlist:', err);
    } finally {
      setIsScanning(false);
    }
  };

  const updatePlaylistCover = async (playlistId, pictureDataUrl) => {
    const updatedPlaylists = playlists.map((p) => {
      if (p.id === playlistId) {
        return { ...p, picture: pictureDataUrl };
      }
      return p;
    });

    setPlaylists(updatedPlaylists);
    const target = updatedPlaylists.find((p) => p.id === playlistId);
    if (target) await savePlaylistToDB(target);
  };

  const renamePlaylist = async (playlistId, newName) => {
    if (!newName.trim()) return;
    const updatedPlaylists = playlists.map((p) => {
      if (p.id === playlistId) {
        return { ...p, name: newName.trim() };
      }
      return p;
    });

    setPlaylists(updatedPlaylists);
    const target = updatedPlaylists.find((p) => p.id === playlistId);
    if (target) await savePlaylistToDB(target);
  };

  const refreshLibraryMetadata = async () => {
    if (tracks.length === 0) return;
    setIsScanning(true);
    setScanProgress({ current: 0, total: tracks.length });

    try {
      const updatedTracks = [];
      for (let i = 0; i < tracks.length; i++) {
        const fresh = await parseTrackMetadata(tracks[i].path);
        fresh.isFavorite = tracks[i].isFavorite || false;
        fresh.playCount = tracks[i].playCount || 0;
        updatedTracks.push(fresh);
        setScanProgress({ current: i + 1, total: tracks.length });
        await new Promise((resolve) => setTimeout(resolve, 0));
      }

      setTracks(updatedTracks);
      await saveTracksToDB(updatedTracks);
    } catch (err) {
      console.error('Error refreshing library metadata:', err);
    } finally {
      setIsScanning(false);
    }
  };

  const toggleFavorite = (trackId) => {
    const updated = tracks.map((t) => (t.id === trackId ? { ...t, isFavorite: !t.isFavorite } : t));
    setTracks(updated);
    saveTracksToDB(updated);

    if (currentTrack && currentTrack.id === trackId) {
      setCurrentTrack({ ...currentTrack, isFavorite: !currentTrack.isFavorite });
    }
  };

  const updateTrackTags = (trackId, updatedFields) => {
    const updated = tracks.map((t) => (t.id === trackId ? { ...t, ...updatedFields } : t));
    setTracks(updated);
    saveTracksToDB(updated);

    if (currentTrack && currentTrack.id === trackId) {
      setCurrentTrack({ ...currentTrack, ...updatedFields });
    }
  };

  const removeTrack = async (trackId) => {
    const updated = tracks.filter((t) => t.id !== trackId);
    setTracks(updated);
    await deleteTrackFromDB(trackId);

    setQueue((prev) => prev.filter((t) => t.id !== trackId));
    if (currentTrack && currentTrack.id === trackId) {
      handleNextTrack();
    }
  };

  const clearLibrary = async () => {
    setTracks([]);
    setQueue([]);
    setCurrentTrack(null);
    setIsPlaying(false);
    audioRef.current.pause();
    await clearTracksDB();
  };

  const createPlaylist = async (name) => {
    if (!name.trim()) return;
    const exists = playlists.some((p) => p.name.toLowerCase() === name.trim().toLowerCase());
    if (exists) {
      showAlert('Playlist Exists', `A playlist named "${name.trim()}" already exists.`, 'error');
      return null;
    }
    const newPlaylist = {
      id: Date.now().toString(),
      name: name.trim(),
      trackIds: [],
      picture: null,
      createdAt: Date.now(),
    };
    const updated = [...playlists, newPlaylist];
    setPlaylists(updated);
    await savePlaylistToDB(newPlaylist);
    return newPlaylist;
  };

  const createPlaylistWithTracks = async (name, trackIds) => {
    if (!name.trim()) return;
    const exists = playlists.some((p) => p.name.toLowerCase() === name.trim().toLowerCase());
    if (exists) {
      showAlert('Playlist Exists', `A playlist named "${name.trim()}" already exists.`, 'error');
      return null;
    }
    const newPlaylist = {
      id: Date.now().toString(),
      name: name.trim(),
      trackIds: trackIds,
      picture: null,
      createdAt: Date.now(),
    };
    const updated = [...playlists, newPlaylist];
    setPlaylists(updated);
    await savePlaylistToDB(newPlaylist);
    showAlert('Playlist Created', `Playlist "${name.trim()}" was successfully created with ${trackIds.length} tracks.`, 'success');
    return newPlaylist;
  };

  const deletePlaylist = async (id) => {
    const updated = playlists.filter((p) => p.id !== id);
    setPlaylists(updated);
    await deletePlaylistFromDB(id);
  };

  const addTrackToPlaylist = async (playlistId, trackId) => {
    const updated = playlists.map((p) => {
      if (p.id === playlistId && !p.trackIds.includes(trackId)) {
        return { ...p, trackIds: [...p.trackIds, trackId] };
      }
      return p;
    });
    setPlaylists(updated);
    const target = updated.find((p) => p.id === playlistId);
    if (target) await savePlaylistToDB(target);
  };

  const removeTrackFromPlaylist = async (playlistId, trackId) => {
    const updated = playlists.map((p) => {
      if (p.id === playlistId) {
        return { ...p, trackIds: p.trackIds.filter((id) => id !== trackId) };
      }
      return p;
    });
    setPlaylists(updated);
    const target = updated.find((p) => p.id === playlistId);
    if (target) await savePlaylistToDB(target);
  };

  const addToQueue = (trackOrTracks) => {
    setQueue((prev) => {
      if (Array.isArray(trackOrTracks)) {
        return [...prev, ...trackOrTracks];
      }
      return [...prev, trackOrTracks];
    });
  };

  const playNext = (trackOrTracks) => {
    setQueue((prev) => {
      const copy = [...prev];
      if (Array.isArray(trackOrTracks)) {
        const markedTracks = trackOrTracks.map((t) => ({ ...t, _isManualNext: true }));
        copy.splice(queueIndex + 1, 0, ...markedTracks);
      } else {
        copy.splice(queueIndex + 1, 0, { ...trackOrTracks, _isManualNext: true });
      }
      return copy;
    });
  };

  const removeFromQueue = (index) => {
    setQueue((prev) => prev.filter((_, i) => i !== index));
    if (index === queueIndex) {
      handleNextTrack();
    } else if (index < queueIndex) {
      setQueueIndex((prev) => prev - 1);
    }
  };

  const clearQueue = () => {
    setQueue([]);
    setQueueIndex(-1);
    setCurrentTrack(null);
  };

  const moveInQueue = (fromIndex, toIndex) => {
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || fromIndex >= queue.length || toIndex >= queue.length) return;
    
    setQueue((prev) => {
      const copy = [...prev];
      const [item] = copy.splice(fromIndex, 1);
      copy.splice(toIndex, 0, item);
      return copy;
    });
    
    setQueueIndex((prev) => {
      if (prev === fromIndex) return toIndex;
      if (prev > fromIndex && prev <= toIndex) return prev - 1;
      if (prev < fromIndex && prev >= toIndex) return prev + 1;
      return prev;
    });
  };

  const filteredTracks = useMemo(() => {
    if (!searchQuery.trim()) return tracks;
    const query = searchQuery.toLowerCase();
    return tracks.filter(
      (t) =>
        t.title.toLowerCase().includes(query) ||
        t.artist.toLowerCase().includes(query) ||
        t.album.toLowerCase().includes(query) ||
        t.genre.toLowerCase().includes(query)
    );
  }, [tracks, searchQuery]);

  return (
    <AudioContext.Provider
      value={{
        tracks,
        filteredTracks,
        playlists,
        albumsMap,
        artistsMap,
        currentFolder,
        isScanning,
        scanProgress,
        scanFolder,
        addIndividualFiles,
        refreshLibraryMetadata,
        toggleFavorite,
        updateTrackTags,
        removeTrack,
        clearLibrary,
        createPlaylist,
        createPlaylistWithTracks,
        deletePlaylist,
        renamePlaylist,
        addTrackToPlaylist,
        removeTrackFromPlaylist,
        importFolderAsPlaylist,
        addFilesToPlaylist,
        updatePlaylistCover,
        currentTrack,
        isPlaying,
        currentTime,
        duration,
        volume,
        isMuted,
        playbackRate,
        isShuffle,
        repeatMode,
        playTrack,
        togglePlay,
        handleNextTrack,
        handlePrevTrack,
        playHistory,
        seekTo,
        changeVolume,
        toggleMute,
        changePlaybackRate,
        setIsShuffle,
        setRepeatMode,
        queue,
        queueIndex,
        addToQueue,
        playNext,
        removeFromQueue,
        clearQueue,
        moveInQueue,
        isEqEnabled,
        eqPreset,
        eqGains,
        preampGain,
        applyPreset,
        changeEqGain,
        changePreamp,
        toggleEqEnabled,
        audioDevices,
        selectedDevice,
        activeTab,
        setActiveTab,
        searchQuery,
        setSearchQuery,
        isEqModalOpen,
        setIsEqModalOpen,
        isQueueOpen,
        setIsQueueOpen,
        isTagEditorOpen,
        setIsTagEditorOpen,
        editingTrack,
        setEditingTrack,
        isMiniMode,
        setIsMiniMode,
        analyserNodeRef,
      }}
    >
      {children}
      <AlertModal 
        isOpen={alertModal.isOpen} 
        title={alertModal.title} 
        message={alertModal.message} 
        type={alertModal.type}
        onClose={() => setAlertModal({ ...alertModal, isOpen: false })} 
      />
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};
