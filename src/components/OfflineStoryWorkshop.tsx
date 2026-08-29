import React, { useState, useMemo } from 'react';
import {
  Sparkles, Wand2, BookOpen, Volume2, Bookmark, Award,
  CheckCircle2, RotateCcw, Play, Compass, ArrowRight, Star,
  Layers, Heart, Zap, Mic, Download, Share2, Eye, HelpCircle
} from 'lucide-react';
import { Book, UserProfile, VoiceRole } from '../types';
import { playStarChime, playPageTurnSound, speakText } from '../utils/audio';

export interface OfflineStoryWorkshopProps {
  downloadedBooks?: Book[];
  allBooks?: Book[];
  userProfile?: UserProfile;
  questCrystals?: number;
  onAddCrystals?: (amount: number) => void;
  onSelectBook?: (book: Book) => void;
  onOpenBlueprintGuide?: () => void;
}

export interface GeneratedStoryChapter {
  chapterNumber: number;
  title: string;
  illustrationEmoji: string;
  content: string;
  questionPrompt: string;
  choices: {
    text: string;
    nextBranch: string;
    attributeReward: string;
  }[];
  keyVocab: {
    word: string;
    phonetic: string;
    meaning: string;
  };
}

export interface SavedStory {
  id: string;
  title: string;
  character: string;
  setting: string;
  blueprint: string;
  moralTheme: string;
  createdAt: string;
  chapters: GeneratedStoryChapter[];
  selectedChoices: string[];
  endingSummary: string;
  starsEarned: number;
}

export const CHARACTERS_POOL = [
  { id: 'prince', name: '小王子', title: '星際探索者', emoji: '👑', desc: '擁有純真眼光與對宇宙奧秘的無限好奇心。' },
  { id: 'fox', name: '星空小狐狸', title: '心靈守護者', emoji: '🦊', desc: '懂得「真正重要的東西要用心去感受」的智慧摯友。' },
  { id: 'piggy', name: '綠能豬小弟', title: '零碳工程師', emoji: '🐷', desc: '善用太陽能與雨水回收系統打造堅固綠建築。' },
  { id: 'squid', name: '深海小烏賊', title: '深淵發光家', emoji: '🐙', desc: '在漆黑萬米深海中用生物發光照亮洋流的冒險家。' },
  { id: 'owl', name: '貓頭鷹博士', title: '古籍守護者', emoji: '🦉', desc: '熟知天文曆法、齒輪結構與自然生態百科大師。' },
  { id: 'robot', name: '蒸汽齒輪機器人', title: '鐘塔修理師', emoji: '🤖', desc: '身上配備擒縱機構與精密發條的忠誠夥伴。' },
  { id: 'sapling', name: '森林小樹苗', title: '光合共生使者', emoji: '🌿', desc: '能透過地底菌根網絡與周圍萬物分享養分。' },
  { id: 'bee', name: '幾何蜜蜂建築師', title: '晶格大師', emoji: '🐝', desc: '精通六角蜂巢高強度結構與花粉導航技術。' },
];

export const SETTINGS_POOL = [
  { id: 'space', name: '太陽系與行星軌道', emoji: '🪐', desc: '穿越水星、金星到海王星的宏偉星際航道。' },
  { id: 'green_house', name: '零碳環保綠建築基地', emoji: '🏡', desc: '裝設光伏太陽能板與雨水過濾中水系統的未來智慧屋。' },
  { id: 'deep_ocean', name: '萬米深海發光熱泉海溝', emoji: '🌊', desc: '充滿高壓、神秘發光水母與熱液噴口的深邃秘境。' },
  { id: 'forest', name: '微觀光合與菌根地下森林', emoji: '🌳', desc: '葉綠體光解水與地底菌絲傳遞訊息的生態王國。' },
  { id: 'clock_tower', name: '蒸汽齒輪與天文擒縱時鐘塔', emoji: '🕰️', desc: '精準滴答作響的鐘錶機械與恆定擺輪工坊。' },
  { id: 'amber_hive', name: '六角幾何琥珀晶格宮殿', emoji: '🍯', desc: '空間利用率最大化且輕量抗震的自然幾何奇觀。' },
];

