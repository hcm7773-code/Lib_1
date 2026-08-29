import React, { useState } from 'react';
import { X, Heart, Star, Sparkles, BookOpen, Smile, Calendar, Plus, MessageCircle, Quote, Trophy, Trash2, FileText, Download } from 'lucide-react';
import { Book, MoodJournalEntry, UserProfile } from '../types';
import { playStarChime } from '../utils/audio';
import { ReadingNotesExportModal } from './ReadingNotesExportModal';

interface MoodJournalModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  books: Book[];
  onAddMoodEntry: (entry: MoodJournalEntry, bonusStars: number) => void;
  onDeleteMoodEntry?: (entryId: string) => void;
  defaultBookId?: string;
  darkMode?: boolean;
}

const PRESET_MOODS = [
  { emoji: '😄', label: '溫馨開心', color: 'bg-amber-100 text-amber-900 border-amber-300' },
  { emoji: '😲', label: '驚喜刺激', color: 'bg-orange-100 text-orange-900 border-orange-300' },
  { emoji: '🥺', label: '感動泛淚', color: 'bg-blue-100 text-blue-900 border-blue-300' },
  { emoji: '💡', label: '啟發智慧', color: 'bg-purple-100 text-purple-900 border-purple-300' },
  { emoji: '🌈', label: '奇幻想像', color: 'bg-pink-100 text-pink-900 border-pink-300' },
  { emoji: '🦸', label: '充滿勇氣', color: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
  { emoji: '😴', label: '睡前沉靜', color: 'bg-indigo-100 text-indigo-900 border-indigo-300' },
];

const PRESET_REFLECTIONS = [
  '這本書的主角太棒了！我很想跟他一起探險！',
  '我覺得故事結尾好溫馨，讓我心裡暖洋洋的。',
  '我學到了好重要的新知識，下次要跟同學分享！',
  '這本書的圖畫非常美，好像飛進夢境世界一樣。',
  '遇到難關時要像故事裡的主角一樣不放棄！',
];

export const MoodJournalModal: React.FC<MoodJournalModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  books,
  onAddMoodEntry,
  onDeleteMoodEntry,
  defaultBookId,
  darkMode = false,
}) => {
  const [activeTab, setActiveTab] = useState<'write' | 'list'>('write');
  const [selectedBookId, setSelectedBookId] = useState<string>(defaultBookId || books[0]?.id || '');
  const [selectedMood, setSelectedMood] = useState(PRESET_MOODS[0]);
  const [rating, setRating] = useState<number>(5);
  const [reflectionText, setReflectionText] = useState<string>('');
  const [favoriteQuote, setFavoriteQuote] = useState<string>('');
  const [justSavedSuccess, setJustSavedSuccess] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  if (!isOpen) return null;

  const journalEntries = userProfile.moodJournal || [];
  const selectedBook = books.find((b) => b.id === selectedBookId) || books[0];

  const handleSaveEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBook) return;

    playStarChime();

    const newEntry: MoodJournalEntry = {
      id: `mood-${Date.now()}`,
      bookId: selectedBook.id,
      bookTitle: selectedBook.title['zh-TW'] || selectedBook.title.en,
      coverUrl: selectedBook.coverUrl,
      moodEmoji: selectedMood.emoji,
      moodLabel: selectedMood.label,
      reflectionText: reflectionText.trim() || '讀完這本故事讓我收穫滿滿，心情特別好！',
      favoriteQuote: favoriteQuote.trim() || undefined,
      rating,
      earnedStarsBonus: 5,
      createdAt: new Date().toLocaleDateString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }),
    };

    onAddMoodEntry(newEntry, 5);

    setJustSavedSuccess(true);
    setTimeout(() => {
      setJustSavedSuccess(false);
      setReflectionText('');
      setFavoriteQuote('');
      setActiveTab('list');
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-7 max-w-2xl w-full border-2 border-pink-300 dark:border-pink-800 shadow-2xl space-y-5 relative max-h-[90vh] overflow-y-auto scrollbar-none">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-pink-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 text-white shadow-md">
              <Heart className="w-5 h-5 animate-pulse fill-white" />
            </div>
            <div>
              <h2 className="font-black text-slate-900 dark:text-slate-100 text-lg sm:text-xl flex items-center gap-2">
                <span>童心閱讀心情日記</span>
                <span className="text-xs bg-pink-100 dark:bg-pink-950 text-pink-700 dark:text-pink-300 px-2.5 py-0.5 rounded-full font-black border border-pink-200 dark:border-pink-800">
                  每篇獎勵 5⭐
                </span>
              </h2>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                紀錄讀完繪本當下的喜怒哀樂與感動金句
              </p>
            </div>
          </div>

          <button
            type="button"
            id="btn-close-mood-modal"
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher: Write Entry vs History List */}
        <div className="flex items-center gap-2 bg-pink-50/80 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-pink-200/80 dark:border-slate-700">
          <button
            type="button"
            id="tab-write-mood"
            onClick={() => setActiveTab('write')}
            className={`flex-1 py-2 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'write'
                ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:bg-pink-100/50'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>寫一篇閱讀心情</span>
          </button>

          <button
            type="button"
            id="tab-list-mood"
            onClick={() => setActiveTab('list')}
            className={`flex-1 py-2 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'list'
                ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:bg-pink-100/50'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>心情日記歷程紀錄 ({journalEntries.length})</span>
          </button>
        </div>

        {/* Tab 1: Write New Mood Entry */}
        {activeTab === 'write' && (
          <form onSubmit={handleSaveEntry} className="space-y-4 animate-fadeIn">
            {/* Success toast overlay */}
            {justSavedSuccess && (
              <div className="p-4 rounded-2xl bg-emerald-500 text-white font-black text-center text-sm shadow-xl flex items-center justify-center gap-2 animate-bounce">
                <Sparkles className="w-5 h-5 fill-white" />
                <span>恭喜！成功儲存閱讀心情日記，已為你獲得 5 顆星星！⭐</span>
              </div>
            )}

            {/* Select Book */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-pink-500" />
                <span>選擇你剛讀完的繪本故事：</span>
              </label>

              <select
                id="select-mood-book"
                value={selectedBookId}
                onChange={(e) => setSelectedBookId(e.target.value)}
                className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
              >
                {books.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.flag} {b.title['zh-TW'] || b.title.en} ({b.author})
                  </option>
                ))}
              </select>
            </div>

            {/* Select Mood Emoji */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Smile className="w-4 h-4 text-amber-500" />
                <span>選擇你讀完後的心情表情符號：</span>
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {PRESET_MOODS.map((m) => {
                  const isSelected = selectedMood.label === m.label;
                  return (
                    <button
                      type="button"
                      key={m.label}
                      onClick={() => setSelectedMood(m)}
                      className={`p-2.5 rounded-2xl border transition-all text-left flex items-center gap-2 ${
                        isSelected
                          ? 'bg-pink-100 dark:bg-pink-950 border-pink-500 ring-2 ring-pink-400 scale-[1.02]'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-pink-50/50'
                      }`}
                    >
                      <span className="text-2xl">{m.emoji}</span>
                      <span className="text-xs font-black text-slate-900 dark:text-slate-100">
                        {m.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Star Rating */}
            <div className="space-y-1.5 bg-amber-50/60 dark:bg-slate-800/60 p-3 rounded-2xl border border-amber-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-amber-950 dark:text-amber-200 flex items-center gap-1">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span>故事推薦星級好評：</span>
                </label>
                <span className="text-xs font-black text-amber-600 dark:text-amber-400">
                  {rating} 顆星好評
                </span>
              </div>

              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((starNum) => (
                  <button
                    type="button"
                    key={starNum}
                    onClick={() => setRating(starNum)}
                    className="p-1 hover:scale-125 transition-transform"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        starNum <= rating
                          ? 'text-amber-400 fill-amber-400 drop-shadow-xs'
                          : 'text-slate-300 dark:text-slate-600'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Preset Reflection Tags */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <MessageCircle className="w-4 h-4 text-purple-500" />
                <span>快速選取小讀者心得感言（或自訂寫下）：</span>
              </label>

              <div className="flex flex-wrap gap-1.5">
                {PRESET_REFLECTIONS.map((preset, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => setReflectionText(preset)}
                    className="text-[11px] font-bold px-2.5 py-1 rounded-xl bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 text-purple-900 dark:text-purple-300 border border-purple-200 dark:border-purple-800 transition-colors"
                  >
                    💬 {preset}
                  </button>
                ))}
              </div>

              <textarea
                id="input-mood-reflection"
                rows={3}
                value={reflectionText}
                onChange={(e) => setReflectionText(e.target.value)}
                placeholder="在這裡寫下你最深刻的心情、對主角想說的話..."
                className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
            </div>

            {/* Favorite Quote */}
            <div className="space-y-1">
              <label className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1">
                <Quote className="w-3.5 h-3.5 text-pink-500" />
                <span>故事裡最喜歡的溫馨金句（可選填）：</span>
              </label>

              <input
                type="text"
                id="input-mood-quote"
                value={favoriteQuote}
                onChange={(e) => setFavoriteQuote(e.target.value)}
                placeholder="例如：『只有用心靈才能洞察事情的本質。』"
                className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-bold text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              id="btn-submit-mood-entry"
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 hover:from-pink-600 hover:to-amber-600 text-white font-black text-sm shadow-lg flex items-center justify-center gap-2 transition-transform hover:scale-[1.01]"
            >
              <Heart className="w-5 h-5 fill-white animate-bounce" />
              <span>儲存童心閱讀心情日記 (獎勵 +5 ⭐)</span>
            </button>
          </form>
        )}

        {/* Tab 2: History List */}
        {activeTab === 'list' && (
          <div className="space-y-3 animate-fadeIn max-h-[60vh] overflow-y-auto pr-1 scrollbar-none">
            {journalEntries.length > 0 && (
              <div className="flex items-center justify-between p-2.5 rounded-2xl bg-pink-100/70 dark:bg-slate-800 border border-pink-200 dark:border-slate-700">
                <span className="text-xs font-black text-pink-950 dark:text-pink-200">
                  共 {journalEntries.length} 篇閱讀心情紀錄
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setIsExportModalOpen(true);
                    playStarChime();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-black text-xs flex items-center gap-1.5 shadow-xs transition-transform hover:scale-105 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>匯出閱讀心得與筆記 (MD/PDF)</span>
                </button>
              </div>
            )}

            {journalEntries.length === 0 ? (
              <div className="text-center py-12 bg-pink-50/50 dark:bg-slate-800/50 rounded-3xl border-2 border-dashed border-pink-200 dark:border-slate-700 p-6 space-y-3">
                <div className="text-5xl animate-bounce">📖</div>
                <h3 className="font-black text-base text-slate-800 dark:text-slate-200">
                  尚無閱讀心情日記紀錄
                </h3>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  剛讀完一本繪本嗎？快點擊『寫一篇閱讀心情』，寫下你的感動並賺取 5 顆星星獎勵吧！
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('write')}
                  className="px-5 py-2.5 rounded-2xl bg-pink-500 text-white font-black text-xs shadow-md hover:bg-pink-600 transition-transform hover:scale-105"
                >
                  ✍️ 開始寫第一篇心情日記
                </button>
              </div>
            ) : (
              journalEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="p-4 rounded-3xl bg-white dark:bg-slate-800 border-2 border-pink-200 dark:border-pink-900 shadow-md space-y-2 relative"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {entry.coverUrl ? (
                        <img
                          src={entry.coverUrl}
                          alt={entry.bookTitle}
                          className="w-12 h-16 object-cover rounded-xl shadow-xs border border-slate-200 dark:border-slate-700 shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-16 bg-pink-100 rounded-xl flex items-center justify-center text-2xl">
                          📖
                        </div>
                      )}

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{entry.moodEmoji}</span>
                          <span className="font-black text-sm text-slate-900 dark:text-slate-100">
                            {entry.moodLabel}
                          </span>
                          <span className="text-[10px] bg-pink-100 dark:bg-pink-950 text-pink-700 dark:text-pink-300 font-bold px-2 py-0.5 rounded-full border border-pink-200 dark:border-pink-800">
                            +{entry.earnedStarsBonus || 5} ⭐
                          </span>
                        </div>

                        <h4 className="font-extrabold text-xs text-slate-800 dark:text-slate-200 mt-0.5">
                          《{entry.bookTitle}》
                        </h4>

                        <div className="flex items-center gap-1 mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${
                                i < entry.rating
                                  ? 'text-amber-400 fill-amber-400'
                                  : 'text-slate-300 dark:text-slate-600'
                              }`}
                            />
                          ))}
                          <span className="text-[10px] font-bold text-slate-400 ml-1">
                            {entry.createdAt}
                          </span>
                        </div>
                      </div>
                    </div>

                    {onDeleteMoodEntry && (
                      <button
                        type="button"
                        onClick={() => onDeleteMoodEntry(entry.id)}
                        className="text-slate-400 hover:text-rose-500 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        title="刪除紀錄"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Reflection Content */}
                  <div className="p-3 rounded-2xl bg-pink-50/60 dark:bg-slate-900/60 border border-pink-100 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 leading-relaxed">
                    💬 {entry.reflectionText}
                  </div>

                  {/* Favorite Quote */}
                  {entry.favoriteQuote && (
                    <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800 text-[11px] font-bold text-purple-900 dark:text-purple-300 flex items-center gap-1.5 italic">
                      <Quote className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                      <span>金句：『{entry.favoriteQuote}』</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

      </div>

      {/* Reading Notes Export Modal */}
      {isExportModalOpen && (
        <ReadingNotesExportModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          books={books}
          userProfile={userProfile}
          activeBook={selectedBook}
        />
      )}
    </div>
  );
};
