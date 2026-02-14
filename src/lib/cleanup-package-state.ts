/**
 * Cleanup and fix package_state collection
 */

import { db } from './firebase';
import { collection, getDocs, deleteDoc, doc, setDoc } from 'firebase/firestore';

export async function cleanupAndFixPackageState() {
  try {
    console.log('🧹 Cleaning up package_state collection...');
    
    // Delete all existing documents
    const packageStateRef = collection(db, 'package_state');
    const snapshot = await getDocs(packageStateRef);
    
    console.log(`Found ${snapshot.docs.length} documents to delete`);
    for (const document of snapshot.docs) {
      await deleteDoc(doc(db, 'package_state', document.id));
      console.log(`❌ Deleted: ${document.id}`);
    }

    console.log('✅ Cleanup complete. Creating correct structure...\n');

    // Create documents with correct structure using state codes as document IDs
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
      // Use state code as document ID
      const docRef = doc(db, 'package_state', state.state);
      await setDoc(docRef, {
        state: state.state,
        name: state.name,
        basic_price: state.basic_price,
        epic_price: state.epic_price,
        ultimate_price: state.ultimate_price,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      console.log(`✅ Created: ${state.state}`);
      console.log(`   state: "${state.state}"`);
      console.log(`   name: "${state.name}"`);
      console.log(`   basic_price: ${state.basic_price}`);
      console.log(`   epic_price: ${state.epic_price}`);
      console.log(`   ultimate_price: ${state.ultimate_price}\n`);
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ PACKAGE_STATE COLLECTION FIXED!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('All 8 states now have correct structure:');
    console.log('WY, CO, NM, DE, TX, CA, FL, NY');
    return true;

  } catch (error) {
    console.error('❌ Error during cleanup and fix:', error);
    throw error;
  }
}

