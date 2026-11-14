import React, { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ReferenceLine
} from 'recharts';
import { Calendar, Clock, Layers } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export type ScalePresetId = '1.5b' | '3.0b' | '7.0b';
export type PhaseFilterId = 'all' | 'collection' | 'tokenization' | 'pretraining' | 'alignment';

interface GanttTaskDefinition {
  id: string;
  stageIndex: number;
  phase: Exclude<PhaseFilterId, 'all'>;
  label: string;
  labelKm: string;
  deliverable: string;
  deliverableKm: string;
  teamSpec: string;
  teamSpecKm: string;
  // [startWeek, durationWeeks] per scale preset
  timelines: Record<ScalePresetId, { start: number; duration: number }>;
}

interface GanttChartRow {
  id: string;
  stageIndex: number;
  phase: Exclude<PhaseFilterId, 'all'>;
  phaseLabel: string;
  label: string;
  deliverable: string;
  teamSpec: string;
  offset: number;
  duration: number;
  startWeek: number;
  endWeek: number;
  color: string;
}

const PHASE_META: Record<
  Exclude<PhaseFilterId, 'all'>,
  { label: string; labelKm: string; color: string; mutedColor: string }
> = {
  collection: {
    label: 'Data Collection & Cleansing',
    labelKm: 'ការប្រមូល និងសម្អាតទិន្នន័យ',
    color: '#fbbf24', // amber-400
    mutedColor: 'rgba(251, 191, 36, 0.45)'
  },
  tokenization: {
    label: 'Tokenization & Architecture',
    labelKm: 'ថូខិនណាយស័រ និងស្ថាបត្យកម្ម',
    color: '#22d3ee', // cyan-400
    mutedColor: 'rgba(34, 211, 238, 0.45)'
  },
  pretraining: {
    label: 'Pretraining Execution',
    labelKm: 'ការបណ្តុះបណ្តាលដំបូង (Pretraining)',
    color: '#34d399', // emerald-400
    mutedColor: 'rgba(52, 211, 153, 0.45)'
  },
  alignment: {
    label: 'SFT & Linguistic Eval',
    labelKm: 'SFT និងការវាយតម្លៃភាសា',
    color: '#a78bfa', // violet-400
    mutedColor: 'rgba(167, 139, 250, 0.45)'
  }
};

const SCALE_PRESETS: Record<
  ScalePresetId,
  {
    id: ScalePresetId;
    label: string;
    labelKm: string;
    cluster: string;
    clusterKm: string;
    totalWeeks: number;
    checkpointFreezeWeek: number;
  }
> = {
  '1.5b': {
    id: '1.5b',
    label: '1.5B Fast Track (45B Tokens)',
    labelKm: 'គំរូ 1.5B រហ័ស (45B ថូខិន)',
    cluster: '16× NVIDIA H100 SXM5',
    clusterKm: '16× NVIDIA H100 SXM5',
    totalWeeks: 14,
    checkpointFreezeWeek: 11
  },
  '3.0b': {
    id: '3.0b',
    label: '3.0B Bilingual (80B Tokens)',
    labelKm: 'គំរូ 3.0B ទ្វេភាសា (80B ថូខិន)',
    cluster: '32× NVIDIA H100 SXM5',
    clusterKm: '32× NVIDIA H100 SXM5',
    totalWeeks: 20,
    checkpointFreezeWeek: 16
  },
  '7.0b': {
    id: '7.0b',
    label: '7.0B Sovereign (150B Tokens)',
    labelKm: 'គំរូ 7.0B ទ្រង់ទ្រាយធំ (150B ថូខិន)',
    cluster: '64× NVIDIA H100 / TPU v4 Pod',
    clusterKm: '64× NVIDIA H100 / TPU v4 Pod',
    totalWeeks: 28,
    checkpointFreezeWeek: 23
  }
};

