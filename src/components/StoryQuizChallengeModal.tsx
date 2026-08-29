import React, { useState, useEffect } from 'react';
import {
  Trophy, Star, Sparkles, CheckCircle2, XCircle, HelpCircle,
  ArrowRight, RotateCcw, Share2, Award, Crown, Check, X, Shield, Gift
} from 'lucide-react';
import { Book, UserProfile, AvatarFrame, DigitalSticker, QuizQuestion } from '../types';
import { BOOK_QUIZ_PRESETS, DEFAULT_AVATAR_FRAMES, DEFAULT_DIGITAL_STICKERS } from '../data/rewardItems';
import { playStarChime, playPageTurnSound, speakText } from '../utils/audio';

interface StoryQuizChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: Book;
  profile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  onTriggerCelebration?: () => void;
}

export const StoryQuizChallengeModal: React.FC<StoryQuizChallengeModalProps> = ({
  isOpen,
  onClose,
  book,
  profile,
  onUpdateProfile,
  onTriggerCelebration,
}) => {
  const [quizMode, setQuizMode] = useState<'choice' | 'matching'>('choice');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [score, setScore] = useState(0);
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);
  const [isEquippedFrame, setIsEquippedFrame] = useState(false);

  // Matching game state (連連看)
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);
  const [matchingError, setMatchingError] = useState<string | null>(null);

  // Matching game items generated from book vocabulary or story elements
  const matchingItems = [
    { word: book.title['zh-TW'] || book.title.en, target: `📖 ${book.title['zh-TW'] || book.title.en} 繪本故事`, matchId: 'm1' },
    { word: book.originCountry || '繪本王國', target: `${book.flag} ${book.originCountry || '經典源頭'}`, matchId: 'm2' },
    { word: '主角勇敢特質', target: '🌟 勇於面對考驗並愛護朋友', matchId: 'm3' },
    { word: '閱讀獲得獎勵', target: '⭐ 童星積木與限定成就頭框', matchId: 'm4' },
  ];

  // Load Preset or Fallback Quiz Level
  const quizPreset = BOOK_QUIZ_PRESETS[book.id] || {
    rewardStars: 15,
    rewardFrame: {
      id: `frame-${book.id}`,
      name: `✨ 《${book.title['zh-TW'] || book.title.en}》智慧金框`,
      icon: '👑',
      borderClass: 'border-amber-400 border-4',
      glowClass: 'shadow-[0_0_20px_rgba(251,191,36,0.8)] ring-2 ring-indigo-400 animate-pulse',
      unlocked: true,
      earnedFromBook: book.title['zh-TW'] || book.title.en,
    },
    rewardSticker: {
      id: `sticker-${book.id}`,
      name: `🌟 《${book.title['zh-TW'] || book.title.en} className章`,
      emoji: '🌟',
      category: '繪本闖關',
      unlocked: true,
      earnedFromBook: book.title['zh-TW'] || book.title.en,
    },
    questions: [
      {
        id: 'generic-q1',
        question: `在《${book.title['zh-TW'] || book.title.en}》這個故事中，主角最想要傳達的核心態度是什麼？`,
        options: ['勇敢面對困難與關懷他人', '天天懶惰不讀書', '把別人的東西藏起來', '不跟朋友說話'],
        correctOptionIndex: 0,
        explanation: '繪本故事鼓勵孩子抱持善良、勇氣與感恩的心態度過每一個時刻！',
      },
      {
        id: 'generic-q2',
        question: '讀完這本繪本後，你最深刻的學習收穫是什麼？',
        options: ['只要腳踏實地努力就能成長茁壯', '只要生氣就能解決事情', '不用聽爸爸媽媽說話', '放棄探索新世界'],
        correctOptionIndex: 0,
        explanation: '一步一腳印地吸收知識，能夠讓我們獲得最珍貴的童心智慧！',
      },
      {
        id: 'generic-q3',
        question: `這本繪本源自哪一個美麗國家或文化的童話遺產？`,
        options: [`${book.originCountry} (${book.flag})`, '神秘火星王國', '深海水晶宮殿', '雪人國家'],
        correctOptionIndex: 0,
        explanation: `這本繪本源自於 ${book.originCountry} ${book.flag}，帶給全人類童心靈感！`,
      },
    ],
  };

  const questions = quizPreset.questions;
  const currentQ = questions[currentQuestionIndex];

  useEffect(() => {
    if (isOpen) {
      setCurrentQuestionIndex(0);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
      setShowHint(false);
      setScore(0);
      setIsQuizCompleted(false);
      setIsEquippedFrame(false);
    }
  }, [isOpen, book.id]);

  if (!isOpen) return null;

  const handleSelectOption = (idx: number) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(idx);
    playPageTurnSound();
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null) return;
    setIsAnswerSubmitted(true);

    const isCorrect = selectedOption === currentQ.correctOptionIndex;
    if (isCorrect) {
      setScore((prev) => prev + 1);
      playStarChime();
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
      setShowHint(false);
      playPageTurnSound();
    } else {
      // Quiz Finished!
      setIsQuizCompleted(true);
      playStarChime();
      if (onTriggerCelebration) onTriggerCelebration();

      // Grant rewards to profile
      const newRewardFrame = quizPreset.rewardFrame;
      const newRewardSticker = quizPreset.rewardSticker;

      const existingFrames = profile.unlockedAvatarFrames || DEFAULT_AVATAR_FRAMES;
      const updatedFrames = existingFrames.some((f) => f.id === newRewardFrame.id)
        ? existingFrames.map((f) => (f.id === newRewardFrame.id ? { ...f, unlocked: true } : f))
        : [...existingFrames, { ...newRewardFrame, unlocked: true }];

      const existingStickers = profile.unlockedStickers || DEFAULT_DIGITAL_STICKERS;
      const updatedStickers = existingStickers.some((s) => s.id === newRewardSticker.id)
        ? existingStickers.map((s) => (s.id === newRewardSticker.id ? { ...s, unlocked: true } : s))
        : [...existingStickers, { ...newRewardSticker, unlocked: true }];

      const quizPassedBookIds = profile.quizPassedBookIds || [];
      const updatedQuizPassed = Array.from(new Set([...quizPassedBookIds, book.id]));

      onUpdateProfile({
        ...profile,
        stars: profile.stars + quizPreset.rewardStars,
        unlockedAvatarFrames: updatedFrames,
        unlockedStickers: updatedStickers,
        quizPassedBookIds: updatedQuizPassed,
      });
    }
  };

  const handleEquipFrame = () => {
    const frameId = quizPreset.rewardFrame.id;
    onUpdateProfile({
      ...profile,
      activeAvatarFrameId: frameId,
    });
    setIsEquippedFrame(true);
    playStarChime();
  };

  const handlePairClick = (type: 'word' | 'target', value: string, matchId: string) => {
    if (type === 'word') {
      setSelectedWord(matchId);
      setMatchingError(null);
      playPageTurnSound();
    } else {
      if (!selectedWord) {
        setMatchingError('請先點擊左側的題目項目！');
        return;
      }
      if (selectedWord === matchId) {
        const updated = [...matchedPairs, matchId];
        setMatchedPairs(updated);
        setSelectedWord(null);
        setMatchingError(null);
        playStarChime();
        if (updated.length === matchingItems.length) {
          setScore(matchingItems.length);
          setTimeout(() => {
            handleNextQuestion();
          }, 800);
        }
      } else {
        setMatchingError('❌ 連配不正確，再試試看喔！');
        setSelectedWord(null);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-fadeIn">
      <div className="bg-slate-900 border-2 border-amber-400/80 rounded-3xl max-w-xl w-full p-5 sm:p-7 text-white shadow-2xl relative space-y-6 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-amber-400/30 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="text-3xl animate-bounce">🏆</span>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full">
                  閱讀理解挑戰 Mode
                </span>
                <span className="text-[10px] font-bold text-amber-200">
                  {book.originCountry} {book.flag}
                </span>
              </div>
              <h3 className="text-lg font-black text-amber-300 line-clamp-1">
                《{book.title['zh-TW'] || book.title.en}》闖關小遊戲
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Quiz / Matching Game Type Tabs */}
        {!isQuizCompleted && (
          <div className="flex items-center justify-center gap-2 p-1.5 bg-slate-800 rounded-2xl border border-amber-400/30">
            <button
              type="button"
              onClick={() => { setQuizMode('choice'); playPageTurnSound(); }}
              className={`flex-1 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                quizMode === 'choice'
                  ? 'bg-amber-400 text-slate-950 shadow-md scale-102'
                  : 'text-slate-300 hover:bg-slate-700'
              }`}
            >
              📝 選擇題閱讀理解測驗
            </button>
            <button
              type="button"
              onClick={() => { setQuizMode('matching'); playPageTurnSound(); }}
              className={`flex-1 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                quizMode === 'matching'
                  ? 'bg-amber-400 text-slate-950 shadow-md scale-102'
                  : 'text-slate-300 hover:bg-slate-700'
              }`}
            >
              🧩 生字圖文連連看遊戲
            </button>
          </div>
        )}

        {!isQuizCompleted ? (
          quizMode === 'matching' ? (
            /* Matching Game View */
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-800/90 border border-amber-400/40 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-sm text-amber-300 flex items-center gap-1.5">
                    <span>🧩 繪本連連看配對小遊戲</span>
                  </h4>
                  <span className="text-xs font-black bg-amber-500/20 px-2.5 py-0.5 rounded-full border border-amber-400/40 text-amber-200">
                    已配對 {matchedPairs.length} / {matchingItems.length} 組
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  請先點擊左邊欄位的繪本名詞，再點擊右邊正確的意義圖示進行配對！
                </p>

                {matchingError && (
                  <div className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-400/50 text-rose-200 text-xs font-bold animate-bounce">
                    {matchingError}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 pt-2">
                  {/* Left Column: Words */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-black text-amber-200 block text-center">繪本項目</span>
                    {matchingItems.map((item) => {
                      const isMatched = matchedPairs.includes(item.matchId);
                      const isSelected = selectedWord === item.matchId;

                      return (
                        <button
                          key={item.matchId}
                          type="button"
                          onClick={() => !isMatched && handlePairClick('word', item.word, item.matchId)}
                          disabled={isMatched}
                          className={`w-full p-3 rounded-2xl border text-xs font-extrabold transition-all text-center cursor-pointer ${
                            isMatched
                              ? 'bg-emerald-500/20 border-emerald-400/60 text-emerald-300 opacity-60 line-through'
                              : isSelected
                              ? 'bg-amber-400 text-slate-950 border-amber-300 ring-2 ring-amber-300 scale-102'
                              : 'bg-slate-700 hover:bg-slate-600 text-slate-100 border-slate-600'
                          }`}
                        >
                          {item.word} {isMatched && '✅'}
                        </button>
                      );
                    })}
                  </div>

                  {/* Right Column: Targets */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-black text-amber-200 block text-center">對應意義／圖示</span>
                    {[...matchingItems].reverse().map((item) => {
                      const isMatched = matchedPairs.includes(item.matchId);

                      return (
                        <button
                          key={item.matchId}
                          type="button"
                          onClick={() => !isMatched && handlePairClick('target', item.target, item.matchId)}
                          disabled={isMatched}
                          className={`w-full p-3 rounded-2xl border text-xs font-bold transition-all text-center cursor-pointer ${
                            isMatched
                              ? 'bg-emerald-500/20 border-emerald-400/60 text-emerald-300 opacity-60'
                              : 'bg-slate-700 hover:bg-slate-600 text-slate-100 border-slate-600'
                          }`}
                        >
                          {item.target} {isMatched && '✅'}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {matchedPairs.length === matchingItems.length && (
                <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-400 text-emerald-200 text-center font-black text-sm animate-bounce">
                  🎉 太棒了！全部連連看正確配對完成！可獲得額外童心星星獎勵！
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-5">
            {/* Progress Bar & Question Step */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-black text-amber-200">
                <span>關卡進度 (第 {currentQuestionIndex + 1} / {questions.length} 題)</span>
                <span className="bg-amber-500/20 px-2.5 py-0.5 rounded-full border border-amber-400/40">
                  目前得分：{score} / {questions.length}
                </span>
              </div>

              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden border border-slate-700">
                <div
                  className="bg-gradient-to-r from-amber-400 to-orange-500 h-full transition-all duration-500 rounded-full"
                  style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Question Card */}
            <div className="p-5 rounded-2xl bg-slate-800/90 border border-amber-400/40 space-y-4 shadow-md relative overflow-hidden">
              <div className="flex items-start gap-3">
                <span className="p-2.5 rounded-2xl bg-amber-400 text-slate-950 font-black text-sm shrink-0">
                  Q{currentQuestionIndex + 1}
                </span>
                <h4 className="font-extrabold text-base text-white leading-snug">
                  {currentQ.question}
                </h4>
              </div>

              {/* Options Grid */}
              <div className="grid grid-cols-1 gap-2.5 pt-2">
                {currentQ.options.map((opt, idx) => {
                  const isSelected = selectedOption === idx;
                  const isCorrect = idx === currentQ.correctOptionIndex;

                  let optionStyle = 'bg-slate-700/80 border-slate-600 text-slate-100 hover:bg-slate-700';
                  if (isAnswerSubmitted) {
                    if (isCorrect) {
                      optionStyle = 'bg-emerald-500/30 border-emerald-400 text-emerald-200 font-extrabold ring-2 ring-emerald-400';
                    } else if (isSelected && !isCorrect) {
                      optionStyle = 'bg-rose-500/30 border-rose-400 text-rose-200 font-extrabold';
                    }
                  } else if (isSelected) {
                    optionStyle = 'bg-amber-400 text-slate-950 border-amber-300 font-black ring-2 ring-amber-300 scale-[1.01]';
                  }

                  return (
                    <button
                      type="button"
                      key={idx}
                      id={`btn-quiz-option-${idx}`}
                      onClick={() => handleSelectOption(idx)}
                      disabled={isAnswerSubmitted}
                      className={`w-full p-3.5 rounded-2xl border text-left text-xs sm:text-sm transition-all flex items-center justify-between gap-2 shadow-xs cursor-pointer ${optionStyle}`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-black/20 flex items-center justify-center font-bold text-xs shrink-0">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span>{opt}</span>
                      </span>

                      {isAnswerSubmitted && (
                        <span>
                          {isCorrect ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                          ) : isSelected ? (
                            <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                          ) : null}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation Banner */}
              {isAnswerSubmitted && (
                <div className={`p-4 rounded-2xl border text-xs leading-relaxed animate-fadeIn space-y-1 ${
                  selectedOption === currentQ.correctOptionIndex
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200'
                    : 'bg-rose-500/20 border-rose-400 text-rose-200'
                }`}>
                  <div className="font-black flex items-center gap-1.5 text-sm">
                    {selectedOption === currentQ.correctOptionIndex ? '🎉 答對囉！太棒了！' : '💡 差一點點！解析如下：'}
                  </div>
                  <p>{currentQ.explanation}</p>
                </div>
              )}
            </div>

            {/* Hint & Bottom Buttons */}
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => setShowHint(!showHint)}
                className="text-xs font-extrabold text-amber-300 hover:text-amber-100 flex items-center gap-1 cursor-pointer"
              >
                <HelpCircle className="w-4 h-4" />
                <span>{showHint ? '隱藏提示' : '💡 查看繪本提示'}</span>
              </button>

              {!isAnswerSubmitted ? (
                <button
                  type="button"
                  id="btn-submit-quiz-answer"
                  onClick={handleSubmitAnswer}
                  disabled={selectedOption === null}
                  className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-slate-950 font-black text-xs shadow-lg transition-transform hover:scale-105 disabled:opacity-40 cursor-pointer"
                >
                  確認提交答案
                </button>
              ) : (
                <button
                  type="button"
                  id="btn-next-quiz-question"
                  onClick={handleNextQuestion}
                  className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-xs shadow-lg transition-transform hover:scale-105 flex items-center gap-1.5 cursor-pointer"
                >
                  <span>{currentQuestionIndex < questions.length - 1 ? '下一題挑戰' : '查看闖關總成績 🏆'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>

            {showHint && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-400/30 text-xs text-amber-200 animate-fadeIn">
                💡 繪本提示：回想一下故事內容，主角在歷經考驗時表現出的特質與關鍵對話喔！
              </div>
            )}
          </div>
          )
        ) : (
          /* Quiz Passed / Completion Screen */
          <div className="space-y-6 text-center animate-fadeIn py-2">
            <div className="inline-block p-4 rounded-full bg-gradient-to-br from-amber-400/30 to-orange-500/30 border-2 border-amber-400 animate-bounce">
              <span className="text-5xl">👑</span>
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-black text-amber-300">
                🎉 恭喜完成《{book.title['zh-TW'] || book.title.en}》繪本闖關！
              </h3>
              <p className="text-xs text-slate-300">
                你一共答對了 <span className="text-amber-400 font-extrabold text-sm">{score} / {questions.length}</span> 題，展現了絕佳的故事理解力！
              </p>
            </div>

            {/* Unlocked Rewards Showcase */}
            <div className="p-5 rounded-3xl bg-slate-800/90 border-2 border-amber-400/60 text-left space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-amber-400/30 pb-3">
                <span className="font-black text-sm text-amber-300 flex items-center gap-1.5">
                  <Gift className="w-4 h-4 text-amber-400" />
                  闖關成功解鎖專屬獎勵
                </span>
                <span className="bg-amber-400 text-slate-950 font-black text-xs px-3 py-1 rounded-full shadow-sm">
                  +{quizPreset.rewardStars} ⭐ 童心星星
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Unlocked Dynamic Avatar Frame */}
                <div className="p-3.5 rounded-2xl bg-slate-900 border border-amber-400/40 flex items-center gap-3">
                  <div className="relative">
                    <div className={`w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-xl ${quizPreset.rewardFrame.borderClass} ${quizPreset.rewardFrame.glowClass}`}>
                      {quizPreset.rewardFrame.icon}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold bg-amber-500/30 text-amber-200 px-2 py-0.5 rounded-full border border-amber-400/30">
                      解鎖動態頭像框
                    </span>
                    <h5 className="font-extrabold text-xs text-white mt-1">
                      {quizPreset.rewardFrame.name}
                    </h5>
                  </div>
                </div>

                {/* Unlocked Digital Sticker */}
                <div className="p-3.5 rounded-2xl bg-slate-900 border border-indigo-400/40 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-950 flex items-center justify-center text-2xl border border-indigo-400/40 shadow-sm">
                    {quizPreset.rewardSticker.emoji}
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold bg-indigo-500/30 text-indigo-200 px-2 py-0.5 rounded-full border border-indigo-400/30">
                      解鎖故事數位貼紙
                    </span>
                    <h5 className="font-extrabold text-xs text-white mt-1">
                      {quizPreset.rewardSticker.name}
                    </h5>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleEquipFrame}
                disabled={isEquippedFrame}
                className={`px-5 py-2.5 rounded-2xl font-black text-xs shadow-lg transition-transform hover:scale-105 flex items-center gap-1.5 cursor-pointer ${
                  isEquippedFrame
                    ? 'bg-emerald-500 text-white cursor-default'
                    : 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 hover:from-amber-500 hover:to-orange-600'
                }`}
              >
                <Crown className="w-4 h-4" />
                <span>{isEquippedFrame ? '已配戴此炫彩頭像框 ✨' : '立即裝備動態頭像框'}</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-2xl bg-slate-700 hover:bg-slate-600 text-white font-extrabold text-xs transition-colors cursor-pointer"
              >
                完成挑戰返回圖書館
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
