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

async function cleanupPackages() {
  try {
    console.log('🧹 Starting package cleanup...\n');

    const packagesRef = db.collection('packages');
    const snapshot = await packagesRef.get();

    console.log(`📊 Total packages found: ${snapshot.size}`);
    
    let deletedCount = 0;
    let keptCount = 0;

    // Get all package docs
    const deletePromises = [];
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`\nPackage: ${data.name}`);
      console.log(`  - State field: ${data.state || 'MISSING'}`);
      console.log(`  - Price: ${data.price}`);

      // Delete if it doesn't have a state field (old packages)
      if (!data.state) {
        console.log(`  ❌ DELETING (no state field)`);
        deletePromises.push(doc.ref.delete());
        deletedCount++;
      } else {
        console.log(`  ✅ KEEPING`);
        keptCount++;
      }
    });

    // Execute all deletions
    await Promise.all(deletePromises);

    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`✅ Cleanup complete!`);
    console.log(`  Deleted: ${deletedCount} old packages`);
    console.log(`  Kept: ${keptCount} state-specific packages`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

  } catch (error) {
    console.error('❌ Error cleaning up packages:', error);
    process.exit(1);
  } finally {
    await admin.app().delete();
  }
}

cleanupPackages();
