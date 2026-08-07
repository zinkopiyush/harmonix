import React from 'react';
import { useAudio, EQ_FREQUENCIES, EQ_PRESETS } from '../context/AudioContext';
import { Sliders, X, RotateCcw, Power } from 'lucide-react';

export const EqualizerModal = () => {
  const {
    isEqModalOpen,
    setIsEqModalOpen,
    isEqEnabled,
    eqPreset,
    eqGains,
    preampGain,
    applyPreset,
    changeEqGain,
    changePreamp,
    toggleEqEnabled,
  } = useAudio();

  if (!isEqModalOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-[#14141f] border border-white/10 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-[#1a1a29] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-gray-100">10-Band Graphic Equalizer</h3>
              <p className="text-[10px] text-gray-400">High-fidelity Web Audio API Processing</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Enable/Disable Toggle */}
            <button
              onClick={toggleEqEnabled}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                isEqEnabled
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-white/10 text-gray-400'
              }`}
            >
              <Power className="w-3.5 h-3.5" />
              <span>{isEqEnabled ? 'EQ On' : 'EQ Bypass'}</span>
            </button>

            <button
              onClick={() => setIsEqModalOpen(false)}
              className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-6">
          {/* Preset Selector & Preamp Slider */}
          <div className="flex items-center justify-between gap-6 pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-gray-300">Preset:</span>
              <select
                value={eqPreset}
                onChange={(e) => applyPreset(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-indigo-500"
              >
                {Object.keys(EQ_PRESETS).map((preset) => (
                  <option key={preset} value={preset} className="bg-[#161622] text-gray-200">
                    {preset}
                  </option>
                ))}
                <option value="Custom" disabled className="bg-[#161622] text-gray-400">
                  Custom
                </option>
              </select>

              <button
                onClick={() => applyPreset('Flat')}
                title="Reset Equalizer"
                className="p-1.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-md"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Preamp Gain */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-gray-300">Preamp:</span>
              <input
                type="range"
                min={-12}
                max={12}
                step={0.5}
                value={preampGain}
                onChange={(e) => changePreamp(parseFloat(e.target.value))}
                className="w-28"
              />
              <span className="text-xs font-mono text-indigo-400 w-10 text-right">
                {preampGain > 0 ? `+${preampGain}` : preampGain} dB
              </span>
            </div>
          </div>

          {/* 10 Vertical Band Sliders */}
          <div className="grid grid-cols-10 gap-2 items-center text-center pt-2">
            {EQ_FREQUENCIES.map((freq, index) => {
              const gainVal = eqGains[index] || 0;
              const formattedFreq = freq >= 1000 ? `${freq / 1000}k` : `${freq}`;

              return (
                <div key={freq} className="flex flex-col items-center gap-2">
                  <span className="text-[10px] font-mono text-indigo-300 h-4">
                    {gainVal > 0 ? `+${gainVal}` : gainVal}
                  </span>

                  <div className="h-44 flex items-center justify-center py-2 relative">
                    {/* Background line */}
                    <div className="absolute inset-y-0 w-1 bg-white/10 rounded-full pointer-events-none"></div>

                    <input
                      type="range"
                      min={-12}
                      max={12}
                      step={0.5}
                      value={gainVal}
                      disabled={!isEqEnabled}
                      onChange={(e) => changeEqGain(index, parseFloat(e.target.value))}
                      className="vertical-slider relative z-10"
                    />
                  </div>

                  <span className="text-[11px] font-bold text-gray-400 uppercase font-mono">
                    {formattedFreq}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#11111a] border-t border-white/10 flex justify-between items-center text-[11px] text-gray-500">
          <span>Range: -12 dB to +12 dB</span>
          <button
            onClick={() => setIsEqModalOpen(false)}
            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg shadow transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
