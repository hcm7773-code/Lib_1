import React, { useState } from 'react';
import { Target, Trophy, Flame, Sparkles, Clock, Edit2 } from 'lucide-react';

interface DailyGoalRingProps {
  currentMinutes: number;
  goalMinutes: number;
  onUpdateGoalMinutes?: (newGoal: number) => void;
  onTriggerCelebration?: () => void;
  darkMode?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const DailyGoalRing: React.FC<DailyGoalRingProps> = ({
  currentMinutes,
  goalMinutes,
  onUpdateGoalMinutes,
  onTriggerCelebration,
  darkMode = false,
  size = 'md',
}) => {
  const [isSettingGoal, setIsSettingGoal] = useState(false);

  const goalPercent = Math.min(100, Math.round((currentMinutes / Math.max(1, goalMinutes)) * 100));
  const isGoalReached = currentMinutes >= goalMinutes;

  // SVG ring parameters
  const strokeWidth = size === 'sm' ? 8 : size === 'lg' ? 14 : 10;
  const radius = size === 'sm' ? 36 : size === 'lg' ? 68 : 52;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (goalPercent / 100) * circumference;
  const svgSize = (radius + strokeWidth) * 2;

  const presetGoals = [15, 20, 30, 45, 60];

  return (
    <div
      className={`p-5 rounded-3xl border transition-all ${
        darkMode
          ? 'bg-slate-900/90 border-slate-700 text-slate-100 shadow-xl'
          : 'bg-gradient-to-br from-amber-50/90 via-orange-50/60 to-amber-100/80 border-amber-200/90 shadow-sm text-amber-950'
      }`}
      id="daily-goal-ring-card"
    >
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
        
        {/* SVG Circular Progress Ring */}
        <div className="relative flex items-center justify-center shrink-0">
          <svg width={svgSize} height={svgSize} className="transform -rotate-90">
            {/* Background Track Circle */}
            <circle
              cx={svgSize / 2}
              cy={svgSize / 2}
              r={radius}
              stroke={darkMode ? '#334155' : '#fde68a'}
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            {/* Animated Gradient Progress Arc */}
            <circle
              cx={svgSize / 2}
              cy={svgSize / 2}
              r={radius}
              stroke="url(#goalGradient)"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-1000 ease-out"
            />
            <defs>
              <linearGradient id="goalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f97316" />
                <stop offset="50%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor={isGoalReached ? '#10b981' : '#eab308'} />
              </linearGradient>
            </defs>
          </svg>

          {/* Center Text Overlay inside Ring */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
            <span className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-0.5">
              {goalPercent}
              <span className="text-xs sm:text-sm font-extrabold">%</span>
            </span>
            <span className={`text-[11px] font-bold ${darkMode ? 'text-slate-400' : 'text-amber-900/80'}`}>
              {currentMinutes} / {goalMinutes} 分鐘
            </span>
            {isGoalReached && (
              <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-100/90 dark:bg-emerald-950/80 dark:text-emerald-300 px-2 py-0.2 rounded-full mt-0.5 flex items-center gap-0.5 animate-bounce">
                <Trophy className="w-2.5 h-2.5" /> 達標 🎉
              </span>
            )}
          </div>
        </div>

        {/* Right Info & Goal Adjustment Section */}
        <div className="flex-1 space-y-3 text-center sm:text-left w-full">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-orange-500 text-white shadow-xs">
                <Target className="w-4 h-4" />
              </div>
              <h3 className="font-extrabold text-base sm:text-lg tracking-tight">每日閱讀目標圓環</h3>
            </div>

            {onUpdateGoalMinutes && (
              <button
                onClick={() => setIsSettingGoal(!isSettingGoal)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border transition-all ${
                  darkMode
                    ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200'
                    : 'bg-white/80 border-amber-300 hover:bg-amber-100 text-amber-900'
                }`}
              >
                <Edit2 className="w-3.5 h-3.5 text-orange-500" />
                <span>{isSettingGoal ? '收起設定' : '調整目標'}</span>
              </button>
            )}
          </div>

          <p className={`text-xs font-medium leading-relaxed ${darkMode ? 'text-slate-300' : 'text-amber-900/80'}`}>
            {isGoalReached
              ? '🎉 太棒了！你已成功達成今天的閱讀目標！持續每天朗讀，維持閱讀習慣！'
              : `🔥 距離今天目標還差 ${Math.max(0, goalMinutes - currentMinutes)} 分鐘！閱讀一篇童話繪本即可輕鬆達標喔！`}
          </p>

          {isGoalReached && onTriggerCelebration && (
            <button
              onClick={onTriggerCelebration}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-xs inline-flex items-center gap-1.5 shadow-xs transition-transform hover:scale-105"
            >
              <Sparkles className="w-3.5 h-3.5 text-yellow-200 animate-spin" />
              <span>點擊觸發達標撒花動畫 🎉</span>
            </button>
          )}

          {/* Goal Picker Pills */}
          {isSettingGoal && onUpdateGoalMinutes ? (
            <div className="space-y-2 pt-2 bg-amber-100/50 dark:bg-slate-800/60 p-3 rounded-2xl border border-amber-200 dark:border-slate-700 animate-fadeIn">
              <span className="text-xs font-bold text-amber-900 dark:text-slate-200 block">
                選擇每日閱讀目標時長（分鐘）：
              </span>
              <div className="flex flex-wrap gap-2">
                {presetGoals.map((m) => (
                  <button
                    key={m}
                    onClick={() => {
                      onUpdateGoalMinutes(m);
                      setIsSettingGoal(false);
                    }}
                    className={`px-3 py-1 rounded-xl text-xs font-black transition-all ${
                      goalMinutes === m
                        ? 'bg-orange-500 text-white shadow-xs scale-105'
                        : darkMode
                        ? 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                        : 'bg-white text-amber-950 border border-amber-300 hover:bg-amber-200'
                    }`}
                  >
                    {m} 分鐘
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 pt-1 text-xs font-bold">
              <span className="flex items-center gap-1 text-orange-600">
                <Flame className="w-4 h-4 fill-orange-500" />
                <span>今日專注: {currentMinutes} 分鐘</span>
              </span>
              <span className="text-slate-400">•</span>
              <span className="flex items-center gap-1 text-emerald-600">
                <Sparkles className="w-4 h-4" />
                <span>目標: {goalMinutes} 分鐘</span>
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
