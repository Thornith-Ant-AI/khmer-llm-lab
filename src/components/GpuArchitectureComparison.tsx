import React, { useState, useMemo } from 'react';
import {
  Cpu,
  Layers,
  TrendingUp,
  Activity,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export interface ArchitectureBenchmark {
  archId: 'h100' | 'a100' | 'tpu_v4';
  name: string;
  provider: string;
  chipModel: string;
  generation: string;
  vramGB: number;
  memoryType: string;
  memoryBandwidthTBps: number;
  peakBf16Tflops: number;
  peakFp8Tflops?: number;
  interconnect: string;
  interconnectBandwidth: string;
  tdpWatts: number;
  onDemandHourlyPerChipUSD: number;
  spotHourlyPerChipUSD: number;
  softwareStack: string;
}

export const ARCHITECTURES: Record<string, ArchitectureBenchmark> = {
  h100: {
    archId: 'h100',
    name: 'NVIDIA H100 SXM5',
    provider: 'GCP A3 / AWS p5 / Lambda',
    chipModel: 'Hopper GH100 SXM5 80GB',
    generation: 'Hopper (4nm TSMC)',
    vramGB: 80,
    memoryType: 'HBM3',
    memoryBandwidthTBps: 3.35,
    peakBf16Tflops: 989, // Dense BF16
    peakFp8Tflops: 1979, // FP8 Transformer Engine
    interconnect: 'NVLink 4.0 + NVSwitch',
    interconnectBandwidth: '900 GB/s bidirectional per GPU (3.2 Tbps node)',
    tdpWatts: 700,
    onDemandHourlyPerChipUSD: 3.85,
    spotHourlyPerChipUSD: 1.54,
    softwareStack: 'PyTorch FSDP-2 / Megatron-Core / FlashAttention-2 / TransformerEngine'
  },
  a100: {
    archId: 'a100',
    name: 'NVIDIA A100 SXM4',
    provider: 'AWS p4de / GCP A2',
    chipModel: 'Ampere GA100 SXM4 80GB',
    generation: 'Ampere (7nm TSMC)',
    vramGB: 80,
    memoryType: 'HBM2e',
    memoryBandwidthTBps: 2.04,
    peakBf16Tflops: 312,
    peakFp8Tflops: undefined,
    interconnect: 'NVLink 3.0',
    interconnectBandwidth: '600 GB/s bidirectional per GPU (400 Gbps EFA)',
    tdpWatts: 400,
    onDemandHourlyPerChipUSD: 4.10,
    spotHourlyPerChipUSD: 1.43,
    softwareStack: 'PyTorch FSDP / DeepSpeed ZeRO-3 / Megatron-LM'
  },
  tpu_v4: {
    archId: 'tpu_v4',
    name: 'Google TPU v4',
    provider: 'Google Cloud Platform (GCP)',
    chipModel: 'Custom VLIW Matrix Coprocessor',
    generation: 'TPU v4 (7nm Custom ASIC)',
    vramGB: 32,
    memoryType: 'HBM2',
    memoryBandwidthTBps: 1.20,
    peakBf16Tflops: 275,
    peakFp8Tflops: undefined,
    interconnect: 'Optical 3D Torus Interconnect',
    interconnectBandwidth: '4.8 Tbps per chip optical wrap-around mesh',
    tdpWatts: 250,
    onDemandHourlyPerChipUSD: 3.22,
    spotHourlyPerChipUSD: 1.35,
    softwareStack: 'Google JAX / MaxText / XLA Compiler Graph Fusion / Paxml'
  }
};

export interface ModelSizeSpec {
  paramsB: number;
  label: string;
  labelKm: string;
  category: string;
  categoryKm: string;
  recommendedTokensB: number;
  description: string;
  descriptionKm: string;
  defaultMfu: {
    h100: number;
    a100: number;
    tpu_v4: number;
  };
  parallelismStrategy: {
    h100: string;
    a100: string;
    tpu_v4: string;
  };
}

export const BENCHMARK_MODEL_SIZES: ModelSizeSpec[] = [
  {
    paramsB: 0.5,
    label: '0.5B Parameters',
    labelKm: '0.5B ប៉ារ៉ាម៉ែត្រ',
    category: 'Edge & Mobile SLM',
    categoryKm: 'SLM សម្រាប់ឧបករណ៍ចល័ត និង Edge',
    recommendedTokensB: 20,
    description: 'Ultra-compact model for on-device Cambodian smartphone deployment and offline edge translation.',
    descriptionKm: 'ម៉ូដែលតូចបំផុតសម្រាប់ដំណើរការលើស្មាតហ្វូនកម្ពុជា និងការបកប្រែក្រៅបណ្ដាញ។',
    defaultMfu: { h100: 0.46, a100: 0.37, tpu_v4: 0.42 },
    parallelismStrategy: {
      h100: 'Pure FSDP (100% fitting in single GPU VRAM)',
      a100: 'Pure FSDP / DDP',
      tpu_v4: 'Data Parallelism with XLA SPMD'
    }
  },
  {
    paramsB: 1.5,
    label: '1.5B Parameters',
    labelKm: '1.5B ប៉ារ៉ាម៉ែត្រ',
    category: 'Khmer Foundation Baseline',
    categoryKm: 'មូលដ្ឋានគ្រឹះភាសាខ្មែរ',
    recommendedTokensB: 45,
    description: 'Core project baseline: optimal reasoning-to-compute ratio for sovereign national Khmer pretraining.',
    descriptionKm: 'មូលដ្ឋានគម្រោងស្នូល៖ សមាមាត្រវែកញែកធៀបនឹងថាមពលគណនាល្អបំផុតសម្រាប់ការបង្វឹកភាសាខ្មែរជាតិ។',
    defaultMfu: { h100: 0.45, a100: 0.36, tpu_v4: 0.41 },
    parallelismStrategy: {
      h100: 'FSDP-2 with FlashAttention-2 (No activation checkpointing needed)',
      a100: 'FSDP with standard BF16 sharding',
      tpu_v4: 'FSDP sharding across 3D Torus slice'
    }
  },
  {
    paramsB: 3.0,
    label: '3.0B Parameters',
    labelKm: '3.0B ប៉ារ៉ាម៉ែត្រ',
    category: 'Bilingual Balanced Scale',
    categoryKm: 'ទំហំតុល្យភាពពីរភាសា',
    recommendedTokensB: 80,
    description: 'High-capability bilingual Khmer-English model supporting complex administrative legal reasoning.',
    descriptionKm: 'ម៉ូដែលពីរភាសាខ្មែរ-អង់គ្លេសសមត្ថភាពខ្ពស់ គាំទ្រការវិភាគផ្នែកច្បាប់ និងរដ្ឋបាលស្មុគស្មាញ។',
    defaultMfu: { h100: 0.44, a100: 0.35, tpu_v4: 0.40 },
    parallelismStrategy: {
      h100: 'FSDP-2 with selective activation checkpointing',
      a100: 'FSDP with activation checkpointing',
      tpu_v4: 'FSDP + activation checkpointing (approaching 32GB VRAM envelope)'
    }
  },
  {
    paramsB: 7.0,
    label: '7.0B Parameters',
    labelKm: '7.0B ប៉ារ៉ាម៉ែត្រ',
    category: 'Enterprise Production Grade',
    categoryKm: 'កម្រិតផលិតកម្មសហគ្រាស',
    recommendedTokensB: 150,
    description: 'LLaMA-3 / Mistral grade scale. Industry standard for Cambodian enterprise code and STEM generation.',
    descriptionKm: 'ទំហំកម្រិត LLaMA-3 / Mistral។ ស្តង់ដារឧស្សាហកម្មសម្រាប់កូដ និងការបង្កើត STEM របស់សហគ្រាសកម្ពុជា។',
    defaultMfu: { h100: 0.43, a100: 0.34, tpu_v4: 0.39 },
    parallelismStrategy: {
      h100: 'FSDP-2 (fits comfortably in 80GB HBM3 without TP)',
      a100: 'FSDP / ZeRO-3 (fits in 80GB HBM2e)',
      tpu_v4: 'Tensor Parallelism (TP=2) + DP (required for 32GB VRAM envelope)'
    }
  },
  {
    paramsB: 13.0,
    label: '13.0B Parameters',
    labelKm: '13.0B ប៉ារ៉ាម៉ែត្រ',
    category: 'High-Capacity Foundation',
    categoryKm: 'មូលដ្ឋានសមត្ថភាពខ្ពស់',
    recommendedTokensB: 300,
    description: 'Maximum sovereign scale. Requires multi-node tensor parallelism and multi-rack networking.',
    descriptionKm: 'ទំហំអធិបតេយ្យអតិបរមា។ ទាមទារ Tensor Parallelism ឆ្លងណូដច្រើន និងបណ្ដាញល្បឿនលឿន។',
    defaultMfu: { h100: 0.42, a100: 0.33, tpu_v4: 0.38 },
    parallelismStrategy: {
      h100: 'Tensor Parallelism (TP=2) + FSDP-2 via NVLink 4.0',
      a100: 'Tensor Parallelism (TP=2) + FSDP via NVLink 3.0',
      tpu_v4: 'Tensor Parallelism (TP=4) + DP via 3D Torus Optical Mesh'
    }
  }
];

interface GpuArchitectureComparisonProps {
  currentParamsB?: number;
  currentTargetTokensB?: number;
  onApplyPreset?: (gpuType: string, count: number, mfu: number) => void;
}

export const GpuArchitectureComparison: React.FC<GpuArchitectureComparisonProps> = ({
  currentParamsB = 1.5,
  currentTargetTokensB = 45,
  onApplyPreset
}) => {
  const { isKm, tr } = useLanguage();
  const [selectedParamsFilter, setSelectedParamsFilter] = useState<number | 'all'>('all');
  const [clusterAcceleratorCount, setClusterAcceleratorCount] = useState<number>(16);
  const [targetTokensOverrideB, setTargetTokensOverrideB] = useState<number>(currentTargetTokensB);
  const [activeTab, setActiveTab] = useState<'matrix' | 'specs' | 'efficiency'>('matrix');

  // Keep targetTokensOverrideB in sync if parent target changes
  React.useEffect(() => {
    setTargetTokensOverrideB(currentTargetTokensB);
  }, [currentTargetTokensB]);

  // Compute benchmarks across all sizes and architectures
  const benchmarkData = useMemo(() => {
    const list: Array<{
      model: ModelSizeSpec;
      h100: {
        throughputPerChip: number;
        totalClusterThroughput: number;
        trainingHours: number;
        trainingDays: number;
        costPerBillionUSD: number;
        totalRunCostUSD: number;
        speedupVsA100: number;
        effectiveTflops: number;
      };
      a100: {
        throughputPerChip: number;
        totalClusterThroughput: number;
        trainingHours: number;
        trainingDays: number;
        costPerBillionUSD: number;
        totalRunCostUSD: number;
        speedupVsA100: number;
        effectiveTflops: number;
      };
      tpu_v4: {
        throughputPerChip: number;
        totalClusterThroughput: number;
        trainingHours: number;
        trainingDays: number;
        costPerBillionUSD: number;
        totalRunCostUSD: number;
        speedupVsA100: number;
        effectiveTflops: number;
      };
    }> = [];

    const tokensToUse = Math.max(1, targetTokensOverrideB);

    BENCHMARK_MODEL_SIZES.forEach((model) => {
      const N = model.paramsB * 1e9;
      const D = tokensToUse * 1e9;
      const totalFlops = 6 * N * D;

      // H100 calculation
      const h100Mfu = model.defaultMfu.h100;
      const h100EffectiveTflopsPerChip = ARCHITECTURES.h100.peakBf16Tflops * h100Mfu;
      const h100ThroughputPerChip = Math.round((h100EffectiveTflopsPerChip * 1e12) / (6 * N));
      const h100ClusterThroughput = h100ThroughputPerChip * clusterAcceleratorCount;
      const h100ClusterEffectiveFlops = h100EffectiveTflopsPerChip * clusterAcceleratorCount * 1e12;
      const h100TrainingHours = totalFlops / (h100ClusterEffectiveFlops * 3600);
      const h100ClusterHourlyCost = ARCHITECTURES.h100.onDemandHourlyPerChipUSD * clusterAcceleratorCount;
      const h100TotalCost = Math.round(h100TrainingHours * h100ClusterHourlyCost * 1.06); // +6% storage
      const h100CostPerBillion = Number((h100TotalCost / tokensToUse).toFixed(2));

      // A100 calculation
      const a100Mfu = model.defaultMfu.a100;
      const a100EffectiveTflopsPerChip = ARCHITECTURES.a100.peakBf16Tflops * a100Mfu;
      const a100ThroughputPerChip = Math.round((a100EffectiveTflopsPerChip * 1e12) / (6 * N));
      const a100ClusterThroughput = a100ThroughputPerChip * clusterAcceleratorCount;
      const a100ClusterEffectiveFlops = a100EffectiveTflopsPerChip * clusterAcceleratorCount * 1e12;
      const a100TrainingHours = totalFlops / (a100ClusterEffectiveFlops * 3600);
      const a100ClusterHourlyCost = ARCHITECTURES.a100.onDemandHourlyPerChipUSD * clusterAcceleratorCount;
      const a100TotalCost = Math.round(a100TrainingHours * a100ClusterHourlyCost * 1.06);
      const a100CostPerBillion = Number((a100TotalCost / tokensToUse).toFixed(2));

      // TPU v4 calculation
      const tpuMfu = model.defaultMfu.tpu_v4;
      const tpuEffectiveTflopsPerChip = ARCHITECTURES.tpu_v4.peakBf16Tflops * tpuMfu;
      const tpuThroughputPerChip = Math.round((tpuEffectiveTflopsPerChip * 1e12) / (6 * N));
      const tpuClusterThroughput = tpuThroughputPerChip * clusterAcceleratorCount;
      const tpuClusterEffectiveFlops = tpuEffectiveTflopsPerChip * clusterAcceleratorCount * 1e12;
      const tpuTrainingHours = totalFlops / (tpuClusterEffectiveFlops * 3600);
      const tpuClusterHourlyCost = ARCHITECTURES.tpu_v4.onDemandHourlyPerChipUSD * clusterAcceleratorCount;
      const tpuTotalCost = Math.round(tpuTrainingHours * tpuClusterHourlyCost * 1.06);
      const tpuCostPerBillion = Number((tpuTotalCost / tokensToUse).toFixed(2));

      list.push({
        model,
        h100: {
          throughputPerChip: h100ThroughputPerChip,
          totalClusterThroughput: h100ClusterThroughput,
          trainingHours: Number(h100TrainingHours.toFixed(1)),
          trainingDays: Number((h100TrainingHours / 24).toFixed(1)),
          costPerBillionUSD: h100CostPerBillion,
          totalRunCostUSD: h100TotalCost,
          speedupVsA100: Number((h100ThroughputPerChip / a100ThroughputPerChip).toFixed(2)),
          effectiveTflops: Math.round(h100EffectiveTflopsPerChip)
        },
        a100: {
          throughputPerChip: a100ThroughputPerChip,
          totalClusterThroughput: a100ClusterThroughput,
          trainingHours: Number(a100TrainingHours.toFixed(1)),
          trainingDays: Number((a100TrainingHours / 24).toFixed(1)),
          costPerBillionUSD: a100CostPerBillion,
          totalRunCostUSD: a100TotalCost,
          speedupVsA100: 1.0,
          effectiveTflops: Math.round(a100EffectiveTflopsPerChip)
        },
        tpu_v4: {
          throughputPerChip: tpuThroughputPerChip,
          totalClusterThroughput: tpuClusterThroughput,
          trainingHours: Number(tpuTrainingHours.toFixed(1)),
          trainingDays: Number((tpuTrainingHours / 24).toFixed(1)),
          costPerBillionUSD: tpuCostPerBillion,
          totalRunCostUSD: tpuTotalCost,
          speedupVsA100: Number((tpuThroughputPerChip / a100ThroughputPerChip).toFixed(2)),
          effectiveTflops: Math.round(tpuEffectiveTflopsPerChip)
        }
      });
    });

    return list;
  }, [targetTokensOverrideB, clusterAcceleratorCount]);

  const filteredBenchmarks = useMemo(() => {
    if (selectedParamsFilter === 'all') return benchmarkData;
    return benchmarkData.filter((b) => b.model.paramsB === selectedParamsFilter);
  }, [benchmarkData, selectedParamsFilter]);

  return (
    <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider font-mono">
            <Cpu className="w-3.5 h-3.5" />
            <span>{tr('ACCELERATOR ARCHITECTURE BENCHMARK MATRIX', 'តារាងវាស់ស្ទង់ស្ថាបត្យកម្មឧបករណ៍បង្កើនល្បឿន')}</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>{tr('HPC PERFORMANCE EVALUATION', 'ការវាយតម្លៃសមត្ថភាព HPC')}</span>
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight">
            {tr('NVIDIA H100 vs A100 vs Google TPU v4 Architecture Benchmarks', 'ការប្រៀបធៀបស្ថាបត្យកម្ម NVIDIA H100 ធៀប A100 ធៀប Google TPU v4')}
          </h3>
          <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">
            {tr(
              'Empirical throughput, scaling efficiency, and dollar cost comparisons across model scales (0.5B to 13B parameters) on equivalent accelerator clusters.',
              'ការប្រៀបធៀបល្បឿនទិន្នន័យ ប្រសិទ្ធភាពមាត្រដ្ឋាន និងថ្លៃដើមជាប្រាក់ដុល្លារនៅលើទំហំម៉ូដែលពី 0.5B ដល់ 13B ប៉ារ៉ាម៉ែត្រ លើចង្កោមឈីបប្រហាក់ប្រហែល។'
            )}
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800 self-start lg:self-auto font-mono text-xs">
          <button
            onClick={() => setActiveTab('matrix')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'matrix'
                ? 'bg-amber-400 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tr('Performance Matrix', 'តារាងសមត្ថភាព')}
          </button>
          <button
            onClick={() => setActiveTab('specs')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'specs'
                ? 'bg-cyan-400 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tr('Silicon Specifications', 'លក្ខណៈសម្បត្តិឈីប')}
          </button>
          <button
            onClick={() => setActiveTab('efficiency')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'efficiency'
                ? 'bg-emerald-400 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tr('Cost & Speedup Ratios', 'សមាមាត្រថ្លៃ និងល្បឿន')}
          </button>
        </div>
      </div>

      {/* Interactive Controls Ribbon */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs">
        {/* Model Scale Filter */}
        <div className="space-y-1.5">
          <label className="text-slate-400 font-mono text-[11px] flex items-center justify-between">
            <span>{tr('MODEL SIZE FILTER:', 'តម្រងទំហំម៉ូដែល៖')}</span>
            <span className="text-amber-400">
              {selectedParamsFilter === 'all'
                ? tr('All 5 Scales', 'ទាំង 5 ទំហំ')
                : `${selectedParamsFilter}B ${tr('Active', 'កំពុងជ្រើស')}`}
            </span>
          </label>
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => setSelectedParamsFilter('all')}
              className={`px-2.5 py-1 rounded text-[11px] font-mono transition-colors ${
                selectedParamsFilter === 'all'
                  ? 'bg-amber-400 text-slate-950 font-bold'
                  : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              {tr('All', 'ទាំងអស់')}
            </button>
            {BENCHMARK_MODEL_SIZES.map((m) => (
              <button
                key={m.paramsB}
                onClick={() => setSelectedParamsFilter(m.paramsB)}
                className={`px-2.5 py-1 rounded text-[11px] font-mono transition-colors ${
                  selectedParamsFilter === m.paramsB
                    ? 'bg-amber-400 text-slate-950 font-bold'
                    : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                {m.paramsB}B
              </button>
            ))}
          </div>
        </div>

        {/* Cluster Accelerator Count */}
        <div className="space-y-1.5">
          <label className="text-slate-400 font-mono text-[11px] flex items-center justify-between">
            <span>{tr('CLUSTER ACCELERATOR COUNT:', 'ចំនួនឈីបក្នុងចង្កោម៖')}</span>
            <span className="text-cyan-400 font-bold">{clusterAcceleratorCount} {tr('Chips', 'ឈីប')}</span>
          </label>
          <div className="flex gap-1">
            {[8, 16, 32, 64, 128].map((count) => (
              <button
                key={count}
                onClick={() => setClusterAcceleratorCount(count)}
                className={`flex-1 py-1 rounded text-[11px] font-mono transition-colors ${
                  clusterAcceleratorCount === count
                    ? 'bg-cyan-400 text-slate-950 font-bold'
                    : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                {count}x
              </button>
            ))}
          </div>
        </div>

        {/* Target Pretraining Tokens */}
        <div className="space-y-1.5">
          <label className="text-slate-400 font-mono text-[11px] flex items-center justify-between">
            <span>{tr('CORPUS TOKEN VOLUME:', 'បរិមាណថូខិនឃ្លាំងអត្ថបទ៖')}</span>
            <span className="text-emerald-400 font-bold">{targetTokensOverrideB}B {tr('Tokens', 'ថូខិន')}</span>
          </label>
          <div className="flex gap-1.5 items-center">
            <input
              type="number"
              min="1"
              max="1000"
              value={targetTokensOverrideB}
              onChange={(e) => setTargetTokensOverrideB(Math.max(1, parseFloat(e.target.value) || 1))}
              className="w-24 py-1 px-2 text-xs font-mono rounded bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-400"
            />
            <div className="flex gap-1 flex-1">
              {[20, 45, 100, 300].map((t) => (
                <button
                  key={t}
                  onClick={() => setTargetTokensOverrideB(t)}
                  className={`flex-1 py-1 rounded text-[11px] font-mono transition-colors ${
                    targetTokensOverrideB === t
                      ? 'bg-emerald-400 text-slate-950 font-bold'
                      : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  {t}B
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* TAB 1: PERFORMANCE MATRIX TABLE */}
      {activeTab === 'matrix' && (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 text-slate-400 font-mono text-[11px] border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">{tr('Model Scale & Category', 'ទំហំ និងប្រភេទម៉ូដែល')}</th>
                  <th className="py-3 px-4">{tr('Metric', 'រង្វាស់')}</th>
                  <th className="py-3 px-4 text-emerald-300">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span>NVIDIA H100 (80GB)</span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-normal">Hopper · 989 BF16 TFLOPS</div>
                  </th>
                  <th className="py-3 px-4 text-cyan-300">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-cyan-400" />
                      <span>NVIDIA A100 (80GB)</span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-normal">Ampere · 312 BF16 TFLOPS</div>
                  </th>
                  <th className="py-3 px-4 text-amber-300">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      <span>Google TPU v4 (32GB)</span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-normal">VLIW · 275 BF16 TFLOPS</div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
                {filteredBenchmarks.map((b) => (
                  <React.Fragment key={b.model.paramsB}>
                    {/* Header row for Model Scale */}
                    <tr className="bg-slate-900/40 border-t-2 border-slate-800">
                      <td colSpan={5} className="py-2.5 px-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm">{isKm ? b.model.labelKm : b.model.label}</span>
                            <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                              {isKm ? b.model.categoryKm : b.model.category}
                            </span>
                            {b.model.paramsB === currentParamsB && (
                              <span className="px-2 py-0.5 rounded text-[10px] bg-amber-400/20 text-amber-300 border border-amber-400/40">
                                {tr('Current Calculator Target', 'គោលដៅគណនាបច្ចុប្បន្ន')}
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400 font-sans hidden sm:inline">
                            {isKm ? b.model.descriptionKm : b.model.description}
                          </span>
                        </div>
                      </td>
                    </tr>

                    {/* Row 1: Throughput (tok/sec/chip) */}
                    <tr className="hover:bg-slate-900/30 transition-colors">
                      <td className="py-2.5 px-4 text-slate-400 font-sans text-[11px]" rowSpan={4}>
                        <div className="space-y-1">
                          <div className="font-semibold text-white font-mono">{b.model.paramsB}B {tr('Model', 'ម៉ូដែល')}</div>
                          <div className="text-slate-500 text-[10px]">
                            {clusterAcceleratorCount} {tr('chips cluster', 'ឈីបក្នុងចង្កោម')} · {targetTokensOverrideB}B {tr('tokens', 'ថូខិន')}
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 px-4 text-slate-300">
                        <div className="font-semibold">{tr('Throughput / Accelerator', 'ល្បឿន / ឧបករណ៍បង្កើនល្បឿន')}</div>
                        <div className="text-[10px] text-slate-500 font-sans">{tr('Tokens/sec per chip', 'ថូខិន/វិនាទី ក្នុងមួយឈីប')}</div>
                      </td>
                      <td className="py-2.5 px-4 text-emerald-300 font-bold tabular-nums">
                        {b.h100.throughputPerChip.toLocaleString()} tok/s
                        <span className="ml-2 px-1.5 py-0.2 rounded text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800">
                          {b.h100.speedupVsA100}x A100
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-slate-300 tabular-nums">
                        {b.a100.throughputPerChip.toLocaleString()} tok/s
                        <span className="ml-2 text-[10px] text-slate-500">1.0x ({tr('Ref', 'យោង')})</span>
                      </td>
                      <td className="py-2.5 px-4 text-amber-300 tabular-nums">
                        {b.tpu_v4.throughputPerChip.toLocaleString()} tok/s
                        <span className="ml-2 px-1.5 py-0.2 rounded text-[10px] bg-amber-950 text-amber-400 border border-amber-800">
                          {b.tpu_v4.speedupVsA100}x A100
                        </span>
                      </td>
                    </tr>

                    {/* Row 2: Cluster Throughput */}
                    <tr className="hover:bg-slate-900/30 transition-colors">
                      <td className="py-2 px-4 text-slate-300">
                        <div className="font-semibold">{tr('Cluster Throughput', 'ល្បឿនចង្កោមសរុប')}</div>
                        <div className="text-[10px] text-slate-500 font-sans">{tr('Across', 'លើ')} {clusterAcceleratorCount} {tr('accelerators', 'ឈីប')}</div>
                      </td>
                      <td className="py-2 px-4 text-emerald-400 font-bold tabular-nums">
                        {(b.h100.totalClusterThroughput / 1000).toFixed(1)}k tok/s
                      </td>
                      <td className="py-2 px-4 text-slate-300 tabular-nums">
                        {(b.a100.totalClusterThroughput / 1000).toFixed(1)}k tok/s
                      </td>
                      <td className="py-2 px-4 text-amber-300 tabular-nums">
                        {(b.tpu_v4.totalClusterThroughput / 1000).toFixed(1)}k tok/s
                      </td>
                    </tr>

                    {/* Row 3: Training Duration */}
                    <tr className="hover:bg-slate-900/30 transition-colors">
                      <td className="py-2 px-4 text-slate-300">
                        <div className="font-semibold">{tr('Training Duration', 'រយៈពេលបង្វឹក')}</div>
                        <div className="text-[10px] text-slate-500 font-sans">{tr('To complete', 'ដើម្បីបញ្ចប់')} {targetTokensOverrideB}B {tr('tokens', 'ថូខិន')}</div>
                      </td>
                      <td className="py-2 px-4 text-emerald-300 font-bold tabular-nums">
                        {b.h100.trainingDays} {tr('days', 'ថ្ងៃ')} ({b.h100.trainingHours} {tr('hrs', 'ម៉')})
                      </td>
                      <td className="py-2 px-4 text-slate-300 tabular-nums">
                        {b.a100.trainingDays} {tr('days', 'ថ្ងៃ')} ({b.a100.trainingHours} {tr('hrs', 'ម៉')})
                      </td>
                      <td className="py-2 px-4 text-amber-300 tabular-nums">
                        {b.tpu_v4.trainingDays} {tr('days', 'ថ្ងៃ')} ({b.tpu_v4.trainingHours} {tr('hrs', 'ម៉')})
                      </td>
                    </tr>

                    {/* Row 4: Total Project Cost */}
                    <tr className="hover:bg-slate-900/30 transition-colors">
                      <td className="py-2.5 px-4 text-slate-300">
                        <div className="font-semibold">{tr('Total Cost (On-Demand)', 'ថ្លៃដើមសរុប (On-Demand)')}</div>
                        <div className="text-[10px] text-slate-500 font-sans">{tr('Includes 6% checkpoint storage', 'រួមបញ្ចូលការផ្ទុកទិន្នន័យ 6%')}</div>
                      </td>
                      <td className="py-2.5 px-4 text-emerald-400 font-bold tabular-nums">
                        ${b.h100.totalRunCostUSD.toLocaleString()}
                        <div className="text-[10px] text-slate-400 font-normal">
                          ${b.h100.costPerBillionUSD}/1B {tr('tokens', 'ថូខិន')}
                        </div>
                      </td>
                      <td className="py-2.5 px-4 text-slate-300 tabular-nums">
                        ${b.a100.totalRunCostUSD.toLocaleString()}
                        <div className="text-[10px] text-slate-500 font-normal">
                          ${b.a100.costPerBillionUSD}/1B {tr('tokens', 'ថូខិន')}
                        </div>
                      </td>
                      <td className="py-2.5 px-4 text-amber-300 font-bold tabular-nums">
                        ${b.tpu_v4.totalRunCostUSD.toLocaleString()}
                        <div className="text-[10px] text-slate-400 font-normal">
                          ${b.tpu_v4.costPerBillionUSD}/1B {tr('tokens', 'ថូខិន')}
                        </div>
                      </td>
                    </tr>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {/* Action Callout & Quick Presets */}
          {onApplyPreset && (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-slate-300">
                  {tr(
                    'Quickly set the active calculator instance based on verified benchmarks:',
                    'កំណត់ម៉ាស៊ីនគណនាដែលកំពុងប្រើយ៉ាងរហ័សដោយផ្អែកលើការវាស់ស្ទង់ដែលបានបញ្ជាក់៖'
                  )}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onApplyPreset('gcp_a3_h100', clusterAcceleratorCount, 0.45)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 font-mono text-xs transition-colors"
                >
                  {tr('Apply H100', 'ប្រើ H100')} ({clusterAcceleratorCount}x)
                </button>
                <button
                  onClick={() => onApplyPreset('gcp_tpu_v4_16', clusterAcceleratorCount, 0.41)}
                  className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 font-mono text-xs transition-colors"
                >
                  {tr('Apply TPU v4', 'ប្រើ TPU v4')} ({clusterAcceleratorCount}x)
                </button>
                <button
                  onClick={() => onApplyPreset('aws_p4d_24xlarge', clusterAcceleratorCount, 0.36)}
                  className="px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/30 font-mono text-xs transition-colors"
                >
                  {tr('Apply A100', 'ប្រើ A100')} ({clusterAcceleratorCount}x)
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SILICON SPECIFICATIONS & ARCHITECTURE */}
      {activeTab === 'specs' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* H100 Card */}
          <div className="p-5 rounded-2xl bg-slate-950 border border-emerald-800/40 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h4 className="text-sm font-bold text-emerald-400 font-mono">NVIDIA H100 SXM5</h4>
                <span className="text-[11px] text-slate-400">{tr('Hopper Generation · 4nm TSMC', 'ជំនាន់ Hopper · 4nm TSMC')}</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
                {tr('FASTEST SPEED', 'ល្បឿនលឿនបំផុត')}
              </span>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-slate-900">
                <span className="text-slate-400">{tr('Dense BF16 Compute:', 'គណនា BF16 ក្រាស់៖')}</span>
                <span className="text-white font-bold">989 TFLOPS</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-900">
                <span className="text-slate-400">{tr('FP8 Tensor Engine:', 'ម៉ាស៊ីន FP8 Tensor៖')}</span>
                <span className="text-emerald-300 font-bold">1,979 TFLOPS ({tr('2x speed', 'ល្បឿន 2x')})</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-900">
                <span className="text-slate-400">{tr('VRAM per GPU:', 'VRAM ក្នុងមួយ GPU៖')}</span>
                <span className="text-white">80 GB HBM3</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-900">
                <span className="text-slate-400">{tr('Memory Bandwidth:', 'ល្បឿនផ្ទេរអង្គចងចាំ៖')}</span>
                <span className="text-white font-bold">3,350 GB/s (3.35 TB/s)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-900">
                <span className="text-slate-400">{tr('Interconnect:', 'ការតភ្ជាប់៖')}</span>
                <span className="text-white">NVLink 4 (900 GB/s bi-dir)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-900">
                <span className="text-slate-400">{tr('Thermal Design Power (TDP):', 'កម្លាំងថាមពលកម្ដៅ (TDP)៖')}</span>
                <span className="text-white">700 {tr('Watts / GPU', 'វ៉ាត់ / GPU')}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">{tr('Typical Pretraining MFU:', 'MFU បង្វឹកធម្មតា៖')}</span>
                <span className="text-emerald-400 font-bold">42% - 48%</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-300 space-y-1">
              <div className="font-bold text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{tr('Hopper Key Advantage', 'គុណសម្បត្តិសំខាន់របស់ Hopper')}</span>
              </div>
              <p className="leading-relaxed text-slate-400">
                {tr(
                  'Transformer Engine with native FP8 GEMMs cuts training wall-clock time by ~4x vs A100. 3.35 TB/s HBM3 eliminates FlashAttention memory bottlenecks on long Khmer contexts.',
                  'ម៉ាស៊ីន Transformer ដែលមាន FP8 GEMMs ដើម កាត់បន្ថយពេលវេលាបង្វឹក ~4x ធៀបនឹង A100។ 3.35 TB/s HBM3 លុបបំបាត់ភាពកកស្ទះអង្គចងចាំ FlashAttention លើបរិបទភាសាខ្មែរវែងៗ។'
                )}
              </p>
            </div>
          </div>

          {/* A100 Card */}
          <div className="p-5 rounded-2xl bg-slate-950 border border-cyan-800/40 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h4 className="text-sm font-bold text-cyan-400 font-mono">NVIDIA A100 SXM4</h4>
                <span className="text-[11px] text-slate-400">{tr('Ampere Generation · 7nm TSMC', 'ជំនាន់ Ampere · 7nm TSMC')}</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">
                {tr('BASELINE WORKHORSE', 'ម៉ាស៊ីនមូលដ្ឋានស្ថិរភាព')}
              </span>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-slate-900">
                <span className="text-slate-400">{tr('Dense BF16 Compute:', 'គណនា BF16 ក្រាស់៖')}</span>
                <span className="text-white font-bold">312 TFLOPS</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-900">
                <span className="text-slate-400">{tr('FP8 Tensor Engine:', 'ម៉ាស៊ីន FP8 Tensor៖')}</span>
                <span className="text-slate-500">{tr('Not Supported (BF16 only)', 'មិនគាំទ្រ (BF16 ប៉ុណ្ណោះ)')}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-900">
                <span className="text-slate-400">{tr('VRAM per GPU:', 'VRAM ក្នុងមួយ GPU៖')}</span>
                <span className="text-white">80 GB HBM2e</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-900">
                <span className="text-slate-400">{tr('Memory Bandwidth:', 'ល្បឿនផ្ទេរអង្គចងចាំ៖')}</span>
                <span className="text-white">2,039 GB/s (2.04 TB/s)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-900">
                <span className="text-slate-400">{tr('Interconnect:', 'ការតភ្ជាប់៖')}</span>
                <span className="text-white">NVLink 3 (600 GB/s bi-dir)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-900">
                <span className="text-slate-400">{tr('Thermal Design Power (TDP):', 'កម្លាំងថាមពលកម្ដៅ (TDP)៖')}</span>
                <span className="text-white">400 {tr('Watts / GPU', 'វ៉ាត់ / GPU')}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">{tr('Typical Pretraining MFU:', 'MFU បង្វឹកធម្មតា៖')}</span>
                <span className="text-cyan-400 font-bold">34% - 38%</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-300 space-y-1">
              <div className="font-bold text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>{tr('Ampere Key Advantage', 'គុណសម្បត្តិសំខាន់របស់ Ampere')}</span>
              </div>
              <p className="leading-relaxed text-slate-400">
                {tr(
                  'Battle-tested stability across all PyTorch / HuggingFace libraries. High availability in cloud datacenters, though superseded in cost-per-token efficiency by H100.',
                  'ស្ថិរភាពដែលបានសាកល្បងល្អបំផុតលើបណ្ណាល័យ PyTorch / HuggingFace ទាំងអស់។ ងាយស្រួលរកបាននៅមជ្ឈមណ្ឌលទិន្នន័យពពក ទោះបីជាចាញ់ប្រៀប H100 លើតម្លៃក្នុងមួយថូខិនក៏ដោយ។'
                )}
              </p>
            </div>
          </div>

          {/* TPU v4 Card */}
          <div className="p-5 rounded-2xl bg-slate-950 border border-amber-800/40 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h4 className="text-sm font-bold text-amber-400 font-mono">Google Cloud TPU v4</h4>
                <span className="text-[11px] text-slate-400">{tr('Custom VLIW ASIC · 7nm', 'ឈីប VLIW ASIC ផ្ទាល់ខ្លួន · 7nm')}</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-950 text-amber-300 border border-amber-800 font-bold">
                {tr('SCALE-OUT EFFICIENCY', 'ប្រសិទ្ធភាពពង្រីកចង្កោម')}
              </span>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-slate-900">
                <span className="text-slate-400">{tr('Dense BF16 Compute:', 'គណនា BF16 ក្រាស់៖')}</span>
                <span className="text-white font-bold">275 TFLOPS / {tr('chip', 'ឈីប')}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-900">
                <span className="text-slate-400">{tr('FP8 Tensor Engine:', 'ម៉ាស៊ីន FP8 Tensor៖')}</span>
                <span className="text-slate-500">{tr('Not Supported', 'មិនគាំទ្រ')}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-900">
                <span className="text-slate-400">{tr('VRAM per Chip:', 'VRAM ក្នុងមួយឈីប៖')}</span>
                <span className="text-amber-300 font-bold">32 GB HBM2 ({tr('Requires TP at 7B', 'ទាមទារ TP នៅ 7B')})</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-900">
                <span className="text-slate-400">{tr('Memory Bandwidth:', 'ល្បឿនផ្ទេរអង្គចងចាំ៖')}</span>
                <span className="text-white">1,200 GB/s (1.2 TB/s)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-900">
                <span className="text-slate-400">{tr('Interconnect:', 'ការតភ្ជាប់៖')}</span>
                <span className="text-white">Optical 3D Torus (4.8 Tbps)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-900">
                <span className="text-slate-400">{tr('Thermal Design Power (TDP):', 'កម្លាំងថាមពលកម្ដៅ (TDP)៖')}</span>
                <span className="text-white">~250 {tr('Watts / chip', 'វ៉ាត់ / ឈីប')}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">{tr('Typical Pretraining MFU:', 'MFU បង្វឹកធម្មតា៖')}</span>
                <span className="text-amber-400 font-bold">38% - 44%</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-300 space-y-1">
              <div className="font-bold text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                <span>{tr('TPU Key Advantage', 'គុណសម្បត្តិសំខាន់របស់ TPU')}</span>
              </div>
              <p className="leading-relaxed text-slate-400">
                {tr(
                  'Lowest power consumption per chip and ultra-low latency Optical Circuit Switches (OCS). With JAX / MaxText, graph compilation eliminates Python GIL bottlenecks during all-reduce steps.',
                  'ការប្រើប្រាស់ថាមពលទាបបំផុតក្នុងមួយឈីប និងកុងតាក់អុបទិកភាពយឺតយ៉ាវទាប (OCS)។ ជាមួយ JAX / MaxText ការចងក្រងក្រាហ្វជួយលុបបំបាត់ភាពកកស្ទះ Python GIL អំឡុងពេល all-reduce។'
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: COST & SPEEDUP RATIO ANALYSIS */}
      {activeTab === 'efficiency' && (
        <div className="space-y-6">
          {/* Economic Insight Banner */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 via-slate-950 to-slate-950 border border-emerald-800/40 space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-400 uppercase">
              <TrendingUp className="w-4 h-4" />
              <span>{tr('THE "H100 EFFICIENCY PARADOX" IN LLM TRAINING', '«ភាពផ្ទុយនៃប្រសិទ្ធភាព H100» ក្នុងការបង្វឹក LLM')}</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {isKm ? (
                <>
                  ខណៈពេលដែលណូដ H100 មានតម្លៃប្រចាំម៉ោងប្រហាក់ប្រហែល A100 ($3.85 ធៀបនឹង $4.10/ឈីប-ម៉ោង) <strong className="text-emerald-300">ល្បឿនដំណើរការថូខិនខ្ពស់ជាង ~3.95x ដល់ 4.03x</strong> កាត់បន្ថយរយៈពេលបង្វឹកយ៉ាងខ្លាំងពីច្រើនថ្ងៃមកត្រឹមម៉ោង។ ជាលទ្ធផល <strong className="text-white">ថ្លៃដើមបង្វឹកសរុបលើ H100 ថោកជាង A100 ជាង 60%</strong>!
                </>
              ) : (
                <>
                  While an H100 node costs slightly more per hour than an A100 node ($3.85 vs $4.10/chip-hr), its <strong className="text-emerald-300">~3.95x to 4.03x higher token throughput</strong> drastically cuts training duration from days to hours. As a result, the <strong className="text-white">total training cost on H100 is over 60% cheaper</strong> than completing the identical pretraining job on A100!
                </>
              )}
            </p>
          </div>

          {/* Visual Speedup Comparison Bar per Model Size */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>{tr('Normalized Throughput Multiplier vs A100 (1.0x Baseline)', 'មេគុណល្បឿនប្រៀបធៀបនឹង A100 (មូលដ្ឋាន 1.0x)')}</span>
            </h4>

            <div className="space-y-3">
              {benchmarkData.map((b) => (
                <div key={b.model.paramsB} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-mono font-bold text-white">
                      {isKm ? b.model.labelKm : b.model.label} ({isKm ? b.model.categoryKm : b.model.category})
                    </span>
                    <span className="font-mono text-slate-400 text-[11px]">
                      {tr('A100 Throughput:', 'ល្បឿន A100៖')} {b.a100.throughputPerChip.toLocaleString()} tok/s/{tr('chip', 'ឈីប')}
                    </span>
                  </div>

                  {/* Horizontal Bar Chart */}
                  <div className="space-y-1.5 text-xs font-mono">
                    {/* H100 Bar */}
                    <div className="flex items-center gap-2">
                      <span className="w-20 text-[11px] text-emerald-400">H100 SXM5</span>
                      <div className="flex-1 bg-slate-900 rounded-full h-3 overflow-hidden">
                        <div
                          style={{ width: `${Math.min(100, (b.h100.speedupVsA100 / 4.5) * 100)}%` }}
                          className="bg-emerald-400 h-full rounded-full flex items-center justify-end pr-1 text-[9px] text-slate-950 font-bold"
                        />
                      </div>
                      <span className="w-24 text-right text-emerald-300 font-bold">
                        {b.h100.speedupVsA100}x ({b.h100.throughputPerChip.toLocaleString()} t/s)
                      </span>
                    </div>

                    {/* TPU v4 Bar */}
                    <div className="flex items-center gap-2">
                      <span className="w-20 text-[11px] text-amber-400">TPU v4</span>
                      <div className="flex-1 bg-slate-900 rounded-full h-3 overflow-hidden">
                        <div
                          style={{ width: `${Math.min(100, (b.tpu_v4.speedupVsA100 / 4.5) * 100)}%` }}
                          className="bg-amber-400 h-full rounded-full"
                        />
                      </div>
                      <span className="w-24 text-right text-amber-300">
                        {b.tpu_v4.speedupVsA100}x ({b.tpu_v4.throughputPerChip.toLocaleString()} t/s)
                      </span>
                    </div>

                    {/* A100 Bar */}
                    <div className="flex items-center gap-2">
                      <span className="w-20 text-[11px] text-cyan-400">A100 SXM4</span>
                      <div className="flex-1 bg-slate-900 rounded-full h-3 overflow-hidden">
                        <div
                          style={{ width: `${Math.min(100, (1.0 / 4.5) * 100)}%` }}
                          className="bg-cyan-500 h-full rounded-full"
                        />
                      </div>
                      <span className="w-24 text-right text-slate-400">
                        1.00x ({tr('Baseline', 'មូលដ្ឋាន')})
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Parallelism & Memory Strategy Recommendations */}
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-violet-400" />
              <span>{tr('Recommended Distributed Parallelism by Architecture', 'យុទ្ធសាស្ត្រ Distributed Parallelism ដែលណែនាំតាមស្ថាបត្យកម្ម')}</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                <span className="text-emerald-400 font-bold block">{tr('H100 Parallelism Topology', 'ទម្រង់ H100 Parallelism')}</span>
                <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                  {tr(
                    '80GB HBM3 allows training up to 7B with pure FSDP-2 and ZeRO-3 without Tensor Parallelism communication overhead. For 13B+, use TP=2 with NVLink 4.0 crossbar.',
                    '80GB HBM3 អនុញ្ញាតឱ្យបង្វឹកដល់ 7B ដោយប្រើ FSDP-2 និង ZeRO-3 សុទ្ធដោយគ្មានបន្ទុកទំនាក់ទំនង Tensor Parallelism។ សម្រាប់ 13B+ ប្រើ TP=2 ជាមួយ NVLink 4.0។'
                  )}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                <span className="text-cyan-400 font-bold block">{tr('A100 Parallelism Topology', 'ទម្រង់ A100 Parallelism')}</span>
                <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                  {tr(
                    '80GB HBM2e supports 7B with standard PyTorch FSDP. Requires activation checkpointing to avoid VRAM OOM on 4096 context length sequences.',
                    '80GB HBM2e គាំទ្រ 7B ជាមួយ PyTorch FSDP ស្តង់ដារ។ ទាមទារ activation checkpointing ដើម្បីចៀសវាងការពេញ VRAM OOM លើលំដាប់ប្រវែងបរិបទ 4096។'
                  )}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                <span className="text-amber-400 font-bold block">{tr('TPU v4 Parallelism Topology', 'ទម្រង់ TPU v4 Parallelism')}</span>
                <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                  {tr(
                    '32GB HBM2 per chip requires switching to 2-way Tensor Parallelism (TP=2) for models ≥7B. Optical 3D Torus mesh handles all-gather and reduce-scatter with near-zero latency.',
                    '32GB HBM2 ក្នុងមួយឈីបតម្រូវឱ្យប្ដូរទៅ Tensor Parallelism 2 ផ្លូវ (TP=2) សម្រាប់ម៉ូដែល ≥7B។ បណ្ដាញ Optical 3D Torus ដោះស្រាយ all-gather ដោយគ្មានភាពយឺតយ៉ាវ។'
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
