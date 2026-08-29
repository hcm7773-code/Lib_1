import React, { useState } from 'react';
import {
  Wand2, Sparkles, RefreshCw, Dices, ArrowRight, Lightbulb, Bookmark, Check,
  Flame, Compass, Stars, BookOpen, Heart, Cpu
} from 'lucide-react';
import { playStarChime, playPageTurnSound } from '../utils/audio';

export interface CreativeSparkItem {
  id: string;
  tag: string;
  title: string;
  character: string;
  scene: string;
  conflict: string;
  moral: string;
  recommendedArtStyle: string;
  prompt: string;
}

interface CreativeSparkGeneratorProps {
  onApplySpark: (spark: {
    prompt: string;
    characterName?: string;
    category?: 'Adventure' | 'Fairy Tale' | 'Nature & Science' | 'Friendship & Love';
    artStyle?: string;
    moralLesson?: string;
  }) => void;
}

const CATEGORY_OPTIONS: Array<{
  id: 'Adventure' | 'Fairy Tale' | 'Nature & Science' | 'Friendship & Love';
  label: string;
  icon: string;
  color: string;
  bgColor: string;
  badgeColor: string;
}> = [
  {
    id: 'Fairy Tale',
    label: '奇幻童話 (Fairy Tale)',
    icon: '🏰',
    color: 'from-purple-500 to-indigo-500',
    bgColor: 'bg-purple-50 hover:bg-purple-100/80 border-purple-200',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
  },
  {
    id: 'Nature & Science',
    label: '自然科普 (Nature & Science)',
    icon: '🔬',
    color: 'from-emerald-500 to-teal-500',
    bgColor: 'bg-emerald-50 hover:bg-emerald-100/80 border-emerald-200',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  },
  {
    id: 'Adventure',
    label: '冒險探索 (Adventure)',
    icon: '🧭',
    color: 'from-amber-500 to-orange-500',
    bgColor: 'bg-amber-50 hover:bg-amber-100/80 border-amber-200',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
  },
  {
    id: 'Friendship & Love',
    label: '友誼與愛 (Friendship & Love)',
    icon: '💖',
    color: 'from-rose-500 to-pink-500',
    bgColor: 'bg-rose-50 hover:bg-rose-100/80 border-rose-200',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
  },
];

