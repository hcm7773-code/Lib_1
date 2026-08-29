import React, { useState, useEffect } from 'react';
import {
  Brain, Compass, Sparkles, BookOpen, Layers, CheckCircle2, RefreshCw, X, MessageSquare, Volume2, HelpCircle, Award, Share2
} from 'lucide-react';
import { Book } from '../types';
import { playStarChime, speakText } from '../utils/audio';

interface MapNode {
  id: string;
  category: 'character' | 'plot' | 'moral' | 'reflection';
  title: string;
  icon: string;
  description: string;
  keyTakeaway: string;
}

interface ComprehensionMapData {
  bookTitle: string;
  coreTheme: string;
  nodes: MapNode[];
  discussionPrompts: string[];
}

interface ReadingComprehensionMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: Book;
  darkMode?: boolean;
}

export const ReadingComprehensionMapModal: React.FC<ReadingComprehensionMapModalProps> = ({
  isOpen,
  onClose,
  book,
  darkMode = false,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [mapData, setMapData] = useState<ComprehensionMapData | null>(null);
  const [selectedNode, setSelectedNode] = useState<MapNode | null>(null);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [submittedAnswers, setSubmittedAnswers] = useState<Record<number, string>>({});
  const [submittedFeedbackIndex, setSubmittedFeedbackIndex] = useState<number | null>(null);

  const bookTitleZh = book.title['zh-TW'] || book.title.en;
  const bookSummaryZh = book.summary['zh-TW'] || book.summary.en;

  const fetchComprehensionMap = async () => {
    setLoading(true);
    try {
      const fullText = book.pages.map((p) => p.text['zh-TW'] || p.text.en).join(' ');
      const res = await fetch('/api/gemini/reading-map', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookTitle: bookTitleZh,
          summary: bookSummaryZh,
          fullStoryText: fullText,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setMapData(data);
        if (data.nodes && data.nodes.length > 0) {
          setSelectedNode(data.nodes[0]);
        }
      } else {
        throw new Error('Failed to fetch AI map');
      }
    } catch (e) {
      console.warn('Map generation fallback used', e);
      setMapData({
        bookTitle: bookTitleZh,
        coreTheme: `《${bookTitleZh}》：探索愛與勇氣的魔法冒險，學會理解故事主線與角色情意。`,
        nodes: [
          {
            id: 'n-1',
            category: 'character',
            title: '🎭 角色特質與動機',
            icon: '🦊',
            description: '主角展現了勇敢、熱心與對世界無限的好奇心，並在困境中主動幫助夥伴。',
            keyTakeaway: '善良的待人態度能吸引許多好朋友陪伴。',
          },
          {
            id: 'n-2',
            category: 'plot',
            title: '🧭 起承轉合里程碑',
            icon: '🗺️',
            description: '從舒適的起點出發，歷經神秘的關卡考驗，最後靠著靈敏反應成功抵達終點。',
            keyTakeaway: '冷靜觀察與不放棄是解決問題的金鑰匙。',
          },
          {
            id: 'n-3',
            category: 'moral',
            title: '💡 核心寓意與啟示',
            icon: '🌟',
            description: '體會愛、團結與珍惜身邊親友的珍貴價值，激發對自然與知識的热愛。',
            keyTakeaway: '分享讓快樂加倍，陪伴讓難關變小。',
          },
          {
            id: 'n-4',
            category: 'reflection',
            title: '🦉 親子思考延伸地圖',
            icon: '💬',
            description: '如果這篇故事由你來寫續集，你覺得主角第二天會去哪裡探險呢？',
            keyTakeaway: '試著想像故事未來的各種可能吧！',
          },
        ],
        discussionPrompts: [
          '這本故事裡，你最崇拜哪一個角色的精神？為什麼？',
          '如果故事主角遇到你，你最想跟他說一句什麼話？',
          '你有沒有過像主角一樣克服害怕的經驗呢？跟爸爸媽媽分享看看！',
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && !mapData) {
      fetchComprehensionMap();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-fadeIn overflow-y-auto">
      <div className={`w-full max-w-4xl max-h-[92vh] overflow-y-auto p-5 sm:p-7 rounded-3xl border shadow-2xl space-y-6 relative ${
        darkMode
          ? 'bg-slate-900 border-amber-400/60 text-slate-100'
          : 'bg-white border-amber-300 text-amber-950'
      }`}>
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-amber-200/80 pb-4 flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-400 text-slate-950 shadow-md">
              <Brain className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-950 font-black text-[10px] border border-amber-400">
                  AI 閱讀理解雙語思維導圖
                </span>
                <span className="text-xs font-bold text-amber-600 dark:text-amber-300">
                  Interactive Mind Map
                </span>
              </div>
              <h3 className="text-xl font-black tracking-wide">
                《{bookTitleZh}》AI 閱讀理解地圖
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchComprehensionMap}
              disabled={loading}
              className="p-2 rounded-2xl bg-amber-100 dark:bg-slate-800 hover:bg-amber-200 text-amber-900 dark:text-amber-200 font-black text-xs flex items-center gap-1 cursor-pointer border border-amber-300"
              title="重新使用 AI 分析繪本結構"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">重新生成地圖</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-2xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center space-y-4 text-center">
            <div className="w-16 h-16 rounded-3xl bg-amber-400/20 border-2 border-amber-400 flex items-center justify-center text-3xl animate-bounce">
              🦉
            </div>
            <div className="space-y-1">
              <h4 className="font-black text-lg text-amber-500">貓頭鷹智慧助手正在梳理故事網絡...</h4>
              <p className="text-xs font-bold text-slate-400">正在分析角色關係、起承轉合與哲理思考</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Core Theme Banner */}
            {mapData?.coreTheme && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-yellow-500/10 border border-amber-400/40 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-black text-amber-600 dark:text-amber-300">
                  <Sparkles className="w-4 h-4" />
                  <span>故事核心主旨 (Core Narrative Essence)：</span>
                </div>
                <p className="text-sm font-bold leading-relaxed">
                  {mapData.coreTheme}
                </p>
              </div>
            )}

            {/* Mind Map Interactive Nodes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mapData?.nodes.map((node) => {
                const isSelected = selectedNode?.id === node.id;
                return (
                  <div
                    key={node.id}
                    onClick={() => {
                      setSelectedNode(node);
                      playStarChime();
                    }}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer space-y-2 ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500 shadow-lg scale-[1.02]'
                        : 'bg-slate-100/70 dark:bg-slate-800/60 border-amber-200/60 dark:border-slate-700 hover:border-amber-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{node.icon}</span>
                        <h4 className="font-black text-sm text-amber-950 dark:text-amber-200">
                          {node.title}
                        </h4>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          speakText(node.description, 'zh-TW');
                        }}
                        className="p-1.5 rounded-xl bg-amber-200 dark:bg-slate-700 text-amber-900 dark:text-amber-200 hover:scale-105"
                        title="朗讀節點說明"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300 leading-relaxed">
                      {node.description}
                    </p>

                    <div className="pt-1 flex items-center justify-between text-[11px] font-black text-amber-600 dark:text-amber-400">
                      <span>💡 成長金句：{node.keyTakeaway}</span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-amber-500" />}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Interactive Reflection Q&A Section */}
            <div className="p-5 rounded-2xl bg-amber-100/60 dark:bg-slate-800/80 border border-amber-300/80 space-y-4">
              <div className="flex items-center gap-2 text-sm font-black text-amber-950 dark:text-amber-200">
                <HelpCircle className="w-5 h-5 text-amber-600" />
                <span>親子共讀・思考啟發大問答 (Reflection Prompts)</span>
              </div>

              <div className="space-y-3">
                {mapData?.discussionPrompts.map((prompt, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-amber-200/80 space-y-2">
                    <div className="flex items-start gap-2 text-xs font-black">
                      <span className="px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 text-[10px] shrink-0">
                        問題 {idx + 1}
                      </span>
                      <p className="leading-relaxed text-slate-800 dark:text-slate-200">{prompt}</p>
                    </div>

                    {/* Answer Box */}
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        placeholder="把你的想法記下來或說給爸爸媽媽聽..."
                        value={submittedAnswers[idx] || ''}
                        onChange={(e) => {
                          setSubmittedAnswers({ ...submittedAnswers, [idx]: e.target.value });
                        }}
                        className="flex-1 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-slate-800 border border-amber-300 text-xs font-bold focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (submittedAnswers[idx]) {
                            playStarChime();
                            setSubmittedFeedbackIndex(idx);
                            setTimeout(() => setSubmittedFeedbackIndex(null), 3000);
                          }
                        }}
                        className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs cursor-pointer shadow-xs"
                      >
                        {submittedFeedbackIndex === idx ? '已打卡 🎉' : '提交打卡'}
                      </button>
                    </div>
                    {submittedFeedbackIndex === idx && (
                      <p className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 mt-1 animate-fadeIn">
                        ✨ 棒極了！思考就是最珍貴的童心養份！
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
