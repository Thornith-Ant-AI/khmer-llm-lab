import React, { useMemo, useState } from 'react';
import {
  Cpu,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Copy,
  Check,
  RotateCcw,
  SlidersHorizontal,
  ArrowRightLeft
} from 'lucide-react';
import {
  compareTokenizers,
  segmentKhmerSyllables,
  detectLimonFont,
  analyzeOrthography,
  KHMER_MODELS,
  KhmerModelType,
  SAMPLE_KHMER_PHRASES
} from '../utils/khmerLinguistics';
import { AnalyzedToken } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

export type SentencePieceVocabTier = '8k_undertrained' | '32k_balanced' | '64k_extended';

type FragmentKind = 'compound' | 'syllable' | 'fragment' | 'punctuation';

interface SandboxToken extends AnalyzedToken {
  displayPiece: string;
  kind: FragmentKind;
  codepoints: string[];
}

interface SandboxAnalysis {
  tokens: SandboxToken[];
  charCount: number;
  utf8Bytes: number;
  syllableCount: number;
  llamaTokenCount: number;
  spmTokenCount: number;
  compressionVsBytes: number; // UTF-8 bytes per token
  compressionVsBaseline: number; // Llama tokens / SPM tokens
  tokensPerChar: number;
  charsPerToken: number;
  contextSavedPct: number;
  breakdown: {
    compound: number;
    syllable: number;
    fragment: number;
    punctuation: number;
  };
  grade: 'optimal' | 'moderate' | 'fragmented';
  feedbackTitle: string;
  feedbackTitleKm: string;
  feedbackDetail: string;
  feedbackDetailKm: string;
  hasLimon: boolean;
  orthographyIssues: string[];
}

const SANDBOX_PRESETS: Array<{
  id: string;
  label: string;
  labelKm: string;
  text: string;
}> = [
  {
    id: 'policy',
    label: 'Policy & AI',
    labelKm: 'គោលនយោបាយ AI',
    text: 'រាជរដ្ឋាភិបាលកម្ពុជាបានប្រកាសដាក់ចេញនូវផែនការយុទ្ធសាស្ត្រជាតិសម្រាប់ការអភិវឌ្ឍសេដ្ឋកិច្ចឌីជីថលនិងបញ្ញាសិប្បនិម្មិត។'
  },
  {
    id: 'pali_coeng',
    label: 'Dense Coeng Stacks',
    labelKm: 'ចង្កោមជើងស្មុគស្មាញ',
    text: 'ព្រះរាជាណាចក្រកម្ពុជា ប្រារព្ធពិធីសម្ពោធវិទ្យាស្ថានស្រាវជ្រាវសុខាភិបាល និងបច្ចេកវិទ្យាជីវសាស្ត្រកម្រិតខ្ពស់។'
  },
  {
    id: 'bilingual_code',
    label: 'Khmer + English Mixed',
    labelKm: 'លាយខ្មែរ + អង់គ្លេស',
    text: 'ការប្រើប្រាស់ SentencePiece vocab_size=32000 ជាមួយ NFC normalization ជួយកាត់បន្ថយ fertility rate នៃអត្ថបទខ្មែរ។'
  },
  {
    id: 'limon',
    label: 'Limon Legacy Trap',
    labelKm: 'កូដ Limon ចាស់',
    text: SAMPLE_KHMER_PHRASES[3].text
  }
];