const PRESET_SPARKS_MAP: Record<string, CreativeSparkItem[]> = {
  'Fairy Tale': [
    {
      id: 'fairy-1',
      tag: '🌌 雲端上的星光鐘錶師',
      title: '星光鐘錶師的小貓咪',
      character: '帶著金色齒輪放大鏡的小白貓「露露」',
      scene: '漂浮在積雨雲上的七彩發條鐘樓',
      conflict: '天空中的星星鐘突然停擺，夜晚的流星雨就要迷路了！',
      moral: '細心與耐心能修理最複雜的難題，每顆小星星都有發光的時刻。',
      recommendedArtStyle: '溫馨水彩繪本',
      prompt: '請創作一本奇幻童話繪本《星光鐘錶師的小貓咪》：住在雲端鐘樓的貓咪露露，發現星空發條卡住了。她帶著名為希望的小齒輪踏上星河，運用智慧與耐心修復夜空秩序，讓每顆流星重新閃爍。'
    },
    {
      id: 'fairy-2',
      tag: '🗝️ 偷走影子的小精靈',
      title: '愛跳舞的影子小精靈',
      character: '穿著月光斗篷的影子小精靈「皮皮」',
      scene: '午夜魔法古堡的花園噴水池',
      conflict: '古堡裡的主人失去了歡笑，皮皮借走影子想編排一場逗樂他的影子舞！',
      moral: '善良的初衷需要適當的溝通，歡笑是心靈最好的魔法。',
      recommendedArtStyle: '剪紙與童話風',
      prompt: '請創作一本奇幻童話繪本《愛跳舞的影子小精靈》：小精靈皮皮在月光下帶領城堡裡所有害羞的影子跳起踢踏舞，讓嚴肅的國王重新綻放溫暖笑容，明白快樂一直就在身邊。'
    },
    {
      id: 'fairy-3',
      tag: '🧁 烘烤彩虹雲朵的烘焙熊',
      title: '軟綿綿的雲朵棉花糖派',
      character: '繫著草莓圍裙的小熊廚師「布布」',
      scene: '天空中會飄出香氣的熱氣球廚房',
      conflict: '連日的大雨讓森林動物心情低落，布布要採集七彩夕陽烤出彩虹派！',
      moral: '在陰雨的日子裡，我們自己也可以成為溫暖別人的陽光。',
      recommendedArtStyle: '趣味蠟筆風格',
      prompt: '請創作一本奇幻童話繪本《軟綿綿的雲朵棉花糖派》：小熊布布乘著熱氣球升上天空，把金黃陽光與甜蜜晚霞揉成香噴噴的雲朵派，分給森林裡的每隻小動物，雨過天晴露出美麗彩虹。'
    }
  ],
  'Nature & Science': [
    {
      id: 'sci-1',
      tag: '🔬 鑽進葉脈探險的微觀小螞蟻',
      title: '綠葉王國的光合秘密',
      character: '戴著微觀透鏡的科學小螞蟻「奇奇」',
      scene: '放大一千倍的綠葉葉肉與葉綠體工廠',
      conflict: '大樹葉片突然變黃，水分子小隊與光子精靈迷路了！',
      moral: '生命萬物息息相關，愛護每一片綠葉就是保護我們的地球。',
      recommendedArtStyle: '溫馨水彩繪本',
      prompt: '請創作一本自然科普繪本《綠葉王國的光合秘密》：小螞蟻奇奇戴著放大鏡進入葉片工廠，幫助陽光小精靈和水滴夥伴順利製造氧氣與養分，讓乾枯的小苗重新挺直腰桿。'
    },
    {
      id: 'sci-2',
      tag: '⚡ 收集閃電能量的小樹蛙',
      title: '太陽能小樹蛙的綠能基地',
      character: '背著微型太陽能板背包的小樹蛙「跳跳」',
      scene: '熱帶雨林深處的生態發電站',
      conflict: '森林停電了，夜行性小動物找不到回家的路！',
      moral: '大自然蘊含著源源不絕的乾淨能量，善用科學讓世界更美好。',
      recommendedArtStyle: '卡通動畫風格',
      prompt: '請創作一本自然科普繪本《太陽能小樹蛙的綠能基地》：小樹蛙跳跳利用陽光與落葉分解發電，搭建起一盞盞螢火蟲太陽能路燈，幫助雨林裡迷路的小動物安全回家。'
    },
    {
      id: 'sci-3',
      tag: '🐋 傾聽深海超音波的藍鯨寶寶',
      title: '深海八千米的水下交響樂',
      character: '頭頂有音符氣泡的藍鯨寶寶「藍藍」',
      scene: '發光水母環繞的馬里亞納海溝',
      conflict: '海底沈睡的古代聲音水晶遺失了頻率，海洋生物們聽不見彼此的歌聲！',
      moral: '用心傾聽大自然的頻率，保護海洋生態不受噪音污染。',
      recommendedArtStyle: '溫馨水彩繪本',
      prompt: '請創作一本自然科普繪本《深海八千米的水下交響樂》：藍鯨寶寶藍藍游過奇幻深海，用溫柔低沉的歌聲喚醒發光珊瑚與海龜群，共同演奏出一曲保護海洋的壯麗水下樂章。'
    }
  ],
  'Adventure': [
    {
      id: 'adv-1',
      tag: '🚀 穿越時空的恐龍探險家',
      title: '三角龍波波的神秘足跡',
      character: '戴著紅色探險帽的小三角龍「波波」',
      scene: '長滿巨大發光蕨類的白堊紀神秘峽谷',
      conflict: '水源邊出現了神秘的發光幾何腳印，森林正面臨乾涸危機！',
      moral: '勇敢面對未知事物，真正的勇氣是保護同伴的決心。',
      recommendedArtStyle: '卡通動畫風格',
      prompt: '請創作一本冒險探索繪本《三角龍波波的神秘足跡》：好奇的三角龍波波跟隨奇異腳印展開探險，發現迷路的機器人小夥伴，波波用友誼與智慧幫助機器人修復電源，化解水源危機。'
    },
    {
      id: 'adv-2',
      tag: '⛵ 乘著落葉帆船的大河冒險',
      title: '松鼠船長的黃金橡實航線',
      character: '手握指南針的小松鼠船長「皮特」',
      scene: '秋天金黃楓葉覆蓋的湍急溪流',
      conflict: '狂風吹偏了航向，松鼠船隊必須穿過危險的青蛙岩石陣！',
      moral: '團結合作與冷靜指揮，能化險為夷度過每一個大風大浪。',
      recommendedArtStyle: '趣味蠟筆風格',
      prompt: '請創作一本冒險探索繪本《松鼠船長的黃金橡實航線》：松鼠皮特率領隊員乘坐楓葉小船順流而下，遭遇湍急水流與岩石考驗，大家齊心協力划槳，成功將過冬糧食運送到對岸山洞。'
    },
    {
      id: 'adv-3',
      tag: '🏜️ 金色沙漠裡的隱形綠洲',
      title: '小駱駝米亞的尋星指南針',
      character: '睫毛長長、眼睛明亮的小駱駝「米亞」',
      scene: '夜幕降臨、銀河傾瀉的金色沙丘',
      conflict: '商隊在風沙中失去了方向，唯有米亞記得爺爺說過的北極星傳說！',
      moral: '相信自己的直覺與積累的知識，在黑暗中也能找到前進的方向。',
      recommendedArtStyle: '溫馨水彩繪本',
      prompt: '請創作一本冒險探索繪本《小駱駝米亞的尋星指南針》：小駱駝米亞在沙漠風暴後，抬頭仰望星空辨認星座位置，帶領同伴穿越險峻沙丘，終於抵達繁星閃耀的甘泉綠洲。'
    }
  ],
  'Friendship & Love': [
    {
      id: 'friend-1',
      tag: '🦔 害怕擁抱的刺蝟波波',
      title: '毛線衣裡的溫暖擁抱',
      character: '身上長滿尖刺卻心腸柔軟的小刺蝟「波波」',
      scene: '落葉繽紛的初冬森林樹屋',
      conflict: '波波很想和朋友們擁抱慶祝冬天，但擔心身上的刺會弄痛大家。',
      moral: '愛總能找到合適的方式表達，接納自己的特點才能收穫真摯友情。',
      recommendedArtStyle: '溫馨水彩繪本',
      prompt: '請創作一本友誼溫馨繪本《毛線衣裡的溫暖擁抱》：小刺蝟波波因為怕刺傷朋友而不敢靠近大家，小松鼠和小兔子為他織了一件軟綿綿的彩色毛線衣，大家終於緊緊擁抱在溫暖的冬日壁爐前。'
    },
    {
      id: 'friend-2',
      tag: '🎨 不會畫直線的彩虹筆',
      title: '歪歪扭扭的快樂畫布',
      character: '總是畫出波浪線的彩色小蠟筆「扭扭」',
      scene: '充滿奇思妙想的兒童美術教室',
      conflict: '扭扭總是被直尺笑話畫不直，感到十分自卑與沮喪。',
      moral: '每個人都有與眾不同的獨特之處，接納差異才能繪出多彩世界。',
      recommendedArtStyle: '趣味蠟筆風格',
      prompt: '請創作一本友誼與包容繪本《歪歪扭扭的快樂畫布》：蠟筆扭扭雖然畫不出直線，但他畫出的海浪、微笑弧度與彩虹讓整幅畫變得無比生動，直尺和鉛筆夥伴們由衷讚嘆，大家一起完成了美麗的展覽作品。'
    },
    {
      id: 'friend-3',
      tag: '🤖 渴望心跳聲的發條機器人',
      title: '螺絲釘與蒲公英的約定',
      character: '胸口有發條轉盤的小機器人「卡卡」',
      scene: '開滿黃色蒲公英的微風山丘',
      conflict: '卡卡以為自己沒有心臟就不懂愛，直到一朵蒲公英種子落在他的肩膀上。',
      moral: '溫暖的陪伴與真誠的付出，就是世界上最珍貴的心跳。',
      recommendedArtStyle: '點陣像素風格',
      prompt: '請創作一本友誼與愛繪本《螺絲釘與蒲公英的約定》：發條機器人卡卡守護著山丘上的蒲公英成長，當蒲公英隨風飛向世界時，卡卡感受到了發自內心的喜悅與悸動，明白了愛的真諦。'
    }
  ]
};

