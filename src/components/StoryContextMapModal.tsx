import React, { useState, useEffect } from 'react';
import {
  X, Compass, MapPin, Sparkles, Users, Volume2, Zap, ArrowRight,
  BarChart3, Activity, Clock, Heart, MessageSquare, Send, Share2,
  CheckCircle2, Star, Trophy, RefreshCw, Eye, BookOpen, Layers, Flame,
  CornerDownRight, Check
} from 'lucide-react';
import { Book, UserProfile } from '../types';
import { speakText, playStarChime, playPageTurnSound } from '../utils/audio';

interface SceneNode {
  id: string;
  pageNumber: number;
  title: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  icon: string;
  summary: string;
  hiddenCharacterSecrets: string[];
  keyObjects: string[];
  emotionTag: string;
}

interface CharacterConnection {
  from: string;
  to: string;
  relationshipLabel: string;
}

interface ReadingPaceAnalytics {
  recommendedPaceSec: number;
  rhythmConsistencyScore: number;
  focusLevel: string;
  smartAdvice: string;
}

interface SocialPostItem {
  id: string;
  authorName: string;
  authorAvatar: string;
  authorRole: string;
  pageNumber: number;
  rating: number;
  theme: 'starry' | 'forest' | 'castle' | 'ocean';
  content: string;
  timestamp: string;
  likes: number;
  isLiked: boolean;
  tags: string[];
  comments: { id: string; author: string; text: string }[];
}

interface StoryContextMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: Book;
  currentPageIndex: number;
  onJumpToPage: (pageIndex: number) => void;
  profile?: UserProfile;
}

