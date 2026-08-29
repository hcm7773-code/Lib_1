import React, { useState, useEffect } from 'react';
import {
  Bot, Search, Sparkles, Database, Wifi, WifiOff, Cloud, RefreshCw,
  Award, CheckCircle2, X, Play, Volume2, ShieldCheck, Star, Trophy,
  BookOpen, Clock, Heart, HelpCircle, Send, FileText, Check,
  ChevronRight, Zap, Flame, Compass, MessageSquare, Lightbulb,
  UserCheck, ArrowRight, Download, Archive, Share2, Layers, Filter,
  Smile, Mic, Brain, Sparkle, Tag
} from 'lucide-react';
import { Book, UserProfile } from '../types';
import { playStarChime, playPageTurnSound, speakText } from '../utils/audio';

export interface DetectiveQuestion {
  id: string;
  bookId: string;
  bookTitle: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  category: 'plot' | 'character' | 'moral' | 'vocab' | 'detail';
  clueTip: string;
  rewardStars: number;
}

export interface DetectiveInteractionLog {
  id: string;
  bookId: string;
  bookTitle: string;
  questionText: string;
  childAnswer: string;
  isCorrect: boolean;
  scoreEarned: number;
  timestamp: string;
  syncedToCloud: boolean;
  category: string;
}

export interface OfflineDetectiveBotProps {
  downloadedBooks: Book[];
  allBooks?: Book[];
  userProfile?: UserProfile;
  isOnline?: boolean;
  onUpdateStars?: (stars: number) => void;
  onSelectBook?: (book: Book) => void;
}

export function getBookMoral(book: Book): string {
  const customMoral = (book as any).moral;
  if (customMoral) return customMoral;

  switch (book.category) {
    case 'Friendship & Love':
      return '友誼與分享能讓我們的心緊緊相連，學會同理與關懷身邊的每一個人。';
    case 'Adventure':
      return '面對未知的世界保持好奇心與勇敢，困難都是成長最珍貴的養分。';
    case 'Nature & Science':
      return '探索自然萬物的奇妙奧秘，愛護地球環境並尊重每一個小小生命。';
    case 'Culture & Heritage':
      return '世界如此遼闊多元，欣賞不同文化的風俗與故事，拓展世界視野。';
    case 'Moral & Wisdom':
      return '誠實、勇敢與善良是人生最堅固的指南針，引領我們做出正確的選擇。';
    case 'Fairy Tale':
    default:
      return '保持純真與想像力，勇敢堅持自己的夢想，溫暖善良總能收穫奇蹟。';
  }
}

// Generate smart offline detective questions based on downloaded books
export function generateDetectiveQuestionsForBook(book: Book): DetectiveQuestion[] {
  const title = typeof book.title === 'string' ? book.title : (book.title['zh-TW'] || book.title.en || '精選繪本');
  const summary = typeof book.summary === 'string' ? book.summary : (book.summary['zh-TW'] || book.summary.en || '');
  const cat = book.category || 'Fairy Tale';
  const moral = getBookMoral(book);

  return [
    {
      id: `q_${book.id}_1`,
      bookId: book.id,
      bookTitle: title,
      question: `【核心情節偵探】在《${title}》這個故事中，最主要的冒險或情節是什麼呢？`,
      options: [
        summary.slice(0, 30) || '主角經歷了一場勇敢且充滿驚喜的奇幻旅程',
        '主角一整天都在房間裡睡覺，什麼事情都沒有發生',
        '主角搭乘時光機去了外太空吃冰淇淋',
        '故事裡只有一隻大恐龍在跳踢踏舞',
      ],
      correctIndex: 0,
      explanation: `沒錯！《${title}》講述了精彩的故事：${summary.slice(0, 60)}...`,
      category: 'plot',
      clueTip: '回想一下繪本封面和開頭第一頁的故事設定喔！',
      rewardStars: 15,
    },
    {
      id: `q_${book.id}_2`,
      bookId: book.id,
      bookTitle: title,
      question: `【智慧寓意定錨】這本繪本希望帶給我們什麼寶貴的人生智慧或啟發？`,
      options: [
        '遇到困難就馬上放棄回家',
        moral || '學會同理心、分享快樂與勇敢面對挑戰',
        '只關心自己，不管身邊的朋友',
        '每天吃十包糖果不需要刷牙',
      ],
      correctIndex: 1,
      explanation: `答對了！故事的核心智慧是：「${moral}」，記在心裡會讓我們變得更棒！`,
      category: 'moral',
      clueTip: '想想看故事結尾大家的心情與改變！',
      rewardStars: 20,
    },
    {
      id: `q_${book.id}_3`,
      bookId: book.id,
      bookTitle: title,
      question: `【觀察力尋寶】這本故事屬於哪一種精彩的繪本類型，它的發源文化是？`,
      options: [
        '外星人百科全書',
        `${book.originCountry || '經典世界'}文化 ‧ ${cat} 領域故事`,
        '數學計算練習本',
        '古董車修理手冊',
      ],
      correctIndex: 1,
      explanation: `太厲害了！《${title}》來自 ${book.originCountry || '世界著名經典'}，是一本非常經典的 ${cat} 繪本！`,
      category: 'detail',
      clueTip: '看看書籍的國旗標籤與主題分類喔！',
      rewardStars: 15,
    },
    {
      id: `q_${book.id}_4`,
      bookId: book.id,
      bookTitle: title,
      question: `【雙語詞彙考驗】如果用一個英文詞彙來形容這本故事的主題精神，最棒的是哪一個？`,
      options: [
        'Adventure & Courage (冒險與勇氣)',
        'Sleepy & Boring (無聊與睡覺)',
        'Angry & Fighting (生氣與吵架)',
        'Forget & Lose (忘記與丟失)',
      ],
      correctIndex: 0,
      explanation: `Bingo！Adventure (冒險) 與 Courage (勇氣) 是每位小讀者在故事中學到的超能力！`,
      category: 'vocab',
      clueTip: '每本好故事都充滿了積極陽光的精神！',
      rewardStars: 20,
    },
  ];
}

