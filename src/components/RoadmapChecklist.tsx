import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Circle,
  ListChecks,
  RotateCcw,
  Sparkles,
  Download,
  Check,
  ChevronRight
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export interface ChecklistTask {
  id: string;
  stageNumber: string;
  stageName: string;
  stageNameKm: string;
  title: string;
  titleKm: string;
  description: string;
  descriptionKm: string;
  category: 'data' | 'tokenizer' | 'compute' | 'architecture' | 'alignment' | 'eval';
}

export const ROADMAP_CHECKLIST_TASKS: ChecklistTask[] = [
  // Stage 1: Data Curation & Normalization
  {
    id: 'task-limon-scrubbing',
    stageNumber: '01',
    stageName: 'Data Ingestion & Orthography',
    stageNameKm: 'ការប្រមូលទិន្នន័យ និងអក្ខរាវិរុទ្ធ',
    title: 'Limon Legacy Font Scrubbing',
    titleKm: 'ការសម្អាតពុម្ពអក្សរ Limon ចាស់',
    description: 'Filter and strip non-Unicode ASCII mapping artifacts (Gñk, Edl, RBH) from raw Common Crawl and legacy government archives.',
    descriptionKm: 'ត្រង និងលុបកាកសំណល់អក្សរមិនមែន Unicode ASCII (Gñk, Edl, RBH) ចេញពី Common Crawl និងបណ្ណសាររដ្ឋាភិបាលចាស់ៗ។',
    category: 'data'
  },
  {
    id: 'task-casino-filtering',
    stageNumber: '01',
    stageName: 'Data Ingestion & Orthography',
    stageNameKm: 'ការប្រមូលទិន្នន័យ និងអក្ខរាវិរុទ្ធ',
    title: 'Casino & Betting Spam Scrubber',
    titleKm: 'ឧបករណ៍សម្អាតសារឥតបានការកាស៊ីណូ និងល្បែង',
    description: 'Execute regex filters to purge online gambling keyword stuffing (កាស៊ីណូ, បាការ៉ាត់, ភ្នាល់បាល់) and scam Telegram bot links.',
    descriptionKm: 'ដំណើរការតម្រង Regex ដើម្បីលុបពាក្យគន្លឹះល្បែងស៊ីសងអនឡាញ (កាស៊ីណូ, បាការ៉ាត់, ភ្នាល់បាល់) និងតំណ Telegram បោកប្រាស់។',
    category: 'data'
  },
  {
    id: 'task-unicode-nfc',
    stageNumber: '01',
    stageName: 'Data Ingestion & Orthography',
    stageNameKm: 'ការប្រមូលទិន្នន័យ និងអក្ខរាវិរុទ្ធ',
    title: 'Unicode Canonical Reordering (NFC)',
    titleKm: 'ការតម្រៀបលំដាប់ Unicode ស្តង់ដារ (NFC)',
    description: 'Normalize all Khmer script sequences into canonical Unicode standard order: Consonant + Coeng (្) + Consonant + Vowel + Diacritic.',
    descriptionKm: 'ធ្វើស្តង់ដារលំដាប់អក្សរខ្មែរទាំងអស់តាមលំដាប់ Unicode ត្រឹមត្រូវ៖ ព្យញ្ជនៈ + ជើង (្) + ព្យញ្ជនៈ + ស្រៈ + វណ្ណយុត្ត។',
    category: 'data'
  },
  {
    id: 'task-data-dedup',
    stageNumber: '01',
    stageName: 'Data Ingestion & Orthography',
    stageNameKm: 'ការប្រមូលទិន្នន័យ និងអក្ខរាវិរុទ្ធ',
    title: 'Data Deduplication (MinHash LSH)',
    titleKm: 'ការលុបទិន្នន័យស្ទួន (MinHash LSH)',
    description: 'Execute 128-permutation MinHash LSH deduplication at 0.80 Jaccard threshold to drop redundant news syndications and press releases.',
    descriptionKm: 'ដំណើរការលុបទិន្នន័យស្ទួន MinHash LSH កម្រិត 0.80 Jaccard ដើម្បីកាត់បន្ថយអត្ថបទព័ត៌មានដែលចម្លងដដែលៗ។',
    category: 'data'
  },
  {
    id: 'task-tier1-upsampling',
    stageNumber: '01',
    stageName: 'Data Ingestion & Orthography',
    stageNameKm: 'ការប្រមូលទិន្នន័យ និងអក្ខរាវិរុទ្ធ',
    title: 'Tier 1 Ground Truth Upsampling',
    titleKm: 'ការបង្កើនទម្ងន់ទិន្នន័យស្នូល Tier 1',
    description: 'Curate and configure 3x to 5x upsampling for Buddhist Institute Tripitaka, Royal Academy dictionaries, and National Assembly laws.',
    descriptionKm: 'កំណត់ការបង្កើនទម្ងន់ 3x ដល់ 5x សម្រាប់គម្ពីរព្រះត្រៃបិដក វចនានុក្រមរាជបណ្ឌិត្យសភា និងច្បាប់រដ្ឋសភាជាតិ។',
    category: 'data'
  },

  // Stage 2: Tokenizer Engineering
  {
    id: 'task-spm-training',
    stageNumber: '02',
    stageName: 'Tokenizer Engineering',
    stageNameKm: 'វិស្វកម្មឧបករណ៍បំបែកថូខិន',
    title: 'SentencePiece BPE/Unigram Training',
    titleKm: 'ការបង្វឹក SentencePiece BPE/Unigram',
    description: 'Train custom SentencePiece model with 32k or 48k vocabulary and character_coverage=0.9995 to preserve rare Khmer characters.',
    descriptionKm: 'បង្វឹកម៉ូដែល SentencePiece ផ្ទាល់ខ្លួនជាមួយវាក្យសព្ទ 32k ឬ 48k និង character_coverage=0.9995 ដើម្បីរក្សាអក្សរខ្មែរកម្រ។',
    category: 'tokenizer'
  },
  {
    id: 'task-byte-fallback',
    stageNumber: '02',
    stageName: 'Tokenizer Engineering',
    stageNameKm: 'វិស្វកម្មឧបករណ៍បំបែកថូខិន',
    title: 'Byte-Fallback Verification',
    titleKm: 'ការផ្ទៀងផ្ទាត់ Byte-Fallback',
    description: 'Verify byte_fallback=True so unknown technical terms or foreign names decompose to raw UTF-8 bytes without throwing <unk> crashes.',
    descriptionKm: 'ផ្ទៀងផ្ទាត់ byte_fallback=True ដើម្បីឱ្យពាក្យបច្ចេកទេស ឬឈ្មោះបរទេសបំបែកជា UTF-8 bytes ដោយមិនចេញ <unk>។',
    category: 'tokenizer'
  },
  {
    id: 'task-syllable-verification',
    stageNumber: '02',
    stageName: 'Tokenizer Engineering',
    stageNameKm: 'វិស្វកម្មឧបករណ៍បំបែកថូខិន',
    title: 'Syllable Tokenization Verification',
    titleKm: 'ការផ្ទៀងផ្ទាត់ការបំបែកព្យាង្គ',
    description: 'Inspect sample outputs to confirm that Khmer subscript ligatures (ជើង/Coeng) and phonological syllable clusters stay intact as single tokens.',
    descriptionKm: 'ត្រួតពិនិត្យលទ្ធផលគំរូដើម្បីធានាថាជើងព្យញ្ជនៈ (Coeng) និងចង្កោមព្យាង្គខ្មែរនៅជាប់គ្នាជាថូខិនតែមួយ។',
    category: 'tokenizer'
  },
  {
    id: 'task-fertility-rate',
    stageNumber: '02',
    stageName: 'Tokenizer Engineering',
    stageNameKm: 'វិស្វកម្មឧបករណ៍បំបែកថូខិន',
    title: 'Token Fertility Rate Benchmark',
    titleKm: 'ការវាស់ស្ទង់អត្រាបំបែកថូខិន (TFR)',
    description: 'Benchmark fertility rate (tokens/word) across diverse registers, ensuring TFR is <= 1.8 (vs. LLaMA-3 byte explosion of 6.5+).',
    descriptionKm: 'វាស់ស្ទង់អត្រាថូខិនក្នុងមួយពាក្យលើកម្រិតភាសាចម្រុះ ដោយធានាថា TFR <= 1.8 (ធៀបនឹង LLaMA-3 ដែលបែកដល់ 6.5+)។',
    category: 'tokenizer'
  },

  // Stage 3: Architecture & Scaling
  {
    id: 'task-scale-chinchilla',
    stageNumber: '03',
    stageName: 'Architecture & Scaling',
    stageNameKm: 'ស្ថាបត្យកម្ម និងមាត្រដ្ឋាន',
    title: 'Chinchilla Parameter & Token Sizing',
    titleKm: 'ការកំណត់ទំហំប៉ារ៉ាម៉ែត្រ និងថូខិនតាម Chinchilla',
    description: 'Finalize compute-optimal model size (1.5B–3B params) and verify training corpus tokens reach at least 20x to 30x parameter scale.',
    descriptionKm: 'កំណត់ទំហំម៉ូដែលល្អបំផុត (1.5B–3B) និងផ្ទៀងផ្ទាត់ថាចំនួនថូខិនបង្វឹកឈានដល់យ៉ាងតិច 20x ដល់ 30x នៃប៉ារ៉ាម៉ែត្រ។',
    category: 'architecture'
  },
  {
    id: 'task-rope-context',
    stageNumber: '03',
    stageName: 'Architecture & Scaling',
    stageNameKm: 'ស្ថាបត្យកម្ម និងមាត្រដ្ឋាន',
    title: 'Rotary Position Embeddings (RoPE) Config',
    titleKm: 'ការកំណត់រចនាសម្ព័ន្ធ RoPE Context',
    description: 'Configure RoPE base theta to 500,000 for stable 8,192-token context window attention without positional degradation.',
    descriptionKm: 'កំណត់ RoPE base theta ដល់ 500,000 សម្រាប់បរិបទ 8,192 ថូខិនដែលមានស្ថិរភាពដោយមិនបាត់បង់ទីតាំង។',
    category: 'architecture'
  },
  {
    id: 'task-gqa-setup',
    stageNumber: '03',
    stageName: 'Architecture & Scaling',
    stageNameKm: 'ស្ថាបត្យកម្ម និងមាត្រដ្ឋាន',
    title: 'Grouped-Query Attention (GQA 4:1)',
    titleKm: 'ការរៀបចំ Grouped-Query Attention (GQA 4:1)',
    description: 'Configure 16 query heads with 4 key-value heads to reduce KV cache VRAM footprint by 75% during inference.',
    descriptionKm: 'កំណត់ Query heads ចំនួន 16 ជាមួយ Key-Value heads ចំនួន 4 ដើម្បីកាត់បន្ថយការប្រើ VRAM KV cache 75%។',
    category: 'architecture'
  },

  // Stage 4: Cluster Setup & Pretraining
  {
    id: 'task-cluster-provisioning',
    stageNumber: '04',
    stageName: 'Pretraining Execution',
    stageNameKm: 'ការអនុវត្តការបង្វឹកជាមូលដ្ឋាន',
    title: 'Compute Cluster Provisioning',
    titleKm: 'ការរៀបចំចង្កោមម៉ាស៊ីនគណនា',
    description: 'Provision accelerator nodes (e.g. 16x TPU v4 or 16x H100 SXM5) with high-speed interconnect (NVLink 4.0 or 3D Torus).',
    descriptionKm: 'រៀបចំណូដឧបករណ៍បង្កើនល្បឿន (ឧ. 16x TPU v4 ឬ 16x H100 SXM5) ជាមួយការតភ្ជាប់ល្បឿនលឿន (NVLink 4.0 ឬ 3D Torus)។',
    category: 'compute'
  },
  {
    id: 'task-fsdp-distributed',
    stageNumber: '04',
    stageName: 'Pretraining Execution',
    stageNameKm: 'ការអនុវត្តការបង្វឹកជាមូលដ្ឋាន',
    title: 'PyTorch FSDP & FlashAttention-2 Setup',
    titleKm: 'ការរៀបចំ PyTorch FSDP និង FlashAttention-2',
    description: 'Configure Fully Sharded Data Parallel (FSDP Full Shard) with FlashAttention-2 kernels in pure bfloat16 mixed precision.',
    descriptionKm: 'កំណត់រចនាសម្ព័ន្ធ Fully Sharded Data Parallel (FSDP) ជាមួយ FlashAttention-2 ក្នុងទម្រង់ bfloat16 សុទ្ធ។',
    category: 'compute'
  },
  {
    id: 'task-continuous-packing',
    stageNumber: '04',
    stageName: 'Pretraining Execution',
    stageNameKm: 'ការអនុវត្តការបង្វឹកជាមូលដ្ឋាន',
    title: 'Continuous Sequence Document Packing',
    titleKm: 'ការវេចខ្ចប់លំដាប់ឯកសារបន្តបន្ទាប់',
    description: 'Pack documents into 4,096-token continuous sequences separated by EOS tokens to eliminate zero-padding compute waste.',
    descriptionKm: 'វេចខ្ចប់ឯកសារជាលំដាប់បន្ត 4,096 ថូខិនដោយបំបែកដោយថូខិន EOS ដើម្បីចៀសវាងការខ្ជះខ្ជាយកម្លាំងគណនា។',
    category: 'compute'
  },
  {
    id: 'task-lr-warmup',
    stageNumber: '04',
    stageName: 'Pretraining Execution',
    stageNameKm: 'ការអនុវត្តការបង្វឹកជាមូលដ្ឋាន',
    title: 'Learning Rate Warmup & Checkpointing',
    titleKm: 'ការកម្តៅអត្រារៀន និងការរក្សាទុកចំណុច',
    description: 'Set 2,000 steps linear warmup to peak 3e-4 with Cosine decay to 10%, capping max_grad_norm at 1.0 and checkpointing every 1,000 steps.',
    descriptionKm: 'កំណត់ Warmup លីនេអ៊ែរ 2,000 ជំហានដល់ 3e-4 ជាមួយ Cosine decay ដល់ 10% និងរក្សាទុកចំណុចរៀងរាល់ 1,000 ជំហាន។',
    category: 'compute'
  },

  // Stage 5: SFT & Alignment
  {
    id: 'task-honorific-registers',
    stageNumber: '05',
    stageName: 'Post-Training Alignment',
    stageNameKm: 'ការតម្រឹមក្រោយការបង្វឹក',
    title: 'Khmer Honorific Register Alignment',
    titleKm: 'ការតម្រឹមកម្រិតពាក្យគោរពភាសាខ្មែរ',
    description: 'Curate SFT pairs teaching correct honorific pronouns and verbs for Buddhist monks (អាត្មា, ឆាន់) and Royalty (សោយ, ផ្ទំ).',
    descriptionKm: 'រៀបចំគូ SFT បង្រៀនសព្វនាម និងកិរិយាសព្ទគោរពត្រឹមត្រូវសម្រាប់ព្រះសង្ឃ (អាត្មា, ឆាន់) និងព្រះមហាក្សត្រ (សោយ, ផ្ទំ)។',
    category: 'alignment'
  },
  {
    id: 'task-polite-particles',
    stageNumber: '05',
    stageName: 'Post-Training Alignment',
    stageNameKm: 'ការតម្រឹមក្រោយការបង្វឹក',
    title: 'Polite Particles Balancing (បាទ vs ចាស)',
    titleKm: 'ការថ្លឹងថ្លែងពាក្យគួរសម (បាទ ធៀប ចាស)',
    description: 'Ensure system prompt correctly handles male (បាទ) vs female (ចាស) particles and uses neutral courteous markers by default.',
    descriptionKm: 'ធានាថាសារប្រព័ន្ធគ្រប់គ្រងពាក្យគួរសមបុរស (បាទ) និងស្ត្រី (ចាស) បានត្រឹមត្រូវ ព្រមទាំងប្រើពាក្យគួរសមអព្យាក្រឹតតាមលំនាំដើម។',
    category: 'alignment'
  },
  {
    id: 'task-cambodian-entities',
    stageNumber: '05',
    stageName: 'Post-Training Alignment',
    stageNameKm: 'ការតម្រឹមក្រោយការបង្វឹក',
    title: 'Cambodian Cultural Entities Localization',
    titleKm: 'ការធ្វើមូលដ្ឋានីយកម្មវប្បធម៌កម្ពុជា',
    description: 'Localize synthetic SFT datasets to Cambodian context: currency in Riel (៛), Cambodian holidays, geography, and local cuisine.',
    descriptionKm: 'កែសម្រួលទិន្នន័យ SFT ទៅតាមបរិបទកម្ពុជា៖ រូបិយវត្ថុរៀល (៛) ពិធីបុណ្យជាតិ ភូមិសាស្ត្រ និងម្ហូបអាហារខ្មែរ។',
    category: 'alignment'
  },

  // Stage 6: Benchmarks & Eval
  {
    id: 'task-eval-belebele',
    stageNumber: '06',
    stageName: 'Evaluation Benchmarks',
    stageNameKm: 'ការវាយតម្លៃតាមស្ដង់ដារ',
    title: 'Belebele Khmer Reading Comprehension',
    titleKm: 'ការវាយតម្លៃការយល់ដឹងអត្ថបទខ្មែរ Belebele',
    description: 'Evaluate zero-shot and 5-shot accuracy on the belebele_khm_Khmr cross-lingual reading comprehension benchmark.',
    descriptionKm: 'វាយតម្លៃភាពត្រឹមត្រូវ zero-shot និង 5-shot លើស្ដង់ដារយល់ដឹងអត្ថបទឆ្លងភាសា belebele_khm_Khmr។',
    category: 'eval'
  },
  {
    id: 'task-eval-tydiqa',
    stageNumber: '06',
    stageName: 'Evaluation Benchmarks',
    stageNameKm: 'ការវាយតម្លៃតាមស្ដង់ដារ',
    title: 'TyDi QA Extractive Question Answering',
    titleKm: 'ការវាយតម្លៃសំណួរ-ចម្លើយ TyDi QA',
    description: 'Benchmark extractive QA precision on the Khmer subset of TyDi QA to evaluate factual ground-truth retrieval.',
    descriptionKm: 'វាស់ស្ទង់ភាពត្រឹមត្រូវនៃការឆ្លើយសំណួរលើផ្នែកភាសាខ្មែរនៃ TyDi QA ដើម្បីពិនិត្យការទាញយកការពិត។',
    category: 'eval'
  },
  {
    id: 'task-eval-national-exam',
    stageNumber: '06',
    stageName: 'Evaluation Benchmarks',
    stageNameKm: 'ការវាយតម្លៃតាមស្ដង់ដារ',
    title: 'Grade 12 National Exam Benchmark (Khmer MMLU)',
    titleKm: 'ការវាយតម្លៃលើវិញ្ញាសាបាក់ឌុបថ្នាក់ទី ១២ (Khmer MMLU)',
    description: 'Evaluate academic reasoning on Cambodian Grade 12 National Exam questions in History, Khmer Literature, and Biology.',
    descriptionKm: 'វាយតម្លៃការវែកញែកសិក្សាលើវិញ្ញាសាប្រឡងសញ្ញាបត្រមធ្យមសិក្សាទុតិយភូមិផ្នែកប្រវត្តិវិទ្យា អក្សរសាស្ត្រខ្មែរ និងជីវវិទ្យា។',
    category: 'eval'
  },
  {
    id: 'task-human-linguistic-panel',
    stageNumber: '06',
    stageName: 'Evaluation Benchmarks',
    stageNameKm: 'ការវាយតម្លៃតាមស្ដង់ដារ',
    title: 'Native Linguistic Panel Review',
    titleKm: 'ការត្រួតពិនិត្យដោយក្រុមអ្នកជំនាញភាសាខ្មែរដើម',
    description: 'Conduct qualitative double-blind evaluation with native Cambodian educators and linguists to assess natural idiomatic phrasing.',
    descriptionKm: 'ធ្វើការវាយតម្លៃគុណភាពដោយគ្រូបង្រៀន និងអ្នកភាសាវិទ្យាខ្មែរដើម ដើម្បីពិនិត្យភាពធម្មជាតិនៃឃ្លាខ្មែរ។',
    category: 'eval'
  }
];

