/**
 * Khmer Script Validator
 * Comprehensive real-time Regex and Unicode conformance validation engine
 * Compliant with Unicode Standard v16.0 Chapter 16.4 & Royal Academy of Cambodia
 */

export interface ScriptValidationIssue {
  id: string;
  category: 'improper_encoding' | 'cross_script_noise' | 'zero_width_issue' | 'legacy_limon';
  categoryLabel: string;
  severity: 'CRITICAL' | 'WARNING' | 'NOTICE';
  title: string;
  snippet: string;
  explanation: string;
  regexPattern: string;
  startIndex: number;
  endIndex: number;
  suggestedFix?: string;
}

export interface ScriptDistribution {
  khmerPercent: number;
  khmerCharCount: number;
  thaiPercent: number;
  thaiCharCount: number;
  laoPercent: number;
  laoCharCount: number;
  latinPercent: number;
  latinCharCount: number;
  numericPercent: number;
  numericCharCount: number;
  zeroWidthCount: number;
  totalChars: number;
}

export interface ValidationReport {
  purityScore: number; // 0-100
  verdict: 'PRISTINE_UNICODE' | 'REPAIRABLE_ISSUES' | 'HIGHLY_CONTAMINATED';
  distribution: ScriptDistribution;
  issues: ScriptValidationIssue[];
  repairedText: string;
  repairCount: number;
  stats: {
    criticalCount: number;
    warningCount: number;
    noticeCount: number;
  };
}

// 1. REGEX PATTERNS FOR IMPROPERLY ENCODED KHMER
// Standalone dependent vowel (not preceded by base consonant U+1780-17A2 or independent vowel U+17A3-17B3 or Coeng cluster)
const REGEX_STANDALONE_DEPENDENT_VOWEL = /(?:^|[^\u1780-\u17B3\u17D2])([\u17B6-\u17C5]+)/g;

// Dangling Coeng (Coeng U+17D2 at end of string or followed by non-consonant)
const REGEX_DANGLING_COENG = /\u17D2(?=[^\u1780-\u17A2]|$)/g;

// Consecutive Coeng signs (Double Coeng U+17D2 U+17D2)
const REGEX_DOUBLE_COENG = /\u17D2\u17D2+/g;

// Consecutive or Stacked Dependent Vowels (e.g. ាើ or ិី)
const REGEX_STACKED_DEPENDENT_VOWELS = /[\u17B6-\u17C5]{2,}/g;

// Duplicate consecutive diacritics (e.g. double Bantoc U+17CB, double Reahmuk U+17C7)
const REGEX_DUPLICATE_DIACRITICS = /([\u17C6-\u17D3])\1+/g;

// 2. REGEX PATTERNS FOR CROSS-SCRIPT NOISE
// Thai Script (U+0E00 to U+0E7F)
const REGEX_THAI_SCRIPT = /[\u0E00-\u0E7F]+/g;

// Lao Script (U+0E80 to U+0EFF)
const REGEX_LAO_SCRIPT = /[\u0E80-\u0EFF]+/g;

// Myanmar / Burmese Script (U+1000 to U+109F)
const REGEX_MYANMAR_SCRIPT = /[\u1000-\u109F]+/g;

// Devanagari Script (U+0900 to U+097F)
const REGEX_DEVANAGARI_SCRIPT = /[\u0900-\u097F]+/g;

// 3. REGEX PATTERNS FOR ZERO-WIDTH CHARACTERS (ZWJ / ZWNJ / ZWSP)
// Missing ZWJ before isolated Coeng subscript: e.g. space followed immediately by Coeng + Consonant without U+200D
// In Unicode 16.4, isolated subscripts in linguistic texts MUST be encoded as <SPACE, ZWJ, COENG, CONSONANT>
const REGEX_MISSING_ZWJ_ISOLATED_COENG = /(?:^|\s)\u17D2([\u1780-\u17A2])/g;

// Displaced ZWNJ breaking valid consonant conjunct (Consonant + ZWNJ + Coeng)
const REGEX_DISPLACED_ZWNJ_IN_CLUSTER = /[\u1780-\u17A2]\u200C\u17D2/g;