function classifyToken(
  token: AnalyzedToken,
  vocabTier: SentencePieceVocabTier,
  modelType: KhmerModelType
): SandboxToken[] {
  const isWhitespaceOrPunct = /^[\s\u17D4-\u17DA.,!?;:="'()\[\]{}0-9A-Za-z_-]+$/.test(token.token);

  // Under 8K vocab, long Khmer multi-syllable words get split further into sub-syllables / single codepoints
  if (vocabTier === '8k_undertrained' && !isWhitespaceOrPunct && token.token.length >= 4) {
    const syllables = segmentKhmerSyllables(token.token);
    const subPieces: string[] = [];
    for (const syl of syllables) {
      if (syl.length > 3) {
        const mid = Math.ceil(syl.length / 2);
        subPieces.push(syl.slice(0, mid), syl.slice(mid));
      } else {
        subPieces.push(syl);
      }
    }

    let runningOffset = token.charStart;
    return subPieces.map((piece, idx) => {
      const encoded = new TextEncoder().encode(piece);
      const start = runningOffset;
      const end = start + piece.length;
      runningOffset = end;
      return {
        id: token.id * 10 + idx,
        token: piece,
        displayPiece: piece === ' ' ? '▁' : idx === 0 ? `▁${piece}` : piece,
        bytes: encoded.length,
        charStart: start,
        charEnd: end,
        rawBytesHex: Array.from(encoded)
          .map((b) => b.toString(16).toUpperCase().padStart(2, '0'))
          .join(' '),
        kind: piece.length <= 2 ? 'fragment' : 'syllable',
        codepoints: Array.from(piece).map(
          (ch) => `U+${ch.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0')}`
        )
      };
    });
  }

  // In Unigram 32K, occasional long compounds decompose into stems
  if (modelType === 'khmer_unigram_32k' && !isWhitespaceOrPunct && token.token.length >= 10) {
    const syllables = segmentKhmerSyllables(token.token);
    if (syllables.length >= 3) {
      const splitPoint = Math.ceil(syllables.length / 2);
      const left = syllables.slice(0, splitPoint).join('');
      const right = syllables.slice(splitPoint).join('');
      const halves = [left, right].filter(Boolean);
      let runningOffset = token.charStart;
      return halves.map((piece, idx) => {
        const encoded = new TextEncoder().encode(piece);
        const start = runningOffset;
        const end = start + piece.length;
        runningOffset = end;
        return {
          id: token.id * 10 + idx,
          token: piece,
          displayPiece: idx === 0 ? `▁${piece}` : piece,
          bytes: encoded.length,
          charStart: start,
          charEnd: end,
          rawBytesHex: Array.from(encoded)
            .map((b) => b.toString(16).toUpperCase().padStart(2, '0'))
            .join(' '),
          kind: 'syllable',
          codepoints: Array.from(piece).map(
            (ch) => `U+${ch.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0')}`
          )
        };
      });
    }
  }

  let kind: FragmentKind = 'syllable';
  if (isWhitespaceOrPunct) {
    kind = 'punctuation';
  } else if (token.token.length >= 4) {
    kind = 'compound';
  } else if (token.token.length === 1 || /\u17D2$/.test(token.token)) {
    kind = 'fragment';
  }

  const displayPiece = token.token === ' ' ? '▁' : token.token;

  return [
    {
      ...token,
      displayPiece,
      kind,
      codepoints: Array.from(token.token).map(
        (ch) => `U+${ch.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0')}`
      )
    }
  ];
}

export interface TokenizerSandboxProps {
  externalText?: string;
}

export const TokenizerSandbox: React.FC<TokenizerSandboxProps> = ({ externalText }) => {
  const { language, isKm, tr } = useLanguage();
  const [rawText, setRawText] = useState<string>(
    externalText && externalText.trim().length > 0 ? externalText : SANDBOX_PRESETS[0].text
  );
  const [modelType, setModelType] = useState<KhmerModelType>('khmer_spm_32k');
  const [vocabTier, setVocabTier] = useState<SentencePieceVocabTier>('32k_balanced');
  const [showWhitespaceGlyph, setShowWhitespaceGlyph] = useState<boolean>(true);
  const [selectedTokenIdx, setSelectedTokenIdx] = useState<number | null>(0);
  const [copiedTokens, setCopiedTokens] = useState<boolean>(false);

  const analysis = useMemo<SandboxAnalysis>(() => {
    const trimmed = rawText;
    if (!trimmed) {
      return {
        tokens: [],
        charCount: 0,
        utf8Bytes: 0,
        syllableCount: 0,
        llamaTokenCount: 0,
        spmTokenCount: 0,
        compressionVsBytes: 0,
        compressionVsBaseline: 0,
        tokensPerChar: 0,
        charsPerToken: 0,
        contextSavedPct: 0,
        breakdown: { compound: 0, syllable: 0, fragment: 0, punctuation: 0 },
        grade: 'moderate',
        feedbackTitle: tr('Enter Khmer text to inspect SentencePiece splits', 'បញ្ចូលអត្ថបទខ្មែរដើម្បីមើលការបំបែក SentencePiece'),
        feedbackTitleKm: 'បញ្ចូលអត្ថបទខ្មែរដើម្បីមើលការបំបែក SentencePiece',
        feedbackDetail: tr(
          'Type or select a preset phrase above to measure subword fragmentation and compression ratios.',
          'វាយបញ្ចូលអត្ថបទ ឬជ្រើសរើសឃ្លាគំរូខាងលើ ដើម្បីវាស់ស្ទង់ការបំបែកពាក្យ និងសមាមាត្របង្រួម។'
        ),
        feedbackDetailKm: 'វាយបញ្ចូលអត្ថបទ ឬជ្រើសរើសឃ្លាគំរូខាងលើ ដើម្បីវាស់ស្ទង់ការបំបែកពាក្យ និងសមាមាត្របង្រួម។',
        hasLimon: false,
        orthographyIssues: []
      };
    }

    const baseCompare = compareTokenizers(trimmed, 'llama3_tiktoken', modelType);
    const expandedTokens: SandboxToken[] = [];
    for (const tok of baseCompare.khmerOptimizedTokens) {
      const pieces = classifyToken(tok, vocabTier, modelType);
      expandedTokens.push(...pieces);
    }

    const utf8Bytes = new TextEncoder().encode(trimmed).length;
    const charCount = trimmed.length;
    const spmTokenCount = Math.max(1, expandedTokens.length);
    const llamaTokenCount = Math.max(1, baseCompare.llamaTokenCount);

    const compressionVsBytes = Number((utf8Bytes / spmTokenCount).toFixed(2));
    const compressionVsBaseline = Number((llamaTokenCount / spmTokenCount).toFixed(2));
    const tokensPerChar = Number((spmTokenCount / Math.max(1, charCount)).toFixed(2));
    const charsPerToken = Number((charCount / spmTokenCount).toFixed(2));
    const contextSavedPct = Math.max(0, Math.round((1 - spmTokenCount / llamaTokenCount) * 100));

    const breakdown = { compound: 0, syllable: 0, fragment: 0, punctuation: 0 };
    for (const t of expandedTokens) {
      breakdown[t.kind]++;
    }

    const limon = detectLimonFont(trimmed);
    const orthography = analyzeOrthography(trimmed, language);

    let grade: SandboxAnalysis['grade'] = 'optimal';
    let feedbackTitle = 'High Compression Efficiency (Coeng-Preserving)';
    let feedbackTitleKm = 'ប្រសិទ្ធភាពបង្រួមខ្ពស់ (រក្សាទម្រង់ជើង Coeng)';
    let feedbackDetail = `SentencePiece compresses ${utf8Bytes} UTF-8 bytes into ${spmTokenCount} tokens (${compressionVsBaseline}× fewer tokens than byte-level LLaMA-3), saving ${contextSavedPct}% of your context window.`;
    let feedbackDetailKm = `SentencePiece បង្រួម ${utf8Bytes} បៃ UTF-8 មកត្រឹម ${spmTokenCount} ថូខិន (តិចជាង LLaMA-3 ចំនួន ${compressionVsBaseline}×) សន្សំទំហំបរិបទបាន ${contextSavedPct}%។`;

    if (limon.hasLimon) {
      grade = 'fragmented';
      feedbackTitle = 'Legacy Limon ASCII Detected — Poor Compression';
      feedbackTitleKm = 'រកឃើញអក្សរ Limon ចាស់ៗ — ការបង្រួមទាប';
      feedbackDetail = `Detected legacy Limon patterns (${limon.matchedWords.slice(0, 3).join(', ')}). Transcode to Unicode NFC before running SentencePiece to avoid corrupted ASCII fragments.`;
      feedbackDetailKm = `រកឃើញលំនាំអក្សរ Limon ចាស់ (${limon.matchedWords.slice(0, 3).join(', ')})។ សូមបម្លែងទៅ Unicode NFC មុនពេលបំបែក SentencePiece។`;
    } else if (compressionVsBaseline < 2.2 || vocabTier === '8k_undertrained') {
      grade = 'fragmented';
      feedbackTitle = 'High Subword Fragmentation Detected';
      feedbackTitleKm = 'រកឃើញការបែកខ្ញែកអនុពាក្យខ្ពស់';
      feedbackDetail = `Compression ratio dropped to ${compressionVsBaseline}× (${tokensPerChar} tokens/char). Expand Khmer SentencePiece vocabulary to 32K–64K and lock Coeng clusters in user_defined_symbols.`;
      feedbackDetailKm = `សមាមាត្របង្រួមធ្លាក់មកត្រឹម ${compressionVsBaseline}× (${tokensPerChar} ថូខិន/តួអក្សរ)។ សូមពង្រីកវាក្យសព្ទ SentencePiece ដល់ 32K–64K និងចាក់សោចង្កោមជើង Coeng។`;
    } else if (compressionVsBaseline < 3.6 || orthography.issues.length > 0) {
      grade = 'moderate';
      feedbackTitle = 'Moderate Subword Compression';
      feedbackTitleKm = 'ការបង្រួមអនុពាក្យកម្រិតមធ្យម';
      feedbackDetail = `Achieving ${compressionVsBytes} UTF-8 bytes/token (${charsPerToken} chars/token). ${
        orthography.issues.length > 0
          ? 'Mixed scripts or Unicode anomalies limit larger compound merges.'
          : 'Adding frequent domain stems can further merge 2-syllable sequences.'
      }`;
      feedbackDetailKm = `ទទួលបាន ${compressionVsBytes} បៃ UTF-8/ថូខិន (${charsPerToken} តួអក្សរ/ថូខិន)។ ${
        orthography.issues.length > 0
          ? 'ការលាយអក្សរផ្សេង ឬលំដាប់ Unicode កាត់បន្ថយការរួមបញ្ចូលពាក្យវែង។'
          : 'ការបន្ថែមឫសពាក្យបច្ចេកទេសញឹកញាប់អាចបង្រួមពាក្យបានកាន់តែល្អ។'
      }`;
    }

    return {
      tokens: expandedTokens,
      charCount,
      utf8Bytes,
      syllableCount: baseCompare.syllables.length,
      llamaTokenCount,
      spmTokenCount,
      compressionVsBytes,
      compressionVsBaseline,
      tokensPerChar,
      charsPerToken,
      contextSavedPct,
      breakdown,
      grade,
      feedbackTitle,
      feedbackTitleKm,
      feedbackDetail,
      feedbackDetailKm,
      hasLimon: limon.hasLimon,
      orthographyIssues: orthography.issues
    };
  }, [rawText, modelType, vocabTier, language, tr]);

  const activeToken =
    selectedTokenIdx !== null && analysis.tokens[selectedTokenIdx]
      ? analysis.tokens[selectedTokenIdx]
      : analysis.tokens[0] || null;

  const handleCopyTokenList = async () => {
    if (analysis.tokens.length === 0) return;
    const formatted = analysis.tokens
      .map((t) => (showWhitespaceGlyph ? t.displayPiece : t.token))
      .join(' | ');
    try {
      await navigator.clipboard.writeText(formatted);
      setCopiedTokens(true);
      window.setTimeout(() => setCopiedTokens(false), 2000);
    } catch {
      // Ignore clipboard failure
    }
  };

  const getTokenStyle = (kind: FragmentKind, isSelected: boolean) => {
    const ring = isSelected ? 'ring-2 ring-white/80' : '';
    switch (kind) {
      case 'compound':
        return `bg-emerald-500/15 border-emerald-500/50 text-emerald-200 hover:bg-emerald-500/25 ${ring}`;
      case 'syllable':
        return `bg-cyan-500/15 border-cyan-500/45 text-cyan-200 hover:bg-cyan-500/25 ${ring}`;
      case 'fragment':
        return `bg-rose-500/20 border-rose-500/50 text-rose-200 hover:bg-rose-500/30 ${ring}`;
      case 'punctuation':
        return `bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800 ${ring}`;
    }
  };

  const getKindLabel = (kind: FragmentKind) => {
    switch (kind) {
      case 'compound':
        return tr('Merged Compound', 'សមាសនាមរួម');
      case 'syllable':
        return tr('Syllable Cluster', 'ចង្កោមព្យាង្គ');
      case 'fragment':
        return tr('Sub-cluster Fragment', 'បំណែកអនុព្យាង្គ');
      case 'punctuation':
        return tr('Space / Punct / ASCII', 'ដកឃ្លា / វណ្ណយុត្ត / ASCII');
    }
  };

  const totalTokensForBar = Math.max(1, analysis.tokens.length);
  const compoundPct = (analysis.breakdown.compound / totalTokensForBar) * 100;
  const syllablePct = (analysis.breakdown.syllable / totalTokensForBar) * 100;
  const fragmentPct = (analysis.breakdown.fragment / totalTokensForBar) * 100;
  const punctPct = (analysis.breakdown.punctuation / totalTokensForBar) * 100;

  return (
    <section
      aria-labelledby="tokenizer-sandbox-heading"
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
            <Cpu className="w-3.5 h-3.5 shrink-0" />
            <span>{tr('SENTENCEPIECE INTERACTIVE SANDBOX', 'ប្រអប់សាកល្បង SENTENCEPIECE ផ្ទាល់')}</span>
            <span aria-hidden="true" className="text-slate-600">
              ·
            </span>
            <span className="text-slate-300 font-mono">
              {KHMER_MODELS[modelType].vocabSize} {tr('Vocab', 'វាក្យសព្ទ')}
            </span>
          </div>
          <h3
            id="tokenizer-sandbox-heading"
            className={`text-xl font-bold text-white tracking-tight ${isKm ? 'font-khmer' : ''}`}
          >
            {tr(
              'Tokenizer Sandbox: Real-Time SentencePiece Subword Visualizer',
              'ប្រអប់សាកល្បង Tokenizer៖ ការបង្ហាញការបំបែកពាក្យ SentencePiece ភ្លាមៗ'
            )}
          </h3>
          <p className={`text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed ${isKm ? 'font-khmer' : ''}`}>
            {tr(
              'Input any raw Khmer text to watch SentencePiece segment continuous script into merged compounds, phonological syllable clusters, and sub-word fragments with live compression ratio diagnostics.',
              'បញ្ចូលអត្ថបទខ្មែរឆៅណាមួយ ដើម្បីមើលរបៀបដែល SentencePiece បំបែកសំណេរជាប់គ្នាទៅជាសមាសនាមរួម ចង្កោមព្យាង្គ និងបំណែកអនុពាក្យ ព្រមទាំងវាយតម្លៃសមាមាត្របង្រួមភ្លាមៗ។'
            )}
          </p>
        </div>

        {/* Optional Sync from Parent Lab Input */}
        {externalText !== undefined && externalText !== rawText && (
          <button
            type="button"
            onClick={() => {
              setRawText(externalText);
              setSelectedTokenIdx(0);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border border-cyan-500/40 bg-cyan-500/15 text-cyan-300 hover:bg-cyan-500/25 transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 self-start lg:self-auto ${
              isKm ? 'font-khmer' : 'font-mono'
            }`}
          >
            <ArrowRightLeft className="w-3.5 h-3.5 shrink-0" />
            <span>{tr('Sync Lab Text', 'ទាញអត្ថបទពី Lab')}</span>
          </button>
        )}
      </div>

      {/* Presets & SentencePiece Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Raw Khmer Text Editor */}
        <div className="lg:col-span-7 space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              {SANDBOX_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => {
                    setRawText(preset.text);
                    setSelectedTokenIdx(0);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] border transition-colors whitespace-nowrap shrink-0 ${
                    isKm ? 'font-khmer' : 'font-mono'
                  } ${
                    rawText === preset.text
                      ? 'bg-amber-400 text-slate-950 border-amber-400 font-bold'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  {isKm ? preset.labelKm : preset.label}
                </button>
              ))}
            </div>

            {rawText && (
              <button
                type="button"
                onClick={() => {
                  setRawText('');
                  setSelectedTokenIdx(null);
                }}
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
            rows={4}
            value={rawText}
            onChange={(e) => {
              setRawText(e.target.value);
              setSelectedTokenIdx(0);
            }}
            aria-label={tr('Raw Khmer text input for SentencePiece sandbox', 'បញ្ចូលអត្ថបទខ្មែរសម្រាប់ប្រអប់សាកល្បង SentencePiece')}
            placeholder={tr(
              'Type or paste raw Khmer script here to observe SentencePiece subword fragmentation...',
              'វាយ ឬបិទភ្ជាប់អត្ថបទខ្មែរនៅទីនេះ ដើម្បីមើលការបំបែកអនុពាក្យ SentencePiece...'
            )}
            className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 text-white font-khmer text-base leading-relaxed placeholder:text-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
          />

          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-400 tabular-nums">
            <span>
              {analysis.charCount} {tr('chars', 'តួអក្សរ')} · {analysis.utf8Bytes} {tr('UTF-8 bytes', 'បៃ UTF-8')} ·{' '}
              {analysis.syllableCount} {tr('syllables', 'ព្យាង្គ')}
            </span>
            <span>
              {tr('LLaMA-3 Byte Baseline:', 'មូលដ្ឋាន LLaMA-3៖')} {analysis.llamaTokenCount}{' '}
              {tr('tokens', 'ថូខិន')}
            </span>
          </div>
        </div>

        {/* SentencePiece Model & Vocab Configuration */}
        <div className="lg:col-span-5 p-4 rounded-xl border border-slate-800 bg-slate-950/70 space-y-3.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
            <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className={isKm ? 'font-khmer' : 'font-mono'}>
              {tr('SENTENCEPIECE CONFIGURATION', 'ការកំណត់ SENTENCEPIECE')}
            </span>
          </div>

          {/* Model Family */}
          <div className="space-y-1">
            <label
              htmlFor="sandbox-spm-model"
              className={`block text-[11px] text-slate-400 ${isKm ? 'font-khmer' : 'font-mono'}`}
            >
              {tr('Subword Algorithm Profile', 'គំរូក្បួនដោះស្រាយអនុពាក្យ')}
            </label>
            <select
              id="sandbox-spm-model"
              value={modelType}
              onChange={(e) => setModelType(e.target.value as KhmerModelType)}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-white focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              {Object.entries(KHMER_MODELS).map(([key, meta]) => (
                <option key={key} value={key}>
                  {isKm ? meta.nameKm : meta.name}
                </option>
              ))}
            </select>
          </div>

          {/* Vocab Training Budget Simulation */}
          <div className="space-y-1.5">
            <span className={`block text-[11px] text-slate-400 ${isKm ? 'font-khmer' : 'font-mono'}`}>
              {tr('Vocabulary Coverage Simulation', 'ការក្លែងធ្វើទំហំវាក្យសព្ទ')}
            </span>
            <div className="grid grid-cols-3 gap-1 p-1 rounded-lg bg-slate-900 border border-slate-800">
              {(
                [
                  { id: '8k_undertrained', label: '8K (Sparse)' },
                  { id: '32k_balanced', label: '32K (Optimal)' },
                  { id: '64k_extended', label: '64K (Dense)' }
                ] as const
              ).map((tier) => (
                <button
                  key={tier.id}
                  type="button"
                  onClick={() => setVocabTier(tier.id)}
                  className={`py-1.5 px-2 rounded text-[11px] font-mono transition-colors whitespace-nowrap shrink-0 ${
                    vocabTier === tier.id
                      ? 'bg-amber-400 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tier.label}
                </button>
              ))}
            </div>
          </div>

          {/* Whitespace Glyphs Toggle */}
          <div className="flex items-center justify-between pt-1">
            <span className={`text-[11px] text-slate-400 ${isKm ? 'font-khmer' : 'font-mono'}`}>
              {tr('Show SentencePiece boundary (▁)', 'បង្ហាញសញ្ញាព្រំដែន (▁)')}
            </span>
            <button
              type="button"
              onClick={() => setShowWhitespaceGlyph((v) => !v)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-mono border transition-colors whitespace-nowrap shrink-0 ${
                showWhitespaceGlyph
                  ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300 font-semibold'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {showWhitespaceGlyph ? tr('▁ Visible', 'បង្ហាញ ▁') : tr('Hidden', 'លាក់')}
            </button>
          </div>
        </div>
      </div>

      {/* Compression Ratio Metrics Strip (tabular-nums) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-1">
          <div className="text-[11px] font-mono text-slate-400">
            {tr('SENTENCEPIECE TOKENS', 'ចំនួនថូខិន SENTENCEPIECE')}
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
            {analysis.spmTokenCount}
          </div>
          <div className="text-[11px] font-mono text-slate-500 tabular-nums">
            {analysis.tokensPerChar} {tr('tok/char', 'ថូខិន/តួអក្សរ')}
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-1">
          <div className="text-[11px] font-mono text-slate-400">
            {tr('COMPRESSION VS BYTE BPE', 'ការបង្រួមធៀបនឹង BYTE BPE')}
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400 tabular-nums">
            {analysis.compressionVsBaseline}×
          </div>
          <div className="text-[11px] font-mono text-slate-500 tabular-nums">
            {analysis.contextSavedPct}% {tr('context window saved', 'សន្សំបរិបទ')}
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-1">
          <div className="text-[11px] font-mono text-slate-400">
            {tr('UTF-8 BYTE COMPRESSION', 'ការបង្រួមបៃ UTF-8')}
          </div>
          <div className="text-2xl font-bold font-mono text-cyan-400 tabular-nums">
            {analysis.compressionVsBytes} B/tok
          </div>
          <div className="text-[11px] font-mono text-slate-500 tabular-nums">
            {analysis.charsPerToken} {tr('chars/token', 'តួអក្សរ/ថូខិន')}
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-1">
          <div className="text-[11px] font-mono text-slate-400">
            {tr('INTACT MERGE RATE', 'អត្រាពាក្យរួមបញ្ចូលពេញ')}
          </div>
          <div className="text-2xl font-bold font-mono text-white tabular-nums">
            {analysis.tokens.length > 0
              ? `${Math.round(((analysis.breakdown.compound + analysis.breakdown.syllable) / analysis.tokens.length) * 100)}%`
              : '0%'}
          </div>
          <div className="text-[11px] font-mono text-slate-500 tabular-nums">
            {analysis.breakdown.fragment} {tr('sub-cluster splits', 'បំណែកអនុព្យាង្គ')}
          </div>
        </div>
      </div>

      {/* Live Token Fragmentation Stream */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className={`font-semibold text-white flex items-center gap-1.5 ${isKm ? 'font-khmer' : 'font-mono'}`}>
              <Layers className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>{tr('SUBWORD TOKEN STREAM', 'លំហូរថូខិនអនុពាក្យ')}</span>
            </span>
            <span className="text-[11px] text-slate-400 font-mono flex flex-wrap items-center gap-2">
              <span className="text-emerald-300">● {tr('Compound', 'សមាសនាម')} ({analysis.breakdown.compound})</span>
              <span aria-hidden="true" className="text-slate-700">·</span>
              <span className="text-cyan-300">● {tr('Syllable', 'ព្យាង្គ')} ({analysis.breakdown.syllable})</span>
              <span aria-hidden="true" className="text-slate-700">·</span>
              <span className="text-rose-300">● {tr('Fragment', 'បំណែកតូច')} ({analysis.breakdown.fragment})</span>
            </span>
          </div>

          <button
            type="button"
            disabled={analysis.tokens.length === 0}
            onClick={handleCopyTokenList}
            className={`px-2.5 py-1 rounded-lg text-[11px] border border-slate-800 bg-slate-950 text-slate-300 hover:text-white disabled:opacity-40 transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              isKm ? 'font-khmer' : 'font-mono'
            }`}
          >
            {copiedTokens ? (
              <Check className="w-3 h-3 text-emerald-400 shrink-0" />
            ) : (
              <Copy className="w-3 h-3 shrink-0" />
            )}
            <span>{copiedTokens ? tr('Copied Pieces', 'បានចម្លង') : tr('Copy Token Pieces', 'ចម្លងបំណែកថូខិន')}</span>
          </button>
        </div>

        {/* Proportional Fragmentation Distribution Bar */}
        {analysis.tokens.length > 0 && (
          <div
            className="h-2 w-full rounded-full bg-slate-950 border border-slate-800 overflow-hidden flex"
            aria-label={tr('Subword composition breakdown bar', 'របារបង្ហាញសមាមាត្រប្រភេទថូខិន')}
          >
            {compoundPct > 0 && <div className="h-full bg-emerald-400" style={{ width: `${compoundPct}%` }} />}
            {syllablePct > 0 && <div className="h-full bg-cyan-400" style={{ width: `${syllablePct}%` }} />}
            {fragmentPct > 0 && <div className="h-full bg-rose-400" style={{ width: `${fragmentPct}%` }} />}
            {punctPct > 0 && <div className="h-full bg-slate-600" style={{ width: `${punctPct}%` }} />}
          </div>
        )}

        {/* Interactive Token Chips Grid */}
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/90 min-h-[96px] flex flex-wrap gap-1.5 items-start">
          {analysis.tokens.length > 0 ? (
            analysis.tokens.map((tok, idx) => {
              const isSelected = selectedTokenIdx === idx;
              const labelText = showWhitespaceGlyph ? tok.displayPiece : tok.token === ' ' ? '␣' : tok.token;
              return (
                <button
                  key={`${tok.id}-${idx}`}
                  type="button"
                  onClick={() => setSelectedTokenIdx(idx)}
                  className={`px-2 py-1 rounded-md border text-sm font-khmer transition-all cursor-pointer flex items-baseline gap-1.5 ${getTokenStyle(
                    tok.kind,
                    isSelected
                  )}`}
                >
                  <span>{labelText}</span>
                  <span className="text-[10px] font-mono opacity-60 tabular-nums">#{tok.id}</span>
                </button>
              );
            })
          ) : (
            <div className={`w-full text-center py-4 text-xs text-slate-500 ${isKm ? 'font-khmer' : ''}`}>
              {tr('Enter Khmer text above to generate subword tokens.', 'សូមបញ្ចូលអត្ថបទខ្មែរខាងលើ ដើម្បីបង្កើតថូខិនអនុពាក្យ។')}
            </div>
          )}
        </div>

        {/* Selected Token Inspector Strip */}
        {activeToken && (
          <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/70 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-slate-400">{tr('INSPECTING TOKEN:', 'ពិនិត្យថូខិន៖')}</span>
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-amber-300 font-khmer text-sm">
                {activeToken.displayPiece}
              </span>
              <span className="text-slate-300 tabular-nums">ID #{activeToken.id}</span>
              <span aria-hidden="true" className="text-slate-700">·</span>
              <span className="text-cyan-300">{getKindLabel(activeToken.kind)}</span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 tabular-nums">
              <span>{activeToken.bytes} {tr('bytes', 'បៃ')}</span>
              <span aria-hidden="true" className="text-slate-700">·</span>
              <span>Hex: {activeToken.rawBytesHex}</span>
              <span aria-hidden="true" className="text-slate-700">·</span>
              <span>{activeToken.codepoints.slice(0, 4).join(' ')}</span>
            </div>
          </div>
        )}
      </div>

      {/* Compression Ratio Feedback Banner */}
      <div
        className={`p-4 rounded-xl border flex items-start gap-3 ${
          analysis.grade === 'optimal'
            ? 'border-emerald-500/40 bg-emerald-950/20 text-emerald-200'
            : analysis.grade === 'moderate'
              ? 'border-amber-500/40 bg-amber-950/20 text-amber-200'
              : 'border-rose-500/40 bg-rose-950/20 text-rose-200'
        }`}
      >
        {analysis.grade === 'optimal' ? (
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        ) : analysis.grade === 'moderate' ? (
          <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        ) : (
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
        )}
        <div className="space-y-1 text-xs">
          <div className={`font-bold ${isKm ? 'font-khmer' : ''}`}>
            {isKm ? analysis.feedbackTitleKm : analysis.feedbackTitle}
          </div>
          <p className={`opacity-90 leading-relaxed ${isKm ? 'font-khmer' : ''}`}>
            {isKm ? analysis.feedbackDetailKm : analysis.feedbackDetail}
          </p>
          {analysis.orthographyIssues.length > 0 && (
            <div className={`pt-1 flex items-center gap-1.5 text-[11px] text-amber-300 ${isKm ? 'font-khmer' : ''}`}>
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>{analysis.orthographyIssues[0]}</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
