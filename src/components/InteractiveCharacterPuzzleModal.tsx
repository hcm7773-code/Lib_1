import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  X,
  Puzzle,
  RotateCcw,
  Trophy,
  Sparkles,
  Star,
  CheckCircle2,
  Clock,
  Eye,
  EyeOff,
  Flame,
  Award,
  Layers,
  ChevronRight,
  Smile,
  Volume2
} from 'lucide-react';
import { UserProfile, Book } from '../types';
import { playStarChime, playPageTurnSound } from '../utils/audio';

export interface PuzzleCharacterOption {
  id: string;
  title: string;
  bookTitle: string;
  characterName: string;
  avatar: string;
  imageUrl: string;
  quote: string;
  themeColor: string;
}

const PUZZLE_CHARACTERS: PuzzleCharacterOption[] = [
  {
    id: 'puz-prince',
    title: '小王子與金色麥田',
    bookTitle: '小王子與星空狐狸',
    characterName: '小王子',
    avatar: '👑',
    imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80',
    quote: '「真正重要的東西，用眼睛是看不見的，要用心去看！」✨',
    themeColor: 'from-amber-400 to-yellow-500',
  },
  {
    id: 'puz-fox',
    title: '星空下的智慧狐狸',
    bookTitle: '小王子與星空狐狸',
    characterName: '星空狐狸',
    avatar: '🦊',
    imageUrl: 'https://images.unsplash.com/photo-1474511320723-9a56873867b5?w=600&auto=format&fit=crop&q=80',
    quote: '「因為有你的等待，金黃色的麥田在風中也變得溫柔了。」🌾',
    themeColor: 'from-orange-400 to-amber-600',
  },
  {
    id: 'puz-pig',
    title: '綠建築小豬設計師',
    bookTitle: '三隻小豬的環保綠建築',
    characterName: '綠建築小豬',
    avatar: '🐷',
    imageUrl: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=600&auto=format&fit=crop&q=80',
    quote: '「太陽能與厚磚屋頂，大野狼再大力也吹不倒喔！」📐🌿',
    themeColor: 'from-emerald-400 to-teal-600',
  },
  {
    id: 'puz-wolf',
    title: '森林環保大野狼',
    bookTitle: '三隻小豬的環保綠建築',
    characterName: '大野狼',
    avatar: '🐺',
    imageUrl: 'https://images.unsplash.com/photo-1564865878688-9a244444042a?w=600&auto=format&fit=crop&q=80',
    quote: '「嗷嗚～！現在我也要蓋一棟屋頂有花園的綠色小屋！」🏡',
    themeColor: 'from-slate-600 to-slate-800',
  },
  {
    id: 'puz-whale',
    title: '深海發光鯨魚探險',
    bookTitle: '神奇海洋大冒險',
    characterName: '大翅鯨寶寶',
    avatar: '🐋',
    imageUrl: 'https://images.unsplash.com/photo-1568430462989-44163eb1752f?w=600&auto=format&fit=crop&q=80',
    quote: '「一起潛入蔚藍的深海，跟著發光水母一起遨遊吧！」🌊',
    themeColor: 'from-cyan-500 to-blue-600',
  },
  {
    id: 'puz-bear',
    title: '歡樂小熊森林音樂會',
    bookTitle: '森林小動物的音樂會',
    characterName: '歡樂小熊',
    avatar: '🐻',
    imageUrl: 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?w=600&auto=format&fit=crop&q=80',
    quote: '「只要大家齊心協力，森林裡的每一片樹葉都能奏出美妙音樂！」🎺',
    themeColor: 'from-rose-400 to-amber-500',
  },
];

interface InteractiveCharacterPuzzleModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile?: UserProfile;
  onAwardStar: (stars: number) => void;
  onUpdateProfile?: (updated: UserProfile) => void;
  darkMode?: boolean;
}

