import { useState } from 'react';
import { AlertCircle, CheckCircle, Database, Loader } from 'lucide-react';
import { setupPackageStateOneTime } from '../lib/setup-package-state';

interface SetupPackageStateProps {
  onComplete?: () => void;
}

export default function SetupPackageStateComponent({ onComplete }: SetupPackageStateProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSetup = async () => {
    setLoading(true);
    setMessage('Setting up package_state collection...');
    setError('');
    setSuccess(false);

    try {
      await setupPackageStateOneTime();
      setSuccess(true);
      setMessage('✅ Package state collection initialized successfully!');
      setTimeout(() => {
        onComplete?.();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to setup package_state collection');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-xl border-2 border-blue-200 dark:border-blue-700">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <Database className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            Setup Package State Pricing
          </h3>
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
            Initialize the package_state collection with state-specific pricing data. This should be run once to populate the Firestore database.
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-800 dark:text-green-200">{message}</p>
            </div>
          )}

          {!success && message && (
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg flex items-center space-x-3">
              <Loader className="h-5 w-5 text-blue-600 dark:text-blue-400 animate-spin" />
              <p className="text-sm text-blue-800 dark:text-blue-200">{message}</p>
            </div>
          )}

          <button
            onClick={handleSetup}
            disabled={loading}
            className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold rounded-lg transition-all disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <Loader className="h-5 w-5 animate-spin" />
                <span>Setting up...</span>
              </>
            ) : (
              <>
                <Database className="h-5 w-5" />
                <span>Initialize Package State Data</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
