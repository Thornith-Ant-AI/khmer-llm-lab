import { KhmerResource, CleaningRule, RoadmapStep } from '../types';

export const KHMER_RESOURCES: KhmerResource[] = [
  // TIER 1: Gold Standard Ground Truth (High weight 35-40%)
  {
    id: 'res-buddhist-institute',
    nameKhmer: 'វិទ្យាស្ថានពុទ្ធសាសនបណ្ឌិត្យ (ព្រះត្រៃបិដក និងកម្រងច្បាប់)',
    nameEnglish: 'Buddhist Institute of Cambodia (Tripitaka & Didactic Literature)',
    tier: 'tier1',
    category: 'literature',
    estimatedTokens: '180M - 250M',
    qualityScore: 98,
    license: 'Public Domain / Cultural Heritage',
    licenseKm: 'សម្បត្តិសាធារណៈ / បេតិកភណ្ឌវប្បធម៌',
    accessStatus: 'open_public',
    description: 'The highest linguistic authority for classical Khmer prose, containing the full 110 volumes of the Khmer-Pali Tripitaka, Chbap (moral didactic poems), and Jataka tales. Perfectly edited orthography with zero OCR noise.',
    descriptionKm: 'ប្រភពស្តង់ដារភាសាខ្មែរកម្រិតខ្ពស់បំផុតសម្រាប់អក្សរសិល្ប៍បុរាណ ដែលរួមមានព្រះត្រៃបិដកខ្មែរ-បាលីទាំង ១១០ ភាគ កម្រងច្បាប់អប់រំ និងរឿងជាតក។ អក្ខរាវិរុទ្ធត្រូវបានកែសម្រួលយ៉ាងត្រឹមត្រូវបំផុត និងគ្មានកំហុស OCR។',
    curationSteps: [
      'Download digitized PDF/Unicode transcripts from official Buddhist Institute archives.',
      'Separate pure Pali transliterations from Khmer exegesis using Pali dictionary regex.',
      'Normalize traditional punctuation (។, ៕, ៘, ៙, ៚) into canonical Unicode representations.',
      'Apply 5x oversampling during pretraining to teach the model deep morphological roots.'
    ],
    curationStepsKm: [
      'ទាញយកឯកសារ PDF/Unicode ឌីជីថលពីបណ្ណសារផ្លូវការរបស់វិទ្យាស្ថានពុទ្ធសាសនបណ្ឌិត្យ។',
      'ញែកភាសាបាលីសុទ្ធចេញពីអត្ថាធិប្បាយជាភាសាខ្មែរដោយប្រើ Regex វចនានុក្រមបាលី។',
      'កំណត់ស្តង់ដារវណ្ណយុត្តិខ្មែរ (។, ៕, ៘, ៙, ៚) ឱ្យទៅជាទម្រង់យូនីកូដត្រឹមត្រូវ។',
      'អនុវត្តការធ្វើសំណាកលើស ៥ដង (5x oversampling) ក្នុងពេលបង្វឹកដំបូង ដើម្បីឱ្យម៉ូដែលយល់ឫសពាក្យជ្រៅជ្រះ។'
    ],
    url: 'https://www.budinst.gov.kh'
  },
  {
    id: 'res-royal-academy',
    nameKhmer: 'វចនានុក្រម និងបច្ចេកសព្ទ នៃរាជបណ្ឌិត្យសភាកម្ពុជា',
    nameEnglish: 'Royal Academy of Cambodia (Dictionary & Terminology Bank)',
    tier: 'tier1',
    category: 'academic',
    estimatedTokens: '90M - 140M',
    qualityScore: 99,
    license: 'Official Government / Fair Use Academic',
    licenseKm: 'ស្ថាប័នរដ្ឋផ្លូវការ / ប្រើប្រាស់សម្រាប់ការសិក្សាស្រាវជ្រាវ',
    accessStatus: 'open_public',
    description: 'The official national lexicon (Chuon Nath Dictionary digitized by the National Language Institute, plus new scientific terminology in IT, Medicine, Law, and Engineering). Vital for semantic definitions and grammar.',
    descriptionKm: 'វចនានុក្រមជាតិផ្លូវការ (វចនានុក្រមសម្តេចសង្ឃរាជ ជួន ណាត ដែលធ្វើឌីជីថលដោយវិទ្យាស្ថានភាសាជាតិ បូករួមបច្ចេកសព្ទវិទ្យាសាស្ត្រថ្មីៗផ្នែកព័ត៌មានវិទ្យា វេជ្ជសាស្ត្រ ច្បាប់ និងវិស្វកម្ម)។ សំខាន់ណាស់សម្រាប់និយមន័យន័យសព្ទ និងវេយ្យាករណ៍។',
    curationSteps: [
      'Extract headwords, phonetic guides, grammatical tags, and full Khmer contextual sentences.',
      'Format definitions into synthetic knowledge triplets and dictionary pretraining sequences.',
      'Validate all subscript consonants (ជើង/Coeng) against Unicode standard ordering.',
      'Filter out non-standard phonetic spellings into a separate lookup table.'
    ],
    curationStepsKm: [
      'ទាញយកមេពាក្យ សូរសព្ទ ថ្នាក់ពាក្យវេយ្យាករណ៍ និងឧទាហរណ៍ប្រយោគខ្មែរពេញលេញ។',
      'រៀបចំនិយមន័យជាគូទំនាក់ទំនងចំណេះដឹងសំយោគ និងលំដាប់បង្វឹកវចនានុក្រម។',
      'ផ្ទៀងផ្ទាត់ជើងព្យញ្ជនៈទាំងអស់ធៀបនឹងលំដាប់ស្តង់ដារយូនីកូដ។',
      'ចម្រោះអក្ខរាវិរុទ្ធមិនត្រឹមត្រូវចូលទៅក្នុងតារាងផ្ទៀងផ្ទាត់ដាច់ដោយឡែក។'
    ],
    url: 'https://rac.gov.kh'
  },
  {
    id: 'res-royal-gazette',
    nameKhmer: 'រាជកិច្ច និងច្បាប់រដ្ឋសភាជាតិ (ក្រមរដ្ឋប្បវេណី ក្រមព្រហ្មទណ្ឌ)',
    nameEnglish: 'Royal Gazette & National Assembly Legal Codes',
    tier: 'tier1',
    category: 'legal_official',
    estimatedTokens: '350M - 500M',
    qualityScore: 97,
    license: 'Public Record (Government Edicts)',
    licenseKm: 'កំណត់ត្រាសាធារណៈ (លិខិតបទដ្ឋានគតិយុត្ត)',
    accessStatus: 'open_public',
    description: 'The complete legislative record of the Kingdom of Cambodia since 1993, including the Civil Code, Criminal Code, Sub-decrees (អនុក្រឹត្យ), and Royal Kram (ព្រះរាជក្រម). Superb formal register, complex subordinate clauses, and zero slang.',
    descriptionKm: 'កំណត់ត្រាច្បាប់ពេញលេញរបស់ព្រះរាជាណាចក្រកម្ពុជាតាំងពីឆ្នាំ ១៩៩៣ រួមមាន ក្រមរដ្ឋប្បវេណី ក្រមព្រហ្មទណ្ឌ អនុក្រឹត្យ និងព្រះរាជក្រម។ មានទម្រង់ភាសាផ្លូវការល្អប្រណីត ល្បះស្មុគស្មាញ និងគ្មានពាក្យសាមញ្ញឡើយ។',
    curationSteps: [
      'OCR processing with Tesseract 5 / PaddleOCR trained specifically on Khmer official font (Khmer OS Muol / Battambang).',
      'Remove recurring stamp headers, page numbers, and signatory disclaimers.',
      'Preserve article hierarchical structures (ជំពូក, មាត្រា, កថាខណ្ឌ).',
      'Use for teaching long-context formal reasoning and administrative logic.'
    ],
    curationStepsKm: [
      'ដំណើរការ OCR ដោយប្រើ Tesseract 5 / PaddleOCR ដែលបានបង្វឹកលើពុម្ពអក្សរផ្លូវការខ្មែរ (Khmer OS Muol / Battambang)។',
      'លុបក្បាលត្រា លេខទំព័រ និងហត្ថលេខាដែលកើតឡើងដដែលៗ។',
      'រក្សារចនាសម្ព័ន្ធឋានានុក្រមមាត្រាច្បាប់ (ជំពូក, មាត្រា, កថាខណ្ឌ)។',
      'ប្រើសម្រាប់បង្រៀនម៉ូដែលអំពីតក្កវិជ្ជាផ្លូវការ និងបរិបទវែងៗ។'
    ],
    url: 'https://pressocm.gov.kh'
  },
  {
    id: 'res-moeys-textbooks',
    nameKhmer: 'សៀវភៅពុម្ពក្រសួងអប់រំ យុវជន និងកីឡា (ថ្នាក់ទី១ ដល់ទី១២)',
    nameEnglish: 'MoEYS National Curriculum Textbooks (Grades 1-12)',
    tier: 'tier1',
    category: 'education',
    estimatedTokens: '220M - 300M',
    qualityScore: 96,
    license: 'Educational Open Access',
    licenseKm: 'បើកទូលាយសម្រាប់ការអប់រំ',
    accessStatus: 'open_public',
    description: 'Curriculum textbooks covering History, Khmer Literature, Geography, Physics, Chemistry, Biology, and Mathematics. Structured progressive vocabulary graded from beginner to advanced prose.',
    descriptionKm: 'សៀវភៅសិក្សាគោលគ្របដណ្តប់លើប្រវត្តិវិទ្យា អក្សរសាស្ត្រខ្មែរ ភូមិវិទ្យា រូបវិទ្យា គីមីវិទ្យា ជីវវិទ្យា និងគណិតវិទ្យា។ មានវាក្យសព្ទរៀបចំតាមលំដាប់ពីកម្រិតដំបូងរហូតដល់កម្រិតខ្ពស់។',
    curationSteps: [
      'Extract PDF texts from the MoEYS Open Learning platform and e-library.',
      'Reconstruct math formulas into LaTeX notation while keeping Khmer problem statements.',
      'Label reading-level difficulty tags for potential curriculum-staged pretraining.',
      'Deduplicate chapter summaries from full body texts.'
    ],
    curationStepsKm: [
      'ទាញយកអត្ថបទ PDF ពីប្រព័ន្ធសិក្សាបើកចំហ និងបណ្ណាល័យអេឡិចត្រូនិករបស់ក្រសួងអប់រំ។',
      'បម្លែងរូបមន្តគណិតវិទ្យាទៅជាទម្រង់ LaTeX ដោយរក្សាសំណួរជាភាសាខ្មែរ។',
      'បិទស្លាកកម្រិតលំបាកនៃការអាន សម្រាប់ការបង្វឹកតាមដំណាក់កាលកម្មវិធីសិក្សា។',
      'លុបភាពស្ទួនរវាងសេចក្តីសង្ខេបជំពូក និងអត្ថបទមេរៀនពេញលេញ។'
    ],
    url: 'https://elearning.moeys.gov.kh'
  },
  {
    id: 'res-khmer-wikipedia',
    nameKhmer: 'វិគីភីឌាភាសាខ្មែរ (Khmer Wikipedia Cleaned Dump)',
    nameEnglish: 'Khmer Wikipedia (Cleaned Community Encyclopedia)',
    tier: 'tier1',
    category: 'education',
    estimatedTokens: '60M - 80M',
    qualityScore: 92,
    license: 'CC BY-SA 4.0',
    licenseKm: 'CC BY-SA 4.0 (សព្វវចនាធិប្បាយសេរី)',
    accessStatus: 'open_public',
    description: 'Approximately 11,000 active Khmer articles covering general world knowledge, Cambodian historical eras (Funan, Chenla, Angkorian, Post-Angkorian), and science.',
    descriptionKm: 'អត្ថបទភាសាខ្មែរសកម្មប្រមាណ ១១,០០០ អត្ថបទ ដែលគ្របដណ្តប់លើចំណេះដឹងទូទៅពិភពលោក សម័យកាលប្រវត្តិសាស្ត្រកម្ពុជា (ហ្វូណន ចេនឡា អង្គរ ក្រោយអង្គរ) និងវិទ្យាសាស្ត្រ។',
    curationSteps: [
      'Extract raw XML dump using WikiExtractor with clean section header parsing.',
      'Filter out stub pages under 100 characters and translation template placeholders.',
      'Strip Wikipedia infobox markup, citation markers ([១], [២]), and image metadata.',
      'MinHash deduplication to eliminate mirrored translation pages.'
    ],
    curationStepsKm: [
      'ទាញយកទិន្នន័យ XML ដើមដោយប្រើ WikiExtractor ដើម្បីញែកចំណងជើងផ្នែកឱ្យស្អាត។',
      'ចម្រោះចោលទំព័រខ្លីៗក្រោម ១០០ តួអក្សរ និងគំរូបកប្រែមិនទាន់ពេញលេញ។',
      'លុបកូដ Infobox របស់វិគីភីឌា សញ្ញាយោង ([១], [២]) និងទិន្នន័យរូបភាព។',
      'អនុវត្ត MinHash ដើម្បីលុបទំព័របកប្រែស្ទួនៗគ្នា។'
    ],
    url: 'https://km.wikipedia.org'
  },
  {
    id: 'res-open-dev-cambodia',
    nameKhmer: 'ទិន្នន័យអភិវឌ្ឍន៍កម្ពុជា (Open Development Cambodia - ODC)',
    nameEnglish: 'Open Development Cambodia (Reports, Datasets & Gazettes)',
    tier: 'tier1',
    category: 'academic',
    estimatedTokens: '80M - 120M',
    qualityScore: 94,
    license: 'CC BY-SA 3.0',
    licenseKm: 'CC BY-SA 3.0',
    accessStatus: 'open_public',
    description: 'Bilingual research reports, environmental impact assessments, economic census summaries, land titling data, and NGO whitepapers. Contains authentic high-level development vocabulary.',
    descriptionKm: 'របាយការណ៍ស្រាវជ្រាវទ្វេភាសា ការវាយតម្លៃផលប៉ះពាល់បរិស្ថាន សេចក្តីសង្ខេបជំរឿនសេដ្ឋកិច្ច ទិន្នន័យប្លង់ដី និងឯកសារអង្គការសង្គមស៊ីវិល។ សម្បូរពាក្យបច្ចេកទេសអភិវឌ្ឍន៍កម្រិតខ្ពស់។',
    curationSteps: [
      'Scrape public publications and parallel English-Khmer executive summaries.',
      'Extract tabular numbers and verify that Khmer numerals (០-៩) align correctly with Arabic numerals.',
      'Convert scanned bilingual tables into structured markdown format.'
    ],
    curationStepsKm: [
      'ប្រមូលឯកសារផ្សព្វផ្សាយសាធារណៈ និងសេចក្តីសង្ខេបទ្វេភាសា អង់គ្លេស-ខ្មែរ។',
      'ទាញយកតួលេខក្នុងតារាង និងផ្ទៀងផ្ទាត់ឱ្យលេខខ្មែរ (០-៩) ត្រូវគ្នានឹងលេខអារ៉ាប់។',
      'បម្លែងតារាងស្កេនទ្វេភាសាទៅជាទម្រង់ Markdown ដែលមានរចនាសម្ព័ន្ធច្បាស់លាស់។'
    ],
    url: 'https://opendevelopmentcambodia.net'
  },

  // TIER 2: High-Register News & Quality Publications (25-30%)
  {
    id: 'res-rfi-rfa-voa',
    nameKhmer: 'សារព័ត៌មានស្តង់ដារអន្តរជាតិ (RFI, RFA, VOA ភាសាខ្មែរ)',
    nameEnglish: 'International Broadcasters (RFI, RFA, VOA Khmer Archives)',
    tier: 'tier2',
    category: 'news',
    estimatedTokens: '450M - 650M',
    qualityScore: 91,
    license: 'Journalistic Archive / Fair Use Research',
    licenseKm: 'បណ្ណសារសារព័ត៌មាន / សម្រាប់ការស្រាវជ្រាវ',
    accessStatus: 'scrapable',
    description: 'Over 20 years of continuous daily news articles, geopolitical analysis, and cultural reporting written by professional Cambodian editors. Consistent grammatical structure and vocabulary richness.',
    descriptionKm: 'អត្ថបទព័ត៌មានប្រចាំថ្ងៃ ការវិភាគភូមិសាស្ត្រនយោបាយ និងរបាយការណ៍វប្បធម៌ជាង ២០ ឆ្នាំ ដែលនិពន្ធដោយនិពន្ធនាយកខ្មែរអាជីព។ មានរចនាសម្ព័ន្ធវេយ្យាករណ៍ថេរ និងពាក្យសម្បូរបែប។',
    curationSteps: [
      'Archive web scraping with polite rate-limiting.',
      'Strip audio player tags, social share headers, and recurring reporter bylines.',
      'Filter out repetitive wire-service lead sentences.',
      'Normalize quotation marks («...» vs "...").'
    ],
    curationStepsKm: [
      'ប្រមូលទិន្នន័យពីគេហទំព័រដោយកំណត់ល្បឿនសមរម្យ។',
      'លុបស្លាកកម្មវិធីចាក់សំឡេង ប៊ូតុងចែករំលែកសង្គម និងឈ្មោះអ្នកយកព័ត៌មានដដែលៗ។',
      'ចម្រោះប្រយោគបើកក្បាលព័ត៌មានដែលស្ទួនៗគ្នា។',
      'កំណត់ស្តង់ដារសញ្ញាអព្ភន្តរ («...» ទល់នឹង "...")។'
    ],
    url: 'https://www.rfi.fr/km'
  },
  {
    id: 'res-phnompenhpost-thmeythmey',
    nameKhmer: 'ភ្នំពេញប៉ុស្តិ៍ និងថ្មីៗ (The Phnom Penh Post & ThmeyThmey Khmer)',
    nameEnglish: 'Phnom Penh Post & ThmeyThmey News Archives',
    tier: 'tier2',
    category: 'news',
    estimatedTokens: '500M - 750M',
    qualityScore: 89,
    license: 'Journalistic Archive / Research',
    licenseKm: 'បណ្ណសារសារព័ត៌មាន / ស្រាវជ្រាវ',
    accessStatus: 'scrapable',
    description: 'Extensive business, cultural, technology, and sports journalism in contemporary Khmer. Excellent modern idiom coverage, international company names transliterated into Khmer, and contemporary colloquial idioms.',
    descriptionKm: 'ព័ត៌មានសេដ្ឋកិច្ច វប្បធម៌ បច្ចេកវិទ្យា និងកីឡាជាភាសាខ្មែរសម័យថ្មី។ គ្របដណ្តប់ល្អលើសំនួនវោហារសម័យថ្មី ការសរសេរឈ្មោះក្រុមហ៊ុនអន្តរជាតិជាខ្មែរ និងពាក្យប្រចាំថ្ងៃទាន់សម័យ។',
    curationSteps: [
      'Extract article main bodies; strip ad wrappers and sponsored content.',
      'Apply sentence-level language verification to eliminate occasional English/French quotes.',
      'Deduplicate breaking news syndication rewrites with Jaccard similarity > 0.82.'
    ],
    curationStepsKm: [
      'ទាញយកតែតួអត្ថបទសំខាន់ ហើយលុបផ្ទាំងផ្សាយពាណិជ្ជកម្ម និងអត្ថបទឧបត្ថម្ភចេញ។',
      'ផ្ទៀងផ្ទាត់ភាសាកម្រិតប្រយោគ ដើម្បីកាត់បន្ថយប្រយោគដកស្រង់ជាភាសាអង់គ្លេស/បារាំង។',
      'លុបព័ត៌មានបន្ទាន់ដែលសរសេរឡើងវិញដូចគ្នា ដោយប្រើ Jaccard similarity > 0.82។'
    ],
    url: 'https://postkhmer.com'
  },
  {
    id: 'res-academic-theses',
    nameKhmer: 'សារណាស្រាវជ្រាវ សាកលវិទ្យាល័យភូមិន្ទភ្នំពេញ (RUPP & ITC Theses)',
    nameEnglish: 'Cambodian University Theses & Technical Journals (RUPP, ITC, NUM)',
    tier: 'tier2',
    category: 'academic',
    estimatedTokens: '120M - 180M',
    qualityScore: 90,
    license: 'Institutional Academic Repository',
    licenseKm: 'ឃ្លាំងឯកសារសិក្សាស្រាវជ្រាវនៃគ្រឹះស្ថានឧត្តមសិក្សា',
    accessStatus: 'institution_request',
    description: 'Master and Bachelor theses in Computer Science, Linguistics, Economics, and Environmental Engineering from the Royal University of Phnom Penh and Institute of Technology of Cambodia.',
    descriptionKm: 'និក្ខេបបទថ្នាក់បរិញ្ញាបត្រជាន់ខ្ពស់ និងបរិញ្ញាបត្រ ផ្នែកវិទ្យាសាស្ត្រកុំព្យូទ័រ ភាសាវិទ្យា សេដ្ឋកិច្ច និងវិស្វកម្មបរិស្ថាន ពីសាកលវិទ្យាល័យភូមិន្ទភ្នំពេញ និងវិទ្យាស្ថានបច្ចេកវិទ្យាកម្ពុជា។',
    curationSteps: [
      'Target digital institutional repositories (DSpace / RUPP library).',
      'Remove student signature pages, acknowledgments, and bibliography lists.',
      'Segment technical abstract paragraphs for cross-lingual alignment.'
    ],
    curationStepsKm: [
      'ប្រមូលពីឃ្លាំងឯកសារឌីជីថលរបស់ស្ថាប័ន (DSpace / បណ្ណាល័យ RUPP)។',
      'លុបទំព័រហត្ថលេខានិស្សិត សេចក្តីថ្លែងអំណរគុណ និងបញ្ជីឯកសារយោង។',
      'ញែកកថាខណ្ឌសង្ខេបបច្ចេកទេស សម្រាប់ការតម្រឹមទ្វេភាសា។'
    ],
    url: 'http://www.rupp.edu.kh'
  },

  // TIER 3: Filtered Web Crawls with Aggressive Cleansing (20-25%)
  {
    id: 'res-culturax-madlad',
    nameKhmer: 'CulturaX-km និង MADLAD-400 (Web Crawl សម្អាតគុណភាពខ្ពស់)',
    nameEnglish: 'CulturaX-Khmer & MADLAD-400 (Heavily Filtered Web Datasets)',
    tier: 'tier3',
    category: 'web_crawl',
    estimatedTokens: '1.8B - 3.2B',
    qualityScore: 78,
    license: 'ODC-By / Apache 2.0 / CC-BY',
    licenseKm: 'ODC-By / Apache 2.0 / CC-BY',
    accessStatus: 'open_public',
    description: 'The cleanest subsets of Common Crawl processed through mC4 and OSCAR with FastText language ID. However, requires strict post-filtering to remove legacy Limon fonts, online casino ads, and machine-translated spam.',
    descriptionKm: 'ផ្នែកស្អាតបំផុតនៃ Common Crawl ដែលបានចម្រោះតាមរយៈ mC4 និង OSCAR ជាមួយ FastText Language ID។ ទោះជាយ៉ាងណា នៅតែត្រូវការការចម្រោះតឹងរ៉ឹងដើម្បីលុបពុម្ពអក្សរចាស់ Limon ផ្សាយពាណិជ្ជកម្មកាស៊ីណូ និងសារឥតបានការបកប្រែដោយម៉ាស៊ីន។',
    curationSteps: [
      'Run FastText lid.176.bin with minimum probability threshold of 0.85.',
      'Execute regex filter to eliminate online casino keywords (កាស៊ីណូ, បាការ៉ាត់, ភ្នាល់, ដាក់ប្រាក់).',
      'Detect and reject Limon/ABC non-Unicode legacy font ASCII strings.',
      'Execute MinHash LSH de-duplication at document level to drop 45% redundant web text.',
      'Perplexity filter: score documents using a small 50M parameter Khmer KenLM language model; discard bottom 20% high-perplexity text.'
    ],
    curationStepsKm: [
      'ដំណើរការ FastText lid.176.bin ដោយកំណត់កម្រិតប្រូបាប៊ីលីតេអប្បបរមា 0.85។',
      'ប្រើតម្រង Regex ដើម្បីលុបពាក្យគន្លឹះកាស៊ីណូអនឡាញ (កាស៊ីណូ, បាការ៉ាត់, ភ្នាល់, ដាក់ប្រាក់)។',
      'រកឃើញ និងបដិសេធអត្ថបទ ASCII របស់ពុម្ពអក្សរចាស់ Limon/ABC មិនមែនយូនីកូដ។',
      'អនុវត្ត MinHash LSH កម្រិតឯកសារ ដើម្បីកាត់បន្ថយអត្ថបទស្ទួនតាមវេបសាយប្រមាណ ៤៥%។',
      'តម្រង Perplexity៖ ដាក់ពិន្ទុឯកសារដោយប្រើម៉ូដែល KenLM ខ្មែរទំហំ 50M ហើយបោះចោល ២០% ខាងក្រោមដែលមាន Perplexity ខ្ពស់។'
    ],
    url: 'https://huggingface.co/datasets/uonlp/CulturaX'
  },
  {
    id: 'res-oscar-mc4',
    nameKhmer: 'OSCAR 23.01 & mC4 Khmer (Raw Web Raw Crawls)',
    nameEnglish: 'OSCAR 23.01 & mC4 Khmer Subset',
    tier: 'tier3',
    category: 'web_crawl',
    estimatedTokens: '2.5B - 4.5B',
    qualityScore: 65,
    license: 'Common Crawl Terms',
    licenseKm: 'លក្ខខណ្ឌ Common Crawl',
    accessStatus: 'open_public',
    description: 'Large raw text corpora extracted from Common Crawl. Only ~30% of this text is usable after removing machine-translated SEO spam, casino promotion bots, broken character encoding, and unrendered font glyphs.',
    descriptionKm: 'ឃ្លាំងអត្ថបទដើមទ្រង់ទ្រាយធំដែលទាញចេញពី Common Crawl។ មានតែប្រមាណ ~៣០% ប៉ុណ្ណោះដែលអាចប្រើប្រាស់បាន បន្ទាប់ពីលុបសារឥតបានការ SEO បកប្រែដោយម៉ាស៊ីន បូតផ្សព្វផ្សាយល្បែង និងកូដតួអក្សរខូច។',
    curationSteps: [
      'Reject lines with > 15% non-Khmer or punctuation characters.',
      'Drop documents with repetition loops (character 4-grams repeated > 3 times).',
      'Normalize Khmer Unicode characters according to Cambodian National Standard (Unicode Consortium order).',
      'Discard pages with total token count < 50.'
    ],
    curationStepsKm: [
      'បដិសេធបន្ទាត់ដែលមានតួអក្សរមិនមែនខ្មែរ ឬសញ្ញាផ្សេងៗលើសពី ១៥%។',
      'លុបឯកសារដែលមានពាក្យដដែលៗជាប់គ្នា (4-grams ដដែលលើសពី ៣ ដង)។',
      'កំណត់ស្តង់ដារយូនីកូដខ្មែរតាមស្តង់ដារជាតិកម្ពុជា (លំដាប់ Unicode Consortium)។',
      'បោះចោលទំព័រដែលមានចំនួនថូខិនសរុបតិចជាង ៥០។'
    ],
    url: 'https://oscar-project.org'
  },

  // TIER 4: High-Quality Synthetic & Cross-Lingual Instruction (10-15%)
  {
    id: 'res-synthetic-instructions',
    nameKhmer: 'សំណុំទិន្នន័យសំយោគបញ្ញាសិប្បនិម្មិត (LIMA & UltraChat-Khmer)',
    nameEnglish: 'Culturally Adapted Synthetic Instruction Pairs (LIMA, UltraChat, GSM8K)',
    tier: 'tier4',
    category: 'synthetic',
    estimatedTokens: '150M - 350M',
    qualityScore: 95,
    license: 'Custom Synthetic / MIT',
    licenseKm: 'ទិន្នន័យសំយោគផ្ទាល់ខ្លួន / MIT',
    accessStatus: 'synthesized',
    description: 'High-reasoning math, coding, logical deduction, and general knowledge datasets generated by translating and culturally adapting top instruction datasets into natural Khmer using frontier LLMs + native human reviewer filtering.',
    descriptionKm: 'សំណុំទិន្នន័យគណិតវិទ្យា សរសេរកូដ ការវិភាគតក្ក និងចំណេះដឹងទូទៅកម្រិតខ្ពស់ ដែលបង្កើតឡើងដោយការបកប្រែ និងសម្របតាមវប្បធម៌ខ្មែរដោយធម្មជាតិ តាមរយៈ LLM ឈានមុខ បូករួមការត្រួតពិនិត្យដោយជនជាតិខ្មែរដើម។',
    curationSteps: [
      'Translate English prompt-response pairs using Gemini 2.5 Pro with explicit "Anti-Translationese" prompting.',
      'Localize entities: replace Western currencies with Cambodian Riel (៛), names with Khmer names (រិទ្ធី, បុប្ផា), and Cambodian geography.',
      'Enforce proper Khmer politeness particles (បាទ, ចាស, សូម, អរគុណ).',
      'Validate responses with native human annotators to ensure idiomatic fluency.'
    ],
    curationStepsKm: [
      'បកប្រែគូសំណួរ-ចម្លើយពីអង់គ្លេសដោយប្រើការបញ្ជា "ប្រឆាំងរចនាបទបកប្រែត្រង់ៗ" ឱ្យទៅជាខ្មែរធម្មជាតិ។',
      'ធ្វើមូលដ្ឋានីយកម្មនាម៖ ប្តូររូបិយប័ណ្ណបរទេសទៅជារៀលកម្ពុជា (៛) ឈ្មោះទៅជាឈ្មោះខ្មែរ (រិទ្ធី, បុប្ផា) និងភូមិសាស្ត្រកម្ពុជា។',
      'ធានាការប្រើពាក្យគួរសមខ្មែរត្រឹមត្រូវ (បាទ, ចាស, សូម, អរគុណ)។',
      'ផ្ទៀងផ្ទាត់ចម្លើយជាមួយអ្នកជំនាញភាសាខ្មែរ ដើម្បីធានាភាពរលូនតាមសំនួនវោហារដើម។'
    ],
    url: 'https://github.com'
  }
];

