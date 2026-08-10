import React from 'react';
import { useAudio, EQ_FREQUENCIES, EQ_PRESETS } from '../context/AudioContext';
import { Sliders, Power, RotateCcw, X, Check } from 'lucide-react';

export const EqualizerModal = () => {
  const {
    isEqEnabled,
    eqPreset,
    eqGains,
    preampGain,
    applyPreset,
    changeEqGain,
    changePreamp,
    toggleEqEnabled,
    isEqModalOpen,
    setIsEqModalOpen,
  } = useAudio();

  if (!isEqModalOpen) return null;

  return (
    <div
      onClick={() => setIsEqModalOpen(false)}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200 select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#12121e] border border-white/15 rounded-3xl w-full max-w-2xl shadow-2xl p-6 sm:p-8 space-y-6 relative overflow-hidden"
      >
        {/* Ambient Glow */}
        <div className="absolute -top-20 -left-20 w-60 h-60 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>

        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white tracking-tight">
                10-Band Graphic Equalizer
              </h3>
              <p className="text-xs text-gray-400">
                High-fidelity Web Audio API Processing
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleEqEnabled}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all shadow-md cursor-pointer ${
                isEqEnabled
                  ? 'bg-indigo-600 text-white shadow-indigo-600/30'
                  : 'bg-white/10 text-gray-400 hover:text-white'
              }`}
            >
              <Power className="w-3.5 h-3.5" />
              <span>{isEqEnabled ? 'EQ On' : 'EQ Bypass'}</span>
            </button>

            <button
              onClick={() => setIsEqModalOpen(false)}
              className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Presets Grid */}
        <div className="space-y-2 relative z-10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">
              Genre Presets
            </span>
            <button
              onClick={() => applyPreset('Flat')}
              className="text-[11px] text-gray-400 hover:text-indigo-400 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Flat</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {Object.keys(EQ_PRESETS).map((name) => (
              <button
                key={name}
                onClick={() => applyPreset(name)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  eqPreset === name
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 scale-105'
                    : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white border border-white/5'
                }`}
              >
                {eqPreset === name && <Check className="w-3.5 h-3.5" />}
                <span>{name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Preamp Control */}
        <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center justify-between gap-4 relative z-10">
          <span className="text-xs font-bold text-gray-300">Preamp Gain</span>
          <div className="flex-1 flex items-center gap-3">
            <input
              type="range"
              min={-12}
              max={12}
              step={0.5}
              value={preampGain}
              onChange={(e) => changePreamp(parseFloat(e.target.value))}
              className="flex-1 cursor-pointer"
            />
            <span className="text-xs font-mono text-indigo-300 w-12 text-right">
              {preampGain > 0 ? `+${preampGain}` : preampGain} dB
            </span>
          </div>
        </div>

        {/* 10-Band Faders */}
        <div className="bg-white/5 border border-white/5 rounded-2xl p-5 relative z-10">
          <div className="grid grid-cols-10 gap-2 items-center text-center">
            {EQ_FREQUENCIES.map((freq, index) => {
              const gain = eqGains[index] || 0;
              const formattedFreq = freq >= 1000 ? `${freq / 1000}K` : freq;
              return (
                <div key={freq} className="flex flex-col items-center gap-2">
                  <span className="text-[10px] font-mono text-indigo-300 font-bold">
                    {gain > 0 ? `+${gain}` : gain}
                  </span>

                  <div className="h-44 flex items-center justify-center py-2">
                    <input
                      type="range"
                      min={-12}
                      max={12}
                      step={0.5}
                      value={gain}
                      onChange={(e) => changeEqGain(index, parseFloat(e.target.value))}
                      className="accent-indigo-500 cursor-pointer w-[140px] -rotate-90"
                    />
                  </div>

                  <span className="text-[10px] font-mono text-gray-400 font-medium">
                    {formattedFreq}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs text-gray-400 relative z-10">
          <span>Range: -12 dB to +12 dB</span>
          <button
            onClick={() => setIsEqModalOpen(false)}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
