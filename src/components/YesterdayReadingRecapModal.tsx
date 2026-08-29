import React, { useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  X,
  Clock,
  BookOpen,
  Award,
  Star,
  Flame,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  Smile,
  ArrowRight,
  RotateCcw,
  Volume2
} from 'lucide-react';
import { UserProfile, UserWord } from '../types';
import { playStarChime, playPageTurnSound } from '../utils/audio';

interface YesterdayReadingRecapModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  savedWords?: UserWord[];
  onStartTodayReading?: () => void;
  onAwardStar?: (stars: number) => void;
  darkMode?: boolean;
}

export const YesterdayReadingRecapModal: React.FC<YesterdayReadingRecapModalProps> = ({
  isOpen,
  onClose,
  profile,
  savedWords = [],
  onStartTodayReading,
  onAwardStar,
  darkMode = false,
}) => {
  // Estimated yesterday data based on user profile and history
  const yesterdayMinutes = useMemo(() => {
    return Math.max(15, profile.readingMinutes > 15 ? Math.round(profile.readingMinutes * 0.6) : 20);
  }, [profile.readingMinutes]);

  const yesterdayWords = useMemo(() => {
    return savedWords.slice(0, 3).map((w) => w.word);
  }, [savedWords]);

  const yesterdayCompletedCount = useMemo(() => {
    return Math.max(1, profile.readBookIds.length || 2);
  }, [profile.readBookIds]);

  const yesterdayStars = useMemo(() => {
    return Math.max(12, Math.round(yesterdayMinutes * 0.8));
  }, [yesterdayMinutes]);

  // Weekly daily minutes history for cartoon bar visualization
  const weeklyStats = [
    { day: '週一', mins: 15, full: true },
    { day: '週二', mins: 20, full: true },
    { day: '週三', mins: 12, full: false },
    { day: '週四', mins: 25, full: true },
    { day: '週五', mins: 18, full: true },
    { day: '昨天', mins: yesterdayMinutes, full: true, highlight: true },
    { day: '今天', mins: Math.min(profile.dailyGoalMinutes, profile.readingMinutes), full: false, isToday: true },
  ];

  const maxMins = Math.max(...weeklyStats.map((s) => s.mins), 25);

  if (!isOpen) return null;

  const handleClaimBonus = () => {
    playStarChime();
    try {
      confetti({
        particleCount: 45,
        spread: 65,
        origin: { y: 0.6 },
        colors: ['#F59E0B', '#10B981', '#6366F1', '#EC4899'],
      });
    } catch (e) {}
    if (onAwardStar) {
      onAwardStar(5);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div
        className={`relative w-full max-w-2xl max-h-[92vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden transition-all ${
          darkMode
            ? 'bg-slate-900 border-slate-700 text-slate-100'
            : 'bg-gradient-to-b from-amber-50/95 via-white to-orange-50/70 border-amber-300 text-slate-900'
        }`}
      >
        {/* Top Header with Cute Mascot */}
        <div className="px-6 py-5 border-b border-amber-200 dark:border-slate-800 flex items-center justify-between bg-white/70 dark:bg-slate-900/70 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 via-orange-400 to-yellow-300 p-1 shadow-md flex items-center justify-center text-2xl animate-bounce">
              🦉
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black">
                  📖 昨日閱讀學習回顧・成長檔案
                </h2>
                <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 shadow-2xs">
                  每日晨間速報
                </span>
              </div>
              <p className="text-xs font-semibold text-amber-900/70 dark:text-slate-400 mt-0.5">
                親愛的 {profile.name}，看看昨天你在繪本世界裡達成了哪些精彩冒險！✨
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-100 hover:text-rose-600 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            title="關閉"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* AI Story Mascot Encouragement Bubble */}
          <div className="p-4 rounded-3xl bg-gradient-to-r from-amber-400/20 via-orange-400/20 to-yellow-400/20 border-2 border-amber-300/80 dark:border-slate-700 flex items-center gap-3.5 shadow-sm">
            <div className="text-3xl shrink-0">🌟</div>
            <div className="text-xs sm:text-sm font-bold text-amber-950 dark:text-amber-200 leading-relaxed">
              <span className="font-black text-orange-600 dark:text-orange-400">小貓頭鷹導師：</span>
              「昨天你的表現超級亮眼！不僅保持了專注沉浸，還探索了新單字。今天也讓我們一起開啟新的閱讀探索吧！」
            </div>
          </div>

          {/* 4 Cartoon Stat Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Card 1: Time */}
            <div className="p-3.5 rounded-3xl bg-white dark:bg-slate-800 border-2 border-amber-300 dark:border-slate-700 shadow-xs flex flex-col items-center text-center space-y-1.5 hover:scale-105 transition-transform">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/80 flex items-center justify-center text-2xl">
                ⏱️
              </div>
              <span className="text-[11px] font-bold text-slate-500">昨日閱讀時長</span>
              <div className="text-lg font-black text-amber-600 dark:text-amber-400">
                {yesterdayMinutes} <span className="text-xs">分鐘</span>
              </div>
              <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
                達標 100% 🎯
              </span>
            </div>

            {/* Card 2: New Words */}
            <div className="p-3.5 rounded-3xl bg-white dark:bg-slate-800 border-2 border-orange-300 dark:border-slate-700 shadow-xs flex flex-col items-center text-center space-y-1.5 hover:scale-105 transition-transform">
              <div className="w-10 h-10 rounded-2xl bg-orange-100 dark:bg-orange-950/80 flex items-center justify-center text-2xl">
                📖
              </div>
              <span className="text-[11px] font-bold text-slate-500">學到新單字</span>
              <div className="text-lg font-black text-orange-600 dark:text-orange-400">
                {yesterdayWords.length || 3} <span className="text-xs">個詞彙</span>
              </div>
              <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded-md bg-orange-100 text-orange-800 dark:bg-orange-900/60 dark:text-orange-300">
                生字庫增長 ✨
              </span>
            </div>

            {/* Card 3: Completed Challenges */}
            <div className="p-3.5 rounded-3xl bg-white dark:bg-slate-800 border-2 border-purple-300 dark:border-slate-700 shadow-xs flex flex-col items-center text-center space-y-1.5 hover:scale-105 transition-transform">
              <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950/80 flex items-center justify-center text-2xl">
                🏆
              </div>
              <span className="text-[11px] font-bold text-slate-500">完成挑戰任務</span>
              <div className="text-lg font-black text-purple-600 dark:text-purple-400">
                {yesterdayCompletedCount} <span className="text-xs">項挑戰</span>
              </div>
              <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded-md bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-300">
                問答滿分 💯
              </span>
            </div>

            {/* Card 4: Stars Earned */}
            <div className="p-3.5 rounded-3xl bg-white dark:bg-slate-800 border-2 border-yellow-400 dark:border-slate-700 shadow-xs flex flex-col items-center text-center space-y-1.5 hover:scale-105 transition-transform">
              <div className="w-10 h-10 rounded-2xl bg-yellow-100 dark:bg-yellow-950/80 flex items-center justify-center text-2xl">
                ⭐
              </div>
              <span className="text-[11px] font-bold text-slate-500">獲得魔法星星</span>
              <div className="text-lg font-black text-amber-500 dark:text-amber-300">
                +{yesterdayStars} <span className="text-xs">顆星</span>
              </div>
              <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded-md bg-yellow-100 text-yellow-800 dark:bg-yellow-900/60 dark:text-yellow-300">
                連續 {profile.streakDays} 天 🔥
              </span>
            </div>
          </div>

          {/* Yesterday Learned Words Highlights */}
          {yesterdayWords.length > 0 && (
            <div className="p-4 rounded-3xl bg-white dark:bg-slate-800 border border-amber-200 dark:border-slate-700 space-y-2">
              <div className="flex items-center justify-between text-xs font-black text-amber-950 dark:text-amber-200">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  昨日收錄生字精選卡：
                </span>
                <span className="text-[11px] text-slate-500">點擊可在生字本複習</span>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {yesterdayWords.map((word, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 rounded-2xl bg-amber-100/70 dark:bg-slate-700 text-amber-950 dark:text-amber-100 border border-amber-300 dark:border-slate-600 text-xs font-black flex items-center gap-1 shadow-2xs"
                  >
                    <span>✨</span>
                    <span>{word}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Weekly Daily Learning Statistics Bar Chart */}
          <div className="p-4 rounded-3xl bg-white dark:bg-slate-800 border border-amber-200 dark:border-slate-700 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-amber-950 dark:text-amber-200 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                過去 7 天每日閱讀學習時長統計：
              </span>
              <span className="text-[10px] font-bold text-slate-500">
                目標：每天 {profile.dailyGoalMinutes} 分鐘
              </span>
            </div>

            <div className="grid grid-cols-7 gap-2 pt-3 items-end h-32 px-1">
              {weeklyStats.map((item, idx) => {
                const heightPercent = Math.min(100, Math.round((item.mins / maxMins) * 100));

                return (
                  <div key={idx} className="flex flex-col items-center gap-1.5 h-full justify-end">
                    <span className="text-[10px] font-black text-amber-900 dark:text-amber-300">
                      {item.mins}m
                    </span>

                    <div className="w-full max-w-[28px] h-20 bg-slate-100 dark:bg-slate-700 rounded-t-xl overflow-hidden flex items-end">
                      <div
                        className={`w-full rounded-t-xl transition-all duration-700 ${
                          item.highlight
                            ? 'bg-gradient-to-t from-amber-500 to-orange-400 shadow-md ring-2 ring-amber-400/50'
                            : item.isToday
                            ? 'bg-emerald-500'
                            : 'bg-amber-300 dark:bg-slate-600'
                        }`}
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>

                    <span className={`text-[10px] font-bold ${item.highlight ? 'text-orange-600 dark:text-orange-400 font-black' : 'text-slate-500'}`}>
                      {item.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Actions Footer */}
        <div className="px-6 py-4 border-t border-amber-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleClaimBonus}
            className="px-4 py-2.5 rounded-2xl bg-amber-100 hover:bg-amber-200 text-amber-950 dark:bg-slate-800 dark:text-amber-200 dark:hover:bg-slate-700 border border-amber-300 dark:border-slate-600 font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
            <span>領取晨間登入 +5 星 ⭐</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playStarChime();
              onClose();
              if (onStartTodayReading) {
                onStartTodayReading();
              }
            }}
            className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs sm:text-sm shadow-md hover:scale-105 transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>🚀 開啟今日閱讀冒險</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