export const KHMER_CLEANING_RULES: CleaningRule[] = [
  {
    id: 'rule-legacy-fonts',
    title: 'Limon / ABC Legacy Font Detection & Stripping',
    titleKm: 'ការរកឃើញ និងលុបពុម្ពអក្សរចាស់ Limon / ABC',
    category: 'encoding',
    description: 'Before Unicode became universal in Cambodia (circa 2007), texts were typed using English ASCII letters that mapped visually to Khmer glyphs via custom fonts (Limon, ABC, Bayon). If fed into an LLM, these appear as gibberish English (e.g., "Gñk Edl", "RBH", "bBa¢a").',
    descriptionKm: 'មុនពេលយូនីកូដត្រូវបានប្រើប្រាស់ទូទៅនៅកម្ពុជា (ប្រមាណឆ្នាំ ២០០៧) អត្ថបទត្រូវបានវាយដោយប្រើអក្សរឡាតាំង ASCII ដែលបង្ហាញជារូបរាងអក្សរខ្មែរតាមរយៈពុម្ពអក្សរពិសេស (Limon, ABC, Bayon)។ បើបញ្ចូលទៅក្នុង LLM វានឹងលេចចេញជាអក្សរឡាតាំងឥតន័យ (ដូចជា "Gñk Edl", "RBH", "bBa¢a")។',
    impactIfIgnored: 'Model learns to output nonsense Latin letters when attempting to generate Khmer concepts, causing catastrophic token confusion.',
    impactIfIgnoredKm: 'ម៉ូដែលនឹងរៀនបង្កើតអក្សរឡាតាំងគ្មានន័យនៅពេលព្យាយាមសរសេរគំនិតជាភាសាខ្មែរ ដែលបង្កឱ្យមានភាពច្របូកច្របល់ថូខិនធ្ងន់ធ្ងរ។',
    regexOrTool: 'Python regex for Limon letter n-grams: (Gñk|Edl|RBH|bBa¢a|enH|mYy|rbs;)',
    regexOrToolKm: 'Python Regex សម្រាប់ចាប់អក្សរពុម្ព Limon៖ (Gñk|Edl|RBH|bBa¢a|enH|mYy|rbs;)',
    exampleBadKh: 'GñkEdleZVIkarGVImYy (Displays as "អ្នកដែលធ្វើការអ្វីមួយ" only if Limon font is installed; raw bytes are ASCII!)',
    exampleBadKhKm: 'GñkEdleZVIkarGVImYy (បង្ហាញជា "អ្នកដែលធ្វើការអ្វីមួយ" លុះត្រាតែមានពុម្ព Limon; បៃដើមគឺជា ASCII!)',
    exampleGoodKh: 'អ្នកដែលធ្វើការអ្វីមួយ (Proper UTF-8 Unicode characters: \\u17A2\\u17D2\\u1793\\u1780...)',
    exampleGoodKhKm: 'អ្នកដែលធ្វើការអ្វីមួយ (តួអក្សរ UTF-8 Unicode ត្រឹមត្រូវ៖ \\u17A2\\u17D2\\u1793\\u1780...)'
  },
  {
    id: 'rule-unicode-reordering',
    title: 'Khmer Syllable Unicode Canonical Reordering',
    titleKm: 'ការតម្រៀបលំដាប់យូនីកូដព្យាង្គខ្មែរតាមស្តង់ដារ',
    category: 'orthography',
    description: 'Khmer characters can visually look identical on screen even if typed in different Unicode order (e.g. Consonant + Coeng + Vowel vs Consonant + Vowel + Coeng). Canonical order MUST be enforced: Consonant -> Coeng Sign (្ / U+17D2) -> Subscript Consonant -> Dependent Vowel -> Diacritic Sign.',
    descriptionKm: 'តួអក្សរខ្មែរអាចមើលឃើញដូចគ្នាលើអេក្រង់ ទោះបីវាយតាមលំដាប់យូនីកូដខុសគ្នាក៏ដោយ (ឧ. ព្យញ្ជនៈ + ជើង + ស្រៈ ទល់នឹង ព្យញ្ជនៈ + ស្រៈ + ជើង)។ ត្រូវតែបង្ខំលំដាប់ស្តង់ដារ៖ ព្យញ្ជនៈ -> សញ្ញាជើង (្ / U+17D2) -> ព្យញ្ជនៈជើង -> ស្រៈនិស្ស័យ -> វណ្ណយុត្តិ។',
    impactIfIgnored: 'Two identical-looking words produce completely different token sequences, splitting your dataset representation and doubling vocabulary fragmentation.',
    impactIfIgnoredKm: 'ពាក្យពីរដែលមើលទៅដូចគ្នា នឹងបង្កើតលំដាប់ថូខិនខុសគ្នាទាំងស្រុង ដែលបំបែកទិន្នន័យបង្វឹក និងធ្វើឱ្យវាក្យសព្ទបែកខ្ញែកទ្វេដង។',
    regexOrTool: 'Unicode Normalization Form C (NFC) + Khmer Reordering Grammar (Unicode TR31)',
    regexOrToolKm: 'Unicode Normalization Form C (NFC) + ក្បួនតម្រៀបខ្មែរ (Unicode TR31)',
    exampleBadKh: 'ក + ើ (U+1780 + U+17BE)',
    exampleBadKhKm: 'ក + ើ (លំដាប់ខុសស្តង់ដារ ឬច្របូកច្របល់ស្រៈ-ជើង)',
    exampleGoodKh: 'ក + ើ (Strict NFC order ensured across all document tokens)',
    exampleGoodKhKm: 'ក + ើ (ធានាលំដាប់ NFC ត្រឹមត្រូវគ្រប់ថូខិនក្នុងឯកសារ)'
  },
  {
    id: 'rule-casino-spam',
    title: 'Online Gambling & Telegram Bot Scrubber',
    titleKm: 'ឧបករណ៍សម្អាតសារល្បែងអនឡាញ និងបូត Telegram',
    category: 'spam',
    description: 'Over 40% of the raw Khmer Common Crawl corpus consists of spam from illegal online casinos, betting platforms, and scam call centers based in the region, using keyword stuffing.',
    descriptionKm: 'ជាង ៤០% នៃឃ្លាំងទិន្នន័យ Common Crawl ខ្មែរដើម គឺជាសារឥតបានការពីកាស៊ីណូអនឡាញខុសច្បាប់ គេហទំព័រភ្នាល់ និងបណ្តាញឆបោក ដែលប្រើពាក្យគន្លឹះញាត់ពេញទំព័រ។',
    impactIfIgnored: 'Your model will frequently hallucinate betting odds, gambling deposit links, and Telegram invite links in innocent conversations.',
    impactIfIgnoredKm: 'ម៉ូដែលរបស់អ្នកនឹងឧស្សាហ៍បង្កើតតំណភ្ជាប់ភ្នាល់ ល្បែងស៊ីសង និងតំណអញ្ជើញ Telegram ចូលទៅក្នុងការសន្ទនាធម្មតា។',
    regexOrTool: '(កាស៊ីណូ|បាការ៉ាត់|ភ្នាល់បាល់|ដាក់ប្រាក់|ដកប្រាក់|វេបសាយភ្នាល់|សេវា២៤ម៉ោង|Telegram:|line id:)',
    regexOrToolKm: '(កាស៊ីណូ|បាការ៉ាត់|ភ្នាល់បាល់|ដាក់ប្រាក់|ដកប្រាក់|វេបសាយភ្នាល់|សេវា២៤ម៉ោង|Telegram:|line id:)',
    exampleBadKh: 'ចូលរួមលេងកាស៊ីណូអនឡាញឈ្នះ១០០% ដាក់ប្រាក់ភ្លាមបានប្រាក់រង្វាន់ Telegram @betting88',
    exampleBadKhKm: 'ចូលរួមលេងកាស៊ីណូអនឡាញឈ្នះ១០០% ដាក់ប្រាក់ភ្លាមបានប្រាក់រង្វាន់ Telegram @betting88',
    exampleGoodKh: '[DOCUMENT DISCARDED] - Exceeds maximum spam density threshold',
    exampleGoodKhKm: '[ឯកសារត្រូវបានបោះបង់] - លើសកម្រិតដង់ស៊ីតេសារឥតបានការអតិបរមា'
  },
  {
    id: 'rule-fasttext-lid',
    title: 'FastText Language Identification (Khmer vs Thai/Lao/Vietnamese)',
    titleKm: 'ការកំណត់អត្តសញ្ញាណភាសាដោយ FastText (ខ្មែរ ទល់នឹង ថៃ/ឡាវ/វៀតណាម)',
    category: 'language_id',
    description: 'Web scrapers often classify Southeast Asian multilingual pages as Khmer even if 80% is Thai, Lao, or Vietnamese. We apply FastText lid.176.bin with a strict confidence threshold > 0.85.',
    descriptionKm: 'កម្មវិធីប្រមូលទិន្នន័យវេបសាយ ជារឿយៗចាត់ថ្នាក់ទំព័រពហុភាសាអាស៊ីអាគ្នេយ៍ថាជាភាសាខ្មែរ ទោះបី ៨០% ជាភាសាថៃ ឡាវ ឬវៀតណាមក៏ដោយ។ យើងប្រើ FastText lid.176.bin ជាមួយកម្រិតទំនុកចិត្ត > 0.85។',
    impactIfIgnored: 'Model generates mixed Thai/Khmer sentences (e.g. combining Thai vowels with Khmer consonants).',
    impactIfIgnoredKm: 'ម៉ូដែលនឹងបង្កើតប្រយោគលាយថៃ/ខ្មែរ (ឧ. ផ្សំស្រៈថៃជាមួយព្យញ្ជនៈខ្មែរ)។',
    regexOrTool: 'fasttext.load_model("lid.176.bin").predict(doc, k=1)[1][0] >= 0.85',
    regexOrToolKm: 'fasttext.load_model("lid.176.bin").predict(doc, k=1)[1][0] >= 0.85',
    exampleBadKh: 'สวัสดีครับ នេះគឺជាព័ត៌មាន mới nhất (Mixed language contamination)',
    exampleBadKhKm: 'สวัสดีครับ នេះគឺជាព័ត៌មាន mới nhất (ការលាយឡំភាសាផ្សេងៗ)',
    exampleGoodKh: 'ជំរាបសួរ នេះគឺជាព័ត៌មានថ្មីបំផុតសម្រាប់ថ្ងៃនេះ (Pure high-confidence Khmer)',
    exampleGoodKhKm: 'ជំរាបសួរ នេះគឺជាព័ត៌មានថ្មីបំផុតសម្រាប់ថ្ងៃនេះ (ភាសាខ្មែរសុទ្ធកម្រិតទំនុកចិត្តខ្ពស់)'
  },
  {
    id: 'rule-minhash-dedup',
    title: 'Document-Level MinHash Deduplication (LSH)',
    titleKm: 'ការលុបឯកសារស្ទួនកម្រិតឯកសារដោយ MinHash (LSH)',
    category: 'dedup',
    description: 'Cambodian news outlets and government ministries often repost identical press releases across dozens of domains. MinHash LSH with 128 permutation hashes eliminates verbatim duplicates.',
    descriptionKm: 'សារព័ត៌មាន និងក្រសួងស្ថាប័នកម្ពុជា តែងតែបង្ហោះសេចក្តីប្រកាសព័ត៌មានដូចគ្នាបេះបិទនៅលើគេហទំព័ររាប់សិប។ MinHash LSH ជាមួយ 128 permutation hashes ជួយលុបឯកសារស្ទួនទាំងស្រុងចេញ។',
    impactIfIgnored: 'Model overfits on repetitive press releases, repeating identical phrases verbatim and suffering catastrophic loss of diversity.',
    impactIfIgnoredKm: 'ម៉ូដែលនឹងចាំស្ទាត់ពេកលើសេចក្តីប្រកាសដដែលៗ (Overfit) ហើយនិយាយឃ្លាដូចគ្នាបេះបិទ និងបាត់បង់ភាពចម្រុះនៃភាសា។',
    regexOrTool: 'Datasketch MinHash with 128 permutations, Jaccard similarity threshold = 0.80',
    regexOrToolKm: 'Datasketch MinHash ជាមួយ 128 permutations, កម្រិត Jaccard similarity = 0.80',
    exampleBadKh: '100+ duplicate copies of official administrative holiday announcements in Common Crawl',
    exampleBadKhKm: 'ឯកសារស្ទួន ១០០+ ច្បាប់នៃសេចក្តីជូនដំណឹងថ្ងៃឈប់សម្រាកផ្លូវការក្នុង Common Crawl',
    exampleGoodKh: 'Single canonical copy retained; 99 duplicate instances pruned',
    exampleGoodKhKm: 'រក្សាទុកតែច្បាប់ដើម ១ ប៉ុណ្ណោះ; ឯកសារស្ទួន ៩៩ ទៀតត្រូវបានលុបចោល'
  }
];

