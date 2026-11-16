import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type Language = 'en' | 'km';

const STORAGE_KEY = 'khmer_llm_lab_lang';

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  isKm: boolean;
  tr: (en: string, km: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const urlLang = params.get('lang');
      if (urlLang === 'km' || urlLang === 'en') {
        return urlLang;
      }
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved === 'km' ? 'km' : 'en';
    } catch {
      return 'en';
    }
  });

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // Ignore storage write errors in restricted iframes
    }
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguageState((prev) => {
      const next = prev === 'en' ? 'km' : 'en';
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // Ignore storage errors
      }
      return next;
    });
  }, []);

  useEffect(() => {
    document.documentElement.lang = language === 'km' ? 'km' : 'en';
    try {
      const url = new URL(window.location.href);
      if (url.searchParams.get('lang') !== language) {
        url.searchParams.set('lang', language);
        window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
      }
    } catch {
      // Ignore history API errors in sandboxed iframes
    }
  }, [language]);

  const tr = useCallback(
    (en: string, km: string) => (language === 'km' ? km : en),
    [language]
  );

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        isKm: language === 'km',
        tr,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return ctx;
}
