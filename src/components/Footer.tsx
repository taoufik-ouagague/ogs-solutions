import { Building2, Facebook, Linkedin, Instagram, Mail, Phone } from 'lucide-react';
import { CONTACT_INFO } from '../utils/constants';
import { useAutoTranslate } from '../contexts/TranslationContext';

interface FooterProps {
  onNavigate: (page: string) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  const { translatedText: tagline } = useAutoTranslate('Making LLC formation simple, affordable, and transparent for entrepreneurs nationwide.');
  const { translatedText: servicesHeading } = useAutoTranslate('Services');
  const { translatedText: llcFormation } = useAutoTranslate('LLC Formation');
  const { translatedText: einReg } = useAutoTranslate('EIN Registration');
  const { translatedText: regAgent } = useAutoTranslate('Registered Agent');
  const { translatedText: compliance } = useAutoTranslate('Compliance Services');
  const { translatedText: companyHeading } = useAutoTranslate('Company');
  const { translatedText: aboutUs } = useAutoTranslate('About Us');
  const { translatedText: howItWorks } = useAutoTranslate('How It Works');
  const { translatedText: contactUsLink } = useAutoTranslate('Contact Us');
  const { translatedText: privacyPolicy } = useAutoTranslate('Privacy Policy');
  const { translatedText: contactHeading } = useAutoTranslate('Contact');
  const { translatedText: copyrightText } = useAutoTranslate('OGS Solution. All rights reserved.');
  return (
    <footer className="bg-gray-900 dark:bg-black text-gray-300 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1">
            <div className="flex items-center mb-4">
              <Building2 className="h-8 w-8 text-blue-500" />
              <span className="ml-2 text-xl font-bold text-white">OGS Solution</span>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              {tagline}
            </p>
            <div className="flex space-x-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-500 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-500 transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-500 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">{servicesHeading}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={() => onNavigate('services')}
                  className="hover:text-blue-500 transition-colors"
                >
                  {llcFormation}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('services')}
                  className="hover:text-blue-500 transition-colors"
                >
                  {einReg}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('services')}
                  className="hover:text-blue-500 transition-colors"
                >
                  {regAgent}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('services')}
                  className="hover:text-blue-500 transition-colors"
                >
                  {compliance}
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">{companyHeading}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="hover:text-blue-500 transition-colors"
                >
                  {aboutUs}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('how-it-works')}
                  className="hover:text-blue-500 transition-colors"
                >
                  {howItWorks}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('contact')}
                  className="hover:text-blue-500 transition-colors"
                >
                  {contactUsLink}
                </button>
              </li>
              <li>
                <button className="hover:text-blue-500 transition-colors">
                  {privacyPolicy}
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">{contactHeading}</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start space-x-2">
                <Mail className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <a
                  href={`mailto:${CONTACT_INFO.email}`}
                  className="hover:text-blue-500 transition-colors"
                >
                  {CONTACT_INFO.email}
                </a>
              </li>
              <li className="flex items-start space-x-2">
                <Phone className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <a
                  href={`tel:${CONTACT_INFO.phone}`}
                  className="hover:text-blue-500 transition-colors"
                >
                  {CONTACT_INFO.phone}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} {copyrightText}</p>
        </div>
      </div>
    </footer>
  );
}
