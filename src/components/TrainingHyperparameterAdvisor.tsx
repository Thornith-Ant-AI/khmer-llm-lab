import React, { useState, useMemo, useEffect } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';
import {
  Sliders,
  Layers,
  TrendingUp,
  ShieldCheck,
  Copy,
  Check,
  Cpu,
  ArrowLeftRight
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import type { CheckpointModelId } from './TrainingDynamics';

export type AdvisorModelSizeId = '1.5b_gqa' | '3b_gqa' | '7b_gqa';

interface HyperparameterProfile {
  id: AdvisorModelSizeId;
  label: string;
  labelKm: string;
  archTag: string;
  archTagKm: string;
  paramsB: number;
  hiddenDim: number;
  layers: number;
  gqaRatio: string;
  vocabSize: string;
  targetTokensB: number;
  recommendedTotalSteps: number;
  targetGlobalBatchTokens: number;
  peakLr: number;
  peakLrFormatted: string;
  minLr: number;
  minLrFormatted: string;
  warmupSteps: number;
  warmupPercent: number;
  cooldownStartPercent: number;
  weightDecay: number;
  adamBeta1: number;
  adamBeta2: number;
  adamEps: string;
  gradClip: number;
  zLossWeight: number;
  qkNorm: boolean;
  color: string;
  batchRationale: string;
  batchRationaleKm: string;
  lrRationale: string;
  lrRationaleKm: string;
  wdRationale: string;
  wdRationaleKm: string;
}

const ADVISOR_PROFILES: Record<AdvisorModelSizeId, HyperparameterProfile> = {
  '1.5b_gqa': {
    id: '1.5b_gqa',
    label: '1.5B GQA',
    labelKm: '១.៥B GQA',
    archTag: '24L · d=2048 · GQA 4:1 · SPM-32k',
    archTagKm: '២៤ ស្រទាប់ · d=2048 · GQA 4:1 · SPM-32k',
    paramsB: 1.5,
    hiddenDim: 2048,
    layers: 24,
    gqaRatio: '4:1 (16Q / 4KV)',
    vocabSize: '32,768',
    targetTokensB: 45,
    recommendedTotalSteps: 22000,
    targetGlobalBatchTokens: 2_097_152, // 2M tokens/step (512 seqs @ 4096)
    peakLr: 3.0e-4,
    peakLrFormatted: '3.0e-4',
    minLr: 3.0e-5,
    minLrFormatted: '3.0e-5',
    warmupSteps: 2000,
    warmupPercent: 9.1,
    cooldownStartPercent: 85,
    weightDecay: 0.1,
    adamBeta1: 0.9,
    adamBeta2: 0.95,
    adamEps: '1e-8',
    gradClip: 1.0,
    zLossWeight: 0,
    qkNorm: false,
    color: '#fbbf24',
    batchRationale:
      '2.1M tokens/step keeps gradient noise healthy for 1.5B parameters while avoiding over-smoothing on compact 32k Khmer subword clusters.',
    batchRationaleKm:
      '២.១លាន tokens/ជំហាន រក្សាតុល្យភាពរំញ័រ gradient សម្រាប់ម៉ូដែល 1.5B និងសមស្របនឹងវាក្យសព្ទ Khmer 32k។',
    lrRationale:
      'Higher 3.0e-4 peak LR with a 2,000-step linear warm-up accelerates early Khmer script embedding alignment before cosine decay to 3.0e-5.',
    lrRationaleKm:
      'Peak LR ខ្ពស់ 3.0e-4 ជាមួយការកម្តៅ ២,០០០ ជំហាន ជួយឱ្យ embedding អក្សរខ្មែរចាប់បានលឿន មុនពេលថយចុះតាមខ្សែកោង cosine ដល់ 3.0e-5។',
    wdRationale:
      'Standard decoupled weight decay (0.10) on linear weights while excluding RMSNorm gains and 1D biases prevents representation collapse.',
    wdRationaleKm:
      'Weight decay 0.10 លើស្រទាប់លីនេអ៊ែរ (មិនរាប់បញ្ចូល RMSNorm និង bias) ជួយការពារការរួមតូចនៃទម្ងន់ម៉ូដែល។'
  },
  '3b_gqa': {
    id: '3b_gqa',
    label: '3B GQA',
    labelKm: '៣B GQA',
    archTag: '32L · d=3072 · GQA 8:1 · SPM-64k',
    archTagKm: '៣២ ស្រទាប់ · d=3072 · GQA 8:1 · SPM-64k',
    paramsB: 3.0,
    hiddenDim: 3072,
    layers: 32,
    gqaRatio: '8:1 (24Q / 3KV)',
    vocabSize: '65,536',
    targetTokensB: 85,
    recommendedTotalSteps: 21000,
    targetGlobalBatchTokens: 4_194_304, // 4M tokens/step (1024 seqs @ 4096)
    peakLr: 2.2e-4,
    peakLrFormatted: '2.2e-4',
    minLr: 2.2e-5,
    minLrFormatted: '2.2e-5',
    warmupSteps: 2800,
    warmupPercent: 13.3,
    cooldownStartPercent: 85,
    weightDecay: 0.12,
    adamBeta1: 0.9,
    adamBeta2: 0.95,
    adamEps: '1e-8',
    gradClip: 1.0,
    zLossWeight: 1e-4,
    qkNorm: true,
    color: '#22d3ee',
    batchRationale:
      'Doubling global batch to 4.2M tokens/step dampens variance across bilingual EN/KM batches and stabilizes shared 8:1 GQA Key-Value heads.',
    batchRationaleKm:
      'បង្កើន global batch ដល់ ៤.២លាន tokens/ជំហាន ជួយកាត់បន្ថយរំញ័រលើទិន្នន័យទ្វេភាគីខ្មែរ-អង់គ្លេស និងធ្វើឱ្យក្បាល GQA 8:1 មានស្ថិរភាព។',
    lrRationale:
      'Lower 2.2e-4 peak LR (μP width scaling for d=3072) paired with an extended 2,800-step warm-up avoids early attention logit spikes.',
    lrRationaleKm:
      'បន្ថយ peak LR មកត្រឹម 2.2e-4 (តាមទំហំ d=3072) រួមជាមួយ warm-up វែងជាងមុន ២,៨០០ ជំហាន ដើម្បីទប់ស្កាត់ការហក់ឡើងនៃ attention logit។',
    wdRationale:
      'Slightly firmer 0.12 weight decay + QK-Norm + z-loss (1e-4) guards against memorization during multi-epoch Tier-1 Khmer corpus upsampling.',
    wdRationaleKm:
      'Weight decay 0.12 រួមជាមួយ QK-Norm និង z-loss (1e-4) ការពារការទន្ទេញចាំលើសកម្រិតពេលហ្វឹកហាត់ឃ្លាំងទិន្នន័យខ្មែរម្តងហើយម្តងទៀត។'
  },
  '7b_gqa': {
    id: '7b_gqa',
    label: '7B GQA',
    labelKm: '៧B GQA',
    archTag: '36L · d=4096 · GQA 8:1 · SPM-64k',
    archTagKm: '៣៦ ស្រទាប់ · d=4096 · GQA 8:1 · SPM-64k',
    paramsB: 7.0,
    hiddenDim: 4096,
    layers: 36,
    gqaRatio: '8:1 (32Q / 4KV)',
    vocabSize: '65,536',
    targetTokensB: 150,
    recommendedTotalSteps: 24000,
    targetGlobalBatchTokens: 6_291_456, // 6M tokens/step
    peakLr: 1.5e-4,
    peakLrFormatted: '1.5e-4',
    minLr: 1.5e-5,
    minLrFormatted: '1.5e-5',
    warmupSteps: 3500,
    warmupPercent: 14.6,
    cooldownStartPercent: 85,
    weightDecay: 0.1,
    adamBeta1: 0.9,
    adamBeta2: 0.95,
    adamEps: '1e-8',
    gradClip: 1.0,
    zLossWeight: 1e-4,
    qkNorm: true,
    color: '#34d399',
    batchRationale:
      '6.3M tokens/step maximizes Tensor Core utilization across multi-node FSDP clusters and smooths gradients at 7B width.',
    batchRationaleKm:
      '៦.៣លាន tokens/ជំហាន ប្រើប្រាស់ថាមពល GPU Tensor Core បានពេញលេញ និងធ្វើឱ្យ gradient រលូនសម្រាប់ម៉ូដែល 7B។',
    lrRationale:
      'Conservative 1.5e-4 peak LR with 3,500-step warm-up and cosine-to-10% decay prevents divergence in 36-layer residual streams.',
    lrRationaleKm:
      'Peak LR 1.5e-4 ជាមួយ warm-up ៣,៥០០ ជំហាន ការពារការរង្គោះរង្គើក្នុងស្រទាប់ residual ទាំង ៣៦ របស់ម៉ូដែល 7B។',
    wdRationale:
      'Decoupled weight decay 0.10 combined with mandatory QK-Norm and bfloat16/fp32 master weights preserves long-horizon convergence.',
    wdRationaleKm:
      'Weight decay 0.10 រួមជាមួយ QK-Norm និងទម្ងន់មេ fp32 រក្សាស្ថិរភាពរយៈពេលវែង។'
  }
};

function mapCheckpointToAdvisor(checkpoint?: CheckpointModelId): AdvisorModelSizeId {
  if (checkpoint === 'khmer_3_0b_bilingual') return '3b_gqa';
  if (checkpoint === 'khmer_7_0b_enterprise') return '7b_gqa';
  return '1.5b_gqa';
}

function computeCosineWithWarmupLr(
  step: number,
  totalSteps: number,
  warmupSteps: number,
  peakLr: number,
  minLr: number
): number {
  if (step <= 0) return 0;
  if (step <= warmupSteps) {
    return peakLr * (step / warmupSteps);
  }
  const decaySteps = Math.max(1, totalSteps - warmupSteps);
  const progress = Math.min(1, (step - warmupSteps) / decaySteps);
  const cosine = 0.5 * (1 + Math.cos(Math.PI * progress));
  return minLr + (peakLr - minLr) * cosine;
}

interface TrainingHyperparameterAdvisorProps {
  selectedCheckpoint?: CheckpointModelId;
}

export const TrainingHyperparameterAdvisor: React.FC<TrainingHyperparameterAdvisorProps> = ({
  selectedCheckpoint
}) => {
  const { isKm, tr } = useLanguage();

  const [selectedSize, setSelectedSize] = useState<AdvisorModelSizeId>(() =>
    mapCheckpointToAdvisor(selectedCheckpoint)
  );
  const [seqLength, setSeqLength] = useState<2048 | 4096 | 8192>(4096);
  const [gpuCount, setGpuCount] = useState<8 | 16 | 32 | 64>(16);
  const [copiedYaml, setCopiedYaml] = useState(false);

  useEffect(() => {
    if (selectedCheckpoint) {
      setSelectedSize(mapCheckpointToAdvisor(selectedCheckpoint));
    }
  }, [selectedCheckpoint]);

  const profile = ADVISOR_PROFILES[selectedSize];

  // Compute optimal micro-batch, grad accumulation, and batch token budget
  const batchPlan = useMemo(() => {
    const targetSeqs = Math.max(1, Math.round(profile.targetGlobalBatchTokens / seqLength));
    // Safe per-GPU micro-batch size for 80GB H100/A100 with activation checkpointing on larger models
    let microBatch = 8;
    if (selectedSize === '1.5b_gqa') {
      microBatch = seqLength === 8192 ? 2 : seqLength === 4096 ? 4 : 8;
    } else if (selectedSize === '3b_gqa') {
      microBatch = seqLength === 8192 ? 1 : seqLength === 4096 ? 2 : 4;
    } else {
      microBatch = seqLength === 8192 ? 1 : seqLength === 4096 ? 1 : 2;
    }

    const rawAccum = targetSeqs / (gpuCount * microBatch);
    const gradAccum = Math.max(1, Math.round(rawAccum));
    const actualSeqsPerStep = gpuCount * microBatch * gradAccum;
    const actualTokensPerStep = actualSeqsPerStep * seqLength;
    const warmupTokensM = Math.round((profile.warmupSteps * actualTokensPerStep) / 1_000_000);
    const estTotalSteps = Math.round((profile.targetTokensB * 1_000_000_000) / actualTokensPerStep);
    const cooldownStartStep = Math.round(estTotalSteps * (profile.cooldownStartPercent / 100));

    return {
      microBatch,
      gradAccum,
      actualSeqsPerStep,
      actualTokensPerStep,
      actualTokensMillions: (actualTokensPerStep / 1_000_000).toFixed(2),
      warmupTokensM,
      estTotalSteps,
      cooldownStartStep
    };
  }, [profile, selectedSize, seqLength, gpuCount]);

  // LR Warm-up + Cosine Decay Schedule Curve comparing 1.5B GQA vs 3B GQA (and 7B if selected)
  const scheduleChartData = useMemo(() => {
    const p15 = ADVISOR_PROFILES['1.5b_gqa'];
    const p3 = ADVISOR_PROFILES['3b_gqa'];
    const p7 = ADVISOR_PROFILES['7b_gqa'];
    const maxSteps = 22000;
    const points: Array<{
      stepK: number;
      stepLabel: string;
      lr15b: number;
      lr3b: number;
      lr7b: number;
    }> = [];

    const stepMarks = [
      0, 500, 1000, 1500, 2000, 2400, 2800, 3500, 5000, 7500, 10000, 12500, 15000, 17500, 20000, 22000
    ];

    for (const s of stepMarks) {
      points.push({
        stepK: Number((s / 1000).toFixed(1)),
        stepLabel: `${(s / 1000).toFixed(1)}k`,
        lr15b: Number((computeCosineWithWarmupLr(s, maxSteps, p15.warmupSteps, p15.peakLr, p15.minLr) * 1e4).toFixed(3)),
        lr3b: Number((computeCosineWithWarmupLr(s, maxSteps, p3.warmupSteps, p3.peakLr, p3.minLr) * 1e4).toFixed(3)),
        lr7b: Number((computeCosineWithWarmupLr(s, maxSteps, p7.warmupSteps, p7.peakLr, p7.minLr) * 1e4).toFixed(3))
      });
    }
    return points;
  }, []);

  const yamlConfigSnippet = useMemo(() => {
    return `# Khmer LLM Pretraining Hyperparameters — ${profile.label}
model:
  architecture: khmer_gqa_transformer
  scale: "${profile.label}" # ${profile.archTag}
  context_length: ${seqLength}

batch:
  gpus: ${gpuCount}
  micro_batch_size: ${batchPlan.microBatch}
  gradient_accumulation_steps: ${batchPlan.gradAccum}
  global_batch_sequences: ${batchPlan.actualSeqsPerStep}
  global_batch_tokens: ${batchPlan.actualTokensPerStep} # ~${batchPlan.actualTokensMillions}M tokens/step

scheduler:
  type: cosine_with_linear_warmup
  peak_lr: ${profile.peakLrFormatted}
  min_lr: ${profile.minLrFormatted}
  warmup_steps: ${profile.warmupSteps}
  total_steps: ${batchPlan.estTotalSteps}
  cooldown_start_step: ${batchPlan.cooldownStartStep}

optimizer:
  name: adamw
  weight_decay: ${profile.weightDecay.toFixed(2)}
  exclude_decay_params: ["bias", "norm.weight"]
  betas: [${profile.adamBeta1}, ${profile.adamBeta2}]
  eps: ${profile.adamEps}
  grad_clip_norm: ${profile.gradClip.toFixed(1)}
  qk_norm: ${profile.qkNorm}
  z_loss_weight: ${profile.zLossWeight}`;
  }, [profile, seqLength, gpuCount, batchPlan]);

  const handleCopyYaml = async () => {
    try {
      await navigator.clipboard.writeText(yamlConfigSnippet);
      setCopiedYaml(true);
      setTimeout(() => setCopiedYaml(false), 2000);
    } catch {
      setCopiedYaml(false);
    }
  };

  return (
    <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-amber-400" />
            <h3 className={`text-lg font-bold text-white ${isKm ? 'font-khmer' : ''}`}>
              {tr('Training Hyperparameter Advisor', 'ទីប្រឹក្សា Hyperparameter ការហ្វឹកហាត់')}
            </h3>
          </div>
          <p className={`text-xs text-slate-400 max-w-2xl ${isKm ? 'font-khmer' : ''}`}>
            {tr(
              'Prescriptive batch sizing, learning rate warm-up schedules, and decoupled weight decay calibrated for 1.5B vs 3B GQA Khmer architectures.',
              'ការណែនាំទំហំ Batch កាលវិភាគកម្តៅ Learning Rate និង Weight Decay សម្រាប់ស្ថាបត្យកម្មខ្មែរ 1.5B ធៀបនឹង 3B GQA។'
            )}
          </p>
        </div>

        {/* Model Size Selector */}
        <div className="flex flex-wrap items-center gap-2">
          {(['1.5b_gqa', '3b_gqa', '7b_gqa'] as AdvisorModelSizeId[]).map((sizeId) => {
            const item = ADVISOR_PROFILES[sizeId];
            const active = selectedSize === sizeId;
            return (
              <button
                key={sizeId}
                type="button"
                onClick={() => setSelectedSize(sizeId)}
                className={`px-3.5 py-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 ${
                  active
                    ? 'bg-slate-800 border-amber-400/70 text-white shadow-sm'
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

      {/* Hardware & Sequence Calibration Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-4 py-3 rounded-xl bg-slate-950/70 border border-slate-800">
        <div className="flex items-center gap-2 text-xs text-slate-300">
          <Cpu className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className={`font-semibold ${isKm ? 'font-khmer' : ''}`}>
            {tr('Architecture Profile:', 'ស្ថាបត្យកម្មម៉ូដែល៖')}
          </span>
          <span className="font-mono text-amber-300 font-bold">
            {isKm ? profile.archTagKm : profile.archTag}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className={`text-slate-400 ${isKm ? 'font-khmer' : ''}`}>
              {tr('Seq Len:', 'ប្រវែងបរិបទ៖')}
            </span>
            <div className="flex items-center rounded-lg bg-slate-900 border border-slate-800 p-0.5">
              {([2048, 4096, 8192] as const).map((len) => (
                <button
                  key={len}
                  type="button"
                  onClick={() => setSeqLength(len)}
                  className={`px-2 py-1 rounded-md font-mono text-[11px] font-bold transition-colors ${
                    seqLength === len
                      ? 'bg-amber-500/20 text-amber-300'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {len}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className={`text-slate-400 ${isKm ? 'font-khmer' : ''}`}>
              {tr('Cluster GPUs:', 'ចំនួន GPU៖')}
            </span>
            <div className="flex items-center rounded-lg bg-slate-900 border border-slate-800 p-0.5">
              {([8, 16, 32, 64] as const).map((cnt) => (
                <button
                  key={cnt}
                  type="button"
                  onClick={() => setGpuCount(cnt)}
                  className={`px-2 py-1 rounded-md font-mono text-[11px] font-bold transition-colors ${
                    gpuCount === cnt
                      ? 'bg-cyan-500/20 text-cyan-300'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {cnt}×
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3 Core Hyperparameter Recommendation Pillars */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Pillar 1: Batch Size & Accumulation */}
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-950/60 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              <h4 className={`text-sm font-bold text-white ${isKm ? 'font-khmer' : ''}`}>
                {tr('Batch Size & Accumulation', 'ទំហំ Batch & Accumulation')}
              </h4>
            </div>
            <span className="font-mono text-xs font-bold text-amber-300 tabular-nums">
              ~{batchPlan.actualTokensMillions}M tok/step
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 font-mono text-xs">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className={`text-[10px] text-slate-500 block ${isKm ? 'font-khmer' : ''}`}>
                {tr('GLOBAL SEQS / STEP', 'លំដាប់សរុប / ជំហាន')}
              </span>
              <span className="text-base font-bold text-white tabular-nums">
                {batchPlan.actualSeqsPerStep.toLocaleString()}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className={`text-[10px] text-slate-500 block ${isKm ? 'font-khmer' : ''}`}>
                {tr('MICRO-BATCH × ACCUM', 'MICRO × ACCUM')}
              </span>
              <span className="text-base font-bold text-cyan-300 tabular-nums">
                {batchPlan.microBatch} × {batchPlan.gradAccum}
              </span>
            </div>
          </div>

          <p className={`text-xs text-slate-400 leading-relaxed ${isKm ? 'font-khmer' : ''}`}>
            {isKm ? profile.batchRationaleKm : profile.batchRationale}
          </p>
        </div>

        {/* Pillar 2: Learning Rate & Warm-up Schedule */}
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-950/60 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <h4 className={`text-sm font-bold text-white ${isKm ? 'font-khmer' : ''}`}>
                {tr('LR & Warm-up Schedule', 'កាលវិភាគ Learning Rate & Warm-up')}
              </h4>
            </div>
            <span className="font-mono text-xs font-bold text-cyan-300 tabular-nums">
              {profile.peakLrFormatted} → {profile.minLrFormatted}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 font-mono text-xs">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className={`text-[10px] text-slate-500 block ${isKm ? 'font-khmer' : ''}`}>
                {tr('LINEAR WARM-UP', 'កម្តៅដំបូង (WARM-UP)')}
              </span>
              <span className="text-base font-bold text-white tabular-nums">
                {profile.warmupSteps.toLocaleString()} {tr('steps', 'ជំហាន')}
              </span>
              <span className="text-[10px] text-slate-400 block tabular-nums">
                ~{batchPlan.warmupTokensM.toLocaleString()}M tokens
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className={`text-[10px] text-slate-500 block ${isKm ? 'font-khmer' : ''}`}>
                {tr('COSINE + COOLDOWN', 'COSINE & ដំណាក់កាលចុងក្រោយ')}
              </span>
              <span className="text-base font-bold text-emerald-300 tabular-nums">
                {batchPlan.estTotalSteps.toLocaleString()} {tr('steps', 'ជំហាន')}
              </span>
              <span className="text-[10px] text-slate-400 block tabular-nums">
                {tr('Anneal @', 'បន្ថយ @')} {batchPlan.cooldownStartStep.toLocaleString()}
              </span>
            </div>
          </div>

          <p className={`text-xs text-slate-400 leading-relaxed ${isKm ? 'font-khmer' : ''}`}>
            {isKm ? profile.lrRationaleKm : profile.lrRationale}
          </p>
        </div>

        {/* Pillar 3: Weight Decay & Optimizer Stability */}
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-950/60 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <h4 className={`text-sm font-bold text-white ${isKm ? 'font-khmer' : ''}`}>
                {tr('Weight Decay & AdamW', 'Weight Decay & ស្ថិរភាព AdamW')}
              </h4>
            </div>
            <span className="font-mono text-xs font-bold text-emerald-300 tabular-nums">
              λ = {profile.weightDecay.toFixed(2)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 font-mono text-xs">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className={`text-[10px] text-slate-500 block ${isKm ? 'font-khmer' : ''}`}>
                {tr('ADAMW BETAS / CLIP', 'ADAMW BETAS / កាត់ GRAD')}
              </span>
              <span className="text-sm font-bold text-white tabular-nums">
                ({profile.adamBeta1}, {profile.adamBeta2})
              </span>
              <span className="text-[10px] text-slate-400 block tabular-nums">
                clip={profile.gradClip.toFixed(1)} · eps={profile.adamEps}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className={`text-[10px] text-slate-500 block ${isKm ? 'font-khmer' : ''}`}>
                {tr('ATTENTION GUARD', 'ការពារ ATTENTION')}
              </span>
              <span className="text-sm font-bold text-amber-300">
                {profile.qkNorm ? 'QK-Norm + z-loss' : tr('Norm/Bias Excl.', 'លើកលែង Norm/Bias')}
              </span>
              <span className="text-[10px] text-slate-400 block tabular-nums">
                z_loss={profile.zLossWeight === 0 ? '0' : '1e-4'}
              </span>
            </div>
          </div>

          <p className={`text-xs text-slate-400 leading-relaxed ${isKm ? 'font-khmer' : ''}`}>
            {isKm ? profile.wdRationaleKm : profile.wdRationale}
          </p>
        </div>
      </div>

      {/* LR Schedule Comparison Chart + 1.5B vs 3B GQA Comparison Table */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* LR Schedule Chart (1.5B vs 3B GQA) */}
        <div className="xl:col-span-7 p-5 rounded-2xl border border-slate-800 bg-slate-950/60 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h4 className={`text-sm font-bold text-white ${isKm ? 'font-khmer' : ''}`}>
                {tr(
                  'Learning Rate Warm-up & Cosine Decay Trajectory (×1e-4)',
                  'ខ្សែកោង Learning Rate Warm-up & Cosine Decay (×1e-4)'
                )}
              </h4>
              <p className={`text-[11px] text-slate-400 ${isKm ? 'font-khmer' : ''}`}>
                {tr(
                  'Vertical markers highlight warm-up completion: 2.0k steps (1.5B GQA) vs 2.8k steps (3B GQA).',
                  'បន្ទាត់បញ្ឈរបង្ហាញចំណុចបញ្ចប់ Warm-up៖ 2.0k ជំហាន (1.5B GQA) ធៀបនឹង 2.8k ជំហាន (3B GQA)។'
                )}
              </p>
            </div>
          </div>

          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={scheduleChartData} margin={{ top: 10, right: 16, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="stepLabel"
                  stroke="#64748b"
                  tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }}
                />
                <YAxis
                  stroke="#64748b"
                  domain={[0, 3.4]}
                  tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }}
                  tickFormatter={(v) => `${v}e-4`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#020617',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                    fontFamily: 'monospace'
                  }}
                  formatter={(value) => [`${value ?? ''} × 1e-4`]}
                  labelFormatter={(label) => `${tr('Step', 'ជំហាន')}: ${label}`}
                />
                <Legend wrapperStyle={{ fontSize: '12px', fontFamily: 'monospace' }} />
                <ReferenceLine
                  x="2.0k"
                  stroke="#fbbf24"
                  strokeDasharray="4 4"
                  label={{
                    value: '1.5B Warmup',
                    position: 'top',
                    fill: '#fbbf24',
                    fontSize: 10
                  }}
                />
                <ReferenceLine
                  x="2.8k"
                  stroke="#22d3ee"
                  strokeDasharray="4 4"
                  label={{
                    value: '3B Warmup',
                    position: 'insideTopRight',
                    fill: '#22d3ee',
                    fontSize: 10
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="lr15b"
                  name={tr('1.5B GQA (Peak 3.0e-4)', '1.5B GQA (កំពូល 3.0e-4)')}
                  stroke="#fbbf24"
                  strokeWidth={selectedSize === '1.5b_gqa' ? 3 : 1.75}
                  dot={{ r: 2.5 }}
                />
                <Line
                  type="monotone"
                  dataKey="lr3b"
                  name={tr('3B GQA (Peak 2.2e-4)', '3B GQA (កំពូល 2.2e-4)')}
                  stroke="#22d3ee"
                  strokeWidth={selectedSize === '3b_gqa' ? 3 : 1.75}
                  dot={{ r: 2.5 }}
                />
                {selectedSize === '7b_gqa' && (
                  <Line
                    type="monotone"
                    dataKey="lr7b"
                    name={tr('7B GQA (Peak 1.5e-4)', '7B GQA (កំពូល 1.5e-4)')}
                    stroke="#34d399"
                    strokeWidth={3}
                    dot={{ r: 2.5 }}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Side-by-Side 1.5B vs 3B GQA Diff Table */}
        <div className="xl:col-span-5 p-5 rounded-2xl border border-slate-800 bg-slate-950/60 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ArrowLeftRight className="w-4 h-4 text-amber-400" />
              <h4 className={`text-sm font-bold text-white ${isKm ? 'font-khmer' : ''}`}>
                {tr('1.5B vs 3B GQA Scaling Diff', 'ភាពខុសគ្នា 1.5B ធៀបនឹង 3B GQA')}
              </h4>
            </div>
            <span className="font-mono text-[10px] text-slate-400">@ seq={seqLength}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                  <th className={`py-2 pr-2 ${isKm ? 'font-khmer' : ''}`}>
                    {tr('Hyperparameter', 'ប៉ារ៉ាម៉ែត្រ')}
                  </th>
                  <th className="py-2 px-2 text-amber-300">1.5B GQA</th>
                  <th className="py-2 pl-2 text-cyan-300">3B GQA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70 font-mono">
                <tr>
                  <td className={`py-2.5 pr-2 text-slate-300 ${isKm ? 'font-khmer font-sans' : ''}`}>
                    {tr('Global Batch', 'Batch សរុប')}
                  </td>
                  <td className="py-2.5 px-2 text-white">2.10M tok</td>
                  <td className="py-2.5 pl-2 text-white">4.19M tok</td>
                </tr>
                <tr>
                  <td className={`py-2.5 pr-2 text-slate-300 ${isKm ? 'font-khmer font-sans' : ''}`}>
                    {tr('Peak / Min LR', 'LR កំពូល / ទាប')}
                  </td>
                  <td className="py-2.5 px-2 text-amber-300">3.0e-4 / 3.0e-5</td>
                  <td className="py-2.5 pl-2 text-cyan-300">2.2e-4 / 2.2e-5</td>
                </tr>
                <tr>
                  <td className={`py-2.5 pr-2 text-slate-300 ${isKm ? 'font-khmer font-sans' : ''}`}>
                    {tr('Warm-up Steps', 'ជំហាន Warm-up')}
                  </td>
                  <td className="py-2.5 px-2 text-white">2,000 (~4.2B tok)</td>
                  <td className="py-2.5 pl-2 text-white">2,800 (~11.7B tok)</td>
                </tr>
                <tr>
                  <td className={`py-2.5 pr-2 text-slate-300 ${isKm ? 'font-khmer font-sans' : ''}`}>
                    {tr('Weight Decay', 'Weight Decay')}
                  </td>
                  <td className="py-2.5 px-2 text-emerald-300">0.10</td>
                  <td className="py-2.5 pl-2 text-emerald-300">0.12</td>
                </tr>
                <tr>
                  <td className={`py-2.5 pr-2 text-slate-300 ${isKm ? 'font-khmer font-sans' : ''}`}>
                    {tr('Stability Guard', 'ការការពារស្ថិរភាព')}
                  </td>
                  <td className="py-2.5 px-2 text-slate-300">Clip 1.0</td>
                  <td className="py-2.5 pl-2 text-slate-300">QK-Norm + z-loss</td>
                </tr>
                <tr>
                  <td className={`py-2.5 pr-2 text-slate-300 ${isKm ? 'font-khmer font-sans' : ''}`}>
                    {tr('GQA KV Ratio', 'សមាមាត្រ GQA')}
                  </td>
                  <td className="py-2.5 px-2 text-slate-300">4:1 (4 KV)</td>
                  <td className="py-2.5 pl-2 text-slate-300">8:1 (3 KV)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Copyable YAML Training Config */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950/80 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-800 bg-slate-900/70">
          <span className="font-mono text-xs text-slate-300">
            khmer_{selectedSize}_seq{seqLength}_{gpuCount}gpu.yaml
          </span>
          <button
            type="button"
            onClick={handleCopyYaml}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-700 bg-slate-800 hover:border-amber-400/60 text-xs text-slate-200 transition-colors"
          >
            {copiedYaml ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className={`text-emerald-300 ${isKm ? 'font-khmer' : ''}`}>
                  {tr('Copied', 'បានចម្លង')}
                </span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-amber-400" />
                <span className={isKm ? 'font-khmer' : ''}>
                  {tr('Copy YAML', 'ចម្លង YAML')}
                </span>
              </>
            )}
          </button>
        </div>
        <pre className="p-4 text-[11px] font-mono text-slate-300 overflow-x-auto leading-relaxed">
          {yamlConfigSnippet}
        </pre>
      </div>
    </div>
  );
};
