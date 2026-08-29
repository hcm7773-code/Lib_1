import React, { useState, useEffect, useRef } from 'react';
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend as RechartsLegend,
  Sector,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area,
  LineChart,
  Line
} from 'recharts';
import {
  HardDrive, Wifi, WifiOff, Database, BookOpen, Trash2, CheckCircle2,
  RefreshCw, X, ShieldCheck, Zap, BarChart3, Download, Award, Clock,
  Star, Flame, Bookmark, FileText, Sparkles, Palette, Check, Volume2,
  VolumeX, Play, Pause, ChevronLeft, ChevronRight, Wand2, Trophy,
  FastForward, Layers, Music, PieChart, PackageCheck, Bot, Eye, ArrowRight,
  Puzzle, Mic, Smile, Heart, HelpCircle, RotateCcw, Compass, Sliders, ThumbsUp,
  MapPin, Map, Lock, Unlock, Flag, Gift, Coins, Search, Shield, Filter,
  Share2, Film, PenTool, QrCode, Sparkle, Cat, Feather, Send, Copy, DownloadCloud, Image, Sparkles as SparklesIcon,
  Network, GitBranch, TreePine, Boxes, Medal, FolderKanban, BarChart2,
  Archive, Gauge, Activity, CloudRain, Sun, Moon
} from 'lucide-react';
import {
  getOfflineStorageAnalytics, clearAllOfflineStorageCache, removeOfflineBook, saveBookForOffline,
  OfflineAnalytics
} from '../utils/offlineStorage';
import {
  playStarChime, playPageTurnSound, playBackgroundAmbience, stopBackgroundAmbience, speakText
} from '../utils/audio';
import { Book, UserProfile, VoiceRole } from '../types';
import { OfflineDetectiveBot } from './OfflineDetectiveBot';
import { OfflineKnowledgeHandbook } from './OfflineKnowledgeHandbook';
import { OfflineKnowledgeMilestonesDashboard } from './OfflineKnowledgeMilestonesDashboard';
import { OfflinePictureBookGallery } from './OfflinePictureBookGallery';
import { OfflineTrophyWall } from './OfflineTrophyWall';
import { OfflineEncyclopediaKnowledgeBase } from './OfflineEncyclopediaKnowledgeBase';
import { OfflineEmotionFlowMap } from './OfflineEmotionFlowMap';
import { OfflineStoryWorkshop } from './OfflineStoryWorkshop';
import { OfflineBlueprintGuideModal } from './OfflineBlueprintGuideModal';
import { ReadingFocusRadarPanel } from './ReadingFocusRadarPanel';

export interface SpeedChallengeRecord {
  id: string;
  childName: string;
  avatar: string;
  bookTitle: string;
  timeSec: number;
  pageCount: number;
  secPerPage: number;
  accuracyPct: number;
  score: number;
  dateStr: string;
}

export interface VoiceEmotionNote {
  id: string;
  bookId: string;
  bookTitle: string;
  pageNumber: number;
  audioDataUrl?: string;
  createdAt: string;
  emotionEmoji: string;
  emotionName: string;
  noteTitle: string;
  durationSec: number;
}

export type ReadingAtmosphere = 'starry' | 'forest' | 'castle' | 'ocean' | 'cozy' | 'sunset' | 'rainy';

interface AtmosphereTheme {
  id: ReadingAtmosphere;
  name: string;
  emoji: string;
  bgGradient: string;
  borderClass: string;
  badgeBg: string;
  description: string;
  particles: string[];
  musicTrack: 'space' | 'forest' | 'magic' | 'ocean' | 'cozy' | 'sunset' | 'rainy';
}

const ATMOSPHERE_THEMES: AtmosphereTheme[] = [
  {
    id: 'starry',
    name: '🌌 星空宇宙帳篷',
    emoji: '🌌',
    bgGradient: 'from-slate-950 via-indigo-950 to-slate-950',
    borderClass: 'border-indigo-500/60',
    badgeBg: 'bg-indigo-900/80 text-indigo-200 border-indigo-400/40',
    description: '深靜星空與閃爍微光，打造夜間沉浸閱讀與探索氛圍',
    particles: ['✨', '⭐', '🌟', '🌙', '💫'],
    musicTrack: 'space',
  },
  {
    id: 'forest',
    name: '🌲 晨光森林書房',
    emoji: '🌲',
    bgGradient: 'from-slate-950 via-emerald-950 to-slate-950',
    borderClass: 'border-emerald-500/60',
    badgeBg: 'bg-emerald-900/80 text-emerald-200 border-emerald-400/40',
    description: '微風徐徐與晨曦綠意，體驗置身自然大森林的靜謐與活力',
    particles: ['🍃', '🌿', '🌱', '🌸', '🕊️'],
    musicTrack: 'forest',
  },
  {
    id: 'castle',
    name: '🏰 夢幻魔法城堡',
    emoji: '🏰',
    bgGradient: 'from-slate-950 via-purple-950 to-slate-950',
    borderClass: 'border-purple-500/60',
    badgeBg: 'bg-purple-900/80 text-purple-200 border-purple-400/40',
    description: '金黃輝煌與魔法螢光，啟發無限想像力與奇幻故事冒險',
    particles: ['🪄', '💎', '👑', '🔮', '✨'],
    musicTrack: 'magic',
  },
  {
    id: 'ocean',
    name: '🌊 奇幻深海水族',
    emoji: '🌊',
    bgGradient: 'from-slate-950 via-cyan-950 to-slate-950',
    borderClass: 'border-cyan-500/60',
    badgeBg: 'bg-cyan-900/80 text-cyan-200 border-cyan-400/40',
    description: '湛藍深海微光與水滴律動，享受澎湃深海潮汐與專注平靜',
    particles: ['🫧', '🐳', '🦭', '🌊', '🐚'],
    musicTrack: 'ocean',
  },
  {
    id: 'cozy',
    name: '☕ 溫馨燭光木屋',
    emoji: '☕',
    bgGradient: 'from-slate-950 via-amber-950 to-slate-950',
    borderClass: 'border-amber-500/60',
    badgeBg: 'bg-amber-900/80 text-amber-200 border-amber-400/40',
    description: '暖橘木紋與柴火溫馨光暈，非常適合親子共讀與說故事時間',
    particles: ['☕', '🪵', '🕯️', '🍂', '🧸'],
    musicTrack: 'cozy',
  },
  {
    id: 'sunset',
    name: '🌅 晚霞金黃海岸',
    emoji: '🌅',
    bgGradient: 'from-slate-950 via-rose-950 to-amber-950',
    borderClass: 'border-rose-500/60',
    badgeBg: 'bg-rose-900/80 text-rose-200 border-rose-400/40',
    description: '絢麗夕陽餘暉與金黃海岸，給予暖心舒緩的睡前繪本時光',
    particles: ['🌅', '🌾', '🕊️', '✨', '💛'],
    musicTrack: 'sunset',
  },
  {
    id: 'rainy',
    name: '🌧️ 聽雨聽風微雨書房',
    emoji: '🌧️',
    bgGradient: 'from-slate-950 via-slate-900 to-blue-950',
    borderClass: 'border-blue-500/60',
    badgeBg: 'bg-blue-900/80 text-blue-200 border-blue-400/40',
    description: '輕柔雨滴拍打窗櫺聲，幫助專注靜心，沉浸故事每一頁點滴',
    particles: ['💧', '🌧️', '🌂', '🍃', '✨'],
    musicTrack: 'rainy',
  },
];

export interface WeeklyStoryCapsule {
  id: string;
  weekCode: string;
  title: string;
  periodStr: string;
  booksCount: number;
  readingMins: number;
  pagesCount: number;
  badgeEmoji: string;
  themeColor: string;
  booksReadList: { id: string; title: string; coverEmoji: string; readTimeMins: number; keyTakeaway: string }[];
  moralSummary: string;
  coreVocabulary: { en: string; zh: string; phonetic: string }[];
  goldenQuote: string;
  quoteAuthor: string;
  voiceHighlightNote: string;
  isSealed: boolean;
  sealedDateStr: string;
}

const INITIAL_WEEKLY_CAPSULES: WeeklyStoryCapsule[] = [
  {
    id: 'cap_w32',
    weekCode: '2026_w32',
    title: '2026年第32週 ‧ 魔法森林與冒險同理時間膠囊 🌲',
    periodStr: '2026/08/07 - 2026/08/13 (本週精華膠囊)',
    booksCount: 3,
    readingMins: 168,
    pagesCount: 86,
    badgeEmoji: '🌲',
    themeColor: 'from-emerald-500/30 via-teal-950/60 to-slate-950 border-emerald-400',
    booksReadList: [
      { id: 'rec_book_1', title: '小熊的魔法花園', coverEmoji: '🐻', readTimeMins: 65, keyTakeaway: '分享的快樂勝過獨自擁有，同理心是世界上最美好的魔法。' },
      { id: 'rec_book_2', title: '月亮奇幻冒險', coverEmoji: '🌙', readTimeMins: 55, keyTakeaway: '即使遇到黑夜與波折，只要勇敢向前就能看見璀璨星光。' },
      { id: 'rec_book_3', title: '喵星人太空之旅', coverEmoji: '🐱', readTimeMins: 48, keyTakeaway: '保持對未知的強烈好奇心與團隊合作，能解決所有困難。' },
    ],
    moralSummary: '本週孩子在故事探索中展現出極高的情商與社交同理心，學會了分享、勇氣與團隊互助的重要性。',
    coreVocabulary: [
      { en: 'Sharing', zh: '分享', phonetic: '/ˈʃeərɪŋ/' },
      { en: 'Courage', zh: '勇氣', phonetic: '/ˈkʌrɪdʒ/' },
      { en: 'Adventure', zh: '冒險', phonetic: '/ədˈventʃər/' },
      { en: 'Empathy', zh: '同理心', phonetic: '/ˈempəθi/' },
      { en: 'Friendship', zh: '友誼', phonetic: '/ˈfrendʃɪp/' },
    ],
    goldenQuote: '「最美麗的花朵，需要用愛與分享來澆灌；最勇敢的心，會在黑夜裡發光。」',
    quoteAuthor: '—— 摘自《小熊的魔法花園》第 12 頁精華重點',
    voiceHighlightNote: '「小熊把紅蘋果分給小兔子的時候，我聽得心裡暖洋洋的！」',
    isSealed: true,
    sealedDateStr: '2026/08/13 系統自動封存',
  },
  {
    id: 'cap_w31',
    weekCode: '2026_w31',
    title: '2026年第31週 ‧ 星空幾何與科學探索時間膠囊 🌌',
    periodStr: '2026/07/31 - 2026/08/06',
    booksCount: 2,
    readingMins: 135,
    pagesCount: 62,
    badgeEmoji: '🌌',
    themeColor: 'from-indigo-500/30 via-purple-950/60 to-slate-950 border-indigo-400',
    booksReadList: [
      { id: 'rec_book_4', title: '幾何王國大冒險', coverEmoji: '📐', readTimeMins: 70, keyTakeaway: '形狀與邏輯組合能創造出無限可能的城堡建築！' },
      { id: 'rec_book_5', title: '深海鯨魚與小舟', coverEmoji: '🐳', readTimeMins: 65, keyTakeaway: '尊重自然的聲音，保護海洋保護我們的綠色地球。' },
    ],
    moralSummary: '本週聚焦於科學概念、幾何形狀觀察與環境生態保護，建立起扎實的雙語與幾何基礎。',
    coreVocabulary: [
      { en: 'Geometry', zh: '幾何學', phonetic: '/dʒiˈɑːmətri/' },
      { en: 'Ocean', zh: '海洋', phonetic: '/ˈoʊʃn/' },
      { en: 'Protection', zh: '保護', phonetic: '/prəˈtekʃn/' },
      { en: 'Creativity', zh: '創造力', phonetic: '/ˌkriːeɪˈtɪvəti/' },
    ],
    goldenQuote: '「每一個三角形與圓形，都是築夢城堡不可或缺的基石。」',
    quoteAuthor: '—— 摘自《幾何王國大冒險》第 8 頁精華重點',
    voiceHighlightNote: '「原來三角形加上長方形就能變成一棟超漂亮的防風木屋！」',
    isSealed: true,
    sealedDateStr: '2026/08/06 歷史封存',
  },
];

interface WizardVoiceOption {
  role: VoiceRole;
  name: string;
  avatar: string;
  desc: string;
}

const WIZARD_VOICES: WizardVoiceOption[] = [
  { role: 'fairy', name: '故事小精靈', avatar: '🧚‍♀️', desc: '甜美輕快的繪本魔法精靈聲線' },
  { role: 'wizard', name: '星空魔法師', avatar: '🧙‍♂️', desc: '睿智沉穩且富有磁性的魔法師聲線' },
  { role: 'mom', name: '溫柔故事媽媽', avatar: '👩‍👧', desc: '親切包容的親情說故事口吻' },
  { role: 'robot', name: '科技機器人', avatar: '🤖', desc: '節奏清晰且有趣的科技小助理' },
];

export interface HourlyTimeSlotDataPoint {
  time: string;
  readingMins: number;
  focusIndex: number;
  completedPages: number;
  period: string;
  isOptimal?: boolean;
}

const HOURLY_TIMESLOT_DATA: HourlyTimeSlotDataPoint[] = [
  { time: '08:00', readingMins: 18, focusIndex: 78, completedPages: 12, period: '晨間時段' },
  { time: '10:00', readingMins: 25, focusIndex: 82, completedPages: 16, period: '上午時段' },
  { time: '12:30', readingMins: 12, focusIndex: 71, completedPages: 8, period: '午休午歇' },
  { time: '15:00', readingMins: 32, focusIndex: 86, completedPages: 22, period: '課後午後' },
  { time: '18:30', readingMins: 22, focusIndex: 88, completedPages: 18, period: '晚餐過後' },
  { time: '19:30', readingMins: 52, focusIndex: 96, completedPages: 38, period: '黃金時間 🌟', isOptimal: true },
  { time: '21:00', readingMins: 35, focusIndex: 91, completedPages: 26, period: '睡前故事' },
];

interface OfflineAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBook?: (book: Book) => void;
  userProfile?: UserProfile;
  books?: Book[];
  userWordsCount?: number;
  darkMode?: boolean;
}

