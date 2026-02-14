import { useEffect, useState } from 'react';
import { Users, CheckCircle, Zap, TrendingUp } from 'lucide-react';
import { useAutoTranslate } from '../contexts/TranslationContext';

interface SocialProofProps {
  isVisible: boolean;
}

export default function SocialProofSection({ isVisible }: SocialProofProps) {
  const { translatedText: llcsFormedLabel } = useAutoTranslate('LLCs Formed');
  const { translatedText: successRateLabel } = useAutoTranslate('Success Rate');
  const { translatedText: satisfactionLabel } = useAutoTranslate('Customer Satisfaction');
  const { translatedText: statesLabel } = useAutoTranslate('States Supported');
  const [counts, setCounts] = useState({
    llcsFormed: 0,
    successRate: 0,
    satisfactionRate: 0,
    statesServed: 0,
  });

  useEffect(() => {
    if (!isVisible) return;

    const targets = {
      llcsFormed: 2847,
      successRate: 99,
      satisfactionRate: 98,
      statesServed: 3,
    };

    const duration = 2000; // 2 seconds
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      setCounts({
        llcsFormed: Math.floor(targets.llcsFormed * progress),
        successRate: Math.floor(targets.successRate * progress),
        satisfactionRate: Math.floor(targets.satisfactionRate * progress),
        statesServed: Math.floor(targets.statesServed * progress),
      });

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isVisible]);

  const stats = [
    {
      icon: Users,
      value: `${counts.llcsFormed}+`,
      label: llcsFormedLabel,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/10',
    },
    {
      icon: CheckCircle,
      value: `${counts.successRate}%`,
      label: successRateLabel,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50 dark:bg-green-900/10',
    },
    {
      icon: TrendingUp,
      value: `${counts.satisfactionRate}%`,
      label: satisfactionLabel,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/10',
    },
    {
      icon: Zap,
      value: `${counts.statesServed}`,
      label: statesLabel,
      color: 'from-amber-500 to-orange-500',
      bgColor: 'bg-amber-50 dark:bg-amber-900/10',
    },
  ];

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className={`${stat.bgColor} rounded-2xl p-8 text-center border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 transform hover:scale-105`}
              >
                <div className={`bg-gradient-to-r ${stat.color} p-4 rounded-xl w-fit mx-auto mb-4 shadow-lg`}>
                  <Icon className="h-8 w-8 text-white" />
                </div>
                <p className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </p>
                <p className="text-gray-700 dark:text-gray-400 font-semibold">{stat.label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
