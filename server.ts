import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const app = express();
app.use(express.json());

const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (apiKey) {
  aiClient = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(apiKey),
    timestamp: new Date().toISOString()
  });
});

// Heuristic fallback report when Gemini API key is missing or unavailable
function generateLocalBiasReport(text: string, language: string = 'en') {
  const isKm = language === 'km';
  const hasPassiveCalque = text.includes('ត្រូវបាន');
  const hasWesternGreeting = text.includes('អរុណសួស្តី') || text.includes('ទិវាសួស្តី') || text.includes('រាត្រីសួស្តី');
  const hasFormalPronouns = text.includes('លោក') || text.includes('លោកអ្នក') || text.includes('ឯកឧត្តម');
  const hasInformalPronouns = text.includes('ឯង') || text.includes('អញ') || text.includes('វា');
  const hasPoliteParticles = text.includes('បាទ') || text.includes('ចាស');
  const hasForeignCurrency = text.includes('ដុល្លារ') || text.includes('$');

  const flaggedBiases = [];

  if (hasPassiveCalque) {
    flaggedBiases.push({
      category: isKm ? 'ភាសាបកប្រែត្រង់តាមបរទេស (ល្បះសកម្ម/អកម្ម)' : 'Western Translationese (Calque Syntax)',
      severity: 'MEDIUM',
      flaggedSnippet: isKm ? 'ត្រូវបាន... (ទម្រង់ល្បះអកម្មបកប្រែ)' : 'ត្រូវបាន... (Passive Voice Calque)',
      explanation: isKm
        ? 'ការប្រើពាក្យ «ត្រូវបាន» ច្រើនហួសហេតុគឺជាការបកប្រែត្រង់ពីទម្រង់ "is done by" នៃភាសាអង់គ្លេស។ ភាសាខ្មែរធម្មជាតិច្រើនប្រើល្បះសកម្មដែលមានប្រធានច្បាស់លាស់។'
        : 'Overuse of passive "ត្រូវបាន" directly translates English "is done by". Natural Khmer predominantly favors active voice with topicalized subjects.',
      suggestedCorrection: isKm
        ? 'សូមសរសេរឡើងវិញដោយប្រើល្បះសកម្ម៖ «រាជរដ្ឋាភិបាលបានប្រកាស...» ជំនួសឱ្យ «សេចក្តីប្រកាសត្រូវបានធ្វើឡើងដោយ...»'
        : 'Rephrase using active voice: "រាជរដ្ឋាភិបាលបានប្រកាស..." instead of "សេចក្តីប្រកាសត្រូវបានធ្វើឡើងដោយ..."'
    });
  }

  if (hasWesternGreeting) {
    flaggedBiases.push({
      category: isKm ? 'ភាពមិនស៊ីសង្វាក់នៃសុជីវធម៌ និងការជម្រាបសួរ' : 'Cultural Etiquette & Greeting Mismatch',
      severity: 'HIGH',
      flaggedSnippet: 'អរុណសួស្តី / រាត្រីសួស្តី',
      explanation: isKm
        ? 'ការបកប្រែត្រង់ពីពាក្យ "Good morning / Good night" គឺជាស្លាកស្នាមភាសាសំយោគ។ ភាសាខ្មែរពិតប្រាកដប្រើ «ជម្រាបសួរ» (អមដោយការសំពះ) ឬ «សុខសប្បាយជាទេ»។'
        : 'Literal translations of "Good morning / Good night" are synthetic artifacts. Authentic Khmer uses "ជម្រាបសួរ" (with Sompas), "សុខសប្បាយទេ", or situational inquiries.',
      suggestedCorrection: isKm
        ? 'ជំនួសដោយ «ជម្រាបសួរ» សម្រាប់កម្រិតភាសាគួរសមផ្លូវការ ឬ «សុខសប្បាយជាទេ» សម្រាប់ការសន្ទនាទូទៅ។'
        : 'Replace with "ជម្រាបសួរ" for formal polite registers, or "សុខសប្បាយជាទេ" for general dialogue.'
    });
  }

  if (hasFormalPronouns && hasInformalPronouns) {
    flaggedBiases.push({
      category: isKm ? 'ការប៉ះទង្គិចកម្រិតភាសាគោរព និងសព្វនាម' : 'Register & Pronoun Stratification Clash',
      severity: 'HIGH',
      flaggedSnippet: isKm ? 'ការលាយឡំសព្វនាមផ្លូវការ «លោក/អ្នក» ជាមួយ «ឯង»' : 'Mixing formal "លោក/អ្នក" with informal "ឯង"',
      explanation: isKm
        ? 'កម្រិតភាសាគោរពខ្មែរតម្រូវឱ្យមានភាពស៊ីសង្វាក់នៃសព្វនាម។ ការលាយឡំសព្វនាមបុរសទីពីរក្នុងល្បះតែមួយបង្ហាញពីភាពមិនប្រក្រតីនៃបុគ្គលិកលក្ខណៈម៉ូដែល។'
        : 'Khmer honorific registers require strict pronoun symmetry. Mixing second-person forms within the same dialogue signals inconsistent post-training persona.',
      suggestedCorrection: isKm
        ? 'រក្សាភាពឯកភាពនៃសព្វនាមពេញមួយចម្លើយ៖ ប្រើកម្រិតផ្លូវការ (លោក / លោកស្រី) ឬកម្រិតមិត្តភក្តិទូទៅ (អ្នក)។'
        : 'Standardize throughout the turn: keep either formal (លោក / លោកស្រី) or peer conversational (អ្នក).'
    });
  }

  if (hasForeignCurrency) {
    flaggedBiases.push({
      category: isKm ? 'ការធ្វើមូលដ្ឋានីយកម្មសេដ្ឋកិច្ច និងរូបិយវត្ថុ' : 'Cultural Economic Localization',
      severity: 'LOW',
      flaggedSnippet: isKm ? 'ការប្រើរូបិយប័ណ្ណ USD / ដុល្លារ' : 'USD / ដុល្លារ referencing',
      explanation: isKm
        ? 'សំណុំទិន្នន័យសំយោគច្រើនតែប្រើតម្លៃជាដុល្លារដោយស្វ័យប្រវត្តិ។ ទិន្នន័យបរិបទសេដ្ឋកិច្ចក្នុងស្រុកកម្ពុជាគួរប្រើប្រាស់ប្រាក់រៀលខ្មែរ (KHR / រៀល)។'
        : 'Synthetic datasets often default to USD pricing. Localized Cambodian domestic economy datasets should ground everyday examples in Khmer Riel (KHR / រៀល).',
      suggestedCorrection: isKm
        ? 'បង្ហាញប្រតិបត្តិការក្នុងស្រុកជាប្រាក់រៀលខ្មែរ (ឧ. ៥០,០០០ រៀល)។'
        : 'Represent domestic transactions in Khmer Riel (e.g. ៥០,០០០ រៀល).'
    });
  }

  const culturalScore = Math.max(50, 95 - flaggedBiases.length * 12);
  const verdict = flaggedBiases.length === 0
    ? 'BALANCED_AUTHENTIC'
    : hasPassiveCalque || hasWesternGreeting
      ? 'TRANSLATIONESE_DETECTED'
      : 'PHNOM_PENH_URBAN_SKEWED';

  return {
    culturalScore,
    biasVerdict: verdict,
    summary: isKm
      ? flaggedBiases.length === 0
        ? 'ភាពត្រឹមត្រូវផ្នែកវប្បធម៌ និងភាសាខ្ពស់។ រក្សាបាននូវចង្វាក់ប្រយោគខ្មែរធម្មជាតិ ដោយគ្មានទម្រង់បកប្រែត្រង់ពីបរទេស ឬលំអៀងទីក្រុងឡើយ។'
        : `រកឃើញកត្តាលំអៀងភាសាចំនួន ${flaggedBiases.length} ដែលភាគច្រើនជាទម្រង់ភាសាបកប្រែត្រង់ពីបស្ចិមប្រទេស និងទម្ងន់ពាក្យតាមទីក្រុងកណ្តាល។`
      : flaggedBiases.length === 0
        ? 'High cultural and linguistic authenticity. Preserves natural Khmer clausal rhythm without overt urban or foreign calques.'
        : `Identified ${flaggedBiases.length} potential linguistic bias factors, primarily consisting of Western translationese syntax and central urban lexical weighting.`,
    regionalDistribution: {
      phnomPenhUrbanPercent: 68,
      battambangWesternPercent: 16,
      siemReapAngkorPercent: 8,
      ruralGeneralPercent: 6,
      diasporaSurinKromPercent: 2
    },
    registerAnalysis: {
      dominantRegister: isKm
        ? hasFormalPronouns ? 'ភាសាខ្ពស់ / ផ្លូវការគួរសម' : 'ភាសាធម្មតា / ការសន្ទនាទូទៅ'
        : hasFormalPronouns ? 'Khpous / Formal Polite (ភាសាគួរសម)' : 'Thommada / Conversational (ភាសាទូទៅ)',
      honorificPolitenessLevel: isKm
        ? hasPoliteParticles ? 'មានពាក្យគួរសមត្រឹមត្រូវ (បាទ/ចាស)' : 'អព្យាក្រឹត / គ្មានពាក្យបញ្ជាក់'
        : hasPoliteParticles ? 'Appropriately Politeness-Marked (បាទ/ចាស)' : 'Neutral / Unmarked',
      pronounConsistency: isKm
        ? hasFormalPronouns && hasInformalPronouns ? 'រកឃើញសព្វនាមមិនស៊ីសង្វាក់គ្នា' : 'សព្វនាមមានភាពស៊ីសង្វាក់ល្អ'
        : hasFormalPronouns && hasInformalPronouns ? 'Clashing Pronouns Detected' : 'Consistent Pronoun Symmetry'
    },
    flaggedBiases,
    debiasedCulturalAlternative: text
      .replace(/អរុណសួស្តី/g, 'ជម្រាបសួរ')
      .replace(/រាត្រីសួស្តី/g, 'សូមគេងលក់ស្រួល')
      .replace(/ត្រូវបានទទួលស្គាល់ដោយ/g, 'ប្រជាជនទទួលស្គាល់')
  };
}

