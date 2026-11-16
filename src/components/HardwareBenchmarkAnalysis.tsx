import React, { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';
import {
  Cpu,
  TrendingUp,
  DollarSign,
  CheckCircle2,
  Sliders,
  BarChart3,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { CLOUD_INSTANCES } from '../utils/scalingCalculator';

export type TransformerArchId =
  | 'llama_gqa_swiglu'
  | 'moe_8x1_5b'
  | 'long_context_8k'
  | 'standard_mha';

interface TransformerArchSpec {
  id: TransformerArchId;
  name: string;
  nameKm: string;
  shortName: string;
  shortNameKm: string;
  description: string;
  descriptionKm: string;
  // Historical GPU utilization efficiency (%) across 10 training progression milestones (0k..45k steps)
  curves: {
    stepLabel: string;
    h100: number;
    a100: number;
    tpuV4: number;
    tpuV5e: number;
    trainium: number;
  }[];
  computeEfficiencyNote: string;
  computeEfficiencyNoteKm: string;
}

interface HardwareOptionMeta {
  key: 'h100' | 'a100' | 'tpuV4' | 'tpuV5e' | 'trainium';
  instanceId: string;
  name: string;
  nameKm: string;
  color: string;
  recommendedCount: number;
  hourlyPerChipUSD: number;
  effectiveTflopsPerChip: number; // Dense BF16 TFLOPs per chip
}

const HARDWARE_OPTIONS: HardwareOptionMeta[] = [
  {
    key: 'h100',
    instanceId: 'gcp_a3_h100',
    name: 'NVIDIA H100 SXM5',
    nameKm: 'NVIDIA H100 SXM5',
    color: '#fbbf24', // amber-400
    recommendedCount: 16,
    hourlyPerChipUSD: CLOUD_INSTANCES.gcp_a3_h100.onDemandHourlyUSD / 8,
    effectiveTflopsPerChip: CLOUD_INSTANCES.gcp_a3_h100.fp16Bf16Tflops / 8
  },
  {
    key: 'tpuV4',
    instanceId: 'gcp_tpu_v4_16',
    name: 'Google TPU v4',
    nameKm: 'Google TPU v4',
    color: '#34d399', // emerald-400
    recommendedCount: 16,
    hourlyPerChipUSD: CLOUD_INSTANCES.gcp_tpu_v4_16.onDemandHourlyUSD / 16,
    effectiveTflopsPerChip: CLOUD_INSTANCES.gcp_tpu_v4_16.fp16Bf16Tflops / 16
  },
  {
    key: 'tpuV5e',
    instanceId: 'gcp_tpu_v5e_16',
    name: 'Google TPU v5e',
    nameKm: 'Google TPU v5e',
    color: '#22d3ee', // cyan-400
    recommendedCount: 16,
    hourlyPerChipUSD: CLOUD_INSTANCES.gcp_tpu_v5e_16.onDemandHourlyUSD / 16,
    effectiveTflopsPerChip: CLOUD_INSTANCES.gcp_tpu_v5e_16.fp16Bf16Tflops / 16
  },
  {
    key: 'a100',
    instanceId: 'aws_p4de_24xlarge',
    name: 'NVIDIA A100 80GB',
    nameKm: 'NVIDIA A100 80GB',
    color: '#a78bfa', // violet-400
    recommendedCount: 16,
    hourlyPerChipUSD: CLOUD_INSTANCES.aws_p4de_24xlarge.onDemandHourlyUSD / 8,
    effectiveTflopsPerChip: CLOUD_INSTANCES.aws_p4de_24xlarge.fp16Bf16Tflops / 8
  },
  {
    key: 'trainium',
    instanceId: 'aws_trn1_32xlarge',
    name: 'AWS Trainium (trn1)',
    nameKm: 'AWS Trainium (trn1)',
    color: '#f472b6', // pink-400
    recommendedCount: 16,
    hourlyPerChipUSD: CLOUD_INSTANCES.aws_trn1_32xlarge.onDemandHourlyUSD / 16,
    effectiveTflopsPerChip: CLOUD_INSTANCES.aws_trn1_32xlarge.fp16Bf16Tflops / 16
  }
];

const TRANSFORMER_BENCHMARKS: Record<TransformerArchId, TransformerArchSpec> = {
  llama_gqa_swiglu: {
    id: 'llama_gqa_swiglu',
    name: 'Dense Llama-3 (GQA 4:1 + SwiGLU + FlashAttn-2)',
    nameKm: 'Dense Llama-3 (GQA 4:1 + SwiGLU + FlashAttn-2)',
    shortName: 'Dense GQA',
    shortNameKm: 'Dense GQA',
    description:
      'Production 1.5B–7B dense architecture with grouped-query attention and fused RMSNorm/SwiGLU kernels. Achieves peak tensor core occupancy across modern clusters.',
    descriptionKm:
      'ស្ថាបត្យកម្ម Dense 1.5B–7B ស្តង់ដារផលិតកម្មជាមួយ GQA និង SwiGLU។ ផ្តល់ប្រសិទ្ធភាពប្រើប្រាស់ Tensor Core ខ្ពស់បំផុតលើចង្កោមទំនើប។',
    computeEfficiencyNote:
      'High compute intensity keeps Tensor Cores saturated; NVLink 4.0 and 3D Torus sustain 43%–49% MFU.',
    computeEfficiencyNoteKm:
      'ដង់ស៊ីតេគណនាខ្ពស់ជួយរក្សា Tensor Core ឱ្យពេញលេញ — NVLink 4.0 និង 3D Torus រក្សាបាន MFU 43%–49%។',
    curves: [
      { stepLabel: '2k', h100: 36, a100: 30, tpuV4: 35, tpuV5e: 33, trainium: 29 },
      { stepLabel: '5k', h100: 44, a100: 36, tpuV4: 41, tpuV5e: 38, trainium: 34 },
      { stepLabel: '10k', h100: 48, a100: 38, tpuV4: 44, tpuV5e: 41, trainium: 37 },
      { stepLabel: '15k', h100: 49, a100: 39, tpuV4: 45, tpuV5e: 42, trainium: 38 },
      { stepLabel: '20k', h100: 49, a100: 39, tpuV4: 44, tpuV5e: 41, trainium: 38 },
      { stepLabel: '25k', h100: 48, a100: 38, tpuV4: 44, tpuV5e: 42, trainium: 37 },
      { stepLabel: '30k', h100: 49, a100: 39, tpuV4: 45, tpuV5e: 41, trainium: 38 },
      { stepLabel: '35k', h100: 48, a100: 38, tpuV4: 44, tpuV5e: 41, trainium: 37 },
      { stepLabel: '40k', h100: 47, a100: 37, tpuV4: 43, tpuV5e: 40, trainium: 36 },
      { stepLabel: '45k', h100: 48, a100: 38, tpuV4: 44, tpuV5e: 41, trainium: 37 }
    ]
  },
  moe_8x1_5b: {
    id: 'moe_8x1_5b',
    name: 'Sparse Mixture-of-Experts (MoE 8×1.5B, Top-2)',
    nameKm: 'Sparse Mixture-of-Experts (MoE 8×1.5B, Top-2)',
    shortName: 'Sparse MoE',
    shortNameKm: 'Sparse MoE',
    description:
      'Sparse expert routing places heavy all-to-all token dispatch pressure on interconnects. High-bandwidth NVSwitch and 3D Torus outperform PCIe/2D topologies.',
    descriptionKm:
      'ការបញ្ជូនថូខិនឆ្លងកាត់ Expert ដាក់បន្ទុកខ្លាំងលើបណ្តាញតភ្ជាប់ Interconnect។ NVSwitch និង 3D Torus ដំណើរការលឿនជាង 2D Torus ឆ្ងាយ។',
    computeEfficiencyNote:
      'All-to-all token routing drops utilization 7–11 points vs dense models; H100 NVLink retains the sharpest edge.',
    computeEfficiencyNoteKm:
      'ការបញ្ជូនថូខិន All-to-all កាត់បន្ថយ MFU ៧–១១ ពិន្ទុធៀបនឹង Dense — ប៉ុន្តែ H100 NVLink រក្សាប្រសិទ្ធភាពខ្ពស់ជាងគេ។',
    curves: [
      { stepLabel: '2k', h100: 29, a100: 22, tpuV4: 28, tpuV5e: 23, trainium: 21 },
      { stepLabel: '5k', h100: 35, a100: 26, tpuV4: 33, tpuV5e: 27, trainium: 25 },
      { stepLabel: '10k', h100: 38, a100: 28, tpuV4: 35, tpuV5e: 29, trainium: 27 },
      { stepLabel: '15k', h100: 39, a100: 29, tpuV4: 36, tpuV5e: 29, trainium: 27 },
      { stepLabel: '20k', h100: 37, a100: 27, tpuV4: 34, tpuV5e: 28, trainium: 26 },
      { stepLabel: '25k', h100: 39, a100: 29, tpuV4: 35, tpuV5e: 29, trainium: 27 },
      { stepLabel: '30k', h100: 40, a100: 29, tpuV4: 36, tpuV5e: 30, trainium: 28 },
      { stepLabel: '35k', h100: 39, a100: 28, tpuV4: 35, tpuV5e: 29, trainium: 27 },
      { stepLabel: '40k', h100: 38, a100: 28, tpuV4: 35, tpuV5e: 28, trainium: 27 },
      { stepLabel: '45k', h100: 39, a100: 29, tpuV4: 36, tpuV5e: 29, trainium: 28 }
    ]
  },
  long_context_8k: {
    id: 'long_context_8k',
    name: 'Long-Context 8k–32k (RoPE Ring Attention)',
    nameKm: 'បរិបទវែង 8k–32k (RoPE Ring Attention)',
    shortName: 'Long-Context 8k+',
    shortNameKm: 'បរិបទវែង 8k+',
    description:
      'Extended context annealing doubles KV/activation memory traffic. HBM3 bandwidth (3.35 TB/s on H100) avoids memory-wall stalls seen on smaller HBM2 chips.',
    descriptionKm:
      'ការបង្វឹកបរិបទវែងបង្កើនការបញ្ជូនអង្គចងចាំ KV/Activation។ HBM3 លើ H100 ជៀសវាងការស្ទះអង្គចងចាំបានល្អបំផុត។',
    computeEfficiencyNote:
      'Notice the step-25k dip when sequence length ramps 4k → 16k; HBM3 and 80GB VRAM prevent OOM micro-batch reductions.',
    computeEfficiencyNoteKm:
      'សង្កេតការធ្លាក់ចុះនៅជំហាន 25k ពេលបង្កើនបរិបទពី 4k ទៅ 16k — HBM3 និង VRAM 80GB ការពារការធ្លាក់ល្បឿនខ្លាំង។',
    curves: [
      { stepLabel: '2k', h100: 37, a100: 31, tpuV4: 34, tpuV5e: 31, trainium: 29 },
      { stepLabel: '5k', h100: 44, a100: 36, tpuV4: 39, tpuV5e: 35, trainium: 33 },
      { stepLabel: '10k', h100: 46, a100: 37, tpuV4: 40, tpuV5e: 36, trainium: 34 },
      { stepLabel: '15k', h100: 46, a100: 37, tpuV4: 40, tpuV5e: 35, trainium: 34 },
      { stepLabel: '20k', h100: 45, a100: 36, tpuV4: 39, tpuV5e: 34, trainium: 33 },
      { stepLabel: '25k', h100: 42, a100: 32, tpuV4: 33, tpuV5e: 28, trainium: 29 },
      { stepLabel: '30k', h100: 43, a100: 33, tpuV4: 34, tpuV5e: 29, trainium: 30 },
      { stepLabel: '35k', h100: 44, a100: 34, tpuV4: 35, tpuV5e: 29, trainium: 30 },
      { stepLabel: '40k', h100: 44, a100: 34, tpuV4: 35, tpuV5e: 30, trainium: 31 },
      { stepLabel: '45k', h100: 45, a100: 34, tpuV4: 35, tpuV5e: 30, trainium: 31 }
    ]
  },
  standard_mha: {
    id: 'standard_mha',
    name: 'Legacy Dense MHA (Unfused LayerNorm + GELU)',
    nameKm: 'Dense MHA ជំនាន់ចាស់ (Unfused LayerNorm + GELU)',
    shortName: 'Legacy MHA',
    shortNameKm: 'Legacy MHA',
    description:
      'Classic multi-head attention without GQA or fused FlashAttention kernels. Higher memory bandwidth overhead caps utilization across all hardware.',
    descriptionKm:
      'ស្ថាបត្យកម្ម MHA ជំនាន់ចាស់គ្មាន GQA ឬ FlashAttention-2។ បន្ទុកអង្គចងចាំខ្ពស់ធ្វើឱ្យប្រសិទ្ធភាព MFU ទាបជាងគំរូទំនើប។',
    computeEfficiencyNote:
      'Unfused elementwise kernels leave 65%+ of FLOPs idle; upgrading to GQA + FlashAttention-2 yields +10% to +13% MFU.',
    computeEfficiencyNoteKm:
      'Kernel មិនបានរួមបញ្ចូលទុកឱ្យ ៦៥%+ នៃ FLOPs នៅទំនេរ — ការប្តូរទៅ GQA + FlashAttention-2 បង្កើន MFU +១០% ដល់ +១៣%។',
    curves: [
      { stepLabel: '2k', h100: 28, a100: 24, tpuV4: 27, tpuV5e: 25, trainium: 22 },
      { stepLabel: '5k', h100: 33, a100: 28, tpuV4: 31, tpuV5e: 29, trainium: 26 },
      { stepLabel: '10k', h100: 35, a100: 29, tpuV4: 33, tpuV5e: 30, trainium: 27 },
      { stepLabel: '15k', h100: 35, a100: 30, tpuV4: 33, tpuV5e: 31, trainium: 28 },
      { stepLabel: '20k', h100: 34, a100: 29, tpuV4: 32, tpuV5e: 30, trainium: 27 },
      { stepLabel: '25k', h100: 35, a100: 29, tpuV4: 33, tpuV5e: 30, trainium: 28 },
      { stepLabel: '30k', h100: 35, a100: 30, tpuV4: 33, tpuV5e: 31, trainium: 28 },
      { stepLabel: '35k', h100: 34, a100: 29, tpuV4: 32, tpuV5e: 30, trainium: 27 },
      { stepLabel: '40k', h100: 34, a100: 29, tpuV4: 32, tpuV5e: 30, trainium: 27 },
      { stepLabel: '45k', h100: 35, a100: 29, tpuV4: 33, tpuV5e: 30, trainium: 28 }
    ]
  }
};

interface HardwareBenchmarkAnalysisProps {
  modelParamsB: number;
  currentGpuType: string;
  currentProjectedCostUSD: number;
  onApplyHardware: (gpuType: string, gpuCount: number, mfuEstimate: number) => void;
}

export const HardwareBenchmarkAnalysis: React.FC<HardwareBenchmarkAnalysisProps> = ({
  modelParamsB,
  currentGpuType,
  currentProjectedCostUSD,
  onApplyHardware
}) => {
  const { isKm, tr } = useLanguage();
  const [selectedArch, setSelectedArch] = useState<TransformerArchId>('llama_gqa_swiglu');
  const [chartTab, setChartTab] = useState<'historical' | 'architecture_matrix'>('historical');
  const [computeBudgetUSD, setComputeBudgetUSD] = useState<number>(25000);

  const archSpec = TRANSFORMER_BENCHMARKS[selectedArch];

  // Cross-architecture average MFU comparison data for BarChart
  const architectureMatrixData = useMemo(() => {
    return (Object.values(TRANSFORMER_BENCHMARKS) as TransformerArchSpec[]).map((arch) => {
      const avg = (key: HardwareOptionMeta['key']) =>
        Number(
          (arch.curves.reduce((acc, pt) => acc + pt[key], 0) / arch.curves.length).toFixed(1)
        );
      return {
        id: arch.id,
        label: isKm ? arch.shortNameKm : arch.shortName,
        h100: avg('h100'),
        tpuV4: avg('tpuV4'),
        tpuV5e: avg('tpuV5e'),
        a100: avg('a100'),
        trainium: avg('trainium')
      };
    });
  }, [isKm]);

  // Compute budget analysis per hardware accelerator for the active architecture
  const budgetRankings = useMemo(() => {
    const N = Math.max(0.1, modelParamsB || 1.5) * 1e9;
    const rows = HARDWARE_OPTIONS.map((hw) => {
      const values = archSpec.curves.map((c) => c[hw.key]);
      const meanMfuPct = Number(
        (values.reduce((sum, v) => sum + v, 0) / values.length).toFixed(1)
      );
      const peakMfuPct = Math.max(...values);
      const meanMfuDecimal = meanMfuPct / 100;

      // Hours affordable on a 16-chip node with computeBudgetUSD (leaving 6% storage buffer)
      const computeOnlyBudget = computeBudgetUSD / 1.06;
      const clusterHourlyUSD = hw.hourlyPerChipUSD * hw.recommendedCount;
      const affordableHours = Number((computeOnlyBudget / clusterHourlyUSD).toFixed(1));
      const affordableGpuHours = Math.round(affordableHours * hw.recommendedCount);

      // Total deliverable FLOPs & Chinchilla tokens within computeBudgetUSD
      const effectiveTflopsCluster =
        hw.effectiveTflopsPerChip * hw.recommendedCount * meanMfuDecimal;
      const totalFlopsDeliverable = effectiveTflopsCluster * 1e12 * (affordableHours * 3600);
      const deliverableTokensB = Number(
        (totalFlopsDeliverable / (6 * N) / 1e9).toFixed(1)
      );

      // Tokens per $1,000 spent
      const tokensBPer1kUSD = Number(
        ((deliverableTokensB / Math.max(1, computeBudgetUSD)) * 1000).toFixed(2)
      );

      // Score combines deliverable tokens/$ and sustained MFU stability
      const compositeEfficiencyScore = tokensBPer1kUSD * 10 + meanMfuPct * 0.25;

      return {
        ...hw,
        meanMfuPct,
        peakMfuPct,
        meanMfuDecimal,
        clusterHourlyUSD: Number(clusterHourlyUSD.toFixed(2)),
        affordableHours,
        affordableGpuHours,
        deliverableTokensB,
        tokensBPer1kUSD,
        compositeEfficiencyScore,
        isCurrentHardware: currentGpuType === hw.instanceId
      };
    });

    const sorted = [...rows].sort(
      (a, b) => b.compositeEfficiencyScore - a.compositeEfficiencyScore
    );
    const optimalId = sorted[0]?.instanceId;

    return sorted.map((r) => ({
      ...r,
      isOptimal: r.instanceId === optimalId
    }));
  }, [archSpec, computeBudgetUSD, modelParamsB, currentGpuType]);

  const optimalHardware = budgetRankings[0];

  return (
    <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="space-y-1">
          <div
            className={`inline-flex items-center gap-2 text-xs font-semibold text-amber-400 tracking-wider ${
              isKm ? 'font-khmer' : 'uppercase font-mono'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>
              {tr(
                'HARDWARE BENCHMARK ANALYSIS',
                'ការវិភាគសមត្ថភាពផ្នែករឹងប្រៀបធៀប'
              )}
            </span>
          </div>
          <h3 className={`text-lg sm:text-xl font-bold text-white ${isKm ? 'font-khmer' : ''}`}>
            {tr(
              'Historical GPU Utilization Efficiency Across Transformer Architectures',
              'ប្រសិទ្ធភាពប្រើប្រាស់ GPU តាមដំណាក់កាលបង្វឹកសម្រាប់ស្ថាបត្យកម្ម Transformer'
            )}
          </h3>
          <p className={`text-xs text-slate-400 max-w-3xl ${isKm ? 'font-khmer' : ''}`}>
            {tr(
              'Inspect how sustained Model FLOPs Utilization (MFU %) evolves across 45k training steps for different transformer families, and rank hardware by deliverable tokens within your compute budget.',
              'ពិនិត្យមើលការប្រែប្រួលនៃអត្រា MFU % ឆ្លងកាត់ 45k ជំហានបង្វឹកសម្រាប់ស្ថាបត្យកម្ម Transformer នីមួយៗ និងចាត់ថ្នាក់ផ្នែករឹងល្អបំផុតតាមថវិកាគណនារបស់អ្នក។'
            )}
          </p>
        </div>

        {/* Chart Mode Toggle */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950 border border-slate-800 shrink-0 self-start lg:self-auto">
          <button
            type="button"
            onClick={() => setChartTab('historical')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors whitespace-nowrap shrink-0 ${
              isKm ? 'font-khmer' : 'font-mono'
            } ${
              chartTab === 'historical'
                ? 'bg-amber-400 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{tr('Historical Curves', 'ខ្សែកោងតាមជំហាន')}</span>
          </button>

          <button
            type="button"
            onClick={() => setChartTab('architecture_matrix')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors whitespace-nowrap shrink-0 ${
              isKm ? 'font-khmer' : 'font-mono'
            } ${
              chartTab === 'architecture_matrix'
                ? 'bg-amber-400 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>{tr('Architecture Matrix', 'ប្រៀបធៀបស្ថាបត្យកម្ម')}</span>
          </button>
        </div>
      </div>

      {/* Controls: Transformer Architecture Selector + Compute Budget Selector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Transformer Architecture Picker */}
        <div className="lg:col-span-7 p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span className={`flex items-center gap-1.5 ${isKm ? 'font-khmer' : ''}`}>
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>{tr('Transformer Architecture Profile:', 'ទម្រង់ស្ថាបត្យកម្ម Transformer៖')}</span>
            </span>
            <span className="text-[11px] font-mono text-cyan-300">
              {isKm ? archSpec.shortNameKm : archSpec.shortName}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            {(Object.values(TRANSFORMER_BENCHMARKS) as TransformerArchSpec[]).map((arch) => {
              const active = selectedArch === arch.id;
              return (
                <button
                  key={arch.id}
                  type="button"
                  onClick={() => setSelectedArch(arch.id)}
                  className={`px-2.5 py-2 rounded-lg text-xs border transition-colors whitespace-nowrap truncate ${
                    isKm ? 'font-khmer' : 'font-mono'
                  } ${
                    active
                      ? 'bg-cyan-400 text-slate-950 font-bold border-cyan-400'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  {isKm ? arch.shortNameKm : arch.shortName}
                </button>
              );
            })}
          </div>

          <p className={`text-[11px] text-slate-400 leading-relaxed ${isKm ? 'font-khmer' : ''}`}>
            {isKm ? archSpec.descriptionKm : archSpec.description}
          </p>
        </div>

        {/* Compute Budget Selector */}
        <div className="lg:col-span-5 p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span className={`flex items-center gap-1.5 ${isKm ? 'font-khmer' : ''}`}>
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              <span>{tr('Target Compute Budget:', 'ថវិកាគណនាគោលដៅ៖')}</span>
            </span>
            <span className="font-mono text-emerald-400 font-bold tabular-nums">
              ${computeBudgetUSD.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Sliders className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <input
              type="range"
              aria-label={tr('Target Compute Budget USD', 'ថវិកាគណនាគោលដៅ USD')}
              min={5000}
              max={150000}
              step={2500}
              value={computeBudgetUSD}
              onChange={(e) => setComputeBudgetUSD(Number(e.target.value))}
              className="w-full accent-emerald-400 cursor-pointer"
            />
          </div>

          <div className="flex flex-wrap gap-1.5">
            {[10000, 25000, 50000, 100000].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setComputeBudgetUSD(preset)}
                className={`px-2 py-1 rounded text-[11px] font-mono tabular-nums transition-colors ${
                  computeBudgetUSD === preset
                    ? 'bg-emerald-400 text-slate-950 font-bold'
                    : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                ${(preset / 1000).toFixed(0)}k
              </button>
            ))}
            <button
              type="button"
              onClick={() =>
                setComputeBudgetUSD(
                  Math.max(5000, Math.min(150000, Math.round(currentProjectedCostUSD / 500) * 500))
                )
              }
              className={`px-2 py-1 rounded text-[11px] border border-amber-400/40 bg-amber-400/10 text-amber-300 hover:bg-amber-400/20 transition-colors whitespace-nowrap ${
                isKm ? 'font-khmer' : 'font-mono'
              }`}
            >
              {tr('Match Current Run', 'ស្មើថ្លៃដើមបច្ចុប្បន្ន')}
            </button>
          </div>
        </div>
      </div>

      {/* Optimal Hardware Recommendation Banner for Current Budget */}
      {optimalHardware && (
        <div className="p-4 rounded-xl border border-emerald-500/40 bg-emerald-950/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-emerald-300 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className={isKm ? 'font-khmer' : 'font-mono uppercase'}>
                {tr(
                  `Optimal Hardware for $${computeBudgetUSD.toLocaleString()} Budget`,
                  `ផ្នែករឹងល្អបំផុតសម្រាប់ថវិកា $${computeBudgetUSD.toLocaleString()}`
                )}
              </span>
              <span aria-hidden="true" className="text-emerald-700">·</span>
              <span className="font-mono text-white font-bold">{optimalHardware.name}</span>
            </div>
            <p className={`text-xs text-slate-300 ${isKm ? 'font-khmer' : ''}`}>
              {isKm ? (
                <>
                  ផលិតបានរហូតដល់ <strong className="text-emerald-300 font-mono tabular-nums">{optimalHardware.deliverableTokensB}B ថូខិន</strong> ({optimalHardware.tokensBPer1kUSD}B/$1k) លើម៉ូដែល {modelParamsB}B ជាមួយ MFU មធ្យម <strong className="text-amber-300 font-mono tabular-nums">{optimalHardware.meanMfuPct}%</strong> និង {optimalHardware.affordableGpuHours.toLocaleString()} ម៉ោង GPU។
                </>
              ) : (
                <>
                  Delivers <strong className="text-emerald-300 font-mono tabular-nums">{optimalHardware.deliverableTokensB}B tokens</strong> ({optimalHardware.tokensBPer1kUSD}B per $1k) at <strong className="text-amber-300 font-mono tabular-nums">{optimalHardware.meanMfuPct}% mean MFU</strong> across {optimalHardware.affordableGpuHours.toLocaleString()} affordable GPU hours for a {modelParamsB}B model.
                </>
              )}
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              onApplyHardware(
                optimalHardware.instanceId,
                optimalHardware.recommendedCount,
                Number(optimalHardware.meanMfuDecimal.toFixed(2))
              )
            }
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold bg-emerald-400 text-slate-950 hover:bg-emerald-300 transition-colors whitespace-nowrap shrink-0 ${
              isKm ? 'font-khmer' : 'font-mono'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>{tr('Apply Optimal Hardware', 'ប្រើផ្នែករឹងល្អបំផុតនេះ')}</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Recharts Visualization Canvas */}
      <div className="w-full h-[350px] rounded-xl border border-slate-800 bg-slate-950/70 p-3 sm:p-4">
        <ResponsiveContainer width="100%" height="100%">
          {chartTab === 'historical' ? (
            <LineChart
              data={archSpec.curves}
              margin={{ top: 16, right: 20, left: 4, bottom: 12 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey="stepLabel"
                stroke="#64748b"
                tick={{ fill: '#cbd5e1', fontSize: 11, fontFamily: 'monospace' }}
                label={{
                  value: isKm ? 'ជំហានបង្វឹកប្រវត្តិសាស្ត្រ (Steps)' : 'Training Step Progression',
                  position: 'insideBottom',
                  offset: -8,
                  fill: '#64748b',
                  fontSize: 11
                }}
              />
              <YAxis
                domain={[15, 55]}
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }}
                tickFormatter={(v) => `${v}%`}
                label={{
                  value: 'MFU %',
                  angle: -90,
                  position: 'insideLeft',
                  fill: '#94a3b8',
                  fontSize: 11
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#020617',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  fontSize: '12px'
                }}
                formatter={(value: unknown, name: unknown) => [`${value}% MFU`, String(name)]}
                labelFormatter={(label) =>
                  isKm ? `ជំហានបង្វឹក៖ ${label}` : `Benchmark Step: ${label}`
                }
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              <ReferenceLine
                y={40}
                stroke="#475569"
                strokeDasharray="4 4"
                label={{
                  value: isKm ? 'គោលដៅប្រសិទ្ធភាព HPC 40%' : '40% HPC Efficiency Target',
                  position: 'right',
                  fill: '#94a3b8',
                  fontSize: 10
                }}
              />
              {HARDWARE_OPTIONS.map((hw) => (
                <Line
                  key={hw.key}
                  type="monotone"
                  dataKey={hw.key}
                  name={isKm ? hw.nameKm : hw.name}
                  stroke={hw.color}
                  strokeWidth={currentGpuType === hw.instanceId ? 3 : 2}
                  dot={{ r: 3, fill: hw.color }}
                  activeDot={{ r: 5 }}
                />
              ))}
            </LineChart>
          ) : (
            <BarChart
              data={architectureMatrixData}
              margin={{ top: 16, right: 20, left: 4, bottom: 12 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis
                dataKey="label"
                stroke="#64748b"
                tick={{ fill: '#cbd5e1', fontSize: 11 }}
              />
              <YAxis
                domain={[0, 55]}
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip
                cursor={{ fill: 'rgba(148, 163, 184, 0.08)' }}
                contentStyle={{
                  backgroundColor: '#020617',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  fontSize: '12px'
                }}
                formatter={(value: unknown, name: unknown) => [`${value}% Mean MFU`, String(name)]}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              {HARDWARE_OPTIONS.map((hw) => (
                <Bar
                  key={hw.key}
                  dataKey={hw.key}
                  name={isKm ? hw.nameKm : hw.name}
                  fill={hw.color}
                  radius={[4, 4, 0, 0]}
                  barSize={20}
                />
              ))}
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Compute Budget Fit Ranking Table */}
      <div className="space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <span className={`font-semibold text-slate-300 ${isKm ? 'font-khmer' : ''}`}>
            {tr(
              `Hardware Efficiency & Deliverable Tokens for $${computeBudgetUSD.toLocaleString()} (${modelParamsB}B Model)`,
              `ប្រសិទ្ធភាពផ្នែករឹង និងថូខិនសម្រេចបានក្នុងថវិកា $${computeBudgetUSD.toLocaleString()} (ម៉ូដែល ${modelParamsB}B)`
            )}
          </span>
          <span className={`text-[11px] text-slate-400 ${isKm ? 'font-khmer' : 'font-mono'}`}>
            {isKm ? archSpec.computeEfficiencyNoteKm : archSpec.computeEfficiencyNote}
          </span>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950/70 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950 text-slate-400">
                  <th className={`py-2.5 px-4 font-semibold ${isKm ? 'font-khmer' : 'font-mono'}`}>
                    {tr('Hardware Accelerator', 'ឧបករណ៍បង្កើនល្បឿន')}
                  </th>
                  <th className={`py-2.5 px-3 font-semibold text-right ${isKm ? 'font-khmer' : 'font-mono'}`}>
                    {tr('Mean MFU', 'MFU មធ្យម')}
                  </th>
                  <th className={`py-2.5 px-3 font-semibold text-right ${isKm ? 'font-khmer' : 'font-mono'}`}>
                    {tr('Peak MFU', 'MFU កំពូល')}
                  </th>
                  <th className={`py-2.5 px-3 font-semibold text-right ${isKm ? 'font-khmer' : 'font-mono'}`}>
                    {tr('Budget GPU-Hrs', 'ម៉ោង GPU')}
                  </th>
                  <th className={`py-2.5 px-3 font-semibold text-right ${isKm ? 'font-khmer' : 'font-mono'}`}>
                    {tr('Deliverable Tokens', 'ថូខិនសម្រេចបាន')}
                  </th>
                  <th className={`py-2.5 px-3 font-semibold text-right ${isKm ? 'font-khmer' : 'font-mono'}`}>
                    {tr('Tokens / $1k', 'ថូខិន / $1k')}
                  </th>
                  <th className={`py-2.5 px-4 font-semibold text-right ${isKm ? 'font-khmer' : 'font-mono'}`}>
                    {tr('Select', 'ជ្រើសរើស')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70 font-mono">
                {budgetRankings.map((row) => (
                  <tr
                    key={row.instanceId}
                    className={`transition-colors ${
                      row.isOptimal
                        ? 'bg-emerald-950/20 hover:bg-emerald-950/30'
                        : 'hover:bg-slate-900/70'
                    }`}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-sm shrink-0"
                          style={{ backgroundColor: row.color }}
                          aria-hidden="true"
                        />
                        <span className="font-semibold text-white">
                          {isKm ? row.nameKm : row.name}
                        </span>
                        {row.isOptimal && (
                          <span
                            className={`text-[10px] font-bold text-emerald-400 ${
                              isKm ? 'font-khmer' : 'font-mono'
                            }`}
                          >
                            · {tr('Optimal Pick', 'ល្អបំផុត')}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right text-amber-300 font-semibold tabular-nums">
                      {row.meanMfuPct}%
                    </td>
                    <td className="py-3 px-3 text-right text-slate-300 tabular-nums">
                      {row.peakMfuPct}%
                    </td>
                    <td className="py-3 px-3 text-right text-slate-300 tabular-nums">
                      {row.affordableGpuHours.toLocaleString()} h
                    </td>
                    <td className="py-3 px-3 text-right text-emerald-400 font-bold tabular-nums">
                      {row.deliverableTokensB}B
                    </td>
                    <td className="py-3 px-3 text-right text-cyan-300 tabular-nums">
                      {row.tokensBPer1kUSD}B
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() =>
                          onApplyHardware(
                            row.instanceId,
                            row.recommendedCount,
                            Number(row.meanMfuDecimal.toFixed(2))
                          )
                        }
                        className={`px-2.5 py-1 rounded text-[11px] transition-colors whitespace-nowrap ${
                          isKm ? 'font-khmer' : 'font-mono'
                        } ${
                          row.isCurrentHardware
                            ? 'bg-amber-400 text-slate-950 font-bold'
                            : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                        }`}
                      >
                        {row.isCurrentHardware
                          ? tr('Active', 'កំពុងប្រើ')
                          : tr('Use Hardware', 'ប្រើផ្នែករឹង')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
