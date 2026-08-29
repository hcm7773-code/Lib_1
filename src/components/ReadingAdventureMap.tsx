import React, { useState, useEffect, useRef } from 'react';
import {
  Compass, MapPin, Sparkles, CheckCircle2, Lock, Play, Volume2, Award,
  ChevronRight, X, Shield, Eye, Flame, Star, Trophy, RefreshCw,
  Wifi, WifiOff, CloudOff, Database, ArrowUpRight, Zap, Info, Check, Cloud
} from 'lucide-react';
import { Book, UserProfile } from '../types';
import { playStarChime, speakText } from '../utils/audio';

export interface RealmData {
  id: string;
  name: string;
  nameEn: string;
  categoryKeys: string[];
  icon: string;
  element: string;
  guardianName: string;
  guardianAvatar: string;
  colorGradient: string;
  borderGlowColor: string;
  bgAtmosphere: string;
  lore: string;
  guardianQuote: string;
  targetBooks: number;
  bonusStars: number;
  floatDelayClass: string;
  mapCoords: { x: number; y: number }; // percentage on map
}

export const ADVENTURE_REALMS: RealmData[] = [
  {
    id: 'fairy-forest',
    name: '翡翠童話精靈森林',
    nameEn: 'Emerald Fairy Forest',
    categoryKeys: ['Fairy Tale', '童話', '奇幻'],
    icon: '🌲',
    element: '木之靈光',
    guardianName: '翡翠小鹿 露露',
    guardianAvatar: '🦌',
    colorGradient: 'from-emerald-600 via-teal-500 to-green-400',
    borderGlowColor: 'border-emerald-400 shadow-emerald-500/30',
    bgAtmosphere: 'bg-emerald-950/40',
    lore: '傳說中長滿千年金蘋果與發光夜光菇的仙境森林。每當讀完經典童話，森林中央的生命之樹便會綻放翠綠星塵！',
    guardianQuote: '只要你熱愛童話，森林的每一片綠葉都會為你輕聲唱歌！',
    targetBooks: 2,
    bonusStars: 15,
    floatDelayClass: 'animate-map-float',
    mapCoords: { x: 20, y: 25 },
  },
  {
    id: 'eco-valley',
    name: '綠色奇蹟科普谷',
    nameEn: 'Eco Science & Nature Valley',
    categoryKeys: ['Nature & Science', '自然科普', '環保', '科學'],
    icon: '🔬',
    element: '智慧翠綠',
    guardianName: '科技貓頭鷹 博士',
    guardianAvatar: '🦉',
    colorGradient: 'from-lime-600 via-emerald-500 to-teal-400',
    borderGlowColor: 'border-lime-400 shadow-lime-500/30',
    bgAtmosphere: 'bg-lime-950/40',
    lore: '充滿太陽能竹屋、生態溫室與奇妙發明的科研綠谷。每當你讀完自然科學繪本，科普谷的高空風車便會旋轉點亮整片山谷！',
    guardianQuote: '探索大自然的秘密，就是通往未來最強大的魔法！',
    targetBooks: 2,
    bonusStars: 15,
    floatDelayClass: 'animate-map-float-slow',
    mapCoords: { x: 80, y: 22 },
  },
  {
    id: 'heritage-city',
    name: '多國神話千燈古城',
    nameEn: 'Heritage & World Lore City',
    categoryKeys: ['Culture & Heritage', '民間故事', '多國文化', '神話'],
    icon: '🏮',
    element: '歷史明燈',
    guardianName: '彩虹神龍 傲天',
    guardianAvatar: '🐉',
    colorGradient: 'from-amber-600 via-orange-500 to-yellow-400',
    borderGlowColor: 'border-amber-400 shadow-amber-500/30',
    bgAtmosphere: 'bg-amber-950/40',
    lore: '匯聚世界各國千年傳說、古老文明與文化寶藏的千燈古城。閱讀多國故事能點亮城牆上的九百九十九盞長明燈！',
    guardianQuote: '每一個民間故事，都是先人留給世界的燦爛智慧之光！',
    targetBooks: 2,
    bonusStars: 15,
    floatDelayClass: 'animate-map-float-reverse',
    mapCoords: { x: 30, y: 62 },
  },
  {
    id: 'wisdom-peak',
    name: '勇氣與心靈燈塔之巔',
    nameEn: 'Wisdom Peak & Beacon of Heart',
    categoryKeys: ['Moral & Wisdom', 'Friendship & Love', '心靈成長', '品格'],
    icon: '🏔️',
    element: '純白勇氣',
    guardianName: '破曉雪鷹 艾倫',
    guardianAvatar: '🦅',
    colorGradient: 'from-sky-600 via-blue-500 to-indigo-400',
    borderGlowColor: 'border-sky-400 shadow-sky-500/30',
    bgAtmosphere: 'bg-sky-950/40',
    lore: '傲立於雲端之上的心靈聖山，山巔設有永不熄滅的勇氣之燈。閱讀關於友誼、愛心與克服困難的故事能融化風雪，點亮七彩極光！',
    guardianQuote: '勇敢面對自己的不同，你就是夜空中最美麗的天鵝！',
    targetBooks: 2,
    bonusStars: 15,
    floatDelayClass: 'animate-map-float',
    mapCoords: { x: 75, y: 60 },
  },
  {
    id: 'ocean-trench',
    name: '蔚藍人魚深海秘境',
    nameEn: 'Azure Mermaid Coral Palace',
    categoryKeys: ['Ocean', '海洋', 'Adventure', '人魚'],
    icon: '🐬',
    element: '海藍波濤',
    guardianName: '海藍人魚公主 娜娜',
    guardianAvatar: '🧜‍♀️',
    colorGradient: 'from-blue-600 via-cyan-500 to-teal-400',
    borderGlowColor: 'border-cyan-400 shadow-cyan-500/30',
    bgAtmosphere: 'bg-cyan-950/40',
    lore: '深藏在大海萬米之下的七彩水晶珊瑚宮殿。隨著孩子大聲朗讀海之歌，海底的千年珍珠與夜光水母會同步閃爍起舞！',
    guardianQuote: '只要心中充滿愛與善意，連最深的大海都會為你開拓道路！',
    targetBooks: 1,
    bonusStars: 20,
    floatDelayClass: 'animate-map-float-slow',
    mapCoords: { x: 18, y: 88 },
  },
  {
    id: 'cosmic-station',
    name: '星際銀河探險前哨站',
    nameEn: 'Cosmic Starship Galactic Station',
    categoryKeys: ['Space', '宇宙', '星際', '科幻'],
    icon: '🚀',
    element: '星辰軌道',
    guardianName: '星際星光旅人 奧利',
    guardianAvatar: '🦊',
    colorGradient: 'from-purple-600 via-fuchsia-500 to-pink-400',
    borderGlowColor: 'border-purple-400 shadow-purple-500/30',
    bgAtmosphere: 'bg-purple-950/40',
    lore: '懸浮在銀河星雲核心的時空探險站。探索未知星系與浩瀚宇宙的繪本，可直接充能超空間躍遷水晶，點亮整片銀河星盤！',
    guardianQuote: '真正重要的東西用眼睛看不見，要用心去感受宇宙的奇妙！',
    targetBooks: 1,
    bonusStars: 20,
    floatDelayClass: 'animate-map-float-reverse',
    mapCoords: { x: 82, y: 88 },
  },
];

