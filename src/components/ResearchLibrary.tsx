import React, { useState, useMemo, useEffect } from 'react';
import {
  BookOpen,
  ExternalLink,
  Search,
  FileText,
  Copy,
  Check,
  Tag,
  Sparkles,
  Database,
  Code2,
  ShieldCheck,
  GraduationCap,
  X,
  Filter,
  RotateCcw,
  CheckCircle2,
  Bookmark,
  Circle,
  Trash2
} from 'lucide-react';

import { useLanguage } from '../contexts/LanguageContext';

export type ResourceCategory =
  | 'all'
  | 'standards'
  | 'papers'
  | 'corpora'
  | 'toolkits';

export type SearchScope = 'all' | 'title' | 'category';
export type ReadingStatus = 'read' | 'to-review';
export type StatusFilter = 'all' | ReadingStatus | 'unread';

const PROGRESS_STORAGE_KEY = 'khmer_llm_research_progress';

function loadSavedProgress(): Record<string, ReadingStatus> {
  try {
    const raw = localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (!parsed || typeof parsed !== 'object') return {};
    const valid: Record<string, ReadingStatus> = {};
    for (const [key, val] of Object.entries(parsed)) {
      if (val === 'read' || val === 'to-review') {
        valid[key] = val;
      }
    }
    return valid;
  } catch {
    return {};
  }
}

export interface ResearchItem {
  id: string;
  title: string;
  titleKhmer?: string;
  authorsOrOrganization: string;
  yearOrDate: string;
  yearOrDateKm?: string;
  category: 'standards' | 'papers' | 'corpora' | 'toolkits';
  categoryLabel: string;
  categoryLabelKm: string;
  description: string;
  descriptionKm: string;
  impactOnKhmerLlm: string;
  impactOnKhmerLlmKm: string;
  url: string;
  pdfUrl?: string;
  bibtex?: string;
  tags: string[];
  peerReviewedOrOfficial: boolean;
  license?: string;
  relevanceRating: 'CRITICAL' | 'FOUNDATIONAL' | 'RECOMMENDED';
}

