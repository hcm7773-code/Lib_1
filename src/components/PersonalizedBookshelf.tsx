import React, { useState, useMemo } from 'react';
import { Book, CustomShelf, BookshelfTheme, LanguageCode } from '../types';
import {
  FolderPlus,
  BookOpen,
  Sparkles,
  Heart,
  Palette,
  Plus,
  Trash2,
  MoveRight,
  HardDriveDownload,
  Star,
  Layers,
  Edit2,
  Check,
  X,
  Play,
  Search,
  SlidersHorizontal,
  CheckSquare,
  Square,
  Dices,
  BookMarked,
  Tag,
  Grid,
  Library,
  Award,
  Clock,
  Sparkle
} from 'lucide-react';
import { playStarChime, playPageTurnSound } from '../utils/audio';

interface PersonalizedBookshelfProps {
  books: Book[];
  customShelves: CustomShelf[];
  onUpdateShelves: (shelves: CustomShelf[]) => void;
  favoriteBookIds: string[];
  downloadedBookIds: string[];
  primaryLang: LanguageCode;
  onSelectBook: (book: Book) => void;
  darkMode?: boolean;
}

const CATEGORY_TAG_OPTIONS = [
  { id: 'all', label: '全部', color: 'bg-amber-100 text-amber-900 border-amber-300' },
  { id: 'hero-adventure', label: '🛡️ 英雄冒險', color: 'bg-orange-100 text-orange-900 border-orange-300' },
  { id: 'fables-wisdom', label: '🦊 寓言哲理', color: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
  { id: 'ai-creations', label: '🎨 AI 原創', color: 'bg-purple-100 text-purple-900 border-purple-300' },
  { id: 'bedtime-cozy', label: '🌙 睡前晚安', color: 'bg-indigo-100 text-indigo-900 border-indigo-300' },
  { id: 'science-nature', label: '🌿 自然科普', color: 'bg-teal-100 text-teal-900 border-teal-300' },
  { id: 'custom', label: '✨ 自訂分類', color: 'bg-pink-100 text-pink-900 border-pink-300' },
];

const SHELF_THEME_COLORS = [
  { id: 'amber', label: '暖陽琥珀', bg: 'bg-amber-500', border: 'border-amber-400', badge: 'bg-amber-100 text-amber-900' },
  { id: 'orange', label: '活力暖橘', bg: 'bg-orange-500', border: 'border-orange-400', badge: 'bg-orange-100 text-orange-900' },
  { id: 'emerald', label: '森林翠綠', bg: 'bg-emerald-600', border: 'border-emerald-400', badge: 'bg-emerald-100 text-emerald-900' },
  { id: 'indigo', label: '星空蔚藍', bg: 'bg-indigo-600', border: 'border-indigo-400', badge: 'bg-indigo-100 text-indigo-900' },
  { id: 'rose', label: '櫻粉甜心', bg: 'bg-rose-500', border: 'border-rose-400', badge: 'bg-rose-100 text-rose-900' },
  { id: 'purple', label: '夢幻紫藤', bg: 'bg-purple-600', border: 'border-purple-400', badge: 'bg-purple-100 text-purple-900' },
];

const AVAILABLE_ICONS = ['📚', '🛡️', '🦊', '🧭', '🌙', '🚀', '❤️', '🌟', '🦄', '🎨', '🌿', '🏰', '🧩', '🦕', '👑', '🌊', '🐱', '🦉'];

export const PersonalizedBookshelf: React.FC<PersonalizedBookshelfProps> = ({
  books,
  customShelves,
  onUpdateShelves,
  favoriteBookIds,
  downloadedBookIds,
  primaryLang,
  onSelectBook,
  darkMode = false,
}) => {
  const [activeShelfId, setActiveShelfId] = useState<string>('all');
  const [bookshelfTheme, setBookshelfTheme] = useState<BookshelfTheme>('wood');
  const [viewLayoutMode, setViewLayoutMode] = useState<'3d_shelf' | 'card_grid'>('3d_shelf');
  
  // Search & Filter & Sort state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTagFilter, setSelectedTagFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'default' | 'rating' | 'title' | 'pages' | 'age'>('default');

  // Add & Edit Shelf Form Modal
  const [isAddingShelf, setIsAddingShelf] = useState(false);
  const [editingShelfId, setEditingShelfId] = useState<string | null>(null);
  const [shelfFormName, setShelfFormName] = useState('');
  const [shelfFormIcon, setShelfFormIcon] = useState('📚');
  const [shelfFormDesc, setShelfFormDesc] = useState('');
  const [shelfFormColor, setShelfFormColor] = useState('amber');
  const [shelfFormTag, setShelfFormTag] = useState('custom');

  // Batch Categorization Modal
  const [isBatchCategorizing, setIsBatchCategorizing] = useState(false);
  const [batchSelectedBookIds, setBatchSelectedBookIds] = useState<string[]>([]);
  const [managingBookId, setManagingBookId] = useState<string | null>(null);

  // Surprise Pick Modal
  const [surpriseBook, setSurpriseBook] = useState<Book | null>(null);

  // Built-in Smart Presets (automatically populated by logic)
  const defaultSmartPresets: CustomShelf[] = useMemo(() => {
    const heroAdventureIds = books
      .filter((b) => b.category === 'Adventure' || b.tags?.some((t) => t.includes('冒險') || t.includes('勇氣') || t.includes('英雄')))
      .map((b) => b.id);

    const fablesWisdomIds = books
      .filter((b) => b.category === 'Fairy Tale' || b.moralLesson || b.tags?.some((t) => t.includes('寓言') || t.includes('品格') || t.includes('智慧')))
      .map((b) => b.id);

    const aiOriginalIds = books
      .filter((b) => (b as any).isCustom || b.id.startsWith('custom_') || b.author.includes('AI') || b.id.includes('custom'))
      .map((b) => b.id);

    const natureScienceIds = books
      .filter((b) => b.category === 'Nature & Science' || b.tags?.some((t) => t.includes('自然') || t.includes('科普') || t.includes('太空') || t.includes('海洋')))
      .map((b) => b.id);

    const bedtimeIds = books
      .filter((b) => b.tags?.some((t) => t.includes('睡前') || t.includes('晚安') || t.includes('溫馨')) || b.category === 'Friendship & Love')
      .map((b) => b.id);

    return [
      {
        id: 'fav',
        name: '我最愛的繪本',
        icon: '❤️',
        bookIds: favoriteBookIds,
        isDefault: true,
        description: '收藏小朋友最愛反覆閱讀的珍藏故事',
        themeColor: 'rose',
        categoryTag: 'custom',
      },
      {
        id: 'offline',
        name: 'PWA 離線繪本庫',
        icon: '📥',
        bookIds: downloadedBookIds,
        isDefault: true,
        description: '已下載至瀏覽器快取，無網路時亦可流暢閱讀',
        themeColor: 'emerald',
        categoryTag: 'custom',
      },
      {
        id: 'hero-quest',
        name: '英雄之旅與冒險探索',
        icon: '🛡️',
        bookIds: heroAdventureIds.length > 0 ? heroAdventureIds : books.slice(0, 4).map((b) => b.id),
        isDefault: true,
        description: '包含出發啟程、考驗試煉與成長榮耀的冒險繪本',
        themeColor: 'orange',
        categoryTag: 'hero-adventure',
      },
      {
        id: 'fables-morals',
        name: '寓言哲理與品格涵養',
        icon: '🦊',
        bookIds: fablesWisdomIds.length > 0 ? fablesWisdomIds : books.slice(1, 5).map((b) => b.id),
        isDefault: true,
        description: '培養同理心、誠實、勇氣與友誼的正向故事',
        themeColor: 'amber',
        categoryTag: 'fables-wisdom',
      },
      {
        id: 'ai-studio',
        name: 'AI 創作工坊原創架',
        icon: '🎨',
        bookIds: aiOriginalIds.length > 0 ? aiOriginalIds : books.filter((b) => b.id.startsWith('custom')).map((b) => b.id),
        isDefault: true,
        description: '孩子親手透過 AI 創作者工坊產生的獨家故事',
        themeColor: 'purple',
        categoryTag: 'ai-creations',
      },
      {
        id: 'bedtime-cozy',
        name: '睡前溫馨陪伴架',
        icon: '🌙',
        bookIds: bedtimeIds.length > 0 ? bedtimeIds : books.slice(0, 3).map((b) => b.id),
        isDefault: true,
        description: '柔和旋律與溫暖情節，陪伴孩子安穩入夢',
        themeColor: 'indigo',
        categoryTag: 'bedtime-cozy',
      },
      {
        id: 'nature-science',
        name: '自然生態與百科探索',
        icon: '🌿',
        bookIds: natureScienceIds.length > 0 ? natureScienceIds : books.slice(2, 5).map((b) => b.id),
        isDefault: true,
        description: '探索宇宙、恐龍、動植物與神奇大自然奧秘',
        themeColor: 'emerald',
        categoryTag: 'science-nature',
      },
    ];
  }, [books, favoriteBookIds, downloadedBookIds]);

  const allShelves = customShelves.length > 0 ? customShelves : defaultSmartPresets;

  // Shelf CRUD Operations
  const handleOpenAddShelf = () => {
    setEditingShelfId(null);
    setShelfFormName('');
    setShelfFormIcon('📚');
    setShelfFormDesc('');
    setShelfFormColor('amber');
    setShelfFormTag('custom');
    setIsAddingShelf(true);
  };

  const handleOpenEditShelf = (shelf: CustomShelf) => {
    setEditingShelfId(shelf.id);
    setShelfFormName(shelf.name);
    setShelfFormIcon(shelf.icon);
    setShelfFormDesc(shelf.description || '');
    setShelfFormColor(shelf.themeColor || 'amber');
    setShelfFormTag(shelf.categoryTag || 'custom');
    setIsAddingShelf(true);
  };

  const handleSaveShelf = () => {
    if (!shelfFormName.trim()) return;

    if (editingShelfId) {
      // Edit existing shelf
      const updated = allShelves.map((s) => {
        if (s.id === editingShelfId) {
          return {
            ...s,
            name: shelfFormName.trim(),
            icon: shelfFormIcon,
            description: shelfFormDesc.trim(),
            themeColor: shelfFormColor,
            categoryTag: shelfFormTag,
          };
        }
        return s;
      });
      onUpdateShelves(updated);
    } else {
      // Create new shelf
      const newShelf: CustomShelf = {
        id: `shelf_${Date.now()}`,
        name: shelfFormName.trim(),
        icon: shelfFormIcon,
        description: shelfFormDesc.trim(),
        themeColor: shelfFormColor,
        categoryTag: shelfFormTag,
        bookIds: [],
        createdAt: new Date().toISOString(),
      };
      onUpdateShelves([...allShelves, newShelf]);
      setActiveShelfId(newShelf.id);
    }

    playStarChime();
    setIsAddingShelf(false);
    setEditingShelfId(null);
  };

  const handleDeleteShelf = (shelfId: string) => {
    const updated = allShelves.filter((s) => s.id !== shelfId);
    onUpdateShelves(updated);
    if (activeShelfId === shelfId) setActiveShelfId('all');
    playPageTurnSound();
  };

  const handleToggleBookInShelf = (shelfId: string, bookId: string) => {
    const updated = allShelves.map((s) => {
      if (s.id === shelfId) {
        const exists = s.bookIds.includes(bookId);
        return {
          ...s,
          bookIds: exists ? s.bookIds.filter((id) => id !== bookId) : [...s.bookIds, bookId],
        };
      }
      return s;
    });
    onUpdateShelves(updated);
  };

  // Batch toggle books in active shelf
  const handleBatchApplyToShelf = (targetShelfId: string) => {
    if (batchSelectedBookIds.length === 0) return;
    const updated = allShelves.map((s) => {
      if (s.id === targetShelfId) {
        const set = new Set([...s.bookIds, ...batchSelectedBookIds]);
        return { ...s, bookIds: Array.from(set) };
      }
      return s;
    });
    onUpdateShelves(updated);
    playStarChime();
    setIsBatchCategorizing(false);
    setBatchSelectedBookIds([]);
  };

  const handleBatchRemoveFromShelf = (targetShelfId: string) => {
    if (batchSelectedBookIds.length === 0) return;
    const updated = allShelves.map((s) => {
      if (s.id === targetShelfId) {
        return {
          ...s,
          bookIds: s.bookIds.filter((id) => !batchSelectedBookIds.includes(id)),
        };
      }
      return s;
    });
    onUpdateShelves(updated);
    playStarChime();
    setIsBatchCategorizing(false);
    setBatchSelectedBookIds([]);
  };

  // Random pick from active shelf
  const handleSurprisePick = () => {
    if (displayedBooks.length === 0) return;
    playStarChime();
    const randomIndex = Math.floor(Math.random() * displayedBooks.length);
    setSurpriseBook(displayedBooks[randomIndex]);
  };

  // Filter & Search Books
  const currentShelf = allShelves.find((s) => s.id === activeShelfId);
  
  const rawShelfBooks = useMemo(() => {
    if (activeShelfId === 'all') return books;
    if (currentShelf) {
      return books.filter((b) => currentShelf.bookIds.includes(b.id));
    }
    return books;
  }, [books, activeShelfId, currentShelf]);

  const displayedBooks = useMemo(() => {
    let result = rawShelfBooks.filter((book) => {
      const titleZh = book.title['zh-TW'] || '';
      const titleEn = book.title['en'] || '';
      const titleJa = book.title['ja'] || '';
      const author = book.author || '';
      const query = searchQuery.toLowerCase().trim();

      const matchesSearch =
        !query ||
        titleZh.toLowerCase().includes(query) ||
        titleEn.toLowerCase().includes(query) ||
        titleJa.toLowerCase().includes(query) ||
        author.toLowerCase().includes(query) ||
        (book.summary && (book.summary['zh-TW']?.toLowerCase().includes(query) || book.summary['en']?.toLowerCase().includes(query)));

      const matchesTag =
        selectedTagFilter === 'all' ||
        (selectedTagFilter === 'hero-adventure' && (book.category === 'Adventure' || book.tags?.some((t) => t.includes('冒險') || t.includes('英雄')))) ||
        (selectedTagFilter === 'fables-wisdom' && (book.category === 'Fairy Tale' || book.moralLesson || book.tags?.some((t) => t.includes('寓言') || t.includes('智慧')))) ||
        (selectedTagFilter === 'ai-creations' && (book.id.startsWith('custom') || book.author.includes('AI'))) ||
        (selectedTagFilter === 'bedtime-cozy' && (book.tags?.some((t) => t.includes('睡前') || t.includes('晚安')) || book.category === 'Friendship & Love')) ||
        (selectedTagFilter === 'science-nature' && (book.category === 'Nature & Science' || book.tags?.some((t) => t.includes('自然') || t.includes('科普'))));

      return matchesSearch && matchesTag;
    });

    // Sorting
    if (sortBy === 'rating') {
      result.sort((a, b) => (b.rating || 5) - (a.rating || 5));
    } else if (sortBy === 'title') {
      result.sort((a, b) => {
        const titleA = a.title[primaryLang] || a.title['zh-TW'] || '';
        const titleB = b.title[primaryLang] || b.title['zh-TW'] || '';
        return titleA.localeCompare(titleB, 'zh-Hant');
      });
    } else if (sortBy === 'pages') {
      result.sort((a, b) => b.pages.length - a.pages.length);
    } else if (sortBy === 'age') {
      result.sort((a, b) => (a.ageGroup || '6-8').localeCompare(b.ageGroup || '6-8'));
    }

    return result;
  }, [rawShelfBooks, searchQuery, selectedTagFilter, sortBy, primaryLang]);

  // Theme Visuals
  const getThemeStyle = () => {
    switch (bookshelfTheme) {
      case 'wood':
        return {
          container: 'bg-amber-950/95 text-amber-50 border-amber-800 shadow-2xl',
          shelfRow: 'border-b-8 border-amber-800 bg-amber-900/60 shadow-lg',
          shelfLabel: 'text-amber-200 bg-amber-900/80 border-amber-700',
        };
      case 'starry':
        return {
          container: 'bg-slate-950 text-indigo-100 border-indigo-900 shadow-2xl',
          shelfRow: 'border-b-8 border-indigo-700/80 bg-indigo-950/60 shadow-indigo-900/50 shadow-lg',
          shelfLabel: 'text-indigo-200 bg-indigo-900/80 border-indigo-700',
        };
      case 'macaron':
        return {
          container: 'bg-gradient-to-br from-pink-100 via-purple-100 to-amber-100 text-purple-950 border-purple-200 shadow-xl',
          shelfRow: 'border-b-8 border-pink-300 bg-white/70 shadow-sm',
          shelfLabel: 'text-purple-900 bg-pink-200/90 border-pink-300',
        };
      case 'forest':
        return {
          container: 'bg-emerald-950 text-emerald-100 border-emerald-800 shadow-2xl',
          shelfRow: 'border-b-8 border-emerald-800 bg-emerald-900/70 shadow-lg',
          shelfLabel: 'text-emerald-200 bg-emerald-900/80 border-emerald-700',
        };
    }
  };

  const themeStyle = getThemeStyle();

  return (
    <div className="space-y-8" id="personalized-bookshelf-root">
      
      {/* 🌟 Header Banner & Theme Selector */}
      <div className={`p-6 sm:p-7 rounded-3xl border transition-all ${
        darkMode ? 'bg-slate-900/95 border-slate-700 text-slate-100' : 'bg-gradient-to-r from-amber-50 via-orange-50 to-amber-100/70 border-amber-200 shadow-sm text-amber-950'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-orange-500 via-amber-500 to-amber-600 text-white shadow-md">
              <Library className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight">個人化書架多維分類中心</h2>
                <span className="bg-orange-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-xs">
                  智慧分類
                </span>
              </div>
              <p className={`text-xs font-bold mt-0.5 ${darkMode ? 'text-slate-400' : 'text-amber-800/80'}`}>
                依據『英雄之旅』、『寓言品格』、『AI原創』等架構分類珍藏繪本，打造孩子專屬的夢幻書房！
              </p>
            </div>
          </div>

          {/* Quick Actions Toolbar */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Surprise Random Pick Button */}
            <button
              onClick={handleSurprisePick}
              className="px-3.5 py-2 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md transition-transform hover:scale-105 cursor-pointer"
              title="不知道讀什麼？隨機挑選一本伴讀！"
            >
              <Dices className="w-4 h-4 text-amber-300 animate-spin" />
              <span>🎲 隨機選書伴讀</span>
            </button>

            {/* Batch Categorizer Button */}
            <button
              onClick={() => setIsBatchCategorizing(true)}
              className="px-3.5 py-2 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md transition-transform hover:scale-105 cursor-pointer"
            >
              <CheckSquare className="w-4 h-4" />
              <span>🏷️ 批次分類整理</span>
            </button>

            {/* Layout Mode Toggle */}
            <div className="flex items-center gap-1 bg-amber-200/60 dark:bg-slate-800 p-1 rounded-2xl border border-amber-300 dark:border-slate-700">
              <button
                onClick={() => setViewLayoutMode('3d_shelf')}
                className={`p-1.5 rounded-xl transition-all ${
                  viewLayoutMode === '3d_shelf' ? 'bg-orange-500 text-white shadow-xs' : 'text-amber-900 dark:text-slate-300 hover:bg-amber-100'
                }`}
                title="3D 立體展架視圖"
              >
                <Layers className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewLayoutMode('card_grid')}
                className={`p-1.5 rounded-xl transition-all ${
                  viewLayoutMode === 'card_grid' ? 'bg-orange-500 text-white shadow-xs' : 'text-amber-900 dark:text-slate-300 hover:bg-amber-100'
                }`}
                title="精選詳細卡片視圖"
              >
                <Grid className="w-4 h-4" />
              </button>
            </div>

            {/* Theme Switcher Pills */}
            <div className="flex items-center gap-1 bg-white dark:bg-slate-800 p-1 rounded-2xl border border-amber-200 dark:border-slate-700">
              {[
                { id: 'wood' as BookshelfTheme, name: '🪵 木紋' },
                { id: 'starry' as BookshelfTheme, name: '🌌 星空' },
                { id: 'macaron' as BookshelfTheme, name: '🎨 馬卡龍' },
                { id: 'forest' as BookshelfTheme, name: '🌿 森林' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setBookshelfTheme(t.id)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-black transition-all ${
                    bookshelfTheme === t.id
                      ? 'bg-orange-500 text-white shadow-xs'
                      : darkMode
                      ? 'text-slate-300 hover:bg-slate-700'
                      : 'text-amber-900 hover:bg-amber-100'
                  }`}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 🏷️ Shelf Tabs & Category Filters */}
      <div className="space-y-3">
        {/* Horizontal Shelf Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => {
              setActiveShelfId('all');
              playPageTurnSound();
            }}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black whitespace-nowrap transition-all border flex items-center gap-1.5 ${
              activeShelfId === 'all'
                ? 'bg-amber-600 text-white border-amber-700 shadow-md scale-105 ring-2 ring-orange-300'
                : darkMode
                ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                : 'bg-white border-amber-200 text-amber-950 hover:bg-amber-100'
            }`}
          >
            <span>📖 全部繪本</span>
            <span className="text-[10px] bg-black/20 text-white px-2 py-0.5 rounded-full font-bold">
              {books.length}
            </span>
          </button>

          {allShelves.map((shelf) => {
            const isSelected = activeShelfId === shelf.id;
            return (
              <div key={shelf.id} className="flex items-center group relative shrink-0">
                <button
                  onClick={() => {
                    setActiveShelfId(shelf.id);
                    playPageTurnSound();
                  }}
                  className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black whitespace-nowrap transition-all border flex items-center gap-2 ${
                    isSelected
                      ? 'bg-gradient-to-r from-amber-600 to-orange-500 text-white border-amber-700 shadow-md scale-105 ring-2 ring-orange-300'
                      : darkMode
                      ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                      : 'bg-white border-amber-200 text-amber-950 hover:bg-amber-100'
                  }`}
                >
                  <span className="text-base">{shelf.icon}</span>
                  <span>{shelf.name}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    isSelected ? 'bg-white/25 text-white' : 'bg-amber-100 dark:bg-slate-700 text-amber-900 dark:text-slate-300'
                  }`}>
                    {shelf.bookIds.length}
                  </span>
                </button>

                {/* Edit & Delete Actions */}
                <div className="flex items-center gap-0.5 ml-1 opacity-70 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleOpenEditShelf(shelf)}
                    className="p-1 rounded-full text-amber-600 hover:bg-amber-100 dark:text-amber-400"
                    title="編輯此書架設定"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  {!shelf.isDefault && (
                    <button
                      onClick={() => handleDeleteShelf(shelf.id)}
                      className="p-1 rounded-full text-rose-500 hover:bg-rose-100"
                      title="刪除此自訂書架"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          <button
            onClick={handleOpenAddShelf}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs sm:text-sm shadow-md transition-transform hover:scale-105 shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>➕ 新增分類書架</span>
          </button>
        </div>

        {/* Active Shelf Metadata & Search Bar */}
        <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-3 ${
          darkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-white/90 border-amber-200'
        }`}>
          {/* Active Shelf Info */}
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">{currentShelf ? currentShelf.icon : '📚'}</span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm text-amber-950 dark:text-slate-100">
                  {currentShelf ? currentShelf.name : '全館典藏繪本展架'}
                </h3>
                <span className="text-xs font-bold text-amber-800/70 dark:text-slate-400">
                  (陳列 {displayedBooks.length} 本)
                </span>
              </div>
              {currentShelf?.description && (
                <p className="text-xs text-amber-800/80 dark:text-slate-400 font-medium">
                  {currentShelf.description}
                </p>
              )}
            </div>
          </div>

          {/* Search & Sort Controls */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-56">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-amber-600 dark:text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜尋此書架繪本..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50/50 dark:bg-slate-900 border border-amber-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50/50 dark:bg-slate-900 border border-amber-200 dark:border-slate-700 text-amber-950 dark:text-slate-200 focus:outline-hidden"
            >
              <option value="default">預設排序</option>
              <option value="rating">⭐ 評分最高</option>
              <option value="title">🔤 標題字母</option>
              <option value="pages">📄 頁數長度</option>
              <option value="age">👶 建議年齡</option>
            </select>
          </div>
        </div>
      </div>

      {/* ➕ Add / Edit Shelf Modal Form */}
      {isAddingShelf && (
        <div className="p-6 rounded-3xl bg-amber-100/95 dark:bg-slate-800/95 border-2 border-amber-400 dark:border-slate-600 space-y-4 animate-fadeIn shadow-xl">
          <div className="flex items-center justify-between border-b border-amber-200 dark:border-slate-700 pb-3">
            <span className="text-sm font-black text-amber-950 dark:text-slate-100 flex items-center gap-2">
              <FolderPlus className="w-5 h-5 text-orange-600" />
              <span>{editingShelfId ? '✏️ 編輯自訂書架分類' : '➕ 建立孩子的自訂主題書架'}</span>
            </span>
            <button
              onClick={() => setIsAddingShelf(false)}
              className="p-1 rounded-full text-amber-800 dark:text-slate-400 hover:bg-amber-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Shelf Name & Tag */}
            <div className="space-y-2">
              <label className="block text-xs font-extrabold text-amber-950 dark:text-slate-200">
                書架名稱 <span className="text-orange-600">*</span>
              </label>
              <input
                type="text"
                placeholder="例如：假日探險精選、晚安故事、英文閱讀"
                value={shelfFormName}
                onChange={(e) => setShelfFormName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-amber-300 dark:border-slate-700 text-xs sm:text-sm font-bold focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
              />
            </div>

            {/* Shelf Category Tag */}
            <div className="space-y-2">
              <label className="block text-xs font-extrabold text-amber-950 dark:text-slate-200">
                主題類別標籤
              </label>
              <select
                value={shelfFormTag}
                onChange={(e) => setShelfFormTag(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-amber-300 dark:border-slate-700 text-xs font-bold focus:outline-hidden"
              >
                {CATEGORY_TAG_OPTIONS.map((tag) => (
                  <option key={tag.id} value={tag.id}>{tag.label}</option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div className="space-y-2 md:col-span-2">
              <label className="block text-xs font-extrabold text-amber-950 dark:text-slate-200">
                書架簡介或備註
              </label>
              <input
                type="text"
                placeholder="例如：專門收集充滿勇氣與探索精神的精采冒險繪本"
                value={shelfFormDesc}
                onChange={(e) => setShelfFormDesc(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-amber-300 dark:border-slate-700 text-xs font-bold focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
              />
            </div>

            {/* Icon Picker */}
            <div className="space-y-2 md:col-span-2">
              <label className="block text-xs font-extrabold text-amber-950 dark:text-slate-200">
                書架代表圖示
              </label>
              <div className="flex flex-wrap gap-1.5 bg-white dark:bg-slate-900 p-2.5 rounded-2xl border border-amber-200 dark:border-slate-700">
                {AVAILABLE_ICONS.map((ic) => (
                  <button
                    key={ic}
                    type="button"
                    onClick={() => setShelfFormIcon(ic)}
                    className={`p-2 text-lg rounded-xl transition-all cursor-pointer ${
                      shelfFormIcon === ic ? 'bg-orange-500 text-white scale-110 shadow-sm' : 'hover:bg-amber-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {ic}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Accent */}
            <div className="space-y-2 md:col-span-2">
              <label className="block text-xs font-extrabold text-amber-950 dark:text-slate-200">
                書架標籤色彩風格
              </label>
              <div className="flex flex-wrap gap-2">
                {SHELF_THEME_COLORS.map((col) => (
                  <button
                    key={col.id}
                    type="button"
                    onClick={() => setShelfFormColor(col.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 border transition-all ${
                      shelfFormColor === col.id ? `${col.bg} text-white ${col.border} scale-105 shadow-xs` : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-amber-200'
                    }`}
                  >
                    <span className={`w-2.5 h-2.5 rounded-full ${col.bg}`} />
                    <span>{col.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-amber-200 dark:border-slate-700">
            <button
              onClick={() => setIsAddingShelf(false)}
              className="px-4 py-2 rounded-2xl bg-white dark:bg-slate-700 text-amber-950 dark:text-slate-200 font-bold text-xs"
            >
              取消
            </button>
            <button
              onClick={handleSaveShelf}
              className="px-6 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm shadow-md"
            >
              {editingShelfId ? '儲存變更' : '確定建立書架'}
            </button>
          </div>
        </div>
      )}

      {/* 🏷️ Batch Categorization Modal */}
      {isBatchCategorizing && (
        <div className="p-6 rounded-3xl bg-amber-100/95 dark:bg-slate-800/95 border-2 border-amber-400 dark:border-slate-600 space-y-4 animate-fadeIn shadow-xl">
          <div className="flex items-center justify-between border-b border-amber-200 dark:border-slate-700 pb-3">
            <div>
              <h3 className="text-base font-black text-amber-950 dark:text-slate-100 flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-orange-600" />
                <span>批次分類整理（勾選繪本快速加入或移出書架）</span>
              </h3>
              <p className="text-xs text-amber-800/80 dark:text-slate-400 font-medium">
                已選取 {batchSelectedBookIds.length} 本繪本
              </p>
            </div>
            <button
              onClick={() => setIsBatchCategorizing(false)}
              className="p-1 rounded-full text-amber-800 dark:text-slate-400 hover:bg-amber-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Select All / None */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setBatchSelectedBookIds(books.map((b) => b.id))}
              className="px-3 py-1 bg-white dark:bg-slate-700 text-amber-950 dark:text-slate-200 rounded-xl text-xs font-bold border border-amber-300"
            >
              全選繪本
            </button>
            <button
              onClick={() => setBatchSelectedBookIds([])}
              className="px-3 py-1 bg-white dark:bg-slate-700 text-amber-950 dark:text-slate-200 rounded-xl text-xs font-bold border border-amber-300"
            >
              取消選取
            </button>
          </div>

          {/* Book Checklist Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-64 overflow-y-auto p-2 bg-white/70 dark:bg-slate-900 rounded-2xl border border-amber-200">
            {books.map((b) => {
              const isChecked = batchSelectedBookIds.includes(b.id);
              const title = b.title[primaryLang] || b.title['zh-TW'] || b.title['en'];
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => {
                    setBatchSelectedBookIds((prev) =>
                      prev.includes(b.id) ? prev.filter((id) => id !== b.id) : [...prev, b.id]
                    );
                  }}
                  className={`p-2 rounded-xl text-left border flex items-center gap-2 transition-all ${
                    isChecked
                      ? 'bg-orange-100 border-orange-400 text-orange-950 font-black ring-1 ring-orange-300'
                      : 'bg-white dark:bg-slate-800 border-amber-200 text-amber-950 dark:text-slate-200'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-md flex items-center justify-center border shrink-0 ${
                    isChecked ? 'bg-orange-500 text-white border-orange-500' : 'border-amber-300 bg-white'
                  }`}>
                    {isChecked && <Check className="w-3 h-3" />}
                  </div>
                  <span className="text-xs line-clamp-1">{title}</span>
                </button>
              );
            })}
          </div>

          {/* Action Destination Shelves */}
          <div className="space-y-2">
            <span className="text-xs font-black text-amber-950 dark:text-slate-200">
              選擇目標書架執行操作：
            </span>
            <div className="flex flex-wrap gap-2">
              {allShelves.map((shelf) => (
                <div key={shelf.id} className="flex items-center gap-1 bg-white dark:bg-slate-700 p-1.5 rounded-xl border border-amber-300">
                  <span className="text-xs font-bold px-1.5">{shelf.icon} {shelf.name}</span>
                  <button
                    onClick={() => handleBatchApplyToShelf(shelf.id)}
                    className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-black"
                  >
                    ＋ 加入
                  </button>
                  <button
                    onClick={() => handleBatchRemoveFromShelf(shelf.id)}
                    className="px-2 py-0.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-[10px] font-black"
                  >
                    － 移出
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 🎲 Surprise Pick Result Modal */}
      {surpriseBook && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border-2 border-amber-400 max-w-md w-full text-center space-y-4 shadow-2xl animate-scaleUp">
            <div className="inline-flex p-3 rounded-full bg-purple-100 dark:bg-purple-950/80 text-purple-600 animate-bounce">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-amber-950 dark:text-slate-100">
              🎉 今天的幸運共讀繪本誕生囉！
            </h3>
            
            <div className="flex flex-col items-center gap-3 p-4 bg-amber-50 dark:bg-slate-800 rounded-2xl border border-amber-200">
              <img
                src={surpriseBook.coverUrl}
                alt={surpriseBook.title['zh-TW']}
                className="w-32 h-32 object-cover rounded-2xl shadow-md border-2 border-white"
              />
              <div>
                <h4 className="text-lg font-black text-amber-950 dark:text-slate-100">
                  {surpriseBook.title[primaryLang] || surpriseBook.title['zh-TW']}
                </h4>
                <p className="text-xs text-amber-800/80 dark:text-slate-400 font-medium line-clamp-2 mt-1">
                  {surpriseBook.summary[primaryLang] || surpriseBook.summary['zh-TW']}
                </p>
              </div>
            </div>

            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setSurpriseBook(null)}
                className="px-4 py-2.5 rounded-2xl bg-amber-100 dark:bg-slate-700 text-amber-900 dark:text-slate-200 font-bold text-xs"
              >
                關閉
              </button>
              <button
                onClick={() => {
                  onSelectBook(surpriseBook);
                  setSurpriseBook(null);
                }}
                className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-extrabold text-xs sm:text-sm shadow-md flex items-center gap-1.5"
              >
                <BookOpen className="w-4 h-4" />
                <span>立即開啟共讀</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 📚 Main Visualized 3D Bookshelf or Detailed Card Grid */}
      {viewLayoutMode === '3d_shelf' ? (
        <div className={`p-6 sm:p-8 rounded-3xl border transition-all ${themeStyle.container}`}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{currentShelf ? currentShelf.icon : '📚'}</span>
              <h3 className="font-black text-lg sm:text-xl">
                {activeShelfId === 'all'
                  ? '全館童書展架'
                  : currentShelf
                  ? currentShelf.name
                  : '主題書架'}
              </h3>
            </div>

            <span className="text-xs font-bold opacity-85">
              共陳列 {displayedBooks.length} 本繪本
            </span>
          </div>

          {displayedBooks.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <p className="text-sm font-bold opacity-80">這個書架目前還沒有符合條件的繪本喔！</p>
              <p className="text-xs opacity-70">可以點擊上方「批次分類整理」或「全部繪本」標籤，將心愛的繪本加入這個書架吧！</p>
            </div>
          ) : (
            /* Realistic 3D Shelf Rows */
            <div className="space-y-10">
              <div className={`pt-4 pb-2 px-2 sm:px-4 rounded-2xl ${themeStyle.shelfRow}`}>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
                  {displayedBooks.map((book) => {
                    const displayTitle = book.title[primaryLang] || book.title['zh-TW'] || book.title['en'];
                    const isFav = favoriteBookIds.includes(book.id);
                    const isDownloaded = downloadedBookIds.includes(book.id);

                    return (
                      <div key={book.id} className="relative group flex flex-col items-center">
                        {/* Book Cover on 3D Shelf */}
                        <div
                          onClick={() => onSelectBook(book)}
                          className="relative w-full aspect-3/4 rounded-2xl overflow-hidden shadow-2xl cursor-pointer transform group-hover:-translate-y-3 group-hover:scale-105 transition-all duration-300 border-2 border-white/20"
                        >
                          <img
                            src={book.coverUrl}
                            alt={displayTitle}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />

                          {/* Top Country Flag */}
                          <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-xs text-white text-[11px] font-bold px-2 py-0.5 rounded-full border border-white/20 flex items-center gap-1">
                            <span>{book.flag}</span>
                          </div>

                          {/* Badges */}
                          {isDownloaded && (
                            <div className="absolute top-2 right-2 bg-emerald-500 text-white p-1 rounded-full shadow-xs">
                              <HardDriveDownload className="w-3 h-3" />
                            </div>
                          )}

                          {isFav && (
                            <div className="absolute top-2 right-8 bg-rose-500 text-white p-1 rounded-full shadow-xs">
                              <Heart className="w-3 h-3 fill-white" />
                            </div>
                          )}

                          {/* Hover Quick Read Overlay */}
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-3 text-center space-y-2 text-white">
                            <Play className="w-8 h-8 text-amber-400 fill-amber-400 animate-pulse" />
                            <span className="text-xs font-black">開啟繪本閱讀</span>
                          </div>
                        </div>

                        {/* Shelf Label under Cover */}
                        <div className="mt-2 text-center w-full px-1">
                          <h4 className="font-extrabold text-xs line-clamp-1 opacity-90">{displayTitle}</h4>
                          <p className="text-[10px] opacity-70">{book.author}</p>
                        </div>

                        {/* Shelf Management Popup Toggle Button */}
                        <button
                          onClick={() => setManagingBookId(managingBookId === book.id ? null : book.id)}
                          className="mt-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-white/20 hover:bg-white/40 backdrop-blur-xs transition-colors cursor-pointer"
                        >
                          ⚙️ 分類至書架
                        </button>

                        {/* Manage Shelves Popover */}
                        {managingBookId === book.id && (
                          <div className="absolute top-full mt-2 z-30 w-52 p-3 rounded-2xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xl border border-amber-300 dark:border-slate-700 text-xs font-bold space-y-2 animate-fadeIn">
                            <div className="flex items-center justify-between border-b pb-1">
                              <span>放入哪一個書架？</span>
                              <button onClick={() => setManagingBookId(null)}>
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div className="space-y-1 max-h-40 overflow-y-auto">
                              {allShelves.map((s) => {
                                const inShelf = s.bookIds.includes(book.id);
                                return (
                                  <button
                                    key={s.id}
                                    onClick={() => handleToggleBookInShelf(s.id, book.id)}
                                    className={`w-full flex items-center justify-between p-1.5 rounded-xl transition-colors ${
                                      inShelf ? 'bg-amber-100 dark:bg-slate-800 text-amber-950 dark:text-amber-300 font-black' : 'hover:bg-amber-50 dark:hover:bg-slate-800'
                                    }`}
                                  >
                                    <span>{s.icon} {s.name}</span>
                                    {inShelf && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Card Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {displayedBooks.map((book) => {
            const displayTitle = book.title[primaryLang] || book.title['zh-TW'] || book.title['en'];
            const displaySummary = book.summary[primaryLang] || book.summary['zh-TW'] || book.summary['en'];
            return (
              <div
                key={book.id}
                className={`p-4 rounded-3xl border transition-all hover:shadow-md flex flex-col justify-between space-y-3 ${
                  darkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-amber-200 text-amber-950'
                }`}
              >
                <div className="flex gap-3 items-start">
                  <img
                    src={book.coverUrl}
                    alt={displayTitle}
                    className="w-20 h-24 object-cover rounded-2xl border border-amber-200 shrink-0"
                  />
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-1">
                      <span className="text-xs">{book.flag}</span>
                      <span className="text-[10px] font-extrabold bg-amber-100 dark:bg-slate-800 text-amber-900 dark:text-slate-300 px-2 py-0.5 rounded-full">
                        {book.ageGroup}歲
                      </span>
                    </div>
                    <h4 className="font-extrabold text-sm line-clamp-1">{displayTitle}</h4>
                    <p className="text-[11px] opacity-75 line-clamp-2">{displaySummary}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-amber-100 dark:border-slate-800">
                  <span className="text-[10px] opacity-70">共 {book.pages.length} 頁</span>
                  <button
                    onClick={() => onSelectBook(book)}
                    className="px-3.5 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs flex items-center gap-1 shadow-xs"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>開始閱讀</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
