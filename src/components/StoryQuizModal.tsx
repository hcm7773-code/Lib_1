import React, { useState, useEffect } from 'react';
import { HelpCircle, Award, CheckCircle2, XCircle, Sparkles, Volume2, X, RotateCcw, ChevronRight } from 'lucide-react';
import { Book, QuizQuestion, LanguageCode } from '../types';
import { speakText, stopSpeech, playStarChime } from '../utils/audio';

interface StoryQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: Book;
  primaryLang: LanguageCode;
  onAwardStar: (amount: number) => void;
}

export const StoryQuizModal: React.FC<StoryQuizModalProps> = ({
  isOpen,
  onClose,
  book,
  primaryLang,
  onAwardStar,
}) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [showResult, setShowResult] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      fetchQuiz();
    } else {
      stopSpeech();
    }
  }, [isOpen, book.id]);

  const fetchQuiz = async () => {
    setLoading(true);
    setCurrentIdx(0);
    setScore(0);
    setShowResult(false);
    setSelectedOption(null);
    setIsAnswered(false);
    setShowHint(false);

    try {
      const fullText = book.pages
        .map((p) => p.text['zh-TW'] || p.text.en)
        .join(' ');

      const res = await fetch('/api/gemini/story-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookTitle: book.title['zh-TW'] || book.title.en,
          fullStoryText: fullText,
          ageGroup: book.ageGroup,
        }),
      });

      const data = await res.json();
      if (data.questions && data.questions.length > 0) {
        setQuestions(data.questions);
      } else {
        throw new Error('No questions generated');
      }
    } catch (err) {
      setQuestions([
        {
          id: 'q1',
          question: `故事《${book.title['zh-TW'] || book.title.en}》的主角是誰？`,
          options: [
            book.title['zh-TW'] ? book.title['zh-TW'].split('')[0] + '與好友' : '善良的主角',
            '會說話的魔法石頭',
            '路過的小鳥',
          ],
          correctOptionIndex: 0,
          explanation: '答對了！主要角色陪伴我們經歷了一場精彩的故事！🌟',
          hint: '想想書名上的字詞喔！',
        },
        {
          id: 'q2',
          question: '從這個故事中，我們學到了什麼優良美德？',
          options: ['勇敢、善良與互相幫助', '不喜歡分享玩具', '晚上不刷牙'],
          correctOptionIndex: 0,
          explanation: '太棒了！勇敢與善良是我們最珍貴的特質！⭐',
          hint: '選擇具有愛與正能量的選項！',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const currentQ = questions[currentIdx];

  const handleSelectOption = (index: number) => {
    if (isAnswered) return;
    setSelectedOption(index);
    setIsAnswered(true);

    const isCorrect = index === currentQ.correctOptionIndex;
    if (isCorrect) {
      playStarChime();
      setScore((prev) => prev + 1);
      onAwardStar(3); // 3 stars per correct question
    }

    // Voice speak explanation
    const msg = isCorrect
      ? `太棒了，答對囉！${currentQ.explanation}`
      : `沒關係，再加油！正確答案是：${currentQ.options[currentQ.correctOptionIndex]}。${currentQ.explanation}`;
    speakText(msg, 'zh-TW', 1.0);
  };

  const handleNextQuestion = () => {
    stopSpeech();
    setSelectedOption(null);
    setIsAnswered(false);
    setShowHint(false);

    if (currentIdx < questions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      setShowResult(true);
      playStarChime();
    }
  };

  const handleSpeakQuestion = () => {
    if (!currentQ) return;
    const textToSpeak = `${currentQ.question}。選項有：` + currentQ.options.map((opt, i) => `第${i+1}個，${opt}`).join('。');
    speakText(textToSpeak, 'zh-TW', 0.95);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-amber-50 rounded-3xl p-6 sm:p-8 max-w-xl w-full border-4 border-amber-300 shadow-2xl relative space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-amber-200 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🦉</span>
            <div>
              <h2 className="text-lg font-black text-amber-950 flex items-center gap-1.5">
                <span>AI故事智慧問答大測驗</span>
                <Sparkles className="w-4 h-4 text-amber-500 fill-amber-400" />
              </h2>
              <p className="text-xs font-bold text-amber-800">
                繪本：《{book.title['zh-TW'] || book.title.en}》
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              stopSpeech();
              onClose();
            }}
            className="p-1.5 rounded-full hover:bg-amber-200 text-amber-950 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Loading state */}
        {loading ? (
          <div className="py-12 text-center space-y-3">
            <div className="text-4xl animate-bounce">🦉✨</div>
            <p className="text-sm font-extrabold text-amber-900">
              小貓頭鷹正在為這本故事精心出題中...
            </p>
            <p className="text-xs text-amber-800/70 font-semibold">
              準備考考你的觀察力與想像力！
            </p>
          </div>
        ) : showResult ? (
          /* Result Card */
          <div className="py-6 text-center space-y-6 animate-scaleUp">
            <div className="w-20 h-20 mx-auto bg-amber-200 rounded-full flex items-center justify-center text-4xl border-4 border-amber-400 shadow-md">
              🏆
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-black text-amber-950">
                問答測驗完成！棒極了！
              </h3>
              <p className="text-sm font-bold text-amber-900">
                你在 {questions.length} 道題中答對了 <span className="text-orange-600 font-extrabold text-lg">{score}</span> 題！
              </p>
              <div className="inline-flex items-center gap-1 bg-amber-200 text-amber-950 px-4 py-1.5 rounded-full font-extrabold text-xs border border-amber-400 shadow-2xs">
                <span>總共贏得</span>
                <span className="text-amber-800 text-sm">{score * 3}</span>
                <span>顆故事星章 ⭐</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={fetchQuiz}
                className="flex items-center gap-1.5 bg-white hover:bg-amber-100 text-amber-950 font-extrabold px-4 py-2.5 rounded-2xl border border-amber-300 shadow-xs text-xs"
              >
                <RotateCcw className="w-4 h-4 text-amber-700" />
                <span>再測驗一次</span>
              </button>

              <button
                onClick={() => {
                  stopSpeech();
                  onClose();
                }}
                className="bg-amber-600 hover:bg-amber-700 text-white font-extrabold px-6 py-2.5 rounded-2xl shadow-md text-xs"
              >
                領取獎勵並返回
              </button>
            </div>
          </div>
        ) : (
          /* Question View */
          <div className="space-y-5">
            
            {/* Progress & Tools */}
            <div className="flex items-center justify-between text-xs font-bold text-amber-800">
              <span>
                第 <span className="text-amber-950 font-black text-sm">{currentIdx + 1}</span> / {questions.length} 題
              </span>

              <button
                onClick={handleSpeakQuestion}
                className="flex items-center gap-1 bg-white hover:bg-amber-200 px-3 py-1 rounded-full border border-amber-300 shadow-2xs text-amber-950 font-extrabold"
              >
                <Volume2 className="w-3.5 h-3.5 text-amber-700" />
                <span>朗讀題目</span>
              </button>
            </div>

            {/* Question Text */}
            <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-2xs space-y-2">
              <h3 className="text-base sm:text-lg font-extrabold text-amber-950 leading-snug">
                {currentQ.question}
              </h3>

              {currentQ.hint && !showHint && !isAnswered && (
                <button
                  onClick={() => setShowHint(true)}
                  className="text-xs font-bold text-amber-700 hover:underline flex items-center gap-1 pt-1"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>需要看小提示嗎？</span>
                </button>
              )}

              {showHint && (
                <p className="text-xs font-bold text-amber-800 bg-amber-100/80 p-2.5 rounded-xl border border-amber-300">
                  💡 小貓頭鷹提示：{currentQ.hint}
                </p>
              )}
            </div>

            {/* Options list */}
            <div className="space-y-2.5">
              {currentQ.options.map((opt, idx) => {
                const isSelected = selectedOption === idx;
                const isCorrect = idx === currentQ.correctOptionIndex;

                let btnStyle = 'bg-white hover:bg-amber-100 border-amber-200 text-amber-950';
                if (isAnswered) {
                  if (isCorrect) {
                    btnStyle = 'bg-emerald-100 border-emerald-400 text-emerald-950 font-black';
                  } else if (isSelected) {
                    btnStyle = 'bg-rose-100 border-rose-400 text-rose-950 font-bold';
                  } else {
                    btnStyle = 'bg-slate-50 border-slate-200 text-slate-400 opacity-60';
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={isAnswered}
                    onClick={() => handleSelectOption(idx)}
                    className={`w-full text-left p-4 rounded-2xl border-2 font-bold text-xs sm:text-sm transition-all flex items-center justify-between gap-3 shadow-2xs ${btnStyle}`}
                  >
                    <span>
                      <span className="font-black mr-2">{String.fromCharCode(65 + idx)}.</span>
                      {opt}
                    </span>

                    {isAnswered && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
                    {isAnswered && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-rose-500 shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Explanation box after answer */}
            {isAnswered && (
              <div className="p-4 bg-amber-100/90 rounded-2xl border border-amber-300 space-y-2 animate-fadeIn">
                <div className="flex items-center gap-1.5 font-extrabold text-xs text-amber-950">
                  <span>🦉 小貓頭鷹解析：</span>
                </div>
                <p className="text-xs font-bold text-amber-900 leading-relaxed">
                  {currentQ.explanation}
                </p>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleNextQuestion}
                    className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white font-extrabold px-5 py-2 rounded-xl text-xs shadow-md transition-transform hover:scale-105"
                  >
                    <span>{currentIdx < questions.length - 1 ? '下一題' : '查看最終成果 🏆'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