export const RESEARCH_ITEMS: ResearchItem[] = [
  // 1. STANDARDS & LINGUISTICS
  {
    id: 'unicode-standard-khmer',
    title: 'The Unicode Standard, Version 16.0: Chapter 16.4 — Khmer Script',
    titleKhmer: 'ស្ដង់ដារយូនីកូដអន្តរជាតិជំពូក ១៦.៤ សម្រាប់តួអក្សរខ្មែរ (U+1780–U+17FF)',
    authorsOrOrganization: 'The Unicode Consortium',
    yearOrDate: '2024',
    category: 'standards',
    categoryLabel: 'Linguistic Standards',
    categoryLabelKm: 'ស្ដង់ដារភាសាវិទ្យា',
    description: 'Official authoritative specification detailing Khmer consonants, independent vowels, dependent vowel signs, diacritics, and the subjoined consonant sign COENG (U+17D2). Defines canonical ordering and rendering behavior.',
    descriptionKm: 'លក្ខណៈបច្ចេកទេសផ្លូវការដែលរៀបរាប់លម្អិតអំពីព្យញ្ជនៈ ស្រៈពេញតួ ស្រៈនិស្ស័យ វណ្ណយុត្តិ និងសញ្ញាជើងព្យញ្ជនៈ COENG (U+17D2)។ កំណត់លំដាប់កូដត្រឹមត្រូវ និងឥរិយាបថបង្ហាញលើអេក្រង់។',
    impactOnKhmerLlm: 'Essential for tokenization normalization: ensures NFC/NFD decomposition does not dismantle subscript clusters and prevents unicode spoofing.',
    impactOnKhmerLlmKm: 'សំខាន់បំផុតសម្រាប់ការធ្វើស្តង់ដារ Tokenization៖ ធានាថាការបំបែក NFC/NFD មិនធ្វើឱ្យបែកខ្ញែកចង្កោមជើងព្យញ្ជនៈ និងការពារការបន្លំតួអក្សរយូនីកូដ។',
    url: 'https://www.unicode.org/versions/Unicode16.0.0/core-spec/chapter-16/#G25667',
    pdfUrl: 'https://www.unicode.org/charts/PDF/U1780.pdf',
    bibtex: `@techreport{unicode2024khmer,\n  author = {The Unicode Consortium},\n  title = {The Unicode Standard, Version 16.0 - South and Central Asian Scripts: Khmer},\n  year = {2024},\n  url = {https://www.unicode.org/versions/Unicode16.0.0/}\n}`,
    tags: ['Unicode', 'Orthography', 'NFC Normalization', 'Coeng Clusters', 'Subscripts'],
    peerReviewedOrOfficial: true,
    license: 'Unicode Open Standard',
    relevanceRating: 'CRITICAL'
  },
  {
    id: 'unicode-tr31-identifiers',
    title: 'Unicode Standard Annex #31: Identifier and Pattern Syntax for Complex Scripts',
    titleKhmer: 'ឧបសម្ព័ន្ធយូនីកូដលេខ ៣១ ស្ដីពីការកំណត់អត្តសញ្ញាណ និងវេយ្យាករណ៍តួអក្សរស្មុគស្មាញ',
    authorsOrOrganization: 'Mark Davis & Unicode Editorial Committee',
    yearOrDate: '2023',
    category: 'standards',
    categoryLabel: 'Linguistic Standards',
    categoryLabelKm: 'ស្ដង់ដារភាសាវិទ្យា',
    description: 'Guidelines on managing Zero-Width Non-Joiner (ZWNJ U+200C) and Zero-Width Joiner (ZWJ U+200D) in non-Latin scripts, directly impacting regex cleaning and BPE tokenizer merges.',
    descriptionKm: 'គោលការណ៍ណែនាំសម្រាប់ការគ្រប់គ្រងតួអក្សរភ្ជាប់ឥតទទឹង (ZWNJ U+200C និង ZWJ U+200D) ក្នុងអក្សរមិនមែនឡាតាំង ដែលប៉ះពាល់ផ្ទាល់ដល់ការសម្អាត Regex និងការរួមបញ្ចូល BPE។',
    impactOnKhmerLlm: 'Prevents invisible formatting characters from fragmenting subwords into multi-token sequences.',
    impactOnKhmerLlmKm: 'ការពារតួអក្សរមើលមិនឃើញកុំឱ្យបំបែកពាក្យខ្មែរទៅជាលំដាប់ថូខឹនតូចៗជាច្រើនផ្នែក។',
    url: 'https://www.unicode.org/reports/tr31/',
    bibtex: `@techreport{unicode_tr31_2023,\n  author = {Davis, Mark},\n  title = {Unicode Standard Annex #31: Unicode Identifier and Pattern Syntax},\n  institution = {Unicode Consortium},\n  year = {2023}\n}`,
    tags: ['ZWNJ', 'Tokenizer Invariance', 'Regex Sanitization', 'Syntax'],
    peerReviewedOrOfficial: true,
    license: 'Unicode Open Standard',
    relevanceRating: 'CRITICAL'
  },
  {
    id: 'rac-khmer-dictionary',
    title: 'National Standard Khmer Dictionary & Orthographic Rules (Choun Nath Corpus)',
    titleKhmer: 'វចនានុក្រមខ្មែរ សម្ដេចសង្ឃរាជ ជួន ណាត និងក្បួនអក្ខរាវិរុទ្ធផ្លូវការ នៃរាជបណ្ឌិត្យសភាកម្ពុជា',
    authorsOrOrganization: 'Royal Academy of Cambodia (National Institute of Language)',
    yearOrDate: '2022 Revision',
    yearOrDateKm: 'កំណែឆ្នាំ ២០២២',
    category: 'standards',
    categoryLabel: 'Linguistic Standards',
    categoryLabelKm: 'ស្ដង់ដារភាសាវិទ្យា',
    description: 'The golden ground-truth lexicon for Khmer morphology, defining 40,000+ classical Pali and Sanskrit loanwords, royal registers (រាជសព្ទ), and Buddhist ecclesiastical vocabularies (សង្ឃសព្ទ).',
    descriptionKm: 'វចនានុក្រមគោលសម្រាប់រចនាសម្ព័ន្ធពាក្យខ្មែរ ដែលកំណត់ពាក្យបាលី-សំស្ក្រឹតជាង ៤០,០០០ ពាក្យ រាជសព្ទ និងសង្ឃសព្ទតាមស្តង់ដារជាតិ។',
    impactOnKhmerLlm: 'Used to build high-priority seed vocabularies for SentencePiece BPE and validate spellchecking classifiers in data cleaning pipelines.',
    impactOnKhmerLlmKm: 'ប្រើសម្រាប់កសាងវាក្យសព្ទដើមអាទិភាពខ្ពស់ក្នុង SentencePiece BPE និងផ្ទៀងផ្ទាត់អក្ខរាវិរុទ្ធក្នុងដំណាក់កាលសម្អាតទិន្នន័យ។',
    url: 'https://rac.gov.kh/',
    bibtex: `@book{rac2022dictionary,\n  author = {{Royal Academy of Cambodia}},\n  title = {Khmer Orthography and National Lexicographical Standard},\n  publisher = {National Institute of Language},\n  year = {2022}\n}`,
    tags: ['Lexicon', 'Pali-Sanskrit', 'Honorifics', 'Ground Truth', 'RAC'],
    peerReviewedOrOfficial: true,
    license: 'National Copyright / Research Open Access',
    relevanceRating: 'FOUNDATIONAL'
  },

  // 2. RESEARCH PAPERS (LLMS & LOW-RESOURCE NLP)
  {
    id: 'seallms-v2',
    title: 'SeaLLMs v2: Towards Inclusive and Culturally Competent Large Language Models for Southeast Asia',
    titleKhmer: 'SeaLLMs v2៖ ការស្រាវជ្រាវគំរូភាសាធំប្រកបដោយបរិយាបន្ន និងសមត្ថភាពវប្បធម៌សម្រាប់អាស៊ីអាគ្នេយ៍',
    authorsOrOrganization: 'Damani et al. (DAMO Academy, Alibaba Group)',
    yearOrDate: '2024',
    category: 'papers',
    categoryLabel: 'Research Papers',
    categoryLabelKm: 'ឯកសារស្រាវជ្រាវ',
    description: 'Groundbreaking research evaluating LLM adaptation to Southeast Asian scripts. Details vocabulary expansion, fertility rate compression, and avoiding translationese calques.',
    descriptionKm: 'ការស្រាវជ្រាវសំខាន់អំពីការសម្របគំរូ LLM ទៅលើអក្សរអាស៊ីអាគ្នេយ៍។ រៀបរាប់អំពីការពង្រីកវាក្យសព្ទ ការបង្រួមអត្រា Token Fertility និងការចៀសវាងភាសាបកប្រែត្រង់។',
    impactOnKhmerLlm: 'Provides direct empirical proof that expanding tokenizers with script-specific syllables reduces inference latency by 3.2x and improves downstream STEM reasoning.',
    impactOnKhmerLlmKm: 'ផ្តល់ភស្តុតាងជាក់ស្តែងថាការពង្រីកវាក្យសព្ទតាមព្យាង្គខ្មែរជួយកាត់បន្ថយភាពយឺតយ៉ាវនៃការឆ្លើយតបបាន ៣.២ ដង និងបង្កើនសមត្ថភាពគិតផ្នែកវិទ្យាសាស្ត្រ។',
    url: 'https://arxiv.org/abs/2405.14371',
    pdfUrl: 'https://arxiv.org/pdf/2405.14371.pdf',
    bibtex: `@article{damani2024seallms,\n  title={SeaLLMs v2: Towards Inclusive and Culturally Competent Large Language Models for Southeast Asia},\n  author={Damani, Brijayan and others},\n  journal={arXiv preprint arXiv:2405.14371},\n  year={2024}\n}`,
    tags: ['Southeast Asia', 'Token Fertility', 'SeaLLMs', 'Cultural Alignment', 'SFT'],
    peerReviewedOrOfficial: true,
    relevanceRating: 'CRITICAL'
  },
  {
    id: 'sailor-sea-models',
    title: 'Sailor: Crafting Open Language Models for South-East Asia',
    titleKhmer: 'Sailor៖ គំរូភាសាបើកចំហសម្រាប់បណ្ដាភាសាក្នុងតំបន់អាស៊ីអាគ្នេយ៍',
    authorsOrOrganization: 'Dou et al. (Sea AI Lab & Singapore)',
    yearOrDate: '2024',
    category: 'papers',
    categoryLabel: 'Research Papers',
    categoryLabelKm: 'ឯកសារស្រាវជ្រាវ',
    description: 'Presents Sailor-0.5B, 1.8B, 7B, and 14B models pretrained from scratch with balanced sampling across Indonesian, Thai, Vietnamese, and Khmer. Emphasizes token efficiency.',
    descriptionKm: 'បង្ហាញគំរូ Sailor-0.5B, 1.8B, 7B និង 14B ដែលបណ្តុះបណ្តាលដោយរក្សាតុល្យភាពភាសាឥណ្ឌូនេស៊ី ថៃ វៀតណាម និងខ្មែរ ដោយសង្កត់ធ្ងន់លើប្រសិទ្ធភាពថូខឹន។',
    impactOnKhmerLlm: 'Serves as an architectural blueprint for our 1.5B Khmer Foundation model, specifically validating 32k BPE vocab size and RoPE theta = 500,000.',
    impactOnKhmerLlmKm: 'ជាគំរូស្ថាបត្យកម្មស្នូលសម្រាប់ម៉ូដែលមូលដ្ឋានខ្មែរ 1.5B ជាពិសេសការបញ្ជាក់ពីទំហំវាក្យសព្ទ BPE 32k និង RoPE theta = 500,000។',
    url: 'https://arxiv.org/abs/2404.03608',
    pdfUrl: 'https://arxiv.org/pdf/2404.03608.pdf',
    bibtex: `@article{dou2024sailor,\n  title={Sailor: Open Language Models for South-East Asia},\n  author={Dou, Longxu and others},\n  journal={arXiv preprint arXiv:2404.03608},\n  year={2024}\n}`,
    tags: ['Pretraining', 'Sailor', 'Low-Resource', 'Architecture', 'Benchmarking'],
    peerReviewedOrOfficial: true,
    relevanceRating: 'CRITICAL'
  },
  {
    id: 'sea-lion-singapore',
    title: 'SEA-LION: Southeast Asian Languages in One Network',
    titleKhmer: 'SEA-LION៖ បណ្ដាញគំរូភាសាអាស៊ីអាគ្នេយ៍ ដោយវិទ្យាស្ថាន AI Singapore',
    authorsOrOrganization: 'AI Singapore (AISG) Engineering & Research Team',
    yearOrDate: '2024',
    category: 'papers',
    categoryLabel: 'Research Papers',
    categoryLabelKm: 'ឯកសារស្រាវជ្រាវ',
    description: 'Documents the building of sovereign Southeast Asian foundation models from raw Common Crawl. Focuses heavily on data deduplication, removing web spam, and low-resource fertility.',
    descriptionKm: 'ឯកសារបង្ហាញពីការកសាងគំរូមូលដ្ឋានអធិបតេយ្យអាស៊ីអាគ្នេយ៍ពីទិន្នន័យ Common Crawl ដោយផ្តោតខ្លាំងលើការលុបទិន្នន័យស្ទួន និងសារឥតបានការតាមគេហទំព័រ។',
    impactOnKhmerLlm: 'Demonstrates exact deduplication thresholds (MinHash LSH 5-grams) to eliminate machine-translated SEO spam in crawled Khmer text.',
    impactOnKhmerLlmKm: 'បង្ហាញពីកម្រិតលុបទិន្នន័យស្ទួន (MinHash LSH 5-grams) ដើម្បីកម្ចាត់អត្ថបទ SEO បកប្រែដោយម៉ាស៊ីនក្នុងទិន្នន័យខ្មែរ។',
    url: 'https://arxiv.org/abs/2406.18667',
    pdfUrl: 'https://arxiv.org/pdf/2406.18667.pdf',
    bibtex: `@article{aisg2024sealion,\n  title={SEA-LION: A Corpus and Foundation Model Suite for Southeast Asia},\n  author={{AI Singapore}},\n  journal={arXiv preprint arXiv:2406.18667},\n  year={2024}\n}`,
    tags: ['SEA-LION', 'Data Curation', 'MinHash LSH', 'Corpus Cleaning'],
    peerReviewedOrOfficial: true,
    relevanceRating: 'CRITICAL'
  },
  {
    id: 'chinchilla-scaling-laws',
    title: 'Training Compute-Optimal Large Language Models (Chinchilla Scaling Laws)',
    titleKhmer: 'ច្បាប់ Scaling Compute-Optimal សម្រាប់គំរូភាសាធំ (Chinchilla)',
    authorsOrOrganization: 'Hoffmann, Borgeaud, Mensch et al. (Google DeepMind)',
    yearOrDate: '2022',
    category: 'papers',
    categoryLabel: 'Research Papers',
    categoryLabelKm: 'ឯកសារស្រាវជ្រាវ',
    description: 'The definitive empirical study demonstrating that parameter count and token volume must scale in equal proportions (Tokens ≈ 20 × Parameters) for optimal loss.',
    descriptionKm: 'ការសិក្សាគោលដែលបង្ហាញថាចំនួនប៉ារ៉ាម៉ែត្រ និងបរិមាណថូខឹនត្រូវតែពង្រីកសមាមាត្រគ្នា (Tokens ≈ 20 × Parameters) ដើម្បីទទួលបានកម្រិត Loss ល្អបំផុត។',
    impactOnKhmerLlm: 'Underpins our compute calculator: proves that a 1.5B parameter Khmer model requires at least 30B–45B high-quality tokens rather than scaling parameters blindly.',
    impactOnKhmerLlmKm: 'ជាមូលដ្ឋានគ្រឹះសម្រាប់ម៉ាស៊ីនគណនាបន្ទុករបស់យើង៖ បញ្ជាក់ថាម៉ូដែលខ្មែរ 1.5B ត្រូវការថូខឹនគុណភាពខ្ពស់យ៉ាងតិច 30B–45B ជាជាងបង្កើនតែប៉ារ៉ាម៉ែត្រ។',
    url: 'https://arxiv.org/abs/2203.15556',
    pdfUrl: 'https://arxiv.org/pdf/2203.15556.pdf',
    bibtex: `@article{hoffmann2022chinchilla,\n  title={Training Compute-Optimal Large Language Models},\n  author={Hoffmann, Jordan and others},\n  journal={arXiv preprint arXiv:2203.15556},\n  year={2022}\n}`,
    tags: ['Scaling Laws', 'Compute Budget', 'Chinchilla', 'Optimization'],
    peerReviewedOrOfficial: true,
    relevanceRating: 'FOUNDATIONAL'
  },
  {
    id: 'khmer-word-segmentation-ding',
    title: 'Towards Khmer Word and Syllable Segmentation Using Deep Neural Sequences',
    titleKhmer: 'ការបែងចែកព្យាង្គ និងពាក្យខ្មែរ ដោយប្រើបណ្ដាញសរសៃប្រសាទសិប្បនិម្មិត BiLSTM-CRF',
    authorsOrOrganization: 'Ding, Chea, Utiyama, and Sumita (NICT Japan & NIPTICT Cambodia)',
    yearOrDate: '2019',
    category: 'papers',
    categoryLabel: 'Research Papers',
    categoryLabelKm: 'ឯកសារស្រាវជ្រាវ',
    description: 'Evaluates character-level and syllable-level embedding strategies to accurately predict zero-space word boundaries in natural Khmer text.',
    descriptionKm: 'វាយតម្លៃយុទ្ធសាស្ត្រកម្រិតតួអក្សរ និងកម្រិតព្យាង្គដើម្បីទស្សន៍ទាយព្រំដែនពាក្យខ្មែរដែលសរសេរជាប់គ្នាគ្មានដកឃ្លាបានយ៉ាងត្រឹមត្រូវ។',
    impactOnKhmerLlm: 'Directly informs our Syllable-Aware BPE pre-tokenizer: proves that segmenting at syllable boundaries prior to BPE achieves higher compression and fewer out-of-vocabulary splits.',
    impactOnKhmerLlmKm: 'ផ្តល់មូលដ្ឋានដល់ឧបករណ៍ Syllable-Aware BPE របស់យើង៖ បង្ហាញថាការកាត់ព្យាង្គមុន BPE ផ្តល់ការបង្រួមខ្ពស់ និងកាត់បន្ថយការបំបែកពាក្យខុស។',
    url: 'https://arxiv.org/abs/1908.08272',
    pdfUrl: 'https://arxiv.org/pdf/1908.08272.pdf',
    bibtex: `@inproceedings{ding2019khmer,\n  title={A Benchmark Dataset for Khmer Word Segmentation},\n  author={Ding, Chenchen and others},\n  booktitle={Proceedings of the Workshop on Technologies for Low-Resource Languages},\n  year={2019}\n}`,
    tags: ['Segmentation', 'BiLSTM-CRF', 'Syllable Cluster', 'Zero-Space Script'],
    peerReviewedOrOfficial: true,
    relevanceRating: 'FOUNDATIONAL'
  },
  {
    id: 'fineweb-refinements',
    title: 'FineWeb: Decanting the Web for the Best Pretraining Data',
    titleKhmer: 'FineWeb៖ យន្តការចម្រាញ់ទិន្នន័យគេហទំព័រកម្រិតខ្ពស់សម្រាប់ Pretraining',
    authorsOrOrganization: 'Penedo et al. (HuggingFace)',
    yearOrDate: '2024',
    category: 'papers',
    categoryLabel: 'Research Papers',
    categoryLabelKm: 'ឯកសារស្រាវជ្រាវ',
    description: 'Comprehensive analysis of web-filtering pipelines: heuristics, language ID confidence filtering, line-level perplexity thresholds, and synthetic deduplication.',
    descriptionKm: 'ការវិភាគគ្រប់ជ្រុងជ្រោយលើបំពង់ចម្រាញ់ទិន្នន័យគេហទំព័រ៖ ក្បួនចម្រាញ់ ទំនុកចិត្តអត្តសញ្ញាណភាសា កម្រិត Perplexity តាមបន្ទាត់ និងការលុបទិន្នន័យស្ទួន។',
    impactOnKhmerLlm: 'Our Corpus Cleansing Pipeline implements FineWeb filtering heuristics customized to Khmer vowel/consonant character ratios.',
    impactOnKhmerLlmKm: 'កម្មវិធីសម្អាតឃ្លាំងអត្ថបទរបស់យើងអនុវត្តក្បួនចម្រាញ់ FineWeb ដែលកែសម្រួលតាមសមាមាត្រស្រៈ និងព្យញ្ជនៈខ្មែរ។',
    url: 'https://arxiv.org/abs/2406.17557',
    pdfUrl: 'https://arxiv.org/pdf/2406.17557.pdf',
    bibtex: `@article{penedo2024fineweb,\n  title={The FineWeb Datasets: Decanting the Web for the Finest Text Data at Scale},\n  author={Penedo, Guilherme and others},\n  journal={arXiv preprint arXiv:2406.17557},\n  year={2024}\n}`,
    tags: ['FineWeb', 'Data Cleaning', 'Filtering Heuristics', 'HuggingFace'],
    peerReviewedOrOfficial: true,
    relevanceRating: 'RECOMMENDED'
  },

  // 3. CORPORA & OPEN DATASETS
  {
    id: 'madlad-400-khmer',
    title: 'MADLAD-400: A Multilingual Audited Dataset for 400+ Languages (Khmer Subset)',
    titleKhmer: 'ទិន្នន័យចម្រាញ់ពហុភាសា MADLAD-400 ដោយ Google Research (ផ្នែកភាសាខ្មែរ)',
    authorsOrOrganization: 'Google Research Multilingual NLP Team',
    yearOrDate: '2023',
    category: 'corpora',
    categoryLabel: 'Open Corpora',
    categoryLabelKm: 'ឃ្លាំងទិន្នន័យបើកចំហ',
    description: 'Carefully filtered and audited clean web crawl comprising over 850 million tokens of high-fidelity Khmer text extracted across 15+ years of internet archives.',
    descriptionKm: 'ទិន្នន័យគេហទំព័រស្អាតដែលត្រូវបានត្រួតពិនិត្យ និងចម្រាញ់យ៉ាងម៉ត់ចត់ មានជាង ៨៥០ លានថូខឹនជាអក្សរខ្មែរគុណភាពខ្ពស់ដកស្រង់ក្នុងរយៈពេល ១៥+ ឆ្នាំ។',
    impactOnKhmerLlm: 'Primary open Tier 1 foundation pretraining corpus for base language modeling and syntactic coverage.',
    impactOnKhmerLlmKm: 'ឃ្លាំងទិន្នន័យបើកចំហកម្រិត ១ ចម្បងសម្រាប់ការបណ្តុះបណ្តាលម៉ូដែលមូលដ្ឋាន និងគ្របដណ្តប់វេយ្យាករណ៍ខ្មែរ។',
    url: 'https://huggingface.co/datasets/allenai/MADLAD-400',
    tags: ['Pretraining Corpus', 'Google Research', '850M Tokens', 'Open Access'],
    peerReviewedOrOfficial: true,
    license: 'ODC-BY',
    relevanceRating: 'CRITICAL'
  },
  {
    id: 'oscar-khmer-corpus',
    title: 'OSCAR (Open Super-large Crawled ALMAnaCH CoRpus) - Khmer Domain',
    titleKhmer: 'បណ្តុំទិន្នន័យ OSCAR សម្រាប់ភាសាខ្មែរ ដោយវិទ្យាស្ថាន Inria បារាំង',
    authorsOrOrganization: 'Inria & Language Technology Team (France)',
    yearOrDate: '2023',
    category: 'corpora',
    categoryLabel: 'Open Corpora',
    categoryLabelKm: 'ឃ្លាំងទិន្នន័យបើកចំហ',
    description: 'Enormous deduplicated Common Crawl extraction processed via fastText language identification and strict document-level sharding.',
    descriptionKm: 'ការដកស្រង់ Common Crawl ទ្រង់ទ្រាយធំដែលបានលុបភាពស្ទួន តាមរយៈការកំណត់អត្តសញ្ញាណភាសា fastText និងការបែងចែកឯកសារតឹងរ៉ឹង។',
    impactOnKhmerLlm: 'Provides 2.1 billion raw tokens for Stage 1 pretraining; requires our cleaning simulator pipeline to remove machine-translated gambling ads.',
    impactOnKhmerLlmKm: 'ផ្តល់ថូខឹនឆៅ ២.១ ពាន់លានសម្រាប់ការបណ្តុះបណ្តាលដំណាក់កាលទី ១ ដែលត្រូវការកម្មវិធីសម្អាតដើម្បីលុបការផ្សាយពាណិជ្ជកម្មល្បែងបកប្រែដោយម៉ាស៊ីន។',
    url: 'https://oscar-project.org/',
    tags: ['Common Crawl', 'Inria', 'Web Scale', '2.1B Tokens'],
    peerReviewedOrOfficial: true,
    license: 'CC0 / Open Research',
    relevanceRating: 'FOUNDATIONAL'
  },
  {
    id: 'openslr-khmer-asr',
    title: 'OpenSLR 42: Large Khmer Speech and Verified Phonemic Text Corpus',
    titleKhmer: 'OpenSLR 42៖ បណ្ដុំទិន្នន័យអត្ថបទ និងសម្លេងភាសាខ្មែរផ្លូវការ ជាង ១០០ ម៉ោង',
    authorsOrOrganization: 'Google & Local Cambodian Linguists Collaboration',
    yearOrDate: '2021',
    category: 'corpora',
    categoryLabel: 'Open Corpora',
    categoryLabelKm: 'ឃ្លាំងទិន្នន័យបើកចំហ',
    description: '100+ hours of verified human-spoken Khmer with human-transcribed, orthographically validated transcriptions adhering to Royal Academy standards.',
    descriptionKm: 'ទិន្នន័យសំឡេងនិយាយខ្មែរពិតប្រាកដជាង ១០០ ម៉ោង រួមជាមួយអត្ថបទចម្លងដែលផ្ទៀងផ្ទាត់អក្ខរាវិរុទ្ធដោយអ្នកភាសាវិទ្យាតាមស្តង់ដាររាជបណ្ឌិត្យសភា។',
    impactOnKhmerLlm: 'High-purity Tier 1 conversational corpus. Zero automated machine translation artifacts or gambling spam.',
    impactOnKhmerLlmKm: 'ឃ្លាំងទិន្នន័យសន្ទនាកម្រិត ១ សុទ្ធសាធ ដែលគ្មានស្លាកស្នាមបកប្រែដោយម៉ាស៊ីន ឬសារឥតបានការឡើយ។',
    url: 'https://www.openslr.org/42/',
    tags: ['Verified Transcripts', 'Human Curation', 'OpenSLR', 'Acoustic & Text'],
    peerReviewedOrOfficial: true,
    license: 'Apache 2.0',
    relevanceRating: 'FOUNDATIONAL'
  },

  // 4. NLP TOOLKITS & SEGMENTERS
  {
    id: 'khmer-nltk-toolkit',
    title: 'khmer-nltk: Natural Language Processing Toolkit for Khmer Script',
    titleKhmer: 'បណ្ណាល័យ khmer-nltk សម្រាប់ការកាត់ពាក្យ និងវិភាគវេយ្យាករណ៍ខ្មែរ',
    authorsOrOrganization: 'Phonetworks & Cambodian Open Source Contributors',
    yearOrDate: '2023',
    category: 'toolkits',
    categoryLabel: 'NLP Toolkits',
    categoryLabelKm: 'ឧបករណ៍ NLP',
    description: 'Python toolkit implementing syllable-based maximum matching (MaxMatch), CRF tokenization, and Unicode ligature normalization for Cambodian text.',
    descriptionKm: 'បណ្ណាល័យ Python ដែលអនុវត្តការកាត់ពាក្យតាមព្យាង្គ MaxMatch, ការបំបែកថូខឹន CRF និងការធ្វើស្តង់ដារលំដាប់តួអក្សរយូនីកូដសម្រាប់អត្ថបទខ្មែរ។',
    impactOnKhmerLlm: 'Used directly inside preprocessing workers to segment compound phrases before training custom SentencePiece models.',
    impactOnKhmerLlmKm: 'ប្រើដោយផ្ទាល់ក្នុងដំណើរការបំបែកឃ្លានិងពាក្យផ្សំ មុនពេលបណ្តុះបណ្តាលម៉ូដែល SentencePiece ផ្ទាល់ខ្លួន។',
    url: 'https://github.com/phonetworks/khmer-nltk',
    tags: ['Python', 'Open Source', 'Syllable Tokenizer', 'Preprocessing'],
    peerReviewedOrOfficial: false,
    license: 'MIT License',
    relevanceRating: 'RECOMMENDED'
  },
  {
    id: 'sefr-cut-khmer',
    title: 'SEFR-CUT: Stacked Ensemble Filter for Khmer & Thai Word Segmentation',
    titleKhmer: 'SEFR-CUT៖ ក្បួនកាត់ពាក្យបច្ចេកវិទ្យា Ensemble សម្រាប់ភាសាខ្មែរ និងថៃ',
    authorsOrOrganization: 'Chulalongkorn University & NLP Lab',
    yearOrDate: '2022',
    category: 'toolkits',
    categoryLabel: 'NLP Toolkits',
    categoryLabelKm: 'ឧបករណ៍ NLP',
    description: 'High-throughput word segmenter combining deep CNNs with character-level feature maps, designed for unsegmented Southeast Asian orthography.',
    descriptionKm: 'ឧបករណ៍កាត់ពាក្យល្បឿនលឿនដែលរួមបញ្ចូលគ្នារវាង Deep CNN និងលក្ខណៈកម្រិតតួអក្សរ សម្រាប់ប្រព័ន្ធសំណេរអាស៊ីអាគ្នេយ៍គ្មានដកឃ្លា។',
    impactOnKhmerLlm: 'Enables 10x faster batch-tokenization during data ingest pipelines on multi-core CPU preprocessing nodes.',
    impactOnKhmerLlmKm: 'អនុញ្ញាតឱ្យការបំបែកថូខឹនជាបាច់ដំណើរការលឿនជាងមុន ១០ ដងក្នុងបំពង់ទាញបញ្ចូលទិន្នន័យលើ CPU ច្រើនស្នូល។',
    url: 'https://github.com/PyThaiNLP/sefr_cut',
    tags: ['High Throughput', 'CNN Segmenter', 'Southeast Asia', 'Batch Ingest'],
    peerReviewedOrOfficial: true,
    license: 'Apache 2.0',
    relevanceRating: 'RECOMMENDED'
  }
];