const GANTT_TASKS: GanttTaskDefinition[] = [
  {
    id: 'ingest-tier1',
    stageIndex: 0,
    phase: 'collection',
    label: '1. Tier-1 & Web Ingestion',
    labelKm: '១. ប្រមូលទិន្នន័យ Tier-1 និងគេហទំព័រ',
    deliverable: '5B+ raw tokens archived from RAC, Gazette, News, and CulturaX',
    deliverableKm: 'ប្រមូលថូខិនដើម 5B+ ពីរាជបណ្ឌិត្យសភា រាជកិច្ច សារព័ត៌មាន និង CulturaX',
    teamSpec: '2 Data Eng · 1 Linguist',
    teamSpecKm: 'វិស្វករទិន្នន័យ ២ · អ្នកភាសាវិទ្យា ១',
    timelines: {
      '1.5b': { start: 0, duration: 2.5 },
      '3.0b': { start: 0, duration: 3.5 },
      '7.0b': { start: 0, duration: 5 }
    }
  },
  {
    id: 'unicode-dedup',
    stageIndex: 0,
    phase: 'collection',
    label: '2. Unicode NFC & MinHash Dedup',
    labelKm: '២. ស្តង់ដារ Unicode NFC និងលុបស្ទួន',
    deliverable: 'Limon legacy purge, casino spam filter, LSH 0.80 deduplication',
    deliverableKm: 'កម្ចាត់កូដ Limon ចម្រោះសារល្បែង និងលុបទិន្នន័យស្ទួន LSH 0.80',
    teamSpec: '2 Data Eng · Spark/Ray Cluster',
    teamSpecKm: 'វិស្វករទិន្នន័យ ២ · ចង្កោម Spark/Ray',
    timelines: {
      '1.5b': { start: 1.5, duration: 2.5 },
      '3.0b': { start: 2, duration: 3.5 },
      '7.0b': { start: 3, duration: 4.5 }
    }
  },
  {
    id: 'spm-tokenizer',
    stageIndex: 1,
    phase: 'tokenization',
    label: '3. Khmer SentencePiece Tokenizer',
    labelKm: '៣. ផលិតថូខិនណាយស័រ SentencePiece',
    deliverable: '32k–64k BPE vocabulary achieving <= 1.8 tokens/word fertility',
    deliverableKm: 'វាក្យសព្ទ BPE 32k–64k សម្រេចអត្រា <= 1.8 ថូខិន/ពាក្យ',
    teamSpec: '1 NLP Researcher · 1 Linguist',
    teamSpecKm: 'អ្នកស្រាវជ្រាវ NLP ១ · អ្នកភាសាវិទ្យា ១',
    timelines: {
      '1.5b': { start: 3, duration: 2 },
      '3.0b': { start: 4, duration: 2.5 },
      '7.0b': { start: 5.5, duration: 3.5 }
    }
  },
  {
    id: 'arch-packing',
    stageIndex: 2,
    phase: 'tokenization',
    label: '4. Architecture & Data Packing',
    labelKm: '៤. ស្ថាបត្យកម្ម និងការខ្ចប់ទិន្នន័យ',
    deliverable: 'RoPE theta=500k, GQA 4:1 config, 4k/8k binary shard packing',
    deliverableKm: 'កំណត់ RoPE theta=500k, GQA 4:1 និងខ្ចប់ទិន្នន័យ 4k/8k',
    teamSpec: '2 ML Systems Eng',
    teamSpecKm: 'វិស្វករប្រព័ន្ធ ML ២',
    timelines: {
      '1.5b': { start: 4, duration: 1.5 },
      '3.0b': { start: 5.5, duration: 2 },
      '7.0b': { start: 7.5, duration: 2.5 }
    }
  },
  {
    id: 'cluster-warmup',
    stageIndex: 3,
    phase: 'pretraining',
    label: '5. Cluster Prep & LR Warmup',
    labelKm: '៥. រៀបចំចង្កោម GPU និង Warmup',
    deliverable: 'FSDP + FlashAttention-2 throughput validation, 2k-step linear warmup',
    deliverableKm: 'ផ្ទៀងផ្ទាត់ល្បឿន FSDP + FlashAttention-2 និងការកម្តៅ 2k ជំហាន',
    teamSpec: '2 Infra Eng · GPU Cluster',
    teamSpecKm: 'វិស្វករហេដ្ឋារចនាសម្ព័ន្ធ ២ · ចង្កោម GPU',
    timelines: {
      '1.5b': { start: 5, duration: 1.5 },
      '3.0b': { start: 7, duration: 1.5 },
      '7.0b': { start: 9.5, duration: 2 }
    }
  },
  {
    id: 'foundation-pretrain',
    stageIndex: 3,
    phase: 'pretraining',
    label: '6. Foundation Pretraining Run',
    labelKm: '៦. ការបណ្តុះបណ្តាលមូលដ្ឋានចម្បង',
    deliverable: 'Main cosine-decay pass over balanced Khmer/EN/Code shards',
    deliverableKm: 'ដំណើរការបង្វឹក Cosine-Decay លើទិន្នន័យខ្មែរ/អង់គ្លេស/កូដ',
    teamSpec: 'Automated FSDP · Loss Telemetry',
    teamSpecKm: 'FSDP ស្វ័យប្រវត្តិ · តាមដាន Loss',
    timelines: {
      '1.5b': { start: 6, duration: 4 },
      '3.0b': { start: 8, duration: 6 },
      '7.0b': { start: 11, duration: 9 }
    }
  },
  {
    id: 'annealing-context',
    stageIndex: 3,
    phase: 'pretraining',
    label: '7. Tier-1 Annealing & 8k Context',
    labelKm: '៧. ការបង្វឹកបញ្ចប់ Tier-1 និង 8k',
    deliverable: 'Upsampled RAC/Legal/Literature decay phase to stabilize perplexity',
    deliverableKm: 'បង្វឹកបន្ថែមលើទិន្នន័យស្តង់ដារខ្ពស់ ដើម្បីឱ្យ Perplexity នឹងនរ',
    teamSpec: '2 ML Eng · Checkpoints',
    teamSpecKm: 'វិស្វករ ML ២ · រក្សាទុក Checkpoint',
    timelines: {
      '1.5b': { start: 9.5, duration: 1.5 },
      '3.0b': { start: 13.5, duration: 2.5 },
      '7.0b': { start: 19.5, duration: 3.5 }
    }
  },
  {
    id: 'sft-dpo',
    stageIndex: 4,
    phase: 'alignment',
    label: '8. Khmer SFT & Honorific DPO',
    labelKm: '៨. SFT និងការសម្របសុជីវធម៌ DPO',
    deliverable: '50k+ native instruction pairs with royal/monastic/formal registers',
    deliverableKm: 'គូសំណួរ-ចម្លើយដើម 50k+ ជាមួយរាជសព្ទ សង្ឃសព្ទ និងភាសាផ្លូវការ',
    teamSpec: '2 Alignment Eng · 4 Annotators',
    teamSpecKm: 'វិស្វករ Alignment ២ · អ្នកកែសម្រួល ៤',
    timelines: {
      '1.5b': { start: 10.5, duration: 2 },
      '3.0b': { start: 15.5, duration: 2.5 },
      '7.0b': { start: 22, duration: 3.5 }
    }
  },
  {
    id: 'eval-release',
    stageIndex: 5,
    phase: 'alignment',
    label: '9. Belebele, TyDi QA & Audit',
    labelKm: '៩. តេស្ត Belebele, TyDi QA និងភាសាវិទូ',
    deliverable: 'Khmer MMLU benchmark suite + native linguist blind evaluation',
    deliverableKm: 'តេស្ត Khmer MMLU និងការវាយតម្លៃដោយអ្នកភាសាវិទ្យាខ្មែរ',
    teamSpec: 'Linguist Review Panel',
    teamSpecKm: 'គណៈកម្មការអ្នកភាសាវិទ្យា',
    timelines: {
      '1.5b': { start: 12, duration: 2 },
      '3.0b': { start: 17.5, duration: 2.5 },
      '7.0b': { start: 24.5, duration: 3.5 }
    }
  }
];

