import React, { useState } from 'react';
import { Sparkles, Dices, Wand2, CheckCircle2, RotateCw, ArrowDownRight } from 'lucide-react';
import { playStarChime } from '../utils/audio';

interface InspirationWheelProps {
  onApplyKeywords: (synthesizedPrompt: string, character: string, setting: string, plot: string) => void;
  darkMode?: boolean;
}

const CHARACTERS = [
  { icon: '🐱', name: '迷路貓咪' },
  { icon: '🚀', name: '小太空人' },
  { icon: '🤖', name: '害羞機器人' },
  { icon: '🦄', name: '魔法獨角獸' },
  { icon: '🐳', name: '唱歌藍鯨' },
  { icon: '🦊', name: '聰明狐狸' },
  { icon: '🦉', name: '智慧貓頭鷹' },
  { icon: '🦕', name: '好奇小恐龍' },
  { icon: '🐰', name: '烘焙小兔' },
  { icon: '🦸‍♂️', name: '披風小英雄' },
  { icon: '🐝', name: '勤勞小蜜蜂' },
  { icon: '🧜‍♀️', name: '深海小人魚' },
];

const SETTINGS = [
  { icon: '🌌', name: '閃耀銀河' },
  { icon: '🌲', name: '迷霧森林' },
  { icon: '🌊', name: '深海水晶宮' },
  { icon: '☁️', name: '雲朵城堡' },
  { icon: '📚', name: '古老圖書館' },
  { icon: '🍬', name: '糖果王國' },
  { icon: '🌋', name: '火山小島' },
  { icon: '🎪', name: '歡樂馬戲團' },
  { icon: '🏰', name: '魔法城堡' },
  { icon: '🌈', name: '彩虹雲端' },
  { icon: '🛸', name: '外星秘密基地' },
];

const PLOTS = [
  { icon: '🗺️', name: '尋找失落寶藏' },
  { icon: '🧭', name: '迷路找不到家' },
  { icon: '⏰', name: '時間突然倒流' },
  { icon: '🤝', name: '學會分享與交朋友' },
  { icon: '🪄', name: '魔法棒發光變形' },
  { icon: '🎵', name: '找回丟失的音樂' },
  { icon: '🎨', name: '幫黑白世界塗上彩色' },
  { icon: '鑰', name: '解開神秘金鑰匙' },
  { icon: '🌙', name: '勇敢克服對黑夜的恐懼' },
];

