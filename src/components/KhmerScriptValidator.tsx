import React, { useState, useMemo } from 'react';
import {
  validateKhmerScript,
  ValidationReport,
  ScriptValidationIssue
} from '../utils/khmerScriptValidator';
import { useLanguage } from '../contexts/LanguageContext';
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  RefreshCw,
  Wand2
} from 'lucide-react';

export const VALIDATOR_TEST_FIXTURES = [
  {
    name: 'Mixed Thai & Lao Intrusion',
    nameKm: 'ការលាយឡំអក្សរថៃ និងឡាវ',
    badge: 'Cross-Script',
    badgeKm: 'ឆ្លងភាសា',
    text: 'រាជរដ្ឋាភិបាលកម្ពុជាបានប្រកាសដាក់ចេញនូវផែនការយុទ្ធសាស្ត្រជាតិ สวัสดีครับ ภาษาไทยปนเป និងការអភិវឌ្ឍសង្គម ສະບាយດີ ឌីជីថល។',
    description: 'Cambodian government policy contaminated with Thai (สวัสดีครับ) and Lao (ສະບាយດີ) text from scraping.',
    descriptionKm: 'គោលនយោបាយរដ្ឋាភិបាលកម្ពុជាដែលមានលាយឡំអក្សរថៃ (สวัสดีครับ) និងឡាវ (ສະບាយດີ) ពីការទាញយកទិន្នន័យវេបសាយ។'
  },
  {
    name: 'Broken Subscript & Stacked Vowels',
    nameKm: 'ជើងព្យញ្ជនៈខូច និងស្រៈត្រួតគ្នា',
    badge: 'Invalid Orthography',
    badgeKm: 'អក្ខរាវិរុទ្ធខុស',
    text: 'ការសិក្សាភាសាខ្មែរ ្ក សិក្សាស្រាវជ្រាវ អាគារនេះមានកាើ គុណភាពខ្ពស់ និងសញ្ញា្្ត្រួតគ្នា ៉៉។',
    description: 'Contains dangling Coeng ( ្ក), double Coeng (្្), illegal stacked vowels (កាើ), and repeated diacritics (៉៉).',
    descriptionKm: 'មានសញ្ញាជើងនៅទំនេរ ( ្ក) ជើងពីរដង (្្) ស្រៈនិស្ស័យត្រួតគ្នា (កាើ) និងវណ្ណយុត្តិផ្ទួនគ្នា (៉៉)។'
  },
  {
    name: 'Missing ZWJ & Stray ZWNJ Glitches',
    nameKm: 'ខ្វះ ZWJ និងកំហុស ZWNJ / ZWSP',
    badge: 'Zero-Width Control',
    badgeKm: 'តួអក្សរ Zero-Width',
    text: 'វចនានុក្រមបង្ហាញព្យញ្ជនៈផ្ញើជើង ្ក និង ្ង ដោយគ្មាន ZWJ ព្រមទាំងតួអក្សរ ក\u200C្ម ដែលបំបែកដោយ ZWNJ និង ក\u200Bា ដែលបំបែកដោយ ZWSP។',
    description: 'Missing ZWJ in isolated subscripts ( ្ក), stray ZWNJ breaking ligature (ក‌្ម), and internal ZWSP split (ក​ា).',
    descriptionKm: 'ខ្វះ ZWJ លើជើងទោល ( ្ក), ZWNJ ផ្តាច់ជើង (ក‌្ម) និង ZWSP បំបែកព្យាង្គខាងក្នុង (ក​ា)។'
  },
  {
    name: 'Legacy Limon / ABC Font Keystrokes',
    nameKm: 'កូដពុម្ពអក្សរចាស់ Limon / ABC',
    badge: 'Legacy 8-bit',
    badgeKm: 'កូដចាស់ 8-bit',
    text: 'enHKitzaBitCa kñúM Kit eRkAR Edl bBa¢a mYy rbs; Gñk ក្នុងការបង្វឹកគំរូបញ្ញាសិប្បនិម្មិត។',
    description: 'Classic legacy Limon font keystroke fragments (kñúM, Edl, rbs;) that render as garbage in Unicode.',
    descriptionKm: 'បំណែកអក្សរពុម្ពចាស់ Limon (kñúM, Edl, rbs;) ដែលបង្ហាញជាអក្សរឥតន័យក្នុងយូនីកូដ។'
  },
  {
    name: 'Pristine Royal Academy Unicode',
    nameKm: 'យូនីកូដស្អាតតាមស្តង់ដាររាជបណ្ឌិត្យសភា',
    badge: '100% Compliant',
    badgeKm: 'អនុលោម ១០០%',
    text: 'ព្រះរាជាណាចក្រកម្ពុជា ជាតិ សាសនា ព្រះមហាក្សត្រ។ ក្រមរដ្ឋប្បវេណីនៃព្រះរាជាណាចក្រកម្ពុជា ត្រូវបានប្រកាសឱ្យប្រើប្រាស់ជាផ្លូវការដើម្បីធានានូវយុត្តិធម៌សង្គម។',
    description: 'Flawless canonical Unicode compliant with Unicode 16.4 and Royal Academy of Cambodia standards.',
    descriptionKm: 'យូនីកូដស្តង់ដារឥតខ្ចោះ អនុលោមតាម Unicode 16.4 និងស្តង់ដាររាជបណ្ឌិត្យសភាកម្ពុជា។'
  }
];

