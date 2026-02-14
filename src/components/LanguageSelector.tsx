import { useTranslation } from '../contexts/TranslationContext';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export default function LanguageSelector() {
  const { currentLanguage, setLanguage, supportedLanguages } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const handleLanguageChange = (code: string) => {
    setLanguage(code as any);
    setIsOpen(false);
  };

  const currentLangName = supportedLanguages[currentLanguage as keyof typeof supportedLanguages];

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Main Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center gap-2.5 px-4 py-2.5 rounded-xl
                   bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-850
                   border border-gray-200/80 dark:border-gray-700/50
                   text-gray-700 dark:text-gray-200
                   hover:border-gray-300 dark:hover:border-gray-600
                   hover:shadow-md hover:shadow-gray-200/50 dark:hover:shadow-gray-900/50
                   active:scale-[0.98]
                   focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-400/50
                   transition-all duration-300 ease-out
                   backdrop-blur-sm"
        aria-label="Select language"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        {/* Gradient Overlay on Hover */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500/0 to-purple-500/0 
                       group-hover:from-blue-500/5 group-hover:to-purple-500/5 
                       dark:group-hover:from-blue-400/10 dark:group-hover:to-purple-400/10
                       transition-all duration-300" />
        
        {/* Globe Icon */}
        <div className="relative">
          <Globe className="h-4.5 w-4.5 text-gray-600 dark:text-gray-400 
                          group-hover:text-blue-600 dark:group-hover:text-blue-400 
                          group-hover:scale-110
                          transition-all duration-300" />
          <div className="absolute inset-0 blur-md bg-blue-500/0 
                         group-hover:bg-blue-500/30 dark:group-hover:bg-blue-400/30
                         transition-all duration-300" />
        </div>
        
        {/* Language Text */}
        <span className="relative text-sm font-semibold min-w-[3rem] tracking-wide
                       bg-gradient-to-br from-gray-700 to-gray-900 dark:from-gray-200 dark:to-gray-100
                       bg-clip-text
                       group-hover:from-blue-600 group-hover:to-purple-600 
                       dark:group-hover:from-blue-400 dark:group-hover:to-purple-400
                       transition-all duration-300">
          {currentLangName}
        </span>
        
        {/* Chevron */}
        <ChevronDown 
          className={`relative h-4 w-4 text-gray-500 dark:text-gray-400
                     group-hover:text-blue-600 dark:group-hover:text-blue-400
                     transition-all duration-300 ease-out
                     ${isOpen ? 'rotate-180 scale-110' : 'rotate-0 scale-100'}`}
        />

        {/* Shine Effect */}
        <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
          <div className="absolute top-0 -left-full h-full w-1/2 
                         bg-gradient-to-r from-transparent via-white/20 to-transparent
                         group-hover:left-full transition-all duration-700 ease-out
                         skew-x-12" />
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          
          {/* Dropdown */}
          <div className="absolute right-0 mt-3 w-56 z-50
                         animate-in fade-in slide-in-from-top-3 duration-300 ease-out">
            <div className="relative bg-white/95 dark:bg-gray-900/95 
                           backdrop-blur-xl
                           border border-gray-200/50 dark:border-gray-700/50
                           rounded-2xl shadow-2xl shadow-gray-300/20 dark:shadow-black/40
                           ring-1 ring-black/5 dark:ring-white/5
                           overflow-hidden">
              
              {/* Gradient Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 
                             dark:from-blue-400/10 dark:via-transparent dark:to-purple-400/10 
                             pointer-events-none" />
              
              {/* Menu Items */}
              <div className="relative py-2" role="listbox">
                {Object.entries(supportedLanguages).map(([code, name], index) => {
                  const isSelected = currentLanguage === code;
                  
                  return (
                    <button
                      key={code}
                      onClick={() => handleLanguageChange(code)}
                      role="option"
                      aria-selected={isSelected}
                      style={{ 
                        animationDelay: `${index * 30}ms`,
                      }}
                      className={`group/item relative w-full px-4 py-3 text-left
                                 flex items-center justify-between gap-3
                                 transition-all duration-200 ease-out
                                 animate-in fade-in slide-in-from-top-1
                                 ${
                                   isSelected
                                     ? 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 text-blue-700 dark:text-blue-300'
                                     : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50/80 dark:hover:bg-gray-800/80'
                                 }`}
                    >
                      {/* Selection Indicator Bar */}
                      <div className={`absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 rounded-r-full
                                     bg-gradient-to-b from-blue-500 to-purple-500
                                     transition-all duration-300 ease-out
                                     ${isSelected ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`} />
                      
                      {/* Language Name */}
                      <span className={`relative font-medium text-[15px] tracking-wide
                                      transition-all duration-200
                                      ${isSelected ? 'translate-x-2 font-semibold' : 'translate-x-0'}
                                      group-hover/item:translate-x-1`}>
                        {name}
                      </span>
                      
                      {/* Check Icon */}
                      <div className={`relative flex items-center justify-center
                                     transition-all duration-300 ease-out
                                     ${isSelected ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-0 -rotate-90'}`}>
                        <Check className="h-5 w-5 text-blue-600 dark:text-blue-400 stroke-[3]" />
                        <div className="absolute inset-0 blur-md bg-blue-500/30 dark:bg-blue-400/30" />
                      </div>

                      {/* Hover Gradient */}
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-transparent
                                     group-hover/item:from-blue-500/5 group-hover/item:via-purple-500/5
                                     dark:group-hover/item:from-blue-400/10 dark:group-hover/item:via-purple-400/10
                                     transition-all duration-300 pointer-events-none" />
                    </button>
                  );
                })}
              </div>

              {/* Bottom Shine */}
              <div className="absolute bottom-0 left-0 right-0 h-px 
                             bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
            </div>
          </div>
        </>
      )}
    </div>
  );
}