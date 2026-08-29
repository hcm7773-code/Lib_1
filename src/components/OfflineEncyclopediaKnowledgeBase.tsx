import React, { useState, useMemo, useEffect } from 'react';
import {
  BookOpen, Sparkles, Volume2, Search, Filter, Layers, Zap,
  Compass, Eye, CheckCircle2, Star, Trophy, Award, HelpCircle,
  Clock, BookmarkCheck, HeartHandshake, Smile, RefreshCw, X,
  GraduationCap, Box, CheckCircle, FileText, ChevronRight,
  Maximize2, Printer, Download, Share2, Tag, Info, Lightbulb,
  Cpu, Compass as CompassIcon, Compass as NavIcon, Globe,
  Atom, ShieldCheck, Flame, ChevronLeft, ArrowRight,
  Cloud, CloudOff, UploadCloud, DownloadCloud, Check, Upload,
  RotateCcw, SlidersHorizontal, Radio, Database, Save, FileDown, FileUp, Activity,
  Link2, Play, Timer, BarChart2, CheckCheck, Sparkle, Repeat, Target, Award as AwardIcon
} from 'lucide-react';
import { Book, UserProfile, UserWord, VoiceRole, VocabItem } from '../types';
import { playStarChime, playPageTurnSound, speakText } from '../utils/audio';

export interface OfflineEncyclopediaKnowledgeBaseProps {
  downloadedBooks?: Book[];
  allBooks?: Book[];
  userProfile?: UserProfile;
  questCrystals?: number;
  onAddCrystals?: (amount: number) => void;
  onSelectBook?: (bookId: string) => void;
  onCloseParent?: () => void;
}

// 📚 百科領域分類
export type KnowledgeDomain = 'all' | 'space' | 'nature' | 'tech' | 'history' | 'wisdom';

// 📖 繪本主題類別
export type BookCategoryType = 'fairytale' | 'science' | 'adventure' | 'space' | 'tech' | 'wisdom';
export type BookCategoryFilter = 'all' | BookCategoryType;

// ⭐ 生字掌握程度篩選
export type MasteryStatusFilter = 'all' | 'mastered' | 'needs_review' | 'favorites';

// 🔄 離線同步事件紀錄
export interface OfflineSyncEvent {
  id: string;
  cardId: string;
  word: string;
  action: 'mark_mastered' | 'mark_review' | 'flip_review' | 'listen' | 'favorite_toggle';
  timestamp: string;
  summary: string;
}

// 📊 本地生字掌握度狀態
export interface CardMasteryRecord {
  masteryLevel: number;
  isMastered: boolean;
  needsReview: boolean;
  reviewCount: number;
  lastReviewedAt: string;
}

// 🃏 百科知識卡片資料介面
export interface EncyclopediaCard {
  id: string;
  word: string;
  pinyin: string; // 拼音標註與注音 (e.g. xíng xīng · ㄒㄧㄥˊ ㄒㄧㄥ)
  phonetic: string; // 國際音標 (e.g. /ˈplænɪt/)
  translation: string; // 中文釋義
  partOfSpeech: string; // 詞性 (e.g. n. 名詞)
  definition: string; // 詳細百科定義
  encyclopediaFact: string; // 深度科普小百科
  exampleSentence: string; // 英文生活例句
  exampleTranslation: string; // 例句中文翻譯
  domain: 'space' | 'nature' | 'tech' | 'history' | 'wisdom';
  domainLabel: string;
  domainEmoji: string;
  bookCategory: BookCategoryType;
  bookCategoryLabel: string;
  bookCategoryEmoji: string;
  themeColor: string;
  sourceBookTitle: string;
  sourceBookId?: string;
  pageOrigin: number;
  masteryLevel: number; // 0~100
  isMastered: boolean;
  needsReview: boolean;
  reviewCount: number;
  lastReviewedAt?: string;
  isFavorite: boolean;
  tags: string[];
  mindPrompt: string; // 啟發思維提問
  cuteIllustration: {
    primaryEmoji: string;
    sceneEmojis: string[];
    title: string;
    caption: string;
    badge: string;
    themeGradient: string;
    accentColor: string;
  };
}

// 📐 離線科普圖紙資料介面 (Blueprint / Schematic)
export interface BlueprintHotspot {
  id: string;
  xPercent: number; // 0~100
  yPercent: number; // 0~100
  labelZh: string;
  labelEn: string;
  brief: string;
  scientificFact: string;
  vocab: {
    word: string;
    phonetic: string;
    translation: string;
  };
}

export interface ScienceBlueprint {
  id: string;
  titleZh: string;
  titleEn: string;
  codeName: string;
  category: 'space' | 'nature' | 'tech' | 'history' | 'wisdom';
  categoryLabel: string;
  themeColor: 'cyan' | 'amber' | 'emerald' | 'purple';
  icon: string;
  scaleRatio: string;
  revision: string;
  description: string;
  sourceBookTitle: string;
  sourceBookId?: string;
  heroIllustrationEmoji: string;
  gridType: 'cyan' | 'amber';
  technicalSpecs: { label: string; value: string }[];
  hotspots: BlueprintHotspot[];
  printableSummary: string;
}

