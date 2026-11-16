import React, { useMemo, useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Wand2,
  Copy,
  Check,
  ArrowRightLeft,
  RotateCcw,
  SlidersHorizontal
} from 'lucide-react';
import { validateKhmerScript } from '../utils/khmerScriptValidator';
import { detectLimonFont } from '../utils/khmerLinguistics';
import { useLanguage } from '../contexts/LanguageContext';

export type LatinNoiseTolerance = 'strict' | 'balanced' | 'bilingual';
export type RuleFilterView = 'all' | 'failed' | 'passed';

interface RuleCheckResult {
  id: string;
  category: 'encoding' | 'latin_noise' | 'delimiters' | 'zero_width' | 'cross_script';
  name: string;
  nameKm: string;
  passed: boolean;
  severity: 'critical' | 'warning' | 'pass';
  pointsDeducted: number;
  finding: string;
  findingKm: string;
  remediation: string;
  remediationKm: string;
}

interface DatasetValidationOutput {
  cleanlinessScore: number;
  verdict: 'clean' | 'needs_repair' | 'contaminated';
  rules: RuleCheckResult[];
  metrics: {
    totalChars: number;
    khmerChars: number;
    khmerRatioPct: number;
    latinRatioPct: number;
    delimiterCount: number;
    encodingErrorCount: number;
    zeroWidthNoiseCount: number;
  };
  sanitizedPreview: string;
}

const VALIDATOR_PRESETS: Array<{
  id: string;
  label: string;
  labelKm: string;
  text: string;
}> = [
  {
    id: 'clean_gold',
    label: 'Clean Khmer Prose',
    labelKm: 'អត្ថបទខ្មែរស្អាត',
    text: 'រាជរដ្ឋាភិបាលកម្ពុជាបានដាក់ចេញនូវគោលនយោបាយអភិវឌ្ឍន៍បច្ចេកវិទ្យាឌីជីថល។ ការអប់រំផ្នែកវិទ្យាសាស្ត្រទិន្នន័យគឺជាមូលដ្ឋានគ្រឹះសម្រាប់សេដ្ឋកិច្ចទំនើប៕'
  },
  {
    id: 'missing_delimiters',
    label: 'Missing Sentence Delimiters',
    labelKm: 'ខ្វះសញ្ញាខណ្ឌ (។)',
    text: 'ក្រុមការងារស្រាវជ្រាវបានប្រមូលអត្ថបទព័ត៌មានជាច្រើនពីគេហទំព័រសាធារណៈដោយមិនមានការបំបែកប្រយោគត្រឹមត្រូវ ហើយឯកសារទាំងនេះត្រូវបានបញ្ចូលបន្តគ្នាជាខ្សែអក្សរវែងអន្លាយគ្មានសញ្ញាខណ្ឌឬសញ្ញាចុចណាមួយដើម្បីកំណត់ព្រំដែនន័យឡើយ'
  },
  {
    id: 'latin_noise',
    label: 'Excessive Latin Noise',
    labelKm: 'អក្សរឡាតាំងលាយច្រើន',
    text: 'ទាញយកទិន្នន័យ click here https://spam-portal.example/promo?utm_source=fb&ref=12345 ដើម្បីទទួលបាន bonus account VIP login password reset notification ចុងក្រោយបង្អស់'
  },
  {
    id: 'improper_encoding',
    label: 'Improper Encoding & Limon',
    labelKm: 'កំហុសកូដ និង Limon',
    text: 'ការសិក្សា្  ាើ ស្តីពី \u200B\u200B បច្ចេកវិទ្យា GñkEdl rbs; mYy និងទិន្នន័យខូចទ្រង់ទ្រាយ\uFFFD។'
  }
];

