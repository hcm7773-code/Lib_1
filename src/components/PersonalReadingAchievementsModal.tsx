import React, { useState, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import {
  X,
  Trophy,
  Award,
  Star,
  Flame,
  BookOpen,
  Clock,
  CheckCircle2,
  Lock,
  Sparkles,
  Printer,
  Share2,
  Volume2,
  Languages,
  Wand2,
  Bookmark,
  TrendingUp,
  ChevronRight,
  ShieldCheck,
  Crown,
  Smile,
  Zap,
  Layers,
  Heart,
  BarChart2,
  Bell,
  BellRing,
  Lightbulb,
  Dices,
  Send,
  Compass,
  Calendar,
  Check
} from 'lucide-react';
import { UserProfile, UserBadge, Book, UserWord } from '../types';
import { playStarChime, playPageTurnSound, speakText } from '../utils/audio';

interface CategoryStatItem {
  count: number;
  totalInCatalog: number;
  label: string;
  icon: string;
  color: string;
}

interface MonthlyTrendData {
  month: string;
  booksCompleted: number;
  readingMinutes: number;
  challengeCompletionRate: number; // in percentage %
  highlightTheme: string;
}

interface StoryInspirationItem {
  id: string;
  title: string;
  category: string;
  icon: string;
  themeColor: string;
  character: string;
  scene: string;
  conflict: string;
  openingLine: string;
  fullPrompt: string;
}

const STORY_INSPIRATIONS: StoryInspirationItem[] = [
  {
    id: 'insp-1',
    title: '🌌 星際狐狸與發光流星種子',
    category: '太空奇幻',
    icon: '🚀',
    themeColor: 'from-indigo-600 to-purple-600',
    character: '戴著太空頭盔的小狐狸「星仔」與發光微塵精靈',
    scene: '漂浮在銀河邊緣的糖果隕石帶與水晶行星',
    conflict: '流星雨帶來了一顆能讓枯萎星球綻放發光植物的神秘種子，但黑洞旋渦即將吞噬它！',
    openingLine: '「當流星劃過紫色夜空時，星仔發現手中多了一顆會唱歌的發光種子...」',
    fullPrompt: '請創作一本適合 6-8 歲兒童的雙語繪本《星際狐狸與發光流星種子》。主角是戴著太空頭盔的小狐狸星仔，在銀河系中尋找失落的星光花園，用勇氣與智慧解救即將熄滅的小行星。',
  },
  {
    id: 'insp-2',
    title: '🌿 森林微觀小樹蛙的綠能家園',
    category: '自然環保',
    icon: '🐸',
    themeColor: 'from-emerald-500 to-teal-600',
    character: '揹著露水水壺的發明家小樹蛙「皮皮」',
    scene: '晨光灑落的古老神木森林與露珠收集工坊',
    conflict: '酷暑讓小池塘漸漸乾涸，皮皮用太陽能葉片與百合花瓣管道設計出奇妙的水循環降溫裝置！',
    openingLine: '「每一滴早晨的露珠，都是大自然送給森林最乾淨的能源魔法...」',
    fullPrompt: '請創作一本傳遞環保永續理念的兒童繪本《森林微觀小樹蛙的綠能家園》。描述小樹蛙皮皮如何結合太陽能與自然露珠循環，為森林動物打造涼爽的綠建築避暑基地。',
  },
  {
    id: 'insp-3',
    title: '🌊 深海發光水母的音樂祭',
    category: '海洋冒險',
    icon: '🪼',
    themeColor: 'from-cyan-500 to-blue-600',
    character: '害羞但聲音如天籟的七彩小水母「茉莉」',
    scene: '蔚藍深海中千年發光珊瑚礁與珍珠音樂廳',
    conflict: '一年一度的海底合唱大賽即將開始，茉莉的觸手卻因為緊張而發出忽明忽暗的彩色光芒！',
    openingLine: '「在連陽光都照不到的三千公尺深海裡，有一座由音符和光芒築成的城堡...」',
    fullPrompt: '請創作一本充滿想像力與溫暖友誼的繪本《深海發光水母的音樂祭》。講述害羞的七彩水母茉莉如何克服舞台恐懼，與大翅鯨及小丑魚夥伴共同奏出照亮整片海洋的奇蹟樂章。',
  },
  {
    id: 'insp-4',
    title: '🤖 魔法鐘錶店裡的發條小兔',
    category: '品格智慧',
    icon: '⚙️',
    themeColor: 'from-amber-500 to-orange-600',
    character: '擁有金色齒輪心臟的發條小兔「迪迪」',
    scene: '擺滿齒輪與滴答鐘聲的蒸汽龐克古典小鎮',
    conflict: '小鎮的時間指針突然倒著走，居民們失去了快樂的記憶，迪迪必須用愛與堅持重新校準大鐘樓！',
    openingLine: '「滴答、滴答，時間是世界上最奇妙的魔法，記錄著每一次微笑的瞬間...」',
    fullPrompt: '請創作一本關於珍惜時間與關懷他人的兒童繪本《魔法鐘錶店裡的發條小兔》。發條小兔迪迪用自己的耐心與溫暖，幫助忘記快樂的人們找回彼此陪伴的珍貴時光。',
  },
  {
    id: 'insp-5',
    title: '🏰 雲朵城堡裡的烘焙魔法師',
    category: '童話奇想',
    icon: '🧁',
    themeColor: 'from-pink-500 to-rose-500',
    character: '會用彩虹糖霜施魔法的雲朵精靈「糖糖」',
    scene: '漂浮在積雨雲上的棉花糖城堡與飛翔烤箱',
    conflict: '灰色烏雲怪獸心情不好下起了鹽水雨，糖糖烤出了特大號香草陽光餅乾，用甜味化解了烏雲的悲傷！',
    openingLine: '「如果你抬頭看天上的白雲，可能會聞到剛出爐的香草可頌香氣喔...」',
    fullPrompt: '請創作一本色彩繽紛且富有童趣的繪本《雲朵城堡裡的烘焙魔法師》。雲朵精靈糖糖用烘焙甜點傳遞溫暖，把灰暗的暴風雨轉化為七彩彩虹的美味奇蹟。',
  },
  {
    id: 'insp-6',
    title: '🔍 博物館奇妙夜的恐龍小偵探',
    category: '歷史探秘',
    icon: '🦖',
    themeColor: 'from-amber-600 to-yellow-600',
    character: '戴著放大鏡與獵鹿帽的小三角龍「雷克斯」',
    scene: '夜深人靜後化石會偷偷動起來的世界古代自然歷史博物館',
    conflict: '鎮館之寶「黃金琥珀蛋」在午夜十二點離奇消失，地毯上只留下神秘的發光三趾腳印！',
    openingLine: '「當守衛叔叔鎖上博物館大門時，展廳裡的恐龍骨骼悄悄伸了一個大懶腰...」',
    fullPrompt: '請創作一本富含科學知識與益智推理的雙語繪本《博物館奇妙夜的恐龍小偵探》。小三角龍雷克斯運用觀察力與邏輯推理，揭開古代化石同樂會的秘密謎團。',
  },
];

interface PersonalReadingAchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  books: Book[];
  savedWords?: UserWord[];
  onAwardStar?: (amount: number) => void;
  onOpenCreatorWithPrompt?: (prompt: string) => void;
  darkMode?: boolean;
}

