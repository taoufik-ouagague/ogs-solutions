import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, HelpCircle, MessageCircle } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: 'What is an LLC?',
    answer:
      'A Limited Liability Company (LLC) is a business structure that combines the flexibility of a partnership with the liability protection of a corporation. It protects your personal assets from business debts and lawsuits.',
  },
  {
    question: 'How long does it take to form an LLC?',
    answer:
      'Processing times vary by package: New Mexico (5-7 business days), Wyoming (3-5 business days), and Colorado (1-2 business days). These times are in addition to state processing times, which vary by location.',
  },
  {
    question: 'Which state should I form my LLC in?',
    answer:
      'Most businesses should form their LLC in the state where they primarily operate. However, Delaware, Wyoming, and Nevada are popular choices for their business-friendly laws. Our AI assistant can help you choose the right state for your needs.',
  },
  {
    question: 'Do I need an EIN for my LLC?',
    answer:
      'An EIN (Employer Identification Number) is required if you have employees, multiple members, or want to open a business bank account. Our Wyoming and Colorado packages include EIN registration.',
  },
  {
    question: 'What is a registered agent?',
    answer:
      'A registered agent is a person or company designated to receive legal documents on behalf of your LLC. Every LLC must have a registered agent in the state where it\'s formed. Our Wyoming and Colorado packages include 1 year of registered agent service.',
  },
  {
    question: 'What are the ongoing requirements for an LLC?',
    answer:
      'LLCs typically need to file annual reports, pay annual fees, and maintain good standing with the state. Requirements vary by state. Our Colorado package includes compliance alerts to help you stay on track.',
  },
  {
    question: 'Can I form an LLC if I\'m not a U.S. citizen?',
    answer:
      'Yes! Non-U.S. citizens and residents can form an LLC in any state. You don\'t need to be a U.S. citizen or have a Social Security Number to start an LLC.',
  },
  {
    question: 'What\'s included in your packages?',
    answer:
      'New Mexico includes essential LLC registration and documents. Wyoming adds EIN registration and registered agent service. Colorado includes everything plus bank account setup assistance and priority support. All packages include expert support and filing services.',
  },
  {
    question: 'Is there a money-back guarantee?',
    answer:
      'Yes! We offer a 100% satisfaction guarantee. If you\'re not completely satisfied with our service, contact us within 60 days for a full refund (excluding state filing fees).',
  },
  {
    question: 'How do I contact support?',
    answer:
      'Our support team is available 24/7 via email (support@ogssolution.com), phone (+212 69 11 81 00 2), or WhatsApp. You can also chat with our AI assistant anytime for instant answers.',
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
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
    
    const scrollElements = document.querySelectorAll('[data-scroll]');
    scrollElements.forEach(el => {
      observer.observe(el);
      observers.push(observer);
    });

    return () => {
      observers.forEach(obs => obs.disconnect());
    };
  }, []);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-24 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 transition-colors" id="faq-section" data-scroll>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className={`text-center mb-16 transition-all duration-1000 ${
          visibleSections.has('faq-section') 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-10'
        }`}>
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400 text-sm font-semibold mb-6">
            <HelpCircle className="h-4 w-4" />
            <span>FAQ</span>
          </div>
          
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Everything you need to know about forming your LLC
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={`group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border-2 border-gray-100 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-xl transition-all duration-500 ${
                visibleSections.has('faq-section')
                  ? 'opacity-100 translate-x-0'
                  : 'opacity-0 -translate-x-10'
              }`}
              style={{ 
                transitionDelay: visibleSections.has('faq-section') 
                  ? `${index * 80 + 300}ms` 
                  : '0ms'
              }}
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 md:px-8 py-6 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <span className="font-bold text-lg text-gray-900 dark:text-white pr-8">
                  {faq.question}
                </span>
                <div className={`flex-shrink-0 transition-all duration-300 ${
                  openIndex === index ? 'rotate-180 scale-110' : 'rotate-0'
                }`}>
                  {openIndex === index ? (
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full">
                      <ChevronUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                  ) : (
                    <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-full group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                      <ChevronDown className="h-5 w-5 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                    </div>
                  )}
                </div>
              </button>
              
              <div className={`overflow-hidden transition-all duration-500 ease-in-out ${
                openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
              }`}>
                <div className="px-6 md:px-8 pb-6">
                  <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg mt-4">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className={`mt-16 text-center transition-all duration-1000 delay-700 ${
          visibleSections.has('faq-section')
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-10'
        }`}>
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-8 border-2 border-blue-100 dark:border-blue-800">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full mb-4">
              <MessageCircle className="h-7 w-7 text-white" />
            </div>
            
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Still have questions?
            </h3>
            <p className="text-lg text-gray-700 dark:text-gray-300">
              Our AI assistant and support team are here to help 24/7.
            </p>
          </div>
        </div>
      </div>

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
      `}</style>
    </section>
  );
}