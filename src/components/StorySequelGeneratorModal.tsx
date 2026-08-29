import React, { useState, useEffect } from 'react';
import {
  X, Sparkles, Wand2, BookOpen, Image as ImageIcon, Volume2, Save,
  CheckCircle2, RefreshCw, Star, Heart, Layers, Lightbulb, Play, ArrowRight, Pencil
} from 'lucide-react';
import { Book, LanguageCode } from '../types';
import { speakText, playStarChime, playPageTurnSound } from '../utils/audio';

export interface StorySequel {
  id: string;
  bookId: string;
  bookTitle: string;
  createdAt: string;
  ideaPrompt: string;
  sequelTitle: string;
  chapterText: string;
  englishText: string;
  illustrationUrl: string;
  moralLesson: string;
  moodTag: string;
}

interface StorySequelGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: Book;
  primaryLang?: LanguageCode;
  onAwardStar: (stars: number) => void;
  onSaveSequelSuccess?: (sequel: StorySequel) => void;
  darkMode?: boolean;
}

const PRESET_IDEAS = [
  '如果主角在森林裡遇到了會噴七彩泡泡的仙境小龍... 🐲✨',
  '如果小夥伴們舉辦了一場滿天星光的跨年甜點舞會... 🍰🌟',
  '如果主角獲得了一個能讓時間倒退半小時的魔法沙漏... ⏳🔮',
  '如果大家搭乘熱氣球飛到了由棉花糖組成的天空之城... ☁️🎈',
  '如果主角穿越到了 2100 年的未來自律機器人世界... 🤖🚀',
];

