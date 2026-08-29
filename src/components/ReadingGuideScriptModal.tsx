import React, { useState, useEffect } from 'react';
import {
  Sparkles, Volume2, VolumeX, RefreshCw, X, MessageCircle, Heart,
  Lightbulb, Compass, Users, Check, Copy, BookOpen, Star, HelpCircle,
  Puzzle, Palette, BookmarkCheck
} from 'lucide-react';
import { Book } from '../types';
import { speakText, stopAllAudio, playStarChime, playPageTurnSound } from '../utils/audio';

interface ReadingGuideScriptModalProps {
  book: Book;
  isOpen: boolean;
  onClose: () => void;
}

interface ReadingGuideScriptData {
  bookTitle: string;
  openingScript: {
    headline: string;
    hookQuestion: string;
    speechText: string;
  };
  checkpointPrompts: Array<{
    stage: string;
    guidance: string;
    suggestedQuestion: string;
  }>;
  closingDiscussion: {
    summaryTakeaway: string;
    deepQuestions: Array<{
      type: string;
      question: string;
      guidanceHint: string;
    }>;
    extensionActivity: {
      title: string;
      description: string;
    };
  };
  parentTips: string[];
}

export const ReadingGuideScriptModal: React.FC<ReadingGuideScriptModalProps> = ({
  book,
  isOpen,
  onClose,
}) => {
  const [guideData, setGuideData] = useState<ReadingGuideScriptData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'opening' | 'checkpoints' | 'closing' | 'tips'>('opening');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);

  const bookTitle = typeof book.title === 'string' ? book.title : (book.title['zh-TW'] || book.title.en || '繪本');
  const fullText = book.pages.map((p) => p.text['zh-TW'] || p.text.en || '').join('\n');
  const summaryText = book.summary?.['zh-TW'] || book.summary?.en || '';

  const fetchGuideScript = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/gemini/reading-guide-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookTitle,
          category: book.category,
          summary: summaryText,
          fullStoryText: fullText,
          targetAgeGroup: '3-8歲',
        }),
      });

      if (!res.ok) throw new Error('API failed');
      const data = await res.json();
      setGuideData(data);
    } catch (err) {
      console.warn('Failed to fetch AI guide script, using dynamic fallback', err);
      setGuideData({
        bookTitle,
        openingScript: {
          headline: '🌟 翻開魔法扉頁前的悄悄話',
          hookQuestion: '你看！封面上的主角正要去哪裡？如果是你，最期待在故事裡發現什麼？',
          speechText: `親愛的小探險家，今天我們要一起進入《${bookTitle}》的精彩世界囉！在故事裡，有許多意想不到的驚喜和溫暖的時刻正在等待著我們。準備好你的好奇心眼睛和豎起小耳朵，我們一起出發吧！`,
        },
        checkpointPrompts: [
          {
            stage: '故事前半段（冒險起點）',
            guidance: '引導孩子觀察角色的表情與出發時的心情，建立探索期待。',
            suggestedQuestion: '你猜猜主角現在心情是緊張還是興奮？從哪裡看出來的？',
          },
          {
            stage: '故事轉折處（面對難關）',
            guidance: '當主角面臨挑戰時暫停幾秒，邀請孩子化身小智囊一起想辦法。',
            suggestedQuestion: '如果是你，這時候會用什麼好點子來解決這個難題呢？',
          },
        ],
        closingDiscussion: {
          summaryTakeaway: `《${bookTitle}》告訴我們：無論遇到多大的風浪或未知的挑戰，只要懷抱勇氣、真誠與愛，我們總能發現生活中最美好的奇蹟！`,
          deepQuestions: [
            {
              type: '情節理解',
              question: '在整個故事裡，主角最勇敢或最聰明的是哪一個時刻？',
              guidanceHint: '幫助孩子回顧故事情節脈絡與因果關係。',
            },
            {
              type: '情感共鳴',
              question: '當主角最後達成目標時，你心裡的感覺是什麼呢？',
              guidanceHint: '引導孩子表達內心真實情感，建立同理與共情能力。',
            },
            {
              type: '生活連結',
              question: '在日常生活中，如果我們也遇到了類似的挑戰，可以怎麼做呢？',
              guidanceHint: '將繪本寓意轉化為生活中的正向行動力與品格力量。',
            },
          ],
          extensionActivity: {
            title: '🎨 親子共讀延伸：小小角色劇場與心願畫布',
            description: '和爸爸媽媽一起模仿故事裡最喜歡的角色講一句話，或者在一張白紙上畫出你想像中主角接下來的下一場大冒險！',
          },
        },
        parentTips: [
          '伴讀時可以用生動豐富的聲調模仿不同角色，吸引孩子的專注力。',
          '共讀沒有標準答案，當孩子提出天馬行空的想像時，多給予肯定與好奇的追問。',
          '讀完後給孩子一個溫暖的擁抱，讓閱讀的幸福感深深烙印在記憶中。',
        ],
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && !guideData) {
      fetchGuideScript();
    }
  }, [isOpen, book.id]);

  if (!isOpen) return null;

  const handlePlayOpeningSpeech = () => {
    if (isPlayingAudio) {
      stopAllAudio();
      setIsPlayingAudio(false);
      return;
    }

    if (guideData?.openingScript?.speechText) {
      playStarChime();
      setIsPlayingAudio(true);
      const textToRead = `${guideData.openingScript.headline}。${guideData.openingScript.hookQuestion}。${guideData.openingScript.speechText}`;
      speakText(textToRead, 'zh-TW', 0.95);

      setTimeout(() => {
        setIsPlayingAudio(false);
      }, 12000);
    }
  };

  const handleCopyFullScript = () => {
    if (!guideData) return;
    playStarChime();

    const fullScript = `📖 《${guideData.bookTitle}》繪本導讀腳本\n\n` +
      `【開場導讀白】\n${guideData.openingScript.headline}\n破冰提問：${guideData.openingScript.hookQuestion}\n導讀語：${guideData.openingScript.speechText}\n\n` +
      `【伴讀引導流程】\n` +
      guideData.checkpointPrompts.map((cp) => `• ${cp.stage}：${cp.guidance}\n  建議提問：${cp.suggestedQuestion}`).join('\n') +
      `\n\n【結尾深度共讀討論】\n結尾總結：${guideData.closingDiscussion.summaryTakeaway}\n` +
      guideData.closingDiscussion.deepQuestions.map((q) => `• [${q.type}] ${q.question} (${q.guidanceHint})`).join('\n') +
      `\n\n【親子延伸活動】\n${guideData.closingDiscussion.extensionActivity.title}\n${guideData.closingDiscussion.extensionActivity.description}\n\n` +
      `【家長伴讀心法】\n` +
      guideData.parentTips.map((t, idx) => `${idx + 1}. ${t}`).join('\n');

    navigator.clipboard.writeText(fullScript);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2500);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn"
      id="modal-reading-guide-script"
    >
      <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-3xl border-2 border-amber-300 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-purple-600 p-5 text-white flex items-center justify-between shadow-md shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-2xl shadow-inner">
              🎙️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-lg sm:text-xl text-white">
                  繪本導讀腳本 (AI Co-Reading Guide)
                </h3>
                <span className="bg-white/30 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full backdrop-blur-xs">
                  Gemini API 深度分析
                </span>
              </div>
              <p className="text-xs text-white/90 font-bold mt-0.5">
                《{bookTitle}》專屬啟發開場白、伴讀互動提問與結尾深度討論
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchGuideScript}
              disabled={isLoading}
              className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer disabled:opacity-50"
              title="重新透過 Gemini 生成導讀腳本"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            <button
              type="button"
              onClick={() => {
                stopAllAudio();
                onClose();
              }}
              className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-amber-200 dark:border-slate-800 bg-amber-50/60 dark:bg-slate-800/60 px-4 pt-2 gap-2 overflow-x-auto shrink-0">
          <button
            type="button"
            onClick={() => {
              playPageTurnSound();
              setActiveTab('opening');
            }}
            className={`px-4 py-2.5 rounded-t-2xl font-black text-xs sm:text-sm flex items-center gap-2 border-t border-x transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'opening'
                ? 'bg-white dark:bg-slate-900 border-amber-300 text-amber-950 dark:text-amber-300 shadow-xs'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>🌟 啟發開場白</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playPageTurnSound();
              setActiveTab('checkpoints');
            }}
            className={`px-4 py-2.5 rounded-t-2xl font-black text-xs sm:text-sm flex items-center gap-2 border-t border-x transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'checkpoints'
                ? 'bg-white dark:bg-slate-900 border-amber-300 text-amber-950 dark:text-amber-300 shadow-xs'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Compass className="w-4 h-4 text-orange-500" />
            <span>📖 伴讀引導流程</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playPageTurnSound();
              setActiveTab('closing');
            }}
            className={`px-4 py-2.5 rounded-t-2xl font-black text-xs sm:text-sm flex items-center gap-2 border-t border-x transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'closing'
                ? 'bg-white dark:bg-slate-900 border-amber-300 text-amber-950 dark:text-amber-300 shadow-xs'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <MessageCircle className="w-4 h-4 text-purple-500" />
            <span>💬 深度結尾討論</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playPageTurnSound();
              setActiveTab('tips');
            }}
            className={`px-4 py-2.5 rounded-t-2xl font-black text-xs sm:text-sm flex items-center gap-2 border-t border-x transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'tips'
                ? 'bg-white dark:bg-slate-900 border-amber-300 text-amber-950 dark:text-amber-300 shadow-xs'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Heart className="w-4 h-4 text-rose-500" />
            <span>👨‍👩‍👧 家長伴讀心法</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800 dark:text-slate-200">
          {isLoading ? (
            <div className="py-16 text-center space-y-4">
              <RefreshCw className="w-10 h-10 text-amber-500 animate-spin mx-auto" />
              <div className="font-black text-base text-amber-950 dark:text-amber-300">
                Gemini 正在為《{bookTitle}》精心設計專屬共讀導讀腳本...
              </div>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                分析故事內核、提煉啟發開場白、設計三段式深度共讀提問與親子延伸微活動
              </p>
            </div>
          ) : guideData ? (
            <>
              {/* TAB 1: OPENING SCRIPT */}
              {activeTab === 'opening' && (
                <div className="space-y-5 animate-fadeIn">
                  <div className="p-5 rounded-3xl bg-gradient-to-br from-amber-50 via-orange-50/60 to-yellow-50 dark:from-slate-800 dark:to-slate-800/60 border-2 border-amber-300 shadow-sm space-y-4">
                    
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">✨</span>
                        <h4 className="font-black text-base text-amber-950 dark:text-amber-300">
                          {guideData.openingScript.headline}
                        </h4>
                      </div>

                      <button
                        type="button"
                        onClick={handlePlayOpeningSpeech}
                        className={`px-4 py-2 rounded-2xl font-black text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer ${
                          isPlayingAudio
                            ? 'bg-rose-500 text-white animate-pulse'
                            : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white hover:scale-105'
                        }`}
                      >
                        {isPlayingAudio ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                        <span>{isPlayingAudio ? '停止朗讀' : '🔊 語音朗讀開場白'}</span>
                      </button>
                    </div>

                    {/* Hook Question */}
                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-slate-700 space-y-1">
                      <div className="text-xs font-black text-orange-600 dark:text-orange-400 flex items-center gap-1.5">
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>翻頁前破冰提問（激發好奇心）：</span>
                      </div>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                        {guideData.openingScript.hookQuestion}
                      </p>
                    </div>

                    {/* Speech Text */}
                    <div className="p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-500/5 border border-amber-300/80 space-y-2">
                      <div className="text-xs font-black text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                        <BookmarkCheck className="w-3.5 h-3.5 text-amber-600" />
                        <span>建議家長朗讀腳本（開場白）：</span>
                      </div>
                      <p className="text-sm sm:text-base font-medium leading-relaxed text-amber-950 dark:text-slate-100">
                        「{guideData.openingScript.speechText}」
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: CHECKPOINTS */}
              {activeTab === 'checkpoints' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="text-xs font-bold text-slate-600 dark:text-slate-400">
                    在閱讀過程中適時停頓，能幫助孩子訓練視覺觀察力、預測劇情與同理心：
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {guideData.checkpointPrompts.map((cp, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-white dark:bg-slate-800 border-2 border-orange-200 dark:border-slate-700 space-y-2 shadow-2xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-orange-500 text-white font-black text-xs flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <h5 className="font-black text-sm text-slate-900 dark:text-slate-100">
                            {cp.stage}
                          </h5>
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-300">
                          {cp.guidance}
                        </p>

                        <div className="p-2.5 rounded-xl bg-orange-50 dark:bg-slate-900 border border-orange-200 dark:border-slate-700 text-xs font-bold text-orange-950 dark:text-orange-300">
                          💬 提問範例：「{cp.suggestedQuestion}」
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: CLOSING & DEEP QUESTIONS */}
              {activeTab === 'closing' && (
                <div className="space-y-5 animate-fadeIn">
                  {/* Summary Takeaway */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-500/15 via-indigo-500/10 to-pink-500/15 border-2 border-purple-300 space-y-1.5">
                    <div className="text-xs font-black text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                      <Star className="w-3.5 h-3.5 text-purple-600 fill-purple-600" />
                      <span>故事結尾主題提煉</span>
                    </div>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-relaxed">
                      {guideData.closingDiscussion.summaryTakeaway}
                    </p>
                  </div>

                  {/* 3 Deep Questions */}
                  <div className="space-y-3">
                    <h5 className="font-black text-xs text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <MessageCircle className="w-4 h-4 text-purple-600" />
                      <span>三段式深度共讀提問（幫助孩子思考與生活連結）：</span>
                    </h5>

                    <div className="grid grid-cols-1 gap-3">
                      {guideData.closingDiscussion.deepQuestions.map((q, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-purple-200 dark:border-slate-700 flex items-start gap-3 shadow-2xs"
                        >
                          <span className="px-2.5 py-1 rounded-xl bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 font-black text-xs shrink-0">
                            {q.type}
                          </span>
                          <div className="space-y-1 min-w-0">
                            <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                              {q.question}
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                              💡 引導心法：{q.guidanceHint}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Extension Activity */}
                  <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-slate-800/80 border-2 border-emerald-300 space-y-1.5">
                    <div className="text-xs font-black text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                      <Palette className="w-4 h-4 text-emerald-600" />
                      <span>{guideData.closingDiscussion.extensionActivity.title}</span>
                    </div>
                    <p className="text-xs font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
                      {guideData.closingDiscussion.extensionActivity.description}
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 4: PARENT TIPS */}
              {activeTab === 'tips' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="grid grid-cols-1 gap-3">
                    {guideData.parentTips.map((tip, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-rose-50/70 dark:bg-slate-800 border border-rose-200 dark:border-slate-700 flex items-start gap-3"
                      >
                        <div className="w-7 h-7 rounded-xl bg-rose-500 text-white font-black text-xs flex items-center justify-center shrink-0">
                          {idx + 1}
                        </div>
                        <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 leading-relaxed">
                          {tip}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-amber-50/80 dark:bg-slate-800 border-t border-amber-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500 font-medium">
            💡 提示：導讀腳本可隨時語音朗讀或複製留存，讓親子共讀時光充滿樂趣與啟發。
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handleCopyFullScript}
              className="px-4 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
            >
              {hasCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{hasCopied ? '已複製完整導讀腳本' : '複製腳本文字'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                stopAllAudio();
                onClose();
              }}
              className="px-5 py-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs shadow-md transition-all hover:scale-105 cursor-pointer"
            >
              開啟共讀旅程 ✨
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
