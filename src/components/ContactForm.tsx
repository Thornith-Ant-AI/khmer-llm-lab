import React, { useState, useEffect, useMemo } from 'react';
import {
  Mail,
  Send,
  CheckCircle2,
  AlertTriangle,
  Download,
  Trash2,
  Search,
  Building2,
  User,
  MessageSquare,
  FileSpreadsheet,
  Phone,
  Globe,
  ExternalLink,
  Copy,
  Check,
  GraduationCap
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export type InquiryCategory =
  | 'corpus'
  | 'linguistic'
  | 'compute'
  | 'general';

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  organization: string;
  category: InquiryCategory;
  preferredLang: 'km' | 'en' | 'bilingual';
  message: string;
  createdAt: string;
}

const STORAGE_KEY = 'khmer_llm_contact_submissions';

const CATEGORY_OPTIONS: Array<{
  id: InquiryCategory;
  label: string;
  labelKm: string;
}> = [
  { id: 'corpus', label: 'Khmer Corpus Contribution', labelKm: 'ការចូលរួមទិន្នន័យអត្ថបទខ្មែរ' },
  { id: 'linguistic', label: 'Linguistic & Orthography Review', labelKm: 'ការពិនិត្យភាសាវិទ្យា និងអក្ខរាវិរុទ្ធ' },
  { id: 'compute', label: 'GPU Compute & Research Grant', labelKm: 'ធនធាន GPU និងជំនួយស្រាវជ្រាវ' },
  { id: 'general', label: 'General Inquiry', labelKm: 'សំណួរទូទៅ' }
];

