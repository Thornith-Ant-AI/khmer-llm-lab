import React, { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import {
  DocumentQualityReport,
  analyzeOrthography,
  segmentKhmerSyllables
} from '../utils/khmerLinguistics';
import { useLanguage } from '../contexts/LanguageContext';
import {
  BarChart3,
  Radar as RadarIcon,
  Columns,
  RotateCcw,
  FileText,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface CorpusDistributionComparisonProps {
  rawText: string;
  report: DocumentQualityReport;
  onResetFilters: () => void;
  onLoadBalancedSample: () => void;
}

type GoldPresetId = 'balanced_pretrain' | 'classical_literary' | 'technical_policy';

interface GoldStandardPreset {
  id: GoldPresetId;
  name: string;
  nameKm: string;
  subtitle: string;
  subtitleKm: string;
  languageShares: {
    khmer: number;
    latin: number;
    numerals: number;
    punctuation: number;
    other: number;
  };
  diversityTargets: {
    lexicalVariety: number;
    coengComplexity: number;
    clauseRhythm: number;
    registerBreadth: number;
    scriptIntegrity: number;
  };
}

const GOLD_STANDARD_PRESETS: Record<GoldPresetId, GoldStandardPreset> = {
  balanced_pretrain: {
    id: 'balanced_pretrain',
    name: 'Khmer Foundation Mix (Tier 1+2)',
    nameKm: 'ល្បាយមូលដ្ឋានខ្មែរ (កម្រិត 1+2)',
    subtitle: 'Balanced web news, encyclopedias, and civic prose for general LLM pretraining.',
    subtitleKm: 'តុល្យភាពរវាងព័ត៌មានវេប សព្វវចនាធិប្បាយ និងអត្ថបទរដ្ឋបាលសម្រាប់បង្វឹក LLM ទូទៅ។',
    languageShares: {
      khmer: 86.0,
      latin: 6.5,
      numerals: 3.5,
      punctuation: 3.5,
      other: 0.5
    },
    diversityTargets: {
      lexicalVariety: 86,
      coengComplexity: 84,
      clauseRhythm: 82,
      registerBreadth: 88,
      scriptIntegrity: 98
    }
  },
  classical_literary: {
    id: 'classical_literary',
    name: 'Buddhist Institute & Literature',
    nameKm: 'ពុទ្ធសាសនបណ្ឌិត្យ និងអក្សរសិល្ប៍',
    subtitle: 'Pure literary Khmer & Pali-Sanskrit orthography with near-zero Latin contamination.',
    subtitleKm: 'អក្សរសិល្ប៍ខ្មែរសុទ្ធ និងបាលី-សំស្ក្រឹត ដែលស្ទើរតែគ្មានអក្សរឡាតាំងលាយឡំ។',
    languageShares: {
      khmer: 92.5,
      latin: 0.5,
      numerals: 2.0,
      punctuation: 4.8,
      other: 0.2
    },
    diversityTargets: {
      lexicalVariety: 91,
      coengComplexity: 92,
      clauseRhythm: 86,
      registerBreadth: 90,
      scriptIntegrity: 99
    }
  },
  technical_policy: {
    id: 'technical_policy',
    name: 'Digital Policy & STEM Corpus',
    nameKm: 'គោលនយោបាយឌីជីថល និងវិទ្យាសាស្ត្រ',
    subtitle: 'Allows higher technical Latin acronyms, PDF/API terms, and quantitative numerals.',
    subtitleKm: 'អនុញ្ញាតឱ្យមានពាក្យបច្ចេកទេសអង់គ្លេស និងតួលេខស្ថិតិច្រើនជាងអត្ថបទទូទៅ។',
    languageShares: {
      khmer: 78.5,
      latin: 12.0,
      numerals: 5.5,
      punctuation: 3.5,
      other: 0.5
    },
    diversityTargets: {
      lexicalVariety: 83,
      coengComplexity: 85,
      clauseRhythm: 80,
      registerBreadth: 86,
      scriptIntegrity: 97
    }
  }
};

interface ScriptShares {
  khmer: number;
  latin: number;
  numerals: number;
  punctuation: number;
  other: number;
  totalNonSpaceChars: number;
}

function computeScriptDistribution(text: string): ScriptShares {
  const clean = text.replace(/\s+/g, '');
  const total = clean.length;
  if (total === 0) {
    return {
      khmer: 0,
      latin: 0,
      numerals: 0,
      punctuation: 0,
      other: 0,
      totalNonSpaceChars: 0
    };
  }

  let khmer = 0;
  let latin = 0;
  let numerals = 0;
  let punctuation = 0;
  let other = 0;

  for (let i = 0; i < total; i++) {
    const ch = clean[i];
    const code = ch.charCodeAt(0);

    if ((code >= 0x1780 && code <= 0x17d3) || code === 0x17dc || code === 0x17dd) {
      khmer++;
    } else if ((code >= 0x17e0 && code <= 0x17e9) || (code >= 0x0030 && code <= 0x0039)) {
      numerals++;
    } else if ((code >= 0x0041 && code <= 0x005a) || (code >= 0x0061 && code <= 0x007a)) {
      latin++;
    } else if (
      (code >= 0x17d4 && code <= 0x17db) ||
      '.,;:!?()[]{}"\'«»—–-/\\'.includes(ch)
    ) {
      punctuation++;
    } else {
      other++;
    }
  }

  const pct = (count: number) => Number(((count / total) * 100).toFixed(1));
  return {
    khmer: pct(khmer),
    latin: pct(latin),
    numerals: pct(numerals),
    punctuation: pct(punctuation),
    other: pct(other),
    totalNonSpaceChars: total
  };
}

const FORMAL_KHMER_MARKERS = [
  'និង',
  'ដើម្បី',
  'នៃ',
  'ក្នុង',
  'ដោយ',
  'សម្រាប់',
  'ដែល',
  'លើ',
  'តាមរយៈ',
  'ទាំងនេះ',
  'ព្រមទាំង',
  'រមែង'
];

interface DiversityScores {
  lexicalVariety: number;
  coengComplexity: number;
  clauseRhythm: number;
  registerBreadth: number;
  scriptIntegrity: number;
  uniqueSyllableCount: number;
  totalSyllableCount: number;
  coengClusterRatioPct: number;
}

function computeDiversityProfile(cleanedText: string): DiversityScores {
  if (!cleanedText.trim()) {
    return {
      lexicalVariety: 0,
      coengComplexity: 0,
      clauseRhythm: 0,
      registerBreadth: 0,
      scriptIntegrity: 0,
      uniqueSyllableCount: 0,
      totalSyllableCount: 0,
      coengClusterRatioPct: 0
    };
  }

  const clusters = segmentKhmerSyllables(cleanedText).filter((c) => /[\u1780-\u17D3]/.test(c));
  const totalClusters = Math.max(1, clusters.length);
  const uniqueClusters = new Set(clusters);

  // 1. Lexical Variety (size-normalized Guiraud root TTR scaled to 0-100)
  const rootTtr = uniqueClusters.size / Math.sqrt(totalClusters);
  const lexicalVariety = Math.min(99, Math.max(18, Math.round((rootTtr / 9.2) * 100)));

  // 2. Coeng & Orthographic Complexity (target ~18-26% Coeng clusters -> 82-95)
  const coengClusters = clusters.filter((c) => c.includes('\u17D2')).length;
  const coengRatioPct = (coengClusters / totalClusters) * 100;
  const coengComplexity = Math.min(98, Math.max(25, Math.round((coengRatioPct / 24) * 88)));

  // 3. Clause & Sentence Rhythm (based on sentence segmentation via Khan ។ / newline / ៖)
  const clauses = cleanedText
    .split(/[។៕\n]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  const meanClauseLen =
    clauses.reduce((acc, c) => acc + c.length, 0) / Math.max(1, clauses.length);
  const clauseScoreBase =
    meanClauseLen >= 45 && meanClauseLen <= 165
      ? 86
      : Math.max(40, Math.round(86 - Math.abs(meanClauseLen - 95) * 0.35));
  const clauseCountBonus = Math.min(10, clauses.length * 2);
  const clauseRhythm = Math.min(96, Math.max(30, clauseScoreBase + clauseCountBonus - 4));

  // 4. Register & Grammatical Breadth (formal connectors + Khmer numerals/punctuation)
  const markerHits = FORMAL_KHMER_MARKERS.filter((m) => cleanedText.includes(m)).length;
  const hasKhmerPunct = /[\u17D4-\u17DA]/.test(cleanedText);
  const registerBreadth = Math.min(
    96,
    Math.max(28, 36 + markerHits * 8 + (hasKhmerPunct ? 10 : 0))
  );

  // 5. Script Integrity (orthography check + low residual foreign chars)
  const orth = analyzeOrthography(cleanedText, 'en');
  const scriptDist = computeScriptDistribution(cleanedText);
  const penalty = (orth.isValid ? 0 : orth.issues.length * 8) + scriptDist.other * 2.5;
  const scriptIntegrity = Math.min(100, Math.max(20, Math.round(100 - penalty)));

  return {
    lexicalVariety,
    coengComplexity,
    clauseRhythm,
    registerBreadth,
    scriptIntegrity,
    uniqueSyllableCount: uniqueClusters.size,
    totalSyllableCount: totalClusters,
    coengClusterRatioPct: Number(coengRatioPct.toFixed(1))
  };
}

export const CorpusDistributionComparison: React.FC<CorpusDistributionComparisonProps> = ({
  rawText,
  report,
  onResetFilters,
  onLoadBalancedSample
}) => {
  const { isKm, tr } = useLanguage();
  const [goldPresetId, setGoldPresetId] = useState<GoldPresetId>('balanced_pretrain');
  const [chartLayout, setChartLayout] = useState<'split' | 'language' | 'diversity'>('split');
  const [showRawOverlay, setShowRawOverlay] = useState<boolean>(true);

  const activeGold = GOLD_STANDARD_PRESETS[goldPresetId];
  const hasCleanedContent = report.cleanedText.trim().length > 0;

  const rawDistribution = useMemo(() => computeScriptDistribution(rawText), [rawText]);
  const cleanedDistribution = useMemo(
    () => computeScriptDistribution(report.cleanedText),
    [report.cleanedText]
  );
  const cleanedDiversity = useMemo(
    () => computeDiversityProfile(report.cleanedText),
    [report.cleanedText]
  );

  const languageChartData = useMemo(() => {
    const rows = [
      {
        key: 'khmer',
        label: tr('Khmer Script', 'អក្សរខ្មែរសុទ្ធ'),
        raw: rawDistribution.khmer,
        cleaned: cleanedDistribution.khmer,
        gold: activeGold.languageShares.khmer
      },
      {
        key: 'latin',
        label: tr('Latin / Tech', 'ឡាតាំង / បច្ចេកទេស'),
        raw: rawDistribution.latin,
        cleaned: cleanedDistribution.latin,
        gold: activeGold.languageShares.latin
      },
      {
        key: 'numerals',
        label: tr('Numerals', 'តួលេខ'),
        raw: rawDistribution.numerals,
        cleaned: cleanedDistribution.numerals,
        gold: activeGold.languageShares.numerals
      },
      {
        key: 'punctuation',
        label: tr('Punctuation', 'វណ្ណយុត្តិ'),
        raw: rawDistribution.punctuation,
        cleaned: cleanedDistribution.punctuation,
        gold: activeGold.languageShares.punctuation
      },
      {
        key: 'other',
        label: tr('Other / Residual', 'ផ្សេងៗ / សំណល់'),
        raw: rawDistribution.other,
        cleaned: cleanedDistribution.other,
        gold: activeGold.languageShares.other
      }
    ];
    return rows;
  }, [rawDistribution, cleanedDistribution, activeGold, tr]);

  const diversityChartData = useMemo(() => {
    return [
      {
        metric: tr('Lexical Variety', 'ភាពសម្បូរពាក្យ'),
        cleaned: cleanedDiversity.lexicalVariety,
        gold: activeGold.diversityTargets.lexicalVariety,
        fullMark: 100
      },
      {
        metric: tr('Coeng Richness', 'កម្រិតជើងព្យញ្ជនៈ'),
        cleaned: cleanedDiversity.coengComplexity,
        gold: activeGold.diversityTargets.coengComplexity,
        fullMark: 100
      },
      {
        metric: tr('Clause Rhythm', 'រចនាសម្ព័ន្ធល្បះ'),
        cleaned: cleanedDiversity.clauseRhythm,
        gold: activeGold.diversityTargets.clauseRhythm,
        fullMark: 100
      },
      {
        metric: tr('Register Breadth', 'ភាពចម្រុះវេយ្យាករណ៍'),
        cleaned: cleanedDiversity.registerBreadth,
        gold: activeGold.diversityTargets.registerBreadth,
        fullMark: 100
      },
      {
        metric: tr('Script Integrity', 'ភាពសុទ្ធយូនីកូដ'),
        cleaned: cleanedDiversity.scriptIntegrity,
        gold: activeGold.diversityTargets.scriptIntegrity,
        fullMark: 100
      }
    ];
  }, [cleanedDiversity, activeGold, tr]);

  // Alignment L1 & Cosine metrics vs Gold Standard
  const alignmentSummary = useMemo(() => {
    if (!hasCleanedContent) {
      return {
        languageAlignmentPct: 0,
        diversityAlignmentPct: 0,
        largestLanguageGapLabel: '',
        largestLanguageGapPP: 0
      };
    }

    const totalL1Diff = languageChartData.reduce(
      (sum, item) => sum + Math.abs(item.cleaned - item.gold),
      0
    );
    // Max possible L1 between two probability distributions = 200
    const languageAlignmentPct = Math.max(0, Math.round(100 - totalL1Diff / 2));

    const avgDivGap =
      diversityChartData.reduce((sum, d) => sum + Math.abs(d.cleaned - d.gold), 0) /
      diversityChartData.length;
    const diversityAlignmentPct = Math.max(0, Math.round(100 - avgDivGap));

    const sortedByGap = [...languageChartData].sort(
      (a, b) => Math.abs(b.cleaned - b.gold) - Math.abs(a.cleaned - a.gold)
    );
    const topGap = sortedByGap[0];

    return {
      languageAlignmentPct,
      diversityAlignmentPct,
      largestLanguageGapLabel: topGap.label,
      largestLanguageGapPP: Number((topGap.cleaned - topGap.gold).toFixed(1))
    };
  }, [hasCleanedContent, languageChartData, diversityChartData]);

  return (
    <section
      aria-label={tr(
        'Post-Cleaning Corpus Diversity & Gold Standard Distribution Comparison',
        'ការប្រៀបធៀបភាពចម្រុះ និងរបាយភាសានៃឃ្លាំងទិន្នន័យក្រោយសម្អាតធៀបនឹងស្តង់ដារមាស'
      )}
      className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-6"
    >
      {/* Header & Controls Row */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2 text-xs text-amber-400 font-mono">
            <span>{tr('POST-CLEANING BENCHMARK', 'ការវាស់ស្ទង់ក្រោយសម្អាត')}</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="text-slate-400">
              {isKm ? activeGold.nameKm : activeGold.name}
            </span>
          </div>
          <h3 className={`text-lg font-bold text-white ${isKm ? 'font-khmer' : ''}`}>
            {tr(
              'Cleaned Corpus Diversity & Language Distribution vs. Gold Standard',
              'ភាពចម្រុះ និងរបាយភាសាក្រោយសម្អាត ធៀបនឹងស្តង់ដារមាស'
            )}
          </h3>
          <p className={`text-xs text-slate-400 max-w-2xl leading-relaxed ${isKm ? 'font-khmer' : ''}`}>
            {isKm ? activeGold.subtitleKm : activeGold.subtitle}
          </p>
        </div>

        {/* View Layout Switcher */}
        <div className="flex flex-wrap items-center gap-1 p-1 rounded-xl bg-slate-950 border border-slate-800 self-start">
          <button
            type="button"
            onClick={() => setChartLayout('split')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-colors whitespace-nowrap shrink-0 ${
              chartLayout === 'split'
                ? 'bg-amber-400 text-slate-950 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>{tr('Dual View', 'ទិដ្ឋភាពទ្វេ')}</span>
          </button>
          <button
            type="button"
            onClick={() => setChartLayout('language')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-colors whitespace-nowrap shrink-0 ${
              chartLayout === 'language'
                ? 'bg-amber-400 text-slate-950 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>{tr('Language Mix', 'សមាមាត្រភាសា')}</span>
          </button>
          <button
            type="button"
            onClick={() => setChartLayout('diversity')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-colors whitespace-nowrap shrink-0 ${
              chartLayout === 'diversity'
                ? 'bg-amber-400 text-slate-950 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <RadarIcon className="w-3.5 h-3.5" />
            <span>{tr('Diversity Radar', 'រ៉ាដាភាពចម្រុះ')}</span>
          </button>
        </div>
      </div>

      {/* Gold Standard Reference Selector + Raw Baseline Toggle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-3 border-t border-slate-800/80">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-mono text-slate-400 mr-1">
            {tr('Gold Standard Reference:', 'ស្តង់ដារមាសយោង៖')}
          </span>
          {(Object.values(GOLD_STANDARD_PRESETS) as GoldStandardPreset[]).map((preset) => {
            const active = goldPresetId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => setGoldPresetId(preset.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors whitespace-nowrap shrink-0 ${
                  isKm ? 'font-khmer' : ''
                } ${
                  active
                    ? 'bg-slate-800 border-amber-400/70 text-amber-300'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                {isKm ? preset.nameKm : preset.name}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => setShowRawOverlay((prev) => !prev)}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition-colors whitespace-nowrap shrink-0 self-start md:self-auto ${
            showRawOverlay
              ? 'bg-slate-800 border-slate-600 text-slate-200'
              : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          {showRawOverlay
            ? tr('Raw Crawl Baseline: Visible', 'ទិន្នន័យឆៅ៖ បង្ហាញ')
            : tr('Raw Crawl Baseline: Hidden', 'ទិន្នន័យឆៅ៖ លាក់')}
        </button>
      </div>

      {/* Empty State when 100% of text is purged */}
      {!hasCleanedContent ? (
        <div className="py-12 px-6 rounded-xl border border-slate-800 bg-slate-950/70 text-center space-y-4">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-rose-950/70 border border-rose-800/60 text-rose-400 mx-auto">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="space-y-1.5 max-w-lg mx-auto">
            <h4 className={`text-sm font-bold text-white ${isKm ? 'font-khmer' : ''}`}>
              {tr(
                'All Lines Purged — No Post-Cleaning Corpus Remaining',
                'បន្ទាត់ទាំងអស់ត្រូវបានលុបចោល — គ្មានទិន្នន័យស្អាតនៅសល់ទេ'
              )}
            </h4>
            <p className={`text-xs text-slate-400 leading-relaxed ${isKm ? 'font-khmer' : ''}`}>
              {tr(
                '100% of the current sample failed the active hygiene filters (e.g., Limon ASCII encoding or betting spam). Load a mixed news crawl or relax your filter thresholds to plot its Gold Standard distribution comparison.',
                'ទិន្នន័យ ១០០% នៃគំរូនេះមិនឆ្លងផុតតម្រងសម្អាតបច្ចុប្បន្នទេ (ដូចជាពុម្ពអក្សរ Limon ឬសាររំខាន)។ សូមផ្ទុកគំរូព័ត៌មាន ឬបន្ធូរបន្ថយកម្រិតតម្រងដើម្បីបង្ហាញក្រាហ្វប្រៀបធៀប។'
              )}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
            <button
              type="button"
              onClick={onLoadBalancedSample}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-amber-400 text-slate-950 hover:bg-amber-300 transition-colors whitespace-nowrap shrink-0"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{tr('Load News Portal Sample', 'ផ្ទុកគំរូព័ត៌មានវេប')}</span>
            </button>
            <button
              type="button"
              onClick={onResetFilters}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors whitespace-nowrap shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{tr('Relax Hygiene Filters', 'បន្ធូរបន្ថយកម្រិតតម្រង')}</span>
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Alignment KPI Summary Strip (Single Elevation Hairline Grid) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 py-4 border-y border-slate-800/80">
            <div className="space-y-1">
              <div className="text-[11px] font-mono text-slate-400">
                {tr('SCRIPT MIX ALIGNMENT', 'ភាពស៊ីគ្នានៃសមាមាត្រភាសា')}
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
                  {alignmentSummary.languageAlignmentPct}%
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {tr('vs Gold', 'ធៀបស្តង់ដារមាស')}
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-[11px] font-mono text-slate-400">
                {tr('DIVERSITY ALIGNMENT', 'ភាពស៊ីគ្នានៃភាពចម្រុះ')}
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold font-mono text-amber-400 tabular-nums">
                  {alignmentSummary.diversityAlignmentPct}%
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {tr('5-axis fit', 'លើ ៥ វិមាត្រ')}
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-[11px] font-mono text-slate-400">
                {tr('UNIQUE CLUSTERS', 'ចង្កោមព្យាង្គប្លែកគ្នា')}
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold font-mono text-white tabular-nums">
                  {cleanedDiversity.uniqueSyllableCount}
                </span>
                <span className="text-[11px] text-slate-400 font-mono tabular-nums">
                  / {cleanedDiversity.totalSyllableCount} {tr('total', 'សរុប')}
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-[11px] font-mono text-slate-400">
                {tr('PRIMARY SCRIPT DELTA', 'គម្លាតអក្សរចម្បង')}
              </div>
              <div className="flex items-baseline gap-2">
                <span
                  className={`text-2xl font-bold font-mono tabular-nums ${
                    Math.abs(alignmentSummary.largestLanguageGapPP) <= 6
                      ? 'text-emerald-400'
                      : 'text-cyan-400'
                  }`}
                >
                  {alignmentSummary.largestLanguageGapPP > 0 ? '+' : ''}
                  {alignmentSummary.largestLanguageGapPP} pp
                </span>
                <span className="text-[11px] text-slate-400 truncate max-w-[130px]">
                  {alignmentSummary.largestLanguageGapLabel}
                </span>
              </div>
            </div>
          </div>

          {/* Primary Recharts Visualization Grid */}
          <div
            className={`grid gap-6 ${
              chartLayout === 'split' ? 'grid-cols-1 lg:grid-cols-12' : 'grid-cols-1'
            }`}
          >
            {/* Chart A: Language & Script Distribution Bar Chart */}
            {(chartLayout === 'split' || chartLayout === 'language') && (
              <div
                className={`${
                  chartLayout === 'split' ? 'lg:col-span-7' : ''
                } space-y-3`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h4 className={`text-sm font-semibold text-white ${isKm ? 'font-khmer' : ''}`}>
                      {tr(
                        'Language & Script Composition (%)',
                        'សមាសភាពភាសា និងអក្សរ (%)'
                      )}
                    </h4>
                    <p className={`text-[11px] text-slate-400 ${isKm ? 'font-khmer' : ''}`}>
                      {tr(
                        'Share of non-whitespace characters retained after noise purging compared with Gold Standard.',
                        'ភាគរយនៃតួអក្សរដែលរក្សាទុកក្រោយការសម្អាត ធៀបនឹងស្តង់ដារមាស។'
                      )}
                    </p>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 tabular-nums shrink-0">
                    {cleanedDistribution.totalNonSpaceChars.toLocaleString()} {tr('chars', 'តួ')}
                  </span>
                </div>

                <div className="h-[310px] w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={languageChartData}
                      margin={{ top: 10, right: 16, left: 0, bottom: 16 }}
                      barGap={4}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                      <XAxis
                        dataKey="label"
                        tick={{ fill: '#94a3b8', fontSize: 11 }}
                        axisLine={{ stroke: '#334155' }}
                        tickLine={false}
                      />
                      <YAxis
                        domain={[0, 100]}
                        unit="%"
                        tick={{ fill: '#94a3b8', fontSize: 11 }}
                        axisLine={{ stroke: '#334155' }}
                        tickLine={false}
                        width={42}
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
                        formatter={(value, name) => [`${value ?? 0}%`, String(name ?? '')]}
                      />
                      <Legend
                        wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                      />
                      {showRawOverlay && (
                        <Bar
                          dataKey="raw"
                          name={tr('Raw Input (%)', 'ទិន្នន័យឆៅ (%)')}
                          fill="#64748b"
                          radius={[4, 4, 0, 0]}
                          maxBarSize={26}
                        />
                      )}
                      <Bar
                        dataKey="cleaned"
                        name={tr('Cleaned Corpus (%)', 'ឃ្លាំងទិន្នន័យស្អាត (%)')}
                        fill="#10b981"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={26}
                      />
                      <Bar
                        dataKey="gold"
                        name={tr('Gold Standard (%)', 'ស្តង់ដារមាស (%)')}
                        fill="#fbbf24"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={26}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Chart B: Linguistic Diversity Radar Chart */}
            {(chartLayout === 'split' || chartLayout === 'diversity') && (
              <div
                className={`${
                  chartLayout === 'split'
                    ? 'lg:col-span-5 lg:border-l lg:border-slate-800/80 lg:pl-6'
                    : ''
                } space-y-3`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h4 className={`text-sm font-semibold text-white ${isKm ? 'font-khmer' : ''}`}>
                      {tr(
                        'Linguistic & Structural Diversity Profile',
                        'ទម្រង់ភាពចម្រុះភាសា និងរចនាសម្ព័ន្ធ'
                      )}
                    </h4>
                    <p className={`text-[11px] text-slate-400 ${isKm ? 'font-khmer' : ''}`}>
                      {tr(
                        '5-axis orthographic richness score (0–100) vs. Gold Standard.',
                        'ពិន្ទុភាពចម្រុះអក្ខរាវិរុទ្ធ ៥ វិមាត្រ (0–100) ធៀបនឹងស្តង់ដារមាស។'
                      )}
                    </p>
                  </div>
                  <span className="text-[11px] font-mono text-amber-400 tabular-nums shrink-0">
                    {cleanedDiversity.coengClusterRatioPct}% {tr('Coeng', 'ជើង')}
                  </span>
                </div>

                <div className="h-[310px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart
                      cx="50%"
                      cy="50%"
                      outerRadius={chartLayout === 'split' ? '68%' : '76%'}
                      data={diversityChartData}
                    >
                      <PolarGrid stroke="#334155" />
                      <PolarAngleAxis
                        dataKey="metric"
                        tick={{ fill: '#cbd5e1', fontSize: 11 }}
                      />
                      <PolarRadiusAxis
                        angle={90}
                        domain={[0, 100]}
                        tick={{ fill: '#64748b', fontSize: 10 }}
                        axisLine={false}
                      />
                      <Radar
                        name={tr('Gold Standard', 'ស្តង់ដារមាស')}
                        dataKey="gold"
                        stroke="#fbbf24"
                        strokeWidth={2}
                        strokeDasharray="4 4"
                        fill="#fbbf24"
                        fillOpacity={0.14}
                      />
                      <Radar
                        name={tr('Cleaned Corpus', 'ឃ្លាំងទិន្នន័យស្អាត')}
                        dataKey="cleaned"
                        stroke="#10b981"
                        strokeWidth={2}
                        fill="#10b981"
                        fillOpacity={0.28}
                      />
                      <Legend wrapperStyle={{ fontSize: '11px' }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#020617',
                          borderColor: '#334155',
                          borderRadius: '0.75rem',
                          fontSize: '12px',
                          color: '#f8fafc'
                        }}
                        formatter={(value, name) => [`${value ?? 0} / 100`, String(name ?? '')]}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>

          {/* Quantitative Variance Table & Actionable Diagnostic */}
          <div className="pt-4 border-t border-slate-800/80 space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-[11px] font-mono text-slate-400">
                    <th className="py-2 pr-4 font-medium">{tr('Script / Language Bucket', 'ប្រភេទអក្សរ / ភាសា')}</th>
                    {showRawOverlay && (
                      <th className="py-2 px-3 text-right font-medium">{tr('Raw Crawl', 'ទិន្នន័យឆៅ')}</th>
                    )}
                    <th className="py-2 px-3 text-right font-medium">{tr('Cleaned Corpus', 'ក្រោយសម្អាត')}</th>
                    <th className="py-2 px-3 text-right font-medium">{tr('Gold Standard', 'ស្តង់ដារមាស')}</th>
                    <th className="py-2 pl-3 text-right font-medium">{tr('Delta (Cleaned − Gold)', 'គម្លាត (ស្អាត − ស្តង់ដារ)')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs">
                  {languageChartData.map((row) => {
                    const delta = Number((row.cleaned - row.gold).toFixed(1));
                    const withinTolerance = Math.abs(delta) <= 5.0;
                    return (
                      <tr key={row.key} className="hover:bg-slate-900/60 transition-colors">
                        <td className={`py-2.5 pr-4 font-medium text-slate-200 ${isKm ? 'font-khmer' : ''}`}>
                          {row.label}
                        </td>
                        {showRawOverlay && (
                          <td className="py-2.5 px-3 text-right font-mono text-slate-400 tabular-nums">
                            {row.raw.toFixed(1)}%
                          </td>
                        )}
                        <td className="py-2.5 px-3 text-right font-mono text-emerald-400 font-semibold tabular-nums">
                          {row.cleaned.toFixed(1)}%
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-amber-400 tabular-nums">
                          {row.gold.toFixed(1)}%
                        </td>
                        <td
                          className={`py-2.5 pl-3 text-right font-mono tabular-nums ${
                            withinTolerance ? 'text-emerald-400' : 'text-cyan-300'
                          }`}
                        >
                          {delta > 0 ? `+${delta.toFixed(1)}` : delta.toFixed(1)} pp
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Concise Diagnostic Takeaway */}
            <div className="flex items-start gap-2.5 text-xs text-slate-300 pt-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <p className={`leading-relaxed ${isKm ? 'font-khmer' : ''}`}>
                {alignmentSummary.languageAlignmentPct >= 88
                  ? tr(
                      `Cleaned corpus achieves ${alignmentSummary.languageAlignmentPct}% script-mix alignment and ${alignmentSummary.diversityAlignmentPct}% diversity fit against "${activeGold.name}", suitable for Tier 1/2 pretraining ingestion.`,
                      `ឃ្លាំងទិន្នន័យក្រោយសម្អាតសម្រេចបានភាពស៊ីគ្នា ${alignmentSummary.languageAlignmentPct}% លើសមាមាត្រអក្សរ និង ${alignmentSummary.diversityAlignmentPct}% លើភាពចម្រុះធៀបនឹង "${activeGold.nameKm}" ដែលសមស្របសម្រាប់ការបង្វឹកកម្រិត 1/2។`
                    )
                  : tr(
                      `Cleaned corpus aligns ${alignmentSummary.languageAlignmentPct}% with "${activeGold.name}". Largest shift is in ${alignmentSummary.largestLanguageGapLabel} (${alignmentSummary.largestLanguageGapPP > 0 ? '+' : ''}${alignmentSummary.largestLanguageGapPP} pp); combine diverse Tier 1 literature or adjust Khmer purity thresholds to balance.`,
                      `ឃ្លាំងទិន្នន័យក្រោយសម្អាតស៊ីគ្នា ${alignmentSummary.languageAlignmentPct}% ជាមួយ "${activeGold.nameKm}"។ គម្លាតធំជាងគេគឺ ${alignmentSummary.largestLanguageGapLabel} (${alignmentSummary.largestLanguageGapPP > 0 ? '+' : ''}${alignmentSummary.largestLanguageGapPP} pp); គួរផ្សំជាមួយអត្ថបទអក្សរសិល្ប៍កម្រិត 1 ឬកែសម្រួលកម្រិតភាពសុទ្ធដើម្បីធ្វើឱ្យមានតុល្យភាព។`
                    )}
              </p>
            </div>
          </div>
        </>
      )}
    </section>
  );
};
