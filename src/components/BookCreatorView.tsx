import React, { useState, useEffect } from 'react';
import {
  Wand2, Sparkles, BookOpen, Heart, Lightbulb, ArrowRight, CheckCircle2, Palette, Eye, Image as ImageIcon,
  Check, Layout, Compass, ListOrdered, Layers, BookMarked, Music, Volume2, Play, Square, Gauge, Activity, Radio, VolumeX, Flame, Clock,
  RefreshCw, Dices, ChevronRight, Bookmark, ShieldCheck, Sparkle
} from 'lucide-react';
import { Book, BgMusicTrack, StoryStructureId, StoryStructureTemplate } from '../types';
import { STORY_STRUCTURE_TEMPLATES } from '../data/storyStructures';
import {
  playStarChime, playPageTurnSound, playBackgroundAmbience, stopBackgroundAmbience, BG_MUSIC_PLAYLIST
} from '../utils/audio';
import { InspirationWheel } from './InspirationWheel';
import { CreativeInspirationCards } from './CreativeInspirationCards';
import { CreativeSparkGenerator } from './CreativeSparkGenerator';
import { AiBookCreationAssistantModal } from './AiBookCreationAssistantModal';

interface BookCreatorViewProps {
  onBookCreated: (newBook: Book) => void;
  onSelectBook: (book: Book) => void;
  onAwardStar: (amount: number) => void;
  initialPrompt?: string;
}

