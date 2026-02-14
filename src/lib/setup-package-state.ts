/**
 * One-time setup script to add state-specific package pricing to Firestore
 * Run this ONCE in the browser console or as a temporary component
 * 
 * Copy the entire function and run it, then delete it
 */

import { db } from './firebase-types';
import { collection, doc, setDoc } from 'firebase/firestore';

export async function setupPackageStateOneTime() {
  try {
    console.log('🚀 Starting package_state setup...');
    
    const packageStateRef = collection(db, 'package_state');
    
    const stateData = [
      {
        state: 'WY',
        name: 'Wyoming',
        basic_price: 990,
        epic_price: 2990,
        ultimate_price: 4990
      },
      {
        state: 'CO',
        name: 'Colorado',
        basic_price: 1490,
        epic_price: 3490,
        ultimate_price: 5490
      },
      {
        state: 'NM',
        name: 'New Mexico',
        basic_price: 890,
        epic_price: 2490,
        ultimate_price: 4490
      },
      {
        state: 'DE',
        name: 'Delaware',
        basic_price: 1290,
        epic_price: 2990,
        ultimate_price: 4990
      },
      {
        state: 'TX',
        name: 'Texas',
        basic_price: 1190,
        epic_price: 2890,
        ultimate_price: 4690
      },
      {
        state: 'CA',
        name: 'California',
        basic_price: 1490,
        epic_price: 3290,
        ultimate_price: 5090
      },
      {
        state: 'FL',
        name: 'Florida',
        basic_price: 1090,
        epic_price: 2790,
        ultimate_price: 4590
      },
      {
        state: 'NY',
        name: 'New York',
        basic_price: 1390,
        epic_price: 3090,
        ultimate_price: 4890
      }
    ];

    for (const state of stateData) {
      const docRef = doc(packageStateRef, state.state);
      await setDoc(docRef, {
        state: state.state,
        name: state.name,
        basic_price: state.basic_price,
        epic_price: state.epic_price,
        ultimate_price: state.ultimate_price,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      console.log(`✅ Created pricing for ${state.name} (${state.state})`);
    }

    console.log('\n✅ ALL STATE PRICING CREATED SUCCESSFULLY!');
    return stateData;

  } catch (error) {
    console.error('❌ Error creating package_state:', error);
    throw error;
  }
}

/**
 * USAGE INSTRUCTIONS:
 * 
 * 1. Open your app in the browser
 * 2. Open browser console (F12 or Cmd+Option+I)
 * 3. Paste this into the console:
 *    
 *    import { setupPackageStateOneTime } from './lib/setup-package-state';
 *    await setupPackageStateOneTime();
 * 
 * 4. Wait for the success message
 * 5. Go to Firestore console to verify the package_state was created
 * 6. Delete this file after running it
 */
