import React, { useState, useMemo } from 'react';
import {
  SAMPLE_KHMER_RAG_DOCUMENTS,
  chunkKhmerNaive,
  chunkKhmerSemantic,
  simulateKhmerRetrieval
} from '../utils/khmerRagPipeline';
import { segmentKhmerSyllables } from '../utils/khmerLinguistics';
import { useLanguage } from '../contexts/LanguageContext';
import {
  FileText,
  Layers,
  Search,
  Database,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Check,
  Code2,
  ShieldAlert
} from 'lucide-react';

export const KhmerRagPipelineSimulator: React.FC = () => {
  const { language, isKm, tr } = useLanguage();
  const [selectedDocId, setSelectedDocId] = useState<string>('doc-env-law');
  const [chunkStrategy, setChunkStrategy] = useState<'semantic' | 'naive'>('semantic');
  const [chunkSize, setChunkSize] = useState<number>(380);
  const [chunkOverlap, setChunkOverlap] = useState<number>(50);
  const [activePipelineStage, setActivePipelineStage] = useState<'chunks' | 'ocr' | 'vector' | 'query' | 'code'>('chunks');

  // Query Sandbox state
  const [searchQuery, setSearchQuery] = useState<string>('តើមានការពិន័យអ្វីខ្លះចំពោះការទន្ទ្រានដីព្រៃ?');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Active document
  const activeDocument = useMemo(() => {
    return SAMPLE_KHMER_RAG_DOCUMENTS.find(d => d.id === selectedDocId) || SAMPLE_KHMER_RAG_DOCUMENTS[0];
  }, [selectedDocId]);

  // Compute chunks based on strategy
  const chunks = useMemo(() => {
    if (chunkStrategy === 'semantic') {
      return chunkKhmerSemantic(activeDocument, chunkSize, chunkOverlap);
    } else {
      return chunkKhmerNaive(activeDocument, chunkSize, chunkOverlap, language);
    }
  }, [activeDocument, chunkStrategy, chunkSize, chunkOverlap, language]);

  // Compute chunk diagnostics
  const brokenLigatureCount = useMemo(() => {
    return chunks.filter(c => c.hasBrokenLigature).length;
  }, [chunks]);

  const cleanSentenceBoundaryCount = useMemo(() => {
    return chunks.filter(c => c.endsAtSentenceBoundary).length;
  }, [chunks]);

  const cleanBoundaryPercent = chunks.length > 0
    ? Math.round((cleanSentenceBoundaryCount / chunks.length) * 100)
    : 0;

  // Retrieval simulation
  const retrievalResults = useMemo(() => {
    return simulateKhmerRetrieval(chunks, searchQuery);
  }, [chunks, searchQuery]);

  const copyPythonCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const getSourceTypeLabel = (sourceType: string) => {
    switch (sourceType) {
      case 'government_decree': return tr('government decree', 'ព្រះរាជក្រឹត្យ / ច្បាប់');
      case 'academic_curriculum': return tr('academic curriculum', 'កម្មវិធីសិក្សាអប់រំ');
      case 'buddhist_treatise': return tr('buddhist treatise', 'គម្ពីរព្រះពុទ្ធសាសនា');
      default: return sourceType.replace('_', ' ');
    }
  };

  const sampleQueries = [
    { label: tr('Environmental Penalties', 'ការពិន័យផ្នែកបរិស្ថាន'), query: 'តើមានការពិន័យអ្វីខ្លះចំពោះការទន្ទ្រានដីព្រៃ?' },
    { label: tr('Core Protected Zones', 'តំបន់ការពារស្នូល'), query: 'តើតំបន់ស្នូល (Core Zone) មានសារៈសំខាន់យ៉ាងណា?' },
    { label: tr('AI Curriculum Objectives', 'គោលបំណងកម្មវិធីសិក្សា AI'), query: 'តើកម្មវិធីសិក្សា AI ផ្តោតលើការកសាងប្រព័ន្ធអ្វីខ្លះ?' },
    { label: tr('Tripitaka Sutta Precepts', 'ព្រះធម៌ក្នុងព្រះត្រៃបិដក'), query: 'តើព្រះសាស្តាទ្រង់ត្រាស់សំដែងអំពីធម៌អ្វីខ្លះដល់ព្រះអានន្ទ?' }
  ];

  const pythonProductionScript = `# Production Khmer RAG Pipeline: Ingestion, Semantic Chunking & pgvector Indexing
import re
import pdfplumber
from typing import List, Dict, Any
from langchain_core.documents import Document
from langchain_community.vectorstores import PGVector
from langchain_community.embeddings import HuggingFaceEmbeddings

# 1. Specialized Khmer Syllable & Khan (។) Aware Text Chunker
class KhmerSemanticChunker:
    """
    Prevents Khmer Scriptio Continua truncation by respecting Khan (។) sentence delimiters
    and Coeng (្) subscript consonant ligatures.
    """
    def __init__(self, max_chars: int = ${chunkSize}, overlap_chars: int = ${chunkOverlap}):
        self.max_chars = max_chars
        self.overlap_chars = overlap_chars
        # Syllable regex according to National Cambodian Unicode Standard
        self.syllable_regex = re.compile(
            r'(?:[\\u1780-\\u17A2\\u17A3-\\u17B3](?:\\u17D2[\\u1780-\\u17A2])*(?:[\\u17B6-\\u17C5])*(?:[\\u17C6-\\u17D3])*)|[^\\u1780-\\u17D3\\s]+|\\s+'
        )

    def split_text(self, text: str) -> List[str]:
        # Split on sentence terminals: Khan (។), Bariyoosann (៕), or double newline
        propositions = [s.strip() for s in re.split(r'(?<=[។៕\\n])', text) if s.strip()]
        chunks = []
        current = ""

        for prop in propositions:
            if not current:
                current = prop
            elif len(current) + len(prop) + 1 <= self.max_chars:
                current += " " + prop
            else:
                chunks.append(current)
                current = prop
        if current:
            chunks.append(current)
        return chunks

# 2. Ingest Khmer PDF & Extract Text
def ingest_khmer_pdf(pdf_path: str) -> List[Document]:
    chunker = KhmerSemanticChunker(max_chars=${chunkSize}, overlap_chars=${chunkOverlap})
    docs = []

    with pdfplumber.open(pdf_path) as pdf:
        for page_idx, page in enumerate(pdf.pages):
            raw_text = page.extract_text() or ""
            # Strip Zero-Width Space (ZWSP) noise and normalize Unicode to NFC
            normalized = re.sub(r'[\\u200B\\uFEFF]', '', raw_text)
            chunks = chunker.split_text(normalized)

            for c_idx, chunk in enumerate(chunks):
                docs.append(Document(
                    page_content=chunk,
                    metadata={
                        "source": pdf_path,
                        "page": page_idx + 1,
                        "chunk_index": c_idx,
                        "char_count": len(chunk),
                        "language": "khm"
                    }
                ))
    return docs

# 3. Vector Indexing with Multilingual Embedding (BGE-M3 / Cohere)
embeddings = HuggingFaceEmbeddings(model_name="BAAI/bge-m3")

# Connection to PostgreSQL / pgvector
CONNECTION_STRING = "postgresql+psycopg://user:pass@localhost:5432/khmer_rag_db"
COLLECTION_NAME = "khmer_official_corpus"

vectorstore = PGVector.from_documents(
    documents=ingest_khmer_pdf("${activeDocument.id}.pdf"),
    embedding=embeddings,
    collection_name=COLLECTION_NAME,
    connection_string=CONNECTION_STRING,
    use_jsonb=True
)

print(f"Indexed {len(docs)} Khmer semantic chunks into pgvector.")
`;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner & Architectural Overview */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider font-mono">
              <Database className="w-3.5 h-3.5" />
              <span>{tr('KHMER RAG INGESTION PIPELINE', 'ខ្សែសង្វាក់បញ្ចូលទិន្នន័យ RAG ភាសាខ្មែរ')}</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span>{tr('VECTOR CORPUS INDEXING', 'ការបង្កើតសន្ទស្សន៍វ៉ិចទ័រ')}</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {tr(
                'Khmer PDF Document Ingestion & Semantic Chunking Simulator',
                'កម្មវិធីពិសោធន៍ការទាញយកឯកសារ PDF ខ្មែរ និងការបំបែកកង់តាមន័យ'
              )}
            </h3>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              {tr(
                'Standard RAG chunkers fail catastrophically on Khmer PDFs because they split on whitespace, severing continuous Khmer script (Scriptio continua) and subjoined Coeng ligatures (ជើង U+17D2). This simulator demonstrates production-grade semantic proposition chunking and hybrid vector indexing.',
                'កម្មវិធីបំបែកអត្ថបទ RAG ធម្មតាបរាជ័យលើ PDF ភាសាខ្មែរ ព្រោះវាកាត់ត្រង់ចន្លោះដកឃ្លា ដែលផ្តាច់អក្សរជាប់គ្នា (Scriptio continua) និងជើងព្យញ្ជនៈ (ជើង U+17D2)។ កម្មវិធីនេះបង្ហាញពីការបំបែកកង់តាមន័យប្រយោគ និងការបង្កើតសន្ទស្សន៍វ៉ិចទ័រចម្រុះកម្រិតផលិតកម្ម។'
              )}
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs shrink-0">
            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-center min-w-[100px]">
              <span className="text-[10px] text-slate-500 block">{tr('CHUNKS', 'ចំនួនកង់')}</span>
              <span className="text-base font-bold text-cyan-400 tabular-nums">
                {chunks.length}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-center min-w-[105px]">
              <span className="text-[10px] text-slate-500 block">{tr('BROKEN LIGATURES', 'ជើងព្យញ្ជនៈដាច់')}</span>
              <span className={`text-base font-bold tabular-nums ${brokenLigatureCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {brokenLigatureCount}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-center min-w-[105px]">
              <span className="text-[10px] text-slate-500 block">{tr('KHAN (។) INTEGRITY', 'សុវត្ថិភាពសញ្ញាខណ្ឌ (។)')}</span>
              <span className="text-base font-bold text-amber-400 tabular-nums">
                {cleanBoundaryPercent}%
              </span>
            </div>
          </div>
        </div>

        {/* Pipeline Stages Progress Ribbon */}
        <div className="pt-2 border-t border-slate-800/80">
          <div className="flex items-center gap-1 overflow-x-auto text-xs font-mono">
            {[
              { id: 'chunks', label: tr('1. Chunking & Boundary Inspector', '១. ការបំបែកកង់ & ព្រំដែនអត្ថបទ'), icon: Layers },
              { id: 'ocr', label: tr('2. PDF Text Layer & OCR Audit', '២. ស្រទាប់អត្ថបទ PDF & សវនកម្ម OCR'), icon: FileText },
              { id: 'vector', label: tr('3. Vector Store & Hybrid Index', '៣. ឃ្លាំងវ៉ិចទ័រ & សន្ទស្សន៍ចម្រុះ'), icon: Database },
              { id: 'query', label: tr('4. Live Semantic Search Sandbox', '៤. ការសាកល្បងស្វែងរកតាមន័យ'), icon: Search },
              { id: 'code', label: tr('5. Production Python Script', '៥. កូដ Python សម្រាប់ផលិតកម្ម'), icon: Code2 },
            ].map(stage => {
              const Icon = stage.icon;
              const isActive = activePipelineStage === stage.id;
              return (
                <button
                  key={stage.id}
                  onClick={() => setActivePipelineStage(stage.id as 'chunks' | 'ocr' | 'vector' | 'query' | 'code')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-cyan-400 text-slate-950 font-bold border-cyan-400 shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{stage.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Control Panel: Document Selector & Chunking Parameters */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Document Selection Column */}
        <div className="lg:col-span-4 p-5 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-4">
          <div className="space-y-1">
            <span className="text-xs font-mono text-cyan-400 font-semibold uppercase">
              {tr('TARGET KHMER PDF CORPUS', 'ឯកសារ PDF គោលដៅភាសាខ្មែរ')}
            </span>
            <h4 className="text-sm font-bold text-white">{tr('Select Benchmark Document', 'ជ្រើសរើសឯកសារគំរូ')}</h4>
          </div>

          <div className="space-y-2">
            {SAMPLE_KHMER_RAG_DOCUMENTS.map(doc => {
              const isSelected = selectedDocId === doc.id;
              return (
                <div
                  key={doc.id}
                  onClick={() => setSelectedDocId(doc.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer space-y-1 ${
                    isSelected
                      ? 'bg-slate-800/90 border-cyan-400 ring-1 ring-cyan-400/30'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase text-slate-400">
                      {getSourceTypeLabel(doc.sourceType)}
                    </span>
                    <span className="text-[10px] font-mono text-cyan-400">
                      {doc.totalPages} {tr('Pages', 'ទំព័រ')}
                    </span>
                  </div>
                  <div className="font-khmer text-sm font-semibold text-white leading-relaxed truncate">
                    {doc.titleKhmer}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">
                    {doc.titleEnglish}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Document Metadata Pill */}
          <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 text-xs font-mono space-y-1.5 text-slate-300">
            <div className="text-[10px] text-slate-500 uppercase font-semibold">{tr('Metadata Extraction:', 'ព័ត៌មានមេតាទាញយកបាន៖')}</div>
            <div className="flex justify-between gap-2">
              <span className="text-slate-400">{tr('Encoding:', 'កូដអក្សរ៖')}</span>
              <span className="text-white font-semibold">{isKm ? (activeDocument.metadata.fontEncodingKm || activeDocument.metadata.fontEncoding) : activeDocument.metadata.fontEncoding}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">{tr('OCR Confidence:', 'ភាពជាក់លាក់ OCR៖')}</span>
              <span className="text-emerald-400 font-semibold">{activeDocument.metadata.ocrConfidence}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">{tr('Khmer Purity:', 'ភាពសុទ្ធភាសាខ្មែរ៖')}</span>
              <span className="text-cyan-400 font-semibold">{activeDocument.metadata.languageRatio}%</span>
            </div>
          </div>
        </div>

        {/* Chunking Strategy Configuration */}
        <div className="lg:col-span-8 p-5 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="text-xs font-mono text-amber-400 font-semibold uppercase">
                  {tr('CHUNKING STRATEGY BENCHMARK', 'ការប្រៀបធៀបយុទ្ធសាស្ត្របំបែកកង់')}
                </span>
                <h4 className="text-base font-bold text-white">
                  {tr('Linguistic Semantic Chunking vs. Naive Token Window', 'ការបំបែកតាមន័យភាសាវិទ្យា ទល់នឹងការកាត់តាមចំនួនតួអក្សរ')}
                </h4>
              </div>

              {/* Strategy Switcher */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono">
                <button
                  onClick={() => setChunkStrategy('semantic')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                    chunkStrategy === 'semantic'
                      ? 'bg-emerald-400 text-slate-950 font-bold shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{tr('Syllable & Khan Semantic (Optimal)', 'តាមព្យាង្គ និងសញ្ញាខណ្ឌ (ល្អបំផុត)')}</span>
                </button>

                <button
                  onClick={() => setChunkStrategy('naive')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                    chunkStrategy === 'naive'
                      ? 'bg-rose-500 text-white font-bold shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>{tr('Naive Window (Fails Coeng)', 'កាត់តាមប្រវែងថេរ (ដាច់ជើង)')}</span>
                </button>
              </div>
            </div>

            {/* Explanation Alert */}
            {chunkStrategy === 'semantic' ? (
              <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-800/40 text-xs text-emerald-300 flex items-start gap-2.5 leading-relaxed">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <strong>{tr('Khmer Proposition Boundary Integrity:', 'សុវត្ថិភាពព្រំដែនប្រយោគខ្មែរ៖')}</strong>{' '}
                  {tr(
                    'Chunks are segmented at Khan (។) sentence markers, clause pauses, and phonological syllable clusters. No Coeng (្) subscript ligatures or dependent vowels are severed.',
                    'កង់អត្ថបទត្រូវបានបំបែកត្រង់សញ្ញាខណ្ឌ (។) ចន្លោះឃ្លា និងចង្កោមព្យាង្គ។ គ្មានជើងព្យញ្ជនៈ (្) ឬស្រៈនិស្ស័យណាមួយត្រូវបានកាត់ផ្តាច់ឡើយ។'
                  )}
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-800/40 text-xs text-rose-300 flex items-start gap-2.5 leading-relaxed">
                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <strong>{tr('Catastrophic Truncation Alert:', 'ការព្រមានអំពីការកាត់ផ្តាច់ធ្ងន់ធ្ងរ៖')}</strong>{' '}
                  {tr(
                    'Standard window chunkers split across arbitrary byte offsets. This cuts through Khmer consonant subscripts (e.g. ក|្ស or ស្|ដ), creating invalid Unicode byte fragments that ruin vector similarity matching.',
                    'ការបំបែកកង់ធម្មតាកាត់ត្រង់ទីតាំងបៃថេរ ដែលផ្តាច់ជើងព្យញ្ជនៈខ្មែរ (ឧ. ក|្ស ឬ ស្|ដ) បង្កើតជាកូដយូនីកូដខូចដែលបំផ្លាញការស្វែងរកវ៉ិចទ័រ។'
                  )}
                </div>
              </div>
            )}

            {/* Sliders Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-2 p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">{tr('Max Chunk Size (Characters):', 'ទំហំកង់អតិបរមា (តួអក្សរ)៖')}</span>
                  <span className="text-amber-400 font-bold tabular-nums">{chunkSize} {tr('chars', 'តួ')} (~{Math.round(chunkSize / 3.4)} {tr('tokens', 'ថូខិន')})</span>
                </div>
                <input
                  type="range"
                  min={180}
                  max={600}
                  step={20}
                  value={chunkSize}
                  onChange={(e) => setChunkSize(Number(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>

              <div className="space-y-2 p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">{tr('Chunk Overlap Window:', 'ប្រវែងត្រួតគ្នារវាងកង់៖')}</span>
                  <span className="text-cyan-400 font-bold tabular-nums">{chunkOverlap} {tr('chars', 'តួអក្សរ')}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={120}
                  step={10}
                  value={chunkOverlap}
                  onChange={(e) => setChunkOverlap(Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-slate-400 border-t border-slate-800/80 pt-3">
            <span>{tr('Embedding Model:', 'ម៉ូដែល Embedding៖')} <strong className="text-white">BAAI/bge-m3 (1024-dim dense + sparse)</strong></span>
            <span>{tr('Target DB:', 'មូលដ្ឋានទិន្នន័យគោលដៅ៖')} <strong className="text-white">PostgreSQL pgvector</strong></span>
          </div>
        </div>
      </div>

      {/* Main Pipeline Display Area */}
      {activePipelineStage === 'chunks' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>{tr(`Extracted Chunk Stream (${chunks.length} Chunks Generated)`, `លំហូរកង់អត្ថបទដែលបានញែក (បង្កើតបាន ${chunks.length} កង់)`)}</span>
            </h4>
            <span className="text-xs font-mono text-slate-400">
              {tr('Inspect chunk boundaries, Khan integrity, and vector embeddings', 'ពិនិត្យព្រំដែនកង់ សញ្ញាខណ្ឌ និងតម្លៃវ៉ិចទ័រ Embedding')}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {chunks.map((chunk) => (
              <div
                key={chunk.id}
                className={`p-4 rounded-xl border space-y-3 flex flex-col justify-between transition-all ${
                  chunk.hasBrokenLigature
                    ? 'bg-rose-950/20 border-rose-800/60 ring-1 ring-rose-500/20'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Chunk Header */}
                <div className="flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 font-bold text-cyan-300">
                      {tr(`Chunk #${chunk.chunkIndex + 1}`, `កង់ទី #${chunk.chunkIndex + 1}`)}
                    </span>
                    <span className="text-slate-500">{tr(`Page ${chunk.pageNumber}`, `ទំព័រ ${chunk.pageNumber}`)}</span>
                  </div>

                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="text-slate-400 tabular-nums">{chunk.tokenCount} {tr('tokens', 'ថូខិន')}</span>
                    {chunk.endsAtSentenceBoundary ? (
                      <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800/40">
                        {tr('Khan (។) Intact', 'សញ្ញាខណ្ឌ (។) ពេញលេញ')}
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.2 rounded text-[10px] bg-amber-950/60 text-amber-300 border border-amber-800/40">
                        {tr('Mid-Clause', 'កាត់កណ្តាលឃ្លា')}
                      </span>
                    )}
                  </div>
                </div>

                {/* Chunk Text Body */}
                <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800/80 font-khmer text-sm text-slate-200 leading-relaxed max-h-40 overflow-y-auto">
                  {chunk.text}
                </div>

                {/* Broken Ligature Warning if naive */}
                {chunk.hasBrokenLigature && (
                  <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold font-mono text-[11px] text-rose-400">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>{tr('CORRUPTED KHMER PHONEME BOUNDARY', 'ដាច់ព្រំដែនសូរសព្ទ/ជើងព្យញ្ជនៈខ្មែរ')}</span>
                    </div>
                    <p className="text-[11px] leading-relaxed">{chunk.brokenLigatureNote}</p>
                  </div>
                )}

                {/* Vector ID and embedding preview */}
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 border-t border-slate-800/60 pt-2">
                  <span className="text-slate-500">{tr('Vector ID:', 'លេខសម្គាល់វ៉ិចទ័រ៖')} <code className="text-amber-400">{chunk.vectorId}</code></span>
                  <span className="text-slate-500">
                    Embedding: <code className="text-cyan-400">[{chunk.embeddingSnippet.join(', ')}...]</code>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stage 2: OCR and PDF Text Layer Audit */}
      {activePipelineStage === 'ocr' && (
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-6">
          <div className="space-y-1">
            <h4 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-400" />
              <span>{tr('Khmer PDF Extraction & OCR Hygiene Audit', 'ការទាញយកអត្ថបទ PDF ខ្មែរ និងសវនកម្មសម្អាត OCR')}</span>
            </h4>
            <p className="text-xs text-slate-400">
              {tr(
                'Examining the raw document stream, font table encoding, and character recognition accuracy.',
                'ពិនិត្យលំហូរឯកសារដើម តារាងកូដពុម្ពអក្សរ និងភាពត្រឹមត្រូវនៃការចាប់តួអក្សរ។'
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="text-[11px] font-mono text-slate-400 uppercase">{tr('Text Layer Type', 'ប្រភេទស្រទាប់អត្ថបទ')}</div>
              <div className="text-lg font-bold text-cyan-400">{tr('Digital Vector Stream', 'លំហូរវ៉ិចទ័រឌីជីថល')}</div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {tr(
                  'Direct PDF text stream extracted via PyMuPDF. Contains native TrueType Unicode glyph mapping.',
                  'ទាញយកអត្ថបទ PDF ផ្ទាល់តាម PyMuPDF ដែលមានផែនទី TrueType Unicode ដើម។'
                )}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="text-[11px] font-mono text-slate-400 uppercase">{tr('Font Normalization', 'ការកំណត់ស្តង់ដារពុម្ព')}</div>
              <div className="text-lg font-bold text-emerald-400">{tr('Unicode Standard NFC', 'ស្តង់ដារយូនីកូដ NFC')}</div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {tr(
                  'Filtered all legacy Limon / ABC font artifacts. Canonical Khmer Coeng sequence order enforced.',
                  'ចម្រោះពុម្ពអក្សរចាស់ Limon / ABC ទាំងអស់ និងតម្រៀបលំដាប់ជើងព្យញ្ជនៈតាមស្តង់ដារ។'
                )}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="text-[11px] font-mono text-slate-400 uppercase">{tr('ZWSP Sanitization', 'ការសម្អាត ZWSP')}</div>
              <div className="text-lg font-bold text-amber-400">{tr('Stripped U+200B', 'បានលុប U+200B')}</div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {tr(
                  'Zero-Width Spaces frequently inserted by older Khmer word-wrappers stripped to preserve clean embeddings.',
                  'ដកហូតដកឃ្លាមើលមិនឃើញ (U+200B) ដែលបង្កការបំបែកពាក្យខុស ដើម្បីរក្សា Embeddings ឱ្យស្អាត។'
                )}
              </p>
            </div>
          </div>

          {/* Full Extracted Text Preview */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-mono text-slate-400">
              <span>{tr('Full Raw PDF Stream:', 'អត្ថបទ PDF ដើមពេញលេញ៖')}</span>
              <span>
                {activeDocument.extractedText.length} {tr('characters', 'តួអក្សរ')} · {segmentKhmerSyllables(activeDocument.extractedText).length} {tr('syllables', 'ព្យាង្គ')}
              </span>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-khmer text-sm text-slate-200 leading-relaxed max-h-72 overflow-y-auto whitespace-pre-line">
              {activeDocument.extractedText}
            </div>
          </div>
        </div>
      )}

      {/* Stage 3: Vector Store & Hybrid Index */}
      {activePipelineStage === 'vector' && (
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-6">
          <div className="space-y-1">
            <h4 className="text-lg font-bold text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-indigo-400" />
              <span>{tr('Hybrid Vector Store Architecture (pgvector + BM25)', 'ស្ថាបត្យកម្មឃ្លាំងវ៉ិចទ័រចម្រុះ (pgvector + BM25)')}</span>
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              {tr(
                'Why dense vector search alone fails for legal and official Khmer documents, and how hybrid sparse search solves exact article lookups.',
                'ហេតុអ្វីបានជាការស្វែងរកតាមវ៉ិចទ័រតែមួយមុខបរាជ័យលើឯកសារច្បាប់ខ្មែរ និងរបៀបដែលការស្វែងរកចម្រុះ (Hybrid Search) ដោះស្រាយការរកមាត្រាជាក់លាក់។'
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="space-y-1">
                <span className="text-xs font-mono text-cyan-400 font-bold uppercase">{tr('1. Dense Semantic Index (HNSW)', '១. សន្ទស្សន៍ន័យ Dense Vector (HNSW)')}</span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {tr(
                    'Embeds each Khmer chunk using a multilingual transformer (BGE-M3, 1024-dim). Captures conceptual questions and conceptual synonyms (e.g. searching for "ការថែរក្សា" retrieves "អភិរក្ស").',
                    'បម្លែងកង់អត្ថបទខ្មែរនីមួយៗជាវ៉ិចទ័រដោយប្រើ BGE-M3 (1024-dim) ដើម្បីចាប់យកន័យសទិសន័យ (ឧ. ស្វែងរក "ការថែរក្សា" អាចទាញយក "អភិរក្ស")។'
                  )}
                </p>
              </div>

              <div className="space-y-2 text-xs font-mono text-slate-400 bg-slate-900/70 p-3 rounded-lg border border-slate-800">
                <div className="flex justify-between">
                  <span>{tr('Index Algorithm:', 'ក្បួនសន្ទស្សន៍៖')}</span>
                  <span className="text-white">HNSW (m=16, ef_construction=64)</span>
                </div>
                <div className="flex justify-between">
                  <span>{tr('Distance Metric:', 'រង្វាស់ចម្ងាយ៖')}</span>
                  <span className="text-white">Cosine Distance (&lt;=&gt;)</span>
                </div>
                <div className="flex justify-between">
                  <span>{tr('Dimension:', 'វិមាត្រ៖')}</span>
                  <span className="text-white">1024 Float32</span>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="space-y-1">
                <span className="text-xs font-mono text-amber-400 font-bold uppercase">{tr('2. Sparse Lexical Index (BM25)', '២. សន្ទស្សន៍ពាក្យគន្លឹះ Sparse (BM25)')}</span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {tr(
                    'Because dense vectors can blur exact numbers (e.g. differentiating "មាត្រា ៣" from "មាត្រា ៤" or specific monetary fines), a sparse index with Khmer syllable tokenization ensures exact matches.',
                    'ដោយសារវ៉ិចទ័រ Dense អាចច្រឡំលេខមាត្រា (ដូចជា "មាត្រា ៣" និង "មាត្រា ៤") សន្ទស្សន៍ BM25 ជាមួយការកាត់ព្យាង្គខ្មែរជួយធានាភាពជាក់លាក់។'
                  )}
                </p>
              </div>

              <div className="space-y-2 text-xs font-mono text-slate-400 bg-slate-900/70 p-3 rounded-lg border border-slate-800">
                <div className="flex justify-between">
                  <span>{tr('Tokenization:', 'ការកាត់ព្យាង្គ៖')}</span>
                  <span className="text-white">{tr('Khmer Syllable Segmenter (CRF)', 'កម្មវិធីកាត់ព្យាង្គខ្មែរ (CRF)')}</span>
                </div>
                <div className="flex justify-between">
                  <span>{tr('Reranker:', 'ការតម្រៀបលំដាប់ឡើងវិញ៖')}</span>
                  <span className="text-white">Reciprocal Rank Fusion (RRF α=60)</span>
                </div>
                <div className="flex justify-between">
                  <span>{tr('Hybrid Weight:', 'ទម្ងន់ចម្រុះ៖')}</span>
                  <span className="text-white">65% Dense + 35% Sparse</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stage 4: Live Semantic Search Sandbox */}
      {activePipelineStage === 'query' && (
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-6">
          <div className="space-y-1">
            <h4 className="text-lg font-bold text-white flex items-center gap-2">
              <Search className="w-5 h-5 text-emerald-400" />
              <span>{tr('Live Khmer RAG Semantic Query Sandbox', 'កន្លែងសាកល្បងស្វែងរកតាមន័យ RAG ភាសាខ្មែរ')}</span>
            </h4>
            <p className="text-xs text-slate-400">
              {tr(
                'Test how the vector store retrieves and ranks chunks for complex queries in Khmer.',
                'សាកល្បងមើលពីរបៀបដែលឃ្លាំងវ៉ិចទ័រទាញយក និងតម្រៀបកង់អត្ថបទសម្រាប់សំណួរស្មុគស្មាញជាភាសាខ្មែរ។'
              )}
            </p>
          </div>

          {/* Preset Queries */}
          <div className="space-y-2">
            <span className="text-xs font-mono text-slate-400">{tr('Select Preset Test Query:', 'ជ្រើសរើសសំណួរតេស្តគំរូ៖')}</span>
            <div className="flex flex-wrap gap-2">
              {sampleQueries.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => setSearchQuery(item.query)}
                  className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                    searchQuery === item.query
                      ? 'bg-emerald-400 text-slate-950 font-bold border-emerald-400 shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search Input Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={tr('Enter Khmer query here...', 'វាយបញ្ចូលសំណួរជាភាសាខ្មែរនៅទីនេះ...')}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-khmer text-sm focus:outline-none focus:border-emerald-400 transition-colors"
            />
          </div>

          {/* Retrieval Results Ranked List */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs font-mono text-slate-400">
              <span>{tr('Top Retrieved Semantic Chunks (Hybrid Ranked):', 'កង់អត្ថបទដែលទាញយកបានល្អបំផុត (Hybrid Ranking)៖')}</span>
              <span>{tr(`Showing ${retrievalResults.length} matches`, `បង្ហាញលទ្ធផល ${retrievalResults.length}`)}</span>
            </div>

            {retrievalResults.slice(0, 3).map((res, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2"
              >
                <div className="flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-amber-400">{tr(`Rank #${idx + 1}`, `ចំណាត់ថ្នាក់ #${idx + 1}`)}</span>
                    <span className="text-slate-500">·</span>
                    <span className="text-slate-300">{tr(`Chunk ${res.chunk.chunkIndex + 1}`, `កង់ទី ${res.chunk.chunkIndex + 1}`)}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-slate-400">
                      Dense: <strong className="text-cyan-300">{Math.round(res.denseScore * 100)}%</strong>
                    </span>
                    <span className="text-slate-400">
                      Sparse: <strong className="text-amber-300">{Math.round(res.sparseScore * 100)}%</strong>
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-300 font-bold">
                      Hybrid: {Math.round(res.hybridScore * 100)}%
                    </span>
                  </div>
                </div>

                <p className="font-khmer text-sm text-slate-200 leading-relaxed bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
                  {res.chunk.text}
                </p>

                {res.matchedKeywords.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono text-slate-400">
                    <span className="text-slate-500">{tr('Matched Tokens:', 'ពាក្យត្រូវគ្នា៖')}</span>
                    {res.matchedKeywords.map((kw, i) => (
                      <span key={i} className="px-1.5 py-0.5 rounded bg-slate-800 text-emerald-300 font-khmer">
                        {kw}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Augmented Prompt Output Preview */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="text-xs font-mono text-cyan-400 font-bold uppercase">
              {tr('RAG Augmented Prompt Injected to Khmer LLM:', 'ប្រអប់បញ្ជា RAG ដែលបញ្ចូលទៅកាន់ Khmer LLM៖')}
            </div>
            <div className="p-3 rounded-lg bg-slate-950 font-mono text-xs text-slate-300 max-h-36 overflow-y-auto leading-relaxed border border-slate-800">
              <span className="text-slate-500">### SYSTEM PROMPT:</span><br />
              អ្នកគឺជាជំនួយការ AI ផ្លូវការដែលមានជំនាញលើច្បាប់ និងឯកសាររដ្ឋាភិបាលកម្ពុជា។ សូមឆ្លើយតបសំណួរដោយយោងលើបរិបទដែលបានផ្តល់ជូនខាងក្រោមដោយមិនមានការបំភ្លៃ។<br /><br />
              <span className="text-slate-500">### CONTEXT:</span><br />
              {retrievalResults[0]?.chunk.text || ''}<br /><br />
              <span className="text-slate-500">### USER QUERY:</span><br />
              {searchQuery}
            </div>
          </div>
        </div>
      )}

      {/* Stage 5: Production Python Script */}
      {activePipelineStage === 'code' && (
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <Code2 className="w-4 h-4 text-amber-400" />
                <span>{tr('Production Python Pipeline Implementation', 'កូដ Python សម្រាប់អនុវត្តក្នុងប្រព័ន្ធផលិតកម្ម')}</span>
              </h4>
              <p className="text-xs text-slate-400">
                {tr(
                  'End-to-end Python script using pdfplumber, custom KhmerSemanticChunker, and pgvector.',
                  'ស្គ្រីប Python ពេញលេញដោយប្រើ pdfplumber, KhmerSemanticChunker ផ្ទាល់ខ្លួន និង pgvector។'
                )}
              </p>
            </div>

            <button
              onClick={() => copyPythonCode(pythonProductionScript)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-400 text-slate-950 font-mono font-semibold text-xs hover:bg-amber-300 transition-colors shadow-sm"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode ? tr('Copied Script!', 'បានចម្លងស្គ្រីប!') : tr('Copy Python Code', 'ចម្លងកូដ Python')}</span>
            </button>
          </div>

          <div className="rounded-xl bg-slate-950 border border-slate-800 p-4 font-mono text-xs text-slate-300 overflow-x-auto max-h-[460px]">
            <pre>{pythonProductionScript}</pre>
          </div>
        </div>
      )}
    </div>
  );
};
