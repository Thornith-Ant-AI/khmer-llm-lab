export type KhmerSyntaxCategory =
  | 'consonant'
  | 'vowel'
  | 'coeng_stack'
  | 'diacritic'
  | 'punctuation'
  | 'numeral'
  | 'other';

export interface KhmerSyntaxToken {
  id: number;
  text: string;
  category: KhmerSyntaxCategory;
  codepoints: string[];
  isValid: boolean;
  start: number;
  end: number;
}

export interface KhmerSyllableHighlightUnit {
  id: number;
  text: string;
  hasCoeng: boolean;
  hasVowel: boolean;
  hasConsonant: boolean;
  hasDiacritic: boolean;
  primaryCategory: 'coeng_stack' | 'vowel' | 'consonant' | 'diacritic' | 'other';
  parts: KhmerSyntaxToken[];
}

export interface KhmerSyntaxAnalysis {
  tokens: KhmerSyntaxToken[];
  syllableUnits: KhmerSyllableHighlightUnit[];
  counts: {
    consonants: number;
    vowels: number;
    coengStacks: number;
    diacritics: number;
    other: number;
    totalKhmerUnits: number;
  };
}

const isKhmerConsonant = (code: number) => code >= 0x1780 && code <= 0x17a2;
const isKhmerIndependentVowel = (code: number) => code >= 0x17a3 && code <= 0x17b3;
const isKhmerDependentVowel = (code: number) => code >= 0x17b6 && code <= 0x17c5;
const isKhmerDiacritic = (code: number) =>
  (code >= 0x17c6 && code <= 0x17d1) || code === 0x17d3 || code === 0x17dd;
const isKhmerPunctuation = (code: number) => code >= 0x17d4 && code <= 0x17da;
const isKhmerNumeral = (code: number) => code >= 0x17e0 && code <= 0x17e9;
const COENG_CODE = 0x17d2;

const toHexCodepoint = (ch: string) =>
  `U+${ch.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0')}`;

/**
 * Parses raw Khmer/mixed text into fine-grained linguistic syntax tokens
 * (Consonants, Independent/Dependent Vowels, Coeng Subscript Stacks, Diacritics)
 * and HarfBuzz-safe syllable cluster units for live syntax highlighting.
 */
