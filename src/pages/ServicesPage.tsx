import { Check, ArrowRight, Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase, Package } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface ServicesPageProps {
  onNavigate: (page: string, data?: unknown) => void;
}

export default function ServicesPage({ onNavigate }: ServicesPageProps) {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const { user } = useAuth();

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
      const { data, error } = await supabase
        .from('packages')
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true });

      if (error) throw error;
      setPackages(data || []);
    } catch (error) {
      console.error('Error loading packages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPackage = (pkg: Package) => {
    if (!user) {
      onNavigate('auth');
      return;
    }
    onNavigate('get-started', { selectedPackage: pkg });
  };

  const getPackageColor = (name: string) => {
    switch (name.toLowerCase()) {
      case 'basic':
        return 'blue';
      case 'ultimate':
        return 'amber';
      case 'epic':
        return 'orange';
      default:
        return 'blue';
    }
  };

  const getPackageBadge = (name: string) => {
    if (name.toLowerCase() === 'ultimate') return 'Most Popular';
    if (name.toLowerCase() === 'epic') return 'Best Value';
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
            Choose Your LLC Package
          </h1>
          <p className="text-lg md:text-xl text-blue-50 max-w-3xl mx-auto leading-relaxed mb-4">
            Select the perfect package for your business needs. All packages include professional filing
            and expert support.
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
            <p className="mt-6 text-lg text-gray-600 dark:text-gray-400 font-medium">Loading packages...</p>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-500">Finding the best options for you</p>
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
              const isPopular = pkg.name.toLowerCase() === 'ultimate';
              const isBasic = pkg.name.toLowerCase() === 'basic';
              const isEpic = pkg.name.toLowerCase() === 'epic';

              return (
                <div
                  key={pkg.id}
                  className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden transition-all duration-700 hover:scale-105 ${
                    isPopular 
                      ? 'ring-4 ring-amber-400 dark:ring-amber-500 shadow-2xl shadow-amber-200 dark:shadow-amber-900/50 scale-105 md:scale-110' 
                      : isEpic
                      ? 'ring-2 ring-orange-400 dark:ring-orange-500 shadow-xl shadow-orange-100 dark:shadow-orange-900/30'
                      : isBasic
                      ? 'ring-2 ring-blue-300 dark:ring-blue-600'
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
                          : isEpic
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
                      {isEpic && (
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
                      : isEpic
                      ? 'bg-gradient-to-br from-orange-50/30 to-white dark:from-gray-800 dark:to-gray-800'
                      : isBasic
                      ? 'bg-gradient-to-br from-blue-50/30 to-white dark:from-gray-800 dark:to-gray-800'
                      : ''
                  }`}>
                    <h3 className={`text-2xl font-bold mb-2 ${
                      isPopular 
                        ? 'text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-amber-800 dark:from-amber-400 dark:to-amber-600' 
                        : isEpic
                        ? 'text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600 dark:from-orange-400 dark:to-red-500'
                        : isBasic
                        ? 'text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-400 dark:to-blue-600'
                        : 'text-gray-900 dark:text-white'
                    }`}>
                      {pkg.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6 min-h-[48px]">
                      {pkg.description}
                    </p>

                    <div className="mb-6">
                      <div className="flex items-baseline">
                        <span className={`text-5xl font-bold ${
                          isPopular 
                            ? 'text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-amber-800 dark:from-amber-400 dark:to-amber-600' 
                            : isEpic
                            ? 'text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600 dark:from-orange-400 dark:to-red-500'
                            : isBasic
                            ? 'text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-400 dark:to-blue-600'
                            : 'text-gray-900 dark:text-white'
                        }`}>
                          ${pkg.price}
                        </span>
                        <span className="text-gray-600 dark:text-gray-400 ml-2">+ state fees</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleSelectPackage(pkg)}
                      className={`w-full py-3 px-6 rounded-lg font-semibold transition-all flex items-center justify-center space-x-2 ${
                        isPopular
                          ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 shadow-lg shadow-amber-500/50'
                          : isEpic
                          ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white hover:from-orange-600 hover:to-red-700 shadow-md shadow-orange-500/40'
                          : isBasic
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-md shadow-blue-500/30'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      <span>Select Package</span>
                      <ArrowRight className="h-5 w-5" />
                    </button>

                    <div className="mt-8 space-y-4">
                      {pkg.features.map((feature, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          <Check className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
                            isPopular 
                              ? 'text-amber-500 dark:text-amber-400' 
                              : isEpic
                              ? 'text-orange-500 dark:text-orange-400'
                              : isBasic
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
                Fast Processing
              </span>
            </div>
            
            <div className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <div className="absolute inset-0 w-3 h-3 bg-green-400 rounded-full animate-ping opacity-75"></div>
              </div>
              <span className="text-gray-700 dark:text-gray-300 font-medium group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                Expert Support
              </span>
            </div>
            
            <div className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <div className="absolute inset-0 w-3 h-3 bg-green-400 rounded-full animate-ping opacity-75"></div>
              </div>
              <span className="text-gray-700 dark:text-gray-300 font-medium group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                Money-Back Guarantee
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
              Not Sure Which Package to Choose?
            </h2>
            <p className="text-lg text-blue-50 mb-8 max-w-2xl mx-auto">
              Our AI assistant can help you find the perfect package for your business needs. Get personalized recommendations in minutes.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={() => onNavigate('contact')}
                className="group px-8 py-4 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition-all font-semibold shadow-xl hover:shadow-2xl hover:scale-105 flex items-center space-x-2"
              >
                <span>Contact Our Team</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-xl hover:bg-white/20 transition-all font-semibold border border-white/30">
                View Comparison Chart
              </button>
            </div>
            
            <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-blue-50">
              <div className="flex items-center space-x-2">
                <Check className="h-4 w-4" />
                <span>Free Consultation</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="h-4 w-4" />
                <span>No Obligation</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="h-4 w-4" />
                <span>Expert Guidance</span>
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