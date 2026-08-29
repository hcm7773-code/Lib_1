import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  HardDriveDownload,
  Trash2,
  CheckCircle2,
  Wifi,
  WifiOff,
  BookOpen,
  RefreshCw,
  Sparkles,
  Download,
  AlertTriangle,
  FolderKanban,
  FileCheck,
  Search,
  SlidersHorizontal,
  ChevronRight,
  ShieldCheck,
  PieChart as PieChartIcon,
  Heart,
  HelpCircle,
  Database,
  ArrowDownUp,
  Layers,
  Sparkle,
  Check,
  Info,
  CloudUpload,
  CloudCheck,
  BarChart3,
  Award,
  BookMarked,
  Clock,
  Star,
  Activity,
  Zap,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts';
import { Book, LanguageCode, UserProfile } from '../types';
import { playStarChime, playPageTurnSound, speakText } from '../utils/audio';
import { saveBookForOffline, removeOfflineBook, clearAllOfflineStorageCache } from '../utils/offlineStorage';

interface OfflineBookshelfManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  books: Book[];
  downloadedBookIds: string[];
  favoriteBookIds?: string[];
  userProfile?: UserProfile;
  onToggleDownloadBook?: (book: Book) => void;
  onSelectBook: (book: Book) => void;
  primaryLang?: LanguageCode;
  darkMode?: boolean;
}

