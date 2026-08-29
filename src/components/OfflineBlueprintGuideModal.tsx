import React, { useState } from 'react';
import {
  Layers, Info, BookOpen, Volume2, CheckCircle2,
  Sparkles, Compass, Lightbulb, Zap, Shield, ArrowRight,
  Maximize2, Star, HelpCircle, X
} from 'lucide-react';
import { playStarChime, playPageTurnSound, speakText } from '../utils/audio';
import { VoiceRole } from '../types';

export interface OfflineBlueprintGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJumpToBlueprint?: (blueprintId: string) => void;
}

export const BLUEPRINTS_GUIDE_ITEMS = [
  {
    id: 'bp_solar_orbit',
    code: 'SPEC-ASTRO-ORBIT-01',
    titleZh: '太陽系行星公轉軌道與重力助推藍圖',
    titleEn: 'Solar System Planetary Orbit & Gravitational Assist',
    emoji: '🪐',
    themeColor: 'cyan',
    domain: '宇宙天文',
    corePrinciple: '萬有引力、克卜勒行星運動定律、逃逸速度與適居帶 (Goldilocks Zone)。',
    storyInspiration: '主角如何藉助木星的強大重力彈弓效應加速穿越小行星帶，前往外太空展開救援。',
    specsSummary: '涵蓋八大行星相對公轉半徑、第一宇宙速度 (7.9 km/s) 及太陽光抵達地球時間 (8分20秒)。',
  },
  {
    id: 'bp_green_architecture',
    code: 'SPEC-ARCH-ECO-03',
    titleZh: '三隻小豬環保零碳綠建築透視圖',
    titleEn: 'Zero-Carbon Eco Green Architecture Blueprint',
    emoji: '🏡',
    themeColor: 'amber',
    domain: '綠色永續',
    corePrinciple: '被動式節能建築、南向採光、熱壓煙囪效應對流、雨水多級重力淨化與光伏光電板。',
    storyInspiration: '豬小弟如何運用循環矽藻土與自然風道，打造冬天保暖、夏天清涼且能抵禦大野狼的永續基地。',
    specsSummary: '達到 100% 太陽能自給自足，年回收 12,000 公升中水，實現淨零碳排放 (Net-Zero)。',
  },
  {
    id: 'bp_forest_photosynthesis',
    code: 'SPEC-BIO-CYCLE-09',
    titleZh: '森林光合作用與生態能量循環剖面圖',
    titleEn: 'Forest Photosynthesis & Biomass Energy Flowchart',
    emoji: '🌳',
    themeColor: 'emerald',
    domain: '生命生態',
    corePrinciple: '葉綠體光反應光解水製造氧氣、微觀氣孔蒸散調節、地下菌根真菌共生互聯網 (Wood Wide Web)。',
    storyInspiration: '小樹苗如何透過地底菌絲向整座森林的同伴發送害蟲預警訊號，互相傳遞水分與糖分。',
    specsSummary: '揭密光合作用化學方程式 (6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂)，以及一公頃林地年固碳 15 噸的強大能量。',
  },
  {
    id: 'bp_ocean_abyss',
    code: 'SPEC-OCEAN-DEEP-42',
    titleZh: '深海洋流與生物發光解剖藍圖',
    titleEn: 'Deep Ocean Currents & Bioluminescence Schematic',
    emoji: '🌊',
    themeColor: 'purple',
    domain: '深海探險',
    corePrinciple: '熱鹽環流、冷光反應 (Luciferin + Luciferase)、萬米水壓耐受力與發光器官光學透鏡構造。',
    storyInspiration: '深海小烏賊如何在漆黑無光的馬里亞納海溝中，用閃爍的藍綠色冷光與洋流中的夥伴對話。',
    specsSummary: '冷光轉換率接近 100% 幾乎零熱能耗散，能承受超過 1,000 個大氣壓力的深海耐壓外骨骼結構。',
  },
  {
    id: 'bp_clockwork',
    code: 'SPEC-MECH-TIME-12',
    titleZh: '蒸汽鐘錶擒縱輪與恆定擺輪機構圖',
    titleEn: 'Steam Clockwork Escapement & Balance Wheel Blueprint',
    emoji: '🕰️',
    themeColor: 'amber',
    domain: '機械工程',
    corePrinciple: '發條位能儲存、擒縱叉定頻跳動調速、齒輪傳動比計算與雙金屬溫差補償擺輪。',
    storyInspiration: '機器人鐘錶修理師如何調校擒縱叉的嚙合角度，讓全城的巨大蒸汽時鐘恢復精準運轉。',
    specsSummary: '每小時 28,800 次高頻振動 (4Hz)，以微米級精度將未經調控的發條動力轉化為穩定的滴答聲。',
  },
  {
    id: 'bp_honeycomb',
    code: 'SPEC-GEOM-HEX-88',
    titleZh: '大自然幾何六角蜂巢晶格受力圖',
    titleEn: 'Biomimetic Hexagonal Honeycomb Structural Blueprint',
    emoji: '🍯',
    themeColor: 'amber',
    domain: '幾何仿生',
    corePrinciple: '120 度等邊六角密鋪、最小周長包圍最大容積定理、多向分散載荷應力分析。',
    storyInspiration: '小蜜蜂如何用最少量的蜂蠟築造出能承受數百倍自重、抗震且保溫的宏偉六角晶格宮殿。',
    specsSummary: '抗壓強度比一般方形結構提高 40%，航太衛星與輕量化賽車防撞層皆廣泛採用此幾何結構。',
  },
];