interface ReadingAdventureMapProps {
  profile: UserProfile;
  books: Book[];
  onSelectBook: (book: Book, startPage?: number) => void;
  onUpdateProfile: (updated: UserProfile) => void;
  onTriggerCelebration?: () => void;
  darkMode?: boolean;
}

export const ReadingAdventureMap: React.FC<ReadingAdventureMapProps> = ({
  profile,
  books,
  onSelectBook,
  onUpdateProfile,
  onTriggerCelebration,
  darkMode = false,
}) => {
  const [selectedRealm, setSelectedRealm] = useState<RealmData | null>(null);
  const [isFxActive, setIsFxActive] = useState<boolean>(true);
  const [claimedRealms, setClaimedRealms] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(`adventure_claimed_realms_${profile.name || 'user'}`);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Offline Detection & Caching State
  const [isDeviceOnline, setIsDeviceOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean'
      ? navigator.onLine
      : true;
  });
  const [simulatedOffline, setSimulatedOffline] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);
  const [cachedSnapshotTime, setCachedSnapshotTime] = useState<string>(() => {
    try {
      const stored = localStorage.getItem(`adventure_map_cache_time_${profile.name || 'user'}`);
      return stored || new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '剛剛';
    }
  });

  // Track online/offline browser events
  useEffect(() => {
    const handleOnline = () => {
      setIsDeviceOnline(true);
      setSyncFeedback('🟢 網路連線已恢復！已自動同步地圖最新閱讀進度。');
      playStarChime();
      setTimeout(() => setSyncFeedback(null), 5000);
    };

    const handleOffline = () => {
      setIsDeviceOnline(false);
      setSyncFeedback('⚡ 設備已進入離線狀態，冒險地圖已切換至本機已緩存進度。');
      setTimeout(() => setSyncFeedback(null), 5000);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Save/Update Offline Cache Snapshot whenever profile/claims change
  useEffect(() => {
    try {
      const nowStr = new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' });
      setCachedSnapshotTime(nowStr);
      localStorage.setItem(`adventure_map_cache_time_${profile.name || 'user'}`, nowStr);
      localStorage.setItem(
        `adventure_map_snapshot_${profile.name || 'user'}`,
        JSON.stringify({
          readBookIds: profile.readBookIds || [],
          stars: profile.stars || 0,
          claimedRealms,
          updatedAt: nowStr,
        })
      );
    } catch (e) {
      console.warn('Failed to cache map snapshot:', e);
    }
  }, [profile.readBookIds, profile.stars, claimedRealms, profile.name]);

  const isEffectivelyOffline = !isDeviceOnline || simulatedOffline;

  // Calculate read books matching each realm
  const getRealmStats = (realm: RealmData) => {
    const readBookIds = profile.readBookIds || [];
    
    // Books in catalog matching this realm's categories
    const matchingBooks = books.filter((b) => {
      return realm.categoryKeys.some((cat) => {
        return (
          b.category.toLowerCase().includes(cat.toLowerCase()) ||
          (b.title['zh-TW'] && b.title['zh-TW'].includes(cat)) ||
          (b.summary['zh-TW'] && b.summary['zh-TW'].includes(cat))
        );
      });
    });

    const readBooksInRealm = matchingBooks.filter((b) => readBookIds.includes(b.id));
    const count = readBooksInRealm.length;
    const progressPercent = Math.min(100, Math.round((count / realm.targetBooks) * 100));
    
    // Lighting tier: 0 = unlit (foggy), 1 = half lit (dawn), 2 = fully lit (radiant)
    let litTier: 'unlit' | 'dawn' | 'radiant' = 'unlit';
    if (count >= realm.targetBooks) {
      litTier = 'radiant';
    } else if (count > 0) {
      litTier = 'dawn';
    }

    return {
      matchingBooks,
      readBooksInRealm,
      count,
      progressPercent,
      litTier,
      isFullyLit: litTier === 'radiant',
      isClaimed: !!claimedRealms[realm.id],
    };
  };

  // Overall continent stats
  const realmStatsList = ADVENTURE_REALMS.map((r) => ({
    realm: r,
    ...getRealmStats(r),
  }));

  const totalLitRealms = realmStatsList.filter((s) => s.litTier !== 'unlit').length;
  const fullyMasteredRealms = realmStatsList.filter((s) => s.isFullyLit).length;
  const overallContinentProgress = Math.round(
    realmStatsList.reduce((acc, s) => acc + s.progressPercent, 0) / ADVENTURE_REALMS.length
  );

  const handleClaimRealmBonus = (realm: RealmData) => {
    if (claimedRealms[realm.id]) return;
    playStarChime();
    if (onTriggerCelebration) onTriggerCelebration();

    const updated = {
      ...claimedRealms,
      [realm.id]: true,
    };
    setClaimedRealms(updated);
    try {
      localStorage.setItem(`adventure_claimed_realms_${profile.name || 'user'}`, JSON.stringify(updated));
    } catch (e) {
      console.warn(e);
    }

    onUpdateProfile({
      ...profile,
      stars: (profile.stars || 0) + realm.bonusStars,
    });
  };

  const handleVoiceContinentTour = () => {
    const offlineNotice = isEffectivelyOffline ? '目前為離線存取模式，正呈現本機緩存的進度。' : '';
    const text = `歡迎來到童話閱讀冒險地圖！${offlineNotice}你目前已經成功探索並點亮了 ${totalLitRealms} 個奇幻板塊，全大陸總探索度達到百分之 ${overallContinentProgress}！點擊地圖上的各個神殿領域，可以查看守護者與專屬故事喔！`;
    speakText(text, 'zh-TW', 1.0, 'teacher');
  };

  const handleManualSync = () => {
    setIsSyncing(true);
    playStarChime();

    setTimeout(() => {
      setIsSyncing(false);
      const nowStr = new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' });
      setCachedSnapshotTime(nowStr);
      try {
        localStorage.setItem(`adventure_map_cache_time_${profile.name || 'user'}`, nowStr);
      } catch (e) {
        console.warn(e);
      }

      if (isEffectivelyOffline) {
        setSyncFeedback(`📦 已確認並刷新本地快取快照 (${nowStr})，目前離線環境中可完整檢視六大領域、守護者神諭與完讀記錄！`);
      } else {
        setSyncFeedback(`✨ 同步成功 (${nowStr})！已更新雲端與本地童話閱讀冒險地圖所有板塊進度。`);
      }

      setTimeout(() => {
        setSyncFeedback(null);
      }, 6000);
    }, 1000);
  };

  return (
    <div
      id="reading-adventure-map-container"
      className={`p-6 sm:p-8 rounded-3xl border transition-all ${
        darkMode
          ? 'bg-gradient-to-b from-slate-900 via-slate-900/90 to-indigo-950/80 border-indigo-900/80 text-slate-100 shadow-2xl'
          : 'bg-gradient-to-b from-amber-500/15 via-orange-400/10 to-amber-100/60 border-amber-300 text-amber-950 shadow-lg'
      }`}
    >
      {/* 📡 離線存取與同步狀態提示欄 (Offline Access Alert & Sync Banner) */}
      {isEffectivelyOffline && (
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-950/80 via-orange-950/80 to-amber-900/80 border-2 border-amber-400/80 text-amber-100 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-amber-500/30 border border-amber-400 text-amber-300 rounded-xl shrink-0 mt-0.5 animate-pulse">
              <CloudOff className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-black text-sm text-amber-300 flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-amber-400" />
                  <span>離線存取模式啟動 (Offline Access Mode)</span>
                </span>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/30 text-amber-200 border border-amber-400/40">
                  本機緩存快照：{cachedSnapshotTime}
                </span>
              </div>
              <p className="text-xs text-amber-200/90 leading-relaxed">
                偵測到目前設備未連線或處於離線狀態，冒險地圖正顯示<strong>已緩存的進度資訊</strong>（已讀繪本、守護獸神諭與點亮板塊）。連線後建議同步以更新最新全服地圖數據！
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
            <button
              type="button"
              onClick={handleManualSync}
              disabled={isSyncing}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-slate-950 font-black text-xs shadow-md transition-transform hover:scale-105 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? '同步中...' : '檢查連線並同步'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Sync feedback toast banner */}
      {syncFeedback && (
        <div className="mb-4 p-3 rounded-2xl bg-emerald-950/80 border border-emerald-400 text-emerald-200 text-xs font-black flex items-center justify-between gap-2 animate-fadeIn">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{syncFeedback}</span>
          </div>
          <button
            type="button"
            onClick={() => setSyncFeedback(null)}
            className="p-1 hover:bg-emerald-900 rounded-lg text-emerald-400"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-amber-200 dark:border-slate-700 pb-4 mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-yellow-500 text-white shadow-lg animate-bounce">
            <Compass className="w-7 h-7 text-amber-100" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-black text-xl sm:text-2xl text-slate-900 dark:text-slate-100">
                童話閱讀冒險地圖 (Adventure Map)
              </h2>
              <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white uppercase tracking-wider shadow-2xs">
                Interactive Realm
              </span>

              {/* Online/Offline status pill */}
              <div
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border ${
                  isEffectivelyOffline
                    ? 'bg-amber-950/60 border-amber-500/50 text-amber-300'
                    : 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                }`}
                title="點擊可切換離線/在線模擬以測試離線存取機制"
                onClick={() => setSimulatedOffline(!simulatedOffline)}
              >
                {isEffectivelyOffline ? (
                  <>
                    <WifiOff className="w-3 h-3 text-amber-400" />
                    <span>離線緩存中</span>
                  </>
                ) : (
                  <>
                    <Wifi className="w-3 h-3 text-emerald-400" />
                    <span>連線同步中</span>
                  </>
                )}
              </div>
            </div>
            <p className={`text-xs font-semibold mt-0.5 ${darkMode ? 'text-amber-200/80' : 'text-amber-900/80'}`}>
              閱讀不同類別繪本，點亮地圖上的六大奇幻秘境，喚醒專屬守護神獸！
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Continent progress badge */}
          <div className="flex items-center gap-2 bg-white/90 dark:bg-slate-800/90 px-3.5 py-2 rounded-2xl border border-amber-300 dark:border-slate-700 shadow-xs">
            <div className="text-right">
              <div className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400">
                已點亮秘境：{totalLitRealms} / {ADVENTURE_REALMS.length}
              </div>
              <div className="text-xs font-black text-amber-600 dark:text-amber-400">
                大陸探索度 {overallContinentProgress}%
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-300 flex items-center justify-center font-black text-xs border border-amber-300">
              {overallContinentProgress}%
            </div>
          </div>

          {/* Dynamic FX toggle */}
          <button
            type="button"
            onClick={() => setIsFxActive(!isFxActive)}
            className={`px-3 py-2 rounded-2xl text-xs font-black border transition-all flex items-center gap-1.5 ${
              isFxActive
                ? 'bg-amber-500 text-white border-amber-400 shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700'
            }`}
            title="開關奇幻星空動態特效"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isFxActive ? '動態特效: 啟動' : '靜態省電'}</span>
          </button>

          {/* Sync Button */}
          <button
            type="button"
            onClick={handleManualSync}
            disabled={isSyncing}
            className="p-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-amber-300 dark:border-slate-700 text-amber-600 dark:text-amber-300 hover:bg-amber-50 shadow-xs"
            title="手動同步地圖快照"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-orange-500' : ''}`} />
          </button>

          {/* Voice Tour */}
          <button
            type="button"
            onClick={handleVoiceContinentTour}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs shadow-md transition-transform hover:scale-105"
            title="聽語音導覽"
          >
            <Volume2 className="w-4 h-4" />
            <span>語音導覽</span>
          </button>
        </div>
      </div>

      {/* Progress Bar of Whole Continent */}
      <div className="mb-6 space-y-1.5 bg-white/80 dark:bg-slate-800/80 p-3.5 rounded-2xl border border-amber-200 dark:border-slate-700">
        <div className="flex justify-between items-center text-xs font-black text-amber-950 dark:text-amber-200">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>全圖冒險探索進度條</span>
          </span>
          <span className="text-amber-600 dark:text-amber-400 font-extrabold">
            已完美大師點亮 {fullyMasteredRealms} / {ADVENTURE_REALMS.length} 板塊
          </span>
        </div>
        <div className="w-full h-3 bg-amber-100 dark:bg-slate-700 rounded-full overflow-hidden p-0.5 border border-amber-200 dark:border-slate-600">
          <div
            className="h-full bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 rounded-full transition-all duration-700 relative"
            style={{ width: `${overallContinentProgress}%` }}
          >
            <div className="absolute top-0 right-0 bottom-0 w-2 bg-white/60 rounded-full animate-ping" />
          </div>
        </div>
      </div>

      {/* Visual Adventure Map Board (Fantasy Island Board with Dynamic Animations) */}
      <div className="relative rounded-3xl overflow-hidden border-2 border-amber-300 dark:border-indigo-900 shadow-2xl bg-gradient-to-b from-sky-950 via-indigo-950 to-slate-950 min-h-[460px] sm:min-h-[520px] p-4 sm:p-6 flex flex-col justify-between">
        
        {/* Dynamic Starry Celestial Sky Background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Ambient Map Grid & Constellation SVG */}
          <svg className="w-full h-full opacity-30" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="map-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(251, 191, 36, 0.4)" strokeWidth="0.7" />
                <circle cx="20" cy="20" r="1.5" fill="rgba(251, 191, 36, 0.5)" />
              </pattern>
              <linearGradient id="starlight-glow" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="50%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#f43f5e" />
              </linearGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#map-grid)" />
            
            {/* Pulsing Starlight Ley Lines Connecting the 6 Realms */}
            <path
              d="M 140 120 Q 320 60 520 100 T 780 140 Q 650 320 480 340 T 180 380 Z"
              fill="none"
              stroke="url(#starlight-glow)"
              strokeWidth="2.5"
              strokeDasharray="8 8"
              className={isFxActive ? 'animate-dash-flow opacity-80' : 'opacity-40'}
            />
            {/* Second Inner Celestial Ring */}
            <circle
              cx="50%"
              cy="50%"
              r="160"
              fill="none"
              stroke="rgba(251, 191, 36, 0.25)"
              strokeWidth="1.5"
              strokeDasharray="4 6"
              className={isFxActive ? 'animate-orbital-glow' : ''}
              style={{ transformOrigin: '50% 50%' }}
            />
          </svg>

          {/* Twinkling Golden Stars Cluster */}
          {isFxActive && (
            <>
              <div className="absolute top-10 left-[15%] text-amber-300 text-sm animate-star-twinkle">✨</div>
              <div className="absolute top-24 left-[45%] text-yellow-200 text-xs animate-star-twinkle" style={{ animationDelay: '1.2s' }}>⭐</div>
              <div className="absolute top-16 right-[20%] text-amber-300 text-sm animate-star-twinkle" style={{ animationDelay: '0.6s' }}>✨</div>
              <div className="absolute bottom-20 left-[35%] text-sky-200 text-xs animate-star-twinkle" style={{ animationDelay: '1.8s' }}>⭐</div>
              <div className="absolute bottom-28 right-[15%] text-pink-300 text-sm animate-star-twinkle" style={{ animationDelay: '0.9s' }}>✨</div>
              <div className="absolute top-[50%] left-[8%] text-yellow-300 text-xs animate-star-twinkle" style={{ animationDelay: '2.1s' }}>🌟</div>

              {/* Drifting Clouds (Multi-layer animations) */}
              <div className="absolute top-8 left-0 text-5xl opacity-25 animate-cloud-drift-1">☁️</div>
              <div className="absolute top-1/2 left-0 text-6xl opacity-20 animate-cloud-drift-2" style={{ animationDelay: '10s' }}>☁️</div>
              <div className="absolute bottom-12 left-0 text-4xl opacity-15 animate-cloud-drift-1" style={{ animationDelay: '18s' }}>☁️</div>

              {/* Shooting Star effect */}
              <div
                className="absolute top-12 right-12 w-24 h-0.5 bg-gradient-to-r from-transparent via-amber-300 to-white rounded-full pointer-events-none opacity-0"
                style={{
                  animation: 'shooting-star 7s ease-in-out infinite',
                  animationDelay: '3s',
                }}
              />
            </>
          )}
        </div>

        {/* Map Legend & Compass Rose */}
        <div className="relative z-10 flex items-center justify-between flex-wrap gap-2 text-xs text-amber-200/90 font-bold">
          <div className="flex items-center gap-3 bg-black/50 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-amber-400/30 shadow-md">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-emerald-400 shadow-xs" />
              <span>璀璨點亮</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span>晨曦探索中</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
              <span>雲霧未啟</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isEffectivelyOffline && (
              <span className="text-[11px] font-black bg-amber-950/70 text-amber-300 px-3 py-1.5 rounded-2xl border border-amber-500/50 backdrop-blur-md flex items-center gap-1">
                <Database className="w-3.5 h-3.5 text-amber-400" />
                <span>已緩存資料就緒</span>
              </span>
            )}
            <div className="text-[11px] font-black bg-amber-500/20 text-amber-300 px-3 py-1.5 rounded-2xl border border-amber-400/30 backdrop-blur-md flex items-center gap-1.5">
              <span>🗺️ 點擊任意秘境，查看解鎖故事與守護獸</span>
            </div>
          </div>
        </div>

        {/* Realm Nodes Grid with Floating Animation */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 my-6">
          {realmStatsList.map(({ realm, count, progressPercent, litTier, isFullyLit, isClaimed }, index) => {
            const isRadiant = litTier === 'radiant';
            const isDawn = litTier === 'dawn';
            const isUnlit = litTier === 'unlit';

            // Dynamic float animation classes
            const floatClass = isFxActive ? realm.floatDelayClass : '';

            return (
              <div
                key={realm.id}
                onClick={() => {
                  playStarChime();
                  setSelectedRealm(realm);
                }}
                className={`p-4 rounded-3xl border-2 transition-all duration-500 cursor-pointer relative group ${floatClass} ${
                  isRadiant
                    ? `bg-gradient-to-br ${realm.colorGradient} bg-opacity-35 border-amber-300 shadow-xl hover:shadow-2xl hover:shadow-amber-400/50 text-white animate-radiant-pulse`
                    : isDawn
                    ? 'bg-slate-800/90 border-amber-400/80 shadow-md text-amber-100 hover:border-amber-300'
                    : 'bg-slate-900/85 border-slate-700/80 opacity-75 hover:opacity-100 hover:border-slate-500 text-slate-300'
                }`}
                style={{ animationDelay: `${index * 0.7}s` }}
              >
                {/* Radiant Glow Badge & Stardust Particles */}
                {isRadiant && (
                  <span className="absolute -top-2.5 -right-2 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded-full shadow-lg flex items-center gap-1 animate-bounce z-20">
                    <Sparkles className="w-3 h-3 text-slate-950" />
                    <span>已全盛點亮</span>
                  </span>
                )}

                {/* Cloud overlay for unlit with mist effect */}
                {isUnlit && (
                  <span className="absolute top-2 right-2 text-slate-400 text-xs font-bold flex items-center gap-1 bg-black/50 px-2 py-0.5 rounded-full z-20 border border-slate-700">
                    <Lock className="w-3 h-3 text-slate-400" />
                    <span>雲霧籠罩</span>
                  </span>
                )}

                {/* Realm Header */}
                <div className="flex items-center gap-3 relative z-10">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-inner border transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 relative ${
                      isRadiant
                        ? 'bg-white/20 border-white/50 shadow-white/30'
                        : isDawn
                        ? 'bg-amber-500/20 border-amber-400/50'
                        : 'bg-slate-800 border-slate-700 grayscale'
                    }`}
                  >
                    {realm.icon}
                    {isRadiant && (
                      <div className="absolute -inset-1 rounded-2xl border border-yellow-300/60 animate-orbital-glow pointer-events-none" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 text-[10px] font-black text-amber-300 uppercase tracking-wide truncate">
                      <span>{realm.element}</span>
                      <span>•</span>
                      <span>{realm.guardianAvatar} {realm.guardianName}</span>
                    </div>
                    <h3 className="font-black text-sm sm:text-base leading-snug truncate">
                      {realm.name}
                    </h3>
                    <div className="text-[10px] opacity-80 truncate">{realm.nameEn}</div>
                  </div>
                </div>

                {/* Progress bar and counter */}
                <div className="mt-3 pt-3 border-t border-white/10 space-y-1.5 relative z-10">
                  <div className="flex justify-between items-center text-[11px] font-extrabold">
                    <span>完讀進度：{count} / {realm.targetBooks} 本</span>
                    <span className={isRadiant ? 'text-yellow-300' : 'text-amber-400'}>
                      {progressPercent}%
                    </span>
                  </div>

                  <div className="w-full h-2 bg-black/50 rounded-full overflow-hidden border border-white/10">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        isRadiant
                          ? 'bg-gradient-to-r from-yellow-300 via-amber-400 to-orange-400'
                          : isDawn
                          ? 'bg-amber-400'
                          : 'bg-slate-600'
                      }`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>

                  {/* Status Quote */}
                  <p className="text-[10px] font-medium opacity-85 line-clamp-1 italic pt-0.5">
                    "{realm.guardianQuote}"
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Map Footer Prompt & Cache Status */}
        <div className="relative z-10 bg-black/60 backdrop-blur-md p-3.5 rounded-2xl border border-amber-400/30 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-amber-200 shadow-lg">
          <div className="flex items-center gap-2">
            <span className="text-xl">🌟</span>
            <span className="font-bold">
              每成功全盛點亮一個秘境，即可領取 <strong>+15 ~ +20 顆童心星星 ⭐</strong> 並解鎖專屬守護獸神諭！
            </span>
          </div>

          <div className="flex items-center gap-2">
            {isEffectivelyOffline ? (
              <div className="text-[11px] font-extrabold text-amber-300 bg-amber-950/70 px-3 py-1 rounded-xl border border-amber-500/40 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5" />
                <span>離線安全存取中 (已緩存)</span>
              </div>
            ) : (
              <div className="text-[11px] font-extrabold text-amber-300 bg-amber-900/60 px-3 py-1 rounded-xl border border-amber-500/40">
                繼續閱讀故事，讓整個大陸璀璨發光吧！
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Interactive Realm Inspector Modal */}
      {selectedRealm && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          {(() => {
            const stats = getRealmStats(selectedRealm);
            const isRadiant = stats.isFullyLit;
            const isDawn = stats.litTier === 'dawn';

            return (
              <div className="bg-slate-900 text-slate-100 rounded-3xl p-6 sm:p-8 max-w-lg w-full border-2 border-amber-400 shadow-2xl space-y-5 relative max-h-[90vh] overflow-y-auto">
                <button
                  type="button"
                  onClick={() => setSelectedRealm(null)}
                  className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Big Realm Header with Animated Guardian Avatar */}
                <div className="text-center space-y-2">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-400 via-orange-500 to-yellow-600 text-5xl shadow-xl border-2 border-amber-300 animate-bounce relative">
                    {selectedRealm.icon}
                    <div className="absolute -inset-2 rounded-3xl border border-amber-400/40 animate-orbital-glow pointer-events-none" />
                  </div>

                  <div>
                    <div className="flex items-center justify-center gap-1.5 text-xs font-black text-amber-400">
                      <span>{selectedRealm.element}</span>
                      <span>•</span>
                      <span>守護者：{selectedRealm.guardianAvatar} {selectedRealm.guardianName}</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-white">
                      {selectedRealm.name}
                    </h3>
                    <p className="text-xs font-bold text-slate-400">
                      {selectedRealm.nameEn}
                    </p>
                  </div>
                </div>

                {/* Offline Badge inside modal if offline */}
                {isEffectivelyOffline && (
                  <div className="p-2.5 rounded-xl bg-amber-950/50 border border-amber-500/40 text-[11px] font-bold text-amber-200 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Database className="w-3.5 h-3.5 text-amber-400" />
                      <span>正在存取本地已緩存的秘境資訊</span>
                    </span>
                    <span className="text-[10px] opacity-75">離線模式</span>
                  </div>
                )}

                {/* Lore Box */}
                <div className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700 text-xs text-slate-300 leading-relaxed space-y-2">
                  <div className="flex items-center gap-1.5 text-amber-400 font-extrabold">
                    <Compass className="w-4 h-4" />
                    <span>秘境傳奇背景 (Realm Lore)：</span>
                  </div>
                  <p>{selectedRealm.lore}</p>
                  <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-200 font-bold italic">
                    💬 {selectedRealm.guardianAvatar} 守護者寄語：「{selectedRealm.guardianQuote}」
                  </div>
                </div>

                {/* Lighting Status & Target */}
                <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/40 space-y-2">
                  <div className="flex justify-between items-center text-xs font-black">
                    <span className="flex items-center gap-1.5 text-amber-300">
                      <Flame className="w-4 h-4 text-orange-400" />
                      <span>秘境點亮狀態</span>
                    </span>
                    <span className={isRadiant ? 'text-emerald-400' : 'text-amber-400'}>
                      {isRadiant ? '🌟 璀璨全盛光芒 (100%)' : isDawn ? '💡 晨曦微光 (進行中)' : '🌫️ 雲霧未啟'}
                    </span>
                  </div>

                  <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                    <div
                      className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-500"
                      style={{ width: `${stats.progressPercent}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[11px] text-slate-400 font-bold">
                    <span>已在此領域完讀：{stats.count} 本</span>
                    <span>目標門檻：{selectedRealm.targetBooks} 本</span>
                  </div>
                </div>

                {/* Claim Bonus Stars Section */}
                {isRadiant && (
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-teal-950/60 border border-emerald-500/50 flex items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="font-black text-xs text-emerald-300 flex items-center gap-1">
                        <Trophy className="w-4 h-4" />
                        <span>守護者探索大獎勵</span>
                      </div>
                      <div className="text-[11px] text-slate-300">
                        完美點亮此秘境，獲贈 +{selectedRealm.bonusStars} 顆星星！
                      </div>
                    </div>

                    {stats.isClaimed ? (
                      <span className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-black border border-emerald-500/40">
                        ✓ 已領取獎勵
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleClaimRealmBonus(selectedRealm)}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-slate-950 font-black text-xs shadow-md transition-transform hover:scale-105 animate-bounce cursor-pointer"
                      >
                        領取 +{selectedRealm.bonusStars}⭐
                      </button>
                    )}
                  </div>
                )}

                {/* Recommended / Matching Books in This Realm */}
                <div className="space-y-2">
                  <div className="text-xs font-black text-amber-300 flex items-center gap-1">
                    <span>📖 屬於此秘境的經典繪本推薦：</span>
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {stats.matchingBooks.map((b) => {
                      const isRead = profile.readBookIds?.includes(b.id);
                      return (
                        <div
                          key={b.id}
                          className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 transition-colors ${
                            isRead
                              ? 'bg-emerald-950/30 border-emerald-600/40'
                              : 'bg-slate-800 border-slate-700 hover:bg-slate-750'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <img
                              src={b.coverUrl}
                              alt={b.title['zh-TW']}
                              className="w-10 h-10 object-cover rounded-lg border border-slate-600"
                            />
                            <div className="min-w-0">
                              <div className="font-bold text-xs text-slate-100 truncate">
                                {b.title['zh-TW']}
                              </div>
                              <div className="text-[10px] text-slate-400">
                                {b.originCountry} {b.flag} • {b.category}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {isRead ? (
                              <span className="text-[10px] font-black text-emerald-400 bg-emerald-900/50 px-2 py-0.5 rounded-full border border-emerald-500/40">
                                ✓ 已讀完
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedRealm(null);
                                  onSelectBook(b, 1);
                                }}
                                className="px-3 py-1 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs flex items-center gap-1 shadow-xs cursor-pointer"
                              >
                                <Play className="w-3 h-3 fill-current" />
                                <span>開始讀</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Voice Intro & Close Buttons */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      const speech = `${selectedRealm.name}。${selectedRealm.lore}。守護者${selectedRealm.guardianName}說：${selectedRealm.guardianQuote}`;
                      speakText(speech, 'zh-TW', 1.0, 'fairy');
                    }}
                    className="flex-1 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-black text-xs flex items-center justify-center gap-1.5 border border-slate-700 shadow-sm cursor-pointer"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>聽守護者說故事</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedRealm(null)}
                    className="flex-1 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-md transition-colors cursor-pointer"
                  >
                    關閉並繼續探索
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};