function evaluateDatasetSnippet(
  rawText: string,
  tolerance: LatinNoiseTolerance,
  language: 'en' | 'km'
): DatasetValidationOutput {
  const text = rawText || '';
  if (!text.trim()) {
    return {
      cleanlinessScore: 0,
      verdict: 'contaminated',
      rules: [],
      metrics: {
        totalChars: 0,
        khmerChars: 0,
        khmerRatioPct: 0,
        latinRatioPct: 0,
        delimiterCount: 0,
        encodingErrorCount: 0,
        zeroWidthNoiseCount: 0
      },
      sanitizedPreview: ''
    };
  }

  const scriptReport = validateKhmerScript(text, language);
  const limonReport = detectLimonFont(text);
  const latinThresholdPct = tolerance === 'strict' ? 10 : tolerance === 'balanced' ? 20 : 35;

  // Compute encoding corruption signals
  const encodingIssues = scriptReport.issues.filter((i) => i.category === 'improper_encoding');
  const replacementMatches = text.match(/\uFFFD/g) || [];
  const totalEncodingErrors = encodingIssues.length + replacementMatches.length;

  // Zero-width anomalies
  const zeroWidthIssues = scriptReport.issues.filter((i) => i.category === 'zero_width_issue');
  const zeroWidthNoiseCount = zeroWidthIssues.length + Math.max(0, scriptReport.distribution.zeroWidthCount - 1);

  // Cross-script non-Khmer Southeast Asian intrusion (Thai / Lao)
  const crossScriptCount = scriptReport.distribution.thaiCharCount + scriptReport.distribution.laoCharCount;

  // Latin script noise ratio
  const latinRatioPct = scriptReport.distribution.latinPercent;
  const excessiveLatin = latinRatioPct > latinThresholdPct;

  // Missing Khmer sentence delimiters on substantial text (> 60 chars)
  const delimiterMatches = text.match(/[\u17D4\u17D5\u17D6.!?]/g) || [];
  const delimiterCount = delimiterMatches.length;
  const nonWsChars = text.replace(/\s+/g, '').length;
  const missingDelimiters = nonWsChars >= 60 && delimiterCount === 0;

  const rules: RuleCheckResult[] = [
    {
      id: 'rule-encoding',
      category: 'encoding',
      name: 'Unicode Khmer Coeng & Vowel Sequence Integrity',
      nameKm: 'ភាពត្រឹមត្រូវនៃលំដាប់កូដជើង (Coeng) និងស្រៈយូនីកូដ',
      passed: totalEncodingErrors === 0 && !limonReport.hasLimon,
      severity: totalEncodingErrors > 0 || limonReport.hasLimon ? 'critical' : 'pass',
      pointsDeducted: totalEncodingErrors > 0 || limonReport.hasLimon ? 30 : 0,
      finding:
        totalEncodingErrors > 0 || limonReport.hasLimon
          ? `Detected ${totalEncodingErrors} malformed Unicode sequences${limonReport.hasLimon ? ` + legacy Limon tokens (${limonReport.matchedWords.slice(0, 3).join(', ')})` : ''}.`
          : 'All Coeng subscripts, dependent vowels, and UTF-8 sequences conform to Unicode 16.0.',
      findingKm:
        totalEncodingErrors > 0 || limonReport.hasLimon
          ? `រកឃើញកំហុសលំដាប់យូនីកូដ ${totalEncodingErrors} កន្លែង${limonReport.hasLimon ? ` និងកូដ Limon ចាស់ (${limonReport.matchedWords.slice(0, 3).join(', ')})` : ''}។`
          : 'ជើងព្យញ្ជនៈ ស្រៈនិស្ស័យ និងលំដាប់ UTF-8 ទាំងអស់អនុលោមតាមស្ដង់ដារយូនីកូដ។',
      remediation: 'Normalize to Unicode NFC, strip U+FFFD replacement bytes, and drop or transcode Limon ASCII.',
      remediationKm: 'ធ្វើស្តង់ដារ Unicode NFC លុបតួអក្សរខូច U+FFFD និងបម្លែងឬលុបកូដ Limon ចាស់។'
    },
    {
      id: 'rule-latin-noise',
      category: 'latin_noise',
      name: `Latin-Script Noise Threshold (≤ ${latinThresholdPct}% max)`,
      nameKm: `ដែនកំណត់អក្សរឡាតាំងលាយឡំ (អតិបរមា ≤ ${latinThresholdPct}%)`,
      passed: !excessiveLatin,
      severity: latinRatioPct > latinThresholdPct + 15 ? 'critical' : excessiveLatin ? 'warning' : 'pass',
      pointsDeducted: !excessiveLatin ? 0 : latinRatioPct > latinThresholdPct + 15 ? 25 : 15,
      finding: excessiveLatin
        ? `Latin characters account for ${latinRatioPct}% (${scriptReport.distribution.latinCharCount} chars), exceeding the ${latinThresholdPct}% limit.`
        : `Latin character ratio is ${latinRatioPct}% (within the ${latinThresholdPct}% allowed threshold).`,
      findingKm: excessiveLatin
        ? `តួអក្សរឡាតាំងមានចំនួន ${latinRatioPct}% (${scriptReport.distribution.latinCharCount} តួអក្សរ) ដែលលើសកម្រិតអនុញ្ញាត ${latinThresholdPct}%។`
        : `សមាមាត្រតួអក្សរឡាតាំងគឺ ${latinRatioPct}% (ស្ថិតក្រោមកម្រិតអនុញ្ញាត ${latinThresholdPct}%)។`,
      remediation: 'Strip URLs, query parameters, UTM tags, and navigation boilerplate.',
      remediationKm: 'លុបតំណ URL ប៉ារ៉ាម៉ែត្រគេហទំព័រ និងអត្ថបទផ្សព្វផ្សាយភាសាអង់គ្លេស។'
    },
    {
      id: 'rule-delimiters',
      category: 'delimiters',
      name: 'Khmer Sentence Delimiter Presence (។ / ៕ / ៖)',
      nameKm: 'វត្តមានសញ្ញាខណ្ឌបញ្ចប់ប្រយោគខ្មែរ (។ / ៕ / ៖)',
      passed: !missingDelimiters,
      severity: missingDelimiters ? 'warning' : 'pass',
      pointsDeducted: missingDelimiters ? 20 : 0,
      finding: missingDelimiters
        ? `Run-on snippet (${nonWsChars} chars) has 0 sentence delimiters (។, ៕, ៖, ., ?, !).`
        : `Found ${delimiterCount} sentence delimiter${delimiterCount === 1 ? '' : 's'} anchoring clause boundaries.`,
      findingKm: missingDelimiters
        ? `អត្ថបទវែង (${nonWsChars} តួអក្សរ) គ្មានសញ្ញាខណ្ឌ (។, ៕, ៖, ., ?, !) ដើម្បីបំបែកប្រយោគឡើយ។`
        : `រកឃើញសញ្ញាខណ្ឌបញ្ចប់ប្រយោគចំនួន ${delimiterCount} ដែលជួយបែងចែកព្រំដែនប្រយោគ។`,
      remediation: 'Append Khan (។) at clause boundaries or filter unpunctuated crawler fragments.',
      remediationKm: 'បន្ថែមសញ្ញាខណ្ឌ (។) នៅចុងប្រយោគ ឬច្រោះចោលអត្ថបទដាច់ពាក់កណ្តាល។'
    },
    {
      id: 'rule-zero-width',
      category: 'zero_width',
      name: 'Zero-Width Character Hygiene (U+200B / ZWJ / ZWNJ)',
      nameKm: 'អនាម័យតួអក្សរឥតទទឹង (U+200B / ZWJ / ZWNJ)',
      passed: zeroWidthIssues.length === 0 && scriptReport.distribution.zeroWidthCount <= 2,
      severity: zeroWidthIssues.length > 0 ? 'warning' : 'pass',
      pointsDeducted: zeroWidthIssues.length > 0 ? 15 : scriptReport.distribution.zeroWidthCount > 2 ? 10 : 0,
      finding:
        zeroWidthIssues.length > 0 || scriptReport.distribution.zeroWidthCount > 2
          ? `Found ${scriptReport.distribution.zeroWidthCount} zero-width characters (${zeroWidthIssues.length} cluster-breaking placements).`
          : 'No cluster-breaking zero-width spaces or redundant BOM markers detected.',
      findingKm:
        zeroWidthIssues.length > 0 || scriptReport.distribution.zeroWidthCount > 2
          ? `រកឃើញតួអក្សរឥតទទឹងចំនួន ${scriptReport.distribution.zeroWidthCount} (${zeroWidthIssues.length} កន្លែងបំបែកព្យាង្គ)។`
          : 'មិនមានតួអក្សរដកឃ្លាឥតទទឹង (ZWSP) ដែលបំបែកចង្កោមព្យាង្គឡើយ។',
      remediation: 'Strip redundant U+200B/U+FEFF before BPE tokenization.',
      remediationKm: 'លុបតួអក្សរ U+200B និង U+FEFF ដែលមិនចាំបាច់ចេញមុនពេល Tokenization។'
    },
    {
      id: 'rule-cross-script',
      category: 'cross_script',
      name: 'Cross-Script Intrusion Guard (Thai / Lao)',
      nameKm: 'ការការពារការជ្រៀតជ្រែកអក្សរថៃ និងឡាវ',
      passed: crossScriptCount === 0,
      severity: crossScriptCount > 0 ? 'critical' : 'pass',
      pointsDeducted: crossScriptCount > 0 ? 15 : 0,
      finding:
        crossScriptCount > 0
          ? `Detected ${crossScriptCount} foreign Thai/Lao script characters contaminating Khmer text.`
          : 'Zero Thai or Lao Unicode script contamination detected.',
      findingKm:
        crossScriptCount > 0
          ? `រកឃើញតួអក្សរថៃ ឬឡាវចំនួន ${crossScriptCount} ជ្រៀតជ្រែកក្នុងអត្ថបទខ្មែរ។`
          : 'គ្មានការជ្រៀតជ្រែកតួអក្សរថៃ ឬឡាវក្នុងអត្ថបទខ្មែរឡើយ។',
      remediation: 'Drop sentences containing U+0E00–U+0EFF codepoints.',
      remediationKm: 'លុបប្រយោគដែលមានលេខកូដតួអក្សរ U+0E00–U+0EFF ចេញ។'
    }
  ];

  const totalDeduction = rules.reduce((acc, r) => acc + r.pointsDeducted, 0);
  const cleanlinessScore = Math.max(0, Math.min(100, 100 - totalDeduction));

  let verdict: DatasetValidationOutput['verdict'] = 'clean';
  if (cleanlinessScore < 55) {
    verdict = 'contaminated';
  } else if (cleanlinessScore < 85) {
    verdict = 'needs_repair';
  }

  // Generate rule-repaired sanitized preview
  let sanitized = scriptReport.repairedText
    .replace(/https?:\/\/\S+/gi, '')
    .replace(/\uFFFD/g, '')
    .replace(/[\u200B\uFEFF]/g, '')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();

  if (
    sanitized.length >= 40 &&
    !/[\u17D4\u17D5\u17D6.!?]$/.test(sanitized) &&
    /[\u1780-\u17FF]/.test(sanitized)
  ) {
    sanitized = `${sanitized}។`;
  }

  return {
    cleanlinessScore,
    verdict,
    rules,
    metrics: {
      totalChars: text.length,
      khmerChars: scriptReport.distribution.khmerCharCount,
      khmerRatioPct: scriptReport.distribution.khmerPercent,
      latinRatioPct,
      delimiterCount,
      encodingErrorCount: totalEncodingErrors,
      zeroWidthNoiseCount
    },
    sanitizedPreview: sanitized
  };
}

