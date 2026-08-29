import React, { useState, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  MapPin, Award, Star, Sparkles, CheckCircle2, Lock, ArrowRight,
  Compass, Trophy, HelpCircle, Volume2, X, ChevronRight, Crown,
  Layers, Flame, BookOpen, Bot, Globe, Shield, Sparkle, Eye,
  Zap, Route, Wand2
} from 'lucide-react';
import { UserProfile, Book, LearningMilestone } from '../types';
import { generateLearningMilestones } from '../data/learningMilestones';
import { playStarChime, playPageTurnSound, speakText } from '../utils/audio';

interface LearningMilestoneMapProps {
  profile: UserProfile;
  books: Book[];
  onSelectBook?: (book: Book, startPage?: number) => void;
  onOpenCreator?: () => void;
  onOpenWordBank?: () => void;
  darkMode?: boolean;
}

export const LearningMilestoneMap: React.FC<LearningMilestoneMapProps> = ({
  profile,
  books,
  onSelectBook,
  onOpenCreator,
  onOpenWordBank,
  darkMode = false,
}) => {
  const allMilestones = useMemo(() => generateLearningMilestones(profile, books), [profile, books]);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedMilestone, setSelectedMilestone] = useState<LearningMilestone | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [glowIntensity, setGlowIntensity] = useState<'normal' | 'vibrant'>('vibrant');

  const filteredMilestones = useMemo(() => {
    if (selectedCategory === 'all') return allMilestones;
    return allMilestones.filter((m) => m.category === selectedCategory);
  }, [allMilestones, selectedCategory]);

  const unlockedCount = allMilestones.filter((m) => m.unlocked).length;
  const totalCount = allMilestones.length;
  const completionPercent = Math.round((unlockedCount / totalCount) * 100);

  // Group by stages
  const stages = [
    { stageNumber: 1, name: '🌱 啟蒙探索小島', desc: '翻開第一本繪本，累積生詞寶藏', bgGlow: 'from-amber-400/20 to-emerald-400/10' },
    { stageNumber: 2, name: '🌲 雙語沉浸森林', desc: '多國語音對照，點燃每天共讀火苗', bgGlow: 'from-emerald-400/20 to-teal-400/10' },
    { stageNumber: 3, name: '🏰 AI 智慧魔法殿堂', desc: 'AI 問答挑戰與原創繪本創作', bgGlow: 'from-indigo-400/20 to-purple-400/10' },
    { stageNumber: 4, name: '⛰️ 博學探險家山脈', desc: '跨國經典名著與長時專注夜讀', bgGlow: 'from-amber-500/20 to-orange-500/10' },
    { stageNumber: 5, name: '👑 傳奇繪本榮譽神殿', desc: '全能星章大師與傳奇學者', bgGlow: 'from-purple-500/25 to-pink-500/15' },
  ];

  const handleOpenMilestone = (m: LearningMilestone) => {
    playStarChime();
    setSelectedMilestone(m);
    if (m.unlocked) {
      confetti({
        particleCount: 35,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#F59E0B', '#10B981', '#6366F1', '#EC4899', '#FBBF24'],
      });
    }
  };

  const handleReadAloudStory = (m: LearningMilestone) => {
    setIsPlayingAudio(true);
    const speech = `學習里程碑：${m.title}。階段：${m.stageName}。解鎖故事：${m.unlockStory}。獲得獎勵：${m.rewardStars} 顆故事星章與稱號 ${m.bonusTitle || ''}`;
    speakText(speech, 'zh-TW', 0.95, 'teacher');
    setTimeout(() => {
      setIsPlayingAudio(false);
    }, 5000);
  };

  return (
    <div
      id="visual-learning-milestone-map"
      className={`p-6 sm:p-8 rounded-3xl border transition-all relative overflow-hidden ${
        darkMode
          ? 'bg-gradient-to-b from-slate-900 via-indigo-950/50 to-slate-900 border-amber-500/40 text-slate-100 shadow-2xl'
          : 'bg-gradient-to-b from-amber-50/95 via-yellow-50/60 to-orange-50/90 border-amber-300 shadow-lg text-amber-950'
      }`}
    >
      {/* 🌟 Floating Ambient Light Orbs & Keyframe Floats */}
      <div className="absolute top-4 left-10 w-72 h-72 bg-gradient-to-bl from-amber-400/20 via-yellow-300/15 to-transparent rounded-full blur-3xl pointer-events-none animate-map-float-slow" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-gradient-to-tr from-orange-400/20 via-rose-300/15 to-transparent rounded-full blur-3xl pointer-events-none animate-map-float-reverse" />
      <div className="absolute top-1/2 left-1/3 w-60 h-60 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none animate-map-float" />

      {/* Decorative Star Dust & Sparkle Elements */}
      <div className="absolute top-6 right-28 text-amber-400/60 pointer-events-none animate-star-twinkle">✦</div>
      <div className="absolute top-20 right-1/4 text-emerald-400/60 pointer-events-none animate-star-twinkle text-lg" style={{ animationDelay: '1.2s' }}>★</div>
      <div className="absolute bottom-24 left-16 text-purple-400/60 pointer-events-none animate-star-twinkle text-xl" style={{ animationDelay: '0.7s' }}>✧</div>
      <div className="absolute top-1/3 right-10 text-yellow-400/60 pointer-events-none animate-star-twinkle" style={{ animationDelay: '2.1s' }}>✦</div>

      {/* Header Section */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between border-b pb-5 mb-6 gap-4 border-amber-200/80 dark:border-slate-800">
        <div className="flex items-center gap-3.5">
          <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-orange-500 text-slate-950 shadow-lg animate-map-float">
            <Compass className="w-6 h-6 animate-spin" style={{ animationDuration: '16s' }} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2">
                <span>🗺️ 視覺化學習里程碑地圖</span>
              </h2>
              <span className="text-[10px] font-black bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 px-2.5 py-0.5 rounded-full shadow-xs animate-breathing-gold">
                ✦ 成長路徑全景圖
              </span>
              <span className="text-[10px] font-extrabold bg-emerald-500 text-white px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1 animate-pulse">
                <Sparkles className="w-3 h-3" /> 呼吸燈光特效中
              </span>
            </div>
            <p className={`text-xs font-semibold ${darkMode ? 'text-slate-300' : 'text-amber-900/80'}`}>
              點擊節點查閱「解鎖故事」、「條件標準」與「專屬榮譽稱號」；徽章飾點具備動態呼吸發光光效
            </p>
          </div>
        </div>

        {/* Global Progress Indicator & Glow Toggle */}
        <div className="flex items-center gap-3 self-start md:self-auto">
          <button
            type="button"
            onClick={() => {
              playStarChime();
              setGlowIntensity(glowIntensity === 'vibrant' ? 'normal' : 'vibrant');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all border cursor-pointer ${
              glowIntensity === 'vibrant'
                ? 'bg-amber-400 text-slate-950 border-amber-500 shadow-sm animate-breathing-gold'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
            }`}
          >
            <Sparkle className="w-3.5 h-3.5" />
            <span>{glowIntensity === 'vibrant' ? '✨ 炫彩呼吸燈: 開啟' : '💡 呼吸燈: 柔和'}</span>
          </button>

          <div className="text-right">
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
              里程碑解鎖進度
            </div>
            <div className="text-base sm:text-lg font-black text-amber-600 dark:text-amber-400">
              {unlockedCount} / {totalCount} <span className="text-xs font-bold text-slate-500">({completionPercent}%)</span>
            </div>
          </div>

          <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 border-2 border-amber-400 flex items-center justify-center shadow-md relative animate-badge-float-gentle">
            <Trophy className="w-7 h-7 text-amber-500 animate-radiant-pulse" />
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] font-black flex items-center justify-center shadow-xs animate-pulse">
              ✓
            </span>
          </div>
        </div>
      </div>

      {/* Category Filter Chips Bar */}
      <div className="relative z-10 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none mb-6">
        <span className={`text-xs font-bold whitespace-nowrap ${darkMode ? 'text-slate-400' : 'text-amber-900/70'}`}>
          篩選分類：
        </span>
        {[
          { id: 'all', label: '全部里程碑', icon: '🗺️' },
          { id: 'reading', label: '📖 故事閱讀', icon: '📖' },
          { id: 'vocab', label: '⭐ 生詞累積', icon: '⭐' },
          { id: 'multilingual', label: '🌐 雙語啟蒙', icon: '🌐' },
          { id: 'streak', label: '🔥 恆毅連讀', icon: '🔥' },
          { id: 'ai', label: '🦉 AI 智慧', icon: '🦉' },
          { id: 'creative', label: '🪄 創意發明', icon: '🪄' },
        ].map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                setSelectedCategory(cat.id);
                playPageTurnSound();
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer border flex items-center gap-1.5 ${
                isActive
                  ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-md scale-105 ring-2 ring-amber-300 animate-breathing-gold'
                  : darkMode
                  ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  : 'bg-white text-amber-950 border-amber-200/90 hover:bg-amber-100 shadow-2xs'
              }`}
            >
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Milestone Roadmap Stages Container */}
      <div className="relative z-10 space-y-8">
        {stages.map((stage) => {
          const stageMilestones = filteredMilestones.filter((m) => m.stageNumber === stage.stageNumber);
          if (stageMilestones.length === 0) return null;

          const stageUnlockedCount = stageMilestones.filter((m) => m.unlocked).length;
          const isStageCompleted = stageUnlockedCount === stageMilestones.length;

          return (
            <div
              key={stage.stageNumber}
              className={`p-5 sm:p-6 rounded-3xl border transition-all relative overflow-hidden ${
                darkMode
                  ? 'bg-slate-800/85 border-slate-700 shadow-md'
                  : 'bg-white/95 border-amber-200/90 shadow-sm'
              }`}
            >
              {/* Subtle background stage gradient glow */}
              <div className={`absolute top-0 right-0 w-96 h-full bg-gradient-to-l ${stage.bgGlow} pointer-events-none blur-2xl`} />

              {/* Stage Header Banner */}
              <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between border-b pb-3 mb-5 gap-2 border-amber-100 dark:border-slate-700">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 font-black text-sm flex items-center justify-center shadow-xs animate-map-float">
                    {stage.stageNumber}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100">
                        {stage.name}
                      </h3>
                      {isStageCompleted && (
                        <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 flex items-center gap-1 animate-breathing-emerald">
                          <Sparkles className="w-3 h-3" /> 階段全通關
                        </span>
                      )}
                    </div>
                    <p className={`text-xs font-semibold ${darkMode ? 'text-slate-400' : 'text-amber-900/70'}`}>
                      {stage.desc}
                    </p>
                  </div>
                </div>

                <div className="text-xs font-extrabold text-amber-800 dark:text-amber-300 bg-amber-100/70 dark:bg-slate-900 px-3 py-1 rounded-xl border border-amber-200 dark:border-slate-700 self-start sm:self-auto flex items-center gap-1.5">
                  <Route className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 animate-pulse" />
                  <span>已達成 {stageUnlockedCount} / {stageMilestones.length} 節點</span>
                </div>
              </div>

              {/* Stage Milestone Nodes Grid */}
              <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {stageMilestones.map((m, mIdx) => {
                  const isUnlocked = m.unlocked;
                  const isLegendary = m.rarity === '傳奇';
                  const isEpic = m.rarity === '史詩';
                  const isRare = m.rarity === '稀有';

                  // Dynamic breathing glow class based on rarity and unlocked status
                  let breathingClass = '';
                  let badgeGlowClass = '';
                  if (isUnlocked) {
                    if (isLegendary) {
                      breathingClass = 'animate-breathing-purple';
                      badgeGlowClass = 'animate-breathing-purple ring-2 ring-purple-400';
                    } else if (isEpic) {
                      breathingClass = 'animate-breathing-gold';
                      badgeGlowClass = 'animate-breathing-gold ring-2 ring-amber-400';
                    } else if (isRare) {
                      breathingClass = 'animate-breathing-cyan';
                      badgeGlowClass = 'animate-breathing-cyan ring-2 ring-cyan-400';
                    } else {
                      breathingClass = 'animate-breathing-emerald';
                      badgeGlowClass = 'animate-breathing-emerald ring-2 ring-emerald-400';
                    }
                  }

                  return (
                    <div
                      key={m.id}
                      onClick={() => handleOpenMilestone(m)}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative group flex flex-col justify-between overflow-hidden ${
                        isUnlocked
                          ? 'bg-gradient-to-b from-amber-50/95 to-orange-50/70 dark:from-slate-800 dark:to-amber-950/40 border-amber-400 shadow-sm hover:shadow-xl hover:-translate-y-1.5'
                          : 'bg-slate-50/70 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 opacity-70 hover:opacity-100 hover:border-amber-300'
                      }`}
                    >
                      {/* Holographic Shimmer for Unlocked & Rare Nodes */}
                      {isUnlocked && (
                        <div className="absolute inset-0 pointer-events-none opacity-20 group-hover:opacity-40 animate-holo-shimmer" />
                      )}

                      {/* Milestone Number & Status Badge */}
                      <div className="flex items-center justify-between mb-2 relative z-10">
                        <span className="text-[10px] font-black text-amber-900 dark:text-amber-300 bg-amber-200/80 dark:bg-slate-700 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <span>#{m.stepNumber}</span>
                          <span className="opacity-80">· {m.categoryLabel}</span>
                        </span>

                        <div className="flex items-center gap-1.5">
                          <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full shadow-2xs ${
                            isLegendary
                              ? 'bg-purple-600 text-white animate-pulse'
                              : isEpic
                              ? 'bg-rose-500 text-white'
                              : isRare
                              ? 'bg-sky-500 text-white'
                              : 'bg-slate-500 text-white'
                          }`}>
                            {m.rarity}
                          </span>

                          {isUnlocked ? (
                            <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5 bg-emerald-100 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded-md">
                              <CheckCircle2 className="w-3 h-3" /> 已解鎖
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold text-slate-400 flex items-center gap-0.5 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md">
                              <Lock className="w-2.5 h-2.5" /> 進行中
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Main Icon with Breathing Glow Animation */}
                      <div className="flex items-start gap-3 my-1.5 relative z-10">
                        <div className="relative">
                          {/* Pulsing ring underneath unlocked milestone badge */}
                          {isUnlocked && (
                            <div className={`absolute inset-0 rounded-2xl ${
                              isLegendary ? 'bg-purple-400/40' : isEpic ? 'bg-amber-400/40' : 'bg-emerald-400/40'
                            } animate-pulse-ring pointer-events-none`} />
                          )}

                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0 shadow-inner border transition-transform group-hover:scale-110 ${
                            isUnlocked
                              ? `bg-gradient-to-tr from-amber-100 via-yellow-100 to-orange-100 dark:from-slate-700 dark:to-slate-800 border-amber-300 dark:border-slate-600 ${badgeGlowClass} ${
                                  mIdx % 2 === 0 ? 'animate-map-float' : 'animate-map-float-slow'
                                }`
                              : 'bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700'
                          }`}>
                            {m.icon}
                          </div>
                        </div>

                        <div className="min-w-0 flex-1">
                          <h4 className="font-black text-sm text-slate-900 dark:text-slate-100 leading-snug group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                            {m.title}
                          </h4>
                          <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                            {m.subtitle}
                          </p>
                          <div className="text-[10px] font-bold text-amber-700 dark:text-amber-400 mt-1 flex items-center gap-1 flex-wrap">
                            <span className="bg-amber-200/70 dark:bg-slate-700 px-1.5 py-0.5 rounded">+{m.rewardStars} ⭐</span>
                            {m.bonusTitle && <span className="opacity-90 font-extrabold">· {m.bonusTitle}</span>}
                          </div>
                        </div>
                      </div>

                      {/* Progress Bar & Click prompt */}
                      <div className="pt-2 border-t border-amber-100 dark:border-slate-700/80 mt-2 space-y-1 relative z-10">
                        <div className="flex justify-between text-[10px] font-bold text-slate-500 dark:text-slate-400">
                          <span>進度：{m.currentProgress} / {m.targetProgress} {m.progressUnit}</span>
                          <span className="text-amber-600 dark:text-amber-400 font-extrabold flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                            查閱故事 <ChevronRight className="w-3 h-3" />
                          </span>
                        </div>

                        <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden p-0.5">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isUnlocked ? 'bg-gradient-to-r from-emerald-400 to-teal-500 shadow-xs' : 'bg-gradient-to-r from-amber-500 to-orange-500'
                            }`}
                            style={{ width: `${Math.min(100, (m.currentProgress / m.targetProgress) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* 🌟 Interactive Milestone Detail Inspector Modal */}
      {selectedMilestone && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-lg w-full border-4 border-amber-400 shadow-2xl space-y-5 text-center relative max-h-[90vh] overflow-y-auto custom-scrollbar">
            
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setSelectedMilestone(null)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Glowing Big Milestone Icon with Breathing Glow Animation */}
            <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-tr from-amber-100 via-yellow-100 to-orange-100 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center text-5xl border-4 border-amber-400 shadow-xl animate-breathing-gold relative">
              <span className="animate-map-float">{selectedMilestone.icon}</span>
              <span className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-sm">
                #{selectedMilestone.stepNumber}
              </span>
            </div>

            {/* Header Titles */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 uppercase">
                  {selectedMilestone.stageName}
                </span>
                <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full text-white ${
                  selectedMilestone.rarity === '傳奇'
                    ? 'bg-purple-600 animate-pulse'
                    : selectedMilestone.rarity === '史詩'
                    ? 'bg-rose-500'
                    : selectedMilestone.rarity === '稀有'
                    ? 'bg-sky-500'
                    : 'bg-slate-500'
                }`}>
                  {selectedMilestone.rarity}里程碑
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
                {selectedMilestone.title}
              </h3>
              <p className="text-xs font-bold text-amber-700 dark:text-amber-400">
                {selectedMilestone.subtitle}
              </p>
            </div>

            {/* 📖 詳細解鎖故事 (Detailed Unlock Narrative Story) */}
            <div className="p-4 rounded-2xl bg-amber-50/90 dark:bg-slate-800 border border-amber-200 dark:border-slate-700 text-left space-y-2">
              <div className="flex items-center justify-between text-amber-900 dark:text-amber-300 font-extrabold text-xs">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500 animate-spin" style={{ animationDuration: '4s' }} />
                  <span>里程碑故事與精神意涵：</span>
                </div>

                <button
                  type="button"
                  onClick={() => handleReadAloudStory(selectedMilestone)}
                  disabled={isPlayingAudio}
                  className="px-2.5 py-1 rounded-xl bg-amber-200 hover:bg-amber-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-amber-950 dark:text-amber-200 font-black text-[11px] flex items-center gap-1 transition-all cursor-pointer"
                >
                  <Volume2 className={`w-3.5 h-3.5 ${isPlayingAudio ? 'animate-bounce text-amber-600' : ''}`} />
                  <span>{isPlayingAudio ? '朗讀中...' : '語音朗讀'}</span>
                </button>
              </div>

              <p className="text-xs font-medium text-slate-700 dark:text-slate-200 leading-relaxed bg-white/70 dark:bg-slate-900/60 p-3 rounded-xl border border-amber-100 dark:border-slate-700">
                {selectedMilestone.unlockStory}
              </p>
            </div>

            {/* 🎯 解鎖與獎勵條件標準 (Unlock Criteria & Progress) */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-left space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-800 dark:text-slate-200">
                <HelpCircle className="w-4 h-4 text-amber-500" />
                <span>解鎖條件與標準：</span>
              </div>
              <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                {selectedMilestone.unlockConditionText}
              </p>

              <div className="pt-2 space-y-1">
                <div className="flex justify-between text-[11px] font-black text-slate-600 dark:text-slate-300">
                  <span>達成進度：{selectedMilestone.currentProgress} / {selectedMilestone.targetProgress} {selectedMilestone.progressUnit}</span>
                  <span className={selectedMilestone.unlocked ? 'text-emerald-600 dark:text-emerald-400 font-black' : 'text-amber-600'}>
                    {selectedMilestone.unlocked ? '✓ 已達成標準' : '進行中...'}
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden p-0.5">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      selectedMilestone.unlocked ? 'bg-emerald-500 shadow-xs' : 'bg-gradient-to-r from-amber-500 to-orange-500'
                    }`}
                    style={{ width: `${Math.min(100, (selectedMilestone.currentProgress / selectedMilestone.targetProgress) * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* 🎁 專屬成就獎勵清單 (Rewards Breakdown) */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-100/60 to-yellow-100/60 dark:from-slate-800 dark:to-slate-800 border border-amber-200 dark:border-slate-700 text-left space-y-1.5">
              <div className="text-xs font-black text-amber-950 dark:text-amber-300 flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5 text-amber-600" />
                <span>通關獎勵清單：</span>
              </div>
              <div className="flex flex-wrap gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                <span className="bg-amber-200/80 dark:bg-slate-700 px-2.5 py-1 rounded-xl text-amber-950 dark:text-amber-200">
                  ⭐ +{selectedMilestone.rewardStars} 顆故事星章
                </span>
                {selectedMilestone.bonusTitle && (
                  <span className="bg-purple-100 dark:bg-purple-950/80 text-purple-900 dark:text-purple-200 px-2.5 py-1 rounded-xl">
                    👑 專屬稱號：{selectedMilestone.bonusTitle}
                  </span>
                )}
                {selectedMilestone.bonusItem && (
                  <span className="bg-rose-100 dark:bg-rose-950/80 text-rose-900 dark:text-rose-200 px-2.5 py-1 rounded-xl">
                    {selectedMilestone.bonusItem}
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedMilestone(null)}
                className="w-full sm:flex-1 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs sm:text-sm shadow-md transition-transform hover:scale-102 cursor-pointer"
              >
                太棒了！已了解
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

