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
      className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 select-none animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#14141f] border border-white/10 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150"
      >
        <div className="p-5 flex flex-col items-center text-center gap-3">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center border shadow-lg ${
              isDanger
                ? 'bg-red-500/20 text-red-400 border-red-500/30'
                : 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'
            }`}
          >
            <AlertTriangle className="w-6 h-6" />
          </div>

          <h3 className="font-bold text-base text-gray-100">{title}</h3>
          <p className="text-xs text-gray-400 leading-relaxed">{message}</p>
        </div>

        <div className="px-5 py-3.5 bg-[#11111a] border-t border-white/10 flex items-center justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-xs font-semibold text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-xs font-semibold text-white rounded-lg shadow transition-all cursor-pointer ${
              isDanger
                ? 'bg-red-600 hover:bg-red-500 shadow-red-600/30'
                : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
