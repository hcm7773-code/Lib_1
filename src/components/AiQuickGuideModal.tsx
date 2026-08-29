import React, { useState, useEffect } from 'react';
import { Sparkles, X, Volume2, VolumeX, BookOpen, Star, Heart, ArrowRight, Lightbulb, MessageCircle, Smile, ShieldAlert, Brain, Wand2, ChevronDown, ChevronUp } from 'lucide-react';
import { Book, LanguageCode } from '../types';
import { speakText, playStarChime } from '../utils/audio';

type GuideMode = 'fun' | 'challenging';

interface AiQuickGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: Book | null;
  onSelectBook: (book: Book) => void;
  primaryLang?: LanguageCode;
  darkMode?: boolean;
}

export const AiQuickGuideModal: React.FC<AiQuickGuideModalProps> = ({
  isOpen,
  onClose,
  book,
  onSelectBook,
  primaryLang = 'zh-TW',
  darkMode = false,
}) => {
  const [guideMode, setGuideMode] = useState<GuideMode>('fun');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [showPromptDetails, setShowPromptDetails] = useState(false);

  useEffect(() => {
    if (isOpen && book) {
      playStarChime();
    } else {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsPlayingAudio(false);
    }
  }, [isOpen, book]);

  // Cancel speech when switching mode
  const handleSwitchMode = (mode: GuideMode) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingAudio(false);
    setGuideMode(mode);
  };

  if (!isOpen || !book) return null;

  const displayTitle = book.title[primaryLang] || book.title['zh-TW'] || book.title['en'];
  const baseSummary = book.summary[primaryLang] || book.summary['zh-TW'] || book.summary['en'];

  // Prompt directives used to tailor AI output based on complexity mode
  const getPromptDirective = () => {
    if (guideMode === 'fun') {
      return {
        modeName: '🎈 趣味故事版 (生動活潑，適低年級與學齡前)',
        systemPrompt: `系統指令：請扮演熱情洋溢的說故事阿姨，使用【親切口語、豐富擬聲詞 (咻~ 砰! 哇喔)、亮眼 Emoji 與歡樂劇情】將繪本簡介轉化為 3 點極具趣味性的導讀精華，激發幼童的好奇心！`,
        thinkQuestion: '「如果換作是你跟故事裡的主角一起探險，你會帶哪一樣超酷的玩具去幫助他呢？」',
      };
    } else {
      return {
        modeName: '🧠 困難探險版 (深層思考，適中高年級與深度挑戰)',
        systemPrompt: `系統指令：請扮演智慧故事導師，使用【成語高階詞彙、因果邏輯分析、哲理道德隱喻與歷史背景】將繪本寫成 3 點具備深層思考力與文藝品味的經典分析導讀，培養批判性思考！`,
        thinkQuestion: '「作者在故事中隱喻了什麼人生道理？如果你能改變故事的轉折點，你會如何設計更具智慧的解決方案？」',
      };
    }
  };

  const promptInfo = getPromptDirective();

  // Generate highlights tailored for 'fun' or 'challenging' modes
  const generateHighlights = () => {
    const summaryStr = baseSummary.toLowerCase();
    const isFun = guideMode === 'fun';

    if (summaryStr.includes('小王子') || summaryStr.includes('玫瑰') || summaryStr.includes('狐狸')) {
      if (isFun) {
        return [
          { emoji: '🌟', title: '小王子的神奇宇宙大冒險', text: '來自 B-612 迷你行星的小王子出發囉！他穿過星空遇到愛命令的國王跟算帳的大人，哇~ 宇宙真的好神奇！' },
          { emoji: '🦊', title: '小狐狸的抱抱好朋友秘密', text: '可愛小狐狸悄悄說：『用心建立感情，彼此就會變成全世界最特別的好朋友哦！』' },
          { emoji: '🌹', title: '獨一無二的驕傲小玫瑰', text: '就算花園裡有一萬朵花，小王子親手灌溉照顧的小玫瑰，永遠是他心中唯一的寶貝！' },
        ];
      } else {
        return [
          { emoji: '🌌', title: '宇宙隱喻與大人世界的荒謬反思', text: '小王子周遊各星球，諷刺了成年人對權力、虛榮與金錢的盲目追求，提醒我們保持純真童心。' },
          { emoji: '🦊', title: '『馴服』的哲學：責任與愛的連結', text: '狐狸揭示了經典哲理：『真正的東西用眼睛是看不見的，只有用心靈才能洞察本質。』對所愛事物須承擔責任。' },
          { emoji: '🌹', title: '獨一無二價值的哲學詮釋', text: '你在玫瑰身上傾注的時間與心血，讓這朵普通的花賦予了生命中無法替代的獨特靈魂價值。' },
        ];
      }
    } else if (summaryStr.includes('丑小鴨') || summaryStr.includes('天鵝') || summaryStr.includes('羽毛')) {
      if (isFun) {
        return [
          { emoji: '🐣', title: '毛毛鴨搖搖晃晃登場', text: '小鴨鴨長得灰灰大大的，大家都不跟他玩，但他沒有哭哭，依然勇敢踏出探險的腳步！' },
          { emoji: '❄️', title: '超級大寒冬堅強大挑戰', text: '呼呼呼~ 大風雪吹過來！小鴨學會抱緊自己、照顧自己，等著溫暖的春天來臨！' },
          { emoji: '🦢', title: '華麗變身大天鵝啪嗒啪嗒', text: '水面一照，哇！原來他不是醜小鴨，而是展翅飛翔的美麗天鵝！每個人都有超級魔法奇蹟！' },
        ];
      } else {
        return [
          { emoji: '🐣', title: '社會偏見與自我認同困境', text: '醜小鴨因外表異於同儕而遭受排擠，揭示了群體生活中對異己的刻板印象與偏見考驗。' },
          { emoji: '❄️', title: '逆境沉潛與心理韌性塑造', text: '面對嚴酷考驗與孤立無援，小鴨展現出強大的自我復原力（Resilience），在逆境中持續成長。' },
          { emoji: '🦢', title: '天賦蛻變與生命本質的實現', text: '最終蛻變為白天鵝，象徵只要不放棄內在潛能，經歷磨難後終將實現個人的生命本質與價值。' },
        ];
      }
    } else if (summaryStr.includes('三隻小豬') || summaryStr.includes('稻草') || summaryStr.includes('大灰狼')) {
      if (isFun) {
        return [
          { emoji: '🐷', title: '小豬三兄弟蓋房子囉', text: '大哥蓋稻草屋啪啪啪，二哥蓋木頭屋咚咚咚，三弟蓋磚頭屋叩叩叩，大家比比看誰最棒！' },
          { emoji: '🐺', title: '大灰狼呼呼吹風挑戰', text: '大灰狼呼大一口氣，稻草屋跟木頭屋都飛光光！小豬們趕快跑到堅固的磚頭屋躲起來！' },
          { emoji: '🧱', title: '踏實認真打敗大難關', text: '三弟腳踏實地一步一步蓋房子，拯救了大家！做事不偷懶，你就是最厲害的小英雄！' },
        ];
      } else {
        return [
          { emoji: '🐷', title: '延遲享樂與長期規劃之比對', text: '故事對比了前兩隻小豬追求短期享樂與三弟注重長期安全規劃的截然不同行為選擇。' },
          { emoji: '🐺', title: '危機應變與結構防禦工程學', text: '大灰狼象徵外界突發的威脅與風險，磚頭屋展現了深謀遠慮與結構穩定度對抗風險的重要性。' },
          { emoji: '🧱', title: '兄弟合作與經驗教訓總結', text: '失敗的體驗讓前兩隻小豬學會了踏實做事，展現了從錯誤中學習與團隊互助的普世價值。' },
        ];
      }
    }

    // Default highlights generator
    if (isFun) {
      return [
        { emoji: '🐣', title: '主角可愛登場', text: `故事裡有【${book.author}】創造的超萌主角，在【${book.originCountry}】開啟了一場超有愛的歡樂冒險！` },
        { emoji: '🚀', title: '刺激好玩的情節', text: `【${displayTitle}】包含 ${book.pages.length} 頁精彩畫面：${baseSummary}` },
        { emoji: '🌟', title: '給寶貝的童心金句', text: '保持好奇心與笑容，你也能像故事主角一樣勇往直前、閃閃發光！' },
      ];
    } else {
      return [
        { emoji: '📖', title: '文學背景與時代脈絡', text: `源自【${book.originCountry}】作者【${book.author}】的經典創作，展現了獨特的文化意涵與經典敘事結構。` },
        { emoji: '💡', title: '核心主題與情節拆解', text: `作品《${displayTitle}》收錄 ${book.pages.length} 頁精彩內容：深入解析其內部轉折與主角衝突調和機制。` },
        { emoji: '🎓', title: '思辨與價值觀內化', text: '閱讀此故事能提升批判性閱讀能力，啟發孩子對正義、同理心與解決難題之深層思考。' },
      ];
    }
  };

  const highlights = generateHighlights();

  const handleToggleSpeech = () => {
    if (isPlayingAudio) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsPlayingAudio(false);
    } else {
      const modePrefix = guideMode === 'fun' ? '哈囉小寶貝！' : '各位小探險家你好！';
      const speechTextStr = `${modePrefix}今天為你${guideMode === 'fun' ? '趣味' : '深度'}導讀繪本《${displayTitle}》。` +
        highlights.map((h) => `${h.title}。${h.text}`).join(' ');

      setIsPlayingAudio(true);
      speakText(
        speechTextStr,
        'zh-TW',
        guideMode === 'fun' ? 0.95 : 0.88,
        guideMode === 'fun' ? 'mom' : 'teacher',
        guideMode === 'fun' ? 1.2 : 1.0,
        () => setIsPlayingAudio(false)
      );
    }
  };

  const handleStartReading = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    onSelectBook(book);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div
        className={`relative w-full max-w-xl rounded-3xl p-5 sm:p-7 shadow-2xl border-4 transition-all animate-scaleUp z-10 my-auto ${
          darkMode
            ? 'bg-slate-900 border-purple-500/80 text-slate-100'
            : 'bg-gradient-to-b from-purple-50 via-pink-50/40 to-amber-50 border-purple-300 text-purple-950'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={() => {
            if ('speechSynthesis' in window) window.speechSynthesis.cancel();
            onClose();
          }}
          className={`absolute top-4 right-4 p-2 rounded-full transition-colors z-20 ${
            darkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-purple-200 text-purple-800'
          }`}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start gap-3 border-b border-purple-200/80 pb-4 mb-4 pr-8">
          <div className="relative w-16 h-20 shrink-0 rounded-2xl overflow-hidden border-2 border-purple-300 shadow-md">
            <img src={book.coverUrl} alt={displayTitle} className="w-full h-full object-cover" />
            <div className="absolute top-1 left-1 bg-black/60 text-white text-[10px] px-1 rounded">
              {book.flag}
            </div>
          </div>

          <div className="space-y-1">
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-200 dark:bg-purple-950 text-purple-900 dark:text-purple-300 font-black text-[11px]">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-spin" />
              <span>AI 多階童言導讀引擎</span>
            </div>

            <h2 className="text-lg sm:text-xl font-black text-purple-950 dark:text-purple-100 leading-snug">
              《{displayTitle}》
            </h2>

            <div className="flex items-center gap-3 text-xs font-bold text-slate-500 dark:text-slate-400">
              <span>作者: {book.author}</span>
              <span>•</span>
              <span className="text-amber-600 dark:text-amber-400">適合 {book.ageGroup} 歲</span>
            </div>
          </div>
        </div>

        {/* Mode Selector Selector Bar (趣味故事版 vs 困難探險版) */}
        <div className="mb-4 space-y-2">
          <div className="flex items-center justify-between text-xs font-black text-purple-950 dark:text-purple-200">
            <span className="flex items-center gap-1">
              <Wand2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>請選擇孩子喜歡的 AI 導讀程度：</span>
            </span>

            <button
              type="button"
              onClick={() => setShowPromptDetails(!showPromptDetails)}
              className="text-[11px] font-bold text-purple-700 dark:text-purple-300 hover:underline flex items-center gap-0.5"
            >
              <span>{showPromptDetails ? '隱藏提示詞指令' : '檢視 Prompt 提示詞'}</span>
              {showPromptDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-purple-100/80 dark:bg-slate-800/80 border border-purple-200 dark:border-purple-800">
            <button
              type="button"
              id="btn-select-guide-mode-fun"
              onClick={() => handleSwitchMode('fun')}
              className={`py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                guideMode === 'fun'
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md scale-[1.02]'
                  : 'bg-transparent text-purple-900 dark:text-purple-200 hover:bg-purple-200/50'
              }`}
            >
              <Smile className="w-4 h-4" />
              <span>🎈 趣味故事版 (生動活潑)</span>
            </button>

            <button
              type="button"
              id="btn-select-guide-mode-challenging"
              onClick={() => handleSwitchMode('challenging')}
              className={`py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                guideMode === 'challenging'
                  ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md scale-[1.02]'
                  : 'bg-transparent text-purple-900 dark:text-purple-200 hover:bg-purple-200/50'
              }`}
            >
              <Brain className="w-4 h-4" />
              <span>🧠 困難探險版 (深層思考)</span>
            </button>
          </div>

          {/* System Prompt Instructions Preview Box */}
          {showPromptDetails && (
            <div className="p-3 rounded-2xl bg-slate-900 text-slate-200 dark:bg-slate-950 border border-purple-500/40 text-[11px] space-y-1 animate-fadeIn font-mono">
              <div className="text-amber-400 font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>{promptInfo.modeName} - 提示詞架構：</span>
              </div>
              <p className="text-slate-300 leading-relaxed font-sans">{promptInfo.systemPrompt}</p>
            </div>
          )}
        </div>

        {/* Story Highlights (Child Friendly Cards) */}
        <div className="space-y-2.5 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-purple-950 dark:text-purple-200 flex items-center gap-1">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>3 分鐘核心亮點精華：</span>
            </span>

            {/* TTS Audio Reading Button */}
            <button
              type="button"
              id="btn-toggle-ai-guide-speech"
              onClick={handleToggleSpeech}
              className={`px-3 py-1 rounded-full text-xs font-black flex items-center gap-1.5 transition-all shadow-sm ${
                isPlayingAudio
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'bg-purple-600 hover:bg-purple-700 text-white'
              }`}
            >
              {isPlayingAudio ? (
                <>
                  <VolumeX className="w-3.5 h-3.5" />
                  <span>停止朗讀</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>🔊 聽 {guideMode === 'fun' ? '趣味' : '深度'} 語音導讀</span>
                </>
              )}
            </button>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1 scrollbar-none">
            {highlights.map((h, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-2xl border-2 shadow-2xs space-y-1 transition-all ${
                  guideMode === 'fun'
                    ? 'bg-white/90 dark:bg-slate-800/90 border-pink-200 dark:border-pink-900'
                    : 'bg-indigo-50/70 dark:bg-slate-800/90 border-indigo-200 dark:border-indigo-900'
                }`}
              >
                <div className="flex items-center gap-1.5 font-extrabold text-xs text-purple-950 dark:text-purple-200">
                  <span className="text-base">{h.emoji}</span>
                  <span>{h.title}</span>
                </div>
                <p className="text-xs font-medium text-slate-700 dark:text-slate-300 leading-relaxed pl-5">
                  {h.text}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Thoughtful Kid Question Box */}
        <div className="p-3 rounded-2xl bg-amber-100/80 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 mb-5 flex items-start gap-2.5">
          <Lightbulb className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="text-xs font-black text-amber-900 dark:text-amber-300 block">
              💡 {guideMode === 'fun' ? '陪伴閱讀趣味小提問：' : '高階邏輯思考引導題：'}
            </span>
            <p className="text-xs font-bold text-amber-950/90 dark:text-amber-100">
              {promptInfo.thinkQuestion}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => {
              if ('speechSynthesis' in window) window.speechSynthesis.cancel();
              onClose();
            }}
            className="px-4 py-2.5 rounded-2xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-800 dark:text-slate-200 font-extrabold text-xs sm:text-sm"
          >
            稍後閱讀
          </button>

          <button
            type="button"
            onClick={handleStartReading}
            className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:from-purple-700 hover:to-amber-600 text-white font-black text-xs sm:text-sm shadow-xl flex items-center gap-2 transform hover:scale-105 transition-all"
          >
            <BookOpen className="w-4 h-4" />
            <span>開啟繪本閱讀</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