export const BLUEPRINTS_POOL = [
  { id: 'bp_solar', name: '📐 光伏太陽能集熱板圖紙', emoji: '☀️', tech: 'SPEC-ARCH-ECO-03', fact: '將陽光轉化為清潔電能，達成 100% 能源自給。' },
  { id: 'bp_mycorrhiza', name: '📐 地底菌根共生通訊網絡圖紙', emoji: '🍄', tech: 'SPEC-BIO-CYCLE-09', fact: '森林樹木透過地底菌絲網絡即時分享水分與防禦警訊。' },
  { id: 'bp_escapement', name: '📐 精密擒縱輪與擺輪調速圖紙', emoji: '⚙️', tech: 'SPEC-MECH-TIME-12', fact: '將發條彈力轉化為精確每秒跳動的計時心臟。' },
  { id: 'bp_biolum', name: '📐 深海生物冷光器官解剖圖紙', emoji: '✨', tech: 'SPEC-OCEAN-DEEP-42', fact: '螢光素與螢光素酶結合產生幾乎 100% 零散熱的冷光。' },
  { id: 'bp_hexagon', name: '📐 六角晶格抗震受力結構圖紙', emoji: '🔷', tech: 'SPEC-GEOM-HEX-88', fact: '120度夾角達到最小周長包圍最大面積的極限力學。' },
  { id: 'bp_gravity', name: '📐 行星引力彈弓與逃逸速度圖紙', emoji: '🚀', tech: 'SPEC-ASTRO-ORBIT-01', fact: '借助行星重力場加速推進，節省 90% 太空燃料。' },
];

export const MORAL_THEMES_POOL = [
  { id: 'courage', name: '勇氣與探索精神', emoji: '🦁', desc: '不懼未知考驗，用智慧與毅力化解危機。' },
  { id: 'empathy', name: '同理心與真誠友誼', emoji: '❤️', desc: '傾聽他人心聲，互相扶持度過難關。' },
  { id: 'eco', name: '綠色環保與永續愛護', emoji: '🌿', desc: '珍惜地球自然資源，守護生態平衡。' },
  { id: 'curiosity', name: '科學思維與求知好奇', emoji: '💡', desc: '勇於提出疑問，透過觀察與實驗找尋真理。' },
];

