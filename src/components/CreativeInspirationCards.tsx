import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Dices,
  Wand2,
  CheckCircle2,
  RotateCw,
  ArrowDownRight,
  Lock,
  Unlock,
  Bookmark,
  BookmarkCheck,
  Flame,
  Star,
  Layers,
  Palette,
  Compass,
  MapPin,
  Smile,
  Shield,
  Lightbulb,
  Copy,
  Check,
  Shuffle
} from 'lucide-react';
import { playStarChime, playPageTurnSound } from '../utils/audio';

export interface InspirationCombination {
  id: string;
  theme: {
    title: string;
    icon: string;
    conflict: string;
    category: string;
  };
  location: {
    name: string;
    icon: string;
    atmosphere: string;
    bgGradient: string;
  };
  character: {
    name: string;
    trait: string;
    icon: string;
    flawAndStrength: string;
  };
  recommendedStyle: string;
  synthesizedPrompt: string;
}

interface CreativeInspirationCardsProps {
  onApplyInspiration: (
    synthesizedPrompt: string,
    characterName: string,
    themeCategory?: string,
    artStyle?: string,
    moralLesson?: string
  ) => void;
  darkMode?: boolean;
}

// 🎡 Themes / 故事主題
const THEMES = [
  { title: '尋找失落的星光水晶', icon: '💎', conflict: '黑夜籠罩了王國，需要解開七道星光謎題', category: 'Adventure' },
  { title: '解開時光倒流之謎', icon: '⏰', conflict: '時鐘爺爺生病了，時間突然開始倒退走', category: 'Nature & Science' },
  { title: '拯救即將褪色的彩虹', icon: '🌈', conflict: '世界上所有的顏色漸漸變灰，必須找回歡笑之泉', category: 'Fairy Tale' },
  { title: '保護深海螢光珊瑚礁', icon: '🪸', conflict: '海底火山爆發，海洋小夥伴必須齊心建造防護牆', category: 'Nature & Science' },
  { title: '星際小郵差的第一封信', icon: '✉️', conflict: '信封上的地址被宇宙射線模糊了，需要穿越小行星帶', category: 'Adventure' },
  { title: '會唱歌的魔法種子', icon: '🌱', conflict: '種子只在聽到真誠的友誼讚美時才會發芽開花', category: 'Friendship & Love' },
  { title: '搶救融化的冰淇淋城堡', icon: '🍦', conflict: '夏日太陽神太熱情，小精靈需要發明冰涼降溫風車', category: 'Fairy Tale' },
  { title: '害羞微風找朋友', icon: '🍃', conflict: '微風吹得太小力大家注意不到，必須找到自己的獨特旋律', category: 'Friendship & Love' },
];

// 🗺️ Locations / 故事地點
const LOCATIONS = [
  { name: '飄浮雲朵城堡', icon: '☁️', atmosphere: '柔軟綿密、空氣中飄著棉花糖香味', bgGradient: 'from-sky-400 to-indigo-500' },
  { name: '水晶深海宮殿', icon: '🌊', atmosphere: '發光水母游動、珊瑚折射出七彩琉璃光芒', bgGradient: 'from-cyan-500 to-blue-600' },
  { name: '發光螢火蟲森林', icon: '🌲', atmosphere: '巨大磨菇如路燈、古老巨樹低聲講述秘密', bgGradient: 'from-emerald-500 to-teal-700' },
  { name: '外星軌道太空站', icon: '🚀', atmosphere: '無重力漂浮、窗外是璀璨絢麗的土星光環', bgGradient: 'from-indigo-600 to-purple-800' },
  { name: '古老齒輪蒸氣城', icon: '⚙️', atmosphere: '黃銅管道噴出蒸氣、發條玩具在屋頂奔跑', bgGradient: 'from-amber-600 to-orange-700' },
  { name: '糖果彩虹山谷', icon: '🍬', atmosphere: '棒棒糖樹林、流淌著草莓牛奶的小溪流', bgGradient: 'from-pink-400 to-rose-500' },
  { name: '火山地底溫泉王國', icon: '🌋', atmosphere: '溫暖蒸氣騰騰、熔岩晶石散發溫和橘紅暖光', bgGradient: 'from-orange-500 to-red-600' },
  { name: '魔法秘密藏書閣', icon: '📚', atmosphere: '書本在空中拍翅飛翔、每頁都藏著縮小世界', bgGradient: 'from-purple-500 to-indigo-600' },
];