export const OfflineEncyclopediaKnowledgeBase: React.FC<OfflineEncyclopediaKnowledgeBaseProps> = ({
  downloadedBooks = [],
  allBooks = [],
  userProfile,
  questCrystals = 450,
  onAddCrystals,
  onSelectBook,
  onCloseParent,
}) => {
  // Main view mode: 'cards' (知識卡片庫) vs 'blueprints' (離線圖紙總覽) vs 'quiz' (趣味快問快答) vs 'match_game' (詞彙連連看)
  const [activeView, setActiveView] = useState<'cards' | 'blueprints' | 'quiz' | 'match_game'>('cards');

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDomain, setSelectedDomain] = useState<KnowledgeDomain>('all');
  const [selectedCategory, setSelectedCategory] = useState<BookCategoryFilter>('all');
  const [selectedMasteryStatus, setSelectedMasteryStatus] = useState<MasteryStatusFilter>('all');

  // Flipped card IDs for 3D flip effect
  const [flippedCardIds, setFlippedCardIds] = useState<Record<string, boolean>>({});

  // Online / Offline Network Status
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });

  // Offline Sync States
  const [isSyncModalOpen, setIsSyncModalOpen] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(() => {
    try {
      return localStorage.getItem('pwa_encyclopedia_last_sync') || new Date().toLocaleString();
    } catch {
      return new Date().toLocaleString();
    }
  });

  // Offline Sync Queue
  const [syncQueue, setSyncQueue] = useState<OfflineSyncEvent[]>(() => {
    try {
      const saved = localStorage.getItem('pwa_encyclopedia_sync_queue');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Card Mastery Records in LocalStorage
  const [cardMasteryMap, setCardMasteryMap] = useState<Record<string, CardMasteryRecord>>(() => {
    try {
      const saved = localStorage.getItem('pwa_encyclopedia_mastery_states');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Favorite cards in localStorage
  const [favoriteCardIds, setFavoriteCardIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('pwa_encyclopedia_favorites');
      return saved ? JSON.parse(saved) : ['card_space_planet', 'card_nature_photosynthesis', 'card_tech_solar', 'card_fairy_enchantment'];
    } catch {
      return ['card_space_planet', 'card_nature_photosynthesis', 'card_tech_solar', 'card_fairy_enchantment'];
    }
  });

  // Online / Offline Event Listeners
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
    };
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Inspected Card Detail Modal
  const [inspectedCard, setInspectedCard] = useState<EncyclopediaCard | null>(null);

  // Selected Blueprint for Inspection & Zooming
  const [selectedBlueprint, setSelectedBlueprint] = useState<ScienceBlueprint | null>(null);
  const [activeHotspot, setActiveHotspot] = useState<BlueprintHotspot | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);

  // Story Narrator Voice Role
  const [voiceRole, setVoiceRole] = useState<VoiceRole>('wizard');
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Pop-Quiz Arcade States
  const [quizScore, setQuizScore] = useState<number>(0);
  const [quizStreak, setQuizStreak] = useState<number>(0);
  const [quizQuestionIndex, setQuizQuestionIndex] = useState<number>(0);
  const [quizSelectedOption, setQuizSelectedOption] = useState<number | null>(null);
  const [quizAnswered, setQuizAnswered] = useState<boolean>(false);

  // 🔗 詞彙連連看 (Vocab Match Challenge) States
  const [matchPairCount, setMatchPairCount] = useState<number>(6);
  const [matchCategoryFilter, setMatchCategoryFilter] = useState<BookCategoryFilter | 'favorites'>('all');
  const [matchLeftCards, setMatchLeftCards] = useState<Array<{
    cardId: string;
    word: string;
    pinyin: string;
    phonetic: string;
    emoji: string;
    categoryLabel: string;
    domainEmoji: string;
    partOfSpeech: string;
    color: string;
  }>>([]);
  const [matchRightCards, setMatchRightCards] = useState<Array<{
    cardId: string;
    translation: string;
    definition: string;
    exampleSnippet: string;
    sourceBookTitle: string;
    partOfSpeech: string;
  }>>([]);
  const [selectedLeftId, setSelectedLeftId] = useState<string | null>(null);
  const [selectedRightId, setSelectedRightId] = useState<string | null>(null);
  const [matchedPairIds, setMatchedPairIds] = useState<string[]>([]);
  const [matchErrorCounts, setMatchErrorCounts] = useState<Record<string, number>>({});
  const [mismatchPair, setMismatchPair] = useState<{ leftId: string; rightId: string } | null>(null);
  const [matchCombo, setMatchCombo] = useState<number>(0);
  const [maxCombo, setMaxCombo] = useState<number>(0);
  const [matchScore, setMatchScore] = useState<number>(0);
  const [matchTimerSeconds, setMatchTimerSeconds] = useState<number>(0);
  const [isMatchTimerRunning, setIsMatchTimerRunning] = useState<boolean>(false);
  const [isMatchGameComplete, setIsMatchGameComplete] = useState<boolean>(false);
  const [awardedBonusCrystals, setAwardedBonusCrystals] = useState<number>(0);
  const [activeMatchRoundCards, setActiveMatchRoundCards] = useState<EncyclopediaCard[]>([]);
  const [matchRoundHistoryCount, setMatchRoundHistoryCount] = useState<number>(0);

  // Narrator Personas
  const NARRATOR_PERSONAS = [
    { role: 'wizard' as VoiceRole, name: '智慧貓頭鷹博士', avatar: '🦉', desc: '百科解析 ‧ 啟發思考' },
    { role: 'fairy' as VoiceRole, name: '森林童話仙子', avatar: '🧚‍♀️', desc: '自然靈動 ‧ 雙語生動' },
    { role: 'grandpa' as VoiceRole, name: '星空魔法師', avatar: '🧙‍♂️', desc: '宇宙奧秘 ‧ 磁性說理' },
    { role: 'mom' as VoiceRole, name: '親切故事媽媽', avatar: '👩‍👧', desc: '溫柔詳解 ‧ 陪伴啟蒙' },
    { role: 'robot' as VoiceRole, name: '咕嚕科技機器人', avatar: '🤖', desc: '未來工程 ‧ 數理邏輯' },
  ];

  // 1. Compile all Mastered Words & Book Vocabulary into Encyclopedia Cards
  const allEncyclopediaCards: EncyclopediaCard[] = useMemo(() => {
    // Read user saved words from localStorage
    let savedUserWords: UserWord[] = [];
    try {
      const stored = localStorage.getItem('wcdl_user_words');
      if (stored) savedUserWords = JSON.parse(stored);
    } catch (e) {
      console.warn(e);
    }

    // Curated high-yield core encyclopedia entries with Pinyin & Cute Illustrations
    const rawCoreEntries: Array<Omit<EncyclopediaCard, 'isMastered' | 'needsReview' | 'reviewCount' | 'isFavorite'>> = [
      // 🧚‍♀️ 童話寓言 (Fairy Tale & Fantasy)
      {
        id: 'card_fairy_enchantment',
        word: 'Enchantment',
        pinyin: 'mó fǎ fù mó (ㄇㄛˊ ㄈㄚˇ ㄈㄨˋ ㄇㄛˊ)',
        phonetic: '/ɪnˈtʃæntmənt/',
        translation: '魔法附魔、奇妙魅力',
        partOfSpeech: 'n. 名詞',
        definition: '受到神秘魔力吸引或被賦予奇幻特性的狀態，亦指童話故事中充滿驚喜的美好魔法。',
        encyclopediaFact: '在世界童話文學中，魔法（Magic/Enchantment）象徵著孩子對未知世界的好奇心、想像力以及克服困難的善良勇氣！',
        exampleSentence: 'The fairy godmother cast a wonderful enchantment on the glass slippers.',
        exampleTranslation: '仙女教母在玻璃鞋上施展了奇妙閃耀的魔法附魔。',
        domain: 'wisdom',
        domainLabel: '心靈品格',
        domainEmoji: '🧚‍♀️',
        bookCategory: 'fairytale',
        bookCategoryLabel: '童話寓言',
        bookCategoryEmoji: '🧚‍♀️',
        themeColor: 'from-fuchsia-600 to-pink-700',
        sourceBookTitle: '灰姑娘的魔法水晶鞋',
        sourceBookId: 'book-cinderella',
        pageOrigin: 2,
        masteryLevel: 100,
        tags: ['童話魔法', '善良想像', '奇幻故事'],
        mindPrompt: '如果仙女教母能幫你實現一個魔法願望，你最想把什麼東西變得充滿魔法？',
        cuteIllustration: {
          primaryEmoji: '🧚‍♀️',
          sceneEmojis: ['✨', '👠', '🪄', '💖'],
          title: '🧚‍♀️ 仙女教母的星光魔法棒',
          caption: '輕輕揮動閃耀星光的魔法棒，南瓜變馬車，善良的心總會發光！',
          badge: '童話魔法奇蹟',
          themeGradient: 'from-fuchsia-950/80 via-pink-900/40 to-slate-950',
          accentColor: 'text-fuchsia-300',
        },
      },
      {
        id: 'card_fairy_courage',
        word: 'Courage',
        pinyin: 'yǒng qì (ㄩㄥˇ ㄑㄧˋ)',
        phonetic: '/ˈkɜːrɪdʒ/',
        translation: '勇氣、膽量、無畏',
        partOfSpeech: 'n. 名詞',
        definition: '面對未知、危險、困難或恐懼時，仍然勇敢向前並堅持做正確事情的強大內心力量。',
        encyclopediaFact: '心理學家發現，真正的勇氣不是「不害怕」，而是「即使感到害怕，依然一步一步勇敢往前走」！',
        exampleSentence: 'Little Red Riding Hood found the courage to protect her grandmother.',
        exampleTranslation: '小紅帽鼓起勇氣，勇敢保護了最親愛的奶奶。',
        domain: 'wisdom',
        domainLabel: '心靈品格',
        domainEmoji: '🦁',
        bookCategory: 'fairytale',
        bookCategoryLabel: '童話寓言',
        bookCategoryEmoji: '🦁',
        themeColor: 'from-amber-600 to-red-700',
        sourceBookTitle: '小紅帽的森林勇氣之歌',
        sourceBookId: 'book-red',
        pageOrigin: 3,
        masteryLevel: 95,
        tags: ['品格培養', '克服恐懼', '自我成長'],
        mindPrompt: '在生活或上學時，哪一次你覺得自己最有勇氣？',
        cuteIllustration: {
          primaryEmoji: '🦁',
          sceneEmojis: ['🛡️', '👑', '🔥', '✨'],
          title: '🦁 小獅王心中的金色火焰',
          caption: '不怕黑夜與未知，勇敢邁出腳步，每一步都是成長的勳章！',
          badge: '勇者堅定之心',
          themeGradient: 'from-amber-950/80 via-red-950/40 to-slate-950',
          accentColor: 'text-amber-300',
        },
      },

      // 🪐 宇宙天文 (Space)
      {
        id: 'card_space_planet',
        word: 'Planet',
        pinyin: 'xíng xīng (ㄒㄧㄥˊ ㄒㄧㄥ)',
        phonetic: '/ˈplænɪt/',
        translation: '行星、星球',
        partOfSpeech: 'n. 名詞',
        definition: '圍繞恆星公轉，自身具有足夠質量呈球形且未引發核融合反應的巨大天體。',
        encyclopediaFact: '在我們的太陽系中有八大行星，水星離太陽最近，而木星是最大的行星！地球是目前已知唯一孕育生命的奇蹟星球。',
        exampleSentence: 'The little prince traveled from a small planet in outer space.',
        exampleTranslation: '小王子來自外太空中一顆小小的行星。',
        domain: 'space',
        domainLabel: '宇宙天文',
        domainEmoji: '🪐',
        bookCategory: 'space',
        bookCategoryLabel: '宇宙天文',
        bookCategoryEmoji: '🪐',
        themeColor: 'from-indigo-600 to-blue-700',
        sourceBookTitle: '小王子與星空狐狸',
        sourceBookId: 'book-1',
        pageOrigin: 1,
        masteryLevel: 100,
        tags: ['天體科學', '太陽系', '太空探索'],
        mindPrompt: '如果未來你能發現一顆全新的行星，你會幫它取什麼名字，上面會有什麼奇特的地形呢？',
        cuteIllustration: {
          primaryEmoji: '🪐',
          sceneEmojis: ['🌟', '🛸', '✨', '🌍'],
          title: '🪐 夢幻星環與漫遊太空船',
          caption: '圍繞恆星平穩公轉的奇蹟球體，載著生命與無限想像！',
          badge: '宇宙奇蹟天體',
          themeGradient: 'from-indigo-950/80 via-blue-900/40 to-slate-950',
          accentColor: 'text-cyan-300',
        },
      },
      {
        id: 'card_space_orbit',
        word: 'Orbit',
        pinyin: 'guǐ dào (ㄍㄨㄟˇ ㄉㄠˋ)',
        phonetic: '/ˈɔːrbɪt/',
        translation: '運行軌道、繞行',
        partOfSpeech: 'n. / v.',
        definition: '一個物體在萬有引力作用下，圍繞另一個物體進行週期性運行的彎曲路徑。',
        encyclopediaFact: '月球繞著地球公轉的軌道呈橢圓形，地球繞太陽公轉一週需要大約 365.25 天，這就是我們一年的長度！',
        exampleSentence: 'The spaceship entered the stable orbit around the moon.',
        exampleTranslation: '太空船進入了圍繞月球運行的穩定軌道。',
        domain: 'space',
        domainLabel: '宇宙天文',
        domainEmoji: '🛰️',
        bookCategory: 'space',
        bookCategoryLabel: '宇宙天文',
        bookCategoryEmoji: '🛰️',
        themeColor: 'from-blue-600 to-indigo-800',
        sourceBookTitle: '星際太空漫遊記',
        sourceBookId: 'book-space',
        pageOrigin: 3,
        masteryLevel: 85,
        tags: ['重力引力', '天體力學', '公轉'],
        mindPrompt: '為什麼人造衛星在軌道上繞著地球轉，卻不會直接掉下來呢？（提示：速度與向心力平衡）',
        cuteIllustration: {
          primaryEmoji: '🛰️',
          sceneEmojis: ['💫', '🌙', '🌐', '✨'],
          title: '🛰️ 太空衛星的軌道曼波舞',
          caption: '沿著精密的萬有引力弧線，衛星日夜守護著藍色地球！',
          badge: '引力平衡之美',
          themeGradient: 'from-blue-950/80 via-indigo-900/40 to-slate-950',
          accentColor: 'text-blue-300',
        },
      },
      {
        id: 'card_space_constellation',
        word: 'Constellation',
        pinyin: 'xīng zuò (ㄒㄧㄥ ㄗㄨㄛˋ)',
        phonetic: '/ˌkɑːnstəˈleɪʃn/',
        translation: '星座、星群',
        partOfSpeech: 'n. 名詞',
        definition: '人類為了方便辨認夜空中的恆星，將相鄰星星連線劃分出的想像圖案區域。',
        encyclopediaFact: '國際天文聯合會正式認可的星座共有 88 個，古代航海家在黑夜中全靠北極星與大熊星座來辨別方向！',
        exampleSentence: 'Ancient sailors used the Big Dipper constellation to find north.',
        exampleTranslation: '古代水手透過北斗七星這組星座來尋找北方。',
        domain: 'space',
        domainLabel: '宇宙天文',
        domainEmoji: '✨',
        bookCategory: 'space',
        bookCategoryLabel: '宇宙天文',
        bookCategoryEmoji: '✨',
        themeColor: 'from-purple-600 to-indigo-900',
        sourceBookTitle: '夜空中的十二星座傳奇',
        sourceBookId: 'book-stars',
        pageOrigin: 2,
        masteryLevel: 90,
        tags: ['星空觀測', '航海導航', '古代智慧'],
        mindPrompt: '仰望夜空時，你能找到獵戶座腰帶上的三顆亮星嗎？',
        cuteIllustration: {
          primaryEmoji: '✨',
          sceneEmojis: ['🌌', '⭐', '🐻', '🔭'],
          title: '🌌 閃爍夜空的童話星圖',
          caption: '夜空中閃閃發光的星星連成線，變成小熊與巨人的故事！',
          badge: '星空引路燈塔',
          themeGradient: 'from-purple-950/80 via-indigo-950/40 to-slate-950',
          accentColor: 'text-purple-300',
        },
      },

      // 🌿 自然生態與科普 (Nature & Science)
      {
        id: 'card_nature_photosynthesis',
        word: 'Photosynthesis',
        pinyin: 'guāng hé zuò yòng (ㄍㄨㄤ ㄏㄜˊ ㄗㄨㄛˋ ㄩㄥˋ)',
        phonetic: '/ˌfoʊtoʊˈsɪnθəsɪs/',
        translation: '光合作用',
        partOfSpeech: 'n. 名詞',
        definition: '綠色植物利用陽光、水和二氧化碳，製造葡萄糖養分並釋放氧氣的奇妙化學過程。',
        encyclopediaFact: '地球上超過 70% 的氧氣其實來自海洋中的微小浮游藻類與陸地上的森林！保護森林與海洋就是保護我們呼吸的空氣。',
        exampleSentence: 'Green leaves perform photosynthesis to produce oxygen for all living things.',
        exampleTranslation: '綠色樹葉進行光合作用，為所有生物製造清新的氧氣。',
        domain: 'nature',
        domainLabel: '自然生態',
        domainEmoji: '🌿',
        bookCategory: 'science',
        bookCategoryLabel: '科普自然',
        bookCategoryEmoji: '🔬',
        themeColor: 'from-emerald-600 to-teal-700',
        sourceBookTitle: '森林小樹苗的秘密日記',
        sourceBookId: 'book-tree',
        pageOrigin: 2,
        masteryLevel: 95,
        tags: ['植物生理', '生態循環', '氧氣工廠'],
        mindPrompt: '如果沒有植物進行光合作用，地球上的動物和人類還能生存嗎？',
        cuteIllustration: {
          primaryEmoji: '🌱',
          sceneEmojis: ['☀️', '💧', '🍃', '💨'],
          title: '🌱 綠色小樹苗的日光工廠',
          caption: '張開綠葉大口喝陽光與雨水，吐出滿滿一森林的新鮮氧氣！',
          badge: '大自然氧氣工廠',
          themeGradient: 'from-emerald-950/80 via-teal-900/40 to-slate-950',
          accentColor: 'text-emerald-300',
        },
      },
      {
        id: 'card_nature_ecosystem',
        word: 'Ecosystem',
        pinyin: 'shēng tài xì tǒng (ㄕㄥ ㄊㄞˋ ㄒㄧˋ ㄊㄨㄥˇ)',
        phonetic: '/ˈiːkoʊsɪstəm/',
        translation: '生態系統',
        partOfSpeech: 'n. 名詞',
        definition: '由生物群落（動物、植物、微生物）與其所處的非生物環境（陽光、土壤、水）相互依存組成的完整系統。',
        encyclopediaFact: '即使是一棵枯倒的老樹也是一個熱鬧的微型生態系，裡面住著真菌、甲蟲與小松鼠，讓養分重歸大地。',
        exampleSentence: 'Every animal plays an important role in the forest ecosystem.',
        exampleTranslation: '每一隻小動物都在森林生態系中扮演不可或缺的重要角色。',
        domain: 'nature',
        domainLabel: '自然生態',
        domainEmoji: '🌲',
        bookCategory: 'science',
        bookCategoryLabel: '科普自然',
        bookCategoryEmoji: '🌲',
        themeColor: 'from-teal-600 to-green-800',
        sourceBookTitle: '雨林守護者大冒險',
        sourceBookId: 'book-forest',
        pageOrigin: 4,
        masteryLevel: 90,
        tags: ['食物鏈', '生物多樣性', '地球保育'],
        mindPrompt: '為什麼蜜蜂在生態系統中扮演不可或缺的授粉關鍵角色？',
        cuteIllustration: {
          primaryEmoji: '🌲',
          sceneEmojis: ['🐿️', '🍄', '🐝', '💧'],
          title: '🌲 活力森林生命大家庭',
          caption: '松鼠、蘑菇、蜜蜂與大樹彼此幫忙，共築溫暖美好的大自然家園！',
          badge: '生物多樣性樂園',
          themeGradient: 'from-teal-950/80 via-emerald-950/40 to-slate-950',
          accentColor: 'text-teal-300',
        },
      },
      {
        id: 'card_nature_metamorphosis',
        word: 'Metamorphosis',
        pinyin: 'biàn tài fā yù (ㄅㄧㄢˋ ㄊㄞˋ ㄈㄚ ㄩˋ)',
        phonetic: '/ˌmetəˈmɔːrfəsɪs/',
        translation: '變態發育、蛻變',
        partOfSpeech: 'n. 名詞',
        definition: '昆蟲或兩棲動物從幼體轉變為成體時，身體構造發生的劇烈形態轉變過程。',
        encyclopediaFact: '毛毛蟲在蛹裡面會將大部分組織重新分解組合，就像大自然施展的魔法，最終羽化為美麗的蝴蝶！',
        exampleSentence: 'The caterpillar underwent a complete metamorphosis into a butterfly.',
        exampleTranslation: '毛毛蟲經歷了完整的變態發育，羽化成美麗的花蝴蝶。',
        domain: 'nature',
        domainLabel: '自然生態',
        domainEmoji: '🦋',
        bookCategory: 'science',
        bookCategoryLabel: '科普自然',
        bookCategoryEmoji: '🦋',
        themeColor: 'from-pink-600 to-rose-700',
        sourceBookTitle: '毛毛蟲的彩虹翅膀',
        sourceBookId: 'book-caterpillar',
        pageOrigin: 3,
        masteryLevel: 100,
        tags: ['生命科學', '昆蟲生長', '蝴蝶羽化'],
        mindPrompt: '除了蝴蝶，青蛙從蝌蚪長成青蛙也是一種變態發育喔，青蛙小時候是用什麼呼吸的呢？',
        cuteIllustration: {
          primaryEmoji: '🦋',
          sceneEmojis: ['🐛', '🌸', '✨', '🍃'],
          title: '🦋 毛毛蟲的彩虹翅膀魔法',
          caption: '在溫暖的蛹裡安心做夢，醒來時已披上彩虹般閃亮的翅膀！',
          badge: '生命羽化奇蹟',
          themeGradient: 'from-pink-950/80 via-rose-900/40 to-slate-950',
          accentColor: 'text-pink-300',
        },
      },

      // ⚙️ 綠色科技與機械 (Tech & Invention)
      {
        id: 'card_tech_solar',
        word: 'Solar Energy',
        pinyin: 'tài yáng néng (ㄊㄞˋ ㄧㄤˊ ㄋㄥˊ)',
        phonetic: '/ˈsoʊlər ˈenərdʒi/',
        translation: '太陽能、太陽光發電',
        partOfSpeech: 'n. 複合名詞',
        definition: '利用太陽光輻射轉換為電力或熱能的乾淨、可再生、無污染之綠色能源。',
        encyclopediaFact: '太陽每秒鐘照射到地球上的能量，比全世界所有人一年消耗的能量還要多！太陽能板是邁向零碳未來的重要科技。',
        exampleSentence: 'The modern eco-house uses solar energy to power all its appliances.',
        exampleTranslation: '這棟現代環保屋利用太陽能為家裡所有的電器供電。',
        domain: 'tech',
        domainLabel: '綠色科技',
        domainEmoji: '☀️',
        bookCategory: 'tech',
        bookCategoryLabel: '綠色科技',
        bookCategoryEmoji: '⚙️',
        themeColor: 'from-amber-500 to-orange-600',
        sourceBookTitle: '三隻小豬的環保綠建築',
        sourceBookId: 'book-2',
        pageOrigin: 2,
        masteryLevel: 100,
        tags: ['再生能源', '零碳綠生活', '永續發展'],
        mindPrompt: '如果你的書包上裝有一小塊太陽能板，你希望它能幫你驅動什麼有趣的小工具？',
        cuteIllustration: {
          primaryEmoji: '☀️',
          sceneEmojis: ['🔋', '🏡', '⚡', '🌻'],
          title: '☀️ 微笑太陽的金色能量盒',
          caption: '金黃色的陽光落在屋頂藍色瓦片上，悄悄點亮了溫暖的小夜燈！',
          badge: '乾淨綠色能源',
          themeGradient: 'from-amber-950/80 via-yellow-900/40 to-slate-950',
          accentColor: 'text-amber-300',
        },
      },
      {
        id: 'card_tech_architecture',
        word: 'Architecture',
        pinyin: 'jiàn zhú xué (ㄐㄧㄢˋ ㄓㄨˊ ㄒㄩㄝˊ)',
        phonetic: '/ˈɑːrkɪtektʃər/',
        translation: '建築學、建築結構',
        partOfSpeech: 'n. 名詞',
        definition: '規劃、設計與建造建築物及結構物的科學與藝術體系。',
        encyclopediaFact: '古代建築師利用三角形最穩固的幾何原理設計屋頂桁架，現代綠建築更結合了雨水回收與自然採光通風！',
        exampleSentence: 'Innovative architecture allows natural sunlight to brighten the rooms.',
        exampleTranslation: '創新的建築設計讓自然陽光充分照亮每一個房間。',
        domain: 'tech',
        domainLabel: '綠色科技',
        domainEmoji: '🏛️',
        bookCategory: 'tech',
        bookCategoryLabel: '綠色科技',
        bookCategoryEmoji: '🏛️',
        themeColor: 'from-cyan-600 to-blue-700',
        sourceBookTitle: '未來的奇蹟綠城市',
        sourceBookId: 'book-city',
        pageOrigin: 1,
        masteryLevel: 75,
        tags: ['工程結構', '綠建築設計', '空間美學'],
        mindPrompt: '為什麼蜂巢的六角形結構在建築設計中被廣泛應用？（提示：最省材料且最堅固）',
        cuteIllustration: {
          primaryEmoji: '🏛️',
          sceneEmojis: ['📐', '🌿', '🏢', '✨'],
          title: '🏛️ 綠意盎然的未來積木城堡',
          caption: '會呼吸的窗戶、屋頂小花園，建築讓城市與大自然快樂擁抱！',
          badge: '空間幾何美學',
          themeGradient: 'from-cyan-950/80 via-blue-900/40 to-slate-950',
          accentColor: 'text-cyan-300',
        },
      },
      {
        id: 'card_tech_mechanism',
        word: 'Mechanism',
        pinyin: 'jī xiè gòu zào (ㄐㄧ ㄒㄧㄝˋ ㄍㄡˋ ㄗㄠˋ)',
        phonetic: '/ˈmekənɪzəm/',
        translation: '機械構造、運作機理',
        partOfSpeech: 'n. 名詞',
        definition: '由相互連動的齒輪、連桿與零件組成，用來傳遞力量或運動的機械裝置。',
        encyclopediaFact: '古希臘人發明的「安提基特拉機械」是世界上第一台天文齒輪計算機，距今已有超過兩千年的歷史！',
        exampleSentence: 'The clockmaker adjusted the tiny gear mechanism inside the clock.',
        exampleTranslation: '鐘錶匠細心調整了時鐘內部精密的微型齒輪機械構造。',
        domain: 'tech',
        domainLabel: '綠色科技',
        domainEmoji: '⚙️',
        bookCategory: 'tech',
        bookCategoryLabel: '綠色科技',
        bookCategoryEmoji: '⚙️',
        themeColor: 'from-slate-600 to-zinc-800',
        sourceBookTitle: '蒸汽齒輪奇幻發明家',
        sourceBookId: 'book-gear',
        pageOrigin: 2,
        masteryLevel: 80,
        tags: ['精密齒輪', '動力學', '發明歷史'],
        mindPrompt: '大齒輪帶動小齒輪轉動時，哪一個齒輪會轉得比較快呢？',
        cuteIllustration: {
          primaryEmoji: '⚙️',
          sceneEmojis: ['🔧', '🤖', '⏱️', '✨'],
          title: '⚙️ 滴答滴答的小齒輪探戈',
          caption: '咬合緊密的金屬小牙齒手拉手，帶動了時鐘的指針與發明的奇蹟！',
          badge: '精密運動機械',
          themeGradient: 'from-slate-950/90 via-zinc-900/50 to-slate-950',
          accentColor: 'text-slate-300',
        },
      },

      // 🏰 人文歷史與冒險探索 (History & Adventure)
      {
        id: 'card_history_navigation',
        word: 'Navigation',
        pinyin: 'háng hǎi dǎo háng (ㄏㄤˊ ㄏㄞˇ ㄉㄠˇ ㄏㄤˊ)',
        phonetic: '/ˌnævɪˈɡeɪʃn/',
        translation: '航海導航、領航技術',
        partOfSpeech: 'n. 名詞',
        definition: '測定船隻、飛機或旅人所處位置並規劃正確前進路線的科學技術。',
        encyclopediaFact: '在 GPS 衛星問世之前，水手們使用「六分儀」測量太陽與地平線的角度來計算緯度，進行跨大洋遠航！',
        exampleSentence: 'Skillful navigation guided the wooden ship safely through the stormy sea.',
        exampleTranslation: '精湛的航海領航技術引導木船安全穿過了狂風巨浪的大海。',
        domain: 'history',
        domainLabel: '人文歷史',
        domainEmoji: '🧭',
        bookCategory: 'adventure',
        bookCategoryLabel: '冒險探索',
        bookCategoryEmoji: '🚀',
        themeColor: 'from-amber-700 to-yellow-900',
        sourceBookTitle: '航海大冒險：尋找失落島',
        sourceBookId: 'book-sail',
        pageOrigin: 3,
        masteryLevel: 90,
        tags: ['古代航海', '羅盤指南針', '地理發現'],
        mindPrompt: '如果指南針在古代被發明出來，它對世界的貿易和文化交流有什麼巨大貢獻？',
        cuteIllustration: {
          primaryEmoji: '🧭',
          sceneEmojis: ['⛵', '🌊', '🗺️', '⭐'],
          title: '🧭 金色羅盤與乘風破浪帆船',
          caption: '看著北極星與指北針，勇敢的水手在遼闊的海洋上找到了冒險之島！',
          badge: '大航海探險指南',
          themeGradient: 'from-amber-950/80 via-yellow-950/40 to-slate-950',
          accentColor: 'text-amber-300',
        },
      },
      {
        id: 'card_adventure_expedition',
        word: 'Expedition',
        pinyin: 'yuǎn zhēng tàn xiǎn (ㄩㄢˇ ㄓㄥ ㄊㄢˋ ㄒㄧㄢˇ)',
        phonetic: '/ˌekspəˈdɪʃn/',
        translation: '遠征、探險考察',
        partOfSpeech: 'n. 名詞',
        definition: '為了特定科學研究、地理發現或尋求寶物而組織的長途冒險旅程。',
        encyclopediaFact: '人類歷史上著名的極地遠征探險家們必須學會與嚴寒對抗，他們的勇氣開拓了現代地理學的全新地圖！',
        exampleSentence: 'The young explorers prepared their backpacks for a jungle expedition.',
        exampleTranslation: '小小探險家們整理好背包，準備展開一場熱帶叢林遠征。',
        domain: 'history',
        domainLabel: '人文歷史',
        domainEmoji: '🏔️',
        bookCategory: 'adventure',
        bookCategoryLabel: '冒險探索',
        bookCategoryEmoji: '🏔️',
        themeColor: 'from-orange-600 to-amber-800',
        sourceBookTitle: '神祕熱氣球環遊記',
        sourceBookId: 'book-balloon',
        pageOrigin: 1,
        masteryLevel: 70,
        tags: ['野外探險', '地理考察', '團隊合作'],
        mindPrompt: '如果你能組建一支 3 人的探險小隊，你會邀請哪些夥伴，去哪裡探險？',
        cuteIllustration: {
          primaryEmoji: '🏔️',
          sceneEmojis: ['🎒', '⛺', '🧭', '🔥'],
          title: '🏔️ 熱血探險小隊的高山營地',
          caption: '背上行囊點起營火，翻過雪山與叢林，前方就是未知的寶藏世界！',
          badge: '勇往直前遠征隊',
          themeGradient: 'from-orange-950/80 via-amber-950/40 to-slate-950',
          accentColor: 'text-orange-300',
        },
      },

      // 💡 心靈品格與智慧 (Wisdom & Ethics)
      {
        id: 'card_wisdom_empathy',
        word: 'Empathy',
        pinyin: 'tóng lǐ xīn (ㄊㄨㄥˊ ㄌㄧˇ ㄒㄧㄣ)',
        phonetic: '/ˈempəθi/',
        translation: '同理心、感同身受',
        partOfSpeech: 'n. 名詞',
        definition: '設身處地體會理解他人感受、情緒與處境的崇高心靈能力。',
        encyclopediaFact: '心理學研究發現，常閱讀繪本故事的孩子擁有更強大的同理心，因為在閱讀中大腦會體驗書中角色的喜怒哀樂！',
        exampleSentence: 'Showing empathy helps us comfort friends when they feel sad.',
        exampleTranslation: '展現同理心能幫助我們在朋友難過時給予最溫暖的安慰。',
        domain: 'wisdom',
        domainLabel: '心靈品格',
        domainEmoji: '💖',
        bookCategory: 'wisdom',
        bookCategoryLabel: '心靈品格',
        bookCategoryEmoji: '💖',
        themeColor: 'from-rose-500 to-pink-600',
        sourceBookTitle: '小熊的溫暖分享森林',
        sourceBookId: 'book-empathy',
        pageOrigin: 1,
        masteryLevel: 100,
        tags: ['人際情商', '善良關懷', '品格涵養'],
        mindPrompt: '當你看見同學或家人心情不好時，你能用什麼方式展現你的同理心？',
        cuteIllustration: {
          primaryEmoji: '💖',
          sceneEmojis: ['🧸', '🤗', '🌸', '✨'],
          title: '💖 溫暖小熊的分享擁抱',
          caption: '看懂朋友眼裡的淚水，遞上一塊熱烘烘的蜂蜜餅乾與溫暖擁抱！',
          badge: '心靈溫暖守護',
          themeGradient: 'from-rose-950/80 via-pink-900/40 to-slate-950',
          accentColor: 'text-rose-300',
        },
      },
      {
        id: 'card_wisdom_curiosity',
        word: 'Curiosity',
        pinyin: 'hào qí xīn (ㄏㄠˋ ㄑㄧˊ ㄒㄧㄣ)',
        phonetic: '/ˌkjʊriˈɑːsəti/',
        translation: '好奇心、求知欲',
        partOfSpeech: 'n. 名詞',
        definition: '對於未知世界渴望探索、主動提問並尋求答案的內在熱情。',
        encyclopediaFact: '愛因斯坦曾說：「我沒有什麼特別的才能，我只是保持了狂熱的好奇心。」好奇心是所有偉大科學發現的火種！',
        exampleSentence: 'Curiosity drove the little explorer to investigate the hidden cave.',
        exampleTranslation: '強烈的好奇心驅使小小探險家去探索神祕的隱藏山洞。',
        domain: 'wisdom',
        domainLabel: '心靈品格',
        domainEmoji: '💡',
        bookCategory: 'wisdom',
        bookCategoryLabel: '心靈品格',
        bookCategoryEmoji: '💡',
        themeColor: 'from-amber-500 to-yellow-600',
        sourceBookTitle: '好奇小貓問天下',
        sourceBookId: 'book-curious',
        pageOrigin: 2,
        masteryLevel: 95,
        tags: ['主動學習', '科學精神', '探索思考'],
        mindPrompt: '今天你對身邊哪一樣不起眼的事情產生了好奇呢？',
        cuteIllustration: {
          primaryEmoji: '💡',
          sceneEmojis: ['🐱', '🔍', '🧪', '✨'],
          title: '💡 閃爍靈感的小貓偵探',
          caption: '為什麼天空是藍色的？小貓拿起放大鏡，世界處處都是驚奇寶藏！',
          badge: '探索科學火種',
          themeGradient: 'from-amber-950/80 via-yellow-900/40 to-slate-950',
          accentColor: 'text-yellow-300',
        },
      },
    ];

    // Combine with overrides from cardMasteryMap
    return rawCoreEntries.map((card) => {
      const override = cardMasteryMap[card.id];
      const masteryLevel = override?.masteryLevel ?? card.masteryLevel;
      const isMastered = override?.isMastered !== undefined ? override.isMastered : (masteryLevel >= 85);
      const needsReview = override?.needsReview !== undefined ? override.needsReview : (masteryLevel < 85);
      const reviewCount = override?.reviewCount ?? (masteryLevel >= 90 ? 3 : 1);
      const lastReviewedAt = override?.lastReviewedAt;

      return {
        ...card,
        masteryLevel,
        isMastered,
        needsReview,
        reviewCount,
        lastReviewedAt,
        isFavorite: favoriteCardIds.includes(card.id),
      };
    });
  }, [favoriteCardIds, cardMasteryMap]);

  // 2. Science Blueprint Schematics Catalog (6 精密離線圖紙)
  const scienceBlueprints: ScienceBlueprint[] = useMemo(() => {
    return [
      // Blueprint 1: 🪐 太陽系行星軌道與引力系統
      {
        id: 'bp_solar_orbit',
        titleZh: '太陽系星際航行與行星軌道藍圖',
        titleEn: 'Solar System Planetary Orbit & Gravitational Blueprint',
        codeName: 'SPEC-ASTRO-2026-X1',
        category: 'space',
        categoryLabel: '宇宙天文科學',
        themeColor: 'cyan',
        icon: '🪐',
        scaleRatio: '1 : 1,000,000 km',
        revision: 'REV 3.4 (OFFLINE VERIFIED)',
        description: '詳細標註太陽系八大行星之公轉橢圓軌道、天文單位 (AU) 距離、引力向心平衡點與小行星帶分佈圖。',
        sourceBookTitle: '小王子與星空狐狸',
        sourceBookId: 'book-1',
        heroIllustrationEmoji: '🪐 ☀️ 🛰️ 🌍 🚀',
        gridType: 'cyan',
        technicalSpecs: [
          { label: '中心天體 (Central Body)', value: '太陽 (黃矮星 G-Type)' },
          { label: '行星數量 (Planets)', value: '8 大主行星 + 矮行星群' },
          { label: '軌道偏心率 (Eccentricity)', value: 'e ≈ 0.0167 (地球公轉)' },
          { label: '光速傳播時延 (Light Time)', value: '太陽至地球約 8 分 20 秒' },
        ],
        printableSummary: '本圖紙涵蓋太陽系八大行星排列順序（水金地火木土天海）、第一宇宙速度、逃逸速度及柯伊伯帶邊界定位指南。',
        hotspots: [
          {
            id: 'hs_sun_core',
            xPercent: 18,
            yPercent: 45,
            labelZh: '太陽核融合反應核心',
            labelEn: 'Solar Fusion Core',
            brief: '溫度達 15,000,000°C，每秒將 6 億噸氫轉化為氦，釋放巨大光與熱。',
            scientificFact: '核心產生的光子需要經過十萬年以上漫長的碰撞傳導，才終於從太陽表面逃逸照射到地球！',
            vocab: { word: 'Nuclear Fusion', phonetic: '/ˈnuːkliər ˈfjuːʒn/', translation: '核融合' },
          },
          {
            id: 'hs_earth_orbit',
            xPercent: 48,
            yPercent: 38,
            labelZh: '地球適居帶公轉軌道 (Goldilocks Zone)',
            labelEn: 'Habitable Orbit',
            brief: '距離太陽約 1.5 億公里 (1 AU)，溫度適中使液態水能夠穩定存在。',
            scientificFact: '適居帶是生命誕生的搖籃，地球的大氣層與磁場有效阻擋了宇宙射線與太陽風。',
            vocab: { word: 'Habitable Zone', phonetic: '/ˈhæbɪtəbl zoʊn/', translation: '適居帶' },
          },
          {
            id: 'hs_jupiter_shield',
            xPercent: 75,
            yPercent: 30,
            labelZh: '木星重力護盾 (Jupiter Gravitational Shield)',
            labelEn: 'Gas Giant Gravitational Well',
            brief: '太陽系中質量最大的行星，強大重力吸收與彈開了多數威脅內行星的彗星與小行星。',
            scientificFact: '木星就像地球的太空保鑣，大紅斑是一個持續了數百年的巨大反氣旋風暴！',
            vocab: { word: 'Gravitational Shield', phonetic: '/ˌɡrævɪˈteɪʃənl ʃiːld/', translation: '重力護盾' },
          },
        ],
      },

      // Blueprint 2: 🏡 三隻小豬環保零碳綠建築透視圖
      {
        id: 'bp_green_architecture',
        titleZh: '三隻小豬環保零碳綠建築透視圖',
        titleEn: 'Zero-Carbon Eco Green Architecture Blueprint',
        codeName: 'SPEC-ARCH-ECO-03',
        category: 'tech',
        categoryLabel: '綠色永續科技',
        themeColor: 'amber',
        icon: '🏡',
        scaleRatio: '1 : 50 METRIC',
        revision: 'REV 2.1 (PWA ACCREDITED)',
        description: '結合屋頂太陽能集熱光電板、雨水過濾回收系統、地源熱泵與雙層低輻射隔熱玻璃的被動式節能建築工程圖。',
        sourceBookTitle: '三隻小豬的環保綠建築',
        sourceBookId: 'book-2',
        heroIllustrationEmoji: '🏡 ☀️ 💧 🌿 ⚙️',
        gridType: 'amber',
        technicalSpecs: [
          { label: '能源自給率 (Energy Independence)', value: '100% 太陽能 + 風力互補' },
          { label: '雨水利用率 (Rain Harvest)', value: '年回收 12,000 公升中水' },
          { label: '建材等級 (Eco Materials)', value: 'FSC 認證原木與循環矽藻土' },
          { label: '碳排放量 (Carbon Footprint)', value: '淨零排放 (Net-Zero Carbon)' },
        ],
        printableSummary: '本圖紙詳解被動式建築設計四大要素：南向自然採光、地底冷熱通風對流、屋頂植被隔熱與雨水多級重力過濾槽。',
        hotspots: [
          {
            id: 'hs_solar_array',
            xPercent: 30,
            yPercent: 22,
            labelZh: '光伏太陽能板陣列 (Photovoltaic Array)',
            labelEn: 'Solar PV Panels',
            brief: '傾斜 30 度角最佳採光，轉換陽光為交流電供給全屋照明與智慧家電。',
            scientificFact: '搭配鋰鐵儲能電池，白天吸收的太陽光能儲存至夜晚使用，達成 24 小時零碳供電！',
            vocab: { word: 'Photovoltaic', phonetic: '/ˌfoʊtoʊvɑːlˈteɪɪk/', translation: '光電轉換的' },
          },
          {
            id: 'hs_rain_tank',
            xPercent: 78,
            yPercent: 68,
            labelZh: '多層砂石雨水淨化水槽 (Rain Filter Tank)',
            labelEn: 'Rainwater Cistern',
            brief: '收集屋頂雨水，經由石英砂、活性碳與紫外線三道濾淨，供應花園澆灌與沖廁。',
            scientificFact: '水資源循環能大幅減少水庫負擔，屋頂綠植還能吸收雨水減緩都市暴雨淹水！',
            vocab: { word: 'Purification', phonetic: '/ˌpjʊrɪfɪˈkeɪʃn/', translation: '淨化、過濾' },
          },
          {
            id: 'hs_ventilation',
            xPercent: 52,
            yPercent: 50,
            labelZh: '風壓煙囪對流系統 (Thermal Chimney)',
            labelEn: 'Natural Ventilation Duct',
            brief: '利用熱空氣上升原理，將室內悶熱氣流自上方導出，從底層吸入清涼新鮮空氣。',
            scientificFact: '不用開冷氣就能讓室溫自然降低 3~5°C，這就是傳統建築智慧與現代熱力學的完美結合。',
            vocab: { word: 'Ventilation', phonetic: '/ˌventɪˈleɪʃn/', translation: '通風對流' },
          },
        ],
      },

      // Blueprint 3: 🌳 森林光合作用與生態能量循環剖面圖
      {
        id: 'bp_forest_photosynthesis',
        titleZh: '森林光合作用與生態能量循環剖面圖',
        titleEn: 'Forest Photosynthesis & Biomass Energy Flowchart',
        codeName: 'SPEC-BIO-CYCLE-09',
        category: 'nature',
        categoryLabel: '生命生態百科',
        themeColor: 'emerald',
        icon: '🌳',
        scaleRatio: 'MICROSCOPIC & MACRO',
        revision: 'REV 4.0 (BIO-CORE)',
        description: '葉綠體光反應與暗反應能量轉化、根系菌根共生網絡與林冠層-土壤層養分循環剖面圖解。',
        sourceBookTitle: '森林小樹苗的秘密日記',
        sourceBookId: 'book-tree',
        heroIllustrationEmoji: '🌳 🍃 🔬 🍄 ☀️',
        gridType: 'cyan',
        technicalSpecs: [
          { label: '能量轉化效率 (Efficiency)', value: '陽光光能 → 化學能 (ATP/NADPH)' },
          { label: '主要產物 (Key Outputs)', value: '葡萄糖 (C₆H₁₂O₆) + 氧氣 (O₂)' },
          { label: '地底互聯網 (Wood Wide Web)', value: '菌根真菌網絡傳遞養分與警訊' },
          { label: '碳匯能力 (Carbon Sink)', value: '一公頃成熟林年固碳約 15 噸' },
        ],
        printableSummary: '本圖紙圖解植物微觀葉綠餅構造、氣孔開閉調節蒸散作用，以及大樹如何透過地底菌絲與周圍幼苗分享水分。',
        hotspots: [
          {
            id: 'hs_chloroplast',
            xPercent: 28,
            yPercent: 32,
            labelZh: '葉綠體微觀工廠 (Chloroplast Matrix)',
            labelEn: 'Chloroplast Organelle',
            brief: '含有豐富葉綠素，吸收藍光與紅光，驅動光解水反應製造氧氣。',
            scientificFact: '葉綠素不吸收綠光並將其反射出來，這就是為什麼我們看到的樹葉大多呈現翠綠色！',
            vocab: { word: 'Chlorophyll', phonetic: '/ˈklɔːrəfɪl/', translation: '葉綠素' },
          },
          {
            id: 'hs_mycorrhizal',
            xPercent: 62,
            yPercent: 78,
            labelZh: '地下菌根真菌共生網絡 (Mycorrhizal Network)',
            labelEn: 'Subterranean Fungal Grid',
            brief: '大樹的根與真菌菌絲緊密連結，像網際網路一樣在整座森林樹木之間傳遞糖分與防禦訊號。',
            scientificFact: '當一棵樹遭受害蟲攻擊時，會透過菌根網絡向幾十公尺外的鄰居發出警報，讓其他樹及早產生防禦苦味素！',
            vocab: { word: 'Symbiosis', phonetic: '/ˌsɪmbaɪˈoʊsɪs/', translation: '共生關係' },
          },
        ],
      },

      // Blueprint 4: 🧭 深海洋流與發光生物解剖藍圖
      {
        id: 'bp_ocean_abyss',
        titleZh: '深海洋流與生物發光解剖藍圖',
        titleEn: 'Deep Ocean Currents & Bioluminescence Schematic',
        codeName: 'SPEC-OCEAN-DEEP-42',
        category: 'nature',
        categoryLabel: '海洋深邃科普',
        themeColor: 'purple',
        icon: '🌊',
        scaleRatio: 'DEPTH: 0 ~ 11,000m',
        revision: 'REV 1.8 (DEEP DIVE)',
        description: '全球大洋溫鹽環流帶 (Conveyor Belt)、深海熱泉生態系與深海魚類自體生物發光化學反應圖解。',
        sourceBookTitle: '深海奇幻之旅',
        sourceBookId: 'book-ocean',
        heroIllustrationEmoji: '🌊 🦑 💡 🧭 ⚓',
        gridType: 'cyan',
        technicalSpecs: [
          { label: '最深探測點 (Max Depth)', value: '馬里亞納海溝 (10,994 公尺)' },
          { label: '水壓極限 (Hydrostatic Pressure)', value: '超過 1,000 大氣壓 (相當於坦克壓在指甲上)' },
          { label: '生物發光率 (Bioluminescence)', value: '午夜區 (200~1000m) 超過 90% 生物可發光' },
        ],
        printableSummary: '本圖紙涵蓋螢光素酶化學冷光反應公式、深海熱泉硫化菌初級生產者，以及巨型烏賊適應高壓的大直徑水晶體結構。',
        hotspots: [
          {
            id: 'hs_biolum',
            xPercent: 42,
            yPercent: 40,
            labelZh: '冷光發光器 (Photophore Organ)',
            labelEn: 'Bioluminescent Photophore',
            brief: '螢光素在螢光素酶的催化下氧化，釋放出接近 100% 轉換率且不發熱的冷光。',
            scientificFact: '深海安康魚頭頂的小發光燈籠其實是由共生發光細菌組成的，用來在漆黑海底吸引獵物！',
            vocab: { word: 'Bioluminescence', phonetic: '/ˌbaɪoʊˌluːmɪˈnesns/', translation: '生物發光' },
          },
        ],
      },

      // Blueprint 5: 🚂 蒸汽齒輪與奇幻時空機械構造圖
      {
        id: 'bp_steampunk_gears',
        titleZh: '蒸汽齒輪與奇幻時空機械構造圖',
        titleEn: 'Steampunk Mechanical Chronometer Blueprint',
        codeName: 'SPEC-MECH-CHRONO-88',
        category: 'tech',
        categoryLabel: '機械工程發明',
        themeColor: 'amber',
        icon: '⚙️',
        scaleRatio: '1 : 1 PRECISION',
        revision: 'REV 5.2 (MASTER CRAFT)',
        description: '高精度擒縱機構 (Escapement)、行星齒輪減速機、黃銅差速器與發條彈簧儲能系統工程藍圖。',
        sourceBookTitle: '蒸汽齒輪奇幻發明家',
        sourceBookId: 'book-gear',
        heroIllustrationEmoji: '⚙️ 🚂 🕰️ 🔩 🔑',
        gridType: 'amber',
        technicalSpecs: [
          { label: '齒輪嚙合度 (Gear Mesh)', value: '漸開線齒廓 (Involute Tooth)' },
          { label: '儲能介質 (Energy Storage)', value: '發條鋼帶彈性勢能' },
          { label: '振頻精度 (Beat Frequency)', value: '28,800 次/小時 (4Hz 精準走時)' },
        ],
        printableSummary: '本圖紙詳解齒輪比傳動公式 (Ratio = N₂/N₁)、擒縱輪與擒縱叉如何將連續旋轉轉換為規律等時的擺動。',
        hotspots: [
          {
            id: 'hs_escapement',
            xPercent: 50,
            yPercent: 45,
            labelZh: '瑞士槓桿擒縱輪 (Swiss Lever Escapement)',
            labelEn: 'Anchor Escapement Unit',
            brief: '鐘錶的心臟，將發條的能量一點一滴等速釋放，發出清脆的「滴答」聲。',
            scientificFact: '擒縱機構的紅寶石軸承硬度僅次於鑽石，能減少摩擦損耗長達數十年不需要更換！',
            vocab: { word: 'Escapement', phonetic: '/ɪˈskeɪpmənt/', translation: '擒縱機構' },
          },
        ],
      },

      // Blueprint 6: 🐝 蜜蜂授粉與六角蜂巢幾何結構圖
      {
        id: 'bp_beehive_geometry',
        titleZh: '蜜蜂授粉與六角蜂巢幾何結構圖',
        titleEn: 'Hexagonal Beehive Geometry & Pollination Guide',
        codeName: 'SPEC-BIO-HEX-12',
        category: 'nature',
        categoryLabel: '自然幾何奇蹟',
        themeColor: 'emerald',
        icon: '🐝',
        scaleRatio: 'SCALE 5 : 1 MACRO',
        revision: 'REV 1.0 (NATURE ARCH)',
        description: '正六角形密鋪 (Hexagonal Tiling) 空間利用率分析、蜂蠟分泌腺與花粉籃授粉解剖圖解。',
        sourceBookTitle: '勤勞小蜜蜂的甜甜花園',
        sourceBookId: 'book-bee',
        heroIllustrationEmoji: '🐝 🍯 🌸 📐 💛',
        gridType: 'cyan',
        technicalSpecs: [
          { label: '幾何形狀 (Geometry)', value: '正六邊形密鋪 (120° 內角)' },
          { label: '材料效率 (Wax Efficiency)', value: '周長最小、容積最大之完美幾何解' },
          { label: '蜂房傾斜角 (Tilt Angle)', value: '向內傾斜 9~14° 防止蜂蜜流出' },
        ],
        printableSummary: '數學家證明了正六邊形是將平面分割成相等面積時，周長總和最小的形狀，蜜蜂不學幾何卻找到了最省蜂蠟的建築法！',
        hotspots: [
          {
            id: 'hs_hex_tile',
            xPercent: 50,
            yPercent: 35,
            labelZh: '正六角形幾何蜂室 (Hexagonal Cell Matrix)',
            labelEn: 'Hexagonal Honeycomb Cell',
            brief: '三個 120 度角交會形成最穩固的抗壓結構，承受自身重量 30 倍以上的蜂蜜。',
            scientificFact: '如果蜂巢做成圓形，相鄰圓形之間會留下許多無法利用的空隙；而六邊形能夠無縫密鋪！',
            vocab: { word: 'Hexagon', phonetic: '/ˈheksəɡɑːn/', translation: '正六邊形' },
          },
        ],
      },
    ];
  }, []);

  // Category Counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: allEncyclopediaCards.length,
      fairytale: 0,
      science: 0,
      adventure: 0,
      space: 0,
      tech: 0,
      wisdom: 0,
    };
    allEncyclopediaCards.forEach((c) => {
      if (c.bookCategory && counts[c.bookCategory] !== undefined) {
        counts[c.bookCategory]++;
      }
    });
    return counts;
  }, [allEncyclopediaCards]);

  // Mastery Status Counts
  const masteryCounts = useMemo(() => {
    let masteredCount = 0;
    let needsReviewCount = 0;
    let favoritesCount = 0;

    allEncyclopediaCards.forEach((c) => {
      if (c.isMastered) masteredCount++;
      if (c.needsReview) needsReviewCount++;
      if (c.isFavorite) favoritesCount++;
    });

    return {
      all: allEncyclopediaCards.length,
      mastered: masteredCount,
      needs_review: needsReviewCount,
      favorites: favoritesCount,
    };
  }, [allEncyclopediaCards]);

  // Filtered Cards based on Book Category, Mastery Status, Domain & Search
  const filteredCards = useMemo(() => {
    return allEncyclopediaCards.filter((card) => {
      // 1. Book Category Filter (繪本類別)
      if (selectedCategory !== 'all' && card.bookCategory !== selectedCategory) {
        return false;
      }

      // 2. Mastery Status Filter (掌握度/複習狀態)
      if (selectedMasteryStatus === 'mastered' && !card.isMastered) {
        return false;
      }
      if (selectedMasteryStatus === 'needs_review' && !card.needsReview) {
        return false;
      }
      if (selectedMasteryStatus === 'favorites' && !card.isFavorite) {
        return false;
      }

      // 3. Domain filter (領域)
      if (selectedDomain !== 'all' && card.domain !== selectedDomain) {
        return false;
      }

      // 4. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchWord = card.word.toLowerCase().includes(q);
        const matchPinyin = card.pinyin?.toLowerCase().includes(q);
        const matchPhonetic = card.phonetic?.toLowerCase().includes(q);
        const matchTrans = card.translation.toLowerCase().includes(q);
        const matchDef = card.definition.toLowerCase().includes(q);
        const matchTag = card.tags.some((t) => t.toLowerCase().includes(q));
        const matchBook = card.sourceBookTitle.toLowerCase().includes(q);
        const matchCat = card.bookCategoryLabel?.toLowerCase().includes(q);
        if (!matchWord && !matchPinyin && !matchPhonetic && !matchTrans && !matchDef && !matchTag && !matchBook && !matchCat) {
          return false;
        }
      }
      return true;
    });
  }, [allEncyclopediaCards, selectedCategory, selectedMasteryStatus, selectedDomain, searchQuery]);

  // Helper: Enqueue an offline sync event
  const enqueueSyncEvent = (event: Omit<OfflineSyncEvent, 'id' | 'timestamp'>) => {
    const newEvent: OfflineSyncEvent = {
      ...event,
      id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      timestamp: new Date().toLocaleTimeString(),
    };
    const updatedQueue = [newEvent, ...syncQueue].slice(0, 50); // keep last 50
    setSyncQueue(updatedQueue);
    try {
      localStorage.setItem('pwa_encyclopedia_sync_queue', JSON.stringify(updatedQueue));
    } catch (e) {
      console.warn(e);
    }
  };

  // Toggle Mastery Status for a Card
  const handleToggleMastery = (cardId: string, word: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    playStarChime();

    const currentRecord = cardMasteryMap[cardId];
    const willBeMastered = !(currentRecord?.isMastered ?? false);
    const newRecord: CardMasteryRecord = {
      masteryLevel: willBeMastered ? 100 : 70,
      isMastered: willBeMastered,
      needsReview: !willBeMastered,
      reviewCount: (currentRecord?.reviewCount ?? 1) + 1,
      lastReviewedAt: new Date().toLocaleDateString(),
    };

    const updatedMap = {
      ...cardMasteryMap,
      [cardId]: newRecord,
    };
    setCardMasteryMap(updatedMap);

    try {
      localStorage.setItem('pwa_encyclopedia_mastery_states', JSON.stringify(updatedMap));
    } catch (err) {
      console.warn(err);
    }

    // Award bonus crystal on mastery
    if (willBeMastered && onAddCrystals) {
      onAddCrystals(10);
    }

    enqueueSyncEvent({
      cardId,
      word,
      action: willBeMastered ? 'mark_mastered' : 'mark_review',
      summary: willBeMastered ? `已掌握生字「${word}」(+10💎)` : `將「${word}」移至待複習清單`,
    });
  };

  // Toggle Needs Review Status
  const handleToggleNeedsReview = (cardId: string, word: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    playPageTurnSound();

    const currentRecord = cardMasteryMap[cardId];
    const willNeedReview = !(currentRecord?.needsReview ?? false);
    const newRecord: CardMasteryRecord = {
      masteryLevel: willNeedReview ? 70 : 95,
      isMastered: !willNeedReview,
      needsReview: willNeedReview,
      reviewCount: (currentRecord?.reviewCount ?? 1) + 1,
      lastReviewedAt: new Date().toLocaleDateString(),
    };

    const updatedMap = {
      ...cardMasteryMap,
      [cardId]: newRecord,
    };
    setCardMasteryMap(updatedMap);

    try {
      localStorage.setItem('pwa_encyclopedia_mastery_states', JSON.stringify(updatedMap));
    } catch (err) {
      console.warn(err);
    }

    enqueueSyncEvent({
      cardId,
      word,
      action: willNeedReview ? 'mark_review' : 'mark_mastered',
      summary: willNeedReview ? `標記「${word}」待複習` : `取消「${word}」待複習標記`,
    });
  };

  // Handle Flipping a Card & Record Review Activity
  const handleToggleFlipCard = (id: string, word?: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    playPageTurnSound();

    const isNowFlipped = !flippedCardIds[id];
    setFlippedCardIds((prev) => ({
      ...prev,
      [id]: isNowFlipped,
    }));

    // If flipping to back face (viewing definitions & illustrations), update review count
    if (isNowFlipped && word) {
      const current = cardMasteryMap[id];
      const updatedMap = {
        ...cardMasteryMap,
        [id]: {
          masteryLevel: current?.masteryLevel ?? 85,
          isMastered: current?.isMastered ?? false,
          needsReview: current?.needsReview ?? true,
          reviewCount: (current?.reviewCount ?? 0) + 1,
          lastReviewedAt: new Date().toLocaleDateString(),
        },
      };
      setCardMasteryMap(updatedMap);
      try {
        localStorage.setItem('pwa_encyclopedia_mastery_states', JSON.stringify(updatedMap));
      } catch (err) {
        console.warn(err);
      }

      enqueueSyncEvent({
        cardId: id,
        word,
        action: 'flip_review',
        summary: `完成卡片「${word}」3D 翻轉深度複習`,
      });
    }
  };

  // Perform Manual or Automatic Sync
  const handleManualSync = () => {
    setIsSyncing(true);
    playStarChime();

    setTimeout(() => {
      const nowStr = new Date().toLocaleString();
      setLastSyncTime(nowStr);
      try {
        localStorage.setItem('pwa_encyclopedia_last_sync', nowStr);
        // Clear processed sync queue
        setSyncQueue([]);
        localStorage.setItem('pwa_encyclopedia_sync_queue', JSON.stringify([]));
      } catch (err) {
        console.warn(err);
      }
      setIsSyncing(false);
      if (onAddCrystals) {
        onAddCrystals(15);
      }
    }, 1200);
  };

  // Export Learning Records to JSON backup
  const handleExportBackup = () => {
    playStarChime();
    const backupData = {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      favoriteCardIds,
      cardMasteryMap,
      syncQueue,
      questCrystals,
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `wcdl_encyclopedia_progress_backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import Backup
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], 'UTF-8');
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed.favoriteCardIds) {
            setFavoriteCardIds(parsed.favoriteCardIds);
            localStorage.setItem('pwa_encyclopedia_favorites', JSON.stringify(parsed.favoriteCardIds));
          }
          if (parsed.cardMasteryMap) {
            setCardMasteryMap(parsed.cardMasteryMap);
            localStorage.setItem('pwa_encyclopedia_mastery_states', JSON.stringify(parsed.cardMasteryMap));
          }
          playStarChime();
          alert('🎉 離線學習進度已成功還原匯入！');
        } catch (err) {
          alert('匯入失敗：檔案格式不正確');
        }
      };
    }
  };

  // Toggle Favorite Card
  const handleToggleFavorite = (id: string, word: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    playStarChime();
    let updated: string[];
    const isFavNow = !favoriteCardIds.includes(id);
    if (!isFavNow) {
      updated = favoriteCardIds.filter((cid) => cid !== id);
    } else {
      updated = [...favoriteCardIds, id];
    }
    setFavoriteCardIds(updated);
    try {
      localStorage.setItem('pwa_encyclopedia_favorites', JSON.stringify(updated));
    } catch (err) {
      console.warn(err);
    }

    enqueueSyncEvent({
      cardId: id,
      word,
      action: 'favorite_toggle',
      summary: isFavNow ? `將「${word}」加入收藏星標` : `取消「${word}」收藏星標`,
    });
  };

  // Speak Card Word & Encyclopedia Fact with Pinyin & Bilingual Sentence
  const handleSpeakCard = (card: EncyclopediaCard, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    playStarChime();
    setIsSpeaking(true);
    const speechText = `${card.word}，拼音：${card.pinyin}。國際音標：${card.phonetic}。中文釋義：${card.translation}。小博士詳細定義：${card.definition}。生活例句：${card.exampleSentence}，翻譯為：${card.exampleTranslation}。小博士科普知識：${card.encyclopediaFact}`;
    speakText(speechText, 'zh-TW', 1.0, voiceRole, 1.0, () => setIsSpeaking(false));

    enqueueSyncEvent({
      cardId: card.id,
      word: card.word,
      action: 'listen',
      summary: `收聽「${card.word}」雙語拼音導讀`,
    });
  };

  // Bulk Flip / Reset All Filtered Cards
  const handleFlipAllCards = (flipState: boolean) => {
    playPageTurnSound();
    const updated: Record<string, boolean> = {};
    filteredCards.forEach((c) => {
      updated[c.id] = flipState;
    });
    setFlippedCardIds(updated);
  };

  // Speak Hotspot Scientific Fact
  const handleSpeakHotspot = (hs: BlueprintHotspot, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    playStarChime();
    setIsSpeaking(true);
    const text = `圖紙組件解析：${hs.labelZh}，英文為 ${hs.vocab.word}。${hs.brief}。科學原理：${hs.scientificFact}`;
    speakText(text, 'zh-TW', 1.0, voiceRole, 1.0, () => setIsSpeaking(false));
  };

  // Pop-Quiz Questions generated from cards
  const quizPool = useMemo(() => {
    return allEncyclopediaCards.map((c, index) => {
      // Pick 3 random wrong definitions
      const otherCards = allEncyclopediaCards.filter((x) => x.id !== c.id);
      const wrong1 = otherCards[index % otherCards.length]?.translation || '未知的科學概念';
      const wrong2 = otherCards[(index + 1) % otherCards.length]?.translation || '奇特的魔法現象';
      const wrong3 = otherCards[(index + 2) % otherCards.length]?.translation || '自然界的暫時變化';

      const options = [c.translation, wrong1, wrong2, wrong3].sort(() => 0.5 - Math.random());
      const correctIndex = options.indexOf(c.translation);

      return {
        card: c,
        question: `英文單字「${c.word} (${c.phonetic})」在百科中的最精確中文釋義是什麼？`,
        options,
        correctIndex,
        explanation: `${c.word} 的中文意思是【${c.translation}】！${c.encyclopediaFact}`,
      };
    });
  }, [allEncyclopediaCards]);

  const currentQuiz = quizPool[quizQuestionIndex % quizPool.length];

  // Handle answering quiz
  const handleAnswerQuiz = (optIndex: number) => {
    if (quizAnswered) return;
    setQuizSelectedOption(optIndex);
    setQuizAnswered(true);

    const isCorrect = optIndex === currentQuiz.correctIndex;
    if (isCorrect) {
      playStarChime();
      const newScore = quizScore + 100;
      const newStreak = quizStreak + 1;
      setQuizScore(newScore);
      setQuizStreak(newStreak);
      if (onAddCrystals) onAddCrystals(25);
      speakText(`答對了！太厲害了！獲得 +25 知識水晶！${currentQuiz.explanation}`, 'zh-TW', 1.0, voiceRole);
    } else {
      setQuizStreak(0);
      speakText(`差一點點！正確答案是「${currentQuiz.options[currentQuiz.correctIndex]}」！${currentQuiz.explanation}`, 'zh-TW', 1.0, voiceRole);
    }
  };

  const handleNextQuiz = () => {
    playPageTurnSound();
    setQuizQuestionIndex((prev) => prev + 1);
    setQuizSelectedOption(null);
    setQuizAnswered(false);
  };

  // =========================================================================
  // 🔗 詞彙連連看 (VOCAB MATCH CHALLENGE) GAME ENGINE & AUTO-CLASSIFICATION
  // =========================================================================

  // Initialize or Restart Match Game
  const initMatchGame = (pairCount = matchPairCount, catFilter = matchCategoryFilter) => {
    playPageTurnSound();

    // 1. Filter pool from all cards
    let pool: EncyclopediaCard[] = [];
    if (catFilter === 'favorites') {
      pool = allEncyclopediaCards.filter((c) => c.isFavorite);
    } else if (catFilter !== 'all') {
      pool = allEncyclopediaCards.filter((c) => c.bookCategory === catFilter);
    } else {
      pool = [...allEncyclopediaCards];
    }

    // If candidate cards are fewer than pairCount, fallback/supplement with all cards
    if (pool.length < pairCount) {
      const remainingCards = allEncyclopediaCards.filter((c) => !pool.some((p) => p.id === c.id));
      pool = [...pool, ...remainingCards];
    }

    // Shuffle candidate cards and select pairCount cards
    const shuffledPool = [...pool].sort(() => 0.5 - Math.random());
    const selectedCards = shuffledPool.slice(0, Math.min(pairCount, shuffledPool.length));

    setActiveMatchRoundCards(selectedCards);

    // Prepare Left cards (Word, Pinyin, IPA, Domain Emoji)
    const leftItems = selectedCards.map((c) => ({
      cardId: c.id,
      word: c.word,
      pinyin: c.pinyin,
      phonetic: c.phonetic,
      emoji: c.domainEmoji || '🌟',
      categoryLabel: c.bookCategoryLabel || '科普百科',
      domainEmoji: c.domainEmoji || '✨',
      partOfSpeech: c.partOfSpeech || 'n.',
      color: c.themeColor || 'from-cyan-600 to-blue-700',
    })).sort(() => 0.5 - Math.random());

    // Prepare Right cards (Translation, Definition, Sentence context, Book)
    const rightItems = selectedCards.map((c) => ({
      cardId: c.id,
      translation: c.translation,
      definition: c.definition,
      exampleSnippet: c.exampleSentence,
      sourceBookTitle: c.sourceBookTitle,
      partOfSpeech: c.partOfSpeech,
    })).sort(() => 0.5 - Math.random());

    setMatchLeftCards(leftItems);
    setMatchRightCards(rightItems);
    setSelectedLeftId(null);
    setSelectedRightId(null);
    setMatchedPairIds([]);
    setMatchErrorCounts({});
    setMismatchPair(null);
    setMatchCombo(0);
    setMaxCombo(0);
    setMatchScore(0);
    setMatchTimerSeconds(0);
    setIsMatchTimerRunning(true);
    setIsMatchGameComplete(false);
    setAwardedBonusCrystals(0);
  };

  // Timer Effect for Match Game
  useEffect(() => {
    let interval: any = null;
    if (activeView === 'match_game' && isMatchTimerRunning && !isMatchGameComplete) {
      interval = setInterval(() => {
        setMatchTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeView, isMatchTimerRunning, isMatchGameComplete]);

  // Auto-init Match Game on First View Entry
  useEffect(() => {
    if (activeView === 'match_game' && matchLeftCards.length === 0) {
      initMatchGame(matchPairCount, matchCategoryFilter);
    }
  }, [activeView, matchLeftCards.length, allEncyclopediaCards]);

  // Execute Match Check between Left and Right selections
  const executeMatchCheck = (leftId: string, rightId: string) => {
    if (leftId === rightId) {
      // 🌟 MATCH SUCCESS!
      playStarChime();
      const newMatched = [...matchedPairIds, leftId];
      setMatchedPairIds(newMatched);

      const newCombo = matchCombo + 1;
      setMatchCombo(newCombo);
      if (newCombo > maxCombo) setMaxCombo(newCombo);

      const roundPoints = 100 + newCombo * 25;
      setMatchScore((prev) => prev + roundPoints);

      setSelectedLeftId(null);
      setSelectedRightId(null);

      const targetCard = activeMatchRoundCards.find((c) => c.id === leftId);
      if (targetCard) {
        speakText(`配對成功！${targetCard.word}，中文是【${targetCard.translation}】！`, 'zh-TW', 1.0, voiceRole);
      }

      // Check if all pairs are successfully matched
      if (newMatched.length === matchLeftCards.length && matchLeftCards.length > 0) {
        setIsMatchTimerRunning(false);
        setIsMatchGameComplete(true);
        setMatchRoundHistoryCount((prev) => prev + 1);

        // Calculate Crystal Rewards: Base 35 + combo bonus + difficulty bonus
        const diffBonus = matchPairCount === 8 ? 25 : matchPairCount === 6 ? 15 : 5;
        const comboBonus = Math.min(newCombo * 5, 25);
        const totalBonusCrystals = 35 + comboBonus + diffBonus;

        setAwardedBonusCrystals(totalBonusCrystals);
        if (onAddCrystals) {
          onAddCrystals(totalBonusCrystals);
        }

        // Automatic Mastery Updating: Mark 0-error cards as mastered in local progress
        const updatedMap = { ...cardMasteryMap };
        let zeroErrorCount = 0;
        activeMatchRoundCards.forEach((c) => {
          const errCount = matchErrorCounts[c.id] || 0;
          if (errCount === 0) {
            zeroErrorCount++;
            updatedMap[c.id] = {
              masteryLevel: 100,
              isMastered: true,
              needsReview: false,
              reviewCount: (updatedMap[c.id]?.reviewCount ?? 0) + 1,
              lastReviewedAt: new Date().toLocaleDateString(),
            };
          }
        });
        setCardMasteryMap(updatedMap);
        try {
          localStorage.setItem('pwa_encyclopedia_mastery_states', JSON.stringify(updatedMap));
        } catch (e) {
          console.warn(e);
        }

        enqueueSyncEvent({
          cardId: 'match_game_victory',
          word: '詞彙連連看挑戰',
          action: 'mark_mastered',
          summary: `完成【詞彙連連看】${matchLeftCards.length}對配對挑戰 (+${totalBonusCrystals}💎, ${zeroErrorCount}字零失誤直接精通)`,
        });

        setTimeout(() => {
          playStarChime();
        }, 400);
      }
    } else {
      // ❌ MATCH MISMATCH!
      playPageTurnSound();
      setMismatchPair({ leftId, rightId });
      setMatchCombo(0);
      setMatchErrorCounts((prev) => ({
        ...prev,
        [leftId]: (prev[leftId] || 0) + 1,
        [rightId]: (prev[rightId] || 0) + 1,
      }));

      setTimeout(() => {
        setMismatchPair(null);
        setSelectedLeftId(null);
        setSelectedRightId(null);
      }, 700);
    }
  };

  // Handle Clicking Left Item (Vocabulary Word)
  const handleSelectLeftCard = (cardId: string, word: string) => {
    if (matchedPairIds.includes(cardId) || isMatchGameComplete || mismatchPair) return;
    playStarChime();
    speakText(word, 'zh-TW', 1.0, voiceRole);

    if (selectedLeftId === cardId) {
      setSelectedLeftId(null);
      return;
    }

    setSelectedLeftId(cardId);
    if (selectedRightId) {
      executeMatchCheck(cardId, selectedRightId);
    }
  };

  // Handle Clicking Right Item (Definition)
  const handleSelectRightCard = (cardId: string) => {
    if (matchedPairIds.includes(cardId) || isMatchGameComplete || mismatchPair) return;
    playPageTurnSound();

    if (selectedRightId === cardId) {
      setSelectedRightId(null);
      return;
    }

    setSelectedRightId(cardId);
    if (selectedLeftId) {
      executeMatchCheck(selectedLeftId, cardId);
    }
  };

  // 📊 Auto-Classification Analysis for Match Game Round
  const matchClassification = useMemo(() => {
    const masteredCards: EncyclopediaCard[] = [];
    const needsReviewCards: EncyclopediaCard[] = [];
    const domainCounts: Record<string, { count: number; emoji: string; label: string }> = {};
    const partOfSpeechCounts: Record<string, number> = {};
    const sourceBooks: Record<string, { count: number; bookId?: string; title: string }> = {};

    activeMatchRoundCards.forEach((card) => {
      const errCount = matchErrorCounts[card.id] || 0;
      if (errCount === 0) {
        masteredCards.push(card);
      } else {
        needsReviewCards.push(card);
      }

      // Domain
      const dKey = card.domain || 'other';
      if (!domainCounts[dKey]) {
        domainCounts[dKey] = {
          count: 0,
          emoji: card.domainEmoji || '✨',
          label: card.domainLabel || '科普',
        };
      }
      domainCounts[dKey].count++;

      // Part of Speech
      const pos = card.partOfSpeech || '名詞';
      partOfSpeechCounts[pos] = (partOfSpeechCounts[pos] || 0) + 1;

      // Source Books
      const bTitle = card.sourceBookTitle || '精選百科繪本';
      if (!sourceBooks[bTitle]) {
        sourceBooks[bTitle] = {
          count: 0,
          bookId: card.sourceBookId,
          title: bTitle,
        };
      }
      sourceBooks[bTitle].count++;
    });

    return {
      masteredCards,
      needsReviewCards,
      domainCounts,
      partOfSpeechCounts,
      sourceBooks,
    };
  }, [activeMatchRoundCards, matchErrorCounts]);

  // One-Click: Add all needs review cards to local review queue
  const handleAddAllNeedsReviewToQueue = () => {
    playStarChime();
    const updatedMap = { ...cardMasteryMap };
    matchClassification.needsReviewCards.forEach((c) => {
      updatedMap[c.id] = {
        masteryLevel: 70,
        isMastered: false,
        needsReview: true,
        reviewCount: (updatedMap[c.id]?.reviewCount ?? 0) + 1,
        lastReviewedAt: new Date().toLocaleDateString(),
      };

      enqueueSyncEvent({
        cardId: c.id,
        word: c.word,
        action: 'mark_review',
        summary: `連連看錯題自動歸類：將「${c.word}」加入待複習清單`,
      });
    });

    setCardMasteryMap(updatedMap);
    try {
      localStorage.setItem('pwa_encyclopedia_mastery_states', JSON.stringify(updatedMap));
      alert(`✅ 已成功將 ${matchClassification.needsReviewCards.length} 個待加強詞彙自動加入離線待複習清單！`);
    } catch (e) {
      console.warn(e);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn select-none text-slate-100">
      {/* 🌟 1. ENCYCLOPEDIA HEADER & GLOBAL MODE SWITCH */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-slate-950 via-cyan-950/80 to-slate-950 border-2 border-cyan-400/60 shadow-2xl space-y-4 relative overflow-hidden">
        {/* Background glow orb */}
        <div className="absolute top-0 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 via-teal-500 to-blue-600 flex items-center justify-center text-3xl shadow-xl border-2 border-cyan-200 shrink-0 animate-pulse">
              📚
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg sm:text-xl font-black text-cyan-300 flex items-center gap-2">
                  <span>離線百科知識庫 (Offline Encyclopedia & Blueprints)</span>
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-cyan-500/30 text-cyan-200 border border-cyan-400/50 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-cyan-300" />
                  <span>生字自動彙整 ‧ 離線趣味複習</span>
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-400/40">
                  📐 6 大科普圖紙總覽
                </span>
              </div>
              <p className="text-xs font-bold text-slate-300 mt-1 leading-relaxed">
                將生字本與繪本掌握的關鍵詞彙自動編纂成精美的雙語科普百科卡片。提供 3D 翻轉閃卡、趣味快問快答與高解析離線工程圖紙！
              </p>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex items-center gap-2.5 flex-wrap self-start lg:self-auto">
            {/* Mastered Cards Counter */}
            <div className="flex items-center gap-2 bg-slate-900/90 px-3.5 py-2 rounded-2xl border border-cyan-500/40 shadow-md">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <div>
                <span className="text-[10px] font-bold text-slate-400 block">已編纂百科卡</span>
                <span className="text-sm font-black text-cyan-300">{allEncyclopediaCards.length} 張</span>
              </div>
            </div>

            {/* Blueprints Counter */}
            <div className="flex items-center gap-2 bg-slate-900/90 px-3.5 py-2 rounded-2xl border border-amber-500/40 shadow-md">
              <Layers className="w-4 h-4 text-amber-400" />
              <div>
                <span className="text-[10px] font-bold text-slate-400 block">離線圖紙庫</span>
                <span className="text-sm font-black text-amber-300">{scienceBlueprints.length} 幅</span>
              </div>
            </div>

            {/* Crystals */}
            <div className="flex items-center gap-2 bg-slate-900/90 px-3.5 py-2 rounded-2xl border border-purple-500/40 shadow-md">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <div>
                <span className="text-[10px] font-bold text-slate-400 block">知識水晶</span>
                <span className="text-sm font-black text-purple-300">{questCrystals} 💎</span>
              </div>
            </div>
          </div>
        </div>

        {/* View Mode Switcher & Narrator Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-cyan-500/30 relative z-10">
          {/* Main 4 View Tabs */}
          <div className="flex items-center bg-slate-950 p-1 rounded-2xl border border-cyan-500/40 shadow-inner flex-wrap gap-1">
            <button
              onClick={() => {
                playPageTurnSound();
                setActiveView('cards');
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                activeView === 'cards'
                  ? 'bg-cyan-500 text-slate-950 shadow-md scale-105'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>🃏 精美百科卡片庫 ({allEncyclopediaCards.length})</span>
            </button>

            <button
              onClick={() => {
                playStarChime();
                setActiveView('blueprints');
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                activeView === 'blueprints'
                  ? 'bg-amber-400 text-slate-950 shadow-md scale-105'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>📐 離線圖紙總覽 ({scienceBlueprints.length})</span>
              <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-amber-950 text-amber-200 border border-amber-400/40">
                可互動
              </span>
            </button>

            <button
              onClick={() => {
                playStarChime();
                setActiveView('match_game');
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                activeView === 'match_game'
                  ? 'bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 font-black shadow-md scale-105'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Link2 className="w-3.5 h-3.5" />
              <span>🔗 詞彙連連看 (+50 💎)</span>
              <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-emerald-950 text-emerald-300 border border-emerald-400/40 animate-pulse">
                小遊戲
              </span>
            </button>

            <button
              onClick={() => {
                playStarChime();
                setActiveView('quiz');
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                activeView === 'quiz'
                  ? 'bg-purple-500 text-white shadow-md scale-105'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>⚡ 趣味快問快答 (+25 💎)</span>
            </button>
          </div>

          {/* Narrator Voice Picker */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-bold text-cyan-300">導讀師：</span>
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
              {NARRATOR_PERSONAS.map((p) => {
                const isSelected = voiceRole === p.role;
                return (
                  <button
                    key={p.role}
                    onClick={() => {
                      playStarChime();
                      setVoiceRole(p.role);
                      speakText(`我是你的百科知識導讀師：${p.name}！讓我們一同探索這奇妙的世界！`, 'zh-TW', 1.0, p.role);
                    }}
                    title={`${p.name} (${p.desc})`}
                    className={`p-1.5 rounded-lg text-sm transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-400 text-slate-950 scale-110 shadow'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <span>{p.avatar}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          VIEW A: 🃏 百科知識卡片庫 (CARDS & 3D FLIP MEMORY FLASHCARDS)
         ========================================================================= */}
      {activeView === 'cards' && (
        <div className="space-y-5 animate-fadeIn">
          {/* Top Multi-Level Tag Filter Bar & Offline Sync Controls */}
          <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/95 border-2 border-slate-800 shadow-xl space-y-4">
            {/* ROW 1: 📖 繪本主題類別標籤過濾列 (Book Category Filter Bar) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-cyan-300 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-cyan-400" />
                  <span>繪本主題類別篩選：</span>
                </span>
                <span className="text-[11px] font-bold text-slate-400">
                  共 {categoryCounts.all} 張收錄卡片
                </span>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1">
                {[
                  { id: 'all', label: '全部繪本', emoji: '🌈', count: categoryCounts.all },
                  { id: 'fairytale', label: '童話寓言', emoji: '🧚‍♀️', count: categoryCounts.fairytale },
                  { id: 'science', label: '科普自然', emoji: '🔬', count: categoryCounts.science },
                  { id: 'adventure', label: '冒險探索', emoji: '🚀', count: categoryCounts.adventure },
                  { id: 'space', label: '宇宙天文', emoji: '🪐', count: categoryCounts.space },
                  { id: 'tech', label: '綠色科技', emoji: '⚙️', count: categoryCounts.tech },
                  { id: 'wisdom', label: '心靈品格', emoji: '💡', count: categoryCounts.wisdom },
                ].map((cat) => {
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => {
                        playPageTurnSound();
                        setSelectedCategory(cat.id as BookCategoryFilter);
                      }}
                      className={`px-3 py-1.5 rounded-2xl text-xs font-black flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 border-cyan-300 shadow-lg scale-105'
                          : 'bg-slate-950 text-slate-300 hover:text-white hover:bg-slate-800 border-slate-800'
                      }`}
                    >
                      <span className="text-sm">{cat.emoji}</span>
                      <span>{cat.label}</span>
                      <span
                        className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                          isSelected ? 'bg-slate-950/40 text-slate-900 font-black' : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {cat.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ROW 2: ⭐ 生字掌握程度篩選標籤列 (Mastery Status Filter Bar) */}
            <div className="space-y-2 pt-2 border-t border-slate-800/80">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                  <BookmarkCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>生字掌握程度篩選：</span>
                </span>
                <span className="text-[11px] font-bold text-slate-400">
                  {masteryCounts.mastered} 已精通 ‧ {masteryCounts.needs_review} 待複習
                </span>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1">
                {[
                  { id: 'all', label: '全部進度', emoji: '📋', count: masteryCounts.all, color: 'cyan' },
                  { id: 'mastered', label: '已精通掌握 (85%+)', emoji: '🌟', count: masteryCounts.mastered, color: 'emerald' },
                  { id: 'needs_review', label: '待加強複習', emoji: '⏳', count: masteryCounts.needs_review, color: 'amber' },
                  { id: 'favorites', label: '我的星標收藏', emoji: '❤️', count: masteryCounts.favorites, color: 'rose' },
                ].map((st) => {
                  const isSelected = selectedMasteryStatus === st.id;
                  let selectedClass = 'bg-cyan-500 text-slate-950 border-cyan-300 shadow-md scale-105';
                  if (st.id === 'mastered') selectedClass = 'bg-emerald-500 text-slate-950 border-emerald-300 shadow-md scale-105';
                  if (st.id === 'needs_review') selectedClass = 'bg-amber-500 text-slate-950 border-amber-300 shadow-md scale-105';
                  if (st.id === 'favorites') selectedClass = 'bg-rose-500 text-white border-rose-300 shadow-md scale-105';

                  return (
                    <button
                      key={st.id}
                      onClick={() => {
                        playPageTurnSound();
                        setSelectedMasteryStatus(st.id as MasteryStatusFilter);
                      }}
                      className={`px-3 py-1.5 rounded-2xl text-xs font-black flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer border ${
                        isSelected
                          ? selectedClass
                          : 'bg-slate-950 text-slate-300 hover:text-white hover:bg-slate-800 border-slate-800'
                      }`}
                    >
                      <span>{st.emoji}</span>
                      <span>{st.label}</span>
                      <span
                        className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                          isSelected ? 'bg-black/30 text-slate-950 font-black' : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {st.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ROW 3: 搜尋框 + 離線同步狀態 + 批次翻轉操作 */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
              {/* Search Input */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="搜尋生字、拼音、中文釋義、小百科、標籤或繪本來源..."
                  className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs font-bold text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Action Buttons & Sync Status Pill */}
              <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1">
                {/* 🔄 Offline Sync Status Button */}
                <button
                  onClick={() => {
                    playStarChime();
                    setIsSyncModalOpen(true);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 border transition-all cursor-pointer shadow-sm ${
                    syncQueue.length > 0
                      ? 'bg-amber-500/20 text-amber-300 border-amber-400 hover:bg-amber-500/30 animate-pulse'
                      : isOnline
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900/60'
                      : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                  title="查看離線進度同步狀態與備份"
                >
                  {isOnline ? (
                    <Cloud className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <CloudOff className="w-3.5 h-3.5 text-amber-400" />
                  )}
                  <span>
                    {syncQueue.length > 0
                      ? `待同步 (${syncQueue.length})`
                      : isOnline
                      ? '離線同步已就緒'
                      : '離線模式'}
                  </span>
                  <SlidersHorizontal className="w-3 h-3 text-slate-400" />
                </button>

                {/* Bulk Flip All */}
                <button
                  onClick={() => handleFlipAllCards(true)}
                  title="全部卡片翻轉至背面（查看定義與插圖）"
                  className="px-2.5 py-1.5 rounded-xl text-xs font-black bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 border border-indigo-500/40 flex items-center gap-1 whitespace-nowrap transition-all cursor-pointer"
                >
                  <span>🔄 全部翻轉</span>
                </button>

                {/* Bulk Reset to Front */}
                <button
                  onClick={() => handleFlipAllCards(false)}
                  title="全部卡片重設為正面"
                  className="px-2.5 py-1.5 rounded-xl text-xs font-black bg-slate-950 hover:bg-slate-800 text-slate-400 border border-slate-800 flex items-center gap-1 whitespace-nowrap transition-all cursor-pointer"
                >
                  <span>↩️ 全部正面</span>
                </button>
              </div>
            </div>
          </div>

          {/* Card Count and Interactive Hint */}
          <div className="flex items-center justify-between px-1 text-xs text-slate-400 font-bold">
            <div className="flex items-center gap-2">
              <span className="text-cyan-400">✨ 篩選顯示 {filteredCards.length} / {allEncyclopediaCards.length} 張離線雙語百科卡</span>
              <span className="text-slate-600">|</span>
              <span className="text-slate-400 flex items-center gap-1">
                <span>💡 點擊任一卡片可觸發 3D 翻轉動畫</span>
              </span>
            </div>
            <span className="text-[11px] text-amber-300/90 font-mono hidden sm:inline">
              正面：生字 ‧ 拼音 ‧ 掌握標記 | 背面：定義 ‧ 例句 ‧ 可愛插圖
            </span>
          </div>

          {/* Cards Grid */}
          {filteredCards.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
              <div className="text-4xl">🔍</div>
              <h4 className="text-base font-black text-slate-300">查無相符的百科知識卡片</h4>
              <p className="text-xs text-slate-500">嘗試重設類別標籤或更換搜尋關鍵字。</p>
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedMasteryStatus('all');
                  setSelectedDomain('all');
                  setSearchQuery('');
                }}
                className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 text-xs font-black cursor-pointer shadow hover:bg-cyan-400 transition-colors"
              >
                重設所有篩選條件
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredCards.map((card) => {
                const isFlipped = !!flippedCardIds[card.id];
                const isFav = favoriteCardIds.includes(card.id);

                return (
                  <div
                    key={card.id}
                    className="card-flip-container min-h-[410px] sm:min-h-[430px] cursor-pointer group select-none"
                    onClick={() => handleToggleFlipCard(card.id, card.word)}
                  >
                    <div
                      className={`card-flip-inner w-full h-full rounded-3xl transition-transform duration-500 ${
                        isFlipped ? 'is-flipped' : ''
                      }`}
                    >
                      {/* =========================================================
                          CARD FACE FRONT: 正面（生字 ‧ 拼音 ‧ 音標 ‧ 釋義 ‧ 繪本溯源 ‧ 掌握切換）
                         ========================================================= */}
                      <div className="card-face-front rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-slate-800 hover:border-cyan-400/80 p-5 shadow-xl flex flex-col justify-between space-y-4 group-hover:shadow-cyan-500/10 transition-all">
                        {/* Front Top Bar */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-slate-950 border border-slate-700 text-cyan-300 flex items-center gap-1 shadow-sm">
                              <span>{card.bookCategoryEmoji}</span>
                              <span>{card.bookCategoryLabel}</span>
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                                card.isMastered
                                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              }`}
                            >
                              {card.isMastered ? '★ 已掌握' : '⏳ 待複習'} ({card.masteryLevel}%)
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {/* Favorite Button */}
                            <button
                              onClick={(e) => handleToggleFavorite(card.id, card.word, e)}
                              className="p-1.5 rounded-lg bg-slate-950/80 text-amber-400 hover:scale-110 transition-transform cursor-pointer"
                              title={isFav ? '已收藏' : '加入收藏'}
                            >
                              <Star className={`w-3.5 h-3.5 ${isFav ? 'fill-amber-400' : ''}`} />
                            </button>

                            {/* Speak Button */}
                            <button
                              onClick={(e) => handleSpeakCard(card, e)}
                              className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500 hover:text-slate-950 transition-colors cursor-pointer"
                              title="朗讀生字與拼音釋義"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Center Vocabulary Pod (詞彙 ‧ 拼音 ‧ 音標 ‧ 中文釋義) */}
                        <div className="space-y-2.5 text-center my-auto px-2">
                          {/* English Word */}
                          <h4 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-cyan-400 tracking-tight">
                            {card.word}
                          </h4>

                          {/* Pinyin & Zhuyin Badge */}
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-300 font-bold text-xs shadow-inner">
                            <span className="text-[10px] text-amber-400/80">拼音</span>
                            <span className="font-mono tracking-wide">{card.pinyin}</span>
                          </div>

                          {/* Phonetic & Part of Speech */}
                          <div className="flex items-center justify-center gap-2">
                            <span className="text-xs font-mono font-bold text-cyan-300/90 bg-cyan-950/50 px-2 py-0.5 rounded-md border border-cyan-500/20">
                              {card.phonetic}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                              {card.partOfSpeech}
                            </span>
                          </div>

                          {/* Chinese Translation */}
                          <p className="text-base sm:text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 pt-0.5">
                            {card.translation}
                          </p>
                        </div>

                        {/* Front Bottom Details & Mastery Quick Actions */}
                        <div className="space-y-2.5 pt-2 border-t border-slate-800/80">
                          {/* Source book badge & Review Count */}
                          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                            <span className="truncate max-w-[170px] flex items-center gap-1.5 text-slate-300">
                              <BookOpen className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                              <span className="truncate">《{card.sourceBookTitle}》</span>
                            </span>
                            <span className="text-[10px] text-cyan-400 font-mono">
                              複習 {card.reviewCount} 次
                            </span>
                          </div>

                          {/* Mastery / Needs Review Quick Toggle Buttons */}
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={(e) => handleToggleMastery(card.id, card.word, e)}
                              className={`py-1.5 px-2 rounded-xl text-[11px] font-black flex items-center justify-center gap-1 border transition-all cursor-pointer ${
                                card.isMastered
                                  ? 'bg-emerald-500/30 text-emerald-300 border-emerald-400 shadow-sm'
                                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
                              }`}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              <span>{card.isMastered ? '已標記掌握' : '標記掌握'}</span>
                            </button>

                            <button
                              onClick={(e) => handleToggleNeedsReview(card.id, card.word, e)}
                              className={`py-1.5 px-2 rounded-xl text-[11px] font-black flex items-center justify-center gap-1 border transition-all cursor-pointer ${
                                card.needsReview
                                  ? 'bg-amber-500/30 text-amber-300 border-amber-400 shadow-sm'
                                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
                              }`}
                            >
                              <Clock className="w-3.5 h-3.5 text-amber-400" />
                              <span>{card.needsReview ? '列入複習' : '待複習'}</span>
                            </button>
                          </div>

                          {/* 3D Flip Callout Guide Button */}
                          <div className="w-full py-1.5 px-3 rounded-xl bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-xs font-black flex items-center justify-center gap-1.5 group-hover:bg-cyan-500 group-hover:text-slate-950 group-hover:border-cyan-400 transition-all shadow-sm">
                            <span className="animate-pulse">🔄</span>
                            <span>點擊卡片翻轉（查看定義 ‧ 例句 ‧ 可愛插圖）</span>
                          </div>
                        </div>
                      </div>

                      {/* =========================================================
                          CARD FACE BACK: 背面（詳細定義 ‧ 生活例句 ‧ 可愛相關插圖 ‧ 科普小百科）
                         ========================================================= */}
                      <div className="card-face-back rounded-3xl bg-slate-950 border-2 border-cyan-400/90 p-4 sm:p-5 shadow-2xl flex flex-col justify-between space-y-3">
                        {/* Back Top Header */}
                        <div className="flex items-center justify-between border-b border-cyan-500/30 pb-2">
                          <div className="flex items-center gap-1.5">
                            <Lightbulb className="w-4 h-4 text-amber-400" />
                            <span className="text-xs font-black text-amber-300">
                              【小博士百科 ‧ 可愛圖解】
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded-full border border-cyan-500/30">
                              {card.word}
                            </span>
                            <button
                              onClick={(e) => handleSpeakCard(card, e)}
                              className="p-1 rounded-lg bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500 hover:text-slate-950 transition-colors cursor-pointer"
                              title="朗讀小百科詳解與例句"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Back Scrollable Content */}
                        <div className="space-y-2.5 overflow-y-auto custom-scrollbar pr-1 my-auto text-xs">
                          {/* 💖 可愛相關插圖展區 (CUTE ILLUSTRATION SHOWCASE) */}
                          <div
                            className={`p-2.5 rounded-2xl bg-gradient-to-br ${card.cuteIllustration.themeGradient} border border-cyan-500/40 relative overflow-hidden space-y-1.5 shadow-inner`}
                          >
                            {/* Illustration Top Badge & Scene Sparkles */}
                            <div className="flex items-center justify-between">
                              <span className="px-2 py-0.5 rounded-md text-[9px] font-black bg-slate-950/80 text-cyan-300 border border-cyan-400/30 flex items-center gap-1">
                                <span>🎨</span>
                                <span>{card.cuteIllustration.badge}</span>
                              </span>
                              <div className="flex items-center gap-1 text-xs">
                                {card.cuteIllustration.sceneEmojis.map((se, sIdx) => (
                                  <span key={sIdx} className="animate-pulse">{se}</span>
                                ))}
                              </div>
                            </div>

                            {/* Main Animated Emoji Character */}
                            <div className="flex items-center justify-center py-1">
                              <div className="w-12 h-12 rounded-2xl bg-slate-950/60 border border-white/10 flex items-center justify-center shadow-lg">
                                <span className="text-3xl animate-cute-float filter drop-shadow">
                                  {card.cuteIllustration.primaryEmoji}
                                </span>
                              </div>
                            </div>

                            {/* Illustration Cute Caption */}
                            <p className="text-[11px] font-bold text-slate-200 text-center leading-relaxed">
                              {card.cuteIllustration.caption}
                            </p>
                          </div>

                          {/* Detailed Definition Block */}
                          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                            <span className="text-[10px] font-black text-cyan-400 flex items-center gap-1">
                              <span>📖</span>
                              <span>詞彙詳細定義：</span>
                            </span>
                            <p className="text-[11px] font-bold text-slate-200 leading-relaxed">
                              {card.definition}
                            </p>
                          </div>

                          {/* Example Sentence & Translation */}
                          <div className="p-2 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
                            <span className="text-[10px] font-black text-amber-300 flex items-center gap-1">
                              <span>💡</span>
                              <span>雙語例句與翻譯：</span>
                            </span>
                            <p className="text-[11px] text-cyan-200 italic font-mono leading-tight">
                              "{card.exampleSentence}"
                            </p>
                            <p className="text-[10px] text-slate-300 font-bold">
                              👉 {card.exampleTranslation}
                            </p>
                          </div>

                          {/* Encyclopedic Science Fact */}
                          <div className="p-2 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-[10px] space-y-0.5">
                            <span className="font-black text-cyan-300 flex items-center gap-1">
                              <span>🔬</span>
                              <span>小博士科普小百科：</span>
                            </span>
                            <p className="text-slate-300 font-bold leading-relaxed">
                              {card.encyclopediaFact}
                            </p>
                          </div>

                          {/* Mind Prompt */}
                          <div className="p-2 rounded-xl bg-purple-950/40 border border-purple-500/30 text-[10px] text-purple-200 font-bold">
                            <span>🧠 小偵探思考題：{card.mindPrompt}</span>
                          </div>
                        </div>

                        {/* Back Footer Actions */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[10px]">
                          <button
                            onClick={(e) => handleSpeakCard(card, e)}
                            className="px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 font-bold flex items-center gap-1 hover:bg-cyan-500 hover:text-slate-950 transition-colors"
                          >
                            <Volume2 className="w-3 h-3" />
                            <span>聽小百科朗讀</span>
                          </button>

                          <span className="text-cyan-400 flex items-center gap-1 font-bold group-hover:translate-x-0.5 transition-transform">
                            <span>🔄 點擊翻回正面</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          VIEW B: 📐 離線科普圖紙總覽 (INTERACTIVE BLUEPRINT / SCHEMATIC GALLERY)
         ========================================================================= */}
      {activeView === 'blueprints' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Blueprint Intro Banner */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-amber-500/40 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-xl text-amber-300 shrink-0">
                📐
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-black text-amber-300">
                  離線科普工程圖紙總覽 (Interactive Schematics & Diagrams)
                </h4>
                <p className="text-xs font-bold text-slate-300 mt-0.5">
                  精選 6 幅高解析結構藍圖，點擊圖紙上的「💡 互動熱點標記」即可探索雙語零件名詞與深入科普原理！
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start md:self-auto">
              <span className="text-xs font-bold text-slate-400">
                收錄：<strong className="text-amber-300">{scienceBlueprints.length}</strong> 幅完整藍圖
              </span>
            </div>
          </div>

          {/* Blueprints Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {scienceBlueprints.map((bp) => (
              <div
                key={bp.id}
                className={`p-5 sm:p-6 rounded-3xl border-2 shadow-2xl space-y-4 transition-all ${
                  bp.gridType === 'cyan'
                    ? 'blueprint-grid-cyan border-cyan-400/60 shadow-cyan-950/50'
                    : 'blueprint-grid-amber border-amber-400/60 shadow-amber-950/50'
                }`}
              >
                {/* Blueprint Title Block Header */}
                <div className="flex items-start justify-between gap-3 border-b border-cyan-500/30 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{bp.icon}</span>
                      <h4 className="text-base sm:text-lg font-black text-white tracking-wide">
                        {bp.titleZh}
                      </h4>
                    </div>
                    <span className="text-[11px] font-mono text-cyan-300 block mt-0.5">
                      {bp.titleEn}
                    </span>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="px-2 py-0.5 rounded-lg text-[9px] font-mono font-bold bg-slate-900/90 text-cyan-300 border border-cyan-400/40 block">
                      {bp.codeName}
                    </span>
                    <span className="text-[9px] font-mono text-slate-400 block mt-0.5">
                      {bp.revision}
                    </span>
                  </div>
                </div>

                {/* Blueprint Interactive Canvas Area */}
                <div className="relative w-full h-56 sm:h-64 rounded-2xl bg-slate-950/80 border border-cyan-500/40 overflow-hidden flex items-center justify-center p-4">
                  {/* Blueprint Coordinate Grids */}
                  <div className="absolute top-2 left-2 text-[9px] font-mono text-cyan-400/40 pointer-events-none">
                    + GRID 50x50 // SCALE {bp.scaleRatio}
                  </div>
                  <div className="absolute bottom-2 right-2 text-[9px] font-mono text-cyan-400/40 pointer-events-none">
                    ENGINEERING REPROD. 2026
                  </div>

                  {/* Big Hero Visual Representation */}
                  <div className="text-center space-y-2 animate-pulse">
                    <div className="text-5xl sm:text-6xl filter drop-shadow-[0_0_15px_rgba(6,182,212,0.6)]">
                      {bp.heroIllustrationEmoji}
                    </div>
                    <p className="text-xs font-mono text-cyan-300/90 font-black tracking-widest uppercase">
                      [ {bp.titleEn} ]
                    </p>
                  </div>

                  {/* Interactive Hotspots on Canvas */}
                  {bp.hotspots.map((hs, hIdx) => (
                    <button
                      key={hs.id}
                      onClick={() => {
                        playStarChime();
                        setSelectedBlueprint(bp);
                        setActiveHotspot(hs);
                      }}
                      style={{
                        left: `${hs.xPercent}%`,
                        top: `${hs.yPercent}%`,
                      }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 px-2.5 py-1 rounded-full bg-cyan-500 text-slate-950 font-black text-[10px] shadow-lg border-2 border-white hover:scale-125 transition-transform animate-bounce flex items-center gap-1 cursor-pointer z-10"
                      title={hs.labelZh}
                    >
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                      <span>{hIdx + 1}. {hs.labelZh}</span>
                    </button>
                  ))}
                </div>

                {/* Description & Technical Specs Table */}
                <div className="space-y-3">
                  <p className="text-xs font-bold text-slate-300 leading-relaxed">
                    {bp.description}
                  </p>

                  {/* Technical Specs 2x2 Grid */}
                  <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                    {bp.technicalSpecs.map((spec, sIdx) => (
                      <div
                        key={sIdx}
                        className="p-2 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between"
                      >
                        <span className="text-slate-400 block">{spec.label}</span>
                        <span className="text-cyan-300 font-bold mt-0.5">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Blueprint Card Footer Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                  <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                    <span>出處：《{bp.sourceBookTitle}》</span>
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        playPageTurnSound();
                        setSelectedBlueprint(bp);
                        setActiveHotspot(bp.hotspots[0] || null);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-cyan-500 text-slate-950 text-xs font-black flex items-center gap-1 shadow-md hover:bg-cyan-400 transition-colors cursor-pointer"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>放大檢視熱點</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW C: ⚡ 趣味快問快答挑戰 (POP-QUIZ ARCADE)
         ========================================================================= */}
      {activeView === 'quiz' && (
        <div className="max-w-2xl mx-auto space-y-5 animate-fadeIn">
          {/* Quiz Stats Banner */}
          <div className="p-4 sm:p-5 rounded-3xl bg-slate-900 border-2 border-purple-500/50 shadow-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-400 flex items-center justify-center text-2xl animate-bounce">
                ⚡
              </div>
              <div>
                <h4 className="text-base font-black text-purple-300">離線百科知識快問快答</h4>
                <p className="text-xs font-bold text-slate-400">
                  第 {quizQuestionIndex + 1} / {quizPool.length} 題 ‧ 答對獎勵 +25 💎 水晶
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-400 block">挑戰得分</span>
                <span className="text-lg font-black text-purple-300">{quizScore} 分</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-400 block">連勝紀錄</span>
                <span className="text-lg font-black text-amber-300">🔥 {quizStreak}</span>
              </div>
            </div>
          </div>

          {/* Question Card */}
          <div className="p-6 rounded-3xl bg-slate-950 border-2 border-purple-400/60 shadow-2xl space-y-5">
            {/* Domain & Source Book Tag */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="px-3 py-1 rounded-xl text-xs font-black bg-purple-500/20 text-purple-300 border border-purple-400/40 flex items-center gap-1.5">
                <span>{currentQuiz.card.domainEmoji}</span>
                <span>{currentQuiz.card.domainLabel}</span>
              </span>

              <span className="text-xs font-bold text-slate-400">
                出處：《{currentQuiz.card.sourceBookTitle}》
              </span>
            </div>

            {/* Question Text */}
            <div className="space-y-2 text-center py-2">
              <h3 className="text-lg sm:text-xl font-black text-white leading-relaxed">
                {currentQuiz.question}
              </h3>
              <p className="text-xs font-mono text-cyan-300 font-bold">
                提示單字：{currentQuiz.card.word} ({currentQuiz.card.phonetic})
              </p>
            </div>

            {/* 4 Options Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentQuiz.options.map((opt, oIdx) => {
                const isSelected = quizSelectedOption === oIdx;
                const isCorrect = oIdx === currentQuiz.correctIndex;

                let btnStyle = 'bg-slate-900 border-slate-800 text-slate-200 hover:border-purple-400';
                if (quizAnswered) {
                  if (isCorrect) {
                    btnStyle = 'bg-emerald-600 text-white border-emerald-400 font-black scale-102 shadow-lg';
                  } else if (isSelected) {
                    btnStyle = 'bg-rose-600 text-white border-rose-400 font-black';
                  } else {
                    btnStyle = 'bg-slate-900/40 text-slate-600 border-slate-900';
                  }
                }

                return (
                  <button
                    key={oIdx}
                    disabled={quizAnswered}
                    onClick={() => handleAnswerQuiz(oIdx)}
                    className={`p-4 rounded-2xl border-2 text-left text-xs font-bold transition-all flex items-center justify-between gap-2 cursor-pointer ${btnStyle}`}
                  >
                    <span>{String.fromCharCode(65 + oIdx)}. {opt}</span>
                    {quizAnswered && isCorrect && (
                      <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Feedback & Next Button */}
            {quizAnswered && (
              <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/50 space-y-3 animate-fadeIn">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-black text-amber-300">
                    【小博士解析】
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-200 leading-relaxed">
                  {currentQuiz.explanation}
                </p>

                <div className="flex items-center justify-end pt-2">
                  <button
                    onClick={handleNextQuiz}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-black text-xs flex items-center gap-1.5 shadow-lg hover:scale-105 transition-transform cursor-pointer"
                  >
                    <span>下一題</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW D: 🔗 詞彙連連看 (VOCAB MATCH CHALLENGE & AUTO-CLASSIFICATION)
         ========================================================================= */}
      {activeView === 'match_game' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Top Game Setup & Metrics Bar */}
          <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/95 border-2 border-emerald-500/40 shadow-2xl space-y-4 relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-1/4 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
              {/* Header Title & Subtitle */}
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-3xl shadow-xl border-2 border-emerald-200 shrink-0">
                  🔗
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base sm:text-lg font-black text-emerald-300 flex items-center gap-2">
                      <span>詞彙連連看大挑戰 (Vocab Match Challenge)</span>
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
                      ⚡ 隨機挑選配對 ‧ 錯題自動分類
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-purple-500/20 text-purple-300 border border-purple-400/40">
                      通關獎勵：+50 💎 知識水晶
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-300 mt-1 leading-relaxed">
                    從你已收集與探索的百科卡片中，隨機選取詞彙與定義進行連線挑戰！點選左側英文單字，再點選右側正確中文釋義進行配對。
                  </p>
                </div>
              </div>

              {/* Game Live Stats Counter Bar */}
              <div className="flex items-center gap-2.5 flex-wrap self-start lg:self-auto">
                {/* Timer */}
                <div className="flex items-center gap-2 bg-slate-950 px-3.5 py-2 rounded-2xl border border-emerald-500/40 shadow">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block">挑戰時間</span>
                    <span className="text-xs font-black font-mono text-emerald-300">
                      {Math.floor(matchTimerSeconds / 60).toString().padStart(2, '0')}:{(matchTimerSeconds % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                </div>

                {/* Score */}
                <div className="flex items-center gap-2 bg-slate-950 px-3.5 py-2 rounded-2xl border border-teal-500/40 shadow">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block">目前得分</span>
                    <span className="text-xs font-black text-amber-300 font-mono">{matchScore} 分</span>
                  </div>
                </div>

                {/* Combo */}
                <div className="flex items-center gap-2 bg-slate-950 px-3.5 py-2 rounded-2xl border border-rose-500/40 shadow">
                  <Flame className={`w-4 h-4 ${matchCombo > 1 ? 'text-rose-400 animate-bounce' : 'text-slate-500'}`} />
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block">連擊 Combo</span>
                    <span className="text-xs font-black text-rose-300 font-mono">
                      {matchCombo > 0 ? `${matchCombo}x` : '0x'}
                    </span>
                  </div>
                </div>

                {/* Progress */}
                <div className="flex items-center gap-2 bg-slate-950 px-3.5 py-2 rounded-2xl border border-cyan-500/40 shadow">
                  <CheckCheck className="w-4 h-4 text-cyan-400" />
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block">配對進度</span>
                    <span className="text-xs font-black text-cyan-300 font-mono">
                      {matchedPairIds.length} / {matchLeftCards.length}
                    </span>
                  </div>
                </div>

                {/* Reset / Reshuffle Button */}
                <button
                  onClick={() => initMatchGame(matchPairCount, matchCategoryFilter)}
                  className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all cursor-pointer shadow hover:scale-105"
                  title="重新發牌與洗牌"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Difficulty & Category Filter Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-3 border-t border-slate-800 relative z-10 text-xs">
              {/* Difficulty Mode Selector */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-slate-400 shrink-0 flex items-center gap-1">
                  <Target className="w-3.5 h-3.5 text-emerald-400" />
                  <span>配對規模：</span>
                </span>
                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                  {[
                    { count: 4, label: '4 對 (入門探索)', bonus: '+35💎' },
                    { count: 6, label: '6 對 (進階挑戰)', bonus: '+50💎' },
                    { count: 8, label: '8 對 (大師對決)', bonus: '+65💎' },
                  ].map((lvl) => {
                    const isSelected = matchPairCount === lvl.count;
                    return (
                      <button
                        key={lvl.count}
                        onClick={() => {
                          setMatchPairCount(lvl.count);
                          initMatchGame(lvl.count, matchCategoryFilter);
                        }}
                        className={`px-3 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer flex items-center gap-1 ${
                          isSelected
                            ? 'bg-emerald-500 text-slate-950 font-black shadow-md scale-105'
                            : 'text-slate-400 hover:text-white hover:bg-slate-900'
                        }`}
                      >
                        <span>{lvl.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Source Category Filter */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-slate-400 shrink-0 flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5 text-cyan-400" />
                  <span>詞彙來源：</span>
                </span>
                <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar max-w-full pb-1 sm:pb-0">
                  {[
                    { key: 'all', label: '🌈 全部' },
                    { key: 'science', label: '🔬 科普自然' },
                    { key: 'space', label: '🪐 宇宙天文' },
                    { key: 'tech', label: '⚙️ 綠色科技' },
                    { key: 'fairytale', label: '🧚‍♀️ 童話寓言' },
                    { key: 'wisdom', label: '💡 心靈品格' },
                    { key: 'favorites', label: '❤️ 星標收藏' },
                  ].map((cat) => {
                    const isSelected = matchCategoryFilter === cat.key;
                    return (
                      <button
                        key={cat.key}
                        onClick={() => {
                          setMatchCategoryFilter(cat.key as any);
                          initMatchGame(matchPairCount, cat.key as any);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold shrink-0 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-teal-500 text-slate-950 font-black shadow'
                            : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                        }`}
                      >
                        <span>{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Match Game Board: Left Column (Words) vs Right Column (Definitions) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 relative">
            {/* =========================================================================
                LEFT COLUMN: 🔤 VOCABULARY WORDS & PINYIN PRONUNCIATION
               ========================================================================= */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-2">
                <span className="text-xs font-black text-cyan-300 flex items-center gap-1.5">
                  <span>🔤 核心英文詞彙與拼音注音</span>
                </span>
                <span className="text-[10px] font-bold text-slate-400">
                  點選以選定單字並聆聽導讀發音
                </span>
              </div>

              <div className="space-y-2.5">
                {matchLeftCards.map((leftItem, idx) => {
                  const isMatched = matchedPairIds.includes(leftItem.cardId);
                  const isSelected = selectedLeftId === leftItem.cardId;
                  const isMismatch = mismatchPair?.leftId === leftItem.cardId;
                  const errorCount = matchErrorCounts[leftItem.cardId] || 0;

                  let cardStyle = 'bg-slate-900 border-slate-800 text-slate-200 hover:border-cyan-400/80 hover:bg-slate-850';
                  if (isMatched) {
                    cardStyle = 'bg-emerald-950/60 border-emerald-500/80 text-emerald-200 opacity-90 shadow-emerald-950/50';
                  } else if (isMismatch) {
                    cardStyle = 'bg-rose-950/80 border-rose-500 text-rose-200 animate-shake shadow-rose-950/50';
                  } else if (isSelected) {
                    cardStyle = 'bg-cyan-950/90 border-cyan-400 text-white ring-2 ring-cyan-400 scale-[1.02] shadow-xl shadow-cyan-950/80';
                  }

                  return (
                    <div
                      key={leftItem.cardId}
                      onClick={() => handleSelectLeftCard(leftItem.cardId, leftItem.word)}
                      className={`p-3.5 sm:p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 relative overflow-hidden ${cardStyle} ${
                        isMatched ? 'cursor-default' : ''
                      }`}
                    >
                      {/* Left Side: Domain Emoji + Word info */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 ${
                          isMatched ? 'bg-emerald-500/20 text-emerald-300' : 'bg-cyan-500/20 text-cyan-300'
                        }`}>
                          {leftItem.emoji}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-base sm:text-lg font-black tracking-wide text-white truncate">
                              {leftItem.word}
                            </h4>
                            <span className="text-[10px] font-mono text-cyan-300/80">
                              {leftItem.phonetic}
                            </span>
                            <span className="px-1.5 py-0.2 rounded text-[9px] bg-slate-800 text-slate-400 font-bold">
                              {leftItem.partOfSpeech}
                            </span>
                          </div>

                          <p className="text-xs font-bold text-amber-300/90 mt-0.5 truncate">
                            {leftItem.pinyin}
                          </p>
                        </div>
                      </div>

                      {/* Right Status Badge */}
                      <div className="flex items-center gap-2 shrink-0">
                        {errorCount > 0 && !isMatched && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                            錯 {errorCount}
                          </span>
                        )}

                        {isMatched ? (
                          <div className="flex items-center gap-1 text-emerald-400 text-xs font-black bg-emerald-500/20 px-2.5 py-1 rounded-xl border border-emerald-400/40">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>已配對</span>
                          </div>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              playStarChime();
                              speakText(leftItem.word, 'zh-TW', 1.0, voiceRole);
                            }}
                            className="p-1.5 rounded-lg bg-slate-800/80 text-cyan-300 hover:bg-cyan-500 hover:text-slate-950 transition-colors"
                            title="聆聽發音"
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* =========================================================================
                RIGHT COLUMN: 📖 DEFINITIONS & CHINESE ENCYCLOPEDIA TRANSLATION
               ========================================================================= */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-2">
                <span className="text-xs font-black text-teal-300 flex items-center gap-1.5">
                  <span>📖 中文釋義與小百科深度定義</span>
                </span>
                <span className="text-[10px] font-bold text-slate-400">
                  點選以完成兩側連線配對
                </span>
              </div>

              <div className="space-y-2.5">
                {matchRightCards.map((rightItem, idx) => {
                  const isMatched = matchedPairIds.includes(rightItem.cardId);
                  const isSelected = selectedRightId === rightItem.cardId;
                  const isMismatch = mismatchPair?.rightId === rightItem.cardId;

                  let cardStyle = 'bg-slate-900 border-slate-800 text-slate-200 hover:border-teal-400/80 hover:bg-slate-850';
                  if (isMatched) {
                    cardStyle = 'bg-emerald-950/60 border-emerald-500/80 text-emerald-200 opacity-90 shadow-emerald-950/50';
                  } else if (isMismatch) {
                    cardStyle = 'bg-rose-950/80 border-rose-500 text-rose-200 animate-shake shadow-rose-950/50';
                  } else if (isSelected) {
                    cardStyle = 'bg-teal-950/90 border-teal-400 text-white ring-2 ring-teal-400 scale-[1.02] shadow-xl shadow-teal-950/80';
                  }

                  return (
                    <div
                      key={rightItem.cardId}
                      onClick={() => handleSelectRightCard(rightItem.cardId)}
                      className={`p-3.5 sm:p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start justify-between gap-3 relative overflow-hidden ${cardStyle} ${
                        isMatched ? 'cursor-default' : ''
                      }`}
                    >
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm sm:text-base font-black text-amber-300">
                            【{rightItem.translation}】
                          </h4>
                          <span className="text-[10px] text-slate-400 font-bold">
                            《{rightItem.sourceBookTitle}》
                          </span>
                        </div>

                        <p className="text-xs font-bold text-slate-200 leading-relaxed">
                          {rightItem.definition}
                        </p>
                      </div>

                      {/* Matched Check Indicator */}
                      {isMatched && (
                        <div className="flex items-center gap-1 text-emerald-400 text-xs font-black bg-emerald-500/20 px-2.5 py-1 rounded-xl border border-emerald-400/40 shrink-0 self-center">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>正確</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* =========================================================================
              COMPLETION CELEBRATION & 回覆自動分類分析報告 (AUTO-CLASSIFICATION REPORT)
             ========================================================================= */}
          {isMatchGameComplete && (
            <div className="p-6 rounded-3xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border-2 border-emerald-400 shadow-2xl space-y-6 animate-fadeIn">
              {/* Celebration Header */}
              <div className="text-center space-y-2 relative">
                <div className="text-6xl sm:text-7xl animate-bounce">🎉</div>
                <h3 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-cyan-300">
                  恭喜完成詞彙連連看配對大挑戰！
                </h3>
                <p className="text-xs font-bold text-slate-300">
                  全部 {matchLeftCards.length} 組百科雙語詞彙已成功連線！系統已為你進行全面的學習成果分析與自動分類！
                </p>

                {/* Score & Reward Pills */}
                <div className="flex items-center justify-center gap-3 pt-2 flex-wrap">
                  <div className="px-4 py-1.5 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-300 font-black text-xs flex items-center gap-1.5 shadow">
                    <Trophy className="w-4 h-4 text-amber-400" />
                    <span>最終得分：{matchScore} 分</span>
                  </div>

                  <div className="px-4 py-1.5 rounded-2xl bg-purple-500/20 border border-purple-400/40 text-purple-300 font-black text-xs flex items-center gap-1.5 shadow">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span>獲得獎勵：+{awardedBonusCrystals} 💎 知識水晶</span>
                  </div>

                  <div className="px-4 py-1.5 rounded-2xl bg-rose-500/20 border border-rose-400/40 text-rose-300 font-black text-xs flex items-center gap-1.5 shadow">
                    <Flame className="w-4 h-4 text-rose-400" />
                    <span>最高連擊：{maxCombo}x 連擊</span>
                  </div>

                  <div className="px-4 py-1.5 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-black text-xs flex items-center gap-1.5 shadow">
                    <Clock className="w-4 h-4 text-emerald-400" />
                    <span>完成用時：{matchTimerSeconds} 秒</span>
                  </div>
                </div>
              </div>

              {/* AUTO-CLASSIFICATION REPORT TABS / SECTIONS */}
              <div className="border-t border-slate-800 pt-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black text-cyan-300 flex items-center gap-2">
                    <BarChart2 className="w-4 h-4 text-cyan-400" />
                    <span>📊 學習成果與回覆自動分類分析報告 (Auto-Classification Analysis)</span>
                  </h4>
                  <span className="text-[11px] font-bold text-slate-400">
                    共分析 {activeMatchRoundCards.length} 個字詞
                  </span>
                </div>

                {/* 1. 🌟 掌握度分類：零失誤精通 vs 需加強複習 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Mastered Category (0 Errors) */}
                  <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 space-y-3">
                    <div className="flex items-center justify-between border-b border-emerald-500/30 pb-2">
                      <span className="text-xs font-black text-emerald-300 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>🌟 零失誤即刻精通 ({matchClassification.masteredCards.length})</span>
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
                        自動升級 100% 精通
                      </span>
                    </div>

                    {matchClassification.masteredCards.length === 0 ? (
                      <p className="text-xs text-slate-500 text-center py-4">本次挑戰無直接零失誤詞彙，下次再接再厲！</p>
                    ) : (
                      <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                        {matchClassification.masteredCards.map((c) => (
                          <div
                            key={c.id}
                            className="p-2.5 rounded-xl bg-slate-900/80 border border-emerald-500/30 flex items-center justify-between text-xs"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-base">{c.domainEmoji}</span>
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="font-black text-white">{c.word}</span>
                                  <span className="text-slate-400 font-mono text-[10px]">{c.phonetic}</span>
                                </div>
                                <span className="text-emerald-300 text-[11px] font-bold">{c.translation}</span>
                              </div>
                            </div>
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-400/30">
                              🏆 一次配對成功
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Needs Reinforcement Category (1+ Errors) */}
                  <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 space-y-3">
                    <div className="flex items-center justify-between border-b border-amber-500/30 pb-2">
                      <span className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                        <RotateCcw className="w-4 h-4 text-amber-400" />
                        <span>⏳ 需加強複習詞彙 ({matchClassification.needsReviewCards.length})</span>
                      </span>
                      {matchClassification.needsReviewCards.length > 0 && (
                        <button
                          onClick={handleAddAllNeedsReviewToQueue}
                          className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors shadow cursor-pointer"
                        >
                          ⚡ 一鍵加入待複習清單
                        </button>
                      )}
                    </div>

                    {matchClassification.needsReviewCards.length === 0 ? (
                      <div className="text-center py-6 text-emerald-300 text-xs font-bold space-y-1">
                        <CheckCircle2 className="w-6 h-6 mx-auto text-emerald-400" />
                        <p>太棒了！本輪所有字詞皆一次配對成功，完全沒有失誤錯題！</p>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                        {matchClassification.needsReviewCards.map((c) => {
                          const errs = matchErrorCounts[c.id] || 0;
                          return (
                            <div
                              key={c.id}
                              className="p-2.5 rounded-xl bg-slate-900/80 border border-amber-500/30 flex items-center justify-between text-xs"
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-base">{c.domainEmoji}</span>
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-black text-white">{c.word}</span>
                                    <span className="text-slate-400 font-mono text-[10px]">{c.phonetic}</span>
                                  </div>
                                  <span className="text-amber-300 text-[11px] font-bold">{c.translation}</span>
                                </div>
                              </div>
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-400/30">
                                嘗試了 {errs + 1} 次
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. 🌐 主題領域與詞性自動分類標籤 (Domain & Lexical Distribution) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Domain Category Analysis */}
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <span className="text-[11px] font-black text-cyan-300 block">🪐 知識領域自動分類分佈</span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {(Object.entries(matchClassification.domainCounts) as [string, { count: number; emoji: string; label: string }][]).map(([key, info]) => (
                        <span
                          key={key}
                          className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-slate-900 border border-cyan-500/30 text-cyan-200 flex items-center gap-1"
                        >
                          <span>{info.emoji}</span>
                          <span>{info.label}</span>
                          <span className="text-white font-mono font-black">({info.count})</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Part of Speech Analysis */}
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <span className="text-[11px] font-black text-teal-300 block">🔤 詞性結構分類統計</span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {(Object.entries(matchClassification.partOfSpeechCounts) as [string, number][]).map(([pos, count]) => (
                        <span
                          key={pos}
                          className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-slate-900 border border-teal-500/30 text-teal-200 flex items-center gap-1"
                        >
                          <span>{pos}</span>
                          <span className="text-white font-mono font-black">({count})</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Storybook Source Breakdown */}
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <span className="text-[11px] font-black text-purple-300 block">📖 繪本出處溯源與延伸閱讀</span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {(Object.entries(matchClassification.sourceBooks) as [string, { count: number; bookId?: string; title: string }][]).map(([title, info]) => (
                        <button
                          key={title}
                          onClick={() => {
                            if (info.bookId && onSelectBook) {
                              onSelectBook(info.bookId);
                            }
                          }}
                          className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-purple-950/60 border border-purple-500/30 text-purple-200 hover:bg-purple-900 transition-colors flex items-center gap-1 cursor-pointer"
                          title="前往閱讀此繪本"
                        >
                          <span>《{title}》</span>
                          <span className="text-white font-mono font-black">({info.count})</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom Round Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800">
                  <span className="text-xs font-bold text-slate-400">
                    💡 提示：重複進行連連看挑戰能加深大腦對雙語名詞與科學定義的神經迴路連結！
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveView('cards')}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors cursor-pointer"
                    >
                      🃏 回百科卡片庫
                    </button>

                    <button
                      onClick={() => initMatchGame(matchPairCount, matchCategoryFilter)}
                      className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-lg hover:scale-105 transition-transform cursor-pointer"
                    >
                      <Repeat className="w-4 h-4" />
                      <span>再來一局挑戰</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      {selectedBlueprint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-3xl bg-slate-900 border-2 border-cyan-400/80 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5 relative max-h-[90vh] overflow-y-auto custom-scrollbar">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{selectedBlueprint.icon}</span>
                <div>
                  <h4 className="text-base sm:text-lg font-black text-white">
                    {selectedBlueprint.titleZh}
                  </h4>
                  <span className="text-xs font-mono text-cyan-300">
                    {selectedBlueprint.codeName} ‧ {selectedBlueprint.revision}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedBlueprint(null);
                  setActiveHotspot(null);
                }}
                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Interactive Blueprint Zoom Screen */}
            <div
              className={`relative w-full h-72 sm:h-80 rounded-2xl p-4 overflow-hidden border-2 flex items-center justify-center ${
                selectedBlueprint.gridType === 'cyan'
                  ? 'blueprint-grid-cyan border-cyan-400/60'
                  : 'blueprint-grid-amber border-amber-400/60'
              }`}
            >
              {/* Giant Graphic */}
              <div className="text-center space-y-2">
                <div className="text-7xl sm:text-8xl filter drop-shadow-[0_0_20px_rgba(6,182,212,0.8)]">
                  {selectedBlueprint.heroIllustrationEmoji}
                </div>
                <span className="text-xs font-mono text-cyan-300 font-bold block">
                  SCALE RATIO: {selectedBlueprint.scaleRatio}
                </span>
              </div>

              {/* Hotspots */}
              {selectedBlueprint.hotspots.map((hs, hIdx) => {
                const isCurrentActive = activeHotspot?.id === hs.id;
                return (
                  <button
                    key={hs.id}
                    onClick={() => {
                      playStarChime();
                      setActiveHotspot(hs);
                    }}
                    style={{
                      left: `${hs.xPercent}%`,
                      top: `${hs.yPercent}%`,
                    }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 px-3 py-1.5 rounded-full font-black text-xs shadow-xl border-2 transition-all cursor-pointer z-20 flex items-center gap-1.5 ${
                      isCurrentActive
                        ? 'bg-amber-400 text-slate-950 border-white scale-125 ring-4 ring-amber-400/50'
                        : 'bg-cyan-500 text-slate-950 border-cyan-100 hover:scale-110'
                    }`}
                  >
                    <span>💡 {hIdx + 1}. {hs.labelZh}</span>
                  </button>
                );
              })}
            </div>

            {/* Active Hotspot Inspector Card */}
            {activeHotspot && (
              <div className="p-4 rounded-2xl bg-slate-950 border border-cyan-500/50 space-y-3 animate-fadeIn">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-cyan-300">
                      組件熱點：{activeHotspot.labelZh}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      ({activeHotspot.labelEn})
                    </span>
                  </div>

                  <button
                    onClick={(e) => handleSpeakHotspot(activeHotspot, e)}
                    className="px-3 py-1 rounded-xl bg-cyan-500 text-slate-950 text-xs font-black flex items-center gap-1 hover:bg-cyan-400 transition-colors"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>導讀此組件原理</span>
                  </button>
                </div>

                {/* Vocab Pod & Science Fact */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <span className="text-[10px] font-black text-amber-400 block">🔤 核心英文名詞：</span>
                    <h5 className="font-black text-sm text-cyan-300">
                      {activeHotspot.vocab.word} <span className="font-mono text-xs text-slate-400">{activeHotspot.vocab.phonetic}</span>
                    </h5>
                    <p className="text-slate-300 font-bold">{activeHotspot.vocab.translation}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <span className="text-[10px] font-black text-cyan-400 block">🔬 科學原理深度解析：</span>
                    <p className="text-slate-200 font-bold leading-relaxed text-[11px]">
                      {activeHotspot.scientificFact}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Printable Specification Summary Sheet */}
            <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/40 space-y-2">
              <div className="flex items-center gap-2 text-amber-300 text-xs font-black">
                <FileText className="w-4 h-4 text-amber-400" />
                <span>【離線圖紙工程規格備忘錄】</span>
              </div>
              <p className="text-xs font-bold text-slate-300 leading-relaxed">
                {selectedBlueprint.printableSummary}
              </p>
            </div>

            {/* Modal Bottom Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <span className="text-xs font-bold text-slate-400">
                出處：《{selectedBlueprint.sourceBookTitle}》
              </span>

              <button
                onClick={() => {
                  playStarChime();
                  alert(`🖨️ 已產生《${selectedBlueprint.titleZh}》離線研習規格書！`);
                }}
                className="px-4 py-2 rounded-xl bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow hover:bg-amber-300 transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>列印/匯出研究圖紙</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: ☁️ 離線進度同步與雲端備份中心 (OFFLINE PROGRESS & CLOUD SYNC CENTER)
         ========================================================================= */}
      {isSyncModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-slate-900 border-2 border-cyan-500/60 rounded-3xl p-6 max-w-2xl w-full shadow-2xl space-y-5 my-8 relative">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-2xl text-cyan-300">
                  ☁️
                </div>
                <div>
                  <h4 className="text-base sm:text-lg font-black text-cyan-300 flex items-center gap-2">
                    <span>離線學習進度同步與備份中心</span>
                  </h4>
                  <div className="flex items-center gap-2 text-xs mt-0.5">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        isOnline
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
                      <span>{isOnline ? '🟢 已連線網際網路 (Online)' : '🟠 離線快取運作中 (Offline)'}</span>
                    </span>
                    <span className="text-slate-400 font-mono">上次同步：{lastSyncTime || '尚未同步'}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setIsSyncModalOpen(false)}
                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sync Status Overview Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                <span className="text-[10px] font-bold text-slate-400 block">已掌握生字</span>
                <span className="text-lg font-black text-emerald-400">{masteryCounts.mastered} 個</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                <span className="text-[10px] font-bold text-slate-400 block">待複習生字</span>
                <span className="text-lg font-black text-amber-400">{masteryCounts.needs_review} 個</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                <span className="text-[10px] font-bold text-slate-400 block">星標收藏</span>
                <span className="text-lg font-black text-rose-400">{masteryCounts.favorites} 個</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                <span className="text-[10px] font-bold text-slate-400 block">待上傳佇列</span>
                <span className="text-lg font-black text-cyan-400">{syncQueue.length} 筆</span>
              </div>
            </div>

            {/* Main Action Buttons */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-cyan-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-cyan-300">⚡ 立即同步與資料管理</span>
                <span className="text-[10px] text-purple-300 font-bold">同步獎勵：+15 💎 知識水晶</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {/* Manual Cloud Sync Button */}
                <button
                  onClick={handleManualSync}
                  disabled={isSyncing}
                  className={`px-3.5 py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
                    isSyncing
                      ? 'bg-slate-800 text-slate-400 border border-slate-700'
                      : 'bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 hover:brightness-110'
                  }`}
                >
                  <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? '同步處理中...' : '立即雲端同步'}</span>
                </button>

                {/* Export JSON Backup */}
                <button
                  onClick={handleExportBackup}
                  className="px-3.5 py-2.5 rounded-xl bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 border border-indigo-500/40 font-black text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>匯出學習進度 JSON</span>
                </button>

                {/* Import JSON Backup */}
                <label className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-black text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer">
                  <Upload className="w-4 h-4" />
                  <span>還原匯入進度檔</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportBackup}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Offline Synchronization Queue & Activity Logs */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-300 flex items-center gap-1">
                  <span>📝 本機離線異動佇列與學習日誌 ({syncQueue.length})</span>
                </span>
                {syncQueue.length > 0 && (
                  <button
                    onClick={() => {
                      setSyncQueue([]);
                      localStorage.setItem('pwa_encyclopedia_sync_queue', JSON.stringify([]));
                    }}
                    className="text-[10px] text-slate-500 hover:text-slate-300 font-bold"
                  >
                    清空日誌
                  </button>
                )}
              </div>

              <div className="max-h-48 overflow-y-auto custom-scrollbar p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                {syncQueue.length === 0 ? (
                  <div className="text-center py-6 text-slate-500 text-xs font-bold space-y-1">
                    <CheckCircle2 className="w-6 h-6 mx-auto text-emerald-500/60" />
                    <p>所有離線複習與生字掌握狀態均已最新，暫無待同步佇列！</p>
                  </div>
                ) : (
                  syncQueue.map((item) => (
                    <div
                      key={item.id}
                      className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                          {item.action === 'mark_mastered' && '🌟 精通'}
                          {item.action === 'mark_review' && '⏳ 待複習'}
                          {item.action === 'flip_review' && '🔄 翻轉學習'}
                          {item.action === 'favorite_toggle' && '❤️ 收藏'}
                          {item.action === 'listen' && '🔊 導讀'}
                        </span>
                        <span className="font-bold text-slate-200">{item.summary}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500">{item.timestamp}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Footer Notice */}
            <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/20 flex items-center gap-2 text-[11px] text-cyan-300/80">
              <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>
                PWA 離線機制保障：所有知識卡片、發音導讀與掌握進度均已儲存於本機瀏覽器中，無網路狀態下仍可自由複習學習！
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfflineEncyclopediaKnowledgeBase;
