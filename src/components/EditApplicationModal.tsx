import { useState, useEffect } from 'react';
import { X, Save, Loader } from 'lucide-react';
import { updateDocument, getCollectionData } from '../lib/firebaseUtils';
import { logActivity } from '../lib/activityLog';
import { useAuth } from '../contexts/AuthContext';
import { useAutoTranslate } from '../contexts/TranslationContext';
import { toast } from '../utils/toast';

interface LLCApplication {
  id: string;
  user_id: string;
  package_id: string;
  state: string;
  company_name: string;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  form_data: Record<string, unknown>;
  payment_status: 'pending' | 'completed' | 'failed';
  created_at: string;
  updated_at?: string;
}

interface EditApplicationModalProps {
  application: LLCApplication;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export default function EditApplicationModal({
  application,
  isOpen,
  onClose,
  onSave,
}: EditApplicationModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [availableStates, setAvailableStates] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    company_name: application.company_name || '',
    state: application.state || '',
    memberName: (application.form_data.memberName as string) || '',
    email: (application.form_data.email as string) || '',
    phone: (application.form_data.phone as string) || '',
    address: (application.form_data.address as string) || '',
    city: (application.form_data.city as string) || '',
    zipCode: (application.form_data.zipCode as string) || '',
    businessType: (application.form_data.businessType as string) || '',
    businessPurpose: (application.form_data.businessPurpose as string) || '',
  });

  // Translations
  const { translatedText: editAppTitle } = useAutoTranslate('Edit Application');
  const { translatedText: editAppDesc } = useAutoTranslate('Update your LLC application details');
  const { translatedText: companyInfoHeading } = useAutoTranslate('Company Information');
  const { translatedText: companyNameLabel } = useAutoTranslate('Company Name');
  const { translatedText: companyNamePlaceholder } = useAutoTranslate('Your LLC name');
  const { translatedText: stateLabel } = useAutoTranslate('State');
  const { translatedText: selectStateOption } = useAutoTranslate('Select a state');
  const { translatedText: businessTypeLabel } = useAutoTranslate('Business Type');
  const { translatedText: selectBusinessTypeOption } = useAutoTranslate('Select business type');
  const { translatedText: singleMemberOption } = useAutoTranslate('Single Member LLC');
  const { translatedText: multiMemberOption } = useAutoTranslate('Multi-Member LLC');
  const { translatedText: seriesOption } = useAutoTranslate('Series LLC');
  const { translatedText: contactInfoHeading } = useAutoTranslate('Contact Information');
  const { translatedText: memberNameLabel } = useAutoTranslate('Member Name');
  const { translatedText: fullNamePlaceholder } = useAutoTranslate('Full name');
  const { translatedText: emailLabel } = useAutoTranslate('Email');
  const { translatedText: emailPlaceholder } = useAutoTranslate('email@example.com');
  const { translatedText: phoneLabel } = useAutoTranslate('Phone');
  const { translatedText: phonePlaceholder } = useAutoTranslate('Phone number');
  const { translatedText: addressHeading } = useAutoTranslate('Address');
  const { translatedText: streetAddressLabel } = useAutoTranslate('Street Address');
  const { translatedText: streetAddressPlaceholder } = useAutoTranslate('Street address');
  const { translatedText: cityLabel } = useAutoTranslate('City');
  const { translatedText: zipCodeLabel } = useAutoTranslate('Zip Code');
  const { translatedText: zipCodePlaceholder } = useAutoTranslate('Zip code');
  const { translatedText: businessDetailsHeading } = useAutoTranslate('Business Details');
  const { translatedText: businessPurposeLabel } = useAutoTranslate('Business Purpose');
  const { translatedText: businessPurposePlaceholder } = useAutoTranslate('Describe your business purpose');
  const { translatedText: cancelBtn } = useAutoTranslate('Cancel');
  const { translatedText: saveChangesBtn } = useAutoTranslate('Save Changes');
  const { translatedText: savingBtn } = useAutoTranslate('Saving...');

  useEffect(() => {
    loadAvailableStates();
  }, []);

  const loadAvailableStates = async () => {
    try {
      // Load ONLY states configured in State Pricing Management (package_state collection)
      const configuredStates = await getCollectionData<any>('package_state');
      
      // Map to standard format
      const states = configuredStates.map((state: any) => ({
        code: state.state,
        name: state.name
      }));
      
      setAvailableStates(states);
    } catch (error) {
      console.error('Error loading states:', error);
      // Fallback to empty (no states available)
      setAvailableStates([]);
    }
  };

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    if (!formData.company_name.trim()) {
      toast.error('Company name is required');
      return;
    }
    if (!formData.state) {
      toast.error('State is required');
      return;
    }

    setLoading(true);
    try {
      const success = await updateDocument<LLCApplication>('llc_applications', application.id, {
        company_name: formData.company_name,
        state: formData.state,
        form_data: {
          memberName: formData.memberName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          zipCode: formData.zipCode,
          businessType: formData.businessType,
          businessPurpose: formData.businessPurpose,
        },
      });

      if (success) {
        if (user) {
          await logActivity(
            application.id,
            formData.company_name,
            user.uid,
            user.email || 'unknown',
            'edited',
            {
              company_name: formData.company_name,
              state: formData.state,
            }
          );
        }
        toast.success('Application updated successfully');
        onClose();
        onSave();
      } else {
        toast.error('Failed to update application');
      }
    } catch (error: any) {
      console.error('Error updating application:', error);
      toast.error('Error updating application: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-gradient-to-br from-black/60 via-black/70 to-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-all duration-300 ease-out"
      style={{
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={onClose}
    >
      <div 
        className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-100/20 dark:border-gray-700/30 max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        style={{
          animation: 'slideUp 0.3s ease-out',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <style>{`
          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }
          
          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(20px) scale(0.95);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          @keyframes shimmer {
            0% {
              background-position: -200% 0;
            }
            100% {
              background-position: 200% 0;
            }
          }

          .input-focus-glow:focus {
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          }

          .section-divider {
            position: relative;
            overflow: hidden;
          }

          .section-divider::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 1px;
            background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.3), transparent);
          }

          /* Custom scrollbar */
          .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
          }

          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }

          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(156, 163, 175, 0.3);
            border-radius: 4px;
          }

          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(156, 163, 175, 0.5);
          }

          /* Dark mode scrollbar */
          .dark .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(75, 85, 99, 0.5);
          }

          .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(75, 85, 99, 0.7);
          }
        `}</style>
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-br from-blue-50/30 via-white/40 to-purple-50/30 dark:from-blue-900/10 dark:via-gray-800/40 dark:to-purple-900/10 backdrop-blur-sm">
          <div>
            <h2 className="text-xl font-semibold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              {editAppTitle}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              {editAppDesc}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2.5 hover:bg-white/80 dark:hover:bg-gray-800/80 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group hover:scale-105 active:scale-95 border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
            aria-label="Close modal"
          >
            <X className="h-5 w-5 text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar">
          <div className="space-y-6">
            
            {/* Company Information Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2">
                <div className="w-1 h-5 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 uppercase tracking-wider">
                  {companyInfoHeading}
                </h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Company Name */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    {companyNameLabel} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="company_name"
                    value={formData.company_name}
                    onChange={handleInputChange}
                    disabled={loading}
                    className="w-full px-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 dark:text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed input-focus-glow hover:border-gray-300 dark:hover:border-gray-600 backdrop-blur-sm"
                    placeholder={companyNamePlaceholder}
                  />
                </div>

                {/* State */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    {stateLabel} <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    disabled={loading}
                    className="w-full px-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 dark:text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed input-focus-glow hover:border-gray-300 dark:hover:border-gray-600 backdrop-blur-sm"
                  >
                    <option value="">{selectStateOption}</option>
                    {availableStates.map(state => (
                      <option key={state.code} value={state.code}>
                        {state.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Business Type */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    {businessTypeLabel}
                  </label>
                  <select
                    name="businessType"
                    value={formData.businessType}
                    onChange={handleInputChange}
                    disabled={loading}
                    className="w-full px-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 dark:text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed input-focus-glow hover:border-gray-300 dark:hover:border-gray-600 backdrop-blur-sm"
                  >
                    <option value="">{selectBusinessTypeOption}</option>
                    <option value="single-member">{singleMemberOption}</option>
                    <option value="multi-member">{multiMemberOption}</option>
                    <option value="series">{seriesOption}</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Contact Information Section */}
            <div className="space-y-4 pt-4 section-divider">
              <div className="flex items-center gap-2 pb-2 pt-2">
                <div className="w-1 h-5 bg-gradient-to-b from-green-500 to-green-600 rounded-full"></div>
                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 uppercase tracking-wider">
                  {contactInfoHeading}
                </h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Member Name */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    {memberNameLabel}
                  </label>
                  <input
                    type="text"
                    name="memberName"
                    value={formData.memberName}
                    onChange={handleInputChange}
                    disabled={loading}
                    className="w-full px-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 dark:text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed input-focus-glow hover:border-gray-300 dark:hover:border-gray-600 backdrop-blur-sm"
                    placeholder={fullNamePlaceholder}
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    {emailLabel}
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={loading}
                    autoComplete="email"
                    className="w-full px-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 dark:text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed input-focus-glow hover:border-gray-300 dark:hover:border-gray-600 backdrop-blur-sm"
                    placeholder={emailPlaceholder}
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    {phoneLabel}
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={loading}
                    className="w-full px-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 dark:text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed input-focus-glow hover:border-gray-300 dark:hover:border-gray-600 backdrop-blur-sm"
                    placeholder={phonePlaceholder}
                  />
                </div>
              </div>
            </div>

            {/* Address Section */}
            <div className="space-y-4 pt-4 section-divider">
              <div className="flex items-center gap-2 pb-2 pt-2">
                <div className="w-1 h-5 bg-gradient-to-b from-purple-500 to-purple-600 rounded-full"></div>
                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 uppercase tracking-wider">
                  {addressHeading}
                </h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Street Address */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    {streetAddressLabel}
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    disabled={loading}
                    className="w-full px-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 dark:text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed input-focus-glow hover:border-gray-300 dark:hover:border-gray-600 backdrop-blur-sm"
                    placeholder={streetAddressPlaceholder}
                  />
                </div>

                {/* City */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    {cityLabel}
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    disabled={loading}
                    className="w-full px-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 dark:text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed input-focus-glow hover:border-gray-300 dark:hover:border-gray-600 backdrop-blur-sm"
                    placeholder={cityLabel}
                  />
                </div>

                {/* Zip Code */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    {zipCodeLabel}
                  </label>
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    disabled={loading}
                    className="w-full px-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 dark:text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed input-focus-glow hover:border-gray-300 dark:hover:border-gray-600 backdrop-blur-sm"
                    placeholder={zipCodePlaceholder}
                  />
                </div>
              </div>
            </div>

            {/* Business Purpose Section */}
            <div className="space-y-4 pt-4 section-divider">
              <div className="flex items-center gap-2 pb-2 pt-2">
                <div className="w-1 h-5 bg-gradient-to-b from-orange-500 to-orange-600 rounded-full"></div>
                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 uppercase tracking-wider">
                  {businessDetailsHeading}
                </h3>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  {businessPurposeLabel}
                </label>
                <textarea
                  name="businessPurpose"
                  value={formData.businessPurpose}
                  onChange={handleInputChange}
                  disabled={loading}
                  rows={3}
                  className="w-full px-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 dark:text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed resize-none input-focus-glow hover:border-gray-300 dark:hover:border-gray-600 backdrop-blur-sm"
                  placeholder={businessPurposePlaceholder}
                />
              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-5 border-t border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-t from-gray-50/80 via-white/40 to-transparent dark:from-gray-800/80 dark:via-gray-900/40 backdrop-blur-sm">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-5 py-3 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] hover:shadow-sm"
          >
            {cancelBtn}
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 px-5 py-3 bg-gradient-to-r from-blue-600 via-blue-600 to-blue-700 hover:from-blue-700 hover:via-blue-700 hover:to-blue-800 text-white rounded-xl transition-all duration-200 font-medium inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            {loading ? (
              <>
                <Loader className="h-4 w-4 animate-spin relative z-10" />
                <span className="relative z-10">{savingBtn}</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4 relative z-10" />
                <span className="relative z-10">{saveChangesBtn}</span>
              </>
            )}
          </button>
        </div>
        
      </div>
    </div>
  );
}