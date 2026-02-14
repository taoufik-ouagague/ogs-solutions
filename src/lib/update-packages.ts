/**
 * Direct Firestore update script for packages collection
 * Updates all documents with EXACT correct structure
 */

import { db } from './firebase';
import { collection, doc, setDoc, getDocs, deleteDoc } from 'firebase/firestore';

export async function updatePackagesFirestore() {
  try {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔄 UPDATING FIRESTORE packages Collection');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const packagesRef = collection(db, 'packages');

    // Step 1: Delete all existing documents
    console.log('Step 1️⃣: Deleting all existing documents...');
    const existingDocs = await getDocs(packagesRef);
    for (const document of existingDocs.docs) {
      await deleteDoc(doc(db, 'packages', document.id));
      console.log(`  ❌ Deleted: ${document.id}`);
    }
    console.log(`✅ Deleted ${existingDocs.docs.length} documents\n`);

    // Step 2: Create documents with EXACT correct structure
    console.log('Step 2️⃣: Creating 3 package types (Basic, Epic, Ultimate)...\n');

    const packagesData = [
      {
        name: 'Basic',
        price: 890,
        description: 'Essential LLC registration and documents',
        features: [
          'LLC Formation in your state',
          'Business name reservation',
          'Operating agreement template',
          'Filing and processing'
        ],
        is_active: true,
        state_pricing: {
          'WY': 990,
          'CO': 1490,
          'NM': 890,
          'DE': 1290,
          'TX': 1190,
          'CA': 1490,
          'FL': 1090,
          'NY': 1390
        }
      },
      {
        name: 'Epic',
        price: 2490,
        description: 'Everything in Basic plus EIN and registered agent',
        features: [
          'LLC Formation in your state',
          'Business name reservation',
          'Operating agreement template',
          'EIN application assistance',
          'Registered agent service (1 year)',
          'Filing and processing'
        ],
        is_active: true,
        state_pricing: {
          'WY': 2990,
          'CO': 3490,
          'NM': 2490,
          'DE': 2990,
          'TX': 2890,
          'CA': 3290,
          'FL': 2790,
          'NY': 3090
        }
      },
      {
        name: 'Ultimate',
        price: 4490,
        description: 'Complete business setup with maximum support and ongoing compliance assistance',
        features: [
          'LLC Formation in your state',
          'Business name reservation',
          'Operating agreement template',
          'EIN application assistance',
          'Registered agent service (2 years)',
          'Business credit building guidance',
          'Banking setup assistance',
          'Accounting software setup',
          'Quarterly compliance check-ins',
          'Tax planning consultation',
          '24/7 dedicated support line',
          'Annual business review meeting'
        ],
        is_active: true,
        state_pricing: {
          'WY': 4990,
          'CO': 5490,
          'NM': 4490,
          'DE': 4990,
          'TX': 4690,
          'CA': 5090,
          'FL': 4590,
          'NY': 4890
        }
      }
    ];

    let count = 0;
    for (const pkg of packagesData) {
      const newDocRef = doc(packagesRef);
      
      // Exact data structure
      const documentData = {
        name: pkg.name,
        price: pkg.price,
        description: pkg.description,
        features: pkg.features,
        is_active: pkg.is_active,
        state_pricing: pkg.state_pricing,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      await setDoc(newDocRef, documentData);
      count++;

      console.log(`✅ ${count}. Created package: ${pkg.name}`);
      console.log(`   📋 Data:`);
      console.log(`   ├─ name: "${pkg.name}"`);
      console.log(`   ├─ price: ${pkg.price}`);
      console.log(`   ├─ description: "${pkg.description}"`);
      console.log(`   ├─ features: [${pkg.features.length} items]`);
      console.log(`   ├─ is_active: true`);
      console.log(`   └─ state_pricing: 8 states\n`);
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ SUCCESS! Firestore packages updated');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`\n📊 Summary:`);
    console.log(`   ✅ 3 packages created: Basic, Epic, Ultimate`);
    console.log(`   ✅ Each with description, features, and state pricing`);
    console.log(`   ✅ All packages are active (is_active: true)\n`);
    console.log('🔄 Refresh your app to see the changes!\n');

    return true;

  } catch (error) {
    console.error('❌ Error updating Firestore:', error);
    throw error;
  }
}
