import React, { useState, useEffect } from 'react';
import {
  X, Compass, MapPin, Globe, Sparkles, BookOpen, Star, Award, Volume2, Search,
  Flame, CheckCircle2, Navigation, Layers, Info, Play, RefreshCw, Trophy
} from 'lucide-react';
import { Book, LanguageCode } from '../types';
import { speakText, playStarChime, playPageTurnSound } from '../utils/audio';

interface MapLocation {
  id: string;
  name: string;
  category: string;
  emoji: string;
  xPercent: number; // 0 - 100 for SVG / map placement
  yPercent: number; // 0 - 100 for SVG / map placement
  realWorldRegion: string;
  timeEra: string;
  geographyKnowledge: string;
  funFact: string;
  matchingKeywords: string[];
}

interface StoryTimeSpaceMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  books: Book[];
  readBookIds?: string[];
  onSelectBook: (book: Book) => void;
  primaryLang?: LanguageCode;
  onFilterByKeyword?: (keyword: string) => void;
}

export const MAP_LOCATIONS: MapLocation[] = [
  {
    id: 'egypt',
    name: '古埃及金字塔與尼羅河',
    category: '古文明歷史',
    emoji: '🏺',
    xPercent: 54,
    yPercent: 48,
    realWorldRegion: '北非・埃及 (Egypt)',
    timeEra: '公元前 2500 年 (古文明時代)',
    geographyKnowledge: '尼羅河是世界上最長的河流之一，古埃及人在沙漠邊建立了舉世聞名的尼羅河文明與金字塔！',
    funFact: '吉薩大金字塔是由超過 200 萬塊巨石堆砌而成，屹立了 4000 多年呢！',
    matchingKeywords: ['埃及', '金字塔', '王子', '城堡', '文明'],
  },
  {
    id: 'scifi',
    name: '2150 未來綠能天空城',
    category: '未來科幻',
    emoji: '🚀',
    xPercent: 78,
    yPercent: 28,
    realWorldRegion: '未來智慧都市 (Neo Future)',
    timeEra: '公元 2150 年 (未來世紀)',
    geographyKnowledge: '未來的城市將利用太陽能與風力大自然發電，建築物外牆都種滿垂直綠色森林樹木。',
    funFact: '飛行汽車使用空氣磁浮技術，完全不會排放黑煙廢氣，能保護藍天！',
    matchingKeywords: ['太空', '宇宙', '建築', '科學', '未來'],
  },
  {
    id: 'amazon',
    name: '亞馬遜熱帶雨林生態圈',
    category: '大自然冒險',
    emoji: '🌴',
    xPercent: 32,
    yPercent: 62,
    realWorldRegion: '南美洲・亞馬遜盆地 (Amazon)',
    timeEra: '現代 (熱帶大自然)',
    geographyKnowledge: '亞馬遜雨林被稱為「地球之肺」，擁有全世界最豐富的野生動植物 species 種類！',
    funFact: '這裡棲息著會隨光線變色的彩虹大嘴鳥與會游水的粉紅河豚！',
    matchingKeywords: ['森林', '雨林', '動物', '熊', '鴨', '自然'],
  },
  {
    id: 'finland',
    name: '芬蘭極光魔法雪原',
    category: '極地地理',
    emoji: '❄️',
    xPercent: 52,
    yPercent: 22,
    realWorldRegion: '北歐・芬蘭拉普蘭 (Finland)',
    timeEra: '冬日永恆時空',
    geographyKnowledge: '芬蘭部位於北極圈內，冬天夜晚有機會看到絢麗繽紛的北極光（Aurora）在夜空跳舞！',
    funFact: '這裡也是傳說中聖誕老人與雪橇麋鹿的溫暖故鄉喔！',
    matchingKeywords: ['雪', '極光', '聖誕', '冬', '冰'],
  },
  {
    id: 'atlantis',
    name: '太平洋沉沒海底城',
    category: '海洋探險',
    emoji: '🌊',
    xPercent: 22,
    yPercent: 42,
    realWorldRegion: '太平洋深度 4000 公尺海底',
    timeEra: '深海傳奇時空',
    geographyKnowledge: '海洋覆蓋了地球表面約 71% 的面積，深海裡充滿了會發光的水母與神奇珊瑚礁！',
    funFact: '藍鯨是地球上有史以來最大的動物，心臟甚至和一輛小汽車一樣大！',
    matchingKeywords: ['海', '水', '鯨', '魚', '島', '深海'],
  },
  {
    id: 'jurassic',
    name: '遠古侏羅紀盤古大陸',
    category: '史前時代',
    emoji: '🦕',
    xPercent: 42,
    yPercent: 35,
    realWorldRegion: '遠古超大陸 (Pangaea)',
    timeEra: '約 1.5 億年前 (侏羅紀)',
    geographyKnowledge: '億萬年前地球上的陸地是連在一起的超大陸，當時氣候濕熱，到處都是巨型蕨類植物。',
    funFact: '暴龍的牙齒有如香蕉一樣大，而翼龍其實不是恐龍，而是會飛的爬蟲類！',
    matchingKeywords: ['恐龍', '龍', '史前', '火山'],
  },
  {
    id: 'taiwan',
    name: '福爾摩沙寶島山林',
    category: '寶島台灣',
    emoji: '🐻',
    xPercent: 82,
    yPercent: 52,
    realWorldRegion: '東亞・台灣阿里山與高山',
    timeEra: '現代 (寶島自然)',
    geographyKnowledge: '台灣雖然面積精緻，卻擁有超過 260 座海拔 3000 公尺以上的高山，生態極為珍貴！',
    funFact: '台灣黑熊胸前有白色的 V 字形斑紋，是獨一無二的台灣特有種珍寶！',
    matchingKeywords: ['台灣', '山', '熊', '森林', '島'],
  },
  {
    id: 'paris',
    name: '巴黎塞納河文化古城',
    category: '歐洲人文',
    emoji: '🏰',
    xPercent: 48,
    yPercent: 32,
    realWorldRegion: '西歐・法國巴黎 (Paris)',
    timeEra: '19 世紀童話城堡年代',
    geographyKnowledge: '塞納河緩緩流過巴黎市中心，沿岸聳立著許多擁有數百年歷史的經典城堡與博物館。',
    funFact: '艾菲爾鐵塔在熱天時因為金屬熱脹冷縮，高度會稍微變高幾公分呢！',
    matchingKeywords: ['城堡', '王子', '繪本', '愛', '公主', '城堡'],
  },
];

