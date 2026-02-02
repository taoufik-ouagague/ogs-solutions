import { useState, useEffect } from 'react';
import { Check, X, Clock, AlertCircle } from 'lucide-react';
import { Payment, verifyPayment, getPendingPayments } from '../lib/paymentService';

interface PaymentVerificationPanelProps {
  applicationId?: string;
}

export default function PaymentVerificationPanel({ applicationId }: PaymentVerificationPanelProps) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPendingPayments();
      // Filter by application if provided
      const filtered = applicationId ? data.filter(p => p.application_id === applicationId) : data;
      setPayments(filtered);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load payments';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPayment = async (paymentId: string) => {
    setVerifying(paymentId);
    setError(null);
    setSuccess(null);
    try {
      await verifyPayment(paymentId);
      setSuccess('Payment verified successfully!');
      setPayments(payments.filter(p => p.id !== paymentId));
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to verify payment';
      setError(message);
    } finally {
      setVerifying(null);
    }
  };

  const getMethodBadgeColor = (method: string) => {
    switch (method) {
      case 'bank':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
      case 'crypto':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300';
      case 'cashplus':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      default:
        return 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300';
    }
  };

  const getMethodLabel = (method: string) => {
    switch (method) {
      case 'bank':
        return 'Bank Transfer (CIH)';
      case 'crypto':
        return 'Cryptocurrency';
      case 'cashplus':
        return 'Cash Plus';
      default:
        return method;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-700 dark:text-red-300 font-medium">Error</p>
            <p className="text-red-600 dark:text-red-200 text-sm">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex gap-3">
          <Check className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
          <p className="text-green-700 dark:text-green-300">{success}</p>
        </div>
      )}

      {payments.length === 0 ? (
        <div className="p-8 text-center">
          <Clock className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-600 dark:text-gray-400">No pending payments to verify</p>
        </div>
      ) : (
        <div className="space-y-3">
          {payments.map((payment) => (
            <div
              key={payment.id}
              className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {payment.amount.toLocaleString()} {payment.currency}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Payment ID: {payment.id.substring(0, 8)}...
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getMethodBadgeColor(payment.method)}`}>
                  {getMethodLabel(payment.method)}
                </span>
              </div>

              {payment.payment_reference && (
                <div className="mb-3 p-2 bg-gray-50 dark:bg-gray-700/50 rounded text-sm">
                  <p className="text-gray-600 dark:text-gray-400">Reference:</p>
                  <p className="font-mono text-gray-900 dark:text-white break-all">
                    {payment.payment_reference}
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => handleVerifyPayment(payment.id)}
                  disabled={verifying === payment.id}
                  className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
                >
                  <Check className="h-4 w-4" />
                  {verifying === payment.id ? 'Verifying...' : 'Verify Payment'}
                </button>
                <button
                  className="px-3 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition-colors flex items-center justify-center"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                Submitted: {new Date(payment.created_at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={loadPayments}
        disabled={loading}
        className="w-full px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition-colors disabled:opacity-50"
      >
        Refresh
      </button>
    </div>
  );
}
