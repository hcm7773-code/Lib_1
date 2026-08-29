import React, { useState, useMemo, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  X,
  Trophy,
  Award,
  Star,
  Flame,
  CheckCircle2,
  Sparkles,
  Lock,
  Crown,
  BookOpen,
  Bookmark,
  Wand2,
  Puzzle,
  Share2,
  Printer,
  ChevronRight,
  Shield,
  Smile,
  Volume2,
  Clock,
  Bell,
  BellRing,
  Calendar,
  Sparkle,
  Zap,
  Play,
  RotateCcw,
  Target,
  Gift,
  HelpCircle,
  TrendingUp,
  ArrowRight,
  Lightbulb,
} from 'lucide-react';
import { UserProfile, UserBadge, Book } from '../types';
import { playStarChime, playPageTurnSound, speakText } from '../utils/audio';
import { ReadingAchievementShareManager, ShareableAchievementItem } from './ReadingAchievementShareManager';

export type AchievementRarity = '普通' | '稀有' | '史詩' | '傳奇';

export interface TrophyItem {
  id: string;
  name: string;
  category: 'reading' | 'vocab' | 'creation' | 'puzzle' | 'streak';
  tier: 'bronze' | 'silver' | 'gold' | 'diamond';
  rarity: AchievementRarity;
  icon: string;
  description: string;
  condition: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  unlocked: boolean;
  unlockedAt?: string;
  rewardStars: number;
  remainingAdvice?: string;
}

export interface CharacterFigurine {
  id: string;
  name: string;
  bookTitle: string;
  avatar: string;
  quote: string;
  soundText: string;
  unlocked: boolean;
  color: string;
}

const CHARACTER_FIGURINES: CharacterFigurine[] = [
  {
    id: 'fig-prince',
    name: '小王子',
    bookTitle: '小王子與星空狐狸',
    avatar: '👑',
    quote: '「只有用心才能看清一切，實質的東西用眼睛是看不見的！」',
    soundText: '哈囉！我是小王子，謝謝你陪我一起看美麗的金色麥田！',
    unlocked: true,
    color: 'from-amber-400 to-yellow-500',
  },
  {
    id: 'fig-fox',
    name: '星空狐狸',
    bookTitle: '小王子與星空狐狸',
    avatar: '🦊',
    quote: '「如果你馴服了我，我們就彼此需要了。」',
    soundText: '哇！你今天也閱讀了好多故事呢，狐狸我最喜歡有學問的小探險家了！',
    unlocked: true,
    color: 'from-orange-400 to-amber-600',
  },
  {
    id: 'fig-pig',
    name: '綠建築小豬',
    bookTitle: '三隻小豬的環保綠建築',
    avatar: '🐷',
    quote: '「太陽能板與雨水回收，讓家溫暖又環保！」',
    soundText: '呼嚕嚕！我是綠建築小豬，我們的屋頂太陽能板發電超強喔！',
    unlocked: true,
    color: 'from-emerald-400 to-teal-600',
  },
  {
    id: 'fig-whale',
    name: '大翅鯨寶寶',
    bookTitle: '神奇海洋大冒險',
    avatar: '🐋',
    quote: '「一起潛入蔚藍的海洋深處，保護美麗的珊瑚礁！」',
    soundText: '嗚～！深海裡有發光的水母與古老的珊瑚，快跟我一起潛水吧！',
    unlocked: true,
    color: 'from-cyan-500 to-blue-600',
  },
  {
    id: 'fig-bear',
    name: '歡樂小熊',
    bookTitle: '森林小動物的音樂會',
    avatar: '🐻',
    quote: '「音樂讓森林充滿笑聲，每個人都是最好的演奏家！」',
    soundText: '咚咚咚！吹起小喇叭，今天也是元氣滿滿的閱讀好日子！',
    unlocked: true,
    color: 'from-rose-400 to-amber-500',
  },
];

// 3D Tilt interactive wrapper component
const TiltHoverCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}> = ({ children, className = '', onClick }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<React.CSSProperties>({
    transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
    transition: 'transform 0.3s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.3s ease',
  });
  const [glare, setGlare] = useState<{ x: number; y: number; opacity: number }>({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;

    setStyle({
      transform: `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.035, 1.035, 1.035) translateY(-4px)`,
      transition: 'transform 0.1s ease-out, box-shadow 0.2s ease',
    });

    setGlare({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 0.18,
    });
  };

  const handleMouseLeave = () => {
    setStyle({
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1) translateY(0px)',
      transition: 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.4s ease',
    });
    setGlare({ x: 50, y: 50, opacity: 0 });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={style}
      className={`relative transform-gpu overflow-hidden select-none cursor-pointer ${className}`}
    >
      {children}
      {/* 3D Glare highlight reflection overlay */}
      <div
        className="pointer-events-none absolute inset-0 rounded-3xl transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 60%)`,
          opacity: glare.opacity,
        }}
      />
    </div>
  );
};

interface AchievementShowcaseWallModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  books: Book[];
  userWordsCount: number;
  darkMode?: boolean;
  onSelectBook?: (book: Book, startPage?: number) => void;
  onAwardStar?: (stars: number) => void;
  onUpdateProfile?: (updated: UserProfile) => void;
}

