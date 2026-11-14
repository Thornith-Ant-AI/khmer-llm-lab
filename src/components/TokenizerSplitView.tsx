import React, { useState } from 'react';
import {
  BaselineModelType,
  KhmerModelType,
  BASELINE_MODELS,
  KHMER_MODELS,
  compareTokenizers
} from '../utils/khmerLinguistics';
import { AnalyzedToken } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import {
  Columns2,
  Hash,
  Binary
} from 'lucide-react';

interface TokenizerSplitViewProps {
  inputText: string;
}

export const TokenizerSplitView: React.FC<TokenizerSplitViewProps> = ({ inputText }) => {
  const { isKm, tr } = useLanguage();
  const [modelA, setModelA] = useState<BaselineModelType>('llama3_tiktoken');
  const [modelB, setModelB] = useState<KhmerModelType>('khmer_spm_32k');

  // Display toggles
  const [showTokenIds, setShowTokenIds] = useState<boolean>(true);
  const [showHexBytes, setShowHexBytes] = useState<boolean>(false);
  const [activeHoverRange, setActiveHoverRange] = useState<{ start: number; end: number } | null>(null);
  const [inspectedToken, setInspectedToken] = useState<{
    token: AnalyzedToken;
    modelName: string;
    modelType: string;
  } | null>(null);

  // Compute comparison dynamically based on selected models
  const comparison = compareTokenizers(inputText, modelA, modelB);
  const metaA = BASELINE_MODELS[modelA];
  const metaB = KHMER_MODELS[modelB];

  const isTokenHighlighted = (t: AnalyzedToken) => {
    if (!activeHoverRange) return false;
    return (
      (t.charStart >= activeHoverRange.start && t.charStart < activeHoverRange.end) ||
      (t.charEnd > activeHoverRange.start && t.charEnd <= activeHoverRange.end) ||
      (t.charStart <= activeHoverRange.start && t.charEnd >= activeHoverRange.end)
    );
  };

  return (
    <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-6">
      {/* Top Header & Split View Configuration */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Columns2 className="w-5 h-5 text-amber-400" />
            <h3 className={`text-base font-bold text-white ${isKm ? 'font-khmer' : ''}`}>
              {tr('Synchronized Tokenizer Split View', 'ទិដ្ឋភាពប្រៀបធៀបការបំបែកថូខិនសមកាលកម្ម')}
            </h3>
          </div>
          <p className={`text-xs text-slate-400 ${isKm ? 'font-khmer leading-relaxed' : ''}`}>
            {tr(
              'Bidirectional side-by-side token mapping. Hover over any token to inspect its corresponding subword or byte-level fragmentation in the opposite model.',
              'ការផ្គូផ្គងថូខិនទ្វេទិសទន្ទឹមគ្នា។ ដាក់ទស្សន៍ទ្រនិចលើថូខិនណាមួយ ដើម្បីពិនិត្យមើលបំណែកពាក្យ ឬការបែកខ្ញែកកម្រិតបៃក្នុងម៉ូដែលម្ខាងទៀត។'
            )}
          </p>
        </div>

        {/* View Options Toggles */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <button
            onClick={() => setShowTokenIds(!showTokenIds)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md border transition-colors ${
              showTokenIds
                ? 'bg-slate-800 border-amber-500/50 text-amber-300'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Hash className="w-3 h-3" />
            <span>{tr('Token IDs', 'លេខសម្គាល់ថូខិន')}</span>
          </button>

          <button
            onClick={() => setShowHexBytes(!showHexBytes)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md border transition-colors ${
              showHexBytes
                ? 'bg-slate-800 border-cyan-500/50 text-cyan-300'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Binary className="w-3 h-3" />
            <span>{tr('Hex Bytes', 'បៃ Hex')}</span>
          </button>
        </div>
      </div>

      {/* Model Selection Headers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Model A Selector (Left) */}
        <div className="space-y-2 p-3.5 rounded-xl bg-slate-950/80 border border-rose-900/40">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono text-rose-400 font-semibold uppercase flex items-center gap-1.5">
              <span>{tr('MODEL A (BASELINE)', 'ម៉ូដែល A (មូលដ្ឋាន)')}</span>
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              {tr('Vocab:', 'វាក្យសព្ទ៖')} {metaA.vocabSize}
            </span>
          </div>

          <select
            value={modelA}
            onChange={(e) => setModelA(e.target.value as BaselineModelType)}
            className="w-full py-1.5 px-3 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-rose-400"
          >
            {Object.entries(BASELINE_MODELS).map(([k, m]) => (
              <option key={k} value={k}>
                {isKm ? `${m.nameKm} (${m.typeKm})` : `${m.name} (${m.type})`}
              </option>
            ))}
          </select>
          <p className={`text-[11px] text-slate-400 ${isKm ? 'font-khmer leading-relaxed' : ''}`}>
            {isKm ? metaA.descriptionKm : metaA.description}
          </p>
        </div>

        {/* Model B Selector (Right) */}
        <div className="space-y-2 p-3.5 rounded-xl bg-slate-950/80 border border-emerald-900/40">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono text-emerald-400 font-semibold uppercase flex items-center gap-1.5">
              <span>{tr('MODEL B (KHMER-OPTIMIZED)', 'ម៉ូដែល B (ប្រសើរសម្រាប់ខ្មែរ)')}</span>
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              {tr('Vocab:', 'វាក្យសព្ទ៖')} {metaB.vocabSize}
            </span>
          </div>

          <select
            value={modelB}
            onChange={(e) => setModelB(e.target.value as KhmerModelType)}
            className="w-full py-1.5 px-3 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-emerald-400"
          >
            {Object.entries(KHMER_MODELS).map(([k, m]) => (
              <option key={k} value={k}>
                {isKm ? `${m.nameKm} (${m.typeKm})` : `${m.name} (${m.type})`}
              </option>
            ))}
          </select>
          <p className={`text-[11px] text-slate-400 ${isKm ? 'font-khmer leading-relaxed' : ''}`}>
            {isKm ? metaB.descriptionKm : metaB.description}
          </p>
        </div>
      </div>

      {/* Delta Performance Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 font-mono text-xs">
        <div>
          <span className="text-[10px] text-slate-500 block">
            {tr('TOKEN COUNT RATIO:', 'សមាមាត្រចំនួនថូខិន៖')}
          </span>
          <span className="text-white font-bold">
            <span className="text-rose-400">{comparison.llamaTokenCount}</span> vs{' '}
            <span className="text-emerald-400">{comparison.khmerTokenCount}</span>
          </span>
        </div>

        <div>
          <span className="text-[10px] text-slate-500 block">
            {tr('COMPRESSION MULTIPLIER:', 'មេគុណបង្រួម៖')}
          </span>
          <span className="text-amber-400 font-bold text-sm">
            {comparison.compressionRatio}× {tr('Savings', 'សន្សំបាន')}
          </span>
        </div>

        <div>
          <span className="text-[10px] text-slate-500 block">
            {tr('MODEL B FERTILITY:', 'អត្រាបំបែកម៉ូដែល B៖')}
          </span>
          <span className="text-emerald-400 font-bold">
            {comparison.khmerFertility} {tr('tokens / word', 'ថូខិន / ពាក្យ')}
          </span>
        </div>

        <div>
          <span className="text-[10px] text-slate-500 block">
            {tr('EFFECTIVE CONTEXT GAIN:', 'ការបង្កើនទំហំបរិបទ៖')}
          </span>
          <span className="text-cyan-400 font-bold">
            +{Math.round((comparison.compressionRatio - 1) * 100)}% {tr('Capacity', 'សមត្ថភាព')}
          </span>
        </div>
      </div>

      {/* Synchronized Side-by-Side Token Streams */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Model A Token Grid */}
        <div className="p-4 rounded-xl border border-rose-900/30 bg-slate-950/60 space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-rose-400 font-bold">{isKm ? metaA.nameKm : metaA.name}</span>
            <span className="text-slate-400 tabular-nums">
              {comparison.llamaTokenCount} {tr('Tokens', 'ថូខិន')}
            </span>
          </div>

          {/* Token Chips Stream */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 min-h-[220px] max-h-[360px] overflow-y-auto flex flex-wrap gap-1.5 content-start">
            {comparison.standardLlamaTokens.map((t, idx) => {
              const isHovered = isTokenHighlighted(t);
              return (
                <div
                  key={idx}
                  onMouseEnter={() => setActiveHoverRange({ start: t.charStart, end: t.charEnd })}
                  onMouseLeave={() => setActiveHoverRange(null)}
                  onClick={() => setInspectedToken({ token: t, modelName: isKm ? metaA.nameKm : metaA.name, modelType: isKm ? metaA.typeKm : metaA.type })}
                  className={`group relative inline-flex flex-col items-center px-1.5 py-0.5 rounded transition-all cursor-pointer font-mono text-[11px] ${
                    isHovered
                      ? 'bg-rose-500 text-white shadow-md shadow-rose-950 ring-2 ring-rose-400 scale-105 z-10'
                      : 'bg-rose-950/40 border border-rose-800/40 text-rose-200 hover:border-rose-400'
                  }`}
                >
                  <span className="font-semibold">{t.token}</span>
                  {showTokenIds && (
                    <span className="text-[9px] opacity-70">#{t.id}</span>
                  )}
                  {showHexBytes && t.rawBytesHex && (
                    <span className="text-[8px] text-amber-300 opacity-90">{t.rawBytesHex}</span>
                  )}
                </div>
              );
            })}
          </div>

          <div className={`text-[11px] text-slate-500 font-mono ${isKm ? 'font-khmer' : ''}`}>
            {tr('Click any token to inspect its UTF-8 hex encoding and character span.', 'ចុចលើថូខិនណាមួយ ដើម្បីត្រួតពិនិត្យកូដបៃ UTF-8 និងចន្លោះតួអក្សររបស់វា។')}
          </div>
        </div>

        {/* Model B Token Grid */}
        <div className="p-4 rounded-xl border border-emerald-900/30 bg-slate-950/60 space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-emerald-400 font-bold">{isKm ? metaB.nameKm : metaB.name}</span>
            <span className="text-slate-400 tabular-nums">
              {comparison.khmerTokenCount} {tr('Tokens', 'ថូខិន')}
            </span>
          </div>

          {/* Token Chips Stream */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 min-h-[220px] max-h-[360px] overflow-y-auto flex flex-wrap gap-1.5 content-start">
            {comparison.khmerOptimizedTokens.map((t, idx) => {
              const isHovered = isTokenHighlighted(t);
              return (
                <div
                  key={idx}
                  onMouseEnter={() => setActiveHoverRange({ start: t.charStart, end: t.charEnd })}
                  onMouseLeave={() => setActiveHoverRange(null)}
                  onClick={() => setInspectedToken({ token: t, modelName: isKm ? metaB.nameKm : metaB.name, modelType: isKm ? metaB.typeKm : metaB.type })}
                  className={`group relative inline-flex flex-col items-center px-2 py-0.5 rounded transition-all cursor-pointer font-khmer text-xs ${
                    isHovered
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-950 ring-2 ring-emerald-300 scale-105 z-10'
                      : 'bg-emerald-950/50 border border-emerald-800/40 text-emerald-200 hover:border-emerald-400'
                  }`}
                >
                  <span className="font-medium">{t.token === ' ' ? '␣' : t.token}</span>
                  {showTokenIds && (
                    <span className="text-[9px] font-mono opacity-70">#{t.id}</span>
                  )}
                  {showHexBytes && t.rawBytesHex && (
                    <span className="text-[8px] font-mono text-cyan-300 opacity-90 truncate max-w-[60px]">{t.rawBytesHex}</span>
                  )}
                </div>
              );
            })}
          </div>

          <div className={`text-[11px] text-slate-500 font-mono ${isKm ? 'font-khmer' : ''}`}>
            {tr('Subwords & syllable clusters stay intact without breaking Coeng ligatures.', 'បំណែកពាក្យ និងចង្កោមព្យាង្គនៅរក្សាភាពពេញលេញដោយមិនបំបែកជើងព្យញ្ជនៈឡើយ។')}
          </div>
        </div>
      </div>

      {/* Inspected Token Detail Drawer */}
      {inspectedToken && (
        <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/40 space-y-2 text-xs animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-mono text-amber-400 font-bold uppercase">
                {tr('TOKEN INSPECTOR', 'កម្មវិធីពិនិត្យថូខិន')}
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-white font-medium">{inspectedToken.modelName}</span>
            </div>
            <button
              onClick={() => setInspectedToken(null)}
              className="text-slate-400 hover:text-white font-mono text-[11px]"
            >
              {tr('Close', 'បិទ')}
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1 font-mono text-[11px] text-slate-300">
            <div>
              <span className="text-slate-500 block">{tr('STRING:', 'អក្សរ៖')}</span>
              <span className="text-white font-bold font-khmer text-sm">{inspectedToken.token.token}</span>
            </div>
            <div>
              <span className="text-slate-500 block">{tr('TOKEN ID:', 'លេខសម្គាល់ថូខិន៖')}</span>
              <span className="text-amber-400 font-bold">#{inspectedToken.token.id}</span>
            </div>
            <div>
              <span className="text-slate-500 block">{tr('BYTE LENGTH:', 'ប្រវែងបៃ៖')}</span>
              <span className="text-white">{inspectedToken.token.bytes} {tr('bytes', 'បៃ')}</span>
            </div>
            <div>
              <span className="text-slate-500 block">{tr('CHAR SPAN:', 'ទីតាំងតួអក្សរ៖')}</span>
              <span className="text-white">[{inspectedToken.token.charStart} : {inspectedToken.token.charEnd}]</span>
            </div>
            <div>
              <span className="text-slate-500 block">{tr('HEX BYTES:', 'បៃ HEX៖')}</span>
              <span className="text-cyan-300">{inspectedToken.token.rawBytesHex || 'N/A'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