export const KhmerScriptValidator: React.FC = () => {
  const { language, isKm, tr } = useLanguage();
  const [inputText, setInputText] = useState<string>(VALIDATOR_TEST_FIXTURES[0].text);
  const [selectedIssueCategory, setSelectedIssueCategory] = useState<string>('all');
  const [copiedOriginal, setCopiedOriginal] = useState<boolean>(false);
  const [copiedRepaired, setCopiedRepaired] = useState<boolean>(false);
  const [activeHighlightIssue, setActiveHighlightIssue] = useState<ScriptValidationIssue | null>(null);

  // Compute live validation report
  const report: ValidationReport = useMemo(() => {
    return validateKhmerScript(inputText, language);
  }, [inputText, language]);

  const filteredIssues = useMemo(() => {
    if (selectedIssueCategory === 'all') return report.issues;
    return report.issues.filter(i => i.category === selectedIssueCategory);
  }, [report.issues, selectedIssueCategory]);

  const handleApplyFixture = (fixture: typeof VALIDATOR_TEST_FIXTURES[0]) => {
    setInputText(fixture.text);
    setActiveHighlightIssue(null);
  };

  const handleCopyOriginal = () => {
    navigator.clipboard.writeText(inputText);
    setCopiedOriginal(true);
    setTimeout(() => setCopiedOriginal(false), 2000);
  };

  const handleCopyRepaired = () => {
    navigator.clipboard.writeText(report.repairedText);
    setCopiedRepaired(true);
    setTimeout(() => setCopiedRepaired(false), 2000);
  };

  const handleApplyRepairedToInput = () => {
    setInputText(report.repairedText);
    setActiveHighlightIssue(null);
  };

  const getVerdictChip = (verdict: ValidationReport['verdict']) => {
    switch (verdict) {
      case 'PRISTINE_UNICODE':
        return (
          <div className="px-3 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 flex items-center gap-2 font-mono text-xs font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>{tr('PRISTINE KHMER UNICODE (TR31 COMPLIANT)', 'យូនីកូដខ្មែរស្អាតសុទ្ធ (អនុលោមតាម TR31)')}</span>
          </div>
        );
      case 'REPAIRABLE_ISSUES':
        return (
          <div className="px-3 py-1.5 rounded-xl bg-amber-950/80 border border-amber-800 text-amber-300 flex items-center gap-2 font-mono text-xs font-bold">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>{tr('REPAIRABLE ORTHOGRAPHIC ANOMALIES', 'មានកំហុសអក្ខរាវិរុទ្ធដែលអាចជួសជុលបាន')}</span>
          </div>
        );
      case 'HIGHLY_CONTAMINATED':
        return (
          <div className="px-3 py-1.5 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 flex items-center gap-2 font-mono text-xs font-bold">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span>{tr('HIGHLY CONTAMINATED / CROSS-SCRIPT NOISE', 'មានការបំពុលខ្ពស់ / លាយឡំអក្សរឆ្លងភាសា')}</span>
          </div>
        );
    }
  };

  const getSeverityBadge = (severity: ScriptValidationIssue['severity']) => {
    switch (severity) {
      case 'CRITICAL':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-950 text-rose-300 border border-rose-800 uppercase">
            {tr('Critical Error', 'កំហុសធ្ងន់ធ្ងរ')}
          </span>
        );
      case 'WARNING':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-800 uppercase">
            {tr('Warning', 'ការព្រមាន')}
          </span>
        );
      case 'NOTICE':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700 uppercase">
            {tr('Notice', 'កំណត់សម្គាល់')}
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider font-mono">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{tr('REAL-TIME KHMER SCRIPT VALIDATOR', 'កម្មវិធីផ្ទៀងផ្ទាត់អក្សរខ្មែរផ្ទាល់')}</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>{tr('UNICODE STANDARD 16.4 & TR31 ENGINE', 'ម៉ាស៊ីនស្តង់ដារ UNICODE 16.4 & TR31')}</span>
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight">
            {tr('Orthography, Cross-Script Intrusion & Zero-Width Joiner Auditor', 'អ្នកសវនកម្មអក្ខរាវិរុទ្ធ ការជ្រៀតជ្រែកភាសា និង Zero-Width Joiner')}
          </h3>
          <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">
            {tr(
              'Evaluates raw pretraining text in real-time for illegal subscript stacking (ជើង ្), cross-script Thai/Lao intrusion, missing Zero-Width Joiners (ZWJ), stray ZWNJ, and legacy Limon ASCII artifacts.',
              'វាយតម្លៃអត្ថបទបង្វឹកដើមភ្លាមៗ រកមើលការដាក់ជើងព្យញ្ជនៈខុសក្បួន (ជើង ្) ការជ្រៀតជ្រែកអក្សរថៃ/ឡាវ កង្វះ Zero-Width Joiner (ZWJ) តួអក្សរ ZWNJ ខុសទីតាំង និងពុម្ពអក្សរចាស់ Limon ASCII។'
            )}
          </p>
        </div>

        {/* Verdict Display */}
        <div className="shrink-0">
          {getVerdictChip(report.verdict)}
        </div>
      </div>

      {/* Preset Test Case Fixtures */}
      <div className="space-y-2">
        <div className="text-xs font-mono text-slate-400 flex items-center justify-between">
          <span>{tr('SELECT KNOWN TEST ANOMALY FIXTURE:', 'ជ្រើសរើសករណីសាកល្បងកំហុសគំរូ៖')}</span>
          <span className="text-[11px] text-slate-500">{tr('Click to load and observe validator diagnostics', 'ចុចដើម្បីផ្ទុក និងពិនិត្យលទ្ធផលវិភាគ')}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {VALIDATOR_TEST_FIXTURES.map((fixture, idx) => (
            <button
              key={idx}
              onClick={() => handleApplyFixture(fixture)}
              className={`px-3 py-1.5 text-xs rounded-lg border transition-all flex items-center gap-2 ${
                inputText === fixture.text
                  ? 'bg-amber-400 text-slate-950 font-bold border-amber-400 shadow-sm'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <span>{isKm ? fixture.nameKm : fixture.name}</span>
              <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                inputText === fixture.text ? 'bg-slate-950 text-amber-300' : 'bg-slate-950 text-slate-400'
              }`}>
                {isKm ? fixture.badgeKm : fixture.badge}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Text Input & Visual Metrics Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Live Input & Quick Actions */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{tr('Input Text to Validate (Khmer Pretraining Extract):', 'អត្ថបទដែលត្រូវផ្ទៀងផ្ទាត់៖')}</span>
            <div className="flex items-center gap-2 font-mono text-[11px]">
              <span className="text-amber-400">{inputText.length} {tr('characters', 'តួអក្សរ')}</span>
              <span className="text-slate-600">·</span>
              <span className={report.issues.length > 0 ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                {report.issues.length} {tr(report.issues.length === 1 ? 'issue detected' : 'issues detected', 'កំហុសត្រូវបានរកឃើញ')}
              </span>
            </div>
          </div>

          <div className="relative">
            <textarea
              rows={6}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={tr('Paste Khmer text here for real-time validation...', 'បិទភ្ជាប់អត្ថបទជាភាសាខ្មែរនៅទីនេះដើម្បីធ្វើសវនកម្ម...')}
              className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 text-white font-khmer text-sm leading-relaxed focus:outline-none focus:border-amber-400 transition-colors"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-2 text-xs font-mono">
              <button
                onClick={handleCopyOriginal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors"
              >
                {copiedOriginal ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedOriginal ? tr('Copied', 'បានចម្លង') : tr('Copy Input', 'ចម្លងអត្ថបទដើម')}</span>
              </button>

              <button
                onClick={() => setInputText('')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{tr('Clear', 'សម្អាត')}</span>
              </button>
            </div>

            {report.repairCount > 0 && (
              <button
                onClick={handleApplyRepairedToInput}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-mono font-bold text-xs hover:bg-emerald-400 transition-colors shadow-sm cursor-pointer"
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>{tr(`One-Click Auto-Repair (${report.repairCount} fixes)`, `ជួសជុលដោយស្វ័យប្រវត្តិ (${report.repairCount} កំណែ)`)}</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Purity Score & Script Distribution Gauge */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400 uppercase">{tr('SCRIPT PURITY SCORE', 'ពិន្ទុភាពសុទ្ធនៃអក្សរ')}</span>
              <span className="text-[10px] font-mono text-slate-500">{tr('Unicode Metric', 'ស្តង់ដារយូនីកូដ')}</span>
            </div>

            <div className="flex items-baseline gap-3">
              <span className={`text-4xl font-extrabold font-mono tabular-nums ${
                report.purityScore >= 90 ? 'text-emerald-400' : report.purityScore >= 60 ? 'text-amber-400' : 'text-rose-400'
              }`}>
                {report.purityScore}%
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {report.purityScore >= 90
                  ? tr('High-Grade Pretrain Ready', 'កម្រិតខ្ពស់រួចរាល់សម្រាប់បង្វឹក')
                  : report.purityScore >= 60
                    ? tr('Needs Automated Repair', 'ត្រូវការការជួសជុលស្វ័យប្រវត្តិ')
                    : tr('Severe Contamination', 'មានការបំពុលធ្ងន់ធ្ងរ')}
              </span>
            </div>

            {/* Script Composition Stacked Bar */}
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-[11px] font-mono text-slate-400">
                <span>{tr('CHARACTER SCRIPT COMPOSITION:', 'សមាសភាពតួអក្សរតាមភាសា៖')}</span>
                <span className="text-amber-400 font-bold">{report.distribution.khmerPercent}% {tr('Khmer', 'ខ្មែរ')}</span>
              </div>

              <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden flex">
                <div
                  style={{ width: `${report.distribution.khmerPercent}%` }}
                  className="bg-amber-400 h-full"
                  title={`${tr('Khmer', 'ខ្មែរ')}: ${report.distribution.khmerPercent}% (${report.distribution.khmerCharCount})`}
                />
                <div
                  style={{ width: `${report.distribution.thaiPercent}%` }}
                  className="bg-rose-500 h-full"
                  title={`${tr('Thai Intrusion', 'អក្សរថៃ')}: ${report.distribution.thaiPercent}% (${report.distribution.thaiCharCount})`}
                />
                <div
                  style={{ width: `${report.distribution.laoPercent}%` }}
                  className="bg-violet-500 h-full"
                  title={`${tr('Lao Intrusion', 'អក្សរឡាវ')}: ${report.distribution.laoPercent}% (${report.distribution.laoCharCount})`}
                />
                <div
                  style={{ width: `${report.distribution.latinPercent}%` }}
                  className="bg-cyan-400 h-full"
                  title={`${tr('Latin', 'ឡាតាំង')}: ${report.distribution.latinPercent}% (${report.distribution.latinCharCount})`}
                />
                <div
                  style={{ width: `${report.distribution.numericPercent}%` }}
                  className="bg-emerald-400 h-full"
                  title={`${tr('Numeric', 'លេខ')}: ${report.distribution.numericPercent}% (${report.distribution.numericCharCount})`}
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                <div className="flex items-center justify-between p-2 rounded bg-slate-900/60 border border-slate-800">
                  <span className="text-amber-400">{tr('Khmer:', 'ខ្មែរ៖')}</span>
                  <span className="text-white font-bold">{report.distribution.khmerPercent}%</span>
                </div>
                <div className={`flex items-center justify-between p-2 rounded border ${
                  report.distribution.thaiPercent > 0 ? 'bg-rose-950/30 border-rose-800 text-rose-300' : 'bg-slate-900/60 border-slate-800 text-slate-400'
                }`}>
                  <span>{tr('Thai Intrusion:', 'អក្សរថៃ៖')}</span>
                  <span className="font-bold">{report.distribution.thaiPercent}%</span>
                </div>
                <div className={`flex items-center justify-between p-2 rounded border ${
                  report.distribution.laoPercent > 0 ? 'bg-violet-950/30 border-violet-800 text-violet-300' : 'bg-slate-900/60 border-slate-800 text-slate-400'
                }`}>
                  <span>{tr('Lao Intrusion:', 'អក្សរឡាវ៖')}</span>
                  <span className="font-bold">{report.distribution.laoPercent}%</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-slate-900/60 border border-slate-800 text-slate-400">
                  <span>Zero-Width:</span>
                  <span className="text-cyan-300 font-bold">{report.distribution.zeroWidthCount} {tr('glyphs', 'តួ')}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400 font-mono flex items-center justify-between">
            <span className="text-rose-400 font-bold">{report.stats.criticalCount} {tr('Critical', 'ធ្ងន់ធ្ងរ')}</span>
            <span>·</span>
            <span className="text-amber-400 font-bold">{report.stats.warningCount} {tr('Warnings', 'ព្រមាន')}</span>
            <span>·</span>
            <span className="text-slate-400">{report.stats.noticeCount} {tr('Notices', 'កំណត់សម្គាល់')}</span>
          </div>
        </div>
      </div>

      {/* Issues Diagnostic Breakdown Panel */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <h4 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
              {tr(`Diagnosed Script Anomalies (${filteredIssues.length})`, `ភាពមិនប្រក្រតីនៃអក្សរដែលបានរកឃើញ (${filteredIssues.length})`)}
            </h4>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
            {[
              { id: 'all', label: tr('All Issues', 'កំហុសទាំងអស់') },
              { id: 'improper_encoding', label: tr('Invalid Orthography', 'អក្ខរាវិរុទ្ធខុស') },
              { id: 'cross_script_noise', label: tr('Cross-Script (Thai/Lao)', 'ឆ្លងភាសា (ថៃ/ឡាវ)') },
              { id: 'zero_width_issue', label: tr('ZWJ / Zero-Width', 'ZWJ / Zero-Width') },
              { id: 'legacy_limon', label: tr('Legacy Limon', 'ពុម្ព Limon ចាស់') }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedIssueCategory(cat.id)}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  selectedIssueCategory === cat.id
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {filteredIssues.length === 0 ? (
          <div className="p-6 rounded-2xl bg-emerald-950/20 border border-emerald-900/40 text-emerald-300 text-xs flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <strong className="block font-mono text-sm">
                {tr('Zero Orthographic or Cross-Script Anomalies', 'គ្មានកំហុសអក្ខរាវិរុទ្ធ ឬការជ្រៀតជ្រែកភាសាឡើយ')}
              </strong>
              <span>
                {tr(
                  'Text fully adheres to Unicode Consortium Chapter 16.4 and Royal Academy of Cambodia Khmer orthography standards.',
                  'អត្ថបទអនុលោមពេញលេញតាមស្តង់ដារ Unicode Consortium ជំពូក 16.4 និងអក្ខរាវិរុទ្ធនៃរាជបណ្ឌិត្យសភាកម្ពុជា។'
                )}
              </span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredIssues.map((issue) => (
              <div
                key={issue.id}
                onClick={() => setActiveHighlightIssue(issue)}
                className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2.5 ${
                  activeHighlightIssue?.id === issue.id
                    ? 'bg-slate-900 border-amber-400 shadow-md shadow-amber-950/20'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-bold text-white flex items-center gap-1.5">
                    {issue.title}
                  </span>
                  {getSeverityBadge(issue.severity)}
                </div>

                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="text-slate-500">{tr('Flagged Snippet:', 'បំណែកមានបញ្ហា៖')}</span>
                  <code className="px-2 py-0.5 rounded bg-rose-950/60 text-rose-300 border border-rose-800/60 font-khmer font-bold">
                    {issue.snippet}
                  </code>
                  <span className="text-slate-500 text-[10px]">{tr('Index:', 'ទីតាំង៖')} {issue.startIndex}</span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {issue.explanation}
                </p>

                <div className="pt-2 border-t border-slate-900 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-400">
                  <span className="truncate max-w-[200px]" title={issue.regexPattern}>
                    Regex: <code className="text-amber-400/90">{issue.regexPattern}</code>
                  </span>
                  {issue.suggestedFix && (
                    <span className="text-emerald-400 font-semibold">{issue.suggestedFix}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cleaned & Repaired Text Card */}
      {report.repairedText && (
        <div className="p-6 rounded-2xl border border-emerald-900/40 bg-slate-950 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-400 uppercase">
                <Wand2 className="w-4 h-4" />
                <span>{tr('Sanitized & Repaired Output', 'លទ្ធផលអត្ថបទដែលបានសម្អាត និងជួសជុលរួច')}</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {tr(
                  'Purged Thai/Lao intrusion, resolved illegal Coeng stacking, normalized missing ZWJ on isolated subscripts, and trimmed invisible zero-width noise.',
                  'បានលុបអក្សរថៃ/ឡាវ កែតម្រូវជើងព្យញ្ជនៈត្រួតខុសក្បួន បន្ថែម ZWJ ដែលបាត់លើជើងទោល និងសម្អាតតួអក្សរ Zero-Width ឥតប្រយោជន៍។'
                )}
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono">
              <button
                onClick={handleCopyRepaired}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 transition-colors shadow-sm"
              >
                {copiedRepaired ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedRepaired ? tr('Copied Repaired Text', 'បានចម្លងអត្ថបទស្អាត') : tr('Copy Repaired Text', 'ចម្លងអត្ថបទជួសជុលរួច')}</span>
              </button>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 font-khmer text-sm text-emerald-200 leading-relaxed whitespace-pre-wrap select-all">
            {report.repairedText}
          </div>
        </div>
      )}
    </div>
  );
};