export const ContactForm: React.FC = () => {
  const { language, isKm, tr } = useLanguage();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [organization, setOrganization] = useState('');
  const [category, setCategory] = useState<InquiryCategory>('corpus');
  const [preferredLang, setPreferredLang] = useState<'km' | 'en' | 'bilingual'>(
    language === 'km' ? 'km' : 'bilingual'
  );
  const [message, setMessage] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [lastSubmitted, setLastSubmitted] = useState<ContactSubmission | null>(null);

  const [submissions, setSubmissions] = useState<ContactSubmission[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? (JSON.parse(saved) as ContactSubmission[]) : [];
    } catch {
      return [];
    }
  });

  const [searchFilter, setSearchFilter] = useState('');
  const [confirmClear, setConfirmClear] = useState(false);
  const [photoLoadError, setPhotoLoadError] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  const handleCopyPhone = async () => {
    try {
      await navigator.clipboard.writeText('+855 86 945 554');
      setCopiedPhone(true);
      window.setTimeout(() => setCopiedPhone(false), 2000);
    } catch {
      // Ignore clipboard errors in restricted environments
    }
  };

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(submissions));
    } catch {
      // Ignore storage quota errors
    }
  }, [submissions]);

  const getCategoryLabel = (cat: InquiryCategory) => {
    const found = CATEGORY_OPTIONS.find((c) => c.id === cat);
    if (!found) return cat;
    return isKm ? found.labelKm : found.label;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedMessage = message.trim();

    if (trimmedName.length < 2) {
      setFormError(
        tr(
          'Please enter your full name (at least 2 characters).',
          'សូមបញ្ចូលឈ្មោះពេញរបស់អ្នក (យ៉ាងតិច ២ តួអក្សរ)។'
        )
      );
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setFormError(
        tr(
          'Please enter a valid email address.',
          'សូមបញ្ចូលអាសយដ្ឋានអ៊ីមែលឱ្យបានត្រឹមត្រូវ។'
        )
      );
      return;
    }

    if (trimmedMessage.length < 10) {
      setFormError(
        tr(
          'Please provide a message of at least 10 characters describing your inquiry.',
          'សូមសរសេរសារយ៉ាងតិច ១០ តួអក្សរដើម្បីបញ្ជាក់ពីសំណួររបស់អ្នក។'
        )
      );
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: trimmedName,
          email: trimmedEmail,
          organization: organization.trim(),
          category,
          preferredLang,
          message: trimmedMessage
        })
      });

      let created: ContactSubmission;
      if (response.ok) {
        const result = await response.json();
        created = result.submission;
      } else {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || tr('Failed to submit inquiry.', 'មិនអាចបញ្ជូនសំណួរបានទេ។'));
      }

      setSubmissions((prev) => [created, ...prev]);
      setLastSubmitted(created);
      setName('');
      setEmail('');
      setOrganization('');
      setMessage('');
    } catch (err: any) {
      setFormError(
        err?.message ||
          tr(
            'Unable to reach the server right now. Please try again.',
            'មិនអាចភ្ជាប់ទៅកាន់ម៉ាស៊ីនមេបានទេនៅពេលនេះ។ សូមព្យាយាមម្តងទៀត។'
          )
      );
    } finally {
      setSubmitting(false);
    }
  };

  const filteredSubmissions = useMemo(() => {
    const q = searchFilter.trim().toLowerCase();
    if (!q) return submissions;
    return submissions.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.email.toLowerCase().includes(q) ||
        item.organization.toLowerCase().includes(q) ||
        item.message.toLowerCase().includes(q) ||
        getCategoryLabel(item.category).toLowerCase().includes(q)
    );
  }, [submissions, searchFilter, isKm]);

  const handleExportCsv = () => {
    if (submissions.length === 0) return;

    const escapeCsv = (val: string) => `"${(val || '').replace(/"/g, '""')}"`;
    const headers = [
      'Reference ID',
      'Submitted At',
      'Full Name',
      'Email',
      'Organization',
      'Category',
      'Preferred Language',
      'Message'
    ];
    const rows = submissions.map((s) =>
      [
        escapeCsv(s.id),
        escapeCsv(s.createdAt),
        escapeCsv(s.name),
        escapeCsv(s.email),
        escapeCsv(s.organization),
        escapeCsv(getCategoryLabel(s.category)),
        escapeCsv(s.preferredLang),
        escapeCsv(s.message)
      ].join(',')
    );

    // UTF-8 BOM ensures Khmer Unicode displays cleanly in spreadsheet apps
    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'khmer-llm-contact-submissions.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleClearLog = () => {
    setSubmissions([]);
    setLastSubmitted(null);
    setConfirmClear(false);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div
          className={`inline-flex items-center gap-2 text-xs font-semibold text-amber-400 tracking-wider ${
            isKm ? 'font-khmer' : 'uppercase font-mono'
          }`}
        >
          <Mail className="w-3.5 h-3.5" />
          <span>{tr('RESEARCH COLLABORATION & SUPPORT', 'កិច្ចសហប្រតិបត្តិការស្រាវជ្រាវ និងការគាំទ្រ')}</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span>{tr('DIRECT INQUIRY DESK', 'ការិយាល័យទទួលសំណួរដោយផ្ទាល់')}</span>
        </div>
        <h2
          className={`text-2xl sm:text-3xl font-bold text-white tracking-tight text-balance ${
            isKm ? 'font-khmer' : ''
          }`}
        >
          {tr('Contact the Khmer LLM Engineering Team', 'ទាក់ទងក្រុមវិស្វកម្ម Khmer LLM')}
        </h2>
        <p className={`text-sm text-slate-300 max-w-3xl leading-relaxed ${isKm ? 'font-khmer' : ''}`}>
          {tr(
            'Submit corpus contributions, request Royal Academy orthographic reviews, or inquire about compute collaboration. Saved inquiries can be exported anytime as a UTF-8 CSV file.',
            'ផ្ញើសំណើចូលរួមទិន្នន័យអត្ថបទខ្មែរ ស្នើសុំការត្រួតពិនិត្យអក្ខរាវិរុទ្ធ ឬសាកសួរអំពីកិច្ចសហប្រតិបត្តិការស្រាវជ្រាវ។ អ្នកអាចទាញយកបញ្ជីសំណួរជាឯកសារ CSV (UTF-8) បានគ្រប់ពេល។'
          )}
        </p>
      </div>

      {/* Research By Section */}
      <section
        aria-labelledby="research-by-heading"
        className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50"
      >
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          {/* Researcher LinkedIn Portrait with Graceful Fallback */}
          <div className="shrink-0">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl border border-slate-700/80 bg-slate-950 overflow-hidden flex items-center justify-center">
              {!photoLoadError ? (
                <img
                  src="/api/researcher-photo"
                  alt="Mr. HUON THORNITH — Researcher Portrait"
                  referrerPolicy="no-referrer"
                  onError={() => setPhotoLoadError(true)}
                  className="w-full h-full object-cover object-top"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-950 to-amber-950/40 flex flex-col items-center justify-center gap-1 text-center p-2">
                  <span className="text-xl font-bold tracking-wider text-amber-400 font-mono">HT</span>
                  <span className="text-[10px] text-slate-400 font-mono">LinkedIn</span>
                </div>
              )}
            </div>
          </div>

          {/* Researcher Bio & Direct Contact Channels */}
          <div className="flex-1 min-w-0 space-y-3">
            <div className="space-y-1">
              <div
                className={`flex flex-wrap items-center gap-2 text-xs font-semibold text-amber-400 ${
                  isKm ? 'font-khmer' : 'font-mono uppercase tracking-wider'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5 shrink-0" />
                <span>{tr('RESEARCH BY', 'ស្រាវជ្រាវដោយ')}</span>
                <span aria-hidden="true" className="text-slate-600">
                  ·
                </span>
                <span className="text-slate-400 normal-case font-normal">
                  {tr('Principal Researcher & Systems Architect', 'អ្នកស្រាវជ្រាវចម្បង និងស្ថាបត្យករប្រព័ន្ធ')}
                </span>
              </div>

              <h3
                id="research-by-heading"
                className="text-xl sm:text-2xl font-bold text-white tracking-tight"
              >
                Mr. HUON THORNITH
              </h3>

              <p className={`text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl ${isKm ? 'font-khmer' : ''}`}>
                {tr(
                  'Khmer NLP & Large Language Model pretraining research lead focusing on Unicode script integrity, syllable-aware tokenization, and sovereign Cambodian AI compute engineering.',
                  'អ្នកដឹកនាំការស្រាវជ្រាវ Khmer NLP និងការបណ្តុះបណ្តាលម៉ូដែលភាសាធំ (LLM) ដោយផ្តោតលើស្តង់ដារ Unicode ខ្មែរ ការបំបែកព្យាង្គ និងវិស្វកម្មហេដ្ឋារចនាសម្ព័ន្ធ AI សម្រាប់កម្ពុជា។'
                )}
              </p>
            </div>

            {/* Direct Contact Channels Row */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <div className="inline-flex items-center rounded-xl bg-slate-950 border border-slate-800 overflow-hidden">
                <a
                  href="tel:+85586945554"
                  className="px-3 py-2 text-xs font-mono tabular-nums text-slate-200 hover:text-amber-300 transition-colors flex items-center gap-2 whitespace-nowrap shrink-0"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>+855 86 945 554</span>
                </a>
                <button
                  type="button"
                  onClick={handleCopyPhone}
                  aria-label={tr('Copy researcher phone number', 'ចម្លងលេខទូរស័ព្ទអ្នកស្រាវជ្រាវ')}
                  className="px-2.5 py-2 border-l border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900 transition-colors shrink-0"
                >
                  {copiedPhone ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              <a
                href="https://www.linkedin.com/in/thornithhuon"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-sky-500/50 text-xs font-mono text-slate-200 hover:text-sky-300 transition-colors flex items-center gap-2 whitespace-nowrap shrink-0"
              >
                <span className="font-bold text-sky-400">in</span>
                <span>LinkedIn</span>
                <ExternalLink className="w-3 h-3 text-slate-500 shrink-0" />
              </a>

              <a
                href="https://t.me/thornithhuon"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/50 text-xs font-mono text-slate-200 hover:text-cyan-300 transition-colors flex items-center gap-2 whitespace-nowrap shrink-0"
              >
                <Send className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>Telegram (@thornithhuon)</span>
                <ExternalLink className="w-3 h-3 text-slate-500 shrink-0" />
              </a>

              <a
                href="https://thornith.com"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-400/50 text-xs font-mono text-slate-200 hover:text-amber-300 transition-colors flex items-center gap-2 whitespace-nowrap shrink-0"
              >
                <Globe className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>thornith.com</span>
                <ExternalLink className="w-3 h-3 text-slate-500 shrink-0" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Main 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Contact Form */}
        <form
          onSubmit={handleSubmit}
          noValidate
          className="lg:col-span-7 p-6 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-5"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Name */}
            <div className="space-y-1.5">
              <label
                htmlFor="contact-name"
                className={`flex items-center gap-1.5 text-xs font-medium text-slate-300 ${
                  isKm ? 'font-khmer' : ''
                }`}
              >
                <User className="w-3.5 h-3.5 text-amber-400" />
                <span>{tr('Full Name *', 'ឈ្មោះពេញ *')}</span>
              </label>
              <input
                id="contact-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={tr('e.g. Sokha Chan', 'ឧ. ចាន់ សុខា')}
                className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400 transition-colors ${
                  isKm ? 'font-khmer' : ''
                }`}
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label
                htmlFor="contact-email"
                className={`flex items-center gap-1.5 text-xs font-medium text-slate-300 ${
                  isKm ? 'font-khmer' : ''
                }`}
              >
                <Mail className="w-3.5 h-3.5 text-amber-400" />
                <span>{tr('Email Address *', 'អាសយដ្ឋានអ៊ីមែល *')}</span>
              </label>
              <input
                id="contact-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@institution.edu.kh"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Organization */}
            <div className="space-y-1.5">
              <label
                htmlFor="contact-org"
                className={`flex items-center gap-1.5 text-xs font-medium text-slate-300 ${
                  isKm ? 'font-khmer' : ''
                }`}
              >
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span>{tr('Organization / University', 'ស្ថាប័ន / សាកលវិទ្យាល័យ')}</span>
              </label>
              <input
                id="contact-org"
                type="text"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                placeholder={tr('Optional (e.g. CADT, RUPP, RAC)', 'ស្រេចចិត្ត (ឧ. CADT, RUPP, RAC)')}
                className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400 transition-colors ${
                  isKm ? 'font-khmer' : ''
                }`}
              />
            </div>

            {/* Inquiry Category */}
            <div className="space-y-1.5">
              <label
                htmlFor="contact-category"
                className={`block text-xs font-medium text-slate-300 ${isKm ? 'font-khmer' : ''}`}
              >
                {tr('Inquiry Topic', 'ប្រធានបទសំណួរ')}
              </label>
              <select
                id="contact-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as InquiryCategory)}
                className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-amber-400 cursor-pointer ${
                  isKm ? 'font-khmer' : ''
                }`}
              >
                {CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {isKm ? opt.labelKm : opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Preferred Response Language */}
          <div className="space-y-1.5">
            <span className={`block text-xs font-medium text-slate-300 ${isKm ? 'font-khmer' : ''}`}>
              {tr('Preferred Response Language', 'ភាសាដែលចង់ទទួលការឆ្លើយតប')}
            </span>
            <div className="inline-flex flex-wrap gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800">
              {(
                [
                  { id: 'km', label: tr('Khmer (ខ្មែរ)', 'ភាសាខ្មែរ') },
                  { id: 'en', label: tr('English', 'ភាសាអង់គ្លេស') },
                  { id: 'bilingual', label: tr('Bilingual (EN / ខ្មែរ)', 'ទ្វេភាសា (អង់គ្លេស / ខ្មែរ)') }
                ] as const
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setPreferredLang(opt.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                    isKm ? 'font-khmer' : ''
                  } ${
                    preferredLang === opt.id
                      ? 'bg-amber-400 text-slate-950 font-semibold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Message */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="contact-message"
                className={`flex items-center gap-1.5 text-xs font-medium text-slate-300 ${
                  isKm ? 'font-khmer' : ''
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                <span>{tr('Message / Details *', 'ខ្លឹមសារសារ / ព័ត៌មានលម្អិត *')}</span>
              </label>
              <span className="text-[11px] font-mono tabular-nums text-slate-500">
                {message.length} {tr('chars', 'តួអក្សរ')}
              </span>
            </div>
            <textarea
              id="contact-message"
              rows={5}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={tr(
                'Share details about your Khmer dataset, orthographic inquiry, or research proposal...',
                'សូមរៀបរាប់លម្អិតអំពីទិន្នន័យអត្ថបទខ្មែរ សំណួរអក្ខរាវិរុទ្ធ ឬគម្រោងស្រាវជ្រាវរបស់អ្នក...'
              )}
              className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white font-khmer placeholder:text-slate-500 focus:outline-none focus:border-amber-400 transition-colors leading-relaxed"
            />
          </div>

          {/* Validation Error Banner */}
          {formError && (
            <div
              role="alert"
              className={`p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-200 flex items-center gap-2 ${
                isKm ? 'font-khmer' : ''
              }`}
            >
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Success Confirmation Banner */}
          {lastSubmitted && !formError && (
            <div
              role="status"
              className={`p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-xs text-emerald-200 flex items-start gap-2.5 ${
                isKm ? 'font-khmer' : ''
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <div className="font-semibold text-emerald-300">
                  {tr('Inquiry recorded successfully', 'បានកត់ត្រាសំណួររបស់អ្នកដោយជោគជ័យ')}
                </div>
                <div className="text-emerald-200/80">
                  {tr('Reference ID:', 'លេខយោង៖')}{' '}
                  <span className="font-mono text-white">{lastSubmitted.id}</span>
                </div>
              </div>
            </div>
          )}

          {/* Submit Action */}
          <div className="flex items-center justify-end pt-1">
            <button
              type="submit"
              disabled={submitting}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-400 text-slate-950 hover:bg-amber-300 transition-colors disabled:opacity-50 cursor-pointer whitespace-nowrap shrink-0 ${
                isKm ? 'font-khmer' : ''
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>
                {submitting
                  ? tr('Sending...', 'កំពុងផ្ញើ...')
                  : tr('Submit Inquiry', 'បញ្ជូនសំណួរ')}
              </span>
            </button>
          </div>
        </form>

        {/* Right Column: Saved Submissions Log & UTF-8 CSV Export */}
        <div className="lg:col-span-5 p-6 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-4">
          <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-800">
            <div className="space-y-0.5">
              <h3 className={`text-sm font-bold text-white ${isKm ? 'font-khmer' : ''}`}>
                {tr('Submission Ledger', 'បញ្ជីកត់ត្រាសំណួរ')}
              </h3>
              <p className={`text-xs text-slate-400 ${isKm ? 'font-khmer' : ''}`}>
                <span className="font-mono tabular-nums text-amber-400 font-semibold">
                  {submissions.length}
                </span>{' '}
                {tr('entries saved locally', 'សំណួរត្រូវបានរក្សាទុក')}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleExportCsv}
                disabled={submissions.length === 0}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-950 border border-slate-800 text-slate-200 hover:border-amber-400/50 hover:text-amber-300 disabled:opacity-40 disabled:pointer-events-none transition-colors whitespace-nowrap ${
                  isKm ? 'font-khmer' : ''
                }`}
              >
                <Download className="w-3.5 h-3.5" />
                <span>{tr('Export CSV', 'ទាញយក CSV')}</span>
              </button>

              {submissions.length > 0 && !confirmClear && (
                <button
                  type="button"
                  onClick={() => setConfirmClear(true)}
                  aria-label={tr('Clear submission history', 'សម្អាតបញ្ជីសំណួរ')}
                  className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-800 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Inline Confirmation for Clear Log */}
          {confirmClear && (
            <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-800/60 flex items-center justify-between gap-2 text-xs">
              <span className={`text-rose-200 ${isKm ? 'font-khmer' : ''}`}>
                {tr('Clear all saved entries?', 'លុបទិន្នន័យសំណួរទាំងអស់?')}
              </span>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setConfirmClear(false)}
                  className="px-2.5 py-1 rounded-md bg-slate-900 text-slate-300 hover:text-white"
                >
                  {tr('Cancel', 'បោះបង់')}
                </button>
                <button
                  type="button"
                  onClick={handleClearLog}
                  className="px-2.5 py-1 rounded-md bg-rose-600 text-white font-semibold hover:bg-rose-500"
                >
                  {tr('Confirm', 'បញ្ជាក់')}
                </button>
              </div>
            </div>
          )}

          {/* Filter Input when submissions exist */}
          {submissions.length > 0 && (
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder={tr('Filter submissions...', 'ស្វែងរកក្នុងបញ្ជីសំណួរ...')}
                className={`w-full pl-8 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400 ${
                  isKm ? 'font-khmer' : ''
                }`}
              />
            </div>
          )}

          {/* Submissions List or Empty State */}
          {submissions.length === 0 ? (
            <div className="py-10 px-4 text-center space-y-2.5">
              <FileSpreadsheet className="w-8 h-8 text-slate-600 mx-auto" />
              <h4 className={`text-sm font-semibold text-white ${isKm ? 'font-khmer' : ''}`}>
                {tr('No inquiries recorded yet', 'មិនទាន់មានសំណួរត្រូវបានកត់ត្រាទេ')}
              </h4>
              <p className={`text-xs text-slate-400 leading-relaxed ${isKm ? 'font-khmer' : ''}`}>
                {tr(
                  'Submitted contact entries will appear here and can be downloaded as a UTF-8 spreadsheet CSV at any time.',
                  'សំណួរដែលបានបញ្ជូននឹងបង្ហាញនៅទីនេះ ហើយអ្នកអាចទាញយកជាឯកសារតារាង CSV (UTF-8) បានគ្រប់ពេល។'
                )}
              </p>
            </div>
          ) : filteredSubmissions.length === 0 ? (
            <div className={`py-8 text-center text-xs text-slate-400 ${isKm ? 'font-khmer' : ''}`}>
              {tr('No submissions match your filter.', 'គ្មានសំណួរណាត្រូវនឹងការស្វែងរកទេ។')}
            </div>
          ) : (
            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
              {filteredSubmissions.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className={`font-semibold text-white truncate ${isKm ? 'font-khmer' : ''}`}>
                        {item.name}
                      </div>
                      <div className="text-[11px] font-mono text-slate-400 truncate">
                        {item.email}
                        {item.organization ? ` · ${item.organization}` : ''}
                      </div>
                    </div>
                    <span className="text-[10px] font-mono tabular-nums text-slate-500 shrink-0">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className={`text-[11px] text-amber-400 font-medium ${isKm ? 'font-khmer' : ''}`}>
                    {getCategoryLabel(item.category)}
                  </div>

                  <p className="text-slate-300 font-khmer leading-relaxed whitespace-pre-line">
                    {item.message}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
