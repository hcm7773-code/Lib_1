import React, { useState, useMemo } from 'react';
import {
  Activity,
  Award,
  Sparkles,
  Zap,
  Clock,
  BookOpen,
  Smile,
  Heart,
  Compass,
  RotateCcw,
  Sliders,
  TrendingUp,
  Brain,
  ShieldCheck,
  CheckCircle2,
  Info,
  ChevronRight,
  Flame,
  Star,
  Layers,
  Volume2
} from 'lucide-react';
import { Book, UserProfile } from '../types';
import { calculateReadingFocusProfile } from '../utils/readingFocusAnalytics';
import { playStarChime, playPageTurnSound, speakText } from '../utils/audio';

interface ReadingFocusRadarPanelProps {
  books: Book[];
  userProfile?: UserProfile;
  onSelectBook?: (book: Book) => void;
  onClose?: () => void;
  darkMode?: boolean;
}

export const ReadingFocusRadarPanel: React.FC<ReadingFocusRadarPanelProps> = ({
  books,
  userProfile,
  onSelectBook,
  onClose,
  darkMode = false,
}) => {
  const [selectedCategoryKey, setSelectedCategoryKey] = useState<string>('Adventure');
  const [showEmotionLayer, setShowEmotionLayer] = useState<boolean>(true);
  const [showPaceLayer, setShowPaceLayer] = useState<boolean>(true);
  const [showBenchmarkLayer, setShowBenchmarkLayer] = useState<boolean>(false);
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);

  // Bonus Star Claim State
  const [hasClaimedBonus, setHasClaimedBonus] = useState<boolean>(() => {
    return localStorage.getItem('pwa_claimed_focus_radar_bonus') === 'true';
  });

  // Calculate data from analytics engine
  const profileData = useMemo(() => {
    return calculateReadingFocusProfile(books, userProfile);
  }, [books, userProfile]);

  const metrics = profileData.categoryMetrics;
  const numAxes = metrics.length;
  const radius = 110;
  const center = 150; // Canvas size 300x300

  // Generate radar polygon points
  const getRadarCoordinates = (scores: number[], scale = 1.0) => {
    return scores
      .map((score, i) => {
        const angle = (Math.PI * 2 * i) / numAxes - Math.PI / 2;
        const normalizedScore = (score / 100) * radius * scale;
        const x = center + normalizedScore * Math.cos(angle);
        const y = center + normalizedScore * Math.sin(angle);
        return `${x},${y}`;
      })
      .join(' ');
  };

  const focusPoints = getRadarCoordinates(metrics.map((m) => m.focusScore));
  const emotionPoints = getRadarCoordinates(metrics.map((m) => m.emotionEngagement));
  const pacePoints = getRadarCoordinates(metrics.map((m) => m.pageTurnPaceScore));
  const benchmarkPoints = getRadarCoordinates(metrics.map(() => 75)); // Peer avg benchmark

  const activeCategory = metrics.find((m) => m.category === selectedCategoryKey) || metrics[0];

  const handleClaimBonus = () => {
    if (hasClaimedBonus) return;
    playStarChime();
    setHasClaimedBonus(true);
    localStorage.setItem('pwa_claimed_focus_radar_bonus', 'true');
    try {
      const p = JSON.parse(localStorage.getItem('pwa_user_profile') || '{}');
      p.stars = (p.stars || 15) + 30;
      localStorage.setItem('pwa_user_profile', JSON.stringify(p));
    } catch (e) {
      console.error(e);
    }
  };

  const handleSpeakTraitDiagnosis = () => {
    playStarChime();
    const text = `專注力分析報告：你的閱讀特質是【${profileData.dominantTrait}】。在${profileData.dominantCategory}繪本中展現出極高的專注度！翻頁節奏穩定，情緒沉浸深刻。太棒了，繼續保持！`;
    speakText(text, 'zh-TW');
  };

  return (
    <div className="space-y-6 animate-fadeIn select-none" id="reading-focus-radar-root">
      
      {/* 🌟 Top Summary & Dominant Persona Card */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-amber-500/20 via-orange-500/15 to-purple-500/20 border-2 border-amber-400/50 shadow-xl relative overflow-hidden backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
          <div className="flex items-start gap-4">
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 text-slate-950 shadow-lg shrink-0">
              <Activity className="w-8 h-8 animate-pulse" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-amber-400/30 text-amber-300 border border-amber-400/40">
                  🎯 智慧閱讀成就分析
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-purple-400/30 text-purple-200 border border-purple-400/40">
                  情緒與翻頁頻率多維運算
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-amber-200 tracking-tight flex items-center gap-2">
                <span>孩子專注力特質：{profileData.dominantTrait}</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed max-w-xl">
                {profileData.dominantTraitDesc}
              </p>
            </div>
          </div>

          {/* Overall Focus Index Dial & Actions */}
          <div className="flex items-center gap-4 shrink-0 bg-slate-950/60 p-3.5 rounded-2xl border border-amber-400/30">
            <div className="text-center">
              <div className="text-[10px] font-extrabold text-slate-400">總體專注指數</div>
              <div className="text-2xl sm:text-3xl font-black text-amber-400">
                {profileData.overallFocusIndex}
                <span className="text-xs text-slate-400 font-bold ml-0.5">/100</span>
              </div>
              <div className="text-[9px] font-black text-emerald-400">極佳沉浸狀態</div>
            </div>

            <div className="h-10 w-px bg-slate-700" />

            <div className="flex flex-col gap-1.5">
              <button
                onClick={handleSpeakTraitDiagnosis}
                className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-black border border-amber-400/40 flex items-center gap-1.5 transition-transform hover:scale-105 cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>AI 語音解讀</span>
              </button>

              {!hasClaimedBonus ? (
                <button
                  onClick={handleClaimBonus}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-xs font-black shadow-md flex items-center gap-1.5 animate-bounce cursor-pointer"
                >
                  <Star className="w-3.5 h-3.5 fill-slate-950" />
                  <span>領取 30 星星獎勵</span>
                </button>
              ) : (
                <span className="px-3 py-1.5 rounded-xl bg-emerald-950/80 text-emerald-300 text-[10px] font-black border border-emerald-500/40 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>已領取專注徽章</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 📊 Main Content: Radar Chart & Category Deep Dive */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 6 Cols: Interactive Radar Visualization */}
        <div className="lg:col-span-6 p-5 sm:p-6 rounded-3xl bg-slate-950/80 border border-slate-700 shadow-xl space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-amber-400" />
              <h4 className="font-extrabold text-sm sm:text-base text-amber-200">
                六維繪本專注傾向雷達圖
              </h4>
            </div>
            <span className="text-[10px] font-bold text-slate-400">
              點擊頂點切換詳細分析
            </span>
          </div>

          {/* Layer Toggles */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setShowEmotionLayer(!showEmotionLayer)}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-black flex items-center gap-1 border transition-all ${
                showEmotionLayer
                  ? 'bg-purple-950 text-purple-300 border-purple-400 shadow-xs'
                  : 'bg-slate-900 text-slate-500 border-slate-700'
              }`}
            >
              <Smile className="w-3 h-3" />
              <span>情緒共鳴層</span>
            </button>

            <button
              onClick={() => setShowPaceLayer(!showPaceLayer)}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-black flex items-center gap-1 border transition-all ${
                showPaceLayer
                  ? 'bg-cyan-950 text-cyan-300 border-cyan-400 shadow-xs'
                  : 'bg-slate-900 text-slate-500 border-slate-700'
              }`}
            >
              <Clock className="w-3 h-3" />
              <span>翻頁節奏層</span>
            </button>

            <button
              onClick={() => setShowBenchmarkLayer(!showBenchmarkLayer)}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-black flex items-center gap-1 border transition-all ${
                showBenchmarkLayer
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-400 shadow-xs'
                  : 'bg-slate-900 text-slate-500 border-slate-700'
              }`}
            >
              <ShieldCheck className="w-3 h-3" />
              <span>年齡平均常模</span>
            </button>
          </div>

          {/* SVG Radar Chart */}
          <div className="flex justify-center items-center py-2 relative">
            <svg width={300} height={300} className="overflow-visible select-none">
              <defs>
                <radialGradient id="radarGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.02" />
                </radialGradient>
                <linearGradient id="focusFillGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#FB923C" stopOpacity="0.2" />
                </linearGradient>
              </defs>

              {/* Concentric Polygons (Grid rings at 25%, 50%, 75%, 100%) */}
              {[0.25, 0.5, 0.75, 1.0].map((scale, sIdx) => {
                const ringPoints = getRadarCoordinates(metrics.map(() => 100), scale);
                return (
                  <polygon
                    key={sIdx}
                    points={ringPoints}
                    fill={sIdx === 3 ? 'url(#radarGlow)' : 'transparent'}
                    stroke="#334155"
                    strokeWidth={sIdx === 3 ? '1.5' : '1'}
                    strokeDasharray={sIdx === 3 ? 'none' : '3,3'}
                  />
                );
              })}

              {/* Axis Lines radiating from center */}
              {metrics.map((_, i) => {
                const angle = (Math.PI * 2 * i) / numAxes - Math.PI / 2;
                const x2 = center + radius * Math.cos(angle);
                const y2 = center + radius * Math.sin(angle);
                return (
                  <line
                    key={i}
                    x1={center}
                    y1={center}
                    x2={x2}
                    y2={y2}
                    stroke="#475569"
                    strokeWidth="1"
                  />
                );
              })}

              {/* Layer 3: Peer Benchmark (Optional) */}
              {showBenchmarkLayer && (
                <polygon
                  points={benchmarkPoints}
                  fill="transparent"
                  stroke="#10B981"
                  strokeWidth="1.5"
                  strokeDasharray="4,4"
                  opacity={0.8}
                />
              )}

              {/* Layer 2: Pace Layer (Optional) */}
              {showPaceLayer && (
                <polygon
                  points={pacePoints}
                  fill="#06B6D415"
                  stroke="#06B6D4"
                  strokeWidth="1.8"
                  opacity={0.85}
                />
              )}

              {/* Layer 1: Emotion Layer (Optional) */}
              {showEmotionLayer && (
                <polygon
                  points={emotionPoints}
                  fill="#A855F715"
                  stroke="#A855F7"
                  strokeWidth="2"
                  strokeDasharray="3,2"
                />
              )}

              {/* Main Focus Radar Area */}
              <polygon
                points={focusPoints}
                fill="url(#focusFillGrad)"
                stroke="#F59E0B"
                strokeWidth="2.5"
                className="transition-all duration-500 filter drop-shadow-md"
              />

              {/* Vertices and Interactive Labels */}
              {metrics.map((m, i) => {
                const angle = (Math.PI * 2 * i) / numAxes - Math.PI / 2;
                const normalizedScore = (m.focusScore / 100) * radius;
                const vx = center + normalizedScore * Math.cos(angle);
                const vy = center + normalizedScore * Math.sin(angle);

                // Outer Label Position
                const labelRadius = radius + 26;
                const lx = center + labelRadius * Math.cos(angle);
                const ly = center + labelRadius * Math.sin(angle);

                const isSelected = selectedCategoryKey === m.category;
                const isHovered = hoveredPointIndex === i;

                return (
                  <g
                    key={m.category}
                    className="cursor-pointer group"
                    onClick={() => {
                      setSelectedCategoryKey(m.category);
                      playPageTurnSound();
                    }}
                    onMouseEnter={() => setHoveredPointIndex(i)}
                    onMouseLeave={() => setHoveredPointIndex(null)}
                  >
                    {/* Vertex Dot */}
                    <circle
                      cx={vx}
                      cy={vy}
                      r={isSelected || isHovered ? 6 : 4}
                      fill={m.color}
                      stroke="#FFFFFF"
                      strokeWidth="2"
                      className="transition-all duration-300"
                    />

                    {/* Outer Label Pill */}
                    <foreignObject
                      x={lx - 44}
                      y={ly - 14}
                      width={88}
                      height={28}
                      className="overflow-visible"
                    >
                      <div
                        className={`text-center py-0.5 px-1.5 rounded-lg text-[10px] font-black whitespace-nowrap transition-all border shadow-xs flex items-center justify-center gap-0.5 ${
                          isSelected
                            ? 'bg-amber-500 text-slate-950 border-amber-300 scale-110 ring-2 ring-amber-400/50'
                            : 'bg-slate-900/90 text-slate-300 border-slate-700 hover:border-amber-400'
                        }`}
                      >
                        <span>{m.icon}</span>
                        <span>{m.categoryLabel}</span>
                      </div>
                    </foreignObject>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Legend Badges */}
          <div className="flex items-center justify-center gap-4 text-[10px] font-extrabold text-slate-400 pt-1 border-t border-slate-800">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span>專注深度評分</span>
            </span>
            {showEmotionLayer && (
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
                <span>情緒沉浸指數</span>
              </span>
            )}
            {showPaceLayer && (
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                <span>翻頁節奏穩定度</span>
              </span>
            )}
          </div>
        </div>

        {/* Right 6 Cols: Deep Dive into Selected Category */}
        <div className="lg:col-span-6 space-y-4">
          
          {/* Active Category Detail Card */}
          <div className="p-5 sm:p-6 rounded-3xl bg-slate-900 border-2 border-amber-400/40 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <span className="text-3xl p-2 rounded-2xl bg-slate-800 border border-slate-700">
                  {activeCategory.icon}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-base sm:text-lg font-black text-amber-200">
                      {activeCategory.categoryLabel}
                    </h4>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400/20 text-amber-300 border border-amber-400/30">
                      特質：{activeCategory.traitName}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-medium">
                    核心情緒：{activeCategory.primaryEmotionEmoji} {activeCategory.primaryEmotion}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xl sm:text-2xl font-black text-amber-400">
                  {activeCategory.focusScore} <span className="text-xs text-slate-400 font-bold">分</span>
                </div>
                <div className="text-[10px] font-bold text-emerald-400">專注度極高</div>
              </div>
            </div>

            {/* 3 Metrics Progress Bars */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                  <span>🎯 專注深度</span>
                  <span className="text-amber-300 font-black">{activeCategory.focusScore}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-400 h-full rounded-full transition-all duration-700"
                    style={{ width: `${activeCategory.focusScore}%` }}
                  />
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                  <span>🥰 情緒沉浸</span>
                  <span className="text-purple-300 font-black">{activeCategory.emotionEngagement}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-purple-500 h-full rounded-full transition-all duration-700"
                    style={{ width: `${activeCategory.emotionEngagement}%` }}
                  />
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                  <span>⏱️ 翻頁停留</span>
                  <span className="text-cyan-300 font-black">{activeCategory.avgDwellSecPerPage} 秒/頁</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-cyan-400 h-full rounded-full transition-all duration-700"
                    style={{ width: `${Math.min(100, (activeCategory.avgDwellSecPerPage / 40) * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* AI Tutor Diagnostic Advice */}
            <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/30 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-black text-amber-300">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>AI 共讀導師 ‧ 專注力指導錦囊</span>
              </div>
              <p className="text-xs text-amber-200/90 font-medium leading-relaxed">
                {activeCategory.recommendation}
              </p>
            </div>
          </div>

          {/* Quick Category Selector Pills */}
          <div className="space-y-1.5">
            <span className="text-xs font-black text-slate-400">快速切換其他繪本維度：</span>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {metrics.map((m) => (
                <button
                  key={m.category}
                  onClick={() => {
                    setSelectedCategoryKey(m.category);
                    playPageTurnSound();
                  }}
                  className={`p-2 rounded-2xl text-center border transition-all cursor-pointer flex flex-col items-center gap-0.5 ${
                    selectedCategoryKey === m.category
                      ? 'bg-amber-500 text-slate-950 border-amber-300 font-black scale-105 shadow-md'
                      : 'bg-slate-900/80 text-slate-300 border-slate-700 hover:bg-slate-800'
                  }`}
                >
                  <span className="text-base">{m.icon}</span>
                  <span className="text-[10px] font-bold line-clamp-1">{m.categoryLabel}</span>
                  <span className="text-[9px] opacity-80">{m.focusScore}分</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
