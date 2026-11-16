import React, { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Cell
} from 'recharts';
import {
  Cpu,
  CheckCircle2,
  AlertTriangle,
  Clock,
  DollarSign,
  Server,
  Zap,
  ArrowRight,
  SlidersHorizontal
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { CLOUD_INSTANCES, getPrecisionMultiplier } from '../utils/scalingCalculator';
import { ComputePrecision, PricingModel } from '../types';

export type ArchitectureFamilyFilter = 'all' | 'H100' | 'A100';
export type TargetSlaPreset = 'any' | '7d' | '14d' | '30d';

interface ClusterProfileSpec {
  id: string;
  instanceId: string;
  gpuFamily: 'A100' | 'H100';
  gpuLabel: string;
  gpuCount: number;
  vramPerGpuGB: number;
  expectedMfu: number;
  interconnectSummary: string;
  interconnectSummaryKm: string;
  bestForSummary: string;
  bestForSummaryKm: string;
  parallelismHint: string;
  parallelismHintKm: string;
}

const GPU_CLUSTER_CATALOG: ClusterProfileSpec[] = [
  {
    id: 'a100_40gb_8x',
    instanceId: 'aws_p4d_24xlarge',
    gpuFamily: 'A100',
    gpuLabel: '1×8 NVIDIA A100 40GB',
    gpuCount: 8,
    vramPerGpuGB: 40,
    expectedMfu: 0.34,
    interconnectSummary: 'NVLink 3.0 · 400 Gbps EFA',
    interconnectSummaryKm: 'NVLink 3.0 · 400 Gbps EFA',
    bestForSummary: '0.5B–1.5B starter runs & long-window budget jobs',
    bestForSummaryKm: 'ម៉ូដែល 0.5B–1.5B ចាប់ផ្ដើម និងការងារសន្សំថវិកា',
    parallelismHint: 'FSDP BF16 + Gradient Accumulation',
    parallelismHintKm: 'FSDP BF16 + Gradient Accumulation'
  },
  {
    id: 'a100_80gb_16x',
    instanceId: 'aws_p4de_24xlarge',
    gpuFamily: 'A100',
    gpuLabel: '2×8 NVIDIA A100 80GB (16 GPUs)',
    gpuCount: 16,
    vramPerGpuGB: 80,
    expectedMfu: 0.36,
    interconnectSummary: 'NVLink 3.0 · 400 Gbps EFA · 1.28 TB HBM2e',
    interconnectSummaryKm: 'NVLink 3.0 · 400 Gbps EFA · 1.28 TB HBM2e',
    bestForSummary: '1.5B–3B runs needing 80GB VRAM headroom at 4K–8K seq',
    bestForSummaryKm: 'ម៉ូដែល 1.5B–3B ដែលត្រូវការ VRAM 80GB សម្រាប់បរិបទ 4K–8K',
    parallelismHint: 'PyTorch FSDP Zero-3 (No CPU Offload)',
    parallelismHintKm: 'PyTorch FSDP Zero-3 (មិនបាច់ផ្ទេរទៅ CPU)'
  },
  {
    id: 'h100_80gb_8x_lambda',
    instanceId: 'lambda_h100_node',
    gpuFamily: 'H100',
    gpuLabel: '1×8 NVIDIA H100 SXM5 80GB',
    gpuCount: 8,
    vramPerGpuGB: 80,
    expectedMfu: 0.44,
    interconnectSummary: 'NVLink 4.0 · 3.2 Tbps Quantum-2 InfiniBand',
    interconnectSummaryKm: 'NVLink 4.0 · 3.2 Tbps Quantum-2 InfiniBand',
    bestForSummary: '0.5B–3B optimal cost-per-FLOP sovereign node',
    bestForSummaryKm: 'ណូដសន្សំថ្លៃក្នុងមួយ FLOP ល្អបំផុតសម្រាប់ 0.5B–3B',
    parallelismHint: 'Single-node NVSwitch + FlashAttention-2',
    parallelismHintKm: 'NVSwitch ក្នុងណូដតែមួយ + FlashAttention-2'
  },
  {
    id: 'h100_80gb_16x_gcp',
    instanceId: 'gcp_a3_h100',
    gpuFamily: 'H100',
    gpuLabel: '2×8 NVIDIA H100 SXM5 80GB (16 GPUs)',
    gpuCount: 16,
    vramPerGpuGB: 80,
    expectedMfu: 0.45,
    interconnectSummary: 'NVLink 4.0 · 3.2 Tbps GPUDirect RDMA',
    interconnectSummaryKm: 'NVLink 4.0 · 3.2 Tbps GPUDirect RDMA',
    bestForSummary: '1.5B–7B balanced cluster hitting 1–2 week deadlines',
    bestForSummaryKm: 'ចង្កោមតុល្យភាពសម្រាប់ 1.5B–7B បញ្ចប់ក្នុង ១–២ សប្ដាហ៍',
    parallelismHint: 'FSDP-2 Hybrid Shard + TransformerEngine',
    parallelismHintKm: 'FSDP-2 Hybrid Shard + TransformerEngine'
  },
  {
    id: 'h100_80gb_32x_aws',
    instanceId: 'aws_p5_48xlarge',
    gpuFamily: 'H100',
    gpuLabel: '4×8 NVIDIA H100 SXM5 80GB (32 GPUs)',
    gpuCount: 32,
    vramPerGpuGB: 80,
    expectedMfu: 0.44,
    interconnectSummary: 'NVLink 4.0 · 3.2 Tbps EFAv2 UltraCluster',
    interconnectSummaryKm: 'NVLink 4.0 · 3.2 Tbps EFAv2 UltraCluster',
    bestForSummary: '3B–13B production clusters under tight SLA schedules',
    bestForSummaryKm: 'ចង្កោមផលិតកម្ម 3B–13B សម្រាប់កាលវិភាគរហ័ស',
    parallelismHint: 'TP=2 + FSDP across 4 NVSwitch nodes',
    parallelismHintKm: 'TP=2 + FSDP ឆ្លងកាត់ណូដ NVSwitch ចំនួន 4'
  },
  {
    id: 'h100_80gb_64x_pod',
    instanceId: 'gcp_a3_h100',
    gpuFamily: 'H100',
    gpuLabel: '8×8 NVIDIA H100 SXM5 80GB (64 GPUs)',
    gpuCount: 64,
    vramPerGpuGB: 80,
    expectedMfu: 0.43,
    interconnectSummary: '64-GPU GPUDirect RDMA Pod · 5.12 TB HBM3',
    interconnectSummaryKm: 'ផត GPUDirect RDMA 64-GPU · 5.12 TB HBM3',
    bestForSummary: '7B–70B large-scale pretraining or rapid sub-week runs',
    bestForSummaryKm: 'បង្វឹកទ្រង់ទ្រាយធំ 7B–70B ឬបញ្ចប់ក្រោម ១ សប្ដាហ៍',
    parallelismHint: '3D Parallelism (TP=4, PP=2, DP=8)',
    parallelismHintKm: '3D Parallelism (TP=4, PP=2, DP=8)'
  }
];

interface EvaluatedCluster extends ClusterProfileSpec {
  provider: string;
  projectedHours: number;
  projectedDays: number;
  projectedCostUSD: number;
  hourlyCostUSD: number;
  tokensPerSecond: number;
  effectiveTflops: number;
  vramRequiredPerGpuGB: number;
  vramStatus: 'optimal' | 'checkpointing' | 'oom_risk';
  speedupVsCalculator: number;
  meetsSla: boolean;
  recommendationScore: number;
  recommendationTier: 'top_pick' | 'fastest' | 'budget' | 'standard' | 'unsuitable';
  rationale: string;
  rationaleKm: string;
}

export interface HardwareBenchmarkProps {
  modelParamsB: number;
  targetTokensB: number;
  seqLength: number;
  precision: ComputePrecision;
  pricingModel: PricingModel;
  currentGpuType: string;
  currentGpuCount: number;
  calculatedTrainingHours: number;
  calculatedTrainingDays: number;
  calculatedCostUSD: number;
  onApplyCluster: (gpuType: string, gpuCount: number, mfuEstimate: number) => void;
}

export const HardwareBenchmark: React.FC<HardwareBenchmarkProps> = ({
  modelParamsB,
  targetTokensB,
  seqLength,
  precision,
  pricingModel,
  currentGpuType,
  currentGpuCount,
  calculatedTrainingHours,
  calculatedTrainingDays,
  calculatedCostUSD,
  onApplyCluster
}) => {
  const { isKm, tr } = useLanguage();
  const [familyFilter, setFamilyFilter] = useState<ArchitectureFamilyFilter>('all');
  const [targetSla, setTargetSla] = useState<TargetSlaPreset>('any');
  const [chartMetric, setChartMetric] = useState<'days' | 'cost'>('days');

  const maxSlaHours = useMemo(() => {
    if (targetSla === '7d') return 7 * 24;
    if (targetSla === '14d') return 14 * 24;
    if (targetSla === '30d') return 30 * 24;
    return Number.POSITIVE_INFINITY;
  }, [targetSla]);

  const evaluatedClusters = useMemo<EvaluatedCluster[]>(() => {
    const safeParamsB = Math.max(0.1, modelParamsB || 1.5);
    const safeTokensB = Math.max(1, targetTokensB || 45);
    const N = safeParamsB * 1e9;
    const D = safeTokensB * 1e9;
    const totalFlops = 6 * N * D;

    const bytesPerWeight = precision === 'int8' ? 1 : 2;
    const activationFactor = precision === 'int8' ? 0.65 : 1.0;
    const totalStateBytes = (bytesPerWeight * 2 + 12) * N; // weights + grads + FP32 AdamW

    const rawList = GPU_CLUSTER_CATALOG.map((cluster) => {
      const instance = CLOUD_INSTANCES[cluster.instanceId] || CLOUD_INSTANCES.gcp_a3_h100;
      const nodeCount = Math.max(1, Math.round(cluster.gpuCount / instance.acceleratorCount));
      const precMultiplier = getPrecisionMultiplier(instance, precision);
      const effectiveTflops = Math.round(
        instance.fp16Bf16Tflops * nodeCount * precMultiplier * cluster.expectedMfu
      );

      const totalSeconds = effectiveTflops > 0 ? totalFlops / (effectiveTflops * 1e12) : 0;
      const projectedHours = Math.max(0.1, Number((totalSeconds / 3600).toFixed(1)));
      const projectedDays = Math.max(0.01, Number((projectedHours / 24).toFixed(1)));
      const tokensPerSecond = totalSeconds > 0 ? Math.round(D / totalSeconds) : 0;

      let hourlyPerNode = instance.onDemandHourlyUSD;
      if (pricingModel === 'spot') {
        hourlyPerNode = instance.spotHourlyUSD;
      } else if (pricingModel === 'reserved_1yr') {
        hourlyPerNode = instance.reserved1yrHourlyUSD;
      }

      const hourlyCostUSD = Number((hourlyPerNode * nodeCount).toFixed(2));
      const computeCost = projectedHours * hourlyCostUSD;
      const projectedCostUSD = Math.round(computeCost * 1.06); // +6% checkpoint storage overhead

      const shardedStateGB = totalStateBytes / cluster.gpuCount / 1024 ** 3;
      const activationsEstGB = Math.min(18, (seqLength / 2048) * (safeParamsB * 1.5)) * activationFactor;
      const vramRequiredPerGpuGB = Number((shardedStateGB + activationsEstGB).toFixed(1));

      let vramStatus: 'optimal' | 'checkpointing' | 'oom_risk' = 'optimal';
      if (vramRequiredPerGpuGB > cluster.vramPerGpuGB * 0.92) {
        vramStatus = 'oom_risk';
      } else if (vramRequiredPerGpuGB > cluster.vramPerGpuGB * 0.68) {
        vramStatus = 'checkpointing';
      }

      const meetsSla = projectedHours <= maxSlaHours;
      const speedupVsCalculator =
        calculatedTrainingHours > 0
          ? Number((calculatedTrainingHours / projectedHours).toFixed(2))
          : 1;

      // Score clusters by model scale fitness + VRAM safety + duration alignment + cost efficiency
      let score = 100;
      if (vramStatus === 'oom_risk') score -= 65;
      else if (vramStatus === 'checkpointing') score -= 10;

      if (!meetsSla) score -= 45;

      // Penalize excessive multi-month runtimes or massive over-provisioning for small SLMs
      if (projectedDays > 45) score -= 25;
      if (safeParamsB <= 1.5 && cluster.gpuCount >= 64) score -= 22;
      if (safeParamsB >= 7 && cluster.gpuCount <= 8) score -= 28;
      if (cluster.gpuFamily === 'H100') score += 8; // Higher NVLink/HBM3 reliability & FP8/BF16 throughput

      // Cost efficiency adjustment
      const costRatio = calculatedCostUSD > 0 ? projectedCostUSD / calculatedCostUSD : 1;
      if (costRatio < 0.85) score += 10;
      else if (costRatio > 1.6) score -= 12;

      return {
        ...cluster,
        provider: instance.provider,
        projectedHours,
        projectedDays,
        projectedCostUSD,
        hourlyCostUSD,
        tokensPerSecond,
        effectiveTflops,
        vramRequiredPerGpuGB,
        vramStatus,
        speedupVsCalculator,
        meetsSla,
        recommendationScore: score,
        recommendationTier: 'standard' as EvaluatedCluster['recommendationTier'],
        rationale: '',
        rationaleKm: ''
      };
    });

    // Identify viable candidates and assign tiers
    const viable = rawList.filter((c) => c.vramStatus !== 'oom_risk' && c.meetsSla);
    const bestOverall = [...viable].sort((a, b) => b.recommendationScore - a.recommendationScore)[0];
    const fastestViable = [...viable].sort((a, b) => a.projectedHours - b.projectedHours)[0];
    const cheapestViable = [...viable].sort((a, b) => a.projectedCostUSD - b.projectedCostUSD)[0];

    return rawList.map((item) => {
      let recommendationTier: EvaluatedCluster['recommendationTier'] = 'standard';
      let rationale = `${item.projectedDays}d runtime at ${item.vramRequiredPerGpuGB} GB/GPU sharded footprint.`;
      let rationaleKm = `រយៈពេល ${item.projectedDays} ថ្ងៃ ដោយប្រើ ${item.vramRequiredPerGpuGB} GB/GPU ក្រោយការបែងចែក FSDP។`;

      if (item.vramStatus === 'oom_risk') {
        recommendationTier = 'unsuitable';
        rationale = `Exceeds ${item.vramPerGpuGB}GB/GPU envelope (${item.vramRequiredPerGpuGB} GB needed); requires larger GPU count or 80GB nodes.`;
        rationaleKm = `លើសកម្រិត ${item.vramPerGpuGB}GB/GPU (ត្រូវការ ${item.vramRequiredPerGpuGB} GB) — ត្រូវបន្ថែមចំនួន GPU ឬប្ដូរទៅ 80GB។`;
      } else if (!item.meetsSla) {
        recommendationTier = 'unsuitable';
        rationale = `Projected ${item.projectedDays} days exceeds your selected target duration SLA.`;
        rationaleKm = `រយៈពេលប៉ាន់ស្មាន ${item.projectedDays} ថ្ងៃ លើសកាលវិភាគគោលដៅដែលបានកំណត់។`;
      } else if (bestOverall && item.id === bestOverall.id) {
        recommendationTier = 'top_pick';
        rationale = `Optimal balance for ${safeParamsB}B parameters: ${item.projectedDays}d duration (${item.speedupVsCalculator}× vs active profile) with ${item.vramPerGpuGB}/${item.vramPerGpuGB} GB VRAM.`;
        rationaleKm = `សមស្របបំផុតសម្រាប់ទំហំ ${safeParamsB}B៖ ចំណាយ ${item.projectedDays} ថ្ងៃ (លឿន ${item.speedupVsCalculator}×) ជាមួយ ${item.vramRequiredPerGpuGB}/${item.vramPerGpuGB} GB VRAM។`;
      } else if (cheapestViable && item.id === cheapestViable.id) {
        recommendationTier = 'budget';
        rationale = `Lowest total compute expenditure ($${item.projectedCostUSD.toLocaleString()}) within your duration & VRAM bounds.`;
        rationaleKm = `ចំណាយសរុបទាបបំផុត ($${item.projectedCostUSD.toLocaleString()}) ក្នុងព្រំដែនរយៈពេល និង VRAM។`;
      } else if (fastestViable && item.id === fastestViable.id) {
        recommendationTier = 'fastest';
        rationale = `Shortest wall-clock turnaround (${item.projectedDays}d / ${item.projectedHours}h) at ${(item.tokensPerSecond / 1000).toFixed(1)}k tok/s.`;
        rationaleKm = `បញ្ចប់លឿនបំផុត (${item.projectedDays} ថ្ងៃ / ${item.projectedHours} ម៉ោង) ក្នុងល្បឿន ${(item.tokensPerSecond / 1000).toFixed(1)}k tok/s។`;
      }

      return {
        ...item,
        recommendationTier,
        rationale,
        rationaleKm
      };
    });
  }, [
    modelParamsB,
    targetTokensB,
    seqLength,
    precision,
    pricingModel,
    calculatedTrainingHours,
    calculatedCostUSD,
    maxSlaHours
  ]);

  const filteredClusters = useMemo(() => {
    return evaluatedClusters.filter((cluster) => {
      if (familyFilter !== 'all' && cluster.gpuFamily !== familyFilter) return false;
      return true;
    });
  }, [evaluatedClusters, familyFilter]);

  const topRecommendation = useMemo(() => {
    return (
      evaluatedClusters.find((c) => c.recommendationTier === 'top_pick') ||
      evaluatedClusters.find((c) => c.vramStatus !== 'oom_risk') ||
      evaluatedClusters[0]
    );
  }, [evaluatedClusters]);

  const chartData = useMemo(() => {
    return filteredClusters.map((c) => ({
      name: c.gpuLabel.replace('NVIDIA ', '').replace('SXM5 ', ''),
      gpuFamily: c.gpuFamily,
      days: c.projectedDays,
      costK: Number((c.projectedCostUSD / 1000).toFixed(2)),
      isTopPick: c.recommendationTier === 'top_pick',
      isUnsuitable: c.recommendationTier === 'unsuitable'
    }));
  }, [filteredClusters]);

  const getTierBadge = (tier: EvaluatedCluster['recommendationTier']) => {
    switch (tier) {
      case 'top_pick':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-300 font-mono">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>{tr('Recommended Cluster', 'ចង្កោមដែលណែនាំ')}</span>
          </span>
        );
      case 'fastest':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 font-mono">
            <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>{tr('Fastest SLA', 'លឿនបំផុត')}</span>
          </span>
        );
      case 'budget':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-cyan-300 font-mono">
            <DollarSign className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>{tr('Lowest Total Cost', 'ថ្លៃដើមទាបបំផុត')}</span>
          </span>
        );
      case 'unsuitable':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-300 font-mono">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <span>{tr('Constraint Mismatch', 'មិនត្រូវលក្ខខណ្ឌ')}</span>
          </span>
        );
      default:
        return (
          <span className="text-[11px] font-mono text-slate-400">
            {tr('Viable Option', 'ជម្រើសអាចប្រើបាន')}
          </span>
        );
    }
  };

  return (
    <section
      aria-labelledby="hardware-benchmark-heading"
      className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-6"
    >
      {/* Header & Live Scaling Context */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <div
            className={`flex flex-wrap items-center gap-2 text-xs font-semibold text-amber-400 ${
              isKm ? 'font-khmer' : 'font-mono uppercase tracking-wider'
            }`}
          >
            <Cpu className="w-3.5 h-3.5 shrink-0" />
            <span>{tr('NVIDIA A100 & H100 CLUSTER ADVISOR', 'ប្រឹក្សាចង្កោម GPU NVIDIA A100 & H100')}</span>
            <span aria-hidden="true" className="text-slate-600">
              ·
            </span>
            <span className="text-slate-300 font-mono tabular-nums">
              {modelParamsB}B {tr('Params', 'ប៉ារ៉ាម៉ែត្រ')} · {calculatedTrainingDays}d ({calculatedTrainingHours}h)
            </span>
          </div>
          <h3
            id="hardware-benchmark-heading"
            className={`text-xl font-bold text-white tracking-tight ${isKm ? 'font-khmer' : ''}`}
          >
            {tr(
              'Hardware Benchmark: Recommended A100 & H100 GPU Clusters',
              'ស្តង់ដារផ្នែករឹង៖ ការណែនាំចង្កោម GPU A100 និង H100'
            )}
          </h3>
          <p className={`text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed ${isKm ? 'font-khmer' : ''}`}>
            {tr(
              'Automatically benchmarks NVIDIA A100 (40GB/80GB) and H100 SXM5 topologies against your active Scaling Calculator model size, token target, VRAM sharding envelope, and wall-clock training duration.',
              'វាយតម្លៃដោយស្វ័យប្រវត្តិនូវចង្កោម NVIDIA A100 (40GB/80GB) និង H100 SXM5 ធៀបនឹងទំហំម៉ូដែល បរិមាណថូខិន ដែនកំណត់ VRAM និងរយៈពេលបង្វឹកដែលបានគណនាក្នុង Scaling Calculator។'
            )}
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950 border border-slate-800">
            {(
              [
                { id: 'all', label: tr('All (A100+H100)', 'ទាំងអស់ (A100+H100)') },
                { id: 'H100', label: 'H100 80GB' },
                { id: 'A100', label: 'A100 40/80GB' }
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setFamilyFilter(opt.id)}
                className={`px-2.5 py-1.5 rounded-lg text-xs transition-colors whitespace-nowrap shrink-0 ${
                  isKm ? 'font-khmer' : 'font-mono'
                } ${
                  familyFilter === opt.id
                    ? 'bg-amber-400 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              aria-label={tr('Target maximum training duration', 'កំណត់រយៈពេលបង្វឹកអតិបរមា')}
              value={targetSla}
              onChange={(e) => setTargetSla(e.target.value as TargetSlaPreset)}
              className={`bg-transparent text-slate-200 focus:outline-none cursor-pointer ${
                isKm ? 'font-khmer' : 'font-mono'
              }`}
            >
              <option value="any" className="bg-slate-950">
                {tr('SLA: Any Duration', 'កាលវិភាគ៖ គ្រប់រយៈពេល')}
              </option>
              <option value="7d" className="bg-slate-950">
                {tr('SLA: ≤ 7 Days', 'កាលវិភាគ៖ ≤ ៧ ថ្ងៃ')}
              </option>
              <option value="14d" className="bg-slate-950">
                {tr('SLA: ≤ 14 Days', 'កាលវិភាគ៖ ≤ ១៤ ថ្ងៃ')}
              </option>
              <option value="30d" className="bg-slate-950">
                {tr('SLA: ≤ 30 Days', 'កាលវិភាគ៖ ≤ ៣០ ថ្ងៃ')}
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* Top Primary Recommendation Strip */}
      {topRecommendation && (
        <div className="p-4 sm:p-5 rounded-xl border border-emerald-500/40 bg-emerald-950/15 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2 text-xs text-emerald-300 font-mono">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-bold">
                {tr('PRIMARY RECOMMENDED CLUSTER', 'ចង្កោមដែលណែនាំចម្បង')}
              </span>
              <span aria-hidden="true" className="text-slate-600">
                ·
              </span>
              <span>{topRecommendation.provider}</span>
              <span aria-hidden="true" className="text-slate-600">
                ·
              </span>
              <span className="tabular-nums">{topRecommendation.parallelismHint}</span>
            </div>
            <div className="text-lg font-bold text-white">{topRecommendation.gpuLabel}</div>
            <p className={`text-xs text-slate-300 ${isKm ? 'font-khmer' : ''}`}>
              {isKm ? topRecommendation.rationaleKm : topRecommendation.rationale}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 shrink-0">
            <div className="text-left lg:text-right font-mono tabular-nums">
              <div className="text-[11px] text-slate-400">{tr('Projected Duration', 'រយៈពេលប៉ាន់ស្មាន')}</div>
              <div className="text-base font-bold text-white">
                {topRecommendation.projectedDays}d{' '}
                <span className="text-xs font-normal text-slate-400">
                  ({topRecommendation.projectedHours}h)
                </span>
              </div>
            </div>
            <div className="text-left lg:text-right font-mono tabular-nums">
              <div className="text-[11px] text-slate-400">{tr('Est. Cluster Cost', 'ថ្លៃចង្កោមប៉ាន់ស្មាន')}</div>
              <div className="text-base font-bold text-amber-300">
                ${topRecommendation.projectedCostUSD.toLocaleString()}
              </div>
            </div>
            <button
              type="button"
              onClick={() =>
                onApplyCluster(
                  topRecommendation.instanceId,
                  topRecommendation.gpuCount,
                  topRecommendation.expectedMfu
                )
              }
              className={`px-3.5 py-2 rounded-lg text-xs font-bold bg-emerald-400 text-slate-950 hover:bg-emerald-300 transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                isKm ? 'font-khmer' : 'font-mono'
              }`}
            >
              <span>{tr('Apply to Calculator', 'អនុវត្តទៅម៉ាស៊ីនគណនា')}</span>
              <ArrowRight className="w-3.5 h-3.5 shrink-0" />
            </button>
          </div>
        </div>
      )}

      {/* Visual Benchmark Comparison Chart vs ScalingCalculator Duration */}
      <div className="space-y-3 pt-1">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className={`text-xs font-semibold text-slate-300 ${isKm ? 'font-khmer' : 'font-mono'}`}>
            {chartMetric === 'days'
              ? tr(
                  `Projected Training Duration (Days) vs. Active ScalingCalculator Baseline (${calculatedTrainingDays}d)`,
                  `រយៈពេលបង្វឹកប៉ាន់ស្មាន (ថ្ងៃ) ធៀបនឹងលទ្ធផលបច្ចុប្បន្ន (${calculatedTrainingDays} ថ្ងៃ)`
                )
              : tr(
                  'Projected Total Compute Expenditure ($k USD) Across A100 / H100 Topologies',
                  'ចំណាយគណនាសរុបប៉ាន់ស្មាន ($k USD) តាមចង្កោម A100 / H100'
                )}
          </div>

          <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-950 border border-slate-800 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setChartMetric('days')}
              className={`px-2.5 py-1 rounded text-[11px] font-mono transition-colors whitespace-nowrap shrink-0 ${
                chartMetric === 'days'
                  ? 'bg-cyan-400 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tr('Duration (Days)', 'រយៈពេល (ថ្ងៃ)')}
            </button>
            <button
              type="button"
              onClick={() => setChartMetric('cost')}
              className={`px-2.5 py-1 rounded text-[11px] font-mono transition-colors whitespace-nowrap shrink-0 ${
                chartMetric === 'cost'
                  ? 'bg-amber-400 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tr('Cost ($k USD)', 'ថ្លៃដើម ($k USD)')}
            </button>
          </div>
        </div>

        <div className="h-64 w-full rounded-xl border border-slate-800 bg-slate-950/60 p-3">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 20, left: 4, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey="name"
                tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }}
                axisLine={{ stroke: '#334155' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }}
                axisLine={{ stroke: '#334155' }}
                tickLine={false}
                unit={chartMetric === 'days' ? 'd' : 'k'}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#020617',
                  borderColor: '#334155',
                  borderRadius: '10px',
                  fontSize: '12px',
                  fontFamily: 'monospace'
                }}
                formatter={(value) => {
                  const num = Number(value ?? 0);
                  return chartMetric === 'days'
                    ? [`${num} ${tr('days', 'ថ្ងៃ')}`, tr('Duration', 'រយៈពេល')]
                    : [`$${(num * 1000).toLocaleString()}`, tr('Projected Cost', 'ថ្លៃប៉ាន់ស្មាន')];
                }}
              />
              {chartMetric === 'days' && (
                <ReferenceLine
                  y={calculatedTrainingDays}
                  stroke="#fbbf24"
                  strokeDasharray="4 4"
                  label={{
                    value: `${tr('Calculator', 'បច្ចុប្បន្ន')}: ${calculatedTrainingDays}d`,
                    fill: '#fbbf24',
                    fontSize: 11,
                    position: 'insideTopRight'
                  }}
                />
              )}
              <Bar dataKey={chartMetric === 'days' ? 'days' : 'costK'} radius={[6, 6, 0, 0]}>
                {chartData.map((entry, idx) => (
                  <Cell
                    key={idx}
                    fill={
                      entry.isUnsuitable
                        ? '#f43f5e'
                        : entry.isTopPick
                          ? '#34d399'
                          : entry.gpuFamily === 'H100'
                            ? '#fbbf24'
                            : '#38bdf8'
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed A100 / H100 Cluster Recommendations Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredClusters.map((cluster) => {
          const isCurrentActive =
            currentGpuType === cluster.instanceId && currentGpuCount === cluster.gpuCount;
          const borderClass =
            cluster.recommendationTier === 'top_pick'
              ? 'border-emerald-500/50 bg-slate-950/70'
              : cluster.recommendationTier === 'unsuitable'
                ? 'border-rose-500/30 bg-slate-950/40'
                : 'border-slate-800 bg-slate-950/60 hover:border-slate-700';

          return (
            <div
              key={cluster.id}
              className={`p-4 rounded-xl border transition-colors flex flex-col justify-between space-y-3 ${borderClass}`}
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  {getTierBadge(cluster.recommendationTier)}
                  <span className="text-[11px] font-mono text-slate-400 tabular-nums">
                    {cluster.provider} · {cluster.vramPerGpuGB}GB/GPU
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-white leading-snug">{cluster.gpuLabel}</h4>
                  <div className={`text-[11px] text-slate-400 mt-0.5 ${isKm ? 'font-khmer' : 'font-mono'}`}>
                    {isKm ? cluster.interconnectSummaryKm : cluster.interconnectSummary}
                  </div>
                </div>

                <p className={`text-xs text-slate-300 leading-relaxed ${isKm ? 'font-khmer' : ''}`}>
                  {isKm ? cluster.bestForSummaryKm : cluster.bestForSummary}
                </p>

                {/* Metrics Grid (tabular-nums, hairline border separation) */}
                <div className="grid grid-cols-2 gap-x-3 gap-y-2 pt-2 border-t border-slate-800/80 text-xs font-mono tabular-nums">
                  <div>
                    <div className="text-[10px] text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-cyan-400 shrink-0" />
                      <span>{tr('Duration', 'រយៈពេល')}</span>
                    </div>
                    <div className="text-white font-semibold">
                      {cluster.projectedDays}d ({cluster.projectedHours}h)
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-slate-500 flex items-center justify-end gap-1">
                      <DollarSign className="w-3 h-3 text-amber-400 shrink-0" />
                      <span>{tr('Est. Cost', 'ថ្លៃប៉ាន់ស្មាន')}</span>
                    </div>
                    <div className="text-amber-300 font-semibold">
                      ${cluster.projectedCostUSD.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500">{tr('FSDP VRAM/GPU', 'VRAM/GPU (FSDP)')}</div>
                    <div
                      className={`font-semibold ${
                        cluster.vramStatus === 'oom_risk'
                          ? 'text-rose-400'
                          : cluster.vramStatus === 'checkpointing'
                            ? 'text-amber-300'
                            : 'text-emerald-400'
                      }`}
                    >
                      {cluster.vramRequiredPerGpuGB} / {cluster.vramPerGpuGB} GB
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-slate-500">{tr('vs. Active Calc', 'ធៀបនឹងបច្ចុប្បន្ន')}</div>
                    <div
                      className={`font-semibold ${
                        cluster.speedupVsCalculator >= 1 ? 'text-emerald-400' : 'text-slate-300'
                      }`}
                    >
                      {cluster.speedupVsCalculator}× {tr('speed', 'ល្បឿន')}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <span className="text-[11px] font-mono text-slate-400 tabular-nums truncate">
                  ${cluster.hourlyCostUSD.toFixed(2)}/hr · {(cluster.tokensPerSecond / 1000).toFixed(1)}k tok/s
                </span>

                <button
                  type="button"
                  disabled={isCurrentActive}
                  onClick={() =>
                    onApplyCluster(cluster.instanceId, cluster.gpuCount, cluster.expectedMfu)
                  }
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-colors flex items-center gap-1 whitespace-nowrap shrink-0 ${
                    isKm ? 'font-khmer' : 'font-mono'
                  } ${
                    isCurrentActive
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 cursor-default'
                      : 'bg-slate-900 border border-slate-700 text-slate-200 hover:bg-amber-400 hover:text-slate-950 hover:border-amber-400'
                  }`}
                >
                  <Server className="w-3 h-3 shrink-0" />
                  <span>
                    {isCurrentActive
                      ? tr('Active Cluster', 'កំពុងប្រើ')
                      : tr('Use Cluster', 'ប្រើចង្កោមនេះ')}
                  </span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
