import React, { useState } from 'react';
import {
  Bell, BellRing, Clock, Volume2, Sparkles, CheckCircle2,
  Calendar, Music, Play, ShieldCheck, Heart, AlertCircle, Bot
} from 'lucide-react';
import { UserProfile, SmartReadingReminderConfig, VoiceRole } from '../types';
import { playStarChime, playPageTurnSound, speakText } from '../utils/audio';

interface SmartReadingReminderCardProps {
  profile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  darkMode?: boolean;
}

const DEFAULT_REMINDER_CONFIG: SmartReadingReminderConfig = {
  enabled: true,
  time: '19:30',
  daysOfWeek: [1, 2, 3, 4, 5, 6, 0], // Every day
  voicePrompt: true,
  voiceStyle: 'gentle_owl',
  soundTone: 'chime',
  customMessage: '小探險家，今天的溫馨繪本共讀時間到了！快來探索新故事、領取今日星星獎勵吧！',
  autoSpeechOnLoad: false,
};

const PRESET_TIMES = [
  { label: '🌅 晨讀朝陽', time: '08:00', desc: '精神飽滿的晨間識字' },
  { label: '🌞 午後時光', time: '14:30', desc: '課後放鬆的趣味故事' },
  { label: '🌇 傍晚共讀', time: '19:30', desc: '親子共讀的最佳時光' },
  { label: '🌙 床邊故事', time: '20:30', desc: '溫馨入眠的童話陪伴' },
];

const DAYS = [
  { day: 1, label: '一' },
  { day: 2, label: '二' },
  { day: 3, label: '三' },
  { day: 4, label: '四' },
  { day: 5, label: '五' },
  { day: 6, label: '六' },
  { day: 0, label: '日' },
];

interface VoiceStyleOption {
  id: 'gentle_owl' | 'lively_cat' | 'warm_mom' | 'cheerful_fairy';
  label: string;
  voiceRole: VoiceRole;
  pitch: number;
  rate: number;
  desc: string;
}

const VOICE_STYLES: VoiceStyleOption[] = [
  { id: 'gentle_owl', label: '🦉 貓頭鷹博士', voiceRole: 'teacher', pitch: 1.0, rate: 0.95, desc: '溫和博學、啟發思考' },
  { id: 'lively_cat', label: '🐱 活潑咪咪貓', voiceRole: 'cartoon', pitch: 1.3, rate: 1.05, desc: '生動輕快、元氣滿滿' },
  { id: 'warm_mom', label: '👩 溫柔媽媽', voiceRole: 'mom', pitch: 1.1, rate: 0.9, desc: '慈愛安撫、溫馨甜美' },
  { id: 'cheerful_fairy', label: '🧚 奇幻小精靈', voiceRole: 'fairy', pitch: 1.4, rate: 1.0, desc: '魔法童趣、充滿驚喜' },
];

