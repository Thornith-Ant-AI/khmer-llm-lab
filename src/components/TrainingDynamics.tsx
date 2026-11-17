import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';
import {
  Activity,
  TrendingDown,
  ShieldCheck,
  AlertTriangle,
  Layers,
  GitCommit,
  Sliders,
  CheckCircle2,
  Zap
} from 'lucide-react';

import { useLanguage } from '../contexts/LanguageContext';
import { LossCurvesVisualizer } from './LossCurvesVisualizer';
import { TrainingHyperparameterAdvisor } from './TrainingHyperparameterAdvisor';
import { BatchSizeEfficiencyChart } from './BatchSizeEfficiencyChart';
import { ComputeResourceEstimator } from './ComputeResourceEstimator';

export type CheckpointModelId =
  | 'khmer_1_5b_spm32k'
  | 'khmer_3_0b_bilingual'
  | 'khmer_7_0b_enterprise'
  | 'baseline_byte_bpe';

interface CheckpointModelMeta {
  id: CheckpointModelId;
  name: string;
  nameKm: string;
  shortLabel: string;
  shortLabelKm: string;
  params: string;
  tokenizer: string;
  tokenizerKm: string;
  tokensTrained: string;
  color: string;
  finalTrainLoss: number;
  finalValLoss: number;
  finalPerplexity: number;
  meanGradNorm: number;
  maxGradNorm: number;
  stabilityVerdict: 'OPTIMAL' | 'CLIPPED_STABLE' | 'UNSTABLE_FRAGMENTED';
  summary: string;
  summaryKm: string;
}

export const CHECKPOINT_MODELS: Record<CheckpointModelId, CheckpointModelMeta> = {
  khmer_1_5b_spm32k: {
    id: 'khmer_1_5b_spm32k',
    name: 'Khmer-Foundation-1.5B (SPM-32k)',
    nameKm: 'មូលដ្ឋានខ្មែរ-1.5B (SPM-32k)',
    shortLabel: '1.5B · SPM-32k',
    shortLabelKm: '1.5B · SPM-32k',
    params: '1.5B',
    tokenizer: 'Khmer Syllable SentencePiece 32k',
    tokenizerKm: 'SentencePiece ព្យាង្គខ្មែរ 32k',
    tokensTrained: '45B Tokens',
    color: '#fbbf24', // amber-400
    finalTrainLoss: 1.98,
    finalValLoss: 2.09,
    finalPerplexity: 8.08,
    meanGradNorm: 0.34,
    maxGradNorm: 0.89,
    stabilityVerdict: 'OPTIMAL',
    summary: 'Core Chinchilla-balanced Khmer baseline. Zero gradient explosions; clean annealing drop at 42k steps.',
    summaryKm: 'ម៉ូដែលគោលខ្មែរដែលមានតុល្យភាពតាមច្បាប់ Chinchilla។ គ្មានការផ្ទុះ Gradient និងចុះថយយ៉ាងស្អាតនៅជំហាន 42k។'
  },
  khmer_3_0b_bilingual: {
    id: 'khmer_3_0b_bilingual',
    name: 'Khmer-Bilingual-3.0B (SPM-64k)',
    nameKm: 'ខ្មែរ-ទ្វេភាសា-3.0B (SPM-64k)',
    shortLabel: '3.0B · Bilingual',
    shortLabelKm: '3.0B · ទ្វេភាសា',
    params: '3.0B',
    tokenizer: 'Khmer+EN Extended 64k',
    tokenizerKm: 'វាក្យសព្ទខ្មែរ+អង់គ្លេស 64k',
    tokensTrained: '80B Tokens',
    color: '#22d3ee', // cyan-400
    finalTrainLoss: 1.79,
    finalValLoss: 1.91,
    finalPerplexity: 6.75,
    meanGradNorm: 0.39,
    maxGradNorm: 1.04,
    stabilityVerdict: 'OPTIMAL',
    summary: 'Strongest Khmer+English cross-lingual transfer with lowest validation perplexity across legal and STEM splits.',
    summaryKm: 'ការផ្ទេរចំណេះដឹងឆ្លងភាសាខ្មែរ+អង់គ្លេសខ្លាំងបំផុត ដោយមាន Perplexity ទាបលើអត្ថបទច្បាប់ និង STEM។'
  },
  khmer_7_0b_enterprise: {
    id: 'khmer_7_0b_enterprise',
    name: 'Khmer-Enterprise-7.0B (GQA)',
    nameKm: 'ខ្មែរ-សហគ្រាស-7.0B (GQA)',
    shortLabel: '7.0B · GQA',
    shortLabelKm: '7.0B · GQA',
    params: '7.0B',
    tokenizer: 'Khmer+Code 64k',
    tokenizerKm: 'វាក្យសព្ទខ្មែរ+កូដ 64k',
    tokensTrained: '150B Tokens',
    color: '#34d399', // emerald-400
    finalTrainLoss: 1.66,
    finalValLoss: 1.82,
    finalPerplexity: 6.17,
    meanGradNorm: 0.44,
    maxGradNorm: 1.38,
    stabilityVerdict: 'CLIPPED_STABLE',
    summary: 'Exhibits minor transient gradient spikes around 18k & 34k steps; safely bounded by 1.0 grad clipping + QK-Norm.',
    summaryKm: 'មានការកើនឡើង Gradient បន្តិចបន្តួចនៅជំហាន 18k និង 34k ប៉ុន្តែត្រូវបានទប់ស្កាត់ដោយ Grad Clip 1.0 និង QK-Norm។'
  },
  baseline_byte_bpe: {
    id: 'baseline_byte_bpe',
    name: 'Naive Byte-Fallback-1.5B (Baseline)',
    nameKm: 'មូលដ្ឋាន Byte-Fallback-1.5B',
    shortLabel: '1.5B · Byte-BPE',
    shortLabelKm: '1.5B · Byte-BPE',
    params: '1.5B',
    tokenizer: 'Standard Western tiktoken (No Khmer)',
    tokenizerKm: 'tiktoken ស្តង់ដារលោកខាងលិច (គ្មានខ្មែរ)',
    tokensTrained: '45B Tokens',
    color: '#f43f5e', // rose-500
    finalTrainLoss: 2.54,
    finalValLoss: 2.71,
    finalPerplexity: 15.03,
    meanGradNorm: 0.72,
    maxGradNorm: 2.15,
    stabilityVerdict: 'UNSTABLE_FRAGMENTED',
    summary: 'Suffers severe UTF-8 byte sequence inflation, noisy attention gradients, and 2× higher validation perplexity.',
    summaryKm: 'រងផលប៉ះពាល់ពីការបំបែកបៃ UTF-8 ហួសហេតុ រំញ័រ Gradient ខ្លាំង និងមាន Perplexity ខ្ពស់ជាង ២ ដង។'
  }
};

