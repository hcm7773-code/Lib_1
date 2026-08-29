import { FavoriteTagItem } from '../types';

export const PRESET_FAVORITE_TAGS: FavoriteTagItem[] = [
  {
    id: 'tag-replay',
    name: '百讀不厭',
    icon: '💖',
    color: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/70 dark:text-rose-200 dark:border-rose-700',
    badgeColor: 'bg-rose-500 text-white',
    isPreset: true,
    description: '反覆翻閱、孩子點名率最高的珍愛繪本',
  },
  {
    id: 'tag-bedtime',
    name: '睡前晚安',
    icon: '🌙',
    color: 'bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-950/70 dark:text-indigo-200 dark:border-indigo-700',
    badgeColor: 'bg-indigo-600 text-white',
    isPreset: true,
    description: '溫柔舒緩、適合睡前共讀伴入夢鄉',
  },
  {
    id: 'tag-courage',
    name: '勇氣冒險',
    icon: '🦁',
    color: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/70 dark:text-amber-200 dark:border-amber-700',
    badgeColor: 'bg-amber-600 text-white',
    isPreset: true,
    description: '激發探索精神與克服難關的堅定勇氣',
  },
  {
    id: 'tag-science',
    name: '科普啟蒙',
    icon: '🧠',
    color: 'bg-teal-100 text-teal-800 border-teal-300 dark:bg-teal-950/70 dark:text-teal-200 dark:border-teal-700',
    badgeColor: 'bg-teal-600 text-white',
    isPreset: true,
    description: '啟發自然觀察、太空奧秘與科學好奇心',
  },
  {
    id: 'tag-wisdom',
    name: '寓言品格',
    icon: '🦊',
    color: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-200 dark:border-emerald-700',
    badgeColor: 'bg-emerald-600 text-white',
    isPreset: true,
    description: '培養同理心、誠實分享與良好品格修養',
  },
  {
    id: 'tag-bilingual',
    name: '雙語練習',
    icon: '🗣️',
    color: 'bg-cyan-100 text-cyan-800 border-cyan-300 dark:bg-cyan-950/70 dark:text-cyan-200 dark:border-cyan-700',
    badgeColor: 'bg-cyan-600 text-white',
    isPreset: true,
    description: '生字發音清晰，適合雙語朗讀與口說練習',
  },
  {
    id: 'tag-creativity',
    name: '藝術奇想',
    icon: '🎨',
    color: 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950/70 dark:text-purple-200 dark:border-purple-700',
    badgeColor: 'bg-purple-600 text-white',
    isPreset: true,
    description: '插圖色彩斑斕、激發無限天馬行空的想像',
  },
  {
    id: 'tag-family',
    name: '親情溫馨',
    icon: '👨‍👩‍👧',
    color: 'bg-pink-100 text-pink-800 border-pink-300 dark:bg-pink-950/70 dark:text-pink-200 dark:border-pink-700',
    badgeColor: 'bg-pink-500 text-white',
    isPreset: true,
    description: '傳遞親情關愛與家人間溫暖動人的牽絆',
  },
];

const TAGS_STORAGE_KEY = 'pwa_favorite_tags_list';
const BOOK_TAG_MAPPING_KEY = 'pwa_book_favorite_tag_mappings';

export function getAllFavoriteTags(): FavoriteTagItem[] {
  try {
    const saved = localStorage.getItem(TAGS_STORAGE_KEY);
    if (saved) {
      const parsed: FavoriteTagItem[] = JSON.parse(saved);
      // Merge with presets to ensure preset tags are always available
      const customOnly = parsed.filter((t) => !PRESET_FAVORITE_TAGS.some((p) => p.id === t.id));
      return [...PRESET_FAVORITE_TAGS, ...customOnly];
    }
  } catch (e) {
    console.error('Failed to load favorite tags from localStorage', e);
  }
  return PRESET_FAVORITE_TAGS;
}

export function saveCustomTag(tag: FavoriteTagItem): FavoriteTagItem[] {
  const current = getAllFavoriteTags();
  const index = current.findIndex((t) => t.id === tag.id);
  let updated: FavoriteTagItem[];
  if (index >= 0) {
    updated = current.map((t) => (t.id === tag.id ? tag : t));
  } else {
    updated = [...current, tag];
  }
  try {
    localStorage.setItem(TAGS_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error(e);
  }
  return updated;
}

export function deleteCustomTag(tagId: string): FavoriteTagItem[] {
  const current = getAllFavoriteTags();
  const updated = current.filter((t) => t.id !== tagId);
  try {
    localStorage.setItem(TAGS_STORAGE_KEY, JSON.stringify(updated));
    // Also remove this tag from all book mappings
    const mappings = getAllBookTagMappings();
    let hasChange = false;
    for (const bookId of Object.keys(mappings)) {
      if (mappings[bookId].includes(tagId)) {
        mappings[bookId] = mappings[bookId].filter((id) => id !== tagId);
        hasChange = true;
      }
    }
    if (hasChange) {
      localStorage.setItem(BOOK_TAG_MAPPING_KEY, JSON.stringify(mappings));
    }
  } catch (e) {
    console.error(e);
  }
  return updated;
}

export function getAllBookTagMappings(): Record<string, string[]> {
  try {
    const saved = localStorage.getItem(BOOK_TAG_MAPPING_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load book tag mappings', e);
  }
  // Default sample mappings for popular initial books
  return {
    'book-1': ['tag-replay', 'tag-courage', 'tag-wisdom'],
    'book-2': ['tag-science', 'tag-wisdom'],
    'book-3': ['tag-creativity', 'tag-replay'],
    'book-4': ['tag-bedtime', 'tag-family'],
    'book-5': ['tag-bilingual', 'tag-science'],
  };
}

export function getBookTagIds(bookId: string): string[] {
  const mappings = getAllBookTagMappings();
  return mappings[bookId] || [];
}

export function setBookTagIds(bookId: string, tagIds: string[]): Record<string, string[]> {
  const mappings = getAllBookTagMappings();
  mappings[bookId] = Array.from(new Set(tagIds));
  try {
    localStorage.setItem(BOOK_TAG_MAPPING_KEY, JSON.stringify(mappings));
  } catch (e) {
    console.error(e);
  }
  return mappings;
}

export function toggleBookTag(bookId: string, tagId: string): string[] {
  const currentTags = getBookTagIds(bookId);
  let updated: string[];
  if (currentTags.includes(tagId)) {
    updated = currentTags.filter((t) => t !== tagId);
  } else {
    updated = [...currentTags, tagId];
  }
  setBookTagIds(bookId, updated);
  return updated;
}
