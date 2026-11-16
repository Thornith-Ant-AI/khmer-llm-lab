export type SeoLanguage = 'en' | 'km';

export interface LocalizedSeoCopy {
  title: string;
  description: string;
  keywords: string;
  breadcrumb: string;
  siteName: string;
  imageAlt: string;
}

export interface SectionSeoEntry {
  id: string;
  en: {
    title: string;
    description: string;
    keywords: string;
    breadcrumb: string;
  };
  km: {
    title: string;
    description: string;
    keywords: string;
    breadcrumb: string;
  };
}

export const HOME_SEO_METADATA: Record<SeoLanguage, LocalizedSeoCopy> = {
  en: {
    title: 'Khmer LLM Architect & Pretraining Lab',
    description:
      'Engineering roadmap, 4-tier Khmer corpus matrix, Coeng & scriptio continua tokenizer lab, Chinchilla GPU scaling calculator, and open-source Khmer LLM directory.',
    keywords:
      'Khmer LLM, Khmer Large Language Model, Khmer NLP, Khmer Tokenizer, SentencePiece Khmer, Khmer Corpus Cleaning, Open Source Khmer AI, ភាសាខ្មែរ LLM, ម៉ូដែលភាសាខ្មែរ',
    breadcrumb: 'Home Workbench',
    siteName: 'Khmer LLM Architect & Pretraining Lab',
    imageAlt:
      'Khmer LLM Architect & Pretraining Lab home screen featuring 4.2x token compression, 30B-60B pretrain target, 1.5B-3B GQA architecture, and transformer attention diagram',
  },
  km: {
    title: 'មន្ទីរពិសោធន៍វិស្វកម្ម Khmer LLM – ប្លង់មេម៉ូដែលភាសាខ្មែរ',
    description:
      'ផែនទីបង្ហាញផ្លូវវិស្វកម្ម ម៉ាទ្រីសទិន្នន័យខ្មែរ ៤ កម្រិត ថូខិនណាយស័រ Coeng គណនាថាមពល GPU និងបណ្ណាល័យម៉ូដែល Khmer LLM ជាភាសាខ្មែរ និងអង់គ្លេស។',
    keywords:
      'Khmer LLM, ភាសាខ្មែរ LLM, ម៉ូដែលភាសាខ្មែរ, បញ្ញាសិប្បនិម្មិតខ្មែរ, ថូខិនណាយស័រខ្មែរ, ឃ្លាំងទិន្នន័យភាសាខ្មែរ',
    breadcrumb: 'ទំព័រដើម',
    siteName: 'មន្ទីរពិសោធន៍វិស្វកម្ម Khmer LLM',
    imageAlt:
      'ទំព័រដើមមន្ទីរពិសោធន៍វិស្វកម្ម Khmer LLM បង្ហាញសូចនាករ 4.2x Token Compression និងស្ថាបត្យកម្ម Transformer ភាសាខ្មែរ',
  },
};