export const InspirationWheel: React.FC<InspirationWheelProps> = ({
  onApplyKeywords,
  darkMode = false,
}) => {
  const [selectedChar, setSelectedChar] = useState(CHARACTERS[0]);
  const [selectedSetting, setSelectedSetting] = useState(SETTINGS[0]);
  const [selectedPlot, setSelectedPlot] = useState(PLOTS[0]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [applied, setApplied] = useState(false);

  const handleSpin = () => {
    setIsSpinning(true);
    setApplied(false);
    playStarChime();

    let counter = 0;
    const interval = setInterval(() => {
      counter++;
      const randomC = CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)];
      const randomS = SETTINGS[Math.floor(Math.random() * SETTINGS.length)];
      const randomP = PLOTS[Math.floor(Math.random() * PLOTS.length)];

      setSelectedChar(randomC);
      setSelectedSetting(randomS);
      setSelectedPlot(randomP);

      if (counter >= 12) {
        clearInterval(interval);
        setIsSpinning(false);
      }
    }, 90);
  };

  const handleApply = () => {
    const promptText = `故事關於【${selectedChar.name}】在【${selectedSetting.name}】中【${selectedPlot.name}】的奇幻冒險，過程溫馨動人且充滿趣味。`;
    onApplyKeywords(promptText, selectedChar.name, selectedSetting.name, selectedPlot.name);
    setApplied(true);
    setTimeout(() => setApplied(false), 2500);
  };

  return (
    <div
      className={`p-5 sm:p-6 rounded-3xl border-2 transition-all shadow-md relative overflow-hidden ${
        darkMode
          ? 'bg-slate-900/90 border-amber-500/60 text-slate-100'
          : 'bg-gradient-to-r from-amber-100/90 via-orange-100/70 to-yellow-100/90 border-amber-400 text-amber-950'
      }`}
    >
      {/* Background Decorative Sparkles */}
      <div className="absolute top-2 right-2 opacity-20 pointer-events-none text-4xl">
        🎰
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-2xl bg-amber-500 text-white shadow-xs animate-bounce">
            <Dices className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base sm:text-lg flex items-center gap-1.5">
              <span>AI 繪本靈感轉盤</span>
              <span className="text-xs bg-amber-200 dark:bg-amber-900/80 text-amber-900 dark:text-amber-200 px-2 py-0.5 rounded-full">
                3關鍵詞點子
              </span>
            </h3>
            <p className="text-xs opacity-80">一鍵轉出「角色 + 場景 + 轉折」，瞬間啟發孩子的創作靈感！</p>
          </div>
        </div>

        {/* Spin Trigger Button */}
        <button
          type="button"
          onClick={handleSpin}
          disabled={isSpinning}
          className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-extrabold text-xs sm:text-sm shadow-md transition-transform active:scale-95 flex items-center justify-center gap-2 shrink-0"
        >
          <RotateCw className={`w-4 h-4 ${isSpinning ? 'animate-spin' : ''}`} />
          <span>{isSpinning ? '靈感轉盤旋轉中...' : '🎰 轉動靈感轉盤'}</span>
        </button>
      </div>

      {/* The 3 Reel Display Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-3">
        {/* Reel 1: Character */}
        <div
          className={`p-3.5 rounded-2xl border text-center transition-all ${
            isSpinning ? 'scale-95 opacity-80' : 'scale-100 opacity-100'
          } ${
            darkMode ? 'bg-slate-800 border-amber-500/40' : 'bg-white border-amber-300 shadow-2xs'
          }`}
        >
          <div className="text-[11px] font-extrabold opacity-75 uppercase tracking-wider mb-1">
            🎭 角色主角
          </div>
          <div className="text-3xl my-1 animate-pulse">{selectedChar.icon}</div>
          <div className="font-black text-sm text-amber-900 dark:text-amber-300">
            {selectedChar.name}
          </div>
        </div>

        {/* Reel 2: Setting */}
        <div
          className={`p-3.5 rounded-2xl border text-center transition-all ${
            isSpinning ? 'scale-95 opacity-80' : 'scale-100 opacity-100'
          } ${
            darkMode ? 'bg-slate-800 border-amber-500/40' : 'bg-white border-amber-300 shadow-2xs'
          }`}
        >
          <div className="text-[11px] font-extrabold opacity-75 uppercase tracking-wider mb-1">
            🗺️ 神奇場景
          </div>
          <div className="text-3xl my-1 animate-pulse">{selectedSetting.icon}</div>
          <div className="font-black text-sm text-amber-900 dark:text-amber-300">
            {selectedSetting.name}
          </div>
        </div>

        {/* Reel 3: Plot */}
        <div
          className={`p-3.5 rounded-2xl border text-center transition-all ${
            isSpinning ? 'scale-95 opacity-80' : 'scale-100 opacity-100'
          } ${
            darkMode ? 'bg-slate-800 border-amber-500/40' : 'bg-white border-amber-300 shadow-2xs'
          }`}
        >
          <div className="text-[11px] font-extrabold opacity-75 uppercase tracking-wider mb-1">
            ⚡ 關鍵冒險事件
          </div>
          <div className="text-3xl my-1 animate-pulse">{selectedPlot.icon}</div>
          <div className="font-black text-sm text-amber-900 dark:text-amber-300">
            {selectedPlot.name}
          </div>
        </div>
      </div>

      {/* Action Footer Bar */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-xs font-bold opacity-80 flex items-center gap-1.5 text-center sm:text-left">
          <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>目前組合：【{selectedChar.name}】+【{selectedSetting.name}】+【{selectedPlot.name}】</span>
        </div>

        <button
          type="button"
          onClick={handleApply}
          className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-xs ${
            applied
              ? 'bg-emerald-600 text-white'
              : 'bg-amber-500 hover:bg-amber-600 text-white hover:scale-105'
          }`}
        >
          {applied ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>已套用靈感構思！</span>
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4" />
              <span>✨ 一鍵套用至繪本靈感框</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