export interface DatasetValidatorProps {
  externalText?: string;
  onApplySanitized?: (sanitizedText: string) => void;
}

export const DatasetValidator: React.FC<DatasetValidatorProps> = ({
  externalText,
  onApplySanitized
}) => {
  const { language, isKm, tr } = useLanguage();
  const [snippet, setSnippet] = useState<string>(
    externalText && externalText.trim().length > 0 ? externalText : VALIDATOR_PRESETS[0].text
  );
  const [tolerance, setTolerance] = useState<LatinNoiseTolerance>('balanced');
  const [ruleFilter, setRuleFilter] = useState<RuleFilterView>('all');
  const [copiedClean, setCopiedClean] = useState<boolean>(false);

  const output = useMemo(
    () => evaluateDatasetSnippet(snippet, tolerance, language),
    [snippet, tolerance, language]
  );

  const visibleRules = useMemo(() => {
    return output.rules.filter((rule) => {
      if (ruleFilter === 'failed') return !rule.passed;
      if (ruleFilter === 'passed') return rule.passed;
      return true;
    });
  }, [output.rules, ruleFilter]);

  const failedCount = output.rules.filter((r) => !r.passed).length;
  const passedCount = output.rules.filter((r) => r.passed).length;

  const handleCopySanitized = async () => {
    if (!output.sanitizedPreview) return;
    try {
      await navigator.clipboard.writeText(output.sanitizedPreview);
      setCopiedClean(true);
      window.setTimeout(() => setCopiedClean(false), 2000);
    } catch {
      // Clipboard unavailable
    }
  };

  return (
    <section
      id="dataset-validator"
      aria-labelledby="dataset-validator-heading"
      className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <div
            className={`flex flex-wrap items-center gap-2 text-xs font-semibold text-amber-400 ${
              isKm ? 'font-khmer' : 'font-mono uppercase tracking-wider'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
            <span>{tr('RULE-BASED CORPUS VALIDATOR', 'កម្មវិធីផ្ទៀងផ្ទាត់ទិន្នន័យតាមក្បួនច្បាប់')}</span>
            <span aria-hidden="true" className="text-slate-600">
              ·
            </span>
            <span className="text-slate-300 font-mono">
              5 {tr('ACTIVE RULES', 'ក្បួនត្រួតពិនិត្យ')}
            </span>
          </div>
          <h3
            id="dataset-validator-heading"
            className={`text-xl font-bold text-white tracking-tight ${isKm ? 'font-khmer' : ''}`}
          >
            {tr(
              'Dataset Validator & Cleanliness Score Scanner',
              'កម្មវិធីផ្ទៀងផ្ទាត់សំណុំទិន្នន័យ និងពិន្ទុភាពស្អាត'
            )}
          </h3>
          <p className={`text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed ${isKm ? 'font-khmer' : ''}`}>
            {tr(
              'Scan raw Khmer text snippets against deterministic Unicode encoding, Latin-script noise, sentence delimiter, and zero-width hygiene rules to compute an auditable Cleanliness Score.',
              'ស្កេនកង់អត្ថបទខ្មែរឆៅតាមក្បួនច្បាប់យូនីកូដ ការលាយអក្សរឡាតាំង សញ្ញាខណ្ឌបញ្ចប់ប្រយោគ និងតួអក្សរឥតទទឹង ដើម្បីគណនាពិន្ទុភាពស្អាត (Cleanliness Score)។'
            )}
          </p>
        </div>

        {/* Optional Sync & Tolerance Selector */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {externalText !== undefined && externalText !== snippet && (
            <button
              type="button"
              onClick={() => setSnippet(externalText)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border border-cyan-500/40 bg-cyan-500/15 text-cyan-300 hover:bg-cyan-500/25 transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                isKm ? 'font-khmer' : 'font-mono'
              }`}
            >
              <ArrowRightLeft className="w-3.5 h-3.5 shrink-0" />
              <span>{tr('Load Pipeline Text', 'ទាញអត្ថបទពី Pipeline')}</span>
            </button>
          )}

          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              aria-label={tr('Latin noise tolerance preset', 'កម្រិតអនុញ្ញាតអក្សរឡាតាំង')}
              value={tolerance}
              onChange={(e) => setTolerance(e.target.value as LatinNoiseTolerance)}
              className={`bg-transparent text-slate-200 focus:outline-none cursor-pointer ${
                isKm ? 'font-khmer' : 'font-mono'
              }`}
            >
              <option value="strict" className="bg-slate-950">
                {tr('Latin Limit: Strict (10%)', 'ឡាតាំង៖ តឹងរ៉ឹង (10%)')}
              </option>
              <option value="balanced" className="bg-slate-950">
                {tr('Latin Limit: Balanced (20%)', 'ឡាតាំង៖ តុល្យភាព (20%)')}
              </option>
              <option value="bilingual" className="bg-slate-950">
                {tr('Latin Limit: Bilingual (35%)', 'ឡាតាំង៖ ទ្វេភាសា (35%)')}
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* Input & Live Cleanliness Score Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left: Snippet Input */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              {VALIDATOR_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setSnippet(preset.text)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] border transition-colors whitespace-nowrap shrink-0 ${
                    isKm ? 'font-khmer' : 'font-mono'
                  } ${
                    snippet === preset.text
                      ? 'bg-amber-400 text-slate-950 border-amber-400 font-bold'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  {isKm ? preset.labelKm : preset.label}
                </button>
              ))}
            </div>

            {snippet && (
              <button
                type="button"
                onClick={() => setSnippet('')}
                className={`px-2 py-1 rounded-md text-[11px] text-slate-400 hover:text-white flex items-center gap-1 whitespace-nowrap shrink-0 ${
                  isKm ? 'font-khmer' : 'font-mono'
                }`}
              >
                <RotateCcw className="w-3 h-3 shrink-0" />
                <span>{tr('Clear', 'សម្អាត')}</span>
              </button>
            )}
          </div>

          <textarea
            rows={5}
            value={snippet}
            onChange={(e) => setSnippet(e.target.value)}
            aria-label={tr('Khmer text snippet to validate', 'អត្ថបទខ្មែរសម្រាប់ត្រួតពិនិត្យភាពស្អាត')}
            placeholder={tr(
              'Paste a raw Khmer corpus snippet to audit encoding, Latin noise, and sentence delimiters...',
              'បិទភ្ជាប់អត្ថបទខ្មែរនៅទីនេះ ដើម្បីត្រួតពិនិត្យកំហុសកូដ ការលាយអក្សរឡាតាំង និងសញ្ញាខណ្ឌ...'
            )}
            className="w-full flex-1 p-4 rounded-xl bg-slate-950 border border-slate-800 text-white font-khmer text-sm leading-relaxed placeholder:text-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
          />

          <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-slate-400 tabular-nums">
            <span>
              {tr('Khmer Script:', 'អក្សរខ្មែរ៖')}{' '}
              <strong className="text-emerald-300">{output.metrics.khmerRatioPct}%</strong>
            </span>
            <span aria-hidden="true" className="text-slate-700">·</span>
            <span>
              {tr('Latin Noise:', 'អក្សរឡាតាំង៖')}{' '}
              <strong className="text-amber-300">{output.metrics.latinRatioPct}%</strong>
            </span>
            <span aria-hidden="true" className="text-slate-700">·</span>
            <span>
              {tr('Delimiters:', 'សញ្ញាខណ្ឌ៖')}{' '}
              <strong className="text-cyan-300">{output.metrics.delimiterCount}</strong>
            </span>
          </div>
        </div>

        {/* Right: Cleanliness Score Gauge & Verdict Card */}
        <div className="lg:col-span-5 p-5 rounded-xl border border-slate-800 bg-slate-950/70 flex flex-col justify-between space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                {tr('CLEANLINESS SCORE', 'ពិន្ទុភាពស្អាតទិន្នន័យ')}
              </div>
              <div className="flex items-baseline gap-2 font-mono tabular-nums">
                <span
                  className={`text-4xl font-bold ${
                    output.verdict === 'clean'
                      ? 'text-emerald-400'
                      : output.verdict === 'needs_repair'
                        ? 'text-amber-400'
                        : 'text-rose-400'
                  }`}
                >
                  {output.cleanlinessScore}
                </span>
                <span className="text-sm text-slate-500">/ 100</span>
              </div>
            </div>

            <div className="text-right">
              {output.verdict === 'clean' ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{tr('Pretrain Ready', 'ស្អាតរួចរាល់')}</span>
                </span>
              ) : output.verdict === 'needs_repair' ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-amber-300">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{tr('Needs Sanitization', 'ត្រូវសម្អាតបន្ថែម')}</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-rose-300">
                  <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{tr('Contaminated', 'មានភាពកខ្វក់')}</span>
                </span>
              )}
            </div>
          </div>

          {/* Score Bar */}
          <div className="space-y-1.5">
            <div className="h-2.5 w-full rounded-full bg-slate-900 border border-slate-800 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  output.verdict === 'clean'
                    ? 'bg-emerald-400'
                    : output.verdict === 'needs_repair'
                      ? 'bg-amber-400'
                      : 'bg-rose-400'
                }`}
                style={{ width: `${output.cleanlinessScore}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 tabular-nums">
              <span>
                {passedCount} {tr('rules passed', 'ក្បួនឆ្លងកាត់')}
              </span>
              <span>
                {failedCount} {tr('issues flagged', 'បញ្ហារកឃើញ')}
              </span>
            </div>
          </div>

          {/* Quick Auto-Sanitize Preview Box */}
          <div className="pt-3 border-t border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-mono text-slate-300 flex items-center gap-1.5">
                <Wand2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{tr('Auto-Sanitized Candidate', 'អត្ថបទសម្អាតស្វ័យប្រវត្តិ')}</span>
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={!output.sanitizedPreview}
                  onClick={handleCopySanitized}
                  className="px-2 py-1 rounded text-[11px] font-mono bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-40 flex items-center gap-1 whitespace-nowrap shrink-0"
                >
                  {copiedClean ? (
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                  <span>{copiedClean ? tr('Copied', 'បានចម្លង') : tr('Copy', 'ចម្លង')}</span>
                </button>
                {onApplySanitized && (
                  <button
                    type="button"
                    disabled={!output.sanitizedPreview}
                    onClick={() => onApplySanitized(output.sanitizedPreview)}
                    className="px-2 py-1 rounded text-[11px] font-mono font-bold bg-amber-400 text-slate-950 hover:bg-amber-300 disabled:opacity-40 whitespace-nowrap shrink-0"
                  >
                    {tr('Use Clean Text', 'ប្រើអត្ថបទស្អាត')}
                  </button>
                )}
              </div>
            </div>
            <p className="text-xs font-khmer text-slate-300 line-clamp-3 leading-relaxed">
              {output.sanitizedPreview || (
                <span className="text-slate-500 italic">
                  {tr('Enter text to preview rule-based repairs.', 'បញ្ចូលអត្ថបទដើម្បីមើលលទ្ធផលកែសម្រួល។')}
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Rule Audit Breakdown List */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className={`text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono ${isKm ? 'font-khmer' : ''}`}>
            {tr('Rule-Based Audit Breakdown', 'លទ្ធផលសវនកម្មតាមក្បួនច្បាប់នីមួយៗ')}
          </h4>

          <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-950 border border-slate-800">
            {(
              [
                { id: 'all', label: tr(`All (${output.rules.length})`, `ទាំងអស់ (${output.rules.length})`) },
                { id: 'failed', label: tr(`Flagged (${failedCount})`, `រកឃើញបញ្ហា (${failedCount})`) },
                { id: 'passed', label: tr(`Passed (${passedCount})`, `ត្រឹមត្រូវ (${passedCount})`) }
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setRuleFilter(tab.id)}
                className={`px-2.5 py-1 rounded text-[11px] font-mono transition-colors whitespace-nowrap shrink-0 ${
                  ruleFilter === tab.id
                    ? 'bg-amber-400 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {output.rules.length === 0 ? (
          <div className={`p-6 rounded-xl border border-slate-800 bg-slate-950/60 text-center text-xs text-slate-400 ${isKm ? 'font-khmer' : ''}`}>
            {tr('No text provided. Select a preset or type Khmer prose above to run the rule engine.', 'មិនទាន់មានអត្ថបទទេ។ សូមជ្រើសរើសគំរូ ឬវាយអត្ថបទខ្មែរខាងលើ។')}
          </div>
        ) : visibleRules.length === 0 ? (
          <div className={`p-6 rounded-xl border border-slate-800 bg-slate-950/60 text-center text-xs text-slate-400 ${isKm ? 'font-khmer' : ''}`}>
            {tr('No rules match this filter.', 'គ្មានក្បួនណាមួយត្រូវនឹងតម្រងនេះទេ។')}
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80 rounded-xl border border-slate-800 bg-slate-950/60 overflow-hidden">
            {visibleRules.map((rule) => (
              <div
                key={rule.id}
                className="p-4 flex flex-col sm:flex-row sm:items-start justify-between gap-3"
              >
                <div className="flex items-start gap-3 min-w-0">
                  {rule.passed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : rule.severity === 'critical' ? (
                    <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  )}

                  <div className="space-y-1 min-w-0">
                    <div className={`text-xs font-semibold text-white ${isKm ? 'font-khmer' : ''}`}>
                      {isKm ? rule.nameKm : rule.name}
                    </div>
                    <p className={`text-xs text-slate-300 leading-relaxed ${isKm ? 'font-khmer' : ''}`}>
                      {isKm ? rule.findingKm : rule.finding}
                    </p>
                    {!rule.passed && (
                      <div className={`text-[11px] text-amber-300/90 ${isKm ? 'font-khmer' : 'font-mono'}`}>
                        {tr('Fix:', 'ដំណោះស្រាយ៖')} {isKm ? rule.remediationKm : rule.remediation}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between gap-1 shrink-0 font-mono text-xs tabular-nums">
                  <span
                    className={
                      rule.passed
                        ? 'text-emerald-400 font-semibold'
                        : rule.severity === 'critical'
                          ? 'text-rose-400 font-bold'
                          : 'text-amber-400 font-bold'
                    }
                  >
                    {rule.passed ? tr('PASS · 0 pts', 'ត្រឹមត្រូវ · 0 ពិន្ទុ') : `-${rule.pointsDeducted} ${tr('pts', 'ពិន្ទុ')}`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
