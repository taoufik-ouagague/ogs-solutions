import { Award, Users, Globe, Building } from 'lucide-react';
import { useAutoTranslate } from '../contexts/TranslationContext';

interface CredibilityItem {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  description: string;
}

export default function CompanyCredibility() {
  // Translate main titles
  const { translatedText: whyTrust } = useAutoTranslate('Why Trust OGS Solution');
  const { translatedText: subtitle } = useAutoTranslate('A team of certified business formation experts with proven track record of success');
  
  // Translate credibility items
  const { translatedText: exp10Years } = useAutoTranslate('10+ Years Experience');
  const { translatedText: expDesc } = useAutoTranslate('Over a decade of expertise in business formation and LLC services');
  const { translatedText: nationwideCov } = useAutoTranslate('Nationwide Coverage');
  const { translatedText: nationwideDesc } = useAutoTranslate('Serving entrepreneurs across Wyoming, Colorado, and New Mexico');
  const { translatedText: indCert } = useAutoTranslate('Industry Certified');
  const { translatedText: indCertDesc } = useAutoTranslate('Team certified by leading business formation and legal organizations');
  const { translatedText: estBiz } = useAutoTranslate('Established Business');
  const { translatedText: estBizDesc } = useAutoTranslate('Registered and in good standing with state business authorities');
  
  // Translate sections
  const { translatedText: aboutSolution } = useAutoTranslate('About OGS Solution');
  const { translatedText: aboutDesc1 } = useAutoTranslate('OGS Solution is a trusted provider of LLC formation services, helping entrepreneurs navigate the complex process of starting their businesses. Our mission is to make business formation simple, affordable, and accessible to everyone.');
  const { translatedText: aboutDesc2 } = useAutoTranslate('Backed by a team of certified business formation specialists and legal experts, we\'ve successfully guided thousands of entrepreneurs through the LLC formation process across multiple states.');
  
  const { translatedText: ourCommit } = useAutoTranslate('Our Commitment');
  const { translatedText: trans100 } = useAutoTranslate('100% Transparency in pricing and process');
  const { translatedText: expertSupport24 } = useAutoTranslate('Expert support available 24/7');
  const { translatedText: moneyBackAll } = useAutoTranslate('Money-back guarantee on all services');
  const { translatedText: latestTech } = useAutoTranslate('Latest technology and compliance standards');
  const { translatedText: provenSuccess } = useAutoTranslate('Proven success with 99%+ approval rate');
  const { translatedText: confData } = useAutoTranslate('Confidentiality and data protection');
  
  // Translate contact section
  const { translatedText: readyLLC } = useAutoTranslate('Ready to start your LLC?');
  const { translatedText: supportLabel } = useAutoTranslate('Support');
  const { translatedText: emailLabel } = useAutoTranslate('Email');
  const { translatedText: chatLabel } = useAutoTranslate('Chat with us on');

  const credibilityItems: CredibilityItem[] = [
    {
      icon: Users,
      title: exp10Years,
      description: expDesc,
    },
    {
      icon: Globe,
      title: nationwideCov,
      description: nationwideDesc,
    },
    {
      icon: Award,
      title: indCert,
      description: indCertDesc,
    },
    {
      icon: Building,
      title: estBiz,
      description: estBizDesc,
    },
  ];

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-950 dark:to-gray-900 text-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">{whyTrust}</h2>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            {subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {credibilityItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 mb-4 shadow-lg">
                  <Icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-gray-300 text-sm">{item.description}</p>
              </div>
            );
          })}
        </div>

        {/* Company info */}
        <div className="bg-blue-600/20 border border-blue-500/30 rounded-2xl p-8 backdrop-blur">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">{aboutSolution}</h3>
              <p className="text-gray-300 mb-4 leading-relaxed">
                {aboutDesc1}
              </p>
              <p className="text-gray-300 leading-relaxed">
                {aboutDesc2}
              </p>
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-6">{ourCommit}</h3>
              <ul className="space-y-3">
                {[
                  trans100,
                  expertSupport24,
                  moneyBackAll,
                  latestTech,
                  provenSuccess,
                  confData,
                ].map((commitment, index) => (
                  <li key={index} className="text-gray-200">
                    ✓ {commitment}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Contact info */}
        <div className="mt-12 text-center border-t border-gray-700 pt-8">
          <p className="text-gray-300 mb-4">{readyLLC}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <div>
              <p className="text-sm text-gray-400">{supportLabel}</p>
              <p className="text-xl font-bold">+212 69 11 81 00 2</p>
            </div>
            <div className="hidden sm:block w-px h-8 bg-gray-600"></div>
            <div>
              <p className="text-sm text-gray-400">{emailLabel}</p>
              <p className="text-xl font-bold">support@ogssolution.com</p>
            </div>
            <div className="hidden sm:block w-px h-8 bg-gray-600"></div>
            <div>
              <p className="text-sm text-gray-400">{chatLabel}</p>
              <p className="text-xl font-bold">WhatsApp</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
