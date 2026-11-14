import { TokenizerComparisonResult, AnalyzedToken, VocabSuggestion, VocabCategory } from '../types';

// Khmer Unicode Ranges
export const KHMER_CONSONANTS = /^[\u1780-\u17A2]$/;
export const KHMER_INDEPENDENT_VOWELS = /^[\u17A3-\u17B3]$/;
export const KHMER_DEPENDENT_VOWELS = /^[\u17B6-\u17C5]$/;
export const KHMER_COENG = '\u17D2'; // ្
export const KHMER_DIACRITICS = /^[\u17C6-\u17D3]$/;
export const KHMER_PUNCTUATION = /^[\u17D4-\u17DA]$/;

/**
 * Segment continuous Khmer text into phonological syllable clusters
 * Regex standard: Consonant/IndepVowel + (Coeng + Consonant)* + (Dependent Vowel)? + (Diacritics)*
 */
export function segmentKhmerSyllables(text: string): string[] {
  if (!text) return [];

  // Syllable cluster regex for Khmer orthography
  const clusterRegex = /(?:[\u1780-\u17A2\u17A3-\u17B3](?:\u17D2[\u1780-\u17A2])*(?:[\u17B6-\u17C5])*(?:[\u17C6-\u17D3])*)|[^\u1780-\u17D3\s]+|\s+/g;
  
  const matches = text.match(clusterRegex);
  return matches ? matches.filter(m => m.trim().length > 0) : [text];
}

/**
 * Common Limon legacy font n-grams that indicate un-converted ASCII text
 */
export const LIMON_PATTERNS = [
  'Gñk', 'Edl', 'RBH', 'bBa¢a', 'enH', 'mYy', 'rbs;', 'eRkamy',
  'GVI', 'sßay', 'Bit', 'dUc', '曼谷', 'GñkEdl'
];

/**
 * Check if text contains legacy Limon / ABC font artifacts
 */
export function detectLimonFont(text: string): { hasLimon: boolean; matchedWords: string[] } {
  const matches: string[] = [];
  for (const pattern of LIMON_PATTERNS) {
    if (text.includes(pattern)) {
      matches.push(pattern);
    }
  }
  return {
    hasLimon: matches.length > 0,
    matchedWords: matches
  };
}

/**
 * Known casino / betting scam terms that plague Khmer web crawls
 */
export const CASINO_KEYWORDS = [
  'កាស៊ីណូ', 'បាការ៉ាត់', 'ភ្នាល់បាល់', 'ដាក់ប្រាក់', 'ដកប្រាក់',
  'ហ្គេមបាញ់ត្រី', 'កាស៊ីណូអនឡាញ', 'វេបសាយភ្នាល់', 'សេវា២៤ម៉ោង',
  'slot online', 'telegram: @', 'line id:', 'ល្បែងស៊ីសង'
];

export function detectCasinoSpam(text: string): { isSpam: boolean; foundKeywords: string[]; spamScore: number } {
  const foundKeywords: string[] = [];
  for (const kw of CASINO_KEYWORDS) {
    if (text.toLowerCase().includes(kw.toLowerCase())) {
      foundKeywords.push(kw);
    }
  }
  const spamScore = Math.min(100, foundKeywords.length * 25);
  return {
    isSpam: foundKeywords.length > 0,
    foundKeywords,
    spamScore
  };
}

/**
 * Analyze Unicode Orthography correctness (e.g. invalid Coeng placement, lone diacritics)
 */
export function analyzeOrthography(
  text: string,
  language: 'en' | 'km' = 'en'
): {
  isValid: boolean;
  issues: string[];
  charCount: number;
  khmerCharRatio: number;
} {
  const issues: string[] = [];
  let khmerChars = 0;
  const len = text.length;

  for (let i = 0; i < len; i++) {
    const charCode = text.charCodeAt(i);
    // Khmer range 0x1780 to 0x17FF
    if (charCode >= 0x1780 && charCode <= 0x17FF) {
      khmerChars++;
    }

    // Check if Coeng (្) is at end of text or followed by non-consonant
    if (text[i] === KHMER_COENG) {
      if (i === len - 1) {
        issues.push(
          language === 'km'
            ? 'ជើងព្យញ្ជនៈនៅទំនេរ (សញ្ញាជើង ្ នៅចុងពាក្យដោយគ្មានព្យញ្ជនៈបន្ទាប់)'
            : 'Dangling Subscript (Coeng ្ at end of sequence with no following consonant)'
        );
      } else {
        const nextChar = text[i + 1];
        if (!KHMER_CONSONANTS.test(nextChar)) {
          issues.push(
            language === 'km'
              ? `ជើងព្យញ្ជនៈមិនត្រឹមត្រូវ៖ តាមពីក្រោយដោយ "${nextChar}" (U+${nextChar.charCodeAt(0).toString(16)}) ជំនួសឱ្យព្យញ្ជនៈ។`
              : `Invalid Coeng ligature: followed by "${nextChar}" (U+${nextChar.charCodeAt(0).toString(16)}) instead of a consonant.`
          );
        }
      }
    }
  }

  const khmerCharRatio = len > 0 ? khmerChars / len : 0;
  if (khmerCharRatio < 0.3 && len > 20) {
    issues.push(
      language === 'km'
        ? 'ដង់ស៊ីតេតួអក្សរខ្មែរទាប៖ ឯកសារអាចជាភាសាអង់គ្លេស ថៃ ឬកូដកម្មវិធីភាគច្រើន។'
        : 'Low Khmer character density: document may be predominantly English, Thai, or code.'
    );
  }

  return {
    isValid: issues.length === 0,
    issues,
    charCount: len,
    khmerCharRatio: Math.round(khmerCharRatio * 100)
  };
}

/**
 * High-frequency Khmer vocabulary for simulated specialized SentencePiece tokenizer
 */
const COMMON_KHMER_SUBWORDS = new Set([
  'រាជរដ្ឋាភិបាល', 'កម្ពុជា', 'បាន', 'ប្រកាស', 'ដាក់', 'ចេញ', 'នូវ', 'ផែនការ', 'យុទ្ធសាស្ត្រ',
  'បញ្ញា', 'សិប្បនិម្មិត', 'ជាតិ', 'ឆ្នាំ', 'អភិវឌ្ឍន៍', 'សេដ្ឋកិច្ច', 'បច្ចេកវិទ្យា', 'ឌីជីថល',
  'ដើម្បី', 'ជំរុញ', 'កំណើន', 'សង្គម', 'និង', 'ការ', 'អប់រំ', 'សុខាភិបាល', 'កសិកម្ម',
  'នវានុវត្តន៍', 'ធនធាន', 'មនុស្ស', 'ព្រះរាជាណាចក្រ', 'រាជធានី', 'ភ្នំពេញ', 'សៀមរាប',
  'ប្រាសាទ', 'អង្គរវត្ត', 'វប្បធម៌', 'ប្រវត្តិសាស្ត្រ', 'ខ្មែរ', 'ភាសា', 'អក្សរ', 'សិល្បៈ',
  'ចំណេះដឹង', 'វិទ្យាសាស្ត្រ', 'ស្រាវជ្រាវ', 'ទិន្នន័យ', 'ម៉ូដែល', 'ប្រព័ន្ធ', 'កុំព្យូទ័រ'
]);

export type BaselineModelType = 'llama3_tiktoken' | 'mistral_spm' | 'gpt4o_o200k';
export type KhmerModelType = 'khmer_spm_32k' | 'khmer_spm_64k' | 'khmer_unigram_32k';

export interface TokenizerModelMeta {
  id: string;
  name: string;
  nameKm: string;
  vocabSize: string;
  type: string;
  typeKm: string;
  description: string;
  descriptionKm: string;
}

