import React from 'react';
import { Download, Globe } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onExport: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, onExport }) => {
  const { language, setLanguage, tr } = useLanguage();

  const navItems = [
    { id: 'data-matrix', label: tr('Data Priority Matrix', 'អាទិភាពទិន្នន័យ') },
    { id: 'tokenizer-lab', label: tr('Tokenizer & Syllables', 'ថូខិន និងព្យាង្គ') },
    { id: 'cleaner-sim', label: tr('Corpus Cleansing', 'ការសម្អាតទិន្នន័យ') },
    { id: 'scaling-calc', label: tr('Compute & Scaling', 'ថាមពល & មាត្រដ្ឋាន') },
    { id: 'roadmap', label: tr('Engineering Roadmap', 'ផែនទីវិស្វកម្ម') },
    { id: 'registers', label: tr('Linguistic Registers', 'កម្រិតភាសា') },
    { id: 'synthetic', label: tr('Synthetic Studio', 'ស្ទូឌីយោសំយោគ') },
    { id: 'research-library', label: tr('Research Library', 'បណ្ណាល័យស្រាវជ្រាវ') },
    { id: 'training-dynamics', label: tr('Training Dynamics', 'ថាមវន្តបង្វឹក') },
    { id: 'contact', label: tr('Contact', 'ទំនាក់ទំនង') },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 xl:gap-6 px-6 py-4">
        {/* Zone 1: Single brand wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold font-khmer text-lg">
            ខ
          </div>
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); setActiveTab('data-matrix'); }}
            className="text-base font-semibold tracking-tight text-white whitespace-nowrap shrink-0 hover:text-amber-400 transition-colors"
          >
            {tr('Khmer LLM Lab', 'មន្ទីរពិសោធន៍ Khmer LLM')}
          </a>
        </div>

        {/* Zone 2: Top-level workbench nav links */}
        <nav className="hidden lg:flex items-center gap-3 xl:gap-4 text-sm font-medium overflow-x-auto scrollbar-none">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`whitespace-nowrap shrink-0 text-xs transition-colors py-1 ${
                  isActive
                    ? 'text-amber-400 border-b-2 border-amber-400 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Language Switcher (EN / ខ្មែរ) + Primary Export CTA */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div
            role="group"
            aria-label={tr('Select language', 'ជ្រើសរើសភាសា')}
            className="inline-flex items-center rounded-lg border border-slate-700/80 bg-slate-900 p-0.5 shadow-inner"
          >
            <span className="pl-2 pr-1 text-slate-400 hidden sm:inline-flex items-center" aria-hidden="true">
              <Globe className="w-3.5 h-3.5" />
            </span>
            <button
              type="button"
              onClick={() => setLanguage('en')}
              aria-pressed={language === 'en'}
              className={`px-2 py-1 text-[11px] font-semibold rounded-md transition-colors whitespace-nowrap ${
                language === 'en'
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLanguage('km')}
              aria-pressed={language === 'km'}
              className={`px-2 py-1 text-[11px] font-semibold font-khmer rounded-md transition-colors whitespace-nowrap ${
                language === 'km'
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ខ្មែរ
            </button>
          </div>

          <button
            onClick={onExport}
            className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-sm shadow-amber-950"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{tr('Export Blueprint', 'នាំចេញផែនការ')}</span>
            <span className="sm:hidden">{tr('Export', 'នាំចេញ')}</span>
          </button>
        </div>
      </div>

      {/* Mobile sub-navigation for small viewports */}
      <div className="lg:hidden flex items-center gap-2 px-4 py-2 overflow-x-auto border-t border-slate-900 bg-slate-950 scrollbar-none">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`px-2.5 py-1 text-xs whitespace-nowrap rounded-md ${
              activeTab === item.id
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </header>
  );
};
