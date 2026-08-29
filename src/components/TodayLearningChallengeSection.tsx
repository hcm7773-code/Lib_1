import React, { useState, useEffect } from 'react';
import {
  Target,
  Trophy,
  Star,
  Sparkles,
  CheckCircle2,
  BookOpen,
  Volume2,
  Heart,
  HelpCircle,
  Flame,
  Award,
  ChevronRight,
  Gift,
  Zap,
  RotateCcw,
  Smile,
  ShieldCheck,
  Compass,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProfile, Book } from '../types';
import { playStarChime, playPageTurnSound, speakText } from '../utils/audio';

interface TodayLearningChallengeSectionProps {
  profile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  books: Book[];
  onSelectBook?: (book: Book, startPage?: number) => void;
  onOpenMoodJournal?: () => void;
  onTriggerCelebration?: () => void;
  darkMode?: boolean;
}

export interface LearningChallengeItem {
  id: string;
  title: string;
  category: 'reading' | 'vocab' | 'quiz' | 'mood' | 'audio';
  categoryLabel: string;
  icon: string;
  description: string;
  current: number;
  target: number;
  unit: string;
  rewardStars: number;
  completed: boolean;
  claimed: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
  actionType: 'read' | 'quiz_popup' | 'mood_popup' | 'vocab_popup' | 'audio_listen';
}

interface MiniQuizData {
  question: string;
  storyTitle: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const DAILY_MINI_QUIZZES: MiniQuizData[] = [
  {
    storyTitle: '《小王子》',
    question: '在《小王子》故事中，狐狸告訴小王子：真正重要的東西要用什麼才能看得清楚？',
    options: ['A. 高倍望遠鏡', 'B. 用心靈與感受', 'C. 神奇放大鏡', 'D. 璀璨的星星'],
    correctIndex: 1,
    explanation: '答對了！狐狸說：「真正重要的東西，用眼睛是看不見的，必須用心靈才能看清。」',
  },
  {
    storyTitle: '《醜小鴨》',
    question: '《醜小鴨》經過寒冷的冬天與成長後，最後發現自己蛻變成了什麼？',
    options: ['A. 優雅美麗的白天鵝', 'B. 威風的大孔雀', 'C. 飛翔的老鷹', 'D. 快樂的小燕子'],
    correctIndex: 0,
    explanation: '太棒了！醜小鴨其實不是鴨子，而是一隻美麗純潔的高貴白天鵝！',
  },
  {
    storyTitle: '《三隻小豬》',
    question: '《三隻小豬》中，哪一隻小豬蓋的房子成功抵擋了大野狼的猛烈吹氣？',
    options: ['A. 第一隻小豬的稻草屋', 'B. 第二隻小豬的木頭屋', 'C. 第三隻小豬的磚塊屋', 'D. 森林裡的帳篷'],
    correctIndex: 2,
    explanation: '真聰明！勤勞的豬老三用堅固的紅磚建造房子，保護了兄弟們！',
  },
];

export const TodayLearningChallengeSection: React.FC<TodayLearningChallengeSectionProps> = ({
  profile,
  onUpdateProfile,
  books,
  onSelectBook,
  onOpenMoodJournal,
  onTriggerCelebration,
  darkMode = false,
}) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [activeQuizModal, setActiveQuizModal] = useState<MiniQuizData | null>(null);
  const [quizSelectedOption, setQuizSelectedOption] = useState<number | null>(null);
  const [quizAnswerChecked, setQuizAnswerChecked] = useState(false);
  const [isQuizCorrect, setIsQuizCorrect] = useState(false);
  const [isChestOpened, setIsChestOpened] = useState(false);
  const [parentPraiseGiven, setParentPraiseGiven] = useState(false);

