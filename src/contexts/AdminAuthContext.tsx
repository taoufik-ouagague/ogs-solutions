import { createContext, useContext, useEffect, useState } from 'react';
import { signInWithEmailAndPassword, signOut as firebaseSignOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';

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

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    console.log('AdminAuthContext: Setting up admin auth listener');
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('AdminAuthContext: Auth state changed', user ? `User: ${user.email}` : 'No user');
      
      if (user?.email === import.meta.env.VITE_ADMIN_EMAIL) {
        console.log('AdminAuthContext: Admin user verified');
        setIsAdmin(true);
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

      await signInWithEmailAndPassword(auth, email, password);
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