export const ROADMAP_STEPS: RoadmapStep[] = [
  {
    stepNumber: '01',
    title: 'Data Ingestion & Orthographic Normalization',
    titleKm: 'ការប្រមូលទិន្នន័យ និងកែសម្រួលអក្ខរាវិរុទ្ធយូនីកូដ',
    subtitleKhmer: 'ការប្រមូលទិន្នន័យ និងកែសម្រួលអក្ខរាវិរុទ្ធយូនីកូដ',
    objective: 'Build an auditable data pipeline that ingests 5B+ raw tokens and filters down to 1.5B - 2.5B pristine, deduplicated, Unicode-normalized Khmer tokens.',
    objectiveKm: 'កសាងខ្សែសង្វាក់ទិន្នន័យដែលអាចត្រួតពិនិត្យបាន ដោយប្រមូលថូខិនដើម 5B+ ហើយចម្រោះមកត្រឹម 1.5B - 2.5B ថូខិនខ្មែរស្អាត គ្មានស្ទួន និងត្រឹមត្រូវតាមស្តង់ដារយូនីកូដ។',
    keyDecisions: [
      'Prioritize Tier 1 (Buddhist Institute, Royal Academy, Royal Gazette) with 3x-5x upsampling.',
      'Enforce strict UTF-8 Unicode canonical normalization to eliminate illegal Coeng sequences.',
      'Implement custom regex to detect and purge legacy Limon ASCII font artifacts.',
      'Use MinHash LSH at 0.80 Jaccard similarity to eliminate boilerplate news copies.'
    ],
    keyDecisionsKm: [
      'ផ្តល់អាទិភាពដល់ Tier 1 (ពុទ្ធសាសនបណ្ឌិត្យ រាជបណ្ឌិត្យសភា រាជកិច្ច) ដោយធ្វើសំណាកលើស 3x-5x។',
      'បង្ខំស្តង់ដារ UTF-8 Unicode canonical ដើម្បីលុបបំបាត់លំដាប់ជើងព្យញ្ជនៈខុសក្បួន។',
      'អនុវត្ត Regex ផ្ទាល់ខ្លួនដើម្បីរកឃើញ និងកម្ចាត់កូដ ASCII ពុម្ពអក្សរចាស់ Limon។',
      'ប្រើ MinHash LSH នៅកម្រិត Jaccard similarity 0.80 ដើម្បីលុបព័ត៌មានចម្លងដដែលៗ។'
    ],
    commonPitfalls: [
      'Training on raw Common Crawl without stripping casino keywords (results in toxic betting hallucinations).',
      'Ignoring Limon ASCII encodings (poisons the model with random Latin characters).',
      'Discarding punctuation marks (Khmer punctuation ។ ៕ defines crucial sentence boundaries).'
    ],
    commonPitfallsKm: [
      'ការបង្វឹកលើ Common Crawl ដើមដោយមិនលុបពាក្យកាស៊ីណូ (ធ្វើឱ្យម៉ូដែលភ្លាត់បង្កើតមាតិកាល្បែងស៊ីសង)។',
      'មើលរំលងកូដ ASCII Limon (ធ្វើឱ្យម៉ូដែលពុលដោយអក្សរឡាតាំងឥតន័យ)។',
      'លុបចោលសញ្ញាវណ្ណយុត្តិ (សញ្ញា ។ ៕ កំណត់ព្រំដែនប្រយោគដ៏សំខាន់បំផុត)។'
    ],
    codeSnippet: {
      language: 'python',
      filename: 'normalize_khmer_corpus.py',
      code: `import re
import unicodedata

# 1. Regex to catch legacy Limon font artifacts
LIMON_PATTERN = re.compile(r'\\b(Gñk|Edl|RBH|bBa¢a|enH|mYy|rbs;|eRkamy|GVI|曼谷)\\b')

# 2. Online casino spam keywords
CASINO_SPAM_PATTERN = re.compile(
    r'(កាស៊ីណូ|បាការ៉ាត់|ភ្នាល់បាល់|ដាក់ប្រាក់|ដកប្រាក់|ហ្គេមបាញ់ត្រី|slot\\s*online|telegram\\s*:\\s*@)',
    re.IGNORECASE
)

# 3. Valid Khmer Unicode Range (U+1780 to U+17FF)
KHMER_CHAR_REGEX = re.compile(r'[\\u1780-\\u17FF]')

def is_clean_khmer_document(text: str, min_khmer_ratio=0.60) -> bool:
    """Validate document language purity and check for spam/legacy encoding."""
    if len(text.strip()) < 80:
        return False
        
    # Check for legacy Limon encoding
    if LIMON_PATTERN.search(text):
        return False
        
    # Check for online casino spam
    if CASINO_SPAM_PATTERN.search(text):
        return False
        
    # Check Khmer character ratio
    khmer_chars = len(KHMER_CHAR_REGEX.findall(text))
    total_chars = len(text.replace(' ', '').replace('\\n', ''))
    if total_chars == 0 or (khmer_chars / total_chars) < min_khmer_ratio:
        return False
        
    return True

def normalize_khmer_unicode(text: str) -> str:
    """Normalize text using Unicode NFC and fix known Khmer sub-syllable orders."""
    # Standard Unicode NFC normalization
    normalized = unicodedata.normalize('NFC', text)
    # Strip zero-width non-joiners if misused
    normalized = normalized.replace('\\u200c', '')
    return normalized
`
    }
  },
  {
    stepNumber: '02',
    title: 'Custom Khmer Tokenizer Engineering',
    titleKm: 'វិស្វកម្មថូខិនណាយស័រភាសាខ្មែរផ្ទាល់ខ្លួន',
    subtitleKhmer: 'ការបង្វឹកថូខិនណាយស័រភាសាខ្មែរផ្ទាល់ខ្លួន (SentencePiece)',
    objective: 'Train a dedicated SentencePiece Byte-Pair Encoding (BPE) or Unigram tokenizer with 32,000 - 64,000 vocabulary to eliminate the 5x token fertility penalty of Western LLMs.',
    objectiveKm: 'បង្វឹក SentencePiece BPE ឬ Unigram ផ្ទាល់ខ្លួនដែលមានវាក្យសព្ទ 32,000 - 64,000 ដើម្បីលុបបំបាត់ការចំណាយថូខិនលើស ៥ដងរបស់ម៉ូដែលលោកខាងលិច។',
    keyDecisions: [
      'Choose SentencePiece with byte-fallback=True to guarantee zero Out-of-Vocabulary (OOV) errors.',
      'Allocate at least 16,000 dedicated tokens to Khmer syllable clusters and common words.',
      'Test fertility rate ($TFR = \\text{tokens} / \\text{word}$): Aim for $\\le 1.8$ tokens/word (Llama is 6.5+).',
      'Keep 20% of vocabulary for English, digits, and programming code tokens to retain reasoning capacity.'
    ],
    keyDecisionsKm: [
      'ជ្រើសរើស SentencePiece ដោយបើក byte-fallback=True ដើម្បីធានាថាមិនមានកំហុស <unk> (OOV)។',
      'បម្រុងថូខិនយ៉ាងតិច 16,000 សម្រាប់ចង្កោមព្យាង្គខ្មែរ និងពាក្យប្រើញឹកញាប់។',
      'តេស្តអត្រាបំបែកថូខិន (TFR = ថូខិន / ពាក្យ)៖ កំណត់គោលដៅ <= 1.8 ថូខិន/ពាក្យ (Llama គឺ 6.5+)។',
      'រក្សា ២០% នៃវាក្យសព្ទសម្រាប់ភាសាអង់គ្លេស លេខ និងកូដកម្មវិធី ដើម្បីរក្សាសមត្ថភាពគិតវិភាគ។'
    ],
    commonPitfalls: [
      'Using off-the-shelf LLaMA-3 or Mistral tokenizers directly (Khmer text explodes into 8-12 byte tokens per word, slashing effective context from 8k tokens to under 1.2k words!).',
      'Training tokenizer only on Khmer text without English/Code (destroys mathematical and coding logic).',
      'Setting character_coverage < 0.9995 (causes frequent raw byte fallbacks that break subscript ligatures).'
    ],
    commonPitfallsKm: [
      'ប្រើថូខិនណាយស័រ LLaMA-3 ឬ Mistral ដោយផ្ទាល់ (ពាក្យខ្មែរមួយត្រូវបំបែកជា 8-12 ថូខិន បន្ថយបរិបទពី 8k មកត្រឹមក្រោម 1.2k ពាក្យ!)។',
      'បង្វឹកថូខិនណាយស័រលើតែភាសាខ្មែរគ្មានអង់គ្លេស/កូដ (បំផ្លាញតក្កវិជ្ជាគណិតវិទ្យា និងសរសេរកូដ)។',
      'កំណត់ character_coverage < 0.9995 (បង្កឱ្យធ្លាក់ទៅបំបែកជាបៃដើម ដែលផ្តាច់ជើងព្យញ្ជនៈ)។'
    ],
    codeSnippet: {
      language: 'python',
      filename: 'train_khmer_spm.py',
      code: `import sentencepiece as spm

# Train SentencePiece BPE tokenizer optimized for Khmer
spm.SentencePieceTrainer.train(
    input='khmer_corpus_cleaned.txt,code_and_english_seed.txt',
    model_prefix='khmer_spm_32k',
    vocab_size=32000,
    model_type='bpe',             # Or 'unigram'
    character_coverage=0.9995,    # Critical for low-resource Khmer scripts
    byte_fallback=True,           # Ensures no unknown token <unk> crashes
    split_digits=True,            # Essential for math reasoning
    normalization_rule_name='nmt_nfkc',
    user_defined_symbols=['<pad>', '<s>', '</s>', '<unk>', '<mask>'],
    num_threads=16
)

# Test fertility rate
sp = spm.SentencePieceProcessor(model_file='khmer_spm_32k.model')
sample_khmer = "រាជរដ្ឋាភិបាលកម្ពុជាបានប្រកាសដាក់ចេញនូវផែនការយុទ្ធសាស្ត្របញ្ញាសិប្បនិម្មិត"
tokens = sp.encode_as_pieces(sample_khmer)
print(f"Token count: {len(tokens)}")
print(f"Tokens: {tokens}")
# Result: ~8 tokens with custom SPM vs 42 tokens with standard Llama-3!
`
    }
  },
  {
    stepNumber: '03',
    title: 'Model Architecture & Compute Scaling Laws',
    titleKm: 'ស្ថាបត្យកម្មម៉ូដែល និងច្បាប់មាត្រដ្ឋានគណនា',
    subtitleKhmer: 'រចនាសម្ព័ន្ធម៉ូដែល និងការគណនាថាមពលកុំព្យូទ័រ',
    objective: 'Determine compute-optimal model size (1.5B to 3B parameters) and configure modern Transformer enhancements (RoPE, GQA, SwiGLU, RMSNorm).',
    objectiveKm: 'កំណត់ទំហំម៉ូដែលប្រសើរបំផុត (1.5B ដល់ 3B ប៉ារ៉ាម៉ែត្រ) និងកំណត់រចនាសម្ព័ន្ធ Transformer ទំនើប (RoPE, GQA, SwiGLU, RMSNorm)។',
    keyDecisions: [
      'Recommended Size: 1.5B - 3B parameter model (e.g. Llama-3 / Gemma-2 architecture). Ideal balance for Khmer national budget and fast client/mobile inference.',
      'Chinchilla tokens: For a 1.5B model, train on at least 30B to 50B tokens (overtrain on curated Khmer 60% + English/Math/Code 40%).',
      'Rotary Position Embeddings (RoPE) with base frequency $\\theta = 500,000$ to enable 8,192 token context window.',
      'Grouped-Query Attention (GQA) with 4 key-value heads to reduce KV cache memory by 75%.'
    ],
    keyDecisionsKm: [
      'ទំហំណែនាំ៖ ម៉ូដែល 1.5B - 3B ប៉ារ៉ាម៉ែត្រ (ស្ថាបត្យកម្ម Llama-3 / Gemma-2) ស័ក្តិសមនឹងថវិកាជាតិ និងដំណើរការលឿនលើទូរសព្ទ។',
      'ថូខិន Chinchilla៖ សម្រាប់ម៉ូដែល 1.5B ត្រូវបង្វឹកយ៉ាងតិច 30B ដល់ 50B ថូខិន (ខ្មែរសុទ្ធ ៦០% + អង់គ្លេស/គណិត/កូដ ៤០%)។',
      'ប្រើ RoPE ដែលមានប្រេកង់គោល theta = 500,000 ដើម្បីគាំទ្រប្រវែងបរិបទ 8,192 ថូខិន។',
      'ប្រើ Grouped-Query Attention (GQA) ជាមួយ 4 KV heads ដើម្បីកាត់បន្ថយអង្គចងចាំ KV Cache ៧៥%។'
    ],
    commonPitfalls: [
      'Attempting to train a 7B+ parameter model from scratch with under 50B tokens (severely undertrained, high loss, poor generalization).',
      'Training 100% on Khmer with 0% English (model loses reasoning, arithmetic, and structured JSON output capability).',
      'Using standard Multi-Head Attention without GQA (causes out-of-memory errors during long-context inference).'
    ],
    commonPitfallsKm: [
      'ព្យាយាមបង្វឹកម៉ូដែល 7B+ ពីដំបូងជាមួយថូខិនក្រោម 50B (ម៉ូដែលខ្វះការបង្វឹក អត្រាបាត់បង់ខ្ពស់ និងឆ្លើយខ្សោយ)។',
      'បង្វឹក ១០០% លើខ្មែរគ្មានអង់គ្លេស ០% (ម៉ូដែលបាត់បង់សមត្ថភាពវិភាគ នព្វន្ត និងបង្កើតទម្រង់ JSON)។',
      'ប្រើ Multi-Head Attention ធម្មតាដោយគ្មាន GQA (បង្កកំហុសពេញអង្គចងចាំ OOM ពេលប្រើបរិបទវែង)។'
    ],
    codeSnippet: {
      language: 'yaml',
      filename: 'khmer_model_arch.yaml',
      code: `# Architectural Hyperparameters for Khmer-1.5B Foundation LLM
model_type: "llama"
architectures: ["LlamaForCausalLM"]
hidden_size: 2048
num_hidden_layers: 24
num_attention_heads: 16
num_key_value_heads: 4         # GQA 4:1 ratio for low KV-cache memory
intermediate_size: 8192        # SwiGLU activation
hidden_act: "silu"
max_position_embeddings: 8192
rope_theta: 500000.0           # Extended context stability
rms_norm_eps: 1e-05
tie_word_embeddings: false
vocab_size: 32000

# Optimization & Precision
torch_dtype: "bfloat16"
use_cache: true
attention_dropout: 0.0
`
    }
  },
  {
    stepNumber: '04',
    title: 'Pretraining Execution & Cluster Setup',
    titleKm: 'ការប្រតិបត្តិការបង្វឹកដំបូង និងការរៀបចំចង្កោម GPU',
    subtitleKhmer: 'ការបង្វឹកម៉ូដែលដំបូង (Pretraining on GPU Cluster)',
    objective: 'Launch distributed data-parallel pretraining using PyTorch FSDP (Fully Sharded Data Parallel) or Megatron-DeepSpeed with FlashAttention-2.',
    objectiveKm: 'ចាប់ផ្តើមការបង្វឹកចែកចាយទិន្នន័យដោយប្រើ PyTorch FSDP ឬ Megatron-DeepSpeed ជាមួយ FlashAttention-2។',
    keyDecisions: [
      'Hardware Cluster: 8x to 16x NVIDIA H100 80GB SXM5 (or 32x A100 80GB) with NVLink & InfiniBand.',
      'Precision: Pure bfloat16 mixed-precision with FlashAttention-2 enabled for 2.5x speedup.',
      'Learning Rate: Peak $3.0 \\times 10^{-4}$ with 2,000 steps linear warmup and Cosine decay down to $10\\%$.',
      'Curriculum Data Packing: Pack documents into 4,096-token continuous sequences using attention mask separators to eliminate zero-padding waste.'
    ],
    keyDecisionsKm: [
      'ចង្កោមផ្នែករឹង៖ 8x ដល់ 16x NVIDIA H100 80GB SXM5 (ឬ 32x A100 80GB) ជាមួយ NVLink & InfiniBand។',
      'ភាពជាក់លាក់៖ ប្រើ bfloat16 សុទ្ធជាមួយ FlashAttention-2 ដើម្បីបង្កើនល្បឿន ២.៥ ដង។',
      'អត្រាសិក្សា (LR)៖ កំពូល 3.0e-4 ជាមួយការកម្តៅលីនេអ៊ែរ 2,000 ជំហាន និងបន្ថយតាម Cosine មកត្រឹម ១០%។',
      'ការខ្ចប់ទិន្នន័យ៖ តភ្ជាប់ឯកសារជាលំដាប់ 4,096 ថូខិនជាប់ៗគ្នាដោយប្រើ attention mask separator ដើម្បីកុំឱ្យខ្ជះខ្ជាយ padding។'
    ],
    commonPitfalls: [
      'Allowing gradients to spike: Gradient clipping norm must be capped at 1.0.',
      'Failing to monitor training loss divergence: Save checkpoints every 1,000 steps with validation on Buddhist Institute holdouts.',
      'Padding short documents with zeros (wastes up to 35% of GPU compute FLOPs).'
    ],
    commonPitfallsKm: [
      'បណ្តោយឱ្យ Gradient លោតខ្ពស់៖ ត្រូវកំណត់ Gradient clipping norm ត្រឹម 1.0 ជានិច្ច។',
      'ខកខានតាមដានការងាកចេញនៃអត្រាបាត់បង់៖ ត្រូវរក្សាទុក Checkpoint រៀងរាល់ 1,000 ជំហាន និងផ្ទៀងផ្ទាត់លើទិន្នន័យពុទ្ធសាសនបណ្ឌិត្យ។',
      'បំពេញឯកសារខ្លីៗដោយលេខសូន្យ (ខ្ជះខ្ជាយថាមពល GPU FLOPs រហូតដល់ ៣៥%)។'
    ],
    codeSnippet: {
      language: 'python',
      filename: 'train_fsdp_khmer.py',
      code: `import torch
from transformers import AutoConfig, AutoModelForCausalLM, TrainingArguments, Trainer
from transformers import DataCollatorForLanguageModeling

# 1. Initialize Model from custom config
config = AutoConfig.from_pretrained("./khmer_model_arch.yaml")
model = AutoModelForCausalLM.from_config(config)

# 2. Training configuration with FSDP
training_args = TrainingArguments(
    output_dir="./khmer-1.5b-checkpoints",
    per_device_train_batch_size=8,
    gradient_accumulation_steps=4,
    learning_rate=3e-4,
    weight_decay=0.1,
    adam_beta1=0.9,
    adam_beta2=0.95,
    max_grad_norm=1.0,
    warmup_steps=2000,
    lr_scheduler_type="cosine",
    bf16=True,
    logging_steps=10,
    save_steps=1000,
    save_total_limit=5,
    fsdp="full_shard auto_wrap",
    fsdp_transformer_layer_cls_to_wrap="LlamaDecoderLayer",
    report_to="tensorboard"
)
`
    }
  },
  {
    stepNumber: '05',
    title: 'Post-Training: SFT, Politeness & Cultural Alignment',
    titleKm: 'ក្រោយការបង្វឹក៖ SFT សុជីវធម៌ និងការសម្របវប្បធម៌ខ្មែរ',
    subtitleKhmer: 'ការកែលម្អការសន្ទនា និងសុជីវធម៌ភាសាខ្មែរ (SFT & DPO)',
    objective: 'Transform raw next-token prediction into a helpful, culturally attuned Cambodian conversational assistant using 50,000+ curated Khmer instruction pairs.',
    objectiveKm: 'ប្រែក្លាយម៉ូដែលទស្សន៍ទាយថូខិនធម្មតា ទៅជាជំនួយការសន្ទនាភាសាខ្មែរដែលគោរពវប្បធម៌ ដោយប្រើគូបញ្ជា-ចម្លើយខ្មែរស្អាត 50,000+ គូ។',
    keyDecisions: [
      'Incorporate Khmer Honorific and Buddhist registers: Correct usage of ព្រះសង្ឃ (Monks), ព្រះមហាក្សត្រ (Royal), and ផ្លូវការ (Official administrative).',
      'Polite gendered response particles: Ensure proper handling of "បាទ" (male response) and "ចាស" (female response) based on user prompt context.',
      'Direct Preference Optimization (DPO): Train on paired preferred vs rejected answers to prevent western bias, halluncinations, or rude colloquialisms.'
    ],
    keyDecisionsKm: [
      'បញ្ចូលកម្រិតភាសាគោរព៖ ប្រើត្រឹមត្រូវនូវ សង្ឃសព្ទ (ព្រះសង្ឃ) រាជសព្ទ (ព្រះមហាក្សត្រ) និងភាសាផ្លូវការ (រដ្ឋបាល)។',
      'ពាក្យឆ្លើយតបគួរសមតាមភេទ៖ ធានាការប្រើប្រាស់ពាក្យ "បាទ" និង "ចាស" ឱ្យសមស្របតាមបរិបទសំណួររបស់អ្នកប្រើ។',
      'Direct Preference Optimization (DPO)៖ បង្វឹកលើគូចម្លើយល្អទល់នឹងចម្លើយអន់ ដើម្បីទប់ស្កាត់លំអៀងលោកខាងលិច និងពាក្យគ្មានសុជីវធម៌។'
    ],
    commonPitfalls: [
      'Using direct Google Translate of English datasets (results in clumsy "translationese" phrasing that sounds robotic to native speakers).',
      'Confusing general pronouns: Incorrectly mixing ខ្ញុំ (I/me) with អាត្មាភាព (Monk first-person) or ខ្ញុំព្រះករុណា (Speaking to royalty/monks).'
    ],
    commonPitfallsKm: [
      'ប្រើការបកប្រែត្រង់ៗពីអង់គ្លេស (បង្កើតឃ្លា "ភាសាបកប្រែ" ដែលស្តាប់ទៅដូចមនុស្សយន្តសម្រាប់អ្នកនិយាយខ្មែរដើម)។',
      'ច្រឡំសព្វនាម៖ លាយឡំពាក្យ "ខ្ញុំ" ជាមួយ "អាត្មាភាព" (សម្រាប់ព្រះសង្ឃ) ឬ "ខ្ញុំព្រះករុណា"។'
    ],
    codeSnippet: {
      language: 'json',
      filename: 'khmer_sft_sample.jsonl',
      code: `{"messages": [
  {"role": "system", "content": "អ្នកគឺជាជំនួយការបញ្ញាសិប្បនិម្មិតដ៏ឆ្លាតវៃ សុភាពរាបសារ និងគោរពវប្បធម៌ខ្មែរ។ ចូរបកស្រាយប្រកបដោយហេតុផល និងប្រើប្រាស់ពាក្យពេចន៍សមរម្យ។"},
  {"role": "user", "content": "តើប្រាសាទអង្គរវត្តត្រូវបានកសាងឡើងនៅក្នុងរជ្ជកាលនៃព្រះមហាក្សត្រអង្គណា?"},
  {"role": "assistant", "content": "បាទ ប្រាសាទអង្គរវត្តដ៏មហិមាត្រូវបានកសាងឡើងនៅក្នុងរជ្ជកាល **ព្រះបាទសូរ្យវរ្ម័នទី២** នាពាក់កណ្តាលសតវត្សរ៍ទី១២ (ប្រមាណឆ្នាំ ១១១៣ ដល់ ១១៥០ នៃគ.ស.) ដើម្បីឧទ្ទិសថ្វាយដល់ព្រះវិស្ណុក្នុងព្រហ្មញ្ញសាសនា។"}
]}`
    }
  },
  {
    stepNumber: '06',
    title: 'Evaluation Benchmarks & Linguistic Validation',
    titleKm: 'ការវាយតម្លៃគុណភាព និងសុពលភាពភាសាវិទ្យា',
    subtitleKhmer: 'ការវាយតម្លៃគុណភាព និងការធ្វើតេស្តស្ដង់ដារ',
    objective: 'Rigorously test the model across standard Khmer NLP benchmarks, reading comprehension, and human qualitative panels.',
    objectiveKm: 'ធ្វើតេស្តម៉ូដែលយ៉ាងម៉ត់ចត់លើស្តង់ដារ Khmer NLP ការយល់អត្ថបទអាន និងការវាយតម្លៃគុណភាពដោយអ្នកជំនាញខ្មែរ។',
    keyDecisions: [
      'Evaluate on Belebele (Khmer subset) for cross-lingual reading comprehension.',
      'Benchmark on TyDi QA (Khmer portion) for extractive question answering.',
      'Build a Khmer MMLU (Cambodian Grade 12 National Exam questions in History, Literature, Biology, and Civics).',
      'Conduct a human evaluation panel with native Khmer teachers and linguists.'
    ],
    keyDecisionsKm: [
      'វាយតម្លៃលើ Belebele (ផ្នែកភាសាខ្មែរ) សម្រាប់ការយល់អត្ថបទអានឆ្លងភាសា។',
      'ប្រៀបធៀបលើ TyDi QA (ផ្នែកភាសាខ្មែរ) សម្រាប់ការឆ្លើយសំណួរដកស្រង់ពីអត្ថបទ។',
      'បង្កើត Khmer MMLU (វិញ្ញាសាប្រឡងបាក់ឌុបថ្នាក់ទី១២ ផ្នែកប្រវត្តិវិទ្យា អក្សរសាស្ត្រ ជីវវិទ្យា និងពលរដ្ឋវិជ្ជា)។',
      'រៀបចំគណៈកម្មការវាយតម្លៃដោយគ្រូបង្រៀន និងអ្នកភាសាវិទ្យាខ្មែរដើម។'
    ],
    commonPitfalls: [
      'Relying solely on perplexity (a model can have low perplexity by memorizing common news headlines while failing at simple logical deduction).',
      'Evaluating only in English translation (masks catastrophic Khmer grammar and orthography breakdowns).'
    ],
    commonPitfallsKm: [
      'ពឹងផ្អែកតែលើ Perplexity (ម៉ូដែលអាចមាន Perplexity ទាបដោយគ្រាន់តែទន្ទេញចំណងជើងព័ត៌មាន ប៉ុន្តែបរាជ័យលើតក្កវិជ្ជាសាមញ្ញ)។',
      'វាយតម្លៃតែតាមការបកប្រែជាអង់គ្លេស (លាក់បាំងកំហុសវេយ្យាករណ៍ និងអក្ខរាវិរុទ្ធខ្មែរធ្ងន់ធ្ងរ)។'
    ],
    codeSnippet: {
      language: 'python',
      filename: 'eval_khmer_benchmark.py',
      code: `from datasets import load_dataset
from lm_eval import evaluator

# 1. Evaluate on Belebele Khmer Reading Comprehension
results = evaluator.simple_evaluate(
    model="hf",
    model_args="pretrained=./khmer-1.5b-instruct",
    tasks=["belebele_khm_Khmr"],
    num_fewshot=5,
    batch_size=8
)

print(f"Khmer Belebele Accuracy: {results['results']['belebele_khm_Khmr']['acc,none']:.2%}")
`
    }
  }
];

