import React, { useRef, useState, useEffect } from 'react';
import {
  Pencil, Eraser, RotateCcw, Trash2, Download, Share2, Sparkles, X,
  CheckCircle2, Palette, Smile, Heart, Star, Sun
} from 'lucide-react';
import { playStarChime, playPageTurnSound } from '../utils/audio';

interface CrayonCanvasModalProps {
  isOpen: boolean;
  onClose: () => void;
  bgImageUrl?: string;
  bookTitle: string;
  pageNumber: number;
  onAwardStar?: (stars: number) => void;
}

const CRAYON_COLORS = [
  { id: 'red', name: '蠟筆紅', hex: '#FF4D4D', bgClass: 'bg-[#FF4D4D]' },
  { id: 'orange', name: '活力橘', hex: '#FF9433', bgClass: 'bg-[#FF9433]' },
  { id: 'yellow', name: '檸檬黃', hex: '#FFD700', bgClass: 'bg-[#FFD700]' },
  { id: 'green', name: '森林綠', hex: '#2ECC71', bgClass: 'bg-[#2ECC71]' },
  { id: 'cyan', name: '海洋藍', hex: '#00D2FF', bgClass: 'bg-[#00D2FF]' },
  { id: 'purple', name: '葡萄紫', hex: '#9B51E0', bgClass: 'bg-[#9B51E0]' },
  { id: 'pink', name: '草莓粉', hex: '#FF7AC6', bgClass: 'bg-[#FF7AC6]' },
  { id: 'brown', name: '大地棕', hex: '#8B5A2B', bgClass: 'bg-[#8B5A2B]' },
  { id: 'black', name: '夜空黑', hex: '#2C3E50', bgClass: 'bg-[#2C3E50]' },
  { id: 'white', name: '牛奶白', hex: '#FFFFFF', bgClass: 'bg-white' },
];

const BRUSH_SIZES = [
  { size: 4, name: '細緻' },
  { size: 10, name: '標準' },
  { size: 20, name: '塗色' },
  { size: 36, name: '大蠟筆' },
];

const STAMPS = ['⭐', '❤️', '🌸', '🐾', '👑', '🌈', '🦉', '✨'];

