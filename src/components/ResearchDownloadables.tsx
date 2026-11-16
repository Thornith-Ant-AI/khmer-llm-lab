import React, { useMemo, useState } from 'react';
import {
  Download,
  Copy,
  Check,
  Eye,
  EyeOff,
  FileCode2,
  Database,
  Cpu,
  Braces,
  FileJson,
  Package,
  Search,
  X,
  Bookmark,
  BookmarkCheck
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export type DownloadableCategory = 'all' | 'datasets' | 'tokenizer' | 'architecture';

export interface ResearchDownloadablesProps {
  savedIds?: string[];
  onToggleBookmark?: (artifactId: string) => void;
}

export interface DownloadableArtifact {
  id: string;
  filename: string;
  title: string;
  titleKm: string;
  category: 'datasets' | 'tokenizer' | 'architecture';
  formatBadge: 'JSONL' | 'JSON' | 'PROTOTXT' | 'PROTO' | 'YAML';
  mimeType: string;
  version: string;
  description: string;
  descriptionKm: string;
  usageNote: string;
  usageNoteKm: string;
  content: string;
}

export const DOWNLOADABLE_ARTIFACTS: DownloadableArtifact[] = [
  {
    id: 'khmer-pretrain-starter',
    filename: 'khmer-pretrain-starter-tier1.jsonl',
    title: 'Khmer Clean Pretraining Starter Corpus',
    titleKm: 'សំណុំទិន្នន័យចាប់ផ្ដើមសម្រាប់ Pretraining ភាសាខ្មែរ (Tier-1)',
    category: 'datasets',
    formatBadge: 'JSONL',
    mimeType: 'application/x-ndjson;charset=utf-8',
    version: 'v1.2',
    description:
      'NFC-normalized Khmer pretraining lines covering science, agronomy, economics, law, and software engineering, pre-scored for script purity and Coeng integrity.',
    descriptionKm:
      'បន្ទាត់ទិន្នន័យ JSONL ដែលបានធ្វើស្តង់ដារ Unicode NFC រួចរាល់ គ្របដណ្ដប់លើវិទ្យាសាស្ត្រ កសិកម្ម សេដ្ឋកិច្ច ច្បាប់ និងវិស្វកម្មសូហ្វវែរ ដោយមានពិន្ទុគុណភាពអក្សរខ្មែរ។',
    usageNote: 'Streaming dataset · UTF-8 NFC',
    usageNoteKm: 'ទិន្នន័យ Streaming · UTF-8 NFC',
    content: [
      JSON.stringify({
        id: 'kh-tier1-0001',
        source: 'royal-academy-encyclopedia',
        tier: 'tier1_encyclopedic',
        khmer_ratio: 0.96,
        coeng_density: 0.14,
        license: 'CC-BY-SA-4.0',
        text: 'ប្រព័ន្ធធារាសាស្ត្រនៅសម័យអង្គរគឺជាស្នាដៃវិស្វកម្មបុរាណដ៏អស្ចារ្យដែលអនុញ្ញាតឱ្យប្រជាជនខ្មែរគ្រប់គ្រងទឹកជំនន់ និងរដូវប្រាំងបានយ៉ាងមានប្រសិទ្ធភាព។ បារាយណ៍ទឹកថ្លា និងបារាយណ៍ខាងលិចដើរតួនាទីជាអាងស្តុកទឹកខ្នាតយក្សសម្រាប់កសិកម្មស្រូវ។'
      }),
      JSON.stringify({
        id: 'kh-tier1-0002',
        source: 'khmer-stem-open-textbooks',
        tier: 'tier1_stem',
        khmer_ratio: 0.91,
        coeng_density: 0.16,
        license: 'CC-BY-4.0',
        text: 'ការធ្វើស្តង់ដារយូនីកូដ NFC មុនពេលបណ្ដុះបណ្តាលគំរូភាសាខ្មែរ ជួយកាត់បន្ថយបញ្ហាការបំបែកជើងព្យញ្ជនៈ (Coeng U+17D2) និងធានាថាកន្សោមស្រៈនិស្ស័យត្រូវបានរៀបតាមលំដាប់កូដត្រឹមត្រូវ។'
      }),
      JSON.stringify({
        id: 'kh-tier1-0003',
        source: 'cambodia-agronomy-journal',
        tier: 'tier1_academic',
        khmer_ratio: 0.94,
        coeng_density: 0.13,
        license: 'CC-BY-4.0',
        text: 'ដំណាំស្រូវផ្ការំដួលទាមទារការគ្រប់គ្រងសំណើមដី និងសារធាតុចិញ្ចឹមសរីរាង្គឱ្យបានសមស្របតាមរដូវកាល ដើម្បីរក្សាគុណភាពក្លិនក្រអូប និងទិន្នផលខ្ពស់សម្រាប់ទីផ្សារនាំចេញ។'
      }),
      JSON.stringify({
        id: 'kh-tier1-0004',
        source: 'khmer-computing-handbook',
        tier: 'tier1_technical',
        khmer_ratio: 0.84,
        coeng_density: 0.12,
        license: 'MIT',
        text: 'នៅក្នុងស្ថាបត្យកម្ម Transformer ទំនើប ការប្រើប្រាស់ Grouped-Query Attention (GQA) និង RoPE theta ៥០០,០០០ ជួយកាត់បន្ថយទំហំ KV Cache ខណៈពេលពង្រីកបរិបទដល់ ៨,១៩២ ថូខឹនសម្រាប់ឯកសារខ្មែរវែងៗ។'
      }),
      JSON.stringify({
        id: 'kh-tier1-0005',
        source: 'cambodia-macroeconomics-brief',
        tier: 'tier1_economics',
        khmer_ratio: 0.93,
        coeng_density: 0.15,
        license: 'CC-BY-4.0',
        text: 'ការអភិវឌ្ឍហេដ្ឋារចនាសម្ព័ន្ធឌីជីថល និងការទូទាត់តាមប្រព័ន្ធបាគង (Bakong) បានជំរុញបរិយាបន្នហិរញ្ញវត្ថុ និងកាត់បន្ថយថ្លៃប្រតិបត្តិការសម្រាប់សហគ្រាសធុនតូច និងមធ្យមនៅកម្ពុជា។'
      }),
      JSON.stringify({
        id: 'kh-tier1-0006',
        source: 'open-khmer-civic-corpus',
        tier: 'tier1_civic',
        khmer_ratio: 0.95,
        coeng_density: 0.14,
        license: 'CC0-1.0',
        text: 'ការអភិរក្សសម្បត្តិបេតិកភណ្ឌវប្បធម៌អរូបី ដូចជាល្ខោនខោល ចាប៉ីដងវែង និងរបាំព្រះរាជទ្រព្យ គឺជាកាតព្វកិច្ចរួមដើម្បីបន្តមរតកសិល្បៈជាតិទៅកាន់ជំនាន់ក្រោយ។'
      })
    ].join('\n')
  },
  {
    id: 'khmer-sft-instructions',
    filename: 'khmer-sft-instructions-starter.jsonl',
    title: 'Khmer Instruction & Honorific SFT Pairs',
    titleKm: 'សំណុំទិន្នន័យ SFT ការបញ្ជា និងកម្រិតភាសាគួរសមខ្មែរ',
    category: 'datasets',
    formatBadge: 'JSONL',
    mimeType: 'application/x-ndjson;charset=utf-8',
    version: 'v1.0',
    description:
      'Curated Supervised Fine-Tuning (SFT) prompt-response pairs tagged with Khmer sociolinguistic register (formal, academic, technical, polite) and task category.',
    descriptionKm:
      'គូសំណួរ-ចម្លើយសម្រាប់ Supervised Fine-Tuning (SFT) ដែលមានស្លាកកម្រិតភាសាខ្មែរ (ផ្លូវការ សិក្សា បច្ចេកទេស គួរសម) និងប្រភេទភារកិច្ច។',
    usageNote: 'ChatML / SFTTrainer ready',
    usageNoteKm: 'រួចរាល់សម្រាប់ ChatML / SFTTrainer',
    content: [
      JSON.stringify({
        id: 'sft-kh-001',
        task_type: 'nlp_explanation',
        register: 'technical_formal',
        messages: [
          {
            role: 'user',
            content: 'តើហេតុអ្វីបានជាការបន្ថែមវាក្យសព្ទខ្មែរនៅក្នុង Tokenizer មានសារៈសំខាន់ខ្លាំងសម្រាប់ LLM?'
          },
          {
            role: 'assistant',
            content:
              'ការពង្រីកវាក្យសព្ទខ្មែរនៅក្នុង Tokenizer ជួយកាត់បន្ថយអត្រា Token-to-Character ពីប្រមាណ ២.៨ មកត្រឹម ០.៤៥–០.៦៥ ថូខឹនក្នុងមួយតួអក្សរ។ ផលប្រយោជន៍សំខាន់ៗរួមមាន៖ ១) បន្ថយថ្លៃចំណាយគណនា Attention ២) បង្កើនប្រវែងអត្ថបទជាក់ស្ដែងក្នុងបរិបទ Window ដូចគ្នា និង ៣) កាត់បន្ថយការធ្លាក់ទៅកម្រិត Byte Fallback ដែលបំបែកជើងព្យញ្ជនៈខ្មែរ។'
          }
        ]
      }),
      JSON.stringify({
        id: 'sft-kh-002',
        task_type: 'summarization',
        register: 'formal_polite',
        messages: [
          {
            role: 'user',
            content: 'សូមសង្ខេបអត្ថប្រយោជន៍នៃការធ្វើ NFC Normalization មុនពេលបណ្តុះបណ្តាលទិន្នន័យខ្មែរ។'
          },
          {
            role: 'assistant',
            content:
              'ការធ្វើ Unicode NFC Normalization ជួយបង្រួបបង្រួមលំដាប់កូដតួអក្សរខ្មែរដែលមានទម្រង់សរសេរផ្សេងគ្នាឱ្យទៅជាទម្រង់ស្ដង់ដារតែមួយ កាត់បន្ថយពាក្យស្ទួនក្នុងវចនានុក្រម និងការពារកុំឱ្យសញ្ញា Coeng ត្រូវបានបំបែកចេញពីព្យញ្ជនៈគោល។'
          }
        ]
      }),
      JSON.stringify({
        id: 'sft-kh-003',
        task_type: 'register_rewriting',
        register: 'academic_honorific',
        messages: [
          {
            role: 'user',
            content: 'សូមបម្លែងប្រយោគធម្មតានេះទៅជាភាសាផ្លូវការ៖ «ថ្ងៃស្អែកក្រុមការងារនឹងផ្ញើរបាយការណ៍ទៅលោកគ្រូ»។'
          },
          {
            role: 'assistant',
            content:
              'កំណែភាសាផ្លូវការ៖ «នៅថ្ងៃស្អែក ក្រុមការងារយើងខ្ញុំនឹងគោរពជូនរបាយការណ៍លម្អិតដល់លោកសាស្ត្រាចារ្យដើម្បីពិនិត្យ និងផ្ដល់មតិយោបល់។»'
          }
        ]
      })
    ].join('\n')
  },
  {
    id: 'khmer-noise-filter-rules',
    filename: 'khmer-noise-filter-rules.json',
    title: 'Khmer Corpus Sanitization & Filter Ruleset',
    titleKm: 'ក្បួនច្បាប់សម្អាត និងចម្រោះទិន្នន័យអត្ថបទខ្មែរ',
    category: 'datasets',
    formatBadge: 'JSON',
    mimeType: 'application/json;charset=utf-8',
    version: 'v1.1',
    description:
      'Machine-readable filtering thresholds for CC/web-crawl cleaning: Khmer Unicode block density, zero-width stripping policy, legacy Limon detection, and spam blocklists.',
    descriptionKm:
      'កម្រិតស្តង់ដារសម្រាប់សម្អាតទិន្នន័យគេហទំព័រ៖ អត្រាអក្សរខ្មែរ Unicode គោលការណ៍លុបតួអក្សរឥតទទឹង ការចាប់អក្សរ Limon ចាស់ៗ និងបញ្ជីពាក្យសារឥតបានការ។',
    usageNote: 'Datatrove / Dolma pipeline config',
    usageNoteKm: 'សម្រាប់ Pipeline Datatrove / Dolma',
    content: JSON.stringify(
      {
        schema_version: '1.1.0',
        script_policy: {
          unicode_blocks: {
            khmer_core: ['U+1780', 'U+17FF'],
            khmer_symbols: ['U+19E0', 'U+19FF']
          },
          normalization_form: 'NFC',
          min_khmer_char_ratio: 0.65,
          min_document_chars: 180,
          max_consecutive_diacritics: 4,
          strip_zero_width_chars: ['U+200B', 'U+200C', 'U+200D', 'U+FEFF'],
          normalize_spaces_to_ascii: true
        },
        legacy_font_detection: {
          reject_if_limon_heuristic_matches: true,
          limon_ascii_cluster_patterns: ['kñúg', 'rbs;', 'nig', 'eday', 'Cam'],
          recommended_transcoder: 'khmer-legacy-to-unicode-v2'
        },
        deduplication: {
          exact_line_hash: 'blake3',
          fuzzy_minhash_jaccard_threshold: 0.82,
          ngram_size: 5
        },
        spam_and_boilerplate_filters: {
          max_url_density: 0.08,
          max_digit_ratio: 0.35,
          blocked_substrings: ['បាការ៉ាត់', 'ភ្នាល់បាល់អនឡាញ', 'កាស៊ីណូអនឡាញ', 'ទំនាក់ទំនងផ្សាយពាណិជ្ជកម្ម']
        }
      },
      null,
      2
    )
  },
  {
    id: 'khmer-hf-tokenizer-config',
    filename: 'khmer-spm-32k-tokenizer-config.json',
    title: 'HuggingFace Khmer 32K Tokenizer Config',
    titleKm: 'ការកំណត់ HuggingFace Tokenizer 32K សម្រាប់ភាសាខ្មែរ',
    category: 'tokenizer',
    formatBadge: 'JSON',
    mimeType: 'application/json;charset=utf-8',
    version: 'v2.0',
    description:
      'Drop-in HuggingFace tokenizer_config.json tuned for Khmer scriptio continua with byte fallback enabled, special Coeng preservation, and ChatML template.',
    descriptionKm:
      'ឯកសារ tokenizer_config.json សម្រាប់ HuggingFace ដែលបានកំណត់ជាពិសេសសម្រាប់អក្សរខ្មែរឥតដកឃ្លា ជាមួយ Byte Fallback ការរក្សា Coeng និងគំរូ ChatML។',
    usageNote: 'transformers >= 4.40 compatible',
    usageNoteKm: 'ប្រើបានជាមួយ transformers >= 4.40',
    content: JSON.stringify(
      {
        tokenizer_class: 'LlamaTokenizerFast',
        model_max_length: 8192,
        vocab_size: 32000,
        bos_token: '<s>',
        eos_token: '</s>',
        unk_token: '<unk>',
        pad_token: '<pad>',
        add_bos_token: true,
        add_eos_token: false,
        clean_up_tokenization_spaces: false,
        legacy: false,
        khmer_preprocessing: {
          unicode_normalization: 'NFC',
          preserve_zero_width_space: false,
          coeng_cluster_aware: true,
          character_coverage: 0.9995,
          byte_fallback: true
        },
        added_tokens_decoder: {
          '0': { content: '<unk>', special: true },
          '1': { content: '<s>', special: true },
          '2': { content: '</s>', special: true },
          '3': { content: '<pad>', special: true },
          '32000': { content: '<|im_start|>', special: true },
          '32001': { content: '<|im_end|>', special: true }
        },
        chat_template:
          "{% for message in messages %}{{'<|im_start|>' + message['role'] + '\\n' + message['content'] + '<|im_end|>' + '\\n'}}{% endfor %}{% if add_generation_prompt %}{{'<|im_start|>assistant\\n'}}{% endif %}"
      },
      null,
      2
    )
  },
  {
    id: 'sentencepiece-khmer-prototxt',
    filename: 'sentencepiece-khmer-trainer.prototxt',
    title: 'SentencePiece TrainerSpec Config (Protobuf)',
    titleKm: 'ការកំណត់ SentencePiece TrainerSpec (ទម្រង់ Protobuf)',
    category: 'tokenizer',
    formatBadge: 'PROTOTXT',
    mimeType: 'text/plain;charset=utf-8',
    version: 'v1.4',
    description:
      'Protobuf text configuration (TrainerSpec & NormalizerSpec) for spm_train CLI/Python to train a 32K BPE tokenizer with Khmer punctuation & Coeng user symbols.',
    descriptionKm:
      'ឯកសារ Protobuf text (TrainerSpec & NormalizerSpec) សម្រាប់ spm_train ដើម្បីបណ្តុះបណ្តាល Tokenizer BPE 32K ជាមួយសញ្ញាវណ្ណយុត្តិខ្មែរ និងជើងព្យញ្ជនៈ។',
    usageNote: 'spm_train --model_prefix=khmer_32k',
    usageNoteKm: 'ប្រើជាមួយ spm_train CLI / Python',
    content: `# SentencePiece Protobuf TrainerSpec for Khmer + English Bilingual LLM
# Usage: python -c "import sentencepiece as spm; spm.SentencePieceTrainer.train(...)"

trainer_spec {
  input: "data/khmer_pretrain_nfc.txt"
  model_prefix: "khmer_bpe_32k"
  model_type: BPE
  vocab_size: 32000
  character_coverage: 0.9995
  num_threads: 32
  input_sentence_size: 5000000
  shuffle_input_sentence: true
  max_sentence_length: 8192

  # Critical for Khmer Abugida & Coeng subscripts
  byte_fallback: true
  split_by_unicode_script: true
  split_by_whitespace: true
  split_by_number: true
  split_digits: true
  treat_whitespace_as_suffix: false
  allow_whitespace_only_pieces: true

  # Special IDs aligned with Llama/Qwen-style configs
  unk_id: 0
  bos_id: 1
  eos_id: 2
  pad_id: 3
  unk_piece: "<unk>"
  bos_piece: "<s>"
  eos_piece: "</s>"
  pad_piece: "<pad>"

  # Atomic Khmer orthographic markers preserved as single pieces
  user_defined_symbols: "។,៕,៖,ៗ,៛,៙,៚,ខ្ញុំ,កម្ពុជា,ព្រះរាជាណាចក្រ,និង,ដែល,សម្រាប់"
}

normalizer_spec {
  name: "nfkc"
  add_dummy_prefix: true
  remove_extra_whitespaces: false
  escape_whitespaces: true
}
`
  },
  {
    id: 'khmer-tokenizer-proto-schema',
    filename: 'khmer-tokenizer-spec.proto',
    title: 'Khmer Syllable Tokenizer Protobuf Schema',
    titleKm: 'គ្រោង Protobuf (.proto) សម្រាប់ Tokenizer ភាសាខ្មែរ',
    category: 'tokenizer',
    formatBadge: 'PROTO',
    mimeType: 'text/plain;charset=utf-8',
    version: 'proto3',
    description:
      'Strongly-typed Protobuf v3 schema defining Khmer Unicode normalization policy, Coeng subscript validation, and pre-tokenization cluster boundaries.',
    descriptionKm:
      'គ្រោងទិន្នន័យ Protobuf v3 សម្រាប់កំណត់គោលការណ៍ Unicode Normalization ការផ្ទៀងផ្ទាត់ជើង Coeng និងព្រំដែនព្យាង្គភាសាខ្មែរ។',
    usageNote: 'protoc --python_out=. / --rust_out=.',
    usageNoteKm: 'ចងក្រងជាមួយ protoc (Python/Rust/Go)',
    content: `syntax = "proto3";

package khmer.llm.tokenizer;

enum NormalizationMode {
  NORMALIZATION_UNSPECIFIED = 0;
  UNICODE_NFC = 1;
  UNICODE_NFKC = 2;
  KHMER_CANONICAL_REORDER = 3;
}

enum CoengHandlingPolicy {
  COENG_UNSPECIFIED = 0;
  PRESERVE_WHOLE_CLUSTER = 1;
  ALLOW_SUBWORD_BOUNDARY = 2;
  STRICT_SYLLABLE_LOCK = 3;
}

message SyllablePreTokenizerRule {
  // Regex matching Khmer orthographic syllable clusters (Consonant + optional Coeng + Vowels + Diacritics)
  string cluster_regex = 1;
  bool strip_zero_width_space = 2; // U+200B
  bool preserve_zwnj = 3;          // U+200C
  uint32 max_cluster_codepoints = 4;
}

message KhmerTokenizerProfile {
  string model_name = 1;
  uint32 vocab_size = 2;
  double character_coverage = 3;
  bool byte_fallback = 4;
  NormalizationMode normalization = 5;
  CoengHandlingPolicy coeng_policy = 6;
  SyllablePreTokenizerRule pre_tokenizer = 7;
  repeated string protected_khmer_tokens = 8;
}
`
  },
  {
    id: 'khmer-llm-1.5b-pretrain-yaml',
    filename: 'khmer-llm-1.5b-pretrain.yaml',
    title: 'Khmer-LLM 1.5B Pretraining Architecture YAML',
    titleKm: 'ឯកសារ YAML ស្ថាបត្យកម្មបណ្តុះបណ្តាល Khmer-LLM 1.5B',
    category: 'architecture',
    formatBadge: 'YAML',
    mimeType: 'application/yaml;charset=utf-8',
    version: 'v1.5',
    description:
      'Production-ready 1.5B dense Transformer pretraining spec using GQA (4:1), SwiGLU, RMSNorm, RoPE theta=500,000, BF16 FSDP, and Chinchilla 35B token schedule.',
    descriptionKm:
      'លក្ខណៈបច្ចេកទេសស្ថាបត្យកម្ម 1.5B Transformer សម្រាប់ Pretraining ប្រើប្រាស់ GQA (4:1), SwiGLU, RMSNorm, RoPE theta=500,000, BF16 FSDP និងកាលវិភាគ 35B Tokens។',
    usageNote: 'Torchtune / Megatron-compatible YAML',
    usageNoteKm: 'ប្រើបានជាមួយ Torchtune / Megatron',
    content: `# Khmer-LLM 1.5B Dense Pretraining Configuration
model:
  name: khmer-llm-1.5b-base
  architecture: LlamaForCausalLM
  vocab_size: 32000
  hidden_size: 2048
  intermediate_size: 5632
  num_hidden_layers: 24
  num_attention_heads: 16
  num_key_value_heads: 4        # Grouped-Query Attention (4:1 ratio)
  hidden_act: silu              # SwiGLU MLP gating
  norm_type: rmsnorm
  rms_norm_eps: 1.0e-5
  max_position_embeddings: 8192
  rope_theta: 500000.0
  tie_word_embeddings: true
  attention_bias: false
  mlp_bias: false

tokenizer:
  type: sentencepiece_bpe
  config_file: ./khmer-spm-32k-tokenizer-config.json
  normalization: NFC

data_mixture:
  total_tokens: 35000000000     # ~23 tokens/param (Chinchilla-optimal+)
  shards:
    - name: khmer_clean_web_encyclopedic
      weight: 0.65
      min_khmer_ratio: 0.70
    - name: english_stem_reasoning
      weight: 0.25
    - name: multilingual_code_structured
      weight: 0.10

training:
  precision: bf16
  flash_attention: true
  distributed_strategy: fsdp_hybrid_shard
  global_batch_size_tokens: 2097152   # 2M tokens/step
  micro_batch_size: 8
  optimizer:
    name: adamw
    lr: 3.0e-4
    betas: [0.9, 0.95]
    weight_decay: 0.1
    grad_clip: 1.0
  lr_scheduler:
    type: cosine_with_min_lr
    warmup_steps: 2000
    min_lr_ratio: 0.1
  checkpointing:
    save_interval_steps: 1000
    eval_interval_steps: 500
`
  },
  {
    id: 'khmer-llm-3b-sft-yaml',
    filename: 'khmer-llm-3b-sft-qlora.yaml',
    title: 'Khmer-LLM 3B SFT + QLoRA Fine-Tuning YAML',
    titleKm: 'ឯកសារ YAML សម្រាប់ Fine-Tuning Khmer-LLM 3B (SFT + QLoRA)',
    category: 'architecture',
    formatBadge: 'YAML',
    mimeType: 'application/yaml;charset=utf-8',
    version: 'v1.2',
    description:
      'Single-GPU 24GB VRAM post-training YAML with 4-bit NF4 QLoRA adapters, sequence packing, and Khmer honorific register instruction dataset weighting.',
    descriptionKm:
      'ការកំណត់ Post-Training សម្រាប់ GPU 24GB VRAM ដោយប្រើ 4-bit NF4 QLoRA, Sequence Packing និងទម្ងន់ទិន្នន័យការបញ្ជាភាសាខ្មែរគួរសម។',
    usageNote: 'Axolotl / TRL SFTTrainer ready',
    usageNoteKm: 'រួចរាល់សម្រាប់ Axolotl / TRL',
    content: `# Khmer-LLM 3B Post-Training (SFT + QLoRA) Configuration
base_model: khmer-llm-lab/khmer-llm-3b-base
model_type: AutoModelForCausalLM
tokenizer_type: AutoTokenizer

load_in_4bit: true
bnb_4bit_quant_type: nf4
bnb_4bit_use_double_quant: true
bnb_4bit_compute_dtype: bfloat16

adapter: qlora
lora_r: 64
lora_alpha: 128
lora_dropout: 0.05
lora_target_modules:
  - q_proj
  - k_proj
  - v_proj
  - o_proj
  - gate_proj
  - up_proj
  - down_proj

sequence_len: 4096
sample_packing: true
pad_to_sequence_len: true

datasets:
  - path: ./khmer-sft-instructions-starter.jsonl
    type: chat_template
    chat_template: chatml
    weight: 0.70
  - path: khmer-llm-lab/khmer-safety-honorifics-sft
    type: chat_template
    weight: 0.30

training:
  num_epochs: 3
  micro_batch_size: 4
  gradient_accumulation_steps: 8
  learning_rate: 1.5e-4
  lr_scheduler: cosine
  warmup_ratio: 0.06
  bf16: true
  flash_attention: true
  gradient_checkpointing: true
  output_dir: ./checkpoints/khmer-3b-sft-qlora
`
  }
];

export function formatByteSize(text: string): string {
  const bytes = new Blob([text]).size;
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

export function triggerFileDownload(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export const ResearchDownloadables: React.FC<ResearchDownloadablesProps> = ({
  savedIds,
  onToggleBookmark
}) => {
  const { tr, isKm } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<DownloadableCategory>('all');
  const [query, setQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(DOWNLOADABLE_ARTIFACTS[0].id);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [downloadedIds, setDownloadedIds] = useState<Record<string, boolean>>({});
  const [bundleDownloaded, setBundleDownloaded] = useState(false);
  const [localSavedIds, setLocalSavedIds] = useState<string[]>([]);

  const activeSavedSet = useMemo(
    () => new Set(savedIds ?? localSavedIds),
    [savedIds, localSavedIds]
  );

  const handleToggleSave = (artifactId: string) => {
    if (onToggleBookmark) {
      onToggleBookmark(artifactId);
      return;
    }
    setLocalSavedIds((prev) =>
      prev.includes(artifactId) ? prev.filter((id) => id !== artifactId) : [...prev, artifactId]
    );
  };

  const counts = useMemo(
    () => ({
      all: DOWNLOADABLE_ARTIFACTS.length,
      datasets: DOWNLOADABLE_ARTIFACTS.filter((a) => a.category === 'datasets').length,
      tokenizer: DOWNLOADABLE_ARTIFACTS.filter((a) => a.category === 'tokenizer').length,
      architecture: DOWNLOADABLE_ARTIFACTS.filter((a) => a.category === 'architecture').length
    }),
    []
  );

  const filteredArtifacts = useMemo(() => {
    const q = query.trim().toLowerCase();
    return DOWNLOADABLE_ARTIFACTS.filter((artifact) => {
      if (selectedCategory !== 'all' && artifact.category !== selectedCategory) return false;
      if (!q) return true;
      return (
        artifact.filename.toLowerCase().includes(q) ||
        artifact.title.toLowerCase().includes(q) ||
        artifact.titleKm.toLowerCase().includes(q) ||
        artifact.formatBadge.toLowerCase().includes(q) ||
        artifact.description.toLowerCase().includes(q) ||
        artifact.descriptionKm.toLowerCase().includes(q)
      );
    });
  }, [selectedCategory, query]);

  const handleDownload = (artifact: DownloadableArtifact) => {
    triggerFileDownload(artifact.filename, artifact.content, artifact.mimeType);
    setDownloadedIds((prev) => ({ ...prev, [artifact.id]: true }));
  };

  const handleCopy = async (artifact: DownloadableArtifact) => {
    try {
      await navigator.clipboard.writeText(artifact.content);
      setCopiedId(artifact.id);
      window.setTimeout(() => {
        setCopiedId((prev) => (prev === artifact.id ? null : prev));
      }, 2000);
    } catch {
      // Clipboard API unavailable in restricted context
    }
  };

  const handleDownloadManifestBundle = () => {
    const bundlePayload = {
      project: 'Khmer LLM Starter Kit',
      generated_at: new Date().toISOString(),
      artifact_count: DOWNLOADABLE_ARTIFACTS.length,
      files: DOWNLOADABLE_ARTIFACTS.map((item) => ({
        filename: item.filename,
        category: item.category,
        format: item.formatBadge,
        version: item.version,
        content: item.content
      }))
    };
    triggerFileDownload(
      'khmer-llm-starter-bundle.json',
      JSON.stringify(bundlePayload, null, 2),
      'application/json;charset=utf-8'
    );
    setBundleDownloaded(true);
    window.setTimeout(() => setBundleDownloaded(false), 2500);
  };

  const getCategoryIcon = (category: DownloadableArtifact['category']) => {
    switch (category) {
      case 'datasets':
        return <Database className="w-4 h-4 text-emerald-400 shrink-0" />;
      case 'tokenizer':
        return <Braces className="w-4 h-4 text-cyan-400 shrink-0" />;
      case 'architecture':
        return <Cpu className="w-4 h-4 text-amber-400 shrink-0" />;
    }
  };

  const getCategoryLabel = (category: DownloadableArtifact['category']) => {
    switch (category) {
      case 'datasets':
        return tr('Starter Dataset', 'សំណុំទិន្នន័យចាប់ផ្ដើម');
      case 'tokenizer':
        return tr('Tokenizer Config', 'ការកំណត់ Tokenizer');
      case 'architecture':
        return tr('Model Architecture', 'ស្ថាបត្យកម្មម៉ូដែល');
    }
  };

  return (
    <section
      id="research-downloadables"
      aria-labelledby="downloadables-heading"
      className="pt-6 border-t border-slate-800 space-y-5"
    >
      {/* Section Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <div
            className={`inline-flex items-center gap-2 text-xs font-semibold text-amber-400 tracking-wider ${
              isKm ? 'font-khmer' : 'font-mono uppercase'
            }`}
          >
            <Package className="w-3.5 h-3.5 shrink-0" />
            <span>{tr('PROJECT BOOTSTRAP ARTIFACTS', 'កញ្ចប់ឯកសារចាប់ផ្ដើមគម្រោង')}</span>
            <span aria-hidden="true" className="text-slate-600">
              ·
            </span>
            <span className="tabular-nums">
              {DOWNLOADABLE_ARTIFACTS.length} {tr('READY FILES', 'ឯកសាររួចរាល់')}
            </span>
          </div>
          <h3
            id="downloadables-heading"
            className={`text-xl sm:text-2xl font-bold text-white tracking-tight ${
              isKm ? 'font-khmer' : ''
            }`}
          >
            {tr(
              'Downloadables: Starter Datasets, Tokenizer Configs & Model YAMLs',
              'ផ្នែកទាញយក៖ ទិន្នន័យចាប់ផ្ដើម ការកំណត់ Tokenizer និងឯកសារ YAML ម៉ូដែល'
            )}
          </h3>
          <p className={`text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed ${isKm ? 'font-khmer' : ''}`}>
            {tr(
              'Inspect, copy, or download ready-to-run JSONL starter corpora, SentencePiece/HuggingFace JSON & Protobuf tokenizer configs, and GQA/QLoRA model architecture YAML files.',
              'ពិនិត្យ ចម្លង ឬទាញយកឯកសារ JSONL សម្រាប់ការបណ្តុះបណ្តាល ការកំណត់ SentencePiece/HuggingFace (JSON និង Protobuf) និងឯកសារ YAML ស្ថាបត្យកម្មម៉ូដែល GQA/QLoRA ដើម្បីចាប់ផ្ដើមគម្រោងភ្លាមៗ។'
            )}
          </p>
        </div>

        <button
          type="button"
          onClick={handleDownloadManifestBundle}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors flex items-center gap-2 whitespace-nowrap shrink-0 self-start lg:self-auto ${
            isKm ? 'font-khmer' : 'font-mono'
          } ${
            bundleDownloaded
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
              : 'bg-slate-900 border-slate-700 text-amber-300 hover:bg-slate-800 hover:border-amber-400/50'
          }`}
        >
          {bundleDownloaded ? (
            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          ) : (
            <FileJson className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          )}
          <span>
            {bundleDownloaded
              ? tr('Bundle Exported (.json)', 'បាននាំចេញកញ្ចប់ (.json)')
              : tr('Download All as Bundle (.json)', 'ទាញយកកញ្ចប់ទាំងអស់ (.json)')}
          </span>
        </button>
      </div>

      {/* Category Filter Tabs + Search Input */}
      <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/50 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {(
            [
              { id: 'all', label: tr('All Files', 'ឯកសារទាំងអស់'), count: counts.all },
              { id: 'datasets', label: tr('Starter Datasets', 'ទិន្នន័យចាប់ផ្ដើម'), count: counts.datasets },
              {
                id: 'tokenizer',
                label: tr('Tokenizer (JSON / Protobuf)', 'Tokenizer (JSON / Protobuf)'),
                count: counts.tokenizer
              },
              {
                id: 'architecture',
                label: tr('Architecture YAML', 'ស្ថាបត្យកម្ម YAML'),
                count: counts.architecture
              }
            ] as const
          ).map((tab) => {
            const isActive = selectedCategory === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedCategory(tab.id)}
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

        <div className="relative w-full lg:w-72 shrink-0">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label={tr('Filter downloadable starter files', 'ស្វែងរកឯកសារចាប់ផ្ដើមសម្រាប់ទាញយក')}
            placeholder={tr('Filter by filename or format (yaml, proto...)', 'ស្វែងរកតាមឈ្មោះ ឬទម្រង់ (yaml, proto...)')}
            className={`w-full pl-8 pr-8 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400 transition-colors ${
              isKm ? 'font-khmer' : 'font-mono'
            }`}
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label={tr('Clear artifact filter', 'សម្អាតពាក្យស្វែងរក')}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded text-slate-400 hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Artifact Cards Grid */}
      {filteredArtifacts.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredArtifacts.map((artifact) => {
            const isExpanded = expandedId === artifact.id;
            const isCopied = copiedId === artifact.id;
            const isDownloaded = Boolean(downloadedIds[artifact.id]);
            const isSaved = activeSavedSet.has(artifact.id);
            const lineCount = artifact.content.split('\n').length;
            const sizeLabel = formatByteSize(artifact.content);

            return (
              <div
                key={artifact.id}
                id={`artifact-${artifact.id}`}
                className={`p-5 rounded-2xl border bg-slate-900/50 transition-colors flex flex-col justify-between space-y-4 ${
                  isSaved
                    ? 'border-amber-400/50 hover:border-amber-400/70'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="space-y-3">
                  {/* Top Metadata Strip (clean inline separator style) */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2 min-w-0">
                      {getCategoryIcon(artifact.category)}
                      <span className={`text-xs font-semibold text-slate-200 truncate ${isKm ? 'font-khmer' : ''}`}>
                        {getCategoryLabel(artifact.category)}
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
                      <span aria-hidden="true" className="text-slate-600">
                        ·
                      </span>
                      <span>{artifact.version}</span>
                    </div>
                  </div>

                  {/* Title & Exact Filename */}
                  <div className="space-y-1">
                    <h4 className={`text-base font-bold text-white leading-snug ${isKm ? 'font-khmer' : ''}`}>
                      {isKm ? artifact.titleKm : artifact.title}
                    </h4>
                    <div className="flex items-center gap-2 text-xs font-mono text-cyan-300 truncate">
                      <FileCode2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="truncate">{artifact.filename}</span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className={`text-xs text-slate-300 leading-relaxed ${isKm ? 'font-khmer' : ''}`}>
                    {isKm ? artifact.descriptionKm : artifact.description}
                  </p>

                  {/* Usage Note Line */}
                  <div className={`text-[11px] text-slate-400 ${isKm ? 'font-khmer' : 'font-mono'}`}>
                    {tr('Target:', 'គោលដៅ៖')} {isKm ? artifact.usageNoteKm : artifact.usageNote}
                  </div>
                </div>

                {/* Expandable Code Preview */}
                {isExpanded && (
                  <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden">
                    <div className="px-3 py-1.5 border-b border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <span className="truncate">{artifact.filename}</span>
                      <span className="tabular-nums shrink-0">{artifact.formatBadge}</span>
                    </div>
                    <pre className="p-3 text-[11px] leading-relaxed font-mono text-slate-200 overflow-x-auto max-h-60 overflow-y-auto whitespace-pre">
                      {artifact.content}
                    </pre>
                  </div>
                )}

                {/* Action Row */}
                <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : artifact.id)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs border border-slate-800 bg-slate-950 text-slate-300 hover:text-white hover:border-slate-700 transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                        isKm ? 'font-khmer' : 'font-mono'
                      }`}
                    >
                      {isExpanded ? (
                        <>
                          <EyeOff className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{tr('Hide Preview', 'លាក់មើលជាមុន')}</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                          <span>{tr('Inspect File', 'មើលខ្លឹមសារ')}</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCopy(artifact)}
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

                    <button
                      type="button"
                      aria-pressed={isSaved}
                      onClick={() => handleToggleSave(artifact.id)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs border transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                        isKm ? 'font-khmer' : 'font-mono'
                      } ${
                        isSaved
                          ? 'border-amber-400/60 bg-amber-400/15 text-amber-300 font-bold hover:bg-amber-400/25'
                          : 'border-slate-800 bg-slate-950 text-slate-300 hover:text-amber-300 hover:border-amber-400/40'
                      }`}
                    >
                      {isSaved ? (
                        <BookmarkCheck className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                      ) : (
                        <Bookmark className="w-3.5 h-3.5 shrink-0" />
                      )}
                      <span>{isSaved ? tr('Saved', 'បានរក្សាទុក') : tr('Bookmark', 'រក្សាទុក')}</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDownload(artifact)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                      isKm ? 'font-khmer' : 'font-mono'
                    } ${
                      isDownloaded
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 hover:bg-emerald-500/30'
                        : 'bg-amber-400 text-slate-950 hover:bg-amber-300'
                    }`}
                  >
                    {isDownloaded ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    ) : (
                      <Download className="w-3.5 h-3.5 shrink-0" />
                    )}
                    <span>
                      {isDownloaded
                        ? tr('Downloaded (Save Again)', 'ទាញយករួចរាល់ (ម្ដងទៀត)')
                        : tr('Download', 'ទាញយក')}
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-10 text-center rounded-2xl border border-slate-800 bg-slate-900/30 space-y-3">
          <Package className="w-7 h-7 text-slate-600 mx-auto" />
          <h4 className={`text-sm font-bold text-white ${isKm ? 'font-khmer' : ''}`}>
            {tr('No starter files match your filter', 'គ្មានឯកសារចាប់ផ្ដើមណាមួយត្រូវនឹងការស្វែងរកទេ')}
          </h4>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('all');
              setQuery('');
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold bg-amber-400 text-slate-950 hover:bg-amber-300 transition-colors ${
              isKm ? 'font-khmer' : 'font-mono'
            }`}
          >
            {tr('Show All Starter Files', 'បង្ហាញឯកសារទាំងអស់')}
          </button>
        </div>
      )}
    </section>
  );
};