// 🦊 Characters / 主角特質
const CHARACTERS = [
  { name: '怕黑的小太空人 波波', trait: '勇敢但怕黑', icon: '👨‍🚀', flawAndStrength: '雖然害怕黑暗，但為了守護同伴總能點亮心中勇氣之光' },
  { name: '愛發明的小狐狸 托托', trait: '聰明卻常常粗心', icon: '🦊', flawAndStrength: '小發明總是帶來意外驚喜，在失敗中學會耐心檢視細節' },
  { name: '害羞的小獨角獸 露娜', trait: '溫柔且擁有治癒之角', icon: '🦄', flawAndStrength: '不敢在大眾前說話，卻願意挺身而出為受傷的小鳥療傷' },
  { name: '不會游泳的小鴨 呱呱', trait: '渴望潛水探索深海', icon: '🦆', flawAndStrength: '自己製作了氣泡潛水頭盔，證明不同特質也能實現大夢想' },
  { name: '會彈琴的綠建築小豬 嘟嘟', trait: '熱愛自然與建築美學', icon: '🐷', flawAndStrength: '喜歡用太陽能與雨水收集器建造環保木屋，用音樂傳遞愛' },
  { name: '迷路但樂觀的小機器人 嗶波', trait: '充滿好奇與感恩之心', icon: '🤖', flawAndStrength: '電量快耗盡時依然樂觀微笑，懂得用幽默感溫暖身邊所有人' },
  { name: '想要飛上天的小恐龍 雷克斯', trait: '熱情奔放、永不放棄', icon: '🦕', flawAndStrength: '翅膀小巧卻堅持練習滑翔，用熱情感染了整個森林' },
  { name: '愛烘焙的魔法小兔 菲菲', trait: '擅長做傳遞笑容的點心', icon: '🐰', flawAndStrength: '每一塊餅乾都注入了友誼魔法，化解了森林裡的每一次爭吵' },
];

// 🎴 Preset Golden Inspiration Cards
const PRESET_CARDS: InspirationCombination[] = [
  {
    id: 'card-1',
    theme: THEMES[0],
    location: LOCATIONS[3],
    character: CHARACTERS[0],
    recommendedStyle: '夢幻星空水彩',
    synthesizedPrompt: '故事講述【怕黑的小太空人 波波】在【外星軌道太空站】遭遇全站電力中斷，為了【尋找失落的星光水晶】重新點亮宇宙，波波必須克服對黑暗的恐懼，跟發光小水母結伴前行，最終領悟「真正的光芒來自守護朋友的勇氣」。',
  },
  {
    id: 'card-2',
    theme: THEMES[5],
    location: LOCATIONS[2],
    character: CHARACTERS[1],
    recommendedStyle: '溫馨水彩繪本',
    synthesizedPrompt: '故事講述【愛發明的小狐狸 托托】在【發光螢火蟲森林】發現了一顆【會唱歌的魔法種子】。托托原本想用各種高科技機器催熟它，卻發現種子只在聽到真誠的友誼讚美時才會發芽開花，從中體會傾聽與關懷的真諦。',
  },
  {
    id: 'card-3',
    theme: THEMES[3],
    location: LOCATIONS[1],
    character: CHARACTERS[3],
    recommendedStyle: '宮崎駿手繪風',
    synthesizedPrompt: '故事講述【不會游泳的小鴨 呱呱】自己戴上自製氣泡頭盔，潛入【水晶深海宮殿】幫助海洋動物們【保護深海螢光珊瑚礁】。雖然外表與眾不同，但呱呱用獨特的飛行視角幫助大家建造了最堅固的防護海堤。',
  },
  {
    id: 'card-4',
    theme: THEMES[2],
    location: LOCATIONS[5],
    character: CHARACTERS[2],
    recommendedStyle: '夢幻剪紙風',
    synthesizedPrompt: '故事講述【害羞的小獨角獸 露娜】在【糖果彩虹山谷】發現彩虹正在褪色，為了【拯救即將褪色的彩虹】，露娜鼓起勇氣走向大家，用自己溫柔的治癒之角與大家的歡笑聲調配出最燦爛的七彩顏料。',
  },
];