export const BASELINE_MODELS: Record<BaselineModelType, TokenizerModelMeta> = {
  llama3_tiktoken: {
    id: 'llama3_tiktoken',
    name: 'LLaMA-3 (tiktoken BPE)',
    nameKm: 'LLaMA-3 (tiktoken BPE)',
    vocabSize: '128,256',
    type: 'Byte-Level BPE (tiktoken)',
    typeKm: 'Byte-Level BPE (tiktoken)',
    description: 'Meta LLaMA-3 tokenizer using tiktoken. Almost all Khmer script falls back to raw 3-byte UTF-8 tokens.',
    descriptionKm: 'ថូខិនណាយស័រ Meta LLaMA-3 ប្រើ tiktoken។ អក្សរខ្មែរស្ទើរតែទាំងអស់ត្រូវបំបែកជាថូខិន UTF-8 កម្រិត 3-byte ដើម។'
  },
  mistral_spm: {
    id: 'mistral_spm',
    name: 'Mistral / LLaMA-2 (SentencePiece)',
    nameKm: 'Mistral / LLaMA-2 (SentencePiece)',
    vocabSize: '32,000',
    type: 'SentencePiece BPE',
    typeKm: 'SentencePiece BPE',
    description: 'Standard SentencePiece BPE with byte fallback. High fragmentation of Brahmic scripts.',
    descriptionKm: 'SentencePiece BPE ស្តង់ដារជាមួយ byte fallback។ បំបែកអក្សរខ្មែរចេញពីគ្នាខ្លាំង។'
  },
  gpt4o_o200k: {
    id: 'gpt4o_o200k',
    name: 'GPT-4o (o200k_base)',
    nameKm: 'GPT-4o (o200k_base)',
    vocabSize: '200,000',
    type: 'Extended BPE (o200k)',
    typeKm: 'Extended BPE (o200k)',
    description: 'OpenAI o200k tokenizer. Partially covers high-frequency Indic words, but breaks Khmer syllable ligatures.',
    descriptionKm: 'ថូខិនណាយស័រ OpenAI o200k។ គ្របដណ្តប់ពាក្យខ្លះៗ ប៉ុន្តែនៅតែកាត់ផ្តាច់ជើងព្យញ្ជនៈខ្មែរ។'
  }
};

export const KHMER_MODELS: Record<KhmerModelType, TokenizerModelMeta> = {
  khmer_spm_32k: {
    id: 'khmer_spm_32k',
    name: 'Khmer SentencePiece BPE (32k)',
    nameKm: 'Khmer SentencePiece BPE (32k)',
    vocabSize: '32,000',
    type: 'Syllable-Aware SentencePiece BPE',
    typeKm: 'SentencePiece BPE យល់ព្យាង្គខ្មែរ',
    description: 'Trained with character_coverage=0.9995. Common Khmer words and syllable clusters are unified into single tokens.',
    descriptionKm: 'បង្វឹកដោយ character_coverage=0.9995។ ពាក្យខ្មែរញឹកញាប់ និងចង្កោមព្យាង្គត្រូវបានបញ្ចូលជាថូខិនតែមួយ។'
  },
  khmer_spm_64k: {
    id: 'khmer_spm_64k',
    name: 'Khmer SentencePiece BPE (64k Extended)',
    nameKm: 'Khmer SentencePiece BPE (64k ពង្រីក)',
    vocabSize: '64,000',
    type: 'Extended Compound SentencePiece',
    typeKm: 'SentencePiece សមាសនាមពង្រីក',
    description: 'Includes extensive formal compounds from Royal Gazette and Buddhist Institute Tripitaka.',
    descriptionKm: 'រួមបញ្ចូលសមាសនាមផ្លូវការជាច្រើនពីរាជកិច្ច និងព្រះត្រៃបិដកនៃពុទ្ធសាសនបណ្ឌិត្យ។'
  },
  khmer_unigram_32k: {
    id: 'khmer_unigram_32k',
    name: 'Khmer Unigram Language Model (32k)',
    nameKm: 'ម៉ូដែលភាសា Khmer Unigram (32k)',
    vocabSize: '32,000',
    type: 'SentencePiece Unigram (Kneser-Ney)',
    typeKm: 'SentencePiece Unigram (Kneser-Ney)',
    description: 'Probabilistic subword segmentation with regularization, resilient to informal spelling variations.',
    descriptionKm: 'ការបំបែកអនុពាក្យតាមប្រូបាប៊ីលីតេ ធន់នឹងភាពខុសគ្នានៃការប្រកបក្រៅផ្លូវការ។'
  }
};

/**
 * Simulate Tokenizer Comparison:
 * Western LLM (Llama 3 / Mistral byte-level fallback) vs Khmer-Optimized SentencePiece
 */
export function compareTokenizers(
  text: string,
  modelA: BaselineModelType = 'llama3_tiktoken',
  modelB: KhmerModelType = 'khmer_spm_32k'
): TokenizerComparisonResult {
  const syllables = segmentKhmerSyllables(text);
  const wordsEstimated = Math.max(1, syllables.length);

  // 1. Simulate Baseline Model (LLaMA-3 tiktoken or Mistral byte-fallback)
  const llamaTokens: AnalyzedToken[] = [];
  let llamaIdCounter = modelA === 'llama3_tiktoken' ? 128000 : 31000;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const code = char.charCodeAt(0);

    if (code >= 0x1780 && code <= 0x17FF) {
      // In Llama, Khmer characters are typically represented as 3 UTF-8 bytes:
      // Often split into individual bytes: <0xE1>, <0x9E>, <0x80>
      const utf8Bytes = new TextEncoder().encode(char);
      const hexList = Array.from(utf8Bytes).map(b => b.toString(16).toUpperCase().padStart(2, '0'));
      
      utf8Bytes.forEach((b, byteIdx) => {
        llamaTokens.push({
          id: llamaIdCounter++,
          token: `<0x${b.toString(16).toUpperCase().padStart(2, '0')}>`,
          bytes: 1,
          charStart: i,
          charEnd: i + 1,
          rawBytesHex: hexList[byteIdx]
        });
      });
    } else if (char === ' ') {
      llamaTokens.push({
        id: llamaIdCounter++,
        token: modelA === 'llama3_tiktoken' ? 'Ġ' : ' ',
        bytes: 1,
        charStart: i,
        charEnd: i + 1,
        rawBytesHex: '20'
      });
    } else {
      const utf8Bytes = new TextEncoder().encode(char);
      llamaTokens.push({
        id: llamaIdCounter++,
        token: char,
        bytes: utf8Bytes.length,
        charStart: i,
        charEnd: i + 1,
        rawBytesHex: Array.from(utf8Bytes).map(b => b.toString(16).toUpperCase().padStart(2, '0')).join(' ')
      });
    }
  }

  // 2. Simulate Khmer-Optimized SentencePiece (Trained with Khmer vocabulary)
  const khmerTokens: AnalyzedToken[] = [];
  let khmerIdCounter = 4000;

  let charOffset = 0;
  while (charOffset < text.length) {
    const remaining = text.substring(charOffset);

    if (remaining.startsWith(' ')) {
      khmerTokens.push({
        id: khmerIdCounter++,
        token: ' ',
        bytes: 1,
        charStart: charOffset,
        charEnd: charOffset + 1,
        rawBytesHex: '20'
      });
      charOffset += 1;
      continue;
    }

    // Check longest common subword match
    let matched = false;
    const maxLookahead = modelB === 'khmer_spm_64k' ? 24 : 18;

    for (let len = Math.min(remaining.length, maxLookahead); len >= 2; len--) {
      const candidate = remaining.substring(0, len);
      if (COMMON_KHMER_SUBWORDS.has(candidate)) {
        const utf8Bytes = new TextEncoder().encode(candidate);
        khmerTokens.push({
          id: khmerIdCounter++,
          token: candidate,
          bytes: utf8Bytes.length,
          charStart: charOffset,
          charEnd: charOffset + len,
          rawBytesHex: Array.from(utf8Bytes).map(b => b.toString(16).toUpperCase().padStart(2, '0')).join(' ')
        });
        charOffset += len;
        matched = true;
        break;
      }
    }

    if (!matched) {
      // Fallback to syllable cluster
      const clusters = segmentKhmerSyllables(remaining);
      const firstCluster = clusters[0] || remaining[0];
      const clusterLen = firstCluster.length;
      const utf8Bytes = new TextEncoder().encode(firstCluster);

      khmerTokens.push({
        id: khmerIdCounter++,
        token: firstCluster,
        bytes: utf8Bytes.length,
        charStart: charOffset,
        charEnd: charOffset + clusterLen,
        rawBytesHex: Array.from(utf8Bytes).map(b => b.toString(16).toUpperCase().padStart(2, '0')).join(' ')
      });
      charOffset += clusterLen;
    }
  }

  const llamaCount = Math.max(1, llamaTokens.length);
  const khmerCount = Math.max(1, khmerTokens.length);
  const compressionRatio = Number((llamaCount / khmerCount).toFixed(2));
  const llamaFertility = Number((llamaCount / wordsEstimated).toFixed(2));
  const khmerFertility = Number((khmerCount / wordsEstimated).toFixed(2));

  return {
    text,
    standardLlamaTokens: llamaTokens,
    khmerOptimizedTokens: khmerTokens,
    llamaTokenCount: llamaCount,
    khmerTokenCount: khmerCount,
    compressionRatio,
    wordsEstimated,
    llamaFertility,
    khmerFertility,
    syllables
  };
}

