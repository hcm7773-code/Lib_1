import { Book, UserProfile, ReadingFocusCategoryMetric, ReadingFocusOverallProfile } from '../types';

export interface FocusSessionLog {
  bookId: string;
  bookTitle: string;
  category: string;
  dwellSecPerPageAvg: number;
  totalPagesRead: number;
  totalTimeSec: number;
  emotionTrack: string;
  paceScore: number;
  timestamp: string;
}

const FOCUS_STORAGE_KEY = 'pwa_reading_focus_sessions_log';

export function recordFocusSession(log: FocusSessionLog) {
  try {
    const saved = localStorage.getItem(FOCUS_STORAGE_KEY);
    const list: FocusSessionLog[] = saved ? JSON.parse(saved) : [];
    list.unshift(log);
    // Keep last 50 session logs
    localStorage.setItem(FOCUS_STORAGE_KEY, JSON.stringify(list.slice(0, 50)));
  } catch (e) {
    console.error('Failed to record focus session', e);
  }
}

export function getFocusSessionLogs(): FocusSessionLog[] {
  try {
    const saved = localStorage.getItem(FOCUS_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error(e);
  }
  return [];
}

const CATEGORY_CONFIGS: {
  category: string;
  categoryLabel: string;
  icon: string;
  color: string;
  primaryEmotion: string;
  primaryEmotionEmoji: string;
  traitName: string;
  traitDescription: string;
  recommendation: string;
}[] = [
  {
    category: 'Adventure',
    categoryLabel: '冒險探索',
    icon: '🛡️',
    color: '#F97316', // Orange
    primaryEmotion: '勇氣與期待',
    primaryEmotionEmoji: '🔥',
    traitName: '勇敢探險家',
    traitDescription: '在緊湊的情節轉折中保持極高專注，翻頁敏捷且專注於解謎與突破考驗。',
    recommendation: '適合提供具備多章節探索與地圖解密的情節繪本，滿足冒險渴望。',
  },
  {
    category: 'Fairy Tale',
    categoryLabel: '童話奇幻',
    icon: '🏰',
    color: '#A855F7', // Purple
    primaryEmotion: '驚奇與想像',
    primaryEmotionEmoji: '✨',
    traitName: '奇幻造夢師',
    traitDescription: '對天馬行空的魔法場景與童話角色展現高昂好奇心，情緒沉浸極深。',
    recommendation: '推薦搭配多語音角色切換與隱藏彩蛋，進一步點燃孩子想像力。',
  },
  {
    category: 'Nature & Science',
    categoryLabel: '自然科普',
    icon: '🌿',
    color: '#10B981', // Emerald
    primaryEmotion: '求知與專注',
    primaryEmotionEmoji: '🔬',
    traitName: '科學微觀家',
    traitDescription: '翻頁停留時間較長，仔細觀察圖解細節與雙語知識生字，思考縝密。',
    recommendation: '可多引導雙語詞彙點讀與百科知識問答，強化科學邏輯探究。',
  },
  {
    category: 'Friendship & Love',
    categoryLabel: '友誼溫馨',
    icon: '❤️',
    color: '#EC4899', // Pink
    primaryEmotion: '溫暖同理心',
    primaryEmotionEmoji: '🥰',
    traitName: '暖心共鳴者',
    traitDescription: '翻頁節奏平穩溫柔，對角色之間的情感交流與互助場景共鳴度最高。',
    recommendation: '極度推薦睡前共讀或搭配柔和旋律，增進親子親密對話與同理心。',
  },
  {
    category: 'Moral & Wisdom',
    categoryLabel: '寓言哲理',
    icon: '🦊',
    color: '#EAB308', // Amber
    primaryEmotion: '思維啟發',
    primaryEmotionEmoji: '💡',
    traitName: '哲思領航者',
    traitDescription: '在故事結尾或寓意轉折處常有深度沉思，能將情節與日常生活做聯想。',
    recommendation: '建議在共讀後拋出開放式啟發問題，讓孩子表達自己的觀點。',
  },
  {
    category: 'Culture & Heritage',
    categoryLabel: '世界文化',
    icon: '🌍',
    color: '#06B6D4', // Cyan
    primaryEmotion: '多元包容',
    primaryEmotionEmoji: '🌟',
    traitName: '寰宇小公民',
    traitDescription: '對世界各國的風俗、建築與語言充滿好奇，具備多元文化視野。',
    recommendation: '可多開啟時空地圖探索不同國家的典藏故事與雙語背景。',
  },
];

export function calculateReadingFocusProfile(
  books: Book[],
  userProfile?: UserProfile
): ReadingFocusOverallProfile {
  const sessionLogs = getFocusSessionLogs();
  const readBookIds = userProfile?.readBookIds || [];
  const totalMins = userProfile?.readingMinutes || 45;

  // Compute metrics per category
  const categoryMetrics: ReadingFocusCategoryMetric[] = CATEGORY_CONFIGS.map((cfg, index) => {
    // Find books in this category
    const catBooks = books.filter(
      (b) => b.category === cfg.category || (cfg.category === 'Adventure' && b.category === 'Adventure')
    );
    const catReadBooks = catBooks.filter((b) => readBookIds.includes(b.id));
    const logsForCategory = sessionLogs.filter((l) => l.category === cfg.category);

    // Calculate baseline + dynamic variables based on reading history
    let focusScore = 75;
    let emotionEngagement = 80;
    let pageTurnPaceScore = 78;
    let avgDwellSecPerPage = 22;
    let categoryTimeMins = Math.round(totalMins * (0.12 + (index % 3) * 0.05));

    if (logsForCategory.length > 0) {
      const avgPace = logsForCategory.reduce((acc, l) => acc + (l.paceScore || 75), 0) / logsForCategory.length;
      const avgDwell = logsForCategory.reduce((acc, l) => acc + (l.dwellSecPerPageAvg || 20), 0) / logsForCategory.length;
      focusScore = Math.min(98, Math.round(avgPace * 0.5 + (avgDwell >= 15 ? 40 : 25)));
      emotionEngagement = Math.min(96, Math.round(75 + logsForCategory.length * 4));
      pageTurnPaceScore = Math.min(95, Math.round(avgPace));
      avgDwellSecPerPage = Math.round(avgDwell);
      categoryTimeMins = Math.round(logsForCategory.reduce((acc, l) => acc + l.totalTimeSec, 0) / 60) || categoryTimeMins;
    } else {
      // Natural variation if no specific logs yet
      const baseVariation = (index * 7 + (catReadBooks.length * 8)) % 25;
      if (cfg.category === 'Adventure') {
        focusScore = 88 + (catReadBooks.length * 3);
        emotionEngagement = 92;
        pageTurnPaceScore = 86;
        avgDwellSecPerPage = 18;
      } else if (cfg.category === 'Nature & Science') {
        focusScore = 92 + (catReadBooks.length * 2);
        emotionEngagement = 85;
        pageTurnPaceScore = 90;
        avgDwellSecPerPage = 28;
      } else if (cfg.category === 'Moral & Wisdom') {
        focusScore = 86 + baseVariation;
        emotionEngagement = 88;
        pageTurnPaceScore = 82;
        avgDwellSecPerPage = 25;
      } else if (cfg.category === 'Fairy Tale') {
        focusScore = 90;
        emotionEngagement = 95;
        pageTurnPaceScore = 85;
        avgDwellSecPerPage = 20;
      } else if (cfg.category === 'Friendship & Love') {
        focusScore = 85;
        emotionEngagement = 94;
        pageTurnPaceScore = 88;
        avgDwellSecPerPage = 24;
      } else {
        focusScore = 82 + baseVariation;
        emotionEngagement = 80;
        pageTurnPaceScore = 79;
        avgDwellSecPerPage = 21;
      }
    }

    focusScore = Math.min(99, Math.max(50, focusScore));
    emotionEngagement = Math.min(99, Math.max(50, emotionEngagement));
    pageTurnPaceScore = Math.min(99, Math.max(50, pageTurnPaceScore));

    return {
      category: cfg.category,
      categoryLabel: cfg.categoryLabel,
      icon: cfg.icon,
      color: cfg.color,
      focusScore,
      emotionEngagement,
      pageTurnPaceScore,
      avgDwellSecPerPage,
      totalTimeMinutes: categoryTimeMins,
      booksCount: catBooks.length,
      primaryEmotion: cfg.primaryEmotion,
      primaryEmotionEmoji: cfg.primaryEmotionEmoji,
      traitName: cfg.traitName,
      traitDescription: cfg.traitDescription,
      recommendation: cfg.recommendation,
    };
  });

  // Calculate Overall Focus Index
  const overallFocusIndex = Math.round(
    categoryMetrics.reduce((acc, m) => acc + m.focusScore, 0) / categoryMetrics.length
  );

  // Find dominant category
  const sortedByFocus = [...categoryMetrics].sort((a, b) => b.focusScore - a.focusScore);
  const dominant = sortedByFocus[0] || categoryMetrics[0];

  let dominantTrait = '全域敏銳探索型小博士';
  let dominantTraitDesc = '在各類繪本中均能維持穩定節奏與高昂專注，兼具邏輯推理與情感共鳴能力！';

  if (dominant.category === 'Adventure') {
    dominantTrait = '高能沉浸冒險探索者 🛡️';
    dominantTraitDesc = '面對情節考驗時專注力高度爆發，翻頁精準敏捷，對英雄故事充滿強烈代入感！';
  } else if (dominant.category === 'Nature & Science') {
    dominantTrait = '深度求知科學觀察家 🌿';
    dominantTraitDesc = '翻頁穩定沉著，極度專注於繪本插畫細節、生字解析與科學因果關聯！';
  } else if (dominant.category === 'Fairy Tale') {
    dominantTrait = '天馬行空奇幻造夢者 🏰';
    dominantTraitDesc = '情緒沉浸度極高，對魔法世界與奇趣故事角色具有極致的想像專注力！';
  } else if (dominant.category === 'Moral & Wisdom') {
    dominantTrait = '敏思哲理品格領航員 🦊';
    dominantTraitDesc = '擅長在閱讀過程中反思行為與寓意，專注於品格故事所帶來的深層思考！';
  } else if (dominant.category === 'Friendship & Love') {
    dominantTrait = '溫馨情感深度共鳴者 ❤️';
    dominantTraitDesc = '在共讀與親情友誼情節中展現出高度同理心，情緒波動細膩且安穩！';
  }

  const topStrengths = [
    `在《${dominant.categoryLabel}》類型中專注度高達 ${dominant.focusScore} 分`,
    `平均翻頁節奏保持在每頁 ${dominant.avgDwellSecPerPage} 秒之黃金專注區間`,
    `語音情緒共鳴指數達 ${dominant.emotionEngagement}%，深度沉浸故事世界`,
  ];

  const growthAreas = [
    '可適度增加世界文化與多元民俗類型繪本的閱讀時間',
    '在翻頁節奏較快的故事中，引導停頓觀察生字圖解',
  ];

  return {
    overallFocusIndex,
    dominantTrait,
    dominantTraitDesc,
    dominantCategory: dominant.categoryLabel,
    topStrengths,
    growthAreas,
    bestReadingTimeSlot: '19:30 - 20:30 (黃金睡前深度專注期)',
    recommendedNextCategory: sortedByFocus[sortedByFocus.length - 1]?.categoryLabel || '世界文化',
    categoryMetrics,
  };
}
