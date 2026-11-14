import React, { useState, useMemo } from 'react';
import {
  estimateCorpusQuality,
  QualityFilterThresholds,
  LineAssessment
} from '../utils/khmerLinguistics';
import { useLanguage } from '../contexts/LanguageContext';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Trash2,
  Copy,
  Check,
  Sliders,
  Download,
  Link2,
  FileCode,
  Sparkles,
  CheckCircle2,
  XCircle,
  Eye
} from 'lucide-react';

const RICH_CORPUS_SAMPLES = [
  {
    name: 'News Portal with Web Boilerplate & Links',
    nameKm: 'វិបផតថលព័ត៌មានដែលមានតំណ និងទម្រង់គេហទំព័រ',
    desc: 'Typical web crawler extraction with navigation, social share links, and copyright notices surrounding an article.',
    descKm: 'ទិន្នន័យទាញយកពីវេបសាយធម្មតា ដែលមានម៉ឺនុយរុករក តំណចែករំលែកសង្គម និងកម្មសិទ្ធិបញ្ញាជុំវិញអត្ថបទ។',
    text: `ទំព័រដើម » ព័ត៌មានជាតិ » សេដ្ឋកិច្ច
ចុចត្រង់នេះដើម្បីអានបន្ត ឬចែករំលែកលើ Facebook
https://news.example.com.kh/article/economic-growth-2026?ref=social_share
រាជរដ្ឋាភិបាលកម្ពុជាបានប្រកាសដាក់ចេញនូវក្របខ័ណ្ឌគោលនយោបាយសេដ្ឋកិច្ចនិងសង្គមឌីជីថល ដើម្បីជំរុញកំណើនសេដ្ឋកិច្ចថ្មីក្នុងយុគសម័យបច្ចេកវិទ្យាទំនើប។
គោលនយោបាយនេះផ្តោតសំខាន់លើការកសាងហេដ្ឋារចនាសម្ព័ន្ធទូរគមនាគមន៍ ការអភិវឌ្ឍធនធានមនុស្សជំនាញឌីជីថល និងការលើកកម្ពស់សហគ្រាសធុនតូចនិងមធ្យម។
លោកអ្នកអាចទាញយកឯកសារបន្ថែមតាមរយៈ https://mptc.gov.kh/documents/digital-policy.pdf
ព័ត៌មានទាក់ទង
អានបន្ថែម
មតិយោបល់
ទំនាក់ទំនងផ្សាយពាណិជ្ជកម្មតាមរយៈ info@cambodia-news.com.kh ឬទូរស័ព្ទលេខ 012 345 678
រក្សាសិទ្ធិគ្រប់យ៉ាងដោយ Cambodia News Portal ឆ្នាំ២០២៦។ គោលការណ៍ឯកជនភាព និងលក្ខខណ្ឌនៃការប្រើប្រាស់។`
  },
  {
    name: 'Casino & Telegram Affiliate Spam',
    nameKm: 'សាររំខានកាស៊ីណូ និងតំណ Telegram ផ្សព្វផ្សាយ',
    desc: 'Heavy URL density, betting bonuses, and affiliate Telegram links commonly poisoning raw web crawls.',
    descKm: 'តំណភ្ជាប់ច្រើនហួសប្រមាណ ការផ្សព្វផ្សាយល្បែងស៊ីសង និងតំណ Telegram ដែលបំពុលទិន្នន័យវេប។',
    text: `ស្វាគមន៍មកកាន់គេហទំព័រកម្សាន្តឈានមុខគេនៅកម្ពុជា!
ចូលរួមលេងកាស៊ីណូអនឡាញឈ្នះ១០០% ដាក់ប្រាក់ដកប្រាក់រហ័ស ភ្នាល់បាល់បាការ៉ាត់សេវា២៤ម៉ោង
ចុចចូលលេងភ្លាមៗតាមតំណនេះ: https://betting-cambodia88.com/register?aff=khmer_vip
ហ្គេមបាញ់ត្រី ខ្លាឃ្លោក និងស្លុតអនឡាញ slot online ឈ្នះរង្វាន់ធំរាល់ថ្ងៃ!
ទាក់ទងភ្នាក់ងារបម្រើអតិថិជនតាម Telegram: https://t.me/betting_agent_khmer_24h
ដាក់ប្រាក់ ១០ដុល្លារ ទទួលបានប្រាក់បន្ថែម ២០ដុល្លារភ្លាមៗ គ្មានលក្ខខណ្ឌស្មុគស្មាញ!
line id: @casino_cambodia_official ឬចូលទៅកាន់ www.slot-khmer-jackpot.net`
  },
  {
    name: 'Legacy Limon ASCII Font Artifact',
    nameKm: 'កាកសំណល់ពុម្ពអក្សរ Limon ASCII ចាស់',
    desc: 'Non-Unicode text typed in English ASCII to display Khmer characters using legacy Limon font.',
    descKm: 'អត្ថបទមិនមែនយូនីកូដដែលវាយដោយអក្សរ ASCII អង់គ្លេសសម្រាប់បង្ហាញពុម្ពអក្សរ Limon បុរាណ។',
    text: `GñkEdleZVIkarGVImYy enHKitzaBitCa mYy rbs; eRkamy sßay
BitCakarGt;eZVIkarEdlrkGVImin)an enAeBlEdlmanbBaØa
កម្ពុជាកំពុងឈានទៅមុខលើការប្រើប្រាស់អក្សរយូនីកូដស្ដង់ដារជាតិ។
bBa¢akarKit KitzaeZVIey:agNa[)anla¥`
  },
  {
    name: 'Pristine Ground Truth Prose (Buddhist Institute)',
    nameKm: 'អត្ថបទសុទ្ធស្តង់ដារខ្ពស់ (ពុទ្ធសាសនបណ្ឌិត្យ)',
    desc: 'Clean, high-register classical prose from the Buddhist Institute with 0% boilerplate and zero URLs.',
    descKm: 'សំណេរបុរាណកម្រិតខ្ពស់ដ៏ស្អាតពីវិទ្យាស្ថានពុទ្ធសាសនបណ្ឌិត្យ គ្មានអត្ថបទរំខាន និងគ្មានតំណ URL ឡើយ។',
    text: `ព្រះត្រៃបិដក ភាគ៥២ សុត្តន្តបិដក ខុទ្ទកនិកាយ ធម្មបទគាថា។
ចិត្តដែលបុគ្គលបានអប់រំល្អហើយ រមែងនាំមកនូវសេចក្តីសុខគ្រប់ពេលវេលា។
បុគ្គលគប្បីរក្សាចិត្តរបស់ខ្លួន ដូចអ្នកយាមទ្វាររក្សាការពារនគរយ៉ាងរឹងមាំដូច្នោះដែរ។
ការមិនសេពគប់នូវបុគ្គលពាល ការសេពគប់នូវបណ្ឌិតទាំងឡាយ និងការបូជាដល់បុគ្គលដែលគួរជាទីបូជា ទាំងនេះជាមង្គលដ៏ឧត្តម។
សេចក្តីស្ងប់រមែងកើតមានឡើងដល់បុគ្គលដែលលះបង់នូវកំហឹង និងសេចក្តីក្រោធក្នុងចិត្ត។`
  }
];

