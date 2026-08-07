import React, { useState, useEffect } from 'react';
import { Image, ZoomIn, Move, X, Check, RotateCcw } from 'lucide-react';

export const PlaylistCoverCropModal = ({ isOpen, imageSrc, onSave, onClose }) => {
  const [zoom, setZoom] = useState(1.0);
  const [posX, setPosX] = useState(50); // 0% (left) to 100% (right)
  const [posY, setPosY] = useState(50); // 0% (top) to 100% (bottom)
  const [imageMeta, setImageMeta] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (isOpen && imageSrc) {
      setZoom(1.0);
      setPosX(50);
      setPosY(50);

      const img = new window.Image();
      img.onload = () => {
        setImageMeta({ width: img.naturalWidth || 600, height: img.naturalHeight || 600 });
      };
      img.src = imageSrc;
    }
  }, [isOpen, imageSrc]);

  if (!isOpen || !imageSrc) return null;

  const handleReset = () => {
    setZoom(1.0);
    setPosX(50);
    setPosY(50);
  };

  // Calculate rendering dimensions for a target 1:1 box size
  const getRenderParams = (boxSize) => {
    const imgW = imageMeta.width || boxSize;
    const imgH = imageMeta.height || boxSize;
    const aspect = imgW / imgH;

    let baseW, baseH;
    if (aspect >= 1) {
      // Landscape: height fills box, width overflows
      baseH = boxSize;
      baseW = boxSize * aspect;
    } else {
      // Portrait: width fills box, height overflows
      baseW = boxSize;
      baseH = boxSize / aspect;
    }

    const scaledW = baseW * zoom;
    const scaledH = baseH * zoom;

    // Available pan ranges (how much the image overflows the box)
    const maxPanX = Math.max(0, scaledW - boxSize);
    const maxPanY = Math.max(0, scaledH - boxSize);

    // Map posX and posY (0% .. 100%) to pan offsets (0 .. maxPan)
    // At 50%, offset centers the image.
    const left = (boxSize - scaledW) / 2 + (50 - posX) * (maxPanX / 100);
    const top = (boxSize - scaledH) / 2 + (50 - posY) * (maxPanY / 100);

    return { scaledW, scaledH, left, top, maxPanX, maxPanY };
  };

  const handleApply = () => {
    const canvas = document.createElement('canvas');
    const CANVAS_SIZE = 600;
    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;
    const ctx = canvas.getContext('2d');

    const img = new window.Image();

    const renderCanvas = () => {
      try {
        ctx.fillStyle = '#0f0f13';
        ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

        const params = getRenderParams(CANVAS_SIZE);
        ctx.drawImage(img, params.left, params.top, params.scaledW, params.scaledH);

        const croppedDataUrl = canvas.toDataURL('image/png', 0.92);
        onSave(croppedDataUrl);
        onClose();
      } catch (err) {
        console.warn('Canvas export fallback:', err);
        onSave(imageSrc);
        onClose();
      }
    };

    img.onload = renderCanvas;
    img.onerror = () => {
      onSave(imageSrc);
      onClose();
    };

    img.src = imageSrc;
    if (img.complete && img.naturalWidth) {
      renderCanvas();
    }
  };

  const PREVIEW_BOX_SIZE = 256; // 256px preview box
  const previewParams = getRenderParams(PREVIEW_BOX_SIZE);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 select-none">
      <div className="bg-[#14141f] border border-white/10 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-3.5 bg-[#1a1a29] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <Image className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="font-bold text-xs text-gray-100">Adjust Playlist Cover</h3>
              <p className="text-[10px] text-gray-400">Zoom and position your cover picture</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 1:1 Square Interactive Preview Box */}
        <div className="p-5 flex flex-col items-center gap-5">
          <div
            className="w-64 h-64 rounded-2xl overflow-hidden relative border-2 border-indigo-500/40 shadow-2xl bg-[#0b0b10]"
            style={{ width: `${PREVIEW_BOX_SIZE}px`, height: `${PREVIEW_BOX_SIZE}px` }}
          >
            <img
              src={imageSrc}
              alt=""
              className="absolute max-w-none pointer-events-none"
              style={{
                width: `${previewParams.scaledW}px`,
                height: `${previewParams.scaledH}px`,
                left: `${previewParams.left}px`,
                top: `${previewParams.top}px`,
              }}
            />

            {/* 1:1 Grid Guidelines */}
            <div className="absolute inset-0 border border-white/10 pointer-events-none grid grid-cols-3 grid-rows-3 opacity-30">
              <div className="border-r border-b border-white/20"></div>
              <div className="border-r border-b border-white/20"></div>
              <div className="border-b border-white/20"></div>
              <div className="border-r border-b border-white/20"></div>
              <div className="border-r border-b border-white/20"></div>
              <div className="border-b border-white/20"></div>
              <div className="border-r border-white/20"></div>
              <div className="border-r border-white/20"></div>
              <div></div>
            </div>
          </div>

          {/* Sliders */}
          <div className="w-full space-y-3 px-1">
            {/* Zoom Slider */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs text-gray-300">
                <span className="flex items-center gap-1 font-semibold text-[11px]">
                  <ZoomIn className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Zoom Level</span>
                </span>
                <span className="font-mono text-indigo-400 text-xs">{zoom.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min={1.0}
                max={3.0}
                step={0.05}
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-full"
                style={{
                  background: `linear-gradient(to right, #6366f1 0%, #6366f1 ${((zoom - 1) / 2) * 100}%, rgba(255, 255, 255, 0.15) ${((zoom - 1) / 2) * 100}%, rgba(255, 255, 255, 0.15) 100%)`,
                }}
              />
            </div>

            {/* Horizontal Position Slider */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs text-gray-300">
                <span className="flex items-center gap-1 font-semibold text-[11px]">
                  <Move className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Horizontal Alignment (Left - Right)</span>
                </span>
                <span className="font-mono text-indigo-400 text-xs">{posX}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={posX}
                disabled={previewParams.maxPanX <= 0}
                onChange={(e) => setPosX(parseInt(e.target.value, 10))}
                className="w-full"
                style={{
                  background: `linear-gradient(to right, #6366f1 0%, #6366f1 ${posX}%, rgba(255, 255, 255, 0.15) ${posX}%, rgba(255, 255, 255, 0.15) 100%)`,
                }}
              />
            </div>

            {/* Vertical Position Slider */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs text-gray-300">
                <span className="flex items-center gap-1 font-semibold text-[11px]">
                  <Move className="w-3.5 h-3.5 text-indigo-400 rotate-90" />
                  <span>Vertical Alignment (Top - Bottom)</span>
                </span>
                <span className="font-mono text-indigo-400 text-xs">{posY}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={posY}
                disabled={previewParams.maxPanY <= 0}
                onChange={(e) => setPosY(parseInt(e.target.value, 10))}
                className="w-full"
                style={{
                  background: `linear-gradient(to right, #6366f1 0%, #6366f1 ${posY}%, rgba(255, 255, 255, 0.15) ${posY}%, rgba(255, 255, 255, 0.15) 100%)`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-[#11111a] border-t border-white/10 flex justify-between items-center">
          <button
            onClick={handleReset}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-semibold text-gray-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Save Cover</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
