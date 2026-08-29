export type LanguageCode = 'zh-TW' | 'en' | 'ja' | 'fr' | 'es' | 'de' | 'ko' | 'vi';

export interface LanguageOption {
  code: LanguageCode;
  name: string;
  nativeName: string;
  flag: string;
  speechCode: string;
}

export interface VocabItem {
  word: string;
  phonetic: string;
  translation: string;
  definition: string;
  exampleSentence?: string;
}

export interface BookPage {
  pageNumber: number;
  text: Record<LanguageCode, string>;
  illustrationUrl: string;
  vocab: VocabItem[];
  interactivePrompt?: string;
}

export interface Book {
  id: string;
  title: Record<LanguageCode, string>;
  author: string;
  illustrator?: string;
  originCountry: string;
  flag: string;
  ageGroup: '3-5' | '6-8' | '9-12';
  category: 'Fairy Tale' | 'Nature & Science' | 'Friendship & Love' | 'Adventure' | 'Culture & Heritage' | 'Moral & Wisdom';
  coverUrl: string;
  summary: Record<LanguageCode, string>;
  pages: BookPage[];
  rating: number;
  readCount: number;
  isFeatured?: boolean;
  isCustom?: boolean;
  bgMusicTrack?: BgMusicTrack;
  createdAt?: string;
}

export interface UserWord extends VocabItem {
  id: string;
  bookId: string;
  bookTitle: string;
  pageNumber: number;
  addedAt: string;
  mastered: boolean;
}

export type BgMusicTrack = 'off' | 'lullaby' | 'forest' | 'adventure' | 'rain' | 'space' | 'magic' | 'ocean' | 'cozy' | 'sunset' | 'rainy';
export type BookshelfTheme = 'wood' | 'starry' | 'macaron' | 'forest';
export type StoryGuideAvatar = 'mimi_cat' | 'dr_owl' | 'grandpa_wizard';

export type StoryStructureId =
  | 'hero-journey'
  | 'fable-moral'
  | 'adventure-diary'
  | 'qi-cheng-zhuan-he'
  | 'problem-solution'
  | 'three-act-magic'
  | 'free';

export interface StoryStructureStep {
  stepNumber: number;
  tag: string;
  title: string;
  desc: string;
  promptGuide: string;
  exampleText: string;
}

export interface StoryStructureTemplate {
  id: StoryStructureId;
  name: string;
  badge: string;
  icon: string;
  tagline: string;
  desc: string;
  narrativeLogic: string;
  color: string;
  steps: StoryStructureStep[];
  recommendedAge: string;
  exampleThemes: string[];
  placeholder: string;
}

export interface CustomShelf {
  id: string;
  name: string;
  icon: string;
  bookIds: string[];
  isDefault?: boolean;
  description?: string;
  themeColor?: string;
  createdAt?: string;
  categoryTag?: string;
}

export interface StoryGuideInfo {
  avatar: StoryGuideAvatar;
  guideName: string;
  greetingSpeech: string;
  keyTakeaway: string;
  thinkingQuestion: string;
  funFact?: string;
}

export type VoiceRole =
  | 'mom'
  | 'cartoon'
  | 'grandpa'
  | 'teacher'
  | 'robot'
  | 'fairy'
  | 'detective'
  | 'astronaut'
  | 'wizard'
  | 'dragon'
  | 'alien'
  | 'santa';

export interface VoiceMarketplaceItem {
  id: VoiceRole;
  name: string;
  icon: string;
  priceStars: number;
  description: string;
  sampleText: string;
  categoryTag: string;
  isDefaultFree?: boolean;
}

export interface ReaderSettings {
  primaryLang: LanguageCode;
  secondaryLang: LanguageCode | 'none';
  showDualText: boolean;
  fontSize: 'sm' | 'md' | 'lg' | 'xl';
  dyslexicFont: boolean;
  speechRate: number; // 0.75 - 1.5
  speechPitch?: number; // 0.5 - 1.8
  emotionIntensity?: number; // 0 - 100 (%)
  voiceRole?: VoiceRole;
  unlockedVoices?: VoiceRole[];
  darkMode?: boolean;
  autoPlayAudio: boolean;
  bgMusic: boolean;
  bgMusicTrack?: BgMusicTrack;
  bgMusicVolume?: number; // 0.0 - 1.0
  soundEffects: boolean;
}

export interface MoodJournalEntry {
  id: string;
  bookId: string;
  bookTitle: string;
  coverUrl?: string;
  moodEmoji: string;
  moodLabel: string;
  reflectionText: string;
  favoriteQuote?: string;
  rating: number; // 1 to 5
  earnedStarsBonus?: number;
  createdAt: string;
}

export interface UserBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  category?: 'reading' | 'ai' | 'vocab' | 'general';
  unlockCondition?: string;
  rarity?: '普通' | '稀有' | '史詩' | '傳奇';
}

export interface DailyQuest {
  id: string;
  title: string;
  description: string;
  icon: string;
  current: number;
  target: number;
  rewardStars: number;
  claimed: boolean;
}

export interface AITrophy {
  id: string;
  title: string;
  description: string;
  icon: string;
  tier: '銅牌' | '銀牌' | '金牌' | '鑽石';
  count: number;
  targetCount: number;
  unlocked: boolean;
  unlockedAt?: string;
  howToEarn: string;
}

export interface ReadingLogEntry {
  id: string;
  bookId: string;
  bookTitle: string;
  coverUrl: string;
  lastPageRead: number;
  totalPages: number;
  progressPercent: number;
  timeSpentMinutes: number;
  lastReadAt: string;
  completed: boolean;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  hint?: string;
}

