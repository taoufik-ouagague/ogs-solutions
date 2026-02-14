/**
 * Migration Setup Instructions
 * 
 * This file contains instructions for migrating Firestore packages to include state-specific pricing.
 * 
 * BEFORE RUNNING: Ensure you have proper Firebase authentication and Firestore access
 */

import { db } from './firebase-types';
import { collection, writeBatch, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';

// State pricing configuration - in DHS (Moroccan Dirham, approximately 1 USD = 10 DHS)
export const STATE_PRICES = {
  Basic: {
    WY: 990,
    CO: 1490,
    NM: 890,
    DE: 1290,
  },
  Epic: {
    WY: 2990,
    CO: 3490,
    NM: 2490,
    DE: 2990,
  },
  Ultimate: {
    WY: 4990,
    CO: 5490,
    NM: 4490,
    DE: 4990,
  },
};

/**
 * Step 1: Update existing packages with state-specific pricing
 * Run this if you already have packages in Firestore
 */
export async function updateExistingPackages() {
  try {
    console.log('Starting package migration...');
    const packagesRef = collection(db, 'packages');
    const snapshot = await getDocs(packagesRef);
    
    if (snapshot.empty) {
      console.warn('No packages found in database. You may need to create them first.');
      return;
    }

    const batch = writeBatch(db);
    let updateCount = 0;

    snapshot.docs.forEach((doc) => {
      const pkg = doc.data();
      const packageName = pkg.name?.trim();
      
      let statePricing = null;
      if (packageName?.toLowerCase() === 'basic') {
        statePricing = STATE_PRICES.Basic;
      } else if (packageName?.toLowerCase() === 'epic') {
        statePricing = STATE_PRICES.Epic;
      } else if (packageName?.toLowerCase() === 'ultimate') {
        statePricing = STATE_PRICES.Ultimate;
      }

      if (statePricing) {
        batch.update(doc.ref, {
          state_pricing: statePricing,
        });
        updateCount++;
        console.log(`Queued update for package: ${packageName}`);
      } else {
        console.warn(`Unknown package name: ${packageName}`);
      }
    });

    await batch.commit();
    console.log(`✓ Successfully updated ${updateCount} packages with state-specific pricing`);
    return true;
  } catch (error) {
    console.error('Error updating packages:', error);
    throw error;
  }
}

/**
 * Step 2: Create new packages from scratch
 * Run this if you don't have any packages in Firestore yet
 */
export async function createNewPackages() {
  try {
    console.log('Creating new packages with state-specific pricing...');
    const packagesRef = collection(db, 'packages');
    
    const packageDefinitions = [
      {
        name: 'Basic',
        price: 890, // Base price (lowest) in DHS
        description: 'Essential LLC registration and documents',
        features: [
          'LLC Formation in your state',
          'Business name reservation',
          'Operating agreement template',
          'Filing and processing',
        ],
        is_active: true,
        state_pricing: STATE_PRICES.Basic,
      },
      {
        name: 'Epic',
        price: 2490, // Base price in DHS
        description: 'Everything in Basic plus EIN and registered agent',
        features: [
          'LLC Formation in your state',
          'Business name reservation',
          'Operating agreement template',
          'EIN application assistance',
          'Registered agent service (1 year)',
          'Filing and processing',
        ],
        is_active: true,
        state_pricing: STATE_PRICES.Epic,
      },
      {
        name: 'Ultimate',
        price: 4490, // Base price in DHS
        description: 'Complete business setup with priority support',
        features: [
          'LLC Formation in your state',
          'Business name reservation',
          'Operating agreement template',
          'EIN application assistance',
          'Registered agent service (1 year)',
          'Bank account setup assistance',
          'Compliance alerts',
          'Priority support',
          'Filing and processing',
        ],
        is_active: true,
        state_pricing: STATE_PRICES.Ultimate,
      },
    ];

    const createdIds: string[] = [];

    for (const pkg of packageDefinitions) {
      const docRef = await addDoc(packagesRef, {
        ...pkg,
        created_at: serverTimestamp(),
      });
      createdIds.push(docRef.id);
      console.log(`✓ Created package: ${pkg.name} (ID: ${docRef.id})`);
    }

    console.log(`\n✓ Successfully created ${createdIds.length} packages`);
    console.log('Package IDs:', createdIds);
    return createdIds;
  } catch (error) {
    console.error('Error creating packages:', error);
    throw error;
  }
}

/**
 * Step 3: Verify migration
 * Run this to check that packages have been properly migrated
 */
export async function verifyMigration() {
  try {
    console.log('Verifying package migration...\n');
    const packagesRef = collection(db, 'packages');
    const snapshot = await getDocs(packagesRef);
    
    if (snapshot.empty) {
      console.warn('No packages found!');
      return false;
    }

    let allValid = true;

    snapshot.docs.forEach((doc) => {
      const pkg = doc.data();
      const hasStatePricing = pkg.state_pricing && Object.keys(pkg.state_pricing).length === 4;
      
      console.log(`\nPackage: ${pkg.name}`);
      console.log(`  ID: ${doc.id}`);
      console.log(`  Base Price: $${pkg.price}`);
      console.log(`  State Pricing:`);
      
      if (pkg.state_pricing) {
        console.log(`    WY: $${pkg.state_pricing.WY}`);
        console.log(`    CO: $${pkg.state_pricing.CO}`);
        console.log(`    NM: $${pkg.state_pricing.NM}`);
        console.log(`    DE: $${pkg.state_pricing.DE}`);
      } else {
        console.warn('  ❌ Missing state_pricing!');
        allValid = false;
      }

      if (!hasStatePricing) {
        allValid = false;
      }
    });

    console.log(`\n${allValid ? '✓ All packages are valid!' : '❌ Some packages are missing state pricing'}`);
    return allValid;
  } catch (error) {
    console.error('Error verifying packages:', error);
    throw error;
  }
}

/**
 * USAGE INSTRUCTIONS:
 * 
 * To run these migrations in your app, follow these steps:
 * 
 * 1. In your Admin Dashboard or a temporary debug page, import and call:
 *    import { createNewPackages, updateExistingPackages, verifyMigration } from '../lib/migrate-setup';
 * 
 * 2. If you have NO packages yet:
 *    - Call: await createNewPackages();
 *    - Then: await verifyMigration();
 * 
 * 3. If you ALREADY have packages:
 *    - Call: await updateExistingPackages();
 *    - Then: await verifyMigration();
 * 
 * 4. Once verified, remove the migration code from your app
 * 
 * Example implementation in a useEffect or button click:
 * 
 *   const handleMigrate = async () => {
 *     try {
 *       const hasExisting = await checkIfPackagesExist();
 *       if (hasExisting) {
 *         await updateExistingPackages();
 *       } else {
 *         await createNewPackages();
 *       }
 *       await verifyMigration();
 *       toast.success('Migration completed successfully!');
 *     } catch (error) {
 *       console.error('Migration failed:', error);
 *       toast.error('Migration failed');
 *     }
 *   };
 */

/**
 * Helper function to check if packages exist
 */
export async function checkIfPackagesExist(): Promise<boolean> {
  try {
    const packagesRef = collection(db, 'packages');
    const snapshot = await getDocs(packagesRef);
    return !snapshot.empty;
  } catch (error) {
    console.error('Error checking packages:', error);
    return false;
  }
}