// Erroneous Zero-Width Space (ZWSP U+200B) splitting a consonant and its dependent vowel or Coeng
const REGEX_ZWSP_SPLITTING_CLUSTER = /[\u1780-\u17A2]\u200B[\u17D2\u17B6-\u17C5]/g;

// Excessive or duplicate consecutive zero-width characters (ZWJ, ZWNJ, ZWSP, BOM)
const REGEX_CONSECUTIVE_ZERO_WIDTH = /[\u200B\u200C\u200D\uFEFF]{2,}/g;

// 4. REGEX PATTERNS FOR LEGACY LIMON / ABC ASCII CODING
const REGEX_LEGACY_LIMON_TERMS = /\b(kñúM|Kit|eRkAR|sRmab;|eqH|Edl|mYy|rbs;|Gñk|bBa¢a|enH|GVI|sßay|Bit|dUc)\b/g;

/**
 * Validates text against all Khmer Unicode rules and returns an in-depth diagnostic report
 */
export function validateKhmerScript(text: string, language: 'en' | 'km' = 'en'): ValidationReport {
  const isKm = language === 'km';

  if (!text || text.length === 0) {
    return {
      purityScore: 100,
      verdict: 'PRISTINE_UNICODE',
      distribution: {
        khmerPercent: 0,
        khmerCharCount: 0,
        thaiPercent: 0,
        thaiCharCount: 0,
        laoPercent: 0,
        laoCharCount: 0,
        latinPercent: 0,
        latinCharCount: 0,
        numericPercent: 0,
        numericCharCount: 0,
        zeroWidthCount: 0,
        totalChars: 0
      },
      issues: [],
      repairedText: '',
      repairCount: 0,
      stats: { criticalCount: 0, warningCount: 0, noticeCount: 0 }
    };
  }

  const issues: ScriptValidationIssue[] = [];
  const len = text.length;

  let khmerChars = 0;
  let thaiChars = 0;
  let laoChars = 0;
  let latinChars = 0;
  let numericChars = 0;
  let zeroWidthChars = 0;

  for (let i = 0; i < len; i++) {
    const code = text.charCodeAt(i);
    // Khmer U+1780 - U+17FF & U+19E0 - U+19FF
    if ((code >= 0x1780 && code <= 0x17FF) || (code >= 0x19E0 && code <= 0x19FF)) {
      khmerChars++;
    } else if (code >= 0x0E00 && code <= 0x0E7F) {
      thaiChars++;
    } else if (code >= 0x0E80 && code <= 0x0EFF) {
      laoChars++;
    } else if ((code >= 0x0041 && code <= 0x005A) || (code >= 0x0061 && code <= 0x007A)) {
      latinChars++;
    } else if ((code >= 0x0030 && code <= 0x0039) || (code >= 0x17E0 && code <= 0x17E9)) {
      numericChars++;
    } else if (code === 0x200B || code === 0x200C || code === 0x200D || code === 0xFEFF) {
      zeroWidthChars++;
    }
  }

  // --- RULE 1: Detect Cross-Script Thai Intrusion ---
  let match: RegExpExecArray | null;
  const thaiRegex = new RegExp(REGEX_THAI_SCRIPT);
  while ((match = thaiRegex.exec(text)) !== null) {
    issues.push({
      id: `thai-intrusion-${match.index}`,
      category: 'cross_script_noise',
      categoryLabel: isKm ? 'ការជ្រៀតជ្រែកអក្សរឆ្លងភាសា' : 'Cross-Script Intrusion',
      severity: 'CRITICAL',
      title: isKm ? 'ការជ្រៀតជ្រែកតួអក្សរថៃ (ភាសាថៃ)' : 'Thai Character Intrusion (ភាសាថៃជ្រៀតជ្រែក)',
      snippet: match[0],
      explanation: isKm
        ? `រកឃើញតួអក្សរថៃ "${match[0]}" (U+0E00–U+0E7F)។ កើតមានញឹកញាប់ក្នុងទិន្នន័យវេបសាយមិនទាន់សម្អាត ឬវចនានុក្រមបកប្រែលាយឡំ ដែលធ្វើឱ្យខូចការបង្វឹកម៉ូដែលភាសាខ្មែរ។`
        : `Found Thai script snippet "${match[0]}" (U+0E00–U+0E7F). Common in uncurated web crawls or mixed regional translation dictionaries. Breaks Khmer language modeling.`,
      regexPattern: '/[\\u0E00-\\u0E7F]+/',
      startIndex: match.index,
      endIndex: match.index + match[0].length,
      suggestedFix: isKm ? 'លុបចោល ឬញែកតួអក្សរថៃចេញពីអត្ថបទ។' : 'Remove or isolate foreign Thai characters.'
    });
  }

  // --- RULE 2: Detect Cross-Script Lao Intrusion ---
  const laoRegex = new RegExp(REGEX_LAO_SCRIPT);
  while ((match = laoRegex.exec(text)) !== null) {
    issues.push({
      id: `lao-intrusion-${match.index}`,
      category: 'cross_script_noise',
      categoryLabel: isKm ? 'ការជ្រៀតជ្រែកអក្សរឆ្លងភាសា' : 'Cross-Script Intrusion',
      severity: 'CRITICAL',
      title: isKm ? 'ការជ្រៀតជ្រែកតួអក្សរឡាវ (ភាសាឡាវ)' : 'Lao Character Intrusion (ភាសាឡាវជ្រៀតជ្រែក)',
      snippet: match[0],
      explanation: isKm
        ? `រកឃើញតួអក្សរឡាវ "${match[0]}" (U+0E80–U+0EFF) ដែលធ្វើឱ្យបំពុលឃ្លាំងទិន្នន័យអាស៊ីអាគ្នេយ៍។`
        : `Found Lao script snippet "${match[0]}" (U+0E80–U+0EFF). Pollutes low-resource Southeast Asian crawls.`,
      regexPattern: '/[\\u0E80-\\u0EFF]+/',
      startIndex: match.index,
      endIndex: match.index + match[0].length,
      suggestedFix: isKm ? 'សម្អាតតួអក្សរឡាវចេញពីឯកសារបង្វឹកភាសាខ្មែរ។' : 'Purge Lao characters from Khmer pretraining document.'
    });
  }

  // --- RULE 3: Detect Legacy Limon / ABC Font Mappings ---
  const limonRegex = new RegExp(REGEX_LEGACY_LIMON_TERMS);
  while ((match = limonRegex.exec(text)) !== null) {
    issues.push({
      id: `legacy-limon-${match.index}`,
      category: 'legacy_limon',
      categoryLabel: isKm ? 'កូដពុម្ពអក្សរចាស់ 8-bit' : 'Legacy 8-bit Encoding',
      severity: 'CRITICAL',
      title: isKm ? 'កូដពុម្ពអក្សរចាស់ Limon / ABC ASCII' : 'Legacy Limon / ABC ASCII Font Artifact (អក្សរ Limon ចាស់)',
      snippet: match[0],
      explanation: isKm
        ? `រកឃើញពាក្យ "${match[0]}" ដែលជាកូដពុម្ពអក្សរចាស់ Limon សម្រាប់ភាសាខ្មែរ (ឧ. 'Edl' សម្រាប់ 'ដែល', 'kñúM' សម្រាប់ 'ខ្ញុំ')។ វាបង្ហាញជាអក្សរឡាតាំងឥតន័យក្នុងយូនីកូដ។`
        : `Found token "${match[0]}" which is a classic Limon font mapping for Khmer (e.g., 'Edl' for 'ដែល', 'kñúM' for 'ខ្ញុំ'). It renders as nonsense in Unicode.`,
      regexPattern: '\\b(kñúM|Kit|eRkAR|Edl|mYy|rbs;|...)\\b',
      startIndex: match.index,
      endIndex: match.index + match[0].length,
      suggestedFix: isKm ? 'បម្លែងតាមតារាង Limon-ទៅ-Unicode ឬលុបកថាខណ្ឌចោល។' : 'Re-encode via Limon-to-Unicode conversion table or discard paragraph.'
    });
  }

  // --- RULE 4: Detect Standalone Dependent Vowel ---
  const standaloneVowelRegex = new RegExp(REGEX_STANDALONE_DEPENDENT_VOWEL);
  while ((match = standaloneVowelRegex.exec(text)) !== null) {
    const vowelSnippet = match[1];
    const actualStart = match.index + (match[0].length - vowelSnippet.length);
    issues.push({
      id: `standalone-vowel-${actualStart}`,
      category: 'improper_encoding',
      categoryLabel: isKm ? 'អក្ខរាវិរុទ្ធមិនត្រឹមត្រូវ' : 'Invalid Orthography',
      severity: 'CRITICAL',
      title: isKm ? 'ស្រៈនិស្ស័យនៅទំនេរគ្មានព្យញ្ជនៈគោល' : 'Standalone Dependent Vowel (ស្រៈនិស្ស័យគ្មានព្យញ្ជនៈគោល)',
      snippet: vowelSnippet,
      explanation: isKm
        ? `ស្រៈនិស្ស័យខ្មែរ "${vowelSnippet}" (U+${vowelSnippet.charCodeAt(0).toString(16).toUpperCase()}) ត្រូវតែភ្ជាប់ជាមួយព្យញ្ជនៈ ឬស្រៈពេញតួ។ ស្រៈនៅទំនេរធ្វើឱ្យខូចការបង្ហាញពុម្ពអក្សរ។`
        : `Khmer dependent vowel "${vowelSnippet}" (U+${vowelSnippet.charCodeAt(0).toString(16).toUpperCase()}) must attach to a consonant or independent vowel. Standalone vowels crash HarfBuzz/Uniscribe shaping engines.`,
      regexPattern: '(?:^|[^\\u1780-\\u17B3\\u17D2])([\\u17B6-\\u17C5]+)',
      startIndex: actualStart,
      endIndex: actualStart + vowelSnippet.length,
      suggestedFix: isKm ? 'ថែមព្យញ្ជនៈគោល (ឧ. អ U+17A2) ឬលុបស្រៈខុសទីតាំងចេញ។' : 'Prefix with base consonant (e.g. អ U+17A2) or remove misplaced vowel.'
    });
  }

  // --- RULE 5: Detect Dangling Coeng ---
  const danglingCoengRegex = new RegExp(REGEX_DANGLING_COENG);
  while ((match = danglingCoengRegex.exec(text)) !== null) {
    issues.push({
      id: `dangling-coeng-${match.index}`,
      category: 'improper_encoding',
      categoryLabel: isKm ? 'អក្ខរាវិរុទ្ធមិនត្រឹមត្រូវ' : 'Invalid Orthography',
      severity: 'CRITICAL',
      title: isKm ? 'សញ្ញាជើង (្) នៅទំនេរគ្មានព្យញ្ជនៈបន្ទាប់' : 'Dangling Coeng Subscript Sign (ជើង ្ គ្មានព្យញ្ជនៈបន្ទាប់)',
      snippet: '្',
      explanation: isKm
        ? 'សញ្ញាជើង (U+17D2) មិនមានព្យញ្ជនៈត្រឹមត្រូវតាមពីក្រោយឡើយ។ ក្នុងយូនីកូដ ជើងមិនអាចឈរតែឯង ឬនៅចុងពាក្យដោយគ្មានព្យញ្ជនៈផ្ញើជើងបានទេ។'
        : 'Coeng (U+17D2) is not followed by a valid subscript consonant. In Unicode, Coeng cannot stand alone or end a word without a subjoined glyph.',
      regexPattern: '\\u17D2(?=[^\\u1780-\\u17A2]|$)',
      startIndex: match.index,
      endIndex: match.index + 1,
      suggestedFix: isKm ? 'លុបសញ្ញាជើងដែលលើស ឬបំពេញព្យញ្ជនៈជើងដែលបាត់។' : 'Delete orphaned Coeng sign or provide the missing subjoined consonant.'
    });
  }

  // --- RULE 6: Detect Double Coeng ---
  const doubleCoengRegex = new RegExp(REGEX_DOUBLE_COENG);
  while ((match = doubleCoengRegex.exec(text)) !== null) {
    issues.push({
      id: `double-coeng-${match.index}`,
      category: 'improper_encoding',
      categoryLabel: isKm ? 'អក្ខរាវិរុទ្ធមិនត្រឹមត្រូវ' : 'Invalid Orthography',
      severity: 'CRITICAL',
      title: isKm ? 'សញ្ញាជើងត្រួតគ្នាពីរដងខុសក្បួន (្្)' : 'Illegal Double Coeng (សញ្ញា ្្ ត្រួតគ្នាពីរដង)',
      snippet: match[0],
      explanation: isKm
        ? 'សញ្ញាជើងជាប់គ្នាពីរដង (U+17D2 U+17D2) ខុសនឹងស្តង់ដារ TR31 និងបង្កកំហុសបង្ហាញពុម្ពអក្សរ។'
        : 'Multiple consecutive Coeng characters (U+17D2 U+17D2) are illegal under TR31 and cause font rendering errors.',
      regexPattern: '\\u17D2\\u17D2+',
      startIndex: match.index,
      endIndex: match.index + match[0].length,
      suggestedFix: isKm ? 'កាត់បន្ថយមកត្រឹមសញ្ញាជើងតែមួយ។' : 'Deduplicate to a single Coeng sign.'
    });
  }

  // --- RULE 7: Detect Consecutive/Stacked Dependent Vowels ---
  const stackedVowelsRegex = new RegExp(REGEX_STACKED_DEPENDENT_VOWELS);
  while ((match = stackedVowelsRegex.exec(text)) !== null) {
    issues.push({
      id: `stacked-vowels-${match.index}`,
      category: 'improper_encoding',
      categoryLabel: isKm ? 'អក្ខរាវិរុទ្ធមិនត្រឹមត្រូវ' : 'Invalid Orthography',
      severity: 'CRITICAL',
      title: isKm ? 'ស្រៈនិស្ស័យត្រួតគ្នាខុសក្បួន' : 'Illegal Stacked Dependent Vowels (ស្រៈនិស្ស័យត្រួតគ្នា)',
      snippet: match[0],
      explanation: isKm
        ? `ក្បួនអក្ខរាវិរុទ្ធខ្មែរហាមឃាត់ការដាក់ស្រៈនិស្ស័យត្រួតគ្នា "${match[0]}"។ ព្យាង្គមួយអាចមានស្រៈនិស្ស័យតែមួយគត់។`
        : `Khmer syllable grammar forbids stacking multiple dependent vowels "${match[0]}". Syllables can only contain one dependent vowel.`,
      regexPattern: '[\\u17B6-\\u17C5]{2,}',
      startIndex: match.index,
      endIndex: match.index + match[0].length,
      suggestedFix: isKm ? 'លុបស្រៈនិស្ស័យដែលវាយលើសចេញ។' : 'Remove the erroneous extra vowel sign.'
    });
  }

  // --- RULE 8: Detect Duplicate Diacritics ---
  const duplicateDiacriticsRegex = new RegExp(REGEX_DUPLICATE_DIACRITICS);
  while ((match = duplicateDiacriticsRegex.exec(text)) !== null) {
    issues.push({
      id: `duplicate-diacritics-${match.index}`,
      category: 'improper_encoding',
      categoryLabel: isKm ? 'អក្ខរាវិរុទ្ធមិនត្រឹមត្រូវ' : 'Invalid Orthography',
      severity: 'WARNING',
      title: isKm ? 'សញ្ញាវណ្ណយុត្តិលើអក្សរត្រួតគ្នា' : 'Duplicate Consecutive Diacritic Mark (សញ្ញាលើត្រួតគ្នា)',
      snippet: match[0],
      explanation: isKm
        ? `សញ្ញាវណ្ណយុត្តិត្រួតគ្នា "${match[0]}"។ ក្នុងភាសាខ្មែរ សញ្ញាបន្តក់ (់) ឬរះមុខ (ះ) មិនអាចសរសេរផ្ទួនជាប់គ្នាបានទេ។`
        : `Duplicate consecutive diacritic mark "${match[0]}". In Khmer, marks like Bantoc (់) or Reahmuk (ះ) cannot be repeated in succession.`,
      regexPattern: '([\\u17C6-\\u17D3])\\1+',
      startIndex: match.index,
      endIndex: match.index + match[0].length,
      suggestedFix: isKm ? 'បង្រួមមកត្រឹមសញ្ញាវណ្ណយុត្តិតែមួយ។' : 'Collapse to a single diacritic.'
    });
  }

  // --- RULE 9: Detect Missing ZWJ in Isolated Coeng Presentation ---
  const missingZwjRegex = new RegExp(REGEX_MISSING_ZWJ_ISOLATED_COENG);
  while ((match = missingZwjRegex.exec(text)) !== null) {
    const rawMatch = match[0];
    const offset = rawMatch.startsWith(' ') ? 1 : 0;
    const startIndex = match.index + offset;
    issues.push({
      id: `missing-zwj-coeng-${startIndex}`,
      category: 'zero_width_issue',
      categoryLabel: isKm ? 'តួអក្សរតភ្ជាប់ ZWJ' : 'Zero-Width Joiner (ZWJ)',
      severity: 'WARNING',
      title: isKm ? 'ខ្វះ ZWJ ក្នុងការបង្ហាញជើងព្យញ្ជនៈទោល' : 'Missing ZWJ in Isolated Subscript Ligature',
      snippet: rawMatch.trim(),
      explanation: isKm
        ? `ការបង្ហាញជើងទោល "${rawMatch.trim()}" ខ្វះ Zero-Width Joiner (U+200D)។ តាម Unicode 16.4 ត្រូវសរសេរ <SPACE, ZWJ, COENG, CONSONANT> ដើម្បីកុំឱ្យខូច OpenType។`
        : `Isolated subscript presentation "${rawMatch.trim()}" lacks Zero-Width Joiner (U+200D). According to Unicode 16.4, displaying a standalone subscript glyph without a preceding base consonant requires <SPACE, ZWJ, COENG, CONSONANT>. Without ZWJ, it causes OpenType rendering failures.`,
      regexPattern: '(?:^|\\s)\\u17D2([\\u1780-\\u17A2])',
      startIndex,
      endIndex: startIndex + rawMatch.trim().length,
      suggestedFix: isKm ? 'បញ្ចូល ZWJ (U+200D) រវាងដកឃ្លា និងសញ្ញាជើង។' : 'Insert ZWJ (U+200D) between space and Coeng sign.'
    });
  }

  // --- RULE 10: Detect Displaced ZWNJ Breaking Subscript Cluster ---
  const displacedZwnjRegex = new RegExp(REGEX_DISPLACED_ZWNJ_IN_CLUSTER);
  while ((match = displacedZwnjRegex.exec(text)) !== null) {
    issues.push({
      id: `displaced-zwnj-${match.index}`,
      category: 'zero_width_issue',
      categoryLabel: isKm ? 'តួអក្សរគ្រប់គ្រង ZWNJ' : 'Zero-Width Control (ZWNJ)',
      severity: 'WARNING',
      title: isKm ? 'មាន ZWNJ ខុសទីតាំងផ្តាច់ជើងព្យញ្ជនៈ' : 'Stray ZWNJ Breaking Subscript Ligature Cluster',
      snippet: match[0].replace('\u200C', '[ZWNJ]'),
      explanation: isKm
        ? 'មានតួអក្សរ Zero-Width Non-Joiner (U+200C) នៅពីមុខសញ្ញាជើង ដែលរារាំងព្យញ្ជនៈមិនឱ្យផ្ញើជើងជាមួយគ្នាបាន។'
        : 'Zero-Width Non-Joiner (U+200C) is placed directly before a Coeng sign, suppressing normal subscript formation (e.g., breaking "ក្ម" into unjoined glyphs).',
      regexPattern: '[\\u1780-\\u17A2]\\u200C\\u17D2',
      startIndex: match.index,
      endIndex: match.index + match[0].length,
      suggestedFix: isKm ? 'លុប ZWNJ ដែលមិនត្រូវការដើម្បីភ្ជាប់ជើងព្យញ្ជនៈឡើងវិញ។' : 'Remove unwanted ZWNJ to restore authentic Khmer ligature.'
    });
  }

  // --- RULE 11: Detect ZWSP Splitting Syllable Internal Structure ---
  const zwspSplittingRegex = new RegExp(REGEX_ZWSP_SPLITTING_CLUSTER);
  while ((match = zwspSplittingRegex.exec(text)) !== null) {
    issues.push({
      id: `zwsp-split-${match.index}`,
      category: 'zero_width_issue',
      categoryLabel: isKm ? 'តួអក្សរដកឃ្លាមើលមិនឃើញ ZWSP' : 'Zero-Width Space (ZWSP)',
      severity: 'NOTICE',
      title: isKm ? 'តួអក្សរ ZWSP កាត់ផ្តាច់ព្យាង្គខាងក្នុង' : 'Zero-Width Space (ZWSP) Splitting Syllable Ligature',
      snippet: match[0].replace('\u200B', '[ZWSP]'),
      explanation: isKm
        ? 'មាន ZWSP (U+200B) នៅចន្លោះព្យញ្ជនៈ និងជើង ឬស្រៈនិស្ស័យ ដែលធ្វើឱ្យ SentencePiece បំបែកថូខិនខុស។'
        : 'Zero-Width Space (U+200B) was inserted inside a consonant cluster or between a base consonant and vowel, causing token fragmentation in SentencePiece.',
      regexPattern: '[\\u1780-\\u17A2]\\u200B[\\u17D2\\u17B6-\\u17C5]',
      startIndex: match.index,
      endIndex: match.index + match[0].length,
      suggestedFix: isKm ? 'ផ្លាស់ប្តូរ ZWSP ទៅដាក់នៅចុងពាក្យ ឬចន្លោះព្យាង្គវិញ។' : 'Relocate ZWSP to word or syllable boundary only.'
    });
  }

  // --- RULE 12: Detect Excessive Consecutive Zero-Width Characters ---
  const consecutiveZeroRegex = new RegExp(REGEX_CONSECUTIVE_ZERO_WIDTH);
  while ((match = consecutiveZeroRegex.exec(text)) !== null) {
    issues.push({
      id: `consecutive-zero-width-${match.index}`,
      category: 'zero_width_issue',
      categoryLabel: isKm ? 'ការគ្រប់គ្រង Zero-Width' : 'Zero-Width Control',
      severity: 'WARNING',
      title: isKm ? 'តួអក្សរ Zero-Width មើលមិនឃើញជាប់គ្នាច្រើនពេក' : 'Consecutive Invisible Zero-Width Characters',
      snippet: isKm ? `[កូដមើលមិនឃើញ ${match[0].length}×]` : `[${match[0].length}× Invisible Codes]`,
      explanation: isKm
        ? `រកឃើញតួអក្សរ Zero-Width (ZWSP, ZWNJ, ZWJ ឬ BOM) ជាប់គ្នាចំនួន ${match[0].length} ដង ដែលបន្ថយប្រសិទ្ធភាពថូខិន LLM។`
        : `Found ${match[0].length} consecutive zero-width characters (ZWSP, ZWNJ, ZWJ, or BOM). Unnecessary invisible byte inflation degrades LLM token efficiency.`,
      regexPattern: '[\\u200B\\u200C\\u200D\\uFEFF]{2,}',
      startIndex: match.index,
      endIndex: match.index + match[0].length,
      suggestedFix: isKm ? 'បង្រួមមកត្រឹម ZWSP តែមួយនៅចុងពាក្យ។' : 'Deduplicate to single ZWSP at word boundary.'
    });
  }

  // Sort issues by start index
  issues.sort((a, b) => a.startIndex - b.startIndex);

  // Calculate Distribution
  const nonZeroTotal = Math.max(1, len);
  const khmerPercent = Number(((khmerChars / nonZeroTotal) * 100).toFixed(1));
  const thaiPercent = Number(((thaiChars / nonZeroTotal) * 100).toFixed(1));
  const laoPercent = Number(((laoChars / nonZeroTotal) * 100).toFixed(1));
  const latinPercent = Number(((latinChars / nonZeroTotal) * 100).toFixed(1));
  const numericPercent = Number(((numericChars / nonZeroTotal) * 100).toFixed(1));

  // Count severities
  const criticalCount = issues.filter(i => i.severity === 'CRITICAL').length;
  const warningCount = issues.filter(i => i.severity === 'WARNING').length;
  const noticeCount = issues.filter(i => i.severity === 'NOTICE').length;

  // Compute Purity Score (0 to 100)
  let score = 100;
  score -= criticalCount * 18;
  score -= warningCount * 8;
  score -= noticeCount * 3;
  if (thaiPercent > 0) score -= Math.min(30, thaiPercent * 1.5);
  if (laoPercent > 0) score -= Math.min(30, laoPercent * 1.5);
  if (khmerPercent < 50 && len > 30) score -= 20;

  const purityScore = Math.max(0, Math.min(100, Math.round(score)));

  let verdict: ValidationReport['verdict'] = 'PRISTINE_UNICODE';
  if (purityScore < 60 || criticalCount >= 3) {
    verdict = 'HIGHLY_CONTAMINATED';
  } else if (purityScore < 95 || issues.length > 0) {
    verdict = 'REPAIRABLE_ISSUES';
  }

  // Perform Automatic Repair
  const { repairedText, repairCount } = autoRepairKhmerScript(text);

  return {
    purityScore,
    verdict,
    distribution: {
      khmerPercent,
      khmerCharCount: khmerChars,
      thaiPercent,
      thaiCharCount: thaiChars,
      laoPercent,
      laoCharCount: laoChars,
      latinPercent,
      latinCharCount: latinChars,
      numericPercent,
      numericCharCount: numericChars,
      zeroWidthCount: zeroWidthChars,
      totalChars: len
    },
    issues,
    repairedText,
    repairCount,
    stats: { criticalCount, warningCount, noticeCount }
  };
}

