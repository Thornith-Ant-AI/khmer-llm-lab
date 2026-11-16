import React, { useMemo, useState } from 'react';
import {
  analyzeKhmerSyntax,
  KhmerSyntaxCategory,
  KhmerSyllableHighlightUnit,
  KhmerSyntaxToken
} from '../utils/khmerSyntaxHighlighter';
import { useLanguage } from '../contexts/LanguageContext';
import { Code2, Eye, Layers } from 'lucide-react';

interface KhmerSyntaxHighlighterProps {
  text: string;
}

type HighlightFilter = 'all' | 'consonant' | 'vowel' | 'coeng_stack' | 'diacritic';
type DisplayMode = 'cluster_flow' | 'atomic_stream';

export const KhmerSyntaxHighlighter: React.FC<KhmerSyntaxHighlighterProps> = ({ text }) => {
  const { isKm, tr } = useLanguage();
  const [displayMode, setDisplayMode] = useState<DisplayMode>('cluster_flow');
  const [activeFilter, setActiveFilter] = useState<HighlightFilter>('all');
  const [hoveredUnitId, setHoveredUnitId] = useState<number | null>(null);

  const analysis = useMemo(() => analyzeKhmerSyntax(text), [text]);

  const categoryLabel = (cat: KhmerSyntaxCategory) => {
    switch (cat) {
      case 'consonant':
        return tr('Consonant', 'ព្យញ្ជនៈ');
      case 'vowel':
        return tr('Vowel', 'ស្រៈ');
      case 'coeng_stack':
        return tr('Coeng Stack', 'ជើងព្យញ្ជនៈ');
      case 'diacritic':
        return tr('Diacritic', 'វណ្ណយុត្ត');
      case 'punctuation':
        return tr('Punctuation', 'វណ្ណយុត្តិឃ្លា');
      case 'numeral':
        return tr('Numeral', 'តួលេខ');
      default:
        return tr('Other / Space', 'ផ្សេងៗ');
    }
  };

  const categoryBadgeCode = (cat: KhmerSyntaxCategory) => {
    switch (cat) {
      case 'consonant':
        return 'C';
      case 'vowel':
        return 'V';
      case 'coeng_stack':
        return '្C';
      case 'diacritic':
        return 'D';
      case 'punctuation':
        return 'P';
      case 'numeral':
        return '#';
      default:
        return '·';
    }
  };

  const getTokenChipStyles = (cat: KhmerSyntaxCategory, isValid: boolean, dimmed: boolean) => {
    if (dimmed) {
      return 'opacity-25 bg-slate-950 border-slate-800/40 text-slate-500';
    }
    if (!isValid) {
      return 'bg-rose-950/60 border-rose-500/70 text-rose-300';
    }
    switch (cat) {
      case 'consonant':
        return 'bg-amber-950/40 border-amber-500/40 text-amber-300';
      case 'vowel':
        return 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300';
      case 'coeng_stack':
        return 'bg-cyan-950/50 border-cyan-400/50 text-cyan-200 font-semibold';
      case 'diacritic':
        return 'bg-violet-950/40 border-violet-500/40 text-violet-300';
      case 'punctuation':
      case 'numeral':
        return 'bg-slate-800/80 border-slate-700 text-slate-200';
      default:
        return 'bg-slate-900 border-slate-800 text-slate-400';
    }
  };

  const getUnitClusterClasses = (unit: KhmerSyllableHighlightUnit, dimmed: boolean) => {
    if (dimmed) {
      return 'text-slate-600 opacity-30';
    }
    if (unit.primaryCategory === 'coeng_stack') {
      return 'text-cyan-200 bg-cyan-950/55 border-b-2 border-cyan-400 rounded-t px-0.5';
    }
    if (unit.primaryCategory === 'vowel') {
      return 'text-emerald-200 bg-emerald-950/40 border-b-2 border-emerald-400/80 rounded-t px-0.5';
    }
    if (unit.primaryCategory === 'consonant') {
      return 'text-amber-200 bg-amber-950/35 border-b-2 border-amber-400/70 rounded-t px-0.5';
    }
    if (unit.primaryCategory === 'diacritic') {
      return 'text-violet-300';
    }
    return 'text-slate-400';
  };

  const isUnitDimmed = (unit: KhmerSyllableHighlightUnit): boolean => {
    if (activeFilter === 'all') return false;
    if (activeFilter === 'consonant') return !unit.hasConsonant;
    if (activeFilter === 'vowel') return !unit.hasVowel;
    if (activeFilter === 'coeng_stack') return !unit.hasCoeng;
    if (activeFilter === 'diacritic') return !unit.hasDiacritic;
    return false;
  };

  const isTokenDimmed = (tok: KhmerSyntaxToken): boolean => {
    if (activeFilter === 'all') return false;
    return tok.category !== activeFilter;
  };

  const hoveredUnit = useMemo(
    () =>
      hoveredUnitId !== null
        ? analysis.syllableUnits.find((u) => u.id === hoveredUnitId) ?? null
        : null,
    [hoveredUnitId, analysis.syllableUnits]
  );

  return (
    <section
      aria-label={tr('Khmer Script Syntax Highlighter', 'កម្មវិធីបន្លិចពណ៌វាក្យសម្ព័ន្ធអក្សរខ្មែរ')}
      className="p-5 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-4"
    >
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400">
            <Code2 className="w-3.5 h-3.5" />
            <span>{tr('REAL-TIME KHMER SCRIPT SYNTAX HIGHLIGHTER', 'ការបន្លិចវាក្យសម្ព័ន្ធអក្សរខ្មែរតាមពេលវេលាជាក់ស្តែង')}</span>
          </div>
          <p className={`text-xs text-slate-400 ${isKm ? 'font-khmer' : ''}`}>
            {tr(
              'Visually differentiates Khmer base consonants, vowels, Coeng subscript stacks (្), and diacritics live as you test tokenization.',
              'បែងចែកពណ៌ព្យញ្ជនៈ ស្រៈ ជើងព្យញ្ជនៈ (្) និងវណ្ណយុត្តក្នុងពេលជាក់ស្តែងនៅពេលអ្នកសាកល្បងបំបែកថូខិន។'
            )}
          </p>
        </div>

        {/* Display Mode Switcher */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950 border border-slate-800 self-start">
          <button
            type="button"
            onClick={() => setDisplayMode('cluster_flow')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-colors whitespace-nowrap shrink-0 ${
              displayMode === 'cluster_flow'
                ? 'bg-amber-400 text-slate-950 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{tr('Script Highlight', 'បន្លិចលើអត្ថបទ')}</span>
          </button>
          <button
            type="button"
            onClick={() => setDisplayMode('atomic_stream')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-colors whitespace-nowrap shrink-0 ${
              displayMode === 'atomic_stream'
                ? 'bg-amber-400 text-slate-950 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{tr('Component Anatomy', 'បំបែកសមាសធាតុ')}</span>
          </button>
        </div>
      </div>

      {/* Interactive Filter Legend & Live Counts */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono border transition-colors whitespace-nowrap shrink-0 ${
              activeFilter === 'all'
                ? 'bg-slate-800 border-slate-600 text-white font-semibold'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {tr('All Units', 'ទាំងអស់')} ({analysis.counts.totalKhmerUnits})
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter(activeFilter === 'consonant' ? 'all' : 'consonant')}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono border transition-colors whitespace-nowrap shrink-0 ${
              activeFilter === 'consonant'
                ? 'bg-amber-950/70 border-amber-400 text-amber-200 font-semibold'
                : 'bg-slate-950/60 border-slate-800 text-amber-300 hover:border-amber-500/50'
            }`}
          >
            [C] {tr('Consonants', 'ព្យញ្ជនៈ')} · <span className="tabular-nums">{analysis.counts.consonants}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter(activeFilter === 'vowel' ? 'all' : 'vowel')}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono border transition-colors whitespace-nowrap shrink-0 ${
              activeFilter === 'vowel'
                ? 'bg-emerald-950/70 border-emerald-400 text-emerald-200 font-semibold'
                : 'bg-slate-950/60 border-slate-800 text-emerald-300 hover:border-emerald-500/50'
            }`}
          >
            [V] {tr('Vowels', 'ស្រៈ')} · <span className="tabular-nums">{analysis.counts.vowels}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter(activeFilter === 'coeng_stack' ? 'all' : 'coeng_stack')}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono border transition-colors whitespace-nowrap shrink-0 ${
              activeFilter === 'coeng_stack'
                ? 'bg-cyan-950/70 border-cyan-400 text-cyan-200 font-semibold'
                : 'bg-slate-950/60 border-slate-800 text-cyan-300 hover:border-cyan-500/50'
            }`}
          >
            [្C] {tr('Coeng Stacks', 'ជើងព្យញ្ជនៈ')} · <span className="tabular-nums">{analysis.counts.coengStacks}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter(activeFilter === 'diacritic' ? 'all' : 'diacritic')}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono border transition-colors whitespace-nowrap shrink-0 ${
              activeFilter === 'diacritic'
                ? 'bg-violet-950/70 border-violet-400 text-violet-200 font-semibold'
                : 'bg-slate-950/60 border-slate-800 text-violet-300 hover:border-violet-500/50'
            }`}
          >
            [D] {tr('Diacritics', 'វណ្ណយុត្ត')} · <span className="tabular-nums">{analysis.counts.diacritics}</span>
          </button>
        </div>

        <span className="text-[11px] font-mono text-slate-400">
          {displayMode === 'cluster_flow'
            ? tr('Hover a syllable to inspect Coeng + Vowel anatomy', 'ដាក់ព្រួញលើព្យាង្គដើម្បីមើលសមាសធាតុជើង និងស្រៈ')
            : tr('Each Unicode consonant, vowel, and ្+Coeng pair decomposed', 'បង្ហាញតួអក្សរព្យញ្ជនៈ ស្រៈ និងគូ ្+ជើង នីមួយៗ')}
        </span>
      </div>

      {/* Live Highlighted Canvas */}
      {!text.trim() ? (
        <div className="p-6 rounded-xl border border-slate-800 bg-slate-950/70 text-center text-xs text-slate-500">
          {tr(
            'Type or paste Khmer text above to see live consonant, vowel, and Coeng stack syntax highlighting.',
            'វាយ ឬបិទភ្ជាប់អត្ថបទខ្មែរខាងលើ ដើម្បីមើលការបន្លិចព្យញ្ជនៈ ស្រៈ និងជើងព្យញ្ជនៈភ្លាមៗ។'
          )}
        </div>
      ) : displayMode === 'cluster_flow' ? (
        <div className="space-y-3">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-khmer text-lg sm:text-xl leading-[2.2] tracking-normal break-words select-text">
            {analysis.syllableUnits.map((unit) => {
              const dimmed = isUnitDimmed(unit);
              return (
                <span
                  key={unit.id}
                  onMouseEnter={() => setHoveredUnitId(unit.id)}
                  onMouseLeave={() => setHoveredUnitId(null)}
                  className={`inline transition-opacity cursor-default ${getUnitClusterClasses(
                    unit,
                    dimmed
                  )}`}
                >
                  {unit.text}
                </span>
              );
            })}
          </div>

          {/* Live Hovered Syllable Decomposition Bar */}
          <div className="min-h-[38px] px-3.5 py-2 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
            {hoveredUnit ? (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-khmer text-base text-white font-semibold px-1.5 rounded bg-slate-800">
                    {hoveredUnit.text}
                  </span>
                  <span className="text-slate-500 font-mono">=</span>
                  {hoveredUnit.parts.map((part) => (
                    <span
                      key={part.id}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[11px] font-mono ${getTokenChipStyles(
                        part.category,
                        part.isValid,
                        false
                      )}`}
                    >
                      <span className="font-khmer text-xs">{part.text}</span>
                      <span className="opacity-75">
                        {categoryLabel(part.category)} ({part.codepoints.join(' ')})
                      </span>
                    </span>
                  ))}
                </div>
                <span className="text-[11px] font-mono text-slate-400">
                  {hoveredUnit.hasCoeng
                    ? tr('Subscript Coeng stack intact', 'ចង្កោមជើងព្យញ្ជនៈត្រឹមត្រូវ')
                    : hoveredUnit.hasVowel
                    ? tr('Vocalic syllable unit', 'ព្យាង្គមានស្រៈ')
                    : tr('Base unit', 'ឯកតាមូលដ្ឋាន')}
                </span>
              </>
            ) : (
              <span className={`text-slate-500 ${isKm ? 'font-khmer' : ''}`}>
                {tr(
                  'Color guide: Cyan underline = Coeng Stack (្+C) · Emerald underline = Vowel-bearing unit · Amber = Base Consonant · Violet = Diacritic',
                  'មគ្គុទ្ទេសក៍ពណ៌៖ បន្ទាត់ខៀវផ្ទៃមេឃ = ជើងព្យញ្ជនៈ (្+C) · បន្ទាត់បៃតង = ព្យាង្គមានស្រៈ · បន្ទាត់មាស = ព្យញ្ជនៈទោល · ស្វាយ = វណ្ណយុត្ត'
                )}
              </span>
            )}
          </div>
        </div>
      ) : (
        /* Atomic Unicode Component Stream */
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-wrap gap-1.5 max-h-64 overflow-y-auto">
          {analysis.tokens.map((tok) => {
            if (tok.category === 'other' && tok.text.trim().length === 0) {
              return (
                <span
                  key={tok.id}
                  className="px-1.5 py-1 text-[10px] font-mono text-slate-600 self-center"
                >
                  ␣
                </span>
              );
            }

            const dimmed = isTokenDimmed(tok);
            return (
              <span
                key={tok.id}
                title={`${categoryLabel(tok.category)} · ${tok.codepoints.join(' + ')}`}
                className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border text-xs transition-opacity ${getTokenChipStyles(
                  tok.category,
                  tok.isValid,
                  dimmed
                )}`}
              >
                <span className="text-[10px] font-mono opacity-75">
                  [{categoryBadgeCode(tok.category)}]
                </span>
                <span className="font-khmer text-sm leading-none">
                  {(tok.category === 'vowel' && tok.codepoints[0] >= 'U+17B6') ||
                  tok.category === 'coeng_stack' ||
                  tok.category === 'diacritic'
                    ? `\u25CC${tok.text}`
                    : tok.text}
                </span>
                <span className="text-[10px] font-mono opacity-60 hidden sm:inline">
                  {tok.codepoints.join('+')}
                </span>
              </span>
            );
          })}
        </div>
      )}
    </section>
  );
};