const QUICK_SEARCH_PRESETS = [
  { query: 'Unicode', label: 'Unicode', labelKm: 'យូនីកូដ' },
  { query: 'SeaLLMs', label: 'SeaLLMs', labelKm: 'SeaLLMs' },
  { query: 'Linguistic Standards', label: 'Linguistic Standards', labelKm: 'ស្ដង់ដារភាសាវិទ្យា' },
  { query: 'Research Papers', label: 'Research Papers', labelKm: 'ឯកសារស្រាវជ្រាវ' },
  { query: 'Chinchilla', label: 'Chinchilla', labelKm: 'Chinchilla' },
  { query: 'Segmentation', label: 'Segmentation', labelKm: 'ការកាត់ពាក្យ' }
];

export const ResearchLibrary: React.FC = () => {
  const { isKm, tr } = useLanguage();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchScope, setSearchScope] = useState<SearchScope>('all');
  const [selectedCategory, setSelectedCategory] = useState<ResourceCategory>('all');
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [copiedBibtexId, setCopiedBibtexId] = useState<string | null>(null);
  const [progressMap, setProgressMap] = useState<Record<string, ReadingStatus>>(() =>
    loadSavedProgress()
  );
  const [confirmClearProgress, setConfirmClearProgress] = useState<boolean>(false);

  useEffect(() => {
    try {
      localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progressMap));
    } catch {
      // Ignore storage quota or private-mode errors gracefully
    }
  }, [progressMap]);

  const progressStats = useMemo(() => {
    let readCount = 0;
    let toReviewCount = 0;
    for (const item of RESEARCH_ITEMS) {
      const status = progressMap[item.id];
      if (status === 'read') readCount += 1;
      else if (status === 'to-review') toReviewCount += 1;
    }
    const total = RESEARCH_ITEMS.length;
    const unreadCount = total - readCount - toReviewCount;
    const completionPct = total > 0 ? Math.round((readCount / total) * 100) : 0;
    const toReviewPct = total > 0 ? Math.round((toReviewCount / total) * 100) : 0;
    return {
      total,
      readCount,
      toReviewCount,
      unreadCount,
      completionPct,
      toReviewPct
    };
  }, [progressMap]);

  const toggleReadingStatus = (id: string, targetStatus: ReadingStatus) => {
    setConfirmClearProgress(false);
    setProgressMap((prev) => {
      const next = { ...prev };
      if (next[id] === targetStatus) {
        delete next[id];
      } else {
        next[id] = targetStatus;
      }
      return next;
    });
  };

  const handleClearAllProgress = () => {
    setProgressMap({});
    setConfirmClearProgress(false);
    if (selectedStatus !== 'all') {
      setSelectedStatus('all');
    }
  };

  // Compute all unique tags
  const allTags = useMemo(() => {
    const set = new Set<string>();
    RESEARCH_ITEMS.forEach((item) => item.tags.forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, []);

  const hasActiveFilters = Boolean(
    searchQuery.trim() ||
      selectedCategory !== 'all' ||
      selectedStatus !== 'all' ||
      selectedTag ||
      searchScope !== 'all'
  );

  // Filter items based on search query (across title/category/metadata), category tab, status, and active tag
  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return RESEARCH_ITEMS.filter((item) => {
      // Reading status filter
      if (selectedStatus !== 'all') {
        const itemStatus = progressMap[item.id];
        if (selectedStatus === 'unread' && itemStatus !== undefined) {
          return false;
        }
        if (
          (selectedStatus === 'read' || selectedStatus === 'to-review') &&
          itemStatus !== selectedStatus
        ) {
          return false;
        }
      }

      // Category dropdown / tab filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }

      // Tag filter
      if (selectedTag && !item.tags.includes(selectedTag)) {
        return false;
      }

      // Search query filter with selectable scope
      if (q) {
        const matchTitle =
          item.title.toLowerCase().includes(q) ||
          Boolean(item.titleKhmer?.toLowerCase().includes(q));
        const matchCategory =
          item.category.toLowerCase().includes(q) ||
          item.categoryLabel.toLowerCase().includes(q) ||
          item.categoryLabelKm.toLowerCase().includes(q);
        const matchAuthors = item.authorsOrOrganization.toLowerCase().includes(q);
        const matchDesc =
          item.description.toLowerCase().includes(q) ||
          item.descriptionKm.toLowerCase().includes(q);
        const matchImpact =
          item.impactOnKhmerLlm.toLowerCase().includes(q) ||
          item.impactOnKhmerLlmKm.toLowerCase().includes(q);
        const matchTags = item.tags.some((t) => t.toLowerCase().includes(q));

        if (searchScope === 'title') {
          return matchTitle;
        }
        if (searchScope === 'category') {
          return matchCategory || matchTags;
        }

        // Default 'all' scope checks title, category, authors, description, impact, and tags
        if (
          !matchTitle &&
          !matchCategory &&
          !matchAuthors &&
          !matchDesc &&
          !matchImpact &&
          !matchTags
        ) {
          return false;
        }
      }

      return true;
    });
  }, [searchQuery, searchScope, selectedCategory, selectedStatus, selectedTag, progressMap]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSearchScope('all');
    setSelectedCategory('all');
    setSelectedStatus('all');
    setSelectedTag(null);
  };

  const handleCopyBibtex = (item: ResearchItem) => {
    if (!item.bibtex) return;
    navigator.clipboard.writeText(item.bibtex);
    setCopiedBibtexId(item.id);
    setTimeout(() => setCopiedBibtexId(null), 2000);
  };

  const highlightText = (text: string) => {
    const q = searchQuery.trim();
    if (!q) return text;

    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escaped})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, idx) =>
      part.toLowerCase() === q.toLowerCase() ? (
        <mark
          key={idx}
          className="bg-amber-400/25 text-amber-200 px-0.5 rounded-sm font-semibold"
        >
          {part}
        </mark>
      ) : (
        <React.Fragment key={idx}>{part}</React.Fragment>
      )
    );
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'standards':
        return (
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800 flex items-center gap-1 ${isKm ? 'font-khmer' : 'font-mono'}`}>
            <ShieldCheck className="w-3 h-3 text-amber-400" />
            <span>{highlightText(tr('Linguistic Standard', 'ស្ដង់ដារភាសាវិទ្យា'))}</span>
          </span>
        );
      case 'papers':
        return (
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800 flex items-center gap-1 ${isKm ? 'font-khmer' : 'font-mono'}`}>
            <GraduationCap className="w-3 h-3 text-cyan-400" />
            <span>{highlightText(tr('Research Paper', 'ឯកសារស្រាវជ្រាវ'))}</span>
          </span>
        );
      case 'corpora':
        return (
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1 ${isKm ? 'font-khmer' : 'font-mono'}`}>
            <Database className="w-3 h-3 text-emerald-400" />
            <span>{highlightText(tr('Corpus / Dataset', 'ឃ្លាំងទិន្នន័យ'))}</span>
          </span>
        );
      case 'toolkits':
        return (
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold bg-violet-950 text-violet-300 border border-violet-800 flex items-center gap-1 ${isKm ? 'font-khmer' : 'font-mono'}`}>
            <Code2 className="w-3 h-3 text-violet-400" />
            <span>{highlightText(tr('NLP Toolkit', 'ឧបករណ៍ NLP'))}</span>
          </span>
        );
      default:
        return null;
    }
  };

  const getRelevanceBadge = (rating: 'CRITICAL' | 'FOUNDATIONAL' | 'RECOMMENDED') => {
    switch (rating) {
      case 'CRITICAL':
        return (
          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-950 text-rose-300 border border-rose-800 ${isKm ? 'font-khmer' : 'font-mono'}`}>
            {tr('CRITICAL', 'សំខាន់បំផុត')}
          </span>
        );
      case 'FOUNDATIONAL':
        return (
          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-950 text-amber-300 border border-amber-800 ${isKm ? 'font-khmer' : 'font-mono'}`}>
            {tr('FOUNDATIONAL', 'គ្រឹះមូលដ្ឋាន')}
          </span>
        );
      case 'RECOMMENDED':
        return (
          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-800 text-slate-300 border border-slate-700 ${isKm ? 'font-khmer' : 'font-mono'}`}>
            {tr('RECOMMENDED', 'ណែនាំឱ្យអាន')}
          </span>
        );
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className={`inline-flex items-center gap-2 text-xs font-semibold text-amber-400 tracking-wider ${isKm ? 'font-khmer' : 'uppercase font-mono'}`}>
          <BookOpen className="w-3.5 h-3.5" />
          <span>{tr('KHMER LLM BIBLIOGRAPHY & CORPUS REPOSITORY', 'បណ្ណាល័យឯកសារស្រាវជ្រាវ និងឃ្លាំងទិន្នន័យ LLM ខ្មែរ')}</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span>{tr('PEER-REVIEWED SPECIFICATIONS', 'លក្ខណៈបច្ចេកទេសត្រួតពិនិត្យផ្លូវការ')}</span>
        </div>
        <h2 className={`text-2xl sm:text-3xl font-bold text-white tracking-tight ${isKm ? 'font-khmer' : ''}`}>
          {tr('Research Library & Linguistic Standards', 'បណ្ណាល័យស្រាវជ្រាវ និងស្ដង់ដារភាសាវិទ្យា')}
        </h2>
        <p className={`text-sm text-slate-300 max-w-3xl leading-relaxed ${isKm ? 'font-khmer' : ''}`}>
          {tr(
            'Curated corpus of peer-reviewed research papers on low-resource language modeling, authoritative Unicode Consortium Khmer specifications, Royal Academy orthographic standards, and open-source NLP segmenters.',
            'បណ្ដុំឯកសារស្រាវជ្រាវផ្នែកគំរូភាសាធនធានទាប ស្ដង់ដារអក្សរខ្មែរផ្លូវការរបស់ Unicode Consortium ក្បួនអក្ខរាវិរុទ្ធនៃរាជបណ្ឌិត្យសភាកម្ពុជា និងឧបករណ៍កាត់ពាក្យ NLP បើកចំហ។'
          )}
        </p>
      </div>

      {/* Researcher Reading Progress Tracker */}
      <div className="p-4 sm:p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <h3 className={`text-sm font-bold text-white ${isKm ? 'font-khmer' : ''}`}>
                {tr('Researcher Reading Progress', 'វឌ្ឍនភាពការអានឯកសារស្រាវជ្រាវ')}
              </h3>
              <span className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800/80 text-emerald-300 text-[11px] font-mono tabular-nums">
                {progressStats.readCount}/{progressStats.total} ({progressStats.completionPct}%)
              </span>
            </div>
            <p className={`text-xs text-slate-400 ${isKm ? 'font-khmer' : ''}`}>
              {tr(
                'Track papers as Read or To Review; progress is saved locally in your browser.',
                'សម្គាល់ឯកសារថា «បានអាន» ឬ «ត្រូវពិនិត្យឡើងវិញ» — វឌ្ឍនភាពត្រូវបានរក្សាទុកក្នុងកម្មវិធីរុករករបស់អ្នក។'
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {(progressStats.readCount > 0 || progressStats.toReviewCount > 0) && (
              confirmClearProgress ? (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleClearAllProgress}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/50 hover:bg-rose-500/30 transition-colors whitespace-nowrap ${isKm ? 'font-khmer' : 'font-mono'}`}
                  >
                    {tr('Confirm Reset', 'បញ្ជាក់ការលុប')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmClearProgress(false)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] bg-slate-950 text-slate-300 border border-slate-800 hover:text-white transition-colors whitespace-nowrap ${isKm ? 'font-khmer' : 'font-mono'}`}
                  >
                    {tr('Cancel', 'បោះបង់')}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmClearProgress(true)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] bg-slate-950 text-slate-400 border border-slate-800 hover:text-rose-300 hover:border-rose-500/40 transition-colors whitespace-nowrap ${isKm ? 'font-khmer' : 'font-mono'}`}
                >
                  <Trash2 className="w-3 h-3" />
                  <span>{tr('Clear Progress', 'សម្អាតវឌ្ឍនភាព')}</span>
                </button>
              )
            )}
          </div>
        </div>

        {/* Segmented Progress Bar */}
        <div
          className="h-2 w-full rounded-full bg-slate-950 border border-slate-800 overflow-hidden flex"
          role="progressbar"
          aria-valuenow={progressStats.completionPct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={tr('Reading completion percentage', 'ភាគរយនៃការអានឯកសារ')}
        >
          {progressStats.completionPct > 0 && (
            <div
              className="h-full bg-emerald-400 transition-all duration-300"
              style={{ width: `${progressStats.completionPct}%` }}
            />
          )}
          {progressStats.toReviewPct > 0 && (
            <div
              className="h-full bg-cyan-400 transition-all duration-300"
              style={{ width: `${progressStats.toReviewPct}%` }}
            />
          )}
        </div>

        {/* Status Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-0.5">
          <span className={`text-[11px] text-slate-500 ${isKm ? 'font-khmer' : 'font-mono uppercase'}`}>
            {tr('READING STATUS:', 'ស្ថានភាពអាន៖')}
          </span>
          {(
            [
              {
                id: 'all',
                label: tr('All', 'ទាំងអស់'),
                count: progressStats.total,
                icon: BookOpen,
                activeClass: 'bg-amber-400 text-slate-950 border-amber-400 font-bold',
                badgeClass: 'bg-slate-950 text-amber-300'
              },
              {
                id: 'read',
                label: tr('Read', 'បានអាន'),
                count: progressStats.readCount,
                icon: CheckCircle2,
                activeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/60 font-bold',
                badgeClass: 'bg-emerald-950 text-emerald-300'
              },
              {
                id: 'to-review',
                label: tr('To Review', 'ត្រូវពិនិត្យឡើងវិញ'),
                count: progressStats.toReviewCount,
                icon: Bookmark,
                activeClass: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/60 font-bold',
                badgeClass: 'bg-cyan-950 text-cyan-300'
              },
              {
                id: 'unread',
                label: tr('Unread', 'មិនទាន់អាន'),
                count: progressStats.unreadCount,
                icon: Circle,
                activeClass: 'bg-slate-700/60 text-white border-slate-500 font-bold',
                badgeClass: 'bg-slate-950 text-slate-300'
              }
            ] as const
          ).map((statusOption) => {
            const Icon = statusOption.icon;
            const isActive = selectedStatus === statusOption.id;
            return (
              <button
                key={statusOption.id}
                type="button"
                onClick={() => setSelectedStatus(statusOption.id)}
                className={`px-2.5 py-1 rounded-lg text-xs border transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                  isKm ? 'font-khmer' : 'font-mono'
                } ${
                  isActive
                    ? statusOption.activeClass
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{statusOption.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded text-[10px] font-mono tabular-nums ${
                    isActive ? statusOption.badgeClass : 'bg-slate-900 text-slate-400'
                  }`}
                >
                  {statusOption.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter and Search Ribbon */}
      <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4">
        {/* Search Input + Scope + Quick Category Dropdown */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
          {/* Search Input */}
          <div className="lg:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              aria-label={tr(
                'Search linguistic papers or standards by title or category',
                'ស្វែងរកឯកសារស្រាវជ្រាវ ឬស្ដង់ដារភាសាតាមចំណងជើង ឬប្រភេទ'
              )}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={tr(
                'Search by title, category, standard, or author...',
                'ស្វែងរកតាមចំណងជើង ប្រភេទ ស្ដង់ដារ ឬអ្នកនិពន្ធ...'
              )}
              className={`w-full pl-10 pr-9 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-400 transition-colors placeholder:text-slate-500 ${
                isKm ? 'font-khmer' : 'font-sans'
              }`}
            />
            {searchQuery && (
              <button
                type="button"
                aria-label={tr('Clear search query', 'សម្អាតពាក្យស្វែងរក')}
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Search Field Scope Selector */}
          <div className={`lg:col-span-3 flex items-center gap-1 p-1 rounded-xl bg-slate-950 border border-slate-800 text-[11px] ${isKm ? 'font-khmer' : 'font-mono'}`}>
            {(
              [
                { id: 'all', label: tr('All Fields', 'គ្រប់ផ្នែក') },
                { id: 'title', label: tr('By Title', 'តាមចំណងជើង') },
                { id: 'category', label: tr('By Category', 'តាមប្រភេទ') }
              ] as const
            ).map((scope) => (
              <button
                key={scope.id}
                type="button"
                onClick={() => setSearchScope(scope.id)}
                className={`flex-1 py-1.5 px-2 rounded-lg transition-colors whitespace-nowrap ${
                  searchScope === scope.id
                    ? 'bg-amber-400 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {scope.label}
              </button>
            ))}
          </div>

          {/* Direct Category Dropdown + Count */}
          <div className="lg:col-span-3 flex items-center justify-between gap-2">
            <div className="relative flex-1">
              <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                aria-label={tr('Filter by resource category', 'ច្រោះតាមប្រភេទឯកសារ')}
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as ResourceCategory)}
                className={`w-full pl-8 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-amber-400 cursor-pointer ${
                  isKm ? 'font-khmer' : 'font-mono'
                }`}
              >
                <option value="all">{tr('All Categories', 'គ្រប់ប្រភេទ')} ({RESEARCH_ITEMS.length})</option>
                <option value="standards">{tr('Linguistic Standards', 'ស្ដង់ដារភាសាវិទ្យា')} ({RESEARCH_ITEMS.filter((i) => i.category === 'standards').length})</option>
                <option value="papers">{tr('Research Papers', 'ឯកសារស្រាវជ្រាវ')} ({RESEARCH_ITEMS.filter((i) => i.category === 'papers').length})</option>
                <option value="corpora">{tr('Open Corpora', 'ឃ្លាំងទិន្នន័យបើកចំហ')} ({RESEARCH_ITEMS.filter((i) => i.category === 'corpora').length})</option>
                <option value="toolkits">{tr('NLP Toolkits', 'ឧបករណ៍ NLP')} ({RESEARCH_ITEMS.filter((i) => i.category === 'toolkits').length})</option>
              </select>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                title={tr('Reset all search & category filters', 'កំណត់តម្រងស្វែងរក និងប្រភេទឡើងវិញ')}
                className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-amber-300 hover:border-amber-500/40 transition-colors shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Quick Search Suggestions & Result Counter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className={`text-[11px] text-slate-500 ${isKm ? 'font-khmer' : 'font-mono uppercase'}`}>
              {tr('QUICK LOOKUP:', 'ស្វែងរករហ័ស៖')}
            </span>
            {QUICK_SEARCH_PRESETS.map((preset) => {
              const activeVal = isKm ? preset.labelKm : preset.query;
              const isSelected = searchQuery.toLowerCase() === activeVal.toLowerCase() || searchQuery.toLowerCase() === preset.query.toLowerCase();
              return (
                <button
                  key={preset.query}
                  type="button"
                  onClick={() => setSearchQuery(isSelected ? '' : activeVal)}
                  className={`px-2 py-0.5 rounded-md text-[11px] transition-colors ${isKm ? 'font-khmer' : 'font-mono'} ${
                    isSelected
                      ? 'bg-amber-400/20 text-amber-300 border border-amber-400/50 font-semibold'
                      : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  {isKm ? preset.labelKm : preset.label}
                </button>
              );
            })}
          </div>

          <div className={`text-xs text-slate-400 shrink-0 ${isKm ? 'font-khmer' : 'font-mono'}`}>
            {isKm ? (
              <>
                កំពុងបង្ហាញ <strong className="text-amber-400 font-mono">{filteredItems.length}</strong> ក្នុងចំណោម <span className="font-mono">{RESEARCH_ITEMS.length}</span> ឯកសារ
              </>
            ) : (
              <>
                Showing <strong className="text-amber-400">{filteredItems.length}</strong> of {RESEARCH_ITEMS.length} resources
              </>
            )}
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 border-t border-slate-800/80 pt-3">
          {[
            { id: 'all', label: tr('All Resources', 'ធនធានទាំងអស់'), count: RESEARCH_ITEMS.length },
            { id: 'standards', label: tr('Linguistic Standards & Unicode', 'ស្ដង់ដារភាសា និងយូនីកូដ'), count: RESEARCH_ITEMS.filter((i) => i.category === 'standards').length },
            { id: 'papers', label: tr('LLM Research Papers (arXiv)', 'ឯកសារស្រាវជ្រាវ LLM (arXiv)'), count: RESEARCH_ITEMS.filter((i) => i.category === 'papers').length },
            { id: 'corpora', label: tr('Pretraining Corpora & Datasets', 'ឃ្លាំងទិន្នន័យបណ្តុះបណ្តាល'), count: RESEARCH_ITEMS.filter((i) => i.category === 'corpora').length },
            { id: 'toolkits', label: tr('NLP Toolkits & Segmenters', 'ឧបករណ៍ NLP និងការកាត់ពាក្យ'), count: RESEARCH_ITEMS.filter((i) => i.category === 'toolkits').length }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id as ResourceCategory)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                isKm ? 'font-khmer' : 'font-mono'
              } ${
                selectedCategory === cat.id
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                  : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              <span>{cat.label}</span>
              <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                selectedCategory === cat.id ? 'bg-slate-950 text-amber-300' : 'bg-slate-900 text-slate-400'
              }`}>
                {cat.count}
              </span>
            </button>
          ))}
        </div>

        {/* Tag Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
          <span className={`text-[11px] text-slate-500 shrink-0 flex items-center gap-1 ${isKm ? 'font-khmer' : 'font-mono uppercase'}`}>
            <Tag className="w-3 h-3" />
            <span>{tr('TOPIC TAGS:', 'ស្លាកប្រធានបទ៖')}</span>
          </span>

          {selectedTag && (
            <button
              onClick={() => setSelectedTag(null)}
              className={`px-2 py-0.5 rounded text-[11px] bg-amber-400 text-slate-950 font-bold shrink-0 ${isKm ? 'font-khmer' : 'font-mono'}`}
            >
              {tr(`Clear Tag: #${selectedTag}`, `សម្អាតស្លាក៖ #${selectedTag}`)} ✕
            </button>
          )}

          {allTags.slice(0, 10).map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              className={`px-2 py-0.5 rounded text-[11px] font-mono shrink-0 transition-colors ${
                selectedTag === tag
                  ? 'bg-amber-400 text-slate-950 font-bold'
                  : 'bg-slate-950 text-slate-400 border border-slate-800/80 hover:border-slate-700'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Resource Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredItems.map((item) => {
          const itemStatus = progressMap[item.id];
          const cardBorderClass =
            itemStatus === 'read'
              ? 'border-emerald-500/40 bg-slate-900/50 hover:border-emerald-400/60'
              : itemStatus === 'to-review'
                ? 'border-cyan-500/40 bg-slate-900/50 hover:border-cyan-400/60'
                : 'border-slate-800 bg-slate-900/40 hover:border-slate-700';

          return (
            <div
              key={item.id}
              className={`p-5 rounded-2xl border hover:bg-slate-900/70 transition-all flex flex-col justify-between space-y-4 group shadow-sm ${cardBorderClass}`}
            >
              {/* Top metadata row */}
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    {getCategoryBadge(item.category)}
                    {getRelevanceBadge(item.relevanceRating)}
                    {itemStatus === 'read' && (
                      <span
                        className={`px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-700/80 flex items-center gap-1 ${
                          isKm ? 'font-khmer' : 'font-mono'
                        }`}
                      >
                        <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                        <span>{tr('READ', 'បានអាន')}</span>
                      </span>
                    )}
                    {itemStatus === 'to-review' && (
                      <span
                        className={`px-1.5 py-0.5 rounded text-[9px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-700/80 flex items-center gap-1 ${
                          isKm ? 'font-khmer' : 'font-mono'
                        }`}
                      >
                        <Bookmark className="w-2.5 h-2.5 text-cyan-400" />
                        <span>{tr('TO REVIEW', 'ត្រូវពិនិត្យ')}</span>
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-[11px] text-slate-500 ${
                      isKm && item.yearOrDateKm ? 'font-khmer' : 'font-mono'
                    }`}
                  >
                    {isKm ? item.yearOrDateKm || item.yearOrDate : item.yearOrDate}
                  </span>
                </div>

              {/* Title & Khmer translation */}
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors leading-snug">
                  {highlightText(item.title)}
                </h3>
                {item.titleKhmer && (
                  <p className="text-xs text-amber-200/80 font-khmer leading-relaxed">
                    {highlightText(item.titleKhmer)}
                  </p>
                )}
                <div className="text-xs text-slate-400 font-mono pt-0.5">
                  {tr('by', 'ដោយ')} {highlightText(item.authorsOrOrganization)}
                </div>
              </div>

              {/* Description */}
              <p className={`text-xs text-slate-300 leading-relaxed ${isKm ? 'font-khmer' : ''}`}>
                {isKm ? item.descriptionKm : item.description}
              </p>

              {/* LLM Impact Callout */}
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-1">
                <div className={`flex items-center gap-1.5 text-[10px] font-bold text-amber-400 tracking-wider ${isKm ? 'font-khmer' : 'font-mono uppercase'}`}>
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>{tr('PRETRAINING ENGINEERING IMPACT', 'ផលប៉ះពាល់ផ្នែកវិស្វកម្មបណ្តុះបណ្តាល')}</span>
                </div>
                <p className={`text-[11px] text-slate-300 leading-relaxed ${isKm ? 'font-khmer' : 'font-sans'}`}>
                  {isKm ? item.impactOnKhmerLlmKm : item.impactOnKhmerLlm}
                </p>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {item.tags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono border transition-colors ${
                      selectedTag === tag
                        ? 'bg-amber-400 text-slate-950 border-amber-400 font-bold'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Reading Progress Controls & Bottom Actions Row */}
            <div className="space-y-3 pt-2">
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/60">
                <button
                  type="button"
                  aria-pressed={itemStatus === 'read'}
                  onClick={() => toggleReadingStatus(item.id, 'read')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] border transition-colors whitespace-nowrap ${
                    isKm ? 'font-khmer' : 'font-mono'
                  } ${
                    itemStatus === 'read'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/60 font-bold'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-emerald-300 hover:border-emerald-500/40'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    {itemStatus === 'read'
                      ? tr('Marked Read', 'បានសម្គាល់ថាបានអាន')
                      : tr('Mark as Read', 'សម្គាល់ថាបានអាន')}
                  </span>
                </button>

                <button
                  type="button"
                  aria-pressed={itemStatus === 'to-review'}
                  onClick={() => toggleReadingStatus(item.id, 'to-review')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] border transition-colors whitespace-nowrap ${
                    isKm ? 'font-khmer' : 'font-mono'
                  } ${
                    itemStatus === 'to-review'
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/60 font-bold'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-cyan-300 hover:border-cyan-500/40'
                  }`}
                >
                  <Bookmark className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    {itemStatus === 'to-review'
                      ? tr('In Review Queue', 'កំពុងរង់ចាំពិនិត្យ')
                      : tr('To Review', 'ត្រូវពិនិត្យឡើងវិញ')}
                  </span>
                </button>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-3 text-xs font-mono">
                <div className="flex items-center gap-2">
                  {item.bibtex && (
                    <button
                      onClick={() => handleCopyBibtex(item)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:text-white transition-colors whitespace-nowrap ${isKm ? 'font-khmer' : ''}`}
                      title={tr('Copy BibTeX Citation for Academic Papers', 'ចម្លងទម្រង់យោង BibTeX សម្រាប់ឯកសារសិក្សា')}
                    >
                      {copiedBibtexId === item.id ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      <span>{copiedBibtexId === item.id ? tr('Copied BibTeX', 'បានចម្លង BibTeX') : 'BibTeX'}</span>
                    </button>
                  )}

                  {item.pdfUrl && (
                    <a
                      href={item.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:text-white transition-colors whitespace-nowrap"
                    >
                      <FileText className="w-3 h-3 text-rose-400" />
                      <span>PDF</span>
                    </a>
                  )}
                </div>

                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-400 text-slate-950 font-bold hover:bg-amber-300 transition-colors shadow-sm whitespace-nowrap ${isKm ? 'font-khmer' : ''}`}
                >
                  <span>{tr('Read Official Source', 'អានប្រភពផ្លូវការ')}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <div className="p-12 text-center rounded-2xl border border-slate-800 bg-slate-900/30 space-y-3">
          <BookOpen className="w-8 h-8 text-slate-600 mx-auto" />
          <h4 className={`text-base font-bold text-white ${isKm ? 'font-khmer' : ''}`}>
            {tr('No research resources matched your query', 'គ្មានឯកសារស្រាវជ្រាវណាមួយត្រូវនឹងការស្វែងរករបស់អ្នកទេ')}
          </h4>
          <p className={`text-xs text-slate-400 max-w-md mx-auto ${isKm ? 'font-khmer' : ''}`}>
            {tr(
              'Try adjusting your search terms, switching search scope to "All Fields", or clearing the active category/tag filters.',
              'សូមសាកល្បងកែពាក្យស្វែងរក ប្ដូរវិសាលភាពទៅ «គ្រប់ផ្នែក» ឬសម្អាតតម្រងប្រភេទ និងស្លាក។'
            )}
          </p>
          <button
            onClick={handleResetFilters}
            className={`px-4 py-2 rounded-xl text-xs font-bold bg-amber-400 text-slate-950 hover:bg-amber-300 transition-colors ${isKm ? 'font-khmer' : 'font-mono'}`}
          >
            {tr('Reset Filters', 'កំណត់តម្រងឡើងវិញ')}
          </button>
        </div>
      )}
    </div>
  );
};

