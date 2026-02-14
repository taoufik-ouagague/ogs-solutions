/**
 * Direct Firestore update script for package_state collection
 * Updates all documents with EXACT correct structure
 */

import { db } from './firebase';
import { collection, doc, setDoc, getDocs, deleteDoc } from 'firebase/firestore';

export async function updatePackageStateFirestore() {
  try {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔄 UPDATING FIRESTORE package_state Collection');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const packageStateRef = collection(db, 'package_state');

    // Step 1: Delete all existing documents
    console.log('Step 1️⃣: Deleting all existing documents...');
    const existingDocs = await getDocs(packageStateRef);
    for (const document of existingDocs.docs) {
      await deleteDoc(doc(db, 'package_state', document.id));
      console.log(`  ❌ Deleted: ${document.id}`);
    }
    console.log(`✅ Deleted ${existingDocs.docs.length} documents\n`);

    // Step 2: Create documents with EXACT correct structure
    console.log('Step 2️⃣: Creating documents with correct structure...\n');

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

    let count = 0;
    for (const state of stateData) {
      // Document ID is the state code (WY, CO, NM, etc.)
      const docRef = doc(db, 'package_state', state.state);
      
      // Exact data structure
      const documentData = {
        state: state.state,
        name: state.name,
        basic_price: state.basic_price,
        epic_price: state.epic_price,
        ultimate_price: state.ultimate_price,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      await setDoc(docRef, documentData);
      count++;

      console.log(`✅ ${count}. Created document: ${state.state}`);
      console.log(`   📋 Data:`);
      console.log(`   ├─ state: "${state.state}"`);
      console.log(`   ├─ name: "${state.name}"`);
      console.log(`   ├─ basic_price: ${state.basic_price}`);
      console.log(`   ├─ epic_price: ${state.epic_price}`);
      console.log(`   └─ ultimate_price: ${state.ultimate_price}\n`);
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ SUCCESS! Firestore updated with correct data');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`\n📊 Summary:`);
    console.log(`   ✅ 8 states updated`);
    console.log(`   ✅ Each with 3 price tiers (basic, epic, ultimate)`);
    console.log(`   ✅ Document IDs: WY, CO, NM, DE, TX, CA, FL, NY\n`);
    console.log('🔄 Refresh your app to see the changes!\n');

    return true;

  } catch (error) {
    console.error('❌ Error updating Firestore:', error);
    throw error;
  }
}
