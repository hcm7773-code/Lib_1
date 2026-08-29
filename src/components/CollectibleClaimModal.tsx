import React, { useState, useEffect } from 'react';
import { Sparkles, Trophy, CheckCircle2, ArrowRight, Star, Heart, X, Gift, Crown } from 'lucide-react';
import { CollectibleItem } from '../types';

interface CollectibleClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookTitle: string;
  collectibles: CollectibleItem[];
  onGoToProfile?: () => void;
  darkMode?: boolean;
}

export const CollectibleClaimModal: React.FC<CollectibleClaimModalProps> = ({
  isOpen,
  onClose,
  bookTitle,
  collectibles,
  onGoToProfile,
  darkMode = false,
}) => {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setRevealed(false);
      const timer = setTimeout(() => {
        setRevealed(true);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn overflow-y-auto">
      <div className={`relative max-w-xl w-full rounded-3xl border-2 p-6 sm:p-8 shadow-2xl text-center space-y-6 transform transition-all duration-500 ${
        darkMode
          ? 'bg-slate-900 border-amber-500/80 text-slate-100'
          : 'bg-gradient-to-b from-amber-50 via-orange-50/80 to-amber-100 border-amber-300 text-slate-900'
      }`}>
        {/* Top Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-black/10 text-slate-500 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Celebration Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center justify-center p-4 rounded-3xl bg-gradient-to-tr from-amber-400 via-orange-500 to-yellow-400 text-white shadow-xl animate-bounce">
            <Trophy className="w-10 h-10 fill-amber-100 text-amber-100" />
          </div>
          <div className="space-y-1">
            <span className="text-xs font-black px-3 py-1 rounded-full bg-amber-500 text-white uppercase tracking-wider shadow-xs">
              🎉 繪本完成紀念品解鎖！
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              恭喜讀完《{bookTitle}》
            </h2>
            <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300">
              你獲得了一組專屬於本書的主題數位裝飾貼紙，已成功永久存入你的成就展覽櫃！
            </p>
          </div>
        </div>

        {/* Unboxed Collectible Items Showcase */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
          {collectibles.map((item, idx) => {
            const isLegendary = item.rarity === 'legendary';
            const isEpic = item.rarity === 'epic';
            
            return (
              <div
                key={item.id || idx}
                className={`p-5 rounded-2xl border-2 transition-all duration-700 transform ${
                  revealed ? 'scale-100 opacity-100 translate-y-0' : 'scale-90 opacity-0 translate-y-4'
                } ${
                  isLegendary
                    ? 'bg-gradient-to-br from-amber-500/20 via-yellow-400/20 to-amber-600/30 border-amber-400 shadow-lg shadow-amber-500/20'
                    : isEpic
                    ? 'bg-gradient-to-br from-purple-500/20 via-indigo-500/20 to-pink-500/20 border-purple-400 shadow-lg shadow-purple-500/20'
                    : 'bg-white/80 dark:bg-slate-800/80 border-amber-200 dark:border-slate-700 shadow-md'
                }`}
                style={{ transitionDelay: `${idx * 150}ms` }}
              >
                {/* Rarity Pill */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full text-white uppercase shadow-2xs ${
                    isLegendary
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-500 animate-pulse'
                      : isEpic
                      ? 'bg-gradient-to-r from-purple-500 to-indigo-500'
                      : item.rarity === 'rare'
                      ? 'bg-blue-500'
                      : 'bg-slate-500'
                  }`}>
                    {isLegendary ? '💎 傳說 Legendary' : isEpic ? '✨ 史詩 Epic' : item.rarity === 'rare' ? '🌟 稀有 Rare' : '🎨 普通 Common'}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">{item.category}</span>
                </div>

                {/* Big Animated Icon */}
                <div className="my-3 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-100 to-orange-100 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center text-5xl shadow-inner border border-amber-300/60 dark:border-slate-600 transform hover:scale-110 transition-transform">
                    {item.icon}
                  </div>
                </div>

                {/* Title & Description */}
                <h3 className="font-black text-base text-slate-900 dark:text-slate-100">
                  {item.name}
                </h3>
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Bonus Stars Notice */}
        <div className="p-3.5 rounded-2xl bg-amber-400/20 dark:bg-amber-950/60 border border-amber-400/50 flex items-center justify-center gap-2 text-xs font-black text-amber-900 dark:text-amber-200">
          <Star className="w-4 h-4 text-amber-500 fill-amber-500 animate-spin" />
          <span>閱讀大成功！額外獲贈 +5 ⭐ 智慧童心星星點數！</span>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          {onGoToProfile && (
            <button
              type="button"
              id="btn-modal-view-collectibles"
              onClick={() => {
                onClose();
                onGoToProfile();
              }}
              className="w-full sm:flex-1 py-3 px-5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-black text-sm shadow-md transition-all hover:scale-105 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Crown className="w-4 h-4 text-white" />
              <span>前往個人成就櫃檢視收藏</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            id="btn-modal-close-claim"
            onClick={onClose}
            className="w-full sm:w-auto py-3 px-6 rounded-2xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-sm border border-slate-300 dark:border-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            繼續閱讀
          </button>
        </div>
      </div>
    </div>
  );
};