export const CrayonCanvasModal: React.FC<CrayonCanvasModalProps> = ({
  isOpen,
  onClose,
  bgImageUrl,
  bookTitle,
  pageNumber,
  onAwardStar
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentColor, setCurrentColor] = useState(CRAYON_COLORS[0].hex);
  const [brushSize, setBrushSize] = useState(10);
  const [isEraser, setIsEraser] = useState(false);
  const [activeStamp, setActiveStamp] = useState<string | null>(null);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [sharedSuccess, setSharedSuccess] = useState(false);

  // Canvas Initialization
  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    canvas.width = 800;
    canvas.height = 550;

    // Load background image if available
    if (bgImageUrl) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = bgImageUrl;
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Draw background with slight opacity/tint so crayons pop
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        saveState();
      };
      img.onerror = () => {
        fillDefaultBackground(ctx, canvas);
        saveState();
      };
    } else {
      fillDefaultBackground(ctx, canvas);
      saveState();
    }
  }, [isOpen, bgImageUrl]);

  const fillDefaultBackground = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    ctx.fillStyle = '#FFFDF5';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw subtle sketch paper texture grid
    ctx.strokeStyle = 'rgba(217, 217, 217, 0.25)';
    ctx.lineWidth = 1;
    for (let i = 0; i < canvas.width; i += 40) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
      ctx.stroke();
    }
    for (let j = 0; j < canvas.height; j += 40) {
      ctx.beginPath();
      ctx.moveTo(0, j);
      ctx.lineTo(canvas.width, j);
      ctx.stroke();
    }
  };

  const saveState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory((prev) => [...prev.slice(-15), data]);
  };

  const handleUndo = () => {
    if (history.length <= 1) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const newHistory = [...history];
    newHistory.pop(); // remove current state
    const previousState = newHistory[newHistory.length - 1];
    if (previousState) {
      ctx.putImageData(previousState, 0, 0);
      setHistory(newHistory);
      playPageTurnSound();
    }
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (bgImageUrl) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = bgImageUrl;
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        saveState();
      };
    } else {
      fillDefaultBackground(ctx, canvas);
      saveState();
    }
  };

  // Canvas Mouse / Touch Events
  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ('touches' in e) {
      const touch = e.touches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      };
    } else {
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const { x, y } = getCoordinates(e);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (activeStamp) {
      // Stamp Placement
      ctx.font = `${brushSize * 2.2}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(activeStamp, x, y);
      saveState();
      playStarChime();
      return;
    }

    setIsDrawing(true);
    ctx.beginPath();
    ctx.moveTo(x, y);

    // Crayon stroke styling setup
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = brushSize;

    if (isEraser) {
      ctx.globalCompositeOperation = 'destination-out';
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = currentColor;
      ctx.shadowColor = currentColor;
      ctx.shadowBlur = 1; // Gives subtle crayon texture blur
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || activeStamp) return;
    const { x, y } = getCoordinates(e);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveState();
    }
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `${bookTitle}_第${pageNumber}頁_蠟筆塗鴉.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    playStarChime();
  };

  const handleShareToSocialWall = () => {
    if (onAwardStar) {
      onAwardStar(5);
    }
    playStarChime();
    setSharedSuccess(true);
    setTimeout(() => {
      setSharedSuccess(false);
    }, 3000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-fadeIn">
      <div className="bg-slate-900 border-2 border-amber-400/60 rounded-3xl max-w-4xl w-full p-4 sm:p-6 text-white shadow-2xl relative space-y-4 max-h-[95vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-amber-400/30 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl animate-bounce">🖍️</span>
            <div>
              <h3 className="text-lg font-black text-amber-300">童心數位蠟筆畫布</h3>
              <p className="text-xs text-slate-300">正在標記：《{bookTitle}》第 {pageNumber} 頁</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleUndo}
              disabled={history.length <= 1}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1 border border-slate-700 disabled:opacity-40 cursor-pointer"
              title="撤銷上一步"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>撤銷</span>
            </button>

            <button
              type="button"
              onClick={handleClear}
              className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-bold flex items-center gap-1 border border-rose-500/40 cursor-pointer"
              title="清空重新繪畫"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>重畫</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Toolbar & Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-800/80 p-3 rounded-2xl border border-white/10">
          
          {/* Color Palette */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold text-amber-200 mr-1 flex items-center gap-1">
              <Palette className="w-3.5 h-3.5" />
              蠟筆顏色:
            </span>
            {CRAYON_COLORS.map((c) => (
              <button
                type="button"
                key={c.id}
                onClick={() => {
                  setCurrentColor(c.hex);
                  setIsEraser(false);
                  setActiveStamp(null);
                  playPageTurnSound();
                }}
                className={`w-7 h-7 rounded-full border-2 transition-transform ${c.bgClass} ${
                  currentColor === c.hex && !isEraser && !activeStamp
                    ? 'border-white scale-125 shadow-lg ring-2 ring-amber-400'
                    : 'border-slate-600 hover:scale-110'
                }`}
                title={c.name}
              />
            ))}

            {/* Eraser Button */}
            <button
              type="button"
              onClick={() => {
                setIsEraser(true);
                setActiveStamp(null);
                playPageTurnSound();
              }}
              className={`px-3 py-1 rounded-xl text-xs font-extrabold flex items-center gap-1 border transition-all ${
                isEraser
                  ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md scale-105'
                  : 'bg-slate-700 text-slate-200 border-slate-600 hover:bg-slate-600'
              }`}
            >
              <Eraser className="w-3.5 h-3.5" />
              <span>橡皮擦</span>
            </button>
          </div>

          {/* Brush Sizes */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-amber-200">筆觸大小:</span>
            <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-700 gap-1">
              {BRUSH_SIZES.map((b) => (
                <button
                  type="button"
                  key={b.size}
                  onClick={() => {
                    setBrushSize(b.size);
                    playPageTurnSound();
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                    brushSize === b.size
                      ? 'bg-amber-400 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {b.name}
                </button>
              ))}
            </div>
          </div>

          {/* Cute Stamps / Stickers */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-amber-200">圖章印章:</span>
            {STAMPS.map((stamp) => (
              <button
                type="button"
                key={stamp}
                onClick={() => {
                  if (activeStamp === stamp) {
                    setActiveStamp(null);
                  } else {
                    setActiveStamp(stamp);
                    setIsEraser(false);
                    playPageTurnSound();
                  }
                }}
                className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center transition-transform ${
                  activeStamp === stamp
                    ? 'bg-amber-400 text-slate-950 scale-125 shadow-md font-black'
                    : 'bg-slate-700/80 hover:bg-slate-600 text-slate-200'
                }`}
                title={`點擊印章：${stamp}`}
              >
                {stamp}
              </button>
            ))}
          </div>
        </div>

        {/* Canvas Display Container */}
        <div className="relative rounded-2xl overflow-hidden border-2 border-amber-400/40 bg-slate-950 flex justify-center items-center shadow-inner touch-none">
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="cursor-crosshair max-w-full h-auto object-contain"
          />

          {/* Active Tool Helper Badge */}
          <div className="absolute top-3 left-3 bg-slate-900/90 text-amber-300 border border-amber-400/30 px-3 py-1 rounded-full text-xs font-extrabold backdrop-blur-md pointer-events-none flex items-center gap-1.5 shadow-md">
            {activeStamp ? (
              <>
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>使用印章模式: {activeStamp} (點擊畫布蓋章)</span>
              </>
            ) : isEraser ? (
              <>
                <Eraser className="w-3.5 h-3.5 text-rose-400" />
                <span>橡皮擦模式</span>
              </>
            ) : (
              <>
                <Pencil className="w-3.5 h-3.5" style={{ color: currentColor }} />
                <span>蠟筆塗鴉模式</span>
              </>
            )}
          </div>
        </div>

        {/* Action Footer Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          {sharedSuccess ? (
            <div className="text-xs font-extrabold text-emerald-300 bg-emerald-500/20 px-4 py-2 rounded-2xl border border-emerald-400 flex items-center gap-1.5 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>成功將蠟筆塗鴉發表至童心社交牆！獲得 +5 顆童心星星！</span>
            </div>
          ) : (
            <div className="text-xs text-slate-300 font-bold flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>揮灑創意，畫完後可以儲存作品或展示在社交牆上喔！</span>
            </div>
          )}

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleShareToSocialWall}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-black text-xs shadow-md flex items-center gap-1.5 transition-transform hover:scale-105 cursor-pointer"
            >
              <Share2 className="w-4 h-4 text-purple-200" />
              <span>發表到社交牆 (+5星)</span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-slate-950 font-black text-xs shadow-md flex items-center gap-1.5 transition-transform hover:scale-105 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>儲存圖片</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
