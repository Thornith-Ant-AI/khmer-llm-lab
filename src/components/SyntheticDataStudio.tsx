import React, { useState } from 'react';
import { Sparkles, Copy, Check, RefreshCw, ShieldAlert, CheckCircle2, ArrowRight } from 'lucide-react';
import { LanguageBiasMonitor } from './LanguageBiasMonitor';
import { useLanguage } from '../contexts/LanguageContext';

const SEED_TOPICS = [
  {
    topic: 'Khmer Agriculture & Rice Varieties',
    topicKm: 'កសិកម្ម និងពូជស្រូវខ្មែរ',
    seed: 'ពូជស្រូវផ្ការំដួល និងបច្ចេកទេសដាំដុះឱ្យទទួលបានទិន្នន័យខ្ពស់'
  },
  {
    topic: 'Angkorian Engineering & History',
    topicKm: 'ប្រវត្តិសាស្ត្រ និងប្រព័ន្ធធារាសាស្ត្រអង្គរ',
    seed: 'ប្រព័ន្ធធារាសាស្ត្រ និងបារាយណ៍នៅសម័យអង្គរ'
  },
  {
    topic: 'Cambodian Civil Code & Contracts',
    topicKm: 'ក្រមរដ្ឋប្បវេណី និងច្បាប់កិច្ចសន្យា',
    seed: 'សុពលភាពនៃកិច្ចសន្យាទិញលក់អចលនទ្រព្យតាមក្រមរដ្ឋប្បវេណី'
  },
  {
    topic: 'STEM & Math in Riel',
    topicKm: 'គណិតវិទ្យា និងរូបិយវត្ថុរៀល',
    seed: 'ការគណនាការប្រាក់ប្រចាំឆ្នាំ និងការគ្រប់គ្រងហិរញ្ញវត្ថុផ្ទាល់ខ្លួន'
  }
];

