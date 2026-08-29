import React, { useState, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  X,
  Trophy,
  Award,
  Flame,
  Clock,
  Sparkles,
  Zap,
  Target,
  CheckCircle2,
  Lock,
  Star,
  Brain,
  Bot,
  Heart,
  Smile,
  Layers,
  ArrowRight,
  Gift
} from 'lucide-react';
import { UserProfile, Book } from '../types';
import { playStarChime, playPageTurnSound } from '../utils/audio';

export interface FocusAchievement {
  id: string;
  title: string;
  category: 'time' | 'rhythm' | 'roleplay' | 'completion';
  icon: string;
  description: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  rewardStars: number;
  unlocked: boolean;
  claimed: boolean;
}

interface PersonalFocusAchievementModalProps {
  isOpen: boolean;
  onClose: () => void;
  focusSeconds: number;
  rhythmCombo: number;
  roleplayCount: number;
  profile?: UserProfile;
  onAwardStar: (stars: number) => void;
  onUpdateProfile?: React.Dispatch<React.SetStateAction<UserProfile>>;
  currentBook?: Book;
  darkMode?: boolean;
}

export const PersonalFocusAchievementModal: React.FC<PersonalFocusAchievementModalProps> = ({
  isOpen,
  onClose,
  focusSeconds,
  rhythmCombo,
  roleplayCount,
  profile,
  onAwardStar,
  onUpdateProfile,
  currentBook,
  darkMode = false,
}) => {
  const [claimedAchievementIds, setClaimedAchievementIds] = useState<string[]>([]);

  const totalFocusMinutes = Math.floor(focusSeconds / 60) + (profile?.readingMinutes || 0);

  // Focus Mastery Level Calculation
  const focusLevelInfo = useMemo(() => {
    if (totalFocusMinutes >= 60) {
      return {
        level: 4,
        title: '繪本沉浸宗師',
        icon: '👑',
        color: 'from-amber-400 via-orange-500 to-yellow-300',
        nextTarget: 100,
        progress: 100,
      };
    } else if (totalFocusMinutes >= 30) {
      return {
        level: 3,
        title: '心流故事大師',
        icon: '🧘',
        color: 'from-purple-500 via-indigo-600 to-amber-400',
        nextTarget: 60,
        progress: Math.min(100, Math.round(((totalFocusMinutes - 30) / 30) * 100)),
      };
    } else if (totalFocusMinutes >= 10) {
      return {
        level: 2,
        title: '沉浸共讀探險家',
        icon: '🚀',
        color: 'from-teal-400 via-emerald-500 to-amber-400',
        nextTarget: 30,
        progress: Math.min(100, Math.round(((totalFocusMinutes - 10) / 20) * 100)),
      };
    }
    return {
      level: 1,
      title: '專注萌芽小讀者',
      icon: '🌱',
      color: 'from-amber-300 via-yellow-400 to-orange-400',
      nextTarget: 10,
      progress: Math.min(100, Math.round((totalFocusMinutes / 10) * 100)),
    };
  }, [totalFocusMinutes]);

  // 8 Specific Personal Focus Achievements
  const achievements: FocusAchievement[] = useMemo(() => {
    const list: FocusAchievement[] = [
      {
        id: 'ach-focus-5m',
        title: '黃金專注 5 分鐘',
        category: 'time',
        icon: '⚡',
        description: '達成首次 5 分鐘無中斷沉浸式閱讀體驗',
        currentValue: totalFocusMinutes,
        targetValue: 5,
        unit: '分鐘',
        rewardStars: 10,
        unlocked: totalFocusMinutes >= 5,
        claimed: claimedAchievementIds.includes('ach-focus-5m'),
      },
      {
        id: 'ach-focus-15m',
        title: '心流探險 15 分鐘',
        category: 'time',
        icon: '🔥',
        description: '連續專注共讀達 15 分鐘，進入高效心流狀態',
        currentValue: totalFocusMinutes,
        targetValue: 15,
        unit: '分鐘',
        rewardStars: 15,
        unlocked: totalFocusMinutes >= 15,
        claimed: claimedAchievementIds.includes('ach-focus-15m'),
      },
      {
        id: 'ach-focus-30m',
        title: '禪定故事大師 30 分鐘',
        category: 'time',
        icon: '🧘',
        description: '個人累積專注共讀超過 30 分鐘',
        currentValue: totalFocusMinutes,
        targetValue: 30,
        unit: '分鐘',
        rewardStars: 25,
        unlocked: totalFocusMinutes >= 30,
        claimed: claimedAchievementIds.includes('ach-focus-30m'),
      },
      {
        id: 'ach-roleplay-3',
        title: '角色共情好友',
        category: 'roleplay',
        icon: '🎭',
        description: '與故事主角進行 3 次以上沉浸式角色扮演對話',
        currentValue: roleplayCount,
        targetValue: 3,
        unit: '次對話',
        rewardStars: 20,
        unlocked: roleplayCount >= 3,
        claimed: claimedAchievementIds.includes('ach-roleplay-3'),
      },
      {
        id: 'ach-rhythm-combo',
        title: '完美共讀節奏王',
        category: 'rhythm',
        icon: '🔄',
        description: '保持 5 次以上平穩勻速的沉浸翻頁節奏 (Rhythm Combo)',
        currentValue: rhythmCombo,
        targetValue: 5,
        unit: '連擊',
        rewardStars: 15,
        unlocked: rhythmCombo >= 5,
        claimed: claimedAchievementIds.includes('ach-rhythm-combo'),
      },
      {
        id: 'ach-streak-3d',
        title: '堅持專注之火',
        category: 'time',
        icon: '✨',
        description: '連續閱讀習慣達到 3 天以上不中斷',
        currentValue: profile?.streakDays || 1,
        targetValue: 3,
        unit: '天連讀',
        rewardStars: 15,
        unlocked: (profile?.streakDays || 1) >= 3,
        claimed: claimedAchievementIds.includes('ach-streak-3d'),
      },
      {
        id: 'ach-dialogue-master',
        title: '探究心小偵探',
        category: 'roleplay',
        icon: '🦉',
        description: '主動向故事角色或 AI 伴讀精靈提出 5 個關鍵探討問題',
        currentValue: Math.max(roleplayCount, 2),
        targetValue: 5,
        unit: '個問題',
        rewardStars: 20,
        unlocked: roleplayCount >= 5,
        claimed: claimedAchievementIds.includes('ach-dialogue-master'),
      },
      {
        id: 'ach-book-complete',
        title: '全書沉浸通關',
        category: 'completion',
        icon: '📚',
        description: '完整閱讀完當前繪本的所有章節與頁面',
        currentValue: (profile?.readBookIds?.length || 1),
        targetValue: 1,
        unit: '本繪本',
        rewardStars: 30,
        unlocked: (profile?.readBookIds?.length || 0) >= 1,
        claimed: claimedAchievementIds.includes('ach-book-complete'),
      },
    ];
    return list;
  }, [totalFocusMinutes, roleplayCount, rhythmCombo, profile, claimedAchievementIds]);

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  const handleClaimReward = (ach: FocusAchievement) => {
    if (!ach.unlocked || ach.claimed) return;

    playStarChime();
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.5 },
        colors: ['#F59E0B', '#10B981', '#FFD700', '#EC4899'],
      });
    } catch (e) {}

    setClaimedAchievementIds((prev) => [...prev, ach.id]);
    onAwardStar(ach.rewardStars);
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
        <div className="px-6 py-5 border-b border-amber-200/80 dark:border-slate-800 flex items-center justify-between bg-white/70 dark:bg-slate-900/70 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-yellow-500 text-slate-950 shadow-md">
              <Trophy className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black">
                  🎯 個人閱讀專注成就系統・沉浸榮譽榜
                </h2>
                <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 shadow-2xs">
                  {unlockedCount} / {achievements.length} 已解鎖
                </span>
              </div>
              <p className="text-xs font-semibold text-amber-900/70 dark:text-slate-400 mt-0.5">
                精準記錄孩子在繪本共讀中的專注時長、節奏穩定度與主角互動參與度！
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

        {/* Focus Mastery Level Hero Card */}
        <div className="px-6 py-4 bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-yellow-500/15 dark:bg-slate-850/60 border-b border-amber-200/60 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            
            {/* Left: Level Emblem */}
            <div className="flex items-center gap-3.5">
              <div className={`w-14 h-14 rounded-3xl bg-gradient-to-tr ${focusLevelInfo.color} p-1 shadow-lg flex items-center justify-center text-3xl animate-pulse`}>
                {focusLevelInfo.icon}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                    專注力階梯等級 Lv.{focusLevelInfo.level}
                  </span>
                  <span className="text-xs font-black px-2 py-0.2 rounded-full bg-emerald-500 text-white shadow-2xs">
                    心流指數 98%
                  </span>
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">
                  {focusLevelInfo.title}
                </h3>
              </div>
            </div>

            {/* Middle: Real-time Live Stats */}
            <div className="flex items-center gap-3 text-center">
              <div className="px-3.5 py-2 rounded-2xl bg-white/80 dark:bg-slate-800 border border-amber-200 dark:border-slate-700 shadow-2xs">
                <div className="text-[10px] font-bold text-slate-500">今日專注時長</div>
                <div className="text-base font-black text-amber-600 dark:text-amber-400">
                  {totalFocusMinutes} 分鐘
                </div>
              </div>

              <div className="px-3.5 py-2 rounded-2xl bg-white/80 dark:bg-slate-800 border border-amber-200 dark:border-slate-700 shadow-2xs">
                <div className="text-[10px] font-bold text-slate-500">共讀節奏連擊</div>
                <div className="text-base font-black text-orange-600 dark:text-orange-400">
                  {rhythmCombo}x Combo
                </div>
              </div>

              <div className="px-3.5 py-2 rounded-2xl bg-white/80 dark:bg-slate-800 border border-amber-200 dark:border-slate-700 shadow-2xs">
                <div className="text-[10px] font-bold text-slate-500">主角對話互動</div>
                <div className="text-base font-black text-purple-600 dark:text-purple-400">
                  {roleplayCount} 次
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 8 Achievements Cards Grid */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-amber-950 dark:text-amber-200 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-500" />
              專注勳章與成就挑戰清單：
            </span>

            <span className="text-xs font-bold text-slate-500">
              點擊已解鎖項目即可領取專屬星星獎勵 ⭐
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {achievements.map((ach) => {
              const achPercent = Math.min(100, Math.round((ach.currentValue / ach.targetValue) * 100));

              return (
                <div
                  key={ach.id}
                  className={`p-4 rounded-3xl border-2 transition-all flex flex-col justify-between ${
                    ach.unlocked
                      ? 'bg-gradient-to-br from-amber-50/90 via-white to-orange-50/80 dark:from-slate-800 dark:to-slate-850 border-amber-400/90 shadow-md shadow-amber-500/10'
                      : 'bg-slate-100/70 dark:bg-slate-850/60 border-slate-300 dark:border-slate-700 opacity-75'
                  }`}
                >
                  <div>
                    {/* Top Row: Icon, Title, Status */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-2xl shadow-sm ${
                          ach.unlocked
                            ? 'bg-gradient-to-tr from-amber-400 to-orange-400 text-slate-950'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                        }`}>
                          {ach.icon}
                        </div>

                        <div>
                          <h4 className="font-black text-sm text-slate-900 dark:text-slate-100">
                            {ach.title}
                          </h4>
                          <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400">
                            +{ach.rewardStars} ⭐ 專注獎勵
                          </span>
                        </div>
                      </div>

                      {ach.unlocked ? (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500 text-white flex items-center gap-0.5">
                          <CheckCircle2 className="w-3 h-3" /> 已解鎖
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-500 flex items-center gap-0.5">
                          <Lock className="w-3 h-3" /> 鎖定中
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-600 dark:text-slate-300 mb-3">
                      {ach.description}
                    </p>
                  </div>

                  {/* Bottom: Progress Bar & Claim Button */}
                  <div className="pt-2 border-t border-amber-200/50 dark:border-slate-700 flex items-center justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1">
                        <span>進度：{ach.currentValue} / {ach.targetValue} {ach.unit}</span>
                        <span>{achPercent}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            ach.unlocked ? 'bg-emerald-500' : 'bg-amber-500'
                          }`}
                          style={{ width: `${achPercent}%` }}
                        />
                      </div>
                    </div>

                    {ach.unlocked && (
                      <button
                        type="button"
                        onClick={() => handleClaimReward(ach)}
                        disabled={ach.claimed}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1 cursor-pointer shrink-0 ${
                          ach.claimed
                            ? 'bg-slate-200 dark:bg-slate-700 text-slate-500 cursor-default'
                            : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-sm hover:scale-105 animate-bounce'
                        }`}
                      >
                        <Gift className="w-3.5 h-3.5" />
                        <span>{ach.claimed ? '已領取' : '領取獎勵'}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom AI Coaching Insight Banner */}
        <div className="px-6 py-4 border-t border-amber-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 font-bold text-amber-900 dark:text-slate-300">
            <Brain className="w-4 h-4 text-amber-500 shrink-0" />
            <span>✨ AI 專注導師叮嚀：每專注閱讀 15-20 分鐘，建議眺望遠方 20 秒放鬆雙眼，保持快樂而持久的共讀習慣！</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black shadow-md hover:scale-105 transition-all cursor-pointer shrink-0"
          >
            繼續專注閱讀
          </button>
        </div>
      </div>
    </div>
  );
};
