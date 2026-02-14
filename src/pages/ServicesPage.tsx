import { Check, ArrowRight, Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase-types';
import type { Package } from '../lib/firebase-types';
import { useAuth } from '../contexts/AuthContext';
import { useAutoTranslate } from '../contexts/TranslationContext';

interface ServicesPageProps {
  onNavigate: (page: string, data?: unknown) => void;
}

export default function ServicesPage({ onNavigate }: ServicesPageProps) {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const { user } = useAuth();
  
  // Translations
  const { translatedText: pageTitle } = useAutoTranslate('Choose Your LLC Package');
  const { translatedText: pageDesc } = useAutoTranslate('Select the perfect package for your business needs. All packages include professional filing and expert support.');
  const { translatedText: loadingText } = useAutoTranslate('Loading packages...');
  const { translatedText: findingText } = useAutoTranslate('Finding the best options for you');
  const { translatedText: selectPkgBtn } = useAutoTranslate('Select Package');
  const { translatedText: fastProcessing } = useAutoTranslate('Fast Processing');
  const { translatedText: expertSupport } = useAutoTranslate('Expert Support');
  const { translatedText: moneyBackGuarantee } = useAutoTranslate('Money-Back Guarantee');
  const { translatedText: notSureTitle } = useAutoTranslate('Not Sure Which Package to Choose?');
  const { translatedText: notSureDesc } = useAutoTranslate('Our AI assistant can help you find the perfect package for your business needs. Get personalized recommendations in minutes.');
  const { translatedText: contactBtn } = useAutoTranslate('Contact Our Team');
  const { translatedText: comparisonBtn } = useAutoTranslate('View Comparison Chart');
  const { translatedText: freeConsultation } = useAutoTranslate('Free Consultation');
  const { translatedText: noObligation } = useAutoTranslate('No Obligation');
  const { translatedText: expertGuidance } = useAutoTranslate('Expert Guidance');
  const { translatedText: badgeMostPopular } = useAutoTranslate('Most Popular');
  const { translatedText: badgeBestValue } = useAutoTranslate('Best Value');

  useEffect(() => {
    loadPackages();
  }, []);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px'
    };

    const handleIntersect = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setVisibleSections(prev => new Set(prev).add(entry.target.id));
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersect, observerOptions);
    
    const scrollElements = document.querySelectorAll('[data-scroll]');
    scrollElements.forEach(el => {
      observer.observe(el);
      observers.push(observer);
    });

    return () => {
      observers.forEach(obs => obs.disconnect());
    };
  }, [loading]);

  const loadPackages = async () => {
    try {
      // First try: Query with filter and sort
      try {
        const q = query(
          collection(db, 'packages'),
          where('is_active', '==', true),
          orderBy('price', 'asc')
        );
        const snapshot = await getDocs(q);
        let packageData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Package[];
        
        // Sort to put Wyoming in the middle
        packageData = sortPackagesForDisplay(packageData);
        setPackages(packageData);
      } catch (filterError: any) {
        // Fallback: Get all packages and filter client-side
        if (filterError.code === 'failed-precondition' || filterError.code === 'permission-denied') {
          console.warn('Complex query not available, fetching all and filtering client-side:', filterError.message);
          const snapshot = await getDocs(collection(db, 'packages'));
          let packageData = snapshot.docs
            .map(doc => ({
              id: doc.id,
              ...doc.data(),
            }))
            .filter((pkg: any) => pkg.is_active === true)
            .sort((a: any, b: any) => (a.price || 0) - (b.price || 0)) as Package[];
          
          // Sort to put Wyoming in the middle
          packageData = sortPackagesForDisplay(packageData);
          setPackages(packageData);
        } else {
          throw filterError;
        }
      }
    } catch (error) {
      console.error('Error loading packages:', error);
      // Try one more fallback: just get all packages without filtering
      try {
        const snapshot = await getDocs(collection(db, 'packages'));
        let packageData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Package[];
        
        // Sort to put Wyoming in the middle
        packageData = sortPackagesForDisplay(packageData);
        setPackages(packageData);
      } catch (fallbackError) {
        console.error('Fallback fetch also failed:', fallbackError);
      }
    } finally {
      setLoading(false);
    }
  };

  const sortPackagesForDisplay = (packages: Package[]): Package[] => {
    // Filter to get only BASIC packages from each state
    const basicPackages = packages.filter(p => {
      const name = p.name.toLowerCase();
      return name.includes('basic');
    });

    // Custom sort to ensure Wyoming is in the center
    const colorado = basicPackages.find(p => p.name.toLowerCase().includes('colorado'));
    const wyoming = basicPackages.find(p => p.name.toLowerCase().includes('wyoming'));
    const newMexico = basicPackages.find(p => p.name.toLowerCase().includes('new mexico'));
    
    const sorted: Package[] = [];
    if (colorado) sorted.push(colorado);
    if (wyoming) sorted.push(wyoming);
    if (newMexico) sorted.push(newMexico);
    
    return sorted;
  };

  const handleSelectPackage = (pkg: Package) => {
    if (!user) {
      onNavigate('auth');
      return;
    }
    onNavigate('get-started', { selectedPackage: pkg });
  };

  const getPackageColor = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('colorado')) return 'blue';
    if (lowerName.includes('wyoming')) return 'amber';
    if (lowerName.includes('new mexico')) return 'orange';
    return 'blue';
  };

  const getPackageBadge = (name: string) => {
    if (name.toLowerCase().includes('wyoming')) return badgeMostPopular;
    if (name.toLowerCase().includes('new mexico')) return badgeBestValue;
    return null;
  };

  return (
    <div className="min-h-screen pb-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 transition-colors">
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-500 to-purple-600 dark:from-blue-900 dark:via-blue-800 dark:to-purple-900 pt-24 pb-32 transition-colors overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-float-delayed"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-block mb-4">
            <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-semibold border border-white/30">
              ✨ Start Your Business Journey
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 drop-shadow-lg">
            {pageTitle}
          </h1>
          <p className="text-lg md:text-xl text-blue-50 max-w-3xl mx-auto leading-relaxed mb-4">
            {pageDesc}
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-10" id="packages-section" data-scroll>
        {loading ? (
          <div className="text-center py-32">
            <div className="relative inline-block">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 dark:border-blue-900"></div>
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 dark:border-blue-400 absolute top-0 left-0"></div>
            </div>
            <p className="mt-6 text-lg text-gray-600 dark:text-gray-400 font-medium">{loadingText}</p>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-500">{findingText}</p>
          </div>
        ) : (
          <div className={`grid grid-cols-1 md:grid-cols-3 gap-8 transition-all duration-1000 ${
            visibleSections.has('packages-section') 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-10'
          }`}>
            {packages.map((pkg, pkgIndex) => {
              const color = getPackageColor(pkg.name);
              const badge = getPackageBadge(pkg.name);
              const isPopular = pkg.name.toLowerCase().includes('wyoming');
              const isColorado = pkg.name.toLowerCase().includes('colorado');
              const isNewmexico = pkg.name.toLowerCase().includes('new mexico');

              return (
                <div
                  key={pkg.id}
                  className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden transition-all duration-700 hover:scale-105 ${
                    isPopular 
                      ? 'ring-4 ring-amber-400 dark:ring-amber-500 shadow-2xl shadow-amber-200 dark:shadow-amber-900/50 scale-105 md:scale-110' 
                      : isColorado
                      ? 'ring-2 ring-blue-300 dark:ring-blue-600'
                      : isNewmexico
                      ? 'ring-2 ring-orange-400 dark:ring-orange-500 shadow-xl shadow-orange-100 dark:shadow-orange-900/30'
                      : ''
                  } ${
                    visibleSections.has('packages-section')
                      ? 'opacity-100 translate-y-0 scale-100'
                      : 'opacity-0 translate-y-10 scale-95'
                  }`}
                  style={{
                    transitionDelay: visibleSections.has('packages-section')
                      ? `${pkgIndex * 200}ms`
                      : '0ms'
                  }}
                >
                  {badge && (
                    <div 
                      className={`relative text-white text-center py-3 text-sm font-bold transition-all duration-500 ${
                        isPopular 
                          ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600' 
                          : isNewmexico
                          ? 'bg-gradient-to-r from-orange-500 via-orange-600 to-red-600'
                          : `bg-${color}-500`
                      } ${
                        visibleSections.has('packages-section')
                          ? 'translate-y-0'
                          : '-translate-y-full'
                      }`}
                      style={{
                        transitionDelay: visibleSections.has('packages-section')
                          ? `${pkgIndex * 200 + 200}ms`
                          : '0ms'
                      }}
                    >
                      {isPopular && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                      )}
                      {isNewmexico && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse-slow"></div>
                      )}
                      <div className="relative flex items-center justify-center space-x-2">
                        {isPopular && <Star className="h-4 w-4 fill-current" />}
                        <span>{badge}</span>
                        {isPopular && <Star className="h-4 w-4 fill-current" />}
                      </div>
                    </div>
                  )}

                  <div className={`p-8 ${
                    isPopular 
                      ? 'bg-gradient-to-br from-amber-50/50 to-white dark:from-gray-800 dark:to-gray-800' 
                      : isNewmexico
                      ? 'bg-gradient-to-br from-orange-50/30 to-white dark:from-gray-800 dark:to-gray-800'
                      : isColorado
                      ? 'bg-gradient-to-br from-blue-50/30 to-white dark:from-gray-800 dark:to-gray-800'
                      : ''
                  }`}>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {pkg.description}
                    </p>
                    <h3 className={`text-2xl font-bold mb-6 ${
                      isPopular 
                        ? 'text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-amber-800 dark:from-amber-400 dark:to-amber-600' 
                        : isNewmexico
                        ? 'text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600 dark:from-orange-400 dark:to-red-500'
                        : isColorado
                        ? 'text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-400 dark:to-blue-600'
                        : 'text-gray-900 dark:text-white'
                    }`}>
                      {pkg.name}
                    </h3>

                    <div className="mb-6">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                          <span className={`inline-block px-3 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase ${
                            isPopular 
                              ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300' 
                              : isNewmexico
                              ? 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300'
                              : isColorado
                              ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                          }`}>
                            à partir de
                          </span>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className={`text-5xl font-bold ${
                            isPopular 
                              ? 'text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-amber-800 dark:from-amber-400 dark:to-amber-600' 
                              : isNewmexico
                              ? 'text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600 dark:from-orange-400 dark:to-red-500'
                              : isColorado
                              ? 'text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-400 dark:to-blue-600'
                              : 'text-gray-900 dark:text-white'
                          }`}>
                            {pkg.price}
                          </span>
                          <span className={`text-lg font-bold ${
                            isPopular 
                              ? 'text-amber-700 dark:text-amber-300' 
                              : isNewmexico
                              ? 'text-orange-700 dark:text-orange-300'
                              : isColorado
                              ? 'text-blue-700 dark:text-blue-300'
                              : 'text-gray-700 dark:text-gray-300'
                          }`}>
                            DHS
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleSelectPackage(pkg)}
                      className={`w-full py-3 px-6 rounded-lg font-semibold transition-all flex items-center justify-center space-x-2 ${
                        isPopular
                          ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 shadow-lg shadow-amber-500/50'
                          : isNewmexico
                          ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white hover:from-orange-600 hover:to-red-700 shadow-md shadow-orange-500/40'
                          : isColorado
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-md shadow-blue-500/30'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      <span>{selectPkgBtn}</span>
                      <ArrowRight className="h-5 w-5" />
                    </button>

                    <div className="mt-8 space-y-4">
                      {pkg.features.map((feature, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          <Check className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
                            isPopular 
                              ? 'text-amber-500 dark:text-amber-400' 
                              : isNewmexico
                              ? 'text-orange-500 dark:text-orange-400'
                              : isColorado
                              ? 'text-blue-500 dark:text-blue-400'
                              : `text-${color}-500`
                          }`} />
                          <span className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Trust Indicators */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16" id="trust-section" data-scroll>
        <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700 transition-all duration-1000 ${
          visibleSections.has('trust-section')
            ? 'opacity-100 scale-100'
            : 'opacity-0 scale-95'
        }`}>
          <div className="flex flex-col md:flex-row justify-center items-center gap-8 md:gap-12">
            <div className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <div className="absolute inset-0 w-3 h-3 bg-green-400 rounded-full animate-ping opacity-75"></div>
              </div>
              <span className="text-gray-700 dark:text-gray-300 font-medium group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                {fastProcessing}
              </span>
            </div>
            
            <div className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <div className="absolute inset-0 w-3 h-3 bg-green-400 rounded-full animate-ping opacity-75"></div>
              </div>
              <span className="text-gray-700 dark:text-gray-300 font-medium group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                {expertSupport}
              </span>
            </div>
            
            <div className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <div className="absolute inset-0 w-3 h-3 bg-green-400 rounded-full animate-ping opacity-75"></div>
              </div>
              <span className="text-gray-700 dark:text-gray-300 font-medium group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                {moneyBackGuarantee}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-24" id="cta-section" data-scroll>
        <div className={`relative bg-gradient-to-br from-blue-600 to-purple-600 dark:from-blue-800 dark:to-purple-800 rounded-3xl p-12 text-center overflow-hidden shadow-2xl transition-all duration-1000 ${
          visibleSections.has('cta-section')
            ? 'opacity-100 translate-y-0 scale-100'
            : 'opacity-0 translate-y-10 scale-95'
        }`}>
          {/* Decorative background */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItMnptMCAydjJ6bTAtMnYyem0yIDB2MnptLTIgMHYyem0yIDB2MnptLTIgMHYyem0yIDB2MnptLTIgMHYyem0yIDB2MnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30"></div>
          
          <div className="relative z-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {notSureTitle}
            </h2>
            <p className="text-lg text-blue-50 mb-8 max-w-2xl mx-auto">
              {notSureDesc}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={() => onNavigate('contact')}
                className="group px-8 py-4 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition-all font-semibold shadow-xl hover:shadow-2xl hover:scale-105 flex items-center space-x-2"
              >
                <span>{contactBtn}</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-xl hover:bg-white/20 transition-all font-semibold border border-white/30">
                {comparisonBtn}
              </button>
            </div>
            
            <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-blue-50">
              <div className="flex items-center space-x-2">
                <Check className="h-4 w-4" />
                <span>{freeConsultation}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="h-4 w-4" />
                <span>{noObligation}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="h-4 w-4" />
                <span>{expertGuidance}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 3s infinite;
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(-20px) translateX(10px); }
        }
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(20px) translateX(-10px); }
        }
        .animate-float-delayed {
          animation: float-delayed 10s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}