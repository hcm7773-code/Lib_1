import React, { useState, useMemo } from 'react';
import {
  X,
  Trophy,
  Sparkles,
  RotateCw,
  Star,
  Award,
  Crown,
  BookOpen,
  Filter,
  CheckCircle2,
  Lock,
  Gift,
  Share2,
  Download,
  Flame,
  Layers,
  Heart
} from 'lucide-react';
import { Book, CollectibleItem } from '../types';
import { getCollectiblesForBook, INITIAL_DEFAULT_COLLECTIBLES } from '../data/collectibles';
import { playStarChime, playPageTurnSound } from '../utils/audio';

interface DigitalTreasureVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  books: Book[];
  readBookIds?: string[];
  darkMode?: boolean;
}

export const DigitalTreasureVaultModal: React.FC<DigitalTreasureVaultModalProps> = ({
  isOpen,
  onClose,
  books,
  readBookIds = [],
  darkMode = false,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});
  const [activeCardId, setActiveCardId] = useState<string | null>(null);

  // Generate All Collectibles for all books and mark unlocked ones
  const allVaultCards = useMemo(() => {
    const list: {
      book: Book;
      collectible: CollectibleItem;
      isUnlocked: boolean;
      starCount: number;
    }[] = [];

    const effectiveReadSet = new Set(readBookIds);

    books.forEach((book, bIdx) => {
      const isUnlocked = effectiveReadSet.has(book.id) || bIdx === 0 || bIdx === 1;
      const collectibles = getCollectiblesForBook(book);
      
      collectibles.forEach((item, cIdx) => {
        list.push({
          book,
          collectible: item,
          isUnlocked,
          starCount: isUnlocked ? 5 : 0,
        });
      });
    });

    return list;
  }, [books, readBookIds]);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    allVaultCards.forEach((c) => {
      if (c.collectible.category) {
        cats.add(c.collectible.category);
      }
    });
    return ['all', ...Array.from(cats)];
  }, [allVaultCards]);

  const filteredCards = useMemo(() => {
    if (selectedCategory === 'all') return allVaultCards;
    return allVaultCards.filter((c) => c.collectible.category === selectedCategory);
  }, [allVaultCards, selectedCategory]);

  const unlockedCount = useMemo(() => {
    return allVaultCards.filter((c) => c.isUnlocked).length;
  }, [allVaultCards]);

  const toggleFlip = (cardKey: string) => {
    setFlippedCards((prev) => ({
      ...prev,
      [cardKey]: !prev[cardKey],
    }));
    playPageTurnSound();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div
        className={`relative w-full max-w-5xl max-h-[92vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden transition-all ${
          darkMode
            ? 'bg-slate-900 border-slate-700 text-slate-100'
            : 'bg-gradient-to-b from-amber-50 via-white to-orange-50/50 border-amber-200 text-slate-900'
        }`}
      >
        {/* Top Header */}
        <div className="px-6 py-5 border-b border-amber-200/80 dark:border-slate-800 flex items-center justify-between bg-white/60 dark:bg-slate-900/60 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-500 text-slate-950 shadow-md">
              <Trophy className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black">
                  繪本數位寶箱・3D 紀念卡特藏館
                </h2>
                <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 shadow-2xs">
                  {unlockedCount} / {allVaultCards.length} 已解鎖
                </span>
              </div>
              <p className="text-xs font-semibold text-amber-900/70 dark:text-slate-400 mt-0.5">
                每讀完一本繪本，即可在數位寶箱中點亮專屬 3D 故事紀念卡與珍稀數位藏品！
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-100 hover:text-rose-600 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            title="關閉"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Filters & Progress Bar */}
        <div className="px-6 py-3 border-b border-amber-200/50 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-amber-100/40 dark:bg-slate-800/40">
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
            <span className="text-xs font-bold text-amber-900 dark:text-slate-300 flex items-center gap-1 mr-1">
              <Filter className="w-3.5 h-3.5" />
              分類：
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat);
                  playPageTurnSound();
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                    : 'bg-white/80 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-amber-200/60'
                }`}
              >
                {cat === 'all' ? '🌟 全部紀念卡' : cat}
              </button>
            ))}
          </div>

          {/* Collection completion badge */}
          <div className="flex items-center gap-2 text-xs font-black text-amber-700 dark:text-amber-400">
            <Sparkles className="w-4 h-4 text-amber-500 animate-spin-slow" />
            <span>特藏完成度：{Math.round((unlockedCount / (allVaultCards.length || 1)) * 100)}%</span>
          </div>
        </div>

        {/* Main 3D Card Grid Canvas */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCards.map((cardItem, idx) => {
              const cardKey = `${cardItem.book.id}-${cardItem.collectible.id}-${idx}`;
              const isFlipped = !!flippedCards[cardKey];
              const titleStr = typeof cardItem.book.title === 'string'
                ? cardItem.book.title
                : cardItem.book.title['zh-TW'] || cardItem.book.title.en;

              return (
                <div
                  key={cardKey}
                  className="group perspective-1000 h-[380px] w-full cursor-pointer select-none"
                  onClick={() => toggleFlip(cardKey)}
                >
                  <div
                    className={`relative w-full h-full duration-700 transform-style-3d transition-transform rounded-3xl ${
                      isFlipped ? 'rotate-y-180' : ''
                    }`}
                  >
                    {/* Front Face: 3D Glowing Card */}
                    <div
                      className={`absolute inset-0 backface-hidden rounded-3xl border-2 p-5 flex flex-col justify-between overflow-hidden shadow-lg transition-all ${
                        cardItem.isUnlocked
                          ? 'border-amber-400/90 bg-gradient-to-br from-amber-50 via-white to-orange-50 dark:from-slate-800 dark:via-slate-850 dark:to-slate-900 shadow-amber-500/15'
                          : 'border-slate-300 dark:border-slate-700 bg-slate-100/80 dark:bg-slate-850/80 opacity-75 grayscale'
                      }`}
                    >
                      {/* Top Badges & Rarity */}
                      <div className="flex items-center justify-between z-10">
                        <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${
                          cardItem.collectible.rarity === 'legendary'
                            ? 'bg-amber-400 text-slate-950 shadow-xs'
                            : cardItem.collectible.rarity === 'epic'
                            ? 'bg-purple-500 text-white shadow-xs'
                            : 'bg-teal-500 text-white shadow-xs'
                        }`}>
                          {cardItem.collectible.rarity}
                        </span>

                        <div className="flex items-center gap-1">
                          {cardItem.isUnlocked ? (
                            <span className="flex items-center gap-1 text-[11px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-700">
                              <CheckCircle2 className="w-3 h-3" />
                              已點亮
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-[11px] font-bold text-slate-500 bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded-full">
                              <Lock className="w-3 h-3" />
                              未解鎖
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Center Graphic & 3D Illustration Hologram */}
                      <div className="relative my-auto flex flex-col items-center justify-center text-center space-y-3 z-10">
                        <div className="relative">
                          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-amber-400 via-orange-400 to-yellow-300 p-1 shadow-xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                            <div className="w-full h-full rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center text-4xl shadow-inner">
                              {cardItem.collectible.icon || '🏆'}
                            </div>
                          </div>
                          {cardItem.isUnlocked && (
                            <div className="absolute -top-2 -right-2 bg-amber-400 text-slate-950 rounded-full p-1 shadow-md">
                              <Sparkles className="w-4 h-4 animate-spin-slow" />
                            </div>
                          )}
                        </div>

                        <div>
                          <h4 className="font-black text-base sm:text-lg text-slate-900 dark:text-slate-100 line-clamp-1">
                            {cardItem.collectible.name}
                          </h4>
                          <p className="text-xs font-bold text-amber-700 dark:text-amber-400 line-clamp-1 mt-0.5">
                            《{titleStr}》
                          </p>
                        </div>
                      </div>

                      {/* Bottom Footer & Flip Hint */}
                      <div className="pt-3 border-t border-amber-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs font-bold z-10">
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          {cardItem.collectible.category || '紀念藏品'}
                        </span>
                        <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1 text-[11px] font-extrabold group-hover:underline">
                          <RotateCw className="w-3 h-3" />
                          點擊翻轉查看故事
                        </span>
                      </div>
                    </div>

                    {/* Back Face: Story Wisdom & Unlocked Perks */}
                    <div
                      className={`absolute inset-0 backface-hidden rotate-y-180 rounded-3xl border-2 p-5 flex flex-col justify-between overflow-hidden shadow-xl transition-all ${
                        cardItem.isUnlocked
                          ? 'border-amber-400 bg-gradient-to-br from-amber-600 via-orange-600 to-amber-700 text-white'
                          : 'border-slate-400 bg-slate-800 text-slate-300'
                      }`}
                    >
                      {/* Back Header */}
                      <div className="flex items-center justify-between border-b border-white/20 pb-2">
                        <span className="text-xs font-black flex items-center gap-1 text-amber-200">
                          <BookOpen className="w-3.5 h-3.5" />
                          繪本故事紀念卷軸
                        </span>
                        <span className="text-[10px] bg-black/30 text-white px-2 py-0.5 rounded-full font-mono">
                          {cardItem.collectible.earnedAt || '今日已獲取'}
                        </span>
                      </div>

                      {/* Back Wisdom / Quote */}
                      <div className="my-auto space-y-3">
                        <div className="p-3.5 rounded-2xl bg-black/20 backdrop-blur-xs border border-white/15 text-xs font-medium leading-relaxed">
                          "{cardItem.collectible.description}"
                        </div>

                        <div className="space-y-1.5 text-xs">
                          <div className="flex items-center justify-between text-amber-200 font-bold">
                            <span>藏品專屬品質：</span>
                            <span className="font-black text-white">{cardItem.collectible.rarity.toUpperCase()}</span>
                          </div>
                          <div className="flex items-center justify-between text-amber-200 font-bold">
                            <span>解鎖來源：</span>
                            <span className="font-bold text-white truncate max-w-[130px]">《{titleStr}》</span>
                          </div>
                        </div>
                      </div>

                      {/* Back Footer */}
                      <div className="pt-2 border-t border-white/20 flex items-center justify-between text-[11px]">
                        <span className="text-amber-200 font-bold flex items-center gap-1">
                          <Gift className="w-3.5 h-3.5" />
                          已珍藏至寶箱
                        </span>
                        <span className="text-white font-black flex items-center gap-1">
                          <RotateCw className="w-3 h-3" />
                          點擊翻回正面
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="px-6 py-4 border-t border-amber-200/80 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 font-bold text-amber-900 dark:text-slate-300">
            <Award className="w-4 h-4 text-amber-500" />
            <span>溫馨提示：在圖書館閱讀新故事或使用 AI 續寫創作，皆可自動獲得全新 3D 專屬紀念卡！</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black shadow-md hover:scale-105 transition-all cursor-pointer"
          >
            收下並返回閱讀
          </button>
        </div>
      </div>
    </div>
  );
};
