import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  X,
  Clock,
  BookOpen,
  Bookmark,
  Award,
  Star,
  Flame,
  CheckCircle2,
  Mic,
  Smile,
  Radio,
  Trophy,
  ArrowRight,
  Headphones
} from 'lucide-react';
import { UserProfile, UserWord, Book, VoiceRole } from '../types';
import { speakText, playStarChime, playPageTurnSound } from '../utils/audio';

interface DailyVoiceSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  books: Book[];
  savedWords?: UserWord[];
  currentBook?: Book | null;
  currentPageNumber?: number;
  onOpenAchievements?: () => void;
  darkMode?: boolean;
}

export const DailyVoiceSummaryModal: React.FC<DailyVoiceSummaryModalProps> = ({
  isOpen,
  onClose,
  profile,
  books,
  savedWords = [],
  currentBook,
  currentPageNumber = 1,
  onOpenAchievements,
  darkMode = false,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [selectedVoice, setSelectedVoice] = useState<VoiceRole>('mom');
  const [speechSpeed, setSpeechSpeed] = useState<number>(1.0);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState<number>(0);
  const [waveHeights, setWaveHeights] = useState<number[]>([15, 30, 45, 60, 40, 25, 50, 65, 35, 20]);
  const animationRef = useRef<number | null>(null);

  // Generate structured summary sentences
  const summarySentences = useMemo(() => {
    const name = profile.name || '小探險家';
    const minutes = profile.readingMinutes || 0;
    const goal = profile.dailyGoalMinutes || 15;
    const isGoalMet = minutes >= goal;
    const wordsCount = savedWords.length;
    const stars = profile.stars || 0;
    const streak = profile.streakDays || 1;

    const list: string[] = [];

    // Greeting
    list.push(`哈囉！親愛的小探險家${name}，我是你的專屬閱讀導師！`);

    // Reading time progress
    if (currentBook) {
      list.push(`你目前正在閱讀《${currentBook.title}》的第 ${currentPageNumber} 頁，今天已經專注閱讀了 ${minutes} 分鐘！`);
    } else {
      list.push(`今天你已經在繪本世界裡專注閱讀了 ${minutes} 分鐘！`);
    }

    // Goal status
    if (isGoalMet) {
      list.push(`太棒了！你已經成功達成了今天的 ${goal} 分鐘閱讀目標，滿分達成！`);
    } else {
      const remaining = goal - minutes;
      list.push(`距離今日 ${goal} 分鐘的目標還差 ${remaining} 分鐘，再讀一本故事就能達標囉！`);
    }

    // Vocab & Words
    if (wordsCount > 0) {
      const sampleWords = savedWords.slice(0, 2).map((w) => w.word).join('、');
      list.push(`在生字寶庫中，你已經累積了 ${wordsCount} 個詞彙，像是${sampleWords}，記憶力超級優秀！`);
    } else {
      list.push(`在閱讀時如果遇到不認識的字，記得點擊加入生字本，隨時複習喔！`);
    }

    // Stars & Streaks
    list.push(`你目前一共收藏了 ${stars} 顆魔法星章，連續閱讀紀錄來到第 ${streak} 天！`);

    // Mentor closing motto
    list.push(`每一本繪本都是通往奇妙世界的鑰匙，繼續保持好奇心，向著星空勇敢探索吧！`);

    return list;
  }, [profile, currentBook, currentPageNumber, savedWords]);

  const fullText = useMemo(() => summarySentences.join(' '), [summarySentences]);

  // Audio wave animation simulation when playing
  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setWaveHeights(
          Array.from({ length: 12 }, () => Math.floor(Math.random() * 60) + 15)
        );
      }, 120);
      return () => clearInterval(interval);
    } else {
      setWaveHeights([15, 20, 25, 20, 15, 18, 22, 16, 14, 20, 15, 18]);
    }
  }, [isPlaying]);

  // Clean up speech on unmount or close
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isOpen]);

  const handleStartSpeak = () => {
    setSpeechError(null);
    if (!('speechSynthesis' in window)) {
      setSpeechError('您的瀏覽器不支援 Web Speech API 語音功能，您可以直接閱讀下方總結文字。');
      return;
    }

    window.speechSynthesis.cancel();
    setIsPlaying(true);
    setCurrentSentenceIndex(0);

    const utterance = speakText(
      fullText,
      'zh-TW',
      speechSpeed,
      selectedVoice,
      1.0,
      () => {
        setIsPlaying(false);
        playStarChime();
      },
      (charIndex) => {
        // Approximate which sentence is being read
        let accLen = 0;
        for (let i = 0; i < summarySentences.length; i++) {
          accLen += summarySentences[i].length;
          if (charIndex <= accLen) {
            setCurrentSentenceIndex(i);
            break;
          }
        }
      }
    );

    if (!utterance) {
      setIsPlaying(false);
    }
  };

  const handleStopSpeak = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
  };

  const handleVoiceChange = (voice: VoiceRole) => {
    setSelectedVoice(voice);
    playPageTurnSound();
    if (isPlaying) {
      handleStopSpeak();
      setTimeout(() => {
        handleStartSpeak();
      }, 100);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div
        className={`relative w-full max-w-2xl max-h-[92vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden transition-all ${
          darkMode
            ? 'bg-slate-900 border-slate-700 text-slate-100'
            : 'bg-gradient-to-b from-amber-50 via-white to-orange-50/70 border-amber-300 text-slate-900'
        }`}
      >
        {/* Top Header */}
        <div className="px-6 py-5 border-b border-amber-200 dark:border-slate-800 flex items-center justify-between bg-white/70 dark:bg-slate-900/70 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-400 p-1 shadow-md flex items-center justify-center text-white text-2xl">
              <Headphones className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black">
                  📢 本日閱讀總結・AI 語音智慧播報
                </h2>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 border border-emerald-300">
                  Web Speech API
                </span>
              </div>
              <p className="text-xs font-semibold text-amber-900/70 dark:text-slate-400 mt-0.5">
                動態彙整今日專注時長、生字收穫、繪本進度與星章里程碑
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              handleStopSpeak();
              onClose();
            }}
            className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-100 hover:text-rose-600 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            title="關閉"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {speechError && (
            <div className="p-3 rounded-2xl bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 text-xs font-bold flex items-center justify-between">
              <span>{speechError}</span>
              <button
                type="button"
                onClick={() => setSpeechError(null)}
                className="text-amber-800 dark:text-amber-300 hover:text-amber-950 text-xs font-black cursor-pointer ml-2"
              >
                ✕
              </button>
            </div>
          )}
          
          {/* Animated Broadcast Wave & Voice Mentor Banner */}
          <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-purple-500/15 border-2 border-amber-300/80 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3.5">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-3xl shadow-md border-2 border-white dark:border-slate-800 ${isPlaying ? 'scale-110 animate-bounce' : ''}`}>
                🦉
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-sm text-amber-950 dark:text-amber-300">
                    AI 故事導師廣播台
                  </span>
                  {isPlaying ? (
                    <span className="flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500 text-white animate-pulse">
                      <Radio className="w-3 h-3" />
                      正在播報中
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-slate-500">
                      待命就緒
                    </span>
                  )}
                </div>
                <p className="text-xs text-amber-900/80 dark:text-slate-400 font-semibold mt-0.5">
                  點擊下方播放鈕，即可聆聽今日成就大總結！
                </p>
              </div>
            </div>

            {/* Dynamic Sound Wave Bars */}
            <div className="flex items-center gap-1.5 h-12 px-3 py-1 bg-white/60 dark:bg-slate-800/80 rounded-2xl border border-amber-200/80 dark:border-slate-700">
              {waveHeights.map((h, i) => (
                <div
                  key={i}
                  className={`w-1.5 rounded-full transition-all duration-150 ${
                    isPlaying
                      ? 'bg-gradient-to-t from-amber-500 to-orange-500 shadow-xs'
                      : 'bg-slate-300 dark:bg-slate-600'
                  }`}
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>

          {/* Voice Personality & Speed Selection */}
          <div className="p-4 rounded-3xl bg-white dark:bg-slate-850 border border-amber-200 dark:border-slate-700 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-amber-950 dark:text-amber-200 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                選擇播報角色口吻：
              </span>
              
              {/* Speed toggle */}
              <div className="flex items-center gap-1 text-xs font-bold text-slate-600 dark:text-slate-300">
                <span>語速：</span>
                {[0.85, 1.0, 1.2].map((spd) => (
                  <button
                    key={spd}
                    type="button"
                    onClick={() => {
                      setSpeechSpeed(spd);
                      if (isPlaying) {
                        handleStopSpeak();
                        setTimeout(() => handleStartSpeak(), 100);
                      }
                    }}
                    className={`px-2 py-0.5 rounded-lg text-[11px] font-black transition-all cursor-pointer ${
                      speechSpeed === spd
                        ? 'bg-amber-500 text-slate-950 shadow-2xs'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            </div>

            {/* Voice Roles Carousel */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {[
                { id: 'mom', name: '溫柔媽媽', icon: '👩‍👧', desc: '暖心鼓勵' },
                { id: 'cartoon', name: '活潑小精靈', icon: '🧚', desc: '元氣滿滿' },
                { id: 'teacher', name: '知性導師', icon: '🦉', desc: '清晰引導' },
                { id: 'grandpa', name: '慈祥爺爺', icon: '👴', desc: '厚實沉穩' },
                { id: 'robot', name: '智慧機器人', icon: '🤖', desc: '科技未來' },
                { id: 'astronaut', name: '小宇航員', icon: '👨‍🚀', desc: '星空冒險' },
              ].map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => handleVoiceChange(v.id as VoiceRole)}
                  className={`px-3 py-2 rounded-2xl text-xs font-black transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                    selectedVoice === v.id
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md scale-105 ring-2 ring-amber-400/60'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-amber-200/60 dark:border-slate-700 hover:bg-amber-100/50'
                  }`}
                >
                  <span className="text-lg">{v.icon}</span>
                  <div className="text-left">
                    <div>{v.name}</div>
                    <div className="text-[10px] font-normal opacity-80">{v.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Real-time Subtitles / Script Highlighting */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-amber-200 dark:border-slate-700 space-y-3 shadow-xs">
            <div className="flex items-center justify-between text-xs font-black text-amber-950 dark:text-amber-200">
              <span className="flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-orange-500" />
                播報字幕內容（實時同步）：
              </span>
              <span className="text-[11px] text-slate-500">
                共 {summarySentences.length} 段精彩總結
              </span>
            </div>

            <div className="space-y-2 pt-1">
              {summarySentences.map((sentence, idx) => {
                const isCurrent = isPlaying && currentSentenceIndex === idx;

                return (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all duration-300 flex items-start gap-2.5 ${
                      isCurrent
                        ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-950 dark:text-amber-100 border border-amber-300 dark:border-amber-700 scale-[1.01] shadow-xs'
                        : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span className={`w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5 ${
                      isCurrent ? 'bg-amber-500 text-slate-950' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'
                    }`}>
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{sentence}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 rounded-2xl bg-amber-50 dark:bg-slate-800 border border-amber-200 dark:border-slate-700 flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500 shrink-0" />
              <div>
                <div className="text-[10px] text-slate-500 font-bold">今日閱讀</div>
                <div className="text-sm font-black text-amber-600 dark:text-amber-400">
                  {profile.readingMinutes} 分鐘
                </div>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-orange-50 dark:bg-slate-800 border border-orange-200 dark:border-slate-700 flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-orange-500 shrink-0" />
              <div>
                <div className="text-[10px] text-slate-500 font-bold">生字收藏</div>
                <div className="text-sm font-black text-orange-600 dark:text-orange-400">
                  {savedWords.length} 個詞彙
                </div>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-yellow-50 dark:bg-slate-800 border border-yellow-200 dark:border-slate-700 flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500 fill-amber-400 shrink-0" />
              <div>
                <div className="text-[10px] text-slate-500 font-bold">故事星章</div>
                <div className="text-sm font-black text-amber-500 dark:text-amber-300">
                  {profile.stars} 顆星
                </div>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-rose-50 dark:bg-slate-800 border border-rose-200 dark:border-slate-700 flex items-center gap-2">
              <Flame className="w-5 h-5 text-rose-500 fill-rose-500 shrink-0" />
              <div>
                <div className="text-[10px] text-slate-500 font-bold">連讀紀錄</div>
                <div className="text-sm font-black text-rose-600 dark:text-rose-400">
                  {profile.streakDays || 1} 天
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Playback Control Bar */}
        <div className="px-6 py-4 border-t border-amber-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 flex flex-wrap items-center justify-between gap-3">
          
          {/* Achievement Wall Button */}
          {onOpenAchievements && (
            <button
              type="button"
              onClick={() => {
                handleStopSpeak();
                onClose();
                onOpenAchievements();
              }}
              className="px-4 py-2 rounded-2xl bg-purple-100 hover:bg-purple-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-purple-900 dark:text-purple-200 font-black text-xs border border-purple-300 dark:border-slate-600 flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Trophy className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>榮譽成就展示牆</span>
            </button>
          )}

          {/* Primary Audio Controls */}
          <div className="flex items-center gap-2 ml-auto">
            {isPlaying ? (
              <button
                type="button"
                onClick={handleStopSpeak}
                className="px-5 py-2.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-black text-xs sm:text-sm shadow-md transition-all hover:scale-105 flex items-center gap-2 cursor-pointer"
              >
                <Pause className="w-4 h-4 fill-white" />
                <span>停止播報</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleStartSpeak}
                className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs sm:text-sm shadow-md transition-all hover:scale-105 flex items-center gap-2 cursor-pointer animate-pulse"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                <span>🎙️ 開始語音播報</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                handleStopSpeak();
                onClose();
              }}
              className="px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
            >
              關閉
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
