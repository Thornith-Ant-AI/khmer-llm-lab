import React, { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import {
  segmentKhmerSyllables,
  compareTokenizers,
  SAMPLE_KHMER_PHRASES
} from '../utils/khmerLinguistics';
import { useLanguage } from '../contexts/LanguageContext';
import { BarChart3, Layers, ArrowUpRight, CheckCircle2 } from 'lucide-react';

interface SyllableEfficiencyChartProps {
  activeText: string;
  onSelectSampleText: (text: string) => void;
}

interface SamplePresetExtended {
  id: string;
  shortLabel: string;
  shortLabelKm: string;
  title: string;
  titleKm: string;
  text: string;
}

interface SampleEfficiencyRow {
  id: string;
  shortLabel: string;
  title: string;
  text: string;
  totalChars: number;
  khmerChars: number;
  syllableCount: number;
  khmerClusterCount: number;
  charsPerSyllable: number;
  mappingEfficiencyPct: number;
  coengDensityPct: number;
  khmerTokenCount: number;
  llamaTokenCount: number;
  // Cluster length distribution (%)
  pct1Char: number;
  pct2Char: number;
  pct3To4Char: number;
  pct5PlusChar: number;
  isActiveInput: boolean;
}

const EXTRA_BENCHMARK_SAMPLES: SamplePresetExtended[] = [
  {
    id: 'royal-buddhist',
    shortLabel: 'Buddhist Pali',
    shortLabelKm: 'ព្រះត្រៃបិដក',
    title: 'Buddhist Institute & Pali Compounds',
    titleKm: 'ពុទ្ធសាសនបណ្ឌិត្យ និងពាក្យបាលី-សំស្ក្រឹត',
    text: 'ព្រះសម្មាសម្ពុទ្ធទ្រង់ត្រាស់សម្តែងព្រះធម៌វិន័យប្រកបដោយបញ្ញាញាណដ៏ជ្រាលជ្រៅសម្រាប់សត្វលោកទូទៅ។'
  },
  {
    id: 'legal-gazette',
    shortLabel: 'Legal Gazette',
    shortLabelKm: 'រាជកិច្ចច្បាប់',
    title: 'Royal Gazette Administrative Prose',
    titleKm: 'អត្ថបទច្បាប់ និងរាជកិច្ចផ្លូវការ',
    text: 'ព្រះរាជក្រឹត្យស្តីពីការរៀបចំនិងការប្រព្រឹត្តទៅនៃក្រុមប្រឹក្សាអភិវឌ្ឍន៍បច្ចេកវិទ្យាឌីជីថលជាតិ។'
  }
];

function computeEfficiencyMetrics(
  id: string,
  shortLabel: string,
  title: string,
  text: string,
  isActiveInput: boolean
): SampleEfficiencyRow {
  const nonSpaceChars = text.replace(/\s+/g, '');
  const totalChars = nonSpaceChars.length;
  const khmerChars = (nonSpaceChars.match(/[\u1780-\u17FF]/g) || []).length;

  const clusters = segmentKhmerSyllables(text);
  const syllableCount = Math.max(1, clusters.length);

  // Filter clusters that actually begin with a Khmer consonant or independent vowel
  const khmerClusters = clusters.filter((c) => /^[\u1780-\u17B3]/.test(c));
  const khmerClusterCount = khmerClusters.length;
  const coengClusters = khmerClusters.filter((c) => c.includes('\u17D2')).length;

  const comparison = compareTokenizers(text);

  // Character-to-syllable ratio (how many Unicode chars pack into one phonological cluster)
  const charsPerSyllable =
    totalChars > 0 ? Number((totalChars / syllableCount).toFixed(2)) : 0;

  // Efficiency: % reduction from raw codepoints to unified phonological/subword units
  const khmerRatio = totalChars > 0 ? khmerChars / totalChars : 0;
  const rawPackingEfficiency =
    totalChars > 0
      ? Math.max(0, ((totalChars - syllableCount) / totalChars) * 100)
      : 0;
  // Penalize non-Khmer / Limon noise so true Khmer cluster packing stands out clearly
  const mappingEfficiencyPct = Number((rawPackingEfficiency * khmerRatio).toFixed(1));
  const coengDensityPct =
    khmerClusterCount > 0
      ? Number(((coengClusters / khmerClusterCount) * 100).toFixed(1))
      : 0;

  // Cluster length distribution across all segmented clusters
  let c1 = 0;
  let c2 = 0;
  let c34 = 0;
  let c5plus = 0;
  for (const cl of clusters) {
    const len = cl.length;
    if (len <= 1) c1 += 1;
    else if (len === 2) c2 += 1;
    else if (len <= 4) c34 += 1;
    else c5plus += 1;
  }

  const denom = Math.max(1, clusters.length);

  return {
    id,
    shortLabel,
    title,
    text,
    totalChars,
    khmerChars,
    syllableCount,
    khmerClusterCount,
    charsPerSyllable,
    mappingEfficiencyPct,
    coengDensityPct,
    khmerTokenCount: comparison.khmerTokenCount,
    llamaTokenCount: comparison.llamaTokenCount,
    pct1Char: Number(((c1 / denom) * 100).toFixed(1)),
    pct2Char: Number(((c2 / denom) * 100).toFixed(1)),
    pct3To4Char: Number(((c34 / denom) * 100).toFixed(1)),
    pct5PlusChar: Number(((c5plus / denom) * 100).toFixed(1)),
    isActiveInput
  };
}

export const SyllableEfficiencyChart: React.FC<SyllableEfficiencyChartProps> = ({
  activeText,
  onSelectSampleText
}) => {
  const { isKm, tr } = useLanguage();
  const [chartTab, setChartTab] = useState<'efficiency' | 'distribution'>('efficiency');

  const sampleRows = useMemo<SampleEfficiencyRow[]>(() => {
    const presetDefinitions: SamplePresetExtended[] = [
      {
        id: 'gov-policy',
        shortLabel: 'Gov Policy',
        shortLabelKm: 'ផែនការជាតិ',
        title: SAMPLE_KHMER_PHRASES[0].title,
        titleKm: SAMPLE_KHMER_PHRASES[0].titleKm,
        text: SAMPLE_KHMER_PHRASES[0].text
      },
      {
        id: 'angkor-lit',
        shortLabel: 'Angkor Lit',
        shortLabelKm: 'អក្សរសិល្ប៍អង្គរ',
        title: SAMPLE_KHMER_PHRASES[1].title,
        titleKm: SAMPLE_KHMER_PHRASES[1].titleKm,
        text: SAMPLE_KHMER_PHRASES[1].text
      },
      {
        id: 'science-tech',
        shortLabel: 'Science & AI',
        shortLabelKm: 'វិទ្យាសាស្ត្រ',
        title: SAMPLE_KHMER_PHRASES[2].title,
        titleKm: SAMPLE_KHMER_PHRASES[2].titleKm,
        text: SAMPLE_KHMER_PHRASES[2].text
      },
      ...EXTRA_BENCHMARK_SAMPLES,
      {
        id: 'web-spam',
        shortLabel: 'Crawl Spam',
        shortLabelKm: 'សារកាស៊ីណូ',
        title: SAMPLE_KHMER_PHRASES[4].title,
        titleKm: SAMPLE_KHMER_PHRASES[4].titleKm,
        text: SAMPLE_KHMER_PHRASES[4].text
      },
      {
        id: 'limon-legacy',
        shortLabel: 'Limon ASCII',
        shortLabelKm: 'កូដ Limon',
        title: SAMPLE_KHMER_PHRASES[3].title,
        titleKm: SAMPLE_KHMER_PHRASES[3].titleKm,
        text: SAMPLE_KHMER_PHRASES[3].text
      }
    ];

    const rows = presetDefinitions.map((preset) =>
      computeEfficiencyMetrics(
        preset.id,
        isKm ? preset.shortLabelKm : preset.shortLabel,
        isKm ? preset.titleKm : preset.title,
        preset.text,
        activeText.trim() === preset.text.trim()
      )
    );

    const matchesPreset = rows.some((r) => r.isActiveInput);
    if (!matchesPreset && activeText.trim().length > 0) {
      rows.unshift(
        computeEfficiencyMetrics(
          'custom-input',
          isKm ? 'អត្ថបទផ្ទាល់ខ្លួន' : 'Custom Input',
          isKm ? 'អត្ថបទដែលអ្នកបានវាយបញ្ចូល' : 'Current Custom Editor Input',
          activeText,
          true
        )
      );
    }

    return rows;
  }, [activeText, isKm]);

  const summary = useMemo(() => {
    const validKhmerRows = sampleRows.filter((r) => r.khmerChars > 0);
    const highestEfficiency = [...sampleRows].sort(
      (a, b) => b.mappingEfficiencyPct - a.mappingEfficiencyPct
    )[0];
    const highestDensity = [...sampleRows].sort(
      (a, b) => b.charsPerSyllable - a.charsPerSyllable
    )[0];
    const avgCharsPerSyl =
      validKhmerRows.length > 0
        ? (
            validKhmerRows.reduce((acc, r) => acc + r.charsPerSyllable, 0) /
            validKhmerRows.length
          ).toFixed(2)
        : '0.00';

    return {
      highestEfficiency,
      highestDensity,
      avgCharsPerSyl
    };
  }, [sampleRows]);

  return (
    <div className="p-5 sm:p-6 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-6">
      {/* Section Header & Chart Mode Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="space-y-1">
          <div
            className={`inline-flex items-center gap-2 text-xs font-semibold text-amber-400 tracking-wider ${
              isKm ? 'font-khmer' : 'uppercase font-mono'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>
              {tr(
                'CHARACTER-TO-SYLLABLE MAPPING ANALYZER',
                'ឧបករណ៍វិភាគប្រសិទ្ធភាពបំប្លែងតួអក្សរទៅជាព្យាង្គ'
              )}
            </span>
          </div>
          <h3 className={`text-lg sm:text-xl font-bold text-white ${isKm ? 'font-khmer' : ''}`}>
            {tr(
              'Character-to-Syllable Mapping Efficiency Across Sample Texts',
              'របាយប្រសិទ្ធភាពផ្គូផ្គងតួអក្សរទៅជាព្យាង្គសម្រាប់អត្ថបទគំរូខ្មែរផ្សេងៗ'
            )}
          </h3>
          <p className={`text-xs text-slate-400 max-w-3xl ${isKm ? 'font-khmer' : ''}`}>
            {tr(
              'Measures how many Unicode code points collapse into each phonological syllable cluster across literary, legal, scientific, and noisy web texts. Click any row below to inspect it in the editor.',
              'វាស់ស្ទង់ចំនួនតួអក្សរយូនីកូដដែលរួមបញ្ចូលគ្នាទៅក្នុងចង្កោមព្យាង្គតែមួយ ឆ្លងកាត់អត្ថបទអក្សរសិល្ប៍ ច្បាប់ វិទ្យាសាស្ត្រ និងសារគេហទំព័រ។ ចុចលើជួរណាមួយខាងក្រោមដើម្បីសាកល្បង។'
            )}
          </p>
        </div>

        {/* Chart View Switcher */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950 border border-slate-800 shrink-0 self-start lg:self-auto">
          <button
            type="button"
            onClick={() => setChartTab('efficiency')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors whitespace-nowrap shrink-0 ${
              isKm ? 'font-khmer' : 'font-mono'
            } ${
              chartTab === 'efficiency'
                ? 'bg-amber-400 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>{tr('Efficiency & Ratio', 'ប្រសិទ្ធភាព និងសមាមាត្រ')}</span>
          </button>

          <button
            type="button"
            onClick={() => setChartTab('distribution')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors whitespace-nowrap shrink-0 ${
              isKm ? 'font-khmer' : 'font-mono'
            } ${
              chartTab === 'distribution'
                ? 'bg-amber-400 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{tr('Cluster Complexity %', 'របាយភាពស្មុគស្មាញព្យាង្គ %')}</span>
          </button>
        </div>
      </div>

      {/* Top KPI Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60 space-y-1">
          <div className={`text-[11px] text-slate-400 ${isKm ? 'font-khmer' : 'font-mono'}`}>
            {tr('Peak Mapping Efficiency', 'ប្រសិទ្ធភាពខ្ពស់បំផុត')}
          </div>
          <div className="text-lg font-bold text-emerald-400 font-mono tabular-nums">
            {summary.highestEfficiency?.mappingEfficiencyPct ?? 0}%{' '}
            <span className={`text-xs font-normal text-slate-300 ${isKm ? 'font-khmer' : ''}`}>
              · {summary.highestEfficiency?.shortLabel}
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60 space-y-1">
          <div className={`text-[11px] text-slate-400 ${isKm ? 'font-khmer' : 'font-mono'}`}>
            {tr('Highest Char/Syllable Density', 'ដង់ស៊ីតេតួអក្សរ/ព្យាង្គខ្ពស់បំផុត')}
          </div>
          <div className="text-lg font-bold text-amber-400 font-mono tabular-nums">
            {summary.highestDensity?.charsPerSyllable ?? 0} {tr('ch/syl', 'តួ/ព្យាង្គ')}{' '}
            <span className={`text-xs font-normal text-slate-300 ${isKm ? 'font-khmer' : ''}`}>
              · {summary.highestDensity?.shortLabel}
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60 space-y-1">
          <div className={`text-[11px] text-slate-400 ${isKm ? 'font-khmer' : 'font-mono'}`}>
            {tr('Mean Khmer Packing Ratio', 'មធ្យមភាគតួអក្សរក្នុង ១ ព្យាង្គ')}
          </div>
          <div className="text-lg font-bold text-cyan-400 font-mono tabular-nums">
            {summary.avgCharsPerSyl} {tr('chars / syllable', 'តួអក្សរ / ព្យាង្គ')}
          </div>
        </div>
      </div>

      {/* Recharts Visualization Canvas */}
      <div className="w-full h-[350px] rounded-xl border border-slate-800 bg-slate-950/70 p-3 sm:p-4">
        <ResponsiveContainer width="100%" height="100%">
          {chartTab === 'efficiency' ? (
            <ComposedChart
              data={sampleRows}
              margin={{ top: 16, right: 20, left: 4, bottom: 12 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis
                dataKey="shortLabel"
                stroke="#64748b"
                tick={{ fill: '#cbd5e1', fontSize: 11 }}
                interval={0}
              />
              <YAxis
                yAxisId="left"
                domain={[0, 100]}
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }}
                tickFormatter={(v) => `${v}%`}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                domain={[0, 5]}
                stroke="#fbbf24"
                tick={{ fill: '#fbbf24', fontSize: 11, fontFamily: 'monospace' }}
                tickFormatter={(v) => `${v}×`}
              />
              <Tooltip
                cursor={{ fill: 'rgba(148, 163, 184, 0.08)' }}
                content={({ active, payload }) => {
                  if (!active || !payload || payload.length === 0) return null;
                  const row = payload[0]?.payload as SampleEfficiencyRow | undefined;
                  if (!row) return null;

                  return (
                    <div className="max-w-xs p-3 rounded-xl bg-slate-950 border border-slate-700 shadow-xl space-y-1.5 text-xs">
                      <div className={`font-bold text-white ${isKm ? 'font-khmer' : ''}`}>
                        {row.title}
                      </div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 pt-1 font-mono text-[11px] tabular-nums">
                        <span className="text-emerald-400">
                          {tr('Mapping Eff:', 'ប្រសិទ្ធភាព៖')} {row.mappingEfficiencyPct}%
                        </span>
                        <span className="text-amber-300">
                          {tr('Chars/Syl:', 'តួ/ព្យាង្គ៖')} {row.charsPerSyllable}×
                        </span>
                        <span className="text-cyan-300">
                          {tr('Coeng Clusters:', 'ជើងព្យញ្ជនៈ៖')} {row.coengDensityPct}%
                        </span>
                        <span className="text-slate-300">
                          {row.totalChars} ch → {row.syllableCount} syl
                        </span>
                      </div>
                      <div className="text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-800 tabular-nums">
                        LLaMA-3: {row.llamaTokenCount} tok vs Khmer SPM: {row.khmerTokenCount} tok
                      </div>
                    </div>
                  );
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
              />
              <Bar
                yAxisId="left"
                dataKey="mappingEfficiencyPct"
                name={tr('Mapping Efficiency (%)', 'ប្រសិទ្ធភាពបំប្លែង (%)')}
                fill="#34d399"
                radius={[4, 4, 0, 0]}
                barSize={26}
              />
              <Bar
                yAxisId="left"
                dataKey="coengDensityPct"
                name={tr('Subscript Coeng Density (%)', 'ដង់ស៊ីតេជើងព្យញ្ជនៈ (%)')}
                fill="#22d3ee"
                radius={[4, 4, 0, 0]}
                barSize={26}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="charsPerSyllable"
                name={tr('Chars per Syllable (×)', 'តួអក្សរក្នុង ១ ព្យាង្គ (×)')}
                stroke="#fbbf24"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#fbbf24', stroke: '#0f172a', strokeWidth: 1.5 }}
                activeDot={{ r: 6 }}
              />
            </ComposedChart>
          ) : (
            <BarChart
              data={sampleRows}
              margin={{ top: 16, right: 20, left: 4, bottom: 12 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis
                dataKey="shortLabel"
                stroke="#64748b"
                tick={{ fill: '#cbd5e1', fontSize: 11 }}
                interval={0}
              />
              <YAxis
                domain={[0, 100]}
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip
                cursor={{ fill: 'rgba(148, 163, 184, 0.08)' }}
                content={({ active, payload }) => {
                  if (!active || !payload || payload.length === 0) return null;
                  const row = payload[0]?.payload as SampleEfficiencyRow | undefined;
                  if (!row) return null;

                  return (
                    <div className="max-w-xs p-3 rounded-xl bg-slate-950 border border-slate-700 shadow-xl space-y-1.5 text-xs">
                      <div className={`font-bold text-white ${isKm ? 'font-khmer' : ''}`}>
                        {row.title}
                      </div>
                      <div className="space-y-0.5 font-mono text-[11px] tabular-nums">
                        <div className="text-slate-300">
                          {tr('1-char Atomic / Non-Cluster:', '១ តួអក្សរ / បំណែក៖')} {row.pct1Char}%
                        </div>
                        <div className="text-cyan-300">
                          {tr('2-char Simple CV:', '២ តួអក្សរ (ព្យាង្គធម្មតា)៖')} {row.pct2Char}%
                        </div>
                        <div className="text-emerald-300">
                          {tr('3-4 char Coeng Cluster:', '៣-៤ តួអក្សរ (មានជើង)៖')} {row.pct3To4Char}%
                        </div>
                        <div className="text-amber-300">
                          {tr('5+ char Multi-Stack Ligature:', '៥+ តួអក្សរ (បាលី/ជើងត្រួត)៖')} {row.pct5PlusChar}%
                        </div>
                      </div>
                    </div>
                  );
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              <Bar
                dataKey="pct1Char"
                stackId="dist"
                name={tr('1ch Atomic/Noise (%)', '១តួ/សញ្ញា (%)')}
                fill="#f43f5e"
                barSize={36}
              />
              <Bar
                dataKey="pct2Char"
                stackId="dist"
                name={tr('2ch Simple CV (%)', '២តួ CV (%)')}
                fill="#22d3ee"
                barSize={36}
              />
              <Bar
                dataKey="pct3To4Char"
                stackId="dist"
                name={tr('3-4ch Coeng Cluster (%)', '៣-៤តួ មានជើង (%)')}
                fill="#34d399"
                barSize={36}
              />
              <Bar
                dataKey="pct5PlusChar"
                stackId="dist"
                name={tr('5+ch Multi-Stack (%)', '៥+តួ ត្រួតជើង (%)')}
                fill="#fbbf24"
                radius={[4, 4, 0, 0]}
                barSize={36}
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Interactive Sample Breakdown Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-950/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950 text-slate-400">
                <th className={`py-2.5 px-4 font-semibold ${isKm ? 'font-khmer' : 'font-mono'}`}>
                  {tr('Sample Text Domain', 'ប្រភេទអត្ថបទគំរូ')}
                </th>
                <th className={`py-2.5 px-3 font-semibold text-right ${isKm ? 'font-khmer' : 'font-mono'}`}>
                  {tr('Chars', 'តួអក្សរ')}
                </th>
                <th className={`py-2.5 px-3 font-semibold text-right ${isKm ? 'font-khmer' : 'font-mono'}`}>
                  {tr('Syllables', 'ព្យាង្គ')}
                </th>
                <th className={`py-2.5 px-3 font-semibold text-right ${isKm ? 'font-khmer' : 'font-mono'}`}>
                  {tr('Chars / Syl', 'តួ/ព្យាង្គ')}
                </th>
                <th className={`py-2.5 px-3 font-semibold text-right ${isKm ? 'font-khmer' : 'font-mono'}`}>
                  {tr('Coeng %', 'ជើង %')}
                </th>
                <th className={`py-2.5 px-3 font-semibold text-right ${isKm ? 'font-khmer' : 'font-mono'}`}>
                  {tr('Efficiency', 'ប្រសិទ្ធភាព')}
                </th>
                <th className={`py-2.5 px-4 font-semibold text-right ${isKm ? 'font-khmer' : 'font-mono'}`}>
                  {tr('Inspect', 'ត្រួតពិនិត្យ')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {sampleRows.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => onSelectSampleText(row.text)}
                  className={`cursor-pointer transition-colors ${
                    row.isActiveInput
                      ? 'bg-amber-400/10 hover:bg-amber-400/15'
                      : 'hover:bg-slate-900/70'
                  }`}
                >
                  <td className="py-2.5 px-4">
                    <div className="flex items-center gap-2">
                      {row.isActiveInput && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      )}
                      <span className={`font-medium text-white ${isKm ? 'font-khmer' : ''}`}>
                        {row.title}
                      </span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-300 tabular-nums">
                    {row.totalChars}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-300 tabular-nums">
                    {row.syllableCount}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-amber-300 font-semibold tabular-nums">
                    {row.charsPerSyllable}×
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-cyan-300 tabular-nums">
                    {row.coengDensityPct}%
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-emerald-400 font-semibold tabular-nums">
                    {row.mappingEfficiencyPct}%
                  </td>
                  <td className="py-2.5 px-4 text-right">
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-mono ${
                        row.isActiveInput ? 'text-amber-400 font-bold' : 'text-slate-400'
                      }`}
                    >
                      <span>{row.isActiveInput ? tr('Active', 'កំពុងប្រើ') : tr('Load', 'ផ្ទុក')}</span>
                      {!row.isActiveInput && <ArrowUpRight className="w-3 h-3" />}
                    </span>
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
