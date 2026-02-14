import { CheckCircle, Clock } from 'lucide-react';
import { useAutoTranslate } from '../contexts/TranslationContext';

interface ProcessStep {
  number: number;
  title: string;
  description: string;
  duration: string;
  icon: string;
}

export default function ProcessTimeline() {
  const { translatedText: simpleProcess } = useAutoTranslate('Simple 4-Step Process');
  const { translatedText: fromSubmission } = useAutoTranslate('From submission to receiving your LLC documents');
  const { translatedText: submitInfo } = useAutoTranslate('Submit Information');
  const { translatedText: submitDesc } = useAutoTranslate('Fill out a simple form with your business details');
  const { translatedText: tenMin } = useAutoTranslate('10 minutes');
  const { translatedText: expertReview } = useAutoTranslate('Expert Review');
  const { translatedText: expertDesc } = useAutoTranslate('Our team reviews and verifies your information');
  const { translatedText: twoHours } = useAutoTranslate('2 hours');
  const { translatedText: fileWithState } = useAutoTranslate('File with State');
  const { translatedText: fileDesc } = useAutoTranslate('We file your LLC formation documents');
  const { translatedText: fileDuration } = useAutoTranslate('WY: 1-2 days\nCO: 1-2 days\nNM: 5-7 days');
  const { translatedText: receiveDocs } = useAutoTranslate('Receive Documents');
  const { translatedText: receiveDesc } = useAutoTranslate('Get your Certificate of Formation and documents');
  const { translatedText: twoBizDays } = useAutoTranslate('2-3 business days');
  const { translatedText: satisfactionTitle } = useAutoTranslate('100% Satisfaction Guaranteed');
  const { translatedText: satisfactionDesc } = useAutoTranslate('If your application is rejected by the state, we\'ll refile for free. Not satisfied? 30-day full refund (excluding state fees).');

  const steps: ProcessStep[] = [
    {
      number: 1,
      title: submitInfo,
      description: submitDesc,
      duration: tenMin,
      icon: '📝',
    },
    {
      number: 2,
      title: expertReview,
      description: expertDesc,
      duration: twoHours,
      icon: '👁️',
    },
    {
      number: 3,
      title: fileWithState,
      description: fileDesc,
      duration: fileDuration,
      icon: '📋',
    },
    {
      number: 4,
      title: receiveDocs,
      description: receiveDesc,
      duration: twoBizDays,
      icon: '📦',
    },
  ];
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900/20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {simpleProcess}
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            {fromSubmission}
          </p>
        </div>

        <div className="relative">
          {/* Timeline line */}
          <div className="hidden lg:block absolute top-24 left-0 right-0 h-1 bg-gradient-to-r from-blue-300 via-blue-500 to-blue-300 dark:from-blue-600 dark:via-blue-400 dark:to-blue-600"></div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
            {steps.map((step, index) => (
              <div key={index} className="flex flex-col items-center">
                {/* Step circle */}
                <div className="relative mb-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-shadow border-4 border-white dark:border-gray-800">
                    <span className="text-3xl">{step.icon}</span>
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
                    {step.number}
                  </div>
                </div>

                {/* Step content */}
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                    {step.description}
                  </p>
                  <div className="flex items-center justify-center gap-1 text-blue-600 dark:text-blue-400 text-sm font-semibold">
                    <Clock className="h-4 w-4" />
                    <span>{step.duration}</span>
                  </div>
                </div>

                {/* Arrow to next step (hidden on last) */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute -right-4 top-24 text-blue-400">
                    <svg
                      className="w-8 h-8"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom guarantee */}
        <div className="mt-16 p-8 bg-white dark:bg-gray-800 rounded-2xl border-2 border-green-500 dark:border-green-600 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{satisfactionTitle}</h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {satisfactionDesc}
          </p>
        </div>
      </div>
    </section>
  );
}
