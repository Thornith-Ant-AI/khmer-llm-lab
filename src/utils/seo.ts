import { Language } from '../contexts/LanguageContext';
import {
  HOME_SEO_METADATA,
  KHMER_LLM_SEO_SECTIONS,
  resolveSeoCopy,
  SectionSeoEntry,
} from '../data/seoMetadata';

export { HOME_SEO_METADATA, KHMER_LLM_SEO_SECTIONS, resolveSeoCopy };
export type { SectionSeoEntry };

function upsertMetaTag(
  attribute: 'name' | 'property',
  key: string,
  content: string
) {
  let el = document.querySelector(`meta[${attribute}="${key}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attribute, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertLinkTag(rel: string, href: string, hreflang?: string) {
  const selector = hreflang
    ? `link[rel="${rel}"][hreflang="${hreflang}"]`
    : `link[rel="${rel}"]:not([hreflang])`;
  let el = document.querySelector(selector) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    if (hreflang) el.setAttribute('hreflang', hreflang);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

/**
 * Dynamically synchronizes title, meta description, keywords, OpenGraph,
 * Twitter cards, hreflang alternates, canonical URL, and Schema.org JSON-LD
 * for both English and Khmer across all Khmer LLM studio sections.
 */
export function applyBilingualSeo(language: Language, activeTab: string): void {
  if (typeof document === 'undefined' || typeof window === 'undefined') return;

  const section = KHMER_LLM_SEO_SECTIONS[activeTab] || KHMER_LLM_SEO_SECTIONS['data-matrix'];
  const localized = language === 'km' ? section.km : section.en;
  const home = HOME_SEO_METADATA[language];

  const basePath = `${window.location.origin}${window.location.pathname}`;
  const canonicalUrl = `${basePath}?section=${encodeURIComponent(section.id)}&lang=${language}`;
  const enAlternateUrl = `${basePath}?section=${encodeURIComponent(section.id)}&lang=en`;
  const kmAlternateUrl = `${basePath}?section=${encodeURIComponent(section.id)}&lang=km`;
  const xDefaultUrl = `${basePath}?section=${encodeURIComponent(section.id)}`;
  const ogImageUrl = `${window.location.origin}/og-khmer-llm.jpg`;

  // 1. HTML lang & document title
  document.documentElement.lang = language === 'km' ? 'km' : 'en';
  document.title = localized.title;

  // 2. Standard SEO meta tags
  upsertMetaTag('name', 'description', localized.description);
  upsertMetaTag('name', 'keywords', localized.keywords);

  // 3. OpenGraph bilingual tags (Facebook, LinkedIn, Telegram, WhatsApp, Discord)
  upsertMetaTag('property', 'og:type', 'website');
  upsertMetaTag('property', 'og:site_name', home.siteName);
  upsertMetaTag('property', 'og:title', localized.title);
  upsertMetaTag('property', 'og:description', localized.description);
  upsertMetaTag('property', 'og:url', canonicalUrl);
  upsertMetaTag('property', 'og:image', ogImageUrl);
  upsertMetaTag('property', 'og:image:secure_url', ogImageUrl);
  upsertMetaTag('property', 'og:image:type', 'image/jpeg');
  upsertMetaTag('property', 'og:image:width', '1200');
  upsertMetaTag('property', 'og:image:height', '630');
  upsertMetaTag('property', 'og:image:alt', home.imageAlt);
  upsertMetaTag('property', 'og:locale', language === 'km' ? 'km_KH' : 'en_US');
  upsertMetaTag(
    'property',
    'og:locale:alternate',
    language === 'km' ? 'en_US' : 'km_KH'
  );

  // 4. Twitter / X cards
  upsertMetaTag('name', 'twitter:card', 'summary_large_image');
  upsertMetaTag('name', 'twitter:title', localized.title);
  upsertMetaTag('name', 'twitter:description', localized.description);
  upsertMetaTag('name', 'twitter:image', ogImageUrl);
  upsertMetaTag('name', 'twitter:image:alt', home.imageAlt);

  // 5. Canonical & Bilingual hreflang links
  upsertLinkTag('canonical', canonicalUrl);
  upsertLinkTag('alternate', enAlternateUrl, 'en');
  upsertLinkTag('alternate', kmAlternateUrl, 'km');
  upsertLinkTag('alternate', xDefaultUrl, 'x-default');

  // 6. Schema.org Structured Data (JSON-LD)
  const jsonLdPayload = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        '@id': `${basePath}#webapp`,
        name: 'Khmer LLM Architect & Pretraining Lab',
        alternateName: 'មន្ទីរពិសោធន៍វិស្វកម្ម Khmer LLM',
        url: basePath,
        image: ogImageUrl,
        applicationCategory: 'DeveloperApplication',
        operatingSystem: 'All',
        inLanguage: language === 'km' ? ['km', 'en'] : ['en', 'km'],
        availableLanguage: [
          { '@type': 'Language', name: 'English', alternateName: 'en' },
          { '@type': 'Language', name: 'Khmer', alternateName: 'km' },
        ],
        description: localized.description,
        keywords: localized.keywords,
        about: [
          { '@type': 'Thing', name: 'Khmer Large Language Models (Khmer LLM)' },
          { '@type': 'Thing', name: 'Khmer Natural Language Processing (Khmer NLP)' },
          { '@type': 'Thing', name: 'SentencePiece Subword Tokenization' },
          { '@type': 'Thing', name: 'Khmer Corpus Curation & Unicode Hygiene' },
        ],
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
      },
      {
        '@type': 'WebPage',
        '@id': canonicalUrl,
        url: canonicalUrl,
        name: localized.title,
        description: localized.description,
        inLanguage: language === 'km' ? 'km' : 'en',
        isPartOf: { '@id': `${basePath}#webapp` },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name:
              language === 'km'
                ? 'មន្ទីរពិសោធន៍ Khmer LLM'
                : 'Khmer LLM Lab',
            item: `${basePath}?lang=${language}`,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: localized.breadcrumb,
            item: canonicalUrl,
          },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity:
          language === 'km'
            ? [
                {
                  '@type': 'Question',
                  name: 'ហេតុអ្វីបានជាម៉ូដែល LLM បស្ចិមប្រទេសពិបាកដំណើរការជាមួយភាសាខ្មែរ?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'ភាសាខ្មែរសរសេរជាប់គ្នាដោយគ្មានដកឃ្លារវាងពាក្យ (Scriptio Continua) និងមានជើងព្យញ្ជនៈស្មុគស្មាញ ដែលធ្វើឱ្យថូខិនណាយស័រស្តង់ដារបំបែកអក្សរខ្មែរជាបៃច្រើនហួសហេតុ។ ការបង្កើត SentencePiece BPE ផ្ទាល់ខ្លួនសម្រាប់ Khmer LLM អាចបង្រួមថូខិនបានប្រសើរជាង 4.2 ដង។',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'តើទិន្នន័យអ្វីខ្លះដែលល្អបំផុតសម្រាប់បង្វឹក Khmer LLM ពីដំបូង?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'ស្តង់ដារបង្វឹក Khmer LLM ល្អបំផុតផ្អែកលើឋានានុក្រមទិន្នន័យ ៤ កម្រិត៖ កម្រិត ១ អក្សរសិល្ប៍ពុទ្ធសាសនបណ្ឌិត្យ និងច្បាប់ជាតិ កម្រិត ២ សព្វវចនាធិប្បាយ និងអប់រំ កម្រិត ៣ ព័ត៌មានវេបដែលច្រោះ Limon និងសាររំខានរួច និងកម្រិត ៤ ទិន្នន័យសំយោគ SFT។',
                  },
                },
              ]
            : [
                {
                  '@type': 'Question',
                  name: 'Why do standard Western LLMs struggle with Khmer text?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Khmer uses scriptio continua without inter-word spaces and stacks subscript Coeng consonants, causing Western byte-fallback tokenizers to fragment Khmer into excessive tokens. A Khmer-optimized SentencePiece BPE tokenizer achieves 4.2x better token compression.',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'What datasets are required to train a Khmer LLM from scratch?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Training a Khmer foundation LLM relies on a 4-tier corpus hierarchy: Tier 1 Buddhist Institute classics and Royal decrees, Tier 2 Wikipedia and academic curricula, Tier 3 sanitized news web crawls free of Limon ASCII and casino spam, and Tier 4 culturally grounded SFT data.',
                  },
                },
              ],
      },
    ],
  };

  let ldScript = document.getElementById('khmer-llm-schema') as HTMLScriptElement | null;
  if (!ldScript) {
    ldScript = document.createElement('script');
    ldScript.id = 'khmer-llm-schema';
    ldScript.type = 'application/ld+json';
    document.head.appendChild(ldScript);
  }
  ldScript.textContent = JSON.stringify(jsonLdPayload);
}