export const CreativeInspirationCards: React.FC<CreativeInspirationCardsProps> = ({
  onApplyInspiration,
  darkMode = false,
}) => {
  const [selectedThemeIndex, setSelectedThemeIndex] = useState(0);
  const [selectedLocationIndex, setSelectedLocationIndex] = useState(0);
  const [selectedCharacterIndex, setSelectedCharacterIndex] = useState(0);

  // Reel Locks
  const [lockTheme, setLockTheme] = useState(false);
  const [lockLocation, setLockLocation] = useState(false);
  const [lockCharacter, setLockCharacter] = useState(false);

  // Spinning states
  const [isSpinningAll, setIsSpinningAll] = useState(false);
  const [isSpinningTheme, setIsSpinningTheme] = useState(false);
  const [isSpinningLocation, setIsSpinningLocation] = useState(false);
  const [isSpinningCharacter, setIsSpinningCharacter] = useState(false);

  // Saved Custom Cards list
  const [savedCards, setSavedCards] = useState<InspirationCombination[]>(() => {
    try {
      const stored = localStorage.getItem('user_saved_inspiration_cards');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [activeTab, setActiveTab] = useState<'wheel' | 'cards' | 'saved'>('wheel');
  const [copiedNotification, setCopiedNotification] = useState(false);

  const currentTheme = THEMES[selectedThemeIndex];
  const currentLocation = LOCATIONS[selectedLocationIndex];
  const currentCharacter = CHARACTERS[selectedCharacterIndex];

  // Synthesized current prompt
  const generatedPrompt = `故事講述【${currentCharacter.name}】（特質：${currentCharacter.trait}）在【${currentLocation.name}】展開精彩冒險。核心主題為【${currentTheme.title}】（面臨挑戰：${currentTheme.conflict}）。主角在過程展現「${currentCharacter.flawAndStrength}」，情節富有想像力且寓意深遠。`;

  // Spin Theme Single
  const handleSpinTheme = () => {
    if (lockTheme || isSpinningTheme) return;
    setIsSpinningTheme(true);
    playPageTurnSound();
    let steps = 0;
    const interval = setInterval(() => {
      setSelectedThemeIndex((prev) => (prev + 1) % THEMES.length);
      steps++;
      if (steps >= 8) {
        clearInterval(interval);
        setIsSpinningTheme(false);
        playStarChime();
      }
    }, 70);
  };

  // Spin Location Single
  const handleSpinLocation = () => {
    if (lockLocation || isSpinningLocation) return;
    setIsSpinningLocation(true);
    playPageTurnSound();
    let steps = 0;
    const interval = setInterval(() => {
      setSelectedLocationIndex((prev) => (prev + 1) % LOCATIONS.length);
      steps++;
      if (steps >= 8) {
        clearInterval(interval);
        setIsSpinningLocation(false);
        playStarChime();
      }
    }, 70);
  };

  // Spin Character Single
  const handleSpinCharacter = () => {
    if (lockCharacter || isSpinningCharacter) return;
    setIsSpinningCharacter(true);
    playPageTurnSound();
    let steps = 0;
    const interval = setInterval(() => {
      setSelectedCharacterIndex((prev) => (prev + 1) % CHARACTERS.length);
      steps++;
      if (steps >= 8) {
        clearInterval(interval);
        setIsSpinningCharacter(false);
        playStarChime();
      }
    }, 70);
  };

  // Spin All unlocked reels
  const handleSpinAll = () => {
    if (isSpinningAll) return;
    setIsSpinningAll(true);
    playStarChime();

    let steps = 0;
    const interval = setInterval(() => {
      steps++;
      if (!lockTheme) {
        setSelectedThemeIndex(Math.floor(Math.random() * THEMES.length));
      }
      if (!lockLocation) {
        setSelectedLocationIndex(Math.floor(Math.random() * LOCATIONS.length));
      }
      if (!lockCharacter) {
        setSelectedCharacterIndex(Math.floor(Math.random() * CHARACTERS.length));
      }

      if (steps >= 12) {
        clearInterval(interval);
        setIsSpinningAll(false);
      }
    }, 80);
  };

  // Save current combination as a card
  const handleSaveCurrentCard = () => {
    const newCard: InspirationCombination = {
      id: `custom-card-${Date.now()}`,
      theme: currentTheme,
      location: currentLocation,
      character: currentCharacter,
      recommendedStyle: '溫馨水彩繪本',
      synthesizedPrompt: generatedPrompt,
    };
    const updated = [newCard, ...savedCards.filter((c) => c.synthesizedPrompt !== generatedPrompt)];
    setSavedCards(updated);
    try {
      localStorage.setItem('user_saved_inspiration_cards', JSON.stringify(updated));
    } catch {}
    playStarChime();
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2000);
  };

  const handleApplyCurrent = () => {
    playStarChime();
    onApplyInspiration(
      generatedPrompt,
      currentCharacter.name,
      currentTheme.category,
      '溫馨水彩繪本',
      `學會${currentCharacter.trait}並珍惜夥伴`
    );
  };

  const handleApplyPresetCard = (card: InspirationCombination) => {
    playStarChime();
    onApplyInspiration(
      card.synthesizedPrompt,
      card.character.name,
      card.theme.category,
      card.recommendedStyle,
      card.character.flawAndStrength
    );
  };

  return (
    <div
      id="creative-inspiration-cards-container"
      className={`p-5 sm:p-7 rounded-3xl border-2 transition-all shadow-lg relative overflow-hidden ${
        darkMode
          ? 'bg-slate-900/95 border-amber-500/50 text-slate-100'
          : 'bg-gradient-to-br from-amber-50/95 via-orange-50/70 to-yellow-50/95 border-amber-300 text-slate-900'
      }`}
    >
      {/* Background Ornaments */}
      <div className="absolute top-2 right-4 opacity-15 pointer-events-none text-6xl select-none">
        🎡
      </div>

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-amber-200/80 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 via-orange-500 to-yellow-400 p-0.5 shadow-md flex items-center justify-center text-slate-950">
            <Dices className="w-6 h-6 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg sm:text-xl font-black text-amber-950 dark:text-amber-300 flex items-center gap-1.5">
                <span>✨ 創意靈感生成輪盤與卡片庫</span>
              </h3>
              <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 shadow-2xs">
                3軸隨機靈感機
              </span>
            </div>
            <p className="text-xs text-amber-900/80 dark:text-slate-400 font-medium mt-0.5">
              透過三軸輪盤隨機組合「故事主題 × 地點場景 × 主角特質」，一鍵激發無限原創靈感！
            </p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1.5 bg-amber-200/60 dark:bg-slate-800 p-1 rounded-2xl self-end sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('wheel')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1 ${
              activeTab === 'wheel'
                ? 'bg-amber-500 text-slate-950 shadow-2xs'
                : 'text-amber-900 dark:text-slate-300 hover:bg-amber-100 dark:hover:bg-slate-700'
            }`}
          >
            <Dices className="w-3.5 h-3.5" />
            <span>三軸輪盤</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('cards')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1 ${
              activeTab === 'cards'
                ? 'bg-amber-500 text-slate-950 shadow-2xs'
                : 'text-amber-900 dark:text-slate-300 hover:bg-amber-100 dark:hover:bg-slate-700'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>精選黃金卡片 ({PRESET_CARDS.length})</span>
          </button>

          {savedCards.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveTab('saved')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1 ${
                activeTab === 'saved'
                  ? 'bg-amber-500 text-slate-950 shadow-2xs'
                  : 'text-amber-900 dark:text-slate-300 hover:bg-amber-100 dark:hover:bg-slate-700'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>我的收藏 ({savedCards.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Mode 1: 3-Reel Interactive Inspiration Wheel */}
      {activeTab === 'wheel' && (
        <div className="pt-4 space-y-5">
          {/* Slot Machine 3 Reels Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {/* Reel 1: 故事主題 (Story Theme) */}
            <div
              className={`p-4 rounded-3xl border-2 transition-all flex flex-col justify-between space-y-3 relative ${
                isSpinningTheme || isSpinningAll ? 'ring-2 ring-amber-400 animate-pulse' : ''
              } ${
                lockTheme
                  ? 'bg-amber-100/50 dark:bg-slate-800/80 border-amber-400'
                  : 'bg-white dark:bg-slate-850 border-amber-200 dark:border-slate-700 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                  <span>故事核心主題</span>
                </span>

                {/* Lock Toggle */}
                <button
                  type="button"
                  onClick={() => setLockTheme(!lockTheme)}
                  className={`p-1.5 rounded-xl text-xs font-black transition-colors cursor-pointer ${
                    lockTheme
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-500 hover:text-amber-600'
                  }`}
                  title={lockTheme ? '已鎖定此主題（轉動全部時不變）' : '鎖定此主題'}
                >
                  {lockTheme ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Theme Content Display */}
              <div className="text-center py-2 space-y-1.5">
                <div className="text-4xl filter drop-shadow-sm select-none">
                  {currentTheme.icon}
                </div>
                <h4 className="font-black text-sm sm:text-base text-slate-900 dark:text-slate-100 line-clamp-1">
                  {currentTheme.title}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium line-clamp-2 px-1">
                  {currentTheme.conflict}
                </p>
              </div>

              {/* Single Spin Button */}
              <button
                type="button"
                disabled={lockTheme || isSpinningTheme || isSpinningAll}
                onClick={handleSpinTheme}
                className={`w-full py-2 rounded-2xl text-xs font-black flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  lockTheme
                    ? 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
                    : 'bg-amber-100 hover:bg-amber-200 dark:bg-slate-700 text-amber-900 dark:text-amber-200 hover:scale-[1.02]'
                }`}
              >
                <RotateCw className={`w-3.5 h-3.5 ${isSpinningTheme ? 'animate-spin' : ''}`} />
                <span>重轉主題 ({THEMES.length}款)</span>
              </button>
            </div>

            {/* Reel 2: 故事地點 (Story Location / Setting) */}
            <div
              className={`p-4 rounded-3xl border-2 transition-all flex flex-col justify-between space-y-3 relative ${
                isSpinningLocation || isSpinningAll ? 'ring-2 ring-orange-400 animate-pulse' : ''
              } ${
                lockLocation
                  ? 'bg-amber-100/50 dark:bg-slate-800/80 border-orange-400'
                  : 'bg-white dark:bg-slate-850 border-amber-200 dark:border-slate-700 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-orange-900 dark:text-orange-300 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block" />
                  <span>故事地點與場景</span>
                </span>

                {/* Lock Toggle */}
                <button
                  type="button"
                  onClick={() => setLockLocation(!lockLocation)}
                  className={`p-1.5 rounded-xl text-xs font-black transition-colors cursor-pointer ${
                    lockLocation
                      ? 'bg-orange-500 text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-500 hover:text-orange-600'
                  }`}
                  title={lockLocation ? '已鎖定此地點（轉動全部時不變）' : '鎖定此地點'}
                >
                  {lockLocation ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Location Content Display */}
              <div className="text-center py-2 space-y-1.5">
                <div className="text-4xl filter drop-shadow-sm select-none">
                  {currentLocation.icon}
                </div>
                <h4 className="font-black text-sm sm:text-base text-slate-900 dark:text-slate-100 line-clamp-1">
                  {currentLocation.name}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium line-clamp-2 px-1">
                  {currentLocation.atmosphere}
                </p>
              </div>

              {/* Single Spin Button */}
              <button
                type="button"
                disabled={lockLocation || isSpinningLocation || isSpinningAll}
                onClick={handleSpinLocation}
                className={`w-full py-2 rounded-2xl text-xs font-black flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  lockLocation
                    ? 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
                    : 'bg-orange-100 hover:bg-orange-200 dark:bg-slate-700 text-orange-900 dark:text-orange-200 hover:scale-[1.02]'
                }`}
              >
                <RotateCw className={`w-3.5 h-3.5 ${isSpinningLocation ? 'animate-spin' : ''}`} />
                <span>重轉地點 ({LOCATIONS.length}款)</span>
              </button>
            </div>

            {/* Reel 3: 主角特質 (Protagonist & Traits) */}
            <div
              className={`p-4 rounded-3xl border-2 transition-all flex flex-col justify-between space-y-3 relative ${
                isSpinningCharacter || isSpinningAll ? 'ring-2 ring-purple-400 animate-pulse' : ''
              } ${
                lockCharacter
                  ? 'bg-amber-100/50 dark:bg-slate-800/80 border-purple-400'
                  : 'bg-white dark:bg-slate-850 border-amber-200 dark:border-slate-700 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-purple-900 dark:text-purple-300 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" />
                  <span>主角特質與性格</span>
                </span>

                {/* Lock Toggle */}
                <button
                  type="button"
                  onClick={() => setLockCharacter(!lockCharacter)}
                  className={`p-1.5 rounded-xl text-xs font-black transition-colors cursor-pointer ${
                    lockCharacter
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-500 hover:text-purple-600'
                  }`}
                  title={lockCharacter ? '已鎖定此主角（轉動全部時不變）' : '鎖定此主角'}
                >
                  {lockCharacter ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Character Content Display */}
              <div className="text-center py-2 space-y-1.5">
                <div className="text-4xl filter drop-shadow-sm select-none">
                  {currentCharacter.icon}
                </div>
                <h4 className="font-black text-sm sm:text-base text-slate-900 dark:text-slate-100 line-clamp-1">
                  {currentCharacter.name}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium line-clamp-2 px-1">
                  {currentCharacter.flawAndStrength}
                </p>
              </div>

              {/* Single Spin Button */}
              <button
                type="button"
                disabled={lockCharacter || isSpinningCharacter || isSpinningAll}
                onClick={handleSpinCharacter}
                className={`w-full py-2 rounded-2xl text-xs font-black flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  lockCharacter
                    ? 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
                    : 'bg-purple-100 hover:bg-purple-200 dark:bg-slate-700 text-purple-900 dark:text-purple-200 hover:scale-[1.02]'
                }`}
              >
                <RotateCw className={`w-3.5 h-3.5 ${isSpinningCharacter ? 'animate-spin' : ''}`} />
                <span>重轉特質 ({CHARACTERS.length}款)</span>
              </button>
            </div>
          </div>

          {/* Action Bar: Spin All & Apply Inspiration */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-white/90 dark:bg-slate-800/90 rounded-2xl border border-amber-200 dark:border-slate-700">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                id="btn-spin-all-inspiration"
                onClick={handleSpinAll}
                disabled={isSpinningAll}
                className="flex-1 sm:flex-none px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-400 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:scale-105 transition-all cursor-pointer"
              >
                <Dices className={`w-4 h-4 ${isSpinningAll ? 'animate-spin' : ''}`} />
                <span>🎰 一鍵隨機組合全部</span>
              </button>

              <button
                type="button"
                onClick={handleSaveCurrentCard}
                className="px-3.5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-700 hover:bg-amber-100 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1 transition-all cursor-pointer"
                title="儲存此靈感組合到我的收藏"
              >
                {copiedNotification ? <Check className="w-4 h-4 text-emerald-600" /> : <Bookmark className="w-4 h-4" />}
                <span>{copiedNotification ? '已儲存！' : '收藏此卡片'}</span>
              </button>
            </div>

            <button
              type="button"
              id="btn-apply-inspiration-to-creator"
              onClick={handleApplyCurrent}
              className="w-full sm:w-auto px-6 py-2.5 rounded-2xl bg-slate-950 hover:bg-slate-900 text-amber-300 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg hover:scale-105 transition-all cursor-pointer border border-amber-400/60"
            >
              <Wand2 className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>✨ 立即套用靈感至創作表單</span>
            </button>
          </div>
        </div>
      )}

      {/* Mode 2: Preset Golden Inspiration Cards */}
      {activeTab === 'cards' && (
        <div className="pt-4 space-y-3">
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
            點擊任一張創意卡片，即可快速帶入完整情節骨幹、故事地點與角色設定：
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {PRESET_CARDS.map((card) => (
              <div
                key={card.id}
                className="p-4 rounded-3xl bg-white dark:bg-slate-850 border-2 border-amber-200 dark:border-slate-700 shadow-xs hover:border-amber-400 transition-all flex flex-col justify-between space-y-3 hover:scale-[1.01]"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xl">{card.character.icon}</span>
                      <span className="text-xl">{card.location.icon}</span>
                      <span className="text-xl">{card.theme.icon}</span>
                    </div>

                    <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 dark:bg-slate-700 dark:text-amber-300">
                      {card.recommendedStyle}
                    </span>
                  </div>

                  <h4 className="font-black text-sm text-slate-900 dark:text-slate-100">
                    《{card.character.name} 與 {card.theme.title}》
                  </h4>

                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium line-clamp-3 leading-relaxed">
                    {card.synthesizedPrompt}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-bold">
                    📍 {card.location.name}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleApplyPresetCard(card)}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1 shadow-2xs hover:scale-105 transition-all cursor-pointer"
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                    <span>套用此卡片</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mode 3: Saved Custom Cards */}
      {activeTab === 'saved' && (
        <div className="pt-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {savedCards.map((card) => (
              <div
                key={card.id}
                className="p-4 rounded-3xl bg-white dark:bg-slate-850 border-2 border-amber-300 dark:border-slate-700 shadow-xs flex flex-col justify-between space-y-3"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{card.character.icon}</span>
                    <h4 className="font-black text-sm text-slate-900 dark:text-slate-100">
                      {card.character.name}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium line-clamp-3">
                    {card.synthesizedPrompt}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleApplyPresetCard(card)}
                  className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>套用此靈感</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
