import React, { useState, useEffect, useRef } from 'react';
import {
  Play, Pause, RotateCcw, Award, Star, Trophy, Sparkles, X, ChevronUp, ChevronDown,
  Volume2, VolumeX, Flame, Target, CheckCircle2, Clock
} from 'lucide-react';
import { playStarChime, playPageTurnSound } from '../utils/audio';

export type PomodoroStatus = 'idle' | 'running' | 'paused' | 'completed';

interface FloatingPomodoroTimerProps {
  onAwardStar: (stars: number) => void;
  onStatusChange?: (status: PomodoroStatus) => void;
}

export const FloatingPomodoroTimer: React.FC<FloatingPomodoroTimerProps> = ({
  onAwardStar,
  onStatusChange,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [targetMinutes, setTargetMinutes] = useState<number>(15);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(15 * 60);
  const [status, setStatus] = useState<PomodoroStatus>('idle');
  const [showCompletionModal, setShowCompletionModal] = useState<boolean>(false);
  const [completedGoalMinutes, setCompletedGoalMinutes] = useState<number>(15);
  const [claimedReward, setClaimedReward] = useState<boolean>(false);

  const timerRef = useRef<any>(null);

  // Notify parent of status change for border styling
  useEffect(() => {
    if (onStatusChange) {
      onStatusChange(status);
    }
  }, [status, onStatusChange]);

  // Countdown timer effect
  useEffect(() => {
    if (status === 'running') {
      timerRef.current = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setStatus('completed');
            setShowCompletionModal(true);
            setCompletedGoalMinutes(targetMinutes);
            playStarChime();
            onAwardStar(20);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status, targetMinutes, onAwardStar]);

  const handleStart = () => {
    if (remainingSeconds === 0) {
      setRemainingSeconds(targetMinutes * 60);
    }
    setStatus('running');
    playPageTurnSound();
  };

  const handlePause = () => {
    setStatus('paused');
    playPageTurnSound();
  };

  const handleReset = () => {
    setStatus('idle');
    setRemainingSeconds(targetMinutes * 60);
    playPageTurnSound();
  };

  const handleSelectMinutes = (mins: number) => {
    setTargetMinutes(mins);
    setRemainingSeconds(mins * 60);
    setStatus('idle');
    playPageTurnSound();
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const totalSeconds = targetMinutes * 60;
  const progressPercent = totalSeconds > 0 ? Math.min(100, Math.max(0, ((totalSeconds - remainingSeconds) / totalSeconds) * 100)) : 0;

  return (
    <>
      {/* 🍅 Floating Widget Pill / Card fixed at Bottom Right */}
      <div className="fixed bottom-20 right-4 sm:bottom-24 sm:right-6 z-40 transition-all duration-300">
        {!isExpanded ? (
          /* Mini Collapsed Floating Tomato Button */
          <button
            type="button"
            onClick={() => setIsExpanded(true)}
            className={`group relative px-3.5 py-2 rounded-2xl flex items-center gap-2 shadow-2xl backdrop-blur-md border-2 transition-all cursor-pointer hover:scale-105 active:scale-95 ${
              status === 'running'
                ? 'bg-rose-950/90 border-rose-400 text-rose-100 shadow-rose-500/30 ring-2 ring-rose-400 animate-pulse'
                : status === 'paused'
                ? 'bg-amber-950/90 border-amber-400 text-amber-100'
                : status === 'completed'
                ? 'bg-emerald-950/90 border-emerald-400 text-emerald-100 shadow-emerald-500/30'
                : 'bg-slate-900/90 border-rose-500/60 text-white'
            }`}
          >
            {/* Tomato Icon with animated pulse if running */}
            <span className={`text-xl ${status === 'running' ? 'animate-bounce' : ''}`}>
              🍅
            </span>

            <div className="flex flex-col items-start text-left">
              <span className="text-[9px] font-black tracking-wider text-rose-300 uppercase">
                {status === 'running' ? '⚡ 專注中' : status === 'paused' ? '⏸️ 暫停中' : status === 'completed' ? '🎉 目標達成' : '番茄鐘'}
              </span>
              <span className="font-mono text-sm font-black text-amber-200">
                {formatTime(remainingSeconds)}
              </span>
            </div>

            {/* Circular Mini Progress Indicator */}
            <div className="w-6 h-6 relative flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-700"
                  strokeWidth="4"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className={status === 'completed' ? 'text-emerald-400' : 'text-rose-400'}
                  strokeDasharray={`${progressPercent}, 100`}
                  strokeWidth="4"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
            </div>
          </button>
        ) : (
          /* Expanded Full Pomodoro Control Panel Card */
          <div className="w-80 sm:w-88 p-4 rounded-3xl bg-slate-900/95 border-2 border-rose-400/80 text-white shadow-2xl backdrop-blur-md space-y-4 animate-scaleUp">
            {/* Card Header */}
            <div className="flex items-center justify-between pb-2 border-b border-rose-500/30">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-2xl bg-rose-500/20 border border-rose-400 text-2xl">
                  🍅
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white font-black text-[9px]">
                      專注隨身伴讀
                    </span>
                    <span className="text-[10px] font-bold text-amber-300">
                      Pomodoro Studio
                    </span>
                  </div>
                  <h4 className="text-sm font-black text-rose-200">
                    番茄閱讀專注器
                  </h4>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Timer Large Display & Progress Ring */}
            <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-950/80 border border-rose-500/30 relative overflow-hidden space-y-2">
              <div className="text-3xl font-mono font-black text-amber-300 tracking-wider">
                {formatTime(remainingSeconds)}
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden border border-slate-700">
                <div
                  className="bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-400 h-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <div className="flex items-center justify-between w-full text-[10px] font-bold text-slate-400 pt-1">
                <span>目標：{targetMinutes} 分鐘</span>
                <span>已完成：{Math.round(progressPercent)}%</span>
              </div>
            </div>

            {/* Target Preset Duration Selector Buttons */}
            <div className="space-y-1.5">
              <span className="text-xs font-black text-amber-300 flex items-center gap-1">
                <Target className="w-3.5 h-3.5 text-rose-400" />
                <span>快速設定閱讀目標時長：</span>
              </span>
              <div className="grid grid-cols-4 gap-1.5">
                {[5, 10, 15, 25].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => handleSelectMinutes(mins)}
                    className={`py-1.5 px-2 rounded-xl text-xs font-black transition-all cursor-pointer border ${
                      targetMinutes === mins
                        ? 'bg-rose-500 text-white border-rose-400 shadow-md scale-105'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    {mins} 分鐘
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons: Play / Pause / Reset */}
            <div className="flex items-center gap-2 pt-1">
              {status === 'running' ? (
                <button
                  type="button"
                  onClick={handlePause}
                  className="flex-1 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Pause className="w-4 h-4 fill-slate-950" />
                  <span>暫停專注</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleStart}
                  className="flex-1 py-2.5 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-lg transition-transform hover:scale-105 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>{status === 'paused' ? '繼續專注' : '開始專注'}</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleReset}
                className="px-3.5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-black text-xs flex items-center gap-1 cursor-pointer"
                title="重置專注計時器"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>重置</span>
              </button>
            </div>

            {/* Reward Hint Footer */}
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-400/30 text-[11px] font-extrabold text-rose-200 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-300 shrink-0" />
              <span>達成目標即可解鎖【🍅 番茄閱讀專注勳章】與 +20 ⭐ 星星獎勵！</span>
            </div>
          </div>
        )}
      </div>

      {/* 🎉 Celebratory Goal Completion Modal */}
      {showCompletionModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-md p-6 rounded-3xl bg-slate-900 border-2 border-amber-400 text-white shadow-2xl space-y-5 text-center relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />

            <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-rose-500 via-amber-400 to-yellow-300 p-1 shadow-xl flex items-center justify-center text-5xl animate-bounce">
              🍅
            </div>

            <div className="space-y-1">
              <span className="px-3 py-1 rounded-full bg-amber-400 text-slate-950 font-black text-xs">
                🎉 番茄閱讀專注目標圓滿達成！
              </span>
              <h3 className="text-2xl font-black text-amber-200 mt-2">
                恭喜完成 {completedGoalMinutes} 分鐘專注閱讀！
              </h3>
              <p className="text-xs text-slate-300 font-bold leading-relaxed pt-1">
                你展現了無與倫比的專注力與閱讀毅力！系統已自動為你頒發專屬勳章與獎勵星星！
              </p>
            </div>

            {/* Earned Badge & Star Display Card */}
            <div className="p-4 rounded-2xl bg-slate-800/90 border border-amber-400/40 flex items-center justify-around text-center">
              <div>
                <div className="text-3xl mb-1">🏅</div>
                <div className="text-xs font-black text-amber-300">番茄專注小學霸</div>
                <div className="text-[10px] text-slate-400">專屬故事勳章</div>
              </div>

              <div className="h-10 w-px bg-slate-700" />

              <div>
                <div className="text-3xl mb-1">⭐</div>
                <div className="text-xs font-black text-yellow-300">+20 星星</div>
                <div className="text-[10px] text-slate-400">已入庫童心存摺</div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowCompletionModal(false);
                setStatus('idle');
                setRemainingSeconds(targetMinutes * 60);
              }}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-400 to-rose-500 hover:from-amber-500 hover:to-rose-600 text-slate-950 font-black text-sm shadow-xl cursor-pointer transition-transform hover:scale-105"
            >
              太棒了！領取獎勵並繼續閱讀 🚀
            </button>
          </div>
        </div>
      )}
    </>
  );
};
