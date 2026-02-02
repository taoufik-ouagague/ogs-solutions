import { useState } from 'react';
import { X, Copy, Check, AlertCircle, Lock } from 'lucide-react';
import { createPayment, updatePaymentReference, PAYMENT_DETAILS } from '../lib/paymentService';

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
  const [selectedMethod, setSelectedMethod] = useState<'bank' | 'crypto' | 'cashplus' | 'interac' | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentReference, setPaymentReference] = useState('');

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
      // Create payment record in database
      const payment = await createPayment(
        applicationId,
        userId,
        amount,
        selectedMethod
      );

      // Update payment with reference if provided
      if (paymentReference) {
        await updatePaymentReference(payment.id, paymentReference);
      }

      // Call callback if provided
      if (onConfirm) {
        onConfirm(selectedMethod);
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
            {/* Payment Method Cards */}
            {/* Bank CIH */}
            <div
              onClick={() => setSelectedMethod('bank')}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                selectedMethod === 'bank'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Bank Transfer</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">CIH - Direct transfer</p>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedMethod === 'bank'
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                >
                  {selectedMethod === 'bank' && <Check className="h-4 w-4 text-white" />}
                </div>
              </div>
            </div>

            {/* Cash Plus */}
            <div
              onClick={() => setSelectedMethod('cashplus')}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                selectedMethod === 'cashplus'
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Cash Plus</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Mobile money service</p>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedMethod === 'cashplus'
                      ? 'border-green-500 bg-green-500'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                >
                  {selectedMethod === 'cashplus' && <Check className="h-4 w-4 text-white" />}
                </div>
              </div>
            </div>

            {/* Interac e-Transfer */}
            <div
              onClick={() => setSelectedMethod('interac')}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                selectedMethod === 'interac'
                  ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Interac e-Transfer</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Auto-Deposit enabled</p>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedMethod === 'interac'
                      ? 'border-orange-500 bg-orange-500'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                >
                  {selectedMethod === 'interac' && <Check className="h-4 w-4 text-white" />}
                </div>
              </div>
            </div>

            {/* Crypto */}
            <div
              onClick={() => setSelectedMethod('crypto')}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                selectedMethod === 'crypto'
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Cryptocurrency</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">USDT - TRC20 Network</p>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedMethod === 'crypto'
                      ? 'border-purple-500 bg-purple-500'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                >
                  {selectedMethod === 'crypto' && <Check className="h-4 w-4 text-white" />}
                </div>
              </div>
            </div>
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
            {selectedMethod ? (
              <div className="space-y-6">
                {/* Payment Details Header */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Payment Details</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Amount: <span className="font-bold text-gray-900 dark:text-white">{amount.toLocaleString()} MAD</span>
                  </p>
                </div>

                {/* Payment Method Details */}
                {selectedMethod === 'bank' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Account Holder</label>
                      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white font-medium">
                        {PAYMENT_DETAILS.bank.accountHolder}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Bank Name</label>
                      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white font-medium">
                        {PAYMENT_DETAILS.bank.bankName}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Account Number (RIB)</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={PAYMENT_DETAILS.bank.accountNumber}
                          readOnly
                          className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white font-mono text-sm"
                        />
                        <button
                          onClick={() => handleCopy(PAYMENT_DETAILS.bank.accountNumber, 'bank')}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors"
                        >
                          {copiedField === 'bank' ? (
                            <Check className="h-5 w-5 text-green-500" />
                          ) : (
                            <Copy className="h-5 w-5 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Reference (Optional)</label>
                      <textarea
                        placeholder="Enter transfer reference number"
                        value={paymentReference}
                        onChange={(e) => setPaymentReference(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                        rows={2}
                      />
                    </div>
                  </div>
                )}

                {selectedMethod === 'cashplus' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Merchant Code</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={PAYMENT_DETAILS.cashplus.merchantCode}
                          readOnly
                          className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white font-mono text-sm"
                        />
                        <button
                          onClick={() => handleCopy(PAYMENT_DETAILS.cashplus.merchantCode, 'cashplus')}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors"
                        >
                          {copiedField === 'cashplus' ? (
                            <Check className="h-5 w-5 text-green-500" />
                          ) : (
                            <Copy className="h-5 w-5 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone Number</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={PAYMENT_DETAILS.cashplus.phone}
                          readOnly
                          className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white font-mono text-sm"
                        />
                        <button
                          onClick={() => handleCopy(PAYMENT_DETAILS.cashplus.phone, 'cashplus-phone')}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors"
                        >
                          {copiedField === 'cashplus-phone' ? (
                            <Check className="h-5 w-5 text-green-500" />
                          ) : (
                            <Copy className="h-5 w-5 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Receipt Number (Optional)</label>
                      <textarea
                        placeholder="Enter Cash Plus receipt number"
                        value={paymentReference}
                        onChange={(e) => setPaymentReference(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                        rows={2}
                      />
                    </div>
                  </div>
                )}

                {selectedMethod === 'interac' && (
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <p className="text-blue-800 dark:text-blue-200 text-sm">
                        ✓ All transactions are secure and encrypted.
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="email"
                          value={PAYMENT_DETAILS.interac.email}
                          readOnly
                          className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white font-mono text-sm"
                        />
                        <button
                          onClick={() => handleCopy(PAYMENT_DETAILS.interac.email, 'interac-email')}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors flex-shrink-0"
                        >
                          {copiedField === 'interac-email' ? (
                            <Check className="h-5 w-5 text-green-500" />
                          ) : (
                            <Copy className="h-5 w-5 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Reference</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={PAYMENT_DETAILS.interac.reference}
                          readOnly
                          className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white font-mono text-sm"
                        />
                        <button
                          onClick={() => handleCopy(PAYMENT_DETAILS.interac.reference, 'interac-ref')}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors"
                        >
                          {copiedField === 'interac-ref' ? (
                            <Check className="h-5 w-5 text-green-500" />
                          ) : (
                            <Copy className="h-5 w-5 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Amount</label>
                      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white font-medium">
                        {PAYMENT_DETAILS.interac.amount} {PAYMENT_DETAILS.interac.currency}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Auto-Deposit Status</label>
                      <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-700 dark:text-green-400 font-medium">
                        ✓ Enabled - Funds will deposit automatically
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Confirmation Number (Optional)</label>
                      <textarea
                        placeholder="Enter transaction confirmation number"
                        value={paymentReference}
                        onChange={(e) => setPaymentReference(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                        rows={2}
                      />
                    </div>
                  </div>
                )}

                {selectedMethod === 'crypto' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Network</label>
                      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white font-medium">
                        {PAYMENT_DETAILS.crypto.network}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Wallet Address</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={PAYMENT_DETAILS.crypto.walletAddress}
                          readOnly
                          className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white font-mono text-xs"
                        />
                        <button
                          onClick={() => handleCopy(PAYMENT_DETAILS.crypto.walletAddress, 'crypto')}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors flex-shrink-0"
                        >
                          {copiedField === 'crypto' ? (
                            <Check className="h-5 w-5 text-green-500" />
                          ) : (
                            <Copy className="h-5 w-5 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Amount</label>
                      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white font-medium">
                        {PAYMENT_DETAILS.crypto.amount} {PAYMENT_DETAILS.crypto.currency}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Transaction Hash</label>
                      <textarea
                        placeholder="Enter transaction hash / proof of payment"
                        value={paymentReference}
                        onChange={(e) => setPaymentReference(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                        rows={2}
                      />
                    </div>
                  </div>
                )}
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
              disabled={processing || loading}
              className="flex-1 px-4 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selectedMethod || processing || loading}
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
