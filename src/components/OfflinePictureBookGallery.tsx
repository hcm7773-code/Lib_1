import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Play, Pause, SkipBack, SkipForward, Maximize2, Minimize2, Volume2, VolumeX,
  Sparkles, Award, Star, HelpCircle, CheckCircle2, XCircle, RotateCcw, BookOpen,
  Filter, Grid, Film, Layers, Zap, Eye, ChevronRight, ChevronLeft, Heart,
  Flame, Bookmark, Check, ShieldCheck, Smile, Settings, Clock, Compass, Shuffle
} from 'lucide-react';
import { Book, BookPage, UserProfile, VoiceRole, VocabItem } from '../types';
import { playStarChime, playPageTurnSound, speakText } from '../utils/audio';

export interface OfflinePictureBookGalleryProps {
  downloadedBooks: Book[];
  allBooks?: Book[];
  userProfile?: UserProfile;
  questCrystals?: number;
  onAddCrystals?: (amount: number) => void;
  onSelectBook?: (bookId: string) => void;
  onCloseParent?: () => void;
}

export interface GallerySlideItem {
  id: string;
  bookId: string;
  bookTitleZh: string;
  bookTitleEn: string;
  author: string;
  category: string;
  originCountry: string;
  flag: string;
  pageNumber: number;
  totalPages: number;
  illustrationUrl: string;
  textZh: string;
  textEn: string;
  vocabs: VocabItem[];
  themeMood: 'starry' | 'forest' | 'magic' | 'ocean' | 'warm';
  moralInsight: string;
}

export interface PopQuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  rewardCrystals: number;
  vocabTarget?: VocabItem;
}

const FALLBACK_ILLUSTRATIONS = [
  'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop',
];

