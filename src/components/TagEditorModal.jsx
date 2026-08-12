import React, { useState, useEffect } from 'react';
import { useAudio } from '../context/AudioContext';
import { Edit, X, Save } from 'lucide-react';

export const TagEditorModal = () => {
  const { isTagEditorOpen, setIsTagEditorOpen, editingTrack, updateTrackTags } = useAudio();

  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    album: '',
    genre: '',
    year: '',
    trackNo: '',
  });

  useEffect(() => {
    if (editingTrack) {
      setFormData({
        title: editingTrack.title || '',
        artist: editingTrack.artist || '',
        album: editingTrack.album || '',
        genre: editingTrack.genre || '',
        year: editingTrack.year || '',
        trackNo: editingTrack.trackNo || '',
      });
    }
  }, [editingTrack]);

  if (!isTagEditorOpen || !editingTrack) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    updateTrackTags(editingTrack.id, formData);
    setIsTagEditorOpen(false);
  };

  return (
    <div
      onClick={() => setIsTagEditorOpen(false)}
      className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-bg-secondary border border-border-primary rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-bg-tertiary border-b border-border-primary flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent-hover/20 text-accent border border-accent/30 flex items-center justify-center">
              <Edit className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-text-primary">Edit Song Metadata</h3>
              <p className="text-[10px] text-text-muted truncate max-w-[200px]">
                {editingTrack.name || editingTrack.path}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsTagEditorOpen(false)}
            className="p-1 text-text-muted hover:text-text-primary rounded-lg hover:bg-bg-hover"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1">
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 bg-bg-tertiary border border-border-primary rounded-lg text-xs text-gray-100 focus:outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1">
              Artist
            </label>
            <input
              type="text"
              value={formData.artist}
              onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
              className="w-full px-3 py-2 bg-bg-tertiary border border-border-primary rounded-lg text-xs text-gray-100 focus:outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1">
              Album
            </label>
            <input
              type="text"
              value={formData.album}
              onChange={(e) => setFormData({ ...formData, album: e.target.value })}
              className="w-full px-3 py-2 bg-bg-tertiary border border-border-primary rounded-lg text-xs text-gray-100 focus:outline-none focus:border-accent"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1">
                Genre
              </label>
              <input
                type="text"
                value={formData.genre}
                onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                className="w-full px-3 py-2 bg-bg-tertiary border border-border-primary rounded-lg text-xs text-gray-100 focus:outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1">
                Year
              </label>
              <input
                type="text"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                className="w-full px-3 py-2 bg-bg-tertiary border border-border-primary rounded-lg text-xs text-gray-100 focus:outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1">
                Track #
              </label>
              <input
                type="text"
                value={formData.trackNo}
                onChange={(e) => setFormData({ ...formData, trackNo: e.target.value })}
                className="w-full px-3 py-2 bg-bg-tertiary border border-border-primary rounded-lg text-xs text-gray-100 focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-border-primary flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsTagEditorOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-text-muted hover:text-text-primary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 bg-accent hover:bg-accent-hover text-text-primary rounded-lg text-xs font-semibold shadow"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
