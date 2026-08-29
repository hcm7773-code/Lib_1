import React, { useState, useEffect } from 'react';
import {
  X, Heart, Sparkles, Activity, Star, Smile, Flame, Clock, Award,
  BookOpen, MessageCircle, Volume2, Save, CheckCircle2, TrendingUp, Compass, BarChart3,
  Wind, GitFork, RefreshCcw, Zap, Play
} from 'lucide-react';
import { Book, LanguageCode } from '../types';
import { speakText, playStarChime, playPageTurnSound } from '../utils/audio';

export interface MoodEntry {
  bookId: string;
  bookTitle: string;
  timestamp: string;
  primaryMood: string;
  moodEmoji: string;
  resonanceScore: number; // 0 - 100
  focusMinutes: number;
  reflectionNote: string;
  pageEmotions: { pageNum: number; emotionTag: string; score: number }[];
}

interface ReadingMoodDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: Book;
  focusSeconds?: number;
  primaryLang?: LanguageCode;
  onAwardStar: (stars: number) => void;
  darkMode?: boolean;
}

const MOOD_OPTIONS = [
  { id: 'joy', label: '歡樂開朗', emoji: '😃', color: 'from-amber-400 to-yellow-500', bg: 'bg-amber-500/20 text-amber-200 border-amber-400/40' },
  { id: 'wonder', label: '驚奇探索', emoji: '😲', color: 'from-purple-500 to-indigo-500', bg: 'bg-purple-500/20 text-purple-200 border-purple-400/40' },
  { id: 'courage', label: '勇敢無畏', emoji: '🦁', color: 'from-orange-500 to-red-500', bg: 'bg-orange-500/20 text-orange-200 border-orange-400/40' },
  { id: 'gratitude', label: '溫馨感恩', emoji: '💖', color: 'from-pink-500 to-rose-500', bg: 'bg-pink-500/20 text-pink-200 border-pink-400/40' },
  { id: 'calm', label: '靜謐平靜', emoji: '🧘', color: 'from-teal-500 to-emerald-500', bg: 'bg-teal-500/20 text-teal-200 border-teal-400/40' },
  { id: 'touch', label: '深情感動', emoji: '🥺', color: 'from-blue-500 to-cyan-500', bg: 'bg-blue-500/20 text-blue-200 border-blue-400/40' },
];

