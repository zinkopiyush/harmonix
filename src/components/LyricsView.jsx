import React, { useState, useEffect, useRef } from 'react';
import { useAudio } from '../context/AudioContext';
import { parseLRC, getActiveLyricIndex } from '../utils/lrcParser';
import { Quote, FileText, Upload } from 'lucide-react';

export const LyricsView = () => {
  const { currentTrack, currentTime, seekTo } = useAudio();
  const [lyricsText, setLyricsText] = useState('');
  const [parsedLyrics, setParsedLyrics] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const activeLineRef = useRef(null);
  const containerRef = useRef(null);

  // Check if current track has embedded or external lyrics loaded
  useEffect(() => {
    if (currentTrack) {
      if (currentTrack.lyrics) {
        setLyricsText(currentTrack.lyrics);
        setParsedLyrics(parseLRC(currentTrack.lyrics));
      } else {
        setLyricsText('');
        setParsedLyrics([]);
      }
    }
  }, [currentTrack]);

  const activeIndex = getActiveLyricIndex(parsedLyrics, currentTime);

  // Smooth auto-scroll active lyric line into center view
  useEffect(() => {
    if (activeLineRef.current && containerRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [activeIndex]);

  const handleSaveLyrics = () => {
    setParsedLyrics(parseLRC(lyricsText));
    setIsEditing(false);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target.result;
        setLyricsText(text);
        setParsedLyrics(parseLRC(text));
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-bg-primary">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border-secondary flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-100 flex items-center gap-2">
            <Quote className="w-5 h-5 text-accent" />
            <span>Synced Lyrics</span>
          </h2>
          <p className="text-xs text-text-secondary mt-0.5">
            {currentTrack ? `${currentTrack.title} — ${currentTrack.artist}` : 'No track playing'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 px-3 py-1.5 bg-bg-tertiary hover:bg-bg-hover text-gray-300 rounded-lg text-xs cursor-pointer transition-colors border border-border-primary">
            <Upload className="w-3.5 h-3.5" />
            <span>Load .LRC File</span>
            <input type="file" accept=".lrc,.txt" onChange={handleFileUpload} className="hidden" />
          </label>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-3 py-1.5 bg-accent/20 hover:bg-accent/40 text-accent rounded-lg text-xs font-medium border border-accent/30 transition-colors"
          >
            {isEditing ? 'Cancel' : 'Paste Lyrics'}
          </button>
        </div>
      </div>

      {/* Main Lyrics Body */}
      {isEditing ? (
        <div className="flex-1 p-6 flex flex-col gap-4">
          <p className="text-xs text-text-secondary">
            Paste LRC timestamped lyrics (e.g. <span className="font-mono text-accent">[00:12.50] Hello world</span>) or plain text lyrics below:
          </p>
          <textarea
            value={lyricsText}
            onChange={(e) => setLyricsText(e.target.value)}
            placeholder="[00:15.00] Enter lyrics line with timestamps here..."
            className="flex-1 bg-bg-tertiary border border-border-primary rounded-xl p-4 text-xs font-mono text-gray-200 focus:outline-none focus:border-accent resize-none"
          />
          <div className="flex justify-end">
            <button
              onClick={handleSaveLyrics}
              className="px-5 py-2 bg-accent hover:bg-accent-hover text-text-primary rounded-lg text-xs font-semibold shadow"
            >
              Apply Lyrics
            </button>
          </div>
        </div>
      ) : parsedLyrics.length > 0 ? (
        <div ref={containerRef} className="flex-1 overflow-y-auto px-8 py-16 text-center space-y-6">
          {parsedLyrics.map((line, index) => {
            const isActive = index === activeIndex;
            return (
              <p
                key={index}
                ref={isActive ? activeLineRef : null}
                onClick={() => seekTo(line.time)}
                className={`cursor-pointer transition-all duration-300 select-none ${
                  isActive
                    ? 'text-2xl font-bold text-accent scale-105 drop-shadow-[0_0_20px_rgba(99,102,241,0.6)]'
                    : 'text-sm font-medium text-text-muted hover:text-gray-300'
                }`}
              >
                {line.text}
              </p>
            );
          })}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-text-muted text-xs p-8">
          <FileText className="w-12 h-12 mb-3 text-gray-600" />
          <p className="font-semibold text-text-secondary">No lyrics loaded for this track</p>
          <p className="text-[11px] text-gray-600 mt-1 max-w-xs text-center">
            Click "Load .LRC File" to upload synced lyrics or "Paste Lyrics" to manually enter lyric text.
          </p>
        </div>
      )}
    </div>
  );
};
