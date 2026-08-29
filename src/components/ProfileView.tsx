import React, { useState, useEffect } from 'react';
import {
  Award, Star, BookOpen, Clock, Heart, Sparkles, CheckCircle2, User,
  Flame, TrendingUp, Play, Pause, RotateCcw, ChevronRight, History, Target, Bot, Lock,
  HelpCircle, Volume2, X, ShieldCheck, Trophy, Sparkle, FileText, HardDrive, Wifi,
  Crown, Gift, Zap, Bell, VolumeX, Music, Layers, Plus, Palette, FolderPlus, CloudRain,
  TreePine, Waves, Share2, Compass
} from 'lucide-react';
import { UserProfile, Book, ReadingLogEntry, UserBadge, DailyQuest, AITrophy, CollectibleItem } from '../types';
import { playStarChime, speakText } from '../utils/audio';
import { DailyGoalRing } from './DailyGoalRing';
import { INITIAL_DEFAULT_COLLECTIBLES } from '../data/collectibles';
import { ReadingSocialWall } from './ReadingSocialWall';
import { AchievementLeaderboard } from './AchievementLeaderboard';
import { AnnualReadingRecapModal } from './AnnualReadingRecapModal';
import { ReadingAdventureMap } from './ReadingAdventureMap';
import { VoiceReadingTimer } from './VoiceReadingTimer';
import { ReadingFocusD3Chart } from './ReadingFocusD3Chart';
import { LearningMilestoneMap } from './LearningMilestoneMap';
import { SmartReadingReminderCard } from './SmartReadingReminderCard';
import { InteractiveAchievementDynamicWall } from './InteractiveAchievementDynamicWall';
import { ReadingNotesExportModal } from './ReadingNotesExportModal';
import { ReadingMoodHeatmapChart } from './ReadingMoodHeatmapChart';
import { TodayLearningChallengeSection } from './TodayLearningChallengeSection';

interface ProfileViewProps {
  profile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  books: Book[];
  onSelectBook: (book: Book, startPage?: number) => void;
  onTriggerCelebration?: () => void;
  onOpenOfflineAnalytics?: () => void;
  onOpenMoodJournal?: () => void;
  onOpenAchievementWall?: () => void;
  onOpenVoiceSummary?: () => void;
  onOpenLearningAnalytics?: () => void;
  onOpenOfflineBookshelfManager?: () => void;
  onOpenPersonalAchievements?: () => void;
  onOpenProgressOverview?: () => void;
  darkMode?: boolean;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  profile,
  onUpdateProfile,
  books,
  onSelectBook,
  onTriggerCelebration,
  onOpenOfflineAnalytics,
  onOpenMoodJournal,
  onOpenAchievementWall,
  onOpenVoiceSummary,
  onOpenLearningAnalytics,
  onOpenOfflineBookshelfManager,
  onOpenPersonalAchievements,
  onOpenProgressOverview,
  darkMode = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [nameInput, setNameInput] = useState(profile.name);
  const [avatarInput, setAvatarInput] = useState(profile.avatar);
  const [activeTab, setActiveTab] = useState<'history' | 'completed' | 'favorites'>('history');

  // Annual Reading Recap Modal State
  const [isRecapModalOpen, setIsRecapModalOpen] = useState(false);

  // Reading Notes & Journal Export Hub Modal State
  const [isNotesExportModalOpen, setIsNotesExportModalOpen] = useState(false);

  // Bookshelf Theme & Category Customizer State
  const [shelfTheme, setShelfTheme] = useState<'wood' | 'crystal' | 'cosmic' | 'rainbow' | 'castle'>('wood');
  const [customShelfCategories, setCustomShelfCategories] = useState<string[]>(['必讀繪本', '床邊故事', '冒險特輯', '雙語啟蒙']);
  const [selectedShelfCategory, setSelectedShelfCategory] = useState<string>('all');
  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  // Interactive Badges & Wall
  const [selectedBadge, setSelectedBadge] = useState<UserBadge | null>(null);
  const [badgeCategoryFilter, setBadgeCategoryFilter] = useState<'all' | 'reading' | 'ai' | 'vocab'>('all');

  // Digital Collectibles Showcase State
  const [selectedCollectibleItem, setSelectedCollectibleItem] = useState<CollectibleItem | null>(null);
  const [collectibleCategoryFilter, setCollectibleCategoryFilter] = useState<'all' | 'crown' | 'sticker' | 'badge' | 'legendary'>('all');

  // AI Cabinet Interactive State
  const [selectedTrophy, setSelectedTrophy] = useState<AITrophy | null>(null);

  // AI Trophies Cabinet State
  const [aiTrophies] = useState<AITrophy[]>([
    {
      id: 'trophy-1',
      title: 'AI 繪本創作家',
      description: '使用 Gemini 畫筆創作專屬圖像故事繪本',
      icon: '🎨',
      tier: '金牌',
      count: 2,
      targetCount: 3,
      unlocked: true,
      unlockedAt: '2026-08-07',
      howToEarn: '前往「AI 創作工坊」輸入主題故事提示詞，發布 3 本原創繪本！',
    },
    {
      id: 'trophy-2',
      title: 'AI 隨堂問答小博士',
      description: '完成 AI 生成的故事問答測驗獲得滿分',
      icon: '🦉',
      tier: '鑽石',
      count: 5,
      targetCount: 5,
      unlocked: true,
      unlockedAt: '2026-08-07',
      howToEarn: '在繪本閱讀頁點擊「AI 測驗問答」，答對所有情節思考題！',
    },
    {
      id: 'trophy-3',
      title: 'AI 伴讀故事探險家',
      description: '向貓頭鷹故事小助手發問互動並探索知識',
      icon: '💬',
      tier: '銀牌',
      count: 8,
      targetCount: 10,
      unlocked: false,
      howToEarn: '在閱讀器點擊右下角貓頭鷹夥伴，進行 10 次故事提問對話。',
    },
    {
      id: 'trophy-4',
      title: 'AI 雙語翻譯特使',
      description: '使用 AI 智慧翻譯解析多語系故事句型',
      icon: '🌐',
      tier: '銅牌',
      count: 3,
      targetCount: 5,
      unlocked: false,
      howToEarn: '在繪本閱讀頁使用多語即時解析與學習單字釋義達到 5 次。',
    },
  ]);

