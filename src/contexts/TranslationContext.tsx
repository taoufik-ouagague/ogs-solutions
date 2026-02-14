import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { translateText, LanguageCode, SUPPORTED_LANGUAGES } from '../lib/deepl';

interface TranslationContextType {
  currentLanguage: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  translate: (text: string) => Promise<string>;
  isTranslating: boolean;
  supportedLanguages: { [key: string]: string };
  detectLanguage: () => LanguageCode | null;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>(() => {
    const saved = localStorage.getItem('translationLanguage') as LanguageCode;
    if (saved) return saved;
    
    // Auto-detect browser language
    const browserLang = navigator.language.toUpperCase();
    const langCode = browserLang.split('-')[0] as LanguageCode;
    
    return (Object.keys(SUPPORTED_LANGUAGES).includes(langCode) ? langCode : 'EN') as LanguageCode;
  });

  const [isTranslating, setIsTranslating] = useState(false);

  // Save language preference
  useEffect(() => {
    localStorage.setItem('translationLanguage', currentLanguage);
    console.log('[Translation Context] Language changed to:', currentLanguage);
  }, [currentLanguage]);

  const handleSetLanguage = (lang: LanguageCode) => {
    setCurrentLanguage(lang);
  };

  const translate = useCallback(
    async (text: string): Promise<string> => {
      if (currentLanguage === 'EN' || !text) {
        return text; // Don't translate if already in English or text is empty
      }

      try {
        setIsTranslating(true);
        const translated = await translateText(text, currentLanguage, 'EN');
        return translated;
      } catch (error) {
        console.error('Translation context error:', error);
        return text;
      } finally {
        setIsTranslating(false);
      }
    },
    [currentLanguage]
  );

  const detectLanguage = useCallback((): LanguageCode | null => {
    const browserLang = navigator.language.toUpperCase();
    const langCode = browserLang.split('-')[0] as LanguageCode;
    return (Object.keys(SUPPORTED_LANGUAGES).includes(langCode) ? langCode : null) as LanguageCode | null;
  }, []);

  return (
    <TranslationContext.Provider
      value={{
        currentLanguage,
        setLanguage: handleSetLanguage,
        translate,
        isTranslating,
        supportedLanguages: SUPPORTED_LANGUAGES,
        detectLanguage,
      }}
    >
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
}

// Hook for auto-translating text in components
export function useAutoTranslate(text: string): { translatedText: string; isLoading: boolean } {
  const { translate, isTranslating, currentLanguage } = useTranslation();
  const [translatedText, setTranslatedText] = useState(text);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    translate(text)
      .then(result => {
        setTranslatedText(result);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Auto-translate error:', error);
        setTranslatedText(text);
        setIsLoading(false);
      });
  }, [text, translate, currentLanguage]);

  return { translatedText, isLoading: isLoading || isTranslating };
}
