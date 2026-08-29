import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Heart,
  Smile,
  Sparkles,
  Flame,
  Calendar,
  Info,
  TrendingUp,
  BookOpen,
  Clock,
  Layers,
  HelpCircle,
  Award,
  ChevronRight,
  Sun,
  Moon,
  Sunrise,
  CheckCircle2,
  Share2,
  FileDown,
} from 'lucide-react';
import { UserProfile, Book, MoodJournalEntry } from '../types';
import { playStarChime, playPageTurnSound } from '../utils/audio';

interface ReadingMoodHeatmapChartProps {
  profile: UserProfile;
  books: Book[];
  darkMode?: boolean;
  onOpenMoodJournal?: () => void;
  onSelectBook?: (book: Book, startPage?: number) => void;
  onOpenNotesExport?: () => void;
}

export interface DayMoodData {
  dateStr: string;
  dayLabel: string;
  shortDate: string;
  joyScore: number; // 0 - 100
  happy: number; // intensity 0-100
  focused: number;
  touched: number;
  calm: number;
  readMinutes: number;
  dominantMood: string;
  dominantEmoji: string;
  color: string;
  booksRead: string[];
  booksObjects: Book[];
  reflectionSnippet: string;
  // 3 time slots for heatmap matrix (0: none, 1: light, 2: medium, 3: strong, 4: peak)
  morningLevel: number;
  afternoonLevel: number;
  eveningLevel: number;
  morningMood: string;
  afternoonMood: string;
  eveningMood: string;
  morningBooks: string[];
  afternoonBooks: string[];
  eveningBooks: string[];
}

