import React, { useState, useRef } from 'react';
import { X, Settings, Volume2, Globe, Type, Languages, Moon, Sun, Mic, Sparkles, Sliders, Play, Square, Wifi, Music, Activity, Star, ShoppingBag, Lock, Unlock, CheckCircle2 } from 'lucide-react';
import { ReaderSettings, LanguageCode, BgMusicTrack, VoiceRole, VoiceMarketplaceItem } from '../types';
import { SUPPORTED_LANGUAGES } from '../data/languages';
import { speakText, stopSpeech, BG_MUSIC_PLAYLIST, playBackgroundAmbience, stopBackgroundAmbience, playStarChime } from '../utils/audio';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ReaderSettings;
  onUpdateSettings: (newSettings: ReaderSettings) => void;
  onOpenOfflineAnalytics?: () => void;
  userStars?: number;
  onDeductStars?: (amount: number) => void;
}

export const VOICE_MARKETPLACE_ITEMS: VoiceMarketplaceItem[] = [
  {
    id: 'mom',
    name: '溫柔媽媽',
    icon: '🌸',
    priceStars: 0,
    description: '親切溫柔，聲音甜美細膩，最適合睡前陪伴故事',
    sampleText: '嗨！我是媽媽，今天想聽哪一個溫馨的故事呢？',
    categoryTag: '免費預設',
    isDefaultFree: true,
  },
  {
    id: 'cartoon',
    name: '活潑卡通',
    icon: '🐥',
    priceStars: 0,
    description: '活潑開朗，高亢有彈性，讓探險故事充滿歡樂！',
    sampleText: '嘿！小冒險家！快跟我一起出發去繪本王國玩吧！',
    categoryTag: '免費預設',
    isDefaultFree: true,
  },
  {
    id: 'grandpa',
    name: '睿智爺爺',
    icon: '👴',
    priceStars: 0,
    description: '深沉穩重，說話緩慢清晰，充滿智慧與慈祥感',
    sampleText: '呵呵，孩子，坐下來，爺爺講一個古老的故事給你聽。',
    categoryTag: '免費預設',
    isDefaultFree: true,
  },
  {
    id: 'teacher',
    name: '熱情老師',
    icon: '👩‍🏫',
    priceStars: 0,
    description: '咬字標準，聲音有啟發性，最適合雙語閱讀學習',
    sampleText: '太棒了！一起用心朗讀這個故事，認識有趣的新詞彙吧！',
    categoryTag: '免費預設',
    isDefaultFree: true,
  },
  {
    id: 'robot',
    name: 'AI 機器人博士',
    icon: '🤖',
    priceStars: 5,
    description: '穩重清晰的科技韻律音，專精科普與宇宙奇幻冒險！',
    sampleText: '嗶嗶！AI機器人博士啟動完成，準備傳輸知識故事！',
    categoryTag: '科幻奇想',
  },
  {
    id: 'fairy',
    name: '夢幻童話精靈',
    icon: '🧚‍♀️',
    priceStars: 5,
    description: '輕盈高雅的聲線，為每個故事繪本灑上魔法金粉！',
    sampleText: '帶著誠摯的心，跟我一起飛進魔法故事繪本世界吧！',
    categoryTag: '童話魔法',
  },
  {
    id: 'detective',
    name: '聰明小偵探',
    icon: '🕵️‍♂️',
    priceStars: 5,
    description: '節奏明快敏捷，帶領孩子觀察蛛絲馬跡、動腦思考！',
    sampleText: '發現關鍵線索了！讓我們繼續往下閱讀故事吧！',
    categoryTag: '解謎探險',
  },
  {
    id: 'astronaut',
    name: '銀河太空探險家',
    icon: '👨‍🚀',
    priceStars: 10,
    description: '充滿未知的星際對講機聲線，帶領孩子漫遊九大行星！',
    sampleText: '呼叫地球指揮中心！太空探險家已抵達神秘星雲！',
    categoryTag: '宇宙星空',
  },
  {
    id: 'wizard',
    name: '古典魔法大師',
    icon: '🧙‍♂️',
    priceStars: 10,
    description: '莊嚴高亢的古老魔法共鳴音，翻開遠古奇幻魔法史詩！',
    sampleText: '阿瓦達... 噢不，讓我們打開魔法繪本，吟誦智慧咒語吧！',
    categoryTag: '童話魔法',
  },
  {
    id: 'dragon',
    name: '城堡守護小火龍',
    icon: '🐲',
    priceStars: 12,
    description: '低沉而富有安全感的龍吟聲線，最忠誠的城堡守護者！',
    sampleText: '吼喔~ 我是守護城堡的小火龍，今天由我來保護你的故事！',
    categoryTag: '奇幻神獸',
  },
  {
    id: 'alien',
    name: '外星嘟嘟星人',
    icon: '👾',
    priceStars: 15,
    description: '滑稽俏皮的嘟嘟歡樂高頻音，讓閱讀過程笑聲不斷！',
    sampleText: '嘟嘟嗶嗶！外星人降落地球！這個故事聽起來太好玩啦！',
    categoryTag: '科幻奇想',
  },
  {
    id: 'santa',
    name: '歡樂聖誕老人',
    icon: '🎅',
    priceStars: 15,
    description: 'Ho! Ho! Ho! 充滿節慶喜悅與禮物祝福的溫暖厚重嗓音！',
    sampleText: 'Ho Ho Ho! 乖孩子，聖誕老人為你帶來最棒的故事禮物！',
    categoryTag: '節慶限定',
  },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onOpenOfflineAnalytics,
  userStars = 0,
  onDeductStars,
}) => {
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [testingTrack, setTestingTrack] = useState<BgMusicTrack | null>(null);
  const [starWarningToast, setStarWarningToast] = useState<string | null>(null);
  const debounceTimerRef = useRef<any>(null);

  if (!isOpen) return null;

  const currentRate = settings.speechRate || 1.0;
  const currentPitch = settings.speechPitch || 1.0;
  const currentEmotionIntensity = settings.emotionIntensity ?? 80;
  const currentBgTrack = settings.bgMusicTrack || (settings.bgMusic ? 'lullaby' : 'off');
  const currentBgVolume = settings.bgMusicVolume ?? 0.3;
  const unlockedVoices = settings.unlockedVoices || ['mom', 'cartoon', 'grandpa', 'teacher'];

  const handleTestVoice = (
    roleId: VoiceRole,
    text: string,
    rate: number = currentRate,
    pitch: number = currentPitch,
    intensity: number = currentEmotionIntensity
  ) => {
    stopSpeech();
    setIsPlayingPreview(true);
    speakText(text, 'zh-TW', rate, roleId, pitch, () => setIsPlayingPreview(false), undefined, undefined, intensity);
  };

  const handleUnlockOrSelectVoice = (item: VoiceMarketplaceItem) => {
    const isUnlocked = unlockedVoices.includes(item.id) || item.isDefaultFree;

    if (isUnlocked) {
      onUpdateSettings({ ...settings, voiceRole: item.id });
      return;
    }

    if (userStars < item.priceStars) {
      setStarWarningToast(`⭐ 星星數量不足！解鎖『${item.name}』需要 ${item.priceStars} 顆星星（你目前有 ${userStars} 顆）。繼續閱讀繪本就能賺取更多星星囉！`);
      setTimeout(() => setStarWarningToast(null), 5000);
      return;
    }

    playStarChime();
    if (onDeductStars) {
      onDeductStars(item.priceStars);
    }

    const newUnlocked = Array.from(new Set([...unlockedVoices, item.id]));
    onUpdateSettings({
      ...settings,
      unlockedVoices: newUnlocked,
      voiceRole: item.id,
    });
  };

  // Real-time Audio Preview for rate/pitch/emotion slider changes
  const triggerLiveSimulatedPreview = (newRate: number, newPitch: number, newIntensity: number) => {
    stopSpeech();
    setIsPlayingPreview(true);
    const sampleText = '哇！太神奇了！小熊勇敢地飛向彩虹，開心地下起了糖果雨！';
    speakText(
      sampleText,
      'zh-TW',
      newRate,
      settings.voiceRole || 'mom',
      newPitch,
      () => setIsPlayingPreview(false),
      undefined,
      undefined,
      newIntensity
    );
  };

  const handleRateSliderChange = (newRate: number) => {
    onUpdateSettings({ ...settings, speechRate: newRate });

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      triggerLiveSimulatedPreview(newRate, currentPitch, currentEmotionIntensity);
    }, 250);
  };

  const handlePitchSliderChange = (newPitch: number) => {
    onUpdateSettings({ ...settings, speechPitch: newPitch });

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      triggerLiveSimulatedPreview(currentRate, newPitch, currentEmotionIntensity);
    }, 250);
  };

  const handleEmotionIntensitySliderChange = (newIntensity: number) => {
    onUpdateSettings({ ...settings, emotionIntensity: newIntensity });

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      triggerLiveSimulatedPreview(currentRate, currentPitch, newIntensity);
    }, 250);
  };

  const handleStopPreview = () => {
    stopSpeech();
    setIsPlayingPreview(false);
  };

  const handlePlayMusicTrackPreview = (trackId: BgMusicTrack) => {
    if (testingTrack === trackId) {
      stopBackgroundAmbience();
      setTestingTrack(null);
    } else {
      setTestingTrack(trackId);
      playBackgroundAmbience(trackId, currentBgVolume);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full border-2 border-amber-300 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto scrollbar-none">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-amber-200 pb-3">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-amber-600" />
            <h2 className="font-extrabold text-amber-950 text-lg">閱讀與語音朗讀角色設定</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-amber-100 text-amber-900">
            <X className="w-5 h-5" />
          </button>
        </div>

        {starWarningToast && (
          <div className="p-3 rounded-2xl bg-amber-100 border border-amber-300 text-amber-950 text-xs font-bold flex items-center justify-between animate-fadeIn">
            <span>{starWarningToast}</span>
            <button
              type="button"
              onClick={() => setStarWarningToast(null)}
              className="text-amber-800 hover:text-amber-950 font-black ml-2 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Options Form */}
        <div className="space-y-6">

          {/* Dark / Light Mode Theme Toggle */}
          <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="font-extrabold text-xs sm:text-sm text-amber-950 flex items-center gap-1.5">
                {settings.darkMode ? <Moon className="w-4 h-4 text-purple-600" /> : <Sun className="w-4 h-4 text-amber-600" />}
                <span>介面主題顏色模式</span>
              </span>
              <p className="text-[11px] font-bold text-amber-800/80">
                {settings.darkMode ? '目前為深色護眼模式，適合睡前閱讀' : '目前為明亮溫暖模式，視覺清晰'}
              </p>
            </div>

            <button
              onClick={() => onUpdateSettings({ ...settings, darkMode: !settings.darkMode })}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black shadow-xs transition-transform active:scale-95 ${
                settings.darkMode
                  ? 'bg-purple-900 text-purple-100 border border-purple-700'
                  : 'bg-amber-500 text-white border border-amber-600'
              }`}
            >
              {settings.darkMode ? '🌙 深色模式' : '☀️ 淺色模式'}
            </button>
          </div>

          {/* 🛍️ 聲音市集 Voice Marketplace */}
          <div className="p-4 rounded-3xl bg-gradient-to-br from-amber-50 via-orange-50/70 to-amber-100/60 border-2 border-amber-300 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-amber-200 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-2xl bg-amber-500 text-white shadow-xs">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-amber-950 flex items-center gap-2">
                    <span>童心 AI 聲音市集</span>
                    <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full font-black">
                      星星解鎖解鎖多元語調
                    </span>
                  </h3>
                  <p className="text-[11px] font-bold text-amber-800/80">
                    用讀書賺到的星星解鎖最喜歡的專屬配音員！
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 bg-amber-200/80 px-3 py-1.5 rounded-2xl border border-amber-300 text-amber-950 font-black text-xs shadow-2xs">
                <Star className="w-4 h-4 fill-amber-500 text-amber-500 animate-spin-slow" />
                <span>{userStars} 顆星星</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1 scrollbar-none">
              {VOICE_MARKETPLACE_ITEMS.map((item) => {
                const isUnlocked = unlockedVoices.includes(item.id) || item.isDefaultFree;
                const isSelected = (settings.voiceRole || 'mom') === item.id;

                return (
                  <div
                    key={item.id}
                    onClick={() => handleUnlockOrSelectVoice(item)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-2 flex flex-col justify-between relative ${
                      isSelected
                        ? 'bg-amber-100 border-amber-500 shadow-md ring-2 ring-amber-400'
                        : isUnlocked
                        ? 'bg-white/80 border-amber-200 hover:bg-amber-50/80'
                        : 'bg-slate-50/80 border-slate-200 opacity-90 hover:opacity-100 hover:border-amber-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{item.icon}</span>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-black text-xs text-amber-950">{item.name}</h4>
                            <span className="text-[9px] bg-amber-200/60 text-amber-900 font-bold px-1.5 py-0.2 rounded-md">
                              {item.categoryTag}
                            </span>
                          </div>

                          <div className="mt-0.5">
                            {isSelected ? (
                              <span className="text-[10px] font-black text-emerald-600 flex items-center gap-0.5">
                                <CheckCircle2 className="w-3 h-3" /> 使用中
                              </span>
                            ) : isUnlocked ? (
                              <span className="text-[10px] font-bold text-amber-800/80 flex items-center gap-0.5">
                                <Unlock className="w-3 h-3 text-amber-600" /> 已解鎖 (點擊切換)
                              </span>
                            ) : (
                              <span className="text-[10px] font-black text-rose-600 flex items-center gap-0.5">
                                <Lock className="w-3 h-3" /> 需要 {item.priceStars} ⭐ 解鎖
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTestVoice(item.id, item.sampleText);
                          }}
                          className="p-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 text-[10px] font-black flex items-center gap-1 transition-transform hover:scale-105"
                          title="試聽語音"
                        >
                          <Volume2 className="w-3.5 h-3.5 text-orange-600" />
                          <span className="hidden sm:inline">試聽</span>
                        </button>
                      </div>
                    </div>

                    <p className="text-[10px] font-bold text-slate-600 leading-tight">
                      {item.description}
                    </p>

                    {!isUnlocked && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUnlockOrSelectVoice(item);
                        }}
                        className={`w-full py-1.5 rounded-xl font-black text-xs flex items-center justify-center gap-1 shadow-2xs transition-transform hover:scale-[1.02] ${
                          userStars >= item.priceStars
                            ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600'
                            : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                        <span>使用 {item.priceStars} ⭐ 購買解鎖</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 🎚️ Visual Voice Sliders & Real-Time Audio Simulation Preview */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-50 via-orange-50/60 to-amber-100/50 border-2 border-amber-300/80 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between border-b border-amber-200/80 pb-2">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-orange-600" />
                <h3 className="font-black text-xs sm:text-sm text-amber-950">
                  語音速度與音調可視化調整 (含即時模擬)
                </h3>
              </div>

              {isPlayingPreview ? (
                <button
                  type="button"
                  onClick={handleStopPreview}
                  className="flex items-center gap-1 bg-rose-500 hover:bg-rose-600 text-white text-[11px] font-black px-2.5 py-1 rounded-xl shadow-xs animate-pulse"
                >
                  <Square className="w-3 h-3 fill-white" />
                  <span>停止模擬</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => triggerLiveSimulatedPreview(currentRate, currentPitch, currentEmotionIntensity)}
                  className="flex items-center gap-1 bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-black px-2.5 py-1 rounded-xl shadow-xs transition-transform hover:scale-105"
                >
                  <Play className="w-3 h-3 fill-white" />
                  <span>🔊 即時語音模擬試聽</span>
                </button>
              )}
            </div>

            {/* Live Audio Wave Graphic Indicator when playing */}
            {isPlayingPreview && (
              <div className="p-2.5 bg-orange-100 rounded-xl border border-orange-300 flex items-center justify-between gap-2 text-xs font-bold text-orange-950 animate-fadeIn">
                <div className="flex items-center gap-2">
                  <span className="animate-bounce">🔊</span>
                  <span>即時語音模擬中...（速度: {currentRate}x，音調: {currentPitch}x）</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-4 bg-orange-500 rounded-full animate-pulse" />
                  <span className="w-1.5 h-6 bg-amber-500 rounded-full animate-bounce" />
                  <span className="w-1.5 h-3 bg-orange-600 rounded-full animate-pulse" />
                </div>
              </div>
            )}

            {/* 1. Speech Rate Visual Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-amber-950">
                <span className="flex items-center gap-1.5">
                  <Volume2 className="w-4 h-4 text-amber-600" />
                  <span>朗讀速度 (Speech Rate)：</span>
                </span>
                <span className="text-amber-900 bg-amber-200/80 px-2.5 py-0.5 rounded-full font-black text-xs border border-amber-300">
                  {currentRate.toFixed(2)}x
                </span>
              </div>

              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.05"
                value={currentRate}
                onChange={(e) => handleRateSliderChange(parseFloat(e.target.value))}
                className="w-full accent-amber-600 cursor-pointer h-2 bg-amber-200 rounded-lg"
              />

              <div className="flex justify-between text-[10px] font-extrabold text-amber-800">
                <span>🐢 0.5x 超慢速</span>
                <span>🐇 1.0x 標準速</span>
                <span>🚀 2.0x 快速</span>
              </div>
            </div>

            {/* 2. Speech Pitch Visual Slider */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-xs font-bold text-amber-950">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-orange-600" />
                  <span>朗讀音調 (Speech Pitch)：</span>
                </span>
                <span className="text-orange-900 bg-orange-200/80 px-2.5 py-0.5 rounded-full font-black text-xs border border-orange-300">
                  {currentPitch.toFixed(2)}x
                </span>
              </div>

              <input
                type="range"
                min="0.5"
                max="1.8"
                step="0.05"
                value={currentPitch}
                onChange={(e) => handlePitchSliderChange(parseFloat(e.target.value))}
                className="w-full accent-orange-600 cursor-pointer h-2 bg-orange-200 rounded-lg"
              />

              <div className="flex justify-between text-[10px] font-extrabold text-amber-800">
                <span>低沉厚實 (0.5x)</span>
                <span>標準音高 (1.0x)</span>
                <span>高亢清亮 (1.8x)</span>
              </div>
            </div>

            {/* 🎭 3. Emotion Speech Intensity Slider */}
            <div className="space-y-1.5 pt-2 border-t border-amber-200/80">
              <div className="flex items-center justify-between text-xs font-bold text-amber-950">
                <span className="flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-rose-600 animate-pulse" />
                  <span>情緒朗讀動態強度 (Emotion Intensity)：</span>
                </span>
                <span className="text-rose-900 bg-rose-100 px-2.5 py-0.5 rounded-full font-black text-xs border border-rose-300">
                  {currentEmotionIntensity}%
                </span>
              </div>

              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={currentEmotionIntensity}
                onChange={(e) => handleEmotionIntensitySliderChange(parseInt(e.target.value, 10))}
                className="w-full accent-rose-600 cursor-pointer h-2 bg-rose-200 rounded-lg"
              />

              <div className="flex justify-between text-[10px] font-extrabold text-amber-800">
                <span>0% 平穩冷靜</span>
                <span>50% 自然輕微</span>
                <span>80% 生動推薦</span>
                <span>100% 戲劇演繹</span>
              </div>
              <p className="text-[10px] text-amber-800/80 font-bold leading-tight pt-0.5">
                💡 語音系統將根據故事劇情（悲傷失落、驚喜歡呼、緊張危急、勇敢冒險等）動態變化語調高低與速度感。
              </p>
            </div>
          </div>

          {/* 🎵 Background Music Playlist & Audio Atmosphere Controls */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-indigo-50/80 via-purple-50/60 to-pink-50/80 border-2 border-indigo-200 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between border-b border-indigo-200/80 pb-2">
              <div className="flex items-center gap-2">
                <Music className="w-5 h-5 text-indigo-600" />
                <div>
                  <h3 className="font-black text-xs sm:text-sm text-indigo-950">繪本背景配樂播放清單</h3>
                  <p className="text-[10px] font-bold text-indigo-700/80">
                    根據情境切換專屬環境樂章，提升孩子情境沉浸感
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  const newMusicState = !settings.bgMusic;
                  onUpdateSettings({
                    ...settings,
                    bgMusic: newMusicState,
                    bgMusicTrack: newMusicState ? (settings.bgMusicTrack !== 'off' ? settings.bgMusicTrack : 'lullaby') : 'off',
                  });
                  if (!newMusicState) stopBackgroundAmbience();
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-black shadow-2xs transition-transform active:scale-95 ${
                  settings.bgMusic
                    ? 'bg-indigo-600 text-white border border-indigo-700'
                    : 'bg-slate-200 text-slate-700 border border-slate-300'
                }`}
              >
                {settings.bgMusic ? '🎵 配樂已開啟' : '🔇 配樂已關閉'}
              </button>
            </div>

            {/* Volume Control */}
            {settings.bgMusic && (
              <div className="space-y-1 bg-white/70 p-3 rounded-xl border border-indigo-100">
                <div className="flex items-center justify-between text-xs font-bold text-indigo-950">
                  <span className="flex items-center gap-1.5">
                    <Volume2 className="w-3.5 h-3.5 text-indigo-600" />
                    <span>背景配樂音量：</span>
                  </span>
                  <span className="text-indigo-900 bg-indigo-100 px-2 py-0.5 rounded-lg font-black text-[11px]">
                    {Math.round(currentBgVolume * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="1.0"
                  step="0.05"
                  value={currentBgVolume}
                  onChange={(e) => {
                    const newVol = parseFloat(e.target.value);
                    onUpdateSettings({ ...settings, bgMusicVolume: newVol });
                    if (testingTrack) {
                      playBackgroundAmbience(testingTrack, newVol);
                    }
                  }}
                  className="w-full accent-indigo-600 cursor-pointer h-2 bg-indigo-200 rounded-lg"
                />
              </div>
            )}

            {/* Playlist Grid */}
            <div className="space-y-2">
              <label className="text-xs font-black text-indigo-950 flex items-center justify-between">
                <span>選擇精選配樂曲目：</span>
                <span className="text-[10px] text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full font-bold">
                  共 {BG_MUSIC_PLAYLIST.filter((t) => t.id !== 'off').length} 首環境樂曲
                </span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1 scrollbar-none">
                {BG_MUSIC_PLAYLIST.map((track) => {
                  const isSelected = currentBgTrack === track.id && settings.bgMusic;
                  const isAuditioning = testingTrack === track.id;

                  return (
                    <div
                      key={track.id}
                      onClick={() => {
                        if (track.id === 'off') {
                          onUpdateSettings({ ...settings, bgMusic: false, bgMusicTrack: 'off' });
                          stopBackgroundAmbience();
                        } else {
                          onUpdateSettings({ ...settings, bgMusic: true, bgMusicTrack: track.id });
                          playBackgroundAmbience(track.id, currentBgVolume);
                        }
                      }}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-1.5 ${
                        isSelected
                          ? 'bg-indigo-100 border-indigo-500 shadow-2xs ring-2 ring-indigo-400'
                          : 'bg-white/80 border-indigo-100 hover:bg-indigo-50/80'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="text-lg">{track.emoji}</span>
                          <div>
                            <div className="flex items-center gap-1">
                              <h4 className="font-extrabold text-xs text-indigo-950">{track.name}</h4>
                              {isSelected && (
                                <span className="text-[9px] bg-indigo-600 text-white font-black px-1.5 py-0.2 rounded-full">
                                  播放中
                                </span>
                              )}
                            </div>
                            <span className="text-[9px] text-indigo-600 font-bold bg-indigo-50 px-1.5 py-0.2 rounded-md">
                              {track.categoryTag}
                            </span>
                          </div>
                        </div>

                        {track.id !== 'off' && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePlayMusicTrackPreview(track.id);
                            }}
                            className={`px-2 py-1 rounded-lg text-[10px] font-black flex items-center gap-1 transition-transform hover:scale-105 ${
                              isAuditioning
                                ? 'bg-rose-500 text-white animate-pulse'
                                : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-200 border border-indigo-200'
                            }`}
                          >
                            {isAuditioning ? <Square className="w-2.5 h-2.5 fill-white" /> : <Play className="w-2.5 h-2.5 fill-indigo-700" />}
                            <span>{isAuditioning ? '停止' : '試聽'}</span>
                          </button>
                        )}
                      </div>

                      <p className="text-[10px] text-indigo-900/70 font-semibold leading-tight">
                        {track.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          
          {/* Primary Language */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-amber-600" />
              <span>預設故事閱讀語言：</span>
            </label>
            <select
              value={settings.primaryLang}
              onChange={(e) =>
                onUpdateSettings({ ...settings, primaryLang: e.target.value as LanguageCode })
              }
              className="w-full p-3 rounded-2xl bg-amber-50 border border-amber-300 font-bold text-amber-950 text-xs sm:text-sm focus:outline-none"
            >
              {SUPPORTED_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.flag} {l.name} ({l.nativeName})
                </option>
              ))}
            </select>
          </div>

          {/* Secondary Language for Dual Text */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
              <Languages className="w-4 h-4 text-orange-600" />
              <span>雙語對照模式次要語言：</span>
            </label>
            <select
              value={settings.secondaryLang}
              onChange={(e) =>
                onUpdateSettings({ ...settings, secondaryLang: e.target.value as any })
              }
              className="w-full p-3 rounded-2xl bg-amber-50 border border-amber-300 font-bold text-amber-950 text-xs sm:text-sm focus:outline-none"
            >
              <option value="none">關閉雙語對照 (僅顯示主語言)</option>
              {SUPPORTED_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.flag} {l.name} ({l.nativeName})
                </option>
              ))}
            </select>
          </div>

          {/* Font Size Option */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
              <Type className="w-4 h-4 text-amber-600" />
              <span>繪本內文文字大小：</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'sm', label: '標準' },
                { id: 'md', label: '適中' },
                { id: 'lg', label: '較大' },
                { id: 'xl', label: '特大' },
              ].map((size) => (
                <button
                  key={size.id}
                  type="button"
                  onClick={() => onUpdateSettings({ ...settings, fontSize: size.id as any })}
                  className={`p-2.5 rounded-xl text-xs font-extrabold border transition-colors ${
                    settings.fontSize === size.id
                      ? 'bg-amber-600 text-white border-amber-700'
                      : 'bg-amber-50 text-amber-950 border-amber-200 hover:bg-amber-100'
                  }`}
                >
                  {size.label}
                </button>
              ))}
            </div>
          </div>

          {/* PWA & Offline Reading Status Card */}
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-emerald-500 text-white rounded-xl">
                  <Wifi className="w-4 h-4" />
                </div>
                <h4 className="font-extrabold text-xs text-emerald-950">PWA 離線閱讀與快取管理</h4>
              </div>
              <span className="text-[10px] bg-emerald-200 text-emerald-900 font-extrabold px-2 py-0.5 rounded-full">
                PWA 已啟用
              </span>
            </div>

            <p className="text-[11px] font-bold text-emerald-900/80 leading-relaxed">
              本數位圖書館支援 Progressive Web App (PWA) 離線技術。系統會自動快取已閱讀或已下載之繪本，讓孩童在搭車、出國或無網路環境下也能隨時開起應用程式閱讀！
            </p>

            <div className="pt-2 flex items-center justify-between text-[11px] font-black text-emerald-900 border-t border-emerald-200">
              <span>離線繪本下載狀態：</span>
              {onOpenOfflineAnalytics ? (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenOfflineAnalytics();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-xs transition-transform hover:scale-105 flex items-center gap-1"
                >
                  <Wifi className="w-3.5 h-3.5" />
                  <span>📊 查看離線數據統計與快取指標</span>
                </button>
              ) : (
                <span className="text-emerald-700 bg-white px-2 py-0.5 rounded-lg border border-emerald-300">
                  可隨時在館藏繪本點擊 📥 下載圖示
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={onClose}
          className="w-full bg-amber-600 hover:bg-amber-700 text-white font-black py-3 rounded-2xl text-sm shadow-md"
        >
          完成與儲存設定
        </button>
      </div>
    </div>
  );
};

