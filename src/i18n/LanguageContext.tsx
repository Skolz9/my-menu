import React, { createContext, useContext, useEffect, useState } from 'react';
import { config } from '../config';
import type { Language } from '../menus/types';
import { translations, type TranslationBundle } from './translations';

interface LanguageContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
  t: TranslationBundle;
  dir: 'rtl' | 'ltr';
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: config.defaultLanguage,
  setLang: () => {},
  t: translations[config.defaultLanguage],
  dir: translations[config.defaultLanguage].dir,
});

export const LanguageProvider: React.FC<{
  children: React.ReactNode;
  initialLang?: Language;
}> = ({ children, initialLang }) => {
  const [lang, setLangState] = useState<Language>(() => {
    if (initialLang) return initialLang;
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const qLang = params.get('lang') as Language | null;
      if (qLang && (qLang === 'ar' || qLang === 'fr' || qLang === 'en')) {
        return qLang;
      }
      const saved = window.localStorage.getItem('mymenu_lang') as Language | null;
      if (saved && (saved === 'ar' || saved === 'fr' || saved === 'en')) {
        return saved;
      }
    }
    return config.defaultLanguage;
  });

  const setLang = (nextLang: Language) => {
    setLangState(nextLang);
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem('mymenu_lang', nextLang);
      } catch {
        // Ignore storage errors
      }
    }
  };

  useEffect(() => {
    if (typeof document !== 'undefined') {
      const dir = translations[lang].dir;
      document.documentElement.lang = lang;
      document.documentElement.dir = dir;
    }
  }, [lang]);

  const t = translations[lang];
  const dir = t.dir;

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
};

export function useLanguage() {
  return useContext(LanguageContext);
}
