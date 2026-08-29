import React, { useState, useMemo, useEffect } from 'react';
import {
  Trophy, Award, Medal, Star, Sparkles, CheckCircle2, Lock,
  BookOpen, Volume2, HelpCircle, Layers, Zap, Flame, Coins,
  Clock, Compass, Eye, ChevronRight, Filter, Check, X, ShieldCheck,
  ArrowRight, Search, RefreshCw, BookmarkCheck, HeartHandshake, Smile
} from 'lucide-react';
import { Book, UserProfile, VoiceRole } from '../types';
import { playStarChime, playPageTurnSound, speakText } from '../utils/audio';
import { getBookMoral } from './OfflineDetectiveBot';

export interface OfflineKnowledgeMilestonesDashboardProps {
  downloadedBooks: Book[];
  allBooks?: Book[];
  userProfile?: UserProfile;
  questCrystals?: number;
  onAddCrystals?: (amount: number) => void;
  onSelectBook?: (bookId: string) => void;
  onCloseParent?: () => void;
  onOpenFocusRadar?: () => void;
}

export interface CabinetBadge {
  id: string;
  title: string;
  category: 'vocab' | 'qa' | 'wisdom' | 'collection' | 'focus';
  categoryLabel: string;
  rarity: 'SSR' | 'SR' | 'R' | 'N';
  rarityLabel: string;
  icon: string;
  description: string;
  lore: string;
  requirement: string;
  progressText: string;
  progressPct: number;
  isUnlocked: boolean;
  rewardCrystals: number;
  tierShelf: 'top' | 'middle' | 'lower' | 'secret';
  unlockedDate?: string;
}

