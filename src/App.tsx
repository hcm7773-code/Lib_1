import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LibraryView } from './components/LibraryView';
import { BookReaderView } from './components/BookReaderView';
import { BookCreatorView } from './components/BookCreatorView';
import { WordBankView } from './components/WordBankView';
import { ProfileView } from './components/ProfileView';
import { SettingsModal } from './components/SettingsModal';
import { PersonalizedBookshelf } from './components/PersonalizedBookshelf';
import { GoalCelebrationModal } from './components/GoalCelebrationModal';
import { OfflineAnalyticsModal } from './components/OfflineAnalyticsModal';
import { MoodJournalModal } from './components/MoodJournalModal';
import { DailyGoalProgressBar } from './components/DailyGoalProgressBar';
import { YesterdayReadingRecapModal } from './components/YesterdayReadingRecapModal';
import { InteractiveCharacterPuzzleModal } from './components/InteractiveCharacterPuzzleModal';
import { DailyVoiceSummaryModal } from './components/DailyVoiceSummaryModal';
import { AchievementShowcaseWallModal } from './components/AchievementShowcaseWallModal';
import { OfflineBookshelfManagerModal } from './components/OfflineBookshelfManagerModal';
import { LearningAnalyticsOverviewModal } from './components/LearningAnalyticsOverviewModal';
import { ResumeReadingPromptBanner } from './components/ResumeReadingPromptBanner';
import { PersonalReadingAchievementsModal } from './components/PersonalReadingAchievementsModal';
import { PersonalReadingProgressOverviewModal } from './components/PersonalReadingProgressOverviewModal';

import { Book, ReaderSettings, UserProfile, UserWord, VocabItem, UserBadge, CustomShelf, MoodJournalEntry } from './types';
import { INITIAL_BOOKS } from './data/books';
import { getCollectiblesForBook, INITIAL_DEFAULT_COLLECTIBLES } from './data/collectibles';
import {
  getDownloadedBookIds,
  isBookDownloaded,
  saveBookForOffline,
  removeOfflineBook,
  cacheRecentlyReadBook,
} from './utils/offlineStorage';

const DEFAULT_SETTINGS: ReaderSettings = {
  primaryLang: 'zh-TW',
  secondaryLang: 'en',
  showDualText: true,
  fontSize: 'md',
  dyslexicFont: false,
  speechRate: 1.0,
  autoPlayAudio: false,
  bgMusic: false,
  soundEffects: true,
};

