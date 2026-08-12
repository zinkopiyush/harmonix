import React from 'react';
import { AlertTriangle } from 'lucide-react';

export const ConfirmModal = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  isDanger = true,
}) => {
  if (!isOpen) return null;

  return (
    <div
      onClick={onCancel}
      className="fixed inset-0 bg-bg-primary/60 backdrop-blur-md z-50 flex items-center justify-center p-4 select-none animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-bg-secondary border border-border-primary rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150"
      >
        <div className="p-5 flex flex-col items-center text-center gap-3">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center border shadow-lg ${
              isDanger
                ? 'bg-red-500/20 text-red-400 border-red-500/30'
                : 'bg-accent-hover/20 text-accent border-accent/30'
            }`}
          >
            <AlertTriangle className="w-6 h-6" />
          </div>

          <h3 className="font-bold text-base text-text-primary">{title}</h3>
          <p className="text-xs text-text-muted leading-relaxed">{message}</p>
        </div>

        <div className="px-5 py-3.5 bg-bg-tertiary border-t border-border-primary flex items-center justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-xs font-semibold text-text-muted hover:text-text-primary rounded-lg hover:bg-bg-tertiary transition-colors cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-xs font-semibold text-text-primary rounded-lg shadow transition-all cursor-pointer ${
              isDanger
                ? 'bg-red-600 hover:bg-red-500 shadow-red-600/30'
                : 'bg-accent hover:bg-accent-hover shadow-black/20'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