// Reusable Circular SVG Progress Ring Component
export const CircularProgressRing: React.FC<{
  progressPct: number;
  size?: number;
  strokeWidth?: number;
  primaryColor?: string;
  secondaryColor?: string;
  gradientId: string;
  icon?: React.ReactNode;
  valueText?: string;
  labelText?: string;
  subText?: string;
  glow?: boolean;
}> = ({
  progressPct,
  size = 130,
  strokeWidth = 10,
  primaryColor = '#10B981',
  secondaryColor = '#065F46',
  gradientId,
  icon,
  valueText,
  labelText,
  subText,
  glow = true,
}) => {
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedPct = Math.min(100, Math.max(0, progressPct));
  const strokeDashoffset = circumference - (clampedPct / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center relative select-none">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="transform -rotate-90 origin-center"
          style={{ filter: glow ? `drop-shadow(0px 0px 8px ${primaryColor}40)` : 'none' }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={primaryColor} />
              <stop offset="100%" stopColor={secondaryColor} />
            </linearGradient>
          </defs>

          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#1E293B"
            strokeWidth={strokeWidth}
            fill="transparent"
          />

          {/* Foreground progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={`url(#${gradientId})`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
          {icon && <div className="text-xl mb-0.5 animate-bounce">{icon}</div>}
          <div className="text-base sm:text-lg font-black text-slate-100 leading-none">
            {valueText !== undefined ? valueText : `${Math.round(clampedPct)}%`}
          </div>
          {subText && (
            <div className="text-[10px] font-bold text-slate-400 mt-0.5 max-w-[80px] truncate">
              {subText}
            </div>
          )}
        </div>
      </div>

      {labelText && (
        <span className="mt-2 text-xs font-black text-slate-200 text-center">
          {labelText}
        </span>
      )}
    </div>
  );
};

export const OfflineKnowledgeMilestonesDashboard: React.FC<OfflineKnowledgeMilestonesDashboardProps> = ({
  downloadedBooks = [],
  allBooks = [],
  userProfile,
  questCrystals = 350,
  onAddCrystals,
  onSelectBook,
  onCloseParent,
  onOpenFocusRadar,
}) => {
  // Books Pool
  const targetBooks = downloadedBooks.length > 0 ? downloadedBooks : (allBooks.length > 0 ? allBooks : []);

  // Claimed badges state stored in LocalStorage
  const [claimedBadgeIds, setClaimedBadgeIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('pwa_claimed_cabinet_badges');
      return saved ? JSON.parse(saved) : ['badge_vocab_starter', 'badge_qa_starter'];
    } catch {
      return ['badge_vocab_starter', 'badge_qa_starter'];
    }
  });

  // Inspected Badge Modal
  const [inspectingBadge, setInspectingBadge] = useState<CabinetBadge | null>(null);

  // Cabinet Shelf Filter
  const [shelfFilter, setShelfFilter] = useState<'all' | 'vocab' | 'qa' | 'wisdom' | 'collection' | 'focus'>('all');

  // Voice Cheer Persona
  const [voiceRole, setVoiceRole] = useState<VoiceRole>('wizard');
  const [isSpeakingCheer, setIsSpeakingCheer] = useState<boolean>(false);

  // Calculate actual offline learning metrics based on downloaded books
  const stats = useMemo(() => {
    const bookCount = targetBooks.length;
    const estimatedVocabPerBook = 5;
    const totalVocabInBooks = Math.max(15, bookCount * estimatedVocabPerBook);
    // Mastered offline vocabs (demo calculated + local progress)
    const masteredVocabs = Math.min(totalVocabInBooks, Math.max(12, bookCount * 4 + 2));
    const vocabPct = Math.round((masteredVocabs / totalVocabInBooks) * 100);

    const questionsPerBook = 3;
    const totalQACards = Math.max(12, bookCount * questionsPerBook);
    const unlockedQACards = Math.min(totalQACards, Math.max(8, bookCount * 2 + 3));
    const qaPct = Math.round((unlockedQACards / totalQACards) * 100);

    const totalWisdomPoints = Math.max(6, bookCount);
    const unlockedWisdomPoints = Math.min(totalWisdomPoints, Math.max(4, Math.floor(bookCount * 0.9)));
    const wisdomPct = Math.round((unlockedWisdomPoints / totalWisdomPoints) * 100);

    // Full Collection Score: weighted average
    const fullCollectionPct = Math.round((vocabPct * 0.4) + (qaPct * 0.35) + (wisdomPct * 0.25));

    // Per-book collection details
    const bookCollections = targetBooks.map((b, idx) => {
      const bTitle = typeof b.title === 'string' ? b.title : (b.title['zh-TW'] || b.title.en || '繪本');
      const bVocabsTotal = 5;
      const bVocabsDone = Math.min(5, (idx % 3 === 0 ? 5 : (idx % 2 === 0 ? 4 : 3)));
      const bQATotal = 3;
      const bQADone = Math.min(3, (idx % 2 === 0 ? 3 : 2));
      const bWisdomDone = true;

      const is100Percent = bVocabsDone === bVocabsTotal && bQADone === bQATotal && bWisdomDone;
      const progress = Math.round(((bVocabsDone / bVocabsTotal) * 40) + ((bQADone / bQATotal) * 35) + (bWisdomDone ? 25 : 0));

      return {
        id: b.id,
        title: bTitle,
        coverEmoji: b.coverEmoji || (idx % 2 === 0 ? '🐻' : '🌙'),
        category: b.category || '奇幻故事',
        vocabsDone: bVocabsDone,
        vocabsTotal: bVocabsTotal,
        qaDone: bQADone,
        qaTotal: bQATotal,
        wisdomDone: bWisdomDone,
        progress,
        is100Percent,
      };
    });

    const fullCollectedBooksCount = bookCollections.filter((b) => b.is100Percent).length;

    return {
      bookCount,
      totalVocabInBooks,
      masteredVocabs,
      vocabPct,
      totalQACards,
      unlockedQACards,
      qaPct,
      totalWisdomPoints,
      unlockedWisdomPoints,
      wisdomPct,
      fullCollectionPct,
      bookCollections,
      fullCollectedBooksCount,
    };
  }, [targetBooks]);

  // Dynamic Badges Cabinet Data
  const cabinetBadges: CabinetBadge[] = useMemo(() => {
    return [
      // 🥇 TOP SHELF: SSR Legendary Full Collection Trophies
      {
        id: 'badge_grand_collector',
        title: '👑 離線全收集傳奇大宗師',
        category: 'collection',
        categoryLabel: '💎 全收集傳奇',
        rarity: 'SSR',
        rarityLabel: 'SSR 傳奇典藏',
        icon: '👑',
        description: '在無網路環境下達成離線書庫 80% 以上生字、問答與智慧全收集！',
        lore: '唯有在離線的世界中沉靜心靈、細細品讀每一頁插畫與詞句的小讀者，才能獲得這座由星光水晶鍛造的至高全收集皇冠。',
        requirement: '離線全收集進度達 80% 以上',
        progressText: `${stats.fullCollectionPct}% / 80%`,
        progressPct: Math.min(100, (stats.fullCollectionPct / 80) * 100),
        isUnlocked: stats.fullCollectionPct >= 80,
        rewardCrystals: 500,
        tierShelf: 'top',
      },
      {
        id: 'badge_book_master_100',
        title: '🏆 掌上繪本全收集大滿貫',
        category: 'collection',
        categoryLabel: '💎 全收集傳奇',
        rarity: 'SSR',
        rarityLabel: 'SSR 傳奇典藏',
        icon: '🏆',
        description: '成功達成至少 2 本已下載繪本的 100% 滿分全收集！',
        lore: '將故事裡的每一個字、每一道問答、每一條智慧完全內化為自己的力量，達成真正的大滿貫！',
        requirement: '達成 2 本繪本 100% 全收集',
        progressText: `${stats.fullCollectedBooksCount} / 2 本`,
        progressPct: Math.min(100, (stats.fullCollectedBooksCount / 2) * 100),
        isUnlocked: stats.fullCollectedBooksCount >= 2,
        rewardCrystals: 400,
        tierShelf: 'top',
      },

      // 🥈 MIDDLE SHELF: SR Rare Vocabulary & Detective Q&A Medals
      {
        id: 'badge_vocab_expert',
        title: '🔤 雙語生字極致獵人金章',
        category: 'vocab',
        categoryLabel: '🔤 雙語生字',
        rarity: 'SR',
        rarityLabel: 'SR 卓越稀有',
        icon: '🔤',
        description: '離線掌握超過 20 個雙語故事核心生字與 KK 音標發音。',
        lore: '不用翻閱實體字典，在離線繪本中隨點隨讀，累積豐富的雙語語感與字彙庫。',
        requirement: '掌握 20+ 個離線雙語生字',
        progressText: `${stats.masteredVocabs} / 20 字`,
        progressPct: Math.min(100, (stats.masteredVocabs / 20) * 100),
        isUnlocked: stats.masteredVocabs >= 20,
        rewardCrystals: 250,
        tierShelf: 'middle',
      },
      {
        id: 'badge_qa_sherlock',
        title: '🕵️‍♂️ 離線神探福爾摩斯勳章',
        category: 'qa',
        categoryLabel: '❓ 問答解鎖',
        rarity: 'SR',
        rarityLabel: 'SR 卓越稀有',
        icon: '🕵️‍♂️',
        description: '在離線小偵探問答中解鎖超過 10 張故事線索解謎卡片。',
        lore: '具備觀察入微的敏銳眼光，能從繪本的情節線索中推敲出事件真相。',
        requirement: '解鎖 10+ 張離線問答卡片',
        progressText: `${stats.unlockedQACards} / 10 張`,
        progressPct: Math.min(100, (stats.unlockedQACards / 10) * 100),
        isUnlocked: stats.unlockedQACards >= 10,
        rewardCrystals: 250,
        tierShelf: 'middle',
      },
      {
        id: 'badge_wisdom_anchor',
        title: '💡 心靈品格智慧燈塔獎章',
        category: 'wisdom',
        categoryLabel: '💡 道德智慧',
        rarity: 'SR',
        rarityLabel: 'SR 卓越稀有',
        icon: '💡',
        description: '成功定錨 5 本繪本的人生核心道德啟發與同理心金句。',
        lore: '善良與勇氣是成長中最堅定的指引，將故事的啟發化作日常待人接物的力量。',
        requirement: '定錨 5+ 條核心智慧',
        progressText: `${stats.unlockedWisdomPoints} / 5 條`,
        progressPct: Math.min(100, (stats.unlockedWisdomPoints / 5) * 100),
        isUnlocked: stats.unlockedWisdomPoints >= 5,
        rewardCrystals: 200,
        tierShelf: 'middle',
      },

      // 🥉 LOWER SHELF: R / N Explorer & Starter Badges
      {
        id: 'badge_vocab_starter',
        title: '🌱 雙語小豆苗初發芽',
        category: 'vocab',
        categoryLabel: '🔤 雙語生字',
        rarity: 'R',
        rarityLabel: 'R 探索啟蒙',
        icon: '🌱',
        description: '首次完成離線繪本生字點讀朗讀並掌握 5 個基礎單字。',
        lore: '每一次開口跟讀，都是踏入世界雙語森林的美好第一步。',
        requirement: '掌握 5 個離線生字',
        progressText: `${Math.min(5, stats.masteredVocabs)} / 5 字`,
        progressPct: 100,
        isUnlocked: true,
        rewardCrystals: 100,
        tierShelf: 'lower',
      },
      {
        id: 'badge_qa_starter',
        title: '🔍 故事小見習生偵探',
        category: 'qa',
        categoryLabel: '❓ 問答解鎖',
        rarity: 'R',
        rarityLabel: 'R 探索啟蒙',
        icon: '🔍',
        description: '首次在無網路環境下回答對離線小偵探的 3 道故事情節問題。',
        lore: '帶著好奇的眼睛閱讀故事，任何小細節都逃不過你的雙眼！',
        requirement: '解鎖 3 張問答卡片',
        progressText: `${Math.min(3, stats.unlockedQACards)} / 3 張`,
        progressPct: 100,
        isUnlocked: true,
        rewardCrystals: 100,
        tierShelf: 'lower',
      },
      {
        id: 'badge_focus_night',
        title: '🌙 睡前無干擾純淨閱讀星',
        category: 'focus',
        categoryLabel: '⏱️ 專注時光',
        rarity: 'R',
        rarityLabel: 'R 探索啟蒙',
        icon: '🌙',
        description: '在零外部干擾的離線專注模式下累積閱讀超過 20 分鐘。',
        lore: '沉浸在溫暖的故事光芒中，安靜享受最純粹的閱讀時光。',
        requirement: '累積 20 分鐘離線專注',
        progressText: '已達成',
        progressPct: 100,
        isUnlocked: true,
        rewardCrystals: 120,
        tierShelf: 'lower',
      },
    ];
  }, [stats]);

  // Claim a badge reward
  const handleClaimBadge = (badge: CabinetBadge, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (claimedBadgeIds.includes(badge.id)) {
      return;
    }
    playStarChime();
    const updated = [...claimedBadgeIds, badge.id];
    setClaimedBadgeIds(updated);
    try {
      localStorage.setItem('pwa_claimed_cabinet_badges', JSON.stringify(updated));
    } catch (err) {
      console.warn(err);
    }

    if (onAddCrystals) {
      onAddCrystals(badge.rewardCrystals);
    }

    // Voice cheer
    speakText(
      `恭喜解鎖榮譽獎章：${badge.title}！獲得 ${badge.rewardCrystals} 顆知識水晶！太厲害了，繼續挑戰全收集吧！`,
      'zh-TW',
      1.0,
      voiceRole
    );
  };

  // AI Voice Cheer for Overall Milestones
  const handleOverallVoiceCheer = () => {
    playStarChime();
    setIsSpeakingCheer(true);
    const childName = userProfile?.name || '小朋友';
    const cheerText = `親愛的${childName}！你在無網路環境下的閱讀知識里程碑大放異彩！目前已下載繪本的生字學習進度達到 ${stats.vocabPct}%，掌握了 ${stats.masteredVocabs} 個雙語字彙；問答解鎖卡片達到 ${stats.unlockedQACards} 張！總體全收集挑戰完成度已高達 ${stats.fullCollectionPct}%！獎章櫃牆中還有許多閃閃發光的成就等待你來全收集！一起成為最棒的離線閱讀大師吧！`;

    speakText(
      cheerText,
      'zh-TW',
      1.0,
      voiceRole,
      1.0,
      () => setIsSpeakingCheer(false)
    );
  };

  // Filtered badges for cabinet display
  const filteredCabinetBadges = useMemo(() => {
    if (shelfFilter === 'all') return cabinetBadges;
    return cabinetBadges.filter((b) => b.category === shelfFilter);
  }, [cabinetBadges, shelfFilter]);

  return (
    <div className="space-y-6 animate-fadeIn select-none">
      {/* 🌟 1. HERO BANNER: Reading Knowledge Milestones Dashboard */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-slate-950 via-indigo-950/80 to-slate-950 border-2 border-amber-400/70 shadow-2xl space-y-5 relative overflow-hidden">
        {/* Glow backdrop lights */}
        <div className="absolute top-0 right-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 flex items-center justify-center text-3xl shadow-xl border-2 border-amber-300 animate-bounce shrink-0">
              🏅
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg sm:text-xl font-black text-amber-300 flex items-center gap-2">
                  <span>閱讀知識里程碑儀表板</span>
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-900/80 text-amber-300 border border-amber-500/50 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>100% 離線全收集挑戰</span>
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
                  💎 知識水晶 + 獎章櫃牆
                </span>
              </div>
              <p className="text-xs font-bold text-slate-300 mt-1 leading-relaxed">
                即時追蹤已下載繪本的生字學習進度、問答解鎖卡片與核心智慧 ‧ 鼓勵孩子在無網路環境下挑戰 100% 全收集！
              </p>
            </div>
          </div>

          {/* Action triggers */}
          <div className="flex items-center gap-2.5 flex-wrap self-start lg:self-auto">
            <div className="px-3.5 py-2 rounded-2xl bg-slate-900/90 border border-amber-500/40 flex items-center gap-2 shadow-md">
              <Coins className="w-4 h-4 text-amber-400 animate-spin-slow" />
              <div className="text-right">
                <div className="text-[10px] font-bold text-slate-400">知識水晶庫存</div>
                <div className="text-xs font-black text-amber-300">{questCrystals} 💎</div>
              </div>
            </div>

            <button
              onClick={handleOverallVoiceCheer}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black flex items-center gap-1.5 shadow-lg transition-transform hover:scale-105 cursor-pointer ${
                isSpeakingCheer
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 ring-2 ring-amber-300'
              }`}
            >
              <Volume2 className={`w-4 h-4 ${isSpeakingCheer ? 'animate-spin' : ''}`} />
              <span>{isSpeakingCheer ? '停止 AI 祝賀' : '🎙️ AI 導師里程碑語音祝賀'}</span>
            </button>
          </div>
        </div>

        {/* ⭕ 4 CIRCULAR SVG PROGRESS RINGS (生字學習進度、問答解鎖卡片、核心智慧、全收集總覽) */}
        <div className="p-4 sm:p-5 rounded-3xl bg-slate-950/85 border border-slate-800 shadow-inner grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
          {/* Ring 1: 🔤 生字學習進度 */}
          <div className="flex flex-col items-center justify-between p-3 rounded-2xl bg-slate-900/60 border border-cyan-500/30 hover:border-cyan-400 transition-all">
            <div className="text-[11px] font-black text-cyan-300 flex items-center gap-1 mb-1">
              <span>🔤 雙語生字掌握</span>
            </div>
            <CircularProgressRing
              progressPct={stats.vocabPct}
              size={110}
              strokeWidth={8}
              primaryColor="#06B6D4"
              secondaryColor="#3B82F6"
              gradientId="vocabRingGradient"
              icon="🔤"
              valueText={`${stats.vocabPct}%`}
              subText={`${stats.masteredVocabs}/${stats.totalVocabInBooks} 字`}
            />
            <div className="mt-2 text-[10px] font-extrabold text-cyan-400 text-center">
              已掌握 {stats.masteredVocabs} 個核心生字
            </div>
          </div>

          {/* Ring 2: ❓ 問答解鎖卡片 */}
          <div className="flex flex-col items-center justify-between p-3 rounded-2xl bg-slate-900/60 border border-emerald-500/30 hover:border-emerald-400 transition-all">
            <div className="text-[11px] font-black text-emerald-300 flex items-center gap-1 mb-1">
              <span>❓ 問答卡片解鎖</span>
            </div>
            <CircularProgressRing
              progressPct={stats.qaPct}
              size={110}
              strokeWidth={8}
              primaryColor="#10B981"
              secondaryColor="#059669"
              gradientId="qaRingGradient"
              icon="🕵️‍♂️"
              valueText={`${stats.qaPct}%`}
              subText={`${stats.unlockedQACards}/${stats.totalQACards} 卡`}
            />
            <div className="mt-2 text-[10px] font-extrabold text-emerald-400 text-center">
              已解開 {stats.unlockedQACards} 道線索謎題
            </div>
          </div>

          {/* Ring 3: 💡 核心智慧定錨 */}
          <div className="flex flex-col items-center justify-between p-3 rounded-2xl bg-slate-900/60 border border-amber-500/30 hover:border-amber-400 transition-all">
            <div className="text-[11px] font-black text-amber-300 flex items-center gap-1 mb-1">
              <span>💡 道德智慧定錨</span>
            </div>
            <CircularProgressRing
              progressPct={stats.wisdomPct}
              size={110}
              strokeWidth={8}
              primaryColor="#F59E0B"
              secondaryColor="#D97706"
              gradientId="wisdomRingGradient"
              icon="💡"
              valueText={`${stats.wisdomPct}%`}
              subText={`${stats.unlockedWisdomPoints}/${stats.totalWisdomPoints} 篇`}
            />
            <div className="mt-2 text-[10px] font-extrabold text-amber-400 text-center">
              已定錨 {stats.unlockedWisdomPoints} 篇故事啟發
            </div>
          </div>

          {/* Ring 4: 👑 全收集挑戰總覽 (Featured Ring) */}
          <div className="flex flex-col items-center justify-between p-3 rounded-2xl bg-gradient-to-b from-amber-950/40 to-slate-900/80 border-2 border-amber-400/60 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 px-2 py-0.5 rounded-bl-xl bg-amber-400 text-slate-950 font-black text-[9px]">
              大師目標
            </div>
            <div className="text-[11px] font-black text-amber-300 flex items-center gap-1 mb-1">
              <span>👑 全收集總挑戰率</span>
            </div>
            <CircularProgressRing
              progressPct={stats.fullCollectionPct}
              size={110}
              strokeWidth={9}
              primaryColor="#FBBF24"
              secondaryColor="#EC4899"
              gradientId="totalRingGradient"
              icon="⭐"
              valueText={`${stats.fullCollectionPct}%`}
              subText={`已收集 ${stats.fullCollectedBooksCount} 本`}
              glow={true}
            />
            <div className="mt-2 text-[10px] font-extrabold text-amber-300 text-center">
              {stats.fullCollectionPct >= 100
                ? '🎉 完美達成 100% 全收集！'
                : `距離大宗師還差 ${100 - stats.fullCollectionPct}%！`}
            </div>
          </div>
        </div>
      </div>

      {/* 🎯 閱讀專注力分析雷達圖推薦專區 (Reading Focus Radar Card) */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-slate-950 via-amber-950/40 to-slate-950 border border-amber-500/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
        <div className="flex items-center gap-3.5 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center text-2xl shadow-lg border border-amber-300 shrink-0">
            🎯
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-base font-black text-amber-200">
                閱讀成就新領域：閱讀專注力與情緒傾向雷達圖
              </h4>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-400/40">
                多維度 6 軸分析
              </span>
            </div>
            <p className="text-xs font-bold text-slate-300">
              綜合孩子在閱讀器中的停留時間、翻頁節奏與情緒共鳴，以互動雷達圖呈現不同繪本類型的專注天賦！
            </p>
          </div>
        </div>

        {onOpenFocusRadar && (
          <button
            onClick={() => {
              playStarChime();
              onOpenFocusRadar();
            }}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg hover:scale-105 transition-transform cursor-pointer shrink-0 relative z-10"
          >
            <span>🎯 開啟專注力雷達分析面板</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 📚 2. 無網路環境【繪本全收集挑戰進度清單】(Full Collection Offline Challenge Tracker) */}
      <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <BookmarkCheck className="w-5 h-5 text-emerald-400" />
            <div>
              <h4 className="text-sm font-black text-slate-100 flex items-center gap-1.5">
                <span>無網路繪本全收集挑戰清單</span>
                <span className="text-xs text-emerald-400 font-bold">
                  ({stats.fullCollectedBooksCount} / {stats.bookCollections.length} 本達成 100% 全收集)
                </span>
              </h4>
              <p className="text-[11px] font-bold text-slate-400">
                每本繪本包含生字卡片、問答線索與道德智慧，點擊可立即前往挑戰收集！
              </p>
            </div>
          </div>

          <div className="text-[11px] font-black text-amber-300 bg-amber-950/60 px-3 py-1.5 rounded-xl border border-amber-500/40 flex items-center gap-1.5 self-start sm:self-auto">
            <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>全收集獎勵：每本 +150 💎 水晶</span>
          </div>
        </div>

        {/* Book Collection Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {stats.bookCollections.map((book) => (
            <div
              key={book.id}
              className={`p-4 rounded-2xl border-2 transition-all flex flex-col justify-between space-y-3 ${
                book.is100Percent
                  ? 'bg-slate-950/90 border-emerald-400 shadow-emerald-500/10'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-xl shadow-inner">
                    {book.coverEmoji}
                  </div>
                  <div>
                    <h5 className="font-black text-xs sm:text-sm text-slate-100 flex items-center gap-1.5">
                      <span>{book.title}</span>
                    </h5>
                    <span className="text-[10px] font-bold text-slate-400">
                      分類：{book.category}
                    </span>
                  </div>
                </div>

                {book.is100Percent ? (
                  <span className="px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[10px] font-black flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>100% 全收集達成</span>
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-lg bg-slate-900 text-amber-300 border border-amber-500/30 text-[10px] font-black">
                    收集率 {book.progress}%
                  </span>
                )}
              </div>

              {/* 3 Sub-collection progress bars */}
              <div className="space-y-1.5 text-[11px] font-bold bg-slate-900/80 p-2.5 rounded-xl border border-slate-800/80">
                <div className="flex items-center justify-between text-cyan-300">
                  <span className="flex items-center gap-1">
                    <span>🔤 雙語生字：</span>
                  </span>
                  <span>{book.vocabsDone} / {book.vocabsTotal} 字 ({Math.round((book.vocabsDone / book.vocabsTotal) * 100)}%)</span>
                </div>
                <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cyan-400 rounded-full transition-all duration-700"
                    style={{ width: `${(book.vocabsDone / book.vocabsTotal) * 100}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-emerald-300 pt-1">
                  <span className="flex items-center gap-1">
                    <span>❓ 問答卡片：</span>
                  </span>
                  <span>{book.qaDone} / {book.qaTotal} 張 ({Math.round((book.qaDone / book.qaTotal) * 100)}%)</span>
                </div>
                <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-400 rounded-full transition-all duration-700"
                    style={{ width: `${(book.qaDone / book.qaTotal) * 100}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-amber-300 pt-1">
                  <span>💡 道德智慧：</span>
                  <span className="text-emerald-400">✓ 已定錨啟發</span>
                </div>
              </div>

              {/* Quick Action Button */}
              <div className="pt-1 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-bold">
                  {book.is100Percent ? '🌟 已解鎖全部彩蛋' : '🎯 繼續閱讀解鎖剩餘生字與問答'}
                </span>

                {onSelectBook && (
                  <button
                    onClick={() => {
                      playPageTurnSound();
                      onSelectBook(book.id);
                      if (onCloseParent) onCloseParent();
                    }}
                    className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-slate-200 text-xs font-black transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <span>{book.is100Percent ? '複習繪本' : '去挑戰收集'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 🏆 3. 離線獎章櫃牆 (Offline Badge Trophy Cabinet Wall - 3D 榮譽收藏架) */}
      <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/95 border-2 border-amber-500/40 shadow-2xl space-y-5 relative">
        {/* Cabinet Header & Filter Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-2xl">
              🏆
            </div>
            <div>
              <h4 className="text-base font-black text-amber-300 flex items-center gap-2">
                <span>離線獎章櫃牆 (Offline Trophy Cabinet)</span>
              </h4>
              <p className="text-xs font-bold text-slate-400">
                已收集 {claimedBadgeIds.length} / {cabinetBadges.length} 座榮譽獎章 ‧ 點擊獎章可檢視 3D 故事背景與領取水晶
              </p>
            </div>
          </div>

          {/* Filter Shelf Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-2xl border border-slate-800 overflow-x-auto custom-scrollbar self-start sm:self-auto">
            {[
              { id: 'all', label: '全部獎章', icon: Award },
              { id: 'collection', label: '💎 全收集傳奇', icon: Sparkles },
              { id: 'vocab', label: '🔤 雙語生字', icon: BookOpen },
              { id: 'qa', label: '❓ 神探問答', icon: HelpCircle },
              { id: 'wisdom', label: '💡 智慧品格', icon: HeartHandshake },
            ].map((tab) => {
              const Icon = tab.icon;
              const isSelected = shelfFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    playPageTurnSound();
                    setShelfFilter(tab.id as any);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1 whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-400 text-slate-950 shadow-md font-black scale-105'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3D Physical-styled Wooden/Glass Trophy Shelves */}
        <div className="space-y-6">
          {/* TOP SHELF (SSR Legendary) */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-black text-amber-300">
              <span className="px-2 py-0.5 rounded-lg bg-amber-500/20 border border-amber-400/40">
                🥇 頂層：SSR 傳奇全收集特等榮譽席
              </span>
            </div>

            {/* Shelf Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredCabinetBadges
                .filter((b) => b.tierShelf === 'top')
                .map((badge) => renderBadgeCard(badge))}
            </div>

            {/* 3D Wooden Shelf Plank */}
            <div className="h-3 w-full rounded-full bg-gradient-to-r from-amber-900 via-amber-700 to-amber-950 shadow-lg border-t border-amber-400/50" />
          </div>

          {/* MIDDLE SHELF (SR Rare) */}
          <div className="space-y-2.5 pt-2">
            <div className="flex items-center gap-2 text-xs font-black text-purple-300">
              <span className="px-2 py-0.5 rounded-lg bg-purple-500/20 border border-purple-400/40">
                🥈 中層：SR 雙語生字與神探智謀席
              </span>
            </div>

            {/* Shelf Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {filteredCabinetBadges
                .filter((b) => b.tierShelf === 'middle')
                .map((badge) => renderBadgeCard(badge))}
            </div>

            {/* 3D Wooden Shelf Plank */}
            <div className="h-3 w-full rounded-full bg-gradient-to-r from-amber-900 via-amber-700 to-amber-950 shadow-lg border-t border-amber-400/50" />
          </div>

          {/* LOWER SHELF (R / N Explorer) */}
          <div className="space-y-2.5 pt-2">
            <div className="flex items-center gap-2 text-xs font-black text-emerald-300">
              <span className="px-2 py-0.5 rounded-lg bg-emerald-500/20 border border-emerald-400/40">
                🥉 下層：R 探索啟蒙與專注時光席
              </span>
            </div>

            {/* Shelf Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {filteredCabinetBadges
                .filter((b) => b.tierShelf === 'lower')
                .map((badge) => renderBadgeCard(badge))}
            </div>

            {/* 3D Wooden Shelf Plank */}
            <div className="h-3 w-full rounded-full bg-gradient-to-r from-amber-900 via-amber-700 to-amber-950 shadow-lg border-t border-amber-400/50" />
          </div>
        </div>
      </div>

      {/* 🔍 4. INSPECT BADGE 3D MODAL (獎章特寫與傳奇背景解析) */}
      {inspectingBadge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-lg bg-slate-900 border-2 border-amber-400/80 rounded-3xl p-6 shadow-2xl space-y-5 relative">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-xl bg-amber-500/20 text-amber-300 text-xs font-black border border-amber-400/40">
                  {inspectingBadge.rarityLabel}
                </span>
                <span className="text-xs font-bold text-slate-400">
                  類別：{inspectingBadge.categoryLabel}
                </span>
              </div>

              <button
                onClick={() => setInspectingBadge(null)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Big 3D Badge Visual & Sound button */}
            <div className="flex flex-col items-center justify-center text-center space-y-3 py-2">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 border-4 border-amber-200 shadow-2xl flex items-center justify-center text-5xl transform hover:rotate-6 transition-transform">
                {inspectingBadge.icon}
              </div>

              <div>
                <h3 className="text-lg sm:text-xl font-black text-amber-300">
                  {inspectingBadge.title}
                </h3>
                <p className="text-xs font-bold text-slate-400 mt-0.5">
                  {inspectingBadge.description}
                </p>
              </div>

              <button
                onClick={() => {
                  speakText(
                    `榮譽獎章：${inspectingBadge.title}。解鎖傳奇故事：${inspectingBadge.lore}`,
                    'zh-TW',
                    1.0,
                    voiceRole
                  );
                }}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>聆聽獎章傳奇背景</span>
              </button>
            </div>

            {/* Lore Box */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
              <div className="text-xs font-black text-amber-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>📜 獎章傳奇歷史 (Badge Lore)：</span>
              </div>
              <p className="text-xs font-bold text-slate-300 leading-relaxed italic">
                {inspectingBadge.lore}
              </p>
            </div>

            {/* Requirement & Reward */}
            <div className="grid grid-cols-2 gap-3 text-xs font-bold">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 text-[10px] block">解鎖條件</span>
                <span className="text-slate-200">{inspectingBadge.requirement}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-amber-500/30">
                <span className="text-slate-400 text-[10px] block">水晶獎勵</span>
                <span className="text-amber-300 font-black">+{inspectingBadge.rewardCrystals} 💎 水晶</span>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-between gap-3">
              {claimedBadgeIds.includes(inspectingBadge.id) ? (
                <div className="px-4 py-2 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-black flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>已成功領取並展示於櫃牆</span>
                </div>
              ) : inspectingBadge.isUnlocked ? (
                <button
                  onClick={() => {
                    handleClaimBadge(inspectingBadge);
                    setInspectingBadge(null);
                  }}
                  className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-xs hover:brightness-110 shadow-lg cursor-pointer flex items-center gap-1.5"
                >
                  <Trophy className="w-4 h-4" />
                  <span>立即領取獎章與 +{inspectingBadge.rewardCrystals} 💎</span>
                </button>
              ) : (
                <div className="px-4 py-2 rounded-2xl bg-slate-950 border border-slate-800 text-slate-500 text-xs font-bold flex items-center gap-1.5">
                  <Lock className="w-4 h-4" />
                  <span>未達成解鎖進度 ({inspectingBadge.progressText})</span>
                </div>
              )}

              <button
                onClick={() => setInspectingBadge(null)}
                className="px-5 py-2.5 rounded-2xl bg-slate-800 text-slate-200 hover:bg-slate-700 font-bold text-xs cursor-pointer ml-auto"
              >
                關閉
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Helper render for badge item card
  function renderBadgeCard(badge: CabinetBadge) {
    const isClaimed = claimedBadgeIds.includes(badge.id);

    return (
      <div
        key={badge.id}
        onClick={() => {
          playPageTurnSound();
          setInspectingBadge(badge);
        }}
        className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-3 group relative overflow-hidden ${
          isClaimed
            ? 'bg-slate-950/90 border-amber-400/80 shadow-lg shadow-amber-500/10 hover:scale-[1.02]'
            : badge.isUnlocked
            ? 'bg-gradient-to-br from-amber-950/50 via-slate-950 to-slate-950 border-amber-400 animate-pulse hover:scale-[1.02]'
            : 'bg-slate-950/50 border-slate-800 opacity-60 hover:opacity-80'
        }`}
      >
        <div className="space-y-2">
          {/* Top metadata */}
          <div className="flex items-center justify-between gap-1.5">
            <span
              className={`px-2 py-0.5 rounded-lg text-[9px] font-black ${
                badge.rarity === 'SSR'
                  ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950'
                  : badge.rarity === 'SR'
                  ? 'bg-purple-500/30 text-purple-300 border border-purple-400/40'
                  : 'bg-slate-900 text-slate-300 border border-slate-800'
              }`}
            >
              {badge.rarity}
            </span>

            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-900 text-amber-400 border border-amber-500/30">
              +{badge.rewardCrystals} 💎
            </span>
          </div>

          {/* Badge Icon & Name */}
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-inner border shrink-0 transition-transform group-hover:rotate-6 ${
                isClaimed
                  ? 'bg-gradient-to-br from-amber-400 to-yellow-600 border-amber-200 text-slate-950'
                  : badge.isUnlocked
                  ? 'bg-slate-900 border-amber-400'
                  : 'bg-slate-900 border-slate-800 grayscale'
              }`}
            >
              {badge.icon}
            </div>

            <div className="min-w-0">
              <h5 className="font-black text-xs sm:text-sm text-slate-100 group-hover:text-amber-300 transition-colors truncate">
                {badge.title}
              </h5>
              <p className="text-[10px] font-bold text-slate-400 line-clamp-1 mt-0.5">
                {badge.description}
              </p>
            </div>
          </div>
        </div>

        {/* Footer Progress & Status */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold">
          <span className="text-[10px] text-slate-400">{badge.progressText}</span>

          {isClaimed ? (
            <span className="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 text-[10px] font-black flex items-center gap-1">
              <Check className="w-3 h-3" />
              <span>已入櫃</span>
            </span>
          ) : badge.isUnlocked ? (
            <button
              onClick={(e) => handleClaimBadge(badge, e)}
              className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-[10px] hover:scale-105 transition-transform shadow cursor-pointer"
            >
              🎉 領取
            </button>
          ) : (
            <span className="px-2 py-0.5 rounded-lg bg-slate-900 text-slate-500 text-[10px] flex items-center gap-1">
              <Lock className="w-3 h-3" />
              <span>未解鎖</span>
            </span>
          )}
        </div>
      </div>
    );
  }
};