export function analyzeKhmerSyntax(text: string): KhmerSyntaxAnalysis {
  const tokens: KhmerSyntaxToken[] = [];
  let tokenId = 0;
  let i = 0;

  let consonants = 0;
  let vowels = 0;
  let coengStacks = 0;
  let diacritics = 0;
  let other = 0;

  while (i < text.length) {
    const ch = text[i];
    const code = ch.charCodeAt(0);

    // Coeng subscript stack: \u17D2 + Consonant (or dangling Coeng)
    if (code === COENG_CODE) {
      const next = text[i + 1];
      const nextCode = next ? next.charCodeAt(0) : -1;
      if (next && isKhmerConsonant(nextCode)) {
        const pair = ch + next;
        tokens.push({
          id: tokenId++,
          text: pair,
          category: 'coeng_stack',
          codepoints: [toHexCodepoint(ch), toHexCodepoint(next)],
          isValid: true,
          start: i,
          end: i + 2
        });
        coengStacks++;
        i += 2;
      } else {
        tokens.push({
          id: tokenId++,
          text: ch,
          category: 'coeng_stack',
          codepoints: [toHexCodepoint(ch)],
          isValid: false,
          start: i,
          end: i + 1
        });
        coengStacks++;
        i += 1;
      }
      continue;
    }

    if (isKhmerConsonant(code)) {
      tokens.push({
        id: tokenId++,
        text: ch,
        category: 'consonant',
        codepoints: [toHexCodepoint(ch)],
        isValid: true,
        start: i,
        end: i + 1
      });
      consonants++;
      i += 1;
      continue;
    }

    if (isKhmerIndependentVowel(code) || isKhmerDependentVowel(code)) {
      tokens.push({
        id: tokenId++,
        text: ch,
        category: 'vowel',
        codepoints: [toHexCodepoint(ch)],
        isValid: true,
        start: i,
        end: i + 1
      });
      vowels++;
      i += 1;
      continue;
    }

    if (isKhmerDiacritic(code)) {
      tokens.push({
        id: tokenId++,
        text: ch,
        category: 'diacritic',
        codepoints: [toHexCodepoint(ch)],
        isValid: true,
        start: i,
        end: i + 1
      });
      diacritics++;
      i += 1;
      continue;
    }

    if (isKhmerPunctuation(code)) {
      tokens.push({
        id: tokenId++,
        text: ch,
        category: 'punctuation',
        codepoints: [toHexCodepoint(ch)],
        isValid: true,
        start: i,
        end: i + 1
      });
      other++;
      i += 1;
      continue;
    }

    if (isKhmerNumeral(code)) {
      tokens.push({
        id: tokenId++,
        text: ch,
        category: 'numeral',
        codepoints: [toHexCodepoint(ch)],
        isValid: true,
        start: i,
        end: i + 1
      });
      other++;
      i += 1;
      continue;
    }

    // Group contiguous whitespace or non-Khmer runs for cleaner visual output
    let j = i + 1;
    while (j < text.length) {
      const c = text.charCodeAt(j);
      if (c >= 0x1780 && c <= 0x17ff) break;
      if ((text[i] === ' ') !== (text[j] === ' ')) break;
      j++;
    }
    tokens.push({
      id: tokenId++,
      text: text.slice(i, j),
      category: 'other',
      codepoints: Array.from(text.slice(i, j)).map(toHexCodepoint),
      isValid: true,
      start: i,
      end: j
    });
    if (text[i].trim().length > 0) {
      other += j - i;
    }
    i = j;
  }

  // Group into HarfBuzz-safe Khmer syllable highlight units
  const syllableUnits: KhmerSyllableHighlightUnit[] = [];
  let unitId = 0;
  let idx = 0;

  while (idx < tokens.length) {
    const tok = tokens[idx];

    // Base consonant starts a potential syllable cluster: Base + (Coeng)* + (Dependent Vowel)* + (Diacritic)*
    if (tok.category === 'consonant') {
      const parts: KhmerSyntaxToken[] = [tok];
      let k = idx + 1;
      while (k < tokens.length) {
        const nextTok = tokens[k];
        if (
          nextTok.category === 'coeng_stack' ||
          nextTok.category === 'diacritic' ||
          (nextTok.category === 'vowel' &&
            isKhmerDependentVowel(nextTok.text.charCodeAt(0)))
        ) {
          parts.push(nextTok);
          k++;
        } else {
          break;
        }
      }

      const hasCoeng = parts.some((p) => p.category === 'coeng_stack');
      const hasVowel = parts.some((p) => p.category === 'vowel');
      const hasDiacritic = parts.some((p) => p.category === 'diacritic');

      syllableUnits.push({
        id: unitId++,
        text: parts.map((p) => p.text).join(''),
        hasCoeng,
        hasVowel,
        hasConsonant: true,
        hasDiacritic,
        primaryCategory: hasCoeng ? 'coeng_stack' : hasVowel ? 'vowel' : 'consonant',
        parts
      });
      idx = k;
      continue;
    }

    // Independent vowel + optional diacritics
    if (tok.category === 'vowel') {
      const parts: KhmerSyntaxToken[] = [tok];
      let k = idx + 1;
      while (k < tokens.length && tokens[k].category === 'diacritic') {
        parts.push(tokens[k]);
        k++;
      }
      syllableUnits.push({
        id: unitId++,
        text: parts.map((p) => p.text).join(''),
        hasCoeng: false,
        hasVowel: true,
        hasConsonant: false,
        hasDiacritic: parts.some((p) => p.category === 'diacritic'),
        primaryCategory: 'vowel',
        parts
      });
      idx = k;
      continue;
    }

    syllableUnits.push({
      id: unitId++,
      text: tok.text,
      hasCoeng: tok.category === 'coeng_stack',
      hasVowel: false,
      hasConsonant: false,
      hasDiacritic: tok.category === 'diacritic',
      primaryCategory:
        tok.category === 'coeng_stack'
          ? 'coeng_stack'
          : tok.category === 'diacritic'
          ? 'diacritic'
          : 'other',
      parts: [tok]
    });
    idx++;
  }

  return {
    tokens,
    syllableUnits,
    counts: {
      consonants,
      vowels,
      coengStacks,
      diacritics,
      other,
      totalKhmerUnits: consonants + vowels + coengStacks + diacritics
    }
  };
}
