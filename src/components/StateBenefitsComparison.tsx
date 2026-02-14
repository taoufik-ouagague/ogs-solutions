import { useState } from 'react';
import { Shield, DollarSign, Lock, Users, Award, TrendingUp } from 'lucide-react';
import { useAutoTranslate } from '../contexts/TranslationContext';

interface StateBenefit {
  state: string;
  motto: string;
  shortcode: string;
  benefits: {
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    title: string;
    description: string;
  }[];
  color: string;
  borderColor: string;
  bgColor: string;
  price: string;
}

export default function StateBenefitsComparison() {
  const [selectedState, setSelectedState] = useState<string>('Wyoming');
  
  // Translate all UI text
  const { translatedText: compareTitle } = useAutoTranslate('Compare State Benefits');
  const { translatedText: compareDesc } = useAutoTranslate('Each state offers unique advantages for different business needs');
  const { translatedText: chooseBtn } = useAutoTranslate('Choose');
  
  // Wyoming translations
  const { translatedText: wyMottoTrans } = useAutoTranslate('Privacy Powerhouse');
  const { translatedText: ownerPrivacy } = useAutoTranslate('Owner Privacy');
  const { translatedText: ownerPrivacyDesc } = useAutoTranslate('No public disclosure of LLC members - your privacy is protected');
  const { translatedText: taxFlex } = useAutoTranslate('Tax Flexibility');
  const { translatedText: taxFlexDesc } = useAutoTranslate('Choose how your LLC is taxed - none, sole proprietor, or corporate');
  const { translatedText: noDirReq } = useAutoTranslate('No Director Requirements');
  const { translatedText: noDirReqDesc } = useAutoTranslate('No annual meetings required - more operational flexibility');
  const { translatedText: strongLiab } = useAutoTranslate('Strongest Liability Protection');
  const { translatedText: strongLiabDesc } = useAutoTranslate('Comprehensive legal protection for business owner assets');
  
  // Colorado translations
  const { translatedText: coMottoTrans } = useAutoTranslate('Business-Friendly State');
  const { translatedText: techHub } = useAutoTranslate('Growing Tech Hub');
  const { translatedText: techHubDesc } = useAutoTranslate('Home to thousands of thriving startups and tech companies');
  const { translatedText: favTaxClimate } = useAutoTranslate('Favorable Tax Climate');
  const { translatedText: favTaxClimateDesc } = useAutoTranslate('No state income tax on business profits - keep more of your money');
  const { translatedText: strongBizCom } = useAutoTranslate('Strong Business Community');
  const { translatedText: strongBizComDesc } = useAutoTranslate('Access to networking, resources, and investment opportunities');
  const { translatedText: fastProc } = useAutoTranslate('Fast Processing');
  const { translatedText: fastProcDesc } = useAutoTranslate('Quickest turnaround - 1-2 business days for approval');
  
  // New Mexico translations
  const { translatedText: nmMottoTrans } = useAutoTranslate('Budget-Friendly Option');
  const { translatedText: mostAfford } = useAutoTranslate('Most Affordable Filing');
  const { translatedText: mostAffordDesc } = useAutoTranslate('Lowest state filing and annual fees of the three options');
  const { translatedText: strongProt } = useAutoTranslate('Strong Protection');
  const { translatedText: strongProtDesc } = useAutoTranslate('Solid liability protection for business owners and assets');
  const { translatedText: privacyAvail } = useAutoTranslate('Privacy Available');
  const { translatedText: privacyAvailDesc } = useAutoTranslate('Can maintain owner privacy with proper structuring');
  const { translatedText: growingBiz } = useAutoTranslate('Growing Business');
  const { translatedText: growingBizDesc } = useAutoTranslate('Established support systems for new and growing businesses');

  const stateBenefits: StateBenefit[] = [
    {
      state: 'Wyoming',
      motto: wyMottoTrans,
      shortcode: 'WY',
      color: 'from-amber-600 to-orange-600',
      borderColor: 'border-amber-300 dark:border-amber-700',
      bgColor: 'bg-amber-50 dark:bg-amber-900/10',
      price: '$990 - $2,990',
      benefits: [
        {
          icon: Lock,
          title: ownerPrivacy,
          description: ownerPrivacyDesc,
        },
        {
          icon: DollarSign,
          title: taxFlex,
          description: taxFlexDesc,
        },
        {
          icon: Users,
          title: noDirReq,
          description: noDirReqDesc,
        },
        {
          icon: Award,
          title: strongLiab,
          description: strongLiabDesc,
        },
      ],
    },
    {
      state: 'Colorado',
      motto: coMottoTrans,
      shortcode: 'CO',
      color: 'from-blue-600 to-cyan-600',
      borderColor: 'border-blue-300 dark:border-blue-700',
      bgColor: 'bg-blue-50 dark:bg-blue-900/10',
      price: '$1,490 - $5,490',
      benefits: [
        {
          icon: TrendingUp,
          title: techHub,
          description: techHubDesc,
        },
        {
          icon: DollarSign,
          title: favTaxClimate,
          description: favTaxClimateDesc,
        },
        {
          icon: Users,
          title: strongBizCom,
          description: strongBizComDesc,
        },
        {
          icon: Award,
          title: fastProc,
          description: fastProcDesc,
        },
      ],
    },
    {
      state: 'New Mexico',
      motto: nmMottoTrans,
      shortcode: 'NM',
      color: 'from-orange-500 to-red-600',
      borderColor: 'border-orange-300 dark:border-orange-700',
      bgColor: 'bg-orange-50 dark:bg-orange-900/10',
      price: '$890 - $4,490',
      benefits: [
        {
          icon: DollarSign,
          title: mostAfford,
          description: mostAffordDesc,
        },
        {
          icon: Shield,
          title: strongProt,
          description: strongProtDesc,
        },
        {
          icon: Lock,
          title: privacyAvail,
          description: privacyAvailDesc,
        },
        {
          icon: Users,
          title: growingBiz,
          description: growingBizDesc,
        },
      ],
    },
  ];

  const selected = stateBenefits.find((s) => s.state === selectedState);

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            {compareTitle}
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            {compareDesc}
          </p>
        </div>

        {/* State selector buttons */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {stateBenefits.map((state) => (
            <button
              key={state.state}
              onClick={() => setSelectedState(state.state)}
              className={`px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 ${
                selectedState === state.state
                  ? `bg-gradient-to-r ${state.color} text-white shadow-xl`
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {state.state} ({state.shortcode})
            </button>
          ))}
        </div>

        {/* Selected state details */}
        {selected && (
          <div className={`border-2 ${selected.borderColor} ${selected.bgColor} rounded-2xl p-8 md:p-12 mb-12 transition-all duration-300`}>
            <div className="mb-8">
              <h3 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                {selected.state}
              </h3>
              <p className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-4">
                {selected.motto}
              </p>
              <div className={`inline-block bg-gradient-to-r ${selected.color} text-white px-6 py-3 rounded-lg font-bold text-lg`}>
                Starting at {selected.price}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {selected.benefits.map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <div
                    key={index}
                    className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg bg-gradient-to-br ${selected.color} flex-shrink-0`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-white mb-1">
                          {benefit.title}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {benefit.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CTA button */}
            <div className="mt-8 text-center">
              <button className={`bg-gradient-to-r ${selected.color} text-white px-8 py-4 rounded-lg font-bold text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105`}>
                {chooseBtn} {selected.state}
              </button>
            </div>
          </div>
        )}

        {/* Quick comparison at bottom */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stateBenefits.map((state) => (
            <div
              key={state.state}
              className={`border-2 ${state.borderColor} rounded-xl p-6 cursor-pointer transition-all duration-300 hover:shadow-lg ${
                selectedState === state.state
                  ? `${state.bgColor} scale-105`
                  : 'bg-gray-50 dark:bg-gray-800'
              }`}
              onClick={() => setSelectedState(state.state)}
            >
              <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                {state.state}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {state.motto}
              </p>
              <p className={`font-bold bg-gradient-to-r ${state.color} bg-clip-text text-transparent`}>
                {state.price}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}