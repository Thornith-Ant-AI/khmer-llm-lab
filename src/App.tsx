import React, { useState, useEffect, useRef } from 'react';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { applyBilingualSeo, KHMER_LLM_SEO_SECTIONS } from './utils/seo';
import {
  trackWebsiteVisit,
  trackPageView,
  trackLanguageSwitch,
  trackUiAction,
} from './utils/analytics';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { DataPrioritizationMatrix } from './components/DataPrioritizationMatrix';
import { TokenizerLab } from './components/TokenizerLab';
import { CorpusCleaningSimulator } from './components/CorpusCleaningSimulator';
import { ScalingCalculator } from './components/ScalingCalculator';
import { EngineeringRoadmap } from './components/EngineeringRoadmap';
import { KhmerRegisterGuide } from './components/KhmerRegisterGuide';
import { SyntheticDataStudio } from './components/SyntheticDataStudio';
import { ResearchLibrary } from './components/ResearchLibrary';
import { TrainingDynamics } from './components/TrainingDynamics';
import { KhmerModelsDirectory } from './components/KhmerModelsDirectory';
import { KhmerNlpGlossary } from './components/KhmerNlpGlossary';
import { ContactForm } from './components/ContactForm';
import { ExportModal } from './components/ExportModal';
import { SharePreviewModal } from './components/SharePreviewModal';
import { Database, Cpu, Layers, Sparkles, Terminal, FileText, CheckCircle2, BookOpen, BookMarked, Activity, GitBranch, Mail } from 'lucide-react';

