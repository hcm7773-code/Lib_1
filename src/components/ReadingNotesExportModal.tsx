import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, Download, Copy, Check, FileText, Printer, BookOpen,
  Calendar, Star, Sparkles, Heart, Tag, Filter, Share2,
  Trash2, Layers, Award, Quote, CheckSquare, Square, Search, RefreshCw
} from 'lucide-react';
import { Book, UserProfile, MoodJournalEntry } from '../types';
import { QuickReadingNoteItem } from './QuickReadingNotesModal';
import { playStarChime, playPageTurnSound } from '../utils/audio';

interface ReadingNotesExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  books: Book[];
  userProfile?: UserProfile;
  activeBook?: Book | null;
  darkMode?: boolean;
}

interface AggregatedNoteItem {
  id: string;
  sourceType: 'quick_note' | 'mood_journal';
  bookId: string;
  bookTitle: string;
  coverUrl?: string;
  pageNumber?: number;
  tag: string;
  content: string;
  emotionEmoji: string;
  createdAt: string;
  rating?: number;
  favoriteQuote?: string;
}

export const ReadingNotesExportModal: React.FC<ReadingNotesExportModalProps> = ({
  isOpen,
  onClose,
  books,
  userProfile,
  activeBook = null,
  darkMode = false,
}) => {
  const [selectedBookFilter, setSelectedBookFilter] = useState<string>(activeBook ? activeBook.id : 'all');
  const [exportFormat, setExportFormat] = useState<'markdown' | 'txt' | 'card' | 'json'>('markdown');
  const [tagFilter, setTagFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNoteIds, setSelectedNoteIds] = useState<Set<string>>(new Set());
  const [hasCopied, setHasCopied] = useState(false);
  const [cardTheme, setCardTheme] = useState<'amber' | 'rose' | 'indigo' | 'emerald'>('amber');

  // Gather all notes across books from localStorage + userProfile.moodJournal
  const allNotes = useMemo<AggregatedNoteItem[]>(() => {
    const list: AggregatedNoteItem[] = [];

    // 1. Scan localStorage for quick notes
    books.forEach((b) => {
      const bookTitle = typeof b.title === 'string' ? b.title : (b.title['zh-TW'] || b.title.en || '繪本');
      try {
        const saved = localStorage.getItem(`reading_quick_notes_${b.id}`);
        if (saved) {
          const parsed: QuickReadingNoteItem[] = JSON.parse(saved);
          parsed.forEach((n) => {
            list.push({
              id: `qn-${n.id}`,
              sourceType: 'quick_note',
              bookId: b.id,
              bookTitle,
              coverUrl: b.coverUrl,
              pageNumber: n.pageNumber,
              tag: n.tag,
              content: n.content,
              emotionEmoji: n.emotionEmoji || '✨',
              createdAt: n.createdAt,
            });
          });
        }
      } catch (e) {
        console.warn('Failed reading quick note for', b.id, e);
      }
    });

    // 2. Add Mood Journal entries
    if (userProfile?.moodJournal && userProfile.moodJournal.length > 0) {
      userProfile.moodJournal.forEach((mj) => {
        list.push({
          id: `mj-${mj.id}`,
          sourceType: 'mood_journal',
          bookId: mj.bookId,
          bookTitle: mj.bookTitle,
          coverUrl: mj.coverUrl,
          tag: '💖 心情閱讀日記',
          content: mj.reflectionText,
          emotionEmoji: mj.moodEmoji || '😄',
          createdAt: mj.createdAt,
          rating: mj.rating,
          favoriteQuote: mj.favoriteQuote,
        });
      });
    }

    // Default sample if no notes yet
    if (list.length === 0 && books.length > 0) {
      const sampleBook = books[0];
      const bookTitle = typeof sampleBook.title === 'string' ? sampleBook.title : (sampleBook.title['zh-TW'] || sampleBook.title.en);
      list.push({
        id: 'sample-1',
        sourceType: 'quick_note',
        bookId: sampleBook.id,
        bookTitle,
        coverUrl: sampleBook.coverUrl,
        pageNumber: 1,
        tag: '🌟 精彩金句',
        content: '真正重要的東西，是用眼睛看不見的，只有用心才能看得到。',
        emotionEmoji: '💖',
        createdAt: new Date().toLocaleDateString('zh-TW'),
      });
    }

    return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [books, userProfile, isOpen]);

  // Initialize selected notes
  useEffect(() => {
    if (allNotes.length > 0) {
      setSelectedNoteIds(new Set(allNotes.map((n) => n.id)));
    }
  }, [allNotes]);

  // Filter notes
  const filteredNotes = useMemo(() => {
    return allNotes.filter((n) => {
      const matchesBook = selectedBookFilter === 'all' || n.bookId === selectedBookFilter;
      const matchesTag = tagFilter === 'all' || n.tag.includes(tagFilter);
      const matchesSearch = !searchQuery ||
        n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.bookTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (n.favoriteQuote && n.favoriteQuote.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesBook && matchesTag && matchesSearch;
    });
  }, [allNotes, selectedBookFilter, tagFilter, searchQuery]);

  // Toggle selection
  const handleToggleSelectNote = (id: string) => {
    setSelectedNoteIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    setSelectedNoteIds(new Set(filteredNotes.map((n) => n.id)));
  };

  const handleDeselectAll = () => {
    setSelectedNoteIds(new Set());
  };

  // Generate content string
  const activeSelectedNotes = useMemo(() => {
    return filteredNotes.filter((n) => selectedNoteIds.has(n.id));
  }, [filteredNotes, selectedNoteIds]);

  const generateMarkdownContent = () => {
    const readerName = userProfile?.name || '小讀者';
    const exportDate = new Date().toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' });
    
    let md = `# 📚 ${readerName} 的童心繪本閱讀筆記與心得總匯\n\n`;
    md += `> 📅 匯出日期：${exportDate} | 🌟 累積共 ${activeSelectedNotes.length} 篇筆記\n\n`;
    md += `---\n\n`;

    // Group by book
    const groupedByBook: Record<string, AggregatedNoteItem[]> = {};
    activeSelectedNotes.forEach((n) => {
      if (!groupedByBook[n.bookTitle]) {
        groupedByBook[n.bookTitle] = [];
      }
      groupedByBook[n.bookTitle].push(n);
    });

    Object.entries(groupedByBook).forEach(([title, notesList]) => {
      md += `## 📖 《${title}》\n\n`;
      notesList.forEach((n, idx) => {
        const pageStr = n.pageNumber ? `（第 ${n.pageNumber} 頁）` : '';
        const ratingStr = n.rating ? ` ⭐ 評分: ${n.rating} / 5` : '';
        md += `### ${idx + 1}. ${n.emotionEmoji} 【${n.tag}】 ${pageStr} - ${n.createdAt}${ratingStr}\n\n`;
        if (n.favoriteQuote) {
          md += `> 💬 喜愛金句：「${n.favoriteQuote}」\n\n`;
        }
        md += `${n.content}\n\n`;
      });
      md += `---\n\n`;
    });

    md += `\n*✨ 本筆記由「童心雙語繪本世界」智慧導覽與閱讀紀錄系統自動匯出產生*`;
    return md;
  };

  const generatePlainTextContent = () => {
    const readerName = userProfile?.name || '小讀者';
    const exportDate = new Date().toLocaleDateString('zh-TW');
    
    let txt = `====================================================\n`;
    txt += `  📚 ${readerName} 的繪本閱讀筆記與心得彙總\n`;
    txt += `  📅 匯出日期: ${exportDate} | 共 ${activeSelectedNotes.length} 則紀錄\n`;
    txt += `====================================================\n\n`;

    activeSelectedNotes.forEach((n, idx) => {
      txt += `[${idx + 1}] 📖 《${n.bookTitle}》 ${n.pageNumber ? `(第 ${n.pageNumber} 頁)` : ''}\n`;
      txt += `    標籤: ${n.emotionEmoji} ${n.tag} | 時間: ${n.createdAt}\n`;
      if (n.favoriteQuote) {
        txt += `    金句: 「${n.favoriteQuote}」\n`;
      }
      txt += `    心得: ${n.content}\n`;
      txt += `----------------------------------------------------\n\n`;
    });

    return txt;
  };

  const handleDownloadFile = (type: 'md' | 'txt' | 'json') => {
    playStarChime();
    let content = '';
    let mimeType = 'text/plain;charset=utf-8';
    let fileName = `閱讀筆記_${userProfile?.name || '小讀者'}_${new Date().toISOString().slice(0, 10)}`;

    if (type === 'md') {
      content = generateMarkdownContent();
      mimeType = 'text/markdown;charset=utf-8';
      fileName += '.md';
    } else if (type === 'txt') {
      content = generatePlainTextContent();
      fileName += '.txt';
    } else if (type === 'json') {
      content = JSON.stringify(activeSelectedNotes, null, 2);
      mimeType = 'application/json;charset=utf-8';
      fileName += '.json';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyClipboard = () => {
    playStarChime();
    const content = exportFormat === 'markdown' ? generateMarkdownContent() : generatePlainTextContent();
    navigator.clipboard.writeText(content);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2500);
  };

  const handlePrint = () => {
    playPageTurnSound();
    window.print();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25 }}
          className={`relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden ${
            darkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-amber-200 text-slate-900'
          }`}
          id="reading-notes-export-modal"
        >
          {/* Header */}
          <div className={`p-4 sm:p-6 border-b flex items-center justify-between gap-3 ${
            darkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-gradient-to-r from-amber-500 via-orange-400 to-amber-500 text-white border-amber-300'
          }`}>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-white/20 backdrop-blur-xs text-white shadow-md">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black tracking-tight flex items-center gap-2">
                  <span>📖 閱讀筆記與心得智慧匯出中心</span>
                  <span className="text-[11px] font-extrabold bg-black/20 text-amber-200 px-2 py-0.5 rounded-full border border-white/20">
                    Export Hub
                  </span>
                </h2>
                <p className="text-xs font-medium opacity-90">
                  一鍵打包全書金句筆記、心得體悟與生詞筆記，支援 Markdown、純文字、卡片與列印 PDF
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-2xl hover:bg-white/20 transition-colors text-white cursor-pointer"
              title="關閉"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Main Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
            {/* Filter and Selection Controls */}
            <div className={`p-4 rounded-2xl border space-y-3.5 ${
              darkMode ? 'bg-slate-800/60 border-slate-700' : 'bg-amber-50/80 border-amber-200/70'
            }`}>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Book Select Filter */}
                <div>
                  <label className="block text-xs font-black mb-1 opacity-80">篩選繪本來源：</label>
                  <select
                    value={selectedBookFilter}
                    onChange={(e) => setSelectedBookFilter(e.target.value)}
                    className={`w-full text-xs sm:text-sm font-bold p-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                      darkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-amber-200 text-amber-950'
                    }`}
                  >
                    <option value="all">📚 全部繪本筆記 ({allNotes.length})</option>
                    {books.map((b) => {
                      const bookTitle = typeof b.title === 'string' ? b.title : (b.title['zh-TW'] || b.title.en);
                      const count = allNotes.filter((n) => n.bookId === b.id).length;
                      return (
                        <option key={b.id} value={b.id}>
                          📖 《{bookTitle}》 ({count} 則)
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Tag Filter */}
                <div>
                  <label className="block text-xs font-black mb-1 opacity-80">筆記標籤分類：</label>
                  <select
                    value={tagFilter}
                    onChange={(e) => setTagFilter(e.target.value)}
                    className={`w-full text-xs sm:text-sm font-bold p-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                      darkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-amber-200 text-amber-950'
                    }`}
                  >
                    <option value="all">🏷️ 全部標籤</option>
                    <option value="金句">🌟 精彩金句</option>
                    <option value="心得">📝 心得感想 / 體悟</option>
                    <option value="問題">💡 好奇問題與思考</option>
                    <option value="情感">💖 情感共鳴 / 心情日記</option>
                    <option value="生字">🔤 生字學習</option>
                  </select>
                </div>

                {/* Search query */}
                <div>
                  <label className="block text-xs font-black mb-1 opacity-80">關鍵字檢索：</label>
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="搜尋筆記內容或金句..."
                      className={`w-full text-xs sm:text-sm font-bold pl-9 pr-3 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                        darkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-amber-200 text-amber-950'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Selection Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-amber-200/40 dark:border-slate-700 text-xs font-extrabold">
                <div className="flex items-center gap-3">
                  <span>已選取 {activeSelectedNotes.length} / {filteredNotes.length} 則筆記</span>
                  <button
                    onClick={handleSelectAll}
                    className="text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                  >
                    全選
                  </button>
                  <span>•</span>
                  <button
                    onClick={handleDeselectAll}
                    className="text-slate-500 hover:underline cursor-pointer"
                  >
                    取消全選
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] opacity-70">格式預覽切換：</span>
                  {(['markdown', 'txt', 'card', 'json'] as const).map((fmt) => (
                    <button
                      key={fmt}
                      onClick={() => setExportFormat(fmt)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        exportFormat === fmt
                          ? 'bg-amber-500 text-slate-950 font-black shadow-xs scale-105'
                          : darkMode
                          ? 'bg-slate-700 text-slate-300'
                          : 'bg-white text-slate-700 border border-slate-200'
                      }`}
                    >
                      {fmt === 'markdown' ? '📄 Markdown' : fmt === 'txt' ? '📑 純文字' : fmt === 'card' ? '🎨 閱讀卡片' : '📊 JSON'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Content Preview & Selection Area */}
            {activeSelectedNotes.length === 0 ? (
              <div className="py-12 text-center space-y-3 border-2 border-dashed rounded-3xl border-amber-200 dark:border-slate-700">
                <div className="text-4xl">📝</div>
                <h4 className="font-extrabold text-base">目前尚無符合篩選條件的閱讀筆記</h4>
                <p className="text-xs opacity-70 max-w-sm mx-auto">
                  在繪本閱讀器中點擊「快速筆記」或「心情日記」，即可隨時為精彩頁面紀錄金句與心得喔！
                </p>
              </div>
            ) : exportFormat === 'card' ? (
              /* Visual Card Mode */
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>精美小讀者閱讀紀念卡片主題：</span>
                  </span>
                  <div className="flex items-center gap-2">
                    {[
                      { id: 'amber', label: '溫暖金', bg: 'bg-amber-400' },
                      { id: 'rose', label: '玫瑰粉', bg: 'bg-rose-400' },
                      { id: 'indigo', label: '星空藍', bg: 'bg-indigo-400' },
                      { id: 'emerald', label: '森林綠', bg: 'bg-emerald-400' },
                    ].map((theme) => (
                      <button
                        key={theme.id}
                        onClick={() => setCardTheme(theme.id as any)}
                        className={`w-6 h-6 rounded-full ${theme.bg} transition-transform ${
                          cardTheme === theme.id ? 'scale-125 ring-2 ring-amber-500 ring-offset-2' : 'opacity-70 hover:opacity-100'
                        }`}
                        title={theme.label}
                      />
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeSelectedNotes.slice(0, 6).map((note) => {
                    const themeClasses = {
                      amber: 'bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 border-amber-300 text-amber-950',
                      rose: 'bg-gradient-to-br from-rose-50 via-pink-50 to-rose-100 border-rose-300 text-rose-950',
                      indigo: 'bg-gradient-to-br from-indigo-50 via-blue-50 to-indigo-100 border-indigo-300 text-indigo-950',
                      emerald: 'bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100 border-emerald-300 text-emerald-950',
                    }[cardTheme];

                    return (
                      <motion.div
                        key={note.id}
                        whileHover={{ y: -3 }}
                        className={`p-5 rounded-3xl border-2 shadow-md space-y-3 relative overflow-hidden ${themeClasses}`}
                      >
                        <div className="flex items-center justify-between border-b border-black/10 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{note.emotionEmoji}</span>
                            <div>
                              <h4 className="font-black text-sm line-clamp-1">《{note.bookTitle}》</h4>
                              <span className="text-[10px] font-bold opacity-75">{note.createdAt} {note.pageNumber ? `• 第 ${note.pageNumber} 頁` : ''}</span>
                            </div>
                          </div>
                          <span className="text-xs font-black bg-black/10 px-2.5 py-0.5 rounded-full">
                            {note.tag}
                          </span>
                        </div>

                        {note.favoriteQuote && (
                          <div className="p-2.5 rounded-2xl bg-white/70 backdrop-blur-xs border border-black/5 text-xs font-semibold italic flex items-start gap-1.5">
                            <Quote className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                            <span>「{note.favoriteQuote}」</span>
                          </div>
                        )}

                        <p className="text-xs sm:text-sm font-medium leading-relaxed">
                          {note.content}
                        </p>

                        <div className="pt-2 border-t border-black/10 flex items-center justify-between text-[11px] font-extrabold opacity-80">
                          <span>小讀者：{userProfile?.name || '愛書探險家'}</span>
                          <span>🌟 童心雙語繪本世界</span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* Text / Markdown Code Preview */
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black flex items-center gap-2">
                    <span>📑 預覽即將匯出的內容（共 {activeSelectedNotes.length} 條筆記）：</span>
                  </span>
                </div>

                <div className={`p-4 rounded-2xl border font-mono text-xs max-h-80 overflow-y-auto whitespace-pre-wrap leading-relaxed ${
                  darkMode ? 'bg-slate-950 border-slate-800 text-amber-200' : 'bg-slate-50 border-slate-300 text-slate-800'
                }`}>
                  {exportFormat === 'markdown'
                    ? generateMarkdownContent()
                    : exportFormat === 'txt'
                    ? generatePlainTextContent()
                    : JSON.stringify(activeSelectedNotes, null, 2)}
                </div>

                {/* Selectable item list */}
                <div className="space-y-2 pt-2">
                  <span className="text-xs font-bold opacity-75">勾選需要納入匯出的個別筆記：</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                    {filteredNotes.map((note) => {
                      const isSelected = selectedNoteIds.has(note.id);
                      return (
                        <div
                          key={note.id}
                          onClick={() => handleToggleSelectNote(note.id)}
                          className={`p-2.5 rounded-xl border text-xs flex items-start gap-2.5 cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-amber-100/70 border-amber-400 text-amber-950 dark:bg-amber-950/40 dark:border-amber-600 dark:text-amber-200'
                              : 'bg-transparent border-slate-200 dark:border-slate-700 opacity-60'
                          }`}
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-extrabold truncate">《{note.bookTitle}》</span>
                              <span className="text-[10px] opacity-70 shrink-0">{note.tag}</span>
                            </div>
                            <p className="text-[11px] truncate mt-0.5 opacity-90">{note.content}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className={`p-4 sm:p-5 border-t flex flex-wrap items-center justify-between gap-3 ${
            darkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-50 border-amber-200'
          }`}>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyClipboard}
                className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-md transition-transform hover:scale-105 cursor-pointer"
              >
                {hasCopied ? <Check className="w-4 h-4 text-emerald-950" /> : <Copy className="w-4 h-4" />}
                <span>{hasCopied ? '已複製到剪貼簿！' : '複製筆記內容'}</span>
              </button>

              <button
                onClick={handlePrint}
                className={`px-4 py-2.5 rounded-2xl border font-black text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
                  darkMode ? 'bg-slate-700 text-slate-100 border-slate-600 hover:bg-slate-600' : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-100'
                }`}
              >
                <Printer className="w-4 h-4 text-indigo-500" />
                <span>友善列印 / 存為 PDF</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleDownloadFile('md')}
                className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow-md hover:scale-105 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4 text-white" />
                <span>下載 .MD 筆記檔</span>
              </button>

              <button
                onClick={() => handleDownloadFile('txt')}
                className="px-3.5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-black text-xs sm:text-sm flex items-center gap-1.5 transition-all cursor-pointer"
                title="下載純文字 TXT 檔"
              >
                <span>.TXT</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