/**
 * Pre-set test phrases for quick testing in the UI
 */
export const SAMPLE_KHMER_PHRASES = [
  {
    title: 'Formal Government Policy (ផែនការជាតិ)',
    titleKm: 'គោលនយោបាយរដ្ឋាភិបាលផ្លូវការ (ផែនការជាតិ)',
    text: 'រាជរដ្ឋាភិបាលកម្ពុជាបានប្រកាសដាក់ចេញនូវផែនការយុទ្ធសាស្ត្រជាតិសម្រាប់ការអភិវឌ្ឍសេដ្ឋកិច្ចឌីជីថលនិងបញ្ញាសិប្បនិម្មិត។'
  },
  {
    title: 'Angkor Heritage Literature (ប្រវត្តិសាស្ត្រអង្គរ)',
    titleKm: 'អក្សរសិល្ប៍បេតិកភណ្ឌអង្គរ (ប្រវត្តិសាស្ត្រអង្គរ)',
    text: 'ប្រាសាទអង្គរវត្តជាស្នាដៃស្ថាបត្យកម្មដ៏ពិសិដ្ឋនៃបុព្វបុរសខ្មែរ ដែលត្រូវបានសាងសង់ឡើងក្នុងរជ្ជកាលព្រះបាទសូរ្យវរ្ម័នទី២។'
  },
  {
    title: 'Modern Science & Tech (បច្ចេកវិទ្យា និងការស្រាវជ្រាវ)',
    titleKm: 'វិទ្យាសាស្ត្រ និងបច្ចេកវិទ្យាទំនើប',
    text: 'ការបង្វឹកម៉ូដែលបញ្ញាសិប្បនិម្មិតខ្នាតធំទាមទារនូវទិន្នន័យដែលមានគុណភាពខ្ពស់ និងការកែច្នៃថូខិនណាយស័រឱ្យត្រូវនឹងទម្រង់ព្យាង្គភាសាខ្មែរ។'
  },
  {
    title: 'Limon Legacy Encoding Artifact (អក្សរ Limon ចាស់)',
    titleKm: 'កូដពុម្ពអក្សរចាស់ Limon (អក្សរ Limon ចាស់)',
    text: 'GñkEdleZVIkarGVImYy enHKitzaBitCa mYy rbs; eRkamy sßay'
  },
  {
    title: 'Web Crawl Casino Spam (សារឥតបានការកាស៊ីណូ)',
    titleKm: 'សារឥតបានការកាស៊ីណូពីវេបសាយ',
    text: 'ចូលរួមលេងកាស៊ីណូអនឡាញឈ្នះ១០០% ដាក់ប្រាក់ដកប្រាក់រហ័ស ភ្នាល់បាល់បាការ៉ាត់សេវា២៤ម៉ោង Telegram: @casino88'
  }
];

export const KHMER_BOILERPLATE_PATTERNS = [
  'រក្សាសិទ្ធិគ្រប់យ៉ាង',
  'រក្សាសិទ្ធិដោយ',
  'លក្ខខណ្ឌប្រើប្រាស់',
  'លក្ខខណ្ឌនៃការប្រើប្រាស់',
  'គោលការណ៍ឯកជនភាព',
  'ទំនាក់ទំនងផ្សាយពាណិជ្ជកម្ម',
  'ចុចត្រង់នេះដើម្បី',
  'ចុច subscribe',
  'ចែករំលែកអត្ថបទនេះ',
  'ចែករំលែកលើ facebook',
  'ចែករំលែកលើ telegram',
  'ទំព័រដើម »',
  'ព័ត៌មានទាក់ទង',
  'អានបន្ថែម',
  'អានបន្ត',
  'មតិយោបល់',
  'សេចក្តីប្រកាសមិនទទួលខុសត្រូវ',
  'គេហទំព័រនេះប្រើប្រាស់ cookies',
  'cookie policy',
  'all rights reserved',
  'powered by wordpress',
  'join telegram channel',
  'ទាក់ទងមកកាន់យើង',
  'អំពីយើង'
];

export const URL_REGEX = /(https?:\/\/[^\s]+|www\.[^\s]+|(?:[a-zA-Z0-9-]+\.)+(?:com|org|net|kh|info|biz|cc|io|me|xyz|top|live|app|site|online|me)[^\s]*|t\.me\/[^\s]+|bit\.ly\/[^\s]+)/gi;

export interface LineAssessment {
  id: number;
  text: string;
  isHighQuality: boolean;
  charCount: number;
  category: 'clean' | 'url_dense' | 'boilerplate' | 'casino_spam' | 'limon_legacy' | 'fragment';
  reasons: string[];
}

export interface QualityFilterThresholds {
  maxUrlDensity: number; // e.g. 5%
  boilerplateSensitivity: 'strict' | 'standard' | 'relaxed';
  minKhmerRatio: number; // e.g. 50%
  minLineLength: number; // e.g. 20
}

export interface DocumentQualityReport {
  totalCharacters: number;
  totalWordsEstimate: number;
  totalLines: number;
  highQualityCharacters: number;
  lowQualityCharacters: number;
  highQualityPercent: number;
  lowQualityPercent: number;
  urlDensityPercent: number;
  urlCount: number;
  boilerplatePercent: number;
  spamPercent: number;
  limonPercent: number;
  fragmentationPercent: number;
  overallScore: number; // 0-100
  verdict: 'PRETRAIN_READY' | 'BORDERLINE_NEEDS_CLEANING' | 'REJECTED_CONTAMINATED';
  lineAssessments: LineAssessment[];
  cleanedText: string;
  estimatedRetainedTokens: number;
  estimatedPurgedTokens: number;
}

/**
 * Perform fine-grained quality, URL density, and boilerplate content assessment on a text
 */
