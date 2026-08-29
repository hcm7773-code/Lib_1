export type EmotionType = 'excited' | 'gentle' | 'brave' | 'curious' | 'wise' | 'sad' | 'tense';

export interface EmotionAnalysisResult {
  emotion: EmotionType;
  label: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
  pitchModifier: number;
  rateModifier: number;
  explanation: string;
}

export interface SentenceEmotionItem {
  sentence: string;
  emotionResult: EmotionAnalysisResult;
}

const EMOTION_MAP: Record<EmotionType, EmotionAnalysisResult> = {
  excited: {
    emotion: 'excited',
    label: '驚喜熱情',
    icon: '🎉',
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-100/90 dark:bg-amber-950/70',
    borderColor: 'border-amber-300 dark:border-amber-700',
    pitchModifier: 1.25,
    rateModifier: 1.12,
    explanation: '語調雀躍歡快，適合充滿驚喜、歡呼或節慶感的歡樂情節！',
  },
  sad: {
    emotion: 'sad',
    label: '悲傷同理',
    icon: '🌧️',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100/90 dark:bg-blue-950/70',
    borderColor: 'border-blue-300 dark:border-blue-700',
    pitchModifier: 0.82,
    rateModifier: 0.82,
    explanation: '低沉緩和的語調，表達難過失落、流淚傷心與同理安慰的深層情感。',
  },
  tense: {
    emotion: 'tense',
    label: '緊張懸疑',
    icon: '⚡',
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-100/90 dark:bg-purple-950/70',
    borderColor: 'border-purple-300 dark:border-purple-700',
    pitchModifier: 1.18,
    rateModifier: 1.22,
    explanation: '緊湊高亢的語速，營造危急緊迫、小心翼翼與懸疑驚險的臨場感！',
  },
  gentle: {
    emotion: 'gentle',
    label: '溫馨睡前',
    icon: '🌙',
    color: 'text-indigo-600 dark:text-indigo-400',
    bgColor: 'bg-indigo-100/90 dark:bg-indigo-950/70',
    borderColor: 'border-indigo-300 dark:border-indigo-700',
    pitchModifier: 0.92,
    rateModifier: 0.88,
    explanation: '語調柔軟緩和，營造微風夜空、晚安安眠與親情愛護的溫馨感。',
  },
  brave: {
    emotion: 'brave',
    label: '勇敢冒險',
    icon: '🦁',
    color: 'text-rose-600 dark:text-rose-400',
    bgColor: 'bg-rose-100/90 dark:bg-rose-950/70',
    borderColor: 'border-rose-300 dark:border-rose-700',
    pitchModifier: 1.10,
    rateModifier: 1.05,
    explanation: '聲調高昂渾厚，展現挺身而出、面對挑戰與拯救同伴的勇氣！',
  },
  curious: {
    emotion: 'curious',
    label: '好奇探索',
    icon: '🧐',
    color: 'text-sky-600 dark:text-sky-400',
    bgColor: 'bg-sky-100/90 dark:bg-sky-950/70',
    borderColor: 'border-sky-300 dark:border-sky-700',
    pitchModifier: 1.18,
    rateModifier: 1.08,
    explanation: '語氣帶著輕快疑問與探索發現，激發孩子對科學與神秘世界的好奇。',
  },
  wise: {
    emotion: 'wise',
    label: '思考智慧',
    icon: '💡',
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-100/90 dark:bg-emerald-950/70',
    borderColor: 'border-emerald-300 dark:border-emerald-700',
    pitchModifier: 1.0,
    rateModifier: 0.95,
    explanation: '沉穩清楚的語調，引導思考故事隱含的美德、教訓與分享真諦。',
  },
};

export function analyzeEmotionForText(text: string): EmotionAnalysisResult {
  const lower = text.toLowerCase();

  // Sad keywords
  if (
    /傷心|難過|哭|流淚|淚|對不起|失去|孤單|可憐|悲傷|痛|sad|cry|lonely|sorry|tears|upset/.test(lower)
  ) {
    return EMOTION_MAP.sad;
  }

  // Tense keywords
  if (
    /急|快點|危險|小心|抓緊|救命|逃|要倒了|可怕|驚恐|懸崖|danger|fast|run|help|careful|scary/.test(lower)
  ) {
    return EMOTION_MAP.tense;
  }

  // Excited keywords
  if (
    text.includes('！') ||
    text.includes('!') ||
    /哇|太棒|好高興|興奮|驚訝|飛|歡呼|快樂|開心|驚喜|happy|excited|wow|wonderful|amazing|celebrate/.test(lower)
  ) {
    return EMOTION_MAP.excited;
  }

  // Gentle keywords
  if (
    /月亮|星星|睡|晚安|溫柔|安靜|微风|抱|親|夢|sweet|gentle|sleep|night|moon|star|soft/.test(lower)
  ) {
    return EMOTION_MAP.gentle;
  }

  // Brave keywords
  if (
    /城堡|怪物|巨龍|勇敢|挑戰|前進|英雄|戰勝|不害怕|巨獸|冒險|brave|adventure|fight|hero|dragon|monster/.test(lower)
  ) {
    return EMOTION_MAP.brave;
  }

  // Curious keywords
  if (
    text.includes('？') ||
    text.includes('?') ||
    /為什麼|秘密|探索|尋找|發現|奇妙|研究|疑問|curious|mystery|why|discover|search|secret/.test(lower)
  ) {
    return EMOTION_MAP.curious;
  }

  // Wise default keywords
  return EMOTION_MAP.wise;
}

export function analyzeSentencesEmotion(fullText: string): SentenceEmotionItem[] {
  // Split text by punctuation marks
  const rawSentences = fullText.split(/([。！？!?\n]+)/).filter(Boolean);
  const sentences: string[] = [];

  for (let i = 0; i < rawSentences.length; i += 2) {
    const main = rawSentences[i];
    const punct = rawSentences[i + 1] || '';
    if (main && main.trim()) {
      sentences.push(main.trim() + punct);
    }
  }

  if (sentences.length === 0) {
    sentences.push(fullText);
  }

  return sentences.map((s) => ({
    sentence: s,
    emotionResult: analyzeEmotionForText(s),
  }));
}