export const OfflinePictureBookGallery: React.FC<OfflinePictureBookGalleryProps> = ({
  downloadedBooks = [],
  allBooks = [],
  userProfile,
  questCrystals = 350,
  onAddCrystals,
  onSelectBook,
  onCloseParent,
}) => {
  // Books Pool: prefer downloaded books, fallback to all books
  const targetBooks = useMemo(() => {
    return downloadedBooks.length > 0 ? downloadedBooks : (allBooks.length > 0 ? allBooks : []);
  }, [downloadedBooks, allBooks]);

  // Extract all gallery slides from the books
  const allSlides: GallerySlideItem[] = useMemo(() => {
    const slides: GallerySlideItem[] = [];

    targetBooks.forEach((book, bIdx) => {
      const titleZh = typeof book.title === 'string' ? book.title : (book.title['zh-TW'] || book.title.en || '繪本故事');
      const titleEn = typeof book.title === 'object' ? (book.title.en || 'Picture Book') : 'Picture Book';
      const pages = book.pages && book.pages.length > 0 ? book.pages : [
        {
          pageNumber: 1,
          illustrationUrl: book.coverUrl || FALLBACK_ILLUSTRATIONS[bIdx % FALLBACK_ILLUSTRATIONS.length],
          text: { 'zh-TW': typeof book.summary === 'object' ? (book.summary['zh-TW'] || '精彩故事內容') : '精彩故事內容', en: typeof book.summary === 'object' ? (book.summary.en || 'Wonderful Story') : 'Wonderful Story' },
          vocab: [
            { word: 'Friendship', phonetic: '/ˈfrendʃɪp/', translation: '友誼', definition: '與朋友間溫暖珍貴的感情', exampleSentence: 'True friendship is a treasure.' },
            { word: 'Courage', phonetic: '/ˈkʌrɪdʒ/', translation: '勇氣', definition: '勇敢面對困難的力量', exampleSentence: 'Have courage and be kind.' },
          ],
        } as any,
      ];

      const moods: ('starry' | 'forest' | 'magic' | 'ocean' | 'warm')[] = ['starry', 'forest', 'magic', 'ocean', 'warm'];

      pages.forEach((page, pIdx) => {
        const textZh = typeof page.text === 'object' ? (page.text['zh-TW'] || page.text.en || '') : String(page.text || '');
        const textEn = typeof page.text === 'object' ? (page.text.en || '') : '';
        const rawVocabs = page.vocab || [];
        const vocabs: VocabItem[] = rawVocabs.length > 0 ? rawVocabs : [
          { word: 'Wonder', phonetic: '/ˈwʌndər/', translation: '奇蹟、驚奇', definition: '感到奇妙與美好的事物', exampleSentence: 'The world is full of wonder.' },
          { word: 'Kindness', phonetic: '/ˈkaɪndnəs/', translation: '善良', definition: '對待他人溫柔體貼的心', exampleSentence: 'Kindness always makes life better.' },
        ];

        const defaultMorals = [
          '學會分享與同理心，溫暖身邊的每位夥伴。',
          '勇敢探索未知，每一步都是成長的印記。',
          '大自然孕育了萬物，要用心保護我們的綠色地球。',
          '堅持與好奇心是開啟智慧城堡的金鑰匙。',
          '最深厚的友誼在於互相扶持與真誠相待。',
        ];

        slides.push({
          id: `${book.id}_page_${page.pageNumber || pIdx + 1}`,
          bookId: book.id,
          bookTitleZh: titleZh,
          bookTitleEn: titleEn,
          author: book.author || '繪本作家',
          category: book.category || '奇幻故事',
          originCountry: book.originCountry || '世界經典',
          flag: book.flag || '🌍',
          pageNumber: page.pageNumber || pIdx + 1,
          totalPages: pages.length,
          illustrationUrl: page.illustrationUrl || book.coverUrl || FALLBACK_ILLUSTRATIONS[(bIdx + pIdx) % FALLBACK_ILLUSTRATIONS.length],
          textZh: textZh || `在美麗的故事世界裡，展開了令人難忘的第 ${pIdx + 1} 頁冒險篇章。`,
          textEn: textEn || 'A wonderful adventure page in this timeless picture book.',
          vocabs,
          themeMood: moods[(bIdx + pIdx) % moods.length],
          moralInsight: defaultMorals[(bIdx + pIdx) % defaultMorals.length],
        });
      });
    });

    // If no slides, inject demo slides
    if (slides.length === 0) {
      return [
        {
          id: 'demo_slide_1',
          bookId: 'b_demo_1',
          bookTitleZh: '小王子與星空狐狸',
          bookTitleEn: 'The Little Prince & the Star Fox',
          author: '安東尼·聖修伯里',
          category: '奇幻童話',
          originCountry: '法國',
          flag: '🇫🇷',
          pageNumber: 1,
          totalPages: 3,
          illustrationUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1200&auto=format&fit=crop',
          textZh: '小王子離開了自己的小星球 B-612，在浩瀚的銀河中遇到一隻閃耀著金光的小狐狸，展開了一段關於友誼與愛的動人冒險。',
          textEn: 'The Little Prince leaves his asteroid B-612 and meets a golden glowing fox in the vast galaxy, discovering the true secret of friendship.',
          vocabs: [
            { word: 'Asteroid', phonetic: '/ˈæstərɔɪd/', translation: '小行星', definition: '在太空中圍繞太陽運行的岩石小天體', exampleSentence: 'The Little Prince lived on a tiny asteroid.' },
            { word: 'Friendship', phonetic: '/ˈfrendʃɪp/', translation: '友誼', definition: '朋友之間的深厚信任與情感', exampleSentence: 'Friendship takes time and care to grow.' },
            { word: 'Tame', phonetic: '/teɪm/', translation: '馴服、建立連結', definition: '彼此產生獨一無二的羈絆', exampleSentence: 'To tame someone means to create ties.' },
          ],
          themeMood: 'starry',
          moralInsight: '只有用心才能看清楚，真正重要的東西用肉眼是看不見的。',
        },
        {
          id: 'demo_slide_2',
          bookId: 'b_demo_1',
          bookTitleZh: '小熊的魔法花園',
          bookTitleEn: 'Little Bear\'s Magic Garden',
          author: '星光插畫家',
          category: '自然與成長',
          originCountry: '英國',
          flag: '🇬🇧',
          pageNumber: 2,
          totalPages: 4,
          illustrationUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=1200&auto=format&fit=crop',
          textZh: '在晨曦的微光中，小熊發現了魔法種子在泥土裡悄悄探出嫩綠的嫩芽，每澆一次水，花瓣就會變換出彩虹般的奇妙顏色。',
          textEn: 'In the morning light, Little Bear discovered the magic seeds sprouting green buds, glowing in rainbow colors.',
          vocabs: [
            { word: 'Sprout', phonetic: '/spraʊt/', translation: '發芽、萌芽', definition: '種子破土而出長出小葉子', exampleSentence: 'The little green seed began to sprout.' },
            { word: 'Rainbow', phonetic: '/ˈreɪnboʊ/', translation: '彩虹', definition: '天空中七彩絢麗的光弧', exampleSentence: 'The flowers bloomed like a bright rainbow.' },
            { word: 'Patience', phonetic: '/ˈpeɪʃns/', translation: '耐心', definition: '願意安靜等待美好結果的毅力', exampleSentence: 'Gardening teaches us great patience.' },
          ],
          themeMood: 'forest',
          moralInsight: '美好的成果需要用耐心與愛心慢慢灌溉，等待生命的奇蹟綻放。',
        },
        {
          id: 'demo_slide_3',
          bookId: 'b_demo_2',
          bookTitleZh: '深海鯨魚與小銀舟',
          bookTitleEn: 'The Deep Ocean Whale & Silver Boat',
          author: '海洋探索隊',
          category: '冒險與生態',
          originCountry: '挪威',
          flag: '🇳🇴',
          pageNumber: 3,
          totalPages: 5,
          illustrationUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200&auto=format&fit=crop',
          textZh: '蔚藍的深海中，巨大的鯨魚用溫柔悠揚的歌聲引領著小銀舟穿越迷霧珊瑚礁，找回通往星光港灣的安全航道。',
          textEn: 'In the deep blue sea, the giant whale sang a gentle song, guiding the silver boat through the coral reef to the starry harbor.',
          vocabs: [
            { word: 'Whale', phonetic: '/weɪl/', translation: '鯨魚', definition: '海洋中體型龐大且智慧溫和的哺乳動物', exampleSentence: 'The blue whale is the largest animal.' },
            { word: 'Harbor', phonetic: '/ˈhɑːrbər/', translation: '港灣、避風港', definition: '船隻停泊避風的安全港口', exampleSentence: 'The boat safely reached the peaceful harbor.' },
            { word: 'Navigate', phonetic: '/ˈnævɪɡeɪt/', translation: '導航、航行', definition: '引導船隻安全通過海路', exampleSentence: 'The stars helped them navigate in the dark.' },
          ],
          themeMood: 'ocean',
          moralInsight: '學會傾聽大自然的聲音，互相信任能幫助我們度過所有風浪。',
        },
      ];
    }

    return slides;
  }, [targetBooks]);

  // Gallery View Mode: 'cinema' (Slideshow Player) vs 'artwall' (Grid Gallery)
  const [viewMode, setViewMode] = useState<'cinema' | 'artwall'>('cinema');

  // Selected Book Filter for Gallery
  const [selectedBookFilter, setSelectedBookFilter] = useState<string>('all');

  // Active Slide Index
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);

  // Filtered Slides
  const filteredSlides = useMemo(() => {
    if (selectedBookFilter === 'all') return allSlides;
    return allSlides.filter((s) => s.bookId === selectedBookFilter);
  }, [allSlides, selectedBookFilter]);

  // Ensure currentSlideIndex is valid when filteredSlides change
  useEffect(() => {
    if (currentSlideIndex >= filteredSlides.length) {
      setCurrentSlideIndex(0);
    }
  }, [filteredSlides.length, currentSlideIndex]);

  const activeSlide: GallerySlideItem | undefined = filteredSlides[currentSlideIndex] || filteredSlides[0] || allSlides[0];

  // Slideshow Playing State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [intervalSec, setIntervalSec] = useState<number>(6); // 3s, 6s, 10s
  const [isLooping, setIsLooping] = useState<boolean>(true);

  // Dynamic Visual Effects (動態特效)
  const [fxKenBurns, setFxKenBurns] = useState<boolean>(true);
  const [fxParticles, setFxParticles] = useState<boolean>(true);
  const [fxVignette, setFxVignette] = useState<boolean>(true);
  const [frameStyle, setFrameStyle] = useState<'cinema' | 'gold' | 'minimal'>('cinema');

  // Story Narrator (離線故事導讀師) States
  const [narratorRole, setNarratorRole] = useState<VoiceRole>('fairy');
  const [isAutoNarrating, setIsAutoNarrating] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [speechSpeed, setSpeechSpeed] = useState<number>(1.0); // 0.8, 1.0, 1.2

  // Pop-Quiz States (播放中隨機/定時知識小測驗)
  const [isPopQuizActive, setIsPopQuizActive] = useState<boolean>(false);
  const [currentQuiz, setCurrentQuiz] = useState<PopQuizQuestion | null>(null);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [quizResult, setQuizResult] = useState<'correct' | 'wrong' | null>(null);
  const [quizStreak, setQuizStreak] = useState<number>(0);
  const [autoQuizFrequency, setAutoQuizFrequency] = useState<number>(4); // Trigger pop quiz every 4 slides
  const [slidesSinceLastQuiz, setSlidesSinceLastQuiz] = useState<number>(0);

  // Favorited Illustration IDs
  const [favoritedIds, setFavoritedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('pwa_gallery_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Toggle Favorite
  const toggleFavorite = (slideId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    playStarChime();
    const updated = favoritedIds.includes(slideId)
      ? favoritedIds.filter((id) => id !== slideId)
      : [...favoritedIds, slideId];
    setFavoritedIds(updated);
    try {
      localStorage.setItem('pwa_gallery_favorites', JSON.stringify(updated));
    } catch (err) {
      console.warn(err);
    }
  };

  // Narrator Personas
  const NARRATOR_PERSONAS = [
    { role: 'fairy' as VoiceRole, name: '森林童話仙子', avatar: '🧚‍♀️', title: '甜美清亮 ‧ 繪本魔法' },
    { role: 'wizard' as VoiceRole, name: '智慧貓頭鷹博士', avatar: '🦉', title: '睿智導讀 ‧ 啟發思考' },
    { role: 'grandpa' as VoiceRole, name: '星空魔法師', avatar: '🧙‍♂️', title: '磁性溫和 ‧ 沉浸歷險' },
    { role: 'mom' as VoiceRole, name: '親切故事媽媽', avatar: '👩‍👧', title: '溫暖親切 ‧ 陪伴同理' },
    { role: 'robot' as VoiceRole, name: '咕嚕科技機器人', avatar: '🤖', title: '節奏明快 ‧ 生動有趣' },
  ];

  // Helper to generate a Pop Quiz question based on a slide
  const generateQuizForSlide = (slide: GallerySlideItem): PopQuizQuestion => {
    const vocab = slide.vocabs && slide.vocabs.length > 0
      ? slide.vocabs[Math.floor(Math.random() * slide.vocabs.length)]
      : { word: 'Adventure', phonetic: '/ədˈventʃər/', translation: '冒險', definition: '充滿挑戰與新奇的經歷' };

    const wrongTranslations = ['火山', '城堡', '銀河', '彩虹', '微笑', '勇氣', '森林', '星星', '寶石'].filter(
      (w) => w !== vocab.translation
    );

    const shuffledOptions = [
      vocab.translation,
      wrongTranslations[0] || '奇蹟',
      wrongTranslations[1] || '夢想',
      wrongTranslations[2] || '智慧',
    ].sort(() => Math.random() - 0.5);

    const correctIdx = shuffledOptions.indexOf(vocab.translation);

    return {
      id: `quiz_${Date.now()}`,
      question: `【🔤 雙語生字小考】在《${slide.bookTitleZh}》第 ${slide.pageNumber} 頁中，單字「${vocab.word}」(${vocab.phonetic}) 的正確中文釋義是什麼？`,
      options: shuffledOptions,
      correctIndex: correctIdx,
      explanation: `「${vocab.word}」的意思是「${vocab.translation}」！${vocab.definition ? `（${vocab.definition}）` : ''}${vocab.exampleSentence ? ` 例句：${vocab.exampleSentence}` : ''}`,
      rewardCrystals: 30,
      vocabTarget: vocab,
    };
  };

  // Manual Trigger Pop-Quiz
  const handleTriggerPopQuiz = () => {
    if (!activeSlide) return;
    playStarChime();
    setIsPlaying(false);
    const quiz = generateQuizForSlide(activeSlide);
    setCurrentQuiz(quiz);
    setSelectedOptionIndex(null);
    setQuizResult(null);
    setIsPopQuizActive(true);

    // Speak quiz question
    speakText(`插畫小測驗來囉！請聽題目：${quiz.question}`, 'zh-TW', 1.0, narratorRole);
  };

  // Submit Answer
  const handleAnswerQuiz = (optIdx: number) => {
    if (selectedOptionIndex !== null || !currentQuiz) return;
    setSelectedOptionIndex(optIdx);

    if (optIdx === currentQuiz.correctIndex) {
      playStarChime();
      setQuizResult('correct');
      setQuizStreak((prev) => prev + 1);

      if (onAddCrystals) {
        onAddCrystals(currentQuiz.rewardCrystals);
      }

      speakText(
        `太棒了！答對了！恭喜獲得 ${currentQuiz.rewardCrystals} 顆知識水晶！${currentQuiz.explanation}`,
        'zh-TW',
        1.0,
        narratorRole
      );
    } else {
      setQuizResult('wrong');
      setQuizStreak(0);
      speakText(`別灰心，正確答案是「${currentQuiz.options[currentQuiz.correctIndex]}」喔！一起記下來吧！`, 'zh-TW', 1.0, narratorRole);
    }
  };

  // Resume slideshow from quiz
  const handleCloseQuizAndResume = () => {
    setIsPopQuizActive(false);
    setCurrentQuiz(null);
    setSelectedOptionIndex(null);
    setQuizResult(null);
    setSlidesSinceLastQuiz(0);
    setIsPlaying(true);
  };

  // Speak Current Slide Text
  const handleSpeakCurrentSlide = () => {
    if (!activeSlide) return;
    playStarChime();
    setIsSpeaking(true);

    const childName = userProfile?.name || '小讀者';
    const textToSpeak = `《${activeSlide.bookTitleZh}》第 ${activeSlide.pageNumber} 頁：${activeSlide.textZh}。導讀師小啟發：${activeSlide.moralInsight}`;

    speakText(
      textToSpeak,
      'zh-TW',
      speechSpeed,
      narratorRole,
      1.0,
      () => setIsSpeaking(false)
    );
  };

  // Speak Single Vocabulary Word
  const handleSpeakVocabWord = (vocab: VocabItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    playStarChime();
    const textToSpeak = `${vocab.word}。${vocab.translation}。${vocab.definition || ''}`;
    speakText(textToSpeak, 'zh-TW', 1.0, narratorRole);
  };

  // Advance Slide Helper
  const goToNextSlide = () => {
    if (filteredSlides.length === 0) return;
    playPageTurnSound();
    setCurrentSlideIndex((prev) => {
      if (prev + 1 >= filteredSlides.length) {
        return isLooping ? 0 : prev;
      }
      return prev + 1;
    });

    // Track for auto-quiz
    setSlidesSinceLastQuiz((prev) => {
      const nextCount = prev + 1;
      if (nextCount >= autoQuizFrequency) {
        setTimeout(() => {
          handleTriggerPopQuiz();
        }, 800);
        return 0;
      }
      return nextCount;
    });
  };

  const goToPrevSlide = () => {
    if (filteredSlides.length === 0) return;
    playPageTurnSound();
    setCurrentSlideIndex((prev) => {
      if (prev - 1 < 0) {
        return isLooping ? filteredSlides.length - 1 : 0;
      }
      return prev - 1;
    });
  };

  // Slideshow Auto-play Timer Effect
  useEffect(() => {
    let timer: any = null;
    if (isPlaying && !isPopQuizActive && filteredSlides.length > 1) {
      timer = setInterval(() => {
        goToNextSlide();
      }, intervalSec * 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying, intervalSec, isPopQuizActive, isLooping, filteredSlides.length, autoQuizFrequency]);

  // Auto-narrate on slide change if enabled
  useEffect(() => {
    if (isAutoNarrating && activeSlide && !isPopQuizActive) {
      const textToSpeak = `${activeSlide.textZh}`;
      speakText(textToSpeak, 'zh-TW', speechSpeed, narratorRole);
    }
  }, [currentSlideIndex, isAutoNarrating]);

  return (
    <div className="space-y-6 animate-fadeIn select-none">
      {/* 🌟 1. GALLERY HEADER & CONTROL BAR */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-slate-950 via-purple-950/70 to-slate-950 border-2 border-purple-400/60 shadow-2xl space-y-4 relative overflow-hidden">
        {/* Glow ambient backlights */}
        <div className="absolute top-0 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-amber-500 flex items-center justify-center text-3xl shadow-xl border-2 border-purple-300 animate-bounce shrink-0">
              🖼️
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg sm:text-xl font-black text-purple-200 flex items-center gap-2">
                  <span>離線繪本畫廊 & 幻燈片播放廳</span>
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-purple-900/80 text-purple-300 border border-purple-400/50 flex items-center gap-1">
                  <Film className="w-3 h-3 text-purple-400" />
                  <span>動態視覺特效 + 隨機知識小考</span>
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-400/40">
                  🎙️ 離線故事導讀師
                </span>
              </div>
              <p className="text-xs font-bold text-slate-300 mt-1 leading-relaxed">
                將已完成的繪本插圖以電影級幻燈片播放，伴隨微縮放特效與動態光暈，並在放映時隨機彈出生字小測驗！
              </p>
            </div>
          </div>

          {/* Quick Toolbar */}
          <div className="flex items-center gap-2.5 flex-wrap self-start lg:self-auto">
            {/* View Mode Switcher */}
            <div className="flex items-center bg-slate-900/90 p-1 rounded-2xl border border-purple-500/40 shadow-md">
              <button
                onClick={() => {
                  playPageTurnSound();
                  setViewMode('cinema');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'cinema'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Film className="w-3.5 h-3.5" />
                <span>電影播放廳</span>
              </button>
              <button
                onClick={() => {
                  playPageTurnSound();
                  setViewMode('artwall');
                  setIsPlaying(false);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'artwall'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Grid className="w-3.5 h-3.5" />
                <span>全景插畫牆</span>
              </button>
            </div>

            {/* Manual Quiz Trigger */}
            <button
              onClick={handleTriggerPopQuiz}
              className="px-3.5 py-2 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:brightness-110 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-lg transition-transform hover:scale-105 cursor-pointer ring-2 ring-amber-300"
            >
              <Zap className="w-4 h-4 text-slate-950" />
              <span>⚡ 隨機插畫知識測驗</span>
            </button>
          </div>
        </div>

        {/* Filter bar: Book Selector & Narrator Persona Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-purple-500/30 relative z-10">
          {/* Book Filter */}
          <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1">
            <span className="text-xs font-bold text-slate-400 shrink-0 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-purple-400" />
              <span>篩選繪本：</span>
            </span>

            <button
              onClick={() => {
                playPageTurnSound();
                setSelectedBookFilter('all');
              }}
              className={`px-3 py-1 rounded-xl text-xs font-black whitespace-nowrap transition-all cursor-pointer ${
                selectedBookFilter === 'all'
                  ? 'bg-purple-500 text-white shadow'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              全部已下載繪本 ({allSlides.length} 張插圖)
            </button>

            {targetBooks.map((b) => {
              const bTitle = typeof b.title === 'string' ? b.title : (b.title['zh-TW'] || b.title.en || '繪本');
              const isSelected = selectedBookFilter === b.id;
              return (
                <button
                  key={b.id}
                  onClick={() => {
                    playPageTurnSound();
                    setSelectedBookFilter(b.id);
                  }}
                  className={`px-3 py-1 rounded-xl text-xs font-black whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-purple-500 text-white shadow'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {bTitle}
                </button>
              );
            })}
          </div>

          {/* Narrator Persona selector */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-bold text-amber-300 flex items-center gap-1">
              <span>導讀師：</span>
            </span>
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
              {NARRATOR_PERSONAS.map((p) => {
                const isSelected = narratorRole === p.role;
                return (
                  <button
                    key={p.role}
                    onClick={() => {
                      playStarChime();
                      setNarratorRole(p.role);
                      speakText(`我是你的故事導讀師：${p.name}！很高興為你導讀繪本插畫！`, 'zh-TW', 1.0, p.role);
                    }}
                    title={`${p.name} (${p.title})`}
                    className={`p-1.5 rounded-lg text-sm transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-400 text-slate-950 scale-110 shadow'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <span>{p.avatar}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 🎬 2. VIEW MODE A: CINEMA SLIDESHOW PLAYER */}
      {viewMode === 'cinema' && activeSlide && (
        <div className="space-y-4">
          {/* Main Cinema Player Card */}
          <div className="relative rounded-3xl bg-slate-950 border-2 border-purple-500/40 shadow-2xl overflow-hidden group">
            {/* Dynamic Atmosphere Background Blur */}
            <div
              className={`absolute inset-0 opacity-30 blur-3xl pointer-events-none transition-all duration-1000 ${
                activeSlide.themeMood === 'starry'
                  ? 'bg-indigo-600'
                  : activeSlide.themeMood === 'forest'
                  ? 'bg-emerald-600'
                  : activeSlide.themeMood === 'magic'
                  ? 'bg-purple-600'
                  : activeSlide.themeMood === 'ocean'
                  ? 'bg-cyan-600'
                  : 'bg-amber-600'
              }`}
            />

            {/* Illustration Display Stage */}
            <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] max-h-[520px] bg-slate-950 overflow-hidden flex items-center justify-center">
              {/* Image with Ken Burns Zoom/Pan Animation */}
              <img
                key={activeSlide.id}
                src={activeSlide.illustrationUrl}
                alt={activeSlide.bookTitleZh}
                className={`w-full h-full object-cover select-none transition-all duration-700 ${
                  fxKenBurns ? 'animate-kenBurns' : ''
                }`}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = FALLBACK_ILLUSTRATIONS[0];
                }}
              />

              {/* Magical Particle FX Overlay */}
              {fxParticles && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  <div className="absolute top-1/4 left-1/4 text-xl text-amber-300 animate-ping opacity-75">✨</div>
                  <div className="absolute top-1/3 right-1/4 text-2xl text-purple-300 animate-bounce opacity-80">⭐</div>
                  <div className="absolute bottom-1/4 left-1/3 text-lg text-cyan-300 animate-pulse opacity-70">🌟</div>
                  <div className="absolute top-10 right-10 text-xl text-yellow-200 animate-spin-slow opacity-60">✨</div>
                </div>
              )}

              {/* Cinema Vignette Gradient Frame */}
              {fxVignette && (
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-slate-950 via-slate-950/20 to-slate-950/60" />
              )}

              {/* Golden Baroque Frame Border (if selected) */}
              {frameStyle === 'gold' && (
                <div className="absolute inset-2 sm:inset-4 border-4 border-amber-400/80 rounded-2xl pointer-events-none shadow-[inset_0_0_20px_rgba(251,191,36,0.5)] flex items-center justify-between p-2">
                  <span className="text-amber-300 text-lg">⚜️</span>
                  <span className="text-amber-300 text-lg">⚜️</span>
                </div>
              )}

              {/* Top Bar on Stage: Book & Page Tag, Favorite Button, Fullscreen Toggle */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2 z-20">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-xl bg-slate-950/80 backdrop-blur-md border border-purple-400/50 text-xs font-black text-purple-200 shadow-lg flex items-center gap-1.5">
                    <span>{activeSlide.flag}</span>
                    <span>{activeSlide.bookTitleZh}</span>
                    <span className="text-amber-300">‧ 第 {activeSlide.pageNumber} / {activeSlide.totalPages} 頁</span>
                  </span>

                  <span className="hidden sm:flex px-2.5 py-1 rounded-xl bg-slate-950/80 backdrop-blur-md border border-slate-800 text-[11px] font-bold text-slate-300">
                    {activeSlide.category}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Favorite button */}
                  <button
                    onClick={(e) => toggleFavorite(activeSlide.id, e)}
                    className={`p-2 rounded-xl backdrop-blur-md border transition-all cursor-pointer ${
                      favoritedIds.includes(activeSlide.id)
                        ? 'bg-rose-500/90 text-white border-rose-300 shadow-lg scale-105'
                        : 'bg-slate-950/80 text-slate-300 border-slate-700 hover:text-white'
                    }`}
                    title="珍藏這幅插畫"
                  >
                    <Heart className={`w-4 h-4 ${favoritedIds.includes(activeSlide.id) ? 'fill-current' : ''}`} />
                  </button>

                  {/* Play/Pause on Stage */}
                  <button
                    onClick={() => {
                      playStarChime();
                      setIsPlaying(!isPlaying);
                    }}
                    className="p-2 rounded-xl bg-slate-950/80 backdrop-blur-md border border-slate-700 text-amber-300 hover:text-white cursor-pointer"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                  </button>
                </div>
              </div>

              {/* Prev / Next Navigation Arrows on Stage */}
              <button
                onClick={goToPrevSlide}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-3 rounded-full bg-slate-950/70 hover:bg-purple-600 backdrop-blur-md text-white border border-slate-700 hover:border-purple-300 transition-all opacity-80 hover:opacity-100 hover:scale-110 z-20 cursor-pointer shadow-xl"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <button
                onClick={goToNextSlide}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-3 rounded-full bg-slate-950/70 hover:bg-purple-600 backdrop-blur-md text-white border border-slate-700 hover:border-purple-300 transition-all opacity-80 hover:opacity-100 hover:scale-110 z-20 cursor-pointer shadow-xl"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              {/* Bottom Caption Overlay */}
              <div className="absolute bottom-0 inset-x-0 p-4 sm:p-6 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent z-20 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <p className="text-xs sm:text-sm font-black text-slate-100 leading-relaxed max-w-3xl drop-shadow-md">
                    {activeSlide.textZh}
                  </p>

                  <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                    <button
                      onClick={handleSpeakCurrentSlide}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md cursor-pointer transition-transform hover:scale-105 ${
                        isSpeaking
                          ? 'bg-rose-500 text-white animate-pulse'
                          : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                      }`}
                    >
                      <Volume2 className={`w-4 h-4 ${isSpeaking ? 'animate-spin' : ''}`} />
                      <span>{isSpeaking ? '導讀中...' : '🎙️ 導讀本頁故事'}</span>
                    </button>
                  </div>
                </div>

                {/* Key Vocabularies Ribbon on this slide */}
                <div className="flex items-center gap-2 flex-wrap pt-1">
                  <span className="text-[11px] font-black text-cyan-300 flex items-center gap-1">
                    <span>🔤 核心生字：</span>
                  </span>
                  {activeSlide.vocabs.map((vocab, vIdx) => (
                    <button
                      key={vIdx}
                      onClick={(e) => handleSpeakVocabWord(vocab, e)}
                      className="px-2.5 py-1 rounded-xl bg-slate-900/90 hover:bg-cyan-500 hover:text-slate-950 border border-cyan-500/40 text-cyan-300 text-[11px] font-black flex items-center gap-1 transition-all cursor-pointer shadow-sm group"
                      title="點擊聽發音與釋義"
                    >
                      <span>{vocab.word}</span>
                      <span className="text-[10px] text-slate-400 group-hover:text-slate-900 font-normal">
                        ({vocab.translation})
                      </span>
                      <Volume2 className="w-3 h-3 text-cyan-400 group-hover:text-slate-950" />
                    </button>
                  ))}

                  {/* Moral Insight pill */}
                  <span className="px-2.5 py-1 rounded-xl bg-amber-950/80 border border-amber-500/40 text-amber-300 text-[10px] font-black flex items-center gap-1 ml-auto">
                    <span>💡 故事啟發：</span>
                    <span className="truncate max-w-[200px] sm:max-w-none">{activeSlide.moralInsight}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Slideshow Control Panel Bar */}
            <div className="p-4 bg-slate-900/95 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
              {/* Playback Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={goToPrevSlide}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
                  title="上一張"
                >
                  <SkipBack className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    playStarChime();
                    setIsPlaying(!isPlaying);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-transform hover:scale-105 shadow-md cursor-pointer ${
                    isPlaying
                      ? 'bg-amber-400 text-slate-950'
                      : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                  }`}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                  <span>{isPlaying ? '暫停播放' : '自動播放幻燈片'}</span>
                </button>

                <button
                  onClick={goToNextSlide}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
                  title="下一張"
                >
                  <SkipForward className="w-4 h-4" />
                </button>

                {/* Speed selector */}
                <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px] font-bold">
                  {[
                    { sec: 3, label: '3s 極速' },
                    { sec: 6, label: '6s 標準' },
                    { sec: 10, label: '10s 慢享' },
                  ].map((spd) => (
                    <button
                      key={spd.sec}
                      onClick={() => {
                        playPageTurnSound();
                        setIntervalSec(spd.sec);
                      }}
                      className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                        intervalSec === spd.sec
                          ? 'bg-purple-500 text-white font-black'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {spd.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Visual FX & Auto-Narrate Toggles */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Ken Burns Toggle */}
                <button
                  onClick={() => setFxKenBurns(!fxKenBurns)}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                    fxKenBurns
                      ? 'bg-purple-500/20 text-purple-300 border-purple-400/50'
                      : 'bg-slate-950 text-slate-500 border-slate-800'
                  }`}
                  title="微縮放運鏡動態特效"
                >
                  <span>🎥 縮放運鏡: {fxKenBurns ? '開' : '關'}</span>
                </button>

                {/* Star Particles Toggle */}
                <button
                  onClick={() => setFxParticles(!fxParticles)}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                    fxParticles
                      ? 'bg-amber-500/20 text-amber-300 border-amber-400/50'
                      : 'bg-slate-950 text-slate-500 border-slate-800'
                  }`}
                  title="星光粒子動態特效"
                >
                  <span>✨ 星光粒子: {fxParticles ? '開' : '關'}</span>
                </button>

                {/* Auto Narrate Toggle */}
                <button
                  onClick={() => {
                    playStarChime();
                    setIsAutoNarrating(!isAutoNarrating);
                  }}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-black border transition-all cursor-pointer flex items-center gap-1 ${
                    isAutoNarrating
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/50'
                      : 'bg-slate-950 text-slate-500 border-slate-800'
                  }`}
                  title="換頁時自動用語音朗讀"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>自動語音導讀: {isAutoNarrating ? 'ON' : 'OFF'}</span>
                </button>

                {/* Jump to Full Story Book */}
                {onSelectBook && (
                  <button
                    onClick={() => {
                      playPageTurnSound();
                      onSelectBook(activeSlide.bookId);
                      if (onCloseParent) onCloseParent();
                    }}
                    className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-slate-200 text-xs font-black transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>進入完整繪本閱讀</span>
                  </button>
                )}
              </div>
            </div>

            {/* Thumbnail Filmstrip (底片縮圖膠卷) */}
            <div className="p-3 bg-slate-950/90 border-t border-slate-800/80 overflow-x-auto custom-scrollbar flex items-center gap-2.5">
              {filteredSlides.map((slide, idx) => {
                const isActive = idx === currentSlideIndex;
                return (
                  <button
                    key={slide.id}
                    onClick={() => {
                      playPageTurnSound();
                      setCurrentSlideIndex(idx);
                    }}
                    className={`relative w-20 h-14 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                      isActive
                        ? 'border-purple-400 ring-2 ring-purple-400 scale-105 shadow-lg'
                        : 'border-slate-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={slide.illustrationUrl}
                      alt={`P.${slide.pageNumber}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = FALLBACK_ILLUSTRATIONS[0];
                      }}
                    />
                    <div className="absolute bottom-0 inset-x-0 bg-slate-950/80 text-[9px] font-bold text-center text-slate-200 py-0.5">
                      P.{slide.pageNumber}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 🖼️ 3. VIEW MODE B: ART WALL / PANORAMIC GRID GALLERY */}
      {viewMode === 'artwall' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h4 className="text-sm font-black text-purple-300 flex items-center gap-2">
              <Grid className="w-4 h-4 text-purple-400" />
              <span>全景插畫藝術牆 ({filteredSlides.length} 幅插圖)</span>
            </h4>
            <span className="text-xs font-bold text-slate-400">
              點擊任一插圖可進入劇院大螢幕播放或聆聽導讀
            </span>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSlides.map((slide, idx) => {
              const isFav = favoritedIds.includes(slide.id);
              return (
                <div
                  key={slide.id}
                  onClick={() => {
                    playPageTurnSound();
                    setCurrentSlideIndex(idx);
                    setViewMode('cinema');
                  }}
                  className="p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800 hover:border-purple-400 transition-all hover:scale-[1.02] cursor-pointer flex flex-col justify-between space-y-3 group shadow-xl"
                >
                  <div className="space-y-2">
                    {/* Illustration Preview */}
                    <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-slate-900 border border-slate-800">
                      <img
                        src={slide.illustrationUrl}
                        alt={slide.bookTitleZh}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = FALLBACK_ILLUSTRATIONS[0];
                        }}
                      />

                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded-lg bg-slate-950/80 backdrop-blur-md text-[10px] font-black text-purple-300 border border-purple-500/30">
                        {slide.bookTitleZh} P.{slide.pageNumber}
                      </div>

                      <button
                        onClick={(e) => toggleFavorite(slide.id, e)}
                        className={`absolute top-2 right-2 p-1.5 rounded-lg backdrop-blur-md transition-all cursor-pointer ${
                          isFav
                            ? 'bg-rose-500 text-white'
                            : 'bg-slate-950/70 text-slate-300 hover:text-white'
                        }`}
                      >
                        <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-current' : ''}`} />
                      </button>
                    </div>

                    {/* Text summary */}
                    <p className="text-xs font-bold text-slate-300 line-clamp-2 leading-relaxed">
                      {slide.textZh}
                    </p>
                  </div>

                  {/* Footer Vocab Tags & Action */}
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                    <div className="flex items-center gap-1 flex-wrap max-w-[70%]">
                      {slide.vocabs.slice(0, 2).map((v, vI) => (
                        <span key={vI} className="px-1.5 py-0.5 rounded-md bg-slate-900 text-cyan-300 text-[10px] font-bold border border-slate-800">
                          {v.word}
                        </span>
                      ))}
                    </div>

                    <span className="text-[11px] font-black text-purple-400 group-hover:text-purple-300 flex items-center gap-0.5">
                      <span>播放</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ❓ 4. INTERACTIVE POP-QUIZ MODAL OVERLAY (隨機繪本知識與生字測驗彈窗) */}
      {isPopQuizActive && currentQuiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-lg bg-slate-900 border-2 border-amber-400/80 rounded-3xl p-6 shadow-2xl space-y-5 relative">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-xl bg-amber-500/20 text-amber-300 text-xs font-black border border-amber-400/40 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  <span>繪本知識隨機小測驗</span>
                </span>
                {quizStreak > 0 && (
                  <span className="px-2 py-0.5 rounded-lg bg-rose-500/20 text-rose-300 text-[10px] font-black border border-rose-400/40">
                    🔥 連續答對 {quizStreak} 題
                  </span>
                )}
              </div>

              <button
                onClick={handleCloseQuizAndResume}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Narrator Prompt Box */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/60 to-slate-950 border border-purple-500/40 flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-3xl shrink-0">
                {NARRATOR_PERSONAS.find((p) => p.role === narratorRole)?.avatar || '🧚‍♀️'}
              </div>
              <div>
                <h5 className="text-xs font-black text-purple-300">
                  {NARRATOR_PERSONAS.find((p) => p.role === narratorRole)?.name} 的插畫隨機抽考
                </h5>
                <p className="text-xs font-bold text-slate-200 mt-0.5">
                  一邊欣賞美麗繪本插畫，一邊動動腦複習故事關鍵字詞吧！
                </p>
              </div>
            </div>

            {/* Question Text */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <h4 className="text-sm sm:text-base font-black text-amber-300 leading-relaxed">
                {currentQuiz.question}
              </h4>
            </div>

            {/* 4 Interactive Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentQuiz.options.map((opt, optIdx) => {
                const isSelected = selectedOptionIndex === optIdx;
                const isCorrect = optIdx === currentQuiz.correctIndex;
                const showFeedback = selectedOptionIndex !== null;

                let btnStyle = 'bg-slate-950 border-slate-800 hover:border-purple-400 text-slate-200';
                if (showFeedback) {
                  if (isCorrect) {
                    btnStyle = 'bg-emerald-950/80 border-emerald-400 text-emerald-300 shadow-emerald-500/20 shadow-lg';
                  } else if (isSelected) {
                    btnStyle = 'bg-rose-950/80 border-rose-400 text-rose-300';
                  } else {
                    btnStyle = 'bg-slate-950/50 border-slate-800 opacity-50 text-slate-400';
                  }
                }

                return (
                  <button
                    key={optIdx}
                    onClick={() => handleAnswerQuiz(optIdx)}
                    disabled={selectedOptionIndex !== null}
                    className={`p-3.5 rounded-2xl border-2 font-black text-xs sm:text-sm text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${btnStyle}`}
                  >
                    <span>{opt}</span>
                    {showFeedback && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
                    {showFeedback && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-rose-400 shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Quiz Result Feedback & Explanation */}
            {quizResult && (
              <div
                className={`p-4 rounded-2xl border space-y-1.5 animate-fadeIn ${
                  quizResult === 'correct'
                    ? 'bg-emerald-950/70 border-emerald-400/70 text-emerald-200'
                    : 'bg-amber-950/70 border-amber-400/70 text-amber-200'
                }`}
              >
                <div className="flex items-center gap-2 font-black text-xs">
                  {quizResult === 'correct' ? (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>🎉 恭喜答對！獲得 +{currentQuiz.rewardCrystals} 顆知識水晶 💎！</span>
                    </>
                  ) : (
                    <>
                      <Smile className="w-4 h-4 text-amber-400" />
                      <span>💡 學習指引：繼續加油！</span>
                    </>
                  )}
                </div>
                <p className="text-xs font-bold text-slate-300 leading-relaxed">
                  {currentQuiz.explanation}
                </p>
              </div>
            )}

            {/* Modal Actions */}
            <div className="pt-2 flex items-center justify-between gap-3">
              <button
                onClick={() => {
                  if (!activeSlide) return;
                  const newQ = generateQuizForSlide(activeSlide);
                  setCurrentQuiz(newQ);
                  setSelectedOptionIndex(null);
                  setQuizResult(null);
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Shuffle className="w-3.5 h-3.5" />
                <span>換一題</span>
              </button>

              <button
                onClick={handleCloseQuizAndResume}
                className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-xs hover:brightness-110 shadow-lg cursor-pointer flex items-center gap-1.5 ml-auto"
              >
                <span>繼續欣賞幻燈片 ▶️</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
