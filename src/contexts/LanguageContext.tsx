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
    document.title =
      language === 'km'
        ? 'មន្ទីរពិសោធន៍វិស្វកម្ម Khmer LLM — ស្ទូឌីយោបង្វឹកភាសាខ្មែរ'
        : 'Khmer LLM Lab — Language Engineering & Pretraining Studio';
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
