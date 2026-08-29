import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  ArrowLeft, Volume2, VolumeX, Play, Pause, SkipBack, SkipForward,
  Bookmark, Sparkles, MessageCircle, Globe, Languages, Lightbulb,
  CheckCircle2, Star, ChevronLeft, ChevronRight, HelpCircle, X, RotateCcw,
  Gauge, Clock, FileQuestion, FastForward, Music, Sliders, Compass, Activity, Palette, Heart,
  Download, HardDriveDownload, RefreshCw, WifiOff, Share2, Layers, Pencil, Trophy, Wand2, Brain,
  Users, Mic, MicOff, BookmarkPlus, Radio, Zap, Trash2, PlayCircle, PauseCircle, Bot
} from 'lucide-react';
import { Book, LanguageCode, ReaderSettings, VocabItem, StoryQAHistory, BgMusicTrack, SocialThemeBackground, CollectibleItem, UserProfile } from '../types';
import { THEME_CONFIGS } from '../data/socialPosts';
import { SUPPORTED_LANGUAGES, getLanguageByCode } from '../data/languages';
import { CrayonCanvasModal } from './CrayonCanvasModal';
import { StoryQuizChallengeModal } from './StoryQuizChallengeModal';
import { ARBookPreviewModal } from './ARBookPreviewModal';
import { recordFocusSession } from '../utils/readingFocusAnalytics';
import { recordReadingProgress } from '../utils/readingProgressTracker';

export interface AudioBookmark {
  id: string;
  bookId: string;
  pageNumber: number;
  audioDataUrl: string;
  createdAt: string;
  emotionEmoji: string;
  noteTitle: string;
  durationSec?: number;
}

function detectReaderThemeForBook(book: Book): SocialThemeBackground {
  const titleStr = (typeof book.title === 'string' ? book.title : (book.title['zh-TW'] || book.title.en || '')).toLowerCase();
  const category = (book.category || '').toLowerCase();

  if (titleStr.includes('小王子') || titleStr.includes('星') || titleStr.includes('宇宙') || category.includes('哲理') || category.includes('科學')) {
    return 'starry';
  }
  if (titleStr.includes('醜小鴨') || titleStr.includes('三隻小豬') || titleStr.includes('森林') || titleStr.includes('樹') || category.includes('自然') || category.includes('寓言')) {
    return 'forest';
  }
  if (titleStr.includes('愛麗絲') || titleStr.includes('城堡') || titleStr.includes('公主') || category.includes('童話')) {
    return 'castle';
  }
  if (titleStr.includes('海') || titleStr.includes('魚') || titleStr.includes('水') || titleStr.includes('鯨') || category.includes('冒險')) {
    return 'ocean';
  }
  if (titleStr.includes('糖') || titleStr.includes('甜') || category.includes('生活')) {
    return 'candy';
  }
  return 'golden';
}
import { isBookDownloaded, saveBookForOffline } from '../utils/offlineStorage';
import {
  speakText,
  stopSpeech,
  playPageTurnSound,
  playStarChime,
  playBackgroundAmbience,
  stopBackgroundAmbience,
  setBackgroundAmbienceVolume,
  getRecommendedBgMusicForCategory,
  BG_MUSIC_PLAYLIST,
} from '../utils/audio';
import { StoryQuizModal } from './StoryQuizModal';
import { StoryGuideModal } from './StoryGuideModal';
import { StoryEmotionAnalyzerModal } from './StoryEmotionAnalyzerModal';
import { ArtStyleConverterModal } from './ArtStyleConverterModal';
import { CollectibleClaimModal } from './CollectibleClaimModal';
import { StorySequelGeneratorModal } from './StorySequelGeneratorModal';
import { ReadingMoodDashboardModal } from './ReadingMoodDashboardModal';
import { OfflineAnalyticsModal } from './OfflineAnalyticsModal';
import { FloatingPomodoroTimer, PomodoroStatus } from './FloatingPomodoroTimer';
import { ReadingComprehensionMapModal } from './ReadingComprehensionMapModal';
import { StoryAchievementCardModal } from './StoryAchievementCardModal';
import { StoryCharacterRoleplayModal } from './StoryCharacterRoleplayModal';
import { PersonalFocusAchievementModal } from './PersonalFocusAchievementModal';
import { AiReadingAssistantModal } from './AiReadingAssistantModal';
import { AiCoReadingRoomModal } from './AiCoReadingRoomModal';
import { StoryContextMapModal } from './StoryContextMapModal';
import { AchievementLeaderboard } from './AchievementLeaderboard';
import { DigitalTreasureVaultModal } from './DigitalTreasureVaultModal';
import { ReadingFocusModePanel } from './ReadingFocusModePanel';
import { ReadingGuideScriptModal } from './ReadingGuideScriptModal';
import { QuickReadingNotesModal } from './QuickReadingNotesModal';
import { getCollectiblesForBook } from '../data/collectibles';

interface BookReaderViewProps {
  book: Book;
  onBack: () => void;
  settings: ReaderSettings;
  onAddWord: (word: VocabItem, pageNum: number) => void;
  savedWords: VocabItem[];
  onFinishBook: (bookId: string) => void;
  userStars: number;
  onAwardStar: (amount: number) => void;
  onUpdateReadingProgress?: (bookId: string, pageNum: number, timeMinutes: number, isFinished: boolean) => void;
  initialPageNum?: number;
  onOpenMoodJournal?: () => void;
  downloadedBookIds?: string[];
  onToggleDownloadBook?: (book: Book) => void;
  profile?: UserProfile;
  onUpdateProfile?: (updated: UserProfile) => void;
  onOpenLeaderboard?: () => void;
  onOpenVoiceSummary?: () => void;
  onOpenAchievementWall?: () => void;
}

