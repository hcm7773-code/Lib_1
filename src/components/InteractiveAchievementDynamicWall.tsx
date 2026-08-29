import React, { useState, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  Award, Trophy, Star, Sparkles, CheckCircle2, Lock,
  Search, Filter, Volume2, X, ChevronRight, Crown,
  Pin, Share2, Eye, Flame, Shield, Sparkle, Bot,
  BookOpen, Layers, Maximize2, RefreshCw
} from 'lucide-react';
import { UserProfile, UserBadge, Book } from '../types';
import { playStarChime, playPageTurnSound, speakText } from '../utils/audio';

interface InteractiveAchievementDynamicWallProps {
  profile: UserProfile;
  books: Book[];
  onUpdateProfile?: (updated: UserProfile) => void;
  onOpenFullAchievementModal?: () => void;
  darkMode?: boolean;
}

export const InteractiveAchievementDynamicWall: React.FC<InteractiveAchievementDynamicWallProps> = ({
  profile,
  books,
  onUpdateProfile,
  onOpenFullAchievementModal,
  darkMode = false,
}) => {
  const [activeTab, setActiveTab] = useState<'badges' | 'trophies' | 'figurines'>('badges');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'reading' | 'ai' | 'vocab' | 'streak' | 'legendary'>('all');
  const [rarityFilter, setRarityFilter] = useState<'all' | '傳奇' | '史詩' | '稀有' | '普通'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBadge, setSelectedBadge] = useState<UserBadge | null>(null);
  const [pinnedBadgeId, setPinnedBadgeId] = useState<string>(profile.badges[0]?.id || '');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Character Figurines
  const figurines = useMemo(() => [
    {
      id: 'fig-prince',
      name: '小王子',
      bookTitle: '小王子與星空狐狸',
      icon: '👑',
      quote: '「只有用心才能看清一切，實質的東西用眼睛是看不見的！」',
      soundText: '哈囉！我是小王子，謝謝你陪我一起看美麗的金色麥田！',
      unlocked: profile.readBookIds.length >= 1,
      color: 'from-amber-400 to-yellow-500',
    },
    {
      id: 'fig-fox',
      name: '星空狐狸',
      bookTitle: '小王子與星空狐狸',
      icon: '🦊',
      quote: '「如果你馴服了我，我們就彼此需要了。」',
      soundText: '哇！你今天也閱讀了好多故事呢，狐狸我最喜歡有學問的小探險家了！',
      unlocked: profile.readingMinutes >= 15,
      color: 'from-orange-400 to-amber-600',
    },
    {
      id: 'fig-pig',
      name: '綠建築小豬',
      bookTitle: '三隻小豬的環保綠建築',
      icon: '🐷',
      quote: '「太陽能板與雨水回收，讓家溫暖又環保！」',
      soundText: '呼嚕嚕！我是綠建築小豬，我們的屋頂太陽能板發電超強喔！',
      unlocked: profile.stars >= 50,
      color: 'from-emerald-400 to-teal-600',
    },
    {
      id: 'fig-whale',
      name: '大翅鯨寶寶',
      bookTitle: '神奇海洋大冒險',
      icon: '🐋',
      quote: '「在大海深處唱歌，守護珊瑚礁與海龜朋友！」',
      soundText: '嗚歐～我是大翅鯨！感謝你陪我一起探索神祕的深海大世界！',
      unlocked: profile.streakDays >= 3,
      color: 'from-cyan-400 to-blue-600',
    },
    {
      id: 'fig-owl',
      name: '智者貓頭鷹博士',
      bookTitle: 'AI 智慧故事冒險',
      icon: '🦉',
      quote: '「智慧就像一盞明燈，照亮探索未知森林的每一步。」',
      soundText: '咕咕！我是貓頭鷹博士，你問的問題都非常具有洞察力喔！',
      unlocked: profile.stars >= 100,
      color: 'from-purple-400 to-indigo-600',
    },
  ], [profile]);

  // AI Trophies list
  const aiTrophies = useMemo(() => [
    {
      id: 'trophy-1',
      title: 'AI 繪本故事原創大師',
      description: '使用 AI 繪本創作工坊創作出屬於自己的第一個原創童話',
      icon: '🪄',
      tier: '鑽石',
      count: 1,
      targetCount: 1,
      unlocked: true,
      rewardStars: 30,
    },
    {
      id: 'trophy-2',
      title: '智慧百科探索狀元',
      description: '在繪本閱讀中開啟 AI 智慧問答小助手並完成 5 次探究',
      icon: '🦉',
      tier: '金牌',
      count: 5,
      targetCount: 5,
      unlocked: true,
      rewardStars: 20,
    },
    {
      id: 'trophy-3',
      title: 'AI 伴讀故事探險家',
      description: '向貓頭鷹故事小助手發問互動並探索知識',
      icon: '💬',
      tier: '銀牌',
      count: Math.min(10, (profile.readingMinutes || 0) > 20 ? 10 : 8),
      targetCount: 10,
      unlocked: (profile.readingMinutes || 0) > 20,
      rewardStars: 15,
    },
    {
      id: 'trophy-4',
      title: 'AI 雙語翻譯特使',
      description: '使用 AI 智慧翻譯解析多語系故事句型與生詞釋義',
      icon: '🌐',
      tier: '銅牌',
      count: Math.min(5, profile.readBookIds.length >= 2 ? 5 : 3),
      targetCount: 5,
      unlocked: profile.readBookIds.length >= 2,
      rewardStars: 10,
    },
  ], [profile]);

  // Filtered badges logic
  const filteredBadges = useMemo(() => {
    return profile.badges.filter((b) => {
      // Category filter
      if (categoryFilter === 'reading' && b.category !== 'reading') return false;
      if (categoryFilter === 'ai' && b.category !== 'ai') return false;
      if (categoryFilter === 'vocab' && b.category !== 'vocab') return false;
      if (categoryFilter === 'streak' && !b.name.includes('連續') && !b.name.includes('天') && !b.description.includes('天')) return false;
      if (categoryFilter === 'legendary' && b.rarity !== '傳奇') return false;

      // Rarity filter
      if (rarityFilter !== 'all' && b.rarity !== rarityFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = b.name.toLowerCase().includes(q);
        const matchDesc = b.description.toLowerCase().includes(q);
        if (!matchName && !matchDesc) return false;
      }

      return true;
    });
  }, [profile.badges, categoryFilter, rarityFilter, searchQuery]);

  const unlockedCount = profile.badges.filter((b) => b.unlocked).length;
  const totalBadges = profile.badges.length;
  const unlockPercent = Math.round((unlockedCount / totalBadges) * 100);

  const legendaryCount = profile.badges.filter((b) => b.rarity === '傳奇' && b.unlocked).length;
  const epicCount = profile.badges.filter((b) => b.rarity === '史詩' && b.unlocked).length;
  const rareCount = profile.badges.filter((b) => b.rarity === '稀有' && b.unlocked).length;

  const handleBadgeClick = (badge: UserBadge) => {
    playStarChime();
    setSelectedBadge(badge);
    if (badge.unlocked) {
      confetti({
        particleCount: 40,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#F59E0B', '#EC4899', '#8B5CF6', '#10B981', '#3B82F6'],
      });
    }
  };

  const handlePinBadge = (badge: UserBadge) => {
    playStarChime();
    setPinnedBadgeId(badge.id);
  };

  const handleSpeakBadge = (badge: UserBadge) => {
    setIsPlayingAudio(true);
    const text = `榮譽成就獎章：${badge.name}。品質等級：${badge.rarity || '普通'}。獲得條件：${badge.description}。狀態：${badge.unlocked ? '已成功解鎖並永久珍藏' : '尚未達成解鎖條件'}`;
    speakText(text, 'zh-TW', 0.95, 'teacher');
    setTimeout(() => {
      setIsPlayingAudio(false);
    }, 5000);
  };

  const pinnedBadge = profile.badges.find((b) => b.id === pinnedBadgeId) || profile.badges[0];

  return (
    <div
      id="interactive-achievement-dynamic-wall"
      className={`p-6 sm:p-8 rounded-3xl border transition-all relative overflow-hidden ${
        darkMode
          ? 'bg-gradient-to-b from-slate-900 via-purple-950/30 to-slate-900 border-amber-500/40 text-slate-100 shadow-2xl'
          : 'bg-gradient-to-b from-white via-amber-50/60 to-orange-50/80 border-amber-300 shadow-lg text-amber-950'
      }`}
    >
      {/* Dynamic Ambient Floats */}
      <div className="absolute top-0 right-10 w-80 h-80 bg-gradient-to-bl from-purple-500/10 via-amber-400/10 to-transparent rounded-full blur-3xl pointer-events-none animate-map-float-slow" />
      <div className="absolute bottom-0 left-10 w-80 h-80 bg-gradient-to-tr from-amber-400/15 via-rose-300/10 to-transparent rounded-full blur-3xl pointer-events-none animate-map-float-reverse" />

      {/* Header Bar */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between border-b pb-5 mb-6 gap-4 border-amber-200/80 dark:border-slate-800">
        <div className="flex items-center gap-3.5">
          <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-amber-500 text-white shadow-lg animate-breathing-purple">
            <Trophy className="w-6 h-6 animate-radiant-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2">
                <span>🏛️ 互動式成就動態牆</span>
              </h2>
              <span className="text-[10px] font-black bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-2.5 py-0.5 rounded-full shadow-xs animate-breathing-purple">
                ✦ 動態光效展廳
              </span>
              <span className="text-[10px] font-black bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full shadow-xs">
                已解鎖 {unlockedCount} / {totalBadges} ({unlockPercent}%)
              </span>
            </div>
            <p className={`text-xs font-semibold ${darkMode ? 'text-slate-300' : 'text-amber-900/80'}`}>
              全動態聲光獎章牆：點擊徽章觸發粒子慶祝、全息光影、成就故事語音與專屬探險家展台置頂
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap self-start md:self-auto">
          {onOpenFullAchievementModal && (
            <button
              type="button"
              onClick={onOpenFullAchievementModal}
              className="px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-slate-950 font-black text-xs shadow-md transition-transform hover:scale-105 flex items-center gap-1.5 cursor-pointer"
            >
              <Maximize2 className="w-4 h-4" />
              <span>開啟全螢幕榮譽殿堂</span>
            </button>
          )}
        </div>
      </div>

      {/* 🌟 Spotlight Pinned Badge Showcase Banner */}
      {pinnedBadge && (
        <div className="relative z-10 mb-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-purple-900/10 via-amber-500/10 to-orange-500/10 dark:from-purple-950/60 dark:to-slate-800/80 border-2 border-amber-400/80 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-100 to-yellow-100 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center text-4xl shadow-md border-2 border-amber-400 animate-breathing-gold">
                {pinnedBadge.icon}
              </div>
              <span className="absolute -top-2 -left-2 px-1.5 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[9px] font-black shadow-xs flex items-center gap-0.5">
                <Pin className="w-2.5 h-2.5 fill-current" /> 主打展出
              </span>
            </div>

            <div className="space-y-0.5 text-center sm:text-left">
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <h3 className="font-black text-base text-slate-900 dark:text-slate-100">
                  {pinnedBadge.name}
                </h3>
                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full text-white ${
                  pinnedBadge.rarity === '傳奇' ? 'bg-purple-600' : pinnedBadge.rarity === '史詩' ? 'bg-rose-500' : 'bg-blue-500'
                }`}>
                  {pinnedBadge.rarity || '稀有'}
                </span>
                {pinnedBadge.unlocked && (
                  <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                    ✓ 已永久珍藏
                  </span>
                )}
              </div>
              <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                {pinnedBadge.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSpeakBadge(pinnedBadge)}
              className="px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 dark:bg-slate-700 text-amber-950 dark:text-amber-200 text-xs font-black flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Volume2 className={`w-3.5 h-3.5 ${isPlayingAudio ? 'animate-bounce text-amber-600' : ''}`} />
              <span>語音介紹</span>
            </button>

            <button
              type="button"
              onClick={() => handleBadgeClick(pinnedBadge)}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black shadow-xs flex items-center gap-1 cursor-pointer transition-transform hover:scale-105"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>檢視詳情</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Mode Tabs & Rarity Counts */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b pb-3 border-amber-200/60 dark:border-slate-800">
        {/* Gallery Sub-tabs */}
        <div className="flex items-center gap-1.5 bg-amber-100/80 dark:bg-slate-800 p-1 rounded-2xl border border-amber-200 dark:border-slate-700 text-xs font-black">
          <button
            type="button"
            onClick={() => {
              setActiveTab('badges');
              playPageTurnSound();
            }}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'badges'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-amber-950 dark:text-slate-300 hover:bg-amber-200/60'
            }`}
          >
            🎖️ 榮譽獎章展台 ({profile.badges.length})
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('trophies');
              playPageTurnSound();
            }}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'trophies'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-amber-950 dark:text-slate-300 hover:bg-amber-200/60'
            }`}
          >
            🏆 3D 智慧獎盃櫃 ({aiTrophies.length})
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('figurines');
              playPageTurnSound();
            }}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'figurines'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-amber-950 dark:text-slate-300 hover:bg-amber-200/60'
            }`}
          >
            🧸 繪本主角公仔 ({figurines.length})
          </button>
        </div>

        {/* Rarity Pill Stats */}
        <div className="flex items-center gap-1.5 flex-wrap text-[10px] font-black">
          <span className="px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border border-purple-300">
            傳奇: {legendaryCount}
          </span>
          <span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-300">
            史詩: {epicCount}
          </span>
          <span className="px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 border border-sky-300">
            稀有: {rareCount}
          </span>
        </div>
      </div>

      {/* Tab 1: Badges View */}
      {activeTab === 'badges' && (
        <div className="space-y-4">
          {/* Filter Toolbar & Search Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {[
                { id: 'all', label: '全部' },
                { id: 'reading', label: '📖 閱讀故事' },
                { id: 'ai', label: '🪄 AI 智慧' },
                { id: 'vocab', label: '⭐ 生詞累積' },
                { id: 'streak', label: '🔥 恆毅連讀' },
                { id: 'legendary', label: '💎 傳奇限定' },
              ].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategoryFilter(c.id as any)}
                  className={`px-3 py-1 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap border ${
                    categoryFilter === c.id
                      ? 'bg-amber-600 text-white border-amber-700 shadow-2xs'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-amber-50'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="搜尋成就名稱或描述..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1 rounded-xl bg-white dark:bg-slate-800 border border-amber-300 dark:border-slate-700 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
          </div>

          {/* Badges Grid with Breathing Glow and Floating Keyframes */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5 pt-2">
            {filteredBadges.map((badge, idx) => {
              const isUnlocked = badge.unlocked;
              const isLegendary = badge.rarity === '傳奇';
              const isEpic = badge.rarity === '史詩';
              const isRare = badge.rarity === '稀有';
              const isPinned = badge.id === pinnedBadgeId;

              let glowEffect = '';
              if (isUnlocked) {
                if (isLegendary) glowEffect = 'animate-breathing-purple';
                else if (isEpic) glowEffect = 'animate-breathing-gold';
                else if (isRare) glowEffect = 'animate-breathing-cyan';
                else glowEffect = 'animate-breathing-emerald';
              }

              return (
                <div
                  key={badge.id}
                  onClick={() => handleBadgeClick(badge)}
                  className={`p-3.5 rounded-2xl border-2 text-center space-y-2 cursor-pointer transition-all duration-300 relative group overflow-hidden ${
                    isUnlocked
                      ? 'bg-gradient-to-b from-amber-50/90 to-orange-50/80 dark:from-slate-800 dark:to-slate-900 border-amber-300 dark:border-amber-500/60 shadow-sm hover:shadow-xl hover:-translate-y-1.5'
                      : 'bg-slate-50/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 opacity-60 hover:opacity-90 hover:bg-slate-100'
                  } ${isPinned ? 'ring-2 ring-amber-500 ring-offset-2' : ''}`}
                >
                  {/* Hologram Foil Shimmer on Unlocked Cards */}
                  {isUnlocked && (
                    <div className="absolute inset-0 pointer-events-none opacity-25 group-hover:opacity-50 animate-holo-shimmer" />
                  )}

                  {/* Pinned Marker */}
                  {isPinned && (
                    <span className="absolute top-1.5 left-1.5 text-amber-500">
                      <Pin className="w-3 h-3 fill-current animate-bounce" />
                    </span>
                  )}

                  {/* Sparkle Pin */}
                  {isUnlocked && (
                    <span className="absolute top-1.5 right-1.5 text-[10px] animate-star-twinkle">
                      ✨
                    </span>
                  )}

                  {/* Badge Icon with Breathing Glow Animation */}
                  <div className={`w-14 h-14 mx-auto rounded-2xl flex items-center justify-center text-3xl shadow-inner border transition-transform group-hover:scale-110 relative ${
                    isUnlocked
                      ? `bg-gradient-to-tr from-amber-100 via-yellow-100 to-orange-100 dark:from-slate-700 dark:to-slate-800 border-amber-300 dark:border-slate-600 ${glowEffect} ${
                          idx % 2 === 0 ? 'animate-badge-float-gentle' : 'animate-map-float'
                        }`
                      : 'bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700'
                  }`}>
                    {badge.icon}
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-0.5 relative z-10">
                    <div className="font-black text-xs text-slate-900 dark:text-slate-100 leading-snug truncate">
                      {badge.name}
                    </div>
                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 line-clamp-1">
                      {badge.description}
                    </p>
                  </div>

                  {/* Rarity & Status Tags */}
                  <div className="pt-1 flex items-center justify-center gap-1 flex-wrap relative z-10">
                    <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-full ${
                      isLegendary
                        ? 'bg-purple-600 text-white'
                        : isEpic
                        ? 'bg-rose-500 text-white'
                        : isRare
                        ? 'bg-sky-500 text-white'
                        : 'bg-slate-500 text-white'
                    }`}>
                      {badge.rarity || '普通'}
                    </span>

                    {isUnlocked ? (
                      <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[8px] font-black px-1.5 py-0.5 rounded-full border border-emerald-300">
                        已解鎖 ✓
                      </span>
                    ) : (
                      <span className="bg-slate-200 text-slate-600 text-[8px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                        <Lock className="w-2 h-2" /> 未解鎖
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: 3D AI Trophy Cabinet View */}
      {activeTab === 'trophies' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {aiTrophies.map((trophy) => {
            let tierColor = 'from-amber-700 to-amber-900 border-amber-500';
            if (trophy.tier === '鑽石') tierColor = 'from-cyan-500 to-blue-700 border-cyan-300';
            if (trophy.tier === '金牌') tierColor = 'from-amber-400 to-orange-600 border-amber-300';
            if (trophy.tier === '銀牌') tierColor = 'from-slate-300 to-slate-500 border-slate-200';

            return (
              <div
                key={trophy.id}
                onClick={() => {
                  playStarChime();
                  confetti({ particleCount: 30, spread: 60, origin: { y: 0.7 } });
                }}
                className={`p-5 rounded-2xl border-2 transition-all cursor-pointer space-y-3 relative group hover:scale-105 ${
                  trophy.unlocked
                    ? 'bg-gradient-to-b from-amber-900/90 to-amber-950/90 border-amber-500/80 text-amber-100 shadow-xl animate-breathing-gold'
                    : 'bg-stone-900/80 border-stone-700 text-amber-200/60 opacity-60 hover:opacity-90'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-black px-2.5 py-0.5 rounded-full text-white bg-gradient-to-r ${tierColor} shadow-2xs`}>
                    {trophy.tier}獎盃
                  </span>
                  {trophy.unlocked && <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />}
                </div>

                <div className="text-center space-y-1">
                  <div className="text-4xl py-2 transition-transform group-hover:scale-125 animate-badge-float-gentle">
                    {trophy.icon}
                  </div>
                  <h4 className="font-extrabold text-sm text-amber-100">{trophy.title}</h4>
                  <p className="text-[11px] font-bold text-amber-300/80 leading-tight">
                    {trophy.description}
                  </p>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-amber-800/60">
                  <div className="flex justify-between text-[10px] font-bold text-amber-300">
                    <span>成就進度</span>
                    <span>{trophy.count} / {trophy.targetCount}</span>
                  </div>

                  <div className="w-full h-2 bg-amber-950 rounded-full overflow-hidden border border-amber-800">
                    <div
                      className="h-full bg-amber-400 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (trophy.count / trophy.targetCount) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 3: Story Character Figurines View */}
      {activeTab === 'figurines' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {figurines.map((fig) => (
            <div
              key={fig.id}
              onClick={() => {
                playStarChime();
                speakText(fig.soundText, 'zh-TW', 0.95, 'mom');
                confetti({ particleCount: 25, spread: 50 });
              }}
              className={`p-5 rounded-2xl border-2 transition-all cursor-pointer relative group flex flex-col justify-between space-y-3 ${
                fig.unlocked
                  ? 'bg-white dark:bg-slate-800 border-amber-300 dark:border-slate-700 shadow-md hover:shadow-xl hover:-translate-y-1'
                  : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-60'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-tr ${fig.color} flex items-center justify-center text-4xl shadow-md group-hover:scale-110 transition-transform animate-badge-float-gentle`}>
                  {fig.icon}
                </div>
                <div>
                  <h4 className="font-black text-sm text-slate-900 dark:text-slate-100">{fig.name}</h4>
                  <div className="text-[11px] font-bold text-amber-700 dark:text-amber-400">📖 {fig.bookTitle}</div>
                  <span className="text-[9px] font-black text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full inline-block mt-1">
                    {fig.unlocked ? '已解鎖公仔 ✓' : '待解鎖'}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-slate-900/60 border border-amber-100 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 italic">
                {fig.quote}
              </div>

              <div className="text-[10px] font-extrabold text-amber-600 dark:text-amber-400 flex items-center justify-between">
                <span>🔊 點擊聆聽原聲對話</span>
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 🌟 Interactive Badge Detail Modal */}
      {selectedBadge && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full border-4 border-amber-400 shadow-2xl space-y-5 text-center relative">
            <button
              type="button"
              onClick={() => setSelectedBadge(null)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Glowing Big Badge Icon */}
            <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-tr from-amber-100 via-yellow-100 to-orange-100 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center text-5xl border-4 border-amber-400 shadow-xl animate-breathing-gold">
              <span className="animate-map-float">{selectedBadge.icon}</span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-center gap-1.5">
                <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 uppercase">
                  {selectedBadge.category || '故事探索'}
                </span>
                <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full text-white ${
                  selectedBadge.rarity === '傳奇' ? 'bg-purple-600' : selectedBadge.rarity === '史詩' ? 'bg-rose-500' : 'bg-blue-500'
                }`}>
                  {selectedBadge.rarity || '稀有'}獎章
                </span>
              </div>

              <h3 className="text-xl font-black text-slate-900 dark:text-slate-100">
                {selectedBadge.name}
              </h3>
              <p className="text-xs font-bold text-amber-700 dark:text-amber-400">
                {selectedBadge.description}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-slate-800 border border-amber-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 leading-relaxed text-left space-y-2">
              <div className="flex items-center justify-between text-amber-900 dark:text-amber-300 font-extrabold text-xs">
                <span>成就達成條件說明：</span>
                <button
                  type="button"
                  onClick={() => handleSpeakBadge(selectedBadge)}
                  className="px-2.5 py-1 rounded-xl bg-amber-200 hover:bg-amber-300 dark:bg-slate-700 text-amber-950 dark:text-amber-200 font-black text-[11px] flex items-center gap-1 cursor-pointer"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>語音朗讀</span>
                </button>
              </div>
              <p className="bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-xl border border-amber-100 dark:border-slate-700">
                {selectedBadge.unlockCondition || selectedBadge.description}
              </p>
            </div>

            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 px-2">
              <span>獲得狀態：{selectedBadge.unlocked ? '已成功解鎖 ✓' : '進行中 🔒'}</span>
              <span className="text-amber-600 font-black">獎勵：+10 ⭐</span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  handlePinBadge(selectedBadge);
                  setSelectedBadge(null);
                }}
                className="flex-1 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs sm:text-sm shadow-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Pin className="w-4 h-4" />
                <span>置頂為主打展出</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedBadge(null)}
                className="flex-1 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs sm:text-sm shadow-md transition-colors cursor-pointer"
              >
                關閉說明
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
