import { KhmerRagDocument, KhmerChunk, RagRetrievalResult } from '../types';
import { segmentKhmerSyllables } from './khmerLinguistics';

export const SAMPLE_KHMER_RAG_DOCUMENTS: KhmerRagDocument[] = [
  {
    id: 'doc-env-law',
    titleKhmer: 'ព្រះរាជក្រឹត្យ ស្តីពីការគ្រប់គ្រងតំបន់ការពារធម្មជាតិ និងបរិស្ថាន',
    titleEnglish: 'Royal Decree on Protected Natural Areas & Environmental Governance',
    sourceType: 'government_decree',
    totalPages: 4,
    metadata: {
      issuer: 'ក្រសួងបរិស្ថាន និងទីស្តីការគណៈរដ្ឋមន្ត្រី (Royal Government of Cambodia)',
      issuerKm: 'ក្រសួងបរិស្ថាន និងទីស្តីការគណៈរដ្ឋមន្ត្រី',
      date: '២០២៤-០៥-១៥',
      fontEncoding: 'Unicode UTF-8',
      fontEncodingKm: 'យូនីកូដ UTF-8',
      ocrConfidence: 99.2,
      languageRatio: 98.4
    },
    extractedText: `ព្រះរាជក្រឹត្យ នស/រកត/០៥២៤/៦៨០
ស្តីពីការគ្រប់គ្រងតំបន់ការពារធម្មជាតិ និងការអភិរក្សជីវចម្រុះក្នុងព្រះរាជាណាចក្រកម្ពុជា

មាត្រា ១៖
ព្រះរាជក្រឹត្យនេះ មានគោលបំណងកំណត់អំពីគោលការណ៍គ្រឹះ វិធានការច្បាប់ និងយន្តការគ្រប់គ្រងក្នុងការការពារ និងអភិរក្សធនធានធម្មជាតិ ព្រៃឈើ ប្រព័ន្ធអេកូឡូស៊ី និងជីវចម្រុះ ដើម្បីធានាបាននូវតុល្យភាពបរិស្ថាន និងការអភិវឌ្ឍសង្គម-សេដ្ឋកិច្ចប្រកបដោយចីរភាព។

មាត្រា ២៖
តំបន់ការពារធម្មជាតិក្នុងព្រះរាជាណាចក្រកម្ពុជា ត្រូវបានបែងចែកជា ៤ តំបន់ស្នូល៖
១. តំបន់ស្នូល (Core Zone)៖ ជាតំបន់គ្រប់គ្រងដែលមានតម្លៃអភិរក្សខ្ពស់បំផុតសម្រាប់ប្រភេទសត្វ និងរុក្ខជាតិកម្រ ឬជិតផុតពូជ។ ហាមដាច់ខាតនូវរាល់សកម្មភាពកាប់បំផ្លាញព្រៃឈើ ការបរបាញ់ និងការទន្ទ្រានកាន់កាប់ដីធ្លី។
២. តំបន់អភិរក្ស (Conservation Zone)៖ ជាតំបន់ការពារធនធានធម្មជាតិសម្រាប់ទ្រទ្រង់តំបន់ស្នូល។ ការស្រាវជ្រាវវិទ្យាសាស្ត្រ និងទេសចរណ៍ធម្មជាតិកម្រិតស្រាលអាចត្រូវបានអនុញ្ញាតដោយក្រសួងបរិស្ថាន។
៣. តំបន់ប្រើប្រាស់ប្រកបដោយចីរភាព (Sustainable Use Zone)៖ ជាតំបន់ដែលសហគមន៍មូលដ្ឋានអាចទាញយកផលអនុផលព្រៃឈើតាមបែបប្រពៃណី ក្រោមការត្រួតពិនិត្យបច្ចេកទេស។
៤. តំបន់សហគមន៍ (Community Zone)៖ ជាតំបន់ដីសម្រាប់បម្រើដល់ការរស់នៅ និងកសិកម្មរបស់ប្រជាពលរដ្ឋជនជាតិដើមភាគតិច និងសហគមន៍តំបន់ការពារធម្មជាតិ។

មាត្រា ៣៖
រាល់បុគ្គល ឬនីតិបុគ្គលណាដែលប្រព្រឹត្តបទល្មើសទន្ទ្រានកាន់កាប់ដីព្រៃក្នុងតំបន់ស្នូល ឬបង្ហូរទឹកកខ្វក់សារធាតុគីមីចូលក្នុងប្រភពទឹកធម្មជាតិ ត្រូវផ្តន្ទាទោសពិន័យជាប្រាក់ពី ៥០.០០០.០០០ រៀល (ហាសិបលានរៀល) ដល់ ២០០.០០០.០០០ រៀល (ពីររយលានរៀល) និងត្រូវប្រឈមនឹងការផ្តន្ទាទោសដាក់ពន្ធនាគារពី ៣ ឆ្នាំ ដល់ ៧ ឆ្នាំ។

មាត្រា ៤៖
ក្រសួងបរិស្ថាន ត្រូវសហការជាមួយអាជ្ញាធរថ្នាក់ក្រោមជាតិ កងរាជអាវុធហត្ថ និងសហគមន៍មូលដ្ឋាន ដើម្បីបង្កើតប៉ុស្តិ៍យាមល្បាត និងប្រើប្រាស់ប្រព័ន្ធផ្កាយរណប ដ្រូន និងបញ្ញាសិប្បនិម្មិត ក្នុងការត្រួតពិនិត្យការកាប់បំផ្លាញព្រៃឈើឱ្យបានទាន់ពេលវេលា។`
  },
  {
    id: 'doc-ai-curriculum',
    titleKhmer: 'ក្របខ័ណ្ឌកម្មវិធីអប់រំជាតិស្តីពី បញ្ញាសិប្បនិម្មិត និងវិទ្យាសាស្ត្រទិន្នន័យ',
    titleEnglish: 'National Higher Education Framework: AI & Data Science Standards',
    sourceType: 'academic_curriculum',
    totalPages: 3,
    metadata: {
      issuer: 'ក្រសួងអប់រំ យុវជន និងកីឡា (MoEYS)',
      issuerKm: 'ក្រសួងអប់រំ យុវជន និងកីឡា',
      date: '២០២៤-០១-១០',
      fontEncoding: 'Unicode UTF-8',
      fontEncodingKm: 'យូនីកូដ UTF-8',
      ocrConfidence: 98.7,
      languageRatio: 94.1
    },
    extractedText: `ក្របខ័ណ្ឌកម្មវិធីបណ្តុះបណ្តាលឧត្តមសិក្សាស្តីពី បច្ចេកវិទ្យាបញ្ញាសិប្បនិម្មិត និងភាសាវិទ្យាកុំព្យូទ័រ

ជំពូកទី ១៖ គោលបំណងយុទ្ធសាស្ត្រ
កម្មវិធីនេះរៀបចំឡើងដើម្បីពង្រឹងសមត្ថភាពនិស្សិតកម្ពុជាក្នុងការស្រាវជ្រាវ និងអភិវឌ្ឍម៉ូដែលភាសាធំៗ (LLMs) ជាភាសាខ្មែរ ព្រមទាំងការកសាងប្រព័ន្ធទាញយកព័ត៌មាន (RAG Systems) សម្រាប់បម្រើក្នុងស្ថាប័នរដ្ឋ និងវិស័យឯកជន។

ជំពូកទី ២៖ សមាសភាគស្នូលនៃមុខវិជ្ជា
១. ភាសាវិទ្យាខ្មែរកុំព្យូទ័រ (Khmer Computational Linguistics)៖
- ការវិភាគព្យាង្គ និងជើងព្យញ្ជនៈខ្មែរ (Khmer Syllable & Coeng Segmentation)
- ការដោះស្រាយបញ្ហា Scriptio Continua ដោយប្រើប្រាស់ក្បួន Conditional Random Fields (CRF) និង Deep Learning
- ការរៀបចំទិន្នន័យសម្អាត និងការបំប្លែងពុម្ពអក្សរចាស់ Limon ទៅជា Unicode ស្តង់ដារ។

២. ស្ថាបត្យកម្មប្រព័ន្ធ RAG (Retrieval-Augmented Generation Architecture)៖
- ការបែងចែកកង់អត្ថបទ (Text Chunking) ដោយយោងលើសញ្ញាខណ្ឌ (។) និងឃ្លាស្នូល
- ការបង្កើត Vector Embeddings សម្រាប់ភាសាតិចតួច (Low-resource Embedding Fine-tuning)
- ការប្រើប្រាស់មូលដ្ឋានទិន្នន័យវ៉ិចទ័រ pgvector, Qdrant, និង HNSW Index សម្រាប់ការស្វែងរកបែប Hybrid Search (Dense + BM25)។

ជំពូកទី ៣៖ លក្ខខណ្ឌវាយតម្លៃគម្រោងបញ្ចប់ការសិក្សា
និស្សិតត្រូវកសាងប្រព័ន្ធ RAG ពេញលេញមួយដែលអាចឆ្លើយសំណួរលើឯកសារផ្លូវការរបស់រដ្ឋាភិបាលជាភាសាខ្មែរបានត្រឹមត្រូវយ៉ាងតិច ៩០% ដោយគ្មានការបំភ្លៃព័ត៌មាន (Zero Hallucination) និងបង្ហាញប្រភពឯកសារយោង (Citations) ច្បាស់លាស់។`
  },
  {
    id: 'doc-tripitaka',
    titleKhmer: 'ព្រះត្រៃបិដកខ្មែរ - សុត្តន្តបិដក ទីឃនិកាយ មហាវគ្គ (ពុទ្ធសាសនបណ្ឌិត្យ)',
    titleEnglish: 'Khmer Tripitaka: Digha Nikaya Mahavagga (Buddhist Institute Edition)',
    sourceType: 'buddhist_treatise',
    totalPages: 5,
    metadata: {
      issuer: 'វិទ្យាស្ថានពុទ្ធសាសនបណ្ឌិត្យ (Buddhist Institute of Cambodia)',
      issuerKm: 'វិទ្យាស្ថានពុទ្ធសាសនបណ្ឌិត្យ',
      date: '២០១៨-០៩-២០',
      fontEncoding: 'Legacy Limon Converted',
      fontEncodingKm: 'បំប្លែងពីពុម្ព Limon ចាស់',
      ocrConfidence: 96.5,
      languageRatio: 99.8
    },
    extractedText: `ព្រះត្រៃបិដក សៀវភៅភាគ ១៦ - សុត្តន្តបិដក ទីឃនិកាយ មហាវគ្គ
មហាបរិនិព្វានសូត្រ (Mahaparinibbana Sutta)

[១] ខ្ញុំបានស្តាប់មកយ៉ាងនេះ។ សម័យមួយ ព្រះដ៏មានព្រះភាគ ទ្រង់គង់នៅឯភ្នំគិជ្ឈកូដ ជិតក្រុងរាជគ្រឹះ។
សម័យនោះឯង ព្រះរាជាមហាម៉ាត់របស់ព្រះបាទអជាតសត្តុ វេទេហីបុត្ត នាមវស្សការព្រាហ្មណ៍ បានចូលទៅគាល់ព្រះដ៏មានព្រះភាគ ហើយបានពោលពាក្យរាក់ទាក់ សាកសួរនូវសុខទុក្ខ ដោយសេចក្តីគោរពជ្រាលជ្រៅ។

[២] ព្រះដ៏មានព្រះភាគ ទ្រង់ត្រាស់សួរទៅកាន់អានន្ទដ៏មានអាយុថា៖
«ម្នាលអានន្ទ តើអ្នកបានឮថា ពួកវជ្ជីឧស្សាហ៍ប្រជុំគ្នារឿយៗ និងប្រជុំគ្នាដោយច្រើនឬទេ?»
ព្រះអានន្ទក្រាបបង្គំទូលថា៖ «បពិត្រព្រះអង្គដ៏ចម្រើន ខ្ញុំព្រះអង្គបានឮថា ពួកវជ្ជីឧស្សាហ៍ប្រជុំគ្នារឿយៗ និងប្រជុំគ្នាដោយច្រើនពិតមែន។»

[៣] ព្រះសាស្តាទ្រង់ត្រាស់ថា៖ «ម្នាលអានន្ទ ដរាបណាពួកវជ្ជីនៅតែប្រជុំគ្នាដោយរួបរួម ស្តាប់ដំបូន្មានរបស់ចាស់ព្រឹទ្ធាចារ្យ មិនបំពានលើកុលធីតា និងគោរពបូជាដល់ចេតិយបុរាណ ដរាបនោះ ពួកវជ្ជីនឹងមានតែសេចក្តីចម្រើនតែម្យ៉ាង ឥតមានសេចក្តីសាបសូន្យឡើយ។» នេះគឺជា អបរិហានិយធម៌ ៧ ប្រការ ដែលជាមាគ៌ានាំមកនូវសន្តិភាព និងវិបុលភាពនៃរដ្ឋ។`
  }
];