export const BookReaderView: React.FC<BookReaderViewProps> = ({
  book,
  onBack,
  settings,
  onAddWord,
  savedWords,
  onFinishBook,
  onAwardStar,
  onUpdateReadingProgress,
  initialPageNum = 1,
  onOpenMoodJournal,
  downloadedBookIds = [],
  onToggleDownloadBook,
  profile,
  onUpdateProfile,
  onOpenLeaderboard,
  onOpenVoiceSummary,
  onOpenAchievementWall,
}) => {
  const [currentPageIndex, setCurrentPageIndex] = useState(
    initialPageNum > 0 && initialPageNum <= book.pages.length ? initialPageNum - 1 : 0
  );
  const [primaryLang, setPrimaryLang] = useState<LanguageCode>(settings.primaryLang);
  const [secondaryLang, setSecondaryLang] = useState<LanguageCode | 'none'>(settings.secondaryLang);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [speechRate, setSpeechRate] = useState<number>(settings.speechRate || 1.0);
  const [autoPlayTimer, setAutoPlayTimer] = useState<boolean>(false);
  const [spokenBoundaryIndex, setSpokenBoundaryIndex] = useState<number>(-1);

  // 🤖 AI Reading Assistant (AI 閱讀理解輔助器 & 故事世界地圖)
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);
  const [isCoReadingRoomOpen, setIsCoReadingRoomOpen] = useState(false);
  const [isContextMapOpen, setIsContextMapOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);

  // Interactive Quiz Challenge Modal State
  const [isQuizChallengeOpen, setIsQuizChallengeOpen] = useState(false);

  // 🥽 AR Expanded Reality Modal State
  const [isARModalOpen, setIsARModalOpen] = useState(false);

  // 🧠 AI Reading Comprehension Map & Story Achievement Card Modals
  const [isComprehensionMapOpen, setIsComprehensionMapOpen] = useState(false);
  const [isStoryAchievementCardOpen, setIsStoryAchievementCardOpen] = useState(false);

  // 🎁 Interactive Easter Egg Unlocks State
  const [unlockedEasterEggs, setUnlockedEasterEggs] = useState<string[]>([]);
  const [easterEggModal, setEasterEggModal] = useState<{
    show: boolean;
    title: string;
    badgeName: string;
    icon: string;
    bonusStars: number;
  }>({
    show: false,
    title: '',
    badgeName: '',
    icon: '🌟',
    bonusStars: 15,
  });

  const handleTriggerEasterEgg = (eggId: string, title: string, badgeName: string, icon: string = '🌟') => {
    if (unlockedEasterEggs.includes(eggId)) return;

    playStarChime();
    setUnlockedEasterEggs((prev) => [...prev, eggId]);

    // Auto send new Digital Badge to Profile
    if (profile && onUpdateProfile) {
      const newBadge = {
        id: `badge_easter_${eggId}_${Date.now()}`,
        name: badgeName,
        description: `解鎖《${book.title['zh-TW'] || book.title.en}》頁面隱藏彩蛋【${title}】！`,
        icon,
        unlocked: true,
        unlockedAt: new Date().toLocaleDateString('zh-TW'),
        unlockCondition: '在繪本頁面長時間探索或點擊隱藏魔法彩蛋',
        rarity: '傳奇' as const,
      };

      const existingBadges = profile.badges || [];
      if (!existingBadges.some((b) => b.name === badgeName)) {
        onUpdateProfile({
          ...profile,
          stars: profile.stars + 15,
          badges: [newBadge, ...existingBadges],
        });
      } else {
        onAwardStar(15);
      }
    } else {
      onAwardStar(15);
    }

    setEasterEggModal({
      show: true,
      title,
      badgeName,
      icon,
      bonusStars: 15,
    });
  };

  // ⏱ Reading Focus Timer States (閱讀專注計時器)
  const [focusSeconds, setFocusSeconds] = useState<number>(0);
  const [isFocusRunning, setIsFocusRunning] = useState<boolean>(true);
  const [focusTargetMinutes, setFocusTargetMinutes] = useState<number>(10);
  const [hasAwardedFocusStar, setHasAwardedFocusStar] = useState<boolean>(false);
  const [isFocusModalOpen, setIsFocusModalOpen] = useState<boolean>(false);
  const [showFocusGoalBanner, setShowFocusGoalBanner] = useState<boolean>(false);

  // 📖 Page Turning Smooth Animation State (流暢翻頁轉場)
  const [isPageTurning, setIsPageTurning] = useState<boolean>(false);

  // Focus Timer Ticking Loop
  useEffect(() => {
    let interval: any = null;
    if (isFocusRunning) {
      interval = setInterval(() => {
        setFocusSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isFocusRunning]);

  // Handle Focus Goal Reached
  useEffect(() => {
    const targetSecs = focusTargetMinutes * 60;
    if (focusSeconds >= targetSecs && !hasAwardedFocusStar && targetSecs > 0) {
      setHasAwardedFocusStar(true);
      setShowFocusGoalBanner(true);
      playStarChime();
      onAwardStar(10);
    }
  }, [focusSeconds, focusTargetMinutes, hasAwardedFocusStar, onAwardStar]);

  const formatFocusTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const triggerPageChange = (newIndex: number) => {
    if (newIndex < 0 || newIndex >= totalPages) return;

    const now = Date.now();
    const timeOnPrevPage = (now - lastTurnTimeRef.current) / 1000;
    lastTurnTimeRef.current = now;
    setPageDwellSeconds(0);

    // 🎵 Reading Rhythm Gamification Pace Evaluation
    if (timeOnPrevPage >= 6 && timeOnPrevPage <= 40) {
      const nextCombo = Math.min(10, rhythmCombo + 1);
      setRhythmCombo(nextCombo);
      if (nextCombo > rhythmCombo) {
        playStarChime();
        onAwardStar(1);
      }
      setRhythmPaceCategory('perfect');
      setRhythmBpm(Math.min(120, Math.max(75, Math.round(90 + (20 - timeOnPrevPage) * 1.5))));
    } else if (timeOnPrevPage < 6) {
      setRhythmCombo(1);
      setRhythmPaceCategory('fast');
      setRhythmBpm(130);
    } else {
      setRhythmPaceCategory('deep');
      setRhythmBpm(70);
    }

    // Fast Page Flipping Detection (< 3.5 seconds)
    if (timeOnPrevPage < 3.5) {
      fastTurnHistoryRef.current = [...fastTurnHistoryRef.current.filter((t) => now - t < 15000), now];
      if (fastTurnHistoryRef.current.length >= 2) {
        setGuidanceBubble({
          show: true,
          type: 'too_fast',
          message: '🏃 小寶貝翻頁好迅速呀！細心體會美麗的繪本插圖與語音聲效會更有趣喔！',
          tipAction: 'read_aloud',
        });
      }
    } else {
      if (guidanceBubble.type === 'too_fast') {
        setGuidanceBubble((prev) => ({ ...prev, show: false }));
      }
    }

    setIsPageTurning(true);
    playPageTurnSound();
    setCurrentPageIndex(newIndex);
    recordReadingProgress(book, newIndex + 1, newIndex === totalPages - 1);
    setTimeout(() => {
      setIsPageTurning(false);
    }, 350);
  };

  // Offline Caching & Notice Bar States
  const [isDownloadedState, setIsDownloadedState] = useState<boolean>(() => {
    return isBookDownloaded(book.id) || downloadedBookIds.includes(book.id);
  });
  const [isBannerDismissed, setIsBannerDismissed] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<{
    isDownloading: boolean;
    percent: number;
    statusText: string;
    isCompleted: boolean;
  }>({
    isDownloading: false,
    percent: 0,
    statusText: '',
    isCompleted: false,
  });

  // Active Selected Vocab Modal
  const [selectedVocab, setSelectedVocab] = useState<VocabItem | null>(null);
  const [vocabAddedMessage, setVocabAddedMessage] = useState(false);

  // AI Story Companion (Little Owl 🦉)
  const [isBuddyOpen, setIsBuddyOpen] = useState(false);
  const [buddyMessages, setBuddyMessages] = useState<StoryQAHistory[]>([]);
  const [buddyInput, setBuddyInput] = useState('');
  const [isBuddyLoading, setIsBuddyLoading] = useState(false);

  // AI Interactive Quiz Modal State
  const [isQuizOpen, setIsQuizOpen] = useState(false);

  // Dynamic AI Translation Modal / Output
  const [customTranslation, setCustomTranslation] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [targetTranslateLang, setTargetTranslateLang] = useState<string>('法文');

  // Background Ambience Audio & Story Guide States
  const [bgMusicTrack, setBgMusicTrack] = useState<BgMusicTrack>(
    settings.bgMusicTrack && settings.bgMusicTrack !== 'off'
      ? settings.bgMusicTrack
      : settings.bgMusic
      ? getRecommendedBgMusicForCategory(book.category)
      : 'off'
  );
  const [bgMusicVolume, setBgMusicVolume] = useState<number>(settings.bgMusicVolume ?? 0.4);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [isEmotionModalOpen, setIsEmotionModalOpen] = useState(false);

  // Art Style Transformation State (水彩, 蠟筆, 點陣像素)
  const [styledPages, setStyledPages] = useState<Record<number, string>>({});
  const [isArtStyleModalOpen, setIsArtStyleModalOpen] = useState(false);
  const [isMusicMenuOpen, setIsMusicMenuOpen] = useState(false);

  // Digital Souvenir Collectibles Modal State
  const [isCollectibleModalOpen, setIsCollectibleModalOpen] = useState(false);
  const [unlockedCollectibles, setUnlockedCollectibles] = useState<CollectibleItem[]>([]);

  // 💡 Reading Focus & Key Highlights Mode State (閱讀重點模式)
  const [isReadingFocusHighlightsOpen, setIsReadingFocusHighlightsOpen] = useState(false);

  // 🎙️ Picture Book Reading Guide Script Modal State (繪本導讀腳本)
  const [isGuideScriptModalOpen, setIsGuideScriptModalOpen] = useState(false);

  // 📝 Quick Reading Notes Modal State (快速閱讀筆記)
  const [isQuickNotesModalOpen, setIsQuickNotesModalOpen] = useState(false);

  // 🏆 Digital Treasure Vault & 3D Memorial Card Modal State (數位寶箱)
  const [isTreasureVaultOpen, setIsTreasureVaultOpen] = useState(false);

  // 🏷️ Progress Scrubber & Vocab Tag Jump States (進度條滑塊與生字快速跳轉)
  const [hoveredScrubberPage, setHoveredScrubberPage] = useState<number | null>(null);
  const [jumpHighlightedWord, setJumpHighlightedWord] = useState<string | null>(null);
  const [isVocabJumpExpanded, setIsVocabJumpExpanded] = useState<boolean>(true);

  // All Vocabulary Words across all pages for interactive scrubber tags
  const allBookVocabs = useMemo(() => {
    const list: { vocab: VocabItem; pageNum: number; isSaved: boolean }[] = [];
    book.pages.forEach((p) => {
      if (p.vocab && p.vocab.length > 0) {
        p.vocab.forEach((v) => {
          const isSaved = savedWords.some((sw) => sw.word === v.word);
          list.push({ vocab: v, pageNum: p.pageNumber, isSaved });
        });
      }
    });
    return list;
  }, [book.pages, savedWords]);

  // Jump directly to a page with word highlight
  const handleJumpToVocabPage = (pageNum: number, word: string) => {
    triggerPageChange(pageNum - 1);
    setJumpHighlightedWord(word);
    playStarChime();
    setTimeout(() => {
      setJumpHighlightedWord(null);
    }, 3500);
  };

  // Digital Crayon Canvas State
  const [isCrayonCanvasOpen, setIsCrayonCanvasOpen] = useState(false);

  // 🎭 AI Story Character Roleplay State (與故事主角對話)
  const [isRoleplayModalOpen, setIsRoleplayModalOpen] = useState(false);
  const [roleplayCount, setRoleplayCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(`pwa_roleplay_count_${book.id}`);
      return saved ? parseInt(saved, 10) || 0 : 0;
    } catch {
      return 0;
    }
  });

  // 🎯 Personal Focus Achievement Modal State (個人專注成就系統)
  const [isFocusAchievementModalOpen, setIsFocusAchievementModalOpen] = useState(false);

  // AI Story Sequel Continuation State (AI 故事續寫)
  const [isSequelModalOpen, setIsSequelModalOpen] = useState(false);

  // Reading Mood & Sentiment Dashboard State (閱讀心情儀表板)
  const [isMoodDashboardOpen, setIsMoodDashboardOpen] = useState(false);

  // Floating Pomodoro Focus Timer Status (番茄閱讀專注器狀態)
  const [pomodoroStatus, setPomodoroStatus] = useState<PomodoroStatus>('idle');

  // --- 🎙️ 數位語音書籤 (Digital Audio Bookmark) States ---
  const [audioBookmarks, setAudioBookmarks] = useState<AudioBookmark[]>(() => {
    try {
      const saved = localStorage.getItem(`pwa_audio_bookmarks_${book.id}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isBookmarkModalOpen, setIsBookmarkModalOpen] = useState(false);
  const [isBookmarksListOpen, setIsBookmarksListOpen] = useState(false);
  const [isRecordingBookmark, setIsRecordingBookmark] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [selectedBookmarkEmoji, setSelectedBookmarkEmoji] = useState('😃');
  const [bookmarkNoteTitle, setBookmarkNoteTitle] = useState('');
  const [bookmarkMicError, setBookmarkMicError] = useState<string | null>(null);
  const [isPlayingBookmarkId, setIsPlayingBookmarkId] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<any>(null);
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);

  // Long press timer ref for page touch/click
  const longPressTimerRef = useRef<any>(null);

  const handlePagePressStart = () => {
    longPressTimerRef.current = setTimeout(() => {
      playStarChime();
      setIsBookmarkModalOpen(true);
    }, 650);
  };

  const handlePagePressEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const startRecordingBookmark = async () => {
    setBookmarkMicError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64Data = reader.result as string;
          const newBookmark: AudioBookmark = {
            id: `bm_${Date.now()}`,
            bookId: book.id,
            pageNumber: currentPage.pageNumber,
            audioDataUrl: base64Data,
            createdAt: new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' }),
            emotionEmoji: selectedBookmarkEmoji,
            noteTitle: bookmarkNoteTitle.trim() || `第 ${currentPage.pageNumber} 頁語音心得`,
            durationSec: recordingSeconds || 5,
          };

          const updated = [newBookmark, ...audioBookmarks.filter((b) => b.pageNumber !== currentPage.pageNumber)];
          setAudioBookmarks(updated);
          try {
            localStorage.setItem(`pwa_audio_bookmarks_${book.id}`, JSON.stringify(updated));
          } catch (e) {
            console.error(e);
          }

          playStarChime();
          onAwardStar(5);
          setIsRecordingBookmark(false);
          setIsBookmarkModalOpen(false);
          setRecordingSeconds(0);
          setBookmarkNoteTitle('');
        };

        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecordingBookmark(true);
      setRecordingSeconds(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => {
          if (prev >= 30) {
            stopRecordingBookmark();
            return 30;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      setBookmarkMicError('無法取得麥克風權限，請確認瀏覽器已允許存取麥克風！');
    }
  };

  const stopRecordingBookmark = () => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  const handlePlayBookmarkAudio = (dataUrl: string, bookmarkId: string) => {
    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
      activeAudioRef.current = null;
    }

    if (isPlayingBookmarkId === bookmarkId) {
      setIsPlayingBookmarkId(null);
      return;
    }

    try {
      const audio = new Audio(dataUrl);
      activeAudioRef.current = audio;
      setIsPlayingBookmarkId(bookmarkId);

      audio.play();
      audio.onended = () => setIsPlayingBookmarkId(null);
      audio.onerror = () => setIsPlayingBookmarkId(null);
    } catch {
      setIsPlayingBookmarkId(null);
    }
  };

  const handleDeleteBookmark = (bookmarkId: string) => {
    const updated = audioBookmarks.filter((b) => b.id !== bookmarkId);
    setAudioBookmarks(updated);
    try {
      localStorage.setItem(`pwa_audio_bookmarks_${book.id}`, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  // --- 🎵 閱讀節奏遊戲化 (Reading Rhythm Gamification) States ---
  const [rhythmCombo, setRhythmCombo] = useState<number>(1);
  const [rhythmBpm, setRhythmBpm] = useState<number>(88);
  const [rhythmPoints, setRhythmPoints] = useState<number>(0);
  const [isRhythmBeatActive, setIsRhythmBeatActive] = useState<boolean>(false);
  const [rhythmTapCount, setRhythmTapCount] = useState<number>(0);
  const [isRhythmDashboardOpen, setIsRhythmDashboardOpen] = useState<boolean>(false);
  const [rhythmPaceCategory, setRhythmPaceCategory] = useState<'perfect' | 'fast' | 'deep'>('perfect');

  const handleTapRhythmBeat = () => {
    playStarChime();
    const nextCount = rhythmTapCount + 1;
    setRhythmTapCount(nextCount);
    if (nextCount % 4 === 0) {
      setRhythmPoints((p) => p + 10);
      onAwardStar(2);
    }
  };

  // Reading Pace Guidance & Dwell Timer States
  const [pageDwellSeconds, setPageDwellSeconds] = useState(0);
  const [isOfflineAnalyticsOpen, setIsOfflineAnalyticsOpen] = useState(false);
  const [guidanceBubble, setGuidanceBubble] = useState<{
    show: boolean;
    type: 'too_fast' | 'too_slow' | 'encouragement' | 'normal';
    message: string;
    tipAction?: 'read_aloud' | 'open_vocab' | 'ask_buddy';
  }>({
    show: false,
    type: 'normal',
    message: '',
  });

  const lastTurnTimeRef = useRef<number>(Date.now());
  const fastTurnHistoryRef = useRef<number[]>([]);

  // Dwell Timer Ticker Effect
  useEffect(() => {
    const timer = setInterval(() => {
      setPageDwellSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [currentPageIndex]);

  // Handle Dwell Time Milestones
  useEffect(() => {
    if (pageDwellSeconds === 15) {
      handleTriggerEasterEgg(`dwell_p${currentPageIndex}`, '專注深思彩蛋', '專注沉浸大師', '🌟');
    } else if (pageDwellSeconds === 40) {
      setGuidanceBubble({
        show: true,
        type: 'too_slow',
        message: '🤔 這一頁是不是遇到不懂的難字或思考題呢？點擊【語音朗讀】或【故事導覽】幫你解惑喔！✨',
        tipAction: 'read_aloud',
      });
    }
  }, [pageDwellSeconds, currentPageIndex]);

  // Reader Theme Background State (自動根據繪本主題變更藝術背景)
  const [activeReaderTheme, setActiveReaderTheme] = useState<SocialThemeBackground>(() => detectReaderThemeForBook(book));
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const [isSocialShareModalOpen, setIsSocialShareModalOpen] = useState(false);
  const [socialPostContent, setSocialPostContent] = useState('');
  const [socialPostSuccess, setSocialPostSuccess] = useState(false);

  // Background Ambience Music Loop
  useEffect(() => {
    if (bgMusicTrack !== 'off') {
      playBackgroundAmbience(bgMusicTrack, bgMusicVolume);
    } else {
      stopBackgroundAmbience();
    }
    return () => {
      stopBackgroundAmbience();
    };
  }, [bgMusicTrack]);

  useEffect(() => {
    setBackgroundAmbienceVolume(bgMusicVolume);
  }, [bgMusicVolume]);

  // Reading duration tracking timer
  const sessionStartTimeRef = useRef<number>(Date.now());
  const elapsedSecondsRef = useRef<number>(0);

  const currentPage = book.pages[currentPageIndex] || book.pages[0];
  const totalPages = book.pages.length;

  // Track session duration & log progress
  useEffect(() => {
    sessionStartTimeRef.current = Date.now();
    const timer = setInterval(() => {
      elapsedSecondsRef.current += 1;
      // Record progress every 10 seconds
      if (elapsedSecondsRef.current % 10 === 0) {
        recordReadingProgress(book, currentPageIndex + 1, currentPageIndex === totalPages - 1);
        if (onUpdateReadingProgress) {
          const mins = Math.max(1, Math.round(elapsedSecondsRef.current / 60));
          onUpdateReadingProgress(
            book.id,
            currentPageIndex + 1,
            mins,
            currentPageIndex === totalPages - 1
          );
        }
      }
    }, 1000);

    return () => {
      clearInterval(timer);
      recordReadingProgress(book, currentPageIndex + 1, currentPageIndex === totalPages - 1);
      // Record Focus & Emotion Analytics Session Log
      if (elapsedSecondsRef.current >= 5) {
        const bookTitleStr = typeof book.title === 'string' ? book.title : (book.title['zh-TW'] || book.title.en || '繪本');
        recordFocusSession({
          bookId: book.id,
          bookTitle: bookTitleStr,
          category: book.category || 'Fairy Tale',
          dwellSecPerPageAvg: Math.max(5, Math.round(elapsedSecondsRef.current / Math.max(1, currentPageIndex + 1))),
          totalPagesRead: currentPageIndex + 1,
          totalTimeSec: elapsedSecondsRef.current,
          emotionTrack: rhythmPaceCategory === 'perfect' ? '🥰 溫暖沉浸' : rhythmPaceCategory === 'deep' ? '🤔 深度思考' : '⚡ 敏捷探索',
          paceScore: rhythmPaceCategory === 'perfect' ? 95 : rhythmPaceCategory === 'deep' ? 88 : 80,
          timestamp: new Date().toISOString(),
        });
      }
    };
  }, [book.id, currentPageIndex, totalPages]);

  // Sound & Speech Cleanup on Page change
  useEffect(() => {
    stopSpeech();
    setIsPlayingAudio(false);
    setSpokenBoundaryIndex(-1);
    setCustomTranslation(null);
    playPageTurnSound();

    // Auto play audio if enabled in settings
    if (settings.autoPlayAudio) {
      setTimeout(() => {
        const textToRead = currentPage.text[primaryLang] || currentPage.text['zh-TW'] || currentPage.text['en'];
        const langOption = getLanguageByCode(primaryLang);
        setIsPlayingAudio(true);
        speakText(
          textToRead,
          langOption.speechCode,
          speechRate,
          settings.voiceRole || 'mom',
          settings.speechPitch || 1.0,
          () => setIsPlayingAudio(false),
          (charIdx) => setSpokenBoundaryIndex(charIdx),
          undefined,
          settings.emotionIntensity ?? 80
        );
      }, 400);
    }
  }, [currentPageIndex]);

  // Handle Auto-Play Timer
  useEffect(() => {
    let interval: any = null;
    if (autoPlayTimer) {
      interval = setInterval(() => {
        if (currentPageIndex < totalPages - 1) {
          setCurrentPageIndex((prev) => prev + 1);
        } else {
          setAutoPlayTimer(false);
        }
      }, 7000);
    }
    return () => clearInterval(interval);
  }, [autoPlayTimer, currentPageIndex, totalPages]);

  // Audio Read Aloud Trigger
  const handleStartDownloadInReader = () => {
    if (downloadProgress.isDownloading) return;

    setDownloadProgress({
      isDownloading: true,
      percent: 15,
      statusText: '讀取繪本結構數據與多語言內文...',
      isCompleted: false,
    });

    setTimeout(() => {
      setDownloadProgress({
        isDownloading: true,
        percent: 50,
        statusText: `下載全書 ${book.pages.length} 頁高清圖文畫冊與繪畫素材...`,
        isCompleted: false,
      });
    }, 500);

    setTimeout(() => {
      setDownloadProgress({
        isDownloading: true,
        percent: 85,
        statusText: '打包多語言朗讀與生字語音庫...',
        isCompleted: false,
      });
    }, 1100);

    setTimeout(() => {
      saveBookForOffline(book);
      if (onToggleDownloadBook) {
        onToggleDownloadBook(book);
      }
      playStarChime();
      setIsDownloadedState(true);
      setDownloadProgress({
        isDownloading: false,
        percent: 100,
        statusText: '🎉 100% 離線包已成功儲存至本機快取！',
        isCompleted: true,
      });
    }, 1800);
  };

  const handleToggleAudio = () => {
    if (isPlayingAudio) {
      stopSpeech();
      setIsPlayingAudio(false);
      setSpokenBoundaryIndex(-1);
    } else {
      const textToRead = currentPage.text[primaryLang] || currentPage.text['zh-TW'] || currentPage.text['en'];
      const langOption = getLanguageByCode(primaryLang);
      
      setIsPlayingAudio(true);
      speakText(
        textToRead,
        langOption.speechCode,
        speechRate,
        settings.voiceRole || 'mom',
        settings.speechPitch || 1.0,
        () => {
          setIsPlayingAudio(false);
          setSpokenBoundaryIndex(-1);
        },
        (charIdx) => setSpokenBoundaryIndex(charIdx),
        undefined,
        settings.emotionIntensity ?? 80
      );
    }
  };

  // Change Speech Speed
  const handleChangeSpeechRate = (newRate: number) => {
    setSpeechRate(newRate);
    if (isPlayingAudio) {
      stopSpeech();
      setIsPlayingAudio(false);
      setTimeout(() => {
        const textToRead = currentPage.text[primaryLang] || currentPage.text['zh-TW'] || currentPage.text['en'];
        const langOption = getLanguageByCode(primaryLang);
        setIsPlayingAudio(true);
        speakText(
          textToRead,
          langOption.speechCode,
          newRate,
          settings.voiceRole || 'mom',
          settings.speechPitch || 1.0,
          () => {
            setIsPlayingAudio(false);
            setSpokenBoundaryIndex(-1);
          },
          (charIdx) => setSpokenBoundaryIndex(charIdx),
          undefined,
          settings.emotionIntensity ?? 80
        );
      }, 100);
    }
  };

  // Navigate Pages
  const handleNextPage = () => {
    if (currentPageIndex < totalPages - 1) {
      triggerPageChange(currentPageIndex + 1);
    } else {
      // Completed Book!
      onFinishBook(book.id);
      playStarChime();
      onAwardStar(5); // Award 5 stars for finishing a book

      // Unlock & Show Digital Souvenir Collectibles Modal, Story Quiz Challenge, and Story Achievement Card!
      const items = getCollectiblesForBook(book);
      setUnlockedCollectibles(items);
      setIsCollectibleModalOpen(true);
      setIsQuizChallengeOpen(true);
      setIsStoryAchievementCardOpen(true);
    }
  };

  const handlePrevPage = () => {
    if (currentPageIndex > 0) {
      triggerPageChange(currentPageIndex - 1);
    }
  };

  // Add Word to Bank
  const handleSaveWord = (vocab: VocabItem) => {
    onAddWord(vocab, currentPage.pageNumber);
    playStarChime();
    setVocabAddedMessage(true);
    setTimeout(() => setVocabAddedMessage(false), 2000);
  };

  // Ask AI Story Companion
  const handleAskBuddy = async (questionText?: string) => {
    const q = questionText || buddyInput;
    if (!q.trim()) return;

    const newHistory: StoryQAHistory[] = [...buddyMessages, { role: 'user', content: q }];
    setBuddyMessages(newHistory);
    setBuddyInput('');
    setIsBuddyLoading(true);

    try {
      const res = await fetch('/api/gemini/story-qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookTitle: book.title['zh-TW'],
          pageText: currentPage.text['zh-TW'],
          userQuestion: q,
          history: newHistory,
        }),
      });

      const data = await res.json();
      setBuddyMessages([...newHistory, { role: 'assistant', content: data.answer }]);

      // Speak response
      speakText(data.answer, 'zh-TW', 1.0);
    } catch (err) {
      setBuddyMessages([
        ...newHistory,
        { role: 'assistant', content: '小貓頭鷹聽到你的問題囉！故事裡有很多有趣的事情，我們一起繼續探索吧！🦉🌟' },
      ]);
    } finally {
      setIsBuddyLoading(false);
    }
  };

  // AI Dynamic Page Translator
  const handleDynamicTranslate = async (targetLangName: string) => {
    setIsTranslating(true);
    try {
      const sourceText = currentPage.text['zh-TW'] || currentPage.text[primaryLang];
      const res = await fetch('/api/gemini/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: sourceText,
          targetLanguageName: targetLangName,
        }),
      });
      const data = await res.json();
      setCustomTranslation(data.translation);
    } catch (err) {
      setCustomTranslation('翻譯過程中遇到問題，請稍後再試一次。');
    } finally {
      setIsTranslating(false);
    }
  };

  const primaryText = currentPage.text[primaryLang] || currentPage.text['zh-TW'] || currentPage.text['en'];
  const secondaryText = secondaryLang !== 'none' ? currentPage.text[secondaryLang] : null;
  const currentThemeConfig = THEME_CONFIGS[activeReaderTheme] || THEME_CONFIGS.golden;

  return (
    <div
      className={`min-h-screen flex flex-col justify-between relative overflow-hidden transition-all duration-700 bg-gradient-to-br ${currentThemeConfig.darkBgGradient} text-slate-100`}
      id="book-reader-container"
    >
      {/* Dynamic Theme Floating Particle Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-25 z-0">
        {currentThemeConfig.bgDecorativeIcons.map((icon, idx) => (
          <span
            key={idx}
            className="absolute text-5xl sm:text-7xl animate-pulse select-none"
            style={{
              top: `${(idx * 23 + 12) % 85}%`,
              left: `${(idx * 37 + 15) % 90}%`,
              animationDuration: `${3 + idx}s`,
            }}
          >
            {icon}
          </span>
        ))}
      </div>

      {/* Top Header Bar */}
      <header className="bg-slate-900/80 border-b border-white/10 px-4 py-3 sticky top-0 z-30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Back Button & Title */}
          <div className="flex items-center gap-3">
            <button
              id="btn-reader-back"
              onClick={onBack}
              className="p-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold flex items-center gap-1 text-sm transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">返回圖書館</span>
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded-full">
                  {book.originCountry} {book.flag}
                </span>
                <h2 className="font-extrabold text-white text-sm sm:text-base line-clamp-1">
                  {book.title[primaryLang] || book.title['zh-TW']}
                </h2>
              </div>
            </div>
          </div>

          {/* Controls: Language Selector & Audio Toolbar */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Reading Focus Timer Button */}
            <button
              id="btn-open-focus-timer"
              onClick={() => {
                setIsFocusModalOpen(true);
                playPageTurnSound();
              }}
              className={`px-2.5 py-1.5 rounded-2xl border font-black text-xs flex items-center gap-1.5 shadow-md transition-transform hover:scale-105 cursor-pointer backdrop-blur-md ${
                hasAwardedFocusStar
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-emerald-400 animate-pulse'
                  : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border-amber-400/40'
              }`}
              title="專注閱讀計時器：設定閱讀時間目標，專注達標即可贏取童心星星"
            >
              <Clock className="w-4 h-4 text-amber-300 animate-spin" style={{ animationDuration: '8s' }} />
              <span>⏱ {formatFocusTime(focusSeconds)}</span>
              <span className="hidden sm:inline text-[10px] bg-amber-400 text-slate-950 px-1.5 py-0.5 rounded-full font-extrabold">
                目標 {focusTargetMinutes}分
              </span>
            </button>

            {/* AR Expanded Reality Book Preview Button */}
            <button
              id="btn-open-ar-book-preview"
              onClick={() => {
                setIsARModalOpen(true);
                playPageTurnSound();
              }}
              className="px-2.5 py-1.5 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white font-black text-xs flex items-center gap-1.5 shadow-md transition-transform hover:scale-105 cursor-pointer backdrop-blur-md"
              title="開啟 3D/AR 擴增實境繪本預覽，沉浸式浮空場景與實境角色互動"
            >
              <Compass className="w-4 h-4 text-amber-300 animate-spin" style={{ animationDuration: '10s' }} />
              <span className="hidden sm:inline">🥽 AR 實境預覽</span>
            </button>

            {/* Book Quiz Challenge Button */}
            <button
              id="btn-open-book-quiz-challenge"
              onClick={() => {
                setIsQuizChallengeOpen(true);
                playPageTurnSound();
              }}
              className="px-2.5 py-1.5 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md transition-transform hover:scale-105 cursor-pointer backdrop-blur-md"
              title="開啟繪本闖關 AI 問答挑戰，解鎖炫彩頭像框與數位貼紙"
            >
              <Trophy className="w-4 h-4 text-slate-950 animate-bounce" />
              <span className="hidden sm:inline">繪本闖關 🏆</span>
            </button>

            {/* Digital Crayon Canvas Button */}
            <button
              id="btn-open-crayon-canvas"
              onClick={() => {
                setIsCrayonCanvasOpen(true);
                playPageTurnSound();
              }}
              className="px-2.5 py-1.5 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-400/40 font-black text-xs flex items-center gap-1.5 shadow-xs transition-transform hover:scale-105 cursor-pointer backdrop-blur-md"
              title="開啟童心數位蠟筆畫布進行塗鴉與筆記標記"
            >
              <Pencil className="w-4 h-4 text-amber-300 animate-pulse" />
              <span className="hidden sm:inline">數位蠟筆</span>
            </button>

            {/* Theme Artistic Background Switcher Button */}
            <button
              id="btn-open-reader-theme-menu"
              onClick={() => setIsThemeMenuOpen(true)}
              className="px-2.5 py-1.5 rounded-2xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border border-purple-400/40 font-black text-xs flex items-center gap-1.5 shadow-xs transition-transform hover:scale-105 cursor-pointer backdrop-blur-md"
              title="切換繪本藝術主題背景（森林、星空、城堡、海洋、糖果、金黃夕陽）"
            >
              <Palette className="w-4 h-4 text-purple-300 animate-bounce" />
              <span className="hidden sm:inline">{currentThemeConfig.name}</span>
            </button>

            {/* Reading Social Wall Button */}
            <button
              id="btn-open-social-share-reader"
              onClick={() => setIsSocialShareModalOpen(true)}
              className="p-2.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-extrabold text-xs sm:text-sm flex items-center gap-1.5 shadow-xs transition-transform hover:scale-105 cursor-pointer"
              title="發布與分享閱讀心得至童心社交牆"
            >
              <MessageCircle className="w-4 h-4 text-indigo-100" />
              <span className="hidden lg:inline">閱讀社交牆</span>
            </button>
            
            {/* Primary Language Dropdown */}
            <div className="flex items-center gap-1 bg-white px-2.5 py-1.5 rounded-2xl border border-amber-200 shadow-2xs">
              <Globe className="w-4 h-4 text-amber-600 hidden sm:block" />
              <select
                id="select-reader-primary-lang"
                value={primaryLang}
                onChange={(e) => setPrimaryLang(e.target.value as LanguageCode)}
                className="bg-transparent text-xs sm:text-sm font-bold text-amber-950 focus:outline-none"
              >
                {SUPPORTED_LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.flag} {l.nativeName}
                  </option>
                ))}
              </select>
            </div>

            {/* Dual Text Secondary Language Toggle */}
            <div className="hidden lg:flex items-center gap-1 bg-white px-2.5 py-1.5 rounded-2xl border border-amber-200 shadow-2xs">
              <Languages className="w-4 h-4 text-orange-600" />
              <span className="text-xs font-bold text-amber-900/70">對照:</span>
              <select
                id="select-reader-secondary-lang"
                value={secondaryLang}
                onChange={(e) => setSecondaryLang(e.target.value as LanguageCode | 'none')}
                className="bg-transparent text-xs sm:text-sm font-bold text-amber-950 focus:outline-none"
              >
                <option value="none">關閉對照</option>
                {SUPPORTED_LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.flag} {l.nativeName}
                  </option>
                ))}
              </select>
            </div>

            {/* Audio Speech Read Aloud & Speed Controls */}
            <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border border-amber-200 shadow-2xs">
              <button
                id="btn-reader-audio-toggle"
                onClick={handleToggleAudio}
                className={`px-3 py-1.5 rounded-xl font-extrabold flex items-center gap-1.5 text-xs transition-all shadow-xs ${
                  isPlayingAudio
                    ? 'bg-orange-500 text-white animate-pulse'
                    : 'bg-amber-500 hover:bg-amber-600 text-white'
                }`}
              >
                {isPlayingAudio ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                <span className="hidden sm:inline">{isPlayingAudio ? '暫停朗讀' : '語音朗讀'}</span>
              </button>

              {/* Speed rate dropdown */}
              <div className="flex items-center text-[11px] font-extrabold text-amber-900 border-l border-amber-200 pl-1.5 pr-1">
                <select
                  value={speechRate}
                  onChange={(e) => handleChangeSpeechRate(parseFloat(e.target.value))}
                  className="bg-transparent font-bold focus:outline-none cursor-pointer"
                  title="朗讀語速"
                >
                  <option value={0.75}>🐢 0.75x 慢速</option>
                  <option value={1.0}>🐇 1.0x 標準</option>
                  <option value={1.25}>🚀 1.25x 快速</option>
                </select>
              </div>
            </div>

            {/* Ambient Background Music & Audio FX Control Button */}
            <button
              id="btn-open-bg-music-menu"
              onClick={() => setIsMusicMenuOpen(true)}
              className={`px-2.5 py-1.5 rounded-2xl border font-bold flex items-center gap-1.5 text-xs transition-all shadow-2xs hover:scale-105 ${
                bgMusicTrack !== 'off'
                  ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-700'
                  : 'bg-white hover:bg-amber-50 dark:bg-slate-800 text-amber-950 dark:text-amber-100 border-amber-200 dark:border-slate-700'
              }`}
              title="調整朗讀背景配樂與音效選單"
            >
              <Music className={`w-4 h-4 ${bgMusicTrack !== 'off' ? 'text-amber-600 animate-bounce' : 'text-slate-400'}`} />
              <span className="font-black truncate max-w-[100px] sm:max-w-none">
                {bgMusicTrack !== 'off'
                  ? BG_MUSIC_PLAYLIST.find((t) => t.id === bgMusicTrack)?.name || '背景配樂'
                  : '背景配樂'}
              </span>
              {bgMusicTrack !== 'off' && (
                <span className="bg-amber-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                  {Math.round(bgMusicVolume * 100)}%
                </span>
              )}
            </button>

            {/* AI Speech Emotion Analysis Button */}
            <button
              id="btn-open-story-emotion"
              onClick={() => setIsEmotionModalOpen(true)}
              className="p-2.5 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-extrabold text-xs sm:text-sm flex items-center gap-1.5 shadow-xs transition-transform hover:scale-105"
              title="查看AI語音朗讀情緒分析"
            >
              <Activity className="w-4 h-4 text-rose-100 animate-pulse" />
              <span className="hidden lg:inline">語音情緒</span>
            </button>

            {/* Story Guide Companion Modal Trigger */}
            <button
              id="btn-open-story-guide"
              onClick={() => setIsGuideModalOpen(true)}
              className="px-3 py-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-xs sm:text-sm flex items-center gap-1.5 shadow-xs transition-transform hover:scale-105"
              title="專屬繪本導讀員"
            >
              <Compass className="w-4 h-4 text-amber-100" />
              <span className="hidden md:inline">繪本導讀員</span>
            </button>

            {/* AI Interactive Story Quiz Button */}
            <button
              id="btn-open-story-quiz"
              onClick={() => setIsQuizOpen(true)}
              className="p-2.5 rounded-2xl bg-amber-200 hover:bg-amber-300 text-amber-950 font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-xs border border-amber-300 transition-transform hover:scale-105"
              title="進行AI故事問答測驗"
            >
              <FileQuestion className="w-4 h-4 text-amber-800" />
              <span className="hidden md:inline">AI測驗</span>
            </button>

            {/* 📢 Today's Reading Summary Voice Announcement Button (本日閱讀總結) */}
            {onOpenVoiceSummary && (
              <button
                id="btn-open-reader-voice-summary"
                onClick={() => {
                  playStarChime();
                  onOpenVoiceSummary();
                }}
                className="px-3.5 py-2 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-md border border-amber-300 transition-transform hover:scale-105 cursor-pointer ring-2 ring-amber-400/50 animate-pulse"
                title="點擊播放 Web Speech API 語音總結：當前繪本進度、今日累積閱讀時長、生字收穫與星章成就"
              >
                <Radio className="w-4 h-4 text-slate-950 animate-pulse" />
                <span>📢 本日閱讀總結</span>
              </button>
            )}

            {/* 🏛️ Personal Reading Achievement Showcase Wall Button (個人讀書成就展示牆) */}
            {onOpenAchievementWall && (
              <button
                id="btn-open-reader-achievement-wall"
                onClick={() => {
                  playStarChime();
                  onOpenAchievementWall();
                }}
                className="px-3.5 py-2 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-amber-500 hover:from-purple-700 hover:to-amber-600 text-white font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-md border border-purple-300 transition-transform hover:scale-105 cursor-pointer ring-2 ring-purple-400/40"
                title="開啟個人讀書成就展示牆：光榮獎盃櫃、段位階級勳章、官方榮譽證書與繪本主角立體玩偶"
              >
                <Trophy className="w-4 h-4 text-yellow-300 animate-bounce" />
                <span>🏛️ 成就展示牆</span>
              </button>
            )}

            {/* 🎭 AI Story Character Roleplay Button (與故事主角對話) */}
            <button
              id="btn-open-character-roleplay"
              onClick={() => {
                playStarChime();
                setIsRoleplayModalOpen(true);
              }}
              className="px-3.5 py-2 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 hover:from-pink-600 hover:to-amber-600 text-white font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-md border border-pink-300 transition-transform hover:scale-105 cursor-pointer ring-2 ring-pink-400/40"
              title="與繪本中的主角與角色進行沉浸式趣味對話與心靈交流"
            >
              <Bot className="w-4 h-4 text-yellow-200 animate-bounce" />
              <span>🎭 與故事主角對話</span>
            </button>

            {/* 🎯 Personal Focus Achievement System Button (個人專注成就系統) */}
            <button
              id="btn-open-focus-achievements"
              onClick={() => {
                playStarChime();
                setIsFocusAchievementModalOpen(true);
              }}
              className="px-3.5 py-2 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-yellow-400 hover:from-amber-500 hover:to-yellow-500 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-md border border-amber-300 transition-transform hover:scale-105 cursor-pointer ring-2 ring-amber-400/40"
              title="檢視個人專注力等級、專注勳章與成就星幣獎勵"
            >
              <Trophy className="w-4 h-4 text-slate-950 animate-bounce" />
              <span>🎯 專注成就</span>
            </button>

            {/* AI Story Continuation Button (AI 故事續寫) */}
            <button
              id="btn-open-ai-sequel"
              onClick={() => setIsSequelModalOpen(true)}
              className="px-3 py-2 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:from-purple-500 hover:to-amber-400 text-white font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-md border border-purple-300 transition-transform hover:scale-105 cursor-pointer"
              title="針對當前故事結局提出創意設想，由 AI 生成後續插畫與章節"
            >
              <Wand2 className="w-4 h-4 text-amber-300 animate-bounce" />
              <span className="hidden sm:inline">✨ AI故事續寫</span>
            </button>

            {/* AI Co-Reading Room Button (AI 共讀室 & AI 專注儀表板) */}
            <button
              id="btn-open-ai-coreading-room"
              onClick={() => {
                playStarChime();
                setIsCoReadingRoomOpen(true);
              }}
              className="px-3.5 py-2 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-600 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-white font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-md border border-emerald-300 transition-transform hover:scale-105 cursor-pointer ring-2 ring-emerald-400/40"
              title="開啟 AI 共讀室模式，邀請家長或好友透過連結參與閱讀，由 AI 擔任版主引導討論並提供 AI 專注儀表板"
            >
              <Users className="w-4 h-4 text-amber-300" />
              <span className="hidden sm:inline">👥 AI共讀室</span>
            </button>

            {/* AI Story Context Map Button (故事脈絡地圖, 節奏分析 & 閱讀社交牆) */}
            <button
              id="btn-open-story-context-map"
              onClick={() => {
                playStarChime();
                setIsContextMapOpen(true);
              }}
              className="px-3.5 py-2 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-400 hover:to-red-400 text-white font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-md border border-amber-300/80 transition-transform hover:scale-105 cursor-pointer ring-2 ring-amber-400/50"
              title="開啟故事脈絡地圖：AI 自動擷取關鍵場景、角色網絡與隱藏知識，並提供智慧閱讀節奏分析與社交牆"
            >
              <Compass className="w-4 h-4 text-amber-200 animate-spin-slow" />
              <span className="hidden sm:inline">🗺️ 故事脈絡地圖</span>
            </button>

            {/* AI Reading Assistant Button (AI 閱讀理解輔助器 & 故事世界地圖) */}
            <button
              id="btn-open-ai-reading-assistant"
              onClick={() => {
                playStarChime();
                setIsAiAssistantOpen(true);
              }}
              className="px-3.5 py-2 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-md border border-indigo-300/50 transition-transform hover:scale-105 cursor-pointer animate-pulse"
              title="開啟 AI 閱讀理解輔助器（視覺化故事地點地圖、角色關係網絡與劇情起伏脈絡）"
            >
              <Compass className="w-4 h-4 text-amber-300" />
              <span className="hidden sm:inline">🤖 AI閱讀理解</span>
            </button>

            {/* AI Reading Comprehension Mind Map Button (AI 閱讀理解地圖) */}
            <button
              id="btn-open-comprehension-map"
              onClick={() => setIsComprehensionMapOpen(true)}
              className="px-3 py-2 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-md border border-teal-300 transition-transform hover:scale-105 cursor-pointer"
              title="查看 AI 閱讀理解雙語思維導圖"
            >
              <Brain className="w-4 h-4 text-emerald-200" />
              <span className="hidden sm:inline">🧠 AI理解地圖</span>
            </button>

            {/* Story Achievement Card Button (故事成就卡) */}
            <button
              id="btn-open-achievement-card"
              onClick={() => setIsStoryAchievementCardOpen(true)}
              className="px-3 py-2 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-md border border-amber-300 transition-transform hover:scale-105 cursor-pointer"
              title="檢視專屬故事成就卡並收藏至個人寶藏庫"
            >
              <Trophy className="w-4 h-4 fill-slate-950" />
              <span className="hidden sm:inline">🏆 故事成就卡</span>
            </button>

            {/* Reading Mood & Sentiment Dashboard Button (閱讀心情儀表板) */}
            <button
              id="btn-open-mood-dashboard"
              onClick={() => setIsMoodDashboardOpen(true)}
              className="px-3 py-2 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-md border border-pink-300 transition-transform hover:scale-105 cursor-pointer"
              title="查看閱讀情緒共鳴、專注指數與心情日記"
            >
              <Heart className="w-4 h-4 fill-white text-white animate-pulse" />
              <span className="hidden sm:inline">💖 心情儀表板</span>
            </button>

            {/* AI Reading Guide Script Button (繪本導讀腳本) */}
            <button
              id="btn-open-reading-guide-script"
              onClick={() => {
                playStarChime();
                setIsGuideScriptModalOpen(true);
              }}
              className="px-3 py-2 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-md border border-purple-300 transition-transform hover:scale-105 cursor-pointer"
              title="查看 Gemini API 繪本導讀腳本（啟發開場白、伴讀互動提問與深度共讀結尾討論）"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span className="hidden sm:inline">🎙️ 繪本導讀腳本</span>
            </button>

            {/* Quick Reading Notes Button (快速閱讀筆記) */}
            <button
              id="btn-open-quick-notes"
              onClick={() => {
                playStarChime();
                setIsQuickNotesModalOpen(true);
              }}
              className="px-3 py-2 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-md border border-amber-300 transition-transform hover:scale-105 cursor-pointer"
              title="隨手記錄當前頁或全書閱讀筆記、金句與心得"
            >
              <span>📝</span>
              <span className="hidden sm:inline">快速閱讀筆記</span>
            </button>

            {/* Reading Mood Diary Modal Trigger */}
            {onOpenMoodJournal && (
              <button
                id="btn-open-mood-journal"
                onClick={onOpenMoodJournal}
                className="p-2.5 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-xs transition-transform hover:scale-105"
                title="寫下童心閱讀心情日記"
              >
                <Heart className="w-4 h-4 fill-white text-white animate-pulse" />
                <span className="hidden sm:inline">心情日記</span>
              </button>
            )}

            {/* Reading Key Highlights Focus Mode Toggle Button (閱讀重點模式) */}
            <button
              id="btn-toggle-reading-focus-highlights"
              onClick={() => {
                playStarChime();
                setIsReadingFocusHighlightsOpen(!isReadingFocusHighlightsOpen);
              }}
              className={`px-3.5 py-2 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-md border transition-transform hover:scale-105 cursor-pointer ${
                isReadingFocusHighlightsOpen
                  ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400 text-slate-950 border-amber-200 ring-2 ring-amber-300 animate-pulse'
                  : 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white border-amber-400/50'
              }`}
              title="切換【閱讀重點模式】：精煉本頁情節重點、情感共鳴點、核心生字與思考提問"
            >
              <Lightbulb className={`w-4 h-4 ${isReadingFocusHighlightsOpen ? 'text-slate-950 fill-slate-950' : 'text-amber-200'}`} />
              <span className="hidden sm:inline">💡 閱讀重點模式</span>
              {isReadingFocusHighlightsOpen && (
                <span className="bg-slate-950 text-amber-300 text-[10px] px-1.5 py-0.2 rounded-full font-black">
                  ON
                </span>
              )}
            </button>

            {/* AI Companion Toggle Button */}
            <button
              id="btn-open-story-buddy"
              onClick={() => setIsBuddyOpen(!isBuddyOpen)}
              className="p-2.5 rounded-2xl bg-amber-900 text-amber-100 hover:bg-amber-950 font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-xs transition-transform hover:scale-105"
            >
              <span>🦉</span>
              <span className="hidden sm:inline">故事小夥伴</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Picture Book Canvas & Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 sm:py-8 flex flex-col justify-center relative">
        
        {/* Uncached Offline Pre-download Suggestion Notification Bar (建議優先下載通知列) */}
        {!isDownloadedState && !isBannerDismissed && (
          <div
            id="reader-offline-predownload-banner"
            className="mb-6 p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white shadow-xl border-2 border-amber-300/80 flex flex-col md:flex-row items-center justify-between gap-4 animate-fadeIn relative"
          >
            <div className="flex items-start gap-3.5 flex-1">
              <div className="p-2.5 rounded-2xl bg-white/20 backdrop-blur-xs shrink-0 mt-0.5">
                <Download className="w-6 h-6 text-white animate-bounce" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-black text-sm sm:text-base flex items-center gap-1.5">
                    <span>💡 建議優先下載！未檢測到《{book.title['zh-TW'] || book.title.en}》之離線快取</span>
                  </h3>
                  <span className="text-[10px] font-black bg-black/30 text-amber-200 px-2.5 py-0.5 rounded-full border border-white/20">
                    {!navigator.onLine ? '無網路離線中' : '建議預先儲存'}
                  </span>
                </div>
                <p className="text-xs font-medium opacity-95 leading-relaxed">
                  提示：預先下載全書圖文畫冊與多語言雙語語音包，即可在搭車、郊遊或網路斷線狀態下享受順暢無卡頓的閱讀體驗！
                </p>

                {/* Download Progress Bar */}
                {downloadProgress.isDownloading && (
                  <div className="mt-2 space-y-1 bg-black/20 p-2.5 rounded-2xl border border-white/20">
                    <div className="flex justify-between text-[11px] font-black">
                      <span>{downloadProgress.statusText}</span>
                      <span>{downloadProgress.percent}%</span>
                    </div>
                    <div className="w-full bg-white/30 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-white h-full rounded-full transition-all duration-300"
                        style={{ width: `${downloadProgress.percent}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 w-full md:w-auto justify-end">
              {!downloadProgress.isCompleted ? (
                <button
                  type="button"
                  id="btn-reader-download-book"
                  onClick={handleStartDownloadInReader}
                  disabled={downloadProgress.isDownloading}
                  className="w-full md:w-auto px-4 py-2.5 rounded-2xl bg-white text-orange-950 font-black text-xs sm:text-sm shadow-md hover:bg-amber-50 transition-all flex items-center justify-center gap-2 hover:scale-105 disabled:opacity-75 cursor-pointer"
                >
                  {downloadProgress.isDownloading ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-orange-600" />
                  ) : (
                    <HardDriveDownload className="w-4 h-4 text-orange-600" />
                  )}
                  <span>{downloadProgress.isDownloading ? '下載離線中...' : '📥 立即一鍵預下載全本'}</span>
                </button>
              ) : (
                <div className="px-4 py-2 rounded-2xl bg-emerald-500 text-white font-black text-xs flex items-center gap-1.5 shadow-md">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>已成功離線快取！</span>
                </div>
              )}

              <button
                type="button"
                onClick={() => setIsBannerDismissed(true)}
                className="p-2 rounded-xl hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
                title="暫時關閉提示"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Focus Goal Milestone Celebration Banner */}
        {showFocusGoalBanner && (
          <div className="mb-4 p-4 rounded-3xl bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 text-white shadow-xl border-2 border-emerald-300 flex items-center justify-between gap-3 animate-bounce">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🎉</span>
              <div>
                <h4 className="font-black text-sm text-emerald-100">
                  太棒了！已達成 {focusTargetMinutes} 分鐘專注閱讀目標！
                </h4>
                <p className="text-xs font-bold text-white/90">
                  系統已為你獎勵 <span className="text-amber-300 font-extrabold">+10 ⭐ 童心星星</span>！繼續保持閱讀好習慣吧！
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowFocusGoalBanner(false)}
              className="p-1.5 rounded-full hover:bg-white/20 text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Focus Timer & Reading Pace Bar */}
        <div className="mb-4 p-3 rounded-2xl bg-slate-900/90 border border-amber-400/40 text-amber-100 flex flex-wrap items-center justify-between gap-2 shadow-lg backdrop-blur-md">
          <div className="flex items-center gap-3">
            {/* Live Focus Timer */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/20 border border-amber-400/40 text-xs sm:text-sm font-black text-amber-300">
              <Clock className="w-4 h-4 text-amber-400 animate-spin-slow" />
              <span>專注閱讀時間：</span>
              <span className="font-mono text-amber-200 text-sm font-black">{formatFocusTime(focusSeconds)}</span>
            </div>

            {/* Current Page Dwell Pace Status */}
            <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-300 bg-slate-800/90 px-3 py-1 rounded-xl border border-slate-700">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span>本頁停留：<strong className="text-amber-300 font-mono">{pageDwellSeconds}</strong> 秒</span>
              <span className="hidden md:inline text-[10px] text-slate-400">
                ({pageDwellSeconds < 5 ? '⚡ 快速瀏覽' : pageDwellSeconds > 40 ? '🤔 深度思考' : '🌟 節奏順暢'})
              </span>
            </div>
          </div>

          {/* Quick Action Triggers */}
          <div className="flex items-center gap-2">
            {/* Reading Rhythm Combo Status Button */}
            <button
              type="button"
              id="btn-open-rhythm-dashboard-top"
              onClick={() => {
                playStarChime();
                setIsRhythmDashboardOpen(true);
              }}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-500 via-indigo-500 to-pink-500 text-white font-black text-xs flex items-center gap-1.5 shadow-md hover:scale-105 transition-all cursor-pointer animate-pulse"
              title="開啟閱讀節奏遊戲化儀表板與律動跟讀打卡"
            >
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>🎵 律動 Combo x{rhythmCombo}</span>
            </button>

            {/* Digital Voice Bookmark Button */}
            <button
              type="button"
              id="btn-open-voice-bookmark-top"
              onClick={() => {
                playStarChime();
                setIsBookmarkModalOpen(true);
              }}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 text-white font-black text-xs flex items-center gap-1.5 shadow-md hover:scale-105 transition-all cursor-pointer"
              title="長按頁面或點擊此處錄製/重播數位語音心得書籤"
            >
              <Mic className="w-3.5 h-3.5 text-rose-200" />
              <span>🎙️ 語音書籤 ({audioBookmarks.length})</span>
            </button>

            <button
              type="button"
              id="btn-open-offline-analytics-bar"
              onClick={() => setIsOfflineAnalyticsOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md transition-transform hover:scale-105 cursor-pointer"
              title="查看離線下載數據、本機快取與閱讀報告"
            >
              <HardDriveDownload className="w-3.5 h-3.5" />
              <span>⚡ 離線統計</span>
            </button>

            <button
              type="button"
              id="btn-open-mood-dashboard-top"
              onClick={() => setIsMoodDashboardOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-black text-xs flex items-center gap-1.5 shadow-md hover:scale-105 transition-all cursor-pointer"
              title="查看閱讀情緒共鳴與感情波形"
            >
              <Heart className="w-3.5 h-3.5 fill-white" />
              <span className="hidden sm:inline">💖 心情儀表板</span>
            </button>
          </div>
        </div>

        {/* 💡 閱讀重點模式導覽面板 (Reading Focus & Highlights Interactive Guide) */}
        <ReadingFocusModePanel
          book={book}
          currentPageNumber={currentPage.pageNumber}
          currentPageText={primaryText}
          currentPageVocab={currentPage.vocab}
          isOpen={isReadingFocusHighlightsOpen}
          onClose={() => setIsReadingFocusHighlightsOpen(false)}
          onSelectWord={(vocab) => {
            setSelectedVocab(vocab);
          }}
        />

        {/* Book Spread Container & Guidance Bubble Overlay */}
        <div className="relative">
          <div className={`bg-white rounded-3xl overflow-hidden grid grid-cols-1 md:grid-cols-2 min-h-[480px] transition-all duration-500 ${
            pomodoroStatus === 'running'
              ? 'border-4 border-rose-400 ring-4 ring-rose-400/50 shadow-[0_0_35px_rgba(244,63,94,0.4)]'
              : pomodoroStatus === 'paused'
              ? 'border-4 border-amber-400 ring-4 ring-amber-400/40 shadow-[0_0_25px_rgba(251,191,36,0.3)]'
              : pomodoroStatus === 'completed'
              ? 'border-4 border-emerald-400 ring-8 ring-yellow-400/60 shadow-[0_0_45px_rgba(250,204,21,0.6)] animate-pulse'
              : 'border border-amber-200/80 shadow-2xl'
          } ${
            isPageTurning ? 'scale-[0.98] opacity-80 blur-[1px] rotate-[-0.5deg]' : 'scale-100 opacity-100 rotate-0'
          }`}>
          
          {/* Left Column: High Quality Page Illustration */}
          <div
            className="relative bg-amber-900/10 flex items-center justify-center p-4 min-h-[300px] sm:min-h-[400px] group select-none cursor-pointer"
            onMouseDown={handlePagePressStart}
            onMouseUp={handlePagePressEnd}
            onTouchStart={handlePagePressStart}
            onTouchEnd={handlePagePressEnd}
            title="💡 提示：長按圖片 0.7 秒可快速錄製本頁【數位語音心得書籤】"
          >
            <img
              src={styledPages[currentPage.pageNumber] || currentPage.illustrationUrl}
              alt={`Page ${currentPage.pageNumber}`}
              className="w-full h-full object-cover rounded-2xl shadow-md transition-all duration-500 pointer-events-none"
            />

            {/* 🎙️ Floating Digital Voice Bookmark Ribbon Badge on Page Edge */}
            {audioBookmarks.some((b) => b.pageNumber === currentPage.pageNumber) && (
              <div className="absolute top-4 left-4 z-30 animate-bounce">
                {(() => {
                  const bm = audioBookmarks.find((b) => b.pageNumber === currentPage.pageNumber)!;
                  const isPlaying = isPlayingBookmarkId === bm.id;
                  return (
                    <div className="flex items-center gap-2 bg-gradient-to-r from-rose-500 via-amber-500 to-orange-500 text-white p-2 pr-3.5 rounded-2xl shadow-2xl border-2 border-white backdrop-blur-md">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlayBookmarkAudio(bm.audioDataUrl, bm.id);
                        }}
                        className="p-2 rounded-xl bg-white text-rose-600 hover:scale-110 transition-transform cursor-pointer shadow-md"
                        title="點擊重播該數位語音心得書籤"
                      >
                        {isPlaying ? <PauseCircle className="w-5 h-5 text-rose-600 animate-spin" /> : <PlayCircle className="w-5 h-5 text-rose-600" />}
                      </button>
                      <div>
                        <div className="flex items-center gap-1">
                          <span className="text-base">{bm.emotionEmoji}</span>
                          <span className="text-xs font-black text-amber-100 line-clamp-1">{bm.noteTitle}</span>
                        </div>
                        <span className="text-[10px] text-white/90 font-extrabold flex items-center gap-1">
                          <span>🎙️ 數位語音書籤</span>
                          <span className="bg-black/30 px-1.5 py-0.2 rounded-full">點擊播放 ({bm.durationSec || 5}s)</span>
                        </span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Art Style Transformation Button Overlay */}
            <button
              id="btn-open-art-style-modal"
              type="button"
              onClick={() => setIsArtStyleModalOpen(true)}
              className="absolute top-4 right-4 bg-purple-600/90 hover:bg-purple-700 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs font-black border border-purple-300 shadow-lg flex items-center gap-1.5 transition-transform hover:scale-105 z-10"
              title="轉換為水彩、蠟筆或點陣像素畫風"
            >
              <Palette className="w-3.5 h-3.5 text-amber-300 animate-bounce" />
              <span>藝術畫風轉換</span>
            </button>

            {/* Page Number Badge */}
            <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-xs text-white px-3 py-1 rounded-full text-xs font-bold border border-white/20">
              第 {currentPage.pageNumber} / {totalPages} 頁
            </div>

            {/* Interactive Easter Egg Hotspot (隱藏彩蛋按鈕) */}
            <button
              type="button"
              onClick={() => handleTriggerEasterEgg(`click_egg_p${currentPage.pageNumber}`, `第 ${currentPage.pageNumber} 頁魔法探索彩蛋`, '故事寶藏獵人', '🔑')}
              className="absolute bottom-4 right-4 bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-300 hover:from-amber-500 hover:to-yellow-400 text-slate-950 px-3 py-1.5 rounded-full text-xs font-black border-2 border-white shadow-xl flex items-center gap-1.5 transition-transform hover:scale-110 z-20 cursor-pointer animate-pulse"
              title="點擊探索頁面隱藏故事彩蛋，自動發送數位徽章！"
            >
              <Sparkles className="w-3.5 h-3.5 text-slate-950 fill-slate-950" />
              <span>✨ 探索頁面隱藏彩蛋 🔑</span>
            </button>

            {/* Interactive Prompt Chip if available */}
            {currentPage.interactivePrompt && (
              <div className="absolute top-4 left-4 right-4 bg-amber-950/80 backdrop-blur-md text-amber-100 p-3 rounded-2xl text-xs font-semibold border border-amber-400/30 flex items-start gap-2 shadow-lg">
                <Lightbulb className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                <span>{currentPage.interactivePrompt}</span>
              </div>
            )}
          </div>

          {/* Right Column: Story Text & Interactive Words */}
          <div className="p-6 sm:p-8 flex flex-col justify-between bg-amber-50/40 relative">
            <div className="space-y-6">
              
              {/* Primary Story Text */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-amber-800/70 border-b border-amber-200/60 pb-2">
                  <span>{getLanguageByCode(primaryLang).nativeName} 故事內容</span>
                  {isPlayingAudio && <span className="text-orange-600 animate-bounce">🔊 正語音朗讀中...</span>}
                </div>

                <p
                  className={`text-amber-950 font-medium leading-relaxed tracking-wide ${
                    settings.fontSize === 'sm'
                      ? 'text-base sm:text-lg'
                      : settings.fontSize === 'lg'
                      ? 'text-xl sm:text-2xl'
                      : settings.fontSize === 'xl'
                      ? 'text-2xl sm:text-3xl'
                      : 'text-lg sm:text-xl'
                  }`}
                >
                  {primaryText}
                </p>
              </div>

              {/* Secondary Bilingual Dual Text if enabled */}
              {secondaryText && (
                <div className="p-4 bg-amber-100/60 rounded-2xl border border-amber-200/80 space-y-1">
                  <div className="text-xs font-extrabold text-amber-900/70">
                    {getLanguageByCode(secondaryLang as LanguageCode).nativeName} 對照內容
                  </div>
                  <p className="text-amber-900 text-sm sm:text-base font-semibold leading-relaxed">
                    {secondaryText}
                  </p>
                </div>
              )}

              {/* AI Dynamic Translation Output if generated */}
              {customTranslation && (
                <div className="p-4 bg-orange-100/80 rounded-2xl border border-orange-300/80 space-y-1 animate-fadeIn">
                  <div className="text-xs font-extrabold text-orange-950 flex items-center justify-between">
                    <span>✨ AI 多國語言翻譯結果 ({targetTranslateLang})</span>
                    <button onClick={() => setCustomTranslation(null)} className="text-orange-800">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-orange-950 text-sm font-bold leading-relaxed">
                    {customTranslation}
                  </p>
                </div>
              )}

              {/* Vocabulary Interactive Pills */}
              {currentPage.vocab && currentPage.vocab.length > 0 && (
                <div className="space-y-2 pt-2">
                  <div className="text-xs font-extrabold text-amber-900/70 flex items-center gap-1">
                    <Bookmark className="w-3.5 h-3.5 text-amber-600" />
                    <span>本頁焦點生字（點擊查看發音與字義）：</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {currentPage.vocab.map((v, i) => {
                      const isSaved = savedWords.some((sw) => sw.word === v.word);
                      return (
                        <button
                          key={i}
                          onClick={() => setSelectedVocab(v)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-transform hover:scale-105 border ${
                            isSaved
                              ? 'bg-amber-200 text-amber-950 border-amber-400'
                              : 'bg-white text-amber-900 border-amber-300 hover:bg-amber-100'
                          }`}
                        >
                          <span>{v.word}</span>
                          <span className="text-[10px] text-amber-700 font-normal">({v.phonetic})</span>
                          {isSaved && <CheckCircle2 className="w-3 h-3 text-amber-700" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Page Tools Bar */}
            <div className="pt-4 mt-6 border-t border-amber-200/80 flex items-center justify-between text-xs text-amber-800 font-bold">
              
              {/* Dynamic AI Translation Action */}
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline">AI 翻譯本頁至：</span>
                <select
                  value={targetTranslateLang}
                  onChange={(e) => {
                    setTargetTranslateLang(e.target.value);
                    handleDynamicTranslate(e.target.value);
                  }}
                  disabled={isTranslating}
                  className="bg-white border border-amber-300 rounded-xl px-2.5 py-1 text-xs font-bold text-amber-950 focus:outline-none"
                >
                  <option value="法文">🇫🇷 法文</option>
                  <option value="德文">🇩🇪 德文</option>
                  <option value="西班牙文">🇪🇸 西班牙文</option>
                  <option value="韓文">🇰🇷 韓文</option>
                  <option value="日文">🇯🇵 日文</option>
                  <option value="越南文">🇻🇳 越南文</option>
                </select>

                {isTranslating && <span className="text-orange-600 animate-spin">⌛</span>}
              </div>

              {/* Auto Play Timer Toggle */}
              <button
                onClick={() => setAutoPlayTimer(!autoPlayTimer)}
                className={`px-3 py-1 rounded-xl text-xs font-bold border transition-colors ${
                  autoPlayTimer
                    ? 'bg-orange-500 text-white border-orange-600'
                    : 'bg-white text-amber-900 border-amber-300 hover:bg-amber-100'
                }`}
              >
                {autoPlayTimer ? '⏸ 播報模式開啟中' : '▶ 自動翻頁'}
              </button>
            </div>
          </div>
        </div>

          {/* Friendly Guidance Bubble Overlay (引導泡泡) */}
          {guidanceBubble.show && (
            <div className="absolute bottom-6 right-6 z-40 max-w-xs sm:max-w-sm p-4 rounded-3xl bg-slate-900/95 border-2 border-amber-400 text-slate-100 shadow-2xl backdrop-blur-md animate-bounce-short space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-2xl bg-amber-400 text-slate-950 font-black text-xl shadow-md">
                    {guidanceBubble.type === 'too_fast' ? '🏃' : '🤔'}
                  </span>
                  <div>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-400 text-slate-950">
                      {guidanceBubble.type === 'too_fast' ? '⚡ 翻頁較快引導' : '💡 閱讀思考陪伴小引導'}
                    </span>
                    <h5 className="font-black text-xs text-amber-200 mt-0.5">童心引導泡泡</h5>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setGuidanceBubble((prev) => ({ ...prev, show: false }))}
                  className="p-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-200 font-bold leading-relaxed">
                {guidanceBubble.message}
              </p>

              <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    handleToggleAudio();
                    setGuidanceBubble((prev) => ({ ...prev, show: false }));
                  }}
                  className="px-3 py-1.5 rounded-xl bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1 hover:bg-amber-300 cursor-pointer shadow-xs"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>🔊 聽語音朗讀</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsGuideModalOpen(true);
                    setGuidanceBubble((prev) => ({ ...prev, show: false }));
                  }}
                  className="px-3 py-1.5 rounded-xl bg-purple-600 text-white font-black text-xs flex items-center gap-1 hover:bg-purple-500 cursor-pointer shadow-xs"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>🧭 故事導覽</span>
                </button>

                <button
                  type="button"
                  onClick={() => setGuidanceBubble((prev) => ({ ...prev, show: false }))}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-700 cursor-pointer"
                >
                  我知道了
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Bottom Interactive Reading Progress & Navigation Scrubber Footer */}
      <footer className="bg-gradient-to-b from-amber-50/95 to-amber-100/95 dark:from-slate-900/95 dark:to-slate-950/95 border-t border-amber-200/90 dark:border-slate-800 py-3 px-4 sticky bottom-0 z-20 backdrop-blur-md space-y-2.5">
        <div className="max-w-4xl mx-auto space-y-2">
          
          {/* Top Status Row: Page Counter, Title, Focus Time, Percentage */}
          <div className="flex items-center justify-between text-xs font-black text-amber-950 dark:text-amber-200">
            <div className="flex items-center gap-2">
              <span className="bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold shadow-xs">
                第 {currentPageIndex + 1} / {totalPages} 頁
              </span>
              <span className="hidden sm:inline text-amber-800 dark:text-amber-300 font-bold">
                《{book.title['zh-TW'] || book.title.en}》
              </span>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <span className="text-[11px] font-extrabold text-amber-800 dark:text-amber-300 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                專注 {formatFocusTime(focusSeconds)}
              </span>
              <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-2.5 py-0.5 rounded-full text-[11px] font-black shadow-xs">
                進度 {Math.round(((currentPageIndex + 1) / totalPages) * 100)}%
              </span>
            </div>
          </div>

          {/* 🎚️ Interactive Progress Slider & Scrubber Track */}
          <div className="relative py-1 flex items-center">
            {/* Background Track with Gradient Fill */}
            <div className="relative w-full h-3.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden border border-amber-300/80 dark:border-amber-700/80 shadow-inner">
              <div
                className="bg-gradient-to-r from-amber-400 via-orange-500 to-emerald-400 h-full rounded-full transition-all duration-300 relative shadow-md"
                style={{ width: `${((currentPageIndex + 1) / totalPages) * 100}%` }}
              >
                <div className="absolute inset-0 bg-white/25 animate-pulse rounded-full" />
              </div>
            </div>

            {/* Overlaid Vocab Word Marker Dots on the Slider Track */}
            <div className="absolute inset-x-0 flex items-center justify-between px-2 pointer-events-none">
              {book.pages.map((p, idx) => {
                const hasVocab = p.vocab && p.vocab.length > 0;
                const isCurrent = idx === currentPageIndex;
                return (
                  <div
                    key={idx}
                    className={`relative flex items-center justify-center transition-all ${
                      isCurrent
                        ? 'w-4 h-4 rounded-full bg-white ring-2 ring-amber-500 shadow-md scale-110'
                        : hasVocab
                        ? 'w-2.5 h-2.5 rounded-full bg-amber-300 border border-amber-600 shadow-xs'
                        : 'w-2 h-2 rounded-full bg-slate-400/40'
                    }`}
                  >
                    {hasVocab && idx !== currentPageIndex && (
                      <span className="absolute -top-3.5 text-[9px]">🏷️</span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Native Smooth Range Input Scrubber Slider */}
            <input
              id="reader-progress-range-slider"
              type="range"
              min={0}
              max={totalPages - 1}
              step={1}
              value={currentPageIndex}
              onChange={(e) => triggerPageChange(Number(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              title="滑動進度條快速切換繪本頁面"
            />
          </div>

          {/* 🏷️ 曾停留/焦點生字詞標籤快速跳轉列 (Vocab Fast Jump Tags) */}
          {allBookVocabs.length > 0 && (
            <div className="bg-amber-100/60 dark:bg-slate-800/60 border border-amber-300/40 dark:border-slate-700/60 rounded-2xl p-2 space-y-1">
              <div className="flex items-center justify-between text-[11px] font-bold text-amber-900 dark:text-amber-200 px-1">
                <span className="flex items-center gap-1">
                  <Bookmark className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>生字詞標籤跳轉（點擊直達該頁）：</span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsVocabJumpExpanded(!isVocabJumpExpanded)}
                  className="text-amber-700 dark:text-amber-300 hover:underline cursor-pointer"
                >
                  {isVocabJumpExpanded ? '收合標籤' : '展開標籤'}
                </button>
              </div>

              {isVocabJumpExpanded && (
                <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
                  {allBookVocabs.map((item, idx) => {
                    const isCurrentPage = currentPage.pageNumber === item.pageNum;
                    const isHighlighted = jumpHighlightedWord === item.vocab.word;

                    return (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => handleJumpToVocabPage(item.pageNum, item.vocab.word)}
                        className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1 border cursor-pointer ${
                          isHighlighted
                            ? 'bg-amber-400 text-slate-950 border-amber-500 scale-110 shadow-md ring-2 ring-amber-300 animate-bounce'
                            : isCurrentPage
                            ? 'bg-amber-300 text-amber-950 border-amber-400 shadow-xs'
                            : item.isSaved
                            ? 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-400/50 hover:bg-emerald-500/30'
                            : 'bg-white/80 dark:bg-slate-700 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-600 hover:bg-amber-200/50'
                        }`}
                        title={`跳轉至第 ${item.pageNum} 頁生字：${item.vocab.word}`}
                      >
                        <span className="text-[10px] opacity-75">P.{item.pageNum}</span>
                        <span>{item.vocab.word}</span>
                        {item.isSaved && <span className="text-[10px]">⭐</span>}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Bottom Row: Prev Page / Creative Sequel & Mood & Vault Tools / Next Page */}
          <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3 pt-0.5">
            <button
              id="btn-reader-prev-page"
              onClick={handlePrevPage}
              disabled={currentPageIndex === 0}
              className="flex items-center gap-1.5 bg-white dark:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-amber-200/80 dark:hover:bg-slate-700 text-amber-950 dark:text-white font-extrabold px-3.5 sm:px-4 py-2 rounded-2xl border border-amber-300 dark:border-slate-700 shadow-2xs transition-transform hover:scale-105 cursor-pointer text-xs sm:text-sm"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>上一頁</span>
            </button>

            {/* AI Sequel, Mood & Digital Treasure Vault Quick Action Toolbar */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                id="btn-bottom-treasure-vault"
                onClick={() => {
                  setIsTreasureVaultOpen(true);
                  playStarChime();
                }}
                className="px-3 py-1.5 sm:py-2 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md border border-amber-300 hover:scale-105 transition-all cursor-pointer shrink-0"
              >
                <Trophy className="w-4 h-4 text-slate-950" />
                <span>🏆 數位寶箱</span>
              </button>

              <button
                id="btn-bottom-ai-sequel"
                onClick={() => setIsSequelModalOpen(true)}
                className="px-3 py-1.5 sm:py-2 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:from-purple-500 hover:to-amber-400 text-white font-black text-xs flex items-center gap-1.5 shadow-md border border-purple-300/50 hover:scale-105 transition-all cursor-pointer shrink-0"
              >
                <Wand2 className="w-4 h-4 text-amber-300" />
                <span>✨ 故事續寫</span>
              </button>

              <button
                id="btn-bottom-mood-dashboard"
                onClick={() => setIsMoodDashboardOpen(true)}
                className="px-3 py-1.5 sm:py-2 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-black text-xs flex items-center gap-1.5 shadow-md border border-pink-300/50 hover:scale-105 transition-all cursor-pointer shrink-0"
              >
                <Heart className="w-4 h-4 fill-white text-white" />
                <span>💖 心情</span>
              </button>
            </div>

            <button
              id="btn-reader-next-page"
              onClick={handleNextPage}
              className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black px-4 sm:px-5 py-2 rounded-2xl shadow-md transition-transform hover:scale-105 cursor-pointer text-xs sm:text-sm"
            >
              <span>{currentPageIndex === totalPages - 1 ? '完成閱讀 🏆' : '下一頁'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </footer>

      {/* Vocab Modal */}
      {selectedVocab && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border-2 border-amber-300 shadow-2xl space-y-4 relative">
            <button
              onClick={() => setSelectedVocab(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-amber-100 text-amber-900"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-700 font-extrabold text-xl border border-amber-300">
                🔤
              </div>
              <div>
                <h3 className="text-2xl font-black text-amber-950">{selectedVocab.word}</h3>
                <p className="text-xs font-bold text-amber-700">[{selectedVocab.phonetic}] • {selectedVocab.translation}</p>
              </div>
            </div>

            <div className="space-y-2 bg-amber-50 p-4 rounded-2xl border border-amber-200">
              <div className="text-xs font-bold text-amber-800">【簡單釋義】</div>
              <p className="text-sm font-semibold text-amber-950">{selectedVocab.definition}</p>

              {selectedVocab.exampleSentence && (
                <>
                  <div className="text-xs font-bold text-amber-800 pt-2">【例句參考】</div>
                  <p className="text-xs font-medium text-amber-900 italic">"{selectedVocab.exampleSentence}"</p>
                </>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => speakText(selectedVocab.word, getLanguageByCode(primaryLang).speechCode, 0.9)}
                className="flex items-center gap-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold px-3.5 py-2 rounded-xl text-xs"
              >
                <Volume2 className="w-4 h-4 text-amber-700" />
                <span>發音朗讀</span>
              </button>

              <button
                onClick={() => handleSaveWord(selectedVocab)}
                className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white font-extrabold px-4 py-2 rounded-xl text-xs shadow-xs"
              >
                <Bookmark className="w-4 h-4" />
                <span>{vocabAddedMessage ? '已加入生字本！⭐' : '收藏至生字本'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Story Companion Sidebar (Little Owl 🦉) */}
      {isBuddyOpen && (
        <div className="fixed right-0 top-0 bottom-0 w-full sm:w-96 bg-amber-50 border-l border-amber-200 shadow-2xl z-40 flex flex-col justify-between animate-slideLeft">
          
          {/* Header */}
          <div className="p-4 bg-amber-200/80 border-b border-amber-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🦉</span>
              <div>
                <h3 className="font-extrabold text-amber-950 text-sm">小貓頭鷹故事小夥伴</h3>
                <p className="text-[10px] font-bold text-amber-800">隨時為孩子解答故事疑問與發想思考</p>
              </div>
            </div>
            <button onClick={() => setIsBuddyOpen(false)} className="p-1 rounded-full hover:bg-amber-300 text-amber-950">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Conversation History */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {buddyMessages.length === 0 ? (
              <div className="text-center py-8 space-y-3">
                <span className="text-4xl">🌟</span>
                <p className="text-xs font-bold text-amber-900/80">
                  嗨！我是小貓頭鷹。點擊下方問題，或者輸入你想問的事情吧！
                </p>

                {/* Quick Prompts */}
                <div className="space-y-2 pt-2">
                  <button
                    onClick={() => handleAskBuddy('這個故事想要告訴我們什麼道理呢？')}
                    className="w-full text-left bg-white p-2.5 rounded-xl border border-amber-200 text-xs font-bold text-amber-900 hover:bg-amber-100 transition-colors"
                  >
                    💡 這個故事想要告訴我們什麼道理呢？
                  </button>

                  <button
                    onClick={() => handleAskBuddy('如果我是主角，我會做什麼決定？')}
                    className="w-full text-left bg-white p-2.5 rounded-xl border border-amber-200 text-xs font-bold text-amber-900 hover:bg-amber-100 transition-colors"
                  >
                    🤔 如果我是主角，我會做什麼決定？
                  </button>
                </div>
              </div>
            ) : (
              buddyMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-2xl text-xs font-medium ${
                      msg.role === 'user'
                        ? 'bg-amber-600 text-white rounded-br-none'
                        : 'bg-white border border-amber-200 text-amber-950 rounded-bl-none shadow-2xs'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))
            )}

            {isBuddyLoading && (
              <div className="flex justify-start">
                <div className="bg-white p-3 rounded-2xl text-xs font-bold text-amber-900 flex items-center gap-2 border border-amber-200">
                  <span className="animate-spin">🦉</span>
                  <span>小貓頭鷹思考中...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input Footer */}
          <div className="p-3 bg-white border-t border-amber-200">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAskBuddy();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={buddyInput}
                onChange={(e) => setBuddyInput(e.target.value)}
                placeholder="問小貓頭鷹關於這篇故事..."
                className="flex-1 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
              <button
                type="submit"
                disabled={isBuddyLoading}
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-3 py-2 rounded-xl text-xs shadow-2xs"
              >
                發送
              </button>
            </form>
          </div>
        </div>
      )}

      {/* AI Interactive Story Quiz Modal */}
      <StoryQuizModal
        isOpen={isQuizOpen}
        onClose={() => setIsQuizOpen(false)}
        book={book}
        primaryLang={primaryLang}
        onAwardStar={onAwardStar}
      />

      {/* Book Guide Story Companion Modal */}
      <StoryGuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
        book={book}
        primaryLang={primaryLang}
        onStartReading={() => {
          setIsGuideModalOpen(false);
          setCurrentPageIndex(0);
        }}
        darkMode={settings.darkMode}
      />

      {/* Story Speech Emotion Analyzer Modal */}
      <StoryEmotionAnalyzerModal
        isOpen={isEmotionModalOpen}
        onClose={() => setIsEmotionModalOpen(false)}
        pageText={currentPage.text[primaryLang] || currentPage.text['zh-TW'] || currentPage.text['en'] || ''}
        primaryLang={primaryLang}
        voiceRole={settings.voiceRole}
        darkMode={settings.darkMode}
      />

      {/* AI Art Style Transformation Modal */}
      <ArtStyleConverterModal
        isOpen={isArtStyleModalOpen}
        onClose={() => setIsArtStyleModalOpen(false)}
        illustrationUrl={styledPages[currentPage.pageNumber] || currentPage.illustrationUrl}
        pageNumber={currentPage.pageNumber}
        onApplyStyle={(styledUrl) => {
          setStyledPages((prev) => ({ ...prev, [currentPage.pageNumber]: styledUrl }));
        }}
        darkMode={settings.darkMode}
      />

      {/* Background Music & Audio FX Selector Modal */}
      {isMusicMenuOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-amber-200 dark:border-amber-800 shadow-2xl max-w-lg w-full p-5 sm:p-6 relative max-h-[90vh] overflow-y-auto space-y-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-amber-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-md">
                  <Music className="w-5 h-5 animate-bounce" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-amber-950 dark:text-amber-100">
                    繪本朗讀配樂與音效選單
                  </h3>
                  <p className="text-xs font-medium text-amber-900/70 dark:text-slate-400">
                    即時微調背景音樂音量與沉浸氛圍樂章
                  </p>
                </div>
              </div>

              <button
                type="button"
                id="btn-close-music-menu"
                onClick={() => setIsMusicMenuOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Real-time Volume Adjustment Slider */}
            <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-slate-800/80 border border-amber-200/80 dark:border-slate-700 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-amber-950 dark:text-amber-200 flex items-center gap-1.5">
                  <Volume2 className="w-4 h-4 text-orange-500" />
                  <span>背景配樂即時音量大小</span>
                </label>
                <span className="text-sm font-black text-orange-600 dark:text-orange-400 bg-white dark:bg-slate-900 px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-slate-700 shadow-2xs">
                  {bgMusicTrack === 'off' ? '靜音 (0%)' : `${Math.round(bgMusicVolume * 100)}%`}
                </span>
              </div>

              <input
                type="range"
                min={0.05}
                max={1.0}
                step={0.05}
                value={bgMusicVolume}
                disabled={bgMusicTrack === 'off'}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setBgMusicVolume(val);
                  setBackgroundAmbienceVolume(val);
                }}
                className="w-full h-2 bg-amber-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500 disabled:opacity-40"
              />

              <div className="flex justify-between text-[10px] text-amber-900/60 dark:text-slate-400 font-bold px-1">
                <span>🔉 微弱陪伴 (10%)</span>
                <span>🔊 標準和聲 (50%)</span>
                <span>📢 澎湃包覆 (100%)</span>
              </div>
            </div>

            {/* Ambient Tracks Grid */}
            <div className="space-y-2">
              <h4 className="text-xs font-black text-amber-900 dark:text-amber-200 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>切換情境原聲帶</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {BG_MUSIC_PLAYLIST.map((track) => {
                  const isActive = bgMusicTrack === track.id;
                  return (
                    <button
                      type="button"
                      key={track.id}
                      id={`btn-select-music-track-${track.id}`}
                      onClick={() => setBgMusicTrack(track.id)}
                      className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between gap-1.5 shadow-2xs ${
                        isActive
                          ? 'bg-amber-100 dark:bg-amber-950/80 border-amber-400 dark:border-amber-600 ring-2 ring-amber-400/50 scale-[1.02]'
                          : 'bg-white hover:bg-amber-50/60 dark:bg-slate-800 dark:hover:bg-slate-700/60 border-amber-200 dark:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-black text-amber-950 dark:text-amber-100 flex items-center gap-1.5">
                          <span>{track.emoji}</span>
                          <span>{track.name}</span>
                        </span>
                        <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-amber-200/70 dark:bg-slate-700 text-amber-900 dark:text-amber-300">
                          {track.categoryTag}
                        </span>
                      </div>
                      <p className="text-[11px] text-amber-900/70 dark:text-slate-300 leading-tight">
                        {track.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sound Effects Testing (翻頁音效 & 獎勵音效) */}
            <div className="pt-2 border-t border-amber-100 dark:border-slate-800 space-y-2">
              <h4 className="text-xs font-black text-amber-900 dark:text-amber-200 flex items-center gap-1">
                <Volume2 className="w-3.5 h-3.5 text-orange-500" />
                <span>閱讀音效試聽</span>
              </h4>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  id="btn-test-page-flip-sound"
                  onClick={() => playPageTurnSound()}
                  className="py-2 px-3 rounded-xl bg-white hover:bg-amber-50 dark:bg-slate-800 dark:hover:bg-slate-700 border border-amber-200 dark:border-slate-700 text-amber-950 dark:text-amber-100 text-xs font-black flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>📖 試聽翻頁紙張聲</span>
                </button>

                <button
                  type="button"
                  id="btn-test-star-chime-sound"
                  onClick={() => playStarChime()}
                  className="py-2 px-3 rounded-xl bg-white hover:bg-amber-50 dark:bg-slate-800 dark:hover:bg-slate-700 border border-amber-200 dark:border-slate-700 text-amber-950 dark:text-amber-100 text-xs font-black flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>✨ 試聽星星獲得音效</span>
                </button>
              </div>
            </div>

            {/* Audio Trio Harmony Status Footer */}
            <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-extrabold flex items-center justify-between shadow-md">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                <span>三重奏音效已完美就緒</span>
              </span>
              <span className="text-[11px] bg-white/20 px-2 py-0.5 rounded-full backdrop-blur-xs">
                {bgMusicTrack === 'off' ? '僅TTS語音朗讀' : '配樂 + TTS + 翻頁音效'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Digital Souvenir Collectibles Unboxing Claim Modal */}
      <CollectibleClaimModal
        isOpen={isCollectibleModalOpen}
        onClose={() => {
          setIsCollectibleModalOpen(false);
          setIsQuizOpen(true); // Open AI quiz after claiming collectibles!
        }}
        bookTitle={typeof book.title === 'string' ? book.title : (book.title['zh-TW'] || book.title.en)}
        collectibles={unlockedCollectibles}
        onGoToProfile={() => {
          setIsCollectibleModalOpen(false);
          onBack(); // Return to main view to see profile
        }}
        darkMode={settings.darkMode}
      />

      {/* 🎨 Theme Background Selector Modal (繪本藝術主題背景切換) */}
      {isThemeMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border-2 border-purple-500/50 rounded-3xl max-w-lg w-full p-6 text-white shadow-2xl relative space-y-5">
            <div className="flex items-center justify-between border-b border-purple-500/30 pb-4">
              <div className="flex items-center gap-2">
                <Palette className="w-6 h-6 text-purple-400 animate-bounce" />
                <h3 className="text-lg font-black text-white">🎨 繪本沉浸式主題背景</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsThemeMenuOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-purple-950/60 border border-purple-500/30 text-xs font-bold text-purple-200 flex items-center justify-between">
              <span>💡 自動感應本書類別主題：</span>
              <span className="bg-purple-500/40 text-purple-100 font-extrabold px-2.5 py-1 rounded-full border border-purple-400/30">
                {THEME_CONFIGS[detectReaderThemeForBook(book)]?.name}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 max-h-[360px] overflow-y-auto pr-1">
              {(Object.keys(THEME_CONFIGS) as SocialThemeBackground[]).map((themeKey) => {
                const cfg = THEME_CONFIGS[themeKey];
                const isSelected = activeReaderTheme === themeKey;
                return (
                  <button
                    type="button"
                    key={themeKey}
                    id={`btn-select-reader-theme-${themeKey}`}
                    onClick={() => {
                      setActiveReaderTheme(themeKey);
                      playPageTurnSound();
                    }}
                    className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between gap-2 shadow-md relative overflow-hidden group ${
                      isSelected
                        ? 'border-purple-400 ring-2 ring-purple-400/80 scale-[1.02]'
                        : 'border-white/10 hover:border-white/30 hover:scale-[1.01]'
                    }`}
                  >
                    {/* Background Preview */}
                    <div className={`absolute inset-0 opacity-40 bg-gradient-to-br ${cfg.darkBgGradient}`} />

                    <div className="relative z-10 flex items-center justify-between">
                      <span className="text-2xl">{cfg.icon}</span>
                      {isSelected && (
                        <span className="bg-purple-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm">
                          目前使用
                        </span>
                      )}
                    </div>

                    <div className="relative z-10 space-y-0.5">
                      <h4 className="font-extrabold text-sm text-white drop-shadow-sm">{cfg.name}</h4>
                      <p className="text-[10px] text-slate-300 flex gap-1">
                        {cfg.bgDecorativeIcons.slice(0, 4).join(' ')}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-purple-500/30">
              <button
                type="button"
                onClick={() => {
                  setActiveReaderTheme(detectReaderThemeForBook(book));
                  playStarChime();
                }}
                className="text-xs font-extrabold text-purple-300 hover:text-purple-100 underline underline-offset-2 flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>恢復書籍預設藝術主題</span>
              </button>

              <button
                type="button"
                onClick={() => setIsThemeMenuOpen(false)}
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-black text-xs shadow-lg transition-transform hover:scale-105"
              >
                確定套用背景
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 💬 Reading Social Wall Share Modal (閱讀心得發布至社交牆) */}
      {isSocialShareModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border-2 border-indigo-500/50 rounded-3xl max-w-lg w-full p-6 text-white shadow-2xl relative space-y-5">
            <div className="flex items-center justify-between border-b border-indigo-500/30 pb-4">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-6 h-6 text-indigo-400 animate-bounce" />
                <h3 className="text-lg font-black text-white">💬 童心閱讀社交牆 - 分享閱讀心得</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsSocialShareModalOpen(false);
                  setSocialPostSuccess(false);
                }}
                className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Book Info Card Preview */}
            <div className={`p-4 rounded-2xl border border-indigo-400/40 bg-gradient-to-br ${currentThemeConfig.darkBgGradient} space-y-2 relative overflow-hidden`}>
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold bg-indigo-500/80 text-white px-2.5 py-0.5 rounded-full">
                  {book.originCountry} {book.flag}
                </span>
                <span className="text-indigo-200 font-bold">
                  第 {currentPageIndex + 1} / {totalPages} 頁
                </span>
              </div>
              <h4 className="font-black text-base text-white">{book.title['zh-TW'] || book.title.en}</h4>
              <p className="text-xs text-indigo-100 line-clamp-2 italic opacity-90">
                "{primaryText}"
              </p>
            </div>

            {socialPostSuccess ? (
              <div className="p-5 rounded-2xl bg-emerald-500/20 border border-emerald-400 text-center space-y-2 animate-fadeIn">
                <div className="text-3xl">🎉✨</div>
                <h4 className="font-black text-emerald-300 text-base">成功分享至童心閱讀社交牆！</h4>
                <p className="text-xs text-emerald-100">獲得 +3 顆魔法童心星星獎勵！你的童年小夥伴們很快就能看到你的心得囉！</p>
              </div>
            ) : (
              <div className="space-y-3">
                <label className="block text-xs font-black text-indigo-200">
                  寫下你在這頁學到的金句、心得或想法：
                </label>
                <textarea
                  value={socialPostContent}
                  onChange={(e) => setSocialPostContent(e.target.value)}
                  placeholder="例如：今天讀到這裡覺得故事主角超級有勇氣！非常推薦大家一起讀～✨"
                  rows={3}
                  className="w-full p-3.5 rounded-2xl bg-slate-800 border border-indigo-400/40 text-white text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 font-medium"
                />

                <div className="flex items-center justify-between pt-2">
                  <div className="text-[11px] font-bold text-amber-300 flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                    <span>發布可得 +3 星星獎勵</span>
                  </div>

                  <button
                    type="button"
                    id="btn-submit-social-post"
                    onClick={() => {
                      if (!socialPostContent.trim()) return;
                      onAwardStar(3);
                      playStarChime();
                      setSocialPostSuccess(true);
                      setTimeout(() => {
                        setIsSocialShareModalOpen(false);
                        setSocialPostSuccess(false);
                        setSocialPostContent('');
                      }, 1800);
                    }}
                    disabled={!socialPostContent.trim()}
                    className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-black text-xs shadow-lg transition-transform hover:scale-105 disabled:opacity-50 cursor-pointer"
                  >
                    ✨ 立即公開發布至社交牆
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {/* 🖍️ Digital Crayon Canvas Modal (數位蠟筆畫布塗鴉彈窗) */}
      <CrayonCanvasModal
        isOpen={isCrayonCanvasOpen}
        onClose={() => setIsCrayonCanvasOpen(false)}
        bgImageUrl={styledPages[currentPageIndex] || currentPage.imageUrl}
        bookTitle={book.title['zh-TW'] || book.title.en}
        pageNumber={currentPageIndex + 1}
        onAwardStar={onAwardStar}
      />

      {/* ⏱ Reading Focus Timer Settings Modal (閱讀專注計時器選單) */}
      {isFocusModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-amber-400 dark:border-amber-600 shadow-2xl max-w-md w-full p-6 relative space-y-6">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b pb-3 border-amber-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950 font-black shadow-md">
                  <Clock className="w-6 h-6 animate-spin" style={{ animationDuration: '6s' }} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-amber-950 dark:text-amber-100">
                    ⏱ 繪本專注閱讀計時器
                  </h3>
                  <p className="text-xs font-bold text-amber-800 dark:text-amber-300">
                    引導孩子培養自主閱讀好習慣
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsFocusModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Timer Display Circle */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-slate-800 dark:to-slate-800/80 border-2 border-amber-300/80 dark:border-amber-700 text-center space-y-3 shadow-inner">
              <span className="text-xs font-black bg-amber-400 text-slate-950 px-3 py-1 rounded-full shadow-2xs">
                {isFocusRunning ? '⏳ 專注計時進行中' : '⏸ 計時暫停中'}
              </span>

              <div className="text-4xl sm:text-5xl font-black text-amber-950 dark:text-amber-200 tracking-wider font-mono">
                {formatFocusTime(focusSeconds)}
              </div>

              <div className="text-xs text-amber-800 dark:text-amber-300 font-bold">
                當前專注目標：<span className="text-orange-600 dark:text-orange-400 font-black text-sm">{focusTargetMinutes} 分鐘</span>
                {hasAwardedFocusStar ? ' (已達成達標獎勵 🎉)' : ` (還差 ${Math.max(0, Math.ceil((focusTargetMinutes * 60 - focusSeconds) / 60))} 分鐘)`}
              </div>
            </div>

            {/* Target Selection Pills */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold text-amber-950 dark:text-amber-200">
                🎯 設定閱讀專注目標分鐘數：
              </label>

              <div className="grid grid-cols-4 gap-2">
                {[5, 10, 15, 20].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => {
                      setFocusTargetMinutes(mins);
                      if (focusSeconds >= mins * 60) setHasAwardedFocusStar(true);
                      else setHasAwardedFocusStar(false);
                      playPageTurnSound();
                    }}
                    className={`py-2 rounded-xl font-black text-xs border transition-all cursor-pointer ${
                      focusTargetMinutes === mins
                        ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md scale-105'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-amber-100'
                    }`}
                  >
                    {mins} 分鐘
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setFocusSeconds(0);
                  setHasAwardedFocusStar(false);
                  playPageTurnSound();
                }}
                className="px-3.5 py-2.5 rounded-2xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>重設</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsFocusModalOpen(false);
                  setIsFocusAchievementModalOpen(true);
                  playStarChime();
                }}
                className="px-3 py-2.5 rounded-2xl bg-amber-400/20 hover:bg-amber-400/30 text-amber-900 dark:text-amber-300 border border-amber-400/50 font-black text-xs flex items-center gap-1 cursor-pointer"
                title="查看個人專注成就系統"
              >
                <Trophy className="w-3.5 h-3.5 text-amber-500" />
                <span>專注成就 🎯</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsFocusRunning(!isFocusRunning);
                  playPageTurnSound();
                }}
                className={`px-5 py-2.5 rounded-2xl font-black text-xs text-white shadow-md flex items-center gap-1.5 transition-transform hover:scale-105 cursor-pointer ${
                  isFocusRunning
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : 'bg-emerald-500 hover:bg-emerald-600'
                }`}
              >
                {isFocusRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isFocusRunning ? '暫停計時' : '繼續專注計時'}</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 🎭 AI Story Character Interactive Roleplay Modal (與故事主角對話彈窗) */}
      <StoryCharacterRoleplayModal
        isOpen={isRoleplayModalOpen}
        onClose={() => setIsRoleplayModalOpen(false)}
        book={book}
        currentPageIndex={currentPageIndex}
        profile={profile}
        onAwardStar={onAwardStar}
        onIncrementRoleplayCount={() => {
          setRoleplayCount((prev) => {
            const next = prev + 1;
            try {
              localStorage.setItem(`pwa_roleplay_count_${book.id}`, String(next));
            } catch (e) {}
            return next;
          });
        }}
        darkMode={false}
      />

      {/* 🎯 Personal Focus Achievement System Modal (個人專注成就系統彈窗) */}
      <PersonalFocusAchievementModal
        isOpen={isFocusAchievementModalOpen}
        onClose={() => setIsFocusAchievementModalOpen(false)}
        focusSeconds={focusSeconds}
        rhythmCombo={rhythmCombo}
        roleplayCount={roleplayCount}
        profile={profile}
        onAwardStar={onAwardStar}
        onUpdateProfile={onUpdateProfile ? (updated) => {
          if (typeof updated === 'function') {
            onUpdateProfile(updated(profile || { id: 'default', name: '小讀者', avatar: '🐻', role: 'reader', points: 0, stars: 0, streakDays: 1, readingMinutes: 0, badges: [], level: 1, currentBadge: '童心讀者', dailyTargetMinutes: 20, lastReadDate: '' }));
          } else {
            onUpdateProfile(updated);
          }
        } : undefined}
        currentBook={book}
        darkMode={false}
      />

      {/* 🏆 Story Quiz Challenge Modal (繪本闖關問答彈窗) */}
      {profile && onUpdateProfile && (
        <StoryQuizChallengeModal
          isOpen={isQuizChallengeOpen}
          onClose={() => setIsQuizChallengeOpen(false)}
          book={book}
          profile={profile}
          onUpdateProfile={onUpdateProfile}
          onTriggerCelebration={() => {
            onAwardStar(15);
          }}
        />
      )}

      {/* 🥽 AR Expanded Reality Book Preview Modal (AR 擴增實境預覽彈窗) */}
      <ARBookPreviewModal
        isOpen={isARModalOpen}
        onClose={() => setIsARModalOpen(false)}
        book={book}
        onAwardStar={onAwardStar}
      />

      {/* ✨ AI Story Sequel Generator Modal (AI 故事續寫彈窗) */}
      <StorySequelGeneratorModal
        isOpen={isSequelModalOpen}
        onClose={() => setIsSequelModalOpen(false)}
        book={book}
        primaryLang={primaryLang}
        onAwardStar={onAwardStar}
      />

      {/* 💖 Reading Mood & Sentiment Dashboard Modal (閱讀心情儀表板彈窗) */}
      <ReadingMoodDashboardModal
        isOpen={isMoodDashboardOpen}
        onClose={() => setIsMoodDashboardOpen(false)}
        book={book}
        focusSeconds={focusSeconds}
        primaryLang={primaryLang}
        onAwardStar={onAwardStar}
      />

      {/* ⚡ Offline Analytics & Storage Management Modal (離線與數據統計彈窗) */}
      <OfflineAnalyticsModal
        isOpen={isOfflineAnalyticsOpen}
        onClose={() => setIsOfflineAnalyticsOpen(false)}
        userProfile={profile}
        userWordsCount={savedWords.length}
      />

      {/* 🍅 Floating Pomodoro Focus Timer Widget (懸浮式番茄閱讀專注器) */}
      <FloatingPomodoroTimer
        onAwardStar={onAwardStar}
        onStatusChange={setPomodoroStatus}
      />

      {/* 🧠 AI 閱讀理解雙語思維導圖 (AI Reading Comprehension Map Modal) */}
      <ReadingComprehensionMapModal
        isOpen={isComprehensionMapOpen}
        onClose={() => setIsComprehensionMapOpen(false)}
        book={book}
      />

      {/* 🤖 AI 閱讀理解輔助器面板 (AI Reading Assistant Modal) */}
      <AiReadingAssistantModal
        isOpen={isAiAssistantOpen}
        onClose={() => setIsAiAssistantOpen(false)}
        book={book}
        currentPageIndex={currentPageIndex}
        onJumpToPage={(targetPageIdx) => {
          if (targetPageIdx >= 0 && targetPageIdx < book.pages.length) {
            setCurrentPageIndex(targetPageIdx);
            setIsAiAssistantOpen(false);
          }
        }}
        onOpenLeaderboard={() => {
          setIsAiAssistantOpen(false);
          setIsLeaderboardOpen(true);
        }}
      />

      {/* 👥 AI 共讀室面板 (AI Co-Reading Room Modal & Focus Dashboard) */}
      <AiCoReadingRoomModal
        isOpen={isCoReadingRoomOpen}
        onClose={() => setIsCoReadingRoomOpen(false)}
        book={book}
        currentPageIndex={currentPageIndex}
        onJumpToPage={(targetPageIdx) => {
          if (targetPageIdx >= 0 && targetPageIdx < book.pages.length) {
            setCurrentPageIndex(targetPageIdx);
          }
        }}
      />

      {/* 🗺️ 故事脈絡地圖面板 (Story Context Map Modal, Rhythm Analytics & Social Wall) */}
      <StoryContextMapModal
        isOpen={isContextMapOpen}
        onClose={() => setIsContextMapOpen(false)}
        book={book}
        currentPageIndex={currentPageIndex}
        onJumpToPage={(targetPageIdx) => {
          if (targetPageIdx >= 0 && targetPageIdx < book.pages.length) {
            setCurrentPageIndex(targetPageIdx);
          }
        }}
        profile={profile}
      />

      {/* 🏆 成就排行榜彈窗 (Achievement Leaderboard Modal) */}
      {isLeaderboardOpen && profile && onUpdateProfile && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
          <div className="w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl bg-slate-900 border-2 border-amber-400 p-2 relative shadow-2xl">
            <button
              type="button"
              onClick={() => setIsLeaderboardOpen(false)}
              className="absolute top-4 right-4 z-10 p-2.5 rounded-2xl bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors cursor-pointer"
              title="關閉排行榜"
            >
              <X className="w-6 h-6" />
            </button>
            <AchievementLeaderboard
              profile={profile}
              onUpdateProfile={onUpdateProfile}
              darkMode={true}
            />
          </div>
        </div>
      )}

      {/* 🏆 故事完讀成就卡彈窗 (Story Achievement Card Modal) */}
      {profile && (
        <StoryAchievementCardModal
          isOpen={isStoryAchievementCardOpen}
          onClose={() => setIsStoryAchievementCardOpen(false)}
          book={book}
          profile={profile}
          timeSpentMinutes={Math.max(1, Math.round(focusSeconds / 60))}
          onSaveToCollectibles={(collectible) => {
            if (onUpdateProfile && profile) {
              const currentCollectibles = profile.collectibles || [];
              if (!currentCollectibles.some((c) => c.id === collectible.id)) {
                onUpdateProfile({
                  ...profile,
                  collectibles: [collectible, ...currentCollectibles],
                });
              }
            }
          }}
        />
      )}

      {/* 🎁 閱讀互動彩蛋解鎖彈窗 (Easter Egg Celebration Popup) */}
      {easterEggModal.show && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-sm p-6 rounded-3xl bg-slate-900 border-2 border-amber-400 text-white shadow-2xl space-y-4 text-center relative">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-400/20 border-2 border-amber-400 flex items-center justify-center text-3xl animate-bounce">
              {easterEggModal.icon}
            </div>
            <div className="space-y-1">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px]">
                🎉 閱讀互動彩蛋解鎖！
              </span>
              <h3 className="text-lg font-black text-amber-200">
                {easterEggModal.title}
              </h3>
              <p className="text-xs font-bold text-slate-300">
                自動獲得新數位徽章【{easterEggModal.badgeName}】與 +{easterEggModal.bonusStars} 顆星星獎勵！
              </p>
            </div>
            <button
              type="button"
              onClick={() => setEasterEggModal((prev) => ({ ...prev, show: false }))}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-300 hover:from-amber-500 hover:to-yellow-400 text-slate-950 font-black text-xs shadow-lg cursor-pointer"
            >
              太棒了！收下獎勵並繼續閱讀 🌟
            </button>
          </div>
        </div>
      )}

      {/* 🎙️ 數位語音書籤錄製彈窗 (Digital Voice Bookmark Recording Modal) */}
      {isBookmarkModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border-2 border-rose-400 rounded-3xl max-w-md w-full p-6 text-white shadow-2xl relative space-y-5">
            <div className="flex items-center justify-between border-b border-rose-500/30 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-rose-500/20 border border-rose-400 text-rose-300">
                  <Mic className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-base font-black text-rose-100">
                    🎙️ 數位語音心得書籤 (第 {currentPage.pageNumber} 頁)
                  </h3>
                  <p className="text-[11px] font-bold text-rose-300">
                    長按或點擊麥克風，錄下對這一頁的心情或閱讀感想！
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  stopRecordingBookmark();
                  setIsBookmarkModalOpen(false);
                }}
                className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {bookmarkMicError && (
              <div className="p-3 rounded-2xl bg-rose-950/80 border border-rose-500 text-rose-200 text-xs font-bold flex items-center justify-between">
                <span>{bookmarkMicError}</span>
                <button
                  type="button"
                  onClick={() => setBookmarkMicError(null)}
                  className="text-rose-300 hover:text-white font-black ml-2 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Note Title & Emoji Selection */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-black text-slate-300 mb-1">
                  選一個心情表情：
                </label>
                <div className="flex items-center gap-2">
                  {['😃', '❤️', '🌟', '🎨', '💡', '🦉'].map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setSelectedBookmarkEmoji(emoji)}
                      className={`text-xl p-2 rounded-2xl transition-all cursor-pointer ${
                        selectedBookmarkEmoji === emoji
                          ? 'bg-rose-500/40 border-2 border-rose-400 scale-110 shadow-md'
                          : 'bg-slate-800 border border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-300 mb-1">
                  書籤主題名稱：
                </label>
                <input
                  type="text"
                  value={bookmarkNoteTitle}
                  onChange={(e) => setBookmarkNoteTitle(e.target.value)}
                  placeholder={`第 ${currentPage.pageNumber} 頁心得語音記號...`}
                  className="w-full px-3.5 py-2 rounded-2xl bg-slate-800 border border-rose-400/40 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-400 font-medium"
                />
              </div>
            </div>

            {/* Recording Live Mic Indicator */}
            <div className="p-5 rounded-3xl bg-slate-800/90 border border-rose-400/40 text-center space-y-3 relative overflow-hidden">
              <div className="relative inline-flex items-center justify-center">
                {isRecordingBookmark && (
                  <span className="absolute inset-0 rounded-full bg-rose-500/50 animate-ping" />
                )}
                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl transition-colors shadow-lg ${
                  isRecordingBookmark ? 'bg-rose-500 text-white' : 'bg-slate-700 text-rose-300'
                }`}>
                  <Mic className="w-8 h-8" />
                </div>
              </div>

              <div>
                <div className="text-sm font-black text-white">
                  {isRecordingBookmark ? `🎙️ 正在錄音中... (${recordingSeconds}s / 30s)` : '點擊下方按鈕開始錄製 30 秒心得話語'}
                </div>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                  完成錄音後將自動生成數位語音書籤並賞賜 <span className="text-amber-300 font-bold">+5 顆童心星星</span>！
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-center gap-3">
                {!isRecordingBookmark ? (
                  <button
                    type="button"
                    onClick={startRecordingBookmark}
                    className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-black text-xs shadow-lg transition-transform hover:scale-105 flex items-center gap-2 cursor-pointer"
                  >
                    <Mic className="w-4 h-4" />
                    <span>開始錄音</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={stopRecordingBookmark}
                    className="px-6 py-2.5 rounded-2xl bg-slate-700 hover:bg-slate-600 text-white font-black text-xs shadow-lg flex items-center gap-2 cursor-pointer border border-rose-400 animate-pulse"
                  >
                    <MicOff className="w-4 h-4 text-rose-300" />
                    <span>停止並儲存書籤</span>
                  </button>
                )}
              </div>
            </div>

            {/* Existing Bookmark Preview for current page if exists */}
            {audioBookmarks.some((b) => b.pageNumber === currentPage.pageNumber) && (
              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-400/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🎙️</span>
                  <div>
                    <div className="text-xs font-black text-rose-200">本頁已有一則語音書籤</div>
                    <div className="text-[10px] text-slate-400">重新錄音將覆蓋舊的心情紀錄</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsBookmarksListOpen(true)}
                  className="text-xs font-bold text-amber-300 underline hover:text-amber-200 cursor-pointer"
                >
                  查看全部書籤 ({audioBookmarks.length})
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 📚 數位語音書籤庫總覽彈窗 (All Voice Bookmarks List) */}
      {isBookmarksListOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border-2 border-rose-400 rounded-3xl max-w-lg w-full p-6 text-white shadow-2xl relative space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-rose-500/30 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-rose-500/20 border border-rose-400 text-rose-300">
                  <BookmarkPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-rose-100">
                    🎙️ 《{book.title['zh-TW'] || book.title.en}》全書語音心得書籤庫
                  </h3>
                  <p className="text-[11px] font-bold text-rose-300">
                    共收錄 {audioBookmarks.length} 則童心語音點滴
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsBookmarksListOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {audioBookmarks.length === 0 ? (
                <div className="p-8 text-center text-slate-400 space-y-2">
                  <div className="text-4xl">🎙️</div>
                  <div className="text-sm font-bold">還沒有錄製任何語音心得書籤喔！</div>
                  <p className="text-xs">在閱讀時長按頁面圖片或點擊【語音書籤】按鈕即可為各頁錄音！</p>
                </div>
              ) : (
                audioBookmarks.map((bm) => {
                  const isPlaying = isPlayingBookmarkId === bm.id;
                  return (
                    <div
                      key={bm.id}
                      className="p-3.5 rounded-2xl bg-slate-800/90 border border-rose-400/30 hover:border-rose-400/70 transition-all flex items-center justify-between gap-3 shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => handlePlayBookmarkAudio(bm.audioDataUrl, bm.id)}
                          className="p-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-md hover:scale-105 transition-transform cursor-pointer"
                        >
                          {isPlaying ? <Pause className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                        </button>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-base">{bm.emotionEmoji}</span>
                            <span className="text-xs font-black text-amber-200">{bm.noteTitle}</span>
                            <span className="text-[10px] bg-rose-500/40 text-rose-200 px-2 py-0.2 rounded-full font-bold">
                              第 {bm.pageNumber} 頁
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-medium">
                            錄製於 {bm.createdAt} • 音訊長度約 {bm.durationSec || 5} 秒
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setCurrentPageIndex(bm.pageNumber - 1);
                            setIsBookmarksListOpen(false);
                          }}
                          className="px-2.5 py-1 rounded-xl bg-slate-700 hover:bg-slate-600 text-xs text-amber-300 font-bold cursor-pointer"
                        >
                          跳至第 {bm.pageNumber} 頁
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteBookmark(bm.id)}
                          className="p-1.5 rounded-xl hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 cursor-pointer"
                          title="刪除書籤"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* 🎵 閱讀節奏遊戲化儀表板彈窗 (Reading Rhythm Gamification Dashboard Modal) */}
      {isRhythmDashboardOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border-2 border-purple-400 rounded-3xl max-w-lg w-full p-6 text-white shadow-2xl relative space-y-5">
            <div className="flex items-center justify-between border-b border-purple-500/30 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-purple-500/20 border border-purple-400 text-purple-300">
                  <Zap className="w-5 h-5 text-amber-300 animate-bounce" />
                </div>
                <div>
                  <h3 className="text-base font-black text-purple-100">
                    🎵 智慧閱讀節奏分析與律動遊戲
                  </h3>
                  <p className="text-[11px] font-bold text-purple-300">
                    穩健翻頁步調與韻律節拍能激發閱讀專注力！
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsRhythmDashboardOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Rhythm Status Indicator Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-900/60 to-indigo-900/60 border border-purple-400/40 text-center space-y-1">
                <div className="text-xs font-black text-purple-300">當前律動連擊 (Combo)</div>
                <div className="text-3xl font-black text-amber-300 font-mono">x{rhythmCombo}</div>
                <div className="text-[10px] text-purple-200">
                  {rhythmCombo >= 5 ? '🔥 沉浸音符大師！' : '🌟 保持 8-30 秒穩定翻頁提升 Combo'}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-900/60 to-pink-900/60 border border-pink-400/40 text-center space-y-1">
                <div className="text-xs font-black text-pink-300">閱讀頻率 BPM / 步調</div>
                <div className="text-3xl font-black text-pink-200 font-mono">{rhythmBpm} <span className="text-xs">BPM</span></div>
                <div className="text-[10px] text-pink-200">
                  {rhythmPaceCategory === 'perfect' ? '🎯 黃金黃金律動' : rhythmPaceCategory === 'fast' ? '⚡ 衝刺速讀模式' : '🤔 深度沉思模式'}
                </div>
              </div>
            </div>

            {/* Tap Beat Rhythm Game Box */}
            <div className="p-5 rounded-3xl bg-slate-800 border border-purple-400/40 text-center space-y-3">
              <div className="flex items-center justify-between text-xs font-extrabold text-amber-300 border-b border-slate-700 pb-2">
                <span>🥁 律動打卡遊戲 (Tap Rhythm Beat)</span>
                <span>打卡點數: {rhythmPoints} pt</span>
              </div>

              <p className="text-xs text-slate-300 font-medium">
                隨著繪本朗讀韻律，點擊下面鼓面進行律動打卡！每打卡 4 拍即獲得 <span className="text-amber-300 font-bold">+2 顆童心星星</span>！
              </p>

              <button
                type="button"
                onClick={handleTapRhythmBeat}
                className="w-28 h-28 mx-auto rounded-full bg-gradient-to-tr from-purple-600 via-pink-500 to-amber-400 hover:from-purple-500 hover:to-amber-300 text-white font-black shadow-xl border-4 border-amber-300/80 transition-transform active:scale-90 cursor-pointer flex flex-col items-center justify-center gap-1 group"
              >
                <Radio className="w-8 h-8 text-amber-200 group-hover:animate-ping" />
                <span className="text-xs">按此打卡!</span>
                <span className="text-[10px] bg-black/40 px-2 py-0.2 rounded-full font-mono">{rhythmTapCount} 拍</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🏆 數位寶箱・繪本專屬紀念卡特藏館 (3D 翻轉展示區) */}
      <DigitalTreasureVaultModal
        isOpen={isTreasureVaultOpen}
        onClose={() => setIsTreasureVaultOpen(false)}
        books={[book]}
        readBookIds={[book.id]}
        darkMode={settings.darkMode}
      />

      {/* 🎙️ 繪本導讀腳本彈窗 (AI Co-Reading Guide Script Modal) */}
      <ReadingGuideScriptModal
        book={book}
        isOpen={isGuideScriptModalOpen}
        onClose={() => setIsGuideScriptModalOpen(false)}
      />

      {/* 📝 快速閱讀筆記彈窗 (Quick Reading Notes Modal) */}
      <QuickReadingNotesModal
        book={book}
        currentPageNumber={currentPage.pageNumber}
        isOpen={isQuickNotesModalOpen}
        onClose={() => setIsQuickNotesModalOpen(false)}
        onJumpToPage={(pNum) => {
          setCurrentPageIndex(pNum - 1);
          setIsQuickNotesModalOpen(false);
        }}
      />
    </div>
  );
};
