import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Bot,
  Sparkles,
  Send,
  Volume2,
  VolumeX,
  Smile,
  Mic,
  Star,
  Award,
  BookOpen,
  RotateCcw,
  MessageSquare,
  Flame,
  Heart,
  Lightbulb,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import { Book, UserProfile } from '../types';
import { playStarChime, playPageTurnSound } from '../utils/audio';

export interface BookCharacter {
  id: string;
  name: string;
  avatar: string;
  role: string;
  personality: string;
  greeting: string;
  sampleQuestions: string[];
  themeColor: string;
}

interface MessageItem {
  id: string;
  sender: 'user' | 'character';
  text: string;
  emotion?: string;
  actionGesture?: string;
  timestamp: string;
}

interface StoryCharacterRoleplayModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: Book;
  currentPageIndex: number;
  profile?: UserProfile;
  onAwardStar: (stars: number) => void;
  onIncrementRoleplayCount?: () => void;
  darkMode?: boolean;
}

// Generate context-aware characters based on book
function getCharactersForBook(book: Book): BookCharacter[] {
  const bookTitle = typeof book.title === 'string' ? book.title : book.title['zh-TW'] || book.title.en;

  if (bookTitle.includes('小王子') || bookTitle.includes('星空') || bookTitle.includes('狐狸')) {
    return [
      {
        id: 'char-prince',
        name: '小王子',
        avatar: '👑',
        role: 'B612星球的主角',
        personality: '純真、溫柔、對世界充滿好奇心',
        greeting: '你好呀！我是小王子。你在我的故事裡看到那朵驕傲又美麗的玫瑰花和星空狐狸了嗎？✨',
        sampleQuestions: [
          '你在B612星球上每天都做些什麼？',
          '你為什麼那麼想念你的玫瑰花？',
          '狐狸教給你的最重要的秘密是什麼？',
          '下一頁我們會看到哪一顆奇妙的星球呢？'
        ],
        themeColor: 'from-amber-400 to-yellow-500',
      },
      {
        id: 'char-fox',
        name: '星空狐狸',
        avatar: '🦊',
        role: '智慧與友誼的導師',
        personality: '聰明、溫暖、重視彼此的信任',
        greeting: '嗨！我是狐狸。記住哦，「只有用心才能看清楚，真正重要的東西用眼睛是看不見的」。你想跟我聊聊什麼？🌾',
        sampleQuestions: [
          '什麼是「馴養」？可以跟我解釋嗎？',
          '為什麼看見金黃色的麥田就會想起小王子？',
          '如何才能交到真正的好朋友？'
        ],
        themeColor: 'from-orange-400 to-amber-600',
      },
      {
        id: 'char-rose',
        name: '守護玫瑰',
        avatar: '🌹',
        role: '驕傲而脆弱的花朵',
        personality: '優雅、愛撒嬌、內心深愛著小王子',
        greeting: '早安！我是小王子細心灌溉的玫瑰。我身上的四根刺雖然擋不住風，但我的花香陪伴了整個星球哦！🌸',
        sampleQuestions: [
          '風吹過來的時候你真的會害怕嗎？',
          '小王子離開星球時，你心裡在想什麼？',
          '你想對地球上的小朋友說些什麼？'
        ],
        themeColor: 'from-rose-400 to-pink-600',
      }
    ];
  }

  if (bookTitle.includes('三隻小豬') || bookTitle.includes('綠建築') || bookTitle.includes('環保')) {
    return [
      {
        id: 'char-pig-youngest',
        name: '綠建築小豬',
        avatar: '🐷',
        role: '聰明的環保建築小大師',
        personality: '勤奮、熱愛大自然、具有科學精神',
        greeting: '哈囉！我是三隻小豬裡的綠建築設計師！我用太陽能板、雨水回收和厚磚蓋了一棟冬暖夏涼又環保的房子哦！📐✨',
        sampleQuestions: [
          '為什麼你的房子大野狼吹不倒？',
          '太陽能板是怎麼把陽光變成電力的？',
          '我們家裡也可以做哪些環保小行動？'
        ],
        themeColor: 'from-emerald-400 to-teal-600',
      },
      {
        id: 'char-wolf',
        name: '森林大野狼',
        avatar: '🐺',
        role: '從搗蛋鬼變成了環保學徒',
        personality: '個性直爽、好奇好學、現在最喜歡綠色科技',
        greeting: '嗷嗚～！別害怕，我現在不吃小豬了！我正在向小豬學習如何種植屋頂花園和節能減碳呢！🌿',
        sampleQuestions: [
          '你為什麼放棄吹倒小豬的房子了？',
          '你最喜歡綠建築的哪一項環保設計？',
          '大野狼你吹氣的力量到底有多大？'
        ],
        themeColor: 'from-slate-500 to-slate-700',
      }
    ];
  }

  // Generic fallback based on book info
  return [
    {
      id: 'char-protagonist',
      name: '故事主角',
      avatar: '🦸‍♂️',
      role: '冒險的勇敢核心',
      personality: '勇敢、善良、樂於助人',
      greeting: `你好呀！我是《${bookTitle}》的主角！很高興跟你一起閱讀我的冒險故事！你想知道我的什麼秘密呢？🌟`,
      sampleQuestions: [
        '你在故事裡遇到最困難的挑戰是什麼？',
        '你可以教我如何跟你一樣勇敢嗎？',
        '在這一頁你心裡最深刻的感受是什麼？',
        '接下來我們會迎來什麼樣的冒險？'
      ],
      themeColor: 'from-amber-400 to-orange-500',
    },
    {
      id: 'char-companion',
      name: '冒險小夥伴',
      avatar: '🐾',
      role: '忠誠的貼心夥伴',
      personality: '活潑、幽默、充滿奇思妙想',
      greeting: `嗨朋友！我是主角身邊最棒的小夥伴！每一頁我都陪伴在旁邊，有什麼問題都可以問我喔！🎈`,
      sampleQuestions: [
        '你最喜歡主角的哪一個優點？',
        '如果遇到危險，你會用什麼妙招保護大家？',
        '這本書裡你最喜歡的一頁是哪裡？'
      ],
      themeColor: 'from-purple-400 to-indigo-600',
    }
  ];
}

