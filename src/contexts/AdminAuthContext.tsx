import { createContext, useContext, useEffect, useState } from 'react';
import { signInWithEmailAndPassword, signOut as firebaseSignOut, onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

interface AdminAuthContextType {
  isAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Helper function to set admin flag in Firestore
  const setAdminFlag = async (uid: string, isAdminUser: boolean) => {
    try {
      await setDoc(doc(db, 'users', uid), {
        is_admin: isAdminUser,
        updated_at: new Date().toISOString()
      }, { merge: true });
    } catch (error) {
      console.error('Error setting admin flag:', error);
    }
  };

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    console.log('AdminAuthContext: Setting up admin auth listener');
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('AdminAuthContext: Auth state changed', user ? `User: ${user.email}` : 'No user');
      
      if (user && user.email === import.meta.env.VITE_ADMIN_EMAIL) {
        console.log('AdminAuthContext: Admin user verified');
        setIsAdmin(true);
        // Set the is_admin flag in Firestore
        setAdminFlag(user.uid, true);
      } else {
        console.log('AdminAuthContext: Not admin user');
        setIsAdmin(false);
      }
      setLoading(false);
      clearTimeout(timeout);
    }, (error) => {
      console.error('AdminAuthContext: Auth state error', error);
      setLoading(false);
      clearTimeout(timeout);
    });

    // Fallback timeout - if Firebase doesn't respond in 5 seconds, stop loading
    timeout = setTimeout(() => {
      console.warn('Firebase admin auth check timed out after 5 seconds');
      setLoading(false);
    }, 5000);

    return () => {
      unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);

      if (email !== import.meta.env.VITE_ADMIN_EMAIL) {
        return { error: 'Unauthorized access' };
      }

      const userCred = await signInWithEmailAndPassword(auth, email, password);
      // Set the is_admin flag in Firestore
      await setAdminFlag(userCred.user.uid, true);
      setIsAdmin(true);
      return { error: null };
    } catch (error) {
      return { error: 'Invalid credentials' };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setIsAdmin(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <AdminAuthContext.Provider value={{ isAdmin, loading, signIn, signOut }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
}
