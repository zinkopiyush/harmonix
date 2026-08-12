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
      className="fixed inset-0 z-50 bg-bg-primary/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200 select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-bg-secondary border border-border-primary rounded-3xl w-full max-w-2xl shadow-2xl p-6 sm:p-8 space-y-6 relative overflow-hidden"
      >
        {/* Ambient Glow */}
        <div className="absolute -top-20 -left-20 w-60 h-60 bg-accent/20 rounded-full blur-3xl pointer-events-none"></div>

        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-primary pb-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-accent/20 border border-accent/30 flex items-center justify-center text-accent">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-text-primary tracking-tight">
                10-Band Graphic Equalizer
              </h3>
              <p className="text-xs text-text-muted">
                High-fidelity Web Audio API Processing
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleEqEnabled}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all shadow-md cursor-pointer ${
                isEqEnabled
                  ? 'bg-accent text-white shadow-black/20'
                  : 'bg-white/10 text-text-muted hover:text-text-primary'
              }`}
            >
              <Power className="w-3.5 h-3.5" />
              <span>{isEqEnabled ? 'EQ On' : 'EQ Bypass'}</span>
            </button>

            <button
              onClick={() => setIsEqModalOpen(false)}
              className="p-2 text-text-muted hover:text-text-primary rounded-xl hover:bg-bg-hover transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Presets Grid */}
        <div className="space-y-2 relative z-10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider">
              Genre Presets
            </span>
            <button
              onClick={() => applyPreset('Flat')}
              className="text-[11px] text-text-muted hover:text-accent flex items-center gap-1 cursor-pointer transition-colors"
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
                    ? 'bg-accent text-white shadow-lg shadow-black/20 scale-105'
                    : 'bg-bg-tertiary text-text-muted hover:bg-bg-hover hover:text-text-primary border border-border-primary'
                }`}
              >
                {eqPreset === name && <Check className="w-3.5 h-3.5" />}
                <span>{name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Preamp Control */}
        <div className="bg-bg-tertiary border border-border-primary rounded-2xl p-4 flex items-center justify-between gap-4 relative z-10">
          <span className="text-xs font-bold text-text-primary">Preamp Gain</span>
          <div className="flex-1 flex items-center gap-3">
            <input
              type="range"
              min={-12}
              max={12}
              step={0.5}
              value={preampGain}
              onChange={(e) => changePreamp(parseFloat(e.target.value))}
              className="flex-1 custom-slider cursor-pointer"
              style={{
                background: `linear-gradient(to right, var(--accent) 0%, var(--accent) ${((preampGain + 12) / 24) * 100}%, var(--border-secondary) ${((preampGain + 12) / 24) * 100}%, var(--border-secondary) 100%)`
              }}
            />
            <span className="text-xs font-mono text-accent w-12 text-right">
              {preampGain > 0 ? `+${preampGain}` : preampGain} dB
            </span>
          </div>
        </div>

        {/* 10-Band Faders */}
        <div className="bg-bg-tertiary border border-border-primary rounded-2xl p-5 relative z-10">
          <div className="grid grid-cols-10 gap-2 items-center text-center">
            {EQ_FREQUENCIES.map((freq, index) => {
              const gain = eqGains[index] || 0;
              const formattedFreq = freq >= 1000 ? `${freq / 1000}K` : freq;
              return (
                <div key={freq} className="flex flex-col items-center gap-2">
                  <span className="text-[10px] font-mono text-accent font-bold">
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
                      className="custom-slider cursor-pointer w-[140px] -rotate-90"
                      style={{
                        background: `linear-gradient(to right, var(--accent) 0%, var(--accent) ${((gain + 12) / 24) * 100}%, var(--border-secondary) ${((gain + 12) / 24) * 100}%, var(--border-secondary) 100%)`
                      }}
                    />
                  </div>

                  <span className="text-[10px] font-mono text-text-muted font-medium">
                    {formattedFreq}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-border-primary text-xs text-text-muted relative z-10">
          <span>Range: -12 dB to +12 dB</span>
          <button
            onClick={() => setIsEqModalOpen(false)}
            className="px-5 py-2 bg-accent hover:bg-accent-hover text-white font-bold rounded-xl shadow-lg shadow-black/20 transition-all cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