/**
 * Automatically repairs known Khmer script encoding errors and purges foreign script intrusion
 */
export function autoRepairKhmerScript(text: string): { repairedText: string; repairCount: number } {
  if (!text) return { repairedText: '', repairCount: 0 };

  let repaired = text;
  let count = 0;

  // 1. Remove Thai & Lao intrusions
  const beforeThaiLao = repaired;
  repaired = repaired.replace(/[\u0E00-\u0E7F\u0E80-\u0EFF]+/g, ' ');
  if (repaired !== beforeThaiLao) count++;

  // 2. Collapse double Coeng
  const beforeDoubleCoeng = repaired;
  repaired = repaired.replace(/\u17D2\u17D2+/g, '\u17D2');
  if (repaired !== beforeDoubleCoeng) count++;

  // 3. Remove dangling Coeng (at word boundaries or followed by spaces/punctuation)
  const beforeDanglingCoeng = repaired;
  repaired = repaired.replace(/\u17D2(?=[^\u1780-\u17A2]|$)/g, '');
  if (repaired !== beforeDanglingCoeng) count++;

  // 4. Remove duplicate diacritics
  const beforeDiacritics = repaired;
  repaired = repaired.replace(/([\u17C6-\u17D3])\1+/g, '$1');
  if (repaired !== beforeDiacritics) count++;

  // 5. Remove displaced ZWNJ breaking Coeng clusters (Consonant + ZWNJ + Coeng -> Consonant + Coeng)
  const beforeZwnj = repaired;
  repaired = repaired.replace(/([\u1780-\u17A2])\u200C\u17D2/g, '$1\u17D2');
  if (repaired !== beforeZwnj) count++;

  // 6. Fix ZWSP splitting syllable clusters (Consonant + ZWSP + Coeng/Vowel -> Consonant + Coeng/Vowel)
  const beforeZwsp = repaired;
  repaired = repaired.replace(/([\u1780-\u17A2])\u200B([\u17D2\u17B6-\u17C5])/g, '$1$2');
  if (repaired !== beforeZwsp) count++;

  // 7. Collapse consecutive zero-width characters
  const beforeConsecutiveZero = repaired;
  repaired = repaired.replace(/[\u200B\u200C\u200D\uFEFF]{2,}/g, '\u200B');
  if (repaired !== beforeConsecutiveZero) count++;

  // 8. Fix missing ZWJ in isolated Coeng representations (Space + Coeng + Consonant -> Space + ZWJ + Coeng + Consonant)
  const beforeIsolatedCoeng = repaired;
  repaired = repaired.replace(/(^|\s)\u17D2([\u1780-\u17A2])/g, '$1\u200D\u17D2$2');
  if (repaired !== beforeIsolatedCoeng) count++;

  // 9. Clean excessive spaces
  repaired = repaired.replace(/[ \t]{2,}/g, ' ').trim();

  return {
    repairedText: repaired,
    repairCount: count
  };
}
