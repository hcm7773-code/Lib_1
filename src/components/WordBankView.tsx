import React, { useState, useMemo } from 'react';
import { Bookmark, Volume2, CheckCircle2, Trash2, RotateCcw, Sparkles, Award, Star, Search, Filter } from 'lucide-react';
import { UserWord } from '../types';
import { speakText, playStarChime, playPageTurnSound } from '../utils/audio';

interface WordBankViewProps {
  userWords: UserWord[];
  onToggleMastered: (wordId: string) => void;
  onRemoveWord: (wordId: string) => void;
  onAwardStar: (amount: number) => void;
  darkMode?: boolean;
}

export const WordBankView: React.FC<WordBankViewProps> = ({
  userWords,
  onToggleMastered,
  onRemoveWord,
  onAwardStar,
  darkMode = false,
}) => {
  const [activeTab, setActiveTab] = useState<'list' | 'flashcards' | 'quiz'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'learning' | 'mastered'>('all');
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Quiz state
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const masteredCount = userWords.filter((w) => w.mastered).length;

  // Filtered words for list view
  const filteredWords = useMemo(() => {
    return userWords.filter((item) => {
      const matchSearch =
        item.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.translation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.definition.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.bookTitle && item.bookTitle.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchSearch) return false;
      if (filterMode === 'learning') return !item.mastered;
      if (filterMode === 'mastered') return item.mastered;
      return true;
    });
  }, [userWords, searchQuery, filterMode]);

  const currentFlashcard = userWords[currentCardIndex];

  // Quiz setup
  const currentQuizWord = userWords[quizIndex];
  const quizOptions = useMemo(() => {
    if (!currentQuizWord || userWords.length === 0) return [];
    const wrong = userWords
      .filter((w) => w.word !== currentQuizWord.word)
      .map((w) => w.translation);
    const options = [currentQuizWord.translation, ...wrong.slice(0, 3)];
    return options.sort(() => Math.random() - 0.5);
  }, [currentQuizWord, userWords]);

  const handleAnswerQuiz = (answer: string) => {
    setSelectedAnswer(answer);
    setQuizSubmitted(true);
    if (answer === currentQuizWord.translation) {
      setQuizScore((prev) => prev + 1);
      playStarChime();
      onAwardStar(2);
    }
  };

  const handleNextQuiz = () => {
    setSelectedAnswer(null);
    setQuizSubmitted(false);
    if (quizIndex < userWords.length - 1) {
      setQuizIndex((prev) => prev + 1);
    } else {
      // Quiz complete
      setQuizCompleted(true);
    }
  };

  const handleRestartQuiz = () => {
    setQuizIndex(0);
    setQuizScore(0);
    setSelectedAnswer(null);
    setQuizSubmitted(false);
    setQuizCompleted(false);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8" id="wordbank-container">
      {/* Header Banner */}
      <div
        className={`p-6 sm:p-8 rounded-3xl border flex flex-col md:flex-row items-center justify-between gap-6 transition-all ${
          darkMode
            ? 'bg-slate-900 border-slate-800 text-slate-100 shadow-xl'
            : 'bg-amber-100/80 border-amber-200/80 text-amber-950 shadow-sm'
        }`}
      >
        <div className="space-y-2 text-center md:text-left">
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold ${
              darkMode ? 'bg-amber-500/20 text-amber-300' : 'bg-amber-200 text-amber-900'
            }`}
          >
            <Bookmark className="w-4 h-4 text-amber-500" />
            <span>個人專屬生字累積本</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">
            繪本生字學習與翻牌測驗庫
          </h1>
          <p className={`text-xs sm:text-sm font-medium ${darkMode ? 'text-slate-400' : 'text-amber-900/80'}`}>
            共收錄 <strong className={darkMode ? 'text-amber-400' : 'text-amber-800'}>{userWords.length}</strong> 個詞彙，已精通 <strong className={darkMode ? 'text-amber-400' : 'text-amber-800'}>{masteredCount}</strong> 個。
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div
          className={`flex items-center gap-1.5 p-1.5 rounded-2xl border shadow-2xs ${
            darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-amber-300'
          }`}
        >
          <button
            type="button"
            onClick={() => {
              setActiveTab('list');
              playPageTurnSound();
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
              activeTab === 'list'
                ? 'bg-amber-500 text-slate-950 shadow-xs scale-105'
                : darkMode
                ? 'text-slate-300 hover:text-white'
                : 'text-amber-900 hover:bg-amber-100'
            }`}
          >
            📋 生字列表
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('flashcards');
              playPageTurnSound();
            }}
            disabled={userWords.length === 0}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
              activeTab === 'flashcards'
                ? 'bg-amber-500 text-slate-950 shadow-xs scale-105'
                : darkMode
                ? 'text-slate-300 hover:text-white disabled:opacity-30'
                : 'text-amber-900 hover:bg-amber-100 disabled:opacity-40'
            }`}
          >
            🎴 翻牌卡片
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('quiz');
              playPageTurnSound();
            }}
            disabled={userWords.length === 0}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
              activeTab === 'quiz'
                ? 'bg-amber-500 text-slate-950 shadow-xs scale-105'
                : darkMode
                ? 'text-slate-300 hover:text-white disabled:opacity-30'
                : 'text-amber-900 hover:bg-amber-100 disabled:opacity-40'
            }`}
          >
            🧩 生字小測驗
          </button>
        </div>
      </div>

      {userWords.length === 0 ? (
        <div
          className={`text-center py-16 rounded-3xl border border-dashed p-8 space-y-3 ${
            darkMode ? 'bg-slate-900/60 border-slate-700 text-slate-300' : 'bg-white border-amber-300 text-slate-700'
          }`}
        >
          <div className="text-4xl">📚</div>
          <h3 className="text-lg font-bold">你的生字本目前是空的哦！</h3>
          <p className="text-xs sm:text-sm opacity-80 max-w-md mx-auto">
            在閱讀繪本時，點擊任何感興趣的生字或焦點詞彙，就能一鍵收錄到這裡進行發音與卡片複習。
          </p>
        </div>
      ) : (
        <>
          {/* TAB 1: LIST VIEW */}
          {activeTab === 'list' && (
            <div className="space-y-4">
              {/* Search and Filters Bar */}
              <div
                className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-3 ${
                  darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-amber-200'
                }`}
              >
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="搜尋生字、翻譯或出處繪本..."
                    className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl border outline-none transition-all ${
                      darkMode
                        ? 'bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500 focus:border-amber-500'
                        : 'bg-amber-50/50 border-amber-200 text-slate-900 placeholder:text-slate-400 focus:border-amber-400'
                    }`}
                  />
                </div>

                <div className="flex items-center gap-1.5 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setFilterMode('all')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black cursor-pointer transition-all ${
                      filterMode === 'all'
                        ? 'bg-amber-500 text-slate-950'
                        : darkMode
                        ? 'bg-slate-800 text-slate-300'
                        : 'bg-amber-100 text-amber-900'
                    }`}
                  >
                    全部 ({userWords.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterMode('learning')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black cursor-pointer transition-all ${
                      filterMode === 'learning'
                        ? 'bg-amber-500 text-slate-950'
                        : darkMode
                        ? 'bg-slate-800 text-slate-300'
                        : 'bg-amber-100 text-amber-900'
                    }`}
                  >
                    學習中 ({userWords.length - masteredCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterMode('mastered')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black cursor-pointer transition-all ${
                      filterMode === 'mastered'
                        ? 'bg-amber-500 text-slate-950'
                        : darkMode
                        ? 'bg-slate-800 text-slate-300'
                        : 'bg-amber-100 text-amber-900'
                    }`}
                  >
                    已精通 ⭐ ({masteredCount})
                  </button>
                </div>
              </div>

              {filteredWords.length === 0 ? (
                <div className="text-center py-12 opacity-60 text-xs font-bold">
                  找不到符合條件的生字，請嘗試切換搜尋關鍵字或分類。
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredWords.map((item) => (
                    <div
                      key={item.id}
                      className={`p-5 rounded-2xl border transition-all space-y-3 shadow-2xs ${
                        darkMode
                          ? item.mastered
                            ? 'bg-emerald-950/20 border-emerald-800 text-slate-100'
                            : 'bg-slate-900 border-slate-800 text-slate-100'
                          : item.mastered
                          ? 'border-amber-400/80 bg-amber-50/40 text-amber-950'
                          : 'bg-white border-amber-200 text-amber-950'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-xl font-black">{item.word}</h3>
                            <span className="text-xs font-bold text-amber-500">[{item.phonetic}]</span>
                          </div>
                          <p className="text-xs font-bold text-orange-500 dark:text-orange-400 mt-0.5">{item.translation}</p>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => speakText(item.word, 'zh-TW', 0.9)}
                            className={`p-2 rounded-xl transition-colors cursor-pointer ${
                              darkMode
                                ? 'bg-slate-800 hover:bg-slate-700 text-amber-400'
                                : 'bg-amber-100 hover:bg-amber-200 text-amber-900'
                            }`}
                            title="朗讀發音"
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => onRemoveWord(item.id)}
                            className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 transition-colors cursor-pointer"
                            title="自生字本刪除"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <p
                        className={`text-xs font-medium p-2.5 rounded-xl border leading-relaxed ${
                          darkMode
                            ? 'bg-slate-800/80 border-slate-700 text-slate-300'
                            : 'bg-amber-50 p-2.5 rounded-xl border-amber-100 text-amber-900/90'
                        }`}
                      >
                        {item.definition}
                      </p>

                      <div className="flex items-center justify-between text-[11px] opacity-75 pt-1">
                        <span>來自繪本：《{item.bookTitle}》第 {item.pageNumber} 頁</span>
                        <button
                          type="button"
                          onClick={() => {
                            playStarChime();
                            onToggleMastered(item.id);
                          }}
                          className={`font-extrabold flex items-center gap-1 px-3 py-1 rounded-xl transition-all cursor-pointer ${
                            item.mastered
                              ? 'bg-amber-500 text-slate-950 shadow-2xs'
                              : darkMode
                              ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                              : 'bg-amber-100 hover:bg-amber-200 text-amber-900'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{item.mastered ? '已精通 ⭐' : '標記為已掌握'}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: FLASHCARDS MODE */}
          {activeTab === 'flashcards' && currentFlashcard && (
            <div className="max-w-md mx-auto space-y-6">
              <div
                onClick={() => {
                  playPageTurnSound();
                  setIsFlipped(!isFlipped);
                }}
                className={`w-full min-h-[320px] rounded-3xl p-8 border-2 shadow-xl flex flex-col justify-between items-center text-center cursor-pointer transition-all duration-300 hover:scale-[1.01] ${
                  darkMode
                    ? 'bg-slate-900 border-amber-500/40 text-slate-100'
                    : 'bg-white border-amber-300 text-amber-950'
                }`}
              >
                <div
                  className={`text-xs font-bold px-3 py-1 rounded-full ${
                    darkMode ? 'bg-slate-800 text-amber-400' : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  點擊卡片翻面 • {currentCardIndex + 1} / {userWords.length}
                </div>

                {!isFlipped ? (
                  <div className="space-y-3 my-auto animate-fadeIn">
                    <h2 className="text-4xl font-black">{currentFlashcard.word}</h2>
                    <p className="text-base font-bold text-amber-500">[{currentFlashcard.phonetic}]</p>
                    <p className="text-xs opacity-60">（點擊卡片顯示詳細詞義與例句）</p>
                  </div>
                ) : (
                  <div className="space-y-3 my-auto animate-fadeIn">
                    <h3 className="text-2xl font-black text-orange-500">{currentFlashcard.translation}</h3>
                    <p className="text-sm font-semibold leading-relaxed">{currentFlashcard.definition}</p>
                    {currentFlashcard.exampleSentence && (
                      <p className="text-xs opacity-80 italic font-medium">"{currentFlashcard.exampleSentence}"</p>
                    )}
                  </div>
                )}

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    speakText(currentFlashcard.word, 'zh-TW', 0.9);
                  }}
                  className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 px-4 py-2 rounded-xl text-xs font-black shadow-md cursor-pointer transition-transform hover:scale-105"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>朗讀發音</span>
                </button>
              </div>

              {/* Navigation Controls */}
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    playPageTurnSound();
                    setIsFlipped(false);
                    setCurrentCardIndex((prev) => (prev > 0 ? prev - 1 : userWords.length - 1));
                  }}
                  className={`font-black px-5 py-2.5 rounded-2xl text-xs transition-colors cursor-pointer ${
                    darkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-200' : 'bg-amber-200 hover:bg-amber-300 text-amber-950'
                  }`}
                >
                  ◀ 上一個
                </button>

                <button
                  type="button"
                  onClick={() => {
                    playPageTurnSound();
                    setIsFlipped(false);
                    setCurrentCardIndex((prev) => (prev < userWords.length - 1 ? prev + 1 : 0));
                  }}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black px-5 py-2.5 rounded-2xl text-xs shadow-md transition-transform hover:scale-105 cursor-pointer"
                >
                  下一個 ▶
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: QUIZ MODE */}
          {activeTab === 'quiz' && (
            quizCompleted ? (
              <div
                className={`max-w-lg mx-auto p-6 sm:p-8 rounded-3xl border shadow-lg text-center space-y-5 animate-fadeIn ${
                  darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-amber-200 text-amber-950'
                }`}
              >
                <div className="text-5xl animate-bounce">🎉</div>
                <div className="space-y-1">
                  <h3 className="text-xl font-black">
                    生字測驗圓滿完成！
                  </h3>
                  <p className="text-xs opacity-80 font-bold">
                    你在本次測驗中答對了 {quizScore} / {userWords.length} 題
                  </p>
                </div>

                <div
                  className={`p-4 rounded-2xl border text-sm font-black flex items-center justify-center gap-2 ${
                    darkMode ? 'bg-slate-800/80 border-slate-700 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-900'
                  }`}
                >
                  <Star className="w-5 h-5 text-amber-500 fill-amber-500 animate-spin-slow" />
                  <span>獲得 {quizScore * 2} 顆學習星章獎勵！</span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleRestartQuiz}
                    className="flex-1 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-md transition-transform hover:scale-105 cursor-pointer"
                  >
                    再測驗一次 🔄
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleRestartQuiz();
                      setActiveTab('list');
                    }}
                    className={`flex-1 py-3 rounded-2xl font-bold text-xs transition-colors cursor-pointer ${
                      darkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    返回生字庫
                  </button>
                </div>
              </div>
            ) : currentQuizWord ? (
              <div
                className={`max-w-lg mx-auto p-6 sm:p-8 rounded-3xl border shadow-lg space-y-6 ${
                  darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-amber-200 text-amber-950'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold border-b border-amber-200/50 dark:border-slate-800 pb-3">
                  <span>測驗題 {quizIndex + 1} / {userWords.length}</span>
                  <span className="text-amber-500">目前得分: {quizScore} 分 ⭐</span>
                </div>

                <div
                  className={`text-center space-y-2 py-4 rounded-2xl border ${
                    darkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-amber-50 border-amber-200'
                  }`}
                >
                  <div className="text-3xl font-black">{currentQuizWord.word}</div>
                  <div className="text-xs font-bold text-amber-500">[{currentQuizWord.phonetic}]</div>
                  <p className="text-xs opacity-75">請選擇正確的中文翻譯：</p>
                </div>

                <div className="space-y-2.5">
                  {quizOptions.map((opt, idx) => {
                    const isCorrect = opt === currentQuizWord.translation;
                    let btnStyle = darkMode
                      ? 'bg-slate-800 border-slate-700 text-slate-100 hover:bg-slate-700'
                      : 'bg-white border-amber-200 text-amber-950 hover:bg-amber-50';

                    if (quizSubmitted) {
                      if (isCorrect) btnStyle = 'bg-emerald-500 text-slate-950 border-emerald-600 font-black';
                      else if (selectedAnswer === opt) btnStyle = 'bg-rose-500 text-white border-rose-600';
                      else btnStyle = darkMode ? 'bg-slate-800/40 opacity-40' : 'bg-slate-100 opacity-50';
                    }

                    return (
                      <button
                        key={idx}
                        disabled={quizSubmitted}
                        type="button"
                        onClick={() => handleAnswerQuiz(opt)}
                        className={`w-full p-4 rounded-2xl text-left border text-sm font-bold transition-all cursor-pointer ${btnStyle}`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>

                {quizSubmitted && (
                  <button
                    type="button"
                    onClick={handleNextQuiz}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-black py-3.5 rounded-2xl text-sm shadow-md transition-transform hover:scale-105 cursor-pointer"
                  >
                    {quizIndex >= userWords.length - 1 ? '查看成績報告 ➔' : '下一題 ➔'}
                  </button>
                )}
              </div>
            ) : null
          )}
        </>
      )}
    </div>
  );
};

