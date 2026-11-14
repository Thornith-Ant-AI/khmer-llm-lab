import React, { useState } from 'react';
import {
  Sparkles,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Copy,
  Check,
  Compass,
  Scale,
  MapPin
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export interface BiasReportData {
  culturalScore: number;
  biasVerdict: string;
  summary: string;
  regionalDistribution: {
    phnomPenhUrbanPercent: number;
    battambangWesternPercent: number;
    siemReapAngkorPercent: number;
    ruralGeneralPercent: number;
    diasporaSurinKromPercent: number;
  };
  registerAnalysis: {
    dominantRegister: string;
    honorificPolitenessLevel: string;
    pronounConsistency: string;
  };
  flaggedBiases: Array<{
    category: string;
    severity: string;
    flaggedSnippet: string;
    explanation: string;
    suggestedCorrection: string;
  }>;
  debiasedCulturalAlternative: string;
}

const PRESET_BIAS_TEST_CASES = [
  {
    label: 'Translationese Calque (Overuse of ត្រូវបាន & Literal English)',
    labelKm: 'ភាសាបកប្រែត្រង់ (ប្រើ «ត្រូវបាន» ច្រើនហួស និងទម្រង់អង់គ្លេស)',
    text: 'អរុណសួស្តី! របាយការណ៍នេះត្រូវបានរៀបចំឡើងដោយខ្ញុំដើម្បីធ្វើឱ្យអារម្មណ៍អ្នកល្អ។ តើអ្នកចង់ផឹកកាហ្វេដែលមានតម្លៃ ៥ ដុល្លារទេ?',
    context: 'Direct word-for-word translation from English conversational greeting.',
    contextKm: 'ការបកប្រែពាក្យមួយម៉ាត់ម្តងៗដោយផ្ទាល់ពីការសន្ទនាភាសាអង់គ្លេស។'
  },
  {
    label: 'Pronoun Register Clash (Mixing លោក with ឯង)',
    labelKm: 'ការប៉ះទង្គិចសព្វនាមគោរព (លាយឡំ «លោក» ជាមួយ «ឯង»)',
    text: 'សូមគោរពជម្រាបសួរលោកគ្រូ។ តើឯងបានពិនិត្យមើលកិច្ចការផ្ទះរបស់ខ្ញុំឬនៅ? ខ្ញុំគិតថាឯងគួរតែពេញចិត្តនឹងវា។',
    context: 'Clashing respectful teacher address with informal second-person pronoun.',
    contextKm: 'ការលាយឡំពាក្យគោរពគ្រូបង្រៀនជាមួយសព្វនាមបុរសទីពីរដែលមិនផ្លូវការ។'
  },
  {
    label: 'Urban Phnom Penh Slang Skew (Extreme Youth Vernacular)',
    labelKm: 'លំអៀងភាសាយុវវ័យទីក្រុងភ្នំពេញ (ពាក្យស្លោកពេក)',
    text: 'អូខេញាក់សាច់ម៉ងបង! ហាងកាហ្វេនៅទួលគោកឡូយណាស់ ទៅញ៉ាំជុំគ្នាម៉ោ ធានាថាសាហាវម៉ង!',
    context: 'Heavy contemporary Phnom Penh colloquialisms unsuitable for balanced pretraining.',
    contextKm: 'ពាក្យសាមញ្ញសម័យថ្មីនៅភ្នំពេញច្រើនពេក ដែលមិនស័ក្តិសមសម្រាប់ការបណ្តុះបណ្តាលទូទៅ។'
  },
  {
    label: 'Balanced Authentic Khmer (Formal Pedagogical Register)',
    labelKm: 'ភាសាខ្មែរស្តង់ដារមានតុល្យភាព (កម្រិតគរុកោសល្យផ្លូវការ)',
    text: 'ជម្រាបសួរលោកគ្រូ។ ខ្ញុំបាទសូមអនុញ្ញាតគោរពជម្រាបសួរ និងសុំការណែនាំបន្ថែមលើឯកសារស្រាវជ្រាវប្រវត្តិសាស្ត្រខ្មែរនេះ។',
    context: 'Standard respectful register with culturally appropriate Sompas greeting and polite particle.',
    contextKm: 'កម្រិតភាសាគោរពតាមស្តង់ដារ ប្រើការជម្រាបសួរ និងពាក្យគួរសមត្រឹមត្រូវតាមវប្បធម៌។'
  }
];

interface LanguageBiasMonitorProps {
  initialText?: string;
  onApplyDebiasedText?: (newText: string) => void;
}

export const LanguageBiasMonitor: React.FC<LanguageBiasMonitorProps> = ({
  initialText,
  onApplyDebiasedText
}) => {
  const { language, isKm, tr } = useLanguage();
  const [inputText, setInputText] = useState<string>(
    initialText || PRESET_BIAS_TEST_CASES[0].text
  );
  const [contextInput, setContextInput] = useState<string>(
    PRESET_BIAS_TEST_CASES[0].context
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [report, setReport] = useState<BiasReportData | null>(null);
  const [isFallback, setIsFallback] = useState<boolean>(false);
  const [copiedDebiased, setCopiedDebiased] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const runBiasAudit = async (textToAudit?: string, ctx?: string) => {
    const text = textToAudit !== undefined ? textToAudit : inputText;
    if (!text.trim()) return;

    setLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/ai/analyze-language-bias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          context: ctx !== undefined ? ctx : contextInput,
          language
        })
      });

      const result = await response.json();
      if (result.success && result.data) {
        setReport(result.data);
        setIsFallback(Boolean(result.isFallback));
      } else {
        setErrorMsg(result.error || tr('Failed to complete bias audit.', 'មិនអាចបញ្ចប់សវនកម្មលំអៀងភាសាបានទេ។'));
      }
    } catch (err: any) {
      setErrorMsg(err.message || tr('Network error while contacting Gemini API.', 'មានបញ្ហាបណ្តាញពេលទាក់ទងទៅកាន់ Gemini API។'));
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPreset = (sample: typeof PRESET_BIAS_TEST_CASES[0]) => {
    const ctx = isKm ? sample.contextKm : sample.context;
    setInputText(sample.text);
    setContextInput(ctx);
    runBiasAudit(sample.text, ctx);
  };

  const handleCopyDebiased = () => {
    if (!report?.debiasedCulturalAlternative) return;
    navigator.clipboard.writeText(report.debiasedCulturalAlternative);
    setCopiedDebiased(true);
    setTimeout(() => setCopiedDebiased(false), 2000);
  };

  const getVerdictBadge = (verdict: string) => {
    switch (verdict) {
      case 'BALANCED_AUTHENTIC':
        return (
          <span className={`px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1.5 ${isKm ? 'font-khmer' : 'font-mono'}`}>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>{tr('Culturally Balanced & Authentic', 'មានតុល្យភាពវប្បធម៌ និងធម្មជាតិពិត')}</span>
          </span>
        );
      case 'TRANSLATIONESE_DETECTED':
        return (
          <span className={`px-2.5 py-1 rounded-md text-xs font-bold bg-amber-950 text-amber-300 border border-amber-800 flex items-center gap-1.5 ${isKm ? 'font-khmer' : 'font-mono'}`}>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>{tr('Western Translationese Calque Detected', 'រកឃើញភាសាបកប្រែត្រង់តាមបរទេស')}</span>
          </span>
        );
      case 'PHNOM_PENH_URBAN_SKEWED':
        return (
          <span className={`px-2.5 py-1 rounded-md text-xs font-bold bg-cyan-950 text-cyan-300 border border-cyan-800 flex items-center gap-1.5 ${isKm ? 'font-khmer' : 'font-mono'}`}>
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span>{tr('Central Urban Dialect Skewed', 'លំអៀងទៅរកគ្រាមភាសាទីក្រុងកណ្តាល')}</span>
          </span>
        );
      case 'REGISTER_CLASH':
        return (
          <span className={`px-2.5 py-1 rounded-md text-xs font-bold bg-rose-950 text-rose-300 border border-rose-800 flex items-center gap-1.5 ${isKm ? 'font-khmer' : 'font-mono'}`}>
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span>{tr('Honorific Register & Pronoun Clash', 'ប៉ះទង្គិចកម្រិតភាសាគោរព និងសព្វនាម')}</span>
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
            {verdict}
          </span>
        );
    }
  };

  const getSeverityLabel = (severity: string) => {
    const upper = (severity || '').toUpperCase();
    if (upper === 'HIGH') return tr('HIGH', 'ខ្ពស់');
    if (upper === 'MEDIUM') return tr('MEDIUM', 'មធ្យម');
    if (upper === 'LOW') return tr('LOW', 'ទាប');
    return severity;
  };

  return (
    <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="space-y-1">
          <div className={`inline-flex items-center gap-2 text-xs font-semibold text-amber-400 tracking-wider ${isKm ? 'font-khmer' : 'uppercase font-mono'}`}>
            <Sparkles className="w-3.5 h-3.5" />
            <span>{tr('KHMER LANGUAGE BIAS MONITOR', 'កម្មវិធីតាមដានលំអៀងភាសាខ្មែរ')}</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>{tr('POWERED BY GEMINI API', 'ដំណើរការដោយ GEMINI API')}</span>
          </div>
          <h3 className={`text-xl font-bold text-white tracking-tight ${isKm ? 'font-khmer' : ''}`}>
            {tr('Cultural Authenticity & Regional Dialect Bias Analyzer', 'កម្មវិធីវិភាគភាពសមស្របវប្បធម៌ និងលំអៀងគ្រាមភាសាតាមតំបន់')}
          </h3>
          <p className={`text-xs text-slate-400 max-w-3xl leading-relaxed ${isKm ? 'font-khmer' : ''}`}>
            {isKm ? (
              <>
                វាយតម្លៃគូទិន្នន័យបង្រៀនសំយោគ និងឃ្លាំងអត្ថបទដើម្បីរកការបកប្រែត្រង់ពីភាសាអង់គ្លេស (<em className="text-amber-200">Translationese</em>) ការប៉ះទង្គិចកម្រិតភាសាគោរព (រាជសព្ទ សង្ឃសព្ទ និងភាសាសាមញ្ញ) និងអតុល្យភាពគ្រាមភាសាតាមតំបន់។
              </>
            ) : (
              <>
                Evaluates synthetic Khmer instruction pairs and pretraining corpora for English translation calques (<em className="text-amber-200">Translationese</em>), honorific register clashes (Royal <span className="font-khmer text-amber-300">រាជសព្ទ</span> vs. Monk <span className="font-khmer text-amber-300">សង្ឃសព្ទ</span> vs. Casual), and regional dialect imbalances.
              </>
            )}
          </p>
        </div>

        {/* Status Chip */}
        <div className={`flex items-center gap-2 text-xs shrink-0 ${isKm ? 'font-khmer' : 'font-mono'}`}>
          <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-slate-300">{tr('Gemini 3.8 Flash (Server-Side)', 'Gemini 3.8 Flash (ផ្នែកម៉ាស៊ីនមេ)')}</span>
          </div>
        </div>
      </div>

      {/* Preset Bias Test Cases */}
      <div className="space-y-2">
        <div className={`text-xs text-slate-400 ${isKm ? 'font-khmer' : 'font-mono uppercase'}`}>
          {tr('SELECT KNOWN BIAS PATTERN TO AUDIT:', 'ជ្រើសរើសទម្រង់លំអៀងគំរូដើម្បីធ្វើសវនកម្ម៖')}
        </div>
        <div className="flex flex-wrap gap-2">
          {PRESET_BIAS_TEST_CASES.map((sample, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectPreset(sample)}
              className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${isKm ? 'font-khmer' : ''} ${
                inputText === sample.text
                  ? 'bg-amber-400 text-slate-950 font-semibold border-amber-400 shadow-sm'
                  : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              {isKm ? sample.labelKm : sample.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input Textarea & Trigger Button */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className={isKm ? 'font-khmer' : ''}>
            {tr('Khmer Text to Audit for Cultural / Dialect Bias:', 'អត្ថបទខ្មែរសម្រាប់ធ្វើសវនកម្មលំអៀងវប្បធម៌ / គ្រាមភាសា៖')}
          </span>
          <span className={`tabular-nums ${isKm ? 'font-khmer' : 'font-mono'}`}>
            {inputText.length} {tr('characters', 'តួអក្សរ')}
          </span>
        </div>

        <textarea
          rows={3}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={tr(
            'Paste synthetic Khmer text here to audit...',
            'បិទភ្ជាប់អត្ថបទសំយោគជាភាសាខ្មែរនៅទីនេះដើម្បីធ្វើសវនកម្ម...'
          )}
          className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 text-white font-khmer text-base focus:outline-none focus:border-amber-400 transition-colors leading-relaxed"
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className={`text-[11px] text-slate-500 ${isKm ? 'font-khmer' : 'font-mono'}`}>
            {tr(
              'Audits against the Royal Academy of Cambodia Sociolinguistic Standard.',
              'ធ្វើសវនកម្មយោងតាមស្តង់ដារសង្គមភាសាវិទ្យានៃរាជបណ្ឌិត្យសភាកម្ពុជា។'
            )}
          </div>

          <button
            onClick={() => runBiasAudit()}
            disabled={loading || !inputText.trim()}
            className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-400 text-slate-950 hover:bg-amber-300 transition-colors shadow-sm disabled:opacity-50 cursor-pointer ${
              isKm ? 'font-khmer' : 'font-mono'
            }`}
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>
              {loading
                ? tr('Auditing with Gemini...', 'កំពុងធ្វើសវនកម្មជាមួយ Gemini...')
                : tr('Analyze Language Bias', 'វិភាគលំអៀងភាសា')}
            </span>
          </button>
        </div>
      </div>

      {/* Error Message if Any */}
      {errorMsg && (
        <div className={`p-3.5 rounded-xl bg-rose-950/30 border border-rose-800/50 text-xs text-rose-300 flex items-center gap-2 ${isKm ? 'font-khmer' : ''}`}>
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Analysis Results Display */}
      {report && (
        <div className="space-y-6 pt-2 animate-in fade-in">
          {/* Top Score & Verdict Card */}
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center min-w-[80px]">
                  <span className={`text-[10px] text-slate-500 block ${isKm ? 'font-khmer' : 'font-mono uppercase'}`}>
                    {tr('SCORE', 'ពិន្ទុ')}
                  </span>
                  <span className={`text-2xl font-bold font-mono tabular-nums ${
                    report.culturalScore >= 80 ? 'text-emerald-400' : report.culturalScore >= 60 ? 'text-amber-400' : 'text-rose-400'
                  }`}>
                    {report.culturalScore}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className={`text-[10px] text-slate-400 block ${isKm ? 'font-khmer' : 'font-mono uppercase'}`}>
                    {tr('AUDIT VERDICT', 'លទ្ធផលសវនកម្ម')}
                  </span>
                  <div>{getVerdictBadge(report.biasVerdict)}</div>
                </div>
              </div>

              {isFallback && (
                <div className={`text-[11px] text-amber-400/90 bg-amber-950/30 px-3 py-1 rounded-lg border border-amber-800/40 ${isKm ? 'font-khmer' : 'font-mono'}`}>
                  {tr('Local Sociolinguistic Heuristic Engine', 'ម៉ាស៊ីនវាយតម្លៃសង្គមភាសាវិទ្យាក្នុងមូលដ្ឋាន')}
                </div>
              )}
            </div>

            <p className={`text-xs text-slate-300 leading-relaxed ${isKm ? 'font-khmer' : ''}`}>
              {report.summary}
            </p>
          </div>

          {/* Regional Dialect Distribution & Register Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Regional Dialect Representation */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-cyan-400" />
                  <h4 className={`text-xs font-bold text-white tracking-wider ${isKm ? 'font-khmer' : 'uppercase font-mono'}`}>
                    {tr('Regional Dialect Distribution', 'បំណែងចែកគ្រាមភាសាតាមតំបន់')}
                  </h4>
                </div>
                <span className={`text-[11px] text-slate-400 ${isKm ? 'font-khmer' : 'font-mono'}`}>
                  {tr('Dialect balance', 'តុល្យភាពគ្រាមភាសា')}
                </span>
              </div>

              {/* Stacked bar */}
              <div className="space-y-2">
                <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden flex">
                  <div
                    style={{ width: `${report.regionalDistribution.phnomPenhUrbanPercent}%` }}
                    className="bg-cyan-400 h-full"
                    title={`${tr('Phnom Penh Urban', 'ទីក្រុងភ្នំពេញ')}: ${report.regionalDistribution.phnomPenhUrbanPercent}%`}
                  />
                  <div
                    style={{ width: `${report.regionalDistribution.battambangWesternPercent}%` }}
                    className="bg-amber-400 h-full"
                    title={`${tr('Battambang/Western', 'បាត់ដំបង/ភាគខាងលិច')}: ${report.regionalDistribution.battambangWesternPercent}%`}
                  />
                  <div
                    style={{ width: `${report.regionalDistribution.siemReapAngkorPercent}%` }}
                    className="bg-emerald-400 h-full"
                    title={`${tr('Siem Reap/Angkor', 'សៀមរាប/អង្គរ')}: ${report.regionalDistribution.siemReapAngkorPercent}%`}
                  />
                  <div
                    style={{ width: `${report.regionalDistribution.ruralGeneralPercent}%` }}
                    className="bg-violet-400 h-full"
                    title={`${tr('Rural Provincial', 'ជនបទ/តាមខេត្ត')}: ${report.regionalDistribution.ruralGeneralPercent}%`}
                  />
                  <div
                    style={{ width: `${report.regionalDistribution.diasporaSurinKromPercent}%` }}
                    className="bg-rose-400 h-full"
                    title={`${tr('Khmer Surin/Krom', 'ខ្មែរសុរិន្ទ និងខ្មែរក្រោម')}: ${report.regionalDistribution.diasporaSurinKromPercent}%`}
                  />
                </div>

                <div className={`grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-[11px] ${isKm ? 'font-khmer' : 'font-mono'}`}>
                  <div className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800">
                    <span className="text-cyan-400">{tr('Phnom Penh:', 'ភ្នំពេញ៖')}</span>
                    <span className="text-white font-bold font-mono">{report.regionalDistribution.phnomPenhUrbanPercent}%</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800">
                    <span className="text-amber-400">{tr('Battambang:', 'បាត់ដំបង៖')}</span>
                    <span className="text-white font-bold font-mono">{report.regionalDistribution.battambangWesternPercent}%</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800">
                    <span className="text-emerald-400">{tr('Siem Reap:', 'សៀមរាប៖')}</span>
                    <span className="text-white font-bold font-mono">{report.regionalDistribution.siemReapAngkorPercent}%</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800">
                    <span className="text-violet-400">{tr('Rural/Provinces:', 'ជនបទ/ខេត្ត៖')}</span>
                    <span className="text-white font-bold font-mono">{report.regionalDistribution.ruralGeneralPercent}%</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800 col-span-2 sm:col-span-1">
                    <span className="text-rose-400">{tr('Surin & Krom:', 'សុរិន្ទ និងខ្មែរក្រោម៖')}</span>
                    <span className="text-white font-bold font-mono">{report.regionalDistribution.diasporaSurinKromPercent}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Linguistic Register & Honorific Audit */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Scale className="w-4 h-4 text-amber-400" />
                  <h4 className={`text-xs font-bold text-white tracking-wider ${isKm ? 'font-khmer' : 'uppercase font-mono'}`}>
                    {tr('Honorific Register & Pronoun Audit', 'សវនកម្មកម្រិតភាសាគោរព និងសព្វនាម')}
                  </h4>
                </div>
                <span className={`text-[11px] text-slate-400 ${isKm ? 'font-khmer' : 'font-mono'}`}>
                  {tr('Stratification', 'ថ្នាក់កម្រិតភាសា')}
                </span>
              </div>

              <div className={`space-y-2.5 text-xs ${isKm ? 'font-khmer' : 'font-mono'}`}>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-0.5">
                  <span className={`text-[10px] text-slate-500 block ${isKm ? 'font-khmer' : 'uppercase'}`}>
                    {tr('DOMINANT REGISTER', 'កម្រិតភាសាចម្បង')}
                  </span>
                  <div className="text-white font-bold font-khmer">{report.registerAnalysis.dominantRegister}</div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-0.5">
                  <span className={`text-[10px] text-slate-500 block ${isKm ? 'font-khmer' : 'uppercase'}`}>
                    {tr('POLITENESS PARTICLES (បាទ / ចាស)', 'ពាក្យបញ្ជាក់ភាពគួរសម (បាទ / ចាស)')}
                  </span>
                  <div className="text-emerald-300 font-bold font-khmer">{report.registerAnalysis.honorificPolitenessLevel}</div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-0.5">
                  <span className={`text-[10px] text-slate-500 block ${isKm ? 'font-khmer' : 'uppercase'}`}>
                    {tr('PRONOUN SYMMETRY', 'ភាពស៊ីសង្វាក់នៃសព្វនាម')}
                  </span>
                  <div className="text-cyan-300 font-bold font-khmer">{report.registerAnalysis.pronounConsistency}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Flagged Biases Breakdown */}
          {report.flaggedBiases.length > 0 && (
            <div className="space-y-3">
              <h4 className={`text-xs font-bold text-white tracking-wider flex items-center gap-2 ${isKm ? 'font-khmer' : 'uppercase font-mono'}`}>
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span>
                  {tr(
                    `Flagged Bias & Translationese Factors (${report.flaggedBiases.length})`,
                    `កត្តាលំអៀង និងភាសាបកប្រែត្រង់ដែលបានរកឃើញ (${report.flaggedBiases.length})`
                  )}
                </span>
              </h4>

              <div className="space-y-3">
                {report.flaggedBiases.map((bias, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-xl border border-slate-800 bg-slate-950 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className={`font-bold text-amber-400 ${isKm ? 'font-khmer' : 'font-mono'}`}>
                        {bias.category}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${isKm ? 'font-khmer' : 'font-mono uppercase'} ${
                        bias.severity === 'HIGH' ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-slate-900 text-slate-300 border border-slate-700'
                      }`}>
                        {isKm
                          ? `កម្រិតធ្ងន់ធ្ងរ៖ ${getSeverityLabel(bias.severity)}`
                          : `${bias.severity} Severity`}
                      </span>
                    </div>

                    <div className="p-2 rounded bg-slate-900/80 border border-slate-800 font-khmer text-slate-200">
                      {tr('Snippet:', 'ផ្នែកដែលរកឃើញ៖')} <code className="text-rose-300 font-bold font-khmer">{bias.flaggedSnippet}</code>
                    </div>

                    <p className={`text-slate-300 leading-relaxed ${isKm ? 'font-khmer' : ''}`}>
                      {bias.explanation}
                    </p>

                    <div className="pt-1 text-slate-400 flex items-start gap-1.5 font-khmer">
                      <span className={`text-emerald-400 font-semibold text-[11px] shrink-0 ${isKm ? 'font-khmer' : 'font-mono'}`}>
                        {tr('Correction:', 'ការកែតម្រូវ៖')}
                      </span>
                      <span className="text-emerald-300">{bias.suggestedCorrection}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Debiased Cultural Alternative Box */}
          {report.debiasedCulturalAlternative && (
            <div className="p-5 rounded-2xl border border-emerald-900/40 bg-slate-950 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <div className={`flex items-center gap-2 text-xs font-bold text-emerald-400 ${isKm ? 'font-khmer' : 'font-mono uppercase'}`}>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{tr('Culturally Debiased Natural Alternative', 'ជម្រើសអត្ថបទធម្មជាតិគ្មានលំអៀងវប្បធម៌')}</span>
                  </div>
                  <p className={`text-[11px] text-slate-400 ${isKm ? 'font-khmer' : ''}`}>
                    {tr(
                      'Re-calibrated with authentic Cambodian clausal flow and natural register.',
                      'បានកែសម្រួលឡើងវិញតាមលំហូរប្រយោគខ្មែរពិត និងកម្រិតភាសាធម្មជាតិ។'
                    )}
                  </p>
                </div>

                <div className={`flex items-center gap-2 text-xs ${isKm ? 'font-khmer' : 'font-mono'}`}>
                  {onApplyDebiasedText && (
                    <button
                      onClick={() => onApplyDebiasedText(report.debiasedCulturalAlternative)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 transition-colors shadow-sm"
                    >
                      {tr('Apply to Synthetic Studio', 'ប្រើប្រាស់ក្នុងស្ទូឌីយោ SFT')}
                    </button>
                  )}

                  <button
                    onClick={handleCopyDebiased}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 hover:text-white transition-colors"
                  >
                    {copiedDebiased ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedDebiased ? tr('Copied', 'បានចម្លង') : tr('Copy', 'ចម្លង')}</span>
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 font-khmer text-sm text-emerald-200 leading-relaxed whitespace-pre-line">
                {report.debiasedCulturalAlternative}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