  // Initialize daily challenges based on current profile metrics
  const [challenges, setChallenges] = useState<LearningChallengeItem[]>([
    {
      id: 'challenge-read-time',
      title: '🌟 晨光冒險：繪本閱讀達標',
      category: 'reading',
      categoryLabel: '沉浸閱讀',
      icon: '📖',
      description: '享受繪本世界，今天累積閱讀時長滿 10 分鐘',
      current: Math.min(10, profile.readingMinutes || 8),
      target: 10,
      unit: '分鐘',
      rewardStars: 10,
      completed: (profile.readingMinutes || 8) >= 10,
      claimed: false,
      difficulty: 'easy',
      actionType: 'read',
    },
    {
      id: 'challenge-vocab-explore',
      title: '🔤 雙語小天才：生字智慧收集',
      category: 'vocab',
      categoryLabel: '字彙學習',
      icon: '⭐',
      description: '在繪本與生字本中認識並朗讀 3 個關鍵重點詞彙',
      current: 3,
      target: 3,
      unit: '個生字',
      rewardStars: 10,
      completed: true,
      claimed: false,
      difficulty: 'medium',
      actionType: 'vocab_popup',
    },
    {
      id: 'challenge-ai-quiz',
      title: '🦉 故事小博士：今日思維隨堂考',
      category: 'quiz',
      categoryLabel: '思考啟發',
      icon: '🦉',
      description: '挑戰現場 1 道趣味情節理解題，鍛鍊觀察與思辨力',
      current: 0,
      target: 1,
      unit: '題測驗',
      rewardStars: 15,
      completed: false,
      claimed: false,
      difficulty: 'medium',
      actionType: 'quiz_popup',
    },
    {
      id: 'challenge-mood-reflection',
      title: '💖 心靈回響：留下繪本心情筆記',
      category: 'mood',
      categoryLabel: '情感表達',
      icon: '🎨',
      description: '在童心閱讀心情日記中記錄今天最喜歡的畫面或金句',
      current: (profile.moodJournal && profile.moodJournal.length > 0) ? 1 : 0,
      target: 1,
      unit: '篇日記',
      rewardStars: 10,
      completed: (profile.moodJournal && profile.moodJournal.length > 0),
      claimed: false,
      difficulty: 'easy',
      actionType: 'mood_popup',
    },
    {
      id: 'challenge-audio-voice',
      title: '🎙️ 聲臨其境：雙語朗讀跟讀體驗',
      category: 'audio',
      categoryLabel: '語音聽力',
      icon: '🔊',
      description: '播放多角色語音導讀，跟著朗讀 1 個故事精采段落',
      current: 1,
      target: 1,
      unit: '次朗讀',
      rewardStars: 10,
      completed: true,
      claimed: true,
      difficulty: 'hard',
      actionType: 'audio_listen',
    },
  ]);

  // Filter challenges by difficulty if desired or show active daily set
  const filteredChallenges = challenges;

  const completedCount = filteredChallenges.filter((c) => c.completed || c.claimed).length;
  const claimedCount = filteredChallenges.filter((c) => c.claimed).length;
  const totalCount = filteredChallenges.length;
  const allCompleted = completedCount === totalCount;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  // Claim single challenge reward
  const handleClaimChallenge = (challengeId: string, stars: number) => {
    playStarChime();
    setChallenges((prev) =>
      prev.map((c) => (c.id === challengeId ? { ...c, claimed: true, completed: true } : c))
    );
    onUpdateProfile({
      ...profile,
      stars: profile.stars + stars,
    });
  };

  // Open Mini Quiz
  const handleOpenQuiz = () => {
    const randomQ = DAILY_MINI_QUIZZES[Math.floor(Math.random() * DAILY_MINI_QUIZZES.length)];
    setActiveQuizModal(randomQ);
    setQuizSelectedOption(null);
    setQuizAnswerChecked(false);
    setIsQuizCorrect(false);
    playPageTurnSound();
  };

