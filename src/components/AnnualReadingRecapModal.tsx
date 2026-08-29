import React, { useState } from 'react';
import {
  X, Sparkles, Award, Star, Share2, BookOpen, Clock, Heart, Crown,
  Download, CheckCircle2, Copy, Flame, Trophy, Layers, Palette, RefreshCw
} from 'lucide-react';
import { UserProfile, Book, SocialPost, SocialThemeBackground } from '../types';
import { playStarChime, playPageTurnSound } from '../utils/audio';

interface AnnualReadingRecapModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  books: Book[];
  onAwardStar: (stars: number) => void;
  darkMode?: boolean;
}

const MILESTONE_TITLES = [
  '🌟 年度童心閱讀星章大師',
  '🚀 故事閱讀探險小學霸',
  '📚 繪本奇幻世界狂熱達人',
  '💖 溫馨繪本金牌同理心使者',
  '🦉 智慧貓頭鷹知識藏書家',
];

const RECAP_THEMES: { id: SocialThemeBackground; label: string; icon: string; bgClass: string; borderClass: string; textClass: string }[] = [
  { id: 'starry', label: '🌌 璀璨夜空', icon: '✨', bgClass: 'from-slate-950 via-purple-950 to-indigo-950', borderClass: 'border-purple-400/80', textClass: 'text-purple-200' },
  { id: 'golden', label: '🌅 晨曦金色', icon: '🌄', bgClass: 'from-amber-950 via-orange-900 to-rose-950', borderClass: 'border-amber-400/80', textClass: 'text-amber-200' },
  { id: 'candy', label: '🍬 夢幻彩虹', icon: '🍭', bgClass: 'from-pink-950 via-rose-900 to-purple-950', borderClass: 'border-pink-400/80', textClass: 'text-pink-200' },
  { id: 'forest', label: '🍃 秘境森林', icon: '🌿', bgClass: 'from-emerald-950 via-teal-900 to-slate-950', borderClass: 'border-emerald-400/80', textClass: 'text-emerald-200' },
  { id: 'castle', label: '🏰 城堡夢想', icon: '🏰', bgClass: 'from-blue-950 via-indigo-950 to-slate-950', borderClass: 'border-cyan-400/80', textClass: 'text-cyan-200' },
];