interface RoadmapGanttChartProps {
  activeStageIndex: number;
  onSelectStage: (stageIndex: number) => void;
}

export const RoadmapGanttChart: React.FC<RoadmapGanttChartProps> = ({
  activeStageIndex,
  onSelectStage
}) => {
  const { isKm, tr } = useLanguage();
  const [scalePreset, setScalePreset] = useState<ScalePresetId>('1.5b');
  const [phaseFilter, setPhaseFilter] = useState<PhaseFilterId>('all');

  const presetMeta = SCALE_PRESETS[scalePreset];

  const chartData = useMemo<GanttChartRow[]>(() => {
    return GANTT_TASKS.filter((task) => phaseFilter === 'all' || task.phase === phaseFilter).map(
      (task) => {
        const { start, duration } = task.timelines[scalePreset];
        const phaseInfo = PHASE_META[task.phase];
        const isStageSelected = task.stageIndex === activeStageIndex;
        return {
          id: task.id,
          stageIndex: task.stageIndex,
          phase: task.phase,
          phaseLabel: isKm ? phaseInfo.labelKm : phaseInfo.label,
          label: isKm ? task.labelKm : task.label,
          deliverable: isKm ? task.deliverableKm : task.deliverable,
          teamSpec: isKm ? task.teamSpecKm : task.teamSpec,
          offset: start,
          duration,
          startWeek: start,
          endWeek: Number((start + duration).toFixed(1)),
          color:
            phaseFilter !== 'all' || isStageSelected
              ? phaseInfo.color
              : phaseInfo.color
        };
      }
    );
  }, [scalePreset, phaseFilter, isKm, activeStageIndex]);

  const phaseSpans = useMemo(() => {
    const computeSpan = (phase: Exclude<PhaseFilterId, 'all'>) => {
      const tasks = GANTT_TASKS.filter((t) => t.phase === phase);
      const minStart = Math.min(...tasks.map((t) => t.timelines[scalePreset].start));
      const maxEnd = Math.max(
        ...tasks.map((t) => t.timelines[scalePreset].start + t.timelines[scalePreset].duration)
      );
      return {
        start: minStart,
        end: Number(maxEnd.toFixed(1)),
        duration: Number((maxEnd - minStart).toFixed(1))
      };
    };

    return {
      collection: computeSpan('collection'),
      tokenization: computeSpan('tokenization'),
      pretraining: computeSpan('pretraining'),
      alignment: computeSpan('alignment')
    };
  }, [scalePreset]);

  const formatWeek = (w: number) => (isKm ? `ស.${w}` : `W${w}`);

  return (
    <div className="p-5 sm:p-6 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-5">
      {/* Header & Scale Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="space-y-1">
          <div className={`inline-flex items-center gap-2 text-xs font-semibold text-amber-400 tracking-wider ${isKm ? 'font-khmer' : 'uppercase font-mono'}`}>
            <Calendar className="w-3.5 h-3.5" />
            <span>{tr('EXECUTION SCHEDULE GANTT CHART', 'តារាងកាលវិភាគប្រតិបត្តិការ (GANTT)')}</span>
          </div>
          <h3 className={`text-lg sm:text-xl font-bold text-white ${isKm ? 'font-khmer' : ''}`}>
            {tr(
              'Estimated Phase Timelines: Collection, Tokenization & Pretraining',
              'ការប៉ាន់ស្មានរយៈពេលតាមដំណាក់កាល៖ ប្រមូលទិន្នន័យ ថូខិន និងបង្វឹកម៉ូដែល'
            )}
          </h3>
          <p className={`text-xs text-slate-400 ${isKm ? 'font-khmer' : ''}`}>
            {tr(
              'Click any timeline bar to jump directly to that engineering stage below. Overlapping bars indicate parallelizable workstreams.',
              'ចុចលើរបារកាលវិភាគណាមួយដើម្បីបើកផែនការវិស្វកម្មខាងក្រោម។ របារត្រួតគ្នាបង្ហាញពីការងារដែលអាចធ្វើស្របគ្នា។'
            )}
          </p>
        </div>

        {/* Model Scale Preset Switcher */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800 shrink-0">
          {(Object.values(SCALE_PRESETS) as Array<(typeof SCALE_PRESETS)[ScalePresetId]>).map(
            (preset) => {
              const active = scalePreset === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setScalePreset(preset.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs transition-colors whitespace-nowrap shrink-0 ${
                    isKm ? 'font-khmer' : 'font-mono'
                  } ${
                    active
                      ? 'bg-amber-400 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {isKm ? preset.labelKm : preset.label}
                </button>
              );
            }
          )}
        </div>
      </div>

      {/* Phase Duration Summary Strip (Flat 1px Dividers) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60 space-y-1">
          <div className={`text-[11px] text-amber-400 font-semibold ${isKm ? 'font-khmer' : 'font-mono'}`}>
            {tr('Data Collection Span', 'រយៈពេលប្រមូលទិន្នន័យ')}
          </div>
          <div className="text-base font-bold text-white font-mono tabular-nums">
            {formatWeek(phaseSpans.collection.start)} – {formatWeek(phaseSpans.collection.end)}{' '}
            <span className="text-xs font-normal text-slate-400">
              ({phaseSpans.collection.duration} {tr('wks', 'សប្តាហ៍')})
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60 space-y-1">
          <div className={`text-[11px] text-cyan-400 font-semibold ${isKm ? 'font-khmer' : 'font-mono'}`}>
            {tr('Tokenization & Setup', 'ថូខិនណាយស័រ និងរចនាសម្ព័ន្ធ')}
          </div>
          <div className="text-base font-bold text-white font-mono tabular-nums">
            {formatWeek(phaseSpans.tokenization.start)} – {formatWeek(phaseSpans.tokenization.end)}{' '}
            <span className="text-xs font-normal text-slate-400">
              ({phaseSpans.tokenization.duration} {tr('wks', 'សប្តាហ៍')})
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60 space-y-1">
          <div className={`text-[11px] text-emerald-400 font-semibold ${isKm ? 'font-khmer' : 'font-mono'}`}>
            {tr('Pretraining Execution', 'រយៈពេល Pretraining')}
          </div>
          <div className="text-base font-bold text-white font-mono tabular-nums">
            {formatWeek(phaseSpans.pretraining.start)} – {formatWeek(phaseSpans.pretraining.end)}{' '}
            <span className="text-xs font-normal text-slate-400">
              ({phaseSpans.pretraining.duration} {tr('wks', 'សប្តាហ៍')})
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60 space-y-1">
          <div className={`text-[11px] text-violet-400 font-semibold flex items-center gap-1.5 ${isKm ? 'font-khmer' : 'font-mono'}`}>
            <Clock className="w-3 h-3 shrink-0" />
            <span>{tr('Total End-to-End', 'រយៈពេលសរុប')}</span>
          </div>
          <div className="text-base font-bold text-white font-mono tabular-nums">
            {presetMeta.totalWeeks} {tr('Weeks', 'សប្តាហ៍')}{' '}
            <span className="text-xs font-normal text-slate-400 truncate">
              · {isKm ? presetMeta.clusterKm : presetMeta.cluster}
            </span>
          </div>
        </div>
      </div>

      {/* Phase Filter Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className={`text-[11px] text-slate-500 flex items-center gap-1 mr-1 ${isKm ? 'font-khmer' : 'font-mono uppercase'}`}>
            <Layers className="w-3 h-3" />
            <span>{tr('PHASE FILTER:', 'ចម្រោះដំណាក់កាល៖')}</span>
          </span>
          {(
            [
              { id: 'all', label: tr('All Phases', 'គ្រប់ដំណាក់កាល'), swatch: null },
              {
                id: 'collection',
                label: tr('Data Collection', 'ប្រមូលទិន្នន័យ'),
                swatch: PHASE_META.collection.color
              },
              {
                id: 'tokenization',
                label: tr('Tokenization & Config', 'ថូខិន និងរចនាសម្ព័ន្ធ'),
                swatch: PHASE_META.tokenization.color
              },
              {
                id: 'pretraining',
                label: tr('Pretraining', 'បង្វឹកដំបូង'),
                swatch: PHASE_META.pretraining.color
              },
              {
                id: 'alignment',
                label: tr('SFT & Benchmarks', 'SFT និងវាយតម្លៃ'),
                swatch: PHASE_META.alignment.color
              }
            ] as const
          ).map((option) => {
            const active = phaseFilter === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setPhaseFilter(option.id)}
                className={`px-2.5 py-1 rounded-lg text-xs border transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                  isKm ? 'font-khmer' : 'font-mono'
                } ${
                  active
                    ? 'bg-slate-800 text-white border-amber-400/60 font-semibold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                {option.swatch && (
                  <span
                    className="w-2.5 h-2.5 rounded-sm shrink-0"
                    style={{ backgroundColor: option.swatch }}
                    aria-hidden="true"
                  />
                )}
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>

        <div className={`text-[11px] text-slate-400 font-mono tabular-nums ${isKm ? 'font-khmer' : ''}`}>
          {tr('Active Stage Highlighted:', 'ដំណាក់កាលកំពុងជ្រើស៖')}{' '}
          <span className="text-amber-400 font-bold font-mono">
            {tr('STAGE', 'ដំណាក់កាលទី')} 0{activeStageIndex + 1}
          </span>
        </div>
      </div>

      {/* Recharts Gantt Chart */}
      <div className="w-full h-[360px] rounded-xl border border-slate-800 bg-slate-950/70 p-3 sm:p-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 16, right: 24, left: 8, bottom: 16 }}
            barSize={20}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
            <XAxis
              type="number"
              domain={[0, presetMeta.totalWeeks]}
              allowDecimals={false}
              tickFormatter={formatWeek}
              stroke="#64748b"
              tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }}
              label={{
                value: isKm ? 'កាលវិភាគគម្រោង (សប្តាហ៍)' : 'Timeline (Weeks)',
                position: 'insideBottom',
                offset: -10,
                fill: '#64748b',
                fontSize: 11
              }}
            />
            <YAxis
              type="category"
              dataKey="label"
              width={isKm ? 220 : 210}
              stroke="#64748b"
              tick={{ fill: '#e2e8f0', fontSize: 11 }}
              axisLine={{ stroke: '#334155' }}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: 'rgba(148, 163, 184, 0.08)' }}
              content={({ active, payload }) => {
                if (!active || !payload || payload.length === 0) return null;
                const row = payload[0]?.payload as GanttChartRow | undefined;
                if (!row) return null;

                return (
                  <div className="max-w-xs p-3 rounded-xl bg-slate-950 border border-slate-700 shadow-xl space-y-1.5 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-[10px] font-bold ${isKm ? 'font-khmer' : 'font-mono uppercase'}`}
                        style={{ color: row.color }}
                      >
                        {row.phaseLabel}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {tr('Stage', 'ដំណាក់កាល')} 0{row.stageIndex + 1}
                      </span>
                    </div>
                    <div className={`font-bold text-white ${isKm ? 'font-khmer' : ''}`}>
                      {row.label}
                    </div>
                    <div className="font-mono text-[11px] text-amber-300 tabular-nums">
                      {formatWeek(row.startWeek)} → {formatWeek(row.endWeek)} ({row.duration}{' '}
                      {tr('weeks', 'សប្តាហ៍')})
                    </div>
                    <p className={`text-[11px] text-slate-300 leading-relaxed ${isKm ? 'font-khmer' : ''}`}>
                      {row.deliverable}
                    </p>
                    <div className={`text-[10px] text-slate-400 pt-1 border-t border-slate-800 ${isKm ? 'font-khmer' : 'font-mono'}`}>
                      {row.teamSpec}
                    </div>
                  </div>
                );
              }}
            />
            <ReferenceLine
              x={presetMeta.checkpointFreezeWeek}
              stroke="#f59e0b"
              strokeDasharray="4 4"
              label={{
                value: isKm
                  ? `បញ្ចប់ Pretraining (${formatWeek(presetMeta.checkpointFreezeWeek)})`
                  : `Base Freeze (${formatWeek(presetMeta.checkpointFreezeWeek)})`,
                position: 'top',
                fill: '#fbbf24',
                fontSize: 10
              }}
            />
            {/* Transparent offset bar for Gantt start position */}
            <Bar dataKey="offset" stackId="gantt" fill="transparent" isAnimationActive={false} />
            {/* Duration bar */}
            <Bar
              dataKey="duration"
              stackId="gantt"
              radius={[4, 4, 4, 4]}
              className="cursor-pointer"
              onClick={(barData) => {
                const row = barData?.payload as GanttChartRow | undefined;
                if (row && typeof row.stageIndex === 'number') {
                  onSelectStage(row.stageIndex);
                }
              }}
            >
              {chartData.map((entry) => {
                const isSelected = entry.stageIndex === activeStageIndex;
                return (
                  <Cell
                    key={entry.id}
                    fill={entry.color}
                    fillOpacity={isSelected ? 1 : 0.72}
                    stroke={isSelected ? '#ffffff' : 'transparent'}
                    strokeWidth={isSelected ? 1.5 : 0}
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