interface DynamicsPoint {
  stepK: number;
  stepLabel: string;
  tokensB: number;
  lrCosine: number;
  // Loss values
  loss_1_5b: number;
  val_1_5b: number;
  loss_3_0b: number;
  val_3_0b: number;
  loss_7_0b: number;
  val_7_0b: number;
  loss_baseline: number;
  val_baseline: number;
  // Perplexity values
  ppl_1_5b: number;
  ppl_3_0b: number;
  ppl_7_0b: number;
  ppl_baseline: number;
  // Gradient Norms
  grad_1_5b: number;
  grad_3_0b: number;
  grad_7_0b: number;
  grad_baseline: number;
  grad_unclipped_sim: number;
  phaseNote: string;
  phaseNoteKm: string;
}

function generateTrainingDynamicsSeries(): DynamicsPoint[] {
  const steps = [1, 2, 4, 6, 8, 10, 12, 15, 18, 20, 22, 25, 28, 30, 34, 38, 40, 42, 45, 48, 50];

  return steps.map((k) => {
    const t = k / 50; // 0.02 -> 1.0
    const decay = Math.pow(k, -0.22);
    const annealBoost = k >= 42 ? (k - 40) * 0.011 : 0;

    // Cosine LR with 2k linear warmup (peak 3.0e-4)
    const lrCosine =
      k <= 2
        ? Number(((k / 2) * 3.0).toFixed(2))
        : Number((0.3 + 2.7 * 0.5 * (1 + Math.cos(Math.PI * ((k - 2) / 48)))).toFixed(2));

    // Train Losses
    const loss_1_5b = Number(Math.max(1.98, 4.18 * decay + 0.24 - annealBoost).toFixed(3));
    const val_1_5b = Number((loss_1_5b + 0.11 + 0.02 * Math.sin(k * 0.4)).toFixed(3));

    const loss_3_0b = Number(Math.max(1.79, 4.02 * Math.pow(k, -0.235) + 0.19 - annealBoost * 1.1).toFixed(3));
    const val_3_0b = Number((loss_3_0b + 0.12 + 0.015 * Math.cos(k * 0.3)).toFixed(3));

    const loss_7_0b = Number(Math.max(1.66, 3.88 * Math.pow(k, -0.245) + 0.14 - annealBoost * 1.15).toFixed(3));
    const val_7_0b = Number((loss_7_0b + 0.16 + 0.018 * Math.sin(k * 0.5)).toFixed(3));

    const loss_baseline = Number(Math.max(2.54, 4.65 * Math.pow(k, -0.17) + 0.15).toFixed(3));
    const val_baseline = Number((loss_baseline + 0.17 + 0.04 * Math.sin(k * 0.7)).toFixed(3));

    // Perplexities = exp(val_loss)
    const ppl_1_5b = Number(Math.exp(val_1_5b).toFixed(2));
    const ppl_3_0b = Number(Math.exp(val_3_0b).toFixed(2));
    const ppl_7_0b = Number(Math.exp(val_7_0b).toFixed(2));
    const ppl_baseline = Number(Math.exp(val_baseline).toFixed(2));

    // Gradient L2 Norms (with realistic spikes around step 18k and 34k)
    const spike18 = k === 18 ? 0.52 : k === 15 || k === 20 ? 0.12 : 0;
    const spike34 = k === 34 ? 0.48 : 0;

    const grad_1_5b = Number((0.46 - 0.16 * t + (k === 18 ? 0.24 : 0) + 0.04 * Math.sin(k * 1.1)).toFixed(2));
    const grad_3_0b = Number((0.52 - 0.18 * t + (k === 18 ? 0.31 : 0) + 0.05 * Math.cos(k * 0.9)).toFixed(2));
    const grad_7_0b = Number(Math.min(1.38, 0.58 - 0.19 * t + spike18 + spike34 + 0.05 * Math.sin(k)).toFixed(2));
    const grad_baseline = Number((0.88 - 0.12 * t + (k % 6 === 0 ? 0.65 : 0) + 0.14 * Math.sin(k * 1.6)).toFixed(2));
    const grad_unclipped_sim = Number(
      (k === 18 ? 2.45 : k === 34 ? 2.18 : k === 28 ? 1.64 : grad_7_0b * 1.25).toFixed(2)
    );

    let phaseNote = 'Steady Cosine Pretraining';
    let phaseNoteKm = 'ការបណ្តុះបណ្តាល Cosine ថេរ';
    if (k <= 2) {
      phaseNote = 'Linear LR Warmup (0 -> 3.0e-4)';
      phaseNoteKm = 'កំដៅអត្រារៀនលីនេអ៊ែរ (0 -> 3.0e-4)';
    } else if (k === 25) {
      phaseNote = 'Tier-1 Gold Literature Upsampling (4×)';
      phaseNoteKm = 'បង្កើនទម្ងន់អក្សរសិល្ប៍កម្រិត ១ (4×)';
    } else if (k >= 42) {
      phaseNote = 'LR Annealing & High-Quality Cooldown';
      phaseNoteKm = 'បន្ថយអត្រារៀន និងដំណាក់កាលត្រជាក់គុណភាពខ្ពស់';
    }

    return {
      stepK: k,
      stepLabel: `${k}k`,
      tokensB: Number((k * 0.9).toFixed(1)),
      lrCosine,
      loss_1_5b,
      val_1_5b,
      loss_3_0b,
      val_3_0b,
      loss_7_0b,
      val_7_0b,
      loss_baseline,
      val_baseline,
      ppl_1_5b,
      ppl_3_0b,
      ppl_7_0b,
      ppl_baseline,
      grad_1_5b,
      grad_3_0b,
      grad_7_0b,
      grad_baseline,
      grad_unclipped_sim,
      phaseNote,
      phaseNoteKm
    };
  });
}

