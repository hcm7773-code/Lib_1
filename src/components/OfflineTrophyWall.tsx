import React, { useState, useMemo, useEffect } from 'react';
import {
  Trophy, Award, Medal, Star, Sparkles, CheckCircle2, Lock,
  BookOpen, Volume2, HelpCircle, Layers, Zap, Flame, Coins,
  Clock, Compass, Eye, ChevronRight, Filter, Check, X, ShieldCheck,
  ArrowRight, Search, RefreshCw, BookmarkCheck, HeartHandshake, Smile,
  Calendar, RotateCcw, Lightbulb, GraduationCap, Box, CheckCircle
} from 'lucide-react';
import { Book, UserProfile, VoiceRole, VocabItem } from '../types';
import { playStarChime, playPageTurnSound, speakText } from '../utils/audio';

export interface OfflineTrophyWallProps {
  downloadedBooks: Book[];
  allBooks?: Book[];
  userProfile?: UserProfile;
  questCrystals?: number;
  onAddCrystals?: (amount: number) => void;
  onSelectBook?: (bookId: string) => void;
  onCloseParent?: () => void;
}

export interface TrophyBadgeItem {
  id: string;
  title: string;
  category: 'vocab' | 'qa' | 'wisdom' | 'collection' | 'focus';
  categoryLabel: string;
  rarity: 'SSR' | 'SR' | 'R' | 'N';
  rarityLabel: string;
  reliefType: 'gold' | 'silver' | 'crystal' | 'emerald';
  icon: string;
  description: string;
  lore: string;
  requirement: string;
  progressText: string;
  progressPct: number;
  isUnlocked: boolean;
  rewardCrystals: number;
  unlockedDate: string; // 獲獎日期
  tierShelf: 'legendary' | 'epic' | 'master' | 'initiation';
  // 離線知識艙 (Knowledge Capsule)
  knowledgeCapsule: {
    theme: string;
    keyVocabs: VocabItem[];
    moralWisdom: string;
    mindChallenge: {
      question: string;
      options: string[];
      correctIndex: number;
      explanation: string;
    };
    relatedBookTitle: string;
    relatedBookId?: string;
  };
}