export const OfflineBlueprintGuideModal: React.FC<OfflineBlueprintGuideModalProps> = ({
  isOpen,
  onClose,
  onJumpToBlueprint,
}) => {
  const [selectedBlueprintId, setSelectedBlueprintId] = useState<string>('bp_solar_orbit');
  const [activeVoiceRole, setActiveVoiceRole] = useState<VoiceRole>('wizard');

  if (!isOpen) return null;

  const currentBp =
    BLUEPRINTS_GUIDE_ITEMS.find((b) => b.id === selectedBlueprintId) ||
    BLUEPRINTS_GUIDE_ITEMS[0];

  const handleSpeakBlueprintGuide = () => {
    playStarChime();
    const text = `為您導讀離線科普圖紙：${currentBp.titleZh}。這張圖紙的技術代號是 ${currentBp.code}，核心科學原理為：${currentBp.corePrinciple}。在故事創作中，它能啟發：${currentBp.storyInspiration}。技術規格特點是：${currentBp.specsSummary}。`;
    speakText(text, 'zh-TW', 1.0, activeVoiceRole);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-fadeIn">
      <div className="w-full max-w-4xl max-h-[90vh] bg-slate-950 border-2 border-cyan-400/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Modal Top Header */}
        <div className="p-5 bg-gradient-to-r from-slate-950 via-cyan-950/70 to-slate-950 border-b border-cyan-500/30 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-xl text-cyan-300 shadow">
              📐
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-cyan-300 flex items-center gap-2">
                <span>離線科普工程圖紙簡介與指南</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-cyan-500/20 text-cyan-200 border border-cyan-400/40">
                  Schematic Manual
                </span>
              </h3>
              <p className="text-xs font-bold text-slate-400">
                學習工程師與科學家如何用藍圖記錄原理，激發繪本故事創作靈感！
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSpeakBlueprintGuide}
              className="px-3.5 py-1.5 rounded-xl bg-cyan-500 text-slate-950 hover:bg-cyan-400 font-black text-xs flex items-center gap-1.5 shadow cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>語音導讀</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body with Two-Column Layout */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-6">
          {/* Blueprint Anatomy Overview Banner */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
            <h4 className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              <span>圖紙五大構成解密 (The 5 Elements of a Blueprint)</span>
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs font-bold">
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-base block mb-1">🏷️</span>
                <span className="text-cyan-300 block font-black">1. 標題欄</span>
                <span className="text-[10px] text-slate-400">名稱與版本代號</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-base block mb-1">📏</span>
                <span className="text-amber-300 block font-black">2. 比例尺</span>
                <span className="text-[10px] text-slate-400">真實尺寸縮放比</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-base block mb-1">🌐</span>
                <span className="text-purple-300 block font-black">3. 座標網格</span>
                <span className="text-[10px] text-slate-400">精準定位零件位置</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-base block mb-1">💡</span>
                <span className="text-rose-300 block font-black">4. 互動熱點</span>
                <span className="text-[10px] text-slate-400">雙語名詞與科普原理</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 col-span-2 sm:col-span-1">
                <span className="text-base block mb-1">📊</span>
                <span className="text-emerald-300 block font-black">5. 技術規格表</span>
                <span className="text-[10px] text-slate-400">數據指標與物理參數</span>
              </div>
            </div>
          </div>

          {/* Blueprint Selector Rail */}
          <div className="space-y-2">
            <h4 className="text-xs font-black text-cyan-300 uppercase tracking-wider">
              精選 6 幅科普工程圖紙清單 (點擊切換簡介)：
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {BLUEPRINTS_GUIDE_ITEMS.map((bp) => {
                const isSelected = selectedBlueprintId === bp.id;
                return (
                  <button
                    key={bp.id}
                    onClick={() => {
                      playStarChime();
                      setSelectedBlueprintId(bp.id);
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                      isSelected
                        ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-lg ring-2 ring-cyan-400 scale-105'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    <div className="text-2xl">{bp.emoji}</div>
                    <div>
                      <span className="text-[9px] font-mono text-cyan-300 block">{bp.code}</span>
                      <h5 className="font-extrabold text-xs text-white truncate">{bp.titleZh}</h5>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Blueprint In-Depth Briefing Card */}
          <div className="p-6 rounded-3xl bg-slate-900/95 border-2 border-cyan-500/40 shadow-xl space-y-5">
            <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="text-4xl p-2 rounded-2xl bg-slate-950 border border-cyan-500/30">
                  {currentBp.emoji}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-950 text-cyan-300 border border-cyan-400/40">
                      {currentBp.code}
                    </span>
                    <span className="text-xs font-bold text-slate-400">領域：{currentBp.domain}</span>
                  </div>
                  <h4 className="text-base sm:text-lg font-black text-white mt-0.5">
                    {currentBp.titleZh}
                  </h4>
                  <span className="text-xs font-mono text-cyan-300 block">{currentBp.titleEn}</span>
                </div>
              </div>

              {onJumpToBlueprint && (
                <button
                  onClick={() => {
                    playPageTurnSound();
                    onJumpToBlueprint(currentBp.id);
                    onClose();
                  }}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-xs flex items-center gap-1 shadow cursor-pointer shrink-0"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>在百科庫開啟此圖紙</span>
                </button>
              )}
            </div>

            {/* 3 Detail Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-slate-950 border border-cyan-500/30 space-y-1.5">
                <span className="text-xs font-black text-cyan-300 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-cyan-400" />
                  <span>核心科普原理</span>
                </span>
                <p className="text-xs font-bold text-slate-300 leading-relaxed">
                  {currentBp.corePrinciple}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-purple-500/30 space-y-1.5">
                <span className="text-xs font-black text-purple-300 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span>故事創作靈感</span>
                </span>
                <p className="text-xs font-bold text-slate-300 leading-relaxed">
                  {currentBp.storyInspiration}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/30 space-y-1.5">
                <span className="text-xs font-black text-emerald-300 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>工程數據與規格</span>
                </span>
                <p className="text-xs font-bold text-slate-300 leading-relaxed">
                  {currentBp.specsSummary}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between shrink-0">
          <span className="text-xs font-bold text-slate-400">
            💡 提示：在「離線故事生成工坊」中選擇這張圖紙，可以自動生成對應的冒險情節！
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-black text-xs cursor-pointer"
          >
            關閉簡介
          </button>
        </div>
      </div>
    </div>
  );
};
