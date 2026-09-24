'use client';

import React, { createContext, useContext, useState } from 'react';
import { Language, Translations } from './types';
import { ptTranslations } from './pt-mz';
import { enTranslations } from './en';

interface I18nContextType {
  language: Language;
  t: Translations;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('helpbox_lang') as Language;
      if (saved === 'pt' || saved === 'en') {
        return saved;
      }
    }
    return 'pt';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('helpbox_lang', lang);
    }
  };

  const toggleLanguage = () => {
    const nextLang = language === 'pt' ? 'en' : 'pt';
    setLanguage(nextLang);
  };

  const t = language === 'pt' ? ptTranslations : enTranslations;

  return (
    <I18nContext.Provider value={{ language, t, setLanguage, toggleLanguage }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }
  return context;
}
