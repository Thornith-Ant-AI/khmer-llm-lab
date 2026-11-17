import React from 'react';
import { ArrowRight, Database, Cpu, Layers, ShieldCheck, Share2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import heroKhmerImg from '../assets/images/hero_khmer_llm_1794452344447.jpg';

interface HeroSectionProps {
  onNavigate: (tabId: string) => void;
  onShare?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onNavigate, onShare }) => {
  const { tr } = useLanguage();

  return (
    <section className="relative overflow-hidden border-b border-slate-800 bg-slate-950 pt-8 pb-12">
      {/* Subtle backdrop glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Core Value Proposition */}
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 text-xs font-medium text-amber-400">
              <span className="font-khmer text-sm">វិស្វកម្មបញ្ញាសិប្បនិម្មិតភាសាខ្មែរ</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-slate-400">
                {tr('Khmer Foundation LLM Blueprint', 'គម្រោងប្លង់មេបង្កើតម៉ូដែលភាសាខ្មែរ (LLM)')}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight" style={{ textWrap: 'balance' }}>
              {tr(
                'Building a Khmer Large Language Model from Scratch',
                'ការកសាងម៉ូដែលភាសាធំ (LLM) ភាសាខ្មែរពីដំបូង'
              )}
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
              {tr(
                'A comprehensive technical guide and interactive workbench addressing Khmer scriptio continua (no spaces between words), complex subscript consonants (ជើង), extreme token fragmentation in Western LLMs, and the 4-tier data curation hierarchy needed for high-reasoning Cambodian AI.',
                'មគ្គុទ្ទេសក៍បច្ចេកទេស និងស្ទូឌីយោអន្តរកម្មពេញលេញ ដែលដោះស្រាយបញ្ហាការសរសេរជាប់គ្នាគ្មានដកឃ្លានៃអក្សរខ្មែរ (Scriptio Continua) ជើងព្យញ្ជនៈស្មុគស្មាញ ការបំបែកថូខិនហួសហេតុក្នុងម៉ូដែលលោកខាងលិច និងឋានានុក្រមទិន្នន័យ ៤ កម្រិតសម្រាប់បញ្ញាសិប្បនិម្មិតកម្ពុជា។'
              )}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onNavigate('data-matrix')}
                className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors shadow-sm shadow-amber-950"
              >
                <span>{tr('Prioritize Training Data', 'រៀបចំអាទិភាពទិន្នន័យបង្វឹក')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => onNavigate('tokenizer-lab')}
                className="flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-lg transition-colors"
              >
                <span>{tr('Inspect Tokenizer & Syllables', 'ពិនិត្យថូខិនណាយស័រ និងព្យាង្គ')}</span>
              </button>

              <button
                onClick={() => onNavigate('scaling-calc')}
                className="flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-slate-300 hover:text-white transition-colors"
              >
                <span>{tr('Calculate GPU Compute', 'គណនាថាមពល GPU')}</span>
              </button>

              {onShare && (
                <button
                  type="button"
                  onClick={onShare}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-medium text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/30 rounded-lg transition-colors whitespace-nowrap"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>{tr('Share Preview Card', 'មើលកាតចែករំលែក')}</span>
                </button>
              )}
            </div>
          </div>

          {/* Right Column: Hero Visual Showcase */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900/60 shadow-2xl">
              <img
                src={heroKhmerImg}
                alt={tr(
                  'Khmer neural architecture showing script glyphs entering transformer attention layers',
                  'ស្ថាបត្យកម្មបណ្តាញសរសៃប្រសាទខ្មែរដែលបង្ហាញតួអក្សរខ្មែរចូលទៅក្នុងស្រទាប់ Transformer Attention'
                )}
                className="w-full h-64 sm:h-72 object-cover object-center"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
              
              <div className="absolute bottom-0 inset-x-0 p-4 space-y-1">
                <div className="flex items-center justify-between text-xs text-amber-300 font-mono">
                  <span>{tr('TRANSFORMER ATTENTION · KHMER SCRIPT', 'ការចាប់អារម្មណ៍ TRANSFORMER · អក្សរខ្មែរ')}</span>
                  <span>{tr('32K VOCABULARY', 'វាក្យសព្ទ 32K')}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {tr(
                    'Custom SentencePiece BPE preserves syllable ligatures and achieves 4.2x fertility compression over raw byte-fallback.',
                    'SentencePiece BPE ផ្ទាល់ខ្លួនរក្សាជើងព្យញ្ជនៈខ្មែរ និងបង្រួមថូខិនបានប្រសើរជាង 4.2 ដង ធៀបនឹងការបំបែកជាបៃដើម។'
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Architectural Quantitative Proof Pillars */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-800/80">
          <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/70 space-y-1">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              <span>{tr('Token Compression', 'ការបង្រួមថូខិន')}</span>
            </div>
            <div className="text-xl font-bold font-mono text-white tabular-nums">
              4.2×
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {tr('Custom SPM vs LLaMA-3 byte fragmentation', 'SPM ផ្ទាល់ខ្លួន ធៀបនឹងការបំបែកបៃ LLaMA-3')}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/70 space-y-1">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Database className="w-3.5 h-3.5 text-cyan-400" />
              <span>{tr('Target Pretrain Tokens', 'គោលដៅថូខិនបង្វឹកដំបូង')}</span>
            </div>
            <div className="text-xl font-bold font-mono text-white tabular-nums">
              30B – 60B
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {tr('60% Khmer + 40% English & Reasoning', 'ខ្មែរ ៦០% + អង់គ្លេស និងតក្កវិជ្ជា ៤០%')}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/70 space-y-1">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
              <span>{tr('Optimal Architecture', 'ស្ថាបត្យកម្មប្រសើរបំផុត')}</span>
            </div>
            <div className="text-xl font-bold font-mono text-white tabular-nums">
              1.5B – 3B
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {tr('GQA + RoPE + SwiGLU activation', 'GQA + RoPE + អនុគមន៍ SwiGLU')}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/70 space-y-1">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
              <span>{tr('Curated Data Tiers', 'កម្រិតទិន្នន័យចម្រោះ')}</span>
            </div>
            <div className="text-xl font-bold font-mono text-white tabular-nums">
              {tr('4 Tiers', '៤ កម្រិត')}
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {tr('Gold standard to sanitized web crawl', 'ពីទិន្នន័យស្តង់ដារមាស រហូតដល់វេបសាយស្អាត')}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
