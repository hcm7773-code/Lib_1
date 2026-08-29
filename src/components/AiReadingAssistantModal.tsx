import React, { useState, useEffect } from 'react';
import {
  X, Compass, MapPin, Users, GitCommit, Sparkles, Volume2,
  RefreshCw, Trophy, ChevronRight, Info, CheckCircle2, Star, ShieldCheck, Heart,
  ArrowRight, Zap, BookOpen, ExternalLink
} from 'lucide-react';
import { Book } from '../types';
import { speakText, playStarChime, playPageTurnSound } from '../utils/audio';

interface LocationNode {
  id: string;
  name: string;
  icon: string;
  coordinates: { x: number; y: number };
  description: string;
  isCurrentPageLocation: boolean;
  keyEvents: string[];
  pageNumber?: number;
  presentCharacters?: string[];
  keyObjects?: string[];
  sceneSecrets?: string;
}

interface CharacterRelation {
  targetId: string;
  targetName: string;
  relationType: string;
  description: string;
}

interface CharacterNode {
  id: string;
  name: string;
  avatar: string;
  role: string;
  description: string;
  relations: CharacterRelation[];
}

interface PlotStage {
  stage: string;
  title: string;
  description: string;
  pageRange: string;
  isCurrentStage: boolean;
  icon: string;
}

interface InteractiveReadingMapData {
  bookTitle: string;
  currentPageNumber: number;
  currentPageSummary: string;
  locations: LocationNode[];
  characterRelationships: CharacterNode[];
  plotTrajectory: PlotStage[];
}

interface AiReadingAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: Book;
  currentPageIndex: number;
  onOpenLeaderboard?: () => void;
  onJumpToPage?: (pageIndex: number) => void;
}