export const CreativeSparkGenerator: React.FC<CreativeSparkGeneratorProps> = ({
  onApplySpark,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'Adventure' | 'Fairy Tale' | 'Nature & Science' | 'Friendship & Love'>('Fairy Tale');
  const [customKeyword, setCustomKeyword] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeSparks, setActiveSparks] = useState<CreativeSparkItem[]>(PRESET_SPARKS_MAP['Fairy Tale']);
  const [appliedSparkId, setAppliedSparkId] = useState<string | null>(null);

  const currentCategoryConfig = CATEGORY_OPTIONS.find((c) => c.id === selectedCategory) || CATEGORY_OPTIONS[0];

  const handleCategoryChange = (catId: 'Adventure' | 'Fairy Tale' | 'Nature & Science' | 'Friendship & Love') => {
    setSelectedCategory(catId);
    playPageTurnSound();
    setActiveSparks(PRESET_SPARKS_MAP[catId] || PRESET_SPARKS_MAP['Fairy Tale']);
  };

  const handleGenerateSparksWithGemini = async () => {
    setIsGenerating(true);
    playStarChime();

    try {
      const res = await fetch('/api/gemini/generate-creative-sparks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: selectedCategory,
          ageGroup: '6-8',
          keyword: customKeyword.trim(),
        }),
      });

      if (!res.ok) {
        throw new Error('API request failed');
      }

      const data = await res.json();
      if (data.sparks && Array.isArray(data.sparks) && data.sparks.length > 0) {
        setActiveSparks(data.sparks);
        playStarChime();
      } else {
        // Fallback
        setActiveSparks(PRESET_SPARKS_MAP[selectedCategory]);
      }
    } catch (err) {
      console.warn('Using preset sparks fallback:', err);
      // Fallback with fresh shuffle
      const base = PRESET_SPARKS_MAP[selectedCategory] || PRESET_SPARKS_MAP['Fairy Tale'];
      setActiveSparks([...base].sort(() => Math.random() - 0.5));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApply = (spark: CreativeSparkItem) => {
    playStarChime();
    setAppliedSparkId(spark.id);

    onApplySpark({
      prompt: spark.prompt,
      characterName: spark.character,
      category: selectedCategory,
      artStyle: spark.recommendedArtStyle,
      moralLesson: spark.moral,
    });

    setTimeout(() => {
      setAppliedSparkId(null);
    }, 2500);
  };

  return (
    <div className="space-y-5 p-6 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-purple-500/10 rounded-3xl border-2 border-amber-300 shadow-sm relative overflow-hidden" id="creative-spark-generator-module">
      
      {/* Decorative Background Accents */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-radial from-amber-300/30 via-transparent to-transparent pointer-events-none" />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center text-xl shadow-md">
              🪄
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-amber-950">
                  創意生成器 (AI Story Spark Generator)
                </h3>
                <span className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Gemini API 賦能
                </span>
              </div>
              <p className="text-xs text-amber-900/80 font-medium mt-0.5">
                依據繪本類型一鍵生成 3 個原創靈感標籤，點擊靈感即可自動填入工坊，跨越零基礎創作門檻！
              </p>
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <button
          type="button"
          onClick={handleGenerateSparksWithGemini}
          disabled={isGenerating}
          className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-purple-600 hover:from-amber-600 hover:to-purple-700 text-white font-black text-xs shadow-md transition-all hover:scale-105 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
          <span>{isGenerating ? 'Gemini 魔法構思中...' : '✨ 隨機換一組靈感標籤'}</span>
        </button>
      </div>

      {/* Category Pills Switcher */}
      <div className="space-y-2">
        <label className="text-xs font-black text-amber-950 flex items-center gap-1.5">
          <Compass className="w-4 h-4 text-orange-600" />
          <span>選擇繪本風格類型：</span>
        </label>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {CATEGORY_OPTIONS.map((cat) => {
            const isSelected = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategoryChange(cat.id)}
                className={`p-3 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex items-center gap-2.5 ${
                  isSelected
                    ? `bg-gradient-to-r ${cat.color} text-white border-transparent shadow-md scale-102 ring-2 ring-amber-300`
                    : `${cat.bgColor} text-slate-800`
                }`}
              >
                <span className="text-xl shrink-0">{cat.icon}</span>
                <div className="min-w-0">
                  <div className="font-black text-xs truncate">
                    {cat.label.split(' ')[0]}
                  </div>
                  <div className={`text-[10px] font-medium truncate ${isSelected ? 'text-white/80' : 'text-slate-500'}`}>
                    {cat.id}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Optional Keyword Input */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-white/80 p-2.5 rounded-2xl border border-amber-200">
        <span className="text-xs font-black text-amber-900 px-2 flex items-center gap-1 shrink-0">
          <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
          <span>加入自訂關鍵字（可不填）：</span>
        </span>
        <input
          type="text"
          value={customKeyword}
          onChange={(e) => setCustomKeyword(e.target.value)}
          placeholder="例如：彩虹糖果樹、太空小狗、時光手錶..."
          className="flex-1 px-3 py-1.5 rounded-xl bg-amber-50/50 border border-amber-200 text-xs font-bold text-amber-950 placeholder-amber-800/40 focus:outline-hidden focus:ring-2 focus:ring-amber-400"
        />
        <button
          type="button"
          onClick={handleGenerateSparksWithGemini}
          className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs transition-colors cursor-pointer shrink-0"
        >
          立即生成
        </button>
      </div>

      {/* 3 Interactive Inspiration Spark Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-amber-950 flex items-center gap-1.5">
            <Stars className="w-4 h-4 text-purple-600 animate-pulse" />
            <span>【{currentCategoryConfig.label.split(' ')[0]}】專屬 3 大創意靈感標籤（點擊直接填入）：</span>
          </span>
          <span className="text-[11px] font-bold text-amber-800/80">
            3 Spark Ideas
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {activeSparks.map((spark, idx) => {
            const isApplied = appliedSparkId === spark.id;

            return (
              <div
                key={spark.id || idx}
                className={`p-4 rounded-3xl border-2 transition-all duration-200 flex flex-col justify-between space-y-3 bg-white ${
                  isApplied
                    ? 'border-emerald-500 ring-2 ring-emerald-300 shadow-lg scale-102'
                    : 'border-amber-200/90 hover:border-amber-400 hover:shadow-md'
                }`}
              >
                <div className="space-y-2">
                  {/* Spark Tag Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <span className="inline-block px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-xs shadow-2xs">
                      {spark.tag}
                    </span>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 shrink-0">
                      {spark.recommendedArtStyle}
                    </span>
                  </div>

                  {/* Title & Plot Details */}
                  <h4 className="font-black text-sm text-slate-900 line-clamp-1 pt-1">
                    《{spark.title}》
                  </h4>

                  <div className="space-y-1 text-[11px] text-slate-600 bg-amber-50/50 p-2.5 rounded-2xl border border-amber-100">
                    <p className="line-clamp-1">
                      <strong className="text-purple-700">👤 主角：</strong>{spark.character}
                    </p>
                    <p className="line-clamp-1">
                      <strong className="text-indigo-700">🏰 場景：</strong>{spark.scene}
                    </p>
                    <p className="line-clamp-2">
                      <strong className="text-rose-700">⚡ 核心奇遇：</strong>{spark.conflict}
                    </p>
                  </div>

                  <p className="text-[10px] font-bold text-amber-900/80 italic line-clamp-1">
                    💡 寓意：{spark.moral}
                  </p>
                </div>

                {/* Apply Button */}
                <button
                  type="button"
                  onClick={() => handleApply(spark)}
                  className={`w-full py-2.5 rounded-2xl font-black text-xs shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    isApplied
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white hover:scale-102'
                  }`}
                >
                  {isApplied ? (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>已自動填入創作 Prompt！✨</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-3.5 h-3.5 text-amber-200" />
                      <span>點擊填入創作工坊</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