export interface QuizResult {
  score: number;
  totalQuestions: number;
  starsEarned: number;
  completedAt: string;
}

export type CollectibleRarity = 'common' | 'rare' | 'epic' | 'legendary';

export type SocialThemeBackground = 'starry' | 'forest' | 'castle' | 'ocean' | 'candy' | 'golden';

export interface SocialComment {
  id: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  createdAt: string;
  sticker?: string;
}

export interface SocialPost {
  id: string;
  authorName: string;
  authorAvatar: string;
  isMe?: boolean;
  bookId: string;
  bookTitle: string;
  bookCover?: string;
  collectibleItem?: CollectibleItem;
  thoughts: string;
  ratingStars?: number;
  themeBackground: SocialThemeBackground;
  createdAt: string;
  likesCount: number;
  isLikedByMe?: boolean;
  comments: SocialComment[];
  tags?: string[];
}

export interface CollectibleItem {
  id: string;
  bookId: string;
  bookTitle: string;
  name: string;
  icon: string;
  category: string;
  description: string;
  earnedAt: string;
  rarity: CollectibleRarity;
  themeColor?: string;
  imageUrl?: string;
}

export interface AvatarFrame {
  id: string;
  name: string;
  icon: string;
  borderClass: string;
  glowClass: string;
  unlocked: boolean;
  unlockedAt?: string;
  earnedFromBook?: string;
}

export interface DigitalSticker {
  id: string;
  name: string;
  emoji: string;
  category: string;
  unlocked: boolean;
  unlockedAt?: string;
  earnedFromBook?: string;
}

export interface LeaderboardUser {
  id: string;
  name: string;
  avatar: string;
  avatarFrame?: string;
  stars: number;
  booksCompleted: number;
  quizzesPassed: number;
  streakDays: number;
  readingMinutes: number;
  dailyStatusIcon?: string;
  dailyStatusText?: string;
  rank: number;
  isMe?: boolean;
  badgeTitle: string;
}

export interface SmartReadingReminderConfig {
  enabled: boolean;
  time: string; // e.g. "19:30"
  daysOfWeek: number[]; // [0, 1, 2, 3, 4, 5, 6]
  voicePrompt: boolean;
  voiceStyle: 'gentle_owl' | 'lively_cat' | 'warm_mom' | 'cheerful_fairy';
  soundTone: 'bell' | 'chime' | 'harp' | 'birdsong';
  customMessage: string;
  autoSpeechOnLoad?: boolean;
  lastNotifiedDate?: string;
}

export interface LearningMilestone {
  id: string;
  stepNumber: number;
  stageNumber: number; // 1: 啟蒙探索, 2: 沉浸共讀, 3: 雙語開拓, 4: AI 智慧冒險, 5: 傳奇繪本大師
  stageName: string;
  title: string;
  subtitle: string;
  icon: string;
  badgeId?: string;
  category: 'reading' | 'vocab' | 'ai' | 'streak' | 'creative' | 'multilingual';
  categoryLabel: string;
  rarity: '普通' | '稀有' | '史詩' | '傳奇';
  unlockConditionText: string;
  unlockStory: string; // 詳細解鎖背景故事
  rewardStars: number;
  bonusTitle?: string;
  bonusItem?: string;
  unlocked: boolean;
  unlockedAt?: string;
  currentProgress: number;
  targetProgress: number;
  progressUnit: string;
}

export interface UserProfile {
  name: string;
  avatar: string;
  stars: number;
  readBookIds: string[];
  favoriteBookIds: string[];
  badges: UserBadge[];
  readingMinutes: number;
  readingHistory: ReadingLogEntry[];
  moodJournal?: MoodJournalEntry[];
  collectibles?: CollectibleItem[];
  unlockedAvatarFrames?: AvatarFrame[];
  activeAvatarFrameId?: string;
  unlockedStickers?: DigitalSticker[];
  quizPassedBookIds?: string[];
  streakDays: number;
  lastReadDate?: string;
  dailyGoalMinutes: number;
  lastGoalBonusClaimedDate?: string;
  smartReminder?: SmartReadingReminderConfig;
}

export interface StoryQAHistory {
  role: 'user' | 'assistant';
  content: string;
}

export interface FavoriteTagItem {
  id: string;
  name: string;
  icon: string;
  color: string; // e.g. 'bg-rose-500 text-white', 'bg-amber-100 text-amber-900 border-amber-300'
  badgeColor?: string;
  isPreset?: boolean;
  description?: string;
  createdAt?: string;
}

export interface ReadingFocusCategoryMetric {
  category: string;
  categoryLabel: string;
  icon: string;
  color: string;
  focusScore: number; // 0 - 100
  emotionEngagement: number; // 0 - 100
  pageTurnPaceScore: number; // 0 - 100
  avgDwellSecPerPage: number;
  totalTimeMinutes: number;
  booksCount: number;
  primaryEmotion: string;
  primaryEmotionEmoji: string;
  traitName: string;
  traitDescription: string;
  recommendation: string;
}

export interface ReadingFocusOverallProfile {
  overallFocusIndex: number; // 0 - 100
  dominantTrait: string;
  dominantTraitDesc: string;
  dominantCategory: string;
  topStrengths: string[];
  growthAreas: string[];
  bestReadingTimeSlot: string;
  recommendedNextCategory: string;
  categoryMetrics: ReadingFocusCategoryMetric[];
}
