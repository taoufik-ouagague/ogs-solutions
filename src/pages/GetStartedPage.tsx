import { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Check, MapPin, Building2, User, Sparkles, Package as PackageIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getActivePackages, createDocument, getPackagePriceForState, getCollectionData } from '../lib/firebaseUtils';
import { usePackageStatePricing } from '../hooks/usePackageStatePricing';
import { useAutoInitializeCollections } from '../hooks/useAutoInitializeCollections';
import { useAutoTranslate } from '../contexts/TranslationContext';
import { US_STATES } from '../utils/constants';
import { toast } from '../utils/toast';
import PaymentModal from '../components/PaymentModal';

interface Package {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  is_active: boolean;
  state_pricing?: {
    [state: string]: number;
  };
}

interface GetStartedPageProps {
  onNavigate: (page: string) => void;
  selectedPackage?: Package;
}

export default function GetStartedPage({ onNavigate, selectedPackage }: GetStartedPageProps) {
  const { user } = useAuth();
  usePackageStatePricing(); // Hook is used to maintain dependency, though pricing is now embedded in packages
  const { initialized: collectionsInitialized } = useAutoInitializeCollections();
  
  // Translation hooks
  const { translatedText: quickEasyProcess } = useAutoTranslate('Quick & Easy Process');
  const { translatedText: startFormation } = useAutoTranslate('Start Your LLC Formation');
  const { translatedText: completeSteps } = useAutoTranslate('Complete the following steps to form your LLC');
  const { translatedText: selectState } = useAutoTranslate('Select Your State');
  const { translatedText: chooseStateDesc } = useAutoTranslate('Choose the state where you want to form your LLC');
  const { translatedText: selectStateOption } = useAutoTranslate('Select a state...');
  const { translatedText: choosePackage } = useAutoTranslate('Choose Your Package');
  const { translatedText: selectPackageDesc } = useAutoTranslate('Select the service package that fits your needs');
  const { translatedText: loadingPackages } = useAutoTranslate('Loading packages...');
  const { translatedText: selectStateFirst } = useAutoTranslate('Select a state first to view available packages');
  const { translatedText: showingPricesFor } = useAutoTranslate('Showing prices for');
  const { translatedText: forState } = useAutoTranslate('for');
  const { translatedText: perState } = useAutoTranslate('per state');
  const { translatedText: businessInfo } = useAutoTranslate('Business Information');
  const { translatedText: enterBusinessDetails } = useAutoTranslate('Enter your business details');
  const { translatedText: contactInfo } = useAutoTranslate('Contact Information');
  const { translatedText: enterContactDetails } = useAutoTranslate('Enter your contact details');
  const { translatedText: reviewInfo } = useAutoTranslate('Review Your Information');
  const { translatedText: reviewDesc } = useAutoTranslate('Please review your information before submitting');
  const { translatedText: state } = useAutoTranslate('State');
  const { translatedText: packageLabel } = useAutoTranslate('Package');
  const { translatedText: businessStepLabel } = useAutoTranslate('Business');
  const { translatedText: contactStepLabel } = useAutoTranslate('Contact');
  const { translatedText: reviewStepLabel } = useAutoTranslate('Review');
  const { translatedText: businessDetails } = useAutoTranslate('Business Details');
  const { translatedText: features } = useAutoTranslate('Features:');
  const { translatedText: backBtn } = useAutoTranslate('Back');
  const { translatedText: nextStepBtn } = useAutoTranslate('Next Step');
  const { translatedText: submitBtn } = useAutoTranslate('Submit Application');
  const { translatedText: submittingBtn } = useAutoTranslate('Submitting...');
  const { translatedText: companyNameLabel } = useAutoTranslate('Company Name');
  const { translatedText: memberNameLabel } = useAutoTranslate('Member Name');
  const { translatedText: emailLabel } = useAutoTranslate('Email');
  const { translatedText: phoneLabel } = useAutoTranslate('Phone');
  const { translatedText: addressLabel } = useAutoTranslate('Address');
  const { translatedText: cityLabel } = useAutoTranslate('City');
  const { translatedText: zipCodeLabel } = useAutoTranslate('ZIP Code');
  const { translatedText: includedFeatures } = useAutoTranslate('Included Features:');
  const { translatedText: summary } = useAutoTranslate('Summary');
  const { translatedText: totalPrice } = useAutoTranslate('Total Price');
  const { translatedText: basicTier } = useAutoTranslate('Basic');
  const { translatedText: epicTier } = useAutoTranslate('Epic');
  const { translatedText: ultimateTier } = useAutoTranslate('Ultimate');
  const { translatedText: basicDesc } = useAutoTranslate('Essential LLC registration and documents');
  const { translatedText: epicDesc } = useAutoTranslate('Everything in Basic plus EIN and registered agent');
  const { translatedText: ultimateDesc } = useAutoTranslate('Complete business setup with maximum support');
  const { translatedText: packageDetails } = useAutoTranslate('Package Details');
  const { translatedText: businessType } = useAutoTranslate('Business Type');
  const { translatedText: singleMemberLLC } = useAutoTranslate('Single-Member LLC');
  const { translatedText: multiMemberLLC } = useAutoTranslate('Multi-Member LLC');
  const { translatedText: contactInformationLabel } = useAutoTranslate('Contact Information');
  const { translatedText: llcFormation } = useAutoTranslate('LLC Formation in your state');
  const { translatedText: businessNameReservation } = useAutoTranslate('Business name reservation');
  const { translatedText: operatingAgreement } = useAutoTranslate('Operating agreement template');
  const { translatedText: einAssistance } = useAutoTranslate('EIN application assistance');
  const { translatedText: registeredAgentService } = useAutoTranslate('Registered agent service');
  const { translatedText: filingProcessing } = useAutoTranslate('Filing and processing');
  const { translatedText: bankingAssistance } = useAutoTranslate('Banking setup assistance');
  const { translatedText: accountingSoftware } = useAutoTranslate('Accounting software setup');
  const { translatedText: complianceCheckIns } = useAutoTranslate('Quarterly compliance check-ins');
  const { translatedText: taxConsultation } = useAutoTranslate('Tax planning consultation');
  const { translatedText: dedicatedSupport } = useAutoTranslate('24/7 dedicated support line');
  const { translatedText: annualReview } = useAutoTranslate('Annual business review meeting');
  
  const [currentStep, setCurrentStep] = useState(1);
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [stepTransition, setStepTransition] = useState(false);
  const [statePricing, setStatePricing] = useState<any>(null);
  const [availableStates, setAvailableStates] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    state: '',
    packageId: selectedPackage?.id || '',
    companyName: '',
    memberName: '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
    businessType: 'single-member',
    businessPurpose: '',
  });

  // Helper function to translate tier names
  const translateTierName = (englishTier: string): string => {
    switch (englishTier) {
      case 'Basic':
        return basicTier;
      case 'Epic':
        return epicTier;
      case 'Ultimate':
        return ultimateTier;
      default:
        return englishTier;
    }
  };

  useEffect(() => {
    if (!user) {
      onNavigate('auth');
      return;
    }
    // Load packages after collections are initialized
    if (collectionsInitialized) {
      loadPackages();
      loadAvailableStates();
    }
  }, [user, onNavigate, collectionsInitialized]);

  const loadPackages = async () => {
    try {
      console.log('📦 [GetStartedPage] Loading packages...');
      const packages = await getActivePackages();
      console.log('✅ [GetStartedPage] Loaded packages:', packages);
      
      if (packages.length === 0) {
        console.warn('⚠️ [GetStartedPage] No packages found, retrying...');
        setTimeout(() => loadPackages(), 1000);
        return;
      }
      
      packages.sort((a, b) => a.price - b.price);
      const validPackages = packages.filter(p => p.id !== undefined).map(p => ({
        ...p,
        id: p.id as string
      }));
      console.log('✅ [GetStartedPage] Valid packages with names:', validPackages.map(p => p.name));
      console.log('✅ [GetStartedPage] Checking for state_pricing field:', validPackages.map(p => ({ name: p.name, hasStatePricing: !!(p as any).state_pricing })));
      setPackages(validPackages);
    } catch (error) {
      console.error('❌ [GetStartedPage] Error loading packages:', error);
      // Retry after a short delay
      setTimeout(() => loadPackages(), 2000);
    }
  };

  const loadAvailableStates = async () => {
    try {
      console.log('📍 [GetStartedPage] Loading available states from State Pricing Management...');
      // Fetch ONLY states configured in State Pricing Management (package_state collection)
      const configuredStates = await getCollectionData<any>('package_state');
      
      // Map to standard format
      const states = configuredStates.map((state: any) => ({
        code: state.state,
        name: state.name
      }));
      
      console.log('✅ [GetStartedPage] Available states:', states.map((s: any) => `${s.code} - ${s.name}`));
      setAvailableStates(states);
    } catch (error) {
      console.error('❌ [GetStartedPage] Error loading states:', error);
      // Fallback to empty (no states available)
      setAvailableStates([]);
    }
  };
 

  const steps = [
    { id: 1, title: state, icon: MapPin, color: 'from-blue-500 to-cyan-500' },
    { id: 2, title: packageLabel, icon: PackageIcon, color: 'from-purple-500 to-pink-500' },
    { id: 3, title: businessStepLabel, icon: Building2, color: 'from-green-500 to-emerald-500' },
    { id: 4, title: contactStepLabel, icon: User, color: 'from-orange-500 to-red-500' },
    { id: 5, title: reviewStepLabel, icon: Check, color: 'from-indigo-500 to-purple-500' },
  ];

  const getFilteredPackages = () => {
    if (!formData.state) {
      console.log('ℹ️ [getFilteredPackages] No state selected');
      return [];
    }
    
    console.log(`🔄 [getFilteredPackages] Filtering for state: ${formData.state}`);
    
    // First, try to find packages with exact tier names
    const tiers = [
      { name: 'Basic', priceKey: 'basic_price' },
      { name: 'Epic', priceKey: 'epic_price' },
      { name: 'Ultimate', priceKey: 'ultimate_price' }
    ];
    
    // Try to find packages by exact name match
    let adjustedPackages = tiers.map(tier => {
      const basePackage = packages.find(p => p.name === tier.name);
      if (!basePackage) return null;
      
      let price = basePackage.price;
      let priceSource = 'base price';
      
      // Check nested state_pricing field
      const pkg_state_pricing = (basePackage as any).state_pricing;
      if (pkg_state_pricing && pkg_state_pricing[formData.state]) {
        price = pkg_state_pricing[formData.state];
        priceSource = `nested state_pricing[${formData.state}]`;
      }
      // Otherwise, use state pricing from separate collection
      else if (statePricing && statePricing[tier.priceKey]) {
        price = statePricing[tier.priceKey];
        priceSource = `package_state/${formData.state}.${tier.priceKey}`;
      }
      
      console.log(`  ${tier.name}: ${price} DHS (from ${priceSource})`);
      
      return {
        ...basePackage,
        price,
        state: formData.state
      };
    }).filter(pkg => pkg !== null);
    
    // If no packages found by name, but we have state pricing, create virtual packages
    if (adjustedPackages.length === 0 && statePricing) {
      console.log('⚠️ [getFilteredPackages] No named packages found. Creating virtual packages from state pricing...');
      
      adjustedPackages = [
        {
          id: 'basic-virtual',
          name: 'Basic',
          price: statePricing.basic_price,
          description: basicDesc,
          features: [
            llcFormation,
            businessNameReservation,
            operatingAgreement,
            filingProcessing
          ],
          is_active: true,
          state: formData.state
        },
        {
          id: 'epic-virtual',
          name: 'Epic',
          price: statePricing.epic_price,
          description: epicDesc,
          features: [
            llcFormation,
            businessNameReservation,
            operatingAgreement,
            einAssistance,
            `${registeredAgentService} (1 year)`,
            filingProcessing
          ],
          is_active: true,
          state: formData.state
        },
        {
          id: 'ultimate-virtual',
          name: 'Ultimate',
          price: statePricing.ultimate_price,
          description: ultimateDesc,
          features: [
            llcFormation,
            businessNameReservation,
            operatingAgreement,
            einAssistance,
            `${registeredAgentService} (2 years)`,
            'Business credit building guidance',
            bankingAssistance,
            accountingSoftware,
            complianceCheckIns,
            taxConsultation,
            dedicatedSupport,
            annualReview
          ],
          is_active: true,
          state: formData.state
        }
      ];
      
      console.log(`✅ [getFilteredPackages] Created 3 virtual packages from state pricing`);
    }
    
    if (adjustedPackages.length === 0) {
      console.log('❌ [getFilteredPackages] No packages available (no state pricing or named packages found)');
    } else {
      console.log(`✅ [getFilteredPackages] Filtered ${adjustedPackages.length} packages`);
    }
    
    return adjustedPackages.sort((a, b) => a.price - b.price);
  };

  const handleInputChange = (field: string, value: string) => {
    if (field === 'state') {
      // Clear selected package when state changes
      setFormData(prev => ({ ...prev, [field]: value, packageId: '' }));
      // Load state pricing when state is selected
      if (value) {
        console.log(`📍 Selected state: ${value}, loading prices...`);
        loadStatePricing(value);
      }
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const loadStatePricing = async (state: string) => {
    try {
      console.log(`💰 [GetStartedPage] Loading pricing for state: ${state}`);
      const pricing = await getPackagePriceForState(state);
      if (pricing) {
        console.log(`✅ [GetStartedPage] Loaded pricing from package_state/${state}:`, pricing);
        setStatePricing(pricing);
      } else {
        console.log(`⚠️ [GetStartedPage] No pricing found in package_state/${state}, will use nested state_pricing or base prices`);
        setStatePricing(null);
      }
    } catch (error) {
      console.error(`❌ [GetStartedPage] Error loading pricing for ${state}:`, error);
      setStatePricing(null);
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setStepTransition(true);
      setTimeout(() => {
        setCurrentStep(prev => prev + 1);
        setStepTransition(false);
      }, 300);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setStepTransition(true);
      setTimeout(() => {
        setCurrentStep(prev => prev - 1);
        setStepTransition(false);
      }, 300);
    }
  };

  const handleSubmit = async () => {
    setShowPaymentModal(true);
  };

  const getSelectedPackage = () => {
    // Get the package from filtered packages (which have adjusted prices when state is selected)
    const filtered = getFilteredPackages();
    const selected = filtered.find(p => p?.id === formData.packageId);
    return selected || packages.find(p => p.id === formData.packageId);
  };

  const getAmount = (): number => {
    const selectedPkg = getSelectedPackage();
    if (!selectedPkg) return 1000; // Default fallback
    return selectedPkg.price * 100; // Convert to cents
  };

  const handlePaymentConfirm = async () => {
    setLoading(true);
    try {
      console.log('Submitting application with user:', { uid: user?.uid, email: user?.email });
      
      // Get state name from available states or US_STATES
      const stateList = availableStates.length > 0 ? availableStates : US_STATES;
      const selectedStateObj = stateList.find(s => s.code === formData.state);
      const stateName = selectedStateObj?.name || formData.state;
      
      const applicationData = {
        user_id: user!.uid,
        package_id: formData.packageId,
        state: formData.state,
        state_name: stateName,
        company_name: formData.companyName,
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
        status: 'pending',
        payment_status: 'pending',
      };

      console.log('Application data to save:', applicationData);

      const docId = await createDocument('llc_applications', applicationData);

      console.log('Document created with ID:', docId);

      if (!docId) {
        throw new Error('Failed to create application');
      }

      const whatsappMessage = `Hello! I have completed the payment for my LLC formation application. Here is my application ID: ${docId}. Please find attached the payment receipt.`;
      const whatsappUrl = `https://wa.me/212691181002?text=${encodeURIComponent(whatsappMessage)}`;
      window.open(whatsappUrl, '_blank');

      setShowPaymentModal(false);
      toast.success('Application submitted successfully! Redirecting to dashboard...');
      setTimeout(() => onNavigate('dashboard'), 1500);
    } catch (error: any) {
      console.error('Error submitting application:', error);
      toast.error(`Error submitting application: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.state !== '';
      case 2:
        return formData.packageId !== '';
      case 3:
        return formData.companyName && formData.businessPurpose;
      case 4:
        return formData.memberName && formData.email && formData.phone && formData.address && formData.city && formData.zipCode;
      default:
        return true;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 pb-20">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 dark:from-blue-900 dark:via-purple-900 dark:to-pink-900 pt-32 pb-24 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-float-delayed"></div>
        </div>

        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItMnptMCAydjJ6bTAtMnYyem0yIDB2MnptLTIgMHYyem0yIDB2MnptLTIgMHYyem0yIDB2MnptLTIgMHYyem0yIDB2MnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full text-white text-sm font-semibold border border-white/30 mb-6">
            <Sparkles className="h-4 w-4" />
            <span>{quickEasyProcess}</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            {startFormation}
          </h1>
          <p className="text-xl text-blue-50 max-w-2xl mx-auto">
            {completeSteps}
          </p>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z" className="fill-gray-50 dark:fill-gray-900"/>
          </svg>
        </div>
      </section>

      {/* Main Form Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 md:p-10 border border-gray-100 dark:border-gray-700">
          
          {/* Progress Steps */}
          <div className="mb-12">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 ${
                        currentStep > step.id
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg scale-110'
                          : currentStep === step.id
                          ? `bg-gradient-to-r ${step.color} text-white shadow-xl scale-125 animate-pulse-slow`
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      {currentStep > step.id ? (
                        <Check className="h-6 w-6" />
                      ) : (
                        <step.icon className="h-6 w-6" />
                      )}
                      {currentStep === step.id && (
                        <div className={`absolute inset-0 rounded-full bg-gradient-to-r ${step.color} animate-ping opacity-25`}></div>
                      )}
                    </div>
                    <span className={`text-xs mt-3 text-center font-semibold transition-all duration-300 ${
                      currentStep === step.id 
                        ? 'text-blue-600 dark:text-blue-400 scale-110' 
                        : 'text-gray-600 dark:text-gray-400'
                    } hidden sm:block`}>
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`h-1.5 flex-1 mx-2 rounded-full transition-all duration-500 ${
                      currentStep > step.id
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                        : 'bg-gray-200 dark:bg-gray-700'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Form Content */}
          <div className={`min-h-[450px] transition-all duration-300 ${
            stepTransition ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
          }`}>
            {currentStep === 1 && (
              <div className="animate-fade-in">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full mb-4">
                    <MapPin className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                    {selectState}
                  </h2>
                  <p className="text-lg text-gray-600 dark:text-gray-400">
                    {chooseStateDesc}
                  </p>
                </div>
                <select
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  className="w-full px-6 py-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all text-lg font-medium"
                >
                  <option value="">{selectStateOption}</option>
                  {availableStates.map((state) => (
                    <option key={state.code} value={state.code}>
                      {state.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {currentStep === 2 && (
              <div className="animate-fade-in">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-4">
                    <PackageIcon className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                    {choosePackage}
                  </h2>
                  <p className="text-lg text-gray-600 dark:text-gray-400">
                    {selectPackageDesc}
                  </p>
                  {formData.state && (
                    <p className="text-sm text-gray-500 dark:text-gray-300 mt-2">
                      {showingPricesFor} {(availableStates.length > 0 ? availableStates : US_STATES).find(s => s.code === formData.state)?.name}
                    </p>
                  )}
                </div>
                <div className="space-y-4">
                  {!formData.state ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <p>{selectStateFirst}</p>
                    </div>
                  ) : getFilteredPackages().length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <p>{loadingPackages}</p>
                    </div>
                  ) : (
                    getFilteredPackages().map((pkg) => {
                      if (!pkg) return null;
                      const displayPrice = pkg.price;
                      // Extract tier from name (e.g., "Wyoming Basic" -> "Basic")
                      const tier = ['Basic', 'Epic', 'Ultimate'].find(t => pkg.name.includes(t)) || pkg.name;

                      return (
                        <div
                          key={pkg.id}
                          onClick={() => handleInputChange('packageId', pkg.id)}
                          className={`group border-2 rounded-2xl p-6 cursor-pointer transition-all duration-300 ${
                            formData.packageId === pkg.id
                              ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 shadow-xl scale-105'
                              : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-lg hover:scale-102'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                {translateTierName(tier)}
                              </h3>
                              <p className="text-gray-600 dark:text-gray-400">
                                {pkg.description}
                              </p>
                            </div>
                            <div className="text-right ml-4">
                              <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                {displayPrice} DHS
                              </div>
                              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {formData.state ? forState + ' ' + US_STATES.find(s => s.code === formData.state)?.name : perState}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {formData.packageId && (
                  <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border-2 border-blue-200 dark:border-blue-800">
                    <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-4">
                      {packageDetails}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h5 className="font-semibold text-gray-900 dark:text-white mb-3">{includedFeatures}</h5>
                        <ul className="space-y-2">
                          {packages.find(p => p.id === formData.packageId)?.features.map((feature, idx) => (
                            <li key={idx} className="flex items-start text-gray-700 dark:text-gray-300">
                              <span className="text-green-500 mr-3 font-bold text-lg">✓</span>
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl">
                        <h5 className="font-semibold text-gray-900 dark:text-white mb-2">{summary}</h5>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                          {getSelectedPackage()?.description}
                        </p>
                        <div className="p-3 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-lg">
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">{totalPrice}</p>
                          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {getSelectedPackage()?.price} DHS
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {currentStep === 3 && (
              <div className="animate-fade-in">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mb-4">
                    <Building2 className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                    {businessInfo}
                  </h2>
                  <p className="text-lg text-gray-600 dark:text-gray-400">
                    {enterBusinessDetails}
                  </p>
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                      {companyNameLabel} *
                    </label>
                    <input
                      type="text"
                      value={formData.companyName}
                      onChange={(e) => handleInputChange('companyName', e.target.value)}
                      placeholder="e.g., My Business LLC"
                      className="w-full px-6 py-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                      {businessType} *
                    </label>
                    <select
                      value={formData.businessType}
                      onChange={(e) => handleInputChange('businessType', e.target.value)}
                      className="w-full px-6 py-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all"
                    >
                      <option value="single-member">{singleMemberLLC}</option>
                      <option value="multi-member">{multiMemberLLC}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                      Business Purpose *
                    </label>
                    <textarea
                      value={formData.businessPurpose}
                      onChange={(e) => handleInputChange('businessPurpose', e.target.value)}
                      placeholder="Describe what your business will do..."
                      rows={4}
                      className="w-full px-6 py-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all resize-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="animate-fade-in">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mb-4">
                    <User className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                    {contactInfo}
                  </h2>
                  <p className="text-lg text-gray-600 dark:text-gray-400">
                    {enterContactDetails}
                  </p>
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                      {memberNameLabel} *
                    </label>
                    <input
                      type="text"
                      value={formData.memberName}
                      onChange={(e) => handleInputChange('memberName', e.target.value)}
                      className="w-full px-6 py-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                        {emailLabel} *
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        autoComplete="email"
                        className="w-full px-6 py-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                        {phoneLabel} *
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="w-full px-6 py-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                      {addressLabel} *
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className="w-full px-6 py-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                        {cityLabel} *
                      </label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        className="w-full px-6 py-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                        {zipCodeLabel} *
                      </label>
                      <input
                        type="text"
                        value={formData.zipCode}
                        onChange={(e) => handleInputChange('zipCode', e.target.value)}
                        className="w-full px-6 py-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 5 && (
              <div className="animate-fade-in">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full mb-4">
                    <Check className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                    {reviewInfo}
                  </h2>
                  <p className="text-lg text-gray-600 dark:text-gray-400">
                    {reviewDesc}
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-700 dark:to-blue-900/20 p-6 rounded-2xl border border-gray-200 dark:border-gray-600">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-3 flex items-center">
                      <MapPin className="h-5 w-5 mr-2 text-blue-600" />
                      {state}
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 text-lg">
                      {US_STATES.find(s => s.code === formData.state)?.name}
                    </p>
                  </div>
                  <div className="bg-gradient-to-r from-gray-50 to-purple-50 dark:from-gray-700 dark:to-purple-900/20 p-6 rounded-2xl border border-gray-200 dark:border-gray-600">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-3 flex items-center">
                      <PackageIcon className="h-5 w-5 mr-2 text-purple-600" />
                      {packageLabel}
                    </h3>
                    {getSelectedPackage() && (
                      <>
                        <p className="text-gray-700 dark:text-gray-300 text-lg font-semibold">
                          {['Basic', 'Epic', 'Ultimate'].find(t => getSelectedPackage()?.name.includes(t))}
                        </p>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">
                          {getSelectedPackage()?.description}
                        </p>
                        <div className="mt-4">
                          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{features}</h4>
                          <ul className="space-y-1">
                            {getSelectedPackage()?.features.map((feature, idx) => (
                              <li key={idx} className="text-sm text-gray-600 dark:text-gray-400 flex items-start">
                                <span className="text-green-500 mr-2">✓</span>
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="bg-gradient-to-r from-gray-50 to-green-50 dark:from-gray-700 dark:to-green-900/20 p-6 rounded-2xl border border-gray-200 dark:border-gray-600">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-3 flex items-center">
                      <Building2 className="h-5 w-5 mr-2 text-green-600" />
                      {businessDetails}
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300">
                      <strong>Company Name:</strong> {formData.companyName}<br />
                      <strong>Type:</strong> {formData.businessType}<br />
                      <strong>Purpose:</strong> {formData.businessPurpose}
                    </p>
                  </div>
                  <div className="bg-gradient-to-r from-gray-50 to-orange-50 dark:from-gray-700 dark:to-orange-900/20 p-6 rounded-2xl border border-gray-200 dark:border-gray-600">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-3 flex items-center">
                      <User className="h-5 w-5 mr-2 text-orange-600" />
                      {contactInformationLabel}
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300">
                      <strong>Name:</strong> {formData.memberName}<br />
                      <strong>Email:</strong> {formData.email}<br />
                      <strong>Phone:</strong> {formData.phone}<br />
                      <strong>Address:</strong> {formData.address}, {formData.city}, {formData.zipCode}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mt-10 pt-8 border-t-2 border-gray-200 dark:border-gray-700">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className="group px-8 py-4 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 hover:scale-105"
            >
              <ChevronLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
              <span>{backBtn}</span>
            </button>

            {currentStep < steps.length ? (
              <button
                onClick={handleNext}
                disabled={!isStepValid()}
                className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl hover:scale-105"
              >
                <span>{nextStepBtn}</span>
                <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="group px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl hover:scale-105"
              >
                <span>{loading ? submittingBtn : submitBtn}</span>
                <Check className="h-5 w-5 group-hover:scale-110 transition-transform" />
              </button>
            )}
          </div>

          <PaymentModal
            isOpen={showPaymentModal}
            onClose={() => setShowPaymentModal(false)}
            onConfirm={handlePaymentConfirm}
            loading={loading}
            applicationId="pending"
            userId={user?.uid || ''}
            amount={getAmount()}
          />
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
        
        @keyframes float {
          0%, 100% { 
            transform: translateY(0) translateX(0); 
          }
          50% { 
            transform: translateY(-30px) translateX(15px); 
          }
        }
        
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
        
        @keyframes float-delayed {
          0%, 100% { 
            transform: translateY(0) translateX(0); 
          }
          50% { 
            transform: translateY(30px) translateX(-15px); 
          }
        }
        
        .animate-float-delayed {
          animation: float-delayed 10s ease-in-out infinite;
        }
        
        @keyframes pulse-slow {
          0%, 100% { 
            opacity: 1;
            transform: scale(1.25);
          }
          50% { 
            opacity: 0.9;
            transform: scale(1.2);
          }
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 2s ease-in-out infinite;
        }
        
        .hover\:scale-102:hover {
          transform: scale(1.02);
        }
        
        .hover\:scale-105:hover {
          transform: scale(1.05);
        }
      `}</style>
    </div>
  );
}