function AppContent() {
  const { language, tr } = useLanguage();
  const [activeTab, setActiveTab] = useState<string>(() => {
    try {
      const section = new URLSearchParams(window.location.search).get('section');
      if (section && KHMER_LLM_SEO_SECTIONS[section]) {
        return section;
      }
    } catch {
      // Ignore search params errors
    }
    return 'data-matrix';
  });
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [isShareOpen, setIsShareOpen] = useState<boolean>(false);
  const prevLanguageRef = useRef(language);

  useEffect(() => {
    void trackWebsiteVisit(activeTab, language);
  }, []);

  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      if (url.searchParams.get('section') !== activeTab) {
        url.searchParams.set('section', activeTab);
        window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
      }
    } catch {
      // Ignore history API errors
    }
    applyBilingualSeo(language, activeTab);
    void trackPageView(activeTab, language, document.title);

    if (prevLanguageRef.current !== language) {
      prevLanguageRef.current = language;
      void trackLanguageSwitch(language, activeTab);
    }
  }, [language, activeTab]);

  const tabs = [
    { id: 'data-matrix', label: tr('1. Data Matrix (What to Prioritize)', '១. ម៉ាទ្រីសទិន្នន័យ (អាទិភាពទិន្នន័យ)'), icon: Database },
    { id: 'tokenizer-lab', label: tr('2. Tokenizer & Syllables', '២. ថូខិនណាយស័រ និងព្យាង្គ'), icon: Layers },
    { id: 'cleaner-sim', label: tr('3. Corpus Cleansing Pipeline', '៣. ខ្សែសង្វាក់សម្អាតទិន្នន័យ'), icon: Terminal },
    { id: 'scaling-calc', label: tr('4. Compute & Scaling Laws', '៤. ការគណនាថាមពល GPU & មាត្រដ្ឋាន'), icon: Cpu },
    { id: 'roadmap', label: tr('5. Engineering Roadmap', '៥. ផែនទីបង្ហាញផ្លូវវិស្វកម្ម'), icon: FileText },
    { id: 'registers', label: tr('6. Linguistic Registers', '៦. កម្រិតភាសាខ្មែរ'), icon: Sparkles },
    { id: 'synthetic', label: tr('7. Synthetic SFT Studio', '៧. ស្ទូឌីយោទិន្នន័យសំយោគ SFT'), icon: CheckCircle2 },
    { id: 'research-library', label: tr('8. Research Library', '៨. បណ្ណាល័យស្រាវជ្រាវ'), icon: BookOpen },
    { id: 'models-directory', label: tr('9. Khmer LLMs & Git Repos', '៩. ម៉ូដែល LLM និង Git'), icon: GitBranch },
    { id: 'training-dynamics', label: tr('10. Training Dynamics', '១០. ថាមវន្តនៃការបង្វឹក'), icon: Activity },
    { id: 'nlp-glossary', label: tr('11. Khmer NLP Glossary', '១១. សទ្ទានុក្រម Khmer NLP'), icon: BookMarked },
    { id: 'contact', label: tr('12. Contact', '១២. ទំនាក់ទំនង'), icon: Mail },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Bar Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onExport={() => {
          void trackUiAction('export_blueprint_open', { section: activeTab, language });
          setIsExportOpen(true);
        }}
        onShare={() => {
          void trackUiAction('share_preview_open', { section: activeTab, language });
          setIsShareOpen(true);
        }}
      />

      {/* Hero Visual & Architectural Overview */}
      <HeroSection
        onNavigate={(tabId) => setActiveTab(tabId)}
        onShare={() => {
          void trackUiAction('share_preview_open', { section: activeTab, language });
          setIsShareOpen(true);
        }}
      />

      {/* Main Interactive Workbench Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-8">
        {/* Tab Navigation Pill Bar */}
        <div className="border-b border-slate-800 pb-2">
          <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 text-xs rounded-lg transition-colors whitespace-nowrap shrink-0 font-medium ${
                    isActive
                      ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content Display */}
        <div className="pt-2">
          {activeTab === 'data-matrix' && <DataPrioritizationMatrix />}
          {activeTab === 'tokenizer-lab' && <TokenizerLab />}
          {activeTab === 'cleaner-sim' && <CorpusCleaningSimulator />}
          {activeTab === 'scaling-calc' && <ScalingCalculator />}
          {activeTab === 'roadmap' && <EngineeringRoadmap />}
          {activeTab === 'registers' && <KhmerRegisterGuide />}
          {activeTab === 'synthetic' && <SyntheticDataStudio />}
          {activeTab === 'research-library' && <ResearchLibrary />}
          {activeTab === 'models-directory' && <KhmerModelsDirectory />}
          {activeTab === 'training-dynamics' && <TrainingDynamics />}
          {activeTab === 'nlp-glossary' && (
            <KhmerNlpGlossary onNavigate={(tabId) => setActiveTab(tabId)} />
          )}
          {activeTab === 'contact' && <ContactForm />}
        </div>
      </main>

      {/* Technical Footer */}
      <footer className="mt-16 border-t border-slate-800/80 bg-slate-950 py-8 px-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 items-center gap-4">
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
            <span className="font-semibold text-slate-400">
              {tr('Khmer LLM Pretraining Lab', 'មន្ទីរពិសោធន៍បង្វឹក Khmer LLM')}
            </span>
            <span aria-hidden="true">·</span>
            <span>
              {tr('Open Research & Engineering Specification', 'លក្ខណៈបច្ចេកទេសវិស្វកម្ម និងការស្រាវជ្រាវបើកចំហ')}
            </span>
          </div>

          <div className="text-center text-xs text-slate-300 font-medium">
            {tr('Powered by', 'ដំណើរការដោយ')}{' '}
            <span className="font-semibold text-amber-400">Khmer LLM Lab</span>{' '}
            <span className="text-slate-400">© 2026</span>
          </div>

          <div className="flex flex-wrap items-center justify-center lg:justify-end gap-3 text-[11px]">
            <span>{tr('Royal Academy of Cambodia Standards', 'ស្តង់ដាររាជបណ្ឌិត្យសភាកម្ពុជា')}</span>
            <span aria-hidden="true">·</span>
            <span>{tr('Unicode Consortium TR31 Compliant', 'អនុលោមតាម Unicode Consortium TR31')}</span>
            <span aria-hidden="true">·</span>
            <span>SentencePiece 32k BPE</span>
          </div>
        </div>
      </footer>

      {/* Export Technical Blueprint Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
      />

      {/* Social Media Share & Featured Home Screen Preview Modal */}
      <SharePreviewModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        activeTab={activeTab}
      />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}
