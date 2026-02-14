import { Shield, Lock, CheckCircle } from 'lucide-react';
import { useAutoTranslate } from '../contexts/TranslationContext';

export default function SecurityComplianceSection() {
  const { translatedText: securityTitle } = useAutoTranslate('Security & Compliance');
  const { translatedText: securityDesc } = useAutoTranslate('Your data is protected by enterprise-grade security measures and we maintain full compliance with all major data protection standards.');
  const { translatedText: bankEncryption } = useAutoTranslate('Bank-Level Encryption');
  const { translatedText: bankEncryptionDesc } = useAutoTranslate('SSL 256-bit encryption protects all your data in transit and at rest');
  const { translatedText: gdprTitle } = useAutoTranslate('GDPR Compliant');
  const { translatedText: gdprDesc } = useAutoTranslate('Full compliance with General Data Protection Regulation for data privacy');
  const { translatedText: pciTitle } = useAutoTranslate('PCI DSS Certified');
  const { translatedText: pciDesc } = useAutoTranslate('Payment Card Industry Data Security Standard certified for secure transactions');
  const { translatedText: isoTitle } = useAutoTranslate('ISO 27001 Certified');
  const { translatedText: isoDesc } = useAutoTranslate('International standard for information security management');
  const { translatedText: privacyText } = useAutoTranslate('We never share or sell your personal information.');
  const { translatedText: privacyPolicy } = useAutoTranslate('Read our Privacy Policy');
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 border-y border-green-200 dark:border-green-900">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Lock className="h-6 w-6 text-green-600" />
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              {securityTitle}
            </h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {securityDesc}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: bankEncryption, description: bankEncryptionDesc },
            { title: gdprTitle, description: gdprDesc },
            { title: pciTitle, description: pciDesc },
            { title: isoTitle, description: isoDesc },
          ].map((badge, index) => {
            const IconMap = [Lock, Shield, CheckCircle, Shield];
            const Icon = IconMap[index];
            return (
              <a
                key={index}
                href="#"
                className="group p-6 rounded-xl bg-white dark:bg-gray-800 border-2 border-green-200 dark:border-green-800 hover:border-green-500 dark:hover:border-green-600 transition-all duration-300 hover:shadow-lg"
              >
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-lg bg-green-100 dark:bg-green-900/30 group-hover:bg-green-200 dark:group-hover:bg-green-900/50 transition-colors mb-4">
                    <Icon className="h-7 w-7 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                    {badge.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
                    {badge.description}
                  </p>
                </div>
              </a>
            );
          })}
        </div>

        {/* Privacy note */}
        <div className="mt-12 p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-center">
          <p className="text-gray-700 dark:text-gray-300">
            {privacyText}{' '}
            <a href="#privacy" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
              {privacyPolicy}
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