const DEFAULT_BADGES: UserBadge[] = [
  {
    id: 'badge-1',
    name: '初級小讀者',
    description: '完成閱讀第一本數位繪本故事',
    icon: '📖',
    unlocked: true,
    unlockedAt: '2026-08-05',
    category: 'reading',
    unlockCondition: '完讀任一首本繪本',
    rarity: '普通',
  },
  {
    id: 'badge-2',
    name: '多語言天才',
    description: '切換並朗讀英文、日文或韓文雙語對照',
    icon: '🌐',
    unlocked: true,
    unlockedAt: '2026-08-06',
    category: 'reading',
    unlockCondition: '在閱讀器中使用雙語切換模式並聆聽語音朗讀',
    rarity: '稀有',
  },
  {
    id: 'badge-3',
    name: '繪本小作家',
    description: '使用 AI 工坊生成原創專屬繪本',
    icon: '🪄',
    unlocked: true,
    unlockedAt: '2026-08-07',
    category: 'ai',
    unlockCondition: '進入 AI 繪本創作工坊並發佈 1 本新繪本',
    rarity: '史詩',
  },
  {
    id: 'badge-4',
    name: '生字霸主',
    description: '生字本中累積收集超過 5 個故事重點詞彙',
    icon: '⭐',
    unlocked: false,
    category: 'vocab',
    unlockCondition: '在點擊繪本關鍵字時儲存至個人生字本達到 5 個',
    rarity: '普通',
  },
  {
    id: 'badge-5',
    name: '故事小偵探',
    description: '完成 AI 繪本隨堂問答且獲得滿分',
    icon: '🦉',
    unlocked: true,
    unlockedAt: '2026-08-07',
    category: 'ai',
    unlockCondition: '在任意繪本中開啟 AI 測驗問答並全對完成',
    rarity: '史詩',
  },
  {
    id: 'badge-6',
    name: '連續閱讀王',
    description: '保持連續 3 天以上的天天閱讀好習慣',
    icon: '🔥',
    unlocked: true,
    unlockedAt: '2026-08-07',
    category: 'reading',
    unlockCondition: '每日登入並進行閱讀累積 3 天不間斷',
    rarity: '稀有',
  },
  {
    id: 'badge-7',
    name: '夜間故事探險家',
    description: '累積閱讀時間超過 30 分鐘',
    icon: '🌙',
    unlocked: false,
    category: 'reading',
    unlockCondition: '個人總閱讀時間達到 30 分鐘以上',
    rarity: '傳奇',
  },
  {
    id: 'badge-8',
    name: 'AI 伴讀摯友',
    description: '與 AI 故事小夥伴進行超過 5 次發問互動',
    icon: '🤖',
    unlocked: true,
    unlockedAt: '2026-08-07',
    category: 'ai',
    unlockCondition: '在繪本閱讀頁點擊右下角貓頭鷹夥伴提問 5 次',
    rarity: '傳奇',
  },
  {
    id: 'badge-9',
    name: '七日目標破風者',
    description: '過去 7 天每日閱讀目標達成率皆達 100% 以上',
    icon: '📈',
    unlocked: true,
    unlockedAt: '2026-08-08',
    category: 'reading',
    unlockCondition: '連續 7 天達成或超越每日設定之閱讀目標時間',
    rarity: '傳奇',
  },
  {
    id: 'badge-10',
    name: '深度共讀哲學家',
    description: '累積單日沉浸共讀時數超過 45 分鐘',
    icon: '⏳',
    unlocked: false,
    category: 'reading',
    unlockCondition: '單日累計閱讀時數達到 45 分鐘以上',
    rarity: '史詩',
  },
  {
    id: 'badge-11',
    name: '多語聲控小主播',
    description: '使用語音朗讀與角色配音進行超過 10 次朗讀伴讀',
    icon: '🎙️',
    unlocked: true,
    unlockedAt: '2026-08-07',
    category: 'reading',
    unlockCondition: '在繪本閱讀中開啟語音雙語伴讀與角色配音共讀 10 次',
    rarity: '稀有',
  },
  {
    id: 'badge-12',
    name: '故事博覽大師',
    description: '閱讀遍及 5 種不同主題類型（冒險、科普、童話、友誼、AI原創）',
    icon: '🏅',
    unlocked: true,
    unlockedAt: '2026-08-08',
    category: 'reading',
    unlockCondition: '在繪本館中閱讀探索 5 種不同領域主題繪本',
    rarity: '傳奇',
  },
];

