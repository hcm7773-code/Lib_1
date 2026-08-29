import { Book, CollectibleItem } from '../types';

/**
 * Generate thematic digital souvenirs/decorations for a given book when completed.
 */
export function getCollectiblesForBook(book: Book): CollectibleItem[] {
  const dateStr = new Date().toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  const bookId = book.id;
  const bookTitleStr = typeof book.title === 'string' ? book.title : (book.title['zh-TW'] || book.title.en || '經典繪本');

  // Book 1: 小王子
  if (bookId === 'book-1' || bookTitleStr.includes('小王子')) {
    return [
      {
        id: `col-${bookId}-crown`,
        bookId,
        bookTitle: bookTitleStr,
        name: 'B-612 星球玫瑰皇冠',
        icon: '👑',
        category: '👑 皇冠飾品',
        description: '來自小王子 B-612 小行星的精緻純金皇冠，綻放著對獨一無二玫瑰愛的閃耀光芒！',
        earnedAt: dateStr,
        rarity: 'legendary',
        themeColor: 'from-amber-400 to-yellow-500',
      },
      {
        id: `col-${bookId}-sticker`,
        bookId,
        bookTitle: bookTitleStr,
        name: '銀河飛行員夜光貼紙',
        icon: '🌌',
        category: '🌌 奇幻貼紙',
        description: '紀錄小王子穿梭於各大小行星與小狐狸相遇的夜光銀河冒險紀念貼紙。',
        earnedAt: dateStr,
        rarity: 'epic',
        themeColor: 'from-indigo-500 to-purple-600',
      },
    ];
  }

  // Book 2: 醜小鴨
  if (bookId === 'book-2' || bookTitleStr.includes('醜小鴨')) {
    return [
      {
        id: `col-${bookId}-feather`,
        bookId,
        bookTitle: bookTitleStr,
        name: '純白耀眼天鵝金羽毛',
        icon: '🪶',
        category: '🪶 珍稀物件',
        description: '象徵自信蛻變與優雅堅韌的白天鵝純白羽毛，隨風散發出閃耀金光。',
        earnedAt: dateStr,
        rarity: 'epic',
        themeColor: 'from-sky-400 to-blue-600',
      },
      {
        id: `col-${bookId}-badge`,
        bookId,
        bookTitle: bookTitleStr,
        name: '自信蛻變光芒徽章',
        icon: '💎',
        category: '🪄 魔法徽章',
        description: '提醒每個孩子：擁抱獨一無二的自己，內心的善良與自信會讓你成為最美麗的天鵝！',
        earnedAt: dateStr,
        rarity: 'rare',
        themeColor: 'from-teal-400 to-emerald-500',
      },
    ];
  }

  // Book 3: 三隻小豬
  if (bookId === 'book-3' || bookTitleStr.includes('三隻小豬')) {
    return [
      {
        id: `col-${bookId}-shield`,
        bookId,
        bookTitle: bookTitleStr,
        name: '堅固金磚安全盾牌',
        icon: '🧱',
        category: '🪄 魔法徽章',
        description: '用勤勞努力與智慧磚頭築成的堅固盾牌，大野狼吹一百次也吹不倒！',
        earnedAt: dateStr,
        rarity: 'rare',
        themeColor: 'from-orange-500 to-amber-600',
      },
      {
        id: `col-${bookId}-hat`,
        bookId,
        bookTitle: bookTitleStr,
        name: '智慧小豬工匠好棒帽',
        icon: '🐷',
        category: '👑 皇冠飾品',
        description: '戴上這頂腳踏實地的建築師帽子，做事情認真不偷懶，就能創造奇蹟！',
        earnedAt: dateStr,
        rarity: 'common',
        themeColor: 'from-pink-400 to-rose-500',
      },
    ];
  }

  // Book 4: 國王的新衣
  if (bookId === 'book-4' || bookTitleStr.includes('國王的新衣')) {
    return [
      {
        id: `col-${bookId}-honesty-crown`,
        bookId,
        bookTitle: bookTitleStr,
        name: '誠實勇敢水晶皇冠',
        icon: '👑',
        category: '👑 皇冠飾品',
        description: '只有保持誠實無瑕與講真話的勇敢孩子，才能看見這頂極致閃耀的水晶皇冠！',
        earnedAt: dateStr,
        rarity: 'legendary',
        themeColor: 'from-purple-500 to-pink-500',
      },
      {
        id: `col-${bookId}-thread`,
        bookId,
        bookTitle: bookTitleStr,
        name: '魔法金絲線紡織章',
        icon: '👗',
        category: '🪄 魔法徽章',
        description: '織出童心與純真的神奇金絲線，永不褪色。',
        earnedAt: dateStr,
        rarity: 'common',
        themeColor: 'from-amber-300 to-yellow-400',
      },
    ];
  }

  // Book 5: 愛麗絲夢遊仙境
  if (bookId === 'book-5' || bookTitleStr.includes('愛麗絲') || bookTitleStr.includes('仙境')) {
    return [
      {
        id: `col-${bookId}-hat`,
        bookId,
        bookTitle: bookTitleStr,
        name: '懷錶白兔時空紳士高帽',
        icon: '🎩',
        category: '👑 皇冠飾品',
        description: '穿梭神奇顛倒仙境的夢幻高帽，點一下還會滴答滴答跳出神奇兔子！',
        earnedAt: dateStr,
        rarity: 'legendary',
        themeColor: 'from-rose-500 to-violet-600',
      },
      {
        id: `col-${bookId}-key`,
        bookId,
        bookTitle: bookTitleStr,
        name: '奇幻仙境黃金鑰匙',
        icon: '🗝️',
        category: '🪶 珍稀物件',
        description: '解開好奇心與無邊想像力大門的魔法鑰匙，開啟無限探索之旅。',
        earnedAt: dateStr,
        rarity: 'epic',
        themeColor: 'from-amber-400 to-orange-500',
      },
    ];
  }

  // Book 9: 賣火柴的小女孩
  if (bookId === 'book-9' || bookTitleStr.includes('賣火柴') || bookTitleStr.includes('Match Girl')) {
    return [
      {
        id: `col-${bookId}-flame`,
        bookId,
        bookTitle: bookTitleStr,
        name: '溫暖守護金光火柴燭',
        icon: '🕯️',
        category: '🪄 魔法徽章',
        description: '燃燒著愛與希望的神奇金光小燭火，隨時隨地為心靈帶來融融暖意與光明！',
        earnedAt: dateStr,
        rarity: 'legendary',
        themeColor: 'from-amber-400 to-orange-500',
      },
      {
        id: `col-${bookId}-star`,
        bookId,
        bookTitle: bookTitleStr,
        name: '除夕夜空璀璨流星石',
        icon: '✨',
        category: '🪶 珍稀物件',
        description: '乘載著溫柔慈祥祖母之愛的夜空流星結晶，綻放著永恆守護的柔美光芒。',
        earnedAt: dateStr,
        rarity: 'epic',
        themeColor: 'from-yellow-300 to-amber-500',
      },
    ];
  }

  // Book 10: 快樂王子
  if (bookId === 'book-10' || bookTitleStr.includes('快樂王子') || bookTitleStr.includes('Happy Prince')) {
    return [
      {
        id: `col-${bookId}-heart`,
        bookId,
        bookTitle: bookTitleStr,
        name: '真摯無私純金鉛心',
        icon: '💖',
        category: '🪶 珍稀物件',
        description: '象徵最高貴的無私奉獻之愛，即使歷經歲月也永遠不滅的天使珍寶！',
        earnedAt: dateStr,
        rarity: 'legendary',
        themeColor: 'from-rose-400 to-amber-400',
      },
      {
        id: `col-${bookId}-ruby`,
        bookId,
        bookTitle: bookTitleStr,
        name: '善良燕子紅寶石羽',
        icon: '💎',
        category: '🪄 魔法徽章',
        description: '從小燕子與快樂王子寶劍上取下的紅寶石光輝，見證了最純粹的友誼與溫情。',
        earnedAt: dateStr,
        rarity: 'epic',
        themeColor: 'from-red-500 to-pink-600',
      },
    ];
  }

  // Book 11: 穿長靴的貓
  if (bookId === 'book-11' || bookTitleStr.includes('長靴') || bookTitleStr.includes('Puss in Boots')) {
    return [
      {
        id: `col-${bookId}-boots`,
        bookId,
        bookTitle: bookTitleStr,
        name: '機智敏捷金扣小皮靴',
        icon: '👢',
        category: '👑 皇冠飾品',
        description: '穿上它步伐輕盈機敏，能在任何險境中靈活化解危機的魔法紳士皮靴！',
        earnedAt: dateStr,
        rarity: 'epic',
        themeColor: 'from-amber-600 to-yellow-600',
      },
    ];
  }

  // Book 12: 木偶奇遇記 / 皮諾丘
  if (bookId === 'book-12' || bookTitleStr.includes('皮諾丘') || bookTitleStr.includes('木偶奇遇記') || bookTitleStr.includes('Pinocchio')) {
    return [
      {
        id: `col-${bookId}-fairy`,
        bookId,
        bookTitle: bookTitleStr,
        name: '藍仙女誠實星光魔杖',
        icon: '🪄',
        category: '🪄 魔法徽章',
        description: '賦予生命與勇氣的神奇星光魔杖，指引每個孩子擁抱誠實、勇敢與孝順的美德！',
        earnedAt: dateStr,
        rarity: 'legendary',
        themeColor: 'from-blue-400 to-indigo-500',
      },
    ];
  }

  // Dynamic Fallback for AI Created Books or Other Titles
  return [
    {
      id: `col-${bookId}-star`,
      bookId,
      bookTitle: bookTitleStr,
      name: `《${bookTitleStr}》童心榮譽紀念星章`,
      icon: '🌟',
      category: '🪄 魔法徽章',
      description: `恭喜讀完《${bookTitleStr}》！這是一枚紀錄你專注閱讀與勇敢探索故事世界的黃金榮譽星章！`,
      earnedAt: dateStr,
      rarity: 'epic',
      themeColor: 'from-amber-400 to-yellow-500',
    },
    {
      id: `col-${bookId}-sticker`,
      bookId,
      bookTitle: bookTitleStr,
      name: `《${bookTitleStr}》故事主角彩虹貼紙`,
      icon: '🎨',
      category: '🌌 奇幻貼紙',
      description: `與《${bookTitleStr} stroke》靈感主角歡聚的彩色數位貼紙，已珍藏在你的專屬配件櫃！`,
      earnedAt: dateStr,
      rarity: 'rare',
      themeColor: 'from-pink-400 to-amber-400',
    },
  ];
}

