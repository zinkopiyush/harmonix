import React, { useEffect, useRef, useState } from 'react';
import { useAudio } from '../context/AudioContext';
import { Activity, Sparkles, Disc, Radio } from 'lucide-react';

export const VisualizerView = () => {
  const { analyserNodeRef, currentTrack, isPlaying } = useAudio();
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);

  const [mode, setMode] = useState('circular'); // 'spectrum' | 'waveform' | 'circular' | 'pulsar'

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = (canvas.width = canvas.parentElement?.clientWidth || 800);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 450);

    const handleResize = () => {
      if (canvas.parentElement) {
        width = canvas.width = canvas.parentElement.clientWidth;
        height = canvas.height = canvas.parentElement.clientHeight;
      }
    };
    window.addEventListener('resize', handleResize);

    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw);

      ctx.fillStyle = '#0f0f13';
      ctx.fillRect(0, 0, width, height);

      const analyser = analyserNodeRef.current;
      if (!analyser || !isPlaying) {
        // Idle ambient animation
        ctx.fillStyle = 'rgba(99, 102, 241, 0.15)';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Play audio to see live visualizer animation', width / 2, height / 2);
        return;
      }

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      if (mode === 'waveform') {
        analyser.getByteTimeDomainData(dataArray);
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#6366f1';
        ctx.beginPath();

        const sliceWidth = (width * 1.0) / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 128.0;
          const y = (v * height) / 2;

          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);

          x += sliceWidth;
        }

        ctx.lineTo(width, height / 2);
        ctx.stroke();
      } else if (mode === 'circular') {
        analyser.getByteFrequencyData(dataArray);
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) / 4;
        const numBars = 64;

        for (let i = 0; i < numBars; i++) {
          const value = dataArray[i * 2] || 0;
          const barHeight = (value / 255) * (radius * 0.9);
          const angle = (i * 2 * Math.PI) / numBars;

          const x1 = centerX + Math.cos(angle) * radius;
          const y1 = centerY + Math.sin(angle) * radius;
          const x2 = centerX + Math.cos(angle) * (radius + barHeight);
          const y2 = centerY + Math.sin(angle) * (radius + barHeight);

          const hue = (i / numBars) * 360;
          ctx.strokeStyle = `hsl(${hue}, 85%, 60%)`;
          ctx.lineWidth = 4;
          ctx.lineCap = 'round';

          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }
      } else if (mode === 'pulsar') {
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b, 0) / bufferLength;
        const pulseRadius = (average / 255) * (Math.min(width, height) / 3) + 40;

        const grad = ctx.createRadialGradient(
          width / 2,
          height / 2,
          10,
          width / 2,
          height / 2,
          pulseRadius + 60
        );
        grad.addColorStop(0, 'rgba(99, 102, 241, 0.9)');
        grad.addColorStop(0.5, 'rgba(168, 85, 247, 0.5)');
        grad.addColorStop(1, 'rgba(236, 72, 153, 0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(width / 2, height / 2, pulseRadius + 60, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Spectrum Bars
        analyser.getByteFrequencyData(dataArray);
        const barWidth = (width / bufferLength) * 2.5;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * height * 0.85;

          const grad = ctx.createLinearGradient(0, height, 0, height - barHeight);
          grad.addColorStop(0, '#6366f1');
          grad.addColorStop(0.5, '#a855f7');
          grad.addColorStop(1, '#ec4899');

          ctx.fillStyle = grad;
          ctx.fillRect(x, height - barHeight, barWidth - 1, barHeight);

          x += barWidth;
        }
      }
    };

    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [analyserNodeRef, isPlaying, mode]);

  return (
    <div className="w-full h-full flex flex-col relative overflow-hidden bg-[#0f0f13]">
      {/* Modes Controls Bar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between bg-black/40 backdrop-blur-md p-3 rounded-2xl border border-white/10">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-indigo-400" />
          <span className="font-bold text-sm text-gray-100">Audio Visualizer</span>
          {currentTrack && (
            <span className="text-xs text-gray-400 truncate max-w-xs font-mono ml-2">
              {currentTrack.title}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 bg-white/10 p-1 rounded-xl">
          {[
            { id: 'spectrum', label: 'Spectrum', icon: Activity },
            { id: 'waveform', label: 'Waveform', icon: Radio },
            { id: 'circular', label: 'Circular', icon: Disc },
            { id: 'pulsar', label: 'Glow Pulsar', icon: Sparkles },
          ].map((m) => {
            const Icon = m.icon;
            return (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  mode === m.id
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{m.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Full-bleed Canvas */}
      <div className="flex-1 w-full h-full relative">
        <canvas ref={canvasRef} className="w-full h-full block" />
      </div>
    </div>
  );
};