export const StoryCharacterRoleplayModal: React.FC<StoryCharacterRoleplayModalProps> = ({
  isOpen,
  onClose,
  book,
  currentPageIndex,
  profile,
  onAwardStar,
  onIncrementRoleplayCount,
  darkMode = false,
}) => {
  const characters = getCharactersForBook(book);
  const [selectedChar, setSelectedChar] = useState<BookCharacter>(characters[0]);
  const [messages, setMessages] = useState<Record<string, MessageItem[]>>({});
  const [inputVal, setInputVal] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentPage = book.pages[currentPageIndex] || book.pages[0];
  const currentPageText = typeof currentPage.text === 'string'
    ? currentPage.text
    : currentPage.text['zh-TW'] || currentPage.text.en || '';

  // Initialize messages for character
  useEffect(() => {
    if (!messages[selectedChar.id]) {
      setMessages((prev) => ({
        ...prev,
        [selectedChar.id]: [
          {
            id: `msg-greet-${selectedChar.id}`,
            sender: 'character',
            text: selectedChar.greeting,
            emotion: 'happy',
            actionGesture: '微笑地向你眨了眨眼睛並揮手',
            timestamp: new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' }),
          },
        ],
      }));
      setSuggestedQuestions(selectedChar.sampleQuestions || []);
    } else {
      const currentList = messages[selectedChar.id];
      if (currentList.length <= 1) {
        setSuggestedQuestions(selectedChar.sampleQuestions || []);
      }
    }
  }, [selectedChar.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedChar.id, isLoading]);

  if (!isOpen) return null;

  const currentChatList = messages[selectedChar.id] || [];

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputVal).trim();
    if (!text || isLoading) return;

    setInputVal('');
    const userMsg: MessageItem = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' }),
    };

    // Append user message
    setMessages((prev) => ({
      ...prev,
      [selectedChar.id]: [...(prev[selectedChar.id] || []), userMsg],
    }));

    setIsLoading(true);

    try {
      const response = await fetch('/api/gemini/character-roleplay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookTitle: typeof book.title === 'string' ? book.title : book.title['zh-TW'] || book.title.en,
          characterName: selectedChar.name,
          characterRole: `${selectedChar.role} (${selectedChar.personality})`,
          currentPageText,
          userMessage: text,
          history: currentChatList.map((m) => ({
            role: m.sender === 'user' ? 'user' : 'character',
            content: m.text,
          })),
          childName: profile?.name || '小讀者',
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      const data = await response.json();

      const charMsg: MessageItem = {
        id: `msg-char-${Date.now()}`,
        sender: 'character',
        text: data.reply || '聽你這麼說，我心裡充滿了溫暖！我們繼續一起在書中探索吧！✨',
        emotion: data.emotion || 'happy',
        actionGesture: data.actionGesture || '開心地向你點點頭',
        timestamp: new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => ({
        ...prev,
        [selectedChar.id]: [...(prev[selectedChar.id] || []), charMsg],
      }));

      if (data.suggestedFollowUps && Array.isArray(data.suggestedFollowUps)) {
        setSuggestedQuestions(data.suggestedFollowUps);
      }

      // Award stars & focus achievement count
      onAwardStar(2);
      if (onIncrementRoleplayCount) {
        onIncrementRoleplayCount();
      }
      playStarChime();

      // Read aloud character reply
      speakCharacterText(charMsg.text);
    } catch (err) {
      console.error('Character roleplay chat error:', err);
      const fallbackMsg: MessageItem = {
        id: `msg-char-fb-${Date.now()}`,
        sender: 'character',
        text: `我聽到了！身為${selectedChar.name}，能有你這樣用心的讀者小夥伴，我的故事變得更加精彩了！✨`,
        emotion: 'caring',
        actionGesture: '向你比了一個大大的贊',
        timestamp: new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => ({
        ...prev,
        [selectedChar.id]: [...(prev[selectedChar.id] || []), fallbackMsg],
      }));
      setSuggestedQuestions(selectedChar.sampleQuestions || []);
    } finally {
      setIsLoading(false);
    }
  };

  const speakCharacterText = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'zh-TW';
      utterance.rate = 1.0;
      utterance.pitch = selectedChar.id.includes('prince') || selectedChar.id.includes('youngest') ? 1.25 : 1.05;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error:', e);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div
        className={`relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden transition-all ${
          darkMode
            ? 'bg-slate-900 border-slate-700 text-slate-100'
            : 'bg-gradient-to-b from-amber-50/90 via-white to-orange-50/60 border-amber-300 text-slate-900'
        }`}
      >
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-amber-200 dark:border-slate-800 flex items-center justify-between bg-white/70 dark:bg-slate-900/70 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-amber-400 text-white shadow-md">
              <Bot className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black">
                  🎭 與故事主角對話・AI 沉浸式角色扮演
                </h2>
                <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 text-slate-950 shadow-2xs">
                  +2 ⭐ 每輪對話
                </span>
              </div>
              <p className="text-xs font-semibold text-amber-900/70 dark:text-slate-400 mt-0.5">
                當前頁面：第 {currentPageIndex + 1} 頁 • 選擇書中主角進行趣味劇情問答與心靈交流
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              stopSpeaking();
              onClose();
            }}
            className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-100 hover:text-rose-600 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            title="關閉對話"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Character Selector Horizontal Tabs */}
        <div className="px-6 py-3 border-b border-amber-200/60 dark:border-slate-800 flex items-center gap-3 bg-amber-100/30 dark:bg-slate-800/40 overflow-x-auto scrollbar-none">
          <span className="text-xs font-black text-amber-900 dark:text-slate-300 shrink-0 flex items-center gap-1">
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            選擇對話角色：
          </span>

          <div className="flex items-center gap-2">
            {characters.map((char) => {
              const isSelected = selectedChar.id === char.id;
              return (
                <button
                  key={char.id}
                  type="button"
                  onClick={() => {
                    stopSpeaking();
                    setSelectedChar(char);
                    playPageTurnSound();
                  }}
                  className={`px-3.5 py-1.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                    isSelected
                      ? `bg-gradient-to-r ${char.themeColor} text-white shadow-md scale-105 ring-2 ring-amber-400/50`
                      : 'bg-white/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-amber-100 border border-amber-200 dark:border-slate-700'
                  }`}
                >
                  <span className="text-base">{char.avatar}</span>
                  <span>{char.name}</span>
                  <span className="text-[10px] opacity-85 font-medium hidden sm:inline">
                    ({char.role})
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Current Active Character Banner */}
        <div className="px-6 py-2.5 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-yellow-500/10 dark:bg-slate-850/50 border-b border-amber-200/50 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-400 p-0.5 shadow-sm flex items-center justify-center text-xl">
              {selectedChar.avatar}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-sm text-slate-900 dark:text-slate-100">
                  {selectedChar.name}
                </span>
                <span className="text-[10px] font-extrabold px-2 py-0.2 rounded-full bg-amber-400/30 text-amber-900 dark:text-amber-300">
                  {selectedChar.personality}
                </span>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                正在依據《{typeof book.title === 'string' ? book.title : book.title['zh-TW'] || book.title.en}》劇情以專屬口吻互動
              </div>
            </div>
          </div>

          {isSpeaking && (
            <div className="flex items-center gap-2 bg-amber-400/20 text-amber-800 dark:text-amber-300 px-3 py-1 rounded-xl text-xs font-bold animate-pulse">
              <Volume2 className="w-4 h-4 text-amber-600" />
              <span>主角正在語音朗讀中...</span>
              <button
                type="button"
                onClick={stopSpeaking}
                className="hover:underline text-[10px] text-rose-500 font-black ml-1 cursor-pointer"
              >
                停止
              </button>
            </div>
          )}
        </div>

        {/* Chat Dialogue Stream Container */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {currentChatList.map((msg) => {
            const isChar = msg.sender === 'character';

            return (
              <div
                key={msg.id}
                className={`flex gap-3 items-start animate-fadeIn ${
                  isChar ? 'justify-start' : 'justify-end'
                }`}
              >
                {isChar && (
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-400 p-0.5 shadow-md shrink-0 flex items-center justify-center text-xl">
                    {selectedChar.avatar}
                  </div>
                )}

                <div className={`max-w-[85%] sm:max-w-[75%] space-y-1.5`}>
                  {/* Sender Name & Gesture Note */}
                  <div
                    className={`flex items-center gap-2 text-[11px] font-bold ${
                      isChar ? 'text-amber-800 dark:text-amber-300' : 'text-slate-500 justify-end'
                    }`}
                  >
                    <span>{isChar ? selectedChar.name : profile?.name || '我'}</span>
                    {msg.actionGesture && (
                      <span className="text-[10px] font-medium italic opacity-85 text-slate-500 dark:text-slate-400">
                        *{msg.actionGesture}*
                      </span>
                    )}
                    <span className="text-[10px] opacity-60">{msg.timestamp}</span>
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`p-4 rounded-3xl text-xs sm:text-sm font-medium leading-relaxed shadow-sm relative group ${
                      isChar
                        ? 'bg-white dark:bg-slate-800 border-2 border-amber-300/80 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-tl-sm'
                        : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-tr-sm'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>

                    {/* Speech read aloud button for character */}
                    {isChar && (
                      <div className="pt-2 mt-2 border-t border-amber-100 dark:border-slate-700/60 flex items-center justify-between">
                        <div className="flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                          <Sparkles className="w-3 h-3" />
                          <span>沉浸式故事扮演</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => speakCharacterText(msg.text)}
                          className="p-1 rounded-lg hover:bg-amber-100 dark:hover:bg-slate-700 text-amber-700 dark:text-amber-300 transition-colors flex items-center gap-1 text-[11px] font-bold cursor-pointer"
                          title="語音朗讀主角台詞"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>聽主角說話</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {!isChar && (
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-400 to-amber-500 p-0.5 shadow-md shrink-0 flex items-center justify-center text-xl text-white">
                    {profile?.avatar || '🐻'}
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 items-start animate-fadeIn">
              <div className="w-10 h-10 rounded-2xl bg-amber-400 p-0.5 shadow-md shrink-0 flex items-center justify-center text-xl animate-pulse">
                {selectedChar.avatar}
              </div>
              <div className="p-4 rounded-3xl bg-white dark:bg-slate-800 border-2 border-amber-300 dark:border-slate-700 text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-2 shadow-xs">
                <Sparkles className="w-4 h-4 animate-spin text-amber-500" />
                <span>{selectedChar.name} 正在思考並組織回答...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick Prompt Chips */}
        {suggestedQuestions.length > 0 && (
          <div className="px-6 py-2.5 bg-amber-100/40 dark:bg-slate-800/50 border-t border-amber-200/60 dark:border-slate-800 flex items-center gap-2 overflow-x-auto scrollbar-none">
            <span className="text-[11px] font-black text-amber-900 dark:text-slate-300 flex items-center gap-1 shrink-0">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              點擊快速提問：
            </span>
            <div className="flex items-center gap-1.5 shrink-0">
              {suggestedQuestions.map((sq, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(sq)}
                  disabled={isLoading}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-750 text-slate-800 dark:text-slate-200 border border-amber-300 dark:border-slate-600 text-xs font-bold hover:bg-amber-100 hover:border-amber-400 hover:scale-105 transition-all shadow-2xs whitespace-nowrap cursor-pointer disabled:opacity-50"
                >
                  💬 {sq}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Input Field */}
        <div className="p-4 sm:p-5 border-t border-amber-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 flex items-center gap-2 sm:gap-3">
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder={`跟 ${selectedChar.name} 說點什麼吧（例如：你覺得下一頁會發生什麼事呢？）...`}
            disabled={isLoading}
            className="flex-1 px-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-amber-300 dark:border-slate-700 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-400 text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
          />

          <button
            type="button"
            onClick={() => handleSendMessage()}
            disabled={!inputVal.trim() || isLoading}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs sm:text-sm shadow-md hover:scale-105 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">發送</span>
          </button>
        </div>
      </div>
    </div>
  );
};