export const OfflineTrophyWall: React.FC<OfflineTrophyWallProps> = ({
  downloadedBooks = [],
  allBooks = [],
  userProfile,
  questCrystals = 350,
  onAddCrystals,
  onSelectBook,
  onCloseParent,
}) => {
  // Target books pool
  const targetBooks = downloadedBooks.length > 0 ? downloadedBooks : (allBooks.length > 0 ? allBooks : []);

  // Claimed Badges storage
  const [claimedBadgeIds, setClaimedBadgeIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('pwa_claimed_cabinet_badges');
      return saved ? JSON.parse(saved) : ['badge_vocab_starter', 'badge_night_star', 'badge_first_qa'];
    } catch {
      return ['badge_vocab_starter', 'badge_night_star', 'badge_first_qa'];
    }
  });

  // Badge Unlocked Dates mapping stored in LocalStorage
  const [badgeUnlockedDates, setBadgeUnlockedDates] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('pwa_badge_unlock_dates');
      return saved ? JSON.parse(saved) : {
        badge_vocab_starter: '2026/08/10 14:32',
        badge_night_star: '2026/08/11 20:15',
        badge_first_qa: '2026/08/12 16:40',
        badge_master_collection: '2026/08/14 09:00',
      };
    } catch {
      return {
        badge_vocab_starter: '2026/08/10 14:32',
        badge_night_star: '2026/08/11 20:15',
        badge_first_qa: '2026/08/12 16:40',
      };
    }
  });

  // Offline Story Narrator Voice Role
  const [voiceRole, setVoiceRole] = useState<VoiceRole>('fairy');
  const [speechSpeed, setSpeechSpeed] = useState<number>(1.0);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Category Filter
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'collection' | 'vocab' | 'qa' | 'wisdom' | 'focus'>('all');

  // Currently inspected badge for 3D Popup & Knowledge Capsule
  const [selectedBadge, setSelectedBadge] = useState<TrophyBadgeItem | null>(null);

  // Active sub-tab inside the inspected modal: 'lore' (3D 浮雕故事) vs 'capsule' (離線知識艙) vs 'quiz' (知識試煉)
  const [modalTab, setModalTab] = useState<'lore' | 'capsule' | 'quiz'>('lore');

  // Mini Knowledge Quiz state inside modal
  const [quizSelectedOption, setQuizSelectedOption] = useState<number | null>(null);
  const [quizAnswered, setQuizAnswered] = useState<boolean>(false);
  const [quizPassed, setQuizPassed] = useState<boolean>(false);

  // Narrator Personas
  const NARRATOR_PERSONAS = [
    { role: 'fairy' as VoiceRole, name: '森林童話仙子', avatar: '🧚‍♀️', desc: '清脆甜美 ‧ 魔法聲線' },
    { role: 'wizard' as VoiceRole, name: '智慧貓頭鷹博士', avatar: '🦉', desc: '沉穩睿智 ‧ 啟發思考' },
    { role: 'grandpa' as VoiceRole, name: '星空魔法師', avatar: '🧙‍♂️', desc: '溫和磁性 ‧ 沉浸冒險' },
    { role: 'mom' as VoiceRole, name: '親切故事媽媽', avatar: '👩‍👧', desc: '溫暖守護 ‧ 陪伴共讀' },
    { role: 'robot' as VoiceRole, name: '咕嚕科技機器人', avatar: '🤖', desc: '節奏生動 ‧ 未來科技' },
  ];

  // Derive All Trophy Badges with 3D Relief & Lore Data
  const allTrophies: TrophyBadgeItem[] = useMemo(() => {
    const totalDownloaded = targetBooks.length;
    const hasMultipleBooks = totalDownloaded >= 3;

    return [
      // 🥇 SSR 傳奇特等席 (Legendary Shelf)
      {
        id: 'badge_master_collection',
        title: '離線全收集傳奇宗師',
        category: 'collection',
        categoryLabel: '全收集傳奇',
        rarity: 'SSR',
        rarityLabel: 'SSR 傳奇浮雕金章',
        reliefType: 'gold',
        icon: '👑',
        description: '在無網路環境下達成所有離線繪本的 100% 生字、問答與智慧定錨全收集。',
        lore: '傳說中唯有對故事抱持無盡好奇心與堅毅探究精神的勇者，才能在無網的深邃星海中點亮所有知識星座，獲得全宇宙藏書閣最高榮譽【傳奇宗師金章】。',
        requirement: '達成任 2 本以上繪本 100% 全收集',
        progressText: totalDownloaded >= 2 ? '2/2 本已達成 (100%)' : `${totalDownloaded}/2 本 (50%)`,
        progressPct: totalDownloaded >= 2 ? 100 : 50,
        isUnlocked: totalDownloaded >= 1, // Ready to claim for fun
        rewardCrystals: 300,
        unlockedDate: badgeUnlockedDates['badge_master_collection'] || '2026/08/14 09:00',
        tierShelf: 'legendary',
        knowledgeCapsule: {
          theme: '終極知識集成與自主學習心法',
          keyVocabs: [
            { word: 'Omniscient', phonetic: '/ɑːmˈnɪʃnt/', translation: '博學的、無所不知的', definition: '通曉廣博知識與深刻哲理', exampleSentence: 'The wise master possesses omniscient insight.' },
            { word: 'Mastery', phonetic: '/ˈmæstəri/', translation: '精通、熟練', definition: '對一門技藝或知識達到極致境界', exampleSentence: 'Reading daily leads to language mastery.' },
            { word: 'Sovereign', phonetic: '/ˈsɑːvrɪn/', translation: '至高無上的、統治者', definition: '擁有獨立且強大的意志與智慧', exampleSentence: 'Knowledge gives you sovereign power over your mind.' },
          ],
          moralWisdom: '「知識是最堅固的翅膀，無論置身何處，都能帶領心靈自由翺翔於星空之上。」',
          mindChallenge: {
            question: '當在沒有網路的環境下閱讀繪本時，最能提升記憶與專注力的方法是什麼？',
            options: ['快速翻頁只看插圖', '主動點擊生字發音並與小偵探問答思考', '隨便猜測答案', '跳過所有文字只聽聲音'],
            correctIndex: 1,
            explanation: '主動點擊生字卡複習發音，並結合線索問答主動思考，能刺激大腦神經元建立最穩固的長期記憶！',
          },
          relatedBookTitle: targetBooks[0]?.title ? (typeof targetBooks[0].title === 'string' ? targetBooks[0].title : targetBooks[0].title['zh-TW'] || '世界繪本') : '世界繪本',
          relatedBookId: targetBooks[0]?.id,
        },
      },
      {
        id: 'badge_grand_vocab_hunter',
        title: '雙語生字極致獵人金章',
        category: 'vocab',
        categoryLabel: '雙語字彙艙',
        rarity: 'SSR',
        rarityLabel: 'SSR 傳奇紫晶金章',
        reliefType: 'crystal',
        icon: '🔤',
        description: '成功掌握超過 50 個繪本核心英文生字並完成朗讀跟讀。',
        lore: '語言是開啟世界大門的咒語。每掌握一個雙語單字，獵人的智慧法杖便多鑲嵌一顆閃耀寶石，能與全球各地的小朋友們自由溝通心靈。',
        requirement: '離線學習累積 50 個生字',
        progressText: '已掌握 36 / 50 字 (72%)',
        progressPct: 72,
        isUnlocked: true,
        rewardCrystals: 200,
        unlockedDate: badgeUnlockedDates['badge_grand_vocab_hunter'] || '2026/08/13 18:20',
        tierShelf: 'legendary',
        knowledgeCapsule: {
          theme: '雙語思維轉換與記憶定錨術',
          keyVocabs: [
            { word: 'Vocabulary', phonetic: '/vəˈkæbjəleri/', translation: '詞彙量、字彙', definition: '一個人所掌握的所有單字總和', exampleSentence: 'Reading books enriches your English vocabulary.' },
            { word: 'Fluency', phonetic: '/ˈfluːənsi/', translation: '流利度、流暢', definition: '說話或閱讀時自然流利無阻礙', exampleSentence: 'Practice speaking aloud to achieve fluency.' },
            { word: 'Expression', phonetic: '/ɪkˈspreʃn/', translation: '表達、詞句', definition: '用清晰優雅的語言傳達心意', exampleSentence: 'Her vivid expression touched everyone.' },
          ],
          moralWisdom: '「豐富的字彙就像繽紛的畫筆，能讓你把心中的想像描繪得無比生動美麗。」',
          mindChallenge: {
            question: '英文單字「Fluency」的意思最接近下列哪一項？',
            options: ['流利順暢', '緩慢沉重', '生氣憤怒', '迷失方向'],
            correctIndex: 0,
            explanation: '「Fluency」代表語言表達時流暢、自然且連貫！',
          },
          relatedBookTitle: '經典雙語故事集',
        },
      },

      // 🥈 SR 史詩智謀席 (Epic Shelf)
      {
        id: 'badge_detective_holmes',
        title: '離線神探福爾摩斯勳章',
        category: 'qa',
        categoryLabel: '神探問答艙',
        rarity: 'SR',
        rarityLabel: 'SR 璀璨紫晶浮雕',
        reliefType: 'crystal',
        icon: '🕵️‍♂️',
        description: '在無網路小偵探挑戰中連續答對 10 道繪本情節謎題與推論題。',
        lore: '細微的筆觸中藏著大秘密！神探擁有如鷹般銳利的觀察眼力，不放過繪本插圖裡的任何一片落葉與神情暗號。',
        requirement: '小偵探問答連續 10 題正確',
        progressText: '已達成 8 / 10 題 (80%)',
        progressPct: 80,
        isUnlocked: true,
        rewardCrystals: 150,
        unlockedDate: badgeUnlockedDates['badge_detective_holmes'] || '2026/08/12 21:05',
        tierShelf: 'epic',
        knowledgeCapsule: {
          theme: '邏輯推理與細節觀察力',
          keyVocabs: [
            { word: 'Detective', phonetic: '/dɪˈtektɪv/', translation: '偵探', definition: '尋找線索並解開真相的人', exampleSentence: 'The smart detective found the lost clue.' },
            { word: 'Clue', phonetic: '/kluː/', translation: '線索、提示', definition: '指引通往真相的重要蛛絲馬跡', exampleSentence: 'Look closely at the picture for a clue.' },
            { word: 'Deduction', phonetic: '/dɪˈdʌkʃn/', translation: '推論、演繹', definition: '根據已知事實推導出正確結論', exampleSentence: 'Through logical deduction, she solved the mystery.' },
          ],
          moralWisdom: '「真相往往隱藏在最不起眼的細節裡，用心觀察是智慧的起點。」',
          mindChallenge: {
            question: '當遇到複雜的故事謎題時，神探的第一步應該做什麼？',
            options: ['先仔細閱讀前後文並尋找關鍵插畫線索', '直接放棄不猜', '隨便選一個最短的選項', '不讀題目直接看結果'],
            correctIndex: 0,
            explanation: '冷靜觀察、對照插畫細節與前後文脈絡，是解開所有謎題的黃金法則！',
          },
          relatedBookTitle: '小偵探大冒險',
        },
      },
      {
        id: 'badge_moral_lighthouse',
        title: '心靈道德燈塔翡翠章',
        category: 'wisdom',
        categoryLabel: '品格智慧艙',
        rarity: 'SR',
        rarityLabel: 'SR 翡翠典雅浮雕',
        reliefType: 'emerald',
        icon: '💡',
        description: '閱讀並定錨 15 篇繪本的核心品格啟發、同理心與人生智慧金句。',
        lore: '這座燈塔在心靈的港灣日夜長明。它提醒孩子們在冒險中時刻保持善良、學會同理並勇敢伸出援手。',
        requirement: '定錨 15 篇品格智慧',
        progressText: '已定錨 12 / 15 篇 (80%)',
        progressPct: 80,
        isUnlocked: true,
        rewardCrystals: 150,
        unlockedDate: badgeUnlockedDates['badge_moral_lighthouse'] || '2026/08/13 11:15',
        tierShelf: 'epic',
        knowledgeCapsule: {
          theme: '同理心、分享與善良品格',
          keyVocabs: [
            { word: 'Empathy', phonetic: '/ˈempəθi/', translation: '同理心', definition: '能設身處地體會他人感受的能力', exampleSentence: 'Empathy helps us care for our friends.' },
            { word: 'Integrity', phonetic: '/ɪnˈteɡrəti/', translation: '正直、誠實', definition: '堅持做正確事情的崇高品質', exampleSentence: 'Always act with honesty and integrity.' },
            { word: 'Compassion', phonetic: '/kəmˈpæʃn/', translation: '慈悲、關愛', definition: '願意幫助受苦者脫離困境的溫暖之心', exampleSentence: 'Show compassion to all living creatures.' },
          ],
          moralWisdom: '「善良就像撒在花園裡的種子，終有一天會開出整片芳香四溢的幸福花海。」',
          mindChallenge: {
            question: '在繪本故事中，當朋友遇到挫折難過時，展現「同理心 (Empathy)」的最佳做法是？',
            options: ['在旁邊嘲笑他', '溫柔傾聽並給予一個溫暖的擁抱與支持', '裝作沒看見走開', '責怪他做得不好'],
            correctIndex: 1,
            explanation: '溫柔傾聽對方的感受，給予理解與陪伴，就是同理心最美好的展現！',
          },
          relatedBookTitle: '溫暖的心靈花園',
        },
      },

      // 🥉 R 大師進階席 (Master Shelf)
      {
        id: 'badge_focus_zen',
        title: '深海專注禪境徽章',
        category: 'focus',
        categoryLabel: '專注時光艙',
        rarity: 'R',
        rarityLabel: 'R 典雅銀雕章',
        reliefType: 'silver',
        icon: '⏱️',
        description: '在無網路離線狀態下單次連續專注閱讀超過 25 分鐘。',
        lore: '當外界所有干擾與嘈雜通知沉寂下來，心靈便潛入如深海般平靜專注的藍色世界，文字開始綻放奇蹟之光。',
        requirement: '離線單次專注達 25 分鐘',
        progressText: '已達成 28 分鐘 (100%)',
        progressPct: 100,
        isUnlocked: true,
        rewardCrystals: 100,
        unlockedDate: badgeUnlockedDates['badge_focus_zen'] || '2026/08/11 19:45',
        tierShelf: 'master',
        knowledgeCapsule: {
          theme: '深層心流與無干擾閱讀環境',
          keyVocabs: [
            { word: 'Concentration', phonetic: '/ˌkɑːnsnˈtreɪʃn/', translation: '專注力、集中', definition: '全神貫注於眼前目標的精神狀態', exampleSentence: 'Deep concentration makes reading joyful.' },
            { word: 'Serenity', phonetic: '/səˈrenəti/', translation: '平靜、安詳', definition: '內心沉著無雜念的寧靜境界', exampleSentence: 'The quiet room brought peace and serenity.' },
            { word: 'Persistence', phonetic: '/pərˈsɪstəns/', translation: '堅持不懈', definition: '面對困難仍持之以恆的毅力', exampleSentence: 'With persistence, all goals are reachable.' },
          ],
          moralWisdom: '「平靜專注的心靈是一面清澈的湖水，能完整倒映出智慧星辰的倒影。」',
          mindChallenge: {
            question: '當閱讀時感到分心想看其他東西，最有效的調適方法是？',
            options: ['深呼吸三口氣，將目光重新聚焦在當前插圖與生字', '把書本丟掉不讀', '一邊看電視一邊看書', '大聲尖叫'],
            correctIndex: 0,
            explanation: '透過緩慢的深呼吸讓心率平穩，重新將注意力引導至眼前精彩的故事細節！',
          },
          relatedBookTitle: '深海奇幻之旅',
        },
      },
      {
        id: 'badge_night_star',
        title: '睡前星空探索者銀勳',
        category: 'focus',
        categoryLabel: '專注時光艙',
        rarity: 'R',
        rarityLabel: 'R 典雅銀雕章',
        reliefType: 'silver',
        icon: '🌙',
        description: '連續 3 天在睡前離線閱讀繪本，養成溫馨寧靜的睡前閱聽習慣。',
        lore: '夜幕低垂，月亮升起。每晚在星光陪伴下聆聽導讀師的溫柔嗓音，夢境裡充滿了奇妙的飛天冒險。',
        requirement: '連續 3 天睡前離線閱讀',
        progressText: '已達成 3 / 3 天 (100%)',
        progressPct: 100,
        isUnlocked: true,
        rewardCrystals: 100,
        unlockedDate: badgeUnlockedDates['badge_night_star'] || '2026/08/11 20:15',
        tierShelf: 'master',
        knowledgeCapsule: {
          theme: '睡前儀式感與大腦放鬆修復',
          keyVocabs: [
            { word: 'Constellation', phonetic: '/ˌkɑːnstəˈleɪʃn/', translation: '星座', definition: '天空中恆星排列出的圖形', exampleSentence: 'We gazed at the bright constellation.' },
            { word: 'Lullaby', phonetic: '/ˈlʌləbaɪ/', translation: '搖籃曲、安眠曲', definition: '溫柔伴人入睡的悠揚旋律', exampleSentence: 'The soft story felt like a sweet lullaby.' },
            { word: 'Imagination', phonetic: '/ɪˌmædʒɪˈneɪʃn/', translation: '想像力', definition: '在大腦中創造新奇世界的能力', exampleSentence: 'Bedtime stories spark infinite imagination.' },
          ],
          moralWisdom: '「好的故事是夜晚最甜美的晚安吻，伴隨夢想在星空中綻放。」',
          mindChallenge: {
            question: '睡前聆聽溫和的故事導讀，對大腦有什麼好處？',
            options: ['幫助神經放鬆、促進優質睡眠並鞏固白天學到的詞彙', '會讓人過度興奮失眠', '沒有任何作用', '會忘光所有事情'],
            correctIndex: 0,
            explanation: '睡前平靜的故事共讀能降低焦慮，並利用睡眠期間將白天的詞彙轉化為長期記憶！',
          },
          relatedBookTitle: '星空晚安曲',
        },
      },

      // 🎖️ N 啟蒙先鋒席 (Initiation Shelf)
      {
        id: 'badge_vocab_starter',
        title: '雙語小豆苗初發芽',
        category: 'vocab',
        categoryLabel: '雙語字彙艙',
        rarity: 'N',
        rarityLabel: '先鋒啟蒙章',
        reliefType: 'silver',
        icon: '🌱',
        description: '第一次在離線繪本中點擊生字發音卡並聆聽雙語朗讀。',
        lore: '一顆小小的語言種子落進肥沃的心田，在好奇心泉水的灌溉下，悄悄探出了翠綠的嫩芽。',
        requirement: '完成首次生字點讀',
        progressText: '已達成 (100%)',
        progressPct: 100,
        isUnlocked: true,
        rewardCrystals: 50,
        unlockedDate: badgeUnlockedDates['badge_vocab_starter'] || '2026/08/10 14:32',
        tierShelf: 'initiation',
        knowledgeCapsule: {
          theme: '啟蒙探索與發音聆聽基礎',
          keyVocabs: [
            { word: 'Curiosity', phonetic: '/ˌkjʊriˈɑːsəti/', translation: '好奇心', definition: '渴望學習與探索新事物的心情', exampleSentence: 'Curiosity is the engine of all learning.' },
            { word: 'Sprout', phonetic: '/spraʊt/', translation: '發芽、嫩芽', definition: '植物開始生長的小綠芽', exampleSentence: 'The green sprout reached toward the sun.' },
            { word: 'Explore', phonetic: '/ɪkˈsplɔːr/', translation: '探索、探究', definition: '前往未知領域進行發現', exampleSentence: 'Let us explore the magic story forest.' },
          ],
          moralWisdom: '「萬丈高樓平地起，每一個大宗師都是從小豆苗開始成長的。」',
          mindChallenge: {
            question: '單字「Curiosity」代表什麼美好的特質？',
            options: ['好奇心與求知慾', '懶惰不思進取', '膽小退縮', '容易放棄'],
            correctIndex: 0,
            explanation: '「Curiosity」就是對世界充滿好奇心、熱愛主動探索的精神！',
          },
          relatedBookTitle: '森林小樹苗的冒險',
        },
      },
      {
        id: 'badge_first_qa',
        title: '小小線索見習生',
        category: 'qa',
        categoryLabel: '神探問答艙',
        rarity: 'N',
        rarityLabel: '先鋒啟蒙章',
        reliefType: 'silver',
        icon: '🔍',
        description: '成功解開離線繪本的第一道小偵探情節謎題。',
        lore: '見習生拿起了他的第一支放大鏡，第一次發現原來故事裡的角色眼神藏著這麼多有趣的心事。',
        requirement: '完成首次問答解鎖',
        progressText: '已達成 (100%)',
        progressPct: 100,
        isUnlocked: true,
        rewardCrystals: 50,
        unlockedDate: badgeUnlockedDates['badge_first_qa'] || '2026/08/12 16:40',
        tierShelf: 'initiation',
        knowledgeCapsule: {
          theme: '基礎提問法與脈絡理解',
          keyVocabs: [
            { word: 'Question', phonetic: '/ˈkwestʃən/', translation: '問題、疑問', definition: '用以求知或探究的語句', exampleSentence: 'Ask a good question to find the truth.' },
            { word: 'Answer', phonetic: '/ˈænsər/', translation: '答案、回應', definition: '解答疑問的正確回覆', exampleSentence: 'She found the correct answer with joy.' },
            { word: 'Search', phonetic: '/sɜːrtʃ/', translation: '搜尋、尋找', definition: '細心查閱以找出目標', exampleSentence: 'Search the page for hidden gems.' },
          ],
          moralWisdom: '「勇敢提出問題，本身就是聰明與勇敢的最好證明。」',
          mindChallenge: {
            question: '當看繪本不知道故事為什麼這樣發展時，最好的方法是？',
            options: ['向導讀師或爸媽提問，並再讀一次前後頁插圖', '把書撕破', '不管它繼續亂看', '永遠不要再看這本書'],
            correctIndex: 0,
            explanation: '主動發問與對照插圖脈絡，是讓理解力突飛猛進的最佳途徑！',
          },
          relatedBookTitle: '好奇小貓的足跡',
        },
      },
    ];
  }, [targetBooks, badgeUnlockedDates]);

  // Filtered badges
  const filteredTrophies = useMemo(() => {
    if (categoryFilter === 'all') return allTrophies;
    return allTrophies.filter((t) => t.category === categoryFilter);
  }, [allTrophies, categoryFilter]);

  // Handle claiming a badge
  const handleClaimTrophy = (badge: TrophyBadgeItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (claimedBadgeIds.includes(badge.id)) return;

    playStarChime();
    const updatedClaimed = [...claimedBadgeIds, badge.id];
    setClaimedBadgeIds(updatedClaimed);

    // Save date
    const now = new Date();
    const dateStr = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const updatedDates = { ...badgeUnlockedDates, [badge.id]: dateStr };
    setBadgeUnlockedDates(updatedDates);

    try {
      localStorage.setItem('pwa_claimed_cabinet_badges', JSON.stringify(updatedClaimed));
      localStorage.setItem('pwa_badge_unlock_dates', JSON.stringify(updatedDates));
    } catch (err) {
      console.warn(err);
    }

    if (onAddCrystals) {
      onAddCrystals(badge.rewardCrystals);
    }

    // Voice cheer
    speakText(
      `恭喜獲得【${badge.title}】3D 浮雕成就獎章！獲得 ${badge.rewardCrystals} 顆知識水晶！已永久存入你的離線榮譽展示牆！`,
      'zh-TW',
      1.0,
      voiceRole
    );
  };

  // Inspect badge and speak lore
  const handleInspectBadge = (badge: TrophyBadgeItem) => {
    playPageTurnSound();
    setSelectedBadge(badge);
    setModalTab('lore');
    setQuizSelectedOption(null);
    setQuizAnswered(false);
    setQuizPassed(false);
  };

  // Speak Current Badge Lore or Capsule
  const handleSpeakBadgeLore = () => {
    if (!selectedBadge) return;
    playStarChime();
    setIsSpeaking(true);

    const childName = userProfile?.name || '小讀者';
    const textToSpeak = `榮譽授獎：【${selectedBadge.title}】。獲獎日期：${selectedBadge.unlockedDate}。解鎖傳奇故事：${selectedBadge.lore}。導讀師智慧啟發：${selectedBadge.knowledgeCapsule.moralWisdom}`;

    speakText(
      textToSpeak,
      'zh-TW',
      speechSpeed,
      voiceRole,
      1.0,
      () => setIsSpeaking(false)
    );
  };

  // Speak Single Vocabulary Word
  const handleSpeakVocab = (vocab: VocabItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    playStarChime();
    const text = `${vocab.word}。${vocab.phonetic || ''}。中文意思是：${vocab.translation}。例句：${vocab.exampleSentence || ''}`;
    speakText(text, 'zh-TW', 1.0, voiceRole);
  };

  // Mini quiz answer handler
  const handleAnswerQuiz = (optIndex: number) => {
    if (quizAnswered || !selectedBadge) return;
    setQuizSelectedOption(optIndex);
    setQuizAnswered(true);

    const isCorrect = optIndex === selectedBadge.knowledgeCapsule.mindChallenge.correctIndex;
    setQuizPassed(isCorrect);

    if (isCorrect) {
      playStarChime();
      if (onAddCrystals) onAddCrystals(30);
      speakText(`太聰明了！回答正確！恭喜獲得 +30 知識水晶！${selectedBadge.knowledgeCapsule.mindChallenge.explanation}`, 'zh-TW', 1.0, voiceRole);
    } else {
      speakText(`差一點點！正確答案是「${selectedBadge.knowledgeCapsule.mindChallenge.options[selectedBadge.knowledgeCapsule.mindChallenge.correctIndex]}」！${selectedBadge.knowledgeCapsule.mindChallenge.explanation}`, 'zh-TW', 1.0, voiceRole);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn select-none">
      {/* 🌟 1. TROPHY WALL HEADER & NARRATOR SELECTOR */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-amber-950 via-slate-950 to-indigo-950 border-2 border-amber-400/70 shadow-2xl space-y-4 relative overflow-hidden">
        {/* Background ambient lighting */}
        <div className="absolute top-0 right-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 flex items-center justify-center text-3xl shadow-xl border-2 border-amber-200 animate-badge-float shrink-0 emboss-3d-gold">
              🏆
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg sm:text-xl font-black text-amber-300 flex items-center gap-2">
                  <span>離線獎章展示牆 (3D 浮雕榮譽榜)</span>
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/30 text-amber-300 border border-amber-400/50 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>立體 3D 浮雕動畫 ‧ 授獎日期</span>
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-cyan-500/20 text-cyan-300 border border-cyan-400/40">
                  💊 離線知識艙 & 導讀師
                </span>
              </div>
              <p className="text-xs font-bold text-slate-300 mt-1 leading-relaxed">
                將孩子在無網路環境下達成的各項里程碑，以 3D 浮雕徽章排列展示。點擊徽章可查看解鎖背景故事、授獎日期與專屬知識艙！
              </p>
            </div>
          </div>

          {/* Quick Stats & Narrator Selector */}
          <div className="flex items-center gap-3 flex-wrap self-start lg:self-auto">
            {/* Stats Card */}
            <div className="flex items-center gap-2 bg-slate-900/90 px-3 py-2 rounded-2xl border border-amber-500/40 shadow-md">
              <Coins className="w-5 h-5 text-amber-400 animate-spin-slow" />
              <div>
                <span className="text-[10px] font-bold text-slate-400 block">知識水晶庫存</span>
                <span className="text-sm font-black text-amber-300">{questCrystals} 💎</span>
              </div>
            </div>

            {/* Collected Counter */}
            <div className="flex items-center gap-2 bg-slate-900/90 px-3 py-2 rounded-2xl border border-emerald-500/40 shadow-md">
              <Medal className="w-5 h-5 text-emerald-400 animate-bounce" />
              <div>
                <span className="text-[10px] font-bold text-slate-400 block">已收藏獎章</span>
                <span className="text-sm font-black text-emerald-300">
                  {claimedBadgeIds.length} / {allTrophies.length} 座
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Filter bar & Narrator Personas */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-amber-500/30 relative z-10">
          {/* Category Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1">
            <span className="text-xs font-bold text-slate-400 shrink-0 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-amber-400" />
              <span>分類展示：</span>
            </span>

            {[
              { id: 'all', label: '全部榮譽', icon: Award },
              { id: 'collection', label: '👑 全收集傳奇', icon: CrownIcon },
              { id: 'vocab', label: '🔤 雙語字彙艙', icon: BookOpen },
              { id: 'qa', label: '❓ 神探問答艙', icon: HelpCircle },
              { id: 'wisdom', label: '💡 品格智慧艙', icon: HeartHandshake },
              { id: 'focus', label: '⏱️ 專注時光艙', icon: Clock },
            ].map((f) => {
              const Icon = f.icon;
              const isSelected = categoryFilter === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => {
                    playPageTurnSound();
                    setCategoryFilter(f.id as any);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1 whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-400 text-slate-950 shadow-md scale-105'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{f.label}</span>
                </button>
              );
            })}
          </div>

          {/* Narrator Persona Picker */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-bold text-amber-300">導讀師：</span>
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
              {NARRATOR_PERSONAS.map((p) => {
                const isSelected = voiceRole === p.role;
                return (
                  <button
                    key={p.role}
                    onClick={() => {
                      playStarChime();
                      setVoiceRole(p.role);
                      speakText(`我是你的成就故事導讀師：${p.name}！很高興為你見證榮譽時刻！`, 'zh-TW', 1.0, p.role);
                    }}
                    title={`${p.name} (${p.desc})`}
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

      {/* 🏆 2. 3D RELIEF EMBOSSED TROPHY WALL SHELVES (立體浮雕獎章展示牆) */}
      <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/95 border-2 border-amber-500/40 shadow-2xl space-y-6">
        {/* Tier 1: SSR Legendary Shelf */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 text-xs font-black shadow-md flex items-center gap-1">
                <span>🥇 SSR 傳奇宗師黃金浮雕席</span>
              </span>
              <span className="text-[11px] font-bold text-slate-400">大師級全收集與字彙極致榮譽</span>
            </div>
            <span className="text-xs font-black text-amber-300">最高加成 +300 💎</span>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredTrophies
              .filter((t) => t.tierShelf === 'legendary')
              .map((badge) => render3DBadgeCard(badge))}
          </div>

          {/* 3D Wooden/Golden Shelf Beam */}
          <div className="h-3.5 w-full rounded-full bg-gradient-to-r from-amber-950 via-amber-700 to-amber-950 shadow-xl border-t-2 border-amber-400/60" />
        </div>

        {/* Tier 2: SR Epic Shelf */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-black shadow-md flex items-center gap-1">
                <span>🥈 SR 璀璨紫晶與翡翠智謀席</span>
              </span>
              <span className="text-[11px] font-bold text-slate-400">神探偵探與心靈道德啟發</span>
            </div>
            <span className="text-xs font-black text-purple-300">+150 💎 水晶</span>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredTrophies
              .filter((t) => t.tierShelf === 'epic')
              .map((badge) => render3DBadgeCard(badge))}
          </div>

          {/* 3D Wooden/Golden Shelf Beam */}
          <div className="h-3.5 w-full rounded-full bg-gradient-to-r from-purple-950 via-amber-800 to-purple-950 shadow-xl border-t-2 border-purple-400/60" />
        </div>

        {/* Tier 3: R & Initiation Shelf */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 text-xs font-black shadow-md flex items-center gap-1">
                <span>🥉 R 典雅銀雕與啟蒙先鋒席</span>
              </span>
              <span className="text-[11px] font-bold text-slate-400">深海專注、睡前共讀與初次發芽</span>
            </div>
            <span className="text-xs font-black text-emerald-300">+50~100 💎 水晶</span>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredTrophies
              .filter((t) => t.tierShelf === 'master' || t.tierShelf === 'initiation')
              .map((badge) => render3DBadgeCard(badge))}
          </div>

          {/* 3D Wooden/Golden Shelf Beam */}
          <div className="h-3.5 w-full rounded-full bg-gradient-to-r from-slate-900 via-amber-900 to-slate-900 shadow-xl border-t-2 border-emerald-400/60" />
        </div>
      </div>

      {/* 🔍 3. 3D BADGE DETAIL & KNOWLEDGE CAPSULE DIALOG (獎章特寫、背景故事、獲獎日期與知識艙) */}
      {selectedBadge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-xl bg-slate-900 border-2 border-amber-400/80 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5 relative max-h-[90vh] overflow-y-auto custom-scrollbar">
            {/* Modal Top Bar */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-xl text-xs font-black ${
                    selectedBadge.rarity === 'SSR'
                      ? 'bg-amber-400 text-slate-950'
                      : selectedBadge.rarity === 'SR'
                      ? 'bg-purple-500 text-white'
                      : 'bg-emerald-500 text-slate-950'
                  }`}
                >
                  {selectedBadge.rarityLabel}
                </span>
                <span className="text-xs font-bold text-slate-400">
                  分類：{selectedBadge.categoryLabel}
                </span>
              </div>

              <button
                onClick={() => setSelectedBadge(null)}
                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Big 3D Relief Embossed Badge Presentation */}
            <div className="flex flex-col items-center justify-center text-center space-y-3 py-2 bg-gradient-to-b from-slate-950 to-slate-900/60 rounded-3xl p-4 border border-slate-800">
              {/* 3D Floating Coin with Bevel Lighting */}
              <div
                className={`w-28 h-28 rounded-3xl flex items-center justify-center text-6xl transform hover:rotate-6 transition-transform shadow-2xl animate-badge-float ${
                  selectedBadge.reliefType === 'gold'
                    ? 'bg-gradient-to-br from-amber-300 via-yellow-500 to-amber-600 border-4 border-amber-100 emboss-3d-gold'
                    : selectedBadge.reliefType === 'crystal'
                    ? 'bg-gradient-to-br from-purple-400 via-pink-500 to-indigo-600 border-4 border-purple-200 emboss-3d-crystal'
                    : selectedBadge.reliefType === 'emerald'
                    ? 'bg-gradient-to-br from-emerald-400 via-teal-500 to-emerald-700 border-4 border-emerald-200 emboss-3d-emerald'
                    : 'bg-gradient-to-br from-slate-200 via-slate-400 to-slate-600 border-4 border-slate-100 emboss-3d-silver'
                }`}
              >
                <span className="drop-shadow-lg">{selectedBadge.icon}</span>
              </div>

              <div>
                <h3 className="text-xl font-black text-amber-300">
                  {selectedBadge.title}
                </h3>
                <p className="text-xs font-bold text-slate-300 mt-1 max-w-md">
                  {selectedBadge.description}
                </p>
              </div>

              {/* Award Date & Certificate Tag */}
              <div className="flex items-center gap-2 flex-wrap justify-center pt-1">
                <span className="px-3 py-1 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                  <span>獲獎日期：{selectedBadge.unlockedDate}</span>
                </span>

                <span className="px-3 py-1 rounded-xl bg-amber-500/20 border border-amber-400/40 text-xs font-black text-amber-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>離線榮譽認證戳印</span>
                </span>
              </div>

              {/* Voice Readout Button */}
              <button
                onClick={handleSpeakBadgeLore}
                className={`px-4 py-2 rounded-2xl text-xs font-black flex items-center gap-2 shadow-lg transition-transform hover:scale-105 cursor-pointer ${
                  isSpeaking
                    ? 'bg-rose-500 text-white animate-pulse'
                    : 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950'
                }`}
              >
                <Volume2 className="w-4 h-4" />
                <span>{isSpeaking ? '導讀師講述中...' : '🎙️ 聆聽導讀師講述傳奇故事與啟發'}</span>
              </button>
            </div>

            {/* Tab switch inside modal: 'lore' | 'capsule' | 'quiz' */}
            <div className="flex items-center bg-slate-950 p-1 rounded-2xl border border-slate-800">
              <button
                onClick={() => {
                  playPageTurnSound();
                  setModalTab('lore');
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  modalTab === 'lore'
                    ? 'bg-amber-400 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>📜 解鎖傳奇歷史</span>
              </button>

              <button
                onClick={() => {
                  playPageTurnSound();
                  setModalTab('capsule');
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  modalTab === 'capsule'
                    ? 'bg-cyan-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Box className="w-3.5 h-3.5" />
                <span>💊 離線知識艙 (詞彙&啟發)</span>
              </button>

              <button
                onClick={() => {
                  playPageTurnSound();
                  setModalTab('quiz');
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  modalTab === 'quiz'
                    ? 'bg-emerald-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>🧪 知識小試煉 (+30 💎)</span>
              </button>
            </div>

            {/* TAB CONTENT A: 📜 LORE & LORE CERTIFICATE */}
            {modalTab === 'lore' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/30 space-y-2">
                  <div className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>【獎章解鎖傳奇背景故事 (Badge Lore)】</span>
                  </div>
                  <p className="text-xs font-bold text-slate-200 leading-relaxed italic">
                    {selectedBadge.lore}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs font-bold">
                  <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                    <span className="text-slate-400 text-[10px] block">解鎖條件</span>
                    <span className="text-slate-200">{selectedBadge.requirement}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-950 border border-amber-500/30 space-y-1">
                    <span className="text-slate-400 text-[10px] block">榮譽水晶獎勵</span>
                    <span className="text-amber-300 font-black">+{selectedBadge.rewardCrystals} 💎 水晶</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT B: 💊 OFFLINE KNOWLEDGE CAPSULE */}
            {modalTab === 'capsule' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="p-4 rounded-2xl bg-slate-950 border border-cyan-500/40 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-2">
                      <Box className="w-4 h-4 text-cyan-400" />
                      <span className="text-xs font-black text-cyan-300">
                        知識艙主題：{selectedBadge.knowledgeCapsule.theme}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400">
                      來源：《{selectedBadge.knowledgeCapsule.relatedBookTitle}》
                    </span>
                  </div>

                  {/* Vocabulary Pod */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-black text-slate-300 block">
                      🔤 核心延伸生字庫 (點擊聽雙語發音)：
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {selectedBadge.knowledgeCapsule.keyVocabs.map((vocab, vIdx) => (
                        <div
                          key={vIdx}
                          onClick={(e) => handleSpeakVocab(vocab, e)}
                          className="p-2.5 rounded-xl bg-slate-900/90 border border-cyan-500/30 hover:border-cyan-400 transition-all cursor-pointer group"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-black text-xs text-cyan-300">{vocab.word}</span>
                            <Volume2 className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110" />
                          </div>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            {vocab.phonetic} ‧ {vocab.translation}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Moral Wisdom Anchor */}
                  <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 space-y-1">
                    <span className="text-[10px] font-black text-amber-400 block">💡 心靈智慧定錨：</span>
                    <p className="text-xs font-bold text-amber-200 italic leading-relaxed">
                      {selectedBadge.knowledgeCapsule.moralWisdom}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT C: 🧪 KNOWLEDGE MINI QUIZ */}
            {modalTab === 'quiz' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/40 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-black text-emerald-300 flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4 text-emerald-400" />
                      <span>離線知識艙思維試煉</span>
                    </span>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
                      答對獎勵 +30 💎
                    </span>
                  </div>

                  <p className="text-xs font-black text-slate-100 leading-relaxed">
                    {selectedBadge.knowledgeCapsule.mindChallenge.question}
                  </p>

                  {/* Options */}
                  <div className="space-y-2">
                    {selectedBadge.knowledgeCapsule.mindChallenge.options.map((opt, oIdx) => {
                      const isSelected = quizSelectedOption === oIdx;
                      const isCorrect = oIdx === selectedBadge.knowledgeCapsule.mindChallenge.correctIndex;

                      return (
                        <button
                          key={oIdx}
                          disabled={quizAnswered}
                          onClick={() => handleAnswerQuiz(oIdx)}
                          className={`w-full p-3 rounded-xl text-xs font-bold text-left transition-all flex items-center justify-between cursor-pointer ${
                            quizAnswered
                              ? isCorrect
                                ? 'bg-emerald-500/20 text-emerald-300 border-2 border-emerald-400 font-black'
                                : isSelected
                                ? 'bg-rose-500/20 text-rose-300 border-2 border-rose-400'
                                : 'bg-slate-900 text-slate-500 border border-slate-800 opacity-60'
                              : 'bg-slate-900 hover:bg-emerald-950/40 text-slate-300 hover:text-white border border-slate-800 hover:border-emerald-500/50'
                          }`}
                        >
                          <span>{opt}</span>
                          {quizAnswered && isCorrect && <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>

                  {/* Explanation feedback */}
                  {quizAnswered && (
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 animate-fadeIn">
                      <span className="text-emerald-400 font-black block mb-1">
                        {quizPassed ? '🎉 答對了！' : '💡 知識解析：'}
                      </span>
                      {selectedBadge.knowledgeCapsule.mindChallenge.explanation}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Modal Bottom Actions */}
            <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-800">
              {claimedBadgeIds.includes(selectedBadge.id) ? (
                <div className="px-4 py-2 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-black flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>已成功授予並入櫃收藏</span>
                </div>
              ) : selectedBadge.isUnlocked ? (
                <button
                  onClick={(e) => handleClaimTrophy(selectedBadge, e)}
                  className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-xs hover:brightness-110 shadow-lg cursor-pointer flex items-center gap-1.5"
                >
                  <Trophy className="w-4 h-4" />
                  <span>立即領取 3D 浮雕獎章與 +{selectedBadge.rewardCrystals} 💎</span>
                </button>
              ) : (
                <div className="px-4 py-2 rounded-2xl bg-slate-950 border border-slate-800 text-slate-500 text-xs font-bold flex items-center gap-1.5">
                  <Lock className="w-4 h-4" />
                  <span>未達成解鎖條件</span>
                </div>
              )}

              <button
                onClick={() => setSelectedBadge(null)}
                className="px-5 py-2.5 rounded-2xl bg-slate-800 text-slate-200 hover:bg-slate-700 font-bold text-xs cursor-pointer ml-auto"
              >
                關閉
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Helper function to render a 3D relief badge card on the shelf
  function render3DBadgeCard(badge: TrophyBadgeItem) {
    const isClaimed = claimedBadgeIds.includes(badge.id);

    return (
      <div
        key={badge.id}
        onClick={() => handleInspectBadge(badge)}
        className={`p-4 rounded-3xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-3 group relative overflow-hidden shadow-xl ${
          isClaimed
            ? 'bg-slate-950/90 border-amber-400/80 shadow-amber-500/10 hover:scale-[1.03]'
            : badge.isUnlocked
            ? 'bg-gradient-to-br from-amber-950/60 via-slate-950 to-slate-950 border-amber-400 animate-pulse hover:scale-[1.03]'
            : 'bg-slate-950/50 border-slate-800 opacity-60 hover:opacity-80'
        }`}
      >
        <div className="space-y-2.5">
          {/* Top Info: Rarity & Crystals */}
          <div className="flex items-center justify-between gap-1.5">
            <span
              className={`px-2.5 py-0.5 rounded-xl text-[9px] font-black ${
                badge.rarity === 'SSR'
                  ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow'
                  : badge.rarity === 'SR'
                  ? 'bg-purple-500 text-white shadow'
                  : 'bg-slate-800 text-emerald-300 border border-emerald-500/40'
              }`}
            >
              {badge.rarityLabel}
            </span>

            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-900 text-amber-400 border border-amber-500/30">
              +{badge.rewardCrystals} 💎
            </span>
          </div>

          {/* 3D Coin Badge Visual & Title */}
          <div className="flex items-center gap-3.5">
            {/* 3D Embossed Relief Coin */}
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0 transition-transform group-hover:rotate-6 ${
                badge.reliefType === 'gold'
                  ? 'bg-gradient-to-br from-amber-300 via-yellow-500 to-amber-600 border-2 border-amber-200 emboss-3d-gold animate-badge-float'
                  : badge.reliefType === 'crystal'
                  ? 'bg-gradient-to-br from-purple-400 via-pink-500 to-indigo-600 border-2 border-purple-200 emboss-3d-crystal animate-badge-float'
                  : badge.reliefType === 'emerald'
                  ? 'bg-gradient-to-br from-emerald-400 via-teal-500 to-emerald-700 border-2 border-emerald-200 emboss-3d-emerald animate-badge-float'
                  : 'bg-gradient-to-br from-slate-200 via-slate-400 to-slate-600 border-2 border-slate-100 emboss-3d-silver'
              } ${!badge.isUnlocked && !isClaimed ? 'grayscale opacity-50' : ''}`}
            >
              <span className="drop-shadow-md">{badge.icon}</span>
            </div>

            <div className="min-w-0">
              <h5 className="font-black text-xs sm:text-sm text-slate-100 group-hover:text-amber-300 transition-colors truncate">
                {badge.title}
              </h5>
              <p className="text-[10px] font-bold text-slate-400 line-clamp-1 mt-0.5">
                {badge.description}
              </p>
              <span className="text-[9px] font-bold text-cyan-300 flex items-center gap-1 mt-1">
                <Calendar className="w-3 h-3 text-cyan-400" />
                <span>授獎日期：{badge.unlockedDate}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Footer: Progress & Action */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold">
          <span className="text-[10px] text-slate-400">{badge.progressText}</span>

          {isClaimed ? (
            <span className="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 text-[10px] font-black flex items-center gap-1">
              <Check className="w-3 h-3" />
              <span>已入展示牆</span>
            </span>
          ) : badge.isUnlocked ? (
            <button
              onClick={(e) => handleClaimTrophy(badge, e)}
              className="px-3 py-1 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-[10px] hover:scale-105 transition-transform shadow cursor-pointer"
            >
              🎉 點擊領取
            </button>
          ) : (
            <span className="px-2 py-0.5 rounded-lg bg-slate-900 text-slate-500 text-[10px] flex items-center gap-1">
              <Lock className="w-3 h-3" />
              <span>未解鎖</span>
            </span>
          )}
        </div>
      </div>
    );
  }
};

const CrownIcon: React.FC<{ className?: string }> = ({ className }) => {
  return <span className={className}>👑</span>;
};
