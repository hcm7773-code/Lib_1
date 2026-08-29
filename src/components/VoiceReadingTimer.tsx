import React, { useState, useEffect, useRef } from 'react';
import {
  Clock, Play, Pause, RotateCcw, Volume2, Sparkles, Mic, VolumeX,
  Music, Heart, CheckCircle2, Award, Flame, Bell, ShieldCheck, Zap
} from 'lucide-react';
import { UserProfile } from '../types';
import { playStarChime, speakText } from '../utils/audio';
import { playAmbientSound, stopAmbientSound } from '../utils/focusAudio';

export interface VoiceCompanion {
  id: 'dr_owl' | 'mimi_cat' | 'grandpa_wizard';
  name: string;
  avatar: string;
  voiceRole: 'teacher' | 'cartoon' | 'grandpa';
  title: string;
  description: string;
  greeting: string;
  encouragements: string[];
  halfwayPrompt: string;
  oneMinPrompt: string;
  finishPrompt: string;
}

export const VOICE_COMPANIONS: VoiceCompanion[] = [
  {
    id: 'dr_owl',
    name: '智慧貓頭鷹 博士',
    avatar: '🦉',
    voiceRole: 'teacher',
    title: '溫暖知識導師',
    description: '語氣親切清晰，專門引導孩子字正腔圓地大聲朗讀與思考。',
    greeting: '嗨！我是貓頭鷹博士。準備好一起大聲朗讀繪本了嗎？深呼吸，我們開始囉！',
    encouragements: [
      '保持呼吸節奏，大聲自信地念出每一個字！',
      '太棒了！你的聲音很有穿透力，故事聽起來好精彩！',
      '遇到生字不用急，慢慢念，你做得非常棒！',
      '專注的眼神與宏亮的朗讀，這就是小小學者的風采！',
    ],
    halfwayPrompt: '太棒了！已經順利朗讀了一半時間囉！聲音非常宏亮，繼續保持專注！',
    oneMinPrompt: '最後一分鐘倒數囉！加把勁，馬上就要完成今天的朗讀挑戰了！',
    finishPrompt: '太精彩了！恭喜你完成了今天的專注朗讀挑戰！為你頒發閃亮星星獎勵！',
  },
  {
    id: 'mimi_cat',
    name: '活潑咪咪 小夥伴',
    avatar: '🐱',
    voiceRole: 'cartoon',
    title: '元氣加油隊長',
    description: '聲音甜美活潑、充滿活力，隨時給孩子滿滿的自信與笑容。',
    greeting: '喵～我是咪咪！今天的故事一定超級好玩，快大聲讀給我聽吧，喵！',
    encouragements: [
      '喵喵喵！你讀得好生動喔，我都聽入迷了！',
      '哇！你的朗讀聲音就像小精靈唱歌一樣動聽！',
      '加油加油！咪咪在旁邊認真為你拍拍手呢！',
      '太厲害啦～這一段念得超級有感情！',
    ],
    halfwayPrompt: '喵！時間過得好快，已經完成一半囉！咪咪給你一個大大的讚！',
    oneMinPrompt: '喵喵！只剩最後一分鐘囉！衝刺衝刺，星星獎勵就在眼前！',
    finishPrompt: '喵嗚～太棒啦！恭喜完成朗讀挑戰！你今天表現得超級完美！',
  },
  {
    id: 'grandpa_wizard',
    name: '故事魔法爺爺',
    avatar: '🧙',
    voiceRole: 'grandpa',
    title: '奇幻冒險引路人',
    description: '語調沉穩溫暖，富含想像力，引導孩子走進繪本的奇幻世界。',
    greeting: '呵呵呵，歡迎來到魔法書房。孩子，翻開書頁，用你的聲音喚醒故事裡的魔法吧！',
    encouragements: [
      '每一個文字都是一顆魔法種子，隨你的聲音在發芽呢。',
      '沉浸在故事裡吧，想像自己就是繪本裡的小英雄！',
      '慢慢讀，用心體會故事背後的智慧與溫暖。',
      '你的朗讀聲中有一股神奇的力量，爺爺很為你驕傲。',
    ],
    halfwayPrompt: '呵呵呵，魔法進度已經過半囉。古老的書頁正在為你的專注閃爍金光呢！',
    oneMinPrompt: '最後一分鐘的魔法倒數！集中精神，完成今日的智慧修行吧！',
    finishPrompt: '太不可思議了！今日的朗讀魔法圓滿成功！收下這份璀璨的智慧之星吧！',
  },
];

interface VoiceReadingTimerProps {
  profile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  onTriggerCelebration?: () => void;
  darkMode?: boolean;
}

