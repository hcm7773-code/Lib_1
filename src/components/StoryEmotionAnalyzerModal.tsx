import React, { useState, useEffect } from 'react';
import { Smile, Sparkles, Volume2, X, Compass, HelpCircle, ChevronRight, Activity } from 'lucide-react';
import { analyzeSentencesEmotion, analyzeEmotionForText, SentenceEmotionItem } from '../utils/emotionAnalyzer';
import { speakText } from '../utils/audio';
import { getLanguageByCode } from '../data/languages';
import { LanguageCode, VoiceRole } from '../types';

interface StoryEmotionAnalyzerModalProps {
  isOpen: boolean;
  onClose: () => void;
  pageText: string;
  primaryLang: LanguageCode;
  voiceRole?: VoiceRole;
  darkMode?: boolean;
}

export const StoryEmotionAnalyzerModal: React.FC<StoryEmotionAnalyzerModalProps> = ({
  isOpen,
  onClose,
  pageText,
  primaryLang,
  voiceRole = 'mom',
  darkMode = false,
}) => {
  const [sentences, setSentences] = useState<SentenceEmotionItem[]>([]);
  const [playingIdx, setPlayingIdx] = useState<number | null>(null);

  useEffect(() => {
    if (pageText) {
      setSentences(analyzeSentencesEmotion(pageText));
    }
  }, [pageText]);

  if (!isOpen) return null;

  const handlePlaySentence = (sentence: string, idx: number) => {
    setPlayingIdx(idx);
    const lang = getLanguageByCode(primaryLang);
    speakText(
      sentence,
      lang.speechCode,
      1.0,
      (voiceRole || 'mom') as VoiceRole,
      1.0,
      () => setPlayingIdx(null)
    );
  };

  const pageMainEmotion = analyzeEmotionForText(pageText);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div
        className={`relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-3xl shadow-2xl border transition-all ${
          darkMode
            ? 'bg-slate-900 border-slate-700 text-slate-100'
            : 'bg-gradient-to-br from-amber-50 via-orange-50/50 to-white border-amber-200 text-amber-950'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-amber-200/50 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg sm:text-xl tracking-tight">AI 繪本語音情緒分析儀</h3>
              <p className="text-xs opacity-80">即時辨識情節情感，自動變頻演繹高低音調</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-full transition-colors ${
              darkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-amber-100 text-amber-800'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1 custom-scrollbar">
          {/* Current Page Overall Emotion Banner */}
          <div className={`p-4 rounded-2xl border flex items-center gap-4 ${pageMainEmotion.bgColor} ${pageMainEmotion.borderColor}`}>
            <div className="text-3xl sm:text-4xl shrink-0 p-2 rounded-2xl bg-white/80 dark:bg-slate-900/80 shadow-xs">
              {pageMainEmotion.icon}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-white/90 dark:bg-slate-900/90 shadow-2xs">
                  頁面主導情感：{pageMainEmotion.label}
                </span>
                <span className="text-[11px] font-bold text-orange-600 dark:text-orange-400">
                  語調變頻：{Math.round(pageMainEmotion.pitchModifier * 100)}%
                </span>
              </div>
              <p className="text-xs font-bold opacity-90 leading-relaxed">
                {pageMainEmotion.explanation}
              </p>
            </div>
          </div>

          {/* Sentence by Sentence Breakdown */}
          <div className="space-y-3">
            <h4 className="text-xs font-black tracking-wider uppercase opacity-80 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              逐句情緒辨識與演繹試聽 ({sentences.length} 句)
            </h4>

            <div className="space-y-2.5">
              {sentences.map((item, idx) => {
                const em = item.emotionResult;
                const isPlayingThis = playingIdx === idx;

                return (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                      isPlayingThis
                        ? 'ring-2 ring-orange-500 bg-orange-100/50 dark:bg-slate-800'
                        : darkMode
                        ? 'bg-slate-800/80 border-slate-700 hover:bg-slate-800'
                        : 'bg-white border-amber-200/80 hover:bg-amber-50/80 shadow-2xs'
                    }`}
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs font-black px-2 py-0.5 rounded-lg border flex items-center gap-1 ${em.bgColor} ${em.borderColor} ${em.color}`}>
                          <span>{em.icon}</span>
                          <span>{em.label}</span>
                        </span>
                        <span className="text-[10px] font-bold opacity-75">
                          語速 {Math.round(em.rateModifier * 100)}% • 音高 {Math.round(em.pitchModifier * 100)}%
                        </span>
                      </div>

                      <p className="text-xs sm:text-sm font-bold leading-relaxed">
                        「{item.sentence}」
                      </p>
                    </div>

                    <button
                      onClick={() => handlePlaySentence(item.sentence, idx)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 shrink-0 transition-transform active:scale-95 ${
                        isPlayingThis
                          ? 'bg-orange-500 text-white animate-pulse'
                          : 'bg-amber-500 hover:bg-amber-600 text-white shadow-2xs'
                      }`}
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>{isPlayingThis ? '正在朗讀...' : '情感試聽'}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-amber-200/50 dark:border-slate-800 text-center">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs sm:text-sm shadow-sm"
          >
            完成情緒分析查看
          </button>
        </div>
      </div>
    </div>
  );
};