export const INITIAL_DEFAULT_COLLECTIBLES: CollectibleItem[] = [
  {
    id: 'col-book-1-crown',
    bookId: 'book-1',
    bookTitle: '小王子 The Little Prince',
    name: 'B-612 星球玫瑰皇冠',
    icon: '👑',
    category: '👑 皇冠飾品',
    description: '來自小王子 B-612 小行星的精緻純金皇冠，綻放著對獨一無二玫瑰愛的閃耀光芒！',
    earnedAt: '2026/08/01',
    rarity: 'legendary',
    themeColor: 'from-amber-400 to-yellow-500',
  },
  {
    id: 'col-book-1-sticker',
    bookId: 'book-1',
    bookTitle: '小王子 The Little Prince',
    name: '銀河飛行員夜光貼紙',
    icon: '🌌',
    category: '🌌 奇幻貼紙',
    description: '紀錄小王子穿梭於各大小行星與小狐狸相遇的夜光銀河冒險紀念貼紙。',
    earnedAt: '2026/08/01',
    rarity: 'epic',
    themeColor: 'from-indigo-500 to-purple-600',
  },
  {
    id: 'col-book-2-feather',
    bookId: 'book-2',
    bookTitle: '醜小鴨 The Ugly Duckling',
    name: '純白耀眼天鵝金羽毛',
    icon: '🪶',
    category: '🪶 珍稀物件',
    description: '象徵自信蛻變與優雅堅韌的白天鵝純白羽毛，隨風散發出閃耀金光。',
    earnedAt: '2026/08/05',
    rarity: 'epic',
    themeColor: 'from-sky-400 to-blue-600',
  },
];
