import { useState } from 'react';
import { ChevronDown, Lock, MessageCircle, Mail, Clock, AlertCircle, CheckCircle } from 'lucide-react';

interface CheckoutFormData {
  fullName: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  llcName: string;
  state: string;
  termsAccepted: boolean;
  disclaimerAccepted: boolean;
  refundAccepted: boolean;
}

interface CheckoutFormErrors {
  [key: string]: string;
}

const COUNTRIES = [
  'United States',
  'Canada',
  'United Kingdom',
  'Australia',
  'Mexico',
  'Other',
];

const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
  'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
  'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
  'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
  'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
  'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
  'Wisconsin', 'Wyoming',
];

type CheckboxField = 'termsAccepted' | 'disclaimerAccepted' | 'refundAccepted';

interface CheckoutFormPageProps {
  onSubmit?: (formData: CheckoutFormData) => Promise<void>;
  packageName?: string;
  packageIncludes?: string[];
  subtotal?: number;
  onNavigate?: (page: string) => void;
}

export default function CheckoutFormPage({
  onSubmit,
  packageName = 'LLC Formation Package',
  packageIncludes = [
    'LLC Formation in your chosen state',
    'Business name reservation',
    'EIN application assistance',
    'Operating agreement template',
    'Registered agent service (1 year)',
    'Compliance calendar',
  ],
  subtotal = 299,
  onNavigate,
}: CheckoutFormPageProps) {
  const [formData, setFormData] = useState<CheckoutFormData>({
    fullName: '',
    email: '',
    phone: '',
    country: '',
    city: '',
    llcName: '',
    state: '',
    termsAccepted: false,
    disclaimerAccepted: false,
    refundAccepted: false,
  });

  const [errors, setErrors] = useState<CheckoutFormErrors>({});
  const [processing, setProcessing] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  const tax = subtotal * 0.1;
  const shipping = 50;
  const total = subtotal + tax + shipping;

  // Validation functions
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    const digitsOnly = phone.replace(/\D/g, '');
    return digitsOnly.length >= 10;
  };

  const formatPhone = (value: string): string => {
    const digitsOnly = value.replace(/\D/g, '');
    if (digitsOnly.length === 0) return '';
    if (digitsOnly.length <= 3) return digitsOnly;
    if (digitsOnly.length <= 6) return `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3)}`;
    return `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3, 6)}-${digitsOnly.slice(6, 10)}`;
  };

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'fullName':
        if (!value.trim()) return 'Full name is required';
        if (value.trim().length < 2) return 'Full name must be at least 2 characters';
        return '';
      case 'email':
        if (!value.trim()) return 'Email is required';
        if (!validateEmail(value)) return 'Please enter a valid email address';
        return '';
      case 'phone':
        if (!value.trim()) return 'Phone number is required';
        if (!validatePhone(value)) return 'Please enter a valid phone number (min 10 digits)';
        return '';
      case 'country':
        if (!value) return 'Country is required';
        return '';
      case 'city':
        if (!value.trim()) return 'City is required';
        if (value.trim().length < 2) return 'City must be at least 2 characters';
        return '';
      case 'llcName':
        if (!value.trim()) return 'Proposed LLC name is required';
        if (value.trim().length < 3) return 'Proposed LLC name must be at least 3 characters';
        if (value.length > 100) return 'Proposed LLC name must not exceed 100 characters';
        return '';
      case 'state':
        if (formData.country === 'United States' && !value) return 'State is required for US';
        return '';
      default:
        return '';
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let finalValue = value;

    if (name === 'phone') {
      finalValue = formatPhone(value);
    }

    setFormData(prev => {
      const updated: CheckoutFormData = { ...prev };
      (updated as Record<string, any>)[name] = finalValue;
      if (name === 'country') {
        updated.state = '';
      }
      return updated;
    });

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleCheckboxChange = (name: CheckboxField): void => {
    const updates: Record<CheckboxField, boolean> = {
      termsAccepted: formData.termsAccepted,
      disclaimerAccepted: formData.disclaimerAccepted,
      refundAccepted: formData.refundAccepted,
    };
    
    updates[name] = !formData[name];
    
    setFormData(prev => ({
      ...prev,
      ...updates,
    }));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));

    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error,
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: CheckoutFormErrors = {};

    newErrors.fullName = validateField('fullName', formData.fullName);
    newErrors.email = validateField('email', formData.email);
    newErrors.phone = validateField('phone', formData.phone);
    newErrors.country = validateField('country', formData.country);
    newErrors.city = validateField('city', formData.city);
    newErrors.llcName = validateField('llcName', formData.llcName);
    newErrors.state = validateField('state', formData.state);

    if (!formData.termsAccepted) {
      newErrors.termsAccepted = 'You must agree to the Terms & Conditions';
    }
    if (!formData.disclaimerAccepted) {
      newErrors.disclaimerAccepted = 'You must confirm the service disclaimer';
    }

    setErrors(newErrors);
    return Object.values(newErrors).every(e => !e);
  };

  const isFormValid = (): boolean => {
    return (
      !!formData.fullName.trim() &&
      validateEmail(formData.email) &&
      validatePhone(formData.phone) &&
      !!formData.country &&
      !!formData.city.trim() &&
      !!formData.llcName.trim() &&
      (formData.country !== 'United States' || !!formData.state) &&
      formData.termsAccepted &&
      formData.disclaimerAccepted &&
      !processing
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setProcessing(true);

    try {
      if (onSubmit) {
        await onSubmit(formData);
      }
      setSubmitted(true);
    } catch (err) {
      console.error('Checkout error:', err);
      alert('An error occurred. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
        <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg p-8 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            ✓ Order Placed Successfully
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Your confirmation email is on the way to <span className="font-semibold">{formData.email}</span>
          </p>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-6 text-left">
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
              <strong>Next Steps:</strong>
            </p>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>✓ Check your email for login credentials</li>
              <li>✓ We'll begin processing your LLC right away</li>
              <li>✓ You can track progress from your dashboard</li>
            </ul>
          </div>
          <button
            onClick={() => onNavigate?.('home')}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Secure Checkout
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Complete your order securely. All fields marked with * are required.
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* B) CUSTOMER INFORMATION */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                  <span className="w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-bold flex items-center justify-center mr-3">
                    B
                  </span>
                  Customer Information
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                  Where should we send your confirmation?
                </p>

                <div className="space-y-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      placeholder="John Doe"
                      className={`w-full px-4 py-2.5 border-2 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none transition-all ${
                        errors.fullName && touched.fullName
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500'
                      }`}
                    />
                    {errors.fullName && touched.fullName && (
                      <div className="flex items-center gap-2 mt-1 text-red-600 dark:text-red-400 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        {errors.fullName}
                      </div>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      placeholder="john@example.com"
                      className={`w-full px-4 py-2.5 border-2 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none transition-all ${
                        errors.email && touched.email
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500'
                      }`}
                    />
                    {errors.email && touched.email && (
                      <div className="flex items-center gap-2 mt-1 text-red-600 dark:text-red-400 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        {errors.email}
                      </div>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      placeholder="(555) 123-4567"
                      className={`w-full px-4 py-2.5 border-2 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none transition-all ${
                        errors.phone && touched.phone
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500'
                      }`}
                    />
                    {errors.phone && touched.phone && (
                      <div className="flex items-center gap-2 mt-1 text-red-600 dark:text-red-400 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        {errors.phone}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* C) BILLING / LOCATION */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                  <span className="w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-bold flex items-center justify-center mr-3">
                    C
                  </span>
                  Billing & Location
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                  For invoicing and contact purposes
                </p>

                <div className="grid grid-cols-2 gap-4">
                  {/* Country */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Country *
                    </label>
                    <div className="relative">
                      <select
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        className={`w-full px-4 py-2.5 border-2 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white appearance-none focus:outline-none transition-all ${
                          errors.country && touched.country
                            ? 'border-red-500 focus:ring-red-500'
                            : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500'
                        }`}
                      >
                        <option value="">Select your country...</option>
                        {COUNTRIES.map(country => (
                          <option key={country} value={country}>
                            {country}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-3 h-5 w-5 text-gray-400 pointer-events-none" />
                    </div>
                    {errors.country && touched.country && (
                      <div className="flex items-center gap-2 mt-1 text-red-600 dark:text-red-400 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        {errors.country}
                      </div>
                    )}
                  </div>

                  {/* City */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      placeholder="New York"
                      className={`w-full px-4 py-2.5 border-2 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none transition-all ${
                        errors.city && touched.city
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500'
                      }`}
                    />
                    {errors.city && touched.city && (
                      <div className="flex items-center gap-2 mt-1 text-red-600 dark:text-red-400 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        {errors.city}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* D) COMPANY DETAILS */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                  <span className="w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-bold flex items-center justify-center mr-3">
                    D
                  </span>
                  Company Details
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                  Tell us about your LLC
                </p>

                <div className="space-y-4">
                  {/* LLC Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Proposed LLC Name *
                    </label>
                    <input
                      type="text"
                      name="llcName"
                      value={formData.llcName}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      placeholder="My Awesome Business LLC"
                      className={`w-full px-4 py-2.5 border-2 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none transition-all ${
                        errors.llcName && touched.llcName
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500'
                      }`}
                    />
                    {errors.llcName && touched.llcName && (
                      <div className="flex items-center gap-2 mt-1 text-red-600 dark:text-red-400 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        {errors.llcName}
                      </div>
                    )}
                  </div>

                  {/* State (US Only) */}
                  {formData.country === 'United States' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        State *
                      </label>
                      <div className="relative">
                        <select
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                          onBlur={handleBlur}
                          className={`w-full px-4 py-2.5 border-2 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white appearance-none focus:outline-none transition-all ${
                            errors.state && touched.state
                              ? 'border-red-500 focus:ring-red-500'
                              : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500'
                          }`}
                        >
                          <option value="">Select a state...</option>
                          {US_STATES.map(state => (
                            <option key={state} value={state}>
                              {state}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-3 h-5 w-5 text-gray-400 pointer-events-none" />
                      </div>
                      {errors.state && touched.state && (
                        <div className="flex items-center gap-2 mt-1 text-red-600 dark:text-red-400 text-sm">
                          <AlertCircle className="h-4 w-4" />
                          {errors.state}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* E) SERVICE DISCLAIMER */}
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 rounded-lg">
                <div className="flex gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                      Important Service Notice
                    </p>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      This is a professional filing and consulting service. Success and approval depend on your eligibility based on state requirements, 
                      accurate information provided, and official government authority decisions. <strong>We do NOT guarantee approval.</strong> 
                      We provide professional preparation and filing services only.
                    </p>
                  </div>
                </div>
              </div>

              {/* E) LEGAL CHECKBOXES */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                  <span className="w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-bold flex items-center justify-center mr-3">
                    E
                  </span>
                  Agreements
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                  Please review and accept our terms
                </p>

                <div className="space-y-4">
                  {/* Terms & Conditions */}
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      name="termsAccepted"
                      checked={formData.termsAccepted}
                      onChange={() => handleCheckboxChange('termsAccepted')}
                      className="mt-1 w-5 h-5 rounded border-2 border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    />
                    <div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        I agree to the <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">Terms & Conditions</a>
                      </p>
                      {errors.termsAccepted && (
                        <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                          {errors.termsAccepted}
                        </p>
                      )}
                    </div>
                  </label>

                  {/* Service Disclaimer */}
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      name="disclaimerAccepted"
                      checked={formData.disclaimerAccepted}
                      onChange={() => handleCheckboxChange('disclaimerAccepted')}
                      className="mt-1 w-5 h-5 rounded border-2 border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    />
                    <div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        I understand this is a service process. Results are <strong>NOT guaranteed.</strong> 
                        Approval depends on official authorities and your eligibility.
                      </p>
                      {errors.disclaimerAccepted && (
                        <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                          {errors.disclaimerAccepted}
                        </p>
                      )}
                    </div>
                  </label>

                  {/* Refund Policy */}
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      name="refundAccepted"
                      checked={formData.refundAccepted}
                      onChange={() => handleCheckboxChange('refundAccepted')}
                      className="mt-1 w-5 h-5 rounded border-2 border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    />
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      I agree to the <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">Refund Policy</a> (Optional)
                    </p>
                  </label>
                </div>
              </div>

              {/* WHAT HAPPENS NEXT */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                <h3 className="text-sm font-bold text-blue-900 dark:text-blue-200 mb-4">WHAT HAPPENS NEXT?</h3>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                      1
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-200">Pay Securely</p>
                      <p className="text-xs text-blue-700 dark:text-blue-300">Your payment is processed on our secure platform.</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                      2
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-200">Confirmation Email</p>
                      <p className="text-xs text-blue-700 dark:text-blue-300">You'll receive a confirmation within minutes.</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                      3
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-200">Processing Begins</p>
                      <p className="text-xs text-blue-700 dark:text-blue-300">Our team starts processing your LLC immediately after payment.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* F) CTA BUTTON */}
              <button
                type="submit"
                disabled={!isFormValid()}
                className={`w-full py-3 px-4 rounded-lg font-semibold text-lg transition-all ${
                  isFormValid()
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                }`}
              >
                {processing ? 'Processing...' : 'Place Order & Pay'}
              </button>

              {/* Trust Line */}
              <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400 text-sm">
                <Lock className="h-4 w-4" />
                <span>Secure Checkout • Your data is encrypted</span>
              </div>
            </form>
          </div>

          {/* Order Summary - Sticky Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 sticky top-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
                A) Order Summary
              </h2>

              {/* Package Info */}
              <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                  {packageName}
                </h3>
                <ul className="space-y-2">
                  {packageIncludes.map((item, idx) => (
                    <li key={idx} className="flex gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <span className="text-blue-600 dark:text-blue-400 flex-shrink-0">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Tax (10%)</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    ${tax.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Processing Fee</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    ${shipping.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Total */}
              <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-900 dark:text-white">Total</span>
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    ${total.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Refund Policy Link */}
              <a
                href="#"
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                View full refund policy →
              </a>
            </div>

            {/* Support Section */}
            <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">
                Need help?
              </h3>
              <div className="space-y-4">
                <a
                  href="mailto:support@ogssolutions.com"
                  className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <Mail className="h-4 w-4" />
                  <span>support@ogssolutions.com</span>
                </a>
                <a
                  href="https://wa.me/1234567890"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>Chat with us on WhatsApp</span>
                </a>
                <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                  <Clock className="h-4 w-4" />
                  <span>Response: Usually within 1 hour</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