export const AnnualReadingRecapModal: React.FC<AnnualReadingRecapModalProps> = ({
  isOpen,
  onClose,
  profile,
  books,
  onAwardStar,
  darkMode = false,
}) => {
  const [selectedTitle, setSelectedTitle] = useState(MILESTONE_TITLES[0]);
  const [selectedTheme, setSelectedTheme] = useState<SocialThemeBackground>('starry');
  const [personalQuote, setPersonalQuote] = useState('「每一本繪本都是通往夢想城堡的星光鑰匙，讓我勇敢擁抱未知！」');
  const [isSharedToWall, setIsSharedToWall] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  if (!isOpen) return null;

  // Derive Reading Stats
  const readBooksCount = profile.readBookIds?.length || 0;
  const completedBooks = books.filter((b) => profile.readBookIds.includes(b.id));
  const totalMinutes = profile.readingMinutes || 120;
  const estimatedWords = totalMinutes * 180;
  const streakDays = profile.streakDays || 7;
  const totalStars = profile.stars || 85;
  const unlockedBadges = profile.badges.filter((b) => b.unlocked).length;

  const currentThemeObj = RECAP_THEMES.find((t) => t.id === selectedTheme) || RECAP_THEMES[0];

  const handleShareToWall = () => {
    try {
      const existingPostsStr = localStorage.getItem('child_reading_social_posts');
      let existingPosts: SocialPost[] = [];
      if (existingPostsStr) {
        existingPosts = JSON.parse(existingPostsStr);
      }

      const newPost: SocialPost = {
        id: `recap_post_${Date.now()}`,
        authorName: profile.name,
        authorAvatar: profile.avatar,
        isMe: true,
        bookId: completedBooks[0]?.id || 'recap-1',
        bookTitle: `【2026 年度童心閱讀里程碑總結卡】`,
        bookCover: completedBooks[0]?.coverUrl || 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80',
        thoughts: `🎉 我的 2026 年度閱讀成績單出爐囉！榮獲【${selectedTitle}】榮譽稱號！今年累積閱讀了 ${readBooksCount} 本精選繪本、共專注 ${totalMinutes} 分鐘！${personalQuote}`,
        ratingStars: 5,
        themeBackground: selectedTheme,
        createdAt: '剛剛',
        likesCount: 1,
        isLikedByMe: true,
        tags: ['#年度閱讀回顧', '#閱讀里程碑', '#故事探險家'],
        comments: [
          {
            id: 'c1',
            authorName: '貓頭鷹智慧助手 🦉',
            authorAvatar: '🦉',
            content: '哇！太了不起了！期待你新的一年繼續在故事王國裡綻放光芒！✨',
            createdAt: '剛剛',
          },
        ],
      };

      const updated = [newPost, ...existingPosts];
      localStorage.setItem('child_reading_social_posts', JSON.stringify(updated));

      setIsSharedToWall(true);
      playStarChime();
      onAwardStar(15);
      setTimeout(() => setIsSharedToWall(false), 3000);
    } catch {
      // ignore
    }
  };

  const handleCopyRecapSummary = () => {
    const textToCopy = `🏆【${profile.name}的 2026 年度閱讀里程碑】🏆\n✨ 榮獲稱號：${selectedTitle}\n📖 累積閱讀：${readBooksCount} 本精選繪本\n⏱️ 專注時長：${totalMinutes} 分鐘 (約 ${estimatedWords} 字)\n🔥 連續閱讀：${streakDays} 天\n⭐ 獲得星星：${totalStars} 顆\n🏆 解鎖成就：${unlockedBadges} 枚勳章\n💬 座右銘：${personalQuote}\n— 發自 童心大師繪本童年`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy);
      setIsCopied(true);
      playStarChime();
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[94vh] flex flex-col rounded-3xl bg-slate-900 border-2 border-amber-400/80 text-slate-100 shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-amber-400/30 bg-slate-900/90 z-10">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-yellow-400 text-slate-950 font-black shadow-lg">
              <Trophy className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] shadow-xs">
                  🏆 2026 年度閱讀里程碑生成器
                </span>
                <span className="text-[10px] font-bold text-amber-300">
                  {profile.name} 的專屬童心回顧
                </span>
              </div>
              <h3 className="text-base sm:text-xl font-black text-amber-200">
                年度閱讀回顧里程碑卡 (Annual Reading Recap Studio)
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar">
          
          {/* Card Customization Toolbar Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-800/90 border border-amber-400/30">
            {/* Title Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-amber-300 flex items-center gap-1">
                <Award className="w-4 h-4 text-amber-400" />
                <span>選擇你最滿意的年度榮譽稱號：</span>
              </label>
              <select
                value={selectedTitle}
                onChange={(e) => {
                  setSelectedTitle(e.target.value);
                  playPageTurnSound();
                }}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-amber-200 font-black text-xs sm:text-sm focus:outline-none focus:border-amber-400"
              >
                {MILESTONE_TITLES.map((title) => (
                  <option key={title} value={title}>
                    {title}
                  </option>
                ))}
              </select>
            </div>

            {/* Theme Frame Style Switcher */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-amber-300 flex items-center gap-1">
                <Palette className="w-4 h-4 text-amber-400" />
                <span>切換紀念卡片藝術框風格：</span>
              </label>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
                {RECAP_THEMES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setSelectedTheme(t.id);
                      playPageTurnSound();
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black shrink-0 transition-all cursor-pointer ${
                      selectedTheme === t.id
                        ? 'bg-amber-400 text-slate-950 shadow-md scale-105'
                        : 'bg-slate-900 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Personal Quote Input */}
            <div className="md:col-span-2 space-y-1">
              <label className="text-xs font-black text-slate-300">
                修改個人閱讀座右銘與感言：
              </label>
              <input
                type="text"
                value={personalQuote}
                onChange={(e) => setPersonalQuote(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-medium text-xs sm:text-sm focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* 🌟 Beautiful Rendered Milestone Card Preview 🌟 */}
          <div className={`p-6 sm:p-8 rounded-3xl bg-gradient-to-br ${currentThemeObj.bgClass} border-4 ${currentThemeObj.borderClass} shadow-2xl relative overflow-hidden space-y-6 text-white animate-fadeIn`}>
            
            {/* Background Decorative Star Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Card Top Title Header */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-white/20 pb-4 relative z-10">
              <div className="flex items-center gap-4 text-center sm:text-left">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/20 backdrop-blur-md border-2 border-amber-300 flex items-center justify-center text-4xl sm:text-5xl shadow-xl">
                  {profile.avatar}
                </div>
                <div>
                  <span className="px-3 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] shadow-sm">
                    {selectedTitle}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-amber-200 mt-1">
                    {profile.name} 的 2026 年度閱讀回顧卡
                  </h3>
                  <p className="text-xs text-amber-100/80 font-bold mt-0.5">
                    童心大師繪本童年 · 閱讀成長里程碑認證 📜
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center shrink-0">
                <div className="text-[10px] font-bold text-amber-300">綜合閱讀評級</div>
                <div className="text-2xl font-black text-amber-200">S S S 級</div>
              </div>
            </div>

            {/* Core Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 relative z-10">
              <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-1">
                <div className="text-[10px] font-bold text-amber-300 flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>閱讀精選繪本</span>
                </div>
                <div className="text-xl font-black text-white">{readBooksCount} 本</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-1">
                <div className="text-[10px] font-bold text-amber-300 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>專注累積時長</span>
                </div>
                <div className="text-xl font-black text-amber-200">{totalMinutes} 分鐘</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-1">
                <div className="text-[10px] font-bold text-amber-300 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-orange-400" />
                  <span>持續連讀紀錄</span>
                </div>
                <div className="text-xl font-black text-orange-300">{streakDays} 天</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-1">
                <div className="text-[10px] font-bold text-amber-300 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" />
                  <span>累積故事星星</span>
                </div>
                <div className="text-xl font-black text-yellow-200">{totalStars} 顆</div>
              </div>
            </div>

            {/* Read Books Cover Showcase Wall */}
            {completedBooks.length > 0 && (
              <div className="space-y-2 relative z-10">
                <div className="text-xs font-black text-amber-200 flex items-center gap-1.5">
                  <Heart className="w-4 h-4 fill-amber-300 text-amber-300" />
                  <span>年度最喜愛的繪本名冊：</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {completedBooks.slice(0, 4).map((b) => (
                    <div
                      key={b.id}
                      className="p-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center gap-2"
                    >
                      <img
                        src={b.coverUrl}
                        alt="Cover"
                        className="w-10 h-12 rounded-lg object-cover shrink-0 border border-white/30"
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-black truncate text-white">
                          {typeof b.title === 'string' ? b.title : (b.title['zh-TW'] || b.title.en)}
                        </div>
                        <span className="text-[10px] font-bold text-amber-300">⭐ 5.0 讀完</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Personal Quote Banner */}
            <div className="p-4 rounded-2xl bg-black/40 backdrop-blur-md border border-white/20 text-center space-y-1 relative z-10">
              <span className="text-[10px] font-black text-amber-300 uppercase tracking-widest">
                — 心靈感言與成長座右銘 —
              </span>
              <p className="text-xs sm:text-sm font-bold text-amber-100 italic">
                {personalQuote}
              </p>
            </div>
          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-slate-950 border-t border-amber-400/20 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-amber-300 font-bold">
            <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
            <span>分享回顧卡可獲得 +15 ⭐ 故事星星獎勵！</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyRecapSummary}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-200 font-black text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{isCopied ? '✅ 已複製總結卡文字' : '複製總結文字'}</span>
            </button>

            <button
              type="button"
              onClick={handleShareToWall}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-lg transition-transform hover:scale-105 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{isSharedToWall ? '🎉 已成功發布至社交牆！' : '🚀 一鍵發布至閱讀社交牆'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
