import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Initialize Firebase Admin
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

if (!serviceAccountPath) {
  console.error('❌ FIREBASE_SERVICE_ACCOUNT_PATH environment variable not set');
  process.exit(1);
}

const serviceAccountJson = readFileSync(resolve(serviceAccountPath), 'utf8');
const serviceAccount = JSON.parse(serviceAccountJson);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function addPackages() {
  try {
    console.log('🚀 Starting package setup...');

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

    const packagesRef = db.collection('packages');
    const createdIds = [];

    for (const pkg of packages) {
      const docRef = await packagesRef.add({
        ...pkg,
        created_at: admin.firestore.FieldValue.serverTimestamp(),
        updated_at: admin.firestore.FieldValue.serverTimestamp()
      });
      createdIds.push(docRef.id);
      console.log(`✅ Created ${pkg.name} (ID: ${docRef.id})`);
    }

    console.log('\n✅ ALL PACKAGES CREATED SUCCESSFULLY!');
    console.log('Package IDs:', createdIds);
    console.log('\nCreated packages:');
    console.log('- Wyoming: Basic, Epic, Ultimate');
    console.log('- Colorado: Basic, Epic, Ultimate');
    console.log('- New Mexico: Basic, Epic, Ultimate');

  } catch (error) {
    console.error('❌ Error creating packages:', error);
    process.exit(1);
  } finally {
    await admin.app().delete();
  }
}

addPackages();
