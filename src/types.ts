export type DatasetTier = 'tier1' | 'tier2' | 'tier3' | 'tier4';

export interface KhmerResource {
  id: string;
  nameKhmer: string;
  nameEnglish: string;
  tier: DatasetTier;
  category: 'literature' | 'legal_official' | 'education' | 'news' | 'academic' | 'web_crawl' | 'synthetic';
  estimatedTokens: string;
  qualityScore: number; // 1-100
  license: string;
  licenseKm?: string;
  accessStatus: 'open_public' | 'scrapable' | 'institution_request' | 'synthesized';
  description: string;
  descriptionKm?: string;
  curationSteps: string[];
  curationStepsKm?: string[];
  url?: string;
}

export interface CleaningRule {
  id: string;
  title: string;
  titleKm?: string;
  category: 'encoding' | 'spam' | 'language_id' | 'dedup' | 'orthography';
  description: string;
  descriptionKm?: string;
  impactIfIgnored: string;
  impactIfIgnoredKm?: string;
  regexOrTool: string;
  regexOrToolKm?: string;
  exampleBadKh: string;
  exampleBadKhKm?: string;
  exampleGoodKh: string;
  exampleGoodKhKm?: string;
}

export interface AnalyzedToken {
  id: number;
  token: string;
  bytes: number;
  charStart: number;
  charEnd: number;
  rawBytesHex?: string;
  isSpecial?: boolean;
}

export type VocabCategory =
  | 'coeng_cluster'
  | 'pali_sanskrit'
  | 'clitic_connector'
  | 'technical_modern'
  | 'administrative_royal';

export interface VocabSuggestion {
  id: string;
  clusterOrWord: string;
  category: VocabCategory;
  categoryLabel: string;
  categoryLabelKm?: string;
  frequencyInText: number;
  currentTokensBaseline: number;
  currentTokensCustom: number;
  proposedTokens: number;
  tokenSavingPercent: number;
  priority: 'CRITICAL' | 'HIGH' | 'RECOMMENDED';
  rationale: string;
  rationaleKm?: string;
  unicodeSequence: string[];
  coengPresent: boolean;
}

export interface TokenizerComparisonResult {
  text: string;
  standardLlamaTokens: AnalyzedToken[];
  khmerOptimizedTokens: AnalyzedToken[];
  llamaTokenCount: number;
  khmerTokenCount: number;
  compressionRatio: number; // llamaTokens / khmerTokens
  wordsEstimated: number;
  llamaFertility: number; // tokens per word
  khmerFertility: number; // tokens per word
  syllables: string[];
}

export type PricingModel = 'on_demand' | 'spot' | 'reserved_1yr';

export interface CloudInstance {
  id: string;
  provider: 'GCP' | 'AWS' | 'OCI' | 'LambdaLabs';
  name: string;
  nameKm?: string;
  instanceType: string;
  accelerator: string;
  acceleratorCount: number;
  fp16Bf16Tflops: number; // Dense BF16 TFLOPs
  vramTotalGB: number;
  onDemandHourlyUSD: number;
  spotHourlyUSD: number;
  reserved1yrHourlyUSD: number;
  interconnect: string;
  interconnectKm?: string;
  notes: string;
  notesKm?: string;
}

export interface CostProjectionBreakdown {
  instanceId: string;
  provider: 'GCP' | 'AWS' | 'OCI' | 'LambdaLabs';
  name: string;
  accelerator: string;
  instanceCount: number;
  totalAccelerators: number;
  trainingHours: number;
  trainingDays: number;
  hourlyClusterCost: number;
  computeCostUSD: number;
  storageAndEgressUSD: number;
  totalCostUSD: number;
  costPerBillionTokensUSD: number;
  costPerMillionParamsUSD: number;
  effectiveTflops: number;
  energyKWh: number;
  carbonTonsCO2: number;
}

export interface CloudRegion {
  id: string;
  provider: 'GCP' | 'AWS' | 'LambdaLabs';
  code: string;
  name: string;
  nameKm?: string;
  location: string;
  locationKm?: string;
  priceMultiplier: number; // 1.0 = US baseline
  egressPerGBUSD: number;
  tpuV4Available?: boolean;
  notes: string;
  notesKm?: string;
}

export interface ScalingConfig {
  modelParamsB: number; // e.g. 1.5, 3, 7
  targetTokensB: number; // e.g. 30, 60, 150
  seqLength: number; // 2048, 4096, 8192
  vocabSize: number; // 32000, 64000
  gpuType: string;
  gpuCount: number;
  mfuEstimate: number; // Model FLOPs Utilization, e.g. 0.38
  pricingModel?: PricingModel;
  instanceCount?: number;
  storageOverheadPercent?: number;
  regionId?: string;
}

export interface RoadmapStep {
  stepNumber: string;
  title: string;
  titleKm?: string;
  subtitleKhmer: string;
  objective: string;
  objectiveKm?: string;
  keyDecisions: string[];
  keyDecisionsKm?: string[];
  commonPitfalls: string[];
  commonPitfallsKm?: string[];
  codeSnippet: {
    language: string;
    filename: string;
    code: string;
  };
}

export interface KhmerRagDocument {
  id: string;
  titleKhmer: string;
  titleEnglish: string;
  sourceType: 'government_decree' | 'academic_curriculum' | 'buddhist_treatise';
  totalPages: number;
  extractedText: string;
  metadata: {
    issuer: string;
    issuerKm?: string;
    date: string;
    fontEncoding: 'Unicode UTF-8' | 'Legacy Limon Converted' | 'Scanned OCR';
    fontEncodingKm?: string;
    ocrConfidence: number; // e.g. 98.4
    languageRatio: number; // e.g. 96
  };
}

export interface KhmerChunk {
  id: string;
  documentId: string;
  chunkIndex: number;
  text: string;
  charCount: number;
  tokenCount: number;
  syllableCount: number;
  startChar: number;
  endChar: number;
  pageNumber: number;
  hasBrokenLigature: boolean;
  brokenLigatureNote?: string;
  endsAtSentenceBoundary: boolean;
  vectorId: string;
  embeddingSnippet: number[];
}

export interface RagRetrievalResult {
  chunk: KhmerChunk;
  denseScore: number; // Cosine similarity 0-1
  sparseScore: number; // BM25 normalized 0-1
  hybridScore: number; // Weighted combination
  matchedKeywords: string[];
}