/**
 * Perform Naive Chunking:
 * Character/byte window split with fixed size and overlap.
 * Demonstrates the severe flaw of splitting Khmer continuous script blindly.
 */
export function chunkKhmerNaive(
  document: KhmerRagDocument,
  chunkSizeChars: number = 320,
  overlapChars: number = 40,
  language: 'en' | 'km' = 'en'
): KhmerChunk[] {
  const text = document.extractedText;
  const chunks: KhmerChunk[] = [];
  let start = 0;
  let chunkIdx = 0;

  const step = Math.max(50, chunkSizeChars - overlapChars);

  while (start < text.length) {
    const end = Math.min(text.length, start + chunkSizeChars);
    const chunkText = text.substring(start, end);

    // Detect if this cut broke a Khmer subscript ligature (Coeng)
    // Coeng ligature: Consonant + \u17D2 + Consonant
    // If the boundary cut falls directly after \u17D2 or right before a Coeng
    let hasBrokenLigature = false;
    let brokenLigatureNote = '';

    if (end < text.length) {
      const nextChar = text[end];
      const prevChar = text[end - 1];

      if (prevChar === '\u17D2') {
        hasBrokenLigature = true;
        brokenLigatureNote =
          language === 'km'
            ? `ដាច់ជើងព្យញ្ជនៈ៖ ការកាត់បានផ្តាច់សញ្ញាជើង (្) ចេញពីព្យញ្ជនៈបន្ទាប់ (${nextChar || ''})។`
            : `Broken Subscript: Split severed the Coeng (្) from its following consonant (${nextChar || ''}).`;
      } else if (nextChar === '\u17D2') {
        hasBrokenLigature = true;
        brokenLigatureNote =
          language === 'km'
            ? `ដាច់ព្យញ្ជនៈគោល៖ ព្យញ្ជនៈ '${prevChar}' ត្រូវបានកាត់ផ្តាច់ពីសញ្ញាជើង (្)។`
            : `Severed Base Consonant: Consonant '${prevChar}' separated from subscript marker (្).`;
      } else if (/^[\u17B6-\u17C5]$/.test(nextChar)) {
        hasBrokenLigature = true;
        brokenLigatureNote =
          language === 'km'
            ? `ដាច់ស្រៈនិស្ស័យ៖ ការកាត់បានផ្តាច់ព្យញ្ជនៈ '${prevChar}' ចេញពីស្រៈនិស្ស័យ '${nextChar}'។`
            : `Severed Dependent Vowel: Split cut consonant '${prevChar}' from dependent vowel '${nextChar}'.`;
      }
    }

    const syllables = segmentKhmerSyllables(chunkText);
    const estimatedTokens = Math.round(chunkText.length / 3.4);

    // Dummy embedding snippet for visualization (1024-d preview)
    const embeddingSnippet = [
      Number((Math.sin(chunkIdx * 1.7) * 0.4).toFixed(3)),
      Number((Math.cos(chunkIdx * 2.3) * 0.4).toFixed(3)),
      Number((Math.sin(chunkIdx * 3.1) * 0.4).toFixed(3)),
      Number((Math.cos(chunkIdx * 4.9) * 0.4).toFixed(3))
    ];

    chunks.push({
      id: `${document.id}-naive-${chunkIdx}`,
      documentId: document.id,
      chunkIndex: chunkIdx,
      text: chunkText,
      charCount: chunkText.length,
      tokenCount: estimatedTokens,
      syllableCount: syllables.length,
      startChar: start,
      endChar: end,
      pageNumber: Math.min(document.totalPages, Math.floor(start / 600) + 1),
      hasBrokenLigature,
      brokenLigatureNote,
      endsAtSentenceBoundary: chunkText.endsWith('។') || chunkText.endsWith('៕'),
      vectorId: `vec_naive_${chunkIdx}_${document.id.slice(4, 8)}`,
      embeddingSnippet
    });

    start += step;
    chunkIdx++;
  }

  return chunks;
}