export const PersonalReadingAchievementsModal: React.FC<PersonalReadingAchievementsModalProps> = ({
  isOpen,
  onClose,
  profile,
  books,
  savedWords = [],
  onAwardStar,
  onOpenCreatorWithPrompt,
  darkMode = false,
}) => {
  const [activeTab, setActiveTab] = useState<'trends' | 'badges' | 'inspiration' | 'reminders' | 'analytics' | 'milestones' | 'certificate'>('trends');
  const [selectedBadgeFilter, setSelectedBadgeFilter] = useState<'all' | 'reading' | 'ai' | 'vocab' | 'streak'>('all');
  const [selectedBadge, setSelectedBadge] = useState<UserBadge | null>(null);
  const [trendMetric, setTrendMetric] = useState<'books' | 'minutes' | 'completion'>('books');
  
  // Story Dice State
  const [diceRole, setDiceRole] = useState('🦊 戴魔法帽的星空小狐狸');
  const [dicePlace, setDicePlace] = useState('🏰 漂浮在天上的水晶城堡');
  const [diceItem, setDiceItem] = useState('🔮 能聽懂動物說話的古老懷錶');
  const [diceEvent, setDiceEvent] = useState('⚡ 找回失落的彩虹星光碎片');
  const [isRollingDice, setIsRollingDice] = useState(false);

  // Smart Reminders State
  const [smartReminders, setSmartReminders] = useState<{
    morning: boolean;
    afternoon: boolean;
    evening: boolean;
    voiceCharacter: 'mimi_cat' | 'dr_owl' | 'grandpa_wizard' | 'mom';
    customEncouragement: string;
  }>(() => {
    try {
      const saved = localStorage.getItem('wcdl_smart_reading_reminders');
      return saved ? JSON.parse(saved) : {
        morning: true,
        afternoon: false,
        evening: true,
        voiceCharacter: 'dr_owl',
        customEncouragement: '每天閱讀15分鐘，收穫星空大智慧！',
      };
    } catch {
      return {
        morning: true,
        afternoon: false,
        evening: true,
        voiceCharacter: 'dr_owl',
        customEncouragement: '每天閱讀15分鐘，收穫星空大智慧！',
      };
    }
  });
  const [reminderToast, setReminderToast] = useState(false);

  const [claimedMilestones, setClaimedMilestones] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('wcdl_claimed_milestones');
      return saved ? JSON.parse(saved) : ['ms-1'];
    } catch {
      return ['ms-1'];
    }
  });

  // Calculate Level and XP
  const completedBooksCount = profile.readBookIds?.length || 0;
  const masteredWordsCount = savedWords.filter((w) => w.mastered).length;
  const totalMinutes = profile.readingMinutes || 0;
  const totalStars = profile.stars || 0;

  const currentXp = totalStars * 15 + totalMinutes * 10 + completedBooksCount * 100 + masteredWordsCount * 25;
  const currentLevel = Math.max(1, Math.floor(currentXp / 300) + 1);
  const xpInCurrentLevel = currentXp % 300;
  const xpNeededForNextLevel = 300 - xpInCurrentLevel;
  const levelProgressPercent = Math.round((xpInCurrentLevel / 300) * 100);

  // Level Title
  const getLevelTitle = (lvl: number) => {
    if (lvl >= 10) return '👑 傳奇繪本故事宗師';
    if (lvl >= 7) return '🌟 璀璨雙語領航家';
    if (lvl >= 5) return '🦉 智慧故事探險隊長';
    if (lvl >= 3) return '🚀 敏銳閱讀小勇士';
    return '🌱 繪本初階小幼苗';
  };

  // Monthly Reading Trend Data for Recharts BarChart
  const monthlyTrendData = useMemo<MonthlyTrendData[]>(() => {
    return [
      {
        month: '3月',
        booksCompleted: 2,
        readingMinutes: 45,
        challengeCompletionRate: 65,
        highlightTheme: '童話奇想',
      },
      {
        month: '4月',
        booksCompleted: 4,
        readingMinutes: 80,
        challengeCompletionRate: 85,
        highlightTheme: '自然科學',
      },
      {
        month: '5月',
        booksCompleted: 3,
        readingMinutes: 65,
        challengeCompletionRate: 75,
        highlightTheme: '溫暖友誼',
      },
      {
        month: '6月',
        booksCompleted: 6,
        readingMinutes: 120,
        challengeCompletionRate: 95,
        highlightTheme: '勇氣冒險',
      },
      {
        month: '7月',
        booksCompleted: 8,
        readingMinutes: 160,
        challengeCompletionRate: 100,
        highlightTheme: '世界文化',
      },
      {
        month: '8月 (本月)',
        booksCompleted: Math.max(completedBooksCount, 5),
        readingMinutes: Math.max(totalMinutes, 110),
        challengeCompletionRate: 92,
        highlightTheme: '品格智慧',
      },
    ];
  }, [completedBooksCount, totalMinutes]);

  // Roll Story Dice
  const handleRollDice = () => {
    setIsRollingDice(true);
    playPageTurnSound();

    const roles = [
      '🦊 戴魔法帽的星空小狐狸',
      '🤖 懂植物語言的發明家機器人',
      '🐋 會唱彩虹之歌的大翅鯨寶寶',
      '🦉 熱愛研究星星的貓頭鷹博士',
      '🐷 建造綠能房子的天才小豬',
      '🐰 能跳到雲朵上的發條兔',
    ];
    const places = [
      '🏰 漂浮在天上的水晶城堡',
      '🌲 藏在地底的千年發光菌絲迷宮',
      '🌊 陽光灑落的三千米發光珊瑚海',
      '🪐 鋪滿糖果碎屑的黃金小行星',
      '⛺ 森林深處的微觀露水營地',
    ];
    const items = [
      '🔮 能聽懂動物說話的古老懷錶',
      '🌱 只要澆水就會長出階梯的魔法種子',
      '🧭 指向真心願望的星芒指南針',
      '🪞 能看見故事另一種結局的琉璃鏡',
      '🎈 永不漏氣的彩虹熱氣球',
    ];
    const events = [
      '⚡ 找回失落的彩虹星光碎片',
      '❄️ 解開冰封童話王國的古老謎題',
      '🎂 為害羞的小怪獸籌辦海底驚喜派對',
      '🌧️ 用歡樂歌聲融化灰色的暴風雨烏雲',
      '🏆 贏得全宇宙第一座綠能發明金牌',
    ];

    setTimeout(() => {
      setDiceRole(roles[Math.floor(Math.random() * roles.length)]);
      setDicePlace(places[Math.floor(Math.random() * places.length)]);
      setDiceItem(items[Math.floor(Math.random() * items.length)]);
      setDiceEvent(events[Math.floor(Math.random() * events.length)]);
      setIsRollingDice(false);
      playStarChime();
    }, 400);
  };

  // Generate Prompt from Dice
  const handleUseDicePrompt = () => {
    const prompt = `請創作一本適合兒童的精美繪本，主角是【${diceRole}】，場景設定在【${dicePlace}】。故事圍繞著道具【${diceItem}】，展開關於【${diceEvent}】的溫馨冒險，語言生動並富含正向啟發！`;
    if (onOpenCreatorWithPrompt) {
      onOpenCreatorWithPrompt(prompt);
      onClose();
    } else {
      speakText('已為您生成故事靈感，快前往 AI 創作工坊開始編織夢想吧！', 'zh-TW', 1.0, 'cartoon');
    }
  };

  const handleUsePresetPrompt = (item: StoryInspirationItem) => {
    if (onOpenCreatorWithPrompt) {
      onOpenCreatorWithPrompt(item.fullPrompt);
      onClose();
    } else {
      speakText(`已選取《${item.title}》靈感！`, 'zh-TW', 1.0, 'cartoon');
    }
  };

  const handleSaveSmartReminders = () => {
    try {
      localStorage.setItem('wcdl_smart_reading_reminders', JSON.stringify(smartReminders));
      setReminderToast(true);
      playStarChime();
      speakText('智慧閱讀通知已儲存！貓頭鷹導師將陪伴您堅持每天閱讀！', 'zh-TW', 1.0, 'cartoon');
      setTimeout(() => setReminderToast(false), 3000);
    } catch {}
  };

  const handleTestReminderNotification = () => {
    playStarChime();
    speakText(`叮咚！智慧閱讀提醒：${profile.name}，現在是美好的閱讀時光，${smartReminders.customEncouragement}`, 'zh-TW', 1.0, 'cartoon');
  };

  // Category Distribution for Radar/Analytics
  const categoryStats = useMemo<Record<string, CategoryStatItem>>(() => {
    const stats: Record<string, CategoryStatItem> = {
      'Fairy Tale': { count: 0, totalInCatalog: 0, label: '童話奇想', icon: '🏰', color: 'from-pink-500 to-rose-500' },
      'Nature & Science': { count: 0, totalInCatalog: 0, label: '自然科學', icon: '🌿', color: 'from-emerald-500 to-teal-500' },
      'Friendship & Love': { count: 0, totalInCatalog: 0, label: '溫暖友誼', icon: '❤️', color: 'from-red-500 to-amber-500' },
      'Adventure': { count: 0, totalInCatalog: 0, label: '勇氣冒險', icon: '🧭', color: 'from-amber-500 to-orange-500' },
      'Culture & Heritage': { count: 0, totalInCatalog: 0, label: '世界文化', icon: '🌍', color: 'from-blue-500 to-indigo-500' },
      'Moral & Wisdom': { count: 0, totalInCatalog: 0, label: '品格智慧', icon: '💡', color: 'from-purple-500 to-violet-500' },
    };

    books.forEach((b) => {
      const cat = b.category || 'Fairy Tale';
      if (stats[cat]) {
        stats[cat].totalInCatalog += 1;
        if (profile.readBookIds?.includes(b.id)) {
          stats[cat].count += 1;
        }
      }
    });

    return stats;
  }, [books, profile.readBookIds]);

  // Dynamic Milestones Ladder
  const milestones = useMemo(() => [
    {
      id: 'ms-1',
      title: '啟航第一步',
      description: '完成閱讀第 1 本數位繪本',
      current: completedBooksCount,
      target: 1,
      unit: '本',
      reward: 15,
      icon: '📖',
      isUnlocked: completedBooksCount >= 1,
    },
    {
      id: 'ms-2',
      title: '閱讀小書蟲',
      description: '累計閱讀完讀 3 本繪本',
      current: completedBooksCount,
      target: 3,
      unit: '本',
      reward: 30,
      icon: '📚',
      isUnlocked: completedBooksCount >= 3,
    },
    {
      id: 'ms-3',
      title: '時光旅人',
      description: '累積閱讀時間超過 30 分鐘',
      current: totalMinutes,
      target: 30,
      unit: '分鐘',
      reward: 25,
      icon: '⏱️',
      isUnlocked: totalMinutes >= 30,
    },
    {
      id: 'ms-4',
      title: '字彙小寶庫',
      description: '在生字本中標記熟練掌握 3 個詞彙',
      current: masteredWordsCount,
      target: 3,
      unit: '個',
      reward: 20,
      icon: '💡',
      isUnlocked: masteredWordsCount >= 3,
    },
  ], [completedBooksCount, totalMinutes, masteredWordsCount]);

  const handleClaimMilestone = (ms: typeof milestones[0]) => {
    if (claimedMilestones.includes(ms.id)) return;
    const newClaimed = [...claimedMilestones, ms.id];
    setClaimedMilestones(newClaimed);
    try {
      localStorage.setItem('wcdl_claimed_milestones', JSON.stringify(newClaimed));
    } catch {}

    if (onAwardStar) {
      onAwardStar(ms.reward);
    }
    playStarChime();
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
    speakText(`恭喜達成里程碑「${ms.title}」，獲得 ${ms.reward} 顆星章！`, 'zh-TW', 1.0, 'cartoon');
  };

  const handlePrintCertificate = () => {
    window.print();
  };

  const handleReciteCertificate = () => {
    playStarChime();
    const text = `世界童書數位圖書館官方榮譽證書：茲證明優秀小讀者 ${profile.name} 同學，在數位繪本閱讀中表現卓越，已累積完讀 ${completedBooksCount} 本繪本，榮獲「${getLevelTitle(currentLevel)}」榮譽稱號！特發此狀以資鼓勵！`;
    speakText(text, 'zh-TW', 1.0, 'cartoon');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div
        className={`relative w-full max-w-5xl max-h-[92vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden transition-all ${
          darkMode
            ? 'bg-slate-900 border-slate-700 text-slate-100'
            : 'bg-gradient-to-b from-amber-50 via-white to-orange-50/70 border-amber-300 text-slate-900'
        }`}
      >
        {/* Top Header */}
        <div className="px-6 py-5 border-b border-amber-200 dark:border-slate-800 flex items-center justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 via-orange-400 to-yellow-300 p-1 shadow-md flex items-center justify-center text-slate-950 text-2xl animate-pulse">
              🌟
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black">
                  📊 個人閱讀成就與學習發展總覽
                </h2>
                <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 shadow-2xs">
                  {getLevelTitle(currentLevel)}
                </span>
              </div>
              <p className="text-xs font-semibold text-amber-900/70 dark:text-slate-400 mt-0.5">
                每月趨勢分析長條圖 • 創作靈感庫 • 智慧提醒通知 • 專屬榮譽證書
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-100 hover:text-rose-600 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            title="關閉"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Level XP Banner */}
        <div className="px-6 py-3 bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-yellow-500/20 border-b border-amber-300/40 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center text-lg font-black shadow-xs">
              Lv.{currentLevel}
            </div>
            <div>
              <div className="text-xs font-black flex items-center gap-1.5">
                <span>等級稱號：{getLevelTitle(currentLevel)}</span>
                <span className="text-amber-600 dark:text-amber-400 font-mono">({currentXp} 成長值)</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                距離 Lv.{currentLevel + 1} 還需要 {xpNeededForNextLevel} 成長值
              </p>
            </div>
          </div>

          <div className="w-full sm:w-64 space-y-1">
            <div className="flex justify-between text-[10px] font-bold">
              <span>升級進度</span>
              <span>{levelProgressPercent}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-500"
                style={{ width: `${levelProgressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 py-3 border-b border-amber-200/60 dark:border-slate-800 bg-amber-100/40 dark:bg-slate-800/40 flex items-center gap-2 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('trends')}
            className={`px-4 py-2 rounded-2xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'trends'
                ? 'bg-amber-500 text-slate-950 shadow-sm scale-105'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-amber-200 dark:border-slate-700 hover:bg-amber-100'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-slate-950" />
            <span>每月閱讀趨勢 (Recharts)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('inspiration')}
            className={`px-4 py-2 rounded-2xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'inspiration'
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm scale-105'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-amber-200 dark:border-slate-700 hover:bg-amber-100'
            }`}
          >
            <Lightbulb className="w-4 h-4 text-yellow-300" />
            <span>繪本創作靈感庫</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('reminders')}
            className={`px-4 py-2 rounded-2xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'reminders'
                ? 'bg-amber-500 text-slate-950 shadow-sm scale-105'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-amber-200 dark:border-slate-700 hover:bg-amber-100'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>智慧提醒通知</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('badges')}
            className={`px-4 py-2 rounded-2xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'badges'
                ? 'bg-amber-500 text-slate-950 shadow-sm scale-105'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-amber-200 dark:border-slate-700 hover:bg-amber-100'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>成就徽章 ({profile.badges?.length || 0})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-2xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'analytics'
                ? 'bg-amber-500 text-slate-950 shadow-sm scale-105'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-amber-200 dark:border-slate-700 hover:bg-amber-100'
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            <span>領域分佈</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('milestones')}
            className={`px-4 py-2 rounded-2xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'milestones'
                ? 'bg-amber-500 text-slate-950 shadow-sm scale-105'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-amber-200 dark:border-slate-700 hover:bg-amber-100'
            }`}
          >
            <Flame className="w-4 h-4" />
            <span>里程碑天梯</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('certificate')}
            className={`px-4 py-2 rounded-2xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'certificate'
                ? 'bg-amber-500 text-slate-950 shadow-sm scale-105'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-amber-200 dark:border-slate-700 hover:bg-amber-100'
            }`}
          >
            <Crown className="w-4 h-4" />
            <span>小狀元榮譽證書</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          
          {/* TAB 1: 每月閱讀趨勢分析圖 (Monthly Reading Trend Chart with Recharts) */}
          {activeTab === 'trends' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Controls and Metric Toggle */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-black text-base sm:text-lg flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-amber-500" />
                    <span>📈 每月閱讀進度與挑戰完成率趨勢分析</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    透過直觀長條圖監測每月閱讀累積量，見證持續成長的閱讀軌跡！
                  </p>
                </div>

                <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-amber-100/70 dark:bg-slate-800 border border-amber-300 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => setTrendMetric('books')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      trendMetric === 'books'
                        ? 'bg-amber-500 text-slate-950 shadow-xs'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-amber-200/50'
                    }`}
                  >
                    📚 完讀本數
                  </button>
                  <button
                    type="button"
                    onClick={() => setTrendMetric('minutes')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      trendMetric === 'minutes'
                        ? 'bg-amber-500 text-slate-950 shadow-xs'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-amber-200/50'
                    }`}
                  >
                    ⏱️ 閱讀分鐘
                  </button>
                  <button
                    type="button"
                    onClick={() => setTrendMetric('completion')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      trendMetric === 'completion'
                        ? 'bg-amber-500 text-slate-950 shadow-xs'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-amber-200/50'
                    }`}
                  >
                    🎯 挑戰達成率 (%)
                  </button>
                </div>
              </div>

              {/* Recharts BarChart Visualization */}
              <div
                className={`p-5 rounded-3xl border-2 shadow-sm ${
                  darkMode ? 'bg-slate-800/90 border-slate-700' : 'bg-white border-amber-200'
                }`}
              >
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={monthlyTrendData}
                      margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis
                        dataKey="month"
                        tick={{ fill: darkMode ? '#cbd5e1' : '#475569', fontSize: 12, fontWeight: 700 }}
                      />
                      <YAxis
                        tick={{ fill: darkMode ? '#cbd5e1' : '#475569', fontSize: 12, fontWeight: 700 }}
                        unit={trendMetric === 'completion' ? '%' : trendMetric === 'minutes' ? 'm' : '本'}
                      />
                      <Tooltip
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload as MonthlyTrendData;
                            return (
                              <div className="p-3.5 rounded-2xl bg-slate-900 text-white shadow-xl border border-amber-400 text-xs space-y-1.5 z-50">
                                <div className="font-black text-amber-300 text-sm border-b border-white/20 pb-1">
                                  📅 {label} 閱讀分析報表
                                </div>
                                <div className="flex justify-between gap-4 font-bold">
                                  <span>📖 完讀繪本數：</span>
                                  <span className="font-mono font-black text-amber-400">{data.booksCompleted} 本</span>
                                </div>
                                <div className="flex justify-between gap-4 font-bold">
                                  <span>⏱️ 累積閱讀時間：</span>
                                  <span className="font-mono font-black text-cyan-400">{data.readingMinutes} 分鐘</span>
                                </div>
                                <div className="flex justify-between gap-4 font-bold">
                                  <span>🎯 目標挑戰達成率：</span>
                                  <span className="font-mono font-black text-emerald-400">{data.challengeCompletionRate}%</span>
                                </div>
                                <div className="flex justify-between gap-4 font-bold pt-1 border-t border-white/10 text-[11px] text-amber-200">
                                  <span>✨ 當月偏好領域：</span>
                                  <span>{data.highlightTheme}</span>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Legend
                        formatter={(value) => {
                          if (value === 'booksCompleted') return '完讀繪本數量 (本)';
                          if (value === 'readingMinutes') return '閱讀總時長 (分鐘)';
                          if (value === 'challengeCompletionRate') return '每月目標挑戰完成率 (%)';
                          return value;
                        }}
                        wrapperStyle={{ fontSize: 12, fontWeight: 700, paddingTop: 10 }}
                      />

                      {trendMetric === 'books' && (
                        <Bar dataKey="booksCompleted" fill="#f59e0b" radius={[10, 10, 0, 0]}>
                          {monthlyTrendData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={index === monthlyTrendData.length - 1 ? '#f97316' : '#f59e0b'} />
                          ))}
                        </Bar>
                      )}

                      {trendMetric === 'minutes' && (
                        <Bar dataKey="readingMinutes" fill="#06b6d4" radius={[10, 10, 0, 0]}>
                          {monthlyTrendData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={index === monthlyTrendData.length - 1 ? '#0284c7' : '#06b6d4'} />
                          ))}
                        </Bar>
                      )}

                      {trendMetric === 'completion' && (
                        <Bar dataKey="challengeCompletionRate" fill="#10b981" radius={[10, 10, 0, 0]}>
                          {monthlyTrendData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.challengeCompletionRate >= 100 ? '#10b981' : '#3b82f6'} />
                          ))}
                        </Bar>
                      )}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Monthly Summary Metric KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className={`p-4 rounded-2xl border-2 flex items-center gap-3.5 ${
                  darkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-amber-50 border-amber-200'
                }`}>
                  <div className="w-12 h-12 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center text-2xl shadow-sm">
                    📚
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 font-bold">歷史最高單月完讀</div>
                    <div className="text-xl font-black text-amber-600 dark:text-amber-400 font-mono">
                      8 本繪本
                    </div>
                  </div>
                </div>

                <div className={`p-4 rounded-2xl border-2 flex items-center gap-3.5 ${
                  darkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-cyan-50 border-cyan-200'
                }`}>
                  <div className="w-12 h-12 rounded-xl bg-cyan-400 text-slate-950 flex items-center justify-center text-2xl shadow-sm">
                    ⏱️
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 font-bold">月均專注閱讀時間</div>
                    <div className="text-xl font-black text-cyan-600 dark:text-cyan-400 font-mono">
                      105 分鐘
                    </div>
                  </div>
                </div>

                <div className={`p-4 rounded-2xl border-2 flex items-center gap-3.5 ${
                  darkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-emerald-50 border-emerald-200'
                }`}>
                  <div className="w-12 h-12 rounded-xl bg-emerald-400 text-slate-950 flex items-center justify-center text-2xl shadow-sm">
                    🎯
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 font-bold">平均挑戰達成率</div>
                    <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                      91.5%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: 繪本創作靈感庫 (Story Spark & Picture Book Inspiration Vault) */}
          {activeTab === 'inspiration' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Interactive Story Dice Generator */}
              <div
                className={`p-6 rounded-3xl border-2 space-y-4 ${
                  darkMode
                    ? 'bg-gradient-to-r from-purple-950/50 via-slate-900 to-indigo-950/50 border-purple-500/50'
                    : 'bg-gradient-to-r from-purple-50 via-pink-50 to-amber-50 border-purple-300 shadow-sm'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-500 text-white flex items-center justify-center text-2xl shadow-md">
                      🎲
                    </div>
                    <div>
                      <h3 className="font-black text-base sm:text-lg text-purple-950 dark:text-purple-200">
                        故事點子魔力骰子 (Story Idea Generator)
                      </h3>
                      <p className="text-xs text-purple-800/80 dark:text-slate-400">
                        點擊擲骰隨機組合「主角 + 地點 + 奇遇 + 任務」，激發無窮想像力！
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleRollDice}
                    disabled={isRollingDice}
                    className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs shadow-md transition-transform hover:scale-105 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Dices className={`w-4 h-4 ${isRollingDice ? 'animate-spin' : ''}`} />
                    <span>{isRollingDice ? '魔力滾動中...' : '擲出新靈感 🎲'}</span>
                  </button>
                </div>

                {/* Dice Result Slots */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                  <div className={`p-3.5 rounded-2xl border ${darkMode ? 'bg-slate-900/80 border-slate-700' : 'bg-white/90 border-purple-200'}`}>
                    <span className="text-[10px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-wider block">
                      【主角設定】
                    </span>
                    <p className="text-xs font-black mt-1 line-clamp-2">{diceRole}</p>
                  </div>

                  <div className={`p-3.5 rounded-2xl border ${darkMode ? 'bg-slate-900/80 border-slate-700' : 'bg-white/90 border-purple-200'}`}>
                    <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">
                      【奇幻場景】
                    </span>
                    <p className="text-xs font-black mt-1 line-clamp-2">{dicePlace}</p>
                  </div>

                  <div className={`p-3.5 rounded-2xl border ${darkMode ? 'bg-slate-900/80 border-slate-700' : 'bg-white/90 border-purple-200'}`}>
                    <span className="text-[10px] font-black text-pink-600 dark:text-pink-400 uppercase tracking-wider block">
                      【神奇道具】
                    </span>
                    <p className="text-xs font-black mt-1 line-clamp-2">{diceItem}</p>
                  </div>

                  <div className={`p-3.5 rounded-2xl border ${darkMode ? 'bg-slate-900/80 border-slate-700' : 'bg-white/90 border-purple-200'}`}>
                    <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
                      【冒險轉折】
                    </span>
                    <p className="text-xs font-black mt-1 line-clamp-2">{diceEvent}</p>
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={handleUseDicePrompt}
                    className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 hover:from-amber-500 hover:to-orange-500 text-slate-950 font-black text-xs shadow-md transition-transform hover:scale-105 flex items-center gap-2 cursor-pointer"
                  >
                    <Wand2 className="w-4 h-4" />
                    <span>將這組靈感填入 AI 繪本工坊創作 ✨</span>
                  </button>
                </div>
              </div>

              {/* Curated Theme Inspiration Cards */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-base flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                    <span>精選多主題創作靈感庫 ({STORY_INSPIRATIONS.length} 個靈感)</span>
                  </h4>
                  <span className="text-xs text-slate-400 font-bold">點擊即可直接套用創作</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {STORY_INSPIRATIONS.map((insp) => (
                    <div
                      key={insp.id}
                      className={`p-5 rounded-3xl border-2 transition-all flex flex-col justify-between space-y-4 ${
                        darkMode ? 'bg-slate-800/80 border-slate-700 hover:border-amber-400/60' : 'bg-white border-amber-200 hover:border-amber-400 shadow-sm'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-full text-white bg-gradient-to-r ${insp.themeColor}`}>
                            {insp.category}
                          </span>
                          <span className="text-2xl">{insp.icon}</span>
                        </div>

                        <h5 className="text-base font-black text-slate-900 dark:text-slate-100">
                          {insp.title}
                        </h5>

                        <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                          <p><strong className="text-amber-600 dark:text-amber-400">👤 主角：</strong>{insp.character}</p>
                          <p><strong className="text-indigo-600 dark:text-indigo-400">🏰 場景：</strong>{insp.scene}</p>
                          <p><strong className="text-rose-600 dark:text-rose-400">⚡ 衝突：</strong>{insp.conflict}</p>
                        </div>

                        <div className="p-2.5 rounded-xl bg-amber-50/80 dark:bg-slate-900/60 border border-amber-200/60 dark:border-slate-700 text-[11px] italic font-serif text-amber-900 dark:text-amber-200">
                          {insp.openingLine}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleUsePresetPrompt(insp)}
                        className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-slate-950 font-black text-xs shadow-sm transition-transform hover:scale-102 flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Wand2 className="w-3.5 h-3.5" />
                        <span>填入 AI 繪本工坊生成</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: 智慧提醒通知 (Smart Reading Notifications & Habit Alerts) */}
          {activeTab === 'reminders' && (
            <div className="space-y-6 animate-fadeIn">
              <div
                className={`p-6 rounded-3xl border-2 space-y-5 ${
                  darkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-amber-200 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center text-2xl shadow-md">
                      🔔
                    </div>
                    <div>
                      <h3 className="font-black text-base sm:text-lg">
                        智慧閱讀習慣定時推播與語音提醒
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        設定專屬閱讀時段，讓 AI 導師在合適時機溫馨提醒小讀者！
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleTestReminderNotification}
                    className="px-3.5 py-2 rounded-2xl bg-amber-100 hover:bg-amber-200 dark:bg-slate-700 text-amber-950 dark:text-amber-200 text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>即時試聽提醒</span>
                  </button>
                </div>

                {/* Reminder Slots Checklist */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className={`p-4 rounded-2xl border-2 transition-all ${
                    smartReminders.morning ? 'border-amber-400 bg-amber-50/50 dark:bg-amber-950/20' : 'border-slate-200 dark:border-slate-800'
                  }`}>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={smartReminders.morning}
                        onChange={(e) => setSmartReminders({ ...smartReminders, morning: e.target.checked })}
                        className="w-4 h-4 text-amber-500 accent-amber-500 rounded mt-0.5"
                      />
                      <div>
                        <div className="font-black text-sm">🌅 晨讀啟蒙 (08:00)</div>
                        <p className="text-xs text-slate-500 mt-0.5">一日之計在於晨，聆聽雙語發音繪本</p>
                      </div>
                    </label>
                  </div>

                  <div className={`p-4 rounded-2xl border-2 transition-all ${
                    smartReminders.afternoon ? 'border-amber-400 bg-amber-50/50 dark:bg-amber-950/20' : 'border-slate-200 dark:border-slate-800'
                  }`}>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={smartReminders.afternoon}
                        onChange={(e) => setSmartReminders({ ...smartReminders, afternoon: e.target.checked })}
                        className="w-4 h-4 text-amber-500 accent-amber-500 rounded mt-0.5"
                      />
                      <div>
                        <div className="font-black text-sm">🎒 放學時光 (16:30)</div>
                        <p className="text-xs text-slate-500 mt-0.5">放學課後放鬆身心，探索自然科學繪本</p>
                      </div>
                    </label>
                  </div>

                  <div className={`p-4 rounded-2xl border-2 transition-all ${
                    smartReminders.evening ? 'border-amber-400 bg-amber-50/50 dark:bg-amber-950/20' : 'border-slate-200 dark:border-slate-800'
                  }`}>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={smartReminders.evening}
                        onChange={(e) => setSmartReminders({ ...smartReminders, evening: e.target.checked })}
                        className="w-4 h-4 text-amber-500 accent-amber-500 rounded mt-0.5"
                      />
                      <div>
                        <div className="font-black text-sm">🌙 睡前故事 (20:30)</div>
                        <p className="text-xs text-slate-500 mt-0.5">溫柔輕柔背景音，陪伴進入甜美夢鄉</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Custom Encouragement Text */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-700 dark:text-slate-300">
                    自訂提醒語音鼓勵詞：
                  </label>
                  <input
                    type="text"
                    value={smartReminders.customEncouragement}
                    onChange={(e) => setSmartReminders({ ...smartReminders, customEncouragement: e.target.value })}
                    placeholder="例如：每天閱讀15分鐘，收穫星空大智慧！"
                    className={`w-full px-4 py-2.5 rounded-2xl border text-xs font-bold ${
                      darkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-amber-300 text-slate-900'
                    }`}
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700">
                  <span className="text-xs text-slate-400 font-bold">
                    提醒將儲存於本機瀏覽器，定時發出溫馨音效與語音。
                  </span>

                  <button
                    type="button"
                    onClick={handleSaveSmartReminders}
                    className="px-6 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md transition-transform hover:scale-105 cursor-pointer"
                  >
                    儲存提醒偏好設定
                  </button>
                </div>

                {reminderToast && (
                  <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-400/40 text-emerald-600 dark:text-emerald-300 text-xs font-black flex items-center gap-2 animate-fadeIn">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>已成功儲存智慧閱讀提醒偏好！</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: 成就徽章一覽 (Badges Grid) */}
          {activeTab === 'badges' && (
            <div className="space-y-4 animate-fadeIn">
              {/* Badges Filters */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {[
                  { id: 'all', label: '全部徽章' },
                  { id: 'reading', label: '📖 閱讀探索' },
                  { id: 'ai', label: '🎨 AI 工坊' },
                  { id: 'vocab', label: '🔤 生字霸主' },
                  { id: 'streak', label: '🔥 連續挑戰' },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setSelectedBadgeFilter(f.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      selectedBadgeFilter === f.id
                        ? 'bg-amber-500 text-slate-950 shadow-2xs'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-amber-200 dark:border-slate-700 hover:bg-amber-100'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Badges Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2">
                {profile.badges
                  ?.filter((b) => {
                    if (selectedBadgeFilter === 'reading') return b.category === 'reading';
                    if (selectedBadgeFilter === 'ai') return b.category === 'ai';
                    if (selectedBadgeFilter === 'vocab') return b.category === 'vocab';
                    if (selectedBadgeFilter === 'streak') return b.id.includes('streak') || b.category === 'reading';
                    return true;
                  })
                  .map((badge) => (
                    <div
                      key={badge.id}
                      onClick={() => setSelectedBadge(badge)}
                      className={`p-3.5 rounded-3xl border-2 transition-all flex flex-col items-center text-center space-y-2 cursor-pointer shadow-xs ${
                        badge.unlocked
                          ? 'bg-white dark:bg-slate-800 border-amber-300 dark:border-slate-700 hover:scale-105 hover:shadow-md'
                          : 'bg-slate-50 dark:bg-slate-850 border-slate-200 dark:border-slate-800 opacity-60'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-slate-700 flex items-center justify-center text-2xl shadow-xs border border-amber-300 dark:border-slate-600">
                        {badge.icon}
                      </div>

                      <div>
                        <h4 className="font-black text-xs sm:text-sm text-slate-900 dark:text-slate-100 line-clamp-1">
                          {badge.name}
                        </h4>
                        <p className="text-[10px] font-bold text-slate-500 mt-0.5 line-clamp-2">
                          {badge.description}
                        </p>
                      </div>

                      <span className="text-[9px] font-black px-2 py-0.2 rounded-full bg-amber-200/80 text-amber-900 dark:bg-amber-950 dark:text-amber-200">
                        {badge.rarity || '稀有'} 🏅
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* TAB 5: 領域分佈 (Analytics & Category Distribution) */}
          {activeTab === 'analytics' && (
            <div className="space-y-6 animate-fadeIn">
              <div
                className={`p-5 rounded-3xl border-2 space-y-4 ${
                  darkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-amber-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BarChart2 className="w-5 h-5 text-amber-500" />
                    <h4 className="font-black text-base">繪本主題領域閱讀分佈</h4>
                  </div>
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                    累計已完讀 {completedBooksCount} 本繪本
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(categoryStats).map(([key, item]: [string, CategoryStatItem]) => {
                    const percent = item.totalInCatalog > 0 ? Math.round((item.count / item.totalInCatalog) * 100) : 0;
                    return (
                      <div
                        key={key}
                        className={`p-4 rounded-2xl border space-y-2 ${
                          darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-amber-50/60 border-amber-100'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{item.icon}</span>
                            <span className="font-black text-sm">{item.label}</span>
                          </div>
                          <span className="font-mono font-black text-xs text-amber-600 dark:text-amber-400">
                            {item.count} / {item.totalInCatalog} 本 ({percent}%)
                          </span>
                        </div>

                        <div className="w-full h-3 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                          <div
                            className={`h-full bg-gradient-to-r ${item.color} rounded-full transition-all duration-700`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: 成長里程碑天梯 (Milestones Pathway) */}
          {activeTab === 'milestones' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="space-y-3">
                {milestones.map((ms) => {
                  const isClaimed = claimedMilestones.includes(ms.id);
                  const isCompleted = ms.isUnlocked;
                  const progressPct = Math.min(100, Math.round((ms.current / ms.target) * 100));

                  return (
                    <div
                      key={ms.id}
                      className={`p-4 sm:p-5 rounded-3xl border-2 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                        isCompleted
                          ? darkMode
                            ? 'bg-slate-800/90 border-amber-500/50'
                            : 'bg-white border-amber-300 shadow-sm'
                          : darkMode
                          ? 'bg-slate-900/60 border-slate-800 opacity-80'
                          : 'bg-amber-50/60 border-amber-200'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-inner ${
                            isCompleted ? 'bg-amber-400 text-slate-950' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                          }`}
                        >
                          {ms.icon}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-extrabold text-sm sm:text-base">{ms.title}</h4>
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-400/40">
                              獎勵 +{ms.reward} ⭐
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">
                            {ms.description} ({ms.current} / {ms.target} {ms.unit})
                          </p>
                          <div className="w-48 sm:w-64 h-2 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="w-full sm:w-auto flex justify-end">
                        {isClaimed ? (
                          <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-black px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-400/40">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>已領取獎勵</span>
                          </div>
                        ) : isCompleted ? (
                          <button
                            type="button"
                            onClick={() => handleClaimMilestone(ms)}
                            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-slate-950 font-black text-xs shadow-md hover:scale-105 transition-all cursor-pointer flex items-center gap-1.5"
                          >
                            <Star className="w-4 h-4 fill-slate-950" />
                            <span>領取 +{ms.reward} 星星</span>
                          </button>
                        ) : (
                          <div className="text-xs font-bold text-slate-400 px-4 py-2 rounded-xl bg-black/5 dark:bg-white/5">
                            進行中 ({progressPct}%)
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 7: 小狀元專屬成就榮譽證書 (Kid Honor Certificate) */}
          {activeTab === 'certificate' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">
                  可隨時列印保存或匯出分享給家人與朋友！
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleReciteCertificate}
                    className="px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs flex items-center gap-1 hover:scale-105 transition-all cursor-pointer shadow-2xs"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>語音朗讀證書</span>
                  </button>
                  <button
                    type="button"
                    onClick={handlePrintCertificate}
                    className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-amber-300 dark:border-slate-700 text-xs font-black flex items-center gap-1 hover:scale-105 transition-all cursor-pointer shadow-2xs"
                  >
                    <Printer className="w-3.5 h-3.5 text-amber-500" />
                    <span>列印證書</span>
                  </button>
                </div>
              </div>

              {/* Certificate Canvas Card */}
              <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-amber-50 via-white to-amber-50 border-4 border-amber-400 text-amber-950 shadow-2xl relative space-y-6 text-center max-w-3xl mx-auto overflow-hidden">
                {/* Decorative border frame */}
                <div className="absolute inset-2 border-2 border-dashed border-amber-300 rounded-2xl pointer-events-none" />

                <div className="space-y-2 relative z-10">
                  <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-amber-200/80 border border-amber-400 text-amber-950 text-xs font-extrabold tracking-widest">
                    WORLD CHILDREN'S DIGITAL LIBRARY
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-amber-900 tracking-tight">
                    數位繪本閱讀小狀元榮譽證書
                  </h2>
                  <p className="text-xs text-amber-800/80 font-bold">
                    OFFICIAL READING EXCELLENCE & HONORS CERTIFICATE
                  </p>
                </div>

                <div className="space-y-4 relative z-10 max-w-xl mx-auto py-2">
                  <p className="text-base sm:text-lg font-bold">
                    茲證明優秀小讀者
                  </p>
                  <div className="text-2xl sm:text-3xl font-black text-orange-600 underline decoration-amber-400 underline-offset-8">
                    {profile.avatar} {profile.name} 同學
                  </div>
                  <p className="text-xs sm:text-sm font-medium leading-relaxed text-amber-900">
                    在世界童書數位圖書館中展現極佳的閱讀毅力與探索熱情，已累計完讀 <strong>{completedBooksCount}</strong> 本多語言故事，累積閱讀 <strong>{totalMinutes}</strong> 分鐘，獲頒 <strong>{getLevelTitle(currentLevel)}</strong> 榮譽稱號，特頒此狀以資表揚！
                  </p>
                </div>

                {/* Stats Footer on Certificate */}
                <div className="grid grid-cols-3 gap-2 border-t-2 border-b-2 border-amber-200/80 py-4 relative z-10">
                  <div>
                    <div className="text-xs text-amber-800 font-bold">累計完讀</div>
                    <div className="text-lg font-black text-amber-900 font-mono">{completedBooksCount} 本</div>
                  </div>
                  <div>
                    <div className="text-xs text-amber-800 font-bold">連續閱讀</div>
                    <div className="text-lg font-black text-orange-600 font-mono">{profile.streakDays || 1} 天</div>
                  </div>
                  <div>
                    <div className="text-xs text-amber-800 font-bold">童心星星</div>
                    <div className="text-lg font-black text-yellow-600 font-mono">{totalStars} ⭐</div>
                  </div>
                </div>

                {/* Signature & Seal */}
                <div className="flex items-center justify-between pt-4 relative z-10 text-xs font-bold text-amber-900/80">
                  <div>
                    <div>發證日期：{new Date().toLocaleDateString('zh-TW')}</div>
                    <div>證書編號：WCDL-{Date.now().toString().slice(-6)}</div>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-500 border-2 border-white shadow-md flex items-center justify-center text-2xl font-black text-slate-950">
                      🏅
                    </div>
                    <span className="text-[10px] font-black text-amber-900 mt-1">數位圖書館官方印鑑</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          className={`px-6 py-4 border-t flex items-center justify-between shrink-0 ${
            darkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-amber-100/80 border-amber-200'
          }`}
        >
          <div className="text-xs font-bold text-slate-400">
            持續閱讀探索，解鎖更多隱藏成就與榮譽徽章！
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-md cursor-pointer transition-transform hover:scale-105"
          >
            關閉總覽
          </button>
        </div>
      </div>
    </div>
  );
};