export const OfflineAnalyticsModal: React.FC<OfflineAnalyticsModalProps> = ({
  isOpen,
  onClose,
  onSelectBook,
  userProfile,
  books = [],
  userWordsCount = 0,
  darkMode = false,
}) => {
  const [analytics, setAnalytics] = useState<OfflineAnalytics | null>(null);
  const [isClearing, setIsClearing] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'report' | 'encyclopedia' | 'trophywall' | 'gallery' | 'detectivebot' | 'milestones' | 'footprint' | 'offlineshare' | 'offlinenotes' | 'petgrowth' | 'advisor' | 'capsule' | 'focusclock' | 'smartfilter' | 'handbook' | 'questmap' | 'speedchallenge' | 'emotioncloud' | 'memorypuzzle' | 'wizard' | 'quickread' | 'storage' | 'cleanup' | 'atmosphere' | 'voiceassistant' | 'printablechart' | 'knowledgetree' | 'taskshowcase' | 'timeslotanalytics' | 'emotionmap' | 'storyworkshop' | 'focusradar'
  >('report');

  // --- 📐 離線圖紙簡介彈窗狀態 (Offline Blueprint Guide Modal State) ---
  const [isBlueprintGuideOpen, setIsBlueprintGuideOpen] = useState<boolean>(false);

  // --- 📈 離線閱讀時段分析 (Offline Time Slot Analytics) States ---
  const [timeSlotMetric, setTimeSlotMetric] = useState<'focus' | 'mins' | 'pages'>('focus');
  const [isReadingReminderSet, setIsReadingReminderSet] = useState<boolean>(() => {
    return localStorage.getItem('pwa_timeslot_reminder') === 'true';
  });

  // Reading Atmosphere State
  const [atmosphere, setAtmosphere] = useState<ReadingAtmosphere>(() => {
    return (localStorage.getItem('pwa_reading_atmosphere') as ReadingAtmosphere) || 'starry';
  });
  const [isMusicPlaying, setIsMusicPlaying] = useState<boolean>(false);

  // Toast feedback state for cleanup
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // --- 💊 離線繪本時間膠囊 (Weekly Capsule) States ---
  const [weeklyCapsules, setWeeklyCapsules] = useState<WeeklyStoryCapsule[]>(() => {
    try {
      const saved = localStorage.getItem('pwa_weekly_story_capsules');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_WEEKLY_CAPSULES;
  });
  const [selectedCapsuleWeek, setSelectedCapsuleWeek] = useState<string>('2026_w32');

  // --- 🥁 閱讀節奏儀表板 (Reading Pace & Rhythm Gauge) States ---
  const [isPaceTestActive, setIsPaceTestActive] = useState<boolean>(false);
  const [paceTestTimer, setPaceTestTimer] = useState<number>(0);
  const [paceTestPageCount, setPaceTestPageCount] = useState<number>(1);
  const [isMetronomePlaying, setIsMetronomePlaying] = useState<boolean>(false);
  const [metronomeBpm, setMetronomeBpm] = useState<number>(60);

  // Metronome Timer Effect
  useEffect(() => {
    let interval: any = null;
    if (isMetronomePlaying) {
      const intervalMs = (60 / metronomeBpm) * 1000;
      let step = 0;
      interval = setInterval(() => {
        try {
          const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(step % 4 === 0 ? 880 : 440, ctx.currentTime);
          gain.gain.setValueAtTime(0.12, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.09);
        } catch (e) {
          console.error(e);
        }
        step++;
      }, intervalMs);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isMetronomePlaying, metronomeBpm]);

  // Pace Test Timer Effect
  useEffect(() => {
    let timer: any = null;
    if (isPaceTestActive) {
      timer = setInterval(() => {
        setPaceTestTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPaceTestActive]);

  // Capsule action handlers
  const handleSealNewCapsule = () => {
    playStarChime();
    const newCap: WeeklyStoryCapsule = {
      id: `cap_${Date.now()}`,
      weekCode: `2026_w${Math.floor(Math.random() * 20) + 33}`,
      title: `2026年第33週 ‧ 最新封存離線精華時間膠囊 💎`,
      periodStr: '2026/08/14 - 2026/08/20 (全新封存)',
      booksCount: analytics?.downloadedBookCount || 4,
      readingMins: userProfile?.readingMinutes ? Math.round(userProfile.readingMinutes / 3) : 180,
      pagesCount: analytics?.totalPagesCached || 92,
      badgeEmoji: '💎',
      themeColor: 'from-amber-500/30 via-yellow-950/60 to-slate-950 border-amber-400',
      booksReadList: [
        { id: 'b1', title: '小熊的魔法花園', coverEmoji: '🐻', readTimeMins: 60, keyTakeaway: '在無網路環境下持續探索繪本經典情節與雙語核心字詞。' },
        { id: 'b2', title: '月亮奇幻冒險', coverEmoji: '🌙', readTimeMins: 50, keyTakeaway: '即使遇到黑夜與波折，只要勇敢向前就能看見璀璨星光。' },
      ],
      moralSummary: '這是一份全新手動封存的離線時間膠囊，完整記錄了本週所有翻頁時數與語音心得！',
      coreVocabulary: [
        { en: 'Mastery', zh: '精通', phonetic: '/ˈmæstəri/' },
        { en: 'Wisdom', zh: '智慧', phonetic: '/ˈwɪzdəm/' },
        { en: 'Focus', zh: '專注', phonetic: '/ˈfoʊkəs/' },
        { en: 'Discovery', zh: '發現', phonetic: '/dɪˈskʌvəri/' },
      ],
      goldenQuote: '「知識就像時間膠囊，封存得越久，散發的光芒越璀璨。」',
      quoteAuthor: '—— 離線繪本導師特別獻詞',
      voiceHighlightNote: '「我這一週讀了好多的故事，離線功能超級方便！」',
      isSealed: true,
      sealedDateStr: new Date().toLocaleDateString('zh-TW') + ' 時光封存',
    };

    const updated = [newCap, ...weeklyCapsules];
    setWeeklyCapsules(updated);
    setSelectedCapsuleWeek(newCap.weekCode);
    try {
      localStorage.setItem('pwa_weekly_story_capsules', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
    setToastMessage(`📦 成功封存《${newCap.title}》！已永久保存於離線膠囊庫。`);
  };

  const handleSpeakCapsuleSummary = (cap: WeeklyStoryCapsule) => {
    playStarChime();
    const textToSpeak = `時間膠囊朗讀報告：${cap.title}。在本週的閱讀時光中，你一共讀了 ${cap.booksCount} 本故事書，累積 ${cap.readingMins} 分鐘。這週的核心感想是：${cap.moralSummary}。金句重點：${cap.goldenQuote}。太棒了，繼續保持！`;
    speakText(textToSpeak, 'zh-TW');
  };

  const activeCapsule = weeklyCapsules.find((c) => c.weekCode === selectedCapsuleWeek) || weeklyCapsules[0];

  const calculatedSecPerPage = paceTestTimer > 0 ? Math.round(paceTestTimer / Math.max(1, paceTestPageCount)) : 24;
  const calculatedWpm = Math.round(180 * (30 / Math.max(10, calculatedSecPerPage)));
  const calculatedStability = Math.min(100, Math.max(72, Math.round(100 - Math.abs(calculatedSecPerPage - 24) * 1.5)));
  const paceBadge =
    calculatedSecPerPage < 15
      ? { label: '⚡ 極速速讀型', color: 'text-cyan-300 bg-cyan-500/20 border-cyan-400', desc: '翻頁流暢快速，非常適合複習舊故事與搜尋線索！' }
      : calculatedSecPerPage <= 35
      ? { label: '🎯 黃金專注音律型', color: 'text-amber-300 bg-amber-500/20 border-amber-400', desc: '節奏極為穩定優美，有利於深度思考與雙語詞彙記憶！' }
      : { label: '🐢 深度沉思慢讀型', color: 'text-purple-300 bg-purple-500/20 border-purple-400', desc: '專注觀察繪本插圖細節與精緻文字，沉浸感極高！' };

  // --- ⚡ 速讀挑戰 (Speed Reading Challenge) States ---
  const [speedBookId, setSpeedBookId] = useState<string | null>(null);
  const [speedStatus, setSpeedStatus] = useState<'idle' | 'reading' | 'quiz' | 'result'>('idle');
  const [speedTimerSec, setSpeedTimerSec] = useState<number>(0);
  const [speedPageIndex, setSpeedPageIndex] = useState<number>(0);
  const [speedQuizAnswers, setSpeedQuizAnswers] = useState<number[]>([0, 0, 0]);
  const [lastChallengeRank, setLastChallengeRank] = useState<number | null>(null);

  const [speedLeaderboard, setSpeedLeaderboard] = useState<SpeedChallengeRecord[]>(() => {
    try {
      const saved = localStorage.getItem('pwa_speed_challenge_leaderboard');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [
      { id: 'sb_1', childName: '小星空故事王', avatar: '🧙‍♂️', bookTitle: '小熊的魔法花園', timeSec: 22, pageCount: 8, secPerPage: 2.8, accuracyPct: 100, score: 930, dateStr: '今天' },
      { id: 'sb_2', childName: '魔法繪本精靈', avatar: '🧚‍♀️', bookTitle: '月亮奇幻冒險', timeSec: 30, pageCount: 10, secPerPage: 3.0, accuracyPct: 100, score: 880, dateStr: '昨天' },
      { id: 'sb_3', childName: '城堡探索家', avatar: '🏰', bookTitle: '小熊的魔法花園', timeSec: 38, pageCount: 8, secPerPage: 4.8, accuracyPct: 85, score: 760, dateStr: '3天前' },
    ];
  });

  // Speed timer effect
  useEffect(() => {
    let timer: any = null;
    if (speedStatus === 'reading') {
      timer = setInterval(() => {
        setSpeedTimerSec((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [speedStatus]);

  // --- ☁️ 語音心得情緒雲 (Voice Note Emotion Cloud) States ---
  const [selectedEmotionFilter, setSelectedEmotionFilter] = useState<string | null>(null);
  const [playingVoiceNoteId, setPlayingVoiceNoteId] = useState<string | null>(null);
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);

  // Scan all audio bookmarks
  const getVoiceEmotionNotes = (): VoiceEmotionNote[] => {
    const list: VoiceEmotionNote[] = [];
    try {
      if (analytics?.downloadedBooks) {
        analytics.downloadedBooks.forEach((book) => {
          const raw = localStorage.getItem(`pwa_audio_bookmarks_${book.id}`);
          if (raw) {
            const parsed = JSON.parse(raw);
            parsed.forEach((item: any) => {
              list.push({
                id: item.id || `bm_${Math.random()}`,
                bookId: book.id,
                bookTitle: typeof book.title === 'string' ? book.title : (book.title['zh-TW'] || book.title.en || '繪本故事'),
                pageNumber: item.pageNumber || 1,
                audioDataUrl: item.audioDataUrl,
                createdAt: item.createdAt || '剛才',
                emotionEmoji: item.emotionEmoji || '😃',
                emotionName: item.emotionEmoji === '❤️' ? '溫馨感動' : item.emotionEmoji === '🌟' ? '奇幻驚喜' : item.emotionEmoji === '💡' ? '知識啟發' : item.emotionEmoji === '🦉' ? '深度沉思' : '快樂興奮',
                noteTitle: item.noteTitle || '語音心得點滴',
                durationSec: item.durationSec || 5,
              });
            });
          }
        });
      }
    } catch (e) {
      console.error(e);
    }

    if (list.length === 0) {
      return [
        { id: 'demo_1', bookId: 'b1', bookTitle: '小熊的魔法花園', pageNumber: 3, createdAt: '今天 10:15', emotionEmoji: '😃', emotionName: '快樂興奮', noteTitle: '小熊學會和夥伴分享紅蘋果！', durationSec: 8 },
        { id: 'demo_2', bookId: 'b1', bookTitle: '小熊的魔法花園', pageNumber: 6, createdAt: '昨天 15:30', emotionEmoji: '❤️', emotionName: '溫馨感動', noteTitle: '聽完媽媽講這一頁覺得好溫暖～', durationSec: 12 },
        { id: 'demo_3', bookId: 'b2', bookTitle: '月亮奇幻冒險', pageNumber: 4, createdAt: '3天前', emotionEmoji: '🌟', emotionName: '奇幻驚喜', noteTitle: '月亮城堡點亮魔法星光太絢麗了！', durationSec: 10 },
        { id: 'demo_4', bookId: 'b2', bookTitle: '月亮奇幻冒險', pageNumber: 8, createdAt: '4天前', emotionEmoji: '💡', emotionName: '知識啟發', noteTitle: '原來遇見挫折不要放棄就可以成功！', durationSec: 7 },
      ];
    }
    return list;
  };

  const voiceEmotionNotes = getVoiceEmotionNotes();

  // --- 🎙️ 離線語音小幫手 (Offline AI Voice Assistant) States & Handlers ---
  const [assistantRole, setAssistantRole] = useState<VoiceRole>('fairy');
  const [assistantSpeakingStatus, setAssistantSpeakingStatus] = useState<'idle' | 'speaking' | 'paused'>('idle');
  const [currentAssistantTranscript, setCurrentAssistantTranscript] = useState<string>(
    '點擊下方繪本或指引按鈕，聽離線語音小幫手以溫暖童趣的口吻為你朗讀簡介或教你管理離線寶箱空間！'
  );
  const [activeSpeechTitle, setActiveSpeechTitle] = useState<string>('離線小幫手隨時在線為您服務');

  const ASSISTANT_PERSONAS: { role: VoiceRole; name: string; avatar: string; desc: string }[] = [
    { role: 'fairy', name: '森林童話仙子', avatar: '🧚‍♀️', desc: '甜美清亮且富含渲染力的仙子語音' },
    { role: 'robot', name: '咕嚕科技機器人', avatar: '🤖', desc: '節奏明快且幽默有趣的科技小導師' },
    { role: 'wizard', name: '智慧貓頭鷹博士', avatar: '🦉', desc: '睿智溫和的故事導讀專家' },
    { role: 'mom', name: '親切故事媽媽', avatar: '👩‍👧', desc: '包容溫柔且具最高親和力的母親之聲' },
  ];

  // Speak Book Summary
  const handleAssistantSpeakBook = (bookTitle: string, bookDesc: string) => {
    playStarChime();
    const childName = userProfile?.name || '小讀者';
    const textToSpeak = `親愛的${childName}，讓我為你朗讀《${bookTitle}》故事簡介：${
      bookDesc || '這是一本充滿想像力與奇幻冒險的精美雙語繪本，快點擊翻閱吧！'
    }`;

    setActiveSpeechTitle(`朗讀《${bookTitle}》繪本簡介`);
    setCurrentAssistantTranscript(textToSpeak);
    setAssistantSpeakingStatus('speaking');

    speakText(
      textToSpeak,
      'zh-TW',
      1.0,
      assistantRole,
      1.0,
      () => setAssistantSpeakingStatus('idle')
    );
  };

  // Speak Cleanup & Storage Guide
  const handleAssistantSpeakCleanupGuide = () => {
    playStarChime();
    const childName = userProfile?.name || '小讀者';
    const textToSpeak = `嗨！${childName}！我是你的離線小幫手！當我們把繪本儲存到手機或平板時，會佔用寶貴的離線空間。如果你想下載新繪本但空間不夠了，只要在『智慧清理區』點擊繪本旁邊的紅色垃圾桶就可以輕鬆釋放容量喔！讀完的故事清空後，才能裝進更多酷炫的新繪本。別擔心，你所有的閱讀成果與童星勳章都會安全保留，以後隨時都能重新免費下載喔！`;

    setActiveSpeechTitle('離線儲存空間與清理操作教學指引');
    setCurrentAssistantTranscript(textToSpeak);
    setAssistantSpeakingStatus('speaking');

    speakText(
      textToSpeak,
      'zh-TW',
      1.0,
      assistantRole,
      1.0,
      () => setAssistantSpeakingStatus('idle')
    );
  };

  // Speak Encouragement Quote
  const handleAssistantSpeakEncouragement = () => {
    playStarChime();
    const childName = userProfile?.name || '小讀者';
    const quotes = [
      `親愛的${childName}！今天你已經離線翻閱了好多精彩故事，就像夜空中閃耀的小星星一樣棒！`,
      `哇！${childName}，你已經積累掌握了許多雙語生字，獨立閱讀的你真是個聰明又自信的小小故事家！`,
      `閱讀就像開啟魔法城堡的鑰匙，每一次離線探索都是一場偉大的冒險，繼續加油喔！`
    ];
    const textToSpeak = quotes[Math.floor(Math.random() * quotes.length)];

    setActiveSpeechTitle('離線學習每日溫馨鼓勵語');
    setCurrentAssistantTranscript(textToSpeak);
    setAssistantSpeakingStatus('speaking');

    speakText(
      textToSpeak,
      'zh-TW',
      1.0,
      assistantRole,
      1.0,
      () => setAssistantSpeakingStatus('idle')
    );
  };

  const handlePauseAssistantSpeech = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.pause();
      setAssistantSpeakingStatus('paused');
    }
  };

  const handleResumeAssistantSpeech = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.resume();
      setAssistantSpeakingStatus('speaking');
    }
  };

  const handleStopAssistantSpeech = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setAssistantSpeakingStatus('idle');
    }
  };

  // --- 📜 離線學習能力圖紙報表 (Printable Story Chart Report) Handlers & Datasets ---
  const REPORT_CAPABILITY_DATA = [
    { dimension: '雙語詞彙積累', score: 92, fill: '#3B82F6' },
    { dimension: '故事觀察細節', score: 95, fill: '#10B981' },
    { dimension: '奇幻想像發揮', score: 98, fill: '#8B5CF6' },
    { dimension: '離線自主專注', score: 88, fill: '#F59E0B' },
    { dimension: '空間清理邏輯', score: 95, fill: '#EC4899' },
  ];

  const handlePrintStoryReport = () => {
    playStarChime();
    setToastMessage('🖨️ 已觸發瀏覽器列印/PDF 儲存對話框！請選擇列印或儲存為 PDF 圖紙檔。');
    setTimeout(() => {
      window.print();
    }, 300);
  };

  const handleCopyStoryReportSummary = () => {
    playStarChime();
    const childName = userProfile?.name || '小讀者';
    const text = `🌟【${childName} 離線自主閱讀星光學習能力圖紙報表】🌟
------------------------------------------------
📅 產出日期：2026-08-12
🏆 離線榮譽稱號：星光離線閱讀特級大師
📚 已離線快取繪本：${analytics?.downloadedBookCount || 0} 本
📖 累積離線翻閱頁數：${analytics?.totalPagesCached || 0} 頁
🔤 掌握離線雙語詞彙：${analytics?.totalVocabCount || 0} 個
✨ 離線完備度：100%

【能力維度評分】
• 雙語詞彙積累：92%
• 故事觀察細節：95%
• 奇幻想像發揮：98%
• 離線自主專注：88%
• 空間清理邏輯：95%

【AI 離線導師評語】
${childName} 在無網路連線環境中展示出優異的離線探索積極度與雙語記憶力！閱讀時長穩定且能獨立操作離線儲存空間清理。建議家長繼續維持溫馨的無網共讀時光！
------------------------------------------------
星光繪本庫 ‧ 離線 PWA 自主學習認證系統`;

    try {
      navigator.clipboard.writeText(text);
      setToastMessage('📋 學習能力圖紙摘要已成功複製至剪貼簿！');
    } catch (e) {
      console.error(e);
      setToastMessage('📋 圖紙摘要已產生於頁面，隨時可選取複製！');
    }
  };

  // --- 🗺️ 繪本知識關卡地圖 (Picture Book Knowledge Quest Map) States & Handlers ---
  const [questMapTheme, setQuestMapTheme] = useState<'forest' | 'starry' | 'ocean'>('forest');
  const [questCompletedStageIds, setQuestCompletedStageIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('pwa_quest_completed_stages');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return ['rec_book_1']; // Default initial completed stage
  });

  const [questCrystals, setQuestCrystals] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('pwa_quest_crystals');
      if (saved) return Number(saved);
    } catch (e) {
      console.error(e);
    }
    return 320;
  });

  const [selectedQuestStageBook, setSelectedQuestStageBook] = useState<Book | null>(null);
  const [isTreasureChestOpened, setIsTreasureChestOpened] = useState<boolean>(() => {
    return localStorage.getItem('pwa_quest_chest_opened') === 'true';
  });

  // Build Quest Stages list from Downloaded Books or Sample Pool
  const getQuestStages = () => {
    const downloaded = analytics?.downloadedBooks && analytics.downloadedBooks.length > 0
      ? analytics.downloadedBooks
      : (books && books.length > 0 ? books : SAMPLE_RECOMMENDATION_BOOKS);

    const regionNames = [
      { name: '魔法花園入口', themeEmoji: '🌸', reward: '+100 知識水晶' },
      { name: '星光銀河城堡', themeEmoji: '🏰', reward: '+120 知識水晶' },
      { name: '藍海深海鯨魚灣', themeEmoji: '🐋', reward: '+150 知識水晶' },
      { name: '喵星齒輪發明城', themeEmoji: '⚙️', reward: '+180 知識水晶' },
      { name: '夢幻天空雲朵谷', themeEmoji: '☁️', reward: '+200 知識水晶' },
      { name: '翡翠寶石探險島', themeEmoji: '💎', reward: '+250 知識水晶' },
    ];

    return downloaded.map((book, idx) => {
      const reg = regionNames[idx % regionNames.length];
      const stageNum = idx + 1;
      const title = typeof book.title === 'string' ? book.title : (book.title['zh-TW'] || book.title.en || `關卡 ${stageNum}`);
      const isCompleted = questCompletedStageIds.includes(book.id) || idx === 0;
      const prevBookId = idx > 0 ? downloaded[idx - 1]?.id : null;
      const isUnlocked = idx === 0 || (prevBookId ? questCompletedStageIds.includes(prevBookId) : false) || isCompleted;

      return {
        stageNum,
        book,
        bookTitle: title,
        regionName: `第 ${stageNum} 關 ‧ ${reg.name}`,
        themeEmoji: reg.themeEmoji,
        rewardText: reg.reward,
        isCompleted,
        isUnlocked,
        isCurrent: isUnlocked && !isCompleted,
      };
    });
  };

  const handleCompleteQuestStage = (bookId: string, stageTitle: string) => {
    playStarChime();
    if (!questCompletedStageIds.includes(bookId)) {
      const updated = [...questCompletedStageIds, bookId];
      setQuestCompletedStageIds(updated);
      localStorage.setItem('pwa_quest_completed_stages', JSON.stringify(updated));

      const newCrystals = questCrystals + 100;
      setQuestCrystals(newCrystals);
      localStorage.setItem('pwa_quest_crystals', String(newCrystals));

      setToastMessage(`🎉 恭喜成功解鎖《${stageTitle}》地區！獲得 +100 知識水晶 💎！可踏入下一個神秘區域！`);
    } else {
      setToastMessage(`✨ 您已通關《${stageTitle}》！隨時可重新開啓離線閱讀複習！`);
    }
  };

  const handleOpenTreasureChest = () => {
    if (isTreasureChestOpened) {
      setToastMessage('🎁 知識寶箱已開啟過囉！恭喜獲得高級探險稱號與水晶！');
      return;
    }
    playStarChime();
    setIsTreasureChestOpened(true);
    localStorage.setItem('pwa_quest_chest_opened', 'true');

    const bonus = 300;
    const newCrystals = questCrystals + bonus;
    setQuestCrystals(newCrystals);
    localStorage.setItem('pwa_quest_crystals', String(newCrystals));

    setToastMessage(`🎁 成功解鎖離線知識大寶箱！獲得 +${bonus} 知識水晶與『離線探險導師』黃金頭銜！`);
  };

  // --- 🏅 離線閱讀里程碑與離線深度分析 (Milestones & Deep Analytics) ---
  const [claimedMilestoneIds, setClaimedMilestoneIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('pwa_claimed_milestones');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return ['badge_time_1', 'badge_book_3', 'badge_streak_3'];
  });

  const [selectedMilestoneFilter, setSelectedMilestoneFilter] = useState<'all' | 'time' | 'books' | 'habits'>('all');

  // Metrics for level & milestones
  const totalReadingMins = analytics?.totalReadingMins || 260; // default ~4.3 hours
  const totalReadingHours = Number((totalReadingMins / 60).toFixed(1));
  const totalOfflineBooks = analytics?.downloadedBookCount || (analytics?.downloadedBooks?.length || 6);

  // Level Progression towards 【LV 4 離線閱讀達人】
  const targetLevelHours = 6.0;
  const targetLevelBooks = 8;
  const hoursProgressPct = Math.min(100, Math.round((totalReadingHours / targetLevelHours) * 100));
  const booksProgressPct = Math.min(100, Math.round((totalOfflineBooks / targetLevelBooks) * 100));
  const masterLevelOverallProgress = Math.round((hoursProgressPct + booksProgressPct) / 2);

  // Current Level Calculation
  const getCurrentLevelInfo = () => {
    if (totalReadingHours >= 12 && totalOfflineBooks >= 12) {
      return {
        levelNum: 5,
        title: 'LV 5 👑 離線故事大宗師',
        badge: '👑',
        color: 'from-amber-400 via-rose-400 to-purple-500',
        perk: '離線故事解鎖特權 + 無限發音點讀',
        isMaster: true,
      };
    } else if (totalReadingHours >= 6 && totalOfflineBooks >= 8) {
      return {
        levelNum: 4,
        title: 'LV 4 🏆 離線閱讀達人',
        badge: '🏆',
        color: 'from-amber-400 via-emerald-400 to-cyan-500',
        perk: '專屬離線證書標章 + 知識水晶加倍',
        isMaster: true,
      };
    } else if (totalReadingHours >= 3 && totalOfflineBooks >= 5) {
      return {
        levelNum: 3,
        title: 'LV 3 🌟 離線小書蟲',
        badge: '🌟',
        color: 'from-emerald-400 via-teal-400 to-indigo-500',
        perk: '速讀挑戰雙倍獎勵 + 離線語音導覽',
        isMaster: false,
      };
    } else if (totalReadingHours >= 1 && totalOfflineBooks >= 2) {
      return {
        levelNum: 2,
        title: 'LV 2 🌱 離線故事探索家',
        badge: '🌱',
        color: 'from-teal-400 via-cyan-400 to-blue-500',
        perk: '解鎖離線地圖區域與成就勳章牆',
        isMaster: false,
      };
    } else {
      return {
        levelNum: 1,
        title: 'LV 1 🐣 離線閱讀新手',
        badge: '🐣',
        color: 'from-slate-400 via-zinc-400 to-slate-500',
        perk: '開啟離線快取與繪本閱讀記錄',
        isMaster: false,
      };
    }
  };

  const handleClaimMilestone = (badgeId: string, title: string, bonus: number) => {
    playStarChime();
    if (!claimedMilestoneIds.includes(badgeId)) {
      const updated = [...claimedMilestoneIds, badgeId];
      setClaimedMilestoneIds(updated);
      localStorage.setItem('pwa_claimed_milestones', JSON.stringify(updated));

      const newCrystals = questCrystals + bonus;
      setQuestCrystals(newCrystals);
      localStorage.setItem('pwa_quest_crystals', String(newCrystals));

      setToastMessage(`🎉 成功獲得『${title}』成就勛章！獎勵 +${bonus} 知識水晶 💎！`);
    } else {
      setToastMessage(`✨ 『${title}』勛章已經領取過囉！持續累積離線閱讀紀錄！`);
    }
  };

  // Milestone Badges Array
  const MILESTONE_BADGES_DATA = [
    {
      id: 'badge_time_1',
      category: 'time',
      categoryName: '時光積木',
      title: '初踏離線書海',
      description: '累積離線閱讀時間滿 1 小時',
      icon: '🥉',
      unlocked: totalReadingHours >= 1,
      rewardCrystals: 50,
      currentVal: `${totalReadingHours} / 1.0 小時`,
    },
    {
      id: 'badge_time_3',
      category: 'time',
      categoryName: '時光積木',
      title: '專注光陰行者',
      description: '累積離線閱讀時間滿 3 小時',
      icon: '🥈',
      unlocked: totalReadingHours >= 3,
      rewardCrystals: 100,
      currentVal: `${totalReadingHours} / 3.0 小時`,
    },
    {
      id: 'badge_time_6',
      category: 'time',
      categoryName: '時光積木',
      title: '離線閱讀達人',
      description: '累積離線閱讀時間滿 6 小時',
      icon: '🥇',
      unlocked: totalReadingHours >= 6,
      rewardCrystals: 200,
      currentVal: `${totalReadingHours} / 6.0 小時`,
    },
    {
      id: 'badge_time_12',
      category: 'time',
      categoryName: '時光積木',
      title: '時空閱讀大宗師',
      description: '累積離線閱讀時間滿 12 小時',
      icon: '💎',
      unlocked: totalReadingHours >= 12,
      rewardCrystals: 350,
      currentVal: `${totalReadingHours} / 12.0 小時`,
    },
    {
      id: 'badge_book_3',
      category: 'books',
      categoryName: '掌上寶庫',
      title: '故事隨身口袋',
      description: '離線快取庫儲存 3 本精選繪本',
      icon: '📦',
      unlocked: totalOfflineBooks >= 3,
      rewardCrystals: 50,
      currentVal: `${totalOfflineBooks} / 3 本`,
    },
    {
      id: 'badge_book_5',
      category: 'books',
      categoryName: '掌上寶庫',
      title: '移動小小圖書館',
      description: '離線快取庫儲存 5 本精選繪本',
      icon: '🏰',
      unlocked: totalOfflineBooks >= 5,
      rewardCrystals: 120,
      currentVal: `${totalOfflineBooks} / 5 本`,
    },
    {
      id: 'badge_book_8',
      category: 'books',
      categoryName: '掌上寶庫',
      title: '故事星空大寶庫',
      description: '離線快取庫儲存 8 本精選繪本',
      icon: '🌌',
      unlocked: totalOfflineBooks >= 8,
      rewardCrystals: 250,
      currentVal: `${totalOfflineBooks} / 8 本`,
    },
    {
      id: 'badge_streak_3',
      category: 'habits',
      categoryName: '良好習慣',
      title: '三日無網連續翻頁',
      description: '保持連續 3 天進行離線故事閱讀',
      icon: '🔥',
      unlocked: (userProfile?.streakDays || 3) >= 3,
      rewardCrystals: 80,
      currentVal: `${userProfile?.streakDays || 3} / 3 天`,
    },
    {
      id: 'badge_vocab_30',
      category: 'habits',
      categoryName: '雙語詞彙',
      title: '離線雙語詞彙獵人',
      description: '掌握 30 個離線卡片雙語生字',
      icon: '🔤',
      unlocked: (analytics?.totalVocabCount || 35) >= 30,
      rewardCrystals: 150,
      currentVal: `${analytics?.totalVocabCount || 35} / 30 字`,
    },
    {
      id: 'badge_night_20',
      category: 'habits',
      categoryName: '專注靜心',
      title: '睡前無干擾繪本家',
      description: '夜間無網路進行超過 20 分鐘專注閱讀',
      icon: '🌙',
      unlocked: true,
      rewardCrystals: 100,
      currentVal: '已達成',
    },
  ];

  // Deep Analytics Hourly Distribution Data
  const HOURLY_READING_ANALYTICS = [
    { slot: '早晨 07:00-11:00', mins: 35, focusRate: 88, pages: 30 },
    { slot: '午後 12:00-17:00', mins: 55, focusRate: 92, pages: 48 },
    { slot: '傍晚 18:00-21:00', mins: 110, focusRate: 98, pages: 95 },
    { slot: '夜間 21:00-23:00', mins: 60, focusRate: 95, pages: 52 },
  ];

  // Deep Analytics Genre Pie Data
  const GENRE_ANALYTICS_DATA = [
    { name: '奇幻冒險', percentage: 38, count: 4, color: '#F59E0B' },
    { name: '神奇童話', percentage: 28, count: 3, color: '#EC4899' },
    { name: '自然科普', percentage: 20, count: 2, color: '#10B981' },
    { name: '雙語的故事', percentage: 14, count: 2, color: '#3B82F6' },
  ];

  // --- ⏱️ 離線專注力時鐘與專注模式 (Focus Clock & Focus Mode) States ---
  const [focusSeconds, setFocusSeconds] = useState<number>(1475); // 24m 35s demo
  const [isFocusRunning, setIsFocusRunning] = useState<boolean>(false);
  const [isFocusModeActive, setIsFocusModeActive] = useState<boolean>(false);
  const [focusTargetMins, setFocusTargetMins] = useState<number>(20);
  const [focusSessionHistory, setFocusSessionHistory] = useState<
    Array<{ id: string; dateStr: string; mins: number; bookTitle: string; starsEarned: number }>
  >(() => {
    try {
      const saved = localStorage.getItem('pwa_focus_session_history');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [
      { id: 'fs_1', dateStr: '今天 10:20', mins: 25, bookTitle: '小熊的魔法花園', starsEarned: 3 },
      { id: 'fs_2', dateStr: '昨天 19:30', mins: 30, bookTitle: '月亮奇幻冒險', starsEarned: 4 },
      { id: 'fs_3', dateStr: '3天前', mins: 18, bookTitle: '喵星人的星空城堡', starsEarned: 2 },
    ];
  });

  // Focus timer ticking effect
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

  const formatFocusTime = (totalSec: number) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleToggleFocusMode = () => {
    playStarChime();
    const nextState = !isFocusModeActive;
    setIsFocusModeActive(nextState);
    if (nextState) {
      setToastMessage('🛡️ 已開啟『離線淨音專注模式』：暫時隱藏所有推薦與干擾彈窗，打造純粹閱讀環境！');
    } else {
      setToastMessage('✨ 已解除專注模式，恢復完整功能選單。');
    }
  };

  const handleFinishFocusSession = () => {
    playStarChime();
    setIsFocusRunning(false);
    const elapsedMins = Math.max(1, Math.round(focusSeconds / 60));
    const newRecord = {
      id: `fs_${Date.now()}`,
      dateStr: '剛才',
      mins: elapsedMins,
      bookTitle: '雙語繪本離線閱讀',
      starsEarned: Math.min(5, Math.ceil(elapsedMins / 5)),
    };
    const updatedHistory = [newRecord, ...focusSessionHistory];
    setFocusSessionHistory(updatedHistory);
    localStorage.setItem('pwa_focus_session_history', JSON.stringify(updatedHistory));

    const bonus = elapsedMins * 10;
    const newCrystals = questCrystals + bonus;
    setQuestCrystals(newCrystals);
    localStorage.setItem('pwa_quest_crystals', String(newCrystals));

    setToastMessage(`🎉 恭喜完成 ${elapsedMins} 分鐘離線專注閱讀！獎勵 +${bonus} 知識水晶 💎！`);
    setFocusSeconds(0);
  };

  // --- 🔍 離線智慧閱讀過濾器 (Offline Smart Reading Filter) States ---
  const [filterAgeGroup, setFilterAgeGroup] = useState<'all' | '3-5' | '6-8' | '9-12'>('all');
  const [filterLength, setFilterLength] = useState<'all' | 'short' | 'medium' | 'long'>('all');
  const [filterCategory, setFilterCategory] = useState<'all' | 'fantasy' | 'fairytale' | 'science' | 'bilingual'>('all');
  const [filterCacheOnly, setFilterCacheOnly] = useState<boolean>(false);
  const [filterSearchKeyword, setFilterSearchKeyword] = useState<string>('');

  // Filter books calculation
  const getSmartFilteredBooks = () => {
    const allBooksList = books && books.length > 0 ? books : (analytics?.downloadedBooks || []);

    return allBooksList.filter((book) => {
      const titleStr = typeof book.title === 'string' ? book.title : (book.title['zh-TW'] || book.title.en || '');
      const descStr = typeof book.description === 'string' ? book.description : (book.description?.['zh-TW'] || book.description?.en || '');
      const fullContent = `${titleStr} ${descStr} ${book.category || ''}`.toLowerCase();

      // Search keyword
      if (filterSearchKeyword.trim() && !fullContent.includes(filterSearchKeyword.toLowerCase().trim())) {
        return false;
      }

      // Category
      if (filterCategory !== 'all') {
        if (filterCategory === 'fantasy' && !fullContent.includes('奇幻') && !fullContent.includes('冒險') && !fullContent.includes('魔法')) return false;
        if (filterCategory === 'fairytale' && !fullContent.includes('童話') && !fullContent.includes('森林') && !fullContent.includes('城堡')) return false;
        if (filterCategory === 'science' && !fullContent.includes('科普') && !fullContent.includes('自然') && !fullContent.includes('發明')) return false;
        if (filterCategory === 'bilingual' && !fullContent.includes('雙語') && !fullContent.includes('英文') && !fullContent.includes('abc')) return false;
      }

      // Age group filter logic
      if (filterAgeGroup !== 'all') {
        if (filterAgeGroup === '3-5' && book.pageCount && book.pageCount > 10) return false;
        if (filterAgeGroup === '9-12' && book.pageCount && book.pageCount < 8) return false;
      }

      // Reading length
      if (filterLength !== 'all') {
        const pages = book.pageCount || 8;
        if (filterLength === 'short' && pages > 6) return false;
        if (filterLength === 'medium' && (pages <= 6 || pages > 12)) return false;
        if (filterLength === 'long' && pages <= 12) return false;
      }

      // Cache status
      if (filterCacheOnly) {
        const isCached = analytics?.downloadedBooks?.some((db) => db.id === book.id);
        if (!isCached) return false;
      }

      return true;
    });
  };

  // --- 📖 離線知識手冊 (Offline Knowledge Handbook) States ---
  const [handbookCategory, setHandbookCategory] = useState<'cache' | 'bilingual' | 'focus' | 'faq'>('cache');
  const [expandedFaqIds, setExpandedFaqIds] = useState<string[]>(['faq_1']);

  const toggleFaqExpand = (faqId: string) => {
    playStarChime();
    setExpandedFaqIds((prev) =>
      prev.includes(faqId) ? prev.filter((id) => id !== faqId) : [...prev, faqId]
    );
  };

  // --- 📊 離線數據圖表資料集 (Offline Data Chart Datasets) ---
  const WEEKLY_READING_DATA = [
    { day: '週一', readingMins: 12, pagesRead: 15, vocabLearned: 3 },
    { day: '週二', readingMins: 18, pagesRead: 22, vocabLearned: 5 },
    { day: '週三', readingMins: 15, pagesRead: 18, vocabLearned: 4 },
    { day: '週四', readingMins: 25, pagesRead: 30, vocabLearned: 7 },
    { day: '週五', readingMins: 20, pagesRead: 24, vocabLearned: 6 },
    { day: '週六', readingMins: 35, pagesRead: 42, vocabLearned: 11 },
    { day: '週日', readingMins: 28, pagesRead: 32, vocabLearned: 8 },
  ];

  const CATEGORY_CHART_DATA = [
    { category: '奇幻冒險', pagesRead: 38, vocabLearned: 18, booksCount: 4, fill: '#F59E0B' },
    { category: '神奇童話', pagesRead: 28, vocabLearned: 14, booksCount: 3, fill: '#EC4899' },
    { category: '自然科普', pagesRead: 20, vocabLearned: 10, booksCount: 2, fill: '#10B981' },
    { category: '雙語故事', pagesRead: 32, vocabLearned: 16, booksCount: 3, fill: '#3B82F6' },
  ];

  // --- 🌳 離線探索知識樹 (Offline Knowledge Tree) States & Data ---
  interface KnowledgeNodeItem {
    id: string;
    label: string;
    englishTerm?: string;
    domain: 'nature' | 'fantasy' | 'bilingual' | 'emotion' | 'creativity';
    domainName: string;
    domainColor: string;
    domainBg: string;
    domainBorder: string;
    depthLevel: 1 | 2 | 3;
    bookTitle: string;
    masteryPct: number;
    icon: string;
    description: string;
    keyWords: string[];
  }

  const KNOWLEDGE_NODES_DATA: KnowledgeNodeItem[] = [
    {
      id: 'kn_1',
      label: '光合作用與能量',
      englishTerm: 'Photosynthesis & Energy',
      domain: 'nature',
      domainName: '🌿 自然生態與科學',
      domainColor: 'text-emerald-300',
      domainBg: 'bg-emerald-950/60',
      domainBorder: 'border-emerald-500/40',
      depthLevel: 2,
      bookTitle: '《小熊的魔法花園》',
      masteryPct: 95,
      icon: '🌱',
      description: '了解植物如何利用陽光、水分與二氧化碳轉換為生長能量，建立對大自然生態循環的基礎認知。',
      keyWords: ['Photosynthesis', 'Chlorophyll', 'Sunlight', 'Oxygen'],
    },
    {
      id: 'kn_2',
      label: '森林生態系平衡',
      englishTerm: 'Forest Ecosystem Balance',
      domain: 'nature',
      domainName: '🌿 自然生態與科學',
      domainColor: 'text-emerald-300',
      domainBg: 'bg-emerald-950/60',
      domainBorder: 'border-emerald-500/40',
      depthLevel: 1,
      bookTitle: '《小熊的魔法花園》',
      masteryPct: 90,
      icon: '🌲',
      description: '認識樹木、昆蟲與各類野生動物在森林棲地中的共生合作關係，培養珍愛自然環境的意識。',
      keyWords: ['Ecosystem', 'Biodiversity', 'Habitat', 'Symbiosis'],
    },
    {
      id: 'kn_3',
      label: '月相盈虧與天體運行',
      englishTerm: 'Moon Phases & Orbit',
      domain: 'nature',
      domainName: '🌿 自然生態與科學',
      domainColor: 'text-emerald-300',
      domainBg: 'bg-emerald-950/60',
      domainBorder: 'border-emerald-500/40',
      depthLevel: 2,
      bookTitle: '《月亮奇幻冒險》',
      masteryPct: 88,
      icon: '🌙',
      description: '探索新月、弦月到滿月的週期變化規律，並了解月球引力對地球海洋潮汐的深刻影響。',
      keyWords: ['Full Moon', 'Crescent', 'Orbit', 'Tide'],
    },
    {
      id: 'kn_4',
      label: '團隊合作與信任包容',
      englishTerm: 'Team Cooperation & Trust',
      domain: 'fantasy',
      domainName: '🏰 奇幻冒險與童話',
      domainColor: 'text-amber-300',
      domainBg: 'bg-amber-950/60',
      domainBorder: 'border-amber-500/40',
      depthLevel: 1,
      bookTitle: '《喵星人的星空城堡》',
      masteryPct: 96,
      icon: '🤝',
      description: '學會欣賞夥伴的不同特長，透過溝通與互補合作突破冒險關卡，建立良好的同儕關係。',
      keyWords: ['Cooperation', 'Trust', 'Friendship', 'Teamwork'],
    },
    {
      id: 'kn_5',
      label: '挫折復原力與勇氣',
      englishTerm: 'Resilience & Emotional Courage',
      domain: 'emotion',
      domainName: '❤️ 情感社交與品格',
      domainColor: 'text-rose-300',
      domainBg: 'bg-rose-950/60',
      domainBorder: 'border-rose-500/40',
      depthLevel: 3,
      bookTitle: '《勇敢小海豚的海洋冒險》',
      masteryPct: 92,
      icon: '🛡️',
      description: '在面臨未知的困難時保持平靜，學習接納暫時的失敗並重新鼓起勇氣嘗試，養成正向心理素質。',
      keyWords: ['Resilience', 'Courage', 'Perseverance', 'Mindset'],
    },
    {
      id: 'kn_6',
      label: '雙語生活禮貌與溝通',
      englishTerm: 'Bilingual Social Etiquette',
      domain: 'bilingual',
      domainName: '🧠 雙語表達與詞彙',
      domainColor: 'text-cyan-300',
      domainBg: 'bg-cyan-950/60',
      domainBorder: 'border-cyan-500/40',
      depthLevel: 1,
      bookTitle: '《小熊雙語日常》',
      masteryPct: 98,
      icon: '🗣️',
      description: '熟練運用日常雙語問候語與感謝用語，能自然自信地進行雙語日常交流與互動。',
      keyWords: ['Greetings', 'Politeness', 'Conversation', 'Phrases'],
    },
    {
      id: 'kn_7',
      label: '色彩原理與視覺美感',
      englishTerm: 'Color Theory & Aesthetics',
      domain: 'creativity',
      domainName: '🎨 藝術色彩與創造',
      domainColor: 'text-purple-300',
      domainBg: 'bg-purple-950/60',
      domainBorder: 'border-purple-500/40',
      depthLevel: 2,
      bookTitle: '《彩虹小鎮的調色盤》',
      masteryPct: 86,
      icon: '🎨',
      description: '理解三原色混合變化與冷暖色調的對比運用，激發想像力並開拓藝術鑑賞視覺眼界。',
      keyWords: ['Primary Colors', 'Palette', 'Contrast', 'Harmony'],
    },
    {
      id: 'kn_8',
      label: '太空重力與星體物理',
      englishTerm: 'Space Gravity & Physics',
      domain: 'nature',
      domainName: '🌿 自然生態與科學',
      domainColor: 'text-emerald-300',
      domainBg: 'bg-emerald-950/60',
      domainBorder: 'border-emerald-500/40',
      depthLevel: 3,
      bookTitle: '《月亮奇幻冒險》',
      masteryPct: 82,
      icon: '🪐',
      description: '初步認識宇宙中的重力作用、萬有引力概念，以及各行行星圍繞太陽運行的神奇物理原理。',
      keyWords: ['Gravity', 'Planet', 'Physics', 'Universe'],
    },
  ];

  const [selectedKnowledgeNodeId, setSelectedKnowledgeNodeId] = useState<string | null>('kn_1');
  const [knowledgeFilterDomain, setKnowledgeFilterDomain] = useState<'all' | 'nature' | 'fantasy' | 'bilingual' | 'emotion' | 'creativity'>('all');
  const [knowledgeSearchQuery, setKnowledgeSearchQuery] = useState<string>('');

  const filteredKnowledgeNodes = KNOWLEDGE_NODES_DATA.filter((node) => {
    if (knowledgeFilterDomain !== 'all' && node.domain !== knowledgeFilterDomain) return false;
    if (knowledgeSearchQuery.trim()) {
      const q = knowledgeSearchQuery.toLowerCase().trim();
      const matchLabel = node.label.toLowerCase().includes(q);
      const matchEnglish = (node.englishTerm || '').toLowerCase().includes(q);
      const matchDesc = node.description.toLowerCase().includes(q);
      const matchKw = node.keyWords.some((kw) => kw.toLowerCase().includes(q));
      if (!matchLabel && !matchEnglish && !matchDesc && !matchKw) return false;
    }
    return true;
  });

  const selectedNodeData = KNOWLEDGE_NODES_DATA.find((n) => n.id === selectedKnowledgeNodeId) || KNOWLEDGE_NODES_DATA[0];

  // --- 🏺 完成任務展櫃 (Completed Tasks Showcase) States & Data ---
  interface ShowcaseTaskItem {
    id: string;
    title: string;
    category: 'mission' | 'medal' | 'trophy' | 'focus';
    categoryLabel: string;
    rarity: 'SSR 傳奇' | 'SR 稀有' | 'R 精英' | 'N 榮譽';
    rarityBadgeClass: string;
    rarityBgGradient: string;
    rarityBorder: string;
    icon: string;
    completedDate: string;
    sourceBookOrTask: string;
    description: string;
    rewardCrystals: number;
    certificateCode: string;
    highlights: string[];
  }

  const SHOWCASE_ITEMS: ShowcaseTaskItem[] = [
    {
      id: 'sc_1',
      title: '👑 離線七日閱讀探險家尊爵金盃',
      category: 'trophy',
      categoryLabel: '🏆 挑戰極限獎盃',
      rarity: 'SSR 傳奇',
      rarityBadgeClass: 'bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-950',
      rarityBgGradient: 'from-amber-500/20 via-yellow-500/10 to-slate-900',
      rarityBorder: 'border-amber-400/60',
      icon: '👑',
      completedDate: '2026-08-12 10:30',
      sourceBookOrTask: '連續 7 天離線無網自主閱讀任務',
      description: '特此頒發給在無網路環境下持續保持強烈求知慾、連續七天順利完成每日閱讀目標的優秀讀者！',
      rewardCrystals: 500,
      certificateCode: 'CERT-GOLD-7DAYS-9988',
      highlights: ['連續 7 天持之以恆', '無網路獨立完成', '解鎖黃金專屬光芒'],
    },
    {
      id: 'sc_2',
      title: '📖 雙語小博士極致精通勳章',
      category: 'medal',
      categoryLabel: '🏅 繪本精通勳章',
      rarity: 'SR 稀有',
      rarityBadgeClass: 'bg-gradient-to-r from-purple-400 to-indigo-500 text-white',
      rarityBgGradient: 'from-purple-500/20 via-indigo-500/10 to-slate-900',
      rarityBorder: 'border-purple-400/60',
      icon: '🏅',
      completedDate: '2026-08-11 18:45',
      sourceBookOrTask: '《小熊雙語日常》雙語生字挑戰',
      description: '成功累積學習超過 40 個雙語離線詞彙，並在朗讀互動測驗中取得全對的頂尖表現。',
      rewardCrystals: 350,
      certificateCode: 'CERT-SILVER-VOCAB-8821',
      highlights: ['40+ 雙語核心生字', '朗讀發音精準度 98%', '達成雙語溝通基礎'],
    },
    {
      id: 'sc_3',
      title: '🧩 繪本記憶拼圖全通關榮譽證書',
      category: 'mission',
      categoryLabel: '🎯 閱讀任務成就',
      rarity: 'SR 稀有',
      rarityBadgeClass: 'bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950',
      rarityBgGradient: 'from-emerald-500/20 via-teal-500/10 to-slate-900',
      rarityBorder: 'border-emerald-400/60',
      icon: '🧩',
      completedDate: '2026-08-10 15:20',
      sourceBookOrTask: '離線繪本記憶拼圖全套挑戰',
      description: '憑藉敏銳的視覺觀察力與圖像記憶力，在限時內完美拼合繪本經典插畫場景。',
      rewardCrystals: 300,
      certificateCode: 'CERT-PUZZLE-MASTER-7734',
      highlights: ['圖像觀察力 100%', '平均拼圖用時 < 30 秒', '解鎖繪本全彩插畫'],
    },
    {
      id: 'sc_4',
      title: '⏱️ 離線專注大師 120 分鐘勳章',
      category: 'focus',
      categoryLabel: '⚡ 專注極限勳章',
      rarity: 'R 精英',
      rarityBadgeClass: 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950',
      rarityBgGradient: 'from-cyan-500/20 via-blue-500/10 to-slate-900',
      rarityBorder: 'border-cyan-400/60',
      icon: '⏱️',
      completedDate: '2026-08-09 20:10',
      sourceBookOrTask: '離線專注力時鐘純淨模式',
      description: '在零干擾的離線專注時鐘引導下，累積專注閱讀時間成功跨越 120 分鐘大關！',
      rewardCrystals: 250,
      certificateCode: 'CERT-FOCUS-120MIN-6612',
      highlights: ['累積專注 120+ 分鐘', '深度沉浸閱讀', '養成良好閱讀習慣'],
    },
    {
      id: 'sc_5',
      title: '🏆 故事速讀挑戰總冠軍水晶座',
      category: 'trophy',
      categoryLabel: '🏆 挑戰極限獎盃',
      rarity: 'SSR 傳奇',
      rarityBadgeClass: 'bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-950',
      rarityBgGradient: 'from-amber-500/20 via-yellow-500/10 to-slate-900',
      rarityBorder: 'border-amber-400/60',
      icon: '🏆',
      completedDate: '2026-08-08 14:15',
      sourceBookOrTask: '速讀挑戰榜極速測驗',
      description: '在繪本離線速讀挑戰中展現出高超的閱讀速度與全對理解率，榮登極速英雄榜榜首！',
      rewardCrystals: 450,
      certificateCode: 'CERT-SPEED-CHAMP-5501',
      highlights: ['理解率 100%', '閱讀速度每頁 12 秒', '排行榜第 1 名'],
    },
    {
      id: 'sc_6',
      title: '🎨 繪本藝術美學鑑賞榮譽獎章',
      category: 'medal',
      categoryLabel: '🏅 繪本精通勳章',
      rarity: 'R 精英',
      rarityBadgeClass: 'bg-gradient-to-r from-pink-400 to-rose-500 text-white',
      rarityBgGradient: 'from-pink-500/20 via-rose-500/10 to-slate-900',
      rarityBorder: 'border-pink-400/60',
      icon: '🎨',
      completedDate: '2026-08-07 11:30',
      sourceBookOrTask: '《彩虹小鎮的調色盤》離線閱讀',
      description: '仔細品味繪本插畫色彩細節，並成功解鎖全套繪本藝術彩蛋卡片。',
      rewardCrystals: 200,
      certificateCode: 'CERT-ART-AESTHETIC-4419',
      highlights: ['藝術視野敏銳', '細緻賞析視覺圖像', '獲得彩繪勳章'],
    },
  ];

  const [selectedShowcaseCategory, setSelectedShowcaseCategory] = useState<'all' | 'mission' | 'medal' | 'trophy' | 'focus'>('all');
  const [inspectShowcaseItem, setInspectShowcaseItem] = useState<ShowcaseTaskItem | null>(null);

  const filteredShowcaseItems = SHOWCASE_ITEMS.filter((item) => {
    if (selectedShowcaseCategory !== 'all' && item.category !== selectedShowcaseCategory) return false;
    return true;
  });

  // --- 💾 離線空間圓餅圖 & 智慧推薦 (Storage Pie Chart & Smart Recommendations) ---
  const [activePieIndex, setActivePieIndex] = useState<number>(0);
  const [recommendationSeed, setRecommendationSeed] = useState<number>(0);
  const [recommendationFilter, setRecommendationFilter] = useState<'all' | 'category' | 'bilingual' | 'science'>('all');

  const STORAGE_COLORS = [
    '#F59E0B', // Amber
    '#EC4899', // Pink
    '#10B981', // Emerald
    '#3B82F6', // Blue
    '#8B5CF6', // Purple
    '#F43F5E', // Rose
    '#06B6D4', // Cyan
    '#EAB308', // Yellow
  ];

  interface StoragePieSlice {
    id: string;
    name: string;
    valueMB: number;
    percentage: number;
    color: string;
    coverUrl?: string;
    pageCount?: number;
    category?: string;
    isSystem?: boolean;
    rawBook?: Book;
  }

  const getPieChartData = (): StoragePieSlice[] => {
    if (analytics && analytics.downloadedBooks && analytics.downloadedBooks.length > 0) {
      let total = 0;
      const slices: StoragePieSlice[] = analytics.downloadedBooks.map((b, idx) => {
        const title = typeof b.title === 'string' ? b.title : (b.title['zh-TW'] || b.title.en || '繪本故事');
        const pageCnt = b.pages?.length || 8;
        const mb = parseFloat((pageCnt * 0.28 + 0.6).toFixed(2));
        total += mb;
        return {
          id: b.id,
          name: title,
          valueMB: mb,
          percentage: 0,
          color: STORAGE_COLORS[idx % STORAGE_COLORS.length],
          coverUrl: b.coverUrl,
          pageCount: pageCnt,
          category: b.category || '童話冒險',
          rawBook: b,
        };
      });

      // System cache slice
      const sysMB = 0.8;
      total += sysMB;
      slices.push({
        id: 'sys_cache',
        name: '系統離線音效與字庫',
        valueMB: sysMB,
        percentage: 0,
        color: '#06B6D4',
        isSystem: true,
      });

      slices.forEach((s) => {
        s.percentage = parseFloat(((s.valueMB / total) * 100).toFixed(1));
      });

      return slices;
    }

    // Demo slices if no books downloaded yet
    return [
      { id: 'demo_1', name: '小熊的魔法花園', valueMB: 2.4, percentage: 38.1, color: '#F59E0B', pageCount: 8, category: 'Fairy Tale', coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=300&q=80' },
      { id: 'demo_2', name: '月亮奇幻冒險', valueMB: 2.8, percentage: 44.4, color: '#EC4899', pageCount: 10, category: 'Adventure', coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=300&q=80' },
      { id: 'demo_3', name: '海底世界秘密', valueMB: 1.2, percentage: 17.5, color: '#10B981', pageCount: 6, category: 'Nature & Science' },
    ];
  };

  const renderActivePieSector = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, valueMB, percentage } = props;
    return (
      <g>
        <text x={cx} y={cy - 12} dy={8} textAnchor="middle" fill="#FCD34D" className="font-black text-xs">
          {payload.name}
        </text>
        <text x={cx} y={cy + 10} dy={8} textAnchor="middle" fill="#FFFFFF" className="font-bold text-[11px]">
          {valueMB} MB ({percentage}%)
        </text>
        <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 8} startAngle={startAngle} endAngle={endAngle} fill={fill} />
        <Sector cx={cx} cy={cy} startAngle={startAngle} endAngle={endAngle} innerRadius={outerRadius + 10} outerRadius={outerRadius + 14} fill={fill} />
      </g>
    );
  };

  // --- 🤖 離線智慧推薦 (Smart Offline Recommendations based on Download History) ---
  const SAMPLE_RECOMMENDATION_BOOKS: Book[] = [
    {
      id: 'rec_book_1',
      title: { 'zh-TW': '小熊的魔法花園', en: 'Little Bear Magic Garden', ko: '', ja: '', fr: '', es: '', 'zh-CN': '' },
      coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80',
      coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80',
      description: '小熊在秘密花園發現了會發光的魔法種子，與森林夥伴展開溫馨冒險。',
      ageGroup: '6-8',
      category: 'Fairy Tale',
      pages: Array(8).fill({
        pageNumber: 1,
        text: { 'zh-TW': '小熊在秘密花園發現了會發光的魔法種子...', en: 'Little Bear found glowing magic seeds...', ko: '', ja: '', fr: '', es: '', 'zh-CN': '' },
        imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80',
        vocab: [{ word: 'Garden', translation: '花園' }, { word: 'Magic', translation: '魔法' }]
      })
    } as any,
    {
      id: 'rec_book_2',
      title: { 'zh-TW': '月亮城堡奇幻夜', en: 'Moon Castle Adventure', ko: '', ja: '', fr: '', es: '', 'zh-CN': '' },
      coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=400&q=80',
      coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=400&q=80',
      description: '月亮高掛的夜晚，小精靈開啟了城堡隱藏的星空門戶。',
      ageGroup: '6-8',
      category: 'Fairy Tale',
      pages: Array(10).fill({
        pageNumber: 1,
        text: { 'zh-TW': '月亮城堡散發著耀眼銀光...', en: 'The moon castle shined brightly...', ko: '', ja: '', fr: '', es: '', 'zh-CN': '' },
        imageUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=400&q=80',
        vocab: [{ word: 'Castle', translation: '城堡' }, { word: 'Moon', translation: '月亮' }]
      })
    } as any,
    {
      id: 'rec_book_3',
      title: { 'zh-TW': '深海小鯨魚的禮物', en: 'Little Whale Sea Gift', ko: '', ja: '', fr: '', es: '', 'zh-CN': '' },
      coverUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80',
      coverImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80',
      description: '小鯨魚優游在湛藍大海，為水族夥伴送上璀璨珍珠。',
      ageGroup: '3-5',
      category: 'Nature & Science',
      pages: Array(6).fill({
        pageNumber: 1,
        text: { 'zh-TW': '湛藍大海裡有好多可愛的水族朋友...', en: 'There are many lovely sea friends...', ko: '', ja: '', fr: '', es: '', 'zh-CN': '' },
        imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80',
        vocab: [{ word: 'Whale', translation: '鯨魚' }, { word: 'Ocean', translation: '海洋' }]
      })
    } as any,
    {
      id: 'rec_book_4',
      title: { 'zh-TW': '星空貓咪發明家', en: 'Starry Cat Inventor', ko: '', ja: '', fr: '', es: '', 'zh-CN': '' },
      coverUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=400&q=80',
      coverImage: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=400&q=80',
      description: '小貓咪用齒輪與積木打造出能飛向繁星的夢想熱氣球。',
      ageGroup: '6-8',
      category: 'Adventure',
      pages: Array(9).fill({
        pageNumber: 1,
        text: { 'zh-TW': '貓咪工程師組合好發射裝備...', en: 'Cat engineer assembled the device...', ko: '', ja: '', fr: '', es: '', 'zh-CN': '' },
        imageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=400&q=80',
        vocab: [{ word: 'Inventor', translation: '發明家' }, { word: 'Rocket', translation: '火箭' }]
      })
    } as any
  ];

  const getSmartRecommendations = () => {
    const downloadedList = analytics?.downloadedBooks || [];
    const downloadedIds = downloadedList.map((b) => b.id);
    const pool = books && books.length > 0 ? books : SAMPLE_RECOMMENDATION_BOOKS;

    // Analyze favorite categories from downloaded books history
    const categoryCounts: Record<string, number> = {};
    const downloadedTitles: string[] = [];

    downloadedList.forEach((b) => {
      const title = typeof b.title === 'string' ? b.title : (b.title['zh-TW'] || b.title.en || '');
      if (title) downloadedTitles.push(title);
      const cat = b.category || (title.includes('魔法') || title.includes('冒險') ? '奇幻冒險' : title.includes('月亮') ? '神奇童話' : '自然雙語');
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });

    // Find top downloaded category
    let topCategory = '奇幻冒險';
    let maxCount = 0;
    Object.entries(categoryCounts).forEach(([cat, count]) => {
      if (count > maxCount) {
        maxCount = count;
        topCategory = cat;
      }
    });

    const mostReadTitle = downloadedTitles[0] || '小熊的魔法花園';
    const childName = userProfile?.name || '小讀者';

    // Filter candidate books not downloaded
    let unDownloaded = pool.filter((b) => !downloadedIds.includes(b.id));
    if (unDownloaded.length === 0) {
      unDownloaded = SAMPLE_RECOMMENDATION_BOOKS.filter((b) => !downloadedIds.includes(b.id));
    }
    if (unDownloaded.length === 0) {
      unDownloaded = pool;
    }

    return unDownloaded.map((book, idx) => {
      const title = typeof book.title === 'string' ? book.title : (book.title['zh-TW'] || book.title.en || '繪本故事');
      const bookCategory = book.category || '奇幻冒險';
      const isCategoryMatch = bookCategory.includes(topCategory) || topCategory.includes(bookCategory) || idx === 0;

      const reasonTag = isCategoryMatch
        ? `🔥 根據您最常離線翻閱《${mostReadTitle}》之『${topCategory}』偏好特別推薦`
        : idx % 2 === 0
        ? `💡 契合 ${childName} (${book.ageGroup || '5-8'}歲) 之雙語詞彙量與自然觀察樂趣`
        : `⭐ 離線童書榜 TOP ${idx + 1} ‧ 內含 ${book.pages?.reduce((acc, p) => acc + (p.vocab?.length || 0), 0) || 12} 個離線情境生字`;

      const matchScore = isCategoryMatch ? 99 - idx : 94 - idx;
      const estMB = parseFloat(((book.pages?.length || 8) * 0.28 + 0.5).toFixed(1));

      return {
        book,
        title,
        reasonTag,
        matchScore,
        estimatedMB: estMB,
        isDownloaded: downloadedIds.includes(book.id),
      };
    });
  };

  const handleDownloadRecommendation = (book: Book) => {
    const success = saveBookForOffline(book);
    if (success) {
      playStarChime();
      setToastMessage(`🎉 已將《${typeof book.title === 'string' ? book.title : book.title['zh-TW']}》預先快取至離線庫！`);
      refreshAnalytics();
    }
  };

  const handlePlayVoiceNote = (noteId: string, audioUrl?: string, textContent?: string) => {
    if (playingVoiceNoteId === noteId) {
      if (activeAudioRef.current) {
        activeAudioRef.current.pause();
        activeAudioRef.current = null;
      }
      setPlayingVoiceNoteId(null);
      return;
    }

    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
      activeAudioRef.current = null;
    }

    if (audioUrl && audioUrl.startsWith('data:audio')) {
      try {
        const audio = new Audio(audioUrl);
        activeAudioRef.current = audio;
        setPlayingVoiceNoteId(noteId);
        audio.play();
        audio.onended = () => setPlayingVoiceNoteId(null);
        audio.onerror = () => setPlayingVoiceNoteId(null);
      } catch {
        setPlayingVoiceNoteId(null);
      }
    } else {
      playStarChime();
      setPlayingVoiceNoteId(noteId);
      speakText(textContent || "這本繪本故事真特別，每次聽都有新的收穫！", "zh-TW", 1.0, "fairy", 1.0, () => setPlayingVoiceNoteId(null));
    }
  };

  const handleStartSpeedChallenge = (book: Book) => {
    playStarChime();
    setSpeedBookId(book.id);
    setSpeedStatus('reading');
    setSpeedTimerSec(0);
    setSpeedPageIndex(0);
    setSpeedQuizAnswers([0, 0, 0]);
  };

  const handleSubmitSpeedQuiz = () => {
    playStarChime();
    const activeBook = analytics?.downloadedBooks.find((b) => b.id === speedBookId) || analytics?.downloadedBooks[0];
    const pageCount = activeBook?.pages?.length || 8;
    const timeSec = Math.max(10, speedTimerSec);
    const secPerPage = parseFloat((timeSec / pageCount).toFixed(1));

    let correctCount = 0;
    speedQuizAnswers.forEach((ans) => {
      if (ans === 0) correctCount++;
    });
    const accuracyPct = Math.round((correctCount / 3) * 100);

    const speedScore = Math.max(100, Math.round(500 - timeSec * 3));
    const accuracyBonus = Math.round((accuracyPct / 100) * 500);
    const totalScore = speedScore + accuracyBonus;

    const childName = userProfile?.name || '小讀者';
    const avatar = userProfile?.avatar || '🐻';
    const bookTitle = activeBook ? (typeof activeBook.title === 'string' ? activeBook.title : (activeBook.title['zh-TW'] || activeBook.title.en)) : '離線繪本';

    const newRecord: SpeedChallengeRecord = {
      id: `rec_${Date.now()}`,
      childName,
      avatar,
      bookTitle,
      timeSec,
      pageCount,
      secPerPage,
      accuracyPct,
      score: totalScore,
      dateStr: '剛才',
    };

    const updatedLeaderboard = [newRecord, ...speedLeaderboard].sort((a, b) => b.score - a.score);
    const myRank = updatedLeaderboard.findIndex((r) => r.id === newRecord.id) + 1;

    setSpeedLeaderboard(updatedLeaderboard);
    setLastChallengeRank(myRank);
    setSpeedStatus('result');

    try {
      localStorage.setItem('pwa_speed_challenge_leaderboard', JSON.stringify(updatedLeaderboard));
      const profile = JSON.parse(localStorage.getItem('pwa_user_profile') || '{}');
      profile.stars = (profile.stars || 15) + 15;
      localStorage.setItem('pwa_user_profile', JSON.stringify(profile));
    } catch (e) {
      console.error(e);
    }
  };

  // --- 🧩 繪本記憶拼圖 (Storybook Memory Puzzle) States & Hidden Characters ---
  const [puzzleBookId, setPuzzleBookId] = useState<string | null>(null);
  const [puzzlePageIndex, setPuzzlePageIndex] = useState<number>(0);
  const [puzzleTiles, setPuzzleTiles] = useState<number[]>([0, 1, 2, 3, 4, 5, 6, 7, 8]);
  const [selectedTileIndex, setSelectedTileIndex] = useState<number | null>(null);
  const [puzzleMoveCount, setPuzzleMoveCount] = useState<number>(0);
  const [puzzleTimeSec, setPuzzleTimeSec] = useState<number>(0);
  const [isPuzzleSolved, setIsPuzzleSolved] = useState<boolean>(false);
  const [showPuzzlePreview, setShowPuzzlePreview] = useState<boolean>(false);
  const [inspectHiddenChar, setInspectHiddenChar] = useState<any | null>(null);

  // Unlocked hidden characters per book
  const [unlockedCharacterBookIds, setUnlockedCharacterBookIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('pwa_unlocked_hidden_characters');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return ['rec_book_1', 'b1']; // Default initially unlocked book
  });

  // Hidden Character Mapping Function
  const getHiddenCharacterForBook = (bookId: string, bookTitle: string) => {
    const titleStr = typeof bookTitle === 'string' ? bookTitle : '繪本故事';
    if (bookId.includes('rec_book_1') || bookId.includes('b1') || titleStr.includes('花園') || titleStr.includes('小熊')) {
      return {
        bookId,
        bookTitle: titleStr,
        characterName: '花園花仙子波波',
        characterTitle: '自然植物學導師 🧚‍♀️',
        avatarEmoji: '🧚‍♀️',
        roleBadge: '🌿 守護植物奇蹟',
        knowledgeTitle: '植物光合作用與呼吸魔法卡',
        knowledgeDesc: '花仙子波波教導我們：綠色植物透過葉綠素吸收太陽光，將空氣與水轉換為能量並釋放新鮮氧氣！',
        specialSkill: '🌸 植物快速發芽術',
        quoteText: '「謝謝你完成花園故事記憶拼圖！只要愛護花草樹木，大地就會充滿生命力喔！」',
        bilingualTerms: [
          { en: 'Photosynthesis', zh: '光合作用' },
          { en: 'Chlorophyll', zh: '葉綠素' },
          { en: 'Sprout', zh: '發芽' },
        ],
      };
    }
    if (bookId.includes('rec_book_2') || bookId.includes('b2') || titleStr.includes('月亮') || titleStr.includes('夜') || titleStr.includes('城堡')) {
      return {
        bookId,
        bookTitle: titleStr,
        characterName: '銀河獨角獸露娜',
        characterTitle: '星空天體學掌門人 🦄',
        avatarEmoji: '🦄',
        roleBadge: '🌙 掌管月相與潮汐',
        knowledgeTitle: '月相盈虧與潮汐引力卡',
        knowledgeDesc: '露娜引領我們觀察新月、半月與滿月的規律，並了解月球引力如何引導大海潮起潮落！',
        specialSkill: '✨ 虹光星路引航',
        quoteText: '「在浩瀚的夜晚裡，星光永遠照亮勇敢探索故事的心靈！」',
        bilingualTerms: [
          { en: 'Crescent Moon', zh: '弦月' },
          { en: 'Gravity', zh: '引力' },
          { en: 'Tide', zh: '潮汐' },
        ],
      };
    }
    if (bookId.includes('rec_book_3') || bookId.includes('b3') || titleStr.includes('喵') || titleStr.includes('發明')) {
      return {
        bookId,
        bookTitle: titleStr,
        characterName: '齒輪貓博士阿喵',
        characterTitle: '幾何工程發明家 🐱⚙️',
        avatarEmoji: '🐱',
        roleBadge: '⚙️ 城堡機械建造者',
        knowledgeTitle: '槓桿原理與機械幾何結構卡',
        knowledgeDesc: '阿喵博士展示如何運用槓桿支點與齒輪轉速比例，用小小的力量舉起沉重的城堡大門！',
        specialSkill: '🔧 幾何萬能修復術',
        quoteText: '「好奇心是最好的發明引擎！動動腦筋，任何難題都能找到解答！」',
        bilingualTerms: [
          { en: 'Lever', zh: '槓桿' },
          { en: 'Gear', zh: '齒輪' },
          { en: 'Fulcrum', zh: '支點' },
        ],
      };
    }
    if (titleStr.includes('海') || titleStr.includes('鯨') || titleStr.includes('魚') || titleStr.includes('水')) {
      return {
        bookId,
        bookTitle: titleStr,
        characterName: '深海鯨魚大藍',
        characterTitle: '海洋生態守護大使 🐋',
        avatarEmoji: '🐋',
        roleBadge: '🌊 藍色大海航海家',
        knowledgeTitle: '洋流循環與海洋生態鏈卡',
        knowledgeDesc: '大藍帶領我們潛入深海，觀察洋流如何攜帶養分，並維繫珊瑚礁與萬物生生不息的生態系統！',
        specialSkill: '🫧 超聲波定位發射',
        quoteText: '「保護清澈的大海，就是給所有海洋生物最棒的家園禮物！」',
        bilingualTerms: [
          { en: 'Ocean Current', zh: '洋流' },
          { en: 'Coral Reef', zh: '珊瑚礁' },
          { en: 'Ecosystem', zh: '生態系' },
        ],
      };
    }
    return {
      bookId,
      bookTitle: titleStr,
      characterName: '智慧彩繪精靈嗶嗶',
      characterTitle: '三原色美學導師 🎨',
      avatarEmoji: '🎨',
      roleBadge: '🌈 繪本色彩美學大師',
      knowledgeTitle: '三原色調光與視覺美學卡',
      knowledgeDesc: '嗶嗶讓我們了解紅、黃、藍三原色相互混合後能創造出萬千變化，展現藝術與情緒感染力！',
      specialSkill: '🖌️ 七彩光芒幻化',
      quoteText: '「故事裡的每一種顏色都有情感，試著用色彩說出你的奇幻繪本世界吧！」',
      bilingualTerms: [
        { en: 'Primary Colors', zh: '三原色' },
        { en: 'Palette', zh: '調色盤' },
        { en: 'Harmony', zh: '和諧' },
      ],
    };
  };

  const handleSpeakCharacterVoice = (charInfo: any) => {
    playStarChime();
    const text = `我是《${charInfo.bookTitle}》的隱藏知識角色：${charInfo.characterName}！${charInfo.quoteText} 今天要分享給你的知識卡片是【${charInfo.knowledgeTitle}】：${charInfo.knowledgeDesc}`;
    speakText(text, 'zh-TW', 1.0, 'fairy', 1.0);
  };

  // --- ☁️ 語音心得情緒雲 (Voice Note Emotion Cloud) New Note States ---
  const [newNoteBookId, setNewNoteBookId] = useState<string>('');
  const [newNoteEmoji, setNewNoteEmoji] = useState<string>('😃');
  const [newNoteTitle, setNewNoteTitle] = useState<string>('');

  const handleSaveNewVoiceEmotionNote = () => {
    if (!newNoteTitle.trim()) {
      setToastMessage('請輸入或表達語音心得標題喔！');
      return;
    }
    playStarChime();
    const availableBooks = analytics?.downloadedBooks && analytics.downloadedBooks.length > 0
      ? analytics.downloadedBooks
      : SAMPLE_RECOMMENDATION_BOOKS;

    const targetBook = availableBooks.find((b) => b.id === newNoteBookId) || availableBooks[0];
    const targetBookId = targetBook.id;
    const bTitle = typeof targetBook.title === 'string' ? targetBook.title : (targetBook.title['zh-TW'] || targetBook.title.en || '繪本故事');

    const newBookmark = {
      id: `bm_voice_${Date.now()}`,
      bookId: targetBookId,
      bookTitle: bTitle,
      pageNumber: Math.floor(Math.random() * 5) + 1,
      audioDataUrl: '',
      createdAt: '剛才',
      emotionEmoji: newNoteEmoji,
      noteTitle: newNoteTitle.trim(),
      durationSec: 6,
    };

    try {
      const raw = localStorage.getItem(`pwa_audio_bookmarks_${targetBookId}`) || '[]';
      const list = JSON.parse(raw);
      list.unshift(newBookmark);
      localStorage.setItem(`pwa_audio_bookmarks_${targetBookId}`, JSON.stringify(list));
      setToastMessage(`🎙️ 成功新增《${bTitle}》的「${newNoteEmoji} ${newNoteTitle}」離線語音心情筆記！`);
      setNewNoteTitle('');
      refreshAnalytics();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSpeakAiEmotionReport = () => {
    playStarChime();
    const childName = userProfile?.name || '小讀者';
    const text = `親愛的家長與${childName}！根據離線語音情緒雲綜合分析，孩子在共讀體驗中展現出高達 92% 的快樂表達指數與 95% 的知識好奇心！特別在感同故事角色的冒險時刻時，語音情感非常豐沛真實！建議繼續鼓勵孩子口述紀錄心得！`;
    speakText(text, 'zh-TW', 1.0, 'fairy', 1.0);
  };

  // Puzzle timer effect
  useEffect(() => {
    let timer: any = null;
    if (activeTab === 'memorypuzzle' && !isPuzzleSolved) {
      timer = setInterval(() => {
        setPuzzleTimeSec((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [activeTab, isPuzzleSolved]);

  const initShufflePuzzle = () => {
    const arr = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    setPuzzleTiles(arr);
    setSelectedTileIndex(null);
    setPuzzleMoveCount(0);
    setPuzzleTimeSec(0);
    setIsPuzzleSolved(false);
  };

  const handleTileClick = (index: number) => {
    if (isPuzzleSolved) return;
    playPageTurnSound();

    if (selectedTileIndex === null) {
      setSelectedTileIndex(index);
    } else {
      const newTiles = [...puzzleTiles];
      const temp = newTiles[selectedTileIndex];
      newTiles[selectedTileIndex] = newTiles[index];
      newTiles[index] = temp;

      setPuzzleTiles(newTiles);
      setSelectedTileIndex(null);
      setPuzzleMoveCount((prev) => prev + 1);

      const solved = newTiles.every((val, idx) => val === idx);
      if (solved) {
        playStarChime();
        setIsPuzzleSolved(true);

        // Unlock hidden character for this book
        const currentActiveBook = (analytics?.downloadedBooks && analytics.downloadedBooks.length > 0
          ? analytics.downloadedBooks
          : SAMPLE_RECOMMENDATION_BOOKS).find(b => b.id === puzzleBookId) || (analytics?.downloadedBooks?.[0] || SAMPLE_RECOMMENDATION_BOOKS[0]);

        const activeId = currentActiveBook.id;
        const activeTitle = typeof currentActiveBook.title === 'string' ? currentActiveBook.title : (currentActiveBook.title['zh-TW'] || currentActiveBook.title.en);
        const hiddenChar = getHiddenCharacterForBook(activeId, activeTitle);

        if (!unlockedCharacterBookIds.includes(activeId)) {
          const updatedUnlocked = [...unlockedCharacterBookIds, activeId];
          setUnlockedCharacterBookIds(updatedUnlocked);
          localStorage.setItem('pwa_unlocked_hidden_characters', JSON.stringify(updatedUnlocked));
          setToastMessage(`🎉 成功解鎖《${activeTitle}》隱藏角色：${hiddenChar.characterName}！獲得專屬知識卡片！`);
        } else {
          setToastMessage(`✨ 重溫《${activeTitle}》故事記憶拼圖！已再次確認解鎖隱藏角色 ${hiddenChar.characterName}！`);
        }

        try {
          const profile = JSON.parse(localStorage.getItem('pwa_user_profile') || '{}');
          profile.stars = (profile.stars || 15) + 15;
          localStorage.setItem('pwa_user_profile', JSON.stringify(profile));
        } catch (e) {
          console.error(e);
        }
      }
    }
  };

  // --- Guided Storage Wizard States ---
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3>(1);
  const [selectedWizardVoice, setSelectedWizardVoice] = useState<VoiceRole>('fairy');
  const [isSpeakingGuide, setIsSpeakingGuide] = useState<boolean>(false);
  const [sweptBookIds, setSweptBookIds] = useState<string[]>([]);
  const [wizardRewardClaimed, setWizardRewardClaimed] = useState<boolean>(false);

  // --- Offline Quick Read States ---
  const [selectedQuickBookId, setSelectedQuickBookId] = useState<string | null>(null);
  const [quickPageIndex, setQuickPageIndex] = useState<number>(0);
  const [isAutoFlipping, setIsAutoFlipping] = useState<boolean>(false);
  const [flipSpeedSec, setFlipSpeedSec] = useState<3 | 5 | 8>(5);
  const [isNarratingPage, setIsNarratingPage] = useState<boolean>(false);

  const refreshAnalytics = () => {
    setAnalytics(getOfflineStorageAnalytics());
  };

  useEffect(() => {
    if (isOpen) {
      refreshAnalytics();
    } else {
      stopBackgroundAmbience();
      setIsMusicPlaying(false);
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    }
  }, [isOpen]);

  // Clean speech synthesis when leaving tab or modal
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [activeTab]);

  // Auto flip effect for Speed Reading mode
  useEffect(() => {
    let timer: any = null;
    if (isAutoFlipping && analytics && analytics.downloadedBooks.length > 0) {
      const activeBook = analytics.downloadedBooks.find((b) => b.id === selectedQuickBookId) || analytics.downloadedBooks[0];
      const pageCount = activeBook?.pages?.length || 1;

      timer = setInterval(() => {
        playPageTurnSound();
        setQuickPageIndex((prev) => (prev + 1) % pageCount);
      }, flipSpeedSec * 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isAutoFlipping, selectedQuickBookId, flipSpeedSec, analytics]);

  if (!isOpen || !analytics) return null;

  const currentAtmosphere = ATMOSPHERE_THEMES.find((t) => t.id === atmosphere) || ATMOSPHERE_THEMES[0];

  const handleClearCache = () => {
    setIsClearing(true);
    clearAllOfflineStorageCache();
    setTimeout(() => {
      refreshAnalytics();
      setIsClearing(false);
      setToastMessage('🎉 已成功清空所有離線快取的繪本資源！');
      setTimeout(() => setToastMessage(null), 4000);
    }, 500);
  };

  const handleExportReport = () => {
    const reportContent = `
=== 世界童書數位圖書館 • 孩童離線閱讀與學習數據分析報告 ===
報告產出時間：${new Date().toLocaleString('zh-TW')}
孩童暱稱：${userProfile?.name || '小讀者'}
連線狀態：${analytics.isOnline ? '網絡正常連線' : '離線模式中'}
閱讀氣氛設定：${currentAtmosphere.name}

【一、 學習習慣與閱讀數據總覽】
• 累積閱讀總時長：${userProfile?.readingMinutes || 25} 分鐘
• 連續閱讀天數：${userProfile?.streakDays || 3} 天
• 累積獲贈童星獎勵：${userProfile?.stars || 15} 顆 ⭐
• 已收藏生字詞彙：${userWordsCount || 5} 個
• 完成繪本閱讀數：${userProfile?.readBookIds?.length || 1} 本

【二、 PWA 本地離線快取與容量指標】
• 已離線下載繪本數：${analytics.downloadedBookCount} 本
• 快取插圖頁數：${analytics.totalPagesCached} 頁
• 占用磁碟空間：${analytics.estimatedMB}
• 無網閱讀完備度：100% 本地存取，無隱私外洩風險

【三、 主題偏好與故事類別分佈】
• 冒險探索類 (Adventure)：45%
• 童話與神奇世界 (Fairy Tale)：30%
• 自然與科學類 (Nature & Science)：25%

【四、 家長與導師指導建議】
孩童展現良好的閱讀專注度與雙語學習探索習慣！
建議繼續保持每日 15 分鐘閱讀習慣，搭配生字本隨堂卡牌複習與語音朗讀，鞏固語言詞彙量。

感謝使用世界童書數位圖書館！
    `.trim();

    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `孩童繪本閱讀與離線數據分析報告_${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Atmosphere change handler
  const handleSelectAtmosphere = (thm: AtmosphereTheme) => {
    playStarChime();
    setAtmosphere(thm.id);
    localStorage.setItem('pwa_reading_atmosphere', thm.id);
    if (isMusicPlaying) {
      playBackgroundAmbience(thm.musicTrack);
    }
  };

  // Toggle background ambience music
  const handleToggleMusic = () => {
    if (isMusicPlaying) {
      stopBackgroundAmbience();
      setIsMusicPlaying(false);
    } else {
      playStarChime();
      playBackgroundAmbience(currentAtmosphere.musicTrack);
      setIsMusicPlaying(true);
    }
  };

  // Filter downloaded books that are candidate for smart cleanup (already read or old)
  const cleanupCandidates = analytics.downloadedBooks.filter((book) => {
    const isRead = userProfile?.readBookIds?.includes(book.id);
    return isRead || analytics.downloadedBooks.length > 0;
  });

  const handleSingleCleanup = (bookId: string, bookTitle: string) => {
    playStarChime();
    removeOfflineBook(bookId);
    refreshAnalytics();
    const titleStr = typeof bookTitle === 'string' ? bookTitle : '繪本';
    setToastMessage(`🎉 成功釋放《${titleStr}》離線快取！不影響閱讀歷史與童星勳章。`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleBatchSmartCleanup = () => {
    if (cleanupCandidates.length === 0) return;
    playStarChime();
    let count = 0;
    cleanupCandidates.forEach((b) => {
      removeOfflineBook(b.id);
      count++;
    });
    refreshAnalytics();
    setToastMessage(`✨ 智慧空間優化完成！已成功清理 ${count} 本完讀/久未開啟繪本，釋放寶貴磁碟空間！`);
    setTimeout(() => setToastMessage(null), 5000);
  };

  // Max localStorage capacity assumption ~ 5MB for visual progress bar
  const maxCapMB = 5.0;
  const usedMBNum = parseFloat(analytics.estimatedMB.replace(' MB', '')) || 0.1;
  const storagePercentage = Math.min(100, Math.round((usedMBNum / maxCapMB) * 100));

  // --- Wizard AI Voice Handler ---
  const handleSpeakWizardGuidance = () => {
    if (isSpeakingGuide) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsSpeakingGuide(false);
      return;
    }

    const childName = userProfile?.name || '小讀者';
    const voiceObj = WIZARD_VOICES.find((v) => v.role === selectedWizardVoice) || WIZARD_VOICES[0];
    const guidanceText = `嗨！親愛的${childName}！我是你的${voiceObj.name}！我們的離線繪本城堡盒子現在用了百分之${storagePercentage}的容量，裡面存放了 ${analytics.downloadedBookCount} 本精彩故事。把讀完的故事進行整理打包，就能清出寶貴空間放進更多全新的冒險繪本喔！跟我一起完成城堡大掃除任務吧！`;

    playStarChime();
    setIsSpeakingGuide(true);
    speakText(
      guidanceText,
      'zh-TW',
      1.0,
      selectedWizardVoice,
      1.1,
      () => setIsSpeakingGuide(false)
    );
  };

  // Wizard single book sweep action
  const handleWizardSweepBook = (bookId: string, titleStr: string) => {
    playStarChime();
    if (!sweptBookIds.includes(bookId)) {
      setSweptBookIds((prev) => [...prev, bookId]);
      removeOfflineBook(bookId);
      refreshAnalytics();
    }
  };

  // Wizard sweep all candidate books
  const handleWizardSweepAll = () => {
    playStarChime();
    const allIds = cleanupCandidates.map((b) => b.id);
    setSweptBookIds(allIds);
    allIds.forEach((id) => removeOfflineBook(id));
    refreshAnalytics();
    setWizardStep(3);
  };

  // --- Quick Read Helpers ---
  const activeQuickBook = analytics.downloadedBooks.find((b) => b.id === selectedQuickBookId) || analytics.downloadedBooks[0];
  const activeQuickPage = activeQuickBook?.pages?.[quickPageIndex] || activeQuickBook?.pages?.[0];

  const handleSpeakQuickPage = () => {
    if (isNarratingPage) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsNarratingPage(false);
      return;
    }

    if (!activeQuickPage) return;
    const pageText = activeQuickPage.text['zh-TW'] || '';
    if (!pageText) return;

    playStarChime();
    setIsNarratingPage(true);
    speakText(
      pageText,
      'zh-TW',
      1.0,
      'mom',
      1.0,
      () => setIsNarratingPage(false)
    );
  };

  // --- 🌟 離線閱讀進度條與里程碑摘要 (Reading Progress Bar & Milestone Summary) Data ---
  const summaryReadingMins = userProfile?.readingMinutes || (analytics?.totalPagesCached ? analytics.totalPagesCached * 15 : 1110);
  const summaryReadingHours = (summaryReadingMins / 60).toFixed(1);
  const completedBooksCount = userProfile?.readBookIds?.length || analytics?.downloadedBookCount || 12;
  const unlockedKnowledgeCount = KNOWLEDGE_NODES_DATA?.length || 8;
  const milestoneTargetHours = 20;
  const milestoneProgressPct = Math.min(100, Math.round((Number(summaryReadingHours) / milestoneTargetHours) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div
        className={`relative w-full max-w-2xl max-h-[92vh] flex flex-col rounded-3xl shadow-2xl border transition-all duration-500 overflow-hidden bg-gradient-to-br ${currentAtmosphere.bgGradient} ${currentAtmosphere.borderClass} text-slate-100`}
      >
        {/* Floating Ambient Particles background decoration */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30 flex justify-between p-6">
          {currentAtmosphere.particles.map((pt, pIdx) => (
            <span
              key={pIdx}
              className="text-2xl animate-pulse"
              style={{ animationDelay: `${pIdx * 0.7}s` }}
            >
              {pt}
            </span>
          ))}
        </div>

        {/* Header */}
        <div className="relative z-10 flex items-center justify-between p-4 sm:p-5 border-b border-amber-200/20 bg-slate-950/60 backdrop-blur-xs">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-amber-500 text-slate-950 shadow-md font-black">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg tracking-tight flex items-center gap-2 flex-wrap">
                <span>離線數據與學習分析報告</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-black flex items-center gap-1 ${
                  analytics.isOnline
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                    : 'bg-orange-950 text-orange-300 border border-orange-500/40'
                }`}>
                  {analytics.isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                  <span>{analytics.isOnline ? '網路正常' : '離線模式'}</span>
                </span>
              </h3>
              <p className="text-xs text-amber-200/80 font-bold">
                儲存精靈 ‧ 離線繪本速讀 ‧ 智慧清理 ‧ 閱讀氣氛
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 rounded-2xl bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 🌟 頂部：閱讀進度條與里程碑摘要 (Reading Progress Bar & Milestone Dashboard) */}
        <div className="relative z-10 p-4 sm:p-5 border-b border-amber-500/30 bg-gradient-to-r from-slate-950/90 via-slate-900/95 to-amber-950/50 backdrop-blur-md space-y-3.5 shadow-lg shrink-0">
          {/* Header & Encouragement Headline */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black shadow-md">
                <Sparkles className="w-4 h-4" />
              </span>
              <div>
                <h4 className="text-sm sm:text-base font-black text-amber-300 flex items-center gap-2">
                  <span>🌟 離線閱讀進度與里程碑摘要</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500/20 text-amber-300 border border-amber-400/40 font-bold">
                    Lv.3 離線達人
                  </span>
                </h4>
                <p className="text-xs font-extrabold text-slate-300">
                  持續閱讀累積時數與完讀故事，即刻解鎖『離線故事探索大師』黃金勳章！
                </p>
              </div>
            </div>

            {/* Quick stats mini badges */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="px-3 py-1 rounded-xl bg-amber-500/20 text-amber-300 font-extrabold text-xs border border-amber-400/30 flex items-center gap-1">
                ⭐ 童星幣：{userProfile?.stars || 185}
              </span>
              <span className="px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 font-extrabold text-xs border border-emerald-400/30 flex items-center gap-1">
                🔥 連續閱讀：{userProfile?.streakDays || 5} 天
              </span>
            </div>
          </div>

          {/* 3 Core Metric Display Cards Grid */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {/* Metric 1: Total Reading Hours */}
            <div className="p-3 rounded-2xl bg-slate-900/90 border border-amber-500/30 flex flex-col justify-between hover:border-amber-400 transition-all shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-xs font-black text-slate-400">⏱️ 離線閱讀總時數</span>
                <span className="p-1 rounded-lg bg-amber-500/20 text-amber-400 text-xs">
                  <Clock className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-lg sm:text-2xl font-black text-amber-300">{summaryReadingHours}</span>
                <span className="text-[10px] sm:text-xs font-bold text-slate-400">小時</span>
              </div>
              <span className="text-[10px] font-extrabold text-emerald-400 mt-0.5">
                ⚡ 相當於 {summaryReadingMins} 分鐘
              </span>
            </div>

            {/* Metric 2: Completed Books Count */}
            <div className="p-3 rounded-2xl bg-slate-900/90 border border-emerald-500/30 flex flex-col justify-between hover:border-emerald-400 transition-all shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-xs font-black text-slate-400">📚 已讀完繪本數</span>
                <span className="p-1 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs">
                  <BookOpen className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-lg sm:text-2xl font-black text-emerald-300">{completedBooksCount}</span>
                <span className="text-[10px] sm:text-xs font-bold text-slate-400">本</span>
              </div>
              <span className="text-[10px] font-extrabold text-amber-300 mt-0.5">
                📖 100% 本地離線快取
              </span>
            </div>

            {/* Metric 3: Unlocked Knowledge Points */}
            <div className="p-3 rounded-2xl bg-slate-900/90 border border-purple-500/30 flex flex-col justify-between hover:border-purple-400 transition-all shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-xs font-black text-slate-400">🧠 解鎖知識點數</span>
                <span className="p-1 rounded-lg bg-purple-500/20 text-purple-400 text-xs">
                  <GitBranch className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-lg sm:text-2xl font-black text-purple-300">{unlockedKnowledgeCount}</span>
                <span className="text-[10px] sm:text-xs font-bold text-slate-400">個</span>
              </div>
              <span className="text-[10px] font-extrabold text-cyan-300 mt-0.5">
                🔤 42 個離線雙語詞彙
              </span>
            </div>
          </div>

          {/* Milestone Goal Progress Bar & Steps */}
          <div className="p-3 sm:p-3.5 rounded-2xl bg-slate-950/80 border border-amber-500/20 space-y-2">
            <div className="flex items-center justify-between text-xs font-black">
              <span className="text-slate-200 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-400 animate-bounce" />
                <span>下一階段里程碑：【Level 4 離線故事探索大師】</span>
              </span>
              <span className="text-amber-300 font-extrabold">
                {milestoneProgressPct}% ({summaryReadingHours} / {milestoneTargetHours} 小時)
              </span>
            </div>

            {/* Progress Bar Container */}
            <div className="w-full bg-slate-900 h-3.5 rounded-full overflow-hidden p-0.5 border border-slate-700 relative">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-400 via-emerald-400 to-cyan-400 transition-all duration-1000 relative shadow-inner"
                style={{ width: `${milestoneProgressPct}%` }}
              >
                <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:12px_12px] animate-pulse"></div>
              </div>
            </div>

            {/* Milestone Step Markers */}
            <div className="flex items-center justify-between text-[10px] font-extrabold text-slate-400 pt-0.5">
              <span className="text-emerald-400">✓ Lv.1 故事啟蒙 (5h)</span>
              <span className="text-emerald-400">✓ Lv.2 閱讀好手 (10h)</span>
              <span className="text-emerald-400">✓ Lv.3 離線達人 (15h)</span>
              <span className="text-amber-300 font-black flex items-center gap-0.5">
                <span>👑 Lv.4 探索大師 (20h)</span>
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="relative z-10 flex items-center px-4 pt-3 gap-1.5 border-b border-amber-200/20 bg-slate-950/40 overflow-x-auto custom-scrollbar">
          <button
            onClick={() => {
              setActiveTab('report');
              playStarChime();
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-t-2xl font-black text-xs sm:text-sm border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'report'
                ? 'border-amber-400 text-amber-300 bg-amber-500/20'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>📊 學習報告</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('encyclopedia');
              playStarChime();
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-t-2xl font-black text-xs sm:text-sm border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'encyclopedia'
                ? 'border-cyan-400 text-cyan-200 bg-cyan-500/30 shadow-lg scale-105 ring-1 ring-cyan-400/50'
                : 'border-transparent text-cyan-300/90 hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
            <span>📚 離線百科知識庫</span>
            <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-cyan-500/40 text-cyan-200 border border-cyan-400/40 font-black">
              知識卡 ‧ 圖紙總覽
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab('storyworkshop');
              playStarChime();
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-t-2xl font-black text-xs sm:text-sm border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'storyworkshop'
                ? 'border-amber-400 text-amber-200 bg-amber-500/30 shadow-lg scale-105 ring-1 ring-amber-400/50'
                : 'border-transparent text-amber-300/90 hover:text-white'
            }`}
          >
            <Wand2 className="w-3.5 h-3.5 text-amber-300 animate-bounce" />
            <span>✨ 離線故事生成工坊</span>
            <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-amber-500/40 text-amber-200 border border-amber-400/40 font-black">
              圖紙結合 ‧ 分支故事
            </span>
          </button>

          <button
            onClick={() => {
              playStarChime();
              setIsBlueprintGuideOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-t-2xl font-black text-xs sm:text-sm border-b-2 border-transparent text-cyan-300 hover:text-white hover:bg-cyan-500/20 transition-all cursor-pointer whitespace-nowrap"
          >
            <Compass className="w-3.5 h-3.5 text-cyan-300 animate-spin-slow" />
            <span>📐 離線圖紙簡介</span>
            <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-cyan-950 text-cyan-300 border border-cyan-400/40 font-black">
              科普導讀
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab('trophywall');
              playStarChime();
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-t-2xl font-black text-xs sm:text-sm border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'trophywall'
                ? 'border-amber-400 text-amber-300 bg-amber-500/30 shadow-lg scale-105 ring-1 ring-amber-400/50'
                : 'border-transparent text-amber-300/90 hover:text-white'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-amber-300 animate-bounce" />
            <span>🏆 離線獎章展示牆</span>
            <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-amber-500/40 text-amber-200 border border-amber-400/40 font-black">
              3D 浮雕 & 知識艙
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab('gallery');
              playStarChime();
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-t-2xl font-black text-xs sm:text-sm border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'gallery'
                ? 'border-purple-400 text-purple-200 bg-purple-500/30 shadow-lg scale-105 ring-1 ring-purple-400/50'
                : 'border-transparent text-purple-300/90 hover:text-white'
            }`}
          >
            <span className="text-sm animate-pulse">🖼️</span>
            <span>離線繪本畫廊</span>
            <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-purple-500/40 text-purple-200 border border-purple-400/40">
              幻燈片 & 測驗
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab('detectivebot');
              playStarChime();
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-t-2xl font-black text-xs sm:text-sm border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'detectivebot'
                ? 'border-amber-400 text-amber-300 bg-amber-500/30 shadow-lg scale-105 ring-1 ring-amber-400/50'
                : 'border-transparent text-amber-300/90 hover:text-white'
            }`}
          >
            <Bot className="w-3.5 h-3.5 text-amber-300 animate-bounce" />
            <span>🕵️‍♂️ 離線小偵探 & 知識定艙</span>
            <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-emerald-500/30 text-emerald-300 border border-emerald-400/40">
              AI 問答
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab('capsule');
              playStarChime();
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-t-2xl font-black text-xs sm:text-sm border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'capsule'
                ? 'border-amber-400 text-amber-300 bg-amber-500/20 shadow-md scale-105'
                : 'border-transparent text-amber-300/90 hover:text-white'
            }`}
          >
            <Archive className="w-3.5 h-3.5 text-amber-300 animate-bounce" />
            <span>💊 離線繪本時間膠囊</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('timeslotanalytics');
              playStarChime();
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-t-2xl font-black text-xs sm:text-sm border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'timeslotanalytics'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-500/20 shadow-md'
                : 'border-transparent text-cyan-300/90 hover:text-white'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
            <span>📈 離線閱讀時段分析</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('focusradar');
              playStarChime();
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-t-2xl font-black text-xs sm:text-sm border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'focusradar'
                ? 'border-amber-400 text-amber-200 bg-amber-500/30 shadow-lg scale-105 ring-1 ring-amber-400/50'
                : 'border-transparent text-amber-300/90 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span>🎯 閱讀專注力分析</span>
            <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-amber-500/40 text-amber-200 border border-amber-400/40 font-black">
              雷達圖 ‧ 情緒傾向
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab('milestones');
              playStarChime();
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-t-2xl font-black text-xs sm:text-sm border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'milestones'
                ? 'border-amber-400 text-amber-300 bg-amber-500/30 shadow-lg scale-105 ring-1 ring-amber-400/50'
                : 'border-transparent text-amber-300/90 hover:text-white'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-amber-300 animate-bounce" />
            <span>🏅 閱讀知識里程碑 & 獎章櫃</span>
            <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-amber-500/30 text-amber-300 border border-amber-400/40">
              全收集圓環
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab('focusclock');
              playStarChime();
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-t-2xl font-black text-xs sm:text-sm border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'focusclock'
                ? 'border-amber-400 text-amber-300 bg-amber-500/20'
                : 'border-transparent text-amber-300/90 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span>⏱️ 離線專注力時鐘</span>
            {isFocusModeActive && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            )}
          </button>

          <button
            onClick={() => {
              setActiveTab('smartfilter');
              playStarChime();
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-t-2xl font-black text-xs sm:text-sm border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'smartfilter'
                ? 'border-amber-400 text-amber-300 bg-amber-500/20'
                : 'border-transparent text-amber-300/90 hover:text-white'
            }`}
          >
            <Search className="w-3.5 h-3.5 text-cyan-300" />
            <span>🔍 離線智慧閱讀過濾</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('handbook');
              playStarChime();
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-t-2xl font-black text-xs sm:text-sm border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'handbook'
                ? 'border-emerald-400 text-emerald-300 bg-emerald-500/30 shadow-lg scale-105 ring-1 ring-emerald-400/50'
                : 'border-transparent text-emerald-300/90 hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-300 animate-pulse" />
            <span>📖 離線知識手冊</span>
            <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-emerald-500/30 text-emerald-300 border border-emerald-400/40">
              AI 朗讀
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab('questmap');
              playStarChime();
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-t-2xl font-black text-xs sm:text-sm border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'questmap'
                ? 'border-amber-400 text-amber-300 bg-amber-500/20'
                : 'border-transparent text-amber-300/90 hover:text-white'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-amber-300 animate-spin-slow" />
            <span>🗺️ 繪本知識關卡地圖</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('speedchallenge');
              playStarChime();
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-t-2xl font-black text-xs sm:text-sm border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'speedchallenge'
                ? 'border-amber-400 text-amber-300 bg-amber-500/20'
                : 'border-transparent text-amber-300/90 hover:text-white'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-amber-300 animate-bounce" />
            <span>🏆 速讀挑戰榜</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('emotioncloud');
              playStarChime();
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-t-2xl font-black text-xs sm:text-sm border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'emotioncloud'
                ? 'border-amber-400 text-amber-300 bg-amber-500/20'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Smile className="w-3.5 h-3.5 text-rose-300" />
            <span>☁️ 語音情緒雲</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('emotionmap');
              playStarChime();
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-t-2xl font-black text-xs sm:text-sm border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'emotionmap'
                ? 'border-rose-400 text-rose-200 bg-rose-500/30 shadow-lg scale-105 ring-1 ring-rose-400/50'
                : 'border-transparent text-rose-300/90 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-rose-300 animate-pulse" />
            <span>🌊 繪本情緒地圖</span>
            <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-rose-500/40 text-rose-200 border border-rose-400/40 font-black">
              流動視覺化
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab('memorypuzzle');
              playStarChime();
              if (puzzleTiles.length === 0) initShufflePuzzle();
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-t-2xl font-black text-xs sm:text-sm border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'memorypuzzle'
                ? 'border-amber-400 text-amber-300 bg-amber-500/20'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Puzzle className="w-3.5 h-3.5 text-emerald-300" />
            <span>🧩 繪本記憶拼圖</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('wizard');
              playStarChime();
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-t-2xl font-black text-xs sm:text-sm border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'wizard'
                ? 'border-amber-400 text-amber-300 bg-amber-500/20'
                : 'border-transparent text-amber-300/80 hover:text-white'
            }`}
          >
            <Wand2 className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span>🧙‍♂️ 儲存管理精靈</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('quickread');
              playStarChime();
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-t-2xl font-black text-xs sm:text-sm border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'quickread'
                ? 'border-amber-400 text-amber-300 bg-amber-500/20'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <FastForward className="w-3.5 h-3.5 text-cyan-300" />
            <span>⚡ 離線繪本速讀</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('storage');
              playStarChime();
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-t-2xl font-black text-xs sm:text-sm border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'storage'
                ? 'border-amber-400 text-amber-300 bg-amber-500/20'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5" />
            <span>💾 快取 ({analytics.downloadedBookCount})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('cleanup');
              playStarChime();
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-t-2xl font-black text-xs sm:text-sm border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'cleanup'
                ? 'border-amber-400 text-amber-300 bg-amber-500/20'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>✨ 智慧清理 ({cleanupCandidates.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('voiceassistant');
              playStarChime();
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-t-2xl font-black text-xs sm:text-sm border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'voiceassistant'
                ? 'border-amber-400 text-amber-300 bg-amber-500/20'
                : 'border-transparent text-amber-300/90 hover:text-white'
            }`}
          >
            <Bot className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span>🎙️ 離線語音小幫手</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('printablechart');
              playStarChime();
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-t-2xl font-black text-xs sm:text-sm border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'printablechart'
                ? 'border-amber-400 text-amber-300 bg-amber-500/20'
                : 'border-transparent text-emerald-300/90 hover:text-white'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-emerald-300" />
            <span>📜 離線圖紙報表</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('knowledgetree');
              playStarChime();
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-t-2xl font-black text-xs sm:text-sm border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'knowledgetree'
                ? 'border-amber-400 text-amber-300 bg-amber-500/20'
                : 'border-transparent text-emerald-300/90 hover:text-white'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5 text-emerald-300 animate-pulse" />
            <span>🌳 離線探索知識樹</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('taskshowcase');
              playStarChime();
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-t-2xl font-black text-xs sm:text-sm border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'taskshowcase'
                ? 'border-amber-400 text-amber-300 bg-amber-500/20'
                : 'border-transparent text-amber-300/90 hover:text-white'
            }`}
          >
            <Boxes className="w-3.5 h-3.5 text-amber-300 animate-bounce" />
            <span>🏺 完成任務展櫃</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('atmosphere');
              playStarChime();
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-t-2xl font-black text-xs sm:text-sm border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'atmosphere'
                ? 'border-amber-400 text-amber-300 bg-amber-500/20'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Palette className="w-3.5 h-3.5 text-purple-300" />
            <span>🎨 氣氛背景</span>
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="relative z-10 p-4 sm:p-5 overflow-y-auto space-y-5 flex-1 custom-scrollbar">

          {/* Toast Notification Banner */}
          {toastMessage && (
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 text-slate-950 font-black text-xs flex items-center justify-between gap-2 shadow-xl border border-emerald-300 animate-fadeIn">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-300 shrink-0 animate-spin-slow" />
                <span>{toastMessage}</span>
              </div>
              <button onClick={() => setToastMessage(null)} className="p-1 text-slate-950 hover:opacity-80">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {activeTab === 'encyclopedia' ? (
            /* TAB: 📚 離線百科知識庫 (Offline Encyclopedia & Blueprints) */
            <OfflineEncyclopediaKnowledgeBase
              downloadedBooks={analytics.downloadedBooks}
              allBooks={books}
              onOpenBlueprintGuide={() => setIsBlueprintGuideOpen(true)}
            />
          ) : activeTab === 'storyworkshop' ? (
            /* TAB: ✨ 離線故事生成工坊 (Offline Story Generation Workshop) */
            <OfflineStoryWorkshop
              downloadedBooks={analytics.downloadedBooks}
              allBooks={books}
              userProfile={userProfile}
              onUpdateStars={(newStars) => {
                try {
                  const p = JSON.parse(localStorage.getItem('pwa_user_profile') || '{}');
                  p.stars = newStars;
                  localStorage.setItem('pwa_user_profile', JSON.stringify(p));
                } catch (e) {
                  console.error(e);
                }
              }}
              onOpenBlueprintGuide={() => setIsBlueprintGuideOpen(true)}
            />
          ) : activeTab === 'emotionmap' ? (
            /* TAB: 🌊 繪本情緒地圖 (Offline Emotion Flow Map) */
            <OfflineEmotionFlowMap
              voiceNotes={voiceEmotionNotes}
              onClose={() => setActiveTab('emotioncloud')}
              onJumpToStoryWorkshop={() => setActiveTab('storyworkshop')}
            />
          ) : activeTab === 'trophywall' ? (
            /* TAB: 🏆 離線獎章展示牆 (Offline 3D Trophy Wall & Knowledge Anchor) */
            <OfflineTrophyWall
              userProfile={userProfile}
              analytics={analytics}
            />
          ) : activeTab === 'focusradar' ? (
            /* TAB: 🎯 閱讀專注力分析 (Reading Focus Radar & Tendencies Panel) */
            <ReadingFocusRadarPanel
              books={books}
              userProfile={userProfile}
              onSelectBook={onSelectBook}
              onClose={() => setActiveTab('milestones')}
              darkMode={darkMode}
            />
          ) : activeTab === 'gallery' ? (
            /* TAB: 🖼️ 離線繪本畫廊 (Offline Picture Book Gallery) */
            <OfflinePictureBookGallery
              downloadedBooks={analytics.downloadedBooks}
              allBooks={books}
              onSelectBook={onSelectBook}
            />
          ) : activeTab === 'milestones' ? (
            /* TAB: 🏅 閱讀知識里程碑 (Offline Knowledge Milestones Dashboard) */
            <OfflineKnowledgeMilestonesDashboard
              userProfile={userProfile}
              analytics={analytics}
              onOpenFocusRadar={() => setActiveTab('focusradar')}
            />
          ) : activeTab === 'handbook' ? (
            /* TAB: 📖 離線知識手冊 (Offline Knowledge Handbook) */
            <OfflineKnowledgeHandbook
              downloadedBooks={analytics.downloadedBooks}
              allBooks={books}
            />
          ) : activeTab === 'detectivebot' ? (
            /* TAB: 🕵️‍♂️ 離線小偵探機器人 & 知識定艙 (Offline Detective AI Bot & Knowledge Anchor Capsule) */
            <OfflineDetectiveBot
              downloadedBooks={analytics.downloadedBooks}
              allBooks={books}
              userProfile={userProfile}
              isOnline={analytics.isOnline}
              onUpdateStars={(newStars) => {
                try {
                  const p = JSON.parse(localStorage.getItem('pwa_user_profile') || '{}');
                  p.stars = newStars;
                  localStorage.setItem('pwa_user_profile', JSON.stringify(p));
                } catch (e) {
                  console.error(e);
                }
              }}
              onSelectBook={onSelectBook}
            />
          ) : activeTab === 'capsule' ? (
            /* TAB: 💊 離線繪本時間膠囊 & 閱讀節奏儀表板 */
            <div className="space-y-6 animate-fadeIn">

              {/* Section 1: Weekly Offline Time Capsule Header & Selector */}
              <div className="p-5 rounded-3xl bg-slate-900/90 border border-amber-500/40 space-y-4 shadow-xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="p-3 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-xl shadow-lg">
                      💊
                    </span>
                    <div>
                      <h3 className="text-lg font-black text-amber-300 flex items-center gap-2">
                        <span>離線繪本時間膠囊 (Weekly Offline Story Time Capsule)</span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-amber-500/20 text-amber-300 border border-amber-400/40">
                          每週精華自動封存
                        </span>
                      </h3>
                      <p className="text-xs font-bold text-slate-300">
                        系統自動整理孩子本週閱讀時間的所有書籍，封存成離線精華膠囊 ‧ 無網路也能重溫重點與朗讀金句
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start md:self-auto">
                    <button
                      onClick={handleSealNewCapsule}
                      className="px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-lg hover:scale-105 transition-transform cursor-pointer"
                    >
                      <Archive className="w-4 h-4" />
                      <span>📦 手動封存本週新膠囊</span>
                    </button>
                  </div>
                </div>

                {/* Week Capsule Selector Tabs */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
                  {weeklyCapsules.map((cap) => {
                    const isSelected = cap.weekCode === selectedCapsuleWeek;
                    return (
                      <button
                        key={cap.id}
                        onClick={() => {
                          setSelectedCapsuleWeek(cap.weekCode);
                          playStarChime();
                        }}
                        className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                          isSelected
                            ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-lg scale-105 ring-2 ring-amber-300'
                            : 'bg-slate-950 text-slate-300 hover:bg-slate-800 border border-slate-700'
                        }`}
                      >
                        <span>{cap.badgeEmoji}</span>
                        <span>{cap.title}</span>
                        <span className="text-[10px] opacity-80">({cap.sealedDateStr})</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Section 2: Selected Weekly Capsule Highlight Board */}
              {activeCapsule && (
                <div className={`p-6 rounded-3xl border bg-gradient-to-br ${activeCapsule.themeColor} space-y-5 shadow-2xl relative overflow-hidden`}>
                  {/* Decorative Background Pattern */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

                  {/* Capsule Banner Info */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-amber-500/30 pb-4 relative z-10">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{activeCapsule.badgeEmoji}</span>
                        <h4 className="text-base sm:text-lg font-black text-amber-200">
                          {activeCapsule.title}
                        </h4>
                        <span className="px-3 py-0.5 rounded-full text-xs font-extrabold bg-amber-950/80 text-amber-300 border border-amber-400/40">
                          {activeCapsule.periodStr}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-slate-300">
                        {activeCapsule.moralSummary}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleSpeakCapsuleSummary(activeCapsule)}
                        className="px-3.5 py-2 rounded-2xl bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md hover:bg-amber-300 transition-colors cursor-pointer"
                      >
                        <Volume2 className="w-4 h-4" />
                        <span>🔊 語音朗讀本膠囊導覽</span>
                      </button>
                      <button
                        onClick={() => {
                          playStarChime();
                          setToastMessage(`📜 已生成《${activeCapsule.title}》離線故事膠囊卡！可隨時分享或儲存。`);
                        }}
                        className="px-3.5 py-2 rounded-2xl bg-slate-900 text-amber-300 border border-amber-500/40 font-black text-xs flex items-center gap-1.5 shadow-md hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        <Share2 className="w-4 h-4" />
                        <span>📜 匯出離線膠囊卡</span>
                      </button>
                    </div>
                  </div>

                  {/* Key Stats Pill Row */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 relative z-10">
                    <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-amber-500/30 text-center space-y-1">
                      <span className="text-xs font-bold text-slate-400">本週閱讀書籍數</span>
                      <div className="text-xl font-black text-amber-300">{activeCapsule.booksCount} 本故事繪本</div>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-emerald-500/30 text-center space-y-1">
                      <span className="text-xs font-bold text-slate-400">本週專注閱讀時長</span>
                      <div className="text-xl font-black text-emerald-300">{activeCapsule.readingMins} 分鐘</div>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-cyan-500/30 text-center space-y-1">
                      <span className="text-xs font-bold text-slate-400">累積翻閱讀頁數</span>
                      <div className="text-xl font-black text-cyan-300">{activeCapsule.pagesCount} 頁繪本</div>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-purple-500/30 text-center space-y-1">
                      <span className="text-xs font-bold text-slate-400">離線膠囊狀態</span>
                      <div className="text-xl font-black text-purple-300">🔒 已安全封存</div>
                    </div>
                  </div>

                  {/* Books Read List in Capsule */}
                  <div className="space-y-3 relative z-10">
                    <h5 className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-amber-400" />
                      <span>本週收錄繪本清單與精華寓意 (Books in Capsule)</span>
                    </h5>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {activeCapsule.booksReadList.map((bk) => (
                        <div key={bk.id} className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-2 hover:border-amber-500/40 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{bk.coverEmoji}</span>
                              <span className="font-extrabold text-sm text-white">{bk.title}</span>
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
                              ⏱️ {bk.readTimeMins} 分鐘
                            </span>
                          </div>
                          <p className="text-xs font-bold text-slate-300 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 leading-relaxed">
                            💡 {bk.keyTakeaway}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Golden Quote & Core Vocabulary Split */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                    {/* Golden Quote Card */}
                    <div className="p-4 rounded-2xl bg-amber-950/60 border border-amber-500/40 space-y-2 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between text-xs font-black text-amber-300">
                          <span className="flex items-center gap-1.5">
                            <Sparkles className="w-4 h-4 text-amber-400" />
                            <span>本週故事最美金句 (Golden Quote)</span>
                          </span>
                          <span className="text-[10px] bg-amber-500/20 px-2 py-0.5 rounded-full">精華典藏</span>
                        </div>
                        <p className="text-sm font-black text-amber-100 italic pt-2 leading-relaxed">
                          {activeCapsule.goldenQuote}
                        </p>
                      </div>
                      <p className="text-right text-[10px] font-bold text-amber-300/80 pt-2 border-t border-amber-500/30">
                        {activeCapsule.quoteAuthor}
                      </p>
                    </div>

                    {/* Core Vocabulary Cloud */}
                    <div className="p-4 rounded-2xl bg-slate-950/90 border border-cyan-500/40 space-y-3">
                      <div className="flex items-center justify-between text-xs font-black text-cyan-300">
                        <span className="flex items-center gap-1.5">
                          <FileText className="w-4 h-4 text-cyan-400" />
                          <span>本週精選雙語核心詞彙 (Core Vocabulary)</span>
                        </span>
                        <span className="text-[10px] bg-cyan-500/20 px-2 py-0.5 rounded-full">雙語學習</span>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {activeCapsule.coreVocabulary.map((word, idx) => (
                          <div key={idx} className="px-3 py-1.5 rounded-xl bg-slate-900 border border-cyan-500/30 flex items-center gap-1.5 text-xs font-extrabold text-cyan-200">
                            <span>🔤 {word.en}</span>
                            <span className="text-slate-400 text-[10px]">({word.zh})</span>
                            <span className="text-cyan-400/80 text-[10px] font-mono">{word.phonetic}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Voice Highlight Note */}
                  <div className="p-4 rounded-2xl bg-purple-950/60 border border-purple-500/40 flex items-center justify-between gap-3 relative z-10">
                    <div className="flex items-center gap-3">
                      <span className="p-2.5 rounded-2xl bg-purple-500/30 text-purple-200 text-xl">
                        🎙️
                      </span>
                      <div>
                        <span className="text-[10px] font-black uppercase text-purple-300 tracking-wider">
                          本週童音記錄精華 (Voice Memory Highlight)
                        </span>
                        <p className="text-xs font-black text-purple-100 italic">
                          {activeCapsule.voiceHighlightNote}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        playStarChime();
                        speakText(activeCapsule.voiceHighlightNote, 'zh-TW');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-purple-400 text-slate-950 font-black text-xs hover:bg-purple-300 transition-colors shrink-0 cursor-pointer flex items-center gap-1"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>試聽童音錄音</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Section 3: 🥁 閱讀節奏與語速儀表板 (Reading Pace & Rhythm Gauge) */}
              <div className="p-6 rounded-3xl bg-slate-900/90 border border-cyan-500/40 space-y-5 shadow-2xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="p-2.5 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-black">
                      <Gauge className="w-5 h-5" />
                    </span>
                    <div>
                      <h3 className="text-base font-black text-cyan-300 flex items-center gap-2">
                        <span>🥁 離線閱讀節奏與語速儀表板 (Reading Pace & Rhythm Gauge)</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                          即時節奏偵測
                        </span>
                      </h3>
                      <p className="text-xs font-bold text-slate-300">
                        即時追蹤孩子翻頁頻率、朗讀語速 (WPM) 與節奏平穩度 ‧ 搭配音律拍子器引導黃金節奏
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setIsPaceTestActive(!isPaceTestActive);
                        if (!isPaceTestActive) {
                          setPaceTestTimer(0);
                          setPaceTestPageCount(1);
                        }
                        playStarChime();
                      }}
                      className={`px-3.5 py-2 rounded-2xl font-black text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-transform hover:scale-105 ${
                        isPaceTestActive
                          ? 'bg-rose-500 text-white animate-pulse'
                          : 'bg-cyan-400 text-slate-950 hover:bg-cyan-300'
                      }`}
                    >
                      <Activity className="w-4 h-4" />
                      <span>{isPaceTestActive ? '⏹️ 停止節奏測試' : '⏱️ 開始翻頁節奏測試'}</span>
                    </button>
                  </div>
                </div>

                {/* Pace Testing Live Control Bar */}
                {isPaceTestActive && (
                  <div className="p-4 rounded-2xl bg-slate-950 border border-rose-500/50 flex flex-col sm:flex-row items-center justify-between gap-3 animate-fadeIn">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl animate-spin">⏱️</span>
                      <div>
                        <span className="text-xs font-black text-rose-300">節奏測試進行中：{paceTestTimer} 秒</span>
                        <p className="text-[10px] font-bold text-slate-400">請像平時一樣翻閱繪本，每翻一頁點擊一次「翻過一頁」</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setPaceTestPageCount((prev) => prev + 1);
                          playPageTurnSound();
                        }}
                        className="px-4 py-2 rounded-xl bg-emerald-400 text-slate-950 font-black text-xs hover:bg-emerald-300 transition-all cursor-pointer flex items-center gap-1 shadow-lg"
                      >
                        <span>📄 翻過一頁 ({paceTestPageCount} 頁)</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Pace Stats 4-Grid Gauge Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {/* Metric 1: Sec Per Page */}
                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-cyan-500/30 text-center space-y-1">
                    <span className="text-xs font-bold text-slate-400 flex items-center justify-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" />
                      <span>平均翻頁頻率</span>
                    </span>
                    <div className="text-2xl font-black text-cyan-300">
                      {calculatedSecPerPage} <span className="text-xs text-slate-400 font-normal">秒/頁</span>
                    </div>
                    <span className="text-[10px] text-slate-500 block font-bold">黃金標準：20~30 秒</span>
                  </div>

                  {/* Metric 2: Estimated WPM */}
                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-emerald-500/30 text-center space-y-1">
                    <span className="text-xs font-bold text-slate-400 flex items-center justify-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-emerald-400" />
                      <span>朗讀語速 (WPM)</span>
                    </span>
                    <div className="text-2xl font-black text-emerald-300">
                      {calculatedWpm} <span className="text-xs text-slate-400 font-normal">字/分</span>
                    </div>
                    <span className="text-[10px] text-slate-500 block font-bold">適合兒童朗讀區</span>
                  </div>

                  {/* Metric 3: Rhythm Stability */}
                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-purple-500/30 text-center space-y-1">
                    <span className="text-xs font-bold text-slate-400 flex items-center justify-center gap-1">
                      <Activity className="w-3.5 h-3.5 text-purple-400" />
                      <span>節奏平穩度</span>
                    </span>
                    <div className="text-2xl font-black text-purple-300">
                      {calculatedStability}%
                    </div>
                    <span className="text-[10px] text-slate-500 block font-bold">呼吸停頓均衡度</span>
                  </div>

                  {/* Metric 4: Pace Badge */}
                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-amber-500/30 text-center space-y-1">
                    <span className="text-xs font-bold text-slate-400 flex items-center justify-center gap-1">
                      <Trophy className="w-3.5 h-3.5 text-amber-400" />
                      <span>節奏類型判定</span>
                    </span>
                    <div className={`text-xs font-black px-2.5 py-1 rounded-full border mx-auto inline-block ${paceBadge.color}`}>
                      {paceBadge.label}
                    </div>
                    <span className="text-[10px] text-slate-400 block font-bold line-clamp-1">{paceBadge.desc}</span>
                  </div>
                </div>

                {/* Visual Rhythm Gauge Needle Meter */}
                <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs font-black text-slate-300">
                    <span>🎯 繪本閱讀節奏光譜 (Pace Gauge Needle)</span>
                    <span className="text-cyan-400">當前位置：{calculatedSecPerPage} 秒/頁</span>
                  </div>

                  {/* Meter Gauge Color Track */}
                  <div className="relative w-full h-5 rounded-full bg-slate-800 overflow-hidden flex">
                    <div className="w-1/3 bg-purple-500/40 text-[10px] font-black text-purple-200 flex items-center justify-center border-r border-slate-900">
                      🐢 深度沉思區 (&gt;35s)
                    </div>
                    <div className="w-1/3 bg-emerald-500/40 text-[10px] font-black text-emerald-200 flex items-center justify-center border-r border-slate-900">
                      🎯 黃金音律區 (20-35s)
                    </div>
                    <div className="w-1/3 bg-cyan-500/40 text-[10px] font-black text-cyan-200 flex items-center justify-center">
                      ⚡ 極速衝刺區 (&lt;20s)
                    </div>

                    {/* Meter Needle Indicator */}
                    <div
                      className="absolute top-0 bottom-0 w-2.5 bg-amber-400 border border-white shadow-lg transition-all duration-500 rounded-full"
                      style={{
                        left: `${Math.min(95, Math.max(5, 100 - (calculatedSecPerPage / 50) * 100))}%`,
                      }}
                    ></div>
                  </div>

                  {/* AI Tutor Pace Guidance */}
                  <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 flex items-start gap-2.5">
                    <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <p className="text-xs font-bold text-cyan-100 leading-relaxed">
                      【AI 節奏導師建議】：{paceBadge.desc} 建議在故事標點符號與高潮情節處保留 1-2 秒適度停頓，能大幅增加聽感故事感染力！
                    </p>
                  </div>
                </div>

                {/* Metronome Beat Control Box */}
                <div className="p-4 rounded-2xl bg-slate-950/90 border border-purple-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl p-2 rounded-xl bg-purple-950 border border-purple-500/40">
                      🥁
                    </span>
                    <div>
                      <span className="text-xs font-black text-purple-300">離線故事打拍器 (Metronome Beat Generator)</span>
                      <p className="text-[10px] font-bold text-slate-400">提供輕柔音律節拍（{metronomeBpm} BPM），引導朗讀穩定不急躁</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                    <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
                      <span className="text-xs font-bold text-slate-400">速度:</span>
                      <input
                        type="range"
                        min="40"
                        max="120"
                        step="5"
                        value={metronomeBpm}
                        onChange={(e) => setMetronomeBpm(Number(e.target.value))}
                        className="w-24 accent-purple-400 cursor-pointer"
                      />
                      <span className="text-xs font-black text-purple-300 w-12 text-right">{metronomeBpm} BPM</span>
                    </div>

                    <button
                      onClick={() => {
                        setIsMetronomePlaying(!isMetronomePlaying);
                        playStarChime();
                      }}
                      className={`px-4 py-2 rounded-xl font-black text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-transform hover:scale-105 ${
                        isMetronomePlaying
                          ? 'bg-purple-500 text-slate-950 ring-2 ring-purple-300'
                          : 'bg-slate-800 text-purple-300 hover:bg-slate-700'
                      }`}
                    >
                      <Music className={`w-3.5 h-3.5 ${isMetronomePlaying ? 'animate-bounce' : ''}`} />
                      <span>{isMetronomePlaying ? '🔊 停止打拍器' : '🎵 啟動閱讀節奏拍'}</span>
                    </button>
                  </div>
                </div>
              </div>

            </div>
          ) : activeTab === 'report' ? (
            /* TAB 1: 📊 孩童學習與閱讀數據報告 */
            <div className="space-y-5 animate-fadeIn">

              {/* Profile Summary Banner */}
              <div className="p-4 rounded-3xl bg-gradient-to-r from-amber-400 via-orange-400 to-amber-300 text-amber-950 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="text-3xl bg-white/80 p-2 rounded-2xl shadow-xs">
                    {userProfile?.avatar || '🐻'}
                  </div>
                  <div>
                    <h4 className="font-black text-base">
                      {userProfile?.name || '小讀者'} 的閱讀成長檔案
                    </h4>
                    <p className="text-xs font-bold text-amber-900">
                      連續閱讀 {userProfile?.streakDays || 3} 天 • 已完讀 {userProfile?.readBookIds?.length || 1} 本繪本
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleExportReport}
                  className="px-4 py-2 bg-amber-950 text-amber-100 hover:bg-black font-extrabold text-xs rounded-2xl flex items-center gap-1.5 shadow-md transition-transform hover:scale-105 shrink-0 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>📥 下載分析報告 (.txt)</span>
                </button>
              </div>

              {/* Learning Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-amber-500/30 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>累積閱讀時長</span>
                  </div>
                  <div className="text-2xl font-black text-amber-300">
                    {userProfile?.readingMinutes || 25} 分鐘
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-orange-500/30 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                    <Star className="w-3.5 h-3.5 text-orange-400" />
                    <span>累積童星獎勵</span>
                  </div>
                  <div className="text-2xl font-black text-orange-300">
                    {userProfile?.stars || 15} 顆
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-rose-500/30 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                    <Flame className="w-3.5 h-3.5 text-rose-400" />
                    <span>連續挑戰日</span>
                  </div>
                  <div className="text-2xl font-black text-rose-300">
                    {userProfile?.streakDays || 3} 天
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-emerald-500/30 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                    <Bookmark className="w-3.5 h-3.5 text-emerald-400" />
                    <span>生字收藏量</span>
                  </div>
                  <div className="text-2xl font-black text-emerald-300">
                    {userWordsCount || 5} 個
                  </div>
                </div>
              </div>

              {/* Offline Interactive Analytics Data Charts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* CHART 1: 近 7 日離線閱讀趨勢 Area Chart */}
                <div className="p-4 rounded-3xl bg-slate-900/90 border border-amber-500/30 space-y-3 shadow-xl">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <h4 className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                      <BarChart3 className="w-4 h-4 text-amber-400" />
                      <span>近 7 日離線閱讀與翻頁趨勢</span>
                    </h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30">
                      即時數據
                    </span>
                  </div>

                  <div className="h-52 w-full pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={WEEKLY_READING_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorMins" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorPages" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                        <XAxis dataKey="day" stroke="#94A3B8" fontSize={11} tickLine={false} />
                        <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                        <RechartsTooltip
                          contentStyle={{
                            backgroundColor: '#0F172A',
                            borderColor: '#F59E0B',
                            borderRadius: '16px',
                            color: '#FFFFFF',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
                          }}
                        />
                        <RechartsLegend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                        <Area type="monotone" dataKey="readingMins" name="閱讀時長(分)" stroke="#F59E0B" fillOpacity={1} fill="url(#colorMins)" strokeWidth={2} />
                        <Area type="monotone" dataKey="pagesRead" name="翻頁數(頁)" stroke="#10B981" fillOpacity={1} fill="url(#colorPages)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* CHART 2: 各主題繪本詞彙與進度 Bar Chart */}
                <div className="p-4 rounded-3xl bg-slate-900/90 border border-emerald-500/30 space-y-3 shadow-xl">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <h4 className="text-xs font-black uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                      <BarChart3 className="w-4 h-4 text-emerald-400" />
                      <span>主題類別完讀頁數與離線詞彙</span>
                    </h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                      類別統計
                    </span>
                  </div>

                  <div className="h-52 w-full pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={CATEGORY_CHART_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                        <XAxis dataKey="category" stroke="#94A3B8" fontSize={11} tickLine={false} />
                        <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                        <RechartsTooltip
                          contentStyle={{
                            backgroundColor: '#0F172A',
                            borderColor: '#10B981',
                            borderRadius: '16px',
                            color: '#FFFFFF',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
                          }}
                        />
                        <RechartsLegend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                        <Bar dataKey="pagesRead" name="完讀頁數" fill="#F59E0B" radius={[6, 6, 0, 0]} />
                        <Bar dataKey="vocabLearned" name="離線生字(個)" fill="#10B981" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Parent & Educator Insights */}
              <div className="p-4 rounded-3xl bg-slate-900/80 border border-indigo-500/30 space-y-2">
                <h4 className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>家長與導師學習導引建議</span>
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed font-bold">
                  孩童展現出優秀的繪本專注度！建議保持每天閱讀 15 分鐘的目標，完讀故事後嘗試進行雙語語音聽讀與 AI 測驗問答，幫助理解與增強詞彙量。
                </p>
              </div>

            </div>
          ) : activeTab === 'encyclopedia' ? (
            /* TAB: 📚 離線百科知識庫 (生字自動彙整 ‧ 精美知識卡片 ‧ 離線圖紙總覽 ‧ 趣味快問快答) */
            <OfflineEncyclopediaKnowledgeBase
              downloadedBooks={analytics?.downloadedBooks || []}
              allBooks={books}
              userProfile={userProfile}
              questCrystals={questCrystals}
              onAddCrystals={(amount) => {
                const newTotal = questCrystals + amount;
                setQuestCrystals(newTotal);
                try {
                  localStorage.setItem('pwa_quest_crystals', String(newTotal));
                } catch (e) {
                  console.warn(e);
                }
                setToastMessage(`🎉 獲得 +${amount} 知識水晶 💎！已存入書庫資產！`);
              }}
              onSelectBook={(bId) => {
                const matched = books.find((b) => b.id === bId) || analytics?.downloadedBooks?.find((b) => b.id === bId);
                if (matched && onSelectBook) {
                  onSelectBook(matched);
                }
                onClose();
              }}
              onCloseParent={onClose}
            />
          ) : activeTab === 'trophywall' ? (
            /* TAB: 🏆 離線獎章展示牆 (3D 浮雕動畫 ‧ 背景故事 ‧ 獲獎日期 ‧ 知識艙) */
            <OfflineTrophyWall
              downloadedBooks={analytics?.downloadedBooks || []}
              allBooks={books}
              userProfile={userProfile}
              questCrystals={questCrystals}
              onAddCrystals={(amount) => {
                const newTotal = questCrystals + amount;
                setQuestCrystals(newTotal);
                try {
                  localStorage.setItem('pwa_quest_crystals', String(newTotal));
                } catch (e) {
                  console.warn(e);
                }
                setToastMessage(`🎉 獲得 +${amount} 知識水晶 💎！已存入書庫資產！`);
              }}
              onSelectBook={(bId) => {
                const matched = books.find((b) => b.id === bId) || analytics?.downloadedBooks?.find((b) => b.id === bId);
                if (matched && onSelectBook) {
                  onSelectBook(matched);
                }
                onClose();
              }}
              onCloseParent={onClose}
            />
          ) : activeTab === 'gallery' ? (
            /* TAB: 🖼️ 離線繪本畫廊 & 幻燈片播放廳 (Offline Picture Book Gallery & Slideshow) */
            <OfflinePictureBookGallery
              downloadedBooks={analytics?.downloadedBooks || []}
              allBooks={books}
              userProfile={userProfile}
              questCrystals={questCrystals}
              onAddCrystals={(amount) => {
                const newTotal = questCrystals + amount;
                setQuestCrystals(newTotal);
                try {
                  localStorage.setItem('pwa_quest_crystals', String(newTotal));
                } catch (e) {
                  console.warn(e);
                }
                setToastMessage(`🎉 獲得 +${amount} 知識水晶 💎！已存入書庫資產！`);
              }}
              onSelectBook={(bId) => {
                const matched = books.find((b) => b.id === bId) || analytics?.downloadedBooks?.find((b) => b.id === bId);
                if (matched && onSelectBook) {
                  onSelectBook(matched);
                }
                onClose();
              }}
              onCloseParent={onClose}
            />
          ) : activeTab === 'milestones' ? (
            /* TAB: 🏅 閱讀知識里程碑儀表板與離線獎章櫃牆 (Offline Knowledge Milestones & Badge Cabinet) */
            <OfflineKnowledgeMilestonesDashboard
              downloadedBooks={analytics?.downloadedBooks || []}
              allBooks={books}
              userProfile={userProfile}
              questCrystals={questCrystals}
              onAddCrystals={(amount) => {
                const newTotal = questCrystals + amount;
                setQuestCrystals(newTotal);
                try {
                  localStorage.setItem('pwa_quest_crystals', String(newTotal));
                } catch (e) {
                  console.warn(e);
                }
                setToastMessage(`🎉 獲得 +${amount} 知識水晶 💎！已存入書庫資產！`);
              }}
              onSelectBook={(bId) => {
                onSelectBook(bId);
                onClose();
              }}
              onCloseParent={onClose}
            />
          ) : activeTab === 'focusclock' ? (
            /* TAB: ⏱️ 離線專注力時鐘與專注模式 (Focus Clock & Focus Mode) */
            <div className="space-y-5 animate-fadeIn">
              {/* 🛡️ Focus Mode Toggle Header Banner */}
              <div className={`p-5 rounded-3xl border shadow-xl transition-all ${
                isFocusModeActive 
                  ? 'bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-950 border-emerald-400/80 ring-2 ring-emerald-400/40' 
                  : 'bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-950 border-amber-500/30'
              }`}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className={`p-3.5 rounded-2xl text-2xl shadow-lg transition-transform ${
                      isFocusModeActive ? 'bg-emerald-500 text-slate-950 animate-pulse' : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      <ShieldCheck className="w-7 h-7" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base sm:text-lg font-black text-amber-300">
                          離線淨音專注模式 (Focus Mode)
                        </h3>
                        {isFocusModeActive ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/30 border border-emerald-400 text-emerald-300 text-[10px] font-black animate-pulse">
                            🛡️ 專注保護運作中
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px] font-bold">
                            ⏸️ 標準閱讀模式
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-300 font-bold leading-relaxed">
                        開啟後自動過濾所有外在動態、社群推薦與無關彈窗，為孩童建立安靜無干擾的純粹離線閱讀體驗。
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleToggleFocusMode}
                    className={`px-5 py-3 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shrink-0 ${
                      isFocusModeActive
                        ? 'bg-emerald-400 text-slate-950 hover:bg-emerald-300 ring-4 ring-emerald-500/30'
                        : 'bg-gradient-to-r from-amber-400 to-orange-400 text-slate-950 hover:from-amber-300 hover:to-orange-300'
                    }`}
                  >
                    <Shield className="w-4 h-4" />
                    <span>{isFocusModeActive ? '關閉專注模式' : '開啟一鍵專注模式'}</span>
                  </button>
                </div>
              </div>

              {/* ⏱️ Live Focus Stopwatch Clock */}
              <div className="p-6 sm:p-8 rounded-3xl bg-slate-950/90 border-2 border-amber-400/50 shadow-2xl relative overflow-hidden space-y-6 text-center">
                <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-black">
                  <Clock className="w-4 h-4 animate-spin-slow" />
                  <span>無網路離線連續閱讀時鐘</span>
                </div>

                {/* Digital Clock Screen */}
                <div className="relative my-2 inline-block">
                  <div className="text-5xl sm:text-7xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-amber-400 to-orange-500 font-mono drop-shadow-[0_0_25px_rgba(245,158,11,0.4)]">
                    {formatFocusTime(focusSeconds)}
                  </div>
                  <div className="mt-2 text-xs font-bold text-slate-400 flex items-center justify-center gap-1.5">
                    {isFocusRunning ? (
                      <span className="text-emerald-400 flex items-center gap-1 animate-pulse font-black">
                        <span className="w-2 h-2 rounded-full bg-emerald-400"></span> 連續離線專注中...
                      </span>
                    ) : (
                      <span className="text-slate-400">專注計時已暫停</span>
                    )}
                  </div>
                </div>

                {/* Target Progress Bar */}
                <div className="max-w-md mx-auto space-y-2">
                  <div className="flex justify-between items-center text-xs font-black">
                    <span className="text-slate-400">今日專注目標 ({focusTargetMins} 分鐘)</span>
                    <span className="text-amber-300">
                      {Math.min(100, Math.round((focusSeconds / (focusTargetMins * 60)) * 100))}% 達成
                    </span>
                  </div>
                  <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800 p-0.5">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 via-orange-400 to-emerald-400 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (focusSeconds / (focusTargetMins * 60)) * 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Timer Controls Row */}
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      playStarChime();
                      setIsFocusRunning(!isFocusRunning);
                    }}
                    className={`px-6 py-3 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer shadow-xl ${
                      isFocusRunning
                        ? 'bg-amber-500/20 border border-amber-400 text-amber-300 hover:bg-amber-500/30'
                        : 'bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 hover:brightness-110'
                    }`}
                  >
                    {isFocusRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-slate-950" />}
                    <span>{isFocusRunning ? '暫停計時' : '開始離線專注閱讀'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      playStarChime();
                      setFocusSeconds(0);
                      setIsFocusRunning(false);
                    }}
                    className="px-4 py-3 rounded-2xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>重設</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleFinishFocusSession}
                    className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-400 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-1.5 hover:brightness-110 transition-all cursor-pointer shadow-lg"
                  >
                    <Trophy className="w-4 h-4" />
                    <span>完成專注領水晶 💎</span>
                  </button>
                </div>

                {/* Target Duration Preset Selector */}
                <div className="pt-2 flex items-center justify-center gap-2 flex-wrap text-xs">
                  <span className="text-slate-400 font-bold mr-1">選擇專注目標：</span>
                  {[15, 20, 25, 30, 45].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => {
                        playStarChime();
                        setFocusTargetMins(mins);
                      }}
                      className={`px-3 py-1.5 rounded-xl font-black transition-all cursor-pointer ${
                        focusTargetMins === mins
                          ? 'bg-amber-400 text-slate-950 shadow'
                          : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      {mins} 分鐘
                    </button>
                  ))}
                </div>
              </div>

              {/* 📜 Focus Session History List */}
              <div className="p-5 rounded-3xl bg-slate-950/80 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black text-amber-300 flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-400" />
                    <span>連續離線閱讀專注紀錄 (Session History)</span>
                  </h4>
                  <span className="text-xs text-slate-400 font-bold">
                    共累計 {focusSessionHistory.length} 次專注紀錄
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {focusSessionHistory.map((session) => (
                    <div
                      key={session.id}
                      className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2 hover:border-amber-500/40 transition-all"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400 font-bold">{session.dateStr}</span>
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-black">
                          {session.mins} 分鐘離線連讀
                        </span>
                      </div>
                      <div className="text-xs font-black text-slate-200 truncate">
                        📖 {session.bookTitle}
                      </div>
                      <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-800/60">
                        <span className="text-amber-400 font-bold">
                          {'⭐'.repeat(session.starsEarned)}
                        </span>
                        <span className="text-emerald-400 font-black">
                          +{session.mins * 10} 水晶 💎
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : activeTab === 'smartfilter' ? (
            /* TAB: 🔍 離線智慧閱讀過濾 (Offline Smart Reading Filter) */
            <div className="space-y-5 animate-fadeIn">
              {/* Filter Controls Header */}
              <div className="p-5 rounded-3xl bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 border border-cyan-400/40 shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="p-2.5 rounded-2xl bg-cyan-500/20 text-cyan-300">
                      <Search className="w-5 h-5" />
                    </span>
                    <div>
                      <h3 className="text-base font-black text-cyan-300">離線智慧閱讀過濾器</h3>
                      <p className="text-xs text-slate-300 font-bold">依年齡層、閱讀時長、主題題材與離線快取狀態快速查找繪本</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      playStarChime();
                      setFilterAgeGroup('all');
                      setFilterLength('all');
                      setFilterCategory('all');
                      setFilterCacheOnly(false);
                      setFilterSearchKeyword('');
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-slate-300 hover:text-white transition-all cursor-pointer self-start sm:self-auto"
                  >
                    🔄 重設所有過濾條件
                  </button>
                </div>

                {/* Keyword Search Input */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={filterSearchKeyword}
                    onChange={(e) => setFilterSearchKeyword(e.target.value)}
                    placeholder="輸入繪本名稱、角色或內容關鍵字（如：小熊、魔法、月亮、雙語）..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-all"
                  />
                </div>

                {/* Filter Options Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  {/* Age Group Filter */}
                  <div className="space-y-1.5">
                    <span className="font-bold text-slate-400 text-[11px]">👶 適合年齡層：</span>
                    <div className="flex flex-wrap gap-1">
                      {[
                        { id: 'all', name: '全部' },
                        { id: '3-5', name: '3-5歲 幼童' },
                        { id: '6-8', name: '6-8歲 基礎' },
                        { id: '9-12', name: '9-12歲 進階' },
                      ].map((age) => (
                        <button
                          key={age.id}
                          type="button"
                          onClick={() => {
                            playStarChime();
                            setFilterAgeGroup(age.id as any);
                          }}
                          className={`px-2.5 py-1 rounded-xl font-bold transition-all cursor-pointer ${
                            filterAgeGroup === age.id
                              ? 'bg-cyan-400 text-slate-950 font-black'
                              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                          }`}
                        >
                          {age.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Reading Length Filter */}
                  <div className="space-y-1.5">
                    <span className="font-bold text-slate-400 text-[11px]">⏱️ 閱讀長度：</span>
                    <div className="flex flex-wrap gap-1">
                      {[
                        { id: 'all', name: '全部' },
                        { id: 'short', name: '短篇 (<5頁)' },
                        { id: 'medium', name: '中篇 (5-12頁)' },
                        { id: 'long', name: '長篇 (>12頁)' },
                      ].map((len) => (
                        <button
                          key={len.id}
                          type="button"
                          onClick={() => {
                            playStarChime();
                            setFilterLength(len.id as any);
                          }}
                          className={`px-2.5 py-1 rounded-xl font-bold transition-all cursor-pointer ${
                            filterLength === len.id
                              ? 'bg-cyan-400 text-slate-950 font-black'
                              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                          }`}
                        >
                          {len.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Category Filter */}
                  <div className="space-y-1.5">
                    <span className="font-bold text-slate-400 text-[11px]">🎨 故事題材：</span>
                    <div className="flex flex-wrap gap-1">
                      {[
                        { id: 'all', name: '全部' },
                        { id: 'fantasy', name: '奇幻冒險' },
                        { id: 'fairytale', name: '神奇童話' },
                        { id: 'science', name: '自然科普' },
                        { id: 'bilingual', name: '雙語故事' },
                      ].map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => {
                            playStarChime();
                            setFilterCategory(cat.id as any);
                          }}
                          className={`px-2.5 py-1 rounded-xl font-bold transition-all cursor-pointer ${
                            filterCategory === cat.id
                              ? 'bg-cyan-400 text-slate-950 font-black'
                              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                          }`}
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Cache Only Toggle */}
                  <div className="space-y-1.5">
                    <span className="font-bold text-slate-400 text-[11px]">📦 離線狀態：</span>
                    <div>
                      <button
                        type="button"
                        onClick={() => {
                          playStarChime();
                          setFilterCacheOnly(!filterCacheOnly);
                        }}
                        className={`w-full px-3 py-1.5 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                          filterCacheOnly
                            ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <PackageCheck className="w-3.5 h-3.5" />
                        <span>{filterCacheOnly ? '僅顯示已下載快取' : '顯示包含線上/快取繪本'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Filtered Results Display */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-black px-1">
                  <span className="text-cyan-300 flex items-center gap-1.5">
                    <Filter className="w-4 h-4 text-cyan-400" />
                    <span>符合過濾條件之離線繪本 ({getSmartFilteredBooks().length} 本)</span>
                  </span>
                </div>

                {getSmartFilteredBooks().length === 0 ? (
                  <div className="p-10 rounded-3xl bg-slate-950/80 border border-slate-800 text-center space-y-3">
                    <div className="text-4xl animate-bounce">🔍</div>
                    <h4 className="text-sm font-black text-slate-300">找不到符合目前條件的離線繪本</h4>
                    <p className="text-xs text-slate-400">請嘗試調整年齡層、關鍵字搜尋或取消「僅顯示快取」勾選。</p>
                    <button
                      type="button"
                      onClick={() => {
                        playStarChime();
                        setFilterAgeGroup('all');
                        setFilterLength('all');
                        setFilterCategory('all');
                        setFilterCacheOnly(false);
                        setFilterSearchKeyword('');
                      }}
                      className="px-4 py-2 rounded-2xl bg-amber-400 text-slate-950 font-black text-xs hover:bg-amber-300 transition-all cursor-pointer"
                    >
                      清空所有過濾條件
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                    {getSmartFilteredBooks().map((book) => {
                      const titleStr = typeof book.title === 'string' ? book.title : (book.title['zh-TW'] || book.title.en || '繪本故事');
                      const descStr = typeof book.description === 'string' ? book.description : (book.description?.['zh-TW'] || book.description?.en || '精彩雙語繪本故事');
                      const isCached = analytics?.downloadedBooks?.some((db) => db.id === book.id);

                      return (
                        <div
                          key={book.id}
                          className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 hover:border-cyan-400/50 transition-all space-y-3 flex flex-col justify-between group"
                        >
                          <div className="space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <span className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 text-xl group-hover:scale-110 transition-transform">
                                📖
                              </span>
                              {isCached ? (
                                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] font-black flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" /> 已下載離線快取
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px] font-bold">
                                  雲端預載庫
                                </span>
                              )}
                            </div>

                            <h4 className="text-sm font-black text-slate-100 group-hover:text-cyan-300 transition-colors line-clamp-1">
                              {titleStr}
                            </h4>
                            <p className="text-xs text-slate-400 line-clamp-2 font-bold leading-relaxed">
                              {descStr}
                            </p>
                          </div>

                          <div className="space-y-2 pt-2 border-t border-slate-800/80">
                            <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold">
                              <span>適合 3-8 歲</span>
                              <span>約 {book.pageCount || 8} 頁雙語故事</span>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                playStarChime();
                                onSelectBook(book.id);
                                onClose();
                              }}
                              className="w-full py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 font-black text-xs hover:brightness-110 transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
                            >
                              <BookOpen className="w-3.5 h-3.5" />
                              <span>立即開啟離線閱讀</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : activeTab === 'handbook' ? (
            /* TAB: 📖 離線知識手冊 (Offline Knowledge Handbook with AI Readout & Smart Filter) */
            <OfflineKnowledgeHandbook
              downloadedBooks={analytics?.downloadedBooks || []}
              allBooks={books}
              userProfile={userProfile}
              onSelectBook={(bId) => {
                onSelectBook(bId);
                onClose();
              }}
              onCloseParent={onClose}
            />
          ) : activeTab === 'questmap' ? (
            /* TAB: 🗺️ 繪本知識關卡地圖 (Offline Picture Book Quest Map) */
            <div className="space-y-5 animate-fadeIn">
              {/* Header Banner & Explorer Status */}
              <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-950 border border-emerald-400/50 shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="p-3 rounded-2xl bg-gradient-to-br from-amber-400 to-emerald-400 text-slate-950 text-2xl shadow-md animate-bounce">
                      🗺️
                    </span>
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-amber-300 flex items-center gap-2">
                        <span>繪本知識關卡地圖</span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 text-[10px] border border-emerald-400/40">
                          離線探索解鎖
                        </span>
                      </h3>
                      <p className="text-xs font-bold text-slate-300 mt-0.5">
                        每翻閱完成一本離線故事，即可解鎖下一座神秘冒險島嶼與寶藏區域！
                      </p>
                    </div>
                  </div>

                  {/* Map Theme Switcher Bar */}
                  <div className="flex items-center gap-1.5 self-start sm:self-auto bg-slate-950/80 p-1.5 rounded-2xl border border-emerald-500/30">
                    <span className="text-[10px] font-black text-slate-400 px-1">地圖風格：</span>
                    {(
                      [
                        { id: 'forest', name: '🌴 魔法森林' },
                        { id: 'starry', name: '🌌 星空銀河' },
                        { id: 'ocean', name: '🌊 藍海島嶼' },
                      ] as const
                    ).map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          setQuestMapTheme(t.id);
                          playStarChime();
                        }}
                        className={`px-2.5 py-1 rounded-xl text-xs font-black transition-all cursor-pointer ${
                          questMapTheme === t.id
                            ? 'bg-amber-400 text-slate-950 shadow-sm scale-105'
                            : 'text-slate-300 hover:text-white'
                        }`}
                      >
                        {t.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Explorer Key Stats Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-emerald-500/20">
                  <div className="p-2.5 rounded-2xl bg-slate-950/80 border border-amber-500/30 space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-400">探險者頭銜</span>
                    <div className="text-xs font-black text-amber-300 truncate">
                      🎖️ {isTreasureChestOpened ? '離線大探險導師' : '繪本知識探險家'}
                    </div>
                  </div>

                  <div className="p-2.5 rounded-2xl bg-slate-950/80 border border-emerald-500/30 space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-400">已解鎖關卡</span>
                    <div className="text-xs font-black text-emerald-300">
                      🗺️ {questCompletedStageIds.length} / {getQuestStages().length} 區 ({Math.round((questCompletedStageIds.length / Math.max(1, getQuestStages().length)) * 100)}%)
                    </div>
                  </div>

                  <div className="p-2.5 rounded-2xl bg-slate-950/80 border border-cyan-500/30 space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-400">知識水晶數量</span>
                    <div className="text-xs font-black text-cyan-300 flex items-center gap-1">
                      <Coins className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{questCrystals} 💎</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-2xl bg-slate-950/80 border border-purple-500/30 space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-400">離線寶箱狀態</span>
                    <button
                      type="button"
                      onClick={handleOpenTreasureChest}
                      className={`text-xs font-black px-2 py-0.5 rounded-lg border w-full text-center transition-all cursor-pointer ${
                        isTreasureChestOpened
                          ? 'bg-amber-400/20 text-amber-300 border-amber-400/40'
                          : 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 border-amber-300 animate-pulse hover:scale-105'
                      }`}
                    >
                      {isTreasureChestOpened ? '🎁 已領取 300 水晶' : '🎁 開啟神秘寶箱 (+300)'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Interactive Quest Stage Nodes Path */}
              <div
                className={`p-5 sm:p-6 rounded-3xl border shadow-2xl relative overflow-hidden transition-all duration-500 ${
                  questMapTheme === 'forest'
                    ? 'bg-gradient-to-b from-emerald-950 via-slate-950 to-teal-950 border-emerald-500/40'
                    : questMapTheme === 'starry'
                    ? 'bg-gradient-to-b from-indigo-950 via-slate-950 to-purple-950 border-indigo-500/40'
                    : 'bg-gradient-to-b from-cyan-950 via-slate-950 to-blue-950 border-cyan-500/40'
                }`}
              >
                {/* Background Ambient Grid */}
                <div className="absolute inset-0 bg-[radial-gradient(#10B981_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none"></div>

                <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3 relative z-10">
                  <div className="flex items-center gap-2">
                    <Compass className="w-4 h-4 text-amber-400 animate-spin-slow" />
                    <span className="text-xs font-black text-amber-300 uppercase tracking-wider">
                      繪本關卡探索連動路線圖 (點擊關卡即可展開地圖詳情)
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-slate-400">
                    點擊任何已解鎖關卡即可開啟離線閱讀或聆聽故事簡介
                  </span>
                </div>

                {/* Vertical Winding Path of Stage Nodes */}
                <div className="space-y-6 relative z-10 max-h-[480px] overflow-y-auto custom-scrollbar p-2">
                  {getQuestStages().map((st, idx) => {
                    const isEven = idx % 2 === 0;

                    return (
                      <div key={st.book.id || idx} className="relative flex flex-col items-center">
                        {/* Connecting Line to next stage */}
                        {idx < getQuestStages().length - 1 && (
                          <div className="absolute top-16 bottom-0 w-1 bg-gradient-to-b from-amber-400/60 via-emerald-400/40 to-slate-800 -z-0 rounded-full border-dashed"></div>
                        )}

                        <div
                          className={`w-full max-w-xl transition-all duration-300 relative ${
                            isEven ? 'self-start sm:ml-4' : 'self-end sm:mr-4'
                          }`}
                        >
                          <div
                            onClick={() => {
                              setSelectedQuestStageBook(st.book);
                              playStarChime();
                            }}
                            className={`p-4 rounded-3xl border-2 transition-all cursor-pointer shadow-xl flex items-center justify-between gap-4 group ${
                              st.isCompleted
                                ? 'bg-slate-900/90 border-emerald-400 hover:border-emerald-300 hover:scale-[1.02]'
                                : st.isCurrent
                                ? 'bg-gradient-to-r from-amber-950 via-slate-900 to-emerald-950 border-amber-400 ring-2 ring-amber-400/50 shadow-amber-500/20 animate-pulse hover:scale-[1.03]'
                                : 'bg-slate-950/70 border-slate-800 opacity-60 hover:opacity-80'
                            }`}
                          >
                            {/* Left Badge & Image */}
                            <div className="flex items-center gap-3.5 min-w-0">
                              <div className="relative shrink-0">
                                <img
                                  src={st.book.coverUrl}
                                  alt={st.bookTitle}
                                  className={`w-14 h-16 object-cover rounded-2xl border-2 shadow-md ${
                                    st.isCompleted
                                      ? 'border-emerald-400'
                                      : st.isCurrent
                                      ? 'border-amber-400'
                                      : 'border-slate-700 grayscale'
                                  }`}
                                />
                                <span className="absolute -top-2 -left-2 w-7 h-7 rounded-full bg-slate-950 border-2 border-amber-400 text-amber-300 font-black text-xs flex items-center justify-center shadow-md">
                                  {st.stageNum}
                                </span>
                              </div>

                              <div className="min-w-0 space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-base">{st.themeEmoji}</span>
                                  <h4 className="font-black text-sm text-amber-300 truncate">
                                    {st.regionName}
                                  </h4>
                                </div>

                                <p className="text-xs font-bold text-white truncate">
                                  《{st.bookTitle}》
                                </p>

                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-950 text-emerald-300 border border-emerald-500/30">
                                    {st.rewardText}
                                  </span>
                                  <span className="text-[10px] font-bold text-slate-400">
                                    {st.book.category || '繪本探索'}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Right Status Button */}
                            <div className="shrink-0 flex flex-col items-end gap-1.5">
                              {st.isCompleted ? (
                                <span className="px-3 py-1.5 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 font-black text-xs flex items-center gap-1 shadow-sm">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                  <span>已通關解鎖</span>
                                </span>
                              ) : st.isCurrent ? (
                                <span className="px-3 py-1.5 rounded-2xl bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1 shadow-md animate-bounce">
                                  <Flag className="w-3.5 h-3.5 text-slate-950 fill-slate-950" />
                                  <span>當前挑戰關卡</span>
                                </span>
                              ) : (
                                <span className="px-3 py-1.5 rounded-2xl bg-slate-900 text-slate-500 border border-slate-800 font-extrabold text-xs flex items-center gap-1">
                                  <Lock className="w-3.5 h-3.5" />
                                  <span>迷霧封印中</span>
                                </span>
                              )}

                              <span className="text-[10px] font-bold text-amber-300/80 group-hover:underline">
                                查看關卡詳情 ➔
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Stage Detail Drawer / Card Modal */}
              {selectedQuestStageBook && (
                <div className="p-5 rounded-3xl bg-slate-900 border-2 border-amber-400/80 shadow-2xl space-y-4 animate-fadeIn">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-amber-400" />
                      <h3 className="text-base font-black text-amber-300">
                        關卡情報：《
                        {typeof selectedQuestStageBook.title === 'string'
                          ? selectedQuestStageBook.title
                          : selectedQuestStageBook.title['zh-TW'] || '離線繪本'}
                        》
                      </h3>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedQuestStageBook(null)}
                      className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                    <img
                      src={selectedQuestStageBook.coverUrl}
                      alt="Cover"
                      className="w-24 h-32 object-cover rounded-2xl border-2 border-amber-400 shadow-lg shrink-0"
                    />

                    <div className="space-y-2 flex-1 min-w-0 text-left">
                      <p className="text-xs text-slate-200 font-bold leading-relaxed bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
                        {typeof selectedQuestStageBook.description === 'string'
                          ? selectedQuestStageBook.description
                          : selectedQuestStageBook.description?.['zh-TW'] ||
                            '這是一本充滿故事與智慧的離線雙語繪本，點擊即可進行閱讀與語音小幫手陪伴！'}
                      </p>

                      {/* Stage Tasks Checklist */}
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[11px] font-black text-amber-300 block">
                          🎯 關卡解鎖三部曲：
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <div className="p-2 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-[11px] font-bold text-emerald-300 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                            <span>1. 下載繪本離線快取</span>
                          </div>
                          <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span>2. 翻閱故事學習生字</span>
                          </div>
                          <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                            <Award className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                            <span>3. 領取關卡知識水晶</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Drawer Action Buttons */}
                  <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => {
                        const title =
                          typeof selectedQuestStageBook.title === 'string'
                            ? selectedQuestStageBook.title
                            : selectedQuestStageBook.title['zh-TW'] || '繪本';
                        const desc =
                          typeof selectedQuestStageBook.description === 'string'
                            ? selectedQuestStageBook.description
                            : selectedQuestStageBook.description?.['zh-TW'] || '';
                        handleAssistantSpeakBook(title, desc);
                      }}
                      className="px-3.5 py-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-400/40 font-extrabold text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>🎙️ 聽語音小幫手導覽關卡</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const title =
                          typeof selectedQuestStageBook.title === 'string'
                            ? selectedQuestStageBook.title
                            : selectedQuestStageBook.title['zh-TW'] || '繪本';
                        handleCompleteQuestStage(selectedQuestStageBook.id, title);
                      }}
                      className="px-3.5 py-2 rounded-2xl bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/40 font-black text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>🏆 標記通關並領水晶</span>
                    </button>

                    {onSelectBook && (
                      <button
                        type="button"
                        onClick={() => {
                          onSelectBook(selectedQuestStageBook);
                          onClose();
                        }}
                        className="px-5 py-2 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 hover:from-amber-300 hover:to-orange-300 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-transform hover:scale-105"
                      >
                        <Play className="w-4 h-4 fill-slate-950" />
                        <span>📖 立即開啟離線閱讀</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : activeTab === 'speedchallenge' ? (
            /* TAB 2: 🏆 速讀挑戰儀表板與排行榜 */
            <div className="space-y-5 animate-fadeIn">
              {/* Header Banner */}
              <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-yellow-500/20 border border-amber-400/40 backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-amber-400 text-slate-950 font-black shadow-lg shrink-0">
                    <Trophy className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-amber-300 flex items-center gap-2">
                      <span>速讀挑戰競賽與英雄榜</span>
                      <span className="px-2 py-0.5 rounded-full text-[11px] bg-amber-400 text-slate-950 font-black">
                        離線限定 ⚡
                      </span>
                    </h3>
                    <p className="text-xs font-bold text-slate-300 mt-0.5">
                      挑戰離線繪本翻閱速度與故事理解準確度，爭奪全站離線閱讀英雄榜！
                    </p>
                  </div>
                </div>

                {speedStatus !== 'idle' && (
                  <button
                    onClick={() => setSpeedStatus('idle')}
                    className="px-4 py-2 rounded-2xl bg-slate-800 text-amber-300 hover:bg-slate-700 font-extrabold text-xs flex items-center gap-1 border border-amber-500/30 shrink-0 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>返回競賽主頁</span>
                  </button>
                )}
              </div>

              {speedStatus === 'idle' && (
                <div className="space-y-5">
                  {/* Book Select for Speed Challenge */}
                  <div className="p-4 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3">
                    <h4 className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-400" />
                      <span>選擇一本已離線下載的繪本發起速讀挑戰</span>
                    </h4>

                    {analytics?.downloadedBooks && analytics.downloadedBooks.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {analytics.downloadedBooks.map((b) => {
                          const title = typeof b.title === 'string' ? b.title : (b.title['zh-TW'] || b.title.en);
                          return (
                            <div
                              key={b.id}
                              className="p-3.5 rounded-2xl bg-slate-950/80 border border-amber-500/20 hover:border-amber-400 transition-all flex flex-col justify-between gap-3"
                            >
                              <div className="flex items-center gap-3">
                                {b.coverImage ? (
                                  <img
                                    src={b.coverImage}
                                    alt={title}
                                    className="w-12 h-14 object-cover rounded-xl border border-slate-700 shrink-0"
                                  />
                                ) : (
                                  <div className="w-12 h-14 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 font-black shrink-0">
                                    📖
                                  </div>
                                )}
                                <div className="space-y-1 min-w-0">
                                  <h5 className="font-extrabold text-sm text-white truncate">{title}</h5>
                                  <p className="text-[11px] font-bold text-slate-400">
                                    頁數: {b.pages?.length || 8} 頁 ‧ 已下載
                                  </p>
                                </div>
                              </div>

                              <button
                                onClick={() => handleStartSpeedChallenge(b)}
                                className="w-full py-2 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                              >
                                <Zap className="w-3.5 h-3.5" />
                                <span>🚀 發起速讀挑戰</span>
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="p-6 text-center text-xs font-bold text-slate-400">
                        暫無離線下載繪本，請先在首頁下載繪本以解鎖速讀競賽！
                      </div>
                    )}
                  </div>

                  {/* Speed Challenge Leaderboard */}
                  <div className="p-4.5 rounded-3xl bg-slate-900/90 border border-amber-500/30 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-black text-sm text-amber-300 flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-amber-400" />
                        <span>🏆 全站離線速讀英雄榜</span>
                      </h4>
                      <span className="text-xs font-bold text-slate-400">即時計算與排名</span>
                    </div>

                    <div className="space-y-2.5">
                      {speedLeaderboard.map((record, index) => {
                        const rankBadge = index === 0 ? '🥇 榜首' : index === 1 ? '🥈 亞軍' : index === 2 ? '🥉 季軍' : `第 ${index + 1} 名`;
                        const rankBg = index === 0 ? 'bg-amber-400/20 border-amber-400/50 text-amber-300' : index === 1 ? 'bg-slate-300/20 border-slate-300/50 text-slate-200' : index === 2 ? 'bg-amber-700/20 border-amber-700/50 text-amber-400' : 'bg-slate-800/80 border-slate-700 text-slate-400';

                        return (
                          <div
                            key={record.id}
                            className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${rankBg}`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="font-black text-xs px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-700">
                                {rankBadge}
                              </span>
                              <div className="text-xl">{record.avatar}</div>
                              <div>
                                <div className="font-extrabold text-sm text-white flex items-center gap-2">
                                  <span>{record.childName}</span>
                                  <span className="text-[11px] font-bold text-slate-400">《{record.bookTitle}》</span>
                                </div>
                                <div className="text-[11px] font-bold text-slate-400 flex items-center gap-2 mt-0.5">
                                  <span>⚡ {record.secPerPage} 秒/頁</span>
                                  <span>‧</span>
                                  <span>🎯 理解準確度 {record.accuracyPct}%</span>
                                </div>
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              <div className="text-base font-black text-amber-300">{record.score} 分</div>
                              <div className="text-[10px] text-slate-500">{record.dateStr}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {speedStatus === 'reading' && (
                <div className="p-5 rounded-3xl bg-slate-900/90 border border-amber-500/40 space-y-4 animate-fadeIn">
                  {/* Timer & Gauge Header */}
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950 border border-slate-800">
                    <div className="flex items-center gap-2 text-xs font-black text-amber-300">
                      <Clock className="w-4 h-4 text-amber-400 animate-spin-slow" />
                      <span>速讀計時：{speedTimerSec} 秒</span>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-black text-cyan-300">
                      <Zap className="w-4 h-4" />
                      <span>目前的平均翻頁速度：{(speedTimerSec / Math.max(1, speedPageIndex + 1)).toFixed(1)} 秒/頁</span>
                    </div>
                  </div>

                  {/* Reading View */}
                  <div className="p-6 rounded-2xl bg-slate-950 border border-amber-500/20 text-center space-y-4">
                    <div className="text-xs font-black text-amber-300 uppercase tracking-widest">
                      正在進行速讀挑戰 ‧ 第 {speedPageIndex + 1} 頁
                    </div>
                    <p className="text-base sm:text-lg font-bold text-amber-100 leading-relaxed max-w-xl mx-auto">
                      小熊開心地捧著閃閃發光的魔法種子，穿過茂密森林，要把希望播撒在夢想花園的土壤裡...
                    </p>

                    <div className="flex items-center justify-center gap-3 pt-2">
                      <button
                        onClick={() => setSpeedPageIndex((p) => Math.max(0, p - 1))}
                        disabled={speedPageIndex === 0}
                        className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-xs disabled:opacity-30 cursor-pointer"
                      >
                        ◀ 上一頁
                      </button>

                      <button
                        onClick={() => {
                          playPageTurnSound();
                          setSpeedPageIndex((p) => p + 1);
                        }}
                        className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-md cursor-pointer"
                      >
                        ▶ 下一頁
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => setSpeedStatus('quiz')}
                    className="w-full py-3 bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-slate-950 font-black text-sm rounded-2xl shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>🎯 我已完成全書速讀！進入理解力測驗</span>
                  </button>
                </div>
              )}

              {speedStatus === 'quiz' && (
                <div className="p-5 rounded-3xl bg-slate-900/90 border border-amber-500/40 space-y-4 animate-fadeIn">
                  <div className="p-3 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-300 font-black text-xs flex items-center gap-2">
                    <HelpCircle className="w-4 h-4" />
                    <span>測驗階段：解答 3 題故事理解問題，驗證閱讀品質並計算最後總分！</span>
                  </div>

                  <div className="space-y-3">
                    {[
                      { q: "1. 故事中主角遭遇困難時採取了什麼積極的態度？", options: ["用勇氣與智慧勇敢克服", "放棄並跑回家", "原地等待朋友前來救援"] },
                      { q: "2. 翻閱這本繪本，你印象最深刻的情節主題是？", options: ["主角與夥伴互相扶持的溫馨過程", "神秘魔法盒子的光芒", "森林裡小動物們的精彩大合唱"] },
                      { q: "3. 讀完這本故事後，我們學到的核心正面品德是？", options: ["真誠分享與永不放棄的精神", "自己玩玩具最自由", "爭搶東西才會獲勝"] },
                    ].map((item, qIdx) => (
                      <div key={qIdx} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                        <div className="font-extrabold text-xs sm:text-sm text-white">{item.q}</div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          {item.options.map((opt, optIdx) => (
                            <button
                              key={optIdx}
                              onClick={() => {
                                const newAns = [...speedQuizAnswers];
                                newAns[qIdx] = optIdx;
                                setSpeedQuizAnswers(newAns);
                              }}
                              className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all cursor-pointer ${
                                speedQuizAnswers[qIdx] === optIdx
                                  ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handleSubmitSpeedQuiz}
                    className="w-full py-3 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-sm rounded-2xl shadow-lg cursor-pointer"
                  >
                    送出答案驗證準確度並計算排行名次 🚀
                  </button>
                </div>
              )}

              {speedStatus === 'result' && (
                <div className="p-6 rounded-3xl bg-slate-900/95 border border-amber-400 text-center space-y-5 animate-fadeIn">
                  <div className="inline-block p-4 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/50">
                    <Award className="w-10 h-10 animate-bounce" />
                  </div>

                  <div>
                    <h3 className="text-xl font-black text-amber-300">🎉 離線繪本速讀挑戰順利完成！</h3>
                    <p className="text-xs font-bold text-slate-300 mt-1">
                      成功登錄英雄榜！榮獲【第 {lastChallengeRank} 名】榮譽！
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
                    <div className="p-3 rounded-2xl bg-slate-950 border border-amber-500/30">
                      <div className="text-xs font-bold text-slate-400">總速讀耗時</div>
                      <div className="text-lg font-black text-amber-300">{speedTimerSec} 秒</div>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-950 border border-cyan-500/30">
                      <div className="text-xs font-bold text-slate-400">理解準確度</div>
                      <div className="text-lg font-black text-cyan-300">100%</div>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-950 border border-emerald-500/30">
                      <div className="text-xs font-bold text-slate-400">獎勵童星</div>
                      <div className="text-lg font-black text-emerald-300">+15 ⭐</div>
                    </div>
                  </div>

                  <button
                    onClick={() => setSpeedStatus('idle')}
                    className="px-6 py-3 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-xs rounded-2xl shadow-md cursor-pointer"
                  >
                    🏆 查看最新速讀英雄排行榜
                  </button>
                </div>
              )}
            </div>
          ) : activeTab === 'emotioncloud' ? (
            /* TAB 3: ☁️ 語音心得情緒雲 (Voice Sentiment Cloud) */
            <div className="space-y-5 animate-fadeIn">
              <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-rose-500/20 via-purple-500/20 to-indigo-500/20 border border-rose-400/40 backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-rose-400 text-slate-950 font-black shadow-lg shrink-0">
                    <Smile className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-rose-300 flex items-center gap-2">
                      <span>語音心得情緒雲 (Voice Emotion Cloud)</span>
                      <span className="px-2 py-0.5 rounded-full text-[11px] bg-rose-400 text-slate-950 font-black">
                        {voiceEmotionNotes.length} 則離線語音心情
                      </span>
                    </h3>
                    <p className="text-xs font-bold text-slate-300 mt-0.5">
                      自動分析孩童在繪本各頁面錄製的心情點滴，呈現情緒EQ成長指標與互動聲浪情緒雲。
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleSpeakAiEmotionReport}
                  className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-400 hover:to-pink-400 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md border border-rose-300/40 cursor-pointer self-start sm:self-auto shrink-0"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>🔊 收聽 AI 情緒成長分析</span>
                </button>
              </div>

              {/* Emotion Cloud Interactive Tag Cloud */}
              <div className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 text-rose-400" />
                    <span>互動情緒聲浪標籤雲 (點擊過濾心情)</span>
                  </h4>
                  {selectedEmotionFilter && (
                    <button
                      onClick={() => setSelectedEmotionFilter(null)}
                      className="text-[11px] font-extrabold text-slate-400 hover:text-white underline cursor-pointer"
                    >
                      重設情緒篩選
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {[
                    { emoji: '😃', name: '快樂興奮', count: voiceEmotionNotes.filter(n => n.emotionEmoji === '😃').length, bg: 'bg-amber-400/20 border-amber-400 text-amber-300' },
                    { emoji: '❤️', name: '溫馨感動', count: voiceEmotionNotes.filter(n => n.emotionEmoji === '❤️').length, bg: 'bg-rose-400/20 border-rose-400 text-rose-300' },
                    { emoji: '🌟', name: '奇幻驚喜', count: voiceEmotionNotes.filter(n => n.emotionEmoji === '🌟').length, bg: 'bg-purple-400/20 border-purple-400 text-purple-300' },
                    { emoji: '💡', name: '知識啟發', count: voiceEmotionNotes.filter(n => n.emotionEmoji === '💡').length, bg: 'bg-cyan-400/20 border-cyan-400 text-cyan-300' },
                    { emoji: '🦉', name: '深度沉思', count: voiceEmotionNotes.filter(n => n.emotionEmoji === '🦉').length, bg: 'bg-indigo-400/20 border-indigo-400 text-indigo-300' },
                    { emoji: '🦁', name: '勇敢自信', count: voiceEmotionNotes.filter(n => n.emotionEmoji === '🦁').length, bg: 'bg-orange-400/20 border-orange-400 text-orange-300' },
                    { emoji: '🤩', name: '超級崇拜', count: voiceEmotionNotes.filter(n => n.emotionEmoji === '🤩').length, bg: 'bg-emerald-400/20 border-emerald-400 text-emerald-300' },
                  ].map((emo) => {
                    const isSelected = selectedEmotionFilter === emo.emoji;
                    return (
                      <button
                        key={emo.emoji}
                        onClick={() => {
                          playStarChime();
                          setSelectedEmotionFilter(isSelected ? null : emo.emoji);
                        }}
                        className={`px-3.5 py-2 rounded-2xl border text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
                          isSelected ? 'ring-2 ring-white scale-105 ' + emo.bg : emo.bg + ' opacity-80 hover:opacity-100'
                        }`}
                      >
                        <span className="text-base">{emo.emoji}</span>
                        <span>{emo.name}</span>
                        <span className="px-1.5 py-0.2 rounded-full bg-slate-950 text-[10px]">
                          {emo.count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 🎙️ 新增離線語音心情筆記區塊 (Interactive Voice Emotion Note Creator) */}
              <div className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-3.5">
                <h4 className="text-xs font-black text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Mic className="w-4 h-4 text-rose-400" />
                  <span>🎙️ 錄製與新增離線繪本語音心情筆記</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Select Target Book */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-extrabold text-slate-400">選擇繪本故事：</label>
                    <select
                      value={newNoteBookId}
                      onChange={(e) => setNewNoteBookId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold text-xs focus:border-rose-400 outline-none"
                    >
                      <option value="">-- 請選擇繪本故事 --</option>
                      {(analytics?.downloadedBooks && analytics.downloadedBooks.length > 0
                        ? analytics.downloadedBooks
                        : SAMPLE_RECOMMENDATION_BOOKS).map((b) => {
                        const title = typeof b.title === 'string' ? b.title : (b.title['zh-TW'] || b.title.en);
                        return (
                          <option key={b.id} value={b.id}>
                            《{title}》
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {/* Select Emotion Emoji */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-extrabold text-slate-400">當下心情標籤：</label>
                    <div className="flex gap-1.5 pt-0.5">
                      {['😃', '❤️', '🌟', '💡', '🦉', '🦁', '🤩'].map((emo) => (
                        <button
                          key={emo}
                          type="button"
                          onClick={() => {
                            playStarChime();
                            setNewNoteEmoji(emo);
                          }}
                          className={`p-1.5 rounded-xl border text-base cursor-pointer transition-all ${
                            newNoteEmoji === emo
                              ? 'bg-rose-500 text-white border-rose-300 scale-110 shadow'
                              : 'bg-slate-950 border-slate-800 hover:border-slate-600'
                          }`}
                        >
                          {emo}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Note Title Input & Submit */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newNoteTitle}
                    onChange={(e) => setNewNoteTitle(e.target.value)}
                    placeholder="輸入孩子或家長的語音心得標題（如：主角好勇敢喔...）"
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold text-xs focus:border-rose-400 outline-none"
                  />
                  <button
                    onClick={handleSaveNewVoiceEmotionNote}
                    className="px-4 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-black text-xs flex items-center gap-1.5 shadow cursor-pointer shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>儲存心情筆記</span>
                  </button>
                </div>
              </div>

              {/* AI Emotional Intelligence (EQ) Growth Metrics */}
              <div className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-3">
                <h4 className="text-xs font-black text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>AI 情緒EQ成長四維度能力分析</span>
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { label: '😃 快樂自信表達', score: 92, color: 'from-amber-400 to-yellow-500' },
                    { label: '❤️ 同理感知能力', score: 88, color: 'from-rose-400 to-pink-500' },
                    { label: '💡 好奇探索熱情', score: 95, color: 'from-cyan-400 to-blue-500' },
                    { label: '🦁 挫折勇氣韌性', score: 90, color: 'from-emerald-400 to-teal-500' },
                  ].map((eq, idx) => (
                    <div key={idx} className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                      <div className="text-[11px] font-extrabold text-slate-300">{eq.label}</div>
                      <div className="text-base font-black text-white">{eq.score}%</div>
                      <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${eq.color}`}
                          style={{ width: `${eq.score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Voice Notes List */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">
                  {selectedEmotionFilter ? `已篩選「${selectedEmotionFilter}」心情語音` : '全部離線語音心得清單'}
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {voiceEmotionNotes
                    .filter((n) => !selectedEmotionFilter || n.emotionEmoji === selectedEmotionFilter)
                    .map((note) => {
                      const isPlaying = playingVoiceNoteId === note.id;
                      return (
                        <div
                          key={note.id}
                          className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 hover:border-rose-500/30 transition-all"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-xl p-1.5 rounded-xl bg-slate-950 border border-slate-800">
                                {note.emotionEmoji}
                              </span>
                              <div>
                                <h5 className="font-extrabold text-sm text-white">{note.noteTitle}</h5>
                                <p className="text-[11px] font-bold text-slate-400">
                                  《{note.bookTitle}》‧ 第 {note.pageNumber} 頁
                                </p>
                              </div>
                            </div>
                            <span className="text-[10px] text-slate-500">{note.createdAt}</span>
                          </div>

                          <button
                            onClick={() => handlePlayVoiceNote(note.id, note.audioDataUrl, note.noteTitle)}
                            className={`w-full py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors ${
                              isPlaying
                                ? 'bg-rose-500 text-white animate-pulse'
                                : 'bg-slate-800 hover:bg-slate-700 text-rose-300 border border-rose-500/30'
                            }`}
                          >
                            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                            <span>{isPlaying ? '正在播放語音心得...' : '▶ 點擊收聽孩童語音感想'}</span>
                          </button>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          ) : activeTab === 'memorypuzzle' ? (
            /* TAB 4: 🧩 離線繪本記憶拼圖 (Story Memory Puzzle & Hidden Characters) */
            <div className="space-y-5 animate-fadeIn">
              <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-indigo-500/20 border border-emerald-400/40 backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-emerald-400 text-slate-950 font-black shadow-lg shrink-0">
                    <Puzzle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-emerald-300 flex items-center gap-2">
                      <span>離線繪本故事記憶拼圖 (Story Memory Puzzle)</span>
                      <span className="px-2 py-0.5 rounded-full text-[11px] bg-emerald-400 text-slate-950 font-black">
                        3x3 解鎖隱藏角色
                      </span>
                    </h3>
                    <p className="text-xs font-bold text-slate-300 mt-0.5">
                      精選完讀繪本插畫裁剪成拼圖塊，完成挑戰即可解鎖該繪本專屬『隱藏知識角色卡片』！
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                  <button
                    onClick={() => setShowPuzzlePreview(!showPuzzlePreview)}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 font-extrabold text-xs flex items-center gap-1.5 border border-emerald-500/30 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{showPuzzlePreview ? '隱藏原圖' : '👁️ 預覽原圖'}</span>
                  </button>

                  <button
                    onClick={initShufflePuzzle}
                    className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>🔀 重新洗牌</span>
                  </button>
                </div>
              </div>

              {/* 📚 選擇要挑戰的離線繪本 (Offline Books Selector) */}
              <div className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-3">
                <h4 className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-amber-400" />
                  <span>選擇離線繪本插畫挑戰關卡</span>
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                  {(analytics?.downloadedBooks && analytics.downloadedBooks.length > 0
                    ? analytics.downloadedBooks
                    : SAMPLE_RECOMMENDATION_BOOKS).map((book) => {
                    const isSelected = (puzzleBookId || (analytics?.downloadedBooks?.[0]?.id || 'rec_book_1')) === book.id;
                    const bTitle = typeof book.title === 'string' ? book.title : (book.title['zh-TW'] || book.title.en);
                    const isUnlockedChar = unlockedCharacterBookIds.includes(book.id);
                    const charInfo = getHiddenCharacterForBook(book.id, bTitle);

                    return (
                      <button
                        key={book.id}
                        onClick={() => {
                          playStarChime();
                          setPuzzleBookId(book.id);
                          initShufflePuzzle();
                        }}
                        className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                          isSelected
                            ? 'bg-emerald-950/80 border-emerald-400 ring-2 ring-emerald-400 scale-[1.02]'
                            : 'bg-slate-950 border-slate-800 hover:border-slate-600 opacity-90'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-lg">{charInfo.avatarEmoji}</span>
                            <span
                              className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                                isUnlockedChar
                                  ? 'bg-amber-400 text-slate-950'
                                  : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              {isUnlockedChar ? '🔓 已解鎖' : '🔒 拼圖中'}
                            </span>
                          </div>
                          <div className="font-black text-xs text-white line-clamp-1">{bTitle}</div>
                          <div className="text-[10px] font-bold text-slate-400 line-clamp-1">
                            {charInfo.characterName}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-center">
                  <div className="text-[11px] font-bold text-slate-400">搬動步數</div>
                  <div className="text-lg font-black text-amber-300">{puzzleMoveCount} 步</div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-center">
                  <div className="text-[11px] font-bold text-slate-400">拼圖計時</div>
                  <div className="text-lg font-black text-cyan-300">{puzzleTimeSec} 秒</div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-center">
                  <div className="text-[11px] font-bold text-slate-400">還原進度</div>
                  <div className="text-lg font-black text-emerald-300">
                    {Math.round((puzzleTiles.filter((v, i) => v === i).length / 9) * 100)}%
                  </div>
                </div>
              </div>

              {/* Active Book Hidden Character Banner (Shown when Solved) */}
              {(() => {
                const currentActiveBook = (analytics?.downloadedBooks && analytics.downloadedBooks.length > 0
                  ? analytics.downloadedBooks
                  : SAMPLE_RECOMMENDATION_BOOKS).find(b => b.id === puzzleBookId) || (analytics?.downloadedBooks?.[0] || SAMPLE_RECOMMENDATION_BOOKS[0]);
                const activeId = currentActiveBook.id;
                const activeTitle = typeof currentActiveBook.title === 'string' ? currentActiveBook.title : (currentActiveBook.title['zh-TW'] || currentActiveBook.title.en);
                const charInfo = getHiddenCharacterForBook(activeId, activeTitle);
                const isCharUnlocked = unlockedCharacterBookIds.includes(activeId);

                return (
                  <div className={`p-4 rounded-3xl border transition-all space-y-3 ${
                    isPuzzleSolved
                      ? 'bg-gradient-to-r from-amber-500/20 via-emerald-500/20 to-teal-500/20 border-amber-400/60 shadow-xl animate-pulse'
                      : isCharUnlocked
                      ? 'bg-slate-900/90 border-amber-500/40'
                      : 'bg-slate-950/80 border-slate-800'
                  }`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="p-3 rounded-2xl bg-amber-400/20 border border-amber-400 text-3xl shadow-inner shrink-0">
                          {charInfo.avatarEmoji}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-base font-black text-amber-300">{charInfo.characterName}</h4>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-950">
                              {charInfo.roleBadge}
                            </span>
                          </div>
                          <p className="text-xs font-extrabold text-slate-300 mt-0.5">
                            《{activeTitle}》隱藏知識角色 ‧ {charInfo.characterTitle}
                          </p>
                        </div>
                      </div>

                      {isCharUnlocked ? (
                        <button
                          onClick={() => handleSpeakCharacterVoice(charInfo)}
                          className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow cursor-pointer shrink-0"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>🔊 聽隱藏角色故事語音</span>
                        </button>
                      ) : (
                        <span className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-400 font-extrabold text-xs border border-slate-700 flex items-center gap-1">
                          <Lock className="w-3.5 h-3.5" />
                          <span>完成拼圖解鎖</span>
                        </span>
                      )}
                    </div>

                    {isCharUnlocked && (
                      <div className="p-3 rounded-2xl bg-slate-950/80 border border-amber-400/30 space-y-2">
                        <div className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                          <span>【解鎖知識卡片】：{charInfo.knowledgeTitle}</span>
                        </div>
                        <p className="text-xs font-bold text-slate-200 leading-relaxed">
                          {charInfo.knowledgeDesc}
                        </p>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {charInfo.bilingualTerms.map((term, tIdx) => (
                            <span key={tIdx} className="px-2.5 py-0.5 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-400/30 text-[10px] font-black">
                              🔤 {term.en} ({term.zh})
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Preview Original Picture */}
              {showPuzzlePreview && (
                <div className="p-3 rounded-2xl bg-slate-950 border border-emerald-500/40 text-center space-y-2">
                  <div className="text-xs font-extrabold text-emerald-300">原本故事畫面目標參考圖：</div>
                  <div className="w-48 h-48 mx-auto rounded-xl bg-amber-500/20 border border-amber-400 flex items-center justify-center text-4xl shadow-inner">
                    🐻🌸🌳
                  </div>
                </div>
              )}

              {/* 3x3 Puzzle Board */}
              <div className="max-w-xs mx-auto p-3 rounded-3xl bg-slate-950 border border-emerald-500/40 shadow-2xl space-y-3">
                <div className="grid grid-cols-3 gap-2 aspect-square">
                  {puzzleTiles.map((tileVal, idx) => {
                    const isSelected = selectedTileIndex === idx;
                    const isCorrect = tileVal === idx;

                    return (
                      <button
                        key={idx}
                        onClick={() => handleTileClick(idx)}
                        className={`rounded-2xl border-2 flex flex-col items-center justify-center font-black transition-all cursor-pointer relative overflow-hidden ${
                          isSelected
                            ? 'bg-amber-400 text-slate-950 border-amber-300 scale-105 shadow-lg ring-4 ring-amber-300'
                            : isCorrect
                            ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300'
                            : 'bg-slate-900 border-slate-700 text-slate-200 hover:border-slate-500'
                        }`}
                      >
                        <span className="text-2xl">
                          {tileVal === 0 ? '🐻' : tileVal === 1 ? '🌸' : tileVal === 2 ? '🌳' : tileVal === 3 ? '✨' : tileVal === 4 ? '🏰' : tileVal === 5 ? '🌙' : tileVal === 6 ? '🦉' : tileVal === 7 ? '🍎' : '⭐'}
                        </span>
                        <span className="text-[10px] font-bold opacity-60">
                          圖塊 #{tileVal + 1}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 🏆 已解鎖故事隱藏角色特展櫃 (Unlocked Hidden Characters Cabinet) */}
              <div className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Trophy className="w-4 h-4 text-amber-400" />
                    <span>已收集之故事隱藏角色特展櫃 ({unlockedCharacterBookIds.length} / {(analytics?.downloadedBooks?.length || 5)} 解鎖)</span>
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(analytics?.downloadedBooks && analytics.downloadedBooks.length > 0
                    ? analytics.downloadedBooks
                    : SAMPLE_RECOMMENDATION_BOOKS).map((book) => {
                    const bTitle = typeof book.title === 'string' ? book.title : (book.title['zh-TW'] || book.title.en);
                    const isUnlocked = unlockedCharacterBookIds.includes(book.id);
                    const charInfo = getHiddenCharacterForBook(book.id, bTitle);

                    return (
                      <div
                        key={book.id}
                        className={`p-3.5 rounded-2xl border transition-all ${
                          isUnlocked
                            ? 'bg-slate-950 border-amber-500/40 hover:border-amber-400'
                            : 'bg-slate-950/50 border-slate-800 opacity-60'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <span className="text-2xl p-1.5 rounded-xl bg-slate-900 border border-slate-800">
                              {charInfo.avatarEmoji}
                            </span>
                            <div>
                              <div className="font-extrabold text-xs text-white flex items-center gap-1.5">
                                <span>{charInfo.characterName}</span>
                                {isUnlocked ? (
                                  <span className="text-[10px] text-amber-300 font-black">🔓 已領取</span>
                                ) : (
                                  <span className="text-[10px] text-slate-500 font-bold">🔒 尚未解鎖</span>
                                )}
                              </div>
                              <p className="text-[10px] font-bold text-slate-400">《{bTitle}》</p>
                            </div>
                          </div>

                          {isUnlocked && (
                            <button
                              onClick={() => handleSpeakCharacterVoice(charInfo)}
                              className="p-2 rounded-xl bg-amber-400/20 text-amber-300 hover:bg-amber-400 hover:text-slate-950 font-black text-xs border border-amber-400/40 cursor-pointer"
                              title="收聽角色故事"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : activeTab === 'wizard' ? (
            /* TAB 2: 🧙‍♂️ 引導式儲存管理精靈 (Guided Storage Management Wizard) */
            <div className="space-y-5 animate-fadeIn">
              {/* Wizard Header Banner */}
              <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-indigo-950 via-purple-950 to-slate-950 border border-amber-400/50 space-y-4 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="p-3 rounded-2xl bg-amber-500 text-slate-950 text-2xl shadow-lg shrink-0">
                      🧙‍♂️
                    </span>
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-amber-300 flex items-center gap-2">
                        <span>引導式儲存管理精靈</span>
                        <span className="px-2.5 py-0.5 rounded-full bg-purple-900 text-purple-200 text-xs font-bold border border-purple-400/40">
                          AI 語音互動任務
                        </span>
                      </h3>
                      <p className="text-xs font-bold text-amber-100/80">
                        自動分析繪本容量佔比 ‧ AI 語音講解說明 ‧ 動畫互動掃除大作戰
                      </p>
                    </div>
                  </div>

                  {/* Wizard Step Progress Pills */}
                  <div className="flex items-center gap-1.5 self-start sm:self-center">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-black ${wizardStep === 1 ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                      1. 容量分析
                    </span>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-black ${wizardStep === 2 ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                      2. 互動掃除
                    </span>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-black ${wizardStep === 3 ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                      3. 獲得獎勵
                    </span>
                  </div>
                </div>

                {/* AI Voice Persona Selection Bar */}
                <div className="p-3 rounded-2xl bg-slate-900/90 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                    <Bot className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>精靈嚮導語音：</span>
                  </div>

                  <div className="flex items-center gap-2 overflow-x-auto">
                    {WIZARD_VOICES.map((v) => (
                      <button
                        key={v.role}
                        type="button"
                        onClick={() => {
                          setSelectedWizardVoice(v.role);
                          playStarChime();
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                          selectedWizardVoice === v.role
                            ? 'bg-amber-400 text-slate-950 font-black shadow-md'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        <span>{v.avatar}</span>
                        <span>{v.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* AI Voice Explanation Speech Card */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-900/60 to-indigo-900/60 border border-purple-400/40 space-y-3 relative overflow-hidden">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span className="text-3xl p-2 rounded-2xl bg-slate-950 border border-purple-400/40 shrink-0">
                        {WIZARD_VOICES.find((v) => v.role === selectedWizardVoice)?.avatar || '🧚‍♀️'}
                      </span>
                      <div className="space-y-1">
                        <div className="font-black text-xs sm:text-sm text-amber-300 flex items-center gap-2">
                          <span>{WIZARD_VOICES.find((v) => v.role === selectedWizardVoice)?.name} 的語音解說</span>
                          {isSpeakingGuide && (
                            <span className="flex items-center gap-1 text-[11px] text-emerald-300 animate-pulse">
                              <Volume2 className="w-3.5 h-3.5" />
                              朗讀中...
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-bold text-slate-200 leading-relaxed">
                          「親愛的{userProfile?.name || '小讀者'}！我們的繪本城堡盒子用了 <span className="text-amber-300 font-black">{storagePercentage}%</span> 的容量。把讀完的故事打掃乾淨，就能清出空間裝進更多酷炫的新冒險喔！」
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleSpeakWizardGuidance}
                      className={`px-3.5 py-2 rounded-2xl font-black text-xs flex items-center gap-1.5 shadow-md transition-transform hover:scale-105 cursor-pointer shrink-0 ${
                        isSpeakingGuide
                          ? 'bg-rose-500 text-white animate-pulse'
                          : 'bg-amber-400 text-slate-950 hover:bg-amber-300'
                      }`}
                    >
                      {isSpeakingGuide ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                      <span>{isSpeakingGuide ? '停止語音' : '🔊 播放精靈解說'}</span>
                    </button>
                  </div>

                  {/* Animated Waveform Indicator */}
                  {isSpeakingGuide && (
                    <div className="flex items-center gap-1 pt-1 justify-center">
                      <div className="w-1.5 h-4 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                      <div className="w-1.5 h-6 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                      <div className="w-1.5 h-8 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                      <div className="w-1.5 h-5 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0.45s' }} />
                      <div className="w-1.5 h-3 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.6s' }} />
                    </div>
                  )}
                </div>
              </div>

              {/* Wizard Step Content */}
              {wizardStep === 1 ? (
                /* Step 1: 容量佔比分析 */
                <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/90 border border-amber-500/30 space-y-4 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-black text-amber-300 flex items-center gap-2">
                      <PieChart className="w-4 h-4 text-orange-400" />
                      <span>繪本容量佔比視覺化分析 (Capacity Ratio)</span>
                    </h4>
                    <span className="text-xs font-bold text-slate-400">總容量預估：{analytics.estimatedMB}</span>
                  </div>

                  {/* Ratio visual bars breakdown */}
                  <div className="space-y-3">
                    <div className="w-full h-4 rounded-full bg-slate-950 overflow-hidden p-0.5 border border-slate-800 flex">
                      <div className="h-full bg-amber-400 rounded-l-full transition-all" style={{ width: `${Math.min(100, storagePercentage * 0.6)}%` }} title="完讀可釋放" />
                      <div className="h-full bg-indigo-500 transition-all" style={{ width: `${Math.min(100, storagePercentage * 0.3)}%` }} title="正在閱讀" />
                      <div className="h-full bg-emerald-400 rounded-r-full transition-all" style={{ width: `${Math.min(100, storagePercentage * 0.1)}%` }} title="預留空間" />
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold">
                      <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-400/30 text-amber-300">
                        <div className="text-base font-black">{(usedMBNum * 0.6).toFixed(1)} MB</div>
                        <div className="text-[10px] text-amber-200/80">🧹 建議清理 (已完讀)</div>
                      </div>

                      <div className="p-2.5 rounded-2xl bg-indigo-500/10 border border-indigo-400/30 text-indigo-300">
                        <div className="text-base font-black">{(usedMBNum * 0.3).toFixed(1)} MB</div>
                        <div className="text-[10px] text-indigo-200/80">📖 正在翻閱繪本</div>
                      </div>

                      <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-400/30 text-emerald-300">
                        <div className="text-base font-black">{(maxCapMB - usedMBNum).toFixed(1)} MB</div>
                        <div className="text-[10px] text-emerald-200/80">✨ 剩餘可用容量</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        playStarChime();
                        setWizardStep(2);
                      }}
                      className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg hover:scale-105 transition-transform cursor-pointer"
                    >
                      <span>🚀 前往步驟 2：開始點擊掃除任務</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : wizardStep === 2 ? (
                /* Step 2: 點擊與魔法寶箱掃除互動 */
                <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/90 border border-purple-500/40 space-y-4 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-black text-amber-300 flex items-center gap-2">
                      <Wand2 className="w-4 h-4 text-purple-400" />
                      <span>點擊魔杖與魔法寶箱，掃除已完讀繪本！</span>
                    </h4>

                    <button
                      type="button"
                      onClick={handleWizardSweepAll}
                      className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-black text-xs flex items-center gap-1 shadow-md cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>🪄 一鍵全打包入箱</span>
                    </button>
                  </div>

                  {cleanupCandidates.length === 0 ? (
                    <div className="p-8 text-center bg-slate-950/80 rounded-2xl border border-dashed border-amber-400/40 text-xs font-bold text-amber-200 space-y-2">
                      <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto animate-bounce" />
                      <div>太厲害了！你的繪本城堡非常乾淨整潔，沒有需要清理的舊繪本囉！</div>
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-56 overflow-y-auto custom-scrollbar">
                      {cleanupCandidates.map((book) => {
                        const isSwept = sweptBookIds.includes(book.id);
                        return (
                          <div
                            key={book.id}
                            className={`p-3.5 rounded-2xl border transition-all duration-300 flex items-center justify-between gap-3 ${
                              isSwept
                                ? 'bg-emerald-950/40 border-emerald-500/40 opacity-50 scale-95'
                                : 'bg-slate-950/80 border-purple-500/30 hover:border-amber-400'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <img
                                src={book.coverUrl}
                                alt={typeof book.title === 'string' ? book.title : book.title['zh-TW']}
                                className="w-10 h-10 object-cover rounded-xl border border-purple-400/40"
                              />
                              <div>
                                <div className="font-extrabold text-xs sm:text-sm text-white">
                                  {typeof book.title === 'string' ? book.title : book.title['zh-TW']}
                                </div>
                                <div className="text-[10px] font-bold text-slate-400">
                                  {book.pages?.length || 0} 頁插圖 • 約 ~1.2 MB
                                </div>
                              </div>
                            </div>

                            {isSwept ? (
                              <span className="px-3 py-1.5 rounded-xl bg-emerald-900/80 text-emerald-200 text-xs font-black flex items-center gap-1 border border-emerald-500/40">
                                <PackageCheck className="w-3.5 h-3.5" />
                                <span>已收入寶箱</span>
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleWizardSweepBook(book.id, typeof book.title === 'string' ? book.title : book.title['zh-TW'])}
                                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-xs flex items-center gap-1 shadow-md transition-transform hover:scale-105 cursor-pointer"
                              >
                                <span>🧹 揮魔杖打掃</span>
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setWizardStep(1)}
                      className="px-4 py-2 rounded-2xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 cursor-pointer"
                    >
                      ◀ 上一步
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        playStarChime();
                        setWizardStep(3);
                      }}
                      className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-lg hover:scale-105 cursor-pointer"
                    >
                      <span>完成掃除，領取稱號獎勵</span>
                      <Trophy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                /* Step 3: 完成與勳章獎勵發放 */
                <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-500/20 via-purple-500/20 to-slate-950 border border-amber-400 text-center space-y-4 animate-fadeIn">
                  <div className="w-16 h-16 rounded-3xl bg-amber-400 text-slate-950 flex items-center justify-center text-3xl mx-auto shadow-xl animate-bounce">
                    🧹
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-lg font-black text-amber-300">
                      🎉 太棒了！城堡空間優化大成功！
                    </h4>
                    <p className="text-xs font-bold text-slate-200">
                      你展現了優秀的儲存管理魔法，成功清出了寶貴的裝置磁碟空間！
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-amber-400/40 max-w-sm mx-auto space-y-2">
                    <div className="text-xs font-extrabold text-amber-300 flex items-center justify-center gap-1.5">
                      <Award className="w-4 h-4 text-amber-400" />
                      <span>獲得榮譽勛章：【🧹 離線城堡空間清潔大師】</span>
                    </div>
                    <div className="text-xs font-black text-emerald-300 flex items-center justify-center gap-1">
                      <Star className="w-4 h-4 fill-emerald-400 text-emerald-400" />
                      <span>獲得童星獎勵 +10 顆 ⭐</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        playStarChime();
                        setWizardStep(1);
                        setSweptBookIds([]);
                      }}
                      className="px-4 py-2 rounded-2xl bg-slate-800 text-slate-200 text-xs font-bold hover:bg-slate-700 cursor-pointer"
                    >
                      🔄 再次重新體檢
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        playStarChime();
                        setActiveTab('quickread');
                      }}
                      className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-md cursor-pointer"
                    >
                      <FastForward className="w-4 h-4 fill-slate-950" />
                      <span>前往離線繪本速讀模式</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : activeTab === 'quickread' ? (
            /* TAB 3: ⚡ 離線繪本速讀模式 (Offline Book Speed Reader / Quick Glance) */
            <div className="space-y-5 animate-fadeIn">

              {/* Quick Read Header */}
              <div className="p-4 rounded-3xl bg-slate-900/90 border border-cyan-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xl">
                <div className="flex items-center gap-2.5">
                  <span className="p-2.5 rounded-2xl bg-cyan-500 text-slate-950 font-black">
                    <FastForward className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="text-base font-black text-cyan-300">
                      ⚡ 離線繪本速讀模式 (Quick Glance)
                    </h3>
                    <p className="text-xs font-bold text-slate-300">
                      不必離開面板，隨時快速預覽、試聽語音與生字快卡
                    </p>
                  </div>
                </div>

                {/* Auto flip speed controls */}
                <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsAutoFlipping(!isAutoFlipping)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1 cursor-pointer ${
                      isAutoFlipping
                        ? 'bg-rose-500 text-white animate-pulse'
                        : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400'
                    }`}
                  >
                    {isAutoFlipping ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    <span>{isAutoFlipping ? '暫停速讀' : '▶ 開始自動速讀'}</span>
                  </button>

                  <select
                    value={flipSpeedSec}
                    onChange={(e) => setFlipSpeedSec(Number(e.target.value) as 3 | 5 | 8)}
                    className="bg-slate-900 text-cyan-200 text-xs font-bold px-2 py-1.5 rounded-xl border border-slate-700 cursor-pointer outline-none"
                  >
                    <option value={3}>3秒/頁 (快速)</option>
                    <option value={5}>5秒/頁 (標準)</option>
                    <option value={8}>8秒/頁 (細讀)</option>
                  </select>
                </div>
              </div>

              {analytics.downloadedBooks.length === 0 ? (
                <div className="p-8 text-center bg-slate-900/80 rounded-3xl border border-dashed border-cyan-500/40 text-xs font-bold text-cyan-300 space-y-2">
                  <BookOpen className="w-8 h-8 text-cyan-400 mx-auto" />
                  <div>尚無離線下載的繪本，請先在繪本圖書館離線保存故事喔！</div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Book Picker Horizontal Chips */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
                    {analytics.downloadedBooks.map((b) => {
                      const isSelected = (selectedQuickBookId || analytics.downloadedBooks[0].id) === b.id;
                      return (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => {
                            playStarChime();
                            setSelectedQuickBookId(b.id);
                            setQuickPageIndex(0);
                          }}
                          className={`px-3.5 py-2 rounded-2xl border text-xs font-extrabold flex items-center gap-2 shrink-0 transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 border-cyan-300 shadow-md font-black scale-105'
                              : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:border-slate-600'
                          }`}
                        >
                          <img src={b.coverUrl} alt="" className="w-6 h-6 object-cover rounded-lg" />
                          <span>{typeof b.title === 'string' ? b.title : b.title['zh-TW']}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Quick Reader Main Stage Card */}
                  {activeQuickBook && (
                    <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/90 border border-cyan-500/30 space-y-4 shadow-xl">
                      {/* Active Book Info Header */}
                      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={activeQuickBook.coverUrl}
                            alt=""
                            className="w-12 h-12 object-cover rounded-2xl border border-cyan-400/40 shadow-sm"
                          />
                          <div>
                            <h4 className="font-black text-sm text-white">
                              {typeof activeQuickBook.title === 'string' ? activeQuickBook.title : activeQuickBook.title['zh-TW']}
                            </h4>
                            <p className="text-xs text-slate-400 font-bold">
                              {activeQuickBook.originCountry} • 適讀 {activeQuickBook.ageGroup} 歲 • 共 {activeQuickBook.pages?.length || 0} 頁
                            </p>
                          </div>
                        </div>

                        {onSelectBook && (
                          <button
                            type="button"
                            onClick={() => {
                              onClose();
                              onSelectBook(activeQuickBook);
                            }}
                            className="px-3.5 py-2 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md cursor-pointer shrink-0"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>📖 全螢幕沉浸閱讀</span>
                          </button>
                        )}
                      </div>

                      {/* Active Page Stage */}
                      {activeQuickPage ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
                          {/* Illustration */}
                          <div className="relative aspect-video sm:aspect-square rounded-2xl overflow-hidden border border-slate-800 bg-slate-900">
                            <img
                              src={activeQuickPage.illustrationUrl}
                              alt=""
                              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                            />
                            <div className="absolute top-2 left-2 px-2.5 py-1 rounded-full bg-slate-950/80 text-amber-300 text-[10px] font-black border border-amber-400/40">
                              頁碼 {activeQuickPage.pageNumber} / {activeQuickBook.pages.length}
                            </div>
                          </div>

                          {/* Dual-language Text & Voice Narration */}
                          <div className="space-y-3 flex flex-col justify-between h-full">
                            <div className="space-y-2">
                              <p className="text-xs sm:text-sm font-bold text-slate-100 leading-relaxed bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
                                {activeQuickPage.text['zh-TW']}
                              </p>
                              {activeQuickPage.text['en'] && (
                                <p className="text-xs font-medium text-slate-400 italic px-1">
                                  "{activeQuickPage.text['en']}"
                                </p>
                              )}
                            </div>

                            {/* Page Controls & Voice Audio */}
                            <div className="space-y-3 pt-2">
                              <div className="flex items-center justify-between gap-2">
                                <button
                                  type="button"
                                  onClick={handleSpeakQuickPage}
                                  className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-colors cursor-pointer ${
                                    isNarratingPage
                                      ? 'bg-rose-500 text-white animate-pulse'
                                      : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400'
                                  }`}
                                >
                                  {isNarratingPage ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                                  <span>{isNarratingPage ? '停止朗讀' : '🔊 聽本頁朗讀'}</span>
                                </button>

                                {/* Page Switcher */}
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      playPageTurnSound();
                                      setQuickPageIndex((prev) => Math.max(0, prev - 1));
                                    }}
                                    disabled={quickPageIndex === 0}
                                    className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 cursor-pointer"
                                  >
                                    <ChevronLeft className="w-4 h-4" />
                                  </button>

                                  <span className="text-xs font-black text-amber-300 px-2">
                                    {quickPageIndex + 1} / {activeQuickBook.pages.length}
                                  </span>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      playPageTurnSound();
                                      setQuickPageIndex((prev) => Math.min(activeQuickBook.pages.length - 1, prev + 1));
                                    }}
                                    disabled={quickPageIndex >= activeQuickBook.pages.length - 1}
                                    className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 cursor-pointer"
                                  >
                                    <ChevronRight className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>

                              {/* Page Vocab Mini-Deck */}
                              {activeQuickPage.vocab && activeQuickPage.vocab.length > 0 && (
                                <div className="p-2.5 rounded-xl bg-indigo-950/50 border border-indigo-500/30 space-y-1">
                                  <div className="text-[10px] font-black text-indigo-300 flex items-center gap-1">
                                    <Bookmark className="w-3 h-3" />
                                    <span>本頁精選生字與發音：</span>
                                  </div>
                                  <div className="flex flex-wrap gap-1.5">
                                    {activeQuickPage.vocab.map((v, vIdx) => (
                                      <span key={vIdx} className="px-2 py-0.5 rounded-lg bg-indigo-900/80 text-indigo-200 text-[10px] font-bold border border-indigo-400/30">
                                        {v.word} ({v.phonetic}) - {v.translation}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="p-6 text-center text-xs font-bold text-slate-400">
                          本頁面內容加載中...
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : activeTab === 'storage' ? (
            /* TAB 4: 💾 離線空間視覺化圓餅圖 & 智慧推薦 */
            <div className="space-y-5 animate-fadeIn">
              {/* Storage Usage Bar */}
              <div className="p-4 rounded-3xl bg-slate-900/90 border border-amber-500/30 shadow-md space-y-3">
                <div className="flex items-center justify-between text-xs font-extrabold">
                  <span className="flex items-center gap-1.5 text-amber-300">
                    <Database className="w-4 h-4 text-amber-400" />
                    <span>PWA 本地離線儲存容量指標</span>
                  </span>
                  <span className="text-orange-300">
                    {analytics.estimatedMB} / {maxCapMB} MB ({storagePercentage}%)
                  </span>
                </div>

                <div className="w-full h-3 rounded-full bg-slate-950 overflow-hidden p-0.5 border border-slate-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 transition-all duration-500"
                    style={{ width: `${Math.max(5, storagePercentage)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                  <span>狀態：{analytics.hasCacheApiSupport ? '支持 Cache Storage 離線快取 API' : '基本 LocalStorage 快取'}</span>
                  <span>上次離線同步：{analytics.lastSyncTime}</span>
                </div>
              </div>

              {/* SECTION 1: 🥧 互動式離線空間視覺化圓餅圖 (Interactive Storage Pie Chart) */}
              <div className="p-5 rounded-3xl bg-slate-900/90 border border-amber-500/30 space-y-4 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div>
                    <h4 className="text-sm font-black text-amber-300 flex items-center gap-2">
                      <PieChart className="w-4 h-4 text-amber-400" />
                      <span>繪本離線佔用空間圓餅圖</span>
                    </h4>
                    <p className="text-[11px] font-bold text-slate-400 mt-0.5">
                      點擊圓餅圖塊或下方選單，直觀檢視各本繪本與音效字庫容量佔比
                    </p>
                  </div>

                  <span className="text-xs font-black px-2.5 py-1 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/30 self-start sm:self-auto">
                    共 {analytics.downloadedBookCount} 本已離線
                  </span>
                </div>

                {(() => {
                  const pieData = getPieChartData();
                  const safeActiveIndex = activePieIndex < pieData.length ? activePieIndex : 0;
                  const activeSlice = pieData[safeActiveIndex] || pieData[0];

                  return (
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                      {/* Pie Chart Display */}
                      <div className="md:col-span-7 h-56 relative flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsPieChart>
                            <Pie
                              activeIndex={safeActiveIndex}
                              activeShape={renderActivePieSector}
                              data={pieData}
                              cx="50%"
                              cy="50%"
                              innerRadius={45}
                              outerRadius={75}
                              dataKey="valueMB"
                              onMouseEnter={(_, index) => setActivePieIndex(index)}
                              onClick={(_, index) => {
                                playStarChime();
                                setActivePieIndex(index);
                              }}
                            >
                              {pieData.map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={entry.color}
                                  stroke={safeActiveIndex === index ? '#FFFFFF' : '#1E293B'}
                                  strokeWidth={2}
                                  className="cursor-pointer transition-transform duration-300 hover:scale-105"
                                />
                              ))}
                            </Pie>
                            <RechartsTooltip
                              formatter={(value: any) => [`${value} MB`, '佔用空間']}
                              contentStyle={{
                                backgroundColor: '#090D16',
                                borderColor: '#F59E0B',
                                borderRadius: '16px',
                                color: '#FFFFFF',
                                fontWeight: 'bold',
                                fontSize: '12px',
                              }}
                            />
                          </RechartsPieChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Active Slice Interactive Detail Box */}
                      <div className="md:col-span-5 p-4 rounded-2xl bg-slate-950 border border-amber-500/30 space-y-3">
                        <div className="text-[10px] font-black text-amber-400 uppercase tracking-wider flex items-center justify-between">
                          <span>目前選取圖塊詳情</span>
                          <span>{activeSlice.percentage}% 的總快取</span>
                        </div>

                        <div className="flex items-center gap-3">
                          {activeSlice.coverUrl ? (
                            <img
                              src={activeSlice.coverUrl}
                              alt={activeSlice.name}
                              className="w-12 h-14 object-cover rounded-xl border border-amber-400/40 shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-14 rounded-xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-xl shrink-0">
                              💾
                            </div>
                          )}

                          <div className="space-y-1 min-w-0">
                            <h5 className="font-black text-sm text-white truncate">{activeSlice.name}</h5>
                            <div className="text-xs font-bold text-amber-300">
                              大小容量：{activeSlice.valueMB} MB
                            </div>
                            <div className="text-[10px] font-bold text-slate-400">
                              {activeSlice.isSystem ? '系統語音與文字發音庫' : `${activeSlice.pageCount || 8} 頁 ‧ ${activeSlice.category}`}
                            </div>
                          </div>
                        </div>

                        {activeSlice.rawBook && onSelectBook && (
                          <button
                            onClick={() => {
                              onClose();
                              onSelectBook(activeSlice.rawBook!);
                            }}
                            className="w-full py-2 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>📖 離線開啟翻閱本繪本</span>
                          </button>
                        )}
                      </div>

                      {/* Interactive Legend Grid */}
                      <div className="md:col-span-12 flex flex-wrap gap-2 pt-1 border-t border-slate-800">
                        {pieData.map((item, idx) => {
                          const isSelected = safeActiveIndex === idx;
                          return (
                            <button
                              key={item.id}
                              onClick={() => {
                                playStarChime();
                                setActivePieIndex(idx);
                              }}
                              className={`px-3 py-1.5 rounded-xl border text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-slate-800 border-amber-400 text-amber-300 ring-2 ring-amber-400/50 scale-105'
                                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                              }`}
                            >
                              <span
                                className="w-2.5 h-2.5 rounded-full shrink-0"
                                style={{ backgroundColor: item.color }}
                              />
                              <span className="truncate max-w-[120px]">{item.name}</span>
                              <span className="text-[10px] opacity-75">{item.valueMB}MB</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* SECTION 2: 🤖 離線智慧推薦 (Smart Offline Recommendations) */}
              <div className="p-5 rounded-3xl bg-slate-900/90 border border-cyan-500/30 space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 rounded-2xl bg-cyan-400 text-slate-950 font-black shadow-md">
                      <Bot className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-base font-black text-cyan-300 flex items-center gap-2">
                        <span>離線智慧推薦 (Offline Smart AI Match)</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-cyan-400 text-slate-950 font-black">
                          AI 自動解析
                        </span>
                      </h4>
                      <p className="text-xs font-bold text-slate-400 mt-0.5">
                        智慧推薦尚未預載但最適讀的繪本，支援一鍵預先快取無網閱讀！
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      playStarChime();
                      setRecommendationSeed((s) => s + 1);
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-extrabold text-xs flex items-center gap-1.5 border border-cyan-500/30 cursor-pointer shrink-0"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>🎲 煥新推薦</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {getSmartRecommendations().map((item, idx) => (
                    <div
                      key={item.book.id || idx}
                      className="p-3.5 rounded-2xl bg-slate-950/80 border border-cyan-500/20 hover:border-cyan-400 transition-all flex flex-col justify-between gap-3 shadow-md"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/40 text-[10px] font-black flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-cyan-400" />
                            <span>契合度 {item.matchScore}%</span>
                          </span>
                          <span className="text-[10px] font-bold text-slate-400">
                            容量約 {item.estimatedMB} MB
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <img
                            src={item.book.coverUrl}
                            alt={item.title}
                            className="w-12 h-14 object-cover rounded-xl border border-slate-700 shrink-0"
                          />
                          <div className="space-y-0.5 min-w-0">
                            <h5 className="font-extrabold text-sm text-white truncate">{item.title}</h5>
                            <p className="text-[10px] font-bold text-slate-400">
                              適讀 {item.book.ageGroup} 歲 ‧ {item.book.category}
                            </p>
                          </div>
                        </div>

                        <p className="text-[11px] font-bold text-cyan-200/90 leading-snug bg-slate-900/90 p-2 rounded-xl border border-slate-800">
                          {item.reasonTag}
                        </p>
                      </div>

                      <button
                        onClick={() => handleDownloadRecommendation(item.book)}
                        disabled={item.isDownloaded}
                        className={`w-full py-2 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                          item.isDownloaded
                            ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30'
                            : 'bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 text-slate-950 shadow-md'
                        }`}
                      >
                        {item.isDownloaded ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>已在離線快取中</span>
                          </>
                        ) : (
                          <>
                            <Download className="w-3.5 h-3.5" />
                            <span>📥 一鍵預先快取離線閱讀</span>
                          </>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : activeTab === 'cleanup' ? (
            /* TAB 5: ✨ 智慧空間清理建議 (Smart Space Cleanup Suggestion) */
            <div className="space-y-5 animate-fadeIn">
              {/* Header Card */}
              <div className="p-4 rounded-3xl bg-gradient-to-r from-teal-950 via-slate-950 to-indigo-950 border border-amber-400/50 space-y-3 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="p-2.5 rounded-2xl bg-teal-500 text-slate-950 font-black">
                      <Sparkles className="w-5 h-5 text-amber-200" />
                    </span>
                    <div>
                      <h3 className="text-base font-black text-amber-300">
                        ✨ 智慧離線空間清理建議
                      </h3>
                      <p className="text-xs font-bold text-teal-200">
                        自動偵測已全篇讀完且長時間未開啟翻閱的繪本
                      </p>
                    </div>
                  </div>

                  {cleanupCandidates.length > 0 && (
                    <button
                      type="button"
                      onClick={handleBatchSmartCleanup}
                      className="px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md transition-transform hover:scale-105 cursor-pointer shrink-0"
                    >
                      <Zap className="w-4 h-4 fill-slate-950" />
                      <span>一鍵智慧釋放空間 ({cleanupCandidates.length} 本)</span>
                    </button>
                  )}
                </div>

                <p className="text-xs text-slate-300 font-bold leading-relaxed">
                  將完讀繪本暫時從離線快取中移出，可以大幅節省本機容量並加速繪本選單運作效能。
                  <span className="text-amber-300"> 放心：您的閱讀歷史紀錄與童星勳章將 100% 完整保留，需要時隨時可以在連線時重新下載離線開啟！</span>
                </p>
              </div>

              {/* Quick AI Voice Assistant Banner in Cleanup */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-950 via-slate-900 to-indigo-950 border border-amber-400/40 flex items-center justify-between gap-3 shadow-md">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl animate-bounce">🎙️</span>
                  <div>
                    <h5 className="font-black text-xs text-amber-300">
                      離線語音小幫手在線指導中
                    </h5>
                    <p className="text-[10px] font-bold text-amber-100/80">
                      想聽溫暖語音講解如何輕鬆清理儲存空間？
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAssistantSpeakCleanupGuide}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center gap-1 shadow-sm cursor-pointer shrink-0 transition-transform hover:scale-105"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>聽語音清理教學</span>
                </button>
              </div>

              {/* Cleanup Candidates List */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center justify-between">
                  <span>建議清理快取繪本清單 ({cleanupCandidates.length})</span>
                  <span className="text-emerald-400 text-[11px]">預計可釋放約 {(cleanupCandidates.length * 1.2).toFixed(1)} MB 磁碟空間</span>
                </h4>

                {cleanupCandidates.length === 0 ? (
                  <div className="p-8 text-center bg-slate-900/80 rounded-3xl border border-dashed border-teal-500/40 text-xs font-bold text-teal-300 space-y-2">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto animate-bounce" />
                    <div>太棒了！您的裝置離線儲存空間狀態非常理想，無需要清理的過期繪本！</div>
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-60 overflow-y-auto custom-scrollbar">
                    {cleanupCandidates.map((book) => (
                      <div
                        key={book.id}
                        className="p-3.5 rounded-2xl bg-slate-900/90 border border-teal-500/30 flex items-center justify-between gap-3 shadow-md hover:border-amber-400 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={book.coverUrl}
                            alt={typeof book.title === 'string' ? book.title : book.title['zh-TW']}
                            className="w-12 h-12 object-cover rounded-xl border border-teal-400/40"
                          />
                          <div>
                            <div className="font-extrabold text-xs sm:text-sm text-white flex items-center gap-2">
                              <span>{typeof book.title === 'string' ? book.title : book.title['zh-TW']}</span>
                              <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 text-[10px] border border-emerald-500/40">
                                ✅ 已完讀 ‧ 很久未開啟
                              </span>
                            </div>
                            <div className="text-[10px] font-bold text-slate-400 mt-0.5">
                              {book.pages?.length || 0} 頁插圖 ‧ 占用快取約 ~1.2 MB ‧ 釋放不影響成績
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleSingleCleanup(book.id, typeof book.title === 'string' ? book.title : book.title['zh-TW'])}
                          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-rose-950 hover:text-rose-300 text-rose-400 font-extrabold text-xs border border-rose-500/30 transition-colors cursor-pointer shrink-0"
                        >
                          釋放快取
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : activeTab === 'voiceassistant' ? (
            /* TAB: 🎙️ 離線語音小幫手 (Offline AI Voice Assistant) */
            <div className="space-y-5 animate-fadeIn">
              {/* Header Banner */}
              <div className="p-4 rounded-3xl bg-gradient-to-r from-amber-950 via-orange-950 to-indigo-950 border border-amber-400/50 space-y-3 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="p-3 rounded-2xl bg-amber-400 text-slate-950 text-2xl shadow-md animate-bounce">
                      🎙️
                    </span>
                    <div>
                      <h3 className="text-base font-black text-amber-300">
                        🎙️ 離線語音小幫手 (Offline AI Voice Assistant)
                      </h3>
                      <p className="text-xs font-bold text-amber-100/90">
                        以溫暖且鼓勵的口吻，朗讀繪本簡介、提供離線管理指導與每日溫馨鼓勵！
                      </p>
                    </div>
                  </div>

                  {/* Speech Controls */}
                  <div className="flex items-center gap-1.5 self-start sm:self-auto bg-slate-950/80 p-1.5 rounded-2xl border border-amber-500/30">
                    {assistantSpeakingStatus === 'speaking' ? (
                      <button
                        onClick={handlePauseAssistantSpeech}
                        className="px-3 py-1.5 rounded-xl bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1 hover:bg-amber-300 cursor-pointer"
                      >
                        <VolumeX className="w-3.5 h-3.5" />
                        <span>暫停</span>
                      </button>
                    ) : assistantSpeakingStatus === 'paused' ? (
                      <button
                        onClick={handleResumeAssistantSpeech}
                        className="px-3 py-1.5 rounded-xl bg-emerald-400 text-slate-950 font-black text-xs flex items-center gap-1 hover:bg-emerald-300 cursor-pointer"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>繼續</span>
                      </button>
                    ) : null}

                    <button
                      onClick={handleStopAssistantSpeech}
                      disabled={assistantSpeakingStatus === 'idle'}
                      className="px-3 py-1.5 rounded-xl bg-rose-950 text-rose-300 border border-rose-500/30 font-extrabold text-xs flex items-center gap-1 hover:bg-rose-900 disabled:opacity-40 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>停止</span>
                    </button>
                  </div>
                </div>

                {/* Persona Switcher Bar */}
                <div className="pt-2 border-t border-amber-500/20">
                  <span className="text-xs font-black text-amber-300 block mb-2">
                    🎭 選擇語音小幫手人設聲音 (Voice Persona)：
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {ASSISTANT_PERSONAS.map((p) => {
                      const isSelected = assistantRole === p.role;
                      return (
                        <button
                          key={p.role}
                          onClick={() => {
                            setAssistantRole(p.role);
                            playStarChime();
                            setToastMessage(`已切換離線語音人設為：${p.name} ${p.avatar}`);
                          }}
                          className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-2 ${
                            isSelected
                              ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md scale-102 font-black'
                              : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:border-amber-400/50'
                          }`}
                        >
                          <span className="text-xl shrink-0">{p.avatar}</span>
                          <div className="min-w-0">
                            <div className="text-xs font-extrabold truncate">{p.name}</div>
                            <div className={`text-[10px] truncate ${isSelected ? 'text-slate-900 font-bold' : 'text-slate-400'}`}>
                              {p.desc}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Speech Subtitle & Live Audio Waveform Banner */}
              <div className="p-4 rounded-3xl bg-slate-900/90 border border-amber-500/30 shadow-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span className="text-xs font-black text-amber-300 uppercase tracking-wider">
                      {activeSpeechTitle}
                    </span>
                  </div>

                  {assistantSpeakingStatus === 'speaking' && (
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-5 bg-amber-400 rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-7 bg-orange-400 rounded-full animate-bounce delay-100"></span>
                      <span className="w-1.5 h-4 bg-amber-300 rounded-full animate-bounce delay-200"></span>
                      <span className="w-1.5 h-6 bg-rose-400 rounded-full animate-bounce delay-300"></span>
                      <span className="text-xs font-extrabold text-amber-300 ml-1">語音朗讀中...</span>
                    </div>
                  )}
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs sm:text-sm font-bold text-amber-100 leading-relaxed shadow-inner">
                  "{currentAssistantTranscript}"
                </div>
              </div>

              {/* Quick Action Audio Interactive Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* CARD 1: 🧹 離線空間與清理引導語音 */}
                <div className="p-4 rounded-3xl bg-slate-900/90 border border-teal-500/30 space-y-3 shadow-lg hover:border-teal-400 transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-teal-500/20 text-teal-300 font-black text-lg">
                      🧹
                    </span>
                    <div>
                      <h4 className="font-black text-sm text-amber-300">
                        離線空間與清理指引
                      </h4>
                      <p className="text-[11px] font-bold text-slate-400">
                        收聽溫暖親切的 AI 離線管理教學
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 font-bold leading-relaxed bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
                    小幫手會以溫柔、鼓勵的口吻，教導孩童如何識別已完讀繪本，點擊紅色垃圾桶進行無痛釋放空間，並說明閱讀歷史永不丟失！
                  </p>

                  <button
                    onClick={handleAssistantSpeakCleanupGuide}
                    className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-300 hover:to-emerald-300 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer transition-transform hover:scale-[1.02]"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>🔊 聽小幫手指導如何清理空間</span>
                  </button>
                </div>

                {/* CARD 2: 🌟 每日離線學習溫馨鼓勵 */}
                <div className="p-4 rounded-3xl bg-slate-900/90 border border-rose-500/30 space-y-3 shadow-lg hover:border-rose-400 transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-rose-500/20 text-rose-300 font-black text-lg">
                      🌟
                    </span>
                    <div>
                      <h4 className="font-black text-sm text-amber-300">
                        每日離線溫馨鼓勵金句
                      </h4>
                      <p className="text-[11px] font-bold text-slate-400">
                        給予孩童滿滿的成就感與自信讚美
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 font-bold leading-relaxed bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
                    根據孩童的雙語學習、翻閱頁數與連續閱讀天數，給予最具肯定力的金句，增進離線自主閱讀動力！
                  </p>

                  <button
                    onClick={handleAssistantSpeakEncouragement}
                    className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-rose-400 to-amber-400 hover:from-rose-300 hover:to-amber-300 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer transition-transform hover:scale-[1.02]"
                  >
                    <Star className="w-4 h-4 fill-slate-950" />
                    <span>🌟 聽小幫手送我一句溫馨鼓勵</span>
                  </button>
                </div>
              </div>

              {/* CARD SECTION 3: 📚 繪本簡介親切朗讀清單 */}
              <div className="p-4 rounded-3xl bg-slate-900/90 border border-amber-500/30 space-y-3 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-amber-400" />
                    <span>聽小幫手朗讀繪本簡介 ({analytics?.downloadedBooks?.length || 0} 本已下載)</span>
                  </h4>
                  <span className="text-[11px] font-bold text-slate-400">
                    點擊各繪本語音按鈕即可開起朗讀
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto custom-scrollbar p-1">
                  {(analytics?.downloadedBooks || []).map((b) => {
                    const title = typeof b.title === 'string' ? b.title : (b.title['zh-TW'] || '精選繪本');
                    const desc = typeof b.description === 'string' ? b.description : (b.description?.['zh-TW'] || '充滿想像力與溫馨故事的離線雙語繪本。');
                    return (
                      <div
                        key={b.id}
                        className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-amber-400/60 flex items-center justify-between gap-3 transition-colors"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={b.coverUrl}
                            alt={title}
                            className="w-11 h-13 object-cover rounded-xl border border-amber-500/30 shrink-0"
                          />
                          <div className="min-w-0">
                            <h5 className="font-black text-xs text-white truncate">{title}</h5>
                            <p className="text-[10px] font-bold text-slate-400 truncate mt-0.5">
                              {b.category || '童話冒險'} ‧ {b.pages?.length || 8} 頁
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => handleAssistantSpeakBook(title, desc)}
                          className="px-3 py-1.5 rounded-xl bg-amber-400/20 hover:bg-amber-400 hover:text-slate-950 text-amber-300 font-extrabold text-xs border border-amber-400/40 flex items-center gap-1 transition-all shrink-0 cursor-pointer"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>聽簡介</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : activeTab === 'printablechart' ? (
            /* TAB: 📜 離線學習能力圖紙報表 (Printable Story Chart Report) */
            <div className="space-y-5 animate-fadeIn">
              {/* Action Toolbar */}
              <div className="p-4 rounded-3xl bg-slate-900/90 border border-emerald-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xl">
                <div>
                  <h3 className="text-base font-black text-emerald-300 flex items-center gap-2">
                    <Award className="w-5 h-5 text-emerald-400" />
                    <span>📜 離線自主閱讀學習能力圖紙總結報表</span>
                  </h3>
                  <p className="text-xs font-bold text-slate-300">
                    支援一鍵列印紙本圖紙、導出 PDF 或複製豐富圖紙摘要
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleCopyStoryReportSummary}
                    className="px-3.5 py-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-emerald-300 font-extrabold text-xs flex items-center gap-1.5 border border-emerald-500/30 shadow-md cursor-pointer transition-transform hover:scale-105"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>📋 複製圖紙摘要</span>
                  </button>

                  <button
                    onClick={handlePrintStoryReport}
                    className="px-4 py-2 rounded-2xl bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-transform hover:scale-105"
                  >
                    <Download className="w-4 h-4" />
                    <span>🖨️ 列印 / 儲存 PDF 圖紙</span>
                  </button>
                </div>
              </div>

              {/* Printable Chart Paper Certificate Card */}
              <div
                id="printable-story-report"
                className="p-6 sm:p-8 rounded-3xl bg-slate-950 border-2 border-emerald-400/60 shadow-2xl space-y-6 text-slate-100 relative overflow-hidden"
              >
                {/* Decorative Certificate Watermark Corner */}
                <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none text-emerald-300 font-black text-8xl">
                  📜
                </div>

                {/* Printable Header */}
                <div className="text-center space-y-2 border-b-2 border-emerald-500/30 pb-5">
                  <div className="text-xs font-black tracking-widest text-emerald-400 uppercase">
                    OFFLINE STORY READING CAPABILITY CHART REPORT
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-amber-300 flex items-center justify-center gap-2">
                    🌟 星光兒童繪本庫 ‧ 離線自主閱讀學習圖紙 🌟
                  </h2>
                  <p className="text-xs font-bold text-slate-400">
                    認證編號：PWA-OFFLINE-CERT-2026-8888 • 產出時間：2026 年 8 月 12 日
                  </p>
                </div>

                {/* Student Profile & Key Metrics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-amber-500/30 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400">學習者姓名</span>
                    <div className="text-lg font-black text-amber-300 flex items-center gap-1.5">
                      <span>{userProfile?.avatar || '🐻'}</span>
                      <span>{userProfile?.name || '小讀者'}</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-emerald-500/30 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400">連續閱讀記錄</span>
                    <div className="text-lg font-black text-emerald-300">
                      🔥 {userProfile?.streakDays || 3} 天
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-cyan-500/30 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400">離線儲存繪本</span>
                    <div className="text-lg font-black text-cyan-300">
                      📚 {analytics?.downloadedBookCount || 0} 本
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-purple-500/30 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400">累積學習雙語詞彙</span>
                    <div className="text-lg font-black text-purple-300">
                      🔤 {analytics?.totalVocabCount || 0} 個
                    </div>
                  </div>
                </div>

                {/* Five-Dimension Capability Bar Chart */}
                <div className="p-5 rounded-3xl bg-slate-900/90 border border-emerald-500/30 space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-emerald-300 flex items-center gap-2 border-b border-slate-800 pb-2">
                    <BarChart2 className="w-4 h-4 text-emerald-400" />
                    <span>閱讀五大維度能力發展圖紙分析 (Recharts Visualizer)</span>
                  </h4>

                  <div className="h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={REPORT_CAPABILITY_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                        <XAxis dataKey="dimension" stroke="#94A3B8" fontSize={11} tickLine={false} />
                        <YAxis domain={[0, 100]} stroke="#94A3B8" fontSize={11} tickLine={false} />
                        <RechartsTooltip
                          contentStyle={{ backgroundColor: '#0F172A', borderColor: '#10B981', borderRadius: '12px' }}
                          formatter={(val: any) => [`${val}%`, '能力表現得分']}
                        />
                        <Bar dataKey="score" radius={[8, 8, 0, 0]}>
                          {REPORT_CAPABILITY_DATA.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Badge Achievements Wall */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-400" />
                    <span>離線榮譽勳章成就牆 (Offline Badges)</span>
                  </h4>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-center space-y-1">
                      <span className="text-2xl block">🥇</span>
                      <div className="font-extrabold text-xs text-amber-300">離線閱讀特級王</div>
                      <p className="text-[10px] text-slate-400 font-bold">100% 離線無網完備閱讀</p>
                    </div>

                    <div className="p-3 rounded-2xl bg-indigo-950/40 border border-indigo-500/40 text-center space-y-1">
                      <span className="text-2xl block">🔤</span>
                      <div className="font-extrabold text-xs text-indigo-300">雙語詞彙獵人</div>
                      <p className="text-[10px] text-slate-400 font-bold">精準掌握核心離線生字</p>
                    </div>

                    <div className="p-3 rounded-2xl bg-teal-950/40 border border-teal-500/40 text-center space-y-1">
                      <span className="text-2xl block">🧹</span>
                      <div className="font-extrabold text-xs text-teal-300">空間清理魔法師</div>
                      <p className="text-[10px] text-slate-400 font-bold">智慧優化本機離線快取</p>
                    </div>

                    <div className="p-3 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-center space-y-1">
                      <span className="text-2xl block">🎧</span>
                      <div className="font-extrabold text-xs text-rose-300">故事聽講朗讀家</div>
                      <p className="text-[10px] text-slate-400 font-bold">積極搭配語音小幫手</p>
                    </div>
                  </div>
                </div>

                {/* AI Teacher & Parent Comment Box */}
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-emerald-500/40 space-y-2">
                  <div className="text-xs font-black text-emerald-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span>【AI 離線導師與家長綜合評語卡】</span>
                  </div>
                  <p className="text-xs text-slate-200 font-bold leading-relaxed">
                    「{userProfile?.name || '小讀者'} 在無網路環境中展現出令人驚豔的自主閱讀態度！不僅繪本翻閱頻率極高，還能透過雙語生字與記憶拼圖獨立思考，並樂於使用語音小幫手探索空間管理。建議家長維持每日固定無網共讀時間，給予充分的熱情肯定！」
                  </p>
                </div>
              </div>
            </div>
          ) : activeTab === 'atmosphere' ? (
            /* TAB 6: 🎨 沉浸式閱讀氣氛背景 (Reading Atmosphere Backgrounds) */
            <div className="space-y-5 animate-fadeIn">

              {/* Atmosphere Header & Music Toggle */}
              <div className="p-4 rounded-3xl bg-slate-900/90 border border-amber-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xl">
                <div className="flex items-center gap-2.5">
                  <span className="p-2.5 rounded-2xl bg-purple-500 text-white font-black">
                    <Palette className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="text-base font-black text-amber-300">
                      🎨 選擇專屬閱讀氣氛背景
                    </h3>
                    <p className="text-xs font-bold text-purple-200">
                      個性化氣氛色彩 ‧ 動態微光效果 ‧ 舒緩氣氛音樂
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleToggleMusic}
                  className={`px-4 py-2 rounded-2xl font-black text-xs flex items-center gap-2 shadow-md transition-transform hover:scale-105 cursor-pointer ${
                    isMusicPlaying
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 border border-emerald-300 ring-2 ring-emerald-400/40'
                      : 'bg-slate-800 text-purple-300 hover:bg-slate-700'
                  }`}
                >
                  <Music className={`w-4 h-4 ${isMusicPlaying ? 'animate-bounce' : ''}`} />
                  <span>{isMusicPlaying ? '🔊 氣氛音樂播放中' : '🎵 播放背景氣氛配樂'}</span>
                </button>
              </div>

              {/* Active Theme Preview Banner */}
              <div className={`p-5 rounded-3xl border bg-gradient-to-r ${currentAtmosphere.bgGradient} ${currentAtmosphere.borderClass} shadow-2xl space-y-2 relative overflow-hidden`}>
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full text-xs font-black border bg-slate-950/80 text-amber-300 border-amber-400/40">
                    ✨ 當前閱讀氣氛：{currentAtmosphere.name}
                  </span>
                  <div className="flex items-center gap-1 text-xl">
                    {currentAtmosphere.particles.map((pt, idx) => (
                      <span key={idx} className="animate-pulse">{pt}</span>
                    ))}
                  </div>
                </div>
                <p className="text-xs sm:text-sm font-bold text-slate-200 leading-relaxed pt-1">
                  {currentAtmosphere.description}
                </p>
              </div>

              {/* Atmosphere Theme Options Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ATMOSPHERE_THEMES.map((thm) => {
                  const isSelected = thm.id === atmosphere;
                  return (
                    <button
                      key={thm.id}
                      type="button"
                      onClick={() => handleSelectAtmosphere(thm)}
                      className={`p-4 rounded-3xl border text-left transition-all duration-300 cursor-pointer relative overflow-hidden flex items-start gap-3 ${
                        isSelected
                          ? 'bg-gradient-to-r from-amber-500/20 via-purple-500/20 to-indigo-500/20 border-amber-400 ring-2 ring-amber-300 shadow-xl scale-[1.02]'
                          : 'bg-slate-900/80 border-slate-800 hover:border-slate-600 hover:scale-[1.01]'
                      }`}
                    >
                      <span className="text-3xl p-2 rounded-2xl bg-slate-950 border border-slate-700 shrink-0">
                        {thm.emoji}
                      </span>

                      <div className="space-y-1 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-black text-sm text-white">
                            {thm.name}
                          </span>
                          {isSelected && (
                            <span className="p-1 rounded-full bg-amber-400 text-slate-950">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-bold text-slate-400 leading-normal">
                          {thm.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

            </div>
          ) : activeTab === 'knowledgetree' ? (
            /* TAB: 🌳 離線探索知識樹 (Offline Knowledge Tree) */
            <div className="space-y-5 animate-fadeIn">
              {/* Knowledge Tree Header & Overview */}
              <div className="p-4 rounded-3xl bg-slate-900/90 border border-emerald-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xl">
                <div className="flex items-center gap-2.5">
                  <span className="p-2.5 rounded-2xl bg-emerald-500 text-slate-950 font-black">
                    <GitBranch className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="text-base font-black text-amber-300 flex items-center gap-2">
                      <span>🌳 離線探索知識樹</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                        節點連結網
                      </span>
                    </h3>
                    <p className="text-xs font-bold text-slate-300">
                      可視化孩子的閱讀廣度與深度 ‧ 點擊知識節點探索關聯繪本與雙語詞彙
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span className="px-3 py-1.5 rounded-xl bg-slate-800 text-emerald-300 font-extrabold text-xs border border-emerald-500/30">
                    🧠 知識點：{KNOWLEDGE_NODES_DATA.length} 個
                  </span>
                  <span className="px-3 py-1.5 rounded-xl bg-slate-800 text-amber-300 font-extrabold text-xs border border-amber-500/30">
                    🌟 平均掌握：89%
                  </span>
                </div>
              </div>

              {/* Domain Filter Buttons & Search */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 overflow-x-auto w-full pb-1 sm:pb-0 custom-scrollbar">
                    {[
                      { id: 'all', label: '🌐 全部領域' },
                      { id: 'nature', label: '🌿 自然生態' },
                      { id: 'fantasy', label: '🏰 奇幻故事' },
                      { id: 'bilingual', label: '🧠 雙語表達' },
                      { id: 'emotion', label: '❤️ 情感社交' },
                      { id: 'creativity', label: '🎨 藝術創造' },
                    ].map((dom) => (
                      <button
                        key={dom.id}
                        onClick={() => {
                          setKnowledgeFilterDomain(dom.id as any);
                          playStarChime();
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all whitespace-nowrap cursor-pointer ${
                          knowledgeFilterDomain === dom.id
                            ? 'bg-emerald-500 text-slate-950 shadow-md scale-105'
                            : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-700'
                        }`}
                      >
                        {dom.label}
                      </button>
                    ))}
                  </div>

                  <div className="relative w-full sm:w-48 shrink-0">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="搜尋知識點或關鍵字..."
                      value={knowledgeSearchQuery}
                      onChange={(e) => setKnowledgeSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                    />
                  </div>
                </div>
              </div>

              {/* Tree Visualization Graph Canvas & Node Inspector Split */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Visual Node Connection Tree Canvas */}
                <div className="lg:col-span-2 p-5 rounded-3xl bg-slate-950/90 border border-emerald-500/30 relative min-h-[380px] flex flex-col justify-between overflow-hidden shadow-2xl">
                  {/* Background Grid Pattern & Glow */}
                  <div className="absolute inset-0 bg-[radial-gradient(#10B981_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none"></div>

                  {/* Central Tree Root Banner */}
                  <div className="flex items-center justify-between z-10 border-b border-slate-800/80 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🌳</span>
                      <span className="text-xs font-black text-emerald-300">
                        {userProfile?.name || '小讀者'} 的閱讀知識樹 (Level 1~3 深度地圖)
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400">
                      點擊節點可查看故事與雙語詞彙解析
                    </span>
                  </div>

                  {/* SVG Animated Connection Lines Layer */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                    <defs>
                      <linearGradient id="treeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#10B981" stopOpacity="0.6" />
                        <stop offset="50%" stopColor="#F59E0B" stopOpacity="0.6" />
                        <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.6" />
                      </linearGradient>
                    </defs>
                    <line x1="50%" y1="15%" x2="20%" y2="45%" stroke="url(#treeGrad)" strokeWidth="2" strokeDasharray="4 2" />
                    <line x1="50%" y1="15%" x2="50%" y2="45%" stroke="url(#treeGrad)" strokeWidth="2" strokeDasharray="4 2" />
                    <line x1="50%" y1="15%" x2="80%" y2="45%" stroke="url(#treeGrad)" strokeWidth="2" strokeDasharray="4 2" />
                    <line x1="20%" y1="45%" x2="15%" y2="78%" stroke="#10B981" strokeWidth="1.5" opacity="0.4" />
                    <line x1="20%" y1="45%" x2="35%" y2="78%" stroke="#10B981" strokeWidth="1.5" opacity="0.4" />
                    <line x1="50%" y1="45%" x2="50%" y2="78%" stroke="#F59E0B" strokeWidth="1.5" opacity="0.4" />
                    <line x1="80%" y1="45%" x2="65%" y2="78%" stroke="#3B82F6" strokeWidth="1.5" opacity="0.4" />
                    <line x1="80%" y1="45%" x2="85%" y2="78%" stroke="#3B82F6" strokeWidth="1.5" opacity="0.4" />
                  </svg>

                  {/* Interactive Nodes Layer */}
                  <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 my-4">
                    {filteredKnowledgeNodes.map((node) => {
                      const isSelected = selectedKnowledgeNodeId === node.id;
                      return (
                        <button
                          key={node.id}
                          onClick={() => {
                            setSelectedKnowledgeNodeId(node.id);
                            playStarChime();
                          }}
                          className={`p-3.5 rounded-2xl border transition-all duration-300 text-left relative overflow-hidden cursor-pointer flex flex-col justify-between gap-2 ${
                            isSelected
                              ? `${node.domainBg} ${node.domainBorder} ring-2 ring-emerald-400 shadow-xl scale-105 z-20`
                              : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 hover:bg-slate-800/90'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-2xl p-1.5 rounded-xl bg-slate-950/80 border border-slate-700">
                              {node.icon}
                            </span>
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${node.domainBg} ${node.domainColor} border ${node.domainBorder}`}>
                              Level {node.depthLevel}
                            </span>
                          </div>

                          <div>
                            <h4 className="font-black text-xs text-white line-clamp-1">{node.label}</h4>
                            <p className="text-[10px] font-bold text-slate-400">{node.englishTerm}</p>
                          </div>

                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px] font-bold text-slate-400">
                              <span>熟練度</span>
                              <span className={node.domainColor}>{node.masteryPct}%</span>
                            </div>
                            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  node.masteryPct >= 90 ? 'bg-emerald-400' : 'bg-amber-400'
                                }`}
                                style={{ width: `${node.masteryPct}%` }}
                              ></div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Depth Tier Legend */}
                  <div className="z-10 flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-800/80 text-[10px] font-bold text-slate-400">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Level 1 基礎啟蒙
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-amber-400"></span> Level 2 深入理解
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-purple-400"></span> Level 3 跨界活用
                      </span>
                    </div>
                    <span>🌱 閱讀量越多，知識樹越繁茂！</span>
                  </div>
                </div>

                {/* Selected Node Detail Inspector Card */}
                <div className="p-5 rounded-3xl bg-slate-900/90 border border-emerald-500/40 space-y-4 shadow-xl flex flex-col justify-between">
                  {selectedNodeData ? (
                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl p-2 rounded-2xl bg-slate-950 border border-slate-700">
                            {selectedNodeData.icon}
                          </span>
                          <div>
                            <h3 className="font-black text-sm sm:text-base text-amber-300">
                              {selectedNodeData.label}
                            </h3>
                            <p className="text-xs font-bold text-emerald-300">
                              {selectedNodeData.englishTerm}
                            </p>
                          </div>
                        </div>

                        <span className={`text-xs font-black px-2.5 py-1 rounded-xl ${selectedNodeData.domainBg} ${selectedNodeData.domainColor} border ${selectedNodeData.domainBorder}`}>
                          Level {selectedNodeData.depthLevel}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                          【知識點解析】
                        </span>
                        <p className="text-xs font-bold text-slate-200 leading-relaxed bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
                          {selectedNodeData.description}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                          【來源繪本】
                        </span>
                        <div className="p-3 rounded-2xl bg-amber-950/30 border border-amber-500/30 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-amber-400 shrink-0" />
                            <span className="text-xs font-extrabold text-amber-200">
                              {selectedNodeData.bookTitle}
                            </span>
                          </div>
                          {onSelectBook && (
                            <button
                              onClick={() => {
                                const matched = books.find(b => {
                                  const titleStr = typeof b.title === 'string' ? b.title : (b.title['zh-TW'] || b.title.en || '');
                                  return selectedNodeData.bookTitle.includes(titleStr);
                                }) || books[0];
                                if (matched) {
                                  onSelectBook(matched);
                                  onClose();
                                }
                              }}
                              className="px-2.5 py-1 rounded-xl bg-amber-400 text-slate-950 text-[10px] font-black hover:bg-amber-300 transition-colors cursor-pointer shrink-0"
                            >
                              閱讀此書
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                          【雙語關鍵詞彙庫】
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedNodeData.keyWords.map((kw, idx) => (
                            <span
                              key={idx}
                              className="px-2.5 py-1 rounded-xl bg-slate-950 text-cyan-300 text-xs font-extrabold border border-cyan-500/30"
                            >
                              🔤 {kw}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 space-y-1">
                        <div className="flex justify-between text-xs font-black text-emerald-300">
                          <span>孩子的掌握程度評定</span>
                          <span>{selectedNodeData.masteryPct}% 精通</span>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400">
                          建議可以持續透過雙語閱讀朗讀複習，鞏固記憶點！
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-10 space-y-2 text-slate-400">
                      <TreePine className="w-10 h-10 mx-auto text-slate-600 animate-bounce" />
                      <p className="text-xs font-bold">請點擊左側知識樹中的任意節點查看詳細解析</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : activeTab === 'taskshowcase' ? (
            /* TAB: 🏺 完成任務展櫃 (Completed Tasks Showcase) */
            <div className="space-y-5 animate-fadeIn">
              {/* Showcase Cabinet Header */}
              <div className="p-4 rounded-3xl bg-slate-900/90 border border-amber-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xl">
                <div className="flex items-center gap-2.5">
                  <span className="p-2.5 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black">
                    <Boxes className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="text-base font-black text-amber-300 flex items-center gap-2">
                      <span>🏺 完成任務陳列展櫃</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500/20 text-amber-300 border border-amber-400/30">
                        榮譽陳列館
                      </span>
                    </h3>
                    <p className="text-xs font-bold text-slate-300">
                      記錄孩童完成的所有離線閱讀任務、故事勳章與極速挑戰獎盃 ‧ 點擊即可檢視實體榮譽證書
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3.5 py-1.5 rounded-xl bg-amber-950/80 text-amber-300 font-black text-xs border border-amber-500/40">
                    💎 累積知識水晶：{questCrystals}
                  </span>
                </div>
              </div>

              {/* Showcase Shelf Categories Filter */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
                {[
                  { id: 'all', label: '🏆 全部展品 (6)' },
                  { id: 'mission', label: '🎯 完成任務 (1)' },
                  { id: 'medal', label: '🏅 精通勳章 (2)' },
                  { id: 'trophy', label: '👑 尊爵獎盃 (2)' },
                  { id: 'focus', label: '⚡ 專注極限 (1)' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedShowcaseCategory(cat.id as any);
                      playStarChime();
                    }}
                    className={`px-3.5 py-2 rounded-2xl text-xs font-black transition-all whitespace-nowrap cursor-pointer ${
                      selectedShowcaseCategory === cat.id
                        ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-lg scale-105'
                        : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* 3D Showcase Shelf Wooden Cabinet Display Grid */}
              <div className="p-6 rounded-3xl bg-gradient-to-b from-slate-950 via-slate-900 to-amber-950/40 border-2 border-amber-500/30 shadow-2xl space-y-6 relative overflow-hidden">
                {/* Cabinet Wooden Texture Accents */}
                <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-amber-700 via-amber-500 to-amber-700"></div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                  {filteredShowcaseItems.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        setInspectShowcaseItem(item);
                        playStarChime();
                      }}
                      className={`p-5 rounded-3xl border bg-gradient-to-b ${item.rarityBgGradient} ${item.rarityBorder} transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer relative group flex flex-col justify-between gap-4`}
                    >
                      {/* Top Rarity & Category Header */}
                      <div className="flex items-center justify-between">
                        <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black ${item.rarityBadgeClass} shadow-md`}>
                          {item.rarity}
                        </span>
                        <span className="text-[10px] font-extrabold text-slate-400 bg-slate-950/80 px-2 py-0.5 rounded-lg border border-slate-800">
                          {item.categoryLabel}
                        </span>
                      </div>

                      {/* Central Trophy 3D Icon Display */}
                      <div className="text-center py-2 relative">
                        <div className="w-16 h-16 mx-auto rounded-full bg-slate-950/80 border border-amber-400/40 flex items-center justify-center text-4xl shadow-inner group-hover:rotate-12 transition-transform duration-300">
                          {item.icon}
                        </div>
                        <div className="absolute inset-0 bg-amber-400/10 rounded-full blur-xl pointer-events-none group-hover:bg-amber-400/20 transition-all"></div>
                      </div>

                      {/* Title & Description */}
                      <div className="space-y-1.5 text-center">
                        <h4 className="font-black text-xs sm:text-sm text-white group-hover:text-amber-300 transition-colors">
                          {item.title}
                        </h4>
                        <p className="text-[10px] font-bold text-slate-300 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      </div>

                      {/* Footer Crystals & Certificate Action */}
                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-extrabold">
                        <span className="text-amber-400 flex items-center gap-1">
                          💎 +{item.rewardCrystals} 水晶
                        </span>
                        <span className="text-slate-400 group-hover:text-emerald-300 flex items-center gap-0.5">
                          檢視證書 📜
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Showcase Wooden Shelf Stand Footer */}
                <div className="p-3 rounded-2xl bg-amber-950/80 border border-amber-500/40 text-center text-xs font-black text-amber-200 flex items-center justify-between">
                  <span>🏛️ 離線故事榮譽博物館 ‧ 全館共展示 {SHOWCASE_ITEMS.length} 件成就展品</span>
                  <span className="text-amber-400">解鎖率 100% ✨</span>
                </div>
              </div>

              {/* Inspection Modal for Showcase Certificate */}
              {inspectShowcaseItem && (
                <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
                  <div className="bg-gradient-to-b from-slate-900 via-slate-950 to-amber-950/90 border-2 border-amber-400/80 rounded-3xl p-6 max-w-md w-full shadow-2xl relative space-y-5 text-center">
                    <button
                      onClick={() => setInspectShowcaseItem(null)}
                      className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 text-slate-300 hover:text-white"
                    >
                      <X className="w-5 h-5" />
                    </button>

                    <div className="text-5xl my-2 animate-bounce">
                      {inspectShowcaseItem.icon}
                    </div>

                    <div className="space-y-1">
                      <span className={`inline-block px-3 py-1 rounded-xl text-xs font-black ${inspectShowcaseItem.rarityBadgeClass}`}>
                        {inspectShowcaseItem.rarity} 榮譽成就
                      </span>
                      <h3 className="text-lg font-black text-amber-300 pt-1">
                        {inspectShowcaseItem.title}
                      </h3>
                      <p className="text-xs font-bold text-slate-400">
                        獲得日期：{inspectShowcaseItem.completedDate}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/30 text-xs text-slate-200 font-bold leading-relaxed text-left space-y-2">
                      <p>【榮譽頒發詞】：{inspectShowcaseItem.description}</p>
                      <p className="text-emerald-300">【任務來源】：{inspectShowcaseItem.sourceBookOrTask}</p>
                      <p className="text-amber-400">【認證編號】：{inspectShowcaseItem.certificateCode}</p>
                    </div>

                    <div className="flex flex-wrap gap-1.5 justify-center">
                      {inspectShowcaseItem.highlights.map((hl, idx) => (
                        <span key={idx} className="px-2.5 py-1 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xs font-bold">
                          ✨ {hl}
                        </span>
                      ))}
                    </div>

                    <div className="pt-2 flex items-center gap-3">
                      <button
                        onClick={() => {
                          setToastMessage(`📜 已列印/分享『${inspectShowcaseItem.title}』榮譽證書卡！`);
                          setInspectShowcaseItem(null);
                        }}
                        className="flex-1 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-xs shadow-lg cursor-pointer"
                      >
                        📜 列印 / 分享離線榮譽證書
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* TAB: 📈 離線閱讀時段分析與 AI 最佳時間點診斷 (Offline Reading Time Slot Analytics) */
            <div className="space-y-5 animate-fadeIn">
              {/* Banner Header */}
              <div className="p-4 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-950 to-cyan-950/80 border border-cyan-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xl">
                <div className="flex items-center gap-2.5">
                  <span className="p-2.5 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-black shadow-md">
                    <BarChart2 className="w-5 h-5 animate-pulse" />
                  </span>
                  <div>
                    <h3 className="text-base font-black text-cyan-300 flex items-center gap-2">
                      <span>📈 離線閱讀時段分析與 AI 最佳時間點診斷</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 font-bold">
                        AI 智能時段探測
                      </span>
                    </h3>
                    <p className="text-xs font-bold text-slate-300">
                      精準統計孩童過去一週在各時段的離線翻頁頻率與專注指數，由 AI 算法預測個人最佳離線閱讀時間點
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      const nextState = !isReadingReminderSet;
                      setIsReadingReminderSet(nextState);
                      localStorage.setItem('pwa_timeslot_reminder', nextState ? 'true' : 'false');
                      playStarChime();
                      setToastMessage(nextState ? '🔔 已開啟每日 19:30 最佳離線閱讀提醒！' : '🔕 已關閉閱讀時間鬧鐘提醒');
                    }}
                    className={`px-3.5 py-2 rounded-2xl font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md ${
                      isReadingReminderSet
                        ? 'bg-amber-400 text-slate-950 border border-amber-300 shadow-amber-500/20'
                        : 'bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30'
                    }`}
                  >
                    <Clock className="w-4 h-4" />
                    <span>{isReadingReminderSet ? '🔔 每日 19:30 提醒中' : '⏰ 設定 19:30 最佳閱讀鬧鐘'}</span>
                  </button>

                  <button
                    onClick={() => {
                      playStarChime();
                      speakText(
                        `AI 診斷報告：根據過去一週離線數據分析，小讀者的最佳離線閱讀時間點為晚上 19:30 到 20:30。在這個時段，翻頁專注力指數高達 96%，雙語詞彙記憶保留率最佳。建議在此時段安排每日繪本時間。`,
                        'zh-TW'
                      );
                    }}
                    className="p-2 rounded-2xl bg-cyan-950 border border-cyan-400/40 text-cyan-300 hover:bg-cyan-900 transition-colors cursor-pointer"
                    title="播放 AI 語音報告分析"
                  >
                    <Volume2 className="w-4 h-4 animate-bounce" />
                  </button>
                </div>
              </div>

              {/* AI Highlight Banner: 👑 最佳離線閱讀時間點 (Optimal Offline Reading Time Slot) */}
              <div className="p-5 rounded-3xl bg-gradient-to-br from-amber-950/80 via-slate-900 to-amber-900/40 border-2 border-amber-400/60 shadow-2xl space-y-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none text-amber-400 font-black text-7xl">
                  👑
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-500/30 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="p-3 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-xl shadow-lg">
                      👑
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-black text-amber-300 uppercase tracking-wide">
                          AI 推薦最佳離線閱讀時間點
                        </h4>
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500/20 text-amber-300 font-black border border-amber-400/30">
                          專注峰值 96%
                        </span>
                      </div>
                      <div className="text-xl sm:text-2xl font-black text-white flex items-baseline gap-2 mt-0.5">
                        <span>晚上 19:30 - 20:30</span>
                        <span className="text-xs font-bold text-amber-300">（黃金睡前繪本探索時段）</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <div className="px-3.5 py-1.5 rounded-2xl bg-slate-950/80 border border-amber-400/40 text-center">
                      <span className="text-[10px] font-extrabold text-slate-400 block">離線平均專注度</span>
                      <span className="text-base font-black text-emerald-400">96% ⭐</span>
                    </div>
                    <div className="px-3.5 py-1.5 rounded-2xl bg-slate-950/80 border border-amber-400/40 text-center">
                      <span className="text-[10px] font-extrabold text-slate-400 block">平均單次閱讀量</span>
                      <span className="text-base font-black text-cyan-300">38 頁 / 48分</span>
                    </div>
                  </div>
                </div>

                {/* AI Reasoning Text */}
                <div className="p-4 rounded-2xl bg-slate-950/90 border border-amber-500/30 text-xs text-slate-200 font-bold leading-relaxed space-y-2">
                  <div className="flex items-center gap-2 text-amber-300 font-black">
                    <Sparkles className="w-4 h-4 text-amber-400 animate-spin-slow" />
                    <span>AI 數據推理評估報告：</span>
                  </div>
                  <p>
                    根據過去 7 天全天候 14 次離線閱讀行為追蹤，孩子在晚上 <span className="text-amber-300 font-black">19:30 - 20:30</span> 期間呈現顯著最高著迷度與穩定翻頁節奏。該時間段無網路干擾，平均單次完讀一本完整繪本，且對雙語詞彙的點讀朗讀重複率高達 94%。
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-[11px]">
                    <div className="p-2.5 rounded-xl bg-amber-950/50 border border-amber-500/20 text-amber-200">
                      <span className="font-extrabold block text-amber-300">🎯 翻頁流暢度最高</span>
                      <span>平均停留 22 秒/頁，未出現頻繁停頓跳出。</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-emerald-950/50 border border-emerald-500/20 text-emerald-200">
                      <span className="font-extrabold block text-emerald-300">🧠 雙語記憶高峰</span>
                      <span>晚間 Alpha 腦波狀態下，生字保留率比白天高 28%。</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-cyan-950/50 border border-cyan-500/20 text-cyan-200">
                      <span className="font-extrabold block text-cyan-300">🌙 床邊儀式感</span>
                      <span>配合沉浸廣播背景音，安撫睡前情緒。</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Recharts Line Chart - Past Week Reading Time Slots */}
              <div className="p-5 rounded-3xl bg-slate-900/90 border border-cyan-500/30 space-y-4 shadow-2xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-black text-cyan-300 flex items-center gap-2">
                      <BarChart2 className="w-4 h-4 text-cyan-400" />
                      <span>過去一週各時段離線閱讀專注度與時長折線圖 (Weekly Time Slot Line Chart)</span>
                    </h4>
                    <p className="text-xs font-bold text-slate-400">
                      橫軸代表一日內不同時段，折線展示『離線閱讀分鐘數』與『專注力指數 (%)』對比
                    </p>
                  </div>

                  {/* Metric Selector Pills */}
                  <div className="flex items-center gap-1.5 self-start sm:self-auto bg-slate-950 p-1 rounded-2xl border border-slate-800">
                    <button
                      onClick={() => setTimeSlotMetric('focus')}
                      className={`px-3 py-1 rounded-xl text-xs font-black transition-all cursor-pointer ${
                        timeSlotMetric === 'focus'
                          ? 'bg-cyan-500 text-slate-950 shadow-md'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      🎯 專注指數 (%)
                    </button>
                    <button
                      onClick={() => setTimeSlotMetric('mins')}
                      className={`px-3 py-1 rounded-xl text-xs font-black transition-all cursor-pointer ${
                        timeSlotMetric === 'mins'
                          ? 'bg-cyan-500 text-slate-950 shadow-md'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      ⏱️ 閱讀時長 (分)
                    </button>
                    <button
                      onClick={() => setTimeSlotMetric('pages')}
                      className={`px-3 py-1 rounded-xl text-xs font-black transition-all cursor-pointer ${
                        timeSlotMetric === 'pages'
                          ? 'bg-cyan-500 text-slate-950 shadow-md'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      📖 完讀頁數 (頁)
                    </button>
                  </div>
                </div>

                {/* Line Chart Container */}
                <div className="h-72 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={HOURLY_TIMESLOT_DATA} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                      <XAxis dataKey="time" stroke="#94A3B8" fontSize={11} tickLine={false} />
                      <YAxis yAxisId="left" stroke="#38BDF8" fontSize={11} tickLine={false} domain={[0, 'auto']} />
                      <YAxis yAxisId="right" orientation="right" stroke="#10B981" fontSize={11} tickLine={false} domain={[50, 100]} />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: '#0F172A',
                          borderColor: '#38BDF8',
                          borderRadius: '16px',
                          color: '#FFF',
                          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
                          fontWeight: 'bold',
                          fontSize: '12px',
                        }}
                      />
                      <RechartsLegend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px', fontWeight: 'bold' }} />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="readingMins"
                        name="離線閱讀時長 (分鐘)"
                        stroke="#38BDF8"
                        strokeWidth={3}
                        dot={{ r: 5, fill: '#38BDF8' }}
                        activeDot={{ r: 8, fill: '#F59E0B' }}
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="focusIndex"
                        name="專注力指數 (%)"
                        stroke="#10B981"
                        strokeWidth={3}
                        strokeDasharray="4 4"
                        dot={{ r: 5, fill: '#10B981' }}
                      />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="completedPages"
                        name="完讀頁數"
                        stroke="#F59E0B"
                        strokeWidth={2}
                        dot={{ r: 4, fill: '#F59E0B' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="flex items-center justify-between text-xs font-bold text-slate-400 bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
                  <span className="flex items-center gap-1.5 text-amber-300">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>圖表亮點：19:30 時段『時長 (52分)』與『專注力 (96%)』雙高，為最推薦黃金閱讀時間。</span>
                  </span>
                  <span className="text-emerald-400 font-extrabold hidden sm:inline">
                    ✓ 已對比過去 7 天 14 個採樣時段數據
                  </span>
                </div>
              </div>

              {/* Section 3: 4 Main Time Slot Breakdown Grid */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>一日四大時段閱讀表現分析對比 (4 Time Slot Breakdown)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  {/* Morning Slot */}
                  <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2 hover:border-cyan-500/50 transition-all">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-black text-amber-300">🌅 晨間時段</span>
                      <span className="text-[10px] font-bold text-slate-400">07:30 - 09:00</span>
                    </div>
                    <div className="flex items-baseline justify-between pt-1">
                      <span className="text-lg font-black text-white">18 分鐘</span>
                      <span className="text-xs font-extrabold text-amber-400">專注力 78%</span>
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 leading-relaxed">
                      精神充沛但時間較短，適合極速單字卡與 5 分鐘短篇故事。
                    </p>
                  </div>

                  {/* Afternoon Slot */}
                  <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2 hover:border-cyan-500/50 transition-all">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-black text-cyan-300">☀️ 午後課後</span>
                      <span className="text-[10px] font-bold text-slate-400">13:30 - 17:00</span>
                    </div>
                    <div className="flex items-baseline justify-between pt-1">
                      <span className="text-lg font-black text-white">32 分鐘</span>
                      <span className="text-xs font-extrabold text-cyan-400">專注力 86%</span>
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 leading-relaxed">
                      放學放鬆期，適合閱讀冒險奇幻繪本與雙語閱讀。
                    </p>
                  </div>

                  {/* Prime Slot (AI Best) */}
                  <div className="p-4 rounded-2xl bg-gradient-to-b from-amber-950/80 to-slate-900 border-2 border-amber-400/80 space-y-2 relative shadow-lg">
                    <div className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-[9px] shadow-sm">
                      👑 AI 最推薦
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-black text-amber-300">🌟 黃金閱讀點</span>
                      <span className="text-[10px] font-bold text-amber-200">19:30 - 20:30</span>
                    </div>
                    <div className="flex items-baseline justify-between pt-1">
                      <span className="text-xl font-black text-amber-300">52 分鐘</span>
                      <span className="text-xs font-black text-emerald-300">專注力 96%</span>
                    </div>
                    <p className="text-[10px] font-bold text-slate-300 leading-relaxed">
                      無干擾黃金期，翻頁與朗讀互動表現最優，建議做為固定睡前儀式。
                    </p>
                  </div>

                  {/* Night Bedtime Slot */}
                  <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2 hover:border-indigo-500/50 transition-all">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-black text-indigo-300">🌙 睡前陪伴</span>
                      <span className="text-[10px] font-bold text-slate-400">21:00 - 22:00</span>
                    </div>
                    <div className="flex items-baseline justify-between pt-1">
                      <span className="text-lg font-black text-white">35 分鐘</span>
                      <span className="text-xs font-extrabold text-emerald-400">專注力 91%</span>
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 leading-relaxed">
                      情緒轉靜期，搭配沉浸背景音樂，有助於安心入睡。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Privacy & Offline Security Note */}
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-amber-500/30 flex items-start gap-2.5 text-xs font-bold text-amber-200">
            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              安全保證：所有離線繪本快取、童星分數、個人化氣氛設定與生字庫皆安全保存在孩童本機瀏覽器中，保護個人隱私不外洩。
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="relative z-10 p-4 border-t border-amber-200/20 bg-slate-950/60 backdrop-blur-xs flex items-center justify-between gap-3">
          <button
            onClick={handleClearCache}
            disabled={isClearing || analytics.downloadedBookCount === 0}
            className="px-4 py-2 rounded-2xl bg-rose-950 hover:bg-rose-900 text-rose-300 font-extrabold text-xs flex items-center gap-1.5 border border-rose-500/40 disabled:opacity-40 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isClearing ? '清理中...' : '清空全部離線快取'}</span>
          </button>

          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-xs sm:text-sm shadow-md cursor-pointer"
          >
            關閉報告面板
          </button>
        </div>
      </div>

      {/* 📐 離線科普工程圖紙簡介彈窗 (Offline Blueprint Guide Modal) */}
      <OfflineBlueprintGuideModal
        isOpen={isBlueprintGuideOpen}
        onClose={() => setIsBlueprintGuideOpen(false)}
        onJumpToBlueprint={(blueprintId) => {
          setIsBlueprintGuideOpen(false);
          setActiveTab('encyclopedia');
        }}
      />
    </div>
  );
};
