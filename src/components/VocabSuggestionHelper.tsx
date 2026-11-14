import React, { useState, useMemo } from 'react';
import {
  analyzeUnderRepresentedSyllables,
  getUnicodeHexSequence
} from '../utils/khmerLinguistics';
import { useLanguage } from '../contexts/LanguageContext';
import {
  Sparkles,
  Plus,
  Check,
  Copy,
  Code2,
  FileText,
  Search,
  Zap,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface VocabSuggestionHelperProps {
  inputText: string;
  onApplyVocabToTokenizer?: (tokens: string[]) => void;
}

export const VocabSuggestionHelper: React.FC<VocabSuggestionHelperProps> = ({
  inputText
}) => {
  const { language, isKm, tr } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTokens, setSelectedTokens] = useState<Set<string>>(
    new Set(['ក្ស', 'ស្ដ', 'ន្ត', 'ម្ព', 'ង្គ', 'ប្រ', 'ក្រ', 'ត្រ', 'វិទ្យា', 'សាស្ត្រ', 'ដោយសារ', 'ដើម្បី'])
  );
  const [expandedTokenId, setExpandedTokenId] = useState<string | null>(null);
  const [copiedType, setCopiedType] = useState<'cli' | 'file' | 'python' | null>(null);

  // Custom user tester
  const [customInputProbe, setCustomInputProbe] = useState<string>('');

  // Analyze suggestions from active text
  const suggestions = useMemo(() => {
    return analyzeUnderRepresentedSyllables(inputText, undefined, language);
  }, [inputText, language]);

  // Filter suggestions
  const filteredSuggestions = useMemo(() => {
    return suggestions.filter(item => {
      // Category match
      if (selectedCategory === 'in_text' && item.frequencyInText === 0) return false;
      if (selectedCategory !== 'all' && selectedCategory !== 'in_text' && item.category !== selectedCategory) {
        return false;
      }
      // Query match across English & Khmer fields
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesWord = item.clusterOrWord.toLowerCase().includes(q);
        const matchesRationale =
          item.rationale.toLowerCase().includes(q) ||
          (item.rationaleKm || '').toLowerCase().includes(q);
        const matchesCategory =
          item.categoryLabel.toLowerCase().includes(q) ||
          (item.categoryLabelKm || '').toLowerCase().includes(q);
        if (!matchesWord && !matchesRationale && !matchesCategory) return false;
      }
      return true;
    });
  }, [suggestions, selectedCategory, searchQuery]);

  // Statistics
  const inTextCount = useMemo(() => suggestions.filter(s => s.frequencyInText > 0).length, [suggestions]);
  const coengCount = useMemo(() => suggestions.filter(s => s.coengPresent).length, [suggestions]);
  const totalTokensSavedInSample = useMemo(() => {
    let saved = 0;
    suggestions.forEach(s => {
      if (s.frequencyInText > 0 && selectedTokens.has(s.clusterOrWord)) {
        saved += (s.currentTokensBaseline - s.proposedTokens) * s.frequencyInText;
      }
    });
    return saved;
  }, [suggestions, selectedTokens]);

  const toggleSelectToken = (token: string) => {
    const next = new Set(selectedTokens);
    if (next.has(token)) {
      next.delete(token);
    } else {
      next.add(token);
    }
    setSelectedTokens(next);
  };

  const selectAllFiltered = () => {
    const next = new Set(selectedTokens);
    filteredSuggestions.forEach(s => next.add(s.clusterOrWord));
    setSelectedTokens(next);
  };

  const clearSelection = () => {
    setSelectedTokens(new Set());
  };

  // Custom probe analysis
  const customProbeAnalysis = useMemo(() => {
    if (!customInputProbe.trim()) return null;
    const probe = customInputProbe.trim();
    const hasCoeng = probe.includes('\u17D2');
    const bytes = new TextEncoder().encode(probe).length;
    const isAlreadySelected = selectedTokens.has(probe);
    const unicodeSeq = getUnicodeHexSequence(probe);
    const saving = Math.round(((bytes - 1) / bytes) * 100);

    return {
      probe,
      hasCoeng,
      bytes,
      isAlreadySelected,
      unicodeSeq,
      saving
    };
  }, [customInputProbe, selectedTokens]);

  const addCustomProbeToVocab = () => {
    if (customProbeAnalysis && !customProbeAnalysis.isAlreadySelected) {
      const next = new Set(selectedTokens);
      next.add(customProbeAnalysis.probe);
      setSelectedTokens(next);
      setCustomInputProbe('');
    }
  };

  const copyToClipboard = (text: string, type: 'cli' | 'file' | 'python') => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const selectedArray = useMemo(() => Array.from(selectedTokens), [selectedTokens]);

  const spmCliArgs = useMemo(() => {
    return `--user_defined_symbols="${selectedArray.join(',')}"`;
  }, [selectedArray]);

  const spmFileContent = useMemo(() => {
    return selectedArray.join('\n');
  }, [selectedArray]);

  const pythonSnippet = useMemo(() => {
    return `# Khmer Large Language Model: SentencePiece Pretraining Configuration
# Auto-generated from Khmer Syllable Cluster Optimization Helper
import sentencepiece as spm

user_defined_vocab = [
${selectedArray.map(w => `    '${w}',`).join('\n')}
]

spm.SentencePieceTrainer.train(
    input='corpus/khmer_pretrain_cleaned.txt',
    model_prefix='khmer_spm_32k_optimized',
    vocab_size=32000,
    character_coverage=0.9995,
    model_type='bpe',
    byte_fallback=True,
    split_digits=True,
    user_defined_symbols=user_defined_vocab
)
print(f"Trained Khmer SentencePiece model with {len(user_defined_vocab)} prioritized clusters.")
`;
  }, [selectedArray]);

  return (
    <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider font-mono">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{tr('VOCABULARY EXPANSION HELPER', 'ជំនួយការពង្រីកវាក្យសព្ទ')}</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>{tr('UNDER-REPRESENTED SYLLABLE ENGINE', 'ម៉ាស៊ីនស្វែងរកព្យាង្គកម្រ')}</span>
          </div>
          <h3 className={`text-xl font-bold text-white tracking-tight ${isKm ? 'font-khmer leading-relaxed' : ''}`}>
            {tr('Khmer Syllable & Cluster Vocabulary Synthesizer', 'កម្មវិធីសំយោគវាក្យសព្ទព្យាង្គ និងចង្កោមអក្សរខ្មែរ')}
          </h3>
          <p className={`text-xs text-slate-400 max-w-3xl leading-relaxed ${isKm ? 'font-khmer' : ''}`}>
            {isKm ? (
              <>
                កំណត់អត្តសញ្ញាណជើងព្យញ្ជនៈផ្សំដែលបែកខ្ញែក (<span className="font-khmer text-amber-300">ជើង</span>) ឫសពាក្យបាលី-សំស្ក្រឹត និងពាក្យភ្ជាប់វេយ្យាករណ៍។ ការបង្រួមបំណែកពាក្យទាំងនេះជាថូខិនតែមួយ ជួយការពារការផ្ទុះបៃឆៅ និងកាត់បន្ថយការខ្ជះខ្ជាយកម្លាំងគណនាក្នុងពេលបង្វឹកដំបូង។
              </>
            ) : (
              <>
                Identifies fragmented Coeng ligatures (<span className="font-khmer text-amber-300">ជើង</span>), Pali-Sanskrit morphological roots, and syntactic clitics. Unifying these under-represented subwords into single tokens prevents byte-fallback explosion and drastically reduces pretraining compute waste.
              </>
            )}
          </p>
        </div>

        {/* Stats Pill Deck */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-center min-w-[90px]">
            <span className="text-[10px] text-slate-500 block">{tr('IN SAMPLE', 'ក្នុងគំរូ')}</span>
            <span className="text-base font-bold text-amber-400 tabular-nums">
              {inTextCount}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-center min-w-[90px]">
            <span className="text-[10px] text-slate-500 block">{tr('COENG (្)', 'ជើង (្)')}</span>
            <span className="text-base font-bold text-rose-400 tabular-nums">
              {coengCount}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-center min-w-[100px]">
            <span className="text-[10px] text-slate-500 block">{tr('SELECTED', 'បានជ្រើស')}</span>
            <span className="text-base font-bold text-emerald-400 tabular-nums">
              {selectedTokens.size}
            </span>
          </div>
        </div>
      </div>

      {/* Real-time Sample Savings Ribbon */}
      {totalTokensSavedInSample > 0 && (
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-800/40 text-xs">
          <div className={`flex items-center gap-2.5 text-emerald-300 ${isKm ? 'font-khmer leading-relaxed' : ''}`}>
            <Zap className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              {isKm ? (
                <>
                  <strong>ផលប៉ះពាល់ការបង្រួមគំរូ៖</strong> ការបន្ថែមពាក្យដែលបានជ្រើសរបស់អ្នក ជួយលុបបំបាត់ <span className="font-mono font-bold text-white">{totalTokensSavedInSample} ថូខិនបៃលើស</span> នៅក្នុងអត្ថបទគំរូបច្ចុប្បន្ននេះ។
                </>
              ) : (
                <>
                  <strong>Sample Compression Impact:</strong> Adding your selected candidates eliminates <span className="font-mono font-bold text-white">{totalTokensSavedInSample} redundant byte tokens</span> across the current sample alone.
                </>
              )}
            </span>
          </div>
          <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider font-semibold">
            {tr('Active Optimization', 'កំពុងបង្កើនប្រសិទ្ធភាព')}
          </span>
        </div>
      )}

      {/* Interactive Custom Syllable Tester */}
      <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className={`font-mono text-slate-300 font-semibold uppercase flex items-center gap-1.5 ${isKm ? 'font-khmer' : ''}`}>
            <Search className="w-3.5 h-3.5 text-amber-400" />
            <span>{tr('Test Any Custom Khmer Syllable or Compound', 'សាកល្បងព្យាង្គ ឬពាក្យផ្សំខ្មែរផ្ទាល់ខ្លួន')}</span>
          </span>
          <span className={`text-slate-500 text-[11px] ${isKm ? 'font-khmer' : ''}`}>
            {tr('Type or paste to test ligature segmentation', 'វាយ ឬបិទភ្ជាប់ដើម្បីសាកល្បងការបំបែកជើងព្យញ្ជនៈ')}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <input
            type="text"
            value={customInputProbe}
            onChange={(e) => setCustomInputProbe(e.target.value)}
            placeholder="ឧទាហរណ៍៖ អគ្គនាយកដ្ឋាន, ក្ស, ស្ដេច, ធម្ម..."
            className="flex-1 px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white font-khmer text-sm focus:outline-none focus:border-amber-400 placeholder:text-slate-600"
          />
          <button
            onClick={addCustomProbeToVocab}
            disabled={!customProbeAnalysis || customProbeAnalysis.isAlreadySelected}
            className={`px-4 py-2 rounded-lg text-xs font-mono font-semibold transition-colors flex items-center justify-center gap-1.5 ${
              customProbeAnalysis && !customProbeAnalysis.isAlreadySelected
                ? 'bg-amber-400 text-slate-950 hover:bg-amber-300 shadow-sm cursor-pointer'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>
              {customProbeAnalysis?.isAlreadySelected
                ? tr('Already in Vocab', 'មានក្នុងបញ្ជីរួចហើយ')
                : tr('Add to Vocab List', 'បន្ថែមទៅបញ្ជីវាក្យសព្ទ')}
            </span>
          </button>
        </div>

        {customProbeAnalysis && (
          <div className="p-3 rounded-lg bg-slate-900/90 border border-amber-500/30 text-xs font-mono space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-white font-bold font-khmer text-base">{customProbeAnalysis.probe}</span>
                {customProbeAnalysis.hasCoeng ? (
                  <span className="px-2 py-0.5 rounded text-[10px] bg-rose-950/60 text-rose-300 border border-rose-800/40">
                    {tr('Coeng Subscript (្) Ligature Detected', 'បានរកឃើញជើងព្យញ្ជនៈផ្សំ (្)')}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-950/60 text-cyan-300 border border-cyan-800/40">
                    {tr('Phonological Cluster', 'ចង្កោមសូរសព្ទ')}
                  </span>
                )}
              </div>
              <div className="text-slate-400">
                {tr('Baseline Footprint:', 'មូលដ្ឋានដើម៖')}{' '}
                <span className="text-rose-400 font-bold">{customProbeAnalysis.bytes} {tr('byte tokens', 'ថូខិនបៃ')}</span>
                {' '}&rarr;{' '}
                {tr('Proposed:', 'សំណើ៖')}{' '}
                <span className="text-emerald-400 font-bold">{tr('1 unified token', '1 ថូខិនរួម')}</span>
                {' '}(<span className="text-amber-400 font-bold">{customProbeAnalysis.saving}% {tr('reduction', 'កាត់បន្ថយ')}</span>)
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[10px] text-slate-400">
              <span className="text-slate-500">{tr('Unicode Codepoints:', 'ចំណុចកូដយូនីកូដ៖')}</span>
              {customProbeAnalysis.unicodeSeq.map((c, i) => (
                <span key={i} className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
          {[
            { id: 'all', label: tr('All Candidates', 'បេក្ខភាពទាំងអស់') },
            { id: 'in_text', label: tr(`In Current Sample (${inTextCount})`, `ក្នុងគំរូបច្ចុប្បន្ន (${inTextCount})`) },
            { id: 'coeng_cluster', label: tr('Coeng Ligatures (្)', 'ជើងព្យញ្ជនៈ (្)') },
            { id: 'pali_sanskrit', label: tr('Pali-Sanskrit Stems', 'ឫសបាលី-សំស្ក្រឹត') },
            { id: 'clitic_connector', label: tr('Connectors & Clitics', 'ឈ្នាប់ និងធ្នាក់') },
            { id: 'technical_modern', label: tr('Tech Neologisms', 'ពាក្យបច្ចេកវិទ្យា') },
            { id: 'administrative_royal', label: tr('Official / Legal', 'ផ្លូវការ / ច្បាប់') }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id)}
              className={`px-3 py-1.5 rounded-lg border transition-colors ${isKm ? 'font-khmer' : ''} ${
                selectedCategory === tab.id
                  ? 'bg-amber-400 text-slate-950 font-bold border-amber-400 shadow-sm'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search input & bulk action buttons */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={tr('Filter syllables...', 'ស្វែងរកព្យាង្គ...')}
              className={`pl-8 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-amber-400 w-44 ${isKm ? 'font-khmer' : ''}`}
            />
          </div>

          <button
            onClick={selectAllFiltered}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors"
          >
            {tr('Select All', 'ជ្រើសទាំងអស់')}
          </button>
          <button
            onClick={clearSelection}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-400 text-xs font-mono transition-colors"
          >
            {tr('Clear', 'សម្អាត')}
          </button>
        </div>
      </div>

      {/* Suggestion Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[500px] overflow-y-auto pr-1">
        {filteredSuggestions.length === 0 ? (
          <div className={`col-span-full p-8 text-center rounded-xl bg-slate-950/60 border border-slate-800 text-slate-400 text-xs ${isKm ? 'font-khmer' : ''}`}>
            {tr('No syllable clusters match the selected criteria.', 'គ្មានចង្កោមព្យាង្គណាត្រូវនឹងលក្ខខណ្ឌស្វែងរកឡើយ។')}
          </div>
        ) : (
          filteredSuggestions.map((item) => {
            const isSelected = selectedTokens.has(item.clusterOrWord);
            const isExpanded = expandedTokenId === item.id;

            return (
              <div
                key={item.id}
                className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between gap-2.5 ${
                  isSelected
                    ? 'bg-slate-900/90 border-amber-500/50 ring-1 ring-amber-500/20'
                    : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                {/* Top Row: Khmer cluster and badges */}
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-khmer text-xl font-bold text-white tracking-normal">
                        {item.clusterOrWord}
                      </span>
                      {item.frequencyInText > 0 && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40">
                          {item.frequencyInText}&times; {tr('in sample', 'ក្នុងគំរូ')}
                        </span>
                      )}
                    </div>
                    <div className={`text-[10px] font-mono text-slate-400 ${isKm ? 'font-khmer' : ''}`}>
                      {isKm ? (item.categoryLabelKm || item.categoryLabel) : item.categoryLabel}
                    </div>
                  </div>

                  <button
                    onClick={() => toggleSelectToken(item.clusterOrWord)}
                    className={`p-1.5 rounded-lg border transition-all ${
                      isSelected
                        ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-sm'
                        : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                    }`}
                    title={isSelected ? tr('Remove from vocabulary', 'ដកចេញពីវាក្យសព្ទ') : tr('Add to vocabulary', 'បន្ថែមទៅវាក្យសព្ទ')}
                  >
                    {isSelected ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Token Cost Delta Metric */}
                <div className="grid grid-cols-2 gap-2 p-2 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px] font-mono">
                  <div>
                    <span className="text-[9px] text-slate-500 block">{tr('STANDARD LLAMA', 'LLAMA ស្តង់ដារ')}</span>
                    <span className="text-rose-400 font-bold tabular-nums">
                      {item.currentTokensBaseline} {tr('tokens (bytes)', 'ថូខិន (បៃ)')}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 block">{tr('PROPOSED UNIFIED', 'សំណើរួមបញ្ចូល')}</span>
                    <span className="text-emerald-400 font-bold tabular-nums">
                      {tr('1 token', '1 ថូខិន')} (-{item.tokenSavingPercent}%)
                    </span>
                  </div>
                </div>

                {/* Linguistic Rationale */}
                <p className={`text-[11px] text-slate-300 leading-relaxed ${isKm ? 'font-khmer' : ''}`}>
                  {isKm ? (item.rationaleKm || item.rationale) : item.rationale}
                </p>

                {/* Unicode Inspect Accordion */}
                <div className="border-t border-slate-800/80 pt-2 space-y-1.5">
                  <button
                    onClick={() => setExpandedTokenId(isExpanded ? null : item.id)}
                    className="flex items-center justify-between w-full text-[10px] font-mono text-slate-400 hover:text-slate-200"
                  >
                    <span>{tr(`Unicode Decomposition (${item.unicodeSequence.length} codepoints)`, `ការបំបែកយូនីកូដ (${item.unicodeSequence.length} ចំណុចកូដ)`)}</span>
                    {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>

                  {isExpanded && (
                    <div className="p-2 rounded bg-slate-900 border border-slate-800 space-y-1 text-[10px] font-mono text-slate-300">
                      {item.unicodeSequence.map((cp, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 text-slate-300">
                          <span className="text-slate-500 tabular-nums">[{idx + 1}]</span>
                          <span className="text-amber-300">{cp}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Export & SentencePiece Pretraining Generator */}
      <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-amber-400" />
              <h4 className={`text-sm font-bold text-white font-mono ${isKm ? 'font-khmer' : ''}`}>
                {tr(
                  `SentencePiece Pretraining Integration (${selectedTokens.size} user-defined symbols)`,
                  `ការដាក់បញ្ចូលក្នុងការបង្វឹក SentencePiece (${selectedTokens.size} និមិត្តសញ្ញាកំណត់ដោយអ្នកប្រើ)`
                )}
              </h4>
            </div>
            <p className={`text-xs text-slate-400 ${isKm ? 'font-khmer leading-relaxed' : ''}`}>
              {tr(
                'Pass these symbols directly to SentencePiece trainer to lock in unified embeddings during tokenizer creation.',
                'បញ្ជូននិមិត្តសញ្ញាទាំងនេះដោយផ្ទាល់ទៅកម្មវិធីបង្វឹក SentencePiece ដើម្បីចាក់សោ Embedding រួមគ្នាក្នុងពេលបង្កើត Tokenizer។'
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
            <button
              onClick={() => copyToClipboard(spmCliArgs, 'cli')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              {copiedType === 'cli' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{tr('Copy CLI Flag', 'ចម្លង CLI Flag')}</span>
            </button>

            <button
              onClick={() => copyToClipboard(spmFileContent, 'file')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              {copiedType === 'file' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <FileText className="w-3.5 h-3.5" />}
              <span>{tr('Copy symbols.txt', 'ចម្លង symbols.txt')}</span>
            </button>

            <button
              onClick={() => copyToClipboard(pythonSnippet, 'python')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 border border-amber-400/40 transition-colors"
            >
              {copiedType === 'python' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Code2 className="w-3.5 h-3.5" />}
              <span>{tr('Copy Python Script', 'ចម្លងស្គ្រីប Python')}</span>
            </button>
          </div>
        </div>

        {/* Selected Tokens Chip Basket */}
        <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
          {selectedArray.map((token, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-khmer bg-slate-800 border border-slate-700 text-amber-200"
            >
              <span>{token}</span>
              <button
                onClick={() => toggleSelectToken(token)}
                className="text-slate-500 hover:text-rose-400 ml-0.5"
                title={tr('Remove', 'ដកចេញ')}
              >
                &times;
              </button>
            </span>
          ))}
        </div>

        {/* Python Snippet Preview */}
        <div className="relative rounded-lg bg-slate-900/90 border border-slate-800/80 p-3 font-mono text-[11px] text-slate-300 overflow-x-auto max-h-36">
          <pre>{pythonSnippet}</pre>
        </div>
      </div>
    </div>
  );
};