export const InteractiveCharacterPuzzleModal: React.FC<InteractiveCharacterPuzzleModalProps> = ({
  isOpen,
  onClose,
  profile,
  onAwardStar,
  onUpdateProfile,
  darkMode = false,
}) => {
  const [selectedChar, setSelectedChar] = useState<PuzzleCharacterOption>(PUZZLE_CHARACTERS[0]);
  const [gridSize, setGridSize] = useState<number>(3); // 2, 3, or 4
  const [tiles, setTiles] = useState<number[]>([]);
  const [selectedTileIndex, setSelectedTileIndex] = useState<number | null>(null);
  const [movesCount, setMovesCount] = useState<number>(0);
  const [seconds, setSeconds] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [showNumbers, setShowNumbers] = useState<boolean>(true);
  const [showReference, setShowReference] = useState<boolean>(true);

  const totalTiles = gridSize * gridSize;

  // Initialize or shuffle puzzle
  const initPuzzle = (size: number = gridSize) => {
    const total = size * size;
    const initial = Array.from({ length: total }, (_, i) => i);
    // Shuffle ensuring not already solved
    let shuffled = [...initial];
    let isSame = true;
    while (isSame) {
      shuffled = [...initial].sort(() => Math.random() - 0.5);
      isSame = shuffled.every((val, idx) => val === idx);
    }

    setTiles(shuffled);
    setSelectedTileIndex(null);
    setMovesCount(0);
    setSeconds(0);
    setIsCompleted(false);
    setIsPlaying(true);
    playPageTurnSound();
  };

  useEffect(() => {
    if (isOpen) {
      initPuzzle(gridSize);
    }
  }, [isOpen, selectedChar.id, gridSize]);

  // Timer loop
  useEffect(() => {
    let interval: any = null;
    if (isPlaying && !isCompleted) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, isCompleted]);

  // Handle tile click & swap mechanics
  const handleTileClick = (index: number) => {
    if (isCompleted) return;

    if (selectedTileIndex === null) {
      setSelectedTileIndex(index);
      playPageTurnSound();
    } else {
      if (selectedTileIndex === index) {
        setSelectedTileIndex(null);
        return;
      }

      // Swap the two tiles
      const newTiles = [...tiles];
      const temp = newTiles[selectedTileIndex];
      newTiles[selectedTileIndex] = newTiles[index];
      newTiles[index] = temp;

      setTiles(newTiles);
      setSelectedTileIndex(null);
      setMovesCount((m) => m + 1);
      playPageTurnSound();

      // Check if solved
      const solved = newTiles.every((val, idx) => val === idx);
      if (solved) {
        setIsCompleted(true);
        setIsPlaying(false);
        playStarChime();
        onAwardStar(15);

        try {
          confetti({
            particleCount: 75,
            spread: 80,
            origin: { y: 0.5 },
            colors: ['#F59E0B', '#10B981', '#6366F1', '#EC4899', '#FFD700'],
          });
        } catch (e) {}

        // Add badge to profile if update function available
        if (profile && onUpdateProfile) {
          const badgeId = `badge_puzzle_${selectedChar.id}`;
          const existingBadges = profile.badges || [];
          if (!existingBadges.some((b) => b.id === badgeId)) {
            const newBadge = {
              id: badgeId,
              name: `拼圖大師・${selectedChar.characterName}`,
              description: `成功拼出《${selectedChar.bookTitle}》角色【${selectedChar.title}】！`,
              icon: selectedChar.avatar,
              unlocked: true,
              unlockedAt: new Date().toLocaleDateString('zh-TW'),
              category: 'reading',
              unlockCondition: '在互動式角色拼圖中成功完成拼圖挑戰',
              rarity: '稀有' as const,
            };
            onUpdateProfile({
              ...profile,
              stars: profile.stars + 15,
              badges: [newBadge, ...existingBadges],
            });
          }
        }
      }
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div
        className={`relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden transition-all ${
          darkMode
            ? 'bg-slate-900 border-slate-700 text-slate-100'
            : 'bg-gradient-to-b from-amber-50 via-white to-orange-50/50 border-amber-300 text-slate-900'
        }`}
      >
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-amber-200 dark:border-slate-800 flex items-center justify-between bg-white/70 dark:bg-slate-900/70 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white shadow-md">
              <Puzzle className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black">
                  🧩 互動式繪本角色拼圖・智力大挑戰
                </h2>
                <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 text-slate-950 shadow-2xs">
                  通關獎勵 +15 ⭐
                </span>
              </div>
              <p className="text-xs font-semibold text-amber-900/70 dark:text-slate-400 mt-0.5">
                點擊兩張拼圖碎片即可互換位置，拼出完整的繪本主角插畫！
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-100 hover:text-rose-600 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            title="關閉拼圖"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Character Selector Horizontal Carousel */}
        <div className="px-6 py-2.5 border-b border-amber-200/60 dark:border-slate-800 flex items-center gap-2 bg-amber-100/30 dark:bg-slate-800/40 overflow-x-auto scrollbar-none">
          <span className="text-xs font-black text-amber-900 dark:text-slate-300 shrink-0">
            🎨 選擇拼圖主角：
          </span>

          <div className="flex items-center gap-2">
            {PUZZLE_CHARACTERS.map((char) => {
              const isSelected = selectedChar.id === char.id;
              return (
                <button
                  key={char.id}
                  type="button"
                  onClick={() => {
                    setSelectedChar(char);
                    playPageTurnSound();
                  }}
                  className={`px-3 py-1.5 rounded-2xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                    isSelected
                      ? `bg-gradient-to-r ${char.themeColor} text-white shadow-md scale-105 ring-2 ring-amber-400/50`
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-amber-100 border border-amber-200 dark:border-slate-700'
                  }`}
                >
                  <span className="text-base">{char.avatar}</span>
                  <span>{char.characterName}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Control Bar: Difficulty, Moves, Time & Toggles */}
        <div className="px-6 py-2.5 bg-white/80 dark:bg-slate-850 border-b border-amber-200/60 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs font-bold">
          
          {/* Difficulty Selector */}
          <div className="flex items-center gap-2">
            <span className="text-slate-500">難度：</span>
            <div className="flex items-center gap-1">
              {[
                { size: 2, label: '幼兒 2x2 (4片)' },
                { size: 3, label: '標準 3x3 (9片)' },
                { size: 4, label: '挑戰 4x4 (16片)' },
              ].map((diff) => (
                <button
                  key={diff.size}
                  type="button"
                  onClick={() => {
                    setGridSize(diff.size);
                    initPuzzle(diff.size);
                  }}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-black transition-all cursor-pointer ${
                    gridSize === diff.size
                      ? 'bg-amber-500 text-slate-950 shadow-2xs'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-amber-100'
                  }`}
                >
                  {diff.label}
                </button>
              ))}
            </div>
          </div>

          {/* Stats & Tools */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
              <Clock className="w-3.5 h-3.5" />
              <span>時間：{formatTime(seconds)}</span>
            </div>

            <div className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>步數：{movesCount} 步</span>
            </div>

            {/* Numbers Hint Toggle */}
            <button
              type="button"
              onClick={() => setShowNumbers(!showNumbers)}
              className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
                showNumbers ? 'bg-amber-100 border-amber-300 text-amber-800' : 'bg-slate-100 border-slate-300 text-slate-500'
              }`}
              title={showNumbers ? '隱藏數字提示' : '顯示數字提示'}
            >
              {showNumbers ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            </button>

            {/* Restart Button */}
            <button
              type="button"
              onClick={() => initPuzzle(gridSize)}
              className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
              title="重新打亂拼圖"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 flex flex-col md:flex-row items-center justify-center gap-6">
          
          {/* Puzzle Board Grid Container */}
          <div className="relative">
            <div
              className="grid gap-1.5 p-2 rounded-3xl bg-amber-200/80 dark:bg-slate-800 border-4 border-amber-400 dark:border-slate-700 shadow-xl overflow-hidden"
              style={{
                gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
                width: '320px',
                height: '320px',
              }}
            >
              {tiles.map((tilePos, index) => {
                const isSelected = selectedTileIndex === index;
                const isCorrect = tilePos === index;

                // Calculate CSS background position for tile
                const row = Math.floor(tilePos / gridSize);
                const col = tilePos % gridSize;
                const posX = (col / (gridSize - 1)) * 100;
                const posY = (row / (gridSize - 1)) * 100;

                return (
                  <div
                    key={index}
                    onClick={() => handleTileClick(index)}
                    className={`relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 select-none shadow-sm ${
                      isSelected
                        ? 'ring-4 ring-orange-500 scale-105 z-10 shadow-lg'
                        : isCorrect
                        ? 'border-2 border-emerald-400/80'
                        : 'border-2 border-white/60 hover:scale-[1.02]'
                    }`}
                    style={{
                      backgroundImage: `url(${selectedChar.imageUrl})`,
                      backgroundSize: `${gridSize * 100}% ${gridSize * 100}%`,
                      backgroundPosition: `${posX}% ${posY}%`,
                    }}
                  >
                    {/* Number Hint Badge */}
                    {showNumbers && (
                      <span className="absolute top-1 left-1 w-5 h-5 rounded-full bg-black/60 backdrop-blur-xs text-white text-[10px] font-black flex items-center justify-center shadow-xs">
                        {tilePos + 1}
                      </span>
                    )}

                    {/* Correct Indicator */}
                    {isCorrect && isCompleted && (
                      <span className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs animate-bounce">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Victory Overlay on Puzzle */}
            {isCompleted && (
              <div className="absolute inset-0 rounded-3xl bg-black/40 backdrop-blur-xs flex flex-col items-center justify-center text-white p-4 text-center space-y-2 animate-fadeIn">
                <div className="text-4xl animate-bounce">🎉🏆</div>
                <h3 className="text-xl font-black text-amber-300">
                  太棒了！拼圖成功！
                </h3>
                <p className="text-xs font-bold text-slate-100">
                  用時 {formatTime(seconds)} • 步數 {movesCount} 步 • +15 星星獎勵！
                </p>
                <button
                  type="button"
                  onClick={() => initPuzzle(gridSize)}
                  className="mt-2 px-5 py-2 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-slate-950 font-black text-xs shadow-md cursor-pointer hover:scale-105 transition-transform"
                >
                  再玩一次 🔄
                </button>
              </div>
            )}
          </div>

          {/* Right Side: Reference Thumbnail & Character Dialogue */}
          <div className="w-full max-w-xs space-y-4">
            
            {/* Reference Thumbnail */}
            <div className="p-4 rounded-3xl bg-white dark:bg-slate-800 border-2 border-amber-200 dark:border-slate-700 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs font-black text-amber-950 dark:text-amber-200">
                <span>🖼️ 完整插畫對照圖：</span>
                <span className="text-[10px] text-slate-500">《{selectedChar.bookTitle}》</span>
              </div>

              <div className="w-full h-36 rounded-2xl overflow-hidden border border-amber-200 dark:border-slate-700 relative shadow-inner">
                <img
                  src={selectedChar.imageUrl}
                  alt={selectedChar.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-1 right-1 bg-black/60 px-2 py-0.5 rounded-full text-white text-[10px] font-bold">
                  原圖預覽
                </div>
              </div>
            </div>

            {/* Character Dialogue Quote Card */}
            <div className={`p-4 rounded-3xl bg-gradient-to-br ${selectedChar.themeColor} text-white shadow-md space-y-2 relative overflow-hidden`}>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{selectedChar.avatar}</span>
                <span className="font-black text-sm">{selectedChar.characterName} 悄悄話：</span>
              </div>

              <p className="text-xs font-medium leading-relaxed italic opacity-95">
                {selectedChar.quote}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="px-6 py-4 border-t border-amber-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 flex items-center justify-between gap-3">
          <div className="text-xs font-bold text-amber-900 dark:text-slate-300 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>提示：點擊第一張碎片選取，再點擊目標碎片即可完成交換！</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs sm:text-sm shadow-md hover:scale-105 transition-all cursor-pointer"
          >
            完成並返回
          </button>
        </div>
      </div>
    </div>
  );
};