export const SyntheticDataStudio: React.FC = () => {
  const { language, isKm, tr } = useLanguage();
  const [activeSubTab, setActiveSubTab] = useState<'generator' | 'bias-monitor'>('generator');
  const [topicInput, setTopicInput] = useState<string>(SEED_TOPICS[0].seed);
  const [loading, setLoading] = useState<boolean>(false);
  const [generatedPairs, setGeneratedPairs] = useState<any[]>([
    {
      instruction_kh: 'តើពូជស្រូវផ្ការំដួលមានលក្ខណៈពិភពលោក និងលក្ខណៈពិសេសអ្វីខ្លះ ហើយហេតុអ្វីបានជាទទួលបានពានរង្វាន់ស្រូវល្អដាច់គេលើពិភពលោក?',
      response_kh: 'បាទ ពូជស្រូវផ្ការំដួល (Phka Rumduol) គឺជាប្រភេទស្រូវក្រអូបប្រណិតរបស់កម្ពុជា ដែលត្រូវបានទទួលស្គាល់ទូទាំងពិភពលោក។ លក្ខណៈពិសេសចម្បងៗរួមមាន៖\n\n១. **ក្លិនក្រអូបប្រហើរធម្មជាតិ**៖ គ្រាប់អង្ករមានក្លិនក្រអូបស្រទន់ដូចផ្ការំដួល ដែលជាផ្កាតំណាងជាតិកម្ពុជា។\n២. **គុណភាពបាយទន់ឆ្ងាញ់**៖ នៅពេលដាំរួច គ្រាប់បាយមានសភាពទន់ វែង និងមិនស្អិតជាប់គ្នាឡើយ។\n៣. **កេរ្តិ៍ឈ្មោះអន្តរជាតិ**៖ ស្រូវផ្ការំដួលបានឈ្នះពានរង្វាន់ «ស្រូវល្អដាច់គេលើពិភពលោក» (World Best Rice Award) ចំនួន ៥ លើក រួមទាំងក្នុងឆ្នាំ ២០២២ ផងដែរ។',
      register: 'formal_polite',
      english_summary: 'Explanation of Cambodia Phka Rumduol award-winning aromatic rice.',
      khmer_summary: 'ការពន្យល់អំពីពូជស្រូវក្រអូបផ្ការំដួលរបស់កម្ពុជា ដែលទទួលបានពានរង្វាន់លំដាប់ពិភពលោក។',
      isDebiased: false
    }
  ]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  
  // State for passing pair into Language Bias Monitor
  const [selectedForAudit, setSelectedForAudit] = useState<{
    text: string;
    pairIndex: number;
    context: string;
  } | null>(null);

  const handleGenerate = async () => {
    if (!topicInput.trim()) return;
    setLoading(true);

    try {
      const response = await fetch('/api/ai/analyze-khmer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: topicInput,
          task: 'synthetic-instruction',
          language
        })
      });

      const data = await response.json();
      if (data.success && data.data && Array.isArray(data.data)) {
        setGeneratedPairs(data.data.map((p: any) => ({ ...p, isDebiased: false })));
      } else {
        generateLocalFallback(topicInput);
      }
    } catch {
      generateLocalFallback(topicInput);
    } finally {
      setLoading(false);
    }
  };

  const generateLocalFallback = (seed: string) => {
    const fallback = [
      {
        instruction_kh: `សូមជួយពន្យល់លម្អិតអំពី "${seed}" ដោយផ្អែកលើទិន្នន័យជាក់ស្តែងនៅកម្ពុជា។`,
        response_kh: `បាទ/ចាស ទាក់ទងនឹង «${seed}» នេះ គឺជាប្រធានបទដ៏សំខាន់មួយក្នុងការអភិវឌ្ឍសង្គមនិងសេដ្ឋកិច្ច។ ក្នុងការអនុវត្តជាក់ស្តែង អ្នកជំនាញកម្ពុជាតែងសង្កត់ធ្ងន់លើ៖\n\n១. ការស្រាវជ្រាវ និងការប្រមូលទិន្នន័យត្រឹមត្រូវតាមស្ដង់ដារជាតិ។\n២. ការផ្សារភ្ជាប់ចំណេះដឹងទ្រឹស្តីទៅនឹងការអនុវត្តផ្ទាល់ក្នុងសហគមន៍។\n៣. ការថែរក្សាគុណតម្លៃវប្បធម៌ និងអត្ថប្រយោជន៍យូរអង្វែងសម្រាប់ប្រជាពលរដ្ឋ។`,
        register: 'formal_polite',
        english_summary: `Synthesized formal response addressing ${seed}`,
        khmer_summary: `ចម្លើយផ្លូវការសំយោគអំពី «${seed}»`,
        isDebiased: false
      }
    ];
    setGeneratedPairs(fallback);
  };

  const copyPair = (index: number, pair: any) => {
    const chatMl = `<|im_start|>user\n${pair.instruction_kh}<|im_end|>\n<|im_start|>assistant\n${pair.response_kh}<|im_end|>`;
    navigator.clipboard.writeText(chatMl);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1800);
  };

  const handleSendToBiasAudit = (pair: any, index: number) => {
    setSelectedForAudit({
      text: pair.response_kh,
      pairIndex: index,
      context: tr(
        `Synthesized response to user instruction: "${pair.instruction_kh}"`,
        `ចម្លើយសំយោគសម្រាប់ការណែនាំរបស់អ្នកប្រើ៖ «${pair.instruction_kh}»`
      )
    });
    setActiveSubTab('bias-monitor');
  };

  const handleApplyDebiasedText = (newText: string) => {
    if (selectedForAudit && selectedForAudit.pairIndex < generatedPairs.length) {
      const updated = [...generatedPairs];
      updated[selectedForAudit.pairIndex] = {
        ...updated[selectedForAudit.pairIndex],
        response_kh: newText,
        isDebiased: true
      };
      setGeneratedPairs(updated);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className={`inline-flex items-center gap-2 text-xs font-semibold text-amber-400 tracking-wider ${isKm ? 'font-khmer' : 'uppercase font-mono'}`}>
          <span>{tr('SYNTHETIC INSTRUCTION CURATION', 'ការរៀបចំទិន្នន័យបង្រៀនសំយោគ')}</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span>{tr('TIER 4 SFT PIPELINE', 'បំពង់ SFT កម្រិត ៤')}</span>
        </div>
        <h2 className={`text-2xl sm:text-3xl font-bold text-white tracking-tight ${isKm ? 'font-khmer' : ''}`}>
          {tr('Synthetic Instruction Tuning & Cultural Bias Studio', 'ស្ទូឌីយោទិន្នន័យ SFT សំយោគ និងការត្រួតពិនិត្យលំអៀងវប្បធម៌')}
        </h2>
        <p className={`text-sm text-slate-300 max-w-3xl leading-relaxed ${isKm ? 'font-khmer' : ''}`}>
          {tr(
            'High-reasoning math, science, and coding instruction pairs culturally adapted to Cambodian context, paired with Gemini-powered regional dialect and translationese bias auditing.',
            'គូសំណួរ-ចម្លើយផ្នែកគណិតវិទ្យា វិទ្យាសាស្ត្រ និងកូដដែលសម្របតាមបរិបទវប្បធម៌កម្ពុជា រួមជាមួយប្រព័ន្ធសវនកម្មលំអៀងគ្រាមភាសាតាមតំបន់ និងភាសាបកប្រែដោយប្រើ Gemini API។'
          )}
        </p>
      </div>

      {/* Sub-tab Navigation */}
      <div className="flex border-b border-slate-800 gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('generator')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-all border-b-2 -mb-px whitespace-nowrap ${
            isKm ? 'font-khmer' : 'font-mono'
          } ${
            activeSubTab === 'generator'
              ? 'border-amber-400 text-amber-400 bg-amber-400/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{tr('1. SFT Instruction Generator', '១. កម្មវិធីបង្កើតគូបង្រៀន SFT')}</span>
          <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-slate-800 text-slate-300">
            {generatedPairs.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('bias-monitor')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-all border-b-2 -mb-px whitespace-nowrap ${
            isKm ? 'font-khmer' : 'font-mono'
          } ${
            activeSubTab === 'bias-monitor'
              ? 'border-amber-400 text-amber-400 bg-amber-400/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
          <span>{tr('2. Language Bias & Cultural Monitor (Gemini API)', '២. កម្មវិធីតាមដានលំអៀងភាសា និងវប្បធម៌ (Gemini API)')}</span>
          {selectedForAudit && (
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          )}
        </button>
      </div>

      {activeSubTab === 'generator' && (
        <div className="space-y-6">
          {/* Seed Topic Ribbon */}
          <div className="space-y-2">
            <div className={`text-xs text-slate-400 ${isKm ? 'font-khmer' : 'font-mono uppercase'}`}>
              {tr('SAMPLE SEED DOMAINS:', 'ប្រធានបទគំរូតាមវិស័យ៖')}
            </div>
            <div className="flex flex-wrap gap-2">
              {SEED_TOPICS.map((topic, i) => (
                <button
                  key={i}
                  onClick={() => setTopicInput(topic.seed)}
                  className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                    isKm ? 'font-khmer' : ''
                  } ${
                    topicInput === topic.seed
                      ? 'bg-amber-400 text-slate-950 font-semibold border-amber-400'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  {isKm ? topic.topicKm : topic.topic}
                </button>
              ))}
            </div>
          </div>

          {/* Prompt Generator Input */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className={isKm ? 'font-khmer' : ''}>
                {tr('Seed Prompt or Topic in Khmer:', 'ប្រធានបទ ឬការណែនាំដើមជាភាសាខ្មែរ៖')}
              </span>
              <span className={`text-amber-400 text-[11px] ${isKm ? 'font-khmer' : 'font-mono'}`}>
                {tr('ChatML Compatible', 'គាំទ្រទម្រង់ ChatML')}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={topicInput}
                onChange={(e) => setTopicInput(e.target.value)}
                placeholder={tr(
                  'Enter a topic or instruction seed in Khmer...',
                  'វាយបញ្ចូលប្រធានបទ ឬចំណងជើងទិន្នន័យនៅទីនេះ...'
                )}
                className="flex-1 px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white font-khmer text-sm focus:outline-none focus:border-amber-400"
              />
              <button
                onClick={handleGenerate}
                disabled={loading}
                className={`flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors disabled:opacity-50 cursor-pointer ${
                  isKm ? 'font-khmer' : ''
                }`}
              >
                {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                <span>
                  {loading
                    ? tr('Synthesizing...', 'កំពុងសំយោគ...')
                    : tr('Generate SFT Pair', 'បង្កើតគូ SFT')}
                </span>
              </button>
            </div>
          </div>

          {/* Generated SFT Pair Cards */}
          <div className="space-y-4">
            {generatedPairs.map((pair, idx) => (
              <div key={idx} className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs flex-wrap">
                    <span className={`text-amber-400 font-semibold ${isKm ? 'font-khmer' : 'font-mono uppercase'}`}>
                      {tr(`PAIR 0${idx + 1}`, `គូទី 0${idx + 1}`)}
                    </span>
                    <span className="text-slate-600">·</span>
                    <span className="text-slate-400 font-mono">{pair.register || 'formal_polite'}</span>
                    {pair.isDebiased && (
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1 ${isKm ? 'font-khmer' : 'font-mono'}`}>
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>{tr('Culturally Debiased', 'បានកែសម្រួលលំអៀងវប្បធម៌')}</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => handleSendToBiasAudit(pair, idx)}
                      className={`flex items-center gap-1.5 px-3 py-1 text-xs rounded-md bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 border border-amber-400/30 transition-colors ${
                        isKm ? 'font-khmer' : 'font-mono'
                      }`}
                      title={tr(
                        'Analyze this response for cultural or regional Khmer linguistic bias using Gemini',
                        'វិភាគចម្លើយនេះដើម្បីរកលំអៀងវប្បធម៌ ឬគ្រាមភាសាតាមតំបន់ដោយប្រើ Gemini'
                      )}
                    >
                      <ShieldAlert className="w-3 h-3 text-amber-400" />
                      <span>{tr('Audit Bias with Gemini', 'ធ្វើសវនកម្មលំអៀងជាមួយ Gemini')}</span>
                    </button>

                    <button
                      onClick={() => copyPair(idx, pair)}
                      className={`flex items-center gap-1.5 px-3 py-1 text-xs rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors ${
                        isKm ? 'font-khmer' : 'font-mono'
                      }`}
                    >
                      {copiedIndex === idx ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>
                        {copiedIndex === idx
                          ? tr('Copied ChatML', 'បានចម្លង ChatML')
                          : tr('Copy ChatML', 'ចម្លង ChatML')}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Instruction */}
                <div className="space-y-1">
                  <div className={`text-[11px] text-slate-400 ${isKm ? 'font-khmer' : 'font-mono uppercase'}`}>
                    {tr('USER PROMPT (KHMER):', 'សំណួរអ្នកប្រើប្រាស់ (ភាសាខ្មែរ)៖')}
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-white font-khmer text-sm leading-relaxed">
                    {pair.instruction_kh}
                  </div>
                </div>

                {/* Assistant Response */}
                <div className="space-y-1">
                  <div className={`text-[11px] text-emerald-400 ${isKm ? 'font-khmer' : 'font-mono uppercase'}`}>
                    {tr('ASSISTANT RESPONSE (AUTHENTIC REGISTER):', 'ចម្លើយជំនួយការ (កម្រិតភាសាធម្មជាតិ)៖')}
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-emerald-900/30 text-slate-200 font-khmer text-sm leading-relaxed whitespace-pre-wrap">
                    {pair.response_kh}
                  </div>
                </div>

                {(pair.english_summary || pair.khmer_summary) && (
                  <div className={`text-[11px] text-slate-400 ${isKm ? 'font-khmer' : 'font-mono'}`}>
                    {tr('Context:', 'បរិបទ៖')} {isKm ? (pair.khmer_summary || pair.english_summary) : pair.english_summary}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSubTab === 'bias-monitor' && (
        <div className="space-y-4">
          {selectedForAudit && (
            <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-amber-400 font-bold ${isKm ? 'font-khmer' : 'font-mono'}`}>
                  {tr(
                    `PAIR 0${selectedForAudit.pairIndex + 1} LOADED FOR AUDIT`,
                    `គូទី 0${selectedForAudit.pairIndex + 1} ត្រូវបានផ្ទុកសម្រាប់ធ្វើសវនកម្ម`
                  )}
                </span>
                <span className={`text-slate-400 ${isKm ? 'font-khmer' : ''}`}>({selectedForAudit.context})</span>
              </div>
              <button
                onClick={() => setActiveSubTab('generator')}
                className={`flex items-center gap-1 text-amber-400 hover:text-amber-300 shrink-0 ${isKm ? 'font-khmer' : 'font-mono'}`}
              >
                <span>{tr('Back to SFT Pairs', 'ត្រឡប់ទៅគូ SFT វិញ')}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}

          <LanguageBiasMonitor
            initialText={selectedForAudit ? selectedForAudit.text : undefined}
            onApplyDebiasedText={(newText) => {
              handleApplyDebiasedText(newText);
              setActiveSubTab('generator');
            }}
          />
        </div>
      )}
    </div>
  );
};

