import React, { useEffect, useMemo, useState } from 'react';
import {
  Cpu,
  Clock,
  Zap,
  Server,
  Gauge,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import type { CheckpointModelId } from './TrainingDynamics';

interface ArchComputeProfile {
  id: CheckpointModelId;
  label: string;
  labelKm: string;
  paramsB: number;
  defaultTokensB: number;
  recommendedMfu: number;
  attentionSpec: string;
  attentionSpecKm: string;
  color: string;
  notes: string;
  notesKm: string;
}

const ARCH_PROFILES: Record<CheckpointModelId, ArchComputeProfile> = {
  khmer_1_5b_spm32k: {
    id: 'khmer_1_5b_spm32k',
    label: '1.5B GQA (SPM-32k)',
    labelKm: '1.5B GQA (SPM-32k)',
    paramsB: 1.5,
    defaultTokensB: 45,
    recommendedMfu: 48,
    attentionSpec: '24L · GQA 4:1 · 32k vocab',
    attentionSpecKm: '២៤ ស្រទាប់ · GQA 4:1 · វាក្យសព្ទ 32k',
    color: '#fbbf24',
    notes: 'Compact 1.5B model achieves high MFU (46–50%) on single-node NVLink or 2-node FSDP.',
    notesKm: 'ម៉ូដែល 1.5B សម្រេចបាន MFU ខ្ពស់ (46–50%) លើណូដ NVLink ទោល ឬ FSDP ២ ណូដ។'
  },
  khmer_3_0b_bilingual: {
    id: 'khmer_3_0b_bilingual',
    label: '3.0B GQA (Bilingual-64k)',
    labelKm: '3.0B GQA (ទ្វេភាគី-64k)',
    paramsB: 3.0,
    defaultTokensB: 80,
    recommendedMfu: 45,
    attentionSpec: '32L · GQA 8:1 · 64k vocab',
    attentionSpecKm: '៣២ ស្រទាប់ · GQA 8:1 · វាក្យសព្ទ 64k',
    color: '#22d3ee',
    notes: '3B GQA with 64k vocabulary balances larger GEMM tiles against cross-node AllReduce latency.',
    notesKm: 'ម៉ូដែល 3B GQA វាក្យសព្ទ 64k រក្សាតុល្យភាពរវាងទំហំ GEMM និងការទំនាក់ទំនងរវាងណូដ។'
  },
  khmer_7_0b_enterprise: {
    id: 'khmer_7_0b_enterprise',
    label: '7.0B GQA (Enterprise)',
    labelKm: '7.0B GQA (សហគ្រាស)',
    paramsB: 7.0,
    defaultTokensB: 150,
    recommendedMfu: 42,
    attentionSpec: '36L · GQA 8:1 · QK-Norm',
    attentionSpecKm: '៣៦ ស្រទាប់ · GQA 8:1 · QK-Norm',
    color: '#34d399',
    notes: '7B multi-node FSDP requires 3.2 Tbps InfiniBand / EFAv2 to sustain >40% MFU.',
    notesKm: 'ម៉ូដែល 7B FSDP ពហុណូដ ត្រូវការ InfiniBand / EFAv2 3.2 Tbps ដើម្បីរក្សា MFU >40%។'
  },
  baseline_byte_bpe: {
    id: 'baseline_byte_bpe',
    label: '1.5B Byte-BPE (Baseline)',
    labelKm: '1.5B Byte-BPE (មូលដ្ឋាន)',
    paramsB: 1.5,
    defaultTokensB: 115,
    recommendedMfu: 44,
    attentionSpec: '24L · MHA · 2.6× token inflation',
    attentionSpecKm: '២៤ ស្រទាប់ · MHA · កំណើនថូខិន 2.6×',
    color: '#f43f5e',
    notes: 'Byte-fallback expands Khmer text into ~2.6× more tokens, inflating total training FLOPs for equivalent coverage.',
    notesKm: 'Byte-fallback បំបែកអក្សរខ្មែរច្រើនជាងមុន ~2.6× ដង ដែលបង្កើន FLOPs សរុបយ៉ាងខ្លាំង។'
  }
};

interface HardwareTarget {
  id: string;
  name: string;
  bf16TflopsPerUnit: number;
  vramPerUnitGb: number;
  colorClass: string;
}

const HARDWARE_TARGETS: HardwareTarget[] = [
  {
    id: 'h100',
    name: 'NVIDIA H100 SXM5 (80GB)',
    bf16TflopsPerUnit: 750,
    vramPerUnitGb: 80,
    colorClass: 'text-amber-300'
  },
  {
    id: 'a100',
    name: 'NVIDIA A100 SXM4 (80GB)',
    bf16TflopsPerUnit: 312,
    vramPerUnitGb: 80,
    colorClass: 'text-cyan-300'
  },
  {
    id: 'tpu_v4',
    name: 'Google TPU v4 Chip',
    bf16TflopsPerUnit: 275,
    vramPerUnitGb: 32,
    colorClass: 'text-emerald-300'
  },
  {
    id: 'tpu_v5e',
    name: 'Google TPU v5e Chip',
    bf16TflopsPerUnit: 197,
    vramPerUnitGb: 16,
    colorClass: 'text-violet-300'
  }
];

interface ComputeResourceEstimatorProps {
  selectedCheckpoint?: CheckpointModelId;
}

export const ComputeResourceEstimator: React.FC<ComputeResourceEstimatorProps> = ({
  selectedCheckpoint
}) => {
  const { isKm, tr } = useLanguage();

  const [archId, setArchId] = useState<CheckpointModelId>(
    selectedCheckpoint || 'khmer_1_5b_spm32k'
  );
  const [targetTokensB, setTargetTokensB] = useState<number>(
    ARCH_PROFILES[selectedCheckpoint || 'khmer_1_5b_spm32k'].defaultTokensB
  );
  const [durationValue, setDurationValue] = useState<number>(7);
  const [durationUnit, setDurationUnit] = useState<'hours' | 'days'>('days');
  const [mfuPercent, setMfuPercent] = useState<number>(
    ARCH_PROFILES[selectedCheckpoint || 'khmer_1_5b_spm32k'].recommendedMfu
  );

  useEffect(() => {
    if (selectedCheckpoint && ARCH_PROFILES[selectedCheckpoint]) {
      setArchId(selectedCheckpoint);
      setTargetTokensB(ARCH_PROFILES[selectedCheckpoint].defaultTokensB);
      setMfuPercent(ARCH_PROFILES[selectedCheckpoint].recommendedMfu);
    }
  }, [selectedCheckpoint]);

  const profile = ARCH_PROFILES[archId];

  const handleSelectArch = (nextId: CheckpointModelId) => {
    setArchId(nextId);
    setTargetTokensB(ARCH_PROFILES[nextId].defaultTokensB);
    setMfuPercent(ARCH_PROFILES[nextId].recommendedMfu);
  };

  const estimate = useMemo(() => {
    const safeTokensB = Math.max(1, Number.isFinite(targetTokensB) ? targetTokensB : 1);
    const safeDurationVal = Math.max(0.5, Number.isFinite(durationValue) ? durationValue : 1);
    const safeMfu = Math.min(80, Math.max(15, Number.isFinite(mfuPercent) ? mfuPercent : 45));

    const durationHours = durationUnit === 'days' ? safeDurationVal * 24 : safeDurationVal;
    const durationSeconds = durationHours * 3600;

    // Standard Chinchilla FLOPs = 6 * N * D
    const totalFlops = 6 * (profile.paramsB * 1e9) * (safeTokensB * 1e9);
    const exaFlops = totalFlops / 1e18;

    // Sustained effective TFLOPS/s required to complete within durationSeconds
    const requiredEffectiveTflops = totalFlops / (durationSeconds * 1e12);
    // Raw nameplate BF16 cluster TFLOPS/s required accounting for Model FLOPs Utilization (MFU)
    const requiredPeakTflops = requiredEffectiveTflops / (safeMfu / 100);
    const requiredPeakPflops = requiredPeakTflops / 1000;
    const tokensPerSecond = (safeTokensB * 1e9) / durationSeconds;

    const hardwareSizing = HARDWARE_TARGETS.map((hw) => {
      const exactUnits = requiredPeakTflops / hw.bf16TflopsPerUnit;
      const minUnits = Math.max(1, Math.ceil(exactUnits));
      // Round up to clean node multiples (8 GPUs per node) for cluster planning
      const recommendedNodeUnits = minUnits <= 8 ? minUnits : Math.ceil(minUnits / 8) * 8;
      const actualClusterPeakTflops = recommendedNodeUnits * hw.bf16TflopsPerUnit;
      const actualHoursAtNodeCount =
        totalFlops / (actualClusterPeakTflops * (safeMfu / 100) * 1e12 * 3600);

      return {
        ...hw,
        exactUnits,
        minUnits,
        recommendedNodeUnits,
        totalVramTb: Number(((recommendedNodeUnits * hw.vramPerUnitGb) / 1024).toFixed(2)),
        actualHoursAtNodeCount: Number(actualHoursAtNodeCount.toFixed(1))
      };
    });

    return {
      durationHours: Number(durationHours.toFixed(1)),
      durationDays: Number((durationHours / 24).toFixed(2)),
      exaFlops,
      requiredEffectiveTflops,
      requiredPeakTflops,
      requiredPeakPflops,
      tokensPerSecond,
      hardwareSizing
    };
  }, [profile, targetTokensB, durationValue, durationUnit, mfuPercent]);

  const maxH100Required = estimate.hardwareSizing[0]?.minUnits || 1;

  return (
    <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Gauge className="w-5 h-5 text-emerald-400" />
            <h3 className={`text-lg font-bold text-white ${isKm ? 'font-khmer' : ''}`}>
              {tr('Compute Resource Estimator', 'ឧបករណ៍ប៉ាន់ស្មានធនធានគណនា (TFLOPS/s)')}
            </h3>
          </div>
          <p className={`text-xs text-slate-400 max-w-2xl ${isKm ? 'font-khmer' : ''}`}>
            {tr(
              'Computes required sustained and peak cluster TFLOPS/s (6·N·D) from your selected Khmer LLM architecture and target training wall-clock duration.',
              'គណនា TFLOPS/s ដែលត្រូវការ (តាមរូបមន្ត 6·N·D) ដោយផ្អែកលើស្ថាបត្យកម្មម៉ូដែលខ្មែរ និងរយៈពេលហ្វឹកហាត់ដែលអ្នកកំណត់។'
            )}
          </p>
        </div>

        {/* Architecture Selector Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {(Object.keys(ARCH_PROFILES) as CheckpointModelId[]).map((id) => {
            const item = ARCH_PROFILES[id];
            const isSelected = archId === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => handleSelectArch(id)}
                className={`px-3 py-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 ${
                  isSelected
                    ? 'bg-slate-800 border-emerald-400/70 text-white'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className={isKm ? 'font-khmer' : 'font-mono'}>
                  {isKm ? item.labelKm : item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Input Controls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Training Duration Input + Unit Toggle */}
        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <label
              htmlFor="compute-duration-input"
              className={`text-xs font-semibold text-slate-300 flex items-center gap-1.5 ${
                isKm ? 'font-khmer' : ''
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>{tr('Target Training Duration', 'រយៈពេលហ្វឹកហាត់គោលដៅ')}</span>
            </label>
            <div className="flex items-center rounded-lg bg-slate-900 border border-slate-800 p-0.5 text-[11px] font-mono">
              <button
                type="button"
                onClick={() => setDurationUnit('hours')}
                className={`px-2 py-0.5 rounded transition-colors ${
                  durationUnit === 'hours'
                    ? 'bg-amber-400 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tr('Hours', 'ម៉ោង')}
              </button>
              <button
                type="button"
                onClick={() => setDurationUnit('days')}
                className={`px-2 py-0.5 rounded transition-colors ${
                  durationUnit === 'days'
                    ? 'bg-amber-400 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tr('Days', 'ថ្ងៃ')}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              id="compute-duration-input"
              type="number"
              min={durationUnit === 'days' ? 0.5 : 1}
              max={durationUnit === 'days' ? 365 : 8760}
              step={durationUnit === 'days' ? 0.5 : 1}
              value={durationValue}
              onChange={(e) => setDurationValue(Math.max(0.5, Number(e.target.value) || 1))}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-sm font-bold focus:outline-none focus:border-amber-400"
            />
            <span className="font-mono text-xs text-slate-400 whitespace-nowrap">
              ({estimate.durationHours}h)
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5 text-[11px] font-mono">
            {[
              { label: '24h', val: 24, unit: 'hours' as const },
              { label: '3d', val: 3, unit: 'days' as const },
              { label: '7d', val: 7, unit: 'days' as const },
              { label: '14d', val: 14, unit: 'days' as const },
              { label: '30d', val: 30, unit: 'days' as const }
            ].map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => {
                  setDurationValue(preset.val);
                  setDurationUnit(preset.unit);
                }}
                className={`px-2 py-0.5 rounded border transition-colors ${
                  durationValue === preset.val && durationUnit === preset.unit
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Target Token Count Input */}
        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <label
              htmlFor="compute-tokens-input"
              className={`text-xs font-semibold text-slate-300 flex items-center gap-1.5 ${
                isKm ? 'font-khmer' : ''
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>{tr('Training Corpus Size (B Tokens)', 'ទំហំថូខិនបង្វឹក (ពាន់លាន)')}</span>
            </label>
            <span className="font-mono text-[11px] text-cyan-300 font-bold">
              {profile.paramsB}B params
            </span>
          </div>

          <div className="flex items-center gap-2">
            <input
              id="compute-tokens-input"
              type="number"
              min={5}
              max={1000}
              step={5}
              value={targetTokensB}
              onChange={(e) => setTargetTokensB(Math.max(1, Number(e.target.value) || 1))}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-sm font-bold focus:outline-none focus:border-cyan-400"
            />
            <span className="font-mono text-xs text-slate-400 whitespace-nowrap">B tok</span>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>{tr('Chinchilla 20×N:', 'Chinchilla 20×N៖')} {(profile.paramsB * 20).toFixed(0)}B</span>
            <span>{(targetTokensB / (profile.paramsB * 20)).toFixed(2)}×</span>
          </div>
        </div>

        {/* Assumed Hardware MFU % Input */}
        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <label
              htmlFor="compute-mfu-slider"
              className={`text-xs font-semibold text-slate-300 flex items-center gap-1.5 ${
                isKm ? 'font-khmer' : ''
              }`}
            >
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
              <span>{tr('Model FLOPs Utilization (MFU)', 'ប្រសិទ្ធភាពប្រើប្រាស់ MFU')}</span>
            </label>
            <span className="font-mono text-sm font-bold text-emerald-300 tabular-nums">
              {mfuPercent}%
            </span>
          </div>

          <input
            id="compute-mfu-slider"
            type="range"
            min={20}
            max={65}
            step={1}
            value={mfuPercent}
            onChange={(e) => setMfuPercent(Number(e.target.value))}
            className="w-full accent-emerald-400 cursor-pointer"
          />

          <p className={`text-[11px] text-slate-400 leading-snug ${isKm ? 'font-khmer' : ''}`}>
            {isKm ? profile.notesKm : profile.notes}
          </p>
        </div>
      </div>

      {/* Primary Required TFLOPS/s Readout Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl border border-emerald-500/35 bg-emerald-950/20 space-y-1">
          <span className={`text-[11px] text-emerald-300 font-mono block ${isKm ? 'font-khmer' : ''}`}>
            {tr('REQUIRED PEAK CLUSTER TFLOPS/s', 'TFLOPS/s កំពូលដែលត្រូវការ')}
          </span>
          <div className="text-2xl font-extrabold font-mono text-white tabular-nums">
            {Math.round(estimate.requiredPeakTflops).toLocaleString()}
            <span className="text-xs font-normal text-emerald-300 ml-1.5">TFLOPS/s</span>
          </div>
          <span className="text-[11px] font-mono text-slate-400 block tabular-nums">
            = {estimate.requiredPeakPflops.toFixed(2)} PFLOPS/s @ {mfuPercent}% MFU
          </span>
        </div>

        <div className="p-4 rounded-2xl border border-slate-800 bg-slate-950/60 space-y-1">
          <span className={`text-[11px] text-amber-300 font-mono block ${isKm ? 'font-khmer' : ''}`}>
            {tr('SUSTAINED EFFECTIVE TFLOPS/s', 'TFLOPS/s ប្រើប្រាស់ពិតប្រាកដ')}
          </span>
          <div className="text-2xl font-extrabold font-mono text-white tabular-nums">
            {Math.round(estimate.requiredEffectiveTflops).toLocaleString()}
            <span className="text-xs font-normal text-amber-300 ml-1.5">TFLOPS/s</span>
          </div>
          <span className="text-[11px] font-mono text-slate-400 block tabular-nums">
            {isKm ? profile.attentionSpecKm : profile.attentionSpec}
          </span>
        </div>

        <div className="p-4 rounded-2xl border border-slate-800 bg-slate-950/60 space-y-1">
          <span className={`text-[11px] text-cyan-300 font-mono block ${isKm ? 'font-khmer' : ''}`}>
            {tr('TOTAL TRAINING FLOPs (6·N·D)', 'FLOPs ហ្វឹកហាត់សរុប (6·N·D)')}
          </span>
          <div className="text-2xl font-extrabold font-mono text-white tabular-nums">
            {estimate.exaFlops.toFixed(1)}
            <span className="text-xs font-normal text-cyan-300 ml-1.5">ExaFLOPs</span>
          </div>
          <span className="text-[11px] font-mono text-slate-400 block tabular-nums">
            6 × {profile.paramsB}B × {targetTokensB}B tok
          </span>
        </div>

        <div className="p-4 rounded-2xl border border-slate-800 bg-slate-950/60 space-y-1">
          <span className={`text-[11px] text-slate-400 font-mono block ${isKm ? 'font-khmer' : ''}`}>
            {tr('REQUIRED THROUGHPUT', 'ល្បឿនថូខិនដែលត្រូវការ')}
          </span>
          <div className="text-2xl font-extrabold font-mono text-white tabular-nums">
            {Math.round(estimate.tokensPerSecond).toLocaleString()}
            <span className="text-xs font-normal text-slate-400 ml-1.5">tok/s</span>
          </div>
          <span className="text-[11px] font-mono text-slate-400 block tabular-nums">
            {tr('Across', 'ក្នុងរយៈពេល')} {estimate.durationDays} {tr('days', 'ថ្ងៃ')}
          </span>
        </div>
      </div>

      {/* Accelerator Cluster Mapping Table */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-cyan-400" />
            <h4 className={`text-sm font-bold text-white ${isKm ? 'font-khmer' : ''}`}>
              {tr(
                'Accelerator Sizing to Meet Peak TFLOPS/s Target',
                'ចំនួន GPU / TPU ដែលត្រូវការដើម្បីសម្រេច TFLOPS/s គោលដៅ'
              )}
            </h4>
          </div>

          <span className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400">
            {maxH100Required > 64 ? (
              <>
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span className={isKm ? 'font-khmer font-sans text-amber-300' : 'text-amber-300'}>
                  {tr(
                    'Large multi-node InfiniBand pod required',
                    'ត្រូវការចង្កោម InfiniBand ពហុណូដទ្រង់ទ្រាយធំ'
                  )}
                </span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className={isKm ? 'font-khmer font-sans text-emerald-300' : 'text-emerald-300'}>
                  {tr('Fits standard 1–8 node cluster', 'សមស្របលើចង្កោម ១–៨ ណូដស្តង់ដារ')}
                </span>
              </>
            )}
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
          <table className="w-full text-left text-xs font-mono">
            <thead className={`bg-slate-900/90 text-slate-400 text-[11px] border-b border-slate-800 ${isKm ? 'font-khmer' : ''}`}>
              <tr>
                <th className="py-2.5 px-4">{tr('Accelerator Unit', 'ប្រភេទ GPU / TPU')}</th>
                <th className="py-2.5 px-4">{tr('BF16 TFLOPS / Unit', 'TFLOPS / ១ គ្រឿង')}</th>
                <th className="py-2.5 px-4">{tr('Min Units Needed', 'ចំនួនអប្បបរមា')}</th>
                <th className="py-2.5 px-4">{tr('Node-Aligned Cluster', 'ចង្កោមតាមណូដ')}</th>
                <th className="py-2.5 px-4">{tr('Total HBM VRAM', 'VRAM សរុប')}</th>
                <th className="py-2.5 px-4 text-right">{tr('Est. Runtime', 'រយៈពេលជាក់ស្តែង')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {estimate.hardwareSizing.map((row) => (
                <tr key={row.id} className="hover:bg-slate-900/50 text-slate-200">
                  <td className={`py-2.5 px-4 font-bold ${row.colorClass}`}>{row.name}</td>
                  <td className="py-2.5 px-4 tabular-nums">{row.bf16TflopsPerUnit}</td>
                  <td className="py-2.5 px-4 tabular-nums text-white font-bold">
                    {row.minUnits}×
                  </td>
                  <td className="py-2.5 px-4 tabular-nums text-cyan-300">
                    {row.recommendedNodeUnits}×
                    {row.recommendedNodeUnits >= 8 && (
                      <span className="text-slate-500 ml-1">
                        ({Math.ceil(row.recommendedNodeUnits / 8)} {tr('nodes', 'ណូដ')})
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-4 tabular-nums text-slate-300">{row.totalVramTb} TB</td>
                  <td className="py-2.5 px-4 text-right tabular-nums text-emerald-300">
                    {row.actualHoursAtNodeCount}h ({(row.actualHoursAtNodeCount / 24).toFixed(1)}d)
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