export function estimateCorpusQuality(
  rawText: string,
  thresholds: QualityFilterThresholds = {
    maxUrlDensity: 5,
    boilerplateSensitivity: 'standard',
    minKhmerRatio: 50,
    minLineLength: 20
  },
  language: 'en' | 'km' = 'en'
): DocumentQualityReport {
  if (!rawText || rawText.trim().length === 0) {
    return {
      totalCharacters: 0,
      totalWordsEstimate: 0,
      totalLines: 0,
      highQualityCharacters: 0,
      lowQualityCharacters: 0,
      highQualityPercent: 0,
      lowQualityPercent: 0,
      urlDensityPercent: 0,
      urlCount: 0,
      boilerplatePercent: 0,
      spamPercent: 0,
      limonPercent: 0,
      fragmentationPercent: 0,
      overallScore: 0,
      verdict: 'REJECTED_CONTAMINATED',
      lineAssessments: [],
      cleanedText: '',
      estimatedRetainedTokens: 0,
      estimatedPurgedTokens: 0
    };
  }

  const rawLines = rawText.split('\n');
  const lineAssessments: LineAssessment[] = [];

  let totalChars = 0;
  let highQualityChars = 0;
  let lowQualityChars = 0;

  let totalUrlChars = 0;
  let totalUrlCount = 0;
  let totalBoilerplateChars = 0;
  let totalSpamChars = 0;
  let totalLimonChars = 0;
  let totalFragmentChars = 0;

  const cleanedLines: string[] = [];

  rawLines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    const charCount = trimmed.length;
    totalChars += charCount;

    // Check URLs in line
    const urlMatches = trimmed.match(URL_REGEX) || [];
    let lineUrlChars = 0;
    urlMatches.forEach(u => {
      lineUrlChars += u.length;
    });
    totalUrlCount += urlMatches.length;
    totalUrlChars += lineUrlChars;

    // Check Boilerplate
    const lower = trimmed.toLowerCase();
    const hasBoilerplate = KHMER_BOILERPLATE_PATTERNS.some(bp => lower.includes(bp.toLowerCase()));
    if (hasBoilerplate) {
      totalBoilerplateChars += charCount;
    }

    // Check Casino
    const casino = detectCasinoSpam(trimmed);
    if (casino.isSpam) {
      totalSpamChars += charCount;
    }

    // Check Limon
    const limon = detectLimonFont(trimmed);
    if (limon.hasLimon) {
      totalLimonChars += charCount;
    }

    // Check Khmer Char Ratio
    const orth = analyzeOrthography(trimmed, language);

    // Decision Logic per line
    const reasons: string[] = [];
    let isHighQuality = true;
    let category: LineAssessment['category'] = 'clean';

    if (limon.hasLimon) {
      isHighQuality = false;
      category = 'limon_legacy';
      reasons.push(
        language === 'km'
          ? 'កំហុសពុម្ពអក្សរចាស់ Limon មិនមែនយូនីកូដ'
          : 'Limon legacy non-Unicode font artifact'
      );
    } else if (casino.isSpam) {
      isHighQuality = false;
      category = 'casino_spam';
      reasons.push(
        language === 'km'
          ? `ពាក្យគន្លឹះល្បែងអនឡាញ / សារឥតបានការ (${casino.foundKeywords.join(', ')})`
          : `Online betting / spam keyword (${casino.foundKeywords.join(', ')})`
      );
    } else if (lineUrlChars > 0 && (lineUrlChars / charCount > (thresholds.maxUrlDensity / 100) || trimmed.startsWith('http') || trimmed.startsWith('www'))) {
      isHighQuality = false;
      category = 'url_dense';
      reasons.push(
        language === 'km'
          ? `ដង់ស៊ីតេ URL ខ្ពស់ (${Math.round((lineUrlChars / charCount) * 100)}% នៃបន្ទាត់ជាតំណភ្ជាប់)`
          : `High URL density (${Math.round((lineUrlChars / charCount) * 100)}% of line is links)`
      );
    } else if (hasBoilerplate) {
      isHighQuality = false;
      category = 'boilerplate';
      reasons.push(
        language === 'km'
          ? 'ឃ្លាស្តង់ដារប៊ូតុងគេហទំព័រ ឬពាក្យរក្សាសិទ្ធិដដែលៗ'
          : 'Web crawler navigational or legal boilerplate'
      );
    } else if (charCount < thresholds.minLineLength) {
      isHighQuality = false;
      category = 'fragment';
      reasons.push(
        language === 'km'
          ? `បន្ទាត់ខ្លីដាច់កង់ (< ${thresholds.minLineLength} តួអក្សរ)`
          : `Fragmented short line (< ${thresholds.minLineLength} chars)`
      );
    } else if (orth.khmerCharRatio < thresholds.minKhmerRatio) {
      isHighQuality = false;
      category = 'fragment';
      reasons.push(
        language === 'km'
          ? `សមាមាត្រតួអក្សរខ្មែរទាប (${orth.khmerCharRatio}% < ${thresholds.minKhmerRatio}%)`
          : `Low Khmer character ratio (${orth.khmerCharRatio}% < ${thresholds.minKhmerRatio}%)`
      );
    }

    if (isHighQuality) {
      highQualityChars += charCount;
      cleanedLines.push(trimmed);
    } else {
      lowQualityChars += charCount;
      if (category === 'fragment') totalFragmentChars += charCount;
    }

    lineAssessments.push({
      id: idx,
      text: trimmed,
      isHighQuality,
      charCount,
      category,
      reasons
    });
  });

  const highQualityPercent = totalChars > 0 ? Math.round((highQualityChars / totalChars) * 100) : 0;
  const lowQualityPercent = 100 - highQualityPercent;

  const urlDensityPercent = totalChars > 0 ? Number(((totalUrlChars / totalChars) * 100).toFixed(1)) : 0;
  const boilerplatePercent = totalChars > 0 ? Number(((totalBoilerplateChars / totalChars) * 100).toFixed(1)) : 0;
  const spamPercent = totalChars > 0 ? Number(((totalSpamChars / totalChars) * 100).toFixed(1)) : 0;
  const limonPercent = totalChars > 0 ? Number(((totalLimonChars / totalChars) * 100).toFixed(1)) : 0;
  const fragmentationPercent = totalChars > 0 ? Number(((totalFragmentChars / totalChars) * 100).toFixed(1)) : 0;

  // Overall Score (0-100)
  let score = highQualityPercent;
  if (spamPercent > 0) score -= Math.min(40, spamPercent * 1.5);
  if (limonPercent > 0) score -= Math.min(50, limonPercent * 2.0);
  if (urlDensityPercent > thresholds.maxUrlDensity) score -= Math.min(30, (urlDensityPercent - thresholds.maxUrlDensity) * 2);
  const overallScore = Math.max(0, Math.min(100, Math.round(score)));

  let verdict: DocumentQualityReport['verdict'] = 'REJECTED_CONTAMINATED';
  if (overallScore >= 80 && highQualityPercent >= 75) {
    verdict = 'PRETRAIN_READY';
  } else if (overallScore >= 50) {
    verdict = 'BORDERLINE_NEEDS_CLEANING';
  }

  // Tokens estimation: roughly 3.5 chars per Khmer token in SentencePiece
  const estimatedRetainedTokens = Math.round(highQualityChars / 3.5);
  const estimatedPurgedTokens = Math.round(lowQualityChars / 3.5);
  const totalWordsEstimate = Math.round(totalChars / 5.5);

  return {
    totalCharacters: totalChars,
    totalWordsEstimate,
    totalLines: lineAssessments.length,
    highQualityCharacters: highQualityChars,
    lowQualityCharacters: lowQualityChars,
    highQualityPercent,
    lowQualityPercent,
    urlDensityPercent,
    urlCount: totalUrlCount,
    boilerplatePercent,
    spamPercent,
    limonPercent,
    fragmentationPercent,
    overallScore,
    verdict,
    lineAssessments,
    cleanedText: cleanedLines.join('\n\n'),
    estimatedRetainedTokens,
    estimatedPurgedTokens
  };
}