// Endpoint: Cultural & Regional Khmer Language Bias Monitor (Powered by Gemini API)
app.post('/api/ai/analyze-language-bias', async (req, res) => {
  try {
    const { text, context, language = 'en' } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text is required for bias analysis' });
    }

    if (!aiClient) {
      return res.json({
        success: true,
        isFallback: true,
        data: generateLocalBiasReport(text, language)
      });
    }

    const outputLanguageInstruction = language === 'km'
      ? `IMPORTANT OUTPUT LANGUAGE REQUIREMENT: Write all descriptive text fields ("summary", "registerAnalysis.dominantRegister", "registerAnalysis.honorificPolitenessLevel", "registerAnalysis.pronounConsistency", and every item's "category", "explanation", "suggestedCorrection") in natural, scholarly Khmer (ភាសាខ្មែរ). Keep "biasVerdict" strictly as one of the exact uppercase enum tokens (BALANCED_AUTHENTIC, PHNOM_PENH_URBAN_SKEWED, TRANSLATIONESE_DETECTED, REGISTER_CLASH) and keep "severity" strictly as HIGH, MEDIUM, or LOW.`
      : `Write descriptive text fields in clear English (with Khmer examples/snippets where appropriate).`;

    const systemPrompt = `You are a Senior Khmer Sociolinguist, Dialectologist, and LLM Post-Training Safety Engineer at the Royal Academy of Cambodia (រាជបណ្ឌិត្យសភាកម្ពុជា).
Your objective is to conduct a rigorous linguistic and cultural bias audit of synthetic instruction-response pairs or generated Khmer text.

Specifically evaluate:
1. Regional Dialect Bias: Check if the text is excessively skewed toward Phnom Penh urban youth slang versus Battambang, Siem Reap, Southern provinces, or Khmer Surin/Krom dialects.
2. Western Translationese & Calques: Detect literal English-to-Khmer calques, unnatural passive voice ("ត្រូវបាន..."), direct idiom translations ("វាធ្វើឱ្យអារម្មណ៍ល្អ" instead of "សប្បាយចិត្ត"), or awkward Western sentence structures.
3. Register & Social Stratification (ភាសាសព្ទ): Verify adherence to Khmer honorific levels (Royal Reachasap, Monk Sanghasap, Formal Khpous/Kruosar, Conversational Thommada, or Informal Peap). Check for pronoun clashes (e.g. mixing formal "លោក" with informal "ឯង").
4. Cultural Grounding: Verify polite affirmative particles ("បាទ/ចាស"), appropriate Sompas etiquette, respect for elders, traditional Cambodian holidays, and domestic currency (Riel).
5. Debiased Alternative: Provide a natural, culturally harmonious rewrite in Khmer.

${outputLanguageInstruction}

Respond strictly in valid JSON matching the schema.`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Audit this synthetic Khmer text for cultural and regional linguistic bias:
"""${text}"""
${context ? `Topic/Context: """${context}"""` : ''}`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            culturalScore: { type: Type.INTEGER, description: "Authenticity & cultural balance score 0-100" },
            biasVerdict: { type: Type.STRING, description: "BALANCED_AUTHENTIC, PHNOM_PENH_URBAN_SKEWED, TRANSLATIONESE_DETECTED, or REGISTER_CLASH" },
            summary: { type: Type.STRING, description: "Executive summary of the bias evaluation" },
            regionalDistribution: {
              type: Type.OBJECT,
              properties: {
                phnomPenhUrbanPercent: { type: Type.INTEGER },
                battambangWesternPercent: { type: Type.INTEGER },
                siemReapAngkorPercent: { type: Type.INTEGER },
                ruralGeneralPercent: { type: Type.INTEGER },
                diasporaSurinKromPercent: { type: Type.INTEGER }
              },
              required: ["phnomPenhUrbanPercent", "battambangWesternPercent", "siemReapAngkorPercent", "ruralGeneralPercent", "diasporaSurinKromPercent"]
            },
            registerAnalysis: {
              type: Type.OBJECT,
              properties: {
                dominantRegister: { type: Type.STRING },
                honorificPolitenessLevel: { type: Type.STRING },
                pronounConsistency: { type: Type.STRING }
              },
              required: ["dominantRegister", "honorificPolitenessLevel", "pronounConsistency"]
            },
            flaggedBiases: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING },
                  severity: { type: Type.STRING },
                  flaggedSnippet: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                  suggestedCorrection: { type: Type.STRING }
                },
                required: ["category", "severity", "flaggedSnippet", "explanation", "suggestedCorrection"]
              }
            },
            debiasedCulturalAlternative: { type: Type.STRING, description: "Culturally natural and dialect-balanced rewrite" }
          },
          required: [
            "culturalScore",
            "biasVerdict",
            "summary",
            "regionalDistribution",
            "registerAnalysis",
            "flaggedBiases",
            "debiasedCulturalAlternative"
          ]
        }
      }
    });

    const parsedData = JSON.parse(response.text || '{}');
    res.json({ success: true, isFallback: false, data: parsedData });
  } catch (err: any) {
    console.error('Error in /api/ai/analyze-language-bias:', err);
    res.json({
      success: true,
      isFallback: true,
      fallbackReason: err.message,
      data: generateLocalBiasReport(req.body.text || '', req.body.language || 'en')
    });
  }
});

// AI analysis and synthetic dataset generation helper
app.post('/api/ai/analyze-khmer', async (req, res) => {
  try {
    const { text, task } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    if (!aiClient) {
      return res.status(503).json({
        error: 'GEMINI_API_KEY is not configured in the environment. Using local algorithmic analysis.'
      });
    }

    let prompt = '';
    if (task === 'linguistic-audit') {
      prompt = `You are a Khmer Computational Linguist and LLM pretraining data engineer.
Analyze the following Khmer text sample for pretraining corpus quality:
Text:
"""${text}"""

Provide a concise JSON response with:
1. "qualityScore": integer 0-100
2. "orthographyIssues": list of strings (spelling, invalid Unicode sequences, missing Coeng, incorrect vowels)
3. "linguisticRegister": string (e.g. Formal/Official, Religious/Monk, Literary, Colloquial, or Machine-Translated/Garbage)
4. "isNativeIdiomatic": boolean
5. "recommendation": string ("Accept into Tier 1", "Clean and Normalize into Tier 3", or "Discard / Spam")
6. "cleanedVersion": string (corrected natural Khmer text)

Respond ONLY with valid JSON.`;
    } else if (task === 'synthetic-instruction') {
      prompt = `You are an expert Khmer LLM post-training curator.
Given the seed domain or topic below, generate 2 high-quality Khmer instruction-response pairs suitable for SFT (Supervised Fine-Tuning) with natural Cambodian phrasing, polite markers, and cultural accuracy:
Topic: """${text}"""

Return a JSON array of objects with keys:
- "instruction_kh": Khmer user prompt
- "response_kh": culturally authentic, helpful Khmer response
- "register": "formal" or "polite_general"
- "english_summary": brief English summary
- "khmer_summary": brief Khmer summary

Respond ONLY with valid JSON.`;
    } else {
      prompt = `You are an expert in Khmer NLP and Large Language Model pretraining.
Answer this technical query concisely:
"""${text}"""`;
    }

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    const outputText = response.text || '';
    
    // Attempt JSON parse if requested
    if (task === 'linguistic-audit' || task === 'synthetic-instruction') {
      try {
        const cleaned = outputText.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        return res.json({ success: true, data: parsed, raw: outputText });
      } catch {
        return res.json({ success: true, data: null, raw: outputText });
      }
    }

    res.json({ success: true, text: outputText });
  } catch (err: any) {
    console.error('Error in /api/ai/analyze-khmer:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// Contact form inquiry endpoint (local validation and submission recording)
app.post('/api/contact', (req, res) => {
  const { name, email, organization, category, preferredLang, message } = req.body || {};

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return res.status(400).json({ error: 'Name is required (minimum 2 characters).' });
  }
  if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return res.status(400).json({ error: 'A valid email address is required.' });
  }
  if (!message || typeof message !== 'string' || message.trim().length < 10) {
    return res.status(400).json({ error: 'Message must be at least 10 characters.' });
  }

  const submission = {
    id: `INQ-${Date.now().toString(36).toUpperCase()}`,
    name: name.trim(),
    email: email.trim(),
    organization: typeof organization === 'string' ? organization.trim() : '',
    category: typeof category === 'string' ? category : 'general',
    preferredLang: typeof preferredLang === 'string' ? preferredLang : 'bilingual',
    message: message.trim(),
    createdAt: new Date().toISOString()
  };

  res.status(201).json({ success: true, submission });
});

async function startServer() {
  const port = process.env.PORT || 3000;
  
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static('dist'));
    app.get('*', (req, res) => {
      res.sendFile('index.html', { root: 'dist' });
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, () => {
    console.log(`Khmer LLM Architect server running on http://localhost:${port}`);
  });
}

startServer();
