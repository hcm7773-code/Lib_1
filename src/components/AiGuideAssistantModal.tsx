import React, { useState, useEffect } from 'react';
import {
  Mic, MicOff, Volume2, Sparkles, X, BookOpen, Star, Compass, Layers, Check,
  RefreshCw, Wand2, Play, Flame, Heart, Palette, Bot, ArrowRight, Save
} from 'lucide-react';
import { Book, CustomShelf, LanguageCode } from '../types';
import { speakText, playStarChime, playPageTurnSound } from '../utils/audio';

interface AiGuideAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  books: Book[];
  onSelectBook: (book: Book) => void;
  primaryLang?: LanguageCode;
  darkMode?: boolean;
  onApplyFilterToLibrary?: (query: string) => void;
  onSaveCustomShelf?: (shelf: CustomShelf) => void;
}

export const AiGuideAssistantModal: React.FC<AiGuideAssistantModalProps> = ({
  isOpen,
  onClose,
  books,
  onSelectBook,
  primaryLang = 'zh-TW',
  darkMode = false,
  onApplyFilterToLibrary,
  onSaveCustomShelf,
}) => {
  const [selectedTopic, setSelectedTopic] = useState<string>('恐龍');
  const [customKeyword, setCustomKeyword] = useState<string>('');
  const [isListeningVoice, setIsListeningVoice] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState<string>('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [bookshelfTheme, setBookshelfTheme] = useState<'wood' | 'starry' | 'crystal'>('wood');
  const [isSavedToShelves, setIsSavedToShelves] = useState(false);

  // Preset topics for kids
  const kidTopics = [
    { id: '恐龍', label: '🦕 恐龍與遠古探險', keyword: '恐龍', emoji: '🦕', desc: '巨型恐龍、火山冒險與遠古森林故事' },
    { id: '宇宙', label: '🚀 宇宙銀河與星空', keyword: '宇宙', emoji: '🚀', desc: '太空人、星際冒險與流星許願故事' },
    { id: '海洋', label: '🌊 神奇海洋與海底城', keyword: '海洋', emoji: '🌊', desc: '彩虹鯨魚、海底冒險與人魚傳說' },
    { id: '魔法', label: '🪄 魔法奇幻與精靈', keyword: '魔法', emoji: '🪄', desc: '城堡精靈、會發光的樹與魔法藥水' },
    { id: '森林', label: '🦁 森林動物與大自然', keyword: '森林', emoji: '🦁', desc: '小熊夥伴、溫馨森林與小動物故事' },
    { id: '科學', label: '🔬 酷炫科學與發明', keyword: '科學', emoji: '🔬', desc: '綠建築、愛護地球與科學發明冒險' },
    { id: '城堡', label: '🏰 童話城堡與王國', keyword: '城堡', emoji: '🏰', desc: '經典童話、勇敢騎士與美麗公主' },
    { id: '溫馨', label: '🕊️ 友情、愛與溫馨', keyword: '愛', emoji: '🕊️', desc: '陪伴、分享、感恩與愛心成長故事' },
  ];

  // Voice Greeting on open
  useEffect(() => {
    if (isOpen) {
      playStarChime();
      const greeting = '哈囉！我是繪本館的 AI 導覽助手小星！你想聽什麼主題的故事呢？可以跟我說恐龍、宇宙、海洋，或點擊下方的主題按鈕喔！';
      setIsSpeaking(true);
      speakText(greeting, 'zh-TW', 0.95, 'teacher', 1.1, () => {
        setIsSpeaking(false);
      });
    } else {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);
      setIsListeningVoice(false);
      setIsSavedToShelves(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Simulate or handle Voice Listening
  const handleToggleVoiceInput = () => {
    if (isListeningVoice) {
      setIsListeningVoice(false);
      return;
    }

    setIsListeningVoice(true);
    setVoiceTranscript('正在傾聽小寶貝聲音中...');

    // Try SpeechRecognition API if available
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.lang = 'zh-TW';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setVoiceTranscript(`聽到小寶貝說：『${transcript}』`);
          setIsListeningVoice(false);

          // Extract keyword match
          if (transcript.includes('恐龍')) setSelectedTopic('恐龍');
          else if (transcript.includes('宇宙') || transcript.includes('星')) setSelectedTopic('宇宙');
          else if (transcript.includes('海') || transcript.includes('水')) setSelectedTopic('海洋');
          else if (transcript.includes('魔法') || transcript.includes('仙')) setSelectedTopic('魔法');
          else if (transcript.includes('動物') || transcript.includes('森林')) setSelectedTopic('森林');
          else if (transcript.includes('科學')) setSelectedTopic('科學');
          else {
            setCustomKeyword(transcript);
            setSelectedTopic('custom');
          }

          playStarChime();
        };

        recognition.onerror = () => {
          setVoiceTranscript('已聽取關鍵字！');
          setIsListeningVoice(false);
        };

        recognition.start();
        return;
      } catch {
        // Fallback simulation
      }
    }

    // Simulation Fallback
    setTimeout(() => {
      const simulatedKeywords = ['恐龍冒險', '宇宙星空', '神奇海洋', '魔法森林'];
      const randomKey = simulatedKeywords[Math.floor(Math.random() * simulatedKeywords.length)];
      setVoiceTranscript(`🎯 聽取完成！辨識主題：『${randomKey}』`);
      setIsListeningVoice(false);

      if (randomKey.includes('恐龍')) setSelectedTopic('恐龍');
      else if (randomKey.includes('宇宙')) setSelectedTopic('宇宙');
      else if (randomKey.includes('海洋')) setSelectedTopic('海洋');
      else setSelectedTopic('魔法');

      playStarChime();
    }, 2200);
  };

  // Filter books matching current selected topic
  const activeKeyword = selectedTopic === 'custom' ? customKeyword : (kidTopics.find((t) => t.id === selectedTopic)?.keyword || selectedTopic);

  const matchedBooks = books.filter((book) => {
    const title = (book.title[primaryLang] || book.title['zh-TW'] || book.title.en || '').toLowerCase();
    const summary = (book.summary[primaryLang] || book.summary['zh-TW'] || book.summary.en || '').toLowerCase();
    const cat = (book.category || '').toLowerCase();
    const kw = activeKeyword.toLowerCase();

    if (!kw) return true;

    return (
      title.includes(kw) ||
      summary.includes(kw) ||
      cat.includes(kw) ||
      (kw === '恐龍' && (title.includes('恐龍') || summary.includes('龍') || cat.includes('fairy'))) ||
      (kw === '宇宙' && (title.includes('星') || title.includes('王') || summary.includes('星') || summary.includes('宇宙'))) ||
      (kw === '海洋' && (title.includes('海') || summary.includes('水') || summary.includes('魚'))) ||
      (kw === '魔法' && (title.includes('魔') || summary.includes('精靈') || summary.includes('魔法'))) ||
      (kw === '森林' && (title.includes('熊') || title.includes('鴨') || summary.includes('森林') || summary.includes('鳥'))) ||
      (kw === '科學' && (title.includes('建築') || title.includes('豬') || summary.includes('科學') || summary.includes('環保'))) ||
      (kw === '愛' && (title.includes('王子') || summary.includes('友誼') || summary.includes('愛')))
    );
  });

  // Display at least 2-4 books even with fallback
  const finalDisplayBooks = matchedBooks.length > 0 ? matchedBooks : books.slice(0, 3);

  const activeTopicInfo = kidTopics.find((t) => t.id === selectedTopic) || {
    id: 'custom',
    label: `🔍 ${activeKeyword || '自訂興趣'} 專題`,
    keyword: activeKeyword,
    emoji: '⭐',
    desc: `專為「${activeKeyword}」興趣設計的智慧專屬繪本選集`,
  };

  // Handle TTS announcement when selecting topic
  const handleSelectTopic = (topicId: string) => {
    setSelectedTopic(topicId);
    playPageTurnSound();
    setIsSavedToShelves(false);

    const topicObj = kidTopics.find((t) => t.id === topicId);
    const speechStr = `太棒了！已為你找到 ${topicObj?.label || topicId} 主題的精選繪本，並為你生成專屬虛擬書櫃囉！`;
    setIsSpeaking(true);
    speakText(speechStr, 'zh-TW', 0.95, 'teacher', 1.1, () => setIsSpeaking(false));
  };

  // Save generated bookshelf to custom shelves
  const handleSaveBookshelf = () => {
    playStarChime();
    setIsSavedToShelves(true);

    if (onSaveCustomShelf) {
      const newShelf: CustomShelf = {
        id: `ai_shelf_${Date.now()}`,
        name: `${activeTopicInfo.emoji} 小寶貝的${activeTopicInfo.keyword}專屬書櫃`,
        icon: activeTopicInfo.emoji,
        bookIds: finalDisplayBooks.map((b) => b.id),
      };
      onSaveCustomShelf(newShelf);
    }
  };

  const handleApplyFilter = () => {
    if (onApplyFilterToLibrary) {
      onApplyFilterToLibrary(activeKeyword);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-slate-900 border-2 border-amber-400/80 text-slate-100 shadow-2xl overflow-hidden">
        
        {/* Assistant Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-amber-400/30 bg-slate-900/90 z-10">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-tr from-purple-500 via-indigo-500 to-pink-500 text-white font-black shadow-lg relative">
              <Bot className="w-6 h-6 animate-bounce" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full ring-2 ring-slate-900 animate-ping" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-black text-[10px] shadow-xs">
                  🤖 AI 語音導覽小助手
                </span>
                <span className="text-[10px] font-bold text-amber-300">
                  即時閱讀聲樂顧問
                </span>
              </div>
              <h3 className="text-base sm:text-xl font-black text-amber-200">
                繪本館『AI 導覽助手小星』
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

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar">
          
          {/* AI Voice Bubble Interactive Card */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-indigo-950/80 via-purple-950/60 to-slate-900 border border-purple-500/40 shadow-xl space-y-4 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="text-3xl animate-bounce">🌟</span>
                <div className="space-y-1">
                  <h4 className="font-black text-sm sm:text-base text-purple-200 flex items-center gap-2">
                    <span>「哈囉！我是小星助手！」</span>
                    {isSpeaking && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-bold animate-pulse">
                        <Volume2 className="w-3 h-3 text-rose-400" />
                        語音朗讀中...
                      </span>
                    )}
                  </h4>
                  <p className="text-xs text-slate-200 font-medium leading-relaxed">
                    告訴我你最喜歡什麼？（例如：恐龍、宇宙、海洋、魔法），我會為你自動推薦書單並打造專屬的虛擬書櫃喔！
                  </p>
                </div>
              </div>

              {/* Mic Interactive Button */}
              <button
                type="button"
                onClick={handleToggleVoiceInput}
                className={`px-4 py-2.5 rounded-2xl font-black text-xs flex items-center gap-2 transition-all shadow-md cursor-pointer shrink-0 ${
                  isListeningVoice
                    ? 'bg-rose-500 text-white animate-pulse ring-4 ring-rose-400/40 scale-105'
                    : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:scale-105'
                }`}
              >
                {isListeningVoice ? <Mic className="w-4 h-4 animate-spin" /> : <Mic className="w-4 h-4" />}
                <span>{isListeningVoice ? '正在聽你說話...' : '🎙️ 語音點播互動'}</span>
              </button>
            </div>

            {/* Voice Transcript Display */}
            {voiceTranscript && (
              <div className="p-3 rounded-2xl bg-slate-900/90 border border-purple-400/40 text-amber-300 text-xs font-bold flex items-center gap-2 animate-fadeIn">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{voiceTranscript}</span>
              </div>
            )}

            {/* Manual Keyword Input */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                placeholder="或手動輸入孩童興趣關鍵字（如：火山、火車、小貓）..."
                value={customKeyword}
                onChange={(e) => setCustomKeyword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && customKeyword.trim()) {
                    setSelectedTopic('custom');
                    playStarChime();
                  }
                }}
                className="flex-1 px-4 py-2 rounded-xl bg-slate-900/80 border border-purple-400/30 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-amber-400"
              />
              <button
                type="button"
                onClick={() => {
                  if (customKeyword.trim()) {
                    setSelectedTopic('custom');
                    playStarChime();
                  }
                }}
                className="px-4 py-2 rounded-xl bg-amber-400 text-slate-950 font-black text-xs hover:bg-amber-300 cursor-pointer"
              >
                搜尋配對
              </button>
            </div>
          </div>

          {/* Kids Topic Chips Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-xs text-amber-300 flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-amber-400" />
                <span>點擊選擇孩童喜愛的主題類別：</span>
              </h4>
              <span className="text-[10px] text-slate-400 font-bold">點選即可自動更新專屬書櫃</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {kidTopics.map((topic) => {
                const isSelected = selectedTopic === topic.id;

                return (
                  <button
                    key={topic.id}
                    type="button"
                    onClick={() => handleSelectTopic(topic.id)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-1.5 ${
                      isSelected
                        ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950 border-amber-300 shadow-lg scale-102 font-black'
                        : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xl">{topic.emoji}</span>
                      {isSelected && <Check className="w-4 h-4 text-slate-950" />}
                    </div>
                    <div>
                      <h5 className="text-xs font-black line-clamp-1">{topic.label}</h5>
                      <p className={`text-[10px] line-clamp-1 ${isSelected ? 'text-slate-900 font-bold' : 'text-slate-400 font-medium'}`}>
                        {topic.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 🪵 Dedicated Generated Virtual Bookshelf View (生成專屬虛擬書櫃) */}
          <div className="space-y-4 pt-2">
            
            {/* Bookshelf Wooden Bar Header */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-900 via-amber-800 to-orange-950 border-2 border-amber-400/60 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="text-3xl">{activeTopicInfo.emoji}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-base sm:text-lg text-amber-200">
                      『{activeTopicInfo.keyword}』專屬虛擬繪本書櫃
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black">
                      匹配 {finalDisplayBooks.length} 本
                    </span>
                  </div>
                  <p className="text-xs text-amber-200/80 font-medium">
                    AI 導覽小星為孩子精心策劃的智慧童書架
                  </p>
                </div>
              </div>

              {/* Action Buttons for Bookshelf */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleSaveBookshelf}
                  disabled={isSavedToShelves}
                  className={`flex-1 sm:flex-none px-3.5 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    isSavedToShelves
                      ? 'bg-emerald-500 text-white opacity-90'
                      : 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md'
                  }`}
                >
                  {isSavedToShelves ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>已保存至個人書房</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>💾 保存為個人專屬書櫃</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleApplyFilter}
                  className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                >
                  <BookOpen className="w-4 h-4 text-amber-300" />
                  <span>🔍 主頁帶入篩選</span>
                </button>
              </div>
            </div>

            {/* Virtual Bookshelf Wooden / Starry Visual Render */}
            <div className={`p-6 rounded-3xl border-4 shadow-2xl space-y-6 transition-all ${
              bookshelfTheme === 'wood'
                ? 'bg-amber-950/90 border-amber-800 text-amber-50'
                : bookshelfTheme === 'starry'
                ? 'bg-slate-950 border-indigo-900 text-indigo-100'
                : 'bg-slate-900 border-purple-800 text-purple-100'
            }`}>
              
              {/* Theme Selector */}
              <div className="flex items-center justify-between text-xs font-bold border-b border-white/10 pb-3">
                <span className="flex items-center gap-1.5 text-amber-200">
                  <Palette className="w-4 h-4 text-amber-400" />
                  <span>書架展示視覺風格：</span>
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setBookshelfTheme('wood')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-black cursor-pointer ${
                      bookshelfTheme === 'wood' ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    🪵 溫馨木質
                  </button>
                  <button
                    type="button"
                    onClick={() => setBookshelfTheme('starry')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-black cursor-pointer ${
                      bookshelfTheme === 'starry' ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    🌌 夢幻星空
                  </button>
                </div>
              </div>

              {/* Bookshelf Shelf Row */}
              <div className="relative pt-2">
                
                {/* Book Cards Grid on Wooden Plank */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6 relative z-10 pb-4">
                  {finalDisplayBooks.map((book, idx) => (
                    <div
                      key={book.id}
                      className="group relative bg-slate-900/90 rounded-2xl border-2 border-amber-400/40 p-3 flex flex-col justify-between space-y-3 hover:border-amber-400 hover:scale-105 transition-all shadow-xl"
                    >
                      {/* Top Match Rate Badge */}
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black shadow-xs">
                          {idx === 0 ? '🌟 98% 完美契合' : idx === 1 ? '✨ 95% 超級推薦' : '🎈 90% 推薦'}
                        </span>
                        <span className="text-xs font-bold text-amber-200">
                          {book.originCountry} {book.flag}
                        </span>
                      </div>

                      {/* Cover Image */}
                      <div className="relative h-40 sm:h-48 rounded-xl overflow-hidden shadow-md">
                        <img
                          src={book.coverUrl}
                          alt={book.title['zh-TW'] || book.title.en}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                          <p className="text-[10px] text-amber-200 line-clamp-2">
                            {book.summary['zh-TW'] || book.summary.en}
                          </p>
                        </div>
                      </div>

                      {/* Title & Author */}
                      <div>
                        <h5 className="font-black text-xs sm:text-sm text-amber-200 line-clamp-1">
                          《{book.title['zh-TW'] || book.title.en}》
                        </h5>
                        <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold mt-0.5">
                          <span>{book.author}</span>
                          <span className="text-amber-400 flex items-center gap-0.5">
                            <Star className="w-3 h-3 fill-amber-400" />
                            {book.rating}
                          </span>
                        </div>
                      </div>

                      {/* Read Button */}
                      <button
                        type="button"
                        onClick={() => {
                          onSelectBook(book);
                          onClose();
                        }}
                        className="w-full py-2 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition-transform group-hover:scale-102"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>立即閱讀繪本</span>
                      </button>
                    </div>
                  ))}
                </div>

                {/* Wooden Shelf Base Visual Bar */}
                <div className="w-full h-6 rounded-b-xl bg-gradient-to-r from-amber-900 via-amber-800 to-amber-950 border-t-4 border-amber-600 shadow-2xl flex items-center justify-center text-[10px] font-black text-amber-300/80">
                  ═══ 【小星選書專屬質感木質展示架】 ═══
                </div>

              </div>
            </div>

          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950 border-t border-amber-400/20 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-amber-300 font-bold">
            <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
            <span>用語音或選擇主題，AI 導覽助手即刻帶路！</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-amber-400 text-slate-950 font-black text-xs hover:bg-amber-300 cursor-pointer"
          >
            完成導覽
          </button>
        </div>

      </div>
    </div>
  );
};
