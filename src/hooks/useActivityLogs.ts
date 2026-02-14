/**
 * Hook to listen to real-time activity logs
 */

import { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase-types';

export interface ActivityLog {
  id: string;
  application_id: string;
  application_name: string;
  user_id: string;
  user_email: string;
  action: 'created' | 'edited' | 'deleted';
  timestamp: string;
  changes?: Record<string, any>;
}

export function useActivityLogs(limitCount: number = 10) {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const activityRef = collection(db, 'activity_logs');
      const q = query(
        activityRef,
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const logs = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          })) as ActivityLog[];
          
          setActivities(logs);
          setLoading(false);
        },
        (err) => {
          console.error('Error listening to activity logs:', err);
          setError(err.message);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (err: any) {
      console.error('Error setting up activity log listener:', err);
      setError(err.message);
      setLoading(false);
    }
  }, [limitCount]);

  return { activities, loading, error };
}
