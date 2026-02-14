/**
 * Automatic initialization hook
 * Checks and initializes packages and package_state collections if missing
 */

import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { updatePackagesFirestore } from '../lib/update-packages';

export function useAutoInitializeCollections() {
  const [initialized, setInitialized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeCollections = async () => {
      try {
        console.log('🔍 Checking collections...\n');

        // Check packages collection
        const packagesRef = collection(db, 'packages');
        const packagesSnapshot = await getDocs(packagesRef);
        console.log(`📦 Packages collection has ${packagesSnapshot.docs.length} documents`);

        let packagesNeedUpdate = false;
        if (packagesSnapshot.empty) {
          packagesNeedUpdate = true;
        } else {
          // Check if packages have state field (new state-specific format)
          // or old format with Basic, Epic, Ultimate names
          const hasStateField = packagesSnapshot.docs.some(doc => doc.data().state);
          const packageNames = packagesSnapshot.docs.map(doc => doc.data().name);
          const hasOldFormat = packageNames.includes('Basic') || packageNames.includes('Epic') || packageNames.includes('Ultimate');
          
          // Only need update if no state field AND old format not found
          if (!hasStateField && !hasOldFormat) {
            packagesNeedUpdate = true;
          }
        }

        if (packagesNeedUpdate) {
          console.log('⚠️ Packages collection needs update!\n');
          console.log('📦 Updating packages with correct structure...\n');
          await updatePackagesFirestore();
          console.log('');
        }

        // Note: package_state collection is deprecated in favor of state-specific packages
        // Each package now has a 'state' field, so we don't need a separate state pricing collection

        if (!packagesNeedUpdate) {
          console.log('✅ All collections are correct!\n');
        }

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✅ Collections initialized successfully!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        setInitialized(true);
        setLoading(false);
      } catch (err: any) {
        console.error('❌ Error during auto-initialization:', err);
        setError(err.message);
        // Still set initialized to true so page doesn't hang
        setInitialized(true);
        setLoading(false);
      }
    };

    initializeCollections();
  }, []);

  return { initialized, loading, error };
}
