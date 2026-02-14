import { useState } from 'react';
import { X, Copy, Check, AlertCircle, Lock, Truck, CreditCard, RefreshCw } from 'lucide-react';
import { PAYMENT_DETAILS } from '../lib/paymentService';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface CheckoutPageProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: (formData: CheckoutFormData, paymentMethod: string) => void;
  loading?: boolean;
  cartItems: CartItem[];
  subtotal: number;
}

export interface CheckoutFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

export default function CheckoutPage({
  isOpen,
  onClose,
  onConfirm,
  loading = false,
  cartItems,
  subtotal,
}: CheckoutPageProps) {
  const [selectedPayment, setSelectedPayment] = useState<'bank' | 'crypto' | 'cashplus' | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CheckoutFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
  });

  const tax = subtotal * 0.1;
  const shipping = 50;
  const total = subtotal + tax + shipping;

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError('First and last name are required');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!formData.phone.trim()) {
      setError('Phone number is required');
      return false;
    }
    if (!formData.address.trim() || !formData.city.trim() || !formData.postalCode.trim()) {
      setError('Complete address information is required');
      return false;
    }
    if (!selectedPayment) {
      setError('Please select a payment method');
      return false;
    }
    return true;
  };

  const handleConfirm = async () => {
    setError(null);

    if (!validateForm() || !selectedPayment) {
      return;
    }

    setProcessing(true);

    try {
      if (onConfirm) {
        await onConfirm(formData, selectedPayment);
      }
      onClose();
    } catch (err) {
      let errorMessage = 'An error occurred during checkout';
      
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      
      setError(errorMessage);
      console.error('Checkout error:', err);
    } finally {
      setProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden grid grid-cols-1 lg:grid-cols-3">
        {/* Order Summary - Left Column */}
        <div className="lg:col-span-1 border-r border-gray-200 dark:border-gray-700 overflow-y-auto max-h-[90vh] bg-gray-50 dark:bg-gray-900">
          <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Order Summary</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="h-6 w-6 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            {/* Cart Items */}
            <div className="space-y-3">
              {cartItems.map(item => (
                <div key={item.id} className="flex justify-between items-start bg-white dark:bg-gray-800 p-3 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white text-sm">{item.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            {/* Order Totals */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg space-y-3 border border-gray-200 dark:border-gray-700">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                <span className="font-medium text-gray-900 dark:text-white">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Tax (10%)</span>
                <span className="font-medium text-gray-900 dark:text-white">${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                <span className="font-medium text-gray-900 dark:text-white">${shipping.toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-3 flex justify-between">
                <span className="font-bold text-gray-900 dark:text-white">Total</span>
                <span className="font-bold text-lg text-blue-600 dark:text-blue-400">${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Security Badge */}
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex gap-2 items-start">
                <Lock className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <p className="text-blue-800 dark:text-blue-200 text-xs">
                  Secure checkout. Your data is encrypted.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Checkout Form - Middle & Right Columns */}
        <div className="lg:col-span-2 overflow-y-auto max-h-[90vh] flex flex-col">
          <div className="flex-1 p-8 space-y-6">
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-red-700 dark:text-red-300 font-medium">An error occurred while processing your payment</p>
                    <p className="text-red-600 dark:text-red-400 text-sm mt-1">{error}</p>
                    <button
                      onClick={() => setError(null)}
                      className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-900/60 transition-colors text-sm font-medium"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Try Again
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Delivery Information */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Truck className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Delivery Information</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="John"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Doe"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    autoComplete="email"
                    placeholder="john@example.com"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+1 (555) 123-4567"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Address *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="123 Main Street"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="New York"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Postal Code *
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    placeholder="10001"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Payment Method</h3>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Bank Transfer */}
                <div
                  onClick={() => setSelectedPayment('bank')}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedPayment === 'bank'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900 dark:text-white">Bank Transfer</span>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedPayment === 'bank'
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      {selectedPayment === 'bank' && <Check className="h-4 w-4 text-white" />}
                    </div>
                  </div>
                </div>

                {/* Cash Plus */}
                <div
                  onClick={() => setSelectedPayment('cashplus')}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedPayment === 'cashplus'
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900 dark:text-white">Cash Plus</span>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedPayment === 'cashplus'
                          ? 'border-green-500 bg-green-500'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      {selectedPayment === 'cashplus' && <Check className="h-4 w-4 text-white" />}
                    </div>
                  </div>
                </div>

                {/* Crypto */}
                <div
                  onClick={() => setSelectedPayment('crypto')}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedPayment === 'crypto'
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900 dark:text-white">Crypto</span>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedPayment === 'crypto'
                          ? 'border-purple-500 bg-purple-500'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      {selectedPayment === 'crypto' && <Check className="h-4 w-4 text-white" />}
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              {selectedPayment && (
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                  {selectedPayment === 'bank' && (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Bank:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{PAYMENT_DETAILS.bank.bankName}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">Account:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-gray-900 dark:text-white">{PAYMENT_DETAILS.bank.accountNumber}</span>
                          <button
                            onClick={() => handleCopy(PAYMENT_DETAILS.bank.accountNumber, 'bank')}
                            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                          >
                            {copiedField === 'bank' ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4 text-gray-400" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedPayment === 'cashplus' && (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">Merchant Code:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-gray-900 dark:text-white">{PAYMENT_DETAILS.cashplus.merchantCode}</span>
                          <button
                            onClick={() => handleCopy(PAYMENT_DETAILS.cashplus.merchantCode, 'cashplus')}
                            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                          >
                            {copiedField === 'cashplus' ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4 text-gray-400" />
                            )}
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">Phone:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-gray-900 dark:text-white">{PAYMENT_DETAILS.cashplus.phone}</span>
                          <button
                            onClick={() => handleCopy(PAYMENT_DETAILS.cashplus.phone, 'cashplus-phone')}
                            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                          >
                            {copiedField === 'cashplus-phone' ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4 text-gray-400" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedPayment === 'crypto' && (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Network:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{PAYMENT_DETAILS.crypto.network}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">Wallet:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-gray-900 dark:text-white text-xs">{PAYMENT_DETAILS.crypto.walletAddress}</span>
                          <button
                            onClick={() => handleCopy(PAYMENT_DETAILS.crypto.walletAddress, 'crypto')}
                            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded flex-shrink-0"
                          >
                            {copiedField === 'crypto' ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4 text-gray-400" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-white dark:bg-gray-800 flex gap-3">
            <button
              onClick={onClose}
              disabled={processing || loading}
              className="flex-1 px-4 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={processing || loading}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold"
            >
              {processing || loading ? 'Processing...' : 'Complete Purchase'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