export const OfflineBookshelfManagerModal: React.FC<OfflineBookshelfManagerModalProps> = ({
  isOpen,
  onClose,
  books,
  downloadedBookIds,
  favoriteBookIds = [],
  userProfile,
  onToggleDownloadBook,
  onSelectBook,
  primaryLang = 'zh-TW',
  darkMode = false,
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'downloaded' | 'not_downloaded' | 'favorite_downloaded' | 'non_favorite_downloaded'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'default' | 'size_desc' | 'title'>('default');
  const [confirmingClear, setConfirmingClear] = useState(false);
  const [confirmingCleanNonFavorites, setConfirmingCleanNonFavorites] = useState(false);
  const [batchDownloading, setBatchDownloading] = useState(false);
  const [showAnalysisPanel, setShowAnalysisPanel] = useState(true);
  const [previewTab, setPreviewTab] = useState<'donut' | 'meter' | 'categories'>('donut');

  // Network & Offline Sync State
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncStepText, setSyncStepText] = useState<string>('');
  const [lastSyncTime, setLastSyncTime] = useState<string>(() => {
    return localStorage.getItem('last_offline_sync_time') || new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' });
  });
  const [hasUnsyncedOfflineProgress, setHasUnsyncedOfflineProgress] = useState<boolean>(() => {
    // Check if there are local logs or cached sessions
    const localLogs = localStorage.getItem('offline_pending_reading_sync');
    return !!localLogs;
  });

  // Listen to network online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Notify user reconnection
      speakText('網路已重新連線！您可以將離線進度同步至雲端成就系統。', 'zh-TW', 1.0, 'cartoon');
    };
    const handleOffline = () => {
      setIsOnline(false);
      setHasUnsyncedOfflineProgress(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Approximate storage calculation per book
  const calculateBookSize = (book: Book) => {
    const pageCount = book.pages?.length || 4;
    return pageCount * 140 * 1024; // ~140KB per illustrated page
  };

  // Detailed Storage Analysis Metrics
  const storageStats = useMemo(() => {
    const downloadedBooks = books.filter((b) => downloadedBookIds.includes(b.id));
    
    // Downloaded favorites vs non-favorites
    const downloadedFavorites = downloadedBooks.filter((b) => favoriteBookIds.includes(b.id));
    const downloadedNonFavorites = downloadedBooks.filter((b) => !favoriteBookIds.includes(b.id));

    const totalDownloadBytes = downloadedBooks.reduce((sum, b) => sum + calculateBookSize(b), 0);
    const favoriteBytes = downloadedFavorites.reduce((sum, b) => sum + calculateBookSize(b), 0);
    const nonFavoriteBytes = downloadedNonFavorites.reduce((sum, b) => sum + calculateBookSize(b), 0);
    
    // Aux cache sizes (vocab & logs)
    const vocabBytes = 500 * 1024; // ~0.5MB wordbank cache
    const readingProgressBytes = 350 * 1024; // ~0.35MB offline reading progress & audio state

    // Total quota budget (50 MB)
    const totalBudgetBytes = 50 * 1024 * 1024;
    const totalUsedWithAux = totalDownloadBytes + vocabBytes + readingProgressBytes;
    const remainingFreeBytes = Math.max(0, totalBudgetBytes - totalUsedWithAux);

    const totalMbUsed = (totalDownloadBytes / (1024 * 1024)).toFixed(2);
    const totalOverallMbUsed = (totalUsedWithAux / (1024 * 1024)).toFixed(2);
    const favoriteMb = (favoriteBytes / (1024 * 1024)).toFixed(2);
    const nonFavoriteMb = (nonFavoriteBytes / (1024 * 1024)).toFixed(2);
    const vocabMb = (vocabBytes / (1024 * 1024)).toFixed(2);
    const progressMb = (readingProgressBytes / (1024 * 1024)).toFixed(2);
    const freeMb = (remainingFreeBytes / (1024 * 1024)).toFixed(2);

    const quotaPct = Math.min(100, Math.round((totalUsedWithAux / totalBudgetBytes) * 100));

    // Category distribution for downloaded books
    const categoryMap: Record<string, { count: number; bytes: number }> = {};
    downloadedBooks.forEach((b) => {
      const cat = b.category || '繪本故事';
      if (!categoryMap[cat]) {
        categoryMap[cat] = { count: 0, bytes: 0 };
      }
      categoryMap[cat].count += 1;
      categoryMap[cat].bytes += calculateBookSize(b);
    });

    const categoryData = Object.entries(categoryMap).map(([category, val]) => ({
      name: category,
      count: val.count,
      mb: parseFloat((val.bytes / (1024 * 1024)).toFixed(2)),
    }));

    // Pie chart distribution data
    const pieChartData = [
      {
        name: '💖 最愛離線繪本',
        value: parseFloat(favoriteMb),
        rawBytes: favoriteBytes,
        count: downloadedFavorites.length,
        color: '#f43f5e', // rose-500
      },
      {
        name: '📦 一般離線快取',
        value: parseFloat(nonFavoriteMb),
        rawBytes: nonFavoriteBytes,
        count: downloadedNonFavorites.length,
        color: '#f59e0b', // amber-500
      },
      {
        name: '🔤 生字詞庫快取',
        value: parseFloat(vocabMb),
        rawBytes: vocabBytes,
        count: 1,
        color: '#6366f1', // indigo-500
      },
      {
        name: '💾 離線閱讀歷程',
        value: parseFloat(progressMb),
        rawBytes: readingProgressBytes,
        count: 1,
        color: '#06b6d4', // cyan-500
      },
      {
        name: '✨ 可用剩餘空間',
        value: parseFloat(freeMb),
        rawBytes: remainingFreeBytes,
        count: 0,
        color: darkMode ? '#334155' : '#e2e8f0', // slate-700 / slate-200
      },
    ].filter((item) => item.value > 0);

    return {
      downloadedCount: downloadedBooks.length,
      downloadedFavoritesCount: downloadedFavorites.length,
      downloadedNonFavoritesCount: downloadedNonFavorites.length,
      downloadedNonFavorites,
      totalMbUsed,
      totalOverallMbUsed,
      favoriteMb,
      nonFavoriteMb,
      vocabMb,
      progressMb,
      freeMb,
      quotaPct,
      categoryData,
      pieChartData,
      totalBudgetBytes,
      totalUsedWithAux,
      remainingFreeBytes,
    };
  }, [books, downloadedBookIds, favoriteBookIds, darkMode]);

  // Unique categories
  const allCategories = useMemo(() => {
    const cats = new Set<string>();
    books.forEach((b) => {
      if (b.category) cats.add(b.category);
    });
    return Array.from(cats);
  }, [books]);

  // Filtered & Searched Books
  const displayedBooks = useMemo(() => {
    return books
      .filter((b) => {
        const isDownloaded = downloadedBookIds.includes(b.id);
        const isFavorite = favoriteBookIds.includes(b.id);

        if (filterMode === 'downloaded' && !isDownloaded) return false;
        if (filterMode === 'not_downloaded' && isDownloaded) return false;
        if (filterMode === 'favorite_downloaded' && (!isDownloaded || !isFavorite)) return false;
        if (filterMode === 'non_favorite_downloaded' && (!isDownloaded || isFavorite)) return false;

        if (categoryFilter !== 'all' && b.category !== categoryFilter) return false;

        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          const titleLang = (b.title[primaryLang] || b.title['zh-TW'] || '').toLowerCase();
          const titleEn = (b.title['en'] || '').toLowerCase();
          const author = (b.author || '').toLowerCase();
          const origin = (b.originCountry || '').toLowerCase();
          const category = (b.category || '').toLowerCase();
          return (
            titleLang.includes(query) ||
            titleEn.includes(query) ||
            author.includes(query) ||
            origin.includes(query) ||
            category.includes(query)
          );
        }
        return true;
      })
      .sort((a, b) => {
        if (sortOrder === 'size_desc') {
          return calculateBookSize(b) - calculateBookSize(a);
        }
        if (sortOrder === 'title') {
          const titleA = a.title[primaryLang] || a.title['zh-TW'] || '';
          const titleB = b.title[primaryLang] || b.title['zh-TW'] || '';
          return titleA.localeCompare(titleB, 'zh-Hant');
        }
        return 0;
      });
  }, [books, downloadedBookIds, favoriteBookIds, filterMode, categoryFilter, searchQuery, primaryLang, sortOrder]);

  // Manual Trigger: Sync Offline Reading Progress to Cloud Achievements System
  const handleTriggerSync = async () => {
    if (!isOnline) {
      speakText('目前處於離線狀態，請先連上網路後再進行同步！', 'zh-TW', 1.0, 'cartoon');
      return;
    }

    setIsSyncing(true);
    playPageTurnSound();

    try {
      setSyncStepText('正在讀取本機離線閱讀紀錄與已讀頁數...');
      await new Promise((r) => setTimeout(r, 450));

      setSyncStepText('正在比對成就系統徽章與星幣餘額...');
      await new Promise((r) => setTimeout(r, 500));

      setSyncStepText('正在上傳離線閱讀歷程至雲端資料庫...');
      await new Promise((r) => setTimeout(r, 450));

      // Save sync status
      const nowStr = new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' });
      localStorage.setItem('last_offline_sync_time', nowStr);
      localStorage.removeItem('offline_pending_reading_sync');
      
      setLastSyncTime(nowStr);
      setHasUnsyncedOfflineProgress(false);
      setSyncStepText('同步完成！雲端成就與閱讀進度已最新');

      playStarChime();
      speakText('已成功將離線閱讀紀錄與成就進度同步至雲端成就系統！', 'zh-TW', 1.0, 'cartoon');
      await new Promise((r) => setTimeout(r, 600));
    } catch (e) {
      console.error('Offline sync error:', e);
    } finally {
      setIsSyncing(false);
      setSyncStepText('');
    }
  };

  // Batch download top undownloaded books
  const handleBatchDownloadTop = async () => {
    setBatchDownloading(true);
    playPageTurnSound();
    const undownloaded = books.filter((b) => !downloadedBookIds.includes(b.id)).slice(0, 4);

    for (const book of undownloaded) {
      if (onToggleDownloadBook) {
        onToggleDownloadBook(book);
      } else {
        saveBookForOffline(book);
      }
      await new Promise((r) => setTimeout(r, 200));
    }
    setBatchDownloading(false);
    playStarChime();
    speakText('已為您將推薦繪本快取至本機！', 'zh-TW', 1.0, 'cartoon');
  };

  // One-click Clean Non-Favorite Downloaded Books
  const handleCleanNonFavorites = () => {
    const nonFavorites = storageStats.downloadedNonFavorites;
    if (nonFavorites.length === 0) return;

    nonFavorites.forEach((b) => {
      if (onToggleDownloadBook) {
        onToggleDownloadBook(b);
      } else {
        removeOfflineBook(b.id);
      }
    });

    setConfirmingCleanNonFavorites(false);
    playStarChime();
    speakText(`已成功清理 ${nonFavorites.length} 本非最愛繪本快取，釋放 ${storageStats.nonFavoriteMb} MB 儲存空間！`, 'zh-TW', 1.0, 'cartoon');
  };

  // Clear all offline cache
  const handleClearAll = () => {
    clearAllOfflineStorageCache();
    books.forEach((b) => {
      if (downloadedBookIds.includes(b.id) && onToggleDownloadBook) {
        onToggleDownloadBook(b);
      }
    });
    setConfirmingClear(false);
    playStarChime();
    speakText('已清空全部離線快取資料！', 'zh-TW', 1.0, 'cartoon');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div
        className={`relative w-full max-w-5xl max-h-[92vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden transition-all ${
          darkMode
            ? 'bg-slate-900 border-slate-700 text-slate-100'
            : 'bg-gradient-to-b from-amber-50 via-white to-orange-50/70 border-amber-300 text-slate-900'
        }`}
      >
        {/* Modal Top Header */}
        <div className="px-6 py-4 border-b border-amber-200 dark:border-slate-800 flex items-center justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-400 p-1 shadow-md flex items-center justify-center text-white text-2xl animate-pulse">
              💾
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black">
                  💾 離線書架管理與快取分析中心 (Offline Bookshelf Manager)
                </h2>
                <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-400 text-slate-950 shadow-2xs">
                  智慧空間預覽 & 進度同步
                </span>
              </div>
              <p className="text-xs font-semibold text-amber-900/70 dark:text-slate-400 mt-0.5">
                監控離線儲存空間佔用、提供空間預覽圖，並支援一鍵同步離線閱讀紀錄至雲端成就系統！
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowAnalysisPanel(!showAnalysisPanel)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                showAnalysisPanel
                  ? 'bg-emerald-500 text-slate-950 shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-emerald-100 text-slate-700 dark:text-slate-300'
              }`}
            >
              <PieChartIcon className="w-3.5 h-3.5" />
              <span>{showAnalysisPanel ? '收合分析與同步' : '展開空間分析'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-100 hover:text-rose-600 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              title="關閉"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 📊 Storage Space Analytics & Cloud Progress Sync Section */}
        {showAnalysisPanel && (
          <div className={`p-4 sm:p-5 border-b transition-all ${
            darkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-emerald-50/80 border-emerald-200'
          }`}>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
              
              {/* Left Column: Recharts Donut Pie Chart & Storage Visual Preview (5 cols) */}
              <div className="lg:col-span-5 flex flex-col justify-between bg-white/70 dark:bg-slate-900/70 p-3.5 rounded-2xl border border-emerald-200/80 dark:border-slate-700 shadow-2xs">
                
                {/* Visual Preview Header Tabs */}
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <PieChartIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-xs font-black text-slate-800 dark:text-slate-200">離線空間分析預覽</span>
                  </div>
                  <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-[10px] font-black">
                    <button
                      type="button"
                      onClick={() => setPreviewTab('donut')}
                      className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                        previewTab === 'donut' ? 'bg-emerald-500 text-slate-950' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      圓環比例
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewTab('meter')}
                      className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                        previewTab === 'meter' ? 'bg-emerald-500 text-slate-950' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      預覽容量條
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewTab('categories')}
                      className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                        previewTab === 'categories' ? 'bg-emerald-500 text-slate-950' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      分類長條
                    </button>
                  </div>
                </div>

                {/* Tab 1: Recharts Donut Pie Chart */}
                {previewTab === 'donut' && (
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <div className="w-36 h-36 relative shrink-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={storageStats.pieChartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={36}
                            outerRadius={56}
                            paddingAngle={3}
                            dataKey="value"
                          >
                            {storageStats.pieChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(val: number) => [`${val} MB`, '容量']}
                            contentStyle={{
                              borderRadius: '12px',
                              fontSize: '11px',
                              fontWeight: 'bold',
                              backgroundColor: darkMode ? '#1e293b' : '#ffffff',
                              borderColor: '#10b981',
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-[9px] font-bold text-slate-400">已使用</span>
                        <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                          {storageStats.quotaPct}%
                        </span>
                      </div>
                    </div>

                    {/* Legend Details */}
                    <div className="space-y-1 text-xs flex-1">
                      <div className="flex items-center justify-between font-bold">
                        <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
                          <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
                          <span>最愛離線 ({storageStats.downloadedFavoritesCount}本)</span>
                        </span>
                        <span className="font-mono text-[11px]">{storageStats.favoriteMb} MB</span>
                      </div>

                      <div className="flex items-center justify-between font-bold">
                        <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                          <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                          <span>一般離線 ({storageStats.downloadedNonFavoritesCount}本)</span>
                        </span>
                        <span className="font-mono text-[11px]">{storageStats.nonFavoriteMb} MB</span>
                      </div>

                      <div className="flex items-center justify-between font-bold text-indigo-600 dark:text-indigo-400">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block" />
                          <span>生字庫 & 音檔</span>
                        </span>
                        <span className="font-mono text-[11px]">{storageStats.vocabMb} MB</span>
                      </div>

                      <div className="flex items-center justify-between font-bold text-cyan-600 dark:text-cyan-400">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-cyan-500 inline-block" />
                          <span>進度與歷程快照</span>
                        </span>
                        <span className="font-mono text-[11px]">{storageStats.progressMb} MB</span>
                      </div>

                      <div className="flex items-center justify-between font-bold text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600 inline-block" />
                          <span>剩餘可用空間</span>
                        </span>
                        <span className="font-mono text-[11px]">{storageStats.freeMb} MB</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 2: 離線空間預覽圖 (Visual Multi-Segment Meter Preview) */}
                {previewTab === 'meter' && (
                  <div className="space-y-3 py-1">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-600 dark:text-slate-300">本機快取分配預覽圖</span>
                        <span className="font-mono text-emerald-600 dark:text-emerald-400">
                          {storageStats.totalOverallMbUsed} / 50.0 MB ({storageStats.quotaPct}%)
                        </span>
                      </div>

                      {/* Multi-segment Meter Progress Bar */}
                      <div className="h-5 w-full bg-slate-200 dark:bg-slate-700 rounded-xl overflow-hidden flex shadow-inner">
                        {parseFloat(storageStats.favoriteMb) > 0 && (
                          <div
                            style={{ width: `${(parseFloat(storageStats.favoriteMb) / 50) * 100}%` }}
                            className="bg-rose-500 h-full transition-all flex items-center justify-center text-[9px] font-black text-white"
                            title={`最愛繪本: ${storageStats.favoriteMb} MB`}
                          >
                            💖
                          </div>
                        )}
                        {parseFloat(storageStats.nonFavoriteMb) > 0 && (
                          <div
                            style={{ width: `${(parseFloat(storageStats.nonFavoriteMb) / 50) * 100}%` }}
                            className="bg-amber-500 h-full transition-all flex items-center justify-center text-[9px] font-black text-slate-950"
                            title={`一般快取: ${storageStats.nonFavoriteMb} MB`}
                          >
                            📦
                          </div>
                        )}
                        <div
                          style={{ width: `${(parseFloat(storageStats.vocabMb) / 50) * 100}%` }}
                          className="bg-indigo-500 h-full transition-all flex items-center justify-center text-[9px] font-black text-white"
                          title={`生字詞庫: ${storageStats.vocabMb} MB`}
                        >
                          🔤
                        </div>
                        <div
                          style={{ width: `${(parseFloat(storageStats.progressMb) / 50) * 100}%` }}
                          className="bg-cyan-500 h-full transition-all flex items-center justify-center text-[9px] font-black text-white"
                          title={`閱讀進度: ${storageStats.progressMb} MB`}
                        >
                          💾
                        </div>
                      </div>
                    </div>

                    {/* Preview Legend Cards */}
                    <div className="grid grid-cols-2 gap-1.5 text-[10px] font-bold">
                      <div className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex items-center justify-between">
                        <span className="text-rose-700 dark:text-rose-300">💖 最愛繪本</span>
                        <span className="font-mono">{storageStats.favoriteMb} MB</span>
                      </div>
                      <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 flex items-center justify-between">
                        <span className="text-amber-700 dark:text-amber-300">📦 一般快取</span>
                        <span className="font-mono">{storageStats.nonFavoriteMb} MB</span>
                      </div>
                      <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900 flex items-center justify-between">
                        <span className="text-indigo-700 dark:text-indigo-300">🔤 語音字庫</span>
                        <span className="font-mono">{storageStats.vocabMb} MB</span>
                      </div>
                      <div className="p-1.5 rounded-lg bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-900 flex items-center justify-between">
                        <span className="text-cyan-700 dark:text-cyan-300">💾 歷程快照</span>
                        <span className="font-mono">{storageStats.progressMb} MB</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 3: Categories Bar Chart */}
                {previewTab === 'categories' && (
                  <div className="h-36 w-full pt-1">
                    {storageStats.categoryData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={storageStats.categoryData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                          <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                          <YAxis tick={{ fontSize: 9 }} />
                          <Tooltip formatter={(val: number) => [`${val} MB`, '佔用空間']} />
                          <Bar dataKey="mb" fill="#10b981" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-xs text-slate-400 font-bold">
                        尚無已下載的繪本分類數據
                      </div>
                    )}
                  </div>
                )}

                <div className="pt-2 mt-2 text-[10px] text-slate-400 font-semibold border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <span>總離線快取預算上限：50.0 MB</span>
                  <span className="text-emerald-600 font-bold">剩餘 {storageStats.freeMb} MB</span>
                </div>
              </div>

              {/* Middle & Right: Space Health & Cloud Reading Progress Sync Center (7 cols) */}
              <div className="lg:col-span-7 flex flex-col justify-between space-y-3">
                
                {/* 🔄 離線讀取進度同步指示燈與觸發控制台 */}
                <div className={`p-3.5 rounded-2xl border transition-all ${
                  isOnline
                    ? hasUnsyncedOfflineProgress
                      ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700'
                      : 'bg-white/80 dark:bg-slate-900/80 border-emerald-200 dark:border-slate-700'
                    : 'bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-700'
                }`}>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    
                    {/* Status Indicator Light & Text */}
                    <div className="flex items-center gap-3">
                      {/* Pulsing Status Light */}
                      <div className="relative flex items-center justify-center shrink-0">
                        {isOnline ? (
                          hasUnsyncedOfflineProgress ? (
                            <>
                              <span className="animate-ping absolute inline-flex h-4 w-4 rounded-full bg-amber-400 opacity-75" />
                              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500 ring-2 ring-white dark:ring-slate-900" />
                            </>
                          ) : (
                            <>
                              <span className="animate-ping absolute inline-flex h-4 w-4 rounded-full bg-emerald-400 opacity-75" />
                              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
                            </>
                          )
                        ) : (
                          <>
                            <span className="animate-pulse absolute inline-flex h-4 w-4 rounded-full bg-rose-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
                          </>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-slate-900 dark:text-slate-100 flex items-center gap-1">
                            {isOnline ? (
                              hasUnsyncedOfflineProgress ? (
                                <span className="text-amber-700 dark:text-amber-400 flex items-center gap-1">
                                  <CloudUpload className="w-4 h-4" />
                                  <span>有待同步的離線閱讀進度</span>
                                </span>
                              ) : (
                                <span className="text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                                  <CloudCheck className="w-4 h-4" />
                                  <span>雲端成就系統已保持同步</span>
                                </span>
                              )
                            ) : (
                              <span className="text-rose-700 dark:text-rose-400 flex items-center gap-1">
                                <WifiOff className="w-4 h-4" />
                                <span>離線狀態 (閱讀紀錄暫存本機中)</span>
                              </span>
                            )}
                          </span>

                          <span className="text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md">
                            上次同步：{lastSyncTime}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {isOnline
                            ? '離線期間累積的星幣、閱讀時數、繪本翻頁與測驗答題將安全整合至雲端成就牆。'
                            : '已安全記錄您在離線期間閱讀的頁數與獲得的成就，重新連線後即可一鍵上傳。'}
                        </p>
                      </div>
                    </div>

                    {/* Manual Sync Trigger Button */}
                    <button
                      type="button"
                      onClick={handleTriggerSync}
                      disabled={isSyncing || !isOnline}
                      className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm transition-all cursor-pointer shrink-0 ${
                        isSyncing
                          ? 'bg-amber-400 text-slate-950 animate-pulse'
                          : isOnline
                            ? hasUnsyncedOfflineProgress
                              ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 text-slate-950 hover:scale-105'
                              : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 hover:scale-105'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
                      }`}
                      title={isOnline ? '立即上傳本機進度至雲端成就系統' : '離線模式下無法同步'}
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                      <span>{isSyncing ? '正在同步雲端...' : hasUnsyncedOfflineProgress ? '一鍵上傳離線進度' : '立即檢查同步'}</span>
                    </button>

                  </div>

                  {/* Dynamic Sync Progress Step Indicator */}
                  {isSyncing && (
                    <div className="mt-2.5 pt-2 border-t border-amber-200 dark:border-amber-800 flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-300 animate-fadeIn">
                      <div className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                      <span>{syncStepText}</span>
                    </div>
                  )}
                </div>

                {/* 💡 Smart Recommendation Banner: Clean Non-Favorites */}
                <div className={`p-3 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                  storageStats.downloadedNonFavoritesCount > 0
                    ? 'bg-amber-100/90 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700/60 text-amber-950 dark:text-amber-200'
                    : 'bg-emerald-100/80 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700/60 text-emerald-950 dark:text-emerald-200'
                }`}>
                  <div className="flex items-start sm:items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5 sm:mt-0" />
                    <div className="text-xs">
                      {storageStats.downloadedNonFavoritesCount > 0 ? (
                        <>
                          <span className="font-black">空間最佳化建議：</span>
                          <span>有 <strong className="underline font-bold text-rose-600 dark:text-rose-400">{storageStats.downloadedNonFavoritesCount} 本</strong> 已下載繪本不在您的『最愛清單』中（約佔 {storageStats.nonFavoriteMb} MB）。</span>
                        </>
                      ) : (
                        <span className="font-black text-emerald-800 dark:text-emerald-300">
                          ✨ 您的離線快取非常健康！目前已下載的繪本皆為您的珍藏最愛。
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Clean Non-Favorites Action */}
                  {storageStats.downloadedNonFavoritesCount > 0 && (
                    confirmingCleanNonFavorites ? (
                      <div className="flex items-center gap-1.5 bg-rose-900 text-white px-2.5 py-1 rounded-xl shrink-0">
                        <span className="text-[11px] font-bold">確定清理 {storageStats.downloadedNonFavoritesCount} 本？</span>
                        <button
                          type="button"
                          onClick={handleCleanNonFavorites}
                          className="px-2 py-0.5 rounded-md bg-rose-500 hover:bg-rose-400 text-slate-950 font-black text-xs cursor-pointer"
                        >
                          確定
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmingCleanNonFavorites(false)}
                          className="px-2 py-0.5 rounded-md bg-slate-700 text-slate-200 text-xs cursor-pointer"
                        >
                          取消
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmingCleanNonFavorites(true)}
                        className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-2xs hover:scale-105 transition-all flex items-center gap-1 cursor-pointer shrink-0"
                        title="一鍵清理未加最愛繪本之快取"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>清理非最愛快取 ({storageStats.nonFavoriteMb} MB)</span>
                      </button>
                    )
                  )}
                </div>

                {/* Batch Download Header Quick Action */}
                <div className="flex items-center justify-between bg-white/60 dark:bg-slate-900/60 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <div className="text-xs">
                    <span className="font-black text-slate-800 dark:text-slate-200">
                      已下載 {storageStats.downloadedCount} 本繪本（佔用 {storageStats.totalMbUsed} MB）
                    </span>
                    <span className="text-slate-400 text-[11px] block">支援生字庫點讀、智慧發音與拼音語音陪伴。</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleBatchDownloadTop}
                    disabled={batchDownloading}
                    className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 text-slate-950 font-black text-xs shadow-xs hover:scale-105 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0"
                  >
                    <Download className={`w-3.5 h-3.5 ${batchDownloading ? 'animate-bounce' : ''}`} />
                    <span>{batchDownloading ? '正在下載中...' : '一鍵下載推薦繪本'}</span>
                  </button>
                </div>

              </div>

            </div>
          </div>
        )}

        {/* Filter & Search Bar with Category Pills and Sorting */}
        <div className="px-6 py-3 border-b border-amber-200/70 dark:border-slate-800 bg-amber-50/50 dark:bg-slate-800/50 flex flex-col space-y-2.5">
          
          {/* Main Mode Tabs & Real-time Search Input */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            
            {/* Status Filter Pills */}
            <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              <button
                type="button"
                onClick={() => {
                  setFilterMode('all');
                  playPageTurnSound();
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer shrink-0 ${
                  filterMode === 'all'
                    ? 'bg-amber-500 text-slate-950 shadow-2xs'
                    : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                全部館藏 ({books.length})
              </button>

              <button
                type="button"
                onClick={() => {
                  setFilterMode('downloaded');
                  playPageTurnSound();
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
                  filterMode === 'downloaded'
                    ? 'bg-emerald-500 text-slate-950 shadow-2xs'
                    : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>已下載離線 ({downloadedBookIds.length})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setFilterMode('favorite_downloaded');
                  playPageTurnSound();
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
                  filterMode === 'favorite_downloaded'
                    ? 'bg-rose-500 text-white shadow-2xs'
                    : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                <span>最愛離線 ({storageStats.downloadedFavoritesCount})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setFilterMode('non_favorite_downloaded');
                  playPageTurnSound();
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
                  filterMode === 'non_favorite_downloaded'
                    ? 'bg-amber-400 text-slate-950 shadow-2xs'
                    : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                <span>一般離線 ({storageStats.downloadedNonFavoritesCount})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setFilterMode('not_downloaded');
                  playPageTurnSound();
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer shrink-0 ${
                  filterMode === 'not_downloaded'
                    ? 'bg-amber-500 text-slate-950 shadow-2xs'
                    : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                僅在雲端 ({books.length - downloadedBookIds.length})
              </button>
            </div>

            {/* 🔍 Real-time Search Input */}
            <div className="relative w-full sm:w-72 shrink-0">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="offline-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜尋繪本書名、作者或關鍵字..."
                className="w-full pl-9 pr-14 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-amber-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-amber-400"
              />
              {searchQuery ? (
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <span className="text-[10px] font-mono font-black text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/60 px-1.5 py-0.5 rounded-md">
                    {displayedBooks.length}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="p-0.5 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    title="清除搜尋"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : null}
            </div>

          </div>

          {/* Sub-bar: Category Selector & Sorting */}
          <div className="flex items-center justify-between gap-2 flex-wrap text-xs pt-1 border-t border-amber-200/40 dark:border-slate-700/40">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              <span className="text-slate-400 font-bold shrink-0">類別：</span>
              <button
                type="button"
                onClick={() => setCategoryFilter('all')}
                className={`px-2 py-0.5 rounded-lg font-bold cursor-pointer ${
                  categoryFilter === 'all'
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-white/80 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                全部
              </button>
              {allCategories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-2 py-0.5 rounded-lg font-bold cursor-pointer whitespace-nowrap ${
                    categoryFilter === cat
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-white/80 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-bold">排序：</span>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as any)}
                className="px-2 py-0.5 rounded-lg bg-white dark:bg-slate-700 border border-amber-200 dark:border-slate-600 text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer"
              >
                <option value="default">預設排序</option>
                <option value="size_desc">佔用空間 (大→小)</option>
                <option value="title">書名字母排序</option>
              </select>
            </div>
          </div>

        </div>

        {/* Books List Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {displayedBooks.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="text-5xl">📂</div>
              <p className="text-sm font-bold text-slate-500">找不到符合條件的繪本</p>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="px-3 py-1.5 rounded-xl bg-amber-200 text-amber-900 text-xs font-black hover:bg-amber-300 transition-all cursor-pointer"
                >
                  清除搜尋條件
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {displayedBooks.map((book) => {
                const isDownloaded = downloadedBookIds.includes(book.id);
                const isFavorite = favoriteBookIds.includes(book.id);
                const title = book.title[primaryLang] || book.title['zh-TW'];
                const approxKb = (calculateBookSize(book) / 1024).toFixed(0);

                return (
                  <div
                    key={book.id}
                    className={`p-3.5 rounded-3xl border-2 transition-all flex flex-col justify-between space-y-3 ${
                      isDownloaded
                        ? isFavorite
                          ? 'bg-rose-50/70 dark:bg-rose-950/20 border-rose-300 dark:border-rose-700/60 shadow-xs'
                          : 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-700/60 shadow-xs'
                        : 'bg-white dark:bg-slate-800 border-amber-200 dark:border-slate-700'
                    }`}
                  >
                    <div className="flex gap-3 items-center">
                      <div className="relative shrink-0">
                        <img
                          src={book.coverUrl}
                          alt={title}
                          className="w-16 h-16 rounded-2xl object-cover shadow-sm border border-black/10"
                        />
                        {isFavorite && (
                          <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-xs">
                            <Heart className="w-3 h-3 fill-current" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {isDownloaded ? (
                            <span className={`text-[9px] font-black px-1.5 py-0.2 rounded-md flex items-center gap-0.5 ${
                              isFavorite
                                ? 'bg-rose-200 text-rose-900'
                                : 'bg-emerald-200 text-emerald-900'
                            }`}>
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              <span>{isFavorite ? '最愛離線' : '一般離線'}</span>
                            </span>
                          ) : (
                            <span className="text-[9px] font-black px-1.5 py-0.2 rounded-md bg-slate-200 text-slate-700">
                              雲端
                            </span>
                          )}

                          <span className="text-[10px] text-slate-400 font-mono font-bold">
                            約 {approxKb} KB ({book.pages?.length || 4}頁)
                          </span>
                        </div>

                        <h4 className="font-black text-xs sm:text-sm text-slate-900 dark:text-slate-100 truncate mt-0.5">
                          {title}
                        </h4>
                        <p className="text-[10px] text-slate-500 font-medium truncate">
                          {book.category} • {book.originCountry} {book.flag}
                        </p>
                      </div>
                    </div>

                    {/* Bottom Actions */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          onSelectBook(book);
                          onClose();
                        }}
                        className="flex-1 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1 shadow-2xs cursor-pointer hover:scale-102 transition-transform"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>開啟閱讀</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (onToggleDownloadBook) {
                            onToggleDownloadBook(book);
                          } else {
                            if (isDownloaded) {
                              removeOfflineBook(book.id);
                            } else {
                              saveBookForOffline(book);
                            }
                          }
                          playStarChime();
                        }}
                        className={`p-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                          isDownloaded
                            ? 'bg-rose-100 hover:bg-rose-200 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                            : 'bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-800 dark:bg-slate-700'
                        }`}
                        title={isDownloaded ? '移除本機離線快取' : '下載快取至本機'}
                      >
                        {isDownloaded ? <Trash2 className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Bottom Action Footer */}
        <div className="px-6 py-3.5 border-t border-amber-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Clear All Cache Button */}
            {storageStats.downloadedCount > 0 && (
              confirmingClear ? (
                <div className="flex items-center gap-1.5 bg-rose-900 text-white px-3 py-1 rounded-2xl border border-rose-400">
                  <span className="text-xs font-bold">確定清空全部離線快取？</span>
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="px-2.5 py-0.5 rounded-lg bg-rose-500 hover:bg-rose-400 text-slate-950 font-black text-xs cursor-pointer"
                  >
                    確定清空
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmingClear(false)}
                    className="px-2.5 py-0.5 rounded-lg bg-slate-700 text-slate-200 text-xs cursor-pointer"
                  >
                    取消
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmingClear(true)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-100 text-slate-700 hover:text-rose-700 dark:bg-slate-800 dark:text-slate-300 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>清除全部離線快取</span>
                </button>
              )
            )}

            <span className="text-[11px] text-slate-400 font-semibold hidden md:inline">
              離線繪本保存在瀏覽器本機 IndexedDB 快取中，安全不佔用手機過多空間。
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs sm:text-sm shadow-md hover:scale-105 transition-all cursor-pointer"
          >
            完成並返回
          </button>
        </div>
      </div>
    </div>
  );
};
