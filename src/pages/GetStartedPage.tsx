import { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Check, MapPin, Building2, User, Sparkles, Package as PackageIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getActivePackages, createDocument } from '../lib/firebaseUtils';
import { US_STATES } from '../utils/constants';
import PaymentModal from '../components/PaymentModal';

interface Package {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  is_active: boolean;
}

interface GetStartedPageProps {
  onNavigate: (page: string) => void;
  selectedPackage?: Package;
}

export default function GetStartedPage({ onNavigate, selectedPackage }: GetStartedPageProps) {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [stepTransition, setStepTransition] = useState(false);

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

  useEffect(() => {
    if (!user) {
      onNavigate('auth');
      return;
    }
    loadPackages();
  }, [user, onNavigate]);

  const loadPackages = async () => {
    const packages = await getActivePackages();
    packages.sort((a, b) => a.price - b.price);
    const validPackages = packages.filter(p => p.id !== undefined).map(p => ({
      ...p,
      id: p.id as string
    }));
    setPackages(validPackages);
  };

  const steps = [
    { id: 1, title: 'State', icon: MapPin, color: 'from-blue-500 to-cyan-500' },
    { id: 2, title: 'Package', icon: PackageIcon, color: 'from-purple-500 to-pink-500' },
    { id: 3, title: 'Business', icon: Building2, color: 'from-green-500 to-emerald-500' },
    { id: 4, title: 'Contact', icon: User, color: 'from-orange-500 to-red-500' },
    { id: 5, title: 'Review', icon: Check, color: 'from-indigo-500 to-purple-500' },
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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

  const handlePaymentConfirm = async () => {
    setLoading(true);
    try {
      const applicationData = {
        user_id: user!.uid,
        package_id: formData.packageId,
        state: formData.state,
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

      const docId = await createDocument('llc_applications', applicationData);

      if (!docId) {
        throw new Error('Failed to create application');
      }

      const whatsappMessage = `Hello! I have completed the payment for my LLC formation application. Here is my application ID: ${docId}. Please find attached the payment receipt.`;
      const whatsappUrl = `https://wa.me/212691181002?text=${encodeURIComponent(whatsappMessage)}`;
      window.open(whatsappUrl, '_blank');

      setShowPaymentModal(false);
      alert('Application submitted successfully! Please send your payment proof via WhatsApp. You will be redirected to dashboard.');
      onNavigate('dashboard');
    } catch (error) {
      console.error('Error submitting application:', error);
      alert('Error submitting application. Please try again.');
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
            <span>Quick & Easy Process</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            Start Your LLC Formation
          </h1>
          <p className="text-xl text-blue-50 max-w-2xl mx-auto">
            Complete the following steps to form your LLC
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
                    Select Your State
                  </h2>
                  <p className="text-lg text-gray-600 dark:text-gray-400">
                    Choose the state where you want to form your LLC
                  </p>
                </div>
                <select
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  className="w-full px-6 py-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all text-lg font-medium"
                >
                  <option value="">Select a state...</option>
                  {US_STATES.map((state) => (
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
                    Choose Your Package
                  </h2>
                  <p className="text-lg text-gray-600 dark:text-gray-400">
                    Select the service package that fits your needs
                  </p>
                </div>
                <div className="space-y-4">
                  {packages.map((pkg) => (
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
                            {pkg.name}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400">
                            {pkg.description}
                          </p>
                        </div>
                        <div className="text-right ml-4">
                          <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            ${pkg.price}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            + state fees
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="animate-fade-in">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mb-4">
                    <Building2 className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                    Business Information
                  </h2>
                  <p className="text-lg text-gray-600 dark:text-gray-400">
                    Tell us about your business
                  </p>
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                      Company Name *
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
                      Business Type *
                    </label>
                    <select
                      value={formData.businessType}
                      onChange={(e) => handleInputChange('businessType', e.target.value)}
                      className="w-full px-6 py-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all"
                    >
                      <option value="single-member">Single-Member LLC</option>
                      <option value="multi-member">Multi-Member LLC</option>
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
                    Contact Information
                  </h2>
                  <p className="text-lg text-gray-600 dark:text-gray-400">
                    How can we reach you?
                  </p>
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                      Full Name *
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
                        Email *
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="w-full px-6 py-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                        Phone *
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
                      Street Address *
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
                        City *
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
                        ZIP Code *
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
                    Review Your Information
                  </h2>
                  <p className="text-lg text-gray-600 dark:text-gray-400">
                    Please review your information before submitting
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-700 dark:to-blue-900/20 p-6 rounded-2xl border border-gray-200 dark:border-gray-600">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-3 flex items-center">
                      <MapPin className="h-5 w-5 mr-2 text-blue-600" />
                      State
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 text-lg">
                      {US_STATES.find(s => s.code === formData.state)?.name}
                    </p>
                  </div>
                  <div className="bg-gradient-to-r from-gray-50 to-purple-50 dark:from-gray-700 dark:to-purple-900/20 p-6 rounded-2xl border border-gray-200 dark:border-gray-600">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-3 flex items-center">
                      <PackageIcon className="h-5 w-5 mr-2 text-purple-600" />
                      Package
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 text-lg">
                      {packages.find(p => p.id === formData.packageId)?.name}
                    </p>
                  </div>
                  <div className="bg-gradient-to-r from-gray-50 to-green-50 dark:from-gray-700 dark:to-green-900/20 p-6 rounded-2xl border border-gray-200 dark:border-gray-600">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-3 flex items-center">
                      <Building2 className="h-5 w-5 mr-2 text-green-600" />
                      Business Details
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
                      Contact Information
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
              <span>Back</span>
            </button>

            {currentStep < steps.length ? (
              <button
                onClick={handleNext}
                disabled={!isStepValid()}
                className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl hover:scale-105"
              >
                <span>Next Step</span>
                <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="group px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl hover:scale-105"
              >
                <span>{loading ? 'Submitting...' : 'Submit Application'}</span>
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