export const OfflineDetectiveBot: React.FC<OfflineDetectiveBotProps> = ({
  downloadedBooks = [],
  allBooks = [],
  userProfile,
  isOnline = true,
  onUpdateStars,
  onSelectBook,
}) => {
  // Pool of available books to investigate
  const availableBooks = downloadedBooks.length > 0 ? downloadedBooks : (allBooks.length > 0 ? allBooks : []);

  // Sub-tabs: 'qa_game' | 'free_ask' | 'knowledge_capsule' | 'sync_history'
  const [subTab, setSubTab] = useState<'qa_game' | 'free_ask' | 'knowledge_capsule' | 'sync_history'>('qa_game');

  // Selected Book for Detective Investigation
  const [selectedBookId, setSelectedBookId] = useState<string>(() => {
    return availableBooks[0]?.id || '';
  });

  // Detective Persona
  const [botVoiceRole, setBotVoiceRole] = useState<'detective' | 'owl' | 'fairy' | 'robot'>('detective');

  // --- Q&A Detective Game States ---
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);
  const [showClue, setShowClue] = useState<boolean>(false);
  const [streakCount, setStreakCount] = useState<number>(0);
  const [totalDetectiveScore, setTotalDetectiveScore] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('pwa_detective_score');
      return saved ? Number(saved) : 120;
    } catch {
      return 120;
    }
  });

  // --- Free Asking States ---
  const [childQueryInput, setChildQueryInput] = useState<string>('');
  const [chatMessages, setChatMessages] = useState<{ sender: 'bot' | 'child'; text: string; time: string; bookTag?: string }[]>(() => {
    return [
      {
        sender: 'bot',
        text: '🕵️‍♂️ 嗨！我是你的【離線小偵探機器人】！就算現在沒有網路，我也把所有已下載繪本的故事情節、人物秘密與雙語詞彙通通裝在腦袋裡囉！你可以問我任何關於故事的問題，或是跟我玩「你問我答」破案遊戲！',
        time: '剛剛',
      },
    ];
  });

  // --- Interaction Logs & Cloud Sync States ---
  const [interactionLogs, setInteractionLogs] = useState<DetectiveInteractionLog[]>(() => {
    try {
      const saved = localStorage.getItem('pwa_offline_detective_logs');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [
      {
        id: 'log_init_1',
        bookId: 'rec_book_1',
        bookTitle: '小熊的魔法花園',
        questionText: '故事中主角最主要的冒險是什麼？',
        childAnswer: '主角經歷了一場勇敢且充滿驚喜的奇幻旅程',
        isCorrect: true,
        scoreEarned: 15,
        timestamp: '2026/08/14 10:15',
        syncedToCloud: true,
        category: '情節觀察',
      },
      {
        id: 'log_init_2',
        bookId: 'rec_book_1',
        bookTitle: '小熊的魔法花園',
        questionText: '繪本希望帶給我們什麼寶貴的人生智慧？',
        childAnswer: '學會同理心、分享快樂與勇敢面對挑戰',
        isCorrect: true,
        scoreEarned: 20,
        timestamp: '2026/08/14 10:18',
        syncedToCloud: false,
        category: '智慧寓意',
      },
    ];
  });

  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  // Sync state helpers
  const unsyncedLogs = interactionLogs.filter((log) => !log.syncedToCloud);
  const syncedLogs = interactionLogs.filter((log) => log.syncedToCloud);

  // Selected Active Book
  const activeBook = availableBooks.find((b) => b.id === selectedBookId) || availableBooks[0];

  // Active Questions for current book
  const activeQuestions = activeBook ? generateDetectiveQuestionsForBook(activeBook) : [];
  const currentQuestion = activeQuestions[currentQuestionIndex] || activeQuestions[0];

  // Auto-sync or save logs to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('pwa_offline_detective_logs', JSON.stringify(interactionLogs));
      localStorage.setItem('pwa_detective_score', String(totalDetectiveScore));
    } catch (e) {
      console.warn(e);
    }
  }, [interactionLogs, totalDetectiveScore]);

  // Handle Question Answer Choice
  const handleSelectOption = (idx: number) => {
    if (isAnswerSubmitted) return;
    playPageTurnSound();
    setSelectedOption(idx);
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null || isAnswerSubmitted || !currentQuestion) return;

    setIsAnswerSubmitted(true);
    const isCorrect = selectedOption === currentQuestion.correctIndex;

    if (isCorrect) {
      playStarChime();
      const addedScore = currentQuestion.rewardStars;
      const newScore = totalDetectiveScore + addedScore;
      setTotalDetectiveScore(newScore);
      setStreakCount((prev) => prev + 1);

      if (onUpdateStars && userProfile) {
        onUpdateStars((userProfile.stars || 0) + addedScore);
      }

      // Voice prompt
      const praise = `太棒了！答對了！${currentQuestion.explanation}`;
      speakText(praise, 'zh-TW');

      // Log interaction locally
      const newLog: DetectiveInteractionLog = {
        id: `log_${Date.now()}`,
        bookId: currentQuestion.bookId,
        bookTitle: currentQuestion.bookTitle,
        questionText: currentQuestion.question,
        childAnswer: currentQuestion.options[selectedOption],
        isCorrect: true,
        scoreEarned: addedScore,
        timestamp: new Date().toLocaleString('zh-TW', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
        syncedToCloud: false,
        category: currentQuestion.category,
      };
      setInteractionLogs((prev) => [newLog, ...prev]);
    } else {
      setStreakCount(0);
      const encourage = `很接近囉！這題的正確線索是：${currentQuestion.explanation}。沒關係，我們繼續加油！`;
      speakText(encourage, 'zh-TW');

      const newLog: DetectiveInteractionLog = {
        id: `log_${Date.now()}`,
        bookId: currentQuestion.bookId,
        bookTitle: currentQuestion.bookTitle,
        questionText: currentQuestion.question,
        childAnswer: currentQuestion.options[selectedOption],
        isCorrect: false,
        scoreEarned: 0,
        timestamp: new Date().toLocaleString('zh-TW', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
        syncedToCloud: false,
        category: currentQuestion.category,
      };
      setInteractionLogs((prev) => [newLog, ...prev]);
    }
  };

  const handleNextQuestion = () => {
    playPageTurnSound();
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setShowClue(false);
    setCurrentQuestionIndex((prev) => (prev + 1) % activeQuestions.length);
  };

  // --- Offline AI Rule-based & NLP matching engine for Free Asking ---
  const handleAskOfflineBot = (queryText?: string) => {
    const q = (queryText || childQueryInput).trim();
    if (!q || !activeBook) return;

    playStarChime();
    const nowTime = new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' });
    const bookTitleStr = typeof activeBook.title === 'string' ? activeBook.title : (activeBook.title['zh-TW'] || activeBook.title.en);

    // Append child message
    const childMsg = { sender: 'child' as const, text: q, time: nowTime, bookTag: bookTitleStr };
    setChatMessages((prev) => [...prev, childMsg]);
    setChildQueryInput('');

    // Generate smart local offline answer based on book database
    const summary = typeof activeBook.summary === 'string' ? activeBook.summary : (activeBook.summary['zh-TW'] || activeBook.summary.en || '');
    const moral = getBookMoral(activeBook);
    const pages = activeBook.pages || [];
    const lowerQ = q.toLowerCase();

    let botResponse = '';

    if (lowerQ.includes('主角') || lowerQ.includes('誰') || lowerQ.includes('character') || lowerQ.includes('人物')) {
      botResponse = `🕵️‍♂️ 報告小偵探！在《${bookTitleStr}》中，主要登場的角色充滿個性！故事講述了主角在冒險中如何運用智慧與同理心面對種種考驗。`;
    } else if (lowerQ.includes('結局') || lowerQ.includes('最後') || lowerQ.includes('結尾') || lowerQ.includes('結束')) {
      botResponse = `✨ 故事的最後迎來了溫暖美好的結局！大家都從這次奇妙的經歷中獲得了成長，明白到：「${moral}」的真諦！`;
    } else if (lowerQ.includes('道理') || lowerQ.includes('啟發') || lowerQ.includes('教') || lowerQ.includes('寓意') || lowerQ.includes('學到')) {
      botResponse = `💡 這本故事最棒的知識定錨點就是：『${moral}』！小偵探如果在日常生活中遇到困難，也可以學主角一樣勇敢喔！`;
    } else if (lowerQ.includes('單字') || lowerQ.includes('英文') || lowerQ.includes('vocab') || lowerQ.includes('english') || lowerQ.includes('詞彙')) {
      botResponse = `🔤 偵探雙語詞彙定艙庫為你精選：《${bookTitleStr}》的核心關鍵詞是 Courage (/ˈkʌrɪdʒ/ 勇氣)、Friendship (/ˈfrendʃɪp/ 友誼) 與 Discovery (/dɪˈskʌvəri/ 發現)！大聲唸一遍吧！`;
    } else if (lowerQ.includes('好笑') || lowerQ.includes('有趣') || lowerQ.includes('驚喜') || lowerQ.includes('插圖') || lowerQ.includes('秘密')) {
      botResponse = `🎨 偵探彩蛋秘密：在《${bookTitleStr}》的插圖裡，作者藏了好多細緻的表情與小動物配角！仔細翻看每一頁，你會發現畫面角落有很多驚喜喔！`;
    } else {
      // General offline synthesis response
      botResponse = `🔎 關於《${bookTitleStr}》的這道線索，小偵探機器人為你調出本機資料庫：故事核心是「${summary.slice(0, 80)}...」，給我們的最大啟發是「${moral}」！繼續保持好奇心！`;
    }

    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: botResponse,
          time: new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' }),
          bookTag: bookTitleStr,
        },
      ]);
      speakText(botResponse, 'zh-TW');
    }, 400);
  };

  // Trigger Cloud Sync of Offline Detective Logs
  const handleSyncLogsToCloud = () => {
    if (unsyncedLogs.length === 0) {
      setSyncFeedback('🟢 目前本機所有互動紀錄皆已與雲端同步！');
      setTimeout(() => setSyncFeedback(null), 4000);
      return;
    }

    setIsSyncing(true);
    playStarChime();

    setTimeout(() => {
      setIsSyncing(false);
      const updated = interactionLogs.map((log) => ({ ...log, syncedToCloud: true }));
      setInteractionLogs(updated);

      const bonus = unsyncedLogs.length * 5;
      setTotalDetectiveScore((prev) => prev + bonus);
      if (onUpdateStars && userProfile) {
        onUpdateStars((userProfile.stars || 0) + bonus);
      }

      setSyncFeedback(`✨ 成功將 ${unsyncedLogs.length} 筆離線小偵探問答紀錄同步至雲端伺服器！獲得雲端同步獎勵 +${bonus} 童心星星 ⭐！`);
      setTimeout(() => setSyncFeedback(null), 6000);
    }, 1200);
  };

  // Detective Rank Calculation
  const detectiveLevel =
    totalDetectiveScore >= 300
      ? { level: 5, title: '🏆 殿堂級傳奇福爾摩斯大偵探', badge: '👑', color: 'from-amber-400 to-yellow-500 text-amber-950' }
      : totalDetectiveScore >= 200
      ? { level: 4, title: '🥇 特級繪本記憶神探', badge: '🥇', color: 'from-purple-400 to-indigo-500 text-white' }
      : totalDetectiveScore >= 120
      ? { level: 3, title: '🥈 資深情節細節探員', badge: '🥈', color: 'from-cyan-400 to-blue-500 text-slate-950' }
      : totalDetectiveScore >= 50
      ? { level: 2, title: '🥉 潛力小偵探助手', badge: '🥉', color: 'from-emerald-400 to-teal-500 text-slate-950' }
      : { level: 1, title: '🌱 初級見習小偵探', badge: '🌱', color: 'from-slate-600 to-slate-700 text-slate-200' };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 🕵️‍♂️ Header Banner: Offline Detective Bot & Knowledge Anchor Capsule */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-amber-950/80 border-2 border-amber-400/80 shadow-2xl space-y-4 relative overflow-hidden">
        {/* Decorative background radar & particles */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-yellow-600 flex items-center justify-center text-3xl shadow-xl border-2 border-amber-300 animate-bounce">
              🕵️‍♂️
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg sm:text-xl font-black text-amber-200 flex items-center gap-2">
                  <span>離線小偵探機器人 (Offline Detective AI Bot)</span>
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-950 text-emerald-300 border border-emerald-500/50 flex items-center gap-1">
                  <Database className="w-3 h-3 text-emerald-400" />
                  <span>100% 本機離線運作</span>
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-400/40">
                  ⚓ 知識定艙系統
                </span>
              </div>
              <p className="text-xs font-bold text-slate-300 mt-0.5 leading-relaxed">
                基於已下載繪本資料庫的智慧問答小助手 ‧ 零網路也能玩『你問我答』遊戲 ‧ 本機安全保存互動紀錄
              </p>
            </div>
          </div>

          {/* Sync & Level Pill */}
          <div className="flex items-center gap-2.5 flex-wrap self-start md:self-auto">
            {/* Detective Level Badge */}
            <div className="px-3.5 py-2 rounded-2xl bg-slate-900/90 border border-amber-500/40 flex items-center gap-2 shadow-md">
              <span className="text-xl">{detectiveLevel.badge}</span>
              <div className="text-right">
                <div className="text-[10px] font-bold text-slate-400">偵探積分：{totalDetectiveScore} pts</div>
                <div className="text-xs font-black text-amber-300">{detectiveLevel.title}</div>
              </div>
            </div>

            {/* Cloud Sync Status Button */}
            <button
              onClick={handleSyncLogsToCloud}
              disabled={isSyncing}
              className={`px-3.5 py-2 rounded-2xl text-xs font-black flex items-center gap-1.5 shadow-lg transition-transform hover:scale-105 cursor-pointer ${
                unsyncedLogs.length > 0
                  ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 ring-2 ring-amber-300'
                  : 'bg-slate-800 text-emerald-300 border border-emerald-500/40'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>
                {isSyncing
                  ? '同步中...'
                  : unsyncedLogs.length > 0
                  ? `待同步 (${unsyncedLogs.length} 筆)`
                  : '🟢 已全數同步'}
              </span>
            </button>
          </div>
        </div>

        {/* Sync Feedback Toast */}
        {syncFeedback && (
          <div className="p-3 rounded-2xl bg-emerald-950/90 border border-emerald-400 text-emerald-200 text-xs font-black flex items-center justify-between gap-2 animate-fadeIn relative z-10">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>{syncFeedback}</span>
            </div>
            <button onClick={() => setSyncFeedback(null)} className="p-1 hover:bg-emerald-900 rounded-lg text-emerald-400">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Book Selector Bar for Detective Mission */}
        <div className="pt-2 border-t border-slate-800 relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 text-xs font-black text-amber-300">
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span>選擇偵探調查繪本：</span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full custom-scrollbar">
            {availableBooks.map((b) => {
              const bTitle = typeof b.title === 'string' ? b.title : (b.title['zh-TW'] || b.title.en);
              const isSelected = b.id === selectedBookId;
              return (
                <button
                  key={b.id}
                  onClick={() => {
                    playPageTurnSound();
                    setSelectedBookId(b.id);
                    setCurrentQuestionIndex(0);
                    setSelectedOption(null);
                    setIsAnswerSubmitted(false);
                    setShowClue(false);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-md ring-2 ring-amber-300 scale-105'
                      : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-700'
                  }`}
                >
                  <span>📖</span>
                  <span className="truncate max-w-[120px]">{bTitle}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sub-tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto custom-scrollbar">
        <button
          onClick={() => {
            playStarChime();
            setSubTab('qa_game');
          }}
          className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-black flex items-center gap-1.5 transition-all cursor-pointer ${
            subTab === 'qa_game'
              ? 'bg-amber-500 text-slate-950 shadow-lg scale-105'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>🎯 『你問我答』偵探遊戲</span>
          {streakCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-500 text-white animate-pulse">
              🔥 {streakCount} 連勝
            </span>
          )}
        </button>

        <button
          onClick={() => {
            playStarChime();
            setSubTab('free_ask');
          }}
          className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-black flex items-center gap-1.5 transition-all cursor-pointer ${
            subTab === 'free_ask'
              ? 'bg-cyan-500 text-slate-950 shadow-lg scale-105'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>💬 自由提問小偵探</span>
        </button>

        <button
          onClick={() => {
            playStarChime();
            setSubTab('knowledge_capsule');
          }}
          className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-black flex items-center gap-1.5 transition-all cursor-pointer ${
            subTab === 'knowledge_capsule'
              ? 'bg-emerald-500 text-slate-950 shadow-lg scale-105'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Archive className="w-4 h-4" />
          <span>⚓ 離線知識定艙</span>
        </button>

        <button
          onClick={() => {
            playStarChime();
            setSubTab('sync_history');
          }}
          className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-black flex items-center gap-1.5 transition-all cursor-pointer ${
            subTab === 'sync_history'
              ? 'bg-indigo-500 text-white shadow-lg scale-105'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>📋 互動與同步紀錄 ({interactionLogs.length})</span>
        </button>
      </div>

      {/* SUB-TAB 1: 🎯 『你問我答』偵探遊戲 (Q&A Mystery Game) */}
      {subTab === 'qa_game' && currentQuestion && (
        <div className="space-y-5 animate-fadeIn">
          {/* Question Card Box */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border-2 border-amber-400/60 shadow-2xl space-y-5 relative">
            {/* Header info of question */}
            <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-xl bg-amber-500/20 text-amber-300 font-black text-xs border border-amber-400/30">
                  第 {currentQuestionIndex + 1} / {activeQuestions.length} 題
                </span>
                <span className="text-xs font-bold text-slate-400">
                  📖 調查繪本：《{currentQuestion.bookTitle}》
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-xl bg-amber-950 text-amber-300 font-extrabold text-xs border border-amber-500/40 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>+{currentQuestion.rewardStars} ⭐</span>
                </span>
                <button
                  onClick={() => speakText(currentQuestion.question, 'zh-TW')}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 transition-colors cursor-pointer"
                  title="朗讀題目"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Question Text */}
            <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30">
              <h4 className="text-base sm:text-lg font-black text-amber-200 leading-relaxed">
                {currentQuestion.question}
              </h4>
            </div>

            {/* Options List */}
            <div className="space-y-3">
              {currentQuestion.options.map((opt, oIdx) => {
                const isSelected = selectedOption === oIdx;
                const isCorrectOption = oIdx === currentQuestion.correctIndex;
                let optionStyle = 'bg-slate-950 hover:bg-slate-850 border-slate-800 text-slate-200';

                if (isAnswerSubmitted) {
                  if (isCorrectOption) {
                    optionStyle = 'bg-emerald-950/80 border-emerald-400 text-emerald-200 shadow-lg ring-2 ring-emerald-400/50';
                  } else if (isSelected && !isCorrectOption) {
                    optionStyle = 'bg-rose-950/80 border-rose-400 text-rose-200';
                  } else {
                    optionStyle = 'bg-slate-950/50 border-slate-850 text-slate-500 opacity-50';
                  }
                } else if (isSelected) {
                  optionStyle = 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-md scale-[1.01]';
                }

                return (
                  <button
                    key={oIdx}
                    onClick={() => handleSelectOption(oIdx)}
                    disabled={isAnswerSubmitted}
                    className={`w-full p-4 rounded-2xl border-2 text-left font-bold text-xs sm:text-sm transition-all duration-200 flex items-center justify-between gap-3 cursor-pointer ${optionStyle}`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-7 h-7 rounded-xl bg-slate-800 flex items-center justify-center text-xs font-black shrink-0 border border-slate-700">
                        {String.fromCharCode(65 + oIdx)}
                      </span>
                      <span className="leading-snug">{opt}</span>
                    </div>

                    {isAnswerSubmitted && isCorrectOption && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    )}
                    {isAnswerSubmitted && isSelected && !isCorrectOption && (
                      <X className="w-5 h-5 text-rose-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Clue Prompt Button */}
            {!isAnswerSubmitted && (
              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={() => {
                    playPageTurnSound();
                    setShowClue(!showClue);
                  }}
                  className="text-xs font-extrabold text-amber-400 hover:text-amber-300 flex items-center gap-1.5 cursor-pointer"
                >
                  <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                  <span>{showClue ? '隱藏破案線索' : '💡 需要偵探提示嗎？'}</span>
                </button>

                {showClue && (
                  <div className="p-2.5 rounded-xl bg-amber-950/60 border border-amber-500/40 text-xs font-bold text-amber-200 animate-fadeIn">
                    🕵️‍♂️ 提示：{currentQuestion.clueTip}
                  </div>
                )}
              </div>
            )}

            {/* Answer Explanation & Action Bar */}
            <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              {isAnswerSubmitted ? (
                <div className="flex-1 text-xs font-black text-amber-200 bg-amber-950/40 p-3 rounded-2xl border border-amber-500/30">
                  {selectedOption === currentQuestion.correctIndex ? (
                    <span className="text-emerald-400 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      <span>{currentQuestion.explanation}</span>
                    </span>
                  ) : (
                    <span className="text-rose-300">
                      💡 {currentQuestion.explanation}
                    </span>
                  )}
                </div>
              ) : (
                <div className="text-xs font-bold text-slate-400">
                  請選出你認為最符合故事真相的答案！
                </div>
              )}

              <div className="flex items-center gap-2 shrink-0">
                {!isAnswerSubmitted ? (
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={selectedOption === null}
                    className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-slate-950 font-black text-sm shadow-xl transition-transform hover:scale-105 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    確定送出破案答案 🔍
                  </button>
                ) : (
                  <button
                    onClick={handleNextQuestion}
                    className="px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-slate-950 font-black text-sm shadow-xl transition-transform hover:scale-105 cursor-pointer flex items-center gap-1.5"
                  >
                    <span>挑戰下一道謎題</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: 💬 自由提問小偵探 (Free Q&A Engine) */}
      {subTab === 'free_ask' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Quick Suggestion Prompt Chips */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-xs font-black text-cyan-300">
              <Lightbulb className="w-4 h-4 text-cyan-400" />
              <span>點擊快速提問關於《{typeof activeBook?.title === 'string' ? activeBook.title : (activeBook?.title?.['zh-TW'] || '繪本')}》：</span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {[
                '這本書的主角是誰？他遇到了什麼困難？',
                '故事最後的結局是什麼？',
                '這本故事教了我們什麼寶貴道理？',
                '故事裡有什麼好笑或精彩的情節？',
                '教我這本書的雙語核心英文單字！',
              ].map((promptText, pIdx) => (
                <button
                  key={pIdx}
                  onClick={() => handleAskOfflineBot(promptText)}
                  className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold transition-transform hover:scale-105 cursor-pointer flex items-center gap-1"
                >
                  <span>💬</span>
                  <span>{promptText}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Chat Messages Feed */}
          <div className="p-4 rounded-3xl bg-slate-950 border border-slate-800 min-h-[260px] max-h-[360px] overflow-y-auto space-y-3.5 custom-scrollbar">
            {chatMessages.map((msg, mIdx) => (
              <div
                key={mIdx}
                className={`flex gap-3 ${msg.sender === 'child' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'bot' && (
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-lg shadow-md shrink-0">
                    🕵️‍♂️
                  </div>
                )}

                <div
                  className={`p-3.5 rounded-2xl text-xs sm:text-sm font-bold leading-relaxed max-w-[80%] space-y-1 ${
                    msg.sender === 'child'
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md'
                      : 'bg-slate-900 border border-slate-800 text-slate-200 shadow-md'
                  }`}
                >
                  {msg.bookTag && (
                    <div className="text-[10px] opacity-75 font-black uppercase tracking-wider">
                      📖 {msg.bookTag}
                    </div>
                  )}
                  <p>{msg.text}</p>
                  <div className="text-[9px] opacity-60 text-right">{msg.time}</div>
                </div>

                {msg.sender === 'child' && (
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400 flex items-center justify-center text-lg shadow-md shrink-0">
                    👦
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Input Box */}
          <div className="flex items-center gap-2 p-2 rounded-2xl bg-slate-900 border border-slate-800">
            <input
              type="text"
              value={childQueryInput}
              onChange={(e) => setChildQueryInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAskOfflineBot();
              }}
              placeholder={`輸入你想問小偵探的問題（例：主角是誰？教我英文生字）...`}
              className="flex-1 bg-transparent px-3 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-500 outline-none font-bold"
            />

            <button
              onClick={() => handleAskOfflineBot()}
              disabled={!childQueryInput.trim()}
              className="p-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-slate-950 font-black text-xs shadow-md transition-transform hover:scale-105 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: ⚓ 離線知識定艙 (Offline Knowledge Anchor Capsule) */}
      {subTab === 'knowledge_capsule' && activeBook && (
        <div className="space-y-5 animate-fadeIn">
          {/* Main Anchor Capsule Dashboard */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-950/80 via-slate-900 to-indigo-950/80 border-2 border-emerald-400/80 shadow-2xl space-y-5">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-500/30 pb-4">
              <div className="flex items-center gap-3">
                <span className="p-3 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 text-2xl font-black shadow-lg">
                  ⚓
                </span>
                <div>
                  <h4 className="text-base sm:text-lg font-black text-emerald-300 flex items-center gap-2">
                    <span>《{typeof activeBook.title === 'string' ? activeBook.title : (activeBook.title['zh-TW'] || activeBook.title.en)}》知識定艙</span>
                  </h4>
                  <p className="text-xs font-bold text-slate-300">
                    深度錨定已讀繪本的核心價值觀、雙語詞彙記憶點與觀察線索
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  const titleStr = typeof activeBook.title === 'string' ? activeBook.title : (activeBook.title['zh-TW'] || activeBook.title.en);
                  const moralStr = getBookMoral(activeBook);
                  const text = `知識定艙智慧導讀：${titleStr}。故事核心智慧：${moralStr}。這本故事來自${activeBook.originCountry || '世界經典'}，是一本充滿啟發的優質繪本！`;
                  speakText(text, 'zh-TW');
                }}
                className="px-4 py-2 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md transition-transform hover:scale-105 cursor-pointer"
              >
                <Volume2 className="w-4 h-4" />
                <span>定艙語音導讀</span>
              </button>
            </div>

            {/* 4 Core Anchor Pods */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Pod 1: Moral & Wisdom Anchor */}
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-emerald-500/40 space-y-2">
                <div className="flex items-center gap-2 text-xs font-black text-emerald-300">
                  <Heart className="w-4 h-4 text-emerald-400" />
                  <span>💡 核心智慧定錨 (Wisdom Anchor)</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-bold">
                  {getBookMoral(activeBook)}
                </p>
                <div className="text-[10px] text-emerald-400 font-extrabold pt-1">
                  ✓ 已成功定錨至孩童成長心靈庫
                </div>
              </div>

              {/* Pod 2: Bilingual Vocabulary Anchor */}
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-cyan-500/40 space-y-2">
                <div className="flex items-center gap-2 text-xs font-black text-cyan-300">
                  <Sparkle className="w-4 h-4 text-cyan-400" />
                  <span>🔤 雙語詞彙定艙庫 (Bilingual Pod)</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                  <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200">
                    <span className="text-cyan-300">Courage</span> 勇氣
                  </div>
                  <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200">
                    <span className="text-cyan-300">Empathy</span> 同理心
                  </div>
                  <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200">
                    <span className="text-cyan-300">Adventure</span> 冒險
                  </div>
                  <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200">
                    <span className="text-cyan-300">Wisdom</span> 智慧
                  </div>
                </div>
              </div>

              {/* Pod 3: Character & Culture Anchor */}
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-amber-500/40 space-y-2">
                <div className="flex items-center gap-2 text-xs font-black text-amber-300">
                  <Compass className="w-4 h-4 text-amber-400" />
                  <span>🌍 文化與地理定錨 (Origin Anchor)</span>
                </div>
                <p className="text-xs text-slate-300 font-bold leading-relaxed">
                  發源地：{activeBook.originCountry || '經典世界'} {activeBook.flag || '🌍'} • 分類：{activeBook.category}
                </p>
                <p className="text-[10px] text-slate-400">
                  拓展世界文化視野，認識多國不同故事傳承與風土民情。
                </p>
              </div>

              {/* Pod 4: Detective Mastery Badge */}
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-purple-500/40 space-y-2">
                <div className="flex items-center gap-2 text-xs font-black text-purple-300">
                  <Trophy className="w-4 h-4 text-purple-400" />
                  <span>🎖️ 定艙成就勳章 (Capsule Badge)</span>
                </div>
                <div className="flex items-center gap-3 pt-1">
                  <div className="text-3xl">🏅</div>
                  <div>
                    <div className="text-xs font-black text-amber-300">《{typeof activeBook.title === 'string' ? activeBook.title : (activeBook.title['zh-TW'] || activeBook.title.en)}》特級精通勳章</div>
                    <div className="text-[10px] text-slate-400">已完整掌握故事情節、寓意智慧與雙語單字</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: 📋 互動與同步紀錄 (Interaction Logs & Cloud Sync) */}
      {subTab === 'sync_history' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Header Action Bar */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-black text-amber-300 flex items-center gap-2">
                <span>📋 離線小偵探問答與互動紀錄庫</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-300">
                  共 {interactionLogs.length} 筆紀錄
                </span>
              </h4>
              <p className="text-xs font-bold text-slate-400 mt-0.5">
                所有在無網路時進行的問答均安全暫存於裝置本機，連線後即可一鍵同步！
              </p>
            </div>

            <button
              onClick={handleSyncLogsToCloud}
              disabled={isSyncing}
              className="px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-slate-950 font-black text-xs shadow-md transition-transform hover:scale-105 cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? '同步至雲端中...' : '🚀 立即同步至雲端'}</span>
            </button>
          </div>

          {/* Logs List */}
          <div className="space-y-2.5 max-h-[380px] overflow-y-auto custom-scrollbar pr-1">
            {interactionLogs.map((log) => (
              <div
                key={log.id}
                className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3 hover:border-slate-700 transition-colors"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-black text-amber-300 truncate">
                      📖 {log.bookTitle}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-bold">
                      {log.category}
                    </span>
                    <span className="text-[10px] text-slate-500">{log.timestamp}</span>
                  </div>

                  <p className="text-xs font-bold text-slate-200 line-clamp-1">
                    問：{log.questionText}
                  </p>

                  <p className="text-xs text-slate-400 line-clamp-1">
                    答：<span className="text-slate-300 font-bold">{log.childAnswer}</span>
                  </p>
                </div>

                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-black flex items-center gap-1 ${
                      log.isCorrect
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                        : 'bg-rose-950 text-rose-300 border border-rose-500/40'
                    }`}
                  >
                    {log.isCorrect ? `✓ 答對 (+${log.scoreEarned}⭐)` : '✗ 待複習'}
                  </span>

                  <span
                    className={`text-[9px] font-bold ${
                      log.syncedToCloud ? 'text-emerald-400' : 'text-amber-400'
                    }`}
                  >
                    {log.syncedToCloud ? '🟢 已同步雲端' : '📦 待連線同步'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