const STORAGE_KEY = 'khmer_llm_roadmap_checklist_v1';

interface RoadmapChecklistProps {
  onNavigateToStage: (stageIndex: number) => void;
  activeStageIndex: number;
}

export const RoadmapChecklist: React.FC<RoadmapChecklistProps> = ({
  onNavigateToStage,
  activeStageIndex
}) => {
  const { isKm, tr } = useLanguage();
  const [completedTaskIds, setCompletedTaskIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return new Set(JSON.parse(saved));
      }
    } catch {
      // Fallback if localStorage unavailable
    }
    // Default initial checked items for realistic demonstration
    return new Set(['task-limon-scrubbing', 'task-unicode-nfc', 'task-spm-training']);
  });

  const [activeFilter, setActiveFilter] = useState<'all' | 'incomplete' | 'completed' | 'active_stage'>('all');
  const [copiedSummary, setCopiedSummary] = useState<boolean>(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(completedTaskIds)));
    } catch {
      // Ignore
    }
  }, [completedTaskIds]);

  const toggleTask = (taskId: string) => {
    setCompletedTaskIds((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
  };

  const activeStageNumber = `0${activeStageIndex + 1}`;

  const filteredTasks = ROADMAP_CHECKLIST_TASKS.filter((task) => {
    const isDone = completedTaskIds.has(task.id);
    if (activeFilter === 'incomplete') return !isDone;
    if (activeFilter === 'completed') return isDone;
    if (activeFilter === 'active_stage') return task.stageNumber === activeStageNumber;
    return true;
  });

  const totalTasks = ROADMAP_CHECKLIST_TASKS.length;
  const completedCount = completedTaskIds.size;
  const progressPercent = Math.round((completedCount / totalTasks) * 100);

  const activeStageTasks = ROADMAP_CHECKLIST_TASKS.filter(t => t.stageNumber === activeStageNumber);
  const activeStageCompleted = activeStageTasks.filter(t => completedTaskIds.has(t.id)).length;

  const handleResetChecklist = () => {
    setCompletedTaskIds(new Set());
  };

  const handleCheckAllInStage = () => {
    setCompletedTaskIds((prev) => {
      const next = new Set(prev);
      activeStageTasks.forEach(t => next.add(t.id));
      return next;
    });
  };

  const handleExportChecklist = () => {
    const header = isKm
      ? `# វឌ្ឍនភាពបញ្ជីត្រួតពិនិត្យការអនុវត្តការបង្វឹក Khmer LLM\nកាលបរិច្ឆេទ៖ ${new Date().toISOString().split('T')[0]}\nវឌ្ឍនភាព៖ ${completedCount}/${totalTasks} កិច្ចការបានបញ្ចប់ (${progressPercent}%)`
      : `# Khmer LLM Pretraining Execution Checklist Progress\nGenerated: ${new Date().toISOString().split('T')[0]}\nProgress: ${completedCount}/${totalTasks} Tasks Completed (${progressPercent}%)`;

    const text = `${header}

${ROADMAP_CHECKLIST_TASKS.map((t) => {
  const isDone = completedTaskIds.has(t.id);
  const title = isKm ? t.titleKm : t.title;
  const desc = isKm ? t.descriptionKm : t.description;
  return `- [${isDone ? 'x' : ' '}] ${tr('Stage', 'ដំណាក់កាល')} ${t.stageNumber}: ${title} - ${desc}`;
}).join('\n')}
`;
    navigator.clipboard.writeText(text);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  return (
    <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-6">
      {/* Header & Overall Progress Deck */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ListChecks className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">
              {tr('Pretraining Execution Readiness Checklist', 'បញ្ជីត្រួតពិនិត្យភាពរួចរាល់សម្រាប់ការបង្វឹកជាមូលដ្ឋាន')}
            </h3>
          </div>
          <p className="text-xs text-slate-400">
            {tr(
              'Track operational milestones across data cleaning, tokenizer verification, cluster provisioning, and alignment.',
              'តាមដានសមិទ្ធផលប្រតិបត្តិការលើការសម្អាតទិន្នន័យ ការផ្ទៀងផ្ទាត់ឧបករណ៍បំបែកថូខិន ការរៀបចំចង្កោម និងការតម្រឹម។'
            )}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportChecklist}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            {copiedSummary ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Download className="w-3.5 h-3.5" />}
            <span>{copiedSummary ? tr('Copied Summary', 'បានចម្លងសង្ខេប') : tr('Export Progress', 'នាំចេញវឌ្ឍនភាព')}</span>
          </button>

          <button
            onClick={handleResetChecklist}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            title={tr('Reset All Checklist Progress', 'កំណត់វឌ្ឍនភាពបញ្ជីត្រួតពិនិត្យឡើងវិញ')}
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Progress Bar & Summary Metrics */}
      <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-white font-bold">{tr('TOTAL READINESS:', 'ភាពរួចរាល់សរុប៖')}</span>
            <span className="text-amber-400 font-bold tabular-nums">{progressPercent}%</span>
            <span className="text-slate-500">
              {isKm
                ? `(បានផ្ទៀងផ្ទាត់ ${completedCount} នៃ ${totalTasks} គោលដៅ)`
                : `(${completedCount} of ${totalTasks} milestones verified)`}
            </span>
          </div>

          <div className="text-slate-400">
            {tr('Stage', 'ដំណាក់កាល')} {activeStageNumber} {tr('Progress:', 'វឌ្ឍនភាព៖')} <strong className="text-white">{activeStageCompleted}/{activeStageTasks.length}</strong>
          </div>
        </div>

        <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden flex border border-slate-800/80">
          <div
            style={{ width: `${progressPercent}%` }}
            className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full transition-all duration-300"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1 rounded-md transition-colors ${
              activeFilter === 'all' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            {tr('All Milestones', 'គោលដៅទាំងអស់')} ({totalTasks})
          </button>
          <button
            onClick={() => setActiveFilter('active_stage')}
            className={`px-3 py-1 rounded-md transition-colors ${
              activeFilter === 'active_stage' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            {tr('Current Stage', 'ដំណាក់កាលបច្ចុប្បន្ន')} {activeStageNumber} ({activeStageTasks.length})
          </button>
          <button
            onClick={() => setActiveFilter('incomplete')}
            className={`px-3 py-1 rounded-md transition-colors ${
              activeFilter === 'incomplete' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            {tr('Pending', 'នៅរង់ចាំ')} ({totalTasks - completedCount})
          </button>
          <button
            onClick={() => setActiveFilter('completed')}
            className={`px-3 py-1 rounded-md transition-colors ${
              activeFilter === 'completed' ? 'bg-emerald-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            {tr('Verified', 'បានផ្ទៀងផ្ទាត់')} ({completedCount})
          </button>
        </div>

        {activeFilter === 'active_stage' && (
          <button
            onClick={handleCheckAllInStage}
            className="text-xs text-amber-400 hover:underline font-mono"
          >
            {isKm
              ? `ធីកទាំងអស់ក្នុងដំណាក់កាល ${activeStageNumber}`
              : `Mark all in Stage ${activeStageNumber} as done`}
          </button>
        )}
      </div>

      {/* Interactive Task Cards List */}
      <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
        {filteredTasks.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 rounded-xl border border-slate-800 bg-slate-950/40">
            {tr('No milestones match this filter.', 'គ្មានគោលដៅណាមួយត្រូវនឹងតម្រងនេះទេ។')}
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isCompleted = completedTaskIds.has(task.id);
            const stageIndex = parseInt(task.stageNumber, 10) - 1;

            return (
              <div
                key={task.id}
                onClick={() => toggleTask(task.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                  isCompleted
                    ? 'bg-emerald-950/15 border-emerald-800/40 hover:bg-emerald-950/25'
                    : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-900/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0 text-slate-400">
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-600 hover:text-amber-400 transition-colors" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border uppercase ${
                        isCompleted
                          ? 'bg-emerald-950/60 border-emerald-800/60 text-emerald-300'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}>
                        {tr('STAGE', 'ដំណាក់កាល')} {task.stageNumber}
                      </span>
                      <h4 className={`text-xs font-semibold ${
                        isCompleted ? 'text-emerald-200 line-through opacity-85' : 'text-white'
                      }`}>
                        {isKm ? task.titleKm : task.title}
                      </h4>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed">
                      {isKm ? task.descriptionKm : task.description}
                    </p>
                  </div>
                </div>

                {/* Jump to stage code button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigateToStage(stageIndex);
                  }}
                  className="shrink-0 p-1 text-slate-500 hover:text-amber-400 transition-colors flex items-center gap-0.5 text-[11px] font-mono"
                  title={isKm ? `មើលកូដ និងរូបមន្តដំណាក់កាលទី ${task.stageNumber}` : `View Stage ${task.stageNumber} code & recipe`}
                >
                  <span className="hidden sm:inline">{tr('Recipe', 'រូបមន្ត')}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Progress Affirmation Box */}
      {progressPercent === 100 && (
        <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-700/60 text-emerald-200 text-xs flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <strong className="text-white block font-semibold">
              {tr('100% Pretraining Readiness Achieved!', 'សម្រេចបានភាពរួចរាល់ការបង្វឹក 100%!')}
            </strong>
            {tr(
              'All data hygiene, tokenizer integrity, distributed cluster parameters, and linguistic benchmarks have been verified.',
              'អនាម័យទិន្នន័យ ភាពត្រឹមត្រូវនៃឧបករណ៍បំបែកថូខិន ប៉ារ៉ាម៉ែត្រចង្កោម និងការវាយតម្លៃភាសាទាំងអស់ត្រូវបានផ្ទៀងផ្ទាត់រួចរាល់។'
            )}
          </div>
        </div>
      )}
    </div>
  );
};