export const StoryTimeSpaceMapModal: React.FC<StoryTimeSpaceMapModalProps> = ({
  isOpen,
  onClose,
  books,
  readBookIds = [],
  onSelectBook,
  primaryLang = 'zh-TW',
  onFilterByKeyword,
}) => {
  const [selectedLocation, setSelectedLocation] = useState<MapLocation>(MAP_LOCATIONS[0]);
  const [mapStyle, setMapStyle] = useState<'parchment' | 'scifi' | 'cartoon'>('parchment');
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    if (isOpen) {
      playStarChime();
    } else {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Calculate explored status for each location based on books in library and read counts
  const locationStats = MAP_LOCATIONS.map((loc) => {
    // find books that match this location's keywords
    const matchingBooks = books.filter((b) => {
      const title = (b.title[primaryLang] || b.title['zh-TW'] || b.title.en || '').toLowerCase();
      const summary = (b.summary[primaryLang] || b.summary['zh-TW'] || b.summary.en || '').toLowerCase();
      return loc.matchingKeywords.some((kw) => title.includes(kw.toLowerCase()) || summary.includes(kw.toLowerCase()));
    });

    const readMatchingCount = matchingBooks.filter((b) => readBookIds.includes(b.id) || b.readCount > 0).length;
    const isExplored = readMatchingCount > 0 || matchingBooks.length > 0;

    return {
      location: loc,
      matchingBooks,
      readMatchingCount,
      isExplored,
    };
  });

  const totalExploredCount = locationStats.filter((s) => s.isExplored).length;
  const explorationPercentage = Math.round((totalExploredCount / MAP_LOCATIONS.length) * 100);

  const activeStat = locationStats.find((s) => s.location.id === selectedLocation.id) || locationStats[0];

  const handleSpeakLore = (text: string) => {
    if (isSpeaking) {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(true);
    speakText(text, 'zh-TW', 0.95, 'teacher', 1.05, () => setIsSpeaking(false));
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-fadeIn">
      <div className="relative w-full max-w-5xl max-h-[94vh] flex flex-col rounded-3xl bg-slate-900 border-2 border-amber-400/80 text-slate-100 shadow-2xl overflow-hidden">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-amber-400/30 bg-slate-900/90 z-10">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-600 text-slate-950 font-black shadow-lg">
              <Compass className="w-6 h-6 animate-spin" style={{ animationDuration: '12s' }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] shadow-xs">
                  🗺️ 繪本地理與歷史探索
                </span>
                <span className="text-[10px] font-bold text-amber-300">
                  解鎖度：{explorationPercentage}%
                </span>
              </div>
              <h3 className="text-base sm:text-xl font-black text-amber-200">
                故事時空地圖 (Story Time-Space Visualizer)
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Map Style Selector */}
            <div className="hidden sm:flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700">
              <button
                type="button"
                onClick={() => setMapStyle('parchment')}
                className={`px-2.5 py-1 rounded-lg text-xs font-black cursor-pointer ${
                  mapStyle === 'parchment' ? 'bg-amber-400 text-slate-950' : 'text-slate-300'
                }`}
              >
                📜 羊皮紙羊皮畫
              </button>
              <button
                type="button"
                onClick={() => setMapStyle('scifi')}
                className={`px-2.5 py-1 rounded-lg text-xs font-black cursor-pointer ${
                  mapStyle === 'scifi' ? 'bg-indigo-500 text-white' : 'text-slate-300'
                }`}
              >
                🛸 全息科幻
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Main Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar">
          
          {/* Exploration Progress Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950 via-slate-900 to-orange-950 border border-amber-400/40 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-3">
              <Trophy className="w-8 h-8 text-amber-400 animate-bounce" />
              <div>
                <h4 className="font-black text-sm sm:text-base text-amber-200">
                  時空探索足跡：已解鎖 {totalExploredCount} / {MAP_LOCATIONS.length} 個世界冒險區域
                </h4>
                <p className="text-xs text-slate-300 font-medium">
                  每閱讀完相應主題的繪本，地圖即會點亮金黃耀眼璀璨指針標記！
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full sm:w-48 space-y-1">
              <div className="flex justify-between text-[10px] font-black text-amber-300">
                <span>地圖開拓進度</span>
                <span>{explorationPercentage}%</span>
              </div>
              <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden border border-amber-400/30">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-500"
                  style={{ width: `${explorationPercentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* 🗺️ Interactive World Map Canvas Container */}
          <div
            className={`relative w-full h-[360px] sm:h-[420px] rounded-3xl border-4 overflow-hidden shadow-2xl transition-all ${
              mapStyle === 'parchment'
                ? 'bg-[#2b2118] border-amber-600/80 text-amber-100'
                : 'bg-slate-950 border-indigo-600/80 text-indigo-100'
            }`}
          >
            {/* Background Map Graphic Overlay */}
            <div
              className="absolute inset-0 opacity-40 pointer-events-none bg-cover bg-center"
              style={{
                backgroundImage:
                  mapStyle === 'parchment'
                    ? 'radial-gradient(circle, rgba(217, 119, 6, 0.15) 0%, rgba(15, 23, 42, 0.8) 100%), url("https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1200&q=80")'
                    : 'radial-gradient(circle, rgba(99, 102, 241, 0.2) 0%, rgba(2, 6, 23, 0.9) 100%), url("https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80")',
              }}
            />

            {/* Grid Lines for Nautical/Sci-Fi feel */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

            {/* Map Title Tag */}
            <div className="absolute top-3 left-4 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-amber-400/50 text-amber-300 font-black text-xs flex items-center gap-1.5 shadow-md z-10">
              <Globe className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>世界繪本時空地圖 (Global Story Map)</span>
            </div>

            {/* Map Location Pins */}
            {locationStats.map(({ location, isExplored }) => {
              const isSelected = selectedLocation.id === location.id;

              return (
                <button
                  key={location.id}
                  type="button"
                  onClick={() => {
                    setSelectedLocation(location);
                    playStarChime();
                  }}
                  className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 group z-20 ${
                    isSelected ? 'scale-125 z-30' : 'hover:scale-110'
                  }`}
                  style={{
                    left: `${location.xPercent}%`,
                    top: `${location.yPercent}%`,
                  }}
                >
                  {/* Glowing Ring */}
                  <div className={`relative flex items-center justify-center p-2 rounded-2xl shadow-xl transition-all ${
                    isSelected
                      ? 'bg-amber-400 text-slate-950 ring-4 ring-amber-300 animate-bounce'
                      : isExplored
                      ? 'bg-emerald-500 text-white ring-2 ring-emerald-300'
                      : 'bg-slate-800/90 text-amber-200 border border-amber-400/40'
                  }`}>
                    <span className="text-xl sm:text-2xl">{location.emoji}</span>

                    {/* Explored Star Icon */}
                    {isExplored && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center text-[10px] text-slate-950 font-black shadow-xs">
                        ★
                      </span>
                    )}
                  </div>

                  {/* Pin Name Label Tooltip */}
                  <div className={`mt-1 px-2 py-0.5 rounded-lg text-[10px] font-black whitespace-nowrap shadow-md transition-all ${
                    isSelected
                      ? 'bg-amber-400 text-slate-950 scale-105'
                      : 'bg-slate-900/90 text-slate-200 border border-slate-700'
                  }`}>
                    {location.name.split('與')[0]}
                  </div>
                </button>
              );
            })}
          </div>

          {/* 📍 Active Selected Location Geography Knowledge Card */}
          <div className="p-5 rounded-3xl bg-slate-800/90 border-2 border-amber-400/60 shadow-2xl space-y-4 animate-fadeIn">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-amber-400/20 pb-3">
              <div className="flex items-center gap-3">
                <span className="p-3 rounded-2xl bg-amber-400 text-slate-950 text-2xl font-black shadow-md">
                  {selectedLocation.emoji}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-base sm:text-xl text-amber-200">
                      【{selectedLocation.name}】
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-700 text-amber-300 font-bold text-[10px]">
                      {selectedLocation.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-300 font-bold mt-0.5">
                    <span>📍 {selectedLocation.realWorldRegion}</span>
                    <span>⏳ {selectedLocation.timeEra}</span>
                  </div>
                </div>
              </div>

              {/* Speak Lore Button */}
              <button
                type="button"
                onClick={() =>
                  handleSpeakLore(
                    `${selectedLocation.name}。${selectedLocation.geographyKnowledge}。趣聞：${selectedLocation.funFact}`
                  )
                }
                className={`px-3.5 py-2 rounded-2xl font-black text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer shrink-0 ${
                  isSpeaking
                    ? 'bg-rose-500 text-white animate-pulse'
                    : 'bg-amber-400 hover:bg-amber-300 text-slate-950'
                }`}
              >
                <Volume2 className="w-4 h-4" />
                <span>{isSpeaking ? '朗讀中...' : '🔊 聽語音地理小知識'}</span>
              </button>
            </div>

            {/* Lore Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-amber-400/30 space-y-1">
                <h5 className="font-extrabold text-xs text-amber-300 flex items-center gap-1">
                  <Info className="w-4 h-4 text-amber-400" />
                  <span>🌍 地理歷史知識 (Geography & History):</span>
                </h5>
                <p className="text-xs text-slate-200 font-medium leading-relaxed">
                  {selectedLocation.geographyKnowledge}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-amber-400/30 space-y-1">
                <h5 className="font-extrabold text-xs text-amber-300 flex items-center gap-1">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>💡 孩童趣味知多少 (Fun Fact):</span>
                </h5>
                <p className="text-xs text-slate-200 font-medium leading-relaxed">
                  {selectedLocation.funFact}
                </p>
              </div>
            </div>

            {/* Matched Books in Library for this Location */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="font-black text-xs text-amber-300 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-amber-400" />
                  <span>設定在此區域背景的繪本推薦 ({activeStat.matchingBooks.length} 本)：</span>
                </h4>

                {onFilterByKeyword && (
                  <button
                    type="button"
                    onClick={() => {
                      onFilterByKeyword(selectedLocation.matchingKeywords[0]);
                      onClose();
                    }}
                    className="text-[11px] font-bold text-amber-400 hover:text-amber-300 underline cursor-pointer"
                  >
                    前往主頁搜尋此區域繪本 →
                  </button>
                )}
              </div>

              {activeStat.matchingBooks.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {activeStat.matchingBooks.map((book) => (
                    <div
                      key={book.id}
                      className="p-3 rounded-2xl bg-slate-900/90 border border-slate-700 flex items-center gap-3 hover:border-amber-400 transition-colors"
                    >
                      <img
                        src={book.coverUrl}
                        alt={book.title['zh-TW'] || book.title.en}
                        className="w-12 h-16 rounded-lg object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0 space-y-1">
                        <h5 className="font-black text-xs text-amber-200 truncate">
                          《{book.title['zh-TW'] || book.title.en}》
                        </h5>
                        <p className="text-[10px] text-slate-400 truncate">{book.author}</p>
                        <button
                          type="button"
                          onClick={() => {
                            onSelectBook(book);
                            onClose();
                          }}
                          className="px-2.5 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-[10px] cursor-pointer"
                        >
                          開啟閱讀
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-dashed border-slate-700 text-center text-xs text-slate-400">
                  目前尚未收藏此背景區域的繪本，快利用『AI 繪本創作者』創作一本《{selectedLocation.name}》吧！
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950 border-t border-amber-400/20 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-amber-300 font-bold">
            <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
            <span>在地圖上點擊標記，邊讀繪本邊學習全世界地理歷史！</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-amber-400 text-slate-950 font-black text-xs hover:bg-amber-300 cursor-pointer"
          >
            完成地圖探索
          </button>
        </div>

      </div>
    </div>
  );
};