export const SmartReadingReminderCard: React.FC<SmartReadingReminderCardProps> = ({
  profile,
  onUpdateProfile,
  darkMode = false,
}) => {
  const reminder = profile.smartReminder || DEFAULT_REMINDER_CONFIG;

  const [testNotificationVisible, setTestNotificationVisible] = useState(false);
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);

  const handleUpdate = (partial: Partial<SmartReadingReminderConfig>) => {
    const updated: SmartReadingReminderConfig = {
      ...reminder,
      ...partial,
    };
    onUpdateProfile({
      ...profile,
      smartReminder: updated,
    });
    setSaveSuccessNotice(true);
    setTimeout(() => setSaveSuccessNotice(false), 2500);
  };

  const handleToggleDay = (day: number) => {
    const currentDays = reminder.daysOfWeek || [];
    let nextDays: number[];
    if (currentDays.includes(day)) {
      if (currentDays.length === 1) return; // Keep at least one day
      nextDays = currentDays.filter(d => d !== day);
    } else {
      nextDays = [...currentDays, day];
    }
    handleUpdate({ daysOfWeek: nextDays });
    playPageTurnSound();
  };

  const handleTestSpeech = () => {
    setIsPlayingVoice(true);
    playStarChime();
    const styleObj = VOICE_STYLES.find(v => v.id === reminder.voiceStyle) || VOICE_STYLES[0];
    const speechText = `${reminder.customMessage} 目前設定於每日 ${reminder.time} 準時提醒！`;

    speakText(speechText, 'zh-TW', styleObj.rate, styleObj.voiceRole, styleObj.pitch);
    setTimeout(() => {
      setIsPlayingVoice(false);
    }, 4000);
  };

  const handleSimulateNotification = () => {
    playStarChime();
    setTestNotificationVisible(true);
    if (reminder.voicePrompt) {
      handleTestSpeech();
    }
  };

  return (
    <div
      id="smart-reading-reminder-card"
      className={`p-6 sm:p-8 rounded-3xl border transition-all relative overflow-hidden ${
        darkMode
          ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950/60 border-indigo-500/40 text-slate-100 shadow-xl'
          : 'bg-gradient-to-br from-amber-50/90 via-orange-50/60 to-yellow-50/80 border-amber-300 shadow-md text-amber-950'
      }`}
    >
      {/* Background ambient light */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b pb-4 mb-6 gap-3 border-amber-200/80 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-2xl shadow-md transition-all ${
            reminder.enabled
              ? 'bg-gradient-to-tr from-amber-500 via-orange-500 to-yellow-400 text-slate-950 animate-pulse'
              : 'bg-slate-300 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
          }`}>
            {reminder.enabled ? <BellRing className="w-6 h-6" /> : <Bell className="w-6 h-6" />}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-black text-lg sm:text-xl flex items-center gap-1.5">
                <span>⏰ 智慧繪本閱讀提醒與共讀鬧鐘</span>
              </h2>
              <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                reminder.enabled
                  ? 'bg-emerald-500 text-white shadow-2xs'
                  : 'bg-slate-400 text-white'
              }`}>
                {reminder.enabled ? '已啟用定時提醒 🔔' : '已暫停'}
              </span>
            </div>
            <p className={`text-xs font-semibold ${darkMode ? 'text-slate-300' : 'text-amber-900/80'}`}>
              設定每日定時溫馨共讀提醒、客製化語音伴讀播報與床邊故事叮嚀
            </p>
          </div>
        </div>

        {/* Master Switch Toggle */}
        <div className="flex items-center gap-3 self-end sm:self-auto">
          {saveSuccessNotice && (
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 animate-fadeIn">
              <CheckCircle2 className="w-3.5 h-3.5" /> 已自動儲存
            </span>
          )}
          <button
            type="button"
            onClick={() => {
              handleUpdate({ enabled: !reminder.enabled });
              playPageTurnSound();
            }}
            className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors focus:outline-none cursor-pointer ${
              reminder.enabled ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-700'
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-md ${
                reminder.enabled ? 'translate-x-8' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Main Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Col: Time & Presets & Days of Week (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* Preset Time Slots */}
          <div className="space-y-2">
            <label className={`text-xs font-bold flex items-center gap-1.5 ${darkMode ? 'text-slate-300' : 'text-amber-900'}`}>
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span>快速選擇閱讀時段：</span>
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PRESET_TIMES.map((preset) => {
                const isSelected = reminder.time === preset.time;
                return (
                  <button
                    key={preset.time}
                    type="button"
                    onClick={() => {
                      handleUpdate({ time: preset.time });
                      playStarChime();
                    }}
                    className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 border-amber-600 font-black shadow-sm scale-102 ring-2 ring-amber-300'
                        : darkMode
                        ? 'bg-slate-800/90 border-slate-700 text-slate-200 hover:bg-slate-700'
                        : 'bg-white text-slate-800 border-amber-200 hover:bg-amber-100/70 shadow-2xs'
                    }`}
                  >
                    <div className="text-xs font-black">{preset.label}</div>
                    <div className="text-sm font-extrabold mt-0.5">{preset.time}</div>
                    <div className="text-[10px] opacity-75 mt-0.5 truncate">{preset.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Time Picker */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-white/70 dark:bg-slate-800/80 border border-amber-200 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span className="text-xs font-bold">自訂提醒時間：</span>
            </div>
            <input
              type="time"
              value={reminder.time}
              onChange={(e) => handleUpdate({ time: e.target.value })}
              className={`px-4 py-2 rounded-xl text-base font-black border focus:outline-none focus:ring-2 focus:ring-amber-400 ${
                darkMode
                  ? 'bg-slate-900 border-slate-700 text-amber-300'
                  : 'bg-amber-50 border-amber-300 text-amber-950'
              }`}
            />
          </div>

          {/* Days of week chips */}
          <div className="space-y-2">
            <label className={`text-xs font-bold flex items-center gap-1.5 ${darkMode ? 'text-slate-300' : 'text-amber-900'}`}>
              <Calendar className="w-3.5 h-3.5 text-amber-500" />
              <span>每週重複頻率：</span>
            </label>

            <div className="flex items-center gap-2 flex-wrap">
              {DAYS.map((d) => {
                const isSelected = reminder.daysOfWeek?.includes(d.day);
                return (
                  <button
                    key={d.day}
                    type="button"
                    onClick={() => handleToggleDay(d.day)}
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-slate-950 border-amber-400 shadow-xs scale-105'
                        : darkMode
                        ? 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-amber-100'
                    }`}
                  >
                    週{d.label}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => {
                  handleUpdate({ daysOfWeek: [1, 2, 3, 4, 5, 6, 0] });
                  playPageTurnSound();
                }}
                className="text-[11px] font-black text-amber-600 dark:text-amber-400 px-3 py-1.5 rounded-xl bg-amber-100/80 dark:bg-slate-800 border border-amber-300 dark:border-slate-700 hover:bg-amber-200 cursor-pointer"
              >
                每天全選
              </button>
            </div>
          </div>
        </div>

        {/* Right Col: Voice Character, Custom Prompt & Interactive Test (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Voice companion style */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className={`text-xs font-bold flex items-center gap-1.5 ${darkMode ? 'text-slate-300' : 'text-amber-900'}`}>
                <Bot className="w-3.5 h-3.5 text-amber-500" />
                <span>AI 伴讀播報音色：</span>
              </label>

              <label className="flex items-center gap-1 text-[11px] font-bold cursor-pointer">
                <input
                  type="checkbox"
                  checked={reminder.voicePrompt}
                  onChange={(e) => handleUpdate({ voicePrompt: e.target.checked })}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <span>啟用語音朗讀</span>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {VOICE_STYLES.map((v) => {
                const isSelected = reminder.voiceStyle === v.id;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => {
                      handleUpdate({ voiceStyle: v.id as any });
                      playStarChime();
                    }}
                    className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 border-amber-600 font-black shadow-xs ring-2 ring-amber-300'
                        : darkMode
                        ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                        : 'bg-white text-slate-800 border-amber-200 hover:bg-amber-50'
                    }`}
                  >
                    <div className="text-xs font-black">{v.label}</div>
                    <div className="text-[10px] opacity-75 mt-0.5">{v.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Notification Message */}
          <div className="space-y-1.5">
            <label className={`text-xs font-bold flex items-center gap-1 ${darkMode ? 'text-slate-300' : 'text-amber-900'}`}>
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>客製化提醒詞語：</span>
            </label>
            <textarea
              rows={2}
              value={reminder.customMessage}
              onChange={(e) => handleUpdate({ customMessage: e.target.value })}
              className={`w-full p-2.5 rounded-xl border text-xs font-bold resize-none focus:outline-none focus:ring-2 focus:ring-amber-400 ${
                darkMode
                  ? 'bg-slate-900 border-slate-700 text-slate-200'
                  : 'bg-white border-amber-200 text-amber-950'
              }`}
            />
          </div>

          {/* Test & Simulation Buttons */}
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              id="btn-test-smart-reminder-voice"
              onClick={handleTestSpeech}
              disabled={isPlayingVoice}
              className="flex-1 py-2.5 px-3 rounded-2xl bg-amber-200/90 hover:bg-amber-300/90 dark:bg-slate-800 dark:hover:bg-slate-700 text-amber-950 dark:text-amber-300 font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all shadow-2xs border border-amber-300 dark:border-slate-700 cursor-pointer"
            >
              <Volume2 className={`w-4 h-4 text-amber-600 ${isPlayingVoice ? 'animate-bounce' : ''}`} />
              <span>{isPlayingVoice ? '播報試聽中...' : '🎙️ 試聽播報'}</span>
            </button>

            <button
              type="button"
              id="btn-simulate-smart-reminder"
              onClick={handleSimulateNotification}
              className="flex-1 py-2.5 px-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-md hover:scale-102 cursor-pointer"
            >
              <BellRing className="w-4 h-4 text-slate-950 animate-bounce" />
              <span>🔔 模擬提醒彈窗</span>
            </button>
          </div>
        </div>
      </div>

      {/* Simulated Live Notification Modal / Toast */}
      {testNotificationVisible && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full border-4 border-amber-400 shadow-2xl space-y-4 text-center relative animate-scaleUp">
            
            <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-tr from-amber-400 to-orange-500 text-slate-950 flex items-center justify-center text-3xl shadow-lg animate-bounce">
              ⏰
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-950 uppercase">
                每日閱讀目標定時提醒
              </span>
              <h3 className="text-xl font-black text-slate-900 dark:text-slate-100">
                📖 繪本共讀時間到了！
              </h3>
              <p className="text-xs font-bold text-amber-700 dark:text-amber-400">
                目前時間：{reminder.time} • 今日目標：{profile.dailyGoalMinutes || 15} 分鐘
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-slate-800 border border-amber-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 leading-relaxed text-left">
              💬 {reminder.customMessage}
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setTestNotificationVisible(false);
                  playPageTurnSound();
                }}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs sm:text-sm shadow-md transition-transform hover:scale-102 cursor-pointer"
              >
                ✨ 馬上開始探索繪本！
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