/**
 * Format string into human-readable Unicode codepoint annotations
 * e.g. "ក្ស" -> ["U+1780 (ក)", "U+17D2 (្ Coeng)", "U+179F (ស)"]
 */
export function getUnicodeHexSequence(str: string, language: 'en' | 'km' = 'en'): string[] {
  return Array.from(str).map(char => {
    const code = char.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0');
    if (char === '\u17D2') {
      return language === 'km' ? `U+${code} (្ សញ្ញាជើង)` : `U+${code} (្ Coeng Subscript)`;
    }
    if (char === ' ') {
      return language === 'km' ? `U+${code} (ដកឃ្លា)` : `U+${code} (Space)`;
    }
    return `U+${code} (${char})`;
  });
}

/**
 * Curated high-impact Khmer vocabulary candidates for LLM tokenizer training
 */
export const KHMER_CURATED_VOCAB_CANDIDATES: Omit<VocabSuggestion, 'id' | 'frequencyInText'>[] = [
  // 1. Coeng Subscript Ligatures (ព្យញ្ជនៈផ្ញើជើង)
  {
    clusterOrWord: 'ក្ស',
    category: 'coeng_cluster',
    categoryLabel: 'Coeng Ligature (ព្យញ្ជនៈផ្ញើជើង)',
    categoryLabelKm: 'ព្យញ្ជនៈផ្ញើជើង (Coeng)',
    currentTokensBaseline: 9,
    currentTokensCustom: 2,
    proposedTokens: 1,
    tokenSavingPercent: 89,
    priority: 'CRITICAL',
    rationale: 'Occurs in foundational words like អក្សរ (script), សិក្សា (study), រក្សា (preserve). Without explicit merge, burns 9 bytes in tiktoken.',
    rationaleKm: 'កើតឡើងក្នុងពាក្យគ្រឹះដូចជា អក្សរ សិក្សា រក្សា។ បើគ្មានការរួមបញ្ចូលជាថូខិនទេ វាខ្ជះខ្ជាយដល់ ៩ បៃក្នុង tiktoken។',
    unicodeSequence: getUnicodeHexSequence('ក្ស'),
    coengPresent: true
  },
  {
    clusterOrWord: 'ស្ដ',
    category: 'coeng_cluster',
    categoryLabel: 'Coeng Ligature (ព្យញ្ជនៈផ្ញើជើង)',
    categoryLabelKm: 'ព្យញ្ជនៈផ្ញើជើង (Coeng)',
    currentTokensBaseline: 9,
    currentTokensCustom: 2,
    proposedTokens: 1,
    tokenSavingPercent: 89,
    priority: 'CRITICAL',
    rationale: 'Critical Brahmi cluster in ស្ដេច (king), ស្ដាប់ (listen), ស្ដីពី (regarding). Frequent split leads to hallucinated diacritics.',
    rationaleKm: 'ចង្កោមសំខាន់ក្នុងពាក្យ ស្ដេច ស្ដាប់ ស្ដីពី។ ការបំបែកញឹកញាប់ធ្វើឱ្យម៉ូដែលច្រឡំវណ្ណយុត្តិ។',
    unicodeSequence: getUnicodeHexSequence('ស្ដ'),
    coengPresent: true
  },
  {
    clusterOrWord: 'ន្ត',
    category: 'coeng_cluster',
    categoryLabel: 'Coeng Ligature (ព្យញ្ជនៈផ្ញើជើង)',
    categoryLabelKm: 'ព្យញ្ជនៈផ្ញើជើង (Coeng)',
    currentTokensBaseline: 9,
    currentTokensCustom: 2,
    proposedTokens: 1,
    tokenSavingPercent: 89,
    priority: 'CRITICAL',
    rationale: 'Crucial nasal cluster in មន្ត្រី (official), បន្ត (continue), អន្តរជាតិ (international), សន្តិភាព (peace).',
    rationaleKm: 'ចង្កោមសំខាន់ក្នុងពាក្យ មន្ត្រី បន្ត អន្តរជាតិ សន្តិភាព។',
    unicodeSequence: getUnicodeHexSequence('ន្ត'),
    coengPresent: true
  },
  {
    clusterOrWord: 'ម្ព',
    category: 'coeng_cluster',
    categoryLabel: 'Coeng Ligature (ព្យញ្ជនៈផ្ញើជើង)',
    categoryLabelKm: 'ព្យញ្ជនៈផ្ញើជើង (Coeng)',
    currentTokensBaseline: 9,
    currentTokensCustom: 2,
    proposedTokens: 1,
    tokenSavingPercent: 89,
    priority: 'CRITICAL',
    rationale: 'Constituent of the national name កម្ពុជា (Cambodia) and សម្ពន្ធ (alliance). Burning 9 tokens on a national identity syllable degrades generation.',
    rationaleKm: 'សមាសធាតុនៃពាក្យ កម្ពុជា និង សម្ពន្ធ។ ការចំណាយ ៩ ថូខិនលើព្យាង្គតែមួយធ្វើឱ្យការបង្កើតអត្ថបទយឺត។',
    unicodeSequence: getUnicodeHexSequence('ម្ព'),
    coengPresent: true
  },
  {
    clusterOrWord: 'ង្គ',
    category: 'coeng_cluster',
    categoryLabel: 'Coeng Ligature (ព្យញ្ជនៈផ្ញើជើង)',
    categoryLabelKm: 'ព្យញ្ជនៈផ្ញើជើង (Coeng)',
    currentTokensBaseline: 9,
    currentTokensCustom: 2,
    proposedTokens: 1,
    tokenSavingPercent: 89,
    priority: 'CRITICAL',
    rationale: 'Core cluster in អង្គរ (Angkor), សង្គម (society), សង្គ្រាម (war). High semantic frequency across all Khmer text domains.',
    rationaleKm: 'ចង្កោមស្នូលក្នុង អង្គរ សង្គម សង្គ្រាម។ មានភាពញឹកញាប់ខ្ពស់គ្រប់ប្រធានបទភាសាខ្មែរ។',
    unicodeSequence: getUnicodeHexSequence('ង្គ'),
    coengPresent: true
  },
  {
    clusterOrWord: 'ក្រ',
    category: 'coeng_cluster',
    categoryLabel: 'Coeng Ligature (ព្យញ្ជនៈផ្ញើជើង)',
    categoryLabelKm: 'ព្យញ្ជនៈផ្ញើជើង (Coeng)',
    currentTokensBaseline: 9,
    currentTokensCustom: 2,
    proposedTokens: 1,
    tokenSavingPercent: 89,
    priority: 'CRITICAL',
    rationale: 'Initial cluster for ក្រសួង (ministry), ក្រុម (team/group), ក្រោយ (after). Unifying stops wasteful byte-fallback splitting.',
    rationaleKm: 'ចង្កោមផ្តើមសម្រាប់ ក្រសួង ក្រុម ក្រោយ។ ការរួមបញ្ចូលជួយបញ្ឈប់ការបំបែកបៃឥតប្រយោជន៍។',
    unicodeSequence: getUnicodeHexSequence('ក្រ'),
    coengPresent: true
  },
  {
    clusterOrWord: 'ប្រ',
    category: 'coeng_cluster',
    categoryLabel: 'Coeng Ligature (ព្យញ្ជនៈផ្ញើជើង)',
    categoryLabelKm: 'ព្យញ្ជនៈផ្ញើជើង (Coeng)',
    currentTokensBaseline: 9,
    currentTokensCustom: 2,
    proposedTokens: 1,
    tokenSavingPercent: 89,
    priority: 'CRITICAL',
    rationale: 'Most frequent verbal prefix in Khmer: ប្រទេស (country), ប្រជាជន (people), ប្រព័ន្ធ (system), ប្រកាស (announce).',
    rationaleKm: 'បុព្វបទប្រើញឹកញាប់បំផុត៖ ប្រទេស ប្រជាជន ប្រព័ន្ធ ប្រកាស។',
    unicodeSequence: getUnicodeHexSequence('ប្រ'),
    coengPresent: true
  },
  {
    clusterOrWord: 'ត្រ',
    category: 'coeng_cluster',
    categoryLabel: 'Coeng Ligature (ព្យញ្ជនៈផ្ញើជើង)',
    categoryLabelKm: 'ព្យញ្ជនៈផ្ញើជើង (Coeng)',
    currentTokensBaseline: 9,
    currentTokensCustom: 2,
    proposedTokens: 1,
    tokenSavingPercent: 89,
    priority: 'CRITICAL',
    rationale: 'Found in ត្រួតពិនិត្យ (inspect/audit), ត្រឹមត្រូវ (correct), ត្រី (fish/trinity). Key grammatical cluster.',
    rationaleKm: 'មានក្នុង ត្រួតពិនិត្យ ត្រឹមត្រូវ ត្រី។ ចង្កោមវេយ្យាករណ៍សំខាន់។',
    unicodeSequence: getUnicodeHexSequence('ត្រ'),
    coengPresent: true
  },
  {
    clusterOrWord: 'ស្រ',
    category: 'coeng_cluster',
    categoryLabel: 'Coeng Ligature (ព្យញ្ជនៈផ្ញើជើង)',
    categoryLabelKm: 'ព្យញ្ជនៈផ្ញើជើង (Coeng)',
    currentTokensBaseline: 9,
    currentTokensCustom: 2,
    proposedTokens: 1,
    tokenSavingPercent: 89,
    priority: 'HIGH',
    rationale: 'Found in ស្រាវជ្រាវ (research), ស្រុក (district), ស្រឡាញ់ (love), ស្ត្រី (woman).',
    rationaleKm: 'មានក្នុង ស្រាវជ្រាវ ស្រុក ស្រឡាញ់ ស្ត្រី។',
    unicodeSequence: getUnicodeHexSequence('ស្រ'),
    coengPresent: true
  },
  {
    clusterOrWord: 'ផ្ល',
    category: 'coeng_cluster',
    categoryLabel: 'Coeng Ligature (ព្យញ្ជនៈផ្ញើជើង)',
    categoryLabelKm: 'ព្យញ្ជនៈផ្ញើជើង (Coeng)',
    currentTokensBaseline: 9,
    currentTokensCustom: 2,
    proposedTokens: 1,
    tokenSavingPercent: 89,
    priority: 'HIGH',
    rationale: 'Occurs in ផ្លូវ (road/pathway), ផ្លាស់ប្តូរ (change/transform), ផ្លែឈើ (fruit).',
    rationaleKm: 'កើតឡើងក្នុងពាក្យ ផ្លូវ ផ្លាស់ប្តូរ ផ្លែឈើ។',
    unicodeSequence: getUnicodeHexSequence('ផ្ល'),
    coengPresent: true
  },

  // 2. Pali/Sanskrit Stems (ពាក្យបាលី-សំស្ក្រឹត)
  {
    clusterOrWord: 'វិទ្យា',
    category: 'pali_sanskrit',
    categoryLabel: 'Pali-Sanskrit Stem (បាលី-សំស្ក្រឹត)',
    categoryLabelKm: 'ឫសពាក្យបាលី-សំស្ក្រឹត',
    currentTokensBaseline: 15,
    currentTokensCustom: 2,
    proposedTokens: 1,
    tokenSavingPercent: 93,
    priority: 'CRITICAL',
    rationale: 'Universal scientific affix (Vidya): ជីវវិទ្យា (biology), វិទ្យាសាស្ត្រ (science), បច្ចេកវិទ្យា (tech).',
    rationaleKm: 'បច្ច័យវិទ្យាសាស្ត្រសកល៖ ជីវវិទ្យា វិទ្យាសាស្ត្រ បច្ចេកវិទ្យា។',
    unicodeSequence: getUnicodeHexSequence('វិទ្យា'),
    coengPresent: true
  },
  {
    clusterOrWord: 'សាស្ត្រ',
    category: 'pali_sanskrit',
    categoryLabel: 'Pali-Sanskrit Stem (បាលី-សំស្ក្រឹត)',
    categoryLabelKm: 'ឫសពាក្យបាលី-សំស្ក្រឹត',
    currentTokensBaseline: 18,
    currentTokensCustom: 3,
    proposedTokens: 1,
    tokenSavingPercent: 94,
    priority: 'CRITICAL',
    rationale: 'Academic and doctrinal suffix (Shastra): យុទ្ធសាស្ត្រ (strategy), ភាសាសាស្ត្រ (linguistics), ប្រវត្តិសាស្ត្រ (history).',
    rationaleKm: 'បច្ច័យសិក្សាស្រាវជ្រាវ៖ យុទ្ធសាស្ត្រ ភាសាសាស្ត្រ ប្រវត្តិសាស្ត្រ។',
    unicodeSequence: getUnicodeHexSequence('សាស្ត្រ'),
    coengPresent: true
  },
  {
    clusterOrWord: 'ធម្ម',
    category: 'pali_sanskrit',
    categoryLabel: 'Pali-Sanskrit Stem (បាលី-សំស្ក្រឹត)',
    categoryLabelKm: 'ឫសពាក្យបាលី-សំស្ក្រឹត',
    currentTokensBaseline: 12,
    currentTokensCustom: 2,
    proposedTokens: 1,
    tokenSavingPercent: 92,
    priority: 'HIGH',
    rationale: 'Buddhist institute & ethical core (Dhamma): ធម្មជាតិ (nature), ធម្មតា (ordinary), សីលធម៌ (morals).',
    rationaleKm: 'ពាក្យគោលពុទ្ធសាសនា និងសីលធម៌៖ ធម្មជាតិ ធម្មតា សីលធម៌។',
    unicodeSequence: getUnicodeHexSequence('ធម្ម'),
    coengPresent: true
  },
  {
    clusterOrWord: 'បរិស្ថាន',
    category: 'pali_sanskrit',
    categoryLabel: 'Pali-Sanskrit Stem (បាលី-សំស្ក្រឹត)',
    categoryLabelKm: 'ឫសពាក្យបាលី-សំស្ក្រឹត',
    currentTokensBaseline: 24,
    currentTokensCustom: 3,
    proposedTokens: 1,
    tokenSavingPercent: 96,
    priority: 'HIGH',
    rationale: 'Environment & ecology domain term. Multi-syllable compound with nested Coeng (្ថ).',
    rationaleKm: 'បច្ចេកសព្ទបរិស្ថាន និងអេកូឡូស៊ី ដែលមានជើងត្រួត (្ថ)។',
    unicodeSequence: getUnicodeHexSequence('បរិស្ថាន'),
    coengPresent: true
  },
  {
    clusterOrWord: 'វប្បធម៌',
    category: 'pali_sanskrit',
    categoryLabel: 'Pali-Sanskrit Stem (បាលី-សំស្ក្រឹត)',
    categoryLabelKm: 'ឫសពាក្យបាលី-សំស្ក្រឹត',
    currentTokensBaseline: 18,
    currentTokensCustom: 2,
    proposedTokens: 1,
    tokenSavingPercent: 94,
    priority: 'HIGH',
    rationale: 'Culture and heritage lemma. Contains Bantoc diacritic and Reahmuk.',
    rationaleKm: 'ពាក្យមូលដ្ឋានសម្រាប់វប្បធម៌ និងបេតិកភណ្ឌ ដែលមានសញ្ញាបន្តក់ និងរបាទ។',
    unicodeSequence: getUnicodeHexSequence('វប្បធម៌'),
    coengPresent: true
  },

  // 3. Syntactic Functional Clitics & Connectors (ពាក្យតភ្ជាប់សំនួន)
  {
    clusterOrWord: 'ដោយសារ',
    category: 'clitic_connector',
    categoryLabel: 'Syntactic Connector (ពាក្យតភ្ជាប់)',
    categoryLabelKm: 'ឈ្នាប់ / ពាក្យតភ្ជាប់សំនួន',
    currentTokensBaseline: 18,
    currentTokensCustom: 2,
    proposedTokens: 1,
    tokenSavingPercent: 94,
    priority: 'CRITICAL',
    rationale: 'High-frequency causal conjunction ("because of / due to"). Unifying removes decoding latency in causal reasoning.',
    rationaleKm: 'ឈ្នាប់ប្រាប់ហេតុប្រើញឹកញាប់ខ្ពស់។ ការរួមបញ្ចូលជួយកាត់បន្ថយភាពយឺតយ៉ាវក្នុងការវិភាគហេតុផល។',
    unicodeSequence: getUnicodeHexSequence('ដោយសារ'),
    coengPresent: false
  },
  {
    clusterOrWord: 'ដើម្បី',
    category: 'clitic_connector',
    categoryLabel: 'Syntactic Connector (ពាក្យតភ្ជាប់)',
    categoryLabelKm: 'ឈ្នាប់ / ពាក្យតភ្ជាប់សំនួន',
    currentTokensBaseline: 18,
    currentTokensCustom: 2,
    proposedTokens: 1,
    tokenSavingPercent: 94,
    priority: 'CRITICAL',
    rationale: 'Telic purposeful preposition ("in order to / for"). Appears on average once every 25 Khmer sentences.',
    rationaleKm: 'ធ្នាក់ប្រាប់គោលបំណង។ កើតឡើងជាមធ្យមម្តងក្នុងរៀងរាល់ ២៥ ប្រយោគខ្មែរ។',
    unicodeSequence: getUnicodeHexSequence('ដើម្បី'),
    coengPresent: true
  },
  {
    clusterOrWord: 'ពីព្រោះ',
    category: 'clitic_connector',
    categoryLabel: 'Syntactic Connector (ពាក្យតភ្ជាប់)',
    categoryLabelKm: 'ឈ្នាប់ / ពាក្យតភ្ជាប់សំនួន',
    currentTokensBaseline: 18,
    currentTokensCustom: 2,
    proposedTokens: 1,
    tokenSavingPercent: 94,
    priority: 'HIGH',
    rationale: 'Direct causal connector ("because"). Prevents fragmented boundary splitting.',
    rationaleKm: 'ឈ្នាប់ប្រាប់មូលហេតុផ្ទាល់។ ការពារការកាត់ផ្តាច់ព្រំដែនពាក្យ។',
    unicodeSequence: getUnicodeHexSequence('ពីព្រោះ'),
    coengPresent: true
  },
  {
    clusterOrWord: 'នៅក្នុង',
    category: 'clitic_connector',
    categoryLabel: 'Syntactic Connector (ពាក្យតភ្ជាប់)',
    categoryLabelKm: 'ឈ្នាប់ / ពាក្យតភ្ជាប់សំនួន',
    currentTokensBaseline: 21,
    currentTokensCustom: 2,
    proposedTokens: 1,
    tokenSavingPercent: 95,
    priority: 'HIGH',
    rationale: 'Locative compound preposition ("inside / located in"). Extremely ubiquitous across all genres.',
    rationaleKm: 'ធ្នាក់ប្រាប់ទីតាំង។ ប្រើប្រាស់ទូទៅបំផុតក្នុងគ្រប់ប្រភេទអត្ថបទ។',
    unicodeSequence: getUnicodeHexSequence('នៅក្នុង'),
    coengPresent: false
  },
  {
    clusterOrWord: 'ជាមួយនឹង',
    category: 'clitic_connector',
    categoryLabel: 'Syntactic Connector (ពាក្យតភ្ជាប់)',
    categoryLabelKm: 'ឈ្នាប់ / ពាក្យតភ្ជាប់សំនួន',
    currentTokensBaseline: 27,
    currentTokensCustom: 3,
    proposedTokens: 1,
    tokenSavingPercent: 96,
    priority: 'RECOMMENDED',
    rationale: 'Comitative preposition ("along with / together with"). Multi-morpheme connector.',
    rationaleKm: 'ធ្នាក់ភ្ជាប់សហភាពពហុព្យាង្គ ដែលគួររក្សាទុកជាថូខិនតែមួយ។',
    unicodeSequence: getUnicodeHexSequence('ជាមួយនឹង'),
    coengPresent: false
  },

  // 4. Modern Technical & Neologism Tokens (បច្ចេកវិទ្យាឌីជីថល)
  {
    clusterOrWord: 'សិប្បនិម្មិត',
    category: 'technical_modern',
    categoryLabel: 'Tech Neologism (បច្ចេកវិទ្យាឌីជីថល)',
    categoryLabelKm: 'បច្ចេកសព្ទឌីជីថលថ្មី',
    currentTokensBaseline: 30,
    currentTokensCustom: 3,
    proposedTokens: 1,
    tokenSavingPercent: 97,
    priority: 'CRITICAL',
    rationale: 'Modern term for "Artificial" (as in AI). Splitting it across 10 byte tokens ruins technical instruction following.',
    rationaleKm: 'ពាក្យសម័យថ្មីសម្រាប់ "បញ្ញាសិប្បនិម្មិត"។ ការបំបែកជា ១០ ថូខិនបៃធ្វើឱ្យខូចសមត្ថភាពអនុវត្តបញ្ជាបច្ចេកទេស។',
    unicodeSequence: getUnicodeHexSequence('សិប្បនិម្មិត'),
    coengPresent: true
  },
  {
    clusterOrWord: 'ឌីជីថល',
    category: 'technical_modern',
    categoryLabel: 'Tech Neologism (បច្ចេកវិទ្យាឌីជីថល)',
    categoryLabelKm: 'បច្ចេកសព្ទឌីជីថលថ្មី',
    currentTokensBaseline: 18,
    currentTokensCustom: 2,
    proposedTokens: 1,
    tokenSavingPercent: 94,
    priority: 'CRITICAL',
    rationale: 'Standard Khmer adaptation of "Digital". Crucial for fintech, government e-services, and IT datasets.',
    rationaleKm: 'ពាក្យស្តង់ដារខ្មែរសម្រាប់ "Digital"។ សំខាន់សម្រាប់ហិរញ្ញវត្ថុបច្ចេកវិទ្យា សេវារដ្ឋាភិបាលឌីជីថល និងទិន្នន័យ IT។',
    unicodeSequence: getUnicodeHexSequence('ឌីជីថល'),
    coengPresent: false
  },
  {
    clusterOrWord: 'ប្រព័ន្ធ',
    category: 'technical_modern',
    categoryLabel: 'Tech Neologism (បច្ចេកវិទ្យាឌីជីថល)',
    categoryLabelKm: 'បច្ចេកសព្ទឌីជីថលថ្មី',
    currentTokensBaseline: 18,
    currentTokensCustom: 2,
    proposedTokens: 1,
    tokenSavingPercent: 94,
    priority: 'HIGH',
    rationale: 'Universal technical lemma for "System". Contains Coeng Ro (្រ) and Bantoc mark.',
    rationaleKm: 'ពាក្យបច្ចេកទេសសកលសម្រាប់ "ប្រព័ន្ធ"។ មានជើង រ (្រ) និងសញ្ញាទណ្ឌឃាត។',
    unicodeSequence: getUnicodeHexSequence('ប្រព័ន្ធ'),
    coengPresent: true
  },
  {
    clusterOrWord: 'ទិន្នន័យ',
    category: 'technical_modern',
    categoryLabel: 'Tech Neologism (បច្ចេកវិទ្យាឌីជីថល)',
    categoryLabelKm: 'បច្ចេកសព្ទឌីជីថលថ្មី',
    currentTokensBaseline: 21,
    currentTokensCustom: 2,
    proposedTokens: 1,
    tokenSavingPercent: 95,
    priority: 'HIGH',
    rationale: 'Technical lemma for "Data". Contains subjoined No (្ន) and independent vowel ligature.',
    rationaleKm: 'ពាក្យបច្ចេកទេសសម្រាប់ "ទិន្នន័យ"។ មានជើង ន (្ន) ត្រួត។',
    unicodeSequence: getUnicodeHexSequence('ទិន្នន័យ'),
    coengPresent: true
  },

  // 5. Administrative & Royal Terminology (រាជការ និងច្បាប់)
  {
    clusterOrWord: 'រាជរដ្ឋាភិបាល',
    category: 'administrative_royal',
    categoryLabel: 'Official / Legal (រាជការ និងច្បាប់)',
    categoryLabelKm: 'រាជការ និងច្បាប់',
    currentTokensBaseline: 36,
    currentTokensCustom: 4,
    proposedTokens: 1,
    tokenSavingPercent: 97,
    priority: 'HIGH',
    rationale: 'Official compound ("Royal Government"). Frequent in state gazettes, legal decrees, and public policy papers.',
    rationaleKm: 'សមាសនាមផ្លូវការប្រើញឹកញាប់ក្នុងរាជកិច្ច ព្រះរាជក្រឹត្យ និងឯកសារគោលនយោបាយសាធារណៈ។',
    unicodeSequence: getUnicodeHexSequence('រាជរដ្ឋាភិបាល'),
    coengPresent: true
  },
  {
    clusterOrWord: 'ព្រះរាជាណាចក្រ',
    category: 'administrative_royal',
    categoryLabel: 'Official / Legal (រាជការ និងច្បាប់)',
    categoryLabelKm: 'រាជការ និងច្បាប់',
    currentTokensBaseline: 42,
    currentTokensCustom: 4,
    proposedTokens: 1,
    tokenSavingPercent: 98,
    priority: 'RECOMMENDED',
    rationale: 'National title prefix ("Kingdom of"). Standard opening of all formal Cambodian state documents.',
    rationaleKm: 'បុព្វបទផ្លូវការនៃឈ្មោះប្រទេស ប្រើនៅដើមឯកសាររដ្ឋកម្ពុជាទាំងអស់។',
    unicodeSequence: getUnicodeHexSequence('ព្រះរាជាណាចក្រ'),
    coengPresent: true
  }
];