const DEFAULT_PROFILE: UserProfile = {
  name: '歡樂小熊',
  avatar: '🐻',
  stars: 15,
  readBookIds: ['book-1'],
  favoriteBookIds: ['book-1'],
  badges: DEFAULT_BADGES,
  readingMinutes: 25,
  streakDays: 3,
  dailyGoalMinutes: 15,
  readingHistory: [
    {
      id: 'log-1',
      bookId: 'book-1',
      bookTitle: '小王子與星空狐狸',
      coverUrl: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?q=80&w=400',
      lastPageRead: 3,
      totalPages: 3,
      progressPercent: 100,
      timeSpentMinutes: 12,
      lastReadAt: new Date().toLocaleDateString('zh-TW'),
      completed: true,
    },
    {
      id: 'log-2',
      bookId: 'book-2',
      bookTitle: '三隻小豬的環保綠建築',
      coverUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=400',
      lastPageRead: 2,
      totalPages: 3,
      progressPercent: 66,
      timeSpentMinutes: 8,
      lastReadAt: new Date().toLocaleDateString('zh-TW'),
      completed: false,
    },
  ],
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'library' | 'bookshelf' | 'creator' | 'wordbank' | 'profile'>('library');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [startPageNum, setStartPageNum] = useState<number>(1);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isGoalCelebrationOpen, setIsGoalCelebrationOpen] = useState(false);
  const [isOfflineAnalyticsOpen, setIsOfflineAnalyticsOpen] = useState(false);
  const [isMoodJournalOpen, setIsMoodJournalOpen] = useState(false);
  const [isYesterdayRecapOpen, setIsYesterdayRecapOpen] = useState<boolean>(() => {
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const lastSeen = localStorage.getItem('wcdl_last_recap_seen');
      if (lastSeen !== todayStr) {
        localStorage.setItem('wcdl_last_recap_seen', todayStr);
        return true; // Auto open on daily launch!
      }
      return false;
    } catch {
      return true;
    }
  });
  const [isCharacterPuzzleOpen, setIsCharacterPuzzleOpen] = useState<boolean>(false);
  const [isVoiceSummaryOpen, setIsVoiceSummaryOpen] = useState<boolean>(false);
  const [isAchievementWallOpen, setIsAchievementWallOpen] = useState<boolean>(false);
  const [isOfflineBookshelfOpen, setIsOfflineBookshelfOpen] = useState<boolean>(false);
  const [isLearningAnalyticsOpen, setIsLearningAnalyticsOpen] = useState<boolean>(false);
  const [isPersonalAchievementsOpen, setIsPersonalAchievementsOpen] = useState<boolean>(false);
  const [isProgressOverviewOpen, setIsProgressOverviewOpen] = useState<boolean>(false);
  const [creatorInitialPrompt, setCreatorInitialPrompt] = useState<string>('');

  // Custom Shelves State
  const [customShelves, setCustomShelves] = useState<CustomShelf[]>(() => {
    try {
      const saved = localStorage.getItem('global_custom_shelves');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const handleUpdateShelves = (newShelves: CustomShelf[]) => {
    setCustomShelves(newShelves);
    try {
      localStorage.setItem('global_custom_shelves', JSON.stringify(newShelves));
    } catch (e) {}
  };

  // PWA Offline & Network States
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [downloadedBookIds, setDownloadedBookIds] = useState<string[]>(() => getDownloadedBookIds());

  // Listen to network online/offline transitions & auto pre-cache initial books
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Pre-cache first 4 initial books into PWA offline storage
    INITIAL_BOOKS.slice(0, 4).forEach((b) => {
      saveBookForOffline(b);
    });
    setDownloadedBookIds(getDownloadedBookIds());

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleToggleDownloadBook = (book: Book) => {
    if (isBookDownloaded(book.id)) {
      removeOfflineBook(book.id);
    } else {
      saveBookForOffline(book);
    }
    setDownloadedBookIds(getDownloadedBookIds());
  };

  // Persistent States
  const [books, setBooks] = useState<Book[]>(() => {
    try {
      const saved = localStorage.getItem('wcdl_books');
      if (saved) {
        const customBooks = JSON.parse(saved);
        return [...INITIAL_BOOKS, ...customBooks];
      }
    } catch (e) {
      console.warn('Failed to load books from localStorage', e);
    }
    return INITIAL_BOOKS;
  });

  const [savedWords, setSavedWords] = useState<UserWord[]>(() => {
    try {
      const saved = localStorage.getItem('wcdl_user_words');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load words from localStorage', e);
    }
    return [
      {
        id: 'w-1',
        word: '星球',
        phonetic: 'xīng qiú',
        translation: 'Planet / Asteroid',
        definition: '宇宙中像地球一樣的星體',
        exampleSentence: '小王子的星球非常可愛。',
        bookId: 'book-1',
        bookTitle: '小王子與星空狐狸',
        pageNumber: 1,
        addedAt: new Date().toLocaleDateString('zh-TW'),
        mastered: true,
      },
      {
        id: 'w-2',
        word: '太陽能',
        phonetic: 'tài yáng néng',
        translation: 'Solar Energy',
        definition: '利用太陽光轉化為乾淨的電力',
        exampleSentence: '太陽能是非常環保的能源。',
        bookId: 'book-2',
        bookTitle: '三隻小豬的環保綠建築',
        pageNumber: 2,
        addedAt: new Date().toLocaleDateString('zh-TW'),
        mastered: false,
      },
    ];
  });

  const [settings, setSettings] = useState<ReaderSettings>(() => {
    try {
      const saved = localStorage.getItem('wcdl_settings');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load settings from localStorage', e);
    }
    return DEFAULT_SETTINGS;
  });

  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('wcdl_profile');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load profile from localStorage', e);
    }
    return DEFAULT_PROFILE;
  });

  // Save to localStorage when state updates
  useEffect(() => {
    try {
      const customOnly = books.filter((b) => b.isCustom);
      localStorage.setItem('wcdl_books', JSON.stringify(customOnly));
    } catch (e) {}
  }, [books]);

  useEffect(() => {
    try {
      localStorage.setItem('wcdl_user_words', JSON.stringify(savedWords));
    } catch (e) {}
  }, [savedWords]);

  useEffect(() => {
    try {
      localStorage.setItem('wcdl_settings', JSON.stringify(settings));
    } catch (e) {}
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem('wcdl_profile', JSON.stringify(userProfile));
    } catch (e) {}
  }, [userProfile]);

  // Handlers
  const handleAwardStar = (amount: number) => {
    setUserProfile((prev) => ({ ...prev, stars: prev.stars + amount }));
  };

  const handleDeductStars = (amount: number) => {
    setUserProfile((prev) => ({ ...prev, stars: Math.max(0, prev.stars - amount) }));
  };

  const handleAddMoodEntry = (entry: MoodJournalEntry, bonusStars: number = 5) => {
    setUserProfile((prev) => {
      const existing = prev.moodJournal || [];
      return {
        ...prev,
        stars: prev.stars + bonusStars,
        moodJournal: [entry, ...existing],
      };
    });
  };

  const handleDeleteMoodEntry = (entryId: string) => {
    setUserProfile((prev) => ({
      ...prev,
      moodJournal: (prev.moodJournal || []).filter((e) => e.id !== entryId),
    }));
  };

  const handleSelectBook = (book: Book, startPage: number = 1) => {
    cacheRecentlyReadBook(book);
    setDownloadedBookIds(getDownloadedBookIds());
    setSelectedBook(book);
    setStartPageNum(startPage);
  };

  const handleUpdateReadingProgress = (
    bookId: string,
    pageNum: number,
    timeMinutesSpent: number,
    isFinished: boolean
  ) => {
    const matchedBook = books.find((b) => b.id === bookId);
    if (!matchedBook) return;

    const todayStr = new Date().toLocaleDateString('zh-TW');

    setUserProfile((prev) => {
      const history = prev.readingHistory || [];
      const existingIdx = history.findIndex((h) => h.bookId === bookId);
      const totalPages = matchedBook.pages.length;
      const progressPercent = Math.round((pageNum / totalPages) * 100);

      const updatedLog = {
        id: existingIdx >= 0 ? history[existingIdx].id : `log-${Date.now()}`,
        bookId,
        bookTitle: matchedBook.title['zh-TW'] || matchedBook.title.en,
        coverUrl: matchedBook.coverUrl,
        lastPageRead: pageNum,
        totalPages,
        progressPercent,
        timeSpentMinutes: (existingIdx >= 0 ? history[existingIdx].timeSpentMinutes : 0) + timeMinutesSpent,
        lastReadAt: todayStr,
        completed: isFinished || progressPercent >= 100,
      };

      const newHistory = existingIdx >= 0
        ? history.map((item, idx) => (idx === existingIdx ? updatedLog : item))
        : [updatedLog, ...history];

      const newReadingMinutes = prev.readingMinutes + timeMinutesSpent;
      const targetGoal = prev.dailyGoalMinutes || 15;
      const isGoalJustReached = newReadingMinutes >= targetGoal && prev.lastGoalBonusClaimedDate !== todayStr;

      if (isGoalJustReached) {
        setTimeout(() => {
          setIsGoalCelebrationOpen(true);
        }, 600);
      }

      return {
        ...prev,
        readingMinutes: newReadingMinutes,
        readingHistory: newHistory,
        stars: isGoalJustReached ? prev.stars + 20 : prev.stars,
        lastGoalBonusClaimedDate: isGoalJustReached ? todayStr : prev.lastGoalBonusClaimedDate,
      };
    });
  };

  const handleToggleFavorite = (bookId: string) => {
    setUserProfile((prev) => {
      const isFav = prev.favoriteBookIds.includes(bookId);
      const newFavs = isFav
        ? prev.favoriteBookIds.filter((id) => id !== bookId)
        : [...prev.favoriteBookIds, bookId];
      return { ...prev, favoriteBookIds: newFavs };
    });
  };

  const handleFinishBook = (bookId: string) => {
    setUserProfile((prev) => {
      const newRead = Array.from(new Set([ ...prev.readBookIds, bookId ]));
      
      // Check Badge 1
      const updatedBadges = prev.badges.map((b) => {
        if (b.id === 'badge-1' && !b.unlocked) {
          return { ...b, unlocked: true };
        }
        return b;
      });

      // Generate book-themed digital souvenir collectibles
      const finishedBook = books.find((b) => b.id === bookId);
      let updatedCollectibles = prev.collectibles ? [...prev.collectibles] : [...INITIAL_DEFAULT_COLLECTIBLES];
      
      if (finishedBook) {
        const newCollectibles = getCollectiblesForBook(finishedBook);
        newCollectibles.forEach((item) => {
          if (!updatedCollectibles.some((c) => c.id === item.id)) {
            updatedCollectibles.push(item);
          }
        });
      }

      return {
        ...prev,
        readBookIds: newRead,
        badges: updatedBadges,
        collectibles: updatedCollectibles,
      };
    });
  };

  function newSet(arr: string[]) {
    return Array.from(new Set(arr));
  }

  const handleAddWord = (vocab: VocabItem, pageNumber: number) => {
    if (!selectedBook) return;
    const exists = savedWords.some((w) => w.word === vocab.word);
    if (exists) return;

    const newWord: UserWord = {
      ...vocab,
      id: `word-${Date.now()}`,
      bookId: selectedBook.id,
      bookTitle: selectedBook.title['zh-TW'] || selectedBook.title['en'],
      pageNumber,
      addedAt: new Date().toLocaleDateString('zh-TW'),
      mastered: false,
    };

    const newWords = [newWord, ...savedWords];
    setSavedWords(newWords);

    // Check Badge 4
    if (newWords.length >= 5) {
      setUserProfile((prev) => ({
        ...prev,
        badges: prev.badges.map((b) => (b.id === 'badge-4' ? { ...b, unlocked: true } : b)),
      }));
    }
  };

  const handleToggleMasteredWord = (wordId: string) => {
    setSavedWords((prev) =>
      prev.map((w) => (w.id === wordId ? { ...w, mastered: !w.mastered } : w))
    );
  };

  const handleRemoveWord = (wordId: string) => {
    setSavedWords((prev) => prev.filter((w) => w.id !== wordId));
  };

  const handleBookCreated = (newBook: Book) => {
    setBooks((prev) => [newBook, ...prev]);

    // Check Badge 3
    setUserProfile((prev) => ({
      ...prev,
      badges: prev.badges.map((b) => (b.id === 'badge-3' ? { ...b, unlocked: true } : b)),
    }));
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 flex flex-col font-sans ${
      settings.darkMode
        ? 'bg-slate-950 text-slate-100 selection:bg-amber-500 selection:text-white'
        : 'bg-amber-50/50 text-amber-950 selection:bg-amber-300 selection:text-amber-950'
    }`}>
      
      {/* Navbar (hidden when reader is fullscreen) */}
      {!selectedBook && (
        <>
          <Navbar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            userProfile={userProfile}
            onOpenSettings={() => setIsSettingsOpen(true)}
            customBooksCount={books.filter((b) => b.isCustom).length}
            userWordsCount={savedWords.length}
            darkMode={settings.darkMode}
            onToggleTheme={() =>
              setSettings((prev) => ({ ...prev, darkMode: !prev.darkMode }))
            }
            isOnline={isOnline}
            offlineBooksCount={downloadedBookIds.length}
            onOpenOfflineAnalytics={() => setIsOfflineAnalyticsOpen(true)}
            onOpenYesterdayRecap={() => setIsYesterdayRecapOpen(true)}
            onOpenCharacterPuzzle={() => setIsCharacterPuzzleOpen(true)}
            onOpenVoiceSummary={() => setIsVoiceSummaryOpen(true)}
            onOpenAchievementWall={() => setIsAchievementWallOpen(true)}
            onOpenOfflineBookshelfManager={() => setIsOfflineBookshelfOpen(true)}
            onOpenLearningAnalytics={() => setIsLearningAnalyticsOpen(true)}
            onOpenPersonalAchievements={() => setIsPersonalAchievementsOpen(true)}
            onOpenProgressOverview={() => setIsProgressOverviewOpen(true)}
          />

          {/* 🚀 未完成繪本跨裝置/重新整理進度提示橫幅 (Resume Reading Prompt Banner) */}
          <ResumeReadingPromptBanner
            books={books}
            userProfile={userProfile}
            onSelectBook={(book, page) => handleSelectBook(book, page)}
            onOpenProgressOverview={() => setIsProgressOverviewOpen(true)}
            darkMode={settings.darkMode}
          />
        </>
      )}

      {/* Main Body */}
      <div className="flex-1">
        {selectedBook ? (
          <BookReaderView
            book={selectedBook}
            onBack={() => setSelectedBook(null)}
            settings={settings}
            onAddWord={handleAddWord}
            savedWords={savedWords}
            onFinishBook={handleFinishBook}
            userStars={userProfile.stars}
            onAwardStar={handleAwardStar}
            onUpdateReadingProgress={handleUpdateReadingProgress}
            initialPageNum={startPageNum}
            onOpenMoodJournal={() => setIsMoodJournalOpen(true)}
            downloadedBookIds={downloadedBookIds}
            onToggleDownloadBook={handleToggleDownloadBook}
            profile={userProfile}
            onUpdateProfile={setUserProfile}
            onOpenVoiceSummary={() => setIsVoiceSummaryOpen(true)}
            onOpenAchievementWall={() => setIsAchievementWallOpen(true)}
          />
        ) : (
          <>
            {activeTab === 'library' && (
              <LibraryView
                books={books}
                onSelectBook={(book) => handleSelectBook(book, 1)}
                onOpenCreator={() => setActiveTab('creator')}
                primaryLang={settings.primaryLang}
                favoriteBookIds={userProfile.favoriteBookIds}
                onToggleFavorite={handleToggleFavorite}
                darkMode={settings.darkMode}
                downloadedBookIds={downloadedBookIds}
                onToggleDownloadBook={handleToggleDownloadBook}
                isOnline={isOnline}
                customShelves={customShelves}
                onUpdateShelves={handleUpdateShelves}
                readBookIds={userProfile.readBookIds}
                userProfile={userProfile}
              />
            )}

            {activeTab === 'bookshelf' && (
              <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
                <PersonalizedBookshelf
                  books={books}
                  customShelves={customShelves}
                  onUpdateShelves={handleUpdateShelves}
                  favoriteBookIds={userProfile.favoriteBookIds}
                  downloadedBookIds={downloadedBookIds}
                  primaryLang={settings.primaryLang}
                  onSelectBook={(book) => handleSelectBook(book, 1)}
                  darkMode={settings.darkMode}
                />
              </div>
            )}

            {activeTab === 'creator' && (
              <BookCreatorView
                onBookCreated={handleBookCreated}
                onSelectBook={(book) => handleSelectBook(book, 1)}
                onAwardStar={handleAwardStar}
                initialPrompt={creatorInitialPrompt}
              />
            )}

            {activeTab === 'wordbank' && (
              <WordBankView
                userWords={savedWords}
                onToggleMastered={handleToggleMasteredWord}
                onRemoveWord={handleRemoveWord}
                onAwardStar={handleAwardStar}
                darkMode={settings.darkMode}
              />
            )}

            {activeTab === 'profile' && (
              <ProfileView
                profile={userProfile}
                onUpdateProfile={setUserProfile}
                books={books}
                onSelectBook={(book, page) => handleSelectBook(book, page || 1)}
                onTriggerCelebration={() => setIsGoalCelebrationOpen(true)}
                onOpenOfflineAnalytics={() => setIsOfflineAnalyticsOpen(true)}
                onOpenMoodJournal={() => setIsMoodJournalOpen(true)}
                onOpenAchievementWall={() => setIsAchievementWallOpen(true)}
                onOpenVoiceSummary={() => setIsVoiceSummaryOpen(true)}
                onOpenLearningAnalytics={() => setIsLearningAnalyticsOpen(true)}
                onOpenOfflineBookshelfManager={() => setIsOfflineBookshelfOpen(true)}
                onOpenPersonalAchievements={() => setIsPersonalAchievementsOpen(true)}
                onOpenProgressOverview={() => setIsProgressOverviewOpen(true)}
                darkMode={settings.darkMode}
              />
            )}
          </>
        )}
      </div>

      {/* 🎯 每日閱讀目標進度條 (Daily Reading Goal Progress Bar) - 放置於頁面最下方 */}
      {!selectedBook && (
        <div className="pb-6">
          <DailyGoalProgressBar
            userProfile={userProfile}
            onUpdateProfile={setUserProfile}
            books={books}
            savedWordsCount={savedWords.length}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onOpenMoodJournal={() => setIsMoodJournalOpen(true)}
            onTriggerCelebrationModal={() => setIsGoalCelebrationOpen(true)}
            onOpenLearningAnalytics={() => setIsLearningAnalyticsOpen(true)}
            onOpenAchievementWall={() => setIsAchievementWallOpen(true)}
            darkMode={settings.darkMode}
          />
        </div>
      )}

      {/* Daily Goal Celebration Effect Modal */}
      <GoalCelebrationModal
        isOpen={isGoalCelebrationOpen}
        onClose={() => setIsGoalCelebrationOpen(false)}
        goalMinutes={userProfile.dailyGoalMinutes || 15}
        currentMinutes={userProfile.readingMinutes || 15}
        bonusStarsAwarded={20}
        darkMode={settings.darkMode}
        onNavigateToCreator={(promptSuggestion) => {
          if (promptSuggestion) {
            setCreatorInitialPrompt(promptSuggestion);
          }
          setActiveTab('creator');
          setIsGoalCelebrationOpen(false);
        }}
      />

      {/* Offline Storage Analytics Modal */}
      <OfflineAnalyticsModal
        isOpen={isOfflineAnalyticsOpen}
        onClose={() => setIsOfflineAnalyticsOpen(false)}
        onSelectBook={(book) => handleSelectBook(book, 1)}
        userProfile={userProfile}
        books={books}
        userWordsCount={savedWords.length}
        darkMode={settings.darkMode}
      />

      {/* 童心閱讀心情日記 Modal */}
      <MoodJournalModal
        isOpen={isMoodJournalOpen}
        onClose={() => setIsMoodJournalOpen(false)}
        userProfile={userProfile}
        books={books}
        onAddMoodEntry={handleAddMoodEntry}
        onDeleteMoodEntry={handleDeleteMoodEntry}
        defaultBookId={selectedBook?.id}
        darkMode={settings.darkMode}
      />

      {/* Global Accessible Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={setSettings}
        onOpenOfflineAnalytics={() => setIsOfflineAnalyticsOpen(true)}
        userStars={userProfile.stars}
        onDeductStars={handleDeductStars}
      />

      {/* 📖 昨日閱讀回顧彈窗 (Yesterday Reading Recap & Daily Learning Stats Modal) */}
      <YesterdayReadingRecapModal
        isOpen={isYesterdayRecapOpen}
        onClose={() => setIsYesterdayRecapOpen(false)}
        profile={userProfile}
        savedWords={savedWords}
        onStartTodayReading={() => {
          setActiveTab('library');
          setIsYesterdayRecapOpen(false);
        }}
        onAwardStar={handleAwardStar}
        darkMode={settings.darkMode}
      />

      {/* 🧩 互動式角色拼圖彈窗 (Interactive Story Character Jigsaw Puzzle Modal) */}
      <InteractiveCharacterPuzzleModal
        isOpen={isCharacterPuzzleOpen}
        onClose={() => setIsCharacterPuzzleOpen(false)}
        profile={userProfile}
        onAwardStar={handleAwardStar}
        onUpdateProfile={setUserProfile}
        darkMode={settings.darkMode}
      />

      {/* 📢 本日閱讀總結語音播報彈窗 (Today's Reading Summary Voice Announcement Modal) */}
      <DailyVoiceSummaryModal
        isOpen={isVoiceSummaryOpen}
        onClose={() => setIsVoiceSummaryOpen(false)}
        profile={userProfile}
        books={books}
        savedWords={savedWords}
        currentBook={selectedBook}
        currentPageNumber={startPageNum}
        onOpenAchievements={() => setIsAchievementWallOpen(true)}
        darkMode={settings.darkMode}
      />

      {/* 🏛️ 個人讀書成就榮譽展示牆彈窗 (Personal Reading Achievement Showcase Wall Modal) */}
      <AchievementShowcaseWallModal
        isOpen={isAchievementWallOpen}
        onClose={() => setIsAchievementWallOpen(false)}
        profile={userProfile}
        books={books}
        userWordsCount={savedWords.length}
        darkMode={settings.darkMode}
      />

      {/* 💾 離線書架管理與快取中心彈窗 (Offline Bookshelf Manager Modal) */}
      <OfflineBookshelfManagerModal
        isOpen={isOfflineBookshelfOpen}
        onClose={() => setIsOfflineBookshelfOpen(false)}
        books={books}
        downloadedBookIds={downloadedBookIds}
        favoriteBookIds={userProfile.favoriteBookIds || []}
        userProfile={userProfile}
        onToggleDownloadBook={handleToggleDownloadBook}
        onSelectBook={(book) => handleSelectBook(book, 1)}
        primaryLang={settings.primaryLang}
        darkMode={settings.darkMode}
      />

      {/* 📊 全方位學習數據概述彈窗 (Learning Analytics Overview Modal) */}
      <LearningAnalyticsOverviewModal
        isOpen={isLearningAnalyticsOpen}
        onClose={() => setIsLearningAnalyticsOpen(false)}
        profile={userProfile}
        books={books}
        savedWords={savedWords}
        onSelectBook={(book) => handleSelectBook(book, 1)}
        darkMode={settings.darkMode}
      />

      {/* 🌟 個人閱讀成就總覽與小狀元榮譽證書彈窗 (Personal Reading Achievements & Honors Modal) */}
      <PersonalReadingAchievementsModal
        isOpen={isPersonalAchievementsOpen}
        onClose={() => setIsPersonalAchievementsOpen(false)}
        profile={userProfile}
        books={books}
        savedWords={savedWords}
        onAwardStar={handleAwardStar}
        darkMode={settings.darkMode}
      />

      {/* 🧭 個人閱讀進度總覽彈窗 (Personal Reading Progress Overview Modal) */}
      <PersonalReadingProgressOverviewModal
        isOpen={isProgressOverviewOpen}
        onClose={() => setIsProgressOverviewOpen(false)}
        books={books}
        userProfile={userProfile}
        onSelectBook={(book, page) => handleSelectBook(book, page)}
        darkMode={settings.darkMode}
      />
    </div>
  );
}
