import { X, FileText, Download } from 'lucide-react';

interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  packageType: 'basic' | 'epic' | 'ultimate';
}

const documents = {
  basic: [
    {
      name: 'Certificate of Formation',
      description: 'Official state document confirming your LLC is registered',
      preview: 'Certificate_of_Formation_Example.pdf',
    },
    {
      name: 'Operating Agreement',
      description: 'Internal rules governing your LLC operations and member rights',
      preview: 'Operating_Agreement_Example.pdf',
    },
    {
      name: 'Business Tax ID Notice (EIN)',
      description: 'Your Employer Identification Number from the IRS',
      preview: 'EIN_Notice_Example.pdf',
    },
  ],
  epic: [
    {
      name: 'Certificate of Formation',
      description: 'Official state document confirming your LLC is registered',
      preview: 'Certificate_of_Formation_Example.pdf',
    },
    {
      name: 'Operating Agreement (Customized)',
      description: 'Detailed internal rules tailored to your business structure',
      preview: 'Operating_Agreement_Customized_Example.pdf',
    },
    {
      name: 'Business Tax ID Notice (EIN)',
      description: 'Your Employer Identification Number from the IRS',
      preview: 'EIN_Notice_Example.pdf',
    },
    {
      name: 'Registered Agent Appointment',
      description: 'Confirmation of your registered agent service (1 year)',
      preview: 'Registered_Agent_Appointment_Example.pdf',
    },
    {
      name: 'Bank Account Setup Guide',
      description: 'Step-by-step instructions for opening a business bank account',
      preview: 'Bank_Account_Setup_Guide_Example.pdf',
    },
  ],
  ultimate: [
    {
      name: 'Certificate of Formation',
      description: 'Official state document confirming your LLC is registered',
      preview: 'Certificate_of_Formation_Example.pdf',
    },
    {
      name: 'Operating Agreement (Full Custom)',
      description: 'Comprehensive agreement fully customized for your business',
      preview: 'Operating_Agreement_Custom_Example.pdf',
    },
    {
      name: 'Business Tax ID Notice (EIN)',
      description: 'Your Employer Identification Number from the IRS',
      preview: 'EIN_Notice_Example.pdf',
    },
    {
      name: 'Registered Agent Appointment',
      description: 'Confirmation of your registered agent service (1 year)',
      preview: 'Registered_Agent_Appointment_Example.pdf',
    },
    {
      name: 'Bank Account Setup Guide & Support',
      description: 'Personalized assistance with bank account opening',
      preview: 'Bank_Account_Setup_Guide_Example.pdf',
    },
    {
      name: 'Tax Planning Document',
      description: 'Guide to tax implications and optimization strategies',
      preview: 'Tax_Planning_Document_Example.pdf',
    },
    {
      name: 'Compliance Checklist',
      description: 'Annual compliance requirements and filing deadlines',
      preview: 'Compliance_Checklist_Example.pdf',
    },
    {
      name: 'First-Year Business Plan Template',
      description: 'Planning template to structure your first year of operations',
      preview: 'Business_Plan_Template_Example.pdf',
    },
  ],
};

export default function DocumentPreviewModal({
  isOpen,
  onClose,
  packageType,
}: DocumentPreviewModalProps) {
  const docs = documents[packageType];
  const packageTitle =
    packageType.charAt(0).toUpperCase() + packageType.slice(1);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-96 overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {packageTitle} Package Documents
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
              Here's exactly what you'll receive
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        {/* Document list */}
        <div className="p-6 space-y-4">
          {docs.map((doc, index) => (
            <div
              key={index}
              className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 transition-all cursor-pointer group"
            >
              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors mt-1">
                  <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {doc.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {doc.description}
                  </p>
                </div>
                <Download className="h-5 w-5 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mt-1" />
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Total documents: <span className="font-bold">{docs.length}</span>
          </p>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
          >
            Got it, let's proceed
          </button>
        </div>
      </div>
    </div>
  );
}
