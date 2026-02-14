import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Firestore
export const db = getFirestore(app);

// Type definitions for Firestore collections
export type Profile = {
  id: string;
  full_name: string;
  phone: string | null;
  created_at: string;
  updated_at: string;
};

export type Package = {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  is_active: boolean;
  created_at: string;
  state?: string; // State code for state-specific packages (e.g., "WY", "CO", "NM")
  state_pricing?: {
    [state: string]: number; // State code to price mapping (e.g., "WY": 299, "CO": 499)
  };
};

export type LLCApplication = {
  id: string;
  user_id: string;
  package_id: string;
  state: string;
  company_name: string;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  form_data: Record<string, unknown>;
  payment_status: 'pending' | 'completed' | 'failed';
  payment_id: string | null;
  created_at: string;
  updated_at: string;
};

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'responded';
  created_at: string;
};

export type Payment = {
  id: string;
  application_id: string;
  user_id: string;
  amount: number;
  currency: string;
  method: 'bank' | 'crypto' | 'cashplus';
  status: 'pending' | 'completed' | 'failed' | 'verified';
  payment_reference: string;
  verified_at?: string;
  created_at: string;
  updated_at: string;
};
