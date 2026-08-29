import React from 'react';
import { BookOpen, Sparkles, Bookmark, Award, Settings, Star, Wand2, Globe, Moon, Sun, Wifi, WifiOff, HardDriveDownload, Layers, Puzzle, CalendarDays, Headphones, Trophy, BarChart3, HardDrive, Compass } from 'lucide-react';
import { UserProfile } from '../types';

interface NavbarProps {
  activeTab: 'library' | 'bookshelf' | 'creator' | 'wordbank' | 'profile';
  setActiveTab: (tab: 'library' | 'bookshelf' | 'creator' | 'wordbank' | 'profile') => void;
  userProfile: UserProfile;
  onOpenSettings: () => void;
  customBooksCount: number;
  userWordsCount: number;
  darkMode?: boolean;
  onToggleTheme?: () => void;
  isOnline?: boolean;
  offlineBooksCount?: number;
  onOpenOfflineAnalytics?: () => void;
  onOpenYesterdayRecap?: () => void;
  onOpenCharacterPuzzle?: () => void;
  onOpenVoiceSummary?: () => void;
  onOpenAchievementWall?: () => void;
  onOpenOfflineBookshelfManager?: () => void;
  onOpenLearningAnalytics?: () => void;
  onOpenPersonalAchievements?: () => void;
  onOpenProgressOverview?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  userProfile,
  onOpenSettings,
  userWordsCount,
  darkMode = false,
  onToggleTheme,
  isOnline = true,
  offlineBooksCount = 0,
  onOpenOfflineAnalytics,
  onOpenYesterdayRecap,
  onOpenCharacterPuzzle,
  onOpenVoiceSummary,
  onOpenAchievementWall,
  onOpenOfflineBookshelfManager,
  onOpenLearningAnalytics,
  onOpenPersonalAchievements,
  onOpenProgressOverview,
}) => {
  return (
    <header className={`sticky top-0 z-40 backdrop-blur-md border-b transition-colors ${
      darkMode
        ? 'bg-slate-900/90 border-slate-800 text-slate-100'
        : 'bg-amber-50/90 border-amber-200/60 shadow-xs'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo */}
          <div
            onClick={() => setActiveTab('library')}
            className="flex items-center gap-3 cursor-pointer group"
            id="nav-logo"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-400 to-amber-300 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
              <Globe className="w-6 h-6 sm:w-7 sm:h-7 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className={`font-extrabold text-lg sm:text-xl tracking-tight ${darkMode ? 'text-amber-300' : 'text-amber-950'}`}>
                  世界童書數位圖書館
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold border ${
                  darkMode ? 'bg-amber-950 text-amber-200 border-amber-800' : 'bg-amber-200/70 text-amber-900 border-amber-300'
                }`}>
                  多語言版
                </span>
              </div>
              <p className={`text-xs font-medium hidden sm:block ${darkMode ? 'text-slate-400' : 'text-amber-800/80'}`}>
                World Children's Digital Library • 陪孩子用繪本看世界
              </p>
            </div>
          </div>

          {/* Center Navigation Links */}
          <nav className={`hidden md:flex items-center gap-1 p-1.5 rounded-2xl border ${
            darkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-amber-100/60 border-amber-200/80'
          }`} id="main-navigation">
            <button
              id="nav-tab-library"
              onClick={() => setActiveTab('library')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'library'
                  ? 'bg-amber-500 text-white shadow-sm scale-[1.02]'
                  : darkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-amber-900 hover:bg-amber-200/50 hover:text-amber-950'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>館藏繪本</span>
            </button>

            <button
              id="nav-tab-bookshelf"
              onClick={() => setActiveTab('bookshelf')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'bookshelf'
                  ? 'bg-amber-500 text-white shadow-sm scale-[1.02]'
                  : darkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-amber-900 hover:bg-amber-200/50 hover:text-amber-950'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>主題書架</span>
            </button>

            <button
              id="nav-tab-creator"
              onClick={() => setActiveTab('creator')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'creator'
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm scale-[1.02]'
                  : darkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-amber-900 hover:bg-amber-200/50 hover:text-amber-950'
              }`}
            >
              <Wand2 className="w-4 h-4 text-amber-200" />
              <span>AI 創作工坊</span>
            </button>

            <button
              id="nav-tab-wordbank"
              onClick={() => setActiveTab('wordbank')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all relative ${
                activeTab === 'wordbank'
                  ? 'bg-amber-500 text-white shadow-sm scale-[1.02]'
                  : darkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-amber-900 hover:bg-amber-200/50 hover:text-amber-950'
              }`}
            >
              <Bookmark className="w-4 h-4" />
              <span>我的生字本</span>
              {userWordsCount > 0 && (
                <span className="bg-orange-500 text-white text-[10px] font-extrabold px-1.5 py-0.2 rounded-full ml-0.5">
                  {userWordsCount}
                </span>
              )}
            </button>

            <button
              id="nav-tab-profile"
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'profile'
                  ? 'bg-amber-500 text-white shadow-sm scale-[1.02]'
                  : darkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-amber-900 hover:bg-amber-200/50 hover:text-amber-950'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>閱讀成就</span>
            </button>
          </nav>

          {/* Right Actions: Offline/PWA Status, Theme Toggle, Stars, Settings & Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* 📢 本日閱讀總結語音播報按鈕 */}
            {onOpenVoiceSummary && (
              <button
                id="btn-nav-voice-summary"
                onClick={onOpenVoiceSummary}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-2xl text-xs font-black border transition-all cursor-pointer hover:scale-105 ${
                  darkMode
                    ? 'bg-amber-950/80 text-amber-300 border-amber-800 hover:bg-amber-900'
                    : 'bg-gradient-to-r from-amber-400 to-orange-400 text-slate-950 border-amber-300 hover:from-amber-500 hover:to-orange-500 shadow-2xs'
                }`}
                title="收聽今日閱讀總結與學習成果語音播報"
              >
                <Headphones className="w-4 h-4 text-slate-950 animate-pulse" />
                <span className="hidden md:inline">今日總結</span>
              </button>
            )}

            {/* 📊 學習數據概述按鈕 */}
            {onOpenLearningAnalytics && (
              <button
                id="btn-nav-learning-analytics"
                onClick={onOpenLearningAnalytics}
                className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-black border transition-all cursor-pointer hover:scale-105 ${
                  darkMode
                    ? 'bg-blue-950/80 text-blue-200 border-blue-800 hover:bg-blue-900'
                    : 'bg-blue-100/90 text-blue-950 border-blue-300 hover:bg-blue-200 shadow-2xs'
                }`}
                title="查看全方位閱讀學習數據概述與 AI 診斷"
              >
                <BarChart3 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>學習數據</span>
              </button>
            )}

            {/* 💾 離線書架管理按鈕 */}
            {onOpenOfflineBookshelfManager && (
              <button
                id="btn-nav-offline-bookshelf-mgr"
                onClick={onOpenOfflineBookshelfManager}
                className={`hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-black border transition-all cursor-pointer hover:scale-105 ${
                  darkMode
                    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800 hover:bg-emerald-900'
                    : 'bg-emerald-100 text-emerald-950 border-emerald-300 hover:bg-emerald-200 shadow-2xs'
                }`}
                title="管理離線下載繪本與本機快取容量"
              >
                <HardDrive className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>離線書架</span>
              </button>
            )}

            {/* 🧭 個人閱讀進度總覽按鈕 */}
            {onOpenProgressOverview && (
              <button
                id="btn-nav-reading-progress-overview"
                onClick={onOpenProgressOverview}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-black border transition-all cursor-pointer hover:scale-105 ${
                  darkMode
                    ? 'bg-amber-950/80 text-amber-200 border-amber-800 hover:bg-amber-900'
                    : 'bg-amber-100 text-amber-950 border-amber-300 hover:bg-amber-200 shadow-2xs'
                }`}
                title="查看進行中未讀完繪本與閱讀進度總覽"
              >
                <Compass className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span className="hidden sm:inline">閱讀進度</span>
              </button>
            )}

            {/* 🌟 個人閱讀成就總覽按鈕 */}
            {onOpenPersonalAchievements && (
              <button
                id="btn-nav-personal-achievements"
                onClick={onOpenPersonalAchievements}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-black border transition-all cursor-pointer hover:scale-105 ${
                  darkMode
                    ? 'bg-amber-950/90 text-amber-300 border-amber-700 hover:bg-amber-900'
                    : 'bg-gradient-to-r from-amber-300 via-orange-300 to-yellow-300 text-slate-950 border-amber-400 hover:from-amber-400 hover:to-orange-400 shadow-2xs'
                }`}
                title="開啟個人閱讀成就總覽與小狀元榮譽殿堂"
              >
                <Trophy className="w-4 h-4 text-amber-600 dark:text-amber-300" />
                <span className="hidden sm:inline">成就總覽</span>
              </button>
            )}

            {/* 🏆 成就展示牆按鈕 */}
            {onOpenAchievementWall && (
              <button
                id="btn-nav-achievement-wall"
                onClick={onOpenAchievementWall}
                className={`hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-black border transition-all cursor-pointer hover:scale-105 ${
                  darkMode
                    ? 'bg-purple-950/80 text-purple-200 border-purple-800 hover:bg-purple-900'
                    : 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-900 border-purple-300 hover:bg-purple-200 shadow-2xs'
                }`}
                title="開啟個人讀書成就榮譽展示牆"
              >
                <Trophy className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>成就牆</span>
              </button>
            )}

            {/* 🧩 互動式角色拼圖按鈕 */}
            {onOpenCharacterPuzzle && (
              <button
                id="btn-nav-character-puzzle"
                onClick={onOpenCharacterPuzzle}
                className={`hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-black border transition-all cursor-pointer hover:scale-105 ${
                  darkMode
                    ? 'bg-purple-950/80 text-purple-200 border-purple-800 hover:bg-purple-900'
                    : 'bg-purple-100/90 text-purple-900 border-purple-300 hover:bg-purple-200 shadow-2xs'
                }`}
                title="開啟互動式繪本角色拼圖挑戰"
              >
                <Puzzle className="w-4 h-4 text-purple-500 animate-pulse" />
                <span>角色拼圖</span>
              </button>
            )}

            {/* 📖 昨日閱讀回顧按鈕 */}
            {onOpenYesterdayRecap && (
              <button
                id="btn-nav-yesterday-recap"
                onClick={onOpenYesterdayRecap}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-2xl text-xs font-black border transition-all cursor-pointer hover:scale-105 ${
                  darkMode
                    ? 'bg-amber-950/80 text-amber-300 border-amber-800 hover:bg-amber-900'
                    : 'bg-amber-200/90 text-amber-950 border-amber-300 hover:bg-amber-300 shadow-2xs'
                }`}
                title="查看昨日閱讀時長、學到的新單字與學習統計"
              >
                <CalendarDays className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span className="hidden sm:inline">昨日回顧</span>
              </button>
            )}

            {/* PWA & Offline Status Badge */}
            <div
              id="pwa-offline-status-badge"
              onClick={() => {
                if (onOpenOfflineAnalytics) {
                  onOpenOfflineAnalytics();
                } else {
                  setActiveTab('library');
                }
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-2xl text-xs font-black border cursor-pointer transition-all ${
                !isOnline
                  ? 'bg-rose-500 text-white border-rose-600 shadow-md animate-pulse'
                  : darkMode
                  ? 'bg-slate-800 text-emerald-400 border-slate-700 hover:bg-slate-700'
                  : 'bg-emerald-100 text-emerald-900 border-emerald-300 hover:bg-emerald-200'
              }`}
              title={
                !isOnline
                  ? `目前處於離線狀態，可閱讀 ${offlineBooksCount} 本已下載/最近閱讀之繪本`
                  : `網絡正常 • 已快取 ${offlineBooksCount} 本繪本供離線閱讀`
              }
            >
              {!isOnline ? (
                <>
                  <WifiOff className="w-4 h-4 text-white shrink-0" />
                  <span className="hidden sm:inline">離線閱讀 ({offlineBooksCount})</span>
                  <span className="sm:hidden">離線</span>
                </>
              ) : (
                <>
                  <Wifi className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="hidden lg:inline text-[11px]">離線庫 ({offlineBooksCount})</span>
                </>
              )}
            </div>

            {/* Dark / Light Theme Button */}
            {onToggleTheme && (
              <button
                id="btn-toggle-dark-mode"
                onClick={onToggleTheme}
                className={`p-2 sm:p-2.5 rounded-2xl border transition-all hover:scale-105 active:scale-95 ${
                  darkMode
                    ? 'bg-purple-950 text-amber-300 border-purple-800 hover:bg-purple-900'
                    : 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200/70'
                }`}
                title={darkMode ? '切換為淺色模式' : '切換為深色護眼模式'}
              >
                {darkMode ? <Sun className="w-5 h-5 text-amber-300" /> : <Moon className="w-5 h-5 text-purple-700" />}
              </button>
            )}

            {/* Stars Count Badge */}
            <div
              id="user-stars-badge"
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs sm:text-sm font-bold cursor-pointer transition-colors border ${
                darkMode
                  ? 'bg-slate-800 text-amber-300 border-slate-700'
                  : 'bg-amber-100 hover:bg-amber-200/70 border-amber-300 text-amber-900'
              }`}
              title="故事星章數"
            >
              <Star className="w-4 h-4 fill-amber-400 text-amber-500 animate-spin-slow" />
              <span>{userProfile.stars}</span>
            </div>

            {/* Settings Button */}
            <button
              id="btn-open-settings"
              onClick={onOpenSettings}
              className={`p-2 sm:p-2.5 rounded-2xl border transition-colors ${
                darkMode
                  ? 'text-slate-200 hover:bg-slate-800 border-slate-700'
                  : 'text-amber-900 hover:bg-amber-200/60 border-amber-200/80'
              }`}
              title="閱讀與語音角色設定"
            >
              <Settings className="w-5 h-5" />
            </button>

            {/* Profile Avatar */}
            <button
              id="btn-nav-profile-avatar"
              onClick={() => setActiveTab('profile')}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-amber-200 border-2 border-amber-400 flex items-center justify-center text-lg shadow-xs hover:scale-105 transition-transform"
              title={userProfile.name}
            >
              {userProfile.avatar}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className={`md:hidden flex items-center justify-around border-t py-2 px-2 ${
        darkMode ? 'bg-slate-900 border-slate-800' : 'bg-amber-100/90 border-amber-200/80'
      }`} id="mobile-navigation">
        <button
          onClick={() => setActiveTab('library')}
          className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold ${
            activeTab === 'library'
              ? darkMode ? 'text-amber-400 font-extrabold' : 'text-amber-700 font-extrabold'
              : darkMode ? 'text-slate-400' : 'text-amber-900/70'
          }`}
        >
          <BookOpen className="w-5 h-5" />
          <span>館藏繪本</span>
        </button>

        <button
          onClick={() => setActiveTab('creator')}
          className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold ${
            activeTab === 'creator'
              ? 'text-orange-500 font-extrabold'
              : darkMode ? 'text-slate-400' : 'text-amber-900/70'
          }`}
        >
          <Wand2 className="w-5 h-5" />
          <span>AI 創作</span>
        </button>

        <button
          onClick={() => setActiveTab('wordbank')}
          className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold ${
            activeTab === 'wordbank'
              ? darkMode ? 'text-amber-400 font-extrabold' : 'text-amber-700 font-extrabold'
              : darkMode ? 'text-slate-400' : 'text-amber-900/70'
          }`}
        >
          <Bookmark className="w-5 h-5" />
          <span>生字本</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold ${
            activeTab === 'profile'
              ? darkMode ? 'text-amber-400 font-extrabold' : 'text-amber-700 font-extrabold'
              : darkMode ? 'text-slate-400' : 'text-amber-900/70'
          }`}
        >
          <Award className="w-5 h-5" />
          <span>成就獎章</span>
        </button>
      </div>
    </header>
  );
};
