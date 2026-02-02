import { ArrowRight, CheckCircle, Clock, Shield, DollarSign, Users, Star, Sparkles, Zap, Award } from 'lucide-react';
import { useState, useEffect } from 'react';
import FAQSection from '../components/FAQSection';

interface HomePageProps {
  onNavigate: (page: string) => void;
}

export default function HomePage({ onNavigate }: HomePageProps) {
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());

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
    
    // Observe all sections with data-scroll attribute
    const scrollElements = document.querySelectorAll('[data-scroll]');
    scrollElements.forEach(el => {
      observer.observe(el);
      observers.push(observer);
    });

    return () => {
      observers.forEach(obs => obs.disconnect());
    };
  }, []);

  const benefits = [
    {
      icon: Clock,
      title: 'Fast Processing',
      description: 'Get your LLC formed in as little as 1-2 business days with our expedited service.',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      icon: DollarSign,
      title: 'Affordable Pricing',
      description: 'Transparent pricing starting at just $99. No hidden fees or surprises.',
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20'
    },
    {
      icon: Shield,
      title: 'Secure & Reliable',
      description: 'Bank-level security and 100% satisfaction guarantee for peace of mind.',
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20'
    },
    {
      icon: Users,
      title: 'Expert Support',
      description: '24/7 customer support from LLC formation specialists ready to help.',
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20'
    },
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'E-commerce Founder',
      content: 'OGS Solution made forming my LLC incredibly easy. The process was straightforward and completed in just 3 days!',
      rating: 5,
      avatar: 'SJ',
      color: 'from-pink-500 to-rose-500'
    },
    {
      name: 'Michael Chen',
      role: 'Consultant',
      content: 'Best decision for my business. The Colorado package included everything I needed, and support was outstanding.',
      rating: 5,
      avatar: 'MC',
      color: 'from-blue-500 to-indigo-500'
    },
    {
      name: 'Emily Rodriguez',
      role: 'Real Estate Investor',
      content: 'Professional, efficient, and affordable. I\'ve recommended OGS Solution to all my business partners.',
      rating: 5,
      avatar: 'ER',
      color: 'from-purple-500 to-violet-500'
    },
  ];

  const steps = [
    {
      number: '01',
      title: 'Choose Your State',
      description: 'Select the state where you want to form your LLC using our interactive tool.',
      icon: '🗺️'
    },
    {
      number: '02',
      title: 'Select a Package',
      description: 'Pick the service package that best fits your business needs and budget.',
      icon: '📦'
    },
    {
      number: '03',
      title: 'Complete the Form',
      description: 'Fill out our simple step-by-step form with your business information.',
      icon: '📝'
    },
    {
      number: '04',
      title: 'We Handle Everything',
      description: 'Sit back and relax while we file your LLC and handle all the paperwork.',
      icon: '✨'
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 dark:from-blue-900 dark:via-purple-900 dark:to-pink-900 pt-32 pb-40 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-float"></div>
          <div className="absolute top-40 right-20 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-float-delayed"></div>
          <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-float-slow"></div>
        </div>

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItMnptMCAydjJ6bTAtMnYyem0yIDB2MnptLTIgMHYyem0yIDB2MnptLTIgMHYyem0yIDB2MnptLTIgMHYyem0yIDB2MnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full text-white text-sm font-semibold border border-white/30 mb-8 animate-fade-in-up">
              <Sparkles className="h-4 w-4" />
              <span>Trusted by 10,000+ Entrepreneurs</span>
            </div>

            {/* Main heading */}
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-8 leading-tight animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              Start Your LLC
              <span className="block bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-300 bg-clip-text text-transparent">
                Today
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-blue-50 mb-12 leading-relaxed max-w-3xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              Form your Limited Liability Company in any U.S. state with confidence.
              Simple, affordable, and secure business formation.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <button
                onClick={() => onNavigate('get-started')}
                className="group px-10 py-5 bg-white text-blue-600 rounded-2xl hover:bg-blue-50 transition-all font-bold text-lg shadow-2xl hover:shadow-3xl hover:scale-105 flex items-center justify-center space-x-3"
              >
                <span>Get Started Now</span>
                <ArrowRight className="h-6 w-6 group-hover:translate-x-2 transition-transform" />
              </button>
              <button
                onClick={() => onNavigate('how-it-works')}
                className="px-10 py-5 bg-white/10 backdrop-blur-md text-white border-2 border-white/30 rounded-2xl hover:bg-white/20 transition-all font-bold text-lg"
              >
                Learn How It Works
              </button>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center justify-center gap-8 text-white/90 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-6 w-6 text-green-300" />
                <span className="font-medium">No Hidden Fees</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-6 w-6 text-green-300" />
                <span className="font-medium">100% Satisfaction Guarantee</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-6 w-6 text-green-300" />
                <span className="font-medium">Same-Day Processing</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z" className="fill-gray-50 dark:fill-gray-900"/>
          </svg>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-gray-50 dark:bg-gray-900 relative" id="benefits-section" data-scroll>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-20 transition-all duration-1000 ${visibleSections.has('benefits-section') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400 text-sm font-semibold mb-6">
              <Award className="h-4 w-4" />
              <span>Why Choose Us</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Why Choose OGS Solution?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              We make LLC formation easy, fast, and affordable for entrepreneurs nationwide.
            </p>
          </div>

          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 transition-all duration-1000 delay-300 ${visibleSections.has('benefits-section') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className={`group relative bg-white dark:bg-gray-800 p-8 rounded-3xl hover:shadow-2xl transition-all duration-700 hover:-translate-y-2 border border-gray-100 dark:border-gray-700 ${
                  visibleSections.has('benefits-section') 
                    ? 'opacity-100 translate-x-0' 
                    : 'opacity-0 -translate-x-10'
                }`}
                style={{ 
                  transitionDelay: visibleSections.has('benefits-section') 
                    ? `${index * 150 + 300}ms` 
                    : '0ms'
                }}
              >
                <div className={`${benefit.bgColor} w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                  <benefit.icon className="h-8 w-8 text-blue-600 dark:text-blue-400 group-hover:animate-pulse" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {benefit.description}
                </p>
                
                {/* Decorative gradient on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${benefit.color} opacity-0 group-hover:opacity-5 rounded-3xl transition-opacity`}></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-white dark:bg-gray-800 relative overflow-hidden" id="steps-section" data-scroll>
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-blue-50 to-transparent dark:from-blue-900/10 dark:to-transparent"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className={`text-center mb-20 transition-all duration-1000 ${visibleSections.has('steps-section') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 rounded-full text-purple-600 dark:text-purple-400 text-sm font-semibold mb-6">
              <Zap className="h-4 w-4" />
              <span>Simple Process</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Four simple steps to get your LLC up and running.
            </p>
          </div>

          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative transition-all duration-1000 delay-300 ${visibleSections.has('steps-section') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {steps.map((step, index) => (
              <div 
                key={index} 
                className={`relative transition-all duration-700 ${
                  visibleSections.has('steps-section')
                    ? 'opacity-100 translate-y-0 scale-100'
                    : 'opacity-0 translate-y-10 scale-95'
                }`}
                style={{ 
                  transitionDelay: visibleSections.has('steps-section') 
                    ? `${index * 150 + 300}ms` 
                    : '0ms'
                }}
              >
                <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 border-2 border-gray-100 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 group hover:scale-105">
                  {/* Step number with emoji */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="text-6xl font-bold bg-gradient-to-br from-blue-600 to-purple-600 bg-clip-text text-transparent opacity-20 group-hover:opacity-40 transition-all duration-500 group-hover:scale-110">
                      {step.number}
                    </div>
                    <div className="text-4xl group-hover:scale-125 group-hover:animate-bounce transition-transform duration-300">
                      {step.icon}
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {step.description}
                  </p>
                </div>
                
                {/* Connecting arrow */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 z-20 animate-pulse">
                    <ArrowRight className="h-8 w-8 text-blue-400 dark:text-blue-600" />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className={`text-center mt-16 transition-all duration-1000 delay-500 ${visibleSections.has('steps-section') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <button
              onClick={() => onNavigate('get-started')}
              className="group px-10 py-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all font-bold text-lg shadow-2xl hover:shadow-3xl hover:scale-105 inline-flex items-center space-x-3"
            >
              <span>Start Your LLC Now</span>
              <ArrowRight className="h-6 w-6 group-hover:translate-x-2 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900/20" id="testimonials-section" data-scroll>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-20 transition-all duration-1000 ${visibleSections.has('testimonials-section') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-full text-yellow-600 dark:text-yellow-400 text-sm font-semibold mb-6">
              <Star className="h-4 w-4 fill-current" />
              <span>Client Success Stories</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              What Our Clients Say
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Join thousands of entrepreneurs who trust OGS Solution.
            </p>
          </div>

          <div className={`grid grid-cols-1 md:grid-cols-3 gap-8 transition-all duration-1000 delay-300 ${visibleSections.has('testimonials-section') ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className={`group relative bg-white dark:bg-gray-800 p-8 rounded-3xl hover:shadow-2xl transition-all duration-700 border-2 border-gray-100 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 hover:-translate-y-2 ${
                  visibleSections.has('testimonials-section')
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-20'
                }`}
                style={{ 
                  transitionDelay: visibleSections.has('testimonials-section') 
                    ? `${index * 200 + 300}ms` 
                    : '0ms'
                }}
              >
                {/* Quote decoration */}
                <div className="absolute top-6 right-6 text-6xl text-gray-100 dark:text-gray-700 opacity-50 group-hover:animate-wiggle">"</div>
                
                {/* Rating stars */}
                <div className="flex mb-6 relative z-10 space-x-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star 
                      key={i} 
                      className="h-5 w-5 text-yellow-400 fill-current animate-shimmer-star" 
                      style={{ animationDelay: `${i * 0.1}s` }}
                    />
                  ))}
                </div>
                
                {/* Testimonial content */}
                <p className="text-gray-700 dark:text-gray-300 mb-8 leading-relaxed text-lg relative z-10">
                  "{testimonial.content}"
                </p>
                
                {/* Author info */}
                <div className="flex items-center space-x-4 relative z-10">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${testimonial.color} flex items-center justify-center text-white font-bold group-hover:scale-110 group-hover:rotate-12 transition-all duration-500`}>
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">
                      {testimonial.name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <FAQSection />

      {/* Final CTA Section */}
      <section className="relative py-32 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 dark:from-blue-900 dark:via-purple-900 dark:to-pink-900 overflow-hidden" id="final-cta-section" data-scroll>
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-float-delayed"></div>
        </div>

        <div className={`max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 transition-all duration-1000 ${visibleSections.has('final-cta-section') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Ready to Start Your Business?
          </h2>
          <p className="text-xl md:text-2xl text-blue-100 mb-12 leading-relaxed">
            Join thousands of entrepreneurs who have successfully formed their LLCs with OGS Solution.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => onNavigate('get-started')}
              className="group px-10 py-5 bg-white text-blue-600 rounded-2xl hover:bg-blue-50 transition-all font-bold text-lg shadow-2xl hover:shadow-3xl hover:scale-105 inline-flex items-center justify-center space-x-3"
            >
              <span>Get Started Today</span>
              <ArrowRight className="h-6 w-6 group-hover:translate-x-2 transition-transform" />
            </button>
            
            <button
              onClick={() => onNavigate('contact')}
              className="px-10 py-5 bg-white/10 backdrop-blur-md text-white border-2 border-white/30 rounded-2xl hover:bg-white/20 transition-all font-bold text-lg"
            >
              Talk to an Expert
            </button>
          </div>

          {/* Trust badges */}
          <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-white/80">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Secure & Encrypted</span>
            </div>
            <div className="flex items-center space-x-2">
              <Award className="h-5 w-5" />
              <span>A+ Rated Service</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>10,000+ Happy Clients</span>
            </div>
          </div>
        </div>
      </section>

      {/* Animations */}
      <style>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
          opacity: 0;
        }
        
        @keyframes float {
          0%, 100% { 
            transform: translateY(0) translateX(0); 
          }
          50% { 
            transform: translateY(-30px) translateX(15px); 
          }
        }
        
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
        
        @keyframes float-delayed {
          0%, 100% { 
            transform: translateY(0) translateX(0); 
          }
          50% { 
            transform: translateY(30px) translateX(-15px); 
          }
        }
        
        .animate-float-delayed {
          animation: float-delayed 10s ease-in-out infinite;
        }
        
        @keyframes float-slow {
          0%, 100% { 
            transform: translateY(0) translateX(0) scale(1); 
          }
          50% { 
            transform: translateY(-20px) translateX(20px) scale(1.1); 
          }
        }
        
        .animate-float-slow {
          animation: float-slow 12s ease-in-out infinite;
        }
        
        @keyframes shimmer-star {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.1);
          }
        }
        
        .animate-shimmer-star {
          animation: shimmer-star 2s ease-in-out infinite;
        }
        
        @keyframes wiggle {
          0%, 100% {
            transform: rotate(0deg);
          }
          25% {
            transform: rotate(5deg);
          }
          75% {
            transform: rotate(-5deg);
          }
        }
        
        .animate-wiggle {
          animation: wiggle 0.5s ease-in-out;
        }
        
        @keyframes glow-pulse {
          0%, 100% {
            box-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
          }
          50% {
            box-shadow: 0 0 40px rgba(59, 130, 246, 0.8);
          }
        }
        
        .animate-glow-pulse {
          animation: glow-pulse 2s ease-in-out infinite;
        }
        
        @keyframes slide-in-right {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .animate-slide-in-right {
          animation: slide-in-right 0.6s ease-out forwards;
        }
        
        @keyframes gradient-shift {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient-shift 8s ease infinite;
        }
      `}</style>
    </div>
  );
}