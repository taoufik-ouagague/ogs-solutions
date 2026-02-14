/**
 * Activity log for tracking application edits and deletions
 */

import { collection, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase-types';

export interface ActivityLog {
  id?: string;
  application_id: string;
  application_name: string;
  user_id: string;
  user_email: string;
  action: 'created' | 'edited' | 'deleted';
  timestamp: string;
  changes?: Record<string, any>;
}

export async function logActivity(
  applicationId: string,
  applicationName: string,
  userId: string,
  userEmail: string,
  action: 'created' | 'edited' | 'deleted',
  changes?: Record<string, any>
): Promise<string | null> {
  try {
    const activityRef = collection(db, 'activity_logs');
    const docRef = await addDoc(activityRef, {
      application_id: applicationId,
      application_name: applicationName,
      user_id: userId,
      user_email: userEmail,
      action,
      timestamp: new Date().toISOString(),
      changes: changes || null,
    });

    console.log(`Activity logged: ${action} - ${applicationName}`, docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error logging activity:', error);
    return null;
  }
}
