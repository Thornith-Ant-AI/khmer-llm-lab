import React, { useState } from 'react';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
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
import { ContactForm } from './components/ContactForm';
import { ExportModal } from './components/ExportModal';
import { Database, Cpu, Layers, Sparkles, Terminal, FileText, CheckCircle2, BookOpen, Activity, Mail } from 'lucide-react';

function AppContent() {
  const { tr } = useLanguage();
  const [activeTab, setActiveTab] = useState<string>('data-matrix');
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);

  const tabs = [
    { id: 'data-matrix', label: tr('1. Data Matrix (What to Prioritize)', '១. ម៉ាទ្រីសទិន្នន័យ (អាទិភាពទិន្នន័យ)'), icon: Database },
    { id: 'tokenizer-lab', label: tr('2. Tokenizer & Syllables', '២. ថូខិនណាយស័រ និងព្យាង្គ'), icon: Layers },
    { id: 'cleaner-sim', label: tr('3. Corpus Cleansing Pipeline', '៣. ខ្សែសង្វាក់សម្អាតទិន្នន័យ'), icon: Terminal },
    { id: 'scaling-calc', label: tr('4. Compute & Scaling Laws', '៤. ការគណនាថាមពល GPU & មាត្រដ្ឋាន'), icon: Cpu },
    { id: 'roadmap', label: tr('5. Engineering Roadmap', '៥. ផែនទីបង្ហាញផ្លូវវិស្វកម្ម'), icon: FileText },
    { id: 'registers', label: tr('6. Linguistic Registers', '៦. កម្រិតភាសាខ្មែរ'), icon: Sparkles },
    { id: 'synthetic', label: tr('7. Synthetic SFT Studio', '៧. ស្ទូឌីយោទិន្នន័យសំយោគ SFT'), icon: CheckCircle2 },
    { id: 'research-library', label: tr('8. Research Library', '៨. បណ្ណាល័យស្រាវជ្រាវ'), icon: BookOpen },
    { id: 'training-dynamics', label: tr('9. Training Dynamics', '៩. ថាមវន្តនៃការបង្វឹក'), icon: Activity },
    { id: 'contact', label: tr('10. Contact', '១០. ទំនាក់ទំនង'), icon: Mail },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Bar Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onExport={() => setIsExportOpen(true)}
      />

      {/* Hero Visual & Architectural Overview */}
      <HeroSection onNavigate={(tabId) => setActiveTab(tabId)} />

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
          {activeTab === 'training-dynamics' && <TrainingDynamics />}
          {activeTab === 'contact' && <ContactForm />}
        </div>
      </main>

      {/* Technical Footer */}
      <footer className="mt-16 border-t border-slate-800/80 bg-slate-950 py-8 px-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">
              {tr('Khmer LLM Pretraining Lab', 'មន្ទីរពិសោធន៍បង្វឹក Khmer LLM')}
            </span>
            <span>·</span>
            <span>
              {tr('Open Research & Engineering Specification', 'លក្ខណៈបច្ចេកទេសវិស្វកម្ម និងការស្រាវជ្រាវបើកចំហ')}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[11px]">
            <span>{tr('Royal Academy of Cambodia Standards', 'ស្តង់ដាររាជបណ្ឌិត្យសភាកម្ពុជា')}</span>
            <span>·</span>
            <span>{tr('Unicode Consortium TR31 Compliant', 'អនុលោមតាម Unicode Consortium TR31')}</span>
            <span>·</span>
            <span>SentencePiece 32k BPE</span>
          </div>
        </div>
      </footer>

      {/* Export Technical Blueprint Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
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
