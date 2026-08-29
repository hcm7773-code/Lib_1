import React from 'react';
import {
  Sparkles, BookOpen, Lightbulb, Heart, Volume2, CheckCircle2,
  HelpCircle, Eye, Compass, Star, X, Bookmark, Zap, Brain
} from 'lucide-react';
import { Book, VocabItem } from '../types';
import { speakText, playStarChime } from '../utils/audio';

interface ReadingFocusModePanelProps {
  book: Book;
  currentPageNumber: number;
  currentPageText: string;
  currentPageVocab?: VocabItem[];
  isOpen: boolean;
  onClose: () => void;
  onSelectWord?: (vocab: VocabItem) => void;
}

export const ReadingFocusModePanel: React.FC<ReadingFocusModePanelProps> = ({
  book,
  currentPageNumber,
  currentPageText,
  currentPageVocab = [],
  isOpen,
  onClose,
  onSelectWord,
}) => {
  if (!isOpen) return null;

  // Extract smart highlights based on page text and book context
  const getPageHighlights = () => {
    const text = currentPageText || '';
    const bookTitle = typeof book.title === 'string' ? book.title : (book.title['zh-TW'] || book.title.en || '繪本');
    
    // Determine key theme / plot cue
    let coreEssence = `第 ${currentPageNumber} 頁描繪了故事中的重要轉折，主要角色正面臨關鍵的探索與選擇。`;
    let emotionCue = '好奇與期待 🌟';
    let reflectionQuestion = '如果換作是你，遇到這個情境你會怎麼做呢？';
    let moralHighlight = '勇於嘗試新事物，細心觀察身邊的每一個微小變化。';

    if (text.includes('出發') || text.includes('起程') || text.includes('森林') || currentPageNumber === 1) {
      coreEssence = `【冒險序幕】主角整理好心情，勇敢跨出探索世界的第一步。`;
      emotionCue = '充滿勇氣與探索渴望 🎒';
      reflectionQuestion = '主角出發前帶了什麼好品質？你出門探險最想帶上什麼？';
      moralHighlight = '所有的偉大旅程，都始於踏出第一步的勇氣。';
    } else if (text.includes('困難') || text.includes('難過') || text.includes('哭') || text.includes('害怕') || text.includes('迷路')) {
      coreEssence = `【難關考驗】遇到意料之外的阻礙，主角正在學會冷靜面對。`;
      emotionCue = '堅持與不放棄 💪';
      reflectionQuestion = '當主角感到迷惘時，是什麼力量支持著他繼續前進？';
      moralHighlight = '遇到困難時，停下來深呼吸並思考，總會找到光亮的出口。';
    } else if (text.includes('朋友') || text.includes('幫忙') || text.includes('分享') || text.includes('一起') || text.includes('笑容')) {
      coreEssence = `【友誼互助】遇見志同道合的好夥伴，團隊合作讓力量加倍。`;
      emotionCue = '溫暖與互信 💖';
      reflectionQuestion = '故事裡的朋友們是如何互相扶持的呢？';
      moralHighlight = '真誠的友誼是人生中最珍貴的魔法，分享讓快樂翻倍。';
    } else if (text.includes('成功') || text.includes('回家') || text.includes('開心') || text.includes('星星') || currentPageNumber === book.pages.length) {
      coreEssence = `【圓滿成長】主角順利達成目標，收穫了智慧與內心的成長。`;
      emotionCue = '成就感與感恩 🏆';
      reflectionQuestion = '讀完這本書，你最佩服主角哪一個優點？';
      moralHighlight = '經歷過風雨的成長最美麗，心中充滿愛就能照亮未來。';
    }

    return {
      coreEssence,
      emotionCue,
      reflectionQuestion,
      moralHighlight,
      bookTitle,
    };
  };

  const highlights = getPageHighlights();

  const handleSpeakSummary = () => {
    playStarChime();
    const speechContent = `本頁重點：${highlights.coreEssence}。思考問題：${highlights.reflectionQuestion}。核心啟發：${highlights.moralHighlight}`;
    speakText(speechContent, 'zh-TW', 1.0);
  };

  return (
    <div className="bg-gradient-to-br from-amber-500/15 via-orange-500/10 to-yellow-500/15 p-5 rounded-3xl border-2 border-amber-400 shadow-xl space-y-4 animate-fadeIn my-4 text-slate-900 dark:text-slate-100">
      
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-amber-300/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center text-lg shadow-md">
            💡
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-sm sm:text-base text-amber-950 dark:text-amber-200">
                閱讀重點導覽模式 (Reading Focus & Highlights)
              </h3>
              <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full shadow-2xs">
                第 {currentPageNumber} 頁精讀
              </span>
            </div>
            <p className="text-[11px] text-amber-900/80 dark:text-slate-400 font-medium">
              提煉本頁核心情節、重要字彙與思考問題，幫助孩子加深理解與共鳴！
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSpeakSummary}
            className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-sm flex items-center gap-1 cursor-pointer transition-transform hover:scale-105"
            title="語音朗讀本頁重點"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">朗讀重點</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-black/10 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            title="關閉重點導覽"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid of Key Points */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        
        {/* Card 1: Core Essence */}
        <div className="p-3.5 rounded-2xl bg-white/90 dark:bg-slate-800/90 border border-amber-200 dark:border-slate-700 space-y-1.5 shadow-2xs">
          <div className="flex items-center gap-1.5 text-xs font-black text-amber-700 dark:text-amber-400">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>核心情節提煉</span>
          </div>
          <p className="text-xs font-bold leading-relaxed line-clamp-3 text-slate-800 dark:text-slate-200">
            {highlights.coreEssence}
          </p>
        </div>

        {/* Card 2: Emotion / Empathy Point */}
        <div className="p-3.5 rounded-2xl bg-white/90 dark:bg-slate-800/90 border border-rose-200 dark:border-slate-700 space-y-1.5 shadow-2xs">
          <div className="flex items-center gap-1.5 text-xs font-black text-rose-600 dark:text-rose-400">
            <Heart className="w-3.5 h-3.5 text-rose-500" />
            <span>角色情感共鳴</span>
          </div>
          <div className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
            {highlights.emotionCue}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            引導孩子體會角色的心境轉變，建立同理心。
          </p>
        </div>

        {/* Card 3: Thought-Provoking Question */}
        <div className="p-3.5 rounded-2xl bg-white/90 dark:bg-slate-800/90 border border-indigo-200 dark:border-slate-700 space-y-1.5 shadow-2xs">
          <div className="flex items-center gap-1.5 text-xs font-black text-indigo-600 dark:text-indigo-400">
            <HelpCircle className="w-3.5 h-3.5 text-indigo-500" />
            <span>親子延伸討論</span>
          </div>
          <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-relaxed">
            {highlights.reflectionQuestion}
          </p>
        </div>

        {/* Card 4: Moral Lesson */}
        <div className="p-3.5 rounded-2xl bg-white/90 dark:bg-slate-800/90 border border-emerald-200 dark:border-slate-700 space-y-1.5 shadow-2xs">
          <div className="flex items-center gap-1.5 text-xs font-black text-emerald-600 dark:text-emerald-400">
            <Brain className="w-3.5 h-3.5 text-emerald-500" />
            <span>心靈成長啟發</span>
          </div>
          <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-relaxed">
            {highlights.moralHighlight}
          </p>
        </div>
      </div>

      {/* Vocabulary Key Highlights Bar if words exist */}
      {currentPageVocab && currentPageVocab.length > 0 && (
        <div className="pt-2 border-t border-amber-200/80 flex flex-wrap items-center gap-2">
          <span className="text-xs font-black text-amber-950 dark:text-amber-200 flex items-center gap-1 shrink-0">
            <Bookmark className="w-3.5 h-3.5 text-orange-600" />
            <span>本頁重點生字單詞：</span>
          </span>

          <div className="flex flex-wrap gap-1.5">
            {currentPageVocab.map((v, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  playStarChime();
                  speakText(v.word, 'en', 1.0);
                  if (onSelectWord) onSelectWord(v);
                }}
                className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-slate-700 border border-amber-300 dark:border-slate-600 text-xs font-black text-amber-950 dark:text-amber-300 shadow-2xs transition-transform hover:scale-105 cursor-pointer flex items-center gap-1"
                title="點擊聆聽發音並查看生字解釋"
              >
                <span>🔤 {v.word}</span>
                <span className="text-[10px] text-slate-500 font-normal">({v.translation})</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
