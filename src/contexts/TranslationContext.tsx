import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, translations, getLanguageFromBrowser } from '../utils/translations';

interface TranslationContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    // Try to get language from localStorage
    const saved = localStorage.getItem('language') as Language | null;
    if (saved && (saved === 'en' || saved === 'fr' || saved === 'ar' || saved === 'es')) {
      return saved;
    }
    // Detect from browser
    return getLanguageFromBrowser();
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
    // Set HTML lang attribute for accessibility
    document.documentElement.lang = lang;
    // Set text direction for RTL languages
    if (lang === 'ar') {
      document.documentElement.dir = 'rtl';
      document.body.className = 'rtl';
    } else {
      document.documentElement.dir = 'ltr';
      document.body.className = '';
    }
  };

  // Set language on mount
  useEffect(() => {
    document.documentElement.lang = language;
    if (language === 'ar') {
      document.documentElement.dir = 'rtl';
      document.body.className = 'rtl';
    } else {
      document.documentElement.dir = 'ltr';
      document.body.className = '';
    }
  }, [language]);

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[language];

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Fallback to English if translation not found
        value = translations.en;
        for (const fallbackK of keys) {
          if (value && typeof value === 'object' && fallbackK in value) {
            value = value[fallbackK];
          } else {
            return key; // Return the key itself if not found
          }
        }
      }
    }

    return typeof value === 'string' ? value : key;
  };

  return (
    <TranslationContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within TranslationProvider');
  }
  return context;
}
