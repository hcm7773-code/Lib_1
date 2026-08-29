import React, { useState, useMemo } from 'react';
import {
  Smile, Heart, Sparkles, Volume2, BookOpen, Calendar,
  TrendingUp, Activity, BarChart2, CheckCircle2, ChevronRight,
  Filter, Clock, Award, Star, Info, Mic, Play, Pause, RefreshCw,
  Compass, ArrowRight, Zap, HelpCircle, Flame, ShieldAlert
} from 'lucide-react';
import { Book, UserProfile, VoiceRole } from '../types';
import { playStarChime, playPageTurnSound, speakText } from '../utils/audio';
import { VoiceEmotionNote } from './OfflineAnalyticsModal';

export interface OfflineEmotionFlowMapProps {
  downloadedBooks?: Book[];
  allBooks?: Book[];
  userProfile?: UserProfile;
  voiceEmotionNotes: VoiceEmotionNote[];
  onAddNote?: (note: VoiceEmotionNote) => void;
  onSelectBook?: (book: Book) => void;
  onAddCrystals?: (amount: number) => void;
}

// Emotion types and weights for plotting the valence/arousal wave
export interface EmotionMeta {
  emoji: string;
  name: string;
  valence: number; // -2 to +2 (Emotional Tone)
  energy: number;  // 1 to 5 (Intensity)
  color: string;
  bgGradient: string;
  border: string;
  description: string;
}

export const EMOTIONS_CONFIG: Record<string, EmotionMeta> = {
  '😃': {
    emoji: '😃',
    name: '快樂興奮',
    valence: 2,
    energy: 5,
    color: 'text-amber-400',
    bgGradient: 'from-amber-500/20 to-orange-500/20',
    border: 'border-amber-400',
    description: '感受到情節的熱烈、冒險成功的喜悅與振奮！',
  },
  '❤️': {
    emoji: '❤️',
    name: '溫馨感動',
    valence: 2,
    energy: 3,
    color: 'text-rose-400',
    bgGradient: 'from-rose-500/20 to-pink-500/20',
    border: 'border-rose-400',
    description: '觸發深刻的同理心與角色間溫暖的互助愛意。',
  },
  '🌟': {
    emoji: '🌟',
    name: '奇幻驚喜',
    valence: 1.5,
    energy: 4,
    color: 'text-purple-400',
    bgGradient: 'from-purple-500/20 to-indigo-500/20',
    border: 'border-purple-400',
    description: '發現意想不到的情節轉折與魔幻未知世界！',
  },
  '💡': {
    emoji: '💡',
    name: '知識啟發',
    valence: 1,
    energy: 3,
    color: 'text-cyan-400',
    bgGradient: 'from-cyan-500/20 to-blue-500/20',
    border: 'border-cyan-400',
    description: '掌握了全新科學概念或解開了關鍵謎題！',
  },
  '🦉': {
    emoji: '🦉',
    name: '深度沉思',
    valence: 0.5,
    energy: 2,
    color: 'text-indigo-400',
    bgGradient: 'from-indigo-500/20 to-slate-500/20',
    border: 'border-indigo-400',
    description: '專注思考背後深層哲理與人物選擇的原因。',
  },
  '🦁': {
    emoji: '🦁',
    name: '勇敢自信',
    valence: 1.5,
    energy: 5,
    color: 'text-orange-400',
    bgGradient: 'from-orange-500/20 to-amber-500/20',
    border: 'border-orange-400',
    description: '激發勇氣，願意如主角般迎接任何困難考驗。',
  },
  '🤩': {
    emoji: '🤩',
    name: '超級崇拜',
    valence: 2,
    energy: 4,
    color: 'text-emerald-400',
    bgGradient: 'from-emerald-500/20 to-teal-500/20',
    border: 'border-emerald-400',
    description: '由衷敬佩主角高尚品德與智慧發明！',
  },
  '🥺': {
    emoji: '🥺',
    name: '牽掛憐憫',
    valence: -0.5,
    energy: 2,
    color: 'text-blue-300',
    bgGradient: 'from-blue-500/20 to-slate-500/20',
    border: 'border-blue-400',
    description: '為遭遇困難的角色感到心疼，期盼轉機到來。',
  },
};

