import React, { useState, useEffect } from 'react';
import {
  StickyNote, Plus, Trash2, Edit3, Check, X, Copy, Tag,
  Sparkles, Heart, HelpCircle, Bookmark, MessageSquare, Star, Clock, Filter,
  Download, FileText
} from 'lucide-react';
import { Book } from '../types';
import { playStarChime, playPageTurnSound } from '../utils/audio';
import { ReadingNotesExportModal } from './ReadingNotesExportModal';

export interface QuickReadingNoteItem {
  id: string;
  pageNumber: number;
  tag: string;
  content: string;
  emotionEmoji: string;
  createdAt: string;
}

interface QuickReadingNotesModalProps {
  book: Book;
  currentPageNumber: number;
  isOpen: boolean;
  onClose: () => void;
  onJumpToPage?: (pageNum: number) => void;
}

const PRESET_NOTE_TAGS = [
  { label: '🌟 精彩金句', color: 'bg-amber-100 text-amber-800 border-amber-300' },
  { label: '💡 好奇問題', color: 'bg-indigo-100 text-indigo-800 border-indigo-300' },
  { label: '💖 情感共鳴', color: 'bg-rose-100 text-rose-800 border-rose-300' },
  { label: '🎨 繪畫靈感', color: 'bg-purple-100 text-purple-800 border-purple-300' },
  { label: '🔤 生字筆記', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  { label: '📝 心得感想', color: 'bg-orange-100 text-orange-800 border-orange-300' },
];

const EMOJI_OPTIONS = ['✨', '💖', '💡', '😍', '🤔', '🎉', '🚀', '🌱'];

export const QuickReadingNotesModal: React.FC<QuickReadingNotesModalProps> = ({
  book,
  currentPageNumber,
  isOpen,
  onClose,
  onJumpToPage,
}) => {
  const storageKey = `reading_quick_notes_${book.id}`;
  const [notes, setNotes] = useState<QuickReadingNoteItem[]>([]);
  const [selectedTag, setSelectedTag] = useState<string>(PRESET_NOTE_TAGS[0].label);
  const [noteContent, setNoteContent] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('✨');
  const [targetPageNumber, setTargetPageNumber] = useState<number>(currentPageNumber);
  const [filterMode, setFilterMode] = useState<'all' | 'current'>('all');
  const [hasCopied, setHasCopied] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Load notes from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setNotes(JSON.parse(saved));
      } else {
        // Initial sample welcoming note
        const initialNote: QuickReadingNoteItem = {
          id: 'note-welcome-1',
          pageNumber: 1,
          tag: '📝 心得感想',
          content: '打開這本繪本，插圖好溫馨！期待主角接下來的精彩旅程。',
          emotionEmoji: '✨',
          createdAt: new Date().toLocaleString('zh-TW', { hour12: false }),
        };
        setNotes([initialNote]);
        localStorage.setItem(storageKey, JSON.stringify([initialNote]));
      }
    } catch (e) {
      console.warn('Failed to load notes', e);
    }
  }, [storageKey]);

  // Update target page number when current page changes
  useEffect(() => {
    setTargetPageNumber(currentPageNumber);
  }, [currentPageNumber]);

  if (!isOpen) return null;

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim()) return;

    playStarChime();
    const newNote: QuickReadingNoteItem = {
      id: `note-${Date.now()}`,
      pageNumber: targetPageNumber,
      tag: selectedTag,
      content: noteContent.trim(),
      emotionEmoji: selectedEmoji,
      createdAt: new Date().toLocaleString('zh-TW', { hour12: false }),
    };

    const updated = [newNote, ...notes];
    setNotes(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
    setNoteContent('');
  };

  const handleDeleteNote = (id: string) => {
    const updated = notes.filter((n) => n.id !== id);
    setNotes(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
    playPageTurnSound();
  };

  const handleCopyAllNotes = () => {
    playStarChime();
    const bookTitle = typeof book.title === 'string' ? book.title : (book.title['zh-TW'] || book.title.en || '繪本');
    const report = `📝 《${bookTitle}》快速閱讀筆記彙總\n\n` +
      notes.map((n, idx) => `${idx + 1}. [第 ${n.pageNumber} 頁] ${n.emotionEmoji} 【${n.tag}】 (${n.createdAt})\n   ${n.content}`).join('\n\n');
    
    navigator.clipboard.writeText(report);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2500);
  };

  const filteredNotes = filterMode === 'current'
    ? notes.filter((n) => n.pageNumber === currentPageNumber)
    : notes;

  const bookTitle = typeof book.title === 'string' ? book.title : (book.title['zh-TW'] || book.title.en || '繪本');

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn"
      id="modal-quick-reading-notes"
    >
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl border-2 border-amber-300 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 p-4 sm:p-5 text-white flex items-center justify-between shadow-md shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-2xl shadow-inner">
              📝
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-lg text-white">
                  快速閱讀筆記 (Quick Reading Notes)
                </h3>
                <span className="bg-black/20 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                  已記錄 {notes.length} 則
                </span>
              </div>
              <p className="text-xs text-white/90 font-bold mt-0.5">
                《{bookTitle}》隨手記下閃光靈感、好奇提問與感動金句
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Note Composer Form */}
        <form onSubmit={handleSaveNote} className="p-4 sm:p-5 bg-amber-50/70 dark:bg-slate-800/80 border-b border-amber-200 dark:border-slate-700 space-y-3 shrink-0">
          
          <div className="flex flex-wrap items-center justify-between gap-2">
            
            {/* Page Selector */}
            <div className="flex items-center gap-1.5 text-xs font-black text-amber-950 dark:text-amber-200 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-amber-300 dark:border-slate-600 shadow-2xs">
              <span>關聯頁數：</span>
              <select
                value={targetPageNumber}
                onChange={(e) => setTargetPageNumber(Number(e.target.value))}
                className="bg-transparent font-black text-orange-600 focus:outline-hidden cursor-pointer"
              >
                {book.pages.map((p) => (
                  <option key={p.pageNumber} value={p.pageNumber}>
                    第 {p.pageNumber} 頁
                  </option>
                ))}
              </select>
            </div>

            {/* Emoji Selector */}
            <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-amber-200 dark:border-slate-600 shadow-2xs">
              {EMOJI_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setSelectedEmoji(emoji)}
                  className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center transition-all cursor-pointer ${
                    selectedEmoji === emoji
                      ? 'bg-amber-400 text-slate-950 scale-110 shadow-xs'
                      : 'hover:bg-amber-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Tag Chips Switcher */}
          <div className="flex flex-wrap gap-1.5">
            {PRESET_NOTE_TAGS.map((t) => {
              const isSelected = selectedTag === t.label;
              return (
                <button
                  key={t.label}
                  type="button"
                  onClick={() => {
                    setSelectedTag(t.label);
                    playPageTurnSound();
                  }}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-transparent shadow-xs scale-105'
                      : `${t.color}`
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>

          {/* Text Area & Submit */}
          <div className="flex gap-2">
            <input
              type="text"
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="寫下一句心得、疑問或喜歡的台詞..."
              className="flex-1 px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-amber-300 dark:border-slate-600 text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-amber-400"
            />

            <button
              type="submit"
              disabled={!noteContent.trim()}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs sm:text-sm shadow-md transition-all hover:scale-105 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>記下筆記</span>
            </button>
          </div>
        </form>

        {/* Filter and List Toolbar */}
        <div className="p-3 px-5 bg-white dark:bg-slate-900 border-b border-amber-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-slate-500 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              <span>篩選：</span>
            </span>

            <button
              type="button"
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1 rounded-xl text-xs font-extrabold transition-colors cursor-pointer ${
                filterMode === 'all'
                  ? 'bg-amber-500 text-slate-950 shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              全部頁面 ({notes.length})
            </button>

            <button
              type="button"
              onClick={() => setFilterMode('current')}
              className={`px-3 py-1 rounded-xl text-xs font-extrabold transition-colors cursor-pointer ${
                filterMode === 'current'
                  ? 'bg-amber-500 text-slate-950 shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              僅當前頁 (第 {currentPageNumber} 頁)
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyAllNotes}
              disabled={notes.length === 0}
              className="text-xs font-bold text-amber-700 dark:text-amber-300 hover:text-amber-800 flex items-center gap-1 cursor-pointer disabled:opacity-40"
            >
              {hasCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{hasCopied ? '已複製' : '快速複製'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsExportModalOpen(true);
                playStarChime();
              }}
              className="px-2.5 py-1 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1 shadow-xs transition-transform hover:scale-105 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>匯出中心 (MD/PDF/TXT)</span>
            </button>
          </div>
        </div>

        {/* Notes Feed */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3 flex-1">
          {filteredNotes.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <div className="text-3xl">📝</div>
              <div className="font-black text-sm text-slate-600 dark:text-slate-300">
                {filterMode === 'current' ? `第 ${currentPageNumber} 頁尚無專屬筆記` : '目前還沒有閱讀筆記'}
              </div>
              <p className="text-xs text-slate-400">
                使用上方輸入框，隨時記錄繪本裡的精彩亮點與心得！
              </p>
            </div>
          ) : (
            filteredNotes.map((note) => (
              <div
                key={note.id}
                className="p-3.5 rounded-2xl bg-amber-50/50 dark:bg-slate-800/60 border border-amber-200 dark:border-slate-700 flex items-start justify-between gap-3 group transition-all hover:shadow-sm"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-base">{note.emotionEmoji}</span>
                    <span className="px-2 py-0.5 rounded-lg bg-amber-200/80 dark:bg-slate-700 text-amber-950 dark:text-amber-300 text-[10px] font-black">
                      {note.tag}
                    </span>
                    <button
                      type="button"
                      onClick={() => onJumpToPage && onJumpToPage(note.pageNumber)}
                      className="px-2 py-0.5 rounded-lg bg-orange-100 dark:bg-slate-900 text-orange-700 dark:text-orange-300 text-[10px] font-black hover:underline cursor-pointer"
                      title="點擊直接跳轉至該頁"
                    >
                      第 {note.pageNumber} 頁 ↗
                    </button>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {note.createdAt}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-100 leading-relaxed whitespace-pre-wrap">
                    {note.content}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteNote(note.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-700 transition-colors cursor-pointer shrink-0"
                  title="刪除此筆記"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Reading Notes Export Hub Modal */}
      {isExportModalOpen && (
        <ReadingNotesExportModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          books={[book]}
          activeBook={book}
        />
      )}
    </div>
  );
};
