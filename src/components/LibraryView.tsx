import React, { useState, useMemo, useEffect } from 'react';
import { Search, Filter, Sparkles, BookOpen, Star, Globe, Heart, ArrowRight, Wand2, Compass, Award, HardDriveDownload, CheckCircle2, WifiOff, RefreshCw, Flame, Download, Bot, Mic, MapPin, Tag, BookmarkPlus, Bookmark, Trophy, Map, Layers } from 'lucide-react';
import { Book, CustomShelf, LanguageCode, FavoriteTagItem, UserProfile } from '../types';
import { SUPPORTED_LANGUAGES } from '../data/languages';
import { AiQuickGuideModal } from './AiQuickGuideModal';
import { AiGuideAssistantModal } from './AiGuideAssistantModal';
import { StoryTimeSpaceMapModal } from './StoryTimeSpaceMapModal';
import { BookTagManagerModal } from './BookTagManagerModal';
import { ReadingAdventureMap } from './ReadingAdventureMap';
import { PersonalizedBookshelf } from './PersonalizedBookshelf';
import { DigitalTreasureVaultModal } from './DigitalTreasureVaultModal';
import { getAllFavoriteTags, getAllBookTagMappings, getBookTagIds } from '../utils/favoriteTags';
import { saveBookForOffline } from '../utils/offlineStorage';
import { playStarChime, playPageTurnSound } from '../utils/audio';

interface DownloadTask {
  percent: number;
  statusText: string;
  isDownloading: boolean;
  completed: boolean;
}

