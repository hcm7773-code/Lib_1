import React, { useState, useEffect } from 'react';
import { BookOpen, ArrowRight, RotateCcw, X, Bookmark, Sparkles, Clock, ChevronRight, Compass } from 'lucide-react';
import { Book, UserProfile } from '../types';
import {
  findMostRecentUnfinishedBook,
  UnfinishedBookPromptData,
  dismissResumePromptForBook,
  isResumePromptDismissedForBook,
} from '../utils/readingProgressTracker';
import { playStarChime, playPageTurnSound } from '../utils/audio';

interface ResumeReadingPromptBannerProps {
  books: Book[];
  userProfile?: UserProfile;
  onSelectBook: (book: Book, startPage?: number) => void;
  onOpenProgressOverview?: () => void;
  darkMode?: boolean;
}

export const ResumeReadingPromptBanner: React.FC<ResumeReadingPromptBannerProps> = ({
  books,
  userProfile,
  onSelectBook,
  onOpenProgressOverview,
  darkMode = false,
}) => {
  const [unfinishedData, setUnfinishedData] = useState<UnfinishedBookPromptData | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  // Automatically check for unfinished books on mount and whenever userProfile/books change
  useEffect(() => {
    const data = findMostRecentUnfinishedBook(books, userProfile);
    if (data) {
      const dismissed = isResumePromptDismissedForBook(data.book.id);
      setIsDismissed(dismissed);
      setUnfinishedData(data);
    } else {
      setUnfinishedData(null);
    }
  }, [books, userProfile]);

  if (!unfinishedData || isDismissed) {
    return null;
  }

  const { book, lastPageRead, totalPages, progressPercent, lastReadDateStr } = unfinishedData;
  const bookTitleZh = typeof book.title === 'string'
    ? book.title
    : (book.title['zh-TW'] || book.title.en || '繪本');

  const handleResume = () => {
    playStarChime();
    onSelectBook(book, lastPageRead);
  };

  const handleRestart = () => {
    playPageTurnSound();
    onSelectBook(book, 1);
  };

  const handleDismiss = () => {
    dismissResumePromptForBook(book.id);
    setIsDismissed(true);
  };

  // Minimized floating pill state
  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-40 animate-fadeIn">
        <button
          type="button"
          onClick={() => setIsMinimized(false)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl shadow-xl border-2 transition-all hover:scale-105 cursor-pointer ${
            darkMode
              ? 'bg-slate-900/95 border-amber-500/80 text-amber-200'
              : 'bg-white/95 border-amber-400 text-amber-950'
          }`}
          title="點擊展開未完成繪本續讀提示"
        >
          <Bookmark className="w-4 h-4 text-amber-500 fill-amber-500 animate-pulse" />
          <span className="text-xs font-black">
            繼續閱讀《{bookTitleZh}》(第 {lastPageRead} 頁)
          </span>
          <ChevronRight className="w-4 h-4 text-amber-600" />
        </button>
      </div>
    );
  }

  return (
    <div
      id="resume-reading-prompt-banner"
      className="relative z-30 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-3 mb-1 animate-fadeIn"
    >
      <div
        className={`relative rounded-3xl p-4 sm:p-5 border-2 shadow-lg transition-all overflow-hidden ${
          darkMode
            ? 'bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 border-amber-500/60 text-slate-100'
            : 'bg-gradient-to-r from-amber-100/90 via-orange-50/90 to-amber-100/90 border-amber-300/90 text-amber-950'
        }`}
      >
        {/* Background decorative subtle sparkles */}
        <div className="absolute top-2 right-20 opacity-20 pointer-events-none">
          <Sparkles className="w-16 h-16 text-amber-400" />
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          
          {/* Left: Book Cover & Progress Info */}
          <div className="flex items-center gap-3.5 sm:gap-4 flex-1 min-w-0">
            <div className="relative shrink-0 w-14 h-18 sm:w-16 sm:h-20 rounded-2xl overflow-hidden shadow-md border-2 border-amber-300/80 group">
              <img
                src={book.coverUrl}
                alt={bookTitleZh}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
              <div className="absolute bottom-0 inset-x-0 bg-black/70 text-[10px] font-black text-amber-300 text-center py-0.5">
                {progressPercent}%
              </div>
            </div>

            <div className="space-y-1.5 min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[11px] shadow-2xs">
                  <Bookmark className="w-3 h-3 fill-slate-950" />
                  <span>上次未讀完</span>
                </span>
                <span className={`text-[11px] font-bold flex items-center gap-1 ${
                  darkMode ? 'text-slate-400' : 'text-amber-800/80'
                }`}>
                  <Clock className="w-3 h-3" />
                  <span>上次記錄：{lastReadDateStr}</span>
                </span>
                <span className="text-[11px] font-black text-amber-600 dark:text-amber-400">
                  • 是否從上次閱讀頁面繼續？
                </span>
              </div>

              <h4 className="font-extrabold text-sm sm:text-base truncate">
                《{bookTitleZh}》
              </h4>

              <div className="flex items-center gap-3">
                {/* Progress bar */}
                <div className="w-28 sm:w-36 h-2 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <span className="text-xs font-black text-amber-600 dark:text-amber-300">
                  第 {lastPageRead} / {totalPages} 頁
                </span>
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-end flex-wrap pt-2 md:pt-0 border-t md:border-t-0 border-amber-200/60 dark:border-slate-800">
            <button
              type="button"
              id="btn-resume-continue"
              onClick={handleResume}
              className="flex-1 md:flex-initial px-4 sm:px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs sm:text-sm shadow-md hover:scale-105 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>從第 {lastPageRead} 頁繼續閱讀</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {onOpenProgressOverview && (
              <button
                type="button"
                onClick={onOpenProgressOverview}
                className={`px-3 py-2.5 rounded-2xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer border ${
                  darkMode
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                    : 'bg-amber-100 hover:bg-amber-200 text-amber-950 border-amber-300'
                }`}
                title="查看所有繪本閱讀進度總覽"
              >
                <Compass className="w-3.5 h-3.5 text-amber-600" />
                <span className="hidden sm:inline">進度總覽</span>
              </button>
            )}

            <button
              type="button"
              id="btn-resume-restart"
              onClick={handleRestart}
              className={`px-3 py-2.5 rounded-2xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer border ${
                darkMode
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                  : 'bg-white/80 hover:bg-white text-amber-900 border-amber-200'
              }`}
              title="從第 1 頁重新開始閱讀"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">從頭閱讀</span>
            </button>

            <button
              type="button"
              onClick={handleDismiss}
              className={`p-2 rounded-2xl transition-colors cursor-pointer ${
                darkMode
                  ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                  : 'text-amber-800/70 hover:text-amber-950 hover:bg-amber-200/60'
              }`}
              title="稍後再讀"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
