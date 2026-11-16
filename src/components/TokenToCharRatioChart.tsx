import React, { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  LineChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import {
  compareTokenizers,
  segmentKhmerSyllables,
  SAMPLE_KHMER_PHRASES,
  BASELINE_MODELS,
  KHMER_MODELS,
  BaselineModelType,
  KhmerModelType,
} from '../utils/khmerLinguistics';
import { useLanguage } from '../contexts/LanguageContext';
import {
  TrendingDown,
  Layers,
  CheckCircle2,
  ArrowUpRight,
  RotateCcw,
} from 'lucide-react';

interface TokenToCharRatioChartProps {
  activeText: string;
  onSelectSampleText: (text: string) => void;
}

interface SegmentRatioRow {
  id: string;
  shortLabel: string;
  title: string;
  text: string;
  charCount: number;
  khmerCharPct: number;
  baselineTokens: number;
  khmerTokens: number;
  baselineRatio: number; // tokens per char
  khmerRatio: number; // tokens per char
  charsPerKhmerToken: number;
  efficiencyGainPct: number; // % reduction in token/char ratio
  efficiencyTier: 'OPTIMAL' | 'MODERATE' | 'INEFFICIENT';
  isActiveInput: boolean;
}

interface DomainPreset {
  id: string;
  shortLabel: string;
  shortLabelKm: string;
  title: string;
  titleKm: string;
  text: string;
}

const TARGET_RATIO_THRESHOLD = 0.35;

const DOMAIN_SEGMENTS: DomainPreset[] = [
  {
    id: 'gov-policy',
    shortLabel: 'Gov Policy',
    shortLabelKm: 'គោលនយោបាយ',
    title: SAMPLE_KHMER_PHRASES[0].title,
    titleKm: SAMPLE_KHMER_PHRASES[0].titleKm,
    text: SAMPLE_KHMER_PHRASES[0].text,
  },
  {
    id: 'angkor-lit',
    shortLabel: 'Angkor Lit',
    shortLabelKm: 'អក្សរសិល្ប៍',
    title: SAMPLE_KHMER_PHRASES[1].title,
    titleKm: SAMPLE_KHMER_PHRASES[1].titleKm,
    text: SAMPLE_KHMER_PHRASES[1].text,
  },
  {
    id: 'science-tech',
    shortLabel: 'Science & AI',
    shortLabelKm: 'វិទ្យាសាស្ត្រ',
    title: SAMPLE_KHMER_PHRASES[2].title,
    titleKm: SAMPLE_KHMER_PHRASES[2].titleKm,
    text: SAMPLE_KHMER_PHRASES[2].text,
  },
  {
    id: 'buddhist-pali',
    shortLabel: 'Pali Compounds',
    shortLabelKm: 'បាលី-សំស្ក្រឹត',
    title: 'Buddhist Institute & Pali Compounds',
    titleKm: 'អត្ថបទពុទ្ធសាសនបណ្ឌិត្យ និងពាក្យបាលី',
    text: 'ព្រះសម្មាសម្ពុទ្ធទ្រង់ត្រាស់សម្តែងព្រះធម៌វិន័យប្រកបដោយបញ្ញាញាណដ៏ជ្រាលជ្រៅសម្រាប់សត្វលោកទូទៅ។',
  },
  {
    id: 'legal-gazette',
    shortLabel: 'Legal Decree',
    shortLabelKm: 'ច្បាប់ជាតិ',
    title: 'Royal Gazette Administrative Decree',
    titleKm: 'ព្រះរាជក្រឹត្យ និងច្បាប់រដ្ឋបាល',
    text: 'ព្រះរាជក្រឹត្យស្តីពីការរៀបចំនិងការប្រព្រឹត្តទៅនៃក្រុមប្រឹក្សាអភិវឌ្ឍន៍បច្ចេកវិទ្យាឌីជីថលជាតិ។',
  },
  {
    id: 'code-switched',
    shortLabel: 'Khmer + EN',
    shortLabelKm: 'ខ្មែរ + អង់គ្លេស',
    title: 'Technical Code-Switched Khmer & English',
    titleKm: 'អត្ថបទបច្ចេកទេសលាយខ្មែរ និងអង់គ្លេស',
    text: 'ម៉ូដែល Transformer ទំនើបប្រើ Grouped-Query Attention និង SentencePiece ដើម្បីដំណើរការភាសាខ្មែរ។',
  },
  {
    id: 'limon-legacy',
    shortLabel: 'Limon ASCII',
    shortLabelKm: 'កូដ Limon',
    title: SAMPLE_KHMER_PHRASES[3].title,
    titleKm: SAMPLE_KHMER_PHRASES[3].titleKm,
    text: SAMPLE_KHMER_PHRASES[3].text,
  },
];

function classifyRatioTier(khmerRatio: number): SegmentRatioRow['efficiencyTier'] {
  if (khmerRatio <= TARGET_RATIO_THRESHOLD) return 'OPTIMAL';
  if (khmerRatio <= 0.65) return 'MODERATE';
  return 'INEFFICIENT';
}

function buildRatioRow(
  id: string,
  shortLabel: string,
  title: string,
  text: string,
  baselineModel: BaselineModelType,
  khmerModel: KhmerModelType,
  isActiveInput: boolean
): SegmentRatioRow {
  const trimmed = text.trim();
  const charCount = Math.max(1, trimmed.length);
  const khmerChars = (trimmed.match(/[\u1780-\u17FF]/g) || []).length;
  const khmerCharPct = Math.round((khmerChars / charCount) * 100);

  const cmp = compareTokenizers(trimmed, baselineModel, khmerModel);
  const baselineRatio = Number((cmp.llamaTokenCount / charCount).toFixed(3));
  const khmerRatio = Number((cmp.khmerTokenCount / charCount).toFixed(3));
  const charsPerKhmerToken = Number((charCount / Math.max(1, cmp.khmerTokenCount)).toFixed(2));
  const efficiencyGainPct =
    baselineRatio > 0
      ? Number((((baselineRatio - khmerRatio) / baselineRatio) * 100).toFixed(1))
      : 0;

  return {
    id,
    shortLabel,
    title,
    text: trimmed,
    charCount,
    khmerCharPct,
    baselineTokens: cmp.llamaTokenCount,
    khmerTokens: cmp.khmerTokenCount,
    baselineRatio,
    khmerRatio,
    charsPerKhmerToken,
    efficiencyGainPct,
    efficiencyTier: classifyRatioTier(khmerRatio),
    isActiveInput,
  };
}

/**
 * Partition live Khmer text into balanced sequential segments along natural
 * punctuation clauses or syllable cluster boundaries (never cutting inside Coeng stacks).
 */
function partitionTextIntoSegments(text: string): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];

  // 1. Split on explicit sentence / clause boundaries first
  const rawClauses = trimmed
    .split(/(?<=[។៕៖?!\n])|\s{2,}/)
    .map((s) => s.trim())
    .filter(Boolean);

  const segments: string[] = [];

  for (const clause of rawClauses) {
    if (clause.length <= 28) {
      segments.push(clause);
      continue;
    }

    // Sub-divide long scriptio continua clauses on syllable boundaries (~18-24 chars)
    const clusters = segmentKhmerSyllables(clause);
    let current = '';
    for (const cluster of clusters) {
      if (current.length + cluster.length > 22 && current.length >= 10) {
        segments.push(current.trim());
        current = cluster;
      } else {
        current += cluster;
      }
    }
    if (current.trim().length > 0) {
      // Merge tiny trailing fragment (< 6 chars) into previous segment
      if (segments.length > 0 && current.trim().length < 6) {
        segments[segments.length - 1] += current;
      } else {
        segments.push(current.trim());
      }
    }
  }

  return segments;
}