/**
 * Identify under-represented syllables and subwords in the provided Khmer text,
 * cross-referenced against the curated pretraining vocabulary catalogue.
 */
export function analyzeUnderRepresentedSyllables(
  text: string,
  customTokens: Set<string> = new Set(),
  language: 'en' | 'km' = 'en'
): VocabSuggestion[] {
  const suggestions: VocabSuggestion[] = [];
  const seenWords = new Set<string>();

  // 1. Scan Curated Catalogue against text occurrences
  KHMER_CURATED_VOCAB_CANDIDATES.forEach((candidate, idx) => {
    let count = 0;
    if (text) {
      const regex = new RegExp(candidate.clusterOrWord, 'g');
      const matches = text.match(regex);
      count = matches ? matches.length : 0;
    }

    // Skip if already in custom vocabulary list
    if (customTokens.has(candidate.clusterOrWord)) return;

    seenWords.add(candidate.clusterOrWord);
    suggestions.push({
      ...candidate,
      id: `curated-${idx}`,
      frequencyInText: count,
      unicodeSequence: getUnicodeHexSequence(candidate.clusterOrWord, language)
    });
  });

  // 2. Discover in-situ under-represented syllables directly from text
  if (text) {
    const syllables = segmentKhmerSyllables(text);
    const syllableCounts = new Map<string, number>();

    syllables.forEach(s => {
      const trimmed = s.trim();
      if (trimmed.length >= 2 && !seenWords.has(trimmed)) {
        syllableCounts.set(trimmed, (syllableCounts.get(trimmed) || 0) + 1);
      }
    });

    let autoId = 1;
    syllableCounts.forEach((count, cluster) => {
      if (customTokens.has(cluster) || COMMON_KHMER_SUBWORDS.has(cluster)) return;

      const hasCoeng = cluster.includes('\u17D2');
      const utf8Bytes = new TextEncoder().encode(cluster).length;

      // Only recommend if it has Coeng or multi-character complex cluster
      if (hasCoeng || cluster.length >= 3) {
        seenWords.add(cluster);
        const baselineTokens = utf8Bytes;
        const saving = Math.round(((baselineTokens - 1) / baselineTokens) * 100);

        suggestions.push({
          id: `discovered-${autoId++}`,
          clusterOrWord: cluster,
          category: hasCoeng ? 'coeng_cluster' : ('orthographic_compound' as VocabCategory),
          categoryLabel: hasCoeng ? 'In-Text Coeng Ligature' : 'In-Text Subword Cluster',
          categoryLabelKm: hasCoeng ? 'ជើងព្យញ្ជនៈក្នុងអត្ថបទ' : 'ចង្កោមព្យាង្គក្នុងអត្ថបទ',
          frequencyInText: count,
          currentTokensBaseline: baselineTokens,
          currentTokensCustom: hasCoeng ? 2 : 1,
          proposedTokens: 1,
          tokenSavingPercent: saving,
          priority: count >= 2 || hasCoeng ? 'HIGH' : 'RECOMMENDED',
          rationale: `Detected in your sample (${count}×). Contains ${hasCoeng ? 'subscript Coeng ligature (្)' : 'multi-character cluster'} taking ${utf8Bytes} raw bytes in baseline models.`,
          rationaleKm: `រកឃើញក្នុងអត្ថបទគំរូ (${count}×)។ មាន${hasCoeng ? 'ជើងព្យញ្ជនៈ (្)' : 'ចង្កោមពហុតួអក្សរ'} ដែលចំណាយ ${utf8Bytes} បៃដើមក្នុងម៉ូដែលស្តង់ដារ។`,
          unicodeSequence: getUnicodeHexSequence(cluster, language),
          coengPresent: hasCoeng
        });
      }
    });
  }

  // Sort by priority: occurrences in text first, then CRITICAL, then HIGH
  return suggestions.sort((a, b) => {
    if (a.frequencyInText > 0 && b.frequencyInText === 0) return -1;
    if (b.frequencyInText > 0 && a.frequencyInText === 0) return 1;
    if (a.frequencyInText !== b.frequencyInText) return b.frequencyInText - a.frequencyInText;

    const rank = { CRITICAL: 3, HIGH: 2, RECOMMENDED: 1 };
    return (rank[b.priority] || 0) - (rank[a.priority] || 0);
  });
}