export const KHMER_LLM_SEO_SECTIONS: Record<string, SectionSeoEntry> = {
  'data-matrix': {
    id: 'data-matrix',
    en: {
      title: 'Khmer LLM Data Matrix – 4-Tier Pretraining Curation',
      description:
        'Explore the 4-tier Khmer LLM training corpus matrix: Buddhist Institute texts, legal decrees, Wikipedia, and cleaned web crawls for Cambodian AI.',
      keywords:
        'Khmer LLM dataset, Khmer pretraining corpus, Cambodian AI data curation, Khmer NLP dataset tiers, SeaLLMs Khmer data',
      breadcrumb: 'Data Priority Matrix',
    },
    km: {
      title: 'ម៉ាទ្រីសទិន្នន័យ Khmer LLM – អាទិភាពទិន្នន័យ ៤ កម្រិត',
      description:
        'ស្វែងយល់ពីម៉ាទ្រីសទិន្នន័យបង្វឹក Khmer LLM ៤ កម្រិត៖ អក្សរសិល្ប៍ពុទ្ធសាសនបណ្ឌិត្យ ច្បាប់ជាតិ និងទិន្នន័យវេបខ្មែរស្អាត។',
      keywords:
        'ទិន្នន័យ Khmer LLM, ឃ្លាំងទិន្នន័យភាសាខ្មែរ, បញ្ញាសិប្បនិម្មិតខ្មែរ, ការរៀបចំទិន្នន័យបង្វឹក LLM',
      breadcrumb: 'ម៉ាទ្រីសទិន្នន័យ',
    },
  },
  'tokenizer-lab': {
    id: 'tokenizer-lab',
    en: {
      title: 'Khmer LLM Tokenizer Lab – Syllable & Coeng Compression',
      description:
        'Benchmark Khmer SentencePiece BPE vs. LLaMA-3 byte fallback, inspect Coeng subscript ligatures, and analyze syllable mapping efficiency.',
      keywords:
        'Khmer LLM tokenizer, Khmer SentencePiece BPE, Khmer syllable segmentation, Coeng ligature tokenization, Khmer token fertility',
      breadcrumb: 'Tokenizer & Syllables',
    },
    km: {
      title: 'ថូខិនណាយស័រ Khmer LLM – ការវិភាគព្យាង្គ និងជើងព្យញ្ជនៈ',
      description:
        'វាស់ស្ទង់ប្រសិទ្ធភាព SentencePiece BPE ខ្មែរ ធៀបនឹង LLaMA-3 ពិនិត្យជើងព្យញ្ជនៈ Coeng និងការបំបែកព្យាង្គភាសាខ្មែរ។',
      keywords:
        'ថូខិនណាយស័រខ្មែរ, Khmer LLM tokenizer, ការបំបែកព្យាង្គខ្មែរ, SentencePiece ភាសាខ្មែរ',
      breadcrumb: 'ថូខិនណាយស័រ និងព្យាង្គ',
    },
  },
  'cleaner-sim': {
    id: 'cleaner-sim',
    en: {
      title: 'Khmer LLM Corpus Cleaning & Gold Standard Validator',
      description:
        'Filter Limon legacy ASCII fonts, casino spam, and URL boilerplate from Khmer web crawls, then benchmark diversity against Gold Standard ratios.',
      keywords:
        'Khmer corpus cleaning, Limon to Unicode filter, Khmer LLM data hygiene, Cambodian web crawl deduplication, Khmer text quality',
      breadcrumb: 'Corpus Cleansing Pipeline',
    },
    km: {
      title: 'កម្មវិធីសម្អាតទិន្នន័យ Khmer LLM – ធៀបស្តង់ដារមាស',
      description:
        'ច្រោះពុម្ពអក្សរ Limon ASCII សាររំខាន និងតំណ URL ពីទិន្នន័យវេបខ្មែរ រួចវាស់ស្ទង់ភាពចម្រុះធៀបនឹងស្តង់ដារមាស Khmer LLM។',
      keywords:
        'សម្អាតទិន្នន័យ Khmer LLM, ច្រោះពុម្ពអក្សរ Limon, គុណភាពអត្ថបទខ្មែរ, ស្តង់ដារមាសឃ្លាំងទិន្នន័យ',
      breadcrumb: 'ខ្សែសង្វាក់សម្អាតទិន្នន័យ',
    },
  },
  'scaling-calc': {
    id: 'scaling-calc',
    en: {
      title: 'Khmer LLM Scaling Calculator – GPU Hours & Cost Planner',
      description:
        'Calculate Chinchilla compute budgets, FP16/BF16/INT8 VRAM, GPU hours, and H100 vs TPU v4 utilization benchmarks for Khmer LLM training.',
      keywords:
        'Khmer LLM compute scaling, Chinchilla scaling calculator, H100 TPU v4 benchmark, FP16 BF16 INT8 training cost, Khmer model GPU hours',
      breadcrumb: 'Compute & Scaling Laws',
    },
    km: {
      title: 'គណនាមាត្រដ្ឋាន Khmer LLM – ថាមពល GPU និងថ្លៃដើមបង្វឹក',
      description:
        'គណនាថវិកា Chinchilla អង្គចងចាំ FP16/BF16/INT8 ម៉ោង GPU និងប្រសិទ្ធភាព H100 ធៀប TPU v4 សម្រាប់បង្វឹក Khmer LLM។',
      keywords:
        'គណនាម៉ោង GPU Khmer LLM, ច្បាប់មាត្រដ្ឋាន Chinchilla, ថ្លៃដើមបង្វឹកម៉ូដែលខ្មែរ, វិភាគសមត្ថភាព H100 TPU v4',
      breadcrumb: 'ការគណនាថាមពល GPU',
    },
  },
  roadmap: {
    id: 'roadmap',
    en: {
      title: 'Khmer LLM Engineering Roadmap – End-to-End Pretraining',
      description:
        'Step-by-step engineering blueprint and Gantt timeline for Khmer LLM data collection, tokenization, pretraining, SFT, and evaluation.',
      keywords:
        'Khmer LLM roadmap, train Khmer LLM from scratch, Khmer pretraining pipeline, Cambodian foundation model engineering',
      breadcrumb: 'Engineering Roadmap',
    },
    km: {
      title: 'ផែនទីបង្ហាញផ្លូវវិស្វកម្ម Khmer LLM – ការបង្វឹកពេញលេញ',
      description:
        'ប្លង់មេវិស្វកម្ម និងតារាងពេលវេលា Gantt សម្រាប់ការប្រមូលទិន្នន័យ បង្កើតថូខិន និងបង្វឹកម៉ូដែល Khmer LLM ពីដំបូង។',
      keywords:
        'ផែនទីបង្ហាញផ្លូវ Khmer LLM, វិស្វកម្មម៉ូដែលភាសាខ្មែរ, ដំណាក់កាលបង្វឹក AI ខ្មែរ',
      breadcrumb: 'ផែនទីវិស្វកម្ម',
    },
  },
  registers: {
    id: 'registers',
    en: {
      title: 'Khmer Linguistic Registers – Honorifics for Khmer LLMs',
      description:
        'Master Royal Reachasap, Sanghasap monastic speech, formal Khpous, and conversational Thommada registers for culturally aligned Khmer LLMs.',
      keywords:
        'Khmer linguistic registers, Reachasap Sanghasap Khmer AI, Khmer honorifics NLP, culturally aligned Khmer LLM',
      breadcrumb: 'Linguistic Registers',
    },
    km: {
      title: 'កម្រិតភាសាខ្មែរ – រាជសព្ទ សង្ឃសព្ទ សម្រាប់ Khmer LLM',
      description:
        'ស្វែងយល់ពីកម្រិតភាសាខ្មែរ (រាជសព្ទ សង្ឃសព្ទ ភាសាខ្ពស់ និងភាសាសាមញ្ញ) ដើម្បីឱ្យម៉ូដែល Khmer LLM ឆ្លើយតបបានសមរម្យតាមវប្បធម៌។',
      keywords:
        'កម្រិតភាសាខ្មែរ LLM, រាជសព្ទ សង្ឃសព្ទ, សុជីវធម៌ភាសាខ្មែរ AI, Khmer linguistic registers',
      breadcrumb: 'កម្រិតភាសាខ្មែរ',
    },
  },
  synthetic: {
    id: 'synthetic',
    en: {
      title: 'Khmer LLM Synthetic SFT Studio & Cultural Bias Auditor',
      description:
        'Generate Khmer SFT instruction pairs, test chunking pipelines, and audit translationese or dialect bias for Cambodian LLM post-training.',
      keywords:
        'Khmer synthetic SFT data, Khmer LLM bias audit, Cambodian instruction tuning, Khmer RAG chunking',
      breadcrumb: 'Synthetic SFT Studio',
    },
    km: {
      title: 'ស្ទូឌីយោទិន្នន័យសំយោគ SFT និងសវនកម្មលំអៀង Khmer LLM',
      description:
        'បង្កើតទិន្នន័យសំយោគ SFT ភាសាខ្មែរ សាកល្បងការកាត់កង់ RAG និងវិភាគភាពលំអៀងភាសាបកប្រែសម្រាប់ការបង្វឹក Khmer LLM។',
      keywords:
        'ទិន្នន័យសំយោគ Khmer LLM, វិភាគលំអៀងភាសាខ្មែរ, SFT ភាសាខ្មែរ, ការកាត់កង់អត្ថបទខ្មែរ',
      breadcrumb: 'ស្ទូឌីយោ SFT',
    },
  },
  'research-library': {
    id: 'research-library',
    en: {
      title: 'Khmer NLP & LLM Research Paper Library & Reading Tracker',
      description:
        'Curated Khmer computational linguistics and multilingual LLM papers with local reading progress tracking for researchers.',
      keywords:
        'Khmer NLP research papers, Khmer LLM bibliography, Southeast Asian LLM literature, Cambodian AI research',
      breadcrumb: 'Research Library',
    },
    km: {
      title: 'បណ្ណាល័យឯកសារស្រាវជ្រាវ Khmer NLP និង Khmer LLM',
      description:
        'ប្រមូលផ្តុំឯកសារស្រាវជ្រាវភាសាវិទ្យាកុំព្យូទ័រខ្មែរ និង Khmer LLM ព្រមទាំងកម្មវិធីតាមដានការអានសម្រាប់អ្នកស្រាវជ្រាវ។',
      keywords:
        'ឯកសារស្រាវជ្រាវ Khmer LLM, បណ្ណាល័យ Khmer NLP, ការសិក្សាបញ្ញាសិប្បនិម្មិតខ្មែរ',
      breadcrumb: 'បណ្ណាល័យស្រាវជ្រាវ',
    },
  },
  'models-directory': {
    id: 'models-directory',
    en: {
      title: 'Open-Source Khmer LLM Models & GitHub Repositories',
      description:
        'Browse open-source Khmer and Southeast Asian LLMs, ASR/OCR toolkits, and NLP libraries with direct GitHub and Hugging Face links.',
      keywords:
        'open source Khmer LLM, Khmer LLM GitHub, SeaLLMs Khmer, SEA-LION Khmer, Sailor LLM, KhmerOCR, khmer-nltk',
      breadcrumb: 'Khmer LLMs & Git Repos',
    },
    km: {
      title: 'បញ្ជីម៉ូដែល Khmer LLM បើកចំហ និងតំណ GitHub Repository',
      description:
        'ស្វែងរកម៉ូដែល Khmer LLM បើកចំហ ឧបករណ៍ ASR/OCR និងបណ្ណាល័យ Khmer NLP ជាមួយតំណ GitHub និង Hugging Face ផ្ទាល់។',
      keywords:
        'ម៉ូដែល Khmer LLM បើកចំហ, GitHub Khmer AI, SeaLLMs ភាសាខ្មែរ, SEA-LION, KhmerOCR, khmer-nltk',
      breadcrumb: 'ម៉ូដែល LLM និង Git',
    },
  },
  'training-dynamics': {
    id: 'training-dynamics',
    en: {
      title: 'Khmer LLM Training Dynamics – Loss & Perplexity Curves',
      description:
        'Visualize cross-entropy training loss, Khmer perplexity reduction, and gradient stability across 1.5B, 3B, and 7B model checkpoints.',
      keywords:
        'Khmer LLM training loss, Khmer perplexity benchmark, LLM gradient norm stability, checkpoint evaluation Khmer',
      breadcrumb: 'Training Dynamics',
    },
    km: {
      title: 'ថាមវន្តនៃការបង្វឹក Khmer LLM – ខ្សែកោង Loss & Perplexity',
      description:
        'មើលខ្សែកោង Loss ការថយចុះ Perplexity និងស្ថិរភាព Gradient នៅតាមដំណាក់កាល Checkpoint នៃម៉ូដែល Khmer LLM 1.5B ដល់ 7B។',
      keywords:
        'ថាមវន្តការបង្វឹក Khmer LLM, ការវាស់ស្ទង់ Perplexity ខ្មែរ, Checkpoint ម៉ូដែលភាសាខ្មែរ',
      breadcrumb: 'ថាមវន្តនៃការបង្វឹក',
    },
  },
  'nlp-glossary': {
    id: 'nlp-glossary',
    en: {
      title: 'Khmer NLP Glossary – Coeng, ZWSP & Scriptio Continua',
      description:
        'Technical glossary defining Khmer script processing terms for LLM researchers: Coeng subscripts, ZWSP, ZWJ, Limon ASCII, and token fertility.',
      keywords:
        'Khmer NLP glossary, Coeng U+17D2, scriptio continua Khmer, ZWSP Khmer tokenization, Khmer Unicode orthography',
      breadcrumb: 'Khmer NLP Glossary',
    },
    km: {
      title: 'សទ្ទានុក្រម Khmer NLP – ជើងព្យញ្ជនៈ ZWSP និងសំណេរជាប់គ្នា',
      description:
        'សទ្ទានុក្រមបច្ចេកទេសសម្រាប់អ្នកស្រាវជ្រាវ Khmer LLM៖ ជើងព្យញ្ជនៈ Coeng, ចន្លោះទទឹងសូន្យ ZWSP, ពុម្ពអក្សរ Limon និងអត្រាថូខិន។',
      keywords:
        'សទ្ទានុក្រម Khmer NLP, ជើងព្យញ្ជនៈ U+17D2, សំណេរជាប់គ្នាខ្មែរ, ភាសាវិទ្យាកុំព្យូទ័រខ្មែរ',
      breadcrumb: 'សទ្ទានុក្រម Khmer NLP',
    },
  },
  contact: {
    id: 'contact',
    en: {
      title: 'Contact Khmer LLM Lab – Research & Corpus Collaboration',
      description:
        'Connect with the Khmer LLM engineering group to contribute Khmer corpora, report orthography bugs, or collaborate on open Cambodian AI.',
      keywords:
        'Khmer LLM collaboration, contribute Khmer corpus, Cambodian open AI research contact',
      breadcrumb: 'Contact',
    },
    km: {
      title: 'ទំនាក់ទំនង Khmer LLM Lab – កិច្ចសហការស្រាវជ្រាវខ្មែរ',
      description:
        'ទាក់ទងក្រុមវិស្វករ Khmer LLM ដើម្បីចូលរួមចំណែកឃ្លាំងទិន្នន័យខ្មែរ ឬសហការស្រាវជ្រាវបញ្ញាសិប្បនិម្មិតបើកចំហនៅកម្ពុជា។',
      keywords:
        'ទំនាក់ទំនង Khmer LLM, កិច្ចសហការស្រាវជ្រាវ AI ខ្មែរ, ចូលរួមទិន្នន័យភាសាខ្មែរ',
      breadcrumb: 'ទំនាក់ទំនង',
    },
  },
};

export function resolveSeoCopy(
  language: SeoLanguage,
  sectionId?: string | null
): LocalizedSeoCopy & { resolvedSectionId: string | null } {
  const home = HOME_SEO_METADATA[language];
  if (sectionId && KHMER_LLM_SEO_SECTIONS[sectionId]) {
    const entry = KHMER_LLM_SEO_SECTIONS[sectionId][language];
    return {
      ...entry,
      siteName: home.siteName,
      imageAlt: home.imageAlt,
      resolvedSectionId: sectionId,
    };
  }
  return {
    ...home,
    resolvedSectionId: null,
  };
}
