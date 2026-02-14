import { Check, X } from 'lucide-react';
import { useAutoTranslate } from '../contexts/TranslationContext';

interface ComparisonItem {
  feature: string;
  diy: boolean | string;
  attorney: boolean | string;
  ogsBasic: boolean | string;
  ogsEpic: boolean | string;
  ogsUltimate: boolean | string;
}

const comparisonData: ComparisonItem[] = [
  {
    feature: 'LLC Registration',
    diy: 'Low cost',
    attorney: 'High cost',
    ogsBasic: true,
    ogsEpic: true,
    ogsUltimate: true,
  },
  {
    feature: 'Time Required',
    diy: '20+ hours',
    attorney: '5-7 hours',
    ogsBasic: '~1 hour',
    ogsEpic: '~1 hour',
    ogsUltimate: '~1 hour',
  },
  {
    feature: 'EIN Registration',
    diy: false,
    attorney: true,
    ogsBasic: false,
    ogsEpic: true,
    ogsUltimate: true,
  },
  {
    feature: 'Registered Agent (1 Year)',
    diy: false,
    attorney: 'Extra cost',
    ogsBasic: false,
    ogsEpic: true,
    ogsUltimate: true,
  },
  {
    feature: 'Bank Account Setup Assist',
    diy: false,
    attorney: false,
    ogsBasic: false,
    ogsEpic: false,
    ogsUltimate: true,
  },
  {
    feature: 'Operating Agreement',
    diy: true,
    attorney: true,
    ogsBasic: true,
    ogsEpic: true,
    ogsUltimate: true,
  },
  {
    feature: 'Expert Support',
    diy: false,
    attorney: true,
    ogsBasic: '24/7',
    ogsEpic: '24/7 + Priority',
    ogsUltimate: '24/7 + VIP',
  },
  {
    feature: 'Money-Back Guarantee',
    diy: false,
    attorney: false,
    ogsBasic: '30 days',
    ogsEpic: '30 days',
    ogsUltimate: '60 days',
  },
  {
    feature: 'Typical Cost',
    diy: '$100-200',
    attorney: '$2,000-5,000',
    ogsBasic: '$890-1,490',
    ogsEpic: '$2,490-3,490',
    ogsUltimate: '$4,490-5,490',
  },
];

