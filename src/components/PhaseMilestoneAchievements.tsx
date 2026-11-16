import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell
} from 'recharts';
import {
  CheckCircle2,
  Circle,
  Award,
  RotateCcw,
  CheckCheck
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export interface PhaseMilestone {
  id: string;
  title: string;
  titleKm: string;
  detail: string;
  detailKm: string;
}

export interface PhaseMilestoneGroup {
  stageNumber: string;
  stageIndex: number;
  gateName: string;
  gateNameKm: string;
  phaseLabel: string;
  phaseLabelKm: string;
  milestones: PhaseMilestone[];
}

export const PHASE_MILESTONE_GROUPS: PhaseMilestoneGroup[] = [
  {
    stageNumber: '01',
    stageIndex: 0,
    gateName: 'Dataset Ready',
    gateNameKm: 'ទិន្នន័យរួចរាល់',
    phaseLabel: 'Data Collection',
    phaseLabelKm: 'ប្រមូលទិន្នន័យ',
    milestones: [
      {
        id: 'ms-01-dataset-ready',
        title: 'Dataset Ready (Unicode & Spam Purged)',
        titleKm: 'ទិន្នន័យរួចរាល់ (សម្អាត Unicode និងសាររំខាន)',
        detail: 'Tier 1–3 corpora consolidated with Limon ASCII artifacts and gambling spam removed (>95% Khmer purity).',
        detailKm: 'ប្រមូលផ្តុំទិន្នន័យកម្រិត 1–3 ដោយលុបពុម្ពអក្សរ Limon ASCII និងសារល្បែងស៊ីសង (>95% ភាពសុទ្ធខ្មែរ)។'
      },
      {
        id: 'ms-01-dedup-verified',
        title: 'MinHash LSH Deduplication Verified',
        titleKm: 'ផ្ទៀងផ្ទាត់ការលុបទិន្នន័យស្ទួន MinHash LSH',
        detail: 'Near-duplicate news syndications and boilerplate fragments removed at 0.80 Jaccard similarity.',
        detailKm: 'លុបចោលអត្ថបទព័ត៌មានស្ទួន និងបំណែកម៉ឺនុយដដែលៗតាមកម្រិត Jaccard 0.80។'
      },
      {
        id: 'ms-01-mix-locked',
        title: 'Tier Upsampling & Mix Ratios Locked',
        titleKm: 'កំណត់សមាមាត្រល្បាយ និងទម្ងន់ទិន្នន័យ',
        detail: 'Balanced pretraining blend finalized: 60% Khmer prose, 25% English reasoning, 15% Code & Math.',
        detailKm: 'កំណត់ល្បាយបង្វឹករួចរាល់៖ អត្ថបទខ្មែរ 60%, អង់គ្លេសតក្កវិជ្ជា 25%, កូដ និងគណិតវិទ្យា 15%។'
      },
      {
        id: 'ms-01-shards-exported',
        title: 'Cleaned Parquet Shards Exported',
        titleKm: 'នាំចេញឯកសារ Parquet ស្អាតរួចរាល់',
        detail: 'Training shards serialized with UTF-8 NFC normalization and checksum manifest.',
        detailKm: 'បម្លែងឯកសារបង្វឹកជា UTF-8 NFC រួមទាំងបញ្ជីផ្ទៀងផ្ទាត់ Checksum។'
      }
    ]
  },
  {
    stageNumber: '02',
    stageIndex: 1,
    gateName: 'Tokenizer Trained',
    gateNameKm: 'ថូខិនណាយស័របានបង្វឹក',
    phaseLabel: 'Tokenizer Lab',
    phaseLabelKm: 'ថូខិនណាយស័រ',
    milestones: [
      {
        id: 'ms-02-tokenizer-trained',
        title: 'Tokenizer Trained (32k/48k SentencePiece)',
        titleKm: 'ថូខិនណាយស័រត្រូវបានបង្វឹក (32k/48k SentencePiece)',
        detail: 'Custom BPE/Unigram model converged on balanced Khmer + English seed with character_coverage=0.9995.',
        detailKm: 'ម៉ូដែល BPE/Unigram ផ្ទាល់ខ្លួនបង្វឹកចប់សព្វគ្រប់ដោយរក្សា coverage=0.9995។'
      },
      {
        id: 'ms-02-coeng-intact',
        title: 'Coeng Subscript Ligatures Preserved',
        titleKm: 'រក្សាជើងព្យញ្ជនៈ (Coeng) នៅដដែល',
        detail: 'Confirmed subscript clusters (្ក, ្រ, ្ត) tokenize as atomic syllables without mid-cluster breaks.',
        detailKm: 'ផ្ទៀងផ្ទាត់ថាចង្កោមជើងព្យញ្ជនៈ (្ក, ្រ, ្ត) ត្រូវបានបំបែកជាព្យាង្គពេញលេញ។'
      },
      {
        id: 'ms-02-fertility-target',
        title: 'Fertility Target <= 1.8 Tokens/Word',
        titleKm: 'សម្រេចអត្រាបំបែកថូខិន <= 1.8 ថូខិន/ពាក្យ',
        detail: 'Achieved 4.0x+ compression gain over Western byte-fallback tokenizers on formal Khmer prose.',
        detailKm: 'សម្រេចបានការបង្រួមជាង 4.0x ធៀបនឹងថូខិនណាយស័រអន្តរជាតិលើអត្ថបទផ្លូវការខ្មែរ។'
      },
      {
        id: 'ms-02-byte-fallback',
        title: 'Lossless Byte-Fallback Verified',
        titleKm: 'ផ្ទៀងផ្ទាត់ Byte-Fallback ឥតបាត់បង់ទិន្នន័យ',
        detail: '100% encode-decode round-trip verified across Khmer, Pali-Sanskrit, numbers, and symbols.',
        detailKm: 'ផ្ទៀងផ្ទាត់ការបម្លែងទៅមក 100% លើអក្សរខ្មែរ បាលី-សំស្ក្រឹត លេខ និងនិមិត្តសញ្ញា។'
      }
    ]
  },
  {
    stageNumber: '03',
    stageIndex: 2,
    gateName: 'Architecture Locked',
    gateNameKm: 'ស្ថាបត្យកម្មបានកំណត់',
    phaseLabel: 'Architecture',
    phaseLabelKm: 'ស្ថាបត្យកម្ម',
    milestones: [
      {
        id: 'ms-03-chinchilla-sized',
        title: 'Chinchilla Parameter & Token Scale Locked',
        titleKm: 'កំណត់ទំហំប៉ារ៉ាម៉ែត្រ និងថូខិនតាម Chinchilla',
        detail: 'Compute-optimal parameter count (1.5B–3B) matched with >= 20x–30x verified training tokens.',
        detailKm: 'កំណត់ទំហំប៉ារ៉ាម៉ែត្រល្អបំផុត (1.5B–3B) ឱ្យសមាមាត្រនឹងថូខិន 20x–30x។'
      },
      {
        id: 'ms-03-gqa-rope',
        title: 'GQA + RoPE Context Config Verified',
        titleKm: 'កំណត់រចនាសម្ព័ន្ធ GQA និង RoPE Context',
        detail: '4:1 Grouped-Query Attention and RoPE base theta=500,000 configured for 8k context efficiency.',
        detailKm: 'កំណត់ Grouped-Query Attention 4:1 និង RoPE theta=500,000 សម្រាប់បរិបទ 8k។'
      },
      {
        id: 'ms-03-init-dryrun',
        title: 'Weight Init & Dry-Run Forward/Backward Passed',
        titleKm: 'ឆ្លងកាត់ការសាកល្បង Forward/Backward',
        detail: 'Zero NaN/Inf gradients observed across initial 100-step synthetic smoke test.',
        detailKm: 'គ្មានកំហុស NaN/Inf ក្នុងការសាកល្បងដំណើរការដំបូង 100 ជំហាន។'
      },
      {
        id: 'ms-03-memory-profiled',
        title: 'FSDP Memory Budget Profiled',
        titleKm: 'វាស់វែងអង្គចងចាំ FSDP រួចរាល់',
        detail: 'Peak VRAM per accelerator (BF16 weights, AdamW states, activations) validated with safety margin.',
        detailKm: 'ផ្ទៀងផ្ទាត់ VRAM អតិបរមាក្នុងមួយ GPU (BF16, AdamW, Activations) ដោយមានសុវត្ថិភាព។'
      }
    ]
  },
  {
    stageNumber: '04',
    stageIndex: 3,
    gateName: 'Checkpoint Validated',
    gateNameKm: 'Checkpoint បានផ្ទៀងផ្ទាត់',
    phaseLabel: 'Pretraining',
    phaseLabelKm: 'ការបង្វឹកដំបូង',
    milestones: [
      {
        id: 'ms-04-sequence-packing',
        title: 'Continuous EOS Document Packing Active',
        titleKm: 'ដំណើរការវេចខ្ចប់ឯកសារ EOS ជាប់គ្នា',
        detail: '4,096-token packed streams achieve >98% non-padding token density per micro-batch.',
        detailKm: 'ការវេចខ្ចប់លំដាប់ 4,096 ថូខិនសម្រេចដង់ស៊ីតេ >98% ដោយគ្មានការខ្ជះខ្ជាយ Padding។'
      },
      {
        id: 'ms-04-mfu-sustained',
        title: 'Cluster MFU Efficiency Target Met',
        titleKm: 'ប្រសិទ្ធភាព MFU ឈានដល់គោលដៅ',
        detail: 'Sustained >= 38% Model FLOPs Utilization verified on distributed H100/TPU v4 pod.',
        detailKm: 'រក្សាប្រសិទ្ធភាព MFU >= 38% ជាប់លាប់លើចង្កោម H100 ឬ TPU v4។'
      },
      {
        id: 'ms-04-checkpoint-validated',
        title: 'Checkpoint Validated (Loss & Grad Norm Stable)',
        titleKm: 'Checkpoint ត្រូវបានផ្ទៀងផ្ទាត់ (Loss និង Grad ថេរ)',
        detail: 'Periodic checkpoints pass held-out Khmer perplexity checks with max_grad_norm <= 1.0.',
        detailKm: 'Checkpoint ឆ្លងកាត់ការវាយតម្លៃ Perplexity ភាសាខ្មែរដោយមាន Gradient ថេរ។'
      },
      {
        id: 'ms-04-cosine-converged',
        title: 'Cosine Decay Pretraining Completed',
        titleKm: 'បញ្ចប់ការបង្វឹកដំបូងតាម Cosine Decay',
        detail: 'Full token budget annealed cleanly to min LR with resumable optimizer snapshot archived.',
        detailKm: 'បញ្ចប់ថវិកាថូខិនពេញលេញដោយបន្ថយអត្រារៀនតាម Cosine Decay និងរក្សាទុក Snapshot។'
      }
    ]
  },
  {
    stageNumber: '05',
    stageIndex: 4,
    gateName: 'Alignment Certified',
    gateNameKm: 'ការតម្រឹមបានបញ្ជាក់',
    phaseLabel: 'SFT & DPO',
    phaseLabelKm: 'តម្រឹម SFT',
    milestones: [
      {
        id: 'ms-05-sft-clean',
        title: 'Culturally Native SFT Pairs Curated',
        titleKm: 'រៀបចំទិន្នន័យ SFT ធម្មជាតិខ្មែរ',
        detail: 'Instruction-tuning pairs audited to remove English translationese calques and passive overuse.',
        detailKm: 'ត្រួតពិនិត្យគូ SFT ដើម្បីលុបទម្រង់បកប្រែត្រង់ពីបរទេស និងការប្រើល្បះអកម្មហួសហេតុ។'
      },
      {
        id: 'ms-05-registers-aligned',
        title: 'Honorific Registers Aligned',
        titleKm: 'តម្រឹមកម្រិតភាសាគោរពត្រឹមត្រូវ',
        detail: 'Model switches accurately between Reachasap, Sanghasap, Formal Khpous, and Thommada dialogue.',
        detailKm: 'ម៉ូដែលប្រើប្រាស់រាជសព្ទ សង្ឃសព្ទ ភាសាខ្ពស់ និងភាសាសាមញ្ញបានត្រឹមត្រូវតាមបរិបទ។'
      },
      {
        id: 'ms-05-polite-particles',
        title: 'Polite Particles & Currency Grounded',
        titleKm: 'តុល្យភាពពាក្យគួរសម និងរូបិយវត្ថុខ្មែរ',
        detail: 'Balanced បាទ/ចាស usage and Cambodian domestic grounding (Riel currency, local geography).',
        detailKm: 'ធានាតុល្យភាព បាទ/ចាស និងបរិបទក្នុងស្រុកកម្ពុជា (ប្រាក់រៀល និងភូមិសាស្ត្រ)។'
      },
      {
        id: 'ms-05-dpo-safety',
        title: 'DPO Preference & Refusal Boundaries Verified',
        titleKm: 'ផ្ទៀងផ្ទាត់ DPO និងព្រំដែនសុវត្ថិភាព',
        detail: 'Preference tuning reduces hallucination while preserving helpfulness in Khmer prompts.',
        detailKm: 'ការតម្រឹមចំណូលចិត្តកាត់បន្ថយការប្រឌិតព័ត៌មានខុស និងរក្សាប្រយោជន៍ក្នុងភាសាខ្មែរ។'
      }
    ]
  },
  {
    stageNumber: '06',
    stageIndex: 5,
    gateName: 'Release Approved',
    gateNameKm: 'អនុម័តផ្សព្វផ្សាយ',
    phaseLabel: 'Eval & Release',
    phaseLabelKm: 'វាយតម្លៃ',
    milestones: [
      {
        id: 'ms-06-belebele-tydi',
        title: 'Belebele & TyDi QA Benchmarks Passed',
        titleKm: 'ឆ្លងផុតស្ដង់ដារ Belebele & TyDi QA',
        detail: 'Zero-shot and 5-shot Khmer comprehension & extractive QA exceed baseline parameter peers.',
        detailKm: 'ពិន្ទុយល់ដឹងអត្ថបទ និងសំណួរ-ចម្លើយខ្មែរលើសម៉ូដែលទំហំដូចគ្នា។'
      },
      {
        id: 'ms-06-khmer-mmlu',
        title: 'Grade 12 Khmer MMLU Evaluated',
        titleKm: 'វាយតម្លៃវិញ្ញាសាបាក់ឌុប Khmer MMLU',
        detail: 'Evaluated reasoning across Cambodian Literature, History, Civics, and STEM questions.',
        detailKm: 'វាស់ស្ទង់ការវែកញែកលើអក្សរសាស្ត្រខ្មែរ ប្រវត្តិវិទ្យា សីលធម៌ និងវិទ្យាសាស្ត្រ។'
      },
      {
        id: 'ms-06-linguist-review',
        title: 'Native Linguist Panel Signed Off',
        titleKm: 'ការអនុម័តពីគណៈកម្មការភាសាវិទូខ្មែរ',
        detail: 'Blind human evaluation confirms natural phrasing, accurate spelling, and proper register selection.',
        detailKm: 'ការវាយតម្លៃដោយមនុស្សបញ្ជាក់ពីភាពធម្មជាតិ អក្ខរាវិរុទ្ធ និងកម្រិតភាសាសមស្រប។'
      },
      {
        id: 'ms-06-weights-published',
        title: 'Safetensors, GGUF & Model Card Published',
        titleKm: 'ផ្សព្វផ្សាយ Safetensors, GGUF និង Model Card',
        detail: 'Open weights, tokenizer config, and bilingual evaluation card released with reproducible recipe.',
        detailKm: 'ចែករំលែកទម្ងន់ម៉ូដែល ថូខិនណាយស័រ និងរបាយការណ៍វាយតម្លៃជាសាធារណៈ។'
      }
    ]
  }
];

export const PHASE_MILESTONE_STORAGE_KEY = 'khmer_llm_phase_milestones_v1';

interface ProgressRingProps {
  percent: number;
  isActive: boolean;
}

const ProgressRing: React.FC<ProgressRingProps> = ({ percent, isActive }) => {
  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  const strokeColor =
    percent === 100
      ? '#34d399'
      : isActive
      ? '#fbbf24'
      : percent > 0
      ? '#22d3ee'
      : '#334155';

  return (
    <div className="relative w-10 h-10 shrink-0 flex items-center justify-center">
      <svg className="w-10 h-10 -rotate-90" viewBox="0 0 40 40" aria-hidden="true">
        <circle
          cx="20"
          cy="20"
          r={radius}
          fill="none"
          stroke="#1e293b"
          strokeWidth="3.5"
        />
        <circle
          cx="20"
          cy="20"
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-300"
        />
      </svg>
      <span className="absolute text-[10px] font-mono font-bold text-slate-200 tabular-nums">
        {percent}%
      </span>
    </div>
  );
};

interface PhaseMilestoneAchievementsProps {
  activeStageIndex: number;
  onSelectStage: (stageIndex: number) => void;
  achievedIds: Set<string>;
  onToggleMilestone: (id: string) => void;
  onCompleteActivePhase: () => void;
  onResetAll: () => void;
}

export const PhaseMilestoneAchievements: React.FC<PhaseMilestoneAchievementsProps> = ({
  activeStageIndex,
  onSelectStage,
  achievedIds,
  onToggleMilestone,
  onCompleteActivePhase,
  onResetAll
}) => {
  const { isKm, tr } = useLanguage();

  const totalMilestones = PHASE_MILESTONE_GROUPS.reduce(
    (sum, g) => sum + g.milestones.length,
    0
  );
  const totalCompleted = PHASE_MILESTONE_GROUPS.reduce(
    (sum, g) => sum + g.milestones.filter((m) => achievedIds.has(m.id)).length,
    0
  );
  const overallPercent = Math.round((totalCompleted / totalMilestones) * 100);

  const activeGroup = PHASE_MILESTONE_GROUPS[activeStageIndex] || PHASE_MILESTONE_GROUPS[0];
  const activeCompleted = activeGroup.milestones.filter((m) => achievedIds.has(m.id)).length;
  const activePercent = Math.round((activeCompleted / activeGroup.milestones.length) * 100);

  const chartData = PHASE_MILESTONE_GROUPS.map((group) => {
    const done = group.milestones.filter((m) => achievedIds.has(m.id)).length;
    const pct = Math.round((done / group.milestones.length) * 100);
    return {
      stageIndex: group.stageIndex,
      stageLabel: `${group.stageNumber} · ${isKm ? group.phaseLabelKm : group.phaseLabel}`,
      gateName: isKm ? group.gateNameKm : group.gateName,
      percent: pct,
      done,
      total: group.milestones.length,
      isActive: group.stageIndex === activeStageIndex
    };
  });

  return (
    <section
      aria-label={tr('Milestone Achievements & Phase Progress', 'សមិទ្ធផលគោលដៅ និងវឌ្ឍនភាពតាមដំណាក់កាល')}
      className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-6"
    >
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400">
            <span>{tr('MILESTONE ACHIEVEMENTS', 'សមិទ្ធផលគោលដៅប្រចាំដំណាក់កាល')}</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="text-slate-400 tabular-nums">
              {totalCompleted}/{totalMilestones} {tr('Gates Unlocked', 'គោលដៅសម្រេចបាន')} ({overallPercent}%)
            </span>
          </div>
          <h3 className={`text-lg font-bold text-white ${isKm ? 'font-khmer' : ''}`}>
            {tr(
              'Phase Milestone Achievements & Progress Visualizers',
              'បញ្ជីសមិទ្ធផលគោលដៅ និងក្រាហ្វវឌ្ឍនភាពតាមដំណាក់កាល'
            )}
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onCompleteActivePhase}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-400 text-slate-950 hover:bg-amber-300 transition-colors whitespace-nowrap shrink-0"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>
              {isKm
                ? `សម្រេចដំណាក់កាល ${activeGroup.stageNumber}`
                : `Complete Phase ${activeGroup.stageNumber}`}
            </span>
          </button>
          <button
            type="button"
            onClick={onResetAll}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{tr('Reset All', 'កំណត់ឡើងវិញ')}</span>
          </button>
        </div>
      </div>

      {/* Overall Multi-Segment Phase Visualizer Strip + 6 Phase Ring Cards */}
      <div className="space-y-3 pt-2 border-t border-slate-800/80">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {PHASE_MILESTONE_GROUPS.map((group) => {
            const doneCount = group.milestones.filter((m) => achievedIds.has(m.id)).length;
            const pct = Math.round((doneCount / group.milestones.length) * 100);
            const isActive = group.stageIndex === activeStageIndex;
            const isGateUnlocked = doneCount === group.milestones.length;

            return (
              <button
                key={group.stageNumber}
                type="button"
                onClick={() => onSelectStage(group.stageIndex)}
                className={`p-3 rounded-xl border text-left transition-colors flex items-center gap-2.5 ${
                  isActive
                    ? 'bg-slate-800/80 border-amber-400/70'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <ProgressRing percent={pct} isActive={isActive} />
                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="flex items-center justify-between gap-1 text-[10px] font-mono">
                    <span className={isActive ? 'text-amber-400 font-semibold' : 'text-slate-400'}>
                      P{group.stageNumber}
                    </span>
                    <span className="text-slate-400 tabular-nums">
                      {doneCount}/{group.milestones.length}
                    </span>
                  </div>
                  <div
                    className={`text-xs font-semibold truncate ${
                      isGateUnlocked ? 'text-emerald-300' : 'text-white'
                    } ${isKm ? 'font-khmer' : ''}`}
                  >
                    {isKm ? group.gateNameKm : group.gateName}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Phase Checklist + Recharts Completion Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-3 border-t border-slate-800/80">
        {/* Left 7 Cols: Active Phase Milestone Checklist */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Award
                className={`w-4 h-4 ${
                  activePercent === 100 ? 'text-emerald-400' : 'text-amber-400'
                }`}
              />
              <h4 className={`text-sm font-bold text-white ${isKm ? 'font-khmer' : ''}`}>
                {tr('Phase', 'ដំណាក់កាល')} {activeGroup.stageNumber}:{' '}
                {isKm ? activeGroup.gateNameKm : activeGroup.gateName}
              </h4>
            </div>
            <span className="text-xs font-mono text-slate-300 tabular-nums">
              {activeCompleted}/{activeGroup.milestones.length} ({activePercent}%)
            </span>
          </div>

          {/* Active Phase Linear Progress Bar */}
          <div className="h-2.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div
              style={{ width: `${activePercent}%` }}
              className={`h-full transition-all duration-300 ${
                activePercent === 100
                  ? 'bg-emerald-400'
                  : 'bg-gradient-to-r from-amber-500 to-amber-300'
              }`}
            />
          </div>

          {/* Interactive Achievement Items */}
          <div className="space-y-2">
            {activeGroup.milestones.map((milestone) => {
              const checked = achievedIds.has(milestone.id);
              return (
                <button
                  key={milestone.id}
                  type="button"
                  onClick={() => onToggleMilestone(milestone.id)}
                  aria-pressed={checked}
                  className={`w-full text-left p-3.5 rounded-xl border transition-colors flex items-start gap-3 ${
                    checked
                      ? 'bg-emerald-950/20 border-emerald-800/50 hover:bg-emerald-950/30'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {checked ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-500" />
                    )}
                  </div>
                  <div className="space-y-0.5 min-w-0 flex-1">
                    <div
                      className={`text-xs font-semibold ${
                        checked ? 'text-emerald-200' : 'text-white'
                      } ${isKm ? 'font-khmer' : ''}`}
                    >
                      {isKm ? milestone.titleKm : milestone.title}
                    </div>
                    <p className={`text-[11px] text-slate-400 leading-relaxed ${isKm ? 'font-khmer' : ''}`}>
                      {isKm ? milestone.detailKm : milestone.detail}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right 5 Cols: Recharts Cross-Phase Achievement Progress Visualizer */}
        <div className="lg:col-span-5 lg:border-l lg:border-slate-800/80 lg:pl-6 space-y-3">
          <div>
            <h4 className={`text-sm font-semibold text-white ${isKm ? 'font-khmer' : ''}`}>
              {tr('Phase Completion Visualizer (%)', 'ក្រាហ្វវឌ្ឍនភាពតាមដំណាក់កាល (%)')}
            </h4>
            <p className={`text-[11px] text-slate-400 ${isKm ? 'font-khmer' : ''}`}>
              {tr(
                'Click any phase bar to inspect and toggle its milestone achievements.',
                'ចុចលើរបារដំណាក់កាលណាមួយដើម្បីពិនិត្យ និងកត់ត្រាសមិទ្ធផលរបស់វា។'
              )}
            </p>
          </div>

          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 6, right: 16, left: 4, bottom: 6 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  unit="%"
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                  axisLine={{ stroke: '#334155' }}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="stageLabel"
                  width={118}
                  tick={{ fill: '#cbd5e1', fontSize: 10 }}
                  axisLine={{ stroke: '#334155' }}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(148, 163, 184, 0.08)' }}
                  contentStyle={{
                    backgroundColor: '#020617',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                    color: '#f8fafc'
                  }}
                  formatter={(value, _name, item) => {
                    const payload = item?.payload as { gateName?: string; done?: number; total?: number } | undefined;
                    return [
                      `${value ?? 0}% (${payload?.done ?? 0}/${payload?.total ?? 4})`,
                      payload?.gateName ?? tr('Completion', 'វឌ្ឍនភាព')
                    ];
                  }}
                />
                <Bar
                  dataKey="percent"
                  radius={[0, 4, 4, 0]}
                  barSize={18}
                  className="cursor-pointer"
                  onClick={(entry) => {
                    const idx = (entry as { stageIndex?: number })?.stageIndex;
                    if (typeof idx === 'number') {
                      onSelectStage(idx);
                    }
                  }}
                >
                  {chartData.map((entry) => (
                    <Cell
                      key={entry.stageLabel}
                      fill={
                        entry.percent === 100
                          ? '#34d399'
                          : entry.isActive
                          ? '#fbbf24'
                          : '#22d3ee'
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
};
