import React, { useMemo, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList
} from 'recharts';
import {
  Scale,
  ArrowDownRight,
  Cpu,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import {
  compareTokenizers,
  segmentKhmerSyllables,
  KhmerModelType,
  KHMER_MODELS,
  KHMER_COENG
} from '../utils/khmerLinguistics';
import { useLanguage } from '../contexts/LanguageContext';

export type Gpt4Variant = 'gpt4_cl100k' | 'gpt4o_o200k';

export interface TokenizerComparisonProps {
  inputText: string;
  onSelectSampleText?: (text: string) => void;
}

interface TokenizerBenchmarkRow {
  id: string;
  label: string;
  labelKm: string;
  shortLabel: string;
  vocabSize: string;
  strategy: string;
  strategyKm: string;
  tokenCount: number;
  byteCompressionRatio: number; // UTF-8 bytes per token
  vsLlamaRatio: number; // Llama-3 tokens / this tokenizer's tokens
  fertility: number; // tokens per phonological syllable
  charsPerToken: number;
  savingsVsLlamaPct: number;
  sampleTokens: string[];
  color: string;
  isCustomKhmer?: boolean;
}

const COMPLEX_KHMER_SAMPLES: Array<{
  id: string;
  label: string;
  labelKm: string;
  complexity: string;
  complexityKm: string;
  text: string;
}> = [
  {
    id: 'coeng_pali',
    label: 'Coeng Subscript Stacks',
    labelKm: 'ចង្កោមជើងព្យញ្ជនៈបាលី',
    complexity: 'High Coeng density + conjuncts',
    complexityKm: 'ដង់ស៊ីតេជើងព្យញ្ជនៈខ្ពស់',
    text: 'ព្រះរាជាណាចក្រកម្ពុជាប្រកាសអនុវត្តផែនការយុទ្ធសាស្ត្រអភិវឌ្ឍន៍វិទ្យាស្ថានស្រាវជ្រាវសុខាភិបាលនិងបច្ចេកវិទ្យាជីវសាស្ត្រកម្រិតខ្ពស់។'
  },
  {
    id: 'royal_decree',
    label: 'Legal & Constitutional Decree',
    labelKm: 'ព្រះរាជក្រឹត្យ និងច្បាប់',
    complexity: 'Scriptio continua + formal compounds',
    complexityKm: 'សំណេរជាប់គ្នា + សមាសនាមផ្លូវការ',
    text: 'រាជរដ្ឋាភិបាលសម្រេចបង្កើតគណៈកម្មាធិការជាតិគ្រប់គ្រងប្រព័ន្ធបញ្ញាសិប្បនិម្មិតនិងសន្តិសុខសាយប័រសម្រាប់ស្ថាប័នសាធារណៈឆ្នាំ២០២៦។'
  },
  {
    id: 'mixed_stem',
    label: 'Khmer + English Technical STEM',
    labelKm: 'បច្ចេកទេសខ្មែរ + អង់គ្លេស',
    complexity: 'Cross-script switching + RoPE/GQA terms',
    complexityKm: 'លាយអក្សរខ្មែរ និងពាក្យបច្ចេកទេស',
    text: 'ការបណ្តុះបណ្តាលម៉ូដែល Khmer-LLM-3B ជាមួយ Grouped-Query Attention (GQA) និង SentencePiece 32k កាត់បន្ថយ KV-Cache បាន ៤.៨ ដង។'
  },
  {
    id: 'classical_angkor',
    label: 'Classical Angkor Epigraphy',
    labelKm: 'សិលាចារឹក និងអក្សរសិល្ប៍អង្គរ',
    complexity: 'Multi-diacritic clusters & Sanskrit stems',
    complexityKm: 'ស្រៈ និងវណ្ណយុត្តិសំស្ក្រឹតស្មុគស្មាញ',
    text: 'ប្រាសាទអង្គរវត្តគឺជាស្នាដៃស្ថាបត្យកម្មដ៏ឧត្តុង្គឧត្តមនៃបុព្វបុរសខ្មែរក្នុងរជ្ជកាលព្រះបាទសូរ្យវរ្ម័នទី២សតវត្សរ៍ទី១២។'
  }
];

function isKhmerCharCode(code: number): boolean {
  return code >= 0x1780 && code <= 0x17ff;
}

/**
 * Simulate GPT-4 cl100k_base behavior on Khmer script:
 * cl100k_base contains virtually zero merged Khmer words; almost every Khmer
 * codepoint decomposes into 2–3 UTF-8 byte tokens (often merging the leading
 * 0xE1 0x9E prefix pair for common base consonants, while splitting Coeng & vowels into 3 bytes).
 */
function simulateGpt4Cl100k(text: string): { count: number; previewTokens: string[] } {
  const tokens: string[] = [];
  let i = 0;

  while (i < text.length) {
    const ch = text[i];
    const code = ch.charCodeAt(0);

    if (isKhmerCharCode(code)) {
      const bytes = new TextEncoder().encode(ch);
      // Base consonants U+1780..U+17A2 frequently pair first two UTF-8 bytes (E1 9E) in cl100k_base
      if (code >= 0x1780 && code <= 0x17a2 && bytes.length === 3) {
        const b0 = bytes[0].toString(16).toUpperCase().padStart(2, '0');
        const b1 = bytes[1].toString(16).toUpperCase().padStart(2, '0');
        const b2 = bytes[2].toString(16).toUpperCase().padStart(2, '0');
        tokens.push(`<${b0}·${b1}>`, `<0x${b2}>`);
      } else {
        for (const b of bytes) {
          tokens.push(`<0x${b.toString(16).toUpperCase().padStart(2, '0')}>`);
        }
      }
      i += 1;
      continue;
    }

    // Group ASCII words roughly like BPE
    if (/[A-Za-z0-9_-]/.test(ch)) {
      let end = i + 1;
      while (end < text.length && /[A-Za-z0-9_-]/.test(text[end]) && end - i < 8) {
        end++;
      }
      tokens.push(text.slice(i, end));
      i = end;
      continue;
    }

    tokens.push(ch === ' ' ? 'Ġ' : ch);
    i += 1;
  }

  return {
    count: Math.max(1, tokens.length),
    previewTokens: tokens.slice(0, 18)
  };
}

/**
 * Simulate GPT-4o o200k_base behavior on Khmer script:
 * o200k_base includes single-codepoint coverage for frequent Khmer base letters and some
 * common 2-char CV pairs, but still splits Coeng subscript ligatures and stacked clusters.
 */
function simulateGpt4oO200k(text: string): { count: number; previewTokens: string[] } {
  const tokens: string[] = [];
  let i = 0;

  while (i < text.length) {
    const ch = text[i];
    const code = ch.charCodeAt(0);

    if (isKhmerCharCode(code)) {
      const next = i + 1 < text.length ? text[i + 1] : '';
      const nextCode = next ? next.charCodeAt(0) : 0;

      // Occasional 2-char merge of base consonant + simple dependent vowel (e.g. កា, និ, មា)
      if (
        code >= 0x1780 &&
        code <= 0x17a2 &&
        nextCode >= 0x17b6 &&
        nextCode <= 0x17c5 &&
        (code + nextCode) % 2 === 0
      ) {
        tokens.push(ch + next);
        i += 2;
        continue;
      }

      // Single codepoint token for base consonants & common dependent vowels; Coeng/rare diacritics split to bytes
      if (ch === KHMER_COENG || code >= 0x17c9) {
        const bytes = new TextEncoder().encode(ch);
        for (const b of bytes) {
          tokens.push(`<0x${b.toString(16).toUpperCase().padStart(2, '0')}>`);
        }
      } else {
        tokens.push(ch);
      }
      i += 1;
      continue;
    }

    if (/[A-Za-z0-9_-]/.test(ch)) {
      let end = i + 1;
      while (end < text.length && /[A-Za-z0-9_-]/.test(text[end]) && end - i < 10) {
        end++;
      }
      tokens.push(text.slice(i, end));
      i = end;
      continue;
    }

    tokens.push(ch === ' ' ? 'Ġ' : ch);
    i += 1;
  }

  return {
    count: Math.max(1, tokens.length),
    previewTokens: tokens.slice(0, 18)
  };
}

export const TokenizerComparison: React.FC<TokenizerComparisonProps> = ({
  inputText,
  onSelectSampleText
}) => {
  const { isKm, tr } = useLanguage();
  const [khmerProfile, setKhmerProfile] = useState<KhmerModelType>('khmer_spm_32k');
  const [gpt4Variant, setGpt4Variant] = useState<Gpt4Variant>('gpt4_cl100k');
  const [metricChartMode, setMetricChartMode] = useState<'tokens' | 'compression'>('tokens');

  const activeText = inputText.trim().length > 0 ? inputText : COMPLEX_KHMER_SAMPLES[0].text;

  const benchmark = useMemo(() => {
    const utf8Bytes = Math.max(1, new TextEncoder().encode(activeText).length);
    const charCount = Math.max(1, activeText.length);
    const syllables = segmentKhmerSyllables(activeText);
    const syllableCount = Math.max(1, syllables.length);

    // Count Coeng subscripts & Khmer characters for script complexity telemetry
    let coengCount = 0;
    let khmerCharCount = 0;
    for (let i = 0; i < activeText.length; i++) {
      if (activeText[i] === KHMER_COENG) coengCount++;
      if (isKhmerCharCode(activeText.charCodeAt(i))) khmerCharCount++;
    }

    // 1. Llama-3 (tiktoken 128k) & Custom Khmer SentencePiece from shared engine
    const spmResult = compareTokenizers(activeText, 'llama3_tiktoken', khmerProfile);
    const llamaCount = Math.max(1, spmResult.llamaTokenCount);
    const spmCount = Math.max(1, spmResult.khmerTokenCount);

    // 2. GPT-4 cl100k_base
    const gpt4Cl100k = simulateGpt4Cl100k(activeText);

    // 3. GPT-4o o200k_base
    const gpt4oO200k = simulateGpt4oO200k(activeText);

    const buildRow = (params: {
      id: string;
      label: string;
      labelKm: string;
      shortLabel: string;
      vocabSize: string;
      strategy: string;
      strategyKm: string;
      tokenCount: number;
      sampleTokens: string[];
      color: string;
      isCustomKhmer?: boolean;
    }): TokenizerBenchmarkRow => {
      const byteCompressionRatio = Number((utf8Bytes / params.tokenCount).toFixed(2));
      const vsLlamaRatio = Number((llamaCount / params.tokenCount).toFixed(2));
      const fertility = Number((params.tokenCount / syllableCount).toFixed(2));
      const charsPerToken = Number((charCount / params.tokenCount).toFixed(2));
      const savingsVsLlamaPct = Math.max(0, Math.round((1 - params.tokenCount / llamaCount) * 100));

      return {
        ...params,
        byteCompressionRatio,
        vsLlamaRatio,
        fertility,
        charsPerToken,
        savingsVsLlamaPct
      };
    };

    const khmerMeta = KHMER_MODELS[khmerProfile];

    const rows: TokenizerBenchmarkRow[] = [
      buildRow({
        id: 'llama3',
        label: 'LLaMA-3 (tiktoken 128k)',
        labelKm: 'LLaMA-3 (tiktoken 128k)',
        shortLabel: 'LLaMA-3 (128k)',
        vocabSize: '128,256',
        strategy: '3-byte UTF-8 byte-level fallback per Khmer char',
        strategyKm: 'បំបែកអក្សរខ្មែរ ១ តួ ទៅជាបៃឆៅ UTF-8 ចំនួន ៣ ថូខិន',
        tokenCount: llamaCount,
        sampleTokens: spmResult.standardLlamaTokens.slice(0, 18).map((t) => t.token),
        color: '#f43f5e' // rose-500
      }),
      buildRow({
        id: 'gpt4_cl100k',
        label: 'GPT-4 (cl100k_base)',
        labelKm: 'GPT-4 (cl100k_base)',
        shortLabel: 'GPT-4 (cl100k)',
        vocabSize: '100,277',
        strategy: 'Minimal Khmer merges · 2–3 byte BPE splits per glyph',
        strategyKm: 'ខ្វះការបញ្ចូលអក្សរខ្មែរ · បំបែកជា ២–៣ បៃក្នុង ១ តួអក្សរ',
        tokenCount: gpt4Cl100k.count,
        sampleTokens: gpt4Cl100k.previewTokens,
        color: '#fb923c' // orange-400
      }),
      buildRow({
        id: 'gpt4o_o200k',
        label: 'GPT-4o (o200k_base)',
        labelKm: 'GPT-4o (o200k_base)',
        shortLabel: 'GPT-4o (o200k)',
        vocabSize: '200,019',
        strategy: 'Single-codepoint base coverage · splits Coeng & clusters',
        strategyKm: 'ស្គាល់តួអក្សរមូលដ្ឋានខ្លះ · ប៉ុន្តែបំបែកជើង Coeng ដដែល',
        tokenCount: gpt4oO200k.count,
        sampleTokens: gpt4oO200k.previewTokens,
        color: '#38bdf8' // sky-400
      }),
      buildRow({
        id: khmerProfile,
        label: khmerMeta.name,
        labelKm: khmerMeta.nameKm,
        shortLabel:
          khmerProfile === 'khmer_spm_64k'
            ? 'Khmer SPM (64k)'
            : khmerProfile === 'khmer_unigram_32k'
              ? 'Khmer Unigram (32k)'
              : 'Khmer SPM (32k)',
        vocabSize: khmerMeta.vocabSize,
        strategy: 'Syllable-aware subwords & compound ligatures intact',
        strategyKm: 'បង្រួមព្យាង្គ និងជើងព្យញ្ជនៈទាំងមូលជាថូខិនតែមួយ',
        tokenCount: spmCount,
        sampleTokens: spmResult.khmerOptimizedTokens.slice(0, 14).map((t) => t.token),
        color: '#10b981', // emerald-500
        isCustomKhmer: true
      })
    ];

    const selectedGpt4Row = gpt4Variant === 'gpt4_cl100k' ? rows[1] : rows[2];
    const customRow = rows[3];
    const llamaRow = rows[0];

    const ratioVsGpt4 = Number((selectedGpt4Row.tokenCount / customRow.tokenCount).toFixed(2));
    const savingsVsGpt4Pct = Math.max(
      0,
      Math.round((1 - customRow.tokenCount / selectedGpt4Row.tokenCount) * 100)
    );

    return {
      rows,
      utf8Bytes,
      charCount,
      syllableCount,
      coengCount,
      khmerRatioPct: Math.round((khmerCharCount / charCount) * 100),
      llamaRow,
      selectedGpt4Row,
      customRow,
      ratioVsGpt4,
      savingsVsGpt4Pct
    };
  }, [activeText, khmerProfile, gpt4Variant]);

  const firstClause = useMemo(() => {
    const idx = activeText.indexOf('។');
    if (idx > 0 && idx < 64) return activeText.slice(0, idx + 1);
    return activeText.slice(0, 56);
  }, [activeText]);

  return (
    <section
      aria-labelledby="tokenizer-comparison-heading"
      className="p-5 sm:p-6 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-6"
    >
      {/* Header & Profile Selectors */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <div
            className={`inline-flex items-center gap-2 text-xs font-semibold text-amber-400 tracking-wider ${
              isKm ? 'font-khmer' : 'font-mono uppercase'
            }`}
          >
            <Scale className="w-3.5 h-3.5 shrink-0" />
            <span>{tr('MULTI-TOKENIZER BENCHMARK', 'ការប្រៀបធៀបថូខិនណាយស័រច្រើនម៉ូដែល')}</span>
            <span aria-hidden="true" className="text-slate-600">
              ·
            </span>
            <span className="tabular-nums">
              {benchmark.utf8Bytes} B UTF-8 · {benchmark.coengCount} Coeng
            </span>
          </div>
          <h3
            id="tokenizer-comparison-heading"
            className={`text-lg sm:text-xl font-bold text-white tracking-tight ${isKm ? 'font-khmer' : ''}`}
          >
            {tr(
              'Tokenizer Comparison: Custom Khmer SentencePiece vs GPT-4 & LLaMA-3',
              'ការប្រៀបធៀប Tokenizer៖ Khmer SentencePiece ផ្ទាល់ខ្លួន ធៀបនឹង GPT-4 និង LLaMA-3'
            )}
          </h3>
          <p className={`text-xs text-slate-300 max-w-3xl leading-relaxed ${isKm ? 'font-khmer' : ''}`}>
            {tr(
              'Quantifies token counts, UTF-8 compression ratios, and syllable fertility across GPT-4 (cl100k / o200k), LLaMA-3 (128k), and custom Khmer SentencePiece on identical complex Khmer script.',
              'វាស់ស្ទង់ចំនួនថូខិន សមាមាត្របង្រួម UTF-8 និងអត្រាបំបែកព្យាង្គរវាង GPT-4 (cl100k / o200k), LLaMA-3 (128k) និង Khmer SentencePiece លើអត្ថបទខ្មែរស្មុគស្មាញដូចគ្នា។'
            )}
          </p>
        </div>

        {/* Selectors */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <label className="flex flex-col gap-1 text-[11px] font-mono text-slate-400">
            <span>{tr('KHMER SPM PROFILE', 'ទម្រង់ KHMER SPM')}</span>
            <select
              value={khmerProfile}
              onChange={(e) => setKhmerProfile(e.target.value as KhmerModelType)}
              aria-label={tr('Select Khmer SentencePiece profile', 'ជ្រើសរើសទម្រង់ Khmer SentencePiece')}
              className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-emerald-300 font-mono focus:outline-none focus:border-emerald-400 cursor-pointer"
            >
              {(Object.keys(KHMER_MODELS) as KhmerModelType[]).map((key) => (
                <option key={key} value={key}>
                  {isKm ? KHMER_MODELS[key].nameKm : KHMER_MODELS[key].name}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-[11px] font-mono text-slate-400">
            <span>{tr('GPT-4 REFERENCE', 'ម៉ូដែល GPT-4 យោង')}</span>
            <select
              value={gpt4Variant}
              onChange={(e) => setGpt4Variant(e.target.value as Gpt4Variant)}
              aria-label={tr('Select GPT-4 tokenizer baseline', 'ជ្រើសរើសម៉ូដែល GPT-4 យោង')}
              className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-amber-300 font-mono focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              <option value="gpt4_cl100k">GPT-4 (cl100k_base · 100k)</option>
              <option value="gpt4o_o200k">GPT-4o (o200k_base · 200k)</option>
            </select>
          </label>
        </div>
      </div>

      {/* Complex Khmer Script Quick-Load Presets */}
      {onSelectSampleText && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className={`text-[11px] text-slate-400 ${isKm ? 'font-khmer' : 'font-mono uppercase'}`}>
            {tr('COMPLEX SCRIPT STRESS TESTS:', 'អត្ថបទសាកល្បងកម្រិតស្មុគស្មាញ៖')}
          </span>
          {COMPLEX_KHMER_SAMPLES.map((sample) => {
            const isActive = activeText === sample.text;
            return (
              <button
                key={sample.id}
                type="button"
                onClick={() => onSelectSampleText(sample.text)}
                title={isKm ? sample.complexityKm : sample.complexity}
                className={`px-2.5 py-1 rounded-lg text-[11px] border transition-colors whitespace-nowrap shrink-0 ${
                  isKm ? 'font-khmer' : 'font-mono'
                } ${
                  isActive
                    ? 'bg-amber-400 text-slate-950 border-amber-400 font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                }`}
              >
                {isKm ? sample.labelKm : sample.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Headline Benchmark KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>{tr('VS LLAMA-3 (128K BPE)', 'ធៀបនឹង LLAMA-3 (128K BPE)')}</span>
            <ArrowDownRight className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
            {benchmark.customRow.vsLlamaRatio}× {tr('fewer tokens', 'តិចជាង')}
          </div>
          <div className={`text-[11px] text-slate-400 tabular-nums ${isKm ? 'font-khmer' : 'font-mono'}`}>
            {benchmark.customRow.tokenCount} vs {benchmark.llamaRow.tokenCount}{' '}
            {tr('tokens', 'ថូខិន')} (−{benchmark.customRow.savingsVsLlamaPct}%)
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>
              {gpt4Variant === 'gpt4_cl100k'
                ? tr('VS GPT-4 (CL100K_BASE)', 'ធៀបនឹង GPT-4 (CL100K_BASE)')
                : tr('VS GPT-4O (O200K_BASE)', 'ធៀបនឹង GPT-4O (O200K_BASE)')}
            </span>
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-300 tabular-nums">
            {benchmark.ratioVsGpt4}× {tr('compression', 'បង្រួម')}
          </div>
          <div className={`text-[11px] text-slate-400 tabular-nums ${isKm ? 'font-khmer' : 'font-mono'}`}>
            {benchmark.customRow.tokenCount} vs {benchmark.selectedGpt4Row.tokenCount}{' '}
            {tr('tokens', 'ថូខិន')} (−{benchmark.savingsVsGpt4Pct}%)
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>{tr('UTF-8 BYTE COMPRESSION', 'សមាមាត្របង្រួម UTF-8')}</span>
            <Cpu className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          </div>
          <div className="text-2xl font-bold font-mono text-cyan-300 tabular-nums">
            {benchmark.customRow.byteCompressionRatio} B/tok
          </div>
          <div className={`text-[11px] text-slate-400 tabular-nums ${isKm ? 'font-khmer' : 'font-mono'}`}>
            {benchmark.customRow.charsPerToken} {tr('chars/token', 'តួអក្សរ/ថូខិន')} ·{' '}
            {benchmark.syllableCount} {tr('syllables', 'ព្យាង្គ')}
          </div>
        </div>
      </div>

      {/* Main Chart + Strategy Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left: Recharts Quantitative Bar Chart */}
        <div className="lg:col-span-7 p-4 rounded-xl border border-slate-800 bg-slate-950/70 flex flex-col justify-between space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="space-y-0.5">
              <h4 className={`text-xs font-bold text-white uppercase tracking-wider ${isKm ? 'font-khmer' : 'font-mono'}`}>
                {metricChartMode === 'tokens'
                  ? tr('Total Token Count (Lower = Higher Efficiency)', 'ចំនួនថូខិនសរុប (តិច = ប្រសិទ្ធភាពខ្ពស់)')
                  : tr('Compression Multiplier vs LLaMA-3 Baseline (Higher = Better)', 'មេគុណបង្រួមធៀបនឹង LLaMA-3 (ខ្ពស់ = ល្អប្រសើរ)')}
              </h4>
              <p className={`text-[11px] text-slate-400 ${isKm ? 'font-khmer' : ''}`}>
                {tr(
                  `Sample length: ${benchmark.charCount} chars · ${benchmark.khmerRatioPct}% Khmer Unicode`,
                  `ប្រវែងអត្ថបទ៖ ${benchmark.charCount} តួអក្សរ · អក្សរខ្មែរ ${benchmark.khmerRatioPct}%`
                )}
              </p>
            </div>

            <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono">
              <button
                type="button"
                onClick={() => setMetricChartMode('tokens')}
                className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap shrink-0 ${
                  metricChartMode === 'tokens'
                    ? 'bg-amber-400 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tr('Token Count', 'ចំនួនថូខិន')}
              </button>
              <button
                type="button"
                onClick={() => setMetricChartMode('compression')}
                className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap shrink-0 ${
                  metricChartMode === 'compression'
                    ? 'bg-amber-400 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tr('Compression ×', 'សមាមាត្រ ×')}
              </button>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={benchmark.rows}
                layout="vertical"
                margin={{ top: 8, right: 48, left: 10, bottom: 8 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                <XAxis
                  type="number"
                  stroke="#94a3b8"
                  tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }}
                />
                <YAxis
                  type="category"
                  dataKey="shortLabel"
                  width={132}
                  stroke="#94a3b8"
                  tick={{ fill: '#e2e8f0', fontSize: 11, fontFamily: 'monospace' }}
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
                  formatter={(value) => {
                    const num = Number(value ?? 0);
                    return metricChartMode === 'tokens'
                      ? [`${num} ${tr('tokens', 'ថូខិន')}`, tr('Token Count', 'ចំនួនថូខិន')]
                      : [`${num}×`, tr('Compression vs LLaMA-3', 'មេគុណបង្រួម')];
                  }}
                />
                <Bar
                  dataKey={metricChartMode === 'tokens' ? 'tokenCount' : 'vsLlamaRatio'}
                  radius={[0, 6, 6, 0]}
                  barSize={26}
                >
                  {benchmark.rows.map((entry) => (
                    <Cell key={entry.id} fill={entry.color} />
                  ))}
                  <LabelList
                    dataKey={metricChartMode === 'tokens' ? 'tokenCount' : 'vsLlamaRatio'}
                    position="right"
                    fill="#e2e8f0"
                    fontSize={11}
                    fontFamily="monospace"
                    formatter={(val) =>
                      metricChartMode === 'tokens' ? `${val}` : `${val}×`
                    }
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Script Complexity & Engineering Takeaways */}
        <div className="lg:col-span-5 p-4 rounded-xl border border-slate-800 bg-slate-950/70 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-200 uppercase">
              <Layers className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>{tr('Complex Script Bottleneck Audit', 'ការវិភាគចំណុចកកស្ទះនៃអក្សរខ្មែរ')}</span>
            </div>

            <div className="divide-y divide-slate-800/80 text-xs">
              <div className="py-2 flex items-center justify-between gap-2">
                <span className={`text-slate-400 ${isKm ? 'font-khmer' : ''}`}>
                  {tr('Coeng Subscripts (U+17D2)', 'ជើងព្យញ្ជនៈ (U+17D2)')}
                </span>
                <span className="font-mono font-bold text-amber-300 tabular-nums">
                  {benchmark.coengCount} {tr('stacks', 'ជើង')}
                </span>
              </div>
              <div className="py-2 flex items-center justify-between gap-2">
                <span className={`text-slate-400 ${isKm ? 'font-khmer' : ''}`}>
                  {tr('Phonological Syllables', 'ចង្កោមព្យាង្គសរុប')}
                </span>
                <span className="font-mono font-bold text-white tabular-nums">
                  {benchmark.syllableCount}
                </span>
              </div>
              <div className="py-2 flex items-center justify-between gap-2">
                <span className={`text-slate-400 ${isKm ? 'font-khmer' : ''}`}>
                  {tr('4K Context Capacity (Khmer SPM vs LLaMA-3)', 'សមត្ថភាពបរិបទ 4K (Khmer SPM vs LLaMA-3)')}
                </span>
                <span className="font-mono font-bold text-emerald-400 tabular-nums">
                  {Math.round(4000 / Math.max(0.5, benchmark.customRow.fertility))} vs{' '}
                  {Math.round(4000 / Math.max(0.5, benchmark.llamaRow.fertility))}{' '}
                  {tr('syl', 'ព្យាង្គ')}
                </span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg border border-emerald-500/30 bg-emerald-950/20 space-y-1.5 text-xs">
            <div className="flex items-center gap-1.5 font-semibold text-emerald-300">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span className={isKm ? 'font-khmer' : 'font-mono'}>
                {tr('Why Custom SentencePiece Wins', 'ហេតុអ្វី Khmer SentencePiece ឈ្នះ')}
              </span>
            </div>
            <p className={`text-[11px] text-slate-300 leading-relaxed ${isKm ? 'font-khmer' : ''}`}>
              {tr(
                `At ${benchmark.customRow.fertility} tokens/syllable vs ${benchmark.selectedGpt4Row.fertility} (${benchmark.selectedGpt4Row.shortLabel}) and ${benchmark.llamaRow.fertility} (LLaMA-3), keeping Coeng conjuncts unsplit cuts Transformer attention quadratic sequence length by ${benchmark.customRow.savingsVsLlamaPct}% vs LLaMA-3.`,
                `នៅកម្រិត ${benchmark.customRow.fertility} ថូខិន/ព្យាង្គ ធៀបនឹង ${benchmark.selectedGpt4Row.fertility} (${benchmark.selectedGpt4Row.shortLabel}) និង ${benchmark.llamaRow.fertility} (LLaMA-3) ការរក្សាជើងព្យញ្ជនៈមិនឱ្យបែកខ្ញែកជួយកាត់បន្ថយប្រវែងលំដាប់ Attention បាន ${benchmark.customRow.savingsVsLlamaPct}%។`
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Detailed Benchmark Comparison Matrix */}
      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/70">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-[11px] font-mono text-slate-400 uppercase bg-slate-900/60">
              <th className="py-3 px-4">{tr('Tokenizer', 'ថូខិនណាយស័រ')}</th>
              <th className="py-3 px-3">{tr('Vocab', 'វាក្យសព្ទ')}</th>
              <th className="py-3 px-3 text-right">{tr('Tokens', 'ថូខិន')}</th>
              <th className="py-3 px-3 text-right">{tr('Ratio vs LLaMA-3', 'សមាមាត្រ vs LLaMA-3')}</th>
              <th className="py-3 px-3 text-right">{tr('Bytes / Token', 'បៃ / ថូខិន')}</th>
              <th className="py-3 px-3 text-right">{tr('Fertility (Tok/Syl)', 'អត្រាបំបែក')}</th>
              <th className="py-3 px-4">{tr('Khmer Script Behavior', 'ការគ្រប់គ្រងអក្សរខ្មែរ')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/70">
            {benchmark.rows.map((row) => (
              <tr
                key={row.id}
                className={
                  row.isCustomKhmer
                    ? 'bg-emerald-950/20 text-white'
                    : 'text-slate-300 hover:bg-slate-900/40'
                }
              >
                <td className="py-3 px-4 font-mono font-semibold whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: row.color }}
                      aria-hidden="true"
                    />
                    <span className={row.isCustomKhmer ? 'text-emerald-300 font-bold' : 'text-white'}>
                      {isKm ? row.labelKm : row.label}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-3 font-mono text-slate-400 tabular-nums whitespace-nowrap">
                  {row.vocabSize}
                </td>
                <td className="py-3 px-3 text-right font-mono font-bold tabular-nums whitespace-nowrap">
                  <span className={row.isCustomKhmer ? 'text-emerald-300' : 'text-slate-100'}>
                    {row.tokenCount}
                  </span>
                </td>
                <td className="py-3 px-3 text-right font-mono font-bold tabular-nums whitespace-nowrap">
                  <span className={row.isCustomKhmer ? 'text-amber-300' : 'text-slate-300'}>
                    {row.vsLlamaRatio}×
                  </span>
                </td>
                <td className="py-3 px-3 text-right font-mono tabular-nums whitespace-nowrap">
                  {row.byteCompressionRatio} B
                </td>
                <td className="py-3 px-3 text-right font-mono tabular-nums whitespace-nowrap">
                  {row.fertility}
                </td>
                <td className={`py-3 px-4 text-[11px] text-slate-400 ${isKm ? 'font-khmer' : ''}`}>
                  {isKm ? row.strategyKm : row.strategy}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* First-Clause Subword / Byte Fragmentation Comparison */}
      <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/70 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-200 uppercase">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>{tr('Leading Clause Fragmentation Snapshot', 'ទិដ្ឋភាពការបំបែកឃ្លាដំបូង')}</span>
          </div>
          <span className="font-khmer text-xs text-amber-200/90 truncate max-w-md">
            “{firstClause}”
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[benchmark.llamaRow, benchmark.selectedGpt4Row, benchmark.customRow].map((row) => (
            <div
              key={`snap-${row.id}`}
              className="p-3 rounded-lg border border-slate-800 bg-slate-900/50 space-y-2"
            >
              <div className="flex items-center justify-between gap-2 text-[11px] font-mono">
                <span className="font-bold text-white truncate">{row.shortLabel}</span>
                <span className="text-slate-400 tabular-nums shrink-0">
                  {row.tokenCount} {tr('tok', 'ថូខិន')} · {row.vsLlamaRatio}×
                </span>
              </div>
              <div className="flex flex-wrap gap-1">
                {row.sampleTokens.map((piece, idx) => (
                  <span
                    key={idx}
                    className={`px-1.5 py-0.5 rounded text-[10px] border ${
                      row.isCustomKhmer
                        ? 'font-khmer bg-emerald-950/50 border-emerald-700/60 text-emerald-200'
                        : 'font-mono bg-slate-950 border-slate-700/80 text-rose-200'
                    }`}
                  >
                    {piece === ' ' ? '▁' : piece}
                  </span>
                ))}
                {row.tokenCount > row.sampleTokens.length && (
                  <span className="px-1.5 py-0.5 text-[10px] font-mono text-slate-500">
                    +{row.tokenCount - row.sampleTokens.length} {tr('more', 'ទៀត')}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
