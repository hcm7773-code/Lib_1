import React, { useState } from 'react';
import {
  Wand2, Sparkles, BookOpen, Heart, Palette, Layers, ArrowRight, CheckCircle2, RefreshCw, X, Lightbulb, Image as ImageIcon, Volume2
} from 'lucide-react';
import { Book } from '../types';
import { playStarChime, playPageTurnSound } from '../utils/audio';

interface AiBookCreationAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyGeneratedBook?: (book: Book) => void;
  darkMode?: boolean;
}

export const AiBookCreationAssistantModal: React.FC<AiBookCreationAssistantModalProps> = ({
  isOpen,
  onClose,
  onApplyGeneratedBook,
  darkMode = false,
}) => {
  const [topicInput, setTopicInput] = useState<string>('');
  const [characterNames, setCharacterNames] = useState<string>('小熊波波, 聰明貓頭鷹');
  const [ageGroup, setAgeGroup] = useState<'3-5' | '6-8' | '9-12'>('6-8');
  const [selectedStyle, setSelectedStyle] = useState<string>('水彩暖心童話風');
  const [moralCategory, setMoralCategory] = useState<string>('Adventure');
  const [loading, setLoading] = useState<boolean>(false);
  const [generatedBookResult, setGeneratedBookResult] = useState<Book | null>(null);

  if (!isOpen) return null;

  const presetIdeas = [
    '一隻勇敢的小熊搭乘星空熱氣球，幫小動物送達希望信件的故事。',
    '三隻小豬建立綠能太陽能花園，保護森林和小鳥家園。',
    '深海裡不會發光的小白鯨，如何運用歌聲帶大家找到彩虹珊瑚洞穴。',
    '一個害羞的小男孩在神秘圖書館發現會說話的古老字典。',
  ];

  const handleGenerateStory = async () => {
    if (!topicInput.trim()) return;

    setLoading(true);
    playPageTurnSound();

    try {
      const res = await fetch('/api/gemini/generate-book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: topicInput.trim(),
          ageGroup,
          artStyle: selectedStyle,
          category: moralCategory,
          characterNames,
          moralLesson: '勇氣、友情、善於傾聽與團隊合作',
        }),
      });

      if (res.ok) {
        const bookData: Book = await res.json();
        setGeneratedBookResult(bookData);
        playStarChime();
      } else {
        throw new Error('Failed to generate story');
      }
    } catch (e) {
      console.warn('Story generation error fallback', e);
      // Fallback Book
      const titleZh = `【AI 原創】${topicInput.slice(0, 10)}的故事`;
      const titleEn = `The Magical Journey of ${topicInput.slice(0, 10)}`;

      const fallbackBook: Book = {
        id: `custom_ai_book_${Date.now()}`,
        title: {
          'zh-TW': titleZh,
          en: titleEn,
          ja: titleEn,
          fr: titleEn,
          es: titleEn,
          de: titleEn,
          ko: titleEn,
          vi: titleEn,
        },
        author: '繪本創作 AI 助手 & 小作者',
        originCountry: '地球村',
        flag: '🌍',
        ageGroup,
        category: moralCategory as any,
        coverUrl: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?q=80&w=800',
        rating: 5.0,
        readCount: 1,
        isCustom: true,
        createdAt: new Date().toLocaleDateString('zh-TW'),
        summary: {
          'zh-TW': `這是一本關於 ${topicInput} 的溫馨冒險繪本，帶給孩童滿滿的勇氣與啟發。`,
          en: `A heartwarming picture book journey about ${topicInput}.`,
          ja: `A heartwarming picture book journey about ${topicInput}.`,
          fr: `A heartwarming picture book journey about ${topicInput}.`,
          es: `A heartwarming picture book journey about ${topicInput}.`,
          de: `A heartwarming picture book journey about ${topicInput}.`,
          ko: `A heartwarming picture book journey about ${topicInput}.`,
          vi: `A heartwarming picture book journey about ${topicInput}.`,
        },
        pages: [
          {
            pageNumber: 1,
            illustrationUrl: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?q=80&w=800',
            text: {
              'zh-TW': `在很久很久以前，${characterNames}居住在一片神奇的森林裡。今天，一個奇妙的冒險開始了！`,
              en: `Once upon a time, ${characterNames} lived in a magical forest. Today, a new journey begins!`,
              ja: `Once upon a time, ${characterNames} lived in a magical forest. Today, a new journey begins!`,
              fr: `Once upon a time, ${characterNames} lived in a magical forest. Today, a new journey begins!`,
              es: `Once upon a time, ${characterNames} lived in a magical forest. Today, a new journey begins!`,
              de: `Once upon a time, ${characterNames} lived in a magical forest. Today, a new journey begins!`,
              ko: `Once upon a time, ${characterNames} lived in a magical forest. Today, a new journey begins!`,
              vi: `Once upon a time, ${characterNames} lived in a magical forest. Today, a new journey begins!`,
            },
            vocab: [
              { word: '神奇', phonetic: 'shén qí', translation: 'Magical', definition: '非常奇妙而且讓人驚喜的事情' },
            ],
            interactivePrompt: '你覺得主角今天第一步想去哪裡探險呢？',
          },
          {
            pageNumber: 2,
            illustrationUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800',
            text: {
              'zh-TW': `旅途中遇到了小小的難關，但只要大夥兒團結合作、互相鼓勵，任何考驗都能順利解決！`,
              en: `They encountered a small obstacle, but with teamwork and courage, they overcame it!`,
              ja: `They encountered a small obstacle, but with teamwork and courage, they overcame it!`,
              fr: `They encountered a small obstacle, but with teamwork and courage, they overcame it!`,
              es: `They encountered a small obstacle, but with teamwork and courage, they overcame it!`,
              de: `They encountered a small obstacle, but with teamwork and courage, they overcame it!`,
              ko: `They encountered a small obstacle, but with teamwork and courage, they overcame it!`,
              vi: `They encountered a small obstacle, but with teamwork and courage, they overcame it!`,
            },
            vocab: [
              { word: '團結', phonetic: 'tuán jié', translation: 'Teamwork', definition: '大家同心協力一起完成事情' },
            ],
            interactivePrompt: '如果你在現場，你會如何幫主角加油打氣？',
          },
        ],
      };
      setGeneratedBookResult(fallbackBook);
      playStarChime();
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (generatedBookResult && onApplyGeneratedBook) {
      onApplyGeneratedBook(generatedBookResult);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-fadeIn overflow-y-auto">
      <div className={`w-full max-w-3xl max-h-[92vh] overflow-y-auto p-5 sm:p-7 rounded-3xl border shadow-2xl space-y-6 relative ${
        darkMode
          ? 'bg-slate-900 border-amber-400/60 text-slate-100'
          : 'bg-white border-amber-300 text-amber-950'
      }`}>
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-amber-200/80 pb-4 flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-tr from-rose-500 via-amber-500 to-yellow-400 text-slate-950 shadow-md">
              <Wand2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-rose-500 text-white font-black text-[10px]">
                  AI 繪本創作出發助手
                </span>
                <span className="text-xs font-bold text-amber-600 dark:text-amber-300">
                  Picture Book Creator Assistant
                </span>
              </div>
              <h3 className="text-xl font-black tracking-wide">
                繪本創作 AI 助手 (Story Workshop)
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-2xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="space-y-5">
          {/* Preset Ideas Selector */}
          <div className="space-y-2">
            <label className="text-xs font-black text-amber-950 dark:text-amber-200 flex items-center gap-1">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <span>點擊快速載入 AI 故事靈感點子：</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {presetIdeas.map((idea, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setTopicInput(idea);
                    playStarChime();
                  }}
                  className="p-2.5 rounded-xl bg-amber-50 dark:bg-slate-800 border border-amber-200/80 hover:border-amber-400 text-left text-xs font-bold text-slate-800 dark:text-slate-200 transition-all hover:scale-[1.01] cursor-pointer"
                >
                  💡 {idea}
                </button>
              ))}
            </div>
          </div>

          {/* Topic Prompt Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-amber-950 dark:text-amber-200 flex items-center gap-1">
              <BookOpen className="w-4 h-4 text-rose-500" />
              <span>輸入繪本故事核心靈感或大綱主題：</span>
            </label>
            <textarea
              rows={3}
              placeholder="例如：小熊與小企鵝搭乘彩虹潛水艇去海底尋找失落的音符石..."
              value={topicInput}
              onChange={(e) => setTopicInput(e.target.value)}
              className="w-full p-3 rounded-2xl bg-amber-50/50 dark:bg-slate-800 border border-amber-300 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          {/* Character & Art Style Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-amber-950 dark:text-amber-200">
                主角姓名與登場角色：
              </label>
              <input
                type="text"
                value={characterNames}
                onChange={(e) => setCharacterNames(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-amber-50/50 dark:bg-slate-800 border border-amber-300 text-xs font-bold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black text-amber-950 dark:text-amber-200 flex items-center gap-1">
                <Palette className="w-3.5 h-3.5 text-amber-600" />
                <span>插畫視覺風格：</span>
              </label>
              <select
                value={selectedStyle}
                onChange={(e) => setSelectedStyle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-amber-50/50 dark:bg-slate-800 border border-amber-300 text-xs font-bold"
              >
                <option value="水彩暖心童話風">🎨 水彩暖心童話風</option>
                <option value="蠟筆手繪童趣風">🖍️ 蠟筆手繪童趣風</option>
                <option value="3D立體黏土動畫風">🧸 3D 立體黏土動畫風</option>
                <option value="夢幻星空剪紙風">🌌 夢幻星空剪紙風</option>
              </select>
            </div>
          </div>

          {/* Generate Button */}
          <button
            type="button"
            onClick={handleGenerateStory}
            disabled={loading || !topicInput.trim()}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 via-amber-500 to-yellow-400 hover:from-rose-600 hover:to-amber-600 text-slate-950 font-black text-sm shadow-xl flex items-center justify-center gap-2 cursor-pointer transition-transform hover:scale-[1.01] disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>AI 創作者正在為您編寫繪本全書劇本...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-5 h-5" />
                <span>一鍵生成完整繪本劇本與雙語插畫 🪄</span>
              </>
            )}
          </button>

          {/* Generated Result Preview */}
          {generatedBookResult && (
            <div className="p-4 rounded-2xl bg-amber-100/80 dark:bg-slate-800/90 border-2 border-amber-400 space-y-4 animate-scaleUp">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">📚</span>
                  <div>
                    <h4 className="font-black text-sm text-amber-950 dark:text-amber-200">
                      {generatedBookResult.title['zh-TW']}
                    </h4>
                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                      包含 {generatedBookResult.pages.length} 頁圖文劇本 & 雙語生字詞彙
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500 text-slate-950 font-black text-[10px]">
                  生成完畢！
                </span>
              </div>

              <p className="text-xs font-bold text-slate-700 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-900 p-3 rounded-xl border border-amber-200">
                {generatedBookResult.summary['zh-TW']}
              </p>

              <button
                type="button"
                onClick={handleApply}
                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer transition-transform hover:scale-105"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>直接將生成的 AI 繪本發佈並進入閱讀！</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