export const AchievementShowcaseWallModal: React.FC<AchievementShowcaseWallModalProps> = ({
  isOpen,
  onClose,
  profile,
  books,
  userWordsCount,
  darkMode = false,
  onSelectBook,
  onAwardStar,
  onUpdateProfile,
}) => {
  const [activeTab, setActiveTab] = useState<'cabinet' | 'badges' | 'challenges' | 'reminders' | 'certificate' | 'figurines'>('cabinet');
  const [badgeFilter, setBadgeFilter] = useState<'all' | 'reading' | 'vocab' | 'creation' | 'puzzle'>('all');
  const [rarityFilter, setRarityFilter] = useState<'all' | AchievementRarity>('all');
  const [selectedBadge, setSelectedBadge] = useState<UserBadge | null>(null);
  const [activeFigurineQuote, setActiveFigurineQuote] = useState<string | null>(null);

  // Locked Achievement Sprint Guide Detail Modal
  const [lockedItemDetail, setLockedItemDetail] = useState<{
    id: string;
    name: string;
    icon: string;
    description: string;
    rarity: AchievementRarity;
    currentValue: number;
    targetValue: number;
    unit: string;
    remaining: number;
    remainingEstimate: string;
    advice: string;
    category: string;
    rewardStars: number;
  } | null>(null);

  // Celebration state for new/replayed achievements
  const [celebratingItem, setCelebratingItem] = useState<{
    title: string;
    icon: string;
    description: string;
    rarity: AchievementRarity;
    unlockedAt: string;
  } | null>(null);

  // Share Achievement Manager State
  const [isShareManagerOpen, setIsShareManagerOpen] = useState<boolean>(false);
  const [shareItem, setShareItem] = useState<ShareableAchievementItem | null>(null);

  const handleOpenShareManager = (item?: ShareableAchievementItem) => {
    if (item) {
      setShareItem(item);
    }
    setIsShareManagerOpen(true);
    playStarChime();
  };

  // Daily Reading Reminder State
  const [reminderTime, setReminderTime] = useState<string>(() => {
    return localStorage.getItem('wcdl_daily_reminder_time') || '20:00';
  });
  const [reminderEnabled, setReminderEnabled] = useState<boolean>(() => {
    return localStorage.getItem('wcdl_daily_reminder_enabled') !== 'false';
  });
  const [reminderSavedToast, setReminderSavedToast] = useState<boolean>(false);

  // Today's Learning Challenges State
  const [dailyChallenges, setDailyChallenges] = useState([
    {
      id: 'c-1',
      title: '🌟 晨光繪本精讀',
      desc: '探索世界經典繪本，今日累積共讀滿 15 分鐘',
      current: Math.min(15, profile.readingMinutes || 10),
      target: 15,
      unit: '分鐘',
      completed: (profile.readingMinutes || 10) >= 15,
      claimed: false,
      stars: 15,
      icon: '📖',
    },
    {
      id: 'c-2',
      title: '🔤 雙語生字智慧收集',
      desc: '在繪本生字庫中探索並發音複習 3 個重點詞彙',
      current: Math.min(3, userWordsCount || 2),
      target: 3,
      unit: '個詞彙',
      completed: (userWordsCount || 2) >= 3,
      claimed: false,
      stars: 10,
      icon: '⭐',
    },
    {
      id: 'c-3',
      title: '🦉 故事小博士互動隨堂測驗',
      desc: '回答 1 題繪本理解問答題，培養思辨表達力',
      current: 1,
      target: 1,
      unit: '題',
      completed: true,
      claimed: false,
      stars: 15,
      icon: '💡',
    },
    {
      id: 'c-4',
      title: '❤️ 親子共讀童心日記打卡',
      desc: '記錄今天閱讀的心情與一句心得感想',
      current: profile.moodJournal && profile.moodJournal.length > 0 ? 1 : 0,
      target: 1,
      unit: '篇日記',
      completed: !!(profile.moodJournal && profile.moodJournal.length > 0),
      claimed: false,
      stars: 10,
      icon: '📝',
    },
  ]);

  // Mini quiz popup state for today's challenge
  const [activeQuizQuestion, setActiveQuizQuestion] = useState<{
    question: string;
    options: string[];
    correct: number;
    explanation: string;
  } | null>(null);
  const [quizAnsweredIdx, setQuizAnsweredIdx] = useState<number | null>(null);
  const [quizIsCorrect, setQuizIsCorrect] = useState<boolean>(false);

  // Trigger rich celebration effect
  const triggerCelebration = (title: string, icon: string, desc: string, rarity: AchievementRarity = '史詩', unlockedAt: string = '') => {
    const formattedDate = unlockedAt || new Date().toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });

    setCelebratingItem({
      title,
      icon,
      description: desc,
      rarity,
      unlockedAt: formattedDate,
    });

    playStarChime();
    speakText(`恭喜解鎖${rarity}成就：${title}！太棒了！`, 'zh-TW', 1.0, 'cartoon');

    // Confetti cannons
    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.55 },
      colors: ['#f59e0b', '#ec4899', '#8b5cf6', '#10b981', '#3b82f6', '#fbbf24']
    });

    setTimeout(() => {
      confetti({
        particleCount: 60,
        angle: 60,
        spread: 60,
        origin: { x: 0.1, y: 0.6 },
        colors: ['#f59e0b', '#ec4899', '#fbbf24']
      });
      confetti({
        particleCount: 60,
        angle: 120,
        spread: 60,
        origin: { x: 0.9, y: 0.6 },
        colors: ['#8b5cf6', '#10b981', '#3b82f6']
      });
    }, 250);
  };

  // Compute Trophies Data
  const trophies = useMemo<TrophyItem[]>(() => {
    const readCount = profile.readBookIds?.length || 0;
    const minutes = profile.readingMinutes || 0;
    const words = userWordsCount || 0;
    const streak = profile.streakDays || 1;
    const customBooks = books.filter((b) => b.isCustom).length;

    return [
      {
        id: 't-1',
        name: '啟蒙探險家銅盃',
        category: 'reading',
        tier: 'bronze',
        rarity: '普通',
        icon: '🥉',
        description: '成功閱讀並完讀第一本世界經典數位繪本故事',
        condition: '讀完 1 本繪本',
        currentValue: readCount,
        targetValue: 1,
        unit: '本',
        unlocked: readCount >= 1,
        unlockedAt: '2026/08/10 14:30',
        rewardStars: 10,
        remainingAdvice: '挑選一本喜歡的繪本，從第 1 頁翻到最後一頁即可達成！',
      },
      {
        id: 't-2',
        name: '詞彙博學士銀盃',
        category: 'vocab',
        tier: 'silver',
        rarity: '稀有',
        icon: '🥈',
        description: '在生字本中收藏累積達 5 個重點雙語詞彙',
        condition: '收藏 5 個生字',
        currentValue: words,
        targetValue: 5,
        unit: '個生字',
        unlocked: words >= 5,
        unlockedAt: words >= 5 ? '2026/08/12 16:45' : undefined,
        rewardStars: 20,
        remainingAdvice: `在共讀繪本時，點擊醒目的生字標籤收藏到個人生字本即可！還差 ${Math.max(0, 5 - words)} 個生字。`,
      },
      {
        id: 't-3',
        name: '星際小小作家金盃',
        category: 'creation',
        tier: 'gold',
        rarity: '史詩',
        icon: '🥇',
        description: '使用 AI 繪本工坊創作並發布個人原創作品',
        condition: '創作 1 本繪本',
        currentValue: customBooks,
        targetValue: 1,
        unit: '本',
        unlocked: customBooks >= 1,
        unlockedAt: customBooks >= 1 ? '2026/08/15 19:20' : undefined,
        rewardStars: 30,
        remainingAdvice: '點擊頂部導航的「繪本創作工坊」，讓 AI 幫你繪製一本屬於你的原創繪本！',
      },
      {
        id: 't-4',
        name: '智力拼圖大師金盃',
        category: 'puzzle',
        tier: 'gold',
        rarity: '史詩',
        icon: '🧩',
        description: '完成互動式角色拼圖挑戰並成功復原經典插圖',
        condition: '完成拼圖挑戰',
        currentValue: profile.badges.some((b) => b.id.includes('puzzle')) ? 1 : 0,
        targetValue: 1,
        unit: '次拼圖',
        unlocked: profile.badges.some((b) => b.id.includes('puzzle')),
        unlockedAt: '2026/08/17 11:15',
        rewardStars: 25,
        remainingAdvice: '在繪本閱讀器中點擊拼圖挑戰，將小王子或大翅鯨的插畫碎片拼完整！',
      },
      {
        id: 't-5',
        name: '連讀傳奇鑽石盃',
        category: 'streak',
        tier: 'diamond',
        rarity: '傳奇',
        icon: '💎',
        description: '維持每日專注，連續閱讀累積達 5 天以上不中斷',
        condition: '連續閱讀 5 天',
        currentValue: streak,
        targetValue: 5,
        unit: '天',
        unlocked: streak >= 5,
        unlockedAt: streak >= 5 ? '2026/08/19 09:00' : undefined,
        rewardStars: 50,
        remainingAdvice: `每天保持閱讀 10 分鐘，累積連續 ${Math.max(0, 5 - streak)} 天打卡即可晉升為傳奇領航者！`,
      },
    ];
  }, [profile, books, userWordsCount]);

  // Reading Mastery Tier Calculation
  const masteryTier = useMemo(() => {
    const stars = profile.stars || 0;
    if (stars >= 300) {
      return {
        level: 4,
        title: '👑 璀璨星空領航者',
        subtitle: '宇宙級閱讀至尊大師',
        minStars: 300,
        nextStars: 500,
        progress: 100,
        badgeColor: 'from-amber-400 via-rose-500 to-purple-600',
        perks: '解鎖全館所有角色語音、尊爵金邊證書與鑽石專屬稱號！',
      };
    } else if (stars >= 150) {
      return {
        level: 3,
        title: '🦉 森林博學士',
        subtitle: '學識淵博的探索先鋒',
        minStars: 150,
        nextStars: 300,
        progress: Math.round(((stars - 150) / 150) * 100),
        badgeColor: 'from-purple-500 to-indigo-600',
        perks: '解鎖魔法精靈、小宇航員語音口吻與史詩成就徽印！',
      };
    } else if (stars >= 50) {
      return {
        level: 2,
        title: '🚀 奇幻小探險家',
        subtitle: '勇敢邁向故事新天地',
        minStars: 50,
        nextStars: 150,
        progress: Math.round(((stars - 50) / 100) * 100),
        badgeColor: 'from-blue-500 to-cyan-500',
        perks: '解鎖主題書架自訂權限與生字發音加速功能！',
      };
    } else {
      return {
        level: 1,
        title: '🌟 啟蒙小書蟲',
        subtitle: '初入奇妙繪本世界',
        minStars: 0,
        nextStars: 50,
        progress: Math.round((stars / 50) * 100),
        badgeColor: 'from-emerald-400 to-teal-500',
        perks: '開啟每日閱讀打卡與故事角色互動對話！',
      };
    }
  }, [profile.stars]);

  // Helper for badge rarity style
  const getRarityConfig = (rarity?: AchievementRarity) => {
    switch (rarity) {
      case '傳奇':
        return {
          label: '🌟 傳奇成就',
          stars: '⭐⭐⭐⭐',
          badgeClass: 'bg-gradient-to-r from-amber-400 via-yellow-300 to-orange-400 text-slate-950 border-amber-300 shadow-amber-400/50 shadow-sm font-black',
          borderClass: 'border-amber-400 ring-2 ring-amber-400/30',
          glowClass: 'shadow-amber-500/20 shadow-lg',
        };
      case '史詩':
        return {
          label: '💎 史詩成就',
          stars: '⭐⭐⭐',
          badgeClass: 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white border-purple-300 font-black',
          borderClass: 'border-purple-400 ring-2 ring-purple-400/20',
          glowClass: 'shadow-purple-500/20 shadow-md',
        };
      case '稀有':
        return {
          label: '⚡ 稀有成就',
          stars: '⭐⭐',
          badgeClass: 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-blue-300 font-bold',
          borderClass: 'border-blue-400',
          glowClass: 'shadow-blue-500/10 shadow-md',
        };
      case '普通':
      default:
        return {
          label: '🌿 普通成就',
          stars: '⭐',
          badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 font-bold',
          borderClass: 'border-emerald-300 dark:border-emerald-700',
          glowClass: '',
        };
    }
  };

  // Filtered badges list with exact unlock timestamps and rarities
  const filteredBadges = useMemo(() => {
    const list = profile.badges || [];
    return list.filter((b) => {
      // Category filter
      if (badgeFilter === 'reading' && b.category !== 'reading' && b.category) return false;
      if (badgeFilter === 'vocab' && b.category !== 'vocab') return false;
      if (badgeFilter === 'creation' && b.category !== 'ai') return false;
      if (badgeFilter === 'puzzle' && !b.id.includes('puzzle')) return false;

      // Rarity filter
      if (rarityFilter !== 'all' && (b.rarity || '普通') !== rarityFilter) return false;

      return true;
    });
  }, [profile.badges, badgeFilter, rarityFilter]);

  // Handle clicking a locked badge to show progress sprint modal
  const handleOpenLockedBadgeGuide = (badge: UserBadge) => {
    let target = 5;
    let current = 0;
    let unit = '項目標';
    let advice = '持續探索與閱讀即可解鎖此成就！';

    if (badge.category === 'reading') {
      target = 3;
      current = profile.readBookIds?.length || 0;
      unit = '本繪本';
      const rem = Math.max(0, target - current);
      advice = `距離目標還差 ${rem} 本繪本（約需閱讀 15~20 分鐘）。快挑選一本喜歡的故事進行共讀吧！`;
    } else if (badge.category === 'vocab') {
      target = 10;
      current = userWordsCount || 0;
      unit = '個生字';
      const rem = Math.max(0, target - current);
      advice = `距離目標還差 ${rem} 個生字收藏。在閱讀時多點擊生字卡片並朗讀，即可快速達成！`;
    } else if (badge.id.includes('puzzle')) {
      target = 3;
      current = 1;
      unit = '次拼圖挑戰';
      advice = '在各繪本結尾點擊「拼圖挑戰」，將故事名場面拼圖復原即可獲得此殊榮！';
    } else {
      target = 5;
      current = profile.streakDays || 1;
      unit = '天連續閱讀';
      const rem = Math.max(0, target - current);
      advice = `每天只要閱讀 10 分鐘，連續維持 ${rem} 天打卡即可圓滿解鎖！`;
    }

    const remaining = Math.max(0, target - current);

    setLockedItemDetail({
      id: badge.id,
      name: badge.name,
      icon: badge.icon,
      description: badge.description,
      rarity: (badge.rarity as AchievementRarity) || '稀有',
      currentValue: current,
      targetValue: target,
      unit,
      remaining,
      remainingEstimate: `還差 ${remaining} ${unit}`,
      advice,
      category: badge.category || 'reading',
      rewardStars: 20,
    });

    playPageTurnSound();
  };

  // Handle claim daily challenge reward
  const handleClaimChallengeReward = (challengeId: string, stars: number) => {
    setDailyChallenges((prev) =>
      prev.map((c) => (c.id === challengeId ? { ...c, claimed: true } : c))
    );

    if (onAwardStar) {
      onAwardStar(stars);
    } else if (onUpdateProfile) {
      onUpdateProfile({
        ...profile,
        stars: (profile.stars || 0) + stars,
      });
    }

    playStarChime();
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#f59e0b', '#fbbf24', '#10b981'],
    });
    speakText(`領取挑戰獎勵成功！獲得 ${stars} 顆故事星章！繼續加油！`, 'zh-TW', 1.0, 'cartoon');
  };

  const handlePlayFigurine = (fig: CharacterFigurine) => {
    setActiveFigurineQuote(fig.quote);
    playStarChime();
    speakText(fig.soundText, 'zh-TW', 1.0, 'cartoon');
  };

  const handlePrintCertificate = () => {
    window.print();
  };

  const handleSaveReminder = () => {
    try {
      localStorage.setItem('wcdl_daily_reminder_time', reminderTime);
      localStorage.setItem('wcdl_daily_reminder_enabled', String(reminderEnabled));
      setReminderSavedToast(true);
      playStarChime();
      speakText(`已設定每日 ${reminderTime} 閱讀提醒！持續閱讀，累積大智慧！`, 'zh-TW', 1.0, 'cartoon');
      setTimeout(() => setReminderSavedToast(false), 3000);
    } catch {}
  };

  const handleTestReminderSpeech = () => {
    playStarChime();
    speakText(`嗨！親愛的${profile.name}，現在是 ${reminderTime} 故事時光！今天的小目標是閱讀 15 分鐘，快打開繪本探索吧！`, 'zh-TW', 1.0, 'cartoon');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div
        className={`relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden transition-all ${
          darkMode
            ? 'bg-slate-900 border-slate-700 text-slate-100'
            : 'bg-gradient-to-b from-amber-50 via-white to-orange-50/70 border-amber-300 text-slate-900'
        }`}
      >
        {/* Top Header */}
        <div className="px-6 py-5 border-b border-amber-200 dark:border-slate-800 flex items-center justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 via-orange-400 to-yellow-300 p-1 shadow-md flex items-center justify-center text-slate-950 text-2xl animate-pulse">
              🏆
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black">
                  🏛️ 個人讀書成就榮譽展示牆
                </h2>
                <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 shadow-2xs">
                  {profile.name} 的光榮殿堂
                </span>
              </div>
              <p className="text-xs font-semibold text-amber-900/70 dark:text-slate-400 mt-0.5">
                見證每一次閱讀累積的足跡、3D 浮動徽章、解鎖進度衝刺指南與今日挑戰！
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleOpenShareManager()}
              className="px-3.5 py-2 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs shadow-md hover:scale-105 transition-all flex items-center gap-1.5 cursor-pointer ring-2 ring-amber-400/40"
              title="將榮譽徽章與里程碑卡片生成為高畫質 PNG 與童趣文案"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>📸 分享成就卡片</span>
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

        {/* Top Navigation Tabs */}
        <div className="px-6 py-3 border-b border-amber-200/60 dark:border-slate-800 bg-amber-100/40 dark:bg-slate-800/40 flex items-center gap-2 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('cabinet')}
            className={`px-4 py-2 rounded-2xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'cabinet'
                ? 'bg-amber-500 text-slate-950 shadow-sm scale-105'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-amber-200 dark:border-slate-700 hover:bg-amber-100'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>光榮獎盃櫃</span>
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
            <span>成就徽章牆 ({profile.badges.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('challenges')}
            className={`px-4 py-2 rounded-2xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'challenges'
                ? 'bg-amber-500 text-slate-950 shadow-sm scale-105 ring-2 ring-amber-400'
                : 'bg-gradient-to-r from-amber-200 to-orange-200 dark:from-slate-800 dark:to-slate-700 text-slate-900 dark:text-amber-300 border border-amber-300 dark:border-slate-600 hover:scale-102'
            }`}
          >
            <Zap className="w-4 h-4 text-amber-600 dark:text-amber-400 fill-amber-500 animate-bounce" />
            <span>今日學習挑戰 🎯</span>
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
            <BellRing className="w-4 h-4 text-amber-600 dark:text-amber-300" />
            <span>每日目標提醒</span>
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
            <span>官方榮譽證書</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('figurines')}
            className={`px-4 py-2 rounded-2xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'figurines'
                ? 'bg-amber-500 text-slate-950 shadow-sm scale-105'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-amber-200 dark:border-slate-700 hover:bg-amber-100'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>繪本立體公仔</span>
          </button>
        </div>

        {/* Tab 1: 光榮獎盃櫃 (Trophy Cabinet & Mastery Rank with 3D Tilt) */}
        {activeTab === 'cabinet' && (
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
            
            {/* Mastery Ranking Level Banner */}
            <div className={`p-5 rounded-3xl bg-gradient-to-r ${masteryTier.badgeColor} text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 relative overflow-hidden`}>
              <div className="flex items-center gap-4 z-10">
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-4xl shadow-inner border border-white/40 animate-pulse">
                  {profile.avatar}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-black">{masteryTier.title}</span>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-white/30 backdrop-blur-xs">
                      段位 Lv.{masteryTier.level}
                    </span>
                  </div>
                  <p className="text-xs font-semibold opacity-90 mt-0.5">
                    {masteryTier.subtitle} • 目前已累積 {profile.stars} 顆魔法星章 ⭐
                  </p>
                  <p className="text-[11px] font-medium text-amber-200 mt-1">
                    ✨ 特權：{masteryTier.perks}
                  </p>
                </div>
              </div>

              {/* Progress bar towards next tier */}
              <div className="w-full sm:w-48 z-10 space-y-1.5 text-right">
                <div className="text-[11px] font-bold">
                  升級進度：{masteryTier.progress}%
                </div>
                <div className="w-full h-3 bg-black/30 rounded-full overflow-hidden p-0.5 border border-white/30">
                  <div
                    className="h-full bg-yellow-300 rounded-full transition-all duration-700"
                    style={{ width: `${masteryTier.progress}%` }}
                  />
                </div>
                <div className="text-[10px] opacity-80">
                  目標：{masteryTier.nextStars} 顆星
                </div>
              </div>
            </div>

            {/* 3D-like Trophy Cabinet Grid */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-sm text-amber-950 dark:text-amber-300 flex items-center gap-1.5">
                  <Trophy className="w-4 h-4 text-amber-500" />
                  光榮獎盃陳列架 (3D 浮動卡片，點擊未解鎖查看衝刺指南)：
                </h3>
                <span className="text-xs font-bold text-slate-500">
                  已解鎖 {trophies.filter((t) => t.unlocked).length} / {trophies.length} 座獎盃
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {trophies.map((trophy) => {
                  const progressPct = Math.min(100, Math.round((trophy.currentValue / trophy.targetValue) * 100));
                  const rConfig = getRarityConfig(trophy.rarity);
                  const rem = Math.max(0, trophy.targetValue - trophy.currentValue);

                  return (
                    <TiltHoverCard
                      key={trophy.id}
                      onClick={() => {
                        if (trophy.unlocked) {
                          triggerCelebration(trophy.name, trophy.icon, trophy.description, trophy.rarity, trophy.unlockedAt);
                        } else {
                          setLockedItemDetail({
                            id: trophy.id,
                            name: trophy.name,
                            icon: trophy.icon,
                            description: trophy.description,
                            rarity: trophy.rarity,
                            currentValue: trophy.currentValue,
                            targetValue: trophy.targetValue,
                            unit: trophy.unit,
                            remaining: rem,
                            remainingEstimate: `還差 ${rem} ${trophy.unit}`,
                            advice: trophy.remainingAdvice || '努力共讀與創作即可解鎖！',
                            category: trophy.category,
                            rewardStars: trophy.rewardStars,
                          });
                          playPageTurnSound();
                        }
                      }}
                      className={`p-4 rounded-3xl border-2 flex flex-col justify-between space-y-3 shadow-xs relative ${
                        trophy.unlocked
                          ? `bg-white dark:bg-slate-800 ${rConfig.borderClass} ${rConfig.glowClass}`
                          : 'bg-slate-50/80 dark:bg-slate-850/60 border-slate-200 dark:border-slate-800 hover:border-amber-400'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-md border transition-transform duration-300 group-hover:scale-110 ${
                          trophy.unlocked
                            ? 'bg-gradient-to-tr from-amber-200 to-yellow-100 border-amber-400 animate-pulse'
                            : 'bg-slate-200 dark:bg-slate-700 border-slate-300'
                        }`}>
                          {trophy.unlocked ? trophy.icon : '🔒'}
                        </div>

                        <div className="flex flex-col items-end gap-1">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border ${rConfig.badgeClass}`}>
                            {rConfig.label}
                          </span>
                          {trophy.unlocked && trophy.unlockedAt ? (
                            <span className="text-[9px] font-bold text-slate-400 flex items-center gap-0.5">
                              <Clock className="w-2.5 h-2.5" />
                              {trophy.unlockedAt}
                            </span>
                          ) : (
                            <span className="text-[9px] font-black text-amber-600 dark:text-amber-400 flex items-center gap-0.5 bg-amber-100 dark:bg-amber-950/60 px-1.5 py-0.5 rounded-md">
                              <Target className="w-2.5 h-2.5" />
                              差 {rem} {trophy.unit}
                            </span>
                          )}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center gap-1">
                          <h4 className="font-black text-sm text-slate-900 dark:text-slate-100">
                            {trophy.name}
                          </h4>
                          <span className="text-[10px]">{rConfig.stars}</span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1 line-clamp-2">
                          {trophy.description}
                        </p>
                      </div>

                      {/* Action & Progress */}
                      <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-700">
                        <div className="flex justify-between text-[11px] font-bold">
                          <span className="text-slate-500">
                            {trophy.unlocked ? '目標進度：' : '剩餘距離：'}
                          </span>
                          <span className={trophy.unlocked ? 'text-emerald-600 font-black' : 'text-amber-600 dark:text-amber-400 font-black'}>
                            {trophy.currentValue} / {trophy.targetValue} {trophy.unit} ({progressPct}%)
                          </span>
                        </div>

                        <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden p-0.5">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              trophy.unlocked ? 'bg-gradient-to-r from-amber-400 to-yellow-500' : 'bg-gradient-to-r from-slate-400 to-amber-500'
                            }`}
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>

                        {trophy.unlocked ? (
                          <div className="flex items-center gap-1.5 w-full">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                triggerCelebration(trophy.name, trophy.icon, trophy.description, trophy.rarity, trophy.unlockedAt);
                              }}
                              className="flex-1 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 dark:bg-slate-700 text-amber-900 dark:text-amber-200 text-xs font-black flex items-center justify-center gap-1 transition-transform hover:scale-102 cursor-pointer"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                              <span>慶祝 🎉</span>
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenShareManager({
                                  id: trophy.id,
                                  title: trophy.name,
                                  icon: trophy.icon,
                                  description: trophy.description,
                                  rarity: trophy.rarity,
                                  type: 'trophy',
                                  unlockedAt: trophy.unlockedAt || '已解鎖',
                                  statsLabel: '達成進度',
                                  statsValue: `${trophy.currentValue} ${trophy.unit}`,
                                });
                              }}
                              className="py-1.5 px-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-300 text-slate-950 text-xs font-black flex items-center justify-center gap-1 shadow-2xs hover:scale-105 transition-all cursor-pointer"
                              title="生成可分享的 PNG 成就卡片"
                            >
                              <Share2 className="w-3 h-3" />
                              <span>分享</span>
                            </button>
                          </div>
                        ) : (
                          <div className="w-full py-1.5 rounded-xl bg-amber-500/10 dark:bg-slate-800 text-amber-800 dark:text-amber-300 text-[11px] font-black flex items-center justify-center gap-1">
                            <Lightbulb className="w-3 h-3 text-amber-500" />
                            <span>點擊查看解鎖衝刺攻略 ➔</span>
                          </div>
                        )}
                      </div>
                    </TiltHoverCard>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: 成就徽章牆 (3D Interactive Badges Showcase Wall) */}
        {activeTab === 'badges' && (
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
            
            {/* Filter Chips (Category + Rarity) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Category Filter */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {[
                  { id: 'all', label: '全部類型' },
                  { id: 'reading', label: '📖 閱讀探索' },
                  { id: 'vocab', label: '🔤 生字大師' },
                  { id: 'creation', label: '🎨 AI 創作' },
                  { id: 'puzzle', label: '🧩 智力拼圖' },
                ].map((filter) => (
                  <button
                    key={filter.id}
                    type="button"
                    onClick={() => setBadgeFilter(filter.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      badgeFilter === filter.id
                        ? 'bg-amber-500 text-slate-950 shadow-2xs scale-105'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-amber-200 dark:border-slate-700 hover:bg-amber-100'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>

              {/* Rarity Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-400">稀有度：</span>
                {(['all', '傳奇', '史詩', '稀有', '普通'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRarityFilter(r)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-black transition-all cursor-pointer ${
                      rarityFilter === r
                        ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-slate-950 shadow-2xs scale-105'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    {r === 'all' ? '全部' : r}
                  </button>
                ))}
              </div>
            </div>

            {/* Badges Grid with 3D Float Hover */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 pt-2">
              {filteredBadges.map((badge) => {
                const rConfig = getRarityConfig(badge.rarity as AchievementRarity);
                const unlockTimeFormatted = badge.unlockedAt ? `${badge.unlockedAt} 10:20` : '尚未解鎖';

                return (
                  <TiltHoverCard
                    key={badge.id}
                    onClick={() => {
                      if (badge.unlocked) {
                        setSelectedBadge(badge);
                        triggerCelebration(badge.name, badge.icon, badge.description, (badge.rarity as AchievementRarity) || '稀有', unlockTimeFormatted);
                      } else {
                        handleOpenLockedBadgeGuide(badge);
                      }
                    }}
                    className={`p-4 rounded-3xl border-2 flex flex-col justify-between space-y-3 ${
                      badge.unlocked
                        ? `bg-white dark:bg-slate-800 ${rConfig.borderClass} ${rConfig.glowClass}`
                        : 'bg-slate-50/80 dark:bg-slate-850/60 border-slate-200 dark:border-slate-800 hover:border-amber-400'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-xs border transition-transform duration-300 ${
                        badge.unlocked
                          ? 'bg-amber-100 dark:bg-slate-700 border-amber-300 dark:border-slate-600 animate-pulse'
                          : 'bg-slate-200 dark:bg-slate-700 border-slate-300 text-slate-400'
                      }`}>
                        {badge.unlocked ? badge.icon : '🔒'}
                      </div>
                      <span className={`text-[9px] px-2 py-0.5 rounded-full border ${rConfig.badgeClass}`}>
                        {rConfig.label}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-black text-sm text-slate-900 dark:text-slate-100 line-clamp-1">
                        {badge.name}
                      </h4>
                      <p className="text-[11px] font-medium text-slate-500 mt-1 line-clamp-2">
                        {badge.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-[10px]">
                      {badge.unlocked ? (
                        <div className="flex items-center justify-between w-full">
                          <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>{badge.unlockedAt || '已達成'}</span>
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenShareManager({
                                id: badge.id,
                                title: badge.name,
                                icon: badge.icon,
                                description: badge.description,
                                rarity: (badge.rarity as AchievementRarity) || '稀有',
                                type: 'badge',
                                unlockedAt: badge.unlockedAt || '已解鎖',
                                statsLabel: '成就段位',
                                statsValue: `${badge.rarity || '珍稀'}徽章`,
                              });
                            }}
                            className="px-2 py-0.5 rounded-lg bg-amber-100 hover:bg-amber-200 dark:bg-slate-700 text-amber-900 dark:text-amber-200 font-bold flex items-center gap-1 hover:scale-105 transition-all cursor-pointer"
                            title="生成分享卡片"
                          >
                            <Share2 className="w-2.5 h-2.5" />
                            <span>卡片</span>
                          </button>
                        </div>
                      ) : (
                        <span className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                          <Target className="w-3 h-3 text-amber-500" />
                          <span>點擊看剩餘進度 ➔</span>
                        </span>
                      )}
                      {!badge.unlocked && <span className="font-mono text-amber-500">{rConfig.stars}</span>}
                    </div>
                  </TiltHoverCard>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 3: 今日學習挑戰專區 (Today's Learning Challenge Tab) */}
        {activeTab === 'challenges' && (
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 animate-fadeIn">
            
            {/* Header Banner */}
            <div className={`p-5 rounded-3xl border-2 flex flex-col sm:flex-row items-center justify-between gap-4 ${
              darkMode
                ? 'bg-gradient-to-r from-amber-950/50 via-slate-900 to-amber-900/40 border-amber-500/40'
                : 'bg-gradient-to-r from-amber-100 via-orange-50 to-yellow-100 border-amber-300'
            }`}>
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 text-slate-950 flex items-center justify-center text-3xl shadow-md animate-bounce">
                  🎯
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-base sm:text-lg">
                      今日學習小挑戰與星章衝刺
                    </h3>
                    <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 shadow-2xs">
                      每日 4 大任務
                    </span>
                  </div>
                  <p className="text-xs text-amber-900/80 dark:text-slate-300 mt-0.5">
                    完成每日挑戰即可領取豐富星章，加速解鎖全館榮譽獎盃與珍稀徽章！
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-500">今日完成率</div>
                  <div className="text-lg font-black text-amber-600 dark:text-amber-400">
                    {dailyChallenges.filter((c) => c.completed).length} / {dailyChallenges.length}
                  </div>
                </div>
              </div>
            </div>

            {/* Daily Challenges List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {dailyChallenges.map((item) => {
                return (
                  <div
                    key={item.id}
                    className={`p-4 rounded-3xl border-2 transition-all flex flex-col justify-between space-y-3 ${
                      item.completed
                        ? item.claimed
                          ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800 opacity-90'
                          : 'bg-white dark:bg-slate-800 border-amber-400 shadow-md ring-2 ring-amber-400/20'
                        : 'bg-slate-50/80 dark:bg-slate-850/60 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-slate-700 flex items-center justify-center text-xl shadow-2xs">
                          {item.icon}
                        </div>
                        <div>
                          <h4 className="font-black text-sm text-slate-900 dark:text-slate-100">
                            {item.title}
                          </h4>
                          <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
                            獎勵 +{item.stars}⭐ 星章
                          </span>
                        </div>
                      </div>

                      {item.completed ? (
                        <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>已達成</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                          進行中
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                      {item.desc}
                    </p>

                    {/* Progress Bar & Action */}
                    <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-700">
                      <div className="flex justify-between text-[11px] font-bold">
                        <span className="text-slate-500">進度：</span>
                        <span className="text-amber-600 dark:text-amber-400 font-black">
                          {item.current} / {item.target} {item.unit}
                        </span>
                      </div>

                      <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden p-0.5">
                        <div
                          className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, Math.round((item.current / item.target) * 100))}%` }}
                        />
                      </div>

                      {item.completed ? (
                        item.claimed ? (
                          <div className="w-full py-2 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-black flex items-center justify-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>已成功領取獎勵</span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleClaimChallengeReward(item.id, item.stars)}
                            className="w-full py-2 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-400 text-slate-950 text-xs font-black shadow-md hover:scale-102 transition-transform flex items-center justify-center gap-1.5 cursor-pointer animate-bounce"
                          >
                            <Gift className="w-4 h-4" />
                            <span>領取 +{item.stars}⭐ 獎勵！</span>
                          </button>
                        )
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            if (books.length > 0 && onSelectBook) {
                              onSelectBook(books[0]);
                              onClose();
                            }
                          }}
                          className="w-full py-2 rounded-2xl bg-amber-100 hover:bg-amber-200 dark:bg-slate-700 text-amber-950 dark:text-amber-200 text-xs font-black flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5 fill-amber-700" />
                          <span>立即前往完成挑戰 ➔</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 4: 每日閱讀目標提醒 (Daily Reading Goal Reminder) */}
        {activeTab === 'reminders' && (
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 animate-fadeIn">
            
            {/* Daily Goal Status Card */}
            <div className={`p-6 rounded-3xl border-2 space-y-4 ${
              darkMode
                ? 'bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 border-amber-500/50'
                : 'bg-gradient-to-r from-amber-100/80 via-orange-50 to-amber-100/80 border-amber-300'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center text-2xl shadow-md">
                    🎯
                  </div>
                  <div>
                    <h3 className="font-black text-base sm:text-lg">
                      今日閱讀目標進度提醒
                    </h3>
                    <p className="text-xs text-amber-900/80 dark:text-slate-400">
                      每天持續閱讀 15 分鐘，培育終身閱讀好習慣！
                    </p>
                  </div>
                </div>

                <span className="text-xs font-black px-3 py-1 rounded-full bg-amber-400 text-slate-950 shadow-2xs">
                  連續閱讀 {profile.streakDays || 1} 天 🔥
                </span>
              </div>

              {/* Progress metric */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span>今日已閱讀：<strong className="text-amber-600 dark:text-amber-400 font-mono text-sm">{profile.readingMinutes}</strong> 分鐘</span>
                  <span>目標：<strong className="font-mono text-sm">{profile.dailyGoalMinutes || 15}</strong> 分鐘</span>
                </div>
                <div className="w-full h-3.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden p-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-700"
                    style={{ width: `${Math.min(100, Math.round((profile.readingMinutes / (profile.dailyGoalMinutes || 15)) * 100))}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Smart Reminder Schedule Settings */}
            <div className={`p-6 rounded-3xl border-2 space-y-5 ${
              darkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-amber-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-amber-500" />
                  <h4 className="font-black text-base">設定每日溫馨閱讀提醒鬧鐘</h4>
                </div>

                {/* Enable toggle */}
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={reminderEnabled}
                    onChange={(e) => setReminderEnabled(e.target.checked)}
                    className="w-4 h-4 text-amber-500 accent-amber-500 rounded cursor-pointer"
                  />
                  <span className="text-xs font-black">開啟每日提醒</span>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { time: '08:00', title: '🌅 晨讀啟蒙', desc: '早餐後的元氣雙語閱讀' },
                  { time: '16:30', title: '🎒 放學探險', desc: '完成課業後的繪本時光' },
                  { time: '20:00', title: '🌙 睡前晚安故事', desc: '溫馨聽讀助眠繪本' },
                ].map((item) => (
                  <button
                    key={item.time}
                    type="button"
                    onClick={() => setReminderTime(item.time)}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      reminderTime === item.time
                        ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-sm scale-102 font-black'
                        : darkMode
                        ? 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
                        : 'bg-amber-50/70 border-amber-200 text-slate-800 hover:bg-amber-100'
                    }`}
                  >
                    <div className="font-mono text-base font-black">{item.time}</div>
                    <div className="text-xs font-bold mt-0.5">{item.title}</div>
                    <div className="text-[10px] opacity-80 mt-0.5">{item.desc}</div>
                  </button>
                ))}
              </div>

              {/* Custom time input & Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="text-xs font-bold text-slate-400">自訂時間：</span>
                  <input
                    type="time"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold ${
                      darkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-amber-300 text-slate-900'
                    }`}
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={handleTestReminderSpeech}
                    className="px-3 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 dark:bg-slate-700 text-amber-900 dark:text-amber-200 text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>試聽語音叮嚀</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveReminder}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-md transition-transform hover:scale-105 cursor-pointer"
                  >
                    儲存提醒設定
                  </button>
                </div>
              </div>

              {reminderSavedToast && (
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-400/40 text-emerald-600 dark:text-emerald-300 text-xs font-black flex items-center gap-2 animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>已成功儲存每日閱讀目標提醒設定！系統將定時溫馨提示小讀者！</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 5: 官方榮譽證書 (Certificate of Reading Honor) */}
        {activeTab === 'certificate' && (
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 flex flex-col items-center justify-center">
            
            {/* The Certificate Paper */}
            <div
              id="printable-reading-certificate"
              className="w-full max-w-2xl bg-gradient-to-b from-amber-50 via-white to-amber-50 p-6 sm:p-10 rounded-3xl border-8 border-amber-400 shadow-2xl relative text-slate-900 space-y-4 text-center"
            >
              {/* Corner Ornaments */}
              <div className="absolute top-2 left-2 text-2xl">⚜️</div>
              <div className="absolute top-2 right-2 text-2xl">⚜️</div>
              <div className="absolute bottom-2 left-2 text-2xl">⚜️</div>
              <div className="absolute bottom-2 right-2 text-2xl">⚜️</div>

              <div className="space-y-1">
                <span className="text-xs font-black tracking-widest text-amber-800 uppercase">
                  WORLD CHILDREN'S DIGITAL LIBRARY
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-amber-950 tracking-tight">
                  📜 世界童書數位圖書館・榮譽閱讀證書
                </h2>
                <div className="w-32 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto mt-2" />
              </div>

              <p className="text-xs sm:text-sm font-semibold text-slate-700 leading-relaxed max-w-lg mx-auto">
                茲證明小小故事探險家 <span className="text-lg font-black text-amber-700 underline decoration-amber-400 decoration-2 px-1">{profile.name}</span> 在繪本世界中展現了卓越的好奇心與專注力：
              </p>

              {/* Stats highlights */}
              <div className="grid grid-cols-3 gap-2 max-w-md mx-auto py-2">
                <div className="p-2.5 rounded-2xl bg-amber-100/70 border border-amber-300">
                  <div className="text-lg font-black text-amber-700">{profile.readingMinutes}m</div>
                  <div className="text-[10px] font-bold text-slate-600">專注閱讀時長</div>
                </div>

                <div className="p-2.5 rounded-2xl bg-amber-100/70 border border-amber-300">
                  <div className="text-lg font-black text-amber-700">{profile.stars}⭐</div>
                  <div className="text-[10px] font-bold text-slate-600">榮獲故事星章</div>
                </div>

                <div className="p-2.5 rounded-2xl bg-amber-100/70 border border-amber-300">
                  <div className="text-lg font-black text-amber-700">{profile.streakDays || 1}天</div>
                  <div className="text-[10px] font-bold text-slate-600">連續閱讀紀錄</div>
                </div>
              </div>

              <p className="text-xs italic font-medium text-slate-600">
                特頒發此證，以茲鼓勵持續探索世界、愛好閱讀！
              </p>

              {/* Signature and Seal */}
              <div className="flex items-center justify-between pt-4 border-t border-amber-300/80 px-4 text-left">
                <div>
                  <div className="text-[11px] font-bold text-slate-500">頒發日期：</div>
                  <div className="text-xs font-black text-slate-800">{new Date().toLocaleDateString('zh-TW')}</div>
                </div>

                {/* Golden Official Stamp */}
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 border-2 border-amber-600 shadow-md flex flex-col items-center justify-center text-slate-950 font-black text-[9px] leading-tight rotate-12">
                  <span>官方認證</span>
                  <span>⭐ 榮譽 ⭐</span>
                  <span>圖書館</span>
                </div>
              </div>
            </div>

            {/* Print & Share buttons */}
            <div className="flex items-center gap-2.5 pt-2 flex-wrap justify-center">
              <button
                type="button"
                onClick={() => {
                  handleOpenShareManager({
                    id: 'cert-official',
                    title: '📜 官方榮譽閱讀證書',
                    icon: '👑',
                    description: `恭喜小小故事探險家 ${profile.name} 展現卓越好奇心與專注力！`,
                    rarity: '傳奇',
                    type: 'milestone',
                    unlockedAt: new Date().toLocaleDateString('zh-TW'),
                    statsLabel: '閱讀時長',
                    statsValue: `${profile.readingMinutes} 分鐘`,
                  });
                }}
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-400 hover:from-amber-400 text-slate-950 font-black text-xs sm:text-sm shadow-md hover:scale-105 transition-all flex items-center gap-2 cursor-pointer ring-2 ring-amber-400/40"
              >
                <Share2 className="w-4 h-4" />
                <span>📸 生成榮譽證書分享卡</span>
              </button>

              <button
                type="button"
                onClick={handlePrintCertificate}
                className="px-5 py-2.5 rounded-2xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-amber-300 dark:border-slate-700 font-black text-xs sm:text-sm shadow-sm hover:scale-105 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4 text-amber-600" />
                <span>列印榮譽證書</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 6: 繪本立體公仔 (Interactive Character Figurines) */}
        {activeTab === 'figurines' && (
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-black text-sm text-amber-950 dark:text-amber-300">
                  🧸 繪本主角互動立體玩偶展台
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  點擊任意公仔即可聆聽主角的專屬打氣語音與名言語錄！
                </p>
              </div>
            </div>

            {/* Active quote bubble */}
            {activeFigurineQuote && (
              <div className="p-4 rounded-3xl bg-amber-100 dark:bg-amber-950/70 border-2 border-amber-300 dark:border-amber-700 flex items-center gap-3 animate-fadeIn">
                <div className="text-2xl animate-bounce">💬</div>
                <div className="text-xs sm:text-sm font-bold text-amber-950 dark:text-amber-200">
                  {activeFigurineQuote}
                </div>
              </div>
            )}

            {/* Figurines Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 pt-2">
              {CHARACTER_FIGURINES.map((fig) => (
                <div
                  key={fig.id}
                  onClick={() => handlePlayFigurine(fig)}
                  className={`p-4 rounded-3xl border-2 transition-all flex flex-col items-center text-center space-y-2 cursor-pointer shadow-xs hover:scale-105 ${
                    fig.unlocked
                      ? 'bg-white dark:bg-slate-800 border-amber-300 dark:border-slate-700 hover:shadow-md'
                      : 'bg-slate-50 dark:bg-slate-850 opacity-60'
                  }`}
                >
                  <div className={`w-16 h-16 rounded-3xl bg-gradient-to-tr ${fig.color} flex items-center justify-center text-3xl shadow-md border-2 border-white dark:border-slate-700`}>
                    {fig.avatar}
                  </div>

                  <div>
                    <h4 className="font-black text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                      {fig.name}
                    </h4>
                    <p className="text-[10px] text-slate-500 font-bold mt-0.5 line-clamp-1">
                      《{fig.bookTitle}》
                    </p>
                  </div>

                  <button
                    type="button"
                    className="px-2.5 py-1 rounded-xl bg-amber-100 hover:bg-amber-200 dark:bg-slate-700 text-amber-900 dark:text-amber-200 text-[10px] font-black flex items-center gap-1 cursor-pointer"
                  >
                    <Volume2 className="w-3 h-3" />
                    <span>聽打氣</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 🚀 未解鎖成就/獎盃衝刺指南彈出卡片 (Locked Item Progress Sprint Guide Modal) */}
        {lockedItemDetail && (
          <div className="absolute inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 z-40 animate-fadeIn">
            <div className="w-full max-w-md bg-gradient-to-b from-amber-50 via-white to-amber-100 dark:from-slate-900 dark:via-slate-850 dark:to-slate-900 p-6 sm:p-7 rounded-3xl border-4 border-amber-400 shadow-2xl text-center space-y-4 relative overflow-hidden">
              <button
                type="button"
                onClick={() => setLockedItemDetail(null)}
                className="absolute top-4 right-4 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="w-16 h-16 rounded-2xl bg-amber-200 dark:bg-slate-700 border-2 border-amber-400 flex items-center justify-center text-3xl shadow-md mx-auto">
                {lockedItemDetail.icon}
              </div>

              <div>
                <div className="flex items-center justify-center gap-1.5">
                  <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${getRarityConfig(lockedItemDetail.rarity).badgeClass}`}>
                    {getRarityConfig(lockedItemDetail.rarity).label}
                  </span>
                  <span className="text-xs font-black text-amber-600 dark:text-amber-400">
                    +{lockedItemDetail.rewardStars}⭐ 獎勵
                  </span>
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 mt-1">
                  {lockedItemDetail.name}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-bold mt-1">
                  {lockedItemDetail.description}
                </p>
              </div>

              {/* Progress & Remaining distance callout */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border-2 border-amber-300 dark:border-slate-700 space-y-2.5 text-left">
                <div className="flex items-center justify-between text-xs font-black">
                  <span className="text-slate-600 dark:text-slate-300 flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
                    <span>當前進度與距離目標：</span>
                  </span>
                  <span className="text-amber-600 dark:text-amber-400 font-mono">
                    {lockedItemDetail.currentValue} / {lockedItemDetail.targetValue} {lockedItemDetail.unit}
                  </span>
                </div>

                <div className="w-full h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden p-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, Math.round((lockedItemDetail.currentValue / lockedItemDetail.targetValue) * 100))}%`,
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] font-bold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-slate-900 p-2.5 rounded-xl border border-amber-200 dark:border-slate-700">
                  <span>🚀 衝刺目標：</span>
                  <strong className="text-orange-600 dark:text-amber-400 font-black">
                    {lockedItemDetail.remainingEstimate}
                  </strong>
                </div>

                <p className="text-xs font-medium text-slate-600 dark:text-slate-300 leading-relaxed italic">
                  💡 伴讀提示：{lockedItemDetail.advice}
                </p>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setLockedItemDetail(null);
                    setActiveTab('challenges');
                    playPageTurnSound();
                  }}
                  className="flex-1 py-3 rounded-2xl bg-amber-100 hover:bg-amber-200 dark:bg-slate-800 text-amber-950 dark:text-amber-200 text-xs font-black flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Target className="w-3.5 h-3.5 text-amber-600" />
                  <span>前往今日挑戰</span>
                </button>

                {books.length > 0 && onSelectBook ? (
                  <button
                    type="button"
                    onClick={() => {
                      setLockedItemDetail(null);
                      onClose();
                      onSelectBook(books[0]);
                    }}
                    className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 text-slate-950 text-xs font-black shadow-md hover:scale-102 transition-transform flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>立刻閱讀繪本 ➔</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setLockedItemDetail(null)}
                    className="flex-1 py-3 rounded-2xl bg-amber-500 text-slate-950 text-xs font-black shadow-md cursor-pointer"
                  >
                    我會努力達成！
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 🌟 慶祝成就動態特效彈出卡片 (Celebration Animation Popup Modal) */}
        {celebratingItem && (
          <div className="absolute inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 z-30 animate-fadeIn">
            <div className="w-full max-w-md bg-gradient-to-b from-amber-50 via-white to-amber-100 dark:from-slate-900 dark:via-slate-850 dark:to-slate-900 p-8 rounded-3xl border-4 border-amber-400 shadow-2xl text-center space-y-5 relative overflow-hidden">
              {/* Pulsing Light Aura */}
              <div className="absolute -top-20 -left-20 w-48 h-48 bg-amber-400/30 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-orange-400/30 rounded-full blur-3xl pointer-events-none" />

              {/* Animated Trophy Icon */}
              <div className="relative inline-block">
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-amber-400 to-yellow-300 flex items-center justify-center text-5xl shadow-2xl mx-auto border-4 border-white dark:border-slate-800 animate-bounce">
                  {celebratingItem.icon}
                </div>
                <div className="absolute -top-2 -right-2 text-2xl animate-spin">
                  ✨
                </div>
              </div>

              <div className="space-y-1.5">
                <span className={`inline-block text-xs font-black px-3 py-1 rounded-full border ${getRarityConfig(celebratingItem.rarity).badgeClass}`}>
                  {getRarityConfig(celebratingItem.rarity).label}
                </span>
                <h3 className="text-2xl font-black text-amber-950 dark:text-amber-300">
                  🎉 {celebratingItem.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-bold leading-relaxed max-w-xs mx-auto">
                  {celebratingItem.description}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-amber-200/60 dark:bg-slate-800 border border-amber-300 dark:border-slate-700 text-xs font-black text-amber-900 dark:text-amber-200 flex items-center justify-center gap-2">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>解鎖時間：{celebratingItem.unlockedAt}</span>
              </div>

              <div className="flex items-center gap-2 pt-2 flex-wrap sm:flex-nowrap">
                <button
                  type="button"
                  onClick={() => triggerCelebration(celebratingItem.title, celebratingItem.icon, celebratingItem.description, celebratingItem.rarity, celebratingItem.unlockedAt)}
                  className="flex-1 py-2.5 rounded-2xl bg-amber-100 dark:bg-slate-800 hover:bg-amber-200 text-amber-950 dark:text-amber-200 font-black text-xs transition-transform hover:scale-102 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>再放煙火</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleOpenShareManager({
                      id: `celeb-${Date.now()}`,
                      title: celebratingItem.title,
                      icon: celebratingItem.icon,
                      description: celebratingItem.description,
                      rarity: celebratingItem.rarity,
                      unlockedAt: celebratingItem.unlockedAt,
                      type: 'milestone',
                    });
                  }}
                  className="flex-1 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-400 text-slate-950 font-black text-xs transition-transform hover:scale-102 flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Share2 className="w-4 h-4" />
                  <span>分享卡片 📸</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCelebratingItem(null)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-slate-900 dark:bg-slate-700 text-white font-black text-xs shadow-md transition-transform hover:scale-102 cursor-pointer"
                >
                  收下榮耀 🌟
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Selected Badge Detail Modal Overlay */}
        {selectedBadge && !celebratingItem && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-20 animate-fadeIn">
            <div className="w-full max-w-sm bg-white dark:bg-slate-850 p-6 rounded-3xl border-2 border-amber-400 shadow-2xl text-center space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-slate-700 mx-auto flex items-center justify-center text-3xl shadow-md">
                {selectedBadge.icon}
              </div>

              <div>
                <h3 className="font-black text-base text-slate-900 dark:text-slate-100">
                  {selectedBadge.name}
                </h3>
                <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full mt-1 inline-block border ${getRarityConfig(selectedBadge.rarity as AchievementRarity).badgeClass}`}>
                  {getRarityConfig(selectedBadge.rarity as AchievementRarity).label}
                </span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                {selectedBadge.description}
              </p>

              {selectedBadge.unlockCondition && (
                <div className="text-[11px] text-amber-700 dark:text-amber-300 font-bold bg-amber-50 dark:bg-slate-800 p-2 rounded-xl border border-amber-200">
                  解鎖條件：{selectedBadge.unlockCondition}
                </div>
              )}

              <div className="text-[10px] text-slate-400 font-bold">
                解鎖時間：{selectedBadge.unlockedAt ? `${selectedBadge.unlockedAt} 10:20` : '尚未達成'}
              </div>

              <div className="flex items-center gap-2 pt-2">
                {selectedBadge.unlocked && (
                  <button
                    type="button"
                    onClick={() => {
                      handleOpenShareManager({
                        id: selectedBadge.id,
                        title: selectedBadge.name,
                        icon: selectedBadge.icon,
                        description: selectedBadge.description,
                        rarity: (selectedBadge.rarity as AchievementRarity) || '稀有',
                        type: 'badge',
                        unlockedAt: selectedBadge.unlockedAt || '已達成',
                      });
                    }}
                    className="flex-1 py-2 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>分享此徽章</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedBadge(null)}
                  className="flex-1 py-2 rounded-2xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-black text-xs cursor-pointer"
                >
                  關閉說明
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Bar */}
        <div className="px-6 py-4 border-t border-amber-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 flex items-center justify-between gap-3">
          <div className="text-xs font-bold text-amber-900 dark:text-slate-300 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>提示：滑鼠懸停可欣賞 3D 浮動光澤；點擊未解鎖卡片即可查看衝刺進度！</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs sm:text-sm shadow-md hover:scale-105 transition-all cursor-pointer"
          >
            返回閱讀殿堂
          </button>
        </div>
      </div>

      {/* 📸 成就分享管理器彈窗 (Reading Achievement Share Manager Modal) */}
      <ReadingAchievementShareManager
        isOpen={isShareManagerOpen}
        onClose={() => setIsShareManagerOpen(false)}
        profile={profile}
        books={books}
        allBadges={profile.badges || []}
        initialItem={shareItem}
      />
    </div>
  );
};