export const StorySequelGeneratorModal: React.FC<StorySequelGeneratorModalProps> = ({
  isOpen,
  onClose,
  book,
  primaryLang = 'zh-TW',
  onAwardStar,
  onSaveSequelSuccess,
  darkMode = false,
}) => {
  const [ideaPrompt, setIdeaPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSequel, setGeneratedSequel] = useState<StorySequel | null>(null);
  const [savedSequels, setSavedSequels] = useState<StorySequel[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeTab, setActiveTab] = useState<'create' | 'history'>('create');

  // Load existing saved sequels for this book
  useEffect(() => {
    if (isOpen) {
      try {
        const stored = localStorage.getItem(`story_sequels_${book.id}`);
        if (stored) {
          setSavedSequels(JSON.parse(stored));
        }
      } catch {
        // ignore
      }
    }
  }, [isOpen, book.id]);

  if (!isOpen) return null;

  const bookTitleStr = typeof book.title === 'string' ? book.title : (book.title['zh-TW'] || book.title.en || '精選繪本');

  const handleGenerateSequel = () => {
    if (!ideaPrompt.trim()) return;

    setIsGenerating(true);
    playPageTurnSound();

    setTimeout(() => {
      const promptText = ideaPrompt.trim();

      // Craft creative sequel content based on prompt and book title
      let sequelTitle = `《${bookTitleStr}》續集：${promptText.slice(0, 12)}...`;
      let chapterText = `在原本故事故事的陽光尾聲之後，${promptText.replace(/如果/g, '')}。大家圍坐在一起，發現這個嶄新的冒險帶來了意想不到的溫馨與驚喜！主角握緊了朋友的手，眼中閃爍著對廣闊未來的無畏光芒。`;
      let englishText = `Following the warm ending of the original tale, a brand new adventure unfolded. Together, everyone discovered unexpected joy and wonder! Holding hands tightly, they looked forward to tomorrow with courage.`;
      let moralLesson = `【故事延伸寓意】：只要勇於展現無限想像力，每一個小創意都能為世界種下愛的種子！`;
      let moodTag = '🌟 充滿勇氣與奇蹟';

      if (promptText.includes('龍') || promptText.includes('仙境')) {
        sequelTitle = `《${bookTitleStr}》續章：仙境龍之幻彩旅程`;
        chapterText = `故事還沒結束呢！${promptText}。七彩泡泡在陽光下閃耀著彩虹光澤，大家騎在溫和的小龍背上，俯瞰著翠綠的大地與清澈溪流。這一刻，愛與友誼傳遍了山谷的每一個角落！`;
        englishText = `The tale didn't end there! Rainbow bubbles shimmered under the warm sunlight as everyone soared across emerald valleys on the gentle dragon. Love and friendship filled every corner of the sky!`;
      } else if (promptText.includes('甜點') || promptText.includes('舞會') || promptText.includes('蛋糕')) {
        sequelTitle = `《${bookTitleStr}》續章：星光甜蜜慶典`;
        chapterText = `故事寫下了新的歡樂篇章！${promptText}。香甜的草莓派與閃耀的果汁讓森林裡充滿歡聲笑語，小動物們手拉著手圍成圓圈跳舞，祝願這個充滿善意的地方永遠溫馨。`;
        englishText = `A joyful new chapter was written! Sweet strawberry pies and glowing fruit juice filled the woodland with laughter as animals danced hand in hand, wishing for eternal warmth.`;
      } else if (promptText.includes('未來') || promptText.includes('機器人') || promptText.includes('太空')) {
        sequelTitle = `《${bookTitleStr}》續章：未來的星際旅航`;
        chapterText = `當故事跨越時空，全新的科幻奇蹟誕生了！${promptText}。銀色的飛船劃過絢麗的星雲，智慧機器人成了最可靠的新朋友，帶領著大家探索無邊無際的宇宙真理。`;
        englishText = `Crossing space and time, a sci-fi wonder began! Silver starships glided past colorful nebulae as friendly robots guided everyone through the mysteries of the cosmos.`;
      }

      // Illustration options
      const illustrations = [
        'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
      ];
      const randomImg = illustrations[Math.floor(Math.random() * illustrations.length)];

      const newSequel: StorySequel = {
        id: `sequel_${Date.now()}`,
        bookId: book.id,
        bookTitle: bookTitleStr,
        createdAt: new Date().toLocaleDateString('zh-TW', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
        ideaPrompt: promptText,
        sequelTitle,
        chapterText,
        englishText,
        illustrationUrl: randomImg,
        moralLesson,
        moodTag,
      };

      setGeneratedSequel(newSequel);
      setIsGenerating(false);
      playStarChime();
      onAwardStar(10);
    }, 1800);
  };

  const handleSaveSequelToStorage = (sequel: StorySequel) => {
    try {
      const updated = [sequel, ...savedSequels.filter((s) => s.id !== sequel.id)];
      setSavedSequels(updated);
      localStorage.setItem(`story_sequels_${book.id}`, JSON.stringify(updated));
      playStarChime();
      if (onSaveSequelSuccess) onSaveSequelSuccess(sequel);
    } catch {
      // ignore
    }
  };

  const handleSpeakText = (text: string) => {
    if (isSpeaking) {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(true);
    speakText(text, 'zh-TW', 0.95, 'mom', 1.0, () => setIsSpeaking(false));
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-fadeIn">
      <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col rounded-3xl bg-slate-900 border-2 border-purple-500/80 text-slate-100 shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-purple-500/30 bg-slate-900/90 z-10">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-tr from-purple-600 via-pink-600 to-amber-500 text-white font-black shadow-lg">
              <Wand2 className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-purple-500 text-white font-black text-[10px] shadow-xs">
                  ✨ AI 故事創意續寫引擎
                </span>
                <span className="text-[10px] font-bold text-purple-300">
                  《{bookTitleStr}》讀後延伸版本
                </span>
              </div>
              <h3 className="text-base sm:text-xl font-black text-purple-200">
                AI 故事續寫 (Story Extension Studio)
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tab Switcher */}
            <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700">
              <button
                type="button"
                onClick={() => setActiveTab('create')}
                className={`px-3 py-1 rounded-lg text-xs font-black cursor-pointer ${
                  activeTab === 'create' ? 'bg-purple-500 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                ✏️ 創作續集
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('history')}
                className={`px-3 py-1 rounded-lg text-xs font-black cursor-pointer ${
                  activeTab === 'history' ? 'bg-purple-500 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                📚 延伸章節庫 ({savedSequels.length})
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Main Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar">
          
          {activeTab === 'create' ? (
            <>
              {/* Inspiration Idea Presets */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-purple-300 flex items-center gap-1.5">
                    <Lightbulb className="w-4 h-4 text-amber-300" />
                    <span>給孩子的故事發想點子靈感罐（點擊套用）：</span>
                  </label>
                  <span className="text-[10px] font-bold text-amber-400 bg-amber-400/20 px-2 py-0.5 rounded-full border border-amber-400/30">
                    +10 ⭐ 星星獎勵
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {PRESET_IDEAS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setIdeaPrompt(preset);
                        playPageTurnSound();
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-purple-900/60 border border-purple-500/40 text-purple-200 text-xs font-bold transition-all hover:scale-105 text-left cursor-pointer"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Text Input Prompt */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-200 flex items-center justify-between">
                  <span>輸入你對《{bookTitleStr}》故事結局的創意設想：</span>
                  <span className="text-[10px] text-slate-400 font-normal">可以寫任何你天馬行空的想法！</span>
                </label>

                <textarea
                  value={ideaPrompt}
                  onChange={(e) => setIdeaPrompt(e.target.value)}
                  placeholder="例如：如果故事最後主角找到了一把能開啟彩虹之門的金鑰匙，大家會看到什麼美妙的景象呢？..."
                  rows={3}
                  className="w-full p-4 rounded-2xl bg-slate-800/90 border-2 border-purple-500/50 text-white text-xs sm:text-sm placeholder:text-slate-400 focus:outline-none focus:border-purple-400 font-medium"
                />

                <div className="flex items-center justify-between pt-1">
                  <div className="text-[11px] text-purple-300 font-bold flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>點擊下方按鈕，AI 將為你生成專屬繪畫插畫與新章節！</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleGenerateSequel}
                    disabled={isGenerating || !ideaPrompt.trim()}
                    className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:from-purple-500 hover:to-amber-400 text-white font-black text-xs sm:text-sm shadow-xl transition-all hover:scale-105 disabled:opacity-50 cursor-pointer flex items-center gap-2"
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>AI 魔法魔棒創作中...</span>
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-4 h-4 text-amber-300" />
                        <span>✨ 生成 AI 續寫章節與插畫</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Generated Result Display */}
              {generatedSequel && (
                <div className="p-5 rounded-3xl bg-slate-800/90 border-2 border-amber-400/80 shadow-2xl space-y-4 animate-fadeIn">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-amber-400/30 pb-3">
                    <div className="flex items-center gap-3">
                      <span className="p-2.5 rounded-2xl bg-amber-400 text-slate-950 font-black text-xl shadow-md">
                        📖
                      </span>
                      <div>
                        <span className="text-[10px] font-black bg-purple-500 text-white px-2 py-0.5 rounded-full">
                          {generatedSequel.moodTag}
                        </span>
                        <h4 className="font-black text-base sm:text-lg text-amber-200 mt-1">
                          {generatedSequel.sequelTitle}
                        </h4>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleSpeakText(`${generatedSequel.sequelTitle}。${generatedSequel.chapterText}`)}
                        className={`px-3 py-1.5 rounded-xl font-black text-xs flex items-center gap-1 cursor-pointer ${
                          isSpeaking ? 'bg-rose-500 text-white animate-pulse' : 'bg-slate-700 text-amber-300 hover:bg-slate-600'
                        }`}
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>{isSpeaking ? '朗讀中...' : '🔊 朗讀續章'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSaveSequelToStorage(generatedSequel)}
                        className="px-4 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center gap-1 shadow-md cursor-pointer"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>💾 儲存為讀後延伸版本</span>
                      </button>
                    </div>
                  </div>

                  {/* Sequel Image & Story Chapter Spread */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative rounded-2xl overflow-hidden border border-purple-400/40 shadow-md h-52 md:h-60">
                      <img
                        src={generatedSequel.illustrationUrl}
                        alt="Sequel Mini Illustration"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-xl bg-black/70 backdrop-blur-xs text-amber-300 font-bold text-[10px]">
                        🎨 AI 創意延伸迷你插圖
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-700 space-y-3 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="text-xs font-black text-purple-300">【新續集章節內容】</div>
                        <p className="text-xs sm:text-sm text-slate-100 font-medium leading-relaxed">
                          {generatedSequel.chapterText}
                        </p>
                        <p className="text-xs text-purple-200 italic font-medium leading-relaxed border-t border-slate-800 pt-2">
                          "{generatedSequel.englishText}"
                        </p>
                      </div>

                      <div className="p-2.5 rounded-xl bg-purple-950/60 border border-purple-500/30 text-[11px] font-bold text-amber-300">
                        {generatedSequel.moralLesson}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Saved Sequels Library Tab */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-black text-sm text-purple-300">
                  📚 《{bookTitleStr}》的所有延伸創作版本 ({savedSequels.length} 個篇章)
                </h4>
                <button
                  type="button"
                  onClick={() => setActiveTab('create')}
                  className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs cursor-pointer flex items-center gap-1"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>新增續集創作</span>
                </button>
              </div>

              {savedSequels.length > 0 ? (
                <div className="space-y-3">
                  {savedSequels.map((seq) => (
                    <div
                      key={seq.id}
                      className="p-4 rounded-2xl bg-slate-800/90 border border-purple-500/40 flex flex-col sm:flex-row gap-4 items-start"
                    >
                      <img
                        src={seq.illustrationUrl}
                        alt="Sequel"
                        className="w-full sm:w-28 h-28 rounded-xl object-cover shrink-0"
                      />
                      <div className="flex-1 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <h5 className="font-black text-sm text-amber-200">{seq.sequelTitle}</h5>
                          <span className="text-[10px] text-slate-400 font-bold">{seq.createdAt}</span>
                        </div>
                        <p className="text-xs text-slate-300 font-medium line-clamp-2">
                          {seq.chapterText}
                        </p>
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[10px] bg-purple-500/40 text-purple-200 px-2 py-0.5 rounded-full">
                            💡 創意點子: {seq.ideaPrompt}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleSpeakText(`${seq.sequelTitle}。${seq.chapterText}`)}
                            className="text-amber-300 hover:text-amber-200 text-xs font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                            <span>收聽</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 rounded-2xl bg-slate-800/50 border border-dashed border-slate-700 text-center text-xs text-slate-400 space-y-2">
                  <span className="text-3xl">✨</span>
                  <p>目前尚未儲存任何續集章節，快切換至「創作續集」發揮天馬行空的想像吧！</p>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-purple-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-purple-300 font-bold">
            <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
            <span>寫下你的創意延伸，開啟繪本無限多重宇宙！</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-purple-600 text-white font-black text-xs hover:bg-purple-500 cursor-pointer"
          >
            完成創作
          </button>
        </div>

      </div>
    </div>
  );
};