export const AiReadingAssistantModal: React.FC<AiReadingAssistantModalProps> = ({
  isOpen,
  onClose,
  book,
  currentPageIndex,
  onOpenLeaderboard,
  onJumpToPage,
}) => {
  const [activeTab, setActiveTab] = useState<'locations' | 'characters' | 'plot'>('locations');
  const [isLoading, setIsLoading] = useState(false);
  const [mapData, setMapData] = useState<InteractiveReadingMapData | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<LocationNode | null>(null);
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterNode | null>(null);
  const [interactiveDetailPopupLoc, setInteractiveDetailPopupLoc] = useState<LocationNode | null>(null);

  const currentPageNumber = currentPageIndex + 1;
  const currentPageObj = book.pages[currentPageIndex] || book.pages[0];
  const currentPageTextZh = currentPageObj?.text['zh-TW'] || currentPageObj?.text.en || '';

  const bookTitleZh = book.title['zh-TW'] || book.title.en;
  const bookSummaryZh = book.summary['zh-TW'] || book.summary.en;

  // Fetch AI Interactive Reading Map based on current page
  const fetchInteractiveMap = async () => {
    setIsLoading(true);
    try {
      const fullText = book.pages.map((p, i) => `[第${i + 1}頁] ${p.text['zh-TW'] || p.text.en}`).join('\n');
      const response = await fetch('/api/gemini/interactive-reading-map', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookTitle: bookTitleZh,
          currentPageNumber,
          currentPageText: currentPageTextZh,
          summary: bookSummaryZh,
          fullStoryText: fullText,
        }),
      });

      if (!response.ok) throw new Error('API request failed');
      const data: InteractiveReadingMapData = await response.json();
      setMapData(data);

      // Auto-select current page location or first location
      const activeLoc = data.locations.find((l) => l.isCurrentPageLocation) || data.locations[0];
      if (activeLoc) setSelectedLocation(activeLoc);

      if (data.characterRelationships && data.characterRelationships.length > 0) {
        setSelectedCharacter(data.characterRelationships[0]);
      }
    } catch (err) {
      console.warn('Failed to fetch interactive reading map:', err);
      // Fallback local state if network issue
      const fallbackData: InteractiveReadingMapData = {
        bookTitle: bookTitleZh,
        currentPageNumber,
        currentPageSummary: `第 ${currentPageNumber} 頁：故事高潮與主角冒險探索脈絡。`,
        locations: [
          {
            id: 'loc-1',
            name: '🌲 奇幻童話森林村',
            icon: '🌲',
            coordinates: { x: 25, y: 35 },
            description: '平安祥和的森林村莊，是主角踏出夢想探險的第一站。',
            isCurrentPageLocation: currentPageNumber === 1,
            keyEvents: ['主角行囊裝滿勇氣出發'],
            pageNumber: 1,
            presentCharacters: ['🦊 探險小狐狸', '🐿️ 熱心小松鼠'],
            keyObjects: ['🎒 勇氣背包', '📜 古老森林地圖'],
            sceneSecrets: '隱藏知識：森林村裡的清晨樹葉上有七彩露珠，據說是小精靈調製的幸運藥水喔！',
          },
          {
            id: 'loc-2',
            name: '🌌 湖畔秘境與星光谷',
            icon: '🌌',
            coordinates: { x: 55, y: 65 },
            description: '充滿考驗與智慧對話的秘境，幫助主角解開心中困惑。',
            isCurrentPageLocation: currentPageNumber > 1 && currentPageNumber < book.pages.length,
            keyEvents: ['遇到智慧小夥伴', '發現重要故事線索'],
            pageNumber: 2,
            presentCharacters: ['🦊 探險小狐狸', '🦉 智慧貓頭鷹'],
            keyObjects: ['🗝️ 魔法金鑰匙', '🧭 閃耀星光指南針'],
            sceneSecrets: '隱藏知識：湖水在滿月之夜會映照出內心深處最真實的願望喔！',
          },
          {
            id: 'loc-3',
            name: '🏰 勇氣希望城堡',
            icon: '🏰',
            coordinates: { x: 80, y: 30 },
            description: '終極舞台，象徵成長、分享與愛心的圓滿達成。',
            isCurrentPageLocation: currentPageNumber === book.pages.length,
            keyEvents: ['順利達成難關目標', '齊心協力歡慶陪伴'],
            pageNumber: Math.max(1, book.pages.length),
            presentCharacters: ['🦊 探險小狐狸', '🦉 智慧貓頭鷹', '🐰 熱心小兔'],
            keyObjects: ['🏆 友誼黃金獎牌', '💎 閃耀希望寶石'],
            sceneSecrets: '隱藏知識：城堡最高處的鐘聲響起時，會降下飛舞的五彩糖果雪花！',
          },
        ],
        characterRelationships: [
          {
            id: 'c-1',
            name: book.author ? `故事主角` : '小冒險家',
            avatar: '🦊',
            role: '主角勇士',
            description: '善良、富有同理心且熱愛探索世界的靈魂人物。',
            relations: [
              {
                targetId: 'c-2',
                targetName: '智慧導師',
                relationType: '啟發與陪伴',
                description: '在疑惑時提供冷靜思考的方向。',
              },
            ],
          },
          {
            id: 'c-2',
            name: '智慧導師',
            avatar: '🦉',
            role: '智慧小夥伴',
            description: '經驗豐富、語調溫和，指引冒險正確的方向。',
            relations: [
              {
                targetId: 'c-1',
                targetName: '故事主角',
                relationType: '傾聽與支持',
                description: '給予肯定並鼓勵嘗試。',
              },
            ],
          },
        ],
        plotTrajectory: [
          {
            stage: '起因',
            title: '🌱 冒險的契機',
            description: '主角在平和生活裡發現了新的夢想與目標。',
            pageRange: '第 1 頁',
            isCurrentStage: currentPageNumber === 1,
            icon: '🌱',
          },
          {
            stage: '發展',
            title: '🧭 邁出腳步關卡',
            description: '在旅程中學習團結合作與冷靜思考。',
            pageRange: `第 2-${Math.max(2, book.pages.length - 1)} 頁`,
            isCurrentStage: currentPageNumber > 1 && currentPageNumber < book.pages.length,
            icon: '🧭',
          },
          {
            stage: '高潮與結局',
            title: '🌟 勇氣與愛的成長',
            description: '解開難關，收穫深厚友誼與滿滿成就。',
            pageRange: `第 ${book.pages.length} 頁`,
            isCurrentStage: currentPageNumber === book.pages.length,
            icon: '🌟',
          },
        ],
      };
      setMapData(fallbackData);
      if (fallbackData.locations[0]) setSelectedLocation(fallbackData.locations[0]);
      if (fallbackData.characterRelationships[0]) setSelectedCharacter(fallbackData.characterRelationships[0]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchInteractiveMap();
    }
  }, [isOpen, currentPageIndex, book.id]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="w-full max-w-4xl max-h-[92vh] bg-slate-900 border-2 border-indigo-400 text-white rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header Bar */}
        <div className="p-4 sm:p-5 bg-slate-950/80 border-b border-indigo-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white shadow-md animate-pulse">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] sm:text-xs font-black bg-indigo-500 text-white px-2.5 py-0.5 rounded-full">
                  🤖 AI 閱讀理解輔助器
                </span>
                <span className="text-xs font-bold text-indigo-300">
                  📍 當前分析：第 {currentPageNumber} 頁
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white mt-0.5">
                《{bookTitleZh}》宏觀故事世界導圖
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Leaderboard Dashboard Shortcut Button */}
            {onOpenLeaderboard && (
              <button
                type="button"
                id="btn-assistant-open-leaderboard"
                onClick={() => {
                  playStarChime();
                  onOpenLeaderboard();
                }}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md hover:scale-105 transition-transform cursor-pointer shrink-0"
              >
                <Trophy className="w-3.5 h-3.5 fill-slate-950" />
                <span>🏆 成就排行榜</span>
              </button>
            )}

            {/* Refresh AI Map Button */}
            <button
              type="button"
              id="btn-refresh-interactive-map"
              onClick={() => {
                playPageTurnSound();
                fetchInteractiveMap();
              }}
              disabled={isLoading}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-200 border border-indigo-400/40 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
              title="依最新頁面內容重新分析生成"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
              <span className="hidden sm:inline">重新分析頁面</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        {isLoading ? (
          <div className="p-12 text-center space-y-4 my-auto">
            <div className="w-16 h-16 mx-auto rounded-full bg-indigo-500/20 border-2 border-indigo-400 flex items-center justify-center text-3xl animate-bounce">
              🦉
            </div>
            <div className="space-y-1">
              <h4 className="text-lg font-black text-indigo-300">
                AI 正為您繪製第 {currentPageNumber} 頁的故事宏觀世界...
              </h4>
              <p className="text-xs text-slate-400">
                解析故事地點地圖、角色關係圖與劇情起伏脈絡中
              </p>
            </div>
          </div>
        ) : mapData ? (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            
            {/* Page Context Summary Banner */}
            <div className="p-3.5 rounded-2xl bg-indigo-950/60 border border-indigo-400/30 flex items-center justify-between gap-3 shadow-md">
              <div className="flex items-center gap-2">
                <span className="text-xl">💡</span>
                <p className="text-xs sm:text-sm font-bold text-indigo-100">
                  <span className="font-black text-amber-300">第 {currentPageNumber} 頁重點摘要：</span>
                  {mapData.currentPageSummary}
                </p>
              </div>
              <button
                type="button"
                onClick={() => speakText(mapData.currentPageSummary, 'zh-TW')}
                className="p-2 rounded-xl bg-indigo-500/30 text-indigo-200 hover:bg-indigo-500/50 hover:text-white transition-all cursor-pointer shrink-0"
                title="語音朗讀摘要"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>

            {/* Sub-View Tabs Navigation */}
            <div className="grid grid-cols-3 gap-2 bg-slate-950 p-1.5 rounded-2xl border border-indigo-500/30">
              <button
                type="button"
                onClick={() => { setActiveTab('locations'); playPageTurnSound(); }}
                className={`py-2.5 px-3 rounded-xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'locations'
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg scale-[1.02]'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <MapPin className="w-4 h-4 text-amber-300" />
                <span>🗺️ 故事地點地圖</span>
              </button>

              <button
                type="button"
                onClick={() => { setActiveTab('characters'); playPageTurnSound(); }}
                className={`py-2.5 px-3 rounded-xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'characters'
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg scale-[1.02]'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Users className="w-4 h-4 text-amber-300" />
                <span>👥 角色關係網絡</span>
              </button>

              <button
                type="button"
                onClick={() => { setActiveTab('plot'); playPageTurnSound(); }}
                className={`py-2.5 px-3 rounded-xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'plot'
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg scale-[1.02]'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <GitCommit className="w-4 h-4 text-amber-300" />
                <span>🧭 劇情脈絡起伏</span>
              </button>
            </div>

            {/* TAB 1: STORY LOCATIONS WORLD MAP */}
            {activeTab === 'locations' && (
              <div className="space-y-4 animate-fadeIn">
                
                {/* Visual Interactive Map Canvas */}
                <div className="relative w-full h-64 sm:h-80 rounded-3xl bg-slate-950 border-2 border-indigo-500/40 overflow-hidden shadow-2xl p-4 flex flex-col justify-between"
                  style={{
                    backgroundImage: `radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.15) 0%, rgba(15, 23, 42, 0.95) 100%)`,
                  }}
                >
                  <div className="flex items-center justify-between z-10">
                    <span className="text-[10px] font-black bg-indigo-500/80 text-white px-2.5 py-1 rounded-full border border-indigo-300/40">
                      🌍 故事世界全景地圖（點擊地圖地標導覽）
                    </span>
                    <span className="text-[11px] font-bold text-amber-300">
                      📍 當前故事舞台閃爍中
                    </span>
                  </div>

                  {/* Render Location Markers/Pins */}
                  <div className="absolute inset-0 pointer-events-none">
                    {mapData.locations.map((loc) => {
                      const isSelected = selectedLocation?.id === loc.id;
                      return (
                        <button
                          key={loc.id}
                          type="button"
                          onClick={() => {
                            setSelectedLocation(loc);
                            setInteractiveDetailPopupLoc(loc);
                            playStarChime();
                          }}
                          style={{
                            left: `${loc.coordinates.x}%`,
                            top: `${loc.coordinates.y}%`,
                          }}
                          className={`absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto p-2 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-1.5 shadow-xl ${
                            loc.isCurrentPageLocation
                              ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 border-white ring-4 ring-amber-400/50 animate-bounce z-20 font-black'
                              : isSelected
                              ? 'bg-indigo-600 text-white border-amber-300 scale-110 z-10'
                              : 'bg-slate-900/90 text-indigo-200 border-indigo-400/60 hover:scale-105'
                          }`}
                        >
                          <span className="text-xl">{loc.icon}</span>
                          <span className="text-xs font-black truncate max-w-[90px] sm:max-w-[130px]">
                            {loc.name}
                          </span>
                          {loc.isCurrentPageLocation && (
                            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="text-[10px] font-medium text-slate-400 z-10 text-right">
                    提示：點擊任何地標即可開啟【互動地圖解說彈窗】與跳轉該頁面
                  </div>
                </div>

                {/* Selected Location Card */}
                {selectedLocation && (
                  <div className="p-5 rounded-3xl bg-slate-800/90 border border-indigo-400/50 space-y-4 shadow-xl">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3 border-indigo-500/30">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl p-2.5 rounded-2xl bg-indigo-950 border border-indigo-400/40 shrink-0">
                          {selectedLocation.icon}
                        </span>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-base sm:text-lg font-black text-amber-300">
                              {selectedLocation.name}
                            </h4>
                            <span className="px-2.5 py-0.5 rounded-full bg-indigo-900 text-indigo-200 font-bold text-[10px] border border-indigo-400/40">
                              對應第 {selectedLocation.pageNumber || 1} 頁
                            </span>
                            {selectedLocation.isCurrentPageLocation && (
                              <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px]">
                                📍 當前閱讀舞台
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-300 font-bold mt-1">
                            {selectedLocation.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        {/* Interactive Explanation Modal Trigger Button */}
                        <button
                          type="button"
                          onClick={() => {
                            setInteractiveDetailPopupLoc(selectedLocation);
                            playStarChime();
                          }}
                          className="px-3 py-2 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-transform hover:scale-105"
                        >
                          <Info className="w-3.5 h-3.5 text-amber-300" />
                          <span>開啟地圖解說彈窗</span>
                        </button>

                        {/* Page Jump Button */}
                        {onJumpToPage && (
                          <button
                            type="button"
                            onClick={() => {
                              playPageTurnSound();
                              onJumpToPage((selectedLocation.pageNumber || 1) - 1);
                            }}
                            className="px-3.5 py-2 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md transition-transform hover:scale-105 cursor-pointer"
                          >
                            <Zap className="w-3.5 h-3.5 fill-slate-950" />
                            <span>🚀 跳轉至第 {selectedLocation.pageNumber || 1} 頁</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Auto-tagged Scene Characters & Key Objects */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      {/* Scene Characters */}
                      <div className="p-3 rounded-2xl bg-slate-950/70 border border-indigo-500/30 space-y-1.5">
                        <div className="text-xs font-black text-indigo-300 flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-amber-300" />
                          <span>👥 該場景登場角色標註：</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedLocation.presentCharacters && selectedLocation.presentCharacters.length > 0 ? (
                            selectedLocation.presentCharacters.map((char, cIdx) => (
                              <span key={cIdx} className="px-2.5 py-1 rounded-xl bg-indigo-900/80 border border-indigo-400/40 text-indigo-100 text-xs font-bold">
                                {char}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-slate-400 font-medium">🦊 故事主要探險角色</span>
                          )}
                        </div>
                      </div>

                      {/* Key Objects */}
                      <div className="p-3 rounded-2xl bg-slate-950/70 border border-amber-500/30 space-y-1.5">
                        <div className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                          <span>🗝️ 該場景重點物件標註：</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedLocation.keyObjects && selectedLocation.keyObjects.length > 0 ? (
                            selectedLocation.keyObjects.map((obj, oIdx) => (
                              <span key={oIdx} className="px-2.5 py-1 rounded-xl bg-amber-950/80 border border-amber-400/40 text-amber-200 text-xs font-bold">
                                {obj}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-slate-400 font-medium">📜 魔法故事寶物</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Key Events at Location */}
                    {selectedLocation.keyEvents && selectedLocation.keyEvents.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <h5 className="text-xs font-black text-indigo-300 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>在此地點發生的關鍵故事事件：</span>
                        </h5>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {selectedLocation.keyEvents.map((evt, idx) => (
                            <li key={idx} className="p-2 rounded-xl bg-slate-950/60 border border-slate-700 text-xs font-medium text-slate-200 flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                              <span>{evt}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: CHARACTER RELATIONSHIP NETWORK */}
            {activeTab === 'characters' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="p-3 bg-indigo-950/40 rounded-2xl border border-indigo-500/30 text-xs font-bold text-indigo-200">
                  👥 點擊任何角色，即可檢視其性格特質、角色定位以及與其他人物的互動關係網絡：
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  
                  {/* Left Column: Character List */}
                  <div className="space-y-2">
                    {mapData.characterRelationships.map((char) => {
                      const isSelected = selectedCharacter?.id === char.id;
                      return (
                        <button
                          key={char.id}
                          type="button"
                          onClick={() => {
                            setSelectedCharacter(char);
                            playStarChime();
                          }}
                          className={`w-full p-3.5 rounded-2xl border text-left transition-all flex items-center gap-3 cursor-pointer ${
                            isSelected
                              ? 'bg-gradient-to-r from-amber-400/20 to-purple-500/20 border-amber-400 ring-2 ring-amber-400/50 shadow-lg'
                              : 'bg-slate-800/80 border-slate-700 hover:border-indigo-400'
                          }`}
                        >
                          <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-indigo-400/40 flex items-center justify-center text-2xl shrink-0">
                            {char.avatar}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h5 className="font-black text-sm text-white">{char.name}</h5>
                              <span className="text-[10px] font-black bg-indigo-500/80 text-white px-2 py-0.5 rounded-full">
                                {char.role}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-300 font-medium line-clamp-1 mt-0.5">
                              {char.description}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Right Column: Selected Character Relationships Detail */}
                  {selectedCharacter && (
                    <div className="md:col-span-2 p-5 rounded-3xl bg-slate-800/90 border border-indigo-400/50 space-y-4 shadow-xl">
                      <div className="flex items-center justify-between border-b pb-3 border-indigo-500/30">
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-14 rounded-2xl bg-indigo-950 border-2 border-amber-400 flex items-center justify-center text-3xl shrink-0 shadow-md">
                            {selectedCharacter.avatar}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-lg font-black text-amber-300">
                                {selectedCharacter.name}
                              </h4>
                              <span className="text-xs font-black bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-full">
                                {selectedCharacter.role}
                              </span>
                            </div>
                            <p className="text-xs text-slate-200 font-bold mt-0.5">
                              {selectedCharacter.description}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => speakText(`${selectedCharacter.name}。${selectedCharacter.description}`, 'zh-TW')}
                          className="p-2 rounded-xl bg-indigo-500/30 text-indigo-200 hover:text-white cursor-pointer shrink-0"
                          title="語音介紹角色"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Relationship Connections */}
                      <div className="space-y-2">
                        <h5 className="text-xs font-black text-indigo-300 flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-amber-400" />
                          <span>人物羈絆與關係鏈 (Relationship Links)：</span>
                        </h5>

                        <div className="space-y-2">
                          {selectedCharacter.relations.map((rel, idx) => (
                            <div key={idx} className="p-3 rounded-2xl bg-slate-950/70 border border-indigo-500/30 space-y-1">
                              <div className="flex items-center justify-between text-xs font-extrabold">
                                <span className="text-amber-300 flex items-center gap-1">
                                  <span>{selectedCharacter.name}</span>
                                  <span className="text-slate-400">↔</span>
                                  <span className="text-indigo-200">{rel.targetName}</span>
                                </span>
                                <span className="px-2 py-0.5 rounded-full bg-purple-500/30 border border-purple-400/40 text-purple-200 text-[10px] font-black">
                                  {rel.relationType}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-300 font-medium">
                                {rel.description}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            )}

            {/* TAB 3: PLOT TRAJECTORY & STORY ARC TIMELINE */}
            {activeTab === 'plot' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="p-3 bg-indigo-950/40 rounded-2xl border border-indigo-500/30 text-xs font-bold text-indigo-200 flex items-center justify-between">
                  <span>🧭 故事起承轉合關卡起伏線（📍 代表您當前正在閱讀的章節進度）：</span>
                  <span className="text-amber-300 font-black">
                    第 {currentPageNumber} / {book.pages.length} 頁
                  </span>
                </div>

                {/* Vertical or Horizontal Story Arc Steps */}
                <div className="space-y-3">
                  {mapData.plotTrajectory.map((plot, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-3xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        plot.isCurrentStage
                          ? 'bg-gradient-to-r from-amber-500/20 via-indigo-600/30 to-purple-600/30 border-amber-400 ring-2 ring-amber-400/60 shadow-xl scale-[1.01]'
                          : 'bg-slate-800/80 border-slate-700'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 ${
                          plot.isCurrentStage ? 'bg-amber-400 text-slate-950 font-black border-2 border-white shadow-md' : 'bg-slate-900 text-indigo-200 border border-slate-700'
                        }`}>
                          {plot.icon || '🌱'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                              plot.isCurrentStage ? 'bg-amber-400 text-slate-950' : 'bg-indigo-900 text-indigo-200'
                            }`}>
                              {plot.stage} • {plot.pageRange}
                            </span>
                            {plot.isCurrentStage && (
                              <span className="text-[10px] font-black text-amber-300 animate-pulse">
                                📍 您當前正閱讀此章節
                              </span>
                            )}
                          </div>
                          <h4 className="text-sm sm:text-base font-black text-white mt-1">
                            {plot.title}
                          </h4>
                          <p className="text-xs text-slate-300 font-medium mt-0.5">
                            {plot.description}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => speakText(`${plot.stage}。${plot.title}。${plot.description}`, 'zh-TW')}
                        className="p-2.5 rounded-2xl bg-indigo-500/20 hover:bg-indigo-500/40 text-indigo-200 font-bold text-xs flex items-center gap-1 transition-all cursor-pointer shrink-0 self-end sm:self-center"
                      >
                        <Volume2 className="w-4 h-4 text-amber-300" />
                        <span className="sm:hidden">朗讀章節</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        ) : null}

        {/* Footer Bar */}
        <div className="p-4 bg-slate-950/90 border-t border-indigo-500/30 flex items-center justify-between gap-3 text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>AI 閱讀理解輔助器可協助孩子建立宏觀故事觀與空間邏輯推理力。</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-2xl bg-indigo-500 hover:bg-indigo-600 text-white font-black text-xs transition-transform hover:scale-105 cursor-pointer shadow-md"
          >
            收起輔助器，繼續繪本閱讀 📖
          </button>
        </div>

      </div>

      {/* 🗺️ 互動地圖解說彈窗 (Interactive Map Explanation & Scene Navigation Popup Modal) */}
      {interactiveDetailPopupLoc && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border-2 border-amber-400/80 p-5 sm:p-6 space-y-4 relative shadow-2xl overflow-y-auto max-h-[90vh]">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-indigo-500/30 pb-3 gap-2">
              <div className="flex items-center gap-3">
                <span className="text-4xl p-2.5 rounded-2xl bg-indigo-950 border border-indigo-400/50 shrink-0">
                  {interactiveDetailPopupLoc.icon}
                </span>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg sm:text-xl font-black text-amber-300">
                      {interactiveDetailPopupLoc.name}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-900 text-indigo-100 font-black text-[10px] border border-indigo-400/50">
                      📍 頁面導覽：第 {interactiveDetailPopupLoc.pageNumber || 1} 頁
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-bold mt-1">
                    {interactiveDetailPopupLoc.description}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setInteractiveDetailPopupLoc(null)}
                className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 🚀 Quick Scene Jump Button */}
            {onJumpToPage && (
              <button
                type="button"
                onClick={() => {
                  playPageTurnSound();
                  const pIdx = (interactiveDetailPopupLoc.pageNumber || 1) - 1;
                  onJumpToPage(pIdx);
                  setInteractiveDetailPopupLoc(null);
                }}
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-transform hover:scale-[1.02] cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-slate-950" />
                <span>🚀 導覽跳轉：前往繪本第 {interactiveDetailPopupLoc.pageNumber || 1} 頁場景</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {/* Auto-tagged Scene Characters */}
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-indigo-500/40 space-y-2">
              <div className="text-xs font-black text-indigo-300 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-amber-300" />
                <span>👥 該場景登場角色標註：</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {interactiveDetailPopupLoc.presentCharacters && interactiveDetailPopupLoc.presentCharacters.length > 0 ? (
                  interactiveDetailPopupLoc.presentCharacters.map((char, cIdx) => (
                    <span key={cIdx} className="px-3 py-1.5 rounded-xl bg-indigo-900/90 border border-indigo-400/50 text-indigo-100 text-xs font-bold flex items-center gap-1 shadow-sm">
                      <span>{char}</span>
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400 font-medium">🦊 主要探險主角</span>
                )}
              </div>
            </div>

            {/* Auto-tagged Scene Key Objects */}
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-amber-500/40 space-y-2">
              <div className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>🗝️ 該場景重點物件標註：</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {interactiveDetailPopupLoc.keyObjects && interactiveDetailPopupLoc.keyObjects.length > 0 ? (
                  interactiveDetailPopupLoc.keyObjects.map((obj, oIdx) => (
                    <span key={oIdx} className="px-3 py-1.5 rounded-xl bg-amber-950/90 border border-amber-400/50 text-amber-200 text-xs font-bold flex items-center gap-1 shadow-sm">
                      <span>{obj}</span>
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400 font-medium">📜 關鍵探索寶物</span>
                )}
              </div>
            </div>

            {/* Scene Events */}
            {interactiveDetailPopupLoc.keyEvents && interactiveDetailPopupLoc.keyEvents.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-black text-indigo-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>在此地點發生的故事重點事件：</span>
                </div>
                <ul className="space-y-1.5">
                  {interactiveDetailPopupLoc.keyEvents.map((evt, idx) => (
                    <li key={idx} className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-700 text-xs font-medium text-slate-200 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                      <span>{evt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Scene Secret / Fun Fact */}
            {interactiveDetailPopupLoc.sceneSecrets && (
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-950/80 to-indigo-950/80 border border-purple-400/50 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-amber-300 flex items-center gap-1">
                    <span>💡 隱藏趣味知識與故事小祕密</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => speakText(interactiveDetailPopupLoc.sceneSecrets || '', 'zh-TW')}
                    className="p-1.5 rounded-lg bg-purple-500/30 text-purple-200 hover:text-white transition-colors cursor-pointer"
                    title="朗讀秘密知識"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-amber-300" />
                  </button>
                </div>
                <p className="text-xs font-medium text-purple-200 leading-relaxed">
                  {interactiveDetailPopupLoc.sceneSecrets}
                </p>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => speakText(`${interactiveDetailPopupLoc.name}。${interactiveDetailPopupLoc.description}`, 'zh-TW')}
                className="px-3 py-2 rounded-xl bg-indigo-500/20 text-indigo-200 font-bold text-xs flex items-center gap-1 hover:bg-indigo-500/40 cursor-pointer"
              >
                <Volume2 className="w-4 h-4 text-amber-300" />
                <span>語音朗讀地點</span>
              </button>

              <button
                type="button"
                onClick={() => setInteractiveDetailPopupLoc(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer"
              >
                關閉解說
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
