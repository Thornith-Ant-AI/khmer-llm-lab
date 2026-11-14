import React, { useState } from 'react';
import { X, Copy, Check, Download, FileText } from 'lucide-react';
import { KHMER_RESOURCES, KHMER_CLEANING_RULES } from '../data/khmerResources';
import { useLanguage } from '../contexts/LanguageContext';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
  const { isKm, tr } = useLanguage();
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const generateMarkdownReport = () => {
    const today = new Date().toISOString().split('T')[0];

    if (isKm) {
      return `# គម្រោងប្លង់មេសម្រាប់ការបង្វឹកម៉ូដែលភាសាធំភាសាខ្មែរ (Khmer Foundation LLM)
កាលបរិច្ឆេទបង្កើត៖ ${today}

## ១. សង្ខេបស្ថាបត្យកម្មប្រតិបត្តិ
- **ទំហំគោលដៅ៖** 1.5B - 3.0B ប៉ារ៉ាម៉ែត្រ (សមាមាត្រគណនាល្អបំផុតសម្រាប់ការដាក់ឱ្យប្រើប្រាស់ថ្នាក់ជាតិ)
- **គោលដៅថូខិន៖** 30 ពាន់លាន - 50 ពាន់លានថូខិន (ខ្មែរ ៦០% + អង់គ្លេស/គណិតវិទ្យា/កូដ ៤០%)
- **ថូខិនណាយស័រ៖** SentencePiece BPE ផ្ទាល់ខ្លួន (វាក្យសព្ទ 32,000, character_coverage=0.9995, byte_fallback=True)
- **ស្ថាបត្យកម្ម៖** Grouped-Query Attention (GQA 4:1), RoPE (theta=500,000), SwiGLU, RMSNorm
- **ចង្កោមគណនា៖** 16x NVIDIA H100 80GB SXM5 (ការបង្វឹកប្រហែល ៥ ទៅ ៧ ថ្ងៃ)

## ២. ឋានានុក្រមទិន្នន័យបង្វឹកអាទិភាពខ្ពស់
${KHMER_RESOURCES.map(r => `### ${r.tier.toUpperCase()} - ${r.nameKhmer}
- អង់គ្លេស៖ ${r.nameEnglish}
- ថូខិនប៉ាន់ស្មាន៖ ${r.estimatedTokens} (ពិន្ទុគុណភាព៖ ${r.qualityScore}/100)
- អាជ្ញាប័ណ្ណ៖ ${r.licenseKm || r.license}
- យុទ្ធសាស្ត្រ៖ ${r.descriptionKm || r.description}
- ជំហានចម្រោះទិន្នន័យ៖
${(r.curationStepsKm || r.curationSteps).map(s => `  * ${s}`).join('\n')}
`).join('\n')}

## ៣. វិធានសម្អាត និងកម្ចាត់ទិន្នន័យកខ្វក់ជាចាំបាច់
${KHMER_CLEANING_RULES.map(c => `### ${c.titleKm || c.title} (${c.category})
- ហានិភ័យបើមើលរំលង៖ ${c.impactIfIgnoredKm || c.impactIfIgnored}
- តម្រង / Regex៖ ${c.regexOrToolKm || c.regexOrTool}
`).join('\n')}

## ៤. ស្គ្រីបបង្វឹកថូខិនណាយស័រ SentencePiece
\`\`\`python
import sentencepiece as spm
spm.SentencePieceTrainer.train(
    input='khmer_cleaned_corpus.txt,seed_english_code.txt',
    model_prefix='khmer_spm_32k',
    vocab_size=32000,
    model_type='bpe',
    character_coverage=0.9995,
    byte_fallback=True,
    split_digits=True,
    normalization_rule_name='nmt_nfkc'
)
\`\`\`
`;
    }

    return `# Khmer Large Language Model (Foundation LLM) Pretraining Blueprint
Generated on: ${today}

## 1. Executive Architecture Summary
- **Target Scale:** 1.5B - 3.0B Parameters (Compute-optimal for Khmer nation-state deployment)
- **Token Target:** 30 Billion - 50 Billion Tokens (60% Khmer + 40% English/Math/Code)
- **Tokenizer:** Custom SentencePiece BPE (32,000 vocab, character_coverage=0.9995, byte_fallback=True)
- **Architecture:** Grouped-Query Attention (GQA 4:1), RoPE (theta=500,000), SwiGLU, RMSNorm
- **Cluster Compute:** 16x NVIDIA H100 80GB SXM5 (~5 to 7 days training)

## 2. High-Priority Training Data Hierarchy
${KHMER_RESOURCES.map(r => `### ${r.tier.toUpperCase()} - ${r.nameEnglish}
- Khmer: ${r.nameKhmer}
- Tokens: ${r.estimatedTokens} (Quality: ${r.qualityScore}/100)
- License: ${r.license}
- Strategy: ${r.description}
- Steps:
${r.curationSteps.map(s => `  * ${s}`).join('\n')}
`).join('\n')}

## 3. Mandatory Cleaning & Decontamination Rules
${KHMER_CLEANING_RULES.map(c => `### ${c.title} (${c.category})
- Danger: ${c.impactIfIgnored}
- Filter / Regex: ${c.regexOrTool}
`).join('\n')}

## 4. SentencePiece Tokenizer Training Script
\`\`\`python
import sentencepiece as spm
spm.SentencePieceTrainer.train(
    input='khmer_cleaned_corpus.txt,seed_english_code.txt',
    model_prefix='khmer_spm_32k',
    vocab_size=32000,
    model_type='bpe',
    character_coverage=0.9995,
    byte_fallback=True,
    split_digits=True,
    normalization_rule_name='nmt_nfkc'
)
\`\`\`
`;
  };

  const markdownContent = generateMarkdownReport();

  const handleCopy = () => {
    navigator.clipboard.writeText(markdownContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `khmer_llm_pretraining_blueprint_${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-3xl rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-400" />
            <h3 className="text-base font-bold text-white">
              {tr('Export Khmer LLM Technical Specification', 'នាំចេញលក្ខណៈបច្ចេកទេស Khmer LLM')}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body: Markdown Preview */}
        <div className="p-5 overflow-y-auto flex-1 font-mono text-xs text-slate-300 bg-slate-950/80 leading-relaxed border-b border-slate-800">
          <pre className="whitespace-pre-wrap">{markdownContent}</pre>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 flex flex-wrap items-center justify-between gap-3 bg-slate-900">
          <span className="text-xs text-slate-400">
            {tr(
              'Markdown document ready for data engineering teams & grant proposals.',
              'ឯកសារ Markdown រួចរាល់សម្រាប់ក្រុមវិស្វកម្មទិន្នន័យ និងសំណើគម្រោងស្រាវជ្រាវ។'
            )}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? tr('Copied', 'បានចម្លង') : tr('Copy Markdown', 'ចម្លង Markdown')}</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors font-semibold"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{tr('Download .MD File', 'ទាញយកឯកសារ .MD')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