export const BookCreatorView: React.FC<BookCreatorViewProps> = ({
  onBookCreated,
  onSelectBook,
  onAwardStar,
  initialPrompt = '',
}) => {
  const [topicPrompt, setTopicPrompt] = useState(initialPrompt);
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);

  useEffect(() => {
    if (initialPrompt) {
      setTopicPrompt(initialPrompt);
    }
  }, [initialPrompt]);

  // Story Structure Templates (故事結構範本) State - Default to 'hero-journey'
  const [selectedStructureId, setSelectedStructureId] = useState<StoryStructureId>('hero-journey');
  const [structureEditMode, setStructureEditMode] = useState<'presets' | 'step_by_step' | 'full_text'>('presets');
  const [customStepInputs, setCustomStepInputs] = useState<Record<number, string>>({});

  const activeStructure = STORY_STRUCTURE_TEMPLATES.find((t) => t.id === selectedStructureId) || STORY_STRUCTURE_TEMPLATES[0];

  const handleSelectStructure = (structureId: StoryStructureId) => {
    setSelectedStructureId(structureId);
    playPageTurnSound();
    const template = STORY_STRUCTURE_TEMPLATES.find((t) => t.id === structureId);
    if (template && template.id !== 'free') {
      setTopicPrompt(template.placeholder);
      // Pre-fill default step inputs
      const initialSteps: Record<number, string> = {};
      template.steps.forEach((s) => {
        initialSteps[s.stepNumber] = s.exampleText;
      });
      setCustomStepInputs(initialSteps);
    }
  };

  const handleStepInputChange = (stepNum: number, value: string) => {
    setCustomStepInputs((prev) => {
      const updated = { ...prev, [stepNum]: value };
      // Also update the synthesized prompt
      if (activeStructure.steps.length > 0) {
        const combined = activeStructure.steps
          .map((s) => `【${s.title}】：${updated[s.stepNumber] || s.exampleText}`)
          .join('\n');
        setTopicPrompt(combined);
      }
      return updated;
    });
  };

  const handleApplyPresetTheme = (themeText: string) => {
    playStarChime();
    setTopicPrompt(themeText);
  };

  const handleRandomizeSkeleton = () => {
    playStarChime();
    const randomTheme = activeStructure.exampleThemes[Math.floor(Math.random() * activeStructure.exampleThemes.length)];
    if (randomTheme) {
      setTopicPrompt(randomTheme);
    }
  };

  React.useEffect(() => {
    if (initialPrompt) {
      setTopicPrompt(initialPrompt);
    }
  }, [initialPrompt]);
  const [ageGroup, setAgeGroup] = useState<'3-5' | '6-8' | '9-12'>('6-8');
  const [artStyle, setArtStyle] = useState('溫馨水彩繪本');
  const [category, setCategory] = useState<'Adventure' | 'Fairy Tale' | 'Nature & Science' | 'Friendship & Love'>('Adventure');
  const [characterNames, setCharacterNames] = useState('');
  const [moralLesson, setMoralLesson] = useState('');

  // 🎵 AI Background Music & Audio Synth State
  const [selectedBgMusic, setSelectedBgMusic] = useState<BgMusicTrack>('forest');
  const [isPlayingMusicPreview, setIsPlayingMusicPreview] = useState(false);
  const [musicVolume, setMusicVolume] = useState(0.3);

  // Auto-Match Music Based on Keywords
  const handleAutoMatchMusic = (textPrompt: string) => {
    const text = textPrompt.toLowerCase();
    if (text.includes('太空') || text.includes('星') || text.includes('銀河') || text.includes('宇宙')) {
      setSelectedBgMusic('space');
    } else if (text.includes('海') || text.includes('水') || text.includes('鯨') || text.includes('魚') || text.includes('島')) {
      setSelectedBgMusic('ocean');
    } else if (text.includes('森林') || text.includes('樹') || text.includes('鳥') || text.includes('動物') || text.includes('花')) {
      setSelectedBgMusic('forest');
    } else if (text.includes('魔法') || text.includes('城堡') || text.includes('精靈') || text.includes('王國')) {
      setSelectedBgMusic('magic');
    } else if (text.includes('雨') || text.includes('雲') || text.includes('風')) {
      setSelectedBgMusic('rain');
    } else if (text.includes('冒險') || text.includes('探險') || text.includes('尋寶') || text.includes('地圖')) {
      setSelectedBgMusic('adventure');
    } else if (text.includes('睡') || text.includes('夢') || text.includes('搖籃') || text.includes('晚安')) {
      setSelectedBgMusic('lullaby');
    } else if (text.includes('家') || text.includes('營火') || text.includes('客廳') || text.includes('溫馨')) {
      setSelectedBgMusic('cozy');
    } else {
      setSelectedBgMusic('forest');
    }
    playStarChime();
  };

  const handleToggleMusicPreview = (track: BgMusicTrack) => {
    if (isPlayingMusicPreview && selectedBgMusic === track) {
      stopBackgroundAmbience();
      setIsPlayingMusicPreview(false);
    } else {
      setSelectedBgMusic(track);
      playBackgroundAmbience(track, musicVolume);
      setIsPlayingMusicPreview(true);
    }
  };

  useEffect(() => {
    return () => {
      stopBackgroundAmbience();
    };
  }, []);

  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [createdBook, setCreatedBook] = useState<Book | null>(null);

  // Style gallery modal / expanded state
  const [showStyleGallery, setShowStyleGallery] = useState(true);
  const [previewSceneIndex, setPreviewSceneIndex] = useState(0);

  const sampleScenes = [
    { title: '🌲 魔法森林與小熊', desc: '綠意盎然的森林小徑與溫暖陽光' },
    { title: '🚀 星空銀河太空船', desc: '璀璨夜空與夢幻藍紫色宇宙' },
    { title: '🐬 奇幻深海城堡', desc: '海底珊瑚與閃耀的水下光芒' },
  ];

  const artStyleGalleries = [
    {
      id: '溫馨水彩繪本',
      label: '🎨 溫馨水彩畫',
      tag: 'Watercolor',
      desc: '柔和細膩的水彩筆觸，色彩自然暈染',
      previewUrls: [
        'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=500',
        'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=500',
        'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?q=80&w=500',
      ],
      features: ['柔和溫暖暈染', '手繪藝術質感', '溫馨故事首選'],
      badgeColor: 'bg-blue-100 text-blue-900 border-blue-300',
    },
    {
      id: '點陣像素風格',
      label: '👾 點陣像素風',
      tag: 'Pixel Art',
      desc: '復古 8-Bit 電玩插畫，懷舊點陣視覺',
      previewUrls: [
        'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=500',
        'https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=500',
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=500',
      ],
      features: ['復古 8-Bit 電玩風', '清晰幾何點陣', '冒險解謎感極佳'],
      badgeColor: 'bg-purple-100 text-purple-900 border-purple-300',
    },
    {
      id: '趣味蠟筆風格',
      label: '🖍️ 趣味蠟筆風',
      tag: 'Crayon',
      desc: '質樸厚實童趣塗鴉，紙張細緻紋理',
      previewUrls: [
        'https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=500',
        'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?q=80&w=500',
        'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=500',
      ],
      features: ['質樸筆觸顆粒', '豐富童趣色彩', '親切塗鴉感受'],
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
    },
    {
      id: '黏土手作風格',
      label: '🧸 黏土手作風',
      tag: 'Claymation',
      desc: '立體活潑黏土質感，可愛微距光影',
      previewUrls: [
        'https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=500',
        'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=500',
        'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=500',
      ],
      features: ['立體微距塑形', '可愛玩具光影', '童話親和力足'],
      badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    },
    {
      id: '剪紙與童話風',
      label: '✂️ 夢幻剪紙風',
      tag: 'Paper Cutout',
      desc: '層次豐富光影幾何，立體層次堆疊',
      previewUrls: [
        'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?q=80&w=500',
        'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?q=80&w=500',
        'https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=500',
      ],
      features: ['立體剪紙投影', '精緻幾何線條', '夢幻經典氛圍'],
      badgeColor: 'bg-rose-100 text-rose-900 border-rose-300',
    },
    {
      id: '卡通動畫風格',
      label: '🌟 經典卡通風',
      tag: 'Cartoon',
      desc: '明亮歡樂動漫色彩，鮮明角色輪廓',
      previewUrls: [
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=500',
        'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=500',
        'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=500',
      ],
      features: ['鮮明動漫色彩', '生動表情角色', '大眾接受度高'],
      badgeColor: 'bg-orange-100 text-orange-900 border-orange-300',
    },
  ];

  const quickIdeas = [
    '一隻想要飛上月球的小兔子和太空貓咪',
    '學會跟時間做朋友的小機器人',
    '潛入深海尋找失落音符的小鯨魚',
    '一座會隨四季變換顏色的魔法城堡',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicPrompt.trim()) return;

    setIsGenerating(true);
    setErrorMessage('');
    setCreatedBook(null);

    try {
      const formattedCustomSteps = activeStructure.steps.map((s) => ({
        stepNumber: s.stepNumber,
        title: s.title,
        content: customStepInputs[s.stepNumber] || s.exampleText || '',
      }));

      const res = await fetch('/api/gemini/generate-book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: topicPrompt,
          ageGroup,
          artStyle,
          category,
          characterNames,
          moralLesson,
          storyStructure: activeStructure,
          customSteps: formattedCustomSteps,
        }),
      });

      if (!res.ok) {
        throw new Error('生成繪本失敗，請稍後重試。');
      }

      const newBook: Book = await res.json();
      newBook.bgMusicTrack = selectedBgMusic;
      setCreatedBook(newBook);
      onBookCreated(newBook);
      playStarChime();
      onAwardStar(10); // Award 10 stars for creating a book!
    } catch (err: any) {
      setErrorMessage(err.message || '故事創作遇到狀況，請再試一次！');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8" id="creator-view-container">
      
      {/* Header Banner */}
      <div className="text-center space-y-3 bg-gradient-to-r from-orange-400 via-amber-400 to-amber-300 p-8 rounded-3xl border border-amber-300 shadow-md">
        <div className="inline-flex items-center gap-1.5 bg-white/80 px-3.5 py-1 rounded-full text-amber-950 font-extrabold text-xs">
          <Sparkles className="w-4 h-4 text-orange-600" />
          <span>AI 繪本創作者工坊</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-amber-950">
          創作屬於你的獨一無二多語言繪本
        </h1>
        <p className="text-amber-900 text-sm font-medium max-w-xl mx-auto leading-relaxed">
          輸入你想描繪的主題或主角，AI 將為你靈感繪製多頁精美插圖故事，並自動翻譯為繁中、英文、日文多語言雙語內容！
        </p>

        <div className="pt-2 flex justify-center">
          <button
            type="button"
            onClick={() => setIsAiAssistantOpen(true)}
            className="px-5 py-2.5 rounded-2xl bg-slate-950 text-amber-300 font-black text-xs sm:text-sm flex items-center gap-2 shadow-xl hover:bg-slate-900 hover:scale-105 transition-transform cursor-pointer border border-amber-400"
          >
            <Wand2 className="w-4 h-4 text-amber-400 animate-spin" />
            <span>🤖 呼叫 繪本創作 AI 助手 (Story Assistant)</span>
          </button>
        </div>
      </div>

      {/* Creation Result Modal / Success Display */}
      {createdBook && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-amber-400 shadow-xl space-y-6 animate-fadeIn">
          <div className="flex items-center gap-3 text-amber-950">
            <span className="text-3xl">🎉</span>
            <div>
              <h2 className="text-2xl font-black">繪本創作完成！獲贈 10 顆故事星章 ⭐</h2>
              <p className="text-xs font-bold text-amber-800">已自動加入你的館藏目錄</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 items-center bg-amber-50 p-4 rounded-2xl border border-amber-200">
            <img
              src={createdBook.coverUrl}
              alt={createdBook.title['zh-TW']}
              className="w-40 h-40 object-cover rounded-2xl shadow-md border-2 border-white"
            />
            <div className="space-y-2 text-center sm:text-left flex-1">
              <span className="text-xs font-extrabold bg-amber-200 text-amber-900 px-2.5 py-1 rounded-full">
                {createdBook.ageGroup}歲 • {createdBook.pages.length} 頁數位繪本
              </span>
              <h3 className="text-xl font-black text-amber-950">{createdBook.title['zh-TW']}</h3>
              <p className="text-xs text-amber-900/80 font-medium line-clamp-2">
                {createdBook.summary['zh-TW']}
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={() => onSelectBook(createdBook)}
              className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-extrabold px-6 py-3 rounded-2xl text-sm shadow-md transition-transform hover:scale-105"
            >
              <BookOpen className="w-5 h-5" />
              <span>立即開啟閱讀作品</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Creation Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-amber-200/80 shadow-xs space-y-6" id="form-ai-book-creator">
        
        {/* 🪄 創意生成器 - Gemini 靈感標籤 (Creative Spark Generator with Gemini API) */}
        <CreativeSparkGenerator
          onApplySpark={({ prompt, characterName: cName, category: cat, artStyle: aStyle, moralLesson: mLesson }) => {
            setTopicPrompt(prompt);
            if (cName) setCharacterNames(cName);
            if (cat) setCategory(cat);
            if (aStyle) setArtStyle(aStyle);
            if (mLesson) setMoralLesson(mLesson);
            handleAutoMatchMusic(prompt);
          }}
        />

        {/* 🎡 創意生成卡片與靈感輪盤 (Creative Inspiration Cards & Multi-Reel Wheel) */}
        <CreativeInspirationCards
          onApplyInspiration={(synthesizedPrompt, charName, themeCat, artSty, moral) => {
            setTopicPrompt(synthesizedPrompt);
            if (charName) {
              setCharacterNames(charName);
            }
            if (themeCat && ['Adventure', 'Fairy Tale', 'Nature & Science', 'Friendship & Love'].includes(themeCat)) {
              setCategory(themeCat as any);
            }
            if (artSty) {
              setArtStyle(artSty);
            }
            if (moral) {
              setMoralLesson(moral);
            }
            handleAutoMatchMusic(synthesizedPrompt);
          }}
        />

        {/* 🧩 故事結構範本切換器 (Story Structure Template Switcher) */}
        <div className="space-y-4 p-5 bg-gradient-to-br from-amber-50/90 via-orange-50/40 to-amber-100/50 rounded-3xl border border-amber-200 shadow-2xs" id="story-structure-template-section">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200/80 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <Layout className="w-5 h-5 text-orange-600 animate-pulse" />
                <h3 className="text-base sm:text-lg font-black text-amber-950">
                  故事結構模板工坊 (Narrative Structure Templates)
                </h3>
                <span className="bg-orange-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-xs">
                  AI 邏輯骨幹
                </span>
              </div>
              <p className="text-xs text-amber-900/80 font-medium mt-0.5">
                選擇『英雄之旅』、『寓言故事』、『探險日記』等結構模板，讓 AI 依照嚴謹故事骨幹生成生動曲折的繪本！
              </p>
            </div>

            {/* Edit Mode Pill Toggle */}
            <div className="flex items-center gap-1 bg-amber-200/60 p-1 rounded-2xl">
              <button
                type="button"
                onClick={() => setStructureEditMode('presets')}
                className={`px-3 py-1 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  structureEditMode === 'presets'
                    ? 'bg-orange-500 text-white shadow-xs'
                    : 'text-amber-900 hover:bg-amber-100'
                }`}
              >
                ⚡ 模板預設
              </button>
              <button
                type="button"
                onClick={() => setStructureEditMode('step_by_step')}
                className={`px-3 py-1 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  structureEditMode === 'step_by_step'
                    ? 'bg-orange-500 text-white shadow-xs'
                    : 'text-amber-900 hover:bg-amber-100'
                }`}
              >
                📝 分段骨幹編輯
              </button>
            </div>
          </div>

          {/* Template Selection Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
            {STORY_STRUCTURE_TEMPLATES.map((template) => {
              const isSelected = selectedStructureId === template.id;

              return (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => handleSelectStructure(template.id)}
                  className={`p-3 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-2 ${
                    isSelected
                      ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-white border-amber-400 shadow-md scale-102 ring-2 ring-orange-300'
                      : 'bg-white hover:bg-amber-100/80 text-amber-950 border-amber-200/80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{template.icon}</span>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {template.badge}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-black text-xs sm:text-sm line-clamp-1">
                      {template.name}
                    </h4>
                    <p className={`text-[10px] font-medium line-clamp-2 mt-0.5 leading-relaxed ${
                      isSelected ? 'text-amber-100' : 'text-amber-800/80'
                    }`}>
                      {template.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Template Detailed Steps & Step-by-Step Customizer */}
          {activeStructure && activeStructure.steps.length > 0 && (
            <div className="p-4 bg-white/95 rounded-2xl border border-amber-200 space-y-4 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-orange-500 text-white rounded-xl text-xs font-black">
                    {activeStructure.icon}
                  </span>
                  <div>
                    <h4 className="font-extrabold text-xs sm:text-sm text-amber-950">
                      【{activeStructure.name}】故事架構四部曲：
                    </h4>
                    <p className="text-[10px] text-amber-800 font-medium">
                      適用年齡：{activeStructure.recommendedAge} • {activeStructure.steps.length} 個故事邏輯階段
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleRandomizeSkeleton}
                    className="px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer border border-amber-300"
                    title="隨機換一個靈感主題"
                  >
                    <Dices className="w-3.5 h-3.5 text-orange-600" />
                    <span>隨機靈感</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTopicPrompt(activeStructure.placeholder);
                      playStarChime();
                    }}
                    className="px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs flex items-center gap-1 shadow-2xs cursor-pointer transition-transform hover:scale-105"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>一鍵套用範例</span>
                  </button>
                </div>
              </div>

              {/* Mode 1: Step Overview or Mode 2: Step-by-Step Inputs */}
              {structureEditMode === 'step_by_step' ? (
                <div className="space-y-3">
                  <span className="text-xs font-black text-amber-900 flex items-center gap-1.5">
                    <ListOrdered className="w-4 h-4 text-orange-500" />
                    <span>分階段自訂故事大綱（輸入後將自動組裝為完整提示詞）：</span>
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {activeStructure.steps.map((step) => (
                      <div key={step.stepNumber} className="p-3 bg-amber-50/70 rounded-2xl border border-amber-200/90 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-orange-500 text-white font-black text-[10px]">
                            <span>第 {step.stepNumber} 階段</span>
                            <span>•</span>
                            <span>{step.tag}</span>
                          </span>
                          <span className="text-[10px] text-amber-800 font-bold">{step.title}</span>
                        </div>
                        <p className="text-[10px] text-amber-900/70 font-medium">
                          {step.promptGuide}
                        </p>
                        <textarea
                          rows={2}
                          value={customStepInputs[step.stepNumber] !== undefined ? customStepInputs[step.stepNumber] : step.exampleText}
                          onChange={(e) => handleStepInputChange(step.stepNumber, e.target.value)}
                          placeholder={step.exampleText}
                          className="w-full p-2.5 rounded-xl bg-white border border-amber-300 text-xs font-bold text-amber-950 focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {activeStructure.steps.map((step) => (
                    <div
                      key={step.stepNumber}
                      className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200/80 space-y-1 text-center"
                    >
                      <span className="inline-block px-2.5 py-0.5 rounded-full bg-orange-500 text-white font-black text-[10px]">
                        {step.tag}
                      </span>
                      <h5 className="font-extrabold text-xs text-amber-950">{step.title}</h5>
                      <p className="text-[10px] font-medium text-amber-800/80 line-clamp-2">
                        {step.desc}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Preset Theme Chips */}
              {activeStructure.exampleThemes && activeStructure.exampleThemes.length > 0 && (
                <div className="pt-2 border-t border-amber-100 flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] font-extrabold text-amber-900">💡 經典情境範本：</span>
                  {activeStructure.exampleThemes.map((theme, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleApplyPresetTheme(theme)}
                      className="px-2.5 py-1 rounded-xl bg-amber-100/80 hover:bg-orange-100 text-amber-900 hover:text-orange-950 font-bold text-[10px] transition-colors border border-amber-200 cursor-pointer"
                    >
                      ✨ {theme.slice(0, 24)}...
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Topic Input */}
        <div className="space-y-2">
          <label className="block text-sm font-extrabold text-amber-950">
            故事靈感與主題大綱 <span className="text-orange-600">*</span>
          </label>
          <textarea
            id="input-creator-topic"
            rows={3}
            value={topicPrompt}
            onChange={(e) => setTopicPrompt(e.target.value)}
            placeholder="例如：一隻住在魔法森林裡的小熊，幫小動物們郵寄閃耀的星光信件..."
            className="w-full p-4 rounded-2xl bg-amber-50/50 border border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium text-amber-950 placeholder-amber-800/40 text-sm"
            required
          />

          {/* Quick Idea Chips */}
          <div className="space-y-1 pt-1">
            <span className="text-xs font-bold text-amber-800/70">快速點選熱門靈感：</span>
            <div className="flex flex-wrap gap-2">
              {quickIdeas.map((idea, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setTopicPrompt(idea)}
                  className="text-xs font-bold bg-amber-100/70 hover:bg-amber-200 text-amber-900 px-3 py-1.5 rounded-xl transition-colors border border-amber-200/60"
                >
                  💡 {idea}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 🎵 AI 背景音樂選項與主題自動匹配 (AI Background Music & Keyword Matching) */}
        <div className="space-y-4 p-5 bg-gradient-to-br from-indigo-50/80 via-purple-50/40 to-amber-50/60 rounded-3xl border border-indigo-200/80 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-200/60 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <Music className="w-5 h-5 text-indigo-600 animate-pulse" />
                <h3 className="text-base sm:text-lg font-black text-amber-950">
                  AI 背景音樂選項與主題自動配對
                </h3>
                <span className="bg-indigo-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full">
                  專屬情境音律
                </span>
              </div>
              <p className="text-xs text-amber-900/80 font-medium mt-0.5">
                根據關鍵字（如：森林、太空、海洋、魔法）自動選定沉浸式背景音樂，閱讀時自動旋律迴響
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleAutoMatchMusic(topicPrompt)}
              className="px-3.5 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-xs transition-transform hover:scale-105 cursor-pointer shrink-0"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>🤖 AI 音樂智慧對應</span>
            </button>
          </div>

          {/* Music Track Presets Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {BG_MUSIC_PLAYLIST.filter(t => t.id !== 'off').map((track) => {
              const isSelected = selectedBgMusic === track.id;
              const isCurrentlyPlaying = isPlayingMusicPreview && selectedBgMusic === track.id;

              return (
                <div
                  key={track.id}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                    isSelected
                      ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white border-indigo-400 shadow-md ring-2 ring-indigo-300 scale-102'
                      : 'bg-white hover:bg-indigo-50/80 text-amber-950 border-indigo-100'
                  }`}
                  onClick={() => setSelectedBgMusic(track.id)}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xl">{track.emoji}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleMusicPreview(track.id);
                      }}
                      className={`p-1.5 rounded-xl font-bold text-[10px] flex items-center gap-1 cursor-pointer transition-transform hover:scale-110 ${
                        isCurrentlyPlaying
                          ? 'bg-rose-500 text-white animate-pulse'
                          : isSelected
                          ? 'bg-white/20 text-white hover:bg-white/30'
                          : 'bg-indigo-100 text-indigo-900 hover:bg-indigo-200'
                      }`}
                      title="點擊試聽此背景音樂"
                    >
                      {isCurrentlyPlaying ? (
                        <>
                          <Square className="w-3 h-3 fill-white" />
                          <span>停止</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3 fill-current" />
                          <span>試聽</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div>
                    <h4 className="font-black text-xs sm:text-sm line-clamp-1">{track.name}</h4>
                    <p className={`text-[10px] font-medium line-clamp-1 ${
                      isSelected ? 'text-indigo-100' : 'text-amber-800/80'
                    }`}>
                      {track.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ⏱️ 智慧閱讀節奏分析器 (Smart Reading Rhythm & Pace Analytics) */}
        <div className="space-y-4 p-5 bg-gradient-to-br from-emerald-50/80 via-teal-50/40 to-amber-50/60 rounded-3xl border border-emerald-200/80 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-200/60 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-600 animate-pulse" />
                <h3 className="text-base sm:text-lg font-black text-amber-950">
                  智慧閱讀節奏分析器
                </h3>
                <span className="bg-emerald-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full">
                  Rhythm Analytics
                </span>
              </div>
              <p className="text-xs text-amber-900/80 font-medium mt-0.5">
                依據適讀年齡與文本情境，動態計算孩童最舒適的語速 WPM 與換氣停頓間隔
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-emerald-900 bg-white/80 px-3 py-1 rounded-full border border-emerald-200">
                適讀年齡：{ageGroup} 歲
              </span>
            </div>
          </div>

          {/* Analytics Stats Grid */}
          {(() => {
            const wpm = ageGroup === '3-5' ? 70 : ageGroup === '6-8' ? 110 : 145;
            const speedLabel = ageGroup === '3-5' ? '溫柔沉浸語速 (Slow)' : ageGroup === '6-8' ? '標準生動語速 (Normal)' : '明快敘事語速 (Fluent)';
            const pauseInterval = ageGroup === '3-5' ? '1.8 秒' : ageGroup === '6-8' ? '1.2 秒' : '0.8 秒';
            const voicePersona = ageGroup === '3-5' ? '🌸 溫柔媽媽 / 說故事仙子' : ageGroup === '6-8' ? '🎈 活潑卡通 / 智慧樹爺爺' : '🕵️ 機智偵探 / 宇宙探險家';
            const wordCountEst = Math.max(120, topicPrompt.length * 8 + 150);
            const estTimeMins = (wordCountEst / wpm).toFixed(1);

            return (
              <div className="space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-white/90 rounded-2xl border border-emerald-200 space-y-1 text-center">
                    <span className="text-xs font-extrabold text-emerald-800 flex items-center justify-center gap-1">
                      <Gauge className="w-3.5 h-3.5 text-emerald-600" />
                      建議閱讀語速
                    </span>
                    <div className="font-black text-lg text-emerald-950">{wpm} WPM</div>
                    <div className="text-[10px] text-emerald-700 font-bold">{speedLabel}</div>
                  </div>

                  <div className="p-3 bg-white/90 rounded-2xl border border-emerald-200 space-y-1 text-center">
                    <span className="text-xs font-extrabold text-emerald-800 flex items-center justify-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-emerald-600" />
                      換氣停頓間隔
                    </span>
                    <div className="font-black text-lg text-emerald-950">{pauseInterval}</div>
                    <div className="text-[10px] text-emerald-700 font-bold">每句最佳停頓時間</div>
                  </div>

                  <div className="p-3 bg-white/90 rounded-2xl border border-emerald-200 space-y-1 text-center">
                    <span className="text-xs font-extrabold text-emerald-800 flex items-center justify-center gap-1">
                      <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                      預估作品總字數
                    </span>
                    <div className="font-black text-lg text-emerald-950">約 {wordCountEst} 字</div>
                    <div className="text-[10px] text-emerald-700 font-bold">估算朗讀耗時 ~{estTimeMins} 分鐘</div>
                  </div>

                  <div className="p-3 bg-white/90 rounded-2xl border border-emerald-200 space-y-1 text-center">
                    <span className="text-xs font-extrabold text-emerald-800 flex items-center justify-center gap-1">
                      <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                      推薦聲線朗讀者
                    </span>
                    <div className="font-black text-xs text-emerald-950 pt-1 line-clamp-1">{voicePersona}</div>
                    <div className="text-[10px] text-emerald-700 font-bold">自動起伏情感語調</div>
                  </div>
                </div>

                {/* Animated Rhythm Cadence Visualizer Bar */}
                <div className="p-3 bg-white/90 rounded-2xl border border-emerald-200 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
                    <span className="text-xs font-extrabold text-emerald-950">
                      聲調與語速節奏波形 (Reading Cadence Wave)：
                    </span>
                  </div>

                  {/* Animated Cadence Bars */}
                  <div className="flex items-end gap-1 h-6">
                    {[40, 70, 100, 60, 90, 50, 80, 100, 60, 90, 40, 75, 95].map((h, i) => (
                      <div
                        key={i}
                        className="w-1.5 bg-gradient-to-t from-emerald-500 to-teal-400 rounded-full animate-pulse"
                        style={{
                          height: `${h}%`,
                          animationDuration: `${0.6 + (i % 5) * 0.2}s`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Visual Art Style Gallery & Preview Section */}
        <div className="space-y-4 p-5 bg-gradient-to-br from-amber-50/80 via-orange-50/30 to-amber-100/40 rounded-3xl border border-amber-200 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200/80 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-orange-600 animate-bounce" />
                <h3 className="text-base sm:text-lg font-black text-amber-950">
                  繪本插畫「視覺風格預覽庫」
                </h3>
                <span className="bg-orange-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                  多款藝術樣式
                </span>
              </div>
              <p className="text-xs text-amber-900/80 font-medium mt-0.5">
                點擊縮圖快速切換與對比畫風，提前為孩子預覽故事繪本視覺效果
              </p>
            </div>

            {/* Scene Preview Switcher */}
            <div className="flex items-center gap-1.5 bg-white/90 p-1 rounded-2xl border border-amber-200 shrink-0">
              <span className="text-[11px] font-extrabold text-amber-900 px-2 flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-amber-600" />
                <span>預覽情境：</span>
              </span>
              {sampleScenes.map((scene, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setPreviewSceneIndex(idx)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                    previewSceneIndex === idx
                      ? 'bg-amber-500 text-white shadow-2xs'
                      : 'text-amber-900 hover:bg-amber-100/80'
                  }`}
                >
                  {scene.title.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Current Selection Status Bar */}
          <div className="p-3 bg-white/90 rounded-2xl border border-amber-200 flex items-center justify-between gap-3 text-xs font-bold text-amber-950">
            <div className="flex items-center gap-2">
              <span className="text-sm">✨</span>
              <span>目前選定風格：<strong className="text-orange-700 font-black text-sm">{artStyle}</strong></span>
            </div>
            <div className="text-[11px] text-amber-800/80 font-semibold hidden sm:block">
              情境：「{sampleScenes[previewSceneIndex].title}」 ({sampleScenes[previewSceneIndex].desc})
            </div>
          </div>

          {/* Visual Style Gallery Thumbnail Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {artStyleGalleries.map((gallery) => {
              const isSelected = artStyle === gallery.id;
              const previewImgUrl = gallery.previewUrls[previewSceneIndex] || gallery.previewUrls[0];

              return (
                <div
                  key={gallery.id}
                  onClick={() => setArtStyle(gallery.id)}
                  className={`group relative cursor-pointer rounded-2xl p-3 bg-white border-2 transition-all duration-200 hover:shadow-md ${
                    isSelected
                      ? 'border-orange-500 ring-2 ring-orange-400/40 bg-orange-50/20 scale-[1.01]'
                      : 'border-amber-200/80 hover:border-amber-400'
                  }`}
                >
                  {/* Selection Badge */}
                  {isSelected && (
                    <div className="absolute top-4 right-4 z-10 bg-orange-500 text-white p-1 rounded-full shadow-md animate-scaleIn">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                  )}

                  {/* Thumbnail Image Container */}
                  <div className="relative aspect-16/10 rounded-xl overflow-hidden bg-amber-100 mb-3 border border-amber-200/60 shadow-2xs">
                    <img
                      src={previewImgUrl}
                      alt={gallery.label}
                      className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                        gallery.id === '點陣像素風格' ? 'image-pixelated contrast-125' : ''
                      }`}
                    />
                    
                    {/* Filter Overlay simulation tags */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-2.5 text-white">
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${gallery.badgeColor}`}>
                          {gallery.tag}
                        </span>
                        <span className="text-[10px] font-bold opacity-90 backdrop-blur-xs bg-black/40 px-2 py-0.5 rounded-md">
                          {sampleScenes[previewSceneIndex].title.split(' ')[0]}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Info */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <h4 className="font-black text-amber-950 text-sm flex items-center gap-1.5">
                        <span>{gallery.label}</span>
                      </h4>
                      {isSelected && (
                        <span className="text-[10px] font-extrabold text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">
                          已選擇
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] font-medium text-amber-900/80 leading-snug">
                      {gallery.desc}
                    </p>

                    {/* Features list */}
                    <div className="flex flex-wrap gap-1 pt-1">
                      {gallery.features.map((feat, fIdx) => (
                        <span
                          key={fIdx}
                          className="text-[10px] font-bold bg-amber-100/70 text-amber-900 px-2 py-0.5 rounded-md"
                        >
                          • {feat}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Options Row: Age & Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-extrabold text-amber-950">適讀年齡層</label>
            <select
              value={ageGroup}
              onChange={(e) => setAgeGroup(e.target.value as any)}
              className="w-full p-3 rounded-2xl bg-amber-50/50 border border-amber-200 font-bold text-amber-950 text-sm focus:outline-none"
            >
              <option value="3-5">3-5 歲（啟蒙短句與音效）</option>
              <option value="6-8">6-8 歲（基礎故事與簡單詞彙）</option>
              <option value="9-12">9-12 歲（進階冒險與深層寓意）</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-extrabold text-amber-950">故事類別</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full p-3 rounded-2xl bg-amber-50/50 border border-amber-200 font-bold text-amber-950 text-sm focus:outline-none"
            >
              <option value="Adventure">冒險探索 Adventure</option>
              <option value="Fairy Tale">童話與神奇世界 Fairy Tale</option>
              <option value="Nature & Science">自然與科學 Nature & Science</option>
              <option value="Friendship & Love">友誼與愛 Friendship & Love</option>
            </select>
          </div>
        </div>

        {/* Character & Moral Optional Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-amber-900">角色名字（可不填）</label>
            <input
              type="text"
              value={characterNames}
              onChange={(e) => setCharacterNames(e.target.value)}
              placeholder="例如：小熊波波、阿酷貓"
              className="w-full p-3 rounded-2xl bg-amber-50/50 border border-amber-200 font-medium text-amber-950 text-xs focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-amber-900">核心寓意（可不填）</label>
            <input
              type="text"
              value={moralLesson}
              onChange={(e) => setMoralLesson(e.target.value)}
              placeholder="例如：勇敢誠實、珍惜友情"
              className="w-full p-3 rounded-2xl bg-amber-50/50 border border-amber-200 font-medium text-amber-950 text-xs focus:outline-none"
            />
          </div>
        </div>

        {/* Error Feedback */}
        {errorMessage && (
          <div className="p-4 bg-rose-100 text-rose-900 rounded-2xl text-xs font-bold border border-rose-300">
            ⚠️ {errorMessage}
          </div>
        )}

        {/* Submit Button */}
        <button
          id="btn-submit-generate-book"
          type="submit"
          disabled={isGenerating || !topicPrompt.trim()}
          className="w-full bg-gradient-to-r from-orange-500 via-amber-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 disabled:opacity-50 text-white font-black py-4 rounded-2xl text-base shadow-lg transition-transform hover:scale-[1.01] flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <>
              <span className="animate-spin text-xl">🪄</span>
              <span>AI 魔法構思繪本與翻譯中...</span>
            </>
          ) : (
            <>
              <Wand2 className="w-5 h-5 text-amber-200" />
              <span>開始魔法創作繪本</span>
            </>
          )}
        </button>
      </form>

      {/* AI Book Creation Assistant Modal */}
      <AiBookCreationAssistantModal
        isOpen={isAiAssistantOpen}
        onClose={() => setIsAiAssistantOpen(false)}
        onApplyGeneratedBook={(book) => {
          onBookCreated(book);
          onSelectBook(book);
        }}
      />
    </div>
  );
};