export const CorpusCleaningSimulator: React.FC = () => {
  const { language, isKm, tr } = useLanguage();
  const [inputText, setInputText] = useState<string>(RICH_CORPUS_SAMPLES[0].text);
  const [copied, setCopied] = useState<boolean>(false);
  const [filterView, setFilterView] = useState<'all' | 'clean_only' | 'flagged_only'>('all');

  // Interactive Quality Thresholds
  const [thresholds, setThresholds] = useState<QualityFilterThresholds>({
    maxUrlDensity: 5, // 5% max URL density
    boilerplateSensitivity: 'standard',
    minKhmerRatio: 50, // 50% min Khmer script chars
    minLineLength: 20 // 20 chars min line length
  });

  // Calculate detailed document quality report
  const report = useMemo(() => {
    return estimateCorpusQuality(inputText, thresholds, language);
  }, [inputText, thresholds, language]);

  const handleCopyCleaned = () => {
    if (!report.cleanedText) return;
    navigator.clipboard.writeText(report.cleanedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCleaned = () => {
    if (!report.cleanedText) return;
    const blob = new Blob([report.cleanedText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `khmer_purified_corpus_${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredLines = report.lineAssessments.filter(line => {
    if (filterView === 'clean_only') return line.isHighQuality;
    if (filterView === 'flagged_only') return !line.isHighQuality;
    return true;
  });

  const getVerdictBadge = (verdict: typeof report.verdict) => {
    switch (verdict) {
      case 'PRETRAIN_READY':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 font-mono text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>{tr('PRETRAIN READY (TIER 1/2 CANDIDATE)', 'រួចរាល់សម្រាប់បង្វឹក (កម្រិត 1/2)')}</span>
          </span>
        );
      case 'BORDERLINE_NEEDS_CLEANING':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-950/60 border border-amber-800/60 text-amber-300 font-mono text-xs font-semibold">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>{tr('BORDERLINE (PURGE NOISE BEFORE USE)', 'កម្រិតមធ្យម (ត្រូវសម្អាតមុនប្រើ)')}</span>
          </span>
        );
      case 'REJECTED_CONTAMINATED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-950/60 border border-rose-800/60 text-rose-300 font-mono text-xs font-semibold">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span>{tr('REJECTED (HEAVY CONTAMINATION)', 'បដិសេធ (មានភាពកខ្វក់ធ្ងន់ធ្ងរ)')}</span>
          </span>
        );
    }
  };

  const getCategoryBadge = (category: LineAssessment['category']) => {
    switch (category) {
      case 'clean':
        return <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">{tr('HIGH QUALITY PROSE', 'អត្ថបទគុណភាពខ្ពស់')}</span>;
      case 'url_dense':
        return <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">{tr('URL DENSE LINK', 'តំណ URL ច្រើន')}</span>;
      case 'boilerplate':
        return <span className="text-[10px] font-mono text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/40">{tr('BOILERPLATE / COPYRIGHT', 'ទម្រង់ដដែលៗ / កម្មសិទ្ធិបញ្ញា')}</span>;
      case 'casino_spam':
        return <span className="text-[10px] font-mono text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800/40">{tr('CASINO / TELEGRAM SPAM', 'សាររំខានកាស៊ីណូ / TELEGRAM')}</span>;
      case 'limon_legacy':
        return <span className="text-[10px] font-mono text-fuchsia-400 bg-fuchsia-950/60 px-2 py-0.5 rounded border border-fuchsia-800/40">{tr('LIMON ASCII FONT', 'ពុម្ពអក្សរ LIMON ASCII')}</span>;
      case 'fragment':
        return <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">{tr('FRAGMENT / SHORT LINE', 'បំណែក / បន្ទាត់ខ្លី')}</span>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider font-mono">
          <span>{tr('CORPUS HYGIENE WORKBENCH', 'តុប្រតិបត្តិការសម្អាតឃ្លាំងទិន្នន័យ')}</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span>{tr('NOISE & BOILERPLATE AUDITOR', 'កម្មវិធីសវនកម្មសំឡេងរំខាន និងទម្រង់ដដែលៗ')}</span>
        </div>
        <h2 className={`text-2xl sm:text-3xl font-bold text-white tracking-tight ${isKm ? 'font-khmer leading-relaxed' : ''}`}>
          {tr('Corpus Cleaning & Quality Estimator', 'កម្មវិធីសម្អាតឃ្លាំងទិន្នន័យ និងប៉ាន់ស្មានគុណភាព')}
        </h2>
        <p className={`text-sm text-slate-300 max-w-3xl leading-relaxed ${isKm ? 'font-khmer' : ''}`}>
          {tr(
            'Estimate the percentage of high-quality vs low-quality Khmer text based on URL density, navigational boilerplate, legacy Limon ASCII fonts, and repetition before ingesting into pretraining datasets.',
            'ប៉ាន់ស្មានភាគរយនៃអត្ថបទខ្មែរគុណភាពខ្ពស់ធៀបនឹងគុណភាពទាប ដោយផ្អែកលើដង់ស៊ីតេតំណ URL ម៉ឺនុយរុករកគេហទំព័រ ពុម្ពអក្សរ Limon ASCII ចាស់ និងភាពដដែលៗ មុនពេលបញ្ចូលទៅក្នុងទិន្នន័យបង្វឹកដំបូង។'
          )}
        </p>
      </div>

      {/* Preset Realistic Crawler Samples */}
      <div className="space-y-2">
        <div className="text-xs text-slate-400 font-mono">
          {tr('CHOOSE BENCHMARK CRAWL SAMPLE:', 'ជ្រើសរើសគំរូទិន្នន័យវាស់ស្ទង់៖')}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {RICH_CORPUS_SAMPLES.map((sample, idx) => {
            const isSelected = inputText === sample.text;
            return (
              <button
                key={idx}
                onClick={() => setInputText(sample.text)}
                className={`p-3 rounded-xl border text-left transition-all ${isKm ? 'font-khmer' : ''} ${
                  isSelected
                    ? 'bg-amber-400 text-slate-950 font-semibold border-amber-400 shadow-sm'
                    : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-900 hover:border-slate-700'
                }`}
              >
                <div className="text-xs font-semibold line-clamp-1">{isKm ? sample.nameKm : sample.name}</div>
                <div className={`text-[11px] line-clamp-2 mt-1 ${isSelected ? 'text-slate-900' : 'text-slate-400'}`}>
                  {isKm ? sample.descKm : sample.desc}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Primary Interactive Scoring Dashboard */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h3 className={`text-base font-bold text-white ${isKm ? 'font-khmer' : ''}`}>
                {tr('Quality Composition Meter', 'ឧបករណ៍វាស់សមាសភាពគុណភាព')}
              </h3>
            </div>
            <p className={`text-xs text-slate-400 ${isKm ? 'font-khmer' : ''}`}>
              {tr(
                'Interactive ratio of usable high-register Khmer prose vs. purged noise tokens.',
                'សមាមាត្រអន្តរកម្មនៃអត្ថបទខ្មែរកម្រិតខ្ពស់ដែលអាចប្រើបាន ធៀបនឹងថូខិនរំខានដែលបានលុបចោល។'
              )}
            </p>
          </div>
          <div>{getVerdictBadge(report.verdict)}</div>
        </div>

        {/* Visual Dual-Percentage Split Meter */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-emerald-400 font-bold flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              {tr('HIGH-QUALITY KHMER TEXT:', 'អត្ថបទខ្មែរគុណភាពខ្ពស់៖')} {report.highQualityPercent}%
            </span>
            <span className="text-rose-400 font-bold flex items-center gap-1.5">
              {tr('LOW-QUALITY NOISE:', 'ទិន្នន័យរំខានគុណភាពទាប៖')} {report.lowQualityPercent}%
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
            </span>
          </div>

          <div className="h-4 w-full bg-slate-950 rounded-full overflow-hidden flex border border-slate-800/80">
            <div
              style={{ width: `${report.highQualityPercent}%` }}
              className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-full transition-all duration-300"
              title={`${tr('High Quality', 'គុណភាពខ្ពស់')}: ${report.highQualityPercent}%`}
            />
            <div
              style={{ width: `${report.lowQualityPercent}%` }}
              className="bg-gradient-to-r from-rose-500 to-amber-500 h-full transition-all duration-300"
              title={`${tr('Noise & Boilerplate', 'ទិន្នន័យរំខាន')}: ${report.lowQualityPercent}%`}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1">
            <span>
              {tr('Retained:', 'រក្សាទុក៖')} {report.highQualityCharacters.toLocaleString()} {tr('chars', 'តួអក្សរ')} (~{report.estimatedRetainedTokens.toLocaleString()} {tr('tokens', 'ថូខិន')})
            </span>
            <span>
              {tr('Purged:', 'លុបចោល៖')} {report.lowQualityCharacters.toLocaleString()} {tr('chars', 'តួអក្សរ')} (~{report.estimatedPurgedTokens.toLocaleString()} {tr('tokens', 'ថូខិន')})
            </span>
          </div>
        </div>

        {/* Granular Noise Breakdown Indicators */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-2">
          {/* URL Density */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span className="flex items-center gap-1">
                <Link2 className="w-3 h-3 text-cyan-400" />
                <span>{tr('URL DENSITY', 'ដង់ស៊ីតេ URL')}</span>
              </span>
              <span className="tabular-nums">{report.urlCount} {tr('Links', 'តំណ')}</span>
            </div>
            <div className="text-xl font-bold font-mono text-cyan-400 tabular-nums">
              {report.urlDensityPercent}%
            </div>
            <div className={`text-[10px] text-slate-500 ${isKm ? 'font-khmer' : ''}`}>
              {report.urlDensityPercent > thresholds.maxUrlDensity
                ? tr('Exceeds limit', 'លើសកម្រិតកំណត់')
                : tr('Within budget', 'ស្ថិតក្នុងកម្រិតអនុញ្ញាត')}
            </div>
          </div>

          {/* Boilerplate Content */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span className="flex items-center gap-1">
                <FileCode className="w-3 h-3 text-amber-400" />
                <span>{tr('BOILERPLATE', 'ទម្រង់ដដែលៗ')}</span>
              </span>
              <span className="text-[10px]">{tr('Nav/Legal', 'ម៉ឺនុយ/ច្បាប់')}</span>
            </div>
            <div className="text-xl font-bold font-mono text-amber-400 tabular-nums">
              {report.boilerplatePercent}%
            </div>
            <div className={`text-[10px] text-slate-500 ${isKm ? 'font-khmer' : ''}`}>
              {tr('Copyright, terms & share buttons', 'កម្មសិទ្ធិបញ្ញា លក្ខខណ្ឌ និងប៊ូតុងចែករំលែក')}
            </div>
          </div>

          {/* Casino / Telegram Spam */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span className="flex items-center gap-1">
                <XCircle className="w-3 h-3 text-rose-400" />
                <span>{tr('BETTING SPAM', 'សាររំខានល្បែង')}</span>
              </span>
            </div>
            <div className="text-xl font-bold font-mono text-rose-400 tabular-nums">
              {report.spamPercent}%
            </div>
            <div className={`text-[10px] text-slate-500 ${isKm ? 'font-khmer' : ''}`}>
              {tr('Casino, Telegram & betting scams', 'កាស៊ីណូ Telegram និងល្បែងស៊ីសង')}
            </div>
          </div>

          {/* Limon Font */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>LIMON ASCII</span>
            </div>
            <div className="text-xl font-bold font-mono text-fuchsia-400 tabular-nums">
              {report.limonPercent}%
            </div>
            <div className={`text-[10px] text-slate-500 ${isKm ? 'font-khmer' : ''}`}>
              {tr('Legacy non-Unicode fonts', 'ពុម្ពអក្សរចាស់មិនមែនយូនីកូដ')}
            </div>
          </div>

          {/* Fragmented Lines */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>{tr('FRAGMENTS', 'បំណែកខ្លីៗ')}</span>
            </div>
            <div className="text-xl font-bold font-mono text-slate-300 tabular-nums">
              {report.fragmentationPercent}%
            </div>
            <div className={`text-[10px] text-slate-500 ${isKm ? 'font-khmer' : ''}`}>
              {tr(
                `Short menu tags < ${thresholds.minLineLength} chars`,
                `ស្លាកម៉ឺនុយខ្លី < ${thresholds.minLineLength} តួអក្សរ`
              )}
            </div>
          </div>
        </div>

        {/* Interactive Threshold Tuning Controls */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-amber-400" />
            <h4 className={`text-xs font-semibold text-white uppercase tracking-wider font-mono ${isKm ? 'font-khmer' : ''}`}>
              {tr('Corpus Hygiene Sensitivity Controls', 'ការកំណត់កម្រិតភាពរសើបនៃការសម្អាត')}
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-1">
            {/* Max URL Density */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className={`text-slate-300 ${isKm ? 'font-khmer' : ''}`}>
                  {tr('Max URL Density Threshold:', 'កម្រិតដង់ស៊ីតេ URL អតិបរមា៖')}
                </span>
                <span className="font-mono text-cyan-400 font-bold">{thresholds.maxUrlDensity}%</span>
              </div>
              <input
                type="range"
                min={1}
                max={20}
                value={thresholds.maxUrlDensity}
                onChange={(e) => setThresholds({ ...thresholds, maxUrlDensity: Number(e.target.value) })}
                className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
              <div className={`text-[10px] text-slate-500 ${isKm ? 'font-khmer' : ''}`}>
                {tr(
                  `Lines with > ${thresholds.maxUrlDensity}% link characters are dropped.`,
                  `បន្ទាត់ដែលមានតួអក្សរតំណភ្ជាប់ > ${thresholds.maxUrlDensity}% នឹងត្រូវលុបចោល។`
                )}
              </div>
            </div>

            {/* Min Line Length */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className={`text-slate-300 ${isKm ? 'font-khmer' : ''}`}>
                  {tr('Min Line Length (Drop Menus):', 'ប្រវែងបន្ទាត់អប្បបរមា៖')}
                </span>
                <span className="font-mono text-amber-400 font-bold">
                  {thresholds.minLineLength} {tr('chars', 'តួអក្សរ')}
                </span>
              </div>
              <input
                type="range"
                min={10}
                max={50}
                value={thresholds.minLineLength}
                onChange={(e) => setThresholds({ ...thresholds, minLineLength: Number(e.target.value) })}
                className="w-full accent-amber-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
              <div className={`text-[10px] text-slate-500 ${isKm ? 'font-khmer' : ''}`}>
                {tr(
                  'Discards isolated button tags, single words, and menu breadcrumbs.',
                  'លុបចោលស្លាកប៊ូតុង ពាក្យទោល និងតំណរុករកម៉ឺនុយដាច់ដោយឡែក។'
                )}
              </div>
            </div>

            {/* Min Khmer Purity */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className={`text-slate-300 ${isKm ? 'font-khmer' : ''}`}>
                  {tr('Min Khmer Script Purity:', 'ភាពសុទ្ធអក្សរខ្មែរអប្បបរមា៖')}
                </span>
                <span className="font-mono text-emerald-400 font-bold">{thresholds.minKhmerRatio}%</span>
              </div>
              <input
                type="range"
                min={30}
                max={80}
                value={thresholds.minKhmerRatio}
                onChange={(e) => setThresholds({ ...thresholds, minKhmerRatio: Number(e.target.value) })}
                className="w-full accent-emerald-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
              <div className={`text-[10px] text-slate-500 ${isKm ? 'font-khmer' : ''}`}>
                {tr(
                  'Filters out English-dominated or Thai-contaminated lines.',
                  'ច្រោះចោលបន្ទាត់ដែលលាយអក្សរអង់គ្លេសច្រើន ឬអក្សរថៃលាយឡំ។'
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Workbench: Raw Text Input + Color-Coded Line Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Editable Raw Document Input */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className={isKm ? 'font-khmer' : ''}>
              {tr(
                `Raw Web Crawl Text (${report.totalCharacters} chars · ~${report.totalWordsEstimate} words):`,
                `អត្ថបទទាញយកឆៅ (${report.totalCharacters} តួអក្សរ · ~${report.totalWordsEstimate} ពាក្យ)៖`
              )}
            </span>
            <button
              onClick={() => setInputText('')}
              className="text-[11px] text-slate-400 hover:text-rose-400 flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3 h-3" />
              <span>{tr('Clear Text', 'សម្អាតអត្ថបទ')}</span>
            </button>
          </div>

          <textarea
            rows={12}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={tr('Paste raw Khmer web text, OCR crawl, or news article here...', 'បិទភ្ជាប់អត្ថបទវេបខ្មែរឆៅ លទ្ធផល OCR ឬអត្ថបទព័ត៌មាននៅទីនេះ...')}
            className="w-full p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-white font-khmer text-sm focus:outline-none focus:border-amber-400 transition-colors leading-relaxed font-mono"
          />

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <span className="text-xs text-slate-500">
              {report.lineAssessments.length} {tr('total lines analyzed', 'បន្ទាត់សរុបត្រូវបានវិភាគ')}
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyCleaned}
                disabled={!report.cleanedText}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-40"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? tr('Copied Cleaned Text', 'បានចម្លងអត្ថបទស្អាត') : tr('Copy Cleaned Text', 'ចម្លងអត្ថបទស្អាត')}</span>
              </button>

              <button
                onClick={handleDownloadCleaned}
                disabled={!report.cleanedText}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors disabled:opacity-40"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{tr('Download .txt', 'ទាញយក .txt')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Line-by-Line Quality Auditor */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-amber-400" />
              <span className={isKm ? 'font-khmer' : ''}>
                {tr('Line-by-Line Quality Inspector:', 'កម្មវិធីត្រួតពិនិត្យគុណភាពតាមបន្ទាត់៖')}
              </span>
            </span>

            {/* Filter buttons */}
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-[11px]">
              <button
                onClick={() => setFilterView('all')}
                className={`px-2 py-0.5 rounded transition-colors ${
                  filterView === 'all' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {tr('All', 'ទាំងអស់')} ({report.lineAssessments.length})
              </button>
              <button
                onClick={() => setFilterView('clean_only')}
                className={`px-2 py-0.5 rounded transition-colors ${
                  filterView === 'clean_only' ? 'bg-emerald-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {tr('Retained', 'រក្សាទុក')} ({report.lineAssessments.filter(l => l.isHighQuality).length})
              </button>
              <button
                onClick={() => setFilterView('flagged_only')}
                className={`px-2 py-0.5 rounded transition-colors ${
                  filterView === 'flagged_only' ? 'bg-rose-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {tr('Purged', 'លុបចោល')} ({report.lineAssessments.filter(l => !l.isHighQuality).length})
              </button>
            </div>
          </div>

          {/* Scrollable Inspector List */}
          <div className="space-y-2 max-h-[440px] overflow-y-auto pr-1">
            {filteredLines.length === 0 ? (
              <div className={`p-8 text-center text-xs text-slate-500 rounded-xl border border-slate-800 bg-slate-900/30 ${isKm ? 'font-khmer' : ''}`}>
                {tr('No lines match the selected filter.', 'គ្មានបន្ទាត់ណាត្រូវនឹងតម្រងដែលបានជ្រើសឡើយ។')}
              </div>
            ) : (
              filteredLines.map((line) => (
                <div
                  key={line.id}
                  className={`p-3 rounded-xl border transition-all space-y-1.5 ${
                    line.isHighQuality
                      ? 'bg-emerald-950/20 border-emerald-800/40'
                      : 'bg-rose-950/20 border-rose-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {line.isHighQuality ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      )}
                      <span className="text-[10px] font-mono text-slate-400">
                        {tr('Line', 'បន្ទាត់')} {line.id + 1} ({line.charCount} {tr('chars', 'តួអក្សរ')})
                      </span>
                    </div>
                    {getCategoryBadge(line.category)}
                  </div>

                  <p className="text-xs text-slate-200 font-khmer leading-relaxed break-words">
                    {line.text}
                  </p>

                  {!line.isHighQuality && line.reasons.length > 0 && (
                    <div className="text-[10px] text-rose-300/90 font-mono flex items-center gap-1 pt-0.5">
                      <span className="font-semibold">{tr('Reason:', 'មូលហេតុ៖')}</span>
                      <span>{line.reasons.join(' · ')}</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Cleaned Output Preview Card */}
      <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <h4 className={`text-sm font-semibold text-white ${isKm ? 'font-khmer' : ''}`}>
              {tr(
                'Purified Pretraining Text Output (Ready for SentencePiece Tokenizer)',
                'លទ្ធផលអត្ថបទស្អាតសម្រាប់ការបង្វឹកដំបូង (រួចរាល់សម្រាប់ SentencePiece Tokenizer)'
              )}
            </h4>
          </div>
          <span className="text-xs font-mono text-emerald-400 font-semibold">
            {report.estimatedRetainedTokens.toLocaleString()} {tr('Clean Tokens', 'ថូខិនស្អាត')}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 max-h-48 overflow-y-auto">
          <p className="text-xs text-slate-300 font-khmer leading-relaxed whitespace-pre-wrap">
            {report.cleanedText || (
              <span className="text-slate-600 italic">
                {tr('No clean text retained from this sample.', 'គ្មានអត្ថបទស្អាតត្រូវបានរក្សាទុកពីគំរូនេះឡើយ។')}
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};
