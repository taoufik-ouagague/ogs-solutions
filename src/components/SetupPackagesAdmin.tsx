/**
 * Temporary Setup Component
 * 
 * Add this component temporarily to your app (e.g., in App.tsx or create a route)
 * to run the package setup, then remove it
 */

import { useState } from 'react';
import { createNewPackages, verifyMigration } from '../lib/migrate-setup';
import { AlertCircle, CheckCircle, Loader } from 'lucide-react';

export default function SetupPackagesAdmin() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<'success' | 'error' | null>(null);
  const [message, setMessage] = useState('');
  const [verifying, setVerifying] = useState(false);

  const handleSetupPackages = async () => {
    setLoading(true);
    setResult(null);
    setMessage('');

    try {
      console.log('🚀 Starting package migration...');
      
      // Use the migration command from migrate-setup.ts
      const createdIds = await createNewPackages();
      
      setResult('success');
      setMessage(`✅ All 3 packages created successfully!\n\nIDs:\n${createdIds.join('\n')}\n\nYou can now delete this component.`);
      console.log('Success! Refresh Firestore console to see the packages.');

    } catch (error) {
      setResult('error');
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setMessage(`❌ Error: ${errorMsg}`);
      console.error('Error creating packages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyMigration = async () => {
    setVerifying(true);
    try {
      console.log('🔍 Verifying packages...');
      const isValid = await verifyMigration();
      
      if (isValid) {
        setMessage('✅ Migration verified! All packages are correct.');
      } else {
        setMessage('⚠️ Some packages are missing state pricing.');
      }
    } catch (error) {
      setMessage(`❌ Verification error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 text-center">
          📦 Setup Packages
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
          Initialize Firestore with 3 pricing packages (Basic, Epic, Ultimate) with state-specific pricing
        </p>

        <div className="space-y-4">
          <button
            onClick={handleSetupPackages}
            disabled={loading || verifying}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <Loader className="h-5 w-5 animate-spin" />
                <span>Creating Packages...</span>
              </>
            ) : (
              <span>🚀 Run Migration Command</span>
            )}
          </button>

          <button
            onClick={handleVerifyMigration}
            disabled={loading || verifying}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            {verifying ? (
              <>
                <Loader className="h-5 w-5 animate-spin" />
                <span>Verifying...</span>
              </>
            ) : (
              <span>✓ Verify Migration</span>
            )}
          </button>

          {result === 'success' && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-green-900 dark:text-green-200 mb-1">Success!</h3>
                  <p className="text-sm text-green-700 dark:text-green-300 whitespace-pre-wrap">
                    {message}
                  </p>
                </div>
              </div>
            </div>
          )}

          {result === 'error' && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-red-900 dark:text-red-200 mb-1">Error</h3>
                  <p className="text-sm text-red-700 dark:text-red-300 whitespace-pre-wrap">
                    {message}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-xs text-blue-900 dark:text-blue-200">
            <strong>Packages to create (DHS):</strong>
            <br />• Basic: 890-1,490 DHS
            <br />• Epic: 2,490-3,490 DHS
            <br />• Ultimate: 4,490-5,490 DHS
            <br /><br />
            <strong>States:</strong> WY, CO, NM, DE
          </p>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
          After creation, delete this component from your app
        </p>
      </div>
    </div>
  );
}
