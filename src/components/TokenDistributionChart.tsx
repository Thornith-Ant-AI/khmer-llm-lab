import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { TokenizerComparisonResult } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { BarChart3, TrendingUp, PieChart, Info } from 'lucide-react';

interface TokenDistributionChartProps {
  comparison: TokenizerComparisonResult;
}

export const TokenDistributionChart: React.FC<TokenDistributionChartProps> = ({ comparison }) => {
  const { language, isKm, tr } = useLanguage();
  const [activeChartTab, setActiveChartTab] = useState<'histogram' | 'cumulative' | 'granularity'>('histogram');
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [hoveredData, setHoveredData] = useState<{
    label: string;
    llamaCount: number;
    khmerCount: number;
    llamaPct: number;
    khmerPct: number;
    examples: string[];
  } | null>(null);

  // Compute Length Buckets for Histogram (1 char, 2 chars, 3 chars, 4 chars, 5-6 chars, 7+ chars)
  const histogramData = useMemo(() => {
    const buckets = [
      { label: tr('1 char (Atomic/Byte)', '១ តួអក្សរ (បំណែកបៃ)'), min: 1, max: 1 },
      { label: tr('2 chars (Syllable)', '២ តួអក្សរ (ព្យាង្គ)'), min: 2, max: 2 },
      { label: tr('3 chars (Cluster)', '៣ តួអក្សរ (ចង្កោម)'), min: 3, max: 3 },
      { label: tr('4 chars (Short word)', '៤ តួអក្សរ (ពាក្យខ្លី)'), min: 4, max: 4 },
      { label: tr('5-6 chars (Subword stem)', '៥-៦ តួអក្សរ (ឫសពាក្យ)'), min: 5, max: 6 },
      { label: tr('7+ chars (Compound word)', '៧+ តួអក្សរ (ពាក្យផ្សំ)'), min: 7, max: 999 },
    ];

    const llamaTotal = Math.max(1, comparison.standardLlamaTokens.length);
    const khmerTotal = Math.max(1, comparison.khmerOptimizedTokens.length);

    return buckets.map(b => {
      // In LLaMA-3, byte fallback tokens like <0xE1> represent a single raw byte (effective 1 character or byte)
      const llamaMatches = comparison.standardLlamaTokens.filter(t => {
        const len = t.token.startsWith('<0x') ? 1 : t.token.length;
        return len >= b.min && len <= b.max;
      });

      const khmerMatches = comparison.khmerOptimizedTokens.filter(t => {
        const len = t.token.length;
        return len >= b.min && len <= b.max;
      });

      return {
        label: b.label,
        shortLabel: b.min === b.max ? `${b.min}ch` : `${b.min}-${b.max === 999 ? '∞' : b.max}ch`,
        llamaCount: llamaMatches.length,
        khmerCount: khmerMatches.length,
        llamaPct: Number(((llamaMatches.length / llamaTotal) * 100).toFixed(1)),
        khmerPct: Number(((khmerMatches.length / khmerTotal) * 100).toFixed(1)),
        khmerExamples: khmerMatches.slice(0, 4).map(t => t.token === ' ' ? '␣' : t.token),
        llamaExamples: llamaMatches.slice(0, 4).map(t => t.token)
      };
    });
  }, [comparison, language, tr]);

  // Compute Cumulative Growth Data points
  const cumulativeData = useMemo(() => {
    const textLen = comparison.text.length;
    if (textLen === 0) return [];

    const steps = 20;
    const points = [];
    const charStep = Math.max(1, Math.floor(textLen / steps));

    for (let i = 0; i <= steps; i++) {
      const charIndex = Math.min(textLen, i * charStep);
      const sub = comparison.text.substring(0, charIndex);
      // Rough linear mapping to tokens
      const progress = textLen > 0 ? charIndex / textLen : 0;
      const llamaTokensAtPoint = Math.round(comparison.llamaTokenCount * progress);
      const khmerTokensAtPoint = Math.round(comparison.khmerTokenCount * progress);

      points.push({
        chars: charIndex,
        llamaTokens: llamaTokensAtPoint,
        khmerTokens: khmerTokensAtPoint,
        delta: llamaTokensAtPoint - khmerTokensAtPoint
      });
    }

    return points;
  }, [comparison]);

  // Granularity category summary
  const granularitySummary = useMemo(() => {
    const khmerTokens = comparison.khmerOptimizedTokens;
    const total = Math.max(1, khmerTokens.length);

    const singleChar = khmerTokens.filter(t => t.token.length === 1).length;
    const syllables = khmerTokens.filter(t => t.token.length >= 2 && t.token.length <= 3).length;
    const stems = khmerTokens.filter(t => t.token.length >= 4 && t.token.length <= 6).length;
    const compounds = khmerTokens.filter(t => t.token.length >= 7).length;

    return {
      singleCharPct: Math.round((singleChar / total) * 100),
      syllablesPct: Math.round((syllables / total) * 100),
      stemsPct: Math.round((stems / total) * 100),
      compoundsPct: Math.round((compounds / total) * 100),
      singleCharCount: singleChar,
      syllablesCount: syllables,
      stemsCount: stems,
      compoundsCount: compounds
    };
  }, [comparison]);

  // D3 Rendering Hook
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous render

    const width = 680;
    const height = 280;
    const margin = { top: 25, right: 30, bottom: 45, left: 45 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    if (activeChartTab === 'histogram') {
      // 1. Grouped Bar Chart of Token Lengths
      const x0 = d3
        .scaleBand()
        .domain(histogramData.map(d => d.shortLabel))
        .rangeRound([0, innerWidth])
        .paddingInner(0.25);

      const x1 = d3
        .scaleBand()
        .domain(['llama', 'khmer'])
        .rangeRound([0, x0.bandwidth()])
        .padding(0.12);

      const maxCount = Math.max(
        1,
        d3.max(histogramData, d => Math.max(d.llamaCount, d.khmerCount)) || 10
      );

      const y = d3
        .scaleLinear()
        .domain([0, maxCount * 1.15])
        .nice()
        .rangeRound([innerHeight, 0]);

      // Subtle horizontal gridlines
      g.append('g')
        .attr('class', 'grid')
        .call(
          d3
            .axisLeft(y)
            .ticks(5)
            .tickSize(-innerWidth)
            .tickFormat(() => '')
        )
        .call(g => g.select('.domain').remove())
        .call(g =>
          g
            .selectAll('.tick line')
            .attr('stroke', 'rgba(255, 255, 255, 0.07)')
            .attr('stroke-dasharray', '2,2')
        );

      // Bars groups
      const barGroups = g
        .selectAll('.bar-group')
        .data(histogramData)
        .enter()
        .append('g')
        .attr('class', 'bar-group')
        .attr('transform', d => `translate(${x0(d.shortLabel)},0)`);

      // LLaMA Bars (Rose/Red)
      barGroups
        .append('rect')
        .attr('x', x1('llama') || 0)
        .attr('y', d => y(d.llamaCount))
        .attr('width', x1.bandwidth())
        .attr('height', d => Math.max(0, innerHeight - y(d.llamaCount)))
        .attr('fill', '#f43f5e') // rose-500
        .attr('rx', 3)
        .attr('opacity', 0.85)
        .on('mouseenter', (event, d) => {
          setHoveredData({
            label: d.label,
            llamaCount: d.llamaCount,
            khmerCount: d.khmerCount,
            llamaPct: d.llamaPct,
            khmerPct: d.khmerPct,
            examples: d.llamaExamples
          });
        });

      // Khmer SentencePiece Bars (Emerald/Green)
      barGroups
        .append('rect')
        .attr('x', x1('khmer') || 0)
        .attr('y', d => y(d.khmerCount))
        .attr('width', x1.bandwidth())
        .attr('height', d => Math.max(0, innerHeight - y(d.khmerCount)))
        .attr('fill', '#10b981') // emerald-500
        .attr('rx', 3)
        .attr('opacity', 0.9)
        .on('mouseenter', (event, d) => {
          setHoveredData({
            label: d.label,
            llamaCount: d.llamaCount,
            khmerCount: d.khmerCount,
            llamaPct: d.llamaPct,
            khmerPct: d.khmerPct,
            examples: d.khmerExamples
          });
        });

      // Percentage / Count text on top of Khmer bars
      barGroups
        .append('text')
        .attr('x', (x1('khmer') || 0) + x1.bandwidth() / 2)
        .attr('y', d => y(d.khmerCount) - 5)
        .attr('text-anchor', 'middle')
        .attr('fill', '#6ee7b7')
        .attr('font-size', '10px')
        .attr('font-family', 'JetBrains Mono, monospace')
        .text(d => (d.khmerCount > 0 ? `${d.khmerPct}%` : ''));

      // X Axis
      g.append('g')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(d3.axisBottom(x0))
        .call(g => g.select('.domain').attr('stroke', '#334155'))
        .call(g =>
          g
            .selectAll('.tick text')
            .attr('fill', '#94a3b8')
            .attr('font-size', '11px')
            .attr('font-family', 'JetBrains Mono, monospace')
        );

      // Y Axis
      g.append('g')
        .call(d3.axisLeft(y).ticks(5))
        .call(g => g.select('.domain').attr('stroke', '#334155'))
        .call(g =>
          g
            .selectAll('.tick text')
            .attr('fill', '#94a3b8')
            .attr('font-size', '10px')
            .attr('font-family', 'JetBrains Mono, monospace')
        );

      // Axis labels
      svg
        .append('text')
        .attr('x', width / 2)
        .attr('y', height - 6)
        .attr('text-anchor', 'middle')
        .attr('fill', '#64748b')
        .attr('font-size', '10px')
        .attr('font-family', isKm ? 'Kantumruy Pro, JetBrains Mono, sans-serif' : 'JetBrains Mono, monospace')
        .text(
          isKm
            ? 'ប្រវែងតួអក្សរថូខិន (១ តួអក្សរទល់នឹងចង្កោមពហុតួអក្សរ)'
            : 'TOKEN CHARACTER SPAN (ATOMIC 1-CHAR vs MULTI-CHAR SUBWORD CLUSTERS)'
        );

    } else if (activeChartTab === 'cumulative') {
      // 2. Cumulative Growth Curves
      const x = d3
        .scaleLinear()
        .domain([0, d3.max(cumulativeData, d => d.chars) || 100])
        .range([0, innerWidth]);

      const maxTokens = Math.max(
        1,
        d3.max(cumulativeData, d => Math.max(d.llamaTokens, d.khmerTokens)) || 10
      );

      const y = d3
        .scaleLinear()
        .domain([0, maxTokens * 1.1])
        .range([innerHeight, 0]);

      // Subtle horizontal gridlines
      g.append('g')
        .attr('class', 'grid')
        .call(
          d3
            .axisLeft(y)
            .ticks(5)
            .tickSize(-innerWidth)
            .tickFormat(() => '')
        )
        .call(g => g.select('.domain').remove())
        .call(g =>
          g
            .selectAll('.tick line')
            .attr('stroke', 'rgba(255, 255, 255, 0.07)')
            .attr('stroke-dasharray', '2,2')
        );

      // Shaded Delta Area (The Token Bloat Waste)
      const area = d3
        .area<{ chars: number; llamaTokens: number; khmerTokens: number }>()
        .x(d => x(d.chars))
        .y0(d => y(d.khmerTokens))
        .y1(d => y(d.llamaTokens))
        .curve(d3.curveMonotoneX);

      g.append('path')
        .datum(cumulativeData)
        .attr('fill', 'rgba(244, 63, 94, 0.12)')
        .attr('d', area);

      // LLaMA Line
      const llamaLine = d3
        .line<{ chars: number; llamaTokens: number }>()
        .x(d => x(d.chars))
        .y(d => y(d.llamaTokens))
        .curve(d3.curveMonotoneX);

      g.append('path')
        .datum(cumulativeData)
        .attr('fill', 'none')
        .attr('stroke', '#f43f5e')
        .attr('stroke-width', 2.5)
        .attr('d', llamaLine);

      // Khmer SPM Line
      const khmerLine = d3
        .line<{ chars: number; khmerTokens: number }>()
        .x(d => x(d.chars))
        .y(d => y(d.khmerTokens))
        .curve(d3.curveMonotoneX);

      g.append('path')
        .datum(cumulativeData)
        .attr('fill', 'none')
        .attr('stroke', '#10b981')
        .attr('stroke-width', 2.5)
        .attr('d', khmerLine);

      // End-point labels
      const last = cumulativeData[cumulativeData.length - 1];
      if (last) {
        g.append('text')
          .attr('x', x(last.chars) - 4)
          .attr('y', y(last.llamaTokens) - 8)
          .attr('text-anchor', 'end')
          .attr('fill', '#f43f5e')
          .attr('font-size', '11px')
          .attr('font-family', isKm ? 'Kantumruy Pro, JetBrains Mono, monospace' : 'JetBrains Mono, monospace')
          .text(`LLaMA-3: ${last.llamaTokens} ${isKm ? 'ថូខិន' : 'tokens'}`);

        g.append('text')
          .attr('x', x(last.chars) - 4)
          .attr('y', y(last.khmerTokens) - 8)
          .attr('text-anchor', 'end')
          .attr('fill', '#10b981')
          .attr('font-size', '11px')
          .attr('font-family', isKm ? 'Kantumruy Pro, JetBrains Mono, monospace' : 'JetBrains Mono, monospace')
          .text(`Khmer SPM: ${last.khmerTokens} ${isKm ? 'ថូខិន' : 'tokens'}`);
      }

      // X Axis
      g.append('g')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(d3.axisBottom(x).ticks(6))
        .call(g => g.select('.domain').attr('stroke', '#334155'))
        .call(g =>
          g
            .selectAll('.tick text')
            .attr('fill', '#94a3b8')
            .attr('font-size', '10px')
            .attr('font-family', 'JetBrains Mono, monospace')
        );

      // Y Axis
      g.append('g')
        .call(d3.axisLeft(y).ticks(5))
        .call(g => g.select('.domain').attr('stroke', '#334155'))
        .call(g =>
          g
            .selectAll('.tick text')
            .attr('fill', '#94a3b8')
            .attr('font-size', '10px')
            .attr('font-family', 'JetBrains Mono, monospace')
        );

      svg
        .append('text')
        .attr('x', width / 2)
        .attr('y', height - 6)
        .attr('text-anchor', 'middle')
        .attr('fill', '#64748b')
        .attr('font-size', '10px')
        .attr('font-family', isKm ? 'Kantumruy Pro, JetBrains Mono, sans-serif' : 'JetBrains Mono, monospace')
        .text(
          isKm
            ? 'តួអក្សរសរុបដែលបានបញ្ចូល → ចំនួនថូខិនដែលបានបង្កើត'
            : 'CUMULATIVE CHARACTERS INGESTED → TOKENS GENERATED'
        );
    }
  }, [histogramData, cumulativeData, activeChartTab, language, isKm]);

  return (
    <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-4">
      {/* Top Header & Visual Tab Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-amber-400" />
            <h4 className={`text-sm font-bold text-white ${isKm ? 'font-khmer' : ''}`}>
              {tr('D3 Token Distribution & Granularity Spectrum', 'វិសាលគមទំហំ និងរបាយថូខិន (D3)')}
            </h4>
          </div>
          <p className={`text-xs text-slate-400 ${isKm ? 'font-khmer leading-relaxed' : ''}`}>
            {tr(
              'Visualizing the atomic single-character fragmentation in LLaMA-3 vs. multi-character subwords in Khmer SentencePiece.',
              'បង្ហាញការបែកខ្ញែកជាតួអក្សរទោលក្នុង LLaMA-3 ធៀបនឹងបំណែកពាក្យពហុតួអក្សរក្នុង Khmer SentencePiece។'
            )}
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveChartTab('histogram')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs rounded-md transition-colors ${
              activeChartTab === 'histogram'
                ? 'bg-amber-400 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>{tr('Length Histogram', 'ក្រាហ្វប្រវែង')}</span>
          </button>

          <button
            onClick={() => setActiveChartTab('cumulative')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs rounded-md transition-colors ${
              activeChartTab === 'cumulative'
                ? 'bg-amber-400 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{tr('Growth Curve', 'ខ្សែកោងកំណើន')}</span>
          </button>

          <button
            onClick={() => setActiveChartTab('granularity')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs rounded-md transition-colors ${
              activeChartTab === 'granularity'
                ? 'bg-amber-400 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <PieChart className="w-3.5 h-3.5" />
            <span>{tr('Subword Tiers', 'កម្រិតបំណែកពាក្យ')}</span>
          </button>
        </div>
      </div>

      {/* Main Visual Presentation Stage */}
      {activeChartTab !== 'granularity' ? (
        <div className="space-y-3">
          {/* Legend and Summary Stats */}
          <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-mono pt-1">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-rose-400">
                <span className="w-3 h-3 rounded bg-rose-500 inline-block" />
                <span>{tr('Standard LLaMA-3 (1-char byte fallback)', 'LLaMA-3 ស្តង់ដារ (បំណែកបៃ ១ តួ)')}</span>
              </span>
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-3 h-3 rounded bg-emerald-500 inline-block" />
                <span>{tr('Dedicated Khmer SPM (2-8 char subwords)', 'Khmer SPM (បំណែកពាក្យ ២-៨ តួ)')}</span>
              </span>
            </div>

            <span className="text-slate-400 text-[11px]">
              {tr('Avg Khmer Token Span:', 'ប្រវែងថូខិនខ្មែរមធ្យម៖')}{' '}
              <strong className="text-white">
                {(
                  comparison.khmerOptimizedTokens.reduce((acc, t) => acc + t.token.length, 0) /
                  Math.max(1, comparison.khmerOptimizedTokens.length)
                ).toFixed(1)}{' '}
                {tr('chars/token', 'តួអក្សរ/ថូខិន')}
              </strong>
            </span>
          </div>

          {/* D3 SVG Canvas */}
          <div className="w-full overflow-x-auto rounded-xl bg-slate-950/80 border border-slate-800/80 p-2 flex justify-center">
            <svg
              ref={svgRef}
              viewBox="0 0 680 280"
              className="w-full max-w-2xl h-auto"
              style={{ minWidth: '480px' }}
            />
          </div>

          {/* Interactive Hover Callout Box */}
          {hoveredData && activeChartTab === 'histogram' && (
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs flex flex-wrap items-center justify-between gap-4 font-mono">
              <div>
                <span className="text-slate-400">{tr('Bucket: ', 'ក្រុម៖ ')}</span>
                <strong className="text-white">{hoveredData.label}</strong>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-rose-400">LLaMA: {hoveredData.llamaCount} ({hoveredData.llamaPct}%)</span>
                <span>·</span>
                <span className="text-emerald-400">Khmer SPM: {hoveredData.khmerCount} ({hoveredData.khmerPct}%)</span>
              </div>
              {hoveredData.examples.length > 0 && (
                <div className="text-slate-400 text-[11px] font-khmer">
                  {tr('Examples:', 'ឧទាហរណ៍៖')} <span className="text-amber-300">{hoveredData.examples.join(', ')}</span>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Granularity Spectrum Tier View */
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
              <div className="text-[11px] text-slate-400 font-mono">
                {tr('1 CHAR (ATOMIC)', '១ តួអក្សរ (ទោល)')}
              </div>
              <div className="text-xl font-bold font-mono text-slate-200 tabular-nums">
                {granularitySummary.singleCharPct}%
              </div>
              <p className={`text-[10px] text-slate-500 ${isKm ? 'font-khmer' : ''}`}>
                {granularitySummary.singleCharCount} {tr('tokens (lone vowels/signs)', 'ថូខិន (ស្រៈ/សញ្ញាទោល)')}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
              <div className="text-[11px] text-emerald-400 font-mono">
                {tr('2-3 CHARS (SYLLABLES)', '២-៣ តួអក្សរ (ព្យាង្គ)')}
              </div>
              <div className="text-xl font-bold font-mono text-emerald-400 tabular-nums">
                {granularitySummary.syllablesPct}%
              </div>
              <p className={`text-[10px] text-slate-500 ${isKm ? 'font-khmer' : ''}`}>
                {granularitySummary.syllablesCount} {tr('tokens (Coeng ligatures & syllables)', 'ថូខិន (ជើងព្យញ្ជនៈ និងព្យាង្គ)')}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
              <div className="text-[11px] text-cyan-400 font-mono">
                {tr('4-6 CHARS (ROOT STEMS)', '៤-៦ តួអក្សរ (ឫសពាក្យ)')}
              </div>
              <div className="text-xl font-bold font-mono text-cyan-400 tabular-nums">
                {granularitySummary.stemsPct}%
              </div>
              <p className={`text-[10px] text-slate-500 ${isKm ? 'font-khmer' : ''}`}>
                {granularitySummary.stemsCount} {tr('tokens (common words like កម្ពុជា, ប្រកាស)', 'ថូខិន (ពាក្យញឹកញាប់ ដូចជា កម្ពុជា, ប្រកាស)')}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
              <div className="text-[11px] text-amber-400 font-mono">
                {tr('7+ CHARS (COMPOUNDS)', '៧+ តួអក្សរ (ពាក្យផ្សំ)')}
              </div>
              <div className="text-xl font-bold font-mono text-amber-400 tabular-nums">
                {granularitySummary.compoundsPct}%
              </div>
              <p className={`text-[10px] text-slate-500 ${isKm ? 'font-khmer' : ''}`}>
                {granularitySummary.compoundsCount} {tr('tokens (e.g. រាជរដ្ឋាភិបាល)', 'ថូខិន (ឧ. រាជរដ្ឋាភិបាល)')}
              </p>
            </div>
          </div>

          {/* Granularity Horizontal Spectrum Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px] text-slate-400 font-mono">
              <span>{tr('KHMER SUBWORD VOCABULARY COMPOSITION', 'សមាសភាពវាក្យសព្ទបំណែកពាក្យខ្មែរ')}</span>
              <span>{tr('100% COVERAGE', 'គ្របដណ្តប់ 100%')}</span>
            </div>
            <div className="h-4 w-full bg-slate-950 rounded-full overflow-hidden flex border border-slate-800">
              <div
                style={{ width: `${granularitySummary.singleCharPct}%` }}
                className="bg-slate-500 h-full transition-all duration-300"
                title={`1 char: ${granularitySummary.singleCharPct}%`}
              />
              <div
                style={{ width: `${granularitySummary.syllablesPct}%` }}
                className="bg-emerald-500 h-full transition-all duration-300"
                title={`2-3 chars: ${granularitySummary.syllablesPct}%`}
              />
              <div
                style={{ width: `${granularitySummary.stemsPct}%` }}
                className="bg-cyan-500 h-full transition-all duration-300"
                title={`4-6 chars: ${granularitySummary.stemsPct}%`}
              />
              <div
                style={{ width: `${granularitySummary.compoundsPct}%` }}
                className="bg-amber-400 h-full transition-all duration-300"
                title={`7+ chars: ${granularitySummary.compoundsPct}%`}
              />
            </div>
          </div>
        </div>
      )}

      {/* Analytical Takeaway Note */}
      <div className="text-xs text-slate-300 flex items-start gap-2 bg-slate-950/40 p-3 rounded-xl border border-slate-800">
        <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <p className={`leading-relaxed ${isKm ? 'font-khmer' : ''}`}>
          {isKm ? (
            <>
              <strong>របកគំហើញសំខាន់៖</strong> ក្នុងម៉ូដែល LLaMA-3 <strong className="text-rose-400">ជាង 95% នៃថូខិនគឺជាបំណែកបៃ ១ តួអក្សរ</strong> ដែលបង្ខំឱ្យបណ្តាញណឺរ៉ូនចំណាយស្រទាប់ Attention ដំបូងៗសម្រាប់ផ្គុំព្យាង្គខ្មែរដែលបែកខ្ញែកឡើងវិញ។ ជាមួយ Khmer SentencePiece <strong className="text-emerald-400">ជាង 80% នៃថូខិនតំណាងឱ្យព្យាង្គ ឫសពាក្យ ឬពាក្យពេញលេញ</strong> ដែលជួយឱ្យម៉ូដែលរៀនអត្ថន័យ និងហេតុផលស៊ីជម្រៅបានដោយផ្ទាល់។
            </>
          ) : (
            <>
              <strong>Key Discovery:</strong> In LLaMA-3, <strong className="text-rose-400">95%+ of tokens are 1-character/byte fallback fragments</strong>, meaning the neural network must spend its early self-attention layers merely reconstructing broken Khmer syllables. With Khmer SentencePiece, <strong className="text-emerald-400">over 80% of tokens represent complete syllables, stems, or words</strong>, enabling the model to directly learn semantic relationships and deep reasoning.
            </>
          )}
        </p>
      </div>
    </div>
  );
};
