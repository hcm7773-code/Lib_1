import React, { useState, useEffect, useRef, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  ReferenceLine,
} from 'recharts';
import {
  Target,
  Trophy,
  Flame,
  Sparkles,
  Clock,
  ChevronDown,
  ChevronUp,
  Star,
  CheckCircle2,
  BookOpen,
  Volume2,
  Bot,
  Brain,
  Award,
  Zap,
  RotateCcw,
  Smile,
  ArrowRight,
  Sliders,
  Plus,
  TrendingUp,
  BarChart2,
  Calendar,
  ExternalLink,
  Activity,
  Check,
  Medal,
  Gift,
  X,
} from 'lucide-react';
import { UserProfile, Book, DigitalSticker, CollectibleItem } from '../types';
import { playStarChime, playPageTurnSound } from '../utils/audio';

export interface AiEngagementQuest {
  id: string;
  title: string;
  category: 'reading' | 'vocab' | 'ai_chat' | 'quiz' | 'creation' | 'mood';
  icon: string;
  current: number;
  target: number;
  unit: string;
  rewardStars: number;
  advice: string;
  actionTab?: 'library' | 'creator' | 'wordbank' | 'profile' | 'bookshelf';
  actionLabel?: string;
}

export interface DailyGoalStickerTheme {
  id: string;
  weekdayName: string;
  name: string;
  emoji: string;
  rarity: '普通' | '稀有' | '史詩' | '傳奇';
  badgeTitle: string;
  themeGradient: string;
  borderGlow: string;
  description: string;
  rewardStars: number;
}

export const DAILY_GOAL_STICKER_PRESETS: DailyGoalStickerTheme[] = [
  {
    id: 'sticker-daily-sun',
    weekdayName: '週日',
    name: '🌟 日耀全勝榮譽金星',
    emoji: '🌟',
    rarity: '傳奇',
    badgeTitle: '週日破風金星',
    themeGradient: 'from-amber-400 via-yellow-400 to-orange-500',
    borderGlow: 'border-amber-300 ring-amber-400/60 shadow-amber-500/40',
    description: '週日圓滿超越每日閱讀目標，智慧光芒四射，解鎖專屬星空勳章！',
    rewardStars: 15,
  },
  {
    id: 'sticker-daily-mon',
    weekdayName: '週一',
    name: '🦉 晨光探索伴讀貓頭鷹',
    emoji: '🦉',
    rarity: '稀有',
    badgeTitle: '活力週一啟航',
    themeGradient: 'from-sky-400 via-teal-400 to-emerald-500',
    borderGlow: 'border-teal-300 ring-teal-400/60 shadow-teal-500/40',
    description: '週一活力滿點，與貓頭鷹伴讀小精靈展開嶄新的繪本探險旅途！',
    rewardStars: 15,
  },
  {
    id: 'sticker-daily-tue',
    weekdayName: '週二',
    name: '🚀 疾風飛躍閱讀火箭',
    emoji: '🚀',
    rarity: '稀有',
    badgeTitle: '極速想像探險家',
    themeGradient: 'from-indigo-400 via-purple-500 to-pink-500',
    borderGlow: 'border-purple-300 ring-purple-400/60 shadow-purple-500/40',
    description: '超越想像力極限，沉浸故事世界，閱讀進度一飛沖天！',
    rewardStars: 15,
  },
  {
    id: 'sticker-daily-wed',
    weekdayName: '週三',
    name: '👑 繪本國王榮耀皇冠',
    emoji: '👑',
    rarity: '史詩',
    badgeTitle: '故事小國王',
    themeGradient: 'from-amber-300 via-yellow-500 to-amber-600',
    borderGlow: 'border-yellow-300 ring-yellow-400/60 shadow-yellow-500/40',
    description: '週中堅持不懈，以豐富的閱讀積累加冕為故事王國小國王！',
    rewardStars: 15,
  },
  {
    id: 'sticker-daily-thu',
    weekdayName: '週四',
    name: '🍀 幸運四葉草伴讀章',
    emoji: '🍀',
    rarity: '稀有',
    badgeTitle: '好運豐收書僮',
    themeGradient: 'from-emerald-400 via-green-500 to-teal-500',
    borderGlow: 'border-emerald-300 ring-emerald-400/60 shadow-emerald-500/40',
    description: '滿滿的閱讀好運氣，今天也收穫了豐富的生詞瑰寶與精彩智慧！',
    rewardStars: 15,
  },
  {
    id: 'sticker-daily-fri',
    weekdayName: '週五',
    name: '🏆 週末前夕達標金盃',
    emoji: '🏆',
    rarity: '史詩',
    badgeTitle: '週五大滿貫',
    themeGradient: 'from-orange-400 via-amber-500 to-yellow-400',
    borderGlow: 'border-amber-300 ring-amber-400/60 shadow-amber-500/40',
    description: '歡樂迎接週末，連續讀書目標大成功，捧起榮耀達標金盃！',
    rewardStars: 15,
  },
  {
    id: 'sticker-daily-sat',
    weekdayName: '週六',
    name: '🎨 夢幻彩虹創作畫筆',
    emoji: '🎨',
    rarity: '傳奇',
    badgeTitle: '靈感幻想家',
    themeGradient: 'from-pink-400 via-purple-400 to-cyan-400',
    borderGlow: 'border-pink-300 ring-pink-400/60 shadow-pink-500/40',
    description: '週六創意大爆發，在故事與插畫世界中翱翔探險，收穫無窮靈感！',
    rewardStars: 15,
  },
];

