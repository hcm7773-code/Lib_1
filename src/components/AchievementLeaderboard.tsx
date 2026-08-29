import React, { useState } from 'react';
import {
  Trophy, Star, Crown, BookOpen, Flame, Award, Sparkles, Heart,
  ThumbsUp, Check, ShieldCheck, UserCheck, Layers, Grid, RefreshCw, Zap
} from 'lucide-react';
import { UserProfile, LeaderboardUser, AvatarFrame, DigitalSticker } from '../types';
import { INITIAL_LEADERBOARD_USERS, DEFAULT_AVATAR_FRAMES, DEFAULT_DIGITAL_STICKERS } from '../data/rewardItems';
import { playStarChime, playPageTurnSound } from '../utils/audio';

interface AchievementLeaderboardProps {
  profile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  darkMode?: boolean;
}

export const AchievementLeaderboard: React.FC<AchievementLeaderboardProps> = ({
  profile,
  onUpdateProfile,
  darkMode = false,
}) => {
  const [activeTab, setActiveTab] = useState<'stars' | 'minutes' | 'books' | 'quizzes' | 'streak'>('minutes');
  const [cheers, setCheers] = useState<Record<string, number>>({
    'leader-1': 28,
    'leader-2': 21,
    'leader-3': 18,
    'leader-4': 14,
    'leader-5': 12,
  });
  const [showInventory, setShowInventory] = useState(false);

  // Get Avatar Frames & Digital Stickers
  const avatarFrames = profile.unlockedAvatarFrames || DEFAULT_AVATAR_FRAMES;
  const digitalStickers = profile.unlockedStickers || DEFAULT_DIGITAL_STICKERS;
  const activeFrame = avatarFrames.find((f) => f.id === profile.activeAvatarFrameId) || avatarFrames[0];

  // Construct Leaderboard List with User Profile Included
  const myCompletedBooksCount = profile.readBookIds ? profile.readBookIds.length : (profile.readingHistory ? profile.readingHistory.length : 3);
  const myQuizzesPassedCount = profile.quizPassedBookIds ? profile.quizPassedBookIds.length : 2;

  const meUser: LeaderboardUser = {
    id: 'me-user',
    name: `${profile.name} (你)`,
    avatar: profile.avatar || '👧🏻',
    avatarFrame: activeFrame ? activeFrame.id : 'frame-starry',
    stars: profile.stars || 150,
    booksCompleted: myCompletedBooksCount,
    quizzesPassed: myQuizzesPassedCount,
    streakDays: profile.streakDays || 5,
    readingMinutes: profile.readingMinutes || 25,
    dailyStatusIcon: '🔥',
    dailyStatusText: '每日專注飆升領先',
    rank: 1,
    isMe: true,
    badgeTitle: myQuizzesPassedCount >= 3 ? '👑 繪本闖關神童' : '🌟 星光愛讀者',
  };

  const allUsers = [...INITIAL_LEADERBOARD_USERS, meUser];

  // Sort based on active tab
  const sortedUsers = [...allUsers].sort((a, b) => {
    if (activeTab === 'minutes') return b.readingMinutes - a.readingMinutes;
    if (activeTab === 'stars') return b.stars - a.stars;
    if (activeTab === 'books') return b.booksCompleted - a.booksCompleted;
    if (activeTab === 'quizzes') return b.quizzesPassed - a.quizzesPassed;
    return b.streakDays - a.streakDays;
  }).map((u, idx) => ({ ...u, rank: idx + 1 }));

  const handleCheerUser = (id: string) => {
    setCheers((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
    playStarChime();
  };

  const handleEquipFrame = (frameId: string) => {
    onUpdateProfile({
      ...profile,
      activeAvatarFrameId: frameId,
    });
    playStarChime();
  };

  return (
    <div className={`p-6 sm:p-8 rounded-3xl border transition-all space-y-6 ${
      darkMode
        ? 'bg-slate-900/90 border-amber-500/30 text-slate-100 shadow-2xl'
        : 'bg-gradient-to-br from-amber-50/90 via-orange-50/50 to-purple-50/40 border-amber-200/90 text-amber-950 shadow-xl'
    }`}>
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5 border-amber-200/60">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950 font-black shadow-md animate-bounce">
            <Trophy className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-full">
                全網榮譽英雄榜
              </span>
              <span className="text-xs font-bold text-amber-700 dark:text-amber-300">
                每週即時更新 🏆
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight text-amber-950 dark:text-amber-300 mt-0.5">
              童心成就排行榜 & 裝扮展示櫃
            </h3>
          </div>
        </div>

        {/* Toggle Inventory Drawer Button */}
        <button
          type="button"
          id="btn-toggle-avatar-inventory"
          onClick={() => {
            setShowInventory(!showInventory);
            playPageTurnSound();
          }}
          className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-black text-xs sm:text-sm shadow-md flex items-center gap-2 transition-transform hover:scale-105 cursor-pointer shrink-0"
        >
          <Crown className="w-4 h-4 text-amber-300" />
          <span>{showInventory ? '返回排行榜單' : '我的頭像框與數位貼紙櫃 👑'}</span>
        </button>
      </div>

      {!showInventory ? (
        <div className="space-y-6">
          {/* Ranking Category Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 bg-black/5 dark:bg-white/5 p-1.5 rounded-2xl border border-amber-200/60 dark:border-white/10">
            <button
              type="button"
              id="tab-rank-minutes"
              onClick={() => { setActiveTab('minutes'); playPageTurnSound(); }}
              className={`py-2.5 px-3 rounded-xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'minutes'
                  ? 'bg-amber-400 text-slate-950 shadow-md font-black scale-[1.02]'
                  : 'text-amber-900 dark:text-amber-200 hover:bg-white/40'
              }`}
            >
              <Zap className="w-4 h-4 text-amber-900 fill-amber-900" />
              <span>閱讀分鐘榜</span>
            </button>

            <button
              type="button"
              id="tab-rank-stars"
              onClick={() => { setActiveTab('stars'); playPageTurnSound(); }}
              className={`py-2.5 px-3 rounded-xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'stars'
                  ? 'bg-amber-400 text-slate-950 shadow-md font-black scale-[1.02]'
                  : 'text-amber-900 dark:text-amber-200 hover:bg-white/40'
              }`}
            >
              <Star className="w-4 h-4 text-amber-900 fill-amber-900" />
              <span>童心星星榜</span>
            </button>

            <button
              type="button"
              id="tab-rank-quizzes"
              onClick={() => { setActiveTab('quizzes'); playPageTurnSound(); }}
              className={`py-2.5 px-3 rounded-xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'quizzes'
                  ? 'bg-amber-400 text-slate-950 shadow-md font-black scale-[1.02]'
                  : 'text-amber-900 dark:text-amber-200 hover:bg-white/40'
              }`}
            >
              <Trophy className="w-4 h-4 text-amber-900" />
              <span>繪本闖關王</span>
            </button>

            <button
              type="button"
              id="tab-rank-books"
              onClick={() => { setActiveTab('books'); playPageTurnSound(); }}
              className={`py-2.5 px-3 rounded-xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'books'
                  ? 'bg-amber-400 text-slate-950 shadow-md font-black scale-[1.02]'
                  : 'text-amber-900 dark:text-amber-200 hover:bg-white/40'
              }`}
            >
              <BookOpen className="w-4 h-4 text-amber-900" />
              <span>繪本閱讀數</span>
            </button>

            <button
              type="button"
              id="tab-rank-streak"
              onClick={() => { setActiveTab('streak'); playPageTurnSound(); }}
              className={`py-2.5 px-3 rounded-xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer col-span-2 sm:col-span-1 ${
                activeTab === 'streak'
                  ? 'bg-amber-400 text-slate-950 shadow-md font-black scale-[1.02]'
                  : 'text-amber-900 dark:text-amber-200 hover:bg-white/40'
              }`}
            >
              <Flame className="w-4 h-4 text-amber-900 fill-amber-900" />
              <span>連續閱讀榜</span>
            </button>
          </div>

          {/* Top 3 Winner Podium */}
          <div className="grid grid-cols-3 gap-3 items-end pt-3 pb-2">
            {/* Rank 2 (Silver) */}
            {sortedUsers[1] && (
              <div className="p-4 rounded-3xl bg-slate-800/60 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 text-center space-y-2 relative shadow-lg">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-200 text-slate-900 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-slate-400 shadow-sm">
                  🥈 第 2 名
                </div>
                <div className="w-12 h-12 mx-auto rounded-full bg-slate-700 flex items-center justify-center text-2xl border-2 border-slate-300 shadow-md mt-2">
                  {sortedUsers[1].avatar}
                </div>
                <h4 className="font-extrabold text-xs text-white line-clamp-1">{sortedUsers[1].name}</h4>
                <div className="text-[11px] font-black text-slate-300">
                  {activeTab === 'minutes' && `${sortedUsers[1].readingMinutes} 分鐘 ⏱️`}
                  {activeTab === 'stars' && `${sortedUsers[1].stars} ⭐`}
                  {activeTab === 'quizzes' && `${sortedUsers[1].quizzesPassed} 關 🏆`}
                  {activeTab === 'books' && `${sortedUsers[1].booksCompleted} 本 📖`}
                  {activeTab === 'streak' && `${sortedUsers[1].streakDays} 天 🔥`}
                </div>
              </div>
            )}

            {/* Rank 1 (Gold Crown Champion) */}
            {sortedUsers[0] && (
              <div className="p-5 rounded-3xl bg-gradient-to-b from-amber-400/30 via-orange-500/20 to-slate-900 border-2 border-amber-400 text-center space-y-2 relative shadow-2xl scale-105">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 text-xs font-black px-3 py-1 rounded-full shadow-md animate-pulse">
                  👑 第 1 名 榮譽霸主
                </div>
                <div className="w-16 h-16 mx-auto rounded-full bg-amber-400/20 flex items-center justify-center text-3xl border-4 border-amber-400 shadow-xl ring-4 ring-amber-300/40 mt-2">
                  {sortedUsers[0].avatar}
                </div>
                <h4 className="font-black text-sm text-amber-300 line-clamp-1">{sortedUsers[0].name}</h4>
                <span className="inline-block text-[10px] font-extrabold bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full">
                  {sortedUsers[0].dailyStatusIcon} {sortedUsers[0].dailyStatusText || '領先狀態優異'}
                </span>
                <div className="text-xs font-black text-amber-400">
                  {activeTab === 'minutes' && `${sortedUsers[0].readingMinutes} 分鐘專注 ⏱️`}
                  {activeTab === 'stars' && `${sortedUsers[0].stars} ⭐`}
                  {activeTab === 'quizzes' && `${sortedUsers[0].quizzesPassed} 關闖關通關 🏆`}
                  {activeTab === 'books' && `${sortedUsers[0].booksCompleted} 本繪本 📖`}
                  {activeTab === 'streak' && `${sortedUsers[0].streakDays} 天連讀 🔥`}
                </div>
              </div>
            )}

            {/* Rank 3 (Bronze) */}
            {sortedUsers[2] && (
              <div className="p-4 rounded-3xl bg-amber-950/40 dark:bg-amber-950/60 border border-amber-700/60 text-center space-y-2 relative shadow-lg">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-700 text-amber-100 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-amber-500 shadow-sm">
                  🥉 第 3 名
                </div>
                <div className="w-12 h-12 mx-auto rounded-full bg-amber-900/60 flex items-center justify-center text-2xl border-2 border-amber-600 shadow-md mt-2">
                  {sortedUsers[2].avatar}
                </div>
                <h4 className="font-extrabold text-xs text-white line-clamp-1">{sortedUsers[2].name}</h4>
                <div className="text-[11px] font-black text-amber-200">
                  {activeTab === 'minutes' && `${sortedUsers[2].readingMinutes} 分鐘 ⏱️`}
                  {activeTab === 'stars' && `${sortedUsers[2].stars} ⭐`}
                  {activeTab === 'quizzes' && `${sortedUsers[2].quizzesPassed} 關 🏆`}
                  {activeTab === 'books' && `${sortedUsers[2].booksCompleted} 本 📖`}
                  {activeTab === 'streak' && `${sortedUsers[2].streakDays} 天 🔥`}
                </div>
              </div>
            )}
          </div>

          {/* Leaderboard Table List */}
          <div className="space-y-2.5">
            {sortedUsers.map((user) => {
              const userFrame = avatarFrames.find((f) => f.id === user.avatarFrame) || avatarFrames[0];
              const cheerCount = cheers[user.id] || 0;

              return (
                <div
                  key={user.id}
                  className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    user.isMe
                      ? 'bg-gradient-to-r from-amber-400/20 via-purple-500/20 to-indigo-500/20 border-amber-400 ring-2 ring-amber-400/60 shadow-md'
                      : darkMode
                      ? 'bg-slate-800/80 border-slate-700 hover:border-slate-600'
                      : 'bg-white border-amber-200/80 hover:border-amber-300'
                  }`}
                >
                  {/* Rank Number & User Avatar with Frame */}
                  <div className="flex items-center gap-3">
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs shrink-0 ${
                      user.rank === 1 ? 'bg-amber-400 text-slate-950 font-black' :
                      user.rank === 2 ? 'bg-slate-300 text-slate-950 font-black' :
                      user.rank === 3 ? 'bg-amber-700 text-white font-black' :
                      'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}>
                      {user.rank}
                    </span>

                    {/* Avatar with Dynamic Unlocked Frame */}
                    <div className="relative shrink-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl bg-slate-800 ${userFrame ? userFrame.borderClass : 'border-2 border-amber-300'} ${userFrame ? userFrame.glowClass : ''}`}>
                        {user.avatar}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h5 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white">
                          {user.name}
                        </h5>
                        {user.isMe && (
                          <span className="text-[10px] font-black bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full">
                            你
                          </span>
                        )}
                        <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100/80 dark:bg-slate-700 text-amber-900 dark:text-amber-200 font-extrabold flex items-center gap-1">
                          <span>{user.dailyStatusIcon || '⚡'}</span>
                          <span className="text-[10px] hidden sm:inline">{user.dailyStatusText || '領先狀態'}</span>
                        </span>
                      </div>
                      <p className="text-[11px] text-amber-700 dark:text-amber-300 font-bold">
                        {user.badgeTitle} • 好友榜#{user.rank}
                      </p>
                    </div>
                  </div>

                  {/* Leaderboard Metrics & Cheer Button */}
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="font-black text-xs sm:text-sm text-amber-600 dark:text-amber-300">
                        {activeTab === 'minutes' && `${user.readingMinutes} 分鐘 ⏱️`}
                        {activeTab === 'stars' && `${user.stars} ⭐`}
                        {activeTab === 'quizzes' && `${user.quizzesPassed} 關闖關 🏆`}
                        {activeTab === 'books' && `${user.booksCompleted} 本繪本 📖`}
                        {activeTab === 'streak' && `${user.streakDays} 天連讀 🔥`}
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium">
                        累積 {user.readingMinutes} 分鐘 | {user.booksCompleted} 本繪本
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCheerUser(user.id)}
                      className="px-2.5 py-1.5 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 text-amber-800 dark:text-amber-300 border border-amber-400/40 font-extrabold text-xs flex items-center gap-1 transition-transform hover:scale-105 cursor-pointer"
                      title="給予好朋友喝采"
                    >
                      <ThumbsUp className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                      <span>{cheerCount}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Dynamic Avatar Frames & Digital Stickers Inventory Showcase */
        <div className="space-y-6 animate-fadeIn">
          {/* Avatar Frames Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-black text-sm text-amber-950 dark:text-amber-300 flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-500" />
                <span>繪本闖關解鎖－動態炫彩頭像框</span>
              </h4>
              <span className="text-xs text-amber-700 dark:text-amber-300 font-bold">
                已解鎖 {avatarFrames.filter((f) => f.unlocked).length} / {avatarFrames.length} 個
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {avatarFrames.map((frame) => {
                const isEquipped = profile.activeAvatarFrameId === frame.id || (!profile.activeAvatarFrameId && frame.id === 'frame-starry');

                return (
                  <div
                    key={frame.id}
                    className={`p-4 rounded-2xl border transition-all relative flex flex-col justify-between space-y-3 ${
                      frame.unlocked
                        ? 'bg-slate-800/90 border-amber-400/60 text-white shadow-md'
                        : 'bg-slate-900/40 border-slate-700 text-slate-400 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center text-2xl shrink-0 ${frame.borderClass} ${frame.glowClass}`}>
                        {profile.avatar || '👧🏻'}
                      </div>
                      <div>
                        <h5 className="font-black text-xs text-white">{frame.name}</h5>
                        <p className="text-[10px] text-amber-300 font-bold">
                          來源：《{frame.earnedFromBook}》
                        </p>
                      </div>
                    </div>

                    {frame.unlocked ? (
                      <button
                        type="button"
                        onClick={() => handleEquipFrame(frame.id)}
                        disabled={isEquipped}
                        className={`w-full py-1.5 rounded-xl font-black text-xs transition-transform cursor-pointer ${
                          isEquipped
                            ? 'bg-emerald-500 text-white cursor-default'
                            : 'bg-amber-400 hover:bg-amber-300 text-slate-950 hover:scale-105'
                        }`}
                      >
                        {isEquipped ? '已配戴頭像框 ✨' : '配戴此頭像框'}
                      </button>
                    ) : (
                      <div className="text-[10px] text-slate-400 italic">
                        🔒 需通關《{frame.earnedFromBook}》問答解鎖
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Digital Stickers Section */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h4 className="font-black text-sm text-indigo-900 dark:text-indigo-300 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                <span>繪本闖關解鎖－數位故事貼紙庫</span>
              </h4>
              <span className="text-xs text-indigo-700 dark:text-indigo-300 font-bold">
                已收集 {digitalStickers.filter((s) => s.unlocked).length} / {digitalStickers.length} 張
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {digitalStickers.map((sticker) => (
                <div
                  key={sticker.id}
                  className={`p-3.5 rounded-2xl border flex items-center gap-3 transition-all ${
                    sticker.unlocked
                      ? 'bg-indigo-950/80 border-indigo-400/60 text-white shadow-md'
                      : 'bg-slate-900/40 border-slate-700 text-slate-500 opacity-60'
                  }`}
                >
                  <div className="w-11 h-11 rounded-2xl bg-indigo-900/80 flex items-center justify-center text-2xl shrink-0 border border-indigo-400/40">
                    {sticker.emoji}
                  </div>
                  <div>
                    <h5 className="font-extrabold text-xs text-white">{sticker.name}</h5>
                    <span className="text-[10px] font-bold text-indigo-300">
                      {sticker.unlocked ? `解鎖於《${sticker.earnedFromBook}》` : '🔒 完成繪本問答獲得'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