export const OfflineStoryWorkshop: React.FC<OfflineStoryWorkshopProps> = ({
  downloadedBooks = [],
  allBooks = [],
  userProfile,
  questCrystals = 450,
  onAddCrystals,
  onSelectBook,
  onOpenBlueprintGuide,
}) => {
  // Step in Story Creation Wizard
  // 1: Pick Character, 2: Pick Setting, 3: Pick Blueprint Artifact, 4: Pick Moral Theme, 5: Story Interactive Reader
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Selected Elements
  const [selectedCharacter, setSelectedCharacter] = useState<string>('prince');
  const [selectedSetting, setSelectedSetting] = useState<string>('space');
  const [selectedBlueprint, setSelectedBlueprint] = useState<string>('bp_solar');
  const [selectedMoralTheme, setSelectedMoralTheme] = useState<string>('courage');

  // Active Story Branch State
  const [currentChapterIndex, setCurrentChapterIndex] = useState<number>(0);
  const [userDecisions, setUserDecisions] = useState<string[]>([]);
  const [isStoryComplete, setIsStoryComplete] = useState<boolean>(false);
  const [activeVoiceRole, setActiveVoiceRole] = useState<VoiceRole>('fairy');

  // Saved Stories in LocalStorage
  const [savedStories, setSavedStories] = useState<SavedStory[]>(() => {
    try {
      const saved = localStorage.getItem('pwa_offline_saved_stories');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Story generation engine (deterministic rich offline generation based on selected parameters)
  const generatedStoryData = useMemo(() => {
    const char = CHARACTERS_POOL.find((c) => c.id === selectedCharacter) || CHARACTERS_POOL[0];
    const setting = SETTINGS_POOL.find((s) => s.id === selectedSetting) || SETTINGS_POOL[0];
    const bp = BLUEPRINTS_POOL.find((b) => b.id === selectedBlueprint) || BLUEPRINTS_POOL[0];
    const moral = MORAL_THEMES_POOL.find((m) => m.id === selectedMoralTheme) || MORAL_THEMES_POOL[0];

    const title = `《${char.name}的${setting.name}大冒險》`;

    const chapters: GeneratedStoryChapter[] = [
      {
        chapterNumber: 1,
        title: '第 1 章：來自遠方的神秘藍圖',
        illustrationEmoji: `${char.emoji} 📜 ${setting.emoji}`,
        content: `在一個風和日麗的清晨，${char.title}【${char.name}】在${setting.name}漫步時，意外在古老石台前發現了一張散發著淡淡光芒的秘密藍圖——【${bp.name}】！圖紙上詳細標註了【${bp.fact}】的奧秘。面對這份未知的科學寶藏，${char.name}的心中燃起了${moral.name}的火苗。`,
        questionPrompt: `此時，遠處傳來陣陣奇特的訊號聲，${char.name}該做出什麼決定？`,
        choices: [
          {
            text: `A. 立即啟動【${bp.name}】，前往訊號源頭一探究竟！`,
            nextBranch: 'brave_forward',
            attributeReward: '勇氣值 +15',
          },
          {
            text: `B. 先停下腳步仔細研讀圖紙上的技術參數，確保萬無一失。`,
            nextBranch: 'careful_study',
            attributeReward: '智慧值 +15',
          },
        ],
        keyVocab: {
          word: 'Blueprint',
          phonetic: '/ˈbluːprɪnt/',
          meaning: '工程圖紙、科學藍圖',
        },
      },
      {
        chapterNumber: 2,
        title: '第 2 章：迷霧中的關鍵考驗',
        illustrationEmoji: `⚙️ ${bp.emoji} 🌪️`,
        content: `進入${setting.name}的深處後，周圍突然湧現了一陣神秘的能量風暴！儀表板上的指針劇烈晃動。${char.name}回想起圖紙上記載的關鍵原理，發現只要正確調校【${bp.tech}】的能量回路，就能形成一道堅固的共振保護屏障，同時還能為迷路的同伴指引正確方向！`,
        questionPrompt: `面對即將到來的考驗，${char.name}要如何運用身邊的夥伴與科學力量？`,
        choices: [
          {
            text: `A. 展開共振屏障，並大聲呼喚周圍的夥伴互相握緊雙手！`,
            nextBranch: 'unity_power',
            attributeReward: '同理心 +20',
          },
          {
            text: `B. 巧妙藉由環境中的自然能量，將風暴轉化為前進的推進力！`,
            nextBranch: 'smart_engineer',
            attributeReward: '創造力 +20',
          },
        ],
        keyVocab: {
          word: 'Resonance',
          phonetic: '/ˈrezənəns/',
          meaning: '共振、共鳴',
        },
      },
      {
        chapterNumber: 3,
        title: '第 3 章：榮耀奇蹟與晨光',
        illustrationEmoji: `🎉 🌟 🏆 💖`,
        content: `在${moral.name}的指引與大家的齊心協力下，風暴終於消散，天際灑下溫暖燦爛的光芒！【${char.name}】不僅成功解鎖了【${bp.name}】的全部力量，更讓${setting.name}重獲生機與和平。大家圍繞在身旁歡呼慶祝，這一刻，所有人都明白了：真正的偉大，源自於對世界的愛與永不放棄的探索之心！`,
        questionPrompt: `冒險完美落幕，你想為這段傳奇旅程刻下什麼紀念金句？`,
        choices: [
          {
            text: `「用智慧理解世界，用愛心擁抱彼此！」`,
            nextBranch: 'wisdom_quote',
            attributeReward: '獲得【傳奇故事大師】徽章',
          },
          {
            text: `「每一次探索都是心靈與勇氣的綻放！」`,
            nextBranch: 'courage_quote',
            attributeReward: '獲得【星空探索家】徽章',
          },
        ],
        keyVocab: {
          word: 'Exploration',
          phonetic: '/ˌekspləˈreɪʃn/',
          meaning: '探索、探勘',
        },
      },
    ];

    return { title, char, setting, bp, moral, chapters };
  }, [selectedCharacter, selectedSetting, selectedBlueprint, selectedMoralTheme]);

  // Handle Make Choice in Chapter
  const handleSelectChoice = (choiceText: string) => {
    playStarChime();
    setUserDecisions((prev) => [...prev, choiceText]);

    if (currentChapterIndex < generatedStoryData.chapters.length - 1) {
      setCurrentChapterIndex((prev) => prev + 1);
    } else {
      setIsStoryComplete(true);
      if (onAddCrystals) onAddCrystals(50);
    }
  };

  // Speak Current Chapter Content
  const handleSpeakChapter = () => {
    playStarChime();
    const cur = generatedStoryData.chapters[currentChapterIndex];
    const text = `${cur.title}。${cur.content}。核心生字是：${cur.keyVocab.word}，意思是${cur.keyVocab.meaning}。${cur.questionPrompt}`;
    speakText(text, 'zh-TW', 1.0, activeVoiceRole);
  };

  // Save Story to LocalStorage
  const handleSaveStory = () => {
    playStarChime();
    const newSaved: SavedStory = {
      id: `story-${Date.now()}`,
      title: generatedStoryData.title,
      character: generatedStoryData.char.name,
      setting: generatedStoryData.setting.name,
      blueprint: generatedStoryData.bp.name,
      moralTheme: generatedStoryData.moral.name,
      createdAt: new Date().toLocaleDateString('zh-TW', {
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      chapters: generatedStoryData.chapters,
      selectedChoices: userDecisions,
      endingSummary: '在勇氣與智慧的引領下，冒險圓滿大成功！',
      starsEarned: 3,
    };

    const updated = [newSaved, ...savedStories];
    setSavedStories(updated);
    try {
      localStorage.setItem('pwa_offline_saved_stories', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  // Restart Story Workshop
  const handleRestartWorkshop = () => {
    playPageTurnSound();
    setCurrentStep(1);
    setCurrentChapterIndex(0);
    setUserDecisions([]);
    setIsStoryComplete(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn text-slate-100 select-none">
      {/* 🌟 1. STORY WORKSHOP BANNER */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-slate-950 via-amber-950/60 to-purple-950/80 border-2 border-amber-400/50 shadow-2xl space-y-4 relative overflow-hidden">
        <div className="absolute top-0 right-10 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-yellow-600 flex items-center justify-center text-3xl shadow-xl border-2 border-amber-200 shrink-0 animate-bounce">
              🪄
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg sm:text-xl font-black text-amber-300 flex items-center gap-2">
                  <span>離線故事生成工坊 (Offline Story Workshop)</span>
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/30 text-amber-200 border border-amber-400/50 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  <span>離線創作 ‧ 互動分支 ‧ 雙語生字</span>
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/30 text-emerald-300 border border-emerald-400/50">
                  完成領取 +50 💎
                </span>
              </div>
              <p className="text-xs font-bold text-slate-300 mt-1 leading-relaxed">
                結合已解鎖的「角色、冒險場景、科普圖紙與品格主題」，隨心所欲生成多章節互動式繪本故事，還支援即時 AI 語音朗讀與多重分支選擇！
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap self-start lg:self-auto">
            {onOpenBlueprintGuide && (
              <button
                onClick={() => {
                  playStarChime();
                  onOpenBlueprintGuide();
                }}
                className="px-3.5 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-400/40 font-black text-xs flex items-center gap-1.5 cursor-pointer shadow"
              >
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span>📐 離線圖紙簡介</span>
              </button>
            )}

            {currentStep === 5 && (
              <button
                onClick={handleRestartWorkshop}
                className="px-3.5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-400/40 font-black text-xs flex items-center gap-1.5 cursor-pointer shadow"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>重新自訂故事</span>
              </button>
            )}
          </div>
        </div>

        {/* Stepper Progress Indicator */}
        <div className="flex items-center justify-between gap-1 pt-3 border-t border-amber-500/30 relative z-10 overflow-x-auto custom-scrollbar">
          {[
            { step: 1, label: '1. 選擇主角', emoji: '👑' },
            { step: 2, label: '2. 冒險場景', emoji: '🪐' },
            { step: 3, label: '3. 科普圖紙', emoji: '📐' },
            { step: 4, label: '4. 品格主題', emoji: '🦁' },
            { step: 5, label: '5. 故事閱讀', emoji: '📖' },
          ].map((s) => (
            <button
              key={s.step}
              onClick={() => {
                if (s.step <= currentStep || currentStep === 5) {
                  playPageTurnSound();
                  setCurrentStep(s.step);
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all whitespace-nowrap cursor-pointer ${
                currentStep === s.step
                  ? 'bg-amber-400 text-slate-950 shadow-md scale-105'
                  : currentStep > s.step
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-slate-900/60 text-slate-500 border border-slate-800'
              }`}
            >
              <span>{s.emoji}</span>
              <span>{s.label}</span>
              {currentStep > s.step && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
            </button>
          ))}
        </div>
      </div>

      {/* =========================================================================
          STEP 1: 👑 選擇主角 (CHARACTER SELECTION)
         ========================================================================= */}
      {currentStep === 1 && (
        <div className="space-y-5 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h4 className="text-sm sm:text-base font-black text-amber-300 flex items-center gap-2">
              <span>👑 第一步：請選擇故事的主角</span>
            </h4>
            <span className="text-xs font-bold text-slate-400">已收錄 8 位個性主角</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {CHARACTERS_POOL.map((char) => {
              const isSelected = selectedCharacter === char.id;
              return (
                <div
                  key={char.id}
                  onClick={() => {
                    playStarChime();
                    setSelectedCharacter(char.id);
                  }}
                  className={`p-4 rounded-3xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                    isSelected
                      ? 'bg-amber-500/20 border-amber-400 shadow-xl shadow-amber-950/50 scale-105 ring-2 ring-amber-400'
                      : 'bg-slate-900/90 border-slate-800 hover:border-amber-400/50 hover:bg-slate-900'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-700 flex items-center justify-center text-3xl shadow">
                      {char.emoji}
                    </div>
                    <div>
                      <h5 className="text-base font-black text-white flex items-center gap-1.5">
                        <span>{char.name}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40">
                          {char.title}
                        </span>
                      </h5>
                      <p className="text-xs font-bold text-slate-300 mt-1 leading-relaxed">
                        {char.desc}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`text-xs font-black ${isSelected ? 'text-amber-300' : 'text-slate-500'}`}>
                      {isSelected ? '✓ 已選擇' : '點擊選取'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => {
                playPageTurnSound();
                setCurrentStep(2);
              }}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-sm flex items-center gap-2 shadow-lg cursor-pointer transition-transform hover:scale-105"
            >
              <span>下一步：選擇冒險場景</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          STEP 2: 🪐 選擇冒險場景 (SETTING SELECTION)
         ========================================================================= */}
      {currentStep === 2 && (
        <div className="space-y-5 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h4 className="text-sm sm:text-base font-black text-amber-300 flex items-center gap-2">
              <span>🪐 第二步：請選擇故事的冒險舞台</span>
            </h4>
            <button
              onClick={() => setCurrentStep(1)}
              className="text-xs font-bold text-slate-400 hover:text-white underline cursor-pointer"
            >
              ◀ 返回上一步
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SETTINGS_POOL.map((setting) => {
              const isSelected = selectedSetting === setting.id;
              return (
                <div
                  key={setting.id}
                  onClick={() => {
                    playStarChime();
                    setSelectedSetting(setting.id);
                  }}
                  className={`p-5 rounded-3xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                    isSelected
                      ? 'bg-purple-500/20 border-purple-400 shadow-xl shadow-purple-950/50 scale-105 ring-2 ring-purple-400'
                      : 'bg-slate-900/90 border-slate-800 hover:border-purple-400/50'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-700 flex items-center justify-center text-3xl shadow">
                      {setting.emoji}
                    </div>
                    <div>
                      <h5 className="text-base font-black text-white">{setting.name}</h5>
                      <p className="text-xs font-bold text-slate-300 mt-1 leading-relaxed">
                        {setting.desc}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`text-xs font-black ${isSelected ? 'text-purple-300' : 'text-slate-500'}`}>
                      {isSelected ? '✓ 已選擇' : '點擊選取'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => setCurrentStep(1)}
              className="px-5 py-2.5 rounded-2xl bg-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-700 cursor-pointer"
            >
              ◀ 上一步
            </button>
            <button
              onClick={() => {
                playPageTurnSound();
                setCurrentStep(3);
              }}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-400 to-indigo-500 hover:from-purple-300 hover:to-indigo-400 text-slate-950 font-black text-sm flex items-center gap-2 shadow-lg cursor-pointer transition-transform hover:scale-105"
            >
              <span>下一步：選擇科普圖紙</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          STEP 3: 📐 選擇科普圖紙 (BLUEPRINT ARTIFACT SELECTION)
         ========================================================================= */}
      {currentStep === 3 && (
        <div className="space-y-5 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h4 className="text-sm sm:text-base font-black text-amber-300 flex items-center gap-2">
              <span>📐 第三步：選擇故事核心的科普圖紙道具</span>
            </h4>
            <button
              onClick={() => setCurrentStep(2)}
              className="text-xs font-bold text-slate-400 hover:text-white underline cursor-pointer"
            >
              ◀ 返回上一步
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {BLUEPRINTS_POOL.map((bp) => {
              const isSelected = selectedBlueprint === bp.id;
              return (
                <div
                  key={bp.id}
                  onClick={() => {
                    playStarChime();
                    setSelectedBlueprint(bp.id);
                  }}
                  className={`p-5 rounded-3xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                    isSelected
                      ? 'bg-cyan-500/20 border-cyan-400 shadow-xl shadow-cyan-950/50 scale-105 ring-2 ring-cyan-400'
                      : 'bg-slate-900/90 border-slate-800 hover:border-cyan-400/50'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-700 flex items-center justify-center text-2xl shadow">
                        {bp.emoji}
                      </div>
                      <span className="px-2 py-0.5 rounded-lg text-[9px] font-mono font-bold bg-slate-950 text-cyan-300 border border-cyan-400/40">
                        {bp.tech}
                      </span>
                    </div>
                    <div>
                      <h5 className="text-sm font-black text-white">{bp.name}</h5>
                      <p className="text-xs font-bold text-slate-300 mt-1 leading-relaxed">
                        {bp.fact}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`text-xs font-black ${isSelected ? 'text-cyan-300' : 'text-slate-500'}`}>
                      {isSelected ? '✓ 已選擇' : '點擊選取'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => setCurrentStep(2)}
              className="px-5 py-2.5 rounded-2xl bg-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-700 cursor-pointer"
            >
              ◀ 上一步
            </button>
            <button
              onClick={() => {
                playPageTurnSound();
                setCurrentStep(4);
              }}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-black text-sm flex items-center gap-2 shadow-lg cursor-pointer transition-transform hover:scale-105"
            >
              <span>下一步：選擇品格主題</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          STEP 4: 🦁 選擇品格主題 (MORAL THEME SELECTION)
         ========================================================================= */}
      {currentStep === 4 && (
        <div className="space-y-5 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h4 className="text-sm sm:text-base font-black text-amber-300 flex items-center gap-2">
              <span>🦁 第四步：選擇故事的心靈品格與教育核心</span>
            </h4>
            <button
              onClick={() => setCurrentStep(3)}
              className="text-xs font-bold text-slate-400 hover:text-white underline cursor-pointer"
            >
              ◀ 返回上一步
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {MORAL_THEMES_POOL.map((moral) => {
              const isSelected = selectedMoralTheme === moral.id;
              return (
                <div
                  key={moral.id}
                  onClick={() => {
                    playStarChime();
                    setSelectedMoralTheme(moral.id);
                  }}
                  className={`p-5 rounded-3xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                    isSelected
                      ? 'bg-rose-500/20 border-rose-400 shadow-xl shadow-rose-950/50 scale-105 ring-2 ring-rose-400'
                      : 'bg-slate-900/90 border-slate-800 hover:border-rose-400/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-700 flex items-center justify-center text-3xl shadow shrink-0">
                      {moral.emoji}
                    </div>
                    <div>
                      <h5 className="text-base font-black text-white">{moral.name}</h5>
                      <p className="text-xs font-bold text-slate-300 mt-0.5 leading-relaxed">
                        {moral.desc}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`text-xs font-black ${isSelected ? 'text-rose-300' : 'text-slate-500'}`}>
                      {isSelected ? '✓ 已選擇' : '點擊選取'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-4">
            <button
              onClick={() => setCurrentStep(3)}
              className="px-5 py-2.5 rounded-2xl bg-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-700 cursor-pointer"
            >
              ◀ 上一步
            </button>
            <button
              onClick={() => {
                playStarChime();
                setCurrentStep(5);
                setCurrentChapterIndex(0);
                setUserDecisions([]);
                setIsStoryComplete(false);
              }}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-sm flex items-center gap-2 shadow-2xl cursor-pointer transition-transform hover:scale-105"
            >
              <Sparkles className="w-4 h-4" />
              <span>🪄 立即生成我的互動繪本故事！</span>
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          STEP 5: 📖 故事互動閱讀器 (INTERACTIVE STORY READER WITH TTS)
         ========================================================================= */}
      {currentStep === 5 && (
        <div className="space-y-6 animate-fadeIn">
          {/* Story Top Info Banner */}
          <div className="p-4 sm:p-5 rounded-3xl bg-slate-900 border-2 border-amber-400/60 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl">{generatedStoryData.char.emoji}</span>
                <h3 className="text-base sm:text-lg font-black text-amber-300">
                  {generatedStoryData.title}
                </h3>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mt-1 flex-wrap">
                <span>舞台：{generatedStoryData.setting.name}</span>
                <span>‧</span>
                <span>圖紙：{generatedStoryData.bp.name}</span>
                <span>‧</span>
                <span>品格：{generatedStoryData.moral.name}</span>
              </div>
            </div>

            {/* Narrator Voice Picker & Play All */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleSpeakChapter}
                className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow cursor-pointer"
              >
                <Volume2 className="w-4 h-4" />
                <span>朗讀本章節</span>
              </button>

              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                {[
                  { role: 'fairy' as VoiceRole, icon: '🧚‍♀️', label: '仙子' },
                  { role: 'mom' as VoiceRole, icon: '👩‍👧', label: '媽媽' },
                  { role: 'wizard' as VoiceRole, icon: '🦉', label: '博士' },
                ].map((v) => (
                  <button
                    key={v.role}
                    onClick={() => {
                      playStarChime();
                      setActiveVoiceRole(v.role);
                    }}
                    className={`p-1.5 rounded-lg text-sm transition-all cursor-pointer ${
                      activeVoiceRole === v.role
                        ? 'bg-amber-400 text-slate-950 scale-110 shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                    title={v.label}
                  >
                    <span>{v.icon}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Chapter Progress Tabs */}
          <div className="flex items-center gap-2">
            {generatedStoryData.chapters.map((ch, idx) => {
              const isDone = idx < currentChapterIndex || isStoryComplete;
              const isCurrent = idx === currentChapterIndex;
              return (
                <div
                  key={ch.chapterNumber}
                  className={`flex-1 py-2 px-3 rounded-2xl border text-center text-xs font-black transition-all ${
                    isCurrent
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300 scale-105 ring-2 ring-amber-400'
                      : isDone
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                      : 'bg-slate-950 border-slate-800 text-slate-500'
                  }`}
                >
                  第 {ch.chapterNumber} 章 {isDone && !isCurrent ? '✓' : ''}
                </div>
              );
            })}
          </div>

          {/* Active Chapter Book Page Card */}
          {!isStoryComplete ? (
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-950 border-2 border-amber-500/40 shadow-2xl space-y-6 relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h4 className="text-lg font-black text-amber-300">
                  {generatedStoryData.chapters[currentChapterIndex].title}
                </h4>
                <div className="text-3xl">
                  {generatedStoryData.chapters[currentChapterIndex].illustrationEmoji}
                </div>
              </div>

              {/* Story Content Paragraph */}
              <div className="space-y-4">
                <p className="text-base sm:text-lg font-bold text-slate-200 leading-relaxed tracking-wide">
                  {generatedStoryData.chapters[currentChapterIndex].content}
                </p>

                {/* Key Vocabulary Flashcard */}
                <div className="p-3.5 rounded-2xl bg-slate-900 border border-cyan-500/30 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">💡</span>
                    <div>
                      <span className="text-xs font-mono font-bold text-cyan-300">
                        關鍵生字：{generatedStoryData.chapters[currentChapterIndex].keyVocab.word} (
                        {generatedStoryData.chapters[currentChapterIndex].keyVocab.phonetic})
                      </span>
                      <p className="text-[11px] font-bold text-slate-400">
                        釋義：{generatedStoryData.chapters[currentChapterIndex].keyVocab.meaning}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      playStarChime();
                      speakText(
                        `${generatedStoryData.chapters[currentChapterIndex].keyVocab.word}。${generatedStoryData.chapters[currentChapterIndex].keyVocab.meaning}`,
                        'en-US',
                        0.9
                      );
                    }}
                    className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500 hover:text-slate-950 transition-colors"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Choice Prompt & Buttons */}
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-amber-400/40 space-y-3">
                <div className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-amber-400 animate-spin-slow" />
                  <span>
                    你的故事分支選擇：{generatedStoryData.chapters[currentChapterIndex].questionPrompt}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {generatedStoryData.chapters[currentChapterIndex].choices.map((choice, cIdx) => (
                    <button
                      key={cIdx}
                      onClick={() => handleSelectChoice(choice.text)}
                      className="p-4 rounded-2xl bg-slate-950 border border-amber-500/30 hover:border-amber-400 hover:bg-amber-500/10 text-left space-y-1.5 transition-all cursor-pointer group"
                    >
                      <div className="font-black text-sm text-white group-hover:text-amber-300">
                        {choice.text}
                      </div>
                      <div className="text-[11px] font-bold text-emerald-400">
                        ✨ {choice.attributeReward}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Story Completion Victory Celebration Card */
            <div className="p-8 rounded-3xl bg-slate-900 border-2 border-amber-400 shadow-2xl text-center space-y-6 animate-fadeIn">
              <div className="inline-block p-4 rounded-3xl bg-amber-400/20 text-amber-300 border border-amber-400/50">
                <Award className="w-12 h-12 animate-bounce" />
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-black text-amber-300">
                  🎉 恭喜！你的專屬繪本故事創作圓滿完成！
                </h3>
                <p className="text-sm font-bold text-slate-300 max-w-lg mx-auto leading-relaxed">
                  在你的引領下，{generatedStoryData.char.name}成功運用【{generatedStoryData.bp.name}】完成了精彩的大冒險，展現了最閃耀的{generatedStoryData.moral.name}！
                </p>
              </div>

              {/* Reward Pills */}
              <div className="flex items-center justify-center gap-3 flex-wrap">
                <div className="px-4 py-2 rounded-2xl bg-slate-950 border border-amber-500/40 text-amber-300 font-black text-sm flex items-center gap-2">
                  <span>💎 獲得知識水晶：+50 水晶</span>
                </div>
                <div className="px-4 py-2 rounded-2xl bg-slate-950 border border-purple-500/40 text-purple-300 font-black text-sm flex items-center gap-2">
                  <span>🏅 榮獲【傳奇小作家】榮譽勳章</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-3 flex-wrap pt-2">
                <button
                  onClick={handleSaveStory}
                  className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm flex items-center gap-2 shadow-lg cursor-pointer"
                >
                  <Bookmark className="w-4 h-4" />
                  <span>💾 儲存至我的離線故事書架</span>
                </button>

                <button
                  onClick={handleRestartWorkshop}
                  className="px-6 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-400/40 font-black text-sm flex items-center gap-2 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>✨ 創作另一篇新故事</span>
                </button>
              </div>
            </div>
          )}

          {/* Saved Stories Library */}
          {savedStories.length > 0 && (
            <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
              <h4 className="text-sm font-black text-amber-300 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-400" />
                <span>📚 我在離線工坊創作的故事書架 ({savedStories.length} 篇)</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {savedStories.map((story) => (
                  <div
                    key={story.id}
                    className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-400/50 space-y-2 transition-all"
                  >
                    <h5 className="font-black text-sm text-white truncate">{story.title}</h5>
                    <div className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5 flex-wrap">
                      <span>主角：{story.character}</span>
                      <span>‧</span>
                      <span>場景：{story.setting}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-800/80 flex items-center justify-between">
                      <span>{story.createdAt}</span>
                      <span className="text-amber-400 font-bold">⭐⭐⭐</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
