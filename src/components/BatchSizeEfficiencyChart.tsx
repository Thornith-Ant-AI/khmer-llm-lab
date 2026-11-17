import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as d3 from 'd3';
import {
  Activity,
  Cpu,
  Grid,
  Info,
  Layers,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import type { CheckpointModelId } from './TrainingDynamics';

type ModelScaleKey = '1.5b_gqa' | '3b_gqa' | '7b_gqa';

interface ScaleSpec {
  id: ModelScaleKey;
  label: string;
  labelKm: string;
  paramsB: number;
  baseMemGb: number;
  actGbPerSeq4k: number;
  criticalBatchTokensM: number;
  defaultGpus: 8 | 16 | 32 | 64;
  color: string;
}

const MODEL_SCALE_SPECS: Record<ModelScaleKey, ScaleSpec> = {
  '1.5b_gqa': {
    id: '1.5b_gqa',
    label: '1.5B GQA',
    labelKm: '១.៥B GQA',
    paramsB: 1.5,
    baseMemGb: 14.5,
    actGbPerSeq4k: 6.4,
    criticalBatchTokensM: 2.1,
    defaultGpus: 16,
    color: '#fbbf24'
  },
  '3b_gqa': {
    id: '3b_gqa',
    label: '3B GQA',
    labelKm: '៣B GQA',
    paramsB: 3.0,
    baseMemGb: 23.0,
    actGbPerSeq4k: 12.2,
    criticalBatchTokensM: 4.2,
    defaultGpus: 32,
    color: '#22d3ee'
  },
  '7b_gqa': {
    id: '7b_gqa',
    label: '7B GQA',
    labelKm: '៧B GQA',
    paramsB: 7.0,
    baseMemGb: 41.0,
    actGbPerSeq4k: 22.0,
    criticalBatchTokensM: 6.3,
    defaultGpus: 32,
    color: '#34d399'
  }
};

const TOKEN_STEP_TIERS_M = [0.52, 1.05, 2.1, 3.15, 4.19, 6.29, 8.39];
const MICRO_BATCH_CANDIDATES = [1, 2, 4, 8, 16];

interface TradeoffPoint {
  tokensM: number;
  tokensLabel: string;
  optimalMicroBatch: number;
  gradAccum: number;
  vramGb: number;
  hwMfuPct: number;
  statisticalEffPct: number;
  combinedEfficiencyPct: number;
  isOomAtMax: boolean;
  isSweetSpot: boolean;
}

interface HeatmapCell {
  tokensM: number;
  tokensLabel: string;
  microBatch: number;
  gradAccum: number;
  vramGb: number;
  isOom: boolean;
  efficiencyPct: number;
  hwMfuPct: number;
  statisticalEffPct: number;
}

function mapCheckpointToScale(checkpoint?: CheckpointModelId): ModelScaleKey {
  if (checkpoint === 'khmer_3_0b_bilingual') return '3b_gqa';
  if (checkpoint === 'khmer_7_0b_enterprise') return '7b_gqa';
  return '1.5b_gqa';
}

function evaluateConfig(
  spec: ScaleSpec,
  tokensM: number,
  microBatch: number,
  seqLen: 2048 | 4096 | 8192,
  gpuCount: 8 | 16 | 32 | 64,
  vramLimitGb: 40 | 80
) {
  const seqScale = seqLen / 4096;
  // Static FSDP/ZeRO sharding relieves base parameter/optimizer memory as GPU count grows
  const shardedStaticGb = Math.max(8, spec.baseMemGb * (16 / Math.max(8, gpuCount)) ** 0.25);
  const vramGb = Number((shardedStaticGb + microBatch * spec.actGbPerSeq4k * seqScale).toFixed(1));
  const isOom = vramGb > vramLimitGb * 0.94; // 6% safety margin for CUDA allocator fragmentation

  const totalSeqs = Math.max(1, Math.round((tokensM * 1_000_000) / seqLen));
  const rawAccum = totalSeqs / (gpuCount * microBatch);
  const gradAccum = Math.max(1, Math.round(rawAccum));

  // Hardware MFU: larger micro-batch & longer sequences saturate Tensor Cores; high gradAccum hides AllReduce latency
  const gemmSaturation = 1 - Math.exp(-0.72 * microBatch * Math.sqrt(seqScale));
  const commEfficiency = gradAccum >= 2 ? 0.985 : 0.91;
  const memoryPressurePenalty = isOom
    ? 0
    : vramGb > vramLimitGb * 0.85
    ? 0.94
    : 1.0;
  const hwMfuPct = isOom
    ? 0
    : Number((Math.min(97, (62 + 35 * gemmSaturation) * commEfficiency * memoryPressurePenalty)).toFixed(1));

  // Statistical Token Efficiency (McCandlish Critical Batch Size scaling):
  // Too small -> high Khmer gradient variance; too large -> diminishing returns per token
  const ratio = tokensM / spec.criticalBatchTokensM;
  const underBatchPenalty = ratio < 1 ? Math.pow(ratio, 0.28) : 1;
  const overBatchPenalty = 1 / (1 + 0.38 * Math.max(0, ratio - 1));
  const statisticalEffPct = Number((100 * underBatchPenalty * overBatchPenalty).toFixed(1));

  const combinedEfficiencyPct = isOom
    ? 0
    : Number(((hwMfuPct * 0.52 + statisticalEffPct * 0.48)).toFixed(1));

  return {
    vramGb,
    isOom,
    gradAccum,
    hwMfuPct,
    statisticalEffPct,
    combinedEfficiencyPct
  };
}

interface BatchSizeEfficiencyChartProps {
  selectedCheckpoint?: CheckpointModelId;
}

export const BatchSizeEfficiencyChart: React.FC<BatchSizeEfficiencyChartProps> = ({
  selectedCheckpoint
}) => {
  const { language, isKm, tr } = useLanguage();

  const [scaleKey, setScaleKey] = useState<ModelScaleKey>(() =>
    mapCheckpointToScale(selectedCheckpoint)
  );
  const [seqLength, setSeqLength] = useState<2048 | 4096 | 8192>(4096);
  const [gpuCount, setGpuCount] = useState<8 | 16 | 32 | 64>(16);
  const [vramLimitGb, setVramLimitGb] = useState<40 | 80>(80);
  const [viewMode, setViewMode] = useState<'curve' | 'heatmap'>('curve');
  const [hoveredCurvePoint, setHoveredCurvePoint] = useState<TradeoffPoint | null>(null);
  const [hoveredCell, setHoveredCell] = useState<HeatmapCell | null>(null);

  useEffect(() => {
    if (selectedCheckpoint) {
      const nextScale = mapCheckpointToScale(selectedCheckpoint);
      setScaleKey(nextScale);
      setGpuCount(MODEL_SCALE_SPECS[nextScale].defaultGpus);
    }
  }, [selectedCheckpoint]);

  const spec = MODEL_SCALE_SPECS[scaleKey];

  const { curvePoints, heatmapCells, sweetSpot } = useMemo(() => {
    const cells: HeatmapCell[] = [];
    const points: TradeoffPoint[] = [];

    for (const tokensM of TOKEN_STEP_TIERS_M) {
      const tokensLabel = `${tokensM.toFixed(1)}M`;
      let bestMicro = 1;
      let bestEff = -1;
      let bestStats = evaluateConfig(spec, tokensM, 1, seqLength, gpuCount, vramLimitGb);

      for (const mb of MICRO_BATCH_CANDIDATES) {
        const res = evaluateConfig(spec, tokensM, mb, seqLength, gpuCount, vramLimitGb);
        cells.push({
          tokensM,
          tokensLabel,
          microBatch: mb,
          gradAccum: res.gradAccum,
          vramGb: res.vramGb,
          isOom: res.isOom,
          efficiencyPct: res.combinedEfficiencyPct,
          hwMfuPct: res.hwMfuPct,
          statisticalEffPct: res.statisticalEffPct
        });

        // Cap micro-batch so total per-step sequences aren't wildly exceeded without accumulation
        const totalSeqs = Math.max(1, Math.round((tokensM * 1_000_000) / seqLength));
        const maxLogicalMb = Math.max(1, Math.floor(totalSeqs / gpuCount));
        if (!res.isOom && mb <= Math.max(1, maxLogicalMb) && res.combinedEfficiencyPct > bestEff) {
          bestEff = res.combinedEfficiencyPct;
          bestMicro = mb;
          bestStats = res;
        }
      }

      points.push({
        tokensM,
        tokensLabel,
        optimalMicroBatch: bestMicro,
        gradAccum: bestStats.gradAccum,
        vramGb: bestStats.vramGb,
        hwMfuPct: bestStats.hwMfuPct,
        statisticalEffPct: bestStats.statisticalEffPct,
        combinedEfficiencyPct: Math.max(0, bestStats.combinedEfficiencyPct),
        isOomAtMax: bestStats.isOom,
        isSweetSpot: false
      });
    }

    // Mark overall peak combined efficiency as Sweet Spot
    let maxIdx = 0;
    for (let i = 1; i < points.length; i++) {
      if (points[i].combinedEfficiencyPct > points[maxIdx].combinedEfficiencyPct) {
        maxIdx = i;
      }
    }
    if (points[maxIdx]) {
      points[maxIdx] = { ...points[maxIdx], isSweetSpot: true };
    }

    return {
      curvePoints: points,
      heatmapCells: cells,
      sweetSpot: points[maxIdx] || points[0]
    };
  }, [spec, seqLength, gpuCount, vramLimitGb]);

  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = 760;
    const height = 320;
    const margin = { top: 28, right: 64, bottom: 50, left: 56 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    if (viewMode === 'curve') {
      const x = d3
        .scalePoint<string>()
        .domain(curvePoints.map((d) => d.tokensLabel))
        .range([0, innerWidth])
        .padding(0.35);

      const yEff = d3.scaleLinear().domain([30, 100]).range([innerHeight, 0]);
      const yMb = d3.scaleLinear().domain([0, 16]).range([innerHeight, 0]);

      // Gridlines
      g.append('g')
        .call(
          d3
            .axisLeft(yEff)
            .ticks(5)
            .tickSize(-innerWidth)
            .tickFormat(() => '')
        )
        .call((axis) => axis.select('.domain').remove())
        .call((axis) =>
          axis
            .selectAll('.tick line')
            .attr('stroke', 'rgba(148, 163, 184, 0.12)')
            .attr('stroke-dasharray', '3,3')
        );

      // Highlight Sweet Spot Band
      if (sweetSpot) {
        const sx = x(sweetSpot.tokensLabel) ?? innerWidth / 2;
        const bandW = Math.min(72, innerWidth / Math.max(1, curvePoints.length));
        g.append('rect')
          .attr('x', sx - bandW / 2)
          .attr('y', 0)
          .attr('width', bandW)
          .attr('height', innerHeight)
          .attr('fill', 'rgba(251, 191, 36, 0.08)')
          .attr('stroke', 'rgba(251, 191, 36, 0.28)')
          .attr('stroke-dasharray', '4,3')
          .attr('rx', 6);
      }

      // Combined Efficiency Area
      const effArea = d3
        .area<TradeoffPoint>()
        .x((d) => x(d.tokensLabel) ?? 0)
        .y0(innerHeight)
        .y1((d) => yEff(d.combinedEfficiencyPct))
        .curve(d3.curveMonotoneX);

      g.append('path')
        .datum(curvePoints)
        .attr('fill', 'rgba(251, 191, 36, 0.12)')
        .attr('d', effArea);

      // Hardware MFU Line (Dashed Emerald)
      const mfuLine = d3
        .line<TradeoffPoint>()
        .x((d) => x(d.tokensLabel) ?? 0)
        .y((d) => yEff(d.hwMfuPct))
        .curve(d3.curveMonotoneX);

      g.append('path')
        .datum(curvePoints)
        .attr('fill', 'none')
        .attr('stroke', '#34d399')
        .attr('stroke-width', 1.8)
        .attr('stroke-dasharray', '5,4')
        .attr('d', mfuLine);

      // Combined Efficiency Line (Solid Amber)
      const effLine = d3
        .line<TradeoffPoint>()
        .x((d) => x(d.tokensLabel) ?? 0)
        .y((d) => yEff(d.combinedEfficiencyPct))
        .curve(d3.curveMonotoneX);

      g.append('path')
        .datum(curvePoints)
        .attr('fill', 'none')
        .attr('stroke', '#fbbf24')
        .attr('stroke-width', 2.8)
        .attr('d', effLine);

      // Optimal Micro-Batch Size Step Line (Solid Cyan)
      const mbLine = d3
        .line<TradeoffPoint>()
        .x((d) => x(d.tokensLabel) ?? 0)
        .y((d) => yMb(d.optimalMicroBatch))
        .curve(d3.curveStepAfter);

      g.append('path')
        .datum(curvePoints)
        .attr('fill', 'none')
        .attr('stroke', '#22d3ee')
        .attr('stroke-width', 2.4)
        .attr('d', mbLine);

      // Interactive Nodes for Optimal Micro-Batch & Combined Efficiency
      const nodeGroups = g
        .selectAll('.tradeoff-node')
        .data(curvePoints)
        .enter()
        .append('g')
        .attr('class', 'tradeoff-node')
        .style('cursor', 'pointer')
        .on('mouseenter', (_event, d) => setHoveredCurvePoint(d))
        .on('click', (_event, d) => setHoveredCurvePoint(d));

      // Micro-batch dot
      nodeGroups
        .append('circle')
        .attr('cx', (d) => x(d.tokensLabel) ?? 0)
        .attr('cy', (d) => yMb(d.optimalMicroBatch))
        .attr('r', (d) => (d.isSweetSpot ? 6 : 4.5))
        .attr('fill', '#020617')
        .attr('stroke', '#22d3ee')
        .attr('stroke-width', 2.2);

      // Micro-batch integer badge above cyan dot
      nodeGroups
        .append('text')
        .attr('x', (d) => x(d.tokensLabel) ?? 0)
        .attr('y', (d) => yMb(d.optimalMicroBatch) - 10)
        .attr('text-anchor', 'middle')
        .attr('fill', '#67e8f9')
        .attr('font-size', '10px')
        .attr('font-family', 'JetBrains Mono, monospace')
        .attr('font-weight', '700')
        .text((d) => `mb=${d.optimalMicroBatch}`);

      // Combined Efficiency dot
      nodeGroups
        .append('circle')
        .attr('cx', (d) => x(d.tokensLabel) ?? 0)
        .attr('cy', (d) => yEff(d.combinedEfficiencyPct))
        .attr('r', (d) => (d.isSweetSpot ? 7 : 4.5))
        .attr('fill', (d) => (d.isSweetSpot ? '#fbbf24' : '#020617'))
        .attr('stroke', '#fbbf24')
        .attr('stroke-width', 2.2);

      // Sweet Spot Outer Ring + Label
      nodeGroups
        .filter((d) => d.isSweetSpot)
        .append('circle')
        .attr('cx', (d) => x(d.tokensLabel) ?? 0)
        .attr('cy', (d) => yEff(d.combinedEfficiencyPct))
        .attr('r', 12)
        .attr('fill', 'none')
        .attr('stroke', '#fbbf24')
        .attr('stroke-width', 1.4)
        .attr('stroke-dasharray', '3,2');

      nodeGroups
        .filter((d) => d.isSweetSpot)
        .append('text')
        .attr('x', (d) => x(d.tokensLabel) ?? 0)
        .attr('y', (d) => yEff(d.combinedEfficiencyPct) - 16)
        .attr('text-anchor', 'middle')
        .attr('fill', '#fde68a')
        .attr('font-size', '10px')
        .attr('font-family', 'JetBrains Mono, monospace')
        .attr('font-weight', '700')
        .text((d) => `${d.combinedEfficiencyPct}%★`);

      // X Axis
      g.append('g')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(d3.axisBottom(x))
        .call((axis) => axis.select('.domain').attr('stroke', '#334155'))
        .call((axis) =>
          axis
            .selectAll('.tick text')
            .attr('fill', '#94a3b8')
            .attr('font-size', '11px')
            .attr('font-family', 'JetBrains Mono, monospace')
        );

      // Left Y Axis (Efficiency %)
      g.append('g')
        .call(d3.axisLeft(yEff).ticks(5).tickFormat((d) => `${d}%`))
        .call((axis) => axis.select('.domain').attr('stroke', '#334155'))
        .call((axis) =>
          axis
            .selectAll('.tick text')
            .attr('fill', '#fbbf24')
            .attr('font-size', '10px')
            .attr('font-family', 'JetBrains Mono, monospace')
        );

      // Right Y Axis (Optimal Micro-Batch Size)
      g.append('g')
        .attr('transform', `translate(${innerWidth},0)`)
        .call(
          d3
            .axisRight(yMb)
            .tickValues([1, 2, 4, 8, 16])
            .tickFormat((d) => `${d}`)
        )
        .call((axis) => axis.select('.domain').attr('stroke', '#334155'))
        .call((axis) =>
          axis
            .selectAll('.tick text')
            .attr('fill', '#22d3ee')
            .attr('font-size', '10px')
            .attr('font-family', 'JetBrains Mono, monospace')
        );

      // Axis Titles
      svg
        .append('text')
        .attr('x', margin.left + innerWidth / 2)
        .attr('y', height - 8)
        .attr('text-anchor', 'middle')
        .attr('fill', '#64748b')
        .attr('font-size', '10px')
        .attr('font-family', isKm ? 'Kantumruy Pro, sans-serif' : 'JetBrains Mono, monospace')
        .text(
          isKm
            ? 'ចំនួនថូខិនសរុបក្នុងមួយជំហាន (GLOBAL BATCH TOKENS / STEP)'
            : 'GLOBAL BATCH TOKEN COUNT PER STEP (MILLIONS OF TOKENS)'
        );

      svg
        .append('text')
        .attr('x', 12)
        .attr('y', 16)
        .attr('fill', '#fbbf24')
        .attr('font-size', '10px')
        .attr('font-family', 'JetBrains Mono, monospace')
        .text(isKm ? 'ប្រសិទ្ធភាព (%)' : 'EFFICIENCY (%)');

      svg
        .append('text')
        .attr('x', width - 10)
        .attr('y', 16)
        .attr('text-anchor', 'end')
        .attr('fill', '#22d3ee')
        .attr('font-size', '10px')
        .attr('font-family', 'JetBrains Mono, monospace')
        .text(isKm ? 'MICRO-BATCH' : 'MICRO-BATCH (SEQS/GPU)');
    } else {
      // D3 Tradeoff Heatmap Matrix: Token Count (X) × Micro-Batch Size (Y)
      const xLabels = TOKEN_STEP_TIERS_M.map((t) => `${t.toFixed(1)}M`);
      const yLabels = MICRO_BATCH_CANDIDATES.map((mb) => String(mb));

      const x = d3
        .scaleBand()
        .domain(xLabels)
        .range([0, innerWidth])
        .padding(0.08);

      const y = d3
        .scaleBand()
        .domain(yLabels)
        .range([innerHeight, 0])
        .padding(0.1);

      const colorScale = d3
        .scaleLinear<string>()
        .domain([45, 75, 92])
        .range(['#1e293b', '#0284c7', '#10b981'])
        .clamp(true);

      const cellGroups = g
        .selectAll('.eff-cell')
        .data(heatmapCells)
        .enter()
        .append('g')
        .attr('class', 'eff-cell')
        .attr(
          'transform',
          (d) => `translate(${x(d.tokensLabel) ?? 0},${y(String(d.microBatch)) ?? 0})`
        )
        .style('cursor', 'pointer')
        .on('mouseenter', (_event, d) => setHoveredCell(d))
        .on('click', (_event, d) => setHoveredCell(d));

      cellGroups
        .append('rect')
        .attr('width', x.bandwidth())
        .attr('height', y.bandwidth())
        .attr('rx', 6)
        .attr('fill', (d) => (d.isOom ? 'rgba(244, 63, 94, 0.14)' : colorScale(d.efficiencyPct)))
        .attr('stroke', (d) => {
          if (d.isOom) return 'rgba(244, 63, 94, 0.45)';
          if (
            sweetSpot &&
            d.tokensLabel === sweetSpot.tokensLabel &&
            d.microBatch === sweetSpot.optimalMicroBatch
          ) {
            return '#fbbf24';
          }
          return 'rgba(148, 163, 184, 0.18)';
        })
        .attr('stroke-width', (d) =>
          sweetSpot &&
          d.tokensLabel === sweetSpot.tokensLabel &&
          d.microBatch === sweetSpot.optimalMicroBatch
            ? 2.4
            : 1
        );

      cellGroups
        .append('text')
        .attr('x', x.bandwidth() / 2)
        .attr('y', y.bandwidth() / 2 - 2)
        .attr('text-anchor', 'middle')
        .attr('fill', (d) => (d.isOom ? '#fda4af' : '#f8fafc'))
        .attr('font-size', '11px')
        .attr('font-weight', '700')
        .attr('font-family', 'JetBrains Mono, monospace')
        .text((d) => (d.isOom ? 'OOM' : `${d.efficiencyPct}%`));

      cellGroups
        .append('text')
        .attr('x', x.bandwidth() / 2)
        .attr('y', y.bandwidth() / 2 + 12)
        .attr('text-anchor', 'middle')
        .attr('fill', (d) => (d.isOom ? '#fb7185' : 'rgba(226, 232, 240, 0.78)'))
        .attr('font-size', '9px')
        .attr('font-family', 'JetBrains Mono, monospace')
        .text((d) => (d.isOom ? `${d.vramGb}GB` : `GA=${d.gradAccum}`));

      // X Axis
      g.append('g')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(d3.axisBottom(x))
        .call((axis) => axis.select('.domain').attr('stroke', '#334155'))
        .call((axis) =>
          axis
            .selectAll('.tick text')
            .attr('fill', '#94a3b8')
            .attr('font-size', '11px')
            .attr('font-family', 'JetBrains Mono, monospace')
        );

      // Y Axis
      g.append('g')
        .call(d3.axisLeft(y).tickFormat((mb) => `mb=${mb}`))
        .call((axis) => axis.select('.domain').attr('stroke', '#334155'))
        .call((axis) =>
          axis
            .selectAll('.tick text')
            .attr('fill', '#22d3ee')
            .attr('font-size', '11px')
            .attr('font-family', 'JetBrains Mono, monospace')
        );

      svg
        .append('text')
        .attr('x', margin.left + innerWidth / 2)
        .attr('y', height - 8)
        .attr('text-anchor', 'middle')
        .attr('fill', '#64748b')
        .attr('font-size', '10px')
        .attr('font-family', isKm ? 'Kantumruy Pro, sans-serif' : 'JetBrains Mono, monospace')
        .text(
          isKm
            ? 'ចំនួនថូខិនសរុបក្នុងមួយជំហាន (M TOKENS/STEP) × ទំហំ MICRO-BATCH ក្នុង GPU នីមួយៗ'
            : 'TOKEN COUNT PER STEP (M TOKENS) × PER-GPU MICRO-BATCH SIZE'
        );
    }
  }, [curvePoints, heatmapCells, sweetSpot, viewMode, language, isKm]);

  const activeCallout = hoveredCurvePoint || sweetSpot;

  return (
    <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-5">
      {/* Header & View Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            <h3 className={`text-lg font-bold text-white ${isKm ? 'font-khmer' : ''}`}>
              {tr(
                'Batch Size Efficiency Frontier (D3)',
                'ក្រាហ្វប្រសិទ្ធភាពទំហំ Batch & Micro-Batch (D3)'
              )}
            </h3>
          </div>
          <p className={`text-xs text-slate-400 max-w-2xl ${isKm ? 'font-khmer' : ''}`}>
            {tr(
              'Interactive D3 analysis of how global batch token count, per-GPU micro-batch size, VRAM ceiling, and Tensor Core MFU interact.',
              'ការវិភាគ D3 អំពីទំនាក់ទំនងរវាងចំនួនថូខិនសរុប ទំហំ micro-batch ក្នុង GPU នីមួយៗ កម្រិត VRAM និងប្រសិទ្ធភាព Tensor Core MFU។'
            )}
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 self-start lg:self-auto">
          <button
            type="button"
            onClick={() => setViewMode('curve')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              viewMode === 'curve'
                ? 'bg-cyan-400 text-slate-950'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span className={isKm ? 'font-khmer' : ''}>
              {tr('Efficiency Curve', 'ខ្សែកោងប្រសិទ្ធភាព')}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('heatmap')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              viewMode === 'heatmap'
                ? 'bg-cyan-400 text-slate-950'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span className={isKm ? 'font-khmer' : ''}>
              {tr('Tradeoff Matrix', 'ម៉ាទ្រីសប្រៀបធៀប')}
            </span>
          </button>
        </div>
      </div>

      {/* Interactive Calibration Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
        {/* Model Scale */}
        <div className="flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-amber-400" />
          <span className={`text-slate-400 ${isKm ? 'font-khmer' : ''}`}>
            {tr('Model:', 'ម៉ូដែល៖')}
          </span>
          <div className="flex items-center rounded-lg bg-slate-900 border border-slate-800 p-0.5">
            {(['1.5b_gqa', '3b_gqa', '7b_gqa'] as ModelScaleKey[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setScaleKey(key);
                  setGpuCount(MODEL_SCALE_SPECS[key].defaultGpus);
                  setHoveredCurvePoint(null);
                  setHoveredCell(null);
                }}
                className={`px-2.5 py-1 rounded-md font-mono text-[11px] font-bold transition-colors ${
                  scaleKey === key
                    ? 'bg-amber-400/20 text-amber-300'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {isKm ? MODEL_SCALE_SPECS[key].labelKm : MODEL_SCALE_SPECS[key].label}
              </button>
            ))}
          </div>
        </div>

        {/* Context Length */}
        <div className="flex items-center gap-1.5">
          <span className={`text-slate-400 ${isKm ? 'font-khmer' : ''}`}>
            {tr('Seq Len:', 'ប្រវែងបរិបទ៖')}
          </span>
          <div className="flex items-center rounded-lg bg-slate-900 border border-slate-800 p-0.5">
            {([2048, 4096, 8192] as const).map((len) => (
              <button
                key={len}
                type="button"
                onClick={() => {
                  setSeqLength(len);
                  setHoveredCurvePoint(null);
                  setHoveredCell(null);
                }}
                className={`px-2 py-1 rounded-md font-mono text-[11px] font-bold transition-colors ${
                  seqLength === len
                    ? 'bg-cyan-500/20 text-cyan-300'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {len}
              </button>
            ))}
          </div>
        </div>

        {/* Cluster GPUs */}
        <div className="flex items-center gap-1.5">
          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          <span className={`text-slate-400 ${isKm ? 'font-khmer' : ''}`}>
            {tr('GPUs:', 'ចំនួន GPU៖')}
          </span>
          <div className="flex items-center rounded-lg bg-slate-900 border border-slate-800 p-0.5">
            {([8, 16, 32, 64] as const).map((cnt) => (
              <button
                key={cnt}
                type="button"
                onClick={() => {
                  setGpuCount(cnt);
                  setHoveredCurvePoint(null);
                  setHoveredCell(null);
                }}
                className={`px-2 py-1 rounded-md font-mono text-[11px] font-bold transition-colors ${
                  gpuCount === cnt
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {cnt}×
              </button>
            ))}
          </div>
        </div>

        {/* GPU VRAM Tier */}
        <div className="flex items-center gap-1.5">
          <span className={`text-slate-400 ${isKm ? 'font-khmer' : ''}`}>
            {tr('VRAM:', 'អង្គចងចាំ VRAM៖')}
          </span>
          <div className="flex items-center rounded-lg bg-slate-900 border border-slate-800 p-0.5">
            {([40, 80] as const).map((gb) => (
              <button
                key={gb}
                type="button"
                onClick={() => {
                  setVramLimitGb(gb);
                  setHoveredCurvePoint(null);
                  setHoveredCell(null);
                }}
                className={`px-2 py-1 rounded-md font-mono text-[11px] font-bold transition-colors ${
                  vramLimitGb === gb
                    ? 'bg-rose-500/20 text-rose-300'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {gb}GB
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Legend Strip */}
      {viewMode === 'curve' ? (
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-1.5 text-amber-300">
              <span className="w-3 h-0.5 bg-amber-400 inline-block" />
              <span>{tr('Combined Efficiency (%)', 'ប្រសិទ្ធភាពសរុប (%)')}</span>
            </span>
            <span className="flex items-center gap-1.5 text-cyan-300">
              <span className="w-3 h-0.5 bg-cyan-400 inline-block" />
              <span>{tr('Optimal Micro-Batch (seqs/GPU)', 'Micro-Batch ល្អបំផុត')}</span>
            </span>
            <span className="flex items-center gap-1.5 text-emerald-300">
              <span className="w-3 h-0.5 border-b-2 border-dashed border-emerald-400 inline-block" />
              <span>{tr('Hardware Tensor Core MFU (%)', 'ប្រសិទ្ធភាព Tensor Core MFU (%)')}</span>
            </span>
          </div>
          <span className="text-[11px] text-slate-400">
            {tr('Critical Batch:', 'កម្រិត Critical Batch៖')}{' '}
            <strong className="text-amber-300">{spec.criticalBatchTokensM}M tok/step</strong>
          </span>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-1.5 text-emerald-300">
              <span className="w-3 h-3 rounded bg-emerald-500 inline-block" />
              <span>{tr('High Efficiency (85%+)', 'ប្រសិទ្ធភាពខ្ពស់ (85%+)')}</span>
            </span>
            <span className="flex items-center gap-1.5 text-sky-300">
              <span className="w-3 h-3 rounded bg-sky-600 inline-block" />
              <span>{tr('Moderate (65-84%)', 'មធ្យម (65-84%)')}</span>
            </span>
            <span className="flex items-center gap-1.5 text-rose-300">
              <span className="w-3 h-3 rounded bg-rose-900 border border-rose-500 inline-block" />
              <span>{tr(`Exceeds ${vramLimitGb}GB VRAM (OOM)`, `លើសកម្រិត ${vramLimitGb}GB VRAM (OOM)`)}</span>
            </span>
          </div>
          <span className="text-[11px] text-amber-300">
            {tr('Gold border = Optimal Config', 'ស៊ុមមាស = ការកំណត់ល្អបំផុត')}
          </span>
        </div>
      )}

      {/* D3 SVG Canvas */}
      <div className="w-full overflow-x-auto rounded-xl bg-slate-950/85 border border-slate-800 p-3 flex justify-center">
        <svg
          ref={svgRef}
          viewBox="0 0 760 320"
          className="w-full max-w-4xl h-auto"
          style={{ minWidth: '540px' }}
        />
      </div>

      {/* Live Tradeoff Inspection Strip */}
      {viewMode === 'curve' && activeCallout ? (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-4 rounded-xl bg-slate-950/75 border border-slate-800 font-mono text-xs">
          <div>
            <span className={`text-[10px] text-slate-500 block ${isKm ? 'font-khmer font-sans' : ''}`}>
              {tr('GLOBAL BATCH TOKENS', 'ថូខិនសរុប / ជំហាន')}
            </span>
            <span className="text-sm font-bold text-white tabular-nums">
              {activeCallout.tokensLabel}/step
              {activeCallout.isSweetSpot && (
                <span className="ml-1.5 text-[10px] text-amber-300">★ OPTIMAL</span>
              )}
            </span>
          </div>
          <div>
            <span className={`text-[10px] text-slate-500 block ${isKm ? 'font-khmer font-sans' : ''}`}>
              {tr('OPTIMAL MICRO-BATCH', 'MICRO-BATCH ល្អបំផុត')}
            </span>
            <span className="text-sm font-bold text-cyan-300 tabular-nums">
              {activeCallout.optimalMicroBatch} seq/GPU × {activeCallout.gradAccum} GA
            </span>
          </div>
          <div>
            <span className={`text-[10px] text-slate-500 block ${isKm ? 'font-khmer font-sans' : ''}`}>
              {tr('EST. VRAM / GPU', 'VRAM ប៉ាន់ស្មាន / GPU')}
            </span>
            <span
              className={`text-sm font-bold tabular-nums ${
                activeCallout.vramGb > vramLimitGb * 0.9 ? 'text-rose-400' : 'text-slate-200'
              }`}
            >
              {activeCallout.vramGb} / {vramLimitGb} GB
            </span>
          </div>
          <div>
            <span className={`text-[10px] text-slate-500 block ${isKm ? 'font-khmer font-sans' : ''}`}>
              {tr('HW MFU / STAT EFF', 'MFU / ប្រសិទ្ធភាពស្ថិតិ')}
            </span>
            <span className="text-sm font-bold text-emerald-300 tabular-nums">
              {activeCallout.hwMfuPct}% / {activeCallout.statisticalEffPct}%
            </span>
          </div>
          <div>
            <span className={`text-[10px] text-slate-500 block ${isKm ? 'font-khmer font-sans' : ''}`}>
              {tr('COMBINED SCORE', 'ពិន្ទុប្រសិទ្ធភាពរួម')}
            </span>
            <span className="text-sm font-bold text-amber-300 tabular-nums">
              {activeCallout.combinedEfficiencyPct}%
            </span>
          </div>
        </div>
      ) : viewMode === 'heatmap' && hoveredCell ? (
        <div className="p-4 rounded-xl bg-slate-950/75 border border-slate-800 flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
          <div className="flex items-center gap-2">
            {hoveredCell.isOom ? (
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            ) : (
              <Info className="w-4 h-4 text-cyan-400" />
            )}
            <span className="text-white font-bold">
              {hoveredCell.tokensLabel} tok/step · mb={hoveredCell.microBatch}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-slate-300">Grad Accum: <strong>{hoveredCell.gradAccum}×</strong></span>
            <span className={hoveredCell.isOom ? 'text-rose-400 font-bold' : 'text-slate-300'}>
              VRAM: <strong>{hoveredCell.vramGb}GB</strong> / {vramLimitGb}GB
            </span>
            <span className="text-emerald-300">MFU: <strong>{hoveredCell.hwMfuPct}%</strong></span>
            <span className="text-amber-300">Score: <strong>{hoveredCell.isOom ? 'OOM' : `${hoveredCell.efficiencyPct}%`}</strong></span>
          </div>
        </div>
      ) : (
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <p className={isKm ? 'font-khmer leading-relaxed' : 'leading-relaxed'}>
            {tr(
              'Hover or click any matrix cell above to inspect exact Gradient Accumulation steps, VRAM footprint, Hardware MFU, and Critical Batch Size tradeoff.',
              'ដាក់ម៉ៅ ឬចុចលើក្រឡាណាមួយខាងលើ ដើម្បីពិនិត្យជំហាន Gradient Accumulation ទំហំ VRAM ប្រសិទ្ធភាព MFU និងតុល្យភាពទំហំ Batch។'
            )}
          </p>
        </div>
      )}
    </div>
  );
};