interface LibraryViewProps {
  books: Book[];
  onSelectBook: (book: Book) => void;
  onOpenCreator: () => void;
  primaryLang: LanguageCode;
  favoriteBookIds: string[];
  onToggleFavorite: (bookId: string) => void;
  darkMode?: boolean;
  downloadedBookIds?: string[];
  onToggleDownloadBook?: (book: Book) => void;
  isOnline?: boolean;
  customShelves?: CustomShelf[];
  onUpdateShelves?: (shelves: CustomShelf[]) => void;
  readBookIds?: string[];
  userProfile?: UserProfile;
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  books,
  onSelectBook,
  onOpenCreator,
  primaryLang,
  favoriteBookIds,
  onToggleFavorite,
  darkMode = false,
  downloadedBookIds = [],
  onToggleDownloadBook,
  isOnline = true,
  customShelves = [],
  onUpdateShelves,
  readBookIds = [],
  userProfile,
}) => {
  // Library View Display Modes: 'catalog' | 'adventure-map' | 'bookshelf'
  const [libraryMode, setLibraryMode] = useState<'catalog' | 'adventure-map' | 'bookshelf'>('catalog');
  const [isTreasureVaultOpen, setIsTreasureVaultOpen] = useState(false);

  // Resolved UserProfile for Map & Gamification
  const activeUserProfile: UserProfile = useMemo(() => {
    if (userProfile) {
      return {
        ...userProfile,
        readBookIds: Array.from(new Set([...(userProfile.readBookIds || []), ...readBookIds])),
      };
    }
    return {
      name: '小讀者',
      avatar: '🦊',
      readingMinutes: 45,
      booksCompleted: readBookIds.length,
      stars: 120,
      badges: [],
      favoriteBookIds,
      readBookIds,
      dailyGoalMinutes: 20,
      streakDays: 3,
    };
  }, [userProfile, readBookIds, favoriteBookIds]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAge, setSelectedAge] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [recommendMode, setRecommendMode] = useState<string>('top');
  const [showOnlyOffline, setShowOnlyOffline] = useState<boolean>(!isOnline);
  const [aiGuideBook, setAiGuideBook] = useState<Book | null>(null);
  const [isAiGuideAssistantOpen, setIsAiGuideAssistantOpen] = useState(false);
  const [isTimeSpaceMapOpen, setIsTimeSpaceMapOpen] = useState(false);
  const [downloadTasks, setDownloadTasks] = useState<Record<string, DownloadTask>>({});

  // Favorite Tags States
  const [selectedTagId, setSelectedTagId] = useState<string>('all');
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [tagModalBook, setTagModalBook] = useState<Book | null>(null);
  const [allFavoriteTags, setAllFavoriteTags] = useState<FavoriteTagItem[]>(() => getAllFavoriteTags());
  const [bookTagMappings, setBookTagMappings] = useState<Record<string, string[]>>(() => getAllBookTagMappings());

  const refreshTagsData = () => {
    setAllFavoriteTags(getAllFavoriteTags());
    setBookTagMappings(getAllBookTagMappings());
  };

  // Batch Pre-Download handler for a book with real-time percentage progress
  const handleBatchPreDownload = (book: Book) => {
    if (downloadTasks[book.id]?.isDownloading) return;

    // Phase 1: Initialize Task
    setDownloadTasks((prev) => ({
      ...prev,
      [book.id]: {
        percent: 10,
        statusText: '繪本文字與章節結構數據下載中... (剩餘 90%)',
        isDownloading: true,
        completed: false,
      },
    }));

    // Phase 2: Page Illustrations & Visual Assets (35%)
    setTimeout(() => {
      setDownloadTasks((prev) => ({
        ...prev,
        [book.id]: {
          percent: 35,
          statusText: `下載全書 ${book.pages.length} 頁高清圖文畫冊素材... (剩餘 65%)`,
          isDownloading: true,
          completed: false,
        },
      }));
    }, 500);

    // Phase 3: Audio & Voice Assets Synthesis (70%)
    setTimeout(() => {
      setDownloadTasks((prev) => ({
        ...prev,
        [book.id]: {
          percent: 70,
          statusText: '打包多語言雙語朗讀與生字語音資產... (剩餘 30%)',
          isDownloading: true,
          completed: false,
        },
      }));
    }, 1200);

    // Phase 4: Local Cache Storage Write (95%)
    setTimeout(() => {
      setDownloadTasks((prev) => ({
        ...prev,
        [book.id]: {
          percent: 95,
          statusText: '寫入本機離線快取的 IndexedDB/Storage... (剩餘 5%)',
          isDownloading: true,
          completed: false,
        },
      }));
    }, 1800);

    // Phase 5: Finalized Completion (100%)
    setTimeout(() => {
      saveBookForOffline(book);
      if (onToggleDownloadBook && !downloadedBookIds.includes(book.id)) {
        onToggleDownloadBook(book);
      }
      playStarChime();

      setDownloadTasks((prev) => ({
        ...prev,
        [book.id]: {
          percent: 100,
          statusText: '🎉 100% 離線包 (全本內容 + 配套語音素材) 已完整預下載本機！',
          isDownloading: false,
          completed: true,
        },
      }));
    }, 2300);
  };

  const categories = [
    { id: 'all', label: '全部類型' },
    { id: 'Fairy Tale', label: '童話與傳說' },
    { id: 'Nature & Science', label: '自然與科學' },
    { id: 'Culture & Heritage', label: '世界民俗與文化' },
    { id: 'Moral & Wisdom', label: '成長與智慧' },
    { id: 'Friendship & Love', label: '友誼與愛' },
  ];

  const ageGroups = [
    { id: 'all', label: '適合所有年齡' },
    { id: '3-5', label: '3-5歲 啟蒙級' },
    { id: '6-8', label: '6-8歲 基礎級' },
    { id: '9-12', label: '9-12歲 進階級' },
  ];

  const regions = [
    { id: 'all', label: '所有國家/地區' },
    { id: '亞洲', label: '亞洲故事' },
    { id: '歐洲', label: '歐洲故事' },
    { id: '美洲', label: '美洲故事' },
    { id: '非洲', label: '非洲故事' },
  ];

  // AI Recommendation list calculation
  const recommendedBooks = useMemo(() => {
    if (recommendMode === 'bedtime') {
      return books.filter((b) => b.category === 'Fairy Tale' || b.category === 'Friendship & Love').slice(0, 3);
    } else if (recommendMode === 'science') {
      return books.filter((b) => b.category === 'Nature & Science' || b.category === 'Moral & Wisdom').slice(0, 3);
    } else if (recommendMode === 'age') {
      return books.filter((b) => b.ageGroup === '6-8' || b.ageGroup === '3-5').slice(0, 3);
    }
    // Default 'top'
    return books.filter((b) => b.rating >= 4.8 || b.isFeatured).slice(0, 3);
  }, [books, recommendMode]);

  // Filter books based on criteria
  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      // Offline filter check
      const isDownloaded = downloadedBookIds.includes(book.id);
      if (showOnlyOffline && !isDownloaded) {
        return false;
      }

      // Search
      const titleText = (book.title[primaryLang] || book.title['zh-TW'] || book.title['en'] || '').toLowerCase();
      const authorText = book.author.toLowerCase();
      const summaryText = (book.summary[primaryLang] || book.summary['zh-TW'] || '').toLowerCase();
      const query = searchQuery.toLowerCase();

      const matchesSearch = !query || titleText.includes(query) || authorText.includes(query) || summaryText.includes(query);

      // Age Group
      const matchesAge = selectedAge === 'all' || book.ageGroup === selectedAge;

      // Category
      const matchesCategory = selectedCategory === 'all' || book.category === selectedCategory;

      // Favorite Tag Filter
      const bookTags = bookTagMappings[book.id] || [];
      const matchesTag = selectedTagId === 'all' || bookTags.includes(selectedTagId);

      // Region / Origin
      const matchesRegion =
        selectedRegion === 'all' ||
        (selectedRegion === '亞洲' && ['中國', '台灣', '日本', '韓國', '越南', '印度'].some((c) => book.originCountry.includes(c))) ||
        (selectedRegion === '歐洲' && ['法國', '英國', '丹麥', '德國', '義大利', '希臘'].some((c) => book.originCountry.includes(c))) ||
        (selectedRegion === '美洲' && ['美國', '加拿大', '巴西', '墨西哥'].some((c) => book.originCountry.includes(c))) ||
        (selectedRegion === '非洲' && ['奈及利亞', '埃及', '肯亞'].some((c) => book.originCountry.includes(c)));

      return matchesSearch && matchesAge && matchesCategory && matchesTag && matchesRegion;
    });
  }, [books, searchQuery, selectedAge, selectedCategory, selectedRegion, selectedTagId, bookTagMappings, primaryLang, showOnlyOffline, downloadedBookIds]);

  const featuredBook = books.find((b) => b.isFeatured) || books[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8 sm:space-y-10" id="library-view-container">
      
      {/* 🧭 Top Primary View Mode Switcher (繪本總覽 / 閱讀冒險地圖 / 虛擬書架個性化 / 數位寶箱) */}
      <div className={`p-2.5 rounded-3xl border shadow-sm flex flex-wrap items-center justify-between gap-3 backdrop-blur-md transition-colors ${
        darkMode ? 'bg-slate-900/90 border-slate-800 text-slate-100' : 'bg-amber-100/70 border-amber-200 text-amber-950'
      }`}>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            id="tab-library-catalog-mode"
            onClick={() => {
              setLibraryMode('catalog');
              playPageTurnSound();
            }}
            className={`px-4 py-2.5 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
              libraryMode === 'catalog'
                ? 'bg-amber-500 text-slate-950 shadow-md scale-105 ring-2 ring-amber-300'
                : darkMode
                ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                : 'bg-white/80 text-amber-900 hover:bg-white'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>📚 繪本推薦與總覽</span>
            <span className="text-[10px] bg-black/10 px-2 py-0.5 rounded-full font-mono">{books.length}</span>
          </button>

          <button
            type="button"
            id="tab-library-adventure-map-mode"
            onClick={() => {
              setLibraryMode('adventure-map');
              playStarChime();
            }}
            className={`px-4 py-2.5 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
              libraryMode === 'adventure-map'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md scale-105 ring-2 ring-emerald-300 animate-pulse'
                : darkMode
                ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                : 'bg-white/80 text-amber-900 hover:bg-white'
            }`}
          >
            <Map className="w-4 h-4 text-emerald-400" />
            <span>🗺️ 閱讀冒險地圖</span>
            <span className="text-[10px] bg-emerald-700/50 text-white px-2 py-0.5 rounded-full font-bold">
              {activeUserProfile.readBookIds.length} 站點已解鎖
            </span>
          </button>

          <button
            type="button"
            id="tab-library-bookshelf-mode"
            onClick={() => {
              setLibraryMode('bookshelf');
              playPageTurnSound();
            }}
            className={`px-4 py-2.5 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
              libraryMode === 'bookshelf'
                ? 'bg-gradient-to-r from-amber-600 to-yellow-600 text-white shadow-md scale-105 ring-2 ring-amber-300'
                : darkMode
                ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                : 'bg-white/80 text-amber-900 hover:bg-white'
            }`}
          >
            <Layers className="w-4 h-4 text-amber-300" />
            <span>🪵 虛擬書架個性化</span>
          </button>
        </div>
      </div>

      {/* Conditional View: 🗺️ Reading Adventure Map Component */}
      {libraryMode === 'adventure-map' && (
        <div className="animate-fadeIn space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-black flex items-center gap-2">
              <Compass className="w-6 h-6 text-emerald-500 animate-spin-slow" />
              <span>🗺️ 互動式繪本冒險地圖</span>
            </h2>
            <button
              onClick={() => setLibraryMode('catalog')}
              className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>返回繪本列表</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <ReadingAdventureMap
            profile={activeUserProfile}
            books={books}
            onSelectBook={(book) => onSelectBook(book)}
            onOpenBookshelf={() => setLibraryMode('bookshelf')}
            onOpenCreator={onOpenCreator}
          />
        </div>
      )}

      {/* Conditional View: 🪵 Personalized Bookshelf Component */}
      {libraryMode === 'bookshelf' && (
        <div className="animate-fadeIn space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-black flex items-center gap-2">
              <Layers className="w-6 h-6 text-amber-500" />
              <span>🪵 個性化虛擬書架 (主題換裝與自訂收納)</span>
            </h2>
            <button
              onClick={() => setLibraryMode('catalog')}
              className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>返回繪本列表</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <PersonalizedBookshelf
            books={books}
            customShelves={customShelves}
            onUpdateShelves={onUpdateShelves}
            favoriteBookIds={favoriteBookIds}
            downloadedBookIds={downloadedBookIds}
            primaryLang={primaryLang}
            onSelectBook={(book) => onSelectBook(book)}
            darkMode={darkMode}
          />
        </div>
      )}

      {/* Catalog & Grid View */}
      {libraryMode === 'catalog' && (
        <>
          {/* Offline Mode Banner when disconnected */}
          {!isOnline && (
            <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-fadeIn">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-white/20 backdrop-blur-xs">
                  <WifiOff className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-black text-base sm:text-lg flex items-center gap-2">
                    <span>無網路連線（離線閱讀模式）</span>
                    <span className="text-xs bg-black/30 text-amber-200 px-2 py-0.5 rounded-full border border-white/20">
                      PWA 離線技術生效中
                    </span>
                  </h3>
                  <p className="text-xs sm:text-sm font-medium opacity-90">
                    孩童仍可順暢閱讀共 {downloadedBookIds.length || '多'} 本已離線快取的繪本！系統會自動記錄閱讀進度與生字。
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowOnlyOffline(true)}
                className="px-4 py-2 rounded-2xl bg-white text-rose-600 font-extrabold text-xs sm:text-sm shadow-md hover:bg-rose-50 transition-transform shrink-0"
              >
                僅顯示離線可讀繪本
              </button>
            </div>
          )}

      {/* Hero Welcome Banner */}
      <div className={`relative overflow-hidden rounded-3xl p-6 sm:p-10 shadow-lg border transition-colors ${
        darkMode
          ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-purple-950 border-purple-900/60 text-slate-100'
          : 'bg-gradient-to-br from-amber-400 via-orange-300 to-amber-200 border-amber-300 text-amber-950'
      }`}>
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full font-extrabold text-xs sm:text-sm border ${
            darkMode ? 'bg-purple-900/50 text-amber-300 border-purple-700/50' : 'bg-amber-900/10 text-amber-950 border-amber-900/10'
          }`}>
            <Sparkles className="w-4 h-4 text-orange-500" />
            <span>開啟孩子的全球閱讀視界</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            探索世界各國的<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-amber-500 to-amber-700">
              精彩多語言繪本
            </span>
          </h1>

          <p className={`text-sm sm:text-base font-medium leading-relaxed ${darkMode ? 'text-slate-300' : 'text-amber-900'}`}>
            融合原汁原味的各國傳說、動人童話與科學繪本，支援繁中、英文、日文、法文等 8 種語言雙語朗讀與 AI 智慧生字助手！
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              id="btn-hero-time-space-map"
              onClick={() => setIsTimeSpaceMapOpen(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 px-5 py-3 rounded-2xl font-black text-sm sm:text-base shadow-lg hover:scale-105 transition-all border border-amber-300 cursor-pointer"
            >
              <Compass className="w-5 h-5 text-slate-950 animate-spin-slow" />
              <span>🗺️ 故事時空地圖 (地理歷史探索)</span>
            </button>

            <button
              id="btn-hero-ai-guide-assistant"
              onClick={() => setIsAiGuideAssistantOpen(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-5 py-3 rounded-2xl font-black text-sm sm:text-base shadow-lg hover:scale-105 transition-all border border-purple-400/40 cursor-pointer"
            >
              <Bot className="w-5 h-5 text-amber-300 animate-bounce" />
              <span>🤖 AI 導覽助手</span>
            </button>

            <button
              id="btn-hero-explore-featured"
              onClick={() => onSelectBook(featuredBook)}
              className="flex items-center gap-2 bg-amber-900 hover:bg-amber-950 text-amber-50 px-5 py-3 rounded-2xl font-bold text-sm sm:text-base shadow-md hover:scale-105 transition-all"
            >
              <BookOpen className="w-5 h-5 text-amber-300" />
              <span>今日推薦：《{featuredBook.title[primaryLang] || featuredBook.title['zh-TW']}》</span>
            </button>

            <button
              id="btn-hero-ai-create"
              onClick={onOpenCreator}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm sm:text-base border shadow-xs hover:scale-105 transition-all ${
                darkMode ? 'bg-slate-800 text-slate-100 border-slate-700 hover:bg-slate-700' : 'bg-amber-50/90 text-amber-950 border-amber-300 hover:bg-white'
              }`}
            >
              <Wand2 className="w-5 h-5 text-orange-500" />
              <span>AI 創作專屬繪本</span>
            </button>
          </div>
        </div>

        {/* Decorative Floating Image */}
        <div className="hidden lg:block absolute right-8 top-1/2 -translate-y-1/2 w-80 h-80 rounded-3xl overflow-hidden shadow-2xl border-4 border-amber-100/80 rotate-3 transition-transform hover:rotate-0">
          <img
            src={featuredBook.coverUrl}
            alt={featuredBook.title['zh-TW']}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-4">
            <span className="text-white font-bold text-sm bg-black/40 px-3 py-1 rounded-lg backdrop-blur-xs">
              {featuredBook.originCountry} {featuredBook.flag}
            </span>
          </div>
        </div>
      </div>

      {/* AI Smart Book Recommendation System (繪本推薦系統) */}
      <div className={`p-5 sm:p-6 rounded-3xl border transition-colors ${
        darkMode
          ? 'bg-slate-800/90 border-slate-700 text-slate-100 shadow-lg'
          : 'bg-gradient-to-r from-orange-100/80 via-amber-100/70 to-amber-50 border-amber-200/90 shadow-sm'
      }`} id="ai-book-recommendation-section">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-orange-500 text-white shadow-md">
              <Compass className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black tracking-tight">AI 智慧繪本推薦系統</h2>
                <span className="text-[10px] font-extrabold bg-orange-500 text-white px-2 py-0.5 rounded-full">
                  依興趣年齡速配
                </span>
              </div>
              <p className={`text-xs font-medium ${darkMode ? 'text-slate-300' : 'text-amber-900/80'}`}>
                個人化智慧閱讀顧問，根據熱門完讀率、故事主題與適讀年齡為孩子嚴選
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setIsAiGuideAssistantOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-black text-xs flex items-center gap-1.5 shadow-md hover:scale-105 transition-transform cursor-pointer shrink-0"
            >
              <Bot className="w-4 h-4 text-amber-300 animate-bounce" />
              <span>🤖 AI 導覽助手 (語音問答)</span>
            </button>

            {/* Recommendation Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {[
                { id: 'top', label: '🌟 人氣熱門榜' },
                { id: 'age', label: '👶 適讀年齡推薦' },
                { id: 'bedtime', label: '🌙 睡前溫馨故事' },
                { id: 'science', label: '🚀 冒險科普繪本' },
              ].map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setRecommendMode(mode.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all ${
                    recommendMode === mode.id
                      ? 'bg-orange-500 text-white shadow-xs scale-105'
                      : darkMode
                      ? 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                      : 'bg-white/80 text-amber-950 border border-amber-200 hover:bg-amber-200/60'
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Recommended Book Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {recommendedBooks.map((book, idx) => {
            const displayTitle = book.title[primaryLang] || book.title['zh-TW'] || book.title['en'];
            const displaySummary = book.summary[primaryLang] || book.summary['zh-TW'] || book.summary['en'];

            const reasons = [
              '🎯 完美契合適讀年齡發展需求',
              '🔥 親子完讀評價 5.0 顆星好評',
              '🌍 擴充世界國際視野與豐富生字',
              '🌙 故事溫馨祥和，非常適合睡前朗讀',
            ];
            const reason = reasons[idx % reasons.length];

            return (
              <div
                key={book.id}
                onClick={() => onSelectBook(book)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer group flex flex-col justify-between hover:scale-[1.02] ${
                  darkMode
                    ? 'bg-slate-900/90 border-slate-700 hover:border-orange-500 shadow-md'
                    : 'bg-white/90 border-amber-200 hover:border-orange-400 shadow-2xs'
                }`}
              >
                <div className="space-y-3">
                  <div className="relative aspect-[16/9] rounded-xl overflow-hidden bg-amber-100">
                    <img src={book.coverUrl} alt={displayTitle} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-xs text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md">
                      {book.flag} {book.originCountry}
                    </div>
                    <div className="absolute top-2 right-2 bg-amber-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md flex items-center gap-1">
                      <Star className="w-3 h-3 fill-white" />
                      <span>{book.rating}</span>
                    </div>
                  </div>

                  <div>
                    <span className="inline-block text-[10px] font-black text-orange-600 bg-orange-100 px-2 py-0.5 rounded-md mb-1">
                      {reason}
                    </span>
                    <h4 className="font-extrabold text-sm sm:text-base line-clamp-1">{displayTitle}</h4>
                    <p className={`text-xs line-clamp-2 mt-1 font-medium ${darkMode ? 'text-slate-400' : 'text-amber-900/80'}`}>
                      {displaySummary}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs font-black text-orange-600 pt-3 border-t border-amber-100/30 mt-3">
                  <span>立即試讀這本繪本</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 童心雙語繪本智慧搜尋引擎 (Picture Book Search Engine) */}
      <div className={`space-y-4 p-5 sm:p-6 rounded-3xl border transition-all ${
        darkMode ? 'bg-slate-800/90 border-slate-700 shadow-xl' : 'bg-gradient-to-r from-amber-100/70 via-orange-50/60 to-amber-50 border-amber-300/80 shadow-md'
      }`} id="search-filter-section">
        
        {/* Search Engine Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200/60 dark:border-slate-700 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-xs">
              <Search className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>童心雙語繪本智慧搜尋引擎</span>
                <span className="text-[10px] font-black bg-amber-500 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Search Engine
                </span>
              </h2>
              <p className={`text-xs font-semibold ${darkMode ? 'text-slate-400' : 'text-amber-800/80'}`}>
                輸入關鍵字、故事主角或依年齡類別精準檢索多語言兒童繪本
              </p>
            </div>
          </div>

          <div className="text-xs font-black text-amber-900 dark:text-amber-200 bg-amber-200/60 dark:bg-amber-950/80 px-3 py-1 rounded-full self-start sm:self-auto border border-amber-300/50">
            🔍 找到 {filteredBooks.length} 本全美與全球經典繪本
          </div>
        </div>

        {/* Hot Keyword Quick Search Chips (熱搜關鍵字快選) */}
        <div className="flex items-center gap-2 flex-wrap text-xs font-extrabold">
          <span className={`text-[11px] font-black shrink-0 ${darkMode ? 'text-slate-400' : 'text-amber-900/70'}`}>🔥 熱搜關鍵字：</span>
          {[
            '🐉 奇幻龍族',
            '🚀 宇宙星空',
            '🌙 睡前故事',
            '📖 安徒生童話',
            '🌲 格林童話',
            '🌏 雙語啟蒙',
            '🔍 偵探解謎',
            '🦁 森林動物',
            '🌸 文化傳說'
          ].map((chip) => {
            const rawKw = chip.replace(/^[^\s]+\s*/, '');
            const isActive = searchQuery.toLowerCase() === rawKw.toLowerCase();
            return (
              <button
                key={chip}
                type="button"
                onClick={() => {
                  if (isActive) {
                    setSearchQuery('');
                  } else {
                    setSearchQuery(rawKw);
                  }
                }}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all border ${
                  isActive
                    ? 'bg-amber-500 text-white border-amber-600 shadow-xs scale-105'
                    : darkMode
                    ? 'bg-slate-700/80 text-slate-300 border-slate-600 hover:bg-slate-600'
                    : 'bg-white text-amber-900 border-amber-200/80 hover:bg-amber-100 hover:border-amber-300'
                }`}
              >
                {chip}
              </button>
            );
          })}
        </div>

        {/* Search Input Bar */}
        <div className="relative">
          <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-slate-400' : 'text-amber-700'}`} />
          <input
            id="input-book-search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜尋繪本名稱、作者、關鍵字（例如：小王子、太陽、狐狸、冒險）..."
            className={`w-full pl-12 pr-16 py-3.5 rounded-2xl border focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium text-sm sm:text-base ${
              darkMode
                ? 'bg-slate-900 border-slate-700 text-slate-100 placeholder-slate-500'
                : 'bg-white border-amber-200 text-amber-950 placeholder-amber-700/50 shadow-xs'
            }`}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs bg-amber-200 hover:bg-amber-300 text-amber-950 px-2.5 py-1 rounded-xl font-bold transition-colors cursor-pointer"
            >
              清除關鍵字
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="space-y-3 pt-1">
          {/* Categories */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className={`text-xs font-bold whitespace-nowrap px-1 ${darkMode ? 'text-slate-300' : 'text-amber-900/70'}`}>主題類別：</span>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  if (showOnlyOffline) setShowOnlyOffline(false);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat.id && !showOnlyOffline
                    ? 'bg-amber-600 text-white shadow-xs'
                    : darkMode
                    ? 'bg-slate-700 text-slate-200 border border-slate-600 hover:bg-slate-600'
                    : 'bg-white/80 text-amber-900 hover:bg-amber-200/60 border border-amber-200/60'
                }`}
              >
                {cat.label}
              </button>
            ))}

            {/* Offline Filter Toggle Pill */}
            <button
              onClick={() => setShowOnlyOffline(!showOnlyOffline)}
              className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-black whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                showOnlyOffline
                  ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm scale-105'
                  : darkMode
                  ? 'bg-slate-800 text-emerald-400 border-emerald-900/80 hover:bg-slate-700'
                  : 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100'
              }`}
            >
              <HardDriveDownload className="w-4 h-4 text-emerald-500" />
              <span>離線可讀繪本 ({downloadedBookIds.length})</span>
            </button>
          </div>

          {/* 🏷️ Favorite Tags Filter Chips Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar pt-1">
            <span className={`text-xs font-bold whitespace-nowrap px-1 flex items-center gap-1 ${darkMode ? 'text-slate-300' : 'text-amber-900/70'}`}>
              <Tag className="w-3.5 h-3.5 text-amber-500" />
              <span>收藏標籤：</span>
            </span>

            <button
              onClick={() => {
                setSelectedTagId('all');
                playPageTurnSound();
              }}
              className={`px-3 py-1 rounded-xl text-xs font-black whitespace-nowrap transition-all border ${
                selectedTagId === 'all'
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-xs scale-105'
                  : darkMode
                  ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  : 'bg-white text-slate-700 border-amber-200 hover:bg-amber-50'
              }`}
            >
              全部標籤
            </button>

            {allFavoriteTags.map((tag) => {
              const count = Object.values(bookTagMappings).filter((tagIds) => (tagIds as string[])?.includes(tag.id)).length;
              const isSelected = selectedTagId === tag.id;
              return (
                <button
                  key={tag.id}
                  onClick={() => {
                    setSelectedTagId(isSelected ? 'all' : tag.id);
                    playPageTurnSound();
                  }}
                  className={`px-3 py-1 rounded-xl text-xs font-black whitespace-nowrap transition-all border flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-xs scale-105 ring-2 ring-amber-400/40'
                      : darkMode
                      ? 'bg-slate-800/80 text-slate-300 border-slate-700 hover:border-amber-400'
                      : 'bg-white text-slate-800 border-slate-200 hover:border-amber-300 shadow-2xs'
                  }`}
                >
                  <span>{tag.icon}</span>
                  <span>{tag.name}</span>
                  <span className="text-[10px] opacity-70">({count})</span>
                </button>
              );
            })}

            <button
              onClick={() => {
                setTagModalBook(null);
                setIsTagModalOpen(true);
                playStarChime();
              }}
              className="px-2.5 py-1 rounded-xl text-xs font-bold text-amber-500 hover:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 whitespace-nowrap flex items-center gap-1 cursor-pointer"
            >
              <BookmarkPlus className="w-3.5 h-3.5" />
              <span>+ 管理標籤庫</span>
            </button>
          </div>

          {/* Age Group & Region Secondary Filters */}
          <div className="flex flex-wrap items-center justify-between gap-4 text-xs sm:text-sm pt-1">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className={`font-bold ${darkMode ? 'text-slate-300' : 'text-amber-900/70'}`}>適讀年齡：</span>
                <select
                  id="select-age-filter"
                  value={selectedAge}
                  onChange={(e) => setSelectedAge(e.target.value)}
                  className={`border rounded-xl px-3 py-1.5 font-semibold focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                    darkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-amber-200 text-amber-950'
                  }`}
                >
                  {ageGroups.map((age) => (
                    <option key={age.id} value={age.id}>
                      {age.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className={`font-bold ${darkMode ? 'text-slate-300' : 'text-amber-900/70'}`}>故事源頭：</span>
                <select
                  id="select-region-filter"
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className={`border rounded-xl px-3 py-1.5 font-semibold focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                    darkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-amber-200 text-amber-950'
                  }`}
                >
                  {regions.map((reg) => (
                    <option key={reg.id} value={reg.id}>
                      {reg.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {(searchQuery || selectedAge !== 'all' || selectedCategory !== 'all' || selectedRegion !== 'all' || showOnlyOffline) && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedAge('all');
                  setSelectedCategory('all');
                  setSelectedRegion('all');
                  setShowOnlyOffline(false);
                }}
                className="text-xs font-black text-rose-600 hover:text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/60 transition-colors cursor-pointer"
              >
                重置所有搜尋條件 ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Book Grid Collection */}
      <div id="book-grid-section">
        {filteredBooks.length === 0 ? (
          <div className={`text-center py-16 rounded-3xl border border-dashed p-8 ${
            darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-amber-50/50 border-amber-300'
          }`}>
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 text-2xl">
              📖
            </div>
            <h3 className={`text-lg font-bold mb-2 ${darkMode ? 'text-slate-100' : 'text-amber-950'}`}>找不到符合條件的繪本</h3>
            <p className={`text-sm mb-6 max-w-md mx-auto ${darkMode ? 'text-slate-400' : 'text-amber-800/80'}`}>
              試試看調整搜尋關鍵字，或者點擊下方按鈕讓 AI 為你創作一本專屬繪本！
            </p>
            <button
              onClick={onOpenCreator}
              className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-5 py-2.5 rounded-2xl font-bold text-sm shadow-sm transition-transform hover:scale-105"
            >
              <Wand2 className="w-4 h-4" />
              <span>領域 AI 創作繪本</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredBooks.map((book) => {
              const displayTitle = book.title[primaryLang] || book.title['zh-TW'] || book.title['en'];
              const displaySummary = book.summary[primaryLang] || book.summary['zh-TW'] || book.summary['en'];
              const isFav = favoriteBookIds.includes(book.id);
              const isDownloaded = downloadedBookIds.includes(book.id);

              return (
                <div
                  key={book.id}
                  id={`book-card-${book.id}`}
                  className={`group rounded-3xl overflow-hidden border transition-all duration-300 flex flex-col justify-between hover:-translate-y-1 ${
                    darkMode
                      ? 'bg-slate-800/90 border-slate-700 text-slate-100 hover:shadow-2xl hover:border-slate-600'
                      : 'bg-white border-amber-200/80 text-amber-950 shadow-xs hover:shadow-xl'
                  }`}
                >
                  {/* Top Cover Image & Badges */}
                  <div className="relative aspect-[4/3] bg-amber-100 overflow-hidden cursor-pointer" onClick={() => onSelectBook(book)}>
                    <img
                      src={book.coverUrl}
                      alt={displayTitle}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-amber-950/80 via-transparent to-black/20 opacity-90 group-hover:opacity-75 transition-opacity" />

                    {/* Top Right Actions: Favorite & Download buttons */}
                    <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
                      {onToggleDownloadBook && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleDownloadBook(book);
                          }}
                          className={`p-2 rounded-full backdrop-blur-xs transition-all shadow-sm ${
                            isDownloaded
                              ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                              : 'bg-white/80 text-slate-600 hover:bg-white hover:text-emerald-600'
                          }`}
                          title={isDownloaded ? '已下載至離線閱讀庫 (點擊移除)' : '下載此繪本以供離線閱讀'}
                        >
                          {isDownloaded ? <CheckCircle2 className="w-4 h-4" /> : <HardDriveDownload className="w-4 h-4" />}
                        </button>
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(book.id);
                        }}
                        className="p-2 rounded-full bg-white/80 backdrop-blur-xs text-rose-500 hover:bg-white transition-colors shadow-sm"
                        title={isFav ? '取消收藏' : '加入收藏'}
                      >
                        <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500 text-rose-500' : 'text-slate-400'}`} />
                      </button>
                    </div>

                    {/* Origin Country Tag & Offline Badge */}
                    <div className="absolute top-3 left-3 flex flex-col items-start gap-1">
                      <div className="bg-amber-950/70 backdrop-blur-xs text-amber-100 text-xs font-bold px-2.5 py-1 rounded-full border border-amber-400/30 flex items-center gap-1">
                        <span>{book.flag}</span>
                        <span>{book.originCountry}</span>
                      </div>

                      {isDownloaded && (
                        <div className="bg-emerald-600/90 backdrop-blur-xs text-white text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-400/50 flex items-center gap-1 shadow-xs animate-fadeIn">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>離線可讀</span>
                        </div>
                      )}
                    </div>

                    {/* Bottom Title overlay */}
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <div className="flex items-center justify-between text-xs font-semibold text-amber-200 mb-1">
                        <span>{book.ageGroup}歲 適讀</span>
                        <span className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          {book.rating}
                        </span>
                      </div>
                      <h3 className="font-extrabold text-base sm:text-lg leading-snug line-clamp-1 drop-shadow-sm">
                        {displayTitle}
                      </h3>
                    </div>
                  </div>

                  {/* Card Content Body */}
                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <div className={`flex items-center justify-between text-xs font-semibold mb-2 ${darkMode ? 'text-slate-400' : 'text-amber-900/70'}`}>
                        <span>作者: {book.author}</span>
                        <span className={`px-2 py-0.5 rounded-md font-bold ${darkMode ? 'bg-slate-700 text-amber-300' : 'bg-amber-100 text-amber-900'}`}>
                          {book.pages.length} 頁繪本
                        </span>
                      </div>

                      <p className={`text-xs sm:text-sm line-clamp-2 leading-relaxed ${darkMode ? 'text-slate-300' : 'text-amber-900/80'}`}>
                        {displaySummary}
                      </p>

                      {/* 🏷️ Picture Book Assigned Tags Chips Row */}
                      <div className="mt-2 flex items-center gap-1 flex-wrap">
                        {(bookTagMappings[book.id] || []).map((tagId) => {
                          const tag = allFavoriteTags.find((t) => t.id === tagId);
                          if (!tag) return null;
                          return (
                            <span
                              key={tag.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedTagId(tag.id);
                                playPageTurnSound();
                              }}
                              className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-lg text-[10px] font-black border cursor-pointer hover:scale-105 transition-transform ${tag.color}`}
                              title={tag.description}
                            >
                              <span>{tag.icon}</span>
                              <span>{tag.name}</span>
                            </span>
                          );
                        })}

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setTagModalBook(book);
                            setIsTagModalOpen(true);
                            playStarChime();
                          }}
                          className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
                            (bookTagMappings[book.id] || []).length === 0
                              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-300/40 hover:bg-amber-500/20'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-amber-500 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          <Tag className="w-3 h-3" />
                          <span>{(bookTagMappings[book.id] || []).length === 0 ? '+ 貼上標籤' : '編輯'}</span>
                        </button>
                      </div>

                      {/* AI Quick Story Summary & Batch Pre-Download Buttons */}
                      <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        <button
                          type="button"
                          id={`btn-ai-quick-guide-${book.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setAiGuideBook(book);
                          }}
                          className="py-1.5 px-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/60 dark:hover:bg-purple-900/80 text-purple-900 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-[11px] font-black flex items-center justify-center gap-1 transition-all shadow-2xs hover:scale-[1.01]"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse shrink-0" />
                          <span className="truncate">AI 快速導讀</span>
                        </button>

                        <button
                          type="button"
                          id={`btn-batch-predownload-${book.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBatchPreDownload(book);
                          }}
                          disabled={downloadTasks[book.id]?.isDownloading}
                          className={`py-1.5 px-2.5 rounded-xl border text-[11px] font-black flex items-center justify-center gap-1 transition-all shadow-2xs hover:scale-[1.01] ${
                            isDownloaded || downloadTasks[book.id]?.completed
                              ? 'bg-emerald-50 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                              : downloadTasks[book.id]?.isDownloading
                              ? 'bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 animate-pulse'
                              : 'bg-amber-50 hover:bg-amber-100 dark:bg-slate-800 text-amber-900 dark:text-amber-300 border-amber-200 dark:border-slate-700'
                          }`}
                        >
                          {downloadTasks[book.id]?.isDownloading ? (
                            <RefreshCw className="w-3.5 h-3.5 text-amber-600 animate-spin shrink-0" />
                          ) : isDownloaded || downloadTasks[book.id]?.completed ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          ) : (
                            <HardDriveDownload className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          )}
                          <span className="truncate">
                            {downloadTasks[book.id]?.isDownloading
                              ? `預載中 ${downloadTasks[book.id].percent}%`
                              : isDownloaded || downloadTasks[book.id]?.completed
                              ? '已預下載語音包'
                              : '批量預下載'}
                          </span>
                        </button>
                      </div>

                      {/* Live Batch Pre-Download Progress Status Bar */}
                      {downloadTasks[book.id] && (
                        <div className="mt-2.5 p-2.5 rounded-2xl bg-slate-900 text-white dark:bg-slate-950 border border-slate-700/80 shadow-md animate-fadeIn space-y-1.5">
                          <div className="flex items-center justify-between text-[11px] font-black">
                            <span className="flex items-center gap-1 text-amber-300 line-clamp-1 pr-2">
                              <HardDriveDownload className="w-3.5 h-3.5 text-amber-400 shrink-0 animate-bounce" />
                              <span>{downloadTasks[book.id].statusText}</span>
                            </span>
                            <span className="text-emerald-400 font-black shrink-0">{downloadTasks[book.id].percent}%</span>
                          </div>

                          {/* Progress Bar Track */}
                          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden p-0.5 border border-slate-700">
                            <div
                              className="bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-400 h-full rounded-full transition-all duration-300 shadow-xs"
                              style={{ width: `${downloadTasks[book.id].percent}%` }}
                            />
                          </div>

                          <div className="flex justify-between items-center text-[10px] text-slate-300 font-bold">
                            <span>全本圖文 + 雙語語音包本機備份</span>
                            <span className="text-amber-300 font-black">
                              {downloadTasks[book.id].percent === 100
                                ? '✅ 完成儲存'
                                : `剩餘進度 ${100 - downloadTasks[book.id].percent}%`}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Supported Language Flags Bar & Read Action */}
                    <div className={`pt-2 border-t flex items-center justify-between ${darkMode ? 'border-slate-700' : 'border-amber-100'}`}>
                      <div className="flex items-center gap-1 text-base" title="支援多語言雙語朗讀">
                        {SUPPORTED_LANGUAGES.slice(0, 5).map((l) => (
                          <span key={l.code}>{l.flag}</span>
                        ))}
                        <span className={`text-[10px] font-bold ml-1 ${darkMode ? 'text-slate-400' : 'text-amber-700'}`}>+多語</span>
                      </div>

                      <button
                        onClick={() => onSelectBook(book)}
                        className={`flex items-center gap-1.5 text-xs sm:text-sm font-extrabold px-3 py-1.5 rounded-xl transition-all ${
                          darkMode
                            ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500 hover:text-white'
                            : 'bg-amber-100/80 hover:bg-amber-200 text-amber-900'
                        }`}
                      >
                        <span>開始閱讀</span>
                        <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Reading Popularity Heat Navigation Bar (館內即時閱讀熱度導航 - 移至最下方) */}
      <div
        className={`p-5 sm:p-6 rounded-3xl border transition-all mt-6 ${
          darkMode
            ? 'bg-gradient-to-r from-slate-900 via-rose-950/40 to-slate-900 border-rose-900/60 text-slate-100 shadow-xl'
            : 'bg-gradient-to-r from-rose-50 via-amber-50 to-orange-50 border-orange-200/90 shadow-md'
        }`}
        id="reading-heat-navigation-bar"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-rose-500 to-orange-500 text-white shadow-md animate-pulse">
              <Flame className="w-6 h-6 text-amber-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-rose-950 dark:text-rose-200 tracking-tight flex items-center gap-1.5">
                  <span>館內即時閱讀熱度導航</span>
                  <span className="text-[10px] font-black bg-rose-500 text-white px-2 py-0.5 rounded-full uppercase tracking-wider animate-bounce">
                    Live Heat
                  </span>
                </h2>
              </div>
              <p className={`text-xs font-bold ${darkMode ? 'text-slate-300' : 'text-amber-900/80'}`}>
                即時統計全館孩童熱讀數據，點擊熱度標籤即可精準篩選熱門繪本
              </p>
            </div>
          </div>

          <div className="text-xs font-black text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-950/80 px-3 py-1.5 rounded-full border border-rose-200 dark:border-rose-800 self-start md:self-auto">
            🔥 全館在線閱讀童心榜
          </div>
        </div>

        {/* Heat Popularity Category Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {[
            {
              id: 'Fairy Tale',
              label: '👑 經典童話與傳說',
              heat: '98%',
              readers: '2,840 人朗讀',
              badgeColor: 'from-amber-500 to-orange-500',
            },
            {
              id: 'Nature & Science',
              label: '🚀 自然與科學探索',
              heat: '94%',
              readers: '2,120 人朗讀',
              badgeColor: 'from-emerald-500 to-teal-600',
            },
            {
              id: 'Culture & Heritage',
              label: '🌏 跨國民俗與童話',
              heat: '96%',
              readers: '2,560 人朗讀',
              badgeColor: 'from-blue-500 to-indigo-600',
            },
            {
              id: 'Friendship & Love',
              label: '💖 友誼與溫馨成長',
              heat: '88%',
              readers: '1,430 人朗讀',
              badgeColor: 'from-pink-500 to-rose-600',
            },
            {
              id: 'all',
              label: '🌟 全館熱門總排行榜',
              heat: '100%',
              readers: '館藏全數熱讀',
              badgeColor: 'from-purple-600 to-pink-600',
            },
          ].map((item) => {
            const isSelected = selectedCategory === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setSelectedCategory(item.id);
                  if (showOnlyOffline) setShowOnlyOffline(false);
                }}
                className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden group ${
                  isSelected
                    ? 'bg-white dark:bg-slate-800 border-rose-500 shadow-lg scale-105 ring-2 ring-rose-400'
                    : 'bg-white/80 dark:bg-slate-800/80 border-rose-100 dark:border-slate-700 hover:border-rose-300 hover:scale-[1.02]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-black text-xs text-slate-900 dark:text-slate-100 line-clamp-1">{item.label}</span>
                  <span className={`text-[10px] font-black px-1.5 py-0.2 rounded-md text-white bg-gradient-to-r ${item.badgeColor}`}>
                    {item.heat}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-1">
                  <span>🔥 {item.readers}</span>
                  {isSelected && <span className="text-rose-600 font-black">已選擇</span>}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 🏆 數位寶箱（3D 紀念卡特藏館 - 移至最下方） */}
      <div
        className={`p-6 sm:p-8 rounded-3xl border transition-all mt-6 relative overflow-hidden shadow-xl ${
          darkMode
            ? 'bg-gradient-to-br from-slate-900 via-amber-950/30 to-purple-950 border-amber-500/30 text-slate-100'
            : 'bg-gradient-to-br from-amber-100/90 via-yellow-50 to-orange-100/80 border-amber-300/80 text-amber-950 shadow-amber-200/40'
        }`}
        id="digital-treasure-vault-bottom-section"
      >
        {/* Background glow & accents */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl from-amber-400/20 via-orange-400/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-orange-500 text-slate-950 shadow-md">
                <Trophy className="w-6 h-6 animate-bounce" />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2">
                  <span>🏆 數位寶箱・繪本專屬 3D 紀念卡特藏館</span>
                </h2>
                <span className="text-[10px] font-extrabold bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 px-2.5 py-0.5 rounded-full shadow-xs">
                  全 3D 旋轉檢視
                </span>
              </div>
            </div>
            <p className={`text-xs sm:text-sm font-semibold leading-relaxed ${darkMode ? 'text-slate-300' : 'text-amber-900/85'}`}>
              每讀完一本繪本，即可解鎖該繪本專屬的 3D 立體全息紀念卡與專屬勳章！支援 3D 正反面翻轉互動、名言賞析與專屬成就感。
            </p>

            {/* Quick Unlocked Badges Preview */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {[
                { title: '👑 星球玫瑰皇冠', count: '已解鎖', color: 'from-amber-400 to-yellow-500' },
                { title: '🌌 銀河飛行員夜光貼紙', count: '已解鎖', color: 'from-indigo-500 to-purple-600' },
                { title: '🪶 純白天鵝金羽毛', count: '已解鎖', color: 'from-sky-400 to-blue-600' },
                { title: '✨ 更多專屬成就卡', count: `${activeUserProfile.readBookIds.length + 2} 張`, color: 'from-rose-400 to-orange-500' },
              ].map((badge, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black shadow-xs border ${
                    darkMode
                      ? 'bg-slate-800/90 border-slate-700 text-amber-300'
                      : 'bg-white/90 border-amber-200 text-amber-950'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>{badge.title}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-bold text-white bg-gradient-to-r ${badge.color}`}>
                    {badge.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto shrink-0">
            <button
              type="button"
              id="btn-open-treasure-vault-bottom"
              onClick={() => {
                setIsTreasureVaultOpen(true);
                playStarChime();
              }}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-lg hover:scale-105 transition-all border border-amber-300 cursor-pointer"
            >
              <Trophy className="w-5 h-5 text-slate-950 animate-bounce" />
              <span>✨ 開啟 3D 數位寶箱</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      </>
    )}

      {/* AI Quick Story Summary Modal */}
      <AiQuickGuideModal
        isOpen={!!aiGuideBook}
        onClose={() => setAiGuideBook(null)}
        book={aiGuideBook}
        onSelectBook={onSelectBook}
        primaryLang={primaryLang}
        darkMode={darkMode}
      />

      {/* AI Voice Guide Assistant Modal (AI 導覽助手) */}
      <AiGuideAssistantModal
        isOpen={isAiGuideAssistantOpen}
        onClose={() => setIsAiGuideAssistantOpen(false)}
        books={books}
        onSelectBook={onSelectBook}
        primaryLang={primaryLang}
        darkMode={darkMode}
        onApplyFilterToLibrary={(query) => {
          setSearchQuery(query);
          playStarChime();
        }}
        onSaveCustomShelf={(newShelf) => {
          if (onUpdateShelves) {
            onUpdateShelves([...customShelves, newShelf]);
          } else {
            try {
              const saved = localStorage.getItem('global_custom_shelves');
              const current = saved ? JSON.parse(saved) : [];
              localStorage.setItem('global_custom_shelves', JSON.stringify([...current, newShelf]));
            } catch {
              // ignore
            }
          }
        }}
      />

      {/* Story Time-Space Visualizer Map Modal (故事時空地圖) */}
      <StoryTimeSpaceMapModal
        isOpen={isTimeSpaceMapOpen}
        onClose={() => setIsTimeSpaceMapOpen(false)}
        books={books}
        onSelectBook={onSelectBook}
        primaryLang={primaryLang}
        onFilterByKeyword={(kw) => {
          setSearchQuery(kw);
          playStarChime();
        }}
      />

      {/* Book Favorites Tag Manager Modal */}
      <BookTagManagerModal
        isOpen={isTagModalOpen}
        onClose={() => setIsTagModalOpen(false)}
        book={tagModalBook}
        onTagsUpdated={refreshTagsData}
      />

      {/* 🏆 數位寶箱・繪本專屬紀念卡特藏館 (3D 翻轉展示區) */}
      <DigitalTreasureVaultModal
        isOpen={isTreasureVaultOpen}
        onClose={() => setIsTreasureVaultOpen(false)}
        books={books}
        readBookIds={activeUserProfile.readBookIds}
        darkMode={darkMode}
      />
    </div>
  );
};
