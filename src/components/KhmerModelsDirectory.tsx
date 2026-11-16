import React, { useMemo, useState } from 'react';
import {
  GitBranch,
  ExternalLink,
  Search,
  X,
  Copy,
  Check,
  Cpu,
  Code2,
  Mic,
  FolderGit2,
  LayoutGrid,
  Table as TableIcon,
  RotateCcw
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export type ModelCategory =
  | 'all'
  | 'foundation_llm'
  | 'nlp_toolkit'
  | 'speech_ocr_mt'
  | 'rag_index';

export type ResourceAvailabilityFilter = 'all' | 'has_git' | 'has_hf';
export type DirectoryViewMode = 'cards' | 'table';

export interface KhmerModelEntry {
  id: string;
  name: string;
  nameKm: string;
  organization: string;
  category: Exclude<ModelCategory, 'all'>;
  categoryLabel: string;
  categoryLabelKm: string;
  parameterScale: string;
  architecture: string;
  khmerSupport: 'Native Khmer' | 'Multilingual SEA' | 'Khmer Toolkit / Pipeline';
  khmerSupportKm: string;
  license: string;
  description: string;
  descriptionKm: string;
  engineeringNotes: string;
  engineeringNotesKm: string;
  gitRepoUrl?: string;
  gitRepoSlug?: string;
  huggingFaceUrl?: string;
  huggingFaceId?: string;
}

export const KHMER_OPEN_SOURCE_MODELS: KhmerModelEntry[] = [
  {
    id: 'seallms-v3',
    name: 'SeaLLMs v3 (1.5B & 7B Base / Chat)',
    nameKm: 'SeaLLMs v3 (ម៉ូដែល 1.5B និង 7B Base / Chat)',
    organization: 'Alibaba DAMO Academy / SeaLLMs',
    category: 'foundation_llm',
    categoryLabel: 'Foundation & SEA LLMs',
    categoryLabelKm: 'ម៉ូដែលភាសាធំ (LLM)',
    parameterScale: '1.5B / 7B',
    architecture: 'Qwen2 Backbone · Extended SEA Vocab',
    khmerSupport: 'Multilingual SEA',
    khmerSupportKm: 'ពហុភាសាអាស៊ីអាគ្នេយ៍ (រួមមានខ្មែរ)',
    license: 'Qwen / SeaLLMs Open Weights',
    description:
      'Leading open-weight Southeast Asian LLM family explicitly trained for Khmer, Thai, Vietnamese, Lao, Burmese, and Indonesian with strong instruction-following and math reasoning.',
    descriptionKm:
      'គ្រួសារគំរូភាសាធំបើកទូលាយឈានមុខសម្រាប់អាស៊ីអាគ្នេយ៍ ដែលបង្វឹកជាពិសេសលើភាសាខ្មែរ ថៃ វៀតណាម ឡាវ ភូមា និងឥណ្ឌូនេស៊ី ជាមួយសមត្ថភាពឆ្លើយសំណួរ និងគណិតវិទ្យាខ្ពស់។',
    engineeringNotes:
      'Strong zero-shot Khmer fluency and low hallucination rate; includes official vLLM serving and evaluation scripts in Git.',
    engineeringNotesKm:
      'មានភាពស្ទាត់ជំនាញភាសាខ្មែរខ្ពស់ និងកាត់បន្ថយការឆ្លើយបំផ្លើស ព្រមទាំងមានស្គ្រីប vLLM និងតេស្តក្នុង Git ផ្លូវការ។',
    gitRepoUrl: 'https://github.com/SeaLLMs/SeaLLMs',
    gitRepoSlug: 'SeaLLMs/SeaLLMs',
    huggingFaceUrl: 'https://huggingface.co/SeaLLMs',
    huggingFaceId: 'SeaLLMs/SeaLLMs-v3-7B-Chat'
  },
  {
    id: 'sea-lion-v3',
    name: 'SEA-LION v3 (Llama / Gemma / Qwen Variants)',
    nameKm: 'SEA-LION v3 (ម៉ូដែលផ្អែកលើ Llama / Gemma / Qwen)',
    organization: 'AI Singapore (AISG)',
    category: 'foundation_llm',
    categoryLabel: 'Foundation & SEA LLMs',
    categoryLabelKm: 'ម៉ូដែលភាសាធំ (LLM)',
    parameterScale: '3B / 8B / 9B / 32B',
    architecture: 'Llama-3.1 / Gemma-2 / Qwen2.5 Adapted',
    khmerSupport: 'Multilingual SEA',
    khmerSupportKm: 'ពហុភាសាអាស៊ីអាគ្នេយ៍ (រួមមានខ្មែរ)',
    license: 'Apache 2.0 / Llama / Gemma',
    description:
      'Sovereign ASEAN open foundation model suite spearheaded by AI Singapore, specifically addressing low-resource Southeast Asian scripts including Khmer across Base and Instruct releases.',
    descriptionKm:
      'ម៉ូដែលមូលដ្ឋានអធិបតេយ្យសម្រាប់អាស៊ានដឹកនាំដោយ AI Singapore ដែលដោះស្រាយបញ្ហាភាសាធនធានទាបរួមមានភាសាខ្មែរទាំងកម្រិត Base និង Instruct។',
    engineeringNotes:
      'Full training recipes, MinHash corpus curation guidance, and SEA-HELM benchmark harnesses hosted on GitHub.',
    engineeringNotesKm:
      'មានរូបមន្តបង្វឹកពេញលេញ វិធីសាស្ត្រសម្អាតទិន្នន័យ MinHash និងឧបករណ៍វាយតម្លៃ SEA-HELM នៅលើ GitHub។',
    gitRepoUrl: 'https://github.com/aisingapore/sealion',
    gitRepoSlug: 'aisingapore/sealion',
    huggingFaceUrl: 'https://huggingface.co/aisingapore',
    huggingFaceId: 'aisingapore/Llama-SEA-LION-v3-8B-IT'
  },
  {
    id: 'sailor-2',
    name: 'Sailor & Sailor2 (1B / 8B / 20B)',
    nameKm: 'Sailor និង Sailor2 (1B / 8B / 20B)',
    organization: 'Sea AI Lab (SAIL)',
    category: 'foundation_llm',
    categoryLabel: 'Foundation & SEA LLMs',
    categoryLabelKm: 'ម៉ូដែលភាសាធំ (LLM)',
    parameterScale: '0.5B – 20B',
    architecture: 'Qwen1.5 / Qwen2.5 Continual Pretraining',
    khmerSupport: 'Multilingual SEA',
    khmerSupportKm: 'ពហុភាសាអាស៊ីអាគ្នេយ៍ (១៥ ភាសា)',
    license: 'Apache 2.0',
    description:
      'Open-weight continual-pretrained models engineered for Southeast Asia. Sailor2 expands coverage to 15 regional languages with BPE token efficiency optimizations.',
    descriptionKm:
      'ម៉ូដែលកូដបើកចំហបង្វឹកបន្តសម្រាប់អាស៊ីអាគ្នេយ៍។ Sailor2 ពង្រីកការគាំទ្រដល់ ១៥ ភាសាក្នុងតំបន់ជាមួយការបង្កើនប្រសិទ្ធភាពថូខិន BPE។',
    engineeringNotes:
      'Includes OpenCompass evaluation configs, data mixing pipelines, and Apache 2.0 commercial-friendly weights.',
    engineeringNotesKm:
      'រួមបញ្ចូលការកំណត់ OpenCompass ខ្សែសង្វាក់លាយទិន្នន័យ និងអាជ្ញាប័ណ្ណ Apache 2.0 សម្រាប់អាជីវកម្ម។',
    gitRepoUrl: 'https://github.com/sail-sg/sailor-llm',
    gitRepoSlug: 'sail-sg/sailor-llm',
    huggingFaceUrl: 'https://huggingface.co/sail',
    huggingFaceId: 'sail/Sailor2-8B'
  },
  {
    id: 'bayon-khmer',
    name: 'Bayon (Khmer-Focused Research LM)',
    nameKm: 'Bayon (ម៉ូដែលភាសាស្រាវជ្រាវសម្រាប់ភាសាខ្មែរ)',
    organization: 'AttentionLab (Seng Sovannpanha)',
    category: 'foundation_llm',
    categoryLabel: 'Foundation & SEA LLMs',
    categoryLabelKm: 'ម៉ូដែលភាសាធំ (LLM)',
    parameterScale: 'Compact Research LM',
    architecture: 'Dedicated Khmer Tokenizer + Transformer',
    khmerSupport: 'Native Khmer',
    khmerSupportKm: 'ភាសាខ្មែរផ្ទាល់',
    license: 'Open Research Weights',
    description:
      'Specialized language model and custom tokenizer research effort built natively for Khmer natural language processing and low-fertility text representation.',
    descriptionKm:
      'គម្រោងស្រាវជ្រាវម៉ូដែលភាសា និងថូខិនណាយស័រផ្ទាល់ខ្លួនដែលរចនាឡើងជាពិសេសសម្រាប់ភាសាខ្មែរ។',
    engineeringNotes:
      'Useful reference for compact Khmer-first vocabulary sizing and native script modeling on Hugging Face.',
    engineeringNotesKm:
      'ជាឯកសារយោងដ៏ល្អសម្រាប់ការកំណត់ទំហំវាក្យសព្ទខ្មែរតូចល្មម និងការបង្កើតម៉ូដែលអក្សរខ្មែរដើម។',
    huggingFaceUrl: 'https://huggingface.co/attentionlab/bayon',
    huggingFaceId: 'attentionlab/bayon'
  },
  {
    id: 'bloomz-multilingual',
    name: 'BLOOM & BLOOMZ (46-Language Open Science)',
    nameKm: 'BLOOM និង BLOOMZ (ម៉ូដែលវិទ្យាសាស្ត្របើកចំហ ៤៦ ភាសា)',
    organization: 'BigScience Workshop',
    category: 'foundation_llm',
    categoryLabel: 'Foundation & SEA LLMs',
    categoryLabelKm: 'ម៉ូដែលភាសាធំ (LLM)',
    parameterScale: '560M – 176B',
    architecture: 'ALiBi Decoder Transformer · Byte-Level BPE',
    khmerSupport: 'Multilingual SEA',
    khmerSupportKm: 'ពហុភាសា (រួមបញ្ចូលកូដខ្មែរ)',
    license: 'BigScience RAIL-M v1.0',
    description:
      'Pioneering fully open-science multilingual LLM family supporting 46 natural languages including Khmer, complete with transparent training logs and xP3 instruction tuning.',
    descriptionKm:
      'ម៉ូដែលវិទ្យាសាស្ត្របើកចំហដំបូងគេដែលគាំទ្រ ៤៦ ភាសារួមទាំងភាសាខ្មែរ ព្រមទាំងមានកំណត់ត្រាបង្វឹក និងទិន្នន័យ xP3 ពេញលេញ។',
    engineeringNotes:
      'Great baseline for studying Khmer tokenizer byte-fallback behavior and multilingual cross-transfer benchmarks.',
    engineeringNotesKm:
      'ម៉ូដែលគោលដ៏ល្អសម្រាប់សិក្សាអំពី Byte-fallback និងការផ្ទេរចំណេះដឹងឆ្លងភាសាខ្មែរ។',
    gitRepoUrl: 'https://github.com/bigscience-workshop/bigscience',
    gitRepoSlug: 'bigscience-workshop/bigscience',
    huggingFaceUrl: 'https://huggingface.co/bigscience/bloomz',
    huggingFaceId: 'bigscience/bloomz'
  },
  {
    id: 'khmer-ulmfit',
    name: 'Khmer Language Model (ULMFiT)',
    nameKm: 'ម៉ូដែលភាសាខ្មែរ ULMFiT',
    organization: 'Community NLP (phylypo)',
    category: 'foundation_llm',
    categoryLabel: 'Foundation & SEA LLMs',
    categoryLabelKm: 'ម៉ូដែលភាសាធំ (LLM)',
    parameterScale: 'AWD-LSTM',
    architecture: 'ULMFiT Transfer Learning + SentencePiece',
    khmerSupport: 'Native Khmer',
    khmerSupportKm: 'ភាសាខ្មែរផ្ទាល់',
    license: 'Open Source',
    description:
      'End-to-end open-source GitHub notebooks demonstrating pretraining and fine-tuning a foundational Khmer language model on Khmer Wikipedia and news corpora.',
    descriptionKm:
      'កូដបើកចំហពេញលេញលើ GitHub ដែលបង្ហាញពីការបង្វឹកម៉ូដែលភាសាខ្មែរដោយប្រើ ULMFiT លើវិគីភីឌាខ្មែរ និងព័ត៌មានក្នុងស្រុក។',
    engineeringNotes:
      'Practical educational blueprint showing corpus ingestion, subword tokenization, and downstream text classification.',
    engineeringNotesKm:
      'ជាគំរូអនុវត្តជាក់ស្តែងសម្រាប់ការទាញទិន្នន័យ ការកាត់ថូខិន និងការបែងចែកប្រភេទអត្ថបទខ្មែរ។',
    gitRepoUrl: 'https://github.com/phylypo/khmer-language-model-ulmfit',
    gitRepoSlug: 'phylypo/khmer-language-model-ulmfit'
  },
  {
    id: 'idri-khnlp',
    name: 'IDRI-LAB Khmer NLP Tools (khnlp)',
    nameKm: 'ឧបករណ៍ Khmer NLP ដោយ IDRI-LAB (CADT)',
    organization: 'Cambodia Academy of Digital Technology (CADT)',
    category: 'nlp_toolkit',
    categoryLabel: 'Khmer Tokenizers & NLP',
    categoryLabelKm: 'ថូខិនណាយស័រ និងឧបករណ៍ NLP',
    parameterScale: 'Python Library',
    architecture: 'Word Segmentation · Normalization · NLP Utils',
    khmerSupport: 'Khmer Toolkit / Pipeline',
    khmerSupportKm: 'ឧបករណ៍ភាសាខ្មែរ',
    license: 'Open Source',
    description:
      'Institutional open-source Khmer NLP toolkit developed by researchers at CADT (IDRI-LAB) for production Khmer text preprocessing and linguistic normalization.',
    descriptionKm:
      'បណ្ណាល័យ NLP ភាសាខ្មែរបើកចំហបង្កើតដោយក្រុមស្រាវជ្រាវនៃបណ្ឌិត្យសភាបច្ចេកវិទ្យាឌីជីថលកម្ពុជា (CADT) សម្រាប់ដំណើរការអត្ថបទខ្មែរ។',
    engineeringNotes:
      'Ideal preprocessing dependency before SentencePiece training to enforce clean syllable boundaries.',
    engineeringNotesKm:
      'ស័ក្តិសមបំផុតសម្រាប់ដំណាក់កាលសម្អាតទិន្នន័យមុនពេលបង្វឹក SentencePiece ដើម្បីរក្សាព្រំដែនព្យាង្គត្រឹមត្រូវ។',
    gitRepoUrl: 'https://github.com/IDRI-LAB/Khmer-NLP-Tools',
    gitRepoSlug: 'IDRI-LAB/Khmer-NLP-Tools'
  },
  {
    id: 'khmer-nltk',
    name: 'khmer-nltk',
    nameKm: 'បណ្ណាល័យ khmer-nltk',
    organization: 'Phonetworks & Open-Source Contributors',
    category: 'nlp_toolkit',
    categoryLabel: 'Khmer Tokenizers & NLP',
    categoryLabelKm: 'ថូខិនណាយស័រ និងឧបករណ៍ NLP',
    parameterScale: 'Python · CRF / MaxMatch',
    architecture: 'Syllable & Word Segmenter + POS / NER',
    khmerSupport: 'Khmer Toolkit / Pipeline',
    khmerSupportKm: 'ឧបករណ៍ភាសាខ្មែរ',
    license: 'MIT License',
    description:
      'Widely adopted Python NLP toolkit providing Khmer word tokenization, sentence segmentation, POS tagging, and Unicode normalization.',
    descriptionKm:
      'បណ្ណាល័យ Python ពេញនិយមសម្រាប់ការកាត់ពាក្យខ្មែរ កាត់ប្រយោគ កំណត់ថ្នាក់ពាក្យ (POS) និងការធ្វើស្តង់ដារយូនីកូដ។',
    engineeringNotes:
      'Drop-in pre-tokenizer for measuring true word count when computing LLM Token Fertility Rate (TFR).',
    engineeringNotesKm:
      'ប្រើជាឧបករណ៍កាត់ពាក្យមុនដើម្បីគណនាចំនួនពាក្យពិតប្រាកដសម្រាប់វាស់អត្រា Token Fertility (TFR) នៃ LLM។',
    gitRepoUrl: 'https://github.com/phonetworks/khmer-nltk',
    gitRepoSlug: 'phonetworks/khmer-nltk'
  },
  {
    id: 'khmer-nlp-org',
    name: 'Khmer-NLP Core Toolkit',
    nameKm: 'ប្រព័ន្ធឧបករណ៍ Khmer-NLP',
    organization: 'Khmer-NLP Community',
    category: 'nlp_toolkit',
    categoryLabel: 'Khmer Tokenizers & NLP',
    categoryLabelKm: 'ថូខិនណាយស័រ និងឧបករណ៍ NLP',
    parameterScale: 'Python Package',
    architecture: 'Tokenization · POS · NER · Modeling',
    khmerSupport: 'Khmer Toolkit / Pipeline',
    khmerSupportKm: 'ឧបករណ៍ភាសាខ្មែរ',
    license: 'Open Source',
    description:
      'Open-source library targeting foundational Khmer NLP workflows including tokenization, part-of-speech tagging, named entity recognition, and language modeling.',
    descriptionKm:
      'គម្រោងកូដបើកចំហសម្រាប់កិច្ចការ NLP មូលដ្ឋានដូចជាការបំបែកពាក្យ ថ្នាក់ពាក្យ ការស្គាល់ឈ្មោះទីកន្លែង/មនុស្ស (NER) និងម៉ូដែលភាសា។',
    engineeringNotes:
      'Helpful for building synthetic SFT annotation validators and entity extraction benchmarks.',
    engineeringNotesKm:
      'មានប្រយោជន៍សម្រាប់ការផ្ទៀងផ្ទាត់ទិន្នន័យ SFT សំយោគ និងការវាយតម្លៃការដកស្រង់ពាក្យសំខាន់ៗ។',
    gitRepoUrl: 'https://github.com/Khmer-NLP/khmer-nlp',
    gitRepoSlug: 'Khmer-NLP/khmer-nlp'
  },
  {
    id: 'khmereasytools',
    name: 'khmereasytools (RAG & Cleanup Utilities)',
    nameKm: 'khmereasytools (ឧបករណ៍សម្អាត និង RAG ខ្មែរ)',
    organization: 'back-kh',
    category: 'nlp_toolkit',
    categoryLabel: 'Khmer Tokenizers & NLP',
    categoryLabelKm: 'ថូខិនណាយស័រ និងឧបករណ៍ NLP',
    parameterScale: 'Lightweight Python',
    architecture: 'Text Cleanup · Chunking · POS',
    khmerSupport: 'Khmer Toolkit / Pipeline',
    khmerSupportKm: 'ឧបករណ៍ភាសាខ្មែរ',
    license: 'Open Source',
    description:
      'Everyday Khmer text processing utilities optimized for local search, RAG document chunking, cleanup, tokenization, and POS tagging.',
    descriptionKm:
      'ឧបករណ៍ដំណើរការអត្ថបទខ្មែរប្រចាំថ្ងៃដែលកែលម្អសម្រាប់ការស្វែងរកក្នុងស្រុក RAG ការសម្អាតអត្ថបទ និងការកាត់ពាក្យ។',
    engineeringNotes:
      'Directly reusable for RAG indexing pipelines where naive character chunking splits Khmer coeng clusters.',
    engineeringNotesKm:
      'អាចប្រើផ្ទាល់ក្នុងប្រព័ន្ធ RAG ដើម្បីចៀសវាងការកាត់ផ្តាច់ជើងព្យញ្ជនៈខ្មែរនៅពេលបែងចែកអត្ថបទ។',
    gitRepoUrl: 'https://github.com/back-kh/khmereasytools',
    gitRepoSlug: 'back-kh/khmereasytools'
  },
  {
    id: 'qwen3-asr-khmer',
    name: 'Qwen3-ASR-0.6B-Khmer & KLEA TTS',
    nameKm: 'Qwen3-ASR-0.6B-Khmer និង KLEA TTS',
    organization: 'Seanghay Yath',
    category: 'speech_ocr_mt',
    categoryLabel: 'Speech, OCR & Translation',
    categoryLabelKm: 'សំឡេង OCR និងការបកប្រែ',
    parameterScale: '0.6B ASR / VITS TTS',
    architecture: 'Qwen3-ASR Fine-Tune & VITS Speech',
    khmerSupport: 'Native Khmer',
    khmerSupportKm: 'ភាសាខ្មែរផ្ទាល់',
    license: 'Open Weights / Apache 2.0',
    description:
      'Open-source Khmer speech recognition (Qwen3-ASR fine-tuned on read Khmer speech) alongside KLEA, an open-source VITS Khmer text-to-speech repository.',
    descriptionKm:
      'ម៉ូដែលស្តាប់សំឡេងជាអក្សរខ្មែរ (Qwen3-ASR) រួមជាមួយ KLEA ដែលជាគម្រោងបម្លែងអក្សរខ្មែរទៅជាសំឡេងបើកចំហតាម VITS។',
    engineeringNotes:
      'Enables voice-first Khmer LLM assistants and automatic transcription of Cambodian radio/podcasts into pretraining text.',
    engineeringNotesKm:
      'ជួយបង្កើតជំនួយការសំឡេងខ្មែរ និងការបម្លែងសំឡេងវិទ្យុ/ផតខាសខ្មែរទៅជាឃ្លាំងអត្ថបទសម្រាប់បង្វឹក LLM។',
    gitRepoUrl: 'https://github.com/seanghay/KLEA',
    gitRepoSlug: 'seanghay/KLEA',
    huggingFaceUrl: 'https://huggingface.co/seanghay/Qwen3-ASR-0.6B-Khmer',
    huggingFaceId: 'seanghay/Qwen3-ASR-0.6B-Khmer'
  },
  {
    id: 'netra-khmer-ocr',
    name: 'Netra-OCR & KhmerOCR',
    nameKm: 'ប្រព័ន្ធអានអក្សរខ្មែរ Netra-OCR និង KhmerOCR',
    organization: 'Netra AI Lab & Seanghay',
    category: 'speech_ocr_mt',
    categoryLabel: 'Speech, OCR & Translation',
    categoryLabelKm: 'សំឡេង OCR និងការបកប្រែ',
    parameterScale: 'Vision-Text OCR',
    architecture: 'Transformer / CRNN Khmer Script Recognition',
    khmerSupport: 'Native Khmer',
    khmerSupportKm: 'ភាសាខ្មែរផ្ទាល់',
    license: 'Open Source',
    description:
      'High-accuracy open-source OCR repositories built specifically to decode stacked Khmer coeng subscripts, Muol headers, and scanned archival PDFs.',
    descriptionKm:
      'គម្រោង OCR កូដបើកចំហដែលបង្កើតឡើងសម្រាប់អានជើងព្យញ្ជនៈខ្មែរត្រួតគ្នា អក្សរមូល និងឯកសារ PDF ស្កេនបុរាណ។',
    engineeringNotes:
      'Essential Stage 1 ingestion tooling for digitizing Royal Gazette PDFs and printed Cambodian literature.',
    engineeringNotesKm:
      'ជាឧបករណ៍ចាំបាច់ក្នុងដំណាក់កាលទី ១ ដើម្បីទាញអត្ថបទពីរាជកិច្ច PDF និងសៀវភៅអក្សរសិល្ប៍ខ្មែរ។',
    gitRepoUrl: 'https://github.com/netra-ai-lab/Netra-OCR',
    gitRepoSlug: 'netra-ai-lab/Netra-OCR'
  },
  {
    id: 'seanghay-khmer-ocr',
    name: 'KhmerOCR (Open-Source Script OCR)',
    nameKm: 'KhmerOCR (ប្រព័ន្ធស្គាល់អក្សរខ្មែរកូដបើកចំហ)',
    organization: 'Seanghay Yath',
    category: 'speech_ocr_mt',
    categoryLabel: 'Speech, OCR & Translation',
    categoryLabelKm: 'សំឡេង OCR និងការបកប្រែ',
    parameterScale: 'Vision OCR Pipeline',
    architecture: 'Deep Learning Khmer Script OCR',
    khmerSupport: 'Native Khmer',
    khmerSupportKm: 'ភាសាខ្មែរផ្ទាល់',
    license: 'Open Source',
    description:
      'Open-source Khmer Optical Character Recognition pipeline designed for complex Khmer Unicode clusters and document digitization.',
    descriptionKm:
      'គម្រោងស្គាល់អក្សរខ្មែរ OCR កូដបើកចំហ ដែលបង្កើតឡើងសម្រាប់ចង្កោមតួអក្សរយូនីកូដខ្មែរស្មុគស្មាញ និងការបម្លែងឯកសារជាឌីជីថល។',
    engineeringNotes:
      'Useful alongside Tesseract Khmer models when extracting training corpora from archival scanned PDFs.',
    engineeringNotesKm:
      'មានប្រយោជន៍រួមជាមួយ Tesseract សម្រាប់ដកស្រង់អត្ថបទពីឯកសារ PDF ស្កេនបុរាណ។',
    gitRepoUrl: 'https://github.com/seanghay/KhmerOCR',
    gitRepoSlug: 'seanghay/KhmerOCR'
  },
  {
    id: 'nllb-en-km',
    name: 'NLLB-350M English-Khmer Translation',
    nameKm: 'ម៉ូដែលបកប្រែ NLLB-350M អង់គ្លេស-ខ្មែរ',
    organization: 'Ly Feyvutha (Meta NLLB Distillation)',
    category: 'speech_ocr_mt',
    categoryLabel: 'Speech, OCR & Translation',
    categoryLabelKm: 'សំឡេង OCR និងការបកប្រែ',
    parameterScale: '350M Params',
    architecture: 'Distilled NLLB-200 Seq2Seq',
    khmerSupport: 'Native Khmer',
    khmerSupportKm: 'ភាសាខ្មែរ-អង់គ្លេស',
    license: 'CC BY-NC 4.0',
    description:
      'Compact distilled neural machine translation model specializing in English-Khmer parallel translation built on Meta No Language Left Behind.',
    descriptionKm:
      'ម៉ូដែលបកប្រែភាសាស្វ័យប្រវត្តិទំហំតូចល្មម (350M) សម្រាប់បកប្រែអង់គ្លេស-ខ្មែរ ដែលបន្ថយទំហំពី Meta NLLB-200។',
    engineeringNotes:
      'Fast local baseline for generating draft parallel corpora prior to native Cambodian linguist post-editing.',
    engineeringNotesKm:
      'ម៉ូដែលលឿនសម្រាប់បង្កើតទិន្នន័យទ្វេភាសាបឋមមុនពេលអ្នកភាសាវិទ្យាខ្មែរពិនិត្យកែសម្រួល។',
    huggingFaceUrl: 'https://huggingface.co/lyfeyvutha/nllb_350M_en_km_v10',
    huggingFaceId: 'lyfeyvutha/nllb_350M_en_km_v10'
  },
  {
    id: 'awesome-khmer-language',
    name: 'awesome-khmer-language (Master Open-Source Index)',
    nameKm: 'awesome-khmer-language (បញ្ជីកូដបើកចំហស្នូល)',
    organization: 'Seanghay Yath & Cambodian Community',
    category: 'rag_index',
    categoryLabel: 'RAG & Open-Source Indexes',
    categoryLabelKm: 'RAG និងបណ្ដុំគម្រោងកូដបើកចំហ',
    parameterScale: 'Curated Directory',
    architecture: 'Datasets · Tokenizers · ASR · OCR · LLMs',
    khmerSupport: 'Khmer Toolkit / Pipeline',
    khmerSupportKm: 'ប្រព័ន្ធអេកូឡូស៊ីខ្មែរ',
    license: 'Open Index',
    description:
      'The most comprehensive community-maintained GitHub index cataloguing open-source Khmer NLP datasets, word segmenters, fonts, TTS, OCR, and language models.',
    descriptionKm:
      'បញ្ជី GitHub ដ៏ទូលំទូលាយបំផុតដែលប្រមូលផ្តុំទិន្នន័យ ឧបករណ៍កាត់ពាក្យ ពុម្ពអក្សរ សំឡេង OCR និងម៉ូដែលភាសាខ្មែរបើកចំហ។',
    engineeringNotes:
      'Starting point for discovering community corpora, dictionary wordlists, and Cambodian developer benchmarks.',
    engineeringNotesKm:
      'ចំណុចចាប់ផ្តើមដ៏ល្អសម្រាប់ស្វែងរកឃ្លាំងទិន្នន័យ បញ្ជីពាក្យវចនានុក្រម និងគម្រោងអ្នកអភិវឌ្ឍន៍កម្ពុជា។',
    gitRepoUrl: 'https://github.com/seanghay/awesome-khmer-language',
    gitRepoSlug: 'seanghay/awesome-khmer-language'
  },
  {
    id: 'rag-khmer-tutor',
    name: 'RagKhmer-Tutor-Chatbot',
    nameKm: 'RagKhmer-Tutor-Chatbot (ប្រព័ន្ធ RAG ខ្មែរ)',
    organization: 'Yong Lyhor',
    category: 'rag_index',
    categoryLabel: 'RAG & Open-Source Indexes',
    categoryLabelKm: 'RAG និងបណ្ដុំគម្រោងកូដបើកចំហ',
    parameterScale: 'RAG Reference App',
    architecture: 'ChromaDB + Streamlit + LLM Retrieval',
    khmerSupport: 'Native Khmer',
    khmerSupportKm: 'ភាសាខ្មែរផ្ទាល់',
    license: 'Open Source',
    description:
      'Open-source reference repository demonstrating Retrieval-Augmented Generation (RAG) over Khmer educational documents using ChromaDB and Streamlit.',
    descriptionKm:
      'គម្រោងកូដបើកចំហបង្ហាញពីការអនុវត្តប្រព័ន្ធ Retrieval-Augmented Generation (RAG) លើឯកសារអប់រំខ្មែរជាមួយ ChromaDB និង Streamlit។',
    engineeringNotes:
      'Shows practical vector chunking and prompt framing patterns for Khmer Q&A grounding.',
    engineeringNotesKm:
      'បង្ហាញពីវិធីសាស្ត្របែងចែកកថាខណ្ឌ Vector និងការសរសេរ Prompt ដើម្បីឆ្លើយសំណួរខ្មែរផ្អែកលើឯកសារ។',
    gitRepoUrl: 'https://github.com/YongLyhor/RagKhmer-Tutor-Chatbot',
    gitRepoSlug: 'YongLyhor/RagKhmer-Tutor-Chatbot'
  }
];

export const KhmerModelsDirectory: React.FC = () => {
  const { isKm, tr } = useLanguage();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<ModelCategory>('all');
  const [availabilityFilter, setAvailabilityFilter] =
    useState<ResourceAvailabilityFilter>('all');
  const [viewMode, setViewMode] = useState<DirectoryViewMode>('cards');
  const [copiedCloneId, setCopiedCloneId] = useState<string | null>(null);

  const hasActiveFilters = Boolean(
    searchQuery.trim() || selectedCategory !== 'all' || availabilityFilter !== 'all'
  );

  const filteredModels = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return KHMER_OPEN_SOURCE_MODELS.filter((item) => {
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }
      if (availabilityFilter === 'has_git' && !item.gitRepoUrl) {
        return false;
      }
      if (availabilityFilter === 'has_hf' && !item.huggingFaceUrl) {
        return false;
      }
      if (q) {
        const haystack = [
          item.name,
          item.nameKm,
          item.organization,
          item.architecture,
          item.parameterScale,
          item.license,
          item.description,
          item.descriptionKm,
          item.gitRepoSlug || '',
          item.huggingFaceId || ''
        ]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [searchQuery, selectedCategory, availabilityFilter]);

  const counts = useMemo(() => {
    const gitCount = KHMER_OPEN_SOURCE_MODELS.filter((m) => Boolean(m.gitRepoUrl)).length;
    const hfCount = KHMER_OPEN_SOURCE_MODELS.filter((m) => Boolean(m.huggingFaceUrl)).length;
    return {
      total: KHMER_OPEN_SOURCE_MODELS.length,
      gitCount,
      hfCount,
      foundation: KHMER_OPEN_SOURCE_MODELS.filter((m) => m.category === 'foundation_llm').length,
      toolkit: KHMER_OPEN_SOURCE_MODELS.filter((m) => m.category === 'nlp_toolkit').length,
      speechOcr: KHMER_OPEN_SOURCE_MODELS.filter((m) => m.category === 'speech_ocr_mt').length,
      ragIndex: KHMER_OPEN_SOURCE_MODELS.filter((m) => m.category === 'rag_index').length
    };
  }, []);

  const handleCopyClone = (item: KhmerModelEntry) => {
    if (!item.gitRepoUrl) return;
    navigator.clipboard.writeText(`git clone ${item.gitRepoUrl}.git`);
    setCopiedCloneId(item.id);
    setTimeout(() => setCopiedCloneId(null), 2000);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setAvailabilityFilter('all');
  };

  const getCategoryIcon = (category: KhmerModelEntry['category']) => {
    switch (category) {
      case 'foundation_llm':
        return <Cpu className="w-3.5 h-3.5 text-amber-400 shrink-0" />;
      case 'nlp_toolkit':
        return <Code2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />;
      case 'speech_ocr_mt':
        return <Mic className="w-3.5 h-3.5 text-emerald-400 shrink-0" />;
      case 'rag_index':
        return <FolderGit2 className="w-3.5 h-3.5 text-violet-400 shrink-0" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div
          className={`inline-flex items-center gap-2 text-xs font-semibold text-amber-400 tracking-wider ${
            isKm ? 'font-khmer' : 'uppercase font-mono'
          }`}
        >
          <GitBranch className="w-3.5 h-3.5" />
          <span>
            {tr(
              'OPEN-SOURCE KHMER LLM & REPOSITORY REGISTRY',
              'បញ្ជីម៉ូដែល KHMER LLM និងឃ្លាំងកូដបើកចំហ (GIT)'
            )}
          </span>
        </div>
        <h2
          className={`text-2xl sm:text-3xl font-bold text-white tracking-tight ${
            isKm ? 'font-khmer' : ''
          }`}
        >
          {tr(
            'Khmer LLMs, Open-Source Toolkits & Git Repositories',
            'បញ្ជីម៉ូដែល LLM ខ្មែរ ឧបករណ៍កូដបើកចំហ និងតំណភ្ជាប់ Git Repository'
          )}
        </h2>
        <p className={`text-sm text-slate-300 max-w-3xl leading-relaxed ${isKm ? 'font-khmer' : ''}`}>
          {tr(
            'Curated directory of open-weight Southeast Asian and Khmer foundation models, native Khmer NLP tokenizers, speech/OCR models, and RAG repositories with direct links to source GitHub repos and Hugging Face weights.',
            'បញ្ជីប្រមូលផ្តុំម៉ូដែលភាសាធំបើកទូលាយសម្រាប់ភាសាខ្មែរ និងអាស៊ីអាគ្នេយ៍ ឧបករណ៍កាត់ពាក្យ NLP ម៉ូដែលសំឡេង/OCR និងគម្រោង RAG ជាមួយតំណភ្ជាប់ផ្ទាល់ទៅកាន់ GitHub និង Hugging Face។'
          )}
        </p>
      </div>

      {/* Summary Metrics Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 space-y-1">
          <div className={`text-xs text-slate-400 ${isKm ? 'font-khmer' : ''}`}>
            {tr('Cataloged Models & Tools', 'ម៉ូដែល និងឧបករណ៍សរុប')}
          </div>
          <div className="text-xl font-bold text-white font-mono tabular-nums">
            {counts.total}
          </div>
        </div>
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 space-y-1">
          <div className={`text-xs text-slate-400 ${isKm ? 'font-khmer' : ''}`}>
            {tr('Foundation & SEA LLMs', 'ម៉ូដែល LLM មូលដ្ឋាន')}
          </div>
          <div className="text-xl font-bold text-amber-400 font-mono tabular-nums">
            {counts.foundation}
          </div>
        </div>
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 space-y-1">
          <div className={`text-xs text-slate-400 ${isKm ? 'font-khmer' : ''}`}>
            {tr('GitHub Repositories', 'ឃ្លាំងកូដ GitHub')}
          </div>
          <div className="text-xl font-bold text-cyan-400 font-mono tabular-nums">
            {counts.gitCount}
          </div>
        </div>
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 space-y-1">
          <div className={`text-xs text-slate-400 ${isKm ? 'font-khmer' : ''}`}>
            {tr('Hugging Face Hubs', 'ម៉ូដែលលើ Hugging Face')}
          </div>
          <div className="text-xl font-bold text-emerald-400 font-mono tabular-nums">
            {counts.hfCount}
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
          {/* Search Input */}
          <div className="lg:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              aria-label={tr(
                'Search Khmer LLM models or Git repositories',
                'ស្វែងរកម៉ូដែល Khmer LLM ឬឃ្លាំងកូដ Git'
              )}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={tr(
                'Search model, org, repo (e.g., SeaLLMs, SEA-LION, khmer-nltk)...',
                'ស្វែងរកម៉ូដែល អង្គការ ឬ Git repo (ឧ. SeaLLMs, SEA-LION, khmer-nltk)...'
              )}
              className={`w-full pl-10 pr-9 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-400 transition-colors placeholder:text-slate-500 ${
                isKm ? 'font-khmer' : 'font-sans'
              }`}
            />
            {searchQuery && (
              <button
                type="button"
                aria-label={tr('Clear search', 'សម្អាតការស្វែងរក')}
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Availability Filter */}
          <div
            className={`lg:col-span-4 flex items-center gap-1 p-1 rounded-xl bg-slate-950 border border-slate-800 text-[11px] ${
              isKm ? 'font-khmer' : 'font-mono'
            }`}
          >
            {(
              [
                { id: 'all', label: tr('All Links', 'តំណទាំងអស់') },
                { id: 'has_git', label: tr('Git Repo', 'មាន Git Repo') },
                { id: 'has_hf', label: tr('Hugging Face', 'មាន Hugging Face') }
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setAvailabilityFilter(opt.id)}
                className={`flex-1 py-1.5 px-2 rounded-lg transition-colors whitespace-nowrap ${
                  availabilityFilter === opt.id
                    ? 'bg-amber-400 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* View Mode Toggle + Reset */}
          <div className="lg:col-span-3 flex items-center justify-end gap-2">
            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950 border border-slate-800 text-[11px]">
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                  isKm ? 'font-khmer' : 'font-mono'
                } ${
                  viewMode === 'cards'
                    ? 'bg-slate-800 text-white font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>{tr('Cards', 'កាត')}</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                  isKm ? 'font-khmer' : 'font-mono'
                } ${
                  viewMode === 'table'
                    ? 'bg-slate-800 text-white font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span>{tr('Table', 'តារាង')}</span>
              </button>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                title={tr('Reset filters', 'កំណត់តម្រងឡើងវិញ')}
                className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-amber-300 hover:border-amber-500/40 transition-colors shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-800/80">
          <div className="flex flex-wrap items-center gap-1.5">
            {(
              [
                { id: 'all', label: tr('All Models & Repos', 'ម៉ូដែល និងឃ្លាំងកូដទាំងអស់'), count: counts.total },
                {
                  id: 'foundation_llm',
                  label: tr('Foundation & SEA LLMs', 'ម៉ូដែល LLM មូលដ្ឋាន'),
                  count: counts.foundation
                },
                {
                  id: 'nlp_toolkit',
                  label: tr('Khmer Tokenizers & NLP', 'ថូខិនណាយស័រ និង NLP'),
                  count: counts.toolkit
                },
                {
                  id: 'speech_ocr_mt',
                  label: tr('Speech, OCR & MT', 'សំឡេង OCR និងបកប្រែ'),
                  count: counts.speechOcr
                },
                {
                  id: 'rag_index',
                  label: tr('RAG & Community Indexes', 'RAG និងបណ្ដុំគម្រោង'),
                  count: counts.ragIndex
                }
              ] as const
            ).map((cat) => {
              const active = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                    isKm ? 'font-khmer' : 'font-mono'
                  } ${
                    active
                      ? 'bg-amber-400 text-slate-950 font-bold'
                      : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                >
                  <span>{cat.label}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded text-[10px] font-mono tabular-nums ${
                      active ? 'bg-slate-950 text-amber-300' : 'bg-slate-900 text-slate-400'
                    }`}
                  >
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className={`text-xs text-slate-400 font-mono tabular-nums ${isKm ? 'font-khmer' : ''}`}>
            {isKm ? (
              <>
                បង្ហាញ <strong className="text-amber-400 font-mono">{filteredModels.length}</strong> /{' '}
                <span className="font-mono">{KHMER_OPEN_SOURCE_MODELS.length}</span>
              </>
            ) : (
              <>
                Showing <strong className="text-amber-400">{filteredModels.length}</strong> of{' '}
                {KHMER_OPEN_SOURCE_MODELS.length}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Directory Content: Cards or Comparison Table */}
      {filteredModels.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-slate-800 bg-slate-900/30 space-y-3">
          <GitBranch className="w-8 h-8 text-slate-600 mx-auto" />
          <h3 className={`text-base font-bold text-white ${isKm ? 'font-khmer' : ''}`}>
            {tr('No models or repositories matched your filters', 'គ្មានម៉ូដែល ឬឃ្លាំងកូដត្រូវនឹងតម្រងទេ')}
          </h3>
          <button
            type="button"
            onClick={handleResetFilters}
            className={`px-4 py-2 rounded-xl text-xs font-bold bg-amber-400 text-slate-950 hover:bg-amber-300 transition-colors ${
              isKm ? 'font-khmer' : 'font-mono'
            }`}
          >
            {tr('Reset Filters', 'កំណត់តម្រងឡើងវិញ')}
          </button>
        </div>
      ) : viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredModels.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40 hover:bg-slate-900/70 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                {/* Clean Typographic Metadata Header (No Pill Sandwiches) */}
                <div className="flex items-center justify-between gap-2 text-xs text-slate-400">
                  <div className="flex items-center gap-2 min-w-0">
                    {getCategoryIcon(item.category)}
                    <span className={`truncate ${isKm ? 'font-khmer' : 'font-mono'}`}>
                      {isKm ? item.categoryLabelKm : item.categoryLabel}
                    </span>
                    <span aria-hidden="true" className="text-slate-600">
                      ·
                    </span>
                    <span className="font-mono text-amber-300 tabular-nums shrink-0">
                      {item.parameterScale}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 shrink-0">
                    {item.license}
                  </span>
                </div>

                {/* Title & Organization */}
                <div className="space-y-1">
                  <h3 className={`text-base font-bold text-white leading-snug ${isKm ? 'font-khmer' : ''}`}>
                    {isKm ? item.nameKm : item.name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                    <span className="font-mono">{item.organization}</span>
                    <span aria-hidden="true" className="text-slate-600">
                      ·
                    </span>
                    <span className={isKm ? 'font-khmer text-emerald-300' : 'text-emerald-300'}>
                      {isKm ? item.khmerSupportKm : item.khmerSupport}
                    </span>
                  </div>
                </div>

                {/* Architecture Line */}
                <div className="text-[11px] font-mono text-cyan-300/90">
                  {item.architecture}
                </div>

                {/* Description */}
                <p className={`text-xs text-slate-300 leading-relaxed ${isKm ? 'font-khmer' : ''}`}>
                  {isKm ? item.descriptionKm : item.description}
                </p>

                {/* Engineering Note */}
                <div className="pt-2 border-t border-slate-800/70 text-[11px] text-slate-400 leading-relaxed">
                  <strong className={`text-slate-200 ${isKm ? 'font-khmer' : ''}`}>
                    {tr('Engineering Note:', 'កំណត់សម្គាល់វិស្វកម្ម៖')}
                  </strong>{' '}
                  <span className={isKm ? 'font-khmer' : ''}>
                    {isKm ? item.engineeringNotesKm : item.engineeringNotes}
                  </span>
                </div>
              </div>

              {/* Direct Repository & Model Links */}
              <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  {item.gitRepoUrl && (
                    <a
                      href={item.gitRepoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-400 text-slate-950 font-bold hover:bg-amber-300 transition-colors whitespace-nowrap ${
                        isKm ? 'font-khmer' : 'font-mono'
                      }`}
                    >
                      <GitBranch className="w-3.5 h-3.5" />
                      <span>{tr('Git Repository', 'ឃ្លាំងកូដ Git')}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}

                  {item.huggingFaceUrl && (
                    <a
                      href={item.huggingFaceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-950 text-slate-200 hover:text-white hover:border-amber-400/60 transition-colors whitespace-nowrap ${
                        isKm ? 'font-khmer' : 'font-mono'
                      }`}
                    >
                      <span>{tr('Hugging Face', 'Hugging Face')}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                {item.gitRepoUrl && (
                  <button
                    type="button"
                    onClick={() => handleCopyClone(item)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:text-white transition-colors whitespace-nowrap ${
                      isKm ? 'font-khmer' : 'font-mono'
                    }`}
                    title={`git clone ${item.gitRepoUrl}.git`}
                  >
                    {copiedCloneId === item.id ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    <span>
                      {copiedCloneId === item.id
                        ? tr('Copied git clone', 'បានចម្លង git clone')
                        : 'git clone'}
                    </span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Comparison Table View */
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/70 text-slate-400">
                  <th className={`py-3 px-4 font-semibold ${isKm ? 'font-khmer' : 'font-mono'}`}>
                    {tr('Model / Project', 'ម៉ូដែល / គម្រោង')}
                  </th>
                  <th className={`py-3 px-4 font-semibold ${isKm ? 'font-khmer' : 'font-mono'}`}>
                    {tr('Category', 'ប្រភេទ')}
                  </th>
                  <th className={`py-3 px-4 font-semibold text-right ${isKm ? 'font-khmer' : 'font-mono'}`}>
                    {tr('Scale / Type', 'ទំហំ / ប្រភេទ')}
                  </th>
                  <th className={`py-3 px-4 font-semibold ${isKm ? 'font-khmer' : 'font-mono'}`}>
                    {tr('License', 'អាជ្ញាប័ណ្ណ')}
                  </th>
                  <th className={`py-3 px-4 font-semibold text-right ${isKm ? 'font-khmer' : 'font-mono'}`}>
                    {tr('Git & Model Links', 'តំណភ្ជាប់ Git និងម៉ូដែល')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {filteredModels.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-900/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className={`font-semibold text-white ${isKm ? 'font-khmer' : ''}`}>
                        {isKm ? item.nameKm : item.name}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {item.organization}
                      </div>
                    </td>
                    <td className={`py-3 px-4 text-slate-300 ${isKm ? 'font-khmer' : ''}`}>
                      {isKm ? item.categoryLabelKm : item.categoryLabel}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-amber-300 tabular-nums whitespace-nowrap">
                      {item.parameterScale}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400 whitespace-nowrap">
                      {item.license}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center justify-end gap-2">
                        {item.gitRepoUrl && (
                          <a
                            href={item.gitRepoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-400 text-slate-950 font-mono font-bold hover:bg-amber-300 transition-colors whitespace-nowrap"
                          >
                            <GitBranch className="w-3 h-3" />
                            <span>GitHub</span>
                          </a>
                        )}
                        {item.huggingFaceUrl && (
                          <a
                            href={item.huggingFaceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-slate-700 bg-slate-950 text-slate-200 font-mono hover:text-white hover:border-amber-400/60 transition-colors whitespace-nowrap"
                          >
                            <span>HF</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
