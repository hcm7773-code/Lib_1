import React, { useState, useEffect, useRef } from 'react';
import {
  X, Users, Share2, Copy, Check, MessageSquare, Volume2, Sparkles,
  Zap, Heart, Award, Activity, BarChart3, Wind, Play, Send, ChevronLeft,
  ChevronRight, Compass, ShieldCheck, Flame, Star, Bot, CornerDownRight, CheckCircle2,
  Trophy
} from 'lucide-react';
import { Book } from '../types';
import { speakText, playStarChime, playPageTurnSound } from '../utils/audio';

interface ChatMessage {
  id: string;
  senderRole: 'moderator' | 'child' | 'parent' | 'friend';
  senderName: string;
  senderAvatar: string;
  text: string;
  timestamp: string;
  badge?: string;
}

interface AiCoReadingRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: Book;
  currentPageIndex: number;
  onJumpToPage: (pageIndex: number) => void;
}

export const AiCoReadingRoomModal: React.FC<AiCoReadingRoomModalProps> = ({
  isOpen,
  onClose,
  book,
  currentPageIndex,
  onJumpToPage,
}) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'dashboard'>('chat');
  const [userRole, setUserRole] = useState<'child' | 'parent' | 'friend'>('child');
  const [roomId] = useState(() => 'ROOM-' + Math.floor(1000 + Math.random() * 9000));
  const [copiedLink, setCopiedLink] = useState(false);

  // Participants State
  const [participants, setParticipants] = useState([
    { id: 'p1', role: 'child', name: '小明 (探險孩童)', avatar: '👦', status: 'online' },
    { id: 'p2', role: 'parent', name: '媽媽 (陪伴導師)', avatar: '👩', status: 'online' },
    { id: 'p3', role: 'moderator', name: 'AI 故事版主', avatar: '🤖', status: 'moderating' },
  ]);

  // AI Moderator Guidance & Chat Messages
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [moderatorPrompt, setModeratorPrompt] = useState<string>('');
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const [encouragement, setEncouragement] = useState<string>('');

  // AI Focus Dashboard Analytics State
  const [focusScore, setFocusScore] = useState<number>(92);
  const [thoughtJumpRate, setThoughtJumpRate] = useState<number>(15);
  const [discussionHeat, setDiscussionHeat] = useState<number>(88);
  const [synergyInsight, setSynergyInsight] = useState<string>('雙方目前互動默契絕佳，孩子的思緒專注力維持在頂峰狀態！');

  // Deep Breathing Exercise State
  const [isBreathing, setIsBreathing] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'in' | 'hold' | 'out'>('in');
  const [breathCount, setBreathCount] = useState(4);

  const chatEndRef = useRef<HTMLDivElement>(null);

  const currentPageNumber = currentPageIndex + 1;
  const currentPageObj = book.pages[currentPageIndex] || book.pages[0];
  const bookTitleStr = typeof book.title === 'string' ? book.title : (book.title['zh-TW'] || book.title.en || '精選繪本');
  const pageTextContent = typeof currentPageObj.text === 'string' ? currentPageObj.text : (currentPageObj.text['zh-TW'] || currentPageObj.text.en || '');

  // 1. Initial / Page Change fetch AI Moderator prompt
  useEffect(() => {
    if (isOpen) {
      fetchModeratorGuidance('init_prompt');
    }
  }, [isOpen, currentPageIndex]);

  // Scroll to bottom when messages update
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoadingAi]);

  // Breathing Exercise Loop Timer
  useEffect(() => {
    let interval: any = null;
    if (isBreathing) {
      interval = setInterval(() => {
        setBreathCount((prev) => {
          if (prev <= 1) {
            setBreathPhase((phase) => {
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
  }, [isBreathing]);

  // Fetch AI Moderator guidance from server endpoint
  const fetchModeratorGuidance = async (action: 'init_prompt' | 'respond_message', userMsg: string = '') => {
    setIsLoadingAi(true);
    try {
      const res = await fetch('/api/gemini/coreading-moderator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookTitle: bookTitleStr,
          currentPage: currentPageNumber,
          pageText: pageTextContent,
          userRole,
          userMessage: userMsg,
          action,
        }),
      });

      const data = await res.json();
      if (data.moderatorPrompt) {
        setModeratorPrompt(data.moderatorPrompt);
        setSuggestedQuestions(data.suggestedQuestions || []);
        setEncouragement(data.encouragement || '');

        if (data.focusAnalysis) {
          setFocusScore(data.focusAnalysis.focusScore || 90);
          setThoughtJumpRate(data.focusAnalysis.thoughtJumpRate || 15);
          setDiscussionHeat(data.focusAnalysis.discussionHeat || 88);
          if (data.focusAnalysis.synergyInsight) {
            setSynergyInsight(data.focusAnalysis.synergyInsight);
          }
        }

        // Add Moderator message to thread
        const modMsg: ChatMessage = {
          id: 'mod-' + Date.now(),
          senderRole: 'moderator',
          senderName: '🤖 AI 共讀版主',
          senderAvatar: '🤖',
          text: data.moderatorPrompt,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          badge: action === 'init_prompt' ? `📍 第 ${currentPageNumber} 頁版主引導` : '✨ 即時講評與延伸討論',
        };

        setMessages((prev) => {
          // Prevent duplicates if init_prompt
          if (action === 'init_prompt' && prev.length === 0) {
            return [modMsg];
          }
          return [...prev, modMsg];
        });
      }
    } catch (e) {
      console.error('Co-Reading AI Error:', e);
      // Fallback message
      const fallbackMsg: ChatMessage = {
        id: 'mod-' + Date.now(),
        senderRole: 'moderator',
        senderName: '🤖 AI 共讀版主',
        senderAvatar: '🤖',
        text: `🤖 AI 版主引導：這頁故事真精彩！大家覺得主角在第 ${currentPageNumber} 頁遇到了什麼神奇的事呢？`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        badge: '📍 頁面討論',
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoadingAi(false);
    }
  };

  // Copy Sharing Link
  const handleCopyShareLink = () => {
    const url = `${window.location.origin}${window.location.pathname}?room=${roomId}&book=${book.id}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    playStarChime();
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Send Message
  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim()) return;

    playStarChime();

    const roleNameMap = {
      child: '小明 (孩童)',
      parent: '媽媽 (陪讀家長)',
      friend: '小華 (共讀好友)',
    };

    const roleAvatarMap = {
      child: '👦',
      parent: '👩',
      friend: '🦄',
    };

    const userMsg: ChatMessage = {
      id: 'user-' + Date.now(),
      senderRole: userRole,
      senderName: roleNameMap[userRole],
      senderAvatar: roleAvatarMap[userRole],
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');

    // Trigger AI Moderator response
    setTimeout(() => {
      fetchModeratorGuidance('respond_message', text);
    }, 600);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-fadeIn">
      <div className="w-full max-w-5xl h-[92vh] rounded-3xl bg-slate-900 border-2 border-indigo-500/80 shadow-2xl flex flex-col overflow-hidden relative">

        {/* 1. Top Header Bar */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 border-b border-indigo-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <span className="p-3 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-600 text-white shadow-lg animate-pulse">
              <Users className="w-6 h-6" />
            </span>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-black text-white">
                  👥 AI 共讀室 (AI Co-Reading Room)
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-black text-xs flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  Live 共讀進行中 ({roomId})
                </span>
              </div>
              <p className="text-xs text-slate-300 font-bold mt-0.5">
                繪本《{bookTitleStr}》‧ AI 自動擔任版主引導親子與好友深度對話
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            {/* Share Link Button */}
            <button
              type="button"
              onClick={handleCopyShareLink}
              className={`px-3.5 py-2 rounded-2xl font-black text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer ${
                copiedLink
                  ? 'bg-emerald-500 text-slate-950 ring-2 ring-emerald-300'
                  : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white border border-purple-400/50'
              }`}
            >
              {copiedLink ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4 text-amber-300" />}
              <span>{copiedLink ? '已複製邀請連結！' : '🔗 邀請家長/好友參與'}</span>
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

        {/* 2. Mode Tabs & Role Switcher Bar */}
        <div className="px-4 py-2.5 bg-slate-950 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shrink-0">
          {/* Tab Selector */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setActiveTab('chat');
                playStarChime();
              }}
              className={`px-4 py-2 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'chat'
                  ? 'bg-indigo-600 text-white shadow-md ring-1 ring-indigo-400'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>💬 共讀對話 & AI 版主引導</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('dashboard');
                playStarChime();
              }}
              className={`px-4 py-2 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-slate-950 shadow-md ring-1 ring-teal-300'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>📊 AI 專注儀表板</span>
            </button>
          </div>

          {/* Role Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-2xl border border-slate-800">
            <span className="text-[10px] font-black text-slate-400 px-2">切換發言身份：</span>
            <button
              type="button"
              onClick={() => setUserRole('child')}
              className={`px-2.5 py-1 rounded-xl text-xs font-black transition-all cursor-pointer ${
                userRole === 'child' ? 'bg-amber-400 text-slate-950 shadow-xs' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              👦 孩童
            </button>
            <button
              type="button"
              onClick={() => setUserRole('parent')}
              className={`px-2.5 py-1 rounded-xl text-xs font-black transition-all cursor-pointer ${
                userRole === 'parent' ? 'bg-purple-500 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              👩 陪讀家長
            </button>
            <button
              type="button"
              onClick={() => setUserRole('friend')}
              className={`px-2.5 py-1 rounded-xl text-xs font-black transition-all cursor-pointer ${
                userRole === 'friend' ? 'bg-pink-500 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🦄 共讀好友
            </button>
          </div>
        </div>

        {/* 3. Main Body */}
        {activeTab === 'chat' ? (
          <div className="flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden">
            {/* Left Column: Current Page Preview & Participants (1/3) */}
            <div className="w-full md:w-80 bg-slate-950/60 border-r border-slate-800 p-4 space-y-4 overflow-y-auto shrink-0 flex flex-col justify-between">
              <div className="space-y-4">
                {/* Page Navigation & Image Preview */}
                <div className="p-3.5 rounded-2xl bg-slate-900 border border-indigo-500/30 space-y-2">
                  <div className="flex items-center justify-between text-xs font-black text-amber-300">
                    <span className="flex items-center gap-1">
                      <Compass className="w-4 h-4" />
                      <span>同步繪本閱讀視角</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-indigo-900 text-indigo-200 text-[10px]">
                      第 {currentPageNumber} / {book.pages.length} 頁
                    </span>
                  </div>

                  {/* Page Image */}
                  <div className="relative aspect-video sm:aspect-4/3 rounded-xl overflow-hidden border border-slate-800 bg-slate-950 group">
                    <img
                      src={currentPageObj.imageUrl}
                      alt={`第 ${currentPageNumber} 頁`}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
                    <div className="absolute bottom-2 left-2 right-2 text-[11px] font-bold text-slate-200 line-clamp-2 bg-slate-950/70 p-1.5 rounded-lg backdrop-blur-xs">
                      {pageTextContent}
                    </div>
                  </div>

                  {/* Page Jump Controls */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <button
                      type="button"
                      disabled={currentPageIndex === 0}
                      onClick={() => {
                        playPageTurnSound();
                        onJumpToPage(currentPageIndex - 1);
                      }}
                      className="flex-1 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      <span>上一頁</span>
                    </button>

                    <button
                      type="button"
                      disabled={currentPageIndex >= book.pages.length - 1}
                      onClick={() => {
                        playPageTurnSound();
                        onJumpToPage(currentPageIndex + 1);
                      }}
                      className="flex-1 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span>下一頁</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Live Participants List */}
                <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="text-xs font-black text-indigo-300 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-amber-300" />
                      <span>共讀室線上成員 (3)</span>
                    </span>
                    <span className="text-[10px] text-emerald-400 font-bold">● 連線穩定</span>
                  </div>

                  <div className="space-y-2">
                    {participants.map((p) => (
                      <div key={p.id} className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{p.avatar}</span>
                          <div>
                            <div className="text-xs font-bold text-slate-200">{p.name}</div>
                            <div className="text-[10px] text-slate-400 font-medium">
                              {p.role === 'moderator' ? '🤖 AI 共讀引導員' : '🟢 即時語音與文字互動'}
                            </div>
                          </div>
                        </div>
                        {p.role === 'moderator' && (
                          <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold border border-purple-400/30">
                            版主
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Quick Focus Stat */}
              <div className="p-3 rounded-2xl bg-gradient-to-r from-teal-950 to-slate-950 border border-teal-500/30 text-xs font-bold text-teal-200 flex items-center justify-between">
                <span>🎯 即時專注度：{focusScore}%</span>
                <span className="text-amber-300 font-black">🔥 討論熱度 94</span>
              </div>
            </div>

            {/* Right Column: AI Moderator Chat & Live Discussion Thread (2/3) */}
            <div className="flex-1 flex flex-col min-h-0 bg-slate-900/50">

              {/* Chat Thread Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">

                {/* AI Moderator Active Banner Prompt */}
                <div className="p-4 rounded-3xl bg-gradient-to-r from-purple-950/90 via-indigo-950/90 to-slate-950 border border-amber-400/60 shadow-xl space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between border-b border-purple-500/30 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 rounded-xl bg-amber-400 text-slate-950 font-black text-sm">
                        🤖 AI 共讀版主即時引導
                      </span>
                      <span className="text-xs text-amber-300 font-black">
                        第 {currentPageNumber} 頁主題對談
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => speakText(moderatorPrompt, 'zh-TW')}
                      className="px-3 py-1.5 rounded-xl bg-purple-500/30 hover:bg-purple-500/50 text-purple-200 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-amber-300" />
                      <span>朗讀引導</span>
                    </button>
                  </div>

                  <p className="text-sm font-black text-white leading-relaxed">
                    {moderatorPrompt || '正在為大家生成這一頁的最佳共讀討論點...'}
                  </p>

                  {encouragement && (
                    <p className="text-xs font-bold text-teal-300 bg-teal-950/60 p-2 rounded-xl border border-teal-500/30">
                      💡 陪伴小貼士：{encouragement}
                    </p>
                  )}

                  {/* Preset Suggested Questions / Quick Choice Chips */}
                  {suggestedQuestions.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <div className="text-[11px] font-black text-amber-200">
                        ✨ 版主推薦快速回覆 / 發問選項：
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {suggestedQuestions.map((sq, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleSendMessage(sq)}
                            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-purple-900 border border-purple-400/40 text-xs font-bold text-purple-200 hover:text-white transition-all cursor-pointer text-left shadow-xs flex items-center gap-1"
                          >
                            <CornerDownRight className="w-3 h-3 text-amber-400 shrink-0" />
                            <span>{sq}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Messages Thread */}
                {messages.map((m) => {
                  const isMod = m.senderRole === 'moderator';
                  return (
                    <div
                      key={m.id}
                      className={`flex gap-3 ${isMod ? 'justify-start' : 'justify-end'} animate-fadeIn`}
                    >
                      {isMod && (
                        <div className="w-9 h-9 rounded-2xl bg-purple-900 border border-purple-400/50 flex items-center justify-center text-xl shrink-0 shadow-md">
                          {m.senderAvatar}
                        </div>
                      )}

                      <div className={`max-w-lg space-y-1 ${isMod ? 'text-left' : 'text-right'}`}>
                        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 justify-end flex-row-reverse">
                          <span>{m.timestamp}</span>
                          <span className="text-slate-200 font-black">{m.senderName}</span>
                          {m.badge && (
                            <span className="px-2 py-0.5 rounded-full bg-indigo-900 text-amber-300 font-black text-[9px]">
                              {m.badge}
                            </span>
                          )}
                        </div>

                        <div
                          className={`p-3.5 rounded-2xl text-xs sm:text-sm font-bold shadow-md leading-relaxed ${
                            isMod
                              ? 'bg-gradient-to-r from-purple-950 to-slate-900 text-purple-100 border border-purple-500/40 rounded-tl-none'
                              : m.senderRole === 'child'
                              ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 rounded-tr-none font-black'
                              : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-tr-none'
                          }`}
                        >
                          {m.text}
                        </div>
                      </div>

                      {!isMod && (
                        <div className="w-9 h-9 rounded-2xl bg-amber-400 text-slate-950 font-black flex items-center justify-center text-xl shrink-0 shadow-md">
                          {m.senderAvatar}
                        </div>
                      )}
                    </div>
                  );
                })}

                {isLoadingAi && (
                  <div className="flex items-center gap-2 p-3 rounded-2xl bg-slate-950/80 border border-purple-500/40 text-xs font-bold text-purple-300 animate-pulse w-fit">
                    <Bot className="w-4 h-4 text-amber-300 animate-spin" />
                    <span>AI 共讀版主正在思考與給予引導回應中...</span>
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>

              {/* Chat Input Bar */}
              <div className="p-3 sm:p-4 bg-slate-950 border-t border-slate-800 flex items-center gap-2 shrink-0">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder={`以【${userRole === 'child' ? '👦 孩童' : userRole === 'parent' ? '👩 陪讀家長' : '🦄 共讀好友'}】發言發問或分享感想...`}
                  className="flex-1 px-4 py-3 rounded-2xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs sm:text-sm font-bold focus:outline-none focus:border-indigo-400 transition-colors"
                />

                <button
                  type="button"
                  onClick={() => handleSendMessage()}
                  disabled={!inputMessage.trim()}
                  className="px-4 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 disabled:opacity-40 text-white font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-md transition-transform hover:scale-105 cursor-pointer shrink-0"
                >
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">傳送</span>
                </button>
              </div>

            </div>
          </div>
        ) : (
          /* 📊 Tab 2: AI 專注儀表板 (AI Focus & Engagement Dashboard) */
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-950/80">

            {/* Top Stat Overview Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              <div className="p-4 rounded-3xl bg-slate-900 border border-teal-500/40 space-y-1 shadow-md">
                <div className="text-xs font-black text-slate-400 flex items-center gap-1">
                  <Activity className="w-4 h-4 text-teal-400" />
                  <span>🎯 即時專注度指數</span>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-teal-300">
                  {focusScore}%
                </div>
                <div className="text-[10px] text-emerald-400 font-bold">
                  ● 高度沉浸專注狀態
                </div>
              </div>

              <div className="p-4 rounded-3xl bg-slate-900 border border-purple-500/40 space-y-1 shadow-md">
                <div className="text-xs font-black text-slate-400 flex items-center gap-1">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <span>💬 雙方互動熱度</span>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-amber-300">
                  {discussionHeat} 分
                </div>
                <div className="text-[10px] text-amber-400 font-bold">
                  🔥 對話與反饋極度熱烈
                </div>
              </div>

              <div className="p-4 rounded-3xl bg-slate-900 border border-indigo-500/40 space-y-1 shadow-md">
                <div className="text-xs font-black text-slate-400 flex items-center gap-1">
                  <Zap className="w-4 h-4 text-indigo-400" />
                  <span>🫁 思緒跳躍度</span>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-indigo-200">
                  {thoughtJumpRate}%
                </div>
                <div className="text-[10px] text-indigo-300 font-bold">
                  黃金思考安定區間 (10-25%)
                </div>
              </div>

              <div className="p-4 rounded-3xl bg-slate-900 border border-pink-500/40 space-y-1 shadow-md">
                <div className="text-xs font-black text-slate-400 flex items-center gap-1">
                  <Heart className="w-4 h-4 text-pink-400" />
                  <span>💖 親子默契指數</span>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-pink-300">
                  96%
                </div>
                <div className="text-[10px] text-pink-400 font-bold">
                  ✨ 完美雙向交流比
                </div>
              </div>
            </div>

            {/* Focus & Thought Jump Curve Visualization */}
            <div className="p-5 rounded-3xl bg-slate-900 border border-indigo-500/40 space-y-4 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-teal-400 text-slate-950 font-black text-[10px]">
                      📊 生態流專注度即時圖表
                    </span>
                    <span className="text-xs font-bold text-teal-300">
                      思緒波形 & 對話熱度聯動
                    </span>
                  </div>
                  <h3 className="text-base font-black text-white mt-1">
                    孩童共讀專注度與思緒跳躍流向曲線 (Focus Waveform Analytics)
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsBreathing(!isBreathing);
                    playStarChime();
                    if (!isBreathing) {
                      speakText('開啟 1 分鐘親子深呼吸放鬆引導。跟著提示慢慢吸氣、留氣與吐氣...', 'zh-TW');
                    }
                  }}
                  className="px-4 py-2 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md cursor-pointer shrink-0"
                >
                  <Wind className="w-4 h-4" />
                  <span>{isBreathing ? '結束深呼吸練習' : '🫁 1 分鐘親子深呼吸練習'}</span>
                </button>
              </div>

              {/* Dynamic Waveform Simulation */}
              <div className="h-28 w-full bg-slate-950/80 rounded-2xl border border-slate-800 p-3 flex items-end justify-between gap-1 overflow-hidden">
                {[85, 88, 92, 90, 95, 98, 92, 89, 94, 96, 91, 95, 93, 97, 94].map((val, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group">
                    <div
                      className="w-full rounded-t-lg bg-gradient-to-t from-indigo-600 via-teal-400 to-amber-300 transition-all duration-500 group-hover:bg-amber-300"
                      style={{ height: `${val}%` }}
                    />
                    <span className="text-[8px] font-bold text-slate-500">{idx + 1}m</span>
                  </div>
                ))}
              </div>

              <p className="text-xs font-bold text-slate-300 bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
                💡 <span className="text-teal-300 font-black">AI 專注觀察報告：</span>{synergyInsight}
              </p>

              {/* Interactive Breathing Bubble */}
              {isBreathing && (
                <div className="p-5 rounded-3xl bg-slate-950 border border-teal-400/50 flex flex-col items-center justify-center space-y-3 animate-fadeIn">
                  <div
                    className={`w-28 h-28 rounded-full flex items-center justify-center text-3xl font-black transition-all duration-1000 shadow-2xl ${
                      breathPhase === 'in'
                        ? 'scale-125 bg-gradient-to-tr from-teal-400 to-emerald-300 text-slate-950 ring-8 ring-teal-400/30'
                        : breathPhase === 'hold'
                        ? 'scale-110 bg-amber-400 text-slate-950 ring-8 ring-amber-400/30'
                        : 'scale-90 bg-indigo-500 text-white ring-8 ring-indigo-500/30'
                    }`}
                  >
                    {breathPhase === 'in' ? '🌬️ 吸氣' : breathPhase === 'hold' ? '✨ 留氣' : '💨 吐氣'}
                  </div>
                  <div className="text-center space-y-1">
                    <div className="text-sm font-black text-amber-300">
                      {breathPhase === 'in' ? '深深吸氣 4 秒鐘...' : breathPhase === 'hold' ? '保持停頓 2 秒鐘...' : '緩緩吐氣 4 秒鐘...'}
                    </div>
                    <div className="text-xs font-bold text-slate-400">
                      調節節奏放鬆大腦，接著繼續精彩故事共讀！
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Parent-Child Interaction Synergy & Achievement Badges */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Interaction Turn-taking Balance */}
              <div className="p-5 rounded-3xl bg-slate-900 border border-purple-500/40 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h4 className="font-black text-sm text-purple-200 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-amber-300" />
                    <span>對話發言輪流天秤 (Turn-taking Ratio)</span>
                  </h4>
                  <span className="text-xs font-black text-emerald-400">對等黃金比例</span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-slate-300">
                    <span>👦 孩童發問與表達 (52%)</span>
                    <span>👨‍👩‍👧 家長/好友回應引導 (48%)</span>
                  </div>
                  <div className="w-full h-4 rounded-full bg-slate-950 overflow-hidden flex p-0.5 border border-slate-800">
                    <div className="h-full bg-amber-400 rounded-l-full transition-all duration-500" style={{ width: '52%' }} />
                    <div className="h-full bg-purple-500 rounded-r-full transition-all duration-500" style={{ width: '48%' }} />
                  </div>
                  <p className="text-[11px] font-medium text-slate-400">
                    ✨ 此發言比率展現了最理想的主動表達與傾聽引導平衡！
                  </p>
                </div>
              </div>

              {/* Co-Reading Badges */}
              <div className="p-5 rounded-3xl bg-slate-900 border border-amber-500/40 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h4 className="font-black text-sm text-amber-300 flex items-center gap-1.5">
                    <Trophy className="w-4 h-4 text-amber-400" />
                    <span>本次共讀贏得榮譽勳章</span>
                  </h4>
                  <span className="text-xs font-black text-amber-400">+150 經驗點數</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2.5 rounded-2xl bg-slate-950 border border-amber-400/40 text-center space-y-1">
                    <div className="text-2xl">🥇</div>
                    <div className="text-[10px] font-black text-amber-300">默契神隊友</div>
                  </div>
                  <div className="p-2.5 rounded-2xl bg-slate-950 border border-purple-400/40 text-center space-y-1">
                    <div className="text-2xl">💡</div>
                    <div className="text-[10px] font-black text-purple-200">深度思考家</div>
                  </div>
                  <div className="p-2.5 rounded-2xl bg-slate-950 border border-teal-400/40 text-center space-y-1">
                    <div className="text-2xl">🌟</div>
                    <div className="text-[10px] font-black text-teal-300">故事沉浸星</div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