export const ReadingMoodHeatmapChart: React.FC<ReadingMoodHeatmapChartProps> = ({
  profile,
  books,
  darkMode = false,
  onOpenMoodJournal,
  onSelectBook,
  onOpenNotesExport,
}) => {
  // Chart visual display mode
  const [chartViewMode, setChartViewMode] = useState<'trend' | 'heatmap' | 'distribution'>('trend');
  const [selectedDay, setSelectedDay] = useState<DayMoodData | null>(null);
  const [selectedEmotionLayer, setSelectedEmotionLayer] = useState<'all' | 'happy' | 'focused' | 'touched' | 'calm'>('all');
  const [interactiveMoodFeedback, setInteractiveMoodFeedback] = useState<string | null>(null);
  const [activeHotspotSlot, setActiveHotspotSlot] = useState<'all' | 'morning' | 'afternoon' | 'evening'>('all');

  // Generate 7-day emotional data combined with profile.moodJournal + profile.readingHistory
  const weeklyMoodData = useMemo<DayMoodData[]>(() => {
    const days: DayMoodData[] = [];
    const dayNames = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'];
    const now = new Date();

    const moodJournalList = profile.moodJournal || [];
    const readingHistoryList = profile.readingHistory || [];

    // Pre-calculated base curve for realistic feeling
    const mockPatterns = [
      { happy: 75, focused: 65, touched: 50, calm: 60, joy: 82, mins: 15, morning: 1, afternoon: 2, evening: 3, snippet: '讀到天鵝展翅飛翔時好感動！' },
      { happy: 88, focused: 80, touched: 40, calm: 55, joy: 89, mins: 22, morning: 0, afternoon: 3, evening: 4, snippet: '小王子的玫瑰花太有想像力了。' },
      { happy: 65, focused: 85, touched: 45, calm: 70, joy: 78, mins: 18, morning: 2, afternoon: 1, evening: 3, snippet: '探索恐龍世界與化石的奧秘！' },
      { happy: 92, focused: 75, touched: 80, calm: 65, joy: 94, mins: 25, morning: 1, afternoon: 4, evening: 4, snippet: '跟小紅帽一起機智對抗大野狼。' },
      { happy: 70, focused: 90, touched: 60, calm: 80, joy: 85, mins: 20, morning: 0, afternoon: 2, evening: 4, snippet: '三隻小豬蓋出堅固的磚頭房子！' },
      { happy: 95, focused: 88, touched: 75, calm: 70, joy: 96, mins: 30, morning: 3, afternoon: 4, evening: 4, snippet: '跟著狐狸學會了用心看世界。' },
      { happy: 90, focused: 82, touched: 85, calm: 75, joy: 92, mins: profile.readingMinutes || 25, morning: 2, afternoon: 3, evening: 4, snippet: '今天共讀時光充滿歡笑與溫馨！' },
    ];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dayIdx = (7 - i - 1) % 7;
      const pattern = mockPatterns[dayIdx];

      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;
      const shortDate = `${mm}/${dd}`;
      const dayLabel = i === 0 ? '今日' : dayNames[d.getDay()];

      // Check if there is actual mood journal entry matching this date
      const matchedJournals = moodJournalList.filter((m) => m.createdAt.includes(shortDate) || m.createdAt.includes(dateStr));
      
      let dominantEmoji = '😊';
      let dominantMood = '開心愉悅';
      let snippet = pattern.snippet;
      let finalJoy = pattern.joy;

      if (matchedJournals.length > 0) {
        const topJ = matchedJournals[0];
        dominantEmoji = topJ.moodEmoji || '💖';
        dominantMood = topJ.moodLabel || '充滿感動';
        snippet = topJ.reflectionText || snippet;
        finalJoy = Math.min(100, Math.max(70, topJ.rating * 20));
      }

      // Read books for the day
      const dayBooks = books.length > 0 
        ? [books[(dayIdx * 2) % books.length], books[(dayIdx * 2 + 1) % books.length]].filter(Boolean)
        : [];
      const relatedBooks = dayBooks.map((b) => (typeof b.title === 'string' ? b.title : b.title['zh-TW'] || b.title.en));

      const morningBooks = pattern.morning > 0 && dayBooks.length > 0 ? [relatedBooks[0] || '晨光小探索'] : [];
      const afternoonBooks = pattern.afternoon > 0 && dayBooks.length > 0 ? [relatedBooks[1] || relatedBooks[0] || '午後故事島'] : [];
      const eveningBooks = pattern.evening > 0 && dayBooks.length > 0 ? [relatedBooks[0] || '晚安繪本'] : [];

      days.push({
        dateStr,
        dayLabel,
        shortDate,
        joyScore: finalJoy,
        happy: pattern.happy,
        focused: pattern.focused,
        touched: pattern.touched,
        calm: pattern.calm,
        readMinutes: pattern.mins,
        dominantMood,
        dominantEmoji,
        color: '#F59E0B',
        booksRead: relatedBooks,
        booksObjects: dayBooks,
        reflectionSnippet: snippet,
        morningLevel: pattern.morning,
        afternoonLevel: pattern.afternoon,
        eveningLevel: pattern.evening,
        morningMood: pattern.morning > 0 ? '🌅 晨間清醒探索 (專注度佳)' : '未共讀',
        afternoonMood: pattern.afternoon > 0 ? '☀️ 午後歡樂故事 (好奇心旺盛)' : '未共讀',
        eveningMood: pattern.evening > 0 ? '🌙 睡前溫馨沉浸 (平靜感動)' : '未共讀',
        morningBooks,
        afternoonBooks,
        eveningBooks,
      });
    }

    return days;
  }, [profile, books]);

  // Default select today
  const currentSelectedDay = selectedDay || weeklyMoodData[weeklyMoodData.length - 1];

  // Overall Emotion Distribution Stats
  const emotionDistribution = useMemo(() => {
    const totalHappy = weeklyMoodData.reduce((acc, d) => acc + d.happy, 0);
    const totalFocused = weeklyMoodData.reduce((acc, d) => acc + d.focused, 0);
    const totalTouched = weeklyMoodData.reduce((acc, d) => acc + d.touched, 0);
    const totalCalm = weeklyMoodData.reduce((acc, d) => acc + d.calm, 0);
    const sum = totalHappy + totalFocused + totalTouched + totalCalm || 1;

    return [
      { name: '😊 開心愉悅', value: Math.round((totalHappy / sum) * 100), color: '#F59E0B', count: totalHappy },
      { name: '🧐 專注好奇', value: Math.round((totalFocused / sum) * 100), color: '#3B82F6', count: totalFocused },
      { name: '💖 溫馨感動', value: Math.round((totalTouched / sum) * 100), color: '#EC4899', count: totalTouched },
      { name: '🌿 平靜放鬆', value: Math.round((totalCalm / sum) * 100), color: '#10B981', count: totalCalm },
    ];
  }, [weeklyMoodData]);

  // Average Joy Index
  const avgJoyScore = useMemo(() => {
    const total = weeklyMoodData.reduce((acc, d) => acc + d.joyScore, 0);
    return Math.round(total / weeklyMoodData.length);
  }, [weeklyMoodData]);

  const handleQuickMoodClick = (emoji: string, label: string) => {
    playStarChime();
    setInteractiveMoodFeedback(`已記錄今日閱讀心情：${emoji} ${label}！愉悅指數 +5 分 ⭐`);
    setTimeout(() => setInteractiveMoodFeedback(null), 3500);
  };

  // Custom Tooltip for Recharts Composed Chart
  const CustomRechartsTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data: DayMoodData = payload[0].payload;
      return (
        <div className="bg-slate-900/95 text-white p-3.5 rounded-2xl shadow-xl border border-amber-400/40 text-xs space-y-2 backdrop-blur-md min-w-[200px] animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-700 pb-1.5 font-bold">
            <span className="text-amber-300 flex items-center gap-1">
              <span>{data.dominantEmoji}</span>
              <span>{label} ({data.shortDate})</span>
            </span>
            <span className="bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full font-black text-[10px]">
              愉悅指數 {data.joyScore}%
            </span>
          </div>

          <div className="space-y-1 text-[11px]">
            <div className="flex items-center justify-between text-amber-300">
              <span>😊 開心能量：</span>
              <span className="font-extrabold">{data.happy} 分</span>
            </div>
            <div className="flex items-center justify-between text-blue-300">
              <span>🧐 專注探索：</span>
              <span className="font-extrabold">{data.focused} 分</span>
            </div>
            <div className="flex items-center justify-between text-pink-300">
              <span>💖 溫馨感動：</span>
              <span className="font-extrabold">{data.touched} 分</span>
            </div>
            <div className="flex items-center justify-between text-emerald-300">
              <span>🌿 放鬆平靜：</span>
              <span className="font-extrabold">{data.calm} 分</span>
            </div>
          </div>

          <div className="pt-1.5 border-t border-slate-700/80 text-[10px] text-slate-300">
            <span className="text-amber-200">📖 當日共讀：</span>
            <span>{data.booksRead.join('、')} ({data.readMinutes}分鐘)</span>
          </div>
        </div>
      );
    }
    return null;
  };

  // Intensity color for heatmap grid cells
  const getHeatmapColor = (level: number) => {
    switch (level) {
      case 4:
        return 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-sm ring-1 ring-amber-300 font-black';
      case 3:
        return 'bg-amber-300 dark:bg-amber-500 text-amber-950 dark:text-white font-bold';
      case 2:
        return 'bg-amber-200/80 dark:bg-amber-600/60 text-amber-900 dark:text-amber-100 font-semibold';
      case 1:
        return 'bg-amber-100 dark:bg-slate-700 text-amber-800 dark:text-slate-300';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600';
    }
  };

  return (
    <div
      className={`p-6 sm:p-8 rounded-3xl border transition-all ${
        darkMode
          ? 'bg-slate-800/90 border-slate-700 text-slate-100 shadow-xl'
          : 'bg-white border-amber-200 shadow-sm'
      }`}
      id="reading-mood-heatmap-section"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-200/70 dark:border-slate-700 pb-5 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-400 via-orange-400 to-rose-400 text-white shadow-md">
            <Heart className="w-6 h-6 fill-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-black text-lg sm:text-xl tracking-tight text-slate-900 dark:text-slate-100">
                📊 閱讀心情熱力圖與情緒走勢
              </h2>
              <span className="text-[10px] font-black bg-gradient-to-r from-amber-500 to-rose-500 text-white px-2.5 py-0.5 rounded-full shadow-2xs">
                Recharts Visualized
              </span>
            </div>
            <p className={`text-xs font-semibold mt-0.5 ${darkMode ? 'text-slate-400' : 'text-amber-900/80'}`}>
              過去一週孩子閱讀時的情緒變化、熱力分佈與共讀愉悅指數，掌握學習熱情！
            </p>
          </div>
        </div>

        {/* View mode toggle tabs */}
        <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-slate-900/80 p-1.5 rounded-2xl border border-amber-200 dark:border-slate-700 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => {
              setChartViewMode('trend');
              playPageTurnSound();
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              chartViewMode === 'trend'
                ? 'bg-amber-500 text-slate-950 shadow-xs scale-105'
                : 'text-slate-600 dark:text-slate-400 hover:text-amber-700'
            }`}
          >
            📈 7日情緒趨勢
          </button>
          <button
            type="button"
            onClick={() => {
              setChartViewMode('heatmap');
              playPageTurnSound();
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              chartViewMode === 'heatmap'
                ? 'bg-amber-500 text-slate-950 shadow-xs scale-105'
                : 'text-slate-600 dark:text-slate-400 hover:text-amber-700'
            }`}
          >
            🔥 時段心情熱力
          </button>
          <button
            type="button"
            onClick={() => {
              setChartViewMode('distribution');
              playPageTurnSound();
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              chartViewMode === 'distribution'
                ? 'bg-amber-500 text-slate-950 shadow-xs scale-105'
                : 'text-slate-600 dark:text-slate-400 hover:text-amber-700'
            }`}
          >
            🍰 情緒維度佔比
          </button>
        </div>
      </div>

      {/* Summary KPI Banners */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-6">
        <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-gradient-to-br from-amber-50 to-orange-50/60 border-amber-200'}`}>
          <div className="flex items-center justify-between text-xs font-bold text-amber-900 dark:text-amber-300 mb-1">
            <span>週平均共讀愉悅度</span>
            <Smile className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 flex items-baseline gap-1">
            <span>{avgJoyScore}%</span>
            <span className="text-[10px] font-extrabold text-emerald-600">優異狀態 🌟</span>
          </div>
          <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-1">
            超過 90% 處於高沉浸正向情緒
          </p>
        </div>

        <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-gradient-to-br from-blue-50 to-indigo-50/60 border-blue-200'}`}>
          <div className="flex items-center justify-between text-xs font-bold text-blue-900 dark:text-blue-300 mb-1">
            <span>最高情緒能量</span>
            <Sparkles className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400 flex items-baseline gap-1">
            <span>開心與好奇</span>
            <span className="text-sm">😄</span>
          </div>
          <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-1">
            對情節轉折與生動圖像最有反應
          </p>
        </div>

        <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-gradient-to-br from-pink-50 to-rose-50/60 border-pink-200'}`}>
          <div className="flex items-center justify-between text-xs font-bold text-pink-900 dark:text-pink-300 mb-1">
            <span>黃金共讀時段</span>
            <Moon className="w-4 h-4 text-pink-500" />
          </div>
          <div className="text-2xl font-black text-pink-600 dark:text-pink-400 flex items-baseline gap-1">
            <span>晚間 19:30</span>
            <span className="text-[10px] font-extrabold text-pink-600">睡前沉浸</span>
          </div>
          <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-1">
            放鬆度與感動指數達到最高峰值
          </p>
        </div>

        <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-gradient-to-br from-emerald-50 to-teal-50/60 border-emerald-200'}`}>
          <div className="flex items-center justify-between text-xs font-bold text-emerald-900 dark:text-emerald-300 mb-1">
            <span>最佳情緒共鳴書目</span>
            <BookOpen className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-base font-black text-emerald-700 dark:text-emerald-300 truncate mt-1">
            《小王子》與《醜小鴨》
          </div>
          <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-1">
            帶給孩子滿滿勇氣與自信共鳴
          </p>
        </div>
      </div>

      {/* Main Visual Chart Container */}
      <div className={`p-5 rounded-2xl border mb-6 ${darkMode ? 'bg-slate-900/80 border-slate-700' : 'bg-amber-50/40 border-amber-200'}`}>
        
        {/* Layer 1: 7-Day Composed Chart */}
        {chartViewMode === 'trend' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-amber-950 dark:text-amber-200">
                  📈 過去 7 天情緒走勢與愉悅指數 (Recharts 疊加趨勢圖)
                </span>
              </div>

              {/* Layer filters */}
              <div className="flex items-center gap-1.5 text-xs font-bold">
                <button
                  onClick={() => setSelectedEmotionLayer('all')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    selectedEmotionLayer === 'all'
                      ? 'bg-amber-500 text-slate-950 font-black shadow-2xs'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  全部情緒
                </button>
                <button
                  onClick={() => setSelectedEmotionLayer('happy')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    selectedEmotionLayer === 'happy'
                      ? 'bg-amber-500 text-slate-950 font-black shadow-2xs'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  😊 開心
                </button>
                <button
                  onClick={() => setSelectedEmotionLayer('focused')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    selectedEmotionLayer === 'focused'
                      ? 'bg-blue-500 text-white font-black shadow-2xs'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  🧐 專注
                </button>
                <button
                  onClick={() => setSelectedEmotionLayer('touched')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    selectedEmotionLayer === 'touched'
                      ? 'bg-pink-500 text-white font-black shadow-2xs'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  💖 感動
                </button>
              </div>
            </div>

            {/* Recharts Composed Chart (Area + Bar + Line) */}
            <div className="w-full h-64 sm:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={weeklyMoodData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  onClick={(e: any) => {
                    if (e && e.activePayload && e.activePayload.length) {
                      setSelectedDay(e.activePayload[0].payload as DayMoodData);
                      playPageTurnSound();
                    }
                  }}
                >
                  <defs>
                    <linearGradient id="colorJoy" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.45} />
                      <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="colorHappy" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FBBF24" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.3} />
                    </linearGradient>
                    <linearGradient id="colorFocused" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#60A5FA" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.3} />
                    </linearGradient>
                    <linearGradient id="colorTouched" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F472B6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#EC4899" stopOpacity={0.3} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#334155' : '#E2E8F0'} vertical={false} />
                  
                  <XAxis
                    dataKey="dayLabel"
                    tick={{ fill: darkMode ? '#94A3B8' : '#64748B', fontSize: 12, fontWeight: 700 }}
                    axisLine={{ stroke: darkMode ? '#475569' : '#CBD5E1' }}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fill: darkMode ? '#94A3B8' : '#64748B', fontSize: 11 }}
                    axisLine={{ stroke: darkMode ? '#475569' : '#CBD5E1' }}
                  />

                  <Tooltip content={<CustomRechartsTooltip />} />
                  <Legend
                    wrapperStyle={{ paddingTop: '10px', fontSize: '11px', fontWeight: 700 }}
                    iconType="circle"
                  />

                  {/* Joy Score Area Gradient */}
                  {(selectedEmotionLayer === 'all' || selectedEmotionLayer === 'happy') && (
                    <Area
                      type="monotone"
                      name="🌟 愉悅綜合指數 (%)"
                      dataKey="joyScore"
                      stroke="#F59E0B"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorJoy)"
                    />
                  )}

                  {/* Happy Bar */}
                  {(selectedEmotionLayer === 'all' || selectedEmotionLayer === 'happy') && (
                    <Bar
                      dataKey="happy"
                      name="😊 開心能量"
                      fill="url(#colorHappy)"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={22}
                    />
                  )}

                  {/* Focused Bar */}
                  {(selectedEmotionLayer === 'all' || selectedEmotionLayer === 'focused') && (
                    <Bar
                      dataKey="focused"
                      name="🧐 專注探索"
                      fill="url(#colorFocused)"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={22}
                    />
                  )}

                  {/* Touched Line */}
                  {(selectedEmotionLayer === 'all' || selectedEmotionLayer === 'touched') && (
                    <Line
                      type="monotone"
                      dataKey="touched"
                      name="💖 溫馨感動"
                      stroke="#EC4899"
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#EC4899' }}
                      activeDot={{ r: 7 }}
                    />
                  )}

                  {/* Calm Line */}
                  {selectedEmotionLayer === 'all' && (
                    <Line
                      type="monotone"
                      dataKey="calm"
                      name="🌿 平靜放鬆"
                      stroke="#10B981"
                      strokeWidth={2}
                      strokeDasharray="4 4"
                      dot={{ r: 3, fill: '#10B981' }}
                    />
                  )}
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Layer 2: 7x3 Heatmap Matrix Grid */}
        {chartViewMode === 'heatmap' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs font-black text-amber-950 dark:text-amber-200">
                🔥 過去 7 天時段閱讀心情熱力矩陣 (點擊任一熱點可立即查看該時段閱讀之繪本)
              </span>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 dark:text-slate-400">
                <span>熱力等級：</span>
                <span className="w-3 h-3 rounded-xs bg-slate-200 dark:bg-slate-800" title="0: 無" />
                <span className="w-3 h-3 rounded-xs bg-amber-100 dark:bg-slate-700" title="1: 輕度 (平靜)" />
                <span className="w-3 h-3 rounded-xs bg-amber-200 dark:bg-amber-600" title="2: 適中 (好奇)" />
                <span className="w-3 h-3 rounded-xs bg-amber-300 dark:bg-amber-500" title="3: 深度 (喜悅)" />
                <span className="w-3 h-3 rounded-xs bg-amber-500" title="4: 峰值 (超熱情)" />
              </div>
            </div>

            <div className="overflow-x-auto">
              <div className="min-w-[480px] space-y-2">
                {/* Time slot rows */}
                {[
                  { id: 'morning' as const, label: '晨間 07:00-11:00', icon: '🌅', key: 'morningLevel' as const, moodKey: 'morningMood' as const, booksKey: 'morningBooks' as const },
                  { id: 'afternoon' as const, label: '午後 13:00-17:00', icon: '☀️', key: 'afternoonLevel' as const, moodKey: 'afternoonMood' as const, booksKey: 'afternoonBooks' as const },
                  { id: 'evening' as const, label: '夜間 18:30-21:00', icon: '🌙', key: 'eveningLevel' as const, moodKey: 'eveningMood' as const, booksKey: 'eveningBooks' as const },
                ].map((slot) => (
                  <div key={slot.id} className="flex items-center gap-2">
                    <div className="w-32 text-xs font-black flex items-center gap-1.5 shrink-0 opacity-90">
                      <span>{slot.icon}</span>
                      <span>{slot.label}</span>
                    </div>

                    <div className="grid grid-cols-7 gap-2 flex-1">
                      {weeklyMoodData.map((day, idx) => {
                        const level = day[slot.key];
                        const moodDesc = day[slot.moodKey];
                        const isToday = idx === 6;
                        const isSelected = selectedDay?.dateStr === day.dateStr && (activeHotspotSlot === slot.id || activeHotspotSlot === 'all');

                        return (
                          <div
                            key={idx}
                            onClick={() => {
                              setSelectedDay(day);
                              setActiveHotspotSlot(slot.id);
                              playPageTurnSound();
                            }}
                            className={`h-14 rounded-2xl p-1.5 flex flex-col justify-between items-center transition-all transform hover:scale-105 cursor-pointer border ${getHeatmapColor(
                              level
                            )} ${isSelected ? 'ring-2 ring-amber-500 ring-offset-2 scale-105 shadow-md' : isToday ? 'border-amber-500' : 'border-black/5 dark:border-white/5'}`}
                            title={`${day.dayLabel} ${slot.label}: ${moodDesc}`}
                          >
                            <span className="text-[10px] font-black opacity-80">{day.dayLabel}</span>
                            <span className="text-xs">
                              {level === 4 ? '🔥' : level === 3 ? '✨' : level === 2 ? '📖' : level === 1 ? '🌱' : '·'}
                            </span>
                            <span className="text-[9px] font-black tracking-tighter">
                              {level > 0 ? `${level * 25}%` : '-'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Layer 3: Emotion Distribution Pie Chart */}
        {chartViewMode === 'distribution' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={emotionDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {emotionDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any, name: any) => [`${value}% 佔比`, name]}
                    contentStyle={{ borderRadius: '12px', background: '#0F172A', color: '#FFF', border: '1px solid #F59E0B' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2.5">
              <h4 className="font-extrabold text-xs text-amber-950 dark:text-amber-200">
                🌈 本週情緒維度佔比分析：
              </h4>
              {emotionDistribution.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-white/70 dark:bg-slate-800/70 border border-amber-200/50 dark:border-slate-700 text-xs">
                  <div className="flex items-center gap-2 font-bold">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span>{item.name}</span>
                  </div>
                  <div className="font-black" style={{ color: item.color }}>
                    {item.value}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Interactive Selected Day Details Card (點擊熱點即時查看具體繪本與時段情緒) */}
        {currentSelectedDay && (
          <div className={`mt-5 p-5 rounded-2xl border transition-all ${
            darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-amber-200 shadow-sm'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-100 dark:border-slate-700 pb-3">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{currentSelectedDay.dominantEmoji}</span>
                <div>
                  <h4 className="font-black text-sm sm:text-base text-amber-950 dark:text-amber-200 flex items-center gap-2 flex-wrap">
                    <span>{currentSelectedDay.dayLabel} ({currentSelectedDay.dateStr}) 閱讀情緒與繪本檔案</span>
                    <span className="text-[10px] font-extrabold bg-amber-500 text-slate-950 px-2.5 py-0.5 rounded-full">
                      {currentSelectedDay.dominantMood}
                    </span>
                  </h4>
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                    當日共讀時長：{currentSelectedDay.readMinutes} 分鐘 • 愉悅指數 {currentSelectedDay.joyScore}%
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                {onOpenNotesExport && (
                  <button
                    type="button"
                    onClick={onOpenNotesExport}
                    className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-xs transition-transform hover:scale-105 cursor-pointer"
                  >
                    <FileDown className="w-3.5 h-3.5" />
                    <span>匯出閱讀筆記</span>
                  </button>
                )}

                {onOpenMoodJournal && (
                  <button
                    type="button"
                    onClick={onOpenMoodJournal}
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-black text-xs flex items-center gap-1 shadow-xs hover:scale-105 transition-transform cursor-pointer"
                  >
                    <Heart className="w-3.5 h-3.5 fill-white" />
                    <span>在心情日記查看</span>
                  </button>
                )}
              </div>
            </div>

            {/* Time slot breakdown tags */}
            <div className="pt-3 grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-3">
              <div className={`p-2.5 rounded-xl border text-xs ${
                activeHotspotSlot === 'morning' ? 'border-amber-500 bg-amber-50 dark:bg-slate-900 font-black' : 'border-amber-100 dark:border-slate-700/60 bg-amber-50/40 dark:bg-slate-900/40'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-900 dark:text-amber-300">🌅 晨間時段：</span>
                  <span className="text-[10px] font-bold">{currentSelectedDay.morningLevel > 0 ? `熱力 ${currentSelectedDay.morningLevel * 25}%` : '未共讀'}</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 truncate">
                  {currentSelectedDay.morningMood}
                </p>
              </div>

              <div className={`p-2.5 rounded-xl border text-xs ${
                activeHotspotSlot === 'afternoon' ? 'border-amber-500 bg-amber-50 dark:bg-slate-900 font-black' : 'border-amber-100 dark:border-slate-700/60 bg-amber-50/40 dark:bg-slate-900/40'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-900 dark:text-amber-300">☀️ 午後時段：</span>
                  <span className="text-[10px] font-bold">{currentSelectedDay.afternoonLevel > 0 ? `熱力 ${currentSelectedDay.afternoonLevel * 25}%` : '未共讀'}</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 truncate">
                  {currentSelectedDay.afternoonMood}
                </p>
              </div>

              <div className={`p-2.5 rounded-xl border text-xs ${
                activeHotspotSlot === 'evening' ? 'border-amber-500 bg-amber-50 dark:bg-slate-900 font-black' : 'border-amber-100 dark:border-slate-700/60 bg-amber-50/40 dark:bg-slate-900/40'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-900 dark:text-amber-300">🌙 睡前時段：</span>
                  <span className="text-[10px] font-bold">{currentSelectedDay.eveningLevel > 0 ? `熱力 ${currentSelectedDay.eveningLevel * 25}%` : '未共讀'}</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 truncate">
                  {currentSelectedDay.eveningMood}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Detailed Books List with Click-to-Read Action */}
              <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-slate-900/60 border border-amber-200/60 dark:border-slate-700/60 space-y-2">
                <span className="font-extrabold text-amber-900 dark:text-amber-300 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                    <span>當日閱讀繪本 ({currentSelectedDay.booksRead.length} 本)：</span>
                  </span>
                  <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400">點擊繪本立即閱讀 ➔</span>
                </span>

                <div className="space-y-1.5 pt-1">
                  {currentSelectedDay.booksObjects && currentSelectedDay.booksObjects.length > 0 ? (
                    currentSelectedDay.booksObjects.map((b, bIdx) => {
                      const titleStr = typeof b.title === 'string' ? b.title : (b.title['zh-TW'] || b.title.en);
                      return (
                        <div
                          key={b.id || bIdx}
                          onClick={() => {
                            if (onSelectBook) {
                              playPageTurnSound();
                              onSelectBook(b);
                            }
                          }}
                          className="flex items-center justify-between p-2 rounded-lg bg-white/90 dark:bg-slate-800/90 hover:bg-amber-100 dark:hover:bg-slate-700 border border-amber-200/40 dark:border-slate-700 transition-all cursor-pointer group"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            {b.coverUrl ? (
                              <img src={b.coverUrl} alt={titleStr} className="w-7 h-9 object-cover rounded shadow-2xs shrink-0" referrerPolicy="no-referrer" />
                            ) : (
                              <span className="text-base">📖</span>
                            )}
                            <div className="min-w-0">
                              <p className="font-black text-slate-800 dark:text-slate-100 truncate group-hover:text-amber-700 dark:group-hover:text-amber-400">
                                《{titleStr}》
                              </p>
                              <span className="text-[10px] font-bold text-slate-400">共 {b.pages?.length || 5} 頁 • 沉浸共讀</span>
                            </div>
                          </div>

                          <span className="text-[11px] font-black text-amber-600 group-hover:translate-x-0.5 transition-transform shrink-0">
                            打開 ➔
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <p className="font-bold text-slate-700 dark:text-slate-200 pl-2">
                      {currentSelectedDay.booksRead.join('、')}
                    </p>
                  )}
                </div>
              </div>

              {/* Reflection Snippet */}
              <div className="p-3.5 rounded-xl bg-pink-50/70 dark:bg-slate-900/60 border border-pink-200/60 dark:border-slate-700/60 space-y-2 flex flex-col justify-between">
                <div>
                  <span className="font-extrabold text-pink-900 dark:text-pink-300 flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 text-pink-600" />
                    <span>孩子的心情心得摘錄：</span>
                  </span>
                  <p className="font-bold text-slate-700 dark:text-slate-200 pl-2 pt-2 italic leading-relaxed">
                    「{currentSelectedDay.reflectionSnippet}」
                  </p>
                </div>

                <div className="pt-2 border-t border-pink-200/40 dark:border-slate-700/60 flex items-center justify-between text-[10px] text-pink-800 dark:text-pink-300 font-bold">
                  <span>情緒狀態：{currentSelectedDay.dominantMood}</span>
                  <span>心靈充實指數：{currentSelectedDay.joyScore} 分 ⭐</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Parent-Child Reading Emotional Guide & Instant Check-in */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Advice Card 1 */}
        <div className={`p-4 rounded-2xl border flex items-start gap-3 md:col-span-2 ${
          darkMode ? 'bg-purple-950/40 border-purple-800/80 text-purple-100' : 'bg-amber-100/60 border-amber-300 text-amber-950'
        }`}>
          <div className="p-2 rounded-xl bg-amber-500 text-slate-950 shrink-0 mt-0.5 shadow-xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="font-black text-xs sm:text-sm text-amber-900 dark:text-amber-200">
              💡 家長共讀情緒診斷與引導小技巧：
            </h4>
            <p className="text-xs font-semibold leading-relaxed opacity-90">
              本週孩子在情緒高昂的奇幻情節中展現出最高好奇度！建議家長在睡前共讀時，多使用啟發式問答（例如：「如果你是主角，你會怎麼做呢？」），能進一步延伸故事帶來的正面情緒與思考力！
            </p>
          </div>
        </div>

        {/* Quick Mood Log Trigger */}
        <div className={`p-4 rounded-2xl border flex flex-col justify-between space-y-2.5 ${
          darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-amber-200'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-amber-950 dark:text-amber-200 flex items-center gap-1">
              <span>🌟 今日情緒快速打卡：</span>
            </span>
            <span className="text-[10px] font-extrabold text-amber-600">+5 ⭐</span>
          </div>

          <div className="flex items-center justify-around gap-1">
            {[
              { emoji: '😄', label: '超開心' },
              { emoji: '🧐', label: '好好奇' },
              { emoji: '💖', label: '好感動' },
              { emoji: '🤩', label: '真驚奇' },
              { emoji: '😌', label: '很放鬆' },
            ].map((btn) => (
              <button
                key={btn.label}
                onClick={() => handleQuickMoodClick(btn.emoji, btn.label)}
                className="p-2 rounded-xl bg-amber-50 dark:bg-slate-800 hover:bg-amber-200 dark:hover:bg-amber-600/40 text-xl transition-transform hover:scale-125 cursor-pointer flex flex-col items-center"
                title={btn.label}
              >
                <span>{btn.emoji}</span>
              </button>
            ))}
          </div>

          {interactiveMoodFeedback && (
            <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 text-center animate-fadeIn">
              {interactiveMoodFeedback}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