  // Check Mini Quiz Answer
  const handleCheckQuizAnswer = () => {
    if (!activeQuizModal || quizSelectedOption === null) return;
    const correct = quizSelectedOption === activeQuizModal.correctIndex;
    setIsQuizCorrect(correct);
    setQuizAnswerChecked(true);

    if (correct) {
      playStarChime();
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.6 },
      });
      // Mark quiz challenge as completed
      setChallenges((prev) =>
        prev.map((c) => (c.category === 'quiz' ? { ...c, current: 1, completed: true } : c))
      );
    }
  };

  // Open Daily Master Chest
  const handleOpenChest = () => {
    if (isChestOpened) return;
    playStarChime();
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.5 },
    });
    setIsChestOpened(true);
    onUpdateProfile({
      ...profile,
      stars: profile.stars + 30,
    });
    if (onTriggerCelebration) {
      onTriggerCelebration();
    }
  };

  // Parent Praise
  const handleGiveParentPraise = () => {
    playStarChime();
    setParentPraiseGiven(true);
    speakText('爸爸媽媽為你的認真閱讀感到無比驕傲！繼續加油喔！', 'zh-TW');
    onUpdateProfile({
      ...profile,
      stars: profile.stars + 5,
    });
  };

  return (
    <div
      className={`p-6 sm:p-8 rounded-3xl border transition-all ${
        darkMode
          ? 'bg-slate-800/90 border-slate-700 text-slate-100 shadow-xl'
          : 'bg-white border-amber-200 shadow-sm'
      }`}
      id="today-learning-challenge-section"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-200/70 dark:border-slate-700 pb-5 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-yellow-400 text-slate-950 shadow-md">
            <Target className="w-6 h-6 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-black text-lg sm:text-xl tracking-tight text-slate-900 dark:text-slate-100">
                🎯 今日學習挑戰 (Daily Learning Challenge)
              </h2>
              <span className="text-[10px] font-black bg-orange-500 text-white px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                <Flame className="w-3 h-3 fill-current" />
                <span>連勝 {profile.streakDays || 1} 天</span>
              </span>
            </div>
            <p className={`text-xs font-semibold mt-0.5 ${darkMode ? 'text-slate-400' : 'text-amber-900/80'}`}>
              每日精心挑選的閱讀、思考、字彙與表達任務，天天解鎖星章與榮譽寶箱！
            </p>
          </div>
        </div>

        {/* Difficulty Selector */}
        <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-slate-900/80 p-1.5 rounded-2xl border border-amber-200 dark:border-slate-700 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setSelectedDifficulty('easy')}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              selectedDifficulty === 'easy'
                ? 'bg-amber-500 text-slate-950 shadow-xs scale-105'
                : 'text-slate-600 dark:text-slate-400 hover:text-amber-700'
            }`}
          >
            🌱 啟蒙初階
          </button>
          <button
            type="button"
            onClick={() => setSelectedDifficulty('medium')}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              selectedDifficulty === 'medium'
                ? 'bg-amber-500 text-slate-950 shadow-xs scale-105'
                : 'text-slate-600 dark:text-slate-400 hover:text-amber-700'
            }`}
          >
            🛡️ 冒險進階
          </button>
          <button
            type="button"
            onClick={() => setSelectedDifficulty('hard')}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              selectedDifficulty === 'hard'
                ? 'bg-amber-500 text-slate-950 shadow-xs scale-105'
                : 'text-slate-600 dark:text-slate-400 hover:text-amber-700'
            }`}
          >
            🦉 故事小博士
          </button>
        </div>
      </div>

      {/* Challenge Progress Summary Bar */}
      <div className={`p-4 rounded-2xl border mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 ${
        darkMode ? 'bg-slate-900 border-slate-700' : 'bg-gradient-to-r from-amber-50 via-orange-50/50 to-amber-100/60 border-amber-200'
      }`}>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-lg shadow-sm">
            {progressPercent}%
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-black text-amber-950 dark:text-amber-200">
              今日挑戰進度：已完成 {completedCount} / {totalCount} 項任務
            </h3>
            <div className="w-48 sm:w-64 h-2 bg-amber-200 dark:bg-slate-700 rounded-full overflow-hidden mt-1.5">
              <div
                className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-500 transition-all duration-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Master Chest Reward */}
        <div className="flex items-center gap-3 self-end sm:self-auto">
          <button
            type="button"
            onClick={handleOpenChest}
            disabled={!allCompleted || isChestOpened}
            className={`px-4 py-2 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all ${
              isChestOpened
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : allCompleted
                ? 'bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-300 text-slate-950 animate-bounce hover:scale-105 cursor-pointer ring-2 ring-amber-300'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed opacity-75'
            }`}
          >
            <Gift className={`w-4 h-4 ${allCompleted && !isChestOpened ? 'animate-pulse text-slate-950' : ''}`} />
            <span>
              {isChestOpened ? '🎉 今日大禮包已領取 (+30⭐)' : allCompleted ? '🎁 領取全勤大寶箱 (+30⭐)' : '🔒 完成全任務解鎖寶箱'}
            </span>
          </button>
        </div>
      </div>

      {/* Challenges List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredChallenges.map((challenge) => {
          const isDone = challenge.completed || challenge.claimed;
          const progress = Math.min(100, Math.round((challenge.current / challenge.target) * 100));

          return (
            <div
              key={challenge.id}
              className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                challenge.claimed
                  ? 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800'
                  : isDone
                  ? 'bg-amber-50/90 dark:bg-amber-950/20 border-amber-400 dark:border-amber-700 shadow-xs'
                  : 'bg-slate-50/70 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="text-2xl p-2 rounded-xl bg-white dark:bg-slate-800 border border-amber-200/80 dark:border-slate-700 shadow-2xs shrink-0">
                    {challenge.icon}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-slate-100 leading-tight">
                        {challenge.title}
                      </h4>
                      <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-amber-200 text-amber-900 dark:bg-slate-700 dark:text-amber-300">
                        {challenge.categoryLabel}
                      </span>
                    </div>
                    <p className="text-[11px] font-medium text-slate-600 dark:text-slate-400 mt-1 leading-snug">
                      {challenge.description}
                    </p>
                  </div>
                </div>

                <span className="text-xs font-black text-amber-900 dark:text-amber-200 bg-amber-200/80 dark:bg-amber-900/60 px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-700 shrink-0">
                  +{challenge.rewardStars} ⭐
                </span>
              </div>

              {/* Progress and actions */}
              <div className="space-y-2 pt-1">
                <div className="flex justify-between text-[11px] font-extrabold text-slate-700 dark:text-slate-300">
                  <span>進度：{challenge.current} / {challenge.target} {challenge.unit}</span>
                  <span>{progress}%</span>
                </div>

                <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      challenge.claimed
                        ? 'bg-emerald-500'
                        : isDone
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                        : 'bg-amber-400'
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  {/* Action trigger button */}
                  <div>
                    {challenge.actionType === 'quiz_popup' && !isDone && (
                      <button
                        type="button"
                        onClick={handleOpenQuiz}
                        className="text-xs font-black text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-1 cursor-pointer bg-blue-50 dark:bg-slate-800 px-2.5 py-1 rounded-xl border border-blue-200 dark:border-blue-900"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>立即答題挑戰</span>
                      </button>
                    )}

                    {challenge.actionType === 'mood_popup' && !isDone && onOpenMoodJournal && (
                      <button
                        type="button"
                        onClick={onOpenMoodJournal}
                        className="text-xs font-black text-pink-600 dark:text-pink-400 hover:text-pink-700 flex items-center gap-1 cursor-pointer bg-pink-50 dark:bg-slate-800 px-2.5 py-1 rounded-xl border border-pink-200 dark:border-pink-900"
                      >
                        <Heart className="w-3.5 h-3.5" />
                        <span>前往寫心情</span>
                      </button>
                    )}

                    {challenge.actionType === 'read' && !isDone && books.length > 0 && onSelectBook && (
                      <button
                        type="button"
                        onClick={() => onSelectBook(books[0])}
                        className="text-xs font-black text-amber-700 dark:text-amber-300 hover:text-amber-800 flex items-center gap-1 cursor-pointer bg-amber-100/80 dark:bg-slate-800 px-2.5 py-1 rounded-xl border border-amber-300 dark:border-amber-900"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>開啟繪本共讀</span>
                      </button>
                    )}
                  </div>

                  {/* Status / Claim */}
                  <div>
                    {challenge.claimed ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-300 dark:border-emerald-800">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        已領取獎勵
                      </span>
                    ) : isDone ? (
                      <button
                        type="button"
                        onClick={() => handleClaimChallenge(challenge.id, challenge.rewardStars)}
                        className="flex items-center gap-1 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs px-3.5 py-1.5 rounded-xl shadow-md animate-bounce cursor-pointer transition-transform hover:scale-105"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>領取 +{challenge.rewardStars}⭐</span>
                      </button>
                    ) : (
                      <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-slate-200 dark:bg-slate-800 px-2.5 py-1 rounded-full">
                        進行中
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Parent Co-reading Encouragement & Praise Stamp */}
      <div className={`mt-6 p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-3 ${
        darkMode ? 'bg-purple-950/30 border-purple-900 text-purple-100' : 'bg-purple-50/70 border-purple-200 text-purple-950'
      }`}>
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500 text-white shadow-xs">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-black text-xs sm:text-sm">
              👨‍👩‍👧 家長即時共讀激勵蓋章：
            </h4>
            <p className="text-[11px] font-medium opacity-80">
              孩子每完成一項挑戰，家長可點擊蓋章送出專屬語音讚美與額外星章！
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGiveParentPraise}
          disabled={parentPraiseGiven}
          className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-xs ${
            parentPraiseGiven
              ? 'bg-purple-200 text-purple-900 border border-purple-300 cursor-default'
              : 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:scale-105 cursor-pointer'
          }`}
        >
          <Smile className="w-4 h-4" />
          <span>{parentPraiseGiven ? '💖 家長今日已熱情蓋章！' : '👍 給予孩子鼓勵蓋章 (+5⭐)'}</span>
        </button>
      </div>

      {/* Mini Quiz Modal / Drawer */}
      {activeQuizModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className={`w-full max-w-md p-6 rounded-3xl border shadow-2xl space-y-4 ${
            darkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-amber-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between border-b border-amber-200 dark:border-slate-700 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🦉</span>
                <div>
                  <h3 className="font-black text-base text-amber-950 dark:text-amber-200">
                    今日故事小博士隨堂考
                  </h3>
                  <span className="text-[10px] font-bold text-amber-600">
                    出題來源：{activeQuizModal.storyTitle}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setActiveQuizModal(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="font-bold text-sm leading-relaxed">
              {activeQuizModal.question}
            </p>

            <div className="space-y-2">
              {activeQuizModal.options.map((opt, idx) => {
                const isSelected = quizSelectedOption === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      if (!quizAnswerChecked) {
                        setQuizSelectedOption(idx);
                        playPageTurnSound();
                      }
                    }}
                    className={`w-full p-3 rounded-2xl text-left text-xs font-bold transition-all border cursor-pointer ${
                      quizAnswerChecked
                        ? idx === activeQuizModal.correctIndex
                          ? 'bg-emerald-100 border-emerald-500 text-emerald-950 font-black'
                          : isSelected
                          ? 'bg-rose-100 border-rose-400 text-rose-950'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 opacity-60'
                        : isSelected
                        ? 'bg-amber-100 border-amber-500 text-amber-950 shadow-xs scale-[1.01]'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-amber-50'
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {/* Answer checked explanation */}
            {quizAnswerChecked && (
              <div className={`p-3 rounded-2xl border text-xs font-bold ${
                isQuizCorrect
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-900 dark:text-emerald-200'
                  : 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 text-amber-900 dark:text-amber-200'
              }`}>
                {activeQuizModal.explanation}
              </div>
            )}

            {/* Modal Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2">
              {!quizAnswerChecked ? (
                <button
                  type="button"
                  onClick={handleCheckQuizAnswer}
                  disabled={quizSelectedOption === null}
                  className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-black py-2.5 rounded-2xl text-xs shadow-md transition-transform cursor-pointer"
                >
                  確認提交答案
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setActiveQuizModal(null)}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-2.5 rounded-2xl text-xs shadow-md transition-transform cursor-pointer"
                >
                  完成測驗並領取獎勵
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