export const OfflineEmotionFlowMap: React.FC<OfflineEmotionFlowMapProps> = ({
  downloadedBooks = [],
  allBooks = [],
  userProfile,
  voiceEmotionNotes = [],
  onAddNote,
  onSelectBook,
  onAddCrystals,
}) => {
  // Selected Book for Emotion Flow (or 'all' for aggregate timeline)
  const [selectedBookId, setSelectedBookId] = useState<string>('all');
  const [activeVoiceRole, setActiveVoiceRole] = useState<VoiceRole>('fairy');
  const [selectedNodeIndex, setSelectedNodeIndex] = useState<number | null>(null);

  // New Note Creation inside Emotion Map
  const [isRecordingModalOpen, setIsRecordingModalOpen] = useState<boolean>(false);
  const [targetBookId, setTargetBookId] = useState<string>('');
  const [targetPage, setTargetPage] = useState<number>(1);
  const [targetEmoji, setTargetEmoji] = useState<string>('💡');
  const [noteTitle, setNoteTitle] = useState<string>('');

  // Curated Fallback Data for rich offline simulation if notes are sparse
  const sampleFlowData: VoiceEmotionNote[] = useMemo(() => {
    return [
      {
        id: 'flow-1',
        bookId: 'book-1',
        bookTitle: '小王子與星空狐狸',
        pageNumber: 1,
        createdAt: '2026/08/10 19:15',
        emotionEmoji: '💡',
        emotionName: '知識啟發',
        noteTitle: '初次遇見小王子，對 B612 小行星的好奇！',
        durationSec: 14,
      },
      {
        id: 'flow-2',
        bookId: 'book-1',
        bookTitle: '小王子與星空狐狸',
        pageNumber: 2,
        createdAt: '2026/08/10 19:22',
        emotionEmoji: '🌟',
        emotionName: '奇幻驚喜',
        noteTitle: '玫瑰花盛開的瞬間，香味彷彿飄出書本！',
        durationSec: 18,
      },
      {
        id: 'flow-3',
        bookId: 'book-1',
        bookTitle: '小王子與星空狐狸',
        pageNumber: 3,
        createdAt: '2026/08/10 19:30',
        emotionEmoji: '🥺',
        emotionName: '牽掛憐憫',
        noteTitle: '小王子離開他的小星球時，心裡酸酸的...',
        durationSec: 22,
      },
      {
        id: 'flow-4',
        bookId: 'book-1',
        bookTitle: '小王子與星空狐狸',
        pageNumber: 4,
        createdAt: '2026/08/10 19:38',
        emotionEmoji: '🦉',
        emotionName: '深度沉思',
        noteTitle: '狐狸說「真正重要的東西用眼睛是看不見的」。',
        durationSec: 30,
      },
      {
        id: 'flow-5',
        bookId: 'book-1',
        bookTitle: '小王子與星空狐狸',
        pageNumber: 5,
        createdAt: '2026/08/10 19:45',
        emotionEmoji: '❤️',
        emotionName: '溫馨感動',
        noteTitle: '小王子與狐狸互相馴服，建立了永恆的友誼！',
        durationSec: 25,
      },
      {
        id: 'flow-6',
        bookId: 'book-1',
        bookTitle: '小王子與星空狐狸',
        pageNumber: 6,
        createdAt: '2026/08/10 19:50',
        emotionEmoji: '😃',
        emotionName: '快樂興奮',
        noteTitle: '仰望星空時，每顆星星都像是在輕輕微笑！',
        durationSec: 20,
      },
      // Second book flow
      {
        id: 'flow-7',
        bookId: 'book-2',
        bookTitle: '三隻小豬的環保綠建築',
        pageNumber: 1,
        createdAt: '2026/08/12 14:10',
        emotionEmoji: '💡',
        emotionName: '知識啟發',
        noteTitle: '豬小弟用太陽能板代替柴火，太聰明了！',
        durationSec: 15,
      },
      {
        id: 'flow-8',
        bookId: 'book-2',
        bookTitle: '三隻小豬的環保綠建築',
        pageNumber: 2,
        createdAt: '2026/08/12 14:18',
        emotionEmoji: '🦁',
        emotionName: '勇敢自信',
        noteTitle: '大野狼來吹房子，但綠能被動房堅固無比！',
        durationSec: 19,
      },
      {
        id: 'flow-9',
        bookId: 'book-2',
        bookTitle: '三隻小豬的環保綠建築',
        pageNumber: 3,
        createdAt: '2026/08/12 14:25',
        emotionEmoji: '🤩',
        emotionName: '超級崇拜',
        noteTitle: '全村的小動物都來參觀零碳綠房子！',
        durationSec: 21,
      },
    ];
  }, []);

  // Merge actual voice notes with sample flow data
  const combinedFlowNotes = useMemo(() => {
    if (voiceEmotionNotes && voiceEmotionNotes.length > 0) {
      // Merge unique
      const existingIds = new Set(voiceEmotionNotes.map((n) => n.id));
      const filteredSamples = sampleFlowData.filter((s) => !existingIds.has(s.id));
      return [...voiceEmotionNotes, ...filteredSamples];
    }
    return sampleFlowData;
  }, [voiceEmotionNotes, sampleFlowData]);

  // Distinct books list in emotion flows
  const availableBooks = useMemo(() => {
    const bookMap = new Map<string, string>();
    combinedFlowNotes.forEach((n) => {
      bookMap.set(n.bookId, n.bookTitle);
    });
    return Array.from(bookMap.entries()).map(([id, title]) => ({ id, title }));
  }, [combinedFlowNotes]);

  // Active Flow Data filtered by Book
  const activeFlowData = useMemo(() => {
    if (selectedBookId === 'all') {
      return [...combinedFlowNotes].sort((a, b) => a.pageNumber - b.pageNumber);
    }
    return combinedFlowNotes
      .filter((n) => n.bookId === selectedBookId)
      .sort((a, b) => a.pageNumber - b.pageNumber);
  }, [combinedFlowNotes, selectedBookId]);

  // Overall Emotion Statistics
  const emotionStats = useMemo(() => {
    const counts: Record<string, number> = {};
    let totalValence = 0;
    let totalEnergy = 0;

    activeFlowData.forEach((item) => {
      counts[item.emotionEmoji] = (counts[item.emotionEmoji] || 0) + 1;
      const meta = EMOTIONS_CONFIG[item.emotionEmoji] || EMOTIONS_CONFIG['😃'];
      totalValence += meta.valence;
      totalEnergy += meta.energy;
    });

    const totalCount = activeFlowData.length || 1;
    const avgValence = (totalValence / totalCount).toFixed(1);
    const avgEnergy = (totalEnergy / totalCount).toFixed(1);

    // Peak Emotion
    let peakEmoji = '😃';
    let maxC = 0;
    Object.entries(counts).forEach(([emo, c]) => {
      if (c > maxC) {
        maxC = c;
        peakEmoji = emo;
      }
    });

    return {
      counts,
      totalCount: activeFlowData.length,
      avgValence: Number(avgValence),
      avgEnergy: Number(avgEnergy),
      peakEmoji,
      peakMeta: EMOTIONS_CONFIG[peakEmoji] || EMOTIONS_CONFIG['😃'],
    };
  }, [activeFlowData]);

  // Speak AI Emotion Flow Report
  const handleSpeakFlowReport = () => {
    playStarChime();
    const bookName =
      selectedBookId === 'all'
        ? '整體離線繪本閱讀'
        : `《${availableBooks.find((b) => b.id === selectedBookId)?.title || '本繪本'}》`;

    const text = `為您帶來${bookName}的情緒流動深度分析。在閱讀旅程中，孩子共記錄了 ${emotionStats.totalCount} 個心情點滴。最主要的情緒主旋律是「${emotionStats.peakMeta.name}」，這代表孩子在閱讀過程中深深被故事的${emotionStats.peakMeta.description}所吸引。整體情緒波動呈現由淺入深、漸入佳境的健康流動，展現了卓越的同理心與思維共鳴！`;

    speakText(text, 'zh-TW', 1.0, activeVoiceRole);
  };

  // Play single note speech
  const handlePlaySingleNote = (note: VoiceEmotionNote) => {
    playStarChime();
    const meta = EMOTIONS_CONFIG[note.emotionEmoji] || EMOTIONS_CONFIG['😃'];
    const text = `在《${note.bookTitle}》第 ${note.pageNumber} 頁，當時的心情是「${meta.name}」：${note.noteTitle}`;
    speakText(text, 'zh-TW', 1.0, activeVoiceRole);
  };

  // Submit manual note
  const handleSaveNewNote = () => {
    if (!targetBookId || !noteTitle.trim()) return;
    playStarChime();

    const matchedBook =
      downloadedBooks.find((b) => b.id === targetBookId) ||
      allBooks.find((b) => b.id === targetBookId) || {
        id: targetBookId,
        title: '離線冒險繪本',
      };

    const bTitle =
      typeof (matchedBook as any).title === 'string'
        ? (matchedBook as any).title
        : (matchedBook as any).title?.['zh-TW'] || '繪本';

    const meta = EMOTIONS_CONFIG[targetEmoji] || EMOTIONS_CONFIG['😃'];

    const newNote: VoiceEmotionNote = {
      id: `custom-flow-${Date.now()}`,
      bookId: targetBookId,
      bookTitle: bTitle,
      pageNumber: targetPage,
      createdAt: new Date().toLocaleDateString('zh-TW', {
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      emotionEmoji: targetEmoji,
      emotionName: meta.name,
      noteTitle: noteTitle.trim(),
      durationSec: 18,
    };

    if (onAddNote) onAddNote(newNote);
    if (onAddCrystals) onAddCrystals(20);

    setNoteTitle('');
    setIsRecordingModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn text-slate-100 select-none">
      {/* 🌟 1. EMOTION MAP HERO BANNER */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-slate-950 via-rose-950/60 to-purple-950/80 border-2 border-rose-400/50 shadow-2xl space-y-4 relative overflow-hidden">
        <div className="absolute top-0 right-10 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-400 via-pink-500 to-purple-600 flex items-center justify-center text-3xl shadow-xl border-2 border-rose-200 shrink-0 animate-pulse">
              🗺️
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg sm:text-xl font-black text-rose-300 flex items-center gap-2">
                  <span>閱讀情緒流動地圖 (Reading Emotion Flow Map)</span>
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-500/30 text-rose-200 border border-rose-400/50 flex items-center gap-1">
                  <Activity className="w-3 h-3 text-rose-300 animate-bounce" />
                  <span>語音心情軌跡 ‧ 章節波形圖</span>
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-purple-500/20 text-purple-300 border border-purple-400/40">
                  EQ 情商成長
                </span>
              </div>
              <p className="text-xs font-bold text-slate-300 mt-1 leading-relaxed">
                將繪本閱讀時捕捉的語音情緒點視覺化為一張連續的情緒轉折流動圖。觀察孩子在不同頁面中的「好奇、驚喜、牽掛、沉思與喜悅」心靈曲線！
              </p>
            </div>
          </div>

          {/* Quick Actions & Metrics */}
          <div className="flex items-center gap-2.5 flex-wrap self-start lg:self-auto">
            <button
              onClick={handleSpeakFlowReport}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-lg border border-rose-300/40 cursor-pointer"
            >
              <Volume2 className="w-4 h-4" />
              <span>🔊 收聽 AI 情緒心靈流動報告</span>
            </button>

            <button
              onClick={() => {
                playStarChime();
                setIsRecordingModalOpen(true);
              }}
              className="px-3.5 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-rose-300 border border-rose-400/40 font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Mic className="w-3.5 h-3.5 text-rose-400" />
              <span>+ 補登心情點 (+20 💎)</span>
            </button>
          </div>
        </div>

        {/* Book Selector & Voice Narrator Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-rose-500/30 relative z-10">
          {/* Book Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1">
            <span className="text-xs font-black text-rose-300 shrink-0">繪本選單：</span>
            <button
              onClick={() => {
                playPageTurnSound();
                setSelectedBookId('all');
                setSelectedNodeIndex(null);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all cursor-pointer ${
                selectedBookId === 'all'
                  ? 'bg-rose-500 text-white shadow-md scale-105'
                  : 'bg-slate-900/90 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              🌐 全部繪本彙整 ({combinedFlowNotes.length} 點)
            </button>

            {availableBooks.map((b) => (
              <button
                key={b.id}
                onClick={() => {
                  playPageTurnSound();
                  setSelectedBookId(b.id);
                  setSelectedNodeIndex(null);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all cursor-pointer ${
                  selectedBookId === b.id
                    ? 'bg-rose-500 text-white shadow-md scale-105'
                    : 'bg-slate-900/90 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                📖 《{b.title}》
              </button>
            ))}
          </div>

          {/* Voice Role */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-bold text-rose-300">導讀仙子：</span>
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
              {[
                { role: 'fairy' as VoiceRole, icon: '🧚‍♀️', label: '童話仙子' },
                { role: 'mom' as VoiceRole, icon: '👩‍👧', label: '故事媽媽' },
                { role: 'wizard' as VoiceRole, icon: '🦉', label: '貓頭鷹博士' },
              ].map((v) => (
                <button
                  key={v.role}
                  onClick={() => {
                    playStarChime();
                    setActiveVoiceRole(v.role);
                  }}
                  className={`p-1.5 rounded-lg text-sm transition-all cursor-pointer ${
                    activeVoiceRole === v.role
                      ? 'bg-rose-500 text-white scale-110 shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title={v.label}
                >
                  <span>{v.icon}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          🌟 2. INTERACTIVE EMOTION WAVE & CHAPTER TIMELINE (視覺化情緒流動波形圖)
         ========================================================================= */}
      <div className="p-5 sm:p-6 rounded-3xl bg-slate-950 border-2 border-rose-500/40 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-rose-400" />
            <h4 className="text-base font-black text-white">
              章節心情起伏流動曲線 (Emotional Resonance Curve)
            </h4>
          </div>

          <div className="flex items-center gap-3 text-xs font-bold text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span>正向喜悅 (+2)</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
              <span>啟發沉思 (+1)</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
              <span>深情牽掛 (0)</span>
            </span>
          </div>
        </div>

        {/* Emotion Timeline Horizontal Rail */}
        <div className="relative py-8 px-4 overflow-x-auto custom-scrollbar">
          {/* Center Zero-line Guideline */}
          <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-0.5 bg-gradient-to-r from-cyan-500/20 via-rose-500/40 to-purple-500/20 rounded-full pointer-events-none" />

          {/* Connected Flow Line (SVG overlay) */}
          <div className="min-w-[650px] flex items-center justify-between relative z-10">
            {activeFlowData.map((note, index) => {
              const meta = EMOTIONS_CONFIG[note.emotionEmoji] || EMOTIONS_CONFIG['😃'];
              const isSelected = selectedNodeIndex === index;
              // Compute vertical offset based on valence (-2 to +2)
              // +2 -> top -28px, 0 -> 0px, -1 -> bottom +28px
              const verticalOffset = -meta.valence * 18;

              return (
                <div
                  key={note.id}
                  className="flex flex-col items-center group cursor-pointer relative"
                  style={{
                    transform: `translateY(${verticalOffset}px)`,
                    transition: 'transform 0.4s ease',
                  }}
                  onClick={() => {
                    playPageTurnSound();
                    setSelectedNodeIndex(index);
                    handlePlaySingleNote(note);
                  }}
                >
                  {/* Tooltip / Page Badge */}
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-900 border border-slate-700 text-slate-300 mb-1 shadow">
                    第 {note.pageNumber} 頁
                  </span>

                  {/* Emotion Node Circle */}
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl border-2 transition-all duration-300 shadow-lg ${
                      isSelected
                        ? 'scale-125 ring-4 ring-white ' + meta.border + ' bg-slate-900'
                        : meta.border + ' bg-slate-950 hover:scale-110'
                    }`}
                  >
                    <span>{note.emotionEmoji}</span>
                  </div>

                  {/* Emotion Name Label */}
                  <span className={`text-[11px] font-black mt-1.5 ${meta.color}`}>
                    {meta.name}
                  </span>

                  {/* Timestamp */}
                  <span className="text-[9px] text-slate-500 font-mono">
                    {note.createdAt.split(' ')[0]}
                  </span>

                  {/* Selected Ripple Pointer */}
                  {isSelected && (
                    <div className="absolute -bottom-3 w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Node Details Spotlight Card */}
        {selectedNodeIndex !== null && activeFlowData[selectedNodeIndex] && (
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border-2 border-rose-400/60 shadow-xl space-y-3 animate-fadeIn">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="text-3xl p-2 rounded-2xl bg-slate-950 border border-slate-700">
                  {activeFlowData[selectedNodeIndex].emotionEmoji}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-lg text-xs font-black bg-rose-500/20 text-rose-300 border border-rose-400/40">
                      第 {activeFlowData[selectedNodeIndex].pageNumber} 頁心情
                    </span>
                    <span className="text-xs font-bold text-slate-400">
                      《{activeFlowData[selectedNodeIndex].bookTitle}》
                    </span>
                  </div>
                  <h5 className="text-base font-black text-white mt-1">
                    {activeFlowData[selectedNodeIndex].noteTitle}
                  </h5>
                </div>
              </div>

              <button
                onClick={() => handlePlaySingleNote(activeFlowData[selectedNodeIndex])}
                className="px-3.5 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-black text-xs flex items-center gap-1 shadow cursor-pointer shrink-0"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>重播此頁心情朗讀</span>
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-bold text-slate-300 leading-relaxed">
              💡 <strong>心靈成長剖析：</strong>
              {EMOTIONS_CONFIG[activeFlowData[selectedNodeIndex].emotionEmoji]?.description || '情緒健康流動中。'}
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          🌟 3. EMOTION EQ METRICS & INSIGHTS GRID
         ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Metric 1: Peak Dominant Emotion */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 flex items-center gap-4 shadow-lg">
          <div className="text-4xl p-3 rounded-2xl bg-slate-950 border border-amber-500/40 shrink-0">
            {emotionStats.peakEmoji}
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 block">最強主導情緒</span>
            <h5 className="text-base font-black text-amber-300">
              {emotionStats.peakMeta.name} ({emotionStats.counts[emotionStats.peakEmoji] || 0} 次)
            </h5>
            <p className="text-[11px] text-slate-400 mt-0.5">
              展現高度的探索熱情與好奇
            </p>
          </div>
        </div>

        {/* Metric 2: Emotional Valence Balance */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 flex items-center gap-4 shadow-lg">
          <div className="text-4xl p-3 rounded-2xl bg-slate-950 border border-cyan-500/40 shrink-0">
            ⚖️
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 block">情緒正向共感指數</span>
            <h5 className="text-base font-black text-cyan-300">
              +{emotionStats.avgValence} / 2.0 (極度健康)
            </h5>
            <p className="text-[11px] text-slate-400 mt-0.5">
              在閱讀中獲得充分正向心靈滋養
            </p>
          </div>
        </div>

        {/* Metric 3: Emotion Spectrum Variety */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 flex items-center gap-4 shadow-lg">
          <div className="text-4xl p-3 rounded-2xl bg-slate-950 border border-purple-500/40 shrink-0">
            🌈
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 block">情緒豐富度光譜</span>
            <h5 className="text-base font-black text-purple-300">
              {Object.keys(emotionStats.counts).length} 種多元情感體驗
            </h5>
            <p className="text-[11px] text-slate-400 mt-0.5">
              能體會喜怒哀樂與複雜同理心
            </p>
          </div>
        </div>
      </div>

      {/* =========================================================================
          🌟 4. RECORD NEW EMOTION NOTE MODAL
         ========================================================================= */}
      {isRecordingModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border-2 border-rose-400/80 rounded-3xl p-6 shadow-2xl space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Mic className="w-5 h-5 text-rose-400" />
                <h4 className="text-base font-black text-white">錄製離線繪本心情筆記</h4>
              </div>
              <button
                onClick={() => setIsRecordingModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Select Book */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  選擇對應繪本：
                </label>
                <select
                  value={targetBookId}
                  onChange={(e) => setTargetBookId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-bold focus:border-rose-400 outline-none"
                >
                  <option value="">-- 請選擇繪本 --</option>
                  {(downloadedBooks.length > 0 ? downloadedBooks : allBooks).map((b) => {
                    const title = typeof b.title === 'string' ? b.title : (b.title['zh-TW'] || b.title.en);
                    return (
                      <option key={b.id} value={b.id}>
                        《{title}》
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Page Number */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  繪本頁數 (第幾頁)：
                </label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={targetPage}
                  onChange={(e) => setTargetPage(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-bold focus:border-rose-400 outline-none"
                />
              </div>

              {/* Select Emotion Emoji */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">
                  選擇心情表情：
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {Object.entries(EMOTIONS_CONFIG).map(([emoji, meta]) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => {
                        playStarChime();
                        setTargetEmoji(emoji);
                      }}
                      className={`p-2.5 rounded-xl border text-xs font-black flex flex-col items-center gap-1 transition-all cursor-pointer ${
                        targetEmoji === emoji
                          ? 'bg-rose-500/30 border-rose-400 text-white scale-105 ring-2 ring-rose-400'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <span className="text-xl">{emoji}</span>
                      <span className="text-[10px]">{meta.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Note Title Input */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  孩子的心情小語或語音摘要：
                </label>
                <textarea
                  rows={2}
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  placeholder="例如：看到小樹苗長出第一片綠葉，我覺得大自然好神奇！"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-bold focus:border-rose-400 outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setIsRecordingModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={handleSaveNewNote}
                disabled={!targetBookId || !noteTitle.trim()}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 disabled:opacity-40 text-white font-black text-xs flex items-center gap-1 shadow-md cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>儲存並存入情緒地圖 (+20 💎)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
