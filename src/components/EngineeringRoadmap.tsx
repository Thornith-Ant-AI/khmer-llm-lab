import React, { useState } from 'react';
import { ROADMAP_STEPS } from '../data/khmerResources';
import { RoadmapStep } from '../types';
import { RoadmapChecklist } from './RoadmapChecklist';
import { RoadmapGanttChart } from './RoadmapGanttChart';
import { Copy, Check, Terminal, AlertCircle, CheckCircle2, ChevronRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export const EngineeringRoadmap: React.FC = () => {
  const { isKm, tr } = useLanguage();
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);

  const activeStep: RoadmapStep = ROADMAP_STEPS[activeStepIndex];

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider font-mono">
          <span>{tr('END-TO-END EXECUTION BLUEPRINT', 'ផែនការប្រតិបត្តិការពេញលេញ')}</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span>{tr('STEP-BY-STEP RECIPES', 'រូបមន្តតាមដំណាក់កាល')}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          {tr('6-Stage Engineering Roadmap for Khmer LLM', 'ផែនទីបង្ហាញផ្លូវវិស្វកម្ម ៦ ដំណាក់កាលសម្រាប់ Khmer LLM')}
        </h2>
        <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
          {tr(
            'From raw web crawlers to production inference: practical architectural decisions, production scripts, and the exact pitfalls to avoid at each phase of training.',
            'ចាប់ពីកម្មវិធីប្រមូលទិន្នន័យគេហទំព័រ រហូតដល់ការបម្រើផលិតកម្ម៖ ការសម្រេចចិត្តស្ថាបត្យកម្មជាក់ស្ដែង ស្គ្រីបផលិតកម្ម និងកំហុសដែលត្រូវចៀសវាងក្នុងដំណាក់កាលនីមួយៗនៃការបង្វឹក។'
          )}
        </p>
      </div>

      {/* Step Selector Horizontal Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
        {ROADMAP_STEPS.map((step, idx) => {
          const isActive = idx === activeStepIndex;
          const displayTitle = isKm ? (step.titleKm || step.title) : step.title;
          return (
            <button
              key={step.stepNumber}
              onClick={() => setActiveStepIndex(idx)}
              className={`p-3 rounded-xl border text-left transition-all ${
                isActive
                  ? 'bg-amber-400 text-slate-950 font-bold border-amber-400 shadow-md shadow-amber-950/20'
                  : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-900 hover:border-slate-700'
              }`}
            >
              <div className={`text-[10px] font-mono uppercase mb-1 ${isActive ? 'text-slate-900 font-bold' : 'text-amber-400'}`}>
                {tr('STAGE', 'ដំណាក់កាលទី')} {step.stepNumber}
              </div>
              <div className="text-xs font-semibold line-clamp-1">
                {displayTitle}
              </div>
              <div className={`text-[11px] font-khmer line-clamp-1 mt-0.5 ${isActive ? 'text-slate-800' : 'text-slate-400'}`}>
                {step.subtitleKhmer}
              </div>
            </button>
          );
        })}
      </div>

      {/* Estimated Phase Timelines Gantt Visualization */}
      <RoadmapGanttChart
        activeStageIndex={activeStepIndex}
        onSelectStage={(idx) => setActiveStepIndex(idx)}
      />

      {/* Interactive Milestone Tracking Checklist */}
      <RoadmapChecklist
        onNavigateToStage={(idx) => setActiveStepIndex(idx)}
        activeStageIndex={activeStepIndex}
      />

      {/* Active Step Deep-Dive Container */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-6">
        {/* Step Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div>
            <div className="text-xs font-mono text-amber-400 font-semibold">
              {tr('STAGE', 'ដំណាក់កាលទី')} {activeStep.stepNumber} · {activeStep.subtitleKhmer}
            </div>
            <h3 className="text-xl font-bold text-white mt-1">
              {isKm ? (activeStep.titleKm || activeStep.title) : activeStep.title}
            </h3>
          </div>
          <div className="text-xs text-slate-400 max-w-md">
            <strong>{tr('Target Objective:', 'គោលបំណងគោលដៅ៖')}</strong> {isKm ? (activeStep.objectiveKm || activeStep.objective) : activeStep.objective}
          </div>
        </div>

        {/* Decisions vs Pitfalls Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Key Decisions */}
          <div className="space-y-3 p-4 rounded-xl bg-slate-950/50 border border-slate-800">
            <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{tr('Critical Engineering Decisions', 'ការសម្រេចចិត្តវិស្វកម្មសំខាន់ៗ')}</span>
            </h4>
            <div className="space-y-2.5">
              {(isKm ? (activeStep.keyDecisionsKm || activeStep.keyDecisions) : activeStep.keyDecisions).map((dec, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5" />
                  <span className="leading-relaxed">{dec}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Common Pitfalls */}
          <div className="space-y-3 p-4 rounded-xl bg-slate-950/50 border border-slate-800">
            <h4 className="text-xs font-semibold text-rose-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{tr('Deadly Pitfalls & Antipatterns', 'កំហុសធ្ងន់ធ្ងរ និងទម្លាប់ខុស')}</span>
            </h4>
            <div className="space-y-2.5">
              {(isKm ? (activeStep.commonPitfallsKm || activeStep.commonPitfalls) : activeStep.commonPitfalls).map((pit, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0 mt-1.5" />
                  <span className="leading-relaxed">{pit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Code Snippet Box */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2 font-mono">
              <Terminal className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-white font-medium">{activeStep.codeSnippet.filename}</span>
              <span className="text-slate-500">({activeStep.codeSnippet.language})</span>
            </div>
            <button
              onClick={() => handleCopy(activeStep.codeSnippet.code)}
              className="flex items-center gap-1.5 px-3 py-1 text-xs font-mono rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? tr('Copied to Clipboard', 'បានចម្លងទុក') : tr('Copy Code', 'ចម្លងកូដ')}</span>
            </button>
          </div>

          <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 p-4">
            <pre className="font-mono text-xs text-slate-300 overflow-x-auto leading-relaxed">
              <code>{activeStep.codeSnippet.code}</code>
            </pre>
          </div>
        </div>

        {/* Bottom Pagination Controls */}
        <div className="flex justify-between items-center pt-2">
          <button
            disabled={activeStepIndex === 0}
            onClick={() => setActiveStepIndex(activeStepIndex - 1)}
            className="px-3.5 py-1.5 text-xs rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {tr('← Previous Stage', '← ដំណាក់កាលមុន')}
          </button>
          <span className="text-xs font-mono text-slate-500">
            {isKm
              ? `ជំហានទី ${activeStepIndex + 1} ក្នុងចំណោម ${ROADMAP_STEPS.length}`
              : `Step ${activeStepIndex + 1} of ${ROADMAP_STEPS.length}`}
          </span>
          <button
            disabled={activeStepIndex === ROADMAP_STEPS.length - 1}
            onClick={() => setActiveStepIndex(activeStepIndex + 1)}
            className="flex items-center gap-1 px-3.5 py-1.5 text-xs rounded-lg bg-amber-400 text-slate-950 font-semibold hover:bg-amber-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <span>{tr('Next Stage', 'ដំណាក់កាលបន្ទាប់')}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
