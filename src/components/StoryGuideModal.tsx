import React, { useState } from 'react';
import { Sparkles, X, Volume2, HelpCircle, BookOpen, Lightbulb, Play, CheckCircle2, MessageSquare, Heart } from 'lucide-react';
import { Book, StoryGuideAvatar, LanguageCode } from '../types';
import { speakText, stopSpeech } from '../utils/audio';

interface StoryGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: Book;
  primaryLang: LanguageCode;
  onStartReading: () => void;
  darkMode?: boolean;
}

export const StoryGuideModal: React.FC<StoryGuideModalProps> = ({
  isOpen,
  onClose,
  book,
  primaryLang,
  onStartReading,
  darkMode = false,
}) => {
  const [selectedAvatar, setSelectedAvatar] = useState<StoryGuideAvatar>('mimi_cat');
  const [isSpeakingGuide, setIsSpeakingGuide] = useState(false);
  const [userAnswer, setUserAnswer] = useState<string | null>(null);

  if (!isOpen) return null;

  const titleText = book.title[primaryLang] || book.title['zh-TW'] || book.title['en'];
  const summaryText = book.summary[primaryLang] || book.summary['zh-TW'] || book.summary['en'];

  const avatarsList = [
    {
      id: 'mimi_cat' as StoryGuideAvatar,
      name: '咪咪貓導讀員',
      icon: '🐱',
      voiceRole: 'cartoon' as const,
      roleDescription: '活潑親切，最喜歡帶小朋友一起聽故事！',
      greeting: `哈囉小朋友！我是咪咪貓導讀員！今天要帶大家一起讀《${titleText}》這本超有趣的繪本喔！`,
    },
    {
      id: 'dr_owl' as StoryGuideAvatar,
      name: '貓頭鷹博士',
      icon: '🦉',
      voiceRole: 'teacher' as const,
      roleDescription: '博學多聞，喜歡分享故事裡的有趣知識與品德學習！',
      greeting: `嗨！我是貓頭鷹博士！在閱讀《${titleText}》時，記得仔細觀察故事主角的勇氣與決定喔！`,
    },
    {
      id: 'grandpa_wizard' as StoryGuideAvatar,
      name: '魔法故事爺爺',
      icon: '🧙‍♂️',
      voiceRole: 'grandpa' as const,
      roleDescription: '溫柔沉穩，用智慧的故事引導孩子思考與想像！',
      greeting: `孩子們好呀！歡迎來到魔法故事時間。讓爺爺帶你探索《${titleText}》的奇妙世界吧！`,
    },
  ];

  const currentAvatar = avatarsList.find((a) => a.id === selectedAvatar) || avatarsList[0];

  // Tailored interactive guide contents for the book
  const preReadingQuestions = [
    `如果在故事裡遇到困難，你覺得主角會選擇「尋求朋友幫忙」還是「自己勇敢試試看」呢？`,
    `讀這本書之前，猜猜看主角最後會發現什麼最珍貴的寶物？`,
    `如果是你遇到故事中的情境，你會怎麼處理呢？`,
  ];
  const activeQuestion = preReadingQuestions[book.title['en'] ? book.title['en'].length % preReadingQuestions.length : 0];

  const sampleAnswers = ['🤝 找好朋友一起幫忙', '🦁 自己勇敢嘗試！', '💡 先冷靜想個妙招'];

  const handleSpeakGuideSpeech = () => {
    stopSpeech();
    setIsSpeakingGuide(true);
    const textToSpeak = `${currentAvatar.greeting} 故事大意是：${summaryText}。讀這本書時，想一想：${activeQuestion}`;
    speakText(
      textToSpeak,
      'zh-TW',
      1.0,
      currentAvatar.voiceRole,
      1.0,
      () => setIsSpeakingGuide(false)
    );
  };

  const handleStopSpeech = () => {
    stopSpeech();
    setIsSpeakingGuide(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div
        className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 sm:p-8 shadow-2xl border transition-all ${
          darkMode
            ? 'bg-slate-900 border-slate-700 text-slate-100'
            : 'bg-gradient-to-br from-amber-50 via-orange-50/70 to-amber-100/90 border-amber-300 text-amber-950'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={() => {
            handleStopSpeech();
            onClose();
          }}
          className={`absolute top-4 right-4 p-2.5 rounded-full transition-colors ${
            darkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-amber-200/80 text-amber-800'
          }`}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b pb-4 border-amber-200/80 dark:border-slate-800">
          <div className="p-3 bg-gradient-to-tr from-orange-500 to-amber-400 text-white rounded-2xl shadow-sm">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">繪本專屬導讀員</h2>
            <p className={`text-xs font-bold ${darkMode ? 'text-slate-400' : 'text-amber-800/80'}`}>
              選一位導讀夥伴，為你暖心導讀《{titleText}》的故事重點與背景小知識！
            </p>
          </div>
        </div>

        {/* Avatar Selector Pills */}
        <div className="space-y-2 mt-5">
          <span className="text-xs font-black text-amber-900 dark:text-slate-200 block">
            選擇你的故事導讀員：
          </span>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {avatarsList.map((avatar) => (
              <button
                key={avatar.id}
                onClick={() => {
                  handleStopSpeech();
                  setSelectedAvatar(avatar.id);
                }}
                className={`p-3 rounded-2xl border transition-all flex flex-col items-center text-center gap-1.5 ${
                  selectedAvatar === avatar.id
                    ? 'bg-orange-500 text-white border-orange-600 shadow-md scale-105'
                    : darkMode
                    ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                    : 'bg-white border-amber-200/80 text-amber-950 hover:bg-amber-100'
                }`}
              >
                <span className="text-3xl">{avatar.icon}</span>
                <span className="text-xs font-black">{avatar.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Guide Speech Bubble */}
        <div className="mt-5 p-5 rounded-3xl bg-white/90 dark:bg-slate-800/90 border border-amber-200 dark:border-slate-700 shadow-md space-y-4">
          <div className="flex items-start gap-3">
            <div className="text-4xl p-2 rounded-2xl bg-amber-100 dark:bg-slate-700 shrink-0 animate-bounce">
              {currentAvatar.icon}
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-orange-600 dark:text-orange-400">
                  {currentAvatar.name} 說：
                </span>
                {isSpeakingGuide ? (
                  <button
                    onClick={handleStopSpeech}
                    className="px-3 py-1 rounded-full bg-rose-500 text-white text-xs font-extrabold shadow-xs animate-pulse"
                  >
                    ⏹ 停止導讀語音
                  </button>
                ) : (
                  <button
                    onClick={handleSpeakGuideSpeech}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-600 hover:bg-amber-700 text-white text-xs font-extrabold shadow-xs transition-transform hover:scale-105"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>🔊 聽導讀員朗讀開場</span>
                  </button>
                )}
              </div>
              <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 leading-relaxed bg-amber-50/80 dark:bg-slate-900/60 p-3.5 rounded-2xl border border-amber-100 dark:border-slate-800">
                「{currentAvatar.greeting}」
              </p>
            </div>
          </div>

          {/* Book Key Takeaways & Cultural Fun Fact */}
          <div className="grid sm:grid-cols-2 gap-3 pt-2 text-xs font-bold">
            <div className="p-3.5 rounded-2xl bg-orange-50 dark:bg-slate-900/50 border border-orange-200 dark:border-slate-700 space-y-1">
              <div className="flex items-center gap-1.5 text-orange-700 dark:text-orange-400 font-extrabold">
                <BookOpen className="w-4 h-4" />
                <span>📖 閱讀重點引導</span>
              </div>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                來自【{book.flag} {book.originCountry}】的精采童話，適合 {book.ageGroup} 歲孩童，幫助培養對自然與朋友的愛護。
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-slate-900/50 border border-amber-200 dark:border-slate-700 space-y-1">
              <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-extrabold">
                <Lightbulb className="w-4 h-4" />
                <span>💡 導讀員文化小知識</span>
              </div>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                在{book.originCountry}文化中，這類故事常用來傳承勇氣與誠實的傳統美德喔！
              </p>
            </div>
          </div>

          {/* Interactive Pre-Reading Question */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-100/80 to-orange-100/80 dark:from-slate-800 dark:to-slate-800 border border-amber-300 dark:border-slate-600 space-y-2">
            <div className="flex items-center gap-1.5 text-amber-950 dark:text-slate-100 font-black text-xs">
              <HelpCircle className="w-4 h-4 text-orange-600" />
              <span>❓ 讀前互動思考小問題：</span>
            </div>
            <p className="text-xs sm:text-sm font-extrabold text-amber-900 dark:text-amber-200">
              {activeQuestion}
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              {sampleAnswers.map((ans, idx) => (
                <button
                  key={idx}
                  onClick={() => setUserAnswer(ans)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all border ${
                    userAnswer === ans
                      ? 'bg-orange-500 text-white border-orange-600 shadow-xs scale-105'
                      : 'bg-white dark:bg-slate-700 text-amber-950 dark:text-slate-200 border-amber-200 dark:border-slate-600 hover:bg-amber-100'
                  }`}
                >
                  {ans}
                </button>
              ))}
            </div>

            {userAnswer && (
              <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 pt-1 flex items-center gap-1 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4" />
                <span>{currentAvatar.name}：想法太棒了！讓我們翻開第一頁，看看故事裡是怎麼發生的吧！</span>
              </p>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            onClick={() => {
              handleStopSpeech();
              onClose();
            }}
            className={`px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-colors ${
              darkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-amber-100 text-amber-900 hover:bg-amber-200'
            }`}
          >
            稍後再看
          </button>

          <button
            onClick={() => {
              handleStopSpeech();
              onClose();
              onStartReading();
            }}
            className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black text-xs sm:text-sm shadow-md hover:scale-105 transition-transform"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>開始翻開閱讀！</span>
          </button>
        </div>
      </div>
    </div>
  );
};
