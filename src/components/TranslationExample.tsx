import { useAutoTranslate } from '../contexts/TranslationContext';
import { useTranslationHelper } from '../hooks/useTranslationHelper';
import { Globe } from 'lucide-react';
import { useState } from 'react';

/**
 * Example component demonstrating translation usage
 * This shows all the different ways to use the DeepL translation feature
 */
export default function TranslationExample() {
  const { translatedText: translatedTitle, isLoading: titleLoading } = useAutoTranslate(
    'Welcome to OGS Solutions'
  );
  const { translatedText: translatedDesc, isLoading: descLoading } = useAutoTranslate(
    'Your trusted partner for business solutions'
  );

  const { translate, currentLanguage } = useTranslationHelper();
  const [manualText, setManualText] = useState('');
  const [manualTranslation, setManualTranslation] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);

  const handleManualTranslate = async (text: string) => {
    if (!text) return;
    setIsTranslating(true);
    try {
      const result = await translate(text);
      setManualTranslation(result);
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Section 1: Auto-translated content */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Globe className="w-6 h-6 text-blue-600" />
          Auto-Translation Example
        </h2>

        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {titleLoading ? 'Translating...' : translatedTitle}
          </h3>
          <p className="text-gray-700 dark:text-gray-300">
            {descLoading ? 'Translating...' : translatedDesc}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
            These texts are automatically translated using the useAutoTranslate hook
          </p>
        </div>
      </section>

      {/* Section 2: Manual translation */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Manual Translation
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Enter text to translate to {currentLanguage}:
            </label>
            <textarea
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
              placeholder="Enter text here..."
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600
                         bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>

          <button
            onClick={() => handleManualTranslate(manualText)}
            disabled={!manualText || isTranslating}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700
                       disabled:bg-gray-400 transition-colors font-medium"
          >
            {isTranslating ? 'Translating...' : 'Translate'}
          </button>

          {manualTranslation && (
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Translation to {currentLanguage}:
              </p>
              <p className="text-gray-900 dark:text-white">{manualTranslation}</p>
            </div>
          )}
        </div>
      </section>

      {/* Section 3: Information */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          How to Use in Your Components
        </h2>

        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6">
          <div className="space-y-6">
            {/* Example 1 */}
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                Option 1: useAutoTranslate Hook
              </h4>
              <pre className="bg-gray-900 text-green-400 p-4 rounded overflow-x-auto text-sm">
                {`import { useAutoTranslate } from '../contexts/TranslationContext';

export function MyComponent() {
  const { translatedText } = useAutoTranslate('Hello World');
  return <h1>{translatedText}</h1>;
}`}
              </pre>
            </div>

            {/* Example 2 */}
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                Option 2: useTranslationHelper Hook
              </h4>
              <pre className="bg-gray-900 text-green-400 p-4 rounded overflow-x-auto text-sm">
                {`import { useTranslationHelper } from '../hooks/useTranslationHelper';

export function MyComponent() {
  const { translate, currentLanguage } = useTranslationHelper();
  
  const handleClick = async () => {
    const result = await translate('Hello World');
    console.log(result);
  };
  
  return <button onClick={handleClick}>Translate</button>;
}`}
              </pre>
            </div>

            {/* Example 3 */}
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                Option 3: Direct Function Usage
              </h4>
              <pre className="bg-gray-900 text-green-400 p-4 rounded overflow-x-auto text-sm">
                {`import { translateText, translateArray } from '../lib/deepl';

// Single text
const translated = await translateText('Hello', 'FR');

// Multiple texts
const translations = await translateArray(
  ['Hello', 'Goodbye'], 
  'ES'
);`}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Current Language Info */}
      <div className="mt-12 text-center p-6 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
        <p className="text-gray-700 dark:text-gray-300">
          Current Language: <span className="font-bold text-blue-600 dark:text-blue-400">{currentLanguage}</span>
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          Change it using the language selector in the header above
        </p>
      </div>
    </div>
  );
}
