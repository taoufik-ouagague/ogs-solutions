import React, { useCallback } from 'react';
import { useTranslation } from '../contexts/TranslationContext';

/**
 * Hook for translating text in components
 * Usage: const { translate } = useTranslationHelper();
 * Then use: translate('Hello World')
 */
export function useTranslationHelper() {
  const { translate, currentLanguage, setLanguage, supportedLanguages } = useTranslation();

  const translateMultiple = useCallback(
    async (texts: string[]): Promise<string[]> => {
      return Promise.all(texts.map(text => translate(text)));
    },
    [translate]
  );

  return {
    translate,
    translateMultiple,
    currentLanguage,
    setLanguage,
    supportedLanguages,
  };
}

/**
 * Hook for creating a translated text element
 * Usage: const [text, isLoading] = useTranslatedText('Hello World');
 */
export function useTranslatedText(text: string): [string, boolean] {
  const { translate } = useTranslation();
  const [translatedText, setTranslatedText] = React.useState(text);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    if (!text) {
      setTranslatedText('');
      return;
    }

    setIsLoading(true);
    translate(text)
      .then(result => {
        setTranslatedText(result);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Translation error:', error);
        setTranslatedText(text);
        setIsLoading(false);
      });
  }, [text, translate]);

  return [translatedText, isLoading];
}