export const TokenToCharRatioChart: React.FC<TokenToCharRatioChartProps> = ({
  activeText,
  onSelectSampleText,
}) => {
  const { isKm, tr } = useLanguage();
  const [trackingScope, setTrackingScope] = useState<'sequential' | 'domains'>('sequential');
  const [baselineModel, setBaselineModel] = useState<BaselineModelType>('llama3_tiktoken');
  const [khmerModel, setKhmerModel] = useState<KhmerModelType>('khmer_spm_32k');

  const sequentialRows = useMemo<SegmentRatioRow[]>(() => {
    const segs = partitionTextIntoSegments(activeText);
    return segs.map((segText, idx) =>
      buildRatioRow(
        `seg-${idx + 1}`,
        isKm ? `កង់ទី ${idx + 1}` : `Seg ${idx + 1}`,
        segText.length > 42 ? `${segText.slice(0, 42)}…` : segText,
        segText,
        baselineModel,
        khmerModel,
        false
      )
    );
  }, [activeText, baselineModel, khmerModel, isKm]);

  const domainRows = useMemo<SegmentRatioRow[]>(() => {
    const rows = DOMAIN_SEGMENTS.map((preset) =>
      buildRatioRow(
        preset.id,
        isKm ? preset.shortLabelKm : preset.shortLabel,
        isKm ? preset.titleKm : preset.title,
        preset.text,
        baselineModel,
        khmerModel,
        activeText.trim() === preset.text.trim()
      )
    );

    if (activeText.trim().length > 0 && !rows.some((r) => r.isActiveInput)) {
      rows.unshift(
        buildRatioRow(
          'custom-active',
          isKm ? 'អត្ថបទបច្ចុប្បន្ន' : 'Active Input',
          isKm ? 'អត្ថបទផ្ទាល់ខ្លួនក្នុងប្រអប់បញ្ចូល' : 'Current Custom Editor Text',
          activeText,
          baselineModel,
          khmerModel,
          true
        )
      );
    }

    return rows;
  }, [activeText, baselineModel, khmerModel, isKm]);

  const activeDataset = trackingScope === 'sequential' ? sequentialRows : domainRows;

  const summary = useMemo(() => {
    if (activeDataset.length === 0) {
      return {
        avgKhmerRatio: '0.000',
        avgBaselineRatio: '0.000',
        avgGainPct: '0.0',
        bestSegment: null as SegmentRatioRow | null,
        charsPerTokenAvg: '0.00',
      };
    }

    const totalChars = activeDataset.reduce((sum, r) => sum + r.charCount, 0);
    const totalKhmerTok = activeDataset.reduce((sum, r) => sum + r.khmerTokens, 0);
    const totalBaseTok = activeDataset.reduce((sum, r) => sum + r.baselineTokens, 0);

    const avgKhmerNum = totalKhmerTok / Math.max(1, totalChars);
    const avgBaseNum = totalBaseTok / Math.max(1, totalChars);
    const avgGain =
      avgBaseNum > 0 ? (((avgBaseNum - avgKhmerNum) / avgBaseNum) * 100).toFixed(1) : '0.0';
    const bestSegment = [...activeDataset].sort((a, b) => a.khmerRatio - b.khmerRatio)[0];

    return {
      avgKhmerRatio: avgKhmerNum.toFixed(3),
      avgBaselineRatio: avgBaseNum.toFixed(3),
      avgGainPct: avgGain,
      bestSegment,
      charsPerTokenAvg: (totalChars / Math.max(1, totalKhmerTok)).toFixed(2),
    };
  }, [activeDataset]);

  const tierLabel = (tier: SegmentRatioRow['efficiencyTier']) => {
    if (tier === 'OPTIMAL') return tr('Optimal', 'ប្រសើរខ្ពស់');
    if (tier === 'MODERATE') return tr('Moderate', 'មធ្យម');
    return tr('High Overhead', 'ខ្ជះខ្ជាយខ្ពស់');
  };

  return (
    <div className="p-5 sm:p-6 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-6">
      {/* Header + Scope Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="space-y-1">
          <div
            className={`inline-flex items-center gap-2 text-xs font-semibold text-amber-400 tracking-wider ${
              isKm ? 'font-khmer' : 'uppercase font-mono'
            }`}
          >
            <TrendingDown className="w-3.5 h-3.5" />
            <span>
              {tr(
                'TOKEN-TO-CHARACTER RATIO TRACKER',
                'ឧបករណ៍តាមដានសមាមាត្រថូខិនធៀបនឹងតួអក្សរ'
              )}
            </span>
          </div>
          <h3 className={`text-lg sm:text-xl font-bold text-white ${isKm ? 'font-khmer' : ''}`}>
            {tr(
              'Token-to-Character Ratio Across Khmer Text Segments',
              'សមាមាត្រថូខិនធៀបនឹងតួអក្សរឆ្លងកាត់កង់អត្ថបទខ្មែរ'
            )}
          </h3>
          <p className={`text-xs text-slate-400 max-w-3xl ${isKm ? 'font-khmer leading-relaxed' : ''}`}>
            {tr(
              'Quantifies encoding compactness (tokens ÷ character — lower is more efficient). Tracks sequential clauses of your live editor text or benchmarks across formal, literary, Pali, code-switched, and legacy Limon segments.',
              'វាស់ស្ទង់កម្រិតបង្រួមថូខិន (ថូខិន ÷ តួអក្សរ — កាន់តែទាប កាន់តែមានប្រសិទ្ធភាព)។ តាមដានតាមកង់ឃ្លានៃអត្ថបទកំពុងសាកល្បង ឬប្រៀបធៀបឆ្លងកាត់ប្រភេទអត្ថបទផ្លូវការ អក្សរសិល្ប៍ បាលី និងកូដ Limon។'
            )}
          </p>
        </div>

        {/* Scope Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950 border border-slate-800 shrink-0 self-start lg:self-auto">
          <button
            type="button"
            onClick={() => setTrackingScope('sequential')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors whitespace-nowrap shrink-0 ${
              isKm ? 'font-khmer' : 'font-mono'
            } ${
              trackingScope === 'sequential'
                ? 'bg-amber-400 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <TrendingDown className="w-3.5 h-3.5" />
            <span>{tr('Text Segment Curve', 'ខ្សែកោងតាមកង់អត្ថបទ')}</span>
          </button>

          <button
            type="button"
            onClick={() => setTrackingScope('domains')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors whitespace-nowrap shrink-0 ${
              isKm ? 'font-khmer' : 'font-mono'
            } ${
              trackingScope === 'domains'
                ? 'bg-amber-400 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{tr('Corpus Domains', 'ប្រភេទអត្ថបទគំរូ')}</span>
          </button>
        </div>
      </div>

      {/* Tokenizer Model Pair Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <label className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950/60 text-xs">
          <span className={`text-slate-400 whitespace-nowrap ${isKm ? 'font-khmer' : 'font-mono'}`}>
            {tr('Baseline Tokenizer:', 'ម៉ូដែលប្រៀបធៀប៖')}
          </span>
          <select
            value={baselineModel}
            onChange={(e) => setBaselineModel(e.target.value as BaselineModelType)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-rose-300 font-mono focus:outline-none focus:border-amber-400"
          >
            {(Object.keys(BASELINE_MODELS) as BaselineModelType[]).map((key) => (
              <option key={key} value={key}>
                {isKm ? BASELINE_MODELS[key].nameKm : BASELINE_MODELS[key].name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950/60 text-xs">
          <span className={`text-slate-400 whitespace-nowrap ${isKm ? 'font-khmer' : 'font-mono'}`}>
            {tr('Khmer Target Tokenizer:', 'ម៉ូដែលខ្មែរគោលដៅ៖')}
          </span>
          <select
            value={khmerModel}
            onChange={(e) => setKhmerModel(e.target.value as KhmerModelType)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-emerald-300 font-mono focus:outline-none focus:border-amber-400"
          >
            {(Object.keys(KHMER_MODELS) as KhmerModelType[]).map((key) => (
              <option key={key} value={key}>
                {isKm ? KHMER_MODELS[key].nameKm : KHMER_MODELS[key].name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* KPI Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60 space-y-1">
          <div className={`text-[11px] text-slate-400 ${isKm ? 'font-khmer' : 'font-mono'}`}>
            {tr('Khmer Token/Char Ratio', 'សមាមាត្រថូខិន/តួអក្សរខ្មែរ')}
          </div>
          <div className="text-xl font-bold text-emerald-400 font-mono tabular-nums">
            {summary.avgKhmerRatio}{' '}
            <span className="text-xs font-normal text-slate-400">
              {tr('tok/ch', 'ថូខិន/តួ')}
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60 space-y-1">
          <div className={`text-[11px] text-slate-400 ${isKm ? 'font-khmer' : 'font-mono'}`}>
            {tr('Baseline Byte-Fallback Ratio', 'សមាមាត្រម៉ូដែលដើម')}
          </div>
          <div className="text-xl font-bold text-rose-400 font-mono tabular-nums">
            {summary.avgBaselineRatio}{' '}
            <span className="text-xs font-normal text-slate-400">
              {tr('tok/ch', 'ថូខិន/តួ')}
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60 space-y-1">
          <div className={`text-[11px] text-slate-400 ${isKm ? 'font-khmer' : 'font-mono'}`}>
            {tr('Chars Packed / Token', 'តួអក្សរក្នុង ១ ថូខិន')}
          </div>
          <div className="text-xl font-bold text-amber-400 font-mono tabular-nums">
            {summary.charsPerTokenAvg}{' '}
            <span className="text-xs font-normal text-slate-400">
              {tr('chars/tok', 'តួ/ថូខិន')}
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60 space-y-1">
          <div className={`text-[11px] text-slate-400 ${isKm ? 'font-khmer' : 'font-mono'}`}>
            {tr('Ratio Reduction Savings', 'ការកាត់បន្ថយសមាមាត្រ')}
          </div>
          <div className="text-xl font-bold text-cyan-400 font-mono tabular-nums">
            −{summary.avgGainPct}%{' '}
            {summary.bestSegment && (
              <span className={`text-xs font-normal text-slate-400 ${isKm ? 'font-khmer' : ''}`}>
                · {summary.bestSegment.shortLabel}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Empty State or Recharts Canvas */}
      {activeDataset.length === 0 ? (
        <div className="h-[260px] rounded-xl border border-dashed border-slate-800 bg-slate-950/60 flex flex-col items-center justify-center p-6 text-center space-y-3">
          <p className={`text-sm text-slate-300 max-w-md ${isKm ? 'font-khmer leading-relaxed' : ''}`}>
            {tr(
              'Enter Khmer text above to track its token-to-character ratio segment by segment, or load a sample policy sentence.',
              'សូមបញ្ចូលអត្ថបទភាសាខ្មែរខាងលើ ដើម្បីតាមដានសមាមាត្រថូខិនធៀបនឹងតួអក្សរតាមកង់ ឬផ្ទុកអត្ថបទគំរូ។'
            )}
          </p>
          <button
            type="button"
            onClick={() => onSelectSampleText(SAMPLE_KHMER_PHRASES[0].text)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-amber-400 text-slate-950 hover:bg-amber-300 transition-colors whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{tr('Load Sample Khmer Text', 'ផ្ទុកអត្ថបទខ្មែរគំរូ')}</span>
          </button>
        </div>
      ) : (
        <div className="w-full h-[350px] rounded-xl border border-slate-800 bg-slate-950/70 p-3 sm:p-4">
          <ResponsiveContainer width="100%" height="100%">
            {trackingScope === 'sequential' ? (
              <LineChart
                data={activeDataset}
                margin={{ top: 18, right: 24, left: 4, bottom: 12 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis
                  dataKey="shortLabel"
                  stroke="#64748b"
                  tick={{ fill: '#cbd5e1', fontSize: 11 }}
                  interval={0}
                />
                <YAxis
                  domain={[0, 'auto']}
                  stroke="#64748b"
                  tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }}
                  tickFormatter={(v) => Number(v).toFixed(2)}
                />
                <Tooltip
                  cursor={{ stroke: '#475569', strokeDasharray: '4 4' }}
                  content={({ active, payload }) => {
                    if (!active || !payload || payload.length === 0) return null;
                    const row = payload[0]?.payload as SegmentRatioRow | undefined;
                    if (!row) return null;
                    return (
                      <div className="max-w-xs p-3 rounded-xl bg-slate-950 border border-slate-700 shadow-xl space-y-1.5 text-xs">
                        <div className="font-semibold text-amber-300 font-mono">
                          {row.shortLabel} · {row.charCount} {tr('chars', 'តួ')}
                        </div>
                        <div className="text-white font-khmer text-xs leading-relaxed">
                          {row.title}
                        </div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 pt-1 font-mono text-[11px] tabular-nums border-t border-slate-800">
                          <span className="text-rose-400">
                            {tr('Baseline:', 'ដើម៖')} {row.baselineRatio}
                          </span>
                          <span className="text-emerald-400">
                            {tr('Khmer SPM:', 'ខ្មែរ៖')} {row.khmerRatio}
                          </span>
                          <span className="text-amber-300">
                            {row.charsPerKhmerToken} {tr('ch/tok', 'តួ/ថូខិន')}
                          </span>
                          <span className="text-cyan-300">
                            −{row.efficiencyGainPct}% {tr('saved', 'សន្សំ')}
                          </span>
                        </div>
                      </div>
                    );
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <ReferenceLine
                  y={TARGET_RATIO_THRESHOLD}
                  stroke="#fbbf24"
                  strokeDasharray="5 5"
                  label={{
                    value: isKm ? 'គោលដៅ ≤ 0.35' : 'Target ≤ 0.35 tok/ch',
                    position: 'insideTopRight',
                    fill: '#fbbf24',
                    fontSize: 10,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="baselineRatio"
                  name={tr('Baseline Ratio (tok/char)', 'សមាមាត្រម៉ូដែលដើម (ថូខិន/តួ)')}
                  stroke="#f43f5e"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#f43f5e', stroke: '#0f172a', strokeWidth: 1.5 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="khmerRatio"
                  name={tr('Khmer Tokenizer Ratio (tok/char)', 'សមាមាត្រថូខិនខ្មែរ (ថូខិន/តួ)')}
                  stroke="#34d399"
                  strokeWidth={2.75}
                  dot={{ r: 4.5, fill: '#34d399', stroke: '#0f172a', strokeWidth: 1.5 }}
                  activeDot={{ r: 6.5 }}
                />
              </LineChart>
            ) : (
              <ComposedChart
                data={activeDataset}
                margin={{ top: 18, right: 20, left: 4, bottom: 12 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis
                  dataKey="shortLabel"
                  stroke="#64748b"
                  tick={{ fill: '#cbd5e1', fontSize: 11 }}
                  interval={0}
                />
                <YAxis
                  yAxisId="ratio"
                  domain={[0, 'auto']}
                  stroke="#64748b"
                  tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }}
                  tickFormatter={(v) => Number(v).toFixed(2)}
                />
                <YAxis
                  yAxisId="gain"
                  orientation="right"
                  domain={[0, 100]}
                  stroke="#22d3ee"
                  tick={{ fill: '#22d3ee', fontSize: 11, fontFamily: 'monospace' }}
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(148, 163, 184, 0.08)' }}
                  content={({ active, payload }) => {
                    if (!active || !payload || payload.length === 0) return null;
                    const row = payload[0]?.payload as SegmentRatioRow | undefined;
                    if (!row) return null;
                    return (
                      <div className="max-w-xs p-3 rounded-xl bg-slate-950 border border-slate-700 shadow-xl space-y-1.5 text-xs">
                        <div className={`font-bold text-white ${isKm ? 'font-khmer' : ''}`}>
                          {row.title}
                        </div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 pt-1 font-mono text-[11px] tabular-nums border-t border-slate-800">
                          <span className="text-rose-400">
                            {tr('Baseline:', 'ដើម៖')} {row.baselineRatio} tok/ch
                          </span>
                          <span className="text-emerald-400">
                            {tr('Khmer:', 'ខ្មែរ៖')} {row.khmerRatio} tok/ch
                          </span>
                          <span className="text-amber-300">
                            {row.charsPerKhmerToken} {tr('chars/tok', 'តួ/ថូខិន')}
                          </span>
                          <span className="text-cyan-300">
                            {tr('Savings:', 'សន្សំ៖')} {row.efficiencyGainPct}%
                          </span>
                        </div>
                        <div className="text-[10px] font-mono text-slate-400 tabular-nums">
                          {row.charCount} chars · {row.baselineTokens} vs {row.khmerTokens} tokens
                        </div>
                      </div>
                    );
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <ReferenceLine
                  yAxisId="ratio"
                  y={TARGET_RATIO_THRESHOLD}
                  stroke="#fbbf24"
                  strokeDasharray="5 5"
                  label={{
                    value: isKm ? 'គោលដៅ ≤ 0.35' : 'Target ≤ 0.35',
                    position: 'insideTopLeft',
                    fill: '#fbbf24',
                    fontSize: 10,
                  }}
                />
                <Bar
                  yAxisId="ratio"
                  dataKey="baselineRatio"
                  name={tr('Baseline (tok/char)', 'ម៉ូដែលដើម (ថូខិន/តួ)')}
                  fill="#f43f5e"
                  radius={[4, 4, 0, 0]}
                  barSize={22}
                />
                <Bar
                  yAxisId="ratio"
                  dataKey="khmerRatio"
                  name={tr('Khmer SPM (tok/char)', 'ថូខិនខ្មែរ (ថូខិន/តួ)')}
                  fill="#34d399"
                  radius={[4, 4, 0, 0]}
                  barSize={22}
                />
                <Line
                  yAxisId="gain"
                  type="monotone"
                  dataKey="efficiencyGainPct"
                  name={tr('Efficiency Gain (%)', 'កម្រិតប្រសិទ្ធភាព (%)')}
                  stroke="#22d3ee"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#22d3ee', stroke: '#0f172a', strokeWidth: 1.5 }}
                />
              </ComposedChart>
            )}
          </ResponsiveContainer>
        </div>
      )}

      {/* Segment Ratio Quantification Table */}
      {activeDataset.length > 0 && (
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950 text-slate-400">
                  <th className={`py-2.5 px-4 font-semibold ${isKm ? 'font-khmer' : 'font-mono'}`}>
                    {trackingScope === 'sequential'
                      ? tr('Segment Clause', 'កង់អត្ថបទតាមលំដាប់')
                      : tr('Corpus Segment Domain', 'ប្រភេទកង់អត្ថបទគំរូ')}
                  </th>
                  <th className={`py-2.5 px-3 font-semibold text-right ${isKm ? 'font-khmer' : 'font-mono'}`}>
                    {tr('Chars', 'តួអក្សរ')}
                  </th>
                  <th className={`py-2.5 px-3 font-semibold text-right ${isKm ? 'font-khmer' : 'font-mono'}`}>
                    {tr('Base tok/ch', 'ដើម ថូខិន/តួ')}
                  </th>
                  <th className={`py-2.5 px-3 font-semibold text-right ${isKm ? 'font-khmer' : 'font-mono'}`}>
                    {tr('Khmer tok/ch', 'ខ្មែរ ថូខិន/តួ')}
                  </th>
                  <th className={`py-2.5 px-3 font-semibold text-right ${isKm ? 'font-khmer' : 'font-mono'}`}>
                    {tr('Chars / Tok', 'តួ / ថូខិន')}
                  </th>
                  <th className={`py-2.5 px-3 font-semibold text-right ${isKm ? 'font-khmer' : 'font-mono'}`}>
                    {tr('Savings %', 'សន្សំ %')}
                  </th>
                  <th className={`py-2.5 px-4 font-semibold text-right ${isKm ? 'font-khmer' : 'font-mono'}`}>
                    {tr('Efficiency Rating', 'កម្រិតប្រសិទ្ធភាព')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {activeDataset.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => {
                      if (trackingScope === 'domains') {
                        onSelectSampleText(row.text);
                      }
                    }}
                    className={`transition-colors ${
                      trackingScope === 'domains' ? 'cursor-pointer' : ''
                    } ${
                      row.isActiveInput
                        ? 'bg-amber-400/10 hover:bg-amber-400/15'
                        : 'hover:bg-slate-900/70'
                    }`}
                  >
                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-2 min-w-0">
                        {row.isActiveInput && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        )}
                        <span className="font-mono text-[11px] text-amber-300 shrink-0">
                          {row.shortLabel}
                        </span>
                        <span className="text-slate-500" aria-hidden="true">
                          ·
                        </span>
                        <span className={`text-slate-200 truncate max-w-xs ${isKm ? 'font-khmer' : ''}`}>
                          {row.title}
                        </span>
                        {trackingScope === 'domains' && !row.isActiveInput && (
                          <ArrowUpRight className="w-3 h-3 text-slate-500 shrink-0" />
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-300 tabular-nums">
                      {row.charCount}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-rose-400 tabular-nums">
                      {row.baselineRatio.toFixed(3)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-emerald-400 font-semibold tabular-nums">
                      {row.khmerRatio.toFixed(3)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-amber-300 tabular-nums">
                      {row.charsPerKhmerToken.toFixed(2)}×
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-cyan-300 tabular-nums">
                      {row.efficiencyGainPct}%
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono text-[11px] whitespace-nowrap">
                      <span
                        className={
                          row.efficiencyTier === 'OPTIMAL'
                            ? 'text-emerald-400 font-semibold'
                            : row.efficiencyTier === 'MODERATE'
                              ? 'text-amber-300 font-semibold'
                              : 'text-rose-400 font-semibold'
                        }
                      >
                        {tierLabel(row.efficiencyTier)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