const CHART_TOOLTIP_STYLE = {
  backgroundColor: '#020617',
  borderColor: '#1e293b',
  borderRadius: '0.75rem',
  fontSize: '12px',
  fontFamily: 'monospace',
  color: '#f8fafc'
};

export const TrainingDynamics: React.FC = () => {
  const { isKm, tr } = useLanguage();
  const [selectedCheckpoint, setSelectedCheckpoint] = useState<CheckpointModelId>('khmer_1_5b_spm32k');
  const [compareAllModels, setCompareAllModels] = useState<boolean>(true);
  const [pplScale, setPplScale] = useState<'linear' | 'log'>('log');
  const [showUnclippedAnomaly, setShowUnclippedAnomaly] = useState<boolean>(false);
  const [inspectedStepK, setInspectedStepK] = useState<number>(45);

  const series = useMemo(() => generateTrainingDynamicsSeries(), []);
  const activeMeta = CHECKPOINT_MODELS[selectedCheckpoint];

  const checkpointMilestones = useMemo(() => {
    const milestoneSteps = [5, 15, 25, 34, 42, 50];
    return milestoneSteps.map((target) => {
      // Find closest point in series
      const pt = series.reduce((prev, curr) =>
        Math.abs(curr.stepK - target) < Math.abs(prev.stepK - target) ? curr : prev
      );

      let trainLoss = pt.loss_1_5b;
      let valLoss = pt.val_1_5b;
      let ppl = pt.ppl_1_5b;
      let grad = pt.grad_1_5b;

      if (selectedCheckpoint === 'khmer_3_0b_bilingual') {
        trainLoss = pt.loss_3_0b;
        valLoss = pt.val_3_0b;
        ppl = pt.ppl_3_0b;
        grad = pt.grad_3_0b;
      } else if (selectedCheckpoint === 'khmer_7_0b_enterprise') {
        trainLoss = pt.loss_7_0b;
        valLoss = pt.val_7_0b;
        ppl = pt.ppl_7_0b;
        grad = pt.grad_7_0b;
      } else if (selectedCheckpoint === 'baseline_byte_bpe') {
        trainLoss = pt.loss_baseline;
        valLoss = pt.val_baseline;
        ppl = pt.ppl_baseline;
        grad = pt.grad_baseline;
      }

      const status =
        grad > 1.4
          ? 'SPIKE_ALERT'
          : grad > 0.95
          ? 'CLIPPED_AT_1.0'
          : pt.stepK >= 42
          ? 'ANNEALED'
          : 'STABLE';

      return {
        checkpointName: `ckpt-${pt.stepK}k`,
        stepK: pt.stepK,
        tokensB: pt.tokensB,
        lr: `${pt.lrCosine}e-4`,
        trainLoss,
        valLoss,
        ppl,
        grad,
        status,
        phaseNote: pt.phaseNote,
        phaseNoteKm: pt.phaseNoteKm
      };
    });
  }, [series, selectedCheckpoint]);

  const activeDataKeyMap: Record<
    CheckpointModelId,
    { train: keyof DynamicsPoint; val: keyof DynamicsPoint; ppl: keyof DynamicsPoint; grad: keyof DynamicsPoint }
  > = {
    khmer_1_5b_spm32k: { train: 'loss_1_5b', val: 'val_1_5b', ppl: 'ppl_1_5b', grad: 'grad_1_5b' },
    khmer_3_0b_bilingual: { train: 'loss_3_0b', val: 'val_3_0b', ppl: 'ppl_3_0b', grad: 'grad_3_0b' },
    khmer_7_0b_enterprise: { train: 'loss_7_0b', val: 'val_7_0b', ppl: 'ppl_7_0b', grad: 'grad_7_0b' },
    baseline_byte_bpe: { train: 'loss_baseline', val: 'val_baseline', ppl: 'ppl_baseline', grad: 'grad_baseline' }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className={`inline-flex items-center gap-2 text-xs font-semibold text-amber-400 tracking-wider ${isKm ? 'font-khmer' : 'uppercase font-mono'}`}>
            <Activity className="w-3.5 h-3.5" />
            <span>{tr('PRETRAINING TELEMETRY & CONVERGENCE BENCHMARKS', 'ការវាស់វែងការបណ្តុះបណ្តាលដំបូង និងការរួមបញ្ចូលគ្នានៃតម្លៃ Loss')}</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>{tr('RECHARTS OBSERVABILITY', 'ក្រាហ្វវិភាគ RECHARTS')}</span>
          </div>
          <h2 className={`text-2xl sm:text-3xl font-bold text-white tracking-tight ${isKm ? 'font-khmer' : ''}`}>
            {tr('Training Dynamics & Checkpoint Convergence', 'ថាមវន្តការបណ្តុះបណ្តាល និងភាពរឹងមាំតាម Checkpoint')}
          </h2>
          <p className={`text-sm text-slate-300 max-w-3xl leading-relaxed ${isKm ? 'font-khmer' : ''}`}>
            {tr(
              'Visualize hypothetical pretraining loss curves, Khmer evaluation perplexity reduction, and L2 gradient norm stability across 50,000 optimization steps and model checkpoints.',
              'មើលខ្សែកោង Loss នៃការបណ្តុះបណ្តាលដំបូង ការថយចុះនៃ Perplexity ភាសាខ្មែរ និងស្ថិរភាព L2 Gradient Norm នៅលើជំហានបង្កើនប្រសិទ្ធភាពចំនួន ៥០,០០០ ជំហាន និង Checkpoint ម៉ូដែលផ្សេងៗ។'
            )}
          </p>
        </div>

        {/* Multi-model Comparison Toggle */}
        <div className="flex items-center gap-2 shrink-0 self-start lg:self-auto">
          <button
            type="button"
            onClick={() => setCompareAllModels(!compareAllModels)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors ${
              isKm ? 'font-khmer' : 'font-mono'
            } ${
              compareAllModels
                ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-sm'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>
              {compareAllModels
                ? tr('Comparing All 4 Runs', 'កំពុងប្រៀបធៀបទាំង ៤ ម៉ូដែល')
                : tr('Single Run Deep-Dive', 'វិភាគស៊ីជម្រៅ ១ ម៉ូដែល')}
            </span>
          </button>
        </div>
      </div>

      {/* Interactive Loss Curves Visualizer (1.5B vs 3B GQA + Upload CSV/JSON) */}
      <LossCurvesVisualizer />

      {/* Training Hyperparameter Advisor (Batch Size, LR Warmup, Weight Decay for 1.5B vs 3B GQA) */}
      <TrainingHyperparameterAdvisor selectedCheckpoint={selectedCheckpoint} />

      {/* D3 Batch Size Efficiency Visualization (Token Count vs Optimal Micro-Batch Size) */}
      <BatchSizeEfficiencyChart selectedCheckpoint={selectedCheckpoint} />

      {/* Compute Resource Estimator (TFLOPS/s from Architecture & Duration) */}
      <ComputeResourceEstimator selectedCheckpoint={selectedCheckpoint} />

      {/* Checkpoint Model Run Selector Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.values(CHECKPOINT_MODELS).map((model) => {
          const isSelected = selectedCheckpoint === model.id;
          return (
            <button
              key={model.id}
              type="button"
              onClick={() => setSelectedCheckpoint(model.id)}
              className={`text-left p-4 rounded-2xl border transition-all space-y-2 ${
                isSelected
                  ? 'bg-slate-900 border-amber-400/70 shadow-lg shadow-amber-950/20'
                  : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: model.color }}
                  />
                  <span className={`text-xs font-bold text-white truncate ${isKm ? 'font-khmer' : 'font-mono'}`}>
                    {isKm ? model.shortLabelKm : model.shortLabel}
                  </span>
                </div>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0 ${isKm ? 'font-khmer' : 'font-mono'} ${
                  model.stabilityVerdict === 'OPTIMAL'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    : model.stabilityVerdict === 'CLIPPED_STABLE'
                    ? 'bg-amber-950 text-amber-300 border border-amber-800'
                    : 'bg-rose-950 text-rose-300 border border-rose-800'
                }`}>
                  {model.stabilityVerdict === 'OPTIMAL'
                    ? tr('STABLE', 'មានស្ថិរភាព')
                    : model.stabilityVerdict === 'CLIPPED_STABLE'
                    ? tr('CLIPPED', 'បានកាត់កម្រិត')
                    : tr('NOISY', 'រំញ័រខ្លាំង')}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1 font-mono text-xs">
                <div>
                  <span className={`text-[10px] text-slate-500 block ${isKm ? 'font-khmer' : ''}`}>
                    {tr('VAL LOSS', 'VAL LOSS')}
                  </span>
                  <span className="text-white font-bold tabular-nums">{model.finalValLoss}</span>
                </div>
                <div>
                  <span className={`text-[10px] text-slate-500 block ${isKm ? 'font-khmer' : ''}`}>
                    {tr('PPL', 'PPL')}
                  </span>
                  <span className="text-cyan-300 font-bold tabular-nums">{model.finalPerplexity}</span>
                </div>
                <div>
                  <span className={`text-[10px] text-slate-500 block ${isKm ? 'font-khmer' : ''}`}>
                    {tr('GRAD MAX', 'GRAD អតិបរមា')}
                  </span>
                  <span className="text-amber-300 font-bold tabular-nums">{model.maxGradNorm}</span>
                </div>
              </div>

              <p className={`text-[11px] text-slate-400 leading-snug line-clamp-2 ${isKm ? 'font-khmer' : ''}`}>
                {isKm ? model.summaryKm : model.summary}
              </p>
            </button>
          );
        })}
      </div>

      {/* Chart 1: Loss Curves (Training & Validation Cross-Entropy) */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-amber-400" />
              <h3 className={`text-base font-bold text-white ${isKm ? 'font-khmer' : ''}`}>
                {tr('Cross-Entropy Loss Convergence (0k – 50k Optimization Steps)', 'ការរួមចុះនៃ Cross-Entropy Loss (ជំហាន 0k – 50k)')}
              </h3>
            </div>
            <p className={`text-xs text-slate-400 ${isKm ? 'font-khmer' : ''}`}>
              {compareAllModels
                ? tr(
                    'Comparing validation loss trajectories across 1.5B, 3.0B, 7.0B Khmer-SPM runs vs. unadapted Byte-Fallback baseline.',
                    'ប្រៀបធៀបគន្លង Validation Loss រវាងម៉ូដែល Khmer-SPM 1.5B, 3.0B, 7.0B ធៀបនឹងមូលដ្ឋាន Byte-Fallback។'
                  )
                : tr(
                    `Inspecting Train vs. Khmer Validation Loss for ${activeMeta.name} (${activeMeta.tokenizer}).`,
                    `កំពុងពិនិត្យ Train Loss ធៀបនឹង Khmer Validation Loss សម្រាប់ ${activeMeta.nameKm} (${activeMeta.tokenizerKm})។`
                  )}
            </p>
          </div>

          <div className={`flex items-center gap-2 text-[11px] text-slate-400 ${isKm ? 'font-khmer' : 'font-mono'}`}>
            <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800">
              {tr('Inspected Step:', 'ជំហានកំពុងពិនិត្យ៖')} <strong className="text-amber-400 font-mono">{inspectedStepK}k</strong>
            </span>
          </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={series} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey="stepLabel"
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }}
              />
              <YAxis
                domain={[1.4, 4.8]}
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }}
                label={{
                  value: tr('Cross-Entropy Loss', 'កម្រិត Loss (Cross-Entropy)'),
                  angle: -90,
                  position: 'insideLeft',
                  fill: '#94a3b8',
                  fontSize: 11
                }}
              />
              <Tooltip
                contentStyle={CHART_TOOLTIP_STYLE}
                formatter={(value: unknown, name: unknown) => [Number(value).toFixed(3), String(name)]}
                labelFormatter={(label: unknown) =>
                  tr(`Step ${String(label)} · Checkpoint Horizon`, `ជំហាន ${String(label)} · កម្រិត Checkpoint`)
                }
              />
              <Legend wrapperStyle={{ fontSize: '12px', fontFamily: 'monospace', paddingTop: '8px' }} />

              <ReferenceLine
                x="2k"
                stroke="#475569"
                strokeDasharray="4 4"
                label={{ value: tr('Warmup End', 'ចប់កំដៅ'), fill: '#94a3b8', fontSize: 10, position: 'top' }}
              />
              <ReferenceLine
                x="25k"
                stroke="#0284c7"
                strokeDasharray="4 4"
                label={{ value: tr('Tier-1 4× Upsample', 'បង្កើនទម្ងន់ 4×'), fill: '#38bdf8', fontSize: 10, position: 'top' }}
              />
              <ReferenceLine
                x="42k"
                stroke="#10b981"
                strokeDasharray="4 4"
                label={{ value: tr('LR Cooldown', 'បន្ថយ LR'), fill: '#34d399', fontSize: 10, position: 'top' }}
              />
              <ReferenceLine
                x={`${inspectedStepK}k`}
                stroke="#fbbf24"
                strokeWidth={1.5}
              />

              {compareAllModels ? (
                <>
                  <Line
                    type="monotone"
                    dataKey="val_1_5b"
                    name={tr('1.5B SPM-32k (Val Loss)', '1.5B SPM-32k (Val Loss)')}
                    stroke="#fbbf24"
                    strokeWidth={2.5}
                    dot={{ r: 2.5 }}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="val_3_0b"
                    name={tr('3.0B Bilingual (Val Loss)', '3.0B ទ្វេភាសា (Val Loss)')}
                    stroke="#22d3ee"
                    strokeWidth={2.5}
                    dot={{ r: 2.5 }}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="val_7_0b"
                    name={tr('7.0B Enterprise (Val Loss)', '7.0B សហគ្រាស (Val Loss)')}
                    stroke="#34d399"
                    strokeWidth={2.5}
                    dot={{ r: 2.5 }}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="val_baseline"
                    name={tr('1.5B Byte-BPE Baseline (Val)', '1.5B Byte-BPE មូលដ្ឋាន (Val)')}
                    stroke="#f43f5e"
                    strokeWidth={2}
                    strokeDasharray="5 4"
                    dot={false}
                  />
                </>
              ) : (
                <>
                  <Line
                    type="monotone"
                    dataKey={activeDataKeyMap[selectedCheckpoint].train}
                    name={`${isKm ? activeMeta.shortLabelKm : activeMeta.shortLabel} (${tr('Train Loss', 'Train Loss')})`}
                    stroke={activeMeta.color}
                    strokeWidth={2.5}
                    dot={{ r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey={activeDataKeyMap[selectedCheckpoint].val}
                    name={`${isKm ? activeMeta.shortLabelKm : activeMeta.shortLabel} (${tr('Validation Loss', 'Validation Loss')})`}
                    stroke="#e2e8f0"
                    strokeWidth={2}
                    strokeDasharray="5 4"
                    dot={{ r: 2.5 }}
                  />
                </>
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2 & Chart 3 Side-by-Side Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 2: Perplexity Reduction */}
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-cyan-400" />
                <h3 className={`text-sm font-bold text-white ${isKm ? 'font-khmer' : ''}`}>
                  {tr('Khmer Perplexity Reduction (exp(Val Loss))', 'ការថយចុះ Perplexity ខ្មែរ (exp(Val Loss))')}
                </h3>
              </div>
              <p className={`text-xs text-slate-400 ${isKm ? 'font-khmer' : ''}`}>
                {tr(
                  'Syllable-aware tokenization drops Khmer perplexity below 8.5 by 45k steps.',
                  'ការកាត់ថូខឹនតាមព្យាង្គខ្មែរជួយទម្លាក់ Perplexity មកក្រោម 8.5 ត្រឹមជំហាន 45k។'
                )}
              </p>
            </div>

            <div className={`flex items-center gap-1 p-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] shrink-0 ${isKm ? 'font-khmer' : 'font-mono'}`}>
              {(['log', 'linear'] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setPplScale(s)}
                  className={`px-2.5 py-1 rounded uppercase transition-colors ${
                    pplScale === s
                      ? 'bg-cyan-400 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {s === 'log' ? tr('LOG', 'លោការីត') : tr('LINEAR', 'លីនេអ៊ែរ')}
                </button>
              ))}
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series} margin={{ top: 10, right: 15, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="pplCyanGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22d3ee" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="pplAmberGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="#fbbf24" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="stepLabel"
                  stroke="#64748b"
                  tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }}
                />
                <YAxis
                  scale={pplScale}
                  domain={pplScale === 'log' ? [5, 130] : [0, 120]}
                  allowDataOverflow
                  stroke="#64748b"
                  tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }}
                />
                <Tooltip
                  contentStyle={CHART_TOOLTIP_STYLE}
                  formatter={(value: unknown, name: unknown) => [`${Number(value).toFixed(2)} PPL`, String(name)]}
                />
                <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />
                <ReferenceLine x={`${inspectedStepK}k`} stroke="#fbbf24" strokeDasharray="3 3" />

                {compareAllModels ? (
                  <>
                    <Area
                      type="monotone"
                      dataKey="ppl_baseline"
                      name={tr('Byte-BPE Baseline PPL', 'Byte-BPE មូលដ្ឋាន PPL')}
                      stroke="#f43f5e"
                      fillOpacity={0}
                      strokeWidth={1.8}
                      strokeDasharray="4 4"
                    />
                    <Area
                      type="monotone"
                      dataKey="ppl_1_5b"
                      name="1.5B SPM-32k PPL"
                      stroke="#fbbf24"
                      fill="url(#pplAmberGrad)"
                      strokeWidth={2.2}
                    />
                    <Area
                      type="monotone"
                      dataKey="ppl_3_0b"
                      name={tr('3.0B Bilingual PPL', '3.0B ទ្វេភាសា PPL')}
                      stroke="#22d3ee"
                      fill="url(#pplCyanGrad)"
                      strokeWidth={2.2}
                    />
                    <Area
                      type="monotone"
                      dataKey="ppl_7_0b"
                      name={tr('7.0B Enterprise PPL', '7.0B សហគ្រាស PPL')}
                      stroke="#34d399"
                      fillOpacity={0}
                      strokeWidth={2}
                    />
                  </>
                ) : (
                  <Area
                    type="monotone"
                    dataKey={activeDataKeyMap[selectedCheckpoint].ppl}
                    name={`${isKm ? activeMeta.shortLabelKm : activeMeta.shortLabel} Perplexity`}
                    stroke={activeMeta.color}
                    fill="url(#pplCyanGrad)"
                    strokeWidth={2.5}
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Gradient Norm & Stability Benchmarks */}
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <h3 className={`text-sm font-bold text-white ${isKm ? 'font-khmer' : ''}`}>
                  {tr('Global Gradient Norm & Stability (L2 Norm)', 'កម្រិត Gradient Norm សកល និងស្ថិរភាព (L2 Norm)')}
                </h3>
              </div>
              <p className={`text-xs text-slate-400 ${isKm ? 'font-khmer' : ''}`}>
                {tr(
                  '1.0 gradient clipping + QK-Norm prevent divergence on long Pali-Khmer sequences.',
                  'ការកាត់ Gradient 1.0 + QK-Norm ការពារភាពមិននឹងនរលើលំដាប់ពាក្យបាលី-ខ្មែរវែងៗ។'
                )}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowUnclippedAnomaly(!showUnclippedAnomaly)}
              className={`px-2.5 py-1 rounded-lg text-[11px] border transition-colors shrink-0 ${
                isKm ? 'font-khmer' : 'font-mono'
              } ${
                showUnclippedAnomaly
                  ? 'bg-rose-950 text-rose-300 border-rose-700 font-bold'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              {showUnclippedAnomaly
                ? tr('Showing Unclipped Spikes', 'កំពុងបង្ហាញការហក់ឡើងគ្មានការកាត់')
                : tr('+ Simulate Unclipped Spikes', '+ សាកល្បងការហក់ឡើងគ្មានការកាត់')}
            </button>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={series} margin={{ top: 10, right: 15, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="stepLabel"
                  stroke="#64748b"
                  tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }}
                />
                <YAxis
                  domain={[0, showUnclippedAnomaly ? 2.8 : 2.3]}
                  stroke="#64748b"
                  tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }}
                />
                <Tooltip
                  contentStyle={CHART_TOOLTIP_STYLE}
                  formatter={(value: unknown, name: unknown) => [`${Number(value).toFixed(2)} ||∇||₂`, String(name)]}
                />
                <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />
                <ReferenceLine
                  y={1.0}
                  stroke="#f59e0b"
                  strokeDasharray="4 4"
                  label={{ value: tr('Clip Threshold (1.0)', 'កម្រិតកាត់ (1.0)'), fill: '#fbbf24', fontSize: 10, position: 'insideTopRight' }}
                />

                {showUnclippedAnomaly && (
                  <Bar
                    dataKey="grad_unclipped_sim"
                    name={tr('Unclipped Spike Risk', 'ហានិភ័យហក់ឡើងគ្មានការកាត់')}
                    fill="#fb7185"
                    opacity={0.35}
                    radius={[3, 3, 0, 0]}
                  />
                )}

                <Line
                  type="monotone"
                  dataKey={activeDataKeyMap[selectedCheckpoint].grad}
                  name={`${isKm ? activeMeta.shortLabelKm : activeMeta.shortLabel} Grad Norm`}
                  stroke={activeMeta.color}
                  strokeWidth={2.5}
                  dot={{ r: 2.5 }}
                />
                <Line
                  type="monotone"
                  dataKey="grad_baseline"
                  name={tr('Byte-BPE Baseline Grad Norm', 'Byte-BPE មូលដ្ឋាន Grad Norm')}
                  stroke="#f43f5e"
                  strokeWidth={1.6}
                  strokeDasharray="4 4"
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Checkpoint Telemetry Comparison Table */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <GitCommit className="w-4 h-4 text-amber-400" />
              <h3 className={`text-base font-bold text-white ${isKm ? 'font-khmer' : ''}`}>
                {tr('Checkpoint Evaluation Benchmarks', 'ការវាស់ស្ទង់ Checkpoint តាមដំណាក់កាល')} ({isKm ? activeMeta.nameKm : activeMeta.name})
              </h3>
            </div>
            <p className={`text-xs text-slate-400 ${isKm ? 'font-khmer' : ''}`}>
              {tr(
                'Click any checkpoint row to inspect its optimization horizon across the Loss and Perplexity charts above.',
                'ចុចលើជួរ Checkpoint ណាមួយដើម្បីពិនិត្យជំហានបង្កើនប្រសិទ្ធភាពនៅលើក្រាហ្វ Loss និង Perplexity ខាងលើ។'
              )}
            </p>
          </div>

          <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            <span>AdamW (β1=0.9, β2=0.95) · Grad Clip 1.0</span>
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
          <table className="w-full text-left text-xs">
            <thead className={`bg-slate-900/90 text-slate-400 text-[11px] border-b border-slate-800 ${isKm ? 'font-khmer' : 'font-mono'}`}>
              <tr>
                <th className="py-3 px-4">{tr('Checkpoint ID', 'លេខ Checkpoint')}</th>
                <th className="py-3 px-4">{tr('Tokens Seen', 'ថូខឹនបានបណ្តុះ')}</th>
                <th className="py-3 px-4">{tr('Cosine LR', 'អត្រារៀន LR')}</th>
                <th className="py-3 px-4">{tr('Train Loss', 'Train Loss')}</th>
                <th className="py-3 px-4">{tr('Khmer Val Loss', 'Khmer Val Loss')}</th>
                <th className="py-3 px-4 text-cyan-400">{tr('Perplexity', 'Perplexity')}</th>
                <th className="py-3 px-4">{tr('Grad Norm', 'Grad Norm')}</th>
                <th className="py-3 px-4">{tr('Training Phase', 'ដំណាក់កាលបណ្តុះបណ្តាល')}</th>
                <th className="py-3 px-4 text-right">{tr('Stability', 'ស្ថិរភាព')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {checkpointMilestones.map((row) => {
                const isInspected = inspectedStepK === row.stepK;
                return (
                  <tr
                    key={row.checkpointName}
                    onClick={() => setInspectedStepK(row.stepK)}
                    className={`cursor-pointer transition-colors ${
                      isInspected
                        ? 'bg-amber-400/10 text-white'
                        : 'hover:bg-slate-900/60 text-slate-300'
                    }`}
                  >
                    <td className="py-3 px-4 font-bold text-amber-300">
                      {row.checkpointName}
                    </td>
                    <td className="py-3 px-4 tabular-nums">{row.tokensB}B</td>
                    <td className="py-3 px-4 tabular-nums text-slate-400">{row.lr}</td>
                    <td className="py-3 px-4 tabular-nums">{row.trainLoss.toFixed(3)}</td>
                    <td className="py-3 px-4 tabular-nums font-semibold text-white">{row.valLoss.toFixed(3)}</td>
                    <td className="py-3 px-4 tabular-nums font-bold text-cyan-300">{row.ppl.toFixed(2)}</td>
                    <td className="py-3 px-4 tabular-nums">{row.grad.toFixed(2)}</td>
                    <td className={`py-3 px-4 text-slate-400 text-[11px] ${isKm ? 'font-khmer' : 'font-sans'}`}>
                      {isKm ? row.phaseNoteKm : row.phaseNote}
                    </td>
                    <td className={`py-3 px-4 text-right ${isKm ? 'font-khmer' : ''}`}>
                      {row.status === 'SPIKE_ALERT' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-rose-950 text-rose-300 border border-rose-800">
                          <AlertTriangle className="w-3 h-3" />
                          <span>{tr('SPIKE', 'ហក់ឡើង')}</span>
                        </span>
                      ) : row.status === 'CLIPPED_AT_1.0' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-amber-950 text-amber-300 border border-amber-800">
                          <span>{tr('CLIPPED', 'បានកាត់')}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>
                            {row.status === 'ANNEALED'
                              ? tr('ANNEALED', 'បន្ថយ LR ហើយ')
                              : tr('STABLE', 'មានស្ថិរភាព')}
                          </span>
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
