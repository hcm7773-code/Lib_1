import React, { useState, useMemo } from 'react';
import {
  BookOpen, Sparkles, Volume2, Search, Filter, Bookmark, Star,
  Award, CheckCircle2, Globe, Heart, Shield, Lightbulb, Compass,
  Layers, Tag, Zap, RefreshCw, ChevronRight, X, ArrowUpRight,
  HelpCircle, VolumeX, Eye, BookMarked, Check, Play, Flame
} from 'lucide-react';
import { Book, UserProfile, VoiceRole } from '../types';
import { playStarChime, playPageTurnSound, speakText } from '../utils/audio';
import { getBookMoral } from './OfflineDetectiveBot';

export interface KnowledgeItem {
  id: string;
  bookId: string;
  bookTitle: string;
  category: 'wisdom' | 'bilingual' | 'science' | 'culture' | 'character';
  categoryLabel: string;
  title: string;
  content: string;
  keywords: string[];
  vocabularies: { word: string; translation: string; phonetic?: string; example?: string }[];
  unlockedAt: string;
  badgeLevel: 'beginner' | 'intermediate' | 'master';
  quote?: string;
  originCountry?: string;
  isFavorite?: boolean;
}

export interface OfflineKnowledgeHandbookProps {
  downloadedBooks: Book[];
  allBooks?: Book[];
  userProfile?: UserProfile;
  onSelectBook?: (bookId: string) => void;
  onCloseParent?: () => void;
}

// Generate rich knowledge points & vocabularies based on downloaded & library books
export function extractBookKnowledgeItems(books: Book[]): KnowledgeItem[] {
  const items: KnowledgeItem[] = [];

  books.forEach((book, idx) => {
    const titleStr = typeof book.title === 'string' ? book.title : (book.title['zh-TW'] || book.title.en || '經典繪本');
    const moral = getBookMoral(book);
    const origin = book.originCountry || '世界經典';
    const cat = book.category || 'Fairy Tale';

    // 1. Moral & Wisdom Knowledge
    items.push({
      id: `know_${book.id}_moral`,
      bookId: book.id,
      bookTitle: titleStr,
      category: 'wisdom',
      categoryLabel: '💡 道德與智慧定錨',
      title: `《${titleStr}》人生核心啟發`,
      content: moral,
      keywords: ['品德養成', '同理心', '情緒智商', '人生智慧'],
      vocabularies: [
        { word: 'Kindness', translation: '善良與仁慈', phonetic: '/ˈkaɪndnəs/', example: 'Always show kindness to those in need.' },
        { word: 'Empathy', translation: '同理心', phonetic: '/ˈempəθi/', example: 'Empathy helps us understand how friends feel.' },
      ],
      unlockedAt: '已在離線閱讀時解鎖',
      badgeLevel: idx % 3 === 0 ? 'master' : 'intermediate',
      quote: `「真正的勇氣不是不害怕，而是帶著善良與堅持前進。」——《${titleStr}》`,
      originCountry: origin,
    });

    // 2. Bilingual Key Vocabulary Knowledge
    items.push({
      id: `know_${book.id}_vocab`,
      bookId: book.id,
      bookTitle: titleStr,
      category: 'bilingual',
      categoryLabel: '🔤 雙語核心詞彙庫',
      title: `《${titleStr}》雙語主題高頻生字`,
      content: `掌握故事中的核心英文詞彙與道地語句表達，建立自然語感與拼讀記憶。`,
      keywords: ['英語單字', '雙語對照', '自然發音', '閱讀聽力'],
      vocabularies: [
        { word: 'Adventure', translation: '冒險旅程', phonetic: '/ədˈventʃər/', example: 'Every story is a grand adventure.' },
        { word: 'Courage', translation: '勇氣', phonetic: '/ˈkʌrɪdʒ/', example: 'Have the courage to try new things.' },
        { word: 'Friendship', translation: '友誼', phonetic: '/ˈfrendʃɪp/', example: 'Friendship makes the world brighter.' },
      ],
      unlockedAt: '翻頁點讀 100% 掌握',
      badgeLevel: 'master',
      quote: `「A room without books is like a body without a soul.」`,
      originCountry: origin,
    });

    // 3. Culture & Heritage / World View Knowledge
    items.push({
      id: `know_${book.id}_culture`,
      bookId: book.id,
      bookTitle: titleStr,
      category: 'culture',
      categoryLabel: '🌍 世界文化與地理觀',
      title: `《${titleStr}》發源文化背景脈絡`,
      content: `這本故事源自於 ${origin}，承載了在地文化對大自然、家庭與生活智慧的獨特詮釋。`,
      keywords: ['世界文化', '多元包容', '地理素養', origin],
      vocabularies: [
        { word: 'Heritage', translation: '文化傳承', phonetic: '/ˈherɪtɪdʒ/', example: 'Cultural heritage connects us with history.' },
        { word: 'Tradition', translation: '傳統風俗', phonetic: '/trəˈdɪʃn/', example: 'Learning traditions brings wisdom.' },
      ],
      unlockedAt: '文化地圖點亮',
      badgeLevel: 'beginner',
      quote: `「從繪本出發，看見世界上每一個閃閃發光的文明角落。」`,
      originCountry: origin,
    });

    // 4. Nature & Science Knowledge (for specific categories or general stories)
    items.push({
      id: `know_${book.id}_science`,
      bookId: book.id,
      bookTitle: titleStr,
      category: 'science',
      categoryLabel: '🌿 自然生態與科學思維',
      title: `《${titleStr}》觀察力與邏輯思考`,
      content: `培養像科學家一樣的細微觀察力，留意故事中的季節更迭、動物習性與色彩光影變化。`,
      keywords: ['邏輯思考', '自然觀察', '好奇心', '探究精神'],
      vocabularies: [
        { word: 'Discovery', translation: '發現探索', phonetic: '/dɪˈskʌvəri/', example: 'Discovery begins with curiosity.' },
        { word: 'Nature', translation: '自然萬物', phonetic: '/ˈneɪtʃər/', example: 'Respect and cherish the beauty of nature.' },
      ],
      unlockedAt: '離線偵探破案解鎖',
      badgeLevel: 'intermediate',
      quote: `「用好奇的雙眼，發現平凡日子裡不平凡的秘密。」`,
      originCountry: origin,
    });
  });

  return items;
}