export default function PricingComparisonTable() {
  const { translatedText: whyChoose } = useAutoTranslate('Why Choose OGS Solution?');
  const { translatedText: compareDesc } = useAutoTranslate('Compare our service to DIY and traditional attorney options');
  const { translatedText: feature } = useAutoTranslate('Feature');
  const { translatedText: diy } = useAutoTranslate('DIY');
  const { translatedText: attorney } = useAutoTranslate('Attorney');
  const { translatedText: lowCost } = useAutoTranslate('Low cost');
  const { translatedText: highCost } = useAutoTranslate('High cost');
  const { translatedText: timeReq } = useAutoTranslate('Time Required');
  const { translatedText: twentyHours } = useAutoTranslate('20+ hours');
  const { translatedText: fiveHours } = useAutoTranslate('5-7 hours');
  const { translatedText: onlyOne } = useAutoTranslate('~1 hour');
  const { translatedText: basicLabel } = useAutoTranslate('OGS Basic');
  const { translatedText: epicLabel } = useAutoTranslate('OGS Epic');
  const { translatedText: ultimateLabel } = useAutoTranslate('OGS Ultimate');
  const { translatedText: saveTime } = useAutoTranslate('Save time and money compared to DIY or hiring an attorney');
  const { translatedText: getStartedBtn } = useAutoTranslate('Get Started Now');

  const { translatedText: llcReg } = useAutoTranslate('LLC Registration');
  const { translatedText: einReg } = useAutoTranslate('EIN Registration');
  const { translatedText: regAgent } = useAutoTranslate('Registered Agent (1 Year)');
  const { translatedText: bankAssist } = useAutoTranslate('Bank Account Setup Assist');
  const { translatedText: operatingAgreement } = useAutoTranslate('Operating Agreement');
  const { translatedText: expertSupport } = useAutoTranslate('Expert Support');
  const { translatedText: moneyBack } = useAutoTranslate('Money-Back Guarantee');
  const { translatedText: typicalCost } = useAutoTranslate('Typical Cost');
  const { translatedText: extraCost } = useAutoTranslate('Extra cost');
  const { translatedText: priority } = useAutoTranslate('24/7 + Priority');
  const { translatedText: vip } = useAutoTranslate('24/7 + VIP');
  const { translatedText: thirtyDays } = useAutoTranslate('30 days');
  const { translatedText: sixtyDays } = useAutoTranslate('60 days');
  const { translatedText: price1 } = useAutoTranslate('$100-200');
  const { translatedText: price2 } = useAutoTranslate('$2,000-5,000');
  const { translatedText: price3 } = useAutoTranslate('$890-1,490');
  const { translatedText: price4 } = useAutoTranslate('$2,490-3,490');
  const { translatedText: price5 } = useAutoTranslate('$4,490-5,490');
  const { translatedText: support247 } = useAutoTranslate('24/7');

  const translationMap: { [key: string]: string } = {
    'LLC Registration': llcReg,
    'Low cost': lowCost,
    'High cost': highCost,
    'Time Required': timeReq,
    '20+ hours': twentyHours,
    '5-7 hours': fiveHours,
    '~1 hour': onlyOne,
    'EIN Registration': einReg,
    'Registered Agent (1 Year)': regAgent,
    'Extra cost': extraCost,
    'Bank Account Setup Assist': bankAssist,
    'Operating Agreement': operatingAgreement,
    'Expert Support': expertSupport,
    '24/7': support247,
    '24/7 + Priority': priority,
    '24/7 + VIP': vip,
    'Money-Back Guarantee': moneyBack,
    '30 days': thirtyDays,
    '60 days': sixtyDays,
    'Typical Cost': typicalCost,
    '$100-200': price1,
    '$2,000-5,000': price2,
    '$890-1,490': price3,
    '$2,490-3,490': price4,
    '$4,490-5,490': price5,
  };

  const renderCell = (value: boolean | string) => {
    if (typeof value === 'boolean') {
      return value ? (
        <div className="flex justify-center">
          <Check className="h-6 w-6 text-green-500" />
        </div>
      ) : (
        <div className="flex justify-center">
          <X className="h-6 w-6 text-gray-300 dark:text-gray-600" />
        </div>
      );
    }
    return <span className="text-center text-sm font-semibold">{translationMap[value] || value}</span>;
  };

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-800">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {whyChoose}
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            {compareDesc}
          </p>
        </div>

        {/* Mobile scrollable version */}
        <div className="overflow-x-auto lg:hidden rounded-xl border border-gray-200 dark:border-gray-700">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <tr>
                <th className="px-4 py-3 text-left font-bold text-gray-900 dark:text-white">
                  {feature}
                </th>
                <th className="px-4 py-3 text-center font-bold text-gray-700 dark:text-gray-300">
                  {diy}
                </th>
                <th className="px-4 py-3 text-center font-bold text-gray-700 dark:text-gray-300">
                  {attorney}
                </th>
                <th className="px-4 py-3 text-center font-bold bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                  OGS
                </th>
              </tr>
            </thead>
            <tbody>
              {comparisonData.map((row, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">
                    {row.feature}
                  </td>
                  <td className="px-4 py-3">{renderCell(row.diy)}</td>
                  <td className="px-4 py-3">{renderCell(row.attorney)}</td>
                  <td className="px-4 py-3 bg-blue-50 dark:bg-blue-900/20">
                    {renderCell(row.ogsUltimate)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Desktop full comparison */}
        <div className="hidden lg:overflow-x-auto lg:block rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-900 dark:to-gray-800 text-white sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4 text-left font-bold text-lg">{feature}</th>
                <th className="px-6 py-4 text-center font-bold text-lg">{diy}</th>
                <th className="px-6 py-4 text-center font-bold text-lg">{attorney}</th>
                <th className="px-6 py-4 text-center font-bold text-lg bg-blue-600 text-white">
                  {basicLabel}
                </th>
                <th className="px-6 py-4 text-center font-bold text-lg bg-purple-600 text-white">
                  {epicLabel}
                </th>
                <th className="px-6 py-4 text-center font-bold text-lg bg-amber-600 text-white">
                  {ultimateLabel}
                </th>
              </tr>
            </thead>
            <tbody>
              {comparisonData.map((row, index) => (
                <tr
                  key={index}
                  className={`border-b border-gray-200 dark:border-gray-700 ${
                    index % 2 === 0
                      ? 'bg-white dark:bg-gray-800'
                      : 'bg-gray-50 dark:bg-gray-700/50'
                  } hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors`}
                >
                  <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white sticky left-0 bg-inherit z-10">
                    {row.feature}
                  </td>
                  <td className="px-6 py-4">{renderCell(row.diy)}</td>
                  <td className="px-6 py-4">{renderCell(row.attorney)}</td>
                  <td className="px-6 py-4 bg-blue-50 dark:bg-blue-900/10">
                    {renderCell(row.ogsBasic)}
                  </td>
                  <td className="px-6 py-4 bg-purple-50 dark:bg-purple-900/10">
                    {renderCell(row.ogsEpic)}
                  </td>
                  <td className="px-6 py-4 bg-amber-50 dark:bg-amber-900/10">
                    {renderCell(row.ogsUltimate)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {saveTime}
          </p>
          <button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 rounded-lg font-bold text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
            {getStartedBtn}
          </button>
        </div>
      </div>
    </section>
  );
}
