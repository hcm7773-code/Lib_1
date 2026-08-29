import React, { useState } from 'react';
import {
  Trophy, Star, Award, Sparkles, CheckCircle2, Bookmark, Share2, Download, Heart, X, BookOpen, ShieldCheck, Flame
} from 'lucide-react';
import { Book, UserProfile, CollectibleItem } from '../types';
import { playStarChime } from '../utils/audio';

interface StoryAchievementCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: Book;
  profile: UserProfile;
  timeSpentMinutes?: number;
  unlockedBadgeName?: string;
  onSaveToCollectibles?: (collectible: CollectibleItem) => void;
  darkMode?: boolean;
}

export const StoryAchievementCardModal: React.FC<StoryAchievementCardModalProps> = ({
  isOpen,
  onClose,
  book,
  profile,
  timeSpentMinutes = 12,
  unlockedBadgeName = '故事解鎖探險家',
  onSaveToCollectibles,
  darkMode = false,
}) => {
  const [saved, setSaved] = useState<boolean>(false);

  if (!isOpen) return null;

  const bookTitleZh = book.title['zh-TW'] || book.title.en;

  const handleSaveToProfile = () => {
    playStarChime();
    setSaved(true);

    const newCollectible: CollectibleItem = {
      id: `achievement_card_${book.id}_${Date.now()}`,
      bookId: book.id,
      bookTitle: bookTitleZh,
      name: `【${bookTitleZh}】完讀紀念卡`,
      category: 'card',
      description: `恭喜 ${profile.name} 完讀《${bookTitleZh}》，榮獲故事王國榮譽認證！`,
      icon: '🏆',
      imageUrl: book.coverUrl,
      earnedAt: new Date().toLocaleDateString('zh-TW'),
      rarity: 'legendary',
      themeColor: 'from-amber-400 via-orange-500 to-yellow-300',
    };

    if (onSaveToCollectibles) {
      onSaveToCollectibles(newCollectible);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="w-full max-w-md p-6 rounded-3xl bg-slate-900 border-2 border-amber-400 text-white shadow-2xl space-y-5 relative overflow-hidden text-center">
        {/* Shiny Background Glow */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-amber-400/25 rounded-full blur-3xl pointer-events-none animate-pulse" />

        {/* Modal Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Header Label */}
        <div className="space-y-1">
          <span className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 font-black text-xs inline-flex items-center gap-1 shadow-md">
            <Trophy className="w-3.5 h-3.5 fill-slate-950" />
            <span>故事完讀榮譽紀念卡 (Story Achievement Card)</span>
          </span>
          <h3 className="text-xl font-black text-amber-200 pt-1">
            恭喜完讀《{bookTitleZh}》！
          </h3>
        </div>

        {/* Physical Trading Card Design */}
        <div className="p-4 rounded-2xl bg-gradient-to-b from-amber-950/90 via-slate-900 to-slate-950 border-2 border-amber-400/80 shadow-2xl relative space-y-4">
          {/* Official Golden Stamp Seal */}
          <div className="absolute top-3 right-3 w-16 h-16 rounded-full border-2 border-amber-300/80 bg-amber-500/20 flex flex-col items-center justify-center rotate-12 shadow-lg backdrop-blur-xs">
            <ShieldCheck className="w-6 h-6 text-amber-300" />
            <span className="text-[8px] font-black text-amber-200">王國認證</span>
          </div>

          {/* Book Cover Container */}
          <div className="w-32 h-44 mx-auto rounded-2xl overflow-hidden border-2 border-amber-300/80 shadow-xl relative group">
            <img
              src={book.coverUrl}
              alt={bookTitleZh}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-2">
              <span className="text-[10px] font-black text-amber-200 truncate">
                {book.author}
              </span>
            </div>
          </div>

          {/* Card Info & Stats Grid */}
          <div className="space-y-2 text-left bg-slate-900/80 p-3 rounded-xl border border-amber-400/30">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">{profile.avatar}</span>
                <span className="font-black text-xs text-amber-200">{profile.name}</span>
              </div>
              <span className="text-[10px] font-bold text-slate-400">
                {new Date().toLocaleDateString('zh-TW')}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-black pt-1">
              <div className="p-1.5 rounded-lg bg-slate-800 border border-slate-700">
                <div className="text-amber-400 text-xs">⏱️ {timeSpentMinutes} 分鐘</div>
                <div className="text-slate-400">專注閱讀</div>
              </div>
              <div className="p-1.5 rounded-lg bg-slate-800 border border-slate-700">
                <div className="text-yellow-300 text-xs">⭐ +25 星星</div>
                <div className="text-slate-400">解鎖獎勵</div>
              </div>
              <div className="p-1.5 rounded-lg bg-slate-800 border border-slate-700">
                <div className="text-emerald-400 text-xs">🏅 稀有卡</div>
                <div className="text-slate-400">紀念等級</div>
              </div>
            </div>

            <div className="pt-1 text-[11px] font-bold text-amber-200/90 italic text-center">
              「讀完一本書，就像在心裡種下一顆會發光的種子！✨」
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={handleSaveToProfile}
            disabled={saved}
            className={`flex-1 py-3 rounded-2xl font-black text-xs flex items-center justify-center gap-2 shadow-xl cursor-pointer transition-transform ${
              saved
                ? 'bg-emerald-500 text-slate-950 cursor-default'
                : 'bg-gradient-to-r from-amber-400 to-yellow-300 hover:from-amber-500 hover:to-yellow-400 text-slate-950 hover:scale-105'
            }`}
          >
            <Bookmark className="w-4 h-4 fill-slate-950" />
            <span>{saved ? '✅ 已收納至個人寶藏庫' : '📥 收納故事成就卡至寶藏庫'}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-black text-xs cursor-pointer"
          >
            關閉
          </button>
        </div>
      </div>
    </div>
  );
};