export const StoryContextMapModal: React.FC<StoryContextMapModalProps> = ({
  isOpen,
  onClose,
  book,
  currentPageIndex,
  onJumpToPage,
  profile,
}) => {
  const [activeTab, setActiveTab] = useState<'map' | 'analytics' | 'social'>('map');
  const [isLoading, setIsLoading] = useState(false);

  // Dynamic Scene Nodes & Connections State
  const [scenes, setScenes] = useState<SceneNode[]>([]);
  const [connections, setConnections] = useState<CharacterConnection[]>([]);
  const [selectedScene, setSelectedScene] = useState<SceneNode | null>(null);

  // Reading Pace Analytics State
  const [paceAnalytics, setPaceAnalytics] = useState<ReadingPaceAnalytics | null>(null);
  const [pageTimes, setPageTimes] = useState<number[]>([38, 52, 41, 46]);

  // Social Wall State
  const [socialPosts, setSocialPosts] = useState<SocialPostItem[]>([
    {
      id: 'sp-1',
      authorName: '小明 (探險者)',
      authorAvatar: '👦',
      authorRole: '孩童讀者',
      pageNumber: 2,
      rating: 5,
      theme: 'forest',
      content: '今天跟小狐狸一起走到智慧湖畔，發現了貓頭鷹戴魔法眼鏡的小祕密！故事真的好有想像力！',
      timestamp: '10分鐘前',
      likes: 12,
      isLiked: false,
      tags: ['#角色隱藏秘辛', '#共讀好書', '#智慧湖'],
      comments: [
        { id: 'c1', author: '媽媽 (陪讀導師)', text: '小明的觀察非常敏銳喔！我也很喜歡貓頭鷹的魔法眼鏡！' },
        { id: 'c2', author: '🤖 AI故事版主', text: '讚賞小明發現了隱藏角色的知識亮點！繼續保持好奇心！' },
      ],
    },
    {
      id: 'sp-2',
      authorName: '小華 (故事同好)',
      authorAvatar: '👧',
      authorRole: '共讀好友',
      pageNumber: 3,
      rating: 5,
      theme: 'castle',
      content: '最後一頁大家在城堡歡慶的時候，真的好感動，友誼黃金獎牌閃閃發亮！',
      timestamp: '30分鐘前',
      likes: 18,
      isLiked: true,
      tags: ['#圓滿結局', '#友誼勳章'],
      comments: [],
    },
  ]);

  const [postInput, setPostInput] = useState('');
  const [postRating, setPostRating] = useState<number>(5);
  const [selectedPostTheme, setSelectedPostTheme] = useState<'starry' | 'forest' | 'castle' | 'ocean'>('starry');
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  const currentPageNumber = currentPageIndex + 1;
  const bookTitleStr = typeof book.title === 'string' ? book.title : (book.title['zh-TW'] || book.title.en || '精選繪本');
  const bookDescStr = typeof book.description === 'string' ? book.description : (book.description?.['zh-TW'] || book.description?.en || '');

  // Fetch AI generated Story Context Map
  useEffect(() => {
    if (isOpen) {
      fetchStoryContextMap();
    }
  }, [isOpen, book.id]);

  const fetchStoryContextMap = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/gemini/story-context-map', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookTitle: bookTitleStr,
          bookDescription: bookDescStr,
          pages: book.pages,
        }),
      });

      const data = await res.json();
      if (data.scenes && data.scenes.length > 0) {
        setScenes(data.scenes);
        setConnections(data.characterConnections || []);
        if (data.readingPaceAnalytics) {
          setPaceAnalytics(data.readingPaceAnalytics);
        }
        // Auto select node corresponding to current page or first scene
        const matched = data.scenes.find((s: SceneNode) => s.pageNumber === currentPageNumber) || data.scenes[0];
        setSelectedScene(matched);
      }
    } catch (e) {
      console.error('Fetch Story Context Map error:', e);
      // Fallback fallback defaults
      const defaultScenes: SceneNode[] = [
        {
          id: 'sc-1',
          pageNumber: 1,
          title: '🌲 冒險啟程・森林村莊',
          x: 20,
          y: 35,
          icon: '🌲',
          summary: '主角懷著勇氣離開森林村莊，開始尋找傳說中的希望寶石與神奇小夥伴。',
          hiddenCharacterSecrets: [
            '🦊 探險小狐狸秘辛：隨身背包裡隨時備有七彩幸運四葉草水！',
            '🐿️ 熱心松鼠秘辛：藏在樹洞裡的松果地圖是他親手繪製的喔！'
          ],
          keyObjects: ['🎒 勇氣背包', '📜 古老地圖'],
          emotionTag: '期待興奮'
        },
        {
          id: 'sc-2',
          pageNumber: Math.min(2, book.pages.length),
          title: '🌊 秘境轉折・智慧湖畔',
          x: 50,
          y: 65,
          icon: '🌊',
          summary: '在湖畔偶遇智慧貓頭鷹，互相分享故事線索，順利克服第一道考驗。',
          hiddenCharacterSecrets: [
            '🦉 智慧貓頭鷹秘辛：戴著魔法眼鏡能看穿夜空中最亮的幸運星！'
          ],
          keyObjects: ['🗝️ 魔法金鑰匙', '🧭 閃耀指南針'],
          emotionTag: '充滿好奇'
        },
        {
          id: 'sc-3',
          pageNumber: Math.max(1, book.pages.length),
          title: '🏰 圓滿高潮・希望城堡',
          x: 82,
          y: 32,
          icon: '🏰',
          summary: '大家齊心協力抵達終點城堡，體會友誼、分享與成長帶來的最美感動。',
          hiddenCharacterSecrets: [
            '🐰 熱心小兔秘辛：城堡裡最厲害的甜點大師，烤出的餅乾會閃耀光芒！'
          ],
          keyObjects: ['🏆 友誼黃金獎牌', '💎 希望寶石'],
          emotionTag: '溫馨感動'
        }
      ];

      setScenes(defaultScenes);
      setConnections([
        { from: 'sc-1', to: 'sc-2', relationshipLabel: '勇敢踏出探險旅程' },
        { from: 'sc-2', to: 'sc-3', relationshipLabel: '攜手解開魔法奧秘' }
      ]);
      setSelectedScene(defaultScenes[0]);
    } finally {
      setIsLoading(false);
    }
  };

  // Add social post
  const handlePublishPost = () => {
    if (!postInput.trim()) return;

    playStarChime();
    const newPost: SocialPostItem = {
      id: 'sp-' + Date.now(),
      authorName: profile?.displayName || '小探險者',
      authorAvatar: profile?.avatarEmoji || '👦',
      authorRole: '繪本小讀者',
      pageNumber: currentPageNumber,
      rating: postRating,
      theme: selectedPostTheme,
      content: postInput.trim(),
      timestamp: '剛剛',
      likes: 1,
      isLiked: true,
      tags: ['#故事脈絡心得', `#第${currentPageNumber}頁`, '#共讀卡片'],
      comments: [
        { id: 'c-mod', author: '🤖 AI 共讀版主', text: '太棒的繪本心得！將關鍵場景與自己的想法結合得非常完整！' }
      ]
    };

    setSocialPosts([newPost, ...socialPosts]);
    setPostInput('');
  };

  // Toggle like on post
  const handleToggleLike = (postId: string) => {
    playStarChime();
    setSocialPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            isLiked: !p.isLiked,
            likes: p.isLiked ? p.likes - 1 : p.likes + 1,
          };
        }
        return p;
      })
    );
  };

  // Add comment to post
  const handleAddComment = (postId: string) => {
    const text = commentInputs[postId];
    if (!text?.trim()) return;

    playStarChime();
    setSocialPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            comments: [
              ...p.comments,
              { id: 'cm-' + Date.now(), author: profile?.displayName || '小夥伴', text: text.trim() }
            ]
          };
        }
        return p;
      })
    );

    setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-fadeIn">
      <div className="w-full max-w-5xl h-[92vh] rounded-3xl bg-slate-900 border-2 border-amber-400/80 shadow-2xl flex flex-col overflow-hidden relative">

        {/* 1. Header Bar */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 border-b border-amber-400/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <span className="p-3 rounded-2xl bg-gradient-to-tr from-amber-400 via-orange-400 to-yellow-500 text-slate-950 font-black shadow-lg">
              <Compass className="w-6 h-6" />
            </span>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-black text-amber-300">
                  🗺️ 故事脈絡地圖 (Story Context Map)
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-900 border border-indigo-400/40 text-indigo-200 font-bold text-xs">
                  《{bookTitleStr}》
                </span>
              </div>
              <p className="text-xs text-slate-300 font-bold mt-0.5">
                AI 自動擷取關鍵場景與角色網絡 ‧ 智慧閱讀節奏分析 ‧ 閱讀社交牆
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            <button
              type="button"
              onClick={fetchStoryContextMap}
              disabled={isLoading}
              className="px-3 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="重新使用 AI 分析故事脈絡"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>重新生成脈絡</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2.5 rounded-2xl bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 2. Navigation Tabs Bar */}
        <div className="px-4 py-2.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-2 overflow-x-auto shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setActiveTab('map');
                playStarChime();
              }}
              className={`px-4 py-2 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'map'
                  ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-md ring-2 ring-amber-300'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>🗺️ 動態故事脈絡圖</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('analytics');
                playStarChime();
              }}
              className={`px-4 py-2 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'analytics'
                  ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-slate-950 shadow-md ring-2 ring-teal-300'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>⏱️ 智慧閱讀節奏分析</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('social');
                playStarChime();
              }}
              className={`px-4 py-2 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'social'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md ring-2 ring-purple-300'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>💬 閱讀社交牆</span>
            </button>
          </div>

          <div className="text-xs font-bold text-amber-300 hidden md:block">
            📍 當前停留繪本：第 {currentPageNumber} 頁
          </div>
        </div>

        {/* 3. Main Content Panel Body */}
        {activeTab === 'map' ? (
          /* TAB 1: 🗺️ 動態故事脈絡圖 Canvas & Scene Node Details */
          <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden bg-slate-950">
            {/* Left: Dynamic Node Map Canvas (2/3) */}
            <div className="flex-1 relative min-h-[320px] lg:min-h-0 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 p-4 border-b lg:border-b-0 lg:border-r border-slate-800 flex flex-col justify-between overflow-hidden">

              {/* Decorative Background Grid Pattern */}
              <div
                className="absolute inset-0 opacity-20 pointer-events-none"
                style={{
                  backgroundImage: 'radial-gradient(#818cf8 1px, transparent 1px)',
                  backgroundSize: '24px 24px',
                }}
              />

              {/* Canvas Header */}
              <div className="relative z-10 flex items-center justify-between bg-slate-900/80 p-3 rounded-2xl border border-indigo-500/30 backdrop-blur-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-xs font-black text-amber-300">
                    AI 自動分析故事節點與角色流向
                  </span>
                </div>
                <span className="text-[11px] font-bold text-slate-400">
                  提示：點擊任何節點即可解鎖該場景回顧與隱藏角色秘辛
                </span>
              </div>

              {/* SVG Connecting Paths & Nodes Map */}
              <div className="relative flex-1 w-full my-4 flex items-center justify-center">
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                  <defs>
                    <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
                      <stop offset="50%" stopColor="#a855f7" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0.8" />
                    </linearGradient>
                  </defs>

                  {/* Draw Connecting Curved Lines between Nodes */}
                  {scenes.map((s, idx) => {
                    if (idx < scenes.length - 1) {
                      const next = scenes[idx + 1];
                      return (
                        <g key={`path-${s.id}-${next.id}`}>
                          <line
                            x1={`${s.x}%`}
                            y1={`${s.y}%`}
                            x2={`${next.x}%`}
                            y2={`${next.y}%`}
                            stroke="url(#lineGrad)"
                            strokeWidth="3"
                            strokeDasharray="6 4"
                            className="animate-pulse"
                          />
                        </g>
                      );
                    }
                    return null;
                  })}
                </svg>

                {/* Node Buttons */}
                {scenes.map((node) => {
                  const isSelected = selectedScene?.id === node.id;
                  const isCurrentReadPage = node.pageNumber === currentPageNumber;

                  return (
                    <div
                      key={node.id}
                      className="absolute z-10 -translate-x-1/2 -translate-y-1/2 group"
                      style={{ left: `${node.x}%`, top: `${node.y}%` }}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedScene(node);
                          playStarChime();
                        }}
                        className={`p-3.5 sm:p-4 rounded-3xl transition-all duration-300 flex items-center gap-2 cursor-pointer shadow-2xl relative ${
                          isSelected
                            ? 'bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-500 text-slate-950 scale-110 ring-4 ring-amber-300/80'
                            : 'bg-slate-900/90 text-white border-2 border-indigo-400/50 hover:scale-105 hover:border-amber-400'
                        }`}
                      >
                        <span className="text-2xl sm:text-3xl shrink-0">{node.icon}</span>

                        <div className="text-left hidden sm:block">
                          <div className="flex items-center gap-1.5">
                            <span className="font-black text-xs sm:text-sm">
                              {node.title}
                            </span>
                            {isCurrentReadPage && (
                              <span className="px-1.5 py-0.5 rounded-full bg-emerald-400 text-slate-950 text-[9px] font-black animate-pulse">
                                當前閱讀
                              </span>
                            )}
                          </div>
                          <span className={`text-[10px] font-bold block ${isSelected ? 'text-slate-900' : 'text-indigo-300'}`}>
                            第 {node.pageNumber} 頁 ‧ {node.emotionTag}
                          </span>
                        </div>

                        {/* Glowing Ring Effect */}
                        {isSelected && (
                          <span className="absolute -inset-1 rounded-3xl border-2 border-amber-300 animate-ping opacity-60 pointer-events-none" />
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Connections Relationship Bar */}
              <div className="relative z-10 bg-slate-900/80 p-3 rounded-2xl border border-slate-800 flex items-center gap-2 overflow-x-auto">
                <span className="text-xs font-black text-amber-300 shrink-0 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>故事脈絡演進條：</span>
                </span>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-300 overflow-x-auto">
                  {connections.map((c, cIdx) => (
                    <div key={cIdx} className="flex items-center gap-1.5 shrink-0 bg-slate-950 px-3 py-1 rounded-xl border border-slate-800">
                      <span>{c.relationshipLabel}</span>
                      <ArrowRight className="w-3 h-3 text-amber-400" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Selected Scene Recap & Hidden Character Knowledge Panel (1/3) */}
            <div className="w-full lg:w-96 bg-slate-900/90 p-4 sm:p-5 space-y-4 overflow-y-auto shrink-0 flex flex-col justify-between border-t lg:border-t-0 border-indigo-500/30">
              {selectedScene ? (
                <div className="space-y-4">
                  {/* Selected Scene Header */}
                  <div className="p-4 rounded-3xl bg-gradient-to-r from-purple-950 via-slate-950 to-indigo-950 border border-amber-400/60 shadow-xl space-y-2">
                    <div className="flex items-center justify-between border-b border-purple-500/30 pb-2">
                      <div className="flex items-center gap-2.5">
                        <span className="text-3xl p-2 rounded-2xl bg-indigo-950 border border-indigo-400/40">
                          {selectedScene.icon}
                        </span>
                        <div>
                          <h3 className="text-base sm:text-lg font-black text-amber-300">
                            {selectedScene.title}
                          </h3>
                          <span className="text-xs font-bold text-indigo-200">
                            繪本第 {selectedScene.pageNumber} 頁關鍵場景
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => speakText(`${selectedScene.title}。${selectedScene.summary}`, 'zh-TW')}
                        className="p-2 rounded-xl bg-purple-500/30 hover:bg-purple-500/50 text-purple-200 cursor-pointer"
                        title="朗讀場景簡介"
                      >
                        <Volume2 className="w-4 h-4 text-amber-300" />
                      </button>
                    </div>

                    {/* Page Jump Action Button */}
                    <button
                      type="button"
                      onClick={() => {
                        playPageTurnSound();
                        onJumpToPage(selectedScene.pageNumber - 1);
                        onClose();
                      }}
                      className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-md transition-transform hover:scale-105 cursor-pointer"
                    >
                      <Zap className="w-4 h-4 fill-slate-950" />
                      <span>🚀 跳轉至繪本第 {selectedScene.pageNumber} 頁親自探索</span>
                    </button>
                  </div>

                  {/* 1. Brief Scene Recap */}
                  <div className="p-4 rounded-3xl bg-slate-950/80 border border-indigo-500/30 space-y-2">
                    <div className="text-xs font-black text-indigo-300 flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-amber-300" />
                      <span>📖 該場景簡要故事回顧 (Scene Recap)</span>
                    </div>
                    <p className="text-xs sm:text-sm font-medium text-slate-200 leading-relaxed">
                      {selectedScene.summary}
                    </p>
                  </div>

                  {/* 2. Hidden Character Knowledge & Secrets */}
                  <div className="p-4 rounded-3xl bg-gradient-to-r from-amber-950/80 via-slate-950 to-purple-950/80 border border-amber-400/50 space-y-2.5">
                    <div className="flex items-center justify-between border-b border-amber-500/30 pb-2">
                      <div className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                        <span>💡 隱藏角色知識與獨家小祕密</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px]">
                        解鎖秘辛
                      </span>
                    </div>

                    <ul className="space-y-2">
                      {selectedScene.hiddenCharacterSecrets.map((secret, sIdx) => (
                        <li
                          key={sIdx}
                          className="p-3 rounded-2xl bg-slate-900/90 border border-amber-400/30 text-xs font-bold text-amber-100 flex items-start gap-2 leading-relaxed"
                        >
                          <span className="text-base shrink-0">✨</span>
                          <span>{secret}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* 3. Key Objects */}
                  <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                    <div className="text-xs font-black text-slate-400">
                      🗝️ 該場景登場關鍵寶物：
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedScene.keyObjects.map((obj, oIdx) => (
                        <span key={oIdx} className="px-2.5 py-1 rounded-xl bg-indigo-900/80 text-indigo-100 text-xs font-bold border border-indigo-400/40">
                          {obj}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400 font-bold text-xs">
                  點擊動態脈絡地圖上的任何節點即可解鎖詳細場景回顧！
                </div>
              )}
            </div>
          </div>
        ) : activeTab === 'analytics' ? (
          /* TAB 2: ⏱️ 智慧閱讀節奏分析 (Smart Reading Pace & Rhythm Analytics) */
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-950/90">
            {/* Top Stat Overview Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              <div className="p-4 rounded-3xl bg-slate-900 border border-teal-500/40 space-y-1 shadow-md">
                <div className="text-xs font-black text-slate-400 flex items-center gap-1">
                  <Clock className="w-4 h-4 text-teal-400" />
                  <span>⏱️ 平均閱讀步調</span>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-teal-300">
                  {paceAnalytics?.recommendedPaceSec || 42} 秒/頁
                </div>
                <div className="text-[10px] text-emerald-400 font-bold">
                  ● 黃金深思考停留時間
                </div>
              </div>

              <div className="p-4 rounded-3xl bg-slate-900 border border-amber-500/40 space-y-1 shadow-md">
                <div className="text-xs font-black text-slate-400 flex items-center gap-1">
                  <Activity className="w-4 h-4 text-amber-400" />
                  <span>🎯 節奏流暢度評分</span>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-amber-300">
                  {paceAnalytics?.rhythmConsistencyScore || 95} 分
                </div>
                <div className="text-[10px] text-amber-400 font-bold">
                  ✨ 節奏均勻且專注
                </div>
              </div>

              <div className="p-4 rounded-3xl bg-slate-900 border border-purple-500/40 space-y-1 shadow-md">
                <div className="text-xs font-black text-slate-400 flex items-center gap-1">
                  <Flame className="w-4 h-4 text-purple-400" />
                  <span>🧠 專注沉浸層級</span>
                </div>
                <div className="text-xl sm:text-2xl font-black text-purple-200">
                  {paceAnalytics?.focusLevel || '高專注沉浸'}
                </div>
                <div className="text-[10px] text-purple-300 font-bold">
                  大腦思考活躍期
                </div>
              </div>

              <div className="p-4 rounded-3xl bg-slate-900 border border-pink-500/40 space-y-1 shadow-md">
                <div className="text-xs font-black text-slate-400 flex items-center gap-1">
                  <Trophy className="w-4 h-4 text-pink-400" />
                  <span>🏆 節奏勳章獎勵</span>
                </div>
                <div className="text-xl sm:text-2xl font-black text-pink-300">
                  穩健閱讀家
                </div>
                <div className="text-[10px] text-pink-400 font-bold">
                  +100 經驗值加成
                </div>
              </div>
            </div>

            {/* Page-by-Page Dwelling Duration Bar Chart */}
            <div className="p-5 rounded-3xl bg-slate-900 border border-teal-500/40 space-y-4 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-teal-400" />
                    <span>各頁面閱讀停留時間與專注分佈 (Page Dwelling Duration)</span>
                  </h3>
                  <p className="text-xs font-bold text-slate-400 mt-0.5">
                    分析您在繪本各個關鍵頁面的停留思考時間
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-teal-950 border border-teal-500/40 text-teal-300 font-bold text-xs self-start sm:self-center">
                  即時節奏演算法監控中
                </span>
              </div>

              {/* Bar Chart Simulation */}
              <div className="space-y-3 pt-2">
                {book.pages.map((p, idx) => {
                  const duration = pageTimes[idx] || 40;
                  const isPeak = duration > 48;
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs font-bold text-slate-300">
                        <span className="flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-full bg-slate-800 text-amber-300 flex items-center justify-center text-[10px] font-black">
                            {idx + 1}
                          </span>
                          <span>第 {idx + 1} 頁內容：{typeof p.text === 'string' ? p.text.substring(0, 18) : '故事內文'}...</span>
                        </span>
                        <span className="text-teal-300 font-black">{duration} 秒 {isPeak ? '🔥 (關鍵轉折深思考)' : ''}</span>
                      </div>
                      <div className="w-full h-3.5 rounded-full bg-slate-950 p-0.5 border border-slate-800 overflow-hidden flex">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${
                            isPeak ? 'bg-gradient-to-r from-amber-400 to-yellow-500' : 'bg-gradient-to-r from-teal-500 to-emerald-500'
                          }`}
                          style={{ width: `${Math.min(100, (duration / 60) * 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Smart AI Advice Box */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-teal-400/40 space-y-1.5">
                <div className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>AI 智慧閱讀節奏分析建言：</span>
                </div>
                <p className="text-xs sm:text-sm font-bold text-teal-200 leading-relaxed">
                  {paceAnalytics?.smartAdvice || '您的閱讀步調極為勻稱安定，在第 2 頁的思考時間最充裕，代表您對故事關鍵轉折充滿好奇心！建議持續保持這種高品質的深度陪伴與探索！'}
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* TAB 3: 💬 閱讀社交牆 (Reading Social Wall) */
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-950/90">

            {/* Create Post Section */}
            <div className="p-4 sm:p-5 rounded-3xl bg-slate-900 border border-purple-500/40 space-y-3 shadow-xl">
              <div className="flex items-center justify-between border-b border-purple-500/30 pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">✍️</span>
                  <h3 className="text-sm sm:text-base font-black text-white">
                    發布故事脈絡心得 ‧ 分享閱讀喜悅
                  </h3>
                </div>
                <span className="text-xs font-bold text-purple-300">
                  以【{profile?.displayName || '小讀者'}】身份發布
                </span>
              </div>

              {/* Input Area */}
              <textarea
                value={postInput}
                onChange={(e) => setPostInput(e.target.value)}
                placeholder="寫下您對這本繪本或當前關鍵場景的心得想法，與大家分享隱藏角色的秘密吧..."
                rows={3}
                className="w-full p-3.5 rounded-2xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-xs sm:text-sm font-bold focus:outline-none focus:border-purple-400 transition-colors"
              />

              {/* Post Controls: Rating & Theme Card Selection */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-3 flex-wrap">
                  {/* Rating Stars */}
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-slate-400">繪本推薦評分：</span>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setPostRating(s)}
                        className="text-lg hover:scale-110 transition-transform cursor-pointer"
                      >
                        <Star className={`w-4 h-4 ${s <= postRating ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}`} />
                      </button>
                    ))}
                  </div>

                  {/* Card Theme Theme */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-400">背景樣式：</span>
                    {(['starry', 'forest', 'castle', 'ocean'] as const).map((thm) => (
                      <button
                        key={thm}
                        type="button"
                        onClick={() => setSelectedPostTheme(thm)}
                        className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                          selectedPostTheme === thm
                            ? 'bg-purple-600 text-white border-purple-300'
                            : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                        }`}
                      >
                        {thm === 'starry' ? '✨ 星空' : thm === 'forest' ? '🌲 森林' : thm === 'castle' ? '🏰 城堡' : '🌊 深海'}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handlePublishPost}
                  disabled={!postInput.trim()}
                  className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-40 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md transition-transform hover:scale-105 cursor-pointer shrink-0"
                >
                  <Send className="w-4 h-4" />
                  <span>發布動態</span>
                </button>
              </div>
            </div>

            {/* Social Posts Feed */}
            <div className="space-y-4">
              <div className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-amber-300" />
                <span>社群書友即時閱讀動態牆 ({socialPosts.length})</span>
              </div>

              {socialPosts.map((post) => (
                <div
                  key={post.id}
                  className={`p-4 sm:p-5 rounded-3xl border shadow-xl space-y-3 transition-all ${
                    post.theme === 'starry'
                      ? 'bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 border-indigo-500/40'
                      : post.theme === 'forest'
                      ? 'bg-gradient-to-r from-slate-950 via-emerald-950 to-slate-950 border-emerald-500/40'
                      : post.theme === 'castle'
                      ? 'bg-gradient-to-r from-slate-950 via-purple-950 to-slate-950 border-purple-500/40'
                      : 'bg-gradient-to-r from-slate-950 via-cyan-950 to-slate-950 border-cyan-500/40'
                  }`}
                >
                  {/* Post Author Bar */}
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl p-1.5 rounded-2xl bg-slate-900 border border-slate-700">
                        {post.authorAvatar}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs sm:text-sm font-black text-white">
                            {post.authorName}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold border border-purple-400/30">
                            {post.authorRole}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-bold mt-0.5">
                          繪本《{bookTitleStr}》第 {post.pageNumber} 頁 ‧ {post.timestamp}
                        </div>
                      </div>
                    </div>

                    {/* Star Rating */}
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className={`w-3.5 h-3.5 ${s <= post.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'}`} />
                      ))}
                    </div>
                  </div>

                  {/* Post Content */}
                  <p className="text-xs sm:text-sm font-bold text-slate-100 leading-relaxed">
                    {post.content}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {post.tags.map((tg, tIdx) => (
                      <span key={tIdx} className="px-2.5 py-1 rounded-xl bg-slate-900 text-purple-300 text-[10px] font-bold border border-slate-800">
                        {tg}
                      </span>
                    ))}
                  </div>

                  {/* Actions & Likes */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                    <button
                      type="button"
                      onClick={() => handleToggleLike(post.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer transition-transform hover:scale-105 ${
                        post.isLiked ? 'bg-pink-500/20 text-pink-300 border border-pink-400/40' : 'bg-slate-900 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-pink-400 text-pink-400' : ''}`} />
                      <span>{post.likes} 個愛心</span>
                    </button>

                    <span className="text-[11px] font-bold text-slate-400">
                      💬 {post.comments.length} 則共讀討論
                    </span>
                  </div>

                  {/* Comments List */}
                  {post.comments.length > 0 && (
                    <div className="space-y-2 pt-2">
                      {post.comments.map((c) => (
                        <div key={c.id} className="p-2.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs font-bold text-slate-300 flex items-start gap-2">
                          <span className="text-purple-300 font-black shrink-0">{c.author}:</span>
                          <span className="text-slate-200">{c.text}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Comment Input */}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      value={commentInputs[post.id] || ''}
                      onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                      placeholder="留下溫馨共讀回應..."
                      className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-bold focus:outline-none focus:border-purple-400"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddComment(post.id)}
                      className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs cursor-pointer"
                    >
                      回應
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
