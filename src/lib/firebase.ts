import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Validate Firebase configuration
if (!firebaseConfig.projectId) {
  console.error('Firebase configuration is incomplete. Please check your environment variables.');
}

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Firestore Database
export const db = getFirestore(app);

// Initialize Cloud Storage
export const storage = getStorage(app);

// Optional: Connect to Firebase Emulator Suite for local development
// Uncomment the following lines if you want to use local emulators
/*
const HOST = 'localhost';
const AUTH_PORT = 9099;
const FIRESTORE_PORT = 8080;
const STORAGE_PORT = 9199;

if (window.location.hostname === 'localhost') {
  // Auth Emulator
  connectAuthEmulator(auth, `http://${HOST}:${AUTH_PORT}`, { disableWarnings: true });
  
  // Firestore Emulator
  connectFirestoreEmulator(db, HOST, FIRESTORE_PORT);
  
  // Storage Emulator
  connectStorageEmulator(storage, HOST, STORAGE_PORT);
}
*/

export default app;
