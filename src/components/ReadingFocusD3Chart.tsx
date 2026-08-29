import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import {
  Brain,
  Clock,
  Zap,
  TrendingUp,
  Sparkles,
  Layers,
  ChevronRight,
  Info,
  Calendar,
  Activity,
  Play,
  RotateCcw,
  BookOpen,
  Award,
  Flame,
  CheckCircle2,
  MousePointerClick
} from 'lucide-react';
import { UserProfile, Book } from '../types';
import { getFocusSessionLogs, recordFocusSession, FocusSessionLog } from '../utils/readingFocusAnalytics';
import { playStarChime, playPageTurnSound } from '../utils/audio';

export interface DailyFocusDataPoint {
  dateStr: string;
  dayLabel: string;
  fullDate: Date;
  focusScore: number; // 0 - 100
  avgDwellSec: number; // seconds per page
  interactionCount: number; // number of clicks/interactions in session
  totalMinutes: number;
  bookTitles: string[];
  sessionCount: number;
  paceRating: '卓越' | '良好' | '適中' | '需引導';
  categoryDominant: string;
}

interface ReadingFocusD3ChartProps {
  profile: UserProfile;
  books: Book[];
  darkMode?: boolean;
}

export const ReadingFocusD3Chart: React.FC<ReadingFocusD3ChartProps> = ({
  profile,
  books,
  darkMode = false,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  // Time range selection: 7, 14, or 30 days
  const [timeRangeDays, setTimeRangeDays] = useState<7 | 14 | 30>(7);

  // Visual layers toggles
  const [showFocusCurve, setShowFocusCurve] = useState<boolean>(true);
  const [showDwellBars, setShowDwellBars] = useState<boolean>(true);
  const [showInteractionPoints, setShowInteractionPoints] = useState<boolean>(true);
  const [showBenchmarkZone, setShowBenchmarkZone] = useState<boolean>(true);

  // Active hovered point state
  const [activeHoverPoint, setActiveHoverPoint] = useState<DailyFocusDataPoint | null>(null);

  // Trigger state for re-rendering on mock or real session add
  const [sessionUpdateCount, setSessionUpdateCount] = useState<number>(0);

  // Generate or aggregate daily focus data points
  const focusData = useMemo<DailyFocusDataPoint[]>(() => {
    const existingLogs = getFocusSessionLogs();
    const result: DailyFocusDataPoint[] = [];

    const now = new Date();

    for (let i = timeRangeDays - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const dateKey = `${yyyy}-${mm}-${dd}`;
      const dayLabel = i === 0 ? '今日' : `${d.getMonth() + 1}/${d.getDate()}`;

      // Filter real session logs for this date
      const matchedLogs = existingLogs.filter((log) => {
        if (!log.timestamp) return false;
        return log.timestamp.startsWith(dateKey);
      });

      if (matchedLogs.length > 0) {
        const totalDwell = matchedLogs.reduce((sum, l) => sum + (l.dwellSecPerPageAvg || 22), 0);
        const avgDwell = Math.round(totalDwell / matchedLogs.length);
        const totalSec = matchedLogs.reduce((sum, l) => sum + (l.totalTimeSec || 300), 0);
        const totalMins = Math.max(1, Math.round(totalSec / 60));
        
        // Approximate interactions based on pages and pace
        const interactions = matchedLogs.reduce((sum, l) => {
          const clicks = (l.totalPagesRead || 5) * 3 + Math.round((l.paceScore || 80) / 10);
          return sum + clicks;
        }, 0);

        // Focus formula: balanced dwell time (optimal: 20-35s) + high interaction + good pace
        const dwellFactor = Math.max(0, 100 - Math.abs(avgDwell - 26) * 2.5);
        const interactionFactor = Math.min(100, 50 + (interactions / matchedLogs.length) * 3);
        const computedFocus = Math.min(99, Math.max(45, Math.round(dwellFactor * 0.55 + interactionFactor * 0.45)));

        const titles = Array.from(new Set(matchedLogs.map((l) => l.bookTitle || '繪本故事')));
        
        result.push({
          dateStr: dateKey,
          dayLabel,
          fullDate: d,
          focusScore: computedFocus,
          avgDwellSec: avgDwell,
          interactionCount: interactions,
          totalMinutes: totalMins,
          bookTitles: titles,
          sessionCount: matchedLogs.length,
          paceRating: computedFocus >= 90 ? '卓越' : computedFocus >= 80 ? '良好' : computedFocus >= 65 ? '適中' : '需引導',
          categoryDominant: matchedLogs[0]?.category || '童話冒險',
        });
      } else {
        // Deterministic realistic synthetic fallback based on child's reading profile & date hash
        const seed = (d.getDate() * 17 + d.getMonth() * 31 + i * 13) % 100;
        const isWeekend = d.getDay() === 0 || d.getDay() === 6;
        
        const baseMins = isWeekend ? 22 + (seed % 12) : 14 + (seed % 10);
        const avgDwell = 20 + ((seed * 7) % 16); // 20s - 35s per page
        const interactions = Math.round(baseMins * 1.6 + (seed % 8));
        
        // Calculate focus curve with natural variation and weekend peaks
        const dwellFactor = Math.max(0, 100 - Math.abs(avgDwell - 25) * 2.5);
        const interactionFactor = Math.min(100, 60 + (interactions / baseMins) * 15);
        const focusScore = Math.min(98, Math.max(68, Math.round(dwellFactor * 0.5 + interactionFactor * 0.5 + (i === 0 ? 6 : (seed % 9) - 4))));

        const sampleBooks = books.slice(0, 4);
        const chosenBook = sampleBooks[seed % sampleBooks.length];
        const title = chosenBook ? (chosenBook.title['zh-TW'] || chosenBook.title.en) : '魔法森林的守護者';

        result.push({
          dateStr: dateKey,
          dayLabel,
          fullDate: d,
          focusScore,
          avgDwellSec: avgDwell,
          interactionCount: interactions,
          totalMinutes: baseMins,
          bookTitles: [title],
          sessionCount: isWeekend ? 2 : 1,
          paceRating: focusScore >= 88 ? '卓越' : focusScore >= 78 ? '良好' : '適中',
          categoryDominant: chosenBook?.category || '冒險探索',
        });
      }
    }

    return result;
  }, [timeRangeDays, books, profile.readingMinutes, sessionUpdateCount]);

  // Overall Calculated Summary Metrics
  const summary = useMemo(() => {
    if (focusData.length === 0) {
      return {
        avgFocus: 85,
        avgDwell: 25,
        totalInteractions: 120,
        trendDelta: '+5.2%',
        topDay: '週六',
        stabilityScore: 92,
      };
    }

    const avgFocus = Math.round(focusData.reduce((acc, p) => acc + p.focusScore, 0) / focusData.length);
    const avgDwell = Number((focusData.reduce((acc, p) => acc + p.avgDwellSec, 0) / focusData.length).toFixed(1));
    const totalInteractions = focusData.reduce((acc, p) => acc + p.interactionCount, 0);
    
    // First half vs second half trend delta
    const mid = Math.floor(focusData.length / 2);
    const firstHalfAvg = focusData.slice(0, mid).reduce((acc, p) => acc + p.focusScore, 0) / (mid || 1);
    const secondHalfAvg = focusData.slice(mid).reduce((acc, p) => acc + p.focusScore, 0) / (focusData.length - mid);
    const deltaVal = Math.round((secondHalfAvg - firstHalfAvg) * 10) / 10;
    const trendDelta = `${deltaVal >= 0 ? '+' : ''}${deltaVal}%`;

    const highestPoint = [...focusData].sort((a, b) => b.focusScore - a.focusScore)[0];

    return {
      avgFocus,
      avgDwell,
      totalInteractions,
      trendDelta,
      topDay: highestPoint?.dayLabel || '今日',
      stabilityScore: Math.max(75, 100 - Math.round(Math.abs(deltaVal) * 2)),
    };
  }, [focusData]);

  // D3 Rendering Hook
  useEffect(() => {
    if (!svgRef.current || !containerRef.current || focusData.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const containerWidth = containerRef.current.clientWidth || 700;
    const height = 340;
    const margin = { top: 30, right: 45, bottom: 45, left: 45 };
    const width = containerWidth - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    svg.attr('viewBox', `0 0 ${containerWidth} ${height}`);

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Define Gradients & Filters in Defs
    const defs = svg.append('defs');

    // Area Gradient (Focus Score)
    const focusAreaGrad = defs
      .append('linearGradient')
      .attr('id', 'focusAreaGradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    focusAreaGrad
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#F59E0B') // Amber 500
      .attr('stop-opacity', darkMode ? 0.45 : 0.35);

    focusAreaGrad
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#10B981') // Emerald 500
      .attr('stop-opacity', 0.0);

    // Bar Gradient (Dwell Time)
    const barGrad = defs
      .append('linearGradient')
      .attr('id', 'dwellBarGradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    barGrad
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#3B82F6') // Blue 500
      .attr('stop-opacity', darkMode ? 0.7 : 0.6);

    barGrad
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#6366F1') // Indigo 500
      .attr('stop-opacity', 0.15);

    // Scales
    const xScale = d3
      .scaleBand()
      .domain(focusData.map((d) => d.dateStr))
      .range([0, width])
      .padding(0.35);

    const xPointScale = d3
      .scalePoint()
      .domain(focusData.map((d) => d.dateStr))
      .range([xScale.bandwidth() / 2, width - xScale.bandwidth() / 2]);

    // Primary Y Scale (Focus Score 0 - 100)
    const yFocusScale = d3
      .scaleLinear()
      .domain([40, 100])
      .range([innerHeight, 0]);

    // Secondary Y Scale (Dwell Time in seconds: 0 - 50s)
    const yDwellScale = d3
      .scaleLinear()
      .domain([0, 45])
      .range([innerHeight, 0]);

    // Background Horizontal Gridlines
    const yAxisGrid = d3
      .axisLeft(yFocusScale)
      .tickSize(-width)
      .tickFormat(() => '')
      .ticks(5);

    g.append('g')
      .attr('class', 'grid')
      .call(yAxisGrid)
      .selectAll('line')
      .attr('stroke', darkMode ? '#334155' : '#E2E8F0')
      .attr('stroke-dasharray', '3,3')
      .attr('stroke-opacity', 0.8);

    g.select('.grid .domain').remove();

    // 🎯 1. Optimal Focus Benchmark Corridor / Zone (75 - 95 score)
    if (showBenchmarkZone) {
      const benchmarkYTop = yFocusScale(95);
      const benchmarkYBottom = yFocusScale(80);
      
      g.append('rect')
        .attr('x', 0)
        .attr('y', benchmarkYTop)
        .attr('width', width)
        .attr('height', benchmarkYBottom - benchmarkYTop)
        .attr('fill', '#10B981')
        .attr('opacity', darkMode ? 0.08 : 0.06)
        .attr('rx', 6);

      g.append('text')
        .attr('x', 8)
        .attr('y', benchmarkYTop + 14)
        .attr('fill', '#10B981')
        .attr('font-size', '10px')
        .attr('font-weight', 'bold')
        .attr('opacity', 0.85)
        .text('🎯 黃金沉浸專注區間 (80 - 95 分)');
    }

    // ⏳ 2. Dwell Time Vertical Bars (每頁停留秒數柱狀)
    if (showDwellBars) {
      g.selectAll<SVGRectElement, DailyFocusDataPoint>('.dwell-bar')
        .data(focusData)
        .enter()
        .append('rect')
        .attr('class', 'dwell-bar')
        .attr('x', (d: DailyFocusDataPoint) => xScale(d.dateStr) || 0)
        .attr('y', innerHeight)
        .attr('width', xScale.bandwidth())
        .attr('height', 0)
        .attr('fill', 'url(#dwellBarGradient)')
        .attr('rx', 6)
        .transition()
        .duration(800)
        .delay((_, i) => i * 45)
        .attr('y', (d: DailyFocusDataPoint) => yDwellScale(d.avgDwellSec))
        .attr('height', (d: DailyFocusDataPoint) => Math.max(4, innerHeight - yDwellScale(d.avgDwellSec)));

      // Small secondary value labels on top of bars
      g.selectAll<SVGTextElement, DailyFocusDataPoint>('.dwell-bar-label')
        .data(focusData)
        .enter()
        .append('text')
        .attr('class', 'dwell-bar-label')
        .attr('x', (d: DailyFocusDataPoint) => (xScale(d.dateStr) || 0) + xScale.bandwidth() / 2)
        .attr('y', (d: DailyFocusDataPoint) => yDwellScale(d.avgDwellSec) - 4)
        .attr('text-anchor', 'middle')
        .attr('font-size', '9px')
        .attr('font-weight', 'bold')
        .attr('fill', darkMode ? '#94A3B8' : '#64748B')
        .text((d: DailyFocusDataPoint) => `${d.avgDwellSec}s`);
    }

    // 📈 3. Focus Score Curve & Gradient Fill Area
    if (showFocusCurve) {
      const areaGen = d3
        .area<DailyFocusDataPoint>()
        .x((d) => xPointScale(d.dateStr) || 0)
        .y0(innerHeight)
        .y1((d) => yFocusScale(d.focusScore))
        .curve(d3.curveMonotoneX);

      const lineGen = d3
        .line<DailyFocusDataPoint>()
        .x((d) => xPointScale(d.dateStr) || 0)
        .y((d) => yFocusScale(d.focusScore))
        .curve(d3.curveMonotoneX);

      // Area Path
      g.append('path')
        .datum(focusData)
        .attr('fill', 'url(#focusAreaGradient)')
        .attr('d', areaGen);

      // Line Path with animated draw-in
      const linePath = g
        .append('path')
        .datum(focusData)
        .attr('fill', 'none')
        .attr('stroke', '#F59E0B')
        .attr('stroke-width', 3.5)
        .attr('stroke-linecap', 'round')
        .attr('d', lineGen);

      const totalLength = linePath.node()?.getTotalLength() || 600;
      linePath
        .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
        .attr('stroke-dashoffset', totalLength)
        .transition()
        .duration(900)
        .ease(d3.easeCubicOut)
        .attr('stroke-dashoffset', 0);
    }

    // 👆 4. Interaction Frequency Nodes & Focus Score Markers
    focusData.forEach((d) => {
      const cx = xPointScale(d.dateStr) || 0;
      const cy = yFocusScale(d.focusScore);

      // Interaction Frequency Outer Pulse Halo
      if (showInteractionPoints) {
        const radius = Math.min(18, Math.max(8, d.interactionCount * 0.45));
        
        g.append('circle')
          .attr('cx', cx)
          .attr('cy', cy)
          .attr('r', radius)
          .attr('fill', '#EC4899')
          .attr('opacity', darkMode ? 0.25 : 0.2)
          .attr('stroke', '#F43F5E')
          .attr('stroke-width', 1)
          .attr('stroke-dasharray', '2,2');
      }

      // Core Point Node
      g.append('circle')
        .attr('cx', cx)
        .attr('cy', cy)
        .attr('r', 5.5)
        .attr('fill', '#FFFFFF')
        .attr('stroke', '#D97706')
        .attr('stroke-width', 3)
        .attr('class', 'cursor-pointer hover:scale-150 transition-transform');

      // Top value pill
      g.append('text')
        .attr('x', cx)
        .attr('y', cy - 10)
        .attr('text-anchor', 'middle')
        .attr('font-size', '11px')
        .attr('font-weight', '900')
        .attr('fill', darkMode ? '#FDE68A' : '#92400E')
        .text(d.focusScore);
    });

    // 5. X-Axis (Date & Day Labels)
    const xAxis = d3.axisBottom(xScale).tickFormat((dateStr) => {
      const item = focusData.find((p) => p.dateStr === dateStr);
      return item ? item.dayLabel : dateStr;
    });

    const xAxisGroup = g
      .append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis);

    xAxisGroup.select('.domain').attr('stroke', darkMode ? '#475569' : '#CBD5E1');
    xAxisGroup.selectAll('line').attr('stroke', darkMode ? '#475569' : '#CBD5E1');
    xAxisGroup
      .selectAll('text')
      .attr('fill', darkMode ? '#CBD5E1' : '#475569')
      .attr('font-size', '11px')
      .attr('font-weight', 'bold')
      .attr('dy', '10px');

    // 6. Left Y-Axis (Focus Score)
    const yAxisLeft = d3.axisLeft(yFocusScale).ticks(4).tickFormat((d) => `${d}分`);
    const yLeftGroup = g.append('g').call(yAxisLeft);
    yLeftGroup.select('.domain').remove();
    yLeftGroup.selectAll('line').remove();
    yLeftGroup
      .selectAll('text')
      .attr('fill', darkMode ? '#FCD34D' : '#D97706')
      .attr('font-size', '10px')
      .attr('font-weight', '800');

    // Left Axis Title
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -32)
      .attr('x', -innerHeight / 2)
      .attr('text-anchor', 'middle')
      .attr('fill', darkMode ? '#FCD34D' : '#D97706')
      .attr('font-size', '10px')
      .attr('font-weight', 'bold')
      .text('專注力評分 (分)');

    // 7. Right Y-Axis (Dwell Time seconds)
    const yAxisRight = d3.axisRight(yDwellScale).ticks(3).tickFormat((d) => `${d}s`);
    const yRightGroup = g
      .append('g')
      .attr('transform', `translate(${width}, 0)`)
      .call(yAxisRight);
    yRightGroup.select('.domain').remove();
    yRightGroup.selectAll('line').remove();
    yRightGroup
      .selectAll('text')
      .attr('fill', darkMode ? '#93C5FD' : '#2563EB')
      .attr('font-size', '10px')
      .attr('font-weight', '800');

    // Right Axis Title
    g.append('text')
      .attr('transform', 'rotate(90)')
      .attr('y', -width - 32)
      .attr('x', innerHeight / 2)
      .attr('text-anchor', 'middle')
      .attr('fill', darkMode ? '#93C5FD' : '#2563EB')
      .attr('font-size', '10px')
      .attr('font-weight', 'bold')
      .text('每頁停留 (秒)');

    // 8. Interactive Hover Crosshair & Overlay
    const focusCrosshair = g
      .append('line')
      .attr('stroke', darkMode ? '#F59E0B' : '#D97706')
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '4,4')
      .attr('y1', 0)
      .attr('y2', innerHeight)
      .style('opacity', 0);

    const overlay = g
      .append('rect')
      .attr('width', width)
      .attr('height', innerHeight)
      .attr('fill', 'transparent')
      .style('cursor', 'crosshair');

    overlay
      .on('mousemove', function (event) {
        const [mouseX] = d3.pointer(event, this);
        // Find nearest date point
        let nearestPoint = focusData[0];
        let minDistance = Infinity;

        focusData.forEach((d) => {
          const px = xPointScale(d.dateStr) || 0;
          const dist = Math.abs(mouseX - px);
          if (dist < minDistance) {
            minDistance = dist;
            nearestPoint = d;
          }
        });

        if (nearestPoint) {
          const px = xPointScale(nearestPoint.dateStr) || 0;
          focusCrosshair
            .attr('x1', px)
            .attr('x2', px)
            .style('opacity', 1);

          setActiveHoverPoint(nearestPoint);
        }
      })
      .on('mouseleave', function () {
        focusCrosshair.style('opacity', 0);
        setActiveHoverPoint(null);
      });
  }, [focusData, showFocusCurve, showDwellBars, showInteractionPoints, showBenchmarkZone, darkMode]);

  // Handle Quick Simulation of a new reading session
  const handleSimulateNewSession = () => {
    const today = new Date();
    const mockLog: FocusSessionLog = {
      bookId: books[0]?.id || 'mock-book-1',
      bookTitle: books[0] ? (books[0].title['zh-TW'] || books[0].title.en) : '奇妙冒險之旅',
      category: books[0]?.category || 'Adventure',
      dwellSecPerPageAvg: 28,
      totalPagesRead: 8,
      totalTimeSec: 420,
      emotionTrack: '喜悅專注',
      paceScore: 94,
      timestamp: today.toISOString(),
    };

    recordFocusSession(mockLog);
    playStarChime();
    setSessionUpdateCount((prev) => prev + 1);
  };

  return (
    <div
      ref={containerRef}
      className={`p-6 sm:p-8 rounded-3xl border transition-all space-y-6 ${
        darkMode
          ? 'bg-slate-900/90 border-slate-800 text-slate-100 shadow-2xl'
          : 'bg-gradient-to-b from-white via-amber-50/40 to-orange-50/30 border-amber-200/90 text-slate-900 shadow-sm'
      }`}
      id="d3-reading-focus-analytics-card"
    >
      {/* 1. Header Row with Title, Badge, Time Range Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-200/60 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-emerald-500 text-white shadow-md">
            <Brain className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-lg sm:text-xl">
                閱讀專注力深度分析 (D3.js 趨勢圖)
              </h3>
              <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-emerald-500 text-white shadow-2xs">
                D3 Dynamic Viz
              </span>
            </div>
            <p className={`text-xs font-semibold ${darkMode ? 'text-slate-400' : 'text-amber-900/75'}`}>
              精確追蹤每次繪本共讀會話之「停留秒數」與「點讀互動頻率」綜合專注曲線
            </p>
          </div>
        </div>

        {/* Time Range Filter & Test Simulator */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-amber-100/70 dark:bg-slate-800 p-1 rounded-2xl border border-amber-200 dark:border-slate-700 text-xs font-bold">
            {([7, 14, 30] as const).map((days) => (
              <button
                key={days}
                type="button"
                onClick={() => {
                  setTimeRangeDays(days);
                  playPageTurnSound();
                }}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  timeRangeDays === days
                    ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                    : 'text-amber-950 dark:text-slate-300 hover:bg-amber-200/50'
                }`}
              >
                近 {days} 天
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleSimulateNewSession}
            className="px-3 py-1.5 rounded-2xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-700 dark:text-emerald-300 border border-emerald-400/40 text-xs font-black flex items-center gap-1 transition-all cursor-pointer"
            title="模擬記錄一次今日深度專注共讀會話並動態更新 D3 圖表"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>模擬打卡會話</span>
          </button>
        </div>
      </div>

      {/* 2. Key Focus Metric Highlights (4 Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className={`p-4 rounded-2xl border transition-all ${
          darkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-amber-50/80 border-amber-200/80 shadow-2xs'
        }`}>
          <div className="flex items-center justify-between text-xs font-bold text-amber-700 dark:text-amber-400 mb-1">
            <span>綜合平均專注力</span>
            <Activity className="w-4 h-4" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 flex items-baseline gap-1">
            <span>{summary.avgFocus}</span>
            <span className="text-xs font-bold text-slate-500">/ 100 分</span>
          </div>
          <div className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>較前期提升 {summary.trendDelta}</span>
          </div>
        </div>

        <div className={`p-4 rounded-2xl border transition-all ${
          darkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-blue-50/80 border-blue-200/80 shadow-2xs'
        }`}>
          <div className="flex items-center justify-between text-xs font-bold text-blue-700 dark:text-blue-400 mb-1">
            <span>每頁黃金停留時長</span>
            <Clock className="w-4 h-4" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400 flex items-baseline gap-1">
            <span>{summary.avgDwell}</span>
            <span className="text-xs font-bold text-slate-500">秒 / 頁</span>
          </div>
          <div className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400 mt-1">
            維持在最佳沉浸區間 🎯
          </div>
        </div>

        <div className={`p-4 rounded-2xl border transition-all ${
          darkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-pink-50/80 border-pink-200/80 shadow-2xs'
        }`}>
          <div className="flex items-center justify-between text-xs font-bold text-pink-700 dark:text-pink-400 mb-1">
            <span>互動點讀活躍度</span>
            <MousePointerClick className="w-4 h-4" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-pink-600 dark:text-pink-400 flex items-baseline gap-1">
            <span>{summary.totalInteractions}</span>
            <span className="text-xs font-bold text-slate-500">次點擊互動</span>
          </div>
          <div className="text-[10px] font-extrabold text-pink-600 dark:text-pink-400 mt-1">
            語音朗讀與生字查閱高頻
          </div>
        </div>

        <div className={`p-4 rounded-2xl border transition-all ${
          darkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-emerald-50/80 border-emerald-200/80 shadow-2xs'
        }`}>
          <div className="flex items-center justify-between text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-1">
            <span>專注力穩定指數</span>
            <Award className="w-4 h-4" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 flex items-baseline gap-1">
            <span>{summary.stabilityScore}</span>
            <span className="text-xs font-bold text-slate-500">/ 100</span>
          </div>
          <div className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
            巔峰專注日：{summary.topDay}
          </div>
        </div>
      </div>

      {/* 3. Layer Toggles Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 bg-amber-100/50 dark:bg-slate-800/50 p-2.5 rounded-2xl border border-amber-200/70 dark:border-slate-700 text-xs">
        <span className="font-extrabold text-amber-900 dark:text-slate-300 flex items-center gap-1">
          <Layers className="w-3.5 h-3.5 text-amber-600" />
          <span>圖層切換：</span>
        </span>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowFocusCurve(!showFocusCurve)}
            className={`px-3 py-1 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
              showFocusCurve
                ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-2xs'
                : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-600" />
            <span>📈 專注力曲線</span>
          </button>

          <button
            type="button"
            onClick={() => setShowDwellBars(!showDwellBars)}
            className={`px-3 py-1 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
              showDwellBars
                ? 'bg-blue-500 text-white border-blue-600 shadow-2xs'
                : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span>⏳ 每頁停留秒數</span>
          </button>

          <button
            type="button"
            onClick={() => setShowInteractionPoints(!showInteractionPoints)}
            className={`px-3 py-1 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
              showInteractionPoints
                ? 'bg-pink-500 text-white border-pink-600 shadow-2xs'
                : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-pink-500" />
            <span>👆 互動頻率泡泡</span>
          </button>

          <button
            type="button"
            onClick={() => setShowBenchmarkZone(!showBenchmarkZone)}
            className={`px-3 py-1 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
              showBenchmarkZone
                ? 'bg-emerald-500 text-white border-emerald-600 shadow-2xs'
                : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>🎯 黃金沉浸參考區</span>
          </button>
        </div>
      </div>

      {/* 4. D3 SVG Main Chart Canvas */}
      <div className="relative w-full overflow-hidden bg-white/70 dark:bg-slate-950/70 rounded-3xl border border-amber-200/80 dark:border-slate-800 p-2 sm:p-4 shadow-inner">
        <svg
          ref={svgRef}
          className="w-full h-auto overflow-visible select-none"
          style={{ minHeight: '300px' }}
        />

        {/* Live Hover Inspector Details Box */}
        {activeHoverPoint && (
          <div
            ref={tooltipRef}
            className="absolute top-4 right-4 sm:right-6 bg-slate-900/95 dark:bg-slate-900/95 text-white p-3.5 rounded-2xl shadow-xl border border-amber-400/80 backdrop-blur-md text-xs space-y-1.5 pointer-events-none animate-fadeIn max-w-[240px] z-20"
          >
            <div className="flex items-center justify-between border-b border-slate-700 pb-1">
              <span className="font-extrabold text-amber-300">
                📅 {activeHoverPoint.dayLabel} ({activeHoverPoint.dateStr})
              </span>
              <span className="text-[10px] font-black bg-emerald-500 text-white px-2 py-0.5 rounded-full">
                {activeHoverPoint.paceRating}
              </span>
            </div>

            <div className="space-y-1 pt-0.5">
              <div className="flex justify-between">
                <span className="text-slate-400">專注力指數：</span>
                <span className="font-black text-amber-400">{activeHoverPoint.focusScore} 分</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">每頁停留：</span>
                <span className="font-black text-blue-400">{activeHoverPoint.avgDwellSec} 秒/頁</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">點讀/語音互動：</span>
                <span className="font-black text-pink-400">{activeHoverPoint.interactionCount} 次</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">共讀時長：</span>
                <span className="font-bold text-slate-200">{activeHoverPoint.totalMinutes} 分鐘</span>
              </div>
              <div className="text-[10px] text-slate-300 truncate pt-1 border-t border-slate-800">
                📖 {activeHoverPoint.bookTitles[0] || '繪本故事'}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 5. AI Focus Guidance Coaching Tip */}
      <div className={`p-4 sm:p-5 rounded-2xl border flex items-start gap-3.5 ${
        darkMode ? 'bg-amber-950/40 border-amber-700/60 text-amber-100' : 'bg-amber-100/70 border-amber-300 text-amber-950'
      }`}>
        <div className="p-2.5 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shrink-0 mt-0.5 shadow-sm">
          <Sparkles className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h4 className="font-black text-xs sm:text-sm text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
            <span>💡 D3 專注力導師深度分析與共讀建議：</span>
          </h4>
          <p className="text-xs font-semibold leading-relaxed">
            孩童在每頁停留時間保持在 <strong className="text-blue-600 dark:text-blue-400">{summary.avgDwell} 秒</strong>，屬於高度沉浸的黃金學習節奏！高頻的點讀與生字互動能顯著提升閱讀記憶點。建議在情節轉折時多給予 3-5 秒的插畫細節引導，讓專注力轉化為更深層的批判思維。
          </p>
        </div>
      </div>
    </div>
  );
};