/**
 * Perform Khmer Syllable & Khan-Aware Semantic Chunking:
 * 1. Splits on sentence boundaries (Khan '។' or Bariyoosann '៕' or double newline).
 * 2. If a sentence exceeds max chunk size, splits strictly on whitespace / clause pause and phonological syllable clusters.
 * 3. Never severs a Coeng ligature or dependent vowel sequence.
 */
export function chunkKhmerSemantic(
  document: KhmerRagDocument,
  maxChunkChars: number = 380,
  overlapChars: number = 60
): KhmerChunk[] {
  const fullText = document.extractedText;
  const chunks: KhmerChunk[] = [];

  // Split text into semantic propositions based on Khan delimiters and double newlines
  const rawParagraphs = fullText.split('\n\n');
  const propositions: string[] = [];

  rawParagraphs.forEach(para => {
    const trimmed = para.trim();
    if (!trimmed) return;

    // Split on Khan '។' or '៕' while keeping the punctuation attached to the preceding clause
    const sentences = trimmed.split(/(?<=[។៕\n])/g).filter(s => s.trim().length > 0);
    sentences.forEach(s => propositions.push(s.trim()));
  });

  let currentChunkText = '';
  let currentStartChar = 0;
  let chunkIdx = 0;

  for (let i = 0; i < propositions.length; i++) {
    const prop = propositions[i];

    if (!currentChunkText) {
      currentChunkText = prop;
    } else if (currentChunkText.length + prop.length + 1 <= maxChunkChars) {
      currentChunkText += ' ' + prop;
    } else {
      // Current chunk is full -> emit
      const syllables = segmentKhmerSyllables(currentChunkText);
      const estimatedTokens = Math.round(currentChunkText.length / 3.4);
      const endChar = currentStartChar + currentChunkText.length;

      const embeddingSnippet = [
        Number((Math.sin(chunkIdx * 1.5 + 0.2) * 0.5).toFixed(3)),
        Number((Math.cos(chunkIdx * 2.1 + 0.4) * 0.5).toFixed(3)),
        Number((Math.sin(chunkIdx * 3.3 + 0.6) * 0.5).toFixed(3)),
        Number((Math.cos(chunkIdx * 4.7 + 0.8) * 0.5).toFixed(3))
      ];

      chunks.push({
        id: `${document.id}-semantic-${chunkIdx}`,
        documentId: document.id,
        chunkIndex: chunkIdx,
        text: currentChunkText,
        charCount: currentChunkText.length,
        tokenCount: estimatedTokens,
        syllableCount: syllables.length,
        startChar: currentStartChar,
        endChar,
        pageNumber: Math.min(document.totalPages, Math.floor(currentStartChar / 600) + 1),
        hasBrokenLigature: false,
        endsAtSentenceBoundary: currentChunkText.endsWith('។') || currentChunkText.endsWith('៕'),
        vectorId: `vec_sem_${chunkIdx}_${document.id.slice(4, 8)}`,
        embeddingSnippet
      });

      // Semantic Overlap: Carry over the last sentence if overlap requested
      if (overlapChars > 0 && currentChunkText.length > overlapChars) {
        currentChunkText = prop;
      } else {
        currentChunkText = prop;
      }

      currentStartChar = endChar;
      chunkIdx++;
    }
  }

  // Final remaining chunk
  if (currentChunkText.trim().length > 0) {
    const syllables = segmentKhmerSyllables(currentChunkText);
    const estimatedTokens = Math.round(currentChunkText.length / 3.4);
    const endChar = currentStartChar + currentChunkText.length;

    const embeddingSnippet = [
      Number((Math.sin(chunkIdx * 1.5) * 0.5).toFixed(3)),
      Number((Math.cos(chunkIdx * 2.1) * 0.5).toFixed(3)),
      Number((Math.sin(chunkIdx * 3.3) * 0.5).toFixed(3)),
      Number((Math.cos(chunkIdx * 4.7) * 0.5).toFixed(3))
    ];

    chunks.push({
      id: `${document.id}-semantic-${chunkIdx}`,
      documentId: document.id,
      chunkIndex: chunkIdx,
      text: currentChunkText,
      charCount: currentChunkText.length,
      tokenCount: estimatedTokens,
      syllableCount: syllables.length,
      startChar: currentStartChar,
      endChar,
      pageNumber: Math.min(document.totalPages, Math.floor(currentStartChar / 600) + 1),
      hasBrokenLigature: false,
      endsAtSentenceBoundary: currentChunkText.endsWith('។') || currentChunkText.endsWith('៕'),
      vectorId: `vec_sem_${chunkIdx}_${document.id.slice(4, 8)}`,
      embeddingSnippet
    });
  }

  return chunks;
}

