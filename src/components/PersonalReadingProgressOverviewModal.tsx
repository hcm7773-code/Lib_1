import React, { useState, useMemo } from 'react';
import {
  X,
  BookOpen,
  CheckCircle2,
  Clock,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Bookmark,
  Trash2,
  Filter,
  Flame,
  Star,
  Check,
  Compass,
  Layers,
  ChevronRight,
  TrendingUp,
  Award
} from 'lucide-react';
import { Book, UserProfile, ReadingLogEntry } from '../types';
import {
  getAllReadingProgressMap,
  ActiveReadingSession,
  recordReadingProgress
} from '../utils/readingProgressTracker';
import { playStarChime, playPageTurnSound, speakText } from '../utils/audio';

interface PersonalReadingProgressOverviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  books: Book[];
  userProfile?: UserProfile;
  onSelectBook: (book: Book, startPage?: number) => void;
  darkMode?: boolean;
}

export const PersonalReadingProgressOverviewModal: React.FC<PersonalReadingProgressOverviewModalProps> = ({
  isOpen,
  onClose,
  books,
  userProfile,
  onSelectBook,
  darkMode = false,
}) => {
  const [filterTab, setFilterTab] = useState<'in_progress' | 'completed' | 'all'>('in_progress');
  const [progressMap, setProgressMap] = useState<Record<string, ActiveReadingSession>>(() => {
    return getAllReadingProgressMap();
  });

  // Re-read progress on open
  React.useEffect(() => {
    if (isOpen) {
      setProgressMap(getAllReadingProgressMap());
    }
  }, [isOpen]);

  // Merge local progress map with reading history from profile
  const allProgressItems = useMemo(() => {
    const items: {
      book: Book;
      lastPage: number;
      totalPages: number;
      progressPercent: number;
      isCompleted: boolean;
      lastReadDateStr: string;
      lastReadTimestamp: number;
      timeSpentMinutes: number;
    }[] = [];

    const processedBookIds = new Set<string>();

    // 1. From progressMap
    Object.values(progressMap).forEach((prog: ActiveReadingSession) => {
      const book = books.find((b) => b.id === prog.bookId);
      if (book) {
        processedBookIds.add(book.id);
        const total = book.pages.length;
        const page = Math.min(total, Math.max(1, prog.lastPageRead));
        const percent = Math.min(100, Math.round((page / total) * 100));
        const isComp = prog.completed || (userProfile?.readBookIds?.includes(book.id)) || (percent >= 100);

        items.push({
          book,
          lastPage: page,
          totalPages: total,
          progressPercent: isComp ? 100 : percent,
          isCompleted: isComp,
          lastReadDateStr: prog.lastReadDateStr || '近期',
          lastReadTimestamp: prog.lastReadTimestamp || 0,
          timeSpentMinutes: 5,
        });
      }
    });

    // 2. From userProfile readBookIds
    userProfile?.readBookIds?.forEach((bookId) => {
      if (!processedBookIds.has(bookId)) {
        const book = books.find((b) => b.id === bookId);
        if (book) {
          processedBookIds.add(book.id);
          items.push({
            book,
            lastPage: book.pages.length,
            totalPages: book.pages.length,
            progressPercent: 100,
            isCompleted: true,
            lastReadDateStr: '已完讀',
            lastReadTimestamp: 0,
            timeSpentMinutes: 10,
          });
        }
      }
    });

    // Sort: In-progress first, then by timestamp desc
    return items.sort((a, b) => {
      if (a.isCompleted !== b.isCompleted) {
        return a.isCompleted ? 1 : -1;
      }
      return b.lastReadTimestamp - a.lastReadTimestamp;
    });
  }, [books, progressMap, userProfile]);

  const inProgressList = useMemo(() => allProgressItems.filter((i) => !i.isCompleted), [allProgressItems]);
  const completedList = useMemo(() => allProgressItems.filter((i) => i.isCompleted), [allProgressItems]);

  const displayedList = useMemo(() => {
    if (filterTab === 'in_progress') return inProgressList;
    if (filterTab === 'completed') return completedList;
    return allProgressItems;
  }, [filterTab, inProgressList, completedList, allProgressItems]);

  const mostRecentUnfinished = inProgressList[0] || null;

  const handleResumeBook = (book: Book, page: number) => {
    playStarChime();
    onSelectBook(book, page);
    onClose();
  };

  const handleRestartBook = (book: Book) => {
    playPageTurnSound();
    onSelectBook(book, 1);
    onClose();
  };

  const handleResetProgress = (bookId: string) => {
    try {
      const updated = { ...progressMap };
      delete updated[bookId];
      setProgressMap(updated);
      localStorage.setItem('wcdl_all_reading_progress', JSON.stringify(updated));
      speakText('已重置該繪本進度', 'zh-TW', 1.0, 'cartoon');
    } catch {}
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div
        className={`relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden transition-all ${
          darkMode
            ? 'bg-slate-900 border-slate-700 text-slate-100'
            : 'bg-gradient-to-b from-amber-50 via-white to-orange-50/70 border-amber-300 text-slate-900'
        }`}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-amber-200 dark:border-slate-800 flex items-center justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 p-1 shadow-md flex items-center justify-center text-slate-950 text-2xl animate-pulse">
              📖
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black">
                  🧭 個人繪本閱讀進度總覽
                </h2>
                <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 shadow-2xs">
                  跨裝置自動儲存
                </span>
              </div>
              <p className="text-xs font-semibold text-amber-900/70 dark:text-slate-400 mt-0.5">
                自動記錄閱讀進度、上次閱讀頁碼，隨時接續探索繪本世界！
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-100 hover:text-rose-600 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            title="關閉"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick KPI Overview */}
        <div className="px-6 py-4 border-b border-amber-200/60 dark:border-slate-800 bg-amber-100/30 dark:bg-slate-800/40 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-2xl bg-white/80 dark:bg-slate-850 border border-amber-200 dark:border-slate-700">
            <div className="text-[11px] font-bold text-slate-500">進行中繪本</div>
            <div className="text-lg font-black text-amber-600 dark:text-amber-400 font-mono">
              {inProgressList.length} 本
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white/80 dark:bg-slate-850 border border-amber-200 dark:border-slate-700">
            <div className="text-[11px] font-bold text-slate-500">已完讀繪本</div>
            <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono">
              {completedList.length} 本
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white/80 dark:bg-slate-850 border border-amber-200 dark:border-slate-700">
            <div className="text-[11px] font-bold text-slate-500">專注閱讀時長</div>
            <div className="text-lg font-black text-cyan-600 dark:text-cyan-400 font-mono">
              {userProfile?.readingMinutes || 0} 分鐘
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white/80 dark:bg-slate-850 border border-amber-200 dark:border-slate-700">
            <div className="text-[11px] font-bold text-slate-500">故事星星</div>
            <div className="text-lg font-black text-yellow-600 dark:text-yellow-400 font-mono">
              {userProfile?.stars || 0} ⭐
            </div>
          </div>
        </div>

        {/* Most Recent Unfinished Spotlight Card */}
        {mostRecentUnfinished && (
          <div className="px-6 pt-4 pb-1">
            <div
              className={`p-4 sm:p-5 rounded-3xl border-2 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4 ${
                darkMode
                  ? 'bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/40 border-amber-500/60'
                  : 'bg-gradient-to-r from-amber-100 via-orange-50 to-amber-100 border-amber-300'
              }`}
            >
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <img
                  src={mostRecentUnfinished.book.coverUrl}
                  alt="cover"
                  referrerPolicy="no-referrer"
                  className="w-14 h-18 rounded-2xl object-cover shadow-md border-2 border-amber-300 shrink-0"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px]">
                      最近未讀完
                    </span>
                    <span className="text-xs font-bold text-slate-400">
                      上次停留：第 {mostRecentUnfinished.lastPage} / {mostRecentUnfinished.totalPages} 頁
                    </span>
                  </div>
                  <h4 className="text-base font-black truncate max-w-xs sm:max-w-md">
                    《{typeof mostRecentUnfinished.book.title === 'string'
                      ? mostRecentUnfinished.book.title
                      : mostRecentUnfinished.book.title['zh-TW'] || mostRecentUnfinished.book.title.en}》
                  </h4>
                  <div className="w-48 sm:w-64 h-2 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                      style={{ width: `${mostRecentUnfinished.progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => handleResumeBook(mostRecentUnfinished.book, mostRecentUnfinished.lastPage)}
                  className="flex-1 sm:flex-initial px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-xs sm:text-sm shadow-md hover:scale-105 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>繼續從第 {mostRecentUnfinished.lastPage} 頁閱讀</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="px-6 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setFilterTab('in_progress')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                filterTab === 'in_progress'
                  ? 'bg-amber-500 text-slate-950 shadow-2xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-amber-200 dark:border-slate-700 hover:bg-amber-100'
              }`}
            >
              進行中未完讀 ({inProgressList.length})
            </button>

            <button
              type="button"
              onClick={() => setFilterTab('completed')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                filterTab === 'completed'
                  ? 'bg-amber-500 text-slate-950 shadow-2xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-amber-200 dark:border-slate-700 hover:bg-amber-100'
              }`}
            >
              已完讀歷史 ({completedList.length})
            </button>

            <button
              type="button"
              onClick={() => setFilterTab('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                filterTab === 'all'
                  ? 'bg-amber-500 text-slate-950 shadow-2xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-amber-200 dark:border-slate-700 hover:bg-amber-100'
              }`}
            >
              全部記錄 ({allProgressItems.length})
            </button>
          </div>

          <span className="text-xs text-slate-400 font-bold hidden sm:inline">
            共 {displayedList.length} 本紀錄
          </span>
        </div>

        {/* Progress List Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3 pt-0">
          {displayedList.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="text-5xl">📚</div>
              <p className="text-sm font-bold text-slate-500">
                目前沒有符合此分類的繪本閱讀記錄
              </p>
            </div>
          ) : (
            displayedList.map((item) => {
              const titleZh = typeof item.book.title === 'string'
                ? item.book.title
                : item.book.title['zh-TW'] || item.book.title.en;

              return (
                <div
                  key={item.book.id}
                  className={`p-4 rounded-3xl border-2 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                    item.isCompleted
                      ? darkMode
                        ? 'bg-slate-800/60 border-slate-700'
                        : 'bg-white border-amber-200 shadow-xs'
                      : darkMode
                      ? 'bg-slate-850 border-amber-500/40 shadow-xs'
                      : 'bg-gradient-to-r from-amber-50/80 to-white border-amber-300 shadow-xs'
                  }`}
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <img
                      src={item.book.coverUrl}
                      alt={titleZh}
                      referrerPolicy="no-referrer"
                      className="w-12 h-16 rounded-xl object-cover shadow-sm border border-amber-300 shrink-0"
                    />

                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {item.isCompleted ? (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>已完全讀完 🏆</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 border border-amber-500">
                            未完成 ({item.progressPercent}%)
                          </span>
                        )}

                        <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{item.lastReadDateStr}</span>
                        </span>
                      </div>

                      <h4 className="font-extrabold text-sm sm:text-base truncate">
                        《{titleZh}》
                      </h4>

                      <div className="flex items-center gap-3">
                        <div className="w-28 sm:w-36 h-2 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              item.isCompleted ? 'bg-emerald-500' : 'bg-amber-500'
                            }`}
                            style={{ width: `${item.progressPercent}%` }}
                          />
                        </div>
                        <span className="text-xs font-mono font-bold text-slate-500">
                          第 {item.lastPage} / {item.totalPages} 頁
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
                    {!item.isCompleted ? (
                      <button
                        type="button"
                        onClick={() => handleResumeBook(item.book, item.lastPage)}
                        className="px-4 py-2 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-sm transition-transform hover:scale-105 flex items-center gap-1.5 cursor-pointer"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>繼續閱讀</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleRestartBook(item.book)}
                        className="px-4 py-2 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-sm transition-transform hover:scale-105 flex items-center gap-1.5 cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>重溫閱讀</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleRestartBook(item.book)}
                      className="p-2 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                      title="從第 1 頁重新開始"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleResetProgress(item.book.id)}
                      className="p-2 rounded-2xl hover:bg-rose-100 hover:text-rose-600 dark:hover:bg-rose-950/40 text-slate-400 text-xs font-bold transition-colors cursor-pointer"
                      title="清除此記錄"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-amber-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 flex items-center justify-between">
          <div className="text-xs font-bold text-amber-900/80 dark:text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>閱讀進度即時自動同步，隨時換裝置或重新整理都不怕遺失進度！</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs sm:text-sm shadow-md transition-transform hover:scale-105 cursor-pointer"
          >
            返回閱讀大廳
          </button>
        </div>
      </div>
    </div>
  );
};
