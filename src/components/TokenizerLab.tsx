import React, { useState } from 'react';
import {
  compareTokenizers,
  SAMPLE_KHMER_PHRASES,
  analyzeOrthography,
  analyzeUnderRepresentedSyllables
} from '../utils/khmerLinguistics';
import { TokenDistributionChart } from './TokenDistributionChart';
import { RegisterHeatmapChart } from './RegisterHeatmapChart';
import { TokenizerSplitView } from './TokenizerSplitView';
import { VocabSuggestionHelper } from './VocabSuggestionHelper';
import { useLanguage } from '../contexts/LanguageContext';
import {
  AlertTriangle,
  Sparkles,
  Check,
  Columns2,
  BarChart2,
  Grid3x3,
  Layers,
  ArrowRight
} from 'lucide-react';

export const TokenizerLab: React.FC = () => {
  const { language, isKm, tr } = useLanguage();
  const [inputText, setInputText] = useState<string>(SAMPLE_KHMER_PHRASES[0].text);
  const [viewMode, setViewMode] = useState<'split' | 'vocab_helper' | 'distribution' | 'heatmap' | 'all'>('split');

  const result = compareTokenizers(inputText);
  const orthography = analyzeOrthography(inputText, language);

  const underRepresentedCount = React.useMemo(() => {
    return analyzeUnderRepresentedSyllables(inputText, undefined, language).filter(s => s.frequencyInText > 0).length;
  }, [inputText, language]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider font-mono">
          <span>{tr('TOKENIZER & ORTHOGRAPHY LAB', 'មន្ទីរពិសោធន៍ថូខិន និងអក្ខរាវិរុទ្ធ')}</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span>{tr('SYLLABLE CLUSTER ENGINE', 'ម៉ាស៊ីនវិភាគព្យាង្គ')}</span>
        </div>
        <h2 className={`text-2xl sm:text-3xl font-bold text-white tracking-tight ${isKm ? 'font-khmer leading-relaxed' : ''}`}>
          {tr('Khmer Tokenization & Scriptio Continua Benchmark', 'ការវាស់ស្ទង់ការបំបែកថូខិនខ្មែរ និងសំណេរជាប់គ្នា (Scriptio Continua)')}
        </h2>
        <p className={`text-sm text-slate-300 max-w-3xl leading-relaxed ${isKm ? 'font-khmer' : ''}`}>
          {isKm ? (
            <>
              ភាសាខ្មែរត្រូវបានសរសេរជាប់ៗគ្នាដោយគ្មានដកឃ្លារវាងពាក្យ (<em className="text-amber-200">Scriptio continua</em>) និងមានជើងព្យញ្ជនៈស្មុគស្មាញ (<span className="font-khmer text-amber-300">ជើង/Coeng</span>)។ ម៉ូដែល LLM លោកខាងលិច (Llama-3, Mistral) ខ្វះវាក្យសព្ទខ្មែរជាក់លាក់ ដែលបណ្ដាលឱ្យពាក្យខ្មែរបែកខ្ញែកជាបំណែកបៃឆៅជាច្រើន។
            </>
          ) : (
            <>
              Khmer is written continuously without spaces between words (<em className="text-amber-200">Scriptio continua</em>) and features complex subscript consonants (<span className="font-khmer text-amber-300">ជើង/Coeng</span>). Western LLMs (Llama-3, Mistral) lack dedicated Khmer vocabulary, exploding words into fragmented raw byte tokens.
            </>
          )}
        </p>
      </div>

      {/* Preset Phrase Picker */}
      <div className="space-y-2">
        <div className="text-xs text-slate-400 font-mono">
          {tr('SELECT BENCHMARK SAMPLE:', 'ជ្រើសរើសអត្ថបទគំរូសម្រាប់វាស់ស្ទង់៖')}
        </div>
        <div className="flex flex-wrap gap-2">
          {SAMPLE_KHMER_PHRASES.map((sample, idx) => (
            <button
              key={idx}
              onClick={() => setInputText(sample.text)}
              className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${isKm ? 'font-khmer' : ''} ${
                inputText === sample.text
                  ? 'bg-amber-400 text-slate-950 font-semibold border-amber-400 shadow-sm'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              {isKm ? sample.titleKm : sample.title}
            </button>
          ))}
        </div>
      </div>

      {/* Live Input Box */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className={isKm ? 'font-khmer' : ''}>
            {tr('Khmer Text to Tokenize & Inspect:', 'អត្ថបទខ្មែរសម្រាប់បំបែកថូខិន និងត្រួតពិនិត្យ៖')}
          </span>
          <span className="font-mono tabular-nums">
            {inputText.length} {tr('characters', 'តួអក្សរ')}
          </span>
        </div>
        <textarea
          rows={3}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="វាយបញ្ចូលអត្ថបទជាភាសាខ្មែរនៅទីនេះ..."
          className="w-full p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-white font-khmer text-base focus:outline-none focus:border-amber-400 transition-colors leading-relaxed"
        />
      </div>

      {/* Real-time Comparative Metrics Deck */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
          <div className="text-[11px] text-slate-400 font-mono">
            {tr('LLAMA-3 TOKENS (RAW BYTES)', 'ថូខិន LLAMA-3 (បៃឆៅ)')}
          </div>
          <div className="text-2xl font-bold font-mono text-rose-400 tabular-nums">
            {result.llamaTokenCount}
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            {tr('Fertility:', 'អត្រាបំបែក៖')} {result.llamaFertility} {tr('tokens/word', 'ថូខិន/ពាក្យ')}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
          <div className="text-[11px] text-slate-400 font-mono">
            {tr('KHMER SENTENCEPIECE (CUSTOM)', 'KHMER SENTENCEPIECE (ផ្ទាល់ខ្លួន)')}
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
            {result.khmerTokenCount}
          </div>
          <div className="text-[11px] text-emerald-500/80 font-mono">
            {tr('Fertility:', 'អត្រាបំបែក៖')} {result.khmerFertility} {tr('tokens/word', 'ថូខិន/ពាក្យ')}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
          <div className="text-[11px] text-slate-400 font-mono">
            {tr('COMPRESSION SAVINGS', 'ការសន្សំសំចៃបង្រួម')}
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400 tabular-nums">
            {result.compressionRatio}×
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            {tr(
              `Tokens reduced by ${Math.round((1 - 1 / result.compressionRatio) * 100)}%`,
              `កាត់បន្ថយថូខិនបាន ${Math.round((1 - 1 / result.compressionRatio) * 100)}%`
            )}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
          <div className="text-[11px] text-slate-400 font-mono">
            {tr('EFFECTIVE CONTEXT GAIN', 'ការបង្កើនទំហំបរិបទ')}
          </div>
          <div className="text-2xl font-bold font-mono text-cyan-400 tabular-nums">
            +{(result.compressionRatio * 100 - 100).toFixed(0)}%
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            {tr(
              `4k context holds ${Math.round(4000 / result.khmerFertility)} words`,
              `បរិបទ 4k ផ្ទុកបាន ${Math.round(4000 / result.khmerFertility)} ពាក្យ`
            )}
          </div>
        </div>
      </div>

      {/* Under-Represented Syllable Discovery Callout Banner */}
      {underRepresentedCount > 0 && viewMode !== 'vocab_helper' && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-amber-950/20 border border-amber-800/40 text-xs">
          <div className={`flex items-center gap-2.5 text-amber-300 ${isKm ? 'font-khmer leading-relaxed' : ''}`}>
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              {isKm ? (
                <>
                  បានរកឃើញ <strong className="text-white font-mono">{underRepresentedCount} ចង្កោមព្យាង្គដែលមានតំណាងតិចតួច</strong> ក្នុងអត្ថបទគំរូនេះ (ជើងព្យញ្ជនៈផ្សំ និងឫសពាក្យបាលី)។ ការបង្រួមពួកវាជាថូខិនតែមួយជួយសន្សំកម្លាំងគណនាពេលបង្វឹកដំបូង។
                </>
              ) : (
                <>
                  Found <strong className="text-white font-mono">{underRepresentedCount} under-represented syllable clusters</strong> in this sample (Coeng subscript ligatures and Pali stems). Unifying them into single tokens saves pretraining compute.
                </>
              )}
            </span>
          </div>
          <button
            onClick={() => setViewMode('vocab_helper')}
            className="flex items-center gap-1.5 text-amber-400 hover:text-white font-mono font-semibold text-[11px] shrink-0 underline underline-offset-4 cursor-pointer"
          >
            <span>{tr('Review Vocab Suggestions', 'ពិនិត្យសំណើវាក្យសព្ទ')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Tokenizer Analysis View Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800">
          <button
            onClick={() => setViewMode('split')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors ${
              viewMode === 'split'
                ? 'bg-amber-400 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Columns2 className="w-3.5 h-3.5" />
            <span>{tr('Split View Mode', 'ទិដ្ឋភាពប្រៀបធៀបទ្វេ')}</span>
          </button>

          <button
            onClick={() => setViewMode('vocab_helper')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors ${
              viewMode === 'vocab_helper'
                ? 'bg-amber-400 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{tr('Vocab Suggester', 'ជំនួយការណែនាំវាក្យសព្ទ')}</span>
            {underRepresentedCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-amber-500/30 text-amber-300 border border-amber-400/40 tabular-nums">
                {underRepresentedCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setViewMode('distribution')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors ${
              viewMode === 'distribution'
                ? 'bg-amber-400 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>{tr('Distribution (D3)', 'របាយថូខិន (D3)')}</span>
          </button>

          <button
            onClick={() => setViewMode('heatmap')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors ${
              viewMode === 'heatmap'
                ? 'bg-amber-400 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Grid3x3 className="w-3.5 h-3.5" />
            <span>{tr('Register Heatmap (D3)', 'ផែនទីកម្ដៅកម្រិតភាសា (D3)')}</span>
          </button>

          <button
            onClick={() => setViewMode('all')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors ${
              viewMode === 'all'
                ? 'bg-amber-400 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{tr('All Visualizers', 'បង្ហាញទាំងអស់')}</span>
          </button>
        </div>

        <div className={`text-xs text-slate-500 font-mono ${isKm ? 'font-khmer' : ''}`}>
          {viewMode === 'split' && tr('Interactive dual-model token mapping with byte-level hover tracking', 'ការផ្គូផ្គងថូខិនម៉ូដែលទាំងពីរជាមួយការតាមដានកម្រិតបៃ')}
          {viewMode === 'vocab_helper' && tr('Recommends high-impact Coeng ligatures and subword additions to SentencePiece', 'ណែនាំជើងព្យញ្ជនៈ និងបំណែកពាក្យសំខាន់ៗសម្រាប់បន្ថែមក្នុង SentencePiece')}
          {viewMode === 'distribution' && tr('D3.js token granularity and subword compression spectrum', 'វិសាលគមទំហំថូខិន និងការបង្រួមបំណែកពាក្យតាម D3.js')}
          {viewMode === 'heatmap' && tr('Linguistic register compression across vocab configurations', 'ការបង្រួមកម្រិតភាសាខ្មែរឆ្លងកាត់ទំហំវាក្យសព្ទផ្សេងៗ')}
          {viewMode === 'all' && tr('Comprehensive diagnostic suite', 'ឈុតវិភាគគ្រប់ជ្រុងជ្រោយ')}
        </div>
      </div>

      {/* 1. Synchronized Tokenizer Split View */}
      {(viewMode === 'split' || viewMode === 'all') && (
        <TokenizerSplitView inputText={inputText} />
      )}

      {/* 2. Khmer Vocabulary Suggestion Helper Component */}
      {(viewMode === 'vocab_helper' || viewMode === 'all') && (
        <VocabSuggestionHelper inputText={inputText} />
      )}

      {/* 3. D3 Interactive Token Distribution & Granularity Spectrum */}
      {(viewMode === 'distribution' || viewMode === 'all') && (
        <TokenDistributionChart comparison={result} />
      )}

      {/* 4. D3 Linguistic Register Compression Heatmap & Vocab Size Optimizer */}
      {(viewMode === 'heatmap' || viewMode === 'all') && (
        <RegisterHeatmapChart onSelectSampleText={(text) => setInputText(text)} />
      )}

      {/* Syllable Clustering & Orthography Validator */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
        {/* Syllable Clusters */}
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className={`text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono ${isKm ? 'font-khmer' : ''}`}>
              {tr('Syllable Cluster Decomposition (ព្យាង្គ)', 'ការបំបែកចង្កោមព្យាង្គខ្មែរ')}
            </h4>
            <span className="text-xs font-mono text-slate-400 tabular-nums">
              {result.syllables.length} {tr('Phonological Clusters', 'ចង្កោមព្យាង្គ')}
            </span>
          </div>

          <p className={`text-xs text-slate-400 ${isKm ? 'font-khmer leading-relaxed' : ''}`}>
            {tr('Khmer syllable boundaries are parsed via:', 'ព្រំដែនព្យាង្គខ្មែរត្រូវបានបំបែកតាមរូបមន្ត៖')}{' '}
            <code className="text-amber-300 font-mono">Consonant + (Coeng + Consonant)* + Vowel* + Diacritic*</code>
          </p>

          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-wrap gap-1.5 max-h-48 overflow-y-auto">
            {result.syllables.map((syl, i) => (
              <span
                key={i}
                className="px-2 py-1 text-xs font-khmer rounded bg-slate-800 border border-slate-700/80 text-amber-200"
              >
                {syl}
              </span>
            ))}
          </div>
        </div>

        {/* Orthography Diagnostic */}
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className={`text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono ${isKm ? 'font-khmer' : ''}`}>
              {tr('Unicode Orthography Integrity Audit', 'សវនកម្មភាពត្រឹមត្រូវនៃអក្ខរាវិរុទ្ធយូនីកូដ')}
            </h4>
            <span className="text-xs font-mono text-slate-400 tabular-nums">
              {tr('Khmer Ratio:', 'សមាមាត្រខ្មែរ៖')} {orthography.khmerCharRatio}%
            </span>
          </div>

          {orthography.issues.length === 0 ? (
            <div className={`flex items-center gap-3 p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/40 text-emerald-300 text-xs ${isKm ? 'font-khmer leading-relaxed' : ''}`}>
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                {isKm ? (
                  <>
                    <strong>លំដាប់យូនីកូដទាំងអស់ត្រឹមត្រូវ៖</strong> ជើងព្យញ្ជនៈ ស្រៈនិស្ស័យ និងវណ្ណយុត្ត គោរពតាមស្តង់ដារយូនីកូដជាតិកម្ពុជាយ៉ាងពេញលេញ។
                  </>
                ) : (
                  <>
                    <strong>All Unicode sequences valid:</strong> Coeng subscripts, dependent vowels, and diacritics strictly adhere to the Cambodian National Unicode Standard.
                  </>
                )}
              </span>
            </div>
          ) : (
            <div className="space-y-2">
              {orthography.issues.map((issue, idx) => (
                <div key={idx} className={`flex items-start gap-2 p-2.5 rounded-lg bg-amber-950/30 border border-amber-800/40 text-xs text-amber-200 ${isKm ? 'font-khmer leading-relaxed' : ''}`}>
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span>{issue}</span>
                </div>
              ))}
            </div>
          )}

          <div className={`text-[11px] text-slate-400 space-y-1 ${isKm ? 'font-khmer leading-relaxed' : ''}`}>
            <div className="font-semibold text-slate-300">
              {tr('How to Train SentencePiece for Khmer:', 'របៀបបង្វឹក SentencePiece សម្រាប់ភាសាខ្មែរ៖')}
            </div>
            <p>
              {isKm ? (
                <>
                  កំណត់ <code className="text-amber-300 font-mono">character_coverage=0.9995</code> និង <code className="text-amber-300 font-mono">byte_fallback=true</code> ដើម្បីធានាថាបន្សំពាក្យបាលីកម្រ ឬពាក្យបច្ចេកទេស មិនបង្កជាកំហុសថូខិន <code className="text-rose-400 font-mono">&lt;unk&gt;</code> ឡើយ។
                </>
              ) : (
                <>
                  Set <code className="text-amber-300 font-mono">character_coverage=0.9995</code> and <code className="text-amber-300 font-mono">byte_fallback=true</code> to guarantee that rare Pali combinations or specialized technical jargon never trigger fatal <code className="text-rose-400 font-mono">&lt;unk&gt;</code> token errors.
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