export const VoiceReadingTimer: React.FC<VoiceReadingTimerProps> = ({
  profile,
  onUpdateProfile,
  onTriggerCelebration,
  darkMode = false,
}) => {
  const [selectedCompanionId, setSelectedCompanionId] = useState<'dr_owl' | 'mimi_cat' | 'grandpa_wizard'>('dr_owl');
  const [timerMode, setTimerMode] = useState<'countdown' | 'stopwatch'>('countdown');
  const [selectedMinutes, setSelectedMinutes] = useState<number>(15);
  const [secondsLeft, setSecondsLeft] = useState<number>(15 * 60);
  const [stopwatchSeconds, setStopwatchSeconds] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [completionMessage, setCompletionMessage] = useState<string>('');
  const [activeAmbientSound, setActiveAmbientSound] = useState<'none' | 'rain' | 'forest' | 'piano' | 'ocean'>('none');
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Track milestones reached during timer execution
  const hasHalfwayTriggered = useRef<boolean>(false);
  const hasOneMinTriggered = useRef<boolean>(false);

  const currentCompanion = VOICE_COMPANIONS.find((c) => c.id === selectedCompanionId) || VOICE_COMPANIONS[0];

  // Handle countdown tick
  useEffect(() => {
    let interval: any = null;

    if (isRunning) {
      if (timerMode === 'countdown') {
        if (secondsLeft > 0) {
          interval = setInterval(() => {
            setSecondsLeft((prev) => {
              const next = prev - 1;
              const totalSecs = selectedMinutes * 60;
              const halfwayPoint = Math.floor(totalSecs / 2);

              // Check halfway milestone
              if (!hasHalfwayTriggered.current && next === halfwayPoint && !isMuted) {
                hasHalfwayTriggered.current = true;
                speakText(currentCompanion.halfwayPrompt, 'zh-TW', 1.0, currentCompanion.voiceRole);
              }

              // Check 1 minute milestone
              if (!hasOneMinTriggered.current && next === 60 && totalSecs > 90 && !isMuted) {
                hasOneMinTriggered.current = true;
                speakText(currentCompanion.oneMinPrompt, 'zh-TW', 1.0, currentCompanion.voiceRole);
              }

              return next;
            });
          }, 1000);
        } else if (secondsLeft === 0) {
          setIsRunning(false);
          playStarChime();
          if (onTriggerCelebration) onTriggerCelebration();

          const earnedStars = 15;
          setCompletionMessage(`🎉 太棒了！已順利完成 ${selectedMinutes} 分鐘語音朗讀！獲得 +${earnedStars} 顆童心星星 ⭐`);

          if (!isMuted) {
            speakText(currentCompanion.finishPrompt, 'zh-TW', 1.0, currentCompanion.voiceRole);
          }

          onUpdateProfile({
            ...profile,
            stars: (profile.stars || 0) + earnedStars,
            readingMinutes: (profile.readingMinutes || 0) + selectedMinutes,
          });
        }
      } else {
        // Stopwatch mode
        interval = setInterval(() => {
          setStopwatchSeconds((prev) => {
            const next = prev + 1;
            // Every 5 mins, voice cheer
            if (next > 0 && next % 300 === 0 && !isMuted) {
              const mins = Math.floor(next / 60);
              speakText(`已經大聲朗讀了 ${mins} 分鐘囉！保持節奏，你讀得真好！`, 'zh-TW', 1.0, currentCompanion.voiceRole);
            }
            return next;
          });
        }, 1000);
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, secondsLeft, timerMode, selectedMinutes, isMuted, currentCompanion]);

  const handleSelectMinutes = (mins: number) => {
    setIsRunning(false);
    setSelectedMinutes(mins);
    setSecondsLeft(mins * 60);
    setCompletionMessage('');
    hasHalfwayTriggered.current = false;
    hasOneMinTriggered.current = false;
  };

  const handleToggleTimer = () => {
    if (!isRunning) {
      // Starting
      if (!isMuted && ((timerMode === 'countdown' && secondsLeft === selectedMinutes * 60) || (timerMode === 'stopwatch' && stopwatchSeconds === 0))) {
        speakText(currentCompanion.greeting, 'zh-TW', 1.0, currentCompanion.voiceRole);
      }
    }
    setIsRunning(!isRunning);
  };

  const handleResetTimer = () => {
    setIsRunning(false);
    setSecondsLeft(selectedMinutes * 60);
    setStopwatchSeconds(0);
    setCompletionMessage('');
    hasHalfwayTriggered.current = false;
    hasOneMinTriggered.current = false;
  };

  const handleTriggerCheer = () => {
    const randomCheer =
      currentCompanion.encouragements[
        Math.floor(Math.random() * currentCompanion.encouragements.length)
      ];
    playStarChime();
    speakText(randomCheer, 'zh-TW', 1.0, currentCompanion.voiceRole);
  };

  return (
    <div
      id="voice-reading-timer-section"
      className={`p-6 sm:p-7 rounded-3xl border transition-all ${
        darkMode
          ? 'bg-gradient-to-br from-slate-900 via-amber-950/40 to-slate-900 border-amber-500/40 text-slate-100 shadow-xl'
          : 'bg-gradient-to-br from-amber-500/10 via-orange-400/10 to-amber-100/60 border-amber-300 text-amber-950 shadow-md'
      }`}
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-amber-200/80 dark:border-slate-800 pb-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500 text-white rounded-2xl shadow-md">
            <Mic className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-lg sm:text-xl">智慧語音朗讀計時器</h3>
              <span className="bg-orange-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Voice Guided
              </span>
            </div>
            <p className="text-xs font-semibold text-amber-900/80 dark:text-amber-200/80 mt-0.5">
              伴讀語音導師即時提醒、鼓勵與階段反饋，完成挑戰可獲 <strong className="text-orange-600 dark:text-amber-300 font-extrabold">+15 星星⭐</strong>！
            </p>
          </div>
        </div>

        {/* Mode switcher pills & Mute button */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white/90 dark:bg-slate-800/90 p-1 rounded-2xl border border-amber-200 dark:border-slate-700 text-xs font-black">
            <button
              type="button"
              onClick={() => {
                setIsRunning(false);
                setTimerMode('countdown');
              }}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                timerMode === 'countdown'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-amber-100'
              }`}
            >
              ⏳ 專注倒數
            </button>
            <button
              type="button"
              onClick={() => {
                setIsRunning(false);
                setTimerMode('stopwatch');
              }}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                timerMode === 'stopwatch'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-amber-100'
              }`}
            >
              ⏱️ 自由碼錶
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsMuted(!isMuted)}
            className={`p-2 rounded-2xl border text-xs font-bold transition-colors ${
              isMuted
                ? 'bg-rose-100 text-rose-700 border-rose-300'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-amber-200 dark:border-slate-700'
            }`}
            title={isMuted ? '開啟伴讀語音' : '關閉伴讀語音'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-amber-600" />}
          </button>
        </div>
      </div>

      {/* Main Grid: Left settings & companions | Right timer clock & waves */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Left Column: Voice Companion Selector & Minutes */}
        <div className="md:col-span-7 space-y-4">
          {/* Voice Companion Selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-black text-amber-950 dark:text-amber-200">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>選擇朗讀伴讀夥伴 (Companion Voice)：</span>
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">
                點選夥伴可隨時為你加油
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              {VOICE_COMPANIONS.map((companion) => {
                const isSelected = selectedCompanionId === companion.id;
                return (
                  <button
                    key={companion.id}
                    type="button"
                    onClick={() => {
                      setSelectedCompanionId(companion.id);
                      if (!isMuted) {
                        speakText(companion.greeting, 'zh-TW', 1.0, companion.voiceRole);
                      }
                    }}
                    className={`p-3 rounded-2xl border-2 text-center transition-all cursor-pointer space-y-1 relative ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-500 shadow-md scale-102 dark:bg-amber-950/60'
                        : 'bg-white/80 dark:bg-slate-800/80 border-amber-200 dark:border-slate-700 hover:bg-amber-50'
                    }`}
                  >
                    <div className="text-3xl py-0.5">{companion.avatar}</div>
                    <div className="font-black text-xs text-slate-900 dark:text-slate-100 truncate">
                      {companion.name}
                    </div>
                    <div className="text-[10px] text-amber-800 dark:text-amber-300 font-bold truncate">
                      {companion.title}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Preset Minutes (if countdown mode) */}
          {timerMode === 'countdown' && (
            <div className="space-y-1.5">
              <div className="text-xs font-bold text-slate-600 dark:text-slate-300">
                設定朗讀目標時間：
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {[5, 10, 15, 20, 25, 30, 45].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => handleSelectMinutes(mins)}
                    disabled={isRunning}
                    className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all ${
                      selectedMinutes === mins
                        ? 'bg-amber-500 text-white shadow-xs scale-105'
                        : 'bg-white dark:bg-slate-800 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-slate-700 hover:bg-amber-100'
                    } ${isRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {mins} 分鐘
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Ambient Sound Machine & Instant Cheer Button */}
          <div className="pt-3 border-t border-amber-200/60 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-black text-amber-950 dark:text-amber-200">
                <Music className="w-3.5 h-3.5 text-amber-600" />
                <span>自然白噪音伴讀：</span>
              </div>
              <div className="flex items-center gap-1 flex-wrap">
                {[
                  { id: 'none', label: '🔇 靜音' },
                  { id: 'rain', label: '🌧️ 雨聲' },
                  { id: 'forest', label: '🌲 森林' },
                  { id: 'piano', label: '🎹 鋼琴' },
                  { id: 'ocean', label: '🌊 海浪' },
                ].map((snd) => (
                  <button
                    key={snd.id}
                    type="button"
                    onClick={() => {
                      if (snd.id === 'none') {
                        stopAmbientSound();
                        setActiveAmbientSound('none');
                      } else {
                        playAmbientSound(snd.id);
                        setActiveAmbientSound(snd.id as any);
                      }
                    }}
                    className={`px-2 py-1 rounded-lg text-[11px] font-bold border transition-all ${
                      activeAmbientSound === snd.id
                        ? 'bg-amber-500 text-slate-950 border-amber-600 font-black'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-amber-200 dark:border-slate-700 hover:bg-amber-100'
                    }`}
                  >
                    {snd.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={handleTriggerCheer}
              className="px-3.5 py-2 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-black text-xs shadow-md transition-transform hover:scale-105 flex items-center gap-1.5 self-stretch sm:self-auto justify-center"
            >
              <Heart className="w-4 h-4 fill-current animate-pulse" />
              <span>伴讀夥伴為我加油！</span>
            </button>
          </div>
        </div>

        {/* Right Column: Clock Visualizer & Actions */}
        <div className="md:col-span-5 flex flex-col items-center justify-center p-6 rounded-3xl bg-white/90 dark:bg-slate-800/90 border border-amber-200 dark:border-slate-700 shadow-md space-y-4">
          {/* Active Companion Speech Bubble Preview */}
          <div className="flex items-center gap-2 p-2.5 bg-amber-50 dark:bg-slate-900 rounded-2xl border border-amber-200 dark:border-slate-700 w-full text-xs">
            <span className="text-2xl">{currentCompanion.avatar}</span>
            <div className="flex-1 min-w-0">
              <div className="font-black text-[11px] text-amber-900 dark:text-amber-300">
                {currentCompanion.name}
              </div>
              <p className="text-[10px] text-slate-600 dark:text-slate-400 truncate">
                {isRunning ? '正在專注聆聽你的精彩朗讀...' : currentCompanion.description}
              </p>
            </div>
          </div>

          {/* Time Display */}
          {(() => {
            let mins = 0;
            let secs = 0;
            let percent = 0;

            if (timerMode === 'countdown') {
              mins = Math.floor(secondsLeft / 60);
              secs = secondsLeft % 60;
              const totalSecs = selectedMinutes * 60;
              percent = Math.round(((totalSecs - secondsLeft) / totalSecs) * 100);
            } else {
              mins = Math.floor(stopwatchSeconds / 60);
              secs = stopwatchSeconds % 60;
              percent = (stopwatchSeconds % 60) * 1.66;
            }

            const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

            return (
              <div className="text-center space-y-2 w-full">
                <div className="text-4xl sm:text-5xl font-black tracking-widest text-orange-600 dark:text-amber-400 font-mono">
                  {formatted}
                </div>

                {/* Animated Soundwave Visualizer Bars */}
                <div className="flex items-center justify-center gap-1 h-8 py-1">
                  {[4, 8, 12, 16, 20, 16, 12, 8, 4, 10, 18, 14, 8, 4].map((h, i) => (
                    <div
                      key={i}
                      className={`w-1 rounded-full transition-all duration-300 ${
                        isRunning
                          ? 'bg-gradient-to-t from-amber-500 to-orange-500 animate-pulse'
                          : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                      style={{
                        height: isRunning ? `${Math.max(4, (h * (i % 3 + 1)) % 28)}px` : '4px',
                        animationDelay: `${i * 0.08}s`,
                      }}
                    />
                  ))}
                </div>

                {/* Progress bar */}
                <div className="w-full h-2.5 bg-amber-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-300"
                    style={{ width: `${percent}%` }}
                  />
                </div>

                <div className="text-[10px] font-bold text-amber-800 dark:text-amber-300">
                  {isRunning ? '🎙️ 朗讀聲波感應中，請大聲開口念出故事...' : '點擊「開始朗讀」啟動語音伴讀'}
                </div>
              </div>
            );
          })()}

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 w-full justify-center">
            <button
              type="button"
              onClick={handleToggleTimer}
              className={`flex-1 py-3 rounded-2xl text-white font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md transition-transform hover:scale-105 ${
                isRunning
                  ? 'bg-rose-500 hover:bg-rose-600'
                  : 'bg-emerald-500 hover:bg-emerald-600'
              }`}
            >
              {isRunning ? (
                <>
                  <Pause className="w-4 h-4 fill-white" />
                  <span>暫停朗讀</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>開始朗讀</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleResetTimer}
              className="p-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-2xl font-bold text-xs shadow-xs"
              title="重置時間"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Completion Banner */}
      {completionMessage && (
        <div className="mt-4 p-3.5 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 rounded-2xl text-xs font-black text-center animate-bounce border border-emerald-300 dark:border-emerald-700 flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>{completionMessage}</span>
        </div>
      )}
    </div>
  );
};
