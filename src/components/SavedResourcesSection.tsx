import React, { useMemo, useState } from 'react';
import {
  BookmarkCheck,
  Database,
  Cpu,
  Braces,
  BookOpen,
  Download,
  Copy,
  Check,
  ExternalLink,
  FileText,
  Trash2,
  X,
  Eye,
  EyeOff,
  FileJson,
  ShieldCheck,
  GraduationCap,
  Code2,
  Bookmark
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import type { ResearchItem } from './ResearchLibrary';
import {
  type DownloadableArtifact,
  formatByteSize,
  triggerFileDownload
} from './ResearchDownloadables';

export type SavedFilter = 'all' | 'datasets' | 'architecture' | 'literature';

export interface SavedResourcesSectionProps {
  savedKeys: string[];
  researchItems: ResearchItem[];
  downloadableArtifacts: DownloadableArtifact[];
  onRemoveSaved: (key: string) => void;
  onClearAllSaved: () => void;
  onJumpToCorpora: () => void;
  onJumpToDownloadables: () => void;
}

type ResolvedSavedEntry =
  | {
      key: string;
      kind: 'artifact';
      filterGroup: 'datasets' | 'architecture';
      artifact: DownloadableArtifact;
    }
  | {
      key: string;
      kind: 'research';
      filterGroup: 'datasets' | 'literature';
      item: ResearchItem;
    };

export const SavedResourcesSection: React.FC<SavedResourcesSectionProps> = ({
  savedKeys,
  researchItems,
  downloadableArtifacts,
  onRemoveSaved,
  onClearAllSaved,
  onJumpToCorpora,
  onJumpToDownloadables
}) => {
  const { tr, isKm } = useLanguage();
  const [activeFilter, setActiveFilter] = useState<SavedFilter>('all');
  const [confirmClear, setConfirmClear] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [downloadedKey, setDownloadedKey] = useState<string | null>(null);
  const [expandedPreviewKey, setExpandedPreviewKey] = useState<string | null>(null);
  const [exportedList, setExportedList] = useState(false);

  const researchLookup = useMemo(() => {
    const map = new Map<string, ResearchItem>();
    for (const item of researchItems) {
      map.set(item.id, item);
    }
    return map;
  }, [researchItems]);

  const artifactLookup = useMemo(() => {
    const map = new Map<string, DownloadableArtifact>();
    for (const artifact of downloadableArtifacts) {
      map.set(artifact.id, artifact);
    }
    return map;
  }, [downloadableArtifacts]);

  const resolvedEntries = useMemo<ResolvedSavedEntry[]>(() => {
    const list: ResolvedSavedEntry[] = [];
    for (const key of savedKeys) {
      if (key.startsWith('artifact:')) {
        const rawId = key.slice('artifact:'.length);
        const artifact = artifactLookup.get(rawId);
        if (artifact) {
          list.push({
            key,
            kind: 'artifact',
            filterGroup: artifact.category === 'datasets' ? 'datasets' : 'architecture',
            artifact
          });
        }
      } else if (key.startsWith('research:')) {
        const rawId = key.slice('research:'.length);
        const item = researchLookup.get(rawId);
        if (item) {
          list.push({
            key,
            kind: 'research',
            filterGroup: item.category === 'corpora' ? 'datasets' : 'literature',
            item
          });
        }
      }
    }
    return list;
  }, [savedKeys, artifactLookup, researchLookup]);

  const counts = useMemo(
    () => ({
      all: resolvedEntries.length,
      datasets: resolvedEntries.filter((entry) => entry.filterGroup === 'datasets').length,
      architecture: resolvedEntries.filter((entry) => entry.filterGroup === 'architecture').length,
      literature: resolvedEntries.filter((entry) => entry.filterGroup === 'literature').length
    }),
    [resolvedEntries]
  );

  const visibleEntries = useMemo(() => {
    if (activeFilter === 'all') return resolvedEntries;
    return resolvedEntries.filter((entry) => entry.filterGroup === activeFilter);
  }, [resolvedEntries, activeFilter]);

  const handleCopyText = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      window.setTimeout(() => {
        setCopiedKey((prev) => (prev === key ? null : prev));
      }, 2000);
    } catch {
      // Clipboard API unavailable in restricted context
    }
  };

  const handleDownloadArtifact = (key: string, artifact: DownloadableArtifact) => {
    triggerFileDownload(artifact.filename, artifact.content, artifact.mimeType);
    setDownloadedKey(key);
    window.setTimeout(() => {
      setDownloadedKey((prev) => (prev === key ? null : prev));
    }, 2200);
  };

  const handleExportSavedList = () => {
    if (resolvedEntries.length === 0) return;
    const payload = {
      exported_at: new Date().toISOString(),
      total_saved: resolvedEntries.length,
      resources: resolvedEntries.map((entry) =>
        entry.kind === 'artifact'
          ? {
              type: 'downloadable_artifact',
              id: entry.artifact.id,
              category: entry.artifact.category,
              filename: entry.artifact.filename,
              format: entry.artifact.formatBadge,
              version: entry.artifact.version,
              title: entry.artifact.title,
              content: entry.artifact.content
            }
          : {
              type: 'research_resource',
              id: entry.item.id,
              category: entry.item.category,
              title: entry.item.title,
              authors_or_org: entry.item.authorsOrOrganization,
              year: entry.item.yearOrDate,
              url: entry.item.url,
              pdf_url: entry.item.pdfUrl ?? null,
              bibtex: entry.item.bibtex ?? null
            }
      )
    };
    triggerFileDownload(
      'khmer-llm-saved-resources.json',
      JSON.stringify(payload, null, 2),
      'application/json;charset=utf-8'
    );
    setExportedList(true);
    window.setTimeout(() => setExportedList(false), 2400);
  };

  const getArtifactIcon = (category: DownloadableArtifact['category']) => {
    switch (category) {
      case 'datasets':
        return <Database className="w-4 h-4 text-emerald-400 shrink-0" />;
      case 'tokenizer':
        return <Braces className="w-4 h-4 text-cyan-400 shrink-0" />;
      case 'architecture':
        return <Cpu className="w-4 h-4 text-amber-400 shrink-0" />;
    }
  };

  const getArtifactCategoryLabel = (category: DownloadableArtifact['category']) => {
    switch (category) {
      case 'datasets':
        return tr('Starter Dataset', 'សំណុំទិន្នន័យចាប់ផ្ដើម');
      case 'tokenizer':
        return tr('Tokenizer Config', 'ការកំណត់ Tokenizer');
      case 'architecture':
        return tr('Model Architecture', 'ស្ថាបត្យកម្មម៉ូដែល');
    }
  };

  const getResearchIcon = (category: ResearchItem['category']) => {
    switch (category) {
      case 'corpora':
        return <Database className="w-4 h-4 text-emerald-400 shrink-0" />;
      case 'standards':
        return <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />;
      case 'papers':
        return <GraduationCap className="w-4 h-4 text-cyan-400 shrink-0" />;
      case 'toolkits':
        return <Code2 className="w-4 h-4 text-violet-400 shrink-0" />;
    }
  };

  return (
    <section
      id="my-saved-resources"
      aria-labelledby="saved-resources-heading"
      className="pt-6 border-t border-slate-800 space-y-5"
    >
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <div
            className={`inline-flex items-center gap-2 text-xs font-semibold text-amber-400 tracking-wider ${
              isKm ? 'font-khmer' : 'font-mono uppercase'
            }`}
          >
            <BookmarkCheck className="w-3.5 h-3.5 shrink-0" />
            <span>{tr('PERSISTENT WORKBENCH BOOKMARKS', 'បណ្ណាល័យផ្ទាល់ខ្លួនក្នុងកម្មវិធីរុករក')}</span>
            <span aria-hidden="true" className="text-slate-600">
              ·
            </span>
            <span className="tabular-nums">
              {resolvedEntries.length} {tr('SAVED', 'បានរក្សាទុក')}
            </span>
          </div>
          <h3
            id="saved-resources-heading"
            className={`text-xl sm:text-2xl font-bold text-white tracking-tight ${
              isKm ? 'font-khmer' : ''
            }`}
          >
            {tr('My Saved Resources', 'ធនធានដែលបានរក្សាទុករបស់ខ្ញុំ')}
          </h3>
          <p className={`text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed ${isKm ? 'font-khmer' : ''}`}>
            {tr(
              'Bookmark specific Khmer datasets, tokenizer specifications, architecture YAML configs, and research references to keep them pinned across sessions in local storage.',
              'រក្សាទុកសំណុំទិន្នន័យភាសាខ្មែរ ការកំណត់ Tokenizer ឯកសារស្ថាបត្យកម្ម YAML និងឯកសារស្រាវជ្រាវសំខាន់ៗ ដើម្បីងាយស្រួលទាញយក និងចូលមើលគ្រប់ពេលវេលា។'
            )}
          </p>
        </div>

        {resolvedEntries.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
            <button
              type="button"
              onClick={handleExportSavedList}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                isKm ? 'font-khmer' : 'font-mono'
              } ${
                exportedList
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                  : 'bg-slate-900 border-slate-700 text-amber-300 hover:bg-slate-800 hover:border-amber-400/50'
              }`}
            >
              {exportedList ? (
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              ) : (
                <FileJson className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              )}
              <span>
                {exportedList
                  ? tr('Saved List Exported', 'បាននាំចេញបញ្ជីរួចរាល់')
                  : tr('Export Saved (.json)', 'នាំចេញបញ្ជី (.json)')}
              </span>
            </button>

            {confirmClear ? (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    onClearAllSaved();
                    setConfirmClear(false);
                    setActiveFilter('all');
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/50 hover:bg-rose-500/30 transition-colors whitespace-nowrap shrink-0 ${
                    isKm ? 'font-khmer' : 'font-mono'
                  }`}
                >
                  {tr('Confirm Clear All', 'បញ្ជាក់ការសម្អាត')}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmClear(false)}
                  className={`px-3 py-1.5 rounded-xl text-xs bg-slate-950 text-slate-300 border border-slate-800 hover:text-white transition-colors whitespace-nowrap shrink-0 ${
                    isKm ? 'font-khmer' : 'font-mono'
                  }`}
                >
                  {tr('Cancel', 'បោះបង់')}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmClear(true)}
                className={`px-3 py-1.5 rounded-xl text-xs bg-slate-950 text-slate-400 border border-slate-800 hover:text-rose-300 hover:border-rose-500/40 transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                  isKm ? 'font-khmer' : 'font-mono'
                }`}
              >
                <Trash2 className="w-3.5 h-3.5 shrink-0" />
                <span>{tr('Clear Saved', 'សម្អាតទាំងអស់')}</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Category Filter Tabs when there are saved items */}
      {resolvedEntries.length > 0 && (
        <div className="p-3.5 rounded-2xl border border-slate-800 bg-slate-900/50 flex flex-wrap items-center gap-1.5">
          {(
            [
              { id: 'all', label: tr('All Saved', 'ទាំងអស់'), count: counts.all },
              {
                id: 'datasets',
                label: tr('Datasets & Corpora', 'សំណុំទិន្នន័យ និងឃ្លាំងអត្ថបទ'),
                count: counts.datasets
              },
              {
                id: 'architecture',
                label: tr('Architecture YAMLs & Tokenizers', 'ស្ថាបត្យកម្ម YAML និង Tokenizer'),
                count: counts.architecture
              },
              {
                id: 'literature',
                label: tr('Papers, Standards & Toolkits', 'ឯកសារស្រាវជ្រាវ និងឧបករណ៍'),
                count: counts.literature
              }
            ] as const
          ).map((tab) => {
            const isActive = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs border transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                  isKm ? 'font-khmer' : 'font-mono'
                } ${
                  isActive
                    ? 'bg-amber-400 text-slate-950 border-amber-400 font-bold'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded text-[10px] font-mono tabular-nums ${
                    isActive ? 'bg-slate-950 text-amber-300' : 'bg-slate-900 text-slate-400'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Saved Items Grid or Empty State */}
      {resolvedEntries.length === 0 ? (
        <div className="p-8 sm:p-10 rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 text-center space-y-4">
          <div className="w-10 h-10 rounded-xl border border-slate-800 bg-slate-950 flex items-center justify-center mx-auto">
            <Bookmark className="w-5 h-5 text-amber-400" />
          </div>
          <div className="space-y-1.5 max-w-lg mx-auto">
            <h4 className={`text-base font-bold text-white ${isKm ? 'font-khmer' : ''}`}>
              {tr('Your saved resource list is currently empty', 'មិនទាន់មានធនធានដែលបានរក្សាទុកនៅឡើយទេ')}
            </h4>
            <p className={`text-xs text-slate-400 leading-relaxed ${isKm ? 'font-khmer' : ''}`}>
              {tr(
                'Click "Bookmark" on any dataset, YAML architecture blueprint, tokenizer config, or research paper above or below to save it here permanently.',
                'សូមចុចប៊ូតុង «រក្សាទុក» នៅលើសំណុំទិន្នន័យ ឯកសារស្ថាបត្យកម្ម YAML ការកំណត់ Tokenizer ឬឯកសារស្រាវជ្រាវណាមួយ ដើម្បីប្រមូលផ្តុំនៅទីនេះ។'
              )}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            <button
              type="button"
              onClick={onJumpToDownloadables}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-400 text-slate-950 hover:bg-amber-300 transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                isKm ? 'font-khmer' : 'font-mono'
              }`}
            >
              <Cpu className="w-3.5 h-3.5 shrink-0" />
              <span>{tr('Browse Architecture YAMLs & Starter Datasets', 'រុករកឯកសារ YAML និងទិន្នន័យចាប់ផ្ដើម')}</span>
            </button>
            <button
              type="button"
              onClick={onJumpToCorpora}
              className={`px-3.5 py-2 rounded-xl text-xs border border-slate-700 bg-slate-950 text-slate-200 hover:border-emerald-400/50 hover:text-emerald-300 transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                isKm ? 'font-khmer' : 'font-mono'
              }`}
            >
              <Database className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>{tr('Explore Open Corpora', 'មើលឃ្លាំងទិន្នន័យបើកចំហ')}</span>
            </button>
          </div>
        </div>
      ) : visibleEntries.length === 0 ? (
        <div className="p-8 rounded-2xl border border-slate-800 bg-slate-900/30 text-center space-y-3">
          <BookOpen className="w-6 h-6 text-slate-500 mx-auto" />
          <p className={`text-xs text-slate-300 ${isKm ? 'font-khmer' : ''}`}>
            {tr(
              'No saved resources in this sub-category yet.',
              'មិនទាន់មានធនធានដែលបានរក្សាទុកក្នុងប្រភេទរងនេះទេ។'
            )}
          </p>
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold bg-amber-400 text-slate-950 hover:bg-amber-300 transition-colors ${
              isKm ? 'font-khmer' : 'font-mono'
            }`}
          >
            {tr('Show All Saved', 'បង្ហាញធនធានទាំងអស់')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {visibleEntries.map((entry) => {
            if (entry.kind === 'artifact') {
              const { artifact, key } = entry;
              const isCopied = copiedKey === key;
              const isDownloaded = downloadedKey === key;
              const isExpanded = expandedPreviewKey === key;
              const sizeLabel = formatByteSize(artifact.content);
              const lineCount = artifact.content.split('\n').length;

              return (
                <div
                  key={key}
                  className="p-5 rounded-2xl border border-slate-800 bg-slate-900/50 hover:border-amber-400/40 transition-colors flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2 min-w-0">
                        {getArtifactIcon(artifact.category)}
                        <span className={`text-xs font-semibold text-slate-200 truncate ${isKm ? 'font-khmer' : ''}`}>
                          {getArtifactCategoryLabel(artifact.category)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400 tabular-nums shrink-0">
                        <span className="text-amber-300 font-bold">{artifact.formatBadge}</span>
                        <span aria-hidden="true" className="text-slate-600">
                          ·
                        </span>
                        <span>{sizeLabel}</span>
                        <span aria-hidden="true" className="text-slate-600">
                          ·
                        </span>
                        <span>
                          {lineCount} {tr('lines', 'បន្ទាត់')}
                        </span>
                        <button
                          type="button"
                          onClick={() => onRemoveSaved(key)}
                          aria-label={tr(`Remove ${artifact.filename} from saved`, `ដក ${artifact.filename} ចេញពីបញ្ជី`)}
                          title={tr('Remove bookmark', 'ដកការរក្សាទុកចេញ')}
                          className="p-1 rounded-md text-slate-400 hover:text-rose-300 hover:bg-slate-800 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <h4 className={`text-base font-bold text-white leading-snug ${isKm ? 'font-khmer' : ''}`}>
                        {isKm ? artifact.titleKm : artifact.title}
                      </h4>
                      <div className="text-xs font-mono text-cyan-300 truncate">{artifact.filename}</div>
                    </div>

                    <p className={`text-xs text-slate-300 leading-relaxed ${isKm ? 'font-khmer' : ''}`}>
                      {isKm ? artifact.descriptionKm : artifact.description}
                    </p>
                  </div>

                  {isExpanded && (
                    <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden">
                      <pre className="p-3 text-[11px] leading-relaxed font-mono text-slate-200 overflow-x-auto max-h-52 overflow-y-auto whitespace-pre">
                        {artifact.content}
                      </pre>
                    </div>
                  )}

                  <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setExpandedPreviewKey(isExpanded ? null : key)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs border border-slate-800 bg-slate-950 text-slate-300 hover:text-white hover:border-slate-700 transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                          isKm ? 'font-khmer' : 'font-mono'
                        }`}
                      >
                        {isExpanded ? (
                          <>
                            <EyeOff className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{tr('Hide', 'លាក់')}</span>
                          </>
                        ) : (
                          <>
                            <Eye className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                            <span>{tr('Preview', 'មើល')}</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCopyText(key, artifact.content)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs border transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                          isKm ? 'font-khmer' : 'font-mono'
                        } ${
                          isCopied
                            ? 'border-emerald-500/50 bg-emerald-500/15 text-emerald-300'
                            : 'border-slate-800 bg-slate-950 text-slate-300 hover:text-white hover:border-slate-700'
                        }`}
                      >
                        {isCopied ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 shrink-0" />
                        )}
                        <span>{isCopied ? tr('Copied', 'បានចម្លង') : tr('Copy', 'ចម្លង')}</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDownloadArtifact(key, artifact)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                        isKm ? 'font-khmer' : 'font-mono'
                      } ${
                        isDownloaded
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                          : 'bg-amber-400 text-slate-950 hover:bg-amber-300'
                      }`}
                    >
                      {isDownloaded ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      ) : (
                        <Download className="w-3.5 h-3.5 shrink-0" />
                      )}
                      <span>{isDownloaded ? tr('Downloaded', 'បានទាញយក') : tr('Download', 'ទាញយក')}</span>
                    </button>
                  </div>
                </div>
              );
            }

            const { item, key } = entry;
            const isCopied = copiedKey === key;

            return (
              <div
                key={key}
                className="p-5 rounded-2xl border border-slate-800 bg-slate-900/50 hover:border-amber-400/40 transition-colors flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2 min-w-0">
                      {getResearchIcon(item.category)}
                      <span className={`text-xs font-semibold text-slate-200 truncate ${isKm ? 'font-khmer' : ''}`}>
                        {isKm ? item.categoryLabelKm : item.categoryLabel}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400 tabular-nums shrink-0">
                      <span>{isKm ? item.yearOrDateKm || item.yearOrDate : item.yearOrDate}</span>
                      {item.license && (
                        <>
                          <span aria-hidden="true" className="text-slate-600">
                            ·
                          </span>
                          <span className="text-emerald-300">{item.license}</span>
                        </>
                      )}
                      <button
                        type="button"
                        onClick={() => onRemoveSaved(key)}
                        aria-label={tr(`Remove ${item.title} from saved`, `ដក ${item.title} ចេញពីបញ្ជី`)}
                        title={tr('Remove bookmark', 'ដកការរក្សាទុកចេញ')}
                        className="p-1 rounded-md text-slate-400 hover:text-rose-300 hover:bg-slate-800 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-base font-bold text-white leading-snug">{item.title}</h4>
                    {item.titleKhmer && (
                      <p className="text-xs text-amber-200/80 font-khmer leading-relaxed">{item.titleKhmer}</p>
                    )}
                    <div className="text-xs font-mono text-slate-400 truncate">
                      {tr('by', 'ដោយ')} {item.authorsOrOrganization}
                    </div>
                  </div>

                  <p className={`text-xs text-slate-300 leading-relaxed ${isKm ? 'font-khmer' : ''}`}>
                    {isKm ? item.descriptionKm : item.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    {item.bibtex && (
                      <button
                        type="button"
                        onClick={() => handleCopyText(key, item.bibtex!)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs border transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                          isKm ? 'font-khmer' : 'font-mono'
                        } ${
                          isCopied
                            ? 'border-emerald-500/50 bg-emerald-500/15 text-emerald-300'
                            : 'border-slate-800 bg-slate-950 text-slate-300 hover:text-white hover:border-slate-700'
                        }`}
                      >
                        {isCopied ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 shrink-0" />
                        )}
                        <span>{isCopied ? tr('Copied BibTeX', 'បានចម្លង BibTeX') : 'BibTeX'}</span>
                      </button>
                    )}

                    {item.pdfUrl && (
                      <a
                        href={item.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1.5 rounded-lg text-xs font-mono border border-slate-800 bg-slate-950 text-slate-300 hover:text-white hover:border-slate-700 transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
                      >
                        <FileText className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        <span>PDF</span>
                      </a>
                    )}
                  </div>

                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-400 text-slate-950 hover:bg-amber-300 transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                      isKm ? 'font-khmer' : 'font-mono'
                    }`}
                  >
                    <span>{tr('Open Source', 'បើកប្រភព')}</span>
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
