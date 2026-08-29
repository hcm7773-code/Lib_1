import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Palette, Wand2, X, CheckCircle2, RotateCcw, Image as ImageIcon, Download, RefreshCw } from 'lucide-react';
import { playStarChime } from '../utils/audio';

export type ArtStyleOption = 'watercolor' | 'crayon' | 'pixel';

interface ArtStyleConverterModalProps {
  isOpen: boolean;
  onClose: () => void;
  illustrationUrl: string;
  pageNumber?: number;
  onApplyStyle: (styledImageUrl: string, styleType: ArtStyleOption) => void;
  darkMode?: boolean;
}

export const ArtStyleConverterModal: React.FC<ArtStyleConverterModalProps> = ({
  isOpen,
  onClose,
  illustrationUrl,
  pageNumber = 1,
  onApplyStyle,
  darkMode = false,
}) => {
  const [selectedStyle, setSelectedStyle] = useState<ArtStyleOption>('watercolor');
  const [pixelSize, setPixelSize] = useState<number>(12); // Pixel size for pixel art (8-24)
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processedImageUrl, setProcessedImageUrl] = useState<string>('');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const styleOptions = [
    {
      id: 'watercolor' as ArtStyleOption,
      title: '🎨 溫馨水彩畫風',
      badge: 'Watercolor',
      desc: '柔和渲染的水彩暈染感，帶有優雅溫馨的夢幻插畫質感',
      color: 'from-blue-500 to-indigo-600',
    },
    {
      id: 'crayon' as ArtStyleOption,
      title: '🖍️ 趣味蠟筆畫風',
      badge: 'Crayon',
      desc: '質樸厚實的童趣蠟筆筆觸與紙張紋理，呈現最純真的兒童畫作',
      color: 'from-amber-500 to-orange-600',
    },
    {
      id: 'pixel' as ArtStyleOption,
      title: '👾 點陣像素畫風',
      badge: 'Pixel Art',
      desc: '懷舊復古 8-Bit 點陣藝術，將繪本畫面一鍵轉換為像素電玩世界',
      color: 'from-purple-600 to-pink-600',
    },
  ];

  // Canvas style processing engine
  useEffect(() => {
    if (!isOpen || !illustrationUrl) return;

    setIsProcessing(true);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = illustrationUrl;

    img.onload = () => {
      const canvas = canvasRef.current || document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = 600;
      const height = 400;
      canvas.width = width;
      canvas.height = height;

      if (selectedStyle === 'pixel') {
        // Pixel Art Algorithm: Scale down then scale back up without smoothing
        const scaledW = Math.max(8, Math.floor(width / pixelSize));
        const scaledH = Math.max(8, Math.floor(height / pixelSize));

        const offCanvas = document.createElement('canvas');
        offCanvas.width = scaledW;
        offCanvas.height = scaledH;
        const offCtx = offCanvas.getContext('2d');

        if (offCtx) {
          offCtx.imageSmoothingEnabled = false;
          offCtx.drawImage(img, 0, 0, scaledW, scaledH);

          // Draw back scaled up without smoothing
          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(offCanvas, 0, 0, scaledW, scaledH, 0, 0, width, height);

          // Add subtle pixel grid texture
          ctx.strokeStyle = 'rgba(0,0,0,0.06)';
          ctx.lineWidth = 1;
          for (let x = 0; x < width; x += pixelSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
          }
          for (let y = 0; y < height; y += pixelSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
          }
        }
      } else if (selectedStyle === 'watercolor') {
        // Watercolor Wash effect using layered canvas filters & blur overlays
        ctx.filter = 'saturate(140%) contrast(105%) brightness(105%)';
        ctx.drawImage(img, 0, 0, width, height);

        // Soft watercolor wash overlay
        const washCanvas = document.createElement('canvas');
        washCanvas.width = width;
        washCanvas.height = height;
        const washCtx = washCanvas.getContext('2d');
        if (washCtx) {
          washCtx.filter = 'blur(6px) saturate(160%)';
          washCtx.drawImage(img, 0, 0, width, height);
          ctx.globalAlpha = 0.35;
          ctx.globalCompositeOperation = 'soft-light';
          ctx.drawImage(washCanvas, 0, 0);
          ctx.globalAlpha = 1.0;
          ctx.globalCompositeOperation = 'source-over';
        }

        // Vignette watercolor frame
        const grad = ctx.createRadialGradient(width / 2, height / 2, width / 4, width / 2, height / 2, width / 1.4);
        grad.addColorStop(0, 'rgba(255,255,255,0)');
        grad.addColorStop(1, 'rgba(245, 230, 210, 0.35)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
      } else if (selectedStyle === 'crayon') {
        // Crayon / Pastel Texture effect
        ctx.filter = 'saturate(170%) contrast(130%) brightness(95%)';
        ctx.drawImage(img, 0, 0, width, height);

        // Crayon grain overlay
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
          const grain = (Math.random() - 0.5) * 35;
          data[i] = Math.min(255, Math.max(0, data[i] + grain));
          data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + grain));
          data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + grain));
        }
        ctx.putImageData(imageData, 0, 0);
      }

      setProcessedImageUrl(canvas.toDataURL('image/png'));
      setIsProcessing(false);
    };

    img.onerror = () => {
      // Fallback
      setProcessedImageUrl(illustrationUrl);
      setIsProcessing(false);
    };
  }, [isOpen, illustrationUrl, selectedStyle, pixelSize]);

  if (!isOpen) return null;

  const handleApply = () => {
    if (processedImageUrl) {
      playStarChime();
      onApplyStyle(processedImageUrl, selectedStyle);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div
        className={`relative w-full max-w-3xl rounded-3xl p-5 sm:p-7 shadow-2xl border-4 transition-all animate-scaleUp z-10 my-auto ${
          darkMode
            ? 'bg-slate-900 border-purple-500/80 text-slate-100'
            : 'bg-gradient-to-b from-purple-50 via-pink-50/50 to-amber-50 border-purple-300 text-purple-950'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-2 rounded-full transition-colors z-20 ${
            darkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-purple-200 text-purple-800'
          }`}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-purple-200/80 pb-4 mb-5">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-md">
            <Palette className="w-6 h-6 animate-bounce" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-purple-200 dark:bg-purple-950 text-purple-900 dark:text-purple-300 font-extrabold text-[11px] mb-0.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>AI 藝術畫風轉換引擎</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-purple-950 dark:text-purple-200">
              第 {pageNumber} 頁一鍵轉換藝術畫風
            </h2>
          </div>
        </div>

        {/* Style Selection Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
          {styleOptions.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setSelectedStyle(opt.id)}
              className={`p-3.5 rounded-2xl border-2 text-left transition-all relative overflow-hidden ${
                selectedStyle === opt.id
                  ? 'bg-white dark:bg-slate-800 border-purple-500 shadow-lg scale-[1.02]'
                  : 'bg-white/60 dark:bg-slate-800/60 border-purple-200 dark:border-purple-800 hover:border-purple-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-black text-sm text-purple-950 dark:text-purple-100">{opt.title}</span>
                {selectedStyle === opt.id && (
                  <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                )}
              </div>
              <p className="text-[11px] font-medium text-slate-600 dark:text-slate-300 leading-tight">
                {opt.desc}
              </p>
            </button>
          ))}
        </div>

        {/* Pixel Size Slider (if pixel style selected) */}
        {selectedStyle === 'pixel' && (
          <div className="p-3 bg-purple-100/70 dark:bg-slate-800/80 rounded-2xl border border-purple-200 mb-4 flex items-center justify-between gap-4">
            <span className="text-xs font-black text-purple-900 dark:text-purple-300 flex items-center gap-1.5 shrink-0">
              <span>👾 像素顆粒大小：</span>
              <span className="text-amber-600 font-extrabold">{pixelSize}px</span>
            </span>
            <input
              type="range"
              min={6}
              max={24}
              step={2}
              value={pixelSize}
              onChange={(e) => setPixelSize(parseInt(e.target.value))}
              className="w-full h-2 accent-purple-600 cursor-pointer"
            />
          </div>
        )}

        {/* Hidden Processing Canvas */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Side-by-Side Live Preview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white/80 dark:bg-slate-800/80 p-4 rounded-2xl border border-purple-200 dark:border-purple-800 mb-6">
          {/* Original */}
          <div className="space-y-1.5 text-center">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">🖼️ 原始繪本插圖</span>
            <div className="aspect-[4/3] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 shadow-inner flex items-center justify-center">
              <img src={illustrationUrl} alt="Original" className="w-full h-full object-cover" />
            </div>
          </div>

          {/* Processed Style */}
          <div className="space-y-1.5 text-center relative">
            <span className="text-xs font-black text-purple-600 dark:text-purple-400 flex items-center justify-center gap-1">
              <Wand2 className="w-3.5 h-3.5 text-amber-500" />
              <span>轉換後：{styleOptions.find((s) => s.id === selectedStyle)?.title}</span>
            </span>

            <div className="aspect-[4/3] rounded-xl overflow-hidden border-2 border-purple-400 dark:border-purple-600 bg-purple-950/10 shadow-lg flex items-center justify-center relative">
              {isProcessing ? (
                <div className="flex flex-col items-center gap-2 text-purple-600">
                  <RefreshCw className="w-8 h-8 animate-spin" />
                  <span className="text-xs font-black">AI 藝術運算中...</span>
                </div>
              ) : (
                <img src={processedImageUrl} alt="Processed" className="w-full h-full object-cover animate-fadeIn" />
              )}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-2xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-800 dark:text-slate-200 font-extrabold text-xs sm:text-sm"
          >
            取消
          </button>

          <button
            type="button"
            onClick={handleApply}
            disabled={isProcessing || !processedImageUrl}
            className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:from-purple-700 hover:to-amber-600 text-white font-black text-xs sm:text-sm shadow-xl flex items-center gap-2 transform hover:scale-105 transition-all disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>套用此藝術畫風至繪本</span>
          </button>
        </div>
      </div>
    </div>
  );
};
