import React, { useMemo, useState } from 'react';
import {
  X,
  Copy,
  Check,
  Share2,
  ExternalLink,
  Globe,
  Image as ImageIcon,
  MessageCircle,
  Sparkles,
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { resolveSeoCopy, SeoLanguage } from '../data/seoMetadata';

interface SharePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
}

type SocialPlatform = 'facebook' | 'linkedin' | 'telegram' | 'x';
type ShareScope = 'home' | 'section';

export const SharePreviewModal: React.FC<SharePreviewModalProps> = ({
  isOpen,
  onClose,
  activeTab,
}) => {
  const { language, tr } = useLanguage();
  const [platform, setPlatform] = useState<SocialPlatform>('facebook');
  const [scope, setScope] = useState<ShareScope>('home');
  const [previewLang, setPreviewLang] = useState<SeoLanguage>(language);
  const [copied, setCopied] = useState<boolean>(false);

  const shareDetails = useMemo(() => {
    const origin =
      typeof window !== 'undefined' ? window.location.origin : 'https://khmer-llm-lab.app';
    const hostname =
      typeof window !== 'undefined' ? window.location.host : 'khmer-llm-lab.app';

    const seo = resolveSeoCopy(
      previewLang,
      scope === 'section' ? activeTab : null
    );

    let shareUrl = `${origin}/`;
    if (scope === 'section' && seo.resolvedSectionId) {
      shareUrl = `${origin}/?section=${encodeURIComponent(seo.resolvedSectionId)}&lang=${previewLang}`;
    } else if (previewLang === 'km') {
      shareUrl = `${origin}/?lang=km`;
    }

    const ogImageUrl = `${origin}/og-khmer-llm.jpg`;

    return {
      origin,
      hostname,
      shareUrl,
      ogImageUrl,
      seo,
    };
  }, [activeTab, previewLang, scope]);

  if (!isOpen) return null;

  const { hostname, shareUrl, seo } = shareDetails;

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedText = encodeURIComponent(`${seo.title} — ${seo.description}`);

  const platformShareLinks: Array<{
    id: SocialPlatform;
    label: string;
    href: string;
  }> = [
    {
      id: 'facebook',
      label: 'Facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      id: 'linkedin',
      label: 'LinkedIn',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
    {
      id: 'telegram',
      label: 'Telegram',
      href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
    },
    {
      id: 'x',
      label: 'X / Twitter',
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`,
    },
  ];

  const platforms: Array<{ id: SocialPlatform; label: string }> = [
    { id: 'facebook', label: 'Facebook' },
    { id: 'linkedin', label: 'LinkedIn' },
    { id: 'telegram', label: 'Telegram' },
    { id: 'x', label: 'X / Twitter' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="social-share-modal-title"
    >
      <div className="w-full max-w-4xl rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h2
                id="social-share-modal-title"
                className="text-base font-bold text-white"
              >
                {tr(
                  'Social Media Share & Feature Preview',
                  'មើលទម្រង់ចែករំលែកលើបណ្តាញសង្គម'
                )}
              </h2>
              <p className="text-xs text-slate-400">
                {tr(
                  'OpenGraph 1200×630 home screen preview verified for Facebook, LinkedIn, Telegram & X crawlers',
                  'កាតបង្ហាញទំព័រដើម 1200×630 សម្រាប់ Facebook, LinkedIn, Telegram និង X'
                )}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={tr('Close modal', 'បិទ')}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 bg-slate-950/50">
          {/* Controls Strip */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Scope selector */}
            <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                {tr('Share Destination', 'គោលដៅតំណចែករំលែក')}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setScope('home')}
                  className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap ${
                    scope === 'home'
                      ? 'bg-amber-400 text-slate-950 border-amber-400 font-semibold'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {tr('Home Screen Preview', 'ទំព័រដើម (លំនាំដើម)')}
                </button>
                <button
                  type="button"
                  onClick={() => setScope('section')}
                  className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap ${
                    scope === 'section'
                      ? 'bg-amber-400 text-slate-950 border-amber-400 font-semibold'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {tr('Active Module Deep Link', 'ផ្នែកកំពុងបើកបច្ចុប្បន្ន')}
                </button>
              </div>
            </div>

            {/* Card language selector */}
            <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                {tr('Social Card Metadata Language', 'ភាសាកាតបង្ហាញលើបណ្តាញសង្គម')}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewLang('en')}
                  className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap ${
                    previewLang === 'en'
                      ? 'bg-amber-400 text-slate-950 border-amber-400 font-semibold'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  English (en_US)
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewLang('km')}
                  className={`flex-1 px-3 py-1.5 text-xs font-medium font-khmer rounded-lg border transition-colors whitespace-nowrap ${
                    previewLang === 'km'
                      ? 'bg-amber-400 text-slate-950 border-amber-400 font-semibold'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  ភាសាខ្មែរ (km_KH)
                </button>
              </div>
            </div>
          </div>

          {/* Copy Link Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2 rounded-xl border border-slate-800 bg-slate-900">
            <div className="flex items-center gap-2 px-2.5 py-1.5 flex-1 min-w-0">
              <Globe className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                readOnly
                value={shareUrl}
                aria-label={tr('Shareable URL', 'តំណសម្រាប់ចែករំលែក')}
                className="w-full bg-transparent text-xs font-mono text-slate-200 focus:outline-none truncate"
              />
            </div>
            <button
              type="button"
              onClick={handleCopyUrl}
              className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              <span>
                {copied
                  ? tr('Link Copied', 'បានចម្លងតំណ')
                  : tr('Copy Share URL', 'ចម្លងតំណ')}
              </span>
            </button>
          </div>

          {/* Platform Preview Switcher */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-300">
                {tr(
                  'Live Crawler Card Simulation',
                  'ការបង្ហាញទម្រង់កាតពិតលើកម្មវិធី'
                )}
              </span>
              <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-900 border border-slate-800 overflow-x-auto">
                {platforms.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setPlatform(item.id)}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                      platform === item.id
                        ? 'bg-amber-400 text-slate-950 font-semibold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Platform-Specific Preview Frame */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 flex justify-center">
              {platform === 'facebook' && (
                <div className="w-full max-w-lg rounded-lg border border-slate-700/80 bg-[#18191a] overflow-hidden shadow-xl">
                  <div className="px-3.5 py-2.5 flex items-center gap-2.5 border-b border-slate-800/80">
                    <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold text-sm font-khmer">
                      ខ
                    </div>
                    <div className="text-xs">
                      <div className="font-semibold text-slate-100">Khmer LLM Lab</div>
                      <div className="text-[11px] text-slate-400">
                        {tr('Facebook Link Post Preview', 'ទម្រង់បង្ហោះតំណ Facebook')}
                      </div>
                    </div>
                  </div>
                  <div className="aspect-[1200/630] bg-slate-950 overflow-hidden">
                    <img
                      src="/og-khmer-llm.jpg"
                      alt={seo.imageAlt}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-3.5 bg-[#242526] border-t border-slate-800 space-y-1">
                    <div className="text-[11px] uppercase tracking-wide text-slate-400 truncate">
                      {hostname}
                    </div>
                    <div className="text-sm font-bold text-slate-100 leading-snug">
                      {seo.title}
                    </div>
                    <div className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {seo.description}
                    </div>
                  </div>
                </div>
              )}

              {platform === 'linkedin' && (
                <div className="w-full max-w-lg rounded-lg border border-slate-700/80 bg-[#1b1f23] overflow-hidden shadow-xl">
                  <div className="px-4 py-2.5 flex items-center justify-between border-b border-slate-800">
                    <span className="text-xs font-semibold text-slate-200">
                      LinkedIn Feed Article Card
                    </span>
                    <span className="text-[11px] text-slate-400">1.91:1 Rich Card</span>
                  </div>
                  <div className="aspect-[1200/630] bg-slate-950 overflow-hidden">
                    <img
                      src="/og-khmer-llm.jpg"
                      alt={seo.imageAlt}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-3.5 bg-[#252a30] space-y-1">
                    <div className="text-sm font-semibold text-white leading-snug">
                      {seo.title}
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                      <span>{hostname}</span>
                      <span aria-hidden="true">·</span>
                      <span>{seo.siteName}</span>
                    </div>
                  </div>
                </div>
              )}

              {platform === 'telegram' && (
                <div className="w-full max-w-lg rounded-2xl bg-[#182533] border border-sky-900/40 p-4 space-y-2.5 shadow-xl">
                  <div className="flex items-center gap-2 text-xs text-sky-300 font-mono">
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span className="truncate underline">{shareUrl}</span>
                  </div>
                  <div className="pl-3 border-l-2 border-sky-400 space-y-2">
                    <div className="text-[11px] font-semibold text-sky-400">
                      {seo.siteName}
                    </div>
                    <div className="text-sm font-bold text-white leading-snug">
                      {seo.title}
                    </div>
                    <div className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                      {seo.description}
                    </div>
                    <div className="rounded-lg overflow-hidden border border-slate-700/60 aspect-[1200/630] bg-slate-950">
                      <img
                        src="/og-khmer-llm.jpg"
                        alt={seo.imageAlt}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              )}

              {platform === 'x' && (
                <div className="w-full max-w-lg space-y-2">
                  <div className="relative rounded-2xl overflow-hidden border border-slate-700/80 aspect-[1200/630] bg-slate-950 shadow-xl">
                    <img
                      src="/og-khmer-llm.jpg"
                      alt={seo.imageAlt}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded bg-slate-950/85 border border-slate-700 text-[11px] font-medium text-white">
                      {seo.title}
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5 px-1">
                    <span>From {hostname}</span>
                    <span aria-hidden="true">·</span>
                    <span>twitter:card=summary_large_image</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* OpenGraph Technical Inspector */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                {tr(
                  'Server-Rendered Crawler Meta Tags',
                  'ស្លាក OpenGraph បញ្ជូនផ្ទាល់ពីម៉ាស៊ីនមេ'
                )}
              </span>
              <span className="text-[11px] text-emerald-400 font-mono tabular-nums flex items-center gap-1">
                <ImageIcon className="w-3.5 h-3.5" />
                og:image 1200×630 JPEG
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono text-slate-400">
              <div className="truncate">
                <span className="text-slate-500">og:locale:</span>{' '}
                <span className="text-slate-200">
                  {previewLang === 'km' ? 'km_KH' : 'en_US'}
                </span>
              </div>
              <div className="truncate">
                <span className="text-slate-500">twitter:card:</span>{' '}
                <span className="text-slate-200">summary_large_image</span>
              </div>
              <div className="truncate sm:col-span-2">
                <span className="text-slate-500">og:url:</span>{' '}
                <span className="text-amber-300">{shareUrl}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Share Intents */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-slate-400">
            {tr('Share directly on:', 'ចែករំលែកផ្ទាល់ទៅកាន់៖')}
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {platformShareLinks.map((target) => (
              <a
                key={target.id}
                href={target.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors whitespace-nowrap"
              >
                <span>{target.label}</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
