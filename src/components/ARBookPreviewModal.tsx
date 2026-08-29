import React, { useState, useEffect, useRef } from 'react';
import {
  X, Camera, RotateCw, Sparkles, Volume2, Eye, Sun, Layers,
  Compass, ShieldCheck, Check, Star, RefreshCw, Box, Maximize2, Zap
} from 'lucide-react';
import { Book } from '../types';
import { playStarChime, playPageTurnSound, speakText } from '../utils/audio';

interface ARBookPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: Book;
  onAwardStar?: (amount: number) => void;
  darkMode?: boolean;
}

export const ARBookPreviewModal: React.FC<ARBookPreviewModalProps> = ({
  isOpen,
  onClose,
  book,
  onAwardStar,
  darkMode = false,
}) => {
  const [arMode, setArMode] = useState<'3d-book' | 'camera-ar' | 'character-popup'>('3d-book');
  const [rotationY, setRotationY] = useState(0);
  const [rotationX, setRotationX] = useState(15);
  const [selectedPageIndex, setSelectedPageIndex] = useState(0);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isSnapshotTaken, setIsSnapshotTaken] = useState(false);
  const [arParticles, setArParticles] = useState<Array<{ id: number; x: number; y: number; size: number; emoji: string }>>([]);
  const [interactivePopups, setInteractivePopups] = useState<string[]>(['🦊 主角登場', '⭐ 魔法魔法星光', '🏰 經典古堡', '🌸 精靈之花']);
  const [activePopupIndex, setActivePopupIndex] = useState<number | null>(0);

  // Auto Rotation Loop in 3D Mode
  useEffect(() => {
    let animationFrameId: number;
    if (isOpen && arMode === '3d-book') {
      const animate = () => {
        setRotationY((prev) => (prev + 0.4) % 360);
        animationFrameId = requestAnimationFrame(animate);
      };
      animationFrameId = requestAnimationFrame(animate);
    }
    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [isOpen, arMode]);

  // Generate AR Particles
  useEffect(() => {
    if (isOpen) {
      const emojis = ['✨', '⭐', '🌸', '💫', '🎈', '🦋', '🌟'];
      const particles = Array.from({ length: 16 }).map((_, i) => ({
        id: i,
        x: Math.random() * 80 + 10,
        y: Math.random() * 80 + 10,
        size: Math.random() * 18 + 12,
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
      }));
      setArParticles(particles);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentBookPage = book.pages[selectedPageIndex] || book.pages[0];

  const handleTakeSnapshot = () => {
    playStarChime();
    setIsSnapshotTaken(true);
    if (onAwardStar) onAwardStar(3);
    setTimeout(() => {
      setIsSnapshotTaken(false);
    }, 2500);
  };

  const handleSpeakARContent = () => {
    const text = currentBookPage.text['zh-TW'] || currentBookPage.text.en || '';
    speakText(text, 'zh-TW', 0.95);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-fadeIn">
      <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col rounded-3xl bg-slate-900 border-2 border-amber-400/80 text-slate-100 shadow-2xl overflow-hidden">
        
        {/* AR Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-amber-400/30 bg-slate-900/90 z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 text-slate-950 font-black shadow-md">
              <Box className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px]">
                  🥽 AR 擴增實境 3D 繪本
                </span>
                <span className="text-[10px] font-bold text-amber-300">
                  {book.originCountry} {book.flag}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-amber-200 line-clamp-1">
                《{book.title['zh-TW'] || book.title.en}》立體場景實境
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex items-center justify-center gap-2 p-3 bg-slate-950/60 border-b border-amber-400/20">
          <button
            type="button"
            onClick={() => { setArMode('3d-book'); playPageTurnSound(); }}
            className={`px-4 py-2 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-1.5 transition-all cursor-pointer ${
              arMode === '3d-book'
                ? 'bg-amber-400 text-slate-950 shadow-md scale-105'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Box className="w-4 h-4" />
            <span>🪐 3D 浮空立體書</span>
          </button>

          <button
            type="button"
            onClick={() => { setArMode('camera-ar'); playPageTurnSound(); setIsCameraActive(true); }}
            className={`px-4 py-2 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-1.5 transition-all cursor-pointer ${
              arMode === 'camera-ar'
                ? 'bg-amber-400 text-slate-950 shadow-md scale-105'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>📷 相機鏡頭實境</span>
          </button>

          <button
            type="button"
            onClick={() => { setArMode('character-popup'); playPageTurnSound(); }}
            className={`px-4 py-2 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-1.5 transition-all cursor-pointer ${
              arMode === 'character-popup'
                ? 'bg-amber-400 text-slate-950 shadow-md scale-105'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>✨ 立體角色彈出</span>
          </button>
        </div>

        {/* AR View Canvas Center */}
        <div className="relative flex-1 min-h-[380px] sm:min-h-[440px] bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center overflow-hidden p-6">
          
          {/* Floating AR Particles */}
          <div className="absolute inset-0 pointer-events-none">
            {arParticles.map((p) => (
              <span
                key={p.id}
                className="absolute animate-pulse opacity-70 transition-all duration-1000"
                style={{
                  left: `${p.x}%`,
                  top: `${p.y}%`,
                  fontSize: `${p.size}px`,
                }}
              >
                {p.emoji}
              </span>
            ))}
          </div>

          {/* AR Mode 1: 3D Floating Book */}
          {arMode === '3d-book' && (
            <div className="relative flex flex-col items-center justify-center space-y-6">
              
              {/* Simulated 3D Book Box */}
              <div
                className="relative w-64 sm:w-80 h-80 sm:h-96 rounded-3xl transition-transform duration-100 shadow-[0_20px_50px_rgba(251,191,36,0.3)] border-4 border-amber-400/80 overflow-hidden bg-slate-800 cursor-grab active:cursor-grabbing"
                style={{
                  transform: `perspective(800px) rotateY(${rotationY}deg) rotateX(${rotationX}deg)`,
                }}
              >
                <img
                  src={currentBookPage.illustrationUrl}
                  alt={book.title['zh-TW'] || book.title.en}
                  className="w-full h-full object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 p-4 flex flex-col justify-between">
                  <span className="self-end px-2.5 py-1 rounded-full bg-amber-400 text-slate-950 font-black text-xs shadow-md">
                    第 {currentBookPage.pageNumber} 頁
                  </span>

                  <div className="space-y-1">
                    <p className="text-xs font-bold text-amber-200 line-clamp-2">
                      {currentBookPage.text['zh-TW'] || currentBookPage.text.en}
                    </p>
                  </div>
                </div>
              </div>

              {/* Rotate Hint */}
              <div className="text-xs font-extrabold text-amber-300 flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-full border border-amber-400/30 backdrop-blur-xs">
                <RotateCw className="w-3.5 h-3.5 animate-spin" />
                <span>3D 全景動態旋轉展示中 • 滑鼠拖曳可旋轉視角</span>
              </div>
            </div>
          )}

          {/* AR Mode 2: Camera View Overlay */}
          {arMode === 'camera-ar' && (
            <div className="relative w-full h-full flex flex-col items-center justify-center rounded-2xl overflow-hidden border-2 border-dashed border-amber-400/50 bg-slate-950/90">
              
              {/* Simulated Camera Viewfinder Grid */}
              <div className="absolute inset-4 border border-amber-400/30 rounded-2xl pointer-events-none flex flex-col justify-between p-3">
                <div className="flex justify-between text-[10px] font-black text-amber-400">
                  <span>[ AR_CAMERA_LIVE ]</span>
                  <span>FPS: 60 | SPATIAL_3D</span>
                </div>
                <div className="flex justify-between text-[10px] font-black text-amber-400">
                  <span>FOCUS: AUTO</span>
                  <span>DEPTH: 1.2m</span>
                </div>
              </div>

              {/* Floating Hologram Card */}
              <div className="relative z-10 p-5 rounded-3xl bg-slate-900/90 border-2 border-amber-400 shadow-2xl max-w-md text-center space-y-3 backdrop-blur-md">
                <span className="text-4xl animate-bounce inline-block">🦊</span>
                <h4 className="font-black text-base text-amber-300">
                  《{book.title['zh-TW'] || book.title.en}》故事主角正在你的房間登場！
                </h4>
                <p className="text-xs text-slate-300 font-medium leading-relaxed">
                  將裝置鏡頭對準桌子或平坦地面，3D 故事主角將活靈活現地與你互動！
                </p>

                <div className="pt-2 flex justify-center">
                  <button
                    type="button"
                    onClick={handleTakeSnapshot}
                    className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-black text-xs shadow-lg flex items-center gap-1.5 hover:scale-105 transition-transform cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                    <span>📸 拍攝 AR 實境合照照片</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* AR Mode 3: Interactive Character Popup */}
          {arMode === 'character-popup' && (
            <div className="space-y-6 text-center max-w-lg w-full">
              <div className="flex justify-center gap-3">
                {interactivePopups.map((popup, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => { setActivePopupIndex(idx); playStarChime(); }}
                    className={`px-4 py-2 rounded-2xl font-black text-xs transition-all cursor-pointer ${
                      activePopupIndex === idx
                        ? 'bg-amber-400 text-slate-950 shadow-lg scale-105'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {popup}
                  </button>
                ))}
              </div>

              {/* Active Character 3D Display Card */}
              <div className="p-6 rounded-3xl bg-slate-900/90 border-2 border-amber-400 shadow-2xl space-y-4 animate-fadeIn">
                <div className="text-6xl animate-bounce">
                  {activePopupIndex === 0 && '🦊'}
                  {activePopupIndex === 1 && '⭐'}
                  {activePopupIndex === 2 && '🏰'}
                  {activePopupIndex === 3 && '🌸'}
                </div>

                <h4 className="font-black text-lg text-amber-300">
                  {interactivePopups[activePopupIndex || 0]}
                </h4>

                <p className="text-xs text-slate-200 font-medium leading-relaxed">
                  {activePopupIndex === 0 && '「你好！我是故事裡的主角，很高興可以在 AR 擴增實境世界裡跟你見面！」'}
                  {activePopupIndex === 1 && '「閃耀的魔法星光降臨，許下閱讀的願望，獲得滿滿童心智慧！」'}
                  {activePopupIndex === 2 && '「雄偉城堡矗立在遠方，讓我們一起啟程踏上驚險有趣的冒險吧！」'}
                  {activePopupIndex === 3 && '「神奇森林綻放的花朵，散發清香與歡笑聲！」'}
                </p>

                <button
                  type="button"
                  onClick={handleSpeakARContent}
                  className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-extrabold text-xs flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
                >
                  <Volume2 className="w-4 h-4 text-amber-400" />
                  <span>聆聽角色語音招呼</span>
                </button>
              </div>
            </div>
          )}

          {/* Snapshot Confirmation Overlay */}
          {isSnapshotTaken && (
            <div className="absolute inset-0 bg-white/90 text-slate-950 flex flex-col items-center justify-center p-6 text-center animate-fadeIn z-30">
              <span className="text-5xl animate-bounce">📸</span>
              <h4 className="font-black text-xl text-amber-950 mt-2">
                AR 拍照成功！已保存至個人珍藏集！
              </h4>
              <p className="text-xs font-bold text-amber-800">
                獲得獎勵 <strong className="text-orange-600 font-black">+3 星星 ⭐</strong>！
              </p>
            </div>
          )}
        </div>

        {/* Footer Page Selector */}
        <div className="p-4 bg-slate-950 border-t border-amber-400/20 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar">
            <span className="text-xs font-black text-amber-300 shrink-0">切換 3D 頁面：</span>
            {book.pages.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => { setSelectedPageIndex(idx); playPageTurnSound(); }}
                className={`px-3 py-1 rounded-xl text-xs font-black shrink-0 transition-all cursor-pointer ${
                  selectedPageIndex === idx
                    ? 'bg-amber-400 text-slate-950 shadow-xs'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                第 {p.pageNumber} 頁
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-amber-400 text-slate-950 font-black text-xs hover:bg-amber-300 shrink-0 cursor-pointer"
          >
            退出 AR 模式
          </button>
        </div>

      </div>
    </div>
  );
};
