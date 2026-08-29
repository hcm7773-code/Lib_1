import React, { useState, useEffect } from 'react';
import {
  Bookmark,
  Tag,
  Plus,
  Trash2,
  Check,
  X,
  Sparkles,
  Heart,
  Palette,
  Smile,
  ShieldCheck,
  BookOpen,
  Filter
} from 'lucide-react';
import { Book, FavoriteTagItem } from '../types';
import {
  getAllFavoriteTags,
  saveCustomTag,
  deleteCustomTag,
  getBookTagIds,
  setBookTagIds,
  toggleBookTag,
  PRESET_FAVORITE_TAGS
} from '../utils/favoriteTags';
import { playStarChime, playPageTurnSound } from '../utils/audio';

interface BookTagManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  book?: Book | null;
  onTagsUpdated?: () => void;
}

const COLOR_OPTIONS = [
  { id: 'rose', name: '玫瑰粉', bg: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/70 dark:text-rose-200 dark:border-rose-700', badge: 'bg-rose-500 text-white' },
  { id: 'amber', name: '暖心橙', bg: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/70 dark:text-amber-200 dark:border-amber-700', badge: 'bg-amber-500 text-white' },
  { id: 'indigo', name: '夜空藍', bg: 'bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-950/70 dark:text-indigo-200 dark:border-indigo-700', badge: 'bg-indigo-600 text-white' },
  { id: 'teal', name: '探索青', bg: 'bg-teal-100 text-teal-800 border-teal-300 dark:bg-teal-950/70 dark:text-teal-200 dark:border-teal-700', badge: 'bg-teal-600 text-white' },
  { id: 'emerald', name: '森林綠', bg: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-200 dark:border-emerald-700', badge: 'bg-emerald-600 text-white' },
  { id: 'cyan', name: '微風青', bg: 'bg-cyan-100 text-cyan-800 border-cyan-300 dark:bg-cyan-950/70 dark:text-cyan-200 dark:border-cyan-700', badge: 'bg-cyan-600 text-white' },
  { id: 'purple', name: '魔法紫', bg: 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950/70 dark:text-purple-200 dark:border-purple-700', badge: 'bg-purple-600 text-white' },
  { id: 'pink', name: '糖果粉', bg: 'bg-pink-100 text-pink-800 border-pink-300 dark:bg-pink-950/70 dark:text-pink-200 dark:border-pink-700', badge: 'bg-pink-500 text-white' },
];

const EMOJI_OPTIONS = ['💖', '🌙', '🦁', '🧠', '🦊', '🗣️', '🎨', '👨‍👩‍👧', '🌟', '🚀', '🌈', '🐾', '🏆', '💎', '📖'];

export const BookTagManagerModal: React.FC<BookTagManagerModalProps> = ({
  isOpen,
  onClose,
  book,
  onTagsUpdated,
}) => {
  const [allTags, setAllTags] = useState<FavoriteTagItem[]>(() => getAllFavoriteTags());
  const [assignedTagIds, setAssignedTagIds] = useState<string[]>([]);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagIcon, setNewTagIcon] = useState('🌟');
  const [newTagDesc, setNewTagDesc] = useState('');
  const [selectedColorIdx, setSelectedColorIdx] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setAllTags(getAllFavoriteTags());
      if (book) {
        setAssignedTagIds(getBookTagIds(book.id));
      }
    }
  }, [isOpen, book]);

  if (!isOpen) return null;

  const handleToggleTag = (tagId: string) => {
    if (!book) return;
    playPageTurnSound();
    const updated = toggleBookTag(book.id, tagId);
    setAssignedTagIds(updated);
    if (onTagsUpdated) onTagsUpdated();
  };

  const handleCreateTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;

    playStarChime();
    const selectedCol = COLOR_OPTIONS[selectedColorIdx];
    const newTag: FavoriteTagItem = {
      id: `tag-custom-${Date.now()}`,
      name: newTagName.trim(),
      icon: newTagIcon,
      color: selectedCol.bg,
      badgeColor: selectedCol.badge,
      description: newTagDesc.trim() || '自訂繪本收藏標籤',
      isPreset: false,
      createdAt: new Date().toISOString(),
    };

    const updatedTags = saveCustomTag(newTag);
    setAllTags(updatedTags);

    // If book is open, auto-assign the new tag to it
    if (book) {
      const updatedAssigned = [...assignedTagIds, newTag.id];
      setBookTagIds(book.id, updatedAssigned);
      setAssignedTagIds(updatedAssigned);
    }

    setNewTagName('');
    setNewTagDesc('');
    setIsCreatingNew(false);
    if (onTagsUpdated) onTagsUpdated();
  };

  const handleDeleteTag = (tagId: string) => {
    playPageTurnSound();
    const updatedTags = deleteCustomTag(tagId);
    setAllTags(updatedTags);
    if (book) {
      setAssignedTagIds((prev) => prev.filter((id) => id !== tagId));
    }
    if (onTagsUpdated) onTagsUpdated();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn select-none" id="book-tag-manager-modal">
      <div className="w-full max-w-lg rounded-3xl bg-slate-900 border-2 border-amber-400/60 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-purple-500/20 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-400 text-slate-950 shadow-md">
              <Tag className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-amber-200">
                {book ? `為《${typeof book.title === 'string' ? book.title : (book.title['zh-TW'] || book.title.en)}》設定標籤` : '繪本收藏夾標籤管理庫'}
              </h3>
              <p className="text-xs text-slate-400">
                {book ? '點擊標籤即可快速加入或移除收藏分類' : '自訂專屬分類標籤，隨時快速過濾喜愛的繪本'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-5 flex-1 custom-scrollbar">
          
          {/* Tag List */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs font-black text-slate-400">
              <span>現有標籤分類 ({allTags.length})</span>
              {!isCreatingNew && (
                <button
                  onClick={() => setIsCreatingNew(true)}
                  className="text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>建立新標籤</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {allTags.map((tag) => {
                const isAssigned = assignedTagIds.includes(tag.id);
                return (
                  <div
                    key={tag.id}
                    onClick={() => book && handleToggleTag(tag.id)}
                    className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-2 ${
                      book ? 'cursor-pointer hover:scale-102' : ''
                    } ${
                      isAssigned
                        ? 'bg-amber-500/20 border-amber-400 text-amber-200 ring-2 ring-amber-400/40 shadow-md'
                        : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-xl shrink-0">{tag.icon}</span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-black text-xs sm:text-sm truncate">
                            {tag.name}
                          </span>
                          {tag.isPreset && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-slate-800 text-slate-400">
                              預設
                            </span>
                          )}
                        </div>
                        {tag.description && (
                          <p className="text-[10px] text-slate-400 truncate max-w-[150px]">
                            {tag.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {book && (
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                            isAssigned
                              ? 'bg-amber-400 border-amber-300 text-slate-950'
                              : 'border-slate-600 bg-slate-900'
                          }`}
                        >
                          {isAssigned && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      )}

                      {!tag.isPreset && !book && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTag(tag.id);
                          }}
                          className="p-1 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-950/50 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Create New Tag Form */}
          {isCreatingNew && (
            <form
              onSubmit={handleCreateTag}
              className="p-4 rounded-2xl bg-slate-950 border border-amber-400/40 space-y-3 animate-fadeIn"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>建立自訂繪本標籤</span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsCreatingNew(false)}
                  className="text-slate-400 hover:text-white text-xs cursor-pointer"
                >
                  取消
                </button>
              </div>

              {/* Emoji Selector */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400">選擇標籤圖示：</label>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
                  {EMOJI_OPTIONS.map((emo) => (
                    <button
                      key={emo}
                      type="button"
                      onClick={() => setNewTagIcon(emo)}
                      className={`text-lg p-1.5 rounded-xl border transition-transform ${
                        newTagIcon === emo
                          ? 'bg-amber-500/30 border-amber-400 scale-110'
                          : 'bg-slate-900 border-slate-800 hover:scale-105'
                      }`}
                    >
                      {emo}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tag Name & Desc */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[10px] font-bold text-slate-400">標籤名稱 *</label>
                  <input
                    type="text"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    placeholder="例如：百讀不厭、睡前晚安..."
                    maxLength={10}
                    required
                    className="w-full px-3 py-1.5 mt-0.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-amber-400 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400">標籤簡述 (選填)</label>
                  <input
                    type="text"
                    value={newTagDesc}
                    onChange={(e) => setNewTagDesc(e.target.value)}
                    placeholder="簡短描述這類繪本特點..."
                    maxLength={20}
                    className="w-full px-3 py-1.5 mt-0.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-amber-400 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Color Theme Selector */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400">色彩風格：</label>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {COLOR_OPTIONS.map((col, idx) => (
                    <button
                      key={col.id}
                      type="button"
                      onClick={() => setSelectedColorIdx(idx)}
                      className={`px-2.5 py-1 rounded-xl text-[10px] font-black border transition-all ${
                        selectedColorIdx === idx
                          ? 'ring-2 ring-amber-400 scale-105 border-white shadow-xs'
                          : 'opacity-70 hover:opacity-100'
                      } ${col.bg}`}
                    >
                      {col.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={!newTagName.trim()}
                  className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-xs shadow-md hover:scale-105 transition-transform disabled:opacity-50 cursor-pointer"
                >
                  確認建立標籤
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm shadow-md transition-transform hover:scale-105 cursor-pointer"
          >
            完成設定
          </button>
        </div>
      </div>
    </div>
  );
};
