/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { translations, type Language, type TranslationKey } from './i18n/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);
const LANGUAGE_STORAGE_KEY = 'portfolio_lang';

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window === 'undefined') {
      return 'zh';
    }
    const fromStorage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return fromStorage === 'en' || fromStorage === 'zh' ? fromStorage : 'zh';
  });

  const value = useMemo<LanguageContextType>(() => {
    const toggleLanguage = () => {
      setLanguage((prev) => (prev === 'en' ? 'zh' : 'en'));
    };

    const t = (key: TranslationKey): string => {
      const entry = translations[key];
      if (!entry) {
        return key;
      }
      return entry[language];
    };

    return {
      language,
      setLanguage,
      toggleLanguage,
      t,
    };
  }, [language]);

  React.useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }
    document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en';
    document.documentElement.dataset.lang = language;
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  }, [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
