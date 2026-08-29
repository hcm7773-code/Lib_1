import React, { useEffect, useState } from 'react';
import {
  Trophy,
  Star,
  Sparkles,
  X,
  TrendingUp,
  Wand2,
  Calendar,
  Flame,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Activity,
  Lightbulb,
  Award,
  RefreshCw,
  Clock,
  Zap,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ReferenceLine,
} from 'recharts';
import { playStarChime } from '../utils/audio';

export interface DailyReadingRecord {
  day: string;
  date: string;
  minutes: number;
  target: number;
  booksRead: number;
}

interface GoalCelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  goalMinutes: number;
  currentMinutes: number;
  bonusStarsAwarded: number;
  darkMode?: boolean;
  weeklyReadingData?: DailyReadingRecord[];
  onNavigateToCreator?: (promptSuggestion?: string) => void;
}

export const GoalCelebrationModal: React.FC<GoalCelebrationModalProps> = ({
  isOpen,
  onClose,
  goalMinutes,
  currentMinutes,
  bonusStarsAwarded,
  darkMode = false,
  weeklyReadingData,
  onNavigateToCreator,
}) => {
  const [activeModalTab, setActiveModalTab] = useState<'celebration' | 'analytics' | 'ai_assistant'>('celebration');
  const [particles, setParticles] = useState<Array<{ id: number; emoji: string; left: number; top: number; size: number; duration: number; delay: number }>>([]);

  // AI Assistant Tab States
  const [aiHero, setAiHero] = useState('小熊勇士');
  const [aiTheme, setAiTheme] = useState('尋找極光城堡');
  const [aiArtStyle, setAiArtStyle] = useState('溫馨水彩繪本');
  const [customPromptInput, setCustomPromptInput] = useState('');

  const sampleAiIdeas = [
    {
      title: '🚀 機器人柴柴與極光冒險',
      prompt: '一隻會飛的小柴犬機器人，陪伴小朋友穿越星際，尋找閃耀極光能量晶石的故事',
      style: '溫馨水彩繪本',
      category: '科幻冒險',
    },
    {
      title: '🏰 魔法森林裡的彩色點心屋',
      prompt: '小兔子廚師在魔法森林裡烤出能實現願望的七彩馬卡龍蛋糕，與動物夥伴分享快樂',
      style: '黏土手作風格',
      category: '童話魔法',
    },
    {
      title: '🐳 深海歌唱家與璀璨水母王國',
      prompt: '一隻害羞的小藍鯨在奇幻深海宮殿舉辦音樂會，幫助大家找回美好的音樂靈魂',
      style: '卡通動畫風格',
      category: '海洋探險',
    },
    {
      title: '🦕 恐龍島上的友情大運動會',
      prompt: '小暴龍和小長頸龍在火山島上互相鼓勵、合作完成越野接力賽的感動友情繪本',
      style: '剪紙與童話風',
      category: '品格成長',
    },
  ];

  useEffect(() => {
    if (isOpen) {
      playStarChime();

      // Generate floating confetti particles
      const emojis = ['🌸', '🌟', '🎉', '✨', '🎊', '🏅', '🚀', '💎', '⭐', '🎈'];
      const generated = Array.from({ length: 40 }).map((_, i) => ({
        id: i,
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
        left: Math.random() * 100,
        top: -10 - Math.random() * 20,
        size: 20 + Math.random() * 28,
        duration: 2.5 + Math.random() * 2.5,
        delay: Math.random() * 0.8,
      }));
      setParticles(generated);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Prepare 7-day trend chart data
  const chartData: DailyReadingRecord[] = weeklyReadingData && weeklyReadingData.length === 7
    ? weeklyReadingData
    : [
        { day: '週一', date: '08/03', minutes: 12, target: goalMinutes, booksRead: 1 },
        { day: '週二', date: '08/04', minutes: 18, target: goalMinutes, booksRead: 2 },
        { day: '週三', date: '08/05', minutes: 15, target: goalMinutes, booksRead: 1 },
        { day: '週四', date: '08/06', minutes: 22, target: goalMinutes, booksRead: 2 },
        { day: '週五', date: '08/07', minutes: 20, target: goalMinutes, booksRead: 2 },
        { day: '週六', date: '08/08', minutes: 30, target: goalMinutes, booksRead: 3 },
        { day: '週日', date: '08/09', minutes: Math.max(currentMinutes, 15), target: goalMinutes, booksRead: 2 },
      ];

  const totalWeeklyMinutes = chartData.reduce((acc, curr) => acc + curr.minutes, 0);
  const avgDailyMinutes = Math.round(totalWeeklyMinutes / chartData.length);
  const bestDayRecord = [...chartData].sort((a, b) => b.minutes - a.minutes)[0];
  const totalBooksReadWeek = chartData.reduce((acc, curr) => acc + curr.booksRead, 0);

  // Custom Tooltip for Recharts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/95 text-white p-3 rounded-2xl shadow-xl border border-amber-400/50 text-xs space-y-1 backdrop-blur-md">
          <p className="font-extrabold text-amber-300 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>{label} ({payload[0]?.payload?.date}) 閱讀統計</span>
          </p>
          <div className="space-y-0.5 font-medium text-[11px]">
            <p className="text-emerald-400 flex items-center justify-between gap-3">
              <span>📚 閱讀時間：</span>
              <span className="font-black text-sm">{payload[0]?.value} 分鐘</span>
            </p>
            {payload[1] && (
              <p className="text-amber-300/80 flex items-center justify-between gap-3">
                <span>🎯 設定目標：</span>
                <span className="font-bold">{payload[1]?.value} 分鐘</span>
              </p>
            )}
            {payload[0]?.payload?.booksRead !== undefined && (
              <p className="text-slate-300 flex items-center justify-between gap-3 pt-0.5 border-t border-slate-700">
                <span>📖 完讀繪本：</span>
                <span className="font-bold text-amber-300">{payload[0].payload.booksRead} 本</span>
              </p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  const handleApplyAiPrompt = (promptText: string) => {
    if (onNavigateToCreator) {
      onNavigateToCreator(promptText);
    }
    onClose();
  };

  const generatedCompositePrompt = customPromptInput.trim()
    || `${aiHero}${aiTheme}，包含友情與勇敢成長的故事，請以${aiArtStyle}繪製精美繪本`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md animate-fadeIn overflow-y-auto">
      {/* Falling Flowers & Confetti Canvas Overlay (only on celebration tab) */}
      {activeModalTab === 'celebration' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {particles.map((p) => (
            <div
              key={p.id}
              className="absolute animate-fallAndSpin"
              style={{
                left: `${p.left}%`,
                top: `${p.top}%`,
                fontSize: `${p.size}px`,
                animationDuration: `${p.duration}s`,
                animationDelay: `${p.delay}s`,
                animationIterationCount: 'infinite',
              }}
            >
              {p.emoji}
            </div>
          ))}
        </div>
      )}

      {/* Main Expansion Card */}
      <div
        className={`relative w-full max-w-2xl rounded-3xl p-5 sm:p-7 shadow-2xl border-4 transition-all animate-scaleUp z-10 my-auto ${
          darkMode
            ? 'bg-slate-900 border-amber-400/80 text-slate-100'
            : 'bg-gradient-to-b from-amber-50 via-orange-50/50 to-yellow-50 border-amber-400 text-amber-950'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-2 rounded-full transition-colors z-20 ${
            darkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-amber-200 text-amber-800'
          }`}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header Tabs */}
        <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-6 border-b border-amber-200/80 pb-3 pr-8">
          <button
            type="button"
            onClick={() => setActiveModalTab('celebration')}
            className={`px-3 sm:px-4 py-2 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-1.5 transition-all ${
              activeModalTab === 'celebration'
                ? 'bg-orange-500 text-white shadow-md scale-105'
                : 'bg-amber-100/80 text-amber-900 hover:bg-amber-200/80'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>達標榮譽牆</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveModalTab('analytics')}
            className={`px-3 sm:px-4 py-2 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-1.5 transition-all ${
              activeModalTab === 'analytics'
                ? 'bg-emerald-600 text-white shadow-md scale-105'
                : 'bg-amber-100/80 text-amber-900 hover:bg-amber-200/80'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>閱讀趨勢分析</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveModalTab('ai_assistant')}
            className={`px-3 sm:px-4 py-2 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-1.5 transition-all ${
              activeModalTab === 'ai_assistant'
                ? 'bg-purple-600 text-white shadow-md scale-105'
                : 'bg-amber-100/80 text-amber-900 hover:bg-amber-200/80'
            }`}
          >
            <Wand2 className="w-4 h-4" />
            <span>繪本創作 AI 助手</span>
          </button>
        </div>

        {/* TAB 1: CELEBRATION & REWARDS */}
        {activeModalTab === 'celebration' && (
          <div className="text-center space-y-5 animate-fadeIn">
            {/* Pulsing Trophy Badge */}
            <div className="relative mx-auto w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 blur-lg opacity-70 animate-pulse" />
              <div className="relative w-full h-full rounded-full bg-gradient-to-br from-amber-300 via-yellow-400 to-orange-500 p-1 shadow-2xl flex items-center justify-center border-4 border-white animate-bounce">
                <Trophy className="w-14 h-14 sm:w-16 sm:h-16 text-white drop-shadow-md" />
              </div>
              <div className="absolute -top-1 -right-1 bg-rose-500 text-white p-1.5 rounded-full text-xs font-black shadow-lg animate-spin">
                ✨
              </div>
            </div>

            {/* Title & Celebration Text */}
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500 text-white font-black text-xs shadow-md">
                <Sparkles className="w-3.5 h-3.5" />
                <span>每日閱讀達標成就解鎖！</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-orange-600 dark:text-orange-400">
                🎉 太棒了！目標達成！
              </h2>

              <p className="text-xs sm:text-sm font-bold opacity-90 leading-relaxed max-w-md mx-auto">
                今天已順利完成 <span className="text-amber-600 dark:text-amber-400 font-extrabold text-base">{currentMinutes}</span> 分鐘繪本朗讀！達到你設定的 {goalMinutes} 分鐘每日目標！
              </p>
            </div>

            {/* Automatic Bonus Stars Reward Box */}
            <div className="p-4 rounded-2xl bg-white/90 dark:bg-slate-800/90 border-2 border-amber-300 dark:border-amber-500/50 shadow-lg space-y-2">
              <span className="text-xs font-black text-amber-800 dark:text-amber-300 block">
                🎁 每日自動發放額外達標獎勵：
              </span>
              <div className="flex items-center justify-center gap-3">
                <div className="flex items-center gap-1.5 text-2xl sm:text-3xl font-black text-amber-500">
                  <Star className="w-7 h-7 fill-amber-400 text-amber-500 animate-spin" />
                  <span>+{bonusStarsAwarded}</span>
                </div>
                <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-3 py-1 rounded-full border border-emerald-300">
                  童星直接入帳 🌟
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setActiveModalTab('analytics')}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-amber-200/90 hover:bg-amber-300/90 text-amber-950 font-black text-xs shadow-sm transition-transform hover:scale-105"
              >
                <TrendingUp className="w-4 h-4 text-emerald-700" />
                <span>查看週閱讀曲線圖</span>
              </button>

              <button
                onClick={onClose}
                className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-black text-xs sm:text-sm shadow-xl transform hover:scale-105 transition-transform"
              >
                <span>收下獎勵星星</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: READING TREND ANALYTICS (RECHARTS) */}
        {activeModalTab === 'analytics' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-amber-200/80 pb-2">
              <div>
                <h3 className="font-black text-base sm:text-lg text-emerald-900 dark:text-emerald-400 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-emerald-600" />
                  <span>過去一週每日閱讀分鐘數趨勢</span>
                </h3>
                <p className="text-xs font-bold text-amber-800/80 dark:text-amber-200/70">
                  協助孩童長期追蹤每日學習專注時間與達成率
                </p>
              </div>

              <span className="text-xs font-black bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-3 py-1 rounded-full border border-emerald-300">
                本週累積 {totalWeeklyMinutes} 分鐘
              </span>
            </div>

            {/* Recharts LineChart Canvas */}
            <div className="bg-white/90 dark:bg-slate-800/90 p-4 rounded-2xl border-2 border-emerald-200 dark:border-emerald-700 shadow-inner space-y-2">
              <div className="h-60 sm:h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 15, right: 20, left: -15, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="day" tick={{ fontSize: 12, fontWeight: 700, fill: '#475569' }} />
                    <YAxis tick={{ fontSize: 11, fontWeight: 600, fill: '#64748b' }} unit="分" />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 12, fontWeight: 700, paddingTop: 10 }} />
                    <ReferenceLine y={goalMinutes} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: '目標線', fill: '#d97706', fontSize: 10, fontWeight: 800, position: 'top' }} />
                    <Line
                      type="monotone"
                      dataKey="minutes"
                      name="實際閱讀分鐘"
                      stroke="#10b981"
                      strokeWidth={3}
                      dot={{ r: 5, fill: '#059669', strokeWidth: 2, stroke: '#ffffff' }}
                      activeDot={{ r: 8, fill: '#047857' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="target"
                      name="每日目標分鐘"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="flex justify-between items-center text-[11px] text-slate-500 dark:text-slate-400 font-bold px-1">
                <span>🟢 綠線：每日實際閱讀分鐘</span>
                <span>🟡 虛線：設定每日目標時間 ({goalMinutes} 分)</span>
              </div>
            </div>

            {/* Weekly Analytics Summary Grid */}
            <div className="grid grid-cols-3 gap-2.5">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 rounded-xl border border-emerald-200 text-center">
                <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 block">日平均閱讀</span>
                <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">{avgDailyMinutes} 分鐘</span>
              </div>
              <div className="p-3 bg-amber-50 dark:bg-amber-950/60 rounded-xl border border-amber-200 text-center">
                <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300 block">最佳單日表現</span>
                <span className="text-lg font-black text-amber-600 dark:text-amber-400">{bestDayRecord.day} ({bestDayRecord.minutes}分)</span>
              </div>
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/60 rounded-xl border border-indigo-200 text-center">
                <span className="text-[10px] font-bold text-indigo-800 dark:text-indigo-300 block">本週閱讀繪本</span>
                <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">{totalBooksReadWeek} 本完讀</span>
              </div>
            </div>

            {/* AI Encouragement Feedback Box */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md flex items-start gap-3">
              <Sparkles className="w-5 h-5 shrink-0 mt-0.5 text-amber-300 animate-spin" />
              <div className="space-y-0.5">
                <h4 className="font-extrabold text-xs text-amber-200">AI 學習成就分析語錄</h4>
                <p className="text-xs font-semibold leading-relaxed">
                  太厲害了！本週閱讀專注度比上週提升 25%，連續 7 天都達到或超越目標！繼續保持這個良好的天天閱讀習慣吧！
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: AI STORY CREATION ASSISTANT */}
        {activeModalTab === 'ai_assistant' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-amber-200/80 pb-2">
              <div>
                <h3 className="font-black text-base sm:text-lg text-purple-900 dark:text-purple-300 flex items-center gap-2">
                  <Wand2 className="w-5 h-5 text-purple-600" />
                  <span>繪本創作 AI 靈感助手</span>
                </h3>
                <p className="text-xs font-bold text-amber-800/80 dark:text-amber-200/70">
                  為孩童量身發想原創繪本靈感，可一鍵直接轉跳至 AI 創作工坊
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  const heroes = ['神奇小貓', '星際小熊', '極光小鹿', '魔法小浣熊', '潛水小鯨魚'];
                  const themes = ['探索失落魔法島', '學會勇敢面對黑夜', '舉辦音樂派對', '發明超級飛行車'];
                  const styles = ['溫馨水彩繪本', '黏土手作風格', '剪紙與童話風', '經典卡通風格'];
                  setAiHero(heroes[Math.floor(Math.random() * heroes.length)]);
                  setAiTheme(themes[Math.floor(Math.random() * themes.length)]);
                  setAiArtStyle(styles[Math.floor(Math.random() * styles.length)]);
                }}
                className="flex items-center gap-1 bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 px-3 py-1 rounded-full text-xs font-black border border-purple-300 hover:bg-purple-200 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>🎲 隨機換靈感</span>
              </button>
            </div>

            {/* Preset AI Idea Cards */}
            <div className="space-y-2">
              <label className="text-xs font-black text-amber-950 dark:text-amber-100 flex items-center gap-1">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                <span>推薦孩子的最愛故事靈感卡：</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-48 overflow-y-auto pr-1 scrollbar-none">
                {sampleAiIdeas.map((idea, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-white/90 dark:bg-slate-800/90 rounded-2xl border-2 border-purple-200 dark:border-purple-800 hover:border-purple-500 transition-all shadow-2xs space-y-2 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <h4 className="font-extrabold text-xs text-purple-950 dark:text-purple-200">{idea.title}</h4>
                        <span className="text-[9px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 px-1.5 py-0.2 rounded-md">
                          {idea.category}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-600 dark:text-slate-300 font-medium leading-relaxed mt-1 line-clamp-2">
                        {idea.prompt}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleApplyAiPrompt(idea.prompt)}
                      className="w-full py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-black flex items-center justify-center gap-1 shadow-2xs transition-transform active:scale-95"
                    >
                      <Sparkles className="w-3 h-3 text-amber-300" />
                      <span>一鍵帶入 AI 創作工坊</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Custom Interactive Prompt Builder */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-50 via-pink-50 to-amber-50 dark:from-purple-950/60 dark:to-slate-900 border-2 border-purple-300 dark:border-purple-700 space-y-3">
              <span className="text-xs font-black text-purple-950 dark:text-purple-200 block">
                ✍️ 自由組合專屬 AI 創作 Prompt：
              </span>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] font-extrabold text-purple-900 dark:text-purple-300 block mb-1">故事主角</label>
                  <input
                    type="text"
                    value={aiHero}
                    onChange={(e) => setAiHero(e.target.value)}
                    className="w-full p-2 bg-white dark:bg-slate-800 rounded-xl border border-purple-200 text-xs font-bold text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-extrabold text-purple-900 dark:text-purple-300 block mb-1">冒險主題</label>
                  <input
                    type="text"
                    value={aiTheme}
                    onChange={(e) => setAiTheme(e.target.value)}
                    className="w-full p-2 bg-white dark:bg-slate-800 rounded-xl border border-purple-200 text-xs font-bold text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-extrabold text-purple-900 dark:text-purple-300 block mb-1">美術畫風</label>
                  <select
                    value={aiArtStyle}
                    onChange={(e) => setAiArtStyle(e.target.value)}
                    className="w-full p-2 bg-white dark:bg-slate-800 rounded-xl border border-purple-200 text-xs font-bold text-slate-900 dark:text-slate-100"
                  >
                    <option value="溫馨水彩繪本">🎨 溫馨水彩畫</option>
                    <option value="黏土手作風格">🧸 黏土手作風</option>
                    <option value="剪紙與童話風">✂️ 夢幻剪紙風</option>
                    <option value="卡通動畫風格">🌟 經典卡通風</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-extrabold text-purple-900 dark:text-purple-300 block mb-1">
                  生成靈感預覽（可直接修改）：
                </label>
                <textarea
                  rows={2}
                  value={generatedCompositePrompt}
                  onChange={(e) => setCustomPromptInput(e.target.value)}
                  className="w-full p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-purple-300 text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>

              <button
                type="button"
                onClick={() => handleApplyAiPrompt(generatedCompositePrompt)}
                className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-black text-xs sm:text-sm shadow-lg flex items-center justify-center gap-2 transform hover:scale-[1.02] transition-all"
              >
                <Wand2 className="w-4 h-4 text-amber-300" />
                <span>立即開啟 AI 繪本工坊並生成此故事</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
