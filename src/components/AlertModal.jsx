import React from 'react';
import { Info, CheckCircle2, AlertCircle } from 'lucide-react';

export const AlertModal = ({ isOpen, title, message, type = 'info', onClose }) => {
  if (!isOpen) return null;

  const typeConfig = {
    info: {
      icon: <Info className="w-6 h-6" />,
      colorClass: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
      btnClass: 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30'
    },
    success: {
      icon: <CheckCircle2 className="w-6 h-6" />,
      colorClass: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      btnClass: 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
    },
    error: {
      icon: <AlertCircle className="w-6 h-6" />,
      colorClass: 'bg-red-500/20 text-red-400 border-red-500/30',
      btnClass: 'bg-red-600 hover:bg-red-500 shadow-red-600/30'
    }
  };

  const config = typeConfig[type] || typeConfig.info;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 select-none animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#14141f] border border-white/10 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150"
      >
        <div className="p-5 flex flex-col items-center text-center gap-3">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center border shadow-lg ${config.colorClass}`}>
            {config.icon}
          </div>

          <h3 className="font-bold text-base text-gray-100">{title}</h3>
          <p className="text-xs text-gray-400 leading-relaxed">{message}</p>
        </div>

        <div className="px-5 py-3.5 bg-[#11111a] border-t border-white/10 flex items-center justify-center">
          <button
            onClick={onClose}
            className={`w-full px-4 py-2.5 text-xs font-bold text-white rounded-lg shadow-lg transition-all cursor-pointer ${config.btnClass}`}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};
