import { useState, useEffect } from 'react';
import { X, Copy, Check, AlertCircle, Lock, Loader } from 'lucide-react';
import { createPayment, updatePaymentReference, PAYMENT_DETAILS } from '../lib/paymentService';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface PaymentMethod {
  id: string;
  name: string;
  type: 'bank' | 'crypto' | 'cashplus';
  details: Record<string, string>;
  logo?: string;
  active?: boolean;
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: (paymentMethod: string) => void;
  loading: boolean;
  applicationId: string;
  userId: string;
  amount?: number;
}

export default function PaymentModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  loading,
  applicationId,
  userId,
  amount = 1000
}: PaymentModalProps) {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentReference, setPaymentReference] = useState('');
  const [loadingMethods, setLoadingMethods] = useState(true);

  // Load payment methods from Firestore
  useEffect(() => {
    if (isOpen) {
      loadPaymentMethodsData();
    }
  }, [isOpen]);

  const loadPaymentMethodsData = async () => {
    try {
      setLoadingMethods(true);
      const querySnapshot = await getDocs(collection(db, 'payment_methods'));
      const methods = querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as PaymentMethod))
        .filter(m => m.active !== false);
      
      setPaymentMethods(methods.length > 0 ? methods : getDefaultPaymentMethods());
    } catch (error) {
      console.error('Error loading payment methods:', error);
      // Fallback to default payment methods
      setPaymentMethods(getDefaultPaymentMethods());
    } finally {
      setLoadingMethods(false);
    }
  };

  const getDefaultPaymentMethods = (): PaymentMethod[] => {
    return [
      {
        id: 'default-bank',
        name: PAYMENT_DETAILS.bank.bankName,
        type: 'bank',
        details: {
          accountHolder: PAYMENT_DETAILS.bank.accountHolder,
          bankName: PAYMENT_DETAILS.bank.bankName,
          accountNumber: PAYMENT_DETAILS.bank.accountNumber
        }
      },
      {
        id: 'default-crypto',
        name: 'Cryptocurrency (USDT)',
        type: 'crypto',
        details: {
          walletAddress: PAYMENT_DETAILS.crypto.walletAddress,
          network: PAYMENT_DETAILS.crypto.network,
          currency: PAYMENT_DETAILS.crypto.currency
        }
      },
      {
        id: 'default-cashplus',
        name: 'Cash Plus',
        type: 'cashplus',
        details: {
          merchantCode: PAYMENT_DETAILS.cashplus.merchantCode,
          phone: PAYMENT_DETAILS.cashplus.phone,
          currency: PAYMENT_DETAILS.cashplus.currency
        }
      }
    ];
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleConfirm = async () => {
    if (!selectedMethod) return;

    setProcessing(true);
    setError(null);

    try {
      const selectedPaymentMethod = paymentMethods.find(m => m.id === selectedMethod);
      if (!selectedPaymentMethod) {
        throw new Error('Payment method not found');
      }

      // Map to legacy payment type
      const paymentType = selectedPaymentMethod.type;

      // Create payment record in database
      const payment = await createPayment(
        applicationId,
        userId,
        amount,
        paymentType
      );

      // Update payment with reference if provided
      if (paymentReference) {
        await updatePaymentReference(payment.id, paymentReference);
      }

      // Call callback if provided
      if (onConfirm) {
        onConfirm(paymentType);
      }

      // Close modal
      onClose();
    } catch (err) {
      let errorMessage = 'An error occurred while processing your payment';
      
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      
      setError(errorMessage);
      console.error('Payment error:', err);
    } finally {
      setProcessing(false);
    }
  };

  if (!isOpen) return null;

  const selected = selectedMethod ? paymentMethods.find(m => m.id === selectedMethod) : null;
  const TYPE_ICONS: Record<string, string> = {
    bank: '💳',
    crypto: '🟣',
    cashplus: '🟢'
  };

  const TYPE_LABELS: Record<string, string> = {
    bank: 'Bank Transfer',
    crypto: 'Cryptocurrency',
    cashplus: 'Cash Plus (Mobile Money)'
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden grid grid-cols-1 lg:grid-cols-2">
        {/* Left Side - Payment Methods */}
        <div className="border-r border-gray-200 dark:border-gray-700 overflow-y-auto max-h-[90vh]">
          {/* Header */}
          <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Checkout
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="h-6 w-6 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex gap-3 mb-4">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-red-700 dark:text-red-300 font-medium">An error occurred while processing your payment</p>
                {error && error !== 'An error occurred while processing your payment' && (
                  <p className="text-red-600 dark:text-red-400 text-sm mt-1">{error}</p>
                )}
              </div>
            </div>
          )}

          <div className="p-6 space-y-4">
            {loadingMethods ? (
              <div className="flex items-center justify-center py-12">
                <Loader className="h-6 w-6 text-blue-600 dark:text-blue-400 animate-spin" />
              </div>
            ) : paymentMethods.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">No payment methods available</p>
              </div>
            ) : (
              paymentMethods.map(method => (
                <div
                  key={method.id}
                  onClick={() => setSelectedMethod(method.id)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedMethod === method.id
                      ? `border-blue-500 bg-blue-50 dark:bg-blue-900/20`
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 flex items-center gap-3">
                      {method.logo ? (
                        <img src={method.logo} alt={method.name} className="h-10 object-contain flex-shrink-0" />
                      ) : (
                        <span className="text-2xl">{TYPE_ICONS[method.type]}</span>
                      )}
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {method.name}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {TYPE_LABELS[method.type]}
                        </p>
                      </div>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        selectedMethod === method.id
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      {selectedMethod === method.id && <Check className="h-4 w-4 text-white" />}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Security Notice */}
          <div className="px-6 pb-6">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex gap-3">
                <Lock className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <p className="text-blue-800 dark:text-blue-200 text-sm">
                  All transactions are secure and encrypted.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Payment Details */}
        <div className="overflow-y-auto max-h-[90vh] flex flex-col">
          <div className="flex-1 p-6">
            {loadingMethods ? (
              <div className="flex items-center justify-center h-full">
                <Loader className="h-6 w-6 text-blue-600 dark:text-blue-400 animate-spin" />
              </div>
            ) : selected ? (
              <div className="space-y-6">
                {/* Dynamic Payment Method Details */}
                <div className="space-y-4">
                  {Object.entries(selected.details).map(([key, value]) => {
                    // Skip amount field
                    if (key === 'amount') return null;
                    
                    // Generate label from key
                    const fieldLabel = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
                    
                    if (key === 'accountNumber' || key === 'walletAddress') {
                      return (
                        <div key={key}>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{fieldLabel}</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={value}
                              readOnly
                              className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white font-mono text-sm"
                            />
                            <button
                              onClick={() => handleCopy(value, key)}
                              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors"
                            >
                              {copiedField === key ? (
                                <Check className="h-5 w-5 text-green-500" />
                              ) : (
                                <Copy className="h-5 w-5 text-gray-400" />
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    } else if (key === 'phone' || key === 'merchantCode') {
                      return (
                        <div key={key}>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{fieldLabel}</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={value}
                              readOnly
                              className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white font-mono text-sm"
                            />
                            <button
                              onClick={() => handleCopy(value, key)}
                              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors"
                            >
                              {copiedField === key ? (
                                <Check className="h-5 w-5 text-green-500" />
                              ) : (
                                <Copy className="h-5 w-5 text-gray-400" />
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    } else {
                      return (
                        <div key={key}>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{fieldLabel}</label>
                          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white font-medium break-all">
                            {value}
                          </div>
                        </div>
                      );
                    }
                  })}
                </div>

                {/* Reference Field (shown for most payment methods) */}
                {selected.type === 'bank' || selected.type === 'cashplus' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {selected.type === 'bank' ? 'Reference (Optional)' : 'Receipt Number (Optional)'}
                    </label>
                    <textarea
                      placeholder={selected.type === 'bank' ? 'Enter transfer reference number' : 'Enter Cash Plus receipt number'}
                      value={paymentReference}
                      onChange={(e) => setPaymentReference(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                      rows={2}
                    />
                  </div>
                ) : selected.type === 'crypto' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Transaction Hash / Proof</label>
                    <textarea
                      placeholder="Enter transaction hash or proof of payment"
                      value={paymentReference}
                      onChange={(e) => setPaymentReference(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                      rows={2}
                    />
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <p className="text-gray-500 dark:text-gray-400 mb-2">Select a payment method</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500">to view payment details</p>
                </div>
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-6 flex gap-3">
            <button
              onClick={onClose}
              disabled={processing || loading || loadingMethods}
              className="flex-1 px-4 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selectedMethod || processing || loading || loadingMethods}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold"
            >
              {processing || loading ? 'Processing...' : 'Continue to Payment'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