  const avatarOptions = ['🦊', '🐻', '🐰', '🦁', '🦉', '🐱', '🐶', '🦄'];

  const handleSaveProfile = () => {
    onUpdateProfile({
      ...profile,
      name: nameInput,
      avatar: avatarInput,
    });
    setIsEditing(false);
  };

  const readBooks = books.filter((b) => profile.readBookIds.includes(b.id));
  const favoriteBooks = books.filter((b) => profile.favoriteBookIds.includes(b.id));
  const readingLogs = profile.readingHistory || [];

  // Calculate Daily Reading Progress
  const dailyGoal = profile.dailyGoalMinutes || 15;
  const currentMinutes = profile.readingMinutes || 0;
  const goalPercent = Math.min(100, Math.round((currentMinutes / dailyGoal) * 100));

  // Filtered Badges
  const filteredBadges = profile.badges.filter((b) => {
    if (badgeCategoryFilter === 'all') return true;
    return b.category === badgeCategoryFilter;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8" id="profile-container">
      
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-amber-100 via-amber-50 to-orange-100 p-6 sm:p-8 rounded-3xl border border-amber-300/80 shadow-md flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left z-10">
          <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center text-4xl shadow-md border-2 border-amber-300 animate-bounce hover:scale-110 transition-transform cursor-pointer">
            {profile.avatar}
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-black text-amber-950 flex items-center gap-2 justify-center sm:justify-start">
              <span>{profile.name}</span>
              <span className="text-xs font-extrabold bg-amber-300 text-amber-900 px-2.5 py-0.5 rounded-full border border-amber-400">
                故事小探險家
              </span>
            </h1>
            <p className="text-xs text-amber-900/80 font-bold flex items-center gap-2 justify-center sm:justify-start flex-wrap">
              <span>已累積獲得 {profile.stars} 顆故事星章 ⭐</span>
              <span className="bg-orange-500 text-white text-[10px] px-2.5 py-0.5 rounded-full font-black flex items-center gap-1 shadow-2xs">
                <Flame className="w-3 h-3 fill-current" />
                <span>連續閱讀 {profile.streakDays || 1} 天</span>
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 z-10 flex-wrap justify-center sm:justify-end">
          {onOpenPersonalAchievements && (
            <button
              type="button"
              id="btn-profile-open-personal-achievements"
              onClick={onOpenPersonalAchievements}
              className="bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-300 hover:from-amber-500 hover:to-orange-500 text-slate-950 font-black px-4 py-2.5 rounded-2xl text-xs sm:text-sm shadow-md transition-all hover:scale-105 flex items-center gap-1.5 cursor-pointer ring-2 ring-amber-300/60"
              title="開啟個人閱讀成就總覽與小狀元榮譽殿堂"
            >
              <Trophy className="w-4 h-4 text-slate-950 animate-bounce" />
              <span>🌟 成就總覽</span>
            </button>
          )}

          {onOpenAchievementWall && (
            <button
              type="button"
              id="btn-profile-open-achievement-wall"
              onClick={onOpenAchievementWall}
              className="bg-gradient-to-r from-purple-600 via-indigo-600 to-amber-500 hover:from-purple-700 hover:to-amber-600 text-white font-black px-4 py-2.5 rounded-2xl text-xs sm:text-sm shadow-md transition-all hover:scale-105 flex items-center gap-1.5 cursor-pointer ring-2 ring-purple-400/40"
              title="進入個人讀書成就榮譽展示牆：獎盃櫃、段位階級、官方證書與主角公仔"
            >
              <Trophy className="w-4 h-4 text-yellow-300 animate-bounce" />
              <span>🏛️ 成就展示牆</span>
            </button>
          )}

          {onOpenVoiceSummary && (
            <button
              type="button"
              id="btn-profile-open-voice-summary"
              onClick={onOpenVoiceSummary}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black px-4 py-2.5 rounded-2xl text-xs sm:text-sm shadow-md transition-all hover:scale-105 flex items-center gap-1.5 cursor-pointer"
              title="收聽今日閱讀總結語音播報"
            >
              <Volume2 className="w-4 h-4 text-slate-950" />
              <span>📢 本日閱讀總結</span>
            </button>
          )}

          <button
            type="button"
            id="btn-open-annual-recap-modal"
            onClick={() => setIsRecapModalOpen(true)}
            className="bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-slate-950 font-black px-4 py-2.5 rounded-2xl text-xs sm:text-sm shadow-md transition-all hover:scale-105 flex items-center gap-1.5 cursor-pointer"
            title="生成孩童專屬年度閱讀成就紀念卡並分享"
          >
            <Trophy className="w-4 h-4 fill-slate-950" />
            <span>🏆 2026 年度閱讀回顧卡</span>
          </button>

          <button
            type="button"
            id="btn-open-reading-notes-export"
            onClick={() => {
              setIsNotesExportModalOpen(true);
              playStarChime();
            }}
            className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-black px-4 py-2.5 rounded-2xl text-xs sm:text-sm shadow-md transition-all hover:scale-105 flex items-center gap-1.5 cursor-pointer"
            title="匯出所有繪本閱讀筆記、摘錄金句與心情日記"
          >
            <FileText className="w-4 h-4 fill-white" />
            <span>📝 閱讀筆記匯出中心</span>
          </button>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="bg-white hover:bg-amber-50 text-amber-950 font-extrabold px-4 py-2.5 rounded-2xl text-xs sm:text-sm border border-amber-300 shadow-xs transition-all hover:scale-105"
          >
            {isEditing ? '取消修改' : '⚙️ 換頭像與稱呼'}
          </button>
        </div>
      </div>

      {/* Edit Profile Modal / Form */}
      {isEditing && (
        <div className="bg-white p-6 rounded-3xl border-2 border-amber-300 shadow-md space-y-4 animate-fadeIn">
          <h3 className="font-extrabold text-amber-950 text-base">修改個人小名與吉祥物頭像</h3>
          
          <div className="space-y-2">
            <label className="text-xs font-bold text-amber-900">故事探險家名稱：</label>
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              className="w-full p-3 rounded-xl border border-amber-300 font-bold text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-amber-900">選擇最喜歡的動物吉祥物：</label>
            <div className="flex flex-wrap gap-2">
              {avatarOptions.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setAvatarInput(emoji)}
                  className={`w-12 h-12 text-2xl rounded-2xl flex items-center justify-center border-2 transition-all ${
                    avatarInput === emoji
                      ? 'bg-amber-200 border-amber-500 scale-110 shadow-xs'
                      : 'bg-amber-50 border-amber-200 hover:bg-amber-100'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleSaveProfile}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white font-black py-3 rounded-2xl text-xs sm:text-sm shadow-md transition-transform hover:scale-[1.01]"
          >
            儲存修改並更新
          </button>
        </div>
      )}

      {/* ⭕ Daily Reading Goal Progress Ring */}
      <DailyGoalRing
        currentMinutes={currentMinutes}
        goalMinutes={dailyGoal}
        onUpdateGoalMinutes={(newGoal) => onUpdateProfile({ ...profile, dailyGoalMinutes: newGoal })}
        onTriggerCelebration={onTriggerCelebration}
        darkMode={darkMode}
      />

      {/* 🎙️ 孩童智慧語音朗讀計時器 (Voice-Guided Reading Timer) */}
      <VoiceReadingTimer
        profile={profile}
        onUpdateProfile={onUpdateProfile}
        onTriggerCelebration={onTriggerCelebration}
        darkMode={darkMode}
      />

      {/* ⏰ 智慧閱讀提醒與共讀鬧鐘 (Smart Reading Reminder Card) */}
      <SmartReadingReminderCard
        profile={profile}
        onUpdateProfile={onUpdateProfile}
        darkMode={darkMode}
      />

      {/* 🗺️ 童話閱讀冒險地圖視覺化模組 (Reading Adventure Map) */}
      <ReadingAdventureMap
        profile={profile}
        books={books}
        onSelectBook={onSelectBook}
        onUpdateProfile={onUpdateProfile}
        onTriggerCelebration={onTriggerCelebration}
        darkMode={darkMode}
      />

      {/* 🗺️ 視覺化學習里程碑地圖 (Visual Learning Milestone Map) */}
      <LearningMilestoneMap
        profile={profile}
        books={books}
        onSelectBook={onSelectBook}
        darkMode={darkMode}
      />

      {/* 📖 童心閱讀心情日記 (Mood Journal Showcase Card) */}
      <div className={`p-5 sm:p-6 rounded-3xl border transition-all ${
        darkMode
          ? 'bg-gradient-to-r from-pink-950/60 via-slate-800 to-slate-900 border-pink-900/80 text-slate-100 shadow-xl'
          : 'bg-gradient-to-r from-pink-50 via-rose-50/70 to-amber-50 border-pink-200 text-slate-900 shadow-sm'
      }`}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 text-white shadow-md">
              <Heart className="w-6 h-6 fill-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base sm:text-lg">童心閱讀心情日記</h3>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-pink-100 text-pink-700 border border-pink-300">
                  {profile.moodJournal?.length || 0} 篇日記
                </span>
              </div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                紀錄每一本繪本讀完的心情點滴，獲取更多星星獎勵！
              </p>
            </div>
          </div>

          <button
            type="button"
            id="btn-profile-open-mood-journal"
            onClick={onOpenMoodJournal}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 hover:from-pink-600 hover:to-amber-600 text-white font-black text-xs sm:text-sm shadow-md transition-transform hover:scale-105 flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4 fill-white" />
            <span>寫心情 / 檢視日記 (+5 ⭐)</span>
          </button>
        </div>

        {/* Latest Entry Preview */}
        {profile.moodJournal && profile.moodJournal.length > 0 && (
          <div className="mt-4 p-3.5 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-pink-200 dark:border-pink-900/60 flex items-center gap-3">
            <span className="text-3xl">{profile.moodJournal[0].moodEmoji}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="font-black text-xs text-slate-900 dark:text-slate-100 truncate">
                  《{profile.moodJournal[0].bookTitle}》· {profile.moodJournal[0].moodLabel}
                </h4>
                <span className="text-[10px] font-bold text-slate-400">{profile.moodJournal[0].createdAt}</span>
              </div>
              <p className="text-xs font-bold text-slate-600 dark:text-slate-300 truncate mt-0.5">
                💬 {profile.moodJournal[0].reflectionText}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 📊 Recharts 閱讀心情熱力圖與情緒走勢 (Reading Mood Heatmap & Emotion Trend Chart with Recharts) */}
      <ReadingMoodHeatmapChart
        profile={profile}
        books={books}
        darkMode={darkMode}
        onOpenMoodJournal={onOpenMoodJournal}
        onSelectBook={onSelectBook}
        onOpenNotesExport={() => {
          setIsNotesExportModalOpen(true);
          playStarChime();
        }}
      />

      {/* 📈 D3.js 閱讀專注力深度分析趨勢圖 (Daily Focus Analytics with D3.js) */}
      <ReadingFocusD3Chart
        profile={profile}
        books={books}
        darkMode={darkMode}
      />

      {/* 📊 Daily Reading Report (每日閱讀診斷與成長報告) */}
      <div className={`p-6 sm:p-8 rounded-3xl border transition-colors ${
        darkMode
          ? 'bg-slate-800/90 border-slate-700 text-slate-100 shadow-xl'
          : 'bg-white border-amber-200 shadow-xs'
      }`} id="daily-reading-report-section">
        <div className="flex items-center justify-between border-b border-amber-200/60 pb-4 mb-6 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500 text-white shadow-md">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-black text-lg sm:text-xl">每日閱讀診斷與成長報告</h2>
              <p className={`text-xs font-medium ${darkMode ? 'text-slate-400' : 'text-amber-800/80'}`}>
                即時數據統計、7天學習趨勢與 AI 智慧學習顧問分析
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {onOpenProgressOverview && (
              <button
                type="button"
                id="btn-profile-progress-overview"
                onClick={onOpenProgressOverview}
                className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 px-4 py-2 rounded-2xl text-xs font-extrabold shadow-sm transition-transform hover:scale-105"
              >
                <Compass className="w-4 h-4 text-slate-950" />
                <span>閱讀進度總覽</span>
              </button>
            )}

            {onOpenLearningAnalytics && (
              <button
                type="button"
                id="btn-profile-learning-analytics"
                onClick={onOpenLearningAnalytics}
                className="flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-2xl text-xs font-extrabold shadow-sm transition-transform hover:scale-105"
              >
                <TrendingUp className="w-4 h-4 text-blue-200 animate-bounce" />
                <span>學習數據概述</span>
              </button>
            )}

            {onOpenOfflineBookshelfManager && (
              <button
                type="button"
                id="btn-profile-offline-bookshelf"
                onClick={onOpenOfflineBookshelfManager}
                className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-4 py-2 rounded-2xl text-xs font-extrabold shadow-sm transition-transform hover:scale-105"
              >
                <HardDrive className="w-4 h-4 text-emerald-200" />
                <span>離線書架管理</span>
              </button>
            )}

            {onOpenOfflineAnalytics && (
              <button
                type="button"
                onClick={onOpenOfflineAnalytics}
                className="flex items-center gap-1.5 bg-slate-700 hover:bg-slate-800 text-white px-4 py-2 rounded-2xl text-xs font-extrabold shadow-sm transition-transform hover:scale-105"
              >
                <HardDrive className="w-4 h-4 text-emerald-100" />
                <span>離線儲存空間</span>
              </button>
            )}

            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-2xl text-xs font-extrabold shadow-sm transition-transform hover:scale-105"
            >
              <FileText className="w-4 h-4" />
              <span>匯出 / 列印學習報告</span>
            </button>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-amber-50/80 border-amber-200'}`}>
            <div className="flex items-center justify-between text-xs font-bold mb-1 opacity-80">
              <span>今日閱讀時長</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-black text-amber-600">
              {currentMinutes} <span className="text-xs font-bold text-slate-500">分鐘</span>
            </div>
            <div className="text-[10px] font-extrabold text-emerald-600 mt-1">
              目標達成率 {goalPercent}%
            </div>
          </div>

          <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-amber-50/80 border-amber-200'}`}>
            <div className="flex items-center justify-between text-xs font-bold mb-1 opacity-80">
              <span>閱讀繪本頁數</span>
              <BookOpen className="w-4 h-4 text-orange-500" />
            </div>
            <div className="text-2xl font-black text-orange-600">
              {readingLogs.reduce((acc, l) => acc + (l.lastPageRead || 0), 0) || 18} <span className="text-xs font-bold text-slate-500">頁</span>
            </div>
            <div className="text-[10px] font-extrabold text-orange-600 mt-1">
              專注度優異 🌟
            </div>
          </div>

          <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-amber-50/80 border-amber-200'}`}>
            <div className="flex items-center justify-between text-xs font-bold mb-1 opacity-80">
              <span>完讀故事總數</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-black text-emerald-600">
              {readBooks.length || 3} <span className="text-xs font-bold text-slate-500">本</span>
            </div>
            <div className="text-[10px] font-extrabold text-emerald-600 mt-1">
              涵蓋多國經典故事
            </div>
          </div>

          <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-amber-50/80 border-amber-200'}`}>
            <div className="flex items-center justify-between text-xs font-bold mb-1 opacity-80">
              <span>連續閱讀天數</span>
              <Flame className="w-4 h-4 text-rose-500" />
            </div>
            <div className="text-2xl font-black text-rose-600">
              {profile.streakDays || 1} <span className="text-xs font-bold text-slate-500">天</span>
            </div>
            <div className="text-[10px] font-extrabold text-rose-600 mt-1">
              維持優良閱讀習慣
            </div>
          </div>
        </div>

        {/* 7-Day Reading Trend Bar Chart */}
        <div className={`p-5 rounded-2xl border mb-6 ${darkMode ? 'bg-slate-900/80 border-slate-700' : 'bg-amber-50/40 border-amber-200'}`}>
          <h3 className="font-extrabold text-xs sm:text-sm mb-3 flex items-center justify-between">
            <span>📈 本週 7 天閱讀時間趨勢 (分鐘)</span>
            <span className="text-[10px] font-extrabold bg-amber-200 text-amber-900 px-2 py-0.5 rounded-md">
              平均每日 18 分鐘
            </span>
          </h3>

          <div className="grid grid-cols-7 gap-2 items-end h-32 pt-4">
            {[
              { day: '週一', mins: 12 },
              { day: '週二', mins: 20 },
              { day: '週三', mins: 15 },
              { day: '週四', mins: 25 },
              { day: '週五', mins: 18 },
              { day: '週六', mins: 30 },
              { day: '今日', mins: currentMinutes || 22 },
            ].map((item, idx) => {
              const heightPercent = Math.min(100, (item.mins / 35) * 100);
              return (
                <div key={idx} className="flex flex-col items-center gap-1.5 h-full justify-end">
                  <span className="text-[10px] font-black text-amber-600">{item.mins}分</span>
                  <div className="w-full bg-amber-200/50 rounded-xl h-full flex items-end overflow-hidden p-0.5">
                    <div
                      className={`w-full rounded-lg transition-all duration-500 ${
                        idx === 6 ? 'bg-gradient-to-t from-orange-500 to-amber-400 animate-pulse' : 'bg-amber-500/80'
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>
                  <span className={`text-[10px] font-bold ${darkMode ? 'text-slate-400' : 'text-amber-900/70'}`}>{item.day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Learning Insights & Encouragement */}
        <div className={`p-4 sm:p-5 rounded-2xl border flex items-start gap-3 ${
          darkMode ? 'bg-purple-950/40 border-purple-800/80 text-purple-100' : 'bg-amber-100/70 border-amber-300 text-amber-950'
        }`}>
          <div className="p-2 rounded-xl bg-orange-500 text-white shrink-0 mt-0.5">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="font-black text-xs sm:text-sm text-orange-600">
              💡 AI 學習顧問分析與陪伴建議：
            </h4>
            <p className="text-xs font-semibold leading-relaxed">
              小探險家今天的閱讀理解力表現優異！今日專注朗讀與認識繪本專有名詞，詞彙理解度超越 85% 同齡學童。建議明日可選擇冒險科普類繪本，繼續擴充生活雙語詞彙量！
            </p>
          </div>
        </div>
      </div>

      {/* 🎯 今日學習挑戰 (Today's Learning Challenge & Daily Interactive Missions) */}
      <TodayLearningChallengeSection
        profile={profile}
        onUpdateProfile={onUpdateProfile}
        books={books}
        onSelectBook={onSelectBook}
        onOpenMoodJournal={onOpenMoodJournal}
        onTriggerCelebration={onTriggerCelebration}
        darkMode={darkMode}
      />

      {/* 🏆 童心成就排行榜 & 頭像框展覽館 (Achievement Leaderboard & Avatar Inventory) */}
      <AchievementLeaderboard
        profile={profile}
        onUpdateProfile={onUpdateProfile}
        darkMode={darkMode}
      />

      {/* 📖 童心愛閱讀「閱讀社交牆」 (Reading Social Wall) */}
      <ReadingSocialWall
        profile={profile}
        books={books}
        onSelectBook={onSelectBook}
        darkMode={darkMode}
      />

      {/* 👑 童心繪本數位紀念品展示櫃 (Digital Picture Book Collectibles Showcase) */}
      <div className={`p-6 sm:p-8 rounded-3xl border transition-all ${
        darkMode
          ? 'bg-gradient-to-b from-slate-800 via-amber-950/40 to-slate-900 border-amber-600/60 shadow-xl'
          : 'bg-gradient-to-b from-amber-50/90 via-orange-50/50 to-yellow-50 border-amber-300 shadow-md'
      }`} id="collectibles-showcase-section">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-amber-200 dark:border-amber-800/80 pb-4 mb-6 gap-3">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-yellow-500 text-white shadow-lg animate-bounce">
              <Crown className="w-6 h-6 text-amber-100 fill-amber-100" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-lg sm:text-xl text-slate-900 dark:text-slate-100">
                  童心繪本數位紀念品展覽館
                </h3>
                <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white uppercase tracking-wider shadow-2xs">
                  Collectibles Showcase
                </span>
              </div>
              <p className={`text-xs font-semibold ${darkMode ? 'text-amber-200/80' : 'text-amber-900/80'}`}>
                完讀每本繪本時解鎖的專屬主題皇冠、奇幻夜光貼紙與魔法勳章
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-amber-950 dark:text-amber-100 bg-amber-200/80 dark:bg-amber-900/80 px-3 py-1.5 rounded-2xl border border-amber-300/80 flex items-center gap-1.5 shadow-2xs">
              <Gift className="w-4 h-4 text-orange-600 dark:text-amber-300" />
              <span>已珍藏 {(profile.collectibles && profile.collectibles.length) || INITIAL_DEFAULT_COLLECTIBLES.length} 個數位裝飾</span>
            </span>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none mb-6">
          <span className={`text-xs font-bold whitespace-nowrap ${darkMode ? 'text-slate-400' : 'text-amber-900/70'}`}>收藏分類：</span>
          {[
            { id: 'all', label: '全部作品' },
            { id: 'crown', label: '👑 皇冠飾品' },
            { id: 'sticker', label: '🌌 奇幻貼紙' },
            { id: 'badge', label: '🪄 魔法徽章' },
            { id: 'legendary', label: '💎 傳說級別' },
          ].map((cat) => {
            const isActive = collectibleCategoryFilter === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCollectibleCategoryFilter(cat.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer border ${
                  isActive
                    ? 'bg-amber-500 text-white border-amber-600 shadow-md scale-105'
                    : darkMode
                    ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    : 'bg-white text-amber-950 border-amber-200/90 hover:bg-amber-100'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Collectibles Grid */}
        {(() => {
          const list = (profile.collectibles && profile.collectibles.length > 0)
            ? profile.collectibles
            : INITIAL_DEFAULT_COLLECTIBLES;

          const filtered = list.filter((item) => {
            if (collectibleCategoryFilter === 'all') return true;
            if (collectibleCategoryFilter === 'crown') return item.category.includes('皇冠') || item.icon.includes('👑');
            if (collectibleCategoryFilter === 'sticker') return item.category.includes('貼紙') || item.icon.includes('🌌') || item.icon.includes('🎨');
            if (collectibleCategoryFilter === 'badge') return item.category.includes('徽章') || item.icon.includes('🪄') || item.icon.includes('🧱');
            if (collectibleCategoryFilter === 'legendary') return item.rarity === 'legendary';
            return true;
          });

          if (filtered.length === 0) {
            return (
              <div className="text-center py-10 space-y-2 bg-white/60 dark:bg-slate-800/60 rounded-3xl border border-dashed border-amber-300">
                <div className="text-4xl">🎁</div>
                <p className="text-xs font-extrabold text-amber-900/80 dark:text-amber-200">
                  尚無此分類的數位紀念品，快去多讀幾本經典繪本吧！
                </p>
              </div>
            );
          }

          return (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {filtered.map((item) => {
                const isLegendary = item.rarity === 'legendary';
                const isEpic = item.rarity === 'epic';

                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      playStarChime();
                      setSelectedCollectibleItem(item);
                    }}
                    className={`p-4 rounded-3xl border-2 text-center space-y-2 cursor-pointer transition-all duration-300 relative group transform hover:-translate-y-1.5 ${
                      isLegendary
                        ? 'bg-gradient-to-b from-amber-400/20 via-yellow-300/20 to-amber-500/20 border-amber-400 shadow-md hover:shadow-xl hover:shadow-amber-500/20'
                        : isEpic
                        ? 'bg-gradient-to-b from-purple-400/20 via-indigo-300/20 to-pink-400/20 border-purple-400 shadow-md hover:shadow-xl hover:shadow-purple-500/20'
                        : 'bg-white/90 dark:bg-slate-800/90 border-amber-200 dark:border-slate-700 shadow-xs hover:shadow-md hover:border-amber-400'
                    }`}
                  >
                    {/* Glowing Sparkle for Rare Items */}
                    {(isLegendary || isEpic) && (
                      <span className="absolute top-2 right-2 text-xs animate-ping">
                        ✨
                      </span>
                    )}

                    {/* Big Souvenir Icon */}
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-amber-100 to-orange-100 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center text-4xl shadow-inner border border-amber-200 dark:border-slate-600 group-hover:scale-110 transition-transform">
                      {item.icon}
                    </div>

                    {/* Title & Origin Book */}
                    <div className="space-y-0.5">
                      <div className="font-black text-xs sm:text-sm text-slate-900 dark:text-slate-100 leading-snug truncate">
                        {item.name}
                      </div>
                      <div className="text-[10px] font-extrabold text-amber-800 dark:text-amber-300 truncate">
                        📖 {item.bookTitle}
                      </div>
                    </div>

                    {/* Category & Rarity Badge */}
                    <div className="pt-1 flex items-center justify-center gap-1 flex-wrap">
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full text-white shadow-2xs ${
                        isLegendary
                          ? 'bg-amber-500'
                          : isEpic
                          ? 'bg-purple-600'
                          : item.rarity === 'rare'
                          ? 'bg-blue-500'
                          : 'bg-slate-500'
                      }`}>
                        {isLegendary ? '💎 傳說' : isEpic ? '✨ 史詩' : item.rarity === 'rare' ? '🌟 稀有' : '普通'}
                      </span>
                      <span className="text-[9px] font-bold text-slate-400">
                        {item.earnedAt}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}
      </div>

      {/* Collectible Detail Inspector Modal */}
      {selectedCollectibleItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full border-2 border-amber-400 shadow-2xl text-center space-y-5 relative">
            <button
              onClick={() => setSelectedCollectibleItem(null)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="inline-flex items-center justify-center p-4 rounded-3xl bg-amber-100 dark:bg-slate-800 text-6xl shadow-inner border border-amber-300 dark:border-slate-700 animate-bounce">
              {selectedCollectibleItem.icon}
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-black px-3 py-1 rounded-full bg-amber-500 text-white uppercase tracking-wider">
                {selectedCollectibleItem.category}
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
                {selectedCollectibleItem.name}
              </h3>
              <p className="text-xs font-bold text-amber-800 dark:text-amber-300">
                📖 解鎖源自：《{selectedCollectibleItem.bookTitle}》
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-slate-800 border border-amber-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 leading-relaxed text-left">
              💬 {selectedCollectibleItem.description}
            </div>

            <div className="text-[11px] font-bold text-slate-400 flex items-center justify-between px-2">
              <span>獲得日期：{selectedCollectibleItem.earnedAt}</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-black">已永久典藏 🔒</span>
            </div>

            <button
              onClick={() => setSelectedCollectibleItem(null)}
              className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs sm:text-sm shadow-md transition-colors"
            >
              太棒了！關閉說明
            </button>
          </div>
        </div>
      )}

      {/* 🏆 互動式成就動態牆 (Interactive Dynamic Achievement Wall) */}
      <InteractiveAchievementDynamicWall
        profile={profile}
        books={books}
        onUpdateProfile={onUpdateProfile}
        onOpenFullAchievementModal={onOpenAchievementWall}
        darkMode={darkMode}
      />

      {/* 📖 Reading History & Log Tracking Dashboard (童心擴充書櫃與閱讀記錄) */}
      <div className={`p-6 sm:p-8 rounded-3xl border shadow-xs space-y-6 transition-all ${
        shelfTheme === 'wood'
          ? 'bg-amber-50/60 border-amber-300'
          : shelfTheme === 'crystal'
          ? 'bg-cyan-950/20 border-cyan-400'
          : shelfTheme === 'cosmic'
          ? 'bg-slate-900 border-purple-500 text-purple-100'
          : shelfTheme === 'rainbow'
          ? 'bg-gradient-to-r from-pink-50 via-purple-50 to-indigo-50 border-pink-300'
          : 'bg-stone-900 border-amber-600 text-amber-100'
      }`}>
        <div className="flex items-center justify-between border-b border-amber-200/80 pb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-amber-600" />
            <h2 className="font-black text-amber-950 dark:text-amber-200 text-lg">
              童心擴充書櫃與閱讀進度 (Bookshelf Studio)
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black bg-amber-200 text-amber-950 px-2.5 py-1 rounded-full border border-amber-400 flex items-center gap-1">
              <Layers className="w-3 h-3" />
              <span>容量：已擴充 {customShelfCategories.length + 1} 個專屬展架 • 無限容量 ♾️</span>
            </span>
          </div>
        </div>

        {/* 🎨 Bookshelf Visual Theme & Category Customizer Toolbar */}
        <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-amber-200/80 dark:border-slate-700 space-y-3">
          {/* Theme Style Selector */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-1.5 text-xs font-black text-amber-950 dark:text-amber-200">
              <Palette className="w-4 h-4 text-amber-600" />
              <span>書櫃外觀風格 (Shelf Theme Style)：</span>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {[
                { id: 'wood', label: '🪵 典雅原木' },
                { id: 'crystal', label: '🔮 璀璨水晶' },
                { id: 'cosmic', label: '🌌 宇宙星雲' },
                { id: 'rainbow', label: '🌈 夢幻虹彩' },
                { id: 'castle', label: '🏰 魔法城堡' },
              ].map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setShelfTheme(st.id as any)}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-black transition-all cursor-pointer border ${
                    shelfTheme === st.id
                      ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-xs scale-105'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 hover:bg-amber-100'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Shelf Category Tags & Creator */}
          <div className="pt-2 border-t border-amber-200/60 dark:border-slate-700 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-black text-slate-600 dark:text-slate-300 flex items-center gap-1">
                <FolderPlus className="w-3.5 h-3.5 text-amber-600" />
                <span>展架分類：</span>
              </span>
              <button
                type="button"
                onClick={() => setSelectedShelfCategory('all')}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-black cursor-pointer border ${
                  selectedShelfCategory === 'all'
                    ? 'bg-amber-600 text-white border-amber-700'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200'
                }`}
              >
                全部繪本
              </button>
              {customShelfCategories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedShelfCategory(cat)}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-black cursor-pointer border ${
                    selectedShelfCategory === cat
                      ? 'bg-amber-600 text-white border-amber-700'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200'
                  }`}
                >
                  📂 {cat}
                </button>
              ))}
            </div>

            {/* Add Custom Category Form */}
            {isAddingCategory ? (
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  placeholder="輸入新展架分類..."
                  value={newCategoryInput}
                  onChange={(e) => setNewCategoryInput(e.target.value)}
                  className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-900 border border-amber-400 text-xs font-bold focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newCategoryInput.trim()) {
                      setCustomShelfCategories([...customShelfCategories, newCategoryInput.trim()]);
                      setSelectedShelfCategory(newCategoryInput.trim());
                      setNewCategoryInput('');
                      setIsAddingCategory(false);
                      playStarChime();
                    }
                  }}
                  className="px-2.5 py-1 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs cursor-pointer"
                >
                  確定
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingCategory(false)}
                  className="px-2 py-1 text-xs font-bold text-slate-400 hover:text-slate-600"
                >
                  取消
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsAddingCategory(true)}
                className="px-3 py-1 rounded-xl bg-amber-100 dark:bg-slate-700 hover:bg-amber-200 text-amber-900 dark:text-amber-200 font-extrabold text-xs flex items-center gap-1 cursor-pointer border border-amber-300/80"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>新增專屬展架</span>
              </button>
            )}
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="flex items-center justify-between flex-wrap gap-2 border-b border-amber-200 pb-2">
          <div className="flex items-center gap-1.5 bg-amber-100/80 p-1 rounded-2xl border border-amber-200 text-xs font-extrabold">
            <button
              onClick={() => setActiveTab('history')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                activeTab === 'history'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'text-amber-900 hover:bg-amber-200/60'
              }`}
            >
              最近閱讀進度 ({readingLogs.length})
            </button>

            <button
              onClick={() => setActiveTab('completed')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                activeTab === 'completed'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'text-amber-900 hover:bg-amber-200/60'
              }`}
            >
              已完讀故事 ({readBooks.length})
            </button>

            <button
              onClick={() => setActiveTab('favorites')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                activeTab === 'favorites'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'text-amber-900 hover:bg-amber-200/60'
              }`}
            >
              收藏最愛 ({favoriteBooks.length})
            </button>
          </div>
        </div>

        {/* Tab Content: History List */}
        {activeTab === 'history' && (
          <div className="space-y-3">
            {readingLogs.length === 0 ? (
              <div className="text-center py-8 space-y-2">
                <span className="text-3xl">📖</span>
                <p className="text-xs font-bold text-amber-800/80">
                  尚無閱讀記錄，選擇一本喜歡的繪本開始故事之旅吧！
                </p>
              </div>
            ) : (
              readingLogs.map((log) => {
                const matchedBook = books.find((b) => b.id === log.bookId);
                return (
                  <div
                    key={log.id}
                    className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 hover:bg-amber-100/50 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={log.coverUrl || 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?q=80&w=200'}
                        alt={log.bookTitle}
                        className="w-14 h-14 object-cover rounded-xl border border-amber-300 shadow-2xs"
                      />

                      <div className="space-y-1">
                        <h4 className="font-extrabold text-sm text-amber-950">{log.bookTitle}</h4>
                        <div className="flex items-center gap-3 text-[11px] font-bold text-amber-800 flex-wrap">
                          <span>進度：第 {log.lastPageRead} / {log.totalPages} 頁</span>
                          <span>•</span>
                          <span>累積時間：{log.timeSpentMinutes} 分鐘</span>
                          <span>•</span>
                          <span>最後閱讀：{log.lastReadAt}</span>
                        </div>

                        <div className="w-36 h-2 bg-amber-200 rounded-full overflow-hidden border border-amber-300">
                          <div
                            className="h-full bg-amber-600 rounded-full"
                            style={{ width: `${log.progressPercent}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {matchedBook && (
                      <button
                        onClick={() => onSelectBook(matchedBook, log.lastPageRead)}
                        className="self-end sm:self-center flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white font-extrabold px-4 py-2 rounded-xl text-xs shadow-2xs transition-transform hover:scale-105"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>繼續閱讀 (第{log.lastPageRead}頁)</span>
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Tab Content: Completed */}
        {activeTab === 'completed' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {readBooks.length === 0 ? (
              <p className="text-xs text-amber-800/70 py-4 col-span-2">你還沒有完成閱讀繪本，快選擇一本開始吧！</p>
            ) : (
              readBooks.map((b) => (
                <div
                  key={b.id}
                  onClick={() => onSelectBook(b, 1)}
                  className="flex items-center gap-3 p-3 rounded-2xl hover:bg-amber-100/60 cursor-pointer border border-amber-200 transition-colors bg-amber-50/40"
                >
                  <img src={b.coverUrl} alt={b.title['zh-TW']} className="w-14 h-14 object-cover rounded-xl" />
                  <div className="flex-1 space-y-1">
                    <div className="font-extrabold text-xs text-amber-950">{b.title['zh-TW']}</div>
                    <div className="text-[10px] font-bold text-amber-700">{b.originCountry} {b.flag} • {b.category}</div>
                    <div className="inline-block bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full">
                      ✓ 已完讀 🏆
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab Content: Favorites */}
        {activeTab === 'favorites' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {favoriteBooks.length === 0 ? (
              <p className="text-xs text-amber-800/70 py-4 col-span-2">在繪本卡片上點擊愛心即可收藏！</p>
            ) : (
              favoriteBooks.map((b) => (
                <div
                  key={b.id}
                  onClick={() => onSelectBook(b, 1)}
                  className="flex items-center gap-3 p-3 rounded-2xl hover:bg-amber-100/60 cursor-pointer border border-amber-200 transition-colors bg-amber-50/40"
                >
                  <img src={b.coverUrl} alt={b.title['zh-TW']} className="w-14 h-14 object-cover rounded-xl" />
                  <div className="flex-1 space-y-1">
                    <div className="font-extrabold text-xs text-amber-950">{b.title['zh-TW']}</div>
                    <div className="text-[10px] font-bold text-amber-700">{b.originCountry} {b.flag}</div>
                    <div className="inline-block bg-rose-100 text-rose-800 text-[10px] font-black px-2 py-0.5 rounded-full">
                      ❤️ 已最愛收藏
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* 🌟 Interactive Badge Detail Modal */}
      {selectedBadge && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-amber-50 rounded-3xl p-6 sm:p-8 max-w-md w-full border-4 border-amber-300 shadow-2xl space-y-5 text-center relative">
            
            <button
              onClick={() => setSelectedBadge(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-amber-200 text-amber-950 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-24 h-24 mx-auto bg-amber-200 rounded-full flex items-center justify-center text-5xl border-4 border-amber-400 shadow-md animate-bounce">
              {selectedBadge.icon}
            </div>

            <div className="space-y-1">
              <span className="inline-block text-xs font-black bg-amber-200 text-amber-950 px-3 py-0.5 rounded-full border border-amber-400">
                {selectedBadge.rarity || '普通'}成就獎章
              </span>
              <h3 className="text-xl font-black text-amber-950">{selectedBadge.name}</h3>
              <p className="text-xs font-extrabold text-amber-900/80">{selectedBadge.description}</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-amber-200 text-left space-y-2 text-xs font-bold text-amber-950">
              <div className="flex items-center gap-1.5 text-amber-700">
                <HelpCircle className="w-4 h-4" />
                <span>獲得方式 / 解鎖攻略：</span>
              </div>
              <p className="text-amber-900 leading-relaxed font-extrabold bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                {selectedBadge.unlockCondition || '完成指定故事閱讀或 AI 創作挑戰。'}
              </p>

              <div className="pt-1 flex items-center justify-between text-[11px] text-amber-800">
                <span>狀態：{selectedBadge.unlocked ? '已成功解鎖 ⭐' : '尚未解鎖 🔒'}</span>
                {selectedBadge.unlockedAt && <span>解鎖日期：{selectedBadge.unlockedAt}</span>}
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => speakText(`${selectedBadge.name}成就。${selectedBadge.description}。解鎖條件：${selectedBadge.unlockCondition || ''}`, 'zh-TW', 1.0)}
                className="flex items-center gap-1.5 bg-white hover:bg-amber-100 text-amber-950 font-extrabold px-4 py-2.5 rounded-2xl border border-amber-300 shadow-xs text-xs"
              >
                <Volume2 className="w-4 h-4 text-amber-700" />
                <span>朗讀介紹</span>
              </button>

              <button
                onClick={() => setSelectedBadge(null)}
                className="bg-amber-600 hover:bg-amber-700 text-white font-extrabold px-6 py-2.5 rounded-2xl shadow-md text-xs"
              >
                我知道囉！
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🤖 Interactive AI Trophy Detail Modal */}
      {selectedTrophy && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-stone-900 rounded-3xl p-6 sm:p-8 max-w-md w-full border-4 border-amber-600 shadow-2xl space-y-5 text-center relative text-amber-100">
            
            <button
              onClick={() => setSelectedTrophy(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-stone-800 text-amber-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-24 h-24 mx-auto bg-gradient-to-b from-amber-800 to-stone-800 rounded-full flex items-center justify-center text-5xl border-4 border-amber-400 shadow-md animate-pulse">
              {selectedTrophy.icon}
            </div>

            <div className="space-y-1">
              <span className="inline-block text-xs font-black bg-amber-500 text-stone-950 px-3 py-0.5 rounded-full">
                {selectedTrophy.tier}榮譽獎盃
              </span>
              <h3 className="text-xl font-black text-white">{selectedTrophy.title}</h3>
              <p className="text-xs font-extrabold text-amber-200/80">{selectedTrophy.description}</p>
            </div>

            <div className="bg-stone-800 p-4 rounded-2xl border border-amber-800 text-left space-y-2 text-xs font-bold">
              <div className="flex items-center gap-1.5 text-amber-400">
                <Sparkles className="w-4 h-4" />
                <span>獲得方式：</span>
              </div>
              <p className="text-amber-100 leading-relaxed bg-stone-950 p-2.5 rounded-xl border border-stone-700">
                {selectedTrophy.howToEarn}
              </p>

              <div className="pt-2 space-y-1">
                <div className="flex justify-between text-[11px] text-amber-300">
                  <span>進度：{selectedTrophy.count} / {selectedTrophy.targetCount}</span>
                  <span>{selectedTrophy.unlocked ? '已獲頒此獎盃 🏆' : '挑戰中...'}</span>
                </div>
                <div className="w-full h-2 bg-stone-950 rounded-full overflow-hidden border border-amber-900">
                  <div
                    className="h-full bg-amber-400 rounded-full"
                    style={{ width: `${Math.min(100, (selectedTrophy.count / selectedTrophy.targetCount) * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedTrophy(null)}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-black py-2.5 rounded-2xl text-xs shadow-md"
            >
              了解並努力挑戰！
            </button>
          </div>
        </div>
      )}

      {/* 🏆 Annual Reading Recap Milestone Card Modal */}
      <AnnualReadingRecapModal
        isOpen={isRecapModalOpen}
        onClose={() => setIsRecapModalOpen(false)}
        profile={profile}
        books={books}
        onAwardStar={(stars) => {
          onUpdateProfile({
            ...profile,
            stars: (profile.stars || 0) + stars,
          });
        }}
        darkMode={darkMode}
      />

      {/* 📝 Reading Notes & Reflection Export Hub Modal */}
      {isNotesExportModalOpen && (
        <ReadingNotesExportModal
          isOpen={isNotesExportModalOpen}
          onClose={() => setIsNotesExportModalOpen(false)}
          books={books}
          userProfile={profile}
        />
      )}
    </div>
  );
};
