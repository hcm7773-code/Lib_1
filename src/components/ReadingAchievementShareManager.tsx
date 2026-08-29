import React, { useState, useRef, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  X,
  Download,
  Copy,
  Share2,
  Sparkles,
  Volume2,
  RefreshCw,
  Check,
  Image as ImageIcon,
  Palette,
  CheckCircle2,
  Crown,
  Trophy,
  Award,
  BookOpen,
  Flame,
  Star,
  Printer,
  Heart,
  Quote,
  MessageCircle,
} from 'lucide-react';
import { UserProfile, UserBadge, Book } from '../types';
import { playStarChime, playPageTurnSound, speakText } from '../utils/audio';

export type CardTheme = 'starry' | 'forest' | 'sunrise' | 'royal';

export interface ShareableAchievementItem {
  id: string;
  title: string;
  icon: string;
  description: string;
  rarity?: string;
  category?: string;
  unlockedAt?: string;
  type?: 'badge' | 'trophy' | 'milestone';
  statsLabel?: string;
  statsValue?: string;
}

interface ReadingAchievementShareManagerProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  books?: Book[];
  savedWordsCount?: number;
  initialItem?: ShareableAchievementItem | null;
  allBadges?: UserBadge[];
  darkMode?: boolean;
}

const THEME_CONFIGS: Record<
  CardTheme,
  {
    name: string;
    icon: string;
    bgGradient: string[];
    accentColor: string;
    badgeBg: string;
    textColor: string;
    subTextColor: string;
    borderColor: string;
    cardPreviewClass: string;
  }
> = {
  starry: {
    name: '🌌 星空魔法',
    icon: '✨',
    bgGradient: ['#0f172a', '#1e1b4b', '#312e81', '#1e293b'],
    accentColor: '#fbbf24',
    badgeBg: 'rgba(251, 191, 36, 0.15)',
    textColor: '#ffffff',
    subTextColor: '#cbd5e1',
    borderColor: '#f59e0b',
    cardPreviewClass: 'from-slate-900 via-indigo-950 to-slate-900 text-white border-amber-400',
  },
  forest: {
    name: '🌿 童話森林',
    icon: '🍃',
    bgGradient: ['#064e3b', '#065f46', '#047857', '#022c22'],
    accentColor: '#34d399',
    badgeBg: 'rgba(52, 211, 153, 0.15)',
    textColor: '#ffffff',
    subTextColor: '#a7f3d0',
    borderColor: '#10b981',
    cardPreviewClass: 'from-emerald-950 via-teal-900 to-emerald-950 text-white border-emerald-400',
  },
  sunrise: {
    name: '🌅 晨曦暖陽',
    icon: '☀️',
    bgGradient: ['#fffbeb', '#fef3c7', '#fed7aa', '#ffedd5'],
    accentColor: '#ea580c',
    badgeBg: 'rgba(234, 88, 12, 0.12)',
    textColor: '#1c1917',
    subTextColor: '#78350f',
    borderColor: '#f97316',
    cardPreviewClass: 'from-amber-50 via-orange-100 to-yellow-50 text-stone-900 border-orange-400',
  },
  royal: {
    name: '👑 皇家金典',
    icon: '🏆',
    bgGradient: ['#78350f', '#451a03', '#292524', '#1c1917'],
    accentColor: '#fde047',
    badgeBg: 'rgba(253, 224, 71, 0.2)',
    textColor: '#ffffff',
    subTextColor: '#fef08a',
    borderColor: '#eab308',
    cardPreviewClass: 'from-amber-950 via-stone-900 to-yellow-950 text-amber-100 border-yellow-400',
  },
};

