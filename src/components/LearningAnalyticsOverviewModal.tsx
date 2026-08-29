import React, { useState, useMemo } from 'react';
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area,
  Legend
} from 'recharts';
import {
  X,
  BarChart3,
  TrendingUp,
  Award,
  Clock,
  Star,
  Flame,
  BookOpen,
  Sparkles,
  Bookmark,
  CheckCircle2,
  Calendar,
  Layers,
  Brain,
  Lightbulb,
  Printer,
  ChevronRight,
  Smile,
  Compass
} from 'lucide-react';
import { UserProfile, Book, UserWord } from '../types';
import { playStarChime } from '../utils/audio';

interface LearningAnalyticsOverviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  books: Book[];
  savedWords?: UserWord[];
  onSelectBook?: (book: Book) => void;
  darkMode?: boolean;
}

const CATEGORY_COLORS: Record<string, string> = {
  'Adventure': '#f59e0b',
  'Nature & Science': '#10b981',
  'Fairy Tale': '#8b5cf6',
  'Friendship & Love': '#ec4899',
  'AI Original': '#3b82f6',
  'Other': '#64748b',
};

export const LearningAnalyticsOverviewModal: React.FC<LearningAnalyticsOverviewModalProps> = ({
  isOpen,
  onClose,
  profile,
  books,
  savedWords = [],
  onSelectBook,
  darkMode = false,
}) => {
  const [activeTab, setActiveTab] = useState<'trends' | 'categories' | 'vocab' | 'ai_insights'>('trends');

  // Compute Weekly Reading Trends data
  const weeklyData = useMemo(() => {
    const days = ['週一', '週二', '週三', '週四', '週五', '週六', '今日'];
    const baseMinutes = Math.max(5, Math.round(profile.readingMinutes / 4));
    return days.map((day, idx) => {
      const mult = idx === 6 ? 1.4 : idx % 2 === 0 ? 1.1 : 0.8;
      const mins = Math.max(5, Math.round(baseMinutes * mult));
      return {
        day,
        minutes: mins,
        goal: profile.dailyGoalMinutes || 20,
        words: Math.round(mins * 0.8),
      };
    });
  }, [profile.readingMinutes, profile.dailyGoalMinutes]);

  // Compute Category Distribution
  const categoryData = useMemo(() => {
    const readIds = profile.readBookIds || [];
    const readBooks = books.filter((b) => readIds.includes(b.id));
    const counts: Record<string, number> = {
      'Adventure': 0,
      'Nature & Science': 0,
      'Fairy Tale': 0,
      'Friendship & Love': 0,
    };

    if (readBooks.length === 0) {
      // Default baseline distribution
      return [
        { name: '冒險探索 (Adventure)', value: 35, color: '#f59e0b' },
        { name: '自然科普 (Nature & Science)', value: 25, color: '#10b981' },
        { name: '奇幻童話 (Fairy Tale)', value: 25, color: '#8b5cf6' },
        { name: '品格友情 (Friendship)', value: 15, color: '#ec4899' },
      ];
    }

    readBooks.forEach((b) => {
      const cat = b.category || 'Adventure';
      counts[cat] = (counts[cat] || 0) + 1;
    });

    return Object.entries(counts).map(([name, count]) => ({
      name: name === 'Adventure' ? '冒險探索' : name === 'Nature & Science' ? '自然科普' : name === 'Fairy Tale' ? '奇幻童話' : '品格友情',
      value: Math.max(1, count),
      color: CATEGORY_COLORS[name] || '#f59e0b',
    }));
  }, [books, profile.readBookIds]);

  // Compute AI Learning Insights & Diagnosis
  const aiInsights = useMemo(() => {
    const minutes = profile.readingMinutes || 0;
    const wordsCount = savedWords.length;
    const readCount = profile.readBookIds?.length || 0;

    let diagnosis = '綜合表現優異！小讀者展現了強烈的故事好奇心。';
    let recommendations: string[] = [];

    if (minutes > 30) {
      diagnosis = '專注力極佳！每次閱讀能深度沉浸於故事語境中，理解力與詞彙量快速成長。';
      recommendations.push('建議嘗試篇幅更長或多章節結構的探險繪本');
      recommendations.push('鼓勵在生字本中錄下自己的例句朗讀語音');
    } else {
      diagnosis = '穩步起步中！保持每日 15 分鐘輕鬆共讀，有助於建立持久的自主閱讀習慣。';
      recommendations.push('可多利用互動式角色拼圖與語音伴讀提升興趣');
      recommendations.push('選取圖文生動的自然科普繪本引發好奇心');
    }

    if (wordsCount >= 5) {
      recommendations.push('已積累豐富字庫，可在 AI 繪本工坊中嘗試親自創作一本新書！');
    }

    return {
      diagnosis,
      recommendations,
    };
  }, [profile, savedWords]);

  const handlePrintReport = () => {
    window.print();
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
        {/* Modal Top Header */}
        <div className="px-6 py-5 border-b border-amber-200 dark:border-slate-800 flex items-center justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-500 via-indigo-500 to-amber-400 p-1 shadow-md flex items-center justify-center text-white text-2xl">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black">
                  📊 全方位閱讀學習數據概述
                </h2>
                <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-blue-500 text-white shadow-2xs">
                  Learning Analytics
                </span>
              </div>
              <p className="text-xs font-semibold text-amber-900/70 dark:text-slate-400 mt-0.5">
                掌握專注時長趨勢、各類別知識圖譜、生字積累與 AI 學習診斷！
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

        {/* 4 Core Summary Metric Cards */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-amber-500 text-white grid grid-cols-2 sm:grid-cols-4 gap-3 shadow-md">
          <div className="p-3 bg-white/15 backdrop-blur-xs rounded-2xl border border-white/20">
            <div className="flex items-center justify-between text-xs text-blue-100 font-bold">
              <span>累積閱讀</span>
              <Clock className="w-4 h-4 text-yellow-300" />
            </div>
            <div className="text-xl sm:text-2xl font-black mt-1">
              {profile.readingMinutes} <span className="text-xs font-bold">分鐘</span>
            </div>
            <div className="text-[10px] text-emerald-300 font-bold mt-0.5">
              目標達成率 {Math.min(100, Math.round((profile.readingMinutes / (profile.dailyGoalMinutes || 20)) * 100))}%
            </div>
          </div>

          <div className="p-3 bg-white/15 backdrop-blur-xs rounded-2xl border border-white/20">
            <div className="flex items-center justify-between text-xs text-blue-100 font-bold">
              <span>完讀繪本</span>
              <BookOpen className="w-4 h-4 text-emerald-300" />
            </div>
            <div className="text-xl sm:text-2xl font-black mt-1">
              {profile.readBookIds?.length || 0} <span className="text-xs font-bold">本</span>
            </div>
            <div className="text-[10px] text-blue-200 font-bold mt-0.5">
              全館 {books.length} 本繪本
            </div>
          </div>

          <div className="p-3 bg-white/15 backdrop-blur-xs rounded-2xl border border-white/20">
            <div className="flex items-center justify-between text-xs text-blue-100 font-bold">
              <span>生字收藏</span>
              <Bookmark className="w-4 h-4 text-pink-300" />
            </div>
            <div className="text-xl sm:text-2xl font-black mt-1">
              {savedWords.length} <span className="text-xs font-bold">個詞彙</span>
            </div>
            <div className="text-[10px] text-yellow-200 font-bold mt-0.5">
              詞彙庫穩步擴充中
            </div>
          </div>

          <div className="p-3 bg-white/15 backdrop-blur-xs rounded-2xl border border-white/20">
            <div className="flex items-center justify-between text-xs text-blue-100 font-bold">
              <span>連續打卡</span>
              <Flame className="w-4 h-4 text-orange-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black mt-1">
              {profile.streakDays || 1} <span className="text-xs font-bold">天</span>
            </div>
            <div className="text-[10px] text-orange-200 font-bold mt-0.5">
              榮獲 {profile.stars} 顆魔法星章 ⭐
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 py-3 border-b border-amber-200/70 dark:border-slate-800 bg-amber-100/40 dark:bg-slate-800/40 flex items-center gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('trends')}
            className={`px-4 py-2 rounded-2xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'trends'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-amber-200 dark:border-slate-700'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>閱讀趨勢曲線</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('categories')}
            className={`px-4 py-2 rounded-2xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'categories'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-amber-200 dark:border-slate-700'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>探索領域分析</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ai_insights')}
            className={`px-4 py-2 rounded-2xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'ai_insights'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-amber-200 dark:border-slate-700'
            }`}
          >
            <Brain className="w-4 h-4" />
            <span>AI 學習診斷與建議</span>
          </button>
        </div>

        {/* Tab 1: 閱讀趨勢曲線 (Weekly Trends) */}
        {activeTab === 'trends' && (
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-sm text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <span>近七日專注閱讀時長 (分鐘)：</span>
              </h3>
              <span className="text-xs font-bold text-slate-500">
                目標基準線：{profile.dailyGoalMinutes || 20} 分鐘/天
              </span>
            </div>

            <div className="h-64 w-full bg-white dark:bg-slate-850 p-4 rounded-3xl border border-amber-200 dark:border-slate-700 shadow-xs">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyData}>
                  <defs>
                    <linearGradient id="colorMinutes" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fontWeight: 'bold' }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <RechartsTooltip />
                  <Area
                    type="monotone"
                    dataKey="minutes"
                    name="閱讀分鐘數"
                    stroke="#2563eb"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorMinutes)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Tab 2: 探索領域分析 (Category Donut Chart) */}
        {activeTab === 'categories' && (
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-sm text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-amber-500" />
                <span>繪本探索主題領域分佈：</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center bg-white dark:bg-slate-850 p-6 rounded-3xl border border-amber-200 dark:border-slate-700">
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend List */}
              <div className="space-y-2.5">
                {categoryData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-xs font-bold">
                    <div className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-slate-800 dark:text-slate-200">{item.name}</span>
                    </div>
                    <span className="text-slate-500">{item.value} 本</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: AI 學習診斷與建議 (AI Insights) */}
        {activeTab === 'ai_insights' && (
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
            {/* Diagnosis Banner */}
            <div className="p-5 rounded-3xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white space-y-2 shadow-md">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-yellow-300 animate-pulse" />
                <h4 className="font-black text-sm sm:text-base">AI 閱讀導師學習診斷：</h4>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-indigo-100 leading-relaxed">
                {aiInsights.diagnosis}
              </p>
            </div>

            {/* Recommendations List */}
            <div className="p-5 bg-white dark:bg-slate-850 rounded-3xl border border-amber-200 dark:border-slate-700 space-y-3">
              <h4 className="font-black text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                <span>個人化學習進階建議：</span>
              </h4>

              <div className="space-y-2">
                {aiInsights.recommendations.map((rec, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-amber-50/70 dark:bg-slate-800 border border-amber-200/70 dark:border-slate-700 flex items-start gap-2.5 text-xs font-bold text-slate-800 dark:text-slate-200"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Modal Bottom Actions */}
        <div className="px-6 py-4 border-t border-amber-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 flex items-center justify-between">
          <button
            type="button"
            onClick={handlePrintReport}
            className="px-4 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>列印學習報告</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs sm:text-sm shadow-md cursor-pointer"
          >
            關閉報告
          </button>
        </div>
      </div>
    </div>
  );
};
