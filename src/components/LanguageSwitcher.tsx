import { Globe } from 'lucide-react';
import { useTranslation } from '../contexts/TranslationContext';
import { Language, getLanguageName } from '../utils/translations';

export default function LanguageSwitcher() {
  const { language, setLanguage } = useTranslation();
  const languages: Language[] = ['en', 'fr', 'ar', 'es'];

  return (
    <div className="relative group">
      <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
        <Globe className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        <span className="text-sm font-medium text-gray-600 dark:text-gray-300 hidden sm:inline">
          {getLanguageName(language)}
        </span>
      </button>

      {/* Dropdown Menu */}
      <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
        {languages.map((lang) => (
          <button
            key={lang}
            onClick={() => setLanguage(lang)}
            className={`w-full text-left px-4 py-2 text-sm transition-colors ${
              language === lang
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 font-semibold'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            } ${lang === 'ar' ? 'text-right' : ''}`}
          >
            {getLanguageName(lang)}
          </button>
        ))}
      </div>
    </div>
  );
}