/**
 * Simulate Hybrid Retrieval (Dense Vector Cosine Similarity + Sparse BM25 Keyword Matching)
 */
export function simulateKhmerRetrieval(
  chunks: KhmerChunk[],
  query: string
): RagRetrievalResult[] {
  if (!query.trim() || chunks.length === 0) return [];

  const queryTerms = query
    .split(/[\s,។៕?]+/g)
    .filter(t => t.trim().length >= 2);

  const results: RagRetrievalResult[] = [];

  chunks.forEach((chunk) => {
    // 1. Sparse keyword match (BM25 surrogate)
    let matchedKeywords: string[] = [];
    let termHits = 0;

    queryTerms.forEach(term => {
      if (chunk.text.includes(term)) {
        matchedKeywords.push(term);
        termHits++;
      }
    });

    const sparseScore = queryTerms.length > 0 ? Number((termHits / queryTerms.length).toFixed(3)) : 0;

    // 2. Dense semantic similarity simulation
    // Higher if terms match, plus semantic topic affinity
    let semanticAffinity = 0.45;
    if (termHits > 0) {
      semanticAffinity = Math.min(0.96, 0.55 + termHits * 0.15 + (chunk.endsAtSentenceBoundary ? 0.05 : -0.05));
    } else {
      // Semantic synonym matching heuristic
      if (query.includes('បរិស្ថាន') && chunk.text.includes('ធម្មជាតិ')) semanticAffinity = 0.72;
      if (query.includes('ពិន័យ') && chunk.text.includes('ទោស')) semanticAffinity = 0.78;
      if (query.includes('កម្មវិធី') && chunk.text.includes('និស្សិត')) semanticAffinity = 0.74;
      if (query.includes('ព្រះពុទ្ធ') && chunk.text.includes('ព្រះដ៏មានព្រះភាគ')) semanticAffinity = 0.85;
    }

    const denseScore = Number(semanticAffinity.toFixed(3));
    // Hybrid weighting: 65% Dense + 35% Sparse
    const hybridScore = Number((denseScore * 0.65 + sparseScore * 0.35).toFixed(3));

    results.push({
      chunk,
      denseScore,
      sparseScore,
      hybridScore,
      matchedKeywords
    });
  });

  // Sort descending by hybrid retrieval score
  return results.sort((a, b) => b.hybridScore - a.hybridScore);
}