interface DailyGoalProgressBarProps {
  userProfile: UserProfile;
  onUpdateProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  books: Book[];
  savedWordsCount: number;
  activeTab: string;
  setActiveTab: (tab: 'library' | 'creator' | 'wordbank' | 'profile' | 'bookshelf') => void;
  onOpenMoodJournal?: () => void;
  onTriggerCelebrationModal?: () => void;
  onOpenLearningAnalytics?: () => void;
  onOpenAchievementWall?: () => void;
  onOpenPersonalAchievements?: () => void;
  darkMode?: boolean;
}

export const DailyGoalProgressBar: React.FC<DailyGoalProgressBarProps> = ({
  userProfile,
  onUpdateProfile,
  books,
  savedWordsCount,
  activeTab,
  setActiveTab,
  onOpenMoodJournal,
  onTriggerCelebrationModal,
  onOpenLearningAnalytics,
  onOpenAchievementWall,
  onOpenPersonalAchievements,
  darkMode = false,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isGoalPickerOpen, setIsGoalPickerOpen] = useState<boolean>(false);
  const [hasCelebratedSession, setHasCelebratedSession] = useState<boolean>(false);
  const [isStickerCelebrationModalOpen, setIsStickerCelebrationModalOpen] = useState<boolean>(false);
  const [isStickerDetailModalOpen, setIsStickerDetailModalOpen] = useState<boolean>(false);
  const prevMinutesRef = useRef<number>(userProfile.readingMinutes || 0);

  const currentMinutes = userProfile.readingMinutes || 0;
  const goalMinutes = Math.max(5, userProfile.dailyGoalMinutes || 15);
  const progressPercent = Math.min(100, Math.round((currentMinutes / goalMinutes) * 100));
  const rawRatioPercent = Math.round((currentMinutes / goalMinutes) * 100);
  const isGoalReached = currentMinutes >= goalMinutes;

  // Today's dynamic sticker theme based on day of week
  const today = new Date();
  const dayIndex = today.getDay();
  const todayDateStr = today.toISOString().split('T')[0];
  const todayFormatted = `${today.getFullYear()}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getDate().toString().padStart(2, '0')}`;
  const todayStickerPreset = DAILY_GOAL_STICKER_PRESETS[dayIndex] || DAILY_GOAL_STICKER_PRESETS[0];
  const stickerUniqueId = `sticker-goal-${todayDateStr}`;

  // Check if user has already collected today's dynamic sticker
  const isCollectedToday = useMemo(() => {
    const inStickers = (userProfile.unlockedStickers || []).some(
      s => s.id === stickerUniqueId || (s.unlockedAt && s.unlockedAt.startsWith(todayFormatted)) || s.id === `sticker-goal-${dayIndex}`
    );
    const inClaimedDate = userProfile.lastGoalBonusClaimedDate === todayDateStr;
    return inStickers || inClaimedDate;
  }, [userProfile.unlockedStickers, userProfile.lastGoalBonusClaimedDate, stickerUniqueId, todayFormatted, todayDateStr, dayIndex]);

  // 7-Day Reading Goal Achievement Rate Trend calculation
  const sevenDayStats = useMemo(() => {
    const goal = goalMinutes;
    const dayNames = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'];

    // 6 previous days simulated historical progress, today uses current real-time minutes
    const baseHistoricalMinutes = [16, 20, 15, 18, 22, 25];

    const daysData = [];
    let totalRate = 0;
    let achievedCount = 0;

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const isToday = i === 0;
      const dayLabel = isToday ? '今日' : `${d.getMonth() + 1}/${d.getDate()}`;
      const weekday = dayNames[d.getDay()];

      const mins = isToday ? currentMinutes : (baseHistoricalMinutes[6 - i] || 15);
      const rate = Math.round((mins / goal) * 100);
      const achieved = mins >= goal;
      if (achieved) achievedCount++;
      totalRate += rate;

      daysData.push({
        day: dayLabel,
        weekday,
        dateStr: `${d.getMonth() + 1}月${d.getDate()}日 (${weekday})`,
        minutes: mins,
        goalMinutes: goal,
        rate,
        achieved,
        isToday,
      });
    }

    const avgRate = Math.round(totalRate / 7);

    return {
      data: daysData,
      avgRate,
      achievedDays: achievedCount,
      todayRate: rawRatioPercent,
    };
  }, [currentMinutes, goalMinutes, rawRatioPercent]);

  // Trigger celebration confetti
  const triggerConfetti = (isManualClick = false) => {
    playStarChime();
    try {
      // 1. Left side burst
      confetti({
        particleCount: 75,
        spread: 60,
        origin: { x: 0.15, y: 0.4 },
        colors: ['#F59E0B', '#10B981', '#3B82F6', '#EC4899', '#8B5CF6', '#FBBF24'],
      });
      // 2. Right side burst
      confetti({
        particleCount: 75,
        spread: 60,
        origin: { x: 0.85, y: 0.4 },
        colors: ['#F59E0B', '#10B981', '#3B82F6', '#EC4899', '#8B5CF6', '#FBBF24'],
      });
      // 3. Center star shower
      confetti({
        particleCount: 45,
        spread: 90,
        origin: { y: 0.25 },
        shapes: ['star', 'circle'],
        colors: ['#FFD700', '#FFA500', '#FF69B4', '#10B981'],
        scalar: 1.2,
      });
    } catch (e) {
      console.warn('Confetti animation error:', e);
    }
  };

  // Automatically trigger confetti when goal is crossed
  useEffect(() => {
    const prev = prevMinutesRef.current;
    if (prev < goalMinutes && currentMinutes >= goalMinutes && !hasCelebratedSession) {
      triggerConfetti();
      setHasCelebratedSession(true);
    }
    prevMinutesRef.current = currentMinutes;
  }, [currentMinutes, goalMinutes, hasCelebratedSession]);

  // Collect dynamic goal sticker into personal achievement repository
  const handleCollectGoalSticker = () => {
    if (isCollectedToday) {
      setIsStickerDetailModalOpen(true);
      playPageTurnSound();
      return;
    }

    // Trigger celebration effects
    triggerConfetti(true);
    playStarChime();

    const newSticker: DigitalSticker = {
      id: stickerUniqueId,
      name: todayStickerPreset.name,
      emoji: todayStickerPreset.emoji,
      category: '每日目標',
      unlocked: true,
      unlockedAt: todayFormatted,
      earnedFromBook: `每日閱讀達標（${goalMinutes}分鐘）`,
    };

    const newCollectible: CollectibleItem = {
      id: `collectible-goal-${todayDateStr}`,
      bookId: 'daily-goal-challenge',
      bookTitle: '每日閱讀達標成就',
      name: todayStickerPreset.name,
      icon: todayStickerPreset.emoji,
      category: '每日挑戰',
      description: todayStickerPreset.description,
      earnedAt: todayFormatted,
      rarity: todayStickerPreset.rarity === '傳奇' ? 'legendary' : todayStickerPreset.rarity === '史詩' ? 'epic' : 'rare',
      themeColor: todayStickerPreset.themeGradient,
    };

    onUpdateProfile(prev => {
      const existingStickers = prev.unlockedStickers || [];
      const filteredStickers = existingStickers.filter(s => s.id !== stickerUniqueId);
      const updatedStickers = [newSticker, ...filteredStickers];

      const existingCollectibles = prev.collectibles || [];
      const filteredCollectibles = existingCollectibles.filter(c => c.id !== newCollectible.id);
      const updatedCollectibles = [newCollectible, ...filteredCollectibles];

      return {
        ...prev,
        stars: (prev.stars || 0) + todayStickerPreset.rewardStars,
        lastGoalBonusClaimedDate: todayDateStr,
        unlockedStickers: updatedStickers,
        collectibles: updatedCollectibles,
      };
    });

    setIsStickerCelebrationModalOpen(true);
  };

  // AI-generated Dynamic Engagement Quests
  const engagementQuests: AiEngagementQuest[] = [
    {
      id: 'quest-time',
      title: '沉浸共讀好時光',
      category: 'reading',
      icon: '📖',
      current: currentMinutes,
      target: goalMinutes,
      unit: '分鐘',
      rewardStars: 10,
      advice: isGoalReached ? '今日目標達成！維持沉浸式閱讀節奏' : `還差 ${goalMinutes - currentMinutes} 分鐘即可完成今日閱讀成就`,
      actionTab: 'library',
      actionLabel: '前往繪本庫',
    },
    {
      id: 'quest-vocab',
      title: '生字寶藏探索家',
      category: 'vocab',
      icon: '⭐',
      current: Math.min(3, savedWordsCount),
      target: 3,
      unit: '個詞彙',
      rewardStars: 8,
      advice: savedWordsCount >= 3 ? '太棒了！已收集滿 3 個精選生詞' : '在閱讀繪本時點擊發光重點生字並加入生字本',
      actionTab: 'wordbank',
      actionLabel: '生字本複習',
    },
    {
      id: 'quest-ai-chat',
      title: 'AI 伴讀精靈對話',
      category: 'ai_chat',
      icon: '🤖',
      current: 1,
      target: 1,
      unit: '次互動',
      rewardStars: 6,
      advice: '在閱讀器右下角向貓頭鷹小夥伴提問 1 個故事細節',
      actionTab: 'library',
      actionLabel: '開啟伴讀',
    },
    {
      id: 'quest-mood',
      title: '繪本心情手札',
      category: 'mood',
      icon: '💖',
      current: userProfile.moodJournal?.length ? 1 : 0,
      target: 1,
      unit: '篇日記',
      rewardStars: 5,
      advice: '記錄共讀後的心情與最喜歡的故事角色',
      actionTab: 'profile',
      actionLabel: '寫心情日記',
    },
  ];

  const completedQuestsCount = engagementQuests.filter(q => q.current >= q.target).length;

  const handleUpdateGoal = (newGoal: number) => {
    onUpdateProfile(prev => ({
      ...prev,
      dailyGoalMinutes: newGoal,
    }));
    setIsGoalPickerOpen(false);
    playPageTurnSound();
  };

  // Quick simulate +5 reading minutes for interactive live test
  const handleQuickAddMinutes = (mins: number) => {
    onUpdateProfile(prev => ({
      ...prev,
      readingMinutes: (prev.readingMinutes || 0) + mins,
    }));
    playStarChime();
  };

  const handleResetMinutes = () => {
    onUpdateProfile(prev => ({
      ...prev,
      readingMinutes: 0,
    }));
    setHasCelebratedSession(false);
    playPageTurnSound();
  };

  return (
    <div
      id="daily-reading-goal-progress-bar"
      className={`border-b transition-colors relative z-20 ${
        darkMode
          ? 'bg-slate-900/95 border-slate-800 text-slate-100'
          : 'bg-gradient-to-r from-amber-50 via-orange-50/70 to-yellow-50/80 border-amber-200/90 text-slate-900 shadow-2xs'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 py-2.5 sm:py-3">
        {/* Main Compact Row */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          
          {/* Left: Target Icon, Ratio Text & Streak */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => triggerConfetti(true)}
              className={`p-2 rounded-2xl transition-transform hover:scale-110 active:scale-95 cursor-pointer shadow-xs ${
                isGoalReached
                  ? 'bg-gradient-to-tr from-amber-400 via-yellow-400 to-emerald-400 text-slate-950 animate-pulse'
                  : 'bg-amber-500 text-white'
              }`}
              title={isGoalReached ? '🎉 點擊施放達標彩花！' : '每日目標進度'}
            >
              {isGoalReached ? <Trophy className="w-4 h-4 sm:w-5 sm:h-5" /> : <Target className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-xs sm:text-sm tracking-tight flex items-center gap-1">
                  每日閱讀目標
                  {isGoalReached && (
                    <span className="text-[10px] font-black px-2 py-0.2 rounded-full bg-emerald-500 text-white shadow-2xs">
                      🎉 已達成 {rawRatioPercent}%
                    </span>
                  )}
                </span>

                {/* Streak Badge */}
                <span className="text-[11px] font-extrabold flex items-center gap-0.5 text-orange-600 dark:text-orange-400 bg-orange-100/90 dark:bg-orange-950/80 px-2 py-0.5 rounded-full border border-orange-300 dark:border-orange-800">
                  <Flame className="w-3 h-3 fill-orange-500" />
                  <span>{userProfile.streakDays || 1} 天連讀</span>
                </span>
              </div>

              {/* Progress text numbers */}
              <div className="flex items-baseline gap-1.5 text-xs">
                <span className="font-black text-amber-600 dark:text-amber-400 text-sm">
                  {currentMinutes}
                </span>
                <span className={`font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  / {goalMinutes} 分鐘
                </span>
                <span className="text-[11px] font-bold text-slate-500">
                  ({progressPercent}%)
                </span>
              </div>
            </div>
          </div>

          {/* Middle 1: Visual Dynamic Animated Progress Bar with Milestones */}
          <div className="flex-1 max-w-sm sm:max-w-md lg:max-w-xs xl:max-w-sm mx-0 lg:mx-2 flex flex-col justify-center gap-1">
            <div className="relative w-full h-3.5 bg-slate-200/80 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 shadow-inner border border-amber-200/50 dark:border-slate-700">
              {/* Animated Gradient Bar */}
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out relative ${
                  isGoalReached
                    ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-emerald-500 shadow-md'
                    : 'bg-gradient-to-r from-orange-400 via-amber-500 to-yellow-400'
                }`}
                style={{ width: `${progressPercent}%` }}
              >
                {/* Subtle shine beam */}
                <div className="absolute inset-0 bg-white/25 rounded-full animate-pulse" />
              </div>
            </div>

            {/* Milestones markers */}
            <div className="flex justify-between text-[10px] font-bold text-slate-500 dark:text-slate-400 px-1">
              <span>0m</span>
              <span className={progressPercent >= 25 ? 'text-amber-600 dark:text-amber-400' : ''}>25%</span>
              <span className={progressPercent >= 50 ? 'text-amber-600 dark:text-amber-400' : ''}>50%</span>
              <span className={progressPercent >= 75 ? 'text-amber-600 dark:text-amber-400' : ''}>75%</span>
              <span className={isGoalReached ? 'text-emerald-600 dark:text-emerald-400 font-black' : ''}>
                {isGoalReached ? '🌟 滿分' : '100%'}
              </span>
            </div>
          </div>

          {/* 🎯 動態『達成目標』小貼紙 (Dynamic Goal Achievement Sticker) */}
          <div className="relative shrink-0 flex items-center">
            {isGoalReached ? (
              // 🌟 目標已達成狀態：動態小貼紙按鈕
              <button
                type="button"
                onClick={handleCollectGoalSticker}
                className={`group relative p-1.5 sm:px-2.5 sm:py-1.5 rounded-2xl border transition-all flex items-center gap-2 cursor-pointer shadow-md ${
                  isCollectedToday
                    ? darkMode
                      ? 'bg-gradient-to-r from-amber-950/60 to-yellow-950/40 border-amber-500/60 text-amber-200 hover:border-amber-400'
                      : 'bg-gradient-to-r from-amber-100 via-yellow-50 to-amber-100 border-amber-400 text-amber-950 hover:border-amber-500 shadow-amber-200/60'
                    : darkMode
                    ? 'bg-gradient-to-r from-amber-600/90 via-yellow-500/90 to-emerald-600/90 border-yellow-400 text-white animate-sticker-bounce animate-sticker-glow'
                    : 'bg-gradient-to-r from-amber-400 via-yellow-400 to-emerald-400 border-amber-300 text-slate-950 animate-sticker-bounce animate-sticker-glow shadow-lg hover:scale-105'
                }`}
                title={
                  isCollectedToday
                    ? `已收集今日達標貼紙【${todayStickerPreset.name}】（點擊檢視詳情與成就庫）`
                    : `🎉 恭喜達成今日目標！點擊將【${todayStickerPreset.name}】收集到個人成就庫中 (+15 ⭐)`
                }
              >
                {/* Dynamic Animated Sticker Icon with Spinning Sparkle Halo */}
                <div className="relative flex items-center justify-center">
                  {/* Halo Glow */}
                  <div className={`absolute inset-0 rounded-full blur-xs opacity-75 ${
                    !isCollectedToday ? 'bg-amber-300 animate-pulse' : 'bg-amber-400/40'
                  }`} />
                  
                  {/* Animated Rotating Sparkles (when uncollected) */}
                  {!isCollectedToday && (
                    <div className="absolute -inset-1.5 pointer-events-none animate-sticker-sparkle text-amber-200">
                      <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 opacity-80" />
                    </div>
                  )}

                  {/* Sticker Emoji Avatar */}
                  <div className={`relative text-xl sm:text-2xl transition-transform group-hover:scale-110 drop-shadow-sm select-none ${
                    !isCollectedToday ? 'animate-bounce' : ''
                  }`}>
                    {todayStickerPreset.emoji}
                  </div>

                  {/* Star Badge Indicator */}
                  {!isCollectedToday && (
                    <span className="absolute -top-1.5 -right-2 text-[9px] font-black px-1.5 py-0.2 rounded-full bg-rose-500 text-white shadow-xs animate-pulse">
                      NEW
                    </span>
                  )}
                </div>

                {/* Label and CTA */}
                <div className="flex flex-col text-left">
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] sm:text-xs font-black tracking-tight flex items-center gap-1">
                      {isCollectedToday ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <span>已收入成就庫</span>
                        </>
                      ) : (
                        <>
                          <Gift className="w-3.5 h-3.5 text-rose-600 dark:text-rose-300 animate-bounce shrink-0" />
                          <span>達成目標！收集貼紙</span>
                        </>
                      )}
                    </span>
                    <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded-full ${
                      isCollectedToday
                        ? 'bg-amber-200/80 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200'
                        : 'bg-white text-slate-900 font-mono shadow-2xs'
                    }`}>
                      {todayStickerPreset.rarity}
                    </span>
                  </div>
                  <div className="text-[10px] font-bold text-amber-900/80 dark:text-amber-300/90 truncate max-w-[125px] sm:max-w-[155px]">
                    {isCollectedToday ? `${todayStickerPreset.name}` : `+${todayStickerPreset.rewardStars} ⭐ 點擊領取`}
                  </div>
                </div>
              </button>
            ) : (
              // 🔒 未達標狀態：預覽鎖定貼紙輪廓（激勵讀者達標）
              <div
                className={`px-2 py-1.5 rounded-2xl border transition-all flex items-center gap-1.5 opacity-80 hover:opacity-100 ${
                  darkMode ? 'bg-slate-800/60 border-slate-700 text-slate-400' : 'bg-white/70 border-amber-200/70 text-slate-600'
                }`}
                title={`今日專屬動態貼紙【${todayStickerPreset.name}】（還差 ${goalMinutes - currentMinutes} 分鐘達標解鎖）`}
              >
                <div className="relative text-base sm:text-lg grayscale-75 opacity-70">
                  {todayStickerPreset.emoji}
                </div>
                <div className="flex flex-col text-[10px]">
                  <span className="font-bold flex items-center gap-0.5 text-slate-700 dark:text-slate-300">
                    <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                    <span>今日達標貼紙</span>
                  </span>
                  <span className="text-[9px] text-slate-400 dark:text-slate-500 font-medium">
                    差 {goalMinutes - currentMinutes}m 解鎖
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Middle 2: 📈 小型『閱讀目標完成趨勢線圖』(Recharts) */}
          <button
            type="button"
            onClick={() => {
              playPageTurnSound();
              if (onOpenLearningAnalytics) {
                onOpenLearningAnalytics();
              }
            }}
            className={`group relative px-2.5 py-1.5 rounded-2xl border transition-all flex items-center justify-between gap-2.5 text-left cursor-pointer shrink-0 hover:scale-[1.02] shadow-2xs ${
              darkMode
                ? 'bg-slate-800/90 border-slate-700 hover:border-emerald-500/80 hover:bg-slate-800'
                : 'bg-white/90 border-amber-200/90 hover:border-emerald-400 hover:bg-white shadow-xs'
            }`}
            title="點擊快速開啟『全方位學習數據概述彈窗』查看詳細學習診斷"
          >
            {/* Info & Stats */}
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-black text-slate-800 dark:text-slate-100 flex items-center gap-1">
                  7日目標趨勢
                  <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300">
                    均 {sevenDayStats.avgRate}%
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                <span className="font-semibold">{sevenDayStats.achievedDays}/7日達標</span>
                <span>•</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold group-hover:underline flex items-center gap-0.5">
                  學習數據 <ExternalLink className="w-2.5 h-2.5" />
                </span>
              </div>
            </div>

            {/* Sparkline Recharts Area/Line Chart */}
            <div className="w-20 sm:w-24 h-8 relative shrink-0 pointer-events-none">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sevenDayStats.data} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
                  <defs>
                    <linearGradient id="miniGoalTrendGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.45} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <ReferenceLine y={100} stroke="#f59e0b" strokeDasharray="2 2" strokeOpacity={0.6} />
                  <Area
                    type="monotone"
                    dataKey="rate"
                    stroke="#10b981"
                    strokeWidth={2}
                    fill="url(#miniGoalTrendGradient)"
                    dot={{ r: 2, fill: '#10b981', strokeWidth: 1, stroke: '#ffffff' }}
                    activeDot={{ r: 3.5, fill: '#059669', stroke: '#ffffff', strokeWidth: 1.5 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </button>

          {/* Right: Quick Action Controls & AI Quest Trigger */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-between lg:justify-end">
            {/* Quick Test simulator buttons */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleQuickAddMinutes(5)}
                className="px-2 py-1 rounded-xl text-[11px] font-black bg-amber-200/80 hover:bg-amber-300/80 dark:bg-slate-800 dark:hover:bg-slate-700 text-amber-950 dark:text-amber-300 border border-amber-300 dark:border-slate-700 transition-all flex items-center gap-0.5 cursor-pointer shadow-2xs"
                title="快速增加 5 分鐘閱讀時間以體驗達標進度"
              >
                <Plus className="w-3 h-3" />
                <span>5分</span>
              </button>

              {isGoalReached && (
                <button
                  type="button"
                  onClick={() => triggerConfetti(true)}
                  className="px-2.5 py-1 rounded-xl text-[11px] font-black bg-gradient-to-r from-amber-500 to-emerald-500 text-white shadow-xs hover:scale-105 transition-all flex items-center gap-1 cursor-pointer"
                  title="施放彩色彩花慶祝"
                >
                  <Sparkles className="w-3 h-3 animate-spin-slow" />
                  <span>放彩花</span>
                </button>
              )}
            </div>

            {/* Adjust Goal Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsGoalPickerOpen(!isGoalPickerOpen)}
                className={`p-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  darkMode
                    ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300'
                    : 'bg-white border-amber-300 hover:bg-amber-100 text-amber-900'
                }`}
                title="修改每日目標時長"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">調目標</span>
              </button>

              {/* Goal Selector Popover */}
              {isGoalPickerOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 p-2.5 rounded-2xl bg-white dark:bg-slate-800 shadow-xl border border-amber-300 dark:border-slate-700 z-50 animate-fadeIn space-y-1">
                  <div className="text-[11px] font-black text-slate-500 dark:text-slate-400 px-1 pb-1 border-b border-slate-200 dark:border-slate-700">
                    設定每日閱讀目標：
                  </div>
                  {[10, 15, 20, 30, 45, 60].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => handleUpdateGoal(mins)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center justify-between cursor-pointer ${
                        goalMinutes === mins
                          ? 'bg-amber-500 text-slate-950 font-black'
                          : 'hover:bg-amber-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      <span>{mins} 分鐘 / 日</span>
                      {goalMinutes === mins && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                  <div className="pt-1 border-t border-slate-100 dark:border-slate-700 flex justify-between">
                    <button
                      type="button"
                      onClick={handleResetMinutes}
                      className="text-[10px] text-rose-500 font-bold hover:underline px-1 flex items-center gap-0.5"
                    >
                      <RotateCcw className="w-2.5 h-2.5" /> 重設今日時長
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* AI Reading Engagement Expand Button */}
            <button
              type="button"
              onClick={() => {
                setIsExpanded(!isExpanded);
                playPageTurnSound();
              }}
              className={`px-3 py-1.5 rounded-2xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                isExpanded
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'bg-amber-200/90 dark:bg-slate-800 text-amber-950 dark:text-amber-300 hover:bg-amber-300/80 border border-amber-300/80 dark:border-slate-700'
              }`}
            >
              <Bot className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>AI 參與目標 ({completedQuestsCount}/4)</span>
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Expandable AI Reading Engagement Quests & Smart Coaching Dashboard */}
        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-amber-200/80 dark:border-slate-800 animate-fadeIn space-y-3">
            
            {/* 7-Day Detailed Trend Bar & Overview Quick Link Banner */}
            <div className={`p-3 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-3 ${
              darkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-emerald-50/90 border-emerald-200'
            }`}>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-500 text-slate-950 font-black shrink-0">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-slate-900 dark:text-slate-100">
                      過去 7 天目標達成趨勢明細
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-emerald-200 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200">
                      7日均率 {sevenDayStats.avgRate}%（{sevenDayStats.achievedDays}天達標）
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    每日穩健閱讀，輕鬆解鎖「七日目標破風者」與「深度共讀哲學家」等專屬閱讀勳章！
                  </p>
                </div>
              </div>

              {/* 7-Day Day Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
                {sevenDayStats.data.map((item) => (
                  <div
                    key={item.dateStr}
                    className={`px-2 py-1 rounded-xl text-center border text-[10px] font-bold transition-all ${
                      item.isToday
                        ? 'bg-amber-500 text-slate-950 border-amber-600 font-black shadow-2xs'
                        : item.achieved
                        ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                        : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <div className="text-[9px] opacity-75">{item.day}</div>
                    <div className="font-extrabold font-mono">{item.rate}%</div>
                  </div>
                ))}

                {onOpenLearningAnalytics && (
                  <button
                    type="button"
                    onClick={() => {
                      playPageTurnSound();
                      onOpenLearningAnalytics();
                    }}
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 text-slate-950 font-black text-xs shadow-2xs flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0 hover:scale-105 transition-all"
                  >
                    <BarChart2 className="w-3.5 h-3.5" />
                    <span>全方位數據概述</span>
                  </button>
                )}
              </div>
            </div>

            {/* Header & AI Smart Coaching Quote */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-300">
                  <Brain className="w-4 h-4" />
                </span>
                <span className="text-xs font-black text-amber-950 dark:text-amber-200">
                  AI 智能閱讀參與任務與導師推薦 (今日完成 {completedQuestsCount} / 4 項)
                </span>
              </div>

              <div className="text-[11px] font-bold text-amber-800/80 dark:text-amber-400/90 bg-amber-100/60 dark:bg-slate-800 px-2.5 py-1 rounded-full border border-amber-200 dark:border-slate-700">
                ✨ 完成任務可賺取專屬閱讀星 ⭐ 與解鎖徽章！
              </div>
            </div>

            {/* 4 Multi-Dimensional Quests Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {engagementQuests.map((quest) => {
                const isCompleted = quest.current >= quest.target;
                const questPercent = Math.min(100, Math.round((quest.current / quest.target) * 100));

                return (
                  <div
                    key={quest.id}
                    className={`p-3 rounded-2xl border transition-all flex flex-col justify-between ${
                      isCompleted
                        ? 'bg-emerald-500/10 border-emerald-400/60 dark:bg-emerald-950/20 dark:border-emerald-700/60'
                        : darkMode
                        ? 'bg-slate-800/70 border-slate-700'
                        : 'bg-white/80 border-amber-200/80 shadow-2xs'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-base">{quest.icon}</span>
                          <span className="font-black text-xs text-slate-900 dark:text-slate-100">
                            {quest.title}
                          </span>
                        </div>
                        
                        {isCompleted ? (
                          <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                            <CheckCircle2 className="w-3 h-3" /> 已達標
                          </span>
                        ) : (
                          <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 bg-amber-100/80 dark:bg-slate-700 px-1.5 py-0.5 rounded-full">
                            +{quest.rewardStars} ⭐
                          </span>
                        )}
                      </div>

                      {/* Small Progress Bar */}
                      <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mb-1.5">
                        <div
                          className={`h-full rounded-full transition-all ${
                            isCompleted ? 'bg-emerald-500' : 'bg-amber-500'
                          }`}
                          style={{ width: `${questPercent}%` }}
                        />
                      </div>

                      {/* Advice text */}
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug line-clamp-2">
                        {quest.advice}
                      </p>
                    </div>

                    {/* Bottom Action Jump Button */}
                    {quest.actionTab && (
                      <div className="pt-2 mt-2 border-t border-amber-200/50 dark:border-slate-700 flex items-center justify-between text-[11px]">
                        <span className="font-bold text-slate-500">
                          {quest.current} / {quest.target} {quest.unit}
                        </span>

                        <button
                          type="button"
                          onClick={() => {
                            if (quest.category === 'mood' && onOpenMoodJournal) {
                              onOpenMoodJournal();
                            } else if (quest.actionTab) {
                              setActiveTab(quest.actionTab);
                            }
                            playPageTurnSound();
                          }}
                          className={`font-black text-[10px] flex items-center gap-0.5 px-2 py-0.5 rounded-lg transition-colors cursor-pointer ${
                            isCompleted
                              ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-900/40 hover:bg-emerald-200'
                              : 'text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-slate-700 hover:bg-amber-200'
                          }`}
                        >
                          <span>{quest.actionLabel || '前往'}</span>
                          <ArrowRight className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 🎉 達成目標動態貼紙收集成功彈窗 (Goal Sticker Collection Celebration Modal) */}
      {isStickerCelebrationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-amber-400 shadow-2xl animate-sticker-stamp text-center overflow-hidden">
            
            {/* Background Radiant Glow & Confetti Star Accents */}
            <div className="absolute -top-16 -left-16 w-36 h-36 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-16 -right-16 w-36 h-36 bg-emerald-400/20 rounded-full blur-2xl pointer-events-none" />
            
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsStickerCelebrationModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header Title */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 text-xs font-black mb-3 border border-amber-300 dark:border-amber-700">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-spin-slow" />
              <span>每日目標圓滿達成！</span>
            </div>

            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-1">
              🎉 恭喜獲得今日動態小貼紙！
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-5">
              已成功將今日專屬動態貼紙收集並永久存入您的「個人成就庫」與「數位貼紙冊」中！
            </p>

            {/* 3D Dynamic Stamped Sticker Card Display */}
            <div className="relative mx-auto w-48 p-4 rounded-2xl bg-gradient-to-b from-amber-50 to-orange-50/70 dark:from-slate-800 dark:to-slate-800/90 border-2 border-amber-400/80 shadow-xl mb-5 flex flex-col items-center justify-center">
              
              {/* Rotating Sparkle Ring */}
              <div className="absolute inset-0 rounded-2xl border-2 border-dashed border-amber-300 dark:border-amber-500/40 pointer-events-none animate-pulse" />

              {/* Big Animated Emoji Avatar */}
              <div className="relative mb-2">
                <div className="absolute inset-0 bg-amber-400/30 rounded-full blur-md animate-pulse" />
                <div className="relative text-5xl select-none animate-sticker-bounce filter drop-shadow-md">
                  {todayStickerPreset.emoji}
                </div>
              </div>

              {/* Sticker Name & Badge */}
              <h4 className="text-sm font-black text-slate-900 dark:text-white mb-1">
                {todayStickerPreset.name}
              </h4>
              
              <div className="flex items-center gap-1.5 mb-2">
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500 text-slate-950">
                  {todayStickerPreset.rarity}
                </span>
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                  {todayFormatted}
                </span>
              </div>

              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                {todayStickerPreset.description}
              </p>
            </div>

            {/* Star Reward Announcement Pill */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-emerald-500/10 border border-amber-300 dark:border-amber-700/60 mb-5">
              <span className="text-xl">⭐</span>
              <div className="text-left">
                <div className="text-xs font-black text-amber-950 dark:text-amber-200">
                  額外獎勵 +{todayStickerPreset.rewardStars} 顆閱讀星！
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">
                  已自動存入個人閱讀錢包資產
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setIsStickerCelebrationModalOpen(false);
                  if (onOpenAchievementWall) {
                    onOpenAchievementWall();
                  } else if (onOpenPersonalAchievements) {
                    onOpenPersonalAchievements();
                  } else {
                    setActiveTab('profile');
                  }
                  playStarChime();
                }}
                className="w-full py-2.5 px-4 rounded-xl font-black text-xs bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-slate-950 shadow-md hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Trophy className="w-4 h-4" />
                <span>前往成就庫查看</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsStickerCelebrationModalOpen(false);
                  playPageTurnSound();
                }}
                className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
              >
                太棒了，繼續共讀！
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 📖 今日已收集貼紙詳情彈窗 (Collected Sticker Detail Modal) */}
      {isStickerDetailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-sm p-5 rounded-3xl bg-white dark:bg-slate-900 border border-amber-300 dark:border-slate-700 shadow-2xl text-center">
            
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsStickerDetailModalOpen(false)}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-amber-100 dark:bg-slate-800 flex items-center justify-center text-4xl border border-amber-300 dark:border-slate-600 shadow-inner">
              {todayStickerPreset.emoji}
            </div>

            <div className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full mb-1.5">
              <CheckCircle2 className="w-3 h-3" />
              <span>今日已收藏至個人成就庫</span>
            </div>

            <h4 className="text-base font-black text-slate-900 dark:text-white mb-1">
              {todayStickerPreset.name}
            </h4>

            <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 px-2">
              {todayStickerPreset.description}
            </p>

            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-xl mb-4">
              <span>解鎖時長：{goalMinutes} 分鐘</span>
              <span>稀有度：{todayStickerPreset.rarity}</span>
              <span>獲取日期：{todayFormatted}</span>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsStickerDetailModalOpen(false);
                  if (onOpenAchievementWall) {
                    onOpenAchievementWall();
                  } else if (onOpenPersonalAchievements) {
                    onOpenPersonalAchievements();
                  } else {
                    setActiveTab('profile');
                  }
                  playStarChime();
                }}
                className="flex-1 py-2 rounded-xl text-xs font-black bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <Trophy className="w-3.5 h-3.5" />
                <span>檢視成就展示牆</span>
              </button>

              <button
                type="button"
                onClick={() => setIsStickerDetailModalOpen(false)}
                className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 cursor-pointer"
              >
                關閉
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