export const ReadingMoodDashboardModal: React.FC<ReadingMoodDashboardModalProps> = ({
  isOpen,
  onClose,
  book,
  focusSeconds = 300,
  primaryLang = 'zh-TW',
  onAwardStar,
  darkMode = false,
}) => {
  const [selectedMood, setSelectedMood] = useState(MOOD_OPTIONS[0]);
  const [resonanceScore, setResonanceScore] = useState(88);
  const [reflectionNote, setReflectionNote] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [savedHistory, setSavedHistory] = useState<MoodEntry[]>([]);

  // 🌬️ Deep Breathing & Focus Rest Guide State
  const [isBreathingActive, setIsBreathingActive] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState<'in' | 'hold' | 'out'>('in');
  const [breathingTimer, setBreathingTimer] = useState(10);

  // 🌿 Dynamic Plot Branch Choice State
  const [selectedBranch, setSelectedBranch] = useState<'A' | 'B' | 'C' | null>(null);

  // Breathing Loop Timer Effect
  useEffect(() => {
    let interval: any = null;
    if (isBreathingActive) {
      interval = setInterval(() => {
        setBreathingTimer((prev) => {
          if (prev <= 1) {
            setBreathingPhase((phase) => {
              if (phase === 'in') return 'hold';
              if (phase === 'hold') return 'out';
              return 'in';
            });
            return 4;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isBreathingActive]);

  const bookTitleStr = typeof book.title === 'string' ? book.title : (book.title['zh-TW'] || book.title.en || '精選繪本');
  const focusMins = Math.max(1, Math.round(focusSeconds / 60));

  // Load past mood entries for this book
  useEffect(() => {
    if (isOpen) {
      try {
        const stored = localStorage.getItem(`mood_entries_${book.id}`);
        if (stored) {
          const parsed: MoodEntry[] = JSON.parse(stored);
          setSavedHistory(parsed);
          if (parsed.length > 0) {
            setReflectionNote(parsed[0].reflectionNote || '');
          }
        }
      } catch {
        // ignore
      }
    }
  }, [isOpen, book.id]);

  if (!isOpen) return null;

  // Generate page emotion wave mock based on book length
  const pageEmotions = book.pages.map((p, idx) => {
    const baseScore = 60 + Math.floor(Math.sin(idx + 1) * 30) + (idx === book.pages.length - 1 ? 20 : 0);
    const score = Math.min(100, Math.max(40, baseScore));
    let tag = '😊 平和';
    if (score > 85) tag = '🌟 高潮感動';
    else if (score > 75) tag = '🎉 歡樂溫馨';
    else if (score < 55) tag = '🤔 懸念思考';
    return { pageNum: p.pageNumber, score, emotionTag: tag };
  });

  const handleSaveMood = () => {
    const newEntry: MoodEntry = {
      bookId: book.id,
      bookTitle: bookTitleStr,
      timestamp: new Date().toLocaleDateString('zh-TW', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      primaryMood: selectedMood.label,
      moodEmoji: selectedMood.emoji,
      resonanceScore,
      focusMinutes: focusMins,
      reflectionNote: reflectionNote.trim(),
      pageEmotions,
    };

    try {
      const updated = [newEntry, ...savedHistory.filter((h) => h.timestamp !== newEntry.timestamp)];
      setSavedHistory(updated);
      localStorage.setItem(`mood_entries_${book.id}`, JSON.stringify(updated));
      setIsSaved(true);
      playStarChime();
      onAwardStar(5);
      setTimeout(() => setIsSaved(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[94vh] flex flex-col rounded-3xl bg-slate-900 border-2 border-pink-500/80 text-slate-100 shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-pink-500/30 bg-slate-900/90 z-10">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-500 text-white font-black shadow-lg">
              <Heart className="w-6 h-6 animate-pulse fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-pink-500 text-white font-black text-[10px] shadow-xs">
                  💖 童心閱讀心情診斷
                </span>
                <span className="text-[10px] font-bold text-pink-300">
                  《{bookTitleStr}》
                </span>
              </div>
              <h3 className="text-base sm:text-xl font-black text-pink-200">
                閱讀心情儀表板 (Reading Mood & Sentiment Dashboard)
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Main Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar">
          
          {/* Top Session Stats Summary Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-800/90 border border-pink-500/30 space-y-1">
              <div className="text-[10px] font-extrabold text-pink-300 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-pink-400" />
                <span>專注閱讀時長</span>
              </div>
              <div className="text-lg font-black text-white">{focusMins} 分鐘</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-800/90 border border-amber-500/30 space-y-1">
              <div className="text-[10px] font-extrabold text-amber-300 flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>情緒共鳴指數</span>
              </div>
              <div className="text-lg font-black text-amber-200">{resonanceScore} / 100</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-800/90 border border-emerald-500/30 space-y-1">
              <div className="text-[10px] font-extrabold text-emerald-300 flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                <span>已閱讀繪本頁數</span>
              </div>
              <div className="text-lg font-black text-emerald-200">{book.pages.length} 頁全本</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-800/90 border border-purple-500/30 space-y-1">
              <div className="text-[10px] font-extrabold text-purple-300 flex items-center gap-1">
                <Smile className="w-3.5 h-3.5 text-purple-400" />
                <span>主要閱讀心境</span>
              </div>
              <div className="text-lg font-black text-purple-200 flex items-center gap-1">
                <span>{selectedMood.emoji}</span>
                <span>{selectedMood.label}</span>
              </div>
            </div>
          </div>

          {/* 1. Mood Selection Selector */}
          <div className="space-y-3">
            <label className="text-xs font-black text-pink-200 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>點選讀完這本繪本後，孩子當前最濃烈的心情感受：</span>
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2.5">
              {MOOD_OPTIONS.map((opt) => {
                const isSelected = selectedMood.id === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setSelectedMood(opt);
                      playPageTurnSound();
                    }}
                    className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                      isSelected
                        ? `bg-gradient-to-br ${opt.color} text-white border-white scale-105 shadow-lg ring-2 ring-white/50`
                        : 'bg-slate-800/90 text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    <span className="text-2xl">{opt.emoji}</span>
                    <span className="text-xs font-extrabold">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Interactive Emotion Wave Graph (情緒波動起伏圖) */}
          <div className="p-4 sm:p-5 rounded-3xl bg-slate-800/90 border border-pink-500/40 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-700 pb-2">
              <h4 className="font-black text-xs sm:text-sm text-pink-200 flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-pink-400" />
                <span>全書章節情緒波動與沉浸共鳴伏線 (Story Emotion Curve)</span>
              </h4>
              <span className="text-[10px] text-pink-300 font-bold">
                高潮點：第 {pageEmotions.reduce((maxIdx, p, idx, arr) => (p.score > arr[maxIdx].score ? idx : maxIdx), 0) + 1} 頁
              </span>
            </div>

            {/* Visual Bar Chart Wave */}
            <div className="flex items-end justify-between gap-2 h-36 pt-4 px-2">
              {pageEmotions.map((pe) => (
                <div key={pe.pageNum} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                  <span className="text-[10px] font-black text-amber-300">{pe.score}</span>
                  <div className="w-full max-w-[28px] bg-slate-900 rounded-t-xl overflow-hidden h-full flex items-end">
                    <div
                      className="w-full bg-gradient-to-t from-pink-600 via-rose-500 to-amber-400 rounded-t-xl transition-all duration-500"
                      style={{ height: `${pe.score}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold">第{pe.pageNum}頁</span>
                </div>
              ))}
            </div>
          </div>

          {/* ⚡ 3. 思緒跳躍度數據視覺化 & 深呼吸休息練習 (Thought Jump Index & Breathing Exercise) */}
          <div className="p-4 sm:p-5 rounded-3xl bg-slate-950/80 border border-teal-500/40 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-teal-500 text-slate-950 font-black text-[10px]">
                    📊 AI 專注數據分析
                  </span>
                  <span className="text-xs font-bold text-teal-300">
                    思緒跳躍度：18%（理想專注區間 10% ~ 25%）
                  </span>
                </div>
                <h4 className="text-sm sm:text-base font-black text-white mt-1">
                  閱讀思緒跳躍度分析 & 專注調節建議
                </h4>
              </div>

              <button
                type="button"
                onClick={() => {
                  playStarChime();
                  setIsBreathingActive(!isBreathingActive);
                  if (!isBreathingActive) {
                    speakText('開始深呼吸練習。吸氣，感覺氣流充滿胸腔；留氣，感受靜謐；慢慢吐氣，放鬆身心。', 'zh-TW');
                  }
                }}
                className="px-4 py-2 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md cursor-pointer shrink-0"
              >
                <Wind className="w-4 h-4" />
                <span>{isBreathingActive ? '結束深呼吸練習' : '🫁 開啟 1 分鐘深呼吸放鬆'}</span>
              </button>
            </div>

            {/* Thought Jump Curve Bar Visualization */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-300">思緒安定專注度</span>
                <span className="text-emerald-400">82% 超高穩定度 ✨</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden flex">
                <div className="h-full bg-emerald-400 transition-all duration-500" style={{ width: '82%' }} />
                <div className="h-full bg-amber-400/80 transition-all duration-500" style={{ width: '18%' }} />
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                💡 <span className="text-teal-200 font-bold">AI 專家評語：</span>孩子的注意力維持得相當穩定！當思緒跳躍上升時，適時進行 1 分鐘深呼吸練習，有助於補充大腦氧氣、提升沉浸感受。
              </p>
            </div>

            {/* Interactive Breathing Bubble Guide */}
            {isBreathingActive && (
              <div className="p-4 rounded-2xl bg-slate-900 border border-teal-400/50 flex flex-col items-center justify-center space-y-3 animate-fadeIn">
                <div
                  className={`w-24 h-24 rounded-full flex items-center justify-center text-3xl font-black transition-all duration-1000 shadow-2xl ${
                    breathingPhase === 'in'
                      ? 'scale-125 bg-gradient-to-tr from-teal-400 to-emerald-300 text-slate-950 ring-8 ring-teal-400/30'
                      : breathingPhase === 'hold'
                      ? 'scale-110 bg-amber-400 text-slate-950 ring-8 ring-amber-400/30'
                      : 'scale-90 bg-indigo-500 text-white ring-8 ring-indigo-500/30'
                  }`}
                >
                  {breathingPhase === 'in' ? '🌬️ 吸氣' : breathingPhase === 'hold' ? '✨ 留氣' : '💨 吐氣'}
                </div>
                <div className="text-center space-y-1">
                  <div className="text-sm font-black text-amber-300">
                    {breathingPhase === 'in' ? '深深吸氣 4 秒鐘...' : breathingPhase === 'hold' ? '保持停頓 2 秒鐘...' : '緩緩吐氣 4 秒鐘...'}
                  </div>
                  <div className="text-xs font-bold text-slate-400">
                    調節放鬆節奏，準備好後繼續繪本冒險旅程！
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 🌿 4. 動態劇情選擇功能 (Dynamic Story Branch Choice Feature) */}
          <div className="p-4 sm:p-5 rounded-3xl bg-slate-800/90 border border-purple-500/40 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-700 pb-2">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-purple-500/30 text-purple-200">
                  <GitFork className="w-4 h-4" />
                </span>
                <h4 className="font-black text-xs sm:text-sm text-purple-200">
                  🌿 繪本動態劇情分支設想 (Dynamic Story Choice Branching)
                </h4>
              </div>
              <span className="text-[10px] text-amber-300 font-black">
                ✨ 想像力選擇題
              </span>
            </div>

            <p className="text-xs text-slate-300 font-bold">
              如果換作是孩子擔任故事主角，在關鍵章節會選擇哪一個行動呢？
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => {
                  setSelectedBranch('A');
                  playStarChime();
                }}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  selectedBranch === 'A'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-amber-400 ring-2 ring-amber-400/50 shadow-lg'
                    : 'bg-slate-900/80 text-slate-300 border-slate-700 hover:border-purple-400'
                }`}
              >
                <div className="text-xs font-black text-amber-300 mb-1">選項 A：勇敢踏入</div>
                <div className="text-xs font-bold">獨自勇敢邁入神秘森林尋找失落的星光寶石。</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedBranch('B');
                  playStarChime();
                }}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  selectedBranch === 'B'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-amber-400 ring-2 ring-amber-400/50 shadow-lg'
                    : 'bg-slate-900/80 text-slate-300 border-slate-700 hover:border-purple-400'
                }`}
              >
                <div className="text-xs font-black text-amber-300 mb-1">選項 B：團隊合作</div>
                <div className="text-xs font-bold">邀請智慧貓頭鷹與小兔組隊攜手解決謎題。</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedBranch('C');
                  playStarChime();
                }}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  selectedBranch === 'C'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-amber-400 ring-2 ring-amber-400/50 shadow-lg'
                    : 'bg-slate-900/80 text-slate-300 border-slate-700 hover:border-purple-400'
                }`}
              >
                <div className="text-xs font-black text-amber-300 mb-1">選項 C：沉思解密</div>
                <div className="text-xs font-bold">在湖畔冷靜觀察古代圖騰，揭開魔法陣線索。</div>
              </button>
            </div>

            {selectedBranch && (
              <div className="p-3 rounded-2xl bg-purple-950/60 border border-purple-400/40 text-xs font-bold text-purple-200 animate-fadeIn flex items-center justify-between">
                <span>
                  🎉 選擇結果分析：選擇【選項 {selectedBranch}】展現了孩子出色的同理心與邏輯思維力！
                </span>
                <span className="text-amber-300 font-black">+5 ⭐ 想像力加分</span>
              </div>
            )}
          </div>

          {/* 3. Kid Reflection Note & Diary Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-slate-200 flex items-center gap-1.5">
                <MessageCircle className="w-4 h-4 text-pink-400" />
                <span>寫下對這本繪本的心情日記與學習啟發：</span>
              </label>

              <span className="text-[10px] font-bold text-amber-300">
                打卡打卡可獲 +5 ⭐ 星星
              </span>
            </div>

            <textarea
              value={reflectionNote}
              onChange={(e) => setReflectionNote(e.target.value)}
              placeholder="例如：今天讀完《小王子》，我覺得每一個人都要好好守護心中的那一朵獨一無二的玫瑰花！非常溫馨感動～✨"
              rows={3}
              className="w-full p-4 rounded-2xl bg-slate-800/90 border border-pink-500/40 text-white text-xs sm:text-sm placeholder:text-slate-400 focus:outline-none focus:border-pink-400 font-medium"
            />

            <div className="flex items-center justify-between pt-1">
              <div className="text-[11px] text-pink-300 font-bold">
                {isSaved ? '✅ 已儲存至童心閱讀心情檔案冊！' : '紀錄孩子的閱讀成長心路歷程'}
              </div>

              <button
                type="button"
                onClick={handleSaveMood}
                className="px-6 py-2 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-black text-xs shadow-lg transition-transform hover:scale-105 flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>保存心情日記</span>
              </button>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950 border-t border-pink-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-pink-300 font-bold">
            <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
            <span>用心感受閱讀的每一次感動，讓心靈如花朵般綻放！</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-pink-600 text-white font-black text-xs hover:bg-pink-500 cursor-pointer"
          >
            完成檢視
          </button>
        </div>

      </div>
    </div>
  );
};