export const ReadingAchievementShareManager: React.FC<ReadingAchievementShareManagerProps> = ({
  isOpen,
  onClose,
  profile,
  books = [],
  savedWordsCount = 0,
  initialItem,
  allBadges = [],
  darkMode = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Available achievements list to choose from
  const achievementsList = useMemo<ShareableAchievementItem[]>(() => {
    const list: ShareableAchievementItem[] = [];

    // Milestone Trophies
    list.push({
      id: 'trophy-books-1',
      title: '🌟 繪本啟蒙領航者',
      icon: '📖',
      description: '翻閱世界經典繪本，完成第一趟奇妙閱讀旅程！',
      rarity: '稀有',
      category: 'reading',
      type: 'trophy',
      statsLabel: '已閱繪本',
      statsValue: `${profile.readBookIds?.length || 1} 本`,
      unlockedAt: '2026/08/10',
    });

    list.push({
      id: 'trophy-streak-master',
      title: '🔥 連續閱讀打卡之星',
      icon: '⚡',
      description: `持之以恆每天共讀，連續打卡達 ${profile.streakDays || 5} 天！`,
      rarity: '史詩',
      category: 'streak',
      type: 'trophy',
      statsLabel: '連續打卡',
      statsValue: `${profile.streakDays || 5} 天`,
      unlockedAt: '2026/08/18',
    });

    list.push({
      id: 'trophy-vocab-king',
      title: '🔤 雙語生字百寶王',
      icon: '⭐',
      description: '在故事中探索雙語詞彙，累積豐沛字彙能量！',
      rarity: '稀有',
      category: 'vocab',
      type: 'trophy',
      statsLabel: '生字庫',
      statsValue: `${savedWordsCount || 10} 個生字`,
      unlockedAt: '2026/08/15',
    });

    list.push({
      id: 'trophy-creator',
      title: '🎨 AI 童話原創小作家',
      icon: '🪄',
      description: '運用豐富想像力與 AI 創作專屬原創故事繪本！',
      rarity: '傳奇',
      category: 'creation',
      type: 'trophy',
      statsLabel: '創作繪本',
      statsValue: `${profile.customBooksCount || 1} 本`,
      unlockedAt: '2026/08/20',
    });

    // Add unlocked user badges
    if (allBadges && allBadges.length > 0) {
      allBadges.forEach((b) => {
        list.push({
          id: b.id,
          title: b.name,
          icon: b.icon,
          description: b.description,
          rarity: b.rarity || '稀有',
          category: b.category,
          type: 'badge',
          statsLabel: '成就段位',
          statsValue: `${b.rarity || '珍稀'}徽章`,
          unlockedAt: b.unlockedAt || '2026/08/22',
        });
      });
    }

    return list;
  }, [profile, allBadges, savedWordsCount]);

  // Selected item
  const [selectedItem, setSelectedItem] = useState<ShareableAchievementItem>(
    initialItem || achievementsList[0]
  );

  // When initialItem updates, sync it
  useEffect(() => {
    if (initialItem) {
      setSelectedItem(initialItem);
    }
  }, [initialItem]);

  // Selected theme
  const [selectedTheme, setSelectedTheme] = useState<CardTheme>('starry');

  // Custom options
  const [includeStats, setIncludeStats] = useState<boolean>(true);
  const [includeChildName, setIncludeChildName] = useState<boolean>(true);
  const [customQuoteIndex, setCustomQuoteIndex] = useState<number>(0);
  const [copiedTextToast, setCopiedTextToast] = useState<boolean>(false);
  const [copiedImageToast, setCopiedImageToast] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Playful Whimsical Child Copywriting Styles
  const playfulCaptions = useMemo(() => {
    const childName = profile.name || '小探險家';
    const booksCount = profile.readBookIds?.length || 3;
    const streak = profile.streakDays || 5;
    const itemTitle = selectedItem.title.replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, '');

    return [
      {
        id: 'explorer',
        title: '🎈 童趣探險家版',
        text: `噔噔噔！✨ 今天在繪本王國裡探險，我成功解鎖了超閃亮的【${itemTitle}】！爸爸媽媽說我像小王子一樣勇敢又有智慧～ 我已經讀完 ${booksCount} 本繪本囉！快來和我一起在星空下聽故事吧！🌟📚💖`,
      },
      {
        id: 'superhero',
        title: '🚀 元氣超能小學霸版',
        text: `報告大家！我的閱讀能量條已經突破天際啦！💥 連續打卡 ${streak} 天、收穫了【${itemTitle}】大榮譽！每一頁故事都是神奇的魔法燃料，今晚我要搭著故事太空船飛向宇宙！🚀⭐🎉`,
      },
      {
        id: 'warmth',
        title: '❤️ 溫馨親子共讀日記',
        text: `每一本繪本都是一把通往奇蹟的鑰匙 🗝️ 和爸爸媽媽共讀的時光最幸福了！今天收到了【${itemTitle}】榮譽徽章，謝謝書本帶我認識美好世界，愛與閱讀是最棒的魔法！🌸🧸`,
      },
      {
        id: 'philosopher',
        title: '🦉 森林小智者哲思版',
        text: `「只有用心才能看清一切，實質的東西用眼睛是看不見的！」📖 今天在智慧森林裡摘下了【${itemTitle}】果實，書頁裡的金句像星星一樣閃閃發光～ 願我們都保持好奇心與童心！🌿✨`,
      },
      {
        id: 'fairy',
        title: '🧚‍♂️ 魔法精靈樂園版',
        text: `呼啦啦！我是繪本魔法小精靈 ${childName} 🧚‍♀️ 今天在故事花園裡挖到了【${itemTitle}】寶藏，獲得了好多好多智慧星章！明天也要元氣滿滿讀繪本喔！🌈🍭🦄`,
      },
    ];
  }, [profile, selectedItem]);

  const currentCaption = playfulCaptions[customQuoteIndex % playfulCaptions.length];

  // Draw Card to Canvas
  const drawCardToCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 1080;
    const height = 1350;
    canvas.width = width;
    canvas.height = height;

    const theme = THEME_CONFIGS[selectedTheme];

    // 1. Background Gradient
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, theme.bgGradient[0]);
    bgGrad.addColorStop(0.35, theme.bgGradient[1]);
    bgGrad.addColorStop(0.7, theme.bgGradient[2]);
    bgGrad.addColorStop(1, theme.bgGradient[3]);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Decorative Stars & Constellations in Background
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    const seedPoints = [
      [120, 180, 4], [250, 120, 6], [850, 160, 5], [960, 280, 7],
      [150, 920, 5], [220, 1150, 4], [880, 980, 6], [940, 1200, 5],
      [540, 140, 8], [380, 220, 4], [720, 240, 4], [100, 540, 5],
      [980, 620, 5], [520, 1250, 6]
    ];
    seedPoints.forEach(([x, y, r]) => {
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw glowing cross stars
    const drawStarSparkle = (cx: number, cy: number, size: number) => {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx - size, cy);
      ctx.lineTo(cx + size, cy);
      ctx.moveTo(cx, cy - size);
      ctx.lineTo(cx, cy + size);
      ctx.stroke();
    };
    drawStarSparkle(200, 280, 20);
    drawStarSparkle(880, 320, 24);
    drawStarSparkle(180, 1050, 18);
    drawStarSparkle(900, 1100, 22);
    ctx.restore();

    // 3. Outer Rounded Border & Frame
    ctx.save();
    ctx.strokeStyle = theme.borderColor;
    ctx.lineWidth = 8;
    ctx.shadowColor = theme.accentColor;
    ctx.shadowBlur = 25;
    ctx.beginPath();
    ctx.roundRect(40, 40, width - 80, height - 80, 48);
    ctx.stroke();
    ctx.restore();

    // Inner subtle border
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(56, 56, width - 112, height - 112, 38);
    ctx.stroke();
    ctx.restore();

    // 4. Header Badge / Brand Header
    ctx.save();
    ctx.fillStyle = theme.accentColor;
    ctx.font = '900 32px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🌟 世界兒童雙語數位繪本館 • 榮譽成就殿堂 🌟', width / 2, 130);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '600 22px system-ui, -apple-system, sans-serif';
    ctx.fillText('WORLD CHILDREN DIGITAL LIBRARY • OFFICIAL ACHIEVEMENT CARD', width / 2, 170);
    ctx.restore();

    // 5. Main Center Achievement Card Box
    const boxX = 100;
    const boxY = 220;
    const boxW = width - 200;
    const boxH = 540;

    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 3;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = 30;
    ctx.beginPath();
    ctx.roundRect(boxX, boxY, boxW, boxH, 40);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Glowing Radial Light under Badge
    ctx.save();
    const glowGrad = ctx.createRadialGradient(width / 2, boxY + 160, 20, width / 2, boxY + 160, 180);
    glowGrad.addColorStop(0, 'rgba(251, 191, 36, 0.35)');
    glowGrad.addColorStop(0.8, 'rgba(251, 191, 36, 0.05)');
    glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(width / 2, boxY + 160, 180, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Icon Circle
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.strokeStyle = theme.borderColor;
    ctx.lineWidth = 8;
    ctx.shadowColor = theme.accentColor;
    ctx.shadowBlur = 35;
    ctx.beginPath();
    ctx.arc(width / 2, boxY + 160, 95, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Draw Emoji Icon
    ctx.font = '100px "Segoe UI Emoji", "Apple Color Emoji", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(selectedItem.icon || '🏆', width / 2, boxY + 165);
    ctx.restore();

    // Rarity Tag Pill
    ctx.save();
    const rarityText = `${selectedItem.rarity || '珍稀'}成就 • ${selectedItem.type === 'trophy' ? '榮譽獎盃' : '光榮徽章'}`;
    ctx.font = '800 24px system-ui, -apple-system, sans-serif';
    const tagW = ctx.measureText(rarityText).width + 50;
    const tagH = 46;
    const tagX = (width - tagW) / 2;
    const tagY = boxY + 285;

    ctx.fillStyle = theme.accentColor;
    ctx.beginPath();
    ctx.roundRect(tagX, tagY, tagW, tagH, 23);
    ctx.fill();

    ctx.fillStyle = '#0f172a';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(rarityText, width / 2, tagY + tagH / 2 + 1);
    ctx.restore();

    // Achievement Title
    ctx.save();
    ctx.fillStyle = theme.textColor;
    ctx.font = '900 48px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 10;
    ctx.fillText(selectedItem.title, width / 2, boxY + 390);

    // Achievement Description
    ctx.fillStyle = theme.subTextColor;
    ctx.font = '600 26px system-ui, -apple-system, sans-serif';
    ctx.fillText(selectedItem.description, width / 2, boxY + 445);

    // Unlock Date & Auth Stamp
    ctx.fillStyle = theme.accentColor;
    ctx.font = '700 22px system-ui, -apple-system, sans-serif';
    ctx.fillText(`✨ 認證解鎖日期：${selectedItem.unlockedAt || '2026/08/29'} • 榮譽編號：#WCDL-${profile.stars || 888}`, width / 2, boxY + 495);
    ctx.restore();

    // 6. Child Profile & Quick Stats Section
    if (includeChildName || includeStats) {
      const statsY = 790;
      const statsW = width - 200;
      const statsH = 130;

      ctx.save();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(100, statsY, statsW, statsH, 28);
      ctx.fill();
      ctx.stroke();

      // Child avatar and name
      ctx.font = '54px "Segoe UI Emoji", sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(profile.avatar || '👑', 135, statsY + statsH / 2);

      ctx.fillStyle = theme.textColor;
      ctx.font = '900 32px system-ui, -apple-system, sans-serif';
      ctx.fillText(profile.name || '小探險家', 215, statsY + 48);

      ctx.fillStyle = theme.accentColor;
      ctx.font = '700 20px system-ui, -apple-system, sans-serif';
      ctx.fillText(`段位 Lv.5 傳奇故事領航者 • 累積 ${profile.stars || 150} 顆魔法星章 ⭐`, 215, statsY + 86);

      // Mini Stats Badges on Right
      if (includeStats) {
        const streakX = width - 280;
        ctx.fillStyle = 'rgba(251, 191, 36, 0.18)';
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.4)';
        ctx.beginPath();
        ctx.roundRect(streakX, statsY + 25, 145, 80, 18);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = theme.accentColor;
        ctx.font = '900 28px system-ui, -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`🔥 ${profile.streakDays || 5} 天`, streakX + 72, statsY + 58);

        ctx.fillStyle = theme.subTextColor;
        ctx.font = '700 16px system-ui, -apple-system, sans-serif';
        ctx.fillText('連續共讀打卡', streakX + 72, statsY + 88);
      }
      ctx.restore();
    }

    // 7. Whimsical Child Copywriting Quote Bubble
    const quoteY = 945;
    const quoteW = width - 200;
    const quoteH = 220;

    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.strokeStyle = theme.accentColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(100, quoteY, quoteW, quoteH, 30);
    ctx.fill();
    ctx.stroke();

    // Quote icon mark
    ctx.fillStyle = theme.accentColor;
    ctx.font = '900 48px serif';
    ctx.textAlign = 'left';
    ctx.fillText('“', 130, quoteY + 60);

    // Wrap quote text nicely
    ctx.fillStyle = theme.textColor;
    ctx.font = '600 24px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'left';

    const words = currentCaption.text;
    const maxCharsPerLine = 32;
    const lines = [];
    for (let i = 0; i < words.length; i += maxCharsPerLine) {
      lines.push(words.substring(i, i + maxCharsPerLine));
    }

    lines.slice(0, 3).forEach((line, idx) => {
      ctx.fillText(line, 175, quoteY + 65 + idx * 40);
    });

    ctx.fillStyle = theme.accentColor;
    ctx.font = '700 20px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`—— ${currentCaption.title}`, width - 140, quoteY + quoteH - 25);
    ctx.restore();

    // 8. Footer Watermark & Official Stamp
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '600 18px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('掃描探索更多經典雙語繪本 • 讓孩子愛上閱讀的每一天', width / 2, height - 90);
    ctx.fillText('© 2026 World Children\'s Digital Library. All Rights Reserved.', width / 2, height - 65);
    ctx.restore();
  };

  // Re-render canvas whenever options change
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        drawCardToCanvas();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen, selectedItem, selectedTheme, includeStats, includeChildName, customQuoteIndex]);

  // Download High-Res PNG
  const handleDownloadPNG = () => {
    setIsGenerating(true);
    playStarChime();

    setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas) {
        setIsGenerating(false);
        return;
      }

      const link = document.createElement('a');
      link.download = `成就卡片-${selectedItem.title.replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, '')}-${profile.name || '小讀者'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

      setIsGenerating(false);
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#fbbf24', '#3b82f6', '#10b981'],
      });
      speakText('成就卡片已成功下載！快分享給家人朋友吧！', 'zh-TW', 1.0, 'cartoon');
    }, 400);
  };

  // Copy Image to Clipboard
  const handleCopyImageToClipboard = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob }),
          ]);
          setCopiedImageToast(true);
          playStarChime();
          speakText('成就卡片已複製到剪貼簿！可直接貼在 LINE 或社群聊天室分享！', 'zh-TW', 1.0, 'cartoon');
          setTimeout(() => setCopiedImageToast(false), 3500);
        } catch {
          // Fallback to download
          handleDownloadPNG();
        }
      });
    } catch {
      handleDownloadPNG();
    }
  };

  // Copy Playful Text Caption
  const handleCopyCaption = () => {
    try {
      navigator.clipboard.writeText(currentCaption.text);
      setCopiedTextToast(true);
      playPageTurnSound();
      setTimeout(() => setCopiedTextToast(false), 3000);
    } catch {}
  };

  // Read aloud current whimsical caption
  const handleSpeakCaption = () => {
    playStarChime();
    speakText(currentCaption.text, 'zh-TW', 1.0, 'cartoon');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div
        className={`relative w-full max-w-5xl max-h-[92vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden transition-all ${
          darkMode
            ? 'bg-slate-900 border-slate-700 text-slate-100'
            : 'bg-gradient-to-b from-amber-50 via-white to-orange-50/80 border-amber-300 text-slate-900'
        }`}
      >
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-amber-200 dark:border-slate-800 flex items-center justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 via-orange-400 to-yellow-300 p-1 shadow-md flex items-center justify-center text-slate-950 text-2xl animate-pulse">
              📸
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black">
                  🎨 閱讀成就卡片分享中心 (ReadingAchievementShareManager)
                </h2>
                <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 shadow-2xs">
                  高畫質 PNG 匯出 + 童趣文案
                </span>
              </div>
              <p className="text-xs font-semibold text-amber-900/70 dark:text-slate-400 mt-0.5">
                自選徽章與里程碑，一鍵生成精美榮譽卡片與生動童趣文案，分享孩子的閱讀榮耀！
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

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Live Card Canvas Preview (5 cols) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center space-y-3">
            <div className="w-full text-center">
              <span className="text-xs font-black text-amber-800 dark:text-amber-300 flex items-center justify-center gap-1.5 mb-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>卡片即時預覽 (1080×1350 高解析輸出)</span>
              </span>
            </div>

            {/* Canvas Container with 3D shadow frame */}
            <div className="relative w-full max-w-[360px] aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl border-4 border-amber-300/80 dark:border-slate-700 bg-slate-950 group">
              <canvas
                ref={canvasRef}
                className="w-full h-full object-contain block transform-gpu transition-transform duration-300 group-hover:scale-[1.02]"
              />

              {/* Shimmer Overlay */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>

            {/* Quick Export Actions below preview */}
            <div className="flex items-center gap-2 w-full max-w-[360px]">
              <button
                type="button"
                onClick={handleDownloadPNG}
                disabled={isGenerating}
                className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs sm:text-sm shadow-md hover:scale-102 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>{isGenerating ? '正在繪製...' : '下載分享 PNG'}</span>
              </button>

              <button
                type="button"
                onClick={handleCopyImageToClipboard}
                className="py-3 px-4 rounded-2xl bg-white dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-amber-300 dark:border-slate-600 font-black text-xs shadow-xs hover:scale-105 transition-all flex items-center justify-center gap-1 cursor-pointer"
                title="複製圖片到剪貼簿"
              >
                {copiedImageToast ? (
                  <Check className="w-4 h-4 text-emerald-500" />
                ) : (
                  <Copy className="w-4 h-4 text-amber-600" />
                )}
                <span>{copiedImageToast ? '已複製！' : '複製圖片'}</span>
              </button>
            </div>
          </div>

          {/* Right Column: Customization Controls & Playful Copywriting (7 cols) */}
          <div className="lg:col-span-7 flex flex-col space-y-5">
            
            {/* 1. Choose Achievement Item to Highlight */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5 text-amber-500" />
                  <span>選擇要展示的成就 / 徽章：</span>
                </label>
                <span className="text-[11px] text-slate-400 font-bold">
                  共 {achievementsList.length} 項榮譽
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-36 overflow-y-auto pr-1">
                {achievementsList.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setSelectedItem(item);
                      playPageTurnSound();
                    }}
                    className={`p-2.5 rounded-2xl border text-left transition-all flex items-center gap-2 cursor-pointer ${
                      selectedItem.id === item.id
                        ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-sm font-black scale-102 ring-2 ring-amber-400/40'
                        : darkMode
                        ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                        : 'bg-white border-amber-200 text-slate-800 hover:bg-amber-100/60'
                    }`}
                  >
                    <span className="text-xl shrink-0">{item.icon}</span>
                    <div className="overflow-hidden">
                      <div className="text-xs font-black truncate">{item.title}</div>
                      <div className="text-[10px] opacity-75 truncate">{item.rarity || '稀有'}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Theme Selection */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-amber-500" />
                <span>卡片視覺主題風格：</span>
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(Object.keys(THEME_CONFIGS) as CardTheme[]).map((themeKey) => {
                  const cfg = THEME_CONFIGS[themeKey];
                  const isSelected = selectedTheme === themeKey;

                  return (
                    <button
                      key={themeKey}
                      type="button"
                      onClick={() => {
                        setSelectedTheme(themeKey);
                        playPageTurnSound();
                      }}
                      className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-sm font-black scale-105 ring-2 ring-amber-400/50'
                          : darkMode
                          ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                          : 'bg-white border-amber-200 text-slate-800 hover:bg-amber-100'
                      }`}
                    >
                      <div className="text-base mb-1">{cfg.icon}</div>
                      <div className="text-xs font-black">{cfg.name}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Card Elements Toggles */}
            <div className="flex items-center gap-4 flex-wrap text-xs font-bold">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={includeChildName}
                  onChange={(e) => setIncludeChildName(e.target.checked)}
                  className="w-4 h-4 text-amber-500 accent-amber-500 rounded"
                />
                <span>顯示小讀者頭像與稱呼</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={includeStats}
                  onChange={(e) => setIncludeStats(e.target.checked)}
                  className="w-4 h-4 text-amber-500 accent-amber-500 rounded"
                />
                <span>顯示連續閱讀打卡天數</span>
              </label>
            </div>

            {/* 4. Playful Whimsical Copywriting Generator (童趣分享文案生成器) */}
            <div className={`p-4 sm:p-5 rounded-3xl border-2 space-y-3.5 ${
              darkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-amber-100/60 border-amber-300'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <h3 className="font-black text-xs sm:text-sm">
                    🎈 童趣社群分享文案生成器 ({currentCaption.title})
                  </h3>
                </div>

                {/* Shuffle Caption Button */}
                <button
                  type="button"
                  onClick={() => {
                    setCustomQuoteIndex((prev) => prev + 1);
                    playPageTurnSound();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-700 hover:bg-amber-200 dark:hover:bg-slate-600 text-amber-950 dark:text-amber-200 text-xs font-black flex items-center gap-1.5 shadow-2xs hover:scale-105 transition-all cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-amber-600 animate-spin-hover" />
                  <span>換一段文案 🎲</span>
                </button>
              </div>

              {/* Caption Text Box */}
              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 leading-relaxed shadow-inner">
                {currentCaption.text}
              </div>

              {/* Copywriting Action Bar */}
              <div className="flex items-center justify-between gap-2 pt-1">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSpeakCaption}
                    className="py-2 px-3 rounded-xl bg-amber-200 hover:bg-amber-300 dark:bg-slate-700 text-amber-950 dark:text-amber-200 text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer"
                    title="語音大聲朗讀"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-amber-700 dark:text-amber-300" />
                    <span>朗讀文案 🔊</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleCopyCaption}
                  className="py-2 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-xs hover:scale-105 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedTextToast ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-slate-950" />
                      <span>已複製到剪貼簿！</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>一鍵複製分享文案 📋</span>
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom Footer Bar */}
        <div className="px-6 py-4 border-t border-amber-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 flex items-center justify-between gap-3">
          <div className="text-xs font-bold text-amber-900 dark:text-slate-300 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>支援一鍵複製到 LINE、Facebook、微信或家庭群組，隨時分享閱讀好成就！</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 text-slate-950 font-black text-xs sm:text-sm shadow-md hover:scale-105 transition-all cursor-pointer"
          >
            完成並返回
          </button>
        </div>
      </div>
    </div>
  );
};
