/**
 * One-time setup script to add packages to Firestore
 * Run this ONCE in the browser console or as a temporary component
 * 
 * Copy the entire function and run it, then delete it
 */

import { db } from './firebase-types';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export async function setupPackagesOneTime() {
  try {
    console.log('🚀 Starting package setup...');
    
    const packagesRef = collection(db, 'packages');
    
    const packages = [
      // Wyoming Packages
      {
        name: 'Wyoming Basic',
        state: 'WY',
        price: 990,
        description: 'Essential LLC registration and documents',
        features: [
          'LLC Formation in Wyoming',
          'Business name reservation',
          'Operating agreement template',
          'Filing and processing'
        ],
        is_active: true
      },
      {
        name: 'Wyoming Epic',
        state: 'WY',
        price: 2990,
        description: 'Everything in Basic plus EIN and registered agent',
        features: [
          'LLC Formation in Wyoming',
          'Business name reservation',
          'Operating agreement template',
          'EIN application assistance',
          'Registered agent service (1 year)',
          'Filing and processing'
        ],
        is_active: true
      },
      {
        name: 'Wyoming Ultimate',
        state: 'WY',
        price: 4990,
        description: 'Complete business setup with maximum support and ongoing compliance assistance',
        features: [
          'LLC Formation in Wyoming',
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
        is_active: true
      },
      
      // Colorado Packages
      {
        name: 'Colorado Basic',
        state: 'CO',
        price: 1490,
        description: 'Essential LLC registration and documents',
        features: [
          'LLC Formation in Colorado',
          'Business name reservation',
          'Operating agreement template',
          'Filing and processing'
        ],
        is_active: true
      },
      {
        name: 'Colorado Epic',
        state: 'CO',
        price: 3490,
        description: 'Everything in Basic plus EIN and registered agent',
        features: [
          'LLC Formation in Colorado',
          'Business name reservation',
          'Operating agreement template',
          'EIN application assistance',
          'Registered agent service (1 year)',
          'Filing and processing'
        ],
        is_active: true
      },
      {
        name: 'Colorado Ultimate',
        state: 'CO',
        price: 5490,
        description: 'Complete business setup with maximum support and ongoing compliance assistance',
        features: [
          'LLC Formation in Colorado',
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
        is_active: true
      },
      
      // New Mexico Packages
      {
        name: 'New Mexico Basic',
        state: 'NM',
        price: 890,
        description: 'Essential LLC registration and documents',
        features: [
          'LLC Formation in New Mexico',
          'Business name reservation',
          'Operating agreement template',
          'Filing and processing'
        ],
        is_active: true
      },
      {
        name: 'New Mexico Epic',
        state: 'NM',
        price: 2490,
        description: 'Everything in Basic plus EIN and registered agent',
        features: [
          'LLC Formation in New Mexico',
          'Business name reservation',
          'Operating agreement template',
          'EIN application assistance',
          'Registered agent service (1 year)',
          'Filing and processing'
        ],
        is_active: true
      },
      {
        name: 'New Mexico Ultimate',
        state: 'NM',
        price: 4490,
        description: 'Complete business setup with maximum support and ongoing compliance assistance',
        features: [
          'LLC Formation in New Mexico',
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
        is_active: true
      }
    ];

    const createdIds = [];

    for (const pkg of packages) {
      const docRef = await addDoc(packagesRef, {
        ...pkg,
        created_at: serverTimestamp()
      });
      createdIds.push(docRef.id);
      console.log(`✅ Created ${pkg.name} package (ID: ${docRef.id})`);
    }

    console.log('\n✅ ALL PACKAGES CREATED SUCCESSFULLY!');
    console.log('Package IDs:', createdIds);
    return createdIds;

  } catch (error) {
    console.error('❌ Error creating packages:', error);
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
 *    import { setupPackagesOneTime } from './lib/setup-packages';
 *    await setupPackagesOneTime();
 * 
 * 4. Wait for the success message
 * 5. Go to Firestore console to verify the packages were created
 * 6. Delete this file after running it
 */