export const OfflineKnowledgeHandbook: React.FC<OfflineKnowledgeHandbookProps> = ({
  downloadedBooks = [],
  allBooks = [],
  userProfile,
  onSelectBook,
  onCloseParent,
}) => {
  // Available pool of books
  const targetBooks = downloadedBooks.length > 0 ? downloadedBooks : (allBooks.length > 0 ? allBooks : []);

  // Compiled knowledge database
  const initialKnowledge = useMemo(() => extractBookKnowledgeItems(targetBooks), [targetBooks]);

  // Saved favorites list in localStorage
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('pwa_handbook_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Filters & Search states
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'wisdom' | 'bilingual' | 'culture' | 'science' | 'favorites'>('all');
  const [selectedBookFilter, setSelectedBookFilter] = useState<string>('all');
  const [selectedLevelFilter, setSelectedLevelFilter] = useState<'all' | 'beginner' | 'intermediate' | 'master'>('all');

  // Active playing audio state
  const [currentSpeakingId, setCurrentSpeakingId] = useState<string | null>(null);
  const [voiceRole, setVoiceRole] = useState<VoiceRole>('wizard');
  const [speechRate, setSpeechRate] = useState<number>(1.0);

  // Active Expanded Detail Modal / Drawer
  const [activeDetailItem, setActiveDetailItem] = useState<KnowledgeItem | null>(null);

  // Toggle favorite
  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    playStarChime();
    setFavoriteIds((prev) => {
      const exists = prev.includes(id);
      const updated = exists ? prev.filter((item) => item !== id) : [...prev, id];
      try {
        localStorage.setItem('pwa_handbook_favorites', JSON.stringify(updated));
      } catch (err) {
        console.warn(err);
      }
      return updated;
    });
  };

  // Smart filtered knowledge list
  const filteredItems = useMemo(() => {
    return initialKnowledge.filter((item) => {
      // Category filter
      if (selectedCategory === 'favorites') {
        if (!favoriteIds.includes(item.id)) return false;
      } else if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }

      // Book filter
      if (selectedBookFilter !== 'all' && item.bookId !== selectedBookFilter) {
        return false;
      }

      // Badge Level Filter
      if (selectedLevelFilter !== 'all' && item.badgeLevel !== selectedLevelFilter) {
        return false;
      }

      // Search keyword
      if (searchKeyword.trim()) {
        const q = searchKeyword.trim().toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchBook = item.bookTitle.toLowerCase().includes(q);
        const matchContent = item.content.toLowerCase().includes(q);
        const matchKeywords = item.keywords.some((k) => k.toLowerCase().includes(q));
        const matchVocab = item.vocabularies.some(
          (v) => v.word.toLowerCase().includes(q) || v.translation.toLowerCase().includes(q)
        );
        if (!matchTitle && !matchBook && !matchContent && !matchKeywords && !matchVocab) {
          return false;
        }
      }

      return true;
    });
  }, [initialKnowledge, selectedCategory, selectedBookFilter, selectedLevelFilter, searchKeyword, favoriteIds]);

  // AI Readout Engine
  const handleSpeakItem = (item: KnowledgeItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    playStarChime();

    if (currentSpeakingId === item.id) {
      window.speechSynthesis.cancel();
      setCurrentSpeakingId(null);
      return;
    }

    setCurrentSpeakingId(item.id);

    // Build rich speech text
    const vocabText = item.vocabularies
      .map((v) => `英文單字：${v.word}，中文意思：${v.translation}。`)
      .join(' ');

    const fullSpeechText = `知識手冊朗讀：${item.title}。出自繪本《${item.bookTitle}》。內容要點：${item.content}。核心字彙記憶：${vocabText}。金句智慧：${item.quote || '持續閱讀，探索世界！'}`;

    speakText(
      fullSpeechText,
      'zh-TW',
      speechRate,
      voiceRole,
      1.0,
      () => setCurrentSpeakingId(null)
    );
  };

  // Read entire filtered chapter overview
  const handleSpeakFullChapter = () => {
    if (filteredItems.length === 0) return;
    playStarChime();

    const overviewText = `離線知識手冊智慧回顧。目前共有 ${filteredItems.length} 個解鎖知識點。包含道德智慧、雙語詞彙與文化背景。讓我們先從第一項開始：${filteredItems[0].title}，${filteredItems[0].content}`;

    setCurrentSpeakingId('full_chapter');
    speakText(
      overviewText,
      'zh-TW',
      speechRate,
      voiceRole,
      1.0,
      () => setCurrentSpeakingId(null)
    );
  };

  // Stats calculation
  const totalPoints = initialKnowledge.length;
  const totalVocabs = initialKnowledge.reduce((sum, item) => sum + item.vocabularies.length, 0);
  const masterPoints = initialKnowledge.filter((item) => item.badgeLevel === 'master').length;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 📖 Header Banner: Offline Knowledge Handbook & AI Audio Review */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950/90 border-2 border-emerald-400/70 shadow-2xl space-y-4 relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 flex items-center justify-center text-3xl shadow-xl border-2 border-emerald-300 animate-bounce">
              📖
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg sm:text-xl font-black text-emerald-200 flex items-center gap-2">
                  <span>離線知識手冊 (Offline Knowledge Handbook)</span>
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-900/80 text-emerald-300 border border-emerald-500/50 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>離線編纂成冊 ‧ 知識體系完整</span>
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-400/40">
                  🎙️ AI 智慧朗讀複習
                </span>
              </div>
              <p className="text-xs font-bold text-slate-300 mt-0.5 leading-relaxed">
                將離線閱讀中解鎖的人生智慧、核心雙語字彙與文化知識彙編成冊 ‧ 一鍵朗讀助孩子快速回顧知識體系
              </p>
            </div>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-2 flex-wrap self-start md:self-auto">
            <div className="px-3.5 py-2 rounded-2xl bg-slate-900/90 border border-emerald-500/40 flex items-center gap-2 shadow-md">
              <span className="text-xl">🌟</span>
              <div className="text-right">
                <div className="text-[10px] font-bold text-slate-400">已解鎖知識點</div>
                <div className="text-xs font-black text-emerald-300">{totalPoints} 篇 ({totalVocabs} 個詞彙)</div>
              </div>
            </div>

            <button
              onClick={handleSpeakFullChapter}
              className={`px-4 py-2 rounded-2xl text-xs font-black flex items-center gap-1.5 shadow-lg transition-transform hover:scale-105 cursor-pointer ${
                currentSpeakingId === 'full_chapter'
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 font-black ring-2 ring-emerald-300'
              }`}
            >
              <Volume2 className={`w-4 h-4 ${currentSpeakingId === 'full_chapter' ? 'animate-spin' : ''}`} />
              <span>{currentSpeakingId === 'full_chapter' ? '停止朗讀手冊' : '🎙️ 一鍵 AI 智慧朗讀手冊'}</span>
            </button>
          </div>
        </div>

        {/* Knowledge Metrics Overview Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-emerald-500/20 relative z-10">
          <div className="p-2.5 rounded-2xl bg-slate-950/80 border border-emerald-500/30">
            <div className="text-[10px] font-bold text-slate-400">💡 道德智慧定錨</div>
            <div className="text-xs font-black text-emerald-300 mt-0.5">
              {initialKnowledge.filter((i) => i.category === 'wisdom').length} 篇人生哲理
            </div>
          </div>

          <div className="p-2.5 rounded-2xl bg-slate-950/80 border border-cyan-500/30">
            <div className="text-[10px] font-bold text-slate-400">🔤 雙語主題詞彙</div>
            <div className="text-xs font-black text-cyan-300 mt-0.5">
              {totalVocabs} 個高頻生字庫
            </div>
          </div>

          <div className="p-2.5 rounded-2xl bg-slate-950/80 border border-amber-500/30">
            <div className="text-[10px] font-bold text-slate-400">🌍 世界文化視野</div>
            <div className="text-xs font-black text-amber-300 mt-0.5">
              {initialKnowledge.filter((i) => i.category === 'culture').length} 國文明故事
            </div>
          </div>

          <div className="p-2.5 rounded-2xl bg-slate-950/80 border border-purple-500/30">
            <div className="text-[10px] font-bold text-slate-400">🏅 精通大師徽章</div>
            <div className="text-xs font-black text-purple-300 mt-0.5">
              {masterPoints} 篇極致熟練
            </div>
          </div>
        </div>
      </div>

      {/* 🔍 離線智慧過濾與搜尋控制面板 (Offline Smart Filter & Search Bar) */}
      <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
        {/* Search Input and Voice Settings */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-emerald-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="搜尋知識點、智慧啟發、英文單字 (例：Kindness、勇氣、文化)..."
              className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-400 font-bold transition-all"
            />
            {searchKeyword && (
              <button
                onClick={() => setSearchKeyword('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Voice Persona Selector for AI Reading */}
          <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
            <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
              <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>導讀語音：</span>
            </span>
            <select
              value={voiceRole}
              onChange={(e) => {
                playPageTurnSound();
                setVoiceRole(e.target.value as VoiceRole);
              }}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs font-bold text-emerald-300 outline-none cursor-pointer"
            >
              <option value="wizard">🦉 貓頭鷹博士 (沉穩睿智)</option>
              <option value="fairy">🧚‍♀️ 故事小仙子 (甜美生動)</option>
              <option value="robot">🤖 科技機器人 (清晰幽默)</option>
              <option value="mom">👩‍👧 溫柔故事媽媽 (親切包容)</option>
            </select>
          </div>
        </div>

        {/* Filter Categories Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
          {[
            { id: 'all', name: '📚 全部知識點', icon: Layers, count: initialKnowledge.length },
            { id: 'wisdom', name: '💡 道德與智慧', icon: Heart, count: initialKnowledge.filter((i) => i.category === 'wisdom').length },
            { id: 'bilingual', name: '🔤 雙語生字詞庫', icon: Sparkles, count: initialKnowledge.filter((i) => i.category === 'bilingual').length },
            { id: 'culture', name: '🌍 文化與地理', icon: Globe, count: initialKnowledge.filter((i) => i.category === 'culture').length },
            { id: 'science', name: '🌿 自然與科學', icon: Compass, count: initialKnowledge.filter((i) => i.category === 'science').length },
            { id: 'favorites', name: '⭐ 我的珍藏', icon: Star, count: favoriteIds.length },
          ].map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  playPageTurnSound();
                  setSelectedCategory(cat.id as any);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 shadow-md scale-105 ring-2 ring-emerald-300'
                    : 'bg-slate-950 text-slate-300 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.name}</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-900/60 font-bold">
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Secondary Book & Mastery Level Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800 text-xs font-bold">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-slate-400">📖 繪本來源篩選：</span>
            <select
              value={selectedBookFilter}
              onChange={(e) => {
                playPageTurnSound();
                setSelectedBookFilter(e.target.value);
              }}
              className="px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 outline-none cursor-pointer"
            >
              <option value="all">全部繪本 ({targetBooks.length} 本)</option>
              {targetBooks.map((b) => {
                const bTitle = typeof b.title === 'string' ? b.title : (b.title['zh-TW'] || b.title.en);
                return (
                  <option key={b.id} value={b.id}>
                    {bTitle}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400">🎖️ 熟練度：</span>
            <div className="flex items-center gap-1">
              {[
                { id: 'all', label: '全部' },
                { id: 'master', label: '大師級' },
                { id: 'intermediate', label: '進階' },
                { id: 'beginner', label: '初學' },
              ].map((lvl) => (
                <button
                  key={lvl.id}
                  onClick={() => {
                    playPageTurnSound();
                    setSelectedLevelFilter(lvl.id as any);
                  }}
                  className={`px-2 py-0.5 rounded-lg text-[11px] font-bold cursor-pointer transition-all ${
                    selectedLevelFilter === lvl.id
                      ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-400/50'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {lvl.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 📚 Knowledge Cards Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="text-xs font-black text-emerald-300 flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <span>手冊目錄條目 ({filteredItems.length} 項知識點)</span>
          </div>

          {filteredItems.length > 0 && (
            <span className="text-[11px] font-bold text-slate-400">
              點擊任何條目即可查看完整辭典解析或朗讀單詞
            </span>
          )}
        </div>

        {filteredItems.length === 0 ? (
          <div className="p-12 rounded-3xl bg-slate-900/80 border border-slate-800 text-center space-y-3">
            <div className="text-4xl animate-bounce">🔍</div>
            <h4 className="text-sm font-black text-slate-300">未找到符合條件的離線知識點</h4>
            <p className="text-xs text-slate-400">請嘗試清除關鍵字搜尋或更換分類標籤。</p>
            <button
              onClick={() => {
                playStarChime();
                setSearchKeyword('');
                setSelectedCategory('all');
                setSelectedBookFilter('all');
                setSelectedLevelFilter('all');
              }}
              className="px-4 py-2 rounded-2xl bg-emerald-400 text-slate-950 font-black text-xs hover:bg-emerald-300 transition-all cursor-pointer"
            >
              重設所有過濾條件
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredItems.map((item) => {
              const isFav = favoriteIds.includes(item.id);
              const isSpeaking = currentSpeakingId === item.id;

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    playPageTurnSound();
                    setActiveDetailItem(item);
                  }}
                  className={`p-5 rounded-3xl border-2 transition-all cursor-pointer shadow-xl flex flex-col justify-between group relative overflow-hidden ${
                    isSpeaking
                      ? 'bg-slate-900/90 border-emerald-400 ring-2 ring-emerald-400/50 shadow-emerald-500/20'
                      : 'bg-slate-900/80 border-slate-800 hover:border-emerald-500/50 hover:scale-[1.01]'
                  }`}
                >
                  {/* Category & Action Top Bar */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-1 rounded-xl bg-slate-950 text-emerald-300 text-[10px] font-black border border-emerald-500/30 flex items-center gap-1">
                        <span>{item.categoryLabel}</span>
                      </span>

                      <div className="flex items-center gap-1.5">
                        {/* Favorite Button */}
                        <button
                          onClick={(e) => toggleFavorite(item.id, e)}
                          className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
                            isFav
                              ? 'text-amber-400 bg-amber-500/20'
                              : 'text-slate-500 hover:text-slate-300 bg-slate-950'
                          }`}
                          title={isFav ? '已加入珍藏' : '加入珍藏'}
                        >
                          <Star className={`w-3.5 h-3.5 ${isFav ? 'fill-amber-400' : ''}`} />
                        </button>

                        {/* AI Readout Button */}
                        <button
                          onClick={(e) => handleSpeakItem(item, e)}
                          className={`p-1.5 rounded-xl transition-transform hover:scale-110 cursor-pointer ${
                            isSpeaking
                              ? 'bg-emerald-400 text-slate-950 animate-pulse'
                              : 'bg-slate-950 text-emerald-300 hover:bg-emerald-500/20'
                          }`}
                          title="AI 語音朗讀此知識點"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Title and Origin Book */}
                    <div>
                      <h4 className="text-sm font-black text-slate-100 group-hover:text-emerald-300 transition-colors flex items-center gap-1.5">
                        <span>{item.title}</span>
                      </h4>
                      <p className="text-[11px] font-bold text-slate-400 mt-0.5">
                        📖 出處繪本：《{item.bookTitle}》
                      </p>
                    </div>

                    {/* Content Brief */}
                    <p className="text-xs font-bold text-slate-300 leading-relaxed line-clamp-2">
                      {item.content}
                    </p>

                    {/* Key Vocabularies Badges */}
                    {item.vocabularies.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {item.vocabularies.map((v, vIdx) => (
                            <span
                              key={vIdx}
                              className="px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-black text-cyan-300 flex items-center gap-1"
                            >
                              <span>{v.word}</span>
                              <span className="text-slate-400 font-normal text-[10px]">({v.translation})</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Footer metadata & Action link */}
                  <div className="pt-4 mt-3 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-bold text-slate-400">
                    <span className="text-emerald-400/90 font-extrabold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{item.unlockedAt}</span>
                    </span>

                    <span className="text-emerald-300 group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                      <span>查閱辭典詳情</span>
                      <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 📖 Item Detail Modal (Expanded Knowledge Capsule Reader) */}
      {activeDetailItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-2xl bg-slate-900 border-2 border-emerald-400/80 rounded-3xl p-6 shadow-2xl space-y-5 relative max-h-[90vh] overflow-y-auto custom-scrollbar">
            {/* Header info */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-black border border-emerald-400/30">
                  {activeDetailItem.categoryLabel}
                </span>
                <span className="text-xs font-bold text-slate-400">
                  出處：《{activeDetailItem.bookTitle}》
                </span>
              </div>

              <button
                onClick={() => setActiveDetailItem(null)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Title & Speech trigger */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-black text-emerald-300">
                  {activeDetailItem.title}
                </h3>
                <p className="text-xs font-bold text-slate-400 mt-1">
                  發源文化：{activeDetailItem.originCountry || '經典世界'} ‧ 解鎖狀態：{activeDetailItem.unlockedAt}
                </p>
              </div>

              <button
                onClick={(e) => handleSpeakItem(activeDetailItem, e)}
                className="px-3.5 py-2 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md cursor-pointer shrink-0"
              >
                <Volume2 className="w-4 h-4" />
                <span>{currentSpeakingId === activeDetailItem.id ? '停止朗讀' : '語音精讀'}</span>
              </button>
            </div>

            {/* Content body */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="text-xs font-black text-slate-400">💡 知識要點解析：</div>
              <p className="text-sm font-bold text-slate-200 leading-relaxed">
                {activeDetailItem.content}
              </p>
            </div>

            {/* Golden Quote */}
            {activeDetailItem.quote && (
              <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 space-y-1">
                <div className="text-xs font-black text-amber-300">✨ 故事金句摘錄：</div>
                <p className="text-xs font-extrabold text-amber-200 italic leading-relaxed">
                  {activeDetailItem.quote}
                </p>
              </div>
            )}

            {/* Detailed Vocabulary Cards */}
            <div className="space-y-3">
              <h4 className="text-xs font-black text-cyan-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>雙語詞彙深度辭典 ({activeDetailItem.vocabularies.length} 個字詞)</span>
              </h4>

              <div className="space-y-2.5">
                {activeDetailItem.vocabularies.map((v, vIdx) => (
                  <div
                    key={vIdx}
                    className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5 flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-cyan-300">{v.word}</span>
                        {v.phonetic && (
                          <span className="text-xs text-slate-400 font-mono">{v.phonetic}</span>
                        )}
                      </div>

                      <button
                        onClick={() => speakText(`${v.word}. ${v.translation}`, 'en-US')}
                        className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-300 text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>發音</span>
                      </button>
                    </div>

                    <div className="text-xs font-bold text-slate-200">
                      釋義：{v.translation}
                    </div>

                    {v.example && (
                      <div className="text-xs text-slate-400 italic">
                        例句：{v.example}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
              {onSelectBook && (
                <button
                  onClick={() => {
                    onSelectBook(activeDetailItem.bookId);
                    setActiveDetailItem(null);
                    if (onCloseParent) onCloseParent();
                  }}
                  className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-black text-xs hover:brightness-110 shadow-lg cursor-pointer flex items-center gap-1.5"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>打開本篇繪本閱讀</span>
                </button>
              )}

              <button
                onClick={() => setActiveDetailItem(null)}
                className="px-5 py-2.5 rounded-2xl bg-slate-800 text-slate-200 hover:bg-slate-700 font-bold text-xs cursor-pointer ml-auto"
              >
                關閉
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
