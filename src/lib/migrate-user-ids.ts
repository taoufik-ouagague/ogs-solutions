/**
 * One-time migration script to add user_id to existing documents
 * This should be run once to fix documents that were created before user_id tracking
 */

import { db } from './firebase';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';

export async function migrateUserIds(userId: string): Promise<number> {
  try {
    console.log('Starting migration: Adding user_id to existing documents...');
    console.log('Target user_id:', userId);
    
    const applicationsRef = collection(db, 'llc_applications');
    const snapshot = await getDocs(applicationsRef);
    
    console.log(`Found ${snapshot.size} documents in llc_applications`);
    
    let updated = 0;
    let skipped = 0;
    
    for (const docSnapshot of snapshot.docs) {
      const docData = docSnapshot.data();
      
      // Only update if user_id is missing
      if (!docData.user_id) {
        try {
          console.log(`Updating doc ${docSnapshot.id.substring(0, 8)}... with user_id: ${userId.substring(0, 8)}...`);
          await updateDoc(doc(db, 'llc_applications', docSnapshot.id), {
            user_id: userId,
            updated_at: new Date().toISOString()
          });
          console.log(`✓ Updated doc ${docSnapshot.id.substring(0, 8)}...`);
          updated++;
        } catch (error) {
          console.error(`✗ Failed to update doc ${docSnapshot.id}:`, error);
        }
      } else {
        skipped++;
        console.log(`⊘ Skipped doc ${docSnapshot.id.substring(0, 8)}... (already has user_id)`);
      }
    }
    
    console.log(`✓ Migration complete: Updated ${updated} documents, Skipped ${skipped} documents`);
    return updated;
  } catch (error) {
    console.error('✗ Migration error:', error);
    return 0;
  }
}