export const KHMER_REGISTERS = [
  {
    level: 'Royal Register (រាជសព្ទ)',
    levelKm: 'រាជសព្ទ (ភាសាព្រះមហាក្សត្រ)',
    usage: 'Used exclusively when referring to the King, Queen, and Royal Family.',
    usageKm: 'ប្រើប្រាស់ផ្តាច់មុខនៅពេលសំដៅដល់ព្រះមហាក្សត្រ ព្រះមហាក្សត្រិយានី និងព្រះរាជវង្សានុវង្ស។',
    firstPerson: 'ទូលព្រះបង្គំ / ទូលព្រះបង្គំខ្ញុំម្ចាស់',
    secondPerson: 'ទ្រង់ / ព្រះករុណាជាអម្ចាស់ជីវិតលើត្បូង',
    eatVerb: 'សោយ (Saoy)',
    eatVerbKm: 'សោយ (រាជសព្ទ)',
    sleepVerb: 'ផ្ទំ (Phtom)',
    sleepVerbKm: 'ផ្ទំ (រាជសព្ទ)',
    importance: 'Mandatory for Cambodian legal decrees, national historical narratives, and official protocol.',
    importanceKm: 'ជាកាតព្វកិច្ចចាំបាច់សម្រាប់ព្រះរាជក្រឹត្យ អត្ថបទប្រវត្តិសាស្ត្រជាតិ និងពិធីការផ្លូវការ។'
  },
  {
    level: 'Buddhist Monastic Register (សង្ឃសព្ទ)',
    levelKm: 'សង្ឃសព្ទ (ភាសាព្រះសង្ឃ)',
    usage: 'Used when addressing or speaking as Buddhist monks (ព្រះសង្ឃ).',
    usageKm: 'ប្រើប្រាស់នៅពេលទូលថ្វាយ ឬព្រះសង្ឃមានថេរដីកាជាមួយគ្រហស្ថ។',
    firstPerson: 'អាត្មា / អាត្មាភាព (Spoken by monk) or ខ្ញុំព្រះករុណា (Spoken to monk)',
    firstPersonKm: 'អាត្មា / អាត្មាភាព (ព្រះសង្ឃប្រើ) ឬ ខ្ញុំព្រះករុណា (គ្រហស្ថទូល)',
    secondPerson: 'ព្រះតេជព្រះគុណ / លោកម្ចាស់',
    eatVerb: 'ឆាន់ (Chhan)',
    eatVerbKm: 'ឆាន់ (សង្ឃសព្ទ)',
    sleepVerb: 'សិង (Seng)',
    sleepVerbKm: 'សិង (សង្ឃសព្ទ)',
    importance: 'Crucial because Buddhism is the state religion (95%+ of population); improper terminology causes immediate offense.',
    importanceKm: 'សំខាន់បំផុត ព្រោះព្រះពុទ្ធសាសនាជាសាសនារបស់រដ្ឋ (៩៥%+ នៃប្រជាជន); ការប្រើខុសបង្កការខ្វះការគោរពភ្លាមៗ។'
  },
  {
    level: 'High Formal & Administrative (ផ្លូវការ / គួរសមខ្ពស់)',
    levelKm: 'ភាសាផ្លូវការ / គួរសមខ្ពស់ (រដ្ឋបាល)',
    usage: 'Used in government ministries, academic writing, legal texts, and professional business communications.',
    usageKm: 'ប្រើប្រាស់ក្នុងក្រសួងស្ថាប័នរដ្ឋ សំណេរសិក្សាស្រាវជ្រាវ អត្ថបទច្បាប់ និងទំនាក់ទំនងធុរកិច្ចវិជ្ជាជីវៈ។',
    firstPerson: 'ខ្ញុំបាទ (Male) / នាងខ្ញុំ (Female)',
    firstPersonKm: 'ខ្ញុំបាទ (ប្រុស) / នាងខ្ញុំ (ស្រី)',
    secondPerson: 'លោក / លោកស្រី / ឯកឧត្តម / លោកជំទាវ',
    eatVerb: 'ទទួលទាន / ពិសារ (Totuoltean / Pisa)',
    eatVerbKm: 'ទទួលទាន / ពិសារ',
    sleepVerb: 'សម្រាក (Somrak)',
    sleepVerbKm: 'សម្រាក',
    importance: 'The default optimal register for conversational LLMs during general assistance.',
    importanceKm: 'ជាកម្រិតភាសាលំនាំដើមដ៏ល្អបំផុតសម្រាប់ LLM ក្នុងការសន្ទនាផ្តល់ជំនួយទូទៅ។'
  },
  {
    level: 'Colloquial & Familiar (សាមញ្ញ / ក្នុងគ្រួសារ)',
    levelKm: 'ភាសាសាមញ្ញ / ក្នុងគ្រួសារ',
    usage: 'Everyday casual speech with friends and family.',
    usageKm: 'ការនិយាយប្រចាំថ្ងៃជាមួយមិត្តភក្តិ និងសមាជិកគ្រួសារ។',
    firstPerson: 'ខ្ញុំ / ញ៉ុម (Khnhom)',
    firstPersonKm: 'ខ្ញុំ / ញ៉ុម',
    secondPerson: 'ឯង / អ្នក / បង / អូន',
    eatVerb: 'ញ៉ាំ (Nham)',
    eatVerbKm: 'ញ៉ាំ',
    sleepVerb: 'ដេក (Dek)',
    sleepVerbKm: 'ដេក / គេង',
    importance: 'Useful for social media chatbots, but must be controlled so the model does not sound disrespectful.',
    importanceKm: 'មានប្រយោជន៍សម្រាប់ Chatbot បណ្តាញសង្គម ប៉ុន្តែត្រូវគ្រប់គ្រងកុំឱ្យម៉ូដែលស្តាប់ទៅខ្វះសុជីវធម៌។'
  }
];
