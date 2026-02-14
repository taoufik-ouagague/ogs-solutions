import { CheckCircle, RotateCcw, AlertCircle, Trophy } from 'lucide-react';

interface Guarantee {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  description: string;
  details: string[];
}

const guarantees: Guarantee[] = [
  {
    icon: Trophy,
    title: '100% Satisfaction Guarantee',
    description: 'Not happy with our service? Get a full refund.',
    details: [
      'Full refund within 60 days if not satisfied',
      'No questions asked - simple refund process',
      'Excludes state filing and government fees',
      'Risk-free way to try our service',
    ],
  },
  {
    icon: RotateCcw,
    title: 'Free Re-filing Guarantee',
    description: 'State rejection? We handle it for you, free.',
    details: [
      'If state rejects your application, we refile at no cost',
      'Includes all corrections and amendments',
      'Unlimited re-filing attempts',
      'Peace of mind that you\'ll get approved',
    ],
  },
  {
    icon: AlertCircle,
    title: 'Data Security Guarantee',
    description: 'Your information is protected and never sold.',
    details: [
      'Bank-level encryption for all data',
      'GDPR and CCPA compliant',
      'No third-party data sharing',
      'Regular security audits and compliance',
    ],
  },
  {
    icon: CheckCircle,
    title: 'Expert Support Guarantee',
    description: '24/7 support from certified business experts.',
    details: [
      'Response within 2 hours (24/7 availability)',
      'Certified business formation specialists',
      'No automated responses - real people help',
      'Dedicated support for Ultimate package',
    ],
  },
];

export default function GuaranteeSection() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-4">
            <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
              WE GUARANTEE IT
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Risk-Free Guarantees
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Multiple guarantees to protect your investment and ensure your success
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {guarantees.map((guarantee, index) => {
            const Icon = guarantee.icon;
            return (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-2xl p-8 border-2 border-blue-100 dark:border-blue-900 hover:border-blue-500 dark:hover:border-blue-600 transition-all duration-300 hover:shadow-xl"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex-shrink-0">
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {guarantee.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      {guarantee.description}
                    </p>
                  </div>
                </div>

                <ul className="space-y-3 ml-16">
                  {guarantee.details.map((detail, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {detail}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Trust statement */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 md:p-12 text-center text-white border-2 border-blue-400/20">
          <p className="text-lg md:text-xl leading-relaxed">
            We're confident in our service and want you to feel completely secure. Our guarantees show that we stand behind every LLC formation. <span className="font-bold">Start with confidence knowing you're protected.</span>
          </p>
        </div>
      </div>
    </section>
  );
}
