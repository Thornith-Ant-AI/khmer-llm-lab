import React, { useMemo, useState } from 'react';
import {
  BookOpen,
  Search,
  Copy,
  Check,
  ArrowRight,
  LayoutGrid,
  Table2,
  X
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export type GlossaryCategory =
  | 'unicode_orthography'
  | 'segmentation'
  | 'corpus_hygiene'
  | 'tokenization_eval'
  | 'linguistics_registers';

export interface KhmerGlossaryTerm {
  id: string;
  term: string;
  termKm: string;
  category: GlossaryCategory;
  unicodeOrSymbol: string;
  definition: string;
  definitionKm: string;
  llmImpact: string;
  llmImpactKm: string;
  example: string;
  exampleNote: string;
  exampleNoteKm: string;
  relatedTab?: string;
  relatedTabLabel?: string;
  relatedTabLabelKm?: string;
}

const KHMER_NLP_GLOSSARY_TERMS: KhmerGlossaryTerm[] = [
  {
    id: 'coeng',
    term: 'Coeng (Subscript Consonant Sign)',
    termKm: 'ជើងព្យញ្ជនៈ (Coeng / ្)',
    category: 'unicode_orthography',
    unicodeOrSymbol: 'U+17D2 (្)',
    definition:
      'An invisible virama-like Khmer control character (KHMER SIGN COENG) that suppresses the inherent vowel and instructs the rendering engine to stack the following consonant beneath the base consonant.',
    definitionKm:
      'តួអក្សរបញ្ជា (U+17D2) ដែលភ្ជាប់ព្យញ្ជនៈបន្ទាប់ឱ្យធ្លាក់ទៅជាជើងនៅក្រោមព្យញ្ជនៈគោល ដើម្បីបង្កើតជាចង្កោមព្យញ្ជនៈផ្សំ។',
    llmImpact:
      'Byte-level BPE tokenizers frequently sever U+17D2 from its base or subscript consonant, producing orphaned dotted-circle tokens (◌្រ) and doubling token sequence lengths unless SentencePiece preserves whole syllable clusters.',
    llmImpactKm:
      'ថូខិនណាយស័រកម្រិតបៃច្រើនតែកាត់ផ្តាច់ U+17D2 ចេញពីព្យញ្ជនៈគោល បង្កើតជាសញ្ញារង្វង់ដាច់ៗ (◌្រ) និងបង្កើនចំនួនថូខិនទ្វេដង ប្រសិនបើ SentencePiece មិនរក្សាចង្កោមព្យាង្គ។',
    example: 'ក + ្ + រ → ក្រ · ព្រះរាជាណាចក្រ',
    exampleNote: 'U+1780 + U+17D2 + U+179A merges into a single visual ligature.',
    exampleNoteKm: 'U+1780 + U+17D2 + U+179A រួមបញ្ចូលគ្នាជាតួអក្សរភ្ជាប់តែមួយ។',
    relatedTab: 'tokenizer-lab',
    relatedTabLabel: 'Inspect in Tokenizer Lab',
    relatedTabLabelKm: 'ពិនិត្យក្នុងថូខិនណាយស័រ'
  },
  {
    id: 'scriptio-continua',
    term: 'Scriptio Continua',
    termKm: 'សំណេរជាប់គ្នាគ្មានដកឃ្លា (Scriptio Continua)',
    category: 'segmentation',
    unicodeOrSymbol: 'No Inter-Word Spaces',
    definition:
      'An orthographic convention in Khmer where lexical words are written continuously without spaces. Visible spaces (U+0020) denote phrase boundaries, clause pauses, or list separations rather than individual word boundaries.',
    definitionKm:
      'ប្រព័ន្ធសំណេរខ្មែរដែលសរសេរពាក្យជាប់ៗគ្នាដោយគ្មានដកឃ្លារវាងពាក្យ។ ចន្លោះដកឃ្លា (U+0020) ប្រើសម្រាប់បំបែកឃ្លា ឬការឈប់ដកដង្ហើម មិនមែនសម្រាប់បំបែកពាក្យនីមួយៗឡើយ។',
    llmImpact:
      'Whitespace-based pre-tokenizers (such as naive regex word splitters) treat entire Khmer clauses as single mega-words, causing OOV explosions, distorted vocabulary frequency counts, and poor subword merges.',
    llmImpactKm:
      'កម្មវិធីបំបែកពាក្យដែលពឹងផ្អែកលើដកឃ្លា នឹងមើលឃើញល្បះខ្មែរទាំងមូលដូចជាពាក្យវែងតែមួយ ដែលធ្វើឱ្យការបង្កើតវាក្យសព្ទ SentencePiece មិនមានប្រសិទ្ធភាព។',
    example: 'រាជរដ្ឋាភិបាលកម្ពុជាបានប្រកាសផែនការជាតិ',
    exampleNote: '6 distinct lexical words written with zero spaces.',
    exampleNoteKm: 'ពាក្យចំនួន ៦ ផ្សេងគ្នាសរសេរជាប់គ្នាដោយគ្មានដកឃ្លា។',
    relatedTab: 'tokenizer-lab',
    relatedTabLabel: 'Test Segmentation',
    relatedTabLabelKm: 'សាកល្បងការបំបែកព្យាង្គ'
  },
  {
    id: 'zwsp',
    term: 'Zero-Width Space (ZWSP)',
    termKm: 'ចន្លោះទទឹងសូន្យ (ZWSP / U+200B)',
    category: 'unicode_orthography',
    unicodeOrSymbol: 'U+200B',
    definition:
      'An invisible Unicode formatting character historically injected between Khmer words by browsers, LibreOffice, and desktop publishers to assist automatic line wrapping.',
    definitionKm:
      'តួអក្សរមើលមិនឃើញ (U+200B) ដែលកម្មវិធីវាយអត្ថបទ ឬគេហទំព័របញ្ចូលនៅចន្លោះពាក្យខ្មែរ ដើម្បីជួយឱ្យងាយស្រួលចុះបន្ទាត់ដោយស្វ័យប្រវត្តិ។',
    llmImpact:
      'Inconsistent presence of U+200B across scraped documents fragments identical words into distinct token sequences (e.g., "ភាសាខ្មែរ" vs "ភាសា\\u200Bខ្មែរ"), hurting embedding sharing and BM25 retrieval unless stripped uniformly.',
    llmImpactKm:
      'វត្តមានមិនស្មើគ្នានៃ U+200B ក្នុងទិន្នន័យវេប ធ្វើឱ្យពាក្យដូចគ្នាបំបែកជាថូខិនខុសគ្នា ដែលបន្ថយគុណភាព Embedding និងការស្វែងរក BM25 ប្រសិនបើមិនលុបចោលឱ្យស្មើគ្នា។',
    example: 'ភាសា[U+200B]ខ្មែរ ≠ ភាសាខ្មែរ',
    exampleNote: 'Visually identical to humans, but byte-distinct to models.',
    exampleNoteKm: 'មើលដោយភ្នែកដូចគ្នា ប៉ុន្តែមានកូដបៃខុសគ្នាសម្រាប់ម៉ូដែល AI។',
    relatedTab: 'cleaner-sim',
    relatedTabLabel: 'Audit Hygiene Rules',
    relatedTabLabelKm: 'ពិនិត្យក្នុងកម្មវិធីសម្អាត'
  },
  {
    id: 'zwj-zwnj',
    term: 'Zero-Width Joiner & Non-Joiner (ZWJ / ZWNJ)',
    termKm: 'តួអក្សរភ្ជាប់ និងផ្តាច់ទទឹងសូន្យ (ZWJ / ZWNJ)',
    category: 'unicode_orthography',
    unicodeOrSymbol: 'U+200D / U+200C',
    definition:
      'Invisible Unicode joiner controls used to force ligature shaping (ZWJ, U+200D) or intentionally block Coeng subscript stacking between adjacent consonants (ZWNJ, U+200C).',
    definitionKm:
      'តួអក្សរបញ្ជាមើលមិនឃើញសម្រាប់បង្ខំឱ្យភ្ជាប់អក្សរ (ZWJ U+200D) ឬទប់ស្កាត់ការធ្លាក់ជើងព្យញ្ជនៈ (ZWNJ U+200C)។',
    llmImpact:
      'Web crawls frequently contain stray ZWJ/ZWNJ bytes pasted from PDFs or social media posts, creating adversarial tokenization mismatches and polluting model vocabularies with ghost sequences.',
    llmImpactKm:
      'ទិន្នន័យពី PDF ឬបណ្តាញសង្គមច្រើនមាន ZWJ/ZWNJ លើស ដែលបង្កើតភាពមិនស៊ីគ្នានៃថូខិន និងបំពុលវាក្យសព្ទម៉ូដែល។',
    example: 'ក + ្ + [U+200C] + រ',
    exampleNote: 'ZWNJ breaks standard Coeng ligature formation.',
    exampleNoteKm: 'ZWNJ រារាំងការបង្កើតជើងព្យញ្ជនៈតាមទម្រង់ស្តង់ដារ។',
    relatedTab: 'cleaner-sim',
    relatedTabLabel: 'Open Corpus Cleaner',
    relatedTabLabelKm: 'បើកកម្មវិធីសម្អាត'
  },
  {
    id: 'dependent-vowel',
    term: 'Dependent Vowel Signs (Srak Nissay)',
    termKm: 'ស្រៈនិស្ស័យ (Dependent Vowels)',
    category: 'unicode_orthography',
    unicodeOrSymbol: 'U+17B6 – U+17C5',
    definition:
      'Combining vocalic glyphs that cannot stand independently and attach to the right, left, top, bottom, or wrap around a consonant base (including split surround vowels like េ...ា → ោ / ៅ).',
    definitionKm:
      'ស្រៈផ្សំដែលមិនអាចឈរតែឯងបាន ហើយត្រូវភ្ជាប់នៅខាងស្តាំ ឆ្វេង លើ ក្រោម ឬព័ទ្ធជុំវិញព្យញ្ជនៈគោល (ដូចជា េ...ា → ោ / ៅ)។',
    llmImpact:
      'Because visual split vowels render glyphs on both sides of a consonant even though Unicode stores them after the consonant, OCR models and naive string processors often invert codepoint order.',
    llmImpactKm:
      'ដោយសារស្រៈព័ទ្ធជុំវិញបង្ហាញរូបភាពនៅសងខាងព្យញ្ជនៈ កម្មវិធី OCR ចាស់ៗច្រើនតែរៀបលំដាប់កូដ Unicode បញ្ច្រាសខុសពីលំដាប់តក្កវិជ្ជា។',
    example: 'ក + ោ (U+17C4) · ម + ើ (U+17BE)',
    exampleNote: 'Single Unicode codepoint U+17C4 renders glyphs both left and right of ក.',
    exampleNoteKm: 'កូដ U+17C4 តែមួយបង្ហាញរូបស្រៈទាំងឆ្វេង និងស្តាំនៃតួ ក។',
    relatedTab: 'tokenizer-lab',
    relatedTabLabel: 'Highlight Vowels Live',
    relatedTabLabelKm: 'មើលពណ៌ស្រៈផ្ទាល់'
  },
  {
    id: 'independent-vowel',
    term: 'Independent Vowels (Srak Penhtour)',
    termKm: 'ស្រៈពេញតួ (Independent Vowels)',
    category: 'unicode_orthography',
    unicodeOrSymbol: 'U+17A3 – U+17B3',
    definition:
      'Standalone Khmer vocalic letters (such as ឥ, ឧ, ឪ, ឫ, ឯ, ឱ, ឳ) primarily inherited from Pali and Sanskrit loans that function as complete syllable nuclei without a consonant host.',
    definitionKm:
      'តួស្រៈឯករាជ្យ (ដូចជា ឥ, ឧ, ឪ, ឫ, ឯ, ឱ, ឳ) ដែលភាគច្រើនមានប្រភពពីភាសាបាលី និងសំស្ក្រឹត ហើយអាចឈរជាព្យាង្គពេញលេញដោយគ្មានព្យញ្ជនៈគោល។',
    llmImpact:
      'Rare independent vowels (ឰ, ឳ, ឭ, ឮ) often drop below min-frequency cutoffs during small vocabulary training, causing fatal <unk> tokens unless character_coverage >= 0.9995 is enforced.',
    llmImpactKm:
      'ស្រៈពេញតួកម្រ (ឰ, ឳ, ឭ, ឮ) អាចធ្លាក់ចេញពីវាក្យសព្ទ បង្កឱ្យចេញថូខិន <unk> ប្រសិនបើមិនកំណត់ character_coverage >= 0.9995។',
    example: 'ឱកាស · ឯកសារ · ឧត្តមសិក្សា · ឫស្សី',
    exampleNote: 'Direct vocalic word stems in formal and literary Khmer.',
    exampleNoteKm: 'ឫសពាក្យស្រៈពេញតួក្នុងភាសាផ្លូវការ និងអក្សរសិល្ប៍។'
  },
  {
    id: 'khmer-diacritics',
    term: 'Register & Orthographic Diacritics',
    termKm: 'វណ្ណយុត្ត និងសញ្ញាផ្លាស់ប្តូរសំឡេង',
    category: 'unicode_orthography',
    unicodeOrSymbol: 'U+17C6 – U+17D3',
    definition:
      'Combining marks that shift consonant register (Muusikatoan ៉ / Triisap ៊), shorten syllables (Bantoc ់), add nasalization (Nikahit ំ), or silence final Pali-Sanskrit consonants (Toandakhiat ៍, Robat ៌).',
    definitionKm:
      'សញ្ញាបន្ថែមសម្រាប់ប្តូរសំឡេងព្យញ្ជនៈ (៉ / ៊) បន្តក់សំឡេង (់) បន្ថែមសំឡេងច្រមុះ (ំ) ឬបំបាត់សំឡេងព្យញ្ជនៈចុងពាក្យបាលី-សំស្ក្រឹត (៍, ៌)។',
    llmImpact:
      'Muusikatoan (៉) paired with upper vowels like ិ/ី/ឹ/ឺ transforms visually into the same glyph shape as ុ (Srak U) in many fonts, causing subtle visual-vs-codepoint corruption in OCR corpora.',
    llmImpactKm:
      'សញ្ញាធ្មេញកណ្តុរ (៉) នៅពេលផ្សំជាមួយស្រៈលើ ិ/ី ប្រែរូបរាងស្រដៀងនឹងស្រៈ ុ ក្នុងពុម្ពអក្សរមួយចំនួន ដែលបង្កកំហុស OCR ញឹកញាប់។',
    example: 'ប៉ុន្តែ · សម្ព័ន្ធ · អភិវឌ្ឍន៍ · ធម៌',
    exampleNote: 'Toandakhiat (៍) and Robat (៌) preserve etymological Pali/Sanskrit spelling.',
    exampleNoteKm: 'ទណ្ឌឃាត (៍) និងរេផៈ (៌) រក្សាអក្ខរាវិរុទ្ធដើមពីបាលី-សំស្ក្រឹត។'
  },
  {
    id: 'unicode-canonical-order',
    term: 'Canonical Logical Ordering (NFC / TR31)',
    termKm: 'លំដាប់កូដ Unicode ស្តង់ដារ (NFC / TR31)',
    category: 'corpus_hygiene',
    unicodeOrSymbol: 'C + (្C)* + V + D',
    definition:
      'The strict sequence mandated by Unicode Technical Report #31 and the Cambodian National Standard: Base Consonant → Coeng stack(s) → Dependent Vowel → Diacritics.',
    definitionKm:
      'លំដាប់កូដត្រឹមត្រូវតាមស្តង់ដារជាតិកម្ពុជា និង Unicode TR31៖ ព្យញ្ជនៈគោល → ជើងព្យញ្ជនៈ → ស្រៈនិស្ស័យ → វណ្ណយុត្ត។',
    llmImpact:
      'Because legacy IMEs permitted typing vowels before Coeng subscripts (producing identical visual output with swapped bytes), canonical reordering before MinHash deduplication significantly improves corpus purity.',
    llmImpactKm:
      'ក្តារចុចចាស់ៗអនុញ្ញាតឱ្យវាយស្រៈមុនជើងព្យញ្ជនៈ ដែលមើលទៅដូចគ្នាប៉ុន្តែមានបៃខុសគ្នា។ ការតម្រៀបលំដាប់ឡើងវិញជួយបង្កើនប្រសិទ្ធភាពលុបទិន្នន័យស្ទួន។',
    example: 'ព្រ + ា + ំ (Canonical) ≠ ព + ា + ំ + ្រ (Swapped)',
    exampleNote: 'Both may look nearly identical in older fonts, yet hash differently.',
    exampleNoteKm: 'ទាំងពីរមើលទៅដូចគ្នា ប៉ុន្តែមានតម្លៃ Hash ខុសគ្នា។',
    relatedTab: 'roadmap',
    relatedTabLabel: 'View Normalization Recipe',
    relatedTabLabelKm: 'មើលរូបមន្តស្តង់ដារកូដ'
  },
  {
    id: 'limon-legacy-encoding',
    term: 'Limon / ABC Legacy ASCII Fonts',
    termKm: 'ពុម្ពអក្សរ Limon / ABC ចាស់ (Non-Unicode)',
    category: 'corpus_hygiene',
    unicodeOrSymbol: 'ASCII Hack (GñkEdl)',
    definition:
      'Pre-Unicode font encodings from the 1990s–2000s that mapped Khmer glyph shapes onto standard Latin ASCII keys (e.g., typing "Gñk" with Limon font displays "អ្នក").',
    definitionKm:
      'ប្រព័ន្ធពុម្ពអក្សរជំនាន់មុន Unicode ដែលយកតួអក្សរឡាតាំង ASCII មកគូរជារូបអក្សរខ្មែរ (ឧ. វាយ "Gñk" ក្នុងពុម្ពអក្សរ Limon បង្ហាញជា "អ្នក")។',
    llmImpact:
      'Thousands of older Cambodian legal PDFs and web pages extract as raw Limon ASCII gibberish; ingesting them without detection/transcoding poisons LLM pretraining embeddings.',
    llmImpactKm:
      'ឯកសារ PDF ច្បាប់ និងគេហទំព័រចាស់ៗជាច្រើនទាញចេញមកជាអក្សរ ASCII ឆ្កួតៗ។ ប្រសិនបើមិនច្រោះ ឬបម្លែងទេ វានឹងបំពុលការបង្វឹកម៉ូដែល។',
    example: 'GñkEdlRBH → អ្នកដែលព្រះ',
    exampleNote: 'Heuristic detectors flag n-grams like Gñk, Edl, RBH, mYy, rbs;.',
    exampleNoteKm: 'ឧបករណ៍ច្រោះសម្គាល់ពាក្យដូចជា Gñk, Edl, RBH, mYy, rbs;។',
    relatedTab: 'cleaner-sim',
    relatedTabLabel: 'Test Limon Detector',
    relatedTabLabelKm: 'សាកល្បងច្រោះ Limon'
  },
  {
    id: 'khmer-syllable-cluster',
    term: 'Phonological Syllable Cluster',
    termKm: 'ចង្កោមព្យាង្គ (Syllable Cluster)',
    category: 'segmentation',
    unicodeOrSymbol: 'C(្C)*V*D*',
    definition:
      'The smallest indivisible orthographic cluster in Khmer script that renders safely as a self-contained grapheme unit—bigger than a codepoint, smaller than multi-syllabic words.',
    definitionKm:
      'ឯកតាអក្ខរាវិរុទ្ធតូចបំផុតដែលមិនអាចកាត់ផ្តាច់បានក្នុងអក្សរខ្មែរ ដែលរួមបញ្ចូលព្យញ្ជនៈគោល ជើង ស្រៈ និងវណ្ណយុត្ត។',
    llmImpact:
      'Splitting RAG chunks, sliding windows, or token offsets along syllable cluster boundaries guarantees zero broken ligatures (◌្) and sharply improves dense retrieval fidelity.',
    llmImpactKm:
      'ការកាត់កង់អត្ថបទ RAG តាមព្រំដែនចង្កោមព្យាង្គ ធានាថាមិនដាច់ជើងព្យញ្ជនៈ (◌្) និងបង្កើនភាពត្រឹមត្រូវនៃការស្វែងរក Vector។',
    example: 'សា · កល · វិ · ទ្យា · ល័យ (5 clusters)',
    exampleNote: 'Safe atomic boundaries for chunking and pre-tokenization.',
    exampleNoteKm: 'ព្រំដែនសុវត្ថិភាពសម្រាប់ការកាត់កង់ និងបំបែកថូខិន។',
    relatedTab: 'synthetic',
    relatedTabLabel: 'Inspect RAG Chunking',
    relatedTabLabelKm: 'ពិនិត្យការកាត់កង់ RAG'
  },
  {
    id: 'khan-bariyoosan',
    term: 'Khan (។) & Bariyoosan (៕) Punctuation',
    termKm: 'ខណ្ឌ (។) បរិយោសាន (៕) និងលេខទោ (ៗ)',
    category: 'segmentation',
    unicodeOrSymbol: 'U+17D4 – U+17D7',
    definition:
      'Traditional Khmer punctuation marks: Khan (។) terminates sentences or cohesive thoughts, Bariyoosan (៕) marks the conclusion of a book or decree, and Lek Too (ៗ) indicates lexical reduplication.',
    definitionKm:
      'វណ្ណយុត្តិប្រពៃណីខ្មែរ៖ ខណ្ឌ (។) បញ្ចប់ល្បះ ឬគំនិត, បរិយោសាន (៕) បញ្ចប់អត្ថបទ ឬគម្ពីរ, និងលេខទោ (ៗ) សម្រាប់ផ្ទួនពាក្យ។',
    llmImpact:
      'Sentence splitters and <eos> document packers relying solely on ASCII periods (.) miss Khmer sentence boundaries entirely; Lek Too (ៗ) must stay attached to its preceding stem during tokenization.',
    llmImpactKm:
      'ប្រព័ន្ធកាត់ល្បះដែលស្គាល់តែសញ្ញាចុច (.) នឹងខកខានមិនដឹងព្រំដែនល្បះខ្មែរឡើយ ហើយសញ្ញា ៗ ត្រូវរក្សាភ្ជាប់នឹងពាក្យមុខវា។',
    example: 'ផ្សេងៗ (reduplication) · កម្ពុជា។',
    exampleNote: 'Khan acts as the primary sentence-boundary anchor.',
    exampleNoteKm: 'ខណ្ឌ (។) ដើរតួជាសញ្ញាបញ្ចប់ល្បះចម្បងក្នុងភាសាខ្មែរ។'
  },
  {
    id: 'minhash-lsh-dedup',
    term: 'MinHash LSH Deduplication',
    termKm: 'ការលុបទិន្នន័យស្ទួនដោយ MinHash LSH',
    category: 'corpus_hygiene',
    unicodeOrSymbol: 'Jaccard >= 0.80',
    definition:
      'Probabilistic Locality-Sensitive Hashing over overlapping syllable/character n-gram shingles used to cluster and remove near-identical web articles at billion-token scale.',
    definitionKm:
      'ក្បួនដោះស្រាយ Hash ប្រូបាប៊ីលីតេលើក្រុមព្យាង្គ n-gram ដើម្បីស្វែងរក និងលុបអត្ថបទព័ត៌មានដែលចម្លងស្រដៀងគ្នាចេញពីឃ្លាំងទិន្នន័យធំ។',
    llmImpact:
      'Cambodian news portals heavily cross-publish identical government announcements; without fuzzy MinHash deduplication, LLMs overfit on duplicate phrases and suffer severe perplexity collapse.',
    llmImpactKm:
      'គេហទំព័រព័ត៌មានខ្មែរជាច្រើនចុះផ្សាយសេចក្តីជូនដំណឹងដូចគ្នាៗ។ បើមិនលុបទិន្នន័យស្ទួនទេ ម៉ូដែល LLM នឹងទន្ទេញចាំពាក្យដដែលៗ។',
    example: '128 permutations · 5-syllable shingles',
    exampleNote: 'Applied after Unicode NFC normalization and Limon stripping.',
    exampleNoteKm: 'អនុវត្តបន្ទាប់ពីតម្រៀបកូដ Unicode NFC និងលុបអក្សរ Limon រួច។',
    relatedTab: 'data-matrix',
    relatedTabLabel: 'See Data Tier Matrix',
    relatedTabLabelKm: 'មើលម៉ាទ្រីសទិន្នន័យ'
  },
  {
    id: 'token-fertility-rate',
    term: 'Token Fertility Rate (TFR)',
    termKm: 'អត្រាបំបែកថូខិនក្នុងមួយពាក្យ (TFR)',
    category: 'tokenization_eval',
    unicodeOrSymbol: 'Tokens / Word',
    definition:
      'The average number of tokens generated per natural linguistic word. Lower fertility indicates cleaner morphological alignment and higher information density per token.',
    definitionKm:
      'ចំនួនថូខិនជាមធ្យមដែលត្រូវការដើម្បីតំណាងឱ្យពាក្យមួយ។ តម្លៃ TFR ទាបបង្ហាញពីការបង្រួមវាក្យសព្ទល្អ និងប្រសិទ្ធភាពខ្ពស់។',
    llmImpact:
      'Western LLMs incur a "Khmer Token Tax" (TFR ~6.5 vs English ~1.3), burning 4x–5x more GPU FLOPs, VRAM KV-cache, and API dollars for equivalent semantic content.',
    llmImpactKm:
      'ម៉ូដែលលោកខាងលិចមាន TFR ខ្ពស់ដល់ ~6.5 លើភាសាខ្មែរ (ធៀបនឹងអង់គ្លេស ~1.3) ដែលស៊ីកម្លាំង GPU និងអង្គចងចាំច្រើនជាង ៤ ទៅ ៥ ដង។',
    example: 'LLaMA-3: ~6.8 tok/word · Khmer SPM: ~1.5 tok/word',
    exampleNote: '4.2x effective context window expansion in 4k/8k training.',
    exampleNoteKm: 'ពង្រីកសមត្ថភាពផ្ទុកបរិបទ 4k/8k បានប្រសើរជាង 4.2 ដង។',
    relatedTab: 'tokenizer-lab',
    relatedTabLabel: 'Benchmark Fertility',
    relatedTabLabelKm: 'វាស់ស្ទង់អត្រា TFR'
  },
  {
    id: 'sentencepiece-byte-fallback',
    term: 'SentencePiece Byte-Fallback',
    termKm: 'ការបំបែកបៃបម្រុង SentencePiece (Byte-Fallback)',
    category: 'tokenization_eval',
    unicodeOrSymbol: '<0xE1><0x9E><0x80>',
    definition:
      'A fallback mechanism encoding any out-of-vocabulary Unicode character into raw 1-byte UTF-8 hex pieces (<0x00>–<0xFF>) so no input ever collapses to <unk>.',
    definitionKm:
      'យន្តការបម្រុងដែលបម្លែងតួអក្សរក្រៅវាក្យសព្ទទៅជាបៃ UTF-8 ដើម (<0x00>–<0xFF>) ដើម្បីចៀសវាងការបាត់បង់ទិន្នន័យទៅជា <unk>។',
    llmImpact:
      'Essential safeguard for rare Khmer lunar calendar glyphs (U+19E0–U+19FF), Sanskrit combinations, mathematical symbols, and code snippets without losing round-trip exactness.',
    llmImpactKm:
      'ចាំបាច់សម្រាប់រក្សាភាពត្រឹមត្រូវ ១០០% ពេលជួបសញ្ញាប្រតិទិនខ្មែរកម្រ ពាក្យសំស្ក្រឹត ឬកូដកម្មវិធីផ្សេងៗ។',
    example: 'ក (U+1780) → UTF-8 [E1, 9E, 80]',
    exampleNote: 'Lossless 3-byte fallback prevents <unk> token drops on rare glyphs.',
    exampleNoteKm: 'ការបម្លែងបៃ ៣ តួរក្សាភាពត្រឹមត្រូវដោយគ្មានថូខិន <unk>។'
  },
  {
    id: 'chinchilla-khmer-ratio',
    term: 'Chinchilla & Multilingual Replay Ratio',
    termKm: 'សមាមាត្រ Chinchilla និងល្បាយពហុភាសា',
    category: 'tokenization_eval',
    unicodeOrSymbol: 'D ≈ 20–30 × N',
    definition:
      'Compute-optimal scaling principle relating parameter scale (N) to total training tokens (D). In low-resource languages, paired with English/Code replay to avoid catastrophic forgetting.',
    definitionKm:
      'គោលការណ៍កំណត់តុល្យភាពរវាងទំហំប៉ារ៉ាម៉ែត្រ (N) និងបរិមាណថូខិន (D) ដោយលាយជាមួយភាសាអង់គ្លេស និងកូដដើម្បីរក្សាសមត្ថភាពវែកញែក។',
    llmImpact:
      'Pure monolingual Khmer pretraining often stalls on STEM reasoning due to data scarcity; a 60% Khmer + 40% English/Code/Math blend yields stronger reasoning transfer at 1.5B–3B scale.',
    llmImpactKm:
      'ការប្រើល្បាយទិន្នន័យ ខ្មែរ ៦០% + អង់គ្លេស/កូដ/គណិតវិទ្យា ៤០% ជួយឱ្យម៉ូដែលទំហំ 1.5B–3B មានភាពវៃឆ្លាតផ្នែកតក្កវិជ្ជាខ្ពស់ជាងទិន្នន័យខ្មែរសុទ្ធ។',
    example: '1.5B Params × 30× = 45B Balanced Tokens',
    exampleNote: '27B Khmer + 18B English/Code transfer mix for balanced reasoning.',
    exampleNoteKm: 'ល្បាយ 27B ខ្មែរ + 18B អង់គ្លេស/កូដ សម្រាប់តក្កវិជ្ជារឹងមាំ។',
    relatedTab: 'scaling-calc',
    relatedTabLabel: 'Compute Scaling Engine',
    relatedTabLabelKm: 'គណនាមាត្រដ្ឋាន GPU'
  },
  {
    id: 'consonant-series',
    term: 'A-Series vs. O-Series Consonant Register',
    termKm: 'ព្យញ្ជនៈពួក «អ» និងពួក «អ៊» (សំឡេង២ពួក)',
    category: 'linguistics_registers',
    unicodeOrSymbol: 'ក (a) · គ (o)',
    definition:
      'Khmer consonants divide into two phonological series—First Series (A-group) and Second Series (O-group)—which deterministically govern the pronunciation of every attached dependent vowel.',
    definitionKm:
      'ព្យញ្ជនៈខ្មែរទាំង ៣៣ តួចែកជាពីរពួកគឺ ពួក «អ» និងពួក «អ៊» ដែលកំណត់ការបញ្ចេញសំឡេងរបស់ស្រៈនិស្ស័យទាំងអស់ដែលភ្ជាប់ជាមួយ។',
    llmImpact:
      'Explains common phonetic homophone typos in Khmer social media (e.g., substituting ក vs គ or ស vs ហ) and is fundamental for Khmer ASR, TTS, and noisy prompt normalization.',
    llmImpactKm:
      'ពន្យល់ពីកំហុសវាយអក្សរតាមសំឡេងស្រដៀងគ្នានៅលើបណ្តាញសង្គម និងមានសារៈសំខាន់សម្រាប់ម៉ូដែលសំឡេង ASR/TTS និងការកែអក្ខរាវិរុទ្ធ។',
    example: 'កា (/kaː/) vs គា (/kiə/)',
    exampleNote: 'Identical vowel sign ា produces two distinct vowel qualities.',
    exampleNoteKm: 'ស្រៈ ា ដូចគ្នា ប៉ុន្តែបញ្ចេញសំឡេងខុសគ្នាអាស្រ័យលើពួកព្យញ្ជនៈ។'
  },
  {
    id: 'honorific-registers',
    term: 'Social Honorific Registers (Reachasap & Sanghasap)',
    termKm: 'កម្រិតភាសាគោរព (រាជសព្ទ និងសង្ឃសព្ទ)',
    category: 'linguistics_registers',
    unicodeOrSymbol: '4 Lexical Tiers',
    definition:
      'Distinct vocabulary sets mandated by Cambodian cultural hierarchy across Royal court language (Reachasap), Buddhist monastic clergy (Sanghasap), Formal Civic (Khpous), and Peer speech (Thommada).',
    definitionKm:
      'ប្រព័ន្ធវាក្យសព្ទបែងចែកតាមឋានៈសង្គមកម្ពុជា រួមមាន រាជសព្ទ (ព្រះមហាក្សត្រ) សង្ឃសព្ទ (ព្រះសង្ឃ) ភាសាខ្ពស់ផ្លូវការ និងភាសាសាមញ្ញ។',
    llmImpact:
      'Generic synthetic SFT corpora often flatten all speech into peer-level verbs, causing culturally inappropriate responses when answering questions about monks or Cambodian royal institutions.',
    llmImpactKm:
      'ទិន្នន័យ SFT ទូទៅច្រើនប្រើពាក្យសាមញ្ញលាយឡំ ដែលនាំឱ្យម៉ូដែលឆ្លើយខុសសុជីវធម៌នៅពេលនិយាយអំពីព្រះសង្ឃ ឬព្រះរាជវង្ស។',
    example: 'ញ៉ាំ (peer) → ពិសា (formal) → ឆាន់ (monk) → សោយ (royal)',
    exampleNote: 'Four completely different verbs for the single English concept "to eat".',
    exampleNoteKm: 'កិរិយាសព្ទ ៤ ផ្សេងគ្នាសម្រាប់អត្ថន័យ "បរិភោគ" អាស្រ័យលើកម្រិតភាសា។',
    relatedTab: 'registers',
    relatedTabLabel: 'Explore Register Guide',
    relatedTabLabelKm: 'សិក្សាកម្រិតភាសា'
  },
  {
    id: 'translationese-calques',
    term: 'Western Translationese & Passive Calques',
    termKm: 'ភាសាបកប្រែត្រង់តាមបរទេស (Translationese)',
    category: 'linguistics_registers',
    unicodeOrSymbol: 'ត្រូវបាន... Calque',
    definition:
      'Artificial Khmer phrasing copied structurally from English—marked by repetitive passive "ត្រូវបាន" clauses, literal greetings ("អរុណសួស្តី"), and Western cultural assumptions.',
    definitionKm:
      'ទម្រង់ប្រយោគខ្មែរមិនធម្មជាតិដែលបកប្រែត្រង់តាមវេយ្យាករណ៍អង់គ្លេស ដូចជាការប្រើពាក្យ «ត្រូវបាន» ច្រើនហួសហេតុ ឬពាក្យ «អរុណសួស្តី»។',
    llmImpact:
      'Training SFT models on unedited machine-translated English instruction datasets degrades natural Khmer syntax and introduces jarring cultural mismatches.',
    llmImpactKm:
      'ការបង្វឹក SFT លើទិន្នន័យបកប្រែដោយម៉ាស៊ីនធ្វើឱ្យម៉ូដែលនិយាយភាសាខ្មែររឹងកំព្រឹស មិនដូចភាសាធម្មជាតិរបស់ជនជាតិខ្មែរ។',
    example: 'Natural: រដ្ឋាភិបាលបានប្រកាស · Calque: សេចក្តីប្រកាសត្រូវបានធ្វើឡើងដោយ...',
    exampleNote: 'Natural Khmer strongly prefers active voice with topicalized subjects.',
    exampleNoteKm: 'ភាសាខ្មែរធម្មជាតិនិយមប្រើល្បះសកម្មដែលមានប្រធានច្បាស់លាស់។',
    relatedTab: 'synthetic',
    relatedTabLabel: 'Run Cultural Bias Audit',
    relatedTabLabelKm: 'ត្រួតពិនិត្យភាពលំអៀង'
  }
];

interface KhmerNlpGlossaryProps {
  onNavigate?: (tabId: string) => void;
}

export const KhmerNlpGlossary: React.FC<KhmerNlpGlossaryProps> = ({ onNavigate }) => {
  const { isKm, tr } = useLanguage();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<GlossaryCategory | 'all'>('all');
  const [layoutMode, setLayoutMode] = useState<'cards' | 'table'>('cards');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories: { id: GlossaryCategory | 'all'; label: string; labelKm: string }[] = [
    { id: 'all', label: 'All Terms', labelKm: 'ពាក្យទាំងអស់' },
    { id: 'unicode_orthography', label: 'Unicode & Orthography', labelKm: 'យូនីកូដ និងអក្ខរាវិរុទ្ធ' },
    { id: 'segmentation', label: 'Segmentation & Syllables', labelKm: 'ការបំបែកព្យាង្គ' },
    { id: 'corpus_hygiene', label: 'Corpus Hygiene', labelKm: 'អនាម័យទិន្នន័យ' },
    { id: 'tokenization_eval', label: 'Tokenization & Scaling', labelKm: 'ថូខិន និងមាត្រដ្ឋាន' },
    { id: 'linguistics_registers', label: 'Registers & Pragmatics', labelKm: 'កម្រិតភាសា និងវប្បធម៌' }
  ];

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: KHMER_NLP_GLOSSARY_TERMS.length };
    KHMER_NLP_GLOSSARY_TERMS.forEach((t) => {
      counts[t.category] = (counts[t.category] || 0) + 1;
    });
    return counts;
  }, []);

  const filteredTerms = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return KHMER_NLP_GLOSSARY_TERMS.filter((item) => {
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }
      if (!q) return true;
      return (
        item.term.toLowerCase().includes(q) ||
        item.termKm.toLowerCase().includes(q) ||
        item.unicodeOrSymbol.toLowerCase().includes(q) ||
        item.definition.toLowerCase().includes(q) ||
        item.definitionKm.toLowerCase().includes(q) ||
        item.llmImpact.toLowerCase().includes(q) ||
        item.llmImpactKm.toLowerCase().includes(q) ||
        item.example.toLowerCase().includes(q)
      );
    });
  }, [searchQuery, selectedCategory]);

  const categoryLabel = (cat: GlossaryCategory) => {
    const found = categories.find((c) => c.id === cat);
    return found ? (isKm ? found.labelKm : found.label) : cat;
  };

  const handleCopyTerm = (item: KhmerGlossaryTerm) => {
    const text = isKm
      ? `${item.termKm} (${item.unicodeOrSymbol})\nនិយមន័យ៖ ${item.definitionKm}\nផលប៉ះពាល់លើ LLM៖ ${item.llmImpactKm}\nឧទាហរណ៍៖ ${item.example}`
      : `${item.term} (${item.unicodeOrSymbol})\nDefinition: ${item.definition}\nLLM Impact: ${item.llmImpact}\nExample: ${item.example}`;
    navigator.clipboard.writeText(text);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId((prev) => (prev === item.id ? null : prev)), 1800);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider font-mono">
          <span>{tr('FOUNDATIONAL REFERENCE', 'ឯកសារយោងមូលដ្ឋាន')}</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span>{tr('KHMER SCRIPT & UNICODE ENGINEERING', 'អក្សរខ្មែរ និងវិស្វកម្មយូនីកូដ')}</span>
        </div>
        <h2 className={`text-2xl sm:text-3xl font-bold text-white tracking-tight ${isKm ? 'font-khmer leading-relaxed' : ''}`}>
          {tr('Khmer NLP & Script Processing Glossary', 'សទ្ទានុក្រមបច្ចេកទេស Khmer NLP និងការដំណើរការអក្សរខ្មែរ')}
        </h2>
        <p className={`text-sm text-slate-300 max-w-3xl leading-relaxed ${isKm ? 'font-khmer' : ''}`}>
          {tr(
            'Clear technical definitions, Unicode codepoints, and practical LLM engineering implications for Coeng subscript stacks, zero-width controls, scriptio continua segmentation, and Khmer honorific registers.',
            'និយមន័យបច្ចេកទេស កូដ Unicode និងផលប៉ះពាល់ជាក់ស្តែងក្នុងការបង្កើតម៉ូដែល Khmer LLM សម្រាប់ជើងព្យញ្ជនៈ Coeng តួអក្សរទទឹងសូន្យ សំណេរជាប់គ្នា និងកម្រិតភាសាខ្មែរ។'
          )}
        </p>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-xl">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={tr(
                'Search terms, codepoints (e.g. U+17D2, Coeng, ZWSP, Limon)...',
                'ស្វែងរកពាក្យ កូដ Unicode (ឧ. U+17D2, ជើង, ZWSP, Limon)...'
              )}
              className={`w-full pl-10 pr-9 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400 transition-colors ${
                isKm ? 'font-khmer' : ''
              }`}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label={tr('Clear search', 'សម្អាតការស្វែងរក')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Right Controls: Count + Layout Switcher */}
          <div className="flex items-center justify-between md:justify-end gap-3">
            <span className="text-xs font-mono text-slate-400 tabular-nums">
              {filteredTerms.length} / {KHMER_NLP_GLOSSARY_TERMS.length} {tr('terms', 'ពាក្យ')}
            </span>

            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950 border border-slate-800">
              <button
                type="button"
                onClick={() => setLayoutMode('cards')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-colors whitespace-nowrap shrink-0 ${
                  layoutMode === 'cards'
                    ? 'bg-amber-400 text-slate-950 font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>{tr('Cards', 'កាត')}</span>
              </button>
              <button
                type="button"
                onClick={() => setLayoutMode('table')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-colors whitespace-nowrap shrink-0 ${
                  layoutMode === 'table'
                    ? 'bg-amber-400 text-slate-950 font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Table2 className="w-3.5 h-3.5" />
                <span>{tr('Table', 'តារាង')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Category Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-800/80">
          {categories.map((cat) => {
            const active = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors whitespace-nowrap shrink-0 ${
                  isKm ? 'font-khmer' : ''
                } ${
                  active
                    ? 'bg-amber-400 text-slate-950 border-amber-400 font-semibold'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                }`}
              >
                <span>{isKm ? cat.labelKm : cat.label}</span>
                <span className={`ml-1.5 font-mono text-[11px] tabular-nums ${active ? 'text-slate-900' : 'text-slate-500'}`}>
                  {categoryCounts[cat.id] || 0}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Empty State */}
      {filteredTerms.length === 0 ? (
        <div className="p-12 rounded-2xl border border-slate-800 bg-slate-900/40 text-center space-y-3">
          <BookOpen className="w-6 h-6 text-slate-500 mx-auto" />
          <div className={`text-sm font-semibold text-white ${isKm ? 'font-khmer' : ''}`}>
            {tr('No matching glossary entries found', 'រកមិនឃើញពាក្យបច្ចេកទេសដែលត្រូវគ្នាទេ')}
          </div>
          <p className={`text-xs text-slate-400 max-w-md mx-auto ${isKm ? 'font-khmer' : ''}`}>
            {tr(
              'Try searching for Unicode points like U+17D2, U+200B, or concepts such as Coeng, ZWSP, Limon, or Fertility.',
              'សូមសាកល្បងស្វែងរកកូដ U+17D2, U+200B ឬពាក្យដូចជា ជើង, ZWSP, Limon ឬ TFR។'
            )}
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-amber-400 text-slate-950 hover:bg-amber-300 transition-colors"
          >
            {tr('Reset Filters', 'កំណត់តម្រងឡើងវិញ')}
          </button>
        </div>
      ) : layoutMode === 'cards' ? (
        /* Single-Elevation Glossary Cards Grid */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredTerms.map((item) => {
            const isCopied = copiedId === item.id;
            return (
              <article
                key={item.id}
                className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 flex flex-col justify-between gap-4"
              >
                <div className="space-y-3">
                  {/* Quiet Unboxed Metadata Line */}
                  <div className="flex items-center justify-between gap-2 text-xs font-mono">
                    <div className="flex flex-wrap items-center gap-2 text-slate-400">
                      <span className="text-amber-400">{categoryLabel(item.category)}</span>
                      <span aria-hidden="true" className="text-slate-600">·</span>
                      <span className="text-cyan-300">{item.unicodeOrSymbol}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyTerm(item)}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
                      title={tr('Copy entry', 'ចម្លងពាក្យ')}
                    >
                      {isCopied ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>{isCopied ? tr('Copied', 'បានចម្លង') : tr('Copy', 'ចម្លង')}</span>
                    </button>
                  </div>

                  {/* Title (English + Khmer Subhead) */}
                  <div className="space-y-0.5">
                    <h3 className={`text-base font-bold text-white ${isKm ? 'font-khmer' : ''}`}>
                      {isKm ? item.termKm : item.term}
                    </h3>
                    <div className={`text-xs text-slate-400 ${isKm ? '' : 'font-khmer'}`}>
                      {isKm ? item.term : item.termKm}
                    </div>
                  </div>

                  {/* Core Definition */}
                  <p className={`text-xs text-slate-300 leading-relaxed ${isKm ? 'font-khmer' : ''}`}>
                    {isKm ? item.definitionKm : item.definition}
                  </p>

                  {/* Hairline Divider: LLM Pretraining / Tokenization Impact */}
                  <div className="pt-3 border-t border-slate-800/80 space-y-1">
                    <div className="text-[11px] font-mono text-emerald-400">
                      {tr('WHY IT MATTERS FOR KHMER LLMs', 'សារៈសំខាន់សម្រាប់ KHMER LLM')}
                    </div>
                    <p className={`text-xs text-slate-300 leading-relaxed ${isKm ? 'font-khmer' : ''}`}>
                      {isKm ? item.llmImpactKm : item.llmImpact}
                    </p>
                  </div>
                </div>

                {/* Footer Example & Optional Workbench Jump Link */}
                <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-0.5 min-w-0">
                    <div className="font-khmer text-sm text-amber-200 break-words">
                      {item.example}
                    </div>
                    <div className={`text-[11px] text-slate-400 ${isKm ? 'font-khmer' : ''}`}>
                      {isKm ? item.exampleNoteKm : item.exampleNote}
                    </div>
                  </div>

                  {item.relatedTab && onNavigate && (
                    <button
                      type="button"
                      onClick={() => onNavigate(item.relatedTab!)}
                      className="inline-flex items-center gap-1 text-xs font-mono text-amber-400 hover:text-amber-300 transition-colors whitespace-nowrap shrink-0 self-start sm:self-center"
                    >
                      <span>{isKm ? item.relatedTabLabelKm : item.relatedTabLabel}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        /* High-Density Quick Reference Table */
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] font-mono text-slate-400">
                <th className="py-3 px-4 font-medium">{tr('Term', 'ពាក្យបច្ចេកទេស')}</th>
                <th className="py-3 px-4 font-medium">{tr('Codepoint / Marker', 'កូដ / និមិត្តសញ្ញា')}</th>
                <th className="py-3 px-4 font-medium">{tr('Category', 'ប្រភេទ')}</th>
                <th className="py-3 px-4 font-medium">{tr('LLM Processing Impact', 'ផលប៉ះពាល់លើម៉ូដែល LLM')}</th>
                <th className="py-3 px-4 font-medium">{tr('Example', 'ឧទាហរណ៍')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70 text-xs">
              {filteredTerms.map((item) => (
                <tr key={item.id} className="hover:bg-slate-900/80 transition-colors align-top">
                  <td className="py-3 px-4 min-w-[200px]">
                    <div className={`font-semibold text-white ${isKm ? 'font-khmer' : ''}`}>
                      {isKm ? item.termKm : item.term}
                    </div>
                    <div className={`text-[11px] text-slate-400 mt-0.5 ${isKm ? '' : 'font-khmer'}`}>
                      {isKm ? item.term : item.termKm}
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono text-cyan-300 whitespace-nowrap">
                    {item.unicodeOrSymbol}
                  </td>
                  <td className={`py-3 px-4 text-amber-400 whitespace-nowrap ${isKm ? 'font-khmer' : 'font-mono text-[11px]'}`}>
                    {categoryLabel(item.category)}
                  </td>
                  <td className={`py-3 px-4 text-slate-300 leading-relaxed max-w-md ${isKm ? 'font-khmer' : ''}`}>
                    {isKm ? item.llmImpactKm : item.llmImpact}
                  </td>
                  <td className="py-3 px-4 font-khmer text-amber-200 min-w-[160px]">
                    {item.example}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
