import React, { useState } from 'react';
import { KHMER_RESOURCES } from '../data/khmerResources';
import { DatasetTier, KhmerResource } from '../types';
import { KhmerRagPipelineSimulator } from './KhmerRagPipelineSimulator';
import { KhmerScriptValidator } from './KhmerScriptValidator';
import { useLanguage } from '../contexts/LanguageContext';
import khmerCorpusImg from '../assets/images/khmer_corpus_curation_1794452345081.jpg';
import {
  ExternalLink,
  CheckCircle2,
  Sliders,
  Filter,
  Sparkles,
  BookOpen,
  Scale,
  GraduationCap,
  Newspaper,
  Globe,
  Cpu,
  Database,
  ShieldCheck
} from 'lucide-react';

export const DataPrioritizationMatrix: React.FC = () => {
  const { isKm, tr } = useLanguage();
  const [activeSubTab, setActiveSubTab] = useState<'matrix' | 'rag_pipeline' | 'script_validator'>('matrix');
  const [selectedTier, setSelectedTier] = useState<DatasetTier | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeResource, setActiveResource] = useState<KhmerResource>(KHMER_RESOURCES[0]);

  // Interactive Corpus Mixture Weights (Default optimal distribution)
  const [tier1Weight, setTier1Weight] = useState<number>(35);
  const [tier2Weight, setTier2Weight] = useState<number>(30);
  const [tier3Weight, setTier3Weight] = useState<number>(20);
  const [tier4Weight, setTier4Weight] = useState<number>(15);
  const [targetCorpusB, setTargetCorpusB] = useState<number>(50); // 50 Billion tokens

  const filteredResources = KHMER_RESOURCES.filter(res => {
    if (selectedTier !== 'all' && res.tier !== selectedTier) return false;
    if (selectedCategory !== 'all' && res.category !== selectedCategory) return false;
    return true;
  });

  const getTierBadge = (tier: DatasetTier) => {
    switch (tier) {
      case 'tier1':
        return <span className="text-amber-400 font-semibold">{tr('Tier 1 · Gold Standard (3x-5x Upsampled)', 'កម្រិត ១ · ស្តង់ដារមាស (សំណាកលើស 3x-5x)')}</span>;
      case 'tier2':
        return <span className="text-cyan-400 font-semibold">{tr('Tier 2 · High-Register Editorial', 'កម្រិត ២ · អត្ថបទវិចារណកថាថ្នាក់ខ្ពស់')}</span>;
      case 'tier3':
        return <span className="text-indigo-400 font-semibold">{tr('Tier 3 · Aggressively Cleaned Web', 'កម្រិត ៣ · ទិន្នន័យវេបសាយចម្រោះស្អាត')}</span>;
      case 'tier4':
        return <span className="text-emerald-400 font-semibold">{tr('Tier 4 · Synthetic Instruction', 'កម្រិត ៤ · ទិន្នន័យសំយោគ SFT')}</span>;
    }
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'all': return tr('All', 'ទាំងអស់');
      case 'literature': return tr('literature', 'អក្សរសិល្ប៍');
      case 'legal_official': return tr('legal official', 'ច្បាប់ និងរដ្ឋបាល');
      case 'education': return tr('education', 'ការអប់រំ');
      case 'news': return tr('news', 'សារព័ត៌មាន');
      case 'academic': return tr('academic', 'ការសិក្សាស្រាវជ្រាវ');
      case 'web_crawl': return tr('web crawl', 'វេបសាយទូទៅ');
      case 'synthetic': return tr('synthetic', 'សំយោគ AI');
      default: return cat.replace('_', ' ');
    }
  };

  const getAccessLabel = (status: string) => {
    switch (status) {
      case 'open_public': return tr('open public', 'បើកទូលាយសាធារណៈ');
      case 'scrapable': return tr('scrapable', 'អាចប្រមូលពីវេប');
      case 'institution_request': return tr('institution request', 'ស្នើសុំពីស្ថាប័ន');
      case 'synthesized': return tr('synthesized', 'ផលិតដោយសំយោគ');
      default: return status.replace('_', ' ');
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'literature': return <BookOpen className="w-4 h-4 text-amber-400" />;
      case 'legal_official': return <Scale className="w-4 h-4 text-rose-400" />;
      case 'education': return <GraduationCap className="w-4 h-4 text-emerald-400" />;
      case 'news': return <Newspaper className="w-4 h-4 text-cyan-400" />;
      case 'academic': return <Cpu className="w-4 h-4 text-violet-400" />;
      case 'web_crawl': return <Globe className="w-4 h-4 text-blue-400" />;
      default: return <Sparkles className="w-4 h-4 text-emerald-400" />;
    }
  };

  return (
    <div className="space-y-10">
      {/* Section Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider font-mono">
          <span>{tr('CORPUS CURATION ARCHITECTURE', 'ស្ថាបត្យកម្មចម្រោះឃ្លាំងទិន្នន័យ')}</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span>{tr('PRIORITIZATION HIERARCHY', 'ឋានានុក្រមអាទិភាព')}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          {tr('Khmer Training Data Prioritization Matrix', 'ម៉ាទ្រីសកំណត់អាទិភាពទិន្នន័យបង្វឹកភាសាខ្មែរ')}
        </h2>
        <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
          {tr(
            'The primary failure mode of low-resource language LLMs is training on contaminated, low-quality web crawls filled with broken non-Unicode ASCII fonts (Limon), casino spam, and machine-translated gibberish. We prioritize data in four strictly audited tiers.',
            'មូលហេតុបរាជ័យចម្បងនៃ LLM សម្រាប់ភាសាធនធានតិច គឺការបង្វឹកលើទិន្នន័យវេបសាយកខ្វក់ ដែលពេញដោយពុម្ពអក្សរចាស់ Limon មិនមែនយូនីកូដ សារល្បែងកាស៊ីណូ និងអត្ថបទបកប្រែខូចន័យ។ យើងកំណត់អាទិភាពទិន្នន័យជា ៤ កម្រិតដែលបានត្រួតពិនិត្យយ៉ាងតឹងរ៉ឹង។'
          )}
        </p>
      </div>

      {/* Data Matrix Sub-tab Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveSubTab('matrix')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-semibold transition-colors ${
            activeSubTab === 'matrix'
              ? 'bg-amber-400 text-slate-950 shadow-sm font-bold'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>{tr('1. Pretraining Corpus Matrix & Weights', '១. ម៉ាទ្រីសទិន្នន័យ និងសមាមាត្របង្វឹក')}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('rag_pipeline')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-semibold transition-colors ${
            activeSubTab === 'rag_pipeline'
              ? 'bg-cyan-400 text-slate-950 shadow-sm font-bold'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>{tr('2. Khmer PDF RAG Ingestion Pipeline', '២. ខ្សែសង្វាក់ RAG សម្រាប់ឯកសារ PDF ខ្មែរ')}</span>
          <span className="px-1.5 py-0.2 rounded text-[10px] bg-cyan-950/60 text-cyan-300 border border-cyan-500/40 font-mono">
            {tr('Interactive Simulator', 'កម្មវិធីពិសោធន៍')}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('script_validator')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-semibold transition-colors ${
            activeSubTab === 'script_validator'
              ? 'bg-emerald-400 text-slate-950 shadow-sm font-bold'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>{tr('3. Real-Time Khmer Script Validator', '៣. កម្មវិធីផ្ទៀងផ្ទាត់អក្សរខ្មែរផ្ទាល់')}</span>
          <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 font-mono">
            {tr('Live Regex', 'Regex ផ្ទាល់')}
          </span>
        </button>
      </div>

      {activeSubTab === 'script_validator' ? (
        <KhmerScriptValidator />
      ) : activeSubTab === 'rag_pipeline' ? (
        <KhmerRagPipelineSimulator />
      ) : (
        <div className="space-y-10">
          {/* Visual Pipeline Banner & Key Takeaways */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-7 rounded-2xl overflow-hidden border border-slate-800 bg-slate-900/40 p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white">
              {tr('The Golden Rule of Khmer Pretraining Data', 'គោលការណ៍មាសនៃទិន្នន័យបង្វឹកភាសាខ្មែរ')}
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {tr(
                'Because pure native Khmer text on the internet is relatively scarce (~5B to 10B total tokens before filtering), you must NOT treat all tokens equally. High-register texts from the Buddhist Institute and National Legal Codes provide dense syntactic grounding and should be repeated (upsampled 3x to 5x) during training without overfitting.',
                'ដោយសារអត្ថបទខ្មែរដើមសុទ្ធលើអ៊ីនធឺណិតមានកម្រិត (~5B ដល់ 10B ថូខិនមុនចម្រោះ) អ្នកមិនត្រូវចាត់ទុកថូខិនទាំងអស់ស្មើគ្នាឡើយ។ អត្ថបទផ្លូវការពីពុទ្ធសាសនបណ្ឌិត្យ និងក្រមច្បាប់ជាតិ ផ្តល់គ្រឹះវេយ្យាករណ៍រឹងមាំ ហើយគួរត្រូវធ្វើសំណាកលើស (3x ទៅ 5x) កំឡុងពេលបង្វឹក។'
              )}
            </p>
            <div className="space-y-2 pt-2">
              <div className="flex items-start gap-2.5 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white">{tr('Tier 1 (Ground Truth):', 'កម្រិត ១ (ទិន្នន័យស្តង់ដារខ្ពស់បំផុត)៖')}</strong>{' '}
                  {tr(
                    'Upweight to 35% of total epochs. Contains pure Pali-Khmer morphology and zero OCR distortion.',
                    'ដំឡើងទម្ងន់ដល់ ៣៥% នៃ Epoch សរុប។ មានរូបសាស្ត្របាលី-ខ្មែរសុទ្ធ និងគ្មានកំហុស OCR។'
                  )}
                </span>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white">{tr('Tier 2 (News & Academia):', 'កម្រិត ២ (សារព័ត៌មាន និងសិក្សា)៖')}</strong>{' '}
                  {tr(
                    '30% of total mix. Supplies contemporary technical, economic, and geopolitical discourse.',
                    '៣០% នៃទិន្នន័យសរុប។ ផ្តល់បច្ចេកសព្ទសម័យថ្មី សេដ្ឋកិច្ច និងភូមិសាស្ត្រនយោបាយ។'
                  )}
                </span>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white">{tr('Tier 3 (Web Crawls):', 'កម្រិត ៣ (ទិន្នន័យវេបសាយ)៖')}</strong>{' '}
                  {tr(
                    'Cap at 20%. Only ingest after passing FastText > 0.85, MinHash deduplication, and Limon/Casino removal.',
                    'កំណត់ត្រឹម ២០%។ បញ្ចូលបានលុះត្រាតែឆ្លងកាត់ FastText > 0.85, MinHash លុបស្ទួន និងកម្ចាត់ Limon/កាស៊ីណូ។'
                  )}
                </span>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white">{tr('Tier 4 (Culturally Localized Synthetic):', 'កម្រិត ៤ (ទិន្នន័យសំយោគតាមវប្បធម៌ខ្មែរ)៖')}</strong>{' '}
                  {tr(
                    '15% of mix. Translated and adapted LIMA/UltraChat for multi-turn reasoning and politeness.',
                    '១៥% នៃទិន្នន័យសរុប។ សម្របពី LIMA/UltraChat ដើម្បីបង្កើនការគិតវិភាគ និងសុជីវធម៌ខ្មែរ។'
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 rounded-2xl overflow-hidden border border-slate-800 bg-slate-900/60 flex flex-col">
          <img
            src={khmerCorpusImg}
            alt={tr('Multi-stage Khmer corpus data processing pipeline visual', 'រូបភាពបង្ហាញដំណាក់កាលដំណើរការឃ្លាំងទិន្នន័យភាសាខ្មែរ')}
            className="w-full h-48 object-cover object-top"
            referrerPolicy="no-referrer"
          />
          <div className="p-4 space-y-1 flex-1 flex flex-col justify-center bg-slate-900/80">
            <div className="text-xs font-mono text-cyan-300">
              {tr('CORPUS HYGIENE WORKFLOW', 'លំហូរការងារសម្អាតឃ្លាំងទិន្នន័យ')}
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {tr(
                'Raw Manuscripts & Web -> OCR & Text Extraction -> Limon Stripper -> Unicode Canonical Ordering -> FastText LID -> MinHash Deduplication.',
                'ឯកសារដើម & វេប -> OCR & ទាញយកអត្ថបទ -> លុបពុម្ព Limon -> តម្រៀបយូនីកូដស្តង់ដារ -> FastText LID -> លុបស្ទួន MinHash។'
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Corpus Mixture Calculator */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-400" />
              <h3 className="text-base font-semibold text-white">
                {tr('Pretraining Token Mixture Simulator', 'កម្មវិធីគណនាសមាមាត្រថូខិនបង្វឹក')}
              </h3>
            </div>
            <p className="text-xs text-slate-400">
              {tr(
                'Adjust your target token budget and tier weighting to calculate the required data volume and upsampling factors.',
                'កែសម្រួលគោលដៅថូខិន និងទម្ងន់តាមកម្រិត ដើម្បីគណនាបរិមាណទិន្នន័យ និងមេគុណធ្វើសំណាកលើស។'
              )}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">{tr('Target Pretrain Tokens:', 'គោលដៅថូខិនបង្វឹក៖')}</span>
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
              {[30, 50, 100].map(val => (
                <button
                  key={val}
                  onClick={() => setTargetCorpusB(val)}
                  className={`px-2.5 py-1 text-xs font-mono font-medium rounded-md transition-colors ${
                    targetCorpusB === val ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {val}B
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Sliders */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-2 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="flex justify-between text-xs">
              <span className="text-amber-400 font-semibold">{tr('Tier 1 (Gold Standard)', 'កម្រិត ១ (ស្តង់ដារមាស)')}</span>
              <span className="font-mono text-white tabular-nums font-bold">{tier1Weight}%</span>
            </div>
            <input
              type="range"
              min={10}
              max={60}
              value={tier1Weight}
              onChange={(e) => setTier1Weight(Number(e.target.value))}
              className="w-full accent-amber-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="text-[11px] text-slate-400 pt-1 font-mono">
              {tr('Tokens:', 'ថូខិន៖')} {((targetCorpusB * tier1Weight) / 100).toFixed(1)}B {tr('tokens', 'ថូខិន')}
              <div className="text-amber-300/80">{tr('Est. 4.2x upsampling needed', 'ប៉ាន់ស្មានត្រូវការ 4.2x upsampling')}</div>
            </div>
          </div>

          <div className="space-y-2 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="flex justify-between text-xs">
              <span className="text-cyan-400 font-semibold">{tr('Tier 2 (High News/Academic)', 'កម្រិត ២ (ព័ត៌មាន/សិក្សា)')}</span>
              <span className="font-mono text-white tabular-nums font-bold">{tier2Weight}%</span>
            </div>
            <input
              type="range"
              min={10}
              max={50}
              value={tier2Weight}
              onChange={(e) => setTier2Weight(Number(e.target.value))}
              className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="text-[11px] text-slate-400 pt-1 font-mono">
              {tr('Tokens:', 'ថូខិន៖')} {((targetCorpusB * tier2Weight) / 100).toFixed(1)}B {tr('tokens', 'ថូខិន')}
              <div className="text-cyan-300/80">{tr('Est. 1.8x upsampling', 'ប៉ាន់ស្មាន 1.8x upsampling')}</div>
            </div>
          </div>

          <div className="space-y-2 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="flex justify-between text-xs">
              <span className="text-indigo-400 font-semibold">{tr('Tier 3 (Filtered Web)', 'កម្រិត ៣ (វេបចម្រោះស្អាត)')}</span>
              <span className="font-mono text-white tabular-nums font-bold">{tier3Weight}%</span>
            </div>
            <input
              type="range"
              min={5}
              max={40}
              value={tier3Weight}
              onChange={(e) => setTier3Weight(Number(e.target.value))}
              className="w-full accent-indigo-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="text-[11px] text-slate-400 pt-1 font-mono">
              {tr('Tokens:', 'ថូខិន៖')} {((targetCorpusB * tier3Weight) / 100).toFixed(1)}B {tr('tokens', 'ថូខិន')}
              <div className="text-indigo-300/80">{tr('Single pass (1 epoch)', 'ឆ្លងកាត់ម្តង (1 epoch)')}</div>
            </div>
          </div>

          <div className="space-y-2 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="flex justify-between text-xs">
              <span className="text-emerald-400 font-semibold">{tr('Tier 4 (Synthetic Reasoning)', 'កម្រិត ៤ (សំយោគតក្កវិជ្ជា)')}</span>
              <span className="font-mono text-white tabular-nums font-bold">{tier4Weight}%</span>
            </div>
            <input
              type="range"
              min={5}
              max={30}
              value={tier4Weight}
              onChange={(e) => setTier4Weight(Number(e.target.value))}
              className="w-full accent-emerald-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="text-[11px] text-slate-400 pt-1 font-mono">
              {tr('Tokens:', 'ថូខិន៖')} {((targetCorpusB * tier4Weight) / 100).toFixed(1)}B {tr('tokens', 'ថូខិន')}
              <div className="text-emerald-300/80">{tr('Enforces math & logic', 'ពង្រឹងគណិត និងតក្កវិជ្ជា')}</div>
            </div>
          </div>
        </div>

        {/* Visual Stacked Bar of the Distribution */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[11px] text-slate-400 font-mono">
            <span>
              {tr(
                `CORPUS TOKENS DISTRIBUTION (TOTAL: ${targetCorpusB} BILLION TOKENS)`,
                `ការចែកចាយថូខិនឃ្លាំងទិន្នន័យ (សរុប៖ ${targetCorpusB} ពាន់លានថូខិន)`
              )}
            </span>
            <span>{tr('SUM:', 'ផលបូក៖')} {tier1Weight + tier2Weight + tier3Weight + tier4Weight}%</span>
          </div>
          <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden flex">
            <div style={{ width: `${tier1Weight}%` }} className="bg-amber-400 h-full transition-all duration-300" title="Tier 1" />
            <div style={{ width: `${tier2Weight}%` }} className="bg-cyan-400 h-full transition-all duration-300" title="Tier 2" />
            <div style={{ width: `${tier3Weight}%` }} className="bg-indigo-400 h-full transition-all duration-300" title="Tier 3" />
            <div style={{ width: `${tier4Weight}%` }} className="bg-emerald-400 h-full transition-all duration-300" title="Tier 4" />
          </div>
        </div>
      </div>

      {/* Interactive Catalog & Resource Explorer */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-lg font-bold text-white">
            {tr('Specific Khmer Datasets & Repositories', 'សំណុំទិន្នន័យ និងឃ្លាំងឯកសារភាសាខ្មែរជាក់លាក់')}
          </h3>

          {/* Interactive filter controls */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
              <span className="text-xs text-slate-500 px-2 flex items-center gap-1">
                <Filter className="w-3 h-3" /> {tr('Tier:', 'កម្រិត៖')}
              </span>
              {(['all', 'tier1', 'tier2', 'tier3', 'tier4'] as const).map(tier => (
                <button
                  key={tier}
                  onClick={() => setSelectedTier(tier)}
                  className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                    selectedTier === tier
                      ? 'bg-amber-400 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tier === 'all' ? tr('All Tiers', 'គ្រប់កម្រិត') : tier.toUpperCase()}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
              <span className="text-xs text-slate-500 px-2">{tr('Type:', 'ប្រភេទ៖')}</span>
              {(['all', 'literature', 'legal_official', 'education', 'news', 'academic', 'web_crawl', 'synthetic'] as const).map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2 py-1 text-xs rounded-md transition-colors ${
                    selectedCategory === cat
                      ? 'bg-slate-700 text-white font-medium'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {getCategoryLabel(cat)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Resources Grid + Active Resource Detail Inspector */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Resource List Cards */}
          <div className="lg:col-span-5 space-y-2.5 max-h-[640px] overflow-y-auto pr-1">
            {filteredResources.map((res) => {
              const isSelected = activeResource.id === res.id;
              return (
                <button
                  key={res.id}
                  onClick={() => setActiveResource(res)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-slate-800/90 border-amber-500/50 shadow-md shadow-amber-950/20'
                      : 'bg-slate-900/40 border-slate-800 hover:bg-slate-900 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(res.category)}
                      <span className="text-xs font-mono font-semibold uppercase text-slate-300">
                        {getCategoryLabel(res.category)}
                      </span>
                    </div>
                    <span className="text-xs font-mono tabular-nums text-slate-400">
                      {tr('Score:', 'ពិន្ទុ៖')} <strong className={res.qualityScore >= 95 ? 'text-amber-400' : 'text-slate-300'}>{res.qualityScore}/100</strong>
                    </span>
                  </div>

                  <h4 className="text-sm font-semibold text-white font-khmer leading-relaxed line-clamp-1">
                    {res.nameKhmer}
                  </h4>
                  <div className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                    {res.nameEnglish}
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-2 font-mono">
                    <span>{res.tier.toUpperCase()}</span>
                    <span>·</span>
                    <span>{res.estimatedTokens}</span>
                    <span>·</span>
                    <span className="capitalize">{getAccessLabel(res.accessStatus)}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Detailed Inspector Drawer for Active Resource */}
          <div className="lg:col-span-7 p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="text-xs font-mono">
                  {getTierBadge(activeResource.tier)}
                </div>
                {activeResource.url && (
                  <a
                    href={activeResource.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:underline font-mono"
                  >
                    <span>{tr('Official Portal', 'គេហទំព័រផ្លូវការ')}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>

              <h3 className="text-xl font-bold text-white font-khmer leading-relaxed">
                {activeResource.nameKhmer}
              </h3>
              <div className="text-sm text-slate-300">
                {activeResource.nameEnglish}
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <div>
                <div className="text-[11px] text-slate-400 font-mono">{tr('ESTIMATED TOKENS', 'ថូខិនប៉ាន់ស្មាន')}</div>
                <div className="text-sm font-bold font-mono text-white tabular-nums mt-0.5">
                  {activeResource.estimatedTokens}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-slate-400 font-mono">{tr('QUALITY PURITY', 'កម្រិតគុណភាព')}</div>
                <div className="text-sm font-bold font-mono text-amber-400 tabular-nums mt-0.5">
                  {activeResource.qualityScore} / 100
                </div>
              </div>
              <div>
                <div className="text-[11px] text-slate-400 font-mono">{tr('LICENSE', 'អាជ្ញាប័ណ្ណ')}</div>
                <div className="text-xs font-medium text-slate-300 truncate mt-0.5" title={isKm ? (activeResource.licenseKm || activeResource.license) : activeResource.license}>
                  {isKm ? (activeResource.licenseKm || activeResource.license) : activeResource.license}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
                {tr('Linguistic Value & Architectural Role', 'តម្លៃភាសាវិទ្យា និងតួនាទីស្ថាបត្យកម្ម')}
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {isKm ? (activeResource.descriptionKm || activeResource.description) : activeResource.description}
              </p>
            </div>

            {/* Step-by-Step Curation Pipeline for this dataset */}
            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
                {tr('Mandatory Curation & Extraction Protocol', 'ពិធីការចម្រោះ និងទាញយកទិន្នន័យជាចាំបាច់')}
              </div>
              <div className="space-y-2">
                {(isKm ? (activeResource.curationStepsKm || activeResource.curationSteps) : activeResource.curationSteps).map((step, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-950/40 border border-slate-800/60 text-xs text-slate-300">
                    <span className="w-5 h-5 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center font-mono font-bold shrink-0 text-[10px]">
                      0{idx + 1}
                    </span>
                    <span className="leading-relaxed">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
        </div>
      )}
    </div>
  );
